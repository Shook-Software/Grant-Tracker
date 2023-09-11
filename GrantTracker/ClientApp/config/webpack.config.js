const Dotenv = require('dotenv-webpack');
const path = require('path');
const paths = require('./paths.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	//https://webpack.js.org/configuration/devtool/
	devtool: 'eval-source-map', //Allows us to track down errors and warnings to their original location. There are many options for this, that is to say, this should change between prod and dev
	//kill source-map in production
	entry: {
		index: {
			import: path.join(paths.src, 'index.tsx')
		}
		//shared: 'lodash'
	},

	output: {
		filename:
			'[name].[contenthash].js', //[name] refers to the entry point keys, contenthash ensures that cached assets are updated if the assets change
		path: paths.dist,
		clean: true, //keeps old files from littering the /dist folder
		publicPath: '/' //from webpack-dev-middleware, ensures files are server correctly on localhost
	},

	optimization: {
		moduleIds: 'deterministic', //to prevent bundle changes when only a module.id changes off another bundle.
		runtimeChunk: 'single', //if we have multiple entries, we want shared modules to be instantiated ONLY once.

		splitChunks: {
			//we want to extract third-party libraries as they are less likely to change than our source.
			cacheGroups: {
				chunks: 'async',
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					/*name(module) {
						const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
						return `npm.${packageName.replace('@', '')}`
					},*/
					reuseExistingChunk: true
					//chunks: 'all',
					//enforce: true,
				}
			}
		}
	},

	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			filename: path.join(paths.dist, 'index.html'),
			template: path.join(paths.public, 'index.html'),
			title: 'Grant Tracker'
		}),
		new Dotenv()
	],

	resolve: {
		modules: [
			paths.modules,
			paths.src
		],
		extensions: [
			'.tsx',
			'.ts',
			'.js',
			'.jsx',
			'.json'
		]
	},

	module: {
		//Use the DllPlugin to move code that is changed less often into a separate compilation.
		//This will improve the application's compilation speed, although it does increase complexity
		//of the build process.
		rules: [
			//set the rules for css file imports within JS modules
			//these loaders can be chained to apply transformations, it is executed in reverse order.
			//you can and in most cases, should minimize css in production for better load times.
			//Each additional loader/plugin has a bootup time. Try to use as few tools as possible.
			/*{
				test: /\.js$/,
				include: paths.src,
				use: 'babel-loader'
			},*/
			{
				test: /\.(((j|t)s)|((j|t)sx))$/,
				include: paths.src,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: true, //turns off type checking in transpilation process
						configFile: path.join(paths.root, 'tsconfig.json')
					}
				}
			},
			{
				test: /\.css$/i,
				use: [
					'style-loader',
					'css-loader'
				] //reverse, the order of these matters
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.svg$/i,
				type: 'asset',
				use: 'svg-inline-loader'
			},
			{
				test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2)$/i,
				type: 'asset/resource' //the Asset Modules is built in for this purpose
			}
			//font loader is also possible, csv loaders, xml loaders, et all
		]
	},

	devServer: {
		port: 44395,
		static: paths.dist, //where to look for files to serve
		hot: true,
		historyApiFallback: true,
		https: false
	}
};

console.log(process.env.PORT);