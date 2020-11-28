import { Sprite } from 'pixi.js';
import { textures, backgrounds, loadBGs, freshLoadSheet } from '../../util/assets';
import { Init, Render } from '../types';

export const init: Init = async () => {
  await Promise.all(freshLoadSheet([4, 'launch']).concat(loadBGs([1]) as unknown as Promise<void>));
  const bg = new Sprite(backgrounds[1]);
  bg.tint = 0x00aaff;
  return [bg];
};

export const render: Render = () => {
  
}