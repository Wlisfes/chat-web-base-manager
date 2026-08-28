# Repository instructions

## 部署变更记录

任何会影响 Docker 构建、站点启动、反向代理、端口、TLS、健康检查、Runner、部署目录或外部网络的修改，都必须在同一次改动中更新 `deploy/CHANGELOG.md`。

变更记录至少包含：日期、影响机器、关联版本、变更内容、机器侧操作、验证命令和回滚方法。禁止在文档中记录密码、Token、私钥、证书私钥或完整 `.env`。

排障命令和当前运行基线维护在 `deploy/RUNBOOK.md`。

## 自动发布与部署

- 用户已经要求完成发布或部署时，Agent 必须自行完成验证、提交、推送、创建 PR、合并和流水线跟踪，不得把这些步骤转交给用户。
- 机器侧的本地域名、证书和 Runner 配置由 Agent 按 `deploy/RUNBOOK.md` 完成；证书私钥只能保存在部署机器，不得提交到仓库或输出到日志。
- 只有权限、认证、分支保护、目标机器不可达或持续失败的 CI 确实阻止自动完成时，才请求用户介入。

## 单机部署

- Docker 服务只部署到当前主机 `chat-home-server`，原另一台部署机器已废弃并下线，不得再为废弃机器创建部署任务或多机矩阵。
- 流水线使用 `chat-home-server` Runner 标签和 `production-home` Environment，只构建一次完整 Git SHA 镜像并部署到 `/opt/chat-web-base-manager`。
- 当前主机维护本仓库专用的 Self-hosted Runner、本地 TLS 文件和 `.env`；不得在仓库或工作流中输出机器侧敏感文件。
- 部署必须执行健康检查并支持失败自动回滚；运行基线、初始化、验证和回滚操作维护在 `deploy/RUNBOOK.md`。
