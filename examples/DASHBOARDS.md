# TesseraScript 看板 Demo

> 3 个真实场景看板，覆盖 TesseraScript 全部组件。每个代码块是完整的 `dataviewjs` 代码，复制到笔记中即可运行。
>
> **前置**：启用 Dataview 插件 + TesseraScript 插件（`tessera.core.*` / `tessera.chart.*` 可用）；组件在设置中启用。
> **数据**：示例中 `dv.pages()` 查询指向 `tasks/` 文件夹与 `Tags` 属性 —— 请按你的库结构调整查询，或改用直接数据（已提供 `DEMO` 版本）。

---

## 看板 1 · 个人效率中心

顶部统计卡 + 近三月活动热力图 + 今日待办 + 周目标进度。

````dataviewjs
// ===== 个人效率中心 =====
const today = dv.luxon.DateTime.now();          // 今天（luxon）
const tasks = dv.pages('"tasks"');
const all = tasks.file.tasks;                     // 全部任务
const done = all.where(t => t.completed);
const todayCompleted = all.where(t => t.text && t.completed && t.completed.toFormat('yyyy-MM-dd') === today.toFormat('yyyy-MM-dd'));
const dueToday = all.where(t => !t.completed && t.due && t.due.hasSame(today, 'day'));
const total = all.length;
const completedCount = done.length;
const pct = total ? Math.round(completedCount / total * 100) : 0;

// --- 顶部 4 统计卡（CSS Grid 排布）---
const grid = dv.el('div', '', { cls: 'ts-demo-grid' });
grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;';
const stats = [
  { label: '总任务', value: total },
  { label: '已完成', value: completedCount },
  { label: '今日到期', value: dueToday.length },
  { label: '完成率', value: `${pct}%` },
];
for (const s of stats) {
  grid.appendChild(tessera.core.card({
    meta: s.label.toUpperCase(),
    value: String(s.value),
    flags: { showTitle: false, showHeaderSep: false },
    layout: { padding: '14px' },
  }));
}

