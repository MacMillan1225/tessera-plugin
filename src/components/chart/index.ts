/**
 * TesseraScript Chart Group (ADR-0005)
 * tessera.chart.{line, bar, gauge, rose}
 * All charts are ECharts-backed and lazily load lib/echarts.min.js.
 */

import { configureEchartsUrl } from "./loader";
import { line, type LineOptions, type LineInstance } from "./line";
import { bar, type BarOptions, type BarInstance } from "./bar";
import { gauge, type GaugeOptions, type GaugeInstance } from "./gauge";
import { rose, type RoseOptions, type RoseInstance } from "./rose";

export type { ChartData, ChartColors } from "./shared";

export interface ChartGroup {
	line: ((options?: LineOptions) => LineInstance) | undefined;
	bar: ((options?: BarOptions) => BarInstance) | undefined;
	gauge: ((options?: GaugeOptions) => GaugeInstance) | undefined;
	rose: ((options?: RoseOptions) => RoseInstance) | undefined;
}

export interface ChartGroupOptions {
	/** Resource URL for lib/echarts.min.js (vault resource path). */
	echartsUrl: string;
	lineEnabled: boolean;
	barEnabled: boolean;
	gaugeEnabled: boolean;
	roseEnabled: boolean;
}

/**
 * Builds the tessera.chart group. ECharts is NOT loaded here —
 * it is fetched lazily on the first actual chart call (ADR-0005),
 * so disabling the chart group means zero library cost.
 */
export function createChartGroup(options: ChartGroupOptions): ChartGroup {
	configureEchartsUrl(options.echartsUrl);

	return {
		line: options.lineEnabled ? (opts) => line(opts) : undefined,
		bar: options.barEnabled ? (opts) => bar(opts) : undefined,
		gauge: options.gaugeEnabled ? (opts) => gauge(opts) : undefined,
		rose: options.roseEnabled ? (opts) => rose(opts) : undefined,
	};
}