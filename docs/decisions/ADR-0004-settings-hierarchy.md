# ADR-0004: 设置面板层级化 + alpha 处理

- 状态: Accepted
- 日期: 2026-08-29
- 关联: ADR-0002

## 背景

用户反馈设置菜单"很乱、很多功能不能用"，要求层级化: "核心插件我可以单独打开，然后核心插件打开了，我又可以打开里面的。就是说我可以激活 card，可以激活什么东西，然后里面再点开来可以调设置，做成这样子，有层级的让用户更好去找。" 颜色 alpha 要求: "alpha 应该和颜色在一起和选择颜色的东西在一起; 甚至说，你现在可以把 alpha 去掉，我想要那种扁平的效果，不一定需要透明度。" 后补充: "不知道实现能够调节透明度会不会很难，如果不好实现的话，那你就直接去掉，如果可以实现的话就内嵌一个取色器内嵌一个 alpha。"

## 决策

1. **设置层级**: 设置面板分四层 —— 插件总开关 → 分组级（core，可整体开关）→ 组件级（card/heatmap/progressbar，可单独开关 + 展开）→ 字段详情。各层可展开/折叠。
2. **alpha 处理**: 优先尝试**取色器内嵌 alpha**（同一取色器组件内，不再另起一行 "└ alpha" 子行）；若实现困难则**直接移除 alpha**，颜色一律实色。默认配置全部实色 hex。
3. **修复坏功能**: 设置面板现有双 API 并存（getSettingDefinitions + display 探测）可能是有问题的根源，重构时统一为单一路径。

## 后果

- `src/settings/settings-tab.ts`: 已重构为分组→组件→字段的嵌套渲染; 统一设置渲染路径（弃双 API）。
- `src/settings/fields.ts`: 字段已收敛 + 按分组归类。
- `src/settings/color-utils.ts`: rgbaToHex/hexToRgba 已按 alpha 策略调整。
- `styles.css` 设置 UI 部分已同步（tessera-collapse-btn 等保留/调整）。
- i18n 分组文案已同步。

## 实施记录 (2026-08-30)

- 提交 1211575 完成：四层结构（插件总开关 → core 分组级 coreEnabled → 组件级 enabled → 字段详情）。
- **alpha 内嵌成功**：renderColorField 在同一控制行 addColorPicker + addSlider（SliderComponent 无 setClass，用 sliderEl.addClass），alpha<1 存 rgba、=1 存 hex。
- 双 API 已弃：统一 display() 单路径，refreshSettings 直接调 display()（eslint-disable 因 Obsidian 1.13+ 标记 display deprecated，disable 注释须放在调用处）。
- PluginSettings 新增 `version`（1→2）与 `coreEnabled`；`ComponentKey = "card" | "heatmap" | "progressbar"` 类型。

## 相关文件

- `src/settings/settings-tab.ts`
- `src/settings/fields.ts`
- `src/settings/color-utils.ts`
- `src/settings/i18n.ts`、`src/i18n/{en,zh,ja}.json`
- `styles.css`