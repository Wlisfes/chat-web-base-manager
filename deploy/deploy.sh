#!/bin/sh
set -eu

IMAGE=${1:?Usage: deploy.sh IMAGE [COMPOSE_FILE]}
COMPOSE_FILE=${2:-compose.yml}
SERVICE=base-manager
CONTAINER=chat-web-base-manager
DOMAIN=chat.lisfes.com
CERT_FILE=certs/chat.lisfes.com.crt
KEY_FILE=certs/chat.lisfes.com.key
TLS_VOLUME=chat-web-base-manager-tls
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-120}
PULL_ATTEMPTS=${PULL_ATTEMPTS:-8}
deployment_started=0

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Compose file not found: $COMPOSE_FILE" >&2
    exit 1
fi

if [ ! -f .env ]; then
    echo "Missing $(pwd)/.env; create it from deploy/.env.example before the first deployment." >&2
    exit 1
fi

if [ ! -s "$CERT_FILE" ] || [ ! -s "$KEY_FILE" ]; then
    echo "Missing the machine-local HTTPS certificate or private key under $(pwd)/certs." >&2
    exit 1
fi

if ! openssl x509 -checkend 86400 -noout -in "$CERT_FILE" >/dev/null 2>&1; then
    echo "The local HTTPS certificate is invalid or expires within 24 hours." >&2
    exit 1
fi

if ! openssl x509 -in "$CERT_FILE" -noout -text | grep -F "DNS:$DOMAIN" >/dev/null 2>&1; then
    echo "The local HTTPS certificate does not contain the required DNS SAN." >&2
    exit 1
fi

certificate_public_key=$(openssl x509 -pubkey -noout -in "$CERT_FILE" | openssl pkey -pubin -outform DER 2>/dev/null | sha256sum | awk '{print $1}')
private_public_key=$(openssl pkey -in "$KEY_FILE" -pubout -outform DER 2>/dev/null | sha256sum | awk '{print $1}')
if [ -z "$certificate_public_key" ] || [ "$certificate_public_key" != "$private_public_key" ]; then
    echo "The local HTTPS certificate and private key do not match." >&2
    exit 1
fi
unset certificate_public_key private_public_key

network=$(sed -n 's/^DOCKER_NETWORK=//p' .env | tail -n 1 | tr -d '\r')
network=${network:-chat-web-infrastructure}
https_port=$(sed -n 's/^HTTPS_PORT=//p' .env | tail -n 1 | tr -d '\r')
https_port=${https_port:-443}

case "$network" in
    *[!A-Za-z0-9_.-]*|'')
        echo "Invalid DOCKER_NETWORK in .env" >&2
        exit 1
        ;;
esac

case "$https_port" in
    *[!0-9]*|'')
        echo "Invalid HTTPS_PORT in .env" >&2
        exit 1
        ;;
esac

if ! docker network inspect "$network" >/dev/null 2>&1; then
    echo "Required Docker network is unavailable." >&2
    exit 1
fi

gateway_state=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' chat-web-gateway-service 2>/dev/null || true)
if [ "$gateway_state" != "healthy" ]; then
    echo "Gateway must be healthy before deploying the manager site." >&2
    exit 1
fi

old_image=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)

compose() {
    IMAGE="$IMAGE" docker compose -f "$COMPOSE_FILE" "$@"
}

rollback() {
    echo "Deployment failed; showing the latest container logs." >&2
    docker logs --tail 100 "$CONTAINER" 2>&1 || true

    if [ -n "$old_image" ] && [ "$old_image" != "$IMAGE" ]; then
        echo "Rolling back to $old_image" >&2
        IMAGE="$old_image" docker compose -f "$COMPOSE_FILE" up -d --no-deps "$SERVICE"
    else
        echo "No previous image is available for rollback." >&2
    fi
}

# shellcheck disable=SC2329 # Invoked indirectly by trap.
handle_interrupt() {
    trap - HUP INT TERM
    echo "Deployment interrupted by a newer version." >&2
    if [ "$deployment_started" -eq 1 ]; then
        rollback
    fi
    exit 130
}

trap handle_interrupt HUP INT TERM

pull_image() {
    attempt=1
    while ! docker pull "$IMAGE"; do
        if [ "$attempt" -ge "$PULL_ATTEMPTS" ]; then
            echo "Failed to pull $IMAGE after $PULL_ATTEMPTS attempts." >&2
            return 1
        fi

        delay=$((attempt * 5))
        echo "Image pull attempt $attempt failed; retrying in ${delay}s." >&2
        sleep "$delay"
        attempt=$((attempt + 1))
    done
}

echo "Pulling $IMAGE (up to $PULL_ATTEMPTS attempts)"
pull_image

docker volume create "$TLS_VOLUME" >/dev/null
if ! tar -C certs -cf - "$(basename "$CERT_FILE")" "$(basename "$KEY_FILE")" |
    docker run --rm -i \
        -v "$TLS_VOLUME:/tls" \
        --entrypoint sh \
        "$IMAGE" \
        -c 'set -eu
            tar -xf - -C /tls
            mv -f /tls/chat.lisfes.com.crt /tls/tls.crt
            mv -f /tls/chat.lisfes.com.key /tls/tls.key
            chmod 0644 /tls/tls.crt
            chmod 0600 /tls/tls.key'; then
    echo "Failed to synchronize the machine-local HTTPS certificate into its Docker volume." >&2
    exit 1
fi

echo "Starting $SERVICE"
deployment_started=1
if ! compose up -d --no-deps "$SERVICE"; then
    rollback
    exit 1
fi

elapsed=0
while [ "$elapsed" -lt "$HEALTH_TIMEOUT" ]; do
    state=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CONTAINER" 2>/dev/null || true)
    case "$state" in
        healthy)
            break
            ;;
        exited|dead|unhealthy)
            echo "Container state: $state" >&2
            rollback
            exit 1
            ;;
    esac

    sleep 5
    elapsed=$((elapsed + 5))
done

if [ "${state:-}" != "healthy" ]; then
    echo "Health check timed out after ${HEALTH_TIMEOUT}s." >&2
    rollback
    exit 1
fi

served_certificate=$(mktemp)
trap 'rm -f "$served_certificate"' EXIT
if ! openssl s_client -connect "127.0.0.1:$https_port" -servername "$DOMAIN" -showcerts </dev/null 2>/dev/null |
    openssl x509 -outform PEM > "$served_certificate"; then
    echo "Unable to read the HTTPS certificate served by the manager site." >&2
    rollback
    exit 1
fi

expected_fingerprint=$(openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha256)
served_fingerprint=$(openssl x509 -in "$served_certificate" -noout -fingerprint -sha256)
if [ "$served_fingerprint" != "$expected_fingerprint" ]; then
    echo "The manager site is not serving the configured local certificate." >&2
    rollback
    exit 1
fi
unset expected_fingerprint served_fingerprint

if ! curl --silent --show-error --fail --insecure \
    --resolve "$DOMAIN:$https_port:127.0.0.1" \
    "https://$DOMAIN:$https_port/health" | grep -qx healthy; then
    echo "The manager HTTPS endpoint did not pass its health check." >&2
    rollback
    exit 1
fi

rm -f "$served_certificate"
trap - EXIT HUP INT TERM
echo "Deployment succeeded: $IMAGE"
docker image prune -f >/dev/null 2>&1 || true
