# components/heatmap

`components/heatmap` 是一个独立热力图组件，直接输出热力图主体，不带卡片容器、不主动写入外层 margin，适合嵌入任意 DataviewJS 布局。

它基于 `Ref/Scripts/heatmap_template.js` 的显示逻辑改写，但按当前 Tessera 组件规范做了收敛：

1. 改成 `Tessera.define("components/heatmap", ...)` 组件形式
2. 改成直接返回 DOM 节点，而不是自行接管容器
3. 去掉 `dashboard_runtime`、字体管理、容器替换等当前组件里未使用的接口
4. 保留自适应范围、周/月标签、图例、tooltip、自定义数据函数和单格样式函数

## 加载方式

```dataviewjs
await dv.view("TesseraScript/tessera.bootstrap");
await dv.view("TesseraScript/core/dom");
await dv.view("TesseraScript/core/file");
await dv.view("TesseraScript/core/css");
await dv.view("TesseraScript/core/config");
await dv.view("TesseraScript/components/heatmap/index");

const heatmap = Tessera.use("heatmap");
```

也可以通过聚合入口：

```dataviewjs
await dv.view("TesseraScript/index");
const { heatmap } = Tessera.use("components");
```

## 最小示例

```dataviewjs
const heatmap = Tessera.use("heatmap");

const node = heatmap({
  getData: ({ start, end, utils }) => {
    const map = new Map();
    let cur = utils.normalizeDate(start);

    while (cur <= end) {
      map.set(utils.toDateKey(cur), {
        total: 4,
        completed: Math.floor(Math.random() * 5),
      });
      cur = utils.addDays(cur, 1);
    }

    return map;
  },
});

dv.container.appendChild(node);
```

## 支持的主要参数

```js
heatmap({
  data,
  getData,
  getCellStyle,
  renderTooltip,
  startDate,
  endDate,
  legend,
  showLegend,
  className,
  flags,
  settings,
  layout,
  colors,
  styles,
});
```

## 数据接口

### `data`

可直接传 `Map`、数组键值对或普通对象，键必须是 `YYYY-MM-DD`。

```js
data: {
  "2026-04-01": { total: 5, completed: 3 },
  "2026-04-02": { status: "done", sets: 18 },
}
```

### `getData`

可传同步或异步函数：

```js
getData: async ({ start, end, settings, flags, layout, theme, utils, input }) => {
  return new Map();
}
```

组件会在首次挂载和尺寸变化后自动重新调用它。

## 单格样式接口

### `getCellStyle`

支持返回：

1. 数字：`4`
2. 字符串：`"#22c55e"`
3. 对象：`{ level, color, borderColor, className, style, title }`

默认规则：

1. 若 `entry` 有 `completed` / `total`，按完成率映射到 `0-8` 等级
2. 若 `entry.level` 存在，则直接用该等级
3. 否则视为 `0`

## Tooltip 接口

### `renderTooltip`

可返回 HTML 字符串，自定义 tooltip 内容：

```js
renderTooltip: ({ entry, dateKey }) => `
  <span class="ts-heatmap-tooltip__main">${entry?.focus || "未设置"}</span>
  <span class="ts-heatmap-tooltip__date">${dateKey}</span>
`
```

如果不传，会使用内置 tooltip。

## `flags`

```js
flags: {
  showWeekLabels: true,
  showMonthLabels: true,
  showLegend: true,
  enableTooltip: true,
  mondayFirst: true,
}
```

## `settings`

```js
settings: {
  rangeMode: "adaptive", // adaptive | fixed-days | fixed-range
  minWeeks: 12,
  fixedDays: 84,
  locale: "zh-CN",
  monthNames: ["1月", "2月", ...],
  weekLabels: ["一", "", "三", "", "五", "", "日"],
  legend: "少 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 多",
  tooltipId: "ts-heatmap-tooltip",
}
```

### 范围模式

1. `adaptive`：根据组件宽度自适应展示周数
2. `fixed-days`：展示最近固定天数
3. `fixed-range`：配合 `startDate`、`endDate` 使用

## `layout`

```js
layout: {
  maxWidth: "100%",
  cellSize: 11,
  cellGap: 2,
  cellRadius: "3px",
  weekLabelWidth: "20px",
  weekLabelGap: "9px",
  monthLabelHeight: "18px",
  monthOffset: "28px",
  gridTopOffset: "4px",
  monthLabelSize: "9px",
  weekLabelSize: "9px",
  legendGap: "3px",
  legendTop: "6px",
  legendSwatchSize: "9px",
}
```

## `colors`

```js
colors: {
  light: {
    dayBg: "#f1f5f9",
    tooltip: "#ffffff",
    tooltipBg: "#0f172a",
    levels: ["#f1f5f9", ...],
  },
  dark: {
    dayBg: "#334155",
    tooltip: "#0f172a",
    tooltipBg: "#f1f5f9",
    levels: ["#334155", ...],
  },
}
```

也支持扁平字段覆盖两套主题：

```js
colors: {
  tooltipBg: "#111827",
}
```

## `styles`

```js
styles: {
  root: null,
  months: null,
  weeks: null,
  grid: null,
  legend: null,
}
```

这些是单实例内联样式入口，不会污染其他热力图实例。

## 返回值

组件返回一个 `section.ts-heatmap` 节点。

附加能力：

1. `node.parts.months`
2. `node.parts.weeks`
3. `node.parts.grid`
4. `node.parts.body`
5. `node.parts.legend`
6. `node.refresh()`：重新请求并渲染数据
7. `node.destroy()`：断开内部观察器
8. `node.utils`：日期和颜色辅助函数

## 工具函数导出

```js
const heatmap = Tessera.use("heatmap");
heatmap.utils.toDateKey(new Date());
```

目前导出：

1. `toDateKey`
2. `normalizeDate`
3. `addDays`
4. `alignToMonday`
5. `alignToSunday`
6. `htmlEscape`
7. `pickScaleColor`
8. `pickEnumColor`
9. `ratioToLevel`

## 配置加载

组件会自动尝试加载：`TesseraScript/components/heatmap/config.json`。

也可以主动预加载：

```js
const heatmap = Tessera.use("heatmap");
await heatmap.loadConfig();
```
