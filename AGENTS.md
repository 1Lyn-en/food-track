# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1 为设计意图与决策上下文。Code agent 实现时以 Section 2 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: 美食爱好者，个人记录与探索场景，追求强烈个性化、有视觉冲击力的记录体验
- **核心目的**: 记录美食足迹 + 地图可视化 + 数据回顾，兼具工具效率与漫画拼贴的张扬观感
- **情绪基调**: 直接、有力、大胆、复古美式漫画印刷感

### 1.2 设计方向

- **Design Style**: Pop Art 波普艺术 — 灵感源自 Lichtenstein / Warhol 时代的美式漫画印刷美学
- **Application Type**: Tool（单页多视图应用）— 地图为主工作区，侧栏/弹窗为辅助面板
- **Aesthetic Direction**: 粗黑描边 + 零模糊硬色块阴影 + 高饱和四原色 + 大写粗体 + halftone 网点纹理 + 超大圆角贴纸质感

## 2. Color System (色彩系统)

> 高饱和纯色系：红黄绿蓝四原色搭配纯黑纯白，无渐变、极少透明度，保持平面化。用纯色块区分层级而非仅调字号。

**色彩关系**：亮黄底 + 白色卡片面 + 纯黑描边/文字 + 红/蓝/绿纯色块强调
**配色设计理由**：波普核心是高饱和平面色 + 强对比；纯黑描边与硬阴影模仿丝网印刷错版，四原色制造漫画冲击力
**主色推导**：primary 取纯黑作为描边/阴影/主文字锚点；页面主背景用亮黄 #FFDE00 建立波普基调
**使用比例**：主背景亮黄 + 白色卡片面为基底 / 纯黑描边与阴影贯穿全局 / 红蓝绿作为功能强调纯色块

### 2.1 主题颜色

> **Color Token 语义速查**:
> - `primary` → 纯黑：描边、硬阴影、主文字、强调色块底
> - `accent` → 黄 #FFDE00：主背景、高亮标签、激活提示
> - `info` → 蓝 #007AFF：选中态、编辑操作、次数值高亮
> - `success` → 绿 #4CD964：确认/开始/进度填充
> - `destructive` → 红 #FF3B30：删除/危险操作、热力峰值
> - `muted` → 暖黄 #FFF9C4：侧边栏/卡片内底，降低白色刺眼

| Token                | 值 / HSL           | 说明                                     |
| -------------------- | ------------------ | ---------------------------------------- |
| `background`         | hsl(52,100%,50%)   | 亮黄主背景 #FFDE00                       |
| `card`               | hsl(0,0%,100%)     | 纯白卡片基底                             |
| `foreground`         | hsl(0,0%,0%)       | 纯黑主文字/描边                          |
| `primary`            | hsl(0,0%,0%)       | 纯黑，描边/阴影/强调块底                  |
| `primary-foreground` | hsl(0,0%,100%)     | 黑块上的白字                             |
| `muted`              | hsl(54,100%,88%)   | 暖黄 #FFF9C4，侧栏/卡片内底              |
| `muted-foreground`   | hsl(0,0%,25%)      | 深灰次要文字                             |
| `accent`             | hsl(48,100%,50%)   | 黄 #FFCC00/#FFDE00，高亮标签/激活         |
| `border`             | hsl(0,0%,0%)       | 纯黑描边（全局粗描边核心）               |
| `info`               | hsl(211,100%,50%)  | 蓝 #007AFF，选中/编辑                     |
| `success`            | hsl(133,63%,58%)   | 绿 #4CD964，确认/进度                     |
| `destructive`        | hsl(3,100%,59%)    | 红 #FF3B30，删除/危险                     |

### 2.2 导航区配色

- **基调关系**: 顶部工具栏用亮黄 #FFDE00 底 + 底部 `border-b-4 border-black` 粗黑分隔
- **关键状态**: Tab 激活态用蓝色块 `bg-[#007AFF] text-white`；hover 用黄底
- **边界与背景**: 非透明实心背景，粗黑描边包裹

### 2.3 语义颜色

| 用途     | 色值      | 衍生说明                       |
| -------- | --------- | ------------------------------ |
| success  | #4CD964   | 确认/开始/进度填充/新建按钮    |
| warning  | #FFCC00   | 重置/提示                      |
| error    | #FF3B30   | 删除/危险操作/热力峰值         |
| info     | #007AFF   | 选中态/编辑/次数值高亮         |

> 图表配色统一为波普四原色：`['#FF3B30', '#FFDE00', '#4CD964', '#007AFF', '#000000']`。所有图表元素带黑描边，无渐变。

