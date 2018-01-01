const c = require("./rollup.config");
const merge = require("lodash/merge");
const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

const babelConf = {
    "presets": [
        "es2015-rollup"
    ]
};

if(c.conf.output.format === "umd") {
    module.exports = merge(c.conf, {
        plugins: [
            commonjs({
                include:  ["./node_modules/**" ], // Default: undefined
                ignoreGlobal: false, // Default: false
                sourceMap: false // Default: true
            }),
            resolve({
                jsnext: true,
                main: true
            }),
            babel(merge(babelConf, {plugins: ["external-helpers"]}))
        ]
    });
} else {
    module.exports = merge(c.conf, {
        plugins: [
            babel(merge(babelConf, {runtimeHelpers: true, plugins: ["transform-runtime"]}))
        ]
    });
}
