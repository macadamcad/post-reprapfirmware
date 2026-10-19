import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const files = Object.fromEntries(await Promise.all(
  ['index.js', 'post.js', 'plugin.json'].map(async p => [p, await readFile(new URL(p, import.meta.url), 'utf8')])
));
const manifest = JSON.parse(files['plugin.json']);
function registration() {
  const cache = new Map();
  function load(p) {
    if (cache.has(p)) return cache.get(p);
    const module = {exports: {}};
    const activate = new Function('module', 'exports', 'require',
      files[p] + '\n;return typeof activate === "function" ? activate : null;'
    )(module, module.exports, request => {
      assert.equal(request, './post.js');
      return load('post.js').exports;
    });
    const result = {exports: module.exports, activate};
    cache.set(p, result);
    return result;
  }
  const registered = [];
  load(manifest.entry).activate(Object.freeze({
    apiVersion: '1', registerPostProcessor: post => registered.push(post)
  }));
  assert.equal(registered.length, 1);
  return registered[0];
}
test('ordinary public registration and stable identity', () => {
  const post = registration();
  assert.equal(manifest.id, 'com.macadam.posts.reprapfirmware');
  assert.deepEqual(manifest.capabilities, ['cam:postprocess']);
  assert.equal(post.id, 'default');
  assert.equal(post.apiVersion, '1');
  assert.deepEqual(post.aliases, ['repRapFirmware']);
  assert.equal(post.extension, 'nc');
  assert.equal(post.mime, 'text/plain');
  assert.deepEqual(registration(), post);
});
test('canonical multi-file source integrity', () => {
  const source = ['index.js', 'post.js'].map(p =>
    Buffer.byteLength(p) + '\n' + p + Buffer.byteLength(files[p]) + '\n' + files[p]
  ).join('');
  assert.equal(manifest.integrity, 'sha256-' + createHash('sha256').update(source).digest('hex'));
});
test('controller instructions are explicit and unchanged', () => {
  const p = registration().profile;
  assert.equal(p.units, 'mm');
  assert.equal(p.arcs, 'xy-incremental');
  assert.deepEqual(p.motion, {ccwArc:'G3', cwArc:'G2', linear:'G1', rapid:'G0'});
  assert.equal(p.spindleStart[0][0].text, 'M3 S');
  assert.deepEqual(p.spindleStop, [[{text:'M5'}]]);
  assert.deepEqual(p.programEnd, [[{text:'M2'}]]);
  assert.deepEqual(p.toolChange, [[{text:'T'}, {precision:'integer', value:'toolSlot'}]]);
});
