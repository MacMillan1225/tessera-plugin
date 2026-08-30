# TesseraScript 组件开发指南

本文档说明如何为 TesseraScript 添加新组件（或修改现有组件），覆盖从零创建到注册、i18n、构建验证的全流程。适用前提：通读 [ARCHITECTURE.md](./ARCHITECTURE.md) 与 [decisions/ADR-0001..0005](./decisions/)。

## 目录

1. [组件目录结构](#1-组件目录结构)
2. [从零创建新组件（core 分组）](#2-从零创建新组件core-分组)
3. [注册到设置系统](#3-注册到设置系统)
4. [添加 i18n 翻译](#4-添加-i18n-翻译)
5. [创建图表组件（chart 分组）](#5-创建图表组件chart-分组)
6. [修改现有组件](#6-修改现有组件)
7. [字段类型参考](#7-字段类型参考)
8. [最佳实践](#8-最佳实践)
9. [检查清单](#9-检查清单)

---

## 1. 组件目录结构

每个组件一个目录，统一约定：

```
src/components/<name>/
├── config.ts    # 默认配置（单一数据源，as const）
├── index.ts     # 组件工厂函数 + Options/Instance 类型
└── style.css    # （可选）组件专用样式——当前全部集中在 styles.css
```

- 样式约定当前是**集中式**：组件样式统一写在根目录 `styles.css`（`.ts-` 前缀），组件目录内不再放 style.css。如需恢复独立样式文件需先讨论（当前无样式注入机制）。
- 命名：目录/工厂函数/类型 kebab-case → camelCase（`progressbar`、`heatmap`），class 前缀 `ts-`，CSS 变量 `--ts-<name>-*`。

## 2. 从零创建新组件（core 分组）

以创建 `badge`（徽章）组件为例。

### 步骤 1：创建 config.ts（默认配置）

```typescript
// src/components/badge/config.ts
export const BADGE_DEFAULTS = {
	text: "",
	flags: {
		showIcon: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "4px 10px",
		radius: "999px",
	},
	colors: {
		light: {
			background: "#F0EFEB",
			border: "transparent",
			text: "#1C1C1A",
			accent: "#1C1C1A",
		},
		dark: {
			background: "#2E2D29",
			border: "transparent",
			text: "#F0EFEB",
			accent: "#F0EFEB",
		},
	},
} as const;
```

要点：
- **统一语义键**（ADR-0002）：颜色键必须是 `background / border / text / accent`（需要额外键时先讨论，如 heatmap 的 tooltip/levels）
- `as const` 保证类型精确
- 默认值即 Lieflat mono 风格（见 ADR-0001）：无边框靠背景色差、克制色

### 步骤 2：创建 index.ts（组件工厂）

```typescript
// src/components/badge/index.ts
import { createElement } from "../../utils/dom";
import { BADGE_DEFAULTS } from "./config";

// ---------- Types ----------
export interface BadgeOptions {
	text?: string;
	flags?: { showIcon?: boolean };
	layout?: { maxWidth?: string; padding?: string; radius?: string };
	colors?: {
		light?: { background?: string; border?: string; text?: string; accent?: string };
		dark?: { background?: string; border?: string; text?: string; accent?: string };
	};
	className?: string | string[];
}

export interface BadgeInstance extends HTMLElement {
	text: string;                 // 响应式属性：赋值自动刷新
	refresh: () => void;
	destroy: () => void;
	parts: { body: HTMLElement };
}

// ---------- Component ----------
export function badge(options: BadgeOptions = {}): BadgeInstance {
	// 1. 合并默认配置（与 heatmap/progressbar 同款三段合并）
	const flags = { ...BADGE_DEFAULTS.flags, ...options.flags };
	const layout = { ...BADGE_DEFAULTS.layout, ...options.layout };
	const colors = {
		light: { ...BADGE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...BADGE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	// 2. 构建 DOM（createElement 工具，见 utils/dom.ts）
	const body = createElement("span", { className: "ts-badge__body", text: options.text ?? BADGE_DEFAULTS.text });
	const root = createElement("span", {
		className: ["ts-badge", options.className].filter(Boolean).join(" "),
		style: {
			maxWidth: layout.maxWidth,
			padding: layout.padding,
			borderRadius: layout.radius,
			"--ts-badge-bg-light": colors.light.background,
			"--ts-badge-bg-dark": colors.dark.background,
			// ... border/text/accent 同款
		},
		children: [body],
	});

	// 3. 主题 class 同步（所有组件统一模式）
	const syncThemeClass = () => {
		root.classList.toggle("theme-dark", document.body.classList.contains("theme-dark"));
		root.classList.toggle("theme-light", !document.body.classList.contains("theme-dark"));
	};
	syncThemeClass();
	const themeObserver = new MutationObserver(syncThemeClass);
	themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

	// 4. 暴露实例（响应式属性）
	const instance = root as unknown as BadgeInstance;
	let _text = options.text ?? BADGE_DEFAULTS.text;
	Object.defineProperty(instance, "text", {
		get: () => _text,
		set(v: string) { _text = v; body.textContent = v; },
		enumerable: true, configurable: true,
	});
	instance.refresh = () => { body.textContent = _text; };
	instance.destroy = () => themeObserver.disconnect();
	instance.parts = { body };

	return instance;
}
```

要点：
- 组件工厂返回 `HTMLElement` 子类型实例（可直接 appendChild 到容器）
- 响应式属性用 `Object.defineProperty`（card/heatmap/progressbar 同款）
- 主题观察器在 `destroy()` 中断开，避免泄漏
- `createElement` 支持 `className`（string|string[]）、`style`（含 `--` CSS 变量）、`attrs`、`text`、`children`（自动 flat、跳过 null）

### 步骤 3：添加样式（styles.css）

```css
/* styles.css 末尾追加 */
.ts-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-family: var(--font-interface);
	font-size: 12px;
	font-weight: 600;
	background: var(--ts-badge-bg-current, var(--background-secondary));
	color: var(--ts-badge-text-current, var(--text-normal));
}

body.theme-light .ts-badge { --ts-badge-bg-current: var(--ts-badge-bg-light); --ts-badge-text-current: var(--ts-badge-text-light); }
body.theme-dark  .ts-badge { --ts-badge-bg-current: var(--ts-badge-bg-dark);  --ts-badge-text-current: var(--ts-badge-text-dark); }
```

变量约定：`--ts-<name>-<key>-light/-dark`（由 JS 注入具体色值）+ `--ts-<name>-<key>-current`（CSS 内由 theme 选择器映射）。这是全部核心组件的统一模式（见 styles.css 中 .ts-card/.ts-heatmap/.ts-progressbar）。

## 3. 注册到设置系统

### 步骤 1：更新类型（src/settings/types.ts）

```typescript
export type ComponentKey = "card" | "heatmap" | "progressbar" | "line" | "bar" | "gauge" | "rose" | "badge";
// PluginSettings 加：
badge: ComponentConfig;
// Translations.components 加：
badge: { name: string; desc: string };
// TesseraAPI.core 加：
badge: ((options: BadgeOptions) => BadgeInstance) | undefined;
```

### 步骤 2：注册字段（src/settings/fields.ts）

```typescript
import { BADGE_DEFAULTS } from "../components/badge/config";

COMPONENTS.badge = {
	componentKey: "badge",
	fields: [
		{ key: "text", type: "text", placeholder: "NEW" },
		{ key: "flags.showIcon", type: "toggle" },
		{ key: "layout.maxWidth", type: "text", placeholder: "100%" },
		{ key: "colors.light.background", type: "color" },
		{ key: "colors.dark.background", type: "color" },
		// ... 其余颜色字段
	],
};

DEFAULT_SETTINGS.badge = { enabled: true, config: { ...BADGE_DEFAULTS } };
// 同时把 "badge" 加入 COMPONENTS 所在分组的 GROUPS 数组（core 组）
```

### 步骤 3：在 main.ts 中注册（core 分组）

```typescript
import { badge } from "./components/badge/index";

// tessera.core 加：
badge: coreEnabled && this.settings.badge.enabled
	? (options) => badge(this.mergeComponentConfig(this.settings.badge.config, options))
	: undefined,

// loadSettings 加：
badge: {
	enabled: loaded.badge?.enabled ?? DEFAULT_SETTINGS.badge.enabled,
	config: this.deepMerge(DEFAULT_SETTINGS.badge.config, loaded.badge?.config),
},

// check-status 命令列表加：
this.settings.badge.enabled ? "core.badge" : null,
```

### 步骤 4：同步 global.d.ts

`types/global.d.ts` 中 Window.tessera 类型同步（保持与 settings/types.ts 一致）。

## 4. 添加 i18n 翻译

`src/i18n/{en,ja,zh}.json` 三个文件都必须加：

```json
{
  "components": { "badge": { "name": "徽章", "desc": "短标签徽章" } },
  "fields": {
    "badge.text": "文本",
    "badge.flags.showIcon": "显示图标",
    "badge.colors.light.background": "背景色（亮色）"
  },
  "tooltips": { "badge.text": "徽章显示的文字", "badge.flags.showIcon": "是否显示图标" }
}
```

- 字段 key 用 dot-path（`<component>.<fieldKey>`）
- tooltip 前缀是 `tooltip.<component>.<fieldKey>`
- 缺失翻译时 i18n.ts 会 console.warn（fallback key），开发时应清零警告（见检查清单）

## 5. 创建图表组件（chart 分组）

图表组件复用 ECharts 懒加载基础设施，比 core 组件少很多样板。以新增 `pie`（饼图）为例：

### 步骤 1：创建组件（src/components/chart/pie.ts）

```typescript
import type { EChartsOption } from "echarts";
import { PIE_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartData, type ChartColors } from "./shared";

export interface PieOptions {
	data?: ChartData;
	flags?: { showLegend?: boolean; showTooltip?: boolean };
	layout?: { maxWidth?: string; height?: string };
	colors?: ChartColors;
	className?: string | string[];
}
export interface PieInstance extends HTMLElement {
	data: ChartData;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

function buildPieOption(data: ChartData, flags: NonNullable<PieOptions["flags"]>, colors: Record<string, string | string[]>, theme: "light" | "dark"): EChartsOption {
	const text = colors.text as string;
	const seriesColors = (colors.series as string[]) || [colors.accent as string];
	return {
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip: flags.showTooltip === false ? undefined : { ...lieflatTooltip(theme), trigger: "item" },
		legend: flags.showLegend ? { bottom: 0, textStyle: { color: text, fontSize: 11 }, itemWidth: 10, itemHeight: 10 } : undefined,
		series: [{
			type: "pie",
			radius: ["40%", "70%"],
			itemStyle: { borderRadius: 8, borderColor: theme === "dark" ? "#1C1C1A" : "#F0EFEB", borderWidth: 3 },
			data: data.labels.map((label, i) => ({
				name: label,
				value: data.values[i] ?? 0,
				itemStyle: { color: seriesColors[i % seriesColors.length] },
			})),
		}],
	};
}

export function pie(options: PieOptions = {}): PieInstance {
	const flags = { ...PIE_DEFAULTS.flags, ...options.flags };
	const layout = { ...PIE_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...PIE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...PIE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};
	let _data = options.data ?? { labels: [], values: [] };
	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-pie", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildPieOption(_data, flags, chartThemeColors(colors, theme), theme),
	}) as unknown as PieInstance;
	Object.defineProperty(instance, "data", {
		get: () => _data,
		set(v: ChartData) { _data = v; void instance.refresh(); },
		enumerable: true, configurable: true,
	});
	return instance;
}
```

要点：
- `createChartBase` 已处理懒加载/init/resize/主题切换/destroy——**不要再自己写** observer 逻辑
- `buildOption(theme)` 根据主题返回完整 ECharts option，用 `chartThemeColors(colors, theme)` 取当前主题色
- tooltip 统一用 `lieflatTooltip(theme)`（纸底墨字、圆角12）
- 数据键名遵循 `ChartData { labels, values, series? }`

### 步骤 2：注册（与 core 组件类似，但走 chart 分组）

1. `chart/config.ts` 加 `PIE_DEFAULTS`（沿用 mono 色板 `LIGHT_SERIES`/`DARK_SERIES`）
2. `chart/index.ts`：`ChartGroup` 接口加 `pie`；`createChartGroup` 加 `pieEnabled` 参数并挂工厂
3. `settings/types.ts`：ComponentKey 加 "pie"；TesseraAPI.chart 加 pie
4. `settings/fields.ts`：COMPONENTS.pie + DEFAULT_SETTINGS.pie + GROUPS 的 chart 组数组加 "pie"
5. `main.ts`：`createChartGroup({ ..., pieEnabled: this.settings.pie.enabled })`；loadSettings 加 pie；check-status 加 "chart.pie"
6. i18n 三语 + styles.css（`.ts-chart-pie` 无需额外样式，共享 `.ts-chart`/`.ts-chart__canvas`）

## 6. 修改现有组件

### 场景 1：添加新配置字段

1. `config.ts`：加默认值（语义键约定内）
2. `index.ts`：Options 接口加字段 → 合并逻辑加 `...options.X` → 消费处使用
3. `fields.ts`：加 `SettingField`（dot-path）
4. i18n 三语加 field + tooltip
5. 若影响渲染 → 同步 styles.css 变量

> ⚠️ `PluginSettings.version` 是否需要递增？只有**破坏性变更**（删除/重命名字段、改语义）才需要。新增字段深合并自动兼容，无需递增。

### 场景 2：修改字段类型或分组

改 `fields.ts` 中的 `type`/`key` 即可；渲染器（settings-tab.ts renderField）已覆盖 7 种类型。改 key 属于破坏性变更 → 递增 version。

## 7. 字段类型参考

| type | SettingField 附加 | 渲染 |
|------|-------------------|------|
| `toggle` | — | 开关 |
| `text` | `placeholder` | 单行输入 |
| `number` | `placeholder` | 数字输入 |
| `textarea` | `placeholder` | 多行输入 |
| `color` | — | 取色器 + alpha 滑杆（alpha<1 存 rgba） |
| `select` | `options: {value,label}[]` | 下拉 |
| `slider` | `min`, `max`, `step` | 滑杆 |

字段 key 是 config 中的 dot-path：`flags.showHeader`、`colors.light.background`、`settings.rangeMode`。分组渲染按 key 前缀自动归组（flags/layout/settings/colors.light/colors.dark）。

## 8. 最佳实践

### 1. 命名规范
- 组件目录/函数：camelCase（`progressbar`）；class：`ts-<name>`；CSS 变量：`--ts-<name>-<key>`
- class 修饰符：`--`（如 `.ts-progressbar--striped`）；内部块：`__`（如 `.ts-card__header`）
- 命令 ID 稳定；组件 API 一经发布不改（ADR-0003 只允许在开发期破坏）

### 2. 颜色处理
- 必须用语义键 `background/border/text/accent`（ADR-0002），禁止硬编码组件独有键名
- 深浅主题都提供默认值；扁平共享键经 `resolveThemeColors` 同时作用于两主题
- 风格默认值参考 Lieflat mono：浅 `#F0EFEB` 底/`#1C1C1A` 墨，暗 `#1C1C1A` 底/`#F0EFEB` 墨（ADR-0001）

### 3. 配置优先级
调用 options > 设置 config > 组件 DEFAULTS（main.ts 深合并实现）。组件内用**三段合并**（flags/layout/colors 分别 `{...DEFAULTS.X, ...options.X}`），colors 分 light/dark 再合并。

### 4. 字段设计原则
- 只暴露**值得让用户改**的字段（极简路线，ADR-0002）
- flags（布尔开关）归 flags、尺寸归 layout、颜色归 colors.*、特殊配置归 settings
- placeholder 给合理默认示例（如 `0.5`）

### 5. i18n 完整性
- 新增任何用户可见字符串（组件名/字段/tooltip/分组名）必须三语同步
- `en` 是 fallback 语言，缺失时 console.warn——保持零警告

### 6. 性能
- 图表组件**必须**走 `createChartBase`（懒加载）；不要 import echarts 运行时进 bundle
- 主题/尺寸观察器一律在 destroy() 断开
- 响应式属性赋值应轻量（直接更新 DOM 或触发 refresh），避免全量重渲染

## 9. 检查清单

提交前逐项确认：

- [ ] `npm run build` 通过（tsc 无错误 + esbuild 产出 main.js）
- [ ] `npm run lint` 通过（eslint-plugin-obsidianmd 零警告）
- [ ] 三种语言（en/ja/zh）i18n 齐全，无 console.warn
- [ ] 组件在 DataviewJS 中可用：`tessera.<group>.<name>` 返回 HTMLElement
- [ ] 深浅主题切换正常，无残留样式
- [ ] 设置面板：字段分组正确、↺ 恢复默认值有效、修改后重载生效
- [ ] `data.json` 只存被修改字段（版本门槛不误触发）
- [ ] `git commit`（若属破坏性变更，同步递增 PluginSettings.version）