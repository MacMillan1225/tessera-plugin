# ADR-0003: API 命名空间破坏性变更 + 内容对象化

- 状态: Accepted
- 日期: 2026-08-29
- 关联: ADR-0002

## 背景

用户要求: API 命名空间全部改掉（`tessera.core.card` 形式），并明确"把旧的文件全部清空掉，初期开发阶段没有推广出去，不会有影响，直接改掉"。同时提出内容对象化标准: "卡片的内部内容是可以访问的，可以直接修改为另一个对象; 数值性的东西可以直接调整; 尽量把能修改的地方都变成对象; 如果是文本，有固定的文本格式，如果不是，应该以页面对对象形式存在"。

## 决策

1. **命名空间**: `tessera.card` → `tessera.core.card`; `tessera.heatmap` → `tessera.core.heatmap`; `tessera.progressbar` → `tessera.core.progressbar`。**不留旧别名**（破坏性变更，因处于初期阶段）。
2. **内容对象化标准**: 组件暴露的修改点（标题、元信息、数值、内容区）一律为**响应式属性**:
   - 文本类 → string（固定文本格式），设置时直接更新文本节点;
   - 非文本 → HTMLElement（页面对象），设置时直接替换 DOM 节点;
   - 数值类 → 直接可调（如 `el.value = 75` 自动重渲染/更新）。
   - card 已有 title/meta/value/content 响应式属性（Omit<HTMLElement,"title">），需确认一致性并补齐其他组件。
3. **分发模型 A**: 全部打包 + 设置开关，不做运行时按需加载（延续现状）。

## 后果

- `src/main.ts`: window.tessera 挂载对象改为 core 分组结构; wrapper 合并逻辑（浅合并问题）需修复。
- `src/settings/types.ts`: TesseraAPI 类型改为 `{ version, core: { card, heatmap, progressbar } }`。
- `types/global.d.ts`: 同步全局类型。
- heatmap 已有 data/startDate/endDate 响应式 + parts + refresh/destroy; progressbar 已有 value/max/min 响应式 — 复核统一性。
- example 组件 parts 用 children[0..3] 索引（脆弱），需改为具名 parts。
- 文档 docs/README.md、docs/ARCHITECTURE.md、docs/COMPONENT_DEVELOPMENT_GUIDE.md 同步。

## 相关文件

- `src/main.ts`
- `src/settings/types.ts`
- `types/global.d.ts`
- `src/components/{card,heatmap,progressbar,example}/index.ts`
- `docs/README.md` 等