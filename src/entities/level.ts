import { Container, Sprite, ObservablePoint } from 'pixi.js';
import { Level as GDLevel } from 'gd.js'
import Background from './background';
import Ground from './ground';
import Song from './song';
import { textures, hitboxes, Hitbox, BG } from '../util';

type IntBool = 0 | 1;

type RGB = {
  r: number;
  g: number;
  b: number;
};

type HSV = {
  h: number;
  s: number;
  v: number;
};

type HSVMod = HSV & {
  sAdd: IntBool;
  vAdd: IntBool;
};

const rgbToTint = ({ r, g, b }: RGB) => (r << 16) | (g << 8) | b;
const tintToRGB = (tint: number) => ({
  r: tint >> 16,
  g: (tint >> 8) & 255,
  b: tint & 255
});

const rgbToHSV = ({ r, g, b }: RGB) => {
  const v = Math.max(r, g, b), c = v - Math.min(r, g, b);
  const h = c && (
    (v == r)
      ? (g - b) / c
      : (v == g)
        ? 2 + (b - r) / c
        : 4 + (r - g) / c
  );
  return {
    h: 60 * (h < 0 ? h + 6 : h),
    s: v && c / v,
    v: v / 255
  };
};

const hsvToRGB = ({ h, s, v }: HSV) => {
  const hsec = h / 60;
  const hsecmod = hsec % 2 - 1;
  const c = s * v * 256, m = v * 256 - c, x = c * (1 - (hsecmod - (hsecmod > 1 as unknown as number)));
  let r = m, g = m, b = m;
  if (hsec > 5) r += c, b += x
  else if (hsec > 4) r += x, b += c;
  else if (hsec > 3) g += x, b += c;
  else if (hsec > 2) g += c, b += x;
  else if (hsec > 1) r += x, g += c;
  else r += c, g += x;
  return { r, g, b };
}

enum Gamemode {
  Cube = 0,
  Ship = 1,
  Ball = 2,
  UFO = 3,
  Wave = 4,
  Robot = 5,
  Spider = 6
}

enum PlayerColor {
  Primary = 1,
  Secondary = 2
}

enum Speed {

}

enum EasingType {

}

enum PulseMode {

}

enum PulseTargetType {

}

enum PickupItemMode {

}

enum TouchToggleMode {

}

enum InstantCountComparison {

}

enum TargetPositionCoords {

}

type ColorMap = {
  1?: number;
  2?: number;
  3?: number;
  4?: PlayerColor;
  5?: IntBool;
  6?: number;
  7?: number;
  9?: number;
  10?: HSVMod;
  17?: IntBool;
}

type RawGDMeta = {
  kA2: Gamemode;
  kA3: IntBool;
  kA4: Speed;
  kA6: number;
  kA7: number;
  kA8: IntBool;
  kA9?: IntBool;
  kA10?: IntBool;
  kA11?: IntBool;
  kA13?: number;
  kA14?: string;
  kA15?: IntBool;
  kA16?: IntBool;
  kA17?: number;
  kA18?: number;
  kA22?: IntBool;
  kS38?: ColorMap[];
  kS39?: number;
  // BG, channel 1000
  kS29?: ColorMap;
  // ground, channel 1001
  kS30?: ColorMap;
  // line, channel 1002
  kS31?: ColorMap;
  // object, channel 1004
  kS32?: ColorMap;
  // channel 1
  kS33?: ColorMap;
  // channel 2
  kS34?: ColorMap;
  // channel 3
  kS35?: ColorMap;
  // channel 4
  kS36?: ColorMap;
  // 3D line, channel 1003
  kS37?: ColorMap;
  // RGB version
  kS1?: number;
  kS2?: number;
  kS3?: number;
  kS4?: number;
  kS5?: number;
  kS6?: number;
  kS7?: number;
  kS8?: number;
  kS9?: number;
  kS10?: number;
  kS11?: number;
  kS12?: number;
  kS13?: number;
  kS14?: number;
  kS15?: number;
  kS16?: number;
  kS17?: number;
  kS18?: number;
  kS19?: number;
  kS20?: number;
};

