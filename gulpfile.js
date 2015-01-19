var gulp = require('gulp');

gulp.task('default', function() {
  console.log("I have configured a gulpfile");
});

gulp.task('watch', function () {
   gulp.watch('server.js', ['build']);
});