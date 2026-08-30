# TesseraScript 架构详解

本文档描述 TesseraScript 插件当前的内部架构（对应 v3 设置版本，含 chart 分组）。设计决策的动机见 [decisions/ADR-0001..0005](./decisions/)。

## 目录

1. [总体架构](#1-总体架构)
2. [Dataview 检测与全局对象](#2-dataview-检测与全局对象)
3. [命名空间系统](#3-命名空间系统)
4. [配置读取流程](#4-配置读取流程)
5. [默认配置与单一数据源](#5-默认配置与单一数据源)
6. [设置系统](#6-设置系统)
7. [图表分组与 ECharts 懒加载](#7-图表分组与-echarts-懒加载)
8. [主题适配机制](#8-主题适配机制)
9. [数据流总览](#9-数据流总览)
10. [关键代码位置索引](#10-关键代码位置索引)

---

## 1. 总体架构

```
Obsidian
└── tessera-plugin (本插件)
    ├── main.ts                     # 生命周期：onload / onunload
    │   ├── loadSettings()          # 版本门槛 + 深合并加载
    │   ├── Dataview 检测
    │   ├── tessera 全局对象构建    # core + chart 两个分组
    │   └── addCommand / addSettingTab
    ├── src/components/
    │   ├── card/                   # tessera.core.card
    │   ├── heatmap/                # tessera.core.heatmap
    │   ├── progressbar/            # tessera.core.progressbar
    │   └── chart/                  # tessera.chart.{line,bar,gauge,rose}
    │       ├── loader.ts           # ECharts 懒加载（<script> 注入）
    │       ├── shared.ts           # createChartBase 公共生命周期
    │       ├── config.ts           # 4 个图表默认配置（mono 色板）
    │       └── line/bar/gauge/rose.ts
    ├── src/settings/               # 设置系统（fields/types/settings-tab/i18n）
    ├── src/i18n/{en,ja,zh}.json
    ├── src/utils/dom.ts            # createElement 等 DOM 工具
    ├── lib/echarts.min.js          # ECharts UMD（懒加载资源，不入 bundle）
    └── styles.css                  # 组件样式（ts- 前缀）
```

DataviewJS 代码块在浏览器全局作用域运行，因此插件通过 `window.tessera` 暴露 API，无需 import。

## 2. Dataview 检测与全局对象

`main.ts` onload：

1. `loadSettings()`（见 §4）
2. 检测 Dataview：`(this.app as any).plugins?.plugins?.["dataview"]?.api`。缺失 → `new Notice("Dataview plugin is required...")` 并 `return`（不挂载 API）
3. 构建 `tessera` 对象并挂载 `(window as any).tessera = tessera`
4. `onunload` 删除 `window.tessera`

检测失败即退出是**硬依赖**设计：组件内部不再各自判断 Dataview 是否存在。

## 3. 命名空间系统

```typescript
interface TesseraAPI {
  version: string;
  core: {
    card:        ((options: CardOptions) => CardInstance) | undefined;
    heatmap:     ((options: HeatmapOptions) => HeatmapInstance) | undefined;
    progressbar: ((options: ProgressbarOptions) => ProgressbarInstance) | undefined;
  };
  chart: {
    line:  ((options: LineOptions) => LineInstance) | undefined;
    bar:   ((options: BarOptions) => BarInstance) | undefined;
    gauge: ((options: GaugeOptions) => GaugeInstance) | undefined;
    rose:  ((options: RoseOptions) => RoseInstance) | undefined;
  };
}
```

- **core**：基础组件（ADR-0003），受 `coreEnabled` 总开关控制
- **chart**：图表组件（ADR-0005），受 `chartEnabled` 总开关控制
- 组件禁用时对应字段为 `undefined`，调用会抛错；调用方应先判空（见 README）
- 组件工厂是**包装函数**：`(options) => component(mergeComponentConfig(settings.config, options))`，把设置面板的默认配置深合并进每次调用

## 4. 配置读取流程

### 4.1 优先级

```
调用时 options > 设置面板 config（组件默认配置）> 组件内部 DEFAULTS
```

实现：`main.ts` 的 `mergeComponentConfig(config, options)` 对 settings.config 与 options 做**深度合并**（nested 对象递归，数组/标量覆盖），修复了早期的浅合并 bug——用户传 `flags: { showLegend: true }` 不再清掉其余 flags。

### 4.2 加载与版本门槛

```typescript
async loadSettings() {
  const loaded = await this.loadData();
  if (!loaded || loaded.version !== DEFAULT_SETTINGS.version) {
    // 版本不匹配 → 重置默认并保存（早期阶段允许破坏性变更，ADR-0002）
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    await this.saveSettings();
    return;
  }
  // 逐组件：enabled ?? 默认；config 用 deepMerge(DEFAULT, loaded) 只存被改过的字段
}
```

- `data.json` 只存**被修改过的字段**（深合并保证）
- 每次 schema 变更必须递增 `PluginSettings.version`，否则用户旧配置被重置（当前 version = 3）

## 5. 默认配置与单一数据源

每个组件目录下 `config.ts` 导出 `XXX_DEFAULTS`（`as const`），是**单一数据源**：

```
config.ts（组件默认配置）
   ├── 组件 index.ts 引用（运行时默认值）
   ├── fields.ts 引用（设置面板字段的 placeholder/options）
   └── main.ts loadSettings 引用（DEFAULT_SETTINGS 的基底）
```

`src/settings/fields.ts` 中的 `DEFAULT_SETTINGS` 直接引用组件 DEFAULTS（而非复制），保证修改一处即可全链路生效。

### 统一语义键（ADR-0002）

所有组件颜色统一为 `background / border / text / accent`（图表另有 `grid / track / series`）：

| 组件 | light/dark 颜色键 |
|------|------------------|
| card | background, border, text, accent |
| heatmap | background, text, tooltip, tooltipBg, levels[] |
| progressbar | background, border, text, accent |
| chart.* | text, grid(line/bar), track(gauge), accent, series[](line/bar/rose) |

`utils/dom.ts` 的 `resolveThemeColors(colors, defaults)` 支持扁平共享键：`{ background }` 同时作用于 light/dark。

## 6. 设置系统

### 6.1 结构（ADR-0004 层级化）

```
Settings → TesseraScript
├── 核心组件 (core, coreEnabled 总开关)
│   ├── card        [enabled] ─ flags / layout / colors.light / colors.dark
│   ├── heatmap     [enabled] ─ …
│   └── progressbar [enabled] ─ …
└── 图表 (chart, chartEnabled 总开关)
    ├── line   [enabled] ─ …
    ├── bar    [enabled] ─ …
    ├── gauge  [enabled] ─ …
    └── rose   [enabled] ─ …
```

- `settings-tab.ts` 用 `renderGroup(containerEl, groupKey, enabledKey, descKey, componentKeys)` 泛化渲染两个分组（`GROUPS` 数组驱动）
- 分组折叠状态存 `collapsedSections` Set（key 为 "core"/"chart"/组件名）
- 字段按 dot-path 前缀分组：`flags.*` / `layout.*` / `settings.*`（heatmap）/ `colors.light.*` / `colors.dark.*`
- 每个字段右侧 ↺ 按钮恢复默认值（与 `DEFAULT_SETTINGS[component].config` 比较）
- 取色器**内嵌 alpha 滑杆**：alpha < 1 存 rgba，= 1 存 hex

### 6.2 渲染路径

统一单路径（弃用 Obsidian 1.13 双 API）：

```
display() → renderGroup×GROUPS → renderCollapsibleSection（组件） → renderFields（按前缀分组） → renderField（按 type 分发）
refreshSettings() → display()  // 修改后重渲染
```

`renderField` 支持 7 种类型：toggle / text / number / textarea / color / select / slider。

### 6.3 保存与重载

```
onChange → setNestedValue(config, key, value) → plugin.saveSettings() → showReloadButton()
重载按钮 → app.commands.executeCommandById("app:reload")
```

`getNestedValue` / `setNestedValue` 按 dot-path 读写嵌套对象（自动创建中间对象）。

### 6.4 i18n

- `src/i18n/{en,ja,zh}.json` 三语；`i18n.ts` 按 `moment.locale()` 匹配（exact → lang 前缀 → en fallback）
- 字段 label/tooltip/分组名均走翻译表，缺失时 fallback key 并 console.warn
- 新增字段必须同步三语（开发指南有 checklist）

## 7. 图表分组与 ECharts 懒加载

（ADR-0005 的落地实现）

### 7.1 懒加载链路

```
tessera.chart.line({...})
  → line() → createChartBase({...})
    → render() → await loadEcharts()          // 首次调用才加载
      → loader.ts: <script src=lib/echarts.min.js async>
      → window.echarts 全局 → echarts.init(canvas, null, { renderer: "svg" })
      → setOption(buildOption(theme), { notMerge: true })
```

- **URL 解析**：`main.ts getEchartsUrl()` 用 `app.vault.adapter.getResourcePath(pluginDir/lib/echarts.min.js)`，兼容任意 vault 位置
- **单例缓存**：`echartsPromise` 复用；`onerror` 时重置缓存允许重试
- **失败兜底**：加载失败时 `canvas.textContent = "Echarts failed to load"`
- **零成本**：chartEnabled 关闭时 `createChartGroup` 不挂任何工厂（只传 undefined），ECharts 完全不加载
- **不打进 bundle**：`import type` 只做类型引用，esbuild 擦除；`lib/echarts.min.js`（~1MB）从 node_modules 复制，由 `main.js` 运行时注入

### 7.2 公共生命周期（shared.ts createChartBase）

所有图表组件共享：

1. 创建 `div.ts-chart.ts-chart-<type>` 根元素 + `div.ts-chart__canvas` 宿主（显式高度）
2. `syncThemeClass()`：根元素带 theme-dark/light
3. `ResizeObserver` → `chart.resize()`
4. `MutationObserver`（body class）→ 主题切换时 `setOption(buildOption(theme), { notMerge: true })`
5. `render()` async：懒加载 ECharts → init → setOption
6. `destroy()`：断开 observers + `chart.dispose()`

实例统一暴露：`refresh()` / `destroy()` / `parts.canvas` / 响应式属性（data 或 value/label）。

### 7.3 各图表实现要点

| 组件 | 关键 option |
|------|-------------|
| line | series 多系列轮转色板；symbol circle 5、lineStyle width 2；area 时 opacity 0.08；x 轴无轴线刻度，y 轴 splitLine 用 grid 色 0.6 |
| bar | 单系列逐柱取色（chunky bars）+ `borderRadius [6,6,0,0]`；多系列分组柱；barMaxWidth 28 |
| gauge | startAngle 210/endAngle -30；progress 圆帽宽 14 accent；track 同宽；axisTick 10 等分；detail 30px/800 显示 `Math.round(p)%`；title 显示 label 或 `{remaining} TO GO` |
| rose | 三层 pie：底色盘（14%-92% 圆角16）→ roseType:"area" 花瓣（14%-88%，明度按 t>0.8/0.6/0.35 分档）→ 透明标签层（outside 标签 `name value`） |

tooltip 统一 `lieflatTooltip(theme)`：浅色纸底 `#F0EFEB`/墨字，暗色 `#1C1C1A`/纸字，圆角 12、无边框、柔和阴影。

## 8. 主题适配机制

所有组件（含图表）遵循同一套主题观察模式：

```typescript
// heatmap 模式（核心组件）
root.classList.toggle("theme-dark", document.body.classList.contains("theme-dark"));
new MutationObserver(syncThemeClass).observe(document.body, { attributes: true, attributeFilter: ["class"] });

// chart 模式（shared.ts）
const next = isDarkTheme() ? "dark" : "light";
if (next !== theme && chart) {
  theme = next;
  chart.setOption(options.buildOption(theme), { notMerge: true });
}
```

CSS 变量约定：`--ts-<component>-<key>-light/-dark` + `--ts-<component>-<key>-current`（由 `body.theme-light/dark` 选择器映射），根元素自身也带 `theme-*` class 供选择器定位。

## 9. 数据流总览

### 运行时渲染（DataviewJS）

```
用户写 dataviewjs → window.tessera.core.card({...})
  → 包装函数 mergeComponentConfig(settings.config, options)
  → card() 组件工厂（resolveThemeColors / 深合并默认配置）
  → 返回 HTMLElement & Instance（含 parts/响应式属性）
  → dv.container.appendChild(el)
```

### 设置修改

```
设置面板修改字段 → setNestedValue → saveSettings（data.json 只存改动）
  → 显示"应用并重载" → app:reload → onload → loadSettings（版本门槛 + 深合并）→ 重新挂载
```

## 10. 关键代码位置索引

| 关注点 | 文件 |
|--------|------|
| 生命周期/命名空间挂载 | `src/main.ts` |
| 版本门槛/深合并加载 | `src/main.ts` loadSettings / deepMerge |
| 组件默认配置（单一数据源） | `src/components/{card,heatmap,progressbar,chart}/config.ts` |
| DOM 工具/主题色合并 | `src/utils/dom.ts` |
| 设置字段定义 | `src/settings/fields.ts`（GROUPS / COMPONENTS / DEFAULT_SETTINGS） |
| 设置面板渲染 | `src/settings/settings-tab.ts` |
| 设置类型 | `src/settings/types.ts`（PluginSettings / TesseraAPI / SettingField） |
| i18n 加载/回退 | `src/settings/i18n.ts` + `src/i18n/{en,ja,zh}.json` |
| ECharts 懒加载 | `src/components/chart/loader.ts` |
| 图表公共生命周期 | `src/components/chart/shared.ts` |
| 组件样式 | `styles.css`（.ts- 前缀） |
| 设计决策 | `docs/decisions/ADR-0001..0005`、`glossary.md` |