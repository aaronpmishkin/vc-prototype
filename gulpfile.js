/*
* @Author: aaronmishkin
* @Date:   2016-05-04 12:12:20
* @Last Modified by:   aaronmishkin
* @Last Modified time: 2016-05-04 12:29:58
*/

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'public'
    }
  });

  gulp.watch(['*.html', 'resources/styles/**/*.css', 'resources/scripts/**/*.js'], {cwd: 'public'}, reload);
});