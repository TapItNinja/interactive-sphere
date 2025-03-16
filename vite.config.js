import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: true,
    sourcemap: false
  }
});
