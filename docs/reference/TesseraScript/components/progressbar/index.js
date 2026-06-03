Tessera.define("components/progressbar", function (require, module, exports) {
  const dom = require("../core/dom");
  const createCSSController = require("../core/css");
  const createConfigController = require("../core/config");

  const css = createCSSController();
  const config = createConfigController();

  let stylePromise = null;

  const colorKeys = ["track", "trackBorder", "fill", "fillGradient", "shadow", "glow"];

  const defaultProgressbarColors = {
    light: {
      track: "#e2e8f0",
      trackBorder: "rgba(148, 163, 184, 0.24)",
      fill: "#22c55e",
      fillGradient: "linear-gradient(90deg, #22c55e 0%, #34d399 100%)",
      shadow: "inset 0 1px 2px rgba(15, 23, 42, 0.05)",
      glow: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.22))",
    },
    dark: {
      track: "rgba(148, 163, 184, 0.18)",
      trackBorder: "rgba(148, 163, 184, 0.2)",
      fill: "#2dd4bf",
      fillGradient: "linear-gradient(90deg, #14b8a6 0%, #38bdf8 100%)",
      shadow: "inset 0 1px 2px rgba(15, 23, 42, 0.22)",
      glow: "drop-shadow(0 0 10px rgba(45, 212, 191, 0.18))",
    },
  };

  const defaultProgressbarConfig = {
    value: 0.64,
    min: 0,
    max: 1,
    label: "Progress",
    flags: {
      showGlow: true,
      striped: false,
      animated: false,
    },
    layout: {
      width: "100%",
      height: "10px",
      radius: "999px",
      trackOpacity: 1,
    },
    colors: defaultProgressbarColors,
    styles: {
      root: null,
      fill: null,
    },
  };

  const progressbarConfig = config.createScope({
    path: "TesseraScript/components/progressbar/config.json",
    fallback: defaultProgressbarConfig,
  });

  function ensureStyles() {
    if (!stylePromise) {
      stylePromise = css
        .ensure({
          id: "components-progressbar",
          path: "TesseraScript/components/progressbar/style.css",
        })
        .catch((error) => {
          stylePromise = null;
          console.warn("[Tessera] Failed to load progressbar styles.", error);
        });
    }

    return stylePromise;
  }

  function loadProgressbarConfig(options = {}) {
    return progressbarConfig.load(options).catch((error) => {
      console.warn("[Tessera] Failed to load progressbar config.", error);
      return progressbarConfig.get();
    });
  }

  function mergeStyles() {
    const styles = Array.prototype.slice.call(arguments);

    return styles.reduce((result, style) => {
      if (!style || typeof style !== "object") {
        return result;
      }

      return Object.assign(result, style);
    }, {});
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pickSharedColors(colors) {
    return colorKeys.reduce((result, key) => {
      if (colors && colors[key] !== undefined) {
        result[key] = colors[key];
      }

      return result;
    }, {});
  }

  function resolveThemeColors(colors) {
    const sharedColors = pickSharedColors(colors || {});

    return {
      light: mergeStyles(defaultProgressbarColors.light, sharedColors, colors && colors.light),
      dark: mergeStyles(defaultProgressbarColors.dark, sharedColors, colors && colors.dark),
    };
  }

  function resolveProgress(resolved, input) {
    const source = input || {};
    const hasExplicitRange = source.min !== undefined || source.max !== undefined;
    const options = resolved || {};
    const value = Number(options.value);
    const min = Number.isFinite(Number(options.min)) ? Number(options.min) : 0;
    const max = Number.isFinite(Number(options.max)) ? Number(options.max) : 1;

    if (!Number.isFinite(value)) {
      return { ratio: 0, percent: 0 };
    }

    if (hasExplicitRange && max > min) {
      const ratio = clamp((value - min) / (max - min), 0, 1);
      return {
        ratio,
        percent: Math.round(ratio * 100),
      };
    }

    const fallbackRatio = value > 1 ? clamp(value / 100, 0, 1) : clamp(value, 0, 1);
    return {
      ratio: fallbackRatio,
      percent: Math.round(fallbackRatio * 100),
    };
  }

  function progressbar(options = {}) {
    ensureStyles();
    loadProgressbarConfig();

    const resolved = progressbarConfig.merge(options);
    const flags = resolved.flags || {};
    const layout = resolved.layout || {};
    const colors = resolveThemeColors(resolved.colors || {});
    const styles = resolved.styles || {};
    const progress = resolveProgress(resolved, options);

    const fill = dom.createElement("div", {
      className: [
        "ts-progressbar__fill",
        flags.striped === true && flags.animated !== false && "ts-progressbar__fill--animated",
      ],
      attrs: {
        "data-progress-label": resolved.label || "Progress",
      },
      style: mergeStyles(
        {
          width: progress.percent + "%",
          minWidth: progress.percent > 0 ? "2px" : "0",
          "--ts-progressbar-fill-color": colors.light.fill,
          "--ts-progressbar-fill-color-dark": colors.dark.fill,
        },
        styles.fill
      ),
    });

    const root = dom.createElement("div", {
      className: [
        "ts-progressbar",
        flags.animated === false && "ts-progressbar--static",
        flags.striped === true && "ts-progressbar--striped",
        flags.showGlow === false && "ts-progressbar--no-glow",
        resolved.className,
      ],
      attrs: {
        role: "progressbar",
        "aria-label": resolved.label || "Progress",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": progress.percent,
      },
      style: mergeStyles(
        {
          width: layout.width,
          "--ts-progressbar-height": layout.height,
          "--ts-progressbar-radius": layout.radius,
          "--ts-progressbar-track-opacity": layout.trackOpacity,
          "--ts-progressbar-track-light": colors.light.track,
          "--ts-progressbar-track-dark": colors.dark.track,
          "--ts-progressbar-track-border-light": colors.light.trackBorder,
          "--ts-progressbar-track-border-dark": colors.dark.trackBorder,
          "--ts-progressbar-fill-light": colors.light.fill,
          "--ts-progressbar-fill-dark": colors.dark.fill,
          "--ts-progressbar-fill-gradient-light": colors.light.fillGradient,
          "--ts-progressbar-fill-gradient-dark": colors.dark.fillGradient,
          "--ts-progressbar-shadow-light": colors.light.shadow,
          "--ts-progressbar-shadow-dark": colors.dark.shadow,
          "--ts-progressbar-glow-light": colors.light.glow,
          "--ts-progressbar-glow-dark": colors.dark.glow,
        },
        styles.root
      ),
      children: fill,
    });

    root.parts = { fill };
    return root;
  }

  module.exports = progressbar;
  module.exports.progressbar = progressbar;
  module.exports.loadConfig = loadProgressbarConfig;
  module.exports.getDefaultConfig = progressbarConfig.get;
});
