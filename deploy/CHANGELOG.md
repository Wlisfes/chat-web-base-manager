# 部署变更记录

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
