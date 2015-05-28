var gulp = require('gulp');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');

gulp.task('css', function() {
  return gulp.src(['css/base.css', 'css/syntax.css'])
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('all.css'))
    .pipe(gulp.dest('css/'));
});

gulp.task('images', function() {
  return gulp.src('img/blog/*')
    .pipe(imagemin())
    .pipe(gulp.dest('img/blog/'));
});

gulp.task('dev', ['css', 'images'], function() {
  gulp.watch('css/*.css', ['css']);
  gulp.watch('img/blog/*', ['images']);
});
