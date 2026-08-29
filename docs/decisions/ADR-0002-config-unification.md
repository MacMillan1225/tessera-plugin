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

- `src/components/*/config.ts` 的默认值结构按语义键重构（card: background/border/text/accent/hoverAccent→收敛; heatmap: dayBg→background, tooltip/tooltipBg 保留; progressbar: track→background, fill→accent, label→text 等）。
- `src/settings/fields.ts` 字段定义收敛（删减不必要字段）。
- `src/settings/types.ts` 类型同步。
- 用户已有 data.json 配置与新键不匹配 → 需要迁移逻辑（loadSettings 时对旧键做映射或直接重置为默认，因处于初期开发阶段可接受破坏性变更）。
- i18n 的 fields/tooltips 文案同步更新。

## 相关文件

- `src/components/{card,heatmap,progressbar,example}/config.ts`
- `src/settings/fields.ts`
- `src/settings/types.ts`
- `src/main.ts`（loadSettings 旧数据迁移）
- `src/i18n/{en,zh,ja}.json`