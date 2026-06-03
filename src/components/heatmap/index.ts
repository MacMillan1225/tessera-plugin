/**
 * TesseraScript Component: Heatmap
 * Calendar heatmap component for data visualization
 */

// ============================================================================
// Types
// ============================================================================

export interface HeatmapOptions {
	data?: Record<string, number> | Array<{ date: string; value: number }>;
	startDate?: string;
	endDate?: string;
	cellSize?: number;
	cellGap?: number;
	colors?: {
		empty?: string;
		levels?: string[];
		light?: {
			empty?: string;
			levels?: string[];
		};
		dark?: {
			empty?: string;
			levels?: string[];
		};
	};
	labels?: {
		showMonths?: boolean;
		showDays?: boolean;
		monthFormat?: string;
		dayFormat?: string;
	};
	styles?: {
		root?: Record<string, unknown>;
		cell?: Record<string, unknown>;
		label?: Record<string, unknown>;
		grid?: Record<string, unknown>;
	};
	className?: string | string[];
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
// Default Configuration
// ============================================================================

const defaultHeatmapColors = {
	light: {
		empty: "#f1f5f9",
		levels: [
			"#f1f5f9",
			"#dcfce7",
			"#bbf7d0",
			"#86efac",
			"#4ade80",
			"#22c55e",
			"#16a34a",
			"#15803d",
			"#14532d",
		],
	},
	dark: {
		empty: "#334155",
		levels: [
			"#334155",
			"#064e3b",
			"#065f46",
			"#047857",
			"#059669",
			"#10b981",
			"#34d399",
			"#6ee7b7",
			"#a7f3d0",
		],
	},
};

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeData(data: Record<string, number> | Array<{ date: string; value: number }>): Record<string, number> {
	if (Array.isArray(data)) {
		return data.reduce((acc, item) => {
			acc[item.date] = item.value;
			return acc;
		}, {} as Record<string, number>);
	}
	return data;
}

function getDateRange(startDate?: string, endDate?: string): { start: Date; end: Date } {
	const end = endDate ? new Date(endDate) : new Date();
	const start = startDate ? new Date(startDate) : new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
	return { start, end };
}

function formatDate(date: Date): string {
	return date.toISOString().split("T")[0] ?? "";
}

function getLevel(value: number, max: number): number {
	if (value === 0) return 0;
	if (max === 0) return 1;
	const ratio = value / max;
	return Math.min(Math.ceil(ratio * 8), 8);
}

// ============================================================================
// Parts interface for type-safe parts exposure
// ============================================================================

interface HeatmapWithParts extends HTMLElement {
	parts: {
		grid: HTMLElement;
		cells: HTMLElement[];
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function heatmap(options: HeatmapOptions = {}): HTMLElement {
	const data = normalizeData(options.data || {});
	const { start, end } = getDateRange(options.startDate, options.endDate);
	const cellSize = options.cellSize || 11;
	const cellGap = options.cellGap || 2;
	const colors = options.colors || defaultHeatmapColors;
	const styles = options.styles || {};

	// Resolve theme colors
	const lightColors = { ...defaultHeatmapColors.light, ...colors.light };
	const darkColors = { ...defaultHeatmapColors.dark, ...colors.dark };

	// Find max value
	const values = Object.values(data);
	const max = values.length > 0 ? Math.max(...values) : 0;

	// Generate cells
	const cells: HTMLElement[] = [];
	const current = new Date(start);

	while (current <= end) {
		const dateStr = formatDate(current);
		const value = data[dateStr] || 0;
		const level = getLevel(value, max);

		const cell = createElement("div", {
			className: ["ts-heatmap__cell", `is-level-${level}`],
			style: styles.cell,
			attrs: {
				"aria-label": dateStr,
			},
		});

		cells.push(cell);
		current.setDate(current.getDate() + 1);
	}

	// Create grid with week columns
	const grid = createElement("div", {
		className: "ts-heatmap__grid",
		style: styles.grid,
	});

	// Group cells into week columns (7 days each)
	for (let i = 0; i < cells.length; i += 7) {
		const weekColumn = createElement("div", {
			className: "ts-heatmap__week-column",
			children: cells.slice(i, i + 7),
		});
		grid.appendChild(weekColumn);
	}

	// Create root with CSS variables for colors
	const root = createElement("div", {
		className: ["ts-heatmap", options.className].filter(Boolean) as string[],
		style: {
			...styles.root,
			"--ts-heatmap-cell-size": `${cellSize}px`,
			"--ts-heatmap-cell-gap": `${cellGap}px`,
			"--ts-heatmap-light-empty": lightColors.empty,
			"--ts-heatmap-dark-empty": darkColors.empty,
		},
		children: [grid],
	});

	// Set level colors as CSS variables
	lightColors.levels.forEach((color, index) => {
		root.style.setProperty(`--ts-heatmap-light-level-${index}`, color);
	});
	darkColors.levels.forEach((color, index) => {
		root.style.setProperty(`--ts-heatmap-dark-level-${index}`, color);
	});

	// Expose parts
	const result = root as HeatmapWithParts;
	result.parts = {
		grid,
		cells,
	};

	return result;
}

// ============================================================================
// Default Export
// ============================================================================

export default heatmap;
