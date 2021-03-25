import { TilingSprite } from 'pixi.js';
import { GroundTile as GT, groundTiles, loadGroundTiles } from '../util/assets';

export default class GroundTile extends TilingSprite {
  verticalOffset: number;
  constructor(gt: GT, public shiftSpeed = 0) {
    super(groundTiles[gt][0]);
    if (groundTiles[gt][1]) {
      // TODO
    }
    this.zIndex = 99999;
    this.verticalOffset = 0;
    this.height = this.texture.height;
  }
  async create(gt: GT, shiftSpeed?: number) {
    if (!groundTiles[gt]) await loadGroundTiles([gt]);
    return new GroundTile(gt, shiftSpeed);
  }
  update(delta: number) {
    // Values from comparison to original game
    this.scale.set(window.innerHeight / 1100);
    this.y = window.innerHeight - 300 * this.scale.y + this.verticalOffset;
    this.width = window.innerWidth / this.scale.x + 40;
    if (this.shiftSpeed) this.tilePosition.x -= this.shiftSpeed * delta / this.scale.x;
  }
}