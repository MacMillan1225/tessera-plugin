/**
 * TesseraScript Core: DOM Module
 * Provides DOM creation and manipulation utilities
 */

// ============================================================================
// Types
// ============================================================================

export interface CreateElementOptions {
	className?: string | string[];
	attrs?: Record<string, any>;
	style?: Record<string, any>;
	text?: string;
	html?: string;
	children?: any | any[];
}

// ============================================================================
// Helper Functions
// ============================================================================

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

function assignStyles(element: HTMLElement, styles?: Record<string, any>): HTMLElement {
	if (!styles || typeof styles !== "object") {
		return element;
	}

	Object.entries(styles).forEach(([key, value]) => {
		if (value == null) {
			return;
		}

		if (key.startsWith("--") || key.includes("-")) {
			element.style.setProperty(key, String(value));
			return;
		}

		(element.style as any)[key] = value;
	});

	return element;
}

function assignAttributes(element: HTMLElement, attrs?: Record<string, any>): HTMLElement {
	if (!attrs || typeof attrs !== "object") {
		return element;
	}

	Object.entries(attrs).forEach(([key, value]) => {
		if (value == null) {
			return;
		}

		if (key === "dataset" && value && typeof value === "object") {
			Object.entries(value).forEach(([dataKey, dataValue]) => {
				if (dataValue != null) {
					element.dataset[dataKey] = String(dataValue);
				}
			});
			return;
		}

		if (key in element && key !== "style") {
			(element as any)[key] = value;
			return;
		}

		element.setAttribute(key, String(value));
	});

	return element;
}

function appendChildren(element: Node, children?: any | any[]): Node {
	const list = Array.isArray(children) ? children : [children];

	list.flat(Infinity).forEach((child) => {
		if (child == null || child === false) {
			return;
		}

		if (child instanceof Node) {
			element.appendChild(child);
			return;
		}

		element.appendChild(document.createTextNode(String(child)));
	});

	return element;
}

// ============================================================================
// Main Functions
// ============================================================================

export function createElement(tagName: string, options: CreateElementOptions = {}): HTMLElement {
	const element = document.createElement(tagName);

	assignClasses(element, options.className);
	assignAttributes(element, options.attrs);
	assignStyles(element, options.style);

	if (options.text != null) {
		element.textContent = String(options.text);
	}

	if (options.html != null) {
		element.innerHTML = String(options.html);
	}

	if (options.children != null) {
		appendChildren(element, options.children);
	}

	return element;
}

export function fragment(children?: any | any[]): DocumentFragment {
	const node = document.createDocumentFragment();
	if (children) {
		appendChildren(node, children);
	}
	return node;
}

// ============================================================================
// Exports
// ============================================================================

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
