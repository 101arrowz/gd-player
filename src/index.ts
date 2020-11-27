import { Renderer, Container, utils } from 'pixi.js';
import './scenes'
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

let resized = false;

window.addEventListener('resize', () => {
  resized = true;
});

document.body.appendChild(renderer.view);

let lastTime = performance.now();

const render = () => {
  const newTime = performance.now();
  renderer.render(stage);
  if (resized) {
    renderer.resize(window.innerWidth, window.innerHeight);
    resized = false;
  }
  requestAnimationFrame(render);
};

render();
