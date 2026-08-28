import { defineConfig } from "vite";

/**
 * Plain Vite — no framework. `public/` is served at the site root, so the demo's
 * `assetBaseUrl` default of `/assets` resolves to `public/assets/`.
 */
export default defineConfig({
  server: { port: 5180, open: true },
  build: { target: "es2020", outDir: "dist" },
});
