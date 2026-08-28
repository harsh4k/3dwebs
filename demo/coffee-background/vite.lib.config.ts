import { defineConfig } from "vite";

/**
 * Library build — `npm run build:lib`.
 *
 * Produces a self-contained bundle with three.js inlined, so a page can drop it in with a plain
 * `<script>` tag and no build step of its own:
 *
 *   dist-lib/coffee-background.js      ES module — `import { mountCoffeeBackground } from "..."`
 *   dist-lib/coffee-background.iife.js global `CoffeeBackground.mountCoffeeBackground(el)`
 *
 * three.js is bundled rather than externalised on purpose: the whole point of this package is a
 * background you can attach to a site that knows nothing about three.js. Tree-shaking trims it to
 * roughly what the scene actually touches.
 */
export default defineConfig({
  build: {
    target: "es2020",
    outDir: "dist-lib",
    emptyOutDir: true,
    lib: {
      entry: "src/index.ts",
      name: "CoffeeBackground",
      formats: ["es", "iife"],
      fileName: (format) =>
        format === "es" ? "coffee-background.js" : "coffee-background.iife.js",
    },
  },
});
