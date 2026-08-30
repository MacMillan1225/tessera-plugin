/**
 * TesseraScript Component: Progressbar
 * Progress bar component for displaying progress
 */

import { PROGRESSBAR_DEFAULTS } from "./config";
import { createElement } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface ProgressbarOptions {
	/** Progress value as a ratio 0..1 (e.g. 0.5 = 50%). */
	value?: number;
	/** Label template. {value} = integer percent (50), {raw} = raw ratio (0.5). */
	labelFormat?: string;
	flags?: {
		showLabel?: boolean;
		showStriped?: boolean;
		showAnimated?: boolean;
	};
	layout?: {
		width?: string;
		height?: string;
		radius?: string;
	};
	colors?: {
		light?: {
			background?: string;
			border?: string;
			text?: string;
			accent?: string;
		};
		dark?: {
			background?: string;
			border?: string;
			text?: string;
			accent?: string;
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

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Resolve progress from a ratio 0..1.
 * value 0.5 → ratio 0.5 → percent 50.
 */
function resolveProgress(value: number): { ratio: number; percent: number } {
	if (!Number.isFinite(value)) {
		return { ratio: 0, percent: 0 };
	}

	const ratio = clamp(value, 0, 1);
	return {
		ratio,
		percent: Math.round(ratio * 100),
	};
}

/** Fill label template tokens: {value} → integer percent, {raw} → raw ratio. */
function formatLabel(template: string, ratio: number, percent: number): string {
	return template
		.replace(/\{value\}/g, String(percent))
		.replace(/\{raw\}/g, String(Math.round(ratio * 1000) / 1000));
}

// ============================================================================
// Parts interface for type-safe parts exposure
// ============================================================================

export interface ProgressbarInstance extends HTMLElement {
	/** Progress value as a ratio 0..1. Updates fill width and ARIA attributes. */
	value: number;
	/** Exposed parts for direct DOM access. */
	parts: { fill: HTMLElement };
}

// ============================================================================
// Component Function
// ============================================================================

export function progressbar(options: ProgressbarOptions = {}): ProgressbarInstance {
	let _value = options.value ?? PROGRESSBAR_DEFAULTS.value;
	const flags = { ...PROGRESSBAR_DEFAULTS.flags, ...options.flags };
	const layout = { ...PROGRESSBAR_DEFAULTS.layout, ...options.layout };
	const colors = {
		light: { ...PROGRESSBAR_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...PROGRESSBAR_DEFAULTS.colors.dark, ...options.colors?.dark },
	};
	const styles = options.styles || {};

	// Calculate progress
	const progress = resolveProgress(_value);

	// Create fill element
	const fill = createElement("div", {
		className: [
			"ts-progressbar__fill",
			flags.showStriped === true && flags.showAnimated !== false && "ts-progressbar__fill--animated",
		].filter(Boolean) as string[],
		style: {
			...styles.fill,
			width: `${progress.percent}%`,
			minWidth: progress.percent > 0 ? "2px" : "0",
			"--ts-progressbar-accent-color": colors.light.accent,
			"--ts-progressbar-accent-color-dark": colors.dark.accent,
		},
	});

	// Create root element
	const root = createElement("div", {
		className: [
			"ts-progressbar",
			flags.showAnimated === false && "ts-progressbar--static",
			flags.showStriped === true && "ts-progressbar--striped",
			options.className,
		].filter(Boolean) as string[],
		attrs: {
			role: "progressbar",
			"aria-label": formatLabel(options.labelFormat ?? PROGRESSBAR_DEFAULTS.labelFormat, progress.ratio, progress.percent),
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-valuenow": progress.percent,
		},
		style: {
			...styles.root,
			width: layout.width || "100%",
			"--ts-progressbar-height": layout.height || "10px",
			"--ts-progressbar-radius": layout.radius || "999px",
			"--ts-progressbar-background-light": colors.light.background,
			"--ts-progressbar-background-dark": colors.dark.background,
			"--ts-progressbar-border-light": colors.light.border,
			"--ts-progressbar-border-dark": colors.dark.border,
			"--ts-progressbar-text-light": colors.light.text,
			"--ts-progressbar-text-dark": colors.dark.text,
			"--ts-progressbar-accent-light": colors.light.accent,
			"--ts-progressbar-accent-dark": colors.dark.accent,
		},
		children: fill,
	});

	// Expose parts
	const result = root as ProgressbarInstance;
	result.parts = {
		fill,
	};

	// ---- Reactive update function -----------------------------------------
	function updateProgress(): void {
		const progress = resolveProgress(_value);
		fill.style.width = `${progress.percent}%`;
		fill.style.minWidth = progress.percent > 0 ? "2px" : "0";
		root.setAttribute("aria-valuenow", String(progress.percent));
		root.setAttribute(
			"aria-label",
			formatLabel(options.labelFormat ?? PROGRESSBAR_DEFAULTS.labelFormat, progress.ratio, progress.percent),
		);
	}

	// ---- Reactive property accessors --------------------------------------

	Object.defineProperty(result, "value", {
		get: () => _value,
		set(v: number) { _value = v; updateProgress(); },
		enumerable: true, configurable: true,
	});

	return result;
}
