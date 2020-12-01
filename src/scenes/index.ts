import { Container, Sprite, Texture } from 'pixi.js';
import loading from './loading';
import home from './home';

const scenes = {
  loading,
  home,
};

// Limitation of TS does not allow us to do this normally
export type SceneName = 'loading' | 'home';

let scene: SceneName = 'loading';

let sprites: Parameters<typeof scenes[typeof scene]['render']>[0];
const blackSprite = new Sprite(
  Texture.fromBuffer(new Uint8Array([0, 0, 0, 255]), 1, 1)
);
blackSprite.alpha = 0;
Promise.resolve(scenes[scene].init()).then((sp) => {
  sprites = sp;
});

let onRender: ((stage: Container, delta: number) => void) | null = (stage) => {
  if (sprites) {
    scenes[scene].render(sprites, 0);
    for (const i in sprites) {
      stage.addChild(sprites[i as keyof typeof sprites]);
    }
    onRender = null;
  }
};

export default (stage: Container, delta: number): void => {
  if (onRender) {
    onRender(stage, delta);
    return;
  }
  const next = scenes[scene].render(sprites, delta);
  if (next) {
    scene = next;
    let tol = 200;
    stage.addChild(blackSprite);
    blackSprite.width = window.innerWidth;
    blackSprite.height = window.innerHeight;
    onRender = (stage, d) => {
      blackSprite.width = window.innerWidth;
      blackSprite.height = window.innerHeight;
      d = Math.min(d, tol);
      tol -= d;
      blackSprite.alpha += d / 200;
      if (!tol) {
        stage.removeChildren();
        onRender = () => {};
        Promise.resolve(scenes[scene].init()).then((sp) => {
          let tl = 200;
          scenes[scene].render(sp as typeof sprites, 0);
          for (const i in sp) {
            stage.addChild(sp[i as keyof typeof sp]);
          }
          stage.addChild(blackSprite);
          onRender = (_, d) => {
            d = Math.min(d, tl);
            tl -= d;
            blackSprite.alpha -= d / 200;
            if (!tl) {
              stage.removeChild(blackSprite);
              sprites = sp as typeof sprites;
              onRender = null;
            }
          };
        });
      }
    };
  }
};
