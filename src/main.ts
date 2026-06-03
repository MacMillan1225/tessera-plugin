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
	card: typeof card;
	heatmap: typeof heatmap;
	progressbar: typeof progressbar;
	example: typeof example;
}

// ============================================================================
// Plugin Class
// ============================================================================

export default class TesseraPlugin extends Plugin {
	async onload() {
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

		// Create tessera API object
		const tessera: TesseraAPI = {
			version: "1.0.0",
			card,
			heatmap,
			progressbar,
			example,
		};

		// Mount to window
		(window as unknown as Record<string, unknown>).tessera = tessera;

		// Add commands
		this.addCommand({
			id: "tessera-check-status",
			name: "Check status",
			callback: () => {
				new Notice(
					`TesseraScript Status:\n` +
					`Dataview: ✓\n` +
					`Components: card, heatmap, progressbar, example`,
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

		containerEl.createEl("p", {
			text: "A modular component library for dataviewjs.",
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

		// Components section
		new Setting(containerEl).setName("Components").setHeading();
		containerEl.createEl("p", {
			text: "Available: tessera.card, tessera.heatmap, tessera.progressbar, tessera.example",
		});
	}
}
