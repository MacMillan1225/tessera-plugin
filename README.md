# TesseraScript Obsidian Plugin

A modular component library for Obsidian's DataviewJS. Build beautiful dashboards, cards, heatmaps, and more with simple, composable components.

![TesseraScript](https://img.shields.io/badge/TesseraScript-v1.0.0-blue)
![Obsidian](https://img.shields.io/badge/Obsidian-v1.5.0+-purple)
![License](https://img.shields.io/badge/License-BSD-green)

## Features

- 🎨 **Beautiful Components**: Pre-built card, heatmap, and progressbar components
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- 🌓 **Dark Mode**: Automatic theme switching with Obsidian
- ⚡ **Performance**: Lazy-loaded styles and optimized rendering
- 🔧 **Configurable**: Deep customization for every component
- 📦 **Modular**: Use only what you need

## Quick Start

### Installation

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "TesseraScript"
4. Install and enable

### Basic Usage

```dataviewjs
// Import components
const { card, heatmap, progressbar } = Tessera.use("components");

// Create a simple card
dv.container.appendChild(card({
  title: "Hello World",
  meta: "GREETING",
  value: 42,
  content: "This is a TesseraScript card!"
}));
```

## Components

### Card

```dataviewjs
const { card } = Tessera.use("components");

dv.container.appendChild(card({
  title: "Today's Tasks",
  meta: "TODO",
  value: 5,
  content: "Tasks completed today"
}));
```

### Heatmap

```dataviewjs
const { heatmap } = Tessera.use("components");

const data = {};
for (let i = 0; i < 365; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  data[date.toISOString().split("T")[0]] = Math.floor(Math.random() * 10);
}

dv.container.appendChild(heatmap({ data }));
```

### Progressbar

```dataviewjs
const { progressbar } = Tessera.use("components");

dv.container.appendChild(progressbar({
  value: 75,
  showLabel: true,
  labelFormat: "{percentage}%"
}));
```

## Advanced Usage

### Custom Styling

```dataviewjs
dv.container.appendChild(card({
  title: "Custom Card",
  colors: {
    light: {
      background: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    dark: {
      background: "rgba(59, 130, 246, 0.2)",
      border: "rgba(59, 130, 246, 0.4)"
    }
  }
}));
```

### Combining Components

```dataviewjs
const { card, progressbar } = Tessera.use("components");

const dashboard = document.createElement("div");
dashboard.style.display = "grid";
dashboard.style.gridTemplateColumns = "repeat(3, 1fr)";
dashboard.style.gap = "16px";

for (let i = 0; i < 3; i++) {
  dashboard.appendChild(card({
    title: `Project ${i + 1}`,
    children: progressbar({
      value: Math.floor(Math.random() * 100),
      labelFormat: "Progress {percentage}%"
    })
  }));
}

dv.container.appendChild(dashboard);
```

## Documentation

- [User Guide](docs/README.md) - Complete usage documentation
- [Development Guide](docs/DEVELOPMENT.md) - For contributors and custom component developers

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/tessera-script/tessera-plugin.git

# Install dependencies
cd tessera-plugin
npm install

# Development mode
npm run dev

# Production build
npm run build
```

### Project Structure

```
tessera-plugin/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── runtime/
│   │   └── bootstrap.ts     # Module system
│   ├── core/
│   │   ├── dom.ts           # DOM utilities
│   │   ├── css.ts           # CSS management
│   │   ├── config.ts        # Configuration
│   │   └── file.ts          # File operations
│   ├── components/
│   │   ├── card/            # Card component
│   │   ├── heatmap/         # Heatmap component
│   │   ├── progressbar/     # Progressbar component
│   │   └── index.ts         # Component registry
│   └── utils/
│       ├── logger.ts        # Logging utility
│       └── style-manager.ts # Style management
├── styles.css               # Base styles
├── manifest.json            # Plugin manifest
└── package.json             # Dependencies
```

## API Reference

### Global Object

```javascript
// Import modules
const module = Tessera.use("module-name");

// Check if module exists
Tessera.has("components/card"); // true

// Get version
Tessera.version; // "1.0.0"
```

### Component Options

#### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `""` | Card title |
| `meta` | `string` | `""` | Meta information |
| `value` | `any` | `null` | Main value |
| `content` | `any` | `undefined` | Card content |
| `flags.showHeader` | `boolean` | `true` | Show header |
| `layout.padding` | `string` | `"16px"` | Padding |

#### Heatmap Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `Record<string, number>` | `{}` | Date-value pairs |
| `cellSize` | `number` | `12` | Cell size |
| `cellGap` | `number` | `2` | Cell gap |

#### Progressbar Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `number` | `0` | Current value |
| `max` | `number` | `100` | Maximum value |
| `showLabel` | `boolean` | `true` | Show label |
| `labelFormat` | `string` | `"{value}%"` | Label format |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

BSD License - see [LICENSE](LICENSE) file

## Support

- [GitHub Issues](https://github.com/tessera-script/tessera-plugin/issues)
- [Documentation](https://github.com/tessera-script/tessera-plugin/wiki)

## Acknowledgments

- [Obsidian](https://obsidian.md/) - The knowledge base
- [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) - Data query engine
- [Obsidian Plugin API](https://docs.obsidian.md/) - Plugin development
