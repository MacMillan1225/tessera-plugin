/**
 * TesseraScript Component: Progressbar
 * Progress bar component for displaying progress
 */

// ============================================================================
// Types
// ============================================================================

export interface ProgressbarOptions {
	value?: number;
	max?: number;
	min?: number;
	showLabel?: boolean;
	labelFormat?: string;
	flags?: {
		showGlow?: boolean;
		striped?: boolean;
		animated?: boolean;
	};
	layout?: {
		width?: string;
		height?: string;
		radius?: string;
		trackOpacity?: number;
	};
	colors?: {
		light?: {
			track?: string;
			trackBorder?: string;
			fill?: string;
			fillGradient?: string;
			shadow?: string;
			glow?: string;
		};
		dark?: {
			track?: string;
			trackBorder?: string;
			fill?: string;
			fillGradient?: string;
			shadow?: string;
			glow?: string;
		};
	};
	styles?: {
		root?: Record<string, unknown>;
		fill?: Record<string, unknown>;
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

const defaultProgressbarColors = {
	light: {
		track: "#e2e8f0",
		trackBorder: "rgba(148, 163, 184, 0.24)",
		fill: "#22c55e",
		fillGradient: "linear-gradient(90deg, #22c55e 0%, #34d399 100%)",
		shadow: "inset 0 1px 2px rgba(15, 23, 42, 0.05)",
		glow: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.22))",
	},
	dark: {
		track: "rgba(148, 163, 184, 0.18)",
		trackBorder: "rgba(148, 163, 184, 0.2)",
		fill: "#2dd4bf",
		fillGradient: "linear-gradient(90deg, #14b8a6 0%, #38bdf8 100%)",
		shadow: "inset 0 1px 2px rgba(15, 23, 42, 0.22)",
		glow: "drop-shadow(0 0 10px rgba(45, 212, 191, 0.18))",
	},
};

// ============================================================================
// Helper Functions
// ============================================================================

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function resolveProgress(value: number, min: number, max: number): { ratio: number; percent: number } {
	if (!Number.isFinite(value)) {
		return { ratio: 0, percent: 0 };
	}

	if (max > min) {
		const ratio = clamp((value - min) / (max - min), 0, 1);
		return {
			ratio,
			percent: Math.round(ratio * 100),
		};
	}

	const fallbackRatio = value > 1 ? clamp(value / 100, 0, 1) : clamp(value, 0, 1);
	return {
		ratio: fallbackRatio,
		percent: Math.round(fallbackRatio * 100),
	};
}

// ============================================================================
// Parts interface for type-safe parts exposure
// ============================================================================

interface ProgressbarWithParts extends HTMLElement {
	parts: {
		fill: HTMLElement;
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function progressbar(options: ProgressbarOptions = {}): HTMLElement {
	const value = options.value || 0;
	const max = options.max || 1;
	const min = options.min || 0;
	const flags = options.flags || {};
	const layout = options.layout || {};
	const colors = options.colors || defaultProgressbarColors;
	const styles = options.styles || {};

	// Resolve theme colors
	const lightColors = { ...defaultProgressbarColors.light, ...colors.light };
	const darkColors = { ...defaultProgressbarColors.dark, ...colors.dark };

	// Calculate progress
	const progress = resolveProgress(value, min, max);

	// Create fill element
	const fill = createElement("div", {
		className: [
			"ts-progressbar__fill",
			flags.striped === true && flags.animated !== false && "ts-progressbar__fill--animated",
		].filter(Boolean) as string[],
		style: {
			...styles.fill,
			width: `${progress.percent}%`,
			minWidth: progress.percent > 0 ? "2px" : "0",
			"--ts-progressbar-fill-color": lightColors.fill,
			"--ts-progressbar-fill-color-dark": darkColors.fill,
		},
	});

	// Create root element
	const root = createElement("div", {
		className: [
			"ts-progressbar",
			flags.animated === false && "ts-progressbar--static",
			flags.striped === true && "ts-progressbar--striped",
			flags.showGlow === false && "ts-progressbar--no-glow",
			options.className,
		].filter(Boolean) as string[],
		attrs: {
			role: "progressbar",
			"aria-label": options.labelFormat || "Progress",
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-valuenow": progress.percent,
		},
		style: {
			...styles.root,
			width: layout.width || "100%",
			"--ts-progressbar-height": layout.height || "10px",
			"--ts-progressbar-radius": layout.radius || "999px",
			"--ts-progressbar-track-opacity": layout.trackOpacity || 1,
			"--ts-progressbar-track-light": lightColors.track,
			"--ts-progressbar-track-dark": darkColors.track,
			"--ts-progressbar-track-border-light": lightColors.trackBorder,
			"--ts-progressbar-track-border-dark": darkColors.trackBorder,
			"--ts-progressbar-fill-light": lightColors.fill,
			"--ts-progressbar-fill-dark": darkColors.fill,
			"--ts-progressbar-fill-gradient-light": lightColors.fillGradient,
			"--ts-progressbar-fill-gradient-dark": darkColors.fillGradient,
			"--ts-progressbar-shadow-light": lightColors.shadow,
			"--ts-progressbar-shadow-dark": darkColors.shadow,
			"--ts-progressbar-glow-light": lightColors.glow,
			"--ts-progressbar-glow-dark": darkColors.glow,
		},
		children: fill,
	});

	// Expose parts
	const result = root as ProgressbarWithParts;
	result.parts = {
		fill,
	};

	return result;
}

// ============================================================================
// Default Export
// ============================================================================

export default progressbar;
