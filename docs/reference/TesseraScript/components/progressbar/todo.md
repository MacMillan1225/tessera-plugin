# progressbar TODO

## 目标

让 `progressbar` 组件支持以下能力：

1. 设置显示名称
2. 设置进度百分比或原始进度值显示
3. 设置文本显示位置：上方、下方、内部、右侧/末尾
4. 保持现有纯进度条能力不被破坏

## 建议新增配置字段

需要在 `index.js` 的默认配置和 `config.json` 中同步增加：

```js
name: "",
display: {
  showName: false,
  showValue: false,
  format: "percent", // percent | value | both
  precision: 0,
  position: "top",   // top | bottom | inside | end
  separator: " / "
}
```

字段说明：

1. `name`
用于视觉显示的名称，例如“阅读进度”、“项目完成度”。

2. `display.showName`
是否显示名称文本。

3. `display.showValue`
是否显示进度值文本。

4. `display.format`
决定显示内容格式：

- `percent`: `64%`
- `value`: `64 / 100`
- `both`: `64 / 100 (64%)`

5. `display.precision`
控制百分比或数值保留的小数位。

6. `display.position`
控制文本显示位置：

- `top`: 显示在进度条上方
- `bottom`: 显示在进度条下方
- `inside`: 显示在进度条内部
- `end`: 显示在进度条右侧或末尾

7. `display.separator`
当显示值格式为 `value` 或 `both` 时，用于拼接当前值和最大值。

## 需要修改的文件

### 1. `index.js`

这是主要改动文件。

#### 需要处理的点

1. 扩展默认配置
在 `defaultProgressbarConfig` 中增加 `name` 和 `display`。

2. 扩展进度解析结果
修改 `resolveProgress()`，除了返回 `ratio`、`percent`，还返回：

- `value`
- `min`
- `max`
- 需要时可额外返回 `current`、`total`

3. 新增文本格式化函数
新增一个类似 `formatProgressText(progress, resolved)` 的函数，用来统一生成：

- 百分比文本
- 原始值文本
- 混合文本

4. 新增显示位置解析
新增一个类似 `resolveDisplayPosition(display)` 的函数，统一校验 `top | bottom | inside | end`，非法值回退默认值。

5. 调整 DOM 结构
当前结构只有：

```html
<div class="ts-progressbar">
  <div class="ts-progressbar__fill"></div>
</div>
```

改造后建议至少支持：

```html
<div class="ts-progressbar-block ts-progressbar-block--top">
  <div class="ts-progressbar-block__meta">
    <span class="ts-progressbar-block__name">阅读进度</span>
    <span class="ts-progressbar-block__value">64%</span>
  </div>
  <div class="ts-progressbar">
    <div class="ts-progressbar__fill"></div>
  </div>
</div>
```

不同位置的建议结构：

- `top`: meta 行在进度条上方
- `bottom`: meta 行在进度条下方
- `inside`: 文本作为进度条内部覆盖层
- `end`: 外层使用横向布局，文本显示在进度条右侧

6. 返回值可能变化
如果引入 wrapper，`progressbar()` 返回值将不再是原始轨道节点，而是外层容器。

这时需要决定：

- 是否继续让 `root.parts.fill` 可用
- 是否补充 `root.parts.track`、`root.parts.name`、`root.parts.value`

建议：

```js
wrapper.parts = {
  track,
  fill,
  name,
  value,
  meta,
};
```

7. 补充 `aria` 文本
保留原有：

- `aria-valuemin`
- `aria-valuemax`
- `aria-valuenow`

建议新增：

- `aria-valuetext`

用于表达例如：

```text
64 / 100 (64%)
```

### 2. `style.css`

当前 CSS 只覆盖了轨道和填充条，没有文本布局样式。

#### 需要新增的样式类型

1. 外层容器样式

- `.ts-progressbar-block`
- `.ts-progressbar-block--top`
- `.ts-progressbar-block--bottom`
- `.ts-progressbar-block--inside`
- `.ts-progressbar-block--end`

2. 文本区样式

- `.ts-progressbar-block__meta`
- `.ts-progressbar-block__name`
- `.ts-progressbar-block__value`

