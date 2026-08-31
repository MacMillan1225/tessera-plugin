---
name: tessera-dashboard
description: >-
  Build and maintain Obsidian dashboards with the TesseraScript plugin
  (dataview-powered). Use when the user wants a dashboard, kanban-style board,
  stats overview, habit/activity tracking, project progress, skill radar, tag
  cloud, or any composite panel built from tessera.core.* and tessera.chart.*
  components. Also use to MODIFY an existing dashboard, or to answer questions
  about hand-tuning dashboard code. ALWAYS INTERVIEW THE USER FIRST, present a
  text plan, get approval, THEN write any dataviewjs code.
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

## THE WORKFLOW — three phases, in exactly this order

**PHASE 0 — INTERVIEW. Ask before writing anything.**

Do not open reference files, do not sketch code. Ask the user, one question
at a time or as a short list:

1. **Purpose** — what is this dashboard for? (project tracking / habits /
   skills / stats overview / kanban board / life dashboard ...)
2. **Data** — which notes/folders feed it, and which frontmatter or inline
   fields exist? (e.g. `status:: done`, `tags`, a `progress` property,
   a `date` field). If the vault has no real data yet, say so and propose
   plausible sample data or empty-state handling.
3. **Layout style** — pick ONE of:
   - **Grid 对齐** — equal-ish cells in a neat grid (`grid-template-columns`),
     the safest default for stat rows and evenly sized panels.
   - **Flex 排版** — flexible rows/columns that wrap naturally, good for
     mixed-height content (a wide heatmap next to stacked small cards).
   - **瀑布流 / masonry** — staggered columns via `column-count` or CSS
     columns, for a Pinterest-like, varied-height look.
   Ask "grid、flex 还是瀑布流?" — and note the user may not know the jargon;
   describe them in one line each and let them pick by feel.
4. **Emoji** — does the user want emoji in titles / list rows / tags
   (e.g. "📈 趋势") or keep it text-only? Lieflat style is clean — offer emoji
   as an optional accent, default OFF unless they ask.
5. **Scope** — roughly how many modules (recommend 4–6 for one note) and
   single-block vs multi-block preference (default: ONE dataviewjs block,
   see Golden rule 8).

**PHASE 1 — PROPOSE. Write a text plan, get approval.**

Before any code, describe the dashboard in plain language, for example:

> 我的方案：顶部 4 个统计卡（grid 一排）→ 中部左侧宽热力图 + 右侧技能雷达
> （flex 两列，热力图占宽）→ 底部项目进度条 + 待办列表 + 标签云。纯文本
> 无 emoji，共 8 个模块，全部放一个 dataviewjs 代码块。数据来自
> `"Tasks"` 文件夹的 `status`/`due` 字段。

Then wait for explicit approval. If the user adjusts (more/less modules,
different layout, emoji on/off), update the plan and re-confirm. **Never
write code before the plan is approved.**

**PHASE 2 — BUILD. Only now open references and write code.**

1. Open the reference files ONLY for the modules in the approved plan
   (`reference/core/card.md`, `reference/chart/line.md`, ...). Never guess a
   parameter; never read specs for unused modules.
2. Write ONE dataviewjs block (Golden rule 8) with the approved layout.
3. Run it. Iterate on spacing/alignment/colors.

## Layout methodology

Components are ordinary elements; layout is plain CSS on `dv.container`.
**Default: everything in one dataviewjs block, arranged with rhythm — varied
sizes, not a wall of equal one-cell boxes.**

```dataviewjs
// Example: mixed grid — wide heatmap spans 2 columns, small cards fill gaps
dv.container.style.cssText = `
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
`;
const heat = tessera.core.heatmap({ data: {...} });
heat.style.gridColumn = "span 2";
const c1 = tessera.core.card({ title: "A", value: 1 });
const c2 = tessera.core.card({ title: "B", value: 2 });
dv.container.append(heat, c1, c2);
```

Layout styles by preference (asked in PHASE 0):

- **Grid 对齐** — `display: grid; grid-template-columns: repeat(auto-fit,
  minmax(240px, 1fr)); gap: 12px;` for even cells. For deliberate rhythm,
  use a 6- or 12-column grid and span big modules (`span 2` / `span 3`).
