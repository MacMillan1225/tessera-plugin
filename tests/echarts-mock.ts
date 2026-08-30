/**
 * ECharts mock for chart component tests.
 * The loader injects a <script> tag; in tests we pre-seed window.echarts
 * so loadEcharts resolves immediately (loader.ts checks win.echarts first).
 */

import { vi } from "vitest";
import type { EChartsType } from "echarts";

export interface EchartsChartMock {
	setOption: ReturnType<typeof vi.fn>;
	resize: ReturnType<typeof vi.fn>;
	dispose: ReturnType<typeof vi.fn>;
	on: ReturnType<typeof vi.fn>;
	off: ReturnType<typeof vi.fn>;
}

export interface EchartsMock {
	init: ReturnType<typeof vi.fn>;
	dispose: ReturnType<typeof vi.fn>;
	getInstanceByDom: ReturnType<typeof vi.fn>;
	use: ReturnType<typeof vi.fn>;
}

export function installEchartsMock(): { echartsMock: EchartsMock; chartInstance: EchartsChartMock } {
	const chartInstance = {
		setOption: vi.fn(),
		resize: vi.fn(),
		dispose: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
	};

	const echartsMock = {
		init: vi.fn(() => chartInstance),
		dispose: vi.fn(),
		getInstanceByDom: vi.fn(() => chartInstance),
		use: vi.fn(),
	};

	Object.defineProperty(window, "echarts", {
		value: echartsMock,
		writable: true,
		configurable: true,
	});

	return { echartsMock, chartInstance };
}

export function clearEchartsMock() {
	Object.defineProperty(window, "echarts", {
		value: undefined,
		writable: true,
		configurable: true,
	});
}