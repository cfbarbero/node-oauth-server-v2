var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    clean = require("gulp-clean"),
    bump = require('gulp-bump'),
    pjson = require('./package.json'),
    zip = require('gulp-zip');

gulp.task('bump', function() {
    gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('zip', () => {
    return gulp.src(
            [
                "*.js",
                "package.json"
            ], {
                base: "."
            })
        .pipe(zip(pjson.name + '-' + pjson.version + '.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return gulp.src("dist", {
        read: false
    }).pipe(clean());
});

gulp.task('release', function(callback) {
    runSequence(
        'bump',
        'zip',
        function(error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        });
});
