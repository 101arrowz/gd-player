import { Container, Renderer, RenderTexture, Sprite, Texture } from 'pixi.js';

export const renderer = new Renderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

export type ColoredTexture = {
  tint: number;
  texture: Texture;
};

export const buildIcon = (textures: ColoredTexture[]) => {
  const renderTexture = RenderTexture.create({
    width: textures[0].texture.width,
    height: textures[0].texture.height
  });
  const obj = new Container();
  for (const { tint, texture } of textures) {
    const sprite = new Sprite(texture);
    sprite.tint = tint;
    sprite.anchor.set(0.5)
    sprite.x = renderTexture.width / 2;
    sprite.y = renderTexture.height / 2;
    obj.addChild(sprite);
  }
  renderer.render(obj, { renderTexture });
  return renderTexture;
}