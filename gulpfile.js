/**
 * itblooms Starter Kit Gulp configuration file
 * Feel free to modify this file as you need
 * if you find any bug or error, please submit an issue
 */
// Include gulp plugins
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: true });
var browsersync = require('browser-sync');
var del = require('del');

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
    watch: source + 'sass/**/*',
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

// concat or compile vendor js files

gulp.task('vendor-js',function () {
    if(devBuild){
        return gulp.src([
            /* Add your JS files here, they will be combined in this order */
            source + 'vendors/**/jquery.min.js',
            source + 'vendors/**/*min.js',

        ])
            .pipe($.concat('scripts.js'))
            .pipe(gulp.dest(js.out))
    }else{
        return gulp.src([
            /* Add your JS files here, they will be combined in this order */
            source + 'vendors/**/jquery.min.js',
            source + 'vendors/**/*min.js'
        ])
            .pipe($.concat('scripts.js'))
            .pipe(gulp.dest(js.out))
            .pipe($.rename({suffix: '.min'}))
            .pipe($.uglify())
            .pipe(gulp.dest(js.out));
    }
});

// concat or compile vendor css files
gulp.task('vendor-css',function () {
        return gulp.src([
            source + 'vendors/**/*.min.css'
        ])
            .pipe($.concat('style-marged.css'))
            .pipe(gulp.dest(styles.out))
});


// Update images on build folder
gulp.task('images', function () {
  return gulp.src( images.in )
    .pipe($.newer(images.out))
    .pipe(gulp.dest(images.out));
});

// Update Favicon on build folder
gulp.task('favicon', function () {
  return gulp.src(source + 'favicon.ico')
    .pipe($.newer(dest))
    .pipe(gulp.dest(dest));
});


//Compile Pug templates
gulp.task('pug', function () {
  log('-> Compiling Pug Templates')

  var templates = gulp.src(views.in)
    .pipe($.plumber())
    .pipe($.newer(views.out));
  if (!devBuild) {
    log('-> Compressing templates for Production')
    templates = templates
      .pipe($.size({ title: 'pug Templates Before Compression' }))
      .pipe($.pug())
      .pipe($.size({ title: 'pug Templates After Compression' }));
  } else {
    templates.pipe($.pug(pugOptions));
  }
  return templates.pipe(gulp.dest(views.out));
});

// Compile Sass styles
gulp.task('sass', function () {
  log('-> Compile SASS Styles')
  return gulp.src(styles.in)
    .pipe($.plumber())
    .pipe($.sass(styles.sassOpt))
    .pipe($.size({ title: 'styles In Size' }))
    .pipe($.pleeease(styles.pleeeaseOpt))
    .pipe($.size({ title: 'styles Out Size' }))
    .pipe(gulp.dest(styles.out))
    .pipe(browsersync.reload({ stream: true }));
});

// Start BrowserSync
gulp.task('browsersync', function () {
  log('-> Starting BrowserSync')
  browsersync(syncOpt);
});

// Build Task
gulp.task('build', ['sass', 'pug', 'js', 'images', 'favicon', 'vendor-js', 'vendor-css']);

// Watch Task
gulp.task('watch', ['browsersync'], function () {
  // Watch for style changes and compile
  gulp.watch(styles.watch, ['sass']);
  // Watch for pug changes and compile
  gulp.watch(views.watch, ['pug', browsersync.reload]);
  // Watch for javascript changes and compile
  gulp.watch(js.in, ['js', browsersync.reload]);
  // Watch for new vendors and copy
  gulp.watch(vendors.watch, ['vendor-js', 'vendor-css']);
  // Watch for new images and copy
  gulp.watch(images.in, ['images']);
});

// Compile and Watch task
gulp.task('start', ['build', 'watch']);

// Help Task
gulp.task('help', function () {
  log('');
  log('===== Help for itblooms Starter Kit =====');
  log('');
  log('The commands for the task runner are the following.');
  log('-------------------------------------------------------');
  log('       clean: Removes all the compiled files on ./build');
  log('          js: Compile the JavaScript files');
  log('        pug: Compile the Pug templates');
  log('        sass: Compile the Sass styles');
  log('      images: Copy the newer to the build folder');
  log('     favicon: Copy the favicon to the build folder');
  log('     vendors: Copy the vendors to the build folder');
  log('       build: Build the project');
  log('       watch: Watch for any changes on the each section');
  log('       start: Compile and watch for changes (for dev)');
  log('        help: Print this message');
  log(' browsersync: Start the browsersync server');
  log('');
});

// Default Task
gulp.task('default', ['build', 'watch']);

/**
 * Custom functions
 */
 function log(msg) {
   console.log(msg);
}

