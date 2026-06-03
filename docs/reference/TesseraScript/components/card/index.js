Tessera.define("components/card", function (require, module, exports) {
  const dom = require("../core/dom");
  const createCSSController = require("../core/css");
  const createConfigController = require("../core/config");

  const css = createCSSController();
  const config = createConfigController();

  let stylePromise = null;

  const themeColorKeys = [
    "background",
    "border",
    "shadow",
    "hoverAccent",
    "value",
  ];

  const defaultCardColors = {
    light: {
      background: "rgba(245, 248, 252, 0.9)",
      border: "rgba(120, 140, 160, 0.18)",
      shadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
      hoverAccent: "var(--interactive-accent)",
      value: "var(--text-accent, var(--text-normal))",
    },
    dark: {
      background: "rgba(30, 41, 59, 0.72)",
      border: "rgba(148, 163, 184, 0.18)",
      shadow: "0 16px 36px rgba(2, 6, 23, 0.28)",
      hoverAccent: "var(--interactive-accent)",
      value: "var(--text-accent, var(--text-normal))",
    },
  };

  const defaultCardConfig = {
    title: "",
    meta: "",
    value: null,
    emptyText: "No content",
    flags: {
      showHeader: true,
      headerSep: true,
      showTitle: true,
      showMeta: true,
      showValue: true,
    },
    layout: {
      maxWidth: "100%",
      padding: "16px",
      radius: "16px",
      gap: "14px",
      bodyGap: "12px",
    },
    colors: defaultCardColors,
    styles: {
      card: null,
      header: null,
      title: null,
      meta: null,
      body: null,
      value: null,
      empty: null,
    },
  };

  const cardConfig = config.createScope({
    path: "TesseraScript/components/card/config.json",
    fallback: defaultCardConfig,
  });

  function ensureStyles() {
    if (!stylePromise) {
      stylePromise = css
        .ensure({
          id: "components-card",
          path: "TesseraScript/components/card/style.css",
        })
        .catch((error) => {
          stylePromise = null;
          console.warn("[Tessera] Failed to load card styles.", error);
        });
    }

    return stylePromise;
  }

  function normalizeChildren(content) {
    if (content == null) {
      return [];
    }

    return Array.isArray(content) ? content : [content];
  }

  function loadCardConfig(options = {}) {
    return cardConfig.load(options).catch((error) => {
      console.warn("[Tessera] Failed to load card config.", error);
      return cardConfig.get();
    });
  }

  function mergeStyles(...styles) {
    return styles.reduce((result, style) => {
      if (!style || typeof style !== "object") {
        return result;
      }

      return Object.assign(result, style);
    }, {});
  }

  function pickSharedColors(colors = {}) {
    return themeColorKeys.reduce((result, key) => {
      if (colors[key] !== undefined) {
        result[key] = colors[key];
      }

      return result;
    }, {});
  }

  function resolveThemeColors(colors = {}) {
    const sharedColors = pickSharedColors(colors);

    return {
      light: mergeStyles(defaultCardColors.light, sharedColors, colors.light),
      dark: mergeStyles(defaultCardColors.dark, sharedColors, colors.dark),
    };
  }

  function card(options = {}) {
    ensureStyles();
    loadCardConfig();

    const resolved = cardConfig.merge(options);

    const flags = resolved.flags || {};
    const layout = resolved.layout || {};
    const themeColors = resolveThemeColors(resolved.colors || {});
    const styles = resolved.styles || {};

    const headerChildren = [];
    const titleText = resolved.title;
    const metaText = resolved.meta;
    const valueContent = resolved.value;

    if (flags.showTitle !== false && titleText) {
      headerChildren.push(
        dom.createElement("div", {
          className: "ts-card__title",
          style: styles.title,
          text: titleText,
        })
      );
    }

    if (flags.showMeta !== false && metaText) {
      headerChildren.push(
        dom.createElement("div", {
          className: "ts-card__meta",
          style: styles.meta,
          text: metaText,
        })
      );
    }

    const bodyChildren = [];

    if (flags.showValue !== false && valueContent != null) {
      bodyChildren.push(
        dom.createElement("div", {
          className: "ts-card__value",
          style: styles.value,
          text: String(valueContent),
        })
      );
    }

    bodyChildren.push(
      ...normalizeChildren(
        resolved.content !== undefined ? resolved.content : resolved.children
      )
    );

    return dom.createElement("article", {
      className: ["ts-card", resolved.className],
      style: mergeStyles(
        {
          maxWidth: layout.maxWidth,
          "--ts-card-padding": layout.padding,
          "--ts-card-radius": layout.radius,
          "--ts-card-gap": layout.gap,
          "--ts-card-body-gap": layout.bodyGap,
          "--ts-card-background-light": themeColors.light.background,
          "--ts-card-background-dark": themeColors.dark.background,
          "--ts-card-border-light": themeColors.light.border,
          "--ts-card-border-dark": themeColors.dark.border,
          "--ts-card-shadow-light": themeColors.light.shadow,
          "--ts-card-shadow-dark": themeColors.dark.shadow,
          "--ts-card-hover-accent-light": themeColors.light.hoverAccent,
          "--ts-card-hover-accent-dark": themeColors.dark.hoverAccent,
          "--ts-card-value-color-light": themeColors.light.value,
          "--ts-card-value-color-dark": themeColors.dark.value,
        },
        styles.card
      ),
      children: [
        flags.showHeader !== false && headerChildren.length
          ? dom.createElement("header", {
              className: [
                "ts-card__header",
                flags.headerSep !== false && "ts-card__header--sep",
              ],
              style: styles.header,
              children: headerChildren,
            })
          : null,

        dom.createElement("section", {
          className: "ts-card__body",
          style: styles.body,
          children: bodyChildren.length
            ? bodyChildren
            : dom.createElement("div", {
                className: "ts-card__empty",
                style: styles.empty,
                text: resolved.emptyText,
              }),
        }),
      ],
    });
  }

  module.exports = card;
  module.exports.card = card;
  module.exports.loadConfig = loadCardConfig;
  module.exports.getDefaultConfig = cardConfig.get;
});
