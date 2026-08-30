# TesseraScript 插件开发指南（AGENTS.md）

## 项目概述

TesseraScript 是 Obsidian 组件库插件：在 `dataviewjs` 代码块中通过 `window.tessera` 全局对象调用组件（卡片、热力图、进度条、列表、标签、折线/柱状/刻度盘/玫瑰/雷达图），快速搭建个人看板。

- **入口**：`src/main.ts` → `main.js`（esbuild 打包，Obsidian 加载）
- **发布产物**：`main.js` + `manifest.json` + `styles.css` + `lib/echarts.min.js`
- **硬依赖**：Dataview 插件（缺失时 `onload` 提示并退出）
- **视觉风格**：Lieflat 单色克制风（ADR-0001）：无边框靠背景色差分层、大圆角、hover 克制、自动适配明暗主题
- **文档**：`docs/README.md`（用户手册）、`docs/ARCHITECTURE.md`（架构）、`docs/CONFIGURATION.md`（全部配置字段）、`docs/decisions/`（ADR-0001~0005）、`docs/COMPONENT_DEVELOPMENT_GUIDE.md`（新增组件教程）

## 环境与命令

- Node.js 18+，npm
- `npm run dev`：watch 模式（esbuild）
- `npm run build`：tsc 类型检查 + esbuild 生产打包（**tsc 失败会短路，不产出 main.js**）
- `npm run lint`：eslint（obsidianmd 规则集，零警告是硬要求）
- 版本发布：`npm version <x.y.z>`（触发 version-bump.mjs 同步 manifest/versions.json）→ 打 tag → GitHub Release（release.yml 自动构建并附带 lib/）

## 目录结构

```
src/
├── main.ts                    # 生命周期 + window.tessera 构建 + 设置注册（保持精简）
├── components/
│   ├── core/                  # tessera.core.{card,heatmap,progressbar,list,tags}
│   │   ├── <name>.ts          # 每个组件一个文件（工厂函数 + 类型）
│   │   ├── config.ts          # 全部 core 组件的默认配置（单一数据源）
│   │   └── index.ts           # barrel re-export
│   └── chart/                 # tessera.chart.{line,bar,gauge,rose,radar}
│       ├── loader.ts          # ECharts UMD 懒加载（<script> 注入，单例缓存）
│       ├── shared.ts          # createChartBase 公共生命周期 + lieflatTooltip
│       ├── config.ts          # 全部图表默认配置
│       ├── index.ts           # createChartGroup 工厂
│       └── <name>.ts          # 每个图表一个文件
├── settings/
│   ├── types.ts               # PluginSettings / TesseraAPI / 组件类型
│   ├── fields.ts              # COMPONENTS 字段定义 + GROUPS + DEFAULT_SETTINGS
│   ├── settings-tab.ts        # 设置面板（分组→组件→字段层级渲染）
│   ├── i18n.ts / color-utils.ts
├── i18n/{en,ja,zh}.json       # 三语设置界面文案
└── utils/dom.ts               # createElement 等 DOM 工具
types/global.d.ts              # window.tessera 全局类型
lib/echarts.min.js             # ECharts UMD（vendored，运行时懒加载，不入 bundle）
styles.css                     # 全部组件样式（ts- 前缀）+ 设置面板样式（tessera- 前缀）
skills/tessera-dashboard/      # AI skill：让 AI 基于本插件生成看板
examples/DASHBOARDS.md         # 可直接运行的完整看板示例
```

## 核心约定（改代码前必读）

### 组件工厂模式（core 组件）
每个组件是一个 `export function <name>(options): <Name>Instance`：
1. `const flags = { ...X_DEFAULTS.flags, ...options.flags }`（三段合并：flags/layout/colors，其余直接取）
2. 用 `createElement`（src/utils/dom.ts）构建 DOM；根元素带 `ts-<name>` class
3. 颜色经 `resolveThemeColors`（共享键 background/border/text/accent + 主题拆分）
4. 响应式属性用 `Object.defineProperty(instance, "key", { get, set })`，set 触发重渲染
5. 暴露 `.parts`（内部 DOM 引用）与 `.destroy()`（清理 observer/timer）
6. 主题切换用 `MutationObserver(document.body, { attributeFilter: ["class"] })`

