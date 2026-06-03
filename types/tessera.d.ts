/**
 * TesseraScript Type Definitions
 * Modular component library for Obsidian DataviewJS
 */

import type { TFile } from "obsidian";

// ============================================================================
// Core Types
// ============================================================================

export interface TesseraModule {
	id: string;
	exports: unknown;
	loaded: boolean;
	loading: boolean;
}

export interface TesseraModuleFactory {
	(require: RequireFunction, module: { exports: unknown }, exports: unknown): void;
}

export interface RequireFunction {
	(specifier: string): unknown;
}

export interface TesseraObject {
	version: string;
	define(id: string, factory: TesseraModuleFactory): TesseraObject;
	register(id: string, factory: TesseraModuleFactory): TesseraObject;
	require(specifier: string, from?: string): unknown;
	use(name: string): unknown;
	resolve(specifier: string, from?: string): string;
	alias(nameOrMap: string | Record<string, string>, target?: string): TesseraObject;
	has(id: string): boolean;
	modules: Map<string, TesseraModuleFactory>;
	cache: Map<string, TesseraModule>;
	aliases: Map<string, string>;
	__initialized: boolean;
}

// ============================================================================
// DOM Types
// ============================================================================

export interface CreateElementOptions {
	className?: string | string[];
	attrs?: Record<string, unknown>;
	style?: Record<string, unknown>;
	text?: string;
	html?: string;
	children?: unknown;
}

export interface DomModule {
	createElement(tagName: string, options?: CreateElementOptions): HTMLElement;
	el(tagName: string, options?: CreateElementOptions): HTMLElement;
	fragment(children: unknown): DocumentFragment;
	appendChildren(element: Node, children: unknown): Node;
	assignClasses(element: HTMLElement, className: string | string[]): HTMLElement;
	assignAttributes(element: HTMLElement, attrs: Record<string, unknown>): HTMLElement;
	assignStyles(element: HTMLElement, styles: Record<string, unknown>): HTMLElement;
}

// ============================================================================
// CSS Types
// ============================================================================

export interface CSSControllerContext {
	app?: unknown;
	prefix?: string;
}

export interface CSSRecord {
	id: string;
	domId: string;
	sourceType: "text" | "file";
	source: string | null;
	content: string;
	element: HTMLStyleElement | null;
	createdAt: number;
	updatedAt: number;
}

export interface CSSAddOptions {
	id?: string;
	text?: string;
	path?: string;
	target?: Node;
	attrs?: Record<string, string>;
	replace?: boolean;
	cached?: boolean;
}

export interface CSSController {
	add(options: CSSAddOptions): Promise<CSSRecord>;
	addText(text: string, options?: Partial<CSSAddOptions>): Promise<CSSRecord>;
	addFile(path: string, options?: Partial<CSSAddOptions>): Promise<CSSRecord>;
	update(id: string, options: { text?: string; path?: string }): Promise<CSSRecord>;
	append(id: string, text: string): CSSRecord;
	remove(id: string): boolean;
	clear(): number;
	has(id: string): boolean;
	get(id: string): CSSRecord | null;
	list(): CSSRecord[];
	ensure(options: CSSAddOptions): Promise<CSSRecord>;
}

export type CreateCSSController = (context?: CSSControllerContext) => CSSController;

// ============================================================================
// Config Types
// ============================================================================

export interface ConfigControllerContext {
	app?: unknown;
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

export type CreateConfigController = (context?: ConfigControllerContext) => ConfigController;

// ============================================================================
// File Types
// ============================================================================

export interface FileControllerContext {
	app?: unknown;
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

export type CreateFileController = (context?: FileControllerContext) => FileController;

// ============================================================================
// Component Types
// ============================================================================

export interface CardOptions {
	title?: string;
	meta?: string;
	value?: unknown;
	content?: unknown;
	children?: unknown;
	emptyText?: string;
	className?: string | string[];
	flags?: {
		showHeader?: boolean;
		headerSep?: boolean;
		showTitle?: boolean;
		showMeta?: boolean;
		showValue?: boolean;
	};
	layout?: {
		maxWidth?: string;
		padding?: string;
		radius?: string;
		gap?: string;
		bodyGap?: string;
	};
	colors?: {
		light?: Record<string, string>;
		dark?: Record<string, string>;
		[key: string]: unknown;
	};
	styles?: {
		card?: Record<string, unknown>;
		header?: Record<string, unknown>;
		title?: Record<string, unknown>;
		meta?: Record<string, unknown>;
		body?: Record<string, unknown>;
		value?: Record<string, unknown>;
		empty?: Record<string, unknown>;
	};
}

export interface HeatmapOptions {
	data?: Record<string, number> | Array<{ date: string; value: number }>;
	startDate?: string;
	endDate?: string;
	cellSize?: number;
	cellGap?: number;
	colors?: {
		empty?: string;
		levels?: string[];
		light?: {
			empty?: string;
			levels?: string[];
		};
		dark?: {
			empty?: string;
			levels?: string[];
		};
	};
	labels?: {
		showMonths?: boolean;
		showDays?: boolean;
		monthFormat?: string;
		dayFormat?: string;
	};
	styles?: {
		root?: Record<string, unknown>;
		cell?: Record<string, unknown>;
		label?: Record<string, unknown>;
	};
}

export interface ProgressbarOptions {
	value?: number;
	max?: number;
	min?: number;
	showLabel?: boolean;
	labelFormat?: string;
	colors?: {
		light?: {
			background?: string;
			fill?: string;
			label?: string;
		};
		dark?: {
			background?: string;
			fill?: string;
			label?: string;
		};
	};
	styles?: {
		root?: Record<string, unknown>;
		bar?: Record<string, unknown>;
		fill?: Record<string, unknown>;
		label?: Record<string, unknown>;
	};
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface TesseraPluginSettings {
	enableLegacyMode: boolean;
	enableDeprecationWarnings: boolean;
	defaultTheme: "auto" | "light" | "dark";
	customStylesPath: string;
}

export const DEFAULT_PLUGIN_SETTINGS: TesseraPluginSettings;
