/**
 * TesseraScript Core Component: Tags
 * Auto-wrapping tag chips inside a card. Supports pill / soft / outlined
 * variants per-tag and container-level, Lieflat styling.
 */

import { TAGS_DEFAULTS } from "./config";
import { createElement, resolveThemeColors, mergeStyles } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface TagItem {
	label: string;
	/** Per-tag color override (any CSS color). */
	color?: string;
	/** Per-tag variant override. */
	variant?: "pill" | "soft" | "outlined";
}

export type Tags = Array<string | TagItem>;

export interface TagsOptions {
	/** Tag chips — plain strings or { label, color, variant } objects. */
	tags?: Tags;
	/** Custom child elements appended after the tags (unstyled). */
	children?: unknown;
	/** Text shown when tags is empty. */
	emptyText?: string;
	className?: string | string[];
	flags?: {
		/** Pill-shaped tags (default true). */
		pill?: boolean;
		/** Soft filled background (default false). */
		soft?: boolean;
		/** Outlined tags, border only (default false). */
		outlined?: boolean;
		/** Allow wrapping onto multiple lines (default true). */
		wrap?: boolean;
	};
	layout?: {
		maxWidth?: string;
		padding?: string;
		radius?: string;
		gap?: string;
		tagRadius?: string;
		tagPadding?: string;
		tagFontSize?: string;
	};
	colors?: {
		light?: { background?: string; border?: string; text?: string; accent?: string };
		dark?: { background?: string; border?: string; text?: string; accent?: string };
		[key: string]: unknown;
	};
	styles?: {
		root?: Record<string, unknown>;
		tags?: Record<string, unknown>;
		tag?: Record<string, unknown>;
		empty?: Record<string, unknown>;
	};
}

export interface TagsInstance extends HTMLElement {
	/** Reactive tags — setting re-renders the chip set. */
	tags: Tags;
	/** Exposed parts. */
	parts: {
		chips: HTMLElement[];
	};
}

// ============================================================================
// Item Normalization
// ============================================================================

function normalizeTag(tag: string | TagItem): TagItem {
	return typeof tag === "string" ? { label: tag } : tag;
}

// ============================================================================
// Component Function
// ============================================================================

export function tags(options: TagsOptions = {}): TagsInstance {
	// Resolve configuration: defaults + user options (like other components)
	const flags = { ...TAGS_DEFAULTS.flags, ...options.flags };
	const layout = { ...TAGS_DEFAULTS.layout, ...options.layout };
	const themeColors = resolveThemeColors(options.colors || {}, TAGS_DEFAULTS.colors);
	const styles = options.styles || {};

	let _tags: Tags = options.tags ?? [];

	// Container for chips — flex wrap
	const chipsEl = createElement("div", {
		className: "ts-tags__chips",
		style: styles.tags,
	});

	const emptyEl = createElement("div", {
		className: "ts-tags__empty",
		text: options.emptyText ?? "No tags",
		style: styles.empty,
	});

	const root = createElement("section", {
		className: ["ts-tags", options.className].filter(Boolean) as string[],
		style: mergeStyles(
			{
				maxWidth: layout.maxWidth,
				padding: layout.padding,
				"--ts-tags-radius": layout.radius,
				"--ts-tags-gap": layout.gap,
				"--ts-tags-tag-radius": layout.tagRadius,
				"--ts-tags-tag-padding": layout.tagPadding,
				"--ts-tags-tag-font-size": layout.tagFontSize,
				"--ts-tags-light-background": themeColors.light.background,
				"--ts-tags-light-border": themeColors.light.border,
				"--ts-tags-light-text": themeColors.light.text,
				"--ts-tags-light-accent": themeColors.light.accent,
				"--ts-tags-dark-background": themeColors.dark.background,
				"--ts-tags-dark-border": themeColors.dark.border,
				"--ts-tags-dark-text": themeColors.dark.text,
				"--ts-tags-dark-accent": themeColors.dark.accent,
			},
			styles.root,
		),
	});

	// Container variant classes (inherited by chips via CSS variables)
	if (flags.pill === false) {
		root.classList.add("ts-tags--squared");
	}
	if (flags.soft === true) {
		root.classList.add("ts-tags--soft");
	}
	if (flags.outlined === true) {
		root.classList.add("ts-tags--outlined");
	}
	if (flags.wrap === false) {
		root.classList.add("ts-tags--no-wrap");
	}

	// Render chips
	function renderTags(): void {
		chipsEl.textContent = "";
		emptyEl.remove();

		if (!_tags.length) {
			root.appendChild(emptyEl);
			return;
		}

		_tags.forEach((tag) => {
			const normalized = normalizeTag(tag);

			const chip = createElement("span", {
				className: "ts-tags__tag",
				text: normalized.label,
				style: styles.tag,
			});

			// Per-tag variant class
			const variant = normalized.variant ?? (flags.outlined ? "outlined" : flags.soft ? "soft" : "pill");
			chip.classList.add(`ts-tags__tag--${variant}`);

			// Per-tag color override: sets --ts-tags-tag-accent so the chip
			// keeps its variant shape but switches color.
			if (normalized.color) {
				chip.style.setProperty("--ts-tags-tag-accent", normalized.color);
			}

			chipsEl.appendChild(chip);
		});
	}

	renderTags();

	// Assemble
	if (options.children != null) {
		const childrenEl = createElement("div", {
			className: "ts-tags__children",
			children: options.children,
		});
		root.appendChild(chipsEl);
		root.appendChild(childrenEl);
	} else {
		root.appendChild(chipsEl);
	}

	// Expose parts
	const result = root as unknown as TagsInstance;
	result.parts = {
		chips: Array.from(chipsEl.querySelectorAll<HTMLElement>(".ts-tags__tag")),
	};

	// Reactive tags
	Object.defineProperty(result, "tags", {
		get: () => _tags,
		set(v: Tags) {
			_tags = v ?? [];
			renderTags();
			result.parts.chips = Array.from(chipsEl.querySelectorAll<HTMLElement>(".ts-tags__tag"));
		},
		enumerable: true,
		configurable: true,
	});

	return result;
}