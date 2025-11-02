# Design Tokens — AfriBrok

This package centralises the brand foundations for AfriBrok.com and its tenants. Tokens are defined in JSON (`default.json` plus tenant overrides under `./tenants`) and can be consumed across our React (web/mobile) surfaces as well as documentation tooling.

## Files

- `default.json` — canonical palette, typography, spacing, radii, and shadows for AfriBrok.
- `tenants/ethiopia-addis.json` — override profile for the Addis Ababa pilot tenant (logo, hero copy, neutral surfaces, component accents).
- `tailwind-preset.js` — helper that exposes the tokens as a Tailwind preset with CSS variables and shadcn-friendly theme values.

## Usage in Tailwind

```js
// tailwind.config.js in apps/web-admin or apps/web-marketplace
const { createTailwindPreset } = require("@afribrok/design-tokens/tailwind-preset");

module.exports = {
  presets: [createTailwindPreset(process.env.TENANT_KEY ?? null)],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
};
```

At runtime, load the tenant config (via domain or `x-tenant-id`) and set the appropriate CSS variables on the document root. The preset already injects defaults for `:root`; you can override per tenant by applying the merged token map:

```ts
// apps/web-admin/app/tenant-theme-provider.tsx
import { useEffect } from "react";
import tokens from "@afribrok/design-tokens/tenants/ethiopia-addis.json";

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Object.entries(tokens.color.neutral ?? {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-neutral-${key}`, value as string);
    });
  }, []);

  return <>{children}</>;
}
```

> Keep tenant bootstrapping deterministic: fetch token JSON at build time for static tenants, or serve a `/api/tenant-theme` endpoint that merges overrides using the helper functions exported from `tailwind-preset.js`.

## Adding New Tenants

1. Copy `tenants/ethiopia-addis.json` to a new file named after the tenant key (e.g. `kenya-nairobi.json`).
2. Fill in brand metadata (`displayName`, `logo`, `heroTagline`) and any color/component overrides.
3. Update the tenant seed data (`packages/config/env` once added) so the backend uses the same key.
4. Re-run the UI build to ensure Tailwind picks up any additional tokens.

Avoid adding unused tokens; extend the schema only when a new visual primitive is required across multiple surfaces.
