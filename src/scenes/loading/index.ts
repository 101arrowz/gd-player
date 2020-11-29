import { Sprite, TilingSprite } from 'pixi.js';
import { textures, backgrounds, loadBGs, freshLoadSheet } from '../../util/assets';
import Scene from '../types';

export default new Scene({
  init: async () => {
    await Promise.all(freshLoadSheet([4, 'launch']).concat(loadBGs([1]) as unknown as Promise<void>));
    const bg = new TilingSprite(backgrounds[1], window.innerWidth, window.innerHeight);
    const logo = new Sprite(textures.logoGD);
    const robLogo = new Sprite(textures.logoRobTop);
    bg.tint = 0x006FFF;
    logo.anchor.set(0.5);
    robLogo.anchor.set(0.5)
    return {
      bg,
      logo,
      robLogo
    };
  },
  render({bg, logo, robLogo}) {
    bg.scale.set(window.innerHeight / 1100);
    logo.scale.set(window.innerWidth / 2200);
    robLogo.scale.set(window.innerWidth / 2400);
    bg.x = -40 * bg.scale.x;
    bg.y = -460 * bg.scale.y;
    bg.width = window.innerWidth / bg.scale.x + 40;
    bg.height = window.innerHeight - bg.y / bg.scale.y + 460;
    logo.x = window.innerWidth / 2;
    logo.y = window.innerHeight / 2.8 + window.innerWidth / 10;
    robLogo.x = window.innerWidth / 2;
    robLogo.y = window.innerHeight / 3.8
  }
});