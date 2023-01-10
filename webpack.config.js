const path = require('path');
const NODE_ENV = process.NODE_ENV;

module.exports = {
    mode: 'none',
    entry: path.resolve(__dirname, 'src_js/chat/index.js'),
    output: {
        libraryTarget: 'commonjs',
        filename: 'index.js',
        path: path.resolve(__dirname, 'build/chat')
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src_js'),
            path.resolve(__dirname, 'src_scss'),
            path.resolve(__dirname, './node_modules'),
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    },
    devtool: 'eval-source-map',
    stats: 'errors-only'
};