const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const benchmark = require("benchmark");

const buildsDir = path.join(__dirname, "builds");
const fixturesDir = path.join(__dirname, "fixtures");

const builds = fs.readdirSync(buildsDir);
console.log("Builds:\n - " + builds.join("\n - ") + "\n");

const fixtures = fs.readdirSync(fixturesDir).filter(name => /\.wasm$/.test(name));
console.log("Fixtures:\n - " + fixtures.join("\n - ") + "\n");

const argv = process.argv.slice(2);
if (!argv.length) argv.push("-O");

console.log("Arguments:\n  " + argv.join("\n  ") + "\n");

const options = {
  minSamples: 10,
  maxTime: 120
};

for (const fixture of fixtures) {
  console.log(`Using fixture ${fixture} ...`);
  const suite = new benchmark.Suite({
    name: fixture
  });
  for (const build of builds) {
    suite.add(`wasm-opt@${build}`, () => {
      const { status } = child_process.spawnSync(
        path.join(buildsDir, build, "bin", "wasm-opt"),
        argv.concat(path.join(fixturesDir, fixture)),
        { stdio: "ignore" }
      );
      if (status !== 0) {
        throw Error(`wasm-opt@${build} ${argv.join(" ")} ${fixture} exited with status ${status}`);
      }
    }, options);
  }
  suite
    .on("cycle", function({ target }) {
      console.log(` - ${target.name} ${argv.join(" ")} ${fixture}\n   took ${target.stats.mean.toFixed(3)}s (mean of ${target.stats.sample.length} samples, min ${Math.min.apply(Math, target.stats.sample).toFixed(3)}s)`);
    })
    .on("error", function({ target }) {
      throw target.error;
    })
    .run();
  console.log();
}
