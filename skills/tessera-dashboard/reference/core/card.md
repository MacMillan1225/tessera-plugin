# tessera.core.card

General-purpose panel with header (title + meta), big value, and body content.
The workhorse of any dashboard — stat cards, section headers, composed panels.

## API

```js
tessera.core.card(options)  // → CardInstance (an HTMLElement)
```

## Options

### Content

| Key | Type | Default | Description |
|---|---|---|---|
| `title` | string | — | Header title text |
| `meta` | string | — | Header meta text (right side, typically uppercase label) |
| `value` | string \| number \| HTMLElement | — | Big emphasized value under the header |
| `content` | unknown | — | Body content: string, number, or HTMLElement |
| `children` | unknown | — | Extra body nodes appended after content (compose panels!) |
| `emptyText` | string | `"No content"` | Text shown when body is empty |
| `className` | string \| string[] | — | Extra CSS classes on the card root |

### flags

| Key | Default | Description |
|---|---|---|
| `showHeader` | `true` | Show the header row |
| `showHeaderSep` | `true` | Hairline separator under header |
| `showTitle` | `true` | Show title text |
| `showMeta` | `true` | Show meta text |
| `showValue` | `true` | Show the big value |

### layout

| Key | Default | Description |
|---|---|---|
| `maxWidth` | `"100%"` | Max card width |
| `padding` | `"16px"` | Inner padding |
| `radius` | `"14px"` | Corner radius |
| `gap` | `"14px"` | Header↔body gap |
| `bodyGap` | `"12px"` | Gap between body items |

### colors (semantic keys — Lieflat)

| Key | Light default | Dark default | Role |
|---|---|---|---|
| `background` | `#F0EFEB` | `#1C1C1A` | Card fill (no border by default) |
| `border` | `transparent` | same | Card border |
| `text` | `#1C1C1A` | `#F0EFEB` | Default text color |
| `accent` | `#1C1C1A` | `#F0EFEB` | Value color + hover accent |

Structure: `colors: { light: {...}, dark: {...} }`. Flat `colors.background`
etc. overrides both themes. Defaults are monochrome; set `accent` for the
single pop of color.

### styles

Optional per-part CSS overrides: `{ card, header, title, meta, body, value,
empty }` — each a `Record<string, string>` of CSS properties.

## Reactive properties (set after creation)

| Property | Accepts | Effect |
|---|---|---|
| `.title` | string \| HTMLElement | Re-renders header title |
| `.meta` | string \| HTMLElement | Re-renders meta |
| `.value` | unknown | Re-renders the big value |
| `.content` | unknown | Re-renders body content |

Note: the native `HTMLElement.title` tooltip is overridden — use
`element.setAttribute("title", ...)` for tooltips.

## Examples

```dataviewjs
// Stat card
dv.container.appendChild(tessera.core.card({
  title: "Total Notes",
  meta: "VAULT",
  value: dv.pages().length,
}));
```

```dataviewjs
// Composed panel: card wrapping a list + a progressbar
const card = tessera.core.card({
  title: "Today",
  meta: "FOCUS",
  children: [
    tessera.core.list({ items: ["Inbox zero", "Ship PR", "Exercise"] }),
    tessera.core.progressbar({ value: 0.66, labelFormat: "{value}% done" }),
  ],
});
dv.container.appendChild(card);
```

```dataviewjs
// Reactive: refresh the value from a query result later
const c = tessera.core.card({ title: "Tasks", value: 0 });
dv.container.appendChild(c);
c.value = dv.pages('"Tasks"').where(p => p.status === "done").length;
```

```dataviewjs
// Accent color + custom radius
dv.container.appendChild(tessera.core.card({
  title: "Sprint",
  meta: "WEEK 34",
  value: "68%",
  colors: { light: { accent: "#1C1C1A" }, dark: { accent: "#F0EFEB" } },
  layout: { radius: "16px" },
}));
```