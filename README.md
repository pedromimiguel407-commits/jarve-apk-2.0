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
2. Abra **Actions** e execute **Build JARVES Android APK** (workflow_dispatch), ou envie alterações Android para `main`.
3. Baixe `JARVES-AI-2.3.2-Android-APK` na seção Artifacts da execução.
4. Para publicar o APK em Releases, crie e envie uma tag `v2.3.2`:
   `git tag v2.3.2 && git push origin v2.3.2`

A página de downloads está em `/download.html` quando o servidor JARVES está em execução. Ela consulta o release mais recente e só mostra o botão se encontrar o asset real `app-debug.apk`. Para disponibilizá-la na internet, publique essa página em um hosting autorizado e configure nela o repositório correto. Nenhum hosting foi publicado por esta alteração. O projeto também não gera um EXE Windows atualmente.

## Limites conhecidos
- O APK de depuração é compilado pelo GitHub Actions com Java 17, Android SDK e Gradle 8.9.
- O EXE Windows não foi executado neste ambiente Linux.
- Não é correto afirmar que todos os bugs foram eliminados. Consulte `RELATORIO_ERROS_CORRECOES.txt`.
