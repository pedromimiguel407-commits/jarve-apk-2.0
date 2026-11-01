/* JARVES BASE - IA base offline (sem Ollama, sem internet). Funciona dentro do navegador e do Node.
 * Entende conversa basica, contas, data/hora e cria jogos HTML prontos para jogar. */
(() => {
  'use strict';
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const MENU_TAG = '<!--menu-jogos-->';

  const HEAD = (title) => '<!DOCTYPE html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title>\n' +
    '<style>body{margin:0;background:#0b1020;color:#e7ebff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}canvas{background:#111830;border:2px solid #6c7cff;border-radius:8px;touch-action:none;max-width:96vw}button{font:inherit}</style></head><body>\n';

  const GAMES = {
    snake: { nome: 'Cobrinha', html: HEAD('Cobrinha') + `<h2>🐍 Cobrinha — <span id="s">0</span> pts</h2><canvas id="c" width="400" height="400"></canvas><p>Setas ou WASD • deslize no celular • Espaço reinicia</p>
<script>
const c=document.getElementById('c'),x=c.getContext('2d'),N=20,S=20;
let snake,dir,next,food,score,over,timer;
function reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};next=dir;score=0;over=false;place();document.getElementById('s').textContent=0;clearInterval(timer);timer=setInterval(tick,110);draw();}
function place(){do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}while(snake.some(p=>p.x===food.x&&p.y===food.y));}
function tick(){dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(p=>p.x===h.x&&p.y===h.y)){over=true;clearInterval(timer);draw();return;}
 snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;document.getElementById('s').textContent=score;place();}else snake.pop();draw();}
function draw(){x.fillStyle='#111830';x.fillRect(0,0,400,400);x.fillStyle='#ff5c7a';x.fillRect(food.x*S+2,food.y*S+2,S-4,S-4);
 snake.forEach((p,i)=>{x.fillStyle=i?'#6cf0a8':'#b6ffd6';x.fillRect(p.x*S+1,p.y*S+1,S-2,S-2);});
 if(over){x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,0,400,400);x.fillStyle='#fff';x.font='bold 24px system-ui';x.textAlign='center';x.fillText('Fim de jogo! Espaço reinicia',200,205);}}
function turn(dx,dy){if(dx===-dir.x&&dy===-dir.y)return;next={x:dx,y:dy};}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
 if(k==='arrowup'||k==='w')turn(0,-1);else if(k==='arrowdown'||k==='s')turn(0,1);else if(k==='arrowleft'||k==='a')turn(-1,0);else if(k==='arrowright'||k==='d')turn(1,0);else if(k===' ')reset();
 if(k.startsWith('arrow')||k===' ')e.preventDefault();});
let t0;c.addEventListener('touchstart',e=>{t0=e.touches[0];});
c.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-t0.clientX,dy=t.clientY-t0.clientY;if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1);});
reset();
<\/script></body></html>` },

    pong: { nome: 'Pong', html: HEAD('Pong') + `<h2>🏓 Pong — Você <span id="a">0</span> × <span id="b">0</span> PC</h2><canvas id="c" width="600" height="400"></canvas><p>Mouse, toque, W/S ou setas movem a raquete</p>
<script>
const c=document.getElementById('c'),x=c.getContext('2d'),W=600,H=400,PH=70;
let p=165,a=165,bx,by,vx,vy,ps=0,as=0;
function serve(d){bx=W/2;by=H/2;vx=4*d;vy=Math.random()*4-2;}
function clampP(v){return Math.max(0,Math.min(H-PH,v));}
function pos(y){const r=c.getBoundingClientRect();p=clampP((y-r.top)*(H/r.height)-PH/2);}
c.addEventListener('mousemove',e=>pos(e.clientY));
c.addEventListener('touchmove',e=>{pos(e.touches[0].clientY);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')p=clampP(p-26);if(k==='s'||k==='arrowdown')p=clampP(p+26);if(k.startsWith('arrow'))e.preventDefault();});
function loop(){
 a=clampP(a+Math.max(-3.4,Math.min(3.4,(by-PH/2)-a)));
 bx+=vx;by+=vy;
 if(by<6||by>H-6)vy=-vy;
 if(vx<0&&bx<24&&bx>10&&by>p&&by<p+PH){vx=Math.min(12,-vx*1.06);vy+=((by-(p+PH/2))/(PH/2))*3;}
 if(vx>0&&bx>W-24&&bx<W-10&&by>a&&by<a+PH){vx=-Math.min(12,vx*1.06);vy+=((by-(a+PH/2))/(PH/2))*3;}
 vy=Math.max(-9,Math.min(9,vy));
 if(bx<0){as++;serve(1);}if(bx>W){ps++;serve(-1);}
 document.getElementById('a').textContent=ps;document.getElementById('b').textContent=as;
 x.fillStyle='#111830';x.fillRect(0,0,W,H);x.fillStyle='#2b3566';for(let y=0;y<H;y+=24)x.fillRect(W/2-2,y,4,12);
 x.fillStyle='#6c7cff';x.fillRect(10,p,10,PH);x.fillStyle='#ff5c7a';x.fillRect(W-20,a,10,PH);
 x.fillStyle='#fff';x.beginPath();x.arc(bx,by,7,0,7);x.fill();
 requestAnimationFrame(loop);}
serve(1);loop();
<\/script></body></html>` },

    velha: { nome: 'Jogo da Velha', html: HEAD('Jogo da Velha') + `<style>#g{display:grid;grid-template-columns:repeat(3,100px);gap:8px}#g button{width:100px;height:100px;font-size:48px;background:#111830;color:#e7ebff;border:2px solid #6c7cff;border-radius:10px;cursor:pointer}</style>
<h2>⭕ Jogo da Velha</h2><p id="m">Você é o X. Sua vez!</p><div id="g"></div><p><button onclick="init()">Reiniciar</button></p>
<script>
const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let b,over;
function win(b){for(const l of L)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return b[l[0]];return b.includes('')?null:'E';}
function mm(b,t){const w=win(b);if(w==='O')return 1;if(w==='X')return -1;if(w==='E')return 0;let best=t==='O'?-2:2;
 for(let i=0;i<9;i++)if(!b[i]){b[i]=t;const s=mm(b,t==='O'?'X':'O');b[i]='';best=t==='O'?Math.max(best,s):Math.min(best,s);}return best;}
function ai(){let bi=-1,bs=-2;for(let i=0;i<9;i++)if(!b[i]){b[i]='O';const s=mm(b,'X');b[i]='';if(s>bs){bs=s;bi=i;}}b[bi]='O';}
function render(){const g=document.getElementById('g');g.innerHTML='';b.forEach((v,i)=>{const e=document.createElement('button');e.textContent=v;e.onclick=()=>play(i);g.appendChild(e);});}
function end(){const w=win(b);if(!w)return false;over=true;document.getElementById('m').textContent=w==='X'?'Você venceu! 🎉':w==='O'?'O computador venceu!':'Empate!';return true;}
function play(i){if(over||b[i])return;b[i]='X';if(!end()){ai();end();}render();}
function init(){b=Array(9).fill('');over=false;document.getElementById('m').textContent='Você é o X. Sua vez!';render();}
init();
<\/script></body></html>` },

    memoria: { nome: 'Jogo da Memória', html: HEAD('Jogo da Memória') + `<style>#g{display:grid;grid-template-columns:repeat(4,80px);gap:8px}#g button{width:80px;height:80px;font-size:36px;background:#111830;color:#e7ebff;border:2px solid #6c7cff;border-radius:10px;cursor:pointer}</style>
<h2>🧠 Memória — jogadas: <span id="n">0</span></h2><p id="m">Encontre todos os pares.</p><div id="g"></div><p><button onclick="init()">Reiniciar</button></p>
<script>
const E=['🐶','🐱','🦊','🐼','🐸','🐵','🦁','🐙'];
let cards,shown,open,lock,moves,found;
function init(){cards=[...E,...E].sort(()=>Math.random()-.5);shown=Array(16).fill(false);open=[];lock=false;moves=0;found=0;document.getElementById('n').textContent=0;document.getElementById('m').textContent='Encontre todos os pares.';render();}
function render(){const g=document.getElementById('g');g.innerHTML='';cards.forEach((v,i)=>{const e=document.createElement('button');e.textContent=shown[i]?v:'❓';e.onclick=()=>flip(i);g.appendChild(e);});}
function flip(i){if(lock||shown[i])return;shown[i]=true;open.push(i);render();
 if(open.length===2){moves++;document.getElementById('n').textContent=moves;const [p,q]=open;
  if(cards[p]===cards[q]){open=[];found++;if(found===8)document.getElementById('m').textContent='Parabéns! Você terminou em '+moves+' jogadas 🎉';}
  else{lock=true;setTimeout(()=>{shown[p]=false;shown[q]=false;open=[];lock=false;render();},700);}}}
init();
<\/script></body></html>` },
  };

  const GAME_WORDS = {
    snake: ['cobrinha', 'cobra', 'snake'],
    pong: ['pong', 'raquete', 'tenis de mesa'],
    velha: ['velha', 'tic tac', 'tictactoe', 'xis'],
    memoria: ['memoria', 'memory', 'pares'],
  };
  const ORDER = ['snake', 'pong', 'velha', 'memoria'];

  function gameReply(key) {
    const g = GAMES[key];
    return 'Pronto! Aqui está o **' + g.nome + '**, um jogo completo em um único arquivo HTML. Salve como `jogo.html` e abra no navegador (ou cole em *Arquivos e código*):\n\n```html\n' + g.html + '\n```\n\nQuer outro jogo, ou mudar algo neste (velocidade, cores, tamanho)?';
  }
  function menuReply() {
    return 'Vamos fazer um jogo! Antes de criar, me diga qual você quer (responda com o número ou o nome):\n\n1. **Cobrinha** (snake)\n2. **Pong** contra o computador\n3. **Jogo da Velha** contra o computador\n4. **Jogo da Memória** (pares de bichinhos)\n\nTodos saem em HTML pronto para jogar, no PC e no celular.';
  }

  function pickGame(q, menuBefore) {
    for (const k of ORDER) if (GAME_WORDS[k].some(w => new RegExp('(^|[^a-z])' + w + '([^a-z]|$)').test(q))) return k;
    if (menuBefore) { const m = q.match(/^\s*(?:opcao\s*)?([1-4])\b/); if (m) return ORDER[Number(m[1]) - 1]; }
    return null;
  }

  function tryMath(raw) {
    const s = String(raw).trim().replace(/^quanto (e|eh|da)\s+/i, '').replace(/[=?]+$/, '').trim();
    if (!/^[\d\s+\-*/().,%^x×÷]+$/.test(s) || !/[+\-*/%^x×÷]/.test(s) || !/\d/.test(s)) return null;
    const expr = s.replace(/,/g, '.').replace(/\^/g, '**').replace(/[x×]/g, '*').replace(/÷/g, '/');
    try {
      const v = Function('"use strict";return (' + expr + ')')();
      if (typeof v === 'number' && isFinite(v)) return Number(v.toPrecision(12)).toString();
    } catch { /* nao e uma conta valida */ }
    return null;
  }

  function reply(messages) {
    const msgs = Array.isArray(messages) ? messages : [];
    const lastUser = [...msgs].reverse().find(m => m.role === 'user');
    const user = String(lastUser?.content || '');
    const q = norm(user).trim();
    const prevAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
    const menuBefore = String(prevAssistant?.content || '').includes('Antes de criar, me diga qual você quer');

    const game = pickGame(q, menuBefore);
    const wantsGame = /(^|[^a-z])(jogo|jogos|game|games|joguinho)([^a-z]|$)/.test(q);
    if (game && (wantsGame || menuBefore || /cobrinha|snake|pong|velha|tictactoe|tic tac/.test(q))) return gameReply(game);
    if (wantsGame || (/(^|[^a-z])html([^a-z]|$)/.test(q) && /faz|cria|gera|monta/.test(q))) return menuReply();

    const m = tryMath(user);
    if (m !== null) return 'Resultado: **' + m + '**';
    if (/que horas|horas sao|hora atual/.test(q)) return 'Agora são ' + new Date().toLocaleTimeString('pt-BR') + '.';
    if (/data de hoje|que dia (e|eh) hoje|dia de hoje/.test(q)) return 'Hoje é ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    if (/^(oi|ola|opa|e ai|eai|bom dia|boa tarde|boa noite|hey|hello)\b/.test(q)) return 'Olá! Eu sou o JARVES, funcionando com a **IA base** (offline, sem precisar de internet). Posso criar jogos em HTML, fazer contas e responder o básico. Para conversar sobre qualquer assunto, instale o Ollama e um modelo: o JARVES detecta sozinho.\n\nO que vamos fazer?';
    if (/quem (e|eh) voce|seu nome|quem te criou/.test(q)) return 'Sou o JARVES AI. Agora estou na **IA base** local; se o Ollama estiver ligado, passo a usar o modelo dele automaticamente.';
    if (/ajuda|o que voce (faz|sabe)|comandos|funcoes/.test(q)) return 'Na **IA base** eu faço: jogos HTML prontos (cobrinha, pong, velha, memória), contas, data e hora. Com o **Ollama** ligado eu converso sobre qualquer assunto, escrevo textos e códigos. Digite "faz um jogo" para começar.';

    return 'Estou na **IA base** (offline), que entende jogos, contas, data/hora e o básico. Para esse tipo de pedido preciso de um modelo completo: instale o Ollama (ollama.com), rode `ollama pull qwen3:4b` e reabra o JARVES; ele detecta sozinho. Enquanto isso, que tal um jogo? Digite "faz um jogo".';
  }


  // ---------- Motor de geracao Sol 6.1 (offline): planeja e devolve arquivos ----------
  function seeded(text) {
    let seed = 0; for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function svgArt(prompt) {
    const q = norm(prompt), rnd = seeded(q || 'jarves');
    const night = /noite|lua|estrela|escuro|espaco|galaxia|cosmos/.test(q);
    const sea = /mar|oceano|praia|onda/.test(q), city = /cidade|predio|urban|cyber|futur/.test(q), forest = /floresta|arvore|mato|natureza|bosque/.test(q);
    const h = Math.floor(rnd() * 60) + (night ? 230 : 0);
    const top = night ? 'hsl(' + h + ',70%,8%)' : 'hsl(' + (h + 200) % 360 + ',75%,55%)';
    const mid = night ? 'hsl(' + (h + 40) + ',60%,22%)' : 'hsl(' + (h + 20) + ',90%,65%)';
    const bot = night ? 'hsl(' + (h + 60) + ',50%,32%)' : 'hsl(' + (h + 5) + ',95%,72%)';
    let o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768" width="1024" height="768">\n<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset=".6" stop-color="' + mid + '"/><stop offset="1" stop-color="' + bot + '"/></linearGradient>' +
      '<radialGradient id="glow"><stop offset="0" stop-color="' + (night ? '#fff7d6' : '#fff3b0') + '"/><stop offset="1" stop-color="' + (night ? '#fff7d6' : '#ffd36b') + '" stop-opacity="0"/></radialGradient></defs>\n';
    o += '<rect width="1024" height="768" fill="url(#sky)"/>\n';
    if (night) for (let i = 0; i < 90; i++) o += '<circle cx="' + Math.floor(rnd() * 1024) + '" cy="' + Math.floor(rnd() * 420) + '" r="' + (rnd() * 1.8 + .4).toFixed(1) + '" fill="#fff" opacity="' + (rnd() * .7 + .3).toFixed(2) + '"/>';
    const sx = 220 + Math.floor(rnd() * 580), sy = night ? 140 + Math.floor(rnd() * 80) : 330 + Math.floor(rnd() * 60);
    o += '\n<circle cx="' + sx + '" cy="' + sy + '" r="190" fill="url(#glow)"/><circle cx="' + sx + '" cy="' + sy + '" r="' + (night ? 48 : 70) + '" fill="' + (night ? '#f5f1dc' : '#fff1a8') + '"/>\n';
    const layer = (base, amp, col, step) => { let d = 'M0 768 L0 ' + base; for (let x = 0; x <= 1024; x += step) d += ' L' + x + ' ' + Math.floor(base - rnd() * amp); return '<path d="' + d + ' L1024 768 Z" fill="' + col + '"/>\n'; };
    if (!sea || forest) { o += layer(520, 190, night ? '#1a1642' : 'hsl(' + (h + 250) % 360 + ',35%,38%)', 64); o += layer(600, 120, night ? '#100d2e' : 'hsl(' + (h + 260) % 360 + ',40%,26%)', 48); }
    if (sea) {
      o += '<rect y="470" width="1024" height="298" fill="' + (night ? '#0a1d4a' : '#1f6fb5') + '"/>\n';
      for (let r = 0; r < 7; r++) { let d = 'M0 ' + (500 + r * 38); for (let x = 0; x <= 1024; x += 32) d += ' Q' + (x + 16) + ' ' + (500 + r * 38 + (x / 32 % 2 ? 12 : -12)) + ' ' + (x + 32) + ' ' + (500 + r * 38); o += '<path d="' + d + '" stroke="#ffffff" stroke-opacity=".28" fill="none" stroke-width="2"/>\n'; }
    }
    if (city) for (let x = 0; x < 1024; x += 56) { const bh = 120 + Math.floor(rnd() * 300); o += '<rect x="' + x + '" y="' + (768 - bh) + '" width="50" height="' + bh + '" fill="' + (night ? '#0b0a22' : '#2a2f55') + '"/>'; for (let y = 768 - bh + 14; y < 750; y += 24) if (rnd() > .45) o += '<rect x="' + (x + 10) + '" y="' + y + '" width="8" height="10" fill="#ffd76b"/><rect x="' + (x + 30) + '" y="' + y + '" width="8" height="10" fill="#7be8ff"/>'; o += '\n'; }
    if (forest) for (let i = 0; i < 22; i++) { const x = Math.floor(rnd() * 1024), t = 560 + Math.floor(rnd() * 120), s = 50 + Math.floor(rnd() * 60); o += '<rect x="' + (x - 5) + '" y="' + (t + s) + '" width="10" height="40" fill="#3a2414"/><polygon points="' + x + ',' + (t - s) + ' ' + (x - s * .7) + ',' + (t + s) + ' ' + (x + s * .7) + ',' + (t + s) + '" fill="hsl(' + (120 + Math.floor(rnd() * 30)) + ',55%,' + (night ? 14 : 28) + '%)"/>\n'; }
    return o + '<text x="512" y="735" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#ffffff" opacity=".75">' + String(prompt).replace(/[<>&"]/g, '').slice(0, 60) + '</text>\n</svg>\n';
  }

  function siteFiles(prompt) {
    const title = String(prompt).replace(/^(faz|cria|gera|monta)\s+(um|uma)?\s*(site|pagina|landing)?\s*(de|do|da|para)?\s*/i, '').replace(/[<>&"]/g, '').trim().slice(0, 60) || 'Meu site';
    return [
      { name: 'index.html', mime: 'text/html', content: '<!DOCTYPE html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title>\n<link rel="stylesheet" href="style.css"></head><body>\n<header><h1>' + title + '</h1><nav><a href="#sobre">Sobre</a><a href="#servicos">Serviços</a><a href="#contato">Contato</a></nav></header>\n<section class="hero"><h2>Bem-vindo a ' + title + '</h2><p>Uma página moderna, rápida e que funciona no PC e no celular.</p><button id="cta">Fale conosco</button></section>\n<section id="sobre"><h3>Sobre</h3><p>Escreva aqui a história e o objetivo do projeto.</p></section>\n<section id="servicos"><h3>Serviços</h3><div class="grid"><div class="card">⚡ Rápido</div><div class="card">🔒 Seguro</div><div class="card">🎨 Bonito</div></div></section>\n<section id="contato"><h3>Contato</h3><p id="msg">Clique no botão acima para entrar em contato.</p></section>\n<script src="script.js"><\/script></body></html>\n' },
      { name: 'style.css', mime: 'text/css', content: ':root{--c:#6c7cff}*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:#0b1020;color:#e7ebff;line-height:1.6}header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;padding:16px 6vw;border-bottom:1px solid #24314a}nav a{color:#9fb0ff;margin-left:16px;text-decoration:none}section{padding:48px 6vw}.hero{text-align:center;padding:90px 6vw;background:linear-gradient(160deg,#18204a,#0b1020)}.hero h2{font-size:clamp(28px,6vw,52px);margin:0}button{background:var(--c);color:#fff;border:0;border-radius:10px;padding:12px 22px;font-size:16px;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}.card{background:#151f34;border:1px solid #24314a;border-radius:14px;padding:24px;text-align:center;font-size:20px}\n' },
      { name: 'script.js', mime: 'text/javascript', content: "document.getElementById('cta').addEventListener('click',function(){document.getElementById('msg').textContent='Obrigado! Entraremos em contato em breve.';document.getElementById('contato').scrollIntoView({behavior:'smooth'});});\n" },
    ];
  }
  const TODO_HTML = HEAD('Tarefas') + `<style>#w{width:min(440px,94vw)}input{width:70%;padding:12px;border-radius:10px;border:1px solid #24314a;background:#111830;color:#fff}li{display:flex;justify-content:space-between;background:#151f34;margin:8px 0;padding:12px;border-radius:10px;list-style:none;cursor:pointer}li.f span{text-decoration:line-through;opacity:.5}ul{padding:0}</style>
<div id="w"><h2>✅ Lista de tarefas</h2><input id="t" placeholder="Nova tarefa"> <button onclick="add()">Adicionar</button><ul id="l"></ul></div>
<script>
let T=[];try{T=JSON.parse(localStorage.getItem('t')||'[]');}catch(e){}
function save(){try{localStorage.setItem('t',JSON.stringify(T));}catch(e){}}
function render(){const l=document.getElementById('l');l.innerHTML='';T.forEach((x,i)=>{const li=document.createElement('li');if(x.f)li.className='f';const s=document.createElement('span');s.textContent=x.n;const d=document.createElement('b');d.textContent='✕';d.onclick=e=>{e.stopPropagation();T.splice(i,1);save();render();};li.onclick=()=>{x.f=!x.f;save();render();};li.append(s,d);l.appendChild(li);});}
function add(){const i=document.getElementById('t');if(!i.value.trim())return;T.push({n:i.value.trim(),f:false});i.value='';save();render();}
document.getElementById('t').addEventListener('keydown',e=>{if(e.key==='Enter')add();});render();
<\/script></body></html>`;
  const CALC_HTML = HEAD('Calculadora') + `<style>#k{display:grid;grid-template-columns:repeat(4,70px);gap:8px}#k button{height:60px;font-size:22px;background:#151f34;color:#fff;border:1px solid #24314a;border-radius:12px}#d{width:310px;background:#111830;border-radius:12px;padding:16px;font-size:30px;text-align:right;margin-bottom:10px;min-height:40px}</style>
<div><div id="d">0</div><div id="k"></div></div>
<script>
let e='';const d=document.getElementById('d'),k=document.getElementById('k');
['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','(',')','⌫'].forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{if(t==='C')e='';else if(t==='⌫')e=e.slice(0,-1);else if(t==='='){try{if(/^[0-9+\\-*/.() ]+$/.test(e))e=String(Function('return ('+e+')')());}catch(x){e='Erro';}}else{if(e==='Erro')e='';e+=t;}d.textContent=e||'0';};k.appendChild(b);});
<\/script></body></html>`;

  function detectType(q) {
    if (/imagem|foto|desenho|arte|logo|paisagem|pintura|ilustracao|wallpaper|quadro|floresta|montanha|por do sol|ceu estrelado/.test(q)) return 'imagem';
    if (/calculadora/.test(q)) return 'app-calc';
    if (/tarefa|todo|lista de/.test(q)) return 'app-todo';
    if (/site|pagina|landing|portfolio/.test(q)) return 'site';
    if (pickGame(q, false) || /jogo|game/.test(q)) return 'jogo';
    return 'site';
  }
  // Devolve { type, plan:[...], files:[{name,mime,content}] }
  function generate(prompt, type) {
    const q = norm(prompt);
    const t = (type && type !== 'auto') ? type : detectType(q);
    if (t === 'imagem') return { type: t, plan: ['Entender o tema: "' + String(prompt).slice(0, 50) + '"', 'Escolher paleta e cena (céu, sol/lua, relevo, mar, cidade, floresta)', 'Desenhar em SVG (vetorial, sem perda de qualidade)', 'Exportar .svg e .png'], files: [{ name: 'imagem.svg', mime: 'image/svg+xml', content: svgArt(prompt) }] };
    if (t === 'jogo') { const k = pickGame(q, false) || ORDER[Math.floor(seeded(q)() * ORDER.length)]; return { type: t, plan: ['Escolher o jogo: ' + GAMES[k].nome, 'Montar canvas, regras e pontuação', 'Adicionar controles de teclado, mouse e toque', 'Entregar em um único HTML'], files: [{ name: 'jogo-' + k + '.html', mime: 'text/html', content: GAMES[k].html }] }; }
    if (t === 'app-todo') return { type: t, plan: ['Definir dados (tarefas)', 'Criar interface', 'Salvar no armazenamento local do navegador'], files: [{ name: 'tarefas.html', mime: 'text/html', content: TODO_HTML }] };
    if (t === 'app-calc') return { type: t, plan: ['Criar teclado', 'Avaliar a expressão com segurança', 'Entregar em um único HTML'], files: [{ name: 'calculadora.html', mime: 'text/html', content: CALC_HTML }] };
    return { type: 'site', plan: ['Definir seções (início, sobre, serviços, contato)', 'Escrever HTML semântico', 'Estilo responsivo (PC e celular) em style.css', 'Interação em script.js'], files: siteFiles(prompt) };
  }

  globalThis.JARVES_BASE = { reply, generate, svgArt, games: Object.keys(GAMES), MENU_TAG };
})();
