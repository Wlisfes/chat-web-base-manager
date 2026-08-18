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
| Runner 标签 | `chat-server-company` |

该域名仅供本机访问，不依赖公共 DNS，也不对外网监听。浏览器通过 Windows hosts 解析到回环地址；本地证书只加入 Windows 当前用户信任库。证书私钥固定保存在 `/opt/chat-web-base-manager/certs/chat.lisfes.com.key`，权限必须为 `0600`。部署脚本验证证书后通过标准输入同步到专用 Docker Volume，解决 Docker Desktop 无法直接绑定 WSL `/opt` 路径的问题；站点容器对该卷只读挂载。

## 首次机器初始化

从管理员 PowerShell 执行：

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

## 部署验证

```powershell
docker inspect chat-web-base-manager --format "{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}"
docker inspect chat-web-gateway-service --format "{{.State.Health.Status}}"
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/health
Invoke-WebRequest -UseBasicParsing https://chat.lisfes.com/api/account/health
$response = Invoke-WebRequest -UseBasicParsing -SkipHttpErrorCheck https://chat.lisfes.com/api/account/auth/me
$response.StatusCode
($response.Content | ConvertFrom-Json).code
```

最后一组预期分别为 HTTP `200` 和业务 `401`。前端所有 `/api/*` 请求保持原路径转发到 Gateway，并固定传递 `X-Forwarded-Proto: https`，确保登录刷新 Cookie 使用安全属性。

## 常见故障

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 域名无法打开 | Windows hosts 未配置 | 重新运行初始化脚本并执行 `ipconfig /flushdns` |
| 浏览器提示证书不可信 | 当前用户证书库缺少本地证书 | 重新运行初始化脚本，完全退出并重启浏览器 |
| 443 端口冲突 | 其他进程监听本机 HTTPS | `Get-NetTCPConnection -State Listen -LocalPort 443` 定位并处理冲突 |
| 页面正常、API 502 | Gateway 不健康或不在共享网络 | 检查 `chat-web-gateway-service` 健康状态和 `chat-web-infrastructure` |
| 刷新页面返回 404 | Nginx SPA 回退配置未生效 | 检查运行镜像及 `/etc/nginx/conf.d/default.conf` |
| 流水线一直等待 Runner | Manager 仓库 Runner 未在线 | 检查 Manager 仓库 `chat-server-company` Runner 服务 |

## 回滚

部署失败时脚本会恢复上一镜像。手工操作：

```bash
cd /opt/chat-web-base-manager
IMAGE='ghcr.io/wlisfes/chat-web-base-manager:<previous-sha>' docker compose -f compose.yml up -d --no-deps base-manager
docker inspect chat-web-base-manager --format '{{.State.Health.Status}}'
```

证书和私钥不随镜像回滚。若证书损坏，先停止站点，备份后删除对应机器侧文件，再重新运行初始化脚本；不得将私钥复制到 GitHub、聊天或日志。
