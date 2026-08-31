# tessera.core.tags

Auto-wrapping tag chips inside a card. Three variants: **pill** (fully
rounded, default), **soft** (filled), **outlined** (border only). Variants and
colors can be set per-tag or at the container level.

## API

```js
tessera.core.tags(options)  // → TagsInstance (an HTMLElement)
```

## Options

### Content

| Key | Type | Default | Description |
|---|---|---|---|
| `tags` | `Array<string \| {label, color?, variant?}>` | — | Chips. String → label only; object adds per-tag color / variant |
| `children` | unknown | — | Extra nodes appended after the chips |
| `emptyText` | string | `"No tags"` | Shown when `tags` is empty |
| `className` | string \| string[] | — | Extra classes |

Tag shape: `{ label: string, color?: string (any CSS color), variant?:
"pill" | "soft" | "outlined" }`. Per-tag `variant`/`color` override container
flags/colors.

### flags

| Key | Default | Description |
|---|---|---|
| `pill` | `true` | Pill shape (fully rounded). `false` → rounded rectangles |
| `soft` | `false` | Soft filled background |
| `outlined` | `false` | Border only, no fill |
| `wrap` | `true` | Allow wrapping onto multiple lines |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `padding` | `"12px"` | Inner padding |
| `radius` | `"12px"` | Container corner radius |
| `gap` | `"6px"` | Gap between chips |
| `tagRadius` | `"999px"` | Chip corner radius (lower for squares) |
| `tagPadding` | `"4px 10px"` | Chip inner padding |
| `tagFontSize` | `"12px"` | Chip font size |

### colors (semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `background` | `#FFFFFF` | `#26262B` | Container fill |
| `border` | `#E4E4E7` | `#3F3F46` | Container border |
| `text` | `#18181B` | `#FAFAFA` | Chip label text |
| `accent` | `#18181B` | `#FAFAFA` | Chip fill/outline default |

### styles

`{ root, tags, tag, empty }`.

## Reactive properties

`.tags` — set a new array, re-renders the chips.

## Examples

```dataviewjs
// Simple list of tags
dv.container.appendChild(tessera.core.tags({
  tags: ["Obsidian", "Dataview", "Dashboard"],
}));
```

```dataviewjs
// From a note's frontmatter tags
const p = dv.page("Projects/MyApp");
dv.container.appendChild(tessera.core.tags({
  tags: (p.tags ?? []).map(t => String(t)),
}));
```

```dataviewjs
// Per-tag colors and variants mixed
dv.container.appendChild(tessera.core.tags({
  tags: [
    { label: "Urgent", variant: "soft", color: "#18181B" },
    { label: "Design", variant: "outlined" },
    { label: "Frontend", color: "#71717A" },
    "Backlog",
  ],
}));
```

```dataviewjs
// Squared chips, no pill
dv.container.appendChild(tessera.core.tags({
  tags: ["A", "B", "C"],
  flags: { pill: false },
  layout: { tagRadius: "6px" },
}));
```

```dataviewjs
// Wrapping off → single line
dv.container.appendChild(tessera.core.tags({
  tags: ["one", "two", "three", "four", "five"],
  flags: { wrap: false },
}));
```