/**
 * Component field definitions for settings UI
 * DEFAULT_SETTINGS imports from component config files (single source of truth)
 */

import type { ComponentDefinition, ComponentKey, PluginSettings } from "./types";
import { CARD_DEFAULTS } from "../components/card/config";
import { HEATMAP_DEFAULTS } from "../components/heatmap/config";
import { PROGRESSBAR_DEFAULTS } from "../components/progressbar/config";
import { LIST_DEFAULTS } from "../components/list/config";
import { TAGS_DEFAULTS } from "../components/tags/config";
import { LINE_DEFAULTS } from "../components/chart/config";
import { BAR_DEFAULTS } from "../components/chart/config";
import { GAUGE_DEFAULTS } from "../components/chart/config";
import { ROSE_DEFAULTS } from "../components/chart/config";
import { RADAR_DEFAULTS } from "../components/chart/config";

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
export const COMPONENTS: Record<ComponentKey, ComponentDefinition> = {
	card: {
		componentKey: "card",
		fields: [
			// Flags
			{ key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" },
			{ key: "flags.showHeaderSep", type: "toggle", description: "tooltip.flags.showHeaderSep" },
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
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	heatmap: {
		componentKey: "heatmap",
		fields: [
			// Flags
			{ key: "flags.showWeekLabels", type: "toggle", description: "tooltip.heatmap.showWeekLabels" },
			{ key: "flags.showMonthLabels", type: "toggle", description: "tooltip.heatmap.showMonthLabels" },
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.heatmap.showLegend" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.heatmap.showTooltip" },
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
			{ key: "settings.monthNames", type: "text", description: "tooltip.heatmap.monthNames" },
			{ key: "settings.weekLabels", type: "text", description: "tooltip.heatmap.weekLabels" },
			{ key: "settings.tooltipId", type: "text", description: "tooltip.heatmap.tooltipId" },
			// Layout
			{ key: "layout.cellSize", type: "number", description: "tooltip.heatmap.cellSize" },
			{ key: "layout.cellGap", type: "number", description: "tooltip.heatmap.cellGap" },
			{ key: "layout.cellRadius", type: "text", description: "tooltip.heatmap.cellRadius" },
			{ key: "layout.weekLabelWidth", type: "text", description: "tooltip.heatmap.weekLabelWidth" },
			{ key: "layout.monthLabelHeight", type: "text", description: "tooltip.heatmap.monthLabelHeight" },
			{ key: "layout.monthLabelSize", type: "text", description: "tooltip.heatmap.monthLabelSize" },
			{ key: "layout.weekLabelSize", type: "text", description: "tooltip.heatmap.weekLabelSize" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.light.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.dark.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
		],
	},
	progressbar: {
		componentKey: "progressbar",
		fields: [
			// Basic
			{ key: "value", type: "number", placeholder: "0.5", description: "tooltip.progressbar.value" },
			{ key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.progressbar.labelFormat" },
			// Flags
			{ key: "flags.showLabel", type: "toggle", description: "tooltip.progressbar.showLabel" },
			{ key: "flags.showStriped", type: "toggle", description: "tooltip.progressbar.showStriped" },
			{ key: "flags.showAnimated", type: "toggle", description: "tooltip.progressbar.showAnimated" },
			// Layout
			{ key: "layout.width", type: "text", description: "tooltip.layout.width" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	list: {
		componentKey: "list",
		fields: [
			// Flags
			{ key: "flags.showBullets", type: "toggle", description: "tooltip.list.showBullets" },
			{ key: "flags.showDividers", type: "toggle", description: "tooltip.list.showDividers" },
			{ key: "flags.showHover", type: "toggle", description: "tooltip.list.showHover" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.gap", type: "text", description: "tooltip.layout.gap" },
			{ key: "layout.bulletSize", type: "text", description: "tooltip.list.bulletSize" },
			{ key: "layout.indent", type: "text", description: "tooltip.list.indent" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	tags: {
		componentKey: "tags",
		fields: [
			// Flags
			{ key: "flags.pill", type: "toggle", description: "tooltip.tags.pill" },
			{ key: "flags.soft", type: "toggle", description: "tooltip.tags.soft" },
			{ key: "flags.outlined", type: "toggle", description: "tooltip.tags.outlined" },
			{ key: "flags.wrap", type: "toggle", description: "tooltip.tags.wrap" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.gap", type: "text", description: "tooltip.layout.gap" },
			{ key: "layout.tagRadius", type: "text", description: "tooltip.tags.tagRadius" },
			{ key: "layout.tagPadding", type: "text", description: "tooltip.tags.tagPadding" },
			{ key: "layout.tagFontSize", type: "text", description: "tooltip.tags.tagFontSize" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	// ---- Chart group components (ADR-0005) ----
	line: {
		componentKey: "line",
		fields: [
			// Flags
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.chart.showLegend" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.chart.showTooltip" },
			{ key: "flags.showGrid", type: "toggle", description: "tooltip.chart.showGrid" },
			{ key: "flags.smooth", type: "toggle", description: "tooltip.chart.smooth" },
			{ key: "flags.area", type: "toggle", description: "tooltip.chart.area" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.symbolSize", type: "number", placeholder: "5", description: "tooltip.chart.symbolSize" },
			{ key: "layout.lineWidth", type: "number", placeholder: "2", description: "tooltip.chart.lineWidth" },
			{ key: "layout.gridLeft", type: "number", placeholder: "8", description: "tooltip.chart.gridLeft" },
			{ key: "layout.gridRight", type: "number", placeholder: "12", description: "tooltip.chart.gridRight" },
			{ key: "layout.gridTop", type: "number", placeholder: "28", description: "tooltip.chart.gridTop" },
			{ key: "layout.gridBottom", type: "number", placeholder: "4", description: "tooltip.chart.gridBottom" },
			// Colors (Light)
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	bar: {
		componentKey: "bar",
		fields: [
			// Flags
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.chart.showLegend" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.chart.showTooltip" },
			{ key: "flags.showGrid", type: "toggle", description: "tooltip.chart.showGrid" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.barMaxWidth", type: "number", placeholder: "28", description: "tooltip.chart.barMaxWidth" },
			{ key: "layout.barRadius", type: "number", placeholder: "6", description: "tooltip.chart.barRadius" },
			{ key: "layout.gridLeft", type: "number", placeholder: "8", description: "tooltip.chart.gridLeft" },
			{ key: "layout.gridRight", type: "number", placeholder: "12", description: "tooltip.chart.gridRight" },
			{ key: "layout.gridTop", type: "number", placeholder: "28", description: "tooltip.chart.gridTop" },
			{ key: "layout.gridBottom", type: "number", placeholder: "4", description: "tooltip.chart.gridBottom" },
			// Colors (Light)
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	gauge: {
		componentKey: "gauge",
		fields: [
			// Basic
			{ key: "value", type: "number", placeholder: "0.5", description: "tooltip.gauge.value" },
			{ key: "label", type: "text", description: "tooltip.gauge.label" },
			// Flags
			{ key: "flags.showLabel", type: "toggle", description: "tooltip.gauge.showLabel" },
			{ key: "flags.showTicks", type: "toggle", description: "tooltip.gauge.showTicks" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.chart.showTooltip" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			// Colors (Light)
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	rose: {
		componentKey: "rose",
		fields: [
			// Flags
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.chart.showLegend" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.chart.showTooltip" },
			{ key: "flags.showLabels", type: "toggle", description: "tooltip.chart.showLabels" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			// Colors (Light)
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
	radar: {
		componentKey: "radar",
		fields: [
			// Basic
			{ key: "max", type: "number", placeholder: "auto", description: "tooltip.radar.max" },
			// Flags
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.chart.showLegend" },
			{ key: "flags.showTooltip", type: "toggle", description: "tooltip.chart.showTooltip" },
			{ key: "flags.showLabels", type: "toggle", description: "tooltip.chart.showLabels" },
			{ key: "flags.showArea", type: "toggle", description: "tooltip.radar.showArea" },
			{ key: "flags.showAxes", type: "toggle", description: "tooltip.radar.showAxes" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.lineWidth", type: "number", placeholder: "2", description: "tooltip.chart.lineWidth" },
			{ key: "layout.symbolSize", type: "number", placeholder: "3", description: "tooltip.chart.symbolSize" },
			// Colors (Light)
			{ key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.light.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.light.accent", type: "color", description: "tooltip.colors.accent" },
			// Colors (Dark)
			{ key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
			{ key: "colors.dark.grid", type: "color", description: "tooltip.colors.grid" },
			{ key: "colors.dark.accent", type: "color", description: "tooltip.colors.accent" },
		],
	},
};

/**
 * Component group definitions (ADR-0004/ADR-0005 hierarchy: group → component → field).
 * Each group has its own master switch and its own set of components.
 */
export const GROUPS: { key: "core" | "chart"; enabledKey: "coreEnabled" | "chartEnabled"; descKey: "coreDesc" | "chartDesc"; components: ComponentKey[] }[] = [
	{
		key: "core",
		enabledKey: "coreEnabled",
		descKey: "coreDesc",
		components: ["card", "heatmap", "progressbar", "list", "tags"],
	},
	{
		key: "chart",
		enabledKey: "chartEnabled",
		descKey: "chartDesc",
		components: ["line", "bar", "gauge", "rose", "radar"],
	},
];

/**
 * Default settings for all components
 * References component config files as single source of truth
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	version: 4,
	coreEnabled: true,
	chartEnabled: true,
	card: {
		enabled: true,
		config: CARD_DEFAULTS,
	},
	heatmap: {
		enabled: true,
		config: HEATMAP_DEFAULTS,
	},
	progressbar: {
		enabled: true,
		config: PROGRESSBAR_DEFAULTS,
	},
	list: {
		enabled: true,
		config: LIST_DEFAULTS,
	},
	tags: {
		enabled: true,
		config: TAGS_DEFAULTS,
	},
	line: {
		enabled: true,
		config: LINE_DEFAULTS,
	},
	bar: {
		enabled: true,
		config: BAR_DEFAULTS,
	},
	gauge: {
		enabled: true,
		config: GAUGE_DEFAULTS,
	},
	rose: {
		enabled: true,
		config: ROSE_DEFAULTS,
	},
	radar: {
		enabled: true,
		config: RADAR_DEFAULTS,
	},
};
