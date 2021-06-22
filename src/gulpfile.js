const gulp = require('gulp');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const browserSync = require("browser-sync").create();

//process html
gulp.task('processHTML',(done)=>{
    console.log("processing html...");
    gulp.src('*.html')
    .pipe(gulp.dest('../public'));
    done();
})

//process images
gulp.task('processIMG',(done)=>{
    console.log("processing images...");
    gulp.src('img/*.*')
    .pipe(gulp.dest('../public/img'));
    done();
})
//process js
gulp.task('processJS',(done)=>{
    gulp.src('js/*.js')
    .pipe(jshint({
        esversion:6
    }))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('../public/js'));
    done();
})

//process scss
gulp.task('processSCSS',(done)=>{
    gulp.src('css/*.scss')
    .pipe(sass().on('error',sass.logError))
    .pipe(gulp.dest('../public/css'));
    done();
})

//babel polyfill
gulp.task('babelPolyfill', (done) => {
    gulp.src('node_modules/babel-polyfill/browser.js')
      .pipe(gulp.dest('dist/node_modules/babel-polyfill'));
      done();
  });

  //browser sync
  gulp.task('browserSync',(done)=>{
      browserSync.init({
          server: "../public",
          port:4040,
          ui:{port:4041}
      });
      done();
  })
//watch changes

gulp.task('watch',gulp.series('browserSync'),(done)=>{
    gulp.watch("js/*.js",gulp.series('processJS'));
    gulp.watch("*.html",gulp.series('processHTML'));
    gulp.watch("img/*.*",gulp.series('processIMG'));
    gulp.watch("css/*.scss",gulp.series('processSCSS'));
    gulp.watch("../public/js/*.js",browserSync.reload);
    gulp.watch("../public/*.html",browserSync.reload);
    gulp.watch("../public/img/*.*",browserSync.reload);
    gulp.watch("../public/css/*.css",browserSync.reload);
    done();
})

  //default task
  gulp.task('default',(callback)=>{
    var runTasks = gulp.series('browserSync','processHTML','processIMG','processJS','processSCSS','watch');
    runTasks();
    callback();
  })
