import { Container, Sprite } from 'pixi.js';
import Scene from './types';
import loading from './loading';

const scenes = {
  loading
}

// Limitation of TS does not allow us to do this normally
export type SceneName = 'loading';

const scenesAssert: Record<SceneName, Scene<string | number>> = scenes;

let scene: SceneName = 'loading';

let sprites: Record<string | number, Sprite>;

Promise.resolve(scenes[scene].init()).then(sp => {
  sprites = sp;
});

let onRender: ((stage: Container, delta: number) => void) | null = stage => {
  if (sprites) {
    scenes[scene].render(sprites);
    stage.addChild.apply(stage, Object.values(sprites));
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
    const sparr = Object.values(sprites);
    const opacs = sparr.map(s => s.alpha);
    onRender = (stage, d) => {
      d = Math.min(d, tol);
      tol -= d;
      for (let i = 0; i < sparr.length; ++i) {
        sparr[i].alpha -= d / 200 * opacs[i];
      }
      if (!tol) {
        stage.removeChild.apply(stage, sparr);
        onRender = () => {};
        Promise.resolve(scenes[scene].init()).then(sp => {
          const sparr = Object.values(sp);
          const opacs = sparr.map(s => s.alpha);
          for (const s of sparr) {
            s.alpha = 0;
          }
          let tl = 200;
          scenes[scene].render(sp);
          stage.addChild.apply(stage, sparr);
          onRender = (_, d) => {
            d = Math.min(d, tl);
            tl -= d;
            for (let i = 0; i < sparr.length; ++i) {
              sparr[i].alpha += d / 200 * opacs[i];
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