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
// i18n Translations (loaded from JSON files)
// ============================================================================

import enTranslations from "./i18n/en.json";
import zhTranslations from "./i18n/zh.json";
import jaTranslations from "./i18n/ja.json";

interface Translations {
	settings: {
		title: string;
		description: string;
		usage: string;
		usageDesc: string;
		reloadNotice: string;
		reloadButton: string;
		restoreButton: string;
		restoreNotice: string;
	};
	components: {
		card: { name: string; desc: string };
		heatmap: { name: string; desc: string };
		progressbar: { name: string; desc: string };
	};
	fields: Record<string, string>;
	groups: Record<string, string>;
	tooltips: Record<string, string>;
}

const TRANSLATIONS: Record<string, Translations> = {
	en: enTranslations as Translations,
	zh: zhTranslations as Translations,
	ja: jaTranslations as Translations,
};

// Helper to get translations based on Obsidian locale
function getTranslations(): Translations {
	// Get Obsidian's locale (e.g., "en", "zh", "ja", "ko", etc.)
	const locale = (window as any)?.moment?.locale?.() || "en";
	
	// Try exact match first, then language code, then fallback to English
	if (TRANSLATIONS[locale]) {
		return TRANSLATIONS[locale];
	}
	
	const langCode = locale.split("-")[0];
	if (TRANSLATIONS[langCode]) {
		return TRANSLATIONS[langCode];
	}
	
	return TRANSLATIONS.en!;
}

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

type FieldType = "toggle" | "text" | "number" | "textarea" | "color" | "select" | "slider";

interface SelectOption {
	value: string;
	label: string;
}

interface SettingField {
	key: string;           // Path in config (e.g., "flags.showHeader")
	type: FieldType;       // Input type
	placeholder?: string;  // Optional placeholder
	description?: string;  // Optional description (tooltip text)
	options?: SelectOption[];  // For select type
	min?: number;          // For slider type
	max?: number;          // For slider type
	step?: number;         // For slider type
}

interface ComponentDefinition {
	componentKey: string;  // Key for i18n lookup (e.g., "card")
	fields: SettingField[];
}

/**
 * Component settings definitions
 * -----------------------------------------------
 * To add a new field, simply add it to the appropriate component's `fields` array.
 * To add a new component, add a new entry to COMPONENTS.
 * 
 * Field types: "toggle", "text", "number", "textarea", "color", "select", "slider"
 * Key format: dot-notation path (e.g., "flags.showHeader", "layout.padding")
 * Labels are automatically translated via i18n
 */
