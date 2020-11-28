import { Container, Sprite } from 'pixi.js';
import { Init, Render } from './types';
import * as loading from './loading';

const scenes = {
  loading
}

export type Scene = keyof typeof scenes;

const scenesAssert: Record<Scene, {
  init: Init;
  render: Render;
}> = scenes;


let scene: Scene = 'loading';

let sprites: ReadonlyArray<Sprite>;

Promise.resolve(scenes[scene].init()).then(sp => {
  sprites = sp;
});

let onRender: ((stage: Container, delta: number) => void) | null = stage => {
  if (sprites) {
    stage.addChild.apply(stage, sprites as Sprite[]);
    onRender = null;
  }
};

export default (stage: Container, delta: number) => {
  if (onRender) {
    onRender(stage, delta);
    return;
  }
  const next = scenes[scene].render(sprites);
  if (next) {
    scene = next;
    let tol = 200;
    const opacs = sprites.map(s => s.alpha);
    onRender = (stage, d) => {
      d = Math.min(d, tol);
      tol -= d;
      for (let i = 0; i < sprites.length; ++i) {
        sprites[i].alpha -= d / 200 * opacs[i];
      }
      if (!tol) {
        stage.removeChild.apply(stage, sprites as Sprite[]);
        onRender = () => {};
        Promise.resolve(scenes[scene].init()).then(sp => {
          const opacs = sp.map(s => s.alpha);
          for (const s of sp) {
            s.alpha = 0;
          }
          let tl = 200;
          stage.addChild.apply(stage, sp as Sprite[]);
          onRender = (_, d) => {
            d = Math.min(d, tl);
            tl -= d;
            for (let i = 0; i < sp.length; ++i) {
              sp[i].alpha += d / 200 * opacs[i];
            }
            if (!tl) {
              sprites = sp;
              onRender = null;
            }
          }
        });
      }
    }
  }
}