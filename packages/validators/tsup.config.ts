import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  sourcemap: true,
  bundle: true,
  external: [], // <-- Force tsup to bundle everything, including local packages
});
