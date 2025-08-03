import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts", "src/schema.ts", "src/indexdb/index.ts"],
  format: ["esm"],
  clean: true,
  sourcemap: true,
  bundle: true,
  dts: true,
  external: [], // <-- Force tsup to bundle everything, including local packages
});
