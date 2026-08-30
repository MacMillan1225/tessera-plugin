/**
 * Third-party library manager (ADR-0005, extendable)
 *
 * Some components (chart/*) depend on large third-party libraries (ECharts)
 * that Obsidian's community-plugin installer does NOT deliver — it only
 * downloads main.js / manifest.json / styles.css. Instead of bundling ~1MB
 * into main.js or relying on a release asset nobody receives, the plugin
 * manages these libraries at runtime: the settings UI offers one-click
 * download / delete / status check, writing the library into the plugin's
 * own lib/ folder.
 *
 * Design: a registry of ThirdPartyLib descriptors, managed generically so
 * future libraries (e.g. a CSV parser, a chart engine) slot in by adding
 * one descriptor + one settings row. Currently only ECharts is registered.
 */

import { Notice, requestUrl } from "obsidian";

// ============================================================================
// Types
// ============================================================================

export type LibStatus = "missing" | "installed";

export interface ThirdPartyLib {
	/** Stable id used for paths and settings keys (e.g. "echarts"). */
	id: string;
	/** Display name (e.g. "ECharts"). */
	name: string;
	/** File name inside the plugin's lib/ folder (e.g. "echarts.min.js"). */
	fileName: string;
	/** CDN URL template — {version} is replaced with lib.version. */
	urlTemplate: string;
	/** Currently managed version (semver, no leading v). */
	version: string;
	/** Optional description shown in the settings row. */
	description?: string;
}

export interface LibManagerOptions {
	/** Absolute vault path to the plugin directory (this.manifest.dir). */
	pluginDir: string;
	/** Vault adapter (this.app.vault.adapter) for exists/mkdir/read/write/remove. */
	adapter: {
		exists(path: string): Promise<boolean>;
		mkdir(path: string): Promise<void>;
		writeBinary(path: string, data: ArrayBuffer): Promise<void>;
		read(path: string): Promise<string>;
		remove(path: string): Promise<void>;
		trashLocal?(path: string): Promise<void>;
	};
	/** Registry of managed libraries. */
	libs: ThirdPartyLib[];
	/** Called after download completes so callers can reset loader caches. */
	onChanged?: (lib: ThirdPartyLib) => void;
}

// ============================================================================
// Library Manager
// ============================================================================

export class LibManager {
	private options: LibManagerOptions;

	constructor(options: LibManagerOptions) {
		this.options = options;
	}

	/** Vault-relative path of a library file inside the plugin's lib/ folder. */
	libPath(lib: ThirdPartyLib): string {
		const dir = this.options.pluginDir.replace(/^\/+|\/+$/g, "");
		return dir ? `${dir}/lib/${lib.fileName}` : `lib/${lib.fileName}`;
	}

	/** Vault-relative path of the lib/ folder itself (created on demand). */
	libDir(lib: ThirdPartyLib): string {
		const path = this.libPath(lib);
		const index = path.lastIndexOf("/");
		return index > 0 ? path.slice(0, index) : "lib";
	}

	/** Check whether a library file exists on disk. */
	async status(lib: ThirdPartyLib): Promise<LibStatus> {
		const exists = await this.options.adapter.exists(this.libPath(lib));
		return exists ? "installed" : "missing";
	}

	/** Resolved download URL for a library's current version. */
	downloadUrl(lib: ThirdPartyLib): string {
		return lib.urlTemplate.replace("{version}", lib.version);
	}

	/**
	 * Download a library from its CDN URL and write it into the plugin's
	 * lib/ folder. Throws on network error or non-2xx status.
	 */
	async download(lib: ThirdPartyLib): Promise<void> {
		const url = this.downloadUrl(lib);
		const response = await requestUrl({
			url,
			method: "GET",
			throw: false,
		});

		if (response.status < 200 || response.status >= 300) {
			throw new Error(`Download failed (HTTP ${response.status}) for ${lib.name} from ${url}`);
		}

		// The plugin's lib/ folder may not exist yet (Obsidian's community
		// installer only ships main.js/manifest.json/styles.css), so create it
		// before writing. mkdir is idempotent when the folder already exists.
		await this.options.adapter.mkdir(this.libDir(lib));
		await this.options.adapter.writeBinary(this.libPath(lib), response.arrayBuffer);
		this.options.onChanged?.(lib);
	}

	/**
	 * Remove a library file. Prefers moving to the system trash (safer);
	 * falls back to a hard delete when trashLocal is unavailable.
	 */
	async remove(lib: ThirdPartyLib): Promise<void> {
		const path = this.libPath(lib);
		if (this.options.adapter.trashLocal) {
			await this.options.adapter.trashLocal(path);
		} else {
			await this.options.adapter.remove(path);
		}
		this.options.onChanged?.(lib);
	}

	/** Convenience: find a registered lib by id. */
	getLib(id: string): ThirdPartyLib | undefined {
		return this.options.libs.find((lib) => lib.id === id);
	}

	/** All managed libraries (for settings UI iteration). */
	get managedLibs(): ThirdPartyLib[] {
		return this.options.libs;
	}

	/** Check whether a library is installed by id. */
	async isInstalled(id: string): Promise<boolean> {
		const lib = this.getLib(id);
		if (!lib) return false;
		return (await this.status(lib)) === "installed";
	}

	/** Download a library by id (throws if id unknown). */
	async downloadById(id: string): Promise<void> {
		const lib = this.getLib(id);
		if (!lib) throw new Error(`Unknown library: ${id}`);
		await this.download(lib);
	}

	/** Remove a library by id (throws if id unknown). */
	async removeById(id: string): Promise<void> {
		const lib = this.getLib(id);
		if (!lib) throw new Error(`Unknown library: ${id}`);
		await this.remove(lib);
	}

	/** Convenience: show a Notice tied to a lib's state. */
	notify(lib: ThirdPartyLib, message: string): void {
		new Notice(`[${lib.name}] ${message}`, 4000);
	}
}

// ============================================================================
// Registry — add future third-party libraries here
// ============================================================================

/**
 * Managed third-party libraries.
 *
 * ECharts is the chart engine behind tessera.chart.* (ADR-0005). Version is
 * pinned to match the devDependency so bundled types stay in sync.
 * jsDelivr CDN: https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js
 */
export const MANAGED_LIBS: ThirdPartyLib[] = [
	{
		id: "echarts",
		name: "ECharts",
		fileName: "echarts.min.js",
		urlTemplate: "https://cdn.jsdelivr.net/npm/echarts@{version}/dist/echarts.min.js",
		version: "6.1.0",
		description: "Chart engine for tessera.chart.* components",
	},
];