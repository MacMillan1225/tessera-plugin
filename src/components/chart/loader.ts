/**
 * TesseraScript Chart Loader (ADR-0005)
 * Lazily loads ECharts UMD from lib/echarts.min.js as a <script> tag.
 * The library is only fetched when a chart component is actually used,
 * and only when the chart group is enabled (gate kept in main.ts).
 *
 * ECharts is NOT shipped with the plugin — it is downloaded on demand from
 * the settings "图表库" section (src/lib-manager.ts). When the library file
 * is missing, loadEcharts rejects with a dedicated error and the chart
 * canvas shows a setup hint instead of injecting a broken <script>.
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

/**
 * Error thrown when the ECharts library file is not installed.
 * Callers should show a user-friendly hint (settings → 图表库) instead of
 * a raw "failed to load" message.
 */
export class EchartsNotInstalledError extends Error {
	constructor() {
		super("ECharts library is not installed. Download it in Settings → 图表库.");
		this.name = "EchartsNotInstalledError";
	}
}

/** Set the resource URL for lib/echarts.min.js (called once from main.ts). */
export function configureEchartsUrl(url: string): void {
	echartsUrl = url;
}

/**
 * Reset the loader cache. Called after the library is downloaded/removed
 * so the next chart use picks up the new state without an app reload.
 */
export function resetEchartsCache(): void {
	echartsPromise = null;
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

		// Library file missing (getEchartsUrl returned "") → setup hint, not a 404.
		if (!echartsUrl) {
			echartsPromise = null;
			reject(new EchartsNotInstalledError());
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