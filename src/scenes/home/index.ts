import Scene from '../scene';
import { textures } from '../../util';
import { Background, Button, GroundTile } from '../../entities';
import { Sprite } from 'pixi.js';

const offsetB = Math.PI * 2 / 3;
const offsetG = 2 * offsetB;
let timeElapsed: number;
let clickedPlay = false;

const rgbCycleC = (time: number, offset: number) => {
  const rat = Math.sin(time + offset);
  return (rat > 0 ? Math.sqrt(rat) : -Math.sqrt(-rat)) * 127 + 128;
}

const rgbCycle = (time: number) => (rgbCycleC(time, 0) << 16) | (rgbCycleC(time, offsetG) << 8) | rgbCycleC(time, offsetB);

export default new Scene({
  init: () => {
    clickedPlay = false;
    timeElapsed = -2000;
    const bg = new Background(1, 0.1);
    const groundTile = new GroundTile(1, 1);
    const logo = new Sprite(textures.logoGD);
    logo.anchor.set(0.5);
    const play = new Button(textures.btnPlay, () => clickedPlay = true);
    return {
      bg,
      logo,
      play,
      groundTile 
    };
  },
  render({ bg, groundTile, logo, play }, delta) {
    timeElapsed += delta;
    groundTile.tint = bg.tint = rgbCycle(timeElapsed / 8000);
    bg.update(delta);
    groundTile.update(delta);
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
    if (clickedPlay) return 'level'
  },
});
