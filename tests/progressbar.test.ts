import { describe, it, expect } from "vitest";
import { progressbar } from "../src/components/core/progressbar";

describe("progressbar", () => {
	it("renders root with ts-progressbar class", () => {
		const el = progressbar();
		expect(el.classList.contains("ts-progressbar")).toBe(true);
	});

	it("clamps value to 0..1 ratio", () => {
		const el = progressbar({ value: 0.5 });
		const fill = el.querySelector(".ts-progressbar__fill") as HTMLElement;
		expect(fill).not.toBeNull();
		// 0.5 -> 50%
		expect(fill.style.width).toBe("50%");
	});

	it("clamps over-range values", () => {
		const el = progressbar({ value: 2 });
		const fill = el.querySelector(".ts-progressbar__fill") as HTMLElement;
		expect(fill.style.width).toBe("100%");
	});

	it("clamps negative values", () => {
		const el = progressbar({ value: -1 });
		const fill = el.querySelector(".ts-progressbar__fill") as HTMLElement;
		expect(fill.style.width).toBe("0%");
	});

	it("renders label from labelFormat", () => {
		const el = progressbar({ value: 0.75, labelFormat: "{value}%" });
		const label = el.querySelector(".ts-progressbar__label");
		expect(label?.textContent).toBe("75%");
	});

	it("renders raw value with {raw} token", () => {
		const el = progressbar({ value: 0.5, labelFormat: "{raw}" });
		const label = el.querySelector(".ts-progressbar__label");
		expect(label?.textContent).toBe("0.5");
	});

	it("hides label when showLabel is false", () => {
		const el = progressbar({ value: 0.5, flags: { showLabel: false } });
		const label = el.querySelector(".ts-progressbar__label");
		expect(label).not.toBeNull();
		// Hidden via CSS variant class (display:none), not removed from DOM
		expect(el.classList.contains("ts-progressbar--no-label")).toBe(true);
	});

	it("supports reactive value updates", () => {
		const el = progressbar({ value: 0.2 });
		el.value = 0.8;
		const fill = el.querySelector(".ts-progressbar__fill") as HTMLElement;
		expect(fill.style.width).toBe("80%");
	});

	it("sets role and aria attributes", () => {
		const el = progressbar({ value: 0.4 });
		expect(el.getAttribute("role")).toBe("progressbar");
		expect(el.getAttribute("aria-valuenow")).toBe("40");
	});
});