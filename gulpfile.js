
var gulp = require('gulp');
var rename = require("gulp-rename");
var cleanCSS = require('gulp-clean-css');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var addStream = require('add-stream');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');

var config = {
  src: './src/angular-carousel-bs',
  dest: './dist'
}

gulp.task('minify-css', function () {

  return gulp.src(config.src + '/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename(function (path) {
      path.extname = ".min.css";
      return path;
    }))
    .pipe(gulp.dest(config.dest));
});

gulp.task('copy-css', [], function (done) {

  return gulp.src(config.src + '/*.css')
    .pipe(gulp.dest(config.dest));

});

gulp.task('css', ['minify-css', 'copy-css']);

function prepareTemplates() {
  return gulp.src(config.src + '/*.ng.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(templateCache({
      root: './angular-carousel-bs',
      module: 'angular-carousel-bs'
    }));
}

gulp.task('js', [], function () {
  return gulp.src(config.src + '/*.js')
    .pipe(ngAnnotate())
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('angular-carousel-bs.js'))
    .pipe(gulp.dest(config.dest))
    .pipe(uglify())
    .pipe(rename('angular-carousel-bs.min.js'))
    .pipe(gulp.dest(config.dest));
});

gulp.task('default', ['js', 'css']);