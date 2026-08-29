FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    set -eu; \
    attempt=1; \
    until yarn install --frozen-lockfile --ignore-scripts --registry https://registry.npmjs.org --network-timeout 30000; do \
        if [ "$attempt" -ge 3 ]; then \
            exit 1; \
        fi; \
        delay=$((attempt * 5)); \
        echo "Dependency install attempt $attempt failed; retrying in ${delay}s." >&2; \
        sleep "$delay"; \
        attempt=$((attempt + 1)); \
    done

COPY . .
RUN yarn build

FROM nginx:1.28-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8443

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=6 \
    CMD wget --no-check-certificate --header='Host: chat.lisfes.cn' -qO- https://127.0.0.1:8443/health | grep -qx healthy
