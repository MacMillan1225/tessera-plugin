/**
 * i18n utilities with validation
 */

import type { Translations, ComponentDefinition, PluginSettings } from "./types";

// Import translation files
import enTranslations from "../i18n/en.json";
import zhTranslations from "../i18n/zh.json";
import jaTranslations from "../i18n/ja.json";

// ============================================================================
// Translation Registry
// ============================================================================

const TRANSLATIONS: Record<string, Translations> = {
	en: enTranslations,
	zh: zhTranslations,
	ja: jaTranslations,
};

// ============================================================================
// Locale Detection
// ============================================================================

/**
 * Get current Obsidian locale
 */
export function getLocale(): string {
	// Obsidian exposes moment.js globally
	interface WindowWithMoment extends Window {
		moment?: { locale(): string };
	}
	const win = window as unknown as WindowWithMoment;
	return win.moment?.locale() ?? "en";
}

/**
 * Get translations based on Obsidian locale
 */
export function getTranslations(): Translations {
	const locale = getLocale();
	
	// Try exact match first, then language code, then fallback to English
	if (TRANSLATIONS[locale]) {
		return TRANSLATIONS[locale];
	}
	
	const langCode = locale.split("-")[0] ?? "";
	if (langCode && TRANSLATIONS[langCode]) {
		return TRANSLATIONS[langCode];
	}
	
	return TRANSLATIONS.en!;
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): string[] {
	return Object.keys(TRANSLATIONS);
}

// ============================================================================
// i18n Validation
// ============================================================================

interface ValidationResult {
	valid: boolean;
	missingFields: string[];
	missingTooltips: string[];
	missingGroups: string[];
}

/**
 * Validate that all field keys and tooltip keys have translations
 * Call this at compile time or during development
 */
export function validateTranslations(
	components: Record<string, ComponentDefinition>,
	locale?: string
): Map<string, ValidationResult> {
	const results = new Map<string, ValidationResult>();
	
	for (const [lang, translations] of Object.entries(TRANSLATIONS)) {
		if (locale && lang !== locale) continue;
		
		const missingFields: string[] = [];
		const missingTooltips: string[] = [];
		const missingGroups: string[] = [];
		
		// Check all component fields
		for (const [compKey, definition] of Object.entries(components)) {
			for (const field of definition.fields) {
				// Check field label
				if (!translations.fields[field.key]) {
					missingFields.push(`${compKey}.${field.key}`);
				}
				
				// Check tooltip if description exists
				if (field.description) {
					const tooltipKey = field.description.replace(/^tooltip\./, "");
					if (!translations.tooltips[tooltipKey]) {
						missingTooltips.push(`${compKey}.${tooltipKey}`);
					}
				}
			}
		}
		
		// Check group labels
		const allGroups = new Set<string>();
		for (const definition of Object.values(components)) {
			for (const field of definition.fields) {
				const parts = field.key.split(".");
				if (parts.length > 1) {
					allGroups.add(parts.slice(0, -1).join("."));
				}
			}
		}
		
		for (const group of allGroups) {
			if (!translations.groups[group]) {
				missingGroups.push(group);
			}
		}
		
		results.set(lang, {
			valid: missingFields.length === 0 && missingTooltips.length === 0 && missingGroups.length === 0,
			missingFields,
			missingTooltips,
			missingGroups,
		});
	}
	
	return results;
}

/**
 * Log validation warnings to console
 */
export function logValidationWarnings(
	components: Record<keyof PluginSettings, ComponentDefinition>
): void {
	const results = validateTranslations(components);
	
	for (const [lang, result] of results) {
		if (!result.valid) {
			console.warn(`[TesseraScript] Translation warnings for "${lang}":`);
			
			if (result.missingFields.length > 0) {
				console.warn(`  Missing field translations:`, result.missingFields);
			}
			
			if (result.missingTooltips.length > 0) {
				console.warn(`  Missing tooltip translations:`, result.missingTooltips);
			}
			
			if (result.missingGroups.length > 0) {
				console.warn(`  Missing group translations:`, result.missingGroups);
			}
		}
	}
}

// ============================================================================
// Translation Helpers with Fallback
// ============================================================================

/**
 * Get a translated field label with fallback to key name
 */
export function getFieldLabel(translations: Translations, key: string): string {
	return translations.fields[key] || key;
}

/**
 * Get a translated tooltip text with fallback
 */
export function getTooltipText(translations: Translations, tooltipKey: string): string | null {
	// Strip "tooltip." prefix if present
	const key = tooltipKey.replace(/^tooltip\./, "");
	return translations.tooltips[key] || null;
}

/**
 * Get a translated group label with fallback to formatted key
 */
export function getGroupLabel(translations: Translations, groupKey: string): string {
	if (translations.groups[groupKey]) {
		return translations.groups[groupKey];
	}
	
	// Fallback: format the key (e.g., "colors.light" -> "Colors › Light")
	return groupKey
		.split(".")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" › ");
}

/**
 * Get a translated component name
 */
export function getComponentName(translations: Translations, componentKey: string): string {
	const comp = translations.components[componentKey as keyof typeof translations.components];
	return comp?.name || componentKey;
}

/**
 * Get a translated component description
 */
export function getComponentDesc(translations: Translations, componentKey: string): string {
	const comp = translations.components[componentKey as keyof typeof translations.components];
	return comp?.desc || "";
}
