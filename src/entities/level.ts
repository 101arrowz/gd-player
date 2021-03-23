import { Container, Sprite, Texture } from 'pixi.js';
import { Level as GDLevel } from 'gd.js'
import Background from './background';
import Song from './song';
import { textures, BG } from '../util';

type IntBool = 0 | 1;

interface HSV {
  h: number;
  s: number;
  v: number;
  sAdd: IntBool;
  vAdd: IntBool;
}

const rgbToHSV = (r: number, g: number, b: number) => {
  const v = Math.max(r, g, b), c = v - Math.min(r, g, b);
  const h = c && (
    (v == r)
      ? (g - b) / c
      : (v == g)
        ? 2 + (b - r) / c
        : 4 + (r - g) / c
  );
  return [
    60 * (h < 0 ? h + 6 : h),
    v && c / v,
    v / 255
  ];
}

const hsvToRGB = (h: number, s: number, v: number) => {
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
  return (r << 16) | (g << 8) | b;
}

enum Gamemode {

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
  1: number;
  2: number;
  3: number;
  4?: number;
  5?: IntBool;
  6?: number;
  7?: number;
  9?: number;
  10?: HSV;
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
  kS37?: 1003;
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
  kS20?: number
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
  43?: HSV;
  // nonnumeric
  44?: HSV;
  45?: number;
  46?: number;
  47?: number;
  48?: PulseMode;
  // nonnumeric
  49?: HSV;
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

const parseMeta = (data: string) => {
  const split = data.split(',');
  const obj = {} as RawGDMeta;
  for (let i = 0; i < split.length; i += 2) {
    const key = split[i], val = split[i + 1];
  }
  return obj;
}

const parseObject = (data: string) => {
  const split = data.split(',');
  const obj = {} as RawGDObject;
  for (let i = 0; i < split.length; i += 2) {
    const key = +split[i], val = split[i + 1];
    if (key == 31) obj[key] = atob(val.replace(/_/g, '/').replace(/-/g, '+'));
    else if (key == 43 || key == 44 || key == 49) {
      const parts = val.split('a');
      obj[key] = {
        h: +parts[0],
        s: +parts[1],
        v: +parts[2],
        sAdd: +parts[3] as IntBool,
        vAdd: +parts[4] as IntBool
      };
    } else obj[key as keyof RawGDObject] = +val as never;
    // TODO: Make less "hacky"
  }
  return obj;
};

class LevelObject extends Sprite {
  srcX: number;
  srcY: number;
  constructor(id: number, obj: RawGDObject) {
    super(textures[id]);
    this.srcX = obj[2];
    this.srcY = obj[3];
    this.scale.set(obj[4] ? -0.5 : 0.5, obj[5] ? -0.5 : 0.5);
    this.anchor.set(0.5);
    if (obj[6]) this.rotation = obj[6] * Math.PI / 180;
    if (obj[15]) {

    } else if (obj[16]) {
      
    } else if (obj[21]) {
      if (obj[22]) {
        
      }
    }
    this.zIndex = obj[24]!;
  }

  static matchesID(id: number) {
    // TODO: only effectful (e.g. ignore start pos)
    return true;
  }
}

const objectTypes: Array<typeof LevelObject> = [LevelObject];

const createObject = (obj: RawGDObject) => {
  const id = obj[1];
  for (const ObjectType of objectTypes) {
    if (ObjectType.matchesID(id)) {
      return new ObjectType(id, obj);
    }
  }
}

export default class Level extends Container {
  private objects: LevelObject[];
  private camX: number;
  private bg: Background;
  private camY: number;
  private shiftSpeed: number;
  constructor(meta: RawGDMeta, objects: RawGDObject[], private song: Song) {
    super();
    this.addChild(this.bg = new Background(meta.kA6 as BG));
    this.addChild.apply(this, this.objects = objects.reduce<LevelObject[]>((acc, obj) => {
      const objSprite = createObject(obj);
      if (objSprite) acc.push(objSprite);
      return acc;
    }, []));
    song.play();
    this.camX = 0;
    this.camY = 0;
    this.shiftSpeed = 5;
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
    for (const obj of this.objects) {
      const x = obj.x = obj.srcX * 2 - this.camX;
      const y = obj.y = window.innerHeight - (obj.srcY * 2 - this.camY);
      const edgeX = obj.texture.width / 2, edgeY = obj.texture.height / 2;
      obj.visible = x > -edgeX && x < window.innerWidth + edgeX && y > -edgeY && y < window.innerHeight + edgeY;
      
    }
    this.camX += this.shiftSpeed;
    this.bg.update(delta);
  }
}