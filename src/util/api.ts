import GD from 'gd.js';
import { corsURL } from './const';

const client = new GD({ corsURL });
if (process.env.NODE_ENV != 'production') {
  Object.defineProperty(window, 'gd', {value: client});
}

export default client;