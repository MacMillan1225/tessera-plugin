/**
 * Core component default configurations
 * Single source of truth for all core component defaults
 *
 * Semantic color keys (ADR-0002): background / border / text / accent
 * Lieflat style (ADR-0001): flat, no alpha, monochrome default + configurable accent
 */

export const CARD_DEFAULTS = {
	flags: {
		showHeader: true,
		showHeaderSep: true,
		showTitle: true,
		showMeta: true,
		showValue: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "16px",
		radius: "14px",
		gap: "14px",
		bodyGap: "12px",
	},
	colors: {
		light: {
			background: "#F0EFEB",
			border: "transparent",
			text: "#1C1C1A",
			accent: "#1C1C1A",
		},
		dark: {
			background: "#1C1C1A",
			border: "transparent",
			text: "#F0EFEB",
			accent: "#F0EFEB",
		},
	},
} as const;

export type CardConfig = typeof CARD_DEFAULTS;

/**
 * Heatmap component default configuration
 *
 * Semantic color keys (ADR-0002): background / text / tooltip / tooltipBg + levels (gradient)
 * Lieflat style (ADR-0001): monochrome gray gradient, flat
 */

export const HEATMAP_DEFAULTS = {
	flags: {
		showWeekLabels: true,
		showMonthLabels: true,
		showLegend: true,
		showTooltip: true,
		mondayFirst: true,
	},
	settings: {
		rangeMode: "adaptive" as "adaptive" | "fixed" | "year",
		minWeeks: 12,
		fixedDays: 84,
		locale: "zh-CN",
		monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		weekLabels: ["一", "", "三", "", "五", "", "日"],
		legend: "少 $#e7e5e4$$#a8a29e$$#57534e$$#1c1917$ 多",
		tooltipId: "ts-heatmap-tooltip",
	},
	layout: {
		maxWidth: "100%",
		cellSize: 11,
		cellGap: 2,
		cellRadius: "3px",
		weekLabelWidth: "auto",
		weekLabelGap: "9px",
		monthLabelHeight: "18px",
		monthOffset: "28px",
		gridTopOffset: "4px",
		monthLabelSize: "9px",
		weekLabelSize: "9px",
		legendGap: "3px",
		legendTop: "6px",
		legendSwatchSize: "9px",
	},
	colors: {
		light: {
			background: "#fafaf9",
			text: "#8F8E88",
			levels: ["#fafaf9", "#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c", "#57534e", "#292524", "#1c1917"],
		},
		dark: {
			background: "#1c1917",
			text: "#8F8E88",
			levels: ["#1c1917", "#292524", "#44403c", "#57534e", "#78716c", "#a8a29e", "#d6d3d1", "#e7e5e4", "#fafaf9"],
		},
	},
	styles: {
		root: null,
		months: null,
		weeks: null,
		grid: null,
		legend: null,
	},
};

export type HeatmapConfig = typeof HEATMAP_DEFAULTS;

/**
 * Progressbar component default configuration
 *
 * Semantic color keys (ADR-0002): background (track) / border / text (label) / accent (fill)
 * Lieflat style (ADR-0001): flat, no glow/shadow/gradient, monochrome default + configurable accent
 */

export const PROGRESSBAR_DEFAULTS = {
	/** Progress value as a ratio 0..1 (e.g. 0.5 = 50%). */
	value: 0,
	/** Label template. {value} = integer percent (50), {raw} = raw ratio (0.5). */
	labelFormat: "{value}%",
	flags: {
		showLabel: true,
		showStriped: false,
		showAnimated: false,
	},
	layout: {
		width: "100%",
		height: "8px",
		radius: "4px",
	},
	colors: {
		light: {
			background: "#e7e5e4",
			border: "transparent",
			text: "#1C1C1A",
			accent: "#1C1C1A",
		},
		dark: {
			background: "#44403c",
			border: "transparent",
			text: "#F0EFEB",
			accent: "#F0EFEB",
		},
	},
} as const;

export type ProgressbarConfig = typeof PROGRESSBAR_DEFAULTS;

/**
 * List component default configuration
 *
 * Semantic color keys (ADR-0002): background / border / text / accent
 * Lieflat style (ADR-0001): flat, no alpha, monochrome default + configurable accent
 */

export const LIST_DEFAULTS = {
	flags: {
		showBullets: true,
		showDividers: false,
		showHover: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "14px",
		radius: "12px",
		gap: "8px",
		bulletSize: "5px",
		indent: "20px",
	},
	colors: {
		light: {
			background: "#F0EFEB",
			border: "transparent",
			text: "#1C1C1A",
			accent: "#1C1C1A",
		},
		dark: {
			background: "#1C1C1A",
			border: "transparent",
			text: "#F0EFEB",
			accent: "#F0EFEB",
		},
	},
} as const;

export type ListConfig = typeof LIST_DEFAULTS;

/**
 * Tags component default configuration
 *
 * Semantic color keys (ADR-0002): background / border / text / accent
 * Lieflat style (ADR-0001): flat, no alpha, monochrome default + configurable accent
 */

export const TAGS_DEFAULTS = {
	flags: {
		/** Pill-shaped tags (fully rounded) vs. rounded rectangles. */
		pill: true,
		/** Soft filled background (Lieflat "soft" variant). */
		soft: false,
		/** Outlined tags (border only, no fill). */
		outlined: false,
		/** Allow tags to wrap onto multiple lines. */
		wrap: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "12px",
		radius: "12px",
		gap: "6px",
		tagRadius: "999px",
		tagPadding: "4px 10px",
		tagFontSize: "12px",
	},
	colors: {
		light: {
			background: "#F0EFEB",
			border: "transparent",
			text: "#1C1C1A",
			accent: "#1C1C1A",
		},
		dark: {
			background: "#1C1C1A",
			border: "transparent",
			text: "#F0EFEB",
			accent: "#F0EFEB",
		},
	},
} as const;

export type TagsConfig = typeof TAGS_DEFAULTS;