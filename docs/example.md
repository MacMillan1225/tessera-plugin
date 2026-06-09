# TesseraScript 组件演示

本文件展示 TesseraScript 插件提供的所有组件效果。

## 前置条件

1. 安装并启用 TesseraScript 插件
2. 安装并启用 Dataview 插件
3. 使用 `dataviewjs` 代码块

---

## 1. Card 组件

### 基础卡片

```dataviewjs
dv.container.appendChild(tessera.card({
  title: "今日概览",
  meta: "OVERVIEW",
  value: 12,
  content: "今天共处理了 12 条记录。",
  flags:{
  showHeaderSep: false
  }
}));
```

### 统计卡片

```dataviewjs
dv.container.appendChild(tessera.card({
  title: "本周训练",
  meta: "WORKOUT",
  value: 5,
  content: "已完成 5 次训练。"
}));
```

### 自定义颜色卡片

```dataviewjs
dv.container.appendChild(tessera.card({
  title: "重点卡片",
  meta: "PINNED",
  value: "42",
  content: "这一张使用了自定义颜色。",
  colors: {
    light: {
      background: "rgba(248, 250, 252, 0.98)",
      border: "rgba(148, 163, 184, 0.18)",
      hoverAccent: "rgba(59, 130, 246, 0.45)",
      value: "#0f172a"
    },
    dark: {
      background: "rgba(15, 23, 42, 0.78)",
      border: "rgba(96, 165, 250, 0.2)",
      hoverAccent: "rgba(96, 165, 250, 0.5)",
      value: "#dbeafe"
    }
  }
}));
```

### 多卡片布局

```dataviewjs
const grid = document.createElement("div");
grid.style.display = "grid";
grid.style.gridTemplateColumns = "repeat(3, 1fr)";
grid.style.gap = "16px";

const stats = [
  { title: "总笔记", value: "1,234", meta: "NOTES" },
  { title: "本周新增", value: "56", meta: "CREATED" },
  { title: "进行中", value: "12", meta: "TASKS" }
];

stats.forEach(stat => {
  grid.appendChild(tessera.card(stat));
});

dv.container.appendChild(grid);

```

---

## 2. Heatmap 组件

### 基础热力图

```dataviewjs
// 生成示例数据
const data = {};
const today = new Date();
for (let i = 0; i < 365; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split("T")[0];
  data[dateStr] = Math.floor(Math.random() * 10);
}

dv.container.appendChild(tessera.heatmap({
  data: data,
  flags: {
	  showMonthLabels: false
  },
  cellSize: 12,
  cellGap: 2
}));
```

### 自定义颜色热力图

```dataviewjs
const data = {};
const today = new Date();
for (let i = 0; i < 180; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split("T")[0];
  data[dateStr] = Math.floor(Math.random() * 5);
}

dv.container.appendChild(tessera.heatmap({
  data: data,
  cellSize: 14,
  cellGap: 3,
  colors: {
    light: {
      empty: "#f8fafc",
      levels: ["#f8fafc", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"]
    },
    dark: {
      empty: "#1e293b",
      levels: ["#1e293b", "#1e3a5f", "#1e40af", "#2563eb", "#3b82f6"]
    }
  }
}));
```

### 嵌入卡片的热力图

```dataviewjs
const data = {};
const today = new Date();
for (let i = 0; i < 365; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split("T")[0];
  data[dateStr] = Math.floor(Math.random() * 10);
}

dv.container.appendChild(tessera.card({
  title: "活动记录",
  meta: "LAST 365 DAYS",
  children: tessera.heatmap({
    data: data,
    cellSize: 11,
    cellGap: 2,
  }),
  layout: {
    padding: "24px"
  }
}));

```

### 自定义热力图

