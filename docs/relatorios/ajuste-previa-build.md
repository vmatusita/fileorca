# Ajuste `ajuste-previa-build` · Relatório

Run curta pedida pelo Victor depois do merge da F1a, na mesma sessão. Branch `ajuste-previa-build`, PR [vmatusita/fileorca#3](https://github.com/vmatusita/fileorca/pull/3). Prompt em `docs/prompts/prompt-ajuste-previa-build.md`. Só documentação: nenhum código e nenhuma mudança no `wrangler.jsonc`. No painel do Cloudflare, a configuração foi corrigida pelo Victor; o Claude só leu logs e, com o OK dele, clicou em "Tentar compilar novamente".

## Resumo

Os builds do Workers Builds da F1a, de prévia e de produção, falhavam porque o comando de build salvo no painel era `pnpm buid`: os cinco logs lidos param na etapa de build, e os dois lidos até o fim mostram `Command "buid" not found`. O Victor corrigiu para `pnpm build`, e a F1a está no ar em fileorca.com desde então. A troca de Node 26 e pnpm 12 para Node 24 e pnpm 10 (DECISOES § 17) não tinha relação com a falha. Com o comando certo, a prévia desta PR passou da instalação e do build e parou no `npx wrangler preview`, que exige o bloco `previews` no `wrangler.jsonc`. O mecanismo da ADR-002 está confirmado (mas não era a causa das falhas da F1a), e a decisão continua com o Victor.

## O que aconteceu, em ordem

1. Merge da F1a (`249307f`, 30/out, 22:48 UTC). O build de produção falhou, fileorca.com seguiu no Hello World da F0 e o pós-deploy esperou 20 min e abriu a issue #2.
2. A pedido do Victor, o Claude leu o log no Chrome dele (só leitura): instalação ok com Node 24.22.2 e pnpm 10.34.9, e `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, `Command "buid" not found` no build.
3. O Victor corrigiu o comando de build para `pnpm build` e salvou. Com o OK dele, o Claude clicou em "Tentar compilar novamente": o build `a49d23cc` passou (instalação 27 s, build 6 s, deploy 16 s, 72 arquivos, versão `838f4cb1`).
4. Conferência de produção, por `curl`: `build.txt` com `249307f9398fff7aa09c1d453ce90bd807340c13`; `/`, `/pt/`, `/es/`, `/compress-image/`, `/pt/comprimir-imagem/`, `/robots.txt` e `/sitemap-index.xml` com 200; um caminho inexistente com 404; todos com `x-robots-tag: noindex`, inclusive `fileorca.vmatusita.workers.dev`; `nosniff`, `Referrer-Policy`, `frame-ancestors` e HSTS presentes.
5. O pós-deploy foi reexecutado ([execução 41140479979](https://github.com/vmatusita/fileorca/actions/runs/41140479979)) e passou: "LAUNCHED = false: produção conferida, IndexNow não disparado (site em noindex)". A issue #2 foi fechada com a causa.
6. Esta PR, aberta em rascunho, foi o primeiro build de branch com o comando certo.

## Logs lidos no painel

| Build | Tipo | Commit | Node e pnpm | Onde parou |
| --- | --- | --- | --- | --- |
| `d925f68d` | prévia | `bc0f703` | 26.13.0 e 12.16.1 | instalação ok ("Done in 7.2s using pnpm v12.16.1"); `Command "buid" not found` |
| `b9d3b134` | prévia | `af28dfa` | 26.13.0 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `adb0c2f3` | prévia | `a120197` | 24.22.2 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `8d03fd90` | prévia | `9bb5ccf` | 24.22.2 e 10.34.9 | instalação ok; etapa Building falhou em 2 s |
| `62a07a98` | produção | `249307f` | 24.22.2 e 10.34.9 | instalação ok; `Command "buid" not found` |
| `a49d23cc` | produção, refeito | `249307f` | 24.22.2 e 10.34.9 | **passou** |
| `f2790489` | prévia desta PR | `b562124` | 24.22.2 e 10.34.9 | instalação e build ok (27 páginas); `npx wrangler preview` falhou em 4 s: `✘ [ERROR] Your Wrangler configuration is missing a previews block to run this command` |

A configuração mostrada na página de um build nem sempre é a que rodou: depois da correção, o build `d925f68d` mostra `pnpm build` na configuração, e o log dele traz `Executing user build command: pnpm buid`. O que vale é o log.

## O que mudou

| Arquivo | Mudança |
| --- | --- |
| `docs/adr/ADR-002-previa-worker-previews.md` | Status "Proposta, confirmada pela prévia da PR #3"; seção "Atualização" com a tabela dos logs e o erro do `wrangler preview` |
| `DECISOES.md` | § 37 (a falha era o comando de build; Node 24 e pnpm 10 ficam até o Victor decidir) e uma linha de atualização no § 17 |
| `docs/relatorios/fase-01a.md` | Notas de atualização no topo, na seção da prévia e na pendência 1; o texto original fica para registro |
| `CLAUDE.md` | Seção nova no fim, "Ajuste da prévia: o que a F1a entendeu errado sobre o Workers Builds" (só acréscimo) |
| `docs/prompts/prompt-ajuste-previa-build.md` | O pedido desta run |
| `docs/relatorios/ajuste-previa-build.md` | Este relatório |

## pnpm verificar na máquina local

Windows 11, Node 26.8.1 local, no commit `b562124`: verde em **123,1 s** (limite 900 s); 122 testes Vitest e 306 Playwright. O `lint:texto` não teve texto do site alterado para conferir.

<details>
<summary>Saída completa</summary>

```

> fileorca@0.0.0 verificar C:\Users\vmatusita\projetos\fileorca
> node scripts/verificar.ts


▶ tipos (astro check)
  $ pnpm run tipos

> fileorca@0.0.0 tipos C:\Users\vmatusita\projetos\fileorca
> astro check

21:54:29 [types] Generated 88ms
21:54:29 [check] Getting diagnostics for Astro files in C:\Users\vmatusita\projetos\fileorca...
tests/unit/ads.test.ts:93:22 - warning ts(80007): 'await' has no effect on the type of this expression.

93     const response = await (GET as unknown as () => Response)();
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Result (155 files): 
- 0 errors
- 0 warnings
- 1 hint


▶ lint (eslint)
  $ pnpm run lint

> fileorca@0.0.0 lint C:\Users\vmatusita\projetos\fileorca
> eslint .


▶ build (astro build do zero)
  $ pnpm run build

> fileorca@0.0.0 build C:\Users\vmatusita\projetos\fileorca
> astro build

21:54:36 [types] Generated 32ms
21:54:36 [build] output: "static"
21:54:36 [build] mode: "static"
21:54:36 [build] directory: C:\Users\vmatusita\projetos\fileorca\dist\
21:54:36 [build] Collecting build info...
21:54:36 [build] ✓ Completed in 58ms.
21:54:36 [build] Building static entrypoints...
21:54:36 [vite] ✓ built in 425ms
21:54:36 [vite] ✓ built in 80ms
21:54:36 [build] Rearranging server assets...

 generating static routes 
21:54:36   ├─ /404.html (+14ms) 
21:54:36   ├─ /about/index.html (+5ms) 
21:54:36   ├─ /compress-image/index.html (+8ms) 
21:54:36   ├─ /contact/index.html (+4ms) 
21:54:36   ├─ /es/404.html (+2ms) 
21:54:36   ├─ /es/acerca-de/index.html (+2ms) 
21:54:36   ├─ /es/apoyo/index.html (+3ms) 
21:54:36   ├─ /es/comprimir-imagen/index.html (+2ms) 
21:54:37   ├─ /es/contacto/index.html (+3ms) 
21:54:37   ├─ /es/licencias/index.html (+6ms) 
21:54:37   ├─ /es/privacidad/index.html (+4ms) 
21:54:37   ├─ /es/terminos/index.html (+2ms) 
21:54:37   ├─ /es/index.html (+3ms) 
21:54:37   ├─ /licenses/index.html (+4ms) 
21:54:37   ├─ /og/en/home.png (+142ms) 
21:54:37   ├─ /og/pt/home.png (+128ms) 
21:54:37   ├─ /og/es/home.png (+134ms) 
21:54:37   ├─ /og/en/compress-image.png (+154ms) 
21:54:37   ├─ /og/pt/compress-image.png (+117ms) 
21:54:37   ├─ /og/es/compress-image.png (+113ms) 
21:54:37   ├─ /og/en/privacy.png (+107ms) 
21:54:37   ├─ /og/pt/privacy.png (+105ms) 
21:54:38   ├─ /og/es/privacy.png (+106ms) 
21:54:38   ├─ /og/en/terms.png (+105ms) 
21:54:38   ├─ /og/pt/terms.png (+123ms) 
21:54:38   ├─ /og/es/terms.png (+108ms) 
21:54:38   ├─ /og/en/about.png (+103ms) 
21:54:38   ├─ /og/pt/about.png (+108ms) 
21:54:38   ├─ /og/es/about.png (+110ms) 
21:54:38   ├─ /og/en/contact.png (+105ms) 
21:54:38   ├─ /og/pt/contact.png (+114ms) 
21:54:39   ├─ /og/es/contact.png (+110ms) 
21:54:39   ├─ /og/en/licenses.png (+110ms) 
21:54:39   ├─ /og/pt/licenses.png (+104ms) 
21:54:39   ├─ /og/es/licenses.png (+109ms) 
21:54:39   ├─ /og/en/support.png (+118ms) 
21:54:39   ├─ /og/pt/support.png (+115ms) 
21:54:39   ├─ /og/es/support.png (+113ms) 
21:54:39   ├─ /privacy/index.html (+4ms) 
21:54:39   ├─ /pt/404.html (+4ms) 
21:54:39   ├─ /pt/apoie/index.html (+2ms) 
21:54:39   ├─ /pt/comprimir-imagem/index.html (+4ms) 
21:54:39   ├─ /pt/contato/index.html (+8ms) 
21:54:39   ├─ /pt/licencas/index.html (+7ms) 
21:54:39   ├─ /pt/privacidade/index.html (+2ms) 
21:54:39   ├─ /pt/sobre/index.html (+2ms) 
21:54:39   ├─ /pt/termos/index.html (+2ms) 
21:54:39   ├─ /pt/index.html (+2ms) 
21:54:39   ├─ /search-index.json (+2ms) 
21:54:39   ├─ /sitemap-index.xml (+2ms) 
21:54:39   ├─ /support/index.html (+2ms) 
21:54:39   ├─ /terms/index.html (+2ms) 
21:54:39   ├─ /icon-192.png (+103ms) 
21:54:39   ├─ /icon-512.png (+96ms) 
21:54:40   ├─ /manifest-en.webmanifest (+1ms) 
21:54:40   ├─ /manifest-pt.webmanifest (+1ms) 
21:54:40   ├─ /manifest-es.webmanifest (+1ms) 
21:54:40   ├─ /sitemap-en.xml (+1ms) 
21:54:40   ├─ /sitemap-pt.xml (+1ms) 
21:54:40   ├─ /sitemap-es.xml (+2ms) 
21:54:40   ├─ /index.html (+2ms) 
21:54:40 ✓ Completed in 3.16s.

21:54:40 [build] ✓ Completed in 3.71s.
21:54:40 [fileorca:platform-files] _headers, _redirects and build.txt (b562124) written
21:54:40 [build] 27 page(s) built in 3.78s
21:54:40 [build] Complete!

▶ vitest
  $ pnpm run test

> fileorca@0.0.0 test C:\Users\vmatusita\projetos\fileorca
> vitest run


 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca


 Test Files  13 passed (13)
      Tests  122 passed (122)
   Start at  21:54:41
   Duration  1.43s (transform 49%, import 27%, tests 23%, worker 1%)


▶ cabeçalhos gerados
  $ pnpm run gate:cabecalhos

> fileorca@0.0.0 gate:cabecalhos C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/cabecalhos.ts

cabeçalhos: ok, 6 regras, LAUNCHED = false, build.txt b562124

▶ worker sem código
  $ pnpm run gate:worker

> fileorca@0.0.0 gate:worker C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/worker.ts

worker sem código: ok, só assets em ./dist, sem main, sem run_worker_first, sem _worker.js e sem functions/

▶ seo (hreflang, sitemaps, canonical, robots)
  $ pnpm run gate:seo

> fileorca@0.0.0 gate:seo C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/seo.ts

seo: ok, 24 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps

▶ links internos e páginas órfãs
  $ pnpm run gate:links

> fileorca@0.0.0 gate:links C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/links.ts

links: ok, 555 links internos em 27 páginas, nenhuma órfã

▶ licenças
  $ pnpm run gate:licencas

> fileorca@0.0.0 gate:licencas C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/licencas.ts

licenças: transitivas de ferramentas de build fora da lista principal (não vão ao navegador):
  CC0-1.0: @speed-highlight/core@1.2.24, mdn-data@2.0.28, mdn-data@2.27.1, spdx-license-ids@3.0.24
  CC-BY-4.0: caniuse-lite@1.0.30001820
  BlueOak-1.0.0: chownr@3.0.0, common-ancestor-path@2.0.0, glob@13.0.6, isexe@4.0.0, lru-cache@11.5.3, minimatch@10.2.6, minipass-flush@1.0.7, minipass@7.1.3, path-scurry@2.0.2, sax@1.6.1, tar@7.5.22, yallist@5.0.0
  BSD: parse-cache-control@1.0.1
  CC-BY-3.0: spdx-exceptions@2.5.0
  (MIT AND CC-BY-3.0): spdx-ranges@2.1.1
licenças: ok, 5 dependências de navegador, 17 de build, 861 pacotes na árvore

▶ conteúdo de dinheiro e saúde
  $ pnpm run gate:dinheiro-saude

> fileorca@0.0.0 gate:dinheiro-saude C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/dinheiro-saude.ts

dinheiro e saúde: ok, 0 página(s) desses hubs conferida(s)

▶ actionlint
  $ pnpm run gate:actionlint

> fileorca@0.0.0 gate:actionlint C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/actionlint.ts

actionlint 1.7.12 com shellcheck 0.11.0: ok, .github/workflows/ci.yml e .github/workflows/pos-deploy.yml sem erro

▶ playwright (chromium e webkit, axe, anúncios, orçamentos)
  $ pnpm run e2e

> fileorca@0.0.0 e2e C:\Users\vmatusita\projetos\fileorca
> playwright test


Running 306 tests using 6 workers

  ok   3 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (971ms)
  ok   2 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.1s)
  ok   1 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.1s)
  ok   4 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (1.1s)
  ok   6 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (904ms)
  ok   5 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (1.1s)
  ok   7 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (948ms)
  ok   8 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (943ms)
  ok   9 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (949ms)
  ok  10 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (933ms)
  ok  11 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (917ms)
  ok  12 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (842ms)
  ok  13 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (797ms)
  ok  17 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (776ms)
  ok  14 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (834ms)
  ok  15 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (816ms)
  ok  18 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (807ms)
  ok  16 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (858ms)
  ok  22 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (789ms)
  ok  19 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (916ms)
  ok  23 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (779ms)
  ok  20 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (865ms)
  ok  21 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (875ms)
  ok  24 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (945ms)
  ok  26 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (761ms)
  ok  25 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (790ms)
  ok  27 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (766ms)
  ok  29 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (754ms)
  ok  28 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (779ms)
  ok  30 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (851ms)
  ok  32 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (880ms)
  ok  31 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (900ms)
  ok  33 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (883ms)
  ok  35 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (913ms)
  ok  34 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (928ms)
  ok  36 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.0s)
  ok  40 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (764ms)
  ok  37 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (871ms)
  ok  38 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (883ms)
  ok  41 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (814ms)
  ok  39 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (886ms)
  ok  42 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (852ms)
  ok  44 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (744ms)
  ok  43 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (766ms)
  ok  45 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (773ms)
  ok  47 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (829ms)
  ok  46 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (839ms)
  ok  48 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (898ms)
  ok  49 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (744ms)
  ok  51 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (753ms)
  ok  50 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (789ms)
  ok  53 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (724ms)
  ok  52 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (755ms)
  ok  54 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (822ms)
  ok  57 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (792ms)
  ok  56 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (805ms)
  ok  58 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (773ms)
  ok  59 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (763ms)
  ok  55 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (1.2s)
  ok  60 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (1.1s)
  ok  62 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (872ms)
  ok  61 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (906ms)
  ok  64 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (929ms)
  ok  63 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (970ms)
  ok  65 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (960ms)
  ok  67 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (904ms)
  ok  69 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (801ms)
  ok  68 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (891ms)
  ok  70 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (829ms)
  ok  66 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (1.1s)
  ok  71 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (846ms)
  ok  72 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (752ms)
  ok  73 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (787ms)
  ok  74 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (805ms)
  ok  75 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (853ms)
  ok  76 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (911ms)
  ok  77 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (893ms)
  ok  78 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (831ms)
  ok  79 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (801ms)
  ok  80 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (784ms)
  ok  81 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (792ms)
  ok  82 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (847ms)
  ok  83 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (763ms)
  ok  85 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (762ms)
  ok  84 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (789ms)
  ok  86 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (819ms)
  ok  87 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (856ms)
  ok  89 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (872ms)
  ok  88 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (1.1s)
  ok  90 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (887ms)
  ok  91 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (910ms)
  ok  93 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (824ms)
  ok  92 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (947ms)
  ok  94 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (864ms)
  ok  95 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (876ms)
  ok  96 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (744ms)
  ok  97 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (762ms)
  ok  99 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (739ms)
  ok  98 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (764ms)
  ok 100 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (749ms)
  ok 101 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (871ms)
  ok 102 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (832ms)
  ok 103 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (875ms)
  ok 105 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (768ms)
  ok 104 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (799ms)
  ok 106 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (797ms)
  ok 108 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (753ms)
  ok 107 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (838ms)
  ok 109 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (760ms)
  ok 110 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (766ms)
  ok 116 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (241ms)
  ok 114 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (306ms)
  ok 111 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (1.2s)
  ok 113 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (548ms)
  ok 112 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (810ms)
  ok 115 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (601ms)
  ok 118 [chromium] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (616ms)
  ok 123 [chromium] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (134ms)
