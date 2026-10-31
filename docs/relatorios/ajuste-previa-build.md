# Ajuste `ajuste-previa-build` · Relatório

Run curta pedida pelo Victor depois do merge da F1a, na mesma sessão. Branch `ajuste-previa-build`, PR [vmatusita/fileorca#3](https://github.com/vmatusita/fileorca/pull/3). Prompt em `docs/prompts/prompt-ajuste-previa-build.md`, com os pedidos seguintes da sessão. Começou só com documentação; com a decisão do Victor na ADR-002, passou a incluir o bloco `"previews": {}` no `wrangler.jsonc`, o portão "worker sem código" e o teste de plataforma. No painel do Cloudflare, quem mudou a configuração foi o Victor; o Claude leu logs e, com o OK dele, clicou em "Tentar compilar novamente".

## Resumo

Os builds do Workers Builds da F1a, de prévia e de produção, falhavam porque o comando de build salvo no painel era `pnpm buid`: os cinco logs lidos param na etapa de build, e os dois lidos até o fim mostram `Command "buid" not found`. O Victor corrigiu para `pnpm build`, e a F1a está no ar em fileorca.com desde então. A troca de Node 26 e pnpm 12 para Node 24 e pnpm 10 (DECISOES § 17) não tinha relação com a falha (§ 37).

Com o comando certo, a prévia das PRs passou a parar no `npx wrangler preview`, que exige o bloco `previews` no `wrangler.jsonc`. Trocar o comando de prévia no painel (opção 1 da ADR-002) não teve efeito em três builds. O Victor aceitou a opção 2: com `"previews": {}`, a prévia desta PR abriu, com 200, `x-robots-tag: noindex` e o `build.txt` do commit da PR (§ 38).

## O que aconteceu, em ordem

1. Merge da F1a (`249307f`, 30/out, 22:48 UTC). O build de produção falhou, fileorca.com seguiu no Hello World da F0 e o pós-deploy esperou 20 min e abriu a issue #2.
2. A pedido do Victor, o Claude leu o log no Chrome dele (só leitura): instalação ok com Node 24.22.2 e pnpm 10.34.9, e `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, `Command "buid" not found` no build.
3. O Victor corrigiu o comando de build para `pnpm build`. Com o OK dele, o Claude clicou em "Tentar compilar novamente": o build `a49d23cc` passou (instalação 27 s, build 6 s, deploy 16 s, 72 arquivos, versão `838f4cb1`).
4. Conferência de produção, por `curl`: `build.txt` com `249307f9398fff7aa09c1d453ce90bd807340c13`; `/`, `/pt/`, `/es/`, `/compress-image/`, `/pt/comprimir-imagem/`, `/robots.txt` e `/sitemap-index.xml` com 200; um caminho inexistente com 404; todos com `x-robots-tag: noindex`, inclusive `fileorca.vmatusita.workers.dev`; `nosniff`, `Referrer-Policy`, `frame-ancestors` e HSTS presentes.
5. O pós-deploy foi reexecutado ([execução 41140479979](https://github.com/vmatusita/fileorca/actions/runs/41140479979)) e passou: "LAUNCHED = false: produção conferida, IndexNow não disparado (site em noindex)". A issue #2 foi fechada com a causa.
6. Esta PR, aberta em rascunho, foi o primeiro build de branch com o comando certo: instalação e build ok, e o `npx wrangler preview` parou no bloco `previews`.
7. O Victor trocou o "Comando de preview" do painel para `npx wrangler versions upload` (opção 1). O build refeito `b0d5cbc1`, o build novo `0e470be5` e, depois de o Victor salvar de novo, o build `1cfc0742` registraram e rodaram `npx wrangler preview`. O Claude parou de tentar (regra anti-loop).
8. O Victor aceitou a opção 2. Commit `771f9cc`: `"previews": {}` no `wrangler.jsonc`, portão e teste aceitando o campo só vazio. O build `49b90873` passou e o Cloudflare comentou na PR com a Preview URL e a Deployment URL.

## Logs lidos no painel

| Build | Tipo | Commit | Node e pnpm | Onde parou |
| --- | --- | --- | --- | --- |
| `d925f68d` | prévia | `bc0f703` | 26.13.0 e 12.16.1 | instalação ok ("Done in 7.2s using pnpm v12.16.1"); `Command "buid" not found` |
| `b9d3b134` | prévia | `af28dfa` | 26.13.0 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `adb0c2f3` | prévia | `a120197` | 24.22.2 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `8d03fd90` | prévia | `9bb5ccf` | 24.22.2 e 10.34.9 | instalação ok; etapa Building falhou em 2 s |
| `62a07a98` | produção | `249307f` | 24.22.2 e 10.34.9 | instalação ok; `Command "buid" not found` |
| `a49d23cc` | produção, refeito | `249307f` | 24.22.2 e 10.34.9 | **passou** |
| `f2790489` | prévia | `b562124` | 24.22.2 e 10.34.9 | build ok (27 páginas); `npx wrangler preview`: "missing a `previews` block" |
| `b0d5cbc1` | prévia, refeito | `f8a293c` | 24.22.2 e 10.34.9 | depois da troca no painel; ainda `Executing user deploy command: npx wrangler preview`, mesmo erro |
| `0e470be5` | prévia | `c04a57d` | 24.22.2 e 10.34.9 | idem |
| `1cfc0742` | prévia | `14b8188` | 24.22.2 e 10.34.9 | idem, depois de o Victor salvar de novo |
| `49b90873` | prévia | `76fbf57` | 24.22.2 e 10.34.9 | **passou**, com `"previews": {}` |

A configuração mostrada na página de um build nem sempre é a que rodou: depois da correção, o build `d925f68d` mostra `pnpm build` na configuração, e o log dele traz `Executing user build command: pnpm buid`. O que vale é o log.

## O que mudou

| Arquivo | Mudança |
| --- | --- |
| `wrangler.jsonc` | `"previews": {}` e um comentário apontando a ADR-002 |
| `scripts/gates/worker.ts` | o campo `previews` entra no contrato, só como objeto vazio |
| `tests/unit/platform.test.ts` | o mesmo contrato no teste de plataforma (o teste falhou antes do `wrangler.jsonc` mudar) |
| `docs/adr/ADR-002-previa-worker-previews.md` | Status "Aceita, opção 2"; "Atualização" com os logs, as tentativas da opção 1 e a seção "Decisão" |
| `DECISOES.md` | § 37 (a falha era o comando de build; Node 24 e pnpm 10 ficam), § 38 (bloco `previews` vazio) e uma linha no § 17 |
| `docs/relatorios/fase-01a.md` | Notas de atualização no topo, na seção da prévia e nas pendências 1 e 8; o texto original fica para registro |
| `CLAUDE.md` | Seção nova no fim, "Ajuste da prévia: o que a F1a entendeu errado sobre o Workers Builds" (só acréscimo) |
| `docs/prompts/prompt-ajuste-previa-build.md` | O pedido desta run e os pedidos seguintes |
| `docs/relatorios/ajuste-previa-build.md` | Este relatório |

## pnpm verificar na máquina local

Windows 11, Node 26.8.1 local, no commit `76fbf57`: verde em **128,5 s** (limite 900 s); 122 testes Vitest e 306 Playwright. O `lint:texto` não teve texto do site alterado para conferir. A primeira rodada, no commit `b562124` (só documentação), passou em 123,1 s.

<details>
<summary>Saída completa (commit 76fbf57)</summary>

```

> fileorca@0.0.0 verificar C:\Users\vmatusita\projetos\fileorca
> node scripts/verificar.ts


▶ tipos (astro check)
  $ pnpm run tipos

> fileorca@0.0.0 tipos C:\Users\vmatusita\projetos\fileorca
> astro check

22:27:39 [types] Generated 53ms
22:27:39 [check] Getting diagnostics for Astro files in C:\Users\vmatusita\projetos\fileorca...
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

22:27:47 [types] Generated 35ms
22:27:47 [build] output: "static"
22:27:47 [build] mode: "static"
22:27:47 [build] directory: C:\Users\vmatusita\projetos\fileorca\dist\
22:27:47 [build] Collecting build info...
22:27:47 [build] ✓ Completed in 67ms.
22:27:47 [build] Building static entrypoints...
22:27:47 [vite] ✓ built in 446ms
22:27:47 [vite] ✓ built in 72ms
22:27:47 [build] Rearranging server assets...

 generating static routes 
22:27:47   ├─ /404.html (+15ms) 
22:27:47   ├─ /about/index.html (+6ms) 
22:27:47   ├─ /compress-image/index.html (+9ms) 
22:27:47   ├─ /contact/index.html (+5ms) 
22:27:47   ├─ /es/404.html (+3ms) 
22:27:47   ├─ /es/acerca-de/index.html (+2ms) 
22:27:47   ├─ /es/apoyo/index.html (+3ms) 
22:27:47   ├─ /es/comprimir-imagen/index.html (+3ms) 
22:27:47   ├─ /es/contacto/index.html (+2ms) 
22:27:47   ├─ /es/licencias/index.html (+6ms) 
22:27:47   ├─ /es/privacidad/index.html (+4ms) 
22:27:47   ├─ /es/terminos/index.html (+2ms) 
22:27:47   ├─ /es/index.html (+3ms) 
22:27:47   ├─ /licenses/index.html (+5ms) 
22:27:47   ├─ /og/en/home.png (+197ms) 
22:27:47   ├─ /og/pt/home.png (+120ms) 
22:27:48   ├─ /og/es/home.png (+117ms) 
22:27:48   ├─ /og/en/compress-image.png (+143ms) 
22:27:48   ├─ /og/pt/compress-image.png (+111ms) 
22:27:48   ├─ /og/es/compress-image.png (+112ms) 
22:27:48   ├─ /og/en/privacy.png (+110ms) 
22:27:48   ├─ /og/pt/privacy.png (+115ms) 
22:27:48   ├─ /og/es/privacy.png (+113ms) 
22:27:48   ├─ /og/en/terms.png (+125ms) 
22:27:49   ├─ /og/pt/terms.png (+138ms) 
22:27:49   ├─ /og/es/terms.png (+113ms) 
22:27:49   ├─ /og/en/about.png (+107ms) 
22:27:49   ├─ /og/pt/about.png (+107ms) 
22:27:49   ├─ /og/es/about.png (+103ms) 
22:27:49   ├─ /og/en/contact.png (+106ms) 
22:27:49   ├─ /og/pt/contact.png (+139ms) 
22:27:49   ├─ /og/es/contact.png (+112ms) 
22:27:49   ├─ /og/en/licenses.png (+102ms) 
22:27:50   ├─ /og/pt/licenses.png (+114ms) 
22:27:50   ├─ /og/es/licenses.png (+134ms) 
22:27:50   ├─ /og/en/support.png (+109ms) 
22:27:50   ├─ /og/pt/support.png (+104ms) 
22:27:50   ├─ /og/es/support.png (+109ms) 
22:27:50   ├─ /privacy/index.html (+3ms) 
22:27:50   ├─ /pt/404.html (+2ms) 
22:27:50   ├─ /pt/apoie/index.html (+2ms) 
22:27:50   ├─ /pt/comprimir-imagem/index.html (+2ms) 
22:27:50   ├─ /pt/contato/index.html (+2ms) 
22:27:50   ├─ /pt/licencas/index.html (+4ms) 
22:27:50   ├─ /pt/privacidade/index.html (+2ms) 
22:27:50   ├─ /pt/sobre/index.html (+2ms) 
22:27:50   ├─ /pt/termos/index.html (+2ms) 
22:27:50   ├─ /pt/index.html (+2ms) 
22:27:50   ├─ /search-index.json (+2ms) 
22:27:50   ├─ /sitemap-index.xml (+1ms) 
22:27:50   ├─ /support/index.html (+1ms) 
22:27:50   ├─ /terms/index.html (+2ms) 
22:27:50   ├─ /icon-192.png (+93ms) 
22:27:50   ├─ /icon-512.png (+92ms) 
22:27:50   ├─ /manifest-en.webmanifest (+1ms) 
22:27:50   ├─ /manifest-pt.webmanifest (+1ms) 
22:27:50   ├─ /manifest-es.webmanifest (+1ms) 
22:27:50   ├─ /sitemap-en.xml (+1ms) 
22:27:50   ├─ /sitemap-pt.xml (+1ms) 
22:27:50   ├─ /sitemap-es.xml (+1ms) 
22:27:50   ├─ /index.html (+2ms) 
22:27:50 ✓ Completed in 3.23s.

22:27:50 [build] ✓ Completed in 3.80s.
22:27:50 [fileorca:platform-files] _headers, _redirects and build.txt (76fbf57) written
22:27:50 [build] 27 page(s) built in 3.89s
22:27:50 [build] Complete!

▶ vitest
  $ pnpm run test

> fileorca@0.0.0 test C:\Users\vmatusita\projetos\fileorca
> vitest run


 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca


 Test Files  13 passed (13)
      Tests  122 passed (122)
   Start at  22:27:52
   Duration  1.40s (transform 48%, import 27%, tests 24%, worker 1%)


▶ cabeçalhos gerados
  $ pnpm run gate:cabecalhos

> fileorca@0.0.0 gate:cabecalhos C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/cabecalhos.ts

cabeçalhos: ok, 6 regras, LAUNCHED = false, build.txt 76fbf57

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

  ok   3 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (879ms)
  ok   4 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (900ms)
  ok   1 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (1.0s)
  ok   2 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (1.0s)
  ok   6 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (949ms)
  ok   5 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.2s)
  ok   7 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (818ms)
  ok   9 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (838ms)
  ok   8 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (879ms)
  ok  10 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (830ms)
  ok  11 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (795ms)
  ok  12 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (891ms)
  ok  13 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (725ms)
  ok  14 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (788ms)
  ok  15 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (781ms)
  ok  17 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (743ms)
  ok  16 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (805ms)
  ok  18 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (944ms)
  ok  19 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (1.1s)
  ok  22 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (903ms)
  ok  20 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (982ms)
  ok  21 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (1.0s)
  ok  23 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (1.0s)
  ok  24 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (985ms)
  ok  25 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (833ms)
  ok  26 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (847ms)
  ok  27 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (927ms)
  ok  28 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (935ms)
  ok  29 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (908ms)
  ok  30 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (916ms)
  ok  31 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (976ms)
  ok  32 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (1.0s)
  ok  33 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (984ms)
  ok  34 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (1.1s)
  ok  35 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (1.1s)
  ok  36 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.1s)
  ok  37 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (926ms)
  ok  38 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (918ms)
  ok  39 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (900ms)
  ok  40 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (825ms)
  ok  41 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (930ms)
  ok  42 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (828ms)
  ok  43 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (798ms)
  ok  44 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (815ms)
  ok  45 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (788ms)
  ok  46 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (894ms)
  ok  47 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (943ms)
  ok  49 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (761ms)
  ok  48 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (908ms)
  ok  50 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (787ms)
  ok  51 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (847ms)
  ok  52 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (816ms)
  ok  53 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (816ms)
  ok  54 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (774ms)
  ok  56 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (842ms)
  ok  57 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (851ms)
  ok  58 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (806ms)
  ok  55 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (1.3s)
  ok  59 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (912ms)
  ok  60 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (998ms)
  ok  61 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (943ms)
  ok  62 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (993ms)
  ok  63 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (965ms)
  ok  64 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (1.1s)
  ok  65 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (1.1s)
  ok  66 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (937ms)
  ok  67 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (980ms)
  ok  68 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (946ms)
  ok  69 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (1.0s)
  ok  70 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (997ms)
  ok  71 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (913ms)
  ok  72 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (867ms)
  ok  73 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (833ms)
  ok  74 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (930ms)
  ok  75 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (957ms)
  ok  76 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (1.1s)
  ok  78 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (882ms)
  ok  77 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (1.0s)
  ok  79 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (899ms)
  ok  80 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (942ms)
  ok  81 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (981ms)
  ok  83 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (835ms)
  ok  82 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (920ms)
  ok  84 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (914ms)
  ok  85 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (838ms)
  ok  86 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (960ms)
  ok  87 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (1.0s)
  ok  88 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (1.0s)
  ok  91 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (1.0s)
  ok  89 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (1.1s)
  ok  90 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (1.0s)
  ok  92 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (1.1s)
  ok  93 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (966ms)
  ok  94 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (1.0s)
  ok  95 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (912ms)
  ok  97 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (937ms)
  ok  96 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (947ms)
  ok  98 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (868ms)
  ok  99 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (885ms)
  ok 100 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (820ms)
  ok 101 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (792ms)
  ok 103 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (993ms)
  ok 102 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (1.0s)
  ok 104 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (958ms)
  ok 105 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (839ms)
  ok 106 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (811ms)
  ok 107 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (813ms)
  ok 109 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (852ms)
  ok 108 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (873ms)
  ok 114 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (265ms)
  ok 110 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (830ms)
  ok 113 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (610ms)
  ok 116 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (230ms)
  ok 112 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (855ms)
  ok 115 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (634ms)
  ok 111 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (1.2s)
  ok 118 [chromium] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (558ms)
  ok 123 [chromium] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (142ms)
  ok 124 [chromium] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (120ms)
