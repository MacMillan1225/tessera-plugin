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
	const value = options.value ?? PROGRESSBAR_DEFAULTS.value;
	const max = options.max ?? PROGRESSBAR_DEFAULTS.max;
	const min = options.min ?? PROGRESSBAR_DEFAULTS.min;
	const flags = { ...PROGRESSBAR_DEFAULTS.flags, ...options.flags };
	const layout = { ...PROGRESSBAR_DEFAULTS.layout, ...options.layout };
	const colors = {
		light: { ...PROGRESSBAR_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...PROGRESSBAR_DEFAULTS.colors.dark, ...options.colors?.dark },
	};
	const styles = options.styles || {};

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
			"--ts-progressbar-fill-color": colors.light.fill,
			"--ts-progressbar-fill-color-dark": colors.dark.fill,
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
			"--ts-progressbar-track-light": colors.light.track,
			"--ts-progressbar-track-dark": colors.dark.track,
			"--ts-progressbar-fill-light": colors.light.fill,
			"--ts-progressbar-fill-dark": colors.dark.fill,
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