type RawGDObject = {
  1: number;
  2: number;
  3: number;
  4?: IntBool;
  5?: IntBool;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
  10: number;
  11?: IntBool;
  12?: number;
  13?: IntBool;
  14?: IntBool;
  15?: IntBool;
  16?: IntBool;
  17?: IntBool;
  20: IntBool;
  21?: number;
  22?: number;
  23?: number;
  24?: number;
  25?: number;
  28?: number;
  29?: number;
  30: EasingType;
  // nonnumeric
  31?: string;
  32?: number;
  34?: IntBool;
  35?: number;
  41?: IntBool;
  42?: IntBool;
  // nonnumeric
  43?: HSVMod;
  // nonnumeric
  44?: HSVMod;
  45?: number;
  46?: number;
  47?: number;
  48?: PulseMode;
  // nonnumeric
  49?: HSVMod;
  50: number;
  51?: number;
  52?: PulseTargetType;
  54?: number;
  56?: IntBool;
  // nonnumeric
  57?: number[];
  58?: IntBool;
  59?: IntBool;
  60: IntBool;
  61?: number;
  62?: IntBool;
  63?: number;
  64?: IntBool;
  65?: IntBool;
  66?: IntBool;
  67?: IntBool;
  68?: number;
  69?: number;
  70: IntBool;
  71?: number;
  72?: number;
  73?: number;
  75?: number;
  76?: number;
  77?: number;
  78?: IntBool;
  79?: PickupItemMode;
  80: number;
  81?: IntBool;
  82?: TouchToggleMode;
  84?: number;
  85?: number;
  86?: IntBool;
  87?: IntBool;
  88?: InstantCountComparison;
  89?: IntBool;
  90: number;
  91?: number;
  92?: number;
  93?: IntBool;
  94?: IntBool;
  95?: number;
  96?: IntBool;
  97?: number;
  98?: IntBool;
  99?: IntBool;
  100: IntBool;
  101?: TargetPositionCoords;
  102?: IntBool;
  103?: IntBool;
  105?: number;
  106?: IntBool;
  107?: number;
  108?: number;
};

const parseHSVMod = (data: string) => {
  const parts = data.split('a');
  return {
    h: +parts[0],
    s: +parts[1],
    v: +parts[2],
    sAdd: +parts[3] as IntBool,
    vAdd: +parts[4] as IntBool
  };
}

const parseColor = (data: string) => {
  const split = data.split('_');
  const obj = {} as ColorMap;
  for (let i = 0; i < split.length; i += 2) {
    const key = +split[i], val = split[i + 1];
    if (key == 10) {
      obj[key] = parseHSVMod(val);
    } else {
      obj[key as keyof ColorMap] = +val as never;
    }
  }
  return obj;
}

const parseMeta = (data: string) => {
  const split = data.split(',');
  const obj = {} as RawGDMeta;
  for (let i = 0; i < split.length; i += 2) {
    const key = split[i], val = split[i + 1];
    if (key == 'kA14') {
      obj[key] = val;
    } else if (key.startsWith('kS') && +key.slice(2) >= 29) {
      if (key == 'kS38') {
        obj[key] = val.split('|').map(parseColor);
      } else {
        obj[key as 'kS29'] = parseColor(val);
      }
    } else {
      obj[key as keyof RawGDMeta] = +val as never;
    }
  }
  return obj;
}

const parseObject = (data: string) => {
  const split = data.split(',');
  const obj = {} as RawGDObject;
  for (let i = 0; i < split.length; i += 2) {
    const key = +split[i], val = split[i + 1];
    if (key == 31) obj[key] = atob(val.replace(/_/g, '/').replace(/-/g, '+'));
    else if (key == 43 || key == 44 || key == 49) obj[key] = parseHSVMod(val);
    else obj[key as keyof RawGDObject] = +val as never;
    // TODO: Make less "hacky"
  }
  return obj;
};

type Point = { x: number; y: number; };
type BoundingRect = [Point, Point, Point, Point];

type RectSource = Point & { rotation: number; hitbox: Hitbox; innerScale: number; flip: ObservablePoint<never>; };

