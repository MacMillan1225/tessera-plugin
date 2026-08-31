# tessera.chart.line

Line / area chart, single or multi series. Lieflat style: thin 2px lines,
circular data points, optional translucent area fill, no axis clutter.

> Charts render via ECharts (lazy-loaded `lib/echarts.min.js` on first use).
> If blank, the file is missing or the chart group is disabled in settings.

## API

```js
tessera.chart.line(options)  // → LineInstance (an HTMLElement)
```

## Data (ChartData)

```js
{
  labels: string[],                 // x-axis categories
  values: number[],                 // single series → y values
  series?: { name: string, values: number[] }[]  // multi series (labels shared)
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
| `showTooltip` | `true` | Hover tooltip (Lieflat paper card) |
| `showGrid` | `true` | Horizontal grid lines |
| `smooth` | `false` | Curved (smoothed) lines vs straight |
| `area` | `false` | Translucent area fill under the line |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `height` | `"240px"` | Canvas height |
| `symbolSize` | `5` | Data point diameter (px) |
| `lineWidth` | `2` | Line stroke width (px) |
| `gridLeft` / `gridRight` | `8` / `12` | Axis inset from canvas left/right (px) |
| `gridTop` | `28` | Inset from top (px); auto-reduces when legend hidden |
| `gridBottom` | `4` | Inset from bottom (px) |

### colors (chart semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `text` | `#71717A` | `#A1A1AA` | Axis labels / legend text |
| `grid` | `#E4E4E7` | `#3F3F46` | Grid lines |
| `accent` | `#18181B` | `#FAFAFA` | Single-series line color |
| `series` | `["#18181B","#71717A","#A1A1AA","#D4D4D8","#52525B"]` | `["#FAFAFA","#A1A1AA","#71717A","#52525B","#D4D4D8"]` | Multi-series palette (rotated) |

### className

Extra CSS classes on the chart root.

## Reactive properties

`.data` — set new `ChartData`, re-renders.

## Examples

```dataviewjs
// Single series — weekly note count
const pages = dv.pages('"Journal"');
const byWeek = pages.groupBy(p => dv.date(p.date).toFormat("W"));
const weeks = byWeek.map(g => g.key).slice(-8);
const counts = byWeek.map(g => g.rows.length).slice(-8);
dv.container.appendChild(tessera.chart.line({
  data: { labels: weeks, values: counts },
}));
```

```dataviewjs
// Multi series — planned vs done
dv.container.appendChild(tessera.chart.line({
  data: {
    labels: ["W1", "W2", "W3", "W4"],
    series: [
      { name: "Planned", values: [5, 8, 6, 9] },
      { name: "Done", values: [3, 7, 6, 8] },
    ],
  },
  flags: { showLegend: true },
}));
```

```dataviewjs
// Smooth area chart
dv.container.appendChild(tessera.chart.line({
  data: { labels: ["Jan","Feb","Mar"], values: [12, 19, 15] },
  flags: { smooth: true, area: true },
}));
```

```dataviewjs
// Thicker line, bigger points, tighter margins
dv.container.appendChild(tessera.chart.line({
  data: { labels: ["A","B","C"], values: [4, 7, 3] },
  layout: { lineWidth: 3, symbolSize: 8, height: "200px" },
  colors: { light: { accent: "#18181B" }, dark: { accent: "#FAFAFA" } },
}));
```