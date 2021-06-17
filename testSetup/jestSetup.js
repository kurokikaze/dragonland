const babelOptions = { presets: ['@babel/env'] };

module.exports = require('babel-jest').createTransformer(babelOptions);