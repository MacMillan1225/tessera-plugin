/**
 * TesseraScript Obsidian Plugin
 * Modular component library for DataviewJS
 */

import { Notice, Plugin } from "obsidian";
import { card } from "./components/card/index";
import { heatmap } from "./components/heatmap/index";
import { progressbar } from "./components/progressbar/index";
import { example } from "./components/example/index";

// ============================================================================
// i18n Translations
// ============================================================================

interface Translations {
	settings: {
		title: string;
		description: string;
		usage: string;
		usageDesc: string;
		reloadNotice: string;
		reloadButton: string;
	};
	components: {
		card: { name: string; desc: string };
		heatmap: { name: string; desc: string };
		progressbar: { name: string; desc: string };
	};
	fields: Record<string, string>;
	groups: Record<string, string>;
}

const TRANSLATIONS: Record<string, Translations> = {
	en: {
		settings: {
			title: "TesseraScript Configuration",
			description: "Configure which components are available and their default settings.",
			usage: "Usage",
			usageDesc: "Use tessera components in your dataviewjs code blocks:",
			reloadNotice: "Settings saved. Click 'Apply & Reload' to apply changes.",
			reloadButton: "Apply & Reload",
		},
		components: {
			card: { name: "Card", desc: "General-purpose card component for dashboards and panels" },
			heatmap: { name: "Heatmap", desc: "GitHub-style contribution heatmap" },
			progressbar: { name: "Progressbar", desc: "Progress bar component for displaying progress" },
		},
		fields: {
			// Card
			"flags.showHeader": "Show Header",
			"flags.headerSep": "Header Separator",
			"flags.showTitle": "Show Title",
			"flags.showMeta": "Show Meta",
			"flags.showValue": "Show Value",
			"layout.maxWidth": "Max Width",
			"layout.padding": "Padding",
			"layout.radius": "Border Radius",
			"layout.gap": "Gap",
			"layout.bodyGap": "Body Gap",
			"colors.light.background": "Light Background",
			"colors.light.border": "Light Border",
			"colors.light.shadow": "Light Shadow",
			"colors.dark.background": "Dark Background",
			"colors.dark.border": "Dark Border",
			"colors.dark.shadow": "Dark Shadow",
			// Heatmap
			"flags.showWeekLabels": "Show Week Labels",
			"flags.showMonthLabels": "Show Month Labels",
			"flags.showLegend": "Show Legend",
			"flags.enableTooltip": "Enable Tooltip",
			"flags.mondayFirst": "Monday First",
			"settings.locale": "Locale",
			"settings.rangeMode": "Range Mode",
			"settings.minWeeks": "Min Weeks",
			"settings.fixedDays": "Fixed Days",
			"settings.legend": "Legend Template",
			"layout.cellSize": "Cell Size",
			"layout.cellGap": "Cell Gap",
			"layout.cellRadius": "Cell Radius",
			"layout.weekLabelWidth": "Week Label Width",
			"layout.monthLabelHeight": "Month Label Height",
			"layout.monthLabelSize": "Month Label Size",
			"layout.weekLabelSize": "Week Label Size",
			"colors.light.dayBg": "Light Day Background",
			"colors.light.tooltip": "Light Tooltip Text",
			"colors.light.tooltipBg": "Light Tooltip Background",
			"colors.dark.dayBg": "Dark Day Background",
			"colors.dark.tooltip": "Dark Tooltip Text",
			"colors.dark.tooltipBg": "Dark Tooltip Background",
			// Progressbar
			"showLabel": "Show Label",
			"labelFormat": "Label Format",
			"min": "Min Value",
			"max": "Max Value",
			"flags.showGlow": "Show Glow",
			"flags.striped": "Striped",
			"flags.animated": "Animated",
			"layout.width": "Width",
			"layout.height": "Height",
			"layout.trackOpacity": "Track Opacity",
			"colors.light.track": "Light Track Color",
			"colors.light.fill": "Light Fill Color",
			"colors.light.label": "Light Label Color",
			"colors.dark.track": "Dark Track Color",
			"colors.dark.fill": "Dark Fill Color",
			"colors.dark.label": "Dark Label Color",
		},
		groups: {
			"flags": "Flags",
			"layout": "Layout",
			"settings": "Settings",
			"colors": "Colors",
			"colors.light": "Light Theme",
			"colors.dark": "Dark Theme",
		},
	},
	zh: {
		settings: {
			title: "TesseraScript 配置",
			description: "配置可用的组件及其默认设置。",
			usage: "使用方法",
			usageDesc: "在 dataviewjs 代码块中使用 tessera 组件：",
			reloadNotice: "设置已保存。点击「应用并重载」以应用更改。",
			reloadButton: "应用并重载",
		},
		components: {
			card: { name: "卡片", desc: "用于仪表板和面板的通用卡片组件" },
			heatmap: { name: "热力图", desc: "GitHub 风格的贡献热力图" },
			progressbar: { name: "进度条", desc: "用于显示进度的进度条组件" },
		},
		fields: {
			// Card
			"flags.showHeader": "显示头部",
			"flags.headerSep": "头部分隔线",
			"flags.showTitle": "显示标题",
			"flags.showMeta": "显示元数据",
			"flags.showValue": "显示数值",
			"layout.maxWidth": "最大宽度",
			"layout.padding": "内边距",
			"layout.radius": "圆角半径",
			"layout.gap": "间距",
			"layout.bodyGap": "内容间距",
			"colors.light.background": "亮色背景",
			"colors.light.border": "亮色边框",
			"colors.light.shadow": "亮色阴影",
			"colors.dark.background": "暗色背景",
			"colors.dark.border": "暗色边框",
			"colors.dark.shadow": "暗色阴影",
			// Heatmap
			"flags.showWeekLabels": "显示周标签",
			"flags.showMonthLabels": "显示月份标签",
			"flags.showLegend": "显示图例",
			"flags.enableTooltip": "启用提示框",
			"flags.mondayFirst": "周一为起始日",
			"settings.locale": "语言区域",
			"settings.rangeMode": "范围模式",
			"settings.minWeeks": "最小周数",
			"settings.fixedDays": "固定天数",
			"settings.legend": "图例模板",
			"layout.cellSize": "单元格大小",
			"layout.cellGap": "单元格间距",
			"layout.cellRadius": "单元格圆角",
			"layout.weekLabelWidth": "周标签宽度",
			"layout.monthLabelHeight": "月份标签高度",
			"layout.monthLabelSize": "月份标签大小",
			"layout.weekLabelSize": "周标签大小",
			"colors.light.dayBg": "亮色日期背景",
			"colors.light.tooltip": "亮色提示文字",
			"colors.light.tooltipBg": "亮色提示背景",
			"colors.dark.dayBg": "暗色日期背景",
			"colors.dark.tooltip": "暗色提示文字",
			"colors.dark.tooltipBg": "暗色提示背景",
			// Progressbar
			"showLabel": "显示标签",
			"labelFormat": "标签格式",
			"min": "最小值",
			"max": "最大值",
			"flags.showGlow": "显示发光效果",
			"flags.striped": "条纹样式",
			"flags.animated": "动画效果",
			"layout.width": "宽度",
			"layout.height": "高度",
			"layout.trackOpacity": "轨道透明度",
			"colors.light.track": "亮色轨道颜色",
			"colors.light.fill": "亮色填充颜色",
			"colors.light.label": "亮色标签颜色",
			"colors.dark.track": "暗色轨道颜色",
			"colors.dark.fill": "暗色填充颜色",
			"colors.dark.label": "暗色标签颜色",
		},
		groups: {
			"flags": "标志",
			"layout": "布局",
			"settings": "设置",
			"colors": "颜色",
			"colors.light": "亮色主题",
			"colors.dark": "暗色主题",
		},
	},
	ja: {
		settings: {
			title: "TesseraScript 設定",
			description: "利用可能なコンポーネントとそのデフォルト設定を構成します。",
			usage: "使用方法",
			usageDesc: "dataviewjs コードブロックで tessera コンポーネントを使用：",
			reloadNotice: "設定が保存されました。「適用してリロード」をクリックして変更を適用してください。",
			reloadButton: "適用してリロード",
		},
		components: {
			card: { name: "カード", desc: "ダッシュボードとパネル用の汎用カードコンポーネント" },
			heatmap: { name: "ヒートマップ", desc: "GitHub スタイルの貢献ヒートマップ" },
			progressbar: { name: "プログレスバー", desc: "進捗を表示するプログレスバーコンポーネント" },
		},
		fields: {
			"flags.showHeader": "ヘッダーを表示",
			"flags.headerSep": "ヘッダー区切り",
			"flags.showTitle": "タイトルを表示",
			"flags.showMeta": "メタデータを表示",
			"flags.showValue": "値を表示",
			"layout.maxWidth": "最大幅",
			"layout.padding": "パディング",
			"layout.radius": "角の半径",
			"layout.gap": "間隔",
			"layout.bodyGap": "コンテンツ間隔",
			"colors.light.background": "ライト背景",
			"colors.light.border": "ライトボーダー",
			"colors.light.shadow": "ライトシャドウ",
			"colors.dark.background": "ダーク背景",
			"colors.dark.border": "ダークボーダー",
			"colors.dark.shadow": "ダークシャドウ",
			"flags.showWeekLabels": "週ラベルを表示",
			"flags.showMonthLabels": "月ラベルを表示",
			"flags.showLegend": "凡例を表示",
			"flags.enableTooltip": "ツールチップを有効化",
			"flags.mondayFirst": "月曜日開始",
			"settings.locale": "ロケール",
			"settings.rangeMode": "範囲モード",
			"settings.minWeeks": "最小週数",
			"settings.fixedDays": "固定日数",
			"settings.legend": "凡例テンプレート",
			"layout.cellSize": "セルサイズ",
			"layout.cellGap": "セル間隔",
			"layout.cellRadius": "セル角の半径",
			"layout.weekLabelWidth": "週ラベル幅",
			"layout.monthLabelHeight": "月ラベル高さ",
			"layout.monthLabelSize": "月ラベルサイズ",
			"layout.weekLabelSize": "週ラベルサイズ",
			"colors.light.dayBg": "ライト日付背景",
			"colors.light.tooltip": "ライトツールチップ文字",
			"colors.light.tooltipBg": "ライトツールチップ背景",
			"colors.dark.dayBg": "ダーク日付背景",
			"colors.dark.tooltip": "ダークツールチップ文字",
			"colors.dark.tooltipBg": "ダークツールチップ背景",
			"showLabel": "ラベルを表示",
			"labelFormat": "ラベル形式",
			"min": "最小値",
			"max": "最大値",
			"flags.showGlow": "グロー効果を表示",
			"flags.striped": "ストライプ",
			"flags.animated": "アニメーション",
			"layout.width": "幅",
			"layout.height": "高さ",
			"layout.trackOpacity": "トラック透明度",
			"colors.light.track": "ライトトラック色",
			"colors.light.fill": "ライト塗りつぶし色",
			"colors.light.label": "ライトラベル色",
			"colors.dark.track": "ダークトラック色",
			"colors.dark.fill": "ダーク塗りつぶし色",
			"colors.dark.label": "ダークラベル色",
		},
		groups: {
			"flags": "フラグ",
			"layout": "レイアウト",
			"settings": "設定",
			"colors": "カラー",
			"colors.light": "ライトテーマ",
			"colors.dark": "ダークテーマ",
		},
	},
};

