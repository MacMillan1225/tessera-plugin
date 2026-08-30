/**
 * Progressbar component default configuration
 * Single source of truth for all progressbar defaults
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
			text: "var(--text-normal)",
			accent: "var(--text-normal)",
		},
		dark: {
			background: "#44403c",
			border: "transparent",
			text: "var(--text-normal)",
			accent: "var(--text-normal)",
		},
	},
} as const;

export type ProgressbarConfig = typeof PROGRESSBAR_DEFAULTS;