/: 2 requisições (/, /_astro/BaseLayout.BHSD3xfz.css)
JS inicial: 13.4 KB gzip (2 arquivos + inline)
  ok 119 [chromium] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (698ms)
/compress-image/: 4 requisições (/compress-image/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 124 [chromium] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (160ms)
/pt/comprimir-imagem/: 4 requisições (/pt/comprimir-imagem/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 117 [chromium] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (1.2s)
  ok 125 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (373ms)
  ok 126 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (423ms)
  ok 128 [chromium] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (135ms)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 127 [chromium] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (161ms)
  ok 121 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.2s)
/privacy/: 1 novas (/privacy/)
  ok 120 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.2s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 122 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.2s)
  ok 133 [chromium] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (222ms)
  ok 132 [chromium] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (224ms)
  ok 134 [chromium] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (161ms)
  ok 129 [chromium] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (359ms)
  ok 135 [chromium] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (188ms)
  ok 131 [chromium] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (507ms)
  ok 137 [chromium] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (220ms)
  ok 140 [chromium] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (40ms)
  ok 138 [chromium] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (382ms)
  ok 139 [chromium] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (329ms)
  ok 144 [chromium] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (18ms)
  ok 141 [chromium] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (453ms)
  ok 143 [chromium] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (269ms)
  ok 142 [chromium] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (795ms)
  ok 145 [chromium] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (600ms)
  ok 136 [chromium] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (1.2s)
  ok 146 [chromium] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (481ms)
  ok 149 [chromium] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (337ms)
  ok 150 [chromium] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (299ms)
  ok 147 [chromium] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (957ms)
  ok 148 [chromium] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (668ms)
  ok 130 [chromium] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.2s)
  ok 151 [chromium] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (673ms)
  ok 152 [chromium] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (557ms)
  ok 153 [chromium] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (742ms)
  ok 154 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (1.5s)
  ok 157 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (1.4s)
  ok 156 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (1.6s)
  ok 155 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (1.6s)
  ok 158 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.7s)
  ok 159 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.6s)
  ok 163 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (1.3s)
  ok 160 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (1.5s)
  ok 161 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (1.5s)
  ok 162 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (1.5s)
  ok 164 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (1.5s)
  ok 165 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (1.4s)
  ok 167 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (1.3s)
  ok 166 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (1.4s)
  ok 168 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (1.3s)
  ok 169 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (1.4s)
  ok 170 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (1.2s)
  ok 171 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (1.3s)
  ok 172 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (1.4s)
  ok 174 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (1.3s)
  ok 173 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (1.4s)
  ok 175 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (1.3s)
  ok 176 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (1.3s)
  ok 177 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (1.3s)
  ok 178 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (1.2s)
  ok 179 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (1.3s)
  ok 181 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (1.3s)
  ok 180 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (1.3s)
  ok 182 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (1.3s)
  ok 183 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (1.3s)
  ok 184 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (1.5s)
  ok 185 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (1.4s)
  ok 186 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (1.4s)
  ok 187 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (1.5s)
  ok 188 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (1.5s)
  ok 189 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.5s)
  ok 190 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (1.3s)
  ok 193 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (1.2s)
  ok 191 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (1.4s)
  ok 192 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (1.4s)
  ok 194 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (1.3s)
  ok 195 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (1.4s)
  ok 196 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (1.3s)
  ok 197 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (1.3s)
  ok 198 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (1.3s)
  ok 199 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (1.4s)
  ok 200 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (1.4s)
  ok 201 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (1.3s)
  ok 203 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (1.2s)
  ok 202 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (1.4s)
  ok 204 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (1.3s)
  ok 205 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (1.4s)
  ok 206 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (1.3s)
  ok 207 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (1.3s)
  ok 209 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (1.5s)
  ok 210 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (1.8s)
  ok 211 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (1.6s)
  ok 208 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (2.2s)
  ok 212 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (1.8s)
  ok 213 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (1.8s)
  ok 214 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (1.8s)
  ok 215 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (1.9s)
  ok 219 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (1.8s)
  ok 218 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (2.0s)
  ok 217 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (2.2s)
  ok 216 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (2.3s)
  ok 220 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (1.8s)
  ok 222 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (1.9s)
  ok 223 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (1.8s)
  ok 221 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (2.2s)
  ok 225 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (2.0s)
  ok 224 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (2.0s)
  ok 226 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (1.5s)
  ok 227 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (1.7s)
  ok 228 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (1.9s)
  ok 231 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (1.7s)
  ok 230 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (1.9s)
  ok 229 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (2.2s)
  ok 232 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (1.8s)
  ok 233 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (1.8s)
  ok 234 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (1.6s)
  ok 235 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (1.7s)
  ok 236 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (1.6s)
  ok 237 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (1.7s)
  ok 238 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (1.9s)
  ok 239 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (1.7s)
  ok 240 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (2.0s)
  ok 241 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (2.0s)
  ok 242 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (2.0s)
  ok 243 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (2.0s)
  ok 244 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (1.9s)
  ok 245 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (2.0s)
  ok 247 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (1.6s)
  ok 246 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (1.9s)
  ok 248 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (2.0s)
  ok 250 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (1.7s)
  ok 249 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (2.0s)
  ok 252 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (1.7s)
  ok 251 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (2.0s)
  ok 254 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (1.7s)
  ok 253 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (2.3s)
  ok 256 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (2.0s)
  ok 255 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (2.2s)
  ok 258 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (1.7s)
  ok 257 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (2.1s)
  ok 259 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (1.7s)
  ok 260 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (2.1s)
  ok 261 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (1.8s)
  ok 262 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (1.8s)
  ok 267 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (592ms)
  ok 263 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (1.9s)
  ok 269 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (505ms)
  ok 266 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (1.4s)
  ok 268 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (1.5s)
  ok 265 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (2.3s)
  ok 264 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (2.9s)
