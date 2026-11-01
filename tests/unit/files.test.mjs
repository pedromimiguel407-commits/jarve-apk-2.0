import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jerver-files-'));
process.env.DB_PATH = path.join(tmpDir, 'test.db');
process.env.UPLOAD_DIR = path.join(tmpDir, 'uploads');
process.env.MAX_UPLOAD_BYTES = '5';

test('file save/read/delete', async () => {
  const F = await import('../../backend/services/fileService.mjs');
  const rec = F.saveUploadedFile({ originalName: 'a.txt', buffer: Buffer.from('hello'), mime: 'text/plain' });
  assert.ok(rec.id);
  const content = F.readFileContent(rec.id);
  assert.equal(content.content, 'hello');
  assert.equal(F.deleteFile(rec.id), true);
});

test('file validation traversal name', async () => {
  const F = await import('../../backend/services/fileService.mjs');
  assert.throws(() => F.validateFileMeta('../x', 10, 'text/plain'), /invalido/i);
});

test('file size limit', async () => {
  process.env.MAX_UPLOAD_BYTES = '5';
  const F = await import('../../backend/services/fileService.mjs');
  assert.throws(() => F.validateFileMeta('a.txt', 10, 'text/plain'), /excede/i);
});
