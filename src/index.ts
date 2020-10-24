import { readFileSync } from 'fs';

window['dat'] = readFileSync('src/assets/fonts/01.fnt', 'utf-8');
navigator.serviceWorker.register('sw.ts')