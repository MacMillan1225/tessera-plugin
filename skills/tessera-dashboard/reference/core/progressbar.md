# tessera.core.progressbar

Thin progress bar with an optional right-aligned label. **The value is a
ratio `0..1`** — `0.5` means 50%. Perfect for goals, quotas, completion.

## API

```js
tessera.core.progressbar(options)  // → ProgressbarInstance (an HTMLElement)
```

## Options

### Content

| Key | Type | Default | Description |
|---|---|---|---|
| `value` | number | `0` | **Ratio 0..1** (e.g. `0.5` = 50%) |
| `labelFormat` | string | `"{value}%"` | Label template: `{value}` → integer percent (`50`), `{raw}` → raw ratio (`0.5`) |
| `className` | string \| string[] | — | Extra classes |

### flags

| Key | Default | Description |
|---|---|---|
| `showLabel` | `true` | Show the right-aligned % label |
| `showStriped` | `false` | Diagonal stripe pattern on the fill |
| `showAnimated` | `false` | Animated stripe movement (needs `showStriped`) |

### layout

| Key | Default | Description |
|---|---|---|
| `width` | `"100%"` | Track width |
| `height` | `"8px"` | Track thickness |
| `radius` | `"4px"` | Track corner radius |

### colors (semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `background` | `#e7e5e4` | `#44403c` | Track fill |
| `border` | `transparent` | same | Track border |
| `text` | `#1C1C1A` | `#F0EFEB` | Label text |
| `accent` | `#1C1C1A` | `#F0EFEB` | **Fill color** (default = ink; set this for the pop of color) |

Structure: `colors: { light: {...}, dark: {...} }`; flat `colors.accent`
overrides both themes.

### styles

`{ root, fill }` — extra CSS properties.

## Reactive properties

`.value` — set a new ratio, re-renders instantly.

## Examples

```dataviewjs
// Simple: 2/3 done
dv.container.appendChild(tessera.core.progressbar({ value: 2/3 }));
```

```dataviewjs
// From a frontmatter `progress` property (already 0..1)
const p = dv.page("Projects/MyApp");
dv.container.appendChild(tessera.core.progressbar({
  value: p.progress ?? 0,
  colors: { accent: "#1C1C1A" },
}));
```

```dataviewjs
// Raw-ratio label: shows "0.42"
dv.container.appendChild(tessera.core.progressbar({
  value: 0.42,
  labelFormat: "{raw}",
}));
```

```dataviewjs
// Quota meter with custom label
const done = dv.pages('"Tasks"').where(t => t.status === "done").length;
const total = dv.pages('"Tasks"').length;
dv.container.appendChild(tessera.core.progressbar({
  value: total ? done / total : 0,
  labelFormat: "{value}% · {raw}",
}));
```

```dataviewjs
// Striped animated variant
dv.container.appendChild(tessera.core.progressbar({
  value: 0.5,
  flags: { showStriped: true, showAnimated: true },
}));
```