---
name: tessera-dashboard
description: >-
  Build Obsidian dashboards with the TesseraScript plugin (dataview-powered).
  Use when the user wants a dashboard, kanban-style board, stats overview,
  habit/activity tracking, project progress, skill radar, tag cloud, or any
  composite panel built from tessera.core.* and tessera.chart.* components.
  READ THIS SKILL BEFORE WRITING ANY DATAVIEWJS CODE.
---

# TesseraScript Dashboard Builder

## What this is

TesseraScript is an Obsidian plugin that turns DataviewJS into beautiful,
Lieflat-styled dashboard components. Everything renders inside a
````markdown
```dataviewjs
```
````
block in any note. No HTML/CSS required — each component is a function that
returns an HTMLElement you append to `dv.container`.

```
const card = tessera.core.card({ title: "Stats", value: 42 });
dv.container.appendChild(card);
```

## Component inventory (10 modules)

Two groups. Every module is a factory on the global `tessera` object; the
group switch (`coreEnabled` / `chartEnabled`) and per-component `enabled`
toggles live in plugin settings. **A disabled component's API is `undefined`
— guard with a check or the note throws.**

### core — `tessera.core.*` (card / heatmap / progressbar / list / tags)

| Module | Factory | What it renders |
|---|---|---|
| card | `tessera.core.card(opts)` | Panel with header (title + meta), big value, body content |
| heatmap | `tessera.core.heatmap(opts)` | GitHub-style calendar heatmap (activity / habits) |
| progressbar | `tessera.core.progressbar(opts)` | Thin progress bar with optional % label |
| list | `tessera.core.list(opts)` | Bullet list; rows can carry right-aligned values |
| tags | `tessera.core.tags(opts)` | Auto-wrapping tag chips (pill / soft / outlined) |

### chart — `tessera.chart.*` (line / bar / gauge / rose / radar)

| Module | Factory | What it renders |
|---|---|---|
| line | `tessera.chart.line(opts)` | Line / area chart, single or multi series |
| bar | `tessera.chart.bar(opts)` | Chunky rounded-top column chart |
| gauge | `tessera.chart.gauge(opts)` | 210° dial gauge with big % readout |
| rose | `tessera.chart.rose(opts)` | Petal rose (nightingale) chart for part-to-whole |
| radar | `tessera.chart.radar(opts)` | 6-dimensional radar / skill matrix |

> Chart components lazy-load ECharts (lib/echarts.min.js) on first use. If
> charts render blank, the file is missing or the vault can't resolve it.

## THE WORKFLOW — read in exactly this order

**STEP 1 — Plan first, read second. Do NOT open reference files yet.**

1. Ask what data the user already has: which notes/folders, which frontmatter
   or inline fields (e.g. `status:: done`, `tags`, a `progress` property).
2. Decide which modules fit (max 4–6 per dashboard — restraint is the style).
3. Sketch the layout: a CSS grid on the container, one slot per module.
4. Decide each module's data source: reactive property vs static array vs
   `getData` callback (see reference files for per-module data inputs).
5. **Only now** open the reference files for the modules you actually chose
   (`reference/core/card.md`, `reference/chart/line.md`, ...). Read only those.
6. Write the dataviewjs block. Run it. Iterate.

This order keeps context small: you never read specs for modules you don't
use. If a module's file is not open yet, read it — never guess a parameter.

## Layout methodology

TesseraScript components are ordinary elements; layout is plain CSS on
`dv.container` via `.style` or a class:

```dataviewjs
// Two-column dashboard, cards equal width
dv.container.style.cssText = `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
`;

dv.container.appendChild(tessera.core.card({ title: "Left", value: 1 }));
dv.container.appendChild(tessera.core.card({ title: "Right", value: 2 }));
```

Patterns that work well:

- **Stat row** — 3–4 `card` modules side by side (title + meta + big value).
- **Two-column** — left: heatmap + progressbars; right: line chart + list.
- **Project page** — gauge (overall) + bar (phases) + list (milestones) + tags.
- **Skill page** — radar (self-assessment) + line (6-month trend) + tags.
- **Habit page** — heatmap (activity) + progressbar (streak target) + list.

Nesting: `card({ children: [innerComponent] })` composes panels inside panels.

## Data acquisition

Dataview queries run inside the same block. Common patterns:

```dataviewjs
// Frontmatter-property aggregation
const pages = dv.pages('"Projects"');
const done = pages.where(p => p.status === "done").length;

// Group by a date field, keyed YYYY-MM-DD for heatmap
const byDay = pages.groupBy(p => dv.date(p.date).toFormat("yyyy-MM-dd"));
```

Dataview's own components (`dv.el`, `dv.paragraph`, `dv.table`) can mix with
TesseraScript ones. `dv.container.appendChild(...)` mounts everything.

## Reactive updates

Most instances expose reactive properties — set them after creation and the
component re-renders itself:

```dataviewjs
const bar = tessera.chart.bar({ data: { labels: ["A"], values: [3] } });
dv.container.appendChild(bar);
bar.data = { labels: ["A", "B"], values: [3, 7] }; // re-renders
```

Reactive properties per module: card `.title/.meta/.value/.content`,
heatmap `.data/.startDate/.endDate`, progressbar `.value`, list `.items`,
tags `.tags`, line/bar `.data`, gauge `.value/.label`, rose `.data`,
radar `.data/.max`. See each reference file for exact shapes.

## Style system (Lieflat)

- Semantic color keys shared across modules: `background / border / text /
  accent` (chart modules: `text / grid / accent / series`, heatmap adds
  `tooltip / tooltipBg / levels`, gauge: `text / track / accent`).
- Light and dark themes are separate objects: `colors: { light: {...},
  dark: {...} }`. Flat overrides at `colors.<key>` apply to both.
- Defaults are monochrome (INK #1C1C1A / PAPER #F0EFEB). Change `accent` to
  give a component its single pop of color. Restraint is the aesthetic —
  one accent per component, no gradients/glows.
- Fonts are managed by CSS variables `--ts-font-{ui,body,title,mono}` (CJK
  fallbacks included). Override in a snippet to theme globally.

## Golden rules

1. Never invent parameters — read the module's reference file first.
2. Never wrap components in HTML you hand-write; append the element directly.
3. Guard every factory call when a component might be disabled:
   `if (tessera.core.card) { ... }`.
4. Respect 0..1 semantics: `progressbar.value` and `gauge.value` are ratios.
5. One accent per component. No alpha fades, no glow, no borders by default.
6. Keep it flat: prefer `colors: { light/dark }` over `styles` overrides.
7. Dataview date API is `dv.date()` (a function) — never `dv.date.today`.

## Reference files

Read only the modules you use:

- core: `reference/core/card.md` · `reference/core/heatmap.md` ·
  `reference/core/progressbar.md` · `reference/core/list.md` ·
  `reference/core/tags.md`
- chart: `reference/chart/line.md` · `reference/chart/bar.md` ·
  `reference/chart/gauge.md` · `reference/chart/rose.md` ·
  `reference/chart/radar.md`

Full dashboard examples live in the plugin's `examples/DASHBOARDS.md`.