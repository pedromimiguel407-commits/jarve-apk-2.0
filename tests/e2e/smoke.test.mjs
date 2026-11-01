import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

test('frontend index exists and has key controls', () => {
  const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
  for (const id of ['btnMenu','btnNewChat','btnSend','btnStop','btnClear','modelSelect','btnSaveSettings','btnUpload','btnPlan','btnRunTask']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing ' + id);
  }
});

test('docs exist', () => {
  for (const f of ['README.md','SECURITY.md','.env.example']) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});
