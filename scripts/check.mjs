import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['assets/amsterdam-heerlen.css','assets/amsterdam-heerlen.js','assets/amsterdam-regulations.css','assets/amsterdam-regulations-data.js','assets/amsterdam-regulations.js','apply-design.mjs','preview.cjs'];
for(const file of files){
 const absolute=path.join(root,file);
 if(!fs.statSync(absolute).isFile())throw Error('Bestand ontbreekt: '+file);
 if(/\.(?:js|mjs|cjs)$/.test(file)){
  const result=spawnSync(process.execPath,['--check',absolute],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr||'Ongeldige JavaScript: '+file);
 }
}
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/amsterdam-regulations-data.js'),'utf8'),context,{timeout:1000});
const data=context.window.AMRP_REGULATIONS_DATA;
if(data.rules.length!==65||data.general.length!==9||data.discord.length!==10||data.sanctions.length!==11)throw Error('De overgenomen regelgeving is niet compleet.');
console.log('Ontwerpbestanden en JavaScript gecontroleerd; 65 APV-artikelen, 11 strafcategorieën, 9 algemene regels en 10 Discord-regels aanwezig.');
