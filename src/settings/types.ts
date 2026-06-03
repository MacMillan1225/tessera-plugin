/**
 * Settings type definitions
 */

// ============================================================================
// Component Settings Types
// ============================================================================

export interface ComponentConfig {
	enabled: boolean;
	config: Record<string, unknown>;
}

export interface PluginSettings {
	card: ComponentConfig;
	heatmap: ComponentConfig;
	progressbar: ComponentConfig;
}

// ============================================================================
// Settings Field Types
// ============================================================================

export type FieldType = "toggle" | "text" | "number" | "textarea" | "color" | "select" | "slider";

export interface SelectOption {
	value: string;
	label: string;
}

export interface SettingField {
	key: string;           // Path in config (e.g., "flags.showHeader")
	type: FieldType;       // Input type
	placeholder?: string;  // Optional placeholder
	description?: string;  // Optional description (tooltip key)
	options?: SelectOption[];  // For select type
	min?: number;          // For slider type
	max?: number;          // For slider type
	step?: number;         // For slider type
}

export interface ComponentDefinition {
	componentKey: string;  // Key for i18n lookup (e.g., "card")
	fields: SettingField[];
}

// ============================================================================
// i18n Types
// ============================================================================

export interface Translations {
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

// ============================================================================
// Tessera API Types
// ============================================================================

export interface TesseraAPI {
	version: string;
	card: ((options: any) => HTMLElement) | undefined;
	heatmap: ((options: any) => HTMLElement) | undefined;
	progressbar: ((options: any) => HTMLElement) | undefined;
	example: ((options: any) => HTMLElement);
}
