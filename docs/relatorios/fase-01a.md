# F1a · Relatório da run (fundação técnica)

Run 1 de 2 da F1, branch `fase-01a`, PR [vmatusita/fileorca#1](https://github.com/vmatusita/fileorca/pull/1). Prompt em `docs/prompts/prompt-fase-01a.md`; plano da run (gabarito da revisão) em `docs/relatorios/fase-01a-plano.md`; decisões no `DECISOES.md` (§ 1 a § 36); proposta de arquitetura em `docs/adr/ADR-002-previa-worker-previews.md`.

## Resumo

O repositório agora tem o app Astro 7 estático com a página-modelo Compress image (motor provisório num Web Worker com Comlink) nos três idiomas, as páginas jurídicas e institucionais, o SEO técnico, o consentimento, o AdSlot, os cabeçalhos gerados e o pipeline (CI com o job de merge e o pós-deploy). O `pnpm verificar` roda os 14 portões e está verde na máquina local e no CI. O que não fechou: a prévia do Workers Builds falha em todo commit, por um motivo que só aparece no log do painel do Cloudflare, que a run não acessa (ADR-002, primeira pendência do Victor).

## Critérios de aceitação

| # | Critério | Situação | Evidência |
| --- | --- | --- | --- |
| 1 | `pnpm verificar` verde em até 15 min, local e no CI | atendido | local: 262 s; CI: 320 s ([execução 41133624899](https://github.com/vmatusita/fileorca/actions/runs/41133624899)) (seções abaixo) |
| 2 | Todos os portões ativos | atendido | 14 passos no `scripts/verificar.ts`, nenhum `skip`, `fixme` ou `continue-on-error` |
| 3 | Lighthouse ≥ 90 no celular, página-modelo em inglês | atendido | desempenho 100, acessibilidade 100, boas práticas 100, SEO 100 (LCP 1,2 s, TBT 0 ms, CLS 0) |
| 4 | hreflang, sitemaps, robots.txt | atendido | `pnpm gate:seo`: 24 páginas indexáveis, hreflang recíproco e autorreferente com x-default no inglês, comparado com o mapa; 3 sitemaps num índice; `robots.txt` fixo |
| 5 | `_headers` gerado | atendido | `tests/unit/platform.test.ts` + `pnpm gate:cabecalhos` + cabeçalhos servidos em `tests/e2e/navigation.spec.ts` |
| 6 | Worker sem código | atendido | `tests/unit/platform.test.ts` + `pnpm gate:worker` (campos exatos da ficha) |
| 7 | `pode-mesclar.ts` e `urls-alteradas.ts` testados | atendido | 24 casos no pode-mesclar (fase-\*, ajuste-\*, Dependabot patch, minor e major, workflows, branch qualquer, rascunho) e 9 no urls-alteradas |
| 8 | actionlint sem erro | atendido | actionlint 1.7.12 com shellcheck 0.11.0, ambos fixados por SHA-256 |
| 9 | Jurídicas e institucionais nos três idiomas, sem AdSlot | atendido | 18 páginas (6 × 3 idiomas); `tests/e2e/ads.spec.ts` e `tests/unit/ads-pages.test.ts` (nos três estados de variável) |
| 10 | Consentimento no Playwright | atendido | `tests/e2e/consent.spec.ts` (ordem no dataLayer, região, Aceitar/Recusar para sempre, `__tcfapi` com GDPR, nenhum `gtag.js` fora de fileorca.com, parâmetros dos eventos) + `tests/unit/consent.test.ts` |
| 11 | AdSlot nos três estados | atendido | `tests/unit/ads.test.ts` e `ads-pages.test.ts` (nenhuma, só client, as três); altura e rótulo por idioma em `tests/e2e/ads.spec.ts` |
| 12 | Prévia e job de merge | **parcial** | job de merge: atendido (recusou e comentou que a PR fica para o Victor). Prévia: **não atendido**, todo build do Workers Builds falha por um motivo visível só no painel do Cloudflare (ADR-002, pendência 1) |

## O que foi feito, por área

**Plataforma.** `wrangler.jsonc` exatamente como a ficha manda (Worker `fileorca` só com assets, sem `main` nem `run_worker_first`). `src/platform/headers.ts` gera `_headers` e `_redirects` no build: nosniff, `Referrer-Policy`, `frame-ancestors 'self'`, HSTS de um ano com subdomínios, nenhum COOP/COEP, noindex na regra `https://:version.:subdomain.workers.dev/*`, noindex geral com `LAUNCHED = false` e noindex nos próprios `/404` (§ 29). `build.txt` com o `WORKERS_CI_COMMIT_SHA` (ou `git rev-parse HEAD` fora do Workers Builds). `LAUNCHED = false` em `src/platform/site.ts`. Os 404 saem como `dist/404.html`, `dist/pt/404.html` e `dist/es/404.html` (§ 16).

**Pipeline.** `ci.yml` só em PR (`opened`, `synchronize`, `reopened`, `ready_for_review`), cancelando a execução anterior; o job `verificar` roda o `pnpm verificar` no `ubuntu-24.04`; o job `merge` decide com o `pode-mesclar.ts` tirado da main (§ 26), comenta quando recusa, faz `gh pr merge --squash --delete-branch --match-head-commit` sem `--auto`, comenta e abre issue se o GitHub recusar, valida o commit do merge e chama o `pos-deploy.yml` por `workflow_call`. O `pos-deploy.yml` também roda em push na main e por `workflow_dispatch` (commit e minutos, padrão 20): espera o `build.txt` trazer o commit ou um posterior (`git merge-base --is-ancestor`, histórico completo), reprova `/cdn-cgi/` e `cloudflareinsights` no HTML, compara o `robots.txt` byte a byte com o do commit, confere o `X-Robots-Tag` contra o `LAUNCHED` do commit, dispara o IndexNow só com `LAUNCHED = true` e só com as URLs que mudaram, e abre issue se falhar. Ações fixadas por SHA (§ 31).

**i18n e SEO técnico.** Mapa de rotas com equivalência em `src/i18n/routes.ts` (tabela do § 4), textos tipados por idioma (`src/i18n/types.ts`; faltar uma chave reprova o `pnpm tipos`), 27 páginas finas geradas a partir do mapa. Título, descrição e canonical por página; hreflang recíproco com x-default no inglês (`pt-BR`, § 32); um sitemap por idioma num índice; `public/robots.txt` fixo; schema Organization (com logo), WebSite, BreadcrumbList, WebApplication sem nota e Person/AboutPage no Sobre; imagem de OG por página e idioma no build (§ 21); chave do IndexNow em `public/<chave>.txt`; manifest por idioma e ícones provisórios.

**Página-modelo.** Molde do `docs/design/components/ToolPage`: breadcrumb, H1 com PrivacySeal, painel (DropZone, WaterLevel e ResultCard no mesmo lugar), opções que reprocessam na hora, chips de próximo passo, primeiro AdSlot a 150 px, como usar, nota de privacidade, FAQ e trilho 300×600 a partir de 1280 px. O painel é a única ilha Preact, hidratada por um script (§ 23), com 13,2 KB gzip de JS inicial. O motor provisório (§ 7, § 22, § 25, § 33) regrava JPG, PNG e WebP num `OffscreenCanvas` dentro do worker; sem ganho devolve o original sem metadados; arquivo ilegível cai no erro com a fala da Oli.

**Anúncio, consentimento e eventos.** AdSlot com altura reservada (§ 20) e o rótulo que o AdSense aceita; meta tag e `ads.txt` só com `PUBLIC_ADSENSE_CLIENT`; carregador e unidades só com as três variáveis, só nas páginas de ferramenta e só em fileorca.com (§ 34). Consent Mode v2 com `denied` na UE, no EEE, no Reino Unido e na Suíça e `granted` no resto, antes do `config` (§ 9); `gtag.js` só em fileorca.com (§ 8); aviso de cookies com Recusar e Aceitar, que some para sempre e some onde o `__tcfapi` diz que o GDPR se aplica, com botão de mudar a escolha na política de privacidade (§ 28). Eventos com lista fechada (§ 10).

**Páginas jurídicas e institucionais.** Privacidade, Termos, Sobre, Contato, Licenças (gerada das `dependencies`, § 13) e Apoio mínima (§ 5), nos três idiomas, sem AdSlot. O Sobre sai sem foto (pendência 4).

**Busca.** Combobox num `<dialog>` modal, com o código (1 KB gzip) e o índice carregados só no primeiro uso (§ 15); também no 404.

## Árvore do que nasceu

```
.github/workflows/      ci.yml (verificar, merge, pos-deploy), pos-deploy.yml
.node-version           24.22.2
astro.config.ts         static, trailingSlash always, build.format preserve, worker es, chunk preact-runtime
eslint.config.ts        typescript-eslint + regra fileorca/engine-self-contained
lighthouserc.json       celular, só /compress-image/, upload no disco
playwright.config.ts    chromium + webkit sobre scripts/serve-dist.ts
pnpm-workspace.yaml     onlyBuiltDependencies (esbuild, workerd)
tsconfig.json           astro/tsconfigs/strictest + JSX do Preact
vitest.config.ts        getViteConfig do Astro (Container API)
wrangler.jsonc          Worker "fileorca" só com assets
DECISOES.md             § 1 a § 36
docs/adr/               ADR-002 (Proposta)
docs/relatorios/        fase-01a-plano.md, fase-01a.md
public/                 robots.txt, chave do IndexNow
scripts/verificar.ts    o pnpm verificar
scripts/serve-dist.ts   servidor do dist como o Cloudflare
scripts/ci/             pode-mesclar.ts, urls-alteradas.ts, pos-deploy.ts
scripts/gates/          cabecalhos, worker, seo, links, licencas, dinheiro-saude, actionlint,
                        lighthouse, lint-texto
scripts/lib/            dist, jsonc, links-graph, seo-checks, tools (binários por SHA-256), ymyl
src/ads/                config.ts, AdSlot.astro, AdsenseHead.astro
src/analytics/          consent.ts, events.ts
src/components/         Header, Breadcrumb, PrivacySeal, Footer, CookieNotice, Faq, ToolCard,
                        SearchBox, SearchDialog, RichText
src/engine/image/       recompress.ts, strip.ts, worker.ts (autocontido)
src/i18n/               routes.ts, types.ts, texts.ts, format.ts, en|pt|es/ (9 arquivos cada)
src/layouts/            BaseLayout.astro
src/pages/              27 páginas finas + sitemaps, ads.txt, og, ícones, manifests, índice da busca
src/platform/           site.ts (LAUNCHED), headers.ts, build-files.ts, licenses.ts
src/search/             search.ts, entry.ts
src/seo/                meta.ts, sitemap.ts, images.ts
src/styles/global.css   estilo provisório só com os tokens
src/tools/compress-image/  CompressImagePage.astro, ToolPanel.tsx, mount.ts, engine-client.ts, i18n/
src/views/              Home, Legal, About, Contact, Licenses, Support, NotFound
tests/unit/             13 arquivos, 122 testes
tests/e2e/              7 specs, 153 testes por navegador (306 no total)
```

## pnpm verificar na máquina local

Execução limpa no Windows 11 (Git Bash), em 30/out/2026, no commit `24c6b74`: `node_modules`, `dist` e `.astro` apagados, `pnpm install --frozen-lockfile` (pnpm 10.34.9) e `pnpm verificar` do zero. O Node desta máquina é o 26.8.1; o CI e o Workers Builds usam o 24.22.2 do `.node-version`.

**Tempo total: 262 s (4 min 22 s), limite 900 s.**

```
Resumo do pnpm verificar
  ok       9.2 s  tipos (astro check)
  ok       2.3 s  lint (eslint)
  ok       8.8 s  build (astro build do zero)
  ok       5.2 s  vitest
  ok       0.6 s  cabeçalhos gerados
  ok       0.5 s  worker sem código
  ok       0.6 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.6 s  links internos e páginas órfãs
  ok       7.8 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.6 s  actionlint
  ok     142.3 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      47.3 s  lighthouse ci
  ok      35.4 s  lint:texto (LanguageTool)
  total 261.7 s (limite 900 s)
```

Números que os portões mediram:

- **JS inicial da página-modelo:** 13,2 KB gzip (2 arquivos do próprio domínio mais os scripts inline; o worker e o motor só carregam quando chega a imagem). Orçamento: 80 KB.
- **Requisições na primeira página** (/compress-image/): 4 no Chromium (HTML, CSS, script da ilha e runtime do Preact) e 5 no WebKit (mais o manifest). Orçamento: 8.
- **Requisições novas na segunda página:** /compress-image/ → /privacy/: 1; /pt/comprimir-imagem/ → /pt/sobre/: 1; / → /compress-image/: 3. Orçamento: 3.
- **Lighthouse no celular** (/compress-image/, mediana de 3 execuções, Chromium do Playwright, relatório só no disco): desempenho 100, acessibilidade 100, boas práticas 100, SEO 100; FCP 1,0 s, LCP 1,2 s, TBT 0 ms, CLS 0.
- **Distância dos anúncios:** nenhum AdSlot a menos de 150 px do Baixar, dos campos, do painel ou das caixas da Oli, antes do arquivo e com o resultado na tela, a 360×740 e a 1280×800, em Chromium e WebKit.
- **axe-core 4.14** (WCAG 2.2 AA e boas práticas): 27 páginas a 360 e a 1280 px, nos temas claro e escuro, mais o resultado na tela e a busca aberta, sem violação.
- **lint:texto:** 30 arquivos, 750 textos, nenhum erro de gramática, 287 avisos (quase todos nomes próprios: FileOrca, Oli, Matusita, Ko-fi).
- **Licenças:** 5 dependências que vão ao navegador e 17 de build, todas na lista; 861 pacotes na árvore, nenhum proibido.

<details><summary>Saída completa (877 linhas)</summary>

```
$ git rev-parse HEAD
24c6b7411712d89ddb72f65488b715e5e2476ffd
$ node --version
v26.8.1
$ pnpm --version
10.34.9
$ rm -rf node_modules dist .astro && pnpm install --frozen-lockfile
+ typescript 6.0.3
+ typescript-eslint 8.72.1
+ vitest 5.0.5
+ wrangler 4.156.0

Done in 9.7s using pnpm v10.34.9
$ pnpm verificar

> fileorca@0.0.0 verificar C:\Users\vmatusita\projetos\fileorca
> node scripts/verificar.ts


▶ tipos (astro check)
  $ pnpm run tipos

> fileorca@0.0.0 tipos C:\Users\vmatusita\projetos\fileorca
> astro check

18:42:33 [types] Generated 236ms
18:42:33 [check] Getting diagnostics for Astro files in C:\Users\vmatusita\projetos\fileorca...
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

18:42:43 [types] Generated 38ms
18:42:43 [build] output: "static"
18:42:43 [build] mode: "static"
18:42:43 [build] directory: C:\Users\vmatusita\projetos\fileorca\dist\
18:42:43 [build] Collecting build info...
18:42:43 [build] ✓ Completed in 73ms.
18:42:43 [build] Building static entrypoints...
18:42:44 [vite] ✓ built in 661ms
18:42:44 [vite] ✓ built in 120ms
18:42:44 [build] Rearranging server assets...

 generating static routes 
18:42:44   ├─ /404.html (+21ms) 
18:42:44   ├─ /about/index.html (+6ms) 
18:42:44   ├─ /compress-image/index.html (+11ms) 
18:42:44   ├─ /contact/index.html (+11ms) 
18:42:44   ├─ /es/404.html (+5ms) 
18:42:44   ├─ /es/acerca-de/index.html (+3ms) 
18:42:44   ├─ /es/apoyo/index.html (+4ms) 
18:42:44   ├─ /es/comprimir-imagen/index.html (+4ms) 
18:42:44   ├─ /es/contacto/index.html (+4ms) 
18:42:44   ├─ /es/licencias/index.html (+9ms) 
18:42:44   ├─ /es/privacidad/index.html (+5ms) 
18:42:44   ├─ /es/terminos/index.html (+4ms) 
18:42:44   ├─ /es/index.html (+4ms) 
18:42:44   ├─ /licenses/index.html (+6ms) 
18:42:44   ├─ /og/en/home.png (+225ms) 
18:42:45   ├─ /og/pt/home.png (+174ms) 
18:42:45   ├─ /og/es/home.png (+179ms) 
18:42:45   ├─ /og/en/compress-image.png (+173ms) 
18:42:45   ├─ /og/pt/compress-image.png (+167ms) 
18:42:45   ├─ /og/es/compress-image.png (+291ms) 
18:42:46   ├─ /og/en/privacy.png (+164ms) 
18:42:46   ├─ /og/pt/privacy.png (+174ms) 
18:42:46   ├─ /og/es/privacy.png (+162ms) 
18:42:46   ├─ /og/en/terms.png (+184ms) 
18:42:46   ├─ /og/pt/terms.png (+182ms) 
18:42:46   ├─ /og/es/terms.png (+168ms) 
18:42:47   ├─ /og/en/about.png (+214ms) 
18:42:47   ├─ /og/pt/about.png (+178ms) 
18:42:47   ├─ /og/es/about.png (+174ms) 
18:42:47   ├─ /og/en/contact.png (+163ms) 
18:42:47   ├─ /og/pt/contact.png (+192ms) 
18:42:48   ├─ /og/es/contact.png (+179ms) 
18:42:48   ├─ /og/en/licenses.png (+188ms) 
18:42:48   ├─ /og/pt/licenses.png (+214ms) 
18:42:48   ├─ /og/es/licenses.png (+172ms) 
18:42:48   ├─ /og/en/support.png (+178ms) 
18:42:49   ├─ /og/pt/support.png (+175ms) 
18:42:49   ├─ /og/es/support.png (+155ms) 
18:42:49   ├─ /privacy/index.html (+3ms) 
18:42:49   ├─ /pt/404.html (+2ms) 
18:42:49   ├─ /pt/apoie/index.html (+3ms) 
18:42:49   ├─ /pt/comprimir-imagem/index.html (+5ms) 
18:42:49   ├─ /pt/contato/index.html (+2ms) 
18:42:49   ├─ /pt/licencas/index.html (+7ms) 
18:42:49   ├─ /pt/privacidade/index.html (+3ms) 
18:42:49   ├─ /pt/sobre/index.html (+2ms) 
18:42:49   ├─ /pt/termos/index.html (+5ms) 
18:42:49   ├─ /pt/index.html (+2ms) 
18:42:49   ├─ /search-index.json (+2ms) 
18:42:49   ├─ /sitemap-index.xml (+2ms) 
18:42:49   ├─ /support/index.html (+2ms) 
18:42:49   ├─ /terms/index.html (+4ms) 
18:42:49   ├─ /icon-192.png (+134ms) 
18:42:49   ├─ /icon-512.png (+131ms) 
18:42:49   ├─ /manifest-en.webmanifest (+1ms) 
18:42:49   ├─ /manifest-pt.webmanifest (+1ms) 
18:42:49   ├─ /manifest-es.webmanifest (+1ms) 
18:42:49   ├─ /sitemap-en.xml (+1ms) 
18:42:49   ├─ /sitemap-pt.xml (+1ms) 
18:42:49   ├─ /sitemap-es.xml (+2ms) 
18:42:49   ├─ /index.html (+3ms) 
18:42:49 ✓ Completed in 4.97s.

18:42:49 [build] ✓ Completed in 5.83s.
18:42:49 [fileorca:platform-files] _headers, _redirects and build.txt (24c6b74) written
18:42:49 [build] 27 page(s) built in 5.93s
18:42:49 [build] Complete!

▶ vitest
  $ pnpm run test

> fileorca@0.0.0 test C:\Users\vmatusita\projetos\fileorca
> vitest run


 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca


 Test Files  13 passed (13)
      Tests  122 passed (122)
   Start at  18:42:51
   Duration  2.98s (transform 65%, import 18%, tests 17%, worker 1%)


▶ cabeçalhos gerados
  $ pnpm run gate:cabecalhos

> fileorca@0.0.0 gate:cabecalhos C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/cabecalhos.ts

cabeçalhos: ok, 6 regras, LAUNCHED = false, build.txt 24c6b74

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


Running 304 tests using 6 workers

  ok   1 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (1.4s)
  ok   4 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (1.4s)
  ok   2 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.6s)
  ok   5 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (1.4s)
  ok   6 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (1.4s)
  ok   3 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.8s)
  ok  10 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (1.3s)
  ok   8 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (1.6s)
  ok   7 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (1.7s)
  ok   9 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (1.7s)
  ok  11 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (1.5s)
  ok  12 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (1.5s)
  ok  13 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (1.3s)
  ok  14 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (1.2s)
  ok  15 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (1.4s)
  ok  16 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (1.3s)
  ok  17 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (1.3s)
  ok  18 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (1.4s)
  ok  19 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (1.3s)
  ok  20 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (1.3s)
  ok  23 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (1.2s)
  ok  22 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (1.4s)
  ok  21 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (1.6s)
  ok  24 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (1.4s)
  ok  25 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (1.2s)
  ok  26 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (1.2s)
  ok  27 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (1.3s)
  ok  28 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (1.5s)
  ok  29 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (1.5s)
  ok  30 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (1.4s)
  ok  31 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (1.3s)
  ok  32 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (1.3s)
  ok  33 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (1.4s)
  ok  34 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (1.6s)
  ok  35 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (1.6s)
  ok  37 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (1.3s)
  ok  36 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.7s)
  ok  38 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (1.4s)
  ok  39 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (1.3s)
  ok  40 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (1.4s)
  ok  41 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (1.3s)
  ok  42 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (1.1s)
  ok  43 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (1.3s)
  ok  44 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (1.1s)
  ok  45 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (1.2s)
  ok  48 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (1.5s)
  ok  50 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (1.4s)
  ok  46 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (1.9s)
  ok  49 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (1.8s)
  ok  47 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (2.0s)
  ok  51 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (1.7s)
  ok  52 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (1.6s)
  ok  53 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (1.7s)
  ok  54 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (1.9s)
  ok  57 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (1.6s)
  ok  56 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (2.2s)
  ok  58 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (1.8s)
  ok  59 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (1.7s)
  ok  55 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (3.3s)
  ok  60 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (2.3s)
  ok  61 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (2.2s)
  ok  62 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (2.6s)
  ok  64 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (2.2s)
  ok  63 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (2.4s)
  ok  66 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (2.1s)
  ok  65 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (3.1s)
  ok  67 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (2.2s)
  ok  70 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (1.7s)
  ok  69 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (1.8s)
  ok  68 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (2.3s)
  ok  71 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (1.9s)
  ok  73 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (1.8s)
  ok  72 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (2.4s)
  ok  74 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (2.0s)
  ok  75 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (2.0s)
  ok  76 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (2.6s)
  ok  77 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (2.0s)
  ok  78 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (1.8s)
  ok  80 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (1.8s)
  ok  79 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (2.3s)
  ok  81 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (2.0s)
  ok  83 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (1.7s)
  ok  84 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (1.8s)
  ok  82 [chromium] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (2.3s)
  ok  85 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (1.9s)
  ok  87 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (1.9s)
  ok  86 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (2.2s)
  ok  88 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (1.8s)
  ok  89 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (2.1s)
  ok  90 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (2.9s)
  ok  91 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (2.3s)
  ok  92 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (2.1s)
  ok  94 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (1.8s)
  ok  93 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (2.5s)
  ok  95 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (2.0s)
  ok  98 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (1.7s)
  ok  97 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (1.7s)
  ok  99 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (1.8s)
  ok  96 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (2.3s)
  ok 100 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (2.1s)
  ok 101 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (2.0s)
  ok 102 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (1.8s)
  ok 103 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (1.9s)
  ok 105 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (2.0s)
  ok 104 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (2.2s)
  ok 107 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (1.9s)
  ok 106 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (2.2s)
  ok 108 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (1.6s)
  ok 109 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (1.6s)
  ok 114 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (485ms)
  ok 116 [chromium] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (511ms)
  ok 110 [chromium] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (2.1s)
  ok 115 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (1.2s)
  ok 112 [chromium] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (1.9s)
  ok 113 [chromium] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (2.0s)
JS inicial: 13.2 KB gzip (2 arquivos + inline)
  ok 119 [chromium] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (976ms)
/compress-image/: 4 requisições (/compress-image/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/: 2 requisições (/, /_astro/BaseLayout.BHSD3xfz.css)
  ok 111 [chromium] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (3.8s)
/privacy/: 1 novas (/privacy/)
  ok 120 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.5s)
  ok 118 [chromium] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (2.0s)
/pt/comprimir-imagem/: 4 requisições (/pt/comprimir-imagem/, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 121 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.5s)
  ok 123 [chromium] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (586ms)
  ok 124 [chromium] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (524ms)
  ok 117 [chromium] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (2.7s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 122 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.7s)
  ok 128 [chromium] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (408ms)
  ok 129 [chromium] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (526ms)
  ok 127 [chromium] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (659ms)
  ok 125 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (1.2s)
  ok 131 [chromium] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (447ms)
  ok 132 [chromium] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (443ms)
  ok 126 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (1.6s)
  ok 135 [chromium] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (457ms)
  ok 134 [chromium] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (637ms)
  ok 139 [chromium] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (121ms)
  ok 137 [chromium] › tests\e2e\events.spec.ts:89:1 › the search dialog has a visible close button (770ms)
  ok 138 [chromium] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (711ms)
  ok 133 [chromium] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (1.7s)
  ok 140 [chromium] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (1.0s)
  ok 141 [chromium] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (559ms)
  ok 143 [chromium] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (396ms)
  ok 130 [chromium] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.6s)
  ok 136 [chromium] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (2.7s)
  ok 142 [chromium] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (2.0s)
  ok 145 [chromium] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (1.6s)
  ok 148 [chromium] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (624ms)
  ok 144 [chromium] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (1.9s)
  ok 147 [chromium] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (1.6s)
  ok 149 [chromium] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (694ms)
  ok 151 [chromium] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (1.0s)
  ok 146 [chromium] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (2.6s)
  ok 150 [chromium] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (1.3s)
  ok 152 [chromium] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (1.4s)
  ok 153 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/ (2.1s)
  ok 156 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/ (2.3s)
  ok 154 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › / (2.5s)
  ok 155 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (2.7s)
  ok 157 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /compress-image/ (2.7s)
  ok 158 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (2.5s)
  ok 159 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /privacy/ (3.3s)
  ok 161 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/privacidad/ (3.5s)
  ok 162 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /terms/ (3.3s)
  ok 160 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/privacidade/ (3.8s)
  ok 164 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/terminos/ (3.5s)
  ok 163 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/termos/ (3.6s)
  ok 165 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /about/ (3.1s)
  ok 166 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/sobre/ (3.0s)
  ok 168 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /contact/ (2.9s)
  ok 167 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/acerca-de/ (3.1s)
  ok 169 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/contato/ (2.8s)
  ok 170 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/contacto/ (2.9s)
  ok 171 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /licenses/ (2.4s)
  ok 174 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /support/ (1.8s)
  ok 172 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/licencas/ (2.0s)
  ok 173 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/licencias/ (2.1s)
  ok 175 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/apoie/ (1.9s)
  ok 176 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/apoyo/ (1.9s)
  ok 177 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /404.html (1.3s)
  ok 178 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /pt/404.html (1.4s)
  ok 179 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 360px, tema escuro › /es/404.html (1.4s)
  ok 180 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › / (1.3s)
  ok 181 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/ (1.3s)
  ok 182 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/ (1.3s)
  ok 183 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /compress-image/ (1.5s)
  ok 184 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/comprimir-imagem/ (1.5s)
  ok 185 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/comprimir-imagen/ (1.5s)
  ok 188 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/privacidad/ (1.4s)
  ok 187 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/privacidade/ (1.5s)
  ok 186 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /privacy/ (1.6s)
  ok 189 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /terms/ (1.3s)
  ok 190 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/termos/ (1.4s)
  ok 192 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /about/ (1.2s)
  ok 191 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/terminos/ (1.3s)
  ok 194 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/acerca-de/ (1.2s)
  ok 193 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/sobre/ (1.3s)
  ok 195 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /contact/ (1.0s)
  ok 196 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/contato/ (1.1s)
  ok 197 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/contacto/ (1.2s)
  ok 198 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /licenses/ (1.3s)
  ok 199 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/licencas/ (1.3s)
  ok 200 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/licencias/ (1.3s)
  ok 201 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /support/ (1.3s)
  ok 202 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/apoie/ (1.4s)
  ok 203 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/apoyo/ (1.5s)
  ok 204 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /404.html (1.6s)
  ok 205 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /pt/404.html (1.6s)
  ok 206 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 360px › /es/404.html (1.6s)
  ok 208 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 360px › search dialog open (2.2s)
  ok 207 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 360px › tool page with the result on screen (2.9s)
  ok 209 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › / (7.8s)
  ok 211 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/ (8.6s)
  ok 210 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/ (8.7s)
  ok 212 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /compress-image/ (9.6s)
  ok 213 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (10.2s)
  ok 214 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (10.9s)
  ok 215 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /privacy/ (6.0s)
  ok 217 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/privacidad/ (5.0s)
  ok 216 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/privacidade/ (5.4s)
  ok 218 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /terms/ (4.4s)
  ok 219 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/termos/ (4.3s)
  ok 220 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/terminos/ (4.5s)
  ok 222 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/sobre/ (4.8s)
  ok 221 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /about/ (5.3s)
  ok 223 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/acerca-de/ (4.8s)
  ok 224 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /contact/ (5.2s)
  ok 225 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/contato/ (4.5s)
  ok 226 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/contacto/ (4.2s)
  ok 227 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /licenses/ (4.9s)
  ok 228 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/licencas/ (5.0s)
  ok 229 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/licencias/ (5.1s)
  ok 230 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /support/ (4.6s)
  ok 231 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/apoie/ (4.6s)
  ok 232 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/apoyo/ (4.8s)
  ok 233 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /404.html (5.0s)
  ok 234 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /pt/404.html (5.0s)
  ok 236 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › / (5.0s)
  ok 235 [webkit] › tests\e2e\a11y.spec.ts:15:7 › axe a 1280px, tema escuro › /es/404.html (5.3s)
  ok 237 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/ (5.0s)
  ok 238 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/ (4.9s)
  ok 239 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /compress-image/ (5.5s)
  ok 240 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/comprimir-imagem/ (5.5s)
  ok 242 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /privacy/ (5.5s)
  ok 241 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/comprimir-imagen/ (5.8s)
  ok 243 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/privacidade/ (4.9s)
  ok 244 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/privacidad/ (5.7s)
  ok 245 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /terms/ (5.0s)
  ok 246 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/termos/ (5.2s)
  ok 248 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /about/ (5.2s)
  ok 249 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/sobre/ (5.1s)
  ok 247 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/terminos/ (6.0s)
  ok 250 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/acerca-de/ (5.3s)
  ok 251 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /contact/ (5.5s)
  ok 252 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/contato/ (5.8s)
  ok 254 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /licenses/ (6.8s)
  ok 253 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/contacto/ (7.3s)
  ok 255 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/licencas/ (6.7s)
  ok 256 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/licencias/ (7.9s)
  ok 257 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /support/ (7.2s)
  ok 258 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/apoie/ (7.1s)
  ok 259 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/apoyo/ (7.1s)
  ok 260 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /404.html (6.8s)
  ok 261 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /pt/404.html (6.7s)
  ok 266 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (929ms)
  ok 262 [webkit] › tests\e2e\a11y.spec.ts:27:7 › axe a 1280px › /es/404.html (5.8s)
  ok 265 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (2.7s)
  ok 268 [webkit] › tests\e2e\ads.spec.ts:66:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (1.9s)
  ok 267 [webkit] › tests\e2e\ads.spec.ts:54:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (4.0s)
JS inicial: 13.2 KB gzip (2 arquivos + inline)
  ok 271 [webkit] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (1.5s)
  ok 264 [webkit] › tests\e2e\a11y.spec.ts:44:5 › axe a 1280px › search dialog open (6.2s)
/compress-image/: 5 requisições (/compress-image/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
/: 3 requisições (/, /manifest-en.webmanifest, /_astro/BaseLayout.BHSD3xfz.css)
/pt/comprimir-imagem/: 5 requisições (/pt/comprimir-imagem/, /manifest-pt.webmanifest, /_astro/BaseLayout.BHSD3xfz.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 263 [webkit] › tests\e2e\a11y.spec.ts:34:5 › axe a 1280px › tool page with the result on screen (8.9s)
/privacy/: 1 novas (/privacy/)
  ok 272 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (2.3s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.Bj9eagW2.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 273 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (2.3s)
  ok 270 [webkit] › tests\e2e\ads.spec.ts:89:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (4.1s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 274 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (2.3s)
  ok 275 [webkit] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (1.5s)
  ok 276 [webkit] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (1.5s)
  ok 279 [webkit] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (1.4s)
  ok 280 [webkit] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (1.4s)
  ok 277 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (3.5s)
  ok 278 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (3.8s)
  ok 281 [webkit] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (2.8s)
  ok 283 [webkit] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (1.8s)
  ok 284 [webkit] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (1.8s)
  ok 287 [webkit] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (1.3s)
  ok 282 [webkit] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (4.0s)
  ok 286 [webkit] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (2.0s)
  ok 291 [webkit] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (117ms)
  ok 289 [webkit] › tests\e2e\events.spec.ts:89:1 › the search dialog has a visible close button (2.3s)
  ok 285 [webkit] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (4.1s)
  ok 269 [webkit] › tests\e2e\ads.spec.ts:76:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (13.1s)
  ok 295 [webkit] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (16ms)
  ok 290 [webkit] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (2.6s)
  ok 294 [webkit] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (1.6s)
  ok 292 [webkit] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (4.0s)
  ok 293 [webkit] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (3.2s)
este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)
  ok 297 [webkit] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (3.1s)
  ok 296 [webkit] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (3.3s)
  ok 288 [webkit] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (7.8s)
  ok 301 [webkit] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (2.3s)
  ok 299 [webkit] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (3.9s)
  ok 300 [webkit] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (3.0s)
  ok 298 [webkit] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (4.9s)
  ok 302 [webkit] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (4.1s)
  ok 303 [webkit] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (2.6s)
  ok 304 [webkit] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (2.8s)

  304 passed (2.4m)

▶ lighthouse ci
  $ pnpm run lhci

> fileorca@0.0.0 lhci C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lighthouse.ts

Started a web server on port 52111...
Running Lighthouse 3 time(s) on http://localhost:52111/compress-image/
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

aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "About FileOrca and the person behind it  FileOrca is m..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "FileOrca and the person behind it  FileOrca is made and run by Victor Yuki Matusita..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Orca is made and run by Victor Yuki Matusita, a developer in Curitiba, Brazil. Read ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "t an orca has to do with it.  About FileOrca  FileOrca is made and run by one person..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "has to do with it.  About FileOrca  FileOrca is made and run by one person: Victor Y..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "and run by one person: Victor Yuki Matusita, a developer in Curitiba, Paraná, Brazi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "are coming.  Why this site exists  FileOrca exists to offer free tools with no acco..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "member of the oceanic dolphin family. Oli, the orca on this site, is a dolphin to..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ictor on LinkedIn  Skip to content  FileOrca home  Search tools  Choose a language  ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "les never leave your device  Image  FileOrca  About  Privacy  Terms  Licenses  Conta..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "e which tools help, and ads to keep FileOrca free. Your files never leave your devic..."
aviso [en] SEND_AN_EMAIL (REDUNDANCY): Consider using “email”. … ", or a file that does not work? Send an email to this address.  Email  If a file does no..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ver send passwords or payment data. FileOrca will never ask for them.  Emails to thi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ail inbox and used only to answer.  FileOrca: free tools that never upload your file..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Your files never leave your device. FileOrca does the work in your browser, and you ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hat reach your browser when you use FileOrca, with their licenses. Tools used only t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the site are not listed.  Licenses  FileOrca stands on open-source software. This pa..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Search for a tool or go back to the FileOrca home page to find what you were looking..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the home page  Privacy policy  How FileOrca handles your data: files never leave yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "data on fileorca.com is Victor Yuki Matusita, an individual and developer based in C..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "based in Curitiba, Paraná, Brazil. FileOrca is made and run by one person.  For any..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "r.  Your files stay on your device  FileOrca tools run in your browser. The files yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "your device and are never uploaded. FileOrca has no server that processes them, and ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "file.  Site delivery (Cloudflare)  FileOrca is a static site delivered by Cloudflar..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "4)  To see which tools help people, FileOrca uses Google Analytics 4, a service from..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Ads (Google AdSense)  To stay free, FileOrca shows, or will show, ads from Google Ad..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Your cookie choice in the browser  FileOrca saves your cookie choice in your browse..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ith the button below.  Legal bases  FileOrca follows the GDPR (the General Data Prot..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "al clauses.  How long data is kept  FileOrca never receives your files, so it keeps ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ou can also file a complaint with the ANPD (Brazil's national data protection auth..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "thority of your country.  Children  FileOrca is not directed to children. If you thi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y one person in Curitiba. A coffee on Ko-fi pays for the next tool in the queue. It..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Who is behind this  I'm Victor Yuki Matusita, a developer in Curitiba, Brazil. I mak..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "in Curitiba, Brazil. I make and run FileOrca on my own, so there is no team behind i..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "erson.  What the next coffee pays for  Oli runs on coffee, and the next coffee pay..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "t with a coffee  Suggested amounts on Ko-fi: US$ 3, 5 or 10. The payment happens on..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "S$ 3, 5 or 10. The payment happens on Ko-fi, under its own policies.  Terms of use ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Terms of use  The terms for using FileOrca, a set of free tools that run in your b..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "These terms explain how you can use FileOrca. By using the site, you accept them. If..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the site.  Who offers the service  FileOrca (fileorca.com) is made and run by one p..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "and run by one person: Victor Yuki Matusita, a developer in Curitiba, Paraná, Brazi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "an individual, not a company.  How FileOrca handles personal data is explained on t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "xplained on the Privacy page.  What FileOrca is  FileOrca is a website with free too..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "he Privacy page.  What FileOrca is  FileOrca is a website with free tools that run i..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ponsibility  The files you use with FileOrca stay yours. FileOrca never receives the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "s you use with FileOrca stay yours. FileOrca never receives them, and it claims no r..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "re you delete or replace anything.  FileOrca cannot recover a file that is lost, del..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "files.  Results with no guarantee  FileOrca is provided "as is" and "as available",..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "lators are educational, not advice  FileOrca will also have calculators. They are fo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "health.  Acceptable use  Please use FileOrca in good faith and follow these rules.  ..."
aviso [en] ENGLISH_WORD_REPEAT_BEGINNING_RULE (REPETITIONS_STYLE): Three successive sentences begin with the same word. Consider rewording the sentence or use a thesaurus to find a synonym. … "t around the protections of the site.  Do not use FileOrca for anything illegal. ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "rotections of the site.  Do not use FileOrca for anything illegal.  Do not use FileO..."
aviso [en] ENGLISH_WORD_REPEAT_BEGINNING_RULE (REPETITIONS_STYLE): Three successive sentences begin with the same word. Consider rewording the sentence or use a thesaurus to find a synonym. … "ot use FileOrca for anything illegal.  Do not use FileOrca to process files you h..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "a for anything illegal.  Do not use FileOrca to process files you have no right to p..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … ".  Ads and donations  To stay free, FileOrca shows, or will show, ads from Google Ad..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y lead to, come from third parties. FileOrca does not control their content and is n..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "le for it.  Donations are optional. FileOrca has a link to Ko-fi, where you can leav..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "are optional. FileOrca has a link to Ko-fi, where you can leave one. The payment h..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "can leave one. The payment happens on Ko-fi, under its own policies.  A donation is..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "e site.  Intellectual property  The FileOrca name, the Oli mascot, the texts and the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ctual property  The FileOrca name, the Oli mascot, the texts and the design of the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "n of the site belong to Victor Yuki Matusita. Do not copy them or use them as if the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hey were yours without permission.  FileOrca also uses open-source libraries. They k..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "extent the law allows, Victor Yuki Matusita, who runs FileOrca, is not liable for a..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ows, Victor Yuki Matusita, who runs FileOrca, is not liable for any loss or damage t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the last update.  If you keep using FileOrca after a change, the new terms apply to ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "G, PNG or WebP, one at a time  Let go, Oli's ready  One image  Oops, Oli couldn't ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Let go, Oli's ready  One image  Oops, Oli couldn't read this file  Victor isn't a..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "read this file  Victor isn't an image Oli can read. Try a JPG or PNG.  Choose ano..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "nges JPG and WebP.  Compressing image  Oli is on it…  Done! Your image is 68% ligh..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "This image was already optimized, so Oli kept the original image, without the ph..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "is browser can't save format files, so Oli kept the original image, without the ph..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "image, without the photo metadata.  lighter  Before  After  Size  Download  Start o..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "e on the box, choose it, or paste it.  Oli redraws the image in your browser and s..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y image get uploaded anywhere?  No. FileOrca compresses the image on your device, in..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hen the new copy would not be smaller, Oli gives you back the original instead of ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Acerca de FileOrca y de quien lo hace  FileOrca es obra de..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a de FileOrca y de quien lo hace  FileOrca es obra de Victor Yuki Matusita, desarr..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "e quien lo hace  FileOrca es obra de Victor Yuki Matusita, desarrollador en Curitib..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "n lo hace  FileOrca es obra de Victor Yuki Matusita, desarrollador en Curitiba, Br..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ce  FileOrca es obra de Victor Yuki Matusita, desarrollador en Curitiba, Brasil. Des..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tor Yuki Matusita, desarrollador en Curitiba, Brasil. Descubre por qué las herramien..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tiene que ver una orca.  Acerca de FileOrca  FileOrca lo hace y lo mantiene una sol..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ver una orca.  Acerca de FileOrca  FileOrca lo hace y lo mantiene una sola persona:..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "hace y lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitib..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Pa..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Paraná, Bra..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tor Yuki Matusita, desarrollador en Curitiba, Paraná, Brasil.  Es un conjunto de her..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ientas.  Por qué existe este sitio  FileOrca existe para ofrecer herramientas gratis..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la familia de los delfines oceánicos. Oli, la orca de este sitio, también es un d..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ", también es un delfín.  Encuentra a Victor en internet  Sitio web de Victor  Victo..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a a Victor en internet  Sitio web de Victor  Victor en LinkedIn  Saltar al contenid..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "or en internet  Sitio web de Victor  Victor en LinkedIn  Saltar al contenido  FileO..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "r en LinkedIn  Saltar al contenido  FileOrca, página de inicio  Buscar herramientas ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ca salen de tu dispositivo  Imagen  FileOrca  Acerca de  Privacidad  Términos  Licen..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "mientas? Invítame un café  Hecho por Victor en Curitiba  Cookies, en pocas palabras..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "vítame un café  Hecho por Victor en Curitiba  Cookies, en pocas palabras.  Usamos Go..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "No hay ninguna herramienta llamada "mortgage"  Prueba con "comprimir", "imagen" o "f..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "nvíes contraseñas ni datos de pago. FileOrca jamás los pedirá.  Los correos enviados..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ail y se usan solo para responder.  FileOrca: herramientas gratis que nunca suben tu..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ivos nunca salen de tu dispositivo. FileOrca hace el trabajo en tu navegador, y pued..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "r el sitio no aparecen.  Licencias  FileOrca se apoya en software de código abierto...."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a o vuelve a la página de inicio de FileOrca para encontrar lo que buscabas.  Esta p..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Política de privacidad  Cómo trata FileOrca tus datos: tus archivos no salen del di..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "rca.com (controlador, en la LGPD) es Victor Yuki Matusita, persona física y desarro..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "m (controlador, en la LGPD) es Victor Yuki Matusita, persona física y desarrollado..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "rolador, en la LGPD) es Victor Yuki Matusita, persona física y desarrollador de Curi..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ", persona física y desarrollador de Curitiba, Paraná, Brasil. FileOrca está hecho y ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "llador de Curitiba, Paraná, Brasil. FileOrca está hecho y mantenido por una sola per..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tu dispositivo  Las herramientas de FileOrca funcionan en tu navegador. Los archivos..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "en tu dispositivo y nunca se suben. FileOrca no tiene ningún servidor que los proces..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o.  Entrega del sitio (Cloudflare)  FileOrca es un sitio estático que entrega Cloudf..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "herramientas ayudan a las personas, FileOrca usa Google Analytics 4, un servicio de ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "dSense)  Para seguir siendo gratis, FileOrca muestra, o mostrará, anuncios de Google..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tas.  En el Espacio Económico Europeo (EEE), el Reino Unido y Suiza, un mensaje de..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "lección de cookies en el navegador  FileOrca guarda tu elección sobre cookies en el ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "imiento depende de dónde estés y usa Consent Mode v2 de Google.  En la Unión Europea..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ende de dónde estés y usa Consent Mode v2 de Google.  En la Unión Europea, el EEE..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "v2 de Google.  En la Unión Europea, el EEE (Islandia, Liechtenstein y Noruega), el..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "el botón de abajo.  Bases legales  FileOrca sigue el Reglamento General de Protecci..."
aviso [es] ES_UNPAIRED_BRACKETS (PUNCTUATION): Símbolo desparejado: Parece que falta un ‘)’. … "Las bases legales son:  Consentimiento (RGPD, art. 6(1)(a); LGPD, art. 7, I) par..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Consentimiento (RGPD, art. 6(1)(a); LGPD, art. 7, I) para Google Analytics y par..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "nto.  Interés legítimo (RGPD, art. 6(1)(f); LGPD, art. 7, IX) para entregar y pro..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Interés legítimo (RGPD, art. 6(1)(f); LGPD, art. 7, IX) para entregar y proteger e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Cuánto tiempo se guardan los datos  FileOrca nunca recibe tus archivos, así que no g..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "én puedes presentar una queja ante la ANPD (Autoridad Nacional de Protección de Da..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ección de datos de tu país.  Niños  FileOrca no está dirigido a niños. Si crees que ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "echas por una sola persona. Un café en Ko-fi paga la siguiente herramienta de la ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "erramientas.  Quién está detrás  Soy Victor Yuki Matusita, desarrollador en Curitib..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "entas.  Quién está detrás  Soy Victor Yuki Matusita, desarrollador en Curitiba, Br..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Quién está detrás  Soy Victor Yuki Matusita, desarrollador en Curitiba, Brasil. Hag..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tor Yuki Matusita, desarrollador en Curitiba, Brasil. Hago y mantengo FileOrca yo so..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "n Curitiba, Brasil. Hago y mantengo FileOrca yo solo, así que no hay un equipo detrá..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la persona.  Qué paga el próximo café  Oli funciona a base de café, y el próximo c..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Invítame un café  Montos sugeridos en Ko-fi: US$ 3, 5 o 10. El pago se hace en K..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "me un café  Montos sugeridos en Ko-fi: US$ 3, 5 o 10. El pago se hace en Ko-fi, ba..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "-fi: US$ 3, 5 o 10. El pago se hace en Ko-fi, bajo sus propias políticas.  Términ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "inos de uso  Los términos para usar FileOrca, herramientas gratis en tu navegador: t..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "términos explican cómo puedes usar FileOrca. Al usar el sitio, los aceptas. Si no e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "l sitio.  Quién ofrece el servicio  FileOrca (fileorca.com) lo hace y lo mantiene un..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "hace y lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitib..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Pa..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Paraná, Bra..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tor Yuki Matusita, desarrollador en Curitiba, Paraná, Brasil. Es persona física, no ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "física, no una empresa.  Cómo trata FileOrca los datos personales se explica en la p..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "en la página de Privacidad.  Qué es FileOrca  FileOrca es un sitio con herramientas ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "na de Privacidad.  Qué es FileOrca  FileOrca es un sitio con herramientas gratis que..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "sabilidad  Los archivos que usas en FileOrca siguen siendo tuyos. FileOrca nunca los..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "as en FileOrca siguen siendo tuyos. FileOrca nunca los recibe y no reclama ningún de..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "antes de borrar o reemplazar algo.  FileOrca no puede recuperar un archivo perdido, ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "archivos.  Resultados sin garantía  FileOrca se ofrece "tal cual" y "según disponibi..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s son educativas, no asesoramiento  FileOrca también tendrá calculadoras. Sirven sol..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "egales o salud.  Uso aceptable  Usa FileOrca de buena fe y sigue estas reglas.  Los ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "as protecciones del sitio.  No uses FileOrca para nada ilegal.  No uses FileOrca par..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "FileOrca para nada ilegal.  No uses FileOrca para procesar archivos que no tienes de..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Para seguir siendo gratis, FileOrca muestra, o mostrará, anuncios de Google..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "los que llevan, vienen de terceros. FileOrca no controla su contenido y no se hace r..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ponsable de él.  Donar es opcional. FileOrca tiene un enlace a Ko-fi, donde puedes d..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s opcional. FileOrca tiene un enlace a Ko-fi, donde puedes dejar una donación. El..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "dejar una donación. El pago ocurre en Ko-fi, bajo sus propias políticas.  Una do..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ".  Propiedad intelectual  El nombre FileOrca, la mascota Oli, los textos y el diseño..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ectual  El nombre FileOrca, la mascota Oli, los textos y el diseño del sitio perte..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s y el diseño del sitio pertenecen a Victor Yuki Matusita. No los copies ni los use..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "diseño del sitio pertenecen a Victor Yuki Matusita. No los copies ni los uses com..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "del sitio pertenecen a Victor Yuki Matusita. No los copies ni los uses como si fuer..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "como si fueran tuyos sin permiso.  FileOrca también usa bibliotecas de código abier..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la medida en que la ley lo permita, Victor Yuki Matusita, quien mantiene FileOrca,..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "dida en que la ley lo permita, Victor Yuki Matusita, quien mantiene FileOrca, no e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "que la ley lo permita, Victor Yuki Matusita, quien mantiene FileOrca, no es respons..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ictor Yuki Matusita, quien mantiene FileOrca, no es responsable de pérdidas ni daños..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ma actualización.  Si sigues usando FileOrca después de un cambio, los nuevos términ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a se llevará ante los tribunales de Curitiba, Paraná, Brasil.  La excepción es cuand..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "gen aquí  Elegir imagen  o pégala con Ctrl V · JPG, PNG o WebP, una a la vez  JPG,..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "G, PNG o WebP, una a la vez  Suéltalo, Oli está lista  Una imagen  Uy, Oli no pudo..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ltalo, Oli está lista  Una imagen  Uy, Oli no pudo leer este archivo  Victor no es..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Uy, Oli no pudo leer este archivo  Victor no es una imagen que Oli pueda leer. Pr..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "e archivo  Victor no es una imagen que Oli pueda leer. Prueba con un JPG o PNG.  E..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a JPG y WebP.  Comprimiendo la imagen  Oli se está encargando…  ¡Listo! Tu imagen ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a imagen ya estaba optimizada, así que Oli conservó la imagen original, sin los me..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "navegador no puede guardar archivos format, así que Oli conservó la imagen origina..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "puede guardar archivos format, así que Oli conservó la imagen original, sin los me..."
aviso [es] UPPERCASE_SENTENCE_START (CASING): Esta frase no empieza con mayúscula. … "iginal, sin los metadatos de la foto.  más ligera  Antes  Después  Tamaño  Descarg..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "WebP en el cuadro, elígela o pégala.  Oli vuelve a dibujar la imagen en tu navega..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o la nueva copia no sería más pequeña, Oli te devuelve el original en lugar de un ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Sobre o FileOrca e quem faz o site  O FileOrca é feito e..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e o FileOrca e quem faz o site  O FileOrca é feito e mantido por Victor Yuki Matus..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a é feito e mantido por Victor Yuki Matusita, dev em Curitiba. Veja por que as ferra..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e mantido por Victor Yuki Matusita, dev em Curitiba. Veja por que as ferramentas s..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a orca tem a ver com isso.  Sobre o FileOrca  O FileOrca é feito e mantido por uma p..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ver com isso.  Sobre o FileOrca  O FileOrca é feito e mantido por uma pessoa só: Vi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tido por uma pessoa só: Victor Yuki Matusita, dev em Curitiba, no Paraná.  É um conj..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "uma pessoa só: Victor Yuki Matusita, dev em Curitiba, no Paraná.  É um conjunto de ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "or aí.  Por que este site existe  O FileOrca existe para oferecer ferramentas grátis..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "da família dos golfinhos oceânicos. A Oli, a orca deste site, também é golfinho. ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "or no LinkedIn  Ir para o conteúdo  FileOrca, página inicial  Buscar ferramentas  Es..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rquivo nem sai do aparelho  Imagem  FileOrca  Sobre  Privacidade  Termos  Licenças  ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Fechar  Nenhuma ferramenta chamada "mortgage"  Tente "comprimir", "imagem" ou "foto"..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ie senhas nem dados de pagamento. O FileOrca jamais pede esse tipo de informação.  O..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Gmail e usados só para responder.  FileOrca: ferramentas grátis que nunca enviam se..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "uivos nunca saem do seu aparelho. O FileOrca faz o trabalho no navegador, e você mes..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ntes que chegam ao seu navegador no FileOrca, com as licenças. Ferramentas usadas só..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tar o site não entram.  Licenças  O FileOrca usa software de código aberto. Esta pág..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a ou volte para a página inicial do FileOrca para achar o que você procurava.  Essa ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "al  Política de privacidade  Como o FileOrca trata seus dados: os arquivos ficam no ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rocessam e seus direitos na LGPD e no GDPR.  Política de privacidade  Última atual..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "soais no fileorca.com é Victor Yuki Matusita, pessoa física e desenvolvedor, de Curi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "dor, de Curitiba, Paraná, Brasil. O FileOrca é feito e mantido por uma pessoa só.  P..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "no seu aparelho  As ferramentas do FileOrca rodam no seu navegador. Os arquivos que..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "eu aparelho e nunca são enviados. O FileOrca não tem servidor que processe arquivos,..."
aviso [pt] PT_WORDINESS_REPLACE_A_MESMA_COISA (REDUNDANCY): “a mesma coisa” é uma expressão prolixa. É preferível dizer “o mesmo”. … "sa criar conta.  Com os números é a mesma coisa. Quando as calculadoras chegarem, elas ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o.  Entrega do site (Cloudflare)  O FileOrca é um site estático, entregue pela Cloud..."
aviso [pt] PT_WORDINESS_REPLACE_DE_ACORDO_COM_AS (REDUNDANCY): “de acordo com as” é uma expressão prolixa. É preferível dizer “conforme as”, “segundo as” ou “consoante as”. … "arquivos. A Cloudflare os trata de acordo com as próprias políticas.  Medição de uso (Go..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "is ferramentas ajudam as pessoas, o FileOrca usa o Google Analytics 4, um serviço do..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "AdSense)  Para continuar grátis, o FileOrca mostra, ou vai mostrar, anúncios do Goo..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "visitas.  No Espaço Econômico Europeu (EEE), no Reino Unido e na Suíça, uma mensag..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "escolha de cookies no navegador  O FileOrca guarda a sua escolha sobre cookies no a..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ookies no armazenamento local (local storage) do navegador, para o aviso não voltar ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ntimento por região e suas escolhas  consent-choice  O consentimento depende de onde..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "por região e suas escolhas  consent-choice  O consentimento depende de onde você e..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "to depende de onde você está e usa o Consent Mode v2 do Google.  Na União Europeia, ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e v2 do Google.  Na União Europeia, no EEE (Islândia, Liechtenstein e Noruega), no..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "se o botão abaixo.  Bases legais  O FileOrca segue o GDPR (o Regulamento Geral de Pr..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "xo.  Bases legais  O FileOrca segue o GDPR (o Regulamento Geral de Proteção de Dad..."
aviso [pt] NUMBER_ABREVIATION (PUNCTUATION): As abreviaturas para número são: “n.º” ou “núm.” … "Dados da União Europeia) e a LGPD (Lei nº 13.709/2018). As bases legais são:  Con..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "As bases legais são:  Consentimento (GDPR, art. 6(1)(a); LGPD, art. 7º, I) para o..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ualquer momento.  Interesse legítimo (GDPR, art. 6(1)(f); LGPD, art. 7º, IX) para ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o tempo os dados ficam guardados  O FileOrca nunca recebe seus arquivos, então não g..."
aviso [pt] PT_WORDINESS_REPLACE_DE_ACORDO_COM_AS (REDUNDANCY): “de acordo com as” é uma expressão prolixa. É preferível dizer “conforme as”, “segundo as” ou “consoante as”. … "entrega: a Cloudflare os guarda de acordo com as próprias políticas.  Dados de anúncios:..."
aviso [pt] PORTUGUESE_WORD_REPEAT_BEGINNING_RULE (STYLE): Três frases seguidas começam com a mesma palavra. Considere reformular a frase ou use um dicionário para encontrar um sinônimo. … "de acordo com as próprias políticas.  Dados de anúncios: o Google os guarda de acor..."
aviso [pt] PT_WORDINESS_REPLACE_DE_ACORDO_COM_AS (REDUNDANCY): “de acordo com as” é uma expressão prolixa. É preferível dizer “conforme as”, “segundo as” ou “consoante as”. … "de anúncios: o Google os guarda de acordo com as próprias políticas.  Escolha de cookies..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ocê.  Seus direitos  Pela LGPD e pelo GDPR, você tem o direito de acessar seus dad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "mbém pode apresentar uma reclamação à ANPD (Autoridade Nacional de Proteção de Dad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "de dados do seu país.  Crianças  O FileOrca não é voltado a crianças. Se você acha ..."
aviso [pt] VERB_COMMA_CONJUNCTION (PUNCTUATION): Esta locução deve ser separada por vírgulas. … "olítica  Esta política pode mudar, por exemplo quando novas ferramentas forem adiciona..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "uma pessoa só em Curitiba. Um café no Ko-fi paga a próxima ferramenta da fila. É..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "por uma pessoa só  Sem cadastro, sem paywall, sem limite. Os anúncios pagam os custo..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "está por trás  Eu sou o Victor Yuki Matusita, dev em Curitiba. Faço e mantenho o Fil..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "trás  Eu sou o Victor Yuki Matusita, dev em Curitiba. Faço e mantenho o FileOrca so..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "dev em Curitiba. Faço e mantenho o FileOrca sozinho, então não tem equipe por trás:..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ssoa só.  O que o próximo café paga  A Oli funciona à base de café, e o próximo ca..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Me pague um café  Valores sugeridos no Ko-fi: US$ 3, 5 ou 10. O pagamento acontec..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "S$ 3, 5 ou 10. O pagamento acontece no Ko-fi, que segue as próprias políticas.  T..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ermos de uso  Os termos para usar o FileOrca, ferramentas grátis que rodam no navega..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rmos explicam como você pode usar o FileOrca. Ao usar o site, você concorda com eles..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o site.  Quem oferece o serviço  O FileOrca (fileorca.com) é feito e mantido por um..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tido por uma pessoa só: Victor Yuki Matusita, desenvolvedor em Curitiba, Paraná, Bra..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "essoa física, não empresa.  O que o FileOrca faz com dados pessoais está explicado n..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a página de Privacidade.  O que é o FileOrca  O FileOrca é um site com ferramentas g..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Privacidade.  O que é o FileOrca  O FileOrca é um site com ferramentas grátis que ro..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "egador. Ele foi pensado para imagens, PDFs e calculadoras, em inglês, português e ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "lidade  Os arquivos que você usa no FileOrca continuam sendo seus. O FileOrca nunca ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "no FileOrca continuam sendo seus. O FileOrca nunca os recebe e não reivindica nenhum..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ar ou substituir qualquer coisa.  O FileOrca não consegue recuperar um arquivo perdi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "quivos.  Resultados sem garantia  O FileOrca é oferecido "como está" e "conforme dis..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o educativas, não aconselhamento  O FileOrca também vai ter calculadoras. Elas serve..."
aviso [pt] PT_WORDINESS_REPLACE_VIDA_REAL (REDUNDANCY): “vida real” é uma expressão prolixa. É preferível dizer “realidade”. … "s com os números que você digita. A vida real pode ser diferente, então confirme com ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "cas ou saúde.  Uso aceitável  Use o FileOrca de boa-fé e siga estas regras.  Buscado..."
aviso [pt] PORTUGUESE_WORD_REPEAT_BEGINNING_RULE (STYLE): Duas frases seguidas começam com o mesmo advérbio. Considere reformular a frase ou use um dicionário para encontrar um sinônimo. … "rar, atacar nem sobrecarregar o site.  Não tente contornar as proteções do site.  ..."
aviso [pt] PORTUGUESE_WORD_REPEAT_BEGINNING_RULE (STYLE): Duas frases seguidas começam com o mesmo advérbio. Considere reformular a frase ou use um dicionário para encontrar um sinônimo. … "tente contornar as proteções do site.  Não use o FileOrca para nada ilegal.  Não u..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ar as proteções do site.  Não use o FileOrca para nada ilegal.  Não use o FileOrca p..."
aviso [pt] PORTUGUESE_WORD_REPEAT_BEGINNING_RULE (STYLE): Duas frases seguidas começam com o mesmo advérbio. Considere reformular a frase ou use um dicionário para encontrar um sinônimo. … "Não use o FileOrca para nada ilegal.  Não use o FileOrca para processar arquivos ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "leOrca para nada ilegal.  Não use o FileOrca para processar arquivos que você não te..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e doações  Para continuar grátis, o FileOrca mostra, ou vai mostrar, anúncios do Goo..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "nde eles levam, vêm de terceiros. O FileOrca não controla o conteúdo deles e não se ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "biliza por ele.  Doar é opcional. O FileOrca tem um link para o Ko-fi, onde você pod..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "pcional. O FileOrca tem um link para o Ko-fi, onde você pode deixar uma doação. O..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "...xar uma doação. O pagamento acontece no Ko-fi, sob as políticas dele."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e.  Propriedade intelectual  O nome FileOrca, a mascote Oli, os textos e o design do..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ntelectual  O nome FileOrca, a mascote Oli, os textos e o design do site pertencem..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ign do site pertencem a Victor Yuki Matusita. Não os copie nem os use como se fossem..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "mo se fossem seus sem permissão.  O FileOrca também usa bibliotecas de código aberto..."
aviso [pt] PT_WORDINESS_REPLACE_NA_MEDIDA_EM_QUE (REDUNDANCY): “Na medida em que” é uma expressão prolixa. É preferível dizer “enquanto”. … "Limitação de responsabilidade  Na medida em que a lei permitir, Victor Yuki Matusita, q..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "em que a lei permitir, Victor Yuki Matusita, que mantém o FileOrca, não responde po..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Victor Yuki Matusita, que mantém o FileOrca, não responde por perdas ou danos decor..."
aviso [pt] ALTERNATIVE_CONJUNCTIONS_COMMA (PUNCTUATION): Conjunções alternativas ou disjuntivas devem ser separadas por vírgulas. … "responde por perdas ou danos decorrentes do uso do site ou da impossibilidade de usá-lo. Isso incl..."
aviso [pt] VERB_COMMA_CONJUNCTION (PUNCTUATION): Esta locução deve ser separada por vírgulas. … "termos  Estes termos podem mudar, por exemplo quando o site ganhar novas ferramentas...."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ização.  Se você continuar usando o FileOrca depois de uma mudança, os novos termos ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "G ou WebP, uma por vez  Pode soltar, a Oli está pronta  Uma imagem  Ops, a Oli não..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a Oli está pronta  Uma imagem  Ops, a Oli não conseguiu ler esse arquivo  Victor ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "arquivo  Victor não é uma imagem que a Oli consiga ler. Tente um JPG ou PNG.  Esco..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a JPG e WebP.  Comprimindo a imagem  A Oli está cuidando disso…  Prontinho! Sua im..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "sa imagem já estava otimizada, então a Oli manteve a imagem original, sem os metad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "vegador não consegue salvar arquivos format, então a Oli manteve a imagem original,..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "nsegue salvar arquivos format, então a Oli manteve a imagem original, sem os metad..."
aviso [pt] UPPERCASE_SENTENCE_START (CASING): Esta frase não inicia com um letra maiúscula … "original, sem os metadados da foto.  mais leve  Antes  Depois  Tamanho  Baixar  C..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "escolha o arquivo ou cole a imagem.  A Oli redesenha a imagem no seu navegador e a..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ando a nova cópia não ficaria menor, a Oli devolve o original em vez de um arquivo..."
lint:texto: 30 arquivo(s), 750 textos, 0 erro(s) de gramática, 287 aviso(s)

Resumo do pnpm verificar
  ok       9.2 s  tipos (astro check)
  ok       2.3 s  lint (eslint)
  ok       8.8 s  build (astro build do zero)
  ok       5.2 s  vitest
  ok       0.6 s  cabeçalhos gerados
  ok       0.5 s  worker sem código
  ok       0.6 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.6 s  links internos e páginas órfãs
  ok       7.8 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.6 s  actionlint
  ok     142.3 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      47.3 s  lighthouse ci
  ok      35.4 s  lint:texto (LanguageTool)
  total 261.7 s (limite 900 s)

real	4m22.494s
user	0m0.060s
sys	0m0.045s
exit 0
```

</details>

## CI na PR

Ubuntu 24.04, Node 24.22.2, pnpm 10.34.9, `pnpm verificar` completo (os 14 passos), no commit `24c6b74`:

- PR pronta (`ready_for_review`): [execução 41133624899](https://github.com/vmatusita/fileorca/actions/runs/41133624899), **verde**; o `pnpm verificar` levou **320 s** e o job `verificar` inteiro (instalação, navegadores e cache) 7 min.
- Mesmo commit ainda em rascunho: [execução 41131436368](https://github.com/vmatusita/fileorca/actions/runs/41131436368), verde, verificar em 472 s (primeira execução com o cache das ferramentas vazio, baixando o LanguageTool).

```
Resumo do pnpm verificar
  ok       5.4 s  tipos (astro check)
  ok       1.7 s  lint (eslint)
  ok       3.4 s  build (astro build do zero)
  ok       4.8 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.3 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       3.9 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     242.5 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      35.0 s  lighthouse ci
  ok      20.8 s  lint:texto (LanguageTool)
  total 319.6 s (limite 900 s)
```

**Job de merge:** rodou depois do verificar verde e recusou a PR, com o [comentário](https://github.com/vmatusita/fileorca/pull/1#issuecomment-6534321978) "Merge automático: não. A PR mexe em .github/workflows/, então o merge fica para o Victor." O `pos-deploy` foi pulado, porque não houve merge. Enquanto a PR era rascunho, o job recusou sem comentar (§ 14).

**Falha depois do relatório:** no commit `04fbe96` (só o relatório), a [execução 41134770912](https://github.com/vmatusita/fileorca/actions/runs/41134770912) reprovou um teste no WebKit: o de WCAG 2.4.11, com o foco no link "Compress image" do rodapé coberto pelo aviso de cookies. O mesmo teste tinha passado duas vezes no CI e passa no Windows. A correção (§ 36) não depende mais de o navegador respeitar o `scroll-padding`: o aviso rola a página no `focusin`. Um teste novo tira o `scroll-padding` e falhava nos dois navegadores antes da correção. Os dois testes do aviso passaram 80 vezes seguidas no local, e o `pnpm verificar` completo passou em 246,6 s (306 testes Playwright).

## Prévia do Workers Builds

**Não abriu.** O Cloudflare comentou na PR (bot `cloudflare-workers-and-pages`, "Deploying Preview to Cloudflare", modelo "Preview Deployments by commit") e criou o check "Workers Builds: fileorca", mas todo build falhou e a coluna "Deployment URL" ficou vazia. Sem URL, não houve como conferir o status 200, o `X-Robots-Tag: noindex` e o `build.txt` da prévia.

O que a run fez para isolar a causa, sem acesso ao log (que fica no painel do Cloudflare):

| Commit | Configuração | Resultado |
| --- | --- | --- |
| `af28dfa`, `bc0f703` | Node 26.13.0, pnpm 12.16.1 | falha em menos de 17 a 26 s depois do push, antes de instalar |
| `fe97a8e` | Node 24.22.2, pnpm 12.16.1 | falha depois de ~27 s de execução |
| `a120197` (sonda, revertida) | Node 24, pnpm 12, `"previews": {}` | falha em ~25 s |
| `f8673c6` (sonda, revertida em `f4b8aea`) | Node 24, pnpm 10.34.9, `"previews": {}` | falha em ~60 s, mais adiante |
| `24c6b74` em diante | Node 24, pnpm 10, `wrangler.jsonc` da ficha | falha |

Cada troca levou a falha para mais adiante, e o CI do GitHub (Ubuntu 24.04, mesmo Node e pnpm) instala, builda e passa no verificar inteiro no mesmo commit. A causa restante está no ambiente do Workers Builds ou no comando de prévia: o modelo novo "Worker Previews" roda `npx wrangler preview`, que exige um bloco `previews` que a ficha não permite no `wrangler.jsonc`. Pela regra da arquitetura fixa, a mudança ficou de fora e virou a ADR-002 (Proposta), com as duas opções. Pela regra anti-loop, a run parou de sondar depois de três tentativas. É a pendência 1 do Victor, com o passo a passo para conferir a prévia depois.

## Decisões novas

Todas no `DECISOES.md`. As que mudam o que o plano diz ou que o Victor precisa conhecer:

- **§ 17 · Node 24 e pnpm 10.** A run começou com Node 26.13.0 e pnpm 12.16.1; o Workers Builds caiu antes de instalar. Com Node 24.22.2 e pnpm 10.34.9 o build vai mais longe, mas ainda falha (ver a prévia, abaixo).
- **§ 23 · Ilha hidratada por um script.** Com `client:load`, a página da ferramenta baixava 5 arquivos de JS e estourava o orçamento de 3 requisições da segunda página. Agora são 2 arquivos.
- **§ 24 · lint:texto num LanguageTool local.** A API pública proíbe requisição automatizada ("Do not send automated requests"); o portão sobe a distribuição oficial com um JRE fixado e roda em ~20 s.
- **§ 26 · O merge usa o pode-mesclar da main**, para uma PR não mudar a regra do próprio merge.
- **§ 33 · Sem ganho, o original volta sem metadados**, inclusive sem GPS, com o formato lido dos bytes.
- **§ 34 · Anúncio só em fileorca.com** (as prévias recebem as mesmas variáveis de build) **e o trilho só a partir de 1280 px.**
- **ADR-002 (Proposta)** sobre o modelo "Worker Previews" do Workers Builds.
- As demais: § 4 a § 16 (do prompt e da plataforma), § 18 a § 22, § 25, § 27 a § 32, § 35 e § 36.

## Revisão adversarial

Três rodadas em contexto limpo, com subagentes Sonnet que não viram o código sendo escrito, em três lentes (pipeline e plataforma; privacidade, anúncio e consentimento; SEO, i18n e acessibilidade), e uma verificação independente de cada achado crítico ou alto.

**Rodada 1: 27 achados (4 altos), todos tratados.**

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| Sem ganho, o motor devolvia o original com GPS, e a página promete tirar o GPS | alto (verificado: médio) | `src/engine/image/strip.ts`, § 33, testes unitário e E2E |
| O portão de órfãs nunca falhava (contava as traduções da própria página) | alto | `scripts/lib/links-graph.ts` com teste que prova a falha |
| Teste do reprocessamento frágil no WebKit do Ubuntu (CI vermelho) | alto | `expect.poll` tolerante ao estado intermediário |
| Prévia do Workers Builds falhando | alto (verificado: médio) | não resolvido: ADR-002 e pendência 1 |
| "Já estava otimizada" quando o navegador não grava o formato | médio | texto próprio e `tool_error` com `reason: "encode"` |
| Aviso de cookies sem lugar para a âncora do AdSense | médio | `--fo-anchor`, § 35, teste E2E |
| Teste do carregador do AdSense por página era vazio (build sem variáveis) | médio | `tests/unit/ads-pages.test.ts` renderiza as páginas nos três estados |
| Unidade do trilho pedida com o trilho escondido | médio | `push` só com `min-width: 1280px`, § 34 |
| Foco ia para o Baixar ao trocar a opção pelo teclado | médio | foco só para arquivo novo, teste E2E |
| Imagens de OG cortadas | médio | `box-sizing` e largura fixa; conferido na imagem |
| Links do texto sem sublinhado (axe no escuro) | médio | sublinhado e passe de axe no tema escuro |
| Portão de SEO sem conferir schema e título | médio | tipos de schema por rota e título começando pelo nome |
| hreflang reprovava página num idioma só | médio | `alternatesFor` e validador aceitam; testes |
| Workflow renomeado para fora da pasta escapava da recusa | médio | `git diff --no-renames` |
| Pós-deploy sem credencial para buscar main mais nova | médio | `persist-credentials` padrão |
| Commit do merge sem validação; actionlint com lista fixa; pós-deploy sem teste de `checkProduction`; PNG com "Strong" sem efeito; eventos de doação sem E2E; AdSense sem guarda de host; PayPal citado sem confirmação; busca sem botão de fechar; "un" no espanhol; nomes de reserva em inglês; marca repetida no título da home; sem `apple-touch-icon`; lockfile e plano desalinhados | baixos | todos corrigidos |

**Rodada 2: 5 altos (3 confirmados altos, 2 rebaixados a médio), todos corrigidos.** O laço novo do job de merge tinha uma variável sem uso, que o shellcheck do runner reprovou (o actionlint local não tinha shellcheck: agora usa um shellcheck 0.11.0 fixado por SHA-256 nos dois sistemas); o portão de hreflang passava se as tags sumissem (agora compara cada página com o mapa); o aviso de cookies cobria o foco do teclado no rodapé (agora reserva a própria altura no fim da página, com teste de WCAG 2.4.11); o removedor de metadados confiava na extensão (agora lê os bytes).

**Rodada 3: limpa.** Nenhum achado crítico ou alto nas três lentes depois das correções da rodada 2. Os achados médios e baixos das rodadas anteriores foram todos tratados, menos a prévia (pendência 1) e os valores sugeridos do Ko-fi, que seguem o plano e ficaram como confirmação do Victor (pendência 7).

**Fora das lentes:** um dos subagentes de exploração do início rodou `wrangler deploy --dry-run` numa pasta temporária do scratchpad para conferir o esquema do `wrangler.jsonc`. Nada foi enviado ao Cloudflare (o `--dry-run` não sobe nada), mas o prompt proíbe o comando em qualquer forma. Fica registrado.

## O que a válvula cortou

Nada. A imagem de OG saiu por página e idioma (sem a Oli, que é arte da F1b), a busca saiu como combobox completo e a página de apoio entrou mínima.

## O que é do Victor, em passos

1. **Destravar a prévia (bloqueia o critério 12 e talvez a produção).** No painel do Cloudflare, abra Workers & Pages → fileorca → Deployments/Builds e o log do build mais recente da branch `fase-01a` (os IDs estão na ADR-002). Veja em que etapa ele para:
   - se for o comando de prévia (`wrangler preview` pedindo o bloco `previews`), decida a ADR-002: a opção 1 é trocar, em Settings → Build, o "Preview command" para `npx wrangler versions upload`; a opção 2 é pedir uma run curta que acrescente `"previews": {}` ao `wrangler.jsonc`;
   - se for a instalação ou o `pnpm build`, mande o trecho do log numa run curta de ajuste.
   Depois, use "Retry" no último build da branch e confira a prévia: `curl -sI <url da prévia>/` deve trazer `HTTP/2 200` e `x-robots-tag: noindex`, e `curl -s <url da prévia>/build.txt` deve trazer o commit da PR. Se a causa for a instalação, o build de produção depois do merge também falharia, então faça isto antes do merge.
2. **Dar o merge da PR** (squash), depois do CI verde. O job de merge recusou e comentou que a PR mexe em `.github/workflows/`, como manda a ficha.
3. **Conferir o pós-deploy** em Actions → "Pós-deploy" (ele roda pelo push na main, porque o merge é seu). Ele espera o `build.txt` de fileorca.com trazer o commit do merge. Confira também à mão: `curl -sI https://fileorca.com/` deve trazer `x-robots-tag: noindex`. Se o Hello World da F0 ainda estiver no ar, o deploy não chegou: o pós-deploy abre uma issue.
4. **Foto do Sobre.** Ponha a foto em `public/about/victor.jpg` (JPG quadrado, 800×800, sem localização). A página hoje sai sem foto e sem imagem quebrada; a F1b (ou uma run curta) liga a imagem e o `image` do schema Person.
5. **Campos vazios do `docs/F0-SAIDA.md`:** data em que a F0 terminou; Gmail da marca (você contou que é fileorca25@gmail.com); data de compra do domínio e data-limite da transferência; nameservers; zona Active desde; Search Console e Bing (sim/não); PayPal ligado ao Ko-fi (sim/não); redes reservadas e busca de marca (você adiou as duas); data do `keywords.csv`; fixtures (sim/não).
6. **E-mail da marca.** Você contou que usou o e-mail pessoal em vários cadastros. O plano manda o contato@fileorca.com e os logins (Cloudflare, GA4, Search Console, Ko-fi) para o Gmail da marca: confira o destino do Email Routing e, quando der, migre os logins.
7. **Confirmar textos que dependem de conta:** os valores sugeridos no Ko-fi (US$ 3, 5 e 10, como no plano) e a retenção de dados escolhida no GA4 (a política diz "pelo prazo configurado", sem número). Os artigos citados nas bases legais (GDPR art. 6(1)(a) e (f); LGPD art. 7º, I e IX) e o foro dos Termos merecem uma leitura de quem é da área.
8. **Decidir o § 24** (LanguageTool local, como está, ou a API pública com `LANGUAGETOOL_URL`) e, depois do log do item 1, o § 17 (voltar ao Node 26 e ao pnpm 12 quando o build image aceitar).
9. Manter `PUBLIC_ADS_ENABLED = false` até a aprovação do AdSense (nada muda nesta fase).

## Nota para a F2

As páginas-modelo em português e espanhol existem para provar o i18n. Com `LAUNCHED = true` (a F2 troca), elas passam a ser indexadas antes da revisão de texto da F6. A F2 decide se ficam no ar ou saem do mapa de rotas até lá (tirar uma linha do mapa tira a página, o sitemap e o hreflang juntos). Também para a F2: cada ferramenta segue o molde da Compress image (um `mount.ts`, o mesmo chunk `preact-runtime`), os chips de próximo passo trocam o "Mais ferramentas" pelas ferramentas de verdade (§ 27), e o motor de verdade entra atrás da mesma API de `src/engine/image/` (`recompress` e `strip`).

## Nota para a F1b

O contrato que os testes já medem: o seletor da Oli é `[data-oli]` com as caixas nos tamanhos do design system (§ 19); as alturas reservadas do painel e dos AdSlots (§ 20); o vão do trilho igual ao `ad-clearance`; o aviso de cookies acima da âncora e sem cobrir o foco. Trocar o estilo provisório pelo `bundle.css` precisa manter esses valores, o passe de axe nos dois temas e os orçamentos (13,2 KB de JS hoje; o limite é 80 KB).
