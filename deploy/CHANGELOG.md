# 部署变更记录

## 2026-08-29 迁移管理端到云服务器

- 影响机器：云服务器 `47.119.21.228`；开发机上的 Manager 生产容器已废弃。
- 关联版本：本次 `developer` 配置提交，合并 `main` 后由流水线生成对应完整 Git SHA 镜像。
- 变更内容：生产入口固定为 `https://chat.lisfes.cn`；新增云端 Manager Compose 和回滚脚本，容器统一使用 `chat-web-cloud-nginx`，通过云端 Nginx 将 `/api/*` 经 WireGuard 转发到开发机 Gateway，同时保留基础设施 TCP 端口映射。流水线改为通过 `production-cloud` Environment 的 SSH 凭据部署云端，不再在开发机启动 Manager。
- 机器侧操作：保留 `/opt/chat-web-cloud/nginx.conf`、`/etc/letsencrypt/live/chat.lisfes.cn`、WireGuard 和 `chat-web-cloud-nacos`；删除开发机 Manager 容器和 `chat-web-base-manager-tls` Volume。GitHub Environment 配置 `CLOUD_SSH_PRIVATE_KEY`、`CLOUD_KNOWN_HOSTS`，可选配置 `CLOUD_HOST`、`CLOUD_USER`、`CLOUD_DEPLOY_PATH`。
- 验证命令：执行 `yarn build`、`docker compose -f deploy/compose.yml config --quiet`、`sh -n deploy/deploy.sh`；云端验证 `https://chat.lisfes.cn/health`、`/api/health`、Nginx 配置和容器健康状态。
- 回滚方法：将云端 Manager 镜像回滚到上一完整 Git SHA，执行 `docker compose -p chat-web-cloud -f manager-compose.yml up -d --no-deps web`；不停止 Nacos、WireGuard 和基础设施数据卷。

## 2026-08-29 部署拓扑收敛到 chat-home-server

- 状态：该本机部署方案已由上方云端迁移方案替代，以下内容仅保留作历史审计。
- 影响机器：仅 `chat-home-server`；原另一台部署机器已废弃并下线，不再创建部署任务。
- 关联版本：Manager 本次 `developer` 配置提交；未合并 `main`，不触发镜像构建或线上部署。
- 变更内容：删除 Company/Home 双机矩阵，Runner 选择标签统一为 `chat-home-server`，继续使用 `production-home` Environment、`/opt/chat-web-base-manager` 部署目录和本机 TLS 文件。
- 机器侧操作：Manager 仓库在线 Runner 的自定义标签已由 `chat-server-home` 更新为 `chat-home-server`，systemd 服务保持运行；废弃机器的离线 Runner 登记已从 GitHub 删除，若要恢复只能使用新 Token 重新注册。无需修改证书、`.env`、端口、Gateway 上游或 Docker 网络。
- 验证命令：校验 Actions YAML 和 actionlint 配置，确认现行配置不再引用 `chat-server-company`、`chat-server-home`、`production-company` 或部署矩阵。
- 回滚方法：若新标签无法调度，仅把当前单机任务和在线 Runner 的自定义标签临时改回 `chat-server-home`；不得恢复废弃机器的部署任务，TLS 文件和业务数据不回滚。

## 2026-08-25 移除统一观测入口

- 影响机器：Home；Company 当前离线，本次不等待其部署结果。
- 关联版本：Manager 本次完整 Git SHA 镜像。
- 变更内容：删除 `/observability` 与 `/observability/` 的 Grafana 专用反向代理，保留 SPA、健康检查和 `/api/**` 网关代理。
- 机器侧操作：先发布本镜像，再下线 Home 的 Grafana、Loki、Tempo、Prometheus 和 Alloy 容器及数据卷。
- 验证命令：执行 `yarn build`、`nginx -t` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后确认 Manager 和业务 API 正常，运行配置不再引用 `chat-web-grafana`。
- 回滚方法：恢复上一条健康 Manager 完整 SHA 镜像，并按需重新部署观测组件；业务数据库不回滚。

## 2026-08-24 Docker 上游地址动态重解析

