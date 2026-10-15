import {cp,readFile,writeFile,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [source,cli,output]=process.argv.slice(2);
if(!source||!cli||!output) throw new Error('Usage: node scripts/scaffold.mjs UPSTREAM CORE_CREATE_JS OUTPUT');
const c=await import(pathToFileURL(path.resolve(cli)).href);
const names=['design','slides','analytics','calendar','clips','mail','assets','content','dispatch','forms','plan'];
for(const app of names){
 const name=`cube-agent-${app==='plan'?'plans':app}`, dest=path.join(output,name);
 if(await access(path.join(dest,'package.json')).then(()=>true,()=>false)) {console.log('Exists',name);continue;}
 c._copyDir(path.join(source,'templates',app),dest);
 c._removeWorkspaceOnlyTemplateWiring(dest);
 c._postProcessStandalone(name,dest,app,{templateSource:'github',templateRef:'@agent-native/core@0.209.0'});
 await writeFile(path.join(dest,'UPSTREAM.json'),JSON.stringify({repository:'https://github.com/BuilderIO/agent-native',revision:'6ac757a5ea3181158904e832f7a0a6c47c3694dd',path:`templates/${app}`,core:'0.209.0'},null,2)+'\n');
 console.log('Scaffolded',name);
}
