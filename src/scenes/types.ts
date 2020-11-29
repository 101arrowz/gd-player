import { Sprite, TilingSprite } from 'pixi.js';
import {freshLoadSheet, loadBGs, backgrounds} from '../util/assets';
import { SceneName } from '.';

type Async<T> = T | Promise<T>;

export default class Scene<T extends string | number> {
  constructor(methods: {
    init(): Async<Record<T, Sprite>>,
    render(sprites: Record<T, Sprite>): void | SceneName
  }) {
    this.init = methods.init;
    this.render = methods.render;
  }

  init: () => Async<Record<T, Sprite>>;
  render: (sprites: Record<T, Sprite>) => void | SceneName;
}