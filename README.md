# JARVES AI 2.3.2 — GitHub + Android

Repositorio-fonte preparado a partir do pacote Windows enviado.

## O que há aqui
- Aplicação web JARVES (frontend HTML/CSS/JS + backend Node/Express).
- Relatório técnico de auditoria em TXT e JSON.
- Testes smoke e verificação de sintaxe JavaScript.
- Cliente Android WebView em `android/`.
- GitHub Actions para compilar e publicar o APK como artefato; tags `v*` também criam anexo em GitHub Releases.

## Executar o servidor
Requisitos: Node.js 22.13 ou superior.

```bash
npm install
npm run check
npm test
HOST=0.0.0.0 npm start
```

Abra `http://localhost:3000` no computador.

## Android
O APK é um cliente da interface web. O backend e o provedor IA/Ollama continuam no PC/servidor.
1. Inicie o JARVES no PC com `HOST=0.0.0.0`.
2. Descubra o IP local do PC (ex.: `192.168.1.10`) e permita a porta 3000 no firewall.
3. No Android, instale o APK e informe `http://192.168.1.10:3000`.
4. Os dois dispositivos precisam estar na mesma rede Wi-Fi.

## IA sem cobrança por uso
- Escolha **Ollama local** (ou **Automático**) em Configurações e instale um modelo compatível. A inferência fica no seu PC/servidor e não exige uma chave de API paga.
- O download inicial precisa de internet e ocupa espaço em disco; a execução usa memória, processador/placa de vídeo e energia do seu equipamento. A licença de cada modelo pode variar.
- Se Ollama não estiver disponível, Automático usa `jarves-base`, uma resposta offline básica e limitada, não um modelo generativo completo.
- Provedores remotos compatíveis podem cobrar e exigem acesso próprio. **GPT-6.1 Sol** tem o identificador `gpt-6.1-sol`, suporta Chat Completions, mas é um modelo de API pago; ele só pode ser selecionado se o endpoint remoto configurado o listar. A lista de modelos é obtida dinamicamente, sem fingir suporte ou adicioná-lo como opção grátis. Consulte [documentação e preços oficiais](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

## Gerar APK pelo GitHub
1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. Abra **Actions** e execute **Build JARVES Android APK** (workflow_dispatch). Pushes com mudanças Android, frontend, backend ou motores de IA também compilam o APK como artefato do workflow.
3. Baixe `JARVES-AI-2.3.2-Android-APK` na seção Artifacts da execução.
4. Para publicar o APK em Releases, crie e envie uma tag `v2.3.2`:
   `git tag v2.3.2 && git push origin v2.3.2`

A página de downloads está em `/download.html` quando o servidor JARVES está em execução. O workflow **Publish JARVES downloads site** publica a mesma página como site estático no GitHub Pages e a atualiza em pushes para `main`. Ela consulta o release mais recente e só mostra botões quando encontra os assets reais `app-debug.apk`, `JARVES-AI-Setup-<versão>-x64.exe` e `JARVES-AI-<versão>-x64.AppImage`. Artefatos de Actions não são anexados automaticamente a um Release. O APK atual é uma compilação de depuração; o EXE não é assinado.

## Gerar instalador Windows
- Execute `npm ci` e `npm run build:windows` em Windows com Node.js 22.13+. O instalador NSIS será criado em `dist/`.
- O workflow **Build JARVES Windows EXE** compila o instalador em cada push que altera o app e o publica como artefato do Actions (não como Release).
- O instalador ainda não tem assinatura de código; o Windows pode mostrar avisos do SmartScreen.

## Gerar AppImage para Linux
- Requer Node.js 22.13+; execute `npm ci` e `npm run build:linux` para criar `dist/JARVES-AI-2.3.2-x86_64.AppImage`.
- O workflow **Build JARVES Linux AppImage** gera o mesmo pacote x86_64 e publica-o como artefato do Actions. Para aparecer no site, publique o `.AppImage` como asset de um GitHub Release.

## Interface, voz e correção assistida
- A navegação principal oferece **Chat**, **Voz e vídeo** e **Configurações**, com histórico dentro do chat e atalho para downloads.
- Em Configurações é possível personalizar nome da IA, cor principal, efeito RGB, tema, voz/idioma e velocidade/tom da síntese de fala disponíveis no navegador. Essas preferências ficam neste dispositivo; síntese e reconhecimento dependem do navegador e das vozes instaladas, não alteram a voz textual do modelo.
- A aba Voz e vídeo lê texto com a voz instalada, pode reproduzir junto um vídeo local e exporta o roteiro como TXT. O vídeo não é enviado, mas a voz não é incorporada/exportada no MP4; não existe um motor local de geração/edição de vídeo nesta versão.
- Configurações reúne testes HTML, diagnóstico do backend e exportação de relatórios TXT/JSON. É possível fornecer um arquivo de texto/código para preparar uma solicitação de análise no Chat. A IA sugere a correção em texto; não executa código nem modifica arquivos automaticamente.
- O fluxo de criação em Configurações encadeia pesquisa web opcional, geração de plano, confirmação e execução manual de etapas de IA. A pesquisa é desativada por padrão e envia a consulta ao DuckDuckGo quando ativada; o modelo usa o provedor selecionado. Etapas produzem conteúdo/código para revisão, não executam comandos nem compilam aplicativos; blocos HTML podem ser pré-visualizados em iframe isolado.
- Provedores locais Ollama evitam cobrança por chamada, mas usam hardware local e podem exigir baixar modelos; uma IA remota ou voz não instalada não é tornada gratuita por esta interface.

## Limites conhecidos
- O APK de depuração é compilado pelo GitHub Actions com Java 17, Android SDK e Gradle 8.9.
- O EXE Windows não foi executado neste ambiente Linux.
- Não é correto afirmar que todos os bugs foram eliminados. Consulte `RELATORIO_ERROS_CORRECOES.txt`.
