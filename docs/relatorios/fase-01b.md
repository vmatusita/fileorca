# F1b · Design system e Oli: relatório

Branch `fase-01b`, PR [vmatusita/fileorca#4](https://github.com/vmatusita/fileorca/pull/4). Prompt: `docs/prompts/prompt-fase-01b.txt`. Plano (gabarito da revisão): `docs/relatorios/fase-01b-plano.md`. Decisões novas: `DECISOES.md` § 39 a § 56. Run de 30 e 31/out/2026.

## Resumo

O molde da F1a ganhou a cara do design system v1.1 de `docs/design/`, nos dois temas: os tokens viraram um `@theme` do Tailwind v4 gerado do `tokens.json` (sem o tema padrão e sem varrer classes), a Fredoka e a Figtree entram só pelo subconjunto latino com preload só da Fredoka e fallback com métrica ajustada, e os componentes da F1 seguem o `bundle.css` com movimento só por `transform` e `opacity`. A Oli v1 vem de um sprite montado no build (13 peças compartilhadas, `oli-clip` uma vez por página, cada pose entre 1475 e 3103 bytes) e aparece nas caixas `[data-oli]` do painel, na home (`wave`), no 404 (`lost`), na busca sem resultado (`peek`) e na página de apoio (`coffee`). O logo inline, o favicon e o ícone do app saem de `docs/design/assets/Logo/`, os ícones são inline, a página de apoio tem o SupportCard e o ResultCard tem a linha do café (3º uso, 7 dias, só com o Aceitar). A OG ganhou o logo e a Oli. Um portão novo (`gate:design`) e 13 arquivos de teste novos ou ampliados conferem o contrato. Nenhum portão da F1a piorou e nada foi cortado pela válvula.

## Critérios de aceitação

| # | Critério | Situação | Evidência |
| --- | --- | --- | --- |
| 1 | `pnpm verificar` verde local e no CI, ≤ 15 min | ok | local 146,1 s; CI 505,0 s (job de 9 min 43 s) (seções abaixo) |
| 2 | 14 portões da F1a, mesmo alcance; sem `skip`, `fixme`, `retries`, `continue-on-error` | ok | `scripts/verificar.ts` só ganhou o `gate:design`; `playwright.config.ts` com `retries: 0`; `grep` por `skip`, `fixme` e `continue-on-error` em `tests/` e `scripts/` sem achado |
| 3 | Lighthouse ≥ 90, CLS ≤ 0,05, LCP sem a Oli | ok | desempenho 100, CLS 0, LCP 1,59 s no texto do aviso de cookies (§ 55); `lighthouserc.json` com asserção de CLS e portão que reprova LCP na Oli |
| 4 | JS ≤ 80 KB gzip; requisições ≤ 8 e ≤ 3 novas | ok | 14,9 KB; ferramenta 6 (Chromium) e 7 (WebKit); pares 1, 3 e 1 nos dois navegadores |
| 5 | Sprite: 9 símbolos, ≤ 4096 B por pose, ids únicos, `oli-clip` uma vez, sem `ic` | ok | `sprite.test.ts` (tabela abaixo) e `gate:design` em 27 páginas |
| 6 | `[data-oli]` com pose, `aria-hidden`, ≥ 32 px, ≥ 150 px dos AdSlots | ok | `gate:design`; `design.spec.ts` (caixas em 9 estados e páginas, 360 e 1280); `ads.spec.ts` (repouso, arquivo em cima, processando, erro, resultado com café, busca aberta sem resultado) |
| 7 | Contraste por par nos dois temas; `color:` só com tokens de texto; axe | ok | `contrast.test.ts` (tabela abaixo); `design-checks.test.ts` sobre `src/styles`; `a11y.spec.ts` com 27 páginas × 2 larguras × 2 temas mais resultado, café, busca e busca sem resultado nos dois temas |
| 8 | Movimento só em transform/opacity; reduzido sem animação | ok | `gate:design` (`checkMotion`); `design.spec.ts` com `getAnimations()` vazio em repouso, arquivo em cima, processando, resultado, erro, apoio e 404, e controles sem a preferência |
| 9 | Só os dois woff2 latinos, uma vez cada; preload só da Fredoka; licenças | ok | `gate:design` (`checkFonts`), `design.spec.ts` (rede), `/licenses` com as duas fontes OFL-1.1, `gate:licencas` verde |
| 10 | Hex e amarelo lendo todo o CSS; tema; sem setas | ok | `quality.test.ts`, `theme.test.ts`, `gate:design` (`checkThemeVars`, `checkArrows`) |
| 11 | Folha atualizada, sem rede, 32/64/512 e ícone 16/32 nos dois fundos | ok | `folha.test.ts`; aberta por `file://` no Chromium e no WebKit sem nenhuma requisição |
| 12 | Linha do café e página de apoio | ok | `coffee.test.ts` (regra) e `coffee.spec.ts` (1º, 2º e 3º uso, 7 dias com `page.clock`, não mostrar de novo, sem gravar sem o Aceitar, `donate_click` com `result`, apoio nos três idiomas sem requisição externa) |
| 13 | Screenshots por componente e tema | ok | `docs/relatorios/fase-01b/` (seção Screenshots) |
| 14 | Prévia da PR | ok | seção Prévia |

## O que foi feito, por área

- **Tema e base** (`src/styles/global.css`, `theme.css`, § 40 e § 41): o preflight vai para `layer(base)`, o `tokens.css` segue como está, o tema do Tailwind é `@theme reference inline` gerado do `tokens.json` (`pnpm design:gerar`), sem o amarelo, e os utilitários entram com `source(none)`. Um CSS por página (38 KB).
- **Fontes** (`src/styles/fonts.css`, § 42): `@font-face` próprio com os dois arquivos latinos, preload da Fredoka com a mesma URL com hash, fallbacks "Fredoka Fallback" e "Figtree Fallback" com `size-adjust` e overrides medidos nos arquivos, medida do texto fixa em rem (a revisão achou CLS de 0,14 com `68ch`).
- **Oli** (`src/oli/`, `OliSprite.astro`, `Oli.astro`, § 43 e § 44): sprite montado no build com peças compartilhadas e conferência da estrutura dos SVG; a Oli nas caixas do painel (`wave`, `gulp`, `swim`, `cheer`, `oops`), na home, no 404, na busca e no apoio; flutuação, salto, nado e vapor em CSS; água que sobe por `translateY` e Oli que nada dentro dela.
- **Logo, favicon e ícone do app** (`Logo.astro`, `src/seo/images.ts`, § 45): logo inline feito das peças do sprite; favicon do `app-icon.svg`; PNG de 180 (opaco), 192 e 512.
- **Ícones** (`src/icons/`, `Icon.astro`, `Icon.tsx`, § 46): 35 ícones inline com `currentColor`; na ilha, só os usados vão ao JS; busca só com ícone no celular.
- **Componentes** (`src/styles/components.css`): Button com lábio, DropZone, WaterLevel, ResultCard com a Placard, FileCard (pronto para a F2, § 53), ToolCard com a dobra, OptionGroup, OliMessage (pronto), PrivacySeal, NextStepChips, Header, Breadcrumb, ToolSearch, Faq, Footer com a onda, AdSlot neutro e CookieNotice.
- **Apoio e café** (`SupportCard.astro`, `coffee.ts`, § 48 e § 49): SupportCard com o título como H1; linha do café com a regra do plano, contagem só com o Aceitar e apagada sem ele; frase nova na política de privacidade nos três idiomas.
- **OG** (§ 50): logo escuro, título em Fredoka, a Oli `wave` e, na Compress image, o ícone da ferramenta.
- **Testes e portões** (§ 51 e § 52): `gate:design`; testes unitários de sprite, folha, tema, contraste, validadores, café, ícones e FileCard; Playwright de fontes, caixas da Oli, movimento, LCP, café e mais estados de anúncio e de axe; asserção de CLS e checagem do elemento LCP no Lighthouse; `pnpm screenshots`.

## Árvore do que nasceu ou mudou

```
docs/oli/folha.html                         folha da Oli (gerada)
docs/relatorios/fase-01b-plano.md, fase-01b.md, fase-01b/*.png
docs/prompts/prompt-fase-01b.txt
scripts/design/tema.ts, folha.ts            geradores (pnpm design:gerar)
scripts/gates/design.ts                     portão novo
scripts/gates/lighthouse.ts                 elemento LCP e CLS
scripts/lib/theme.ts, folha.ts, contrast.ts, design-checks.ts
scripts/screenshots.ts                      pnpm screenshots
scripts/verificar.ts                        + gate:design
src/styles/global.css, theme.css, fonts.css, components.css
src/oli/poses.ts, sprite.ts
src/icons/svg.ts, icons.ts, Icon.tsx
src/components/Oli.astro, OliSprite.astro, Logo.astro, Icon.astro, SupportCard.astro, FileCard.tsx
src/components/Header, Footer, Breadcrumb, Faq, ToolCard, PrivacySeal, SearchBox, SearchDialog (vestidos)
src/layouts/BaseLayout.astro                preload, sprite, favicon, apple-touch-icon, rodapé com âncora
src/tools/compress-image/ToolPanel.tsx, coffee.ts, CompressImagePage.astro, i18n/*.ts
src/views/HomeView, NotFoundView, SupportView
src/search/search.ts, src/pages/search-index.json.ts   ícone da ferramenta no índice
src/seo/images.ts, src/pages/icon-[size].png.ts, src/pages/og/[lang]/[id].png.ts
src/i18n/*/privacy.ts, src/i18n/pt/support.ts, src/i18n/types.ts
tests/unit/sprite, folha, theme, contrast, design-checks, coffee, icons, filecard (novos); quality (ampliado)
tests/e2e/design.spec.ts, coffee.spec.ts (novos); ads, a11y, lib/page.ts (ampliados)
lighthouserc.json, package.json, pnpm-lock.yaml, CLAUDE.md, DECISOES.md
```

## pnpm verificar local

Execução limpa em 31/out/2026, no commit `39689b0` (o último com código; depois dele só entra este relatório): Windows 11, Node 26.8.1 local (o CI usa o 24.22.2 do `.node-version`), pnpm 10.34.9, `CI=true pnpm install --frozen-lockfile` e `pnpm verificar`, que apaga o `dist/` e builda do zero. **Total 146,1 s** (limite 900 s): 15 portões verdes, Vitest 21 arquivos e 270 testes, Playwright 474 testes (237 por navegador) e `lint:texto` com 7 arquivos, 352 textos e 0 erro de gramática (111 avisos de ortografia em nomes próprios e termos técnicos).

```
Resumo do pnpm verificar
  ok       5.5 s  tipos (astro check)
  ok       1.5 s  lint (eslint)
  ok       6.0 s  build (astro build do zero)
  ok       3.2 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.3 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.2 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok      79.1 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      35.1 s  lighthouse ci
  ok       7.8 s  lint:texto (LanguageTool)
  total 146.1 s (limite 900 s)
exit 0
```

<details><summary>Saída completa</summary>

```text
== 2026-10-31T01:31:14-03:00 commit 39689b0, node v26.8.1, pnpm 10.34.9
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 522ms using pnpm v10.34.9

> fileorca@0.0.0 verificar C:\Users\vmatusita\projetos\fileorca
> node scripts/verificar.ts


▶ tipos (astro check)
  $ pnpm run tipos

> fileorca@0.0.0 tipos C:\Users\vmatusita\projetos\fileorca
> astro check

01:31:18 [types] Generated 44ms
01:31:18 [check] Getting diagnostics for Astro files in C:\Users\vmatusita\projetos\fileorca...
tests/unit/ads.test.ts:93:22 - warning ts(80007): 'await' has no effect on the type of this expression.

93     const response = await (GET as unknown as () => Response)();
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Result (185 files): 
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

01:31:25 [types] Generated 24ms
01:31:25 [build] output: "static"
01:31:25 [build] mode: "static"
01:31:25 [build] directory: C:\Users\vmatusita\projetos\fileorca\dist\
01:31:25 [build] Collecting build info...
01:31:25 [build] ✓ Completed in 46ms.
01:31:25 [build] Building static entrypoints...
01:31:25 [vite] ✓ built in 443ms
01:31:25 [vite] ✓ built in 74ms
01:31:25 [build] Rearranging server assets...

 generating static routes 
01:31:25   ├─ /404.html (+24ms) 
01:31:25   ├─ /about/index.html (+5ms) 
01:31:25   ├─ /compress-image/index.html (+9ms) 
01:31:25   ├─ /contact/index.html (+3ms) 
01:31:25   ├─ /es/404.html (+3ms) 
01:31:25   ├─ /es/acerca-de/index.html (+2ms) 
01:31:25   ├─ /es/apoyo/index.html (+3ms) 
01:31:25   ├─ /es/comprimir-imagen/index.html (+3ms) 
01:31:25   ├─ /es/contacto/index.html (+2ms) 
01:31:25   ├─ /es/licencias/index.html (+8ms) 
01:31:25   ├─ /es/privacidad/index.html (+4ms) 
01:31:25   ├─ /es/terminos/index.html (+2ms) 
01:31:25   ├─ /es/index.html (+3ms) 
01:31:25   ├─ /licenses/index.html (+6ms) 
01:31:25   ├─ /og/en/home.png (+139ms) 
01:31:25   ├─ /og/pt/home.png (+364ms) 
01:31:26   ├─ /og/es/home.png (+362ms) 
01:31:26   ├─ /og/en/compress-image.png (+114ms) 
01:31:26   ├─ /og/pt/compress-image.png (+101ms) 
01:31:26   ├─ /og/es/compress-image.png (+103ms) 
01:31:27   ├─ /og/en/privacy.png (+98ms) 
01:31:27   ├─ /og/pt/privacy.png (+97ms) 
01:31:27   ├─ /og/es/privacy.png (+96ms) 
01:31:27   ├─ /og/en/terms.png (+93ms) 
01:31:27   ├─ /og/pt/terms.png (+97ms) 
01:31:27   ├─ /og/es/terms.png (+98ms) 
01:31:27   ├─ /og/en/about.png (+104ms) 
01:31:27   ├─ /og/pt/about.png (+106ms) 
01:31:27   ├─ /og/es/about.png (+106ms) 
01:31:27   ├─ /og/en/contact.png (+102ms) 
01:31:28   ├─ /og/pt/contact.png (+100ms) 
01:31:28   ├─ /og/es/contact.png (+100ms) 
01:31:28   ├─ /og/en/licenses.png (+96ms) 
01:31:28   ├─ /og/pt/licenses.png (+100ms) 
01:31:28   ├─ /og/es/licenses.png (+103ms) 
01:31:28   ├─ /og/en/support.png (+99ms) 
01:31:28   ├─ /og/pt/support.png (+186ms) 
01:31:28   ├─ /og/es/support.png (+374ms) 
01:31:29   ├─ /privacy/index.html (+3ms) 
01:31:29   ├─ /pt/404.html (+3ms) 
01:31:29   ├─ /pt/apoie/index.html (+2ms) 
01:31:29   ├─ /pt/comprimir-imagem/index.html (+3ms) 
01:31:29   ├─ /pt/contato/index.html (+2ms) 
01:31:29   ├─ /pt/licencas/index.html (+7ms) 
01:31:29   ├─ /pt/privacidade/index.html (+2ms) 
01:31:29   ├─ /pt/sobre/index.html (+2ms) 
01:31:29   ├─ /pt/termos/index.html (+2ms) 
01:31:29   ├─ /pt/index.html (+2ms) 
01:31:29   ├─ /search-index.json (+2ms) 
01:31:29   ├─ /sitemap-index.xml (+1ms) 
01:31:29   ├─ /support/index.html (+2ms) 
01:31:29   ├─ /terms/index.html (+2ms) 
01:31:29   ├─ /icon-180.png (+2ms) 
01:31:29   ├─ /icon-192.png (+3ms) 
01:31:29   ├─ /icon-512.png (+7ms) 
01:31:29   ├─ /manifest-en.webmanifest (+1ms) 
01:31:29   ├─ /manifest-pt.webmanifest (+1ms) 
01:31:29   ├─ /manifest-es.webmanifest (+1ms) 
01:31:29   ├─ /sitemap-en.xml (+1ms) 
01:31:29   ├─ /sitemap-pt.xml (+1ms) 
01:31:29   ├─ /sitemap-es.xml (+1ms) 
01:31:29   ├─ /index.html (+2ms) 
01:31:29 ✓ Completed in 3.54s.

01:31:29 [build] ✓ Completed in 4.10s.
01:31:29 [fileorca:platform-files] _headers, _redirects and build.txt (39689b0) written
01:31:29 [build] 27 page(s) built in 4.16s
01:31:29 [build] Complete!

▶ vitest
  $ pnpm run test

> fileorca@0.0.0 test C:\Users\vmatusita\projetos\fileorca
> vitest run


 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca


 Test Files  21 passed (21)
      Tests  270 passed (270)
   Start at  01:31:30
   Duration  1.74s (transform 56%, import 25%, tests 18%, worker 1%)


▶ cabeçalhos gerados
  $ pnpm run gate:cabecalhos

> fileorca@0.0.0 gate:cabecalhos C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/cabecalhos.ts

cabeçalhos: ok, 6 regras, LAUNCHED = false, build.txt 39689b0

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

links: ok, 582 links internos em 27 páginas, nenhuma órfã

▶ design (sprite, fontes, tema, movimento, setas)
  $ pnpm run gate:design

> fileorca@0.0.0 gate:design C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/design.ts

design folha de estilo única: ok, 27 páginas, cada uma com um <link rel="stylesheet"> e nenhum <style>
design sprite da Oli: ok, 27 páginas, ids únicos, um oli-clip, poses da lista fechada e caixas [data-oli] com o próprio símbolo
design setas: ok, 27 páginas sem → nem ↔ no texto
design folhas ligadas: ok, 1 arquivo(s) CSS em 27 páginas
design variáveis do tema: ok, 1 CSS, todo --color-*, --radius-*, --shadow-* e --font-* é token
design movimento: ok, 1 CSS, @keyframes e transition só com transform, opacity, translate, scale e rotate
design fontes: ok, 2 .woff2 (Fredoka e Figtree latinas), preload só da Fredoka com a URL do @font-face
design: ok, 27 páginas e 1 CSS conferidos

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
licenças: ok, 7 dependências de navegador, 18 de build, 864 pacotes na árvore

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


Running 474 tests using 6 workers

  ok   4 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › / (835ms)
  ok   2 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/ (875ms)
  ok   1 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /compress-image/ (971ms)
  ok   3 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (976ms)
  ok   6 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/ (871ms)
  ok   5 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.0s)
  ok   7 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /privacy/ (829ms)
  ok   8 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/privacidade/ (866ms)
  ok   9 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/privacidad/ (865ms)
  ok  10 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /terms/ (810ms)
  ok  11 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/termos/ (809ms)
  ok  12 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/terminos/ (781ms)
  ok  13 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /about/ (672ms)
  ok  14 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/sobre/ (705ms)
  ok  16 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /contact/ (670ms)
  ok  15 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/acerca-de/ (679ms)
  ok  17 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/contato/ (694ms)
  ok  18 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/contacto/ (696ms)
  ok  19 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /licenses/ (786ms)
  ok  22 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /support/ (695ms)
  ok  20 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/licencas/ (785ms)
  ok  23 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/apoie/ (706ms)
  ok  21 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/licencias/ (790ms)
  ok  24 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/apoyo/ (703ms)
  ok  25 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /404.html (662ms)
  ok  26 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/404.html (687ms)
  ok  27 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/404.html (718ms)
  ok  29 [chromium] › tests\e2e\a11y.spec.ts:69:5 › axe a 360px, tema escuro › search dialog open (751ms)
  ok  28 [chromium] › tests\e2e\a11y.spec.ts:64:5 › axe a 360px, tema escuro › tool page with the result on screen (994ms)
  ok  30 [chromium] › tests\e2e\a11y.spec.ts:74:5 › axe a 360px, tema escuro › tool page with the coffee line on screen (1.0s)
  ok  31 [chromium] › tests\e2e\a11y.spec.ts:79:5 › axe a 360px, tema escuro › search without a result (peek visible) (692ms)
  ok  32 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › / (690ms)
  ok  33 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/ (695ms)
  ok  34 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/ (689ms)
  ok  35 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /compress-image/ (724ms)
  ok  36 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/comprimir-imagem/ (747ms)
  ok  37 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/comprimir-imagen/ (754ms)
  ok  38 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /privacy/ (799ms)
  ok  39 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/privacidade/ (801ms)
  ok  40 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/privacidad/ (817ms)
  ok  41 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /terms/ (784ms)
  ok  42 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/termos/ (764ms)
  ok  43 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/terminos/ (759ms)
  ok  44 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /about/ (667ms)
  ok  45 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/sobre/ (673ms)
  ok  46 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/acerca-de/ (678ms)
  ok  47 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /contact/ (660ms)
  ok  48 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/contato/ (658ms)
  ok  49 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/contacto/ (671ms)
  ok  50 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /licenses/ (771ms)
  ok  51 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/licencas/ (783ms)
  ok  52 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/licencias/ (781ms)
  ok  53 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /support/ (679ms)
  ok  54 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/apoie/ (679ms)
  ok  55 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/apoyo/ (706ms)
  ok  56 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /404.html (718ms)
  ok  57 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/404.html (716ms)
  ok  58 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/404.html (721ms)
  ok  60 [chromium] › tests\e2e\a11y.spec.ts:106:5 › axe a 360px › search dialog open (757ms)
  ok  62 [chromium] › tests\e2e\a11y.spec.ts:121:5 › axe a 360px › search without a result (peek visible) (694ms)
  ok  59 [chromium] › tests\e2e\a11y.spec.ts:96:5 › axe a 360px › tool page with the result on screen (1.2s)
  ok  63 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › / (720ms)
  ok  61 [chromium] › tests\e2e\a11y.spec.ts:116:5 › axe a 360px › tool page with the coffee line on screen (1.1s)
  ok  64 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/ (801ms)
  ok  65 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/ (720ms)
  ok  66 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /compress-image/ (817ms)
  ok  67 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (840ms)
  ok  68 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (792ms)
  ok  69 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /privacy/ (824ms)
  ok  70 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/privacidade/ (854ms)
  ok  71 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/privacidad/ (836ms)
  ok  72 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /terms/ (770ms)
  ok  73 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/termos/ (793ms)
  ok  74 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/terminos/ (784ms)
  ok  75 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /about/ (707ms)
  ok  76 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/sobre/ (701ms)
  ok  77 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/acerca-de/ (685ms)
  ok  78 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /contact/ (689ms)
  ok  79 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/contato/ (682ms)
  ok  80 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/contacto/ (693ms)
  ok  81 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /licenses/ (792ms)
  ok  82 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/licencas/ (781ms)
  ok  83 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/licencias/ (767ms)
  ok  84 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /support/ (676ms)
  ok  85 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/apoie/ (682ms)
  ok  86 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/apoyo/ (709ms)
  ok  87 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /404.html (677ms)
  ok  88 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/404.html (682ms)
  ok  89 [chromium] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/404.html (697ms)
  ok  91 [chromium] › tests\e2e\a11y.spec.ts:69:5 › axe a 1280px, tema escuro › search dialog open (730ms)
  ok  93 [chromium] › tests\e2e\a11y.spec.ts:79:5 › axe a 1280px, tema escuro › search without a result (peek visible) (664ms)
  ok  90 [chromium] › tests\e2e\a11y.spec.ts:64:5 › axe a 1280px, tema escuro › tool page with the result on screen (978ms)
  ok  94 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › / (697ms)
  ok  95 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/ (688ms)
  ok  92 [chromium] › tests\e2e\a11y.spec.ts:74:5 › axe a 1280px, tema escuro › tool page with the coffee line on screen (1.0s)
  ok  96 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/ (685ms)
  ok  97 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /compress-image/ (809ms)
  ok  98 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/comprimir-imagem/ (801ms)
  ok  99 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/comprimir-imagen/ (868ms)
  ok 100 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /privacy/ (846ms)
  ok 101 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/privacidade/ (834ms)
  ok 102 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/privacidad/ (886ms)
  ok 103 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /terms/ (802ms)
  ok 104 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/termos/ (818ms)
  ok 106 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /about/ (704ms)
  ok 107 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/sobre/ (750ms)
  ok 105 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/terminos/ (841ms)
  ok 108 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/acerca-de/ (686ms)
  ok 109 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /contact/ (692ms)
  ok 110 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/contato/ (679ms)
  ok 111 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/contacto/ (700ms)
  ok 112 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /licenses/ (778ms)
  ok 113 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/licencas/ (787ms)
  ok 114 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/licencias/ (771ms)
  ok 115 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /support/ (682ms)
  ok 116 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/apoie/ (685ms)
  ok 117 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/apoyo/ (695ms)
  ok 118 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /404.html (668ms)
  ok 119 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/404.html (697ms)
  ok 120 [chromium] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/404.html (722ms)
  ok 122 [chromium] › tests\e2e\a11y.spec.ts:106:5 › axe a 1280px › search dialog open (759ms)
  ok 126 [chromium] › tests\e2e\ads.spec.ts:68:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (212ms)
  ok 125 [chromium] › tests\e2e\ads.spec.ts:56:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (549ms)
  ok 124 [chromium] › tests\e2e\a11y.spec.ts:121:5 › axe a 1280px › search without a result (peek visible) (698ms)
  ok 128 [chromium] › tests\e2e\ads.spec.ts:68:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (217ms)
  ok 121 [chromium] › tests\e2e\a11y.spec.ts:96:5 › axe a 1280px › tool page with the result on screen (1.1s)
arquivo em cima: menor vão 166 px
  ok 129 [chromium] › tests\e2e\ads.spec.ts:94:5 › distância dos anúncios nos outros estados a 360×740 › with a file over the drop zone (284ms)
  ok 123 [chromium] › tests\e2e\a11y.spec.ts:116:5 › axe a 1280px › tool page with the coffee line on screen (1.1s)
  ok 127 [chromium] › tests\e2e\ads.spec.ts:56:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (562ms)
erro: menor vão 166 px
  ok 131 [chromium] › tests\e2e\ads.spec.ts:110:5 › distância dos anúncios nos outros estados a 360×740 › with the error message (328ms)
arquivo em cima: menor vão 150 px
  ok 134 [chromium] › tests\e2e\ads.spec.ts:94:5 › distância dos anúncios nos outros estados a 1280×800 › with a file over the drop zone (323ms)
busca sem resultado: menor vão 607 px
resultado com a linha do café: menor vão 230 px
  ok 133 [chromium] › tests\e2e\ads.spec.ts:124:5 › distância dos anúncios nos outros estados a 360×740 › search dialog open without a result: the Oli keeps its distance (387ms)
  ok 132 [chromium] › tests\e2e\ads.spec.ts:116:5 › distância dos anúncios nos outros estados a 360×740 › with the result and the coffee line (454ms)
erro: menor vão 150 px
  ok 136 [chromium] › tests\e2e\ads.spec.ts:110:5 › distância dos anúncios nos outros estados a 1280×800 › with the error message (371ms)
busca sem resultado: menor vão 168 px
resultado com a linha do café: menor vão 150 px
  ok 138 [chromium] › tests\e2e\ads.spec.ts:124:5 › distância dos anúncios nos outros estados a 1280×800 › search dialog open without a result: the Oli keeps its distance (407ms)
  ok 137 [chromium] › tests\e2e\ads.spec.ts:116:5 › distância dos anúncios nos outros estados a 1280×800 › with the result and the coffee line (428ms)
processando: menor vão 166 px
  ok 130 [chromium] › tests\e2e\ads.spec.ts:100:5 › distância dos anúncios nos outros estados a 360×740 › while processing (WaterLevel on screen) (1.3s)
  ok 140 [chromium] › tests\e2e\ads.spec.ts:146:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (528ms)
processando: menor vão 150 px
  ok 135 [chromium] › tests\e2e\ads.spec.ts:100:5 › distância dos anúncios nos outros estados a 1280×800 › while processing (WaterLevel on screen) (1.3s)
/compress-image/: 6 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/preact-runtime.Bkq1r2BW.js)
JS inicial: 15.0 KB gzip (2 arquivos + inline)
  ok 142 [chromium] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (688ms)
/: 4 requisições (/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
  ok 139 [chromium] › tests\e2e\ads.spec.ts:133:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (1.4s)
/pt/comprimir-imagem/: 6 requisições (/pt/comprimir-imagem/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/preact-runtime.Bkq1r2BW.js)
/privacy/: 1 novas (/privacy/)
  ok 141 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.2s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 143 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.2s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 144 [chromium] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.2s)
  ok 147 [chromium] › tests\e2e\coffee.spec.ts:143:3 › coffee line rules (English) › "Don't show this again" is stored even if the cookie choice was withdrawn meanwhile (610ms)
  ok 146 [chromium] › tests\e2e\coffee.spec.ts:121:3 › coffee line rules (English) › "Don't show this again" hides the line at once, is stored and holds after 7 days and a reload (1.6s)
  ok 148 [chromium] › tests\e2e\coffee.spec.ts:152:3 › coffee line rules (English) › Decline after the line showed erases the count and stops the line, even 8 days later (1.3s)
  ok 152 [chromium] › tests\e2e\coffee.spec.ts:209:3 › en: texts, placement, link target and donate_click with place result (704ms)
  ok 145 [chromium] › tests\e2e\coffee.spec.ts:72:3 › coffee line rules (English) › not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days (2.4s)
  ok 149 [chromium] › tests\e2e\coffee.spec.ts:173:3 › no choice: four uses never show the line and nothing is stored (1.9s)
  ok 153 [chromium] › tests\e2e\coffee.spec.ts:209:3 › pt: texts, placement, link target and donate_click with place result (936ms)
  ok 151 [chromium] › tests\e2e\coffee.spec.ts:189:1 › uses before the Accept are not counted: the count starts when the choice is granted (1.9s)
  ok 150 [chromium] › tests\e2e\coffee.spec.ts:173:3 › Decline: four uses never show the line and nothing is stored (2.0s)
  ok 158 [chromium] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (204ms)
  ok 159 [chromium] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (179ms)
  ok 155 [chromium] › tests\e2e\coffee.spec.ts:252:3 › support page /support/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (718ms)
  ok 154 [chromium] › tests\e2e\coffee.spec.ts:209:3 › es: texts, placement, link target and donate_click with place result (775ms)
  ok 162 [chromium] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (189ms)
  ok 163 [chromium] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (188ms)
  ok 160 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (415ms)
  ok 156 [chromium] › tests\e2e\coffee.spec.ts:252:3 › support page /pt/apoie/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (718ms)
  ok 157 [chromium] › tests\e2e\coffee.spec.ts:252:3 › support page /es/apoyo/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (702ms)
  ok 161 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (454ms)
  ok 167 [chromium] › tests\e2e\design.spec.ts:54:3 › fonts › every page has exactly one font preload, the same Fredoka file, with crossorigin (138ms)
  ok 164 [chromium] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (334ms)
  ok 168 [chromium] › tests\e2e\design.spec.ts:149:7 › Oli boxes a 360×740 › tool page states › idle: wave (245ms)
  ok 169 [chromium] › tests\e2e\design.spec.ts:153:7 › Oli boxes a 360×740 › tool page states › a file over the drop zone: gulp (280ms)
  ok 172 [chromium] › tests\e2e\design.spec.ts:173:7 › Oli boxes a 360×740 › tool page states › error: oops (267ms)
  ok 171 [chromium] › tests\e2e\design.spec.ts:167:7 › Oli boxes a 360×740 › tool page states › result: cheer, and only one Oli inside the card (361ms)
  ok 166 [chromium] › tests\e2e\design.spec.ts:19:3 › fonts › first visit to the tool page: only the two latin woff2, once each, and a Fredoka-only preload (689ms)
  ok 173 [chromium] › tests\e2e\design.spec.ts:178:7 › Oli boxes a 360×740 › tool page states › search without a result: the peek shows, and only then (353ms)
  ok 174 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /: wave (175ms)
  ok 175 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /pt/: wave (186ms)
  ok 176 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /es/: wave (183ms)
  ok 177 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /404.html: lost (182ms)
  ok 178 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /pt/404.html: lost (169ms)
  ok 179 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /es/404.html: lost (169ms)
  ok 180 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /support/: coffee (182ms)
  ok 181 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /pt/apoie/: coffee (194ms)
  ok 182 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /es/apoyo/: coffee (190ms)
  ok 183 [chromium] › tests\e2e\design.spec.ts:149:7 › Oli boxes a 1280×800 › tool page states › idle: wave (332ms)
  ok 170 [chromium] › tests\e2e\design.spec.ts:158:7 › Oli boxes a 360×740 › tool page states › processing: swim (1.2s)
  ok 184 [chromium] › tests\e2e\design.spec.ts:153:7 › Oli boxes a 1280×800 › tool page states › a file over the drop zone: gulp (343ms)
  ok 186 [chromium] › tests\e2e\design.spec.ts:167:7 › Oli boxes a 1280×800 › tool page states › result: cheer, and only one Oli inside the card (440ms)
  ok 189 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /: wave (188ms)
  ok 187 [chromium] › tests\e2e\design.spec.ts:173:7 › Oli boxes a 1280×800 › tool page states › error: oops (331ms)
  ok 190 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /pt/: wave (172ms)
  ok 191 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /es/: wave (179ms)
  ok 188 [chromium] › tests\e2e\design.spec.ts:178:7 › Oli boxes a 1280×800 › tool page states › search without a result: the peek shows, and only then (410ms)
  ok 192 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /404.html: lost (167ms)
  ok 193 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /pt/404.html: lost (170ms)
  ok 194 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /es/404.html: lost (163ms)
  ok 195 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /support/: coffee (168ms)
  ok 196 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /pt/apoie/: coffee (185ms)
  ok 197 [chromium] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /es/apoyo/: coffee (169ms)
  ok 165 [chromium] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.3s)
  ok 185 [chromium] › tests\e2e\design.spec.ts:158:7 › Oli boxes a 1280×800 › tool page states › processing: swim (1.2s)
  ok 198 [chromium] › tests\e2e\design.spec.ts:234:5 › prefers-reduced-motion: reduce › tool page › idle (549ms)
  ok 199 [chromium] › tests\e2e\design.spec.ts:239:5 › prefers-reduced-motion: reduce › tool page › a file over the drop zone (559ms)
  ok 201 [chromium] › tests\e2e\design.spec.ts:255:5 › prefers-reduced-motion: reduce › tool page › result (641ms)
  ok 202 [chromium] › tests\e2e\design.spec.ts:261:5 › prefers-reduced-motion: reduce › tool page › error (547ms)
  ok 206 [chromium] › tests\e2e\design.spec.ts:288:3 › motion without the preference › idle: the wave floats in a loop (176ms)
  ok 204 [chromium] › tests\e2e\design.spec.ts:276:5 › prefers-reduced-motion: reduce › /support/ (415ms)
  ok 205 [chromium] › tests\e2e\design.spec.ts:276:5 › prefers-reduced-motion: reduce › /404.html (422ms)
  ok 203 [chromium] › tests\e2e\design.spec.ts:267:5 › prefers-reduced-motion: reduce › tool page › result, start over and back to idle (638ms)
  ok 208 [chromium] › tests\e2e\design.spec.ts:307:3 › motion without the preference › support page: the coffee steam rises in a loop (146ms)
  ok 209 [chromium] › tests\e2e\design.spec.ts:326:3 › largest contentful paint › on the tool page the LCP element is not the Oli nor an svg (216ms)
  ok 213 [chromium] › tests\e2e\design.spec.ts:423:3 › review regressions › the search placeholder is ink-muted, not the faint browser default (133ms)
  ok 211 [chromium] › tests\e2e\design.spec.ts:390:3 › review regressions › the prose keeps its width when the webfont replaces the fallback (no CLS from 68ch) (325ms)
  ok 212 [chromium] › tests\e2e\design.spec.ts:409:3 › review regressions › the segmented option keeps a focus ring after an arrow key (264ms)
  ok 200 [chromium] › tests\e2e\design.spec.ts:245:5 › prefers-reduced-motion: reduce › tool page › processing (1.5s)
  ok 215 [chromium] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (195ms)
  ok 214 [chromium] › tests\e2e\design.spec.ts:440:5 › review regressions › with reduced motion › a pressed button still sinks into its lip (240ms)
  ok 216 [chromium] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (252ms)
  ok 218 [chromium] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (244ms)
  ok 219 [chromium] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (245ms)
  ok 207 [chromium] › tests\e2e\design.spec.ts:295:3 › motion without the preference › processing: the swim loops (1.2s)
  ok 217 [chromium] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (661ms)
  ok 224 [chromium] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (41ms)
  ok 222 [chromium] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (468ms)
  ok 221 [chromium] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (503ms)
  ok 210 [chromium] › tests\e2e\design.spec.ts:372:3 › review regressions › reflow at 320px: no page and no tool state scrolls sideways (1.3s)
  ok 223 [chromium] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (368ms)
  ok 227 [chromium] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (21ms)
  ok 228 [chromium] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (287ms)
  ok 225 [chromium] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (543ms)
  ok 230 [chromium] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (552ms)
  ok 229 [chromium] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (656ms)
  ok 220 [chromium] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (1.5s)
  ok 226 [chromium] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (870ms)
  ok 234 [chromium] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (344ms)
  ok 233 [chromium] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (444ms)
  ok 231 [chromium] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (932ms)
  ok 232 [chromium] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (773ms)
  ok 235 [chromium] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (700ms)
  ok 236 [chromium] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (649ms)
  ok 237 [chromium] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (727ms)
  ok 238 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › / (1.1s)
  ok 240 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/ (1.1s)
  ok 239 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/ (1.1s)
  ok 241 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /compress-image/ (1.3s)
  ok 242 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/comprimir-imagem/ (1.3s)
  ok 243 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/comprimir-imagen/ (1.2s)
  ok 244 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /privacy/ (1.2s)
  ok 246 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/privacidad/ (1.2s)
  ok 245 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/privacidade/ (1.3s)
  ok 247 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /terms/ (1.1s)
  ok 248 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/termos/ (1.1s)
  ok 249 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/terminos/ (1.1s)
  ok 250 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /about/ (995ms)
  ok 252 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/acerca-de/ (1.0s)
  ok 251 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/sobre/ (1.1s)
  ok 253 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /contact/ (1.0s)
  ok 254 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/contato/ (995ms)
  ok 255 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/contacto/ (1.0s)
  ok 256 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /licenses/ (1.1s)
  ok 257 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/licencas/ (1.1s)
  ok 258 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/licencias/ (1.2s)
  ok 259 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /support/ (1.0s)
  ok 260 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/apoie/ (1.1s)
  ok 261 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/apoyo/ (1.1s)
  ok 262 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /404.html (1.0s)
  ok 263 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /pt/404.html (1.0s)
  ok 264 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 360px, tema escuro › /es/404.html (1.0s)
  ok 266 [webkit] › tests\e2e\a11y.spec.ts:69:5 › axe a 360px, tema escuro › search dialog open (1.2s)
  ok 265 [webkit] › tests\e2e\a11y.spec.ts:64:5 › axe a 360px, tema escuro › tool page with the result on screen (1.7s)
  ok 268 [webkit] › tests\e2e\a11y.spec.ts:79:5 › axe a 360px, tema escuro › search without a result (peek visible) (1.2s)
  ok 269 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › / (1.0s)
  ok 267 [webkit] › tests\e2e\a11y.spec.ts:74:5 › axe a 360px, tema escuro › tool page with the coffee line on screen (1.6s)
  ok 270 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/ (1.1s)
  ok 271 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/ (985ms)
  ok 272 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /compress-image/ (1.1s)
  ok 273 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/comprimir-imagem/ (1.2s)
  ok 275 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /privacy/ (1.2s)
  ok 274 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/comprimir-imagen/ (1.2s)
  ok 276 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/privacidade/ (1.2s)
  ok 277 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/privacidad/ (1.2s)
  ok 278 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /terms/ (1.1s)
  ok 281 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /about/ (1.0s)
  ok 279 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/termos/ (1.1s)
  ok 280 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/terminos/ (1.1s)
  ok 282 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/sobre/ (1.0s)
  ok 283 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/acerca-de/ (994ms)
  ok 284 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /contact/ (976ms)
  ok 285 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/contato/ (1.0s)
  ok 286 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/contacto/ (1.0s)
  ok 287 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /licenses/ (1.2s)
  ok 288 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/licencas/ (1.1s)
  ok 289 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/licencias/ (1.2s)
  ok 290 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /support/ (1.0s)
  ok 292 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/apoyo/ (1.1s)
  ok 291 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/apoie/ (1.2s)
  ok 293 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /404.html (1.0s)
  ok 294 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /pt/404.html (1.0s)
  ok 295 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 360px › /es/404.html (1.1s)
  ok 299 [webkit] › tests\e2e\a11y.spec.ts:121:5 › axe a 360px › search without a result (peek visible) (1.1s)
  ok 297 [webkit] › tests\e2e\a11y.spec.ts:106:5 › axe a 360px › search dialog open (1.2s)
  ok 300 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › / (1.2s)
  ok 296 [webkit] › tests\e2e\a11y.spec.ts:96:5 › axe a 360px › tool page with the result on screen (1.8s)
  ok 301 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/ (1.2s)
  ok 298 [webkit] › tests\e2e\a11y.spec.ts:116:5 › axe a 360px › tool page with the coffee line on screen (1.6s)
  ok 303 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/ (1.3s)
  ok 302 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /compress-image/ (1.6s)
  ok 304 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/comprimir-imagem/ (1.5s)
  ok 305 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/comprimir-imagen/ (1.5s)
  ok 307 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/privacidade/ (1.3s)
  ok 306 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /privacy/ (1.4s)
  ok 308 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/privacidad/ (1.3s)
  ok 309 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /terms/ (1.3s)
  ok 313 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/sobre/ (1.3s)
  ok 310 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/termos/ (1.4s)
  ok 312 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /about/ (1.3s)
  ok 311 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/terminos/ (1.4s)
  ok 314 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/acerca-de/ (1.3s)
  ok 315 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /contact/ (1.2s)
  ok 317 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/contacto/ (1.3s)
  ok 316 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/contato/ (1.3s)
  ok 318 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /licenses/ (1.4s)
  ok 319 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/licencas/ (1.3s)
  ok 320 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/licencias/ (1.3s)
  ok 321 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /support/ (1.2s)
  ok 322 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/apoie/ (1.2s)
  ok 324 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /404.html (1.2s)
  ok 325 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /pt/404.html (1.2s)
  ok 323 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/apoyo/ (1.3s)
  ok 326 [webkit] › tests\e2e\a11y.spec.ts:57:7 › axe a 1280px, tema escuro › /es/404.html (1.2s)
  ok 331 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › / (1.2s)
  ok 330 [webkit] › tests\e2e\a11y.spec.ts:79:5 › axe a 1280px, tema escuro › search without a result (peek visible) (1.3s)
  ok 328 [webkit] › tests\e2e\a11y.spec.ts:69:5 › axe a 1280px, tema escuro › search dialog open (1.5s)
  ok 327 [webkit] › tests\e2e\a11y.spec.ts:64:5 › axe a 1280px, tema escuro › tool page with the result on screen (2.0s)
  ok 332 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/ (1.4s)
  ok 329 [webkit] › tests\e2e\a11y.spec.ts:74:5 › axe a 1280px, tema escuro › tool page with the coffee line on screen (2.0s)
  ok 333 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/ (1.3s)
  ok 334 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /compress-image/ (1.3s)
  ok 335 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/comprimir-imagem/ (1.3s)
  ok 336 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/comprimir-imagen/ (1.4s)
  ok 338 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/privacidade/ (1.3s)
  ok 337 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /privacy/ (1.4s)
  ok 339 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/privacidad/ (1.3s)
  ok 340 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /terms/ (1.2s)
  ok 341 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/termos/ (1.3s)
  ok 342 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/terminos/ (1.3s)
  ok 344 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/sobre/ (1.3s)
  ok 343 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /about/ (1.3s)
  ok 346 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /contact/ (1.2s)
  ok 345 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/acerca-de/ (1.3s)
  ok 347 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/contato/ (1.2s)
  ok 348 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/contacto/ (1.3s)
  ok 349 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /licenses/ (1.3s)
  ok 350 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/licencas/ (1.4s)
  ok 352 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /support/ (1.3s)
  ok 353 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/apoie/ (1.2s)
  ok 351 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/licencias/ (1.3s)
  ok 354 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/apoyo/ (1.2s)
  ok 355 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /404.html (1.2s)
  ok 356 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /pt/404.html (1.2s)
  ok 357 [webkit] › tests\e2e\a11y.spec.ts:89:7 › axe a 1280px › /es/404.html (1.3s)
  ok 359 [webkit] › tests\e2e\a11y.spec.ts:106:5 › axe a 1280px › search dialog open (1.6s)
  ok 363 [webkit] › tests\e2e\ads.spec.ts:68:5 › distância dos anúncios a 360×740 › no AdSlot above the tool panel (400ms)
  ok 362 [webkit] › tests\e2e\ads.spec.ts:56:5 › distância dos anúncios a 360×740 › before the file and with the result and Download on screen (1.1s)
  ok 361 [webkit] › tests\e2e\a11y.spec.ts:121:5 › axe a 1280px › search without a result (peek visible) (1.4s)
  ok 358 [webkit] › tests\e2e\a11y.spec.ts:96:5 › axe a 1280px › tool page with the result on screen (2.1s)
  ok 365 [webkit] › tests\e2e\ads.spec.ts:68:5 › distância dos anúncios a 1280×800 › no AdSlot above the tool panel (556ms)
  ok 360 [webkit] › tests\e2e\a11y.spec.ts:116:5 › axe a 1280px › tool page with the coffee line on screen (2.1s)
arquivo em cima: menor vão 166 px
  ok 366 [webkit] › tests\e2e\ads.spec.ts:94:5 › distância dos anúncios nos outros estados a 360×740 › with a file over the drop zone (688ms)
erro: menor vão 166 px
  ok 368 [webkit] › tests\e2e\ads.spec.ts:110:5 › distância dos anúncios nos outros estados a 360×740 › with the error message (708ms)
resultado com a linha do café: menor vão 230 px
  ok 369 [webkit] › tests\e2e\ads.spec.ts:116:5 › distância dos anúncios nos outros estados a 360×740 › with the result and the coffee line (888ms)
  ok 364 [webkit] › tests\e2e\ads.spec.ts:56:5 › distância dos anúncios a 1280×800 › before the file and with the result and Download on screen (1.5s)
busca sem resultado: menor vão 607 px
  ok 370 [webkit] › tests\e2e\ads.spec.ts:124:5 › distância dos anúncios nos outros estados a 360×740 › search dialog open without a result: the Oli keeps its distance (928ms)
arquivo em cima: menor vão 150 px
  ok 371 [webkit] › tests\e2e\ads.spec.ts:94:5 › distância dos anúncios nos outros estados a 1280×800 › with a file over the drop zone (1.0s)
processando: menor vão 166 px
  ok 367 [webkit] › tests\e2e\ads.spec.ts:100:5 › distância dos anúncios nos outros estados a 360×740 › while processing (WaterLevel on screen) (1.9s)
erro: menor vão 150 px
  ok 373 [webkit] › tests\e2e\ads.spec.ts:110:5 › distância dos anúncios nos outros estados a 1280×800 › with the error message (968ms)
processando: menor vão 150 px
resultado com a linha do café: menor vão 150 px
  ok 374 [webkit] › tests\e2e\ads.spec.ts:116:5 › distância dos anúncios nos outros estados a 1280×800 › with the result and the coffee line (1.4s)
  ok 372 [webkit] › tests\e2e\ads.spec.ts:100:5 › distância dos anúncios nos outros estados a 1280×800 › while processing (WaterLevel on screen) (1.8s)
busca sem resultado: menor vão 168 px
  ok 375 [webkit] › tests\e2e\ads.spec.ts:124:5 › distância dos anúncios nos outros estados a 1280×800 › search dialog open without a result: the Oli keeps its distance (1.4s)
JS inicial: 15.0 KB gzip (2 arquivos + inline)
  ok 378 [webkit] › tests\e2e\budgets.spec.ts:20:1 › initial JS of the tool page fits 80 KB gzip (857ms)
/compress-image/: 7 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/preact-runtime.Bkq1r2BW.js)
/: 5 requisições (/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
  ok 377 [webkit] › tests\e2e\ads.spec.ts:146:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (1.5s)
/pt/comprimir-imagem/: 7 requisições (/pt/comprimir-imagem/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-pt.webmanifest, /_astro/BaseLayout.-R8D9Eqg.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/preact-runtime.Bkq1r2BW.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/privacy/: 1 novas (/privacy/)
  ok 379 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /compress-image/ then /privacy/ (1.4s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DnL_Va-R.js, /_astro/preact-runtime.Bkq1r2BW.js)
  ok 380 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: / then /compress-image/ (1.4s)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 381 [webkit] › tests\e2e\budgets.spec.ts:43:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.4s)
  ok 376 [webkit] › tests\e2e\ads.spec.ts:133:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (3.5s)
  ok 384 [webkit] › tests\e2e\coffee.spec.ts:143:3 › coffee line rules (English) › "Don't show this again" is stored even if the cookie choice was withdrawn meanwhile (2.2s)
  ok 383 [webkit] › tests\e2e\coffee.spec.ts:121:3 › coffee line rules (English) › "Don't show this again" hides the line at once, is stored and holds after 7 days and a reload (3.7s)
  ok 385 [webkit] › tests\e2e\coffee.spec.ts:152:3 › coffee line rules (English) › Decline after the line showed erases the count and stops the line, even 8 days later (3.3s)
  ok 386 [webkit] › tests\e2e\coffee.spec.ts:173:3 › no choice: four uses never show the line and nothing is stored (3.4s)
  ok 382 [webkit] › tests\e2e\coffee.spec.ts:72:3 › coffee line rules (English) › not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days (4.9s)
  ok 387 [webkit] › tests\e2e\coffee.spec.ts:173:3 › Decline: four uses never show the line and nothing is stored (3.7s)
  ok 392 [webkit] › tests\e2e\coffee.spec.ts:252:3 › support page /support/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (893ms)
  ok 389 [webkit] › tests\e2e\coffee.spec.ts:209:3 › en: texts, placement, link target and donate_click with place result (2.2s)
  ok 394 [webkit] › tests\e2e\coffee.spec.ts:252:3 › support page /es/apoyo/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (913ms)
  ok 393 [webkit] › tests\e2e\coffee.spec.ts:252:3 › support page /pt/apoie/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (990ms)
  ok 395 [webkit] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (385ms)
  ok 388 [webkit] › tests\e2e\coffee.spec.ts:189:1 › uses before the Accept are not counted: the count starts when the choice is granted (3.8s)
  ok 391 [webkit] › tests\e2e\coffee.spec.ts:209:3 › es: texts, placement, link target and donate_click with place result (2.6s)
  ok 396 [webkit] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (461ms)
  ok 390 [webkit] › tests\e2e\coffee.spec.ts:209:3 › pt: texts, placement, link target and donate_click with place result (3.0s)
  ok 399 [webkit] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (478ms)
  ok 401 [webkit] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (420ms)
  ok 404 [webkit] › tests\e2e\design.spec.ts:54:3 › fonts › every page has exactly one font preload, the same Fredoka file, with crossorigin (124ms)
  ok 397 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (1.4s)
  ok 398 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (1.4s)
  ok 400 [webkit] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (1.1s)
  ok 405 [webkit] › tests\e2e\design.spec.ts:149:7 › Oli boxes a 360×740 › tool page states › idle: wave (662ms)
  ok 403 [webkit] › tests\e2e\design.spec.ts:19:3 › fonts › first visit to the tool page: only the two latin woff2, once each, and a Fredoka-only preload (927ms)
  ok 406 [webkit] › tests\e2e\design.spec.ts:153:7 › Oli boxes a 360×740 › tool page states › a file over the drop zone: gulp (717ms)
  ok 409 [webkit] › tests\e2e\design.spec.ts:173:7 › Oli boxes a 360×740 › tool page states › error: oops (727ms)
  ok 411 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /: wave (337ms)
  ok 408 [webkit] › tests\e2e\design.spec.ts:167:7 › Oli boxes a 360×740 › tool page states › result: cheer, and only one Oli inside the card (1.0s)
  ok 412 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /pt/: wave (371ms)
  ok 410 [webkit] › tests\e2e\design.spec.ts:178:7 › Oli boxes a 360×740 › tool page states › search without a result: the peek shows, and only then (1.1s)
  ok 413 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › home /es/: wave (376ms)
  ok 407 [webkit] › tests\e2e\design.spec.ts:158:7 › Oli boxes a 360×740 › tool page states › processing: swim (1.4s)
  ok 414 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /404.html: lost (361ms)
  ok 415 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /pt/404.html: lost (377ms)
  ok 416 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › 404 /es/404.html: lost (344ms)
  ok 417 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /support/: coffee (354ms)
  ok 418 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /pt/apoie/: coffee (359ms)
  ok 419 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 360×740 › other pages › support /es/apoyo/: coffee (357ms)
  ok 402 [webkit] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.7s)
  ok 420 [webkit] › tests\e2e\design.spec.ts:149:7 › Oli boxes a 1280×800 › tool page states › idle: wave (1.1s)
  ok 424 [webkit] › tests\e2e\design.spec.ts:173:7 › Oli boxes a 1280×800 › tool page states › error: oops (1.0s)
  ok 421 [webkit] › tests\e2e\design.spec.ts:153:7 › Oli boxes a 1280×800 › tool page states › a file over the drop zone: gulp (1.1s)
  ok 423 [webkit] › tests\e2e\design.spec.ts:167:7 › Oli boxes a 1280×800 › tool page states › result: cheer, and only one Oli inside the card (1.3s)
  ok 426 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /: wave (465ms)
  ok 427 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /pt/: wave (453ms)
  ok 428 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › home /es/: wave (491ms)
  ok 422 [webkit] › tests\e2e\design.spec.ts:158:7 › Oli boxes a 1280×800 › tool page states › processing: swim (1.8s)
  ok 429 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /404.html: lost (510ms)
  ok 430 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /pt/404.html: lost (425ms)
  ok 425 [webkit] › tests\e2e\design.spec.ts:178:7 › Oli boxes a 1280×800 › tool page states › search without a result: the peek shows, and only then (1.9s)
  ok 431 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › 404 /es/404.html: lost (487ms)
  ok 432 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /support/: coffee (460ms)
  ok 433 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /pt/apoie/: coffee (452ms)
  ok 434 [webkit] › tests\e2e\design.spec.ts:197:11 › Oli boxes a 1280×800 › other pages › support /es/apoyo/: coffee (458ms)
  ok 435 [webkit] › tests\e2e\design.spec.ts:234:5 › prefers-reduced-motion: reduce › tool page › idle (979ms)
  ok 436 [webkit] › tests\e2e\design.spec.ts:239:5 › prefers-reduced-motion: reduce › tool page › a file over the drop zone (1.0s)
  ok 439 [webkit] › tests\e2e\design.spec.ts:261:5 › prefers-reduced-motion: reduce › tool page › error (880ms)
  ok 438 [webkit] › tests\e2e\design.spec.ts:255:5 › prefers-reduced-motion: reduce › tool page › result (1.1s)
  ok 441 [webkit] › tests\e2e\design.spec.ts:276:5 › prefers-reduced-motion: reduce › /support/ (535ms)
  ok 440 [webkit] › tests\e2e\design.spec.ts:267:5 › prefers-reduced-motion: reduce › tool page › result, start over and back to idle (1.2s)
  ok 442 [webkit] › tests\e2e\design.spec.ts:276:5 › prefers-reduced-motion: reduce › /404.html (555ms)
  ok 445 [webkit] › tests\e2e\design.spec.ts:307:3 › motion without the preference › support page: the coffee steam rises in a loop (313ms)
  ok 443 [webkit] › tests\e2e\design.spec.ts:288:3 › motion without the preference › idle: the wave floats in a loop (718ms)
  ok 446 [webkit] › tests\e2e\design.spec.ts:326:3 › largest contentful paint › on the tool page the LCP element is not the Oli nor an svg (408ms)
  ok 437 [webkit] › tests\e2e\design.spec.ts:245:5 › prefers-reduced-motion: reduce › tool page › processing (2.1s)
  ok 450 [webkit] › tests\e2e\design.spec.ts:423:3 › review regressions › the search placeholder is ink-muted, not the faint browser default (342ms)
  ok 448 [webkit] › tests\e2e\design.spec.ts:390:3 › review regressions › the prose keeps its width when the webfont replaces the fallback (no CLS from 68ch) (746ms)
  ok 451 [webkit] › tests\e2e\design.spec.ts:440:5 › review regressions › with reduced motion › a pressed button still sinks into its lip (622ms)
  ok 444 [webkit] › tests\e2e\design.spec.ts:295:3 › motion without the preference › processing: the swim loops (1.6s)
  ok 452 [webkit] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (640ms)
  ok 449 [webkit] › tests\e2e\design.spec.ts:409:3 › review regressions › the segmented option keeps a focus ring after an arrow key (1.1s)
  ok 453 [webkit] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (747ms)
  ok 455 [webkit] › tests\e2e\events.spec.ts:39:1 › the cookie notice has Decline first, two neutral buttons and no yellow (516ms)
  ok 456 [webkit] › tests\e2e\events.spec.ts:49:1 › the cookie notice rises above the AdSense anchor instead of covering it (493ms)
  ok 458 [webkit] › tests\e2e\events.spec.ts:92:1 › an element focused under the cookie notice moves above it, even without scroll-padding (572ms)
  ok 461 [webkit] › tests\e2e\navigation.spec.ts:16:1 › pages are served with the generated headers (noindex while LAUNCHED = false) (18ms)
  ok 460 [webkit] › tests\e2e\navigation.spec.ts:3:1 › a missing page gets the nearest 404 of its language, with status 404 (753ms)
  ok 447 [webkit] › tests\e2e\design.spec.ts:372:3 › review regressions › reflow at 320px: no page and no tool state scrolls sideways (2.9s)
  ok 454 [webkit] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (1.7s)
  ok 465 [webkit] › tests\e2e\navigation.spec.ts:71:1 › trailing slash: a path without it redirects (18ms)
  ok 459 [webkit] › tests\e2e\events.spec.ts:116:1 › the search dialog has a visible close button (1.2s)
  ok 464 [webkit] › tests\e2e\navigation.spec.ts:63:1 › the 404 page has a working tool search (709ms)
  ok 463 [webkit] › tests\e2e\navigation.spec.ts:39:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (1.4s)
este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)
  ok 466 [webkit] › tests\e2e\tool.spec.ts:15:3 › Compress image (motor provisório) › the fixture really has GPS, and the compressed copy has no metadata at all (1.5s)
  ok 467 [webkit] › tests\e2e\tool.spec.ts:39:3 › Compress image (motor provisório) › the work runs in the Web Worker where the browser supports OffscreenCanvas (1.3s)
  ok 462 [webkit] › tests\e2e\navigation.spec.ts:29:1 › the language button goes to the equivalent page (2.1s)
  ok 457 [webkit] › tests\e2e\events.spec.ts:69:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (3.1s)
  ok 471 [webkit] › tests\e2e\tool.spec.ts:113:3 › Compress image (motor provisório) › an unsupported type is refused with the same message (955ms)
  ok 468 [webkit] › tests\e2e\tool.spec.ts:49:3 › Compress image (motor provisório) › changing the option re-processes at once, without an Apply button, and keeps the focus (1.8s)
  ok 469 [webkit] › tests\e2e\tool.spec.ts:71:3 › Compress image (motor provisório) › without gain, the original goes back without metadata and the text says so (1.4s)
  ok 470 [webkit] › tests\e2e\tool.spec.ts:103:3 › Compress image (motor provisório) › a file the browser cannot decode shows the Oli error in text, with role alert (1.1s)
  ok 473 [webkit] › tests\e2e\tool.spec.ts:144:3 › Compress image (motor provisório) › the result offers the next step and Start over returns to the drop zone (1.4s)
  ok 472 [webkit] › tests\e2e\tool.spec.ts:118:3 › Compress image (motor provisório) › events carry only the listed parameters and never the file name (1.7s)
  ok 474 [webkit] › tests\e2e\tool.spec.ts:154:1 › the tool works in Portuguese and Spanish too (1.4s)

  474 passed (1.3m)

▶ lighthouse ci
  $ pnpm run lhci

> fileorca@0.0.0 lhci C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lighthouse.ts

Started a web server on port 60290...
Running Lighthouse 3 time(s) on http://localhost:60290/compress-image/
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!
Dumping 3 reports to disk at C:\Users\vmatusita\projetos\fileorca\.lighthouseci\reports...
Done writing reports to disk.
Checking assertions against 1 URL(s), 3 total run(s)

All results processed!
lighthouse (celular): /compress-image/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): LCP 1.59 s em body > div#fo-cookie > p#fo-cookie-text (Cookies, quickly. We use Google Analytics to see which tools help, and ads to k…); CLS 0.000

▶ lint:texto (LanguageTool)
  $ pnpm run lint:texto

> fileorca@0.0.0 lint:texto C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lint-texto.ts

aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Privacy policy  How FileOrca handles your data: files never leave yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "data on fileorca.com is Victor Yuki Matusita, an individual and developer based in C..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "based in Curitiba, Paraná, Brazil. FileOrca is made and run by one person.  For any..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "r.  Your files stay on your device  FileOrca tools run in your browser. The files yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "your device and are never uploaded. FileOrca has no server that processes them, and ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "file.  Site delivery (Cloudflare)  FileOrca is a static site delivered by Cloudflar..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "4)  To see which tools help people, FileOrca uses Google Analytics 4, a service from..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Ads (Google AdSense)  To stay free, FileOrca shows, or will show, ads from Google Ad..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Your cookie choice in the browser  FileOrca saves your cookie choice in your browse..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "If you accept in the cookie notice, FileOrca also counts there how many files came o..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ith the button below.  Legal bases  FileOrca follows the GDPR (the General Data Prot..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "al clauses.  How long data is kept  FileOrca never receives your files, so it keeps ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ou can also file a complaint with the ANPD (Brazil's national data protection auth..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "thority of your country.  Children  FileOrca is not directed to children. If you thi..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ítica de privacidad  Cómo trata FileOrca tus datos: tus archivos no salen del di..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Si aceptas en el aviso de cookies, FileOrca también cuenta allí cuántos archivos qu..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "olítica de privacidade  Como o FileOrca trata seus dados: os arquivos ficam no ..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "você aceitar no aviso de cookies, o FileOrca também conta ali quantos arquivos ficar..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "oiar com um café  Valores sugeridos no Ko-fi: US$ 3, 5 ou 10. O pagamento acontec..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "S$ 3, 5 ou 10. O pagamento acontece no Ko-fi, que segue as próprias políticas.  C..."
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
lint:texto: 7 arquivo(s), 352 textos, 0 erro(s) de gramática, 111 aviso(s)

Resumo do pnpm verificar
  ok       5.5 s  tipos (astro check)
  ok       1.5 s  lint (eslint)
  ok       6.0 s  build (astro build do zero)
  ok       3.2 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.3 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.2 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok      79.1 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      35.1 s  lighthouse ci
  ok       7.8 s  lint:texto (LanguageTool)
  total 146.1 s (limite 900 s)
exit 0
```

</details>

## CI na PR

Execução verde no código final (`39689b0`): [run 41169095121](https://github.com/vmatusita/fileorca/actions/runs/41169095121), Ubuntu 24.04, Node 24.22.2. Job `verificar` em 9 min 43 s; o `pnpm verificar` dentro dele em **505,0 s** (limite 900 s): tipos 6,5; lint 2,2; build 3,1; vitest 6,7; cabeçalhos 0,3; worker 0,3; seo 0,5; links 0,4; design 0,5; licenças 3,9; dinheiro e saúde 0,4; actionlint 0,4; playwright 424,4 (474 testes em 7,1 min); lighthouse 35,8; lint:texto 19,7. O job `merge` rodou e recusou o rascunho, como manda o § 14.

Execuções anteriores da PR: [41164211103](https://github.com/vmatusita/fileorca/actions/runs/41164211103) (primeiro push, sem os testes novos de Playwright, 597 s) e [41166856193](https://github.com/vmatusita/fileorca/actions/runs/41166856193) (com os 464 testes, 758 s, o que levou ao § 57). Todas verdes.

## Desempenho

- **Lighthouse no celular** (`/compress-image/`, mediana de 3): desempenho 100, acessibilidade 100, boas práticas 100, SEO 100; LCP 1,59 s, no parágrafo do aviso de cookies (`body > div#fo-cookie > p#fo-cookie-text`, como na F1a; § 55); CLS 0. A F1a dava LCP 1,2 s; o aumento vem das duas fontes.
- **JS inicial** da página da ferramenta: 14,9 KB gzip (2 arquivos e os scripts inline; a F1a dava 13,2 KB). Limite 80 KB.
- **Requisições** (próprio domínio, primeira visita):

  | Página | Chromium | WebKit |
  | --- | --- | --- |
  | `/compress-image/` | 6 (HTML, CSS, 2 JS, 2 fontes) | 7 (+ manifest) |
  | `/pt/comprimir-imagem/` | 6 | 7 |
  | `/` | 4 | 5 |

  Novas na segunda página: `/compress-image/` → `/privacy/` 1; `/` → `/compress-image/` 3 (HTML e os 2 JS: as fontes já vieram na home); `/pt/comprimir-imagem/` → `/pt/sobre/` 1. Iguais nos dois navegadores.
- **CLS da troca de fonte** nas páginas de texto (Chromium, medido com `PerformanceObserver`): 0,0004 no pior caso, depois de fixar a medida em rem (antes 0,14 em `/es/privacidad/` a 768 px).

## Sprite: as nove poses

Medida da decisão 4: símbolo + peças referenciadas + `oli-clip`, UTF-8, sem compressão.

| pose | bytes |
| --- | ---: |
| wave | 2653 |
| gulp | 2881 |
| swim | 2695 |
| cheer | 2756 |
| oops | 2813 |
| buoy | 2903 |
| lost | 3103 |
| coffee | 3079 |
| peek | 1475 |

O sprite de uma página com só a `peek` tem 3644 bytes (977 em gzip), porque leva o `oli-clip` e as 11 peças do logo; com as nove poses, 10.465 bytes (1987 em gzip).

## Contraste

Fórmula da WCAG sobre os valores do `tokens.json`; `text` ≥ 4,5:1, `icon` e `ui` ≥ 3:1. Todos passam nos dois temas.

| par | uso | claro | escuro |
| --- | --- | ---: | ---: |
| ink sobre bg | text | 16,50 | 17,47 |
| ink sobre surface | text | 17,28 | 15,21 |
| ink sobre surface-sunken | text | 15,60 | 16,64 |
| ink sobre water | text | 13,68 | 9,71 |
| ink sobre brand-soft | text | 14,75 | 11,99 |
| ink sobre danger-soft | text | 14,70 | 14,64 |
| ink sobre turquesa-soft | text | 14,29 | 11,94 |
| ink sobre coral-soft | text | 14,05 | 12,77 |
| ink sobre alga-soft | text | 14,50 | 11,90 |
| ink sobre violeta-soft | text | 13,12 | 14,42 |
| ink sobre lima-soft | text | 15,28 | 10,70 |
| ink-muted sobre bg | text | 6,69 | 8,99 |
| ink-muted sobre surface | text | 7,00 | 7,82 |
| ink-muted sobre surface-sunken | text | 6,32 | 8,56 |
| ink-muted sobre ad-ground | text | 6,32 | 8,56 |
| ink-muted sobre water | text | 5,54 | 4,99 |
| ink-muted sobre brand-soft | text | 5,98 | 6,16 |
| brand sobre bg | text | 4,85 | 7,01 |
| brand sobre surface | text | 5,08 | 6,10 |
| danger sobre bg | text | 5,36 | 8,02 |
| danger sobre surface | text | 5,62 | 6,98 |
| danger sobre danger-soft | text | 4,78 | 6,71 |
| success sobre bg | text | 5,13 | 10,51 |
| success sobre surface | text | 5,37 | 9,14 |
| on-brand sobre brand | text | 5,08 | 7,01 |
| on-sun sobre sun | text | 11,25 | 11,25 |
| on-cat sobre turquesa | text | 6,94 | 6,94 |
| on-cat sobre coral | text | 6,16 | 6,16 |
| on-cat sobre alga | text | 7,25 | 7,25 |
| on-cat sobre lima | text | 10,13 | 10,13 |
| on-violeta sobre violeta | text | 5,44 | 5,44 |
| on-deep sobre deep | text | 13,16 | 13,16 |
| on-deep-muted sobre deep | text | 7,70 | 7,70 |
| brand-on-deep sobre deep | icon | 5,28 | 5,28 |
| brand sobre brand-soft | icon | 4,34 | 4,81 |
| danger sobre danger-soft | icon | 4,78 | 6,71 |
| focus sobre bg | ui | 4,85 | 7,01 |
| focus sobre surface | ui | 5,08 | 6,10 |
| focus sobre surface-sunken | ui | 4,59 | 6,68 |
| on-deep sobre deep | ui | 13,16 | 13,16 |
| stroke sobre bg | ui | 16,50 | 4,67 |
| stroke sobre surface | ui | 17,28 | 4,06 |
| stroke sobre surface-sunken | ui | 15,60 | 4,44 |
| sun sobre deep | ui | 8,97 | 8,97 |

## Screenshots

`pnpm screenshots`, sobre o build final, Chromium, `deviceScaleFactor` 1, movimento reduzido. 360 px salvo indicação.

| Componente | Largura | Claro | Escuro |
| --- | --- | --- | --- |
| Header | 360 px | [claro](fase-01b/header-light-360.png) | [escuro](fase-01b/header-dark-360.png) |
| Header | 1280 px | [claro](fase-01b/header-light-1280.png) | [escuro](fase-01b/header-dark-1280.png) |
| Footer | 360 px | [claro](fase-01b/footer-light-360.png) | [escuro](fase-01b/footer-dark-360.png) |
| Footer | 1280 px | [claro](fase-01b/footer-light-1280.png) | [escuro](fase-01b/footer-dark-1280.png) |
| Página da ferramenta (inteira) | 360 px | [claro](fase-01b/tool-page-light-360.png) | [escuro](fase-01b/tool-page-dark-360.png) |
| Página da ferramenta (inteira) | 1280 px | [claro](fase-01b/tool-page-light-1280.png) | [escuro](fase-01b/tool-page-dark-1280.png) |
| Breadcrumb | 360 px | [claro](fase-01b/breadcrumb-light-360.png) | [escuro](fase-01b/breadcrumb-dark-360.png) |
| PrivacySeal | 360 px | [claro](fase-01b/privacy-seal-light-360.png) | [escuro](fase-01b/privacy-seal-dark-360.png) |
| DropZone em repouso | 360 px | [claro](fase-01b/dropzone-idle-light-360.png) | [escuro](fase-01b/dropzone-idle-dark-360.png) |
| DropZone com arquivo em cima | 360 px | [claro](fase-01b/dropzone-over-light-360.png) | [escuro](fase-01b/dropzone-over-dark-360.png) |
| DropZone com erro | 360 px | [claro](fase-01b/dropzone-error-light-360.png) | [escuro](fase-01b/dropzone-error-dark-360.png) |
| WaterLevel (fluxo real, 0 %) | 360 px | [claro](fase-01b/water-level-light-360.png) | [escuro](fase-01b/water-level-dark-360.png) |
| WaterLevel a 55 % | 360 px | [claro](fase-01b/water-level-55-light-360.png) | [escuro](fase-01b/water-level-55-dark-360.png) |
| ResultCard (celular, sem a Placard) | 360 px | [claro](fase-01b/result-card-light-360.png) | [escuro](fase-01b/result-card-dark-360.png) |
| ResultCard com a Placard | 1280 px | [claro](fase-01b/result-card-placard-light-1280.png) | [escuro](fase-01b/result-card-placard-dark-1280.png) |
| ResultCard com a linha do café | 360 px | [claro](fase-01b/result-card-coffee-light-360.png) | [escuro](fase-01b/result-card-coffee-dark-360.png) |
| NextStepChips | 360 px | [claro](fase-01b/next-step-chips-light-360.png) | [escuro](fase-01b/next-step-chips-dark-360.png) |
| OptionGroup | 360 px | [claro](fase-01b/option-group-light-360.png) | [escuro](fase-01b/option-group-dark-360.png) |
| AdSlot de conteúdo | 360 px | [claro](fase-01b/ad-slot-light-360.png) | [escuro](fase-01b/ad-slot-dark-360.png) |
| AdSlot do trilho | 1280 px | [claro](fase-01b/ad-slot-rail-light-1280.png) | [escuro](fase-01b/ad-slot-rail-dark-1280.png) |
| Faq | 360 px | [claro](fase-01b/faq-light-360.png) | [escuro](fase-01b/faq-dark-360.png) |
| CookieNotice | 360 px | [claro](fase-01b/cookie-notice-light-360.png) | [escuro](fase-01b/cookie-notice-dark-360.png) |
| Home com a Oli wave | 360 px | [claro](fase-01b/home-hero-light-360.png) | [escuro](fase-01b/home-hero-dark-360.png) |
| ToolCard com a dobra | 360 px | [claro](fase-01b/tool-card-light-360.png) | [escuro](fase-01b/tool-card-dark-360.png) |
| ToolSearch com resultado | 360 px | [claro](fase-01b/search-results-light-360.png) | [escuro](fase-01b/search-results-dark-360.png) |
| ToolSearch sem resultado (peek) | 360 px | [claro](fase-01b/search-empty-light-360.png) | [escuro](fase-01b/search-empty-dark-360.png) |
| 404 com a Oli lost | 360 px | [claro](fase-01b/not-found-hero-light-360.png) | [escuro](fase-01b/not-found-hero-dark-360.png) |
| SupportCard (Oli coffee) | 360 px | [claro](fase-01b/support-card-light-360.png) | [escuro](fase-01b/support-card-dark-360.png) |
| FileCard (marcação do design, CSS do build) | 360 px | [claro](fase-01b/file-card-light-360.png) | [escuro](fase-01b/file-card-dark-360.png) |
| OliMessage (marcação do design, CSS do build) | 360 px | [claro](fase-01b/oli-message-light-360.png) | [escuro](fase-01b/oli-message-dark-360.png) |
| Button (marcação do design, CSS do build) | 360 px | [claro](fase-01b/button-light-360.png) | [escuro](fase-01b/button-dark-360.png) |

## Prévia

O comentário do Workers Builds apareceu na PR a cada push. URL da branch: https://fase-01b-fileorca.vmatusita.workers.dev; do commit final: https://a5368061-fileorca.vmatusita.workers.dev.

Conferido no commit `39689b0`, por `curl` e com o Chromium do Playwright:

- `/`, `/pt/`, `/es/`, `/compress-image/` e `/support/` respondem 200 com `x-robots-tag: noindex`; `/nao-existe/` responde 404 com `noindex`.
- `/build.txt` traz `39689b07a5013e53ef86577623576ec96cd9e766`, nos dois endereços.
- As duas fontes (`/_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2` e `/_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2`) respondem 200 com `Cache-Control: public, max-age=31536000, immutable`, e a página carrega a Fredoka e a Figtree.
- Nenhuma requisição para fora do domínio da prévia ao abrir a página da ferramenta.

| Página da ferramenta na prévia, 360 px | Claro | Escuro |
| --- | --- | --- |
| `/compress-image/` | [claro](fase-01b/previa-tool-page-light-360.png) | [escuro](fase-01b/previa-tool-page-dark-360.png) |

## Conferência do v1.1

As 12 correções da lista do plano já estavam em `docs/design/`; nada foi aplicado (§ 39). Item a item: 1 DropZone sem `role`/`tabindex` (aplicada); 2 WaterLevel e `fo-bar` com `aria-label` (aplicada); 3 Header com logo `role="img"`, "EN" no nome e 48 px (aplicada); 4 ToolSearch como combobox (aplicada); 5 rodapé com H2 e título do SupportCard no nível da página (aplicada); 6 rótulo do AdSlot em 12 px, sem `aria-label` (aplicada); 7 tema escuro também por `prefers-color-scheme` (aplicada); 8 token `brand-on-deep` (aplicada); 9 fala da Oli em 20/26, WaterLevel com 340 px, ano do AmortTable com 48 px (aplicada); 10 seta como ícone `arrow-right` com "to" escondido (aplicada); 11 nenhum "up to 50" (aplicada); 12 exemplos de financiamento recalculados em centavos (aplicada). Diferenças para o Victor: o `MUDANCAS-v1.1.md` numera 13 itens em outra ordem, e a nota dele de que o artifact mostra o v1 ficou velha; o artifact, lido em 31/out/2026, tem o mesmo `tokens.json` e o mesmo README.

## Decisões novas

§ 39 conferência do v1.1; § 40 o contrato medido vale mais que o `bundle.css`; § 41 tema do Tailwind gerado; § 42 fontes e fallback; § 43 sprite; § 44 a Oli nas caixas e o movimento; § 45 logo, favicon e ícone do app; § 46 ícones; § 47 folha; § 48 SupportCard; § 49 linha do café; § 50 OG; § 51 screenshots; § 52 testes de qualidade e portão `design`; § 53 FileCard e OliMessage prontos; § 54 ResultCard no celular; § 55 elemento LCP; § 56 Oli de 96 px nos heróis do celular.

## Revisão adversarial

Duas passadas em contexto limpo, com subagentes Sonnet que não viram o código sendo escrito, contra o prompt, a ficha F1b e o plano. A primeira teve três lentes em paralelo (aderência ao design system, com os `preview.html` renderizados ao lado dos screenshots do site; acessibilidade e movimento; desempenho, anúncio e privacidade). A segunda conferiu as correções medindo no build e procurou achados novos. Nenhuma das duas achou nada crítico ou alto.

**Primeira passada** (6 médios e 13 baixos):

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| CLS de 0,14 na troca de fonte das páginas de texto: `68ch` muda com a fonte | médio | medida fixa em rem (`--fo-measure`, 68 caracteres da Figtree); CLS 0,0004 no pior caso (§ 42) |
| Anel de foco do OptionGroup some no WebKit depois da seta | médio | anel em qualquer foco da opção (§ 40); teste de regressão |
| Placeholder da busca em 3,3:1 no claro | médio | `ink-muted` (7:1); teste de regressão |
| FileCard de erro com dois ícones de alerta | médio | `file` na miniatura, como o preview; `filecard.test.ts` renderiza o componente de verdade |
| H1 colado no texto no Sobre, Privacidade, Termos e Contato | médio | 16 px abaixo do H1 da prosa |
| Screenshot do FileCard vem da marcação do design, não do componente | médio | mantido (o componente é conferido pelo `filecard.test.ts`, § 51) |
| Recusar os cookies deixava a contagem do café guardada | baixo | a ferramenta apaga a contagem sem o Aceitar (§ 49); teste ajustado |
| "Já otimizado" contava como uso e mostrava "se te ajudou" | baixo | só arquivo que ficou menor conta (§ 49) |
| `:active` não afundava com movimento reduzido | baixo | o hover reduzido não anula o `:active`; teste de regressão |
| Reflow a 320 px (endereço longo na privacidade, Baixar e busca no WebKit) | baixo | quebra de endereço, respiro menor do `fo-btn--lg` abaixo de 360 px, `width: 0` no campo de busca; teste de regressão em todas as páginas |
| Divisores sobre `deep` mais fortes que no `bundle.css` | baixo | `color-mix` de `on-deep-muted`, como o `bundle.css` |
| Botão "Me pague um café" no apoio em português | baixo | "Apoiar com um café", como a linha do café |
| Faltavam screenshots do Button, do WaterLevel no meio e das variantes do OliMessage; aviso de cookies sobre a página inteira | baixo | acrescentados; a página inteira sai com a escolha feita |
| Oli de 96 px nos heróis do celular sem registro | baixo | § 56 |
| A linha do café passa da altura reservada do painel | baixo | aceito e registrado (§ 49) |
| `summary` das licenças abaixo de 48 px | baixo | 48 px |
| O diálogo de busca fica a 24 px do trilho a 1280 px (igual à F1a) | baixo | aceito: o fundo do diálogo cobre a página, e as caixas da Oli, com a `peek`, ficam a 168 px ou mais do trilho |
| Loops decorativos sem controle de pausa (WCAG 2.2.2) | baixo | não mudou: o loop da `wave` e do vapor é contrato da decisão 5; com `prefers-reduced-motion` nada se move. Fica para o Victor decidir na 1c |
| Tabela de contraste sem `ink-muted` sobre `water` e `brand-soft` | baixo | pares acrescentados (5,54/4,99 e 5,98/6,16) |

**Segunda passada:** as 9 correções conferidas no build, com números. Achados novos, todos médios ou baixos:

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| "Última atualização" da política não mudou, e a frase dizia "arquivos terminados" | médio | data de 31/out/2026 e a frase diz "arquivos que ficaram menores" e que a contagem é apagada ao recusar, nos três idiomas |
| O `summary` das licenças perdeu o triângulo | médio | volta a ser `list-item`, com 48 px pelo padding |
| Nome de arquivo longo no erro alargava a página | médio | quebra dentro do DropZone; coberto pelo teste de reflow |
| Correções sem teste de regressão | médio | cinco testes novos no `design.spec.ts` (reflow a 320 px em todas as páginas, largura da prosa na troca de fonte, anel do OptionGroup, placeholder, `:active` com movimento reduzido) |
| Recusar na página de privacidade deixa a contagem até abrir uma ferramenta | baixo | registrado (§ 49): o script do aviso de cookies é da camada de consentimento, fora da run |
| Um arquivo "já otimizado" que depois diminui com Forte não contava | baixo | passa a contar |

**Tempo do CI:** o segundo push levou o `verificar` a 758 s no Ubuntu (limite 900), com o axe 1,8 a 3 vezes mais lento que na F1a por causa da Oli em loop. O axe passou a rodar com movimento reduzido, sem mudar o alcance, e os testes que só precisam da linha do café na tela chegam a ela com um envio (§ 57).

## O que a válvula cortou

Nada. A folha tem os três tamanhos, a OG tem a Oli e o logo, o caso de quem bloqueia anúncio está na regra (atrás das variáveis do AdSense e testado na função pura) e a busca tem a `peek`.

## O que é do Victor, em passos

1. Depois do merge automático: `git pull` e abrir `docs/oli/folha.html` no navegador (abre sem internet).
2. Antes de rodar a F2: fazer a busca reversa da Oli no Google Lens (15 min), com as poses da folha. Se quiser ajuste no desenho, pedir a run 1c.
3. Conferir fileorca.com no celular e no computador, nos dois temas (o tema segue o do sistema).
4. Foto do Sobre: pôr em `public/about/victor.jpg` (JPG quadrado, 800×800, sem localização). A página continua sem foto e sem imagem quebrada até lá.
5. Pendências da F1a e do ajuste que seguem abertas: os campos vazios do `docs/F0-SAIDA.md`; o e-mail da marca (Email Routing e logins no Gmail da marca); os textos que dependem de conta (valores sugeridos no Ko-fi, retenção do GA4 e a leitura jurídica das bases legais e do foro); decidir o § 24 (LanguageTool local ou API pública) e o § 37 (voltar ao Node 26 e ao pnpm 12); voltar o "Comando de preview" do painel do Workers Builds para `npx wrangler preview`.
6. Manter `PUBLIC_ADS_ENABLED` desligado até a aprovação do AdSense.

## Nota para a F2

- **Oli:** numa página Astro, `<Oli pose="wave" class="…" />` e a pose em `<BaseLayout oli={['wave']}>` (a `peek` entra sempre). Na ilha, use o padrão do `ToolPanel`: a caixa `[data-oli]` com `<svg aria-hidden="true"><use href="#oli-<pose>"/></svg>`, trocar a pose é trocar o `href`, e todas as poses que o cliente pode mostrar vão numa lista exportada (`PANEL_POSES`) que a página passa ao layout. As caixas e os tamanhos estão no `components.css` (`.fo-drop__oli`, `.fo-level__oli`, `.fo-result__oli`, `.fo-hero__oli`). Pose nova só com decisão; mudar um SVG da Oli pede `pnpm design:gerar` (a folha) e o `sprite.test.ts` confere o desenho.
- **Ícones:** em `.astro`, `<Icon name="compress" />`; na ilha, `import x from '…/Icons/x.svg?raw'` e `<Icon raw={x} />` de `src/icons/Icon.tsx`. Ícone novo entra em `docs/design/assets/Icons/` com decisão e o nome em `ICON_NAMES`. Seta entre tamanhos: `arrow-right` com `fo-icon--inline` e a palavra em `fo-sr`.
- **FileCard:** `src/components/FileCard.tsx`, com os estados `done`, `working` e `error` e rótulos com `{name}`; a lista vai em `.fo-filelist`. O CSS está pronto e o `filecard.test.ts` confere a marcação.
- **Café:** cada ferramenta nova reaproveita `coffee.ts` (contar só resultado com ganho, só com o Aceitar) e o bloco `.fo-result__support`.
