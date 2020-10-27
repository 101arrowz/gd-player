export * from '@pixi/display';
export * from '@pixi/particles';
import { ParticleRenderer } from '@pixi/particles';
Renderer.registerPlugin('particle', ParticleRenderer);
export * from '@pixi/sprite';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
export * from '@pixi/spritesheet';
export * from '@pixi/text-bitmap';


// core - do not touch
if (!Object.assign) {
  Object.assign = function(a) {
    for (let i = 1; i < arguments.length; ++i) {
      const b = arguments[i];
      for (let k in b) a[k] = b[k];
    }
    return a;
  }
}
if (!Math.sign) {
  Math.sign = function(v) {
    v = +v;
    return !v ? v : v > 0 ? 1 : -1;
  }
}
export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
import * as utils from '@pixi/utils';
export { utils };
export * from '@pixi/core';

// Renderer plugins
import { Renderer } from '@pixi/core';
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);