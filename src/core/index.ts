/**
 * TesseraScript Core Module Index
 * Exports all core modules
 */

import { dom, createElement, fragment, appendChildren, assignClasses, assignAttributes, assignStyles } from "./dom";
import { createFileController } from "./file";
import { createCSSController, getSharedCSSController, ensureSharedStyle } from "./css";
import { createConfigController, mergeConfigFn, cloneConfig } from "./config";
import type { TesseraObject, RequireFunction } from "../runtime/bootstrap";

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
export function registerCoreModules(tessera: TesseraObject): void {
	// Core/dom
	tessera.define("core/dom", function (_require: RequireFunction, module: { exports: unknown }, _exports: unknown) {
		const exp = module.exports as Record<string, unknown>;
		exp.createElement = createElement;
		exp.el = createElement;
		exp.fragment = fragment;
		exp.appendChildren = appendChildren;
		exp.assignClasses = assignClasses;
		exp.assignAttributes = assignAttributes;
		exp.assignStyles = assignStyles;
	});

	// Core/file
	tessera.define("core/file", function (require: RequireFunction, module: { exports: unknown }, exports: unknown) {
		module.exports = createFileController;
		(module.exports as Record<string, unknown>).createFileController = createFileController;
	});

	// Core/css
	tessera.define("core/css", function (require: RequireFunction, module: { exports: unknown }, exports: unknown) {
		module.exports = createCSSController;
		(module.exports as Record<string, unknown>).createCSSController = createCSSController;
		(module.exports as Record<string, unknown>).getSharedCSSController = getSharedCSSController;
		(module.exports as Record<string, unknown>).ensureSharedStyle = ensureSharedStyle;
	});

	// Core/config
	tessera.define("core/config", function (require: RequireFunction, module: { exports: unknown }, exports: unknown) {
		module.exports = createConfigController;
		(module.exports as Record<string, unknown>).createConfigController = createConfigController;
		(module.exports as Record<string, unknown>).mergeConfig = mergeConfigFn;
		(module.exports as Record<string, unknown>).cloneConfig = cloneConfig;
	});
}

export default registerCoreModules;
