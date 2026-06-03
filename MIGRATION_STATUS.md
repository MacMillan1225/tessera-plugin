# TesseraScript Plugin - 迁移工作记录

## 项目概述

将 `E:\文档\Obsidian\tessera-vault\TesseraScript` 中的模块化 DataviewJS 组件库迁移为标准 Obsidian TypeScript 插件，目标目录 `E:\Program\tessera-plugin`。

## 当前状态

| 检查项 | 状态 |
|--------|------|
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run build` | ✅ 编译成功 |
| `main.js` | ✅ 已生成 |

## 已完成的 Git 提交

| 提交 | 说明 |
|------|------|
| `5dcb871` | feat: initialize TesseraScript plugin skeleton (13 files, +1870/-164) |
| `6e2f907` | feat: migrate core modules (5 files, +1037) |
| `243da44` | feat: migrate all components (13 files, +1369) |
| `5004ba9` | docs: add comprehensive documentation (2 files, +949) |

## 待提交的修复

Lint 错误修复（349 → 0）尚未提交到 git，建议执行：

```bash
git add -A
git commit -m "fix: resolve all ESLint errors (349 → 0)"
```

## 架构设计决策

| 决策 | 说明 |
|------|------|
| **模块系统** | `TesseraRuntime` 类实现 `Tessera.define()` / `Tessera.use()` / `Tessera.require()` |
| **CSS 策略** | 基础样式在 `styles.css`，组件样式通过 `StyleManager` 懒加载 |
| **配置策略** | 内置默认值 + vault JSON 覆盖 |
| **Dataview 集成** | `DataviewBridge` 类包装 `app.plugins.plugins["dataview"]?.api` |
| **向后兼容** | 插件加载时挂载 `Tessera` 到 `window` |

## 依赖关系

- **必须依赖 Dataview 插件**：运行时检查 `app.plugins.plugins["dataview"]`
- 使用 Obsidian API：`TFile`、`Vault`、`normalizePath`、`Setting`、`PluginSettingTab`

## 文件结构

```
src/
├── main.ts                    # 插件入口 + 设置面板
├── dataview-bridge.ts         # Dataview 插件集成
├── runtime/
│   └── bootstrap.ts           # TesseraRuntime 模块系统
├── core/
│   ├── index.ts               # 核心模块注册
│   ├── dom.ts                 # DOM 工具 (createElement, assignClasses 等)
│   ├── css.ts                 # CSS 注入控制器
│   ├── config.ts              # 配置控制器
│   └── file.ts                # Vault 文件操作
├── components/
│   ├── index.ts               # 组件注册
│   ├── card/index.ts          # 卡片组件
│   ├── heatmap/index.ts       # 热力图组件
│   ├── progressbar/index.ts   # 进度条组件
│   └── example/index.ts       # 模板组件
└── utils/
    ├── style-manager.ts       # StyleManager 单例
    └── logger.ts              # Logger 工具
types/
├── tessera.d.ts               # TypeScript 类型定义
└── global.d.ts                # 全局类型声明
```

## 关键修复记录

### 类型安全
- 所有 `any` 替换为 `unknown` 或具体类型
- `noUncheckedIndexedAccess` 启用，数组访问需处理 `undefined`

### Obsidian 规范
- `globalThis` → `window`（`obsidianmd/no-global-this`）
- `document` → `document`（带 eslint-disable，用于 popout window 兼容）
- 移除 `console.log`（`obsidianmd/rule-custom-message`）
- UI 文本使用 sentence case（`obsidianmd/ui/sentence-case`）
- 命令名称不含插件前缀（`obsidianmd/commands/no-plugin-name-in-command-name`）

### 组件模式
- 每个组件返回 `HTMLElement`
- 支持 `options.colors.light/dark`
- 暴露 `.parts` 供外部访问
- `className` 使用 `.filter(Boolean) as string[]` 处理联合类型

## 原始模块别名（向后兼容）

```
card, heatmap, progressbar, example, font, pageStyle, components, @ui
```

## 已知限制

- `src/components/example/index.ts` 的 parts 暴露使用 `as HTMLElement` 断言（因为 `createElement` 返回可能 undefined）
- Logger 和 StyleManager 使用 `eslint-disable` 注释（console.log 和 `<style>` 元素）

## 下一步建议

1. **提交 lint 修复到 git**
2. **在 Obsidian 中测试插件加载**
3. **编写单元测试**（可选）
4. **发布到 Obsidian 社区插件**（可选）

## 相关路径

| 路径 | 说明 |
|------|------|
| `E:\文档\Obsidian\tessera-vault\TesseraScript/` | 源组件库（只读参考） |
| `E:\文档\Obsidian\tessera-vault\数据视图扩展.md` | 迁移策略文档 |
| `E:\Program\tessera-plugin` | 目标插件目录（当前工作区） |