- **Flex 排版** — `display: flex; flex-wrap: wrap; gap: 12px;` with
  `flex: 1 1 240px` on small cards and `flex: 2 1 480px` on wide ones.
- **瀑布流** — `column-count: 2; column-gap: 12px;` with
  `break-inside: avoid` on each child (set via a wrapper class or inline
  `style.breakInside = "avoid"`).

Proven dashboard patterns (adapt, don't copy blindly):

- **Stat row** — 3–4 `card` modules side by side (title + meta + big value).
- **Two-column** — left: heatmap + progressbars; right: line chart + list.
- **Project page** — gauge (overall) + bar (phases) + list (milestones) + tags.
- **Skill page** — radar (self-assessment) + line (6-month trend) + tags.
- **Habit page** — heatmap (activity) + progressbar (streak target) + list.

Nesting: `card({ children: [innerComponent] })` composes panels inside panels.

## Modify & consult mode (维护/答疑)

The skill is not just for creating dashboards. For an EXISTING dashboard:

1. **Read the current code first** — ask for the note (or read the dataviewjs
   block the user points at) and understand what it renders before touching it.
2. **Ask what changed** — new data source? different layout? extra module?
   color accent? Then apply the same PHASE 0 questions only for the parts
   that changed (skip what's unchanged; don't re-interview the whole board).
3. **Patch, don't rewrite** — keep the user's structure, variables and data
   queries; change only what the request requires. Preserve their layout CSS
   unless they ask for a new layout style.
4. **Explain edits** — after modifying, briefly note what changed and why,
   so the user learns the API (they may hand-tune next).

For QUESTION-ANSWERING (user hand-tuning code themselves, treating you as a
docs robot):

- Answer against the reference files — quote the exact parameter, default
  value, or example. Never invent options.
- If the question is about a module you haven't read yet, read its reference
  file before answering.
- Short, copy-pasteable answers: the exact option shape + one minimal snippet.

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
  `levels`, gauge: `text / track / accent`).
- Light and dark themes are separate objects: `colors: { light: {...},
  dark: {...} }`. Flat overrides at `colors.<key>` apply to both.
- Defaults are monochrome (INK #18181B / PAPER #FFFFFF). Change `accent` to
  give a component its single pop of color. Restraint is the aesthetic —
  one accent per component, no gradients/glows.
- Fonts are managed by CSS variables `--ts-font-{ui,body,title,mono}` (CJK
  fallbacks included). Override in a snippet to theme globally.
- **Emoji** (only if the user asked for it): put emoji in card `title`/`meta`
  strings, list `label`s, tags `label`s, or a card's value prefix. Keep it to
  one emoji per heading — never inside chart data labels.

## Golden rules

1. Never invent parameters — read the module's reference file first.
2. Never wrap components in HTML you hand-write; append the element directly.
3. Guard every factory call when a component might be disabled:
   `if (tessera.core.card) { ... }`.
4. Respect 0..1 semantics: `progressbar.value` and `gauge.value` are ratios.
5. One accent per component. No alpha fades, no glow, no borders by default.
6. Keep it flat: prefer `colors: { light/dark }` over `styles` overrides.
7. Dataview date API is `dv.date()` (a function) — never `dv.date.today`.
8. **ONE dataviewjs block per dashboard** — all modules in a single block so
   they share scope, variables and layout. Never split into one-block-per-cell
   boxes (no rhythm, ugly). Only split when the user explicitly asks.
9. **Interview before code** — PHASE 0 questions first, text plan approved in
   PHASE 1, then write. For modifications, re-interview only the changed parts.
10. **Respect the approved plan** — don't add modules, change layout style,
    or enable emoji the user didn't agree to.

## Reference files

Read only the modules you use:

- core: `reference/core/card.md` · `reference/core/heatmap.md` ·
  `reference/core/progressbar.md` · `reference/core/list.md` ·
  `reference/core/tags.md`
- chart: `reference/chart/line.md` · `reference/chart/bar.md` ·
  `reference/chart/gauge.md` · `reference/chart/rose.md` ·
  `reference/chart/radar.md`

Full dashboard examples live in the plugin's `examples/DASHBOARDS.md`.