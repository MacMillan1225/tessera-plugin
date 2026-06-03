/**
 * Settings module index
 */

// Types
export type {
	PluginSettings,
	ComponentConfig,
	FieldType,
	SelectOption,
	SettingField,
	ComponentDefinition,
	Translations,
	TesseraAPI,
} from "./types";

// i18n
export {
	getTranslations,
	getLocale,
	getAvailableLocales,
	validateTranslations,
	logValidationWarnings,
	getFieldLabel,
	getTooltipText,
	getGroupLabel,
	getComponentName,
	getComponentDesc,
} from "./i18n";

// Color utilities
export {
	rgbaToHex,
	hexToRgba,
	extractAlpha,
	isColorLike,
} from "./color-utils";

// Field definitions
export {
	COMPONENTS,
	DEFAULT_SETTINGS,
} from "./fields";

// Settings tab
export {
	TesseraSettingTab,
} from "./settings-tab";
