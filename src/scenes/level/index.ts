import Scene from '../scene';
import { gd } from '../../util';
import { Level } from '../../entities';
export default new Scene({
  init: async () => {
    const level = await gd.levels.get(+(prompt('Level ID:') || 2577156), true);
    return {
      level: await Level.create(level)
    };
  },
  render({ level }, delta) {
    level.update(delta);
  },
});
