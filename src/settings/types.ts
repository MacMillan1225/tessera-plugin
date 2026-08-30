/**
 * Settings type definitions
 */

import type { CardOptions, CardInstance } from "../components/core/card";
import type { HeatmapOptions, HeatmapInstance } from "../components/core/heatmap";
import type { ProgressbarOptions, ProgressbarInstance } from "../components/core/progressbar";
import type { ListOptions, ListInstance } from "../components/core/list";
import type { TagsOptions, TagsInstance } from "../components/core/tags";
import type { LineOptions, LineInstance } from "../components/chart/line";
import type { BarOptions, BarInstance } from "../components/chart/bar";
import type { GaugeOptions, GaugeInstance } from "../components/chart/gauge";
import type { RoseOptions, RoseInstance } from "../components/chart/rose";
import type { RadarOptions, RadarInstance } from "../components/chart/radar";

// ============================================================================
// Component Settings Types
// ============================================================================

export interface ComponentConfig {
	enabled: boolean;
	config: Record<string, unknown>;
}

/** Keys of the configurable components (ADR-0004 hierarchy: group → component → field). */
export type ComponentKey = "card" | "heatmap" | "progressbar" | "list" | "tags" | "line" | "bar" | "gauge" | "rose" | "radar";

/** Component group keys (each group has its own master switch). */
export type GroupKey = "core" | "chart";

export interface PluginSettings {
	version: number;
	/** Master switch for the "core" component group (ADR-0004). */
	coreEnabled: boolean;
	/** Master switch for the "chart" component group (ADR-0005). */
	chartEnabled: boolean;
	card: ComponentConfig;
	heatmap: ComponentConfig;
	progressbar: ComponentConfig;
	list: ComponentConfig;
	tags: ComponentConfig;
	line: ComponentConfig;
	bar: ComponentConfig;
	gauge: ComponentConfig;
	rose: ComponentConfig;
	radar: ComponentConfig;
}

// ============================================================================
// Third-Party Library Settings Types
// ============================================================================

/** Lifecycle state of a managed third-party library (src/lib-manager.ts). */
export type LibLifecycle = "installed" | "missing" | "downloading" | "error";

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
		/** Description for the chart group header (ADR-0005). */
		chartDesc: string;
		/** Heading for the third-party library manager section. */
		libsTitle: string;
		/** Description for the library manager section. */
		libsDesc: string;
		/** Download button label. */
		libsDownload: string;
		/** Delete button label. */
		libsDelete: string;
		/** Status text: library installed. */
		libsInstalled: string;
		/** Status text: library missing. */
		libsMissing: string;
		/** Status text: downloading in progress. */
		libsDownloading: string;
		/** Notice after a successful download. */
		libsDownloaded: string;
		/** Notice after deletion. */
		libsDeleted: string;
		/** Notice shown when deletion fails. */
		libsDeleteFailed: string;
		/** Notice shown when download fails (with reason). */
		libsDownloadFailed: string;
	};
	components: {
		card: { name: string; desc: string };
		heatmap: { name: string; desc: string };
		progressbar: { name: string; desc: string };
		list: { name: string; desc: string };
		tags: { name: string; desc: string };
		line: { name: string; desc: string };
		bar: { name: string; desc: string };
		gauge: { name: string; desc: string };
		rose: { name: string; desc: string };
		radar: { name: string; desc: string };
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
		list: ((options: ListOptions) => ListInstance) | undefined;
		tags: ((options: TagsOptions) => TagsInstance) | undefined;
	};
	chart: {
		line: ((options: LineOptions) => LineInstance) | undefined;
		bar: ((options: BarOptions) => BarInstance) | undefined;
		gauge: ((options: GaugeOptions) => GaugeInstance) | undefined;
		rose: ((options: RoseOptions) => RoseInstance) | undefined;
		radar: ((options: RadarOptions) => RadarInstance) | undefined;
	};
}