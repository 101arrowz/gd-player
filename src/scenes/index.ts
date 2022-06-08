import { Container, Sprite, Texture } from 'pixi.js';
import { BaseSpriteMap } from './scene';
import loading from './loading';
import home from './home';
import level from './level';
import { renderer } from '../util';

const scenes = {
  loading,
  home,
  level
};

// Limitation of TS does not allow us to do this normally
export type SceneName = 'loading' | 'home' | 'level';

let scene: SceneName = 'loading';

type Intersect<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;


let sprites: BaseSpriteMap;
Promise.resolve(scenes[scene].init()).then((sp) => {
  sprites = sp;
});


let onRender: ((stage: Container, delta: number) => void) | null = (stage) => {
  if (sprites) {
    scenes[scene].render(
      sprites as Intersect<Parameters<typeof scenes[typeof scene]['render']>[0]>,
      0
    );
    stage.addChild.apply(stage, Object.values(sprites));
    stage.sortChildren();
    onRender = null;
  }
};

export default (stage: Container, delta: number): void => {
  if (onRender) {
    onRender(stage, delta);
    return;
  }
  const next = scenes[scene].render(
    sprites as Intersect<Parameters<typeof scenes[typeof scene]['render']>[0]>,
    delta
  );
  if (next) {
    scene = next;
    let tol = 200;
    const blackSprite = new Sprite(Texture.fromBuffer(new Uint8Array([0, 0, 0, 255]), 1, 1));
    blackSprite.alpha = 0;
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
        Promise.resolve(scenes[scene].init()).then(async (sp) => {
          await new Promise(resolve => renderer.plugins.prepare.upload(resolve));
          let tl = 200;
          scenes[scene].render(sp as Intersect<Parameters<typeof scenes[typeof scene]['render']>[0]>, 0);
          stage.addChild.apply(stage, Object.values(sp));
          stage.sortChildren();
          stage.addChild(blackSprite);
          onRender = (_, d) => {
            d = Math.min(d, tl);
            tl -= d;
            blackSprite.alpha -= d / 200;
            if (!tl) {
              stage.removeChild(blackSprite);
              sprites = sp;
              onRender = null;
            }
          };
        });
      }
    };
  }
};
