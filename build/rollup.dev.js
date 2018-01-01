const rollupConfBase = require("./rollup.base");
const merge = require("lodash/merge");
module.exports = merge(rollupConfBase, {plugins: []});