- 影响机器：Home；Company 当前离线，本次不等待其部署结果。
- 关联版本：Manager 本次完整 Git SHA 镜像。
- 变更内容：Nginx 通过 Docker 内置 DNS 动态解析 Gateway 与 Grafana 容器名，缓存有效期10秒；修复 Grafana 或 Gateway 容器重建并更换 IP 后，Manager 仍访问旧 IP 导致 `/observability/**` 或 `/api/**` 返回 502 的问题。
- 机器侧操作：无需修改证书、`.env`、端口、Runner、部署目录和 Docker 网络；Home 已通过重启 Manager 临时刷新旧 DNS，合并后由新镜像提供持续动态解析。
- 验证命令：执行 `yarn build`、`nginx -t` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后重建 Grafana，等待最多10秒，再验证 `/observability/api/health` 和 `/api/account/health` 均返回 HTTP 200。
- 回滚方法：恢复上一条健康 Manager 完整 SHA 镜像；若观测组件已经重建，回滚后需重启 Manager 刷新一次上游地址，业务数据和观测数据均不回滚。

## 2026-08-23 Grafana 统一 HTTPS 入口

- 影响机器：Home；Company 当前离线，本次不等待其部署结果。
- 关联版本：`chat-web-observability` 首个正式版本；Manager 本次完整 Git SHA 镜像。
- 变更内容：新增 `/observability` 到 `/observability/` 的固定跳转，并把 `/observability/**` 原路径代理到 `chat-web-grafana:3000`；保留 WebSocket 升级头并关闭代理缓冲，业务 `/api/**` 和 SPA 路由不变。
- 机器侧操作：先把 Grafana 接入现有 `chat-web-infrastructure` 网络并配置 `GF_SERVER_ROOT_URL=https://chat.lisfes.com/observability/`；无需修改 Manager 证书、端口、`.env` 或 Gateway 路由。
- 验证命令：执行 `yarn build`、`nginx -t` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后访问 `https://chat.lisfes.com/observability/`，检查登录、数据源、Dashboard 和实时查询。
- 回滚方法：恢复上一条健康 Manager 完整 SHA 镜像；观测平台容器、凭据和持久化数据不回滚。


## 2026-08-23 独立 CRM 服务接入与命名重构

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA，并与 Account、Finance、Gateway、CRM 处于同一发布窗口。
- 关联版本：`chat-web-crm-service` 首个正式版本；Account、Finance 和 Gateway 本次完整 Git SHA。
- 变更内容：CRM 请求统一切换到 `/api/crm/sms/**`，客户详情和下拉直接使用 `/api/account/consumer/**`；文件、组件、变量和页面路由从旧 `client/formosan/saturation` 迁移为 `consumer/sms-quote`，彻底移除 path 参数。报价编辑使用 Naive UI 数字输入框展示 USD 小数并按百万倍整数提交，枚举使用中文 `n-tag`，发布确认不再误导为邮件发送。
- 机器侧操作：无需修改 Manager 端口、证书、Runner、部署目录和 Docker 网络；须先完成四个后端服务部署及 Account CRM 菜单修复。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后验证客户详情、短信应用、报价初始化、编辑、预览、发布和正式报价列表。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；新 CRM 数据保留，后端和数据库不自动回滚。

