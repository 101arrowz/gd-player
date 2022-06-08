import { RenderTexture, Sprite, Texture } from 'pixi.js';
import { Body, Bodies, World, IChamferableBodyDefinition } from 'matter-js';
import { textures } from '../util';

export enum Gamemode {
  Cube,
  Ship,
  Ball,
  UFO,
  Wave,
  Robot,
  Spider
}

export enum Speed {

}

const defaultBodyOptions: IChamferableBodyDefinition = {
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0
};

export default class Player extends Sprite {
  private bodies: Record<Gamemode, Body>;
  private gamemode: Gamemode;
  verticalOffset: number;
  horizontalOffset: number;
  constructor(gm: Gamemode) {
    super(textures['cube1.2']);
    const ext = new Sprite(textures.cube1);
    ext.anchor.set(0.5);
    this.addChild(ext);
    ext.height = ext.width = 128;
    ext.tint = 0x7DFF00;
    this.gamemode = gm;
    this.anchor.set(0.5);
    this.tint = 0x00FFFF;
    this.bodies = [
      Bodies.rectangle(0, 0, 128, 128, defaultBodyOptions),
      Bodies.rectangle(0, 0, 192, 96, defaultBodyOptions),
      Bodies.circle(0, 0, 64, defaultBodyOptions),
      Bodies.rectangle(0, 0, 144, 180, defaultBodyOptions),
      Bodies.fromVertices(0, 0, [[{
        x: 0,
        y: 0
      }, {
        x: 0,
        y: 48
      }, {
        x: Math.sqrt(3) * 48,
        y: 24
      }]], defaultBodyOptions),
      Bodies.rectangle(0, 0, 128, 168, defaultBodyOptions),
      Bodies.rectangle(0, 0, 128, 168, defaultBodyOptions),
    ];
    // this.height = 128;
    // this.width = 128;
    // this.tint = 0xFF0000;
    this.verticalOffset = this.horizontalOffset = 0;
    Body.setPosition(this.bodies[gm], { x: 128, y: 64 });
  }

  connectTo(world: World) {
    World.add(world, this.bodies[this.gamemode]);
  }

  update() {
    this.bodies[this.gamemode].force.y -= 0.002 * this.bodies[this.gamemode].mass;
    const { x, y } = this.bodies[this.gamemode].position;
    console.log('player at', y);
    // TODO: explode on collision
    this.x = x + this.horizontalOffset;
    this.y = window.innerHeight - y + this.verticalOffset;
  }

  click() {
    const body = this.bodies[this.gamemode];
    Body.setVelocity(body, { x: 0, y: 5.5 })
  }
}