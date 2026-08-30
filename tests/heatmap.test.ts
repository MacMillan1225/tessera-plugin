import { describe, it, expect, vi } from "vitest";
import { heatmap } from "../src/components/core/heatmap";

describe("heatmap", () => {
	it("renders root with ts-heatmap class", () => {
		const el = heatmap();
		expect(el.classList.contains("ts-heatmap")).toBe(true);
	});

	it("exposes utils", () => {
		const el = heatmap();
		expect(typeof el.utils.toDateKey).toBe("function");
		expect(typeof el.utils.normalizeDate).toBe("function");
		expect(typeof el.utils.addDays).toBe("function");
		expect(typeof el.utils.alignToMonday).toBe("function");
		expect(typeof el.utils.htmlEscape).toBe("function");
		expect(typeof el.utils.ratioToLevel).toBe("function");
	});

	it("toDateKey formats YYYY-MM-DD", () => {
		const el = heatmap();
		expect(el.utils.toDateKey("2026-08-30")).toBe("2026-08-30");
	});

	it("normalizeDate parses date-only strings as local midnight", () => {
		const el = heatmap();
		const d = el.utils.normalizeDate("2026-08-30");
		expect(d?.getFullYear()).toBe(2026);
		expect(d?.getMonth()).toBe(7); // August = 7
		expect(d?.getDate()).toBe(30);
	});

	it("ratioToLevel maps completed/total to 1..8", () => {
		const el = heatmap();
		expect(el.utils.ratioToLevel(0, 10)).toBe(1);
		expect(el.utils.ratioToLevel(10, 10)).toBe(8);
		expect(el.utils.ratioToLevel(5, 10)).toBe(4);
	});

	it("renders cells asynchronously from data", async () => {
		const el = heatmap({
			data: { "2026-08-01": 3, "2026-08-02": 5 },
			startDate: "2026-08-01",
			endDate: "2026-08-07",
			settings: { rangeMode: "fixed" },
		});
		await el.refresh();
		const cells = el.querySelectorAll(".ts-heatmap__cell");
		expect(cells.length).toBeGreaterThan(0);
	});

	it("supports reactive data updates", async () => {
		const el = heatmap({
			data: {},
			startDate: "2026-08-01",
			endDate: "2026-08-03",
			settings: { rangeMode: "fixed" },
		});
		await el.refresh();
		el.data = { "2026-08-01": 7 };
		// Debounced refresh (150ms) — flush timers
		await new Promise((r) => window.setTimeout(r, 200));
		expect(el.querySelectorAll(".ts-heatmap__cell").length).toBeGreaterThan(0);
	});

	it("destroys cleanly", () => {
		const el = heatmap();
		expect(() => el.destroy()).not.toThrow();
	});
});