JS inicial: 13.4 KB gzip (2 arquivos + inline)
  ok 272 [webkit] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (915ms)
  ok 271 [webkit] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (1.2s)
/compress-image/: 5 requisições (/compress-image/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/: 3 requisições (/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css)
  ok 276 [webkit] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (382ms)
  ok 277 [webkit] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (412ms)
/pt/comprimir-imagem/: 5 requisições (/pt/comprimir-imagem/, /manifest-pt.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/privacy/: 1 novas (/privacy/)
  ok 273 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.4s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 274 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.4s)
  ok 280 [webkit] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (386ms)
  ok 281 [webkit] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (367ms)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 275 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.4s)
  ok 278 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (1.1s)
  ok 279 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (1.2s)
  ok 284 [webkit] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (701ms)
  ok 285 [webkit] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (727ms)
  ok 287 [webkit] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (464ms)
  ok 270 [webkit] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (3.8s)
  ok 282 [webkit] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (1.4s)
  ok 288 [webkit] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (497ms)
  ok 290 [webkit] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (674ms)
  ok 293 [webkit] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (37ms)
  ok 286 [webkit] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (1.5s)
  ok 291 [webkit] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (996ms)
  ok 292 [webkit] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (855ms)
  ok 296 [webkit] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (16ms)
  ok 283 [webkit] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.8s)
  ok 297 [webkit] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (605ms)
  ok 294 [webkit] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (1.5s)
  ok 295 [webkit] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (1.5s)
  ok 298 [webkit] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (1.5s)
