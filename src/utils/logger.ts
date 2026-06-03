/**
 * TesseraScript Logger
 * Provides consistent logging with prefixes
 */

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 4,
}

class Logger {
	private prefix = "[Tessera]";
	private level: LogLevel = LogLevel.DEBUG;

	setLevel(level: LogLevel): void {
		this.level = level;
	}

	debug(...args: any[]): void {
		if (this.level <= LogLevel.DEBUG) {
			console.debug(this.prefix, ...args);
		}
	}

	info(...args: any[]): void {
		if (this.level <= LogLevel.INFO) {
			console.log(this.prefix, ...args);
		}
	}

	warn(...args: any[]): void {
		if (this.level <= LogLevel.WARN) {
			console.warn(this.prefix, ...args);
		}
	}

	error(...args: any[]): void {
		if (this.level <= LogLevel.ERROR) {
			console.error(this.prefix, ...args);
		}
	}
}

export const logger = new Logger();
export default logger;
