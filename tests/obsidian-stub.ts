/**
 * Minimal obsidian API stub for vitest.
 * Individual tests that exercise obsidian-backed code (e.g. lib-manager)
 * use vi.mock("obsidian") to override these with their own fakes.
 */

export function requestUrl(): never {
	throw new Error("requestUrl is not mocked in this test");
}

export class Notice {
	constructor(message: string, timeout?: number) {
		// no-op in tests
		void message;
		void timeout;
	}
}