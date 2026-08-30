/**
 * TesseraScript Component: Heatmap
 * Calendar heatmap component with tooltip and legend support
 */

import { HEATMAP_DEFAULTS } from "./config";
import { createElement } from "../../utils/dom";

// ============================================================================
// Types
// ============================================================================

export interface HeatmapEntry {
	total?: number;
	completed?: number;
	value?: number;
	label?: string;
	level?: number;
	[key: string]: unknown;
}

export interface HeatmapCellContext {
	entry: HeatmapEntry | undefined;
	date: Date;
	dateKey: string;
	theme: ThemeColors;
	locale: string;
}

export interface HeatmapCellStyle {
	level?: number;
	color?: string;
	borderColor?: string;
	className?: string;
	style?: Record<string, unknown>;
	title?: string;
}

export interface ThemeColors {
	light: {
		background: string;
		text: string;
		tooltip: string;
		tooltipBg: string;
		levels: string[];
	};
	dark: {
		background: string;
		text: string;
		tooltip: string;
		tooltipBg: string;
		levels: string[];
	};
}

export interface HeatmapOptions {
	data?: Record<string, number | HeatmapEntry> | Map<string, number | HeatmapEntry>;
	startDate?: string | Date;
	endDate?: string | Date;
	getData?: (context: {
		start: Date;
		end: Date;
		locale: string;
	}) => Map<string, HeatmapEntry> | Record<string, HeatmapEntry> | Promise<Map<string, HeatmapEntry>> | Promise<Record<string, HeatmapEntry>>;
	getCellStyle?: (context: HeatmapCellContext) => number | string | HeatmapCellStyle | null;
	renderTooltip?: (context: HeatmapCellContext & { visual: HeatmapCellStyle }) => string;
	flags?: {
		showMonthLabels?: boolean;
		showWeekLabels?: boolean;
		showLegend?: boolean;
		showTooltip?: boolean;
		mondayFirst?: boolean;
	};
	settings?: {
		rangeMode?: "adaptive" | "fixed" | "year";
		minWeeks?: number;
		fixedDays?: number;
		locale?: string;
		monthNames?: string[];
		weekLabels?: string[];
		legend?: string | false | null;
		tooltipId?: string;
	};
	layout?: {
		maxWidth?: string;
		cellSize?: number;
		cellGap?: number;
		cellRadius?: string;
		weekLabelWidth?: string;
		weekLabelGap?: string;
		monthLabelHeight?: string;
		monthOffset?: string;
		gridTopOffset?: string;
		monthLabelSize?: string;
		weekLabelSize?: string;
		legendGap?: string;
		legendTop?: string;
		legendSwatchSize?: string;
	};
	colors?: {
		light?: {
			background?: string;
			text?: string;
			tooltip?: string;
			tooltipBg?: string;
			levels?: string[];
		};
		dark?: {
			background?: string;
			text?: string;
			tooltip?: string;
			tooltipBg?: string;
			levels?: string[];
		};
		background?: string;
		text?: string;
		tooltip?: string;
		tooltipBg?: string;
		levels?: string[];
	};
	styles?: {
		root?: Record<string, unknown>;
		months?: Record<string, unknown>;
		weeks?: Record<string, unknown>;
		grid?: Record<string, unknown>;
		legend?: Record<string, unknown>;
	};
	className?: string | string[];
}

// ============================================================================
// Date Utilities
// ============================================================================

const MAX_LEVEL = 8;
const LEGEND_COLOR_TOKEN = /\$#([0-9a-fA-F]{3,8})\$/g;

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

function normalizeDate(value: unknown): Date | null {
	if (!value) return null;
	if (value instanceof Date) return new Date(value.getTime());
	if (typeof value === "string") {
		const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
		const date = new Date(normalized);
		return Number.isNaN(date.getTime()) ? null : date;
	}
	return null;
}

function cloneDate(date: Date): Date {
	return new Date(date.getTime());
}

function addDays(date: Date, days: number): Date {
	const next = cloneDate(date);
	next.setDate(next.getDate() + days);
	return next;
}

