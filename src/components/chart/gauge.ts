/**
 * TesseraScript Chart Component: Tick Gauge
 * Lieflat-style gauge — rounded progress arc with tick marks,
 * big center value + small remaining label.
 */

import type { EChartsOption } from "echarts";
import { GAUGE_DEFAULTS } from "./config";
import { createChartBase, chartThemeColors, lieflatTooltip, type ChartColors } from "./shared";

// ============================================================================
// Types
// ============================================================================

export interface GaugeOptions {
	/** Progress value as a ratio 0..1 (e.g. 0.73 = 73%). */
	value?: number;
	/** Center label shown under the big number. */
	label?: string;
	flags?: {
		showLabel?: boolean;
		showTicks?: boolean;
		showTooltip?: boolean;
	};
	layout?: {
		maxWidth?: string;
		height?: string;
	};
	colors?: ChartColors;
	className?: string | string[];
}

export interface GaugeInstance extends HTMLElement {
	value: number;
	label: string;
	refresh: () => Promise<void>;
	destroy: () => void;
	parts: { canvas: HTMLElement };
}

// ============================================================================
// Option Builder
// ============================================================================

function buildGaugeOption(
	value: number,
	label: string,
	flags: NonNullable<GaugeOptions["flags"]>,
	colors: Record<string, string | string[]>,
	theme: "light" | "dark",
): EChartsOption {
	const text = colors.text as string;
	const track = colors.track as string;
	const accent = colors.accent as string;

	const percent = Math.round(value * 100);
	const remaining = 100 - percent;

	return {
		animationDuration: 700,
		animationEasing: "cubicOut",
		series: [
			{
				type: "gauge",
				startAngle: 210,
				endAngle: -30,
				min: 0,
				max: 100,
				center: ["50%", "58%"],
				radius: "88%",
				progress: {
					show: true,
					width: 14,
					roundCap: true,
					itemStyle: { color: accent },
				},
				axisLine: {
					lineStyle: {
						width: 14,
						color: [[1, track]],
						borderRadius: 7,
					},
				},
				pointer: { show: false },
				axisTick: flags.showTicks === false
					? { show: false }
					: {
						distance: -24,
						splitNumber: 10,
						length: 5,
						lineStyle: { color: text, width: 1 },
					},
				splitLine: { show: false },
				axisLabel: { show: false },
				detail: {
					valueAnimation: false,
					offsetCenter: [0, -8],
					fontSize: 30,
					fontWeight: 800,
					color: accent,
					formatter: (p: number) => `${Math.round(p)}%`,
				},
				title: flags.showLabel === false
					? { show: false }
					: {
						offsetCenter: [0, 26],
						fontSize: 10,
						fontWeight: 600,
						letterSpacing: 1,
						color: text,
						// Show remaining ticks-to-go as the label suffix
						formatter: label || `${remaining} TO GO`,
					},
				data: [{ value: percent, name: "" }],
			},
		],
		tooltip: flags.showTooltip === false ? undefined : lieflatTooltip(theme),
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function gauge(options: GaugeOptions = {}): GaugeInstance {
	const flags = { ...GAUGE_DEFAULTS.flags, ...options.flags };
	const layout = { ...GAUGE_DEFAULTS.layout, ...options.layout };
	const colors: ChartColors = {
		light: { ...GAUGE_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...GAUGE_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	let _value = options.value ?? GAUGE_DEFAULTS.value;
	let _label = options.label ?? GAUGE_DEFAULTS.label;

	const instance = createChartBase({
		className: ["ts-chart", "ts-chart-gauge", options.className].filter(Boolean).join(" "),
		maxWidth: layout.maxWidth,
		height: layout.height,
		colors,
		buildOption: (theme) => buildGaugeOption(_value, _label, flags, chartThemeColors(colors, theme), theme),
	}) as unknown as GaugeInstance;

	// Reactive value/label
	Object.defineProperty(instance, "value", {
		get: () => _value,
		set(v: number) { _value = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(instance, "label", {
		get: () => _label,
		set(v: string) { _label = v; void instance.refresh(); },
		enumerable: true,
		configurable: true,
	});

	return instance;
}