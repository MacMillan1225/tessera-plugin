# tessera.chart.gauge

210° dial gauge with a big percentage readout. **The value is a ratio
`0..1`** — `0.73` = 73%. The center shows `73%`; an optional sub-label below
(if you pass `label`, it replaces the default \"N TO GO\").

> Charts render via ECharts (lazy-loaded `lib/echarts.min.js` on first use).

## API

```js
tessera.chart.gauge(options)  // → GaugeInstance (an HTMLElement)
```

## Options

### Content

| Key | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | **Ratio 0..1** (e.g. `0.73` = 73%) |
| `label` | string | `""` | Sub-label under the big number; empty → auto \"N TO GO\" |

### flags

| Key | Default | Description |
|---|---|---|
| `showLabel` | `true` | Show the sub-label |
| `showTicks` | `true` | Tick marks around the arc |
| `showTooltip` | `true` | Hover tooltip |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `height` | `"220px"` | Canvas height |

### colors (chart semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `text` | `#8F8E88` | `#8F8E88` | Ticks + sub-label |
| `track` | `#DEDDD6` | `#2E2D29` | Unfilled arc track |
| `accent` | `#1C1C1A` | `#F0EFEB` | Progress arc + big number |

### className

Extra CSS classes.

## Reactive properties

`.value` · `.label` — set either, re-renders.

## Examples

```dataviewjs
// Overall completion
const done = dv.pages('"Tasks"').where(t => t.status === "done").length;
const total = dv.pages('"Tasks"').length;
dv.container.appendChild(tessera.chart.gauge({
  value: total ? done / total : 0,
}));
```

```dataviewjs
// With a custom label
dv.container.appendChild(tessera.chart.gauge({
  value: 0.68,
  label: "Sprint progress",
}));
```

```dataviewjs
// No ticks, tighter
dv.container.appendChild(tessera.chart.gauge({
  value: 0.9,
  flags: { showTicks: false },
  layout: { height: "180px" },
}));
```

```dataviewjs
// Health meter with accent
dv.container.appendChild(tessera.chart.gauge({
  value: 0.82,
  label: "Vault health",
  colors: { light: { accent: "#1C1C1A" }, dark: { accent: "#F0EFEB" } },
}));
```

```dataviewjs
// Reactive: live value
const g = tessera.chart.gauge({ value: 0 });
dv.container.appendChild(g);
g.value = 0.5; // updates
```