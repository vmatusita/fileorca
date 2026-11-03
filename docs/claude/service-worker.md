# Service worker, offline e compartilhar

O que as runs aprenderam sobre o service worker, o cache offline, a página "Abrir com" e o compartilhar, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F8: piloto automático

O service worker (DECISOES § 285 a § 294):

- **Arquivos:** `src/sw/shared.ts` (o que a página e o worker combinam), `src/sw/logic.ts` (as regras puras, no Vitest) e `src/sw/main.ts` (os eventos). O `src/sw/build.ts` costura os três num script clássico, `dist/sw.js`, no `astro:build:done` do `src/platform/build-files.ts`. Arquivo novo do worker só importa os de antes dele na lista `SW_FILES`, sem `export { }` nem `import` de pacote: o build recusa.
- **O que entra no cache:** só GET da mesma origem, resposta 200 `basic` sem redirecionamento. Navegação e o resto vão à rede primeiro; `/_astro/*` vem do cache primeiro. Nunca entram `/build.txt`, `/cdn-cgi/*`, `ads.txt`, `robots.txt`, os sitemaps, a chave do IndexNow, o `/sw.js` e a caixa de entrada.
- **A chave** é `origin + pathname`, sem `?` e sem `#`, em todo `put` e `match`. **A versão** é o commit do `build.txt` no nome do cache (`fileorca-pages-<commit>`); no `activate`, o resto sai.
- **A desativação:** `SW_ENABLED = false` em `src/platform/site.ts` (run curta). O `/sw.js` passa a apagar os caches e se desregistrar, o `BaseLayout` não registra e o manifest perde o `share_target`.
- **Nos testes:** `serviceWorkers: 'block'` é o padrão do `playwright.config.ts`. Um spec do worker liga com `test.use({ serviceWorkers: 'allow' })` e sobe o próprio servidor do `dist/` (`tests/e2e/lib/sw-server.ts`): origem limpa, `/sw.js` trocável, e a rede desligada de verdade com `close()`. Os ajudantes estão em `tests/e2e/lib/sw.ts` (`controlled`, `kept`, `allKept`, `offline`, `reloadOffline`, `share`).
- **O registro** (`src/platform/sw-register.ts`) é inline, depois do `load`, e nunca espera o `ready`.

O compartilhar (§ 290 e § 291):

- **A caixa** é o Cache Storage `fileorca-inbox` (entradas `/__fileorca-inbox/<n>`, o nome em cabeçalho). O worker a enche no POST da ação do manifest e responde 303.
- **A página "Abrir com"** é `src/views/OpenWithView.astro` com o script `src/share/client.ts`, que não importa nada do chunk `island` (2 arquivos JS: a entrada e o chunk `sniff`). As ferramentas e o `accept` dos manifests saem de `src/share/tools.ts`, que lê os registros.
- **A entrega** é o `takeInbox(page)` de `src/tools/image/inbox.ts`, na montagem do `ImagePanel` e do `PdfPanel`, pelo caminho do soltar. A escolha vai no `sessionStorage` da aba (`{tool, order}`), nunca na URL.

Pegadinhas que a F8 achou:

- **O gancho `astro:build:done` roda com o carregador do Vite fechado:** um `import()` ali falha com "Vite module runner has been closed". Use `createRequire` (pacote CommonJS) ou import estático.
- **No WebKit do Playwright, o `setOffline(false)` não chega ao service worker,** que segue sem rede; e os pedidos feitos pelo worker não aparecem no `context.on('request')`. O teste ramifica por dentro.
- **Com `serviceWorkers: 'block'`, o `navigator.serviceWorker.register()` resolve `undefined` e o `ready` nunca resolve.** Script de página não espera o `ready`.
- **O pedido do `/sw.js` para registrar não aparece no `context.on('request')`:** confira no servidor do teste.
- **`caches.open()` cria o cache que falta:** um teste que lista os caches enquanto o worker apaga um deles o recria. Leia os nomes com `caches.keys()` e confira com `caches.has()` antes de abrir.
- **Uma versão nova do worker assume a página depois do `load`:** o que a página manda ao worker no `load` vai para o velho, cujo cache o novo apaga. O registro manda a lista de novo no `controllerchange` (§ 307). Teste de troca de versão nunca recarrega antes de conferir o cache novo.
- **Teste do worker começa com `if (await workerOff(page, server)) return;`** antes do primeiro `controlled()` (§ 307): com `SW_ENABLED` em `false`, ele confere o estado desligado e termina. Teste novo do worker segue o mesmo molde, e um teste que lê o manifest ou o `/sw.js` compara com o `SW_ENABLED`.
- **Página que mostra um estado depois de ler algo no navegador nasce sem ele** (a "Abrir com", § 307): o estado vazio visível no HTML afirmava "nada para abrir" sobre arquivos compartilhados. Ele começa com `hidden`, o script o mostra quando a leitura termina vazia, e um `<noscript>` cobre quem não roda script.
- **O `pnpm screenshots` abre as páginas com `serviceWorkers: 'block'`,** como os testes: fora do runner, o Playwright libera o worker, e o `page.route` deixa de ver o que ele responde (o nível d'água, que segura o `engine-client`, nunca aparecia). O bloco da F8, que fotografa o offline e a "Abrir com", cria o próprio contexto com `allow`.
