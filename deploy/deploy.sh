#!/bin/sh
set -eu

IMAGE=${1:?用法：deploy.sh IMAGE [COMPOSE_FILE]}
COMPOSE_FILE=${2:-compose.yml}
SERVICE=web
CONTAINER=chat-web-cloud-nginx
DOMAIN=chat.lisfes.cn
API_DOMAIN=chat-web.lisfes.cn
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-120}
PULL_ATTEMPTS=${PULL_ATTEMPTS:-8}
COMPOSE_PROJECT=${COMPOSE_PROJECT:-chat-web-cloud}
deployment_started=0

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "找不到 Compose 文件：$COMPOSE_FILE" >&2
    exit 1
fi

command -v docker >/dev/null || { echo '未找到 Docker。' >&2; exit 1; }
command -v curl >/dev/null || { echo '未找到 curl。' >&2; exit 1; }
command -v openssl >/dev/null || { echo '未找到 openssl。' >&2; exit 1; }

read_env_value() {
    key=$1
    if [ -f .env ]; then
        sed -n "s/^${key}=//p" .env | tail -n 1 | tr -d '\r'
    fi
}

env_letsencrypt_path=$(read_env_value LETSENCRYPT_PATH)
env_nginx_config_path=$(read_env_value NGINX_CONFIG_PATH)
certificate_directory=${LETSENCRYPT_PATH:-${env_letsencrypt_path:-/etc/letsencrypt}}
certificate_file="$certificate_directory/live/$DOMAIN/fullchain.pem"
private_key_file="$certificate_directory/live/$DOMAIN/privkey.pem"
nginx_config=${NGINX_CONFIG_PATH:-${env_nginx_config_path:-$(dirname "$COMPOSE_FILE")/nginx.conf}}
unset env_letsencrypt_path env_nginx_config_path

if [ ! -s "$nginx_config" ]; then
    echo "找不到云端 Nginx 配置：$nginx_config" >&2
    exit 1
fi

if [ ! -s "$certificate_file" ] || [ ! -s "$private_key_file" ]; then
    echo "找不到云端 HTTPS 证书或私钥：$certificate_directory/live/$DOMAIN/" >&2
    exit 1
fi

if ! openssl x509 -checkend 86400 -noout -in "$certificate_file" >/dev/null 2>&1; then
    echo '云端 HTTPS 证书无效或将在 24 小时内过期。' >&2
    exit 1
fi

if ! openssl x509 -in "$certificate_file" -noout -text | grep -F "DNS:$DOMAIN" >/dev/null 2>&1; then
    echo "云端 HTTPS 证书不包含 DNS SAN：$DOMAIN" >&2
    exit 1
fi

compose() {
    IMAGE="$IMAGE" docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" "$@"
}

if ! compose config --quiet; then
    echo '云端 Compose 配置校验失败。' >&2
    exit 1
fi

old_image=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)

rollback() {
    echo '云端部署失败，输出最新容器日志。' >&2
    docker logs --tail 100 "$CONTAINER" 2>&1 || true

    if [ -n "$old_image" ] && [ "$old_image" != "$IMAGE" ]; then
        echo "回滚到 $old_image" >&2
        IMAGE="$old_image" docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" up -d --no-deps "$SERVICE" || true
    else
        echo '没有可用的上一版本镜像，跳过回滚。' >&2
    fi
}

handle_interrupt() {
    trap - HUP INT TERM
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
            echo "镜像拉取失败：$IMAGE（已重试 $PULL_ATTEMPTS 次）" >&2
            return 1
        fi

        delay=$((attempt * 5))
        echo "镜像拉取第 $attempt 次失败，${delay} 秒后重试。" >&2
        sleep "$delay"
        attempt=$((attempt + 1))
    done
}

echo "拉取云端镜像：$IMAGE"
pull_image

echo "启动云端 $SERVICE"
deployment_started=1
if ! compose up -d --no-deps "$SERVICE"; then
    rollback
    exit 1
fi

elapsed=0
state='starting'
while [ "$elapsed" -lt "$HEALTH_TIMEOUT" ]; do
    state=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CONTAINER" 2>/dev/null || true)
    case "$state" in
        healthy)
            break
            ;;
        exited|dead|unhealthy)
            echo "容器状态：$state" >&2
            rollback
            exit 1
            ;;
    esac

    sleep 5
    elapsed=$((elapsed + 5))
done

if [ "$state" != 'healthy' ]; then
    echo "云端健康检查在 ${HEALTH_TIMEOUT} 秒内未通过。" >&2
    rollback
    exit 1
fi

if ! curl --silent --show-error --fail --insecure \
    --resolve "$DOMAIN:443:127.0.0.1" \
    "https://$DOMAIN/health" | grep -qx healthy; then
    echo '云端 HTTPS 健康检查失败。' >&2
    rollback
    exit 1
fi

if ! curl --silent --show-error --fail --insecure \
    --resolve "$API_DOMAIN:443:127.0.0.1" \
    "https://$API_DOMAIN/health" >/dev/null; then
    echo '云端 Gateway API 健康检查失败。' >&2
    rollback
    exit 1
fi

trap - HUP INT TERM
echo "云端部署成功：$IMAGE"
docker image prune -f >/dev/null 2>&1 || true
