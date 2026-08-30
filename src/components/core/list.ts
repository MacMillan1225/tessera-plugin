/**
 * TesseraScript Core Component: List
 * Bullet-point list with Lieflat styling — accent dots, optional values,
 * restrained hover and divider modes.
 */

import { LIST_DEFAULTS } from "./config";
import { createElement, resolveThemeColors, mergeStyles, toString } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface ListItem {
	label: string;
	value?: string | number;
}

export type ListItems = Array<string | ListItem>;

export interface ListOptions {
	/** List items — plain strings or { label, value } objects. */
	items?: ListItems;
	/** Custom child elements appended after the list (unstyled). */
	children?: unknown;
	/** Text shown when items is empty. */
	emptyText?: string;
	className?: string | string[];
	flags?: {
		/** Show accent-colored bullet dots (default true). */
		showBullets?: boolean;
		/** Separate rows with hairline dividers (default false). */
		showDividers?: boolean;
		/** Highlight row background on hover (default true). */
		showHover?: boolean;
	};
	layout?: {
		maxWidth?: string;
		padding?: string;
		radius?: string;
		/** Vertical gap between rows. */
		gap?: string;
		/** Bullet dot diameter (CSS length). */
		bulletSize?: string;
		/** Left indent for the text relative to bullets. */
		indent?: string;
	};
	colors?: {
		light?: { background?: string; border?: string; text?: string; accent?: string };
		dark?: { background?: string; border?: string; text?: string; accent?: string };
		[key: string]: unknown;
	};
	styles?: {
		root?: Record<string, unknown>;
		list?: Record<string, unknown>;
		item?: Record<string, unknown>;
		bullet?: Record<string, unknown>;
		label?: Record<string, unknown>;
		value?: Record<string, unknown>;
		empty?: Record<string, unknown>;
	};
}

export interface ListInstance extends HTMLElement {
	/** Reactive items — setting re-renders the list. */
	items: ListItems;
	/** Exposed parts. */
	parts: {
		items: HTMLElement;
		rows: HTMLElement[];
	};
}

// ============================================================================
// Item Normalization
// ============================================================================

function normalizeItem(item: string | ListItem): ListItem {
	return typeof item === "string" ? { label: item } : item;
}

// ============================================================================
// Component Function
// ============================================================================

export function list(options: ListOptions = {}): ListInstance {
	// Resolve configuration: defaults + user options (like other components)
	const flags = { ...LIST_DEFAULTS.flags, ...options.flags };
	const layout = { ...LIST_DEFAULTS.layout, ...options.layout };
	const themeColors = resolveThemeColors(options.colors || {}, LIST_DEFAULTS.colors);
	const styles = options.styles || {};

	let _items: ListItems = options.items ?? [];

	// Structure
	const listEl = createElement("ul", {
		className: "ts-list__items",
		style: styles.list,
	});

	const emptyEl = createElement("div", {
		className: "ts-list__empty",
		text: options.emptyText ?? "No items",
		style: styles.empty,
	});

	const root = createElement("section", {
		className: ["ts-list", options.className].filter(Boolean) as string[],
		style: mergeStyles(
			{
				maxWidth: layout.maxWidth,
				padding: layout.padding,
				"--ts-list-radius": layout.radius,
				"--ts-list-gap": layout.gap,
				"--ts-list-bullet-size": layout.bulletSize,
				"--ts-list-indent": layout.indent,
				"--ts-list-light-background": themeColors.light.background,
				"--ts-list-light-border": themeColors.light.border,
				"--ts-list-light-text": themeColors.light.text,
				"--ts-list-light-accent": themeColors.light.accent,
				"--ts-list-dark-background": themeColors.dark.background,
				"--ts-list-dark-border": themeColors.dark.border,
				"--ts-list-dark-text": themeColors.dark.text,
				"--ts-list-dark-accent": themeColors.dark.accent,
			},
			styles.root,
		),
	});

	// Variant classes
	if (flags.showBullets === false) {
		root.classList.add("ts-list--no-bullets");
	}
	if (flags.showDividers === true) {
		root.classList.add("ts-list--dividers");
	}
	if (flags.showHover === false) {
		root.classList.add("ts-list--no-hover");
	}

	// Render rows
	function renderItems(): void {
		listEl.textContent = "";
		emptyEl.remove();

		if (!_items.length) {
			root.appendChild(emptyEl);
			return;
		}

		_items.forEach((item) => {
			const normalized = normalizeItem(item);

			const bulletEl = createElement("span", {
				className: "ts-list__bullet",
				style: styles.bullet,
			});

			const labelEl = createElement("span", {
				className: "ts-list__label",
				text: normalized.label,
				style: styles.label,
			});

			const row = createElement("li", {
				className: "ts-list__item",
				children: [bulletEl, labelEl],
				style: styles.item,
			});

			if (normalized.value != null) {
				row.appendChild(
					createElement("span", {
						className: "ts-list__value",
						text: toString(normalized.value),
						style: styles.value,
					}),
				);
			}

			listEl.appendChild(row);
		});
	}

	renderItems();

	// Assemble
	if (options.children != null) {
		const childrenEl = createElement("div", {
			className: "ts-list__children",
			children: options.children,
		});
		root.appendChild(listEl);
		root.appendChild(childrenEl);
	} else {
		root.appendChild(listEl);
	}

	// Expose parts
	const result = root as unknown as ListInstance;
	result.parts = {
		items: listEl,
		rows: Array.from(listEl.querySelectorAll<HTMLElement>(".ts-list__item")),
	};

	// Reactive items
	Object.defineProperty(result, "items", {
		get: () => _items,
		set(v: ListItems) {
			_items = v ?? [];
			renderItems();
			result.parts.rows = Array.from(listEl.querySelectorAll<HTMLElement>(".ts-list__item"));
		},
		enumerable: true,
		configurable: true,
	});

	return result;
}