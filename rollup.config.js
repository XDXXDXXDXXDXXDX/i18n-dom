import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./dist/i18n-dom.min.js",
      format: "iife",
      name: "I18nDOM",
    },
    {
      file: "./dist/i18n-dom.esm.js",
      format: "esm",
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    terser(),
  ],
};
