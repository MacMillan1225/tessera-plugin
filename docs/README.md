# TesseraScript Plugin

基于 **Obsidian + DataviewJS** 的组件库插件。在 `dataviewjs` 代码块中直接调用 `tessera` 全局对象，即可渲染卡片、热力图、进度条与图表。

- 命名空间：`tessera.core.*`（基础组件）、`tessera.chart.*`（图表，ADR-0005）
- 每个组件可独立开关，分组有总开关（ADR-0004）
- 视觉风格：Lieflat 单色克制风，无边框靠背景色差分层，圆角优雅，hover 克制（ADR-0001）
- 配置键统一语义：`background / border / text / accent`（ADR-0002）

## 安装

### 社区插件（发布后）

1. 打开 Obsidian **Settings → Community plugins**
2. 搜索 "TesseraScript"，安装并启用

### 手动安装（开发阶段）

1. 构建：`npm run build`
2. 将 `main.js`、`manifest.json`、`styles.css` 复制到 `<Vault>/.obsidian/plugins/tessera-plugin/`
3. 在 Obsidian **Settings → Community plugins** 中启用

**前置依赖**：插件依赖 [Dataview](https://github.com/blacksmithgu/obsidian-dataview) 插件，未安装/未启用时会提示并退出。

## 快速开始

```dataviewjs
// 卡片
dv.container.appendChild(tessera.core.card({
  title: "任务总览",
  meta: "TODO",
  value: 42,
  content: "今日待办",
}));

// 进度条（value 为 0..1 小数，0.5 = 50%）
dv.container.appendChild(tessera.core.progressbar({
  value: 0.5,
  labelFormat: "{value}%",
}));
```

## 组件总览

| 分组 | 组件 | 说明 |
|------|------|------|
| `tessera.core` | `card` | 卡片外壳（标题/元信息/数值/内容区） |
| `tessera.core` | `heatmap` | 日历热力图（活动/提交记录） |
| `tessera.core` | `progressbar` | 进度条（**value 为 0..1 小数**） |
| `tessera.chart` | `line` | 折线图（ECharts，SVG 渲染） |
| `tessera.chart` | `bar` | 柱状图（Lieflat "chunky bars" 胶囊圆角柱） |
| `tessera.chart` | `gauge` | Tick Gauge 刻度量表（进度弧 + 刻度） |
| `tessera.chart` | `rose` | Petal Rose 花瓣玫瑰图（三层叠加） |

> **懒加载**：`tessera.chart.*` 组件基于 ECharts，但库文件（`lib/echarts.min.js`）只在**首次实际调用图表组件时**才注入页面。关闭图表分组后，ECharts 完全不加载（ADR-0005）。

### 开关与默认配置

- 每个组件在 **Settings → TesseraScript** 中有独立开关（enabled）
- `core` / `chart` 两个分组各有总开关（coreEnabled / chartEnabled）
- 组件被禁用时，对应 API 为 `undefined`，调用会报错——请先检查：

```dataviewjs
if (tessera.core.card) {
  dv.container.appendChild(tessera.core.card({ title: "OK" }));
} else {
  dv.paragraph("card 组件未启用");
}
```

## 组件示例

### card

```dataviewjs
dv.container.appendChild(tessera.core.card({
  title: "读书进度",
  meta: "READING",
  value: "3/5",
  content: "《代码整洁之道》",
  flags: { showHeaderSep: true },
  layout: { maxWidth: "320px" },
}));
```

`card` 是自由容器：`content` 可以是任意 DOM 元素或元素数组，也可以直接 `appendChild` 到 `.parts.body`。

### heatmap

```dataviewjs
const data = {};
const pages = dv.pages('"Daily"');
pages.forEach(p => {
  data[p.file.name] = p.tasks?.length || 0;  // YYYY-MM-DD → number
});

dv.container.appendChild(tessera.core.heatmap({
  data,
  settings: { rangeMode: "adaptive" },
  flags: { mondayFirst: true },
}));
```

支持 `total/completed` 对象值（按完成比例分级）或 `value` 数值（按大小分级）。`getData`/`getCellStyle`/`renderTooltip` 回调可深度定制。

### progressbar

```dataviewjs
// value 是 0..1 的小数比例
dv.container.appendChild(tessera.core.progressbar({
  value: 0.73,
  labelFormat: "{value}%",      // {value} → 73（整数百分比）
  flags: { showLabel: true },
}));
```

`labelFormat` 占位符：`{value}` = 整数百分比（50），`{raw}` = 原始比例（0.5）。

### chart.line

```dataviewjs
dv.container.appendChild(tessera.chart.line({
  data: {
    labels: ["周一", "周二", "周三", "周四", "周五"],
    values: [12, 19, 8, 25, 16],
  },
  flags: { smooth: true, area: true, showGrid: false },
}));
```

多系列用 `series`：

```dataviewjs
dv.container.appendChild(tessera.chart.line({
  data: {
    labels: ["1月", "2月", "3月"],
    series: [
      { name: "收入", values: [30, 45, 22] },
      { name: "支出", values: [20, 15, 30] },
    ],
  },
  flags: { showLegend: true },
}));
```

### chart.bar

```dataviewjs
dv.container.appendChild(tessera.chart.bar({
  data: {
    labels: ["A", "B", "C", "D"],
    values: [4, 7, 3, 9],
  },
}));
```

单系列时每根柱从 mono 色板轮转取色（Lieflat chunky bars）；多系列时每系列一色、分组排列。

### chart.gauge

```dataviewjs
dv.container.appendChild(tessera.chart.gauge({
  value: 0.73,          // 0..1，73%
  label: "PROGRESS",    // 中央大数字下方的标签（缺省显示 "27 TO GO"）
}));
```

### chart.rose

```dataviewjs
dv.container.appendChild(tessera.chart.rose({
  data: {
    labels: ["笔记", "待办", "阅读", "项目"],
    values: [18, 12, 9, 15],
  },
  flags: { showLabels: true },
}));
```

花瓣明度按数值分档（越高越浅），三层结构：底色盘 → 花瓣层 → 标签层。

## 主题适配

所有组件自动跟随 Obsidian 深浅主题（`body.theme-dark/theme-light`），并通过 `theme` 观察器实时切换：

- 组件根元素带 `theme-dark` / `theme-light` class
- 颜色用 CSS 变量 `--ts-<component>-*-light/-dark` 或内联 current 变量
- 图表组件主题切换时自动 `setOption(..., { notMerge: true })` 重渲染

## 设置面板

**Settings → TesseraScript**，层级结构：

```
TesseraScript 配置
├── 核心组件 (core 总开关)
│   ├── card        [enabled] → flags / layout / colors…
│   ├── heatmap     [enabled] → …
│   └── progressbar [enabled] → …
└── 图表 (chart 总开关)
    ├── line   [enabled] → …
    ├── bar    [enabled] → …
    ├── gauge  [enabled] → …
    └── rose   [enabled] → …
```

- 每个字段可单独恢复默认值（↺ 按钮）
- 修改后需点击 **应用并重载**（Obsidian 会重载插件）
- 取色器内嵌 alpha 滑杆（alpha = 1 存 hex，否则存 rgba）

## 高级用法

### 组合组件

```dataviewjs
const data = { "2026-08-24": 5, "2026-08-25": 8, "2026-08-26": 3, "2026-08-27": 6 };  // 日期 → 数值（自适应窗口内）

const dashboard = document.createElement("div");
dashboard.style.cssText = "display:grid;grid-template-columns:repeat(2,1fr);gap:16px";

dashboard.appendChild(tessera.core.card({
  title: "活动热力图",
  children: tessera.core.heatmap({ data }),
}));

dashboard.appendChild(tessera.core.card({
  title: "本月进度",
  children: tessera.chart.gauge({ value: 0.8 }),
}));

dv.container.appendChild(dashboard);
```

### 访问内部 DOM（parts）

所有组件实例是 `HTMLElement`，可直接 `appendChild`，并暴露 `parts`：

```dataviewjs
const cardEl = tessera.core.card({ title: "动态卡片", content: "初始内容" });
cardEl.parts.body.appendChild(document.createTextNode("追加内容"));
cardEl.parts.value.textContent = "99";
dv.container.appendChild(cardEl);
```

### 响应式属性

部分组件支持响应式属性，赋值自动刷新：

```dataviewjs
const bar = tessera.chart.bar({
  data: { labels: ["A", "B", "C"], values: [4, 7, 3] },
});
dv.container.appendChild(bar);
bar.data = { labels: ["X", "Y"], values: [1, 2] };  // 自动重渲染
```

支持响应式属性的组件：`card`(title/meta/value/content)、`heatmap`(data/startDate/endDate)、`progressbar`(value)、`chart.*`(data，gauge 另有 value/label)。

### 自定义样式

组件根元素有稳定的 class（`.ts-card`、`.ts-heatmap`、`.ts-progressbar`、`.ts-chart ts-chart-line` 等），颜色走 CSS 变量。可用 `styles` 选项直接注入内联样式：

```dataviewjs
const card = tessera.core.card({
  title: "自定义",
  styles: { card: { marginBottom: "8px" } },
  colors: { light: { background: "#ffffff" } },
});
dv.container.appendChild(card);
```

## 示例看板

想看实际效果？[examples/DASHBOARDS.md](../examples/DASHBOARDS.md) 包含 4 个可直接运行的看板：

- **个人效率中心**：统计卡 + 活动热力图 + 今日待办 + 周目标进度
- **学习与技能仪表盘**：技能雷达 + 月度产出柱状 + 主题标签 + 最近更新
- **项目进度总览**：进度量表 + 燃尽折线 + 任务分布玫瑰 + 里程碑列表
- **静态演示看板**：纯静态数据，无需库结构，开箱即跑

## 检查状态

命令面板运行 **Check status** 可查看 Dataview 与各组件启用状态。

## 开发

- 架构：见 [ARCHITECTURE.md](./ARCHITECTURE.md)
- 新组件开发：见 [COMPONENT_DEVELOPMENT_GUIDE.md](./COMPONENT_DEVELOPMENT_GUIDE.md)
- 配置系统（全部字段）：见 [CONFIGURATION.md](./CONFIGURATION.md)
- 构建与调试：见 [DEVELOPMENT.md](./DEVELOPMENT.md)
- 设计决策：见 [decisions/](./decisions/)

## 许可证

BSD License - 见 [LICENSE](../LICENSE)