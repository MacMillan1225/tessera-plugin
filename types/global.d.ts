/**
 * Global type declarations for TesseraScript
 */

import type { CardOptions, CardInstance } from "../src/components/card/index";
import type { HeatmapOptions, HeatmapInstance } from "../src/components/heatmap/index";
import type { ProgressbarOptions, ProgressbarInstance } from "../src/components/progressbar/index";

// ============================================================================
// Tessera API Types
// ============================================================================

export interface TesseraAPI {
	version: string;
	core: {
		card(options?: CardOptions): CardInstance;
		heatmap(options?: HeatmapOptions): HeatmapInstance;
		progressbar(options?: ProgressbarOptions): ProgressbarInstance;
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