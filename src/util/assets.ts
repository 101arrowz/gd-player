import { Spritesheet, Texture, BitmapFont } from 'pixi.js';
import dl, { ProgressHandler } from './dl';
import * as ss1 from '../assets/spritesheets/1.json';
import * as ss2 from '../assets/spritesheets/2.json';
import * as ss3 from '../assets/spritesheets/3.json';
import * as ss4 from '../assets/spritesheets/4.json';
import * as ssfi from '../assets/spritesheets/fire.json';
import * as ssga from '../assets/spritesheets/gauntlet.json';
import * as ssgl from '../assets/spritesheets/glow.json';
import * as ssla from '../assets/spritesheets/launch.json';
import * as explosion1 from '../assets/spritesheets/explosion1.json';
import * as explosion2 from '../assets/spritesheets/explosion2.json';
import * as explosion3 from '../assets/spritesheets/explosion3.json';
import * as explosion4 from '../assets/spritesheets/explosion4.json';
import * as explosion5 from '../assets/spritesheets/explosion5.json';
import * as explosion6 from '../assets/spritesheets/explosion6.json';
import * as explosion7 from '../assets/spritesheets/explosion7.json';
import * as explosion8 from '../assets/spritesheets/explosion8.json';
import * as explosion9 from '../assets/spritesheets/explosion9.json';
import * as explosion10 from '../assets/spritesheets/explosion10.json';
import * as explosion11 from '../assets/spritesheets/explosion11.json';
import * as explosion12 from '../assets/spritesheets/explosion12.json';
import * as explosion13 from '../assets/spritesheets/explosion13.json';
import * as explosion14 from '../assets/spritesheets/explosion14.json';
import * as explosion15 from '../assets/spritesheets/explosion15.json';
import * as explosion16 from '../assets/spritesheets/explosion16.json';
import f1 from 'bundle-text:../assets/fonts/1.fnt';
import f2 from 'bundle-text:../assets/fonts/2.fnt';
import f3 from 'bundle-text:../assets/fonts/3.fnt';
import f4 from 'bundle-text:../assets/fonts/4.fnt';
import f5 from 'bundle-text:../assets/fonts/5.fnt';
import f6 from 'bundle-text:../assets/fonts/6.fnt';
import f7 from 'bundle-text:../assets/fonts/7.fnt';
import f8 from 'bundle-text:../assets/fonts/8.fnt';
import f9 from 'bundle-text:../assets/fonts/9.fnt';
import f10 from 'bundle-text:../assets/fonts/10.fnt';
import f11 from 'bundle-text:../assets/fonts/11.fnt';
import fbase from 'bundle-text:../assets/fonts/base.fnt';
import fchat from 'bundle-text:../assets/fonts/chat.fnt';
import fgold from 'bundle-text:../assets/fonts/gold.fnt';

const sheetMeta = {
  1: ss1,
  2: ss2,
  3: ss3,
  4: ss4,
  fire: ssfi,
  gauntlet: ssga,
  glow: ssgl,
  launch: ssla,
  explosion1,
  explosion2,
  explosion3,
  explosion4,
  explosion5,
  explosion6,
  explosion7,
  explosion8,
  explosion9,
  explosion10,
  explosion11,
  explosion12,
  explosion13,
  explosion14,
  explosion15,
  explosion16
};

type Sheet = keyof typeof sheetMeta;

export const textures: Record<string, Texture> = {}

const loadTextures = (urls: string[], onProgress?: ProgressHandler) => onProgress
  ? dl(urls, onProgress).map(p => p.then(buf => {
      const url = URL.createObjectURL(
        new Blob([buf], { type: 'image/png' })
      );
      return Texture.fromURL(url);
    }))
  : urls.map(Texture.fromURL);

export const freshLoadSheet = <T extends Sheet[]>(sheets: [...T], onProgress?: ProgressHandler) => 
  loadTextures(sheets.map(sheet => 'spritesheets/' + sheet + '.png')).map((p, i) => p.then(t => {
    const sheet = sheets[i];
    const ss = new Spritesheet(t, sheetMeta[sheet]);
    for (const k in ss.textures) {
      textures[k.slice(0, -4)] = ss.textures[k];
    }
    delete sheetMeta[sheet];
  })) as { [K in keyof T]: Promise<void> };

export const loadSheet = (sheets: Sheet[], onProgress: ProgressHandler) =>
  Promise.all(freshLoadSheet(sheets.filter(s => sheetMeta[s]), onProgress));

type BG = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export const backgrounds = {} as Record<BG, Texture>;

export const loadBGs = (bgs: BG[], onProgress?: ProgressHandler) =>
  Promise.all(
    loadTextures(
      bgs.filter(bg => !backgrounds[bg]).map(bg => 'backgrounds/' + bg + '.png'),
      onProgress
    ).map((p, i) => p.then(t => {
      backgrounds[bgs[i]] = t;
    }))
  );

const fontMeta = {
  1: f1,
  2: f2,
  3: f3,
  4: f4,
  5: f5,
  6: f6,
  7: f7,
  8: f8,
  9: f9,
  10: f10,
  11: f11,
  base: fbase,
  chat: fchat,
  gold: fgold
};

type Font = keyof typeof fontMeta;

export const loadFonts = (fonts: Font[]) => {
  fonts = fonts.filter(f => fontMeta[f]);
  Promise.all(
    loadTextures(fonts.map(f => 'fonts/' + f + '.png'))
      .map((p, i) => p.then(t => {
        const font = fonts[i];
        BitmapFont.install(fontMeta[font], t);
        delete fontMeta[font];
      }))
  );
}


type GroundTile = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export const groundTiles = {} as Record<GroundTile, [Texture, Texture | null]>;

export const loadGroundTiles = (tiles: GroundTile[], onProgress?: ProgressHandler) => {
  tiles = tiles.filter(t => !groundTiles[t]);
  const toLoad: string[] = [];
  for (const tile of tiles) {
    toLoad.push('groundtiles/' + tile + '.png');
    if (tile > 7) {
      toLoad.push('groundtiles/' + tile + '.2.png');
    }
  }
  return Promise.all(loadTextures(toLoad, onProgress)).then(ts => {
    for (let i = 0, bk = 0; i < ts.length; ++i) {
      const tile = tiles[i - bk];
      groundTiles[tile] = [ts[i], tile > 7 ? (++bk, ts[++i]) : null];
    }
  });
}

type Slider = 0 | 1;

export const sliders = {} as Record<Slider, [Texture, Texture]>;

export const loadSliders = (sls: Slider[], onProgress?: ProgressHandler) => {
  sls = sls.filter(s => !sliders[s]);
  const toLoad = Array<string>(sls.length * 2);
  for (let i = 0; i < sls.length; ++i) {
    const slider = sls[i];
    toLoad[i * 2] = 'sliders/' + slider + '.png';
    toLoad[i * 2 + 1] = 'sliders/' + slider + '.groove.png';
  }
  return Promise.all(loadTextures(toLoad, onProgress)).then(ts => {
    for (let i = 0; i < ts.length; i += 2) {
      sliders[sls[i >> 1]] = [ts[i], ts[i + 1]];
    }
  });
}