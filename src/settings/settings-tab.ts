/**
 * Settings Tab implementation
 */

import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import type { PluginSettings, SettingField, ComponentDefinition, Translations } from "./types";
import { getTranslations, getFieldLabel, getTooltipText, getGroupLabel, getComponentName, getComponentDesc, logValidationWarnings } from "./i18n";
import { rgbaToHex, hexToRgba, extractAlpha, isColorLike } from "./color-utils";
import { COMPONENTS } from "./fields";

// ============================================================================
// Settings Tab Class
// ============================================================================

interface TesseraPluginLike extends Plugin {
	settings: PluginSettings;
	saveSettings(): Promise<void>;
	resetSettings(): Promise<void>;
}

// Interface for Obsidian's internal command API
interface AppWithCommands extends App {
	commands?: {
		executeCommandById(id: string): void;
	};
}

export class TesseraSettingTab extends PluginSettingTab {
	plugin: TesseraPluginLike;
	private collapsedSections: Set<string> = new Set();
	private needsReload = false;
	private t: Translations;
	private reloadContainerEl: HTMLElement | null = null;

	constructor(app: App, plugin: TesseraPluginLike) {
		super(app, plugin);
		this.plugin = plugin;
		this.t = getTranslations();

		// Log validation warnings on first load
		logValidationWarnings(COMPONENTS);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

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

	// ============================================================================
	// Section Renderers
	// ============================================================================

	private renderReloadSection(containerEl: HTMLElement): void {
		const section = containerEl.createDiv({ cls: "tessera-reload-section" });
		this.reloadContainerEl = section;

		if (!this.needsReload) {
			section.classList.add("tessera-hidden");
		}

		const setting = new Setting(section);
		setting.setName(this.t.settings.reloadButton);
		setting.setDesc(this.t.settings.reloadNotice);
		setting.addButton((btn) => {
			btn.setButtonText(this.t.settings.reloadButton);
			btn.setCta();
			btn.onClick(() => {
				// Use Obsidian's internal command API to reload the app
				const appWithCommands = this.app as AppWithCommands;
				appWithCommands.commands?.executeCommandById("app:reload");
			});
		});
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
			this.reloadContainerEl.classList.remove("tessera-hidden");
		}
	}

	// ============================================================================
	// Component Section Renderer
	// ============================================================================

	private renderCollapsibleSection(
		containerEl: HTMLElement,
		key: keyof PluginSettings,
		definition: ComponentDefinition
	): void {
		const componentConfig = this.plugin.settings[key];
		const isCollapsed = this.collapsedSections.has(key);

		// Create section container
		const section = containerEl.createDiv({ cls: "tessera-settings-section" });

		// Use Obsidian Setting API for the header (with built-in toggle)
		const headerSetting = new Setting(section);
		headerSetting.setName(getComponentName(this.t, definition.componentKey));
		headerSetting.setDesc(getComponentDesc(this.t, definition.componentKey));

		// Add collapse button
		// eslint-disable-next-line obsidianmd/prefer-active-doc
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

	// ============================================================================
	// Field Renderers
	// ============================================================================

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
				groupHeader.createEl("span", { text: getGroupLabel(this.t, groupKey) });
			}

			for (const field of groupFields) {
				this.renderField(container, config, field);
			}
		}
	}

	private addTooltipToSetting(setting: Setting, tooltipKey?: string): void {
		if (!tooltipKey) return;

		const tooltipText = getTooltipText(this.t, tooltipKey);
		if (!tooltipText) return;

		// Create tooltip icon
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		const tooltipEl = document.createElement("span");
		tooltipEl.className = "tessera-tooltip-icon";
		tooltipEl.textContent = "?";
		tooltipEl.setAttribute("aria-label", tooltipText);

		// Add to setting name - use querySelector to find the name element
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
		const fieldLabel = getFieldLabel(this.t, field.key);
		const setting = new Setting(container);
		setting.setName(fieldLabel);

		// Add tooltip if description exists
		this.addTooltipToSetting(setting, field.description);

		const currentValue = this.getNestedValue(config, field.key);

		switch (field.type) {
			case "toggle":
				this.renderToggleField(setting, config, field, currentValue);
				break;

			case "color":
				this.renderColorField(setting, container, config, field, currentValue);
				break;

			case "select":
				this.renderSelectField(setting, config, field, currentValue);
				break;

			case "slider":
				this.renderSliderField(setting, config, field, currentValue);
				break;

			case "text":
			case "number":
				this.renderTextField(setting, config, field, currentValue);
				break;

			case "textarea":
				this.renderTextareaField(setting, config, field, currentValue);
				break;
		}
	}

	private renderToggleField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		setting.addToggle((toggle) => {
			toggle.setValue(Boolean(currentValue));
			toggle.onChange(async (value) => {
				this.setNestedValue(config, field.key, value);
				await this.plugin.saveSettings();
				this.showReloadButton();
			});
		});
	}

	private renderColorField(
		setting: Setting,
		container: HTMLElement,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		setting.addColorPicker((picker) => {
			// Convert rgba/rgb to hex for the picker
			const hexValue = isColorLike(currentValue) ? rgbaToHex(String(currentValue)) : "#000000";
			picker.setValue(hexValue);
			picker.onChange(async (value) => {
				// Preserve alpha if original was rgba
				const currentColor = typeof currentValue === "string" ? currentValue : "#000000";
				const alpha = extractAlpha(currentColor);
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
				alphaSetting.setName("  └ alpha");
				alphaSetting.addSlider((slider) => {
					slider.setLimits(0, 1, 0.01);
					slider.setValue(alpha);
					slider.setDynamicTooltip();
					slider.onChange(async (value) => {
						const currentColorValue = this.getNestedValue(config, field.key);
						const hex = rgbaToHex(typeof currentColorValue === "string" ? currentColorValue : "#000000");
						this.setNestedValue(config, field.key, hexToRgba(hex, value));
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
			}
		}
	}

	private renderSelectField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		setting.addDropdown((dropdown) => {
			if (field.options) {
				for (const option of field.options) {
					dropdown.addOption(option.value, option.label);
				}
			}
			const selectValue = typeof currentValue === "string" ? currentValue : "";
			dropdown.setValue(selectValue);
			dropdown.onChange(async (value) => {
				this.setNestedValue(config, field.key, value);
				await this.plugin.saveSettings();
				this.showReloadButton();
			});
		});
	}

	private renderSliderField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
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
	}

	private renderTextField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		setting.addText((text) => {
			const displayValue = typeof currentValue === "string" 
				? currentValue 
				: typeof currentValue === "number" 
					? String(currentValue) 
					: "";
			text.setValue(displayValue);
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
	}

	private renderTextareaField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		setting.addTextArea((textarea) => {
			const displayValue = typeof currentValue === "string" 
				? currentValue 
				: typeof currentValue === "number" 
					? String(currentValue) 
					: "";
			textarea.setValue(displayValue);
			if (field.placeholder) {
				textarea.setPlaceholder(field.placeholder);
			}
			textarea.onChange(async (value) => {
				this.setNestedValue(config, field.key, value);
				await this.plugin.saveSettings();
				this.showReloadButton();
			});
		});
	}

	// ============================================================================
	// Utility Methods
	// ============================================================================

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
