# tessera.core.heatmap

GitHub-style calendar heatmap — activity, habits, streaks. Renders a grid of
day cells; cell intensity maps to `completed/total` ratio, a `level`, or a
raw `value`. Hover shows a tooltip anchored above the cell.

## API

```js
tessera.core.heatmap(options)  // → HeatmapInstance (an HTMLElement)
```

## Options

### Data (pick one source)

| Key | Type | Default | Description |
|---|---|---|---|
| `data` | `Record<string, number \| Entry>` or `Map` | — | Static data keyed `"YYYY-MM-DD"`. Number → intensity via `value`; Entry → see below |
| `startDate` | string \| Date | — | Range start (adaptive mode derives it from width; fixed mode uses this) |
| `endDate` | string \| Date | `new Date()` | Range end |
| `getData` | `({start, end, locale}) => data` | — | Async/sync data provider; called per render with the resolved range |
| `getCellStyle` | `(ctx) => number \| string \| style` | — | Per-cell style hook; returns level number, color string, or `{level,color,borderColor,className,style,title}` |
| `renderTooltip` | `(ctx) => string` | built-in | Custom tooltip HTML (escaped context) |

Entry shape: `{ total?, completed?, value?, label?, level? }`. Intensity
resolution order: custom `getCellStyle` → `completed/total` ratio → `level`
→ `value` (capped 1..8).

### flags

| Key | Default | Description |
|---|---|---|
| `showWeekLabels` | `true` | Weekday letters on the left |
| `showMonthLabels` | `true` | Month names on top |
| `showLegend` | `true` | \"few → many\" legend |
| `showTooltip` | `true` | Hover tooltips |
| `mondayFirst` | `true` | Weeks start Monday |

### settings

| Key | Default | Description |
|---|---|---|
| `rangeMode` | `"adaptive"` | `adaptive` (fits width) \| `fixed` (uses startDate) \| `year` (last ~84 days) |
| `minWeeks` | `12` | Minimum columns in adaptive mode |
| `fixedDays` | `84` | Window size in `year` mode |
| `locale` | `"zh-CN"` | Tooltip date locale |
| `monthNames` | `["1月", ..., "12月"]` | Month label strings |
| `weekLabels` | `["一","","三","","五","","日"]` | Weekday label strings |
| `legend` | `"少 $#e7e5e4$$#a8a29e$$#57534e$$#1c1917$ 多"` | Legend text; `$#hex$` tokens become color swatches |
| `tooltipId` | `"ts-heatmap-tooltip"` | Shared tooltip element id |

### layout

`maxWidth` `"100%"` · `cellSize` `11` · `cellGap` `2` · `cellRadius` `"3px"` ·
`weekLabelWidth` `"auto"` · `weekLabelGap` `"9px"` · `monthLabelHeight`
`"18px"` · `monthOffset` `"28px"` · `gridTopOffset` `"4px"` ·
`monthLabelSize` `"9px"` · `weekLabelSize` `"9px"` · `legendGap` `"3px"` ·
`legendTop` `"6px"` · `legendSwatchSize` `"9px"`

### colors (semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `background` | `#fafaf9` | `#1c1917` | Empty-day cell color |
| `text` | `var(--text-muted)` | same | Labels / tooltip text |
| `tooltip` | `#1C1C1A` | `#F0EFEB` | Tooltip foreground (hardcoded paper/ink, not user-configurable via settings) |
| `tooltipBg` | `#F0EFEB` | `#1C1C1A` | Tooltip background |
| `levels` | 9-step gray gradient light→dark | 9-step dark→light | Cell intensity ramp, `levels[0]` = empty |

### styles

Per-part overrides: `{ root, months, weeks, grid, legend }`.

## Reactive properties

`.data` · `.startDate` · `.endDate` — each re-renders (debounced 150ms).

## Examples

```dataviewjs
// Habits: count notes per day from a date frontmatter field
const pages = dv.pages('"Journal"');
const byDay = new Map();
for (const p of pages) {
  if (!p.date) continue;
  const key = dv.date(p.date).toFormat("yyyy-MM-dd");
  byDay.set(key, (byDay.get(key) || 0) + 1);
}
dv.container.appendChild(tessera.core.heatmap({ data: byDay }));
```

```dataviewjs
// Completed/total per day (shows a % tooltip)
dv.container.appendChild(tessera.core.heatmap({
  data: {
    "2026-08-24": { completed: 3, total: 5 },
    "2026-08-25": { completed: 5, total: 5 },
    "2026-08-26": { completed: 1, total: 5 },
  },
  settings: { rangeMode: "fixed", startDate: "2026-08-24", endDate: "2026-08-26" },
}));
```

```dataviewjs
// Dynamic data via getData callback (queried each render)
dv.container.appendChild(tessera.core.heatmap({
  getData: ({ start, end }) => {
    const pages = dv.pages('"Habits"').where(p => p.date && p.date >= start && p.date <= end);
    const map = {};
    for (const p of pages) map[dv.date(p.date).toFormat("yyyy-MM-dd")] = p.done ? 1 : 0;
    return map;
  },
}));
```

```dataviewjs
// Custom legend text
dv.container.appendChild(tessera.core.heatmap({
  data: { "2026-08-01": 4, "2026-08-02": 2 },
  settings: { legend: "弱 $#e7e5e4$$#57534e$$#1c1917$ 强" },
}));
```