import { Sprite } from 'pixi.js';
import { Scene } from '.';

type Async<T> = T | Promise<T>;

export type Init = () => Async<ReadonlyArray<Sprite>>;

export type Render = (sprites: ReadonlyArray<Sprite>) => void | Scene;