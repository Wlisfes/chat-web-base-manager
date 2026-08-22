# 部署变更记录

## 2026-08-22 Account 服务前缀与 Consumer 归属修正

- 影响机器：Company、Home；需与 Gateway、Account 同一发布窗口部署。
- 关联版本：本次 Manager、Gateway、Account 联动发布的完整 Git SHA。
- 变更内容：全部 Account 请求恢复 `/api/account/**` 服务名称前缀；外部客户请求统一为 `/api/account/consumer/**`。新增 Account Consumer API 文件并使用单数 `consumer` 命名，删除 Finance 下错误的 `client.service.ts` Consumer 实现；CRM 自有 `/api/windows/crm/client/**` 接口保持不变。
- 机器侧操作：无需修改域名、TLS、`.env`、端口、Runner、部署目录或 Docker 网络；先部署 Gateway 和 Account，再发布 Manager。
- 验证命令：执行 `yarn build`；部署后验证登录、续期、权限、账号管理和 `/api/account/consumer/column`，并确认浏览器不再请求 `/api/consumers/**` 或 Account 根前缀 `/api/auth/**`。
- 回滚方法：同时回滚 Manager 和 Gateway 到上一组健康镜像；不回滚数据库、证书或其他业务数据。

## 2026-08-22 GitHub Actions Node.js 24 运行时升级

- 影响范围：GitHub 托管构建任务，以及 Company、Home 两台自托管部署 Runner。
- 变更内容：将 `actions/checkout` 升级到 v7，将 Docker Buildx、GHCR 登录和镜像构建 Action 分别升级到支持 Node.js 24 的 v4、v4、v7，消除 Node.js 20 弃用告警。
- Runner 要求：Company、Home 自托管 Runner 必须保持自动更新，并至少支持 Node.js 24 Action 运行时；Runner 离线时部署任务仍会排队，不影响镜像构建结果。
- 验证命令：执行 `yarn build`、`docker buildx build --check .`、`docker compose -f deploy/compose.yml config --quiet` 和 `sh -n deploy/deploy.sh`；合并后确认构建任务不再产生 Node.js 20 弃用告警。
- 回滚方法：将四个 Action 恢复为 `actions/checkout@v4`、`docker/setup-buildx-action@v3`、`docker/login-action@v3` 和 `docker/build-push-action@v6`；应用镜像和运行容器无需回滚。

## 2026-08-22 客户接口迁入 Account

- 影响机器：Company、Home；与 Account、Finance 同版本窗口联动发布。
- 关联版本：本次 Manager、Account、Finance 联动发布的完整 Git SHA。
- 变更内容：财务账户和 CRM 客户列表的新增、编辑、分页及状态请求统一改为 Account `/api/account/consumer/**`；品牌和币种选项仍从 `/api/finance/**` 获取，列表按 `brandId` 在前端补全品牌名称。
- 机器侧操作：无需修改域名、TLS、`.env`、端口、Runner、部署目录或 Docker 网络；必须先部署 Account Consumer 表与接口，再发布本 Manager 镜像。
- 验证命令：执行 `yarn build`；部署后登录管理端，验证财务账户客户列表及 CRM 客户列表不再请求 `/api/finance/client/**`，新增、查询和状态切换均成功。
- 回滚方法：将 Manager 恢复到上一条健康 SHA；若后端已经停止旧 Finance Client 接口，回滚 Manager 前必须先恢复兼容接口，否则旧页面客户功能不可用。

## 2026-08-18 公网 API 路径精简

- 影响机器：Company、Home；与 Gateway 同版本窗口联动发布。
- 关联版本：本次 Manager 与 Gateway 联动发布的完整 Git SHA。
- 变更内容：Account 请求由 `/api/account/**` 改为 `/api/**`，Finance 请求由 `/api/windows/finance/**` 改为 `/api/finance/**`；刷新 Token、登录态判断、验证码及全部账号和财务管理接口同步迁移。
- 部署可靠性：两台 Runner 访问 GHCR 多次出现 EOF，镜像拉取默认重试由 3 次提高到 8 次，仍保持递增退避且失败后自动保留旧容器。
- 机器侧操作：先发布支持 `/api` 根前缀的 Gateway 并切换 Nacos 路由，再发布 Manager；两台机器继续使用相同域名、TLS、Compose 项目和 Docker 网络。

### 验证

```powershell
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/finance/health
$response = Invoke-WebRequest -UseBasicParsing -SkipHttpErrorCheck https://chat.lisfes.com/api/auth/me
($response.Content | ConvertFrom-Json).code
```

预期两个健康检查业务 `code=200`，未登录 Account 接口业务 `code=401`，页面不再请求 `/api/account/**` 或 `/api/windows/finance/**`。

### 回滚

- 先将 Nacos 路由恢复为旧前缀，再回滚 Manager 和 Gateway 到上一组已验证镜像。
- 域名、证书、数据库和后端容器均不变化，无需回滚数据。

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
