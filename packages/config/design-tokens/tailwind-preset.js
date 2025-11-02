const fs = require("fs");
const path = require("path");

const defaultTokens = loadJson(path.join(__dirname, "default.json"));

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function mergeTokens(base, override = {}) {
  const output = { ...base };
  for (const key of Object.keys(override)) {
    const value = override[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object"
    ) {
      output[key] = mergeTokens(base[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function flattenColorTokens(color) {
  const flat = {};
  for (const key of Object.keys(color)) {
    const value = color[key];
    if (value && typeof value === "object" && !value.hex && !Array.isArray(value)) {
      const nested = flattenColorTokens(value);
      for (const nestedKey of Object.keys(nested)) {
        flat[`${key}-${nestedKey}`] = nested[nestedKey];
      }
    } else {
      flat[key] = value;
    }
  }
  return flat;
}

function cssVariablesFromTokens(tokens) {
  const vars = {};
  const colorTokens = flattenColorTokens(tokens.color || {});
  for (const name of Object.keys(colorTokens)) {
    vars[`--color-${name}`] = colorTokens[name];
  }
  const radiusTokens = tokens.radii || {};
  for (const name of Object.keys(radiusTokens)) {
    vars[`--radius-${name}`] = radiusTokens[name];
  }
  const shadowTokens = tokens.shadows || {};
  for (const name of Object.keys(shadowTokens)) {
    vars[`--shadow-${name}`] = shadowTokens[name];
  }
  return vars;
}

function createTailwindPreset(tenantKey = null) {
  const tenantTokens = tenantKey
    ? loadJson(path.join(__dirname, "tenants", `${tenantKey}.json`))
    : {};
  const merged = mergeTokens(defaultTokens, tenantTokens);
  const cssVariables = cssVariablesFromTokens(merged);

  return {
    darkMode: ["class"],
    theme: {
      extend: {
        fontFamily: {
          sans: merged.typography?.fontFamily
            ? merged.typography.fontFamily.split(",").map((item) => item.trim().replace(/^'+|'+$/g, ""))
            : ["Inter", "system-ui", "sans-serif"],
        },
        colors: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)",
          success: "var(--color-success)",
          danger: "var(--color-danger)",
          warning: "var(--color-warning)",
          info: "var(--color-info)",
          background: "var(--color-neutral-background, #F8FAFC)",
          surface: "var(--color-neutral-surface, #FFFFFF)",
          border: "var(--color-neutral-border, #CBD5F5)",
          title: "var(--color-neutral-title, #0F172A)",
          body: "var(--color-neutral-body, #1E293B)",
        },
        borderRadius: {
          none: "var(--radius-none, 0px)",
          sm: "var(--radius-sm, 4px)",
          md: "var(--radius-md, 8px)",
          lg: "var(--radius-lg, 12px)",
          xl: "var(--radius-xl, 16px)",
          pill: "var(--radius-pill, 9999px)",
        },
        boxShadow: {
          card: "var(--shadow-card, 0px 10px 30px rgba(24, 76, 140, 0.08))",
          popover: "var(--shadow-popover, 0px 20px 40px rgba(15, 23, 42, 0.12))",
        },
      },
    },
    plugins: [
      function addDesignTokenVariables({ addBase }) {
        addBase({
          ":root": cssVariables,
        });
      },
    ],
  };
}

module.exports = {
  createTailwindPreset,
  mergeTokens,
  cssVariablesFromTokens,
  loadJson,
};
