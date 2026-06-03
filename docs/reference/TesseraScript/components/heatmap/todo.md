# heatmap TODO

## 目标

让 `heatmap` 组件的图例支持以下能力：

1. 可调整图例显示位置
2. 可控制图例在一行中的对齐方式
3. 可控制图例相对热力图主体的偏移量
4. 保持现有默认行为不被破坏

## 当前实现现状

目前图例的实现比较固定：

1. `parts.legend` 在 `index.js` 中固定创建为 `div.ts-heatmap__legend`
2. 在 DOM 顺序上固定追加到 `root` 的最后
3. 默认显示在热力图主体下方
4. 样式主要由 `style.css` 中的 `.ts-heatmap__legend` 控制
5. 对齐方式目前只能通过 `styles.legend` 手动覆盖，例如 `justifyContent: "flex-end"`

也就是说，现在可以“微调样式”，但没有正式的图例布局配置接口。

## 建议新增配置字段

需要在 `index.js` 的默认配置和 `config.json` 中同步增加图例布局配置，例如：

```js
legendLayout: {
  position: "bottom",   // bottom | top
  align: "left",        // left | center | right
  offsetX: "0px",
  offsetY: "0px",
  fullWidth: true,
  wrap: true
}
```

字段说明：

1. `legendLayout.position`
图例显示位置。

- `bottom`: 显示在热力图下方
- `top`: 显示在热力图上方

2. `legendLayout.align`
图例在当前行内的对齐方式。

- `left`: 左对齐
- `center`: 居中
- `right`: 右对齐

3. `legendLayout.offsetX`
图例水平方向偏移量，例如 `8px`、`-12px`。

4. `legendLayout.offsetY`
图例垂直方向偏移量，例如 `4px`、`-6px`。

5. `legendLayout.fullWidth`
是否让图例容器占满整行宽度，便于做左中右对齐。

6. `legendLayout.wrap`
图例内容过长时是否自动换行。

## 需要修改的文件

1. `index.js`
2. `style.css`
3. `config.json`
4. `README.md`
5. `demo.md`

## 需要修改的核心位置

### 1. `index.js`

这是主要逻辑修改点。

#### 需要处理的内容

1. 扩展默认配置
在 `defaultHeatmapConfig` 中新增 `legendLayout`。

2. 增加图例布局解析函数
建议新增类似：

```js
function resolveLegendLayout(layout) { ... }
```

用于统一处理：

- `position`
- `align`
- `offsetX`
- `offsetY`
- `fullWidth`
- `wrap`

3. 在 `heatmap()` 中解析图例布局配置
在 `resolved`、`layout`、`styles` 旁边新增：

```js
const legendLayout = resolveLegendLayout(resolved.legendLayout);
```

4. 调整根节点 CSS 变量
可以把偏移量和对齐方式通过 CSS 变量传给根节点，例如：

```js
"--ts-heatmap-legend-offset-x": legendLayout.offsetX,
"--ts-heatmap-legend-offset-y": legendLayout.offsetY,
```

5. 调整图例节点 class
创建 `parts.legend` 时增加位置和对齐 class，例如：

```js
className: [
  "ts-heatmap__legend",
  `ts-heatmap__legend--${legendLayout.position}`,
  `ts-heatmap__legend--align-${legendLayout.align}`,
  legendLayout.fullWidth !== false && "ts-heatmap__legend--full",
  legendLayout.wrap === false && "ts-heatmap__legend--nowrap",
],
```

6. 调整 DOM 追加顺序
现在顺序是：

```js
root.appendChild(parts.months);
root.appendChild(parts.body);
root.appendChild(parts.legend);
```

如果支持 `top` / `bottom`，这里要改成根据 `legendLayout.position` 决定：

- `top`: `legend` 在 `months/body` 之前或在 `months/body` 之后但样式重新排布
- `bottom`: 保持现在逻辑

推荐做法：

1. 新建一个主内容容器，例如 `parts.main`
2. `main` 内部放 `months + body`
3. `root` 根据位置决定是 `[legend, main]` 还是 `[main, legend]`

这样后续扩展更稳。

7. 保持 `parts.legend` 访问方式不变
即使结构变化，也建议继续保留：

```js
node.parts.legend
```

### 2. `style.css`

当前 `.ts-heatmap__legend` 是固定底部行样式，需要扩展。

#### 需要新增或调整的样式

1. 图例基础布局

- `.ts-heatmap__legend`

继续作为基础类，但要支持位置、对齐和偏移变量。

2. 图例位置类

- `.ts-heatmap__legend--top`
- `.ts-heatmap__legend--bottom`

职责：

1. 控制上下外边距
2. 处理与月份标签、网格之间的距离关系

3. 图例对齐类

- `.ts-heatmap__legend--align-left`
- `.ts-heatmap__legend--align-center`
- `.ts-heatmap__legend--align-right`

职责：

通过 `justify-content` 控制整行图例对齐。

4. 图例宽度与换行类

- `.ts-heatmap__legend--full`
- `.ts-heatmap__legend--nowrap`

