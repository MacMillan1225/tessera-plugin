/**
 * TesseraScript Component: Card
 * General-purpose card component for dashboards and panels
 *
 * The returned element exposes reactive properties (.title, .meta, .value,
 * .content) that can be set after creation to dynamically update the card.
 * Each property accepts a string or an HTMLElement.
 */

import { CARD_DEFAULTS } from "./config";
import { createElement, normalizeChildren, mergeStyles, resolveThemeColors, toString } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface CardOptions {
	title?: string;
	meta?: string;
	value?: unknown;
	content?: unknown;
	children?: unknown;
	emptyText?: string;
	className?: string | string[];
	flags?: {
		showHeader?: boolean;
		showHeaderSep?: boolean;
		showTitle?: boolean;
		showMeta?: boolean;
		showValue?: boolean;
	};
	layout?: {
		maxWidth?: string;
		padding?: string;
		radius?: string;
		gap?: string;
		bodyGap?: string;
	};
	colors?: {
		light?: {
			background?: string;
			border?: string;
			shadow?: string;
			hoverAccent?: string;
			value?: string;
		};
		dark?: {
			background?: string;
			border?: string;
			shadow?: string;
			hoverAccent?: string;
			value?: string;
		};
		[key: string]: unknown;
	};
	styles?: {
		card?: Record<string, unknown>;
		header?: Record<string, unknown>;
		title?: Record<string, unknown>;
		meta?: Record<string, unknown>;
		body?: Record<string, unknown>;
		value?: Record<string, unknown>;
		empty?: Record<string, unknown>;
	};
}

/**
 * A card HTMLElement with reactive property accessors.
 * Use .title, .meta, .value, .content to read or update the card dynamically.
 *
 * Note: The native HTMLElement.title (tooltip) is overridden to support
 * string | HTMLElement. Use element.setAttribute('title', ...) for tooltips.
 */
