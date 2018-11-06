'use strict';

const path = require('path');
const webpack = require('webpack');

let config = {
    entry: './src/ts/index.ts',
    output: {
        path: path.resolve(__dirname, 'src/dist/js'),
        filename: 'feedback_client_module.js',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        library: 'Feedback_Client_Module'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
    //,
    // // uglify your scriptz
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin({ minimize: true })
    // ]
};

module.exports = config;