/**
 * TesseraScript Core Module Index
 * Exports all core modules
 */

import { dom, createElement, fragment, appendChildren, assignClasses, assignAttributes, assignStyles } from "./dom";
import { createFileController } from "./file";
import { createCSSController, getSharedCSSController, ensureSharedStyle } from "./css";
import { createConfigController, mergeConfigFn, cloneConfig } from "./config";

// ============================================================================
// Re-exports
// ============================================================================

export {
	// DOM
	dom,
	createElement,
	fragment,
	appendChildren,
	assignClasses,
	assignAttributes,
	assignStyles,

	// File
	createFileController,

	// CSS
	createCSSController,
	getSharedCSSController,
	ensureSharedStyle,

	// Config
	createConfigController,
	mergeConfigFn as mergeConfig,
	cloneConfig,
};

// ============================================================================
// Module Registration Helper
// ============================================================================

/**
 * Register all core modules with Tessera runtime
 */
export function registerCoreModules(tessera: any): void {
	// Core/dom
	tessera.define("core/dom", function (require: any, module: any, exports: any) {
		Object.assign(exports, {
			createElement,
			el: createElement,
			fragment,
			appendChildren,
			assignClasses,
			assignAttributes,
			assignStyles,
		});
	});

	// Core/file
	tessera.define("core/file", function (require: any, module: any, exports: any) {
		module.exports = createFileController;
		module.exports.createFileController = createFileController;
	});

	// Core/css
	tessera.define("core/css", function (require: any, module: any, exports: any) {
		module.exports = createCSSController;
		module.exports.createCSSController = createCSSController;
		module.exports.getSharedCSSController = getSharedCSSController;
		module.exports.ensureSharedStyle = ensureSharedStyle;
	});

	// Core/config
	tessera.define("core/config", function (require: any, module: any, exports: any) {
		module.exports = createConfigController;
		module.exports.createConfigController = createConfigController;
		module.exports.mergeConfig = mergeConfigFn;
		module.exports.cloneConfig = cloneConfig;
	});
}

export default registerCoreModules;
