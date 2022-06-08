import { TilingSprite } from 'pixi.js';
import { BG, backgrounds, loadBGs } from '../util/assets';

export default class Background extends TilingSprite {
  horizontalOffset: number;
  verticalOffset: number;
  constructor(bg: BG, public shiftSpeed = 0) {
    super(backgrounds[bg]);
    this.zIndex = -Infinity;
    this.horizontalOffset = this.verticalOffset = 0;
  }
  async create(bg: BG, shiftSpeed?: number) {
    if (!backgrounds[bg]) await loadBGs([bg]);
    return new Background(bg, shiftSpeed);
  }
  update(delta: number) {
    this.scale.set(window.innerHeight / 1100);
    // Values from comparison to original game
    this.x = -40 * this.scale.x + this.horizontalOffset;
    this.y = -460 * this.scale.y + this.verticalOffset;
    this.width = window.innerWidth / this.scale.x + 40;
    this.height = window.innerHeight / this.scale.y + 460;
    if (this.shiftSpeed) this.tilePosition.x -= this.shiftSpeed * delta / this.scale.x;
  }
}