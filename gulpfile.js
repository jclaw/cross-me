var gulp = require('gulp'),
    connect = require('gulp-connect');


gulp.task('express', function(){
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')({port: 35729}));
  app.use(express.static(__dirname));
  app.listen(process.env.PORT || 9000);
});

gulp.task('html', function () {
  gulp.src('*.html')
    .pipe(connect.reload());
});

gulp.task('css', function() {
  gulp.src('assets/css/*')
    .pipe(connect.reload());
})

gulp.task('js', function() {
  gulp.src('assets/js/**/*')
    .pipe(connect.reload());
    // .pipe(jshint('./.jshintrc'))
    // .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('json', function() {
  gulp.src('assets/json/*')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('*.html', ['html']);
  gulp.watch('assets/css/*', ['css']);
  gulp.watch('assets/js/**/*', ['js']);
  gulp.watch('assets/json/*', ['json']);
});

gulp.task('serve', ['express'], function() {
  connect.server({
    livereload: true,
    // root: ''
  });
});

// gulp.task('webserver', function() {
//     gulp.src('')
//         .pipe(webserver({
//             livereload: true,
//             open: true
//         }));
// });

// gulp.task('production','', function(){
//   var express = require('express');
//   var app = express();
//   app.use(express.static('welcome'));
//   app.listen(process.env.PORT || 8080);
// });

gulp.task('default', ['watch', 'serve']);
