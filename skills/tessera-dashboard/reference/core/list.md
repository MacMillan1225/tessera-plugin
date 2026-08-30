# tessera.core.list

Bullet list with Lieflat styling: accent dots, optional right-aligned values,
restrained hover and divider modes. Ideal for milestones, todos, recent items,
key-value rows.

## API

```js
tessera.core.list(options)  // → ListInstance (an HTMLElement)
```

## Options

### Content

| Key | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<string \| {label, value?}>` | — | Rows. String → label only; object adds a right-aligned value |
| `children` | unknown | — | Extra nodes appended after the list |
| `emptyText` | string | `"No items"` | Shown when `items` is empty |
| `className` | string \| string[] | — | Extra classes |

Item shape: `{ label: string, value?: string | number }` — the value renders
right-aligned in mono, perfect for counts/status.

### flags

| Key | Default | Description |
|---|---|---|
| `showBullets` | `true` | Accent-colored bullet dots |
| `showDividers` | `false` | Hairline separators between rows |
| `showHover` | `true` | Subtle row background on hover |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Container width |
| `padding` | `"14px"` | Inner padding |
| `radius` | `"12px"` | Corner radius |
| `gap` | `"8px"` | Vertical gap between rows |
| `bulletSize` | `"5px"` | Bullet dot diameter |
| `indent` | `"20px"` | Text left indent (bullet → text) |

### colors (semantic keys)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `background` | `var(--background-secondary)` | same | Container fill |
| `border` | `transparent` | same | Container border |
| `text` | `var(--text-normal)` | same | Label text |
| `accent` | `var(--text-normal)` | same | Bullet dots (set for the pop of color) |

### styles

`{ root, list, item, bullet, label, value, empty }`.

## Reactive properties

`.items` — set a new array, re-renders the rows.

## Examples

```dataviewjs
// Plain list
dv.container.appendChild(tessera.core.list({
  items: ["Inbox zero", "Ship PR", "Exercise"],
}));
```

```dataviewjs
// Key-value rows (value right-aligned, mono)
dv.container.appendChild(tessera.core.list({
  items: [
    { label: "Notes", value: 128 },
    { label: "Tasks done", value: 42 },
    { label: "Streak days", value: 17 },
  ],
}));
```

```dataviewjs
// From a Dataview query, with status tags
const open = dv.pages('"Tasks"').where(t => t.status !== "done").limit(5);
dv.container.appendChild(tessera.core.list({
  items: open.map(t => ({ label: t.file.link, value: t.status })),
}));
```

```dataviewjs
// Milestone list with dividers and custom accent
dv.container.appendChild(tessera.core.list({
  items: [
    { label: "v1.0 released", value: "done" },
    { label: "v1.1 beta", value: "soon" },
    { label: "v2.0 planning", value: "todo" },
  ],
  flags: { showDividers: true },
  colors: { light: { accent: "#1C1C1A" }, dark: { accent: "#F0EFEB" } },
}));
```

```dataviewjs
// Reactive update
const list = tessera.core.list({ items: ["Loading..."] });
dv.container.appendChild(list);
list.items = ["Loaded", "Ready", "Go"];
```