/**
 * Settings Tab implementation
 *
 * Hierarchy (ADR-0004): group (core) → component → field.
 * Single rendering path: display() + manual refresh. No dual API.
 */

import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import type { PluginSettings, SettingField, ComponentDefinition, ComponentKey, Translations, GroupKey } from "./types";
import { getTranslations, getFieldLabel, getTooltipText, getGroupLabel, getComponentName, getComponentDesc, logValidationWarnings } from "./i18n";
import { rgbaToHex, hexToRgba, extractAlpha, isColorLike } from "./color-utils";
import { COMPONENTS, DEFAULT_SETTINGS, GROUPS } from "./fields";

// ============================================================================
// Settings Tab Class
// ============================================================================

interface TesseraPluginLike extends Plugin {
	settings: PluginSettings;
	saveSettings(): Promise<void>;
	resetSettings(): Promise<void>;
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

	/** Single rendering path — legacy display() works on all supported versions. */
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

		// Component groups (group → component → field hierarchy)
		for (const group of GROUPS) {
			this.renderGroup(containerEl, group.key, group.enabledKey, group.descKey, group.components);
		}

		// Restore defaults section
		this.renderRestoreSection(containerEl);
	}

	// ============================================================================
	// Group & Section Renderers
	// ============================================================================

	/**
	 * Top-level component group (ADR-0004/ADR-0005):
	 * group header with master toggle + collapsible component sections.
	 */
	private renderGroup(
		containerEl: HTMLElement,
		groupKey: GroupKey,
		enabledKey: "coreEnabled" | "chartEnabled",
		descKey: "coreDesc" | "chartDesc",
		componentKeys: ComponentKey[],
	): void {
		const section = containerEl.createDiv({ cls: "tessera-settings-section tessera-core-section" });
		const isCollapsed = this.collapsedSections.has(groupKey);

		const headerSetting = new Setting(section);
		headerSetting.setName(getGroupLabel(this.t, groupKey));
		headerSetting.setDesc(this.t.settings[descKey]);

		// Collapse button
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		const collapseBtn = document.createElement("span");
		collapseBtn.className = "tessera-collapse-btn";
		collapseBtn.textContent = isCollapsed ? "▶" : "▼";
		collapseBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (isCollapsed) {
				this.collapsedSections.delete(groupKey);
			} else {
				this.collapsedSections.add(groupKey);
			}
			this.refreshSettings();
		});
		headerSetting.settingEl.prepend(collapseBtn);

		// Master toggle for the whole group
		headerSetting.addToggle((toggle) => {
			toggle.setValue(this.plugin.settings[enabledKey]);
			toggle.onChange(async (value) => {
				this.plugin.settings[enabledKey] = value;
				await this.plugin.saveSettings();
				this.showReloadButton();
				this.refreshSettings();
			});
		});

		// Component sections — visible only when group expanded AND enabled
		if (!isCollapsed && this.plugin.settings[enabledKey]) {
			const content = section.createDiv({ cls: "tessera-settings-content" });
			for (const key of componentKeys) {
				this.renderCollapsibleSection(content, key, COMPONENTS[key]);
			}
		}
	}

	// ============================================================================
	// Component Section Renderer
	// ============================================================================

	private renderCollapsibleSection(
		containerEl: HTMLElement,
		key: ComponentKey,
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
			this.refreshSettings();
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
			this.renderFields(content, componentConfig.config, definition.fields, definition.componentKey);
		}
	}

	private rerenderSectionContent(
		section: HTMLElement,
		key: ComponentKey,
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
			this.renderFields(content, componentConfig.config, definition.fields, definition.componentKey);
		}
	}

	// ============================================================================
	// Field Renderers
	// ============================================================================

	private renderFields(
		container: HTMLElement,
		config: Record<string, unknown>,
		fields: SettingField[],
		componentKey: string
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
				this.renderField(container, config, field, componentKey);
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

	private addResetButton(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		componentKey: string
	): void {
		const defaultConfig = DEFAULT_SETTINGS[componentKey as ComponentKey]?.config;
		if (!defaultConfig) return;

		const defaultValue = this.getNestedValue(defaultConfig, field.key);
		const currentValue = this.getNestedValue(config, field.key);

		// Only show reset button when current value differs from default
		if (JSON.stringify(currentValue) === JSON.stringify(defaultValue)) return;

		setting.addButton((btn) => {
			btn.setIcon("rotate-ccw");
			btn.setTooltip(this.t.settings.resetField);
			btn.setClass("tessera-reset-btn");
			btn.onClick(async () => {
				this.setNestedValue(config, field.key, defaultValue);
				await this.plugin.saveSettings();
				this.showReloadButton();
				this.refreshSettings();
			});
		});
	}

	private renderField(
		container: HTMLElement,
		config: Record<string, unknown>,
		field: SettingField,
		componentKey: string
	): void {
		const fieldLabel = getFieldLabel(this.t, field.key);
		const setting = new Setting(container);
		setting.setName(fieldLabel);

		// Add tooltip if description exists
		this.addTooltipToSetting(setting, field.description);

		// Add per-field reset button (appears left of the input control)
		this.addResetButton(setting, config, field, componentKey);

		const currentValue = this.getNestedValue(config, field.key);

		switch (field.type) {
			case "toggle":
				this.renderToggleField(setting, config, field, currentValue);
				break;

			case "color":
				this.renderColorField(setting, config, field, currentValue);
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

	/**
	 * Color picker with an INLINE alpha slider (ADR-0004).
	 * The alpha slider sits in the same control row as the color picker,
	 * so transparency is adjustable without a separate sub-row.
	 */
	private renderColorField(
		setting: Setting,
		config: Record<string, unknown>,
		field: SettingField,
		currentValue: unknown
	): void {
		const currentColor = typeof currentValue === "string" ? currentValue : "#000000";
		// Shared alpha state between picker and inline slider (0..1)
		let currentAlpha = isColorLike(currentColor) ? extractAlpha(currentColor) : 1;

		setting.addColorPicker((picker) => {
			const hexValue = isColorLike(currentColor) ? rgbaToHex(currentColor) : "#000000";
			picker.setValue(hexValue);
			picker.onChange(async (value) => {
				const colorValue = currentAlpha < 1 ? hexToRgba(value, currentAlpha) : value;
				this.setNestedValue(config, field.key, colorValue);
				await this.plugin.saveSettings();
				this.showReloadButton();
			});
		});

		// Inline alpha slider — same control row, compact width
		setting.addSlider((slider) => {
			slider.setLimits(0, 1, 0.01);
			slider.setValue(currentAlpha);
			slider.setDynamicTooltip();
			slider.sliderEl.addClass("tessera-alpha-slider");
			slider.onChange(async (value) => {
				currentAlpha = value;
				const stored = this.getNestedValue(config, field.key);
				const hex = rgbaToHex(typeof stored === "string" ? stored : "#000000");
				this.setNestedValue(config, field.key, value < 1 ? hexToRgba(hex, value) : hex);
				await this.plugin.saveSettings();
				this.showReloadButton();
			});
		});
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

	/** Refresh the whole settings UI (single rendering path). */
	private refreshSettings(): void {
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- intentional: unified render path (ADR-0004), no dual API
		this.display();
	}

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
				const appWithCommands = this.app as unknown as {
					commands?: { executeCommandById(id: string): void };
				};
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
			btn.onClick(async () => {
				await this.plugin.resetSettings();
				this.needsReload = true;
				this.refreshSettings();
			});
		});
	}

	private showReloadButton(): void {
		this.needsReload = true;
		if (this.reloadContainerEl) {
			this.reloadContainerEl.classList.remove("tessera-hidden");
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