# Chat Web Base Manager

Vue 3、TypeScript 和 Vite 管理端。开发环境默认把 `/api` 转发到本地 Gateway；生产环境只部署到云服务器，由云端 Nginx 使用 `https://chat.lisfes.cn` 提供静态资源，并把 `/api/*` 通过 WireGuard 转发到开发机 Gateway。

外部客户新增、查询和状态管理使用 Account `/api/account/consumer/**`；品牌、币种、汇率和基础价格继续使用 Finance `/api/finance/**`。CRM 页面使用 `/crm/consumer`、`/crm/partner`、`/crm/sms/quote/create` 和 `/crm/sms/quote` 路由。

```bash
yarn install
yarn dev
yarn build
```

## 生产部署

开发机上的 `chat-web-base-manager` 容器和本地域名入口已废弃，不要在本机启动生产容器。镜像由 `main` 分支流水线构建并发布到 GHCR，再通过 SSH 部署到云端 `/opt/chat-web-cloud` 的 `chat-web-cloud-nginx` 容器；Nacos 等基础设施仍由云端基础设施 Compose 独立维护。

流水线使用 `production-cloud` Environment。请在该 Environment 配置以下 Secret：

- `CLOUD_SSH_PRIVATE_KEY`：仅用于部署云服务器的 SSH 私钥。
- `CLOUD_KNOWN_HOSTS`：云服务器 SSH 主机指纹，禁止在流水线中使用未校验的 `ssh-keyscan`。

可选 Environment Variables：`CLOUD_HOST`（默认 `47.119.21.228`）、`CLOUD_USER`（默认 `root`，建议改为受限部署用户）和 `CLOUD_DEPLOY_PATH`（默认 `/opt/chat-web-cloud`）。证书私钥、WireGuard 配置和云端 Nginx 配置均只保存在云服务器，不提交到仓库。

部署脚本会校验证书、拉取完整 Git SHA 镜像、保留基础设施端口映射、检查 `https://chat.lisfes.cn/health` 与 `/api/health`，失败时自动回滚上一版本。

首次初始化、云端 Nginx、证书、SSH Secret、验证和回滚命令见 [`deploy/RUNBOOK.md`](deploy/RUNBOOK.md)。
