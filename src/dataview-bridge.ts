/**
 * TesseraScript Dataview Bridge
 * Provides integration with the Dataview plugin
 */

import type { App } from "obsidian";

// ============================================================================
// Types
// ============================================================================

export interface DataviewBridgeOptions {
	app: App;
	onDataviewMissing?: () => void;
}

export interface DataviewAPI {
	executeJs: (code: string, container: HTMLElement, context: any) => Promise<void>;
	pages: (query: string) => any[];
	// Add more Dataview API methods as needed
}

// ============================================================================
// DataviewBridge Class
// ============================================================================

export class DataviewBridge {
	private app: App;
	private onDataviewMissing?: () => void;
	private dataviewPlugin: any | null = null;

	constructor(options: DataviewBridgeOptions) {
		this.app = options.app;
		this.onDataviewMissing = options.onDataviewMissing;
		this.dataviewPlugin = this.findDataviewPlugin();
	}

	/**
	 * Find and cache the Dataview plugin instance
	 */
	private findDataviewPlugin(): any | null {
		const plugins = (this.app as any).plugins;
		if (!plugins) {
			return null;
		}

		return plugins.plugins["dataview"] ?? null;
	}

	/**
	 * Check if Dataview is available
	 */
	isAvailable(): boolean {
		return this.dataviewPlugin !== null;
	}

	/**
	 * Get the Dataview plugin instance
	 */
	getDataviewPlugin(): any | null {
		return this.dataviewPlugin;
	}

	/**
	 * Get the Dataview API
	 */
	getDataviewAPI(): DataviewAPI | null {
		if (!this.dataviewPlugin) {
			return null;
		}

		return this.dataviewPlugin.api ?? null;
	}

	/**
	 * Require the Dataview API (throws if not available)
	 */
	requireAPI(): DataviewAPI {
		const api = this.getDataviewAPI();
		if (!api) {
			const message = "Dataview plugin is not installed or not enabled";
			if (this.onDataviewMissing) {
				this.onDataviewMissing();
			}
			throw new Error(`[TesseraScript] ${message}`);
		}
		return api;
	}

	/**
	 * Check if Dataview is available and call onDataviewMissing if not
	 */
	checkAvailability(): boolean {
		const available = this.isAvailable();
		if (!available && this.onDataviewMissing) {
			this.onDataviewMissing();
		}
		return available;
	}

	/**
	 * Refresh the Dataview plugin reference
	 */
	refresh(): void {
		this.dataviewPlugin = this.findDataviewPlugin();
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let bridgeInstance: DataviewBridge | null = null;

/**
 * Get or create the singleton DataviewBridge instance
 */
export function getDataviewBridge(options?: DataviewBridgeOptions): DataviewBridge | null {
	if (!bridgeInstance && options) {
		bridgeInstance = new DataviewBridge(options);
	}
	return bridgeInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetDataviewBridge(): void {
	bridgeInstance = null;
}

export default DataviewBridge;