JS inicial: 13.4 KB gzip (2 arquivos + inline)
  ok 119 [chromium] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (693ms)
/compress-image/: 4 requisições (/compress-image/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/: 2 requisições (/, /_astro/BaseLayout.BHSD3xfz.css)
/pt/comprimir-imagem/: 4 requisições (/pt/comprimir-imagem/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 125 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (364ms)
  ok 117 [chromium] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (1.3s)
  ok 126 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (434ms)
  ok 127 [chromium] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (156ms)
  ok 128 [chromium] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (145ms)
/privacy/: 1 novas (/privacy/)
  ok 120 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.2s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 121 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.2s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 131 [chromium] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (205ms)
  ok 122 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.2s)
  ok 129 [chromium] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (290ms)
  ok 132 [chromium] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (228ms)
  ok 134 [chromium] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (195ms)
  ok 136 [chromium] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (252ms)
  ok 137 [chromium] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (270ms)
  ok 133 [chromium] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (532ms)
  ok 140 [chromium] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (93ms)
  ok 138 [chromium] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (272ms)
  ok 139 [chromium] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (318ms)
  ok 144 [chromium] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (25ms)
  ok 142 [chromium] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (227ms)
  ok 143 [chromium] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (462ms)
  ok 145 [chromium] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (529ms)
  ok 146 [chromium] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (498ms)
  ok 141 [chromium] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (851ms)
  ok 149 [chromium] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (363ms)
  ok 150 [chromium] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (318ms)
  ok 147 [chromium] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (848ms)
  ok 135 [chromium] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (1.9s)
  ok 148 [chromium] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (723ms)
  ok 130 [chromium] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.3s)
  ok 152 [chromium] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (555ms)
  ok 151 [chromium] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (609ms)
  ok 153 [chromium] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (708ms)
  ok 154 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (1.6s)
  ok 156 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (1.7s)
  ok 155 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (1.7s)
  ok 157 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (1.7s)
  ok 158 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.7s)
  ok 159 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.6s)
  ok 160 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (1.8s)
  ok 161 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (1.7s)
  ok 162 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (1.7s)
  ok 163 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (1.7s)
  ok 164 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (1.6s)
  ok 165 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (1.4s)
  ok 166 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (1.4s)
  ok 168 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (1.4s)
  ok 167 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (1.5s)
  ok 169 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (1.4s)
  ok 170 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (1.4s)
  ok 171 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (1.4s)
  ok 172 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (1.5s)
  ok 173 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (1.5s)
  ok 174 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (1.5s)
  ok 175 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (1.5s)
  ok 176 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (1.4s)
  ok 177 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (1.4s)
  ok 178 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (1.4s)
  ok 180 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (1.4s)
  ok 179 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (1.5s)
  ok 183 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (1.2s)
  ok 181 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (1.5s)
  ok 182 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (1.4s)
  ok 184 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (1.6s)
  ok 185 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (1.5s)
  ok 186 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (1.5s)
  ok 187 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (1.7s)
  ok 189 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.6s)
  ok 188 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (1.6s)
  ok 190 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (1.4s)
  ok 191 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (1.5s)
  ok 192 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (1.5s)
  ok 195 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (1.3s)
  ok 194 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (1.4s)
  ok 193 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (1.4s)
  ok 196 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (1.4s)
  ok 198 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (1.3s)
  ok 197 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (1.5s)
  ok 200 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (1.4s)
  ok 199 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (1.5s)
  ok 201 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (1.4s)
  ok 202 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (1.3s)
  ok 203 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (1.3s)
  ok 204 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (1.3s)
  ok 205 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (1.3s)
  ok 207 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (1.4s)
  ok 206 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (1.4s)
  ok 209 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (1.5s)
  ok 210 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (2.0s)
  ok 208 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (2.3s)
  ok 211 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (2.0s)
  ok 212 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (2.0s)
  ok 213 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (2.1s)
  ok 214 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (2.4s)
  ok 215 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (2.2s)
  ok 217 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (2.1s)
  ok 216 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (2.4s)
  ok 219 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (2.0s)
  ok 218 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (2.2s)
  ok 220 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (2.3s)
  ok 221 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (2.0s)
  ok 224 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (2.0s)
  ok 225 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (2.0s)
  ok 223 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (2.3s)
  ok 222 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (2.5s)
  ok 226 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (1.9s)
  ok 227 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (2.0s)
  ok 231 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (1.8s)
  ok 228 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (2.1s)
  ok 230 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (2.0s)
  ok 229 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (2.4s)
  ok 233 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (1.9s)
  ok 232 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (2.1s)
  ok 236 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (1.9s)
  ok 235 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (2.1s)
  ok 234 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (2.2s)
  ok 237 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (2.1s)
  ok 238 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (2.1s)
  ok 239 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (2.3s)
  ok 240 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (1.9s)
  ok 241 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (2.3s)
  ok 242 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (2.3s)
  ok 243 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (2.4s)
  ok 244 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (2.1s)
  ok 245 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (2.0s)
  ok 246 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (2.0s)
  ok 247 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (2.0s)
  ok 248 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (2.2s)
  ok 249 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (2.3s)
  ok 252 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (1.9s)
  ok 251 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (1.9s)
  ok 250 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (2.0s)
  ok 253 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (1.9s)
  ok 254 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (2.0s)
  ok 255 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (2.0s)
  ok 256 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (1.9s)
  ok 258 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (2.0s)
  ok 257 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (2.2s)
  ok 259 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (2.1s)
  ok 260 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (2.0s)
  ok 261 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (2.1s)
  ok 262 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (1.8s)
  ok 263 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (2.1s)
  ok 267 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (567ms)
  ok 266 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (1.3s)
  ok 269 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (534ms)
  ok 265 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (2.5s)
  ok 268 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (1.5s)
  ok 264 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (3.3s)
  ok 271 [webkit] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (1.3s)
