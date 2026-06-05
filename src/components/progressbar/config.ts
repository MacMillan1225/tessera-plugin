/**
 * Progressbar component default configuration
 * Single source of truth for all progressbar defaults
 */

export const PROGRESSBAR_DEFAULTS = {
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
} as const;

export type ProgressbarConfig = typeof PROGRESSBAR_DEFAULTS;