3. 内部覆盖层样式

- `.ts-progressbar__overlay`

用于 `inside` 模式，把名称、进度值叠加在条内。

4. 右侧布局样式

`end` 模式下，外层容器通常需要：

- `display: flex`
- 进度条区域可伸缩
- 右侧文本不被压扁

5. 文本颜色适配

`inside` 模式下，文字可能叠在填充色上，需要额外考虑：

- 浅色填充上的深色字
- 深色填充上的浅色字
- 阴影或混合模式是否需要

### 3. `config.json`

同步默认配置，避免代码默认值和配置文件脱节。

### 4. `README.md`

需要更新文档说明。

#### 需要改的点

1. 更新组件描述
当前 README 里写的是“仅渲染进度条本体，不包含标题区或数值行”，如果你加入文本显示功能，这句要调整。

2. 更新 API 字段说明
补充：

- `name`
- `display.showName`
- `display.showValue`
- `display.format`
- `display.precision`
- `display.position`
- `display.separator`

3. 更新返回值说明
如果返回值改成 wrapper，需要更新返回节点说明和 `parts` 访问方式。

### 5. `demo.md`

需要增加示例，至少补以下场景：

1. 上方显示名称 + 百分比
2. 下方显示名称 + 百分比
3. 内部显示百分比
4. 右侧显示 `value / max`
5. 同时显示名称和混合格式 `64 / 100 (64%)`

## 推荐实现顺序

1. 扩展 `defaultProgressbarConfig`
2. 同步修改 `config.json`
3. 扩展 `resolveProgress()` 返回值
4. 新增 `formatProgressText()`
5. 新增显示位置解析逻辑
6. 重构 `progressbar()` DOM 结构
7. 增加新样式
8. 更新 README 和 demo

## 设计注意事项

1. `label` 继续保留给 `aria-label`
不要把 `label` 直接改成视觉标题字段，建议新增 `name` 专门负责显示名称。

2. 保持旧调用可用
例如：

```js
progressbar({ value: 0.64 })
```

即使没有传 `name` 或 `display`，也应继续正常渲染纯进度条。

3. `inside` 模式最容易产生样式冲突
要特别注意：

- 文本是否会溢出
- 文本是否与圆角裁切冲突
- 短进度时文本是否被挤压

4. `end` 模式要考虑窄宽度场景
如果整体容器较窄，右侧文本可能换行，需要决定是否：

- 固定右侧文本宽度
- 禁止换行
- 自动截断

5. `value` 显示格式要统一
建议统一通过格式化函数输出，避免在 DOM 构造阶段拼接字符串。

## 可以后续再考虑的增强项

1. 支持 `start` / `left` / `right` 更细的文本定位
2. 支持只显示名称、不显示值
3. 支持只显示值、不显示名称
4. 支持自定义文本模板
5. 支持低进度 / 高进度时自动切换内部文字颜色

## 按代码位置逐段修改的操作清单

下面这部分按文件和代码位置排列，适合直接照着改。

### A. 修改 `index.js`

#### A1. 在 `defaultProgressbarConfig` 中新增显示配置

位置：`const defaultProgressbarConfig = { ... }`

在 `label` 后面增加：

```js
name: "",
display: {
  showName: false,
  showValue: false,
  format: "percent",
  precision: 0,
  position: "top",
  separator: " / "
},
```

目标：

1. 给视觉名称单独留字段
2. 给显示内容和显示位置留统一入口

#### A2. 在 `resolveProgress()` 中补充返回信息

位置：`function resolveProgress(resolved, input) { ... }`

当前只返回：

```js
{ ratio, percent }
```

改成返回更多信息，例如：

```js
{
  ratio,
  percent,
  value,
  min,
  max
}
```

如果你想后面少计算，也可以顺手补：

```js
current: value,
total: max
```

目标：

1. 给百分比显示用
2. 给 `value / max` 显示用
3. 给 `aria-valuetext` 用

#### A3. 在 `resolveProgress()` 后新增格式化函数

位置：紧接在 `resolveProgress()` 后面新增函数

新增函数建议：

