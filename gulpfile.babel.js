import gulp from 'gulp'
import gutil from 'gulp-util'
import plumber from 'gulp-plumber'
import jade from 'gulp-jade'
import webpack from 'webpack'
import {join, dirname, basename, extname, relative, resolve} from 'path'
import {readFileSync, writeFileSync, mkdir} from 'fs'
import packager from 'electron-packager'
import GitHub from 'github'
import {spawn} from 'child_process'
import {exec} from 'child_process'
import Q from 'q'
import argv from 'yargs'
import semver from 'semver'
import livereload from 'gulp-livereload'

let pkg = JSON.parse(readFileSync('package.json'));
let url = pkg.repository.url;
let owner = basename(dirname(url));
let repo = basename(pkg.repository.url, extname(url));
let isWatch = false;

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
  exec('./node_modules/electron-prebuilt/cli.js dist', (err, stdout, stderr) => {
    if (err) {
      cb(err);
      return;
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    cb();
  });
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

function icon() {
  return Q
  .when('')
  .then(() => {
    let d = Q.defer();
    exec('iconutil -c icns Markn.iconset', {cwd: 'assets'}, (err, stdout, stderr) => {
      if (err) {
        d.reject(err);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      d.resolve();
    });
    return d.promise;
  })
  .then(() => {
    let d = Q.defer();
    exec('iconutil -c icns Markn.iconset', {cwd: 'assets'}, (err, stdout, stderr) => {
      if (err) {
        d.reject(err);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      d.resolve();
    });
    return d.promise;
  })
  .then(() => {
    let d = Q.defer();
    exec('convert Markn.iconset/icon_16x16.png Markn.iconset/icon_32x32.png Markn.iconset/icon_128x128.png Markn.iconset/icon_256x256.png Markn.iconset/icon_512x512.png Markn.ico', {cwd: 'assets'}, (err, stdout, stderr) => {
      if (err) {
        d.reject(err);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      d.resolve();
    });
    return d.promise;
  });
}

function pack() {
  let d;
  d = Q.defer();
  packager({
    dir: 'dist',
    out: 'tmp',
    name: 'Markn',
    platform: 'all',
    arch: 'all',
    version: '0.30.2',
    icon: 'assets/Markn',
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

gulp.task('build', ['copy', 'jade', 'webpack']);

gulp.task('copy', () => {
  return gulp.src([
    'package.json',
    'README.md',
    'bin/**/*',
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
        }//, {
        //   test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: 'url?minetype=application/font-woff'
        // }, {
        //   test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: 'file'
        // }, {
        //   test: /\.md$/,
        //   loader: 'raw-loader'
        // }
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
    if (err != null) {
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
  .then(() => {
    let d;
    d = Q.defer();
    mkdir('dist', d.resolve);
    return d.promise;
  })
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
    let d, git;
    d = Q.defer();
    console.log('git commit package.json');
    git = spawn('git', ['commit', '-m', `Bump version to v${pkg.version}`, 'package.json']);
    git.stdout.on('data', (data) => {
      return console.log(data.toString('utf8'));
    });
    git.stderr.on('data', (data) => {
      return console.log(data.toString('utf8'));
    });
    git.on('close', (code) => {
      return d.resolve();
    });
    return d.promise;
  })
  .then(() => {
    let d, git;
    d = Q.defer();
    console.log('git push');
    git = spawn('git', ['push']);
    git.stdout.on('data', (data) => {
      return console.log(data.toString('utf8'));
    });
    git.stderr.on('data', (data) => {
      return console.log(data.toString('utf8'));
    });
    git.on('close', (code) => {
      return d.resolve();
    });
    return d.promise;
  })
  .then(icon)
  .then(pack)
  .then((dirs) => {
    dirs = dirs.map((dir) => {
      console.log(dir)
      let name = basename(dir);
      let zip = name + '.zip';
      return {
        dir: dir,
        name: name,
        zip: zip
      };
    });
    return Q.all(dirs.map((arg) => {
      let d, name, zip;
      name = arg.name, zip = arg.zip;
      d = Q.defer();
      console.log('zip ' + name + ' to ' + zip);
      zip = spawn('zip', [zip, '-r', name], {cwd: 'tmp'});
      zip.stdout.on('data', (data) => {
        return console.log(data.toString('utf8'));
      });
      zip.stderr.on('data', (data) => {
        return console.log(data.toString('utf8'));
      });
      zip.on('close', (code) => {
        return d.resolve();
      });
      return d.promise;
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
      return Q.all(dirs.map((arg) => {
        let d, zip;
        zip = arg.zip;
        d = Q.defer();
        github.releases.uploadAsset({
          owner: owner,
          repo: repo,
          id: id,
          name: zip,
          filePath: 'tmp' + zip
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