const skew = (base: RectSource, x: number, y: number, sin: number, cos: number) => {
  x *= 1 - 2 * base.flip.x;
  y *= 1 - 2 * base.flip.y;
  return {
    x: base.x + base.innerScale * (x * cos - y * sin),
    y: base.y + base.innerScale * (x * sin + y * cos)
  }
};

const rect = (src: RectSource): BoundingRect => {
  const sin = Math.sin(src.rotation), cos = Math.cos(src.rotation);
  return [
    skew(src, src.hitbox.x, src.hitbox.y, sin, cos),
    skew(src, src.hitbox.x + src.hitbox.w, src.hitbox.y, sin, cos),
    skew(src, src.hitbox.x + src.hitbox.w, src.hitbox.y + src.hitbox.h, sin, cos),
    skew(src, src.hitbox.x, src.hitbox.y + src.hitbox.h, sin, cos),
  ];
};

const dist = (a: Point, b: Point) => ({
  x: b.x - a.x,
  y: b.y - a.y
});

const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

class LevelObject extends Sprite {
  innerScale!: number;
  protected maxProtrude!: number;
  readonly flip: ObservablePoint<never>;
  
  set realScale(scale: number) {
    this.innerScale = scale;
    this.updatePosition();
  }
  get realScale() {
    return this.innerScale;
  }

  set realRotation(degrees: number) {
    this.angle = -degrees;
    this.updatePosition();
  }
  get realRotation() {
    return -this.angle;
  }

  constructor(id: number, obj: RawGDObject, protected level: Level) {
    super(textures[id]);
    this.x = obj[2];
    this.y = obj[3];
    this.flip = new ObservablePoint(this.updatePosition, this, obj[4], obj[5]);
    this.anchor.set(0.5);
    if (obj[6]) this.realRotation = obj[6];
    if (obj[15]) {
      // todo
    } else if (obj[16]) {
      // todo
    } else if (obj[21]) {
      if (obj[22]) {
        // todo
      }
      // todo
    }
    this.zIndex = obj[24]!;
    this.realScale = obj[32] ?? 1;
  }

  protected updatePosition() {
    this.scale.set(
      this.innerScale * 0.25 * (1 - this.flip.x * 2),
      this.innerScale * 0.25 * (this.flip.y * 2 - 1)
    );
    this.maxProtrude = Math.hypot(this.width, this.height) / 4;
  }

  update(delta: number) {
    this.visible = this.x + this.maxProtrude > this.level.camX && this.x - this.maxProtrude < this.level.boundX && this.y + this.maxProtrude > this.level.camY && this.y - this.maxProtrude < this.level.boundY;
  }

  static matchesID(id: number) {
    // TODO: only effectful (e.g. ignore start pos)
    return true;
  }
}

const linearEase = (ratio: number) => ratio;
const interpolate = (a: number, b: number, ratio: number) => a * (1 - ratio) + b * ratio;

abstract class Trigger extends LevelObject {
  private triggered: number;
  private duration: number;
  private ease: (ratio: number) => number;
  constructor(id: number, obj: RawGDObject, level: Level) {
    super(id, obj, level);
    this.visible = false;
    this.duration = obj[10]! * 1000;
    // TODO: easing
    this.ease = linearEase;
    this.triggered = 0;
  }
  update(delta: number) {
    // no super.update() because only modifies visibility
    if (this.triggered != this.duration && this.level.player.x > this.x) {
      this.triggered = Math.min(this.triggered + delta, this.duration);
      this.trigger(this.ease(this.triggered / this.duration));
    }
  }
  protected abstract trigger(ratio: number): void;
}

abstract class ColorTrigger extends Trigger {
  private targetColor: RGB;
  private initColor?: RGB;
  constructor(id: number, obj: RawGDObject, level: Level) {
    super(id, obj, level);
    this.targetColor = {
      r: obj[7]!,
      g: obj[8]!,
      b: obj[9]!
    };
  }
  protected trigger(ratio: number) {
    if (this.initColor === undefined) {
      this.initColor = this.color;
    }
    this.color = {
      r: interpolate(this.initColor.r, this.targetColor.r, ratio),
      g: interpolate(this.initColor.g, this.targetColor.g, ratio),
      b: interpolate(this.initColor.b, this.targetColor.b, ratio)
    };
  }
  protected abstract get color(): RGB;
  protected abstract set color(color: RGB);
}