JS inicial: 13.4 KB gzip (2 arquivos + inline)
  ok 272 [webkit] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (870ms)
  ok 276 [webkit] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (494ms)
  ok 277 [webkit] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (418ms)
/compress-image/: 5 requisições (/compress-image/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/: 3 requisições (/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css)
/pt/comprimir-imagem/: 5 requisições (/pt/comprimir-imagem/, /manifest-pt.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/privacy/: 1 novas (/privacy/)
  ok 273 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.5s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 274 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.5s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 275 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.6s)
  ok 278 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (1.1s)
  ok 279 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (1.1s)
  ok 281 [webkit] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (410ms)
  ok 280 [webkit] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (493ms)
  ok 285 [webkit] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (656ms)
  ok 284 [webkit] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (835ms)
  ok 282 [webkit] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (1.2s)
  ok 287 [webkit] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (515ms)
  ok 288 [webkit] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (405ms)
  ok 270 [webkit] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (4.5s)
  ok 286 [webkit] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (1.5s)
  ok 293 [webkit] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (80ms)
  ok 290 [webkit] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (538ms)
  ok 291 [webkit] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (906ms)
  ok 292 [webkit] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (754ms)
  ok 297 [webkit] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (55ms)
  ok 283 [webkit] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.7s)
  ok 296 [webkit] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (728ms)
  ok 294 [webkit] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (1.5s)
  ok 295 [webkit] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (1.5s)
  ok 298 [webkit] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (1.6s)
