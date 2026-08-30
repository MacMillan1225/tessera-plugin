import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { card } from "../src/components/core/card";

describe("card", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("renders a root article with ts-card class", () => {
		const el = card();
		expect(el.tagName).toBe("ARTICLE");
		expect(el.classList.contains("ts-card")).toBe(true);
	});

	it("shows title, meta and value when provided", () => {
		const el = card({ title: "标题", meta: "META", value: 42 });
		const header = el.querySelector(".ts-card__header") as HTMLElement;
		expect(header).not.toBeNull();
		expect(el.querySelector(".ts-card__title")?.textContent).toBe("标题");
		expect(el.querySelector(".ts-card__meta")?.textContent).toBe("META");
		expect(el.querySelector(".ts-card__value")?.textContent).toBe("42");
	});

	it("hides header when showHeader is false", () => {
		const el = card({ title: "标题", flags: { showHeader: false } });
		const header = el.querySelector(".ts-card__header") as HTMLElement;
		expect(header).not.toBeNull();
		expect(header.classList.contains("tessera-hidden")).toBe(true);
	});

	it("renders empty text when no content", () => {
		const el = card({ emptyText: "暂无数据" });
		expect(el.querySelector(".ts-card__empty")?.textContent).toBe("暂无数据");
	});

	it("renders content as text or HTMLElement", () => {
		const el1 = card({ content: "纯文本" });
		expect(el1.querySelector(".ts-card__body")?.textContent).toContain("纯文本");

		const child = document.createElement("div");
		child.textContent = "子元素";
		const el2 = card({ content: child });
		const body = el2.querySelector(".ts-card__body") as HTMLElement;
		expect(body.contains(child)).toBe(true);
	});

	it("supports reactive title/value updates", () => {
		const el = card({ title: "旧", value: 1 });
		el.title = "新";
		el.value = 99;
		expect(el.querySelector(".ts-card__title")?.textContent).toBe("新");
		expect(el.querySelector(".ts-card__value")?.textContent).toBe("99");
	});

	it("appends className option", () => {
		const el = card({ className: "extra-class" });
		expect(el.classList.contains("extra-class")).toBe(true);
	});
});