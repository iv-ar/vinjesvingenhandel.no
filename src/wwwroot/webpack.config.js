const path = require("path");
const globImporter = require("node-sass-glob-importer");

module.exports = [
    {
        mode: "development",
        entry: ["./frontbundle.js", "./frontbundle.scss"],
        watch: (process.argv.indexOf("--watch") > -1),
        watchOptions: {
            ignored: /node_modules/,
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    exclude: /node_modules/,
                    use: "ts-loader",
                },
                {
                    test: /\.svg$/,
                    use: [{
                        loader: "html-loader",
                        options: {
                            minimize: true,
                        },
                    }],
                },
                {
                    test: /\.(css|scss)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].css",
                            },
                        },
                        {
                            loader: "extract-loader",
                        },
                        {
                            loader: "css-loader?-url",
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["autoprefixer"],
                                },
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    outputStyle: "compressed",
                                    importer: globImporter(),
                                },
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js", ".scss", ".css"],
        },
        devtool: "source-map",
        output: {
            filename: "frontbundle.min.js",
            path: path.resolve(__dirname, "dist"),
        },
    },
    {
        mode: "development",
        entry: ["./backbundle.js", "./backbundle.scss"],
        watch: (process.argv.indexOf("--watch") > -1),
        watchOptions: {
            ignored: /node_modules/,
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [{
                        loader: "ts-loader",
                        options: {
                            compilerOptions: {
                                declaration: false,
                                target: "es5",
                                module: "commonjs",
                            },
                            transpileOnly: true,
                        },
                    }],
                },
                {
                    test: /\.svg$/,
                    use: [{
                        loader: "html-loader",
                        options: {
                            minimize: true,
                        },
                    }],
                },
                {
                    test: /\.(css|scss)$/i,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].css",
                            },
                        },
                        {
                            loader: "extract-loader",
                        },
                        {
                            loader: "css-loader?-url",
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["autoprefixer"],
                                },
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    outputStyle: "compressed",
                                    importer: globImporter(),
                                },
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js", ".scss", ".css"],
            alias: {
                "parchment": path.resolve(__dirname, "node_modules/parchment/src/parchment.ts"),
                "quill$": path.resolve(__dirname, "node_modules/quill/quill.js"),
            },
        },
        devtool: "source-map",
        output: {
            filename: "backbundle.min.js",
            path: path.resolve(__dirname, "dist"),
        },
    },
];