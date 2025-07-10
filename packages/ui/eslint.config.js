import tsParser from "@typescript-eslint/parser";

import reactConfig from "@ziron/eslint-config/nextjs";

/** @type {import('typescript-eslint').Config} */
export default [
  ...reactConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      // Allow type-only imports
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
];
