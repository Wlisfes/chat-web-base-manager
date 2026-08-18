# Chat Web Base Manager

Vue 3、TypeScript 和 Vite 管理端。开发环境默认把 `/api` 转发到本地 Gateway；生产镜像通过同一 Docker 网络把 `/api/*` 转发到 `chat-web-gateway-service:3999`。Account 使用 `/api/**`，Finance 使用优先级更高的 `/api/finance/**`。

```bash
yarn install
yarn dev
yarn build
```

Company 和 Home 两台机器都通过各自本机的 `https://chat.lisfes.com` 访问。流水线构建一次镜像并将同一 Git SHA 部署到两台机器；首次初始化、Runner 标签、证书信任、健康检查和回滚说明见 `deploy/RUNBOOK.md`。
