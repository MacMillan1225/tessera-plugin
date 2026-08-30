/**
 * Global type declarations for TesseraScript
 */

import type { CardOptions, CardInstance } from "../src/components/core/card";
import type { HeatmapOptions, HeatmapInstance } from "../src/components/core/heatmap";
import type { ProgressbarOptions, ProgressbarInstance } from "../src/components/core/progressbar";
import type { ListOptions, ListInstance } from "../src/components/core/list";
import type { TagsOptions, TagsInstance } from "../src/components/core/tags";
import type { LineOptions, LineInstance } from "../src/components/chart/line";
import type { BarOptions, BarInstance } from "../src/components/chart/bar";
import type { GaugeOptions, GaugeInstance } from "../src/components/chart/gauge";
import type { RoseOptions, RoseInstance } from "../src/components/chart/rose";
import type { RadarOptions, RadarInstance } from "../src/components/chart/radar";

// ============================================================================
// Tessera API Types
// ============================================================================

export interface TesseraAPI {
	version: string;
	core: {
		card(options?: CardOptions): CardInstance;
		heatmap(options?: HeatmapOptions): HeatmapInstance;
		progressbar(options?: ProgressbarOptions): ProgressbarInstance;
		list(options?: ListOptions): ListInstance;
		tags(options?: TagsOptions): TagsInstance;
	};
	chart: {
		line(options?: LineOptions): LineInstance;
		bar(options?: BarOptions): BarInstance;
		gauge(options?: GaugeOptions): GaugeInstance;
		rose(options?: RoseOptions): RoseInstance;
		radar(options?: RadarOptions): RadarInstance;
	};
}

// ============================================================================
// Global Declarations
// ============================================================================

declare global {
	interface Window {
		tessera?: TesseraAPI;
	}

	// CSS module declarations
	declare module "*.css" {
		const content: string;
		export default content;
	}

	// JSON module declarations
	declare module "*.json" {
		const value: unknown;
		export default value;
	}
}

export {};