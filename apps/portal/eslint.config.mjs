import baseConfig, { restrictEnvAccess } from "@ziron/eslint-config/base";
import nextjsConfig from "@ziron/eslint-config/nextjs";
import reactConfig from "@ziron/eslint-config/react";

const eslintConfig = [
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];

export default eslintConfig;
