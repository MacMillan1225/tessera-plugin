/**
 * TesseraScript Chart Shared Base (ADR-0005)
 * Common lifecycle for ECharts-backed components:
 * lazy load → init → reactive refresh → resize observer → theme sync → destroy.
 */

import type { EChartsType, EChartsOption } from "echarts";
import { loadEcharts } from "./loader";

// ============================================================================
// Shared Chart Types
// ============================================================================

/** Single series data: labels + values (or multi-series with name+values). */
export interface ChartData {
	labels: string[];
	values: number[];
	series?: { name: string; values: number[] }[];
}

export interface ChartColors {
	light: Record<string, string | string[]>;
	dark: Record<string, string | string[]>;
}

export interface ChartBaseOptions {
	className: string;
	maxWidth?: string;
	height?: string;
	colors: ChartColors;
	/** Build the ECharts option for the given theme. */
	buildOption: (theme: "light" | "dark") => EChartsOption;
	/** Initial data (first render). */
	data?: unknown;
}

export interface ChartBaseInstance {
	readonly chart: EChartsType | null;
	readonly theme: "light" | "dark";
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: {
		canvas: HTMLElement;
	};
}

// ============================================================================
// Theme Helpers
// ============================================================================

export function isDarkTheme(): boolean {
	// eslint-disable-next-line obsidianmd/prefer-active-doc
	return document.body.classList.contains("theme-dark");
}

export function chartThemeColors(colors: ChartColors, theme: "light" | "dark"): Record<string, string | string[]> {
	return theme === "dark" ? colors.dark : colors.light;
}

// ============================================================================
// Shared Tooltip Style (Lieflat: paper card, 12px radius, ink text)
// ============================================================================

export function lieflatTooltip(theme: "light" | "dark"): Record<string, unknown> {
	const paper = theme === "dark" ? "#1C1C1A" : "#F0EFEB";
	const ink = theme === "dark" ? "#F0EFEB" : "#1C1C1A";
	return {
		backgroundColor: paper,
		borderWidth: 0,
		padding: [8, 12],
		textStyle: {
			color: ink,
			fontSize: 12,
		},
		extraCssText: "border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);",
	};
}

// ============================================================================
// Base Factory
// ============================================================================

/**
 * Creates a chart root element with the full ECharts lifecycle.
 * Rendering is async: the root element is returned immediately, the chart
 * is initialized once ECharts finishes loading (lazy, ADR-0005).
 */
export function createChartBase(options: ChartBaseOptions): HTMLElement & ChartBaseInstance {
	const root = document.createElement("div");
	root.className = options.className;
	root.style.maxWidth = options.maxWidth || "100%";

	// Canvas host — needs explicit height for ECharts
	const canvas = document.createElement("div");
	canvas.className = "ts-chart__canvas";
	canvas.style.width = "100%";
	canvas.style.height = options.height || "240px";
	root.appendChild(canvas);

	// Theme class sync (heatmap-style)
	const syncThemeClass = () => {
		root.classList.toggle("theme-dark", isDarkTheme());
		root.classList.toggle("theme-light", !isDarkTheme());
	};
	syncThemeClass();

	let chart: EChartsType | null = null;
	let destroyed = false;
	let theme: "light" | "dark" = isDarkTheme() ? "dark" : "light";

	// Resize observer
	const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
		chart?.resize();
	}) : null;
	if (resizeObserver) {
		resizeObserver.observe(root);
	}

	// Theme observer
	const themeObserver = typeof MutationObserver === "function" ? new MutationObserver(() => {
		const next = isDarkTheme() ? "dark" : "light";
		syncThemeClass();
		if (next !== theme && chart) {
			theme = next;
			chart.setOption(options.buildOption(theme), { notMerge: true });
		}
	}) : null;
	if (themeObserver) {
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
	}

	// Render (first paint or data refresh)
	async function render(): Promise<void> {
		if (destroyed) return;
		try {
			const echarts = await loadEcharts();
			if (destroyed) return;
			const nextChart = chart ?? echarts.init(canvas, null, { renderer: "svg" });
			chart = nextChart;
			nextChart.setOption(options.buildOption(theme), { notMerge: true });
		} catch {
			// ECharts failed to load — render a readable fallback
			canvas.textContent = "Echarts failed to load";
		}
	}

	const instance = root as HTMLElement & ChartBaseInstance;
	Object.defineProperty(instance, "chart", {
		get: () => chart,
		enumerable: true,
	});
	Object.defineProperty(instance, "theme", {
		get: () => theme,
		enumerable: true,
	});
	instance.refresh = render;
	instance.destroy = () => {
		destroyed = true;
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
		if (themeObserver) {
			themeObserver.disconnect();
		}
		chart?.dispose();
		chart = null;
	};
	instance.parts = { canvas };

	// Defer initial render so callers can attach before first paint
	window.requestAnimationFrame(() => {
		void render();
	});

	return instance;
}