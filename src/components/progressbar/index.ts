/**
 * TesseraScript Component: Progressbar
 * Progress bar component for displaying progress
 */

import { createElement } from "../../core/dom";

// ============================================================================
// Types
// ============================================================================

export interface ProgressbarOptions {
	value?: number;
	max?: number;
	min?: number;
	showLabel?: boolean;
	labelFormat?: string;
	colors?: {
		light?: {
			background?: string;
			fill?: string;
			label?: string;
		};
		dark?: {
			background?: string;
			fill?: string;
			label?: string;
		};
	};
	styles?: {
		root?: Record<string, any>;
		bar?: Record<string, any>;
		fill?: Record<string, any>;
		label?: Record<string, any>;
	};
	className?: string | string[];
}

// ============================================================================
// Default Configuration
// ============================================================================

const defaultProgressbarColors = {
	light: {
		background: "rgba(0, 0, 0, 0.08)",
		fill: "var(--interactive-accent)",
		label: "var(--text-normal)",
	},
	dark: {
		background: "rgba(255, 255, 255, 0.08)",
		fill: "var(--interactive-accent)",
		label: "var(--text-normal)",
	},
};

const defaultProgressbarConfig: ProgressbarOptions = {
	value: 0,
	max: 100,
	min: 0,
	showLabel: true,
	labelFormat: "{value}%",
	colors: defaultProgressbarColors,
	styles: {},
};

// ============================================================================
// Configuration Management
// ============================================================================

let progressbarConfig = { ...defaultProgressbarConfig };

export function loadProgressbarConfig(): ProgressbarOptions {
	return { ...progressbarConfig };
}

export function getDefaultProgressbarConfig(): ProgressbarOptions {
	return { ...defaultProgressbarConfig };
}

export function updateProgressbarConfig(config: Partial<ProgressbarOptions>): void {
	progressbarConfig = { ...progressbarConfig, ...config };
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatLabel(format: string, value: number, max: number, min: number): string {
	const percentage = ((value - min) / (max - min)) * 100;
	return format
		.replace("{value}", String(value))
		.replace("{max}", String(max))
		.replace("{min}", String(min))
		.replace("{percentage}", String(Math.round(percentage)));
}

function calculatePercentage(value: number, max: number, min: number): number {
	if (max === min) return 0;
	return ((value - min) / (max - min)) * 100;
}

// ============================================================================
// Component Function
// ============================================================================

export function progressbar(options: ProgressbarOptions = {}): HTMLElement {
	const resolved = { ...defaultProgressbarConfig, ...options };
	const value = resolved.value || 0;
	const max = resolved.max || 100;
	const min = resolved.min || 0;
	const colors = resolved.colors || defaultProgressbarColors;
	const styles = resolved.styles || {};

	// Resolve theme colors
	const lightColors = { ...defaultProgressbarColors.light, ...colors.light };
	const darkColors = { ...defaultProgressbarColors.dark, ...colors.dark };

	// Calculate percentage
	const percentage = calculatePercentage(value, max, min);

	// Create label
	const label = resolved.showLabel !== false
		? createElement("div", {
				className: "ts-progressbar__label",
				style: {
					...styles.label,
					"--ts-progressbar-label-light": lightColors.label,
					"--ts-progressbar-label-dark": darkColors.label,
				},
				text: formatLabel(resolved.labelFormat || "{value}%", value, max, min),
			})
		: null;

	// Create fill
	const fill = createElement("div", {
		className: "ts-progressbar__fill",
		style: {
			...styles.fill,
			width: `${percentage}%`,
			"--ts-progressbar-fill-light": lightColors.fill,
			"--ts-progressbar-fill-dark": darkColors.fill,
		},
	});

	// Create bar
	const bar = createElement("div", {
		className: "ts-progressbar__bar",
		style: {
			...styles.bar,
			"--ts-progressbar-background-light": lightColors.background,
			"--ts-progressbar-background-dark": darkColors.background,
		},
		children: [fill],
	});

	// Create root
	const root = createElement("div", {
		className: ["ts-progressbar", resolved.className],
		style: styles.root,
		children: [bar, label].filter(Boolean),
	});

	// Expose parts
	(root as any).parts = {
		bar,
		fill,
		label,
	};

	return root;
}

// ============================================================================
// Default Export
// ============================================================================

export default progressbar;
