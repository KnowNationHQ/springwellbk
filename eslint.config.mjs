import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Align lint with how this codebase is built:
  // - Convex docs are intentionally accessed as `any` for speed and flexibility.
  // - Local SVG illustrations are loaded via <img> on purpose (no external optimizer needed).
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      // Reading the auth token from localStorage inside a mount effect is
      // intentional bootstrap, not a render bug.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
