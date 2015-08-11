import gulp from 'gulp'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import jade from 'gulp-jade'
import webpack from 'webpack'
import {join, dirname, basename, extname, relative, resolve} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import mkdirp from 'mkdirp'
import packager from 'electron-packager'
import GitHub from 'github'
import cp from 'child_process'
import Q from 'q'
import argv from 'yargs'
import semver from 'semver'
import livereload from 'gulp-livereload'

const APP_DIR = 'app';
const TEMP_DIR = 'tmp';
const BUILD_DIR = 'build';
const ASSETS_DIR = 'assets';

let pkg = JSON.parse(readFileSync('package.json'));
let url = pkg.repository.url;
let owner = basename(dirname(url));
let repo = basename(pkg.repository.url, extname(url));
let isWatch = false;

async function exec(command, options = {}) {
  return new Promise((resolve, reject) => {
    cp.exec(command, options, (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) reject(stderr);
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function mkdir(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function icon(platform = 'all') {
  let src = resolve(`${ASSETS_DIR}/icon.svg`);

  if (['all', 'darwin'].indexOf(platform) !== -1) {
    let macSizes = [];
    [16, 32, 128, 256, 512].forEach(el => macSizes.push(el, el));
    await mkdir(`${TEMP_DIR}/mac.iconset`);
    await Promise.all([macSizes.map((size, i) => {
      let ratio = 1;
      let postfix = '';
      if (i % 2) {
        ratio = 2;
        postfix = '@2x'
      }
      let dest = resolve(`${TEMP_DIR}/mac.iconset/icon_${size}x${size}${postfix}.png`);
      return exec(`inkscape -z -e ${dest} -d 72 -y 0 -w ${size*ratio} -h ${size*ratio} ${src}`);
    })]);
    await exec(`iconutil -c icns -o ${ASSETS_DIR}/markn.icns ${TEMP_DIR}/mac.iconset`);
  }
  if (['all', 'win32'].indexOf(platform) !== -1) {
    let winSizes = [16, 32, 48, 96, 256];
    await mkdir(`${TEMP_DIR}/win.iconset`);
    await Promise.all(winSizes.map((size) => {
      let dest = resolve(`${TEMP_DIR}/win.iconset/icon_${size}x${size}.png`);
      return exec(`inkscape -z -e ${dest} -d 72 -y 0 -w ${size} -h ${size} ${src}`);
    }));
    await exec(`convert ${TEMP_DIR}/win.iconset/icon_*.png ${ASSETS_DIR}/markn.ico`);
  }
}

async function pack(platform = 'all', arch = 'all') {
  return new Promise((resolve, reject) => {
    packager({
      platform,
      arch,
      dir: APP_DIR,
      out: BUILD_DIR,
      name: 'Markn',
      version: '0.30.2',
      icon: `${ASSETS_DIR}/markn`,
      overwrite: true
    }, (err, dirs) => {
      if (err != null) {
        reject(err);
        return;
      }
      resolve(dirs);
      return;
    });
  });
}

gulp.task('default', () => {
  livereload.listen({
    basePath: APP_DIR,
    start: true
  });
  isWatch = true;
  return gulp.start('debug');
});

gulp.task('debug', ['compile'], () => {
  return gulp.start('electron');
});

gulp.task('electron', async () => {
  await exec(`./node_modules/electron-prebuilt/cli.js ${APP_DIR}`);
});

gulp.task('package', ['compile'], async () => {
  await icon();
  await pack();
});

gulp.task('install', ['compile'], async () => {
  let {platform, arch} = process;
  await icon(platform);
  await pack(platform, arch);
});

gulp.task('icon', async () => {
  await icon()
});

gulp.task('compile', ['copy', 'jade', 'webpack']);

gulp.task('copy', () => {
  return gulp.src([
    'package.json',
    'README.md',
    'node_modules/font-awesome/**/*',
    'node_modules/chokidar/**/*'
  ], {
    base: '.'
  })
  .pipe(gulp.dest(APP_DIR));
});

gulp.task('jade', () => {
  return gulp
  .src('src/renderer/index.jade')
  .pipe(jade())
  .pipe(gulp.dest(APP_DIR))
  .pipe(livereload());
});

gulp.task('webpack', (cb) => {
  webpack({
    watch: isWatch,
    entry: {
      main: './src/main/main.js',
      renderer: './src/renderer/index.js'
    },
    output: {
      path: APP_DIR,
      filename: '[name].js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel'
        }, {
          test: /\.coffee$/,
          loader: 'coffee'
        }, {
          test: /\.jade$/,
          loader: 'jade'
        }, {
          test: /\.css$/,
          loaders: ['style', 'raw']
        }, {
          test: /\.styl$/,
          loaders: ['style', 'raw', 'stylus']
        }
      ]
    },
    resolve: {
      extensions: ['', '.js', '.coffee']
    },
    externals: [
      (() => {
        let IGNORE;
        IGNORE = [
          // Node
          'fs',
          'path',
          // Electron
          'crash-reporter', 'app', 'menu', 'menu-item', 'browser-window', 'dialog', 'shell', 'ipc', 'chokidar'];
        return (context, request, callback) => {
          if (IGNORE.indexOf(request) >= 0) {
            return callback(null, `require('${request}')`);
          }
          return callback();
        };
      })()
    ],
    stats: {
      colors: true
    },
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false
    }
  }, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString());
    if (isWatch) {
      livereload.reload(`${APP_DIR}/renderer.js`);
    }
    if (cb) {
      cb();
      cb = null;
    }
  });
});

