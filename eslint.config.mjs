import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },

  // General JS/TS config (applies everywhere)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // React web app (browser environment)
  {
    files: ["apps/web-app/src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Disable React in JSX scope rule for Next.js
      "no-undef": ["error", { typeof: true }], // Disable no-undef for JSX/TSX files
    },
  },

  // Node servers (node environment)
  {
    files: ["apps/server/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Libraries in `packages` folder (node environment)
  {
    files: ["packages/**/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node, // Node environment for libraries
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
]);
