import baseConfig, { restrictEnvAccess } from "@ziron/eslint-config/base";
import nextjsConfig from "@ziron/eslint-config/nextjs";
import reactConfig from "@ziron/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