gulp.task('release', ['compile'], async () => {
  let github = new GitHub({
    version: '3.0.0',
    debug: true
  });
  github.authenticate({
    type: 'oauth',
    token: process.env.TOKEN
  });

  try {
    await mkdir(APP_DIR);
    await (async () => {
      return console.log('bump package.json');
      let releases = ['major', 'minor', 'patch'];
      let release = argv.r;
      if (releases.indexOf(release) < 0) {
        release = 'patch';
      }
      let version = semver.inc(pkg.version, release);
      pkg.version = version;
      let json = JSON.stringify(pkg, null, 2);
      [
        'package.json',
        `${APP_DIR}/package.json`
      ].forEach((p) => {
        return writeFileSync(p, json);
      });
    })()

    console.log('git commit package.json');
    await exec(`git commit -m "Bump version to v${pkg.version}" package.json`);

    console.log('git push');
    await exec('git push');

    await icon();
    let dirs = await pack();

    dirs = dirs.map((dir) => {
      console.log(dir)
      let name = basename(dir);
      return {dir, name};
    });

    await Promise.all(dirs.map(({name}) => {
      console.log('zip:', name);
      return exec(`zip ../${TEMP_DIR}/${name}.zip -r ${name}`, {cwd: BUILD_DIR});
    }));

    let id = await (async () => {
      console.log('create new release');
      return new Promise((resolve, reject) => {
        github.releases.createRelease({
          owner: owner,
          repo: repo,
          tag_name: 'v' + pkg.version
        }, (err, res) => {
          if (err) return reject(err);
          console.log(JSON.stringify(res, null, 2));
          resolve(res.id);
        });
      });
    });

    console.log('complete to create new release: ' + id);
    await Promise.all(dirs.map(({name}) => {
      return new Promise((release, reject) => {
        github.releases.uploadAsset({
          owner: owner,
          repo: repo,
          id: id,
          name: `${name}.zip`,
          filePath: join(TEMP_DIR, `${name}.zip`)
        }, (err, res) => {
          if (err) return reject(err);
          console.log(JSON.stringify(res, null, 2));
          resolve();
        });
      });
    }));
    console.log('complete to upload');

    console.log('done');
  } catch (err) {
    console.error(err);
  }
});
