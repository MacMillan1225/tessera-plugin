# TesseraScript 架构详解：组件系统内部机制

## 目录

1. [组件与 Dataview API 的 Hook 机制](#1-组件与-dataview-api-的-hook-机制)
2. [组件命名空间系统](#2-组件命名空间系统)
3. [组件配置读取流程](#3-组件配置读取流程)
4. [默认配置处理机制](#4-默认配置处理机制)
5. [配置文件与 Obsidian 设置的 Hook](#5-配置文件与-obsidian-设置的-hook)

---

## 1. 组件与 Dataview API 的 Hook 机制

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Obsidian App                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Plugin Lifecycle                        │  │
│  │  ┌─────────┐    ┌─────────────┐    ┌─────────────────┐   │  │
│  │  │ onload() │───▶│ Check       │───▶│ Mount to        │   │  │
│  │  │         │    │ Dataview    │    │ window.tessera   │   │  │
│  │  └─────────┘    └─────────────┘    └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    DataviewJS Block                        │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ dv.container.appendChild(tessera.card({...}))       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Dataview 检测与 API 获取

```typescript
// src/main.ts - onload()

// 获取 Obsidian 插件系统
const appWithPlugins = this.app as unknown as { 
  plugins?: { 
    plugins?: Record<string, { api?: unknown }> 
  } 
};

// 获取 Dataview 插件的 API
const dataviewApi = appWithPlugins.plugins?.plugins?.["dataview"]?.api;

// 如果 Dataview 未安装，显示提示并退出
if (!dataviewApi) {
  new Notice("Dataview plugin is required. Please install and enable it.", 5000);
  return;
}
```

**关键点：**
- Dataview 通过 Obsidian 的插件系统注册自己
- `app.plugins.plugins["dataview"]` 是 Dataview 插件实例
- `.api` 属性暴露了 Dataview 的公共 API
- TesseraScript 不直接调用 Dataview API，而是**挂载到全局对象**供 DataviewJS 代码块访问

### 1.3 全局对象挂载

```typescript
// 创建 Tessera API 对象
const tessera: TesseraAPI = {
  version: "1.0.0",
  card: /* ... */,
  heatmap: /* ... */,
  progressbar: /* ... */,
};

// 挂载到 window 对象
(window as unknown as Record<string, unknown>).tessera = tessera;
```

**为什么挂载到 window？**

DataviewJS 代码块在**浏览器全局作用域**中执行：

```dataviewjs
// 这段代码在浏览器环境中运行
// 可以直接访问 window 对象上的属性
dv.container.appendChild(tessera.card({
  title: "Hello",
  value: 42
}));
```

**执行流程：**

```
1. Obsidian 加载 TesseraScript 插件
2. TesseraScript.onload() 执行
3. 检测 Dataview 是否可用
4. 创建 tessera API 对象
5. 挂载到 window.tessera
6. 用户在 DataviewJS 代码块中访问 tessera.xxx
7. 调用组件函数生成 DOM 元素
8. 添加到 dv.container
```

### 1.4 卸载时清理

```typescript
onunload() {
  // 从 window 对象移除
  delete (window as unknown as Record<string, unknown>).tessera;
}
```

**为什么要清理？**
- 防止插件重载时出现旧引用
- 避免内存泄漏
- 确保插件禁用后无法访问组件

---

## 2. 组件命名空间系统

### 2.1 命名空间结构

```
window.tessera
├── version: "1.0.0"
├── card: (options) => HTMLElement        // Card 组件函数
├── heatmap: (options) => HTMLElement     // Heatmap 组件函数
├── progressbar: (options) => HTMLElement // Progressbar 组件函数
└── example: (options) => HTMLElement     // Example 组件函数
```

### 2.2 类型定义

```typescript
// src/settings/types.ts

export interface TesseraAPI {
  version: string;
  card: ((options: any) => HTMLElement) | undefined;
  heatmap: ((options: any) => HTMLElement) | undefined;
  progressbar: ((options: any) => HTMLElement) | undefined;
  example: ((options: any) => HTMLElement);
}
```

**关键设计：**
- 每个组件是一个**函数**，接受 options，返回 HTMLElement
- 组件可以是 `undefined`（当被禁用时）
- `example` 始终可用，不受开关控制

### 2.3 组件注册流程

```typescript
// src/main.ts - onload()

import { card } from "./components/card/index";
import { heatmap } from "./components/heatmap/index";
import { progressbar } from "./components/progressbar/index";
import { example } from "./components/example/index";

const tessera: TesseraAPI = {
  version: "1.0.0",
  
  // 条件注册：只有启用时才挂载
  card: this.settings.card.enabled 
    ? ((options: any) => card({ ...this.settings.card.config, ...options }))
    : undefined,
    
  heatmap: this.settings.heatmap.enabled 
    ? ((options: any) => heatmap({ ...this.settings.heatmap.config, ...options }))
    : undefined,
    
  progressbar: this.settings.progressbar.enabled 
    ? ((options: any) => progressbar({ ...this.settings.progressbar.config, ...options }))
    : undefined,
    
  // 始终可用
  example,
};
```

### 2.4 添加新组件到命名空间

**步骤 1：导入组件函数**

```typescript
import { todo } from "./components/todo/index";
```

**步骤 2：添加到 TesseraAPI 类型**

```typescript
export interface TesseraAPI {
  // ... 现有组件 ...
  todo: ((options: any) => HTMLElement) | undefined;
}
```

**步骤 3：注册到命名空间**

```typescript
const tessera: TesseraAPI = {
  // ... 现有组件 ...
  todo: this.settings.todo.enabled 
    ? ((options: any) => todo({ ...this.settings.todo.config, ...options }))
    : undefined,
};
```

**步骤 4：在 loadSettings 中加载配置**

```typescript
async loadSettings() {
  const loaded = await this.loadData();
  this.settings = {
    // ... 现有组件 ...
    todo: {
      enabled: loaded?.todo?.enabled ?? DEFAULT_SETTINGS.todo.enabled,
      config: this.deepMerge(DEFAULT_SETTINGS.todo.config, loaded?.todo?.config),
    },
  };
}
```

---

## 3. 组件配置读取流程

### 3.1 配置优先级

```
用户输入 (options) 
    ↓ 最高优先级
插件设置 (this.settings.xxx.config)
    ↓ 
DEFAULT_SETTINGS 硬编码默认值
    ↓ 最低优先级
```

### 3.2 配置注入机制

```typescript
// 包装组件函数，注入插件设置作为默认值
card: this.settings.card.enabled 
  ? ((options: any) => card({ 
      ...this.settings.card.config,  // 插件设置作为基础
      ...options                      // 用户输入覆盖
    }))
  : undefined,
```

**展开运算符的作用：**

```typescript
// 示例：用户调用
tessera.card({
  title: "自定义标题",
  value: 42
})

// 实际传递给 card() 的参数
card({
  // 来自插件设置 (this.settings.card.config)
  flags: {
    showHeader: true,
    headerSep: true,
    showTitle: true,
    showMeta: true,
    showValue: true,
  },
  layout: {
    maxWidth: "100%",
    padding: "16px",
    radius: "16px",
    gap: "14px",
    bodyGap: "12px",
  },
  colors: { /* ... */ },
  
  // 来自用户输入 (options) - 覆盖同名属性
  title: "自定义标题",
  value: 42
})
```

### 3.3 深度合并 vs 浅合并

**当前实现：浅合并（Shallow Merge）**

```typescript
// 使用展开运算符，只合并顶层属性
{ ...this.settings.card.config, ...options }
```

**问题：嵌套对象会被完全覆盖**

```typescript
// 插件设置
this.settings.card.config = {
  flags: { showHeader: true, showTitle: true },
  layout: { padding: "16px" }
}

// 用户输入
options = {
  flags: { showHeader: false }  // 只想覆盖 showHeader
}

// 浅合并结果
{
  flags: { showHeader: false },  // showTitle 丢失了！
  layout: { padding: "16px" }
}
```

**解决方案：深度合并（Deep Merge）**

```typescript
// 如果需要保留嵌套属性，使用 deepMerge
card: this.settings.card.enabled 
  ? ((options: any) => card(this.deepMerge(
      this.settings.card.config,
      options
    )))
  : undefined,
```

**deepMerge 实现：**

```typescript
private deepMerge(
  target: Record<string, unknown>, 
  source?: Record<string, unknown>
): Record<string, unknown> {
  if (!source) return { ...target };
  
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && 
      typeof source[key] === "object" && 
      !Array.isArray(source[key]) &&
      target[key] && 
      typeof target[key] === "object" && 
      !Array.isArray(target[key])
    ) {
      // 递归合并嵌套对象
      result[key] = this.deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      // 直接覆盖
      result[key] = source[key];
    }
  }
  return result;
}
```

### 3.4 组件内部读取配置

```typescript
// src/components/card/index.ts

export function card(options: CardOptions = {}): HTMLElement {
  // 解构配置，提供默认值
  const flags = options.flags || {};
  const layout = options.layout || {};
  const themeColors = resolveThemeColors(options.colors || {});
  
  // 使用配置
  if (flags.showHeader !== false) {
    // 渲染头部
  }
  
  // 设置 CSS 变量
  container.style.setProperty("--ts-card-padding", layout.padding);
}
```

**配置读取模式：**

```typescript
// 模式 1：解构 + 默认值
const { 
  title = "", 
  value = 0, 
  showLabel = true 
} = options;

// 模式 2：嵌套对象 + 空对象默认值
const flags = options.flags || {};
const layout = options.layout || {};

// 模式 3：深度嵌套
const lightBg = options.colors?.light?.background ?? defaultColors.light.background;
```

---

## 4. 默认配置处理机制

### 4.1 配置架构（单一数据源）

TesseraScript 采用**单一数据源**的配置架构，每个组件的默认配置只在一个地方定义：

```
src/components/<name>/config.ts    ← 唯一数据源
        ↓
src/settings/fields.ts             ← 引用配置
        ↓
main.ts                            ← 加载并合并用户配置
```

### 4.2 组件配置文件

每个组件在 `config.ts` 中定义默认配置：

```typescript
// src/components/card/config.ts

export const CARD_DEFAULTS = {
  flags: {
    showHeader: true,
    headerSep: true,
    showTitle: true,
    showMeta: true,
    showValue: true,
  },
  layout: {
    maxWidth: "100%",
    padding: "16px",
    radius: "16px",
    gap: "14px",
    bodyGap: "12px",
  },
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
```

### 4.3 Settings 系统引用配置

`fields.ts` 中的 `DEFAULT_SETTINGS` 引用组件配置，不再重复定义：

```typescript
// src/settings/fields.ts

import { CARD_DEFAULTS } from "../components/card/config";
import { HEATMAP_DEFAULTS } from "../components/heatmap/config";
import { PROGRESSBAR_DEFAULTS } from "../components/progressbar/config";

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

### 4.4 默认配置的职责

| 职责 | 说明 |
|------|------|
| **初始值** | 首次安装时的配置 |
| **Fallback** | 用户配置缺失时的兜底 |
| **重置目标** | "恢复默认"功能的目标 |
| **类型参考** | 定义配置结构 |

### 4.5 配置加载流程

```typescript
// src/main.ts

async loadSettings() {
  // 1. 从磁盘加载用户配置
  const loaded = await this.loadData();
  
  // 2. 合并默认配置和用户配置
  this.settings = {
    card: {
      // enabled: 用户值 ?? 默认值
      enabled: loaded?.card?.enabled ?? DEFAULT_SETTINGS.card.enabled,
      
      // config: 深度合并默认值和用户值
      config: this.deepMerge(
        DEFAULT_SETTINGS.card.config,  // 基础：默认配置
        loaded?.card?.config            // 覆盖：用户配置
      ),
    },
    heatmap: { /* ... */ },
    progressbar: { /* ... */ },
  };
}
```

### 4.4 配置存储格式

**Obsidian 数据存储：**
- 位置：`<vault>/.obsidian/plugins/tessera-plugin/data.json`
- 格式：JSON
- 自动保存：通过 `this.saveData()` / `this.loadData()`

**data.json 结构：**

```json
{
  "card": {
    "enabled": true,
    "config": {
      "flags": {
        "showHeader": true,
        "showTitle": false
      },
      "layout": {
        "padding": "20px"
      }
    }
  },
  "heatmap": {
    "enabled": true,
    "config": { /* ... */ }
  },
  "progressbar": {
    "enabled": false,
    "config": { /* ... */ }
  }
}
```

**注意：只保存用户修改过的字段**

```typescript
// 用户只修改了 card.layout.padding
// data.json 只存储：
{
  "card": {
    "config": {
      "layout": {
        "padding": "20px"  // 只有这个
      }
    }
  }
}

// 其他字段从 DEFAULT_SETTINGS 读取
```

### 4.5 恢复默认配置

```typescript
// src/main.ts

async resetSettings() {
  // 深拷贝默认配置（避免引用污染）
  this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  
  // 保存到磁盘
  await this.saveSettings();
}
```

**为什么用 JSON.parse(JSON.stringify())？**

```typescript
// 错误：引用拷贝
this.settings = DEFAULT_SETTINGS;
// 修改 this.settings 会污染 DEFAULT_SETTINGS

// 正确：深拷贝
this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
// 完全独立的副本
```

---

## 5. 配置文件与 Obsidian 设置的 Hook

### 5.1 设置系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Obsidian Settings UI                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              TesseraSettingTab                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Card Section                                       │  │  │
│  │  │  ┌─────────────────────────────────────────────┐   │  │  │
│  │  │  │ Toggle: Enabled                             │   │  │  │
│  │  │  │ ─────────────────────────────────────────── │   │  │  │
│  │  │  │ Flags >                                     │   │  │  │
│  │  │  │   Toggle: Show Header                       │   │  │  │
│  │  │  │   Toggle: Show Title                        │   │  │  │
│  │  │  │ Layout >                                    │   │  │  │
│  │  │  │   Text: Padding                             │   │  │  │
│  │  │  │ Colors >                                    │   │  │  │
│  │  │  │   Color: Background                         │   │  │  │
│  │  │  └─────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Plugin Instance                              │  │
│  │  this.settings = { card: {...}, heatmap: {...}, ... }     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              data.json                                    │  │
│  │  { "card": { "config": { "layout": { "padding": "20px" } } } }
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 设置标签页注册

```typescript
// src/main.ts

export default class TesseraPlugin extends Plugin {
  async onload() {
    // ... 其他初始化 ...
    
    // 注册设置标签页
    this.addSettingTab(new TesseraSettingTab(this.app, this));
  }
}
```

**Obsidian 的设置系统：**
- `Plugin.addSettingTab()` 注册自定义设置页
- 设置页在 **Settings → Community plugins → TesseraScript** 中显示
- 点击设置页时调用 `display()` 方法渲染 UI

### 5.3 设置标签页实现

```typescript
// src/settings/settings-tab.ts

export class TesseraSettingTab extends PluginSettingTab {
  plugin: TesseraPluginLike;
  private needsReload = false;
  private t: Translations;

  constructor(app: App, plugin: TesseraPluginLike) {
    super(app, plugin);
    this.plugin = plugin;
    this.t = getTranslations();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();  // 清空之前的内容

    // 渲染各个组件的设置区域
    for (const [key, definition] of Object.entries(COMPONENTS)) {
      this.renderCollapsibleSection(
        containerEl,
        key as keyof PluginSettings,
        definition
      );
    }
  }
}
```

### 5.4 字段渲染与数据绑定

**字段类型映射：**

```typescript
private renderField(
  container: HTMLElement,
  config: Record<string, unknown>,
  field: SettingField
): void {
  const currentValue = this.getNestedValue(config, field.key);

  switch (field.type) {
    case "toggle":
      this.renderToggleField(setting, config, field, currentValue);
      break;
    case "color":
      this.renderColorField(setting, container, config, field, currentValue);
      break;
    case "select":
      this.renderSelectField(setting, config, field, currentValue);
      break;
    case "slider":
      this.renderSliderField(setting, config, field, currentValue);
      break;
    case "text":
    case "number":
      this.renderTextField(setting, config, field, currentValue);
      break;
  }
}
```

**Toggle 字段示例：**

```typescript
private renderToggleField(
  setting: Setting,
  config: Record<string, unknown>,
  field: SettingField,
  currentValue: unknown
): void {
  setting.addToggle((toggle) => {
    // 设置当前值
    toggle.setValue(Boolean(currentValue));
    
    // 绑定 onChange 事件
    toggle.onChange(async (value) => {
      // 1. 更新内存中的配置
      this.setNestedValue(config, field.key, value);
      
      // 2. 保存到磁盘
      await this.plugin.saveSettings();
      
      // 3. 显示重载按钮
      this.showReloadButton();
    });
  });
}
```

### 5.5 嵌套值读写

```typescript
// 读取嵌套值
private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: any = obj;
  
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

// 写入嵌套值
private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let current: any = obj;
  
  // 遍历到倒数第二层
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] == null || typeof current[part] !== "object") {
      current[part] = {};  // 自动创建中间对象
    }
    current = current[part];
  }
  
  // 设置最后一层的值
  current[parts[parts.length - 1]] = value;
}
```

**路径解析示例：**

```typescript
const config = {
  flags: {
    showHeader: true,
    showTitle: true,
  },
  layout: {
    padding: "16px",
  },
};

// 读取
getNestedValue(config, "flags.showHeader")      // true
getNestedValue(config, "layout.padding")         // "16px"
getNestedValue(config, "flags.showMeta")         // undefined

// 写入
setNestedValue(config, "flags.showHeader", false)
// config.flags.showHeader = false

setNestedValue(config, "colors.light.background", "#fff")
// 自动创建 config.colors = { light: { background: "#fff" } }
```

### 5.6 字段定义与 UI 生成

```typescript
// src/settings/fields.ts

export const COMPONENTS: Record<keyof PluginSettings, ComponentDefinition> = {
  card: {
    componentKey: "card",  // 用于 i18n 查找
    fields: [
      // 每个字段定义一个 UI 控件
      { key: "flags.showHeader", type: "toggle", description: "tooltip.flags.showHeader" },
      { key: "flags.headerSep", type: "toggle", description: "tooltip.flags.headerSep" },
      { key: "layout.maxWidth", type: "text", description: "tooltip.layout.maxWidth" },
      { key: "layout.padding", type: "text", description: "tooltip.layout.padding" },
      { key: "colors.light.background", type: "color", description: "tooltip.colors.background" },
    ],
  },
};
```

**字段定义 → UI 映射：**

| 字段定义 | 生成的 UI |
|----------|----------|
| `{ key: "flags.showHeader", type: "toggle" }` | Toggle 开关 |
| `{ key: "layout.padding", type: "text" }` | 文本输入框 |
| `{ key: "colors.light.background", type: "color" }` | 颜色选择器 |
| `{ key: "settings.locale", type: "select", options: [...] }` | 下拉选择框 |
| `{ key: "layout.trackOpacity", type: "slider", min: 0, max: 1 }` | 滑动条 |

### 5.7 设置保存流程

```
用户修改设置
    ↓
toggle.onChange() 触发
    ↓
更新内存中的配置
this.plugin.settings.card.config.flags.showHeader = false
    ↓
调用 saveSettings()
await this.plugin.saveData(this.settings)
    ↓
Obsidian 写入 data.json
    ↓
显示重载按钮
this.showReloadButton()
    ↓
用户点击 "Apply & Reload"
    ↓
执行 app:reload 命令
Obsidian 重新加载所有插件
    ↓
TesseraScript.onload() 重新执行
    ↓
loadSettings() 读取新的 data.json
    ↓
window.tessera 使用新配置
```

### 5.8 配置同步机制

**问题：设置修改后如何生效？**

```typescript
// 选项 1：立即生效（需要重新渲染所有 DataviewJS 块）
// 复杂，需要追踪所有使用 tessera 的代码块

// 选项 2：重载生效（当前实现）
// 简单可靠，用户手动触发
```

**当前实现：重载生效**

```typescript
// 显示重载按钮
private showReloadButton(): void {
  this.needsReload = true;
  if (this.reloadContainerEl) {
    this.reloadContainerEl.style.display = "block";
  }
}

// 重载按钮点击处理
btn.onClick(() => {
  // @ts-ignore - 内部 API
  this.app.commands.executeCommandById("app:reload");
});
```

### 5.9 组件开关的特殊处理

```typescript
// 开关组件时，需要重新渲染设置区域
headerSetting.addToggle((toggle) => {
  toggle.setValue(componentConfig.enabled);
  toggle.onChange(async (value) => {
    // 更新 enabled 状态
    this.plugin.settings[key].enabled = value;
    
    // 保存设置
    await this.plugin.saveSettings();
    
    // 显示重载按钮
    this.showReloadButton();
    
    // 重新渲染该组件的设置区域（不调用 display() 以保留重载按钮）
    this.rerenderSectionContent(section, key, definition);
  });
});
```

**为什么不用 display()？**

```typescript
// 如果调用 display()：
this.display()  // 会重新渲染整个页面

// 问题：
// 1. 重载按钮状态丢失（needsReload 重置）
// 2. 折叠状态丢失
// 3. 滚动位置重置

// 解决方案：只重新渲染该组件的设置区域
this.rerenderSectionContent(section, key, definition);
```

---

## 附录：完整数据流图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         数据流全景图                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  DEFAULT_    │     │  data.json   │     │  用户调用    │
│  SETTINGS    │     │  (磁盘)      │     │  tessera.xxx │
│  (代码)      │     │              │     │  (DataviewJS)│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │    deepMerge()     │                    │
       └──────────┬─────────┘                    │
                  │                              │
                  ▼                              │
       ┌──────────────────┐                      │
       │  plugin.settings │                      │
       │  (内存)          │                      │
       └────────┬─────────┘                      │
                │                                │
                │    展开运算符 {...config, ...options}
                │                                │
                ▼                                ▼
       ┌────────────────────────────────────────────┐
       │           组件函数 card(options)           │
       │           heatmap(options)                 │
       │           progressbar(options)             │
       └────────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  HTMLElement   │
                   │  (DOM 元素)    │
                   └────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ dv.container   │
                   │ .appendChild() │
                   └────────────────┘
```

---

## 附录：关键代码位置索引

| 功能 | 文件位置 |
|------|----------|
| Dataview 检测 | `src/main.ts:27-35` |
| 全局对象挂载 | `src/main.ts:54` |
| 组件包装（配置注入） | `src/main.ts:41-49` |
| 配置加载 | `src/main.ts:86-101` |
| 配置保存 | `src/main.ts:104-106` |
| 深度合并 | `src/main.ts:113-135` |
| 默认配置定义 | `src/settings/fields.ts:123-244` |
| 字段定义 | `src/settings/fields.ts:17-118` |
| 设置标签页 | `src/settings/settings-tab.ts:21-577` |
| 嵌套值读写 | `src/settings/settings-tab.ts:300-350` |
| 类型定义 | `src/settings/types.ts:1-82` |
