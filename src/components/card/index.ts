/**
 * TesseraScript Component: Card
 * General-purpose card component for dashboards and panels
 */

import { CARD_DEFAULTS } from "./config";

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
		headerSep?: boolean;
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

// ============================================================================
// Helper Functions
// ============================================================================

function toString(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return JSON.stringify(value);
}

function assignClasses(element: HTMLElement, className?: string | string[]): HTMLElement {
	if (!className) {
		return element;
	}

	const classes = Array.isArray(className)
		? className.flatMap((item) => String(item || "").split(/\s+/))
		: String(className).split(/\s+/);

	classes.filter(Boolean).forEach((name) => element.classList.add(name));
	return element;
}

function assignStyles(element: HTMLElement, styles?: Record<string, unknown>): HTMLElement {
	if (!styles || typeof styles !== "object") {
		return element;
	}

	Object.entries(styles).forEach(([key, value]) => {
		if (value == null) {
			return;
		}

		if (key.startsWith("--") || key.includes("-")) {
			element.style.setProperty(key, toString(value));
			return;
		}

		(element.style as unknown as Record<string, unknown>)[key] = value;
	});

	return element;
}

function appendChildren(element: Node, children?: unknown): Node {
	const list = Array.isArray(children) ? children : [children];

	list.flat(Infinity).forEach((child) => {
		if (child == null || child === false) {
			return;
		}

		if (child instanceof Node) {
			element.appendChild(child);
			return;
		}

		// eslint-disable-next-line obsidianmd/prefer-active-doc
		element.appendChild(document.createTextNode(String(child)));
	});

	return element;
}

function createElement(tagName: string, options: {
	className?: string | string[];
	attrs?: Record<string, unknown>;
	style?: Record<string, unknown>;
	text?: string;
	children?: unknown;
} = {}): HTMLElement {
	// eslint-disable-next-line obsidianmd/prefer-active-doc
	const element = document.createElement(tagName);

	assignClasses(element, options.className);
	assignStyles(element, options.style);

	if (options.text != null) {
		element.textContent = String(options.text);
	}

	if (options.children != null) {
		appendChildren(element, options.children);
	}

	return element;
}

// ============================================================================
// Theme Color Resolution
// ============================================================================

const themeColorKeys = ["background", "border", "shadow", "hoverAccent", "value"];

function normalizeChildren(content: unknown): unknown[] {
	if (content == null) {
		return [];
	}
	return Array.isArray(content) ? content : [content];
}

function mergeStyles(...styles: unknown[]): Record<string, unknown> {
	return styles.reduce<Record<string, unknown>>((result, style) => {
		if (!style || typeof style !== "object") {
			return result;
		}
		return Object.assign(result, style);
	}, {});
}

function pickSharedColors(colors: Record<string, unknown> = {}): Record<string, unknown> {
	return themeColorKeys.reduce<Record<string, unknown>>((result, key) => {
		if (colors[key] !== undefined) {
			result[key] = colors[key];
		}
		return result;
	}, {});
}

function resolveThemeColors(colors: Record<string, unknown> = {}): { light: Record<string, unknown>; dark: Record<string, unknown> } {
	const sharedColors = pickSharedColors(colors);

	return {
		light: mergeStyles(CARD_DEFAULTS.colors.light, sharedColors, colors.light),
		dark: mergeStyles(CARD_DEFAULTS.colors.dark, sharedColors, colors.dark),
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function card(options: CardOptions = {}): HTMLElement {
	const flags = options.flags || {};
	const layout = options.layout || {};
	const themeColors = resolveThemeColors(options.colors || {});
	const styles = options.styles || {};

	// Build header children
	const headerChildren: HTMLElement[] = [];
	const titleText = options.title;
	const metaText = options.meta;
	const valueContent = options.value;

	if (flags.showTitle !== false && titleText) {
		headerChildren.push(
			createElement("div", {
				className: "ts-card__title",
				style: styles.title,
				text: titleText,
			})
		);
	}

	if (flags.showMeta !== false && metaText) {
		headerChildren.push(
			createElement("div", {
				className: "ts-card__meta",
				style: styles.meta,
				text: metaText,
			})
		);
	}

	// Build body children
	const bodyChildren: unknown[] = [];

	if (flags.showValue !== false && valueContent != null) {
		bodyChildren.push(
			createElement("div", {
				className: "ts-card__value",
				style: styles.value,
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				text: typeof valueContent === "object" ? JSON.stringify(valueContent) : String(valueContent),
			})
		);
	}

	bodyChildren.push(
		...normalizeChildren(
			options.content !== undefined ? options.content : options.children
		)
	);

	// Create card element
	return createElement("article", {
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
			styles.card
		),
		children: [
			flags.showHeader !== false && headerChildren.length
				? createElement("header", {
						className: [
							"ts-card__header",
							flags.headerSep !== false && "ts-card__header--sep",
						].filter(Boolean) as string[],
						style: styles.header,
						children: headerChildren,
					})
				: null,

			createElement("section", {
				className: "ts-card__body",
				style: styles.body,
				children: bodyChildren.length
					? bodyChildren
					: createElement("div", {
							className: "ts-card__empty",
							style: styles.empty,
							text: options.emptyText || "No content",
						}),
			}),
		],
	});
}

// ============================================================================
// Default Export
// ============================================================================

export default card;
