const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
var fs = require('fs');

// Look for .html files
var htmlFiles = [];
var directories = ['src'];
while (directories.length > 0) {
    var directory = directories.pop();
    var dirContents = fs.readdirSync(directory)
        .map(file => path.join(directory, file));

    htmlFiles.push(...dirContents.filter(file => file.endsWith('.html')));
    directories.push(...dirContents.filter(file => fs.statSync(file).isDirectory()));
}

module.exports = {
    resolve: {
        fallback: {
          "fs": false,
          "tls": false,
          "net": false,
          "path": false,
          "zlib": false,
          "http": false,
          "https": false,
          "stream": false,
          "crypto": false, 
        } 
    },
    mode: 'development',
    entry: {
        main: "./src/main.js",
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname,  "dist"),
        clean: true
    },
    devServer: {
        port: 8081
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                use: 'html-loader'
            },
            {
                test: /\.(png|jpg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name]-[hash][ext]'
                }
            },
            {
                test: /\.css$/,
                use: [
                  'style-loader',
                  'css-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: "file-loader"
            }
        ]
    },
    plugins: [
        // Build a new plugin instance for each .html file found
        ...htmlFiles.map(htmlFile =>
            new HtmlWebpackPlugin({
                template: htmlFile,
                filename: htmlFile.replace(path.normalize("src/"), ""),
                inject: false
            })
        )
    ]
};
