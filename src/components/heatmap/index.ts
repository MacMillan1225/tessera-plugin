/**
 * TesseraScript Component: Heatmap
 * Calendar heatmap component for data visualization
 */

import { createElement } from "../../core/dom";

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
	};
	className?: string | string[];
}

// ============================================================================
// Default Configuration
// ============================================================================

const defaultHeatmapColors = {
	light: {
		empty: "rgba(0, 0, 0, 0.05)",
		levels: [
			"rgba(0, 109, 44, 0.15)",
			"rgba(0, 109, 44, 0.4)",
			"rgba(0, 109, 44, 0.65)",
			"rgba(0, 109, 44, 0.85)",
		],
	},
	dark: {
		empty: "rgba(255, 255, 255, 0.05)",
		levels: [
			"rgba(0, 200, 80, 0.15)",
			"rgba(0, 200, 80, 0.4)",
			"rgba(0, 200, 80, 0.65)",
			"rgba(0, 200, 80, 0.85)",
		],
	},
};

const defaultHeatmapConfig: HeatmapOptions = {
	data: {},
	startDate: undefined,
	endDate: undefined,
	cellSize: 12,
	cellGap: 2,
	colors: defaultHeatmapColors,
	labels: {
		showMonths: true,
		showDays: true,
		monthFormat: "short",
		dayFormat: "narrow",
	},
	styles: {},
};

// ============================================================================
// Configuration Management
// ============================================================================

let heatmapConfig = { ...defaultHeatmapConfig };

export function loadHeatmapConfig(): HeatmapOptions {
	return { ...heatmapConfig };
}

export function getDefaultHeatmapConfig(): HeatmapOptions {
	return { ...defaultHeatmapConfig };
}

export function updateHeatmapConfig(config: Partial<HeatmapOptions>): void {
	heatmapConfig = { ...heatmapConfig, ...config };
}

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
	return Math.min(Math.ceil(ratio * 4), 4);
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
	const resolved = { ...defaultHeatmapConfig, ...options };
	const data = normalizeData(resolved.data || {});
	const { start, end } = getDateRange(resolved.startDate, resolved.endDate);
	const cellSize = resolved.cellSize || 12;
	const cellGap = resolved.cellGap || 2;
	const colors = resolved.colors || defaultHeatmapColors;
	const styles = resolved.styles || {};

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
			className: "ts-heatmap__cell",
			style: {
				...styles.cell,
				width: `${cellSize}px`,
				height: `${cellSize}px`,
				"--ts-heatmap-cell-size": `${cellSize}px`,
				"--ts-heatmap-level": level,
				"--ts-heatmap-empty-light": lightColors.empty,
				"--ts-heatmap-empty-dark": darkColors.empty,
				"--ts-heatmap-level-1-light": lightColors.levels[0],
				"--ts-heatmap-level-2-light": lightColors.levels[1],
				"--ts-heatmap-level-3-light": lightColors.levels[2],
				"--ts-heatmap-level-4-light": lightColors.levels[3],
				"--ts-heatmap-level-1-dark": darkColors.levels[0],
				"--ts-heatmap-level-2-dark": darkColors.levels[1],
				"--ts-heatmap-level-3-dark": darkColors.levels[2],
				"--ts-heatmap-level-4-dark": darkColors.levels[3],
			},
			attrs: {
				"data-date": dateStr,
				"data-value": String(value),
				"title": `${dateStr}: ${value}`,
			},
		});

		cells.push(cell);
		current.setDate(current.getDate() + 1);
	}

	// Create grid
	const grid = createElement("div", {
		className: "ts-heatmap__grid",
		style: {
			display: "grid",
			gridTemplateColumns: `repeat(53, ${cellSize}px)`,
			gap: `${cellGap}px`,
		},
		children: cells,
	});

	// Create root
	const root = createElement("div", {
		className: ["ts-heatmap", resolved.className].filter(Boolean) as string[],
		style: {
			...styles.root,
			"--ts-heatmap-cell-size": `${cellSize}px`,
			"--ts-heatmap-cell-gap": `${cellGap}px`,
		},
		children: [grid],
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
