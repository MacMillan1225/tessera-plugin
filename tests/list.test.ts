import { describe, it, expect } from "vitest";
import { list } from "../src/components/core/list";

describe("list", () => {
	it("renders root with ts-list class", () => {
		const el = list();
		expect(el.classList.contains("ts-list")).toBe(true);
	});

	it("renders string items", () => {
		const el = list({ items: ["甲", "乙", "丙"] });
		const rows = el.querySelectorAll(".ts-list__item");
		expect(rows.length).toBe(3);
		expect(rows[0]?.querySelector(".ts-list__label")?.textContent).toBe("甲");
	});

	it("renders items with value", () => {
		const el = list({ items: [{ label: "任务A", value: "3h" }, { label: "任务B", value: 42 }] });
		const rows = el.querySelectorAll(".ts-list__item");
		expect(rows.length).toBe(2);
		expect(rows[0]?.querySelector(".ts-list__value")?.textContent).toBe("3h");
		expect(rows[1]?.querySelector(".ts-list__value")?.textContent).toBe("42");
	});

	it("renders empty text when no items", () => {
		const el = list({ emptyText: "空列表" });
		expect(el.querySelector(".ts-list__empty")?.textContent).toBe("空列表");
	});

	it("adds no-bullets variant class when showBullets false", () => {
		const el = list({ flags: { showBullets: false } });
		expect(el.classList.contains("ts-list--no-bullets")).toBe(true);
	});

	it("adds dividers variant class", () => {
		const el = list({ flags: { showDividers: true } });
		expect(el.classList.contains("ts-list--dividers")).toBe(true);
	});

	it("supports reactive items updates", () => {
		const el = list({ items: ["甲"] });
		el.items = ["甲", "乙", "丙"];
		expect(el.querySelectorAll(".ts-list__item").length).toBe(3);
	});
});