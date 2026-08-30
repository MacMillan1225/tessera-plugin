/**
 * TesseraScript Chart Component: Bar
 * Lieflat "chunky bars" style — capsule rounded tops, per-bar colors.
 */

import type { EChartsOption } from "echarts";
import { BAR_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartData, type ChartColors } from "./shared";

// ============================================================================
// Types
// ============================================================================

export interface BarOptions {
	data?: ChartData;
	flags?: {
		showLegend?: boolean;
		showTooltip?: boolean;
		showGrid?: boolean;
	};
	layout?: {
		maxWidth?: string;
		height?: string;
	};
	colors?: ChartColors;
	className?: string | string[];
}

export interface BarInstance extends HTMLElement {
	data: ChartData;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

// ============================================================================
// Option Builder
// ============================================================================

function buildBarOption(
	data: ChartData,
	flags: NonNullable<BarOptions["flags"]>,
	colors: Record<string, string | string[]>,
	theme: "light" | "dark",
): EChartsOption {
	const text = colors.text as string;
	const grid = colors.grid as string;
	const accent = colors.accent as string;
	const seriesColors = (colors.series as string[]) || [accent];

	// Single series: per-bar colors from the palette (Lieflat chunky bars).
	// Multi series: one color per series, grouped bars.
	const series = data.series?.length
		? data.series.map((s, i) => ({
			name: s.name,
			type: "bar" as const,
			data: s.values,
			barMaxWidth: 28,
			itemStyle: {
				color: seriesColors[i % seriesColors.length],
				borderRadius: [6, 6, 0, 0],
			},
		}))
		: [{
			name: "Series",
			type: "bar" as const,
			data: data.values.map((v, i) => ({
				value: v,
				itemStyle: { color: seriesColors[i % seriesColors.length] },
			})),
			barMaxWidth: 28,
			itemStyle: {
				color: accent,
				borderRadius: [6, 6, 0, 0],
			},
		}];

	return {
		animationDuration: 600,
		animationEasing: "cubicOut",
		tooltip: flags.showTooltip === false ? undefined : { ...lieflatTooltip(theme), trigger: "axis" },
		legend: flags.showLegend
			? {
				top: 0,
				textStyle: { color: text, fontSize: 11 },
				itemWidth: 10,
				itemHeight: 10,
			}
			: undefined,
		grid: {
			left: 8,
			right: 12,
			top: flags.showLegend ? 28 : 12,
			bottom: 4,
			containLabel: true,
		},
		xAxis: {
			type: "category",
			data: data.labels,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: text, fontSize: 10 },
		},
		yAxis: {
			type: "value",
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: text, fontSize: 10 },
			splitLine: flags.showGrid === false ? { show: false } : { lineStyle: { color: grid, width: 0.6 } },
		},
		series,
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function bar(options: BarOptions = {}): BarInstance {
	const flags = { ...BAR_DEFAULTS.flags, ...options.flags };
	const layout = { ...BAR_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...BAR_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...BAR_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	let _data = options.data ?? { labels: [], values: [] };

	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-bar", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildBarOption(_data, flags, chartThemeColors(colors, theme), theme),
	}) as unknown as BarInstance;

	// Reactive data
	Object.defineProperty(instance, "data", {
		get: () => _data,
		set(v: ChartData) { _data = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});

	return instance;
}