# Repository instructions

本文件在本仓库内独立生效，不依赖 `F:/chat-web-service/AGENTS.md` 或其他工作区文件。

## 通用工程规则

- 使用 Node.js 22、Yarn 1.22.22、Vue 3、TypeScript 和本仓库锁定的 Naive UI 依赖；源码使用 UTF-8，Shell、YAML 和 Dockerfile 使用 LF。
- 统一使用 4 空格、无分号、单引号、`printWidth: 140`、无尾随逗号；内部源码统一使用 `@/*` 路径别名。
- 文件名使用小写 kebab-case；组件、类型和类使用 PascalCase，变量、函数和实例属性使用 camelCase，常量使用 UPPER_SNAKE_CASE。
- 页面接口只使用 GET、POST；GET 使用 query，POST 使用 body；多选参数必须是数组，禁止使用 `/:uid` 等路径参数。
- 面向用户的提示、校验、接口文档和维护错误信息使用中文，代码标识符使用英文。
- `.env.example` 只列出启动所需参数和明确占位符；真实密钥、Token、私钥和生产 `.env` 不得提交。
- 涉及接口、代理或部署的改动必须完成对应运行级验证；每次改动至少执行格式检查、TypeScript 类型检查和前端构建。

## 部署变更记录

任何会影响 Docker 构建、站点启动、反向代理、端口、TLS、健康检查、Runner、部署目录或外部网络的修改，都必须在同一次改动中更新 `deploy/CHANGELOG.md`。

变更记录至少包含：日期、影响机器、关联版本、变更内容、机器侧操作、验证命令和回滚方法。禁止在文档中记录密码、Token、私钥、证书私钥或完整 `.env`。

排障命令和当前运行基线维护在 `deploy/RUNBOOK.md`。

## API 请求定义

- `src/api/**/modules/*.service.ts` 以 `src/api/modules/deploy/modules/datetask.service.ts` 为基准；API 文件只负责 HTTP 传输，每个接口函数保持单一职责，使用与后端协议一致的明确请求和响应类型，不新增专用的 `*.adapter.ts` 文件。
- 所有分页页面统一使用 `page`、`size` 请求字段和 `page`、`size`、`total`、`list` 响应字段；禁止在 API 层兼容或转换 `pageSize`、`items`、`records`、`rows`。
- 请求和响应类型必须直接描述后端接口协议；不得用 `Omix`、`any` 或其他宽泛类型掩盖页面字段与接口字段的差异。
- 每个接口函数应只发起一次 `request`，使用完整的字面量接口路径并显式声明 `method`，将调用方传入的 `params`/`data` 原样发送；禁止在 API 层做参数转换或响应适配，包括字段改名、`Number`/`String`/`Boolean` 类型转换、默认值注入、分页裁剪、数组重组、`map` 映射、响应包装和私有转换函数。
- GET 请求只通过 `params` 传递查询参数，POST 请求只通过 `data` 传递请求体；无入参时不添加空 `params` 或空 `data`。
- API 函数按 `httpBase<Service><Action><Resource>` 风格命名并添加中文职责注释，例如 `httpBaseSystemColumnDatetask`、`httpBaseSystemCreateSheetResource`。
- 页面字段兼容、请求体转换和响应适配必须放在页面/业务域层（如页面 composable、store 或业务 service）处理；接口字段应通过请求/响应 DTO 或类型定义明确表达，API service 不得承担业务规则和数据加工。历史 API 文件在相关需求修改时按此规则逐步整理。

## 自动发布与部署

- 用户已经要求完成发布或部署时，Agent 必须自行完成验证、提交、推送、创建 PR、合并和流水线跟踪，不得把这些步骤转交给用户。
- 机器侧的云端证书、WireGuard 和 SSH 配置由 Agent 按 `deploy/RUNBOOK.md` 完成；证书私钥和 SSH 私钥只能保存在部署机器或 GitHub Secret，不得提交到仓库或输出到日志。
- 只有权限、认证、分支保护、目标机器不可达或持续失败的 CI 确实阻止自动完成时，才请求用户介入。

## 云端部署

- `chat-web-base-manager` 只部署到云服务器 `47.119.21.228`，开发机上的同名 Docker 容器和本地域名入口均视为废弃，不得恢复。
- 生产访问地址固定为 `https://chat.lisfes.cn`。云端 Nginx 负责 TLS、静态资源和 `/api/*` 到 WireGuard 本机 Gateway 的转发。
- 流水线只构建一次完整 Git SHA 镜像并部署到云端 `/opt/chat-web-cloud` 的 `chat-web-cloud-nginx` 容器；Nacos 等基础设施由云端基础设施 Compose 独立维护。
- 云端部署必须执行健康检查并支持失败自动回滚；运行基线、初始化、验证和回滚操作维护在 `deploy/RUNBOOK.md`。

## 分支生命周期

- 远程仓库只保留 `main`、`developer` 两个长期分支；临时需求分支必须先合并到 `developer`，发布时同步合并到 `main`，合并并验证通过后立即删除远程和本地临时分支。

## Git 提交规范

- 所有提交信息必须使用 Conventional Commits 类型前缀，格式固定为 `<type>: 中文摘要`；如需填写作用域，使用 `<type>(<scope>): 中文摘要`。
- `type` 只能使用以下类型：`init`（项目初始化）、`feat`（添加新特性）、`fix`（修复缺陷）、`docs`（仅修改文档）、`style`（仅调整格式或样式）、`refactor`（代码重构）、`perf`（性能优化）、`test`（增加或调整测试）、`build`（构建或依赖变更）、`ci`（持续集成或部署配置）、`chore`（工程工具或其他维护性变更）。
- 提交摘要、正文和脚注必须使用中文；类型前缀保留上述英文小写关键字，代码标识符、命令和版本号可按实际需要保留原文。
- 每个提交应聚焦单一目的，摘要使用动词开头并准确说明影响范围，禁止使用 `update`、`modify` 等无意义描述或整句英文提交信息。
- 示例：`feat: 新增客户归属人筛选`、`fix: 修复 Nacos 服务注册失败`、`docs: 补充部署回滚说明`。
