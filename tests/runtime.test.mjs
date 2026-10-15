import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareRuntime } from '../shared/cube/runtime.mjs';

async function fixture(t) {
 const root = await mkdtemp(path.join(os.tmpdir(), 'cube-runtime-'));
 t.after(() => rm(root, {recursive:true, force:true}));
 const app = path.join(root, 'app'); await mkdir(app);
 await writeFile(path.join(app, 'package.json'), JSON.stringify({name:'cube-agent-forms'}));
 return {app, env:{PORT:'4567', XDG_DATA_HOME:path.join(root,'persistent')}};
}
test('requires a valid Cube port', async t => {
 const {app,env}=await fixture(t);
 for(const PORT of ['', '0','65536','3oops','-1']) await assert.rejects(prepareRuntime(app,{...env,PORT}), /PORT/);
});
test('isolates data and keeps secret and uploads across checkout replacements',async t=>{
 const {app,env}=await fixture(t);
 const first=await prepareRuntime(app,env);
 assert.equal(first.HOST,'127.0.0.1'); assert.equal(first.NITRO_HOST,'127.0.0.1');
 assert.ok(first.DATABASE_URL.startsWith('pglite:/'));
 assert.equal(first.BETTER_AUTH_SECRET.length,64);
 await writeFile(path.join(app,'data','upload.txt'),'kept');
 await rm(app,{recursive:true}); await mkdir(app);
 await writeFile(path.join(app,'package.json'),JSON.stringify({name:'cube-agent-forms'}));
 const second=await prepareRuntime(app,{...env,PORT:'4568'});
 assert.equal(second.BETTER_AUTH_SECRET,first.BETTER_AUTH_SECRET);
 assert.equal(await readFile(path.join(app,'data','upload.txt'),'utf8'),'kept');
 assert.equal((await stat(path.join(first.CUBE_APP_DATA_DIR,'auth-secret'))).mode & 0o777,0o600);
 assert.equal(await realpath(path.join(app,'plans')),path.join(first.CUBE_APP_DATA_DIR,'plans'));
});
test('never replaces existing data with checkout seed files',async t=>{
 const {app,env}=await fixture(t); const runtime=await prepareRuntime(app,env);
 await writeFile(path.join(app,'data','saved'),'original');
 await rm(path.join(app,'data')); await mkdir(path.join(app,'data')); await writeFile(path.join(app,'data','saved'),'replacement');
 await assert.rejects(prepareRuntime(app,env), /existing/);
 assert.equal(await readFile(path.join(runtime.CUBE_APP_DATA_DIR,'data','saved'),'utf8'),'original');
});
test('migrates seeded state across filesystems',async t=>{
 const {app,env}=await fixture(t);
 const persistent=await mkdtemp(path.join(process.cwd(),'.tmp-cross-device-'));
 t.after(()=>rm(persistent,{recursive:true,force:true}));
 if((await stat(app)).dev===(await stat(persistent)).dev){t.skip('requires two filesystems');return;}
 await mkdir(path.join(app,'.agent-native'));await writeFile(path.join(app,'.agent-native','state'),'seed');
 await prepareRuntime(app,{...env,XDG_DATA_HOME:persistent});
 assert.equal(await readFile(path.join(app,'.agent-native','state'),'utf8'),'seed');
});
test('updates replace generated build configuration without losing agent state',async t=>{
 const {app,env}=await fixture(t);await prepareRuntime(app,env);
 await writeFile(path.join(app,'.agent-native','build-config.json'),'old build');
 await writeFile(path.join(app,'.agent-native','memory'),'keep');
 await rm(path.join(app,'.agent-native'));await mkdir(path.join(app,'.agent-native'));
 await writeFile(path.join(app,'.agent-native','build-config.json'),'new build');
 await prepareRuntime(app,env);
 assert.equal(await readFile(path.join(app,'.agent-native','build-config.json'),'utf8'),'new build');
 assert.equal(await readFile(path.join(app,'.agent-native','memory'),'utf8'),'keep');
});
