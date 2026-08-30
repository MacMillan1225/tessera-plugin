# TesseraScript 配置系统详解

本文档说明 TesseraScript 的配置架构与**所有组件的完整配置字段**。配置机制本身（优先级、深合并、版本门槛、单一数据源）见 [ARCHITECTURE.md](./ARCHITECTURE.md) 第 4-6 节；这里聚焦"每个组件能配什么"。

> **示例说明**：以下 `dataviewjs` 代码块均以 `dv.container.appendChild(...)` 包裹，复制到笔记中即可直接运行。组件禁用时对应 API 为 `undefined`，运行前请确认已在设置中启用。

## 目录

1. [配置架构概述](#1-配置架构概述)
2. [配置优先级](#2-配置优先级)
3. [core 分组组件](#3-core-分组组件)
   - [card](#card)
   - [heatmap](#heatmap)
   - [progressbar](#progressbar)
4. [chart 分组组件](#4-chart-分组组件)
   - [line / bar](#line--bar)
   - [gauge](#gauge)
   - [rose](#rose)
5. [设置面板与 data.json](#5-设置面板与-datajson)

---

## 1. 配置架构概述

- 每个组件一个 `config.ts`（`XXX_DEFAULTS`），是**单一数据源**：运行时默认值、设置面板字段、DEFAULT_SETTINGS 都引用它
- 颜色键统一语义（ADR-0002）：`background / border / text / accent`，图表另有 `grid / track / series`
- 深浅主题分离：`colors.light.*` / `colors.dark.*`；也支持扁平共享键（`resolveThemeColors` 自动展开到两主题）
- 所有字段均有默认值（极简路线，ADR-0002），用户只需覆盖想改的部分

## 2. 配置优先级

```
调用时 options  >  设置面板 config（组件默认）  >  组件内部 DEFAULTS
```

`main.ts` 的 `mergeComponentConfig` 做深合并：`tessera.core.card({ flags: { showHeader: false } })` 只会覆盖该键，其余 flags 保留设置面板默认。

## 3. core 分组组件

### card

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

默认底色：light `rgba(245,248,252,0.9)` / dark `rgba(30,41,59,0.72)`（Lieflat 风格靠背景色差分层，无边框无阴影）。

### heatmap

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

## 4. chart 分组组件

所有图表共享：`layout.maxWidth`（默认 100%）、`layout.height`（line/bar/rose 默认 240px，gauge 220px）、`className`、`colors.light/dark`。数据统一 `ChartData { labels: string[], values: number[], series?: {name, values}[] }`。

### line / bar

```dataviewjs
dv.container.appendChild(tessera.chart.line({
  data: { labels: ["A","B","C"], values: [1,2,3] },
  flags: { smooth: true, area: true },
}))
dv.container.appendChild(tessera.chart.bar({
  data: { labels: ["A","B","C"], values: [4,7,3] },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| flags(line) | showLegend / showTooltip / showGrid | boolean | false / true / true | 图例/提示/网格线 |
| flags(line) | smooth | boolean | false | 平滑曲线 |
| flags(line) | area | boolean | false | 面积填充（opacity 0.08） |
| flags(bar) | showLegend / showTooltip / showGrid | boolean | false / true / true | 同上 |
| colors.light/dark | text | string | #8F8E88 | 轴文字 |
| colors.light/dark | grid | string | #DEDDD6 / #2E2D29 | 网格线 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 主色（单系列） |
| colors.light/dark | series | string[] | mono 色板 | 系列色板（多系列轮转；bar 单系列逐柱取色） |

### gauge

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
| colors.light/dark | text | string | #8F8E88 | 刻度/标签色 |
| colors.light/dark | track | string | #DEDDD6 / #2E2D29 | 轨道色 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 进度弧色 |

### rose

```dataviewjs
dv.container.appendChild(tessera.chart.rose({
  data: { labels: ["A","B","C","D"], values: [18,12,9,15] },
}))
```

| 配置组 | 字段 | 类型 | 默认 | 说明 |
|--------|------|------|------|------|
| flags | showLegend | boolean | false | 图例（底部） |
| flags | showTooltip | boolean | true | 悬浮提示 |
| flags | showLabels | boolean | true | 花瓣外标签 `name value` |
| colors.light/dark | text | string | #8F8E88 | 标签文字色 |
| colors.light/dark | accent | string | #1C1C1A / #F0EFEB | 花瓣基色 |
| colors.light/dark | series | string[] | mono 色板 | 花瓣分档色板（t>0.8/0.6/0.35 取前 4 档） |

## 5. 设置面板与 data.json

- 设置面板按 **分组 → 组件 → 字段分组** 层级展示（ADR-0004）：每个组件 section 有 enabled 开关，字段按 `flags/layout/settings/colors.light/colors.dark` 前缀自动归组
- `core` / `chart` 两个分组各有总开关（coreEnabled / chartEnabled）
- 修改后点 **应用并重载** 生效（Obsidian reload 插件）
- `data.json` 只存**被修改过的字段**（深合并）；`PluginSettings.version` 变更时旧配置整体重置（当前 v3）

### 配置与代码的映射

| 文件 | 职责 |
|------|------|
| `src/components/<name>/config.ts` | 默认值（单一数据源） |
| `src/settings/fields.ts` | 设置面板字段定义（引用 config.ts） |
| `src/main.ts` | 加载/深合并/版本门槛 |
| `src/settings/settings-tab.ts` | 渲染设置面板 |
| `src/i18n/*.json` | 字段名/tooltip 翻译 |