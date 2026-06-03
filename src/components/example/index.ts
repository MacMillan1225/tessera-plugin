/**
 * TesseraScript Component: Example
 * Template component for creating new components
 */

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
	const flags = options.flags || {};
	const layout = options.layout || {};
	const colors = options.colors || defaultExampleColors;
	const styles = options.styles || {};

	// Resolve theme colors
	const lightColors = { ...defaultExampleColors.light, ...colors.light };
	const darkColors = { ...defaultExampleColors.dark, ...colors.dark };

	// Create children
	const children: HTMLElement[] = [];

	// Eyebrow
	if (flags.showEyebrow !== false && options.eyebrow) {
		children.push(
			createElement("div", {
				className: "ts-example__eyebrow",
				style: {
					...styles.eyebrow,
					"--ts-example-eyebrow-light": lightColors.eyebrow,
					"--ts-example-eyebrow-dark": darkColors.eyebrow,
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
					"--ts-example-title-light": lightColors.title,
					"--ts-example-title-dark": darkColors.title,
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
					"--ts-example-text-light": lightColors.text,
					"--ts-example-text-dark": darkColors.text,
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
