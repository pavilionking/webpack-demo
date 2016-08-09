var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');

var makeConfig = require('./make-webpack.config');
var excludeFromStats = [
    /node_modules[\\\/]/
];

gulp.task('default', function(callback){

  var compiler = webpack(makeConfig({debug: true}), function(err, stats){
    console.log(stats.toString());
    new webpackDevServer(compiler, {
      publicPath: compiler.options.output.publicPath,
      hot: true,
      historyApiFallback: true,
      quiet: false,
      contentBase: '__build/',
      stats: {
          cached: false,
          exclude: excludeFromStats,
          colors: true,
      }
      
    }).listen(3000, '127.0.0.1', function(err){
      if(err) throw new gutil.PluginError("webpack-dev-server", err);
      gutil.log("[webpack-dev-server]", "http://localhost:3000/webpack-dev-server/");
    })
  });
  
  callback();
})

gulp.task('build', function(callback){
  webpack(makeConfig({debug: false}), function(err, stats){
    console.log(stats.toString());
  });
  callback()
})
