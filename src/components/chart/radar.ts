/**
 * TesseraScript Chart Component: Radar
 * Lieflat-style polygon radar chart (ECharts, SVG renderer).
 * Supports 6-dimension ("六维图") use cases with optional area fill.
 */

import type { EChartsOption } from "echarts";
import { RADAR_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartData, type ChartColors } from "./shared";

// ============================================================================
// Types
// ============================================================================

export interface RadarOptions {
	/** Chart data — labels are the dimensions, values are per-dimension scores. */
	data?: ChartData;
	/** Optional per-axis maximum (default: auto-computed nice ceiling). */
	max?: number;
	flags?: {
		showLegend?: boolean;
		showTooltip?: boolean;
		/** Show dimension labels at each vertex (default true). */
		showLabels?: boolean;
		/** Fill the radar polygons with a translucent accent (default true). */
		showArea?: boolean;
		/** Draw axis lines from center to each corner (default true). */
		showAxes?: boolean;
	};
	layout?: {
		maxWidth?: string;
		height?: string;
		/** Radar polygon stroke width in px (auto/default 2). */
		lineWidth?: number;
		/** Data point diameter in px (auto/default 3). */
		symbolSize?: number;
	};
	colors?: ChartColors;
	className?: string | string[];
}

export interface RadarInstance extends HTMLElement {
	data: ChartData;
	max: number | undefined;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

// ============================================================================
// Option Builder
// ============================================================================

/**
 * Compute a "nice" ceiling for the radar scale: the smallest power-of-10-ish
 * step that keeps all values visible (1, 5, 10, 20, 50, 100, ...).
 */
function niceMax(values: number[], explicit?: number): number {
	if (explicit != null && explicit > 0) return explicit;

	let peak = 0;
	for (const v of values) {
		const n = Number(v);
		if (!Number.isNaN(n) && n > peak) peak = n;
	}
	if (peak <= 0) return 1;

	const magnitude = Math.pow(10, Math.floor(Math.log10(peak)));
	const normalized = peak / magnitude;
	let step: number;
	if (normalized <= 1) step = 1;
	else if (normalized <= 2) step = 2;
	else if (normalized <= 5) step = 5;
	else step = 10;

	return step * magnitude;
}

function htmlEscape(value: unknown): string {
	const str = value == null ? "" : typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value);
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function valueToText(value: unknown): string {
	if (value == null) return "-";
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
	try {
		return JSON.stringify(value) ?? "-";
	} catch {
		return "-";
	}
}

function buildRadarOption(
	data: ChartData,
	max: number | undefined,
	flags: NonNullable<RadarOptions["flags"]>,
	layout: NonNullable<RadarOptions["layout"]>,
	colors: Record<string, string | string[]>,
	theme: "light" | "dark",
): EChartsOption {
	const text = colors.text as string;
	const grid = colors.grid as string;
	const accent = colors.accent as string;
	const seriesColors = (colors.series as string[]) || [accent];

	// Flatten all values (single + multi series) for scale computation
	const allValues = data.series?.length
		? data.series.flatMap((s) => s.values)
		: data.values;
	const indicatorMax = niceMax(allValues, max);

	const indicators = data.labels.map((name) => ({
		name,
		max: indicatorMax,
	}));

	// Series — one per data series, or a single default series
	const series = data.series?.length
		? data.series.map((s, i) => ({
			name: s.name,
			type: "radar" as const,
			symbol: "circle" as const,
			symbolSize: layout.symbolSize ?? RADAR_DEFAULTS.layout.symbolSize,
			lineStyle: {
				width: layout.lineWidth ?? RADAR_DEFAULTS.layout.lineWidth,
				color: seriesColors[i % seriesColors.length],
			},
			itemStyle: { color: seriesColors[i % seriesColors.length] },
			areaStyle: flags.showArea === false
				? undefined
				: { opacity: 0.08, color: seriesColors[i % seriesColors.length] },
			data: [{ value: s.values, name: s.name }],
		}))
		: [{
			name: "Series",
			type: "radar" as const,
			symbol: "circle" as const,
			symbolSize: layout.symbolSize ?? RADAR_DEFAULTS.layout.symbolSize,
			lineStyle: {
				width: layout.lineWidth ?? RADAR_DEFAULTS.layout.lineWidth,
				color: accent,
			},
			itemStyle: { color: accent },
			areaStyle: flags.showArea === false ? undefined : { opacity: 0.08, color: accent },
			data: [{ value: data.values, name: "Series" }],
		}];

	// Tooltip: show the hovered vertex's own dimension only (not the whole series).
	// ECharts radar exposes `dimensionIndex` on vertex hover; fall back to the
	// indicator name if unavailable, then to a full-dimension list.
	function radarTooltipFormatter(params: unknown): string {
		const p = params as { dimensionIndex?: number; name?: string; value?: unknown };
		const values = Array.isArray(p.value) ? (p.value as unknown[]) : [];

		let idx = typeof p.dimensionIndex === "number" ? p.dimensionIndex : -1;
		if (idx < 0 && typeof p.name === "string") {
			idx = data.labels.indexOf(p.name);
		}

		if (idx >= 0 && idx < data.labels.length && idx < values.length) {
			return `${htmlEscape(data.labels[idx])}<br/>${htmlEscape(valueToText(values[idx]))}`;
		}

		// Fallback (hover on polygon body): list all dimensions
		return data.labels
			.map((label, i) => `${htmlEscape(label)}: ${htmlEscape(valueToText(values[i]))}`)
			.join("<br/>");
	}

	return {
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip: flags.showTooltip === false
			? undefined
			: {
				...lieflatTooltip(theme),
				trigger: "item",
				formatter: radarTooltipFormatter,
			},
		legend: flags.showLegend
			? {
				top: 0,
				textStyle: { color: text, fontSize: 11 },
				itemWidth: 10,
				itemHeight: 10,
			}
			: undefined,
		radar: {
			indicator: indicators,
			splitNumber: 4,
			center: ["50%", "54%"],
			radius: "68%",
			axisName: flags.showLabels === false
				? { show: false }
				: { color: text, fontSize: 10, padding: [4, 4] },
			axisLine: flags.showAxes === false
				? { show: false }
				: { lineStyle: { color: grid, width: 0.6 } },
			splitLine: { lineStyle: { color: grid, width: 0.6 } },
			splitArea: { show: false },
		},
		series,
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function radar(options: RadarOptions = {}): RadarInstance {
	const flags = { ...RADAR_DEFAULTS.flags, ...options.flags };
	const layout = { ...RADAR_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...RADAR_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...RADAR_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	let _data = options.data ?? { labels: [], values: [] };
	let _max = options.max;

	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-radar", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildRadarOption(_data, _max, flags, layout, chartThemeColors(colors, theme), theme),
	}) as unknown as RadarInstance;

	// Reactive data / max
	Object.defineProperty(instance, "data", {
		get: () => _data,
		set(v: ChartData) { _data = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(instance, "max", {
		get: () => _max,
		set(v: number | undefined) { _max = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});

	return instance;
}