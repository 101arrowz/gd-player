import Scene from '../scene';
import { backgrounds, groundTiles, textures } from '../../util';
import { Background, Button } from '../../entities';
import { Sprite, TilingSprite } from 'pixi.js';

const offsetB = Math.PI * 2 / 3;
const offsetG = 2 * offsetB;
let timeElapsed: number;

const rgbCycleC = (time: number, offset: number) => {
  const rat = Math.sin(time + offset);
  return (rat > 0 ? Math.sqrt(rat) : -Math.sqrt(-rat)) * 127 + 128;
}

const rgbCycle = (time: number) => (rgbCycleC(time, 0) << 16) | (rgbCycleC(time, offsetG) << 8) | rgbCycleC(time, offsetB);

export default new Scene({
  init: () => {
    timeElapsed = -2000;
    const bg = new Background(1, 0.1);
    const groundTile = new TilingSprite(groundTiles[1][0]);
    const logo = new Sprite(textures.logoGD);
    logo.anchor.set(0.5);
    const play = new Button(textures.btnPlay, () => console.log('pressed!'));
    return {
      bg,
      logo,
      play,
      groundTile 
    };
  },
  render({ bg, groundTile, logo, play }, delta) {
    bg.update(delta);
    timeElapsed += delta;
    groundTile.tint = bg.tint = rgbCycle(timeElapsed / 8000);
    groundTile.scale.set(window.innerHeight / 1100);
    groundTile.y = window.innerHeight - 300 * groundTile.scale.y;
    groundTile.width = window.innerWidth / groundTile.scale.x + 40;
    groundTile.height = groundTile.texture.height;
    groundTile.tilePosition.x -= delta * 1.25;
    logo.scale.set(
      Math.min(window.innerWidth / 2400, window.innerHeight / 1400)
    );
    logo.x = window.innerWidth / 2;
    logo.y = logo.texture.height * logo.scale.y * 1.25;
    play.scale.set(
      Math.min(window.innerWidth / 1600, window.innerHeight / 1200)
    );
    play.x = window.innerWidth / 2;
    play.y = window.innerHeight / 2;
    play.update(delta);
  },
});
