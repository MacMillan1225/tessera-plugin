/**
 * TesseraScript Component: Card
 * General-purpose card component for dashboards and panels
 */

import { createElement } from "../../core/dom";

// ============================================================================
// Types
// ============================================================================

export interface CardOptions {
	title?: string;
	meta?: string;
	value?: any;
	content?: any;
	children?: any;
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
		[key: string]: any;
	};
	styles?: {
		card?: Record<string, any>;
		header?: Record<string, any>;
		title?: Record<string, any>;
		meta?: Record<string, any>;
		body?: Record<string, any>;
		value?: Record<string, any>;
		empty?: Record<string, any>;
	};
}

// ============================================================================
// Default Configuration
// ============================================================================

const themeColorKeys = ["background", "border", "shadow", "hoverAccent", "value"];

const defaultCardColors = {
	light: {
		background: "rgba(245, 248, 252, 0.9)",
		border: "rgba(120, 140, 160, 0.18)",
		shadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
		hoverAccent: "var(--interactive-accent)",
		value: "var(--text-accent, var(--text-normal))",
	},
	dark: {
		background: "rgba(30, 41, 59, 0.72)",
		border: "rgba(148, 163, 184, 0.18)",
		shadow: "0 16px 36px rgba(2, 6, 23, 0.28)",
		hoverAccent: "var(--interactive-accent)",
		value: "var(--text-accent, var(--text-normal))",
	},
};

const defaultCardConfig: CardOptions = {
	title: "",
	meta: "",
	value: null,
	emptyText: "No content",
	flags: {
		showHeader: true,
		headerSep: true,
		showTitle: true,
		showMeta: true,
		showValue: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "16px",
		radius: "16px",
		gap: "14px",
		bodyGap: "12px",
	},
	colors: defaultCardColors,
	styles: {},
};

// ============================================================================
// Configuration Management
// ============================================================================

let cardConfig = { ...defaultCardConfig };

export function loadCardConfig(): CardOptions {
	return { ...cardConfig };
}

export function getDefaultCardConfig(): CardOptions {
	return { ...defaultCardConfig };
}

export function updateCardConfig(config: Partial<CardOptions>): void {
	cardConfig = { ...cardConfig, ...config };
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeChildren(content: any): any[] {
	if (content == null) {
		return [];
	}
	return Array.isArray(content) ? content : [content];
}

function mergeStyles(...styles: any[]): Record<string, any> {
	return styles.reduce((result, style) => {
		if (!style || typeof style !== "object") {
			return result;
		}
		return Object.assign(result, style);
	}, {});
}

function pickSharedColors(colors: Record<string, any> = {}): Record<string, any> {
	return themeColorKeys.reduce((result, key) => {
		if (colors[key] !== undefined) {
			result[key] = colors[key];
		}
		return result;
	}, {} as Record<string, any>);
}

function resolveThemeColors(colors: Record<string, any> = {}): { light: Record<string, any>; dark: Record<string, any> } {
	const sharedColors = pickSharedColors(colors);

	return {
		light: mergeStyles(defaultCardColors.light, sharedColors, colors.light),
		dark: mergeStyles(defaultCardColors.dark, sharedColors, colors.dark),
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function card(options: CardOptions = {}): HTMLElement {
	const resolved = { ...defaultCardConfig, ...options };
	const flags = resolved.flags || {};
	const layout = resolved.layout || {};
	const themeColors = resolveThemeColors(resolved.colors || {});
	const styles = resolved.styles || {};

	// Build header children
	const headerChildren: HTMLElement[] = [];
	const titleText = resolved.title;
	const metaText = resolved.meta;
	const valueContent = resolved.value;

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
	const bodyChildren: any[] = [];

	if (flags.showValue !== false && valueContent != null) {
		bodyChildren.push(
			createElement("div", {
				className: "ts-card__value",
				style: styles.value,
				text: String(valueContent),
			})
		);
	}

	bodyChildren.push(
		...normalizeChildren(
			resolved.content !== undefined ? resolved.content : resolved.children
		)
	);

	// Create card element
	return createElement("article", {
		className: ["ts-card", resolved.className],
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
						],
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
							text: resolved.emptyText,
						}),
			}),
		],
	});
}

// ============================================================================
// Default Export
// ============================================================================

export default card;
