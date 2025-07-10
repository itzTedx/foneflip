import { restrictEnvAccess } from "@ziron/eslint-config/base";
import nextjsConfig from "@ziron/eslint-config/nextjs";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  // ...baseConfig,
  // ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
