/**
 * TesseraScript Style Manager
 * Manages plugin styles and CSS injection
 */

// ============================================================================
// Types
// ============================================================================

export interface StyleManagerOptions {
	prefix?: string;
	autoCleanup?: boolean;
}

// ============================================================================
// StyleManager Class
// ============================================================================

export class StyleManager {
	private prefix: string;
	private autoCleanup: boolean;
	private injected = new Set<string>();
	private styleElements = new Map<string, HTMLStyleElement>();
	private baseStyleElement: HTMLStyleElement | null = null;

	constructor(options: StyleManagerOptions = {}) {
		this.prefix = options.prefix || "tessera";
		this.autoCleanup = options.autoCleanup !== false;
	}

	/**
	 * Load base styles
	 */
	load(): void {
		this.injectBaseStyles();
	}

	/**
	 * Unload and cleanup all styles
	 */
	unload(): void {
		// Remove base styles
		if (this.baseStyleElement) {
			this.baseStyleElement.remove();
			this.baseStyleElement = null;
		}

		// Remove all component styles
		this.styleElements.forEach((element) => {
			element.remove();
		});
		this.styleElements.clear();
		this.injected.clear();
	}

	/**
	 * Inject base styles
	 */
	private injectBaseStyles(): void {
		if (this.baseStyleElement) {
			return;
		}

		const styleEl = document.createElement("style");
		styleEl.id = `${this.prefix}-base`;
		styleEl.textContent = this.getBaseStyles();
		document.head.appendChild(styleEl);

		this.baseStyleElement = styleEl;
	}

	/**
	 * Get base CSS styles
	 */
	private getBaseStyles(): string {
		return `
/* TesseraScript Base Styles */
.ts-container {
	font-family: var(--font-interface);
	color: var(--text-normal);
}

.ts-card,
.ts-heatmap,
.ts-progressbar {
	box-sizing: border-box;
}

.ts-card *,
.ts-heatmap *,
.ts-progressbar * {
	box-sizing: border-box;
}
`.trim();
	}

	/**
	 * Ensure a component style is injected
	 */
	ensureStyle(id: string, css: string): void {
		if (this.injected.has(id)) {
			return;
		}

		const fullId = `${this.prefix}-${id}`;
		let styleEl = this.styleElements.get(id);

		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = fullId;
			document.head.appendChild(styleEl);
			this.styleElements.set(id, styleEl);
		}

		styleEl.textContent = css;
		this.injected.add(id);
	}

	/**
	 * Remove a component style
	 */
	removeStyle(id: string): boolean {
		const styleEl = this.styleElements.get(id);
		if (styleEl) {
			styleEl.remove();
			this.styleElements.delete(id);
			this.injected.delete(id);
			return true;
		}
		return false;
	}

	/**
	 * Check if a style is injected
	 */
	hasStyle(id: string): boolean {
		return this.injected.has(id);
	}

	/**
	 * Get all injected style IDs
	 */
	getInjectedStyles(): string[] {
		return Array.from(this.injected);
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let styleManagerInstance: StyleManager | null = null;

/**
 * Get or create the singleton StyleManager instance
 */
export function getStyleManager(options?: StyleManagerOptions): StyleManager {
	if (!styleManagerInstance) {
		styleManagerInstance = new StyleManager(options);
	}
	return styleManagerInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetStyleManager(): void {
	if (styleManagerInstance) {
		styleManagerInstance.unload();
		styleManagerInstance = null;
	}
}

export default StyleManager;
