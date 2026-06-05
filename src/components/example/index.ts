/**
 * TesseraScript Component: Example
 * Template component for creating new components
 */

import { EXAMPLE_DEFAULTS } from "./config";

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

// ============================================================================
// Default Export
// ============================================================================

export default example;
