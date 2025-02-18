const path = require('path')
const {VueLoaderPlugin} = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const PostcssRtl = require('postcss-rtl')

module.exports = {
    entry: {
        admin: './admin/src/js/main.js',
        client: [
            './src/js/postCreation.js',
            './src/js/postManager.js',
            './src/js/editSubmissionForm.js',
            './src/js/userPosts.js',
            './src/js/login.js'
        ]
    },
    output: {
        filename: '[name]/bundle.js',
        path: path.resolve(__dirname, 'assets')
    },
    module: {
        rules: [
            {
                test: /\.(woff2?)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
                }
            },
            {
                test: /\.(eot|ttf|woff)$/,
                exclude: [path.resolve(__dirname, 'node_modules/@mdi/font')],
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                 plugins: [replaceFontface()]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [replaceFontface()]
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name]/style.min.css'
        })
    ],
    optimization: {
        minimizer: [`...`, new CssMinimizerPlugin()],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },
    resolve: {
        extensions: ['.js', '.vue']
    },
    mode: 'development'
}

/**
 * This function is used to change the font-face in Vuetify css,
 * avoiding the loading of .ttf, .eot, and .woff files,
 * and instead only loading .woff2 to optimize font size.
 */
function replaceFontface() {
    return {
        postcssPlugin: 'postcss-replace-fontface',
        Once(root, {result}) {
            root.walkAtRules('font-face', (fontFace) => {
                fontFace.nodes = fontFace.nodes.filter((node) => node.prop !== 'src')

                fontFace.append({
                    prop: 'src',
                    value:
                        'url(../fonts/materialdesignicons-webfont.woff2) format("woff2")'
                })
            })
        }
    }
}

replaceFontface.postcss = true

// Function to determine if RTL CSS should be applied
function isRTLCss() {
    const cssFiles = ['admin.css', 'main.css']
    return cssFiles.some((fileName) => {
        return /admin\.css|main\.css/.test(fileName)
    })
}