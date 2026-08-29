/**
 * Settings type definitions
 */

import type { CardOptions, CardInstance } from "../components/card/index";
import type { HeatmapOptions, HeatmapInstance } from "../components/heatmap/index";
import type { ProgressbarOptions, ProgressbarInstance } from "../components/progressbar/index";

// ============================================================================
// Component Settings Types
// ============================================================================

export interface ComponentConfig {
	enabled: boolean;
	config: Record<string, unknown>;
}

/** Keys of the configurable core components (ADR-0004 hierarchy: group → component → field). */
export type ComponentKey = "card" | "heatmap" | "progressbar";

export interface PluginSettings {
	version: number;
	/** Master switch for the "core" component group (ADR-0004). */
	coreEnabled: boolean;
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
		reloadNotice: string;
		reloadButton: string;
		restoreButton: string;
		restoreNotice: string;
		resetField: string;
		/** Description for the core group header (ADR-0004). */
		coreDesc: string;
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
	core: {
		card: ((options: CardOptions) => CardInstance) | undefined;
		heatmap: ((options: HeatmapOptions) => HeatmapInstance) | undefined;
		progressbar: ((options: ProgressbarOptions) => ProgressbarInstance) | undefined;
	};
}