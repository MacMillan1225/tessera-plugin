# TesseraScript Plugin

A modular component library for Obsidian's DataviewJS. Build beautiful dashboards, cards, heatmaps, and more with simple, composable components.

## Features

- 🎨 **Beautiful Components**: Pre-built card, heatmap, and progressbar components
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- 🌓 **Dark Mode**: Automatic theme switching with Obsidian
- ⚡ **Performance**: Lazy-loaded styles and optimized rendering
- 🔧 **Configurable**: Deep customization for every component
- 📦 **Modular**: Use only what you need

## Installation

### From Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "TesseraScript"
4. Install and enable

### Manual Installation

1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release
2. Create a folder `tessera-script` in your vault's `.obsidian/plugins/` directory
3. Copy the files into the folder
4. Enable the plugin in Obsidian Settings

## Quick Start

After enabling the plugin, you can use TesseraScript components in any DataviewJS code block:

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

A general-purpose card component for dashboards and panels.

```dataviewjs
const { card } = Tessera.use("components");

dv.container.appendChild(card({
  title: "Today's Tasks",
  meta: "TODO",
  value: 5,
  content: "Tasks completed today",
  flags: {
    showHeader: true,
    showHeaderSep: true
  },
  layout: {
    padding: "16px",
    radius: "16px"
  }
}));
```

#### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `""` | Card title |
| `meta` | `string` | `""` | Meta information (shown in header) |
| `value` | `any` | `null` | Main value to display |
| `content` | `any` | `undefined` | Card content |
| `children` | `any` | `undefined` | Custom child elements |
| `emptyText` | `string` | `"No content"` | Text when content is empty |
| `flags.showHeader` | `boolean` | `true` | Show header section |
| `flags.showHeaderSep` | `boolean` | `true` | Show header separator |
| `layout.padding` | `string` | `"16px"` | Card padding |
| `layout.radius` | `string` | `"16px"` | Border radius |

### Heatmap

A calendar heatmap component for data visualization.

```dataviewjs
const { heatmap } = Tessera.use("components");

// Generate sample data
const data = {};
const today = new Date();
for (let i = 0; i < 365; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split("T")[0];
  data[dateStr] = Math.floor(Math.random() * 10);
}

dv.container.appendChild(heatmap({
  data: data,
  cellSize: 12,
  cellGap: 2
}));
```

#### Heatmap Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `Record<string, number>` | `{}` | Date-value pairs |
| `cellSize` | `number` | `12` | Cell size in pixels |
| `cellGap` | `number` | `2` | Gap between cells |
| `colors.light.empty` | `string` | `"rgba(0,0,0,0.05)"` | Empty cell color (light) |
| `colors.light.levels` | `string[]` | Green gradient | Level colors (light) |

### Progressbar

A progress bar component for displaying progress.

```dataviewjs
const { progressbar } = Tessera.use("components");

dv.container.appendChild(progressbar({
  value: 75,
  max: 100,
  showLabel: true,
  labelFormat: "{percentage}%"
}));
```

#### Progressbar Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `number` | `0` | Current value |
| `max` | `number` | `100` | Maximum value |
| `min` | `number` | `0` | Minimum value |
| `showLabel` | `boolean` | `true` | Show percentage label |
| `labelFormat` | `string` | `"{value}%"` | Label format string |

## Advanced Usage

### Custom Styling

Override component styles using CSS variables:

```dataviewjs
const { card } = Tessera.use("components");

dv.container.appendChild(card({
  title: "Custom Card",
  content: "With custom colors",
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

Create complex layouts by combining components:

```dataviewjs
const { card, progressbar } = Tessera.use("components");

// Create a card with progress bar inside
const container = document.createElement("div");
container.style.display = "grid";
container.style.gridTemplateColumns = "repeat(3, 1fr)";
container.style.gap = "16px";

for (let i = 0; i < 3; i++) {
  const progressBar = progressbar({
    value: Math.floor(Math.random() * 100),
    labelFormat: "Progress {percentage}%"
  });
  
  const cardEl = card({
    title: `Project ${i + 1}`,
    meta: "STATUS",
    children: progressBar
  });
  
  container.appendChild(cardEl);
}

dv.container.appendChild(container);
```

### Accessing Component Parts

Access internal elements for further customization:

```dataviewjs
const { card } = Tessera.use("components");