class BGTrigger extends ColorTrigger {
  protected get color() {
    return tintToRGB(this.level.bg.tint);
  }
  protected set color(color: RGB) {
    this.level.bg.tint = rgbToTint(color);
  }
  static matchesID(id: number) {
    return id == 29;
  }
}

class GroundTrigger extends ColorTrigger {
  protected get color() {
    return tintToRGB(this.level.ground.tint);
  }
  protected set color(color: RGB) {
    this.level.ground.tint = rgbToTint(color);
  }
  static matchesID(id: number) {
    return id == 30;
  }
}

abstract class PhysicalObject<CollisionInfo = true> extends LevelObject {
  protected abstract collision(): CollisionInfo | null;
  protected abstract onCollide(info: CollisionInfo): void;
  update(delta: number) {
    super.update(delta);
    const maxReach = (this.maxProtrude + this.level.player.maxProtrude) * 3;
    if (Math.abs(this.x - this.level.player.x) < maxReach && Math.abs(this.y - this.level.player.y) < maxReach) {
      const info = this.collision();
      if (info !== null) {
        this.onCollide(info);
      }
    }
  }
}

type MTV = {
  // 0 = horizontal, 1 = vertical
  axis: 0 | 1;
  magnitude: number;
};

abstract class RectangleObject extends PhysicalObject<MTV> {
  readonly hitbox: Hitbox;
  protected boundingRect!: BoundingRect; 
  constructor(id: number, obj: RawGDObject, level: Level) {
    super(id, obj, level);
    this.hitbox = hitboxes[id];
    this.updatePosition = () => {
      super.updatePosition();
      this.boundingRect = rect(this);
    };
    this.boundingRect = rect(this);
  }
  protected collision() {
    const loc = this.boundingRect, player = rect(this.level.player);

    // only necessary if at diff angles
    // if (this.angle != this.level.player.angle)
    for (let i = 0; i < 2; ++i) {
      const len = i ? this.level.player.hitbox.h : this.level.player.hitbox.w;
      const start = player[i];
      const vec = dist(start, player[i + 1]);
      let min = dot(vec, dist(start, loc[0])), max = min;
      for (let j = 1; j < 4; ++j) {
        const val = dot(vec, dist(start, loc[j]));
        min = Math.min(val, min);
        max = Math.max(val, max);
      }
      if (min > len * len || max < 0) {
        return null;
      }
    }

    let minMagnitude = Infinity, minAxis = 0;

    for (let i = 0; i < 2; ++i) {
      const len = i ? this.hitbox.h : this.hitbox.w;
      const start = loc[i];
      const vec = dist(start, loc[i + 1]);
      let min = dot(vec, dist(start, player[0])), max = min;
      for (let j = 1; j < 4; ++j) {
        const val = dot(vec, dist(start, player[j]));
        min = Math.min(val, min);
        max = Math.max(val, max);
      }
      const a = len - min / len, b = max / len;
      if (a < 0 || b < 0) {
        return null;
      }
      const displacement = a < b ? a : -b;
      if (Math.abs(displacement) < Math.abs(minMagnitude)) {
        minMagnitude = displacement;
        minAxis = 1 - i;
      }
    }

    return {
      axis: minAxis as 0 | 1,
      magnitude: minMagnitude
    };
  }
}

class RectangleSurface extends RectangleObject {
  protected onCollide(collision: MTV) {
    if (collision.axis == (this.realRotation == 0 ? 0 : 1)) {
      this.level.player.onSurface = true;
      this.level.player.y = Math.max(...this.boundingRect.map(p => p.y)) + 15;
    } else {
      this.tint = 0xFF0000;
      // this.level.player.kill();
    }
  }
  static matchesID(id: number) {
    return id in hitboxes && id != 8;
  }
}

class RectangleHazard extends RectangleObject {
  protected onCollide() {
    // this.level.player.kill();
  }
  static matchesID(id: number) {
    return id == 8;
  }
}

