import express from 'express';
import * as FS from '../services/fileService.mjs';
import { env } from '../config/env.mjs';

const router = express.Router();

router.get('/', (req, res) => {
  try { res.json({ files: FS.listFileRecords(), dir: FS.listFiles(String(req.query.subdir || '')) }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/upload', (req, res) => {
  const { name, mime, data } = req.body || {};
  if (!name || !data) return res.status(400).json({ error: 'name e data (base64) obrigatorios' });
  if (typeof name !== 'string' || typeof data !== 'string') return res.status(400).json({ error: 'name e data devem ser texto' });
  // Confere o tamanho ANTES de decodificar e rejeita base64 invalido (Buffer.from ignora lixo em silencio).
  if (Math.floor(data.length * 3 / 4) > env.MAX_UPLOAD_BYTES + 3) return res.status(413).json({ error: `Arquivo excede limite de ${env.MAX_UPLOAD_BYTES} bytes` });
  if (!/^[A-Za-z0-9+/\s]*={0,2}\s*$/.test(data)) return res.status(400).json({ error: 'data nao e base64 valido' });
  try {
    const buf = Buffer.from(data, 'base64');
    const rec = FS.saveUploadedFile({ originalName: name, buffer: buf, mime });
    res.status(201).json(rec);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/:id', (req, res) => {
  const r = FS.getFile(req.params.id);
  if (!r) return res.status(404).json({ error: 'Arquivo nao encontrado' });
  res.json(r);
});

router.get('/:id/content', (req, res) => {
  try {
    const r = FS.readFileContent(req.params.id);
    res.json(r);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/analyze', (req, res) => {
  const { code, language } = req.body || {};
  res.json(FS.analyzeCodeSnippet(code || '', language));
});

router.delete('/:id', (req, res) => {
  const ok = FS.deleteFile(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Arquivo nao encontrado' });
  res.json({ ok: true });
});

export default router;
