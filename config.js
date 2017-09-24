module.exports = function() {
    // Configs
    /**
     * This is the environment in wish you are working on
     * Options are:
     * - development == true
     * - production == false
     */
    var
        devBuild = true,
        source = 'source/',
        dest = 'build/',
        images = {
            in: source + 'assets/img/**/*.*',
            out: dest + 'assets/img'
        },
        views = {
            in: source + 'views/*.pug',
            out: dest,
            watch: source + 'views/**/*'
        },
        styles = {
            in: source + 'sass/main.sass',
            watch: 'sass/**/*',
            out: dest + 'assets/css/',
            sassOpt: {
                outputStyle: 'expanded',
                imagePath: '../img',
                precision: 3,
                errLogToConsole: true
            },
            pleeeaseOpt: {
                autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
                rem: ['16px'],
                pseudoElements: true,
                mqpacker: true,
                minifier: !devBuild
            }
        },
        js = {
            in: source + 'assets/js/**/*',
            out: dest + 'assets/js',
            filename: 'app.js'
        },
        syncOpt = {
            server: {
                baseDir: dest,
                index: 'index.html'
            },
            open: true,
            notify: true
        },
        pugOptions = { pretty: devBuild, basedir: source + 'views/' },
        vendors = {
            in: source + 'vendors/**/*',
            out: dest + 'vendors/',
            watch: [source + 'vendors/**/*']
        };

    /**
     * Tasks
     */
//Clean the build folder
    gulp.task('clean', function () {
        log('-> Cleaning build folder')
        del([
            'build/*'
        ]);
    });

// Compile Javascript files
    gulp.task('js', function () {
        if (devBuild) {
            log('-> Compiling Javascript for Development')
            return gulp.src(js.in)
                .pipe($.plumber())
                .pipe($.newer(js.out))
                .pipe($.jshint())
                .pipe($.jshint.reporter('jshint-stylish', { verbose: true }))
                .pipe($.jshint.reporter('fail'))
                .pipe($.concat(js.filename))
                .pipe(gulp.dest(js.out));
        } else {
            log('-> Compiling Javascript for Production')
            del([
                dest + 'js/*'
            ]);
            return gulp.src(js.in)
                .pipe($.plumber())
                .pipe($.deporder())
                .pipe($.concat(js.filename))
                .pipe($.size({ title: 'Javascript In Size' }))
                .pipe($.stripDebug())
                .pipe($.uglify())
                .pipe($.size({ title: 'Javascript Out Size' }))
                .pipe(gulp.dest(js.out));
        }
    });

    // return config;
}
