/**
 * TesseraScript Core: CSS Module
 * Provides CSS injection and management
 */

import { createFileController } from "./file";

// ============================================================================
// Types
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

export interface CSSAddOptions {
	id?: string;
	text?: string;
	path?: string;
	target?: Node;
	attrs?: Record<string, string>;
	replace?: boolean;
	cached?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const GLOBAL_STORE_KEY = "__TESSERA_SCRIPT_CSS_STORE__";
const DEFAULT_PREFIX = "ts-css";
const SHARED_CONTROLLER_KEY = "__TESSERA_SCRIPT_SHARED_CSS_CONTROLLER__";

// ============================================================================
// Global Store
// ============================================================================

function getGlobalStore(): {
	registry: Map<string, CSSRecord>;
	counters: Record<string, number>;
} {
	if (!(globalThis as any)[GLOBAL_STORE_KEY]) {
		(globalThis as any)[GLOBAL_STORE_KEY] = {
			registry: new Map(),
			counters: {},
		};
	}
	return (globalThis as any)[GLOBAL_STORE_KEY];
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCSSController(context: CSSControllerContext = {}): CSSController {
	const store = getGlobalStore();
	const prefix = normalizePrefix(context.prefix || DEFAULT_PREFIX);
	const file = createFileController(context);

	function ensureDocument(): Document {
		if (typeof document === "undefined") {
			throw new Error("[css] Document is not available.");
		}
		return document;
	}

	function normalizeId(id: string): string {
		if (id == null) return "";
		const normalized = String(id)
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-zA-Z0-9_-]/g, "-");

		return normalized.replace(/-+/g, "-").replace(/^[-_]+|[-_]+$/g, "");
	}

	function makeDomId(id: string): string {
		return `${prefix}-${normalizeId(id)}`;
	}

	function nextAutoId(): string {
		let next = store.counters[prefix] || 1;

		while (true) {
			const candidate = `css-${next}`;
			const domId = makeDomId(candidate);

			if (!store.registry.has(candidate) && !findStyleElement(domId)) {
				store.counters[prefix] = next + 1;
				return candidate;
			}

			next += 1;
		}
	}

	function findStyleElement(domId: string): HTMLStyleElement | null {
		const doc = ensureDocument();
		return doc.getElementById(domId) as HTMLStyleElement | null;
	}

	function ensureMountTarget(target?: Node): Node {
		const doc = ensureDocument();
		if (target && typeof (target as any).appendChild === "function") {
			return target;
		}
		return doc.head || doc.body || doc.documentElement;
	}

	function setElementAttrs(element: HTMLElement, attrs: Record<string, string> = {}): void {
		Object.entries(attrs).forEach(([key, value]) => {
			if (value == null) return;
			element.setAttribute(key, String(value));
		});
	}

	function createStyleElement(record: CSSRecord, attrs?: Record<string, string>): HTMLStyleElement {
		const doc = ensureDocument();
		const styleEl = doc.createElement("style");

		styleEl.id = record.domId;
		styleEl.type = "text/css";
		styleEl.textContent = record.content;
		styleEl.setAttribute("data-tessera-css-id", record.id);
		styleEl.setAttribute("data-tessera-css-source-type", record.sourceType);

		if (record.source) {
			styleEl.setAttribute("data-tessera-css-source", record.source);
		}

		setElementAttrs(styleEl, attrs);
		return styleEl;
	}

	function attachElement(record: CSSRecord, target?: Node, attrs?: Record<string, string>): HTMLStyleElement {
		const mountTarget = ensureMountTarget(target);
		let element = findStyleElement(record.domId);

		if (!element) {
			element = createStyleElement(record, attrs);
			mountTarget.appendChild(element);
		} else {
			element.textContent = record.content;
			element.setAttribute("data-tessera-css-id", record.id);
			element.setAttribute("data-tessera-css-source-type", record.sourceType);

			if (record.source) {
				element.setAttribute("data-tessera-css-source", record.source);
			}

			setElementAttrs(element, attrs);
		}

		record.element = element;
		return element;
	}

	async function resolveContent(options: CSSAddOptions): Promise<{
		sourceType: "text" | "file";
		source: string | null;
		content: string;
	}> {
		const hasText = typeof options.text === "string";
		const hasPath = typeof options.path === "string" && options.path.trim() !== "";

		if (hasText && hasPath) {
			throw new Error("[css] text and path are mutually exclusive.");
		}

		if (!hasText && !hasPath) {
			throw new Error("[css] Either text or path must be provided.");
		}

		if (hasText) {
			return {
				sourceType: "text",
				source: null,
				content: options.text!,
			};
		}

		const normalizedPath = file.normalizePath(options.path!);
		const content = await file.readCss(normalizedPath, { cached: options.cached });

		return {
			sourceType: "file",
			source: normalizedPath,
			content,
		};
	}

	function buildRecord({
		id,
		sourceType,
		source,
		content,
	}: {
		id: string;
		sourceType: "text" | "file";
		source: string | null;
		content: string;
	}): CSSRecord {
		const now = Date.now();
		const domId = makeDomId(id);
		const existing = store.registry.get(id);

		return {
			id,
			domId,
			sourceType,
			source,
			content,
			element: existing?.element || findStyleElement(domId) || null,
			createdAt: existing?.createdAt || now,
			updatedAt: now,
		};
	}

