import buble from 'rollup-plugin-buble';

export default {
    input: 'index.js',
    output: {
        file: 'index-es5.js',
        format: 'cjs',
    },
    plugins: [buble()],
}
