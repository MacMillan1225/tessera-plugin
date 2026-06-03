Tessera.define("components/heatmap", function (require, module, exports) {
  const dom = require("../core/dom");
  const createCSSController = require("../core/css");
  const createConfigController = require("../core/config");

  const css = createCSSController();
  const config = createConfigController();

  const LEGEND_COLOR_TOKEN = /\$#([0-9a-fA-F]{3,8})\$/g;
  const MAX_LEVEL = 8;
  const THEME_COLOR_KEYS = ["dayBg", "tooltip", "tooltipBg"];

  let stylePromise = null;

  const defaultHeatmapTheme = {
    light: {
      dayBg: "#f1f5f9",
      tooltip: "#ffffff",
      tooltipBg: "#0f172a",
      levels: [
        "#f1f5f9",
        "#dcfce7",
        "#bbf7d0",
        "#86efac",
        "#4ade80",
        "#22c55e",
        "#16a34a",
        "#15803d",
        "#14532d",
      ],
    },
    dark: {
      dayBg: "#334155",
      tooltip: "#0f172a",
      tooltipBg: "#f1f5f9",
      levels: [
        "#334155",
        "#064e3b",
        "#065f46",
        "#047857",
        "#059669",
        "#10b981",
        "#34d399",
        "#6ee7b7",
        "#a7f3d0",
      ],
    },
  };

  const defaultHeatmapConfig = {
    data: null,
    startDate: null,
    endDate: null,
    flags: {
      showWeekLabels: true,
      showMonthLabels: true,
      showLegend: true,
      enableTooltip: true,
      mondayFirst: true,
    },
    settings: {
      rangeMode: "adaptive",
      minWeeks: 12,
      fixedDays: 84,
      locale: "zh-CN",
      monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      weekLabels: ["一", "", "三", "", "五", "", "日"],
      legend: "少 $#f1f5f9$$#bbf7d0$$#4ade80$$#15803d$ 多",
      tooltipId: "ts-heatmap-tooltip",
    },
    layout: {
      maxWidth: "100%",
      cellSize: 11,
      cellGap: 2,
      cellRadius: "3px",
      weekLabelWidth: "20px",
      weekLabelGap: "9px",
      monthLabelHeight: "18px",
      monthOffset: "28px",
      gridTopOffset: "4px",
      monthLabelSize: "9px",
      weekLabelSize: "9px",
      legendGap: "3px",
      legendTop: "6px",
      legendSwatchSize: "9px",
    },
    colors: defaultHeatmapTheme,
    styles: {
      root: null,
      months: null,
      weeks: null,
      grid: null,
      legend: null,
    },
  };

  const heatmapConfig = config.createScope({
    path: "TesseraScript/components/heatmap/config.json",
    fallback: defaultHeatmapConfig,
  });

  function ensureStyles() {
    if (!stylePromise) {
      stylePromise = css
        .ensure({
          id: "components-heatmap",
          path: "TesseraScript/components/heatmap/style.css",
        })
        .catch((error) => {
          stylePromise = null;
          console.warn("[Tessera] Failed to load heatmap styles.", error);
        });
    }

    return stylePromise;
  }

  function loadHeatmapConfig(options = {}) {
    return heatmapConfig.load(options).catch((error) => {
      console.warn("[Tessera] Failed to load heatmap config.", error);
      return heatmapConfig.get();
    });
  }

  function mergeStyles() {
    return Array.from(arguments).reduce((result, style) => {
      if (!style || typeof style !== "object") {
        return result;
      }

      return Object.assign(result, style);
    }, {});
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function normalizeDate(value) {
    if (!value) return null;
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === "string") {
      const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
      const date = new Date(normalized);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (value && typeof value.toJSDate === "function") return value.toJSDate();
    if (value && value.ts != null) return new Date(value.ts);
    return null;
  }

  function cloneDate(date) {
    return new Date(date.getTime());
  }

  function addDays(date, days) {
    const next = cloneDate(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function diffDays(start, end) {
    return Math.floor((normalizeDate(end) - normalizeDate(start)) / 86400000);
  }

  function alignToMonday(date) {
    const aligned = cloneDate(normalizeDate(date));
    const day = aligned.getDay();
    const offset = day === 0 ? 6 : day - 1;
    aligned.setDate(aligned.getDate() - offset);
    return aligned;
  }

  function alignToSunday(date) {
    const aligned = cloneDate(normalizeDate(date));
    aligned.setDate(aligned.getDate() - aligned.getDay());
    return aligned;
  }

  function toDateKey(value) {
    const date = normalizeDate(value);
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function htmlEscape(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pickScaleColor(value, palette, options = {}) {
    const list = Array.isArray(palette) ? palette : [];
    if (!list.length || value == null || Number.isNaN(Number(value))) {
      return options.fallback || null;
    }

    const min = Number(options.min != null ? options.min : 0);
    const max = Number(options.max != null ? options.max : 1);
    const span = max - min || 1;
    const ratio = Math.max(0, Math.min(1, (Number(value) - min) / span));
    const index = Math.round(ratio * (list.length - 1));
    return list[index] || options.fallback || null;
  }

  function pickEnumColor(value, mapping, fallback) {
    const key = value == null ? "" : String(value);
    return mapping && Object.prototype.hasOwnProperty.call(mapping, key)
      ? mapping[key]
      : fallback || null;
  }

  function ratioToLevel(completed, total, maxLevel) {
    const safeTotal = Number(total || 0);
    const safeCompleted = Number(completed || 0);
    const finalMaxLevel = Number(maxLevel || MAX_LEVEL);

    if (safeTotal <= 0) return 0;
    if (safeCompleted <= 0) return 1;

    return Math.min(finalMaxLevel, Math.max(1, Math.ceil((safeCompleted / safeTotal) * finalMaxLevel)));
  }

  function normalizeMap(source) {
    if (!source) return new Map();
    if (source instanceof Map) return new Map(source);
    if (Array.isArray(source)) return new Map(source);
    if (typeof source === "object") return new Map(Object.entries(source));
    return new Map();
  }

  function parseLegend(value) {
    if (value == null || value === false) return null;
    if (Array.isArray(value)) return value;

    const raw = String(value);
    if (!raw.trim()) return null;

    const items = [];
    let lastIndex = 0;

    raw.replace(LEGEND_COLOR_TOKEN, function (match, hex, offset) {
      const before = raw.slice(lastIndex, offset);
      if (before) {
        items.push({ type: "text", text: before });
      }

      items.push({ type: "color", color: `#${hex}` });
      lastIndex = offset + match.length;
      return match;
    });

    const tail = raw.slice(lastIndex);
    if (tail) {
      items.push({ type: "text", text: tail });
    }

    return items.length ? items : null;
  }

  function resolveLegend(option, context) {
    const value = typeof option === "function" ? option(context) : option;
    return parseLegend(value);
  }

  function pickSharedThemeColors(colors) {
    return THEME_COLOR_KEYS.reduce((result, key) => {
      if (colors && colors[key] !== undefined) {
        result[key] = colors[key];
      }

      return result;
    }, {});
  }

  function resolveThemeColors(colors) {
    const shared = pickSharedThemeColors(colors || {});
    const lightLevels = Array.isArray(colors && colors.light && colors.light.levels)
      ? colors.light.levels
      : colors && Array.isArray(colors.levels)
        ? colors.levels
        : defaultHeatmapTheme.light.levels;
    const darkLevels = Array.isArray(colors && colors.dark && colors.dark.levels)
      ? colors.dark.levels
      : colors && Array.isArray(colors.levels)
        ? colors.levels
        : defaultHeatmapTheme.dark.levels;

    return {
      light: mergeStyles(defaultHeatmapTheme.light, shared, colors && colors.light, { levels: lightLevels }),
      dark: mergeStyles(defaultHeatmapTheme.dark, shared, colors && colors.dark, { levels: darkLevels }),
    };
  }

  function buildUtils(locale) {
    return {
      toDateKey: toDateKey,
      normalizeDate: normalizeDate,
      addDays: addDays,
      alignToMonday: alignToMonday,
      alignToSunday: alignToSunday,
      htmlEscape: htmlEscape,
      pickScaleColor: pickScaleColor,
      pickEnumColor: pickEnumColor,
      ratioToLevel: ratioToLevel,
      locale: locale,
    };
  }

  function defaultTooltipRenderer(context) {
    const entry = context.entry;
    const dateText = normalizeDate(context.date)
      ? normalizeDate(context.date).toLocaleDateString(context.utils.locale, {
          month: "short",
          day: "numeric",
        })
      : context.dateKey;

    if (!entry || (entry.total == null && entry.completed == null && entry.value == null && entry.label == null)) {
      return `<span class="ts-heatmap-tooltip__main">无数据</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)}</span>`;
    }

    if (entry.total != null || entry.completed != null) {
      const level = ratioToLevel(entry.completed, entry.total, MAX_LEVEL);
      const percent = entry.total
        ? Math.round((Number(entry.completed || 0) / Number(entry.total || 1)) * 100)
        : 0;

      return `<span class="ts-heatmap-tooltip__main"><b>${percent}%</b> 已完成</span><span class="ts-heatmap-tooltip__main">${htmlEscape(entry.completed || 0)}/${htmlEscape(entry.total || 0)} 项</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)} · Lv${level}</span>`;
    }

    return `<span class="ts-heatmap-tooltip__main">${htmlEscape(entry.label != null ? entry.label : entry.value != null ? entry.value : "有记录")}</span><span class="ts-heatmap-tooltip__date">${htmlEscape(dateText)}</span>`;
  }

  function resolveCellStyle(context) {
    const custom = typeof context.getCellStyle === "function"
      ? context.getCellStyle(context)
      : null;

    if (typeof custom === "number") return { level: custom };
    if (typeof custom === "string") return { color: custom };
    if (custom && typeof custom === "object") return custom;

    if (context.entry && (context.entry.total != null || context.entry.completed != null)) {
      return { level: ratioToLevel(context.entry.completed, context.entry.total, MAX_LEVEL) };
    }

    if (context.entry && context.entry.level != null) {
      return { level: context.entry.level };
    }

    return { level: 0 };
  }

  function buildRange(options) {
    const settings = options.settings || {};
    const flags = options.flags || {};
    const layout = options.layout || {};
    const end = normalizeDate(options.inputEnd) || new Date();
    const mondayFirst = flags.mondayFirst !== false;

    if (settings.rangeMode === "fixed-range") {
      const rawStart = normalizeDate(options.inputStart) || addDays(end, -83);
      const start = mondayFirst ? alignToMonday(rawStart) : alignToSunday(rawStart);
      return { start: start, end: end, totalDays: diffDays(start, end) + 1 };
    }

    if (settings.rangeMode === "fixed-days") {
      const startSeed = addDays(end, -(Number(settings.fixedDays || 84) - 1));
      const start = mondayFirst ? alignToMonday(startSeed) : alignToSunday(startSeed);
      return { start: start, end: end, totalDays: diffDays(start, end) + 1 };
    }

    const cellPitch = Number(layout.cellSize || 11) + Number(layout.cellGap || 2);
    const width = Number(options.width || 0);
    const maxWeeks = Math.max(Number(settings.minWeeks || 12), Math.round((Math.max(width, 280) - 40) / cellPitch) - 1);
    const rawStart = addDays(end, -(maxWeeks * 7));
    const start = mondayFirst ? alignToMonday(rawStart) : alignToSunday(rawStart);

    return { start: start, end: end, totalDays: diffDays(start, end) + 1 };
  }

  function getThemeMode(root) {
    const themeDark = document.body.classList.contains("theme-dark") || root.classList.contains("theme-dark");
    return themeDark ? "dark" : "light";
  }

  function ensureTooltip(id) {
    let tooltip = document.getElementById(id);

    if (!tooltip) {
      tooltip = dom.createElement("div", {
        className: "ts-heatmap-tooltip",
        attrs: {
          id: id,
        },
      });
      document.body.appendChild(tooltip);
    }

    return tooltip;
  }

  function applyTooltipTheme(root, tooltip) {
    const computed = getComputedStyle(root);
    tooltip.style.setProperty("--ts-heatmap-tooltip-fg", computed.getPropertyValue("--ts-heatmap-tooltip-current").trim());
    tooltip.style.setProperty("--ts-heatmap-tooltip-bg", computed.getPropertyValue("--ts-heatmap-tooltip-bg-current").trim());
  }

  function positionTooltip(tooltip, cell) {
    const rect = cell.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();

    let top = rect.top - tipRect.height - 8;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    if (left < 10) left = 10;
    if (left + tipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tipRect.width - 10;
    }
    if (top < 10) top = rect.bottom + 10;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function renderLegend(parts, context, legendOption, showLegend) {
    const legendParts = resolveLegend(legendOption, context);
    parts.legend.innerHTML = "";

    if (showLegend === false || !legendParts) {
      parts.legend.hidden = true;
      return;
    }

    parts.legend.hidden = false;
    legendParts.forEach((item) => {
      parts.legend.appendChild(
        item.type === "color"
          ? dom.createElement("span", {
              className: "ts-heatmap__legend-swatch",
              style: { backgroundColor: item.color },
            })
          : dom.createElement("span", {
              className: "ts-heatmap__legend-text",
              text: item.text,
            })
      );
    });
  }

  function syncThemeClass(root) {
    root.classList.toggle("theme-dark", document.body.classList.contains("theme-dark"));
    root.classList.toggle("theme-light", !document.body.classList.contains("theme-dark"));
  }

  function heatmap(options = {}) {
    ensureStyles();
    loadHeatmapConfig();

    const resolved = heatmapConfig.merge(options);
    const flags = resolved.flags || {};
    const settings = resolved.settings || {};
    const layout = resolved.layout || {};
    const styles = resolved.styles || {};
    const colors = resolveThemeColors(resolved.colors || {});
    const utils = buildUtils(settings.locale || "zh-CN");

    const parts = {};
    const root = dom.createElement("section", {
      className: ["ts-heatmap", resolved.className],
      style: mergeStyles(
        {
          maxWidth: layout.maxWidth,
          "--ts-heatmap-cell-size": `${Number(layout.cellSize || 11)}px`,
          "--ts-heatmap-cell-gap": `${Number(layout.cellGap || 2)}px`,
          "--ts-heatmap-cell-radius": layout.cellRadius,
          "--ts-heatmap-week-label-width": layout.weekLabelWidth,
          "--ts-heatmap-week-label-gap": layout.weekLabelGap,
          "--ts-heatmap-month-label-height": layout.monthLabelHeight,
          "--ts-heatmap-month-offset": layout.monthOffset,
          "--ts-heatmap-grid-top-offset": layout.gridTopOffset,
          "--ts-heatmap-month-label-size": layout.monthLabelSize,
          "--ts-heatmap-week-label-size": layout.weekLabelSize,
          "--ts-heatmap-legend-gap": layout.legendGap,
          "--ts-heatmap-legend-top": layout.legendTop,
          "--ts-heatmap-legend-swatch-size": layout.legendSwatchSize,
          "--ts-heatmap-light-empty": colors.light.dayBg,
          "--ts-heatmap-dark-empty": colors.dark.dayBg,
          "--ts-heatmap-light-tooltip": colors.light.tooltip,
          "--ts-heatmap-dark-tooltip": colors.dark.tooltip,
          "--ts-heatmap-light-tooltip-bg": colors.light.tooltipBg,
          "--ts-heatmap-dark-tooltip-bg": colors.dark.tooltipBg,
        },
        styles.root
      ),
    });

    colors.light.levels.forEach(function (color, index) {
      root.style.setProperty(`--ts-heatmap-light-level-${index}`, color);
    });
    colors.dark.levels.forEach(function (color, index) {
      root.style.setProperty(`--ts-heatmap-dark-level-${index}`, color);
    });

    parts.months = dom.createElement("div", {
      className: "ts-heatmap__months",
      style: styles.months,
    });
    parts.weeks = dom.createElement("div", {
      className: "ts-heatmap__weeks",
      style: styles.weeks,
    });
    parts.grid = dom.createElement("div", {
      className: "ts-heatmap__grid",
      style: styles.grid,
    });
    parts.body = dom.createElement("div", {
      className: "ts-heatmap__body",
      children: [parts.weeks, parts.grid],
    });
    parts.legend = dom.createElement("div", {
      className: "ts-heatmap__legend",
      style: styles.legend,
      attrs: { hidden: true },
    });

    root.appendChild(parts.months);
    root.appendChild(parts.body);
    root.appendChild(parts.legend);
    root.parts = parts;

    syncThemeClass(root);

    const renderState = {
      destroyed: false,
      loadingId: 0,
      tooltipId: settings.tooltipId || defaultHeatmapConfig.settings.tooltipId,
      currentOptions: resolved,
    };

    function renderWeekLabels() {
      parts.weeks.innerHTML = "";
      parts.weeks.hidden = flags.showWeekLabels === false;

      if (flags.showWeekLabels === false) {
        return;
      }

      (settings.weekLabels || defaultHeatmapConfig.settings.weekLabels).forEach(function (label) {
        parts.weeks.appendChild(
          dom.createElement("div", {
            className: "ts-heatmap__week-label",
            text: label,
          })
        );
      });
    }

    function clearTooltip() {
      const tooltip = document.getElementById(renderState.tooltipId);
      if (tooltip) {
        tooltip.classList.remove("is-active");
      }
    }

    function renderGrid(source) {
      if (renderState.destroyed) {
        return;
      }

      syncThemeClass(root);
      renderWeekLabels();

      const width = root.clientWidth || root.parentElement?.clientWidth || 0;
      const range = buildRange({
        settings: settings,
        flags: flags,
        layout: layout,
        inputStart: resolved.startDate,
        inputEnd: resolved.endDate,
        width: width,
      });
      const dataMap = normalizeMap(source);
      const current = cloneDate(range.start);
      const monthNames = settings.monthNames || defaultHeatmapConfig.settings.monthNames;

      parts.grid.innerHTML = "";
      parts.months.innerHTML = "";
      parts.months.hidden = flags.showMonthLabels === false;

      let monthIndex = -1;
      let slotsSinceLastLabel = 10;

      while (current <= range.end) {
        if (flags.showMonthLabels !== false) {
          const monthSlot = dom.createElement("div", {
            className: "ts-heatmap__month-slot",
          });

          if (current.getMonth() !== monthIndex) {
            monthIndex = current.getMonth();
            if (slotsSinceLastLabel > 2) {
              monthSlot.appendChild(
                dom.createElement("span", {
                  className: "ts-heatmap__month-label",
                  text: monthNames[monthIndex] || "",
                })
              );
              slotsSinceLastLabel = 0;
            }
          }

          slotsSinceLastLabel += 1;
          parts.months.appendChild(monthSlot);
        }

        const weekColumn = dom.createElement("div", {
          className: "ts-heatmap__week-column",
        });

        for (let index = 0; index < 7; index += 1) {
          if (current > range.end) {
            break;
          }

          const date = cloneDate(current);
          const dateKey = toDateKey(date);
          const entry = dataMap.get(dateKey);
          const visual = resolveCellStyle({
            entry: entry,
            date: date,
            dateKey: dateKey,
            getCellStyle: resolved.getCellStyle,
            theme: colors,
            utils: utils,
          });
          const safeLevel = Math.max(0, Math.min(MAX_LEVEL, Number(visual.level || 0)));
          const cell = dom.createElement("div", {
            className: ["ts-heatmap__cell", `is-level-${safeLevel}`, visual.className],
            attrs: {
              "aria-label": dateKey,
            },
            style: mergeStyles(
              visual.color ? { backgroundColor: visual.color } : null,
              visual.borderColor ? { borderColor: visual.borderColor } : null,
              visual.style
            ),
          });

          if (visual.title !== undefined) {
            cell.setAttribute("title", String(visual.title));
          }

          if (flags.enableTooltip !== false) {
            cell.addEventListener("mouseenter", function () {
              const tooltip = ensureTooltip(renderState.tooltipId);
              tooltip.innerHTML = typeof resolved.renderTooltip === "function"
                ? resolved.renderTooltip({
                    entry: entry,
                    date: date,
                    dateKey: dateKey,
                    visual: visual,
                    settings: settings,
                    theme: colors,
                    utils: utils,
                  })
                : defaultTooltipRenderer({
                    entry: entry,
                    date: date,
                    dateKey: dateKey,
                    visual: visual,
                    settings: settings,
                    theme: colors,
                    utils: utils,
                  });

              applyTooltipTheme(root, tooltip);
              positionTooltip(tooltip, cell);
              requestAnimationFrame(function () {
                tooltip.classList.add("is-active");
              });
            });

            cell.addEventListener("mouseleave", clearTooltip);
          }

          weekColumn.appendChild(cell);
          current.setDate(current.getDate() + 1);
        }

        parts.grid.appendChild(weekColumn);
      }

      renderLegend(
        parts,
        {
          theme: colors,
          themeMode: getThemeMode(root),
          settings: settings,
          utils: utils,
          options: resolved,
          root: root,
        },
        resolved.legend !== undefined ? resolved.legend : settings.legend,
        resolved.showLegend !== undefined ? resolved.showLegend : flags.showLegend
      );
    }

    function resolveData() {
      if (typeof resolved.getData === "function") {
        const width = root.clientWidth || root.parentElement?.clientWidth || 0;
        const range = buildRange({
          settings: settings,
          flags: flags,
          layout: layout,
          inputStart: resolved.startDate,
          inputEnd: resolved.endDate,
          width: width,
        });

        return Promise.resolve(
          resolved.getData({
            start: range.start,
            end: range.end,
            settings: settings,
            flags: flags,
            layout: layout,
            theme: colors,
            utils: utils,
            input: resolved,
          })
        );
      }

      return Promise.resolve(resolved.data);
    }

    function refresh() {
      const loadingId = renderState.loadingId + 1;
      renderState.loadingId = loadingId;

      return resolveData()
        .then(function (source) {
          if (renderState.destroyed || loadingId !== renderState.loadingId) {
            return root;
          }

          renderGrid(source);
          return root;
        })
        .catch(function (error) {
          console.warn("[Tessera] Failed to render heatmap data.", error);
          if (!renderState.destroyed && loadingId === renderState.loadingId) {
            renderGrid(null);
          }
          return root;
        });
    }

    const resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(function () {
          if (root._tsHeatmapResizeTimer) {
            clearTimeout(root._tsHeatmapResizeTimer);
          }

          root._tsHeatmapResizeTimer = setTimeout(function () {
            refresh();
          }, 120);
        })
      : null;

    if (resizeObserver) {
      resizeObserver.observe(root);
    }

    const themeObserver = typeof MutationObserver === "function"
      ? new MutationObserver(function () {
          syncThemeClass(root);
          const tooltip = document.getElementById(renderState.tooltipId);
          if (tooltip) {
            applyTooltipTheme(root, tooltip);
          }
        })
      : null;

    if (themeObserver) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    root.refresh = refresh;
    root.destroy = function () {
      renderState.destroyed = true;
      clearTooltip();
      if (root._tsHeatmapResizeTimer) {
        clearTimeout(root._tsHeatmapResizeTimer);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (themeObserver) {
        themeObserver.disconnect();
      }
    };
    root.utils = utils;

    requestAnimationFrame(function () {
      refresh();
    });

    return root;
  }

  module.exports = heatmap;
  module.exports.heatmap = heatmap;
  module.exports.loadConfig = loadHeatmapConfig;
  module.exports.getDefaultConfig = heatmapConfig.get;
  module.exports.utils = {
    toDateKey: toDateKey,
    normalizeDate: normalizeDate,
    addDays: addDays,
    alignToMonday: alignToMonday,
    alignToSunday: alignToSunday,
    htmlEscape: htmlEscape,
    pickScaleColor: pickScaleColor,
    pickEnumColor: pickEnumColor,
    ratioToLevel: ratioToLevel,
  };
});