## 3. Typography (字体排版)

- **装饰标题字体**: 'Bangers'（`.pop-font` / `--font-display`），用于品牌名、区块大标题、弹窗标题
- **正文字体**: 'Noto Sans SC'，全字重（含 900）
- **排版语法**: 标题一律 `uppercase` + `font-black`(900) + `tracking-tight`；标签/按钮 `uppercase font-bold`；字距按层级从 tracking-tighter 到 tracking-widest 渐变；数值可加 `drop-shadow-[2px_2px_0_#000]` 立体感
- **文字层级**: 区块大标题 `text-4xl`~`text-5xl` pop-font；卡片标题 `text-2xl font-black uppercase`；统计数值 `text-5xl font-black`；标签 `text-xs font-black uppercase tracking-widest`

## 4. Layout Strategy (布局策略)

- **导航意图**: 顶部亮黄工具栏为全局导航（视图切换+搜索+操作），粗黑描边分隔；地图全屏铺底，侧栏/抽屉为浮层
- **页面架构**: 单页多视图，地图 `h-screen` 全视口 + 右侧可折叠侧栏 `w-[360px]`（暖黄底 border-l-4）；页面底铺亮黄 + `.halftone-bg` 网点纹理
- **响应式**: 桌面端左地图右列表；移动端地图全宽 + 底部抽屉式列表，筛选/详情全屏覆盖；网格 grid-cols-1 → md:grid-cols-2

## 5. Visual Language (视觉语言)

- **形态参数**: 圆角基数 `--radius: 1.5rem`；容器用 `rounded-2xl`~`rounded-[4rem]`（要么超大要么无圆角，避免中等圆角）；全局阴影为零模糊纯黑硬色块偏移（`shadow-sm=4px_4px_0_0_#000` … `shadow-2xl=24px_24px_0_0_#000`）
- **识别签名**: 粗黑描边（`border-4 border-black`，大卡片 `border-[6px]`）+ 硬色块阴影 + halftone 网点背景 + 微旋转色块标题 `rotate-[-1deg]` + 大写粗体
- **装饰策略**: 用纯色块（黑底白字 / 红底白字）代替线性层级；标题块施加 1–3 度微旋转模拟剪报拼贴
- **动效原则**: 按钮 `:active` 位移 `translate(2px,2px)` + 阴影缩小；激活 `scale-105 ring-4 ring-black`；避免柔和 ease 渐变，保持弹跳/突然感
- **可及性**: 纯黑文字在亮黄/白底对比度充足；地图 Marker 点击热区 ≥ 44px

## 6. Component Principles (组件原则)

- **描边不可省略**: 每个可见容器至少 `border-2 border-black`，主容器 `border-4 border-black`
- **按钮规范**: `border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000]` + `font-black uppercase tracking-widest` + active 按下位移；变体色——绿=开始/确认、红=停止/删除、蓝=选择/编辑、黄=默认/重置、黑=强调、白=未选中
- **卡片规范**: `rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000]`（大卡 `shadow-[12px_12px_0_0_#000]`）
- **标签 pill**: `rounded-full border-2 border-black bg-[#FFDE00] px-3 py-1 text-xs font-black uppercase`
- **状态完整性**: Button/Input/Card/Tag 覆盖 Default/Hover/Focus/Active/Disabled；Focus 用粗描边代替 ring（`focus-visible:ring-0`），选中态用纯色块

## 7. Image Direction (图片与视觉资产)

- **Image Role**: 图片均为用户上传的美食照片；图片区带 `border-4 border-black` 边框，占位用暖黄底 + 线性图标
- **Image Art Direction**: 空状态使用粗线条漫画风简笔图标（SVG），黑色描边
- **Image Prompt Keywords**: bold comic line art, halftone dots, high-saturation flat color, thick black outline, pop art style, no text
- **Image Avoidance**: 避免柔和渐变、写实照片滤镜、低饱和莫兰迪色、细腻投影

## 8. 应避免 (Anti-patterns)

- ❌ 使用模糊柔和阴影（blur）——必须零模糊纯色偏移硬阴影
- ❌ 省略描边或用细边/浅灰边——描边是波普核心，至少 border-2 border-black
- ❌ 渐变、半透明叠加、低饱和柔色——削弱波普平面冲击力
- ❌ 中等圆角（rounded-md/lg）、regular/light 字重——要么超大圆角要么无圆角，字重用 black/bold
- ❌ 仅靠字号区分层级——优先用纯色块建立图形化层级
