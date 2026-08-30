# TesseraScript 开发指南

面向开发者：构建、调试、测试与发布 TesseraScript 插件。

## 目录

1. [环境要求](#1-环境要求)
2. [安装与构建](#2-安装与构建)
3. [开发工作流](#3-开发工作流)
4. [项目结构](#4-项目结构)
5. [构建输出与资源](#5-构建输出与资源)
6. [调试技巧](#6-调试技巧)
7. [测试](#7-测试)
8. [Lint 与代码规范](#8-lint-与代码规范)
9. [版本与发布](#9-版本与发布)
10. [故障排查](#10-故障排查)

---

## 1. 环境要求

- Node.js 18+（npm 管理依赖）
- Obsidian（含 Dataview 插件）
- 仓库位置：`<Vault>/.obsidian/plugins/tessera-plugin/`（当前在插件目录内直接开发，本地 git 仓库）

## 2. 安装与构建

```bash
npm install          # 安装依赖
npm run dev          # 监听模式，改动自动重新编译
npm run build        # 生产构建（tsc 类型检查 + esbuild 打包）
npm run lint         # ESLint（eslint-plugin-obsidianmd）
```

- `npm run dev`：esbuild watch 模式，产出 `main.js`（Obsidian 加载后重载插件生效）
- `npm run build`：先 `tsc -noEmit -skipLibCheck` 类型检查，失败则**不产出 main.js**（短路），通过后 esbuild 打包

## 3. 开发工作流

1. 修改 `src/` 下源码
2. `npm run build`（或 dev watch）
3. `npm run lint` 确认零警告
4. 在 Obsidian 中重载插件（命令面板 → **Reload app without saving** 或设置面板"应用并重载"）
5. 在笔记的 dataviewjs 代码块中调用 `tessera.*` 验证
6. `git add` + `git commit`（提交信息用中文 `feat:/fix:/refactor:/chore:/docs:` 前缀）

> 提交规范见仓库历史：`feat: settings hierarchy...`、`fix: ...`、`chore: ...`。reference/ 目录是设计素材（gitignore，不入库）。

## 4. 项目结构

```
tessera-plugin/
├── src/
│   ├── main.ts                    # 入口：生命周期、tessera 挂载、Dataview 检测
│   ├── components/
│   │   ├── card/                  # tessera.core.card
│   │   │   ├── config.ts          # 默认配置（单一数据源）
│   │   │   └── index.ts           # 组件工厂
│   │   ├── heatmap/
│   │   ├── progressbar/
│   │   └── chart/                 # tessera.chart.*（ECharts 懒加载）
│   │       ├── loader.ts          # ECharts <script> 懒加载
│   │       ├── shared.ts          # createChartBase 公共生命周期
│   │       ├── config.ts          # 4 图表默认配置
│   │       ├── line.ts / bar.ts / gauge.ts / rose.ts
│   │       └── index.ts           # createChartGroup
│   ├── settings/
│   │   ├── types.ts               # PluginSettings / TesseraAPI / SettingField
│   │   ├── fields.ts              # 字段定义 + DEFAULT_SETTINGS + GROUPS
│   │   ├── settings-tab.ts        # 设置面板渲染
│   │   ├── i18n.ts                # 翻译加载/回退
│   │   └── color-utils.ts         # 颜色转换（rgba<->hex）
│   ├── i18n/
│   │   ├── en.json / ja.json / zh.json
│   └── utils/
│       └── dom.ts                 # createElement / resolveThemeColors
├── lib/
│   └── echarts.min.js             # ECharts UMD（运行时懒加载，勿提交进 bundle）
├── docs/                          # 文档（README/ARCHITECTURE/CONFIGURATION/组件开发指南/decisions）
├── styles.css                     # 组件样式（ts- 前缀，集中管理）
├── manifest.json                  # 插件清单
├── types/global.d.ts              # window.tessera 全局类型
├── esbuild.config.mjs             # 打包配置
└── package.json
```

## 5. 构建输出与资源

| 产物 | 说明 |
|------|------|
| `main.js` | 全部 TS 打包（含组件/设置/ECharts 懒加载器），**不含 ECharts 本体** |
| `styles.css` | 组件样式（直接由插件目录加载） |
| `lib/echarts.min.js` | 独立资源，**图表组件首次使用时**由 `main.js` 动态 `<script>` 注入（ADR-0005） |

ECharts 更新流程：

```bash
npm i -D echarts@latest
copy node_modules\echarts\dist\echarts.min.js lib\echarts.min.js
```

> 不要 `import echarts from "echarts"` 进业务代码（会打进 main.js，~1MB）。类型用 `import type`（esbuild 擦除）。

## 6. 调试技巧

- **dataviewjs 错误**：Obsidian 控制台（Ctrl+Shift+I）会显示代码块内 JS 报错
- **懒加载失败**：查看 Network 面板 `echarts.min.js` 请求；确认 `getEchartsUrl()` 解析出的 resource path 可访问。加载失败时画布显示 "Echarts failed to load"
- **设置不生效**：修改后必须重载插件（`app:reload`）。若 `data.json` 版本不匹配，配置会被重置——检查 `PluginSettings.version` 是否误改
- **类型检查**：`npx tsc --noEmit` 单独跑
- **快速验证组件**：临时写个 dataviewjs 块直接调 `tessera.core.card({...})`，`dv.container.appendChild(...)`

## 7. 测试

当前无自动化测试框架，采用手动验证：

1. 每个组件在 dataviewjs 中最小可用性测试（README 的示例直接粘贴）
2. 深浅主题切换（`Settings → Appearance`）验证主题适配
3. 设置面板：开关组件、改字段、恢复默认、应用重载
4. 图表：首次渲染（懒加载）、数据响应式更新、resize、销毁

## 8. Lint 与代码规范

- `npm run lint`：ESLint + `eslint-plugin-obsidianmd`（Obsidian 专属规则：sentence case、prefer-active-doc、no-deprecated 等）
- 提交前必须零警告（GitHub Action 也会 lint）
- 规范要点：
  - `main.ts` 保持精简（生命周期/挂载/命令），逻辑进模块
  - 单文件 ≤ 200-300 行（超限拆模块）
  - 所有 DOM 监听器在 destroy()/onunload 断开
  - 用户可见文案 sentence case；命令 ID 稳定
  - 组件/API 命名约定见 [COMPONENT_DEVELOPMENT_GUIDE.md](./COMPONENT_DEVELOPMENT_GUIDE.md) 最佳实践

## 9. 版本与发布

1. 改 `manifest.json` 的 `version`（SemVer）
2. 更新 `versions.json`：`{"<新版本>": "<minAppVersion>"}`
3. 破坏性变更时递增 `PluginSettings.version`（src/settings/fields.ts DEFAULT_SETTINGS），触发旧配置重置
4. 构建 + 测试
5. `git commit`；打 tag（等于 manifest version，无 `v` 前缀）
6. GitHub Release 附 `main.js`、`manifest.json`、`styles.css`（社区目录发布流程见 Obsidian 文档）

## 10. 故障排查

| 症状 | 排查 |
|------|------|
| 插件不加载 | `main.js` 与 `manifest.json` 必须在插件目录顶层；查看 console 报错 |
| main.js 缺失 | 先跑 `npm run build`；tsc 错误会短路不产出 |
| Dataview 报错 | 确认 Dataview 插件已启用；插件检测不到 api 时会 Notice 提示 |
| 图表空白 | Network 面板查 echarts.min.js 是否加载；看 canvas 是否显示 "Echarts failed to load" |
| 设置被重置 | 检查 `PluginSettings.version`；data.json 损坏也会触发重置 |
| lint 失败 | `npx eslint src` 看具体规则；obsidianmd 规则常见于文案大小写、document 引用 |

## 参考

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 内部机制
- [CONFIGURATION.md](./CONFIGURATION.md) — 组件配置字段
- [COMPONENT_DEVELOPMENT_GUIDE.md](./COMPONENT_DEVELOPMENT_GUIDE.md) — 新组件开发
- [decisions/](./decisions/) — 设计决策（ADR-0001..0005）
- Obsidian 插件文档：https://docs.obsidian.md