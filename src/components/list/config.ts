/**
 * List component default configuration
 * Single source of truth for all list defaults
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
			background: "var(--background-secondary)",
			border: "transparent",
			text: "var(--text-normal)",
			accent: "var(--text-normal)",
		},
		dark: {
			background: "var(--background-secondary)",
			border: "transparent",
			text: "var(--text-normal)",
			accent: "var(--text-normal)",
		},
	},
} as const;

export type ListConfig = typeof LIST_DEFAULTS;