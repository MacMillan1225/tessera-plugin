/**
 * TesseraScript Obsidian Plugin
 * Modular component library for DataviewJS
 */

import { Notice, Plugin } from "obsidian";
import { card } from "./components/card/index";
import { heatmap } from "./components/heatmap/index";
import { progressbar } from "./components/progressbar/index";
import { example } from "./components/example/index";

import type { PluginSettings, TesseraAPI } from "./settings";
import { DEFAULT_SETTINGS, TesseraSettingTab } from "./settings";

// ============================================================================
// Plugin Class
// ============================================================================

export default class TesseraPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Check if Dataview is available
		const appWithPlugins = this.app as unknown as { plugins?: { plugins?: Record<string, { api?: unknown }> } };
		const dataviewApi = appWithPlugins.plugins?.plugins?.["dataview"]?.api;
		if (!dataviewApi) {
			new Notice(
				"Dataview plugin is required. Please install and enable it.",
				5000
			);
			return;
		}

		// Create tessera API object with config injection
		const tessera: TesseraAPI = {
			version: "1.0.0",
			// Wrap each component to inject settings config as defaults
			card: this.settings.card.enabled 
				? ((options: any) => card({ ...this.settings.card.config, ...options }))
				: undefined,
			heatmap: this.settings.heatmap.enabled 
				? ((options: any) => heatmap({ ...this.settings.heatmap.config, ...options }))
				: undefined,
			progressbar: this.settings.progressbar.enabled 
				? ((options: any) => progressbar({ ...this.settings.progressbar.config, ...options }))
				: undefined,
			example,
		};

		// Mount to window
		(window as unknown as Record<string, unknown>).tessera = tessera;

		// Add commands
		this.addCommand({
			id: "tessera-check-status",
			name: "Check status",
			callback: () => {
				const components = [
					this.settings.card.enabled ? "card" : null,
					this.settings.heatmap.enabled ? "heatmap" : null,
					this.settings.progressbar.enabled ? "progressbar" : null,
					"example",
				].filter(Boolean);

				new Notice(
					`TesseraScript Status:\n` +
					`Dataview: ✓\n` +
					`Components: ${components.join(", ")}`,
					5000
				);
			},
		});

		// Add settings tab
		this.addSettingTab(new TesseraSettingTab(this.app, this));
	}

	onunload() {
		// Unmount from window
		delete (window as unknown as Record<string, unknown>).tessera;
	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = {
			card: {
				enabled: loaded?.card?.enabled ?? DEFAULT_SETTINGS.card.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.card.config, loaded?.card?.config),
			},
			heatmap: {
				enabled: loaded?.heatmap?.enabled ?? DEFAULT_SETTINGS.heatmap.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.heatmap.config, loaded?.heatmap?.config),
			},
			progressbar: {
				enabled: loaded?.progressbar?.enabled ?? DEFAULT_SETTINGS.progressbar.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.progressbar.config, loaded?.progressbar?.config),
			},
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
	}

	private deepMerge(target: Record<string, unknown>, source?: Record<string, unknown>): Record<string, unknown> {
		if (!source) return { ...target };
		
		const result = { ...target };
		for (const key of Object.keys(source)) {
			if (
				source[key] && 
				typeof source[key] === "object" && 
				!Array.isArray(source[key]) &&
				target[key] && 
				typeof target[key] === "object" && 
				!Array.isArray(target[key])
			) {
				result[key] = this.deepMerge(
					target[key] as Record<string, unknown>,
					source[key] as Record<string, unknown>
				);
			} else {
				result[key] = source[key];
			}
		}
		return result;
	}
}
