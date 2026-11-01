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

## Gerar APK pelo GitHub
1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. Abra **Actions** e execute **Build JARVES Android APK** (workflow_dispatch).
3. Baixe `JARVES-AI-2.3.2-Android-APK` na seção Artifacts da execução.
4. Para anexar em Releases, crie e envie uma tag `v2.3.2`:
   `git tag v2.3.2 && git push origin v2.3.2`

## Limites conhecidos
- Este ambiente não possui Gradle/Android SDK; portanto o APK não foi compilado aqui.
- O EXE Windows não foi executado neste ambiente Linux.
- Não é correto afirmar que todos os bugs foram eliminados. Consulte `RELATORIO_ERROS_CORRECOES.txt`.
