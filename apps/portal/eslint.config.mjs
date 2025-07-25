import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

import baseConfig, { restrictEnvAccess } from "@ziron/eslint-config/base";
import nextjsConfig from "@ziron/eslint-config/nextjs";
import reactConfig from "@ziron/eslint-config/react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];

export default eslintConfig;
