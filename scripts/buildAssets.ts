import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from 'fs';
import { oidMap, btnMap, modeMap, launchMap, fntMap } from './maps';
import { join, extname } from 'path';
import { parse } from 'plist';

type PixiSpriteSheetFrame = {
  frame: { x: number; y: number; w: number; h: number };
  rotated?: true;
  sourceSize?: { w: number; h: number };
};

type PixiSpriteSheet = {
  frames: Record<string, PixiSpriteSheetFrame>;
  animations?: Record<string, string[]>;
  meta: Record<string, unknown>;
};
// assets dir
const asd = join(__dirname, '..', 'src', 'assets');
const to = (...paths: string[]) => join(asd, ...paths);
// resources dir
const rsd =
  process.env.GD_DIR ||
  (process.platform == 'win32'
    ? join(
        'C:',
        'Program Files (x86)',
        'Steam',
        'steamapps',
        'common',
        'Geometry Dash',
        'Resources'
      )
    : process.platform == 'darwin'
    ? join(
        process.env.HOME!,
        'Library',
        'Application Support',
        'Steam',
        'steamapps',
        'common',
        'Geometry Dash',
        'Geometry Dash.app',
        'Contents',
        'Resources'
      )
    : join(
        process.env.HOME!,
        '.steam',
        'steam',
        'steamapps',
        'common',
        'Geometry Dash',
        'Resources'
      ));
if (!existsSync(rsd))
  throw new Error(
    "Couldn't find the Geometry Dash directory. Please set the GD_DIR environment variable to the path to the GD resources folder."
  );

const from = (p: string) => join(rsd, p);

type GJSpriteSheet = {
  frames: Record<
    string,
    {
      spriteOffset: string;
      spriteSize: string;
      spriteSourceSize: string;
      textureRect: string;
      textureRotated: boolean;
    }
  >;
  metadata: {
    size: string;
    realTextureFileName: string;
  };
};

type SSV = number[] | SSV[];

const parseSSV = (v: string): SSV =>
  JSON.parse(v.replace(/{/g, '[').replace(/}/g, ']'));

