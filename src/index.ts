import { Container, utils } from 'pixi.js';
import 'regenerator-runtime/runtime';
import addScene from './scenes';
import { renderer } from './util';
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('workers/service.ts', import.meta.url), { type: 'module' });
  }
} else utils.skipHello();

const stage = new Container();

const hts = document.body.parentElement!.style;
const bs = document.body.style;

bs.margin = hts.margin = bs.padding = hts.padding = '0';
bs.overflow = hts.overflow = 'hidden';

document.body.appendChild(renderer.view);

let lastTime = performance.now();

const render = (newTime: number) => {
  addScene(stage, newTime - lastTime);
  lastTime = newTime;
  if (renderer.width != window.innerWidth || renderer.height != window.innerHeight) {
    renderer.resize(window.innerWidth, window.innerHeight);
  }
  renderer.render(stage);
  requestAnimationFrame(render);
};

render(performance.now());
