/**
 * TesseraScript Core: Config Module
 * Provides configuration reading, merging, and scope management
 */

import { createFileController } from "./file";

import type { App } from "obsidian";

// ============================================================================
// Types
// ============================================================================

export interface ConfigControllerContext {
	app?: App;
}

export interface ConfigScope {
	path: string;
	load(options?: unknown): Promise<unknown>;
	get(): unknown;
	merge(overrides?: unknown): unknown;
}

export interface ConfigController {
	normalizePath(path: string): string;
	clone<T>(value: T): T;
	merge(baseConfig: unknown, overrideConfig: unknown): unknown;
	get(path: string, options?: unknown): unknown;
	load(path: string, options?: unknown): Promise<unknown>;
	resolve(path: string, overrides?: unknown, options?: unknown): unknown;
	createScope(scopeOptions: { path: string; fallback?: unknown }): ConfigScope;
	cache: Map<string, unknown>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function isPlainObject(value: unknown): boolean {
	return Object.prototype.toString.call(value) === "[object Object]";
}

function cloneValue<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map(cloneValue) as unknown as T;
	}

	if (isPlainObject(value)) {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cloneValue(item)])
		) as unknown as T;
	}

	return value;
}

function mergeConfig(baseConfig: unknown, overrideConfig: unknown): unknown {
	if (overrideConfig == null) {
		return cloneValue(baseConfig);
	}

	if (baseConfig == null) {
		return cloneValue(overrideConfig);
	}

	if (Array.isArray(baseConfig) || Array.isArray(overrideConfig)) {
		return cloneValue(overrideConfig);
	}

	if (!isPlainObject(baseConfig) || !isPlainObject(overrideConfig)) {
		return cloneValue(overrideConfig);
	}

	const merged = cloneValue(baseConfig) as Record<string, unknown>;
	const overrideObj = overrideConfig as Record<string, unknown>;

	Object.entries(overrideObj).forEach(([key, value]) => {
		if (value === undefined) {
			return;
		}

		merged[key] = key in merged ? mergeConfig(merged[key], value) : cloneValue(value);
	});

	return merged;
}

// ============================================================================
// Factory Function
// ============================================================================

export function createConfigController(context: ConfigControllerContext = {}): ConfigController {
	const file = createFileController(context);

	interface Entry {
		path: string;
		fallback: unknown;
		value: unknown;
		loaded: boolean;
		loading: Promise<unknown> | null;
		error: Error | null;
	}

	const entryCache = new Map<string, Entry>();

	function normalizePath(path: string): string {
		return file.normalizePath(path);
	}

	function createEntry(path: string, fallback?: unknown): Entry {
		const normalizedPath = normalizePath(path);
		if (!normalizedPath) {
			throw new Error("[config] path cannot be empty.");
		}

		const existing = entryCache.get(normalizedPath);
		if (existing) {
			if (fallback !== undefined) {
				existing.fallback = mergeConfig(existing.fallback, fallback);
				if (!existing.loaded) {
					existing.value = cloneValue(existing.fallback);
				}
			}
			return existing;
		}

		const initialFallback = cloneValue(fallback || {});
		const entry: Entry = {
			path: normalizedPath,
			fallback: initialFallback,
			value: cloneValue(initialFallback),
			loaded: false,
			loading: null,
			error: null,
		};

		entryCache.set(normalizedPath, entry);
		return entry;
	}

	async function load(path: string, options: { fallback?: unknown; force?: boolean; cached?: boolean; silent?: boolean } = {}): Promise<unknown> {
		const entry = createEntry(path, options.fallback);

		if (entry.loaded && options.force !== true) {
			return cloneValue(entry.value);
		}

		if (entry.loading && options.force !== true) {
			return entry.loading;
		}

		entry.loading = file
			.readJson(entry.path, { cached: options.cached })
			.then((json: unknown) => {
				entry.value = mergeConfig(entry.fallback, json);
				entry.loaded = true;
				entry.error = null;
				return cloneValue(entry.value);
			})
			.catch((error: Error) => {
				entry.loaded = false;
				entry.error = error;

				if (options.silent !== false) {
					return cloneValue(entry.value);
				}

				throw error;
			})
			.finally(() => {
				entry.loading = null;
			});

		return entry.loading;
	}

	function get(path: string, options: { fallback?: unknown } = {}): unknown {
		const entry = createEntry(path, options.fallback);
		return cloneValue(entry.value);
	}

	function resolve(path: string, overrides: unknown = {}, options: { fallback?: unknown } = {}): unknown {
		const current = get(path, options);
		return mergeConfig(current, overrides);
	}

	function createScope(scopeOptions: { path: string; fallback?: unknown }): ConfigScope {
		const scopePath = normalizePath(scopeOptions.path);
		const scopeFallback = cloneValue(scopeOptions.fallback || {});

		if (!scopePath) {
			throw new Error("[config] scope.path cannot be empty.");
		}

		createEntry(scopePath, scopeFallback);

		return {
			path: scopePath,
			load(loadOptions: Record<string, unknown> = {}) {
				return load(scopePath, {
					...loadOptions,
					fallback: scopeFallback,
				});
			},
			get() {
				return get(scopePath, { fallback: scopeFallback });
			},
			merge(overrides: unknown = {}) {
				return resolve(scopePath, overrides, { fallback: scopeFallback });
			},
		};
	}

	return {
		normalizePath,
		clone: cloneValue,
		merge: mergeConfig,
		get,
		load,
		resolve,
		createScope,
		cache: entryCache,
	};
}

export const mergeConfigFn = mergeConfig;
export const cloneConfig = cloneValue;

export default createConfigController;
