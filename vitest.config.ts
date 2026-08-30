import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/**/*.test.ts"],
		setupFiles: ["tests/setup.ts"],
	},
	resolve: {
		alias: {
			// obsidian ships type-only declarations — tests that touch it
			// (e.g. lib-manager) provide their own vi.mock("obsidian").
			obsidian: `${import.meta.dirname}/tests/obsidian-stub.ts`,
		},
	},
});