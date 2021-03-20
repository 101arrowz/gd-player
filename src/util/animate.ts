const bezierCoord = (t: number, a1: number, a2: number) => {
  const a1x3 = 3 * a1, a2x3 = 3 * a2;
  return (((1 + a1x3 - a2x3) * t + (a2x3 - 2 * a1x3)) * t + a1x3) * t;
}

export type TransitionTimeFunction = (x: number) => number;

export const createBezier = (x1: number, y1: number, x2: number, y2: number): TransitionTimeFunction => {
  // precomputed table for x values at each time step
  const ptblx = new Float32Array(256);
  for (let i = 0; i != 256; ++i) ptblx[i] = bezierCoord(i / 255, x1, x2);
  return x => {
    if (x == 0 || x == 1) return x;
    let i = 1;
    for (; i != 256 && ptblx[i] <= x; ++i);
    const lastX = ptblx[i - 1];
    // i / 255 = last timestep
    // rest is interpolating between the timesteps, assuming linearity
    return bezierCoord(
      (i / 255) + (x - lastX) / ((ptblx[i] - lastX) * 255),
      y1,
      y2  
    );
  }
}

export type AnimationStep = [value: number, time: number, fn: TransitionTimeFunction] | [value: number, time: number];
export type StartAnimationStep = [value: number, fn: TransitionTimeFunction] | [value: number] | number;
export type EndAnimationStep = [value: number] | number;
export type Animation = [StartAnimationStep, ...AnimationStep[], EndAnimationStep];
const linearAnimation: TransitionTimeFunction = x => x;

export const createAnimation = (animation: Animation, globalTiming = linearAnimation): TransitionTimeFunction => {
  const start = animation[0];
  const end = animation[animation.length - 1] as EndAnimationStep;
  const anims = animation.slice(1, -1) as AnimationStep[];
  anims.unshift([typeof start == 'number' ? start : start[0], 0, typeof start == 'number' || start.length == 1 ? linearAnimation : start[1]]);
  anims.push([typeof end == 'number' ? end : end[0], 1]);
  const lastAnimInd = anims.length - 1;
  return t => {
    if (t <= 0) return anims[0][0]
    if (t >= 1) return anims[lastAnimInd][0];
    t = globalTiming(t);
    let i = 1;
    for (; i != lastAnimInd && anims[i][1] <= t; ++i);
    const [prevV, prevT, anim] = anims[i - 1], [currV, currT] = anims[i];
    return prevV + (anim || linearAnimation)((t - prevT) / (currT - prevT)) * (currV - prevV);
  }
}