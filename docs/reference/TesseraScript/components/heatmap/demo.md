# heatmap demo

## 标准加载顺序

```dataviewjs
await dv.view("TesseraScript/tessera.bootstrap");
await dv.view("TesseraScript/core/dom");
await dv.view("TesseraScript/core/file");
await dv.view("TesseraScript/core/css");
await dv.view("TesseraScript/core/config");
await dv.view("TesseraScript/components/heatmap/index");

const heatmap = Tessera.use("heatmap");
```

## 最小示例

```dataviewjs
const heatmap = Tessera.use("heatmap");

dv.container.appendChild(
  heatmap({
    getData: ({ start, end, utils }) => {
      const map = new Map();
      let cur = utils.normalizeDate(start);

      while (cur <= end) {
        map.set(utils.toDateKey(cur), {
          total: 4,
          completed: Math.floor(Math.random() * 5),
        });
        cur = utils.addDays(cur, 1);
      }

      return map;
    },
  })
);
```

## 固定 84 天

```dataviewjs
const heatmap = Tessera.use("heatmap");

dv.container.appendChild(
  heatmap({
    settings: {
      rangeMode: "fixed-days",
      fixedDays: 84,
    },
    getData: ({ start, end, utils }) => {
      const map = new Map();
      let cur = utils.normalizeDate(start);

      while (cur <= end) {
        map.set(utils.toDateKey(cur), {
          value: Math.round(Math.random() * 100),
        });
        cur = utils.addDays(cur, 1);
      }

      return map;
    },
    getCellStyle: ({ entry, theme, utils }) => ({
      color: utils.pickScaleColor(entry?.value, theme.light.levels, {
        min: 0,
        max: 100,
      }),
    }),
    legend: "弱 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 强",
  })
);
```

## 枚举状态颜色

```dataviewjs
const heatmap = Tessera.use("heatmap");

dv.container.appendChild(
  heatmap({
    settings: {
      rangeMode: "fixed-days",
      fixedDays: 56,
    },
    getData: ({ start, end, utils }) => {
      const statuses = ["none", "planned", "doing", "done", "skipped"];
      const map = new Map();
      let cur = utils.normalizeDate(start);

      while (cur <= end) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        map.set(utils.toDateKey(cur), { status });
        cur = utils.addDays(cur, 1);
      }

      return map;
    },
    getCellStyle: ({ entry, utils }) => ({
      color: utils.pickEnumColor(
        entry?.status,
        {
          none: "#e2e8f0",
          planned: "#93c5fd",
          doing: "#fbbf24",
          done: "#22c55e",
          skipped: "#f87171",
        },
        "#e2e8f0"
      ),
      title: entry?.status || "none",
    }),
    renderTooltip: ({ entry, dateKey }) => `
      <span class="ts-heatmap-tooltip__main">状态：${entry?.status || "none"}</span>
      <span class="ts-heatmap-tooltip__date">${dateKey}</span>
    `,
    legend: "状态 $#e2e8f0$$#93c5fd$$#fbbf24$$#22c55e$$#f87171$ 强",
  })
);
```

## 自定义主题与单实例样式

```dataviewjs
const heatmap = Tessera.use("heatmap");

dv.container.appendChild(
  heatmap({
    colors: {
      light: {
        dayBg: "#f8fafc",
        tooltip: "#ffffff",
        tooltipBg: "#111827",
        levels: ["#f8fafc", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"],
      },
      dark: {
        dayBg: "#334155",
        tooltip: "#0f172a",
        tooltipBg: "#f8fafc",
        levels: ["#334155", "#172554", "#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
      },
    },
    legend: "少 $#f8fafc$$#93c5fd$$#3b82f6$$#1e3a8a$ 多",
    styles: {
      root: {
        marginTop: "8px",
      },
      legend: {
        justifyContent: "flex-end",
      },
    },
    getData: ({ start, end, utils }) => {
      const map = new Map();
      let cur = utils.normalizeDate(start);

      while (cur <= end) {
        map.set(utils.toDateKey(cur), {
          total: 8,
          completed: Math.floor(Math.random() * 9),
        });
        cur = utils.addDays(cur, 1);
      }

      return map;
    },
  })
);
```

## 访问 `parts` 与主动刷新

```dataviewjs
const heatmap = Tessera.use("heatmap");

const node = heatmap({
  getData: ({ start, end, utils }) => {
    const map = new Map();
    let cur = utils.normalizeDate(start);
    while (cur <= end) {
      map.set(utils.toDateKey(cur), {
        total: 3,
        completed: Math.floor(Math.random() * 4),
      });
      cur = utils.addDays(cur, 1);
    }
    return map;
  },
});

node.parts.legend.style.marginTop = "10px";
dv.container.appendChild(node);

setTimeout(() => {
  node.refresh();
}, 1500);
```
