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
// Settings Field Definitions (Easy to extend!)
// ============================================================================

type FieldType = "toggle" | "text" | "number" | "textarea";

interface SettingField {
	key: string;           // Path in config (e.g., "flags.showHeader")
	label: string;         // Display label
	type: FieldType;       // Input type
	description?: string;  // Optional description
	placeholder?: string;  // Optional placeholder
}

interface ComponentDefinition {
	name: string;
	description: string;
	fields: SettingField[];
}

/**
 * Component settings definitions
 * -----------------------------------------------
 * To add a new field, simply add it to the appropriate component's `fields` array.
 * To add a new component, add a new entry to COMPONENTS.
 * 
 * Field types: "toggle", "text", "number", "textarea"
 * Key format: dot-notation path (e.g., "flags.showHeader", "layout.padding")
 */
const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
	card: {
		name: "Card",
		description: "General-purpose card component for dashboards and panels",
		fields: [
			// Flags
			{ key: "flags.showHeader", label: "Show Header", type: "toggle" },
			{ key: "flags.headerSep", label: "Header Separator", type: "toggle" },
			{ key: "flags.showTitle", label: "Show Title", type: "toggle" },
			{ key: "flags.showMeta", label: "Show Meta", type: "toggle" },
			{ key: "flags.showValue", label: "Show Value", type: "toggle" },
			// Layout
			{ key: "layout.maxWidth", label: "Max Width", type: "text" },
			{ key: "layout.padding", label: "Padding", type: "text" },
			{ key: "layout.radius", label: "Border Radius", type: "text" },
			{ key: "layout.gap", label: "Gap", type: "text" },
			{ key: "layout.bodyGap", label: "Body Gap", type: "text" },
			// Colors (Light)
			{ key: "colors.light.background", label: "Light Background", type: "text" },
			{ key: "colors.light.border", label: "Light Border", type: "text" },
			{ key: "colors.light.shadow", label: "Light Shadow", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.background", label: "Dark Background", type: "text" },
			{ key: "colors.dark.border", label: "Dark Border", type: "text" },
			{ key: "colors.dark.shadow", label: "Dark Shadow", type: "text" },
		],
	},
	heatmap: {
		name: "Heatmap",
		description: "GitHub-style contribution heatmap",
		fields: [
			// Flags
			{ key: "flags.showWeekLabels", label: "Show Week Labels", type: "toggle" },
			{ key: "flags.showMonthLabels", label: "Show Month Labels", type: "toggle" },
			{ key: "flags.showLegend", label: "Show Legend", type: "toggle" },
			{ key: "flags.enableTooltip", label: "Enable Tooltip", type: "toggle" },
			{ key: "flags.mondayFirst", label: "Monday First", type: "toggle" },
			// Settings
			{ key: "settings.locale", label: "Locale", type: "text", placeholder: "zh-CN" },
			{ key: "settings.rangeMode", label: "Range Mode", type: "text", placeholder: "adaptive" },
			{ key: "settings.minWeeks", label: "Min Weeks", type: "number" },
			{ key: "settings.fixedDays", label: "Fixed Days", type: "number" },
			{ key: "settings.legend", label: "Legend Template", type: "text" },
			// Layout
			{ key: "layout.cellSize", label: "Cell Size", type: "number" },
			{ key: "layout.cellGap", label: "Cell Gap", type: "number" },
			{ key: "layout.cellRadius", label: "Cell Radius", type: "text" },
			{ key: "layout.weekLabelWidth", label: "Week Label Width", type: "text" },
			{ key: "layout.monthLabelHeight", label: "Month Label Height", type: "text" },
			{ key: "layout.monthLabelSize", label: "Month Label Size", type: "text" },
			{ key: "layout.weekLabelSize", label: "Week Label Size", type: "text" },
			// Colors (Light)
			{ key: "colors.light.dayBg", label: "Light Day Background", type: "text" },
			{ key: "colors.light.tooltip", label: "Light Tooltip Text", type: "text" },
			{ key: "colors.light.tooltipBg", label: "Light Tooltip Background", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.dayBg", label: "Dark Day Background", type: "text" },
			{ key: "colors.dark.tooltip", label: "Dark Tooltip Text", type: "text" },
			{ key: "colors.dark.tooltipBg", label: "Dark Tooltip Background", type: "text" },
		],
	},
	progressbar: {
		name: "Progressbar",
		description: "Progress bar component for displaying progress",
		fields: [
			// Basic
			{ key: "showLabel", label: "Show Label", type: "toggle" },
			{ key: "labelFormat", label: "Label Format", type: "text", placeholder: "{value}%" },
			{ key: "min", label: "Min Value", type: "number" },
			{ key: "max", label: "Max Value", type: "number" },
			// Flags
			{ key: "flags.showGlow", label: "Show Glow", type: "toggle" },
			{ key: "flags.striped", label: "Striped", type: "toggle" },
			{ key: "flags.animated", label: "Animated", type: "toggle" },
			// Layout
			{ key: "layout.width", label: "Width", type: "text" },
			{ key: "layout.height", label: "Height", type: "text" },
			{ key: "layout.radius", label: "Border Radius", type: "text" },
			{ key: "layout.trackOpacity", label: "Track Opacity", type: "number" },
			// Colors (Light)
			{ key: "colors.light.track", label: "Light Track Color", type: "text" },
			{ key: "colors.light.fill", label: "Light Fill Color", type: "text" },
			{ key: "colors.light.label", label: "Light Label Color", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.track", label: "Dark Track Color", type: "text" },
			{ key: "colors.dark.fill", label: "Dark Fill Color", type: "text" },
			{ key: "colors.dark.label", label: "Dark Label Color", type: "text" },
		],
	},
};

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

// ============================================================================
// Settings Tab
// ============================================================================

import { App, PluginSettingTab, Setting } from "obsidian";

class TesseraSettingTab extends PluginSettingTab {
	plugin: TesseraPlugin;
	private collapsedSections: Set<string> = new Set();

	constructor(app: App, plugin: TesseraPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Add custom styles for collapsible sections
		this.addCustomStyles();

		// Header
		new Setting(containerEl).setName("TesseraScript Configuration").setHeading();
		containerEl.createEl("p", {
			text: "Configure which components are available and their default settings.",
			cls: "tessera-settings-desc",
		});

		// Render each component as a collapsible section
		for (const [key, definition] of Object.entries(COMPONENTS)) {
			this.renderCollapsibleSection(
				containerEl,
				key as keyof PluginSettings,
				definition
			);
		}

		// Usage section
		new Setting(containerEl).setName("Usage").setHeading();
		containerEl.createEl("p", {
			text: "Use tessera components in your dataviewjs code blocks:",
		});
		const codeBlock = containerEl.createEl("pre", { cls: "tessera-code-block" });
		codeBlock.createEl("code", {
			text: `dv.container.appendChild(tessera.card({
  title: "Hello",
  value: 42
}));`,
		});
	}

	private renderCollapsibleSection(
		containerEl: HTMLElement,
		key: keyof PluginSettings,
		definition: ComponentDefinition
	): void {
		const componentConfig = this.plugin.settings[key];
		const isCollapsed = this.collapsedSections.has(key);

		// Create section container
		const section = containerEl.createDiv({ cls: "tessera-settings-section" });

		// Header row with toggle and collapse button
		const header = section.createDiv({ cls: "tessera-settings-header" });

		// Collapse toggle button
		const collapseBtn = header.createEl("span", {
			cls: "tessera-collapse-btn",
			text: isCollapsed ? "▶" : "▼",
		});
		collapseBtn.addEventListener("click", () => {
			if (this.collapsedSections.has(key)) {
				this.collapsedSections.delete(key);
			} else {
				this.collapsedSections.add(key);
			}
			this.display();
		});

		// Component name and description
		const titleContainer = header.createDiv({ cls: "tessera-title-container" });
		titleContainer.createEl("span", { cls: "tessera-component-name", text: definition.name });
		titleContainer.createEl("span", { cls: "tessera-component-desc", text: definition.description });

		// Enable/disable toggle
		const toggleContainer = header.createDiv({ cls: "tessera-toggle-container" });
		const toggle = toggleContainer.createEl("input", { type: "checkbox" }) as HTMLInputElement;
		toggle.checked = componentConfig.enabled;
		toggle.classList.add("tessera-toggle");
		toggle.addEventListener("change", async () => {
			this.plugin.settings[key].enabled = toggle.checked;
			await this.plugin.saveSettings();
			this.display();
		});

		// Collapsible content
		if (!isCollapsed && componentConfig.enabled) {
			const content = section.createDiv({ cls: "tessera-settings-content" });
			this.renderFields(content, componentConfig.config, definition.fields, async () => {
				await this.plugin.saveSettings();
			});
		}
	}

	private renderFields(
		container: HTMLElement,
		config: Record<string, unknown>,
		fields: SettingField[],
		onSave: () => Promise<void>
	): void {
		// Group fields by their prefix (e.g., "flags", "layout", "settings", "colors.light")
		const groups = new Map<string, SettingField[]>();
		
		for (const field of fields) {
			const parts = field.key.split(".");
			const groupKey = parts.length > 1 ? parts.slice(0, -1).join(".") : "_root";
			
			if (!groups.has(groupKey)) {
				groups.set(groupKey, []);
			}
			groups.get(groupKey)!.push(field);
		}

		// Render each group
		for (const [groupKey, groupFields] of groups) {
			if (groupKey !== "_root") {
				const groupHeader = container.createDiv({ cls: "tessera-group-header" });
				groupHeader.createEl("span", { text: this.formatGroupLabel(groupKey) });
			}

			for (const field of groupFields) {
				this.renderField(container, config, field, onSave);
			}
		}
	}

	private renderField(
		container: HTMLElement,
		config: Record<string, unknown>,
		field: SettingField,
		onSave: () => Promise<void>
	): void {
		const setting = new Setting(container);
		setting.setName(field.label);
		if (field.description) {
			setting.setDesc(field.description);
		}

		const currentValue = this.getNestedValue(config, field.key);

		switch (field.type) {
			case "toggle":
				setting.addToggle((toggle) => {
					toggle.setValue(Boolean(currentValue));
					toggle.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await onSave();
					});
				});
				break;

			case "text":
			case "number":
				setting.addText((text) => {
					text.setValue(String(currentValue ?? ""));
					if (field.placeholder) {
						text.setPlaceholder(field.placeholder);
					}
					text.onChange(async (value) => {
						if (field.type === "number") {
							const num = Number(value);
							this.setNestedValue(config, field.key, isNaN(num) ? value : num);
						} else {
							this.setNestedValue(config, field.key, value);
						}
						await onSave();
					});
				});
				break;

			case "textarea":
				setting.addTextArea((textarea) => {
					textarea.setValue(String(currentValue ?? ""));
					if (field.placeholder) {
						textarea.setPlaceholder(field.placeholder);
					}
					textarea.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await onSave();
					});
				});
				break;
		}
	}

	private formatGroupLabel(key: string): string {
		return key
			.split(".")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" › ");
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

	private addCustomStyles(): void {
		const styleId = "tessera-settings-styles";
		if (document.getElementById(styleId)) return;

		const style = document.createElement("style");
		style.id = styleId;
		style.textContent = `
			.tessera-settings-desc {
				color: var(--text-muted);
				margin-bottom: 16px;
			}

			.tessera-settings-section {
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				margin-bottom: 12px;
				overflow: hidden;
			}

			.tessera-settings-header {
				display: flex;
				align-items: center;
				padding: 12px 16px;
				background: var(--background-secondary);
				cursor: pointer;
				gap: 12px;
			}

			.tessera-settings-header:hover {
				background: var(--background-secondary-alt);
			}

			.tessera-collapse-btn {
				font-size: 10px;
				width: 16px;
				color: var(--text-muted);
				user-select: none;
			}

			.tessera-title-container {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 2px;
			}

			.tessera-component-name {
				font-weight: 600;
				font-size: 14px;
			}

			.tessera-component-desc {
				font-size: 12px;
				color: var(--text-muted);
			}

			.tessera-toggle-container {
				display: flex;
				align-items: center;
			}

			.tessera-toggle {
				width: 40px;
				height: 22px;
				appearance: none;
				background: var(--background-modifier-border);
				border-radius: 11px;
				position: relative;
				cursor: pointer;
				transition: background 0.2s;
			}

			.tessera-toggle:checked {
				background: var(--interactive-accent);
			}

			.tessera-toggle::before {
				content: "";
				position: absolute;
				width: 18px;
				height: 18px;
				border-radius: 50%;
				background: white;
				top: 2px;
				left: 2px;
				transition: transform 0.2s;
			}

			.tessera-toggle:checked::before {
				transform: translateX(18px);
			}

			.tessera-settings-content {
				padding: 8px 16px 16px;
			}

			.tessera-group-header {
				font-size: 11px;
				font-weight: 600;
				color: var(--text-muted);
				text-transform: uppercase;
				letter-spacing: 0.5px;
				padding: 12px 0 4px;
				margin-top: 8px;
				border-top: 1px solid var(--background-modifier-border);
			}

			.tessera-group-header:first-child {
				border-top: none;
				margin-top: 0;
				padding-top: 4px;
			}

			.tessera-code-block {
				background: var(--background-secondary);
				padding: 12px;
				border-radius: 6px;
				overflow-x: auto;
			}
		`;
		document.head.appendChild(style);
	}
}
