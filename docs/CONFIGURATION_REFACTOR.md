# 配置系统重构文档

## 概述

本次重构统一了所有组件的配置系统，解决了以下问题：

1. 配置结构不一致
2. 过度设计（heatmap的resolveConfig函数）
3. 命名逻辑不一致
4. 默认配置不完整
5. 字段类型不匹配

## 主要变化

### 1. 统一配置结构

所有组件现在使用相同的配置组：

| 配置组 | 用途 | 示例 |
|--------|------|------|
| `flags` | 布尔开关 | `showHeader`, `showTitle`, `showTooltip` |
| `layout` | 尺寸和间距 | `maxWidth`, `padding`, `radius`, `gap` |
| `colors` | 颜色配置 | `light.background`, `dark.border` |
| `styles` | 自定义样式 | `root`, `header`, `body` |

**移除的配置组**：
- `settings`（仅heatmap使用，已合并到其他组中）

### 2. 简化heatmap组件

**移除的内容**：
- `resolveConfig`函数
- `MutableHeatmapConfig`接口

**新的配置合并方式**：
```typescript
// 之前（过度设计）
const resolvedConfig = resolveConfig(options);
const flags = { ...resolvedConfig.flags, ...options.flags };

// 现在（统一方式）
const flags = { ...HEATMAP_DEFAULTS.flags, ...options.flags };
```

### 3. 统一命名逻辑

**flags命名规则**：统一使用`show`前缀 + 名词

| 组件 | 之前 | 之后 |
|------|------|------|
| heatmap | `enableTooltip` | `showTooltip` |
| progressbar | `striped` | `showStriped` |
| progressbar | `animated` | `showAnimated` |

### 4. 修复默认配置

**card新增字段**：
- `colors.light.hoverAccent`
- `colors.light.value`
- `colors.dark.hoverAccent`
- `colors.dark.value`

**heatmap新增字段**：
- `settings.monthNames`
- `settings.weekLabels`
- `settings.tooltipId`

**progressbar新增字段**：
- `colors.light.trackBorder`
- `colors.light.fillGradient`
- `colors.light.shadow`
- `colors.light.glow`
- `colors.dark.trackBorder`
- `colors.dark.fillGradient`
- `colors.dark.shadow`
- `colors.dark.glow`

### 5. 修复heatmap字段不匹配

**rangeMode选项**：
- 之前：`adaptive`, `fixed-days`, `fixed-range`
- 之后：`adaptive`, `fixed`, `year`

### 6. 重构progressbar顶级字段

**移动的字段**：
- `showLabel` → `flags.showLabel`

**保持的顶级字段**：
- `value`: 进度值
- `max`: 最大值
- `min`: 最小值
- `labelFormat`: 标签格式

## 组件配置结构

### Card

```typescript
interface CardOptions {
  title?: string;
  meta?: string;
  value?: unknown;
  content?: unknown;
  children?: unknown;
  emptyText?: string;
  className?: string | string[];
  flags?: {
    showHeader?: boolean;
    showHeaderSep?: boolean;
    showTitle?: boolean;
    showMeta?: boolean;
    showValue?: boolean;
  };
  layout?: {
    maxWidth?: string;
    padding?: string;
    radius?: string;
    gap?: string;
    bodyGap?: string;
  };
  colors?: {
    light?: {
      background?: string;
      border?: string;
      shadow?: string;
      hoverAccent?: string;
      value?: string;
    };
    dark?: {
      background?: string;
      border?: string;
      shadow?: string;
      hoverAccent?: string;
      value?: string;
    };
  };
  styles?: {
    card?: Record<string, unknown>;
    header?: Record<string, unknown>;
    title?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    body?: Record<string, unknown>;
    value?: Record<string, unknown>;
    empty?: Record<string, unknown>;
  };
}
```

### Heatmap

