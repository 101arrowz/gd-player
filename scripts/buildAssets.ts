import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

// assets dir
const asd = join(__dirname, '..', 'src', 'assets');

const to = (...paths: string[]) => join(asd, ...paths);
// resources dir
const rsd = process.env.GD_DIR || (process.platform == 'win32'
  ? join('C:', 'Program Files (x86)', 'Steam', 'steamapps', 'common', 'Geometry Dash', 'Resources')
  : process.platform == 'darwin'
    ? join(process.env.HOME, 'Library', 'Application Support', 'Steam', 'steamapps', 'common', 'Geometry Dash', 'Geometry Dash.app', 'Contents', 'Resources')
    : join(process.env.HOME, '.steam', 'steam', 'steamapps', 'common', 'Geometry Dash', 'Resources'));
if (!existsSync(rsd)) throw new Error("Couldn't find the Geometry Dash directory. Please set the GD_DIR environment variable to the path to the GD resources folder.");


for (const dir of ['.', 'fonts', 'sprites']) {
  const td = to(dir);
  if (!existsSync(td)) mkdirSync(td);
}

const fntMap: Record<string, string> = {
  gold: 'gold',
  chat: 'chat',
  big: 'base'
};

const from = (p: string) => join(rsd, p);

for (const f of readdirSync(rsd)) {
  const en = extname(f);
  if (en == '.fnt') {
    const nm = f.slice(0, -4);
    if (nm.endsWith('-uhd')) {
      const bn = nm.slice(0, -4).replace(/((gj)?)Font/, '');
      const imgNm = bn + '.png';
      const dat = readFileSync(from(f), 'utf-8');
      const splt = dat.split('\n').map(v => v.replace(/\s\s+/g, ' '));
      splt[0] = splt[0].replace(/face="(.*)/, 'face="' + (fntMap[bn] || ('f' + parseInt(bn))) + '"') + ' size=24';
      splt[1] = splt[1].replace(/ base=(.*)/, '');
      splt[2] = splt[2].replace(/file="(.*)/, 'file="' + imgNm + '"');
      const tc = parseInt(splt[3].slice(12)) + 4;
      for (let i = 3; i < tc; ++i) {
        splt[i] = splt[i].replace(/ chnl=(.*)"/, '');
      }
      writeFileSync(to('fonts', bn + '.fnt'), splt.join('\n'));
      copyFileSync(from(nm + '.png'), to('fonts', imgNm));
    }
  }
}