职责：

1. 控制是否占满整行
2. 控制是否允许换行

5. 偏移支持

建议通过 CSS 变量实现：

```css
transform: translate(
  var(--ts-heatmap-legend-offset-x, 0px),
  var(--ts-heatmap-legend-offset-y, 0px)
);
```

这样可以同时支持左右和上下偏移。

### 3. `config.json`

同步新增默认字段，避免配置文件和代码默认值脱节。

建议新增：

```json
"legendLayout": {
  "position": "bottom",
  "align": "left",
  "offsetX": "0px",
  "offsetY": "0px",
  "fullWidth": true,
  "wrap": true
},
```

### 4. `README.md`

需要补充图例布局配置说明。

#### 需要更新的点

1. 在主要参数中补充 `legendLayout`
2. 在配置说明里补充：

- `legendLayout.position`
- `legendLayout.align`
- `legendLayout.offsetX`
- `legendLayout.offsetY`
- `legendLayout.fullWidth`
- `legendLayout.wrap`

3. 说明默认行为仍是下方显示
4. 说明仍然可以通过 `styles.legend` 做单实例微调，但推荐优先使用正式配置

### 5. `demo.md`

需要增加图例位置和对齐的示例。

建议至少补以下场景：

1. 下方左对齐
2. 下方右对齐
3. 下方居中
4. 上方左对齐
5. 上方右对齐
6. 通过 `offsetX` / `offsetY` 做偏移

## 按代码位置逐段修改的操作清单

下面这部分按文件和代码位置排列，适合直接照着手动改。

### A. 修改 `index.js`

#### A1. 在 `defaultHeatmapConfig` 中新增 `legendLayout`

位置：`const defaultHeatmapConfig = { ... }`

建议加在顶层配置中，靠近 `flags`、`settings`、`layout` 一带：

```js
legendLayout: {
  position: "bottom",
  align: "left",
  offsetX: "0px",
  offsetY: "0px",
  fullWidth: true,
  wrap: true,
},
```

目标：

给图例位置和排列留正式配置入口。

#### A2. 在 `resolveLegend()` 后新增图例布局解析函数

位置：`function resolveLegend(option, context) { ... }` 后面新增

建议新增：

```js
function resolveLegendLayout(layout) { ... }
```

函数职责：

1. 校验 `position` 只允许 `top` / `bottom`
2. 校验 `align` 只允许 `left` / `center` / `right`
3. 为 `offsetX` / `offsetY` 提供默认值
4. 规范 `fullWidth`、`wrap` 的布尔值

目标：

把图例布局相关的容错逻辑集中起来。

#### A3. 在 `heatmap()` 中解析 `legendLayout`

位置：`const resolved = heatmapConfig.merge(options);` 后面这些变量定义区域

在这里补一行：

```js
const legendLayout = resolveLegendLayout(resolved.legendLayout);
```

目标：

后面创建 DOM 和设置样式都统一用解析后的结果。

#### A4. 在根节点 style 中增加图例偏移变量

位置：`const root = dom.createElement("section", { style: mergeStyles({ ... }) })`

在 style 变量区增加：

```js
"--ts-heatmap-legend-offset-x": legendLayout.offsetX,
"--ts-heatmap-legend-offset-y": legendLayout.offsetY,
```

如果你想顺手把顶部和底部间距也参数化，后面也可以继续扩展。

#### A5. 新增 `parts.main` 容器

位置：现在已有：

```js
parts.months = ...
parts.weeks = ...
parts.grid = ...
parts.body = ...
parts.legend = ...
```

建议新增：

```js
parts.main = dom.createElement("div", {
  className: "ts-heatmap__main",
  children: [parts.months, parts.body],
});
```

目标：

把“热力图主体”和“图例”拆成两个清晰层级，便于控制上下顺序。

#### A6. 调整 `parts.legend` 的 className

位置：`parts.legend = dom.createElement("div", { ... })`

把固定 class 改成数组形式，建议类似：

```js
className: [
  "ts-heatmap__legend",
  `ts-heatmap__legend--${legendLayout.position}`,
  `ts-heatmap__legend--align-${legendLayout.align}`,
  legendLayout.fullWidth !== false && "ts-heatmap__legend--full",
  legendLayout.wrap === false && "ts-heatmap__legend--nowrap",
],
```

目标：

把图例布局逻辑转成清晰 class，而不是全部塞进内联 style。

#### A7. 调整根节点 append 顺序

位置：现在是：

```js
root.appendChild(parts.months);
root.appendChild(parts.body);
root.appendChild(parts.legend);
```

建议改成：

1. 不再直接 append `months` 和 `body`
2. 改为 append `parts.main`
3. 再根据 `legendLayout.position` 决定 legend 在前还是在后

结构目标：

```js
if (legendLayout.position === "top") {
  root.appendChild(parts.legend);
  root.appendChild(parts.main);
} else {
  root.appendChild(parts.main);
  root.appendChild(parts.legend);
}
```

