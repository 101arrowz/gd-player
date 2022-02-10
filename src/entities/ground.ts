import { TilingSprite } from 'pixi.js';
import { GroundTile, groundTiles, loadGroundTiles } from '../util/assets';

export default class Ground extends TilingSprite {
  constructor(ground: GroundTile, public shiftSpeed = 0) {
    super(groundTiles[ground][0]);
    this.scale.set(0.25, -0.25);
    this.width = Number.MAX_SAFE_INTEGER;
    this.height = Number.MAX_SAFE_INTEGER;
    this.zIndex = Infinity;
  }
  async create(ground: GroundTile, shiftSpeed?: number) {
    if (!groundTiles[ground]) await loadGroundTiles([ground]);
    return new Ground(ground, shiftSpeed);
  }
  update(delta: number) {
    
  }
}