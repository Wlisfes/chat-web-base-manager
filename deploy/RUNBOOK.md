# Base Manager 部署与故障恢复手册

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
| 部署主机 | `chat-home-server` |
| Runner 标签 | `chat-home-server` |
| GitHub Environment | `production-home` |

`chat-home-server` 的 `443` 已由共享 `chat-web-nginx` 占用，因此 Manager 使用
`127.0.0.1:8443 -> 8443`，共享入口加载 `deploy/shared-ingress.conf` 后通过
`chat-web-infrastructure` 转发到 `chat-web-base-manager:8443`。该兼容模式不改变
Compose 项目名、容器内端口、域名或 API 上游。

该服务只部署到 `chat-home-server`。流水线只构建一次镜像，并把完整 Git SHA 部署到该主机；原另一台部署机器已废弃，不再创建部署任务或等待其 Runner。

该域名仅供本机访问，不依赖公共 DNS，也不对外网监听。浏览器通过 Windows hosts 解析到回环地址；本地证书只加入 `chat-home-server` 的 Windows 当前用户信任库。证书私钥固定保存在 `/opt/chat-web-base-manager/certs/chat.lisfes.com.key`，权限必须为 `0600`。部署脚本验证证书后通过标准输入同步到专用 Docker Volume，解决 Docker Desktop 无法直接绑定 WSL `/opt` 路径的问题；站点容器对该卷只读挂载。

## 首次机器初始化

在 `chat-home-server` 的管理员 PowerShell 执行一次：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
./deploy/bootstrap-local-https.ps1
```

脚本可重复执行；有效证书存在时不会覆盖。初始化后确认：

```powershell
Select-String -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Pattern 'chat\.lisfes\.com'
Get-ChildItem Cert:\CurrentUser\Root | Where-Object Subject -EQ 'CN=chat.lisfes.com'
wsl -d Ubuntu-24.04 -u root -- sh -lc "stat -c '%a %n' /opt/chat-web-base-manager/certs/chat.lisfes.com.*"
```

必须为 Manager 仓库安装独立 Self-hosted Runner，并添加 `chat-home-server` 标签。Runner 服务账户需要能写入 `/opt/chat-web-base-manager`，并能访问本机 Docker daemon。仓库的 `production-home` Environment 可覆盖 `DEPLOY_PATH`；不设置时使用 `/opt/chat-web-base-manager`。

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
| 部署一直等待 | `chat-home-server` Runner 未在线 | 检查 Manager 仓库 `chat-home-server` Runner 服务 |

## 回滚

部署失败时脚本会恢复上一镜像。手工操作：

```bash
cd /opt/chat-web-base-manager
IMAGE='ghcr.io/wlisfes/chat-web-base-manager:<previous-sha>' docker compose -f compose.yml up -d --no-deps base-manager
docker inspect chat-web-base-manager --format '{{.State.Health.Status}}'
```

证书和私钥不随镜像回滚。若证书损坏，先停止站点，备份后删除对应机器侧文件，再重新运行初始化脚本；不得将私钥复制到 GitHub、聊天或日志。
