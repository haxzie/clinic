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

  // General TS config (applies everywhere)
  {
    files: ["**/*.{ts,tsx}"],
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

  // React desktop app (browser + node environment)
  {
    files: ["apps/desktop-app/src/**/*.{ts,tsx,js,jsx}"],
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
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-undef": ["error", { typeof: true }],
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

  // CLI app (node environment)
  {
    files: ["apps/cli/**/*.{ts,js}"],
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

  // Studio package (browser + node environment)
  {
    files: ["packages/studio/src/**/*.{ts,tsx,js,jsx}"],
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
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-undef": ["error", { typeof: true }],
    },
  },

  // Node config files (do not use TS project service)
  {
    files: [
      "**/*.{config,conf}.js",
      "**/*.{config,conf}.cjs",
      "**/*.{config,conf}.mjs",
      "**/tailwind.config.js",
      "**/tailwind.config.cjs",
      "**/tailwind.config.mjs",
      "**/postcss.config.js",
      "**/postcss.config.cjs",
      "**/postcss.config.mjs",
      "apps/**/vite.config.ts",
      "apps/**/vite.config.js",
      "apps/**/vite.config.mjs",
      "apps/**/vite.config.cjs",
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: false,
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  },
]);
