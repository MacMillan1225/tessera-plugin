/**
 * TesseraScript Component: Example
 * Template component for creating new components
 */

import { createElement } from "../../core/dom";

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
// Default Configuration
// ============================================================================

const defaultExampleColors = {
	light: {
		background: "rgba(245, 248, 252, 0.9)",
		border: "rgba(120, 140, 160, 0.18)",
		eyebrow: "var(--text-muted)",
		title: "var(--text-normal)",
		text: "var(--text-muted)",
	},
	dark: {
		background: "rgba(30, 41, 59, 0.72)",
		border: "rgba(148, 163, 184, 0.18)",
		eyebrow: "var(--text-muted)",
		title: "var(--text-normal)",
		text: "var(--text-muted)",
	},
};

const defaultExampleConfig: ExampleOptions = {
	eyebrow: "",
	title: "",
	text: "",
	content: undefined,
	children: undefined,
	flags: {
		showEyebrow: true,
		showTitle: true,
		showText: true,
	},
	layout: {
		maxWidth: "100%",
		padding: "16px",
		radius: "12px",
		gap: "12px",
	},
	colors: defaultExampleColors,
	styles: {},
};

// ============================================================================
// Configuration Management
// ============================================================================

let exampleConfig = { ...defaultExampleConfig };

export function loadExampleConfig(): ExampleOptions {
	return { ...exampleConfig };
}

export function getDefaultExampleConfig(): ExampleOptions {
	return { ...defaultExampleConfig };
}

export function updateExampleConfig(config: Partial<ExampleOptions>): void {
	exampleConfig = { ...exampleConfig, ...config };
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
	const resolved = { ...defaultExampleConfig, ...options };
	const flags = resolved.flags || {};
	const layout = resolved.layout || {};
	const colors = resolved.colors || defaultExampleColors;
	const styles = resolved.styles || {};

	// Resolve theme colors
	const lightColors = { ...defaultExampleColors.light, ...colors.light };
	const darkColors = { ...defaultExampleColors.dark, ...colors.dark };

	// Create children
	const children: HTMLElement[] = [];

	// Eyebrow
	if (flags.showEyebrow !== false && resolved.eyebrow) {
		children.push(
			createElement("div", {
				className: "ts-example__eyebrow",
				style: {
					...styles.eyebrow,
					"--ts-example-eyebrow-light": lightColors.eyebrow,
					"--ts-example-eyebrow-dark": darkColors.eyebrow,
				},
				text: resolved.eyebrow,
			})
		);
	}

	// Title
	if (flags.showTitle !== false && resolved.title) {
		children.push(
			createElement("div", {
				className: "ts-example__title",
				style: {
					...styles.title,
					"--ts-example-title-light": lightColors.title,
					"--ts-example-title-dark": darkColors.title,
				},
				text: resolved.title,
			})
		);
	}

	// Text
	if (flags.showText !== false && resolved.text) {
		children.push(
			createElement("div", {
				className: "ts-example__text",
				style: {
					...styles.text,
					"--ts-example-text-light": lightColors.text,
					"--ts-example-text-dark": darkColors.text,
				},
				text: resolved.text,
			})
		);
	}

	// Content
	if (resolved.content) {
		children.push(
			createElement("div", {
				className: "ts-example__body",
				style: styles.body,
				children: resolved.content,
			})
		);
	}

	// Children
	if (resolved.children) {
		children.push(
			createElement("div", {
				className: "ts-example__body",
				style: styles.body,
				children: resolved.children,
			})
		);
	}

	// Create root element
	const root = createElement("section", {
		className: ["ts-example", resolved.className].filter(Boolean) as string[],
		style: {
			...styles.root,
			maxWidth: layout.maxWidth,
			"--ts-example-padding": layout.padding,
			"--ts-example-radius": layout.radius,
			"--ts-example-gap": layout.gap,
			"--ts-example-background-light": lightColors.background,
			"--ts-example-background-dark": darkColors.background,
			"--ts-example-border-light": lightColors.border,
			"--ts-example-border-dark": darkColors.border,
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

// ============================================================================
// Default Export
// ============================================================================

export default example;