```js
function formatProgressText(progress, resolved) { ... }
```

函数职责：

1. 读取 `resolved.display`
2. 根据 `format` 输出：
   - `64%`
   - `64 / 100`
   - `64 / 100 (64%)`
3. 根据 `precision` 控制小数位
4. 根据 `separator` 拼接值文本

目标：

避免在 DOM 构造时到处手写字符串拼接。

#### A4. 在 `formatProgressText()` 后新增位置解析函数

位置：紧接格式化函数后新增

新增函数建议：

```js
function resolveDisplayPosition(display) { ... }
```

函数职责：

1. 只接受：`top`、`bottom`、`inside`、`end`
2. 传入非法值时回退到 `top`

目标：

把位置校验收口，避免在渲染函数里写大量条件判断。

#### A5. 在 `progressbar()` 中解析新增配置

位置：`function progressbar(options = {}) { ... }` 里，紧跟这些变量后面：

```js
const flags = resolved.flags || {};
const layout = resolved.layout || {};
const colors = resolveThemeColors(resolved.colors || {});
const styles = resolved.styles || {};
const progress = resolveProgress(resolved, options);
```

再增加类似：

```js
const display = resolved.display || {};
const position = resolveDisplayPosition(display);
const progressText = formatProgressText(progress, resolved);
const showName = display.showName === true && resolved.name;
const showValue = display.showValue === true;
```

目标：

先把渲染所需状态都准备好，再开始创建 DOM。

#### A6. 保留现有 `fill` 创建逻辑

位置：`const fill = dom.createElement("div", { ... })`

这段基本可以保留，只需要考虑两件事：

1. `inside` 模式时是否要额外给填充层或轨道层挂 class
2. 如果内部文字叠加在条内，是否要让 `fill` 保持当前结构不变

目标：

尽量少动已有进度条主体逻辑。

#### A7. 把当前 `root` 轨道节点改名为 `track`

位置：现在的：

```js
const root = dom.createElement("div", { ... })
```

建议改成：

```js
const track = dom.createElement("div", { ... })
```

原因：

后面大概率要新增最外层 `wrapper`，所以轨道节点不再适合叫 `root`。

#### A8. 创建名称、数值、meta 行节点

位置：在 `track` 创建完成后新增

建议新增：

1. `nameNode`
2. `valueNode`
3. `meta`

建议结构：

```js
const nameNode = ...
const valueNode = ...
const meta = ...
```

逻辑要求：

1. `showName` 为真时才创建名称节点
2. `showValue` 为真时才创建数值节点
3. 如果两者都不显示，就不要创建 `meta`

#### A9. 为 `inside` 模式单独创建内部覆盖层

位置：与 `meta` 同一段新增

建议新增：

```js
const overlay = ...
```

用法：

1. 当 `position === "inside"` 时，把名称和值放进 `overlay`
2. `overlay` 作为 `track` 的额外子节点

目标：

把内部显示和上下显示的结构区分开，避免互相干扰。

#### A10. 新增最外层 `wrapper`

位置：在所有子节点都准备好之后新增

建议结构：

```js
const wrapper = dom.createElement("div", {
  className: [
    "ts-progressbar-block",
    "ts-progressbar-block--" + position,
    resolved.className,
  ],
  children: ...
});
```

不同位置的 children 组织建议：

1. `top`: `[meta, track]`
2. `bottom`: `[track, meta]`
3. `inside`: `[track]`，但 `overlay` 作为 `track` 子节点
4. `end`: `[track, valueNode 或 meta]`

注意：

`end` 模式下，如果你想右侧只显示值，不显示名称，结构会更简洁；如果既显示名称又显示值，需要决定右侧是单行还是双元素并排。

#### A11. 调整 `track` 的 `aria` 属性

位置：`attrs` 中现在有：

```js
role: "progressbar",
"aria-label": resolved.label || "Progress",
"aria-valuemin": 0,
"aria-valuemax": 100,
"aria-valuenow": progress.percent,
```

建议保留，并补上：

```js
"aria-valuetext": progressText,
```

如果你想精确表达原始范围，也可以评估是否改成：

