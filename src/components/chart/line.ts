/**
 * TesseraScript Chart Component: Line
 * Lieflat-style line chart (ECharts, SVG renderer).
 */

import type { EChartsOption } from "echarts";
import { LINE_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartData, type ChartColors } from "./shared";

// ============================================================================
// Types
// ============================================================================

export interface LineOptions {
	data?: ChartData;
	flags?: {
		showLegend?: boolean;
		showTooltip?: boolean;
		showGrid?: boolean;
		smooth?: boolean;
		area?: boolean;
	};
	layout?: {
		maxWidth?: string;
		height?: string;
	};
	colors?: ChartColors;
	className?: string | string[];
}

export interface LineInstance extends HTMLElement {
	data: ChartData;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

// ============================================================================
// Option Builder
// ============================================================================

function buildLineOption(
	data: ChartData,
	flags: NonNullable<LineOptions["flags"]>,
	colors: Record<string, string | string[]>,
	theme: "light" | "dark",
): EChartsOption {
	const text = colors.text as string;
	const grid = colors.grid as string;
	const accent = colors.accent as string;
	const seriesColors = (colors.series as string[]) || [accent];

	const series = data.series?.length
		? data.series.map((s, i) => ({
			name: s.name,
			type: "line" as const,
			data: s.values,
			smooth: flags.smooth === true,
			symbol: "circle",
			symbolSize: 5,
			lineStyle: { width: 2, color: seriesColors[i % seriesColors.length] },
			itemStyle: { color: seriesColors[i % seriesColors.length] },
			areaStyle: flags.area === true
				? { opacity: 0.08, color: seriesColors[i % seriesColors.length] }
				: undefined,
		}))
		: [{
			name: "Series",
			type: "line" as const,
			data: data.values,
			smooth: flags.smooth === true,
			symbol: "circle",
			symbolSize: 5,
			lineStyle: { width: 2, color: accent },
			itemStyle: { color: accent },
			areaStyle: flags.area === true ? { opacity: 0.08, color: accent } : undefined,
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

export function line(options: LineOptions = {}): LineInstance {
	const flags = { ...LINE_DEFAULTS.flags, ...options.flags };
	const layout = { ...LINE_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...LINE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...LINE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	let _data = options.data ?? { labels: [], values: [] };

	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-line", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildLineOption(_data, flags, chartThemeColors(colors, theme), theme),
	}) as unknown as LineInstance;

	// Reactive data
	Object.defineProperty(instance, "data", {
		get: () => _data,
		set(v: ChartData) { _data = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});

	return instance;
}