/**
 * Card component default configuration
 * Single source of truth for all card defaults
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

export type CardConfig = typeof CARD_DEFAULTS;