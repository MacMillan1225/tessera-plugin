# TesseraScript 配置系统详解

本文档说明 TesseraScript 的配置架构与**所有组件的完整配置字段**。配置机制本身（优先级、深合并、版本门槛、单一数据源）见 [ARCHITECTURE.md](./ARCHITECTURE.md) 第 4-6 节；这里聚焦"每个组件能配什么"。

> **示例说明**：以下 `dataviewjs` 代码块均以 `dv.container.appendChild(...)` 包裹，复制到笔记中即可直接运行。组件禁用时对应 API 为 `undefined`，运行前请确认已在设置中启用。
>
> **完整可运行看板**：见 [examples/DASHBOARDS.md](../examples/DASHBOARDS.md) —— 3 个真实场景看板，覆盖全部组件。

## 目录

1. [配置架构概述](#1-配置架构概述)
2. [配置优先级](#2-配置优先级)
3. [core 分组组件](#3-core-分组组件)
   - [card](#card)
   - [heatmap](#heatmap)
   - [progressbar](#progressbar)
   - [list](#list)
   - [tags](#tags)
4. [chart 分组组件](#4-chart-分组组件)
   - [line / bar](#line--bar)
   - [gauge](#gauge)
   - [rose](#rose)
   - [radar](#radar)
5. [设置面板与 data.json](#5-设置面板与-datajson)

---

## 1. 配置架构概述

- 每个组件一个 `config.ts`（`XXX_DEFAULTS`），是**单一数据源**：运行时默认值、设置面板字段、DEFAULT_SETTINGS 都引用它
- 颜色键统一语义（ADR-0002）：`background / border / text / accent`，图表另有 `grid / track / series`
- 深浅主题分离：`colors.light.*` / `colors.dark.*`；也支持扁平共享键（`resolveThemeColors` 自动展开到两主题）
- 所有字段均有默认值（极简路线，ADR-0002），用户只需覆盖想改的部分
- **图表尺寸字段（v4 新增）**：line/bar/radar 的 `layout.symbolSize` / `layout.lineWidth` / `layout.barMaxWidth` / `layout.barRadius` / `layout.gridLeft/Right/Top/Bottom` 均为**可选**——留空（不传）即用 ECharts 自动值，传入才覆盖

## 2. 配置优先级

```
调用时 options  >  设置面板 config（组件默认）  >  组件内部 DEFAULTS
```

`main.ts` 的 `mergeComponentConfig` 做深合并：`tessera.core.card({ flags: { showHeader: false } })` 只会覆盖该键，其余 flags 保留设置面板默认。

## 3. core 分组组件

### card

通用卡片组件：头部（标题 + 元信息）+ 大数值 + 内容区。

```dataviewjs
dv.container.appendChild(tessera.core.card({
  title: "标题",        // 头部左侧
  meta: "META",         // 头部右侧（大写小字）
  value: "42",          // 中部大数值
  content: "内容",      // 内容区（string | HTMLElement | 数组）
  children: dv.el("div", "子元素"),  // 同 content（优先）
  emptyText: "无内容",  // 内容为空时的占位
  className: "extra",
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | title | string | — | 头部左侧标题 |
| （顶层） | meta | string | — | 头部右侧元信息（小号大写） |
| （顶层） | value | string | — | 中部大数值 |
| （顶层） | content / children | any | — | 内容区内容（互斥，children 优先） |
| （顶层） | emptyText | string | "No content" | 内容为空时占位文本 |
| （顶层） | className | string \| string[] | — | 附加 CSS 类 |
| flags | showHeader | boolean | true | 显示头部 |
| flags | showHeaderSep | boolean | true | 头部与正文分隔线 |
| flags | showTitle | boolean | true | 显示标题 |
| flags | showMeta | boolean | true | 显示元信息 |
| flags | showValue | boolean | true | 显示大数值 |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | padding | string | "16px" | 内边距 |
| layout | radius | string | "14px" | 圆角 |
| layout | gap | string | "14px" | 头部/正文间距 |
| layout | bodyGap | string | "12px" | 正文内部间距 |
| colors.light/dark | background | string | 见下 | 卡片底色 |
| colors.light/dark | border | string | transparent | 边框色（默认无边框） |
| colors.light/dark | text | string | var(--text-normal) | 文字色 |
| colors.light/dark | accent | string | var(--text-normal) | 强调色（value 用） |
| styles | card/header/title/meta/body/value/empty | object | — | 内联样式覆盖（CSS 属性映射） |

默认底色：light `rgba(245,248,252,0.9)` / dark `rgba(30,41,59,0.72)`（Lieflat 风格靠背景色差分层，无边框无阴影）。

响应式：`title` / `meta` / `value` / `content` 属性可运行时改写并自动刷新。

### heatmap

GitHub 风格贡献热力图（日历网格 + 分级色 + tooltip）。

```dataviewjs
dv.container.appendChild(tessera.core.heatmap({
  data: { "2026-08-01": 5, "2026-08-02": { total: 10, completed: 7 } },
  startDate: "2026-01-01",  // 或 Date
  endDate: "2026-12-31",
  settings: { rangeMode: "year" },
  flags: { mondayFirst: true },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | data | Record/Map<string, number\|entry> | {} | 日期键 `YYYY-MM-DD` → 数值或 `{total,completed}` 对象 |
| （顶层） | startDate / endDate | string \| Date | 自适应 | 日期范围（fixed/year 模式生效） |
| （顶层） | getData | fn({start,end,locale}) → data | — | 动态取数回调（替代 data） |
| （顶层） | getCellStyle | fn(ctx) → level\|color\|style | — | 自定义单元格样式 |
| （顶层） | renderTooltip | fn(ctx) → html | 默认 | 自定义 tooltip 内容 |
| flags | showMonthLabels | boolean | true | 月份标签 |
| flags | showWeekLabels | boolean | true | 周几标签 |
| flags | showLegend | boolean | true | 图例 |
| flags | showTooltip | boolean | true | 悬浮提示 |
| flags | mondayFirst | boolean | true | 周一为每周第一天 |
| settings | rangeMode | "adaptive"\|"fixed"\|"year" | adaptive | 自适应宽度 / 固定天数 / 全年 |
| settings | minWeeks | number | 12 | adaptive 最少周数 |
| settings | fixedDays | number | 84 | fixed/year 模式天数 |
| settings | locale | string | zh-CN | 日期/tooltip 语言 |
| settings | monthNames | string[] | 1月..12月 | 月份名 |
| settings | weekLabels | string[] | 一/三/五/日 | 周标签 |
| settings | legend | string\|false | "少 $#color$… 多" | 图例文本（`$#hex$` 色块标记） |
| settings | tooltipId | string | ts-heatmap-tooltip | tooltip 元素 id |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | cellSize / cellGap / cellRadius | number/string | 11 / 2 / 3px | 单元格尺寸 |
| layout | weekLabelWidth / weekLabelGap | string | auto / 9px | 周标签宽度/间距 |
| layout | monthLabelHeight / monthOffset / gridTopOffset | string | 18px/28px/4px | 月标签布局 |
| layout | monthLabelSize / weekLabelSize | string | 9px / 9px | 标签字号 |
| layout | legendGap / legendTop / legendSwatchSize | string | 3px/6px/9px | 图例布局 |
| colors.light/dark | background | string | #fafaf9 / #1c1917 | 空单元格底色 |
| colors.light/dark | text | string | var(--text-muted) | 标签文字色 |
| colors.light/dark | tooltip / tooltipBg | string | 白/深 | tooltip 色 |
| colors.light/dark | levels | string[9] | 灰阶梯度 | 分级色（Lv0..Lv8） |

值分级：`{total,completed}` → 完成比例 `ceil(ratio*8)`；纯数字 → `ceil(value)`（>0）；`level` 键直接取。levels 默认灰阶（light `#fafaf9→#1c1917`，dark 反转），Lieflat 单色风。

### progressbar

进度条：轨道 + 填充 + 可选标签。`value` 为 **0..1 比例**。

```dataviewjs
dv.container.appendChild(tessera.core.progressbar({
  value: 0.5,           // ★ 0..1 小数，0.5 = 50%
  labelFormat: "{value}%",  // {value}=整数百分比, {raw}=原始比例
  flags: { showLabel: true },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | value | number | 0 | **进度比例 0..1**（0.5 = 50%） |
| （顶层） | labelFormat | string | "{value}%" | 标签模板：`{value}`→整数百分比，`{raw}`→原始比例 |
| flags | showLabel | boolean | true | 显示百分比标签 |
| flags | showStriped | boolean | false | 条纹样式 |
| flags | showAnimated | boolean | false | 条纹动画 |
| layout | width | string | "100%" | 宽度 |
| layout | height | string | "8px" | 高度 |
| layout | radius | string | "4px" | 圆角 |
| colors.light/dark | background | string | #e7e5e4 / #44403c | 轨道色 |
| colors.light/dark | border | string | transparent | 边框 |
| colors.light/dark | text | string | var(--text-normal) | 标签文字色 |
| colors.light/dark | accent | string | var(--text-normal) | 填充色（强调色） |

> **v3 变更**（任务需求）：`value` 语义从"绝对值+min/max"改为 **0..1 比例**。旧 `max/min` 字段已移除。`labelFormat` 现同时支持 `{value}`（整数百分比，如 50）与 `{raw}`（原始小数，如 0.5）。

### list

项目符号列表：强调色圆点 + 文本 + 可选右对齐数值。

```dataviewjs
dv.container.appendChild(tessera.core.list({
  items: [
    "完成周报",
    { label: "阅读《设计中的设计》", value: "32%" },
    { label: "整理笔记", value: "12 篇" },
  ],
  flags: { showBullets: true, showDividers: false },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | items | Array<string \| {label,value}> | [] | 列表项（字符串或对象，value 显示在右侧） |
| （顶层） | children | any | — | 列表后追加的自定义子元素 |
| （顶层） | emptyText | string | "No items" | 空列表占位 |
| （顶层） | className | string \| string[] | — | 附加 CSS 类 |
| flags | showBullets | boolean | true | 显示强调色圆点 |
| flags | showDividers | boolean | false | 行间细分隔线 |
| flags | showHover | boolean | true | 悬停行高亮 |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | padding | string | "14px" | 内边距 |
| layout | radius | string | "12px" | 圆角 |
| layout | gap | string | "8px" | 行间距 |
| layout | bulletSize | string | "5px" | 圆点直径 |
| layout | indent | string | "20px" | 文本相对圆点的缩进 |
| colors.light/dark | background | string | var(--background-secondary) | 卡片底色 |
| colors.light/dark | border | string | transparent | 边框色 |
| colors.light/dark | text | string | var(--text-normal) | 文字色 |
| colors.light/dark | accent | string | var(--text-normal) | 圆点色 |
| styles | root/list/item/bullet/label/value/empty | object | — | 内联样式覆盖 |

响应式：`items` 属性可运行时改写并自动重绘。

### tags

标签胶囊栏：自动换行，支持 **pill / soft / outlined** 三种变体（容器级 + 逐标签覆盖）。

```dataviewjs
dv.container.appendChild(tessera.core.tags({
  tags: [
    { label: "Dataview", color: "#15803d" },
    { label: "TesseraScript", variant: "soft" },
    "Obsidian",
    { label: "提醒", variant: "outlined" },
  ],
  flags: { wrap: true },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | tags | Array<string \| {label,color,variant}> | [] | 标签数组；color=自定义颜色，variant=逐标签样式覆盖 |
| （顶层） | children | any | — | 标签后追加的自定义子元素 |
| （顶层） | emptyText | string | "No tags" | 空标签占位 |
| （顶层） | className | string \| string[] | — | 附加 CSS 类 |
| flags | pill | boolean | true | 胶囊形状（完全圆角） |
| flags | soft | boolean | false | 柔和填充（浅底） |
| flags | outlined | boolean | false | 描边样式（仅边框） |
| flags | wrap | boolean | true | 自动换行（false=单行横向滚动） |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | padding | string | "12px" | 容器内边距 |
| layout | radius | string | "12px" | 容器圆角 |
| layout | gap | string | "6px" | 标签间距 |
| layout | tagRadius | string | "999px" | 单标签圆角 |
| layout | tagPadding | string | "4px 10px" | 单标签内边距 |
| layout | tagFontSize | string | "12px" | 单标签字号 |
| colors.light/dark | background | string | var(--background-secondary) | 容器底色 |
| colors.light/dark | border | string | transparent | 容器边框 |
| colors.light/dark | text | string | var(--text-normal) | 文字色 |
| colors.light/dark | accent | string | var(--text-normal) | 标签强调色 |
| styles | root/tags/tag/empty | object | — | 内联样式覆盖 |

变体优先级：逐标签 `variant` > 容器 `flags`。逐标签 `color` 通过 `--ts-tags-tag-accent` 覆盖，保留形状只换色。

响应式：`tags` 属性可运行时改写并自动重绘。

## 4. chart 分组组件

所有图表共享：`layout.maxWidth`（默认 100%）、`layout.height`（line/bar/rose 默认 240px，gauge 220px，radar 260px）、`className`、`colors.light/dark`。数据统一 `ChartData { labels: string[], values: number[], series?: {name, values}[] }`。

### line / bar

折线图与柱状图（ECharts SVG 渲染）。v4 起支持**尺寸与轴距自定义**（全部可选，留空=自动）。

```dataviewjs
// 折线：数据点 + 线宽 + 面积
dv.container.appendChild(tessera.chart.line({
  data: { labels: ["1月","2月","3月","4月"], values: [12, 19, 8, 25] },
  flags: { smooth: true, area: true },
  layout: { symbolSize: 8, lineWidth: 3, gridLeft: 12, gridRight: 20 },
}))

// 柱状：柱宽 + 圆角 + 轴距
dv.container.appendChild(tessera.chart.bar({
  data: { labels: ["A","B","C"], values: [4, 7, 3] },
  layout: { barMaxWidth: 40, barRadius: 10, gridBottom: 16 },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| flags(line) | showLegend / showTooltip / showGrid | boolean | false / true / true | 图例/提示/网格线 |
| flags(line) | smooth | boolean | false | 平滑曲线 |
| flags(line) | area | boolean | false | 面积填充（opacity 0.08） |
| flags(bar) | showLegend / showTooltip / showGrid | boolean | false / true / true | 同上 |
| layout(line) | symbolSize | number | 5 | **数据点直径（px）**，留空=自动 |
| layout(line) | lineWidth | number | 2 | **线宽（px）**，留空=自动 |
| layout(bar) | barMaxWidth | number | 28 | **柱状最大宽度（px）**，留空=自动 |
| layout(bar) | barRadius | number | 6 | **柱状顶部圆角（px）**，留空=自动 |
| layout(共用) | gridLeft / gridRight | number | 8 / 12 | **轴距画布左右边缘距离（px）** |
| layout(共用) | gridTop / gridBottom | number | 28 / 4 | **轴距画布上下边缘距离（px）** |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | height | string | "240px" | 画布高度 |
| colors.light/dark | text | string | #8F8E88 | 轴文字 |
| colors.light/dark | grid | string | #DEDDD6 / #2E2D29 | 网格线 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 主色（单系列） |
| colors.light/dark | series | string[] | mono 色板 | 系列色板（多系列轮转；bar 单系列逐柱取色） |

### gauge

Tick Gauge 刻度量表：210° 圆弧 + 刻度 + 中心大数字 + 剩余量标签。

```dataviewjs
dv.container.appendChild(tessera.chart.gauge({
  value: 0.73,          // ★ 0..1 比例，73%
  label: "PROGRESS",    // 中央大数下方标签（缺省显示 "27 TO GO"）
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | value | number | 0 | **进度比例 0..1** |
| （顶层） | label | string | "" | 中央标签（缺省自动显示剩余量 "N TO GO"） |
| flags | showLabel | boolean | true | 显示中央标签 |
| flags | showTicks | boolean | true | 显示刻度（10 等分） |
| flags | showTooltip | boolean | true | 悬浮提示 |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | height | string | "220px" | 画布高度 |
| colors.light/dark | text | string | #8F8E88 | 刻度/标签色 |
| colors.light/dark | track | string | #DEDDD6 / #2E2D29 | 轨道色 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 进度弧色 |

响应式：`value` / `label` 属性可运行时改写并自动刷新。

### rose

Petal Rose 花瓣玫瑰图：三层叠放（底色盘 + roseType 玫瑰层 + 透明标签层），按值分档明度。

```dataviewjs
dv.container.appendChild(tessera.chart.rose({
  data: { labels: ["A","B","C","D"], values: [18, 12, 9, 15] },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| flags | showLegend | boolean | false | 图例（底部） |
| flags | showTooltip | boolean | true | 悬浮提示 |
| flags | showLabels | boolean | true | 花瓣外标签 `name value` |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | height | string | "240px" | 画布高度 |
| colors.light/dark | text | string | #8F8E88 | 标签文字色 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 花瓣基色 |
| colors.light/dark | series | string[] | mono 色板 | 花瓣分档色板（t>0.8/0.6/0.35 取前 4 档） |

### radar

多边形雷达图（六维图）：支持多系列对比、面积填充、轴显隐。

```dataviewjs
dv.container.appendChild(tessera.chart.radar({
  data: {
    labels: ["健康", "工作", "学习", "社交", "财务", "娱乐"],
    values: [80, 65, 90, 70, 55, 85],
  },
  flags: { showArea: true },
  // max: 100,   // 各维度最大刻度，留空=自动计算
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| （顶层） | data | ChartData | {} | labels=维度名，values=各维度得分（或 series 多组） |
| （顶层） | max | number | 自动 | 各维度最大刻度值；**留空=自动计算 nice ceiling**（1/2/5/10 步进） |
| flags | showLegend | boolean | false | 图例（多系列时有用） |
| flags | showTooltip | boolean | true | 悬浮提示 |
| flags | showLabels | boolean | true | 各顶点维度标签 |
| flags | showArea | boolean | true | 半透明强调色填充多边形 |
| flags | showAxes | boolean | true | 从中心到各顶点画轴线 |
| layout | maxWidth | string | "100%" | 最大宽度 |
| layout | height | string | "260px" | 画布高度 |
| layout | lineWidth | number | 2 | 多边形描边宽（px），留空=自动 |
| layout | symbolSize | number | 3 | 顶点圆点直径（px），留空=自动 |
| colors.light/dark | text | string | #8F8E88 | 维度标签色 |
| colors.light/dark | grid | string | #DEDDD6 / #2E2D29 | 雷达网格线 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 单系列主色 |
| colors.light/dark | series | string[] | mono 色板 | 多系列色板轮转 |

响应式：`data` / `max` 属性可运行时改写并自动刷新。

## 5. 设置面板与 data.json

- 设置面板按 **分组 → 组件 → 字段分组** 层级展示（ADR-0004）：每个组件 section 有 enabled 开关，字段按 `flags/layout/settings/colors.light/colors.dark` 前缀自动归组
- `core` / `chart` 两个分组各有总开关（coreEnabled / chartEnabled），关闭分组则其下组件 API 均为 `undefined`
- 颜色字段带**内嵌 alpha 滑条**（ADR-0004）：同一控制行调整透明度，alpha<1 存 rgba，=1 存 hex
- 每个字段旁有恢复默认按钮；修改后点 **应用并重载** 生效（Obsidian reload 插件）
- `data.json` 只存**被修改过的字段**（深合并）；`PluginSettings.version` 变更时旧配置整体重置（当前 v4）

### 设置面板字段与代码的映射

| 文件 | 职责 |
|------|------|
| `src/components/<name>/config.ts` | 默认值（单一数据源） |
| `src/settings/fields.ts` | 设置面板字段定义（引用 config.ts） |
| `src/main.ts` | 加载/深合并/版本门槛 |
| `src/settings/settings-tab.ts` | 渲染设置面板 |
| `src/i18n/*.json` | 字段名/tooltip 翻译 |