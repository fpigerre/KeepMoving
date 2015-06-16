var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('assets/stylesheets/*.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('assets/stylesheets/'))
});

// Watch task
gulp.task('default',function() {
    gulp.watch('assets/stylesheets/*.scss',['styles']);
});