var gulp 		= require('gulp'),
	sass		= require('gulp-sass'),
	browserSync = require('browser-sync').create();

gulp.task('serve', ['browserSync'], function() {
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/sass/**/*.scss', ['sass']);
});

gulp.task('sass', function() {
	gulp.src('app/sass/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
})


