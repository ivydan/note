var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('watch:electron', function () {
  electron.start();
  gulp.watch(['./*.js'], electron.restart);
  gulp.watch(['./*.{html,js,css}'], electron.reload);
});