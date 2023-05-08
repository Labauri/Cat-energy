import gulp from 'gulp'
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import svgmin from 'gulp-svgmin';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import del from 'del';
import { minify } from 'csso';
import rename from 'gulp-rename';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Html

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}

// Scripts
const dest = gulp.dest

const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}


// Images

const images = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'))
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(webp())
    .pipe(gulp.dest('build/img'))
}

// Svg

const svg = () => {
  return gulp.src('source/img/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('build/img'))
}

const sprite = () => {
  return gulp.src('source/img/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean

const clean = () => {
  return del(['build/**', '!build']);
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/**/*.js', gulp.series(script));
  gulp.watch('source/*.html'), gulp.series(html, browser.reload);
}

// Build

export const build = gulp.series(
  clean, copy, images,
  gulp.parallel(
    styles, html, script, svg, sprite, createWebp
  ),
);

export default gulp.series(
  clean, copy, images,
  gulp.parallel(
    styles, html, script, svg, sprite, createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
