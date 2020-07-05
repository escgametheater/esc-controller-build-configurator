/**
 * This provides a consistent webpack configuration for ESC controllers.
 */

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const babelOptions = {
	presets: ["@babel/preset-env", "@babel/preset-react"],
	plugins: [
		"@babel/plugin-syntax-dynamic-import",
		"@babel/plugin-proposal-export-default-from",
		"@babel/plugin-proposal-class-properties"
	],
	// This is a feature of `babel-loader` for webpack (not Babel itself).
	// It enables caching results in ./node_modules/.cache/babel-loader/
	// directory for faster rebuilds.
	cacheDirectory: true
};

module.exports = (root, escSdkVersion) => (env, argv) => ({
	entry: path.resolve(root, "./src/index.js"),
	module: {
		rules: [
			{
				// "oneOf" will traverse all following loaders until one will
				// match the requirements. When no loader matches it will fall
				// back to the "file" loader at the end of the loader list.
				oneOf: [
					// "url" loader works like "file" loader except that it embeds assets
					// smaller than specified limit in bytes as data URLs to avoid requests.
					// A missing `test` is equivalent to a match.
					{
						test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
						loader: require.resolve("url-loader"),
						options: {
							limit: 10000,
							name: "static/media/[name].[hash:8].[ext]"
						}
					},
					{
						test: /\.scss$/,
						use: [
							"style-loader", // creates style nodes from JS strings
							"css-loader", // translates CSS into CommonJS
							"sass-loader" // compiles Sass to CSS, using Node Sass by default
						]
					},
					{
						test: /\.svg$/,
						use: ["@svgr/webpack"]
					},
					// Process JS with Babel.
					{
						test: /\.(js|jsx|mjs)$/,
						include: path.resolve(root, "./src"),
						loader: require.resolve("babel-loader"),
						options: babelOptions
					},
					// "postcss" loader applies autoprefixer to our CSS.
					// "css" loader resolves paths in CSS and adds assets as dependencies.
					// "style" loader turns CSS into JS modules that inject <style> tags.
					// In production, we use a plugin to extract that CSS to a file, but
					// in development "style" loader enables hot editing of CSS.
					{
						test: /\.css$/,
						use: [
							argv.mode === "production" ? MiniCssExtractPlugin.loader : "style-loader",
							{
								loader: require.resolve("css-loader"),
								options: {
									importLoaders: 1
								}
							},
							{
								loader: require.resolve("postcss-loader"),
								options: {
									// Necessary for external CSS imports to work
									// https://github.com/facebookincubator/create-react-app/issues/2677
									ident: "postcss",
									plugins: () => [
										require("postcss-flexbugs-fixes"),
										autoprefixer({
											browsers: [
												">1%",
												"last 4 versions",
												"Firefox ESR",
												"not ie < 9" // React doesn"t support IE8 anyway
											],
											flexbox: "no-2009"
										})
									]
								}
							}
						]
					}
				]
			}
		]
	},
	resolve: {
		extensions: ["*", ".js", ".jsx"]
	},
	output: {
		path: path.resolve(root, "./dist"),
		publicPath: argv.mode === "production" ? "./" : "/",
		filename: "bundle.js",
		chunkFilename: "[name].bundle.js"
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(root + "/./src/index.html")
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css"
		})
	],
	devServer: {
		contentBase: path.join(root, "./dist"),
		hot: true
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				styles: {
					name: "main",
					test: /\.css$/,
					chunks: "all",
					enforce: true,
					priority: 50
				},
				// Split ESC images into their own bundle
				escImages: {
					test: /[\\/]node_modules[\\/]\@esc_games\/esc\-controller\-sdk\/(.*)?\.(png|svg)/,
					name: () => `2-esc-controller-sdk-${escSdkVersion}-images`,
					chunks: "all",
					priority: 2
				},
				// Split the remaining ESC code into its own bundle, with version
				esc: {
					test: /[\\/]node_modules[\\/]\@esc_games\/esc\-controller\-sdk/,
					name: () => `2-esc-controller-sdk-${escSdkVersion}`,
					chunks: "all",
					priority: 2
				},
				// Split the remaining vendors into a vendor bundle
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "1-vendors",
					chunks: "all",
					priority: 1
				}
			}
		}
	}
});
