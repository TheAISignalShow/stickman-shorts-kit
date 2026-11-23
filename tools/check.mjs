// Check a Short before rendering it: ONE contact sheet of the whole Short (a still every 2.5 s by default),
// so you (or Claude) can look at every beat at once for overlaps, clipped text, empty areas and frozen poses.
//
//   npm run check -- MyShort                 -> out/check/MyShort-sheet.jpg
//   npm run check -- MyShort --every=1.5
//   npm run check -- MyShort --times=0.5,2,10.4
//   npm run check -- MyShort --tile=540                 (bigger tiles, to judge faces)
//   npm run check -- MyShort --from=10 --to=16 --every=0.5
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!id || id.startsWith('--')) {
  console.error('usage: npm run check -- <ShortId> [--every=2.5] [--times=1,2,3]');
  process.exit(1);
}
const opt = Object.fromEntries(process.argv.slice(3).map((a) => a.replace(/^--/, '').split('=')));
const num = (k) => (opt[k] !== undefined ? Number(opt[k]) : undefined);
const inputProps = {target: id, every: Number(opt.every ?? 2.5), times: opt.times ? opt.times.split(',').map(Number) : undefined, tile: num('tile'), from: num('from'), to: num('to')};
const root = process.cwd();
fs.mkdirSync(path.join(root, 'out', 'check'), {recursive: true});
console.log('bundling…');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'Sheet', inputProps});
const output = path.join(root, 'out', 'check', `${id}-sheet.jpg`);
await renderStill({composition, serveUrl, output, inputProps, imageFormat: 'jpeg', jpegQuality: 85});
console.log(`sheet: ${output}  (${composition.width} x ${composition.height})`);
