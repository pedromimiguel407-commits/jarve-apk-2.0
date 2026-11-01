// Verificacao estatica: sintaxe de todos os .mjs/.cjs/.js do projeto (sem node_modules/dist/data).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'data', '.git'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.(mjs|cjs|js)$/.test(e.name)) {
      const r = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
      if (r.status !== 0) { failed++; console.error('ERRO:', path.relative(root, full), '\n', r.stderr); }
    }
  }
})(root);
if (failed) process.exit(1);
console.log('Sintaxe OK');
