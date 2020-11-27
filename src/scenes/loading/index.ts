import textures, { freshLoad } from '../../util/textures';
import { Init, Render } from '../types';

export const init: Init = async () => {
  await Promise.all(freshLoad([4, 'launch']));
  return []
};

export const render: Render = () => {
  
}