este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)
  ok 299 [webkit] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (1.4s)
  ok 289 [webkit] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (3.1s)
  ok 302 [webkit] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (1.2s)
  ok 303 [webkit] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (934ms)
  ok 300 [webkit] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (1.8s)
  ok 301 [webkit] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (1.6s)
  ok 305 [webkit] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (1.4s)
  ok 304 [webkit] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (1.6s)
  ok 306 [webkit] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (1.4s)

  306 passed (1.0m)

▶ lighthouse ci
  $ pnpm run lhci

> fileorca@0.0.0 lhci C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lighthouse.ts

Started a web server on port 60336...
Running Lighthouse 3 time(s) on http://localhost:60336/compress-image/
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!
Dumping 3 reports to disk at C:\Users\vmatusita\projetos\fileorca\.lighthouseci\reports...
Done writing reports to disk.
Checking assertions against 1 URL(s), 3 total run(s)

All results processed!
lighthouse (celular): /compress-image/ → performance 100, accessibility 100, best-practices 100, seo 100

▶ lint:texto (LanguageTool)
  $ pnpm run lint:texto

> fileorca@0.0.0 lint:texto C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lint-texto.ts

lint:texto: nenhum texto alterado

Resumo do pnpm verificar
  ok       5.9 s  tipos (astro check)
  ok       1.5 s  lint (eslint)
  ok       5.7 s  build (astro build do zero)
  ok       3.0 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       5.2 s  licenças
  ok       0.4 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok      62.8 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      36.3 s  lighthouse ci
  ok       0.4 s  lint:texto (LanguageTool)
  total 123.1 s (limite 900 s)