// Helper to get translations based on Obsidian locale
function getTranslations(): Translations {
	// Get Obsidian's locale (e.g., "en", "zh", "ja", "ko", etc.)
	const locale = (window as any)?.moment?.locale?.() || "en";
	
	// Try exact match first, then language code, then fallback to English
	if (TRANSLATIONS[locale]) {
		return TRANSLATIONS[locale];
	}
	
	const langCode = locale.split("-")[0];
	if (TRANSLATIONS[langCode]) {
		return TRANSLATIONS[langCode];
	}
	
	return TRANSLATIONS.en!;
}

// ============================================================================
// Types
// ============================================================================

interface TesseraAPI {
	version: string;
	card: typeof card | undefined;
	heatmap: typeof heatmap | undefined;
	progressbar: typeof progressbar | undefined;
	example: typeof example;
}

interface ComponentConfig {
	enabled: boolean;
	config: Record<string, unknown>;
}

export interface PluginSettings {
	card: ComponentConfig;
	heatmap: ComponentConfig;
	progressbar: ComponentConfig;
}

// ============================================================================
// Settings Field Definitions (Easy to extend!)
// ============================================================================

type FieldType = "toggle" | "text" | "number" | "textarea";

interface SettingField {
	key: string;           // Path in config (e.g., "flags.showHeader")
	type: FieldType;       // Input type
	placeholder?: string;  // Optional placeholder
	description?: string;  // Optional description
}