este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)
  ok 299 [webkit] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (1.4s)
  ok 289 [webkit] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (3.2s)
  ok 302 [webkit] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (1.2s)
  ok 301 [webkit] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (1.5s)
  ok 303 [webkit] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (972ms)
  ok 300 [webkit] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (2.1s)
  ok 304 [webkit] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (1.6s)
  ok 305 [webkit] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (1.4s)
  ok 306 [webkit] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (1.5s)

  306 passed (1.1m)

▶ lighthouse ci
  $ pnpm run lhci

> fileorca@0.0.0 lhci C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lighthouse.ts

Started a web server on port 61315...
Running Lighthouse 3 time(s) on http://localhost:61315/compress-image/
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
  ok       1.8 s  lint (eslint)
  ok       6.2 s  build (astro build do zero)
  ok       2.9 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       5.1 s  licenças
  ok       0.4 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok      67.5 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      36.3 s  lighthouse ci
  ok       0.4 s  lint:texto (LanguageTool)
  total 128.5 s (limite 900 s)
```

</details>

## CI na PR

- Commit `76fbf57` (com o bloco `previews`, PR em rascunho): [execução 41155449315](https://github.com/vmatusita/fileorca/actions/runs/41155449315), **verde**. O `pnpm verificar` levou **433,2 s** no Ubuntu 24.04 (limite 900 s) e o job `verificar`, 8 min 35 s. O job de merge respondeu "pode-mesclar: sem merge - PR em rascunho: o merge espera ela ficar pronta." e o `pos-deploy` foi pulado.
- Commit `b562124` (só documentação): [execução 41152692951](https://github.com/vmatusita/fileorca/actions/runs/41152692951), verde, verificar em 448,8 s.
- As execuções dos commits intermediários foram canceladas pelo próprio CI quando chegou um commit novo (concorrência por PR).

Este relatório entra num commit depois do `76fbf57`; a execução desse commit, já com a PR pronta, é a que o job de merge usa.

## Prévia do Workers Builds

**Abriu.** Build [`49b90873`](https://dash.cloudflare.com/7d17f149ef7a8efc5734a94d9790bc28/workers/services/view/fileorca/production/previews/ajuste-previa-build/builds/49b90873-34b0-4e02-8cc2-4ca7201a8499) do commit `76fbf57`, com "Build: Success" e "Deployment: Success" no comentário do Cloudflare na PR.

- Preview URL (fixa por branch): https://ajuste-previa-build-fileorca.vmatusita.workers.dev
- Deployment URL (deste commit): https://52a706ba-fileorca.vmatusita.workers.dev

Conferido por `curl` nos dois endereços:

| Caminho | Status | `x-robots-tag` |
| --- | --- | --- |
| `/` | 200 | `noindex` |
| `/pt/` | 200 | `noindex` |
| `/es/` | 200 | `noindex` |
| `/compress-image/` | 200 | `noindex` |
| `/nao-existe/` | 404 | `noindex` |

O `/build.txt` traz `76fbf577192402dd7dd4ced8bfc828727f3b6de0`, o commit da PR, e a página inicial traz `nosniff`, `Referrer-Policy`, `frame-ancestors 'self'` e HSTS. A produção não mudou: fileorca.com segue no `249307f`. Com isso, o critério 12 da F1a (a prévia) fica atendido por este ajuste.

## Decisões novas

- **§ 37 · A falha do Workers Builds era o comando de build no painel.** Registra a causa real; o Node 24 e o pnpm 10 ficam até o Victor decidir voltar ao Node 26 e ao pnpm 12, numa run própria.
- **§ 38 · Bloco `previews` vazio no `wrangler.jsonc`.** A ADR-002 fica aceita na opção 2, como emenda aos itens 2 e 5 da ADR-001 (que não é editada).

## Revisão

**Rodada 1 (só documentação, commit `b562124`).** Uma rodada em contexto limpo, com um subagente Sonnet que leu a ficha (o prompt do ajuste), o diff contra a main e este relatório, sem acesso ao painel. Resultado: nenhum achado alto; os médios e baixos estão na tabela (os dois achados sobre "todo build" viraram uma linha), todos tratados antes do commit seguinte.

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| "Todo build" falhava por `pnpm buid`, mas só dois logs foram lidos até o fim | médio | o texto diz "os cinco logs lidos param na etapa de build; os dois lidos até o fim mostram `Command "buid" not found`" no CLAUDE.md, no § 37, na ADR-002 e nos dois relatórios |
| "A hipótese da ADR-002 estava certa" exagera: os builds da F1a paravam antes | médio | "o mecanismo da ADR-002 está confirmado, mas não era a causa das falhas da F1a" |
| A página do build mostrar a configuração atual entrou como regra sem a observação que a sustenta | médio | a regra cita a observação (build `d925f68d`: `pnpm build` na configuração, `pnpm buid` no log) |
| Mudanças só no working tree | médio | commitadas e enviadas com este relatório |
| A nota do relatório da F1a não cobria o Resumo, o critério 12, a revisão e a pendência 8 | médio | nota de topo generalizada e aviso na pendência 8 |
| ADR-002 com texto antigo que soa atual; "ruído" sem base; § 17 ainda dizendo "uma linha cada"; regra do CLAUDE.md sem a opção 2; leitura no Chrome sem limite; "nenhuma mudança no painel" sem o clique | baixos | aviso no topo da ADR-002, "fila e instalação", linha no § 17, "sem a decisão do Victor na ADR-002", "só leitura, quando ele pedir", e o escopo do relatório cita o clique |

O revisor confirmou que nada fora da documentação mudou, que o CLAUDE.md só ganhou linhas e que PLANO, ADR-001, `.githooks/`, `.claude/settings.json` e `docs/design/` ficaram intactos.

**Rodada 2 (estado final, com o `wrangler.jsonc`).** Outro subagente Sonnet em contexto limpo leu a ficha com os pedidos seguintes, o diff contra a main e este relatório. Nenhum achado alto. Ele confirmou que o portão "worker sem código" continua recusando `main`, `run_worker_first` (inclusive dentro de `previews`), qualquer campo a mais e `previews` ausente, e agora também `previews` não vazio, `[]` ou `null`; que o teste de plataforma bate com o portão; que nada fora do bloco vazio foi afrouxado; que PLANO, ADR-001, `.githooks/`, `.claude/`, `docs/design/` e `.github/` ficaram intactos; e que o CLAUDE.md só ganhou linhas. Ele também conferiu a Preview URL por `curl` (200, `noindex`, cabeçalhos e `build.txt` com `76fbf57`).

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| Seções "CI na PR" e desta rodada vazias, e arquivos sem commit, com a PR a um passo do merge automático | médio | preenchidas e commitadas antes de a PR ficar pronta |
| Datas "31/out/2026" (UTC) na ADR-002 e no § 38, contra o 30/out do resto | baixo | 30/out/2026 |
| A última pegadinha da F1a no CLAUDE.md (prévia dependendo do painel) segue lá e não pode ser apagada | baixo | a seção nova diz que a substitui; "não tem efeito" virou "não teve efeito em três builds" |
| "As opções e a proposta acima continuam valendo" na ADR-002 | baixo | marcado como superado pela "Decisão" |
| Contagem de achados da rodada 1 diferente da tabela | baixo | texto alinhado à tabela |
| Menções à ADR-002 como "Proposta" no relatório da F1a fora da nota | baixo | a nota de topo passou a cobri-las |

## O que sobrou para o Victor

1. **Voltar o "Comando de preview" do painel para `npx wrangler preview`** (Configurações → Compilações → Base de Prévias). O `npx wrangler versions upload` que está lá não tem efeito neste Worker, e o painel não deve mostrar um comando diferente do que roda.
2. **Opcional:** decidir se volta ao Node 26 e ao pnpm 12 (§ 37). Não é urgente: Node 24 e pnpm 10 funcionam no CI e no Workers Builds.
3. As pendências 4 a 9 do relatório da F1a seguem abertas (foto do Sobre, campos da `F0-SAIDA.md`, e-mail da marca, textos que dependem de conta, § 24, AdSense desligado).
