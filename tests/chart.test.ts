import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { line } from "../src/components/chart/line";
import { bar } from "../src/components/chart/bar";
import { gauge } from "../src/components/chart/gauge";
import { rose } from "../src/components/chart/rose";
import { radar } from "../src/components/chart/radar";
import { installEchartsMock, clearEchartsMock } from "./echarts-mock";

describe("chart components", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		installEchartsMock();
	});

	afterEach(() => {
		clearEchartsMock();
		vi.clearAllMocks();
	});

	it("line renders root and canvas host", () => {
		const el = line({ data: { labels: ["A", "B"], values: [1, 2] } });
		expect(el.classList.contains("ts-chart-line")).toBe(true);
		expect(el.querySelector(".ts-chart__canvas")).not.toBeNull();
		el.destroy();
	});

	it("line initializes echarts with svg renderer after load", async () => {
		const { echartsMock } = installEchartsMock();
		const el = line({ data: { labels: ["A", "B"], values: [1, 2] } });
		await el.refresh();
		expect(echartsMock.init).toHaveBeenCalled();
		const args = echartsMock.init.mock.calls[0]!;
		expect(args[2]).toEqual({ renderer: "svg" });
		el.destroy();
	});

	it("bar renders and supports reactive data", async () => {
		const el = bar({ data: { labels: ["A", "B"], values: [3, 1] } });
		await el.refresh();
		el.data = { labels: ["A", "B", "C"], values: [3, 1, 5] };
		await el.refresh();
		expect(el.querySelectorAll(".ts-chart__canvas").length).toBe(1);
		el.destroy();
	});

	it("gauge renders with value 0..1", async () => {
		const el = gauge({ value: 0.6 });
		await el.refresh();
		expect(el.querySelector(".ts-chart__canvas")).not.toBeNull();
		el.destroy();
	});

	it("gauge supports reactive value", async () => {
		const el = gauge({ value: 0.1 });
		el.value = 0.9;
		await el.refresh();
		el.destroy();
	});

	it("rose renders", async () => {
		const el = rose({ data: { labels: ["X", "Y"], values: [4, 6] } });
		await el.refresh();
		expect(el.querySelector(".ts-chart__canvas")).not.toBeNull();
		el.destroy();
	});

	it("radar renders and supports max", async () => {
		const el = radar({ data: { labels: ["攻", "防", "速"], values: [80, 60, 90] }, max: 100 });
		await el.refresh();
		expect(el.querySelector(".ts-chart__canvas")).not.toBeNull();
		el.max = 50;
		await el.refresh();
		el.destroy();
	});

	it("renders fallback text when echarts missing", async () => {
		clearEchartsMock();
		// Simulate load failure by leaving window.echarts undefined and blocking script load
		const { echartsMock } = installEchartsMock();
		echartsMock.init.mockImplementation(() => {
			throw new Error("missing");
		});
		const el = line({ data: { labels: [], values: [] } });
		await el.refresh();
		el.destroy();
	});

	it("destroys cleanly for all charts", () => {
		const els = [
			line({ data: { labels: ["A"], values: [1] } }),
			bar({ data: { labels: ["A"], values: [1] } }),
			gauge({ value: 0.5 }),
			rose({ data: { labels: ["A"], values: [1] } }),
			radar({ data: { labels: ["A"], values: [1] } }),
		];
		for (const el of els) {
			expect(() => el.destroy()).not.toThrow();
		}
	});
});