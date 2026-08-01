#!/usr/bin/env node
/*
 * Precompile a UI kit's JSX → plain JS using the SAME babel-standalone that the
 * browser used to run at runtime, so the output is identical to the old in-page
 * transform — just done once, at build time, instead of on every page load.
 *
 * Usage:  node build-jsx.js <kit-dir> <file1.jsx> <file2.jsx> ...
 * Writes: <kit-dir>/compiled/<file>.js  for each input.
 *
 * After editing any .jsx in a precompiled kit you MUST re-run this and bump the
 * loader's ?v= — otherwise the site serves stale compiled JS.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load babel-standalone into a sandbox and grab the Babel global (it's a UMD bundle).
const babelSrc = fs.readFileSync(path.join(__dirname, 'vendor', 'babel.min.js'), 'utf8');
const mod = { exports: {} };
const sandbox = { self: {}, window: {}, module: mod, exports: mod.exports };
vm.createContext(sandbox);
vm.runInContext(babelSrc, sandbox, { filename: 'babel.min.js' });
const Babel = [
  sandbox.exports, mod.exports, sandbox.Babel,
  sandbox.window && sandbox.window.Babel, sandbox.self && sandbox.self.Babel,
].find(function (x) { return x && typeof x.transform === 'function'; });
if (!Babel || !Babel.transform) {
  console.error('ERROR: could not load Babel from vendor/babel.min.js');
  process.exit(1);
}

const [, , kitDir, ...files] = process.argv;
if (!kitDir || files.length === 0) {
  console.error('Usage: node build-jsx.js <kit-dir> <file1.jsx> ...');
  process.exit(1);
}

const outDir = path.join(kitDir, 'compiled');
fs.mkdirSync(outDir, { recursive: true });

let ok = 0;
for (const file of files) {
  const inPath = path.join(kitDir, file);
  const src = fs.readFileSync(inPath, 'utf8');
  let code;
  try {
    code = Babel.transform(src, { presets: ['react'] }).code;
  } catch (e) {
    console.error('COMPILE FAIL ' + file + ': ' + (e && e.message || e));
    process.exit(1);
  }
  const outName = file.replace(/\.jsx$/, '.js');
  fs.writeFileSync(path.join(outDir, outName), code);
  ok++;
}
console.log('Compiled ' + ok + ' file(s) → ' + outDir);
