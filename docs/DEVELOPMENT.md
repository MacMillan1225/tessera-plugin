# TesseraScript Development Guide

This guide is for developers who want to contribute to TesseraScript or create custom components.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Creating Components](#creating-components)
- [Core Modules](#core-modules)
- [Testing](#testing)
- [Building](#building)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Obsidian (for testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/tessera-script/tessera-plugin.git
cd tessera-plugin

# Install dependencies
npm install

# Start development
npm run dev
```

### Development Workflow

1. Make changes to source files in `src/`
2. The build system automatically recompiles
3. Reload Obsidian to test changes
4. Enable the plugin in Obsidian settings

## Architecture

### Module System

TesseraScript uses a custom module system similar to CommonJS:

```typescript
// Define a module
Tessera.define("module-name", function(require, module, exports) {
  // Module code
  exports.myFunction = function() { ... };
});

// Use a module
const { myFunction } = Tessera.use("module-name");
```

### Core Layers

```
┌─────────────────────────────────────────────┐
│                 Components                   │
│  card, heatmap, progressbar, example        │
├─────────────────────────────────────────────┤
│                  Core                        │
│  dom, css, config, file                     │
├─────────────────────────────────────────────┤
│                Runtime                       │
│  bootstrap, module system                   │
└─────────────────────────────────────────────┘
```

### Plugin Integration

The plugin integrates with Obsidian through:

1. **Plugin Lifecycle**: `onload()` and `onunload()` hooks
2. **Global API**: Exposing `Tessera` object to `globalThis`
3. **Dataview Bridge**: Integration with Dataview plugin
4. **Style Management**: Automatic CSS injection

## Creating Components

### Step 1: Create Component Directory

```
src/components/my-component/
├── index.ts           # Component logic
├── config.json        # Default configuration
├── style.css          # Component styles
└── README.md          # Documentation
```

### Step 2: Implement Component

```typescript
// src/components/my-component/index.ts
import { createElement } from "../../core/dom";

export interface MyComponentOptions {
  title?: string;
  value?: number;
  // ... other options
}

const defaultConfig: MyComponentOptions = {
  title: "",
  value: 0,
};

export function myComponent(options: MyComponentOptions = {}): HTMLElement {
  const resolved = { ...defaultConfig, ...options };
  
  return createElement("div", {
    className: "ts-my-component",
    children: [
      createElement("div", {
        className: "ts-my-component__title",
        text: resolved.title,
      }),
      createElement("div", {
        className: "ts-my-component__value",
        text: String(resolved.value),
      }),
    ],
  });
}

export default myComponent;
```

### Step 3: Create Styles

```css
/* src/components/my-component/style.css */
.ts-my-component {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
}

.ts-my-component__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-normal);
}

.ts-my-component__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-accent);
}
```

### Step 4: Create Default Config

```json
{
  "title": "",
  "value": 0
}
```

### Step 5: Register Component

Update `src/components/index.ts`:

```typescript
import { myComponent } from "./my-component/index";

export function registerComponents(tessera: any): void {
  // ... existing registrations ...
  
  tessera.define("components/my-component", function(require, module, exports) {
    module.exports = myComponent;
    module.exports.myComponent = myComponent;
  });
}
```

### Step 6: Update Aggregation Entry

Add to the `index` module in `registerComponents`:

```typescript
tessera.define("index", function(require, module, exports) {
  module.exports = {
    // ... existing exports ...
    myComponent: myComponent.myComponent || myComponent,
  };
});
```

### Step 7: Add Alias (Optional)

In `src/runtime/bootstrap.ts`:

```typescript
private registerDefaultAliases(): void {
  this.alias({
    // ... existing aliases ...
    "my-component": "components/my-component",
  });
}
```

## Core Modules

### DOM Module (`core/dom`)

Provides DOM creation utilities:

```typescript
import { createElement, fragment } from "../../core/dom";

const el = createElement("div", {
  className: ["class1", "class2"],
  style: { color: "red" },
  attrs: { "data-id": "123" },
  text: "Hello",
  children: [child1, child2],
});

const frag = fragment([el1, el2]);
```

### CSS Module (`core/css`)

Manages CSS injection:

```typescript
import { createCSSController } from "../../core/css";

const css = createCSSController();

// Add CSS
await css.add({
  id: "my-styles",
  text: ".my-class { color: red; }",
});

// Ensure CSS is loaded (idempotent)
await css.ensure({
  id: "my-styles",
  path: "path/to/styles.css",
});

