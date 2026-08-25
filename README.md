# Chat Web Base Manager

Vue 3、TypeScript 和 Vite 管理端。开发环境默认把 `/api` 转发到本地 Gateway；生产镜像通过同一 Docker 网络把 `/api/*` 转发到 `chat-web-gateway-service:3999`。Account 使用 `/api/account/**`，Finance 使用 `/api/finance/**`，CRM 使用 `/api/crm/**`。

外部客户新增、查询和状态管理使用 Account `/api/account/consumer/**`；Consumer 不是独立网关服务。品牌、币种、汇率和基础价格继续使用 Finance `/api/finance/**`。

CRM 页面使用 `/crm/consumer`、`/crm/partner`、`/crm/sms/quote/create` 和 `/crm/sms/quote` 规范路由；短信应用及报价数据调用独立 CRM 服务，客户选择与详情直接调用 Account 服务。

```bash
yarn install
yarn dev
yarn build
```

Company 和 Home 两台机器都通过各自本机的 `https://chat.lisfes.com` 访问。流水线构建一次镜像并将同一 Git SHA 部署到两台机器；首次初始化、Runner 标签、证书信任、健康检查和回滚说明见 `deploy/RUNBOOK.md`。
