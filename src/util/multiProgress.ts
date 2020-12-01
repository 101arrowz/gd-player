import { ProgressHandler } from './dl';

export default (handler: ProgressHandler): (() => ProgressHandler) => {
  const states: [number, number][] = [];
  return (): ProgressHandler => {
    const state = [0, 0] as [number, number];
    states.push(state);
    return (bytes, total) => {
      (state[0] = bytes), (state[1] = total);
      handler.apply(
        null,
        states.reduce(
          (a, c) => {
            a[0] += c[0];
            a[1] += c[1];
            return a;
          },
          [0, 0]
        )
      );
    };
  };
};