interface ComponentDefinition {
	componentKey: string;  // Key for i18n lookup (e.g., "card")
	fields: SettingField[];
}

/**
 * Component settings definitions
 * -----------------------------------------------
 * To add a new field, simply add it to the appropriate component's `fields` array.
 * To add a new component, add a new entry to COMPONENTS.
 * 
 * Field types: "toggle", "text", "number", "textarea"
 * Key format: dot-notation path (e.g., "flags.showHeader", "layout.padding")
 * Labels are automatically translated via i18n
 */
const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
	card: {
		componentKey: "card",
		fields: [
			// Flags
			{ key: "flags.showHeader", type: "toggle" },
			{ key: "flags.headerSep", type: "toggle" },
			{ key: "flags.showTitle", type: "toggle" },
			{ key: "flags.showMeta", type: "toggle" },
			{ key: "flags.showValue", type: "toggle" },
			// Layout
			{ key: "layout.maxWidth", type: "text" },
			{ key: "layout.padding", type: "text" },
			{ key: "layout.radius", type: "text" },
			{ key: "layout.gap", type: "text" },
			{ key: "layout.bodyGap", type: "text" },
			// Colors (Light)
			{ key: "colors.light.background", type: "text" },
			{ key: "colors.light.border", type: "text" },
			{ key: "colors.light.shadow", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.background", type: "text" },
			{ key: "colors.dark.border", type: "text" },
			{ key: "colors.dark.shadow", type: "text" },
		],
	},
	heatmap: {
		componentKey: "heatmap",
		fields: [
			// Flags
			{ key: "flags.showWeekLabels", type: "toggle" },
			{ key: "flags.showMonthLabels", type: "toggle" },
			{ key: "flags.showLegend", type: "toggle" },
			{ key: "flags.enableTooltip", type: "toggle" },
			{ key: "flags.mondayFirst", type: "toggle" },
			// Settings
			{ key: "settings.locale", type: "text", placeholder: "zh-CN" },
			{ key: "settings.rangeMode", type: "text", placeholder: "adaptive" },
			{ key: "settings.minWeeks", type: "number" },
			{ key: "settings.fixedDays", type: "number" },
			{ key: "settings.legend", type: "text" },
			// Layout
			{ key: "layout.cellSize", type: "number" },
			{ key: "layout.cellGap", type: "number" },
			{ key: "layout.cellRadius", type: "text" },
			{ key: "layout.weekLabelWidth", type: "text" },
			{ key: "layout.monthLabelHeight", type: "text" },
			{ key: "layout.monthLabelSize", type: "text" },
			{ key: "layout.weekLabelSize", type: "text" },
			// Colors (Light)
			{ key: "colors.light.dayBg", type: "text" },
			{ key: "colors.light.tooltip", type: "text" },
			{ key: "colors.light.tooltipBg", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.dayBg", type: "text" },
			{ key: "colors.dark.tooltip", type: "text" },
			{ key: "colors.dark.tooltipBg", type: "text" },
		],
	},
	progressbar: {
		componentKey: "progressbar",
		fields: [
			// Basic
			{ key: "showLabel", type: "toggle" },
			{ key: "labelFormat", type: "text", placeholder: "{value}%" },
			{ key: "min", type: "number" },
			{ key: "max", type: "number" },
			// Flags
			{ key: "flags.showGlow", type: "toggle" },
			{ key: "flags.striped", type: "toggle" },
			{ key: "flags.animated", type: "toggle" },
			// Layout
			{ key: "layout.width", type: "text" },
			{ key: "layout.height", type: "text" },
			{ key: "layout.radius", type: "text" },
			{ key: "layout.trackOpacity", type: "number" },
			// Colors (Light)
			{ key: "colors.light.track", type: "text" },
			{ key: "colors.light.fill", type: "text" },
			{ key: "colors.light.label", type: "text" },
			// Colors (Dark)
			{ key: "colors.dark.track", type: "text" },
			{ key: "colors.dark.fill", type: "text" },
			{ key: "colors.dark.label", type: "text" },
		],
	},
};

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: PluginSettings = {
	card: {
		enabled: true,
		config: {
			flags: {
				showHeader: true,
				headerSep: true,
				showTitle: true,
				showMeta: true,
				showValue: true,
			},
			layout: {
				maxWidth: "100%",
				padding: "16px",
				radius: "16px",
				gap: "14px",
				bodyGap: "12px",
			},
			colors: {
				light: {
					background: "rgba(245, 248, 252, 0.9)",
					border: "rgba(120, 140, 160, 0.18)",
					shadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
				dark: {
					background: "rgba(30, 41, 59, 0.72)",
					border: "rgba(148, 163, 184, 0.18)",
					shadow: "0 16px 36px rgba(2, 6, 23, 0.28)",
					hoverAccent: "var(--interactive-accent)",
					value: "var(--text-accent, var(--text-normal))",
				},
			},
		},
	},
	heatmap: {
		enabled: true,
		config: {
			flags: {
				showWeekLabels: true,
				showMonthLabels: true,
				showLegend: true,
				enableTooltip: true,
				mondayFirst: true,
			},
			settings: {
				rangeMode: "adaptive",
				minWeeks: 12,
				fixedDays: 84,
				locale: "zh-CN",
				monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
				weekLabels: ["一", "", "三", "", "五", "", "日"],
				legend: "少 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 多",
				tooltipId: "ts-heatmap-tooltip",
			},
			layout: {
				maxWidth: "100%",
				cellSize: 11,
				cellGap: 2,
				cellRadius: "3px",
				weekLabelWidth: "20px",
				weekLabelGap: "9px",
				monthLabelHeight: "18px",
				monthOffset: "28px",
				gridTopOffset: "4px",
				monthLabelSize: "9px",
				weekLabelSize: "9px",
				legendGap: "3px",
				legendTop: "6px",
				legendSwatchSize: "9px",
			},
			colors: {
				light: {
					dayBg: "#f1f5f9",
					tooltip: "#ffffff",
					tooltipBg: "#0f172a",
					levels: ["#f1f5f9", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#14532d"],
				},
				dark: {
					dayBg: "#334155",
					tooltip: "#0f172a",
					tooltipBg: "#f1f5f9",
					levels: ["#334155", "#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
				},
			},
		},
	},
	progressbar: {
		enabled: true,
		config: {
			value: 0,
			max: 100,
			min: 0,
			showLabel: true,
			labelFormat: "{value}%",
			flags: {
				showGlow: true,
				striped: false,
				animated: false,
			},
			layout: {
				width: "100%",
				height: "8px",
				radius: "4px",
				trackOpacity: 0.2,
			},
			colors: {
				light: {
					track: "rgba(0, 0, 0, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
				dark: {
					track: "rgba(255, 255, 255, 0.08)",
					fill: "var(--interactive-accent)",
					label: "var(--text-normal)",
				},
			},
		},
	},
};

// ============================================================================
// Plugin Class
// ============================================================================

export default class TesseraPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Check if Dataview is available
		const appWithPlugins = this.app as unknown as { plugins?: { plugins?: Record<string, { api?: unknown }> } };
		const dataviewApi = appWithPlugins.plugins?.plugins?.["dataview"]?.api;
		if (!dataviewApi) {
			new Notice(
				"Dataview plugin is required. Please install and enable it.",
				5000
			);
			return;
		}

		// Create tessera API object with config injection
		const tessera: TesseraAPI = {
			version: "1.0.0",
			// Wrap each component to inject settings config as defaults
			card: this.settings.card.enabled 
				? ((options: any) => card({ ...this.settings.card.config, ...options }))
				: undefined,
			heatmap: this.settings.heatmap.enabled 
				? ((options: any) => heatmap({ ...this.settings.heatmap.config, ...options }))
				: undefined,
			progressbar: this.settings.progressbar.enabled 
				? ((options: any) => progressbar({ ...this.settings.progressbar.config, ...options }))
				: undefined,
			example,
		};

		// Mount to window
		(window as unknown as Record<string, unknown>).tessera = tessera;

		// Add commands
		this.addCommand({
			id: "tessera-check-status",
			name: "Check status",
			callback: () => {
				const components = [
					this.settings.card.enabled ? "card" : null,
					this.settings.heatmap.enabled ? "heatmap" : null,
					this.settings.progressbar.enabled ? "progressbar" : null,
					"example",
				].filter(Boolean);

				new Notice(
					`TesseraScript Status:\n` +
					`Dataview: ✓\n` +
					`Components: ${components.join(", ")}`,
					5000
				);
			},
		});

		// Add settings tab
		this.addSettingTab(new TesseraSettingTab(this.app, this));
	}

	onunload() {
		// Unmount from window
		delete (window as unknown as Record<string, unknown>).tessera;
	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = {
			card: {
				enabled: loaded?.card?.enabled ?? DEFAULT_SETTINGS.card.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.card.config, loaded?.card?.config),
			},
			heatmap: {
				enabled: loaded?.heatmap?.enabled ?? DEFAULT_SETTINGS.heatmap.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.heatmap.config, loaded?.heatmap?.config),
			},
			progressbar: {
				enabled: loaded?.progressbar?.enabled ?? DEFAULT_SETTINGS.progressbar.enabled,
				config: this.deepMerge(DEFAULT_SETTINGS.progressbar.config, loaded?.progressbar?.config),
			},
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private deepMerge(target: Record<string, unknown>, source?: Record<string, unknown>): Record<string, unknown> {
		if (!source) return { ...target };
		
		const result = { ...target };
		for (const key of Object.keys(source)) {
			if (
				source[key] && 
				typeof source[key] === "object" && 
				!Array.isArray(source[key]) &&
				target[key] && 
				typeof target[key] === "object" && 
				!Array.isArray(target[key])
			) {
				result[key] = this.deepMerge(
					target[key] as Record<string, unknown>,
					source[key] as Record<string, unknown>
				);
			} else {
				result[key] = source[key];
			}
		}
		return result;
	}
}

// ============================================================================
// Settings Tab
// ============================================================================

import { App, PluginSettingTab, Setting } from "obsidian";

class TesseraSettingTab extends PluginSettingTab {
	plugin: TesseraPlugin;
	private collapsedSections: Set<string> = new Set();
	private needsReload = false;
	private t: Translations;
	private reloadButtonEl: HTMLElement | null = null;

	constructor(app: App, plugin: TesseraPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.t = getTranslations();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		this.needsReload = false;
		this.reloadButtonEl = null;

		// Add custom styles for collapsible sections
		this.addCustomStyles();

		// Header
		new Setting(containerEl).setName(this.t.settings.title).setHeading();
		containerEl.createEl("p", {
			text: this.t.settings.description,
			cls: "tessera-settings-desc",
		});

		// Reload button (hidden by default)
		const reloadSetting = new Setting(containerEl);
		reloadSetting.setName(this.t.settings.reloadButton);
		reloadSetting.setDesc(this.t.settings.reloadNotice);
		reloadSetting.addButton((btn) => {
			btn.setButtonText(this.t.settings.reloadButton);
			btn.setCta();
			btn.onClick(() => {
				// @ts-ignore - Internal Obsidian API
				this.app.commands.executeCommandById("app:reload");
			});
			this.reloadButtonEl = btn.buttonEl;
			// Hide initially
			btn.buttonEl.style.display = "none";
		});

		// Render each component as a collapsible section
		for (const [key, definition] of Object.entries(COMPONENTS)) {
			this.renderCollapsibleSection(
				containerEl,
				key as keyof PluginSettings,
				definition
			);
		}

		// Usage section
		new Setting(containerEl).setName(this.t.settings.usage).setHeading();
		containerEl.createEl("p", {
			text: this.t.settings.usageDesc,
		});
		const codeBlock = containerEl.createEl("pre", { cls: "tessera-code-block" });
		codeBlock.createEl("code", {
			text: `dv.container.appendChild(tessera.card({
  title: "Hello",
  value: 42
}));`,
		});
	}

	private showReloadButton(): void {
		if (this.reloadButtonEl) {
			this.reloadButtonEl.style.display = "block";
			this.needsReload = true;
		}
	}

	private renderCollapsibleSection(
		containerEl: HTMLElement,
		key: keyof PluginSettings,
		definition: ComponentDefinition
	): void {
		const componentConfig = this.plugin.settings[key];
		const isCollapsed = this.collapsedSections.has(key);
		const componentI18n = this.t.components[definition.componentKey as keyof typeof this.t.components];

		// Create section container
		const section = containerEl.createDiv({ cls: "tessera-settings-section" });

		// Use Obsidian Setting API for the header (with built-in toggle)
		const headerSetting = new Setting(section);
		headerSetting.setName(componentI18n.name);
		headerSetting.setDesc(componentI18n.desc);

		// Add collapse button
		const collapseBtn = document.createElement("span");
		collapseBtn.className = "tessera-collapse-btn";
		collapseBtn.textContent = isCollapsed ? "▶" : "▼";
		collapseBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (this.collapsedSections.has(key)) {
				this.collapsedSections.delete(key);
			} else {
				this.collapsedSections.add(key);
			}
			this.display();
		});
		headerSetting.settingEl.prepend(collapseBtn);

		// Add toggle using Obsidian's API
		headerSetting.addToggle((toggle) => {
			toggle.setValue(componentConfig.enabled);
			toggle.onChange(async (value) => {
				this.plugin.settings[key].enabled = value;
				await this.plugin.saveSettings();
				this.showReloadButton();
				this.display();
			});
		});

		// Collapsible content
		if (!isCollapsed && componentConfig.enabled) {
			const content = section.createDiv({ cls: "tessera-settings-content" });
			this.renderFields(content, componentConfig.config, definition.fields);
		}
	}

	private renderFields(
		container: HTMLElement,
		config: Record<string, unknown>,
		fields: SettingField[]
	): void {
		// Group fields by their prefix (e.g., "flags", "layout", "settings", "colors.light")
		const groups = new Map<string, SettingField[]>();
		
		for (const field of fields) {
			const parts = field.key.split(".");
			const groupKey = parts.length > 1 ? parts.slice(0, -1).join(".") : "_root";
			
			if (!groups.has(groupKey)) {
				groups.set(groupKey, []);
			}
			groups.get(groupKey)!.push(field);
		}

		// Render each group
		for (const [groupKey, groupFields] of groups) {
			if (groupKey !== "_root") {
				const groupHeader = container.createDiv({ cls: "tessera-group-header" });
				const groupLabel = this.t.groups[groupKey] || this.formatGroupLabel(groupKey);
				groupHeader.createEl("span", { text: groupLabel });
			}

			for (const field of groupFields) {
				this.renderField(container, config, field);
			}
		}
	}

	private renderField(
		container: HTMLElement,
		config: Record<string, unknown>,
		field: SettingField
	): void {
		const fieldLabel = this.t.fields[field.key] || field.key;
		const setting = new Setting(container);
		setting.setName(fieldLabel);
		if (field.description) {
			setting.setDesc(field.description);
		}

		const currentValue = this.getNestedValue(config, field.key);

		switch (field.type) {
			case "toggle":
				setting.addToggle((toggle) => {
					toggle.setValue(Boolean(currentValue));
					toggle.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				break;

			case "text":
			case "number":
				setting.addText((text) => {
					text.setValue(String(currentValue ?? ""));
					if (field.placeholder) {
						text.setPlaceholder(field.placeholder);
					}
					text.onChange(async (value) => {
						if (field.type === "number") {
							const num = Number(value);
							this.setNestedValue(config, field.key, isNaN(num) ? value : num);
						} else {
							this.setNestedValue(config, field.key, value);
						}
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				break;

			case "textarea":
				setting.addTextArea((textarea) => {
					textarea.setValue(String(currentValue ?? ""));
					if (field.placeholder) {
						textarea.setPlaceholder(field.placeholder);
					}
					textarea.onChange(async (value) => {
						this.setNestedValue(config, field.key, value);
						await this.plugin.saveSettings();
						this.showReloadButton();
					});
				});
				break;
		}
	}

	private formatGroupLabel(key: string): string {
		return key
			.split(".")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" › ");
	}

	private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
		const parts = path.split(".");
		let current: unknown = obj;
		for (const part of parts) {
			if (current == null || typeof current !== "object") {
				return undefined;
			}
			current = (current as Record<string, unknown>)[part];
		}
		return current;
	}

	private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
		const parts = path.split(".");
		let current = obj;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!part) continue;
			
			if (current[part] == null || typeof current[part] !== "object") {
				current[part] = {};
			}
			current = current[part] as Record<string, unknown>;
		}
		const lastPart = parts[parts.length - 1];
		if (lastPart) {
			current[lastPart] = value;
		}
	}

	private addCustomStyles(): void {
		const styleId = "tessera-settings-styles";
		if (document.getElementById(styleId)) return;

		const style = document.createElement("style");
		style.id = styleId;
		style.textContent = `
			.tessera-settings-desc {
				color: var(--text-muted);
				margin-bottom: 16px;
			}

			.tessera-settings-section {
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				margin-bottom: 12px;
				overflow: hidden;
			}

			.tessera-settings-section .setting-item {
				border: none;
			}

			.tessera-collapse-btn {
				cursor: pointer;
				margin-right: 8px;
				font-size: 10px;
				color: var(--text-muted);
				user-select: none;
				width: 16px;
				display: inline-block;
			}

			.tessera-collapse-btn:hover {
				color: var(--text-normal);
			}

			.tessera-settings-content {
				padding: 0 16px 16px;
			}

			.tessera-settings-content .setting-item {
				border-top: 1px solid var(--background-modifier-border);
			}

			.tessera-group-header {
				font-size: 11px;
				font-weight: 600;
				color: var(--text-muted);
				text-transform: uppercase;
				letter-spacing: 0.5px;
				padding: 12px 0 4px;
				margin-top: 8px;
			}

			.tessera-group-header:first-child {
				margin-top: 0;
				padding-top: 4px;
			}

			.tessera-code-block {
				background: var(--background-secondary);
				padding: 12px;
				border-radius: 6px;
				overflow-x: auto;
			}
		`;
		document.head.appendChild(style);
	}
}
