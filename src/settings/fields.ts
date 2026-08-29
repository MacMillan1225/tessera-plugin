/**
 * Component field definitions for settings UI
 * DEFAULT_SETTINGS imports from component config files (single source of truth)
 */

import type { ComponentDefinition, PluginSettings } from "./types";
import { CARD_DEFAULTS } from "../components/card/config";
import { HEATMAP_DEFAULTS } from "../components/heatmap/config";
import { PROGRESSBAR_DEFAULTS } from "../components/progressbar/config";

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
export const COMPONENTS: Record<Exclude<keyof PluginSettings, "version">, ComponentDefinition> = {
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
			{ key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.progressbar.labelFormat" },
			{ key: "min", type: "number", description: "tooltip.progressbar.min" },
			{ key: "max", type: "number", description: "tooltip.progressbar.max" },
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
};

/**
 * Default settings for all components
 * References component config files as single source of truth
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	version: 1,
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
};
