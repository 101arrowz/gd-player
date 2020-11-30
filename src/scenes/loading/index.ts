import { Container, Sprite, TilingSprite } from 'pixi.js';
import { textures, backgrounds, sliders, multiLoad, MultiLoad } from '../../util/assets';
import { ProgressHandler } from '../../util/dl';
import Scene from '../types';

let resolvedBytes = 0, resolvedBytesTotal = 0;
let bytes = 0, bytesTotal = 1;
let resolved = false;
let ts: number;
let timesRun = 0;
let loadProm: Promise<unknown>;

const preloads: MultiLoad[] = [
  {  }
];

const onProgress: ProgressHandler = (b, bt) => {
  bytes = b;
  bytesTotal = bt;
}

export default new Scene({
  init: async () => {
    await multiLoad({
      sheets: ['launch'],
      bgs: [1],
      fonts: ['gold'],
      sliders: [0]
    });
    const bg = new TilingSprite(backgrounds[1], window.innerWidth, window.innerHeight);
    const logo = new Sprite(textures.logoGD);
    const robLogo = new Sprite(textures.logoRobTop);
    const slider = new Container();
    const sliderFill = new TilingSprite(sliders[0][1]);
    sliderFill.height = sliders[0][1].height;
    const sliderGroove = new Sprite(sliders[0][0]);
    slider.addChild(sliderFill, sliderGroove);
    bg.tint = 0x006FFF;
    logo.anchor.set(0.5);
    robLogo.anchor.set(0.5);
    sliderFill.anchor.set(0.5);
    sliderGroove.anchor.set(0.5);
    loadProm = multiLoad({
      sheets: [1, 2, 3, 4],
      groundTiles: [1],
      fonts: ['base', 'chat']
    }, onProgress).then(() => {
      resolved = true;
    });
    ts = Date.now();
    return {
      bg,
      logo,
      robLogo,
      slider
    };
  },
  render({bg, logo, robLogo, slider}) {
    bg.scale.set(window.innerHeight / 1100);
    logo.scale.set(Math.min(window.innerWidth / 2200, window.innerHeight / 1100));
    robLogo.scale.set(Math.min(window.innerWidth / 2400, window.innerHeight / 1200));
    bg.x = -40 * bg.scale.x;
    bg.y = -460 * bg.scale.y;
    bg.width = window.innerWidth / bg.scale.x + 40;
    bg.height = window.innerHeight / bg.scale.y + 460;
    logo.x = window.innerWidth / 2;
    logo.y = Math.min(window.innerHeight / 3 + window.innerWidth / 10, window.innerHeight / 2);
    robLogo.x = window.innerWidth / 2;
    robLogo.y = window.innerHeight / 4;
    const sliderFill = slider.children[0] as TilingSprite;
    sliderFill.width = ((slider.children[1] as Sprite).texture.width - 20) * (resolvedBytes + bytes * 0.9) / (resolvedBytesTotal + bytesTotal);
    slider.x = window.innerWidth / 2;
    slider.y = window.innerHeight / 1.5;
    if (resolved) {
      resolved = false;
      if (Date.now() - ts < 5000 && preloads[timesRun]) {
        loadProm = loadProm.then(async () => {
          resolvedBytes += bytes, bytes = 0;
          resolvedBytesTotal += bytesTotal, bytesTotal = 1;
          await multiLoad(preloads[timesRun], onProgress);
          ++timesRun;
          resolved = true;
        });
      } else {
        return 'loading';
      }
    }
  }
});