import { defineConfig } from "vite";
import path from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist",
      insertTypesEntry: true,
      tsconfigPath: path.resolve(__dirname, "tsconfig.build.json"),
    }),
  ],
  optimizeDeps: {
    // Prevent dev server from auto-optimizing dependencies
    noDiscovery: true,
    exclude: [
      "react",
      "react-dom",
      "@apiclinic/core",
      "motion",
    ],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Studio",
      fileName: (format) => `studio.${format}.js`,
    },
    rollupOptions: {
      // Do not bundle dependencies; leave them for the consumer app
      external: ["react", "react-dom", "@apiclinic/core", "motion"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@apiclinic/core": "ApiClinicCore",
          motion: "Motion",
        },
      },
    },
    sourcemap: true,
    target: "es2019",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Prefer the new embedded Sass implementation to avoid legacy JS API warnings
      "sass": "sass-embedded",
    },
  },
});


