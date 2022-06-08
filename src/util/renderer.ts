import { Renderer } from 'pixi.js';

const renderer = new Renderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

const render = renderer.render;

renderer.render = function() {
  if (renderer.width != window.innerWidth || renderer.height != window.innerHeight) {
    renderer.resize(window.innerWidth, window.innerHeight);
  }
  render.apply(renderer, arguments as unknown as Parameters<typeof render>);
}

export default renderer;