function diffDays(start: Date, end: Date): number {
	return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function alignToMonday(date: Date): Date {
	const aligned = cloneDate(date);
	const day = aligned.getDay();
	const offset = day === 0 ? 6 : day - 1;
	aligned.setDate(aligned.getDate() - offset);
	return aligned;
}

function toDateKey(value: unknown): string {
	const date = normalizeDate(value);
	if (!date) return "";
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function htmlEscape(value: unknown): string {
	const str = value == null ? "" : typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value);
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// ============================================================================
// Color Utilities
// ============================================================================

function ratioToLevel(completed: number, total: number): number {
	const safeTotal = Number(total || 0);
	const safeCompleted = Number(completed || 0);

	if (safeTotal <= 0) return 0;
	if (safeCompleted <= 0) return 1;

	return Math.min(MAX_LEVEL, Math.max(1, Math.ceil((safeCompleted / safeTotal) * MAX_LEVEL)));
}

function normalizeMap(source: unknown): Map<string, HeatmapEntry> {
	if (!source) return new Map();

	const map = new Map<string, HeatmapEntry>();

	if (source instanceof Map) {
		source.forEach((value: unknown, key: string) => {
			if (typeof value === "number") {
				map.set(key, { value });
			} else if (value && typeof value === "object") {
				map.set(key, value as HeatmapEntry);
			}
		});
		return map;
	}

	if (Array.isArray(source)) {
		source.forEach(([key, value]: [string, unknown]) => {
			if (typeof value === "number") {
				map.set(key, { value });
			} else if (value && typeof value === "object") {
				map.set(key, value as HeatmapEntry);
			}
		});
		return map;
	}

	if (typeof source === "object") {
		Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
			if (typeof value === "number") {
				map.set(key, { value });
			} else if (value && typeof value === "object") {
				map.set(key, value as HeatmapEntry);
			}
		});
		return map;
	}

	return map;
}

function parseLegend(value: unknown): Array<{ type: "text"; text: string } | { type: "color"; color: string }> | null {
	if (value == null || value === false) return null;
	if (Array.isArray(value)) {
		return value.map((item) => {
			if (typeof item === "object" && item !== null && "type" in item) {
				return item as { type: "text"; text: string } | { type: "color"; color: string };
			}
			return { type: "text" as const, text: String(item) };
		});
	}

	const raw = typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value);
	if (!raw.trim()) return null;

	const items: Array<{ type: "text"; text: string } | { type: "color"; color: string }> = [];
	let lastIndex = 0;

	raw.replace(LEGEND_COLOR_TOKEN, function (match: string, hex: string, offset: number) {
		const before = raw.slice(lastIndex, offset);
		if (before) {
			items.push({ type: "text", text: before });
		}

		items.push({ type: "color", color: `#${hex}` });
		lastIndex = offset + match.length;
		return match;
	});

	const tail = raw.slice(lastIndex);
	if (tail) {
		items.push({ type: "text", text: tail });
	}

	return items.length ? items : null;
}

// ============================================================================
// Tooltip Functions
// ============================================================================

function ensureTooltip(id: string): HTMLElement {
	// eslint-disable-next-line obsidianmd/prefer-active-doc
	let tooltip = document.getElementById(id);

	if (!tooltip) {
		tooltip = createElement("div", {
			className: "ts-heatmap-tooltip",
			attrs: {
				id: id,
			},
		});
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		document.body.appendChild(tooltip);
	}

	return tooltip;
}

function positionTooltipAtCursor(id: string, x: number, y: number): void {
	const tooltip = ensureTooltip(id);
	const tipRect = tooltip.getBoundingClientRect();

	let left = x + 14;
	let top = y + 16;

	if (left + tipRect.width > window.innerWidth - 10) {
		left = x - tipRect.width - 12;
	}
	if (top + tipRect.height > window.innerHeight - 10) {
		top = y - tipRect.height - 12;
	}

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
	tooltip.classList.add("is-active");
}

function applyTooltipTheme(root: HTMLElement, tooltip: HTMLElement): void {
	const computed = getComputedStyle(root);
	tooltip.style.setProperty("--ts-heatmap-tooltip-fg", computed.getPropertyValue("--ts-heatmap-tooltip-current").trim());
	tooltip.style.setProperty("--ts-heatmap-tooltip-bg", computed.getPropertyValue("--ts-heatmap-tooltip-bg-current").trim());
}

