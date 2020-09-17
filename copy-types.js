const fs = require('fs');

['array', 'string', 'utils'].forEach(subFolder => {
  fs.writeFileSync(`./${subFolder}/index.d.ts`, `export * from './${subFolder}';
  export * from './types';`);
  fs.copyFileSync('./src/types.ts', `./${subFolder}/types.ts`)
});
