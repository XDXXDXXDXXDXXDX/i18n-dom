import { terser } from "rollup-plugin-terser";

export default {
  input: "./index.js",
  output: [
    {
      file: "./dist/i18n-dom.min.js",
      format: "iife",
      plugins: [terser()],
      name: "I18nDOM",
    },
  ],
};
