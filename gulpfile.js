var gulp=require('gulp');
var connect = require('gulp-connect'); //自动刷新
var sass = require('gulp-sass'); //sass
var uglify = require('gulp-uglify'); //压缩
var rename = require('gulp-rename'); // 文件重命名
var imagemin = require('gulp-imagemin'), // 图片压缩
  pngquant = require('imagemin-pngquant'), // 深度压缩
  changed = require('gulp-changed'); // 只操作有过修改的文件
var concat = require("gulp-concat"); // 文件合并
var minifyCss = require('gulp-minify-css'); // CSS压缩
var clean = require('gulp-clean'); // 文件清理
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint'); //js检测
var tmod = require('gulp-tmod'); //模板
var sourcemaps = require('gulp-sourcemaps'); // 来源地图
var spritesmith = require('gulp.spritesmith'); //png
var fileinclude  = require('gulp-file-include'); //include文件
var babel = require("gulp-babel");  //babel
var rev = require('gulp-rev'); //加版本号
var revCollector = require('gulp-rev-collector');

gulp.task('connect', function () {
  connect.server({
    root: 'app',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(gulp.dest('./app/html'))
    .pipe(connect.reload());
});

gulp.task('tmod-default', function() {
  return gulp.src('./app/tpl/**/*.html')
    .pipe(tmod({
      type: 'default',
      templateBase: './app/'
    }))
    .pipe(rev())
    .pipe(gulp.dest('./app/build/default'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./app/rev/template'))
    .pipe(connect.reload());
});

gulp.task('sass', function () {
  return gulp.src('./app/scss/**/test_gulp.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false // 是否美化属性值
    }))
    .pipe(gulp.dest('./app/css/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifyCss())
    .pipe(gulp.dest('./app/min-css/'))
    .pipe(connect.reload());
});

gulp.task('css', function() {
  return gulp.src('./app/css/**/*.css')
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./app/main-css/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifyCss())
    .pipe(rev())
    .pipe(gulp.dest('./app/main-css/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./app/rev/css'));
});

gulp.task('js', function () {
  return gulp.src(['./app/js/**/*.js', '!*.min.js'])
    .pipe(jshint({"esversion": 6}))
    .pipe(jshint.reporter('default'))
    .pipe(babel())
    .pipe(concat('all.js'))  // 合并成all.js
    .pipe(gulp.dest('./app/min-js/'))
    .pipe(sourcemaps.init()) //map来源地图
    .pipe(rename({ suffix: '.min' })) // 重命名
    .pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./app/min-js/'))
    .pipe(connect.reload());
});

gulp.task('clean-image', function () {
  return gulp.src('./app/min-image/*.{png,jpg,gif,svg}', {read: false})
    .pipe(clean());
});

gulp.task('image', ['clean-image'], function(){
  return gulp.src('./app/image/**/*.{png,jpg,gif,svg}') // 指明源文件路径、并进行文件匹配
    .pipe(changed('./app/min-image'))
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

gulp.task('revHtml', function() {
  return gulp.src(['./app/rev/**/*.json', './app/*.html'])
    .pipe(revCollector())
    .pipe(gulp.dest('./app/build'));
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
  gulp.watch(['./app/scss/**/*.scss'], ['sass']);
  gulp.watch(['./app/js/**/*.js'], ['js']);
  gulp.watch(['./app/image/**/*.{png,jpg,gif,svg}'], ['image']);
  gulp.watch(['./app/css/**/*.css'], ['css']);
  gulp.watch(['./app/tpl/**/*.html'], ['tmod-default']);
});

gulp.task('default', ['connect','watch', 'revHtml']);