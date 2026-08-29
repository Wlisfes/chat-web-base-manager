# Base Manager 云端部署与故障恢复手册

## 当前基线

| 项目 | 值 |
| --- | --- |
| 生产地址 | `https://chat.lisfes.cn` |
| 云服务器 | `47.119.21.228` |
| 容器 | `chat-web-cloud-nginx` |
| Compose 项目 | `chat-web-cloud` |
| 部署目录 | `/opt/chat-web-cloud` |
| Manager Compose 文件 | `/opt/chat-web-cloud/manager-compose.yml` |
| 云端 Nginx 配置 | `/opt/chat-web-cloud/nginx.conf` |
| TLS 目录 | `/etc/letsencrypt/live/chat.lisfes.cn` |
| API 上游 | WireGuard 本机 Gateway `10.66.0.2:80` |
| 基础设施网络 | `chat-web-cloud` |

开发机上的 `chat-web-base-manager` 容器、`chat-web-base-manager-tls` Volume、`chat.lisfes.com` 本地域名和旧的本机 HTTPS 入口均已废弃。云端 Nginx 同时承载 Manager 静态资源、`/api/*` Gateway 代理和 MySQL、Redis、RabbitMQ、Kafka、Nacos 的 TCP 入口；发布 Manager 时必须保留这些端口映射。

## 云端初始化

云端基础设施目录 `/opt/chat-web-cloud` 由基础设施 Compose 管理，至少应存在：

```bash
test -s /opt/chat-web-cloud/nginx.conf
test -s /etc/letsencrypt/live/chat.lisfes.cn/fullchain.pem
test -s /etc/letsencrypt/live/chat.lisfes.cn/privkey.pem
docker network inspect chat-web-cloud
docker inspect chat-web-cloud-nacos --format '{{.State.Health.Status}}'
```

证书由 Certbot 维护并自动续期。续期后需要让云端 Nginx 重新加载证书：

```bash
docker exec chat-web-cloud-nginx nginx -t
docker exec chat-web-cloud-nginx nginx -s reload
```

不要把证书私钥、WireGuard 私钥、Nacos 密钥或云端 `.env` 复制到仓库、日志或聊天中。

## 流水线配置

`.github/workflows/deploy.yml` 在 `main` 分支构建一次完整 Git SHA 镜像，并通过 SSH 部署云端。GitHub 仓库的 `production-cloud` Environment 需要配置：

| 类型 | 名称 | 说明 |
| --- | --- | --- |
| Secret | `CLOUD_SSH_PRIVATE_KEY` | 云端部署专用 SSH 私钥 |
| Secret | `CLOUD_KNOWN_HOSTS` | `47.119.21.228` 的完整主机指纹行 |
| Variable | `CLOUD_HOST` | 默认 `47.119.21.228` |
| Variable | `CLOUD_USER` | 默认 `root`，建议使用仅可管理 Docker 的部署用户 |
| Variable | `CLOUD_DEPLOY_PATH` | 默认 `/opt/chat-web-cloud` |

部署用户必须能访问 Docker daemon、写入部署目录，并能读取云端证书目录。流水线不会在开发机创建或启动 Manager 容器。

## 手工部署与验证

在云服务器执行：

```bash
cd /opt/chat-web-cloud
install -m 0644 /path/to/compose.yml manager-compose.yml
install -m 0755 /path/to/deploy.sh deploy.sh
./deploy.sh ghcr.io/wlisfes/chat-web-base-manager:<git-sha> manager-compose.yml
```

检查容器、日志驱动和公开入口：

```bash
docker inspect chat-web-cloud-nginx --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}'
docker inspect chat-web-cloud-nginx --format '{{json .HostConfig.LogConfig}}'
docker logs --tail 200 chat-web-cloud-nginx
curl --silent --show-error --fail --insecure --resolve chat.lisfes.cn:443:127.0.0.1 https://chat.lisfes.cn/health
curl --silent --show-error --fail --insecure --resolve chat.lisfes.cn:443:127.0.0.1 https://chat.lisfes.cn/api/health
```

预期 `/health` 返回 `healthy`，`/api/health` 返回 Gateway 的正常响应。Manager 容器日志使用 `json-file`，单文件最大 `20m`、保留 `30` 个文件。

## 常见故障

| 现象 | 排查 |
| --- | --- |
| `chat.lisfes.cn` 无法访问 | 检查 DNS、云安全组 80/443、证书路径和 `docker ps` |
| 页面正常、API 502 | 检查 WireGuard `10.66.0.2` 连通性、本机 Gateway 和云端 Nginx `/api/` 配置 |
| Nginx 启动失败 | 执行 `docker exec chat-web-cloud-nginx nginx -t`，确认云端配置中的证书与上游地址有效 |
| 基础设施域名异常 | 确认 Manager Compose 仍保留 3306、6379、5672、9092、15672、8848、9848 端口映射 |
| 部署一直等待 | 检查 `production-cloud` 的 SSH Secret、主机指纹和 Docker 权限 |

## 回滚

脚本在新容器健康检查或外部入口检查失败时自动恢复旧镜像。手工回滚：

```bash
cd /opt/chat-web-cloud
IMAGE='ghcr.io/wlisfes/chat-web-base-manager:<previous-sha>' docker compose -p chat-web-cloud -f manager-compose.yml up -d --no-deps web
docker inspect chat-web-cloud-nginx --format '{{.State.Health.Status}}'
```

只回滚 Manager 镜像，不停止 `chat-web-cloud-nacos`，也不删除云端证书、WireGuard、Nacos 数据卷或基础设施配置。