// Remove CSS
css.remove("my-styles");
```

### Config Module (`core/config`)

Manages configuration:

```typescript
import { createConfigController } from "../../core/config";

const config = createConfigController();

// Create a scope
const scope = config.createScope({
  path: "path/to/config.json",
  fallback: { key: "value" },
});

// Load config
await scope.load();

// Get config with overrides
const merged = scope.merge({ key: "override" });
```

### File Module (`core/file`)

Provides file operations:

```typescript
import { createFileController } from "../../core/file";

const file = createFileController({ app });

// Read file
const content = await file.read("path/to/file.txt");

// Read JSON
const json = await file.readJson("path/to/config.json");

// Check if file exists
if (file.exists("path/to/file.txt")) {
  // ...
}

// Get resource URL
const url = file.getResourceUrl("path/to/image.png");
```

## Testing

### Manual Testing

1. Build the plugin: `npm run build`
2. Copy `main.js`, `styles.css`, `manifest.json` to your vault
3. Enable the plugin in Obsidian
4. Create a test note with DataviewJS code blocks

### Automated Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── runtime/
│   │   └── bootstrap.test.ts
│   ├── core/
│   │   ├── dom.test.ts
│   │   └── css.test.ts
│   └── components/
│       └── card.test.ts
└── integration/
    └── plugin.test.ts
```

## Building

### Development Build

```bash
npm run dev
```

This starts a watch mode that automatically recompiles on changes.

### Production Build

```bash
npm run build
```

This creates optimized, minified output.

### Build Output

- `main.js` - Plugin code (bundled)
- `styles.css` - Base styles
- `manifest.json` - Plugin manifest

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should do one thing well
2. **Composability**: Components should be easy to combine
3. **Configurability**: Provide sensible defaults with override options
4. **Theme Support**: Always support light and dark themes

### CSS Guidelines

1. **Use CSS Variables**: For theme-aware styling
2. **BEM Naming**: Use `ts-component__element--modifier` pattern
3. **Scope Styles**: Avoid global selectors
4. **Responsive**: Consider mobile layouts

### TypeScript Guidelines

1. **Type Everything**: Use explicit types for all parameters
2. **Export Interfaces**: For component options
3. **JSDoc Comments**: Document public APIs
4. **No `any`**: Use `unknown` if type is truly unknown

### Performance Guidelines

1. **Lazy Load**: Load styles on first use
2. **Batch DOM**: Use `fragment()` for multiple elements
3. **Avoid Reflows**: Minimize layout thrashing
4. **Cache Results**: Memoize expensive computations

### Documentation Guidelines

1. **README**: Every component needs a README
2. **Examples**: Provide usage examples
3. **Options**: Document all options
4. **TypeScript**: Export types for IntelliSense

## Common Patterns

### Theme-Aware Component

```typescript
export function myComponent(options: Options): HTMLElement {
  const colors = resolveColors(options.colors);
  
  return createElement("div", {
    style: {
      "--my-bg-light": colors.light.background,
      "--my-bg-dark": colors.dark.background,
    },
  });
}
```

### Lazy Style Loading

```typescript
let stylePromise: Promise<void> | null = null;

function ensureStyles(): Promise<void> {
  if (!stylePromise) {
    stylePromise = css.ensure({
      id: "my-component",
      text: componentStyles,
    });
  }
  return stylePromise;
}

export function myComponent(options: Options): HTMLElement {
  ensureStyles(); // Fire and forget
  return createElement("div", { ... });
}
```

### Parts Exposure

```typescript
export function myComponent(options: Options): HTMLElement {
  const title = createElement("div", { ... });
  const body = createElement("div", { ... });
  
  const root = createElement("div", {
    children: [title, body],
  });
  
  // Expose parts for external access
  (root as any).parts = { title, body };
  
  return root;
}
```

## Troubleshooting

### Module Not Found

```
Error: [Tessera] Module not found: components/my-component
```

**Solution**: Ensure the module is registered in `src/components/index.ts`.

### Styles Not Applied

**Solution**: 
1. Check CSS class names match
2. Ensure `ensureStyles()` is called
3. Verify CSS is injected (check `<style>` elements in DOM)

### TypeScript Errors

**Solution**:
1. Run `npm run build` to check for type errors
2. Ensure all types are properly exported
3. Check `tsconfig.json` configuration

## Resources

- [Obsidian Plugin API](https://docs.obsidian.md)
- [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## Getting Help

- Open an issue on GitHub
- Check existing issues for solutions
- Join the discussion in GitHub Discussions