```dataviewjs

function customTooltipRenderer(context) {
    const entry = context.entry;
    const date = context.date;
    const dateKey = context.dateKey;

    // 格式化日期
    const dateText = date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    // 如果没有数据
    if (!entry || (!entry.total && !entry.completed)) {
        return `
            <span class="ts-heatmap-tooltip__main">暂无数据</span>
            <span class="ts-heatmap-tooltip__date">${dateText}</span>
        `;
    }

    // 计算完成度
    const total = entry.total || 0;
    const completed = entry.completed || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 根据完成度设置颜色
    let statusColor = "#ef4444"; // 红色
    if (percentage >= 80) statusColor = "#22c55e"; // 绿色
    else if (percentage >= 50) statusColor = "#f59e0b"; // 黄色

    return `
        <span class="ts-heatmap-tooltip__main" style="color: ${statusColor}; font-weight: bold;">
            完成度：${percentage}%
        </span>
        <span class="ts-heatmap-tooltip__main">
            ${completed} / ${total} 项任务
        </span>
        <span class="ts-heatmap-tooltip__date">${dateText}</span>
    `;
}

const data = {};
const today = new Date();

for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    // 随机生成 total (1-10) 和 completed (0-total)
    const total = Math.floor(Math.random() * 10) + 1;
    const completed = Math.floor(Math.random() * (total + 1));

    data[dateKey] = { total, completed };
}
dv.container.appendChild(tessera.heatmap({
    data: data,
    flags: {
        showTooltip: true,
        showMonthLabels: true,
        showWeekLabels: true,
        showLegend: true,
    },
    // 使用封装的函数
    renderTooltip: customTooltipRenderer
}));
```

---

## 3. Progressbar 组件

### 基础进度条

```dataviewjs
dv.container.appendChild(tessera.progressbar({
  value: 0.72,
  flags: { showGlow: true }
}));
```

### 百分比进度条

```dataviewjs
dv.container.appendChild(tessera.progressbar({
  value: 75,
  min: 0,
  max: 100,
  layout: { height: "12px" }
}));
```

### 条纹动画进度条

```dataviewjs
dv.container.appendChild(tessera.progressbar({
  value: 65,
  flags: {
    striped: true,
    animated: true,
    showGlow: true
  },
  layout: {
    height: "14px",
    radius: "7px"
  }
}));
```

### 自定义颜色进度条

```dataviewjs
dv.container.appendChild(tessera.progressbar({
  value: 88,
  colors: {
    light: {
      track: "#fef3c7",
      fill: "#f59e0b",
      fillGradient: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
      glow: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))"
    },
    dark: {
      track: "rgba(245, 158, 11, 0.2)",
      fill: "#fbbf24",
      fillGradient: "linear-gradient(90deg, #f59e0b 0%, #fcd34d 100%)",
      glow: "drop-shadow(0 0 10px rgba(251, 191, 36, 0.25))"
    }
  },
  layout: { height: "16px" }
}));
```

### 多进度条对比

```dataviewjs
const projects = [
  { name: "项目 A", value: 75 },
  { name: "项目 B", value: 45 },
  { name: "项目 C", value: 90 }
];

projects.forEach(project => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "16px";
  
  const label = document.createElement("div");
  label.textContent = project.name;
  label.style.marginBottom = "6px";
  label.style.fontWeight = "600";
  label.style.fontSize = "14px";
  
  wrapper.appendChild(label);
  wrapper.appendChild(tessera.progressbar({
    value: project.value / 100,
    layout: { height: "10px" }
  }));
  
  dv.container.appendChild(wrapper);
});
```

---
## 4. 组合使用

### 仪表盘示例

