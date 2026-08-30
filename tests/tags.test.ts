import { describe, it, expect } from "vitest";
import { tags } from "../src/components/core/tags";

describe("tags", () => {
	it("renders root with ts-tags class", () => {
		const el = tags();
		expect(el.classList.contains("ts-tags")).toBe(true);
	});

	it("renders string tags", () => {
		const el = tags({ tags: ["重要", "紧急", "低优先"] });
		const chips = el.querySelectorAll(".ts-tags__tag");
		expect(chips.length).toBe(3);
		expect(chips[0]?.textContent).toBe("重要");
	});

	it("renders tag objects with color", () => {
		const el = tags({ tags: [{ label: "红", color: "#ef4444" }, { label: "普通" }] });
		const chips = el.querySelectorAll(".ts-tags__tag");
		expect(chips[0]?.textContent).toBe("红");
		expect((chips[0] as HTMLElement).style.getPropertyValue("--ts-tags-tag-accent")).toBe("#ef4444");
	});

	it("applies per-tag variant class", () => {
		const el = tags({ tags: [{ label: "轮廓", variant: "outlined" }] });
		const chip = el.querySelector(".ts-tags__tag") as HTMLElement;
		expect(chip.classList.contains("ts-tags__tag--outlined")).toBe(true);
	});

	it("applies squared variant when pill false", () => {
		const el = tags({ flags: { pill: false } });
		expect(el.classList.contains("ts-tags--squared")).toBe(true);
	});

	it("renders empty text when no tags", () => {
		const el = tags({ emptyText: "无标签" });
		expect(el.querySelector(".ts-tags__empty")?.textContent).toBe("无标签");
	});

	it("supports reactive tags updates", () => {
		const el = tags({ tags: ["甲"] });
		el.tags = ["甲", "乙"];
		expect(el.querySelectorAll(".ts-tags__tag").length).toBe(2);
	});
});