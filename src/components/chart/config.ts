/**
 * TesseraScript Chart Component Defaults (ADR-0005)
 * Minimal black & white (zinc neutral): INK #18181B / PAPER #FFFFFF / MUTED #71717A / GRID #E4E4E7
 * Dark: card #26262B / ink #FAFAFA / muted #A1A1AA / grid #3F3F46
 */

// Shared neutral palette tokens (premium monochrome, zinc scale)
const LIGHT_SERIES = ["#18181B", "#71717A", "#A1A1AA", "#D4D4D8", "#52525B"];
const DARK_SERIES = ["#FAFAFA", "#A1A1AA", "#71717A", "#52525B", "#D4D4D8"];

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
			text: "#71717A",
			grid: "#E4E4E7",
			accent: "#18181B",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#A1A1AA",
			grid: "#3F3F46",
			accent: "#FAFAFA",
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
			text: "#71717A",
			grid: "#E4E4E7",
			accent: "#18181B",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#A1A1AA",
			grid: "#3F3F46",
			accent: "#FAFAFA",
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
			text: "#71717A",
			track: "#E4E4E7",
			accent: "#18181B",
		},
		dark: {
			text: "#A1A1AA",
			track: "#3F3F46",
			accent: "#FAFAFA",
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
			text: "#71717A",
			accent: "#18181B",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#A1A1AA",
			accent: "#FAFAFA",
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
			text: "#71717A",
			grid: "#E4E4E7",
			accent: "#18181B",
			series: LIGHT_SERIES,
		},
		dark: {
			text: "#A1A1AA",
			grid: "#3F3F46",
			accent: "#FAFAFA",
			series: DARK_SERIES,
		},
	},
} as const;
