/**
 * Global type declarations for TesseraScript
 */

import type { CardOptions } from "../src/components/card/index";
import type { HeatmapOptions } from "../src/components/heatmap/index";
import type { ProgressbarOptions } from "../src/components/progressbar/index";
import type { ExampleOptions } from "../src/components/example/index";

// ============================================================================
// Tessera API Types
// ============================================================================

export interface TesseraAPI {
	version: string;
	card(options?: CardOptions): HTMLElement;
	heatmap(options?: HeatmapOptions): HTMLElement;
	progressbar(options?: ProgressbarOptions): HTMLElement;
	example(options?: ExampleOptions): HTMLElement;
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
