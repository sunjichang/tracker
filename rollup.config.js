import ts from 'rollup-plugin-typescript2'
import path from 'path'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: "./src/core/index.ts",
    output: [
      {
        file: path.resolve(__dirname, './dist/index.esm.js'),
        format: "es"
      },
      {
        file: path.resolve(__dirname, './dist/index.cjs.js'),
        format: "cjs"
      },
      {
        file: path.resolve(__dirname, './dist/index.js'),
        format: "umd",
        name: "tracker"
      }
    ],
    plugins: [ts(), terser()]
  },
  {
    input: "./src/core/index.ts",
    output: {
      file: path.resolve(__dirname, './dist/index.d.ts'),
      format: "es"
    },
    plugins: [dts()]
  }
]
