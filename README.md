# JARVES AI — Core 2.3.0

Aplicação principal compartilhada por Windows, Linux, PWA e Android.

## Requisitos
- Node.js 22 LTS ou superior
- npm
- Ollama local (opcional) ou provedor OpenAI-compatible configurado

## Execução manual
1. Copie `.env.example` para `.env`.
2. Instale dependências: `npm install --include=dev`.
3. Execute `npm start`.
4. Abra `http://localhost:3000`.

Para iniciar sem terminal, use `PC_WINDOWS/INICIAR_JARVES.bat` ou `PC_LINUX/iniciar-jarves.sh` na raiz do pacote.

## Compilar desktop
- Windows: execute `PC_WINDOWS/GERAR_EXE.bat` em Windows 10/11 x64.
- Linux: execute `bash PC_LINUX/gerar-appimage-deb.sh` em Linux x64.

## Android
Abra `ANDROID_APK` no Android Studio ou execute `bash ANDROID_APK/GERAR_APK.sh` após instalar JDK 17+, Gradle 8.x e Android SDK Platform 34.

O cliente Android e PWA conectam ao servidor. Eles não carregam o modelo de IA dentro do próprio app.

## Seguranca (2.3.0)
- `HOST=0.0.0.0` expoe a API a toda a rede local (necessario para o celular). Nao exponha a porta na internet.
- Para habilitar `/api/diagnostics/fix` e `/backup` defina `ADMIN_TOKEN` no `.env` e envie o header `x-admin-token`. Sem token essas rotas ficam desativadas.
- `RESEARCH_ENABLED=true` liga a pesquisa web (desligada por padrao).
- Faca backup de `data/jarves.db` JUNTO com `data/.jarves-secret`, senao a API key salva precisa ser cadastrada de novo.

## Testes
`npm test` (Node 22.13+). `npm run lint` verifica a sintaxe de todos os arquivos.

## GitHub Actions
Envie o CONTEUDO da pasta `JARVES_AI_2.3.0` para a RAIZ do repositorio (o workflow espera `CORE/` e `ANDROID_APK/` na raiz).


## JARVES AI 2.3.1 — HTML Mega Update

- Nova aba **Teste HTML Mega** no menu lateral.
- Verifica elementos essenciais, scripts, estilos, módulos JS, armazenamento local, manifest PWA, API de saúde e viewport.
- Permite exportar o resultado dos testes em JSON.
- Os testes são diagnósticos do ambiente atual; não garantem funcionamento de serviços externos sem configuração.

### Executar

1. Instale Node.js 22.13 ou superior.
2. Execute `npm install`.
3. Execute `npm test` e `npm run lint`.
4. Inicie com `npm start` e abra `http://localhost:3000`.
5. Abra **Teste HTML Mega** no menu e execute a bateria de testes.

### Limites da atualização

O pacote de código é a base-fonte para Android/APK. O APK precisa ser compilado no ambiente Android/Capacitor/Gradle correspondente. O pacote Windows mantém o runtime Electron distribuído e recebe a interface atualizada; o executável não foi recompilado nesta atualização.
