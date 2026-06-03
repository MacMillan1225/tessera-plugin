/**
 * TesseraScript Type Definitions
 * Modular component library for Obsidian DataviewJS
 */

// ============================================================================
// Core Types
// ============================================================================

export interface TesseraModule {
	id: string;
	exports: any;
	loaded: boolean;
	loading: boolean;
}

export interface TesseraModuleFactory {
	(require: RequireFunction, module: { exports: any }, exports: any): void;
}

export interface RequireFunction {
	(specifier: string): any;
}

export interface TesseraObject {
	version: string;
	define(id: string, factory: TesseraModuleFactory): TesseraObject;
	register(id: string, factory: TesseraModuleFactory): TesseraObject;
	require(specifier: string, from?: string): any;
	use(name: string): any;
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
	attrs?: Record<string, any>;
	style?: Record<string, any>;
	text?: string;
	html?: string;
	children?: any | any[];
}

export interface DomModule {
	createElement(tagName: string, options?: CreateElementOptions): HTMLElement;
	el(tagName: string, options?: CreateElementOptions): HTMLElement;
	fragment(children: any | any[]): DocumentFragment;
	appendChildren(element: Node, children: any | any[]): Node;
	assignClasses(element: HTMLElement, className: string | string[]): HTMLElement;
	assignAttributes(element: HTMLElement, attrs: Record<string, any>): HTMLElement;
	assignStyles(element: HTMLElement, styles: Record<string, any>): HTMLElement;
}

// ============================================================================
// CSS Types
// ============================================================================

export interface CSSControllerContext {
	app?: any;
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
	app?: any;
}

export interface ConfigScope {
	path: string;
	load(options?: any): Promise<any>;
	get(): any;
	merge(overrides?: any): any;
}

export interface ConfigController {
	normalizePath(path: string): string;
	clone<T>(value: T): T;
	merge(baseConfig: any, overrideConfig: any): any;
	get(path: string, options?: any): any;
	load(path: string, options?: any): Promise<any>;
	resolve(path: string, overrides?: any, options?: any): any;
	createScope(scopeOptions: { path: string; fallback?: any }): ConfigScope;
	cache: Map<string, any>;
}

export type CreateConfigController = (context?: ConfigControllerContext) => ConfigController;

// ============================================================================
// File Types
// ============================================================================

export interface FileControllerContext {
	app?: any;
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

export type CreateFileController = (context?: FileControllerContext) => FileController;

// ============================================================================
// Component Types
// ============================================================================

export interface CardOptions {
	title?: string;
	meta?: string;
	value?: any;
	content?: any;
	children?: any;
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
		[key: string]: any;
	};
	styles?: {
		card?: Record<string, any>;
		header?: Record<string, any>;
		title?: Record<string, any>;
		meta?: Record<string, any>;
		body?: Record<string, any>;
		value?: Record<string, any>;
		empty?: Record<string, any>;
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
		root?: Record<string, any>;
		cell?: Record<string, any>;
		label?: Record<string, any>;
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
		root?: Record<string, any>;
		bar?: Record<string, any>;
		fill?: Record<string, any>;
		label?: Record<string, any>;
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
