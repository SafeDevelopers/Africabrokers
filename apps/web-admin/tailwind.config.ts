import type { Config } from "tailwindcss";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createTailwindPreset } = require("@afribrok/design-tokens/tailwind-preset");

const config: Config = {
  presets: [createTailwindPreset(process.env.NEXT_PUBLIC_TENANT_KEY ?? null)],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