const build = () => {
  for (const dir of [
    '.',
    'fonts',
    'spritesheets',
    'backgrounds',
    'groundtiles',
    'sliders',
  ]) {
    const td = to(dir);
    if (!existsSync(td)) mkdirSync(td);
  }
  
  for (const f of readdirSync(rsd)) {
    const en = extname(f);
    if (en == '.fnt') {
      const nm = f.slice(0, -4);
      if (nm.endsWith('-uhd')) {
        const cln = nm.slice(0, -4).replace(/((gj)?)Font/, '');
        const bn = fntMap[cln] || +cln;
        const imgNm = bn + '.png';
        const dat = readFileSync(from(f), 'utf-8');
        const splt = dat.split('\n').map((v) => v.replace(/\s\s+/g, ' '));
        splt[0] =
          splt[0].replace(
            /face="(.*)/,
            'face="' + bn + '"'
          ) + ' size=24';
        splt[1] = splt[1].replace(/ base=(.*)/, '');
        splt[2] = splt[2].replace(/file="(.*)/, 'file="' + imgNm + '"');
        const tc = parseInt(splt[3].slice(12)) + 4;
        for (let i = 3; i < tc; ++i) {
          splt[i] = splt[i].replace(/ chnl=(.*)"/, '');
        }
        writeFileSync(to('fonts', bn + '.fnt'), splt.join('\n'));
        // TODO: try to optimize the PNG?
        copyFileSync(from(nm + '.png'), to('fonts', imgNm));
      }
    } else if (en == '.plist') {
      const nm = f.slice(0, -6);
      if (nm.endsWith('-uhd')) {
        const bn = nm.slice(0, -4);
        let c = '';
        if (bn.startsWith('PlayerExplosion'))
          c = to('spritesheets', 'explosion' + +bn.slice(16, 18));
        else if (bn.startsWith('GJ_GameSheet'))
          c = to(
            'spritesheets',
            bn[12] == 'G' ? 'glow' : (+bn.slice(12) || 1) + ''
          );
        else if (bn == 'GauntletSheet') c = to('spritesheets', 'gauntlet');
        else if (bn == 'FireSheet_01') c = to('spritesheets', 'fire');
        else if (bn == 'GJ_LaunchSheet') c = to('spritesheets', 'launch');
        if (c) {
          const pl = parse(readFileSync(from(f), 'utf-8')) as GJSpriteSheet;
          const out: PixiSpriteSheet = {
            frames: {},
            meta: {},
          };
          for (const k in pl.frames) {
            const fr = pl.frames[k];
            const [[x, y], [w, h]] = parseSSV(fr.textureRect) as [
              [number, number],
              [number, number]
            ];
            const s = parseSSV(fr.spriteSourceSize) as [number, number];
            const frame: PixiSpriteSheetFrame = { frame: { x, y, w, h } };
            // Don't you just love that PixiJS and Cocos2d-x both have spriteSourceSize, but it means different things in both?
            if (s[0] != w || s[1] != h) frame.sourceSize = { w: s[0], h: s[1] };
            if (fr.textureRotated) frame.rotated = true;
            let key = k.slice(0, -4),
              add = '';
            if (key != (key = key.replace('_glow', ''))) add = '.glow';
            else if (key != (key = key.replace('_shine', ''))) add = '.shine';
            if (oidMap[key]) {
              for (const v of oidMap[key]) out.frames[v + add + '.png'] = frame;
            } else if (btnMap[key])
              out.frames['btn' + btnMap[key] + '.png'] = frame;
            else if (launchMap[key])
              out.frames['logo' + launchMap[key] + '.png'] = frame;
            else if (key.endsWith('Btn_001')) {
              const tk = key.slice(0, -7).replace(/^(((GJ)|(gj))_)/, '');
              // Not perfect but I can't make a mapping for every single entity just yet. The idea is to come back to it when necessary.
              out.frames[
                'btn' +
                  tk.replace(/(^.)|(_[a-zA-Z])/g, (c) =>
                    (c[1] || c[0]).toUpperCase()
                  ) +
                  '.png'
              ] = frame;
            } else if (key.startsWith('playerDash2_boom2'))
              out.frames['dashBoom' + +key.slice(-3) + '.png'] = frame;
            else if (key.startsWith('playerDash2'))
              out.frames[
                'dash' +
                  +key.slice(-3) +
                  (key.slice(-10, -3) == 'outline' ? '.glow' : '') +
                  '.png'
              ] = frame;
            else if (key.startsWith('spiderDash'))
              out.frames['spiderDash' + +key.slice(-3) + '.png'] = frame;
            else if (key.startsWith('playerExplosion'))
              out.frames[
                'explosion' + +key.slice(16, 18) + '.' + +key.slice(-3) + '.png'
              ] = frame;
            else if (
              /^((bird)|(dart)|(player((_ball)?))|(robot)|(ship)|(spider))/.test(
                key
              )
            ) {
              const ki = key.indexOf('_', key.startsWith('player_ball') ? 11 : 0),
                nm = modeMap[key.slice(0, ki)],
                tk = key
                  .slice(ki + 1)
                  .split('_')
                  .slice(0, -1);
              const i = /^((robot)|(spider))/.test(key);
              out.frames[
                nm +
                  +tk[0] +
                  (i && tk[1] ? '.' + +tk[1] : add) +
                  (tk[1 + ((i as unknown) as number)]
                    ? '.' + +tk[1 + ((i as unknown) as number)]
                    : '') +
                  '.png'
              ] = frame;
            } else if (key.startsWith('portal')) {
              const b = key.indexOf('back') == -1,
                id =
                  oidMap[
                    b
                      ? key.replace('_001', '_front_001')
                      : key.replace('back', 'front')
                  ],
                add = b ? '.shine' : '.under';
              for (const k of id) out.frames[k + add + '.png'] = frame;
            }
          }
          copyFileSync(from(nm + '.png'), c + '.png');
          writeFileSync(c + '.json', JSON.stringify(out));
        }
      }
    } else if (en == '.png') {
      const nm = f.slice(0, -4);
      if (nm.endsWith('-uhd')) {
        const bn = nm.slice(0, -4);
        if (bn.startsWith('game_bg'))
          copyFileSync(from(f), to('backgrounds', +bn.slice(8, 10) + '.png'));
        else if (bn.startsWith('groundSquare'))
          copyFileSync(
            from(f),
            to(
              'groundtiles',
              +bn.slice(13, 15) +
                bn.slice(15, bn.lastIndexOf('_')).replace('_', '.') +
                '.png'
            )
          );
        else if (bn.startsWith('slider')) {
          const s = bn.slice(6);
          if (s.startsWith('Bar'))
            copyFileSync(from(f), to('sliders', (s.length - 3) + '.png'));
          else if (s.startsWith('groove') && s[6] != '_')
            copyFileSync(from(f), to('sliders', (s.length - 6) + '.groove.png'));
        }
      }
    }
  }  
}

if (require.main == module) build();

export default build;