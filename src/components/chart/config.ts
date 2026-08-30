/**
 * TesseraScript Chart Component Defaults (ADR-0005)
 * Lieflat mono style: INK #1C1C1A / PAPER #F0EFEB / MUTED #8F8E88 / GRID #DEDDD6
 * Dark: bg #1C1C1A / ink #F0EFEB / muted #8F8E88 / grid #2E2D29
 */

// Shared mono palette tokens (from lieflat-charts mono-tokens.js)
const LIGHT_SERIES = ["#1C1C1A", "#8F8E88", "#B0AFA9", "#D8D7D1", "#6A6963"];
const DARK_SERIES = ["#F0EFEB", "#8F8E88", "#B0AFA9", "#55554F", "#C6C5BF"];

export const LINE_DEFAULTS = {
	data: { labels: [] as string[], values: [] as number[] },
	flags: {
		showLegend: false,
		showTooltip: true,
		showGrid: true,
		smooth: false,
		area: false,
	},
	layout: {
		maxWidth: "100%",
		height: "240px",
		/** Data point diameter in px (auto/default 5). */
		symbolSize: 5,
		/** Line stroke width in px (auto/default 2). */
		lineWidth: 2,
		/** Grid insets (px) — control the distance between axes and canvas edges. */
		gridLeft: 8,
		gridRight: 12,
		gridTop: 28,
		gridBottom: 4,
	},
	colors: {
		light: {
			text: "#8F8E88",
			grid: "#DEDDD6",
			accent: "#1C1C1A",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#8F8E88",
			grid: "#2E2D29",
			accent: "#F0EFEB",
			series: DARK_SERIES,
		},
	},
} as const;

export const BAR_DEFAULTS = {
	data: { labels: [] as string[], values: [] as number[] },
	flags: {
		showLegend: false,
		showTooltip: true,
		showGrid: true,
	},
	layout: {
		maxWidth: "100%",
		height: "240px",
		/** Max bar width in px (auto/default 28). */
		barMaxWidth: 28,
		/** Bar corner radius in px (Lieflat chunky: rounded tops, default 6). */
		barRadius: 6,
		/** Grid insets (px) — control the distance between axes and canvas edges. */
		gridLeft: 8,
		gridRight: 12,
		gridTop: 28,
		gridBottom: 4,
	},
	colors: {
		light: {
			text: "#8F8E88",
			grid: "#DEDDD6",
			accent: "#1C1C1A",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#8F8E88",
			grid: "#2E2D29",
			accent: "#F0EFEB",
			series: DARK_SERIES,
		},
	},
} as const;

export const GAUGE_DEFAULTS = {
	/** Progress value as a ratio 0..1 (e.g. 0.73 = 73%). */
	value: 0,
	/** Center label shown under the big number. */
	label: "",
	flags: {
		showLabel: true,
		showTicks: true,
		showTooltip: true,
	},
	layout: {
		maxWidth: "100%",
		height: "220px",
	},
	colors: {
		light: {
			text: "#8F8E88",
			track: "#DEDDD6",
			accent: "#1C1C1A",
		},
		dark: {
			text: "#8F8E88",
			track: "#2E2D29",
			accent: "#F0EFEB",
		},
	},
} as const;

export const ROSE_DEFAULTS = {
	data: { labels: [] as string[], values: [] as number[] },
	flags: {
		showLegend: false,
		showTooltip: true,
		showLabels: true,
	},
	layout: {
		maxWidth: "100%",
		height: "240px",
	},
	colors: {
		light: {
			text: "#8F8E88",
			accent: "#1C1C1A",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#8F8E88",
			accent: "#F0EFEB",
			series: DARK_SERIES,
		},
	},
} as const;

export const RADAR_DEFAULTS = {
	data: { labels: [] as string[], values: [] as number[] },
	flags: {
		showLegend: false,
		showTooltip: true,
		showLabels: true,
		/** Fill the radar polygons with a translucent accent. */
		showArea: true,
		/** Draw axis lines from center to each corner. */
		showAxes: true,
	},
	layout: {
		maxWidth: "100%",
		height: "260px",
		/** Radar polygon stroke width in px (auto/default 2). */
		lineWidth: 2,
		/** Data point diameter in px (auto/default 3). */
		symbolSize: 3,
	},
	colors: {
		light: {
			text: "#8F8E88",
			grid: "#DEDDD6",
			accent: "#1C1C1A",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#8F8E88",
			grid: "#2E2D29",
			accent: "#F0EFEB",
			series: DARK_SERIES,
		},
	},
} as const;