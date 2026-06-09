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
	value?: number;
	max?: number;
	min?: number;
	labelFormat?: string;
	flags?: {
		showLabel?: boolean;
		showGlow?: boolean;
		showStriped?: boolean;
		showAnimated?: boolean;
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

export interface ProgressbarInstance extends HTMLElement {
	/** Progress value. Updates fill width and ARIA attributes. */
	value: number;
	/** Maximum value. Recalculates progress ratio. */
	max: number;
	/** Minimum value. Recalculates progress ratio. */
	min: number;
	/** Exposed parts for direct DOM access. */
	parts: { fill: HTMLElement };
}

// ============================================================================
// Component Function
// ============================================================================

export function progressbar(options: ProgressbarOptions = {}): ProgressbarInstance {
	let _value = options.value ?? PROGRESSBAR_DEFAULTS.value;
	let _max = options.max ?? PROGRESSBAR_DEFAULTS.max;
	let _min = options.min ?? PROGRESSBAR_DEFAULTS.min;
	const flags = { ...PROGRESSBAR_DEFAULTS.flags, ...options.flags };
	const layout = { ...PROGRESSBAR_DEFAULTS.layout, ...options.layout };
	const colors = {
		light: { ...PROGRESSBAR_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...PROGRESSBAR_DEFAULTS.colors.dark, ...options.colors?.dark },
	};
	const styles = options.styles || {};

	// Calculate progress
	const progress = resolveProgress(_value, _min, _max);

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
			"--ts-progressbar-fill-color": colors.light.fill,
			"--ts-progressbar-fill-color-dark": colors.dark.fill,
		},
	});

	// Create root element
	const root = createElement("div", {
		className: [
			"ts-progressbar",
			flags.showAnimated === false && "ts-progressbar--static",
			flags.showStriped === true && "ts-progressbar--striped",
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
			"--ts-progressbar-track-light": colors.light.track,
			"--ts-progressbar-track-dark": colors.dark.track,
			"--ts-progressbar-fill-light": colors.light.fill,
			"--ts-progressbar-fill-dark": colors.dark.fill,
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
		const progress = resolveProgress(_value, _min, _max);
		fill.style.width = `${progress.percent}%`;
		fill.style.minWidth = progress.percent > 0 ? "2px" : "0";
		root.setAttribute("aria-valuenow", String(progress.percent));
	}

	// ---- Reactive property accessors --------------------------------------

	Object.defineProperty(result, "value", {
		get: () => _value,
		set(v: number) { _value = v; updateProgress(); },
		enumerable: true, configurable: true,
	});

	Object.defineProperty(result, "max", {
		get: () => _max,
		set(v: number) { _max = v; updateProgress(); },
		enumerable: true, configurable: true,
	});

	Object.defineProperty(result, "min", {
		get: () => _min,
		set(v: number) { _min = v; updateProgress(); },
		enumerable: true, configurable: true,
	});

	return result;
}
