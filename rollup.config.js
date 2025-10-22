const commonJs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
/**
 * @type {import('rollup').RollupOptions}
 */
module.exports = {
  input: 'src/amadeus.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
    interop: 'compat'
  },
  plugins: [
    commonJs(),
    nodeResolve(),
    json(),
  ]
};