import {cp,readFile,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const apps=process.argv.slice(2);
const versions={'@agent-native/core':'0.209.0','@agent-native/toolkit':'0.209.0','@agent-native/otel':'0.1.8','@agent-native/creative-context':'0.8.41','@agent-native/dispatch':'0.40.23','@agent-native/scheduling':'0.2.28'};
for(const directory of apps){
 const dest=path.resolve(directory), pkg=JSON.parse(await readFile(path.join(dest,'package.json'),'utf8'));
 const slug=pkg.name.replace('cube-agent-',''), app=slug==='plans'?'plan':slug;
 await cp('shared',dest,{recursive:true,filter:p=>!p.endsWith('.test.ts')});
 if(await access(`patches/${app}`).then(()=>true,()=>false))await cp(`patches/${app}`,dest,{recursive:true,filter:p=>!p.endsWith('.test.mjs')});
 for(const section of ['dependencies','devDependencies']) for(const name of Object.keys(pkg[section]||{})) if(versions[name])pkg[section][name]=versions[name];
 pkg.packageManager='pnpm@10.29.1';pkg.scripts['cube:build']='node cube/build.mjs';pkg.scripts['cube:start']='node cube/start.mjs';
 await writeFile(path.join(dest,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 let ws=await readFile(path.join(dest,'pnpm-workspace.yaml'),'utf8');
 if(!ws.includes('onlyBuiltDependencies:'))ws+='\nonlyBuiltDependencies:\n  - esbuild\n  - "@swc/core"\n  - node-pty\n  - ffmpeg-static\n';
 await writeFile(path.join(dest,'pnpm-workspace.yaml'),ws);
 const config=JSON.parse(await readFile(path.join(dest,'agent-native.json'),'utf8'));config.onboarding={...config.onboarding,firstRun:{development:'off',production:'off'}};config.deployment={...config.deployment,environment:'local'};config.runtime={...config.runtime,auth:{...config.runtime?.auth,enabled:false}};
 await writeFile(path.join(dest,'agent-native.json'),JSON.stringify(config,null,2)+'\n');
 const title=slug[0].toUpperCase()+slug.slice(1);
 await writeFile(path.join(dest,'cube.json'),JSON.stringify({name:`Agent-Native ${title}`,description:`${title} by Agent-Native, adapted for Cube with persistent local storage.`,icon:'public/favicon.svg',platforms:['linux','darwin'],install:'node cube/install.mjs',start:'node cube/start.mjs'},null,2)+'\n');
 await writeFile(path.join(dest,'UPSTREAM.json'),JSON.stringify({repository:'https://github.com/BuilderIO/agent-native',revision:'6ac757a5ea3181158904e832f7a0a6c47c3694dd',path:`templates/${app}`,core:'0.209.0'},null,2)+'\n');
 const ignore=path.join(dest,'.gitignore');
 const existingIgnore=await readFile(ignore,'utf8');
 if(!existingIgnore.includes('# Cube runtime state')) await writeFile(ignore,existingIgnore+'\n# Cube runtime state lives outside the checkout; these paths are symlinks.\n/data\n/.agent-native\n/media\n/plans\n/.deploy-tmp/\n');
 console.log('Integrated',pkg.name);
}
