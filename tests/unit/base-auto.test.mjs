import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createProvider } from '../../ai/providers/index.mjs';

const chat = (p, content, extra = []) => p.chat({ model: 'jarves-base', messages: [...extra, { role: 'user', content }] });

test('IA base: "faz jogo" pergunta qual jogo antes de criar', async () => {
  const r = await chat(createProvider('base'), 'faz jogo');
  assert.match(r.content, /qual você quer/);
});

test('IA base: escolher pelo numero devolve HTML jogavel', async () => {
  const p = createProvider('base');
  const menu = (await chat(p, 'faz de html jogo')).content;
  const r = await chat(p, '1', [{ role: 'user', content: 'faz de html jogo' }, { role: 'assistant', content: menu }]);
  assert.ok(r.content.includes('```html') && r.content.includes('<canvas'));
});

test('Ollama recebe think:false e o auto usa o primeiro modelo instalado', async () => {
  let seen = null;
  const srv = http.createServer((req, res) => {
    if (req.url === '/api/tags') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ models: [{ name: 'qwen3.5:4b' }] })); }
    let b = ''; req.on('data', d => b += d); req.on('end', () => {
      seen = JSON.parse(b); res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ model: seen.model, message: { role: 'assistant', content: 'ola real' }, done: true }));
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  try {
    const p = createProvider('auto', { baseUrl: `http://127.0.0.1:${srv.address().port}` });
    const models = await p.listModels();
    assert.deepEqual(models.map(m => m.id), ['qwen3.5:4b', 'jarves-base']);
    const r = await p.chat({ model: 'nao-existe', messages: [{ role: 'user', content: 'oi' }] });
    assert.equal(r.content, 'ola real');
    assert.equal(seen.model, 'qwen3.5:4b');
    assert.equal(seen.think, false);
    assert.ok(seen.options.num_predict >= 4096);
  } finally { srv.close(); }
});

test('auto sem Ollama cai para a IA base', async () => {
  const p = createProvider('auto', { baseUrl: 'http://127.0.0.1:1' });
  const r = await p.chat({ model: null, messages: [{ role: 'user', content: '2+2' }] });
  assert.equal(r.provider, 'base');
  assert.match(r.content, /4/);
});

test('Motor Sol 6.1: gera imagem SVG, site com 3 arquivos, jogo e apps', async () => {
  const B = globalThis.JARVES_BASE;
  const img = B.generate('paisagem de mar ao por do sol', 'auto');
  assert.equal(img.type, 'imagem'); assert.match(img.files[0].content, /^<svg[\s\S]*<\/svg>\s*$/);
  assert.notEqual(B.generate('cidade futurista a noite', 'imagem').files[0].content, img.files[0].content);
  assert.deepEqual(B.generate('site de pizzaria', 'auto').files.map(f => f.name), ['index.html', 'style.css', 'script.js']);
  assert.equal(B.generate('jogo da cobrinha', 'auto').type, 'jogo');
  assert.equal(B.generate('calculadora', 'auto').type, 'app-calc');
  assert.equal(B.generate('lista de tarefas', 'auto').type, 'app-todo');
});
