import nodeConfig from "@ziron/eslint-config/node";

export default [...nodeConfig, { ignores: ["dist/"] }];