```

</details>

## CI na PR

No commit `b562124` (PR em rascunho): [execução 41152692951](https://github.com/vmatusita/fileorca/actions/runs/41152692951), **verde**. O `pnpm verificar` levou **448,8 s** no Ubuntu 24.04 (limite 900 s) e o job `verificar` inteiro, 8 min 51 s. O job de merge respondeu "pode-mesclar: sem merge - PR em rascunho: o merge espera ela ficar pronta." e o `pos-deploy` foi pulado.

Enquanto a PR é rascunho, o job de merge recusa sem comentar (§ 14).

## Prévia do Workers Builds

**Não abriu, por um motivo agora confirmado.** O Cloudflare comentou na PR ("Preview Deployments by commit") e o build `f2790489` passou da instalação (25 s) e do build (5 s), com `[fileorca:platform-files] _headers, _redirects and build.txt (b562124) written` e `27 page(s) built`. O comando de prévia, `npx wrangler preview` (wrangler 4.156.0), falhou em 4 s:

```
✘ [ERROR] Your Wrangler configuration is missing a `previews` block to run this command. Add the following to your configuration file:
  {
    "previews": {}
  }
```

Sem URL, não há como conferir o 200, o `noindex` e o `build.txt` da prévia. A mudança que resolve não cabe numa run sem decisão do Victor (arquitetura fixa): ela está na ADR-002.

## Decisões novas

- **§ 37 · A falha do Workers Builds era o comando de build no painel.** Registra a causa real; o Node 24 e o pnpm 10 ficam até o Victor decidir voltar ao Node 26 e ao pnpm 12, numa run própria.
- **ADR-002** continua "Proposta", agora confirmada pelo log.

## Revisão

Uma rodada em contexto limpo, com um subagente Sonnet que leu a ficha (o prompt do ajuste), o diff contra a main e este relatório, sem acesso ao painel. Resultado: nenhum achado alto, seis médios e quatro baixos, todos tratados antes do commit final.

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| "Todo build" falhava por `pnpm buid`, mas só dois logs foram lidos até o fim | médio | o texto diz "os cinco logs lidos param na etapa de build; os dois lidos até o fim mostram `Command "buid" not found`" no CLAUDE.md, no § 37, na ADR-002 e nos dois relatórios |
| "A hipótese da ADR-002 estava certa" exagera: os builds da F1a paravam antes | médio | "o mecanismo da ADR-002 está confirmado, mas não era a causa das falhas da F1a" |
| A página do build mostrar a configuração atual entrou como regra sem a observação que a sustenta | médio | a regra cita a observação (build `d925f68d`: `pnpm build` na configuração, `pnpm buid` no log) |
| Mudanças só no working tree | médio | commitadas e enviadas com este relatório |
| A nota do relatório da F1a não cobria o Resumo, o critério 12, a revisão e a pendência 8 | médio | nota de topo generalizada e aviso na pendência 8 |
| ADR-002 com texto antigo que soa atual; "ruído" sem base; § 17 ainda dizendo "uma linha cada"; regra do CLAUDE.md sem a opção 2; leitura no Chrome sem limite; "nenhuma mudança no painel" sem o clique | baixos | aviso no topo da ADR-002, "fila e instalação", linha no § 17, "sem a decisão do Victor na ADR-002", "só leitura, quando ele pedir", e o escopo do relatório cita o clique |

O revisor confirmou que nada fora da documentação mudou, que o CLAUDE.md só ganhou linhas e que PLANO, ADR-001, `.githooks/`, `.claude/settings.json` e `docs/design/` ficaram intactos.

## O que sobrou para o Victor

1. **Decidir a ADR-002.** Opção 1 (a proposta): no painel, Workers e Pages → fileorca → Configurações → Compilações → aba "Base de Prévias", trocar o "Comando de preview" de `npx wrangler preview` para `npx wrangler versions upload` e refazer o build da prévia de uma PR. Opção 2: pedir uma run de ajuste que acrescente `"previews": {}` ao `wrangler.jsonc` e revise a ADR-001 e o teste de Worker sem código.
2. **Depois da decisão,** conferir a prévia de uma PR: a URL do comentário do Cloudflare responde 200, traz `x-robots-tag: noindex`, e o `/build.txt` traz o commit da PR.
3. **Opcional:** decidir se volta ao Node 26 e ao pnpm 12 (§ 37). Não é urgente: Node 24 e pnpm 10 funcionam no CI e no Workers Builds.
4. As pendências 4 a 9 do relatório da F1a seguem abertas (foto do Sobre, campos da `F0-SAIDA.md`, e-mail da marca, textos que dependem de conta, § 24, AdSense desligado).
