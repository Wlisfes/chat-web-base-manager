# Repository instructions

## 部署变更记录

任何会影响 Docker 构建、站点启动、反向代理、端口、TLS、健康检查、Runner、部署目录或外部网络的修改，都必须在同一次改动中更新 `deploy/CHANGELOG.md`。

变更记录至少包含：日期、影响机器、关联版本、变更内容、机器侧操作、验证命令和回滚方法。禁止在文档中记录密码、Token、私钥、证书私钥或完整 `.env`。

排障命令和当前运行基线维护在 `deploy/RUNBOOK.md`。

## 自动发布与部署

- 用户已经要求完成发布或部署时，Agent 必须自行完成验证、提交、推送、创建 PR、合并和流水线跟踪，不得把这些步骤转交给用户。
- 机器侧的本地域名、证书和 Runner 配置由 Agent 按 `deploy/RUNBOOK.md` 完成；证书私钥只能保存在部署机器，不得提交到仓库或输出到日志。
- 只有权限、认证、分支保护、目标机器不可达或持续失败的 CI 确实阻止自动完成时，才请求用户介入。

## 默认双机部署

- Docker 服务默认同时部署到 Company 和 Home 两台独立机器，Runner 标签固定为 `chat-server-company` 和 `chat-server-home`；除非用户明确批准，不得改为单机部署。
- 流水线必须只构建一次镜像，并将同一完整 Git SHA 镜像部署到两台机器。部署矩阵使用 `fail-fast: false`，每台机器使用独立 Environment 和 concurrency，使在线机器不受另一台离线影响。
- 两台机器分别维护本仓库专用的 Self-hosted Runner、`/opt/chat-web-base-manager` 部署目录、本地 TLS 文件和 `.env`；不得在仓库或工作流中共享、输出这些机器侧敏感文件。
- 两台机器都必须执行健康检查并支持失败自动回滚；运行基线、初始化、验证和回滚操作维护在 `deploy/RUNBOOK.md`。
