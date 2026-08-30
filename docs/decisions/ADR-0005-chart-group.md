# ADR-0005: chart 分组 + ECharts 懒加载

- 状态: Accepted
- 日期: 2026-08-30
- 关联: ADR-0001（Lieflat 风格）、ADR-0003（API 命名空间）

## 背景

用户要求新增统计图表组件，参考 lieflat-charts skill 的风格（用户未安装该 skill，但将素材放在 `reference/lieflat-charts/`）:

> "我想加入一些新的图标（统计图表）进 tessera.chart 分组… 总体来说需要一些圆角，优雅的效果，悬浮可查看等… 我认为需要折线图/柱状图/Tick Gauge量表/Petal Rose玫瑰图，不需要自动切换的动效… 需要注意的是，假设要用到外部库，为了节约，在不开启chart时外部库不需要被加载。"

- 需求组件：折线图（line）、柱状图（bar）、Tick Gauge（gauge）、Petal Rose（rose）
- 视觉基准：lieflat-charts 的 mono 风格（INK #1C1C1A / PAPER #F0EFEB / MUTED #8F8E88 / GRID #DEDDD6，圆角、克制、悬浮查看）
- 硬性约束：外部图表库必须**懒加载**——chart 分组关闭时零加载

## 决策

1. **分组**: 新增 `tessera.chart` 分组（与 `tessera.core` 平级），受独立总开关 `chartEnabled` 控制（复用 ADR-0004 分组层级结构）。chart 关闭时五个 API 均为 `undefined`。
2. **图表库选型: ECharts**（非 Chart.js）。理由：
   - lieflat 参考的 Petal Rose 正是 ECharts `roseType: "area"` 双层实现；Tick Gauge 参考亦可用 ECharts gauge 系列 1:1 还原
   - 一个库覆盖四种图，风格一致，SVG renderer 与 Obsidian 主题/阴影兼容性好
   - ECharts 支持按需 init 与 dispose，适合懒加载模型
3. **懒加载机制**: `lib/echarts.min.js`（~1MB）作为独立资源放插件目录，**不打包进 main.js**。首次实际调用图表组件时由 `loader.ts` 动态注入 `<script>` 标签，成功后 `echarts.init` 渲染；`echartsPromise` 单例缓存，失败重置允许重试。类型仅用 `import type`（esbuild 擦除）。
4. **共享生命周期** `createChartBase`（shared.ts）：懒加载 → init(SVG) → setOption → ResizeObserver → 主题 MutationObserver（切主题 `setOption(notMerge)`）→ destroy(dispose)。所有图表组件复用，不重复样板。
5. **统一 tooltip** `lieflatTooltip(theme)`：纸底墨字（暗 `#1C1C1A`/`#F0EFEB`，亮 `#F0EFEB`/`#1C1C1A`）、圆角 12、无边框、柔和阴影——贴合 Lieflat 悬浮查看需求。
6. **颜色**沿用 mono 语义键（text/grid/track/accent/series），深浅主题分离；系列色板 `LIGHT_SERIES`/`DARK_SERIES` 取自 lieflat mono-tokens。

## 后果

- 新增 `src/components/chart/`：`loader.ts`（懒加载）、`shared.ts`（公共生命周期）、`config.ts`（5 组默认配置）、`line.ts`/`bar.ts`/`gauge.ts`/`rose.ts`/`radar.ts`、`index.ts`（createChartGroup）。
- `settings/types.ts`：`ComponentKey` 扩展 5 个图表键；`PluginSettings` 加 `chartEnabled` + 5 组件；`TesseraAPI` 加 `chart` 分组。`PluginSettings.version` 2→3。
- `settings/fields.ts`：GROUPS 数组驱动（core + chart 两组渲染）；DEFAULT_SETTINGS 加 5 组件。
- `settings-tab.ts`：renderCoreGroup 泛化为 renderGroup（分组渲染由 GROUPS 数据驱动）。
- `main.ts`：`getEchartsUrl()` 用 vault adapter 解析 lib 资源路径；createChartGroup 按 enabled 挂工厂；loadSettings/check-status 同步。
- `lib/echarts.min.js` 从 node_modules 复制（更新流程见 DEVELOPMENT.md）；`import type` 保证不打进 bundle。
- styles.css 追加 `.ts-chart` / `.ts-chart__canvas` 基础样式。
- **依赖变化**: `echarts` 进入 devDependencies（运行时经 UMD 加载，非打包依赖）。`chart.js` 曾安装但未选用，仍在 devDependencies（可清理）。
- 引用文档：docs/README.md（chart 示例）、ARCHITECTURE.md §7、CONFIGURATION.md §4、COMPONENT_DEVELOPMENT_GUIDE.md §5（新增图表组件模板）。

## 相关文件

- `src/components/chart/*`（loader/shared/config/line/bar/gauge/rose/radar/index）
- `src/main.ts`（getEchartsUrl / createChartGroup）
- `src/settings/{types,fields,settings-tab}.ts`
- `src/i18n/{en,zh,ja}.json`
- `lib/echarts.min.js`、`styles.css`