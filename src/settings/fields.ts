/**
 * Component field definitions for settings UI
 */

import type { ComponentDefinition, PluginSettings } from "./types";

/**
 * Component settings definitions
 * -----------------------------------------------
 * To add a new field, simply add it to the appropriate component's `fields` array.
 * To add a new component, add a new entry to COMPONENTS.
 * 
 * Field types: "toggle", "text", "number", "textarea", "color", "select", "slider"
 * Key format: dot-notation path (e.g., "flags.showHeader", "layout.padding")
 * Labels are automatically translated via i18n
 */
export const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
	card: {
		componentKey: "card",
		fields: [
			// Flags
			{ key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" },
			{ key: "flags.headerSep", type: "toggle", description: "tooltip.flags.headerSep" },
			{ key: "flags.showTitle", type: "toggle", description: "tooltip.flags.showTitle" },
			{ key: "flags.showMeta", type: "toggle", description: "tooltip.flags.showMeta" },
			{ key: "flags.showValue", type: "toggle", description: "tooltip.flags.showValue" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.gap", type: "text", description: "tooltip.layout.gap" },
			{ key: "layout.bodyGap", type: "text", description: "tooltip.layout.bodyGap" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.light.shadow", type: "color", description: "tooltip.colors.shadow" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.shadow", type: "color", description: "tooltip.colors.shadow" },
		],
	},
	heatmap: {
		componentKey: "heatmap",
		fields: [
			// Flags
			{ key: "flags.showWeekLabels", type: "toggle", description: "tooltip.heatmap.showWeekLabels" },
			{ key: "flags.showMonthLabels", type: "toggle", description: "tooltip.heatmap.showMonthLabels" },
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.heatmap.showLegend" },
			{ key: "flags.enableTooltip", type: "toggle", description: "tooltip.heatmap.enableTooltip" },
			{ key: "flags.mondayFirst", type: "toggle", description: "tooltip.heatmap.mondayFirst" },
			// Settings
			{ key: "settings.locale", type: "select", description: "tooltip.heatmap.locale", options: [
				{ value: "zh-CN", label: "中文 (简体)" },
				{ value: "zh-TW", label: "中文 (繁體)" },
				{ value: "en", label: "English" },
				{ value: "ja", label: "日本語" },
				{ value: "ko", label: "한국어" },
				{ value: "fr", label: "Français" },
				{ value: "de", label: "Deutsch" },
				{ value: "es", label: "Español" },
				{ value: "pt", label: "Português" },
				{ value: "ru", label: "Русский" },
			]},
			{ key: "settings.rangeMode", type: "select", description: "tooltip.heatmap.rangeMode", options: [
				{ value: "adaptive", label: "Adaptive" },
				{ value: "fixed", label: "Fixed" },
				{ value: "year", label: "Year" },
			]},
			{ key: "settings.minWeeks", type: "number", description: "tooltip.heatmap.minWeeks" },
			{ key: "settings.fixedDays", type: "number", description: "tooltip.heatmap.fixedDays" },
			{ key: "settings.legend", type: "text", description: "tooltip.heatmap.legend" },
			// Layout
			{ key: "layout.cellSize", type: "number", description: "tooltip.heatmap.cellSize" },
			{ key: "layout.cellGap", type: "number", description: "tooltip.heatmap.cellGap" },
			{ key: "layout.cellRadius", type: "text", description: "tooltip.heatmap.cellRadius" },
			{ key: "layout.weekLabelWidth", type: "text", description: "tooltip.heatmap.weekLabelWidth" },
			{ key: "layout.monthLabelHeight", type: "text", description: "tooltip.heatmap.monthLabelHeight" },
			{ key: "layout.monthLabelSize", type: "text", description: "tooltip.heatmap.monthLabelSize" },
			{ key: "layout.weekLabelSize", type: "text", description: "tooltip.heatmap.weekLabelSize" },
			// Colors (Light)
			{ key: "colors.light.dayBg", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.light.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
			// Colors (Dark)
			{ key: "colors.dark.dayBg", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.dark.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
		],
	},
	progressbar: {
		componentKey: "progressbar",
		fields: [
			// Basic
			{ key: "showLabel", type: "toggle", description: "tooltip.progressbar.showLabel" },
			{ key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.progressbar.labelFormat" },
			{ key: "min", type: "number", description: "tooltip.progressbar.min" },
			{ key: "max", type: "number", description: "tooltip.progressbar.max" },
			// Flags
			{ key: "flags.showGlow", type: "toggle", description: "tooltip.progressbar.showGlow" },
			{ key: "flags.striped", type: "toggle", description: "tooltip.progressbar.striped" },
			{ key: "flags.animated", type: "toggle", description: "tooltip.progressbar.animated" },
			// Layout
			{ key: "layout.width", type: "text", description: "tooltip.layout.width" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.trackOpacity", type: "slider", min: 0, max: 1, step: 0.01, description: "tooltip.progressbar.trackOpacity" },
			// Colors (Light)
			{ key: "colors.light.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.light.fill", type: "color", description: "tooltip.colors.fill" },
			{ key: "colors.light.label", type: "color", description: "tooltip.colors.label" },
			// Colors (Dark)
			{ key: "colors.dark.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.dark.fill", type: "color", description: "tooltip.colors.fill" },
			{ key: "colors.dark.label", type: "color", description: "tooltip.colors.label" },
		],
	},
};

/**
 * Default settings for all components
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	card: {
		enabled: true,
		config: {
			flags: {
				showHeader: true,
				headerSep: true,
				showTitle: true,
				showMeta: true,
				showValue: true,
			},
			layout: {
				maxWidth: "100%",
				padding: "16px",
				radius: "16px",
				gap: "14px",
				bodyGap: "12px",
			},
			colors: {
				light: {
					background: "rgba(245, 248, 252, 0.9)",
					border: "rgba(120, 140, 160, 0.18)",
					shadow: "rgba(15, 23, 42, 0.08)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
				dark: {
					background: "rgba(30, 41, 59, 0.72)",
					border: "rgba(148, 163, 184, 0.18)",
					shadow: "rgba(2, 6, 23, 0.28)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
			},
		},
	},
	heatmap: {
		enabled: true,
		config: {
			flags: {
				showWeekLabels: true,
				showMonthLabels: true,
				showLegend: true,
				enableTooltip: true,
				mondayFirst: true,
			},
			settings: {
				rangeMode: "adaptive",
				minWeeks: 12,
				fixedDays: 84,
				locale: "zh-CN",
				monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
				weekLabels: ["一", "", "三", "", "五", "", "日"],
				legend: "少 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 多",
				tooltipId: "ts-heatmap-tooltip",
			},
			layout: {
				maxWidth: "100%",
				cellSize: 11,
				cellGap: 2,
				cellRadius: "3px",
				weekLabelWidth: "20px",
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
					dayBg: "#f1f5f9",
					tooltip: "#ffffff",
					tooltipBg: "#0f172a",
					levels: ["#f1f5f9", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#14532d"],
				},
				dark: {
					dayBg: "#334155",
					tooltip: "#0f172a",
					tooltipBg: "#f1f5f9",
					levels: ["#334155", "#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
				},
			},
		},
	},
	progressbar: {
		enabled: true,
		config: {
			value: 0,
			max: 100,
			min: 0,
			showLabel: true,
			labelFormat: "{value}%",
			flags: {
				showGlow: true,
				striped: false,
				animated: false,
			},
			layout: {
				width: "100%",
				height: "8px",
				radius: "4px",
				trackOpacity: 0.2,
			},
			colors: {
				light: {
					track: "rgba(0, 0, 0, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
				dark: {
					track: "rgba(255, 255, 255, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
			},
		},
	},
};
