var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');

var makeConfig = require('./make-webpack.config');
var makeDllConfig = require('./webpack.dll.config');

var excludeFromStats = [
    /node_modules[\\\/]/
];

gulp.task('default', function(callback){

  var compiler = webpack(makeConfig({debug: true}), function(err, stats){
    new webpackDevServer(compiler, {
      publicPath: compiler.options.output.publicPath,
      hot: true,
      historyApiFallback: false,
      contentBase: '__build/',
      stats: {
          cached: false,
          exclude: excludeFromStats,
          colors: true,
      },
      proxy: {
        '/api/*': {
          target: "http://wx.hexugongshe.com",
          //target: "http://wljbi.chinacloudapp.cn",
          secure: false,
          changeOrigin: true,
          rewrite: function(req) {

          }
        },
        '*.htm[l]?': {
          target: "http://localhost:3000",
          rewrite: function(req) {
            console.log(new Date().getTime() + " [" + req.headers.method + "] " + req.url);
            req.url = "/";
          }
        }

      }

    }).listen(3000, '0.0.0.0', function(err){
      if(err) throw new gutil.PluginError("webpack-dev-server", err);
      gutil.log("[webpack-dev-server]", "http://0.0.0.0:3000/webpack-dev-server/");
    })
  });

  callback();
})

/**
 * 产品构建
 * @type
 */
gulp.task('build',[], function(){
  webpack(makeConfig({debug: false}), function(err, stats){
    console.log(stats.toString());
  });
})

gulp.task("build-dll", function(){
  webpack(makeDllConfig({debug: false}), function(err, stats){
    console.log(stats.toString());
  })
})

gulp.task("build-dev-dll", function(){
  webpack(makeDllConfig({debug: true}), function(err, stats){
    console.log(stats.toString());
  })
})