const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
	card: {
		componentKey: "card",
		fields: [
			// Flags
			{ key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" },
			{ key: "flags.headerSep", type: "toggle", description: "tooltip.flags.headerSep" },
			{ key: "flags.showTitle", type: "toggle", description: "tooltip.flags.showTitle" },
			{ key: "flags.showMeta", type: "toggle", description: "tooltip.flags.showMeta" },
			{ key: "flags.showValue", type: "toggle", description: "tooltip.flags.showValue" },
			// Layout
			{ key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
			{ key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.gap", type: "text", description: "tooltip.layout.gap" },
			{ key: "layout.bodyGap", type: "text", description: "tooltip.layout.bodyGap" },
			// Colors (Light)
			{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.light.shadow", type: "color", description: "tooltip.colors.shadow" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
			{ key: "colors.dark.shadow", type: "color", description: "tooltip.colors.shadow" },
		],
	},
	heatmap: {
		componentKey: "heatmap",
		fields: [
			// Flags
			{ key: "flags.showWeekLabels", type: "toggle", description: "tooltip.heatmap.showWeekLabels" },
			{ key: "flags.showMonthLabels", type: "toggle", description: "tooltip.heatmap.showMonthLabels" },
			{ key: "flags.showLegend", type: "toggle", description: "tooltip.heatmap.showLegend" },
			{ key: "flags.enableTooltip", type: "toggle", description: "tooltip.heatmap.enableTooltip" },
			{ key: "flags.mondayFirst", type: "toggle", description: "tooltip.heatmap.mondayFirst" },
			// Settings
			{ key: "settings.locale", type: "select", description: "tooltip.heatmap.locale", options: [
				{ value: "zh-CN", label: "中文 (简体)" },
				{ value: "zh-TW", label: "中文 (繁體)" },
				{ value: "en", label: "English" },
				{ value: "ja", label: "日本語" },
				{ value: "ko", label: "한국어" },
				{ value: "fr", label: "Français" },
				{ value: "de", label: "Deutsch" },
				{ value: "es", label: "Español" },
				{ value: "pt", label: "Português" },
				{ value: "ru", label: "Русский" },
			]},
			{ key: "settings.rangeMode", type: "select", description: "tooltip.heatmap.rangeMode", options: [
				{ value: "adaptive", label: "Adaptive" },
				{ value: "fixed", label: "Fixed" },
				{ value: "year", label: "Year" },
			]},
			{ key: "settings.minWeeks", type: "number", description: "tooltip.heatmap.minWeeks" },
			{ key: "settings.fixedDays", type: "number", description: "tooltip.heatmap.fixedDays" },
			{ key: "settings.legend", type: "text", description: "tooltip.heatmap.legend" },
			// Layout
			{ key: "layout.cellSize", type: "number", description: "tooltip.heatmap.cellSize" },
			{ key: "layout.cellGap", type: "number", description: "tooltip.heatmap.cellGap" },
			{ key: "layout.cellRadius", type: "text", description: "tooltip.heatmap.cellRadius" },
			{ key: "layout.weekLabelWidth", type: "text", description: "tooltip.heatmap.weekLabelWidth" },
			{ key: "layout.monthLabelHeight", type: "text", description: "tooltip.heatmap.monthLabelHeight" },
			{ key: "layout.monthLabelSize", type: "text", description: "tooltip.heatmap.monthLabelSize" },
			{ key: "layout.weekLabelSize", type: "text", description: "tooltip.heatmap.weekLabelSize" },
			// Colors (Light)
			{ key: "colors.light.dayBg", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.light.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.light.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
			// Colors (Dark)
			{ key: "colors.dark.dayBg", type: "color", description: "tooltip.colors.background" },
			{ key: "colors.dark.tooltip", type: "color", description: "tooltip.colors.tooltipText" },
			{ key: "colors.dark.tooltipBg", type: "color", description: "tooltip.colors.tooltipBg" },
		],
	},
	progressbar: {
		componentKey: "progressbar",
		fields: [
			// Basic
			{ key: "showLabel", type: "toggle", description: "tooltip.progressbar.showLabel" },
			{ key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.progressbar.labelFormat" },
			{ key: "min", type: "number", description: "tooltip.progressbar.min" },
			{ key: "max", type: "number", description: "tooltip.progressbar.max" },
			// Flags
			{ key: "flags.showGlow", type: "toggle", description: "tooltip.progressbar.showGlow" },
			{ key: "flags.striped", type: "toggle", description: "tooltip.progressbar.striped" },
			{ key: "flags.animated", type: "toggle", description: "tooltip.progressbar.animated" },
			// Layout
			{ key: "layout.width", type: "text", description: "tooltip.layout.width" },
			{ key: "layout.height", type: "text", description: "tooltip.layout.height" },
			{ key: "layout.radius", type: "text", description: "tooltip.layout.radius" },
			{ key: "layout.trackOpacity", type: "slider", min: 0, max: 1, step: 0.01, description: "tooltip.progressbar.trackOpacity" },
			// Colors (Light)
			{ key: "colors.light.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.light.fill", type: "color", description: "tooltip.colors.fill" },
			{ key: "colors.light.label", type: "color", description: "tooltip.colors.label" },
			// Colors (Dark)
			{ key: "colors.dark.track", type: "color", description: "tooltip.colors.track" },
			{ key: "colors.dark.fill", type: "color", description: "tooltip.colors.fill" },
			{ key: "colors.dark.label", type: "color", description: "tooltip.colors.label" },
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
					shadow: "rgba(15, 23, 42, 0.08)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
				dark: {
					background: "rgba(30, 41, 59, 0.72)",
					border: "rgba(148, 163, 184, 0.18)",
					shadow: "rgba(2, 6, 23, 0.28)",
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
// Color Utilities
// ============================================================================

/**
 * Convert rgba string to hex color
 * @example rgbaToHex("rgba(255, 128, 0, 0.5)") => "#ff8000"
 */
function rgbaToHex(rgba: string): string {
	// If already hex, return as-is
	if (rgba.startsWith("#")) {
		return rgba.length === 4 
			? "#" + rgba[1] + rgba[1] + rgba[2] + rgba[2] + rgba[3] + rgba[3]
			: rgba;
	}
	
	// Parse rgba/rgb
	const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
	if (!match) return "#000000";
	
	const r = parseInt(match[1]!).toString(16).padStart(2, "0");
	const g = parseInt(match[2]!).toString(16).padStart(2, "0");
	const b = parseInt(match[3]!).toString(16).padStart(2, "0");
	
	return `#${r}${g}${b}`;
}

/**
 * Convert hex color to rgba string
 * @example hexToRgba("#ff8000", 0.5) => "rgba(255, 128, 0, 0.5)"
 */
function hexToRgba(hex: string, alpha: number = 1): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return hex;
	
	const r = parseInt(result[1]!, 16);
	const g = parseInt(result[2]!, 16);
	const b = parseInt(result[3]!, 16);
	
	return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extract alpha from rgba string
 * @example extractAlpha("rgba(255, 128, 0, 0.5)") => 0.5
 */
function extractAlpha(rgba: string): number {
	const match = rgba.match(/rgba\([^)]+,\s*([\d.]+)\)/);
	return match ? parseFloat(match[1]!) : 1;
}

/**
 * Check if a value looks like a CSS color
 */
function isColorLike(value: unknown): boolean {
	if (typeof value !== "string") return false;
	return (
		value.startsWith("#") ||
		value.startsWith("rgb") ||
		value.startsWith("hsl") ||
		/^[a-f0-9]{6}$/i.test(value)
	);
}

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

// ============================================================================
// Settings Tab
// ============================================================================

import { App, PluginSettingTab, Setting } from "obsidian";

class TesseraSettingTab extends PluginSettingTab {
	plugin: TesseraPlugin;
	private collapsedSections: Set<string> = new Set();
	private needsReload = false;
	private t: Translations;
	private reloadContainerEl: HTMLElement | null = null;

	constructor(app: App, plugin: TesseraPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.t = getTranslations();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Add custom styles for collapsible sections
		this.addCustomStyles();

		// Header
		new Setting(containerEl).setName(this.t.settings.title).setHeading();
		containerEl.createEl("p", {
			text: this.t.settings.description,
			cls: "tessera-settings-desc",
		});

		// Reload button (hidden by default)
		this.renderReloadSection(containerEl);

		// Render each component as a collapsible section
		for (const [key, definition] of Object.entries(COMPONENTS)) {
			this.renderCollapsibleSection(
				containerEl,
				key as keyof PluginSettings,
				definition
			);
		}

		// Restore defaults section
		this.renderRestoreSection(containerEl);

		// Usage section
		new Setting(containerEl).setName(this.t.settings.usage).setHeading();
		containerEl.createEl("p", {
			text: this.t.settings.usageDesc,
		});
		const codeBlock = containerEl.createEl("pre", { cls: "tessera-code-block" });
		codeBlock.createEl("code", {
			text: `dv.container.appendChild(tessera.card({
  title: "Hello",
  value: 42
}));`,
		});
	}

	private renderReloadSection(containerEl: HTMLElement): void {
		const section = containerEl.createDiv({ cls: "tessera-reload-section" });
		this.reloadContainerEl = section;

		const setting = new Setting(section);
		setting.setName(this.t.settings.reloadButton);
		setting.setDesc(this.t.settings.reloadNotice);
		setting.addButton((btn) => {
			btn.setButtonText(this.t.settings.reloadButton);
			btn.setCta();
			btn.onClick(() => {
				// @ts-ignore - Internal Obsidian API
				this.app.commands.executeCommandById("app:reload");
			});
		});

		// Hide initially if no changes
		if (!this.needsReload) {
			section.style.display = "none";
		}
	}

	private renderRestoreSection(containerEl: HTMLElement): void {
		const setting = new Setting(containerEl);
		setting.setName(this.t.settings.restoreButton);
		setting.setDesc(this.t.settings.restoreNotice);
		setting.addButton((btn) => {
			btn.setButtonText(this.t.settings.restoreButton);
			btn.setWarning();
			btn.onClick(async () => {
				await this.plugin.resetSettings();
				this.needsReload = true;
				this.display();
			});
		});
	}

	private showReloadButton(): void {
		this.needsReload = true;
		if (this.reloadContainerEl) {
			this.reloadContainerEl.style.display = "block";
		}
	}

	private renderCollapsibleSection(
		containerEl: HTMLElement,
		key: keyof PluginSettings,
		definition: ComponentDefinition
	): void {
		const componentConfig = this.plugin.settings[key];
		const isCollapsed = this.collapsedSections.has(key);
		const componentI18n = this.t.components[definition.componentKey as keyof typeof this.t.components];

		// Create section container
		const section = containerEl.createDiv({ cls: "tessera-settings-section" });

		// Use Obsidian Setting API for the header (with built-in toggle)
		const headerSetting = new Setting(section);
		headerSetting.setName(componentI18n.name);
		headerSetting.setDesc(componentI18n.desc);

		// Add collapse button
		const collapseBtn = document.createElement("span");
		collapseBtn.className = "tessera-collapse-btn";
		collapseBtn.textContent = isCollapsed ? "▶" : "▼";
		collapseBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (this.collapsedSections.has(key)) {
				this.collapsedSections.delete(key);
			} else {
				this.collapsedSections.add(key);
			}
			this.display();
		});
		headerSetting.settingEl.prepend(collapseBtn);

		// Add toggle using Obsidian's API
		headerSetting.addToggle((toggle) => {
			toggle.setValue(componentConfig.enabled);
			toggle.onChange(async (value) => {
				this.plugin.settings[key].enabled = value;
				await this.plugin.saveSettings();
				this.showReloadButton();
				// Re-render the section content, but don't call display() to preserve reload button
				this.rerenderSectionContent(section, key, definition);
			});
		});

		// Collapsible content
		if (!isCollapsed && componentConfig.enabled) {
			const content = section.createDiv({ cls: "tessera-settings-content" });
			this.renderFields(content, componentConfig.config, definition.fields);
		}
	}

	private rerenderSectionContent(
		section: HTMLElement,
		key: keyof PluginSettings,
		definition: ComponentDefinition
	): void {
		const componentConfig = this.plugin.settings[key];
		const isCollapsed = this.collapsedSections.has(key);

		// Remove existing content
		const existingContent = section.querySelector(".tessera-settings-content");
		if (existingContent) {
			existingContent.remove();
		}

		// Re-render if not collapsed and enabled
		if (!isCollapsed && componentConfig.enabled) {
			const content = section.createDiv({ cls: "tessera-settings-content" });
			this.renderFields(content, componentConfig.config, definition.fields);
		}
	}

	private renderFields(
		container: HTMLElement,
		config: Record<string, unknown>,
		fields: SettingField[]
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
				const groupLabel = this.t.groups[groupKey] || this.formatGroupLabel(groupKey);
				groupHeader.createEl("span", { text: groupLabel });
			}

			for (const field of groupFields) {
				this.renderField(container, config, field);
			}
		}
	}

	private addTooltipToSetting(setting: Setting, tooltipKey?: string): void {
		if (!tooltipKey) return;
		
		const tooltipText = this.t.tooltips[tooltipKey];
		if (!tooltipText) return;

		// Create tooltip icon
		const tooltipEl = document.createElement("span");
		tooltipEl.className = "tessera-tooltip-icon";
		tooltipEl.textContent = "?";
		tooltipEl.setAttribute("aria-label", tooltipText);
		
		// Add to setting name
		const nameEl = setting.settingEl.querySelector(".setting-item-name");
		if (nameEl) {
			nameEl.appendChild(tooltipEl);
		}
	}

	private renderField(
		container: HTMLElement,
		config: Record<string, unknown>,
		field: SettingField
	): void {
		const fieldLabel = this.t.fields[field.key] || field.key;
		const setting = new Setting(container);
		setting.setName(fieldLabel);
		
		// Add tooltip if description exists
		this.addTooltipToSetting(setting, field.description);

		const currentValue = this.getNestedValue(config, field.key);

		switch (field.type) {
			case "toggle":
				setting.addToggle((toggle) => {
					toggle.setValue(Boolean(currentValue));
					toggle.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				break;

			case "color":
				setting.addColorPicker((picker) => {
					// Convert rgba/rgb to hex for the picker
					const hexValue = isColorLike(currentValue) ? rgbaToHex(String(currentValue)) : "#000000";
					picker.setValue(hexValue);
					picker.onChange(async (value) => {
						// Preserve alpha if original was rgba
						const alpha = extractAlpha(String(currentValue ?? ""));
						const colorValue = alpha < 1 ? hexToRgba(value, alpha) : value;
						this.setNestedValue(config, field.key, colorValue);
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				
				// Add alpha slider if value has alpha
				if (isColorLike(currentValue)) {
					const alpha = extractAlpha(String(currentValue));
					if (alpha < 1) {
						const alphaSetting = new Setting(container);
						alphaSetting.setName("  └ Alpha");
						alphaSetting.addSlider((slider) => {
							slider.setLimits(0, 1, 0.01);
							slider.setValue(alpha);
							slider.setDynamicTooltip();
							slider.onChange(async (value) => {
								const hex = rgbaToHex(String(this.getNestedValue(config, field.key)));
								this.setNestedValue(config, field.key, hexToRgba(hex, value));
								await this.plugin.saveSettings();
								this.showReloadButton();
							});
						});
					}
				}
				break;

			case "select":
				setting.addDropdown((dropdown) => {
					if (field.options) {
						for (const option of field.options) {
							dropdown.addOption(option.value, option.label);
						}
					}
					dropdown.setValue(String(currentValue ?? ""));
					dropdown.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				break;

			case "slider":
				setting.addSlider((slider) => {
					const min = field.min ?? 0;
					const max = field.max ?? 1;
					const step = field.step ?? 0.01;
					slider.setLimits(min, max, step);
					slider.setValue(Number(currentValue ?? min));
					slider.setDynamicTooltip();
					slider.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await this.plugin.saveSettings();
						this.showReloadButton();
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
						await this.plugin.saveSettings();
						this.showReloadButton();
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
						await this.plugin.saveSettings();
						this.showReloadButton();
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

			.tessera-reload-section {
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				margin-bottom: 12px;
				overflow: hidden;
				background: var(--background-secondary);
			}

			.tessera-reload-section .setting-item {
				border: none;
			}

			.tessera-settings-section {
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				margin-bottom: 12px;
				overflow: hidden;
			}

			.tessera-settings-section .setting-item {
				border: none;
			}

			.tessera-collapse-btn {
				cursor: pointer;
				margin-right: 8px;
				font-size: 10px;
				color: var(--text-muted);
				user-select: none;
				width: 16px;
				display: inline-block;
			}

			.tessera-collapse-btn:hover {
				color: var(--text-normal);
			}

			.tessera-settings-content {
				padding: 0 16px 16px;
			}

			.tessera-settings-content .setting-item {
				border-top: 1px solid var(--background-modifier-border);
			}

			.tessera-group-header {
				font-size: 11px;
				font-weight: 600;
				color: var(--text-muted);
				text-transform: uppercase;
				letter-spacing: 0.5px;
				padding: 12px 0 4px;
				margin-top: 8px;
			}

			.tessera-group-header:first-child {
				margin-top: 0;
				padding-top: 4px;
			}

			.tessera-code-block {
				background: var(--background-secondary);
				padding: 12px;
				border-radius: 6px;
				overflow-x: auto;
			}

			.tessera-tooltip-icon {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				width: 16px;
				height: 16px;
				border-radius: 50%;
				background: var(--text-muted);
				color: var(--background-primary);
				font-size: 10px;
				font-weight: 700;
				margin-left: 6px;
				cursor: help;
				vertical-align: middle;
				position: relative;
			}

			.tessera-tooltip-icon::after {
				content: attr(aria-label);
				position: absolute;
				bottom: calc(100% + 8px);
				left: 50%;
				transform: translateX(-50%);
				background: var(--background-modifier-cover);
				color: var(--text-normal);
				padding: 8px 12px;
				border-radius: 6px;
				font-size: 12px;
				font-weight: 400;
				white-space: nowrap;
				pointer-events: none;
				opacity: 0;
				transition: opacity 0.2s ease;
				z-index: 1000;
				box-shadow: var(--shadow-s);
			}

			.tessera-tooltip-icon:hover::after {
				opacity: 1;
			}
		`;
		document.head.appendChild(style);
	}
}
