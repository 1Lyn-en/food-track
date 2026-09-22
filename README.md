# 食迹 Food Track

食迹是一款用于记录、浏览和回顾美食足迹的单页应用，支持地图、列表、时间线、统计面板、标签、数据导入导出和多人协作。[Data-backed]

项目基于 React、Vite 和 NestJS，并依赖飞书秒搭提供的登录上下文、数据库连接和能力插件。[Data-backed]

## 运行要求

- Node.js 22 或更高版本。[Data-backed]
- npm 12 或更高版本，用于安装仓库内声明的依赖安全补丁。[Data-backed]
- 可用的飞书秒搭运行环境与数据库 schema。[Data-backed]
- 高德地图 JavaScript API Key；启用安全密钥校验时还需安全码。[Data-backed]

## 本地启动

1. 安装依赖。

   ```bash
   npm ci
   ```

2. 从 `.env.example` 创建本地 `.env`，填写高德地图配置。

   ```powershell
   Copy-Item .env.example .env
   ```

3. 同时启动前后端开发服务。

   ```bash
   npm run dev
   ```

前端默认监听 `http://localhost:8080`，后端默认监听 `http://localhost:3000`。[Data-backed]

## 环境变量

| 变量                      | 用途                        | 默认值      |
| ------------------------- | --------------------------- | ----------- |
| `VITE_AMAP_KEY`           | 高德地图 JavaScript API Key | 无          |
| `VITE_AMAP_SECURITY_CODE` | 高德地图安全密钥            | 无          |
| `SERVER_HOST`             | 后端监听地址                | `localhost` |
| `SERVER_PORT`             | 后端监听端口                | `3000`      |
| `CLIENT_BASE_PATH`        | 前端路由基础路径            | `/`         |
| `LOG_DIR`                 | 日志目录                    | `./logs`    |
| `LOG_REQUEST_BODY`        | 是否记录请求体              | `false`     |
| `LOG_RESPONSE_BODY`       | 是否记录响应体              | `false`     |

`.env` 已被 Git 忽略；只提交不含真实密钥的 `.env.example`。[Data-backed]

## 常用命令

| 命令               | 说明                                      |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | 同时启动前端和后端                        |
| `npm run lint`     | 运行 ESLint、Stylelint 和 TypeScript 检查 |
| `npm test`         | 运行 Jest 单元测试                        |
| `npm run test:ci`  | 串行运行测试并生成覆盖率                  |
| `npm run audit:ci` | 检查高危和关键依赖漏洞                    |
| `npm run build`    | 构建服务端和客户端                        |
| `npm start`        | 启动生产构建                              |

## 项目结构

```text
client/       React 前端
server/       NestJS 服务端
shared/       前后端共享类型
scripts/      构建与安全检查脚本
test/unit/    跨模块单元测试
.github/      GitHub Actions 与 Dependabot 配置
```

## 测试与安全

当前单元测试覆盖 Excel/JSON 导入、飞书多维表格字段转换、表单校验、协作组详情访问和共享记录写入权限。[Data-backed]

`drizzle-orm@0.44.6` 由飞书平台依赖锁定；仓库使用 npm 原生 patch 应用 SQL 标识符转义修复，并在 `npm run audit:ci` 中验证补丁内容。[Data-backed]

GitHub Actions 会执行依赖安装、Lint、类型检查、单元测试、安全审计和生产构建。[Data-backed]

## 参与开发

提交改动前运行：

```bash
npm run precommit
npm test -- --runInBand
```

提交信息采用 Conventional Commits，例如 `fix(collab): enforce group membership`。

## 许可

本仓库当前未声明开源许可证。公开分发或接受外部贡献前，需要由项目所有者选择并添加许可证。[Data-backed]
