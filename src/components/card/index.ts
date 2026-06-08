/**
 * TesseraScript Component: Card
 * General-purpose card component for dashboards and panels
 */

import { CARD_DEFAULTS } from "./config";
import { createElement, normalizeChildren, mergeStyles, resolveThemeColors } from "../../utils/dom";

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

// ============================================================================
// Component Function
// ============================================================================

export function card(options: CardOptions = {}): HTMLElement {
	const flags = options.flags || {};
	const layout = options.layout || {};
	const themeColors = resolveThemeColors(options.colors || {}, CARD_DEFAULTS.colors);
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
							flags.showHeaderSep !== false && "ts-card__header--sep",
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
