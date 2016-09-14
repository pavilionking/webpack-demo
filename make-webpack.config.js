'use strict';

// @see http://christianalfoni.github.io/javascript/2014/12/13/did-you-know-webpack-and-react-is-awesome.html
// @see https://github.com/webpack/react-starter/blob/master/make-webpack-config.js

var path = require('path');
var fs = require('fs');

var webpack = require('webpack');
var _ = require('lodash');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var srcDir = path.resolve(process.cwd(), './src');
var assets = 'build/';
var sourceMap = require('./aliasMap.json');

function makeConf(options) {
    options = options || {};
    var debug = options.debug !== undefined ? options.debug : true;
    var entries = genEntries(); 
    var chunks = Object.keys(entries);
    if (debug) {
        entries.common = [
            'webpack-dev-server/client?http://127.0.0.1:3000', // WebpackDevServer host and port
            'webpack/hot/only-dev-server',
        ];
    }

    var config = {
        entry: entries,

        output: {
            // 在debug模式下，__build目录是虚拟的，webpack的dev server存储在内存里
            path: path.resolve(debug ? '__build/' : assets),
            filename: 'js/[name].[hash:8].js',
            //chunkFilename: 'js/[chunk_hash:8].chunk.min.js',
            //hotUpdateChunkFilename: 'js/[id].[chunk_hash:8].min.js',
            publicPath: '/'
        },
        externals:{
            'jQuery':'window.jQuery',
            '$':'jQuery',
        },

        resolve: {
            root: [srcDir, path.resolve(process.cwd(),'./node_modules')],
            alias: sourceMap,
            extensions: ['', '.js', '.webpack.js', '.css', '.less', '.scss', '.tpl', '.png', '.jpg', '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', 'jsx', '.json']
        },
        resolveLoader: {
            root: path.join(__dirname, 'node_modules')
        },
        module: {
            noParse: ['zepto'],
            loaders: [
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    //注意后面的name=xx，这里很重要否则打包后会出现找不到资源的
                    loader: 'url-loader?limit=8192&minetype=image/jpg&name=./images/[name]_[hash].[ext]'
                },
                {
                    test: /\.(woff[2]?|eot|ttf)$/i,
                    loader: 'url?limit=10000&name=fonts/[name].[ext]'
                },
                {test: /\.(tpl|ejs)$/, loader: 'ejs'},
                {
                    test: /\.js[x]?$/, 
                    exclude: /node_modules/, 
                    loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=react,presets[]=stage-0']
                },
                {
                    test: /\.ts[x]$/,
                    loader: 'typescript-loader?typescriptCompiler=jsx-typescript'
                  }
            ]
        },

        plugins: [
            new CommonsChunkPlugin({
                name: 'common',
                chunks: chunks,
                // Modules must be shared between all entries
                minChunks: chunks.length // 提取所有chunks共同依赖的模块
            }),
            new webpack.HotModuleReplacementPlugin()
        ],

        devtool: debug ? 'eval-source-map' : false,

    };
    if(debug) {
        // 开发阶段，css直接内嵌
        var cssLoader = {
            test: /\.css$/,
            loader:"style-loader!css-loader"
        };
        var sassLoader = {
            test: /\.scss$/,
            loader: 'style!css!sass'
        };
        var lessLoader = {
            test: /\.less/,
            loader: 'style!css!less'
        };
        config.module.loaders.push(cssLoader);
        config.module.loaders.push(sassLoader);
        config.module.loaders.push(lessLoader);
    } else {

        // 编译阶段，css分离出来单独引入
        var cssLoader = {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style', 'css?minimize') // enable minimize
        };
        /****
        注意啊，这里一定要用！写第二个参数ExtractTextPlugin.extract('style', 'css!less')，网上很多教程都是错误的
        ****/
        var lessLoader = {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style', 'css!less')
        };
        var sassLoader = {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style', 'css!sass')
        };

        config.module.loaders.push(cssLoader);
        config.module.loaders.push(lessLoader);
        config.module.loaders.push(sassLoader);
        config.plugins.push(
            new ExtractTextPlugin('css/[name].[hash:8].css', {
                // 当allChunks指定为false时，css loader必须指定怎么处理
                // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
                // 第一个参数`notExtractLoader`，一般是使用style-loader
                // @see https://github.com/webpack/extract-text-webpack-plugin
                allChunks: false
            })
        );

        config.plugins.push(new UglifyJsPlugin({output: {comments: false}, compress: {warnings: false }}));
        config.plugins.push(new webpack.DefinePlugin({'process.env':{'NODE_ENV': JSON.stringify('production')}}));
    }
    // 自动生成入口文件，入口js名必须和入口文件名相同
    // 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
    var pages = fs.readdirSync(srcDir + "/tpl"); 

    pages.forEach(function(filename) {
        var m = filename.match(/(.+)\.html$/);

        if(m) {
            // @see https://github.com/kangax/html-minifier
            var conf = {
                template: path.resolve(srcDir + "/tpl", filename),
                // @see https://github.com/kangax/html-minifier
                // minify: {
                //     collapseWhitespace: true,
                //     removeComments: true
                // },
                inject: "head",
                filename: filename
            };

            if(m[1] in config.entry) {
                conf.inject = 'body';
                conf.chunks = ['common', m[1]];
            }

            config.plugins.push(new HtmlWebpackPlugin(conf));
        }
    });
    return config;
}

function genEntries() {
    var jsDir = path.resolve(srcDir, 'js');
    var names = fs.readdirSync(jsDir);
    var map = {};

    names.forEach(function(name) {
        var m = name.match(/(.+)\.js$/);
        var entry = m ? m[1] : '';
        var entryPath = entry ? path.resolve(jsDir, name) : '';

        if(entry) map[entry] = entryPath;
    });

    return map;
}



module.exports = makeConf;