## 2026-08-23 表格横纵虚拟化与按需 Cell 渲染

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：客户表格同时启用 Naive UI 原生 `virtual-scroll`、`virtual-scroll-x` 和 `virtual-scroll-header`，使用 44px 实际最小行高；命名插槽在列配置阶段绑定为 `column.render`，普通 `render-cell` 仅返回原始值。固定宽度列使用原生 CSS Ellipsis，弹性列才按需使用 `n-performant-ellipsis`；横向虚拟模式取消末列跨设置列合并，设置列数据区保持为空。
- 性能依据：优化前客户页 567 个 Cell 实际展开为 2032 个表格 DOM；主题切换会把 `mergedTheme` 传给全部 Cell，并同时触发每个单元格的背景、边框和文字颜色过渡。横纵虚拟化会同时限制参与更新的行和列。
- 验证命令：执行 `yarn build`、`docker compose -f deploy/compose.yml config --quiet` 和 `git diff --check`；部署后检查横纵滚动、固定列、列设置、溢出 Tooltip、亮暗主题切换和浏览器控制台。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 表格单元格使用 Naive UI 高性能 Ellipsis

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：通用表格普通单元格和 `common-database-table-content` 默认改用 Naive UI 原生 `n-performant-ellipsis`；组件仅在鼠标移入时升级为完整 `n-ellipsis` 并测量溢出，仍保留显式 `ellipsis` 配置。
- 性能依据：客户页启用虚拟滚动后仍同时存在约 379 个完整 `n-ellipsis`；这些组件包含主题和 Tooltip 响应逻辑，并非等价于同数量的静态 DOM 节点。
- 验证命令：执行 `yarn build`、`docker compose -f deploy/compose.yml config --quiet` 和 `git diff --check`；部署后检查客户页主题切换、文本溢出 Tooltip、Tag 样式和浏览器控制台。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 客户枚举行使用 Naive UI 虚拟滚动

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：客户页保留 6 个中文枚举 `n-tag`，通过 `common-database-table` 透传 Naive UI `n-data-table` 原生 `virtual-scroll`；复用表格现有 `flex-height` 约束，不增加自定义颜色、动画、固定高度或过渡样式。
- 性能依据：客户页每页 50 行时包含 300 个 Tag、约 3989 个 DOM 节点，而基准项目同页仅 2 个 Tag/行；虚拟滚动仅渲染可视行，降低主题切换时参与更新的组件数量。
- 验证命令：执行 `yarn build`、`docker compose -f deploy/compose.yml config --quiet` 和 `git diff --check`；部署后检查客户页实际渲染行数、Tag 数量、连续主题切换和浏览器控制台。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 恢复 nest-platform-manager 主题渲染基线

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：以 `F:/GitHub/nest-platform-manager` 为基准恢复主题渲染：`n-config-provider` 重新启用基准项目的 `inline-theme-disabled`，亮色使用 `lightTheme`；布局内容区恢复基准背景过渡。枚举标签恢复为无边框 `n-tag` 原生 `type`，删除逐 Tag 的 `useProvider`、主题计算、官方 `color` 动态对象及自定义 20 色文件；同时撤销非基准的客户表格虚拟滚动补丁。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时只保留最新部署任务排队。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；逐文件对比基准 Provider、主题 Hook、布局、Tag 和 DataTable；部署后在 `/finance/account/consumer` 连续切换亮暗主题，确认 Tag 不再订阅主题且控制台无错误。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 客户表格启用 Naive UI 虚拟滚动

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：财务客户列表启用 `n-data-table` 官方 `virtual-scroll`，结合现有 `flex-height` 设置 `max-height: 100%` 和 40px 最小行高，仅挂载可视区域及缓冲区内的行。客户页不再同时保留 50 行、约 300 个 `n-tag` 实例参与主题切换。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时只保留最新部署任务排队。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后检查 `/finance/account/consumer` 表格纵向/横向滚动、复选框及分页，确认 DOM 中只渲染可视行，并连续切换亮暗主题检查响应耗时和控制台。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 使用 Naive UI 官方主题与 Tag API

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：按照 Naive UI 官方主题文档移除 `n-config-provider` 的 `inline-theme-disabled`，避免在频繁切换 `theme-overrides` 的场景生成和切换大量主题样式；删除 HTML 主题类、手写 Tag CSS 和自定义 CSS 变量。枚举标签统一使用 `n-tag` 官方 `color`、`round`、`strong` 属性，亮暗主题仍由 `n-config-provider` 的 `theme` 与 `theme-overrides` 管理，Body 样式由 `n-global-style` 同步。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时只保留最新部署任务排队。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后在 `/finance/account/consumer` 多次双向切换亮色/暗黑模式，确认 Tag 使用官方 `color` 属性、没有自定义 Tag 类和 HTML 主题类，页面无明显卡顿且控制台无错误。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 恢复 Naive UI 统一主题过渡

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：删除主题切换期间的全局 `transition: none`、View Transition 和根节点透明度动画，不再切换 `theme-switching` 全局类；Tag 仅提供 `--n-color`、`--n-text-color`、`--n-border` 色板变量和 400 字重，颜色、背景及边框过渡完全使用 Naive UI 内置的 `.3s var(--n-bezier)`。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时只保留最新部署任务排队。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后在 `/finance/account/consumer` 多次双向切换亮色/暗黑模式，确认根节点无自定义透明度动画、HTML 不出现 `theme-switching`、Tag 使用 Naive UI 的 `var(--n-bezier)` 过渡且控制台无错误。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 客户列表标签与主题切换性能优化

