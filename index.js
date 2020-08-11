const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const benchmark = require("benchmark");

const buildsDir = path.join(__dirname, "builds");
const fixturesDir = path.join(__dirname, "fixtures");

const builds = fs.readdirSync(buildsDir);
console.log("Builds:\n * " + builds.join("\n * ") + "\n");

const fixtures = fs.readdirSync(fixturesDir).filter(name => /\.wasm$/.test(name));
console.log("Fixtures:\n * " + fixtures.join("\n * ") + "\n");

const options = {
  minSamples: 10,
  maxTime: 60
};

for (const fixture of fixtures) {
  console.log(`Using fixture ${fixture} ...`);
  const suite = new benchmark.Suite({
    name: fixture
  });
  for (const build of builds) {
    suite.add(`wasm-opt@${build}`, () => {
      child_process.spawnSync(path.join(buildsDir, build, "bin", "wasm-opt"), [
        '-O3',
        path.join(fixturesDir, fixture)
      ], {
        stdio: "ignore"
      });
    }, options);
  }
  suite
    .on('cycle', function({ target }) {
      console.log(` - ${target.name} took ${target.stats.mean.toFixed(3)}s (mean of ${target.stats.sample.length} samples, min ${Math.min.apply(Math, target.stats.sample).toFixed(3)}s)`);
    })
    .on('error', function(err) {
      throw err;
    })
    .run();
  console.log();
}
