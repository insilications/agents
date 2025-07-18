// rollup.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
// import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { cleandir } from 'rollup-plugin-cleandir';
// import obfuscator from 'rollup-plugin-obfuscator';
// import typescript from '@rollup/plugin-typescript';
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

      // // You can still override any options from tsconfig.json here
      // // For example, to ensure a specific module format for Rollup's tree-shaking
      // jsc: {
      //   parser: {
      //     syntax: 'typescript',
      //   },
      //   // Override the 'target' from tsconfig.json if needed
      //   // target: 'es2020',
      // },
      // module: {
      //   // SWC's module options are separate and important for Rollup
      //   type: 'es6',
      // }
    }),
    // typescript({
    //   tsconfig: './tsconfig.json',
    //   /* enable source maps for testing with other production options */
    //   // sourceMap: !isProduction,
    //   // inlineSources: !isProduction,
    //   sourceMap: true,
    //   inlineSources: true,
    //   // outDir: null,
    //   // declaration: false,
    //   exclude: [
    //     'src/proto/**/*',
    //     '**/*.test.ts',
    //     '**/*.spec.ts',
    //     'node_modules/**'
    //   ]
    // }),
    /* Disable terser/obfuscator for now */
    // isProduction && terser(),
    // isProduction && obfuscator({
    //   exclude: [
    //     'node_modules/**',
    //     '**/*.spec.ts',
    //     'tsconfig-paths-bootstrap.mjs',
    //     'src/proto/**',
    //     'src/scripts/**',
    //     'dist/**',
    //     'config/**',
    //     'routes/**'
    //   ]
    // })
  ].filter(Boolean),
  external: [
    /node_modules/
  ]
};
