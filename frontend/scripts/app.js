document.addEventListener('DOMContentLoaded', () => {
  // Theme
  document.documentElement.setAttribute('data-theme', state.theme);
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  document.getElementById('btnMenu').addEventListener('click', openSidebar);
  document.getElementById('btnCloseSidebar').addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // View switching
  function setView(v) {
    state.view = v;
    document.querySelectorAll('.view').forEach(el => { el.hidden = (el.id !== 'view-' + v); });
    if (v === 'agents') loadAgents();
    if (v === 'files') loadFiles();
    if (v === 'memory') loadMemory();
    if (v === 'tasks') loadTasks();
    if (v === 'settings') loadSettings();
    if (v === 'diagnostics') loadDiagnostics();
    if (v === 'reports') loadReports();
  }
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => { setView(btn.dataset.view); closeSidebar(); });
  });
  // default chat view
  setView('chat');

  // Conversations
  async function loadConversations(search = '') {
    try {
      const list = await api.listConversations(search);
      state.conversations = list;
      renderConversations();
    } catch (e) { toast(e.message, 'error'); }
  }
  function renderConversations() {
    const el = document.getElementById('convList');
    el.innerHTML = '';
    for (const c of state.conversations) {
      const item = document.createElement('div');
      item.className = 'conv-item' + (c.id === state.currentConversationId ? ' active' : '');
      const title = document.createElement('div');
      title.className = 'conv-title';
      title.textContent = c.title || 'Sem titulo';
      const ren = document.createElement('button');
      ren.className = 'conv-del';
      ren.textContent = '✎';
      ren.title = 'Renomear';
      ren.addEventListener('click', async (e) => {
        e.stopPropagation();
        const nt = prompt('Novo titulo:', c.title || '');
        if (!nt) return;
        await api.updateConversation(c.id, { title: nt });
        if (state.currentConversationId === c.id) document.getElementById('convTitle').textContent = nt;
        loadConversations();
      });
      const del = document.createElement('button');
      del.className = 'conv-del';
      del.textContent = '🗑';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Excluir conversa?')) return;
        await api.deleteConversation(c.id);
        if (state.currentConversationId === c.id) { state.currentConversationId = null; state.messages = []; renderChat(); }
        loadConversations();
      });
      item.addEventListener('click', () => selectConversation(c.id));
      item.appendChild(title);
      item.appendChild(ren);
      item.appendChild(del);
      el.appendChild(item);
    }
  }
  async function selectConversation(id) {
    try {
      const data = await api.getConversation(id);
      state.currentConversationId = id;
      state.messages = data.messages || [];
      document.getElementById('convTitle').textContent = data.title || 'Conversa';
      renderChat();
      loadConversations();
      closeSidebar();
    } catch (e) { toast(e.message, 'error'); }
  }
  function renderChat() {
    const area = document.getElementById('chatArea');
    area.replaceChildren();
    const sugBar = document.getElementById('suggestions'); if (sugBar) sugBar.hidden = state.messages.length > 0;
    if (!state.messages.length) {
      const welcome = document.createElement('div');
      welcome.className = 'welcome';
      welcome.innerHTML = '<div class="welcome-orb">J</div><p class="eyebrow">JARVES AI · V1000</p><h1>Como posso ajudar<br><span>você hoje?</span></h1><p class="welcome-copy">Pergunte, crie, programe ou organize suas ideias. Sua próxima descoberta começa aqui.</p><div class="welcome-chips"><button type="button" data-prompt="Explique como você pode me ajudar.">✦ Conhecer o JARVES</button><button type="button" data-prompt="Ajude-me a criar um projeto de software.">⌘ Criar um projeto</button><button type="button" data-prompt="Analise este código e sugira melhorias.">⌁ Analisar código</button></div>';
      welcome.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
        const input = document.getElementById('input');
        input.value = button.dataset.prompt;
        input.focus();
      }));
      area.appendChild(welcome);
      return;
    }
    for (const m of state.messages) appendMessageBubble(m.role, m.content, m);
    area.scrollTop = area.scrollHeight;
  }
  function appendMessageBubble(role, content, meta = {}) {
    const area = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : (meta.error ? 'error' : 'assistant'));
    const body = document.createElement('div');
    body.className = 'msg-body';
    body.innerHTML = renderMarkdown(content || '');
    div.appendChild(body);
    if (meta.model || meta.provider) {
      const m = document.createElement('div');
      m.className = 'msg-meta';
      m.textContent = [meta.provider, meta.model].filter(Boolean).join(' • ');
      div.appendChild(m);
    }
    if (role === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';
      const copy = document.createElement('button');
      copy.textContent = 'Copiar';
      copy.addEventListener('click', () => { navigator.clipboard.writeText(content || ''); toast('Copiado'); });
      const retry = document.createElement('button');
      retry.textContent = 'Repetir';
      retry.addEventListener('click', () => { if (state.generating) return; const lastUser = [...state.messages].reverse().find(x => x.role === 'user'); if (lastUser) { document.getElementById('input').value = lastUser.content; sendMessage(); } });
      const speak = document.createElement('button');
      speak.textContent = 'Ler';
      speak.addEventListener('click', () => { if (window.speakText) window.speakText(content || ''); });
      actions.appendChild(copy);
      actions.appendChild(speak);
      actions.appendChild(retry);
      div.appendChild(actions);
    }
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  }
  function createStreamingBubble() {
    const area = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = 'msg assistant';
    const body = document.createElement('div');
    body.className = 'msg-body';
    div.appendChild(body);
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return { div, body };
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('input');
    const text = input.value.trim();
    if (!text) return;
    if (state.generating) return;
    input.value = '';
    saveDraft('');
    // ensure conversation
    if (!state.currentConversationId) {
      try {
        const c = await api.createConversation({ title: text.slice(0, 60) });
        state.currentConversationId = c.id;
        document.getElementById('convTitle').textContent = c.title;
      } catch (e) { toast(e.message, 'error'); return; }
    }
    document.querySelectorAll('#chatArea .welcome').forEach(el => el.remove()); // painel inicial nao pode ficar acima das mensagens
    const sug = document.getElementById('suggestions'); if (sug) sug.hidden = true;
    state.messages.push({ role: 'user', content: text });
    appendMessageBubble('user', text);
    state.generating = true;
    updateGeneratingUI(true);
    const requestId = 'req-' + Date.now();
    state.currentRequestId = requestId;
    const bubble = createStreamingBubble();
    let full = '';
    let finalModel = state.selectedModel;
    let finalProvider = state.selectedProvider;
    let stopped = false;
    try {
      let res;
      try {
        res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.currentConversationId,
          message: text,
          provider: state.selectedProvider,
          model: state.selectedModel,
          stream: true,
          requestId,
        }),
        });
      } catch (networkError) {
        throw new Error(window.jarvesNetworkHint ? window.jarvesNetworkHint(networkError) : 'Sem conexão com o servidor. Inicie o JARVES pelo script de inicialização.');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      if (!res.body || !res.body.getReader) {
        const payload = await res.json().catch(() => ({}));
        full = payload.content || payload.message || '';
        bubble.body.textContent = full || 'O servidor respondeu sem conteúdo.';
      } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          let json;
          try { json = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (json.type === 'delta') {
            full += json.delta;
            bubble.body.innerHTML = renderMarkdown(full);
            const area = document.getElementById('chatArea'); area.scrollTop = area.scrollHeight;
          } else if (json.type === 'done') {
            finalModel = json.model || finalModel;
            finalProvider = json.provider || finalProvider;
          } else if (json.type === 'saved') {
            state.currentConversationId = json.conversationId || state.currentConversationId;
          } else if (json.type === 'error') {
            if (json.aborted) { stopped = true; continue; }
            throw new Error(json.error);
          }
        }
      }
      }
      if (stopped) bubble.body.innerHTML = renderMarkdown(full) + '\n\n[geracao interrompida]';
      state.messages.push({ role: 'assistant', content: full, model: finalModel, provider: finalProvider });
      // meta
      const meta = document.createElement('div');
      meta.className = 'msg-meta';
      meta.textContent = [finalProvider, finalModel].filter(Boolean).join(' • ');
      bubble.div.appendChild(meta);
      loadConversations();
    } catch (e) {
      bubble.div.classList.add('error');
      bubble.body.textContent = 'Erro: ' + e.message;
      state.messages.push({ role: 'assistant', content: '', error: e.message });
    } finally {
      state.generating = false;
      state.currentRequestId = null;
      updateGeneratingUI(false);
      loadConversations(); // tambem apos erro: a conversa ja foi criada e gravada
    }
  }
  function updateGeneratingUI(gen) {
    document.getElementById('btnSend').disabled = gen;
    document.getElementById('btnStop').disabled = !gen;
    const sb = document.getElementById('statusBar');
    if (gen) sb.innerHTML = '<span class="thinking"><span class="core"></span> JARVES AI pensando...</span>';
    else sb.textContent = '';
  }
  document.getElementById('btnSend').addEventListener('click', sendMessage);
  document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  // draft save
  const inputEl = document.getElementById('input');
  inputEl.value = loadDraft();
  inputEl.addEventListener('input', () => saveDraft(inputEl.value));

  document.getElementById('btnStop').addEventListener('click', async () => {
    if (state.currentRequestId) {
      try { await api.cancel(state.currentRequestId); } catch {}
    }
  });
  // Voice input (speech-to-text) if supported
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btnVoice = document.getElementById('btnVoice');
  if (SpeechRec) {
    const rec = new SpeechRec();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;
    let listening = false;
    btnVoice.addEventListener('click', () => {
      if (listening) { rec.stop(); return; }
      listening = true; btnVoice.textContent = 'Ouvindo...';
      try { rec.start(); } catch { listening = false; btnVoice.textContent = 'Voz'; }
    });
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const input = document.getElementById('input');
      input.value = (input.value ? input.value + ' ' : '') + t;
      saveDraft(input.value);
    };
    rec.onend = () => { listening = false; btnVoice.textContent = 'Voz'; };
    rec.onerror = () => { listening = false; btnVoice.textContent = 'Voz'; };
  } else {
    btnVoice.disabled = true; btnVoice.title = 'Nao suportado neste navegador';
  }
  // Text-to-speech helper for messages
  window.speakText = (text) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    window.speechSynthesis.speak(u);
  };

  document.getElementById('btnNewChat').addEventListener('click', () => {
    state.currentConversationId = null;
    state.messages = [];
    document.getElementById('convTitle').textContent = 'Nova conversa';
    document.getElementById('chatArea').innerHTML = '';
    closeSidebar();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    document.getElementById('chatArea').innerHTML = '';
  });
  document.getElementById('btnExport').addEventListener('click', () => {
    const data = JSON.stringify(state.messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'conversa.json'; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('searchHistory').addEventListener('input', (e) => {
    loadConversations(e.target.value);
  });

  // Theme
  document.getElementById('btnTheme').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    saveTheme(state.theme);
  });

  // Models
  async function loadModels() {
    try {
      const r = await api.listModels();
      // Sempre segue o provedor ativo no servidor. Antes ficava preso no primeiro valor e, depois de
      // trocar o provedor em Configuracoes, o chat continuava usando provedor/modelo antigos.
      state.selectedProvider = r.provider;
      state.models = r.models || [];
      const sel = document.getElementById('modelSelect');
      sel.innerHTML = '';
      for (const m of state.models) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.id;
        sel.appendChild(opt);
      }
      const ids = state.models.map(m => m.id);
      // Prioridade: escolha atual (se ainda existe no provedor) > modelo configurado > primeiro da lista.
      if (state.selectedModel && ids.includes(state.selectedModel)) { /* mantem */ }
      else if (r.selected && ids.includes(r.selected)) state.selectedModel = r.selected;
      else state.selectedModel = ids[0] || r.selected || null;
      if (state.selectedModel) sel.value = state.selectedModel;
      if (!state.models.length) { const o = document.createElement('option'); o.value = ''; o.textContent = r.error ? 'sem modelos (veja o aviso)' : 'nenhum modelo instalado'; sel.appendChild(o); }
    } catch (e) { toast('Nao foi possivel listar modelos: ' + e.message, 'error'); }
  }
  document.getElementById('modelSelect').addEventListener('change', (e) => {
    state.selectedModel = e.target.value;
  });
  loadModels();

  // Suggestions
  const suggestions = ['Explique um conceito', 'Revise meu codigo', 'Crie um plano de estudo', 'Analise um arquivo'];
  const sugEl = document.getElementById('suggestions');
  for (const s of suggestions) {
    const b = document.createElement('button');
    b.className = 'suggestion';
    b.textContent = s;
    b.addEventListener('click', () => { document.getElementById('input').value = s; });
    sugEl.appendChild(b);
  }

  // Agents
  async function loadAgents() {
    try {
      state.agents = await api.listAgents();
      const grid = document.getElementById('agentsGrid');
      grid.innerHTML = '';
      for (const a of state.agents) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.description)}</p><small>${escapeHtml(a.id)}</small>`;
        grid.appendChild(card);
      }
      const sel = document.getElementById('agentSelect');
      sel.innerHTML = '';
      for (const a of state.agents) {
        const opt = document.createElement('option');
        opt.value = a.id; opt.textContent = a.name;
        sel.appendChild(opt);
      }
    } catch (e) { toast(e.message, 'error'); }
  }
  document.getElementById('btnRunAgent').addEventListener('click', async () => {
    const id = document.getElementById('agentSelect').value;
    const task = document.getElementById('agentTask').value.trim();
    if (!task) return toast('Tarefa vazia', 'error');
    try {
      const t = await api.createTask({ goal: task, agentId: id, autoRun: true });
      document.getElementById('agentResult').textContent = 'Tarefa criada: ' + t.id + '\nAcompanhe na aba Tarefas.';
    } catch (e) { toast(e.message, 'error'); }
  });

  // Tasks
  async function loadTasks() {
    try {
      const list = await api.listTasks();
      const el = document.getElementById('taskList');
      el.innerHTML = '';
      for (const t of list) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div><div class="title">${escapeHtml(t.goal)}</div><div class="meta">${escapeHtml(t.status)} • ${escapeHtml(t.id.slice(0,8))}</div></div>`;
        const btns = document.createElement('div');
        const run = document.createElement('button'); run.className='secondary-btn'; run.textContent='Executar'; run.addEventListener('click', async () => { const r = await api.runTask(t.id); document.getElementById('planPreview').textContent = JSON.stringify(r, null, 2); loadTasks(); });
        const cancel = document.createElement('button'); cancel.className='secondary-btn'; cancel.textContent='Cancelar'; cancel.addEventListener('click', async () => { await api.cancelTask(t.id); loadTasks(); });
        const view = document.createElement('button'); view.className='secondary-btn'; view.textContent='Ver'; view.addEventListener('click', async () => { const r = await api.getTask(t.id); document.getElementById('planPreview').textContent = JSON.stringify(r, null, 2); });
        btns.appendChild(view); btns.appendChild(run); btns.appendChild(cancel);
        item.appendChild(btns);
        el.appendChild(item);
      }
    } catch (e) { toast(e.message, 'error'); }
  }
  document.getElementById('btnPlan').addEventListener('click', async () => {
    const goal = document.getElementById('taskGoal').value.trim();
    if (!goal) return;
    try {
      const r = await api.plan(goal);
      document.getElementById('planPreview').textContent = JSON.stringify(r, null, 2);
    } catch (e) { toast(e.message, 'error'); }
  });
  document.getElementById('btnRunTask').addEventListener('click', async () => {
    const goal = document.getElementById('taskGoal').value.trim();
    if (!goal) return;
    try {
      const t = await api.createTask({ goal, autoRun: true });
      document.getElementById('planPreview').textContent = 'Criada: ' + t.id;
      loadTasks();
    } catch (e) { toast(e.message, 'error'); }
  });

  // Files
  async function loadFiles() {
    try {
      const r = await api.listFiles();
      const el = document.getElementById('fileList');
      el.innerHTML = '';
      for (const f of (r.files || [])) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div><div class="title">${escapeHtml(f.name)}</div><div class="meta">${f.size} bytes • ${escapeHtml(f.kind || '')}</div></div>`;
        const del = document.createElement('button'); del.className='secondary-btn'; del.textContent='Excluir';
        del.addEventListener('click', async () => { if (confirm('Excluir arquivo?')) { await api.deleteFile(f.id); loadFiles(); } });
        const view = document.createElement('button'); view.className='secondary-btn'; view.textContent='Ler';
        view.addEventListener('click', async () => {
          try { const c = await api.fileContent(f.id); document.getElementById('codeAnalysis').textContent = c.content.slice(0, 5000); } catch (e) { toast(e.message, 'error'); }
        });
        const viewSite = document.createElement('button'); viewSite.className='secondary-btn'; viewSite.textContent='Ver como site';
        viewSite.addEventListener('click', () => { window.open('/preview/' + f.id, '_blank'); });
        const dl = document.createElement('button'); dl.className='secondary-btn'; dl.textContent='Exportar';
        dl.addEventListener('click', async () => {
          try {
            const c = await api.fileContent(f.id);
            const blob = new Blob([c.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = f.name; a.click();
            URL.revokeObjectURL(url);
          } catch (e) { toast(e.message, 'error'); }
        });
        const btns = document.createElement('div'); btns.appendChild(view); btns.appendChild(viewSite); btns.appendChild(dl); btns.appendChild(del);
        item.appendChild(btns);
        el.appendChild(item);
      }
    } catch (e) { toast(e.message, 'error'); }
  }
  function bytesToBase64(bytes) {
    let binary = '';
    const CHUNK = 0x8000; // blocos pequenos: String.fromCharCode(...arrayGrande) excede o limite de argumentos
    for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    return btoa(binary);
  }
  document.getElementById('btnUpload').addEventListener('click', async () => {
    const input = document.getElementById('fileInput');
    const files = input.files;
    if (!files || !files.length) return toast('Selecione arquivos', 'error');
    const status = document.getElementById('uploadStatus');
    status.textContent = 'Enviando...';
    for (const file of files) {
      const buf = await file.arrayBuffer();
      const base64 = bytesToBase64(new Uint8Array(buf));
      try {
        await api.uploadFile({ name: file.name, mime: file.type, data: base64 });
      } catch (e) { toast(file.name + ': ' + e.message, 'error'); }
    }
    status.textContent = 'Concluido';
    loadFiles();
  });
  document.getElementById('btnAnalyzeCode').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value;
    try {
      const r = await api.analyzeCode(code);
      document.getElementById('codeAnalysis').textContent = JSON.stringify(r, null, 2);
    } catch (e) { toast(e.message, 'error'); }
  });

  // Memory
  async function loadMemory(q = '') {
    try {
      let list;
      if (q) list = await api.searchMemory(q); else list = await api.listMemory();
      const el = document.getElementById('memList');
      el.innerHTML = '';
      for (const m of list) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div><div class="title">${escapeHtml(m.subject || m.kind)}</div><div class="meta">${escapeHtml(m.content.slice(0,120))}</div></div>`;
        const del = document.createElement('button'); del.className='secondary-btn'; del.textContent='Excluir';
        del.addEventListener('click', async () => { if (confirm('Excluir memoria?')) { await api.deleteMemory(m.id); loadMemory(document.getElementById('memSearch').value); } });
        item.appendChild(del);
        el.appendChild(item);
      }
    } catch (e) { toast(e.message, 'error'); }
  }
  document.getElementById('btnSaveMem').addEventListener('click', async () => {
    const content = document.getElementById('memContent').value.trim();
    if (!content) return toast('Conteudo vazio', 'error');
    try {
      await api.createMemory({
        kind: document.getElementById('memKind').value,
        subject: document.getElementById('memSubject').value.trim() || null,
        content,
      });
      document.getElementById('memContent').value = '';
      document.getElementById('memSubject').value = '';
      loadMemory();
    } catch (e) { toast(e.message, 'error'); }
  });
  document.getElementById('memSearch').addEventListener('input', (e) => loadMemory(e.target.value));

  // Settings and AI provider manager
  let savedApiKeyPresent = false;
  function switchSettingsTab(name) {
    document.querySelectorAll('[data-settings-tab]').forEach(b => b.classList.toggle('active', b.dataset.settingsTab === name));
    document.querySelectorAll('[data-settings-panel]').forEach(panel => {
      const active = panel.dataset.settingsPanel === name;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (name === 'models') refreshModelManager();
  }
  document.querySelectorAll('[data-settings-tab]').forEach(b => b.addEventListener('click', () => switchSettingsTab(b.dataset.settingsTab)));

  async function loadSettings() {
    try {
      const r = await api.getSettings();
      const settings = r.settings || {};
      savedApiKeyPresent = Boolean(settings.openai_api_key);
      const form = document.getElementById('settingsForm');
      form.innerHTML = '';
      const fields = [
        { key: 'ai_provider', label: 'Provedor ativo', type: 'select', options: ['auto','ollama','openai-compatible','base','mock'] },
        { key: 'ollama_base_url', label: 'Endereço do Ollama', type: 'url', placeholder: 'http://127.0.0.1:11434' },
        { key: 'ollama_model', label: 'Modelo Ollama', type: 'text', placeholder: 'qwen3.5:4b' },
        { key: 'openai_base_url', label: 'Endpoint compatível', type: 'url', placeholder: 'https://api.exemplo.com/v1' },
        { key: 'openai_model', label: 'Modelo remoto', type: 'text', placeholder: 'nome-do-modelo' },
        { key: 'ai_timeout_ms', label: 'Tempo limite (ms)', type: 'number' },
        { key: 'ai_quality', label: 'Qualidade de resposta', type: 'select', options: ['low','medium','high'] },
        { key: 'theme', label: 'Tema', type: 'select', options: ['dark','light'] },
        { key: 'language', label: 'Idioma', type: 'text', placeholder: 'pt-BR' },
      ];
      for (const f of fields) {
        const label = document.createElement('label');
        label.textContent = f.label;
        let input;
        if (f.type === 'select') {
          input = document.createElement('select');
          for (const o of f.options) { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; input.appendChild(opt); }
        } else {
          input = document.createElement('input'); input.type = f.type;
          if (f.placeholder) input.placeholder = f.placeholder;
        }
        input.dataset.key = f.key;
        const dflt = (r.defaults || {})[f.key];
        const fallback = { ai_quality: 'medium', theme: state.theme }[f.key];
        input.value = settings[f.key] !== undefined ? settings[f.key] : (dflt !== undefined ? dflt : (fallback !== undefined ? fallback : ''));
        label.appendChild(input); form.appendChild(label);
      }
      document.getElementById('apiKeyInput').value = '';
      document.getElementById('apiKeyStatus').textContent = savedApiKeyPresent ? 'Uma chave está salva. Por segurança, ela não é exibida.' : 'Nenhuma chave cadastrada.';
      switchSettingsTab('connection');
    } catch (e) { toast(e.message, 'error'); }
  }

  document.getElementById('btnSaveSettings').addEventListener('click', async () => {
    const form = document.getElementById('settingsForm');
    const inputs = [...form.querySelectorAll('[data-key]')];
    const status = document.getElementById('settingsStatus');
    const save = document.getElementById('btnSaveSettings');
    save.disabled = true; status.textContent = 'Salvando configurações...';
    let ok = true;
    for (const inp of inputs) {
      const value = inp.value.trim();
      try {
        // Campo vazio = padrao: remove a configuracao em vez de enviar '' (que o servidor recusava,
        // fazendo o salvamento falhar na primeira vez).
        if (value === '') await api.deleteSetting(inp.dataset.key);
        else await api.setSetting(inp.dataset.key, value);
      } catch (e) { ok = false; toast(inp.dataset.key + ': ' + e.message, 'error'); }
    }
    if (ok) { state.selectedModel = null; state.selectedProvider = null; }
    status.textContent = ok ? 'Configurações salvas. A conexão pode ser testada agora.' : 'Algumas configurações não foram salvas. Revise os campos destacados.';
    save.disabled = false;
    if (ok) loadModels();
  });

  async function refreshModelManager() {
    const status = document.getElementById('modelManagerStatus');
    const list = document.getElementById('modelManagerList');
    status.textContent = 'Consultando modelos disponíveis...'; list.innerHTML = '';
    const provider = document.querySelector('#settingsForm [data-key="ai_provider"]')?.value || undefined;
    try {
      const r = await api.listModels(provider);
      const models = Array.isArray(r.models) ? r.models : [];
      status.textContent = r.error ? `Provedor ${r.provider}: ${r.error}` : `${models.length} modelo(s) encontrado(s) em ${r.provider}.`;
      if (!models.length) {
        const empty = document.createElement('p'); empty.className = 'muted-copy';
        empty.textContent = r.error ? 'Verifique o endereço, a chave e se o serviço está ativo.' : 'Nenhum modelo retornado. Instale/adicione um modelo no provedor.';
        list.appendChild(empty); return;
      }
      for (const model of models) {
        const item = document.createElement('div'); item.className = 'model-manager-item';
        const info = document.createElement('div');
        const name = document.createElement('strong'); name.textContent = model.name || model.id;
        const meta = document.createElement('small'); meta.textContent = [model.provider || r.provider, model.size ? `${Math.round(model.size / 1e9 * 10) / 10} GB` : ''].filter(Boolean).join(' · ');
        info.append(name, meta);
        const use = document.createElement('button'); use.className = 'secondary-btn'; use.type = 'button'; use.textContent = 'Usar modelo';
        use.addEventListener('click', async () => {
          const key = r.provider === 'ollama' ? 'ollama_model' : 'openai_model';
          try { await api.setSetting(key, model.id); state.selectedModel = model.id; loadModels(); const field = document.querySelector(`#settingsForm [data-key="${key}"]`); if (field) field.value = model.id; toast(`Modelo ${model.id} selecionado.`); }
          catch (e) { toast(e.message, 'error'); }
        });
        item.append(info, use); list.appendChild(item);
      }
    } catch (e) { status.textContent = 'Falha ao consultar modelos: ' + e.message; }
  }
  document.getElementById('btnRefreshModels').addEventListener('click', refreshModelManager);
  document.getElementById('btnPullModel').addEventListener('click', async () => {
    const input = document.getElementById('ollamaPullName');
    const model = input.value.trim();
    const status = document.getElementById('modelManagerStatus');
    if (!model) { status.textContent = 'Informe o nome de um modelo Ollama.'; return; }
    const button = document.getElementById('btnPullModel'); button.disabled = true;
    status.textContent = `Baixando ${model}. O download pode demorar e consumir espaço em disco...`;
    try { const result = await api.pullModel(model); status.textContent = `Modelo ${result.model} instalado: ${result.status}.`; input.value = ''; await refreshModelManager(); }
    catch (e) { status.textContent = 'Falha no download: ' + e.message; }
    finally { button.disabled = false; }
  });

  document.getElementById('btnTestProvider').addEventListener('click', async () => {
    const status = document.getElementById('settingsStatus');
    status.textContent = 'Testando conexão com o provedor...';
    const provider = document.querySelector('#settingsForm [data-key="ai_provider"]')?.value;
    try {
      const r = await api.listModels(provider);
      if (r.error) throw new Error(r.error);
      status.textContent = `Conexão OK: ${r.models.length} modelo(s) disponível(is) em ${r.provider}.`;
    } catch (e) { status.textContent = 'Falha de conexão: ' + e.message; }
  });

  document.getElementById('btnSaveApiKey').addEventListener('click', async () => {
    const input = document.getElementById('apiKeyInput');
    const status = document.getElementById('apiKeyStatus');
    const key = input.value.trim();
    if (!key) { status.textContent = 'Cole uma chave válida antes de salvar.'; return; }
    try {
      await api.setSetting('openai_api_key', key);
      input.value = ''; savedApiKeyPresent = true;
      status.textContent = 'Chave salva. Ela não será exibida novamente.';
    } catch (e) { status.textContent = 'Não foi possível salvar: ' + e.message; }
  });
  document.getElementById('btnDeleteApiKey').addEventListener('click', async () => {
    const status = document.getElementById('apiKeyStatus');
    try {
      await api.deleteSetting('openai_api_key');
      savedApiKeyPresent = false; status.textContent = 'Chave removida.';
    } catch (e) { status.textContent = 'Falha ao remover chave: ' + e.message; }
  });
  // Diagnostics
  async function loadDiagnostics() {
    try {
      const r = await api.lastDiagnostics();
      renderDiagnostics(r);
    } catch (e) { /* none yet */ }
  }
  function renderDiagnostics(r) {
    if (!r) return;
    const s = r.summary || {};
    document.getElementById('diagSummary').textContent = `Total: ${s.totalErrors || 0} | Criticos: ${s.critical || 0} | Altos: ${s.high || 0} | Medios: ${s.medium || 0} | Baixos: ${s.low || 0} | Testes OK: ${s.testsPass || 0} | Falhas: ${s.testsFail || 0}`;
    const el = document.getElementById('diagErrors');
    el.innerHTML = '';
    for (const e of (r.errors || [])) {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `<div><div class="title">[${e.severity}] ${escapeHtml(e.name)}</div><div class="meta">${escapeHtml(e.file)}${e.line ? ':' + e.line : ''} • ${escapeHtml(e.category)} • ${escapeHtml(e.status)}</div><div class="meta">${escapeHtml(e.description)}</div></div>`;
      el.appendChild(item);
    }
    document.getElementById('diagRaw').textContent = JSON.stringify(r.checks || [], null, 2);
  }
  document.getElementById('btnRunDiag').addEventListener('click', async () => {
    const btn = document.getElementById('btnRunDiag');
    btn.disabled = true;
    document.getElementById('diagSummary').textContent = 'Executando diagnostico...';
    try {
      const r = await api.runDiagnostics();
      renderDiagnostics(r);
    } catch (e) { toast(e.message, 'error'); }
    finally { btn.disabled = false; }
  });
  document.getElementById('btnSpeedTest').addEventListener('click', async () => {
    const btn = document.getElementById('btnSpeedTest');
    btn.disabled = true;
    const status = document.getElementById('diagSummary');
    status.textContent = 'Testando velocidade...';
    const times = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      try { await fetch('/api/health', { cache: 'no-store' }); } catch {}
      times.push(performance.now() - t0);
    }
    const avg = (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1);
    const min = Math.min(...times).toFixed(1);
    status.textContent = `Latencia media: ${avg} ms (min ${min} ms) - ${times.map(t=>t.toFixed(0)).join(', ')} ms`;
    btn.disabled = false;
  });
  document.getElementById('btnDiag').addEventListener('click', async () => {
    try {
      const h = await api.health();
      const m = await api.listModels().catch(e => ({ error: e.message }));
      document.getElementById('diag').textContent = JSON.stringify({ health: h, models: m }, null, 2);
    } catch (e) { toast(e.message, 'error'); }
  });

  async function loadReports() {
    try {
      const r = await api.lastDiagnostics().catch(() => null); // 404 = ainda nao ha diagnostico (nao e erro)
      const el = document.getElementById('resolvedBugs');
      if (!r) { el.innerHTML = '<div class="status">Nenhum diagnostico executado ainda. Rode um em Diagnostico.</div>'; document.getElementById('reportRaw').textContent = ''; return; }
      el.innerHTML = '';
      for (const b of (r.resolvedBugs || [])) {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div><div class="title">${escapeHtml(b.id)}</div><div class="meta">${escapeHtml(b.file)} • ${escapeHtml(b.testResult)} • ${escapeHtml(b.timestamp)}</div></div>`;
        el.appendChild(item);
      }
      if (!(r.resolvedBugs || []).length) el.innerHTML = '<div class="status">Nenhum bug resolvido registrado.</div>';
      document.getElementById('reportRaw').textContent = JSON.stringify(r.summary || {}, null, 2);
    } catch (e) { toast(e.message, 'error'); }
  }
  document.getElementById('btnRefreshReports').addEventListener('click', loadReports);

  // PWA service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }

  // initial
  loadConversations();
});