	function saveRecord(record: CSSRecord): CSSRecord {
		store.registry.set(record.id, record);
		return record;
	}

	function cloneRecord(record: CSSRecord | null, extra: Partial<CSSRecord> = {}): CSSRecord | null {
		if (!record) return null;

		return {
			id: record.id,
			domId: record.domId,
			sourceType: record.sourceType,
			source: record.source,
			content: record.content,
			element: record.element,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
			...extra,
		} as CSSRecord;
	}

	function getExistingRecord(id: string): CSSRecord | null {
		const normalizedId = normalizeId(id);
		if (!normalizedId) return null;

		const fromRegistry = store.registry.get(normalizedId);
		if (fromRegistry) {
			const element = findStyleElement(fromRegistry.domId);
			if (element) fromRegistry.element = element;
			return fromRegistry;
		}

		const domId = makeDomId(normalizedId);
		const element = findStyleElement(domId);
		if (!element) return null;

		const now = Date.now();
		const recovered: CSSRecord = {
			id: normalizedId,
			domId,
			sourceType: (element.getAttribute("data-tessera-css-source-type") as "text" | "file") || "text",
			source: element.getAttribute("data-tessera-css-source") || null,
			content: element.textContent || "",
			element,
			createdAt: now,
			updatedAt: now,
		};

		store.registry.set(normalizedId, recovered);
		return recovered;
	}

	async function add(options: CSSAddOptions = {}): Promise<CSSRecord> {
		const resolved = await resolveContent(options);
		const requestedId = normalizeId(options.id || "");
		const id = requestedId || nextAutoId();
		const existing = getExistingRecord(id);

		if (existing && !options.replace) {
			return cloneRecord(existing, {
				updatedAt: Date.now(),
			}) as CSSRecord;
		}

		const record = buildRecord({
			id,
			sourceType: resolved.sourceType,
			source: resolved.source,
			content: resolved.content,
		});

		attachElement(record, options.target, options.attrs);
		saveRecord(record);

		return cloneRecord(record) as CSSRecord;
	}

	async function addText(text: string, options: Partial<CSSAddOptions> = {}): Promise<CSSRecord> {
		return add({ ...options, text });
	}

	async function addFile(path: string, options: Partial<CSSAddOptions> = {}): Promise<CSSRecord> {
		return add({ ...options, path });
	}

	async function update(id: string, options: { text?: string; path?: string }): Promise<CSSRecord> {
		const existing = getExistingRecord(id);
		if (!existing) {
			throw new Error(`[css] Style not found: ${id}`);
		}

		const resolved = await resolveContent(options);
		existing.sourceType = resolved.sourceType;
		existing.source = resolved.source;
		existing.content = resolved.content;
		existing.updatedAt = Date.now();

		attachElement(existing);
		saveRecord(existing);

		return cloneRecord(existing) as CSSRecord;
	}

	function append(id: string, text: string): CSSRecord {
		if (typeof text !== "string") {
			throw new Error("[css] append requires a string.");
		}

		const existing = getExistingRecord(id);
		if (!existing) {
			throw new Error(`[css] Style not found: ${id}`);
		}

		existing.content = `${existing.content}${existing.content ? "\n" : ""}${text}`;
		existing.updatedAt = Date.now();
		existing.sourceType = "text";

		attachElement(existing);
		saveRecord(existing);

		return cloneRecord(existing) as CSSRecord;
	}

	function remove(id: string): boolean {
		const existing = getExistingRecord(id);
		if (!existing) return false;

		const element = existing.element || findStyleElement(existing.domId);
		if (element && element.parentNode) {
			element.parentNode.removeChild(element);
		}

		store.registry.delete(existing.id);
		return true;
	}

	function clear(): number {
		const ids = Array.from(store.registry.keys()).filter((id) => makeDomId(id).startsWith(prefix));
		ids.forEach((id) => remove(id));
		return ids.length;
	}

	function has(id: string): boolean {
		return !!getExistingRecord(id);
	}

	function get(id: string): CSSRecord | null {
		return cloneRecord(getExistingRecord(id));
	}

	function list(): CSSRecord[] {
		return Array.from(store.registry.values())
			.filter((record) => record.domId.startsWith(prefix))
			.map((record) => cloneRecord(record) as CSSRecord);
	}

	async function ensure(options: CSSAddOptions = {}): Promise<CSSRecord> {
		const normalizedId = normalizeId(options.id || "");
		if (normalizedId) {
			const existing = getExistingRecord(normalizedId);
			if (existing) {
				return cloneRecord(existing) as CSSRecord;
			}
		}

		return add(options);
	}

	return {
		add,
		addText,
		addFile,
		update,
		append,
		remove,
		clear,
		has,
		get,
		list,
		ensure,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizePrefix(prefix: string): string {
	const value = String(prefix || DEFAULT_PREFIX).trim();
	return value || DEFAULT_PREFIX;
}

export function getSharedCSSController(context: CSSControllerContext = {}): CSSController {
	if (!(globalThis as any)[SHARED_CONTROLLER_KEY]) {
		(globalThis as any)[SHARED_CONTROLLER_KEY] = createCSSController(context);
	}
	return (globalThis as any)[SHARED_CONTROLLER_KEY];
}

export async function ensureSharedStyle(options: CSSAddOptions & { context?: CSSControllerContext } = {}): Promise<CSSRecord> {
	return getSharedCSSController(options.context).ensure(options);
}

export default createCSSController;
