import {spawnSync} from 'node:child_process';
if(Number(process.versions.node.split('.')[0])<22) throw new Error('This app requires Node.js 22 or newer.');
for(const [command,args] of [['npm',['exec','--yes','--package=pnpm@10.29.1','--','pnpm','install','--frozen-lockfile']],[process.execPath,['cube/build.mjs']]]){
 const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,NODE_ENV:'development'}});
 if(result.error) throw result.error;
 if(result.status!==0) process.exit(result.status??1);
}
