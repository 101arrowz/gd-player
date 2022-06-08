import { Container, Sprite, Texture } from 'pixi.js';
import { Bodies, Body, Engine, Events, Vector, Vertices, World } from 'matter-js';
import { Level as GDLevel } from 'gd.js'
import Background from './background';
import Song from './song';
import Player, { Gamemode, Speed } from './player';
import { textures, BG } from '../util';
import GroundTile from './groundTile';

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

type Color = {
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
  kS38?: Color[];
  kS39?: number;
  // BG, channel 1000
  kS29?: Color;
  // ground, channel 1001
  kS30?: Color;
  // line, channel 1002
  kS31?: Color;
  // object, channel 1004
  kS32?: Color;
  // channel 1
  kS33?: Color;
  // channel 2
  kS34?: Color;
  // channel 3
  kS35?: Color;
  // channel 4
  kS36?: Color;
  // 3D line, channel 1003
  kS37?: Color;
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

const parseHSV = (data: string): HSV => {
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
  const obj = {} as Color;
  for (let i = 0; i < split.length; i += 2) {
    const key = +split[i], val = split[i + 1];
    if (key == 10) obj[key] = parseHSV(val);
    else obj[key as keyof Color] = +val as never;
  }
  return obj;
}

const parseMeta = (data: string) => {
  const split = data.split(',');
  const obj = {} as RawGDMeta;
  for (let i = 0; i < split.length; i += 2) {
    const key = split[i], val = split[i + 1];
    if (key.startsWith('kA')) {
      if (key == 'kA14') obj[key] = val;
      else obj[key as keyof RawGDMeta] = +val as never;
    } else {
      const id = +key.slice(2);
      if (id == 38) {
        obj[key as 'kS38'] = val.split('|').map(parseColor);
      } else if (id > 28) obj[key as keyof RawGDMeta] = parseColor(val) as never;
      else obj[key as keyof RawGDMeta] = +val as never;
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
    else if (key == 43 || key == 44 || key == 49) obj[key] = parseHSV(val);
    else obj[key as keyof RawGDObject] = +val as never;
    // TODO: Make less "hacky"
  }
  return obj;
};

class LevelObject extends Sprite {
  private flip: number;
  private _relScale: number;
  srcX: number;
  srcY: number;
  constructor(public id: number, obj: RawGDObject, protected level: Level) {
    super(textures[id]);
    this.x = (this.srcX = obj[2]) << 1;
    this.y = window.innerHeight - ((this.srcY = obj[3]) << 1);
    if (id == 8 && this.x < 3000) console.log(obj[3]);
    this.flip = (obj[5]! << 1) | obj[4]!;
    this._relScale = 0;
    this.relativeScale = 1;
    this.anchor.set(0.5);
    if (obj[6]) this.rotation = obj[6] * Math.PI / 180;
    if (obj[15]) {

    } else if (obj[16]) {
      
    } else if (obj[21]) {
      if (obj[22]) {
        
      }
    }
    this.zIndex = obj[24] || 0;
  }

  get relativeScale() {
    return this._relScale;
  }
  set relativeScale(scale: number) {
    this._relScale = scale;
    this.scale.set(
      (0.5 - (this.flip & 1)) * scale,
      (0.5 - (this.flip >> 1)) * scale
    );
  }

  update(delta: number) {
    this.visible = 
      (this.x + this.width > this.level.pivot.x && this.x - this.width < this.level.pivot.x + window.innerWidth) &&
      (this.y + this.height > this.level.pivot.y && this.y - this.height < this.level.pivot.y + window.innerHeight);
  }

  static matchesID(id: number) {
    // TODO: only effectful (e.g. ignore start pos)
    return true;
  }
}

const objVertices: Record<number, Vector[]> = {
  
};

class PhysObject extends LevelObject {
  protected phys: Body;
  private world: World;
  constructor(id: number, obj: RawGDObject, level: Level) {
    super(id, obj, level);
    const x = this.srcX << 1, y = this.srcY << 1;
    World.add(this.world = level.engine.world, this.phys = Bodies.fromVertices(x + 64, y + 64, [objVertices[id] || Bodies.rectangle(0, 0, 128, 128).vertices], {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      collisionFilter: {
        mask: 2,
        category: 1
      },
      density: 1 << 31
    }));
    this.tint = 0xFF0000;
  }

  update(delta: number) {
    super.update(delta);
    Body.setVelocity(this.phys, {
      x: -5.5,
      y: 0
    });
    if (this.srcX < 4000) {
      console.log('spike at', this.phys.position.x, this.phys.position.y);
    }
  }

  static matchesID(id: number) {
    return id == 8;
  }
}

// Pulsers: https://cdn.discordapp.com/attachments/651480005536383009/824878047148769350/unknown.png

const objectTypes: Array<typeof LevelObject> = [PhysObject, LevelObject];

const createObject = (obj: RawGDObject, level: Level) => {
  const id = obj[1];
  for (const ObjectType of objectTypes) {
    if (ObjectType.matchesID(id)) {
      return new ObjectType(id, obj, level);
    }
  }
}

const pulseIDs = [
  36, // yellow ring
  141, // pink ring
  84, // blue ring
  37, 50, 51, 405, // pulsing deco object
  495, 460, 236, 150, 133, 132, 494, 496, 497 // nonsolid, scalemax = 1.2, scalemin = 0.8 
]

export default class Level extends Container {
  objects: LevelObject[];
  bg: Background;
  gt: GroundTile;
  player: Player;
  shiftSpeed: number;
  rng: number;
  engine: Engine;
  songAmplitude: number;
  constructor(meta: RawGDMeta, objects: RawGDObject[], private song: Song) {
    super();
    this.engine = Engine.create();
    this.engine.world.gravity.y = 0;
    this.rng = Math.floor(Math.random() * 1073741824);
    this.songAmplitude = 0;
    this.addChild(this.gt = new GroundTile(1, this.shiftSpeed = 0.62));
    World.add(this.engine.world, this.gt.phys);
    this.addChild(this.bg = new Background(meta.kA6 as BG || 1, this.shiftSpeed / 6));
    this.addChild(this.player = new Player(Gamemode.Cube));
    this.interactive = true;
    this.on('mousedown', () => this.player.click());
    Events.on(this.engine, 'collisionStart', console.log);
    this.player.connectTo(this.engine.world);
    if (meta.kS1) {
      this.bg.tint = (meta.kS1 << 16) | (meta.kS2! << 8) | meta.kS3!;
      this.gt.tint = (meta.kS4! << 16) | (meta.kS5! << 8) | meta.kS6!;
    } else if (meta.kS29) {
      // TODO
    }
    this.addChild.apply(this, this.objects = objects.reduce<LevelObject[]>((acc, obj) => {
      const objSprite = createObject(obj, this);
      if (objSprite) acc.push(objSprite);
      return acc;
    }, []));
    this.sortChildren();
  }
  static async create(level: GDLevel) {
    const [
      { raw },
      song
    ] = await Promise.all([
      level.decodeData(),
      Song.create(level.song)
    ]);
    const [head, ...rest] = raw.split(';')
    return new Level(parseMeta(head), rest.slice(0, -1).map(parseObject), song);
  }
  update(delta: number) {
    if (!this.song.playing) this.song.play();
    this.songAmplitude = this.song.currentAmplitude;
    Engine.update(this.engine, delta);
    for (const obj of this.objects) {
      obj.update(delta);
    }
    this.gt.shiftSpeed = this.shiftSpeed;
    this.bg.shiftSpeed = this.shiftSpeed / 6;
    const camMovement = this.shiftSpeed * delta;
    this.pivot.x += camMovement;
    this.bg.horizontalOffset += camMovement;
    this.gt.horizontalOffset += camMovement;
    this.gt.verticalOffset = this.pivot.y = window.innerHeight - this.gt.y + this.gt.verticalOffset;
    this.bg.update(delta);
    this.gt.update(delta);
    this.player.horizontalOffset += camMovement;
    this.player.update();
    // this.player.x = 100;
    // this.player.y = 100;
  }
}