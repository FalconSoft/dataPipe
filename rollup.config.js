import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import del from 'rollup-plugin-delete'

const pkg = require('./package.json');
const input = 'src/index.ts';
const subModules = ['array', 'string', 'utils'];

export default [{
  input: 'src/commonjs.ts',
  output: [
    { file: 'dist/data-pipe.min.js', name: 'dp', format: 'umd', sourcemap: true, compact: true },
  ],
  treeshake: true,
  plugins: [
    del({
      targets: ['./dist', ...subModules.map(m => `./${m}`)],
      hook: 'buildStart',
      runOnce: true
    }),
    typescript({
      clean: true
    }),
    uglify()
  ]
}, {
  input: 'src/commonjs.ts',
  output: { file: pkg.main, format: 'cjs', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ]
}, {
  input: input,
  output: { file: pkg.module, format: 'esm', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ]
}, ...subModules.map(subFolder => ({
  input: `src/${subFolder}/index.ts`,
  output: { file: `${subFolder}/index.mjs`, format: 'esm', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ],
})), ...subModules.map(subFolder => ({
  input: `src/${subFolder}/index.ts`,
  output: { file: `${subFolder}/index.js`, format: 'cjs', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ]
}))];
