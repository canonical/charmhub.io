import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import autoprefixer from "autoprefixer";
import entry from "./webpack.config.entry.js";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  plugins: [react()],
  server: {
    port: env?.VITE_PORT || 5173,
    host: true,
    cors: {
      origin: [
        "http://localhost:8045",
        "http://127.0.0.1:8045",
        "http://0.0.0.0:8045",
      ], // needed for backend integration with Flask
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin"],
      },
    },
    postcss: {
      plugins: [autoprefixer()],
      map: false,
    },
  },
  base: "./", // use the script's URL path as base when loading assets in dynamic imports
  build: {
    manifest: true,
    modulePreload: false,
    emptyOutDir: true,
    sourcemap: "hidden",
    outDir: env?.VITE_OUTDIR || "static/js/dist/vite",
    rollupOptions: {
      input: entry,
      output: {
        entryFileNames: `[name]--[hash].js`,
        chunkFileNames: `chunks/[name]--[hash].js`,
        assetFileNames: `assets/[name]--[hash][extname]`,
      },
    },
  },
});
