# Chat Web Base Manager

Vue 3、TypeScript 和 Vite 管理端。开发环境默认把 `/api/account` 转发到本地 Gateway；生产镜像通过同一 Docker 网络把 `/api/*` 转发到 `chat-web-gateway-service:3999`。

```bash
yarn install
yarn dev
yarn build
```

本机部署地址为 `https://chat.lisfes.com`。首次初始化、证书信任、健康检查和回滚说明见 `deploy/RUNBOOK.md`。
