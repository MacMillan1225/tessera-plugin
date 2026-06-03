/**
 * TesseraScript Core: File Module
 * Provides vault file reading and resource URL generation
 */

import type { App } from "obsidian";

// ============================================================================
// Types
// ============================================================================

export interface FileControllerContext {
	app?: App;
}

export interface FileController {
	normalizePath(path: string): string;
	exists(path: string): boolean;
	getFile(path: string): any | null;
	getResourceUrl(path: string): string;
	read(path: string, options?: { cached?: boolean }): Promise<string>;
	readText(path: string, options?: { cached?: boolean }): Promise<string>;
	readCss(path: string, options?: { cached?: boolean }): Promise<string>;
	readJson(path: string, options?: { cached?: boolean }): Promise<any>;
}

// ============================================================================
// Factory Function
// ============================================================================

export function createFileController(context: FileControllerContext = {}): FileController {
	const { app } = context;

	if (!app) {
		throw new Error("[file] App instance is required.");
	}

	const cache = new Map<string, { content: string; timestamp: number }>();

	function normalizePath(path: string): string {
		return String(path || "")
			.trim()
			.replace(/\\/g, "/");
	}

	function exists(path: string): boolean {
		const normalizedPath = normalizePath(path);
		return app.vault.getAbstractFileByPath(normalizedPath) !== null;
	}

	function getFile(path: string): any | null {
		const normalizedPath = normalizePath(path);
		return app.vault.getAbstractFileByPath(normalizedPath);
	}

	function getResourceUrl(path: string): string {
		const normalizedPath = normalizePath(path);
		const file = app.vault.getAbstractFileByPath(normalizedPath);

		if (!file) {
			throw new Error(`[file] File not found: ${normalizedPath}`);
		}

		return app.vault.getResourcePath(file);
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

		const file = app.vault.getAbstractFileByPath(normalizedPath);
		if (!file) {
			throw new Error(`[file] File not found: ${normalizedPath}`);
		}

		const content = await app.vault.read(file as any);

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

	async function readJson(path: string, options?: { cached?: boolean }): Promise<any> {
		const content = await read(path, options);
		try {
			return JSON.parse(content);
		} catch (error) {
			throw new Error(`[file] Failed to parse JSON from ${path}: ${error}`);
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
