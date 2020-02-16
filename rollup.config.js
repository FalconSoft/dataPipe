import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const input = 'src/index.ts';

export default [{
  input,
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
  input,
  output: { file: pkg.module, format: 'esm', sourcemap: true, compact: true },
  treeshake: true,
  plugins: [
    typescript({
      clean: true
    })
  ]
}];
