/**
 * TesseraScript Obsidian Plugin
 * Modular component library for DataviewJS
 */

import { Notice, Plugin } from "obsidian";
import { card } from "./components/card/index";
import { heatmap } from "./components/heatmap/index";
import { progressbar } from "./components/progressbar/index";
import { createChartGroup } from "./components/chart/index";

import type { PluginSettings, TesseraAPI, ComponentKey } from "./settings";
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
		// Namespace: tessera.core.<component> / tessera.chart.<component> (ADR-0003/0005)
		// coreEnabled/chartEnabled are the master switches for each group (ADR-0004)
		const coreEnabled = this.settings.coreEnabled;
		const chartEnabled = this.settings.chartEnabled;

		// Chart library (ECharts) resource URL — lazily loaded on first chart use.
		// Resolved via the vault adapter so it works regardless of vault location.
		const echartsUrl = this.getEchartsUrl();

		const tessera: TesseraAPI = {
			version: "1.0.0",
			core: {
				// Wrap each component to inject settings config as deep-merged defaults
				card: coreEnabled && this.settings.card.enabled
					? (options) => card(this.mergeComponentConfig(this.settings.card.config, options))
					: undefined,
				heatmap: coreEnabled && this.settings.heatmap.enabled
					? (options) => heatmap(this.mergeComponentConfig(this.settings.heatmap.config, options))
					: undefined,
				progressbar: coreEnabled && this.settings.progressbar.enabled
					? (options) => progressbar(this.mergeComponentConfig(this.settings.progressbar.config, options))
					: undefined,
			},
			chart: chartEnabled
				? createChartGroup({
					echartsUrl,
					lineEnabled: this.settings.line.enabled,
					barEnabled: this.settings.bar.enabled,
					gaugeEnabled: this.settings.gauge.enabled,
					roseEnabled: this.settings.rose.enabled,
				})
				: {
					line: undefined,
					bar: undefined,
					gauge: undefined,
					rose: undefined,
				},
		};

		// Mount to window
		(window as unknown as Record<string, unknown>).tessera = tessera;

		// Add commands
		this.addCommand({
			id: "tessera-check-status",
			name: "Check status",
			callback: () => {
				const components = [
					this.settings.card.enabled ? "core.card" : null,
					this.settings.heatmap.enabled ? "core.heatmap" : null,
					this.settings.progressbar.enabled ? "core.progressbar" : null,
					this.settings.line.enabled ? "chart.line" : null,
					this.settings.bar.enabled ? "chart.bar" : null,
					this.settings.gauge.enabled ? "chart.gauge" : null,
					this.settings.rose.enabled ? "chart.rose" : null,
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
		const loaded = await this.loadData() as Partial<PluginSettings> | null;

		// Version gate: incompatible or missing saved data resets to defaults
		// (Early development phase — breaking changes are acceptable, ADR-0002)
		if (!loaded || loaded.version !== DEFAULT_SETTINGS.version) {
			this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as PluginSettings;
			await this.saveSettings();
			return;
		}

		this.settings = {
			version: DEFAULT_SETTINGS.version,
			coreEnabled: loaded.coreEnabled ?? DEFAULT_SETTINGS.coreEnabled,
			chartEnabled: loaded.chartEnabled ?? DEFAULT_SETTINGS.chartEnabled,
			card: {
				enabled: loaded.card?.enabled ?? DEFAULT_SETTINGS.card.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.card.config, loaded.card?.config),
			},
			heatmap: {
				enabled: loaded.heatmap?.enabled ?? DEFAULT_SETTINGS.heatmap.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.heatmap.config, loaded.heatmap?.config),
			},
			progressbar: {
				enabled: loaded.progressbar?.enabled ?? DEFAULT_SETTINGS.progressbar.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.progressbar.config, loaded.progressbar?.config),
			},
			line: {
				enabled: loaded.line?.enabled ?? DEFAULT_SETTINGS.line.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.line.config, loaded.line?.config),
			},
			bar: {
				enabled: loaded.bar?.enabled ?? DEFAULT_SETTINGS.bar.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.bar.config, loaded.bar?.config),
			},
			gauge: {
				enabled: loaded.gauge?.enabled ?? DEFAULT_SETTINGS.gauge.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.gauge.config, loaded.gauge?.config),
			},
			rose: {
				enabled: loaded.rose?.enabled ?? DEFAULT_SETTINGS.rose.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.rose.config, loaded.rose?.config),
			},
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as PluginSettings;
		await this.saveSettings();
	}

	/**
	 * Resource URL for lib/echarts.min.js (ADR-0005 lazy loading).
	 * Uses the vault adapter to build a loadable URL for the plugin's lib folder.
	 */
	private getEchartsUrl(): string {
		const adapter = this.app.vault.adapter;
		const pluginDir = this.manifest.dir ?? "";
		const libPath = `${pluginDir}/lib/echarts.min.js`.replace(/^\/+/, "");
		const resourcePath = (adapter as { getResourcePath?: (path: string) => string }).getResourcePath;
		if (typeof resourcePath === "function") {
			return resourcePath.call(adapter, libPath);
		}
		// Fallback: relative URL (works when the vault is served from a web root)
		return libPath;
	}

	/**
	 * Deep-merge settings config (defaults) with per-call options.
	 * Nested groups (flags/layout/colors/styles) merge recursively instead of
	 * being overwritten wholesale (fixes the previous shallow-merge bug).
	 */
	private mergeComponentConfig<T>(config: Record<string, unknown>, options?: T): T {
		const source = (options ?? {}) as unknown;
		return this.deepMerge(config, source as Record<string, unknown>) as T;
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