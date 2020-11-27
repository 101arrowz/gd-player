import { readdirSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import build from './buildAssets';

const asd = join(__dirname, '..', 'src', 'assets');
const oud = join(__dirname, '..', 'dist');
if (!existsSync(oud)) {
  if (!existsSync(asd)) build();
  mkdirSync(oud);
  for (const dir of readdirSync(asd)) {
    const od = join(oud, dir);
    mkdirSync(od);
    for (const file of readdirSync(join(asd, dir))) {
      copyFileSync(join(asd, dir, file), join(od, file));
    }
  }
}
