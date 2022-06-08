import { Spritesheet, Texture, BitmapFont, MIPMAP_MODES } from 'pixi.js';
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
import multiProgress from './multiProgress';
import renderer from './renderer';

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
  explosion16,
};

export type Sheet = keyof typeof sheetMeta;

export const textures: Record<string, Texture> = {};

const loadTextures = (
  urls: string[],
  onProgress?: ProgressHandler
): Promise<Texture>[] =>
  onProgress
    ? dl(urls, onProgress).map((p) =>
        p.then(async (buf) => {
          const url = URL.createObjectURL(
            new Blob([buf], { type: 'image/png' })
          );
          const tt = await Texture.fromURL(url);
          URL.revokeObjectURL(url);
          renderer.plugins.prepare.add(tt);
          return tt;
        })
      )
    : urls.map(async url => {
      const tt = await Texture.fromURL(url);
      renderer.plugins.prepare.add(tt);
      return tt;
    });

export const loadSheets = (
  sheets: Sheet[],
  onProgress?: ProgressHandler
): Promise<void> => {
  const meta: Partial<Record<Sheet, unknown>> = {};
  for (let i = 0; i < sheets.length; ++i) {
    const sheet = sheets[i];
    const sm = sheetMeta[sheet];
    if (sm) {
      meta[sheet] = sm;
      delete sheetMeta[sheet];
    } else sheets.splice(i--);
  }
  return Promise.all(loadTextures(
    sheets.map(s => 'spritesheets/' + s + '.png'),
    onProgress
  ).map(async (p, i) => {
    const t = await p;
    const sheet = sheets[i];
    const ss = new Spritesheet(t, meta[sheet]);
    await new Promise((res) => ss.parse(res));
    for (const k in ss.textures) {
      textures[k.slice(0, -4)] = ss.textures[k];
    }
  })).then();
}

export type BG =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export const backgrounds = {} as Record<BG, Texture>;

export const loadBGs = (
  bgs: BG[],
  onProgress?: ProgressHandler
): Promise<void> =>
  Promise.all(
    loadTextures(
      bgs
        .filter((bg) => !backgrounds[bg])
        .map((bg) => 'backgrounds/' + bg + '.png'),
      onProgress
    ).map((p, i) =>
      p.then((t) => {
        t.baseTexture.mipmap = MIPMAP_MODES.OFF;
        backgrounds[bgs[i]] = t;
      })
    )
  ).then();

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
  gold: fgold,
};

export type Font = keyof typeof fontMeta;

export const loadFonts = (
  fonts: Font[],
  onProgress?: ProgressHandler
): Promise<void> => {
  fonts = fonts.filter((f) => fontMeta[f]);
  return Promise.all(
    loadTextures(
      fonts.map((f) => 'fonts/' + f + '.png'),
      onProgress
    ).map((p, i) =>
      p.then((t) => {
        const font = fonts[i];
        BitmapFont.install(fontMeta[font], t);
        delete fontMeta[font];
      })
    )
  ).then();
};

export type GroundTile =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17;

export const groundTiles = {} as Record<GroundTile, [Texture, Texture | null]>;

export const loadGroundTiles = (
  tiles: GroundTile[],
  onProgress?: ProgressHandler
): Promise<void> => {
  tiles = tiles.filter((t) => !groundTiles[t]);
  const toLoad: string[] = [];
  for (const tile of tiles) {
    toLoad.push('groundtiles/' + tile + '.png');
    if (tile > 7) {
      toLoad.push('groundtiles/' + tile + '.2.png');
    }
  }
  return Promise.all(loadTextures(toLoad, onProgress))
    .then((ts) => {
      for (let i = 0, bk = 0; i < ts.length; ++i) {
        const tile = tiles[i - bk];
        ts[i].baseTexture.mipmap = MIPMAP_MODES.OFF;
        groundTiles[tile] = [ts[i], tile > 7 ? (++bk, ts[++i].baseTexture.mipmap = MIPMAP_MODES.OFF, ts[i]) : null];
      }
    })
    .then();
};

export type Slider = 0 | 1;

export const sliders = {} as Record<Slider, [Texture, Texture]>;

export const loadSliders = (
  sls: Slider[],
  onProgress?: ProgressHandler
): Promise<void> => {
  sls = sls.filter((s) => !sliders[s]);
  const toLoad = Array<string>(sls.length * 2);
  for (let i = 0; i < sls.length; ++i) {
    const slider = sls[i];
    toLoad[i * 2] = 'sliders/' + slider + '.png';
    toLoad[i * 2 + 1] = 'sliders/' + slider + '.groove.png';
  }
  return Promise.all(loadTextures(toLoad, onProgress)).then((ts) => {
    for (let i = 0; i < ts.length; i += 2) {
      ts[i].baseTexture.mipmap = MIPMAP_MODES.OFF;
      sliders[sls[i >> 1]] = [ts[i + 1], ts[i]];
    }
  });
};

export const raw = {} as Record<string, ArrayBuffer>;

export const loadRaw = (
  urls: string[],
  onProgress?: ProgressHandler
): Promise<void> => {
  urls = urls.filter((t) => !raw[t]);
  return Promise.all(dl(urls, onProgress)).then((ts) => {
    for (let i = 0; i < ts.length; ++i) {
      raw[urls[i]] = ts[i];
    }
  });
};

export type MultiLoad = {
  sheets?: Sheet[];
  bgs?: BG[];
  fonts?: Font[];
  groundTiles?: GroundTile[];
  sliders?: Slider[];
  raw?: string[];
};

export const multiLoad = (
  { sheets, bgs, fonts, groundTiles, sliders, raw }: MultiLoad,
  onProgress?: ProgressHandler
): Promise<void> => {
  const createProgress = onProgress
    ? multiProgress(onProgress)
    : ((() => {}) as () => undefined);
  const proms: Promise<unknown>[] = [];
  if (sheets) proms.push(loadSheets(sheets, createProgress()));
  if (bgs) proms.push(loadBGs(bgs, createProgress()));
  if (fonts) proms.push(loadFonts(fonts, createProgress()));
  if (groundTiles) proms.push(loadGroundTiles(groundTiles, createProgress()));
  if (sliders) proms.push(loadSliders(sliders, createProgress()));
  if (raw) proms.push(loadRaw(raw, createProgress()));
  return Promise.all(proms).then();
};
