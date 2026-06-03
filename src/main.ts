/**
 * TesseraScript Obsidian Plugin
 * Modular component library for DataviewJS
 */

import { Notice, Plugin } from "obsidian";
import { card } from "./components/card/index";
import { heatmap } from "./components/heatmap/index";
import { progressbar } from "./components/progressbar/index";
import { example } from "./components/example/index";

// ============================================================================
// Types
// ============================================================================

interface TesseraAPI {
	version: string;
	card: typeof card | undefined;
	heatmap: typeof heatmap | undefined;
	progressbar: typeof progressbar | undefined;
	example: typeof example;
}

interface ComponentConfig {
	enabled: boolean;
	config: Record<string, unknown>;
}

export interface PluginSettings {
	card: ComponentConfig;
	heatmap: ComponentConfig;
	progressbar: ComponentConfig;
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: PluginSettings = {
	card: {
		enabled: true,
		config: {
			flags: {
				showHeader: true,
				headerSep: true,
				showTitle: true,
				showMeta: true,
				showValue: true,
			},
			layout: {
				maxWidth: "100%",
				padding: "16px",
				radius: "16px",
				gap: "14px",
				bodyGap: "12px",
			},
			colors: {
				light: {
					background: "rgba(245, 248, 252, 0.9)",
					border: "rgba(120, 140, 160, 0.18)",
					shadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
				dark: {
					background: "rgba(30, 41, 59, 0.72)",
					border: "rgba(148, 163, 184, 0.18)",
					shadow: "0 16px 36px rgba(2, 6, 23, 0.28)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
			},
		},
	},
	heatmap: {
		enabled: true,
		config: {
			flags: {
				showWeekLabels: true,
				showMonthLabels: true,
				showLegend: true,
				enableTooltip: true,
				mondayFirst: true,
			},
			settings: {
				rangeMode: "adaptive",
				minWeeks: 12,
				fixedDays: 84,
				locale: "zh-CN",
				monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
				weekLabels: ["一", "", "三", "", "五", "", "日"],
				legend: "少 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 多",
				tooltipId: "ts-heatmap-tooltip",
			},
			layout: {
				maxWidth: "100%",
				cellSize: 11,
				cellGap: 2,
				cellRadius: "3px",
				weekLabelWidth: "20px",
				weekLabelGap: "9px",
				monthLabelHeight: "18px",
				monthOffset: "28px",
				gridTopOffset: "4px",
				monthLabelSize: "9px",
				weekLabelSize: "9px",
				legendGap: "3px",
				legendTop: "6px",
				legendSwatchSize: "9px",
			},
			colors: {
				light: {
					dayBg: "#f1f5f9",
					tooltip: "#ffffff",
					tooltipBg: "#0f172a",
					levels: ["#f1f5f9", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#14532d"],
				},
				dark: {
					dayBg: "#334155",
					tooltip: "#0f172a",
					tooltipBg: "#f1f5f9",
					levels: ["#334155", "#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
				},
			},
		},
	},
	progressbar: {
		enabled: true,
		config: {
			value: 0,
			max: 100,
			min: 0,
			showLabel: true,
			labelFormat: "{value}%",
			flags: {
				showGlow: true,
				striped: false,
				animated: false,
			},
			layout: {
				width: "100%",
				height: "8px",
				radius: "4px",
				trackOpacity: 0.2,
			},
			colors: {
				light: {
					track: "rgba(0, 0, 0, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
				dark: {
					track: "rgba(255, 255, 255, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
			},
		},
	},
};

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

		// Create tessera API object with conditional components
		const tessera: TesseraAPI = {
			version: "1.0.0",
			card: this.settings.card.enabled ? card : undefined,
			heatmap: this.settings.heatmap.enabled ? heatmap : undefined,
			progressbar: this.settings.progressbar.enabled ? progressbar : undefined,
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
				config: { ...DEFAULT_SETTINGS.card.config, ...loaded?.card?.config },
			},
			heatmap: {
				enabled: loaded?.heatmap?.enabled ?? DEFAULT_SETTINGS.heatmap.enabled,
				config: { ...DEFAULT_SETTINGS.heatmap.config, ...loaded?.heatmap?.config },
			},
			progressbar: {
				enabled: loaded?.progressbar?.enabled ?? DEFAULT_SETTINGS.progressbar.enabled,
				config: { ...DEFAULT_SETTINGS.progressbar.config, ...loaded?.progressbar?.config },
			},
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// ============================================================================
// Settings Tab
// ============================================================================

import { App, PluginSettingTab, Setting } from "obsidian";

class TesseraSettingTab extends PluginSettingTab {
	plugin: TesseraPlugin;

	constructor(app: App, plugin: TesseraPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("TesseraScript Configuration").setHeading();

		containerEl.createEl("p", {
			text: "Configure which components are available and their default settings.",
		});

		// Card Component Section
		this.renderComponentSection(containerEl, "Card", "card", this.plugin.settings.card, {
			"Show Header": "flags.showHeader",
			"Show Title": "flags.showTitle",
			"Show Meta": "flags.showMeta",
			"Show Value": "flags.showValue",
		}, {
			"Padding": "layout.padding",
			"Border Radius": "layout.radius",
			"Gap": "layout.gap",
		});

		// Heatmap Component Section
		this.renderComponentSection(containerEl, "Heatmap", "heatmap", this.plugin.settings.heatmap, {
			"Show Week Labels": "flags.showWeekLabels",
			"Show Month Labels": "flags.showMonthLabels",
			"Show Legend": "flags.showLegend",
			"Enable Tooltip": "flags.enableTooltip",
			"Monday First": "flags.mondayFirst",
		}, {
			"Cell Size": "layout.cellSize",
			"Cell Gap": "layout.cellGap",
			"Locale": "settings.locale",
		});

		// Progressbar Component Section
		this.renderComponentSection(containerEl, "Progressbar", "progressbar", this.plugin.settings.progressbar, {
			"Show Label": "showLabel",
			"Show Glow": "flags.showGlow",
			"Striped": "flags.striped",
			"Animated": "flags.animated",
		}, {
			"Height": "layout.height",
			"Border Radius": "layout.radius",
			"Label Format": "labelFormat",
		});

		// Usage section
		new Setting(containerEl).setName("Usage").setHeading();
		containerEl.createEl("p", {
			text: "Use tessera components in your dataviewjs code blocks:",
		});

		const codeBlock = containerEl.createEl("pre");
		codeBlock.createEl("code", {
			text: `dv.container.appendChild(tessera.card({
  title: "Hello",
  value: 42
}));`,
		});
	}

	private renderComponentSection(
		containerEl: HTMLElement,
		name: string,
		key: keyof PluginSettings,
		componentConfig: ComponentConfig,
		booleanOptions: Record<string, string>,
		textOptions: Record<string, string>
	): void {
		// Component header with toggle
		const headerSetting = new Setting(containerEl)
			.setName(name)
			.setDesc(`Enable/disable ${name.toLowerCase()} component`);

		headerSetting.addToggle((toggle) => {
			toggle
				.setValue(componentConfig.enabled)
				.onChange(async (value) => {
					this.plugin.settings[key].enabled = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide config options
				});
		});

		// Only show config options if component is enabled
		if (!componentConfig.enabled) {
			return;
		}

		// Boolean options (toggles)
		for (const [label, path] of Object.entries(booleanOptions)) {
			new Setting(containerEl)
				.setName(label)
				.addToggle((toggle) => {
					const currentValue = this.getNestedValue(componentConfig.config, path) as boolean;
					toggle
						.setValue(currentValue ?? false)
						.onChange(async (value) => {
							this.setNestedValue(componentConfig.config, path, value);
							await this.plugin.saveSettings();
						});
				});
		}

		// Text/Number options
		for (const [label, path] of Object.entries(textOptions)) {
			new Setting(containerEl)
				.setName(label)
				.addText((text) => {
					const currentValue = this.getNestedValue(componentConfig.config, path);
					text
						.setValue(String(currentValue ?? ""))
						.onChange(async (value) => {
							// Try to parse as number if appropriate
							const numValue = Number(value);
							const finalValue = !isNaN(numValue) && value.trim() !== "" ? numValue : value;
							this.setNestedValue(componentConfig.config, path, finalValue);
							await this.plugin.saveSettings();
						});
				});
		}
	}

	private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
		const parts = path.split(".");
		let current: unknown = obj;
		for (const part of parts) {
			if (current == null || typeof current !== "object") {
				return undefined;
			}
			current = (current as Record<string, unknown>)[part];
		}
		return current;
	}

	private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
		const parts = path.split(".");
		let current = obj;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!part) continue;
			
			if (current[part] == null || typeof current[part] !== "object") {
				current[part] = {};
			}
			current = current[part] as Record<string, unknown>;
		}
		const lastPart = parts[parts.length - 1];
		if (lastPart) {
			current[lastPart] = value;
		}
	}
}