- 影响机器：Company、Home；两台机器部署同一 Manager Git SHA。
- 关联版本：本次 Manager 合并后的完整 Git SHA。
- 变更内容：列表枚举 Tag 取消圆形外观和粗体文字；20 色标签改用静态 CSS 色板变量，不再由每个标签单独订阅主题并重算内联样式。主题切换期间暂停组件级颜色动画，并通过浏览器根页面合成层统一执行 180ms 淡入淡出，降低客户列表大量 Tag 同时重绘造成的卡顿；不支持页面过渡时自动使用单根节点淡出淡入，启用减少动态效果时使用无动画回退。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时部署任务继续排队，不改为单机。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后在 `/finance/account/consumer` 多次双向切换亮色/暗黑模式，确认 Tag 为小圆角、字重 400、20 色对比度正常且页面无明显卡顿。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚后端或数据库。

## 2026-08-22 枚举中文化与暗黑模式 Tag 色板

- 影响机器：Company、Home；在 Account `@wlisfes/chat-web-base-schema@1.1.8` 和客户演示数据部署后发布。
- 关联版本：本次 Manager 与 Account 的完整 Git SHA。
- 变更内容：补齐账号、菜单、角色、品牌、币种、国家、客户、短信、定时任务和报价共 21 组本地中文枚举；表单下拉统一显示中文，列表枚举统一使用 Tag。Tag 色板扩展到 20 种状态色，每种颜色分别定义亮色和暗色的文字、透明背景及边框；客户列表补齐类型和阶段 Tag、归属部门格式化显示，并修复用户菜单显式切回浅色时的运算优先级问题。
- 机器侧操作：保留两台机器现有域名、TLS、`.env`、端口、Runner、部署目录和网络；Company Runner 离线时部署任务继续排队，不改为单机。
- 验证命令：执行 `yarn build`；部署后在亮色和暗黑模式分别检查客户列表/筛选表单、账号状态、财务品牌/币种/国家及定时任务页面，确认无英文枚举原值且 Tag 对比度清晰。
- 回滚方法：将 Company、Home 的 Manager 同时恢复到上一条健康 SHA；无需回滚数据库。若 Account 已新增字段或数据，保留不动。

## 2026-08-22 Account 动作式接口联动与日志轮转

- 影响机器：Company、Home；需在 Account、Finance、Gateway 部署后发布。
- 关联版本：本次 Manager 与三个后端服务的完整 Git SHA。
- 变更内容：全部 Account 调用改为单数模块和动作式路径，只发送 GET query 或 POST body；用户组织筛选改为数字数组，移除逗号字符串及 PUT/PATCH/DELETE 调用。Auth 改为 `/api/account/auth/codex/write` 与 `/api/account/auth/token/**`；Docker `json-file` 轮转调整为单文件 20m、保留 30 个文件。
- 机器侧操作：保留两台机器现有 `/opt/chat-web-base-manager/.env`、本地 TLS、域名、端口、Runner 和网络配置；后端联动版本健康后再部署 Manager。
- 验证命令：执行 `yarn build` 和 `docker compose -f deploy/compose.yml config --quiet`；部署后验证验证码、登录、续期、退出、权限、用户、组织、角色、菜单与 Consumer 页面，并检查浏览器请求方法/入参及 `docker inspect chat-web-base-manager --format '{{json .HostConfig.LogConfig}}'`。
- 回滚方法：同时回滚 Manager、Account、Finance、Gateway 到上一组兼容镜像；保留机器侧 `.env`、TLS 和数据库。

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
