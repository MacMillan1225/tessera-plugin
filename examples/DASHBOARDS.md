# TesseraScript 看板 Demo

> 3 个真实场景看板，覆盖 TesseraScript 全部组件。每个代码块是完整的 `dataviewjs` 代码，**全部使用静态数据，复制到笔记中即可直接运行**（无需任何前置查询或文件夹结构）。
>
> **前置**：启用 Dataview 插件 + TesseraScript 插件（`tessera.core.*` / `tessera.chart.*` 可用）；组件在设置中启用。
> **布局**：每个看板使用统一的 `row(...)` 网格助手（自适应列、14px 间距），卡片自动换行。

---

## 看板 1 · 个人效率中心

顶部统计卡 + 近 90 天活动热力图 + 今日待办 + 周目标进度。

````dataviewjs
// ===== 个人效率中心（静态数据）=====

// 统一网格助手：把若干卡片排成自适应行（>=2 列自动换行，14px 间距）
function row(...cards) {
  const el = dv.el('div', '');
  el.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px;';
  cards.forEach((c) => el.appendChild(c));
  return el;
}

// --- 顶部 4 统计卡 ---
const stats = [
  { label: '总任务', value: 128 },
  { label: '已完成', value: 96 },
  { label: '今日到期', value: 5 },
  { label: '完成率', value: '75%' },
];
const statCards = stats.map((s) => tessera.core.card({
  meta: s.label.toUpperCase(),
  value: String(s.value),
  flags: { showTitle: false, showHeaderSep: false },
  layout: { padding: '14px' },
}));
dv.container.appendChild(row(...statCards));

// --- 近 90 天活动热力图（静态生成：工作日活跃、周末安静）---
const today = dv.luxon.DateTime.now();
const heatData = {};
for (let i = 89; i >= 0; i--) {
  const d = today.minus({ days: i });
  const dow = d.weekday;                       // 1=周一 … 7=周日
  const base = dow >= 6 ? 1 : 3;               // 周末 1~2，工作日 3~6
  const count = base + Math.floor(Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 3);
  heatData[d.toFormat('yyyy-MM-dd')] = count;
}
dv.container.appendChild(tessera.core.heatmap({
  data: heatData,
  settings: { rangeMode: 'fixed', fixedDays: 90, locale: 'zh-CN' },
}));

// --- 今日待办 + 周目标（并排两卡）---
const todoCard = tessera.core.card({
  title: '今日待办',
  meta: '5 项',
  children: tessera.core.list({
    items: [
      { label: '完成季度回顾文档', value: '2h' },
      { label: '回复项目组邮件', value: '✓' },
      { label: '整理读书笔记', value: '30m' },
      { label: '提交插件 PR', value: '✓' },
      { label: '制定下周计划', value: '待办' },
    ],
    flags: { showDividers: true },
  }),
});
const goalCard = tessera.core.card({
  title: '周目标',
  meta: 'WEEK 35',
  children: [
    tessera.core.progressbar({
      value: 0.68,
      labelFormat: '完成 {value}%',
      flags: { showLabel: true },
      layout: { height: '10px', radius: '5px' },
    }),
    tessera.core.list({
      items: [
        { label: '阅读 3 篇文章', value: '2/3' },
        { label: '运动 2 次', value: '1/2' },
        { label: '写作 1000 字', value: '800' },
      ],
    }),
  ],
});
dv.container.appendChild(row(todoCard, goalCard));
````

---

## 看板 2 · 学习与技能仪表盘

技能六维雷达 + 每月阅读柱状 + 学习主题标签 + 当前在读卡片。

````dataviewjs
// ===== 学习与技能仪表盘（静态数据）=====

function row(...cards) {
  const el = dv.el('div', '');
  el.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px;';
  cards.forEach((c) => el.appendChild(c));
  return el;
}

// --- 技能雷达 + 每月阅读（并排两卡）---
const radarCard = tessera.core.card({
  title: '技能自评',
  meta: '6 DIMENSIONS',
  children: tessera.chart.radar({
    data: {
      labels: ['写作', '编程', '设计', '沟通', '研究', '复盘'],
      values: [72, 85, 60, 78, 90, 66],
    },
    flags: { showArea: true },
    layout: { height: '280px' },
  }),
});
const readingCard = tessera.core.card({
  title: '近 6 月阅读',
  meta: 'BOOKS',
  children: tessera.chart.bar({
    data: {
      labels: ['3月', '4月', '5月', '6月', '7月', '8月'],
      values: [4, 7, 3, 9, 6, 8],
    },
    layout: { barRadius: 6, height: '220px' },
  }),
});
dv.container.appendChild(row(radarCard, readingCard));

