/**
 * Shared test setup: DOM + global stubs needed by components.
 */

// jsdom lacks ResizeObserver in older versions
if (!("ResizeObserver" in window)) {
	class ResizeObserverStub {
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
	}
	Object.defineProperty(window, "ResizeObserver", {
		value: ResizeObserverStub,
		writable: true,
	});
}

// MutationObserver is provided by jsdom; keep a safe stub fallback anyway
if (!("MutationObserver" in window)) {
	class MutationObserverStub {
		observe(): void {}
		disconnect(): void {}
		takeRecords(): MutationRecord[] {
			return [];
		}
	}
	Object.defineProperty(window, "MutationObserver", {
		value: MutationObserverStub,
		writable: true,
	});
}

// requestAnimationFrame stub for deterministic behavior
if (!("requestAnimationFrame" in window)) {
	Object.defineProperty(window, "requestAnimationFrame", {
		value: (cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 0),
		writable: true,
	});
}
if (!("cancelAnimationFrame" in window)) {
	Object.defineProperty(window, "cancelAnimationFrame", {
		value: (id: number) => window.clearTimeout(id),
		writable: true,
	});
}