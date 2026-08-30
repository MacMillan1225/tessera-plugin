/**
 * TesseraScript Chart Component: Radar
 * Lieflat-style polygon radar chart (ECharts, SVG renderer).
 * Supports 6-dimension ("六维图") use cases with optional area fill.
 */

import type { EChartsOption } from "echarts";
import { RADAR_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, type ChartData, type ChartColors } from "./shared";
import { createElement } from "../../utils/dom";

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
	/** ECharts instance (null until lazy load completes). */
	chart: import("echarts").EChartsType | null;
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

	// Tooltip: ECharts radar tooltips can't report which vertex is hovered
	// (getDataParams has no dimension info), so we handle hover via zrender
	// events in the component function and never configure a native tooltip.
	const tooltip = undefined;

	return {
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip,
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

	// ========================================================================
	// Vertex tooltip via zrender events.
	// ECharts radar tooltips cannot report the hovered vertex (getDataParams
	// carries no dimension index), so we listen on the zrender layer and read
	// the vertex element's __dimIdx (set by RadarView for each symbol).
	// ========================================================================
	if (flags.showTooltip !== false) {
		const tooltipEl = createElement("div", { className: "ts-chart-radar-tooltip" });
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		document.body.appendChild(tooltipEl);

		let bindTimer: number | null = null;
		let bound = false;
		let hideTimeout: number | null = null;

		const hideTooltip = (): void => {
			if (hideTimeout) {
				window.clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			hideTimeout = window.setTimeout(() => {
				tooltipEl.classList.remove("is-active");
				hideTimeout = null;
			}, 50);
		};

		const showTooltip = (label: string, seriesName: string | undefined, valueText: string, x: number, y: number): void => {
			if (hideTimeout) {
				window.clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			// Theme-aware paper/ink colors
			// eslint-disable-next-line obsidianmd/prefer-active-doc
			const dark = document.body.classList.contains("theme-dark");
			const paper = dark ? "#1C1C1A" : "#F0EFEB";
			const ink = dark ? "#F0EFEB" : "#1C1C1A";
			tooltipEl.style.setProperty("--ts-radar-tooltip-bg", paper);
			tooltipEl.style.setProperty("--ts-radar-tooltip-fg", ink);

			// Build content with text nodes (no innerHTML)
			tooltipEl.replaceChildren(
				createElement("div", { className: "ts-chart-radar-tooltip__label", text: label }),
				createElement("div", { className: "ts-chart-radar-tooltip__value", text: `${seriesName ? `${seriesName} · ` : ""}${valueText}` }),
			);

			const canvasRect = instance.parts.canvas.getBoundingClientRect();
			let left = canvasRect.left + x + 12;
			let top = canvasRect.top + y + 12;
			const tipRect = tooltipEl.getBoundingClientRect();
			if (left + tipRect.width > window.innerWidth - 10) {
				left = canvasRect.left + x - tipRect.width - 12;
			}
			if (top + tipRect.height > window.innerHeight - 10) {
				top = canvasRect.top + y - tipRect.height - 12;
			}
			tooltipEl.style.left = `${left}px`;
			tooltipEl.style.top = `${top}px`;
			tooltipEl.classList.add("is-active");
		};

		const bindZr = (): void => {
			const chart = instance.chart;
			if (!chart || bound) return;
			bound = true;
			if (bindTimer) {
				window.clearInterval(bindTimer);
				bindTimer = null;
			}

			const zr = chart.getZr();
			zr.on("mousemove", (event: unknown) => {
				const e = event as { target?: { __dimIdx?: number } | null; offsetX?: number; offsetY?: number };
				const target = e.target;
				const dimIdx = typeof target?.__dimIdx === "number" ? target.__dimIdx : -1;
				if (dimIdx < 0 || dimIdx >= _data.labels.length) {
					hideTooltip();
					return;
				}

				const label = _data.labels[dimIdx] ?? "";
				// Single series → values[dimIdx]; multi series → first series' value
				const values = _data.series?.length ? _data.series[0]?.values : _data.values;
				const value = values?.[dimIdx];
				const seriesName = _data.series?.length ? _data.series[0]?.name : undefined;
				showTooltip(label, seriesName, valueToText(value), e.offsetX ?? 0, e.offsetY ?? 0);
			});
			zr.on("mouseout", () => {
				hideTooltip();
			});
		};

		// Chart initializes asynchronously (lazy ECharts load) — poll until ready.
		bindTimer = window.setInterval(bindZr, 150);
		bindZr();

		const originalDestroy = instance.destroy;
		instance.destroy = () => {
			if (bindTimer) {
				window.clearInterval(bindTimer);
				bindTimer = null;
			}
			if (bound) {
				const chart = instance.chart;
				if (chart) {
					const zr = chart.getZr();
					zr.off("mousemove");
					zr.off("mouseout");
				}
				bound = false;
			}
			if (hideTimeout) {
				window.clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			tooltipEl.remove();
			originalDestroy();
		};
	}

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