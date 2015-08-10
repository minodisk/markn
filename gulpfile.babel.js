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

let pkg = JSON.parse(readFileSync('package.json'));
let url = pkg.repository.url;
let owner = basename(dirname(url));
let repo = basename(pkg.repository.url, extname(url));
let isWatch = false;

function exec(command, options = {}) {
  let d = Q.defer();
  cp.exec(command, options, (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (err) {
      d.reject(err);
      return;
    }
    d.resolve();
  });
  return d.promise;
}

function mkdir(dir) {
  let d = Q.defer();
  mkdirp(dir, (err) => {
    if (err) {
      d.reject(err);
      return;
    }
    d.resolve();
  });
  return d.promise;
}

function icon(platform) {
  let src = resolve('assets/icon.svg');

  return Q.when('')
  .then(() => {
    if (platform && platform !== 'darwin') {
      return;
    }

    return mkdir('tmp/mac.iconset')
    .then(() => {
      let macSizes = [];
      [16, 32, 128, 256, 512].forEach(el => macSizes.push(el, el));

      return Q.all(macSizes.map((size, i) => {
        let d = Q.defer();
        let ratio = 1;
        let postfix = '';
        if (i % 2) {
          ratio = 2;
          postfix = '@2x'
        }
        let dest = resolve(`tmp/mac.iconset/icon_${size}x${size}${postfix}.png`);
        return exec(`inkscape -z -e ${dest} -d 72 -y 0 -w ${size*ratio} -h ${size*ratio} ${src}`);
      }));
    })
    .then(() => {
      return exec('iconutil -c icns -o markn.icns mac.iconset', {cwd: 'tmp'});
    });
  })
  .then(() => {
    if (platform && platform !== 'win32') {
      return;
    }

    return mkdir('tmp/win.iconset')
    .then(() => {
      let winSizes = [16, 32, 48, 96, 256];

      return Q.all(winSizes.map((size) => {
        let dest = resolve(`tmp/win.iconset/icon_${size}x${size}.png`);
        return exec(`inkscape -z -e ${dest} -d 72 -y 0 -w ${size} -h ${size} ${src}`);
      }));
    })
    .then(() => {
      return exec('convert win.iconset/icon_*.png markn.ico', {cwd: 'tmp'});
    });
  });
}

function pack(platform, arch) {
  let d = Q.defer();
  if (platform) {
    if (['linux', 'win32', 'darwin'].indexOf(platform) === -1) {
      setTimeout(() => {d.reject(new Error(`${platform} isn't supported`));}, 0);
      return d.promise
    }
  } else {
    platform = 'all';
  }
  if (arch) {
    if (['ia32', 'x64'].indexOf(arch) === -1) {
      setTimeout(() => {d.reject(new Error(`${arch} isn't supported`));}, 0);
      return d.promise
    }
  } else {
    arch = 'all';
  }
  packager({
    dir: 'dist',
    out: 'build',
    name: 'Markn',
    platform,
    arch,
    version: '0.30.2',
    icon: 'tmp/markn',
    overwrite: true
  }, (err, dirs) => {
    if (err != null) {
      d.reject(err);
      return;
    }
    d.resolve(dirs);
    return;
  });
  return d.promise;
}


gulp.task('default', () => {
  livereload.listen({
    basePath: 'dist',
    start: true
  });
  isWatch = true;
  return gulp.start('debug');
});

gulp.task('debug', ['build'], () => {
  return gulp.start('electron');
});

gulp.task('electron', (cb) => {
  exec('./node_modules/electron-prebuilt/cli.js dist')
  .then(() => cb())
  .fail(cb);
});

gulp.task('package', ['build'], (cb) => {
  icon()
  .then(pack)
  .then((dirs) => {
    cb(null, dirs);
  })
  .fail((err) => {
    cb(err)
  });
});

gulp.task('install', ['build'], (cb) => {
  let {platform, arch} = process;
  icon(platform)
  .then(() => {
    return pack(platform, arch);
  })
  .then((dirs) => {
    cb();
  })
  .fail(cb);
});
//
// gulp.task('icon', (cb) => {
//   icon()
//   .then(() => {
//     cb();
//   })
//   .fail((err) => {
//     cb(err);
//   });
// });

gulp.task('build', ['copy', 'jade', 'webpack']);

gulp.task('copy', () => {
  return gulp.src([
    'package.json',
    'README.md',
    'node_modules/font-awesome/**/*',
    'node_modules/chokidar/**/*'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('jade', () => {
  return gulp
  .src('src/renderer/index.jade')
  .pipe(jade())
  .pipe(gulp.dest('./dist'))
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
      path: './dist/',
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
      livereload.reload('dist/renderer.js');
    }
    if (cb) {
      cb();
      cb = null;
    }
  });
});

gulp.task('release', ['build'], () => {
  let github = new GitHub({
    version: '3.0.0',
    debug: true
  });
  github.authenticate({
    type: 'oauth',
    token: process.env.TOKEN
  });

  Q.when('')
  .then(() => mkdir('dist'))
  .then(() => {
    let json, release, releases, version;
    releases = ['major', 'minor', 'patch'];
    release = argv.r;
    if (releases.indexOf(release) < 0) {
      release = 'patch';
    }
    version = semver.inc(pkg.version, release);
    pkg.version = version;
    json = JSON.stringify(pkg, null, 2);
    [
      'package.json',
      'dist/package.json'
    ].forEach((p) => {
      return writeFileSync(p, json);
    });
  })
  .then(() => {
    return console.log('bump package.json');
  })
  .then(() => {
    console.log('git commit package.json');
    return exec(`git commit -m "Bump version to v${pkg.version}" package.json`);
  })
  .then(() => {
    console.log('git push');
    return exec('git push');
  })
  .then(icon)
  .then(pack)
  .then((dirs) => {
    dirs = dirs.map((dir) => {
      console.log(dir)
      let name = basename(dir);
      return {dir, name};
    });
    return Q.all(dirs.map(({name}) => {
      console.log('zip:', name);
      return exec(`zip ../tmp/${name}.zip -r ${name}`, {cwd: 'build'});
    }))
    .then(() => {
      let d;
      d = Q.defer();
      console.log('create new release');
      github.releases.createRelease({
        owner: owner,
        repo: repo,
        tag_name: 'v' + pkg.version
      }, (err, res) => {
        if (err != null) {
          d.reject(err);
        }
        console.log(JSON.stringify(res, null, 2));
        return d.resolve(res.id);
      });
      return d.promise;
    })
    .then((id) => {
      console.log('complete to create new release: ' + id);
      return Q.all(dirs.map(({name}) => {
        let d = Q.defer();
        github.releases.uploadAsset({
          owner: owner,
          repo: repo,
          id: id,
          name: `${name}.zip`,
          filePath: join('tmp', `${name}.zip`)
        }, (err, res) => {
          if (err != null) {
            d.reject(err);
          }
          console.log(JSON.stringify(res, null, 2));
          return d.resolve();
        });
        return d.promise;
      }))
      .then(() => {
        return console.log('complete to upload');
      });
    });
  })
  .then(() => {
    console.log('done');
  })
  .fail((err) => {
    console.error(err);
  });
});
