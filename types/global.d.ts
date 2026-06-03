/**
 * Global type declarations for TesseraScript
 */

import type { TesseraObject } from "./tessera";

declare global {
	interface Window {
		Tessera?: TesseraObject;
	}

	interface GlobalThis {
		Tessera?: TesseraObject;
	}

	// CSS module declarations
	declare module "*.css" {
		const content: string;
		export default content;
	}

	// JSON module declarations
	declare module "*.json" {
		const value: any;
		export default value;
	}
}

export {};
