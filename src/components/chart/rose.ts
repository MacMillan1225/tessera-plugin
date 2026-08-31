/**
 * TesseraScript Chart Component: Petal Rose
 * Lieflat-style rose chart — layered petal disc (ECharts pie roseType:'area').
 * Structure: dark base disc → rose petals → transparent label layer.
 */

import type { EChartsOption } from "echarts";
import { ROSE_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartData, type ChartColors } from "./shared";

// ============================================================================
// Types
// ============================================================================

export interface RoseOptions {
	data?: ChartData;
	flags?: {
		showLegend?: boolean;
		showTooltip?: boolean;
		showLabels?: boolean;
	};
	layout?: {
		maxWidth?: string;
		height?: string;
	};
	colors?: ChartColors;
	className?: string | string[];
}

export interface RoseInstance extends HTMLElement {
	data: ChartData;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

// ============================================================================
// Option Builder
// ============================================================================

/** Petal shade by value tier: stronger value → lighter petal (Lieflat). */
function petalColor(value: number, max: number, seriesColors: string[]): string {
	const t = max > 0 ? value / max : 0;
	const tier = t > 0.8 ? 0 : t > 0.6 ? 1 : t > 0.35 ? 2 : 3;
	return seriesColors[tier % seriesColors.length] ?? "#71717A";
}

function buildRoseOption(
	data: ChartData,
	flags: NonNullable<RoseOptions["flags"]>,
	colors: Record<string, string | string[]>,
	theme: "light" | "dark",
): EChartsOption {
	const text = colors.text as string;
	const accent = colors.accent as string;
	const seriesColors = (colors.series as string[]) || [accent];
	const max = Math.max(...data.values, 1);

	const items = data.labels.map((label, i) => ({
		name: label,
		value: data.values[i] ?? 0,
	}));

	const baseDiscColor = theme === "dark" ? "#3F3F46" : "#E4E4E7";

	return {
		animationDuration: 700,
		animationEasing: "cubicOut",
		tooltip: flags.showTooltip === false ? undefined : { ...lieflatTooltip(theme), trigger: "item" },
		legend: flags.showLegend
			? {
				bottom: 0,
				textStyle: { color: text, fontSize: 11 },
				itemWidth: 10,
				itemHeight: 10,
			}
			: undefined,
		series: [
			// Layer 1: base disc (subtle, holds the petals)
			{
				type: "pie",
				radius: ["14%", "92%"],
				itemStyle: { color: baseDiscColor, borderRadius: 16 },
				silent: true,
				label: { show: false },
				data: items.map((item) => ({ value: 1, name: "" })),
				z: 1,
			},
			// Layer 2: rose petals
			{
				type: "pie",
				roseType: "area",
				radius: ["14%", "88%"],
				itemStyle: {
					borderRadius: 14,
					borderColor: theme === "dark" ? "#26262B" : "#FFFFFF",
					borderWidth: 4,
				},
				label: { show: false },
				emphasis: {
					scale: true,
					scaleSize: 4,
					itemStyle: { shadowBlur: 12, shadowColor: "rgba(0,0,0,0.12)" },
				},
				data: items.map((item) => ({
					...item,
					itemStyle: { color: petalColor(item.value, max, seriesColors) },
				})),
				z: 2,
			},
			// Layer 3: value + name labels (transparent, click-through)
			{
				type: "pie",
				radius: ["14%", "88%"],
				itemStyle: { color: "transparent" },
				silent: true,
				tooltip: { show: false },
				label: flags.showLabels === false
					? { show: false }
					: {
						show: true,
						position: "outside",
						formatter: (p: { name: string; value: number }) => `${p.name} ${p.value}`,
						color: text,
						fontSize: 10,
						fontWeight: 600,
						lineHeight: 14,
					},
				labelLine: {
					show: true,
					length: 8,
					length2: 4,
					lineStyle: { color: text, width: 0.6, opacity: 0.5 },
				},
				data: items,
				z: 3,
			},
		] as EChartsOption["series"],
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function rose(options: RoseOptions = {}): RoseInstance {
	const flags = { ...ROSE_DEFAULTS.flags, ...options.flags };
	const layout = { ...ROSE_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...ROSE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...ROSE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	let _data = options.data ?? { labels: [], values: [] };

	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-rose", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildRoseOption(_data, flags, chartThemeColors(colors, theme), theme),
	}) as unknown as RoseInstance;

	// Reactive data
	Object.defineProperty(instance, "data", {
		get: () => _data,
		set(v: ChartData) { _data = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});

	return instance;
}