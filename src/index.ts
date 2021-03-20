import { Renderer, Container, utils } from 'pixi.js';
import 'regenerator-runtime/runtime';
import addScene from './scenes';
import './scenes';
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.ts');
  }
} else utils.skipHello();

const stage = new Container();
const renderer = new Renderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

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
