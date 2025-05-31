import { defineConfig } from "tsdown";

export default defineConfig(
  {
    entry: [
      "./src/index.ts",
      "./src/languages.ts",
    ],
    exports: true,
    publint: true,
    format: ["cjs", "esm"],
    clean: true,
    dts: true,
    treeshake: true,
  },
);
