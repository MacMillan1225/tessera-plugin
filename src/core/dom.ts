/**
 * TesseraScript Core: DOM Module
 * Provides DOM creation and manipulation utilities
 */

// ============================================================================
// Types
// ============================================================================

export interface CreateElementOptions {
	className?: string | string[];
	attrs?: Record<string, unknown>;
	style?: Record<string, unknown>;
	text?: string;
	html?: string;
	children?: unknown;
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

function assignAttributes(element: HTMLElement, attrs?: Record<string, unknown>): HTMLElement {
	if (!attrs || typeof attrs !== "object") {
		return element;
	}

	Object.entries(attrs).forEach(([key, value]) => {
		if (value == null) {
			return;
		}

		if (key === "dataset" && value && typeof value === "object") {
			Object.entries(value as Record<string, unknown>).forEach(([dataKey, dataValue]) => {
				if (dataValue != null) {
					element.dataset[dataKey] = toString(dataValue);
				}
			});
			return;
		}

		if (key in element && key !== "style") {
			(element as unknown as Record<string, unknown>)[key] = value;
			return;
		}

		element.setAttribute(key, toString(value));
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

// ============================================================================
// Main Functions
// ============================================================================

export function createElement(tagName: string, options: CreateElementOptions = {}): HTMLElement {
	// eslint-disable-next-line obsidianmd/prefer-active-doc
	const element = document.createElement(tagName);

	assignClasses(element, options.className);
	assignAttributes(element, options.attrs);
	assignStyles(element, options.style);

	if (options.text != null) {
		element.textContent = String(options.text);
	}

	if (options.html != null) {
		element.textContent = String(options.html);
	}

	if (options.children != null) {
		appendChildren(element, options.children);
	}

	return element;
}

export function fragment(children?: unknown): DocumentFragment {
	// eslint-disable-next-line obsidianmd/prefer-active-doc
	const node = document.createDocumentFragment();
	if (children) {
		appendChildren(node, children);
	}
	return node;
}

// ============================================================================
// Exports
// ============================================================================

export {
	assignClasses,
	assignAttributes,
	assignStyles,
	appendChildren,
};

export const dom = {
	createElement,
	el: createElement,
	fragment,
	appendChildren,
	assignClasses,
	assignAttributes,
	assignStyles,
};

export default dom;
