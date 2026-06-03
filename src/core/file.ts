/**
 * TesseraScript Core: File Module
 * Provides vault file reading and resource URL generation
 */

import { TFile, type App } from "obsidian";

// ============================================================================
// Types
// ============================================================================

export interface FileControllerContext {
	app?: App;
}

export interface FileController {
	normalizePath(path: string): string;
	exists(path: string): boolean;
	getFile(path: string): TFile | null;
	getResourceUrl(path: string): string;
	read(path: string, options?: { cached?: boolean }): Promise<string>;
	readText(path: string, options?: { cached?: boolean }): Promise<string>;
	readCss(path: string, options?: { cached?: boolean }): Promise<string>;
	readJson(path: string, options?: { cached?: boolean }): Promise<unknown>;
}

// ============================================================================
// Factory Function
// ============================================================================

export function createFileController(context: FileControllerContext = {}): FileController {
	const { app } = context;

	if (!app) {
		throw new Error("[file] App instance is required.");
	}

	// Store app in a const that TypeScript can track as defined
	const vault = app.vault;
	const cache = new Map<string, { content: string; timestamp: number }>();

	function normalizePath(path: string): string {
		return String(path || "")
			.trim()
			.replace(/\\/g, "/");
	}

	function exists(path: string): boolean {
		const normalizedPath = normalizePath(path);
		return vault.getAbstractFileByPath(normalizedPath) !== null;
	}

	function getFile(path: string): TFile | null {
		const normalizedPath = normalizePath(path);
		const file = vault.getAbstractFileByPath(normalizedPath);
		return file instanceof TFile ? file : null;
	}

	function getResourceUrl(path: string): string {
		const normalizedPath = normalizePath(path);
		const file = vault.getAbstractFileByPath(normalizedPath);

		if (!file || !(file instanceof TFile)) {
			throw new Error(`[file] File not found: ${normalizedPath}`);
		}

		return vault.getResourcePath(file);
	}

	async function read(path: string, options: { cached?: boolean } = {}): Promise<string> {
		const normalizedPath = normalizePath(path);
		const { cached = true } = options;

		if (cached) {
			const cachedContent = cache.get(normalizedPath);
			if (cachedContent) {
				return cachedContent.content;
			}
		}

		const abstractFile = vault.getAbstractFileByPath(normalizedPath);
		if (!abstractFile || !(abstractFile instanceof TFile)) {
			throw new Error(`[file] File not found: ${normalizedPath}`);
		}

		const content = await vault.read(abstractFile);

		if (cached) {
			cache.set(normalizedPath, {
				content,
				timestamp: Date.now(),
			});
		}

		return content;
	}

	async function readText(path: string, options?: { cached?: boolean }): Promise<string> {
		return read(path, options);
	}

	async function readCss(path: string, options?: { cached?: boolean }): Promise<string> {
		return read(path, options);
	}

	async function readJson(path: string, options?: { cached?: boolean }): Promise<unknown> {
		const content = await read(path, options);
		try {
			return JSON.parse(content);
		} catch (error) {
			throw new Error(`[file] Failed to parse JSON from ${path}: ${String(error)}`);
		}
	}

	return {
		normalizePath,
		exists,
		getFile,
		getResourceUrl,
		read,
		readText,
		readCss,
		readJson,
	};
}

export default createFileController;
