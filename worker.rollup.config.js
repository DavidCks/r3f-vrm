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
  input: "src/utils/motion-expression-worker.ts", // Ensure this is the correct entry point
  output: [
    {
      file: "build/motion-expression-worker.bundle.js", // Single bundled output file
      format: "iife", // Outputs plain JavaScript
      name: "MotionExpressionWorker", // Global variable name for the IIFE (optional)
      sourcemap: true, // Optional, for debugging
    },
    // {
    //   file: "build/motion-expression-worker.cjs.js",
    //   format: "cjs",
    //   sourcemap: true,
    // },
    // {
    //   file: "build/motion-expression-worker.esm.js",
    //   format: "esm",
    //   sourcemap: true,
    // },
  ],
  plugins: [
    resolve({
      extensions: [".js", ".ts"], // Handle .tsx files
    }),
    commonjs(),
    // typescript({
    //   tsconfig: "./tsconfig.build.json",
    //   exclude: ["**/__tests__/**"],
    //   extensions: [".js", ".ts"],
    // }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      extensions: [".js", ".ts"], // Babel should handle these too
      presets: [
        "@babel/preset-env",
        "@babel/preset-typescript", // Add this preset
      ],
    }),
    // terser(),
  ],
  external: [], // Mark peer dependencies as external
};
