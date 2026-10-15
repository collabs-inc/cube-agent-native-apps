import {spawn} from 'node:child_process';
import {open,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const [app,port,xdg,action]=process.argv.slice(2);
if(!action)throw new Error('Usage: node scripts/verify-runtime.mjs APP PORT XDG_DATA_HOME READ_ACTION');
const root=path.resolve(app),base=`http://127.0.0.1:${port}`;
await mkdir('.tmp',{recursive:true});
let child;
async function start(){
 const log=await open(`.tmp/${path.basename(root)}-runtime.log`,'a');
 child=spawn(process.execPath,['cube/start.mjs'],{cwd:root,env:{...process.env,PORT:port,XDG_DATA_HOME:xdg},stdio:['ignore',log.fd,log.fd]});
 await log.close();
 let ready=false;
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw new Error(`Server exited ${child.exitCode}`);
  try{const r=await fetch(base,{signal:AbortSignal.timeout(2000)});if(r.ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,500));
 }
 assert.ok(ready,'server ready');
 const health=await (await fetch(`${base}/_agent-native/ping?configuration=1&auth=0`)).json();
 assert.equal(health.configuration.ok,true,JSON.stringify(health));
 const r=await fetch(`${base}/_agent-native/actions/${action}`);
 assert.equal(r.status,200,await r.clone().text());
 return r.json();
}
async function stop(){
 const started=performance.now();const p=child;
 const exit=new Promise(resolve=>p.once('exit',(code,signal)=>resolve({code,signal})));
 p.kill('SIGHUP');
 const term=setTimeout(()=>p.kill('SIGTERM'),250);
 const force=setTimeout(()=>p.kill('SIGKILL'),2250);
 try {const result=await exit;assert.equal(result.code,0,JSON.stringify(result));return Math.round(performance.now()-started);}
 finally{clearTimeout(term);clearTimeout(force);child=null;}
}
try{
 const before=await start();const first=await stop();
 const after=await start();assert.deepEqual(after,before,'data survives restart');const second=await stop();
 const result={app:path.basename(root),passed:true,shutdownMs:[first,second],before,after};
 await writeFile(`.tmp/${path.basename(root)}-lifecycle.json`,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}finally{if(child)child.kill('SIGKILL');}
