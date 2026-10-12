// contact sheet: numbered thumbnails
import sharp from 'sharp';
import fs from 'node:fs'; import path from 'node:path';
const [dir, out, cols=8, cell=220] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f=>/\.(jpe?g|png)$/i.test(f)).sort();
const C=+cols, S=+cell, rows=Math.ceil(files.length/C);
const comps=[];
for (const [i,f] of files.entries()) {
  const buf = await sharp(path.join(dir,f)).rotate().resize(S-8,S-28,{fit:'inside'}).jpeg({quality:70}).toBuffer();
  const m = await sharp(buf).metadata();
  const x=(i%C)*S+4+Math.floor((S-8-m.width)/2), y=Math.floor(i/C)*S+4;
  comps.push({input:buf,left:x,top:y});
  const label = Buffer.from(`<svg width="${S}" height="22"><text x="4" y="16" font-size="14" font-family="sans-serif" fill="#fff">${f.slice(0,3)} ${f.slice(4,22).replace(/&/g,'')}</text></svg>`);
  comps.push({input:label,left:(i%C)*S,top:Math.floor(i/C)*S+S-24});
}
await sharp({create:{width:C*S,height:rows*S,channels:3,background:'#222'}}).composite(comps).jpeg({quality:72}).toFile(out);
console.log(out, files.length);
