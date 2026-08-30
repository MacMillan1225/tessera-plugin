# tessera.chart.bar

Chunky column chart with rounded tops — the Lieflat \"chunky bars\" look.
Single series cycles the palette per column; multi series groups by category.

> Charts render via ECharts (lazy-loaded `lib/echarts.min.js` on first use).

## API

```js
tessera.chart.bar(options)  // → BarInstance (an HTMLElement)
```

## Data (ChartData)

```js
{
  labels: string[],                 // x-axis categories
  values: number[],                 // single series → one bar per category
  series?: { name: string, values: number[] }[]  // multi series (grouped)
}
```

| Key | Type | Default | Description |
|---|---|---|---|
| `data` | `ChartData` | `{labels:[], values:[]}` | Chart data |

## Options

### flags

| Key | Default | Description |
|---|---|---|
| `showLegend` | `false` | Series legend on top |
| `showTooltip` | `true` | Hover tooltip |
| `showGrid` | `true` | Horizontal grid lines |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `height` | `"240px"` | Canvas height |
| `barMaxWidth` | `28` | Max bar width (px) — raise for fatter bars |
| `barRadius` | `6` | Bar corner radius (px); Lieflat chunky = rounded tops |
| `gridLeft` / `gridRight` | `8` / `12` | Axis insets (px) |
| `gridTop` | `28` | Top inset (px) |
| `gridBottom` | `4` | Bottom inset (px) |

### colors (chart semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `text` | `#8F8E88` | `#8F8E88` | Axis labels |
| `grid` | `#DEDDD6` | `#2E2D29` | Grid lines |
| `accent` | `#1C1C1A` | `#F0EFEB` | Default bar fill |
| `series` | `["#1C1C1A","#8F8E88","#B0AFA9","#D8D7D1","#6A6963"]` | `["#F0EFEB","#8F8E88","#B0AFA9","#55554F","#C6C5BF"]` | Single-series per-column palette / multi-series palette |

### className

Extra CSS classes.

## Reactive properties

`.data` — set new `ChartData`, re-renders.

## Examples

```dataviewjs
// Monthly output — each column a different mono shade
const months = ["Jan","Feb","Mar","Apr"];
const counts = [12, 19, 15, 22];
dv.container.appendChild(tessera.chart.bar({
  data: { labels: months, values: counts },
}));
```

```dataviewjs
// From a query: tasks per project
const pages = dv.pages('"Tasks"');
const byProject = pages.groupBy(p => p.project || "unsorted");
dv.container.appendChild(tessera.chart.bar({
  data: {
    labels: byProject.map(g => g.key),
    values: byProject.map(g => g.rows.length),
  },
}));
```

```dataviewjs
// Multi series grouped
dv.container.appendChild(tessera.chart.bar({
  data: {
    labels: ["Q1", "Q2", "Q3"],
    series: [
      { name: "Revenue", values: [30, 45, 52] },
      { name: "Costs", values: [22, 28, 31] },
    ],
  },
  flags: { showLegend: true },
}));
```

```dataviewjs
// Chunky rounder bars, no grid
dv.container.appendChild(tessera.chart.bar({
  data: { labels: ["A","B","C","D"], values: [5, 9, 7, 6] },
  layout: { barMaxWidth: 40, barRadius: 10 },
  flags: { showGrid: false },
}));
```