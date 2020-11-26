import { Renderer, Container, utils } from 'pixi.js';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.ts');
}
if (process.env.NODE_ENV === 'production') {

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

window.addEventListener('resize', () => {
  requestAnimationFrame(() =>
    renderer.resize(window.innerWidth, window.innerHeight)
  );
});

document.body.appendChild(renderer.view);

const render = () => {
  renderer.render(stage);
  requestAnimationFrame(render);
};

render();
