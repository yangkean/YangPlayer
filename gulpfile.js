'use strict';

const gulp = require('gulp');
const autoprefixer = require('autoprefixer'); // parse CSS and add vendor prefixes to CSS rules
const cssnano = require('cssnano'); // minify CSS
const postcss = require('gulp-postcss'); // pipe CSS through PostCSS processors with a single parse
const uglify = require('gulp-uglify'); // minify JS
const rename = require('gulp-rename');
const livereload = require('gulp-livereload');
const del = require('del'); // delete files and folders
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const processhtml = require('gulp-processhtml');
const babel = require('gulp-babel');

const plugins = [
  autoprefixer({browsers: ['last 2 version']}),
  cssnano({zindex: false})
];

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('test:styles', function() {
  return gulp.src('src/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('build:styles', function() {
  return gulp.src('src/css/*.css')
    .pipe(postcss(plugins))
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('test:scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build:scripts', function() {
    return gulp.src('src/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(processhtml())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    livereload.listen();

    gulp.watch(['src/**']).on('change', livereload.changed);
});

gulp.task('test', ['test:styles', 'test:scripts', 'html']);

gulp.task('build', ['build:styles', 'build:scripts', 'html']);
