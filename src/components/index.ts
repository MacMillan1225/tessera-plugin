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
export function registerComponents(tessera: any): void {
	// Register card component
	tessera.define("components/card", function (require: any, module: any, exports: any) {
		module.exports = card;
		module.exports.card = card;
		module.exports.loadConfig = loadCardConfig;
		module.exports.getDefaultConfig = getDefaultCardConfig;
	});

	// Register heatmap component
	tessera.define("components/heatmap", function (require: any, module: any, exports: any) {
		module.exports = heatmap;
		module.exports.heatmap = heatmap;
		module.exports.loadConfig = loadHeatmapConfig;
		module.exports.getDefaultConfig = getDefaultHeatmapConfig;
	});

	// Register progressbar component
	tessera.define("components/progressbar", function (require: any, module: any, exports: any) {
		module.exports = progressbar;
		module.exports.progressbar = progressbar;
		module.exports.loadConfig = loadProgressbarConfig;
		module.exports.getDefaultConfig = getDefaultProgressbarConfig;
	});

	// Register example component
	tessera.define("components/example", function (require: any, module: any, exports: any) {
		module.exports = example;
		module.exports.example = example;
		module.exports.loadConfig = loadExampleConfig;
		module.exports.getDefaultConfig = getDefaultExampleConfig;
	});

	// Register aggregation entry
	tessera.define("index", function (require: any, module: any, exports: any) {
		module.exports = {
			card: card.card || card,
			heatmap: heatmap.heatmap || heatmap,
			progressbar: progressbar.progressbar || progressbar,
			example: example.example || example,
		};
	});
}

export default registerComponents;
