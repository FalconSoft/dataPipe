import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const input = 'src/index.ts';

export default [{
  input: 'src/commonjs.ts',
  output: [
    { file: 'dist/data-pipe.min.js', name: 'dp', format: 'umd', sourcemap: true, compact: true },
  ],
  treeshake: true,
  plugins: [
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
}, ...['array', 'string', 'utils'].map(subFolder => ({
  input: `src/${subFolder}/index.ts`,
  output: { file: `dist/esm/${subFolder}/index.mjs`, format: 'esm', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ],
})),
...['array', 'string', 'utils'].map(subFolder => ({
  input: `src/${subFolder}/index.ts`,
  output: { file: `dist/cjs/${subFolder}/index.js`, format: 'cjs', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ]
}))];