```js
"aria-valuemin": progress.min,
"aria-valuemax": progress.max,
"aria-valuenow": progress.value,
```

但如果你想继续统一用百分比语义，也可以保持现状不变。

#### A12. 调整 `parts` 暴露方式

位置：文件尾部现在有：

```js
root.parts = { fill };
return root;
```

改成类似：

```js
wrapper.parts = {
  track,
  fill,
  meta,
  name: nameNode,
  value: valueNode,
  overlay,
};
return wrapper;
```

目标：

后续你可以从返回节点直接访问各部分进行样式微调。

### B. 修改 `style.css`

#### B1. 保留现有 `.ts-progressbar` 和 `.ts-progressbar__fill`

现有轨道和填充样式先不要删，先保持可用。

#### B2. 在文件末尾新增外层容器样式

建议新增：

```css
.ts-progressbar-block { ... }
.ts-progressbar-block--top { ... }
.ts-progressbar-block--bottom { ... }
.ts-progressbar-block--inside { ... }
.ts-progressbar-block--end { ... }
```

职责：

1. 处理整体布局
2. 处理上下间距
3. 处理右侧布局模式

#### B3. 新增 meta 行样式

建议新增：

```css
.ts-progressbar-block__meta { ... }
.ts-progressbar-block__name { ... }
.ts-progressbar-block__value { ... }
```

职责：

1. 名称和值左右分布
2. 控制字体大小、颜色、行高
3. 避免文本贴得太近

#### B4. 新增内部覆盖层样式

建议新增：

```css
.ts-progressbar__overlay { ... }
```

职责：

1. 绝对定位到进度条内部
2. 与圆角和 `overflow: hidden` 协调
3. 控制文字垂直居中

#### B5. 处理 `end` 模式布局

建议重点保证：

1. 进度条主体可伸缩
2. 右侧值文本不乱换行
3. 窄宽度下视觉仍稳定

通常会需要：

```css
display: flex;
align-items: center;
gap: ...;
```

### C. 修改 `config.json`

#### C1. 同步补默认字段

位置：根对象内 `label` 后面新增与 `defaultProgressbarConfig` 一致的结构：

```json
"name": "",
"display": {
  "showName": false,
  "showValue": false,
  "format": "percent",
  "precision": 0,
  "position": "top",
  "separator": " / "
},
```

目标：

保证配置文件和代码默认配置一致。

### D. 修改 `README.md`

#### D1. 改组件描述

位置：开头介绍部分

把“仅渲染进度条本体，不包含标题区或数值行”改成更准确的描述，例如：

1. 默认仍可只渲染进度条本体
2. 也可按配置显示名称和进度文本

#### D2. 在 API 说明中增加新字段

需要增加：

1. `name`
2. `display.showName`
3. `display.showValue`
4. `display.format`
5. `display.precision`
6. `display.position`
7. `display.separator`

#### D3. 更新返回值说明

如果返回 `wrapper`，说明里要把可访问的 `parts` 列出来。

### E. 修改 `demo.md`

#### E1. 增加上方显示示例

示例内容：

1. `name`
2. `showName: true`
3. `showValue: true`
4. `position: "top"`

#### E2. 增加下方显示示例

示例内容：

1. `position: "bottom"`

#### E3. 增加内部显示示例

示例内容：

1. `position: "inside"`
2. 建议显示百分比

#### E4. 增加右侧显示示例

示例内容：

1. `position: "end"`
2. `format: "value"`
3. `min/max/value` 明确传入

#### E5. 增加混合格式示例

示例内容：

1. `format: "both"`
2. 显示 `64 / 100 (64%)`

## 最短执行顺序

如果你只想按最短路径改，直接按下面顺序动手：

1. 先改 `index.js` 的默认配置
2. 再改 `resolveProgress()` 返回值
3. 新增 `formatProgressText()`
4. 新增 `resolveDisplayPosition()`
5. 把 `root` 改成 `track`
6. 新增 `nameNode`、`valueNode`、`meta`、`overlay`
7. 新增 `wrapper` 并调整返回值
8. 再补 `style.css` 的新类
9. 最后同步 `config.json`、`README.md`、`demo.md`
