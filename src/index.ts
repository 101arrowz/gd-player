import { Renderer, Container, utils } from 'pixi.js';

if (process.env.NODE_ENV === "production") {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.ts");
  }
} else utils.skipHello();

const stage = new Container();
const renderer = new Renderer({
  width: window.innerWidth,
  height: window.innerHeight
});

window.addEventListener('resize', () => { requestAnimationFrame(() => renderer.resize(window.innerWidth, window.innerHeight)); });

document.body.appendChild(renderer.view);

const render = () => {
  renderer.render(stage);
  requestAnimationFrame(render);
}

render();