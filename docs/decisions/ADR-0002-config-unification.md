# ADR-0002: 配置键名统一 + 极简配置

- 状态: Accepted
- 日期: 2026-08-29
- 关联: ADR-0001, ADR-0003

## 背景

用户反馈: 默认配置字段太多且乱、不友好; 颜色配置"一个颜色这样写、另一个颜色那样写"（card 用 background / progressbar 用 track / heatmap 用 dayBg 等不一致键名）。用户要求极简路线，同时保留基础功能和自定义空间。

## 决策

1. **统一语义键名 (非全局主题)**: 各组件 `colors.light` / `colors.dark` 下统一使用 `background / border / text / accent` 语义键 + 组件特有键（heatmap 的 `levels` 渐变数组、progressbar 可保留 `track` 语义但统一为 `background` 等）。**不做**全局共享主题对象（用户明确: "统一键名规范，不是全局共享主题"）。
2. **极简配置**: 字段数量大幅收敛; 设置面板只暴露**重要字段**，其余走默认值。
3. **保留嵌套结构**: flags/layout/colors/styles 分组骨架保留，不过度扁平化。
4. **默认值策略**: 除必填项外全部有默认值；重要字段默认填好但用户可改。

## 后果

- `src/components/*/config.ts` 的默认值结构已按语义键重构（card: background/border/text/accent; heatmap: background/text/tooltip/tooltipBg/levels; progressbar: background/border/text/accent）。
- `src/settings/fields.ts` 字段定义已收敛（删 shadow/hoverAccent/value/dayBg/track/fill/fillGradient/trackBorder/glow/label/showGlow/trackOpacity）。
- `src/settings/types.ts` 类型已同步。
- 用户已有 data.json 配置与新键不匹配 → loadSettings 中通过 `version` 字段门槛：不匹配则整体重置为默认（初期开发阶段接受破坏性变更）。
- i18n 的 fields/tooltips 文案已同步更新。

## 实施记录 (2026-08-30)

- 提交 7e46844 完成全部语义键迁移；`utils/dom.ts` 的 SHARED_COLOR_KEYS 改为 `["background","border","text","accent"]`。
- 三个组件 JSON 翻译中重复键问题：esbuild duplicate-object-key 警告 36 条 → 修复为只在 card 段保留一份 background/border/text/accent，heatmap 段仅保留 tooltip/tooltipBg。

## 相关文件

- `src/components/{card,heatmap,progressbar}/config.ts`
- `src/settings/fields.ts`
- `src/settings/types.ts`
- `src/main.ts`（loadSettings 旧数据迁移）
- `src/i18n/{en,zh,ja}.json`