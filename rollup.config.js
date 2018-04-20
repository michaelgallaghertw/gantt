import sass from 'rollup-plugin-sass';
import uglify from 'rollup-plugin-uglify';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import merge from 'deepmerge';

const dev = {
    input: 'src/index.js',
    output: {
        name: 'Gantt',
        file: 'dist/frappe-gantt.js',
        format: 'umd'
    },
    plugins: [
        vue({
            css: 'dist/frappe-gantt.css'
        }),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        }),
        resolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
};
const prod = merge(dev, {
    output: {
        file: 'dist/frappe-gantt.min.js'
    },
    plugins: [uglify()]
});

export default [dev, prod];