// --- 学习主题标签（独立卡片，避免与图表重叠）---
dv.container.appendChild(tessera.core.card({
  title: '学习主题',
  meta: 'TAGS',
  children: tessera.core.tags({
    tags: [
      { label: 'Obsidian', variant: 'pill' },
      { label: 'Dataview', variant: 'soft' },
      { label: 'PKM', variant: 'outlined' },
      { label: 'Zettelkasten', variant: 'pill' },
      { label: 'GTD', variant: 'soft' },
      { label: 'Weekly Review', variant: 'outlined' },
      { label: 'TypeScript', variant: 'pill' },
      { label: 'ECharts', variant: 'soft' },
    ],
  }),
}));

// --- 当前在读 ---
dv.container.appendChild(tessera.core.card({
  title: '当前在读',
  meta: 'READING',
  content: '《设计中的设计》——原研哉。最近在思考「留白」在信息设计中的作用，尝试把这种理念应用在看板组件的视觉密度上。',
  layout: { maxWidth: '100%' },
}));
````

---

## 看板 3 · 项目冲刺总览

Sprint 进度量表 + 燃尽趋势折线 + 任务分布玫瑰 + 里程碑列表。

````dataviewjs
// ===== 项目冲刺总览（静态数据）=====

function row(...cards) {
  const el = dv.el('div', '');
  el.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:16px;';
  cards.forEach((c) => el.appendChild(c));
  return el;
}

// --- 进度量表 + 燃尽趋势（并排两卡）---
const gaugeCard = tessera.core.card({
  title: 'Sprint 进度',
  meta: 'SPRINT 12',
  children: tessera.chart.gauge({
    value: 0.72,
    label: 'STORY POINTS',
    layout: { height: '240px' },
  }),
});
const burnCard = tessera.core.card({
  title: '燃尽趋势',
  meta: '7 DAYS',
  children: tessera.chart.line({
    data: {
      labels: ['8/24', '8/25', '8/26', '8/27', '8/28', '8/29', '8/30'],
      values: [38, 33, 29, 24, 18, 13, 9],
    },
    flags: { smooth: true, area: true },
    layout: { symbolSize: 6, lineWidth: 2, height: '220px' },
  }),
});
dv.container.appendChild(row(gaugeCard, burnCard));

// --- 任务分布玫瑰 + 里程碑（并排两卡）---
const roseCard = tessera.core.card({
  title: '任务分布',
  meta: 'BY STATUS',
  children: tessera.chart.rose({
    data: {
      labels: ['完成', '进行中', '待办', '阻塞'],
      values: [26, 11, 7, 4],
    },
  }),
});
const milestoneCard = tessera.core.card({
  title: '里程碑',
  meta: 'DEADLINES',
  children: tessera.core.list({
    items: [
      { label: 'API 冻结', value: '8/25' },
      { label: 'UI 走查', value: '9/02' },
      { label: 'Beta 内测', value: '9/09' },
      { label: '正式发布', value: '9/23' },
    ],
    flags: { showDividers: true },
  }),
});
dv.container.appendChild(row(roseCard, milestoneCard));
````

---

## 组件速查

| 组件 | API | 用途 |
|------|-----|------|
| 卡片 | `tessera.core.card({...})` | 看板区块容器，标题/数值/内容 |
| 热力图 | `tessera.core.heatmap({...})` | 活动频率日历 |
| 进度条 | `tessera.core.progressbar({...})` | 目标/任务进度（value 为 0..1） |
| 列表 | `tessera.core.list({...})` | 待办、里程碑、要点（value 自动右对齐） |
| 标签栏 | `tessera.core.tags({...})` | 主题、状态、分类标签（自动换行） |
| 折线图 | `tessera.chart.line({...})` | 趋势、燃尽 |
| 柱状图 | `tessera.chart.bar({...})` | 分类对比、产出量 |
| 刻度量表 | `tessera.chart.gauge({...})` | 总体完成度（value 为 0..1） |
| 玫瑰图 | `tessera.chart.rose({...})` | 分布占比 |
| 雷达图 | `tessera.chart.radar({...})` | 多维能力/属性对比（顶点悬浮显示单维度） |

全部配置字段见 [docs/CONFIGURATION.md](../docs/CONFIGURATION.md)。