export interface CardInstance extends Omit<HTMLElement, "title"> {
	/** Card title – accepts string or HTMLElement. Setting it makes the header visible. */
	title: string | HTMLElement;
	/** Card meta label – accepts string or HTMLElement. Setting it makes the header visible. */
	meta: string | HTMLElement;
	/** Card main value – accepts any value; HTMLElement supported. Setting to null hides it. */
	value: unknown;
	/** Card body content – accepts string, HTMLElement, or array. Setting to null shows empty state. */
	content: unknown;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Replace the text/children of an element with a new value.
 * Supports both string and HTMLElement.
 */
function applyContent(el: HTMLElement, value: string | HTMLElement): void {
	if (value instanceof HTMLElement) {
		el.replaceChildren(value);
	} else {
		el.textContent = String(value);
	}
	el.classList.remove("tessera-hidden");
}

/**
 * Clear all children from a body section except a protected node (typically
 * the value element), then append the new content.
 */
function replaceBodyContent(
	bodySection: HTMLElement,
	protectedNode: HTMLElement,
	newContent: unknown,
	emptyEl: HTMLElement,
): void {
	// Remove every child except the protected node
	for (const child of Array.from(bodySection.childNodes)) {
		if (child !== protectedNode) {
			bodySection.removeChild(child);
		}
	}

	if (newContent == null) {
		bodySection.appendChild(emptyEl);
		return;
	}

	const items = normalizeChildren(newContent);
	if (items.length === 0) {
		bodySection.appendChild(emptyEl);
		return;
	}

	for (const item of items) {
		if (item instanceof Node) {
			bodySection.appendChild(item);
		} else if (item != null && item !== false) {
			// eslint-disable-next-line obsidianmd/prefer-active-doc
			bodySection.appendChild(document.createTextNode(toString(item)));
		}
	}
}

// ============================================================================
// Component Function
// ============================================================================

export function card(options: CardOptions = {}): CardInstance {
	const flags = options.flags || {};
	const layout = options.layout || {};
	const themeColors = resolveThemeColors(options.colors || {}, CARD_DEFAULTS.colors);
	const styles = options.styles || {};

	// ---- Internal state (raw values behind the reactive getters/setters) ----
	let _title: string | HTMLElement | undefined = options.title;
	let _meta: string | HTMLElement | undefined = options.meta;
	let _value: unknown = options.value;
	let _content: unknown = options.content !== undefined ? options.content : options.children;

	// ---- Structural elements (always created, visibility controlled) --------

	const titleEl = createElement("div", {
		className: "ts-card__title",
		style: styles.title,
	});
	if (options.title) {
		titleEl.textContent = options.title;
	} else {
		titleEl.classList.add("tessera-hidden");
	}

	const metaEl = createElement("div", {
		className: "ts-card__meta",
		style: styles.meta,
	});
	if (options.meta) {
		metaEl.textContent = options.meta;
	} else {
		metaEl.classList.add("tessera-hidden");
	}

	const hasInitialHeader =
		flags.showHeader !== false &&
		(flags.showTitle !== false && !!options.title || flags.showMeta !== false && !!options.meta);

	const headerEl = createElement("header", {
		className: [
			"ts-card__header",
			flags.showHeaderSep !== false && "ts-card__header--sep",
		].filter(Boolean) as string[],
		style: styles.header,
		children: [titleEl, metaEl],
	});
	if (!hasInitialHeader) {
		headerEl.classList.add("tessera-hidden");
	}

	// ---- Value element ------------------------------------------------------

	const valueEl = createElement("div", {
		className: "ts-card__value",
		style: styles.value,
	});
	if (flags.showValue !== false && options.value != null) {
		valueEl.textContent = toString(options.value);
	} else {
		valueEl.classList.add("tessera-hidden");
	}

	// ---- Body content -------------------------------------------------------

	const initialContentItems = normalizeChildren(_content);

	const emptyEl = createElement("div", {
		className: "ts-card__empty",
		style: styles.empty,
		text: options.emptyText || "No content",
	});

	const bodySection = createElement("section", {
		className: "ts-card__body",
		style: styles.body,
		children:
			initialContentItems.length > 0
				? [valueEl, ...initialContentItems]
				: [valueEl, emptyEl],
	});

	// ---- Card element -------------------------------------------------------

	const cardEl = createElement("article", {
		className: ["ts-card", options.className].filter(Boolean) as string[],
		style: mergeStyles(
			{
				maxWidth: layout.maxWidth,
				"--ts-card-padding": layout.padding,
				"--ts-card-radius": layout.radius,
				"--ts-card-gap": layout.gap,
				"--ts-card-body-gap": layout.bodyGap,
				"--ts-card-background-light": themeColors.light.background,
				"--ts-card-background-dark": themeColors.dark.background,
				"--ts-card-border-light": themeColors.light.border,
				"--ts-card-border-dark": themeColors.dark.border,
				"--ts-card-shadow-light": themeColors.light.shadow,
				"--ts-card-shadow-dark": themeColors.dark.shadow,
				"--ts-card-hover-accent-light": themeColors.light.hoverAccent,
				"--ts-card-hover-accent-dark": themeColors.dark.hoverAccent,
				"--ts-card-value-color-light": themeColors.light.value,
				"--ts-card-value-color-dark": themeColors.dark.value,
			},
			styles.card,
		),
		children: [headerEl, bodySection],
	});

	// ---- Reactive property accessors ----------------------------------------
	// These shadow the native HTMLElement.prototype.title on this instance.

	Object.defineProperty(cardEl, "title", {
		get(): string | HTMLElement {
			return _title ?? "";
		},
		set(value: string | HTMLElement): void {
			_title = value;
			applyContent(titleEl, value);
			headerEl.classList.remove("tessera-hidden");
		},
		enumerable: true,
		configurable: true,
	});

	Object.defineProperty(cardEl, "meta", {
		get(): string | HTMLElement {
			return _meta ?? "";
		},
		set(value: string | HTMLElement): void {
			_meta = value;
			applyContent(metaEl, value);
			headerEl.classList.remove("tessera-hidden");
		},
		enumerable: true,
		configurable: true,
	});

	Object.defineProperty(cardEl, "value", {
		get(): unknown {
			return _value;
		},
		set(value: unknown): void {
			_value = value;
			if (value == null) {
				valueEl.classList.add("tessera-hidden");
				return;
			}
			if (value instanceof HTMLElement) {
				valueEl.replaceChildren(value);
			} else {
				valueEl.textContent = toString(value);
			}
			valueEl.classList.remove("tessera-hidden");
		},
		enumerable: true,
		configurable: true,
	});

	Object.defineProperty(cardEl, "content", {
		get(): unknown {
			return _content;
		},
		set(value: unknown): void {
			_content = value;
			replaceBodyContent(bodySection, valueEl, value, emptyEl);
		},
		enumerable: true,
		configurable: true,
	});

	return cardEl as CardInstance;
}
