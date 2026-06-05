# TesseraScript 配置系统详解

## 目录

1. [配置架构概述](#1-配置架构概述)
2. [组件配置文件](#2-组件配置文件)
3. [Settings 系统集成](#3-settings-系统集成)
4. [配置优先级](#4-配置优先级)
5. [添加新配置字段](#5-添加新配置字段)
6. [配置数据流](#6-配置数据流)

---

## 1. 配置架构概述

TesseraScript 采用**单一数据源**的配置架构，每个组件的默认配置只在一个地方定义：

```
┌─────────────────────────────────────────────────────────────┐
│                    配置数据流                                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ components/*/config.ts│  ← 单一数据源（默认配置）
└──────────┬───────────┘
           │ 导入引用
           ▼
┌──────────────────────┐
│ settings/fields.ts   │  ← DEFAULT_SETTINGS 引用 config.ts
└──────────┬───────────┘
           │ 深度合并
           ▼
┌──────────────────────┐
│ main.ts              │  ← loadSettings() 合并用户配置
└──────────┬───────────┘
           │ 注入到组件
           ▼
┌──────────────────────┐
│ window.tessera.xxx   │  ← 组件函数接收完整配置
└──────────────────────┘
```

### 优势

| 优势 | 说明 |
|------|------|
| **无重复** | 每个配置值只定义一次 |
| **易于维护** | 修改配置只需改一个文件 |
| **类型安全** | TypeScript 自动推导类型 |
| **易于扩展** | 添加新字段只需修改 config.ts |

---

## 2. 组件配置文件

### 2.1 文件位置

每个组件的配置文件位于：

```
src/components/<name>/config.ts
```

现有组件：

| 组件 | 配置文件 | 常量名 |
|------|----------|--------|
| Card | `src/components/card/config.ts` | `CARD_DEFAULTS` |
| Heatmap | `src/components/heatmap/config.ts` | `HEATMAP_DEFAULTS` |
| Progressbar | `src/components/progressbar/config.ts` | `PROGRESSBAR_DEFAULTS` |
| Example | `src/components/example/config.ts` | `EXAMPLE_DEFAULTS` |

### 2.2 配置文件结构

```typescript
// src/components/card/config.ts

export const CARD_DEFAULTS = {
  // 功能开关
  flags: {
    showHeader: true,
    headerSep: true,
    showTitle: true,
    showMeta: true,
    showValue: true,
  },
  
  // 布局配置
  layout: {
    maxWidth: "100%",
    padding: "16px",
    radius: "16px",
    gap: "14px",
    bodyGap: "12px",
  },
  
  // 颜色配置（支持 Light/Dark 主题）
  colors: {
    light: {
      background: "rgba(245, 248, 252, 0.9)",
      border: "rgba(120, 140, 160, 0.18)",
      shadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
      hoverAccent: "var(--interactive-accent)",
      value: "var(--text-accent, var(--text-normal))",
    },
    dark: {
      background: "rgba(30, 41, 59, 0.72)",
      border: "rgba(148, 163, 184, 0.18)",
      shadow: "0 16px 36px rgba(2, 6, 23, 0.28)",
      hoverAccent: "var(--interactive-accent)",
      value: "var(--text-accent, var(--text-normal))",
    },
  },
};

// 导出类型（可选，用于类型推导）
export type CardConfig = typeof CARD_DEFAULTS;
```

### 2.3 在组件中使用配置

```typescript
// src/components/card/index.ts

import { CARD_DEFAULTS } from "./config";

export function card(options: CardOptions = {}): HTMLElement {
  // 合并默认配置和用户选项
  const flags = { ...CARD_DEFAULTS.flags, ...options.flags };
  const layout = { ...CARD_DEFAULTS.layout, ...options.layout };
  const colors = {
    light: { ...CARD_DEFAULTS.colors.light, ...options.colors?.light },
    dark: { ...CARD_DEFAULTS.colors.dark, ...options.colors?.dark },
  };
  
  // 使用配置...
}
```

---

## 3. Settings 系统集成

### 3.1 fields.ts 引用配置

`src/settings/fields.ts` 导入组件配置并创建 `DEFAULT_SETTINGS`：

```typescript
// src/settings/fields.ts

import type { ComponentDefinition, PluginSettings } from "./types";
import { CARD_DEFAULTS } from "../components/card/config";
import { HEATMAP_DEFAULTS } from "../components/heatmap/config";
import { PROGRESSBAR_DEFAULTS } from "../components/progressbar/config";

// 字段定义（驱动 Settings UI）
export const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
  card: {
    componentKey: "card",
    fields: [
      { key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" },
      { key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
      { key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
      // ...
    ],
  },
  // ...
};

// 默认配置（引用组件配置）
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
};
```

### 3.2 main.ts 加载配置

```typescript
// src/main.ts

import { DEFAULT_SETTINGS } from "./settings";

export default class TesseraPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  
  async onload() {
    await this.loadSettings();
    
    // 注册组件，注入配置
    const tessera: TesseraAPI = {
      card: this.settings.card.enabled 
        ? ((options) => card({ ...this.settings.card.config, ...options }))
        : undefined,
      // ...
    };
  }
  
  async loadSettings() {
    const loaded = await this.loadData();
    
    this.settings = {
      card: {
        enabled: loaded?.card?.enabled ?? DEFAULT_SETTINGS.card.enabled,
        config: this.deepMerge(
          DEFAULT_SETTINGS.card.config,  // 来自 CARD_DEFAULTS
          loaded?.card?.config
        ),
      },
      // ...
    };
  }
}
```

---

## 4. 配置优先级

配置按以下优先级合并（从低到高）：

```
1. 组件 config.ts 默认值    ← 最低优先级
2. 用户在 Settings UI 的修改
3. 用户调用时传入的选项      ← 最高优先级
```

### 4.1 合并示例

```typescript
// 1. 组件 config.ts 定义默认值
const CARD_DEFAULTS = {
  layout: { padding: "16px", radius: "16px" },
  colors: { light: { background: "rgba(245, 248, 252, 0.9)" } }
};

// 2. 用户在 Settings UI 修改了 padding
this.settings.card.config = {
  layout: { padding: "24px" }  // 只保存修改的字段
};

// 3. 用户调用时传入选项
tessera.card({
  layout: { radius: "8px" },
  title: "Hello"
});

// 最终传给 card() 函数的配置
card({
  layout: { padding: "24px", radius: "8px" },  // 合并结果
  colors: { light: { background: "rgba(245, 248, 252, 0.9)" } },
  title: "Hello"
});
```

---

## 5. 添加新配置字段

### 5.1 步骤

1. **修改组件 config.ts**：添加新字段和默认值
2. **修改 settings/fields.ts**：添加字段定义（驱动 UI）
3. **添加 i18n 翻译**：翻译字段标签和 tooltip

### 5.2 示例：为 Card 添加 `showIcon` 字段

#### 步骤 1：修改 config.ts

```typescript
// src/components/card/config.ts

export const CARD_DEFAULTS = {
  flags: {
    showHeader: true,
    headerSep: true,
    showTitle: true,
    showMeta: true,
    showValue: true,
    showIcon: false,  // ← 新增
  },
  // ...
};
```

#### 步骤 2：修改 fields.ts

```typescript
// src/settings/fields.ts

card: {
  componentKey: "card",
  fields: [
    // ... 现有字段 ...
    { key: "flags.showIcon", type: "toggle", description: "tooltip.flags.showIcon" },  // ← 新增
  ],
},
```

#### 步骤 3：添加翻译

```json
// src/i18n/en.json
{
  "fields": {
    "flags.showIcon": "Show Icon"
  },
  "tooltips": {
    "flags.showIcon": "Display icon in the header"
  }
}
```

---

## 6. 配置数据流

### 6.1 完整数据流图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         配置数据流                                   │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  components/     │     │  settings/       │     │  用户调用        │
│  */config.ts     │     │  fields.ts       │     │  tessera.xxx()   │
│  (默认配置)      │     │  (DEFAULT_SETTINGS)    │  (用户选项)      │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                         │
         │    导入引用             │    深度合并             │
         └────────────────┬───────┘                         │
                          │                                 │
                          ▼                                 │
                 ┌──────────────────┐                       │
                 │  main.ts         │                       │
                 │  loadSettings()  │                       │
                 └────────┬─────────┘                       │
                          │                                 │
                          │    注入配置                      │
                          ▼                                 │
                 ┌──────────────────┐                       │
                 │  window.tessera  │                       │
                 │  .xxx(config)    │                       │
                 └────────┬─────────┘                       │
                          │                                 │
                          │    展开合并                      │
                          ▼                                 ▼
                 ┌────────────────────────────────────────────┐
                 │           组件函数 card(options)           │
                 │           heatmap(options)                 │
                 │           progressbar(options)             │
                 └────────────────────────────────────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │  HTMLElement   │
                 └────────────────┘
```

### 6.2 配置存储

**磁盘存储位置：** `<vault>/.obsidian/plugins/tessera-plugin/data.json`

**存储格式：** 只保存用户修改过的字段

```json
{
  "card": {
    "enabled": true,
    "config": {
      "layout": {
        "padding": "24px"  // 只有用户修改的字段
      }
    }
  }
}
```

**其他字段从 config.ts 读取默认值。**

---

## 附录：关键文件索引

| 文件 | 职责 |
|------|------|
| `src/components/*/config.ts` | 组件默认配置（单一数据源） |
| `src/settings/fields.ts` | 字段定义 + DEFAULT_SETTINGS |
| `src/settings/types.ts` | TypeScript 类型定义 |
| `src/settings/settings-tab.ts` | Settings UI 实现 |
| `src/main.ts` | 配置加载和组件注册 |
