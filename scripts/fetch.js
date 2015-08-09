import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import request from 'request'
import cp from 'child_process'
// import unzip from 'unzip'
// import yauzl from 'yauzl'

async function readFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

async function exec(cmd) {
  return new Promise((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) return reject(err);
      console.log(stdout);
      resolve();
    });
  });
}

async function mkdir(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, (err, made) => {
      if (err) return reject(err);
      resolve(made);
    });
  });
}

function distribution({platform, arch}) {
  return `Markn-${platform}-${arch}`;
}

(async () => {
  try {
    let pkg = JSON.parse(await readFile(path.join(__dirname, '../package.json')));
    let dist = distribution(process);
    let zipUrl = `https://github.com/minodisk/markn/releases/download/v${pkg.version}/${dist}.zip`;
    await Promise.all([
      mkdir('tmp'),
      mkdir('build')
    ]);
    console.log(`tmp/${dist}.zip`);
    await exec(`unzip -d build -o tmp/${dist}.zip`)
    // await (async () => {
    //   return new Promise((resolve, reject) => {
    //     request(zipUrl)
    //     .on('response', (response) => {
    //       console.log(response.statusCode);
    //       console.log(response.headers['content-type']);
    //     })
    //     .on('close', resolve)
    //     .on('error', reject)
    //     .pipe(fs.createWriteStream(`./tmp/${dist}.zip`))
    //   });
    // })();
    // await unzip(`./tmp/${dist}.zip`);
    // await (async () => {
    //   return new Promise((resolve, reject) => {
    //     fs.createReadStream(`./tmp/${dist}.zip`)
    //     .on('close', resolve)
    //     .on('error', reject)
    //     .pipe(unzip.Extract({ path: 'build' }));
    //   });
    // })();
  } catch(err) {
    console.error(err);
  }
})();

