# TesseraScript 组件开发指南

## 目录

1. [概述](#概述)
2. [组件目录结构](#组件目录结构)
3. [从零创建新组件](#从零创建新组件)
4. [注册组件到设置系统](#注册组件到设置系统)
5. [添加 i18n 翻译](#添加-i18n-翻译)
6. [修改现有组件](#修改现有组件)
7. [字段类型参考](#字段类型参考)
8. [完整示例：创建 Todo 组件](#完整示例创建-todo-组件)
9. [验证与调试](#验证与调试)
10. [最佳实践](#最佳实践)

---

## 概述

TesseraScript 的组件系统采用**数据驱动**的设计，添加新组件或修改配置项只需：

1. 创建组件实现文件 (`src/components/<name>/index.ts`)
2. 在 `src/settings/fields.ts` 中注册字段定义
3. 在 `src/i18n/*.json` 中添加翻译文本
4. 在 `src/main.ts` 中导入并注册组件

---

## 组件目录结构

```
src/components/<component-name>/
├── config.ts         # 默认配置（必须，单一数据源）
├── index.ts          # 组件实现（必须）
└── style.css         # 组件样式（可选）
```

### 示例：Card 组件

```
src/components/card/
├── config.ts         # CARD_DEFAULTS 配置定义
└── index.ts          # 导出 card() 函数
```

---

## 从零创建新组件

### 步骤 1：创建配置文件

创建 `src/components/<name>/config.ts`（单一数据源）：

```typescript
/**
 * <Name> component default configuration
 * Single source of truth for all <name> defaults
 */

export const <NAME>_DEFAULTS = {
  flags: {
    showHeader: true,
    animated: false,
  },
  layout: {
    width: "100%",
    height: "8px",
    padding: "16px",
  },
  colors: {
    light: {
      background: "rgba(245, 248, 252, 0.9)",
      text: "var(--text-normal)",
    },
    dark: {
      background: "rgba(30, 41, 59, 0.72)",
      text: "var(--text-normal)",
    },
  },
};

export type <Name>Config = typeof <NAME>_DEFAULTS;
```

### 步骤 2：创建组件文件

创建 `src/components/<name>/index.ts`：

```typescript
/**
 * TesseraScript Component: <Name>
 * 组件描述
 */

import { <NAME>_DEFAULTS } from "./config";

// ============================================================================
// Types
// ============================================================================

export interface <Name>Options {
  // 必填字段
  value: number;
  
  // 可选字段（带默认值）
  showLabel?: boolean;
  labelFormat?: string;
  
  // 嵌套配置对象
  flags?: {
    showHeader?: boolean;
    animated?: boolean;
  };
  
  layout?: {
    width?: string;
    height?: string;
    padding?: string;
  };
  
  colors?: {
    light?: {
      background?: string;
      text?: string;
    };
    dark?: {
      background?: string;
      text?: string;
    };
  };
}

// ============================================================================
// Component Function
// ============================================================================

export function <name>(options: <Name>Options): HTMLElement {
  const { value, showLabel = true, labelFormat = "{value}%" } = options;
  const flags = { ...<NAME>_DEFAULTS.flags, ...options.flags };
  const layout = { ...<NAME>_DEFAULTS.layout, ...options.layout };
  
  // 解析颜色（支持 light/dark 主题）
  const colors = {
    light: { ...<NAME>_DEFAULTS.colors.light, ...options.colors?.light },
    dark: { ...<NAME>_DEFAULTS.colors.dark, ...options.colors?.dark },
  };

  // 创建 DOM 元素
  // eslint-disable-next-line obsidianmd/prefer-active-doc
  const container = document.createElement("div");
  container.className = "ts-<name>";
  
  // 设置 CSS 变量
  container.style.setProperty("--ts-<name>-bg-light", colors.light.background);
  container.style.setProperty("--ts-<name>-bg-dark", colors.dark.background);
  
  // 构建内容
  if (showLabel) {
    const label = document.createElement("span");
    label.className = "ts-<name>__label";
    label.textContent = labelFormat.replace("{value}", String(value));
    container.appendChild(label);
  }

  return container;
}

// ============================================================================
// Default Export
// ============================================================================

export default <name>;
```

### 步骤 3：添加样式（可选）

如果需要独立的 CSS 文件，创建 `src/components/<name>/style.css`：

```css
.ts-<name> {
  background: var(--ts-<name>-bg-light);
  padding: var(--ts-<name>-padding, 16px);
  border-radius: var(--ts-<name>-radius, 8px);
}

/* Dark theme */
.theme-dark .ts-<name> {
  background: var(--ts-<name>-bg-dark);
}

.ts-<name>__label {
  color: var(--ts-<name>-text-light);
  font-size: 14px;
}

.theme-dark .ts-<name>__label {
  color: var(--ts-<name>-text-dark);
}
```

---

## 注册组件到设置系统

### 步骤 1：更新 TypeScript 类型

编辑 `src/settings/types.ts`，在 `PluginSettings` 接口中添加新组件：

```typescript
export interface PluginSettings {
  card: ComponentConfig<CardConfig>;
  heatmap: ComponentConfig<HeatmapConfig>;
  progressbar: ComponentConfig<ProgressbarConfig>;
  // ↓ 添加新组件 ↓
  todo: ComponentConfig<TodoConfig>;
}

// 添加配置接口
export interface TodoConfig {
  value: number;
  showLabel?: boolean;
  labelFormat?: string;
  flags?: {
    showHeader?: boolean;
    animated?: boolean;
  };
  layout?: {
    width?: string;
    height?: string;
  };
  colors?: {
    light?: {
      background?: string;
      text?: string;
    };
    dark?: {
      background?: string;
      text?: string;
    };
  };
}
```

### 步骤 2：注册字段定义并引用配置

编辑 `src/settings/fields.ts`，添加组件的字段定义并引用组件配置：

```typescript
import type { ComponentDefinition, PluginSettings } from "./types";
import { CARD_DEFAULTS } from "../components/card/config";
import { HEATMAP_DEFAULTS } from "../components/heatmap/config";
import { PROGRESSBAR_DEFAULTS } from "../components/progressbar/config";
import { TODO_DEFAULTS } from "../components/todo/config";  // ← 添加导入

export const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
  card: { /* ... */ },
  heatmap: { /* ... */ },
  progressbar: { /* ... */ },
  // ↓ 添加新组件 ↓
  todo: {
    componentKey: "todo",
    fields: [
      // 基础字段
      { key: "showLabel", type: "toggle", description: "tooltip.todo.showLabel" },
      { key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.todo.labelFormat" },
      
      // Flags 组
      { key: "flags.showHeader", type: "toggle", description: "tooltip.todo.showHeader" },
      { key: "flags.animated", type: "toggle", description: "tooltip.todo.animated" },
      
      // Layout 组
      { key: "layout.width", type: "text", description: "tooltip.layout.width" },
      { key: "layout.height", type: "text", description: "tooltip.layout.height" },
      
      // Colors 组（Light）
      { key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
      { key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
      
      // Colors 组（Dark）
      { key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
      { key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
    ],
  },
};

// 默认配置 - 引用组件配置（单一数据源）
export const DEFAULT_SETTINGS: PluginSettings = {
  card: {
    enabled: true,
    config: CARD_DEFAULTS as unknown as Record<string, unknown>,
  },
  heatmap: {
    enabled: true,
    config: HEATMAP_DEFAULTS as unknown as Record<string, unknown>,
  },
  progressbar: {
    enabled: true,
    config: PROGRESSBAR_DEFAULTS as unknown as Record<string, unknown>,
  },
  // ↓ 添加新组件 ↓
  todo: {
    enabled: true,
    config: TODO_DEFAULTS as unknown as Record<string, unknown>,
  },
};
```

### 步骤 3：在 main.ts 中注册组件

编辑 `src/main.ts`：

```typescript
import { todo } from "./components/todo/index";  // ← 添加导入

export default class TesseraPlugin extends Plugin {
  async onload() {
    // ...
    
    const tessera: TesseraAPI = {
      version: "1.0.0",
      card: this.settings.card.enabled 
        ? ((options: any) => card({ ...this.settings.card.config, ...options }))
        : undefined,
      heatmap: this.settings.heatmap.enabled 
        ? ((options: any) => heatmap({ ...this.settings.heatmap.config, ...options }))
        : undefined,
      progressbar: this.settings.progressbar.enabled 
        ? ((options: any) => progressbar({ ...this.settings.progressbar.config, ...options }))
        : undefined,
      // ↓ 添加新组件 ↓
      todo: this.settings.todo.enabled 
        ? ((options: any) => todo({ ...this.settings.todo.config, ...options }))
        : undefined,
    };
    
    // ...
  }
}
```

---

## 添加 i18n 翻译

### 步骤 1：编辑翻译文件

在 `src/i18n/en.json`、`zh.json`、`ja.json` 中添加翻译：

#### `src/i18n/en.json`

```json
{
  "components": {
    "card": { "name": "Card", "desc": "..." },
    "heatmap": { "name": "Heatmap", "desc": "..." },
    "progressbar": { "name": "Progressbar", "desc": "..." },
    "todo": { "name": "Todo", "desc": "Todo list component" }
  },
  "fields": {
    "flags.showHeader": "Show Header",
    "flags.showTitle": "Show Title",
    "showLabel": "Show Label",
    "labelFormat": "Label Format",
    "flags.animated": "Animated"
  },
  "groups": {
    "flags": "Flags",
    "layout": "Layout",
    "settings": "Settings",
    "colors": "Colors",
    "colors.light": "Light Theme",
    "colors.dark": "Dark Theme"
  },
  "tooltips": {
    "todo.showLabel": "Show percentage label",
    "todo.labelFormat": "Label format, {value} will be replaced",
    "todo.showHeader": "Show header section",
    "todo.animated": "Enable animations"
  }
}
```

#### `src/i18n/zh.json`

```json
{
  "components": {
    "todo": { "name": "待办", "desc": "待办事项列表组件" }
  },
  "fields": {
    "showLabel": "显示标签",
    "labelFormat": "标签格式",
    "flags.animated": "动画效果"
  },
  "tooltips": {
    "todo.showLabel": "显示百分比标签",
    "todo.labelFormat": "标签格式，{value} 会被替换为当前值",
    "todo.showHeader": "显示头部区域",
    "todo.animated": "启用动画效果"
  }
}
```

#### `src/i18n/ja.json`

```json
{
  "components": {
    "todo": { "name": "Todo", "desc": "Todoリストコンポーネント" }
  },
  "fields": {
    "showLabel": "ラベル表示",
    "labelFormat": "ラベル形式",
    "flags.animated": "アニメーション"
  },
  "tooltips": {
    "todo.showLabel": "パーセンテージラベルを表示",
    "todo.labelFormat": "ラベル形式、{value}は現在の値に置換されます",
    "todo.showHeader": "ヘッダーセクションを表示",
    "todo.animated": "アニメーションを有効にする"
  }
}
```

### 翻译 Key 命名规则

| 类型 | Key 格式 | 示例 |
|------|----------|------|
| 组件名称 | `components.<name>.name` | `components.todo.name` |
| 组件描述 | `components.<name>.desc` | `components.todo.desc` |
| 字段标签 | `fields.<fieldKey>` | `fields.showLabel` |
| 字段分组 | `groups.<groupName>` | `groups.flags` |
| Tooltip | `tooltips.<component>.<field>` | `tooltips.todo.showLabel` |

### 步骤 2：运行 i18n 验证

构建时会自动检查翻译完整性：

```bash
npm run build
```

如果有缺失的翻译，会输出警告：

```
[TesseraScript] Translation warnings for "ja":
  Missing field translations: ["todo.showLabel", "todo.labelFormat"]
  Missing tooltip translations: ["todo.animated"]
```

---

## 修改现有组件

### 场景 1：添加新的配置字段

#### 1.1 更新组件接口

编辑 `src/components/<name>/index.ts`：

```typescript
export interface CardOptions {
  // ... 现有字段 ...
  
  // ↓ 添加新字段 ↓
  flags?: {
    showHeader?: boolean;
    showHeaderSep?: boolean;
    showTitle?: boolean;
    showMeta?: boolean;
    showValue?: boolean;
    showIcon?: boolean;  // ← 新增
  };
}
```

#### 1.2 更新字段定义

编辑 `src/settings/fields.ts`：

```typescript
card: {
  componentKey: "card",
  fields: [
    // ... 现有字段 ...
    
    // ↓ 添加新字段 ↓
    { key: "flags.showIcon", type: "toggle", description: "tooltip.flags.showIcon" },
  ],
},
```

#### 1.3 更新默认配置

编辑 `src/settings/fields.ts` 的 `DEFAULT_SETTINGS`：

```typescript
card: {
  enabled: true,
  config: {
    flags: {
      showHeader: true,
      showHeaderSep: true,
      showTitle: true,
      showMeta: true,
      showValue: true,
      showIcon: false,  // ← 新增默认值
    },
    // ...
  },
},
```

#### 1.4 添加翻译

编辑所有 `src/i18n/*.json` 文件：

```json
{
  "fields": {
    "flags.showIcon": "Show Icon"
  },
  "tooltips": {
    "flags.showIcon": "Display icon in the header"
  }
}
```

#### 1.5 使用新字段

编辑 `src/components/<name>/index.ts`：

```typescript
export function card(options: CardOptions = {}): HTMLElement {
  const flags = options.flags || {};
  
  // 使用新字段
  if (flags.showIcon && options.icon) {
    // 添加图标逻辑
  }
}
```

### 场景 2：添加新的配置组

#### 2.1 定义新的配置组接口

```typescript
export interface CardOptions {
  // ... 现有字段 ...
  
  animation?: {          // ← 新增配置组
    duration?: number;
    easing?: string;
    delay?: number;
  };
}
```

#### 2.2 注册字段

```typescript
card: {
  componentKey: "card",
  fields: [
    // Flags 组
    { key: "flags.showHeader", type: "toggle", description: "..." },
    
    // Layout 组
    { key: "layout.maxWidth", type: "text", description: "..." },
    
    // Animation 组（新增）
    { key: "animation.duration", type: "number", description: "tooltip.animation.duration" },
    { key: "animation.easing", type: "select", description: "tooltip.animation.easing", options: [
      { value: "ease", label: "Ease" },
      { value: "linear", label: "Linear" },
      { value: "ease-in", label: "Ease In" },
      { value: "ease-out", label: "Ease Out" },
    ]},
    { key: "animation.delay", type: "number", description: "tooltip.animation.delay" },
  ],
},
```

#### 2.3 添加分组翻译

```json
{
  "groups": {
    "animation": "Animation"
  }
}
```

---

## 字段类型参考

### 支持的字段类型

| 类型 | UI 控件 | 适用场景 | 配置项 |
|------|---------|----------|--------|
| `toggle` | 开关 | 布尔值 | - |
| `text` | 文本输入 | 字符串 | `placeholder` |
| `number` | 数字输入 | 数值 | `min`, `max`, `step` |
| `textarea` | 多行文本 | 长文本 | `rows` |
| `color` | 颜色选择器 | 颜色值 | - |
| `select` | 下拉选择 | 枚举值 | `options: Array<{value, label}>` |
| `slider` | 滑动条 | 0-1 范围 | `min`, `max`, `step` |

### 字段定义示例

```typescript
// Toggle
{ key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" }

// Text with placeholder
{ key: "labelFormat", type: "text", placeholder: "{value}%", description: "tooltip.labelFormat" }

// Number with constraints
{ key: "minWeeks", type: "number", description: "tooltip.minWeeks" }

// Select with options
{ key: "settings.locale", type: "select", description: "tooltip.locale", options: [
  { value: "zh-CN", label: "中文 (简体)" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
]}

// Slider (0-1 range)
{ key: "layout.trackOpacity", type: "slider", min: 0, max: 1, step: 0.01, description: "tooltip.trackOpacity" }

// Color (automatically handles rgba with alpha slider)
{ key: "colors.light.background", type: "color", description: "tooltip.colors.background" }
```

### 字段 Key 路径规则

使用**点号分隔**的路径访问嵌套对象：

```typescript
// 访问 options.flags.showHeader
key: "flags.showHeader"

// 访问 options.layout.padding
key: "layout.padding"

// 访问 options.colors.light.background
key: "colors.light.background"

// 访问顶层字段
key: "showLabel"
key: "labelFormat"
```

---

## 完整示例：创建 Todo 组件

### 1. 创建组件实现

`src/components/todo/index.ts`：

```typescript
/**
 * TesseraScript Component: Todo
 * Simple todo list component with progress tracking
 */

// ============================================================================
// Types
// ============================================================================

export interface TodoItem {
  text: string;
  done?: boolean;
}

export interface TodoOptions {
  items: TodoItem[];
  title?: string;
  showProgress?: boolean;
  showCheckboxes?: boolean;
  flags?: {
    showHeader?: boolean;
    showProgress?: boolean;
    showCheckboxes?: boolean;
    strikethrough?: boolean;
  };
  layout?: {
    width?: string;
    maxWidth?: string;
    padding?: string;
    gap?: string;
  };
  colors?: {
    light?: {
      background?: string;
      border?: string;
      text?: string;
      doneText?: string;
      checkbox?: string;
    };
    dark?: {
      background?: string;
      border?: string;
      text?: string;
      doneText?: string;
      checkbox?: string;
    };
  };
}

// ============================================================================
// Default Colors
// ============================================================================

const defaultColors = {
  light: {
    background: "rgba(245, 248, 252, 0.9)",
    border: "rgba(120, 140, 160, 0.18)",
    text: "var(--text-normal)",
    doneText: "var(--text-muted)",
    checkbox: "var(--interactive-accent)",
  },
  dark: {
    background: "rgba(30, 41, 59, 0.72)",
    border: "rgba(148, 163, 184, 0.18)",
    text: "var(--text-normal)",
    doneText: "var(--text-muted)",
    checkbox: "var(--interactive-accent)",
  },
};

// ============================================================================
// Component Function
// ============================================================================

export function todo(options: TodoOptions): HTMLElement {
  const { items = [], title = "Todo" } = options;
  const flags = {
    showHeader: true,
    showProgress: true,
    showCheckboxes: true,
    strikethrough: true,
    ...options.flags,
  };
  const layout = options.layout || {};
  
  // Resolve colors
  const colors = {
    light: { ...defaultColors.light, ...options.colors?.light },
    dark: { ...defaultColors.dark, ...options.colors?.dark },
  };

  // Calculate progress
  const doneCount = items.filter(item => item.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Create container
  // eslint-disable-next-line obsidianmd/prefer-active-doc
  const container = document.createElement("div");
  container.className = "ts-todo";
  
  // Set CSS variables
  container.style.setProperty("--ts-todo-bg-light", colors.light.background);
  container.style.setProperty("--ts-todo-bg-dark", colors.dark.background);
  container.style.setProperty("--ts-todo-border-light", colors.light.border);
  container.style.setProperty("--ts-todo-border-dark", colors.dark.border);
  container.style.setProperty("--ts-todo-text-light", colors.light.text);
  container.style.setProperty("--ts-todo-text-dark", colors.dark.text);
  container.style.setProperty("--ts-todo-done-light", colors.light.doneText);
  container.style.setProperty("--ts-todo-done-dark", colors.dark.doneText);
  container.style.setProperty("--ts-todo-checkbox-light", colors.light.checkbox);
  container.style.setProperty("--ts-todo-checkbox-dark", colors.dark.checkbox);
  
  if (layout.maxWidth) container.style.maxWidth = layout.maxWidth;
  if (layout.padding) container.style.setProperty("--ts-todo-padding", layout.padding);
  if (layout.gap) container.style.setProperty("--ts-todo-gap", layout.gap);

  // Header
  if (flags.showHeader) {
    const header = document.createElement("div");
    header.className = "ts-todo__header";
    
    const titleEl = document.createElement("h3");
    titleEl.className = "ts-todo__title";
    titleEl.textContent = title;
    header.appendChild(titleEl);
    
    if (flags.showProgress) {
      const progressEl = document.createElement("span");
      progressEl.className = "ts-todo__progress";
      progressEl.textContent = `${doneCount}/${totalCount}`;
      header.appendChild(progressEl);
    }
    
    container.appendChild(header);
  }

  // Items list
  const list = document.createElement("ul");
  list.className = "ts-todo__list";
  
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = `ts-todo__item${item.done ? " ts-todo__item--done" : ""}`;
    
    if (flags.showCheckboxes) {
      const checkbox = document.createElement("span");
      checkbox.className = "ts-todo__checkbox";
      checkbox.textContent = item.done ? "✓" : "○";
      li.appendChild(checkbox);
    }
    
    const text = document.createElement("span");
    text.className = "ts-todo__text";
    text.textContent = item.text;
    li.appendChild(text);
    
    list.appendChild(li);
  });
  
  container.appendChild(list);

  return container;
}

// ============================================================================
// Default Export
// ============================================================================

export default todo;
```

### 2. 添加样式

`src/components/todo/style.css`：

```css
.ts-todo {
  background: var(--ts-todo-bg-light);
  border: 1px solid var(--ts-todo-border-light);
  border-radius: 12px;
  padding: var(--ts-todo-padding, 16px);
  font-family: var(--font-interface);
}

.theme-dark .ts-todo {
  background: var(--ts-todo-bg-dark);
  border-color: var(--ts-todo-border-dark);
}

.ts-todo__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ts-todo-gap, 12px);
  padding-bottom: var(--ts-todo-gap, 12px);
  border-bottom: 1px solid var(--ts-todo-border-light);
}

.theme-dark .ts-todo__header {
  border-bottom-color: var(--ts-todo-border-dark);
}

.ts-todo__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ts-todo-text-light);
}

.theme-dark .ts-todo__title {
  color: var(--ts-todo-text-dark);
}

.ts-todo__progress {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--background-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.ts-todo__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ts-todo-gap, 12px);
}

.ts-todo__item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ts-todo-text-light);
}

.theme-dark .ts-todo__item {
  color: var(--ts-todo-text-dark);
}

.ts-todo__item--done {
  color: var(--ts-todo-done-light);
  text-decoration: line-through;
}

.theme-dark .ts-todo__item--done {
  color: var(--ts-todo-done-dark);
}

.ts-todo__checkbox {
  font-size: 16px;
  color: var(--ts-todo-checkbox-light);
}

.theme-dark .ts-todo__checkbox {
  color: var(--ts-todo-checkbox-dark);
}
```

### 3. 注册到设置系统

`src/settings/types.ts`：

```typescript
export interface PluginSettings {
  card: ComponentConfig<CardConfig>;
  heatmap: ComponentConfig<HeatmapConfig>;
  progressbar: ComponentConfig<ProgressbarConfig>;
  todo: ComponentConfig<TodoConfig>;  // ← 新增
}

export interface TodoConfig {
  items?: Array<{ text: string; done?: boolean }>;
  title?: string;
  flags?: {
    showHeader?: boolean;
    showProgress?: boolean;
    showCheckboxes?: boolean;
    strikethrough?: boolean;
  };
  layout?: {
    width?: string;
    maxWidth?: string;
    padding?: string;
    gap?: string;
  };
  colors?: {
    light?: {
      background?: string;
      border?: string;
      text?: string;
      doneText?: string;
      checkbox?: string;
    };
    dark?: {
      background?: string;
      border?: string;
      text?: string;
      doneText?: string;
      checkbox?: string;
    };
  };
}
```

`src/settings/fields.ts`：

```typescript
export const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
  // ... 现有组件 ...
  
  todo: {
    componentKey: "todo",
    fields: [
      // Flags
      { key: "flags.showHeader", type: "toggle", description: "tooltip.todo.showHeader" },
      { key: "flags.showProgress", type: "toggle", description: "tooltip.todo.showProgress" },
      { key: "flags.showCheckboxes", type: "toggle", description: "tooltip.todo.showCheckboxes" },
      { key: "flags.strikethrough", type: "toggle", description: "tooltip.todo.strikethrough" },
      
      // Layout
      { key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
      { key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
      { key: "layout.gap", type: "text", description: "tooltip.layout.gap" },
      
      // Colors (Light)
      { key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
      { key: "colors.light.border", type: "color", description: "tooltip.colors.border" },
      { key: "colors.light.text", type: "color", description: "tooltip.colors.text" },
      
      // Colors (Dark)
      { key: "colors.dark.background", type: "color", description: "tooltip.colors.background" },
      { key: "colors.dark.border", type: "color", description: "tooltip.colors.border" },
      { key: "colors.dark.text", type: "color", description: "tooltip.colors.text" },
    ],
  },
};

export const DEFAULT_SETTINGS: PluginSettings = {
  // ... 现有组件 ...
  
  todo: {
    enabled: true,
    config: {
      items: [],
      title: "Todo",
      flags: {
        showHeader: true,
        showProgress: true,
        showCheckboxes: true,
        strikethrough: true,
      },
      layout: {
        maxWidth: "400px",
        padding: "16px",
        gap: "12px",
      },
      colors: {
        light: {
          background: "rgba(245, 248, 252, 0.9)",
          border: "rgba(120, 140, 160, 0.18)",
          text: "var(--text-normal)",
          doneText: "var(--text-muted)",
          checkbox: "var(--interactive-accent)",
        },
        dark: {
          background: "rgba(30, 41, 59, 0.72)",
          border: "rgba(148, 163, 184, 0.18)",
          text: "var(--text-normal)",
          doneText: "var(--text-muted)",
          checkbox: "var(--interactive-accent)",
        },
      },
    },
  },
};
```

### 4. 添加 i18n 翻译

`src/i18n/en.json`：

```json
{
  "components": {
    "todo": {
      "name": "Todo",
      "desc": "Simple todo list component with progress tracking"
    }
  },
  "fields": {
    "flags.showHeader": "Show Header",
    "flags.showProgress": "Show Progress",
    "flags.showCheckboxes": "Show Checkboxes",
    "flags.strikethrough": "Strikethrough Done Items",
    "layout.maxWidth": "Max Width",
    "layout.padding": "Padding",
    "layout.gap": "Gap",
    "colors.light.text": "Light Text Color",
    "colors.light.doneText": "Light Done Text Color",
    "colors.dark.text": "Dark Text Color",
    "colors.dark.doneText": "Dark Done Text Color"
  },
  "tooltips": {
    "todo.showHeader": "Show the title and progress header",
    "todo.showProgress": "Show done/total count",
    "todo.showCheckboxes": "Show checkboxes for each item",
    "todo.strikethrough": "Strikethrough completed items",
    "colors.text": "Text color",
    "colors.doneText": "Text color for completed items"
  }
}
```

`src/i18n/zh.json`：

```json
{
  "components": {
    "todo": {
      "name": "待办",
      "desc": "带进度跟踪的简单待办列表组件"
    }
  },
  "fields": {
    "flags.showHeader": "显示头部",
    "flags.showProgress": "显示进度",
    "flags.showCheckboxes": "显示复选框",
    "flags.strikethrough": "已完成项划线",
    "layout.maxWidth": "最大宽度",
    "layout.padding": "内边距",
    "layout.gap": "间距",
    "colors.light.text": "浅色文本颜色",
    "colors.light.doneText": "浅色完成文本颜色",
    "colors.dark.text": "深色文本颜色",
    "colors.dark.doneText": "深色完成文本颜色"
  },
  "tooltips": {
    "todo.showHeader": "显示标题和进度头部",
    "todo.showProgress": "显示已完成/总数",
    "todo.showCheckboxes": "显示每个项目的复选框",
    "todo.strikethrough": "已完成的项目划线",
    "colors.text": "文本颜色",
    "colors.doneText": "已完成项目的文本颜色"
  }
}
```

`src/i18n/ja.json`：

```json
{
  "components": {
    "todo": {
      "name": "Todo",
      "desc": "進捗追跡付きのシンプルなTodoリストコンポーネント"
    }
  },
  "fields": {
    "flags.showHeader": "ヘッダー表示",
    "flags.showProgress": "進捗表示",
    "flags.showCheckboxes": "チェックボックス表示",
    "flags.strikethrough": "完了項目に取り消し線",
    "layout.maxWidth": "最大幅",
    "layout.padding": "パディング",
    "layout.gap": "間隔",
    "colors.light.text": "ライトテキスト色",
    "colors.light.doneText": "ライト完了テキスト色",
    "colors.dark.text": "ダークテキスト色",
    "colors.dark.doneText": "ダーク完了テキスト色"
  },
  "tooltips": {
    "todo.showHeader": "タイトルと進捗ヘッダーを表示",
    "todo.showProgress": "完了/合計数を表示",
    "todo.showCheckboxes": "各項目のチェックボックスを表示",
    "todo.strikethrough": "完了した項目に取り消し線を引く",
    "colors.text": "テキスト色",
    "colors.doneText": "完了項目のテキスト色"
  }
}
```

### 5. 注册到 main.ts

`src/main.ts`：

```typescript
import { todo } from "./components/todo/index";  // ← 添加导入

export default class TesseraPlugin extends Plugin {
  async onload() {
    // ...
    
    const tessera: TesseraAPI = {
      version: "1.0.0",
      card: this.settings.card.enabled 
        ? ((options: any) => card({ ...this.settings.card.config, ...options }))
        : undefined,
      heatmap: this.settings.heatmap.enabled 
        ? ((options: any) => heatmap({ ...this.settings.heatmap.config, ...options }))
        : undefined,
      progressbar: this.settings.progressbar.enabled 
        ? ((options: any) => progressbar({ ...this.settings.progressbar.config, ...options }))
        : undefined,
      todo: this.settings.todo.enabled  // ← 新增
        ? ((options: any) => todo({ ...this.settings.todo.config, ...options }))
        : undefined,
    };
    
    // ...
  }
}
```

### 6. 构建并测试

```bash
npm run build
```

---

## 验证与调试

### 1. 翻译验证

构建时自动运行，检查：
- 所有组件字段是否有对应翻译
- 所有 tooltip 是否存在
- 分组名称是否完整

```bash
npm run build

# 输出示例：
# [TesseraScript] Translation warnings for "ja":
#   Missing field translations: ["todo.showLabel"]
#   Missing tooltip translations: ["todo.animated"]
```

### 2. 运行时 Fallback

如果翻译缺失，自动 fallback：
- **字段标签** → 显示字段名（如 `"todo.showLabel"`）
- **Tooltip** → 不显示

### 3. 调试技巧

```typescript
// 在组件中添加调试日志
export function todo(options: TodoOptions): HTMLElement {
  console.log("[TesseraScript] Todo options:", options);
  
  // 检查配置是否正确注入
  console.log("[TesseraScript] Todo config:", {
    flags: options.flags,
    layout: options.layout,
    colors: options.colors,
  });
  
  // ...
}
```

---

## 最佳实践

### 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件名 | 小写 + 连字符 | `todo-list`, `stat-card` |
| 文件名 | 小写 + 连字符 | `todo-list/index.ts` |
| 接口名 | PascalCase + Options | `TodoListOptions` |
| CSS 类名 | `ts-` 前缀 + BEM | `ts-todo-list__item--done` |
| CSS 变量 | `--ts-` 前缀 | `--ts-todo-list-bg-light` |

### 2. 颜色处理

始终支持 Light/Dark 双主题：

```typescript
const colors = {
  light: { ...defaultColors.light, ...options.colors?.light },
  dark: { ...defaultColors.dark, ...options.colors?.dark },
};

// 使用 CSS 变量
container.style.setProperty("--ts-xxx-bg-light", colors.light.background);
container.style.setProperty("--ts-xxx-bg-dark", colors.dark.background);
```

```css
/* CSS 中使用 */
.ts-xxx {
  background: var(--ts-xxx-bg-light);
}

.theme-dark .ts-xxx {
  background: var(--ts-xxx-bg-dark);
}
```

### 3. 配置优先级

```
用户输入 > 插件设置 config > 组件 config.ts 默认值
```

```typescript
// 合并配置（在 main.ts 中）
card: this.settings.card.enabled 
  ? ((options) => card({ 
      ...this.settings.card.config,  // 插件设置（来自 config.ts + 用户修改）
      ...options                      // 用户输入（最高优先级）
    }))
  : undefined,

// 组件内部合并（在 index.ts 中）
export function card(options: CardOptions = {}): HTMLElement {
  const flags = { ...CARD_DEFAULTS.flags, ...options.flags };
  const layout = { ...CARD_DEFAULTS.layout, ...options.layout };
  const colors = {
    light: { ...CARD_DEFAULTS.colors.light, ...options.colors?.light },
    dark: { ...CARD_DEFAULTS.colors.dark, ...options.colors?.dark },
  };
}
```

**配置数据流：**

```
components/card/config.ts (CARD_DEFAULTS)
        ↓
src/settings/fields.ts (DEFAULT_SETTINGS 引用 config.ts)
        ↓
main.ts loadSettings() (合并 data.json 用户配置)
        ↓
window.tessera.card (注入插件设置)
        ↓
用户调用 tessera.card({...}) (用户输入覆盖)
        ↓
card() 函数内部再次合并 (确保完整默认值)
```
用户输入 > 插件设置 config > 组件 config.ts 默认值
```

```typescript
// 合并配置（在 main.ts 中）
card: this.settings.card.enabled 
  ? ((options) => card({ 
      ...this.settings.card.config,  // 插件设置（来自 config.ts）
      ...options                      // 用户输入（最高优先级）
    }))
  : undefined,

// 组件内部进一步合并（在 index.ts 中）
export function card(options: CardOptions = {}): HTMLElement {
  const flags = { ...CARD_DEFAULTS.flags, ...options.flags };
  const layout = { ...CARD_DEFAULTS.layout, ...options.layout };
  const colors = {
    light: { ...CARD_DEFAULTS.colors.light, ...options.colors?.light },
    dark: { ...CARD_DEFAULTS.colors.dark, ...options.colors?.dark },
  };
}
```

### 4. 字段设计原则

- **独立字段**：每个配置项对应一个独立的字段路径
- **嵌套分组**：使用 `flags.*`, `layout.*`, `colors.*` 等分组
- **类型安全**：使用 TypeScript 接口严格定义
- **合理默认值**：确保所有字段都有默认值

### 5. i18n 完整性

添加新字段时，确保：
1. 所有语言文件都有对应翻译
2. Tooltip 解释清楚字段用途
3. 运行 `npm run build` 检查验证输出

---

## 检查清单

添加新组件时，确保完成以下步骤：

- [ ] 创建 `src/components/<name>/config.ts` 定义默认配置
- [ ] 创建 `src/components/<name>/index.ts` 实现组件
- [ ] 在 config.ts 中导出 `<NAME>_DEFAULTS` 常量
- [ ] 在 index.ts 中从 config.ts 导入并使用默认配置
- [ ] 支持 Light/Dark 双主题颜色
- [ ] 更新 `src/settings/types.ts` 添加接口
- [ ] 更新 `src/settings/fields.ts` 注册字段并导入配置
- [ ] 更新 `src/main.ts` 导入并注册组件
- [ ] 更新 `src/i18n/en.json` 添加英文翻译
- [ ] 更新 `src/i18n/zh.json` 添加中文翻译
- [ ] 更新 `src/i18n/ja.json` 添加日文翻译
- [ ] 运行 `npm run build` 验证无错误
- [ ] 检查 i18n 验证输出无警告
- [ ] 在 Obsidian 中测试组件渲染
- [ ] 测试设置界面配置是否生效
- [ ] 测试 Light/Dark 主题切换
