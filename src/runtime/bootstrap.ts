/**
 * TesseraScript Runtime Bootstrap
 * Module system implementation for DataviewJS environment
 */

// ============================================================================
// Types
// ============================================================================

export interface TesseraModuleFactory {
	(runtime: {
		id: string;
		require: RequireFunction;
		module: { id: string; exports: unknown; loaded: boolean; loading: boolean };
		exports: unknown;
	}): void;
}

export interface RequireFunction {
	(specifier: string): unknown;
}

export interface TesseraObject {
	version: string;
	define: (id: string, factory: (require: RequireFunction, module: { exports: unknown }, exports: unknown) => void) => TesseraObject;
	register: (id: string, factory: TesseraModuleFactory) => TesseraObject;
	require: (specifier: string, from?: string) => unknown;
	use: (name: string) => unknown;
	resolve: (specifier: string, from?: string) => string;
	alias: (nameOrMap: string | Record<string, string>, target?: string) => TesseraObject;
	has: (id: string) => boolean;
	modules: Map<string, TesseraModuleFactory>;
	cache: Map<string, { id: string; exports: unknown; loaded: boolean; loading: boolean }>;
	aliases: Map<string, string>;
	__initialized: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const VERSION = "1.0.0";
const PREFIX = "[Tessera]";

// ============================================================================
// Helper Functions
// ============================================================================

function fail(message: string): never {
	throw new Error(`${PREFIX} ${message}`);
}

function isRelative(specifier: string): boolean {
	return (
		specifier === "." ||
		specifier === ".." ||
		specifier.startsWith("./") ||
		specifier.startsWith("../")
	);
}

function normalizeId(value: string): string {
	const source = String(value == null ? "" : value)
		.trim()
		.replace(/\\/g, "/");

	if (!source) {
		return "";
	}

	const parts = source.split("/");
	const normalized: string[] = [];

	for (const part of parts) {
		if (!part || part === ".") {
			continue;
		}

		if (part === "..") {
			if (normalized.length === 0) {
				fail(`Invalid module path: ${value}`);
			}
			normalized.pop();
			continue;
		}

		normalized.push(part);
	}

	return normalized.join("/");
}

function dirname(moduleId: string): string {
	const normalized = normalizeId(moduleId);
	if (!normalized || !normalized.includes("/")) {
		return "";
	}
	return normalized.slice(0, normalized.lastIndexOf("/"));
}

function resolveRelative(specifier: string, from: string): string {
	if (!from) {
		fail(`Cannot resolve relative module "${specifier}" without a parent module.`);
	}

	const baseDir = dirname(from);
	const baseParts = baseDir ? baseDir.split("/") : [];
	const specParts = String(specifier).replace(/\\/g, "/").split("/");

	for (const part of specParts) {
		if (!part || part === ".") {
			continue;
		}

		if (part === "..") {
			if (baseParts.length === 0) {
				fail(`Invalid relative module "${specifier}" from "${from}".`);
			}
			baseParts.pop();
			continue;
		}

		baseParts.push(part);
	}

	return normalizeId(baseParts.join("/"));
}

// ============================================================================
// Tessera Runtime Class
// ============================================================================

export class TesseraRuntime {
	private modules = new Map<string, TesseraModuleFactory>();
	private cache = new Map<string, { id: string; exports: unknown; loaded: boolean; loading: boolean }>();
	private aliases = new Map<string, string>();
	private initialized = false;

	constructor() {
		// Don't auto-initialize, let the plugin control when to initialize
	}

	/**
	 * Initialize the runtime and register default aliases
	 */
	initialize(): void {
		if (this.initialized) {
			return;
		}

		this.registerDefaultAliases();
		this.initialized = true;
	}

	/**
	 * Register default aliases for common components
	 */
	private registerDefaultAliases(): void {
		this.alias({
			// Core modules
			dom: "core/dom",
			css: "core/css",
			config: "core/config",
			file: "core/file",
			style: "core/style",
			font: "core/font",
			pageStyle: "core/page-style",

			// Components
			progressbar: "components/progressbar",
			card: "components/card",
			heatmap: "components/heatmap",
			example: "components/example",

			// Aggregation entry
			components: "index",
			"@ui": "index",
		});
	}

	/**
	 * Define a new module
	 */
	define(
		id: string,
		factory: (require: RequireFunction, module: { exports: unknown }, exports: unknown) => void
	): TesseraRuntime {
		if (typeof factory !== "function") {
			fail(`Module factory must be a function: ${normalizeId(id) || id}`);
		}

		return this.register(id, (runtime) => {
			factory(runtime.require, runtime.module, runtime.exports);
		});
	}

	/**
	 * Register a module with raw factory function
	 */
	register(id: string, factory: TesseraModuleFactory): TesseraRuntime {
		const moduleId = normalizeId(id);
		if (!moduleId) {
			fail("Module id is required.");
		}
		if (typeof factory !== "function") {
			fail(`Module factory must be a function: ${moduleId}`);
		}

		this.modules.set(moduleId, factory);
		this.cache.delete(moduleId);
		return this;
	}

