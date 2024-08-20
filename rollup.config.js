import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: "index.ts", // Ensure this is the correct entry point
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"], // Handle .tsx files
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.build.json",
      exclude: ["**/__tests__/**"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".ts", ".tsx"], // Babel should handle these too
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript", // Add this preset
      ],
    }),
    terser(),
  ],
  external: ["react", "react-dom"], // Mark peer dependencies as external
};
