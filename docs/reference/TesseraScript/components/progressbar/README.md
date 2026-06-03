# progressbar

独立横向进度条组件，仅渲染进度条本体，不包含卡片容器、标题区或数值行。

适合用于 dashboard、设置面板、任务状态条等需要轻量进度表达的场景。

## 特点

1. 直接返回可 append 的 DOM 元素
2. 延续 `card` 的浅灰白、柔和圆角、细腻阴影语言
3. 支持 light / dark 双主题
4. 支持 `config.json` 默认配置与运行时覆盖
5. 支持单实例样式覆盖与 `root.parts.fill` 访问

## 加载方式

```dataviewjs
await dv.view("TesseraScript/tessera.bootstrap");
await dv.view("TesseraScript/core/dom");
await dv.view("TesseraScript/core/file");
await dv.view("TesseraScript/core/css");
await dv.view("TesseraScript/core/config");
await dv.view("TesseraScript/components/progressbar/index");
```

```js
const progressbar = Tessera.use("progressbar");
dv.container.appendChild(progressbar({ value: 0.72 }));
```

## API

`progressbar(options = {})`

常用字段：

1. `value`
当前值。默认按 `0-1` 比例处理；大于 `1` 且没有显式传入 `min` / `max` 时按百分数处理。
2. `min`
最小值，显式传入后会与 `max` 一起用于区间计算。
3. `max`
最大值，显式传入后会与 `min` 一起用于区间计算。
4. `label`
无视觉展示，仅用于 `aria-label`。
5. `flags.showGlow`
是否保留填充条柔和光晕。
6. `flags.striped`
是否启用条纹层。
7. `flags.animated`
是否播放条纹动画。
8. `layout.width`
进度条宽度。
9. `layout.height`
进度条高度。
10. `layout.radius`
进度条圆角。
11. `layout.trackOpacity`
轨道透明度。
11. `colors`
支持 `light` / `dark`，也支持扁平字段 `track`、`trackBorder`、`fill`、`fillGradient`、`shadow`、`glow`。
12. `styles.root`
根节点内联样式。
13. `styles.fill`
填充节点内联样式。

## 返回值

返回根节点 `div.ts-progressbar`。

可访问：

```js
const node = progressbar({ value: 0.48 });
node.parts.fill.style.opacity = "0.9";
```

## 说明

1. 根节点本身就是轨道容器，没有额外外层卡片
2. `aria-valuenow` 会自动转换为 `0-100`
3. 当 `max <= min` 时，会回退为 `value` 直接按 `0-1` 比例处理
