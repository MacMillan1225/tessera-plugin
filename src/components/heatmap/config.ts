/**
 * Heatmap component default configuration
 * Single source of truth for all heatmap defaults
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
			text: "var(--text-muted)",
			tooltip: "#1C1C1A",
			tooltipBg: "#F0EFEB",
			levels: ["#fafaf9", "#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c", "#57534e", "#292524", "#1c1917"],
		},
		dark: {
			background: "#1c1917",
			text: "var(--text-muted)",
			tooltip: "#F0EFEB",
			tooltipBg: "#1C1C1A",
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