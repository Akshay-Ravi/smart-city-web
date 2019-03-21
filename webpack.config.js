const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/game.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    "stats": {
        "warnings": false
    },
    watch: true,
};