function defaultTooltipRenderer(context: HeatmapCellContext & { visual: HeatmapCellStyle }): string {
	const entry = context.entry;
	const dateText = normalizeDate(context.date)
		? normalizeDate(context.date)!.toLocaleDateString(context.locale, {
			month: "short",
			day: "numeric",
		})
		: context.dateKey;

	if (!entry || (entry.total == null && entry.completed == null && entry.value == null && entry.label == null)) {
		return `<span class="ts-heatmap-tooltip__main">No data</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)}</span>`;
	}

	if (entry.total != null || entry.completed != null) {
		const level = ratioToLevel(entry.completed || 0, entry.total || 0);
		const percent = entry.total
			? Math.round((Number(entry.completed || 0) / Number(entry.total || 1)) * 100)
			: 0;

		return `<span class="ts-heatmap-tooltip__main"><b>${percent}%</b> completed</span><span class="ts-heatmap-tooltip__main">${htmlEscape(entry.completed || 0)}/${htmlEscape(entry.total || 0)} items</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)} · Lv${level}</span>`;
	}

	return `<span class="ts-heatmap-tooltip__main">${htmlEscape(entry.label != null ? entry.label : entry.value != null ? entry.value : "Has record")}</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)}</span>`;
}

// ============================================================================
// Cell Style Resolution
// ============================================================================

function resolveCellStyle(context: HeatmapCellContext & { getCellStyle?: HeatmapOptions["getCellStyle"] }): HeatmapCellStyle {
	const custom = typeof context.getCellStyle === "function"
		? context.getCellStyle(context)
		: null;

	if (typeof custom === "number") return { level: custom };
	if (typeof custom === "string") return { color: custom };
	if (custom && typeof custom === "object") return custom;

	if (context.entry && (context.entry.total != null || context.entry.completed != null)) {
		return { level: ratioToLevel(context.entry.completed || 0, context.entry.total || 0) };
	}

	if (context.entry && context.entry.level != null) {
		return { level: context.entry.level };
	}

	if (context.entry && context.entry.value != null) {
		const value = Number(context.entry.value);
		if (!Number.isNaN(value) && value > 0) {
			return { level: Math.min(MAX_LEVEL, Math.max(1, Math.ceil(value))) };
		}
	}

	return { level: 0 };
}

// ============================================================================
// Legend Rendering
// ============================================================================

function renderLegend(
	legendEl: HTMLElement,
	context: {
		theme: ThemeColors;
		locale: string;
	},
	legendOption: string | false | null | undefined,
	showLegend: boolean | undefined,
): void {
	const legendParts = parseLegend(legendOption);
	legendEl.textContent = "";

	if (showLegend === false || !legendParts) {
		legendEl.hidden = true;
		return;
	}

	legendEl.hidden = false;
	legendParts.forEach((item) => {
		legendEl.appendChild(
			item.type === "color"
				? createElement("span", {
					className: "ts-heatmap__legend-swatch",
					style: { backgroundColor: item.color },
				})
				: createElement("span", {
					className: "ts-heatmap__legend-text",
					text: item.text,
				}),
		);
	});
}

// ============================================================================
// Default Configuration
// ============================================================================

// ============================================================================
// Parts interface
// ============================================================================

export interface HeatmapInstance extends HTMLElement {
	/** Heatmap data. Setting triggers automatic refresh with debounce. */
	data: Record<string, number | HeatmapEntry> | Map<string, number | HeatmapEntry>;
	/** Start date. Setting triggers automatic refresh with debounce. */
	startDate: string | Date;
	/** End date. Setting triggers automatic refresh with debounce. */
	endDate: string | Date;
	/** Exposed parts. */
	parts: {
		months: HTMLElement;
		weeks: HTMLElement;
		grid: HTMLElement;
		body: HTMLElement;
		legend: HTMLElement;
		cells: HTMLElement[];
	};
	/** Manual refresh. */
	refresh: () => Promise<void>;
	/** Cleanup. */
	destroy: () => void;
	/** Utilities. */
	utils: {
		toDateKey: typeof toDateKey;
		normalizeDate: typeof normalizeDate;
		addDays: typeof addDays;
		alignToMonday: typeof alignToMonday;
		htmlEscape: typeof htmlEscape;
		ratioToLevel: typeof ratioToLevel;
	};
}

