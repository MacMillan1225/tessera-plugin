/**
 * Progressbar component default configuration
 * Single source of truth for all progressbar defaults
 */

export const PROGRESSBAR_DEFAULTS = {
	value: 0,
	max: 100,
	min: 0,
	labelFormat: "{value}%",
	flags: {
		showLabel: true,
		showGlow: true,
		showStriped: false,
		showAnimated: false,
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
			trackBorder: "transparent",
			fill: "var(--interactive-accent)",
			fillGradient: "none",
			shadow: "none",
			glow: "none",
			label: "var(--text-normal)",
		},
		dark: {
			track: "rgba(255, 255, 255, 0.08)",
			trackBorder: "transparent",
			fill: "var(--interactive-accent)",
			fillGradient: "none",
			shadow: "none",
			glow: "none",
			label: "var(--text-normal)",
		},
	},
} as const;

export type ProgressbarConfig = typeof PROGRESSBAR_DEFAULTS;
