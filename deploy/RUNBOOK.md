# Base Manager 部署与故障恢复手册

## Grafana 入口

统一入口为 `https://chat.lisfes.com/observability/`，上游是同一 `chat-web-infrastructure` 网络中的 `chat-web-grafana:3000`。`/observability` 必须返回 308 到带末尾斜杠的路径，Grafana 的静态资源、API 和 WebSocket 均保留 `/observability/` 子路径。

```powershell
Invoke-WebRequest -UseBasicParsing -MaximumRedirection 0 -SkipHttpErrorCheck https://chat.lisfes.com/observability
Invoke-WebRequest -UseBasicParsing -SkipHttpErrorCheck https://chat.lisfes.com/observability/api/health
docker exec chat-web-base-manager nginx -t
```

若返回 502，先检查 `chat-web-grafana` 是否运行且加入 `chat-web-infrastructure`；不要把 Grafana 3000 或其他观测组件端口直接暴露到公网。


## 当前基线

| 项目 | 值 |
| --- | --- |
| 访问地址 | `https://chat.lisfes.com` |
| 本地域名解析 | `127.0.0.1 chat.lisfes.com` |
| 容器 | `chat-web-base-manager` |
| Compose 项目 | `chat-web-service` |
| 宿主机端口 | `127.0.0.1:443` |
| 容器端口 | `8443` |
| 部署目录 | `/opt/chat-web-base-manager` |
| Docker 网络 | `chat-web-infrastructure` |
| API 上游 | `chat-web-gateway-service:3999` |
| TLS Docker Volume | `chat-web-base-manager-tls` |
| Runner 标签 | Company：`chat-server-company`；Home：`chat-server-home` |
| GitHub Environments | Company：`production-company`；Home：`production-home` |

Home 当前机器的 `443` 已由共享 `chat-web-nginx` 占用，因此 Manager 使用
`127.0.0.1:8443 -> 8443`，共享入口加载 `deploy/shared-ingress.conf` 后通过
`chat-web-infrastructure` 转发到 `chat-web-base-manager:8443`。该兼容模式不改变
Compose 项目名、容器内端口、域名或 API 上游；Company 若没有共享入口，继续使用
默认的 `127.0.0.1:443 -> 8443`。

该服务同时部署到 Company 和 Home。流水线只构建一次镜像，并把同一个完整 Git SHA 部署到两台机器；两个部署任务使用独立并发组，任一机器离线时不会阻塞另一台，离线机器的任务会等待对应 Runner 恢复。

该域名仅供每台机器本机访问，不依赖公共 DNS，也不对外网监听。每台机器的浏览器分别通过 Windows hosts 解析到自己的回环地址；本地证书只加入对应机器的 Windows 当前用户信任库。证书私钥固定保存在各机器 `/opt/chat-web-base-manager/certs/chat.lisfes.com.key`，权限必须为 `0600`。部署脚本验证证书后通过标准输入同步到该机器的专用 Docker Volume，解决 Docker Desktop 无法直接绑定 WSL `/opt` 路径的问题；站点容器对该卷只读挂载。

## 首次机器初始化

Company 和 Home 两台机器都要从管理员 PowerShell 各执行一次：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
./deploy/bootstrap-local-https.ps1
```

脚本可重复执行；有效证书存在时不会覆盖。初始化后确认：

```powershell
Select-String -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Pattern 'chat\.lisfes\.com'
Get-ChildItem Cert:\CurrentUser\Root | Where-Object Subject -EQ 'CN=chat.lisfes.com'
wsl -d Ubuntu-22.04 -u root -- sh -lc "stat -c '%a %n' /opt/chat-web-base-manager/certs/chat.lisfes.com.*"
```

每个机器还必须为 Manager 仓库安装一个独立 Self-hosted Runner，并分别添加 `chat-server-company` 或 `chat-server-home` 标签。Runner 服务账户需要能写入 `/opt/chat-web-base-manager`，并能访问该机器的 Docker daemon。仓库的 `production-company` 与 `production-home` Environment 可分别覆盖 `DEPLOY_PATH`；不设置时都使用 `/opt/chat-web-base-manager`。

## 部署验证

```powershell
docker inspect chat-web-base-manager --format "{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}"
docker inspect chat-web-base-manager --format "{{json .HostConfig.LogConfig}}"
docker logs --tail 200 chat-web-base-manager
docker inspect chat-web-gateway-service --format "{{.State.Health.Status}}"
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/account/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/finance/health
$response = Invoke-WebRequest -UseBasicParsing -SkipHttpErrorCheck https://chat.lisfes.com/api/account/auth/token/resolver
$response.StatusCode
($response.Content | ConvertFrom-Json).code
```

Manager 的 Nginx access/error 日志写入标准输出和标准错误；Docker 日志配置预期为 `json-file`、`max-size=20m`、`max-file=30`。

最后一组预期分别为 HTTP `200` 和业务 `401`。前端所有 `/api/*` 请求保持原路径转发到 Gateway，并固定传递 `X-Forwarded-Proto: https`，确保登录刷新 Cookie 使用安全属性。

## 常见故障

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 域名无法打开 | Windows hosts 未配置 | 重新运行初始化脚本并执行 `ipconfig /flushdns` |
| 浏览器提示证书不可信 | 当前用户证书库缺少本地证书 | 重新运行初始化脚本，完全退出并重启浏览器 |
| 443 端口冲突 | 其他进程监听本机 HTTPS | `Get-NetTCPConnection -State Listen -LocalPort 443` 定位并处理冲突 |
| 共享入口返回 502 | Manager 未加入共享网络或入口配置未加载 | 检查两个容器的 `chat-web-infrastructure` 网络，并执行 `docker exec chat-web-nginx nginx -t` |
| 页面正常、API 502 | Gateway 不健康或不在共享网络 | 检查 `chat-web-gateway-service` 健康状态和 `chat-web-infrastructure` |
| 刷新页面返回 404 | Nginx SPA 回退配置未生效 | 检查运行镜像及 `/etc/nginx/conf.d/default.conf` |
| Company 部署一直等待 | Company Runner 未在线 | 检查 Manager 仓库 `chat-server-company` Runner 服务 |
| Home 部署一直等待 | Home Runner 未在线 | 检查 Manager 仓库 `chat-server-home` Runner 服务 |
| 一台成功、另一台等待 | 等待机器离线 | 已在线机器的部署有效；恢复另一台对应 Runner 后等待任务会继续 |

## 回滚

部署失败时脚本会恢复上一镜像。手工操作：

```bash
cd /opt/chat-web-base-manager
IMAGE='ghcr.io/wlisfes/chat-web-base-manager:<previous-sha>' docker compose -f compose.yml up -d --no-deps base-manager
docker inspect chat-web-base-manager --format '{{.State.Health.Status}}'
```

证书和私钥不随镜像回滚。若证书损坏，先停止站点，备份后删除对应机器侧文件，再重新运行初始化脚本；不得将私钥复制到 GitHub、聊天或日志。
