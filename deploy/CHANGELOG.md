# 部署变更记录

## 2026-08-18 Home 共享 HTTPS 入口部署

- 影响机器：Home 当前 Docker Desktop 主机；Company 已有部署不变。
- 关联版本：`5b3c30a6cbf67fbc7702a64519a675195f9074ee`，GHCR 镜像摘要 `sha256:a733f222dcb6aad998e5332ac69b0a9198d9193f1cf82831278c74cc3481f937`。
- 变更内容：将 `chat-web-base-manager` 部署到 Compose 项目 `chat-web-service` 和共享网络 `chat-web-infrastructure`。由于 Home 的 `80/443` 已由 `chat-web-nginx` 占用，Manager 仅额外绑定 `127.0.0.1:8443`，共享入口使用 `deploy/shared-ingress.conf` 在 Docker 网络内反向代理到 Manager 的 `8443`；Windows hosts 继续使用 `127.0.0.1 chat.lisfes.com`，HTTPS 继续使用该机器现有且受信任的本地证书。
- 机器侧操作：创建 `chat-web-base-manager-tls` Volume，并在机器内部从共享入口的证书 Volume 同步证书和私钥；以 `HTTPS_PORT=8443` 启动 Manager；将共享入口的 `default.conf` 更新为本次配置并重载 Nginx。私钥没有写入仓库或命令输出。

### 验证

```powershell
docker inspect chat-web-base-manager --format "{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}"
docker inspect chat-web-base-manager --format "{{index .Config.Labels `"com.docker.compose.project`"}}"
docker exec chat-web-nginx nginx -t
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/account/health
```

预期镜像为上述完整 SHA，Compose 项目为 `chat-web-service`，容器为 `running healthy`，Nginx 配置检查成功，两个 HTTPS 健康检查均返回 HTTP 200。

### 回滚

- 恢复共享 Nginx 原 `default.conf` 后执行 `docker exec chat-web-nginx nginx -s reload`，流量即回到原上游。
- 在 Manager 部署目录执行 `docker compose -p chat-web-service -f compose.yml down`；如 Compose 项目中还有其他业务服务，只执行 `docker rm -f chat-web-base-manager`，不要对整个项目执行 `down`。
- 保留 `chat-web-base-manager-tls` Volume 便于再次部署；确认不再使用后才可删除。Company 容器和配置无需操作。

## 2026-08-18 Company/Home 双机部署

- 影响机器：Company 与 Home 两台独立 Docker 主机，以及各自的 Manager 仓库 Self-hosted Runner。
- 关联版本：本次变更合并后的完整 Git SHA 镜像；两台机器部署相同版本。
- 变更内容：将原先只绑定 `chat-server-company` 的单机部署改为 Company/Home 双机矩阵。镜像仍只构建和发布一次，Company 使用 `production-company` 与 `deploy-company`，Home 使用 `production-home` 与 `deploy-home`；矩阵关闭 fail-fast，使在线机器不受另一台离线或失败影响。补充双机 Runner、本地 TLS、部署验证与故障恢复基线。
- 机器侧操作：在 Home 机器为本仓库安装并启动带 `chat-server-home` 标签的 Self-hosted Runner，确保 Runner 用户可访问 Docker 并可写 `/opt/chat-web-base-manager`；在 Company 和 Home 各执行一次 `deploy/bootstrap-local-https.ps1`，分别生成和信任机器本地证书。GitHub 仓库中保留 `production-company` 和 `production-home` 两个 Environment；如使用默认部署目录，无需设置 `DEPLOY_PATH`。

### 验证

```bash
actionlint
docker compose -f deploy/compose.yml config --quiet
sh -n deploy/deploy.sh
```

合并到 `main` 后，在 Actions 中确认同一次构建产生 `Deploy to company host` 与 `Deploy to home host` 两个任务，二者的 `IMAGE` 均为 `ghcr.io/wlisfes/chat-web-base-manager:<同一提交SHA>`。在两台机器分别执行：

```bash
docker inspect chat-web-base-manager --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}'
curl --silent --show-error --fail --insecure --resolve chat.lisfes.com:443:127.0.0.1 https://chat.lisfes.com/health
```

预期容器镜像 SHA 一致、状态为 `running healthy`，健康接口输出 `healthy`。

### 回滚

工作流变更回滚为上一版单机配置不会删除 Home 上已经运行的容器。应用版本回滚时，在 Company 和 Home 各自的 `/opt/chat-web-base-manager` 将 `IMAGE` 指向同一个上一提交 SHA，然后执行 `docker compose -f compose.yml up -d --no-deps base-manager` 并重新检查健康状态。若只需暂停某台部署，停止该机器的本仓库 Runner 服务；不得删除另一台机器的运行实例。

## 2026-08-18 本地 HTTPS 与自动部署

- 影响机器：Company 自托管 Runner 所在的本机；Windows 浏览器和对应 WSL Docker 主机。
- 关联版本：`chat-web-base-manager` 首个容器化部署版本；镜像按 Git 提交 SHA 固定。
- 变更内容：新增锁定依赖的多阶段前端镜像，镜像安装层使用 BuildKit 缓存和最多三次退避重试；新增 Nginx SPA 服务、同源 `/api/*` Gateway 反向代理、`chat-web-service` Compose 服务、GitHub Actions 构建部署、容器及 HTTPS 健康检查、失败回滚。本地站点固定为 `https://chat.lisfes.com`，宿主机只监听 `127.0.0.1:443`，不对外网暴露。考虑 Docker Desktop 无法直接绑定 WSL `/opt` 路径，部署脚本会把已验证证书通过标准输入同步到专用 `chat-web-base-manager-tls` Docker Volume，站点容器只读挂载。
- 机器侧操作：由 `deploy/bootstrap-local-https.ps1` 在 Windows hosts 中加入 `127.0.0.1 chat.lisfes.com`，在 WSL 部署目录生成仅供本机使用的证书和私钥，并将证书加入 Windows 当前用户受信任根证书库。私钥权限为 `0600`，只同步到机器侧专用 Docker Volume，不进入仓库、镜像或 Actions 日志。

### 验证

```powershell
yarn build
docker buildx build --check .
$env:IMAGE = 'chat-web-base-manager:check'
docker compose -f deploy/compose.yml config --quiet
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/account/health
```

预期两个 HTTPS 请求均返回 HTTP 200；站点容器和 Gateway 容器均为 `healthy`，`/api/account/auth/me` 未登录时传输状态为 200、响应体业务 `code` 为 401。

### 回滚

部署脚本自动恢复上一镜像。手工回滚时在 `/opt/chat-web-base-manager` 把 `IMAGE` 指向上一提交镜像后执行 `docker compose up -d --no-deps base-manager`。若需完全撤销本地域名，停止并删除 `chat-web-base-manager` 容器，再移除 Windows hosts 对应行和当前用户证书库中由本脚本安装的 `chat.lisfes.com` 证书；删除前先按证书主题和指纹核对目标，禁止输出或复制私钥。
