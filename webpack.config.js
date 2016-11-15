// Imports
const path = require('path')
const webpack = require('webpack')

// Plugin config
const plugins = [

    new webpack.DefinePlugin({
        'process.env': {

            // The `NODE_ENV` flag indicates which environment web pack is compiling
            // in/for (defaults to the local environment).
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev')

        }
    }),

    new webpack.optimize.DedupePlugin()
];

// Environment specific config
switch (process.env.NODE_ENV) {

    case 'dist':
        var uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                drop_console: true,
                warnings: false
            },
            mangle: {
                except: ['webpackJsonp'],
                screw_ie8 : true,
                keep_fnames: true
            }
        })

        plugins.push(uglifyPlugin);
        break;

    default:
        break;

}

// Project config
module.exports = {
    plugins: plugins,

    entry: {
        'index': [
            path.resolve(__dirname, 'src/styles', 'typeahead.scss'),
            path.resolve(__dirname, 'src/scripts', 'typeahead.coffee')
        ]
    },

    output: {
        library: 'ManhattanTypeahead',
        libraryTarget: 'umd',
        path: path.join(__dirname, 'dist'),
        filename: 'index.js'
    },

    module: {
        preLoaders: [
            // CoffeeScript (lint)
            {
                test: /\.coffee$/,
                exclude: /node_modules/,
                loader: 'coffeelint-loader'
            },

            // SASS (lint)
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: 'sasslint'
            }
        ],

        loaders: [
            // CoffeeScript (to JavaScript)
            {
                test: /\.coffee$/,
                loaders: ['coffee', 'coffee-import']
            },

            // SASS (to CSS)
            {
                test: /\.scss$/,
                loaders: [
                    'file?name=typeahead.css',
                    'extract',
                    'css',
                    'sass'
                    ]
            }
        ]
    },

    stats: {
        // Prevent duplicate output of SASS lint reports
        children: false
    },

    // Loader config
    sasslint: {
        configFile: '.sass-lint.yml'
    },

    // Dev server
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        inline: true,
        port: 5999
    }
};