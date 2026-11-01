/* Aba GERADOR (motor Sol 6.1): gera imagens, jogos, sites e apps; visualiza, baixa (.zip) e salva em Arquivos. 100% gratuito e offline. */
(function () {
  'use strict';
  const nav = document.querySelector('.tool-nav');
  const main = document.querySelector('.main');
  if (!nav || !main) return;

  // ---- botao no menu e secao ----
  const btn = document.createElement('button');
  btn.className = 'nav-btn'; btn.dataset.view = 'gerador';
  btn.innerHTML = '<span>✦</span> Gerador';
  nav.insertBefore(btn, nav.firstChild);
  btn.addEventListener('click', () => { document.querySelectorAll('.view').forEach(el => { el.hidden = (el.id !== 'view-gerador'); }); document.getElementById('overlay')?.click(); });

  const sec = document.createElement('section');
  sec.className = 'view content-view'; sec.id = 'view-gerador'; sec.hidden = true;
  sec.innerHTML = '<div class="page-heading"><p class="eyebrow">MOTOR SOL 6.1 · 100% GRÁTIS</p><h1>Gerador</h1><p>Descreva o que quer: imagem, jogo, site ou app. O JARVES planeja, cria os arquivos e deixa baixar.</p></div>' +
    '<div class="panel"><label>O que criar?<textarea id="genPrompt" placeholder="Ex.: paisagem de mar ao por do sol · jogo da cobrinha · site de pizzaria · calculadora"></textarea></label>' +
    '<div class="row"><select id="genType" aria-label="Tipo"><option value="auto">Automático</option><option value="imagem">Imagem (SVG/PNG)</option><option value="jogo">Jogo HTML</option><option value="site">Site (HTML+CSS+JS)</option><option value="app-todo">App: tarefas</option><option value="app-calc">App: calculadora</option></select>' +
    '<select id="genEngine" aria-label="Motor"><option value="base">Motor base (offline)</option><option value="ia">IA do Ollama (se ligado)</option></select>' +
    '<button class="primary-btn" id="genGo" type="button">✦ Gerar</button></div></div>' +
    '<div class="panel" id="genOut" hidden><h3>Plano</h3><ol id="genPlan"></ol><h3>Arquivos</h3><div class="list" id="genFiles"></div>' +
    '<div class="row"><button class="secondary-btn" id="genZip" type="button">⇩ Baixar tudo (.zip)</button><button class="secondary-btn" id="genSave" type="button">▤ Salvar em Arquivos</button><button class="secondary-btn" id="genPng" type="button" hidden>🖼 Baixar PNG</button></div>' +
    '<div class="status" id="genStatus"></div><h3>Pré-visualização</h3><iframe id="genFrame" title="Pré-visualização" sandbox="allow-scripts" style="width:100%;height:480px;border:1px solid var(--line);border-radius:12px;background:#fff"></iframe></div>';
  main.appendChild(sec);

  const $ = (id) => document.getElementById(id);
  let current = null;
  const status = (t) => { $('genStatus').textContent = t; };

  // ---- download (navegador e app Android) ----
  function download(name, blob) {
    if (window.AndroidBridge && window.AndroidBridge.saveFile) {
      const fr = new FileReader();
      fr.onload = () => { window.AndroidBridge.saveFile(name, String(fr.result).split(',')[1], blob.type || 'application/octet-stream'); status('Salvo em Downloads: ' + name); };
      fr.readAsDataURL(blob); return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ---- ZIP (sem compressao) ----
  const CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function makeZip(files) {
    const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
    const u16 = (v) => [v & 255, (v >> 8) & 255], u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    for (const f of files) {
      const name = enc.encode(f.name), data = enc.encode(f.content), crc = crc32(data);
      const local = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]);
      parts.push(local, name, data);
      central.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name);
      offset += local.length + name.length + data.length;
    }
    const csize = central.reduce((n, p) => n + p.length, 0);
    const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(csize), ...u32(offset), 0, 0]);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  // ---- previa: embute css/js do site ----
  function previewDoc(files) {
    const main = files.find(f => /\.html?$/.test(f.name)); if (!main) return '';
    let h = main.content;
    h = h.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/g, (m, n) => { const f = files.find(x => x.name === n); return f ? '<style>' + f.content + '</style>' : m; });
    h = h.replace(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g, (m, n) => { const f = files.find(x => x.name === n); return f ? '<script>' + f.content.replace(/<\/script/gi, '<\\/script') + '<\/script>' : m; });
    return h;
  }

  function show(res) {
    current = res;
    $('genOut').hidden = false;
    const ol = $('genPlan'); ol.innerHTML = ''; res.plan.forEach(p => { const li = document.createElement('li'); li.textContent = p; ol.appendChild(li); });
    const list = $('genFiles'); list.innerHTML = '';
    res.files.forEach(f => {
      const row = document.createElement('div'); row.className = 'row';
      const lbl = document.createElement('span'); lbl.style.flex = '1'; lbl.textContent = f.name + ' · ' + Math.max(1, Math.round(f.content.length / 1024)) + ' KB';
      const b = document.createElement('button'); b.className = 'secondary-btn'; b.type = 'button'; b.textContent = '⇩ Baixar';
      b.addEventListener('click', () => download(f.name, new Blob([f.content], { type: f.mime || 'text/plain' })));
      row.append(lbl, b); list.appendChild(row);
    });
    const svg = res.files.find(f => f.name.endsWith('.svg'));
    $('genPng').hidden = !svg;
    $('genFrame').srcdoc = svg ? '<body style="margin:0;background:#000"><div style="max-width:100%">' + svg.content.replace('width="1024" height="768"', 'style="width:100%;height:auto"') + '</div></body>' : previewDoc(res.files);
    status('Pronto. ' + res.files.length + ' arquivo(s).');
  }

  // ---- IA do Ollama: pede o HTML e extrai o codigo ----
  async function viaIA(prompt, type) {
    const sys = 'Você gera projetos web completos. Responda SOMENTE com um bloco ```html contendo UM arquivo HTML autocontido (CSS e JS inline), funcional, responsivo e sem dependências externas. Sem explicações.';
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: (type === 'imagem' ? 'Crie uma imagem em SVG inline dentro de um HTML: ' : 'Crie: ') + prompt, systemPrompt: sys, stream: false, provider: 'auto' }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'falha na IA');
    const m = String(j.content || '').match(/```(?:html)?\s*([\s\S]*?)```/i);
    const code = (m ? m[1] : j.content || '').trim();
    if (!/<html|<!doctype|<svg|<canvas|<body/i.test(code)) throw new Error('A IA não devolveu HTML utilizável (modelo ' + (j.model || '?') + ').');
    return { type: type || 'auto', plan: ['Enviar o pedido ao modelo ' + (j.model || ''), 'Extrair o HTML gerado', 'Conferir e abrir a pré-visualização'], files: [{ name: 'gerado.html', mime: 'text/html', content: code }] };
  }

  $('genGo').addEventListener('click', async () => {
    const prompt = $('genPrompt').value.trim();
    if (!prompt) { status('Escreva o que quer criar.'); $('genOut').hidden = false; return; }
    const type = $('genType').value;
    $('genGo').disabled = true; status('Gerando...'); $('genOut').hidden = false;
    try {
      let res;
      if ($('genEngine').value === 'ia') {
        try { res = await viaIA(prompt, type); }
        catch (e) { status('IA indisponível (' + e.message + '). Usando o motor base.'); res = window.JARVES_BASE.generate(prompt, type); }
      } else res = window.JARVES_BASE.generate(prompt, type);
      show(res);
    } catch (e) { status('Erro: ' + e.message); }
    finally { $('genGo').disabled = false; }
  });
  $('genZip').addEventListener('click', () => { if (current) download('jarves-projeto.zip', makeZip(current.files)); });
  $('genSave').addEventListener('click', async () => {
    if (!current) return;
    let n = 0;
    for (const f of current.files) {
      const bytes = new TextEncoder().encode(f.content); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      try { const r = await fetch('/api/files/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, mime: f.mime || 'text/plain', data: btoa(bin) }) }); if (r.ok) n++; } catch { /* segue */ }
    }
    status(n + ' arquivo(s) salvo(s) em "Arquivos e código".');
  });
  $('genPng').addEventListener('click', () => {
    const svg = current && current.files.find(f => f.name.endsWith('.svg')); if (!svg) return;
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = 1024; c.height = 768; c.getContext('2d').drawImage(img, 0, 0); c.toBlob(b => download('imagem.png', b), 'image/png'); };
    img.onerror = () => status('Não foi possível converter para PNG; baixe o .svg.');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.content);
  });
})();
