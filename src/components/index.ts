/**
 * TesseraScript Components Index
 * Aggregates all components for easy import
 */

// ============================================================================
// Component Imports
// ============================================================================

import { card, loadCardConfig, getDefaultCardConfig } from "./card/index";
import { heatmap, loadHeatmapConfig, getDefaultHeatmapConfig } from "./heatmap/index";
import { progressbar, loadProgressbarConfig, getDefaultProgressbarConfig } from "./progressbar/index";
import { example, loadExampleConfig, getDefaultExampleConfig } from "./example/index";
import type { TesseraObject, RequireFunction } from "../runtime/bootstrap";

// ============================================================================
// Re-exports
// ============================================================================

export {
	// Card
	card,
	loadCardConfig,
	getDefaultCardConfig,

	// Heatmap
	heatmap,
	loadHeatmapConfig,
	getDefaultHeatmapConfig,

	// Progressbar
	progressbar,
	loadProgressbarConfig,
	getDefaultProgressbarConfig,

	// Example
	example,
	loadExampleConfig,
	getDefaultExampleConfig,
};

// ============================================================================
// Module Registration Helper
// ============================================================================

/**
 * Register all components with Tessera runtime
 */
export function registerComponents(tessera: TesseraObject): void {
	// Register card component
	tessera.define("components/card", function (require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		module.exports = card;
		(module.exports as Record<string, unknown>).card = card;
		(module.exports as Record<string, unknown>).loadConfig = loadCardConfig;
		(module.exports as Record<string, unknown>).getDefaultConfig = getDefaultCardConfig;
	});

	// Register heatmap component
	tessera.define("components/heatmap", function (require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		module.exports = heatmap;
		(module.exports as Record<string, unknown>).heatmap = heatmap;
		(module.exports as Record<string, unknown>).loadConfig = loadHeatmapConfig;
		(module.exports as Record<string, unknown>).getDefaultConfig = getDefaultHeatmapConfig;
	});

	// Register progressbar component
	tessera.define("components/progressbar", function (require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		module.exports = progressbar;
		(module.exports as Record<string, unknown>).progressbar = progressbar;
		(module.exports as Record<string, unknown>).loadConfig = loadProgressbarConfig;
		(module.exports as Record<string, unknown>).getDefaultConfig = getDefaultProgressbarConfig;
	});

	// Register example component
	tessera.define("components/example", function (require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		module.exports = example;
		(module.exports as Record<string, unknown>).example = example;
		(module.exports as Record<string, unknown>).loadConfig = loadExampleConfig;
		(module.exports as Record<string, unknown>).getDefaultConfig = getDefaultExampleConfig;
	});

	// Register aggregation entry
	tessera.define("index", function (require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		module.exports = {
			card: (card as unknown as { card: typeof card }).card ?? card,
			heatmap: (heatmap as unknown as { heatmap: typeof heatmap }).heatmap ?? heatmap,
			progressbar: (progressbar as unknown as { progressbar: typeof progressbar }).progressbar ?? progressbar,
			example: (example as unknown as { example: typeof example }).example ?? example,
		};
	});
}

export default registerComponents;
