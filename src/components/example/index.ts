/**
 * TesseraScript Component: Example
 * Template component for creating new components
 */

import { EXAMPLE_DEFAULTS } from "./config";
import { createElement } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface ExampleOptions {
	eyebrow?: string;
	title?: string;
	text?: string;
	content?: unknown;
	children?: unknown;
	className?: string | string[];
	flags?: {
		showEyebrow?: boolean;
		showTitle?: boolean;
		showText?: boolean;
	};
	layout?: {
		maxWidth?: string;
		padding?: string;
		radius?: string;
		gap?: string;
	};
	colors?: {
		light?: {
			background?: string;
			border?: string;
			eyebrow?: string;
			title?: string;
			text?: string;
		};
		dark?: {
			background?: string;
			border?: string;
			eyebrow?: string;
			title?: string;
			text?: string;
		};
	};
	styles?: {
		root?: Record<string, unknown>;
		eyebrow?: Record<string, unknown>;
		title?: Record<string, unknown>;
		text?: Record<string, unknown>;
		body?: Record<string, unknown>;
	};
}

// ============================================================================
// Parts interface for type-safe parts exposure
// ============================================================================

interface ExampleWithParts extends HTMLElement {
	parts: {
		eyebrow: HTMLElement;
		title: HTMLElement;
		text: HTMLElement;
		body: HTMLElement;
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function example(options: ExampleOptions = {}): HTMLElement {
	const flags = { ...EXAMPLE_DEFAULTS.flags, ...options.flags };
	const layout = { ...EXAMPLE_DEFAULTS.layout, ...options.layout };
	const colors = {
		light: { ...EXAMPLE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...EXAMPLE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};
	const styles = options.styles || {};

	// Create children
	const children: HTMLElement[] = [];

	// Eyebrow
	if (flags.showEyebrow !== false && options.eyebrow) {
		children.push(
			createElement("div", {
				className: "ts-example__eyebrow",
				style: {
					...styles.eyebrow,
					"--ts-example-eyebrow-light": colors.light.eyebrow,
					"--ts-example-eyebrow-dark": colors.dark.eyebrow,
				},
				text: options.eyebrow,
			})
		);
	}

	// Title
	if (flags.showTitle !== false && options.title) {
		children.push(
			createElement("div", {
				className: "ts-example__title",
				style: {
					...styles.title,
					"--ts-example-title-light": colors.light.title,
					"--ts-example-title-dark": colors.dark.title,
				},
				text: options.title,
			})
		);
	}

	// Text
	if (flags.showText !== false && options.text) {
		children.push(
			createElement("div", {
				className: "ts-example__text",
				style: {
					...styles.text,
					"--ts-example-text-light": colors.light.text,
					"--ts-example-text-dark": colors.dark.text,
				},
				text: options.text,
			})
		);
	}

	// Content
	if (options.content) {
		children.push(
			createElement("div", {
				className: "ts-example__body",
				style: styles.body,
				children: options.content,
			})
		);
	}

	// Children
	if (options.children) {
		children.push(
			createElement("div", {
				className: "ts-example__body",
				style: styles.body,
				children: options.children,
			})
		);
	}

	// Create root element
	const root = createElement("section", {
		className: ["ts-example", options.className].filter(Boolean) as string[],
		style: {
			...styles.root,
			maxWidth: layout.maxWidth,
			"--ts-example-padding": layout.padding,
			"--ts-example-radius": layout.radius,
			"--ts-example-gap": layout.gap,
			"--ts-example-background-light": colors.light.background,
			"--ts-example-background-dark": colors.dark.background,
			"--ts-example-border-light": colors.light.border,
			"--ts-example-border-dark": colors.dark.border,
		},
		children,
	});

	// Expose parts
	const result = root as ExampleWithParts;
	result.parts = {
		eyebrow: children[0] as HTMLElement,
		title: children[1] as HTMLElement,
		text: children[2] as HTMLElement,
		body: children[3] as HTMLElement,
	};

	return result;
}
