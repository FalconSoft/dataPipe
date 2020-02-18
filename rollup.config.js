import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const input = 'src/index.ts';

export default [{
  input: 'src/commonjs.ts',
  output: [
    { file: pkg.main, name: 'dp', format: 'umd', sourcemap: true, compact: true },
  ],
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    }),
    uglify()
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
    output: { file: `${subFolder}/index.js`, format: 'esm', sourcemap: true, compact: true },
    treeshake: true,
    plugins: [
      typescript({
        clean: true
      })
    ]
  }))];
