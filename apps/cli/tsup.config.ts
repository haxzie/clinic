import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: false,
  outDir: 'dist',
  tsconfig: './tsconfig.json',
  banner: {
    js: '#!/usr/bin/env node',
  },
});