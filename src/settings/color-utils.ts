/**
 * Color utility functions for settings
 */

// ============================================================================
// Color Conversion
// ============================================================================

/**
 * Convert rgba string to hex color
 * @example rgbaToHex("rgba(255, 128, 0, 0.5)") => "#ff8000"
 */
export function rgbaToHex(rgba: string): string {
	// If already hex, return as-is
	if (rgba.startsWith("#")) {
		return rgba.length === 4 
			? "#" + rgba[1] + rgba[1] + rgba[2] + rgba[2] + rgba[3] + rgba[3]
			: rgba;
	}
	
	// Parse rgba/rgb
	const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
	if (!match) return "#000000";
	
	const r = parseInt(match[1]!).toString(16).padStart(2, "0");
	const g = parseInt(match[2]!).toString(16).padStart(2, "0");
	const b = parseInt(match[3]!).toString(16).padStart(2, "0");
	
	return `#${r}${g}${b}`;
}

/**
 * Convert hex color to rgba string
 * @example hexToRgba("#ff8000", 0.5) => "rgba(255, 128, 0, 0.5)"
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return hex;
	
	const r = parseInt(result[1]!, 16);
	const g = parseInt(result[2]!, 16);
	const b = parseInt(result[3]!, 16);
	
	return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extract alpha from rgba string
 * @example extractAlpha("rgba(255, 128, 0, 0.5)") => 0.5
 */
export function extractAlpha(rgba: string): number {
	const match = rgba.match(/rgba\([^)]+,\s*([\d.]+)\)/);
	return match ? parseFloat(match[1]!) : 1;
}

/**
 * Check if a value looks like a CSS color
 */
export function isColorLike(value: unknown): boolean {
	if (typeof value !== "string") return false;
	return (
		value.startsWith("#") ||
		value.startsWith("rgb") ||
		value.startsWith("hsl") ||
		/^[a-f0-9]{6}$/i.test(value)
	);
}