// --- 近 3 个月活动热力图 ---
dv.container.appendChild(tessera.core.heatmap({
  getData: () => {
    const map = {};
    for (const t of all) {
      if (!t.completed) continue;
      const key = t.completed.toFormat('yyyy-MM-dd');
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  },
  settings: { rangeMode: 'fixed', fixedDays: 90, locale: 'zh-CN' },
}));

// --- 今日待办列表 ---
dv.container.appendChild(tessera.core.card({
  title: '今日待办',
  meta: `${dueToday.length} 项`,
  children: tessera.core.list({
    items: dueToday.length
      ? dueToday.map(t => ({ label: t.text.replace(/^\[.*?\]\s*/, '').slice(0, 40) }))
      : [{ label: '今日无到期任务 🎉' }],
    emptyText: '今日无到期任务',
  }),
}));

// --- 周目标进度 ---
const weekTasks = all.filter(t => t.due && t.due.weekNumber === today.weekNumber);
const weekDone = weekTasks.where(t => t.completed);
const weekPct = weekTasks.length ? weekDone.length / weekTasks.length : 0;
dv.container.appendChild(tessera.core.progressbar({
  value: weekPct,
  labelFormat: '本周进度 {value}%',
  flags: { showLabel: true },
  layout: { height: '10px', radius: '5px' },
}));
````

---

## 看板 2 · 学习与技能仪表盘

技能六维雷达 + 每月阅读柱状 + 学习主题标签 + 当前在读卡片。

````dataviewjs
// ===== 学习与技能仪表盘 =====
const notes = dv.pages('"notes"');

// --- 技能雷达（可直接替换成你的评分数据）---
dv.container.appendChild(tessera.core.card({
  title: '技能自评',
  children: tessera.chart.radar({
    data: {
      labels: ['写作', '编程', '设计', '沟通', '研究', '复盘'],
      values: [72, 85, 60, 78, 90, 66],
    },
    flags: { showArea: true },
    layout: { height: '280px' },
  }),
}));

// --- 每月阅读量柱状（按笔记的 date 属性聚合）---
const byMonth = new Map();
for (const n of notes) {
  if (!n.date) continue;
  const key = n.date.toFormat('MMM');
  byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
}
const months = [...byMonth.keys()].slice(-6);
const counts = months.map(m => byMonth.get(m));
dv.container.appendChild(tessera.core.card({
  title: '近 6 月产出',
  children: tessera.chart.bar({
    data: { labels: months, values: counts },
    layout: { barRadius: 6, height: '220px' },
  }),
}));

// --- 学习主题标签 ---
const tags = [...new Set(notes.flatMap(n => n.tags ?? []))].slice(0, 12);
dv.container.appendChild(tessera.core.tags({
  tags: tags.map((t, i) => ({
    label: t,
    variant: i % 3 === 0 ? 'soft' : i % 3 === 1 ? 'outlined' : 'pill',
  })),
  emptyText: '暂无标签',
}));

// --- 当前在读（最近一篇笔记）---
const latest = notes.sort(n => n.file.mtime, 'desc')[0];
dv.container.appendChild(tessera.core.card({
  title: '最近更新',
  meta: latest ? latest.file.name : '—',
  content: latest?.summary ?? '还没有笔记，去创建一篇吧。',
  layout: { maxWidth: '100%' },
}));
````

---

## 看板 3 · 项目进度总览

项目总体进度量表 + 燃尽趋势折线 + 任务分布玫瑰 + 里程碑列表。

````dataviewjs
// ===== 项目进度总览 =====
const today = dv.luxon.DateTime.now();          // 今天（luxon）
const proj = dv.pages('"projects"');
const stories = proj.file.tasks;

// --- 总体进度量表 ---
const doneStories = stories.where(t => t.completed).length;
const totalStories = stories.length;
const pct = totalStories ? doneStories / totalStories : 0;
dv.container.appendChild(tessera.core.card({
  title: 'Sprint 进度',
  children: tessera.chart.gauge({
    value: pct,
    label: 'STORY POINTS',
    layout: { height: '240px' },
  }),
}));

// --- 燃尽趋势折线（近 7 天每日剩余任务数）---
const days = [];
const remaining = [];
let remainingCount = totalStories;
// 先按完成日期统计，再倒推每日剩余
const doneByDay = new Map();
for (const t of stories) {
  if (!t.completed) continue;
  const key = t.completed.toFormat('yyyy-MM-dd');
  doneByDay.set(key, (doneByDay.get(key) ?? 0) + 1);
}
for (let i = 6; i >= 0; i--) {
  const d = today.minus({ days: i });
  const key = d.toFormat('yyyy-MM-dd');
  remainingCount -= doneByDay.get(key) ?? 0;
  days.push(d.toFormat('MM-dd'));
  remaining.push(Math.max(0, remainingCount));
}
dv.container.appendChild(tessera.core.card({
  title: '燃尽趋势',
  children: tessera.chart.line({
    data: { labels: days, values: remaining },
    flags: { smooth: true },
    layout: { symbolSize: 6, lineWidth: 2, height: '220px' },
  }),
}));

// --- 任务分布玫瑰（按完成状态分档）---
const statuses = {};
for (const t of stories) {
  const s = t.completed ? '完成' : (t.due ? '进行中' : '待办');
  statuses[s] = (statuses[s] ?? 0) + 1;
}
dv.container.appendChild(tessera.core.card({
  title: '任务分布',
  children: tessera.chart.rose({
    data: {
      labels: Object.keys(statuses),
      values: Object.values(statuses),
    },
  }),
}));

// --- 里程碑列表 ---
const milestones = proj
  .sort(p => p.deadline)
  .slice(0, 6)
  .map(p => ({
    label: p.file.name,
    value: p.status === 'done' ? '✓' : (p.deadline?.toFormat('MM-dd') ?? ''),
  }));
dv.container.appendChild(tessera.core.list({
  items: milestones,
  flags: { showDividers: true },
  emptyText: '暂无项目',
}));
````

---

## 看板 4 · 静态示例（无数据依赖）

不想接库数据？用这版——纯静态数据，开箱即跑，适合预览组件效果。

````dataviewjs
// ===== 静态演示看板 =====
// 网格容器
const grid = dv.el('div', '');
grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:14px;';

// 左列
const left = dv.el('div', '');
left.appendChild(tessera.core.card({
  title: '月度目标',
  meta: 'MARCH',
  value: '68%',
  content: '核心目标完成度',
  children: tessera.core.progressbar({
    value: 0.68,
    labelFormat: '{value}%',
    flags: { showLabel: true },
  }),
}));
left.appendChild(tessera.core.card({
  title: '本周重点',
  children: tessera.core.list({
    items: [
      { label: '发布 v1.0 更新日志', value: '✓' },
      { label: '整理 Dataview 查询', value: '2h' },
      { label: '阅读《Obsidian 实战》', value: 'p42' },
      { label: '备份仓库', value: '待办' },
    ],
    flags: { showDividers: true },
  }),
}));
grid.appendChild(left);

// 右列
const right = dv.el('div', '');
right.appendChild(tessera.core.card({
  title: '六维能力',
  children: tessera.chart.radar({
    data: {
      labels: ['健康', '工作', '学习', '社交', '财务', '娱乐'],
      values: [80, 65, 90, 70, 55, 85],
    },
    layout: { height: '240px' },
  }),
}));
right.appendChild(tessera.core.card({
  title: '标签云',
  children: tessera.core.tags({
    tags: ['Obsidian', 'Dataview', 'TesseraScript', 'GTD', 'PKM', 'Zettelkasten', 'Weekly Review'].map(
      (label, i) => ({ label, variant: ['pill', 'soft', 'outlined'][i % 3] }),
    ),
  }),
}));
grid.appendChild(right);

dv.container.appendChild(grid);

// 底部：季度趋势 + 量表
dv.container.appendChild(tessera.core.card({
  title: '季度趋势',
  children: tessera.chart.line({
    data: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], values: [12, 19, 8, 25, 30, 22] },
    flags: { area: true, smooth: true },
    layout: { height: '200px' },
  }),
}));

dv.container.appendChild(tessera.core.card({
  title: '年度健康',
  children: tessera.chart.gauge({
    value: 0.87,
    label: 'ANNUAL',
    layout: { height: '220px' },
  }),
}));
````

---

## 组件速查

| 组件 | API | 用途 |
|------|-----|------|
| 卡片 | `tessera.core.card({...})` | 看板区块容器，标题/数值/内容 |
| 热力图 | `tessera.core.heatmap({...})` | 活动频率日历 |
| 进度条 | `tessera.core.progressbar({...})` | 目标/任务进度（0..1） |
| 列表 | `tessera.core.list({...})` | 待办、里程碑、要点 |
| 标签栏 | `tessera.core.tags({...})` | 主题、状态、分类标签 |
| 折线图 | `tessera.chart.line({...})` | 趋势、燃尽 |
| 柱状图 | `tessera.chart.bar({...})` | 分类对比、产出量 |
| 刻度量表 | `tessera.chart.gauge({...})` | 总体完成度 |
| 玫瑰图 | `tessera.chart.rose({...})` | 分布占比 |
| 雷达图 | `tessera.chart.radar({...})` | 多维能力/属性对比 |

全部配置字段见 [docs/CONFIGURATION.md](../docs/CONFIGURATION.md)。