```typescript
interface HeatmapOptions {
  data?: Record<string, number | HeatmapEntry> | Map<string, number | HeatmapEntry>;
  startDate?: string | Date;
  endDate?: string | Date;
  getData?: (context: { start: Date; end: Date; locale: string }) => Promise<Map<string, HeatmapEntry>>;
  getCellStyle?: (context: HeatmapCellContext) => number | string | HeatmapCellStyle | null;
  renderTooltip?: (context: HeatmapCellContext & { visual: HeatmapCellStyle }) => string;
  flags?: {
    showMonthLabels?: boolean;
    showWeekLabels?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    mondayFirst?: boolean;
  };
  settings?: {
    rangeMode?: "adaptive" | "fixed" | "year";
    minWeeks?: number;
    fixedDays?: number;
    locale?: string;
    monthNames?: string[];
    weekLabels?: string[];
    legend?: string | false | null;
    tooltipId?: string;
  };
  layout?: {
    maxWidth?: string;
    cellSize?: number;
    cellGap?: number;
    cellRadius?: string;
    weekLabelWidth?: string;
    weekLabelGap?: string;
    monthLabelHeight?: string;
    monthOffset?: string;
    gridTopOffset?: string;
    monthLabelSize?: string;
    weekLabelSize?: string;
    legendGap?: string;
    legendTop?: string;
    legendSwatchSize?: string;
  };
  colors?: {
    light?: {
      dayBg?: string;
      tooltip?: string;
      tooltipBg?: string;
      levels?: string[];
    };
    dark?: {
      dayBg?: string;
      tooltip?: string;
      tooltipBg?: string;
      levels?: string[];
    };
    dayBg?: string;
    tooltip?: string;
    tooltipBg?: string;
    levels?: string[];
  };
  styles?: {
    root?: Record<string, unknown>;
    months?: Record<string, unknown>;
    weeks?: Record<string, unknown>;
    grid?: Record<string, unknown>;
    legend?: Record<string, unknown>;
  };
  className?: string | string[];
}
```

### Progressbar

```typescript
interface ProgressbarOptions {
  value?: number;
  max?: number;
  min?: number;
  labelFormat?: string;
  flags?: {
    showLabel?: boolean;
    showGlow?: boolean;
    showStriped?: boolean;
    showAnimated?: boolean;
  };
  layout?: {
    width?: string;
    height?: string;
    radius?: string;
    trackOpacity?: number;
  };
  colors?: {
    light?: {
      track?: string;
      trackBorder?: string;
      fill?: string;
      fillGradient?: string;
      shadow?: string;
      glow?: string;
      label?: string;
    };
    dark?: {
      track?: string;
      trackBorder?: string;
      fill?: string;
      fillGradient?: string;
      shadow?: string;
      glow?: string;
      label?: string;
    };
  };
  styles?: {
    root?: Record<string, unknown>;
    fill?: Record<string, unknown>;
  };
  className?: string | string[];
}
```

## 使用示例

### Card

```javascript
dv.container.appendChild(card({
  title: "今日任务",
  meta: "TODO",
  value: 5,
  content: "已完成的任务",
  flags: {
    showHeader: true,
    showTitle: true,
    showMeta: true,
    showValue: true,
  },
  layout: {
    padding: "16px",
    radius: "12px",
  },
  colors: {
    light: {
      background: "rgba(245, 248, 252, 0.9)",
      border: "rgba(120, 140, 160, 0.18)",
    },
  },
}));
```

### Heatmap

```javascript
dv.container.appendChild(heatmap({
  data: {
    "2024-01-01": 5,
    "2024-01-02": 3,
    "2024-01-03": 8,
  },
  flags: {
    showMonthLabels: true,
    showWeekLabels: true,
    showLegend: true,
    showTooltip: true,
    mondayFirst: true,
  },
  settings: {
    rangeMode: "adaptive",
    minWeeks: 12,
    locale: "zh-CN",
  },
  layout: {
    cellSize: 11,
    cellGap: 2,
  },
}));
```

### Progressbar

```javascript
dv.container.appendChild(progressbar({
  value: 75,
  max: 100,
  min: 0,
  labelFormat: "{value}%",
  flags: {
    showLabel: true,
    showGlow: true,
    showStriped: false,
    showAnimated: false,
  },
  layout: {
    width: "100%",
    height: "8px",
    radius: "4px",
  },
  colors: {
    light: {
      fill: "var(--interactive-accent)",
    },
  },
}));
```

## 迁移指南

### 从旧版本迁移

1. **heatmap用户**：
   - 将`enableTooltip`改为`showTooltip`
   - 将`rangeMode`从`fixed-days`或`fixed-range`改为`year`或`fixed`

2. **progressbar用户**：
   - 将`showLabel`移动到`flags.showLabel`
   - 将`striped`改为`flags.showStriped`
   - 将`animated`改为`flags.showAnimated`

### 设置界面

设置界面已自动更新，所有新字段都可在设置中找到。

## 技术细节

### 配置合并方式

所有组件现在使用相同的配置合并方式：

```typescript
const flags = { ...DEFAULTS.flags, ...options.flags };
const layout = { ...DEFAULTS.layout, ...options.layout };
const colors = {
  light: { ...DEFAULTS.colors.light, ...options.colors?.light },
  dark: { ...DEFAULTS.colors.dark, ...options.colors?.dark },
};
const styles = options.styles || {};
```

### 类型安全

所有配置都使用TypeScript接口定义，确保类型安全。

### 默认值

所有配置都有合理的默认值，确保组件在无配置时也能正常工作。

## 总结

本次重构统一了配置系统，提高了代码的一致性和可维护性。所有组件现在都遵循相同的配置模式，便于用户学习和使用。