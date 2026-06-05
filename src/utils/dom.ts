// ============================================================================
// DOM Utilities
// ============================================================================

export function toString(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return JSON.stringify(value);
}

export function assignClasses(element: HTMLElement, className?: string | string[]): HTMLElement {
	if (!className) {
		return element;
	}

	const classes = Array.isArray(className)
		? className.flatMap((item) => String(item || "").split(/\s+/))
		: String(className).split(/\s+/);

	classes.filter(Boolean).forEach((name) => element.classList.add(name));
	return element;
}

export function assignStyles(element: HTMLElement, styles?: Record<string, unknown>): HTMLElement {
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

export function appendChildren(element: Node, children?: unknown): Node {
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

export function createElement(tagName: string, options: {
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

	if (options.attrs) {
		Object.entries(options.attrs).forEach(([key, value]) => {
			if (value != null) {
				element.setAttribute(key, toString(value));
			}
		});
	}

	if (options.text != null) {
		element.textContent = String(options.text);
	}

	if (options.children != null) {
		appendChildren(element, options.children);
	}

	return element;
}

// ============================================================================
// Children Normalization
// ============================================================================

export function normalizeChildren(content: unknown): unknown[] {
	if (content == null) {
		return [];
	}
	return Array.isArray(content) ? content : [content];
}

// ============================================================================
// Style Merging
// ============================================================================

export function mergeStyles(...styles: unknown[]): Record<string, unknown> {
	return styles.reduce<Record<string, unknown>>((result, style) => {
		if (!style || typeof style !== "object") {
			return result;
		}
		return Object.assign(result, style);
	}, {});
}

// ============================================================================
// Theme Color Resolution
// ============================================================================

const SHARED_COLOR_KEYS = ["background", "border", "shadow", "hoverAccent", "value"];

export function pickSharedColors(colors: Record<string, unknown> = {}): Record<string, unknown> {
	return SHARED_COLOR_KEYS.reduce<Record<string, unknown>>((result, key) => {
		if (colors[key] !== undefined) {
			result[key] = colors[key];
		}
		return result;
	}, {});
}

export function resolveThemeColors(
	colors: Record<string, unknown> = {},
	defaults: { light: Record<string, unknown>; dark: Record<string, unknown> },
): { light: Record<string, unknown>; dark: Record<string, unknown> } {
	const sharedColors = pickSharedColors(colors);

	return {
		light: mergeStyles(defaults.light, sharedColors, colors.light),
		dark: mergeStyles(defaults.dark, sharedColors, colors.dark),
	};
}
