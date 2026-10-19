import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const files = Object.fromEntries(await Promise.all(['index.js','post.js','plugin.json'].map(async p=>[p,await readFile(new URL(p,import.meta.url),'utf8')])));
const manifest=JSON.parse(files['plugin.json']);
function registration() {
  const module={exports:{}};
  new Function('module', files['post.js'])(module);
  const activate=new Function('require', files['index.js']+'\nreturn activate;')(request=>{assert.equal(request,'./post.js');return module.exports;});
  const posts=[];activate(Object.freeze({apiVersion:'1',registerPostProcessor:post=>posts.push(post)}));
  return posts;
}
test('ordinary API2 public registration and deterministic declarations',()=>{
 const posts=registration();assert.deepEqual(posts,registration());assert.deepEqual(manifest.capabilities,['cam:postprocess']);
 assert.equal(manifest.version,'2.0.0-alpha.1');assert.equal(posts[0].id,'default');
 assert(posts.every(p=>p.apiVersion==='2'&&p.mime==='text/plain'&&p.extension==='nc'));
});
test('canonical committed JavaScript source integrity',()=>{
 const source=['index.js','post.js'].map(p=>`${Buffer.byteLength(p)}\n${p}${Buffer.byteLength(files[p])}\n${files[p]}`).join('');
 assert.equal(manifest.integrity,'sha256-'+createHash('sha256').update(source).digest('hex'));
});
test('controller/manual-change instructions and no privileged built-in syntax',()=>{
 const posts=registration();const p=posts[0].profile;
 assert.equal(p.defaultToolChange,'automatic');assert.equal(p.units,'mm');
 assert.equal(p.events.spindleCW[0].line[0].text,'M3 S');assert.equal(p.events.spindleCCW[0].line[0].text,'M4 S');
 if(manifest.id.endsWith('grbl-linuxcnc'))assert.equal(p.events.coolantOff[0].line[0].text,'M9');
 else assert.equal(p.events.coolantFlood,undefined);
 if(manifest.id.endsWith('grbl-linuxcnc')) {
  assert.equal(posts.length,2);assert.equal(p.events.toolChangeAutomatic[0].line[2].text,' M6');
  const grbl=posts.find(p=>p.id==='grbl');assert.equal(grbl.profile.axes,'xyz');
  assert.equal(grbl.profile.defaultToolChange,'manual');assert.equal(grbl.profile.events.toolChangeManual.at(-1).line[0].text,'M0');
  assert.equal(grbl.profile.events.toolChangeAutomatic,undefined);assert.equal(grbl.profile.events.rotaryIndex,undefined);assert.equal(grbl.profile.events.coolantMist,undefined);
  assert(!JSON.stringify(grbl).includes('G43'));assert(!JSON.stringify(grbl).includes('G91.1'));
 } else {assert.equal(posts.length,1);assert.equal(p.events.toolChangeAutomatic[0].line[0].text,'T');assert.equal(p.events.toolChangeManual,undefined);assert(!JSON.stringify(p.events.toolChangeAutomatic).includes('M6'));}
});