### 图表组件模式（chart 分组）
复用 `createChartBase`（shared.ts）：自动处理懒加载/init/主题/ResizeObserver/destroy。只需：
1. `build<Name>Option(...): EChartsOption` 纯函数
2. 工厂内 `createChartBase({ className, maxWidth, height, colors, buildOption })`
3. tooltip 统一 `lieflatTooltip(theme)`；数据统一 `ChartData { labels, values, series? }`

### 新增组件六步（详见 COMPONENT_DEVELOPMENT_GUIDE.md）
1. `config.ts` 加 `X_DEFAULTS`（`as const`，语义键）→ 组件文件
2. `settings/types.ts`：`ComponentKey` + `PluginSettings` + `Translations.components` + `TesseraAPI`
3. `settings/fields.ts`：`COMPONENTS` 字段 + `GROUPS` 数组 + `DEFAULT_SETTINGS`
4. `settings-tab.ts` 自动渲染（GROUPS 驱动，无需改）
5. `main.ts`：分组内挂工厂（包 `mergeComponentConfig`）+ `loadSettings` + check-status
6. i18n 三语 JSON 同步（缺失键会 console.warn，须清零）+ styles.css 样式

### 配置与版本
- 配置优先级：`options > 插件设置 > DEFAULT_SETTINGS`（main.ts 包装层深合并）
- `PluginSettings.version` 是**破坏性变更门槛**：字段结构变化时必须递增，旧配置整体重置
- 当前 version：**4**（core 重构后）；manifest 版本 1.25.0
- `data.json` 由 Obsidian 管理（gitignore），只存被修改过的字段

### 样式约定
- 组件类：`ts-` 前缀；设置面板类：`tessera-` 前缀
- CSS 变量：`--ts-<name>-<key>-light/dark`（主题分离），使用处 `var(--ts-<name>-<key>-current)` 或按 `body.theme-light/dark` 选择
- 颜色统一语义键：`background / border / text / accent`（chart 另加 grid/track/series）
- 字体：`var(--ts-font-ui/body/title/mono)`（含 CJK 回退链）

### 代码质量
- `"strict": true`；`noUncheckedIndexedAccess` 启用（数组访问需处理 undefined）
- 禁止 `any`/`@ts-ignore`/`console.log`；lint 零警告（obsidianmd 规则：sentence case、no-global-this、稳定命令 ID）
- 文件 ≤200-300 行；main.ts 保持精简
- 单文件改动后跑 `npm run build && npm run lint`（或全量）

## 提交规范

- 中文提交信息，前缀：`feat:` / `fix:` / `refactor:` / `style:` / `docs:` / `chore:` / `test:`
- 每阶段：改 → build → lint → 提交

## 安全与合规

- 全本地运行，无网络请求（ECharts 从插件自带 lib/ 懒加载）
- 不读取 vault 外文件；无遥测
- 所有 listener/observer 必须可清理（destroy/onunload 断开）

## 常见任务

- **改组件配置**：config.ts 改默认 → fields.ts 加字段（dot-path）→ i18n 加词条（fields + tooltip）→ 递增 version（如需重置用户配置）
- **加图表组件**：见 COMPONENT_DEVELOPMENT_GUIDE.md §5（pie 完整示例）
- **发布新版本**：`npm version patch/minor` → `git push --tags` → release.yml 自动构建（含 lib/）→ 在 GitHub 确认 draft release
- **更新 ECharts**：`npm i -D echarts@latest` → 复制 `node_modules/echarts/dist/echarts.min.js` → `lib/echarts.min.js`（**禁止运行时 import echarts**，仅 `import type`）