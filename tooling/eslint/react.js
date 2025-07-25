import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
 
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      "react-hooks/react-compiler": "error",
     ...reactHooks.configs['recommended-latest'].rules,
    },
    languageOptions: {
      globals: {
        React: "writable",
      },
    },
  },
];

