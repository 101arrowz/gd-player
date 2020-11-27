import { Spritesheet, Texture } from 'pixi.js';
import dl, { ProgressHandler } from './dl';
import * as ss1 from '../assets/spritesheets/1.json';
import * as ss2 from '../assets/spritesheets/2.json';
import * as ss3 from '../assets/spritesheets/3.json';
import * as ss4 from '../assets/spritesheets/4.json';
import * as ssga from '../assets/spritesheets/gauntlet.json';
import * as ssgl from '../assets/spritesheets/glow.json';
import * as ssla from '../assets/spritesheets/launch.json';

const sheetMeta = {
  1: ss1,
  2: ss2,
  3: ss3,
  4: ss4,
  gauntlet: ssga,
  glow: ssgl,
  launch: ssla
};

type Sheet = keyof typeof sheetMeta;

const textures: Record<string, Texture> = {}

const sheetURL = (sheet: string | number) => 'spritesheets/' + sheet + '.png';

export const freshLoad = <T extends Sheet[]>(sheets: [...T], onProgress?: ProgressHandler) => 
  (onProgress
    ? dl(sheets.map(sheetURL), onProgress).map(p => p.then(buf => {
        const url = URL.createObjectURL(
          new Blob([buf], { type: 'image/png' })
        );
        return Texture.fromURL(url);
      }))
    : sheets.map(s => Texture.fromURL(sheetURL(s)))    
  ).map((p, i) => p.then(t => {
    const sheet = sheets[i];
    const ss = new Spritesheet(t, sheetMeta[sheet]);
    for (const k in ss.textures) {
      textures[k.slice(0, -4)] = ss.textures[k];
    }
    delete sheetMeta[sheet];
  })) as { [K in keyof T]: Promise<void> };

export const load = (sheets: Sheet[], onProgress: ProgressHandler) =>
  Promise.all(freshLoad(sheets.filter(s => sheetMeta[s]), onProgress)) as unknown as Promise<void>;

export default textures;