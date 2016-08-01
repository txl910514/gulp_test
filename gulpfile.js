var gulp=require('gulp'),
  connect = require('gulp-connect'), //自动刷新
  sass = require('gulp-sass'), //sass
  uglify = require('gulp-uglify'), //压缩
  rename = require('gulp-rename'), // 文件重命名
  imagemin = require('gulp-imagemin'), // 图片压缩
  pngquant = require('imagemin-pngquant'), // 深度压缩
  changed = require('gulp-changed'), // 只操作有过修改的文件
  concat = require("gulp-concat"), // 文件合并
  minifyCss = require('gulp-minify-css'), // CSS压缩
  clean = require('gulp-clean'), // 文件清理
  autoprefixer = require('gulp-autoprefixer'), //样式加浏览器前缀
  jshint = require('gulp-jshint'), //js检测
  tmod = require('gulp-tmod'), //模板
  sourcemaps = require('gulp-sourcemaps'), // 来源地图
  spritesmith = require('gulp.spritesmith'), //png
  fileinclude  = require('gulp-file-include'), //include文件
  babel = require("gulp-babel"), //babel
  rev = require('gulp-rev'), //加版本号
  revCollector = require('gulp-rev-collector'),
  htmlmin = require('gulp-htmlmin'), //压缩html
  pathConfig = {
    src: './app/',
    dist: './dist/',
    bulid: './build/'
  };

gulp.task('connect', function () {
  connect.server({
    root: 'build',
    livereload: true
  });
});


gulp.task('clean-html', function () {
  return gulp.src(pathConfig.dist+'html/*', {read: false})
    .pipe(clean());
});

//压缩html
gulp.task('html', ['tmod-default','clean-html'], function () {
  return gulp.src(pathConfig.src+'templates/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(gulp.dest(pathConfig.bulid+'html'))
    .pipe(rev())
    .pipe(gulp.dest(pathConfig.dist+'html'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(pathConfig.bulid+'rev/html'))
    .pipe(connect.reload());
});

gulp.task('tmod-default', function() {
  return gulp.src(pathConfig.src+'templates/tpl/**/*.html')
    .pipe(tmod({
      type: 'default',
      templateBase: pathConfig.src+'templates'
    }))
    .pipe(gulp.dest(pathConfig.src+'js/build'))
    .pipe(connect.reload());
});

gulp.task('sass', function () {
  return gulp.src(pathConfig.src+'scss/**/test_gulp.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false // 是否美化属性值
    }))
    .pipe(gulp.dest(pathConfig.bulid+'css/'))
    .pipe(connect.reload());
});

gulp.task('clean-css', function () {
  return gulp.src(pathConfig.dist+'css/*', {read: false})
    .pipe(clean());
});

gulp.task('css',['clean-css'], function() {
  return gulp.src(pathConfig.bulid+'css/**/*.css')
    .pipe(concat('main.css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(gulp.dest(pathConfig.dist+'css/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(pathConfig.bulid+'rev/css'));
});

gulp.task('clean-js', function () {
  return gulp.src(pathConfig.dist+'js/*', {read: false})
    .pipe(clean());
});

gulp.task('js',['clean-js'], function () {
  return gulp.src([pathConfig.src+'js/**/*.js', '!*.min.js'])
    .pipe(jshint({
      "undef": false,
      "unused": false,
      "esversion": 6
    }))
    .pipe(jshint.reporter('default'))
    .pipe(babel())
    .pipe(concat('all.js'))  // 合并成all.js
    .pipe(gulp.dest(pathConfig.bulid+'js/'))
    .pipe(sourcemaps.init()) //map来源地图
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
    .pipe(sourcemaps.write('maps'))
    .pipe(rev())
    .pipe(gulp.dest(pathConfig.dist+'js/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(pathConfig.bulid+'rev/js'))
    .pipe(connect.reload());
});

gulp.task('clean-image', function () {
  return gulp.src(pathConfig.src+'img/*.{png,jpg,gif,svg}', {read: false})
    .pipe(clean());
});

gulp.task('image', ['clean-image'], function(){
  return gulp.src(pathConfig.src+'img/*.{png,jpg,gif,svg}') // 指明源文件路径、并进行文件匹配
    .pipe(changed(pathConfig.bulid+'img'))
    .pipe(imagemin({
      progressive: true, // 无损压缩JPG图片
      svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
      use: [pngquant()] // 使用pngquant插件进行深度压缩
    }))
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css'
    }))
    .pipe(gulp.dest('./app/min-image')); // 输出路径
});

/*gulp.task('revHtml', function() {
  return gulp.src(['./app/rev/!**!/!*.json', './app/!*.html'])
    .pipe(revCollector())
    .pipe(gulp.dest('./app/build'));
});*/

gulp.task('watch', function () {
  gulp.watch([pathConfig.src+'templates/*.html'], ['html']);
  gulp.watch([pathConfig.src+'templates/tpl/**/*.html'], ['tmod-default']);
  gulp.watch([pathConfig.src+'scss/**/*.scss'], ['sass']);
  gulp.watch([pathConfig.bulid+'css/**/*.css'], ['css']);
  gulp.watch([pathConfig.src+'js/**/*.js'], ['js']);
/*  gulp.watch(['./app/image/!**!/!*.{png,jpg,gif,svg}'], ['image']);*/

});

gulp.task('default', ['connect','watch']);