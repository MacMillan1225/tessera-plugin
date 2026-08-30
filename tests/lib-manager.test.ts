import { describe, it, expect, vi, beforeEach } from "vitest";
import { LibManager, MANAGED_LIBS } from "../src/lib-manager";
import type { LibManagerOptions, ThirdPartyLib } from "../src/lib-manager";

// Mock obsidian's requestUrl + Notice before importing the module under test
const requestUrlMock = vi.hoisted(() => vi.fn());
const noticeMock = vi.hoisted(() => vi.fn());

vi.mock("obsidian", () => ({
	requestUrl: requestUrlMock,
	Notice: noticeMock,
}));

// Adapter fakes: cast through unknown so vitest Mock types satisfy the
// structural LibManagerOptions["adapter"] contract without friction.
type AdapterFns = {
	exists: (path: string) => Promise<boolean>;
	mkdir: (path: string) => Promise<void>;
	writeBinary: (path: string, data: ArrayBuffer) => Promise<void>;
	read: (path: string) => Promise<string>;
	remove: (path: string) => Promise<void>;
	trashLocal?: (path: string) => Promise<void>;
};

function makeAdapter(initial: Record<string, ArrayBuffer | string> = {}): AdapterFns {
	const files = new Map<string, ArrayBuffer | string>(Object.entries(initial));
	return {
		exists: vi.fn(async (path: string) => files.has(path)) as unknown as AdapterFns["exists"],
		mkdir: vi.fn(async () => {}) as unknown as AdapterFns["mkdir"],
		writeBinary: vi.fn(async (path: string, data: ArrayBuffer) => {
			files.set(path, data);
		}) as unknown as AdapterFns["writeBinary"],
		read: vi.fn(async (path: string) => String(files.get(path) ?? "")) as unknown as AdapterFns["read"],
		remove: vi.fn(async (path: string) => {
			files.delete(path);
		}) as unknown as AdapterFns["remove"],
		trashLocal: vi.fn(async (path: string) => {
			files.delete(path);
		}) as unknown as AdapterFns["trashLocal"],
	};
}

describe("LibManager", () => {
	const echarts = MANAGED_LIBS[0]!;
	let adapter: AdapterFns;
	let onChanged: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		adapter = makeAdapter();
		onChanged = vi.fn();
		requestUrlMock.mockReset();
	});

	function makeManager() {
		return new LibManager({
			pluginDir: ".obsidian/plugins/tessera-plugin",
			adapter: adapter as LibManagerOptions["adapter"],
			libs: MANAGED_LIBS,
			onChanged: onChanged as (lib: ThirdPartyLib) => void,
		});
	}

	it("computes the lib path inside the plugin lib/ folder", () => {
		const manager = makeManager();
		expect(manager.libPath(echarts)).toBe(".obsidian/plugins/tessera-plugin/lib/echarts.min.js");
	});

	it("handles empty pluginDir gracefully", () => {
		const manager = new LibManager({ pluginDir: "", adapter, libs: MANAGED_LIBS });
		expect(manager.libPath(echarts)).toBe("lib/echarts.min.js");
	});

	it("reports missing when the file does not exist", async () => {
		const manager = makeManager();
		expect(await manager.status(echarts)).toBe("missing");
		expect(await manager.isInstalled(echarts.id)).toBe(false);
	});

	it("reports installed when the file exists", async () => {
		adapter = makeAdapter({ ".obsidian/plugins/tessera-plugin/lib/echarts.min.js": "x" });
		const manager = makeManager();
		expect(await manager.status(echarts)).toBe("installed");
		expect(await manager.isInstalled(echarts.id)).toBe(true);
	});

	it("downloads from the CDN URL and writes the file", async () => {
		requestUrlMock.mockResolvedValue({ status: 200, arrayBuffer: new ArrayBuffer(8) });
		const manager = makeManager();

		expect(manager.downloadUrl(echarts)).toContain("echarts@6.1.0");

		await manager.download(echarts);

		expect(requestUrlMock).toHaveBeenCalledWith(
			expect.objectContaining({ url: expect.stringContaining("cdn.jsdelivr.net") })
		);
		expect(adapter.mkdir).toHaveBeenCalledWith(
			".obsidian/plugins/tessera-plugin/lib"
		);
		expect(adapter.writeBinary).toHaveBeenCalledWith(
			".obsidian/plugins/tessera-plugin/lib/echarts.min.js",
			expect.any(ArrayBuffer)
		);
		expect(onChanged).toHaveBeenCalledWith(echarts);
	});

	it("throws on non-2xx download response and does not write", async () => {
		requestUrlMock.mockResolvedValue({ status: 404, arrayBuffer: new ArrayBuffer(0) });
		const manager = makeManager();

		await expect(manager.download(echarts)).rejects.toThrow(/HTTP 404/);
		expect(adapter.writeBinary).not.toHaveBeenCalled();
		expect(onChanged).not.toHaveBeenCalled();
	});

	it("removes via trashLocal and fires onChanged", async () => {
		adapter = makeAdapter({ ".obsidian/plugins/tessera-plugin/lib/echarts.min.js": "x" });
		const manager = makeManager();

		await manager.remove(echarts);

		expect(adapter.trashLocal).toHaveBeenCalledWith(
			".obsidian/plugins/tessera-plugin/lib/echarts.min.js"
		);
		expect(onChanged).toHaveBeenCalledWith(echarts);
		expect(await manager.status(echarts)).toBe("missing");
	});

	it("falls back to remove when trashLocal is unavailable", async () => {
		adapter = makeAdapter();
		const { trashLocal, ...noTrash } = adapter;
		const manager = new LibManager({
			pluginDir: ".obsidian/plugins/tessera-plugin",
			adapter: noTrash as LibManagerOptions["adapter"],
			libs: MANAGED_LIBS,
		});
		vi.mocked(noTrash.remove).mockClear();

		await manager.remove(echarts);

		expect(noTrash.remove).toHaveBeenCalled();
	});

	it("downloadById throws for unknown lib ids", async () => {
		const manager = makeManager();
		await expect(manager.downloadById("nonexistent")).rejects.toThrow(/Unknown library/);
	});

	it("exposes managedLibs for settings UI iteration", () => {
		const manager = makeManager();
		expect(manager.managedLibs).toHaveLength(1);
		expect(manager.managedLibs[0]?.id).toBe("echarts");
	});
});