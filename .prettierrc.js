/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {{ tailwindConfig: string }} TailwindConfig*/

/** @type { PrettierConfig | TailwindConfig } */
const config = {
  printWidth: 80,
  trailingComma: "all",
  endOfLine: "auto",
  singleQuote: true,
  tailwindConfig: "./tailwind.config.ts",
  plugins: [
    require.resolve("@ianvs/prettier-plugin-sort-imports"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
};

module.exports = config;