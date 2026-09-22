# 食迹 Food Track

<div align="center">

把吃过的每一家店、每一道菜，留在可搜索、可回顾、可分享的美食地图里。

**地图足迹 · 多视图回顾 · 标签筛选 · 协作共享 · 数据导入导出**

[功能概览](#功能概览) · [快速开始](#快速开始) · [开发命令](#开发命令) · [参与开发](#参与开发)

</div>

![食迹列表视图](docs/images/food-track-list.png)

> 页面截图使用演示数据，不包含真实用户信息。

<!-- Data-backed: project summary and preview verified against the current application UI. -->

## 功能概览

| 能力       | 说明                                           |
| ---------- | ---------------------------------------------- |
| 地图记录   | 在地图上标记餐厅与菜品，集中查看个人美食足迹   |
| 多视图浏览 | 在地图、列表、时间线和统计面板之间切换         |
| 搜索与筛选 | 按关键词、评分、日期和标签定位记录             |
| 记录管理   | 保存评分、备注、图片、到访日期、收藏状态和标签 |
| 协作共享   | 创建或加入协作组，查看个人、全部与共享记录     |
| 数据流转   | 支持 JSON、Excel 数据导入、导出和批量管理      |

<!-- Data-backed: capabilities verified against current components, API types, and tests. -->

## 数据回顾

统计面板汇总记录数、餐厅覆盖、平均评分、评分分布、常用标签与月度趋势。

![食迹统计面板](docs/images/food-track-dashboard.png)

<!-- Data-backed: dashboard metrics verified against FoodEntryStatistics and DashboardView. -->

## 技术栈

| 层级       | 技术                                                |
| ---------- | --------------------------------------------------- |
| 前端       | React 19、TypeScript、Vite、Tailwind CSS            |
| 状态与请求 | Zustand、TanStack Query                             |
| 可视化     | 高德地图 JavaScript API、Recharts                   |
| 后端       | NestJS、Drizzle ORM                                 |
| 平台能力   | 飞书秒搭登录上下文、数据库连接与能力插件            |
| 工程质量   | ESLint、Stylelint、Jest、GitHub Actions、Dependabot |

<!-- Data-backed: versions and tooling verified against package.json and repository configuration. -->

## 快速开始

### 运行要求

- Node.js 22 或更高版本
- npm 12 或更高版本
- 可用的飞书秒搭运行环境与项目数据库 schema
- 高德地图 JavaScript API Key；启用安全密钥校验时还需安全码

<!-- Data-backed: requirements verified against package.json, environment configuration, and platform imports. -->

### 启动项目

1. 克隆仓库并进入项目目录。

   ```bash
   git clone https://github.com/1Lyn-en/food-track.git
   cd food-track
   ```

2. 安装锁定版本的依赖。

   ```bash
   npm ci
   ```

3. 创建本地环境文件。

   ```powershell
   Copy-Item .env.example .env
   ```

4. 在 `.env` 中填写高德地图配置，然后启动前后端。

   ```bash
   npm run dev
   ```

启动后，前端默认位于 `http://localhost:8080`，后端默认监听 `http://localhost:3000`。

<!-- Data-backed: commands and default ports verified against package.json and server configuration. -->

## 配置

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

`.env` 已被 Git 忽略。仓库只提交不含真实密钥的 `.env.example`。

<!-- Data-backed: variables verified against .env.example and server configuration. -->

## 开发命令

| 命令               | 说明                                      |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | 同时启动前端和后端                        |
| `npm run lint`     | 运行 ESLint、Stylelint 和 TypeScript 检查 |
| `npm test`         | 运行 Jest 单元测试                        |
| `npm run test:ci`  | 串行运行测试并生成覆盖率                  |
| `npm run audit:ci` | 检查高危和关键依赖漏洞                    |
| `npm run build`    | 构建服务端和客户端                        |
| `npm start`        | 启动生产构建                              |

<!-- Data-backed: commands verified against package.json. -->

## 项目结构

```text
client/       React 前端
server/       NestJS 服务端
shared/       前后端共享类型
scripts/      构建与安全检查脚本
test/unit/    跨模块单元测试
.github/      GitHub Actions 与 Dependabot 配置
docs/images/  README 页面截图
```

## 测试与安全

单元测试覆盖 Excel/JSON 导入、飞书多维表格字段转换、表单校验、协作组详情访问和共享记录写入权限。

`drizzle-orm@0.44.6` 由平台依赖锁定。仓库通过 npm 原生 patch 应用 SQL 标识符转义修复，并由 `npm run audit:ci` 校验补丁内容。GitHub Actions 会执行依赖安装、Lint、类型检查、单元测试、安全审计和生产构建。

<!-- Data-backed: coverage and CI behavior verified against tests, scripts, and workflow configuration. -->

## 常见问题

**地图没有显示**

检查 `.env` 中的 `VITE_AMAP_KEY` 与 `VITE_AMAP_SECURITY_CODE`，并确认高德控制台已配置当前访问域名。

**页面能打开，但无法读取记录**

确认项目运行在可用的飞书秒搭环境中，并已同步仓库对应的数据库 schema。

**端口被占用**

通过 `SERVER_PORT` 调整后端端口；前端端口可在 Vite 启动参数或项目配置中调整。

<!-- Data-backed: troubleshooting follows current environment and runtime configuration. -->

## 参与开发

提交改动前运行：

```bash
npm run precommit
npm test -- --runInBand
```

提交信息采用 Conventional Commits，例如：

```text
fix(collab): enforce group membership
```

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

<!-- Data-backed: license declared in the repository LICENSE file. -->
