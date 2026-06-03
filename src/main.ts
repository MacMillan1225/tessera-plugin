/**
 * TesseraScript Obsidian Plugin
 * Modular component library for DataviewJS
 */

import { Notice, Plugin } from "obsidian";
import { TesseraRuntime } from "./runtime/bootstrap";
import { DataviewBridge } from "./dataview-bridge";
import { StyleManager } from "./utils/style-manager";
import { registerCoreModules } from "./core/index";
import { registerComponents } from "./components/index";

// ============================================================================
// Types
// ============================================================================

interface TesseraPluginSettings {
	enableLegacyMode: boolean;
	enableDeprecationWarnings: boolean;
	defaultTheme: "auto" | "light" | "dark";
}

const DEFAULT_SETTINGS: TesseraPluginSettings = {
	enableLegacyMode: true,
	enableDeprecationWarnings: true,
	defaultTheme: "auto",
};

// ============================================================================
// Plugin Class
// ============================================================================

export default class TesseraPlugin extends Plugin {
	settings!: TesseraPluginSettings;
	runtime!: TesseraRuntime;
	dataviewBridge!: DataviewBridge;
	styleManager!: StyleManager;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Initialize runtime
		this.runtime = new TesseraRuntime();
		this.runtime.initialize();

		// Initialize Dataview bridge
		this.dataviewBridge = new DataviewBridge({
			app: this.app,
			onDataviewMissing: () => {
				if (this.settings.enableDeprecationWarnings) {
					new Notice(
						"Dataview plugin is required. Please install and enable it.",
						5000
					);
				}
			},
		});

		// Register all modules
		this.registerAllModules();

		// Initialize style manager
		this.styleManager = new StyleManager();
		this.styleManager.load();

		// Mount global API
		this.mountGlobalAPI();

		// Add commands
		this.addCommands();

		// Add settings tab
		this.addSettingTab(new TesseraSettingTab(this.app, this));

	}

	onunload() {
		// Unmount global API
		this.unmountGlobalAPI();

		// Cleanup styles
		if (this.styleManager) {
			this.styleManager.unload();
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TesseraPluginSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private registerAllModules() {
		// Register core modules
		registerCoreModules(this.runtime.getTesseraObject());

		// Register components
		registerComponents(this.runtime.getTesseraObject());

		// Module registration complete
	}

	private mountGlobalAPI() {
		// Mount Tessera to globalThis
		this.runtime.mountGlobal();

		// Also mount to window for compatibility
		if (typeof window !== "undefined") {
			(window as unknown as Record<string, unknown>).Tessera = this.runtime.getTesseraObject();
		}
	}

	private unmountGlobalAPI() {
		// Unmount from globalThis
		this.runtime.unmountGlobal();

		// Unmount from window
		if (typeof window !== "undefined") {
			delete (window as unknown as Record<string, unknown>).Tessera;
		}
	}

	private addCommands() {
		// Check status command
		this.addCommand({
			id: "tessera-check-status",
			name: "Check status",
			callback: () => {
				const status = {
					dataviewAvailable: this.dataviewBridge.isAvailable(),
					modulesLoaded: this.runtime.getModuleCount(),
					componentsLoaded: this.runtime.getComponentCount(),
				};

				new Notice(
					`TesseraScript Status:\n` +
					`Dataview: ${status.dataviewAvailable ? "✓" : "✗"}\n` +
					`Modules: ${status.modulesLoaded}\n` +
					`Components: ${status.componentsLoaded}`,
					5000
				);
			},
		});

		// List modules command
		this.addCommand({
			id: "tessera-list-modules",
			name: "List modules",
			callback: () => {
				const moduleIds = this.runtime.getModuleIds();
				new Notice(
					`TesseraScript Modules:\n${moduleIds.join("\n")}`,
					10000
				);
			},
		});

		// Reload command
		this.addCommand({
			id: "tessera-reload",
			name: "Reload",
			callback: async () => {
				// Unmount and re-mount
				this.unmountGlobalAPI();
				this.runtime = new TesseraRuntime();
				this.runtime.initialize();
				this.registerAllModules();
				this.mountGlobalAPI();

				new Notice("Reloaded", 3000);
			},
		});
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

		new Setting(containerEl).setName("Configuration").setHeading();

		// Legacy mode setting
		new Setting(containerEl)
			.setName("Enable legacy mode")
			.setDesc("Allow loading modules via dv.view() (deprecated)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableLegacyMode)
					.onChange(async (value) => {
						this.plugin.settings.enableLegacyMode = value;
						await this.plugin.saveSettings();
					})
			);

		// Deprecation warnings setting
		new Setting(containerEl)
			.setName("Show deprecation warnings")
			.setDesc("Show warnings when using deprecated features")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDeprecationWarnings)
					.onChange(async (value) => {
						this.plugin.settings.enableDeprecationWarnings = value;
						await this.plugin.saveSettings();
					})
			);

		// Theme setting
		new Setting(containerEl)
			.setName("Default theme")
			.setDesc("Default theme for components (auto follows Obsidian theme)")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("auto", "Auto")
					.addOption("light", "Light")
					.addOption("dark", "Dark")
					.setValue(this.plugin.settings.defaultTheme)
					.onChange(async (value: string) => {
						this.plugin.settings.defaultTheme = value as "auto" | "light" | "dark";
						await this.plugin.saveSettings();
					})
			);

		// Info section
		new Setting(containerEl).setName("Usage").setHeading();
		containerEl.createEl("p", {
			text: "After enabling this plugin, you can use tesserascript components in your dataviewjs code blocks.",
		});

		const codeBlock = containerEl.createEl("pre");
		codeBlock.createEl("code", {
			text: `const { card, heatmap, progressbar } = Tessera.use("components");

dv.container.appendChild(card({
  title: "Hello",
  value: 42
}));`,
		});

		containerEl.createEl("p", {
			text: `Registered modules: ${this.plugin.runtime.getModuleCount()}`,
		});
		containerEl.createEl("p", {
			text: `Registered components: ${this.plugin.runtime.getComponentCount()}`,
		});
	}
}
