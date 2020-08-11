# binaryen-bench

A very simple benchmark suite to compare execution times of Binaryen `wasm-opt` builds.

## Instructions

Put the `wasm-opt` builds to benchmark into subdirectories within [builds](./builds) (include the `bin` and `lib` folders).

(Optional) Copy fixtures to test with into [fixtures](./fixtures). These do not become executed, but are solely used as inputs.

To run the benchmark:

```
npm install
npm test
```