	/**
	 * Require a module by specifier
	 */
	require(specifier: string, from?: string): unknown {
		const moduleId = this.resolve(specifier, from);

		if (this.cache.has(moduleId)) {
			const cached = this.cache.get(moduleId)!;
			if (cached.loading) {
				fail(`Circular dependency detected: ${from || "<root>"} -> ${moduleId}`);
			}
			return cached.exports;
		}

		const factory = this.modules.get(moduleId);
		if (!factory) {
			fail(`Module not found: ${moduleId}`);
		}

		const module = {
			id: moduleId,
			exports: {},
			loaded: false,
			loading: true,
		};

		this.cache.set(moduleId, module);

		const localRequire = (childSpecifier: string): unknown => {
			return this.requireModule(childSpecifier, moduleId);
		};

		try {
			factory({
				id: moduleId,
				require: localRequire,
				module,
				exports: module.exports,
			});
			module.loaded = true;
			module.loading = false;
			return module.exports;
		} catch (error) {
			this.cache.delete(moduleId);
			const reason = error instanceof Error ? error.message : String(error);
			fail(`Module execution failed: ${moduleId}\n${reason}`);
		}
	}

	/**
	 * Internal require with from context
	 */
	private requireModule(specifier: string, from?: string): unknown {
		return this.require(specifier, from);
	}

	/**
	 * High-level user API for importing modules
	 */
	use(name: string): unknown {
		return this.require(name);
	}

	/**
	 * Resolve a module specifier to its full path
	 */
	resolve(specifier: string, from?: string): string {
		const raw = String(specifier == null ? "" : specifier).trim();
		if (!raw) {
			fail("Module specifier is required.");
		}

		// Check aliases first
		const aliasTarget = this.aliases.get(raw);
		if (aliasTarget) {
			return this.resolve(aliasTarget, from);
		}

		// Handle relative paths
		if (isRelative(raw)) {
			return resolveRelative(raw, from || "");
		}

		return normalizeId(raw);
	}

	/**
	 * Register alias(es)
	 */
	alias(nameOrMap: string | Record<string, string>, target?: string): TesseraRuntime {
		if (typeof nameOrMap === "string") {
			const key = String(nameOrMap).trim();
			const value = String(target == null ? "" : target).trim();
			if (!key || !value) {
				fail("Alias name and target are required.");
			}
			this.aliases.set(key, value);
			return this;
		}

		if (!nameOrMap || typeof nameOrMap !== "object") {
			fail("Alias map must be an object.");
		}

		Object.entries(nameOrMap).forEach(([key, value]) => {
			if (value == null || String(value).trim() === "") {
				return;
			}
			this.aliases.set(String(key).trim(), String(value).trim());
		});

		return this;
	}

	/**
	 * Check if a module is registered
	 */
	has(id: string): boolean {
		const moduleId = this.resolve(id);
		return this.modules.has(moduleId);
	}

	/**
	 * Get module count
	 */
	getModuleCount(): number {
		return this.modules.size;
	}

	/**
	 * Get component count (modules starting with "components/")
	 */
	getComponentCount(): number {
		let count = 0;
		for (const id of this.modules.keys()) {
			if (id.startsWith("components/")) {
				count++;
			}
		}
		return count;
	}

	/**
	 * Get all registered module IDs
	 */
	getModuleIds(): string[] {
		return Array.from(this.modules.keys());
	}

	/**
	 * Get the Tessera object for global mounting
	 */
	getTesseraObject(): TesseraObject {
		return {
			version: VERSION,
			define: (id: string, factory: (require: RequireFunction, module: { exports: unknown }, exports: unknown) => void) => {
				this.define(id, factory);
				return this.getTesseraObject();
			},
			register: (id: string, factory: TesseraModuleFactory) => {
				this.register(id, factory);
				return this.getTesseraObject();
			},
			require: this.require.bind(this),
			use: this.use.bind(this),
			resolve: this.resolve.bind(this),
			alias: (nameOrMap: string | Record<string, string>, target?: string) => {
				this.alias(nameOrMap, target);
				return this.getTesseraObject();
			},
			has: this.has.bind(this),
			modules: this.modules,
			cache: this.cache,
			aliases: this.aliases,
			__initialized: true,
		};
	}

	/**
	 * Mount Tessera to window
	 */
	mountGlobal(): void {
		(window as unknown as Record<string, unknown>).Tessera = this.getTesseraObject();
	}

	/**
	 * Unmount Tessera from window
	 */
	unmountGlobal(): void {
		delete (window as unknown as Record<string, unknown>).Tessera;
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let runtimeInstance: TesseraRuntime | null = null;

/**
 * Get or create the singleton TesseraRuntime instance
 */
export function getRuntime(): TesseraRuntime {
	if (!runtimeInstance) {
		runtimeInstance = new TesseraRuntime();
	}
	return runtimeInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetRuntime(): void {
	runtimeInstance = null;
}

// ============================================================================
// Default Export
// ============================================================================

export default TesseraRuntime;