#### A8. 保持 `renderLegend()` 主体逻辑不变

位置：`function renderLegend(parts, context, legendOption, showLegend) { ... }`

这段当前只负责把 legend token 渲染成文本和色块，主体逻辑可以基本不动。

建议仅注意两点：

1. 不要把“位置逻辑”塞进这里
2. 让它只专注于“图例内容渲染”

### B. 修改 `style.css`

#### B1. 保留现有 `.ts-heatmap__legend` 基础样式

但建议把它升级成支持位置、对齐和偏移变量。

#### B2. 新增主体容器样式

建议新增：

```css
.ts-heatmap__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

#### B3. 扩展图例基础样式

位置：`.ts-heatmap__legend { ... }`

建议补上：

1. `width` 相关控制
2. `justify-content` 由对齐类决定
3. `transform` 使用偏移变量

例如：

```css
transform: translate(
  var(--ts-heatmap-legend-offset-x, 0px),
  var(--ts-heatmap-legend-offset-y, 0px)
);
```

#### B4. 新增位置类

建议新增：

```css
.ts-heatmap__legend--top { ... }
.ts-heatmap__legend--bottom { ... }
```

职责：

1. 控制图例与主体之间的上下距离
2. 顶部时取消底部样式假设
3. 底部时保持现有默认视觉

#### B5. 新增对齐类

建议新增：

```css
.ts-heatmap__legend--align-left { justify-content: flex-start; }
.ts-heatmap__legend--align-center { justify-content: center; }
.ts-heatmap__legend--align-right { justify-content: flex-end; }
```

#### B6. 新增宽度和换行类

建议新增：

```css
.ts-heatmap__legend--full { width: 100%; }
.ts-heatmap__legend--nowrap { flex-wrap: nowrap; }
```

目标：

让左中右对齐真正稳定，而不是依赖内容宽度碰运气。

### C. 修改 `config.json`

#### C1. 同步补充 `legendLayout`

位置：根对象中与 `flags`、`settings` 同级新增：

```json
"legendLayout": {
  "position": "bottom",
  "align": "left",
  "offsetX": "0px",
  "offsetY": "0px",
  "fullWidth": true,
  "wrap": true
},
```

### D. 修改 `README.md`

#### D1. 在主要参数里加入 `legendLayout`

位置：支持参数列表中 `legend`、`showLegend` 附近。

#### D2. 补充 `legendLayout` 配置说明

需要增加：

1. `position`
2. `align`
3. `offsetX`
4. `offsetY`
5. `fullWidth`
6. `wrap`

#### D3. 更新图例相关说明

明确写出：

1. 默认还是底部
2. 现在可以顶部/底部切换
3. 现在可以左中右对齐
4. 现在可以通过偏移量做细调

### E. 修改 `demo.md`

#### E1. 增加底部右对齐示例

示例重点：

```js
legendLayout: {
  position: "bottom",
  align: "right",
}
```

#### E2. 增加底部居中示例

示例重点：

```js
legendLayout: {
  position: "bottom",
  align: "center",
}
```

#### E3. 增加顶部左对齐示例

示例重点：

```js
legendLayout: {
  position: "top",
  align: "left",
}
```

#### E4. 增加偏移示例

示例重点：

```js
legendLayout: {
  position: "bottom",
  align: "right",
  offsetX: "-6px",
  offsetY: "4px",
}
```

#### E5. 保留 `styles.legend` 的示例，但弱化为补充手段

避免以后用户继续只靠 `justifyContent` 手改，而不知道有正式配置。

## 推荐实现顺序

1. 先改 `defaultHeatmapConfig`
2. 再新增 `resolveLegendLayout()`
3. 在 `heatmap()` 中解析 `legendLayout`
4. 增加 `parts.main`
5. 调整 `parts.legend` 的 className
6. 调整 `root.appendChild(...)` 顺序
7. 扩展 `style.css`
8. 同步 `config.json`
9. 更新 `README.md` 和 `demo.md`

## 设计注意事项

1. 不要把图例布局逻辑塞进 `renderLegend()`
`renderLegend()` 现在职责很清楚，最好只负责“内容渲染”。

2. 默认行为要完全兼容
即使不传 `legendLayout`，也应该继续保持“图例在下方、左对齐”的当前体验。

3. 偏移建议用 CSS 变量
不要直接把偏移全写成内联 `transform` 字符串拼接，后续维护会更乱。

4. 左中右对齐最好依赖完整宽度容器
如果图例容器不占满整行，`justify-content` 的表现会不稳定，所以默认建议 `fullWidth: true`。

5. 未来如果要支持更多位置，先保留扩展空间
比如后续可能还会想支持：

- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`
- 与月份标签同一行

所以当前先把“位置”和“对齐”拆成两个维度是对的。

## 可以后续再考虑的增强项

1. 支持图例放到月份标签行同一水平线
2. 支持图例绝对定位到热力图角落
3. 支持图例自定义间距和单元大小的独立覆盖
4. 支持图例文字与色块反向排列
5. 支持多个图例分组
