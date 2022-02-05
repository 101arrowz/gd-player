import { ObservablePoint, Sprite, Texture } from 'pixi.js';
import { createAnimation, createBezier } from '../util';

enum AnimationType {
  DOWN,
  UP,
  OUT
}

const fastSlowBezier = createBezier(0, 0.10, 0.70, 1);

const bounceInAnimation = createAnimation([
  [1, x => x ** 3],
  [1.23, 0.65],
  [1.17, 0.8],
  [1.23]
], fastSlowBezier);
const bounceOutAnimation = createAnimation([
  [1.23, x => x ** 3],
  [1, 0.65],
  [1.07, 0.8],
  [1]
], fastSlowBezier);
const zoomDownAnimation = createAnimation([1, 1.23]);

export default class Button extends Sprite {
  private animTime: number;
  private animType: AnimationType;
  private scaleMultiplier: number;
  private origScale: ObservablePoint;
  private origX: number;
  private origY: number;
  constructor(texture: Texture, public onClick?: () => unknown) {
    super(texture);
    this.interactive = true;
    this.animTime = -1;
    this.animType = AnimationType.UP;
    this.anchor.set(0.5);
    this.scaleMultiplier = 1;
    let selfUpdate = false;
    this.origScale = this.transform.scale;
    this.origX = this.origScale.x, this.origY = this.origScale.y;
    const onDown = () => {
      this.animTime = 0;
      this.scaleMultiplier = 0.999;
      this.animType = AnimationType.DOWN;
      const newScale = new ObservablePoint(() => {
        if (selfUpdate) this.transform['onChange']();
        else {
          this.origX = newScale.x, this.origY = newScale.y;
          selfUpdate = true;
          newScale.set(newScale.x * this.scaleMultiplier, newScale.y * this.scaleMultiplier);
          selfUpdate = false;
        }
      }, this);
      newScale.copyFrom(this.origScale);
      this.transform.scale = newScale;
    };
    const onUp = () => {
      if (this.animType == AnimationType.DOWN) {
        if (this.animTime == -1) this.animTime = 300;
        if (this.onClick) this.onClick();
      }
      this.animType = AnimationType.UP;
    };
    const onOut = () => {
      if (this.animType == AnimationType.DOWN) {
        this.animType = AnimationType.OUT;
        if (this.animTime == -1) this.animTime = 300;
      }
    };
    const onIn = () => {
      if (this.animType == AnimationType.OUT) {
        onDown();
      }
    };
    this.on('pointerdown', onDown);
    // this.on('touchstart', onDown);
    // this.on('touchend', onUp)
    this.on('pointerup', onUp);
    this.on('pointerupoutside', onUp);
    // this.on('touchendoutside', onOut);
    this.on('pointermove', ev => {
      if (ev.target != this) {
        onOut();
      } else {
        onIn();
      }
    })
  }
  update(delta: number) {
    if (this.animTime != -1) {
      if (this.animType == AnimationType.DOWN) {
        const mdt = this.animTime += delta;
        this.scaleMultiplier = bounceInAnimation(mdt / 300);
        this.transform.scale.copyFrom(this.origScale!);
        if (mdt >= 300) this.animTime = -1;
      } else if (this.animType == AnimationType.UP) {
        const mdt = this.animTime -= delta * 20;
        this.scaleMultiplier = zoomDownAnimation(mdt / 300);
        this.transform.scale.copyFrom(this.origScale!);
        if (mdt <= 0) {
          this.animTime = -1;
          this.transform.scale = this.origScale!;
          this.origScale.set(this.origX, this.origY);
          this.transform['onChange']();
        }
      } else if (this.animType == AnimationType.OUT) {
        const mdt = this.animTime -= delta;
        this.scaleMultiplier = bounceOutAnimation(1 - (mdt / 300));
        this.transform.scale.copyFrom(this.origScale!);
        if (mdt <= 0) {
          this.animTime = -1;
          this.transform.scale = this.origScale!;
          this.origScale.set(this.origX, this.origY);
          this.transform['onChange']();
        }
      }
    }
  }
}