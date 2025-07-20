// rollup.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
// import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { cleandir } from 'rollup-plugin-cleandir';
// import obfuscator from 'rollup-plugin-obfuscator';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import swc from '@rollup/plugin-swc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

const excludedDirsInProd = [
  'src/scripts/',
  'src/specs/',
  'src/proto/',
  'routes/',
  'config/'
];

function filterProdFiles(id) {
  if (!isProduction) {
    return !excludedDirsInProd.some(dir => id.includes(dir));
  }
  return true;
}

export default {
  input: {
    main: './src/index.ts'
  },
  output: [
    {
      dir: 'dist/esm',
      format: 'es',
      entryFileNames: '[name].mjs',
      // sourcemap: !isProduction,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      // sourcemap: !isProduction,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named'
    }
  ],
  plugins: [
    // cleandir('dist'),
    {
      name: 'filter-prod-files',
      resolveId(source, importer) {
        if (importer && !filterProdFiles(source)) {
          return false;
        }
      }
    },
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    }),
    resolve({
      preferBuiltins: true,
      extensions: ['.mjs', '.js', '.json', '.node', '.ts']
    }),
    commonjs({
      esmExternals: true,
      requireReturnsDefault: 'auto',
    }),
    json(),
    swc({
      // Explicitly point to the tsconfig.json file
      tsconfig: './tsconfig.json',
    }),
  ].filter(Boolean),
  external: [
    /node_modules/
  ]
};
