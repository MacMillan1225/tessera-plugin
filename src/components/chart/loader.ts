/**
 * TesseraScript Chart Loader (ADR-0005)
 * Lazily loads ECharts UMD from lib/echarts.min.js as a <script> tag.
 * The library is only fetched when a chart component is actually used,
 * and only when the chart group is enabled (gate kept in main.ts).
 */

import type { EChartsType } from "echarts";

/**
 * The global ECharts constructor exposed by lib/echarts.min.js (UMD build).
 * It has a static `init` method that creates chart instances.
 */
export type EChartsConstructor = typeof import("echarts") & {
	init: (
		dom: HTMLElement,
		theme?: string | object | null,
		opts?: Record<string, unknown>,
	) => EChartsType;
};

let echartsUrl = "";
let echartsPromise: Promise<EChartsConstructor> | null = null;

/** Set the resource URL for lib/echarts.min.js (called once from main.ts). */
export function configureEchartsUrl(url: string): void {
	echartsUrl = url;
}

/**
 * Returns a promise that resolves to the global ECharts constructor.
 * Injects a <script> tag on first use; subsequent calls reuse the resolved
 * instance. Resets the cache on load failure so a retry is possible.
 */
export function loadEcharts(): Promise<EChartsConstructor> {
	if (echartsPromise) {
		return echartsPromise;
	}

	echartsPromise = new Promise<EChartsConstructor>((resolve, reject) => {
		const win = window as unknown as { echarts?: EChartsConstructor };
		if (win.echarts) {
			resolve(win.echarts);
			return;
		}

		// eslint-disable-next-line obsidianmd/prefer-active-doc
		const script = document.createElement("script");
		script.src = echartsUrl;
		script.async = true;
		script.onload = () => {
			if (win.echarts) {
				resolve(win.echarts);
			} else {
				echartsPromise = null;
				reject(new Error("ECharts loaded but global `echarts` was not found."));
			}
		};
		script.onerror = () => {
			echartsPromise = null;
			reject(new Error(`Failed to load ECharts from ${echartsUrl}`));
		};
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		document.head.appendChild(script);
	});

	return echartsPromise;
}