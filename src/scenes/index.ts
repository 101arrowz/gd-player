import { Container, DisplayObject, Sprite } from 'pixi.js';
import loading from './loading';

const scenes = {
  loading
}

// Limitation of TS does not allow us to do this normally
export type SceneName = 'loading';

let scene: SceneName = 'loading';

let sprites: Record<string | number, DisplayObject>;

Promise.resolve(scenes[scene].init()).then(sp => {
  sprites = sp;
});

let onRender: ((stage: Container, delta: number) => void) | null = stage => {
  if (sprites) {
    scenes[scene].render(sprites as Parameters<(typeof scenes)[typeof scene]['render']>[0], 0);
    stage.addChild.apply(stage, Object.values(sprites));
    onRender = null;
  }
};

export default (stage: Container, delta: number) => {
  if (onRender) {
    onRender(stage, delta);
    return;
  }
  const next = scenes[scene].render(sprites as Parameters<(typeof scenes)[typeof scene]['render']>[0], delta);
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
          scenes[scene].render(sp, 0);
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