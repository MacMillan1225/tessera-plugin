# ADR-0001: 视觉风格转向 Lieflat 单色克制风

- 状态: Accepted
- 日期: 2026-08-29
- 关联: ADR-0002, ADR-0003

## 背景

当前组件样式为"白卡 + 1px 灰边框 + 紫色数字强调 + GitHub 绿热力图 + 薄荷绿进度条"，hover 有 translateY(-1px) + 3px 左侧强调条效果。用户提供 Lieflat Charts 图鉴截图（reference/风格参考1.png、风格参考2.png）作为目标风格，并要求"简洁一点"、"悬浮特效不想要那么夸张"、"颜色克制一点更好看"。

## 决策

1. **整体基调**: 暖灰底 + 无边框白卡（靠背景色差分层），对应 Lieflat 图鉴风格。
2. **单色灰体系为默认**: 组件颜色默认走黑白灰（`--text-normal` / 灰度层级），不默认彩色。
3. **保留单一强调色 (accent)**: 数值、进度填充、热力最高级可用强调色突出；**默认跟随黑白灰（克制），但用户可在配置中修改**。
4. **交互克制**: hover 等效果明显收敛（不做大位移/发光/大阴影），如卡片 hover 仅轻微背景变化。
5. **大圆角**: 卡片圆角保持 12–16px 范围。
6. **扁平化**: 不依赖透明度做层次（颜色默认实色 hex）。

## 后果

- styles.css 中 card/heatmap/progressbar/example 的颜色默认值、hover 规则、阴影规则需重写。
- 各组件 config.ts 中 rgba 默认值改为实色 hex（或 Obsidian 主题变量）。
- 深色反转卡片 (Inverted Card) 列为可选项，本轮不强制实现。

## 相关文件

- `styles.css`
- `src/components/{card,heatmap,progressbar,example}/config.ts`
- `src/components/{card,heatmap,progressbar,example}/index.ts`（hover 交互逻辑如有）