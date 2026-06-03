# progressbar demo

## 最小示例

```dataviewjs
await dv.view("TesseraScript/tessera.bootstrap");
await dv.view("TesseraScript/core/dom");
await dv.view("TesseraScript/core/file");
await dv.view("TesseraScript/core/css");
await dv.view("TesseraScript/core/config");
await dv.view("TesseraScript/components/progressbar/index");

const progressbar = Tessera.use("progressbar");

dv.container.appendChild(progressbar({ value: 0.68 }));
```

## 设置面板风格

```dataviewjs
const progressbar = Tessera.use("progressbar");

dv.container.appendChild(
  progressbar({
    value: 42,
    min: 0,
    max: 100,
    layout: {
      height: "8px",
    },
    colors: {
      light: {
        fill: "linear-gradient(90deg, rgba(170, 180, 190, 0.9) 0%, rgba(117, 133, 150, 0.98) 100%)",
      },
    },
  })
);
```

## Dashboard 强调版

```dataviewjs
const progressbar = Tessera.use("progressbar");

dv.container.appendChild(
  progressbar({
    value: 0.84,
    flags: {
      striped: true,
      animated: true,
    },
    layout: {
      height: "12px",
    },
  })
);
```

## 单实例样式覆盖

```dataviewjs
const progressbar = Tessera.use("progressbar");

dv.container.appendChild(
  progressbar({
    value: 0.56,
    styles: {
      root: {
        maxWidth: "280px",
      },
      fill: {
        filter: "saturate(0.9) brightness(1.02)",
      },
    },
  })
);
```