const cardEl = card({
  title: "Dynamic Card",
  content: "Initial content"
});

// Access parts
const { title, body } = cardEl.parts;

// Modify after creation
title.textContent = "Updated Title";
body.innerHTML = "<p>New content!</p>";

dv.container.appendChild(cardEl);
```

## Configuration

### Plugin Settings

Access plugin settings via Settings → TesseraScript:

- **Enable Legacy Mode**: Allow loading modules via `dv.view()` (deprecated)
- **Show Deprecation Warnings**: Show warnings for deprecated features
- **Default Theme**: Auto, Light, or Dark

### Component Configuration

Each component can be configured globally or per-instance:

```dataviewjs
// Load and update global config
const { loadCardConfig, updateCardConfig } = Tessera.use("components/card");

// Update global defaults
updateCardConfig({
  layout: {
    padding: "24px",
    radius: "12px"
  },
  colors: {
    light: {
      background: "rgba(255, 255, 255, 0.9)"
    }
  }
});

// All subsequent cards will use these defaults
dv.container.appendChild(card({ title: "Uses new defaults" }));
```

## API Reference

### Global Object

The plugin exposes a global `Tessera` object:

```javascript
// Import modules
const module = Tessera.use("module-name");

// Check if module exists
Tessera.has("components/card"); // true

// Get version
Tessera.version; // "1.0.0"
```

### Module System

```javascript
// Define a custom module
Tessera.define("my-module", function(require, module, exports) {
  const { createElement } = require("core/dom");
  
  exports.myFunction = function() {
    return createElement("div", { text: "Hello" });
  };
});

// Use it
const { myFunction } = Tessera.use("my-module");
```

## Troubleshooting

### Components not rendering

1. Ensure Dataview plugin is installed and enabled
2. Check that you're using DataviewJS code blocks (not regular Dataview)
3. Check the console for error messages

### Styles not applying

1. Try reloading the plugin (Command Palette → Reload TesseraScript)
2. Check if your theme overrides component styles
3. Ensure `styles.css` is present in the plugin folder

### Performance issues

1. Avoid creating too many components in a single code block
2. Use `fragment()` for batch DOM operations
3. Consider using `requestAnimationFrame()` for animations

## Examples

### Dashboard

```dataviewjs
const { card, progressbar } = Tessera.use("components");

const dashboard = document.createElement("div");
dashboard.style.cssText = `
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
`;

// Stats cards
const stats = [
  { title: "Total Notes", value: "1,234", meta: "NOTES" },
  { title: "This Week", value: "56", meta: "CREATED" },
  { title: "In Progress", value: "12", meta: "TASKS" },
  { title: "Completed", value: "89%", meta: "RATE" }
];

stats.forEach(stat => {
  dashboard.appendChild(card(stat));
});

// Progress section
const progressSection = document.createElement("div");
progressSection.style.cssText = `
  grid-column: span 4;
  padding: 16px;
`;

["Project A", "Project B", "Project C"].forEach((name, i) => {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "12px";
  
  const label = document.createElement("div");
  label.textContent = name;
  label.style.marginBottom = "4px";
  label.style.fontWeight = "600";
  
  wrapper.appendChild(label);
  wrapper.appendChild(progressbar({
    value: [75, 45, 90][i],
    showLabel: true,
    labelFormat: "{percentage}%"
  }));
  
  progressSection.appendChild(wrapper);
});

dashboard.appendChild(progressSection);
dv.container.appendChild(dashboard);
```

### Activity Heatmap

```dataviewjs
const { heatmap, card } = Tessera.use("components");

// Get data from your vault (example)
const data = {};
const pages = dv.pages('"Daily"');

pages.forEach(page => {
  const date = page.file.name;
  data[date] = page.tasks?.length || 0;
});

// Create card with heatmap
dv.container.appendChild(card({
  title: "Activity",
  meta: "LAST 365 DAYS",
  children: heatmap({
    data: data,
    cellSize: 12,
    cellGap: 2
  }),
  layout: {
    padding: "24px"
  }
}));
```

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

BSD License - see [LICENSE](LICENSE) file

## Support

- [GitHub Issues](https://github.com/tessera-script/tessera-plugin/issues)
- [Documentation](https://github.com/tessera-script/tessera-plugin/wiki)
