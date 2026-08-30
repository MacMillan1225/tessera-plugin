# tessera.chart.rose

Petal rose chart (ECharts `roseType: "area"`) — a circular distribution chart
where each petal's radius is proportional to its value. Mono-tinted: petals
get progressively lighter shades from the series palette by value tier
(`>80%` darkest → `>35%` lightest). Great for task distribution, category
share, time breakdown.

> Charts render via ECharts (lazy-loaded `lib/echarts.min.js` on first use).

## API

```js
tessera.chart.rose(options)  // → RoseInstance (an HTMLElement)
```

## Data (ChartData)

```js
{
  labels: string[],   // petal names
  values: number[],   // petal sizes (relative; tier computed against max)
}
```

| Key | Type | Default | Description |
|---|---|---|---|
| `data` | `ChartData` | `{labels:[], values:[]}` | Chart data |

> `series` is ignored — the rose is a single-series distribution. Value tiers
> are computed against the max value.

## Options

### flags

| Key | Default | Description |
|---|---|---|
| `showLegend` | `false` | Legend below the chart |
| `showTooltip` | `true` | Hover tooltip (Lieflat paper card) |
| `showLabels` | `true` | Petal labels (name + value) outside the ring |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `height` | `"240px"` | Canvas height |

### colors (chart semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `text` | `#8F8E88` | `#8F8E88` | Labels |
| `accent` | `#1C1C1A` | `#F0EFEB` | Base petal color |
| `series` | `["#1C1C1A","#8F8E88","#B0AFA9","#D8D7D1","#6A6963"]` | `["#F0EFEB","#8F8E88","#B0AFA9","#55554F","#C6C5BF"]` | Tier palette (lightest used for small values) |

### className

Extra CSS classes.

## Reactive properties

`.data` — set new `ChartData`, re-renders.

## Examples

```dataviewjs
// Task distribution by status
const pages = dv.pages('"Tasks"');
const byStatus = pages.groupBy(t => t.status || "unknown");
dv.container.appendChild(tessera.chart.rose({
  data: {
    labels: byStatus.map(g => g.key),
    values: byStatus.map(g => g.rows.length),
  },
}));
```

```dataviewjs
// Time breakdown — four petals
dv.container.appendChild(tessera.chart.rose({
  data: { labels: ["Design","Code","Review","Docs"], values: [8, 14, 5, 6] },
}));
```

```dataviewjs
// With legend, labels off
dv.container.appendChild(tessera.chart.rose({
  data: { labels: ["A","B","C"], values: [3, 2, 4] },
  flags: { showLegend: true, showLabels: false },
}));
```