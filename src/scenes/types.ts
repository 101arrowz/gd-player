import { DisplayObject } from 'pixi.js';
import { SceneName } from '.';

type Async<T> = T | Promise<T>;

export default class Scene<T extends Record<string | number, DisplayObject>> {
  constructor(methods: {
    init(): Async<T>,
    render(sprites: T, delta: number): void | SceneName
  }) {
    this.init = methods.init;
    this.render = methods.render;
  }

  init: () => Async<T>;
  render: (sprites: T, delta: number) => void | SceneName;
}