class Player extends Sprite {
  maxProtrude: number;
  hitbox: Hitbox;
  velocity: number;
  onSurface = true;
  innerScale = 1;
  flip: ObservablePoint<never> = new ObservablePoint(() => {}, this, 0, 0);
  constructor(private level: Level) {
    super(textures.cube0);
    this.scale.set(0.25, -0.25);
    this.anchor.set(0.5);
    this.maxProtrude = Math.hypot(this.width, this.height) / 4;
    this.hitbox = { x: -15, y: -15, w: 30, h: 30 };
    this.velocity = 0;
    this.y = 15;
  }
  get offset() {
    return 275;
  }
  kill() {
    this.level.camX = 0;
  }
  preUpdate(delta: number) {
    this.x = this.level.camX + this.offset;
    this.y += this.velocity * delta;
  }
  postUpdate(delta: number) {
    if (this.onSurface) this.velocity = 0;
    else this.velocity -= 0.003 * delta;
    this.onSurface = false;
  }
}


const objectTypes: Array<typeof LevelObject> = [GroundTrigger, BGTrigger, RectangleHazard, RectangleSurface, LevelObject];

const createObject = (level: Level, obj: RawGDObject) => {
  const id = obj[1];
  for (const ObjectType of objectTypes) {
    if (ObjectType.matchesID(id)) {
      return new ObjectType(id, obj, level);
    }
  }
}

export default class Level extends Container {
  objects: LevelObject[];
  get player() {
    return this.players[0];
  }
  set player(player: Player) {
    this.players = [player];
  }
  players!: Player[];
  objectLayer: Container;
  camX: number;
  camY: number;
  boundX: number;
  boundY: number;
  bg: Background;
  ground: Ground;
  shiftSpeed: number;
  clicking = false;
  constructor(meta: RawGDMeta, objects: RawGDObject[], song: Song) {
    super();
    this.shiftSpeed = 0.3115801;
    this.addChild(this.bg = new Background(meta.kA6 + 1 as BG, 0.1));
    this.objects = objects.reduce<LevelObject[]>((acc, obj) => {
      const objSprite = createObject(this, obj);
      if (objSprite) acc.push(objSprite);
      return acc;
    }, []);
    (this.objectLayer = new Container()).addChild(
      ...this.objects,
      this.player = new Player(this),
      this.ground = new Ground(1, this.shiftSpeed)
    );
    this.addChild(this.objectLayer);
    song.play(0);
    this.boundX = this.camX = 0;
    this.boundY = this.camY = -100;
    this.bg.tint = rgbToTint({
      r: meta.kS1!,
      g: meta.kS2!,
      b: meta.kS3!
    });
    this.ground.tint = rgbToTint({
      r: meta.kS4!,
      g: meta.kS5!,
      b: meta.kS6!
    });
    window.addEventListener('mousedown', e => {
      this.clicking = true;
    });
    window.addEventListener('mouseup', e => {
      this.clicking = false;
    });
    window.addEventListener('keydown', () => {
      this.clicking = true;
    })
    window.addEventListener('keyup', e => {
      this.clicking = false;
    });
  }
  static async create(level: GDLevel) {
    const [
      { raw },
      song
    ] = await Promise.all([
      level.decodeData(),
      Song.create(level.song, true)
    ]);
    const [head, ...rest] = raw.split(';')
    return new Level(parseMeta(head), rest.slice(0, -1).map(parseObject), song);
  }
  update(delta: number) {
    this.bg.update(delta);
    this.ground.update(delta);
    this.camX += this.shiftSpeed * delta;
    const levelScale = 1.5;
    this.objectLayer.scale.set(levelScale, -levelScale);
    this.objectLayer.pivot.x = this.camX;
    this.objectLayer.pivot.y = this.camY;
    this.objectLayer.y = window.innerHeight;
    this.boundX = this.camX + window.innerWidth / levelScale;
    this.boundY = this.camY + window.innerHeight / levelScale;
    this.player.tint = 0xFFFFFF;
    this.player.preUpdate(delta);
    if (this.player.y <= 15) {
      this.player.onSurface = true;
      this.player.y = 15;
    }
    for (const obj of this.objects) {
      obj.update(delta);
    }
    const wasOnSurface = this.player.onSurface;
    this.player.postUpdate(delta);
    if (this.clicking && wasOnSurface) this.player.velocity += 0.6
  }
}