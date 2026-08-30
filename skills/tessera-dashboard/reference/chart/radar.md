# tessera.chart.radar

Hexagonal radar chart for comparing multiple dimensions (skills, project
health, weekly balance). Single or multi series; optional translucent area
fill; optional axis rings. The tooltip anchors to the hovered data vertex and
glides smoothly between vertices.

> Charts render via ECharts (lazy-loaded `lib/echarts.min.js` on first use).

## API

```js
tessera.chart.radar(options)  // → RadarInstance (an HTMLElement)
```

## Data (ChartData)

```js
{
  labels: string[],   // dimension names (typically 6)
  values: number[],   // single series → values per dimension (0..max)
  series?: { name: string, values: number[] }[]  // multi series
}
```

| Key | Type | Default | Description |
|---|---|---|---|
| `data` | `ChartData` | `{labels:[], values:[]}` | Chart data |
| `max` | number | `auto` | Scale ceiling for all axes; auto → nice round number above the max value (1/2/5/10 stepping). Set it to fix the scale across updates |

## Options

### flags

| Key | Default | Description |
|---|---|---|
| `showLegend` | `false` | Series legend on top |
| `showTooltip` | `true` | Vertex-anchored tooltip |
| `showLabels` | `true` | Dimension names around the polygon |
| `showArea` | `true` | Translucent fill inside the polygon |
| `showAxes` | `true` | Axis rings + spokes |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `height` | `"260px"` | Canvas height |
| `lineWidth` | `2` | Polygon stroke width (px) |
| `symbolSize` | `3` | Vertex point diameter (px) |

### colors (chart semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `text` | `#8F8E88` | `#8F8E88` | Dimension labels |
| `grid` | `#DEDDD6` | `#2E2D29` | Axis rings + spokes |
| `accent` | `#1C1C1A` | `#F0EFEB` | Single-series polygon |
| `series` | `["#1C1C1A","#8F8E88","#B0AFA9","#D8D7D1","#6A6963"]` | `["#F0EFEB","#8F8E88","#B0AFA9","#55554F","#C6C5BF"]` | Multi-series palette |

### className

Extra CSS classes.

## Reactive properties

`.data` — set new `ChartData`, re-renders.
`.max` — set a fixed scale ceiling.

## Examples

```dataviewjs
// Skill self-assessment (6 dimensions)
dv.container.appendChild(tessera.chart.radar({
  data: {
    labels: ["Writing","Coding","Design","Speaking","Research","Review"],
    values: [72, 85, 60, 78, 90, 66],
  },
}));
```

```dataviewjs
// Multi-series comparison — this month vs last month
dv.container.appendChild(tessera.chart.radar({
  data: {
    labels: ["Focus","Depth","Speed","Breadth","Output","Health"],
    series: [
      { name: "This month", values: [80, 90, 70, 60, 85, 75] },
      { name: "Last month", values: [70, 80, 75, 55, 70, 80] },
    ],
  },
  flags: { showLegend: true },
}));
```

```dataviewjs
// Minimal polygon — axes off, area off
dv.container.appendChild(tessera.chart.radar({
  data: {
    labels: ["A","B","C","D","E","F"],
    values: [4, 3, 5, 2, 4, 3],
  },
  flags: { showAxes: false, showArea: false },
}));
```

```dataviewjs
// Fixed scale + thick line
dv.container.appendChild(tessera.chart.radar({
  data: {
    labels: ["Code","Test","Ship","Docs","Learn","Teach"],
    values: [9, 7, 8, 6, 8, 5],
  },
  max: 10,
  layout: { lineWidth: 3, symbolSize: 4 },
}));
```