```dataviewjs
const dashboard = document.createElement("div");
dashboard.style.display = "grid";
dashboard.style.gridTemplateColumns = "repeat(2, 1fr)";
dashboard.style.gap = "20px";
dashboard.style.padding = "20px";

// 统计卡片
const statsSection = document.createElement("div");
statsSection.style.gridColumn = "span 2";
statsSection.style.display = "grid";
statsSection.style.gridTemplateColumns = "repeat(4, 1fr)";
statsSection.style.gap = "16px";

const stats = [
  { title: "总笔记", value: "1,234", meta: "NOTES" },
  { title: "本周新增", value: "56", meta: "WEEK" },
  { title: "待办任务", value: "12", meta: "TODO" },
  { title: "完成率", value: "89%", meta: "RATE" }
];

stats.forEach(stat => {
  statsSection.appendChild(tessera.card(stat));
});

dashboard.appendChild(statsSection);

// 热力图卡片
const heatmapCard = tessera.card({
  title: "活动热力图",
  meta: "ACTIVITY",
  children: (() => {
    const data = {};
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      data[dateStr] = Math.floor(Math.random() * 10);
    }
    return tessera.heatmap({ data, cellSize: 10, cellGap: 1 });
  })(),
  layout: { padding: "20px" }
});
dashboard.appendChild(heatmapCard);

// 进度条卡片
const progressCard = tessera.card({
  title: "项目进度",
  meta: "PROGRESS",
  children: (() => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "12px";
    
    const projects = [
      { name: "写作", value: 0.75 },
      { name: "阅读", value: 0.45 },
      { name: "运动", value: 0.90 }
    ];
    
    projects.forEach(project => {
      const wrapper = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = project.name;
      label.style.marginBottom = "4px";
      label.style.fontSize = "13px";
      label.style.color = "var(--text-muted)";
      
      wrapper.appendChild(label);
      wrapper.appendChild(tessera.progressbar({
        value: project.value,
        layout: { height: "8px" }
      }));
      
      container.appendChild(wrapper);
    });
    
    return container;
  })(),
  layout: { padding: "20px" }
});
dashboard.appendChild(progressCard);

dv.container.appendChild(dashboard);
```

---

## 5. 高级用法

### 动态更新卡片

```dataviewjs
const cardEl = tessera.card({
  title: "动态卡片",
  meta: "UPDATING",
  value: 0,
  content: "点击按钮更新数值"
});

const button = document.createElement("button");
button.textContent = "增加数值";
button.style.marginTop = "12px";
button.style.padding = "8px 16px";
button.style.borderRadius = "6px";
button.style.border = "1px solid var(--background-modifier-border)";
button.style.background = "var(--background-secondary)";
button.style.cursor = "pointer";

let count = 0;
button.addEventListener("click", () => {
  count++;
  const valueEl = cardEl.querySelector(".ts-card__value");
  if (valueEl) {
    valueEl.textContent = String(count);
  }
});

cardEl.appendChild(button);
dv.container.appendChild(cardEl);
```

### 访问组件内部元素

```dataviewjs
const heatmapEl = tessera.heatmap({
  data: {
    "2024-01-01": 5,
    "2024-01-02": 3,
    "2024-01-03": 8
  }
});

// 访问 parts
console.log("Grid:", heatmapEl.parts.grid);
console.log("Cells:", heatmapEl.parts.cells);

dv.container.appendChild(heatmapEl);
```

---

## 注意事项

1. 所有组件都支持 light/dark 主题自动切换
2. 使用 CSS 变量可以深度自定义样式
3. 组件返回的是原生 DOM 元素，可以直接操作
4. 建议将复杂布局拆分为多个简单组件

```dataviewjs
const mycard = tessera.card({
	title:"这里是标题",
	content:"这里是内容"
});

dv.container.appendChild(
	mycard
);

const mycard2 = tessera.card({
	title:"这里是标题",
	content:"这里是内容"
});

mycard.content = mycard2;
mycard.meta = "test";

mycard2.title = "change";

```

```dataviewjs

const bar = tessera.progressbar({ value: 30, max: 100 });
dv.container.appendChild(bar);

// 动态更新
bar.value = 75;  // 进度条自动更新到 75%
bar.max = 100;   // 进度重新计算

bar.value = 35;  // 进度条自动更新到 75%

```
