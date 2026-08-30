/**
 * Tags component default configuration
 * Single source of truth for all tags defaults
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

export type TagsConfig = typeof TAGS_DEFAULTS;