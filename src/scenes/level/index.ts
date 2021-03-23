import Scene, { BaseSpriteMap } from '../scene';
import { backgrounds, groundTiles, textures, gd } from '../../util';
import { Background, Level } from '../../entities';
import { Sprite, TilingSprite, Texture } from 'pixi.js';

export default new Scene({
  init: async () => {
    const level = await gd.levels.get(+(prompt('Level ID:') || 2577156), true);
    const out = {
      level: await Level.create(level)
    };
    return out;
  },
  render({ level }, delta) {
    level.update(delta);
  },
});
