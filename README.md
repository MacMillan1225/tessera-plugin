# TesseraScript

基于 **Obsidian + DataviewJS** 的组件库插件。在 `dataviewjs` 代码块中直接调用 `tessera` 全局对象，即可渲染卡片、热力图、进度条与图表，快速搭建个人看板。

## 特性

- **core 组件**：`tessera.core.card` / `heatmap` / `progressbar` / `list` / `tags`
- **chart 组件**：`tessera.chart.line` / `bar` / `gauge` / `rose` / `radar`（ECharts，懒加载，关闭分组零加载）
- **Lieflat 视觉**：单色克制风，无边框靠背景色差分层，圆角优雅，hover 克制，自动适配明暗主题
- **语义化配置**：统一 `background / border / text / accent` 键，极简默认值，每个组件可独立开关
- **设置层级化**：分组总开关 → 组件开关 → 字段配置
- **AI Skill**：内置 `skills/tessera-dashboard/`，让 AI 基于本插件自动生成看板（需配合支持 skill 的 AI 工具使用）

## 快速开始

```dataviewjs
// 卡片
dv.container.appendChild(tessera.core.card({
  title: "任务总览",
  meta: "TODO",
  value: 42,
}));

// 进度条（value 为 0..1 小数，0.5 = 50%）
dv.container.appendChild(tessera.core.progressbar({
  value: 0.5,
  labelFormat: "{value}%",
}));
```

## 安装

1. 构建：`npm run build`
2. 将 `main.js`、`manifest.json`、`styles.css` 复制到 `<Vault>/.obsidian/plugins/tessera-plugin/`
3. 在 Obsidian **Settings → Community plugins** 中启用

**前置依赖**：[Dataview](https://github.com/blacksmithgu/obsidian-dataview) 插件。

## 文档

- [用户手册](docs/README.md) — 全部组件的用法与示例
- [配置参考](docs/CONFIGURATION.md) — 全部可调参数的完整说明
- [架构说明](docs/ARCHITECTURE.md) — 插件内部结构与设计决策
- [开发指南](docs/DEVELOPMENT.md) — 构建、调试与发布
- [组件开发指南](docs/COMPONENT_DEVELOPMENT_GUIDE.md) — 如何新增组件
- [设计决策记录](docs/decisions/) — ADR-0001 ~ ADR-0005

## License

BSD