# TesseraScript 术语表 (Glossary)

> 随设计访谈持续更新。每轮访谈锁定的术语定义都记录于此。

## 核心概念

| 术语 | 定义 |
|------|------|
| **贴片 (Tile)** | 用户在 DataviewJS 代码块中用固定格式 JS（形态 1：`tessera.core.card({...})` 直接调用）渲染出的一个可视化单元，如卡片、热力图、进度条、图表。 |
| **组件 (Component)** | 插件导出的渲染函数，接受 options 对象，返回 HTMLElement。当前组件：card、heatmap、progressbar（core）+ line、bar、gauge、rose（chart）。example 模板组件已在初期阶段删除。 |
| **组件分组 (Component Group / Category)** | 组件的命名空间分类：`core`（核心）、`chart`（图表）。API 形如 `tessera.<group>.<component>`。每组有独立分组级总开关（coreEnabled / chartEnabled）。 |
| **核心组件 (Core Components)** | 分组 `core` 下的组件：card、heatmap、progressbar。 |
| **图表组件 (Chart Components)** | 分组 `chart` 下的组件：line（折线）、bar（柱状）、gauge（刻度量表）、rose（玫瑰图）。基于 ECharts，懒加载。 |
| **ECharts 懒加载 (Lazy Loading)** | `lib/echarts.min.js` 独立于 bundle，首次实际调用图表组件时才以 `<script>` 注入（`loader.ts`）；chart 分组关闭时完全零加载。 |
| **ChartData** | 图表组件统一数据格式：`{ labels: string[], values: number[], series?: {name, values}[] }`。单系列用 labels+values，多系列用 series。 |
| **中性锌灰阶 tokens** | 组件与图表默认色板（简约黑白高级感）：INK #18181B、PAPER #FFFFFF、MUTED #71717A、GRID #E4E4E7（暗色卡片 #26262B、GRID #3F3F46）；系列色板 LIGHT_SERIES/DARK_SERIES 各 5 色灰阶。 |

## 配置体系

| 术语 | 定义 |
|------|------|
| **配置组 (Config Groups)** | 组件的配置分组骨架：`flags`（布尔开关）、`layout`（尺寸间距）、`colors`（颜色）、`styles`（自定义样式）。跨组件保持**统一键名**。 |
| **配置通用性 (Config Universality)** | 所有组件对同类概念使用**相同语义键名**（背景一律 `colors.light.background`，而非 card 用 background / progressbar 用 track / heatmap 用 dayBg）。统一的是**键名规范**，不是全局共享主题对象。 |
| **语义键 (Semantic Color Keys)** | 颜色配置统一为 `background / border / text / accent` 四个语义键 + 组件特有键（heatmap 的 `levels` 渐变数组、tooltip/tooltipBg；chart 的 `grid`/`track`/`series`）。`accent` = 强调色，默认跟随黑白灰单色体系，用户可改。 |
| **强调色 (Accent)** | 组件用于突出数值/进度/状态的单一强调色。默认落在黑白灰（克制），**用户可配置**；hover 等交互效果保持克制（不夸张）。 |
| **默认配置 (Default Config)** | 每个组件 `config.ts` 中的单一数据源默认值。除必填项外均有默认值；设置面板只暴露**重要字段**，其余隐藏。 |
| **样式令牌 (Style Tokens)** | 组件共享的 `--ts-*` CSS 变量层，供跨组件统一主题（背景、强调色、圆角等）。 |
| **极简配置 (Minimal Config)** | 设计目标：字段数量大幅收敛，用户只需看到少数重要开关/输入；保持嵌套结构（不过度扁平化）。 |

## 设置系统

| 术语 | 定义 |
|------|------|
| **设置层级 (Settings Hierarchy)** | 设置面板的分层结构：插件总开关 → 分组级（如 core，可整体开关）→ 组件级（如 card，可单独开关 + 展开字段详情）。 |
| **扁平透明度 (Flat Opacity)** | 视觉方向：颜色默认实色 hex（不依赖透明度）。取色器**内嵌 alpha 控件**（同一取色器内，不另起一行）；若实现困难则直接移除 alpha。 |
| **内容对象化 (Content Object Standard)** | 组件内部可修改的内容（标题、数值、内容区等）一律暴露为**响应式对象属性**：文本→固定文本格式（string），非文本→页面对象（HTMLElement），均可直接赋值替换。 |

## 视觉风格

| 术语 | 定义 |
|------|------|
| **Lieflat 风格 (Lieflat Style)** | 目标视觉风格，参考 Lieflat Charts 图鉴：暖灰底色 + 无边框白卡（靠背景色差分层）+ 单色灰度体系（默认）+ 可配置强调色 + 大圆角（12–16px）+ 克制交互（hover 不过分夸张）。深色反转卡片/药丸徽章/大写等宽标签为可选排版母题。 |
| **深色反转卡片 (Inverted Card)** | Lieflat 风格中的黑底白图卡片变体，用于视觉层次与重点突出（可选项）。 |

## 分发与兼容

| 术语 | 定义 |
|------|------|
| **分发模型 A (Distribution Model A)** | 所有组件代码/样式打包进单个插件发布，通过设置开关控制启用，不做运行时按需加载。 |
| **API 命名空间 (API Namespace)** | API 按分组命名：`tessera.core.card`、`tessera.core.heatmap`、`tessera.core.progressbar`、`tessera.chart.line/bar/gauge/rose`。初期开发阶段，**破坏性变更直接执行，不留旧别名**。 |
| **编辑-构建-提交循环 (Edit-Build-Commit Loop)** | 每次代码修改后：`npm run build` 编译出 `main.js` 供用户测试 → `git add` + `git commit` 写好提交信息 → 用户反馈后再迭代。 |