// ============================================================================
// Component Function
// ============================================================================

export function heatmap(options: HeatmapOptions = {}): HeatmapInstance {
	// Resolve configuration: default config + user options (like other components)
	const flags = { ...HEATMAP_DEFAULTS.flags, ...options.flags };
	const settings = { ...HEATMAP_DEFAULTS.settings, ...options.settings };
	const layout = { ...HEATMAP_DEFAULTS.layout, ...options.layout };
	const styles = options.styles || {};
	const colors: ThemeColors = {
		light: { ...HEATMAP_DEFAULTS.colors.light, ...options.colors?.light },
		dark: { ...HEATMAP_DEFAULTS.colors.dark, ...options.colors?.dark },
	};

	// Merge flat color overrides
	if (options.colors?.background) {
		colors.light.background = options.colors.background;
		colors.dark.background = options.colors.background;
	}
	if (options.colors?.text) {
		colors.light.text = options.colors.text;
		colors.dark.text = options.colors.text;
	}
	if (options.colors?.tooltip) {
		colors.light.tooltip = options.colors.tooltip;
		colors.dark.tooltip = options.colors.tooltip;
	}
	if (options.colors?.tooltipBg) {
		colors.light.tooltipBg = options.colors.tooltipBg;
		colors.dark.tooltipBg = options.colors.tooltipBg;
	}

	const locale = settings.locale;
	const tooltipId = settings.tooltipId || HEATMAP_DEFAULTS.settings.tooltipId;

	// Internal state (behind reactive property accessors)
	let _data = options.data;
	let _startDate = options.startDate;
	let _endDate = options.endDate;

	// Debounced refresh
	let refreshTimeout: number | null = null;

	function debouncedRefresh(): void {
		if (refreshTimeout) {
			window.clearTimeout(refreshTimeout);
		}
		refreshTimeout = window.setTimeout(() => {
			void renderGrid();
			refreshTimeout = null;
		}, 150);
	}

	// Create parts
	const monthsEl = createElement("div", {
		className: "ts-heatmap__months",
		style: styles.months,
	});
	const weeksEl = createElement("div", {
		className: "ts-heatmap__weeks",
		style: styles.weeks,
	});
	const gridEl = createElement("div", {
		className: "ts-heatmap__grid",
		style: styles.grid,
	});
	const bodyEl = createElement("div", {
		className: "ts-heatmap__body",
		children: [weeksEl, gridEl],
	});
	const legendEl = createElement("div", {
		className: "ts-heatmap__legend",
		style: styles.legend,
		attrs: { hidden: true },
	});

	// Create root
	const root = createElement("section", {
		className: ["ts-heatmap", options.className].filter(Boolean) as string[],
		style: {
			...styles.root,
			maxWidth: layout.maxWidth,
			"--ts-heatmap-cell-size": `${layout.cellSize}px`,
			"--ts-heatmap-cell-gap": `${layout.cellGap}px`,
			"--ts-heatmap-cell-radius": layout.cellRadius,
			"--ts-heatmap-week-label-width": layout.weekLabelWidth,
			"--ts-heatmap-week-label-gap": layout.weekLabelGap,
			"--ts-heatmap-month-label-height": layout.monthLabelHeight,
			"--ts-heatmap-month-offset": layout.monthOffset,
			"--ts-heatmap-grid-top-offset": layout.gridTopOffset,
			"--ts-heatmap-month-label-size": layout.monthLabelSize,
			"--ts-heatmap-week-label-size": layout.weekLabelSize,
			"--ts-heatmap-legend-gap": layout.legendGap,
			"--ts-heatmap-legend-top": layout.legendTop,
			"--ts-heatmap-legend-swatch-size": layout.legendSwatchSize,
			"--ts-heatmap-light-background": colors.light.background,
			"--ts-heatmap-dark-background": colors.dark.background,
			"--ts-heatmap-light-text": colors.light.text,
			"--ts-heatmap-dark-text": colors.dark.text,
			"--ts-heatmap-light-tooltip": colors.light.tooltip,
			"--ts-heatmap-dark-tooltip": colors.dark.tooltip,
			"--ts-heatmap-light-tooltip-bg": colors.light.tooltipBg,
			"--ts-heatmap-dark-tooltip-bg": colors.dark.tooltipBg,
		},
	});

	// Set level colors as CSS variables
	colors.light.levels.forEach((color, index) => {
		root.style.setProperty(`--ts-heatmap-light-level-${index}`, color);
	});
	colors.dark.levels.forEach((color, index) => {
		root.style.setProperty(`--ts-heatmap-dark-level-${index}`, color);
	});

	// Assemble structure
	root.appendChild(monthsEl);
	root.appendChild(bodyEl);
	root.appendChild(legendEl);

	// Sync theme class
	function syncThemeClass(): void {
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		root.classList.toggle("theme-dark", document.body.classList.contains("theme-dark"));
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		root.classList.toggle("theme-light", !document.body.classList.contains("theme-dark"));
	}

	syncThemeClass();

	// Render state
	const renderState = {
		destroyed: false,
		tooltipId,
	};

	// Cell storage
	const cells: HTMLElement[] = [];

	// Tooltip hide timeout
	let tooltipHideTimeout: number | null = null;

	// Clear tooltip with debounce
	function clearTooltip(): void {
		if (tooltipHideTimeout) {
			window.clearTimeout(tooltipHideTimeout);
			tooltipHideTimeout = null;
		}
		tooltipHideTimeout = window.setTimeout(() => {
			// eslint-disable-next-line obsidianmd/prefer-active-doc
			const tooltip = document.getElementById(renderState.tooltipId);
			if (tooltip) {
				tooltip.classList.remove("is-active");
			}
			tooltipHideTimeout = null;
		}, 50);
	}

	// Show tooltip content for a cell (rebuilds markup only when the hovered cell changes)
	function showTooltipContent(context: HeatmapCellContext, visual: HeatmapCellStyle): void {
		if (tooltipHideTimeout) {
			window.clearTimeout(tooltipHideTimeout);
			tooltipHideTimeout = null;
		}
		const tooltip = ensureTooltip(tooltipId);
		// eslint-disable-next-line no-unsanitized/property, @microsoft/sdl/no-inner-html
		tooltip.innerHTML = typeof options.renderTooltip === "function"
			? options.renderTooltip({ ...context, visual })
			: defaultTooltipRenderer({ ...context, visual });

		applyTooltipTheme(root, tooltip);
	}

	// Event delegation: chart-style tooltip that follows the pointer
	if (flags.showTooltip !== false) {
		let currentCell: HTMLElement | null = null;

		gridEl.addEventListener("mousemove", (event) => {
			const target = event.target as HTMLElement;
			const cell = target.closest<HTMLElement>(".ts-heatmap__cell");
			if (!cell || !cell.dataset.tooltipReady) {
				if (currentCell) {
					currentCell = null;
					clearTooltip();
				}
				return;
			}

			if (cell !== currentCell) {
				currentCell = cell;

				// Rebuild context for this cell
				const dateKey = cell.dataset.dateKey;
				if (!dateKey) return;

				const date = normalizeDate(dateKey);
				if (!date) return;

				// Parse entry from dataset
				let entry: HeatmapEntry | undefined;
				try {
					const entryData = cell.dataset.entry;
					if (entryData && entryData !== "null") {
						entry = JSON.parse(entryData) as HeatmapEntry;
					}
				} catch {
					entry = undefined;
				}

				const context: HeatmapCellContext = {
					entry,
					date,
					dateKey,
					theme: colors,
					locale,
				};

				// Get visual from cell classes
				const levelMatch = Array.from(cell.classList).find(c => c.startsWith("is-level-"));
				const level = levelMatch ? parseInt(levelMatch.replace("is-level-", ""), 10) : 0;
				const visual: HeatmapCellStyle = { level };

				showTooltipContent(context, visual);
			}

			// Follow the pointer (chart-tooltip behavior)
			positionTooltipAtCursor(tooltipId, event.clientX, event.clientY);
		});

		gridEl.addEventListener("mouseleave", () => {
			currentCell = null;
			clearTooltip();
		});
	}

	// Render week labels
	function renderWeekLabels(): void {
		weeksEl.textContent = "";
		weeksEl.hidden = flags.showWeekLabels === false;

		if (flags.showWeekLabels === false) {
			return;
		}

		(settings.weekLabels || HEATMAP_DEFAULTS.settings.weekLabels).forEach((label) => {
			weeksEl.appendChild(
				createElement("div", {
					className: "ts-heatmap__week-label",
					text: label,
				}),
			);
		});

		// Calculate actual width of week labels
		window.requestAnimationFrame(() => {
			if (weeksEl.hidden) return;

			// Find the widest week label
			let maxWidth = 0;
			const labels = weeksEl.querySelectorAll(".ts-heatmap__week-label");
			labels.forEach((label) => {
				const width = (label as HTMLElement).offsetWidth;
				if (width > maxWidth) maxWidth = width;
			});

			// Update weeks width and months margin-left
			if (maxWidth > 0) {
				const weeksWidth = `${maxWidth}px`;
				const monthsOffset = `${maxWidth + 8}px`;

				weeksEl.style.width = weeksWidth;
				monthsEl.style.marginLeft = monthsOffset;
			}
		});
	}

	// Build date range
	function buildRange(): { start: Date; end: Date; totalDays: number } {
		const end = normalizeDate(_endDate) || new Date();
		const mondayFirst = flags.mondayFirst !== false;

		if (settings.rangeMode === "fixed") {
			const rawStart = normalizeDate(_startDate) || addDays(end, -83);
			const start = mondayFirst ? alignToMonday(rawStart) : rawStart;
			return { start, end, totalDays: diffDays(start, end) + 1 };
		}

		if (settings.rangeMode === "year") {
			const startSeed = addDays(end, -(settings.fixedDays || 84) - 1);
			const start = mondayFirst ? alignToMonday(startSeed) : startSeed;
			return { start, end, totalDays: diffDays(start, end) + 1 };
		}

		// Adaptive mode
		const cellPitch = (layout.cellSize || 11) + (layout.cellGap || 2);
		const width = root.clientWidth || root.parentElement?.clientWidth || 0;
		const maxWeeks = Math.max(settings.minWeeks || 12, Math.round((Math.max(width, 280) - 40) / cellPitch));
		const rawStart = addDays(end, -(maxWeeks * 7));
		const start = mondayFirst ? alignToMonday(rawStart) : rawStart;

		return { start, end, totalDays: diffDays(start, end) + 1 };
	}

	// Resolve data
	async function resolveData(): Promise<Map<string, HeatmapEntry>> {
		if (typeof options.getData === "function") {
			const range = buildRange();
			const result = await options.getData({
				start: range.start,
				end: range.end,
				locale,
			});
			return normalizeMap(result);
		}

		return normalizeMap(_data);
	}

	// Render grid
	async function renderGrid(): Promise<void> {
		if (renderState.destroyed) {
			return;
		}

		syncThemeClass();
		renderWeekLabels();

		const range = buildRange();
		const dataMap = await resolveData();
		const current = cloneDate(range.start);
		const monthNames = settings.monthNames || HEATMAP_DEFAULTS.settings.monthNames;

		gridEl.textContent = "";
		monthsEl.textContent = "";
		monthsEl.hidden = flags.showMonthLabels === false;
		cells.length = 0;

		let monthIndex = -1;
		let slotsSinceLastLabel = 10;

		while (current <= range.end) {
			// Month label
			if (flags.showMonthLabels !== false) {
				const monthSlot = createElement("div", {
					className: "ts-heatmap__month-slot",
				});

				if (current.getMonth() !== monthIndex) {
					monthIndex = current.getMonth();
					if (slotsSinceLastLabel > 2) {
						monthSlot.appendChild(
							createElement("span", {
								className: "ts-heatmap__month-label",
								text: monthNames[monthIndex] || "",
							}),
						);
						slotsSinceLastLabel = 0;
					}
				}

				slotsSinceLastLabel += 1;
				monthsEl.appendChild(monthSlot);
			}

			// Week column
			const weekColumn = createElement("div", {
				className: "ts-heatmap__week-column",
			});

			for (let index = 0; index < 7; index += 1) {
				if (current > range.end) {
					break;
				}

				const date = cloneDate(current);
				const dateKey = toDateKey(date);
				const entry = dataMap.get(dateKey);
				const context: HeatmapCellContext = {
					entry,
					date,
					dateKey,
					theme: colors,
					locale,
				};

				const visual = resolveCellStyle({
					...context,
					getCellStyle: options.getCellStyle,
				});

				const safeLevel = Math.max(0, Math.min(MAX_LEVEL, Number(visual.level || 0)));
				const cell = createElement("div", {
					className: ["ts-heatmap__cell", `is-level-${safeLevel}`, visual.className].filter(Boolean) as string[],
					attrs: {
						"tabindex": "0",
					},
					style: {
						...(visual.color ? { backgroundColor: visual.color } : null),
						...(visual.borderColor ? { borderColor: visual.borderColor } : null),
						...visual.style,
					},
				});



				// Tooltip support - store context for event delegation
				if (flags.showTooltip !== false) {
					cell.dataset.tooltipReady = "true";
					cell.dataset.dateKey = dateKey;
					cell.dataset.entry = JSON.stringify(entry || null);
				}

				weekColumn.appendChild(cell);
				cells.push(cell);
				current.setDate(current.getDate() + 1);
			}

			gridEl.appendChild(weekColumn);
		}

		// Render legend
		renderLegend(
			legendEl,
			{
				theme: colors,
				locale,
			},
			settings.legend,
			flags.showLegend,
		);
	}

	// Resize observer
	const resizeObserver = typeof ResizeObserver === "function"
		? new ResizeObserver(() => {
			if ((root as unknown as Record<string, unknown>)._tsHeatmapResizeTimer) {
				window.clearTimeout((root as unknown as Record<string, unknown>)._tsHeatmapResizeTimer as number);
			}

			(root as unknown as Record<string, unknown>)._tsHeatmapResizeTimer = window.setTimeout(() => {
				void renderGrid();
			}, 120);
		})
		: null;

	if (resizeObserver) {
		resizeObserver.observe(root);
	}

	// Theme observer
	const themeObserver = typeof MutationObserver === "function"
		? new MutationObserver(() => {
			syncThemeClass();
			// eslint-disable-next-line obsidianmd/prefer-active-doc
			const tooltip = document.getElementById(tooltipId);
			if (tooltip) {
				applyTooltipTheme(root, tooltip);
			}
		})
		: null;

	if (themeObserver) {
		// eslint-disable-next-line obsidianmd/prefer-active-doc
		themeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	// Expose parts and methods
	const result = root as unknown as HeatmapInstance;
	result.parts = {
		months: monthsEl,
		weeks: weeksEl,
		grid: gridEl,
		body: bodyEl,
		legend: legendEl,
		cells,
	};

	result.refresh = async () => {
		await renderGrid();
	};

	result.destroy = () => {
		renderState.destroyed = true;
		if (refreshTimeout) {
			window.clearTimeout(refreshTimeout);
			refreshTimeout = null;
		}
		if (tooltipHideTimeout) {
			window.clearTimeout(tooltipHideTimeout);
			tooltipHideTimeout = null;
		}
		clearTooltip();
		if ((root as unknown as Record<string, unknown>)._tsHeatmapResizeTimer) {
			window.clearTimeout((root as unknown as Record<string, unknown>)._tsHeatmapResizeTimer as number);
		}
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
		if (themeObserver) {
			themeObserver.disconnect();
		}
	};

	result.utils = {
		toDateKey,
		normalizeDate,
		addDays,
		alignToMonday,
		htmlEscape,
		ratioToLevel,
	};

	// Reactive property accessors
	Object.defineProperty(result, "data", {
		get: () => _data,
		set(v: Record<string, number | HeatmapEntry> | Map<string, number | HeatmapEntry> | undefined) { _data = v; debouncedRefresh(); },
		enumerable: true, configurable: true,
	});

	Object.defineProperty(result, "startDate", {
		get: () => _startDate,
		set(v: string | Date | undefined) { _startDate = v; debouncedRefresh(); },
		enumerable: true, configurable: true,
	});

	Object.defineProperty(result, "endDate", {
		get: () => _endDate,
		set(v: string | Date | undefined) { _endDate = v; debouncedRefresh(); },
		enumerable: true, configurable: true,
	});

	// Initial render
	window.requestAnimationFrame(() => {
		void renderGrid();
	});

	return result;
}
