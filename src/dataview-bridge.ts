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
	executeJs: (code: string, container: HTMLElement, context: Record<string, unknown>) => Promise<void>;
	pages: (query: string) => unknown[];
	// Add more Dataview API methods as needed
}

interface PluginRegistry {
	plugins: Record<string, unknown>;
}

interface DataviewPluginInstance {
	api: DataviewAPI | null;
	[key: string]: unknown;
}

// ============================================================================
// DataviewBridge Class
// ============================================================================

export class DataviewBridge {
	private app: App;
	private onDataviewMissing?: () => void;
	private dataviewPlugin: DataviewPluginInstance | null = null;

	constructor(options: DataviewBridgeOptions) {
		this.app = options.app;
		this.onDataviewMissing = options.onDataviewMissing;
		this.dataviewPlugin = this.findDataviewPlugin();
	}

	/**
	 * Find and cache the Dataview plugin instance
	 */
	private findDataviewPlugin(): DataviewPluginInstance | null {
		const plugins = (this.app as unknown as { plugins: PluginRegistry }).plugins;
		if (!plugins) {
			return null;
		}

		return plugins.plugins["dataview"] as DataviewPluginInstance ?? null;
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
	getDataviewPlugin(): DataviewPluginInstance | null {
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
