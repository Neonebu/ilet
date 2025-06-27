// copy-static.js
import { copyFileSync } from 'fs';
import { join } from 'path';

const from = join(process.cwd(), 'static.json');
const to = join(process.cwd(), 'dist', 'static.json');

copyFileSync(from, to);
console.log('✅ static.json copied to dist/');
