# F2 · Imagem em inglês e lançamento: relatório

Branch `fase-02`, PR [vmatusita/fileorca#5](https://github.com/vmatusita/fileorca/pull/5). Prompt: `docs/prompts/prompt-fase-02.txt`. Plano: `docs/relatorios/fase-02-plano.md`. Decisões novas: `DECISOES.md` § 58 a § 87. ADR nova: `docs/adr/ADR-003-playwright-em-partes-no-ci.md` (Proposta). Matriz de fixtures: `docs/relatorios/fase-02-matriz.md`. Run de 31/out/2026.

## Resumo

O fileorca.com ganhou o motor de imagem de verdade e, com ele, oito ferramentas em inglês: Compress, Resize, Crop, Rotate/flip, HEIC to JPG/PNG, WebP to JPG/PNG, PNG ↔ JPG e Image to PDF. Também entraram os três presets com `entra` no `data/keywords.csv` (`/compress-image/to-100kb/`, `/compress-image/to-1mb/`, `/resize-image/youtube-thumbnail/`) e o hub `/image-tools/`. Tudo roda no navegador, num worker com codecs WASM de uma thread carregados no primeiro uso:

- lote sem limite por arrastar, escolher ou Ctrl+V, com ZIP;
- orientação aplicada e nenhum metadado na saída, inclusive o GPS;
- erro por arquivo e caminho sem canvas acima de 16,7 MP.

A Compress image em português e espanhol usa o mesmo motor, com os textos do lote reescritos. `LAUNCHED` virou `true`: com o merge, o site lança.

Os testes cobrem:

- uma matriz de fixtures por ferramenta e navegador, com a tabela gerada da saída dos testes;
- lote, ZIP e colagem;
- os presets por bytes;
- privacidade (requisições, COOP/COEP, nenhuma build de várias threads, números digitados fora da URL e do GA4);
- orçamentos e distância dos anúncios em toda página nova;
- axe em todas as páginas e estados novos.

Um portão novo, `gate:conteudo`, confere o conteúdo mínimo das páginas, e a /licenses passou a listar o bundle de verdade, com o libheif (LGPL) num arquivo e num chunk à parte.

O primeiro CI completo passou de 900 s. A ficha manda fazer primeiro o que não reduz o alcance, depois a válvula, e as duas coisas foram feitas:

- o axe passou ao modo legado, com só as violações;
- os estados de teste passaram a um carregamento cada;
- a válvula cortou (e) Convert to WebP/AVIF e (f) AVIF to JPG para a run 2b;
- a ADR-003 propõe dividir o Playwright do CI em partes.

Mesmo assim, o CI não passa: com os 486 testes verdes, o `verificar` levou 1283,5 s no runner de 2 vCPU, e o limite é 900 s. **A PR não mescla sozinha, e o site só lança depois da decisão da ADR-003 ou de um merge feito à mão pelo Victor** (seção "O que é do Victor").

## Critérios de aceitação

| # | Critério | Situação | Evidência |
| --- | --- | --- | --- |
| 1 | `verificar` ≤ 900 s local e no CI; CI ≤ 800 s no commit final | **não, pelo tempo** | local **275,3 s** (seção abaixo); CI **1283,5 s** com os 486 testes verdes, acima do limite de 900 s; a decisão de dividir o Playwright é do Victor (ADR-003) (seção "CI na PR") |
| 2 | 15 portões da F1b com o mesmo alcance, mais o `gate:conteudo`; sem `skip`, `fixme`, `retries`, `continue-on-error`; testes mudados listados | ok | `scripts/verificar.ts` só ganhou o `gate:conteudo`; `retries: 0` e 60 s por teste no `playwright.config.ts`; nenhum `skip`, `fixme`, `only` ou `continue-on-error` em `tests/` e `scripts/`; limiares e orçamentos iguais; § 82 lista cada teste mudado e o porquê, e a revisão conferiu linha a linha |
| 3 | Matriz em Chromium e WebKit, tabela gerada da saída dos testes | ok | `tests/e2e/image-matrix.spec.ts` (13 testes por navegador) e `docs/relatorios/fase-02-matriz.md`, gerada por `scripts/fixtures/matrix-table.ts` a partir de `test-results/matriz/*.json` da execução do `verificar` abaixo; orientação por pixels na `jpg-03` e nas variantes 6 e 8; `heic-05` e `heic-09` pelas dimensões; transparência; recusa na linha do arquivo, com o resto do lote saindo |
| 4 | Nenhuma saída com GPS ou localização | ok | `metadataReport` (`tests/e2e/lib/images.ts`) em toda saída da matriz e dos presets (APP1 do JPG; `eXIf`, `iTXt`, `tEXt`, `zTXt` do PNG; `EXIF` e `XMP ` do WebP) e nos JPEG dentro do PDF (`tests/e2e/lib/pdf.ts`), `heic-10` incluída; o `stripJpeg` agora corta no EOI (§ 86) |
| 5 | Corrompido, truncado, vazio e texto `.png` no meio do lote | ok | `image-batch.spec.ts` ("files that cannot be read, in the middle of a batch"): fala de erro em cada um, os outros saem, um lote novo funciona; também no meio de todo lote da matriz |
| 6 | Lote e ZIP | ok | `image-batch.spec.ts`: N arquivos, N saídas; ZIP abre, sem compressão, nomes únicos com " (2)" e " (3)", cada entrada igual ao download da linha; um arquivo baixa direto; Ctrl+V nos dois navegadores; "Show 3 more" com 9 arquivos |
| 7 | Presets por bytes e formato | ok | `image-presets.spec.ts` e a tabela "Presets" da matriz (bytes de cada saída, abaixo); YouTube 1280×720 JPG ≤ 2.000.000 bytes (a ajuda oficial pede ≤ 2 MB no celular; § 60) |
| 8 | HEIC | ok | matriz: as dez dão JPG nas dimensões do oráculo (3024×4032 em pé na `heic-05` e na `heic-09`), a `heic-10` dá um arquivo só; `image-privacy.spec.ts`: o `.wasm` do libheif no `dist/` tem o SHA-256 do pacote (`184d3d20…`); `engine-choice.test.ts` e `engine-bmff.test.ts` no Vitest |
| 9 | Caminho sem canvas | ok | `gen-grande-4100x4100.jpg` no lote da Compress (matriz) e na Resize (`image-privacy.spec.ts`, com a prova do caminho), nos dois navegadores; `engine-choice.test.ts` (4096² pelo canvas, 4097 × 4096 não); teto de 50 MP (§ 86) |
| 10 | Privacidade | ok | 0 requisição para fora em todo teste da matriz (coluna da tabela); `image-privacy.spec.ts`: `crossOriginIsolated` falso, nenhuma página com COOP ou COEP, nenhum `_mt`, `pkg-parallel`, `workerHelpers`, hqx, magic-kernel nem `SharedArrayBuffer` no `dist/`; `image-smoke.spec.ts` digita na Resize e no Crop e confere a URL e o `dataLayer`; `cleanParams` com listas fechadas (§ 71) |
| 11 | Orçamentos | ok | tabela "Desempenho": 19,2 a 21,5 KB gzip, 2 arquivos JS por página de ferramenta; 6 requisições no Chromium e 7 no WebKit; pares de 1 a 3 novas |
| 12 | Lighthouse em `/compress-image/` e `/image-tools/` | ok | 100/100/100/100 nas duas; LCP 1,50 s (texto do aviso de cookies) e 1,35 s (linha do hub); CLS 0,001 e 0,000; a Oli nunca é o LCP |
| 13 | axe em toda página e nos estados novos; Crop só com teclado | ok | `a11y.spec.ts`: as 38 páginas do mapa × 2 larguras × 2 temas × 2 navegadores, status 200; fila com pronto e erro, cartão do lote, comparação, WaterLevel, HEIC recusado; `image-smoke.spec.ts`: editor de corte, campos da Resize com erro, opções da Image to PDF e do Rotate; teclado: `image-smoke.spec.ts` e `image-crop.spec.ts` |
| 14 | Distância dos anúncios | ok | `ads.spec.ts`: toda página de ferramenta e de preset, a 360×740 e a 1280×800, em repouso, processando, com o resultado e com um lote de dois; nenhum AdSlot no painel; hub com o AdSlot debaixo da grade |
| 15 | `gate:conteudo` | ok | `scripts/gates/conteudo.ts` verde em 13 páginas de ferramenta e 35 do site; `tests/unit/conteudo.test.ts` |
| 16 | Lançamento | ok | `export const LAUNCHED = true;` (fatia própria, reaplicada como último commit de código depois do `verificar` verde, § 75); `navigation.spec.ts` (sem `X-Robots-Tag`, `noindex` nos três 404); `platform.test.ts` (workers.dev); `pos-deploy.test.ts`; `gate:cabecalhos` |
| 17 | Sitemap, hreflang, órfãs, links | ok | `gate:seo` (37 páginas indexáveis; `sitemap-en.xml` com 19 URLs; hreflang só entre equivalentes; pt e es iguais); `gate:links` sem órfã e sem link quebrado |
| 18 | /licenses e LGPL | ok | 17 pacotes do bundle real, nos três idiomas, com os textos; aviso da LGPL com os links do código (libheif v1.23.5, libheif-js 1.23.5, libheif-emscripten v1.23.5); `gate:licencas` verde, com o `.wasm` idêntico e a cola num chunk só dela (§ 79) |
| 19 | Prévia da PR | ok | seção "Prévia" |
| 20 | Depois do merge, só por leitura | na resposta final | este relatório é commitado antes do `gh pr ready`; as conferências no fileorca.com depois do merge vão na resposta final da run |

## O que foi feito, por área

- **Motor** (`src/engine/image/`, § 59 a § 66, § 86): contrato de operações, formato pelos bytes, parser de ISO-BMFF/HEIF, checagem de estrutura (truncado e corrompido), canvas ou WASM pelo número de pixels (teto de 50 MP), MozJPEG/WebP/OxiPNG/resize do jSquash e libheif carregados no primeiro uso, P3 → sRGB, tamanho-alvo sem recodificar a foto inteira, `strip` de metadados até o EOI, ZIP sem compressão no worker. A semente do motor de PDF (`src/engine/pdf/`) monta o PDF com o `@cantoo/pdf-lib` e entrega com `transfer`.
- **Ilha** (`src/tools/image/`, § 69 a § 74): um `ImagePanel` para todas as ferramentas, com fila, cancelar e remover por linha, "Show N more", ZIP, Ctrl+V, comparação antes e depois, foco e região de status; `NumberField`, `OptionGroup`, `BeforeAfter`; editor de corte com teclado e ponteiro.
- **Ferramentas e páginas**: as oito ferramentas e os três presets, cada um com o molde `ImageToolPage.astro` (como fazer, especificações, FAQ, privacidade, relacionadas), o hub, a home em inglês com a grade, o rodapé, a busca e as OG, tudo lido do registro (`src/tools/image/registry.ts`) e do mapa de rotas.
- **pt e es** (§ 58): a Compress image no motor novo, com os textos do lote, do ZIP e dos formatos reescritos; os chips levam à home do idioma; o menu de idioma de uma página só em inglês leva à home de cada língua (§ 84).
- **Conteúdo e textos**: textos das ferramentas na voz do design system, FAQ e especificações próprias por página e por preset; `gate:conteudo`; o Sobre, os Termos e a Privacidade sem nada "por vir".
- **Licenças** (§ 79): registro dos módulos de cada chunk no build, a /licenses com os 17 pacotes do bundle, os textos da libavif, da libaom e dos codecs, o aviso da LGPL; o `gate:licencas` confere o bundle contra a página e o libheif em arquivo e chunk à parte.
- **Lançamento** (§ 75): `LAUNCHED = true`, cabeçalhos e testes do pós-deploy.
- **Testes** (§ 67, § 76, § 80 a § 83): fixtures geradas e oráculo; matriz, lote, presets, privacidade, ilha, smoke, corte; orçamentos e anúncios em toda página nova; axe por página e por estado num carregamento, no modo legado.

## Árvore do que nasceu ou mudou

```
docs/prompts/prompt-fase-02.txt, .md            a ficha
docs/relatorios/fase-02-plano.md, fase-02.md, fase-02-matriz.md, fase-02/*.png
docs/adr/ADR-003-playwright-em-partes-no-ci.md  Proposta
fixtures/images/gen-*.{jpg,png,webp,avif}, expected.json; fixtures/ORIGEM.md (linhas novas)
scripts/fixtures/generate.ts, lib/*, matrix-table.ts     pnpm fixtures e a tabela da matriz
scripts/gates/conteudo.ts, scripts/lib/conteudo.ts       portão novo
scripts/gates/licencas.ts, scripts/lib/licenses-check.ts bundle real e LGPL à parte
scripts/gates/seo.ts, scripts/lib/seo-pages.ts           todas as páginas de imagem
scripts/gates/lint-texto.ts, scripts/verificar.ts, scripts/screenshots.ts
src/engine/image/*, src/engine/image/codecs/*, src/engine/pdf/*
src/tools/image/*                                 ilha, registro, textos do painel
src/tools/{compress,resize,crop,rotate}-image/, heic-to-jpg/, webp-to-jpg/, png-to-jpg/, image-to-pdf/
src/tools/compress-image/presets/{to-100kb,to-1mb}/, src/tools/resize-image/presets/youtube-thumbnail/
src/pages/<ferramenta>/, src/pages/image-tools/, src/views/ImageToolsView.astro, HomeView.astro
src/components/FileCard.tsx, Footer.astro, ToolCard.astro, Faq.astro; src/icons/Icon.tsx
src/i18n/routes.ts, types.ts, texts.ts, en/common.ts, en/image-tools.ts, */about, terms, privacy, licenses
src/platform/site.ts (LAUNCHED), licenses.ts, bundle-record.ts, license-texts/*
src/analytics/events.ts, src/search/search.ts, src/pages/search-index.json.ts, src/seo/meta.ts, images.ts
src/styles/components.css, global.css
tests/unit/*: engine-*, readers, fixtures, conteudo, licenses, crop-box, image-*, matrix-*, pdf-*, strip, seo-pages (novos); routes, seo-checks, quality, filecard, consent, coffee, ads-pages, pos-deploy (mudados)
tests/e2e/image-{matrix,batch,presets,privacy,smoke,crop}.spec.ts, island.spec.ts (novos); lib/{matrix,axe,images,pixels,png,webp,bmff,pdf,zip}.ts (novos)
tests/e2e/a11y, ads, budgets, coffee, design, events, navigation, tool, consent .spec.ts, lib/page.ts, lib/jpeg.ts (mudados)
astro.config.ts, playwright.config.ts, lighthouserc.json, eslint.config.ts, tsconfig.json, package.json, pnpm-lock.yaml
CLAUDE.md (seção "F2: ferramentas de imagem"), DECISOES.md (§ 58 a § 86)
```

## pnpm verificar local

Execução em 31/out/2026, no commit `1e5f391` (o último com código; depois dele só entraram documentos, a tabela da matriz e os screenshots): Windows 11, AMD Ryzen 5 7600X (12 threads), Node 26.8.1 local (o CI usa o 24 do `.node-version`), pnpm 10, `pnpm verificar`, que apaga o `dist/` e builda do zero. **Total 275,3 s** (limite 900 s): 16 portões verdes, Vitest 46 arquivos e 749 testes, Playwright 486 testes nos dois navegadores, Lighthouse nas duas páginas e `lint:texto` com 31 arquivos, 1434 textos e 0 erro de gramática (464 avisos, quase todos de ortografia em nomes próprios, termos técnicos e as variáveis `{name}` dos textos).

| Portão | Tempo |
| --- | ---: |
| tipos (astro check) | 7,6 s |
| lint (eslint) | 2,5 s |
| build (do zero) | 8,7 s |
| vitest | 5,2 s |
| cabeçalhos gerados | 0,4 s |
| worker sem código | 0,4 s |
| seo | 0,5 s |
| links internos e órfãs | 0,5 s |
| conteúdo mínimo (novo) | 0,5 s |
| design | 0,5 s |
| licenças | 5,8 s |
| dinheiro e saúde | 0,4 s |
| actionlint | 0,4 s |
| playwright | 156,7 s |
| lighthouse ci | 73,1 s |
| lint:texto | 12,3 s |

<details>
<summary>Saída completa do <code>pnpm verificar</code></summary>

```

> fileorca@0.0.0 verificar C:\Users\vmatusita\projetos\fileorca
> node scripts/verificar.ts


▶ tipos (astro check)
  $ pnpm run tipos

> fileorca@0.0.0 tipos C:\Users\vmatusita\projetos\fileorca
> astro check

10:17:18 [types] Generated 41ms
10:17:18 [check] Getting diagnostics for Astro files in C:\Users\vmatusita\projetos\fileorca...
tests/unit/ads.test.ts:93:22 - warning ts(80007): 'await' has no effect on the type of this expression.

93     const response = await (GET as unknown as () => Response)();
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Result (338 files): 
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

10:17:28 [types] Generated 30ms
10:17:28 [build] output: "static"
10:17:28 [build] mode: "static"
10:17:28 [build] directory: C:\Users\vmatusita\projetos\fileorca\dist\
10:17:28 [build] Collecting build info...
10:17:28 [build] ✓ Completed in 64ms.
10:17:28 [build] Building static entrypoints...
10:17:29 [vite] ✓ built in 825ms
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "fs" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "path" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "crypto" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "fs" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "path" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [WARN] [vite] [plugin rolldown:vite-resolve] Module "crypto" has been externalized for browser compatibility, imported by "C:/Users/vmatusita/projetos/fileorca/node_modules/.pnpm/libheif-js@1.23.5/node_modules/libheif-js/libheif-wasm/libheif.js". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
10:17:29 [vite] ✓ built in 383ms
10:17:29 [build] Rearranging server assets...

 generating static routes 
10:17:29   ├─ /404.html (+18ms) 
10:17:29   ├─ /about/index.html (+4ms) 
10:17:29   ├─ /compress-image/to-100kb/index.html (+7ms) 
10:17:29   ├─ /compress-image/to-1mb/index.html (+3ms) 
10:17:29   ├─ /compress-image/index.html (+5ms) 
10:17:29   ├─ /contact/index.html (+3ms) 
10:17:29   ├─ /crop-image/index.html (+3ms) 
10:17:29   ├─ /es/404.html (+2ms) 
10:17:29   ├─ /es/acerca-de/index.html (+2ms) 
10:17:29   ├─ /es/apoyo/index.html (+3ms) 
10:17:29   ├─ /es/comprimir-imagen/index.html (+3ms) 
10:17:29   ├─ /es/contacto/index.html (+2ms) 
10:17:29   ├─ /es/licencias/index.html (+22ms) 
10:17:29   ├─ /es/privacidad/index.html (+3ms) 
10:17:29   ├─ /es/terminos/index.html (+2ms) 
10:17:29   ├─ /es/index.html (+3ms) 
10:17:29   ├─ /heic-to-jpg/index.html (+2ms) 
10:17:29   ├─ /image-to-pdf/index.html (+3ms) 
10:17:29   ├─ /image-tools/index.html (+2ms) 
10:17:29   ├─ /licenses/index.html (+17ms) 
10:17:29   ├─ /og/en/home.png (+137ms) 
10:17:30   ├─ /og/pt/home.png (+424ms) 
10:17:30   ├─ /og/es/home.png (+380ms) 
10:17:30   ├─ /og/en/compress-image.png (+135ms) 
10:17:30   ├─ /og/pt/compress-image.png (+101ms) 
10:17:31   ├─ /og/es/compress-image.png (+104ms) 
10:17:31   ├─ /og/en/image-tools.png (+110ms) 
10:17:31   ├─ /og/en/resize-image.png (+102ms) 
10:17:31   ├─ /og/en/crop-image.png (+103ms) 
10:17:31   ├─ /og/en/rotate-image.png (+105ms) 
10:17:31   ├─ /og/en/heic-to-jpg.png (+108ms) 
10:17:31   ├─ /og/en/webp-to-jpg.png (+105ms) 
10:17:31   ├─ /og/en/png-to-jpg.png (+106ms) 
10:17:31   ├─ /og/en/image-to-pdf.png (+107ms) 
10:17:32   ├─ /og/en/compress-image-to-100kb.png (+106ms) 
10:17:32   ├─ /og/en/compress-image-to-1mb.png (+103ms) 
10:17:32   ├─ /og/en/resize-image-youtube-thumbnail.png (+103ms) 
10:17:32   ├─ /og/en/privacy.png (+102ms) 
10:17:32   ├─ /og/pt/privacy.png (+115ms) 
10:17:32   ├─ /og/es/privacy.png (+108ms) 
10:17:32   ├─ /og/en/terms.png (+106ms) 
10:17:32   ├─ /og/pt/terms.png (+102ms) 
10:17:32   ├─ /og/es/terms.png (+101ms) 
10:17:32   ├─ /og/en/about.png (+103ms) 
10:17:33   ├─ /og/pt/about.png (+103ms) 
10:17:33   ├─ /og/es/about.png (+103ms) 
10:17:33   ├─ /og/en/contact.png (+99ms) 
10:17:33   ├─ /og/pt/contact.png (+101ms) 
10:17:33   ├─ /og/es/contact.png (+102ms) 
10:17:33   ├─ /og/en/licenses.png (+105ms) 
10:17:33   ├─ /og/pt/licenses.png (+110ms) 
10:17:33   ├─ /og/es/licenses.png (+105ms) 
10:17:33   ├─ /og/en/support.png (+132ms) 
10:17:34   ├─ /og/pt/support.png (+201ms) 
10:17:34   ├─ /og/es/support.png (+385ms) 
10:17:34   ├─ /png-to-jpg/index.html (+4ms) 
10:17:34   ├─ /privacy/index.html (+2ms) 
10:17:34   ├─ /pt/404.html (+2ms) 
10:17:34   ├─ /pt/apoie/index.html (+2ms) 
10:17:34   ├─ /pt/comprimir-imagem/index.html (+3ms) 
10:17:34   ├─ /pt/contato/index.html (+2ms) 
10:17:34   ├─ /pt/licencas/index.html (+21ms) 
10:17:34   ├─ /pt/privacidade/index.html (+2ms) 
10:17:34   ├─ /pt/sobre/index.html (+2ms) 
10:17:34   ├─ /pt/termos/index.html (+2ms) 
10:17:34   ├─ /pt/index.html (+2ms) 
10:17:34   ├─ /resize-image/youtube-thumbnail/index.html (+4ms) 
10:17:34   ├─ /resize-image/index.html (+5ms) 
10:17:34   ├─ /rotate-image/index.html (+3ms) 
10:17:34   ├─ /search-index.json (+2ms) 
10:17:34   ├─ /sitemap-index.xml (+1ms) 
10:17:34   ├─ /support/index.html (+2ms) 
10:17:34   ├─ /terms/index.html (+2ms) 
10:17:34   ├─ /webp-to-jpg/index.html (+30ms) 
10:17:34   ├─ /icon-180.png (+3ms) 
10:17:34   ├─ /icon-192.png (+2ms) 
10:17:34   ├─ /icon-512.png (+7ms) 
10:17:34   ├─ /manifest-en.webmanifest (+1ms) 
10:17:34   ├─ /manifest-pt.webmanifest (+1ms) 
10:17:34   ├─ /manifest-es.webmanifest (+1ms) 
10:17:34   ├─ /sitemap-en.xml (+1ms) 
10:17:34   ├─ /sitemap-pt.xml (+1ms) 
10:17:34   ├─ /sitemap-es.xml (+1ms) 
10:17:34   ├─ /index.html (+2ms) 
10:17:34 ✓ Completed in 5.02s.

10:17:34 [build] ✓ Completed in 6.36s.
10:17:34 [fileorca:platform-files] _headers, _redirects and build.txt (1e5f391) written
10:17:34 [build] 38 page(s) built in 6.44s
10:17:34 [build] Complete!

▶ vitest
  $ pnpm run test

> fileorca@0.0.0 test C:\Users\vmatusita\projetos\fileorca
> vitest run


 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca


 Test Files  46 passed (46)
      Tests  749 passed (749)
   Start at  10:17:36
   Duration  3.19s (transform 41%, import 32%, tests 26%, worker 1%)

    Isolate  46 workers spawned · ~156ms startup each (spawn + environment, per file)
             at least ~498ms faster with isolate: false — reuses workers across files instead of one per file


▶ cabeçalhos gerados
  $ pnpm run gate:cabecalhos

> fileorca@0.0.0 gate:cabecalhos C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/cabecalhos.ts

cabeçalhos: ok, 6 regras, LAUNCHED = true, build.txt 1e5f391

▶ worker sem código
  $ pnpm run gate:worker

> fileorca@0.0.0 gate:worker C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/worker.ts

worker sem código: ok, só assets em ./dist, sem main, sem run_worker_first, sem _worker.js e sem functions/

▶ seo (hreflang, sitemaps, canonical, robots)
  $ pnpm run gate:seo

> fileorca@0.0.0 gate:seo C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/seo.ts

seo: ok, 35 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps

▶ links internos e páginas órfãs
  $ pnpm run gate:links

> fileorca@0.0.0 gate:links C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/links.ts

links: ok, 1054 links internos em 38 páginas, nenhuma órfã

▶ conteúdo mínimo das ferramentas e do site
  $ pnpm run gate:conteudo

> fileorca@0.0.0 gate:conteudo C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/conteudo.ts

conteúdo: ok, 13 página(s) de ferramenta e de preset e 35 página(s) do site conferida(s)

▶ design (sprite, fontes, tema, movimento, setas)
  $ pnpm run gate:design

> fileorca@0.0.0 gate:design C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/design.ts

design folha de estilo única: ok, 38 páginas, cada uma com um <link rel="stylesheet"> e nenhum <style>
design sprite da Oli: ok, 38 páginas, ids únicos, um oli-clip, poses da lista fechada e caixas [data-oli] com o próprio símbolo
design setas: ok, 38 páginas sem → nem ↔ no texto
design folhas ligadas: ok, 1 arquivo(s) CSS em 38 páginas
design variáveis do tema: ok, 1 CSS, todo --color-*, --radius-*, --shadow-* e --font-* é token
design movimento: ok, 1 CSS, @keyframes e transition só com transform, opacity, translate, scale e rotate
design fontes: ok, 2 .woff2 (Fredoka e Figtree latinas), preload só da Fredoka com a URL do @font-face
design: ok, 38 páginas e 1 CSS conferidos

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
licenças: ok, 15 dependências de navegador, 6 dentro de outras, 17 pacotes no bundle, 18 de build, 876 pacotes na árvore, /licenses em 3 idiomas

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


Running 486 tests using 6 workers

  ok   1 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/ (1.1s)
  ok   5 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/ (1.1s)
  ok   4 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › / (1.3s)
  ok   3 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/comprimir-imagem/ (1.4s)
  ok   2 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/ (1.6s)
  ok   6 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/comprimir-imagen/ (1.5s)
  ok   7 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /image-tools/ (1.2s)
  ok   9 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /crop-image/ (1.4s)
  ok   8 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /resize-image/ (1.5s)
  ok  10 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /rotate-image/ (1.4s)
  ok  11 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /heic-to-jpg/ (1.4s)
  ok  12 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /webp-to-jpg/ (1.3s)
  ok  13 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /png-to-jpg/ (1.3s)
  ok  15 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/to-100kb/ (1.3s)
  ok  14 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /image-to-pdf/ (1.3s)
  ok  16 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/to-1mb/ (1.3s)
  ok  18 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /privacy/ (1.2s)
  ok  17 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /resize-image/youtube-thumbnail/ (1.3s)
  ok  19 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/privacidade/ (1.1s)
  ok  21 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /terms/ (1.1s)
  ok  20 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/privacidad/ (1.1s)
  ok  22 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/termos/ (1.1s)
  ok  23 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/terminos/ (1.1s)
  ok  24 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /about/ (998ms)
  ok  25 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/sobre/ (972ms)
  ok  26 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/acerca-de/ (994ms)
  ok  28 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/contato/ (962ms)
  ok  27 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /contact/ (982ms)
  ok  29 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/contacto/ (981ms)
  ok  30 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /licenses/ (1.5s)
  ok  33 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /support/ (984ms)
  ok  34 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/apoie/ (991ms)
  ok  35 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/apoyo/ (971ms)
  ok  31 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/licencas/ (1.6s)
  ok  32 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/licencias/ (1.5s)
  ok  36 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /404.html (1.0s)
  ok  37 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/404.html (988ms)
  ok  38 [chromium] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/404.html (1.0s)
  ok  40 [chromium] › tests\e2e\a11y.spec.ts:105:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search dialog open (1.3s)
  ok  41 [chromium] › tests\e2e\a11y.spec.ts:110:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search dialog open with every page listed (1.3s)
  ok  39 [chromium] › tests\e2e\a11y.spec.ts:100:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › tool page with the result on screen (1.9s)
  ok  43 [chromium] › tests\e2e\a11y.spec.ts:120:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search without a result (peek visible) (1.2s)
  ok  42 [chromium] › tests\e2e\a11y.spec.ts:115:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › tool page with the coffee line on screen (1.9s)
  ok  44 [chromium] › tests\e2e\a11y.spec.ts:132:3 › axe com um lote na tela, a 360 e 1280px, nos temas escuro e claro › the queue with ready and error rows, the batch card and the comparison (2.3s)
  ok  45 [chromium] › tests\e2e\a11y.spec.ts:146:3 › axe com um lote na tela, a 360 e 1280px, nos temas escuro e claro › the WaterLevel with the batch count, a working row and waiting rows (2.4s)
/compress-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  47 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/: at rest, while processing, with the result and with a batch (2.0s)
  ok  46 [chromium] › tests\e2e\a11y.spec.ts:168:3 › axe com arquivo recusado, a 360 e 1280px, nos temas escuro e claro › a HEIC refused by Compress image, in the drop zone and in a row, with the link to HEIC to JPG (3.1s)
/resize-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  50 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /resize-image/: at rest, while processing, with the result and with a batch (2.0s)
/compress-image/to-100kb/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  48 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/to-100kb/: at rest, while processing, with the result and with a batch (3.5s)
/crop-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  52 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /crop-image/: at rest, while processing, with the result and with a batch (2.0s)
/rotate-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
/compress-image/to-1mb/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  53 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /rotate-image/: at rest, while processing, with the result and with a batch (1.9s)
  ok  49 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/to-1mb/: at rest, while processing, with the result and with a batch (4.3s)
arquivo em cima: menor vão 166 px
  ok  58 [chromium] › tests\e2e\ads.spec.ts:208:5 › distância dos anúncios nos outros estados a 360×740 › with a file over the drop zone (301ms)
/resize-image/youtube-thumbnail/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  51 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /resize-image/youtube-thumbnail/: at rest, while processing, with the result and with a batch (3.6s)
/webp-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  55 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /webp-to-jpg/: at rest, while processing, with the result and with a batch (2.1s)
erro: menor vão 166 px
  ok  60 [chromium] › tests\e2e\ads.spec.ts:224:5 › distância dos anúncios nos outros estados a 360×740 › with the error message (426ms)
/png-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  56 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /png-to-jpg/: at rest, while processing, with the result and with a batch (1.9s)
resultado com a linha do café: menor vão 166 px
busca sem resultado: menor vão 607 px
  ok  62 [chromium] › tests\e2e\ads.spec.ts:243:5 › distância dos anúncios nos outros estados a 360×740 › with the result and the coffee line (588ms)
  ok  63 [chromium] › tests\e2e\ads.spec.ts:251:5 › distância dos anúncios nos outros estados a 360×740 › search dialog open without a result: the Oli keeps its distance (405ms)
processando: menor vão 166 px
/heic-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  54 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /heic-to-jpg/: at rest, while processing, with the result and with a batch (3.2s)
  ok  59 [chromium] › tests\e2e\ads.spec.ts:214:5 › distância dos anúncios nos outros estados a 360×740 › while processing (WaterLevel on screen) (1.5s)
arquivo em cima: menor vão 150 px
  ok  64 [chromium] › tests\e2e\ads.spec.ts:208:5 › distância dos anúncios nos outros estados a 1280×800 › with a file over the drop zone (404ms)
/image-to-pdf/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok  57 [chromium] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /image-to-pdf/: at rest, while processing, with the result and with a batch (2.1s)
erro: menor vão 150 px
  ok  66 [chromium] › tests\e2e\ads.spec.ts:224:5 › distância dos anúncios nos outros estados a 1280×800 › with the error message (426ms)
lote com a fila, o comparador e os atalhos: menor vão 166 px
fila inteira: menor vão 166 px
busca sem resultado: menor vão 168 px
  ok  61 [chromium] › tests\e2e\ads.spec.ts:230:5 › distância dos anúncios nos outros estados a 360×740 › with a batch: the queue, the error row, the comparison and the chips (1.6s)
  ok  69 [chromium] › tests\e2e\ads.spec.ts:251:5 › distância dos anúncios nos outros estados a 1280×800 › search dialog open without a result: the Oli keeps its distance (481ms)
resultado com a linha do café: menor vão 150 px
  ok  68 [chromium] › tests\e2e\ads.spec.ts:243:5 › distância dos anúncios nos outros estados a 1280×800 › with the result and the coffee line (777ms)
processando: menor vão 150 px
  ok  71 [chromium] › tests\e2e\ads.spec.ts:276:1 › the hub keeps its one content AdSlot under the grid of tools, at 360 and 1280px (374ms)
  ok  65 [chromium] › tests\e2e\ads.spec.ts:214:5 › distância dos anúncios nos outros estados a 1280×800 › while processing (WaterLevel on screen) (1.5s)
  ok  72 [chromium] › tests\e2e\ads.spec.ts:292:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (635ms)
lote com a fila, o comparador e os atalhos: menor vão 150 px
fila inteira: menor vão 150 px
  ok  67 [chromium] › tests\e2e\ads.spec.ts:230:5 › distância dos anúncios nos outros estados a 1280×800 › with a batch: the queue, the error row, the comparison and the chips (1.6s)
/compress-image/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 6 requisições
  ok  73 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/ fit the budgets, with no worker and no wasm (726ms)
/compress-image/to-100kb/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  74 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/to-100kb/ fit the budgets, with no worker and no wasm (716ms)
/compress-image/to-1mb/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  70 [chromium] › tests\e2e\ads.spec.ts:260:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (1.7s)
  ok  75 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/to-1mb/ fit the budgets, with no worker and no wasm (691ms)
/pt/comprimir-imagem/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 6 requisições
  ok  76 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /pt/comprimir-imagem/ fit the budgets, with no worker and no wasm (669ms)
/es/comprimir-imagen/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 6 requisições
  ok  77 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /es/comprimir-imagen/ fit the budgets, with no worker and no wasm (644ms)
/resize-image/ JS inicial: 19.7 KB gzip (2 arquivos + inline), 6 requisições
  ok  78 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /resize-image/ fit the budgets, with no worker and no wasm (685ms)
/resize-image/youtube-thumbnail/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  79 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /resize-image/youtube-thumbnail/ fit the budgets, with no worker and no wasm (670ms)
/crop-image/ JS inicial: 21.5 KB gzip (2 arquivos + inline), 6 requisições
  ok  81 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /crop-image/ fit the budgets, with no worker and no wasm (636ms)
/rotate-image/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 6 requisições
  ok  80 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /rotate-image/ fit the budgets, with no worker and no wasm (655ms)
/heic-to-jpg/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  82 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /heic-to-jpg/ fit the budgets, with no worker and no wasm (639ms)
/webp-to-jpg/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  83 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /webp-to-jpg/ fit the budgets, with no worker and no wasm (638ms)
/png-to-jpg/ JS inicial: 19.2 KB gzip (2 arquivos + inline), 6 requisições
  ok  84 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /png-to-jpg/ fit the budgets, with no worker and no wasm (620ms)
/image-to-pdf/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 6 requisições
  ok  85 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /image-to-pdf/ fit the budgets, with no worker and no wasm (630ms)
/image-tools/ JS inicial: 2.5 KB gzip (0 arquivos + inline), 4 requisições
  ok  86 [chromium] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /image-tools/ fit the budgets, with no worker and no wasm (620ms)
/compress-image/: 6 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/island.DBsX_fHS.js)
/: 4 requisições (/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/pt/comprimir-imagem/: 6 requisições (/pt/comprimir-imagem/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/compress-image/: 6 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/island.DBsX_fHS.js)
/compress-image/: 6 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/island.DBsX_fHS.js)
/privacy/: 1 novas (/privacy/)
  ok  87 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /privacy/ (1.2s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js)
  ok  88 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: / then /compress-image/ (1.2s)
/resize-image/: 6 requisições (/resize-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/ResizeImagePage.astro_astro_type_script_index_0_lang.CODDWett.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2, /_astro/island.DBsX_fHS.js)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok  89 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.1s)
/compress-image/to-100kb/: 2 novas (/compress-image/to-100kb/, /_astro/To100kbPage.astro_astro_type_script_index_0_lang.B-1pM6M9.js)
  ok  90 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /compress-image/to-100kb/ (1.1s)
/resize-image/: 2 novas (/resize-image/, /_astro/ResizeImagePage.astro_astro_type_script_index_0_lang.CODDWett.js)
  ok  91 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /resize-image/ (1.2s)
/image-tools/: 4 requisições (/image-tools/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /_astro/island.D61HCvby.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/crop-image/: 2 novas (/crop-image/, /_astro/CropImagePage.astro_astro_type_script_index_0_lang.C2iPy4ot.js)
  ok  92 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /resize-image/ then /crop-image/ (1.2s)
/heic-to-jpg/: 3 novas (/heic-to-jpg/, /_astro/HeicToJpgPage.astro_astro_type_script_index_0_lang.Cd4brf8g.js, /_astro/island.DBsX_fHS.js)
  ok  93 [chromium] › tests\e2e\budgets.spec.ts:79:3 › requests: /image-tools/ then /heic-to-jpg/ (1.2s)
  ok  97 [chromium] › tests\e2e\coffee.spec.ts:163:3 › coffee line rules (English) › "Don't show this again" is stored even if the cookie choice was withdrawn meanwhile (1.0s)
  ok  98 [chromium] › tests\e2e\coffee.spec.ts:172:3 › coffee line rules (English) › Decline after the line showed erases the count and stops the line, even 8 days later (1.6s)
  ok  96 [chromium] › tests\e2e\coffee.spec.ts:141:3 › coffee line rules (English) › "Don't show this again" hides the line at once, is stored and holds after 7 days and a reload (2.1s)
  ok  94 [chromium] › tests\e2e\coffee.spec.ts:73:3 › coffee line rules (English) › not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days (2.6s)
  ok  95 [chromium] › tests\e2e\coffee.spec.ts:122:3 › coffee line rules (English) › a batch is one use however many files it has, an option re-run is not another, and a batch with nothing written is none (2.8s)
  ok  99 [chromium] › tests\e2e\coffee.spec.ts:193:3 › no choice: four uses never show the line and nothing is stored (2.2s)
  ok 102 [chromium] › tests\e2e\coffee.spec.ts:229:3 › en: texts, placement, link target and donate_click with place result (1.1s)
  ok 100 [chromium] › tests\e2e\coffee.spec.ts:193:3 › Decline: four uses never show the line and nothing is stored (2.3s)
  ok 103 [chromium] › tests\e2e\coffee.spec.ts:229:3 › pt: texts, placement, link target and donate_click with place result (1.2s)
  ok 104 [chromium] › tests\e2e\coffee.spec.ts:229:3 › es: texts, placement, link target and donate_click with place result (1.0s)
  ok 108 [chromium] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (155ms)
  ok 109 [chromium] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (165ms)
  ok 105 [chromium] › tests\e2e\coffee.spec.ts:272:3 › support page /support/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (747ms)
  ok 106 [chromium] › tests\e2e\coffee.spec.ts:272:3 › support page /pt/apoie/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (695ms)
  ok 101 [chromium] › tests\e2e\coffee.spec.ts:209:1 › uses before the Accept are not counted: the count starts when the choice is granted (2.0s)
  ok 112 [chromium] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (226ms)
  ok 113 [chromium] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (185ms)
  ok 110 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (430ms)
  ok 107 [chromium] › tests\e2e\coffee.spec.ts:272:3 › support page /es/apoyo/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (677ms)
  ok 111 [chromium] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (436ms)
  ok 114 [chromium] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (357ms)
  ok 117 [chromium] › tests\e2e\design.spec.ts:66:3 › fonts › every page has exactly one font preload, the same Fredoka file, with crossorigin (180ms)
  ok 118 [chromium] › tests\e2e\design.spec.ts:161:7 › Oli boxes a 360×740 › tool page states › idle: wave (281ms)
  ok 119 [chromium] › tests\e2e\design.spec.ts:165:7 › Oli boxes a 360×740 › tool page states › a file over the drop zone: gulp (290ms)
  ok 116 [chromium] › tests\e2e\design.spec.ts:31:3 › fonts › first visit to the tool page: only the two latin woff2, once each, and a Fredoka-only preload (688ms)
  ok 122 [chromium] › tests\e2e\design.spec.ts:185:7 › Oli boxes a 360×740 › tool page states › error: oops (353ms)
  ok 121 [chromium] › tests\e2e\design.spec.ts:179:7 › Oli boxes a 360×740 › tool page states › result: cheer, and only one Oli inside the card (488ms)
  ok 124 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /: wave (165ms)
  ok 123 [chromium] › tests\e2e\design.spec.ts:190:7 › Oli boxes a 360×740 › tool page states › search without a result: the peek shows, and only then (436ms)
  ok 125 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /pt/: wave (160ms)
  ok 126 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /es/: wave (162ms)
  ok 127 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /404.html: lost (170ms)
  ok 128 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /pt/404.html: lost (156ms)
  ok 129 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /es/404.html: lost (162ms)
  ok 130 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /support/: coffee (165ms)
  ok 132 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /es/apoyo/: coffee (154ms)
  ok 131 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /pt/apoie/: coffee (171ms)
  ok 133 [chromium] › tests\e2e\design.spec.ts:161:7 › Oli boxes a 1280×800 › tool page states › idle: wave (331ms)
  ok 134 [chromium] › tests\e2e\design.spec.ts:165:7 › Oli boxes a 1280×800 › tool page states › a file over the drop zone: gulp (319ms)
  ok 120 [chromium] › tests\e2e\design.spec.ts:170:7 › Oli boxes a 360×740 › tool page states › processing: swim (1.5s)
  ok 136 [chromium] › tests\e2e\design.spec.ts:179:7 › Oli boxes a 1280×800 › tool page states › result: cheer, and only one Oli inside the card (627ms)
  ok 137 [chromium] › tests\e2e\design.spec.ts:185:7 › Oli boxes a 1280×800 › tool page states › error: oops (455ms)
  ok 139 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /: wave (208ms)
  ok 138 [chromium] › tests\e2e\design.spec.ts:190:7 › Oli boxes a 1280×800 › tool page states › search without a result: the peek shows, and only then (535ms)
  ok 140 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /pt/: wave (165ms)
  ok 141 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /es/: wave (168ms)
  ok 142 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /404.html: lost (171ms)
  ok 143 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /pt/404.html: lost (169ms)
  ok 144 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /es/404.html: lost (164ms)
  ok 145 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /support/: coffee (169ms)
  ok 115 [chromium] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.3s)
  ok 146 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /pt/apoie/: coffee (165ms)
  ok 147 [chromium] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /es/apoyo/: coffee (169ms)
  ok 135 [chromium] › tests\e2e\design.spec.ts:170:7 › Oli boxes a 1280×800 › tool page states › processing: swim (1.4s)
  ok 148 [chromium] › tests\e2e\design.spec.ts:251:5 › prefers-reduced-motion: reduce › tool page › idle (579ms)
  ok 149 [chromium] › tests\e2e\design.spec.ts:256:5 › prefers-reduced-motion: reduce › tool page › a file over the drop zone (596ms)
  ok 152 [chromium] › tests\e2e\design.spec.ts:278:5 › prefers-reduced-motion: reduce › tool page › error (620ms)
  ok 150 [chromium] › tests\e2e\design.spec.ts:272:5 › prefers-reduced-motion: reduce › tool page › result (746ms)
  ok 156 [chromium] › tests\e2e\design.spec.ts:305:3 › motion without the preference › idle: the wave floats in a loop (192ms)
  ok 154 [chromium] › tests\e2e\design.spec.ts:293:5 › prefers-reduced-motion: reduce › /support/ (417ms)
  ok 153 [chromium] › tests\e2e\design.spec.ts:284:5 › prefers-reduced-motion: reduce › tool page › result, start over and back to idle (663ms)
  ok 158 [chromium] › tests\e2e\design.spec.ts:324:3 › motion without the preference › support page: the coffee steam rises in a loop (113ms)
  ok 155 [chromium] › tests\e2e\design.spec.ts:293:5 › prefers-reduced-motion: reduce › /404.html (427ms)
  ok 159 [chromium] › tests\e2e\design.spec.ts:343:3 › largest contentful paint › on the tool page the LCP element is not the Oli nor an svg (215ms)
  ok 162 [chromium] › tests\e2e\design.spec.ts:451:3 › review regressions › the prose keeps its width when the webfont replaces the fallback (no CLS from 68ch) (301ms)
  ok 163 [chromium] › tests\e2e\design.spec.ts:470:3 › review regressions › the segmented option keeps a focus ring after an arrow key (291ms)
  ok 164 [chromium] › tests\e2e\design.spec.ts:484:3 › review regressions › the search placeholder is ink-muted, not the faint browser default (144ms)
  ok 151 [chromium] › tests\e2e\design.spec.ts:262:5 › prefers-reduced-motion: reduce › tool page › processing (1.6s)
  ok 166 [chromium] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (224ms)
  ok 165 [chromium] › tests\e2e\design.spec.ts:501:5 › review regressions › with reduced motion › a pressed button still sinks into its lip (269ms)
  ok 167 [chromium] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (276ms)
  ok 157 [chromium] › tests\e2e\design.spec.ts:312:3 › motion without the preference › processing: the swim loops (1.4s)
  ok 170 [chromium] › tests\e2e\events.spec.ts:56:1 › the cookie notice has Decline first, two neutral buttons and no yellow (381ms)
  ok 168 [chromium] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (701ms)
  ok 171 [chromium] › tests\e2e\events.spec.ts:66:1 › the cookie notice rises above the AdSense anchor instead of covering it (320ms)
  ok 161 [chromium] › tests\e2e\design.spec.ts:421:3 › review regressions › reflow: the ZIP button of pt and es and the crop handles stay inside the page from 320 px (1.6s)
  ok 173 [chromium] › tests\e2e\events.spec.ts:109:1 › an element focused under the cookie notice moves above it, even without scroll-padding (263ms)
  ok 174 [chromium] › tests\e2e\events.spec.ts:133:1 › the search dialog has a visible close button (286ms)
  ok 169 [chromium] › tests\e2e\events.spec.ts:41:1 › an English chip names the tool it leads to, and the preset page names itself (1.4s)
  ok 172 [chromium] › tests\e2e\events.spec.ts:86:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (1.3s)
  ok 175 [chromium] › tests\e2e\image-batch.spec.ts:47:3 › files that cannot be read, in the middle of a batch › the corrupted, the truncated, the empty and the text file each say why, the others come out, the page does not hang and a new batch works (1.1s)
  ok 178 [chromium] › tests\e2e\image-batch.spec.ts:141:3 › Ctrl+V › takes every image of the clipboard as one batch and leaves a file that is no image out (632ms)
  ok 179 [chromium] › tests\e2e\image-batch.spec.ts:161:3 › Ctrl+V › a paste aimed at a number field of the page is left alone, and the same paste anywhere else starts a batch (564ms)
  ok 177 [chromium] › tests\e2e\image-batch.spec.ts:127:3 › N files, N outputs › more than 6 files show 6 rows and "Show 3 more", which shows the rest (1.5s)
  ok 180 [chromium] › tests\e2e\image-batch.spec.ts:151:3 › Ctrl+V › a paste with no image, or one aimed at the search field, is left alone (459ms)
  ok 160 [chromium] › tests\e2e\design.spec.ts:389:3 › review regressions › reflow at 320px: no page and no tool state scrolls sideways (4.5s)
  ok 176 [chromium] › tests\e2e\image-batch.spec.ts:90:3 › N files, N outputs › one ZIP with unique names that opens, every row hands out what the ZIP holds, and a single file downloads as it is (3.4s)
  ok 185 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › crop-image: 16 files in one batch (2.6s)
  ok 183 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › compress-image-rest: 13 files in one batch (5.9s)
  ok 184 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › resize-image: 16 files in one batch (6.1s)
  ok 182 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › compress-image-photos: 9 files in one batch (6.4s)
  ok 190 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › webp-to-jpg: 10 files in one batch (1.3s)
  ok 186 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › rotate-image: 16 files in one batch (6.3s)
  ok 181 [chromium] › tests\e2e\image-crop.spec.ts:94:3 › crop-image with the keyboard only › focus order, arrows, Shift with the arrows, the fields, Free and the queue (8.5s)
  ok 191 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-png: 7 files in one batch (1.2s)
  ok 187 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-a: 13 files in one batch (8.5s)
  ok 189 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-png: 5 files in one batch (7.0s)
  ok 188 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-b: 7 files in one batch (7.7s)
  ok 192 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-photos: 8 files in one batch (5.8s)
  ok 198 [chromium] › tests\e2e\image-privacy.spec.ts:35:3 › no isolation headers, no multi-thread build › no page, script or .wasm is sent with COOP or COEP (521ms)
  ok 199 [chromium] › tests\e2e\image-privacy.spec.ts:47:3 › no isolation headers, no multi-thread build › the dist has no multi-thread codec, no worker helper and not a SharedArrayBuffer (46ms)
  ok 200 [chromium] › tests\e2e\image-privacy.spec.ts:66:3 › no isolation headers, no multi-thread build › the libheif .wasm in the dist is the unmodified file of the package, served as wasm and immutable (145ms)
  ok 194 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › image-to-pdf: 16 files in one batch (6.0s)
  ok 201 [chromium] › tests\e2e\image-privacy.spec.ts:89:3 › while processing › the page is not cross-origin isolated, and libheif comes to a HEIC as the unmodified file (882ms)
  ok 197 [chromium] › tests\e2e\image-presets.spec.ts:149:1 › resize-image/youtube-thumbnail: 1280 × 720 JPG of at most 2,000,000 bytes, cut from the centre, with the chip to Crop image (3.3s)
  ok 193 [chromium] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-rest: 8 files in one batch (9.4s)
  ok 196 [chromium] › tests\e2e\image-presets.spec.ts:90:3 › compress-image/to-1mb: every output is a JPG of at most 1,000,000 bytes, what already fits comes back as it is (5.0s)
  ok 195 [chromium] › tests\e2e\image-presets.spec.ts:90:3 › compress-image/to-100kb: every output is a JPG of at most 100,000 bytes, what already fits comes back as it is (6.4s)
  ok 206 [chromium] › tests\e2e\image-smoke.spec.ts:242:3 › heic-to-jpg › choosing PNG after a HEIC is on screen gives the PNG of the same main image (1.3s)
  ok 207 [chromium] › tests\e2e\image-smoke.spec.ts:253:3 › webp-to-jpg › the result says an animation became its first frame, and PNG on request gives PNG files (1.1s)
  ok 202 [chromium] › tests\e2e\image-privacy.spec.ts:142:1 › Resize image: a picture above the canvas limit takes the path without a canvas, one below it does not (5.3s)
  ok 205 [chromium] › tests\e2e\image-smoke.spec.ts:210:3 › rotate-image › Left 90°, 180° and a mirror turn the whole batch the way they say (2.8s)
  ok 203 [chromium] › tests\e2e\image-smoke.spec.ts:95:3 › resize-image › the fields mirror half of the first photo, and the options change what comes out (5.3s)
  ok 204 [chromium] › tests\e2e\image-smoke.spec.ts:130:3 › crop-image › Square by default, then the box moves by keyboard and by pointer, and only the picked photo changes (4.6s)
  ok 208 [chromium] › tests\e2e\image-smoke.spec.ts:264:3 › image-to-pdf › the sheet changes only the PDF: Letter and A4 put every image on a sheet, in the order of the list (2.9s)
  ok 210 [chromium] › tests\e2e\image-smoke.spec.ts:336:3 › axe on the option states › crop editor with a result: the box, the handles, the four fields and a batch of two (2.3s)
  ok 209 [chromium] › tests\e2e\image-smoke.spec.ts:287:3 › crop-image with the keyboard only › Tab from the ratio reaches the box, the arrows move and resize it, Tab goes on to the fields (2.9s)
  ok 215 [chromium] › tests\e2e\island.spec.ts:50:3 › a batch › when every file fails the drop zone says so once and the rows say why (731ms)
  ok 213 [chromium] › tests\e2e\image-smoke.spec.ts:372:3 › typed numbers › what is typed in Resize and Crop never reaches the URL or an event (1.9s)
  ok 216 [chromium] › tests\e2e\island.spec.ts:89:3 › a batch › changing the level re-processes the whole batch at once and keeps the focus on the option (858ms)
  ok 218 [chromium] › tests\e2e\island.spec.ts:130:3 › drop › a drag that carries text is not taken over (316ms)
  ok 214 [chromium] › tests\e2e\island.spec.ts:26:3 › a batch › the WaterLevel counts the batch ("0%, 0 of 3 images") and the queue shows working and waiting rows (1.8s)
  ok 217 [chromium] › tests\e2e\island.spec.ts:121:3 › drop › a drop on the result card starts a new batch and the browser never opens the file (887ms)
  ok 220 [chromium] › tests\e2e\island.spec.ts:167:3 › the comparison › appears with the card, is named, starts at 50 and moves with the arrow keys (753ms)
  ok 219 [chromium] › tests\e2e\island.spec.ts:143:3 › events › one tool_start and one tool_complete per batch, one tool_error per failed file, a download per click (924ms)
  ok 224 [chromium] › tests\e2e\navigation.spec.ts:5:1 › a missing page gets the nearest 404 of its language, with status 404 (332ms)
  ok 222 [chromium] › tests\e2e\island.spec.ts:196:3 › the comparison › picks the file of the queue it shows (765ms)
  ok 225 [chromium] › tests\e2e\navigation.spec.ts:18:1 › pages are served with the generated headers (no X-Robots-Tag since the launch, noindex on the 404) (77ms)
  ok 212 [chromium] › tests\e2e\image-smoke.spec.ts:358:3 › axe on the option states › the options of Image to PDF and Rotate with a result (4.3s)
  ok 211 [chromium] › tests\e2e\image-smoke.spec.ts:344:3 › axe on the option states › resize fields, one of them in error (4.7s)
  ok 226 [chromium] › tests\e2e\navigation.spec.ts:36:1 › on a page that exists only in English, the language menu leads to the home of each language (279ms)
  ok 223 [chromium] › tests\e2e\island.spec.ts:207:1 › Start over lets go of the object URLs of the batch (743ms)
  ok 229 [chromium] › tests\e2e\navigation.spec.ts:78:1 › the search shows only the pages that exist in the language and never falls back to English (270ms)
  ok 227 [chromium] › tests\e2e\navigation.spec.ts:43:1 › the language button goes to the equivalent page (529ms)
  ok 233 [chromium] › tests\e2e\navigation.spec.ts:152:1 › trailing slash: a path without it redirects (8ms)
  ok 231 [chromium] › tests\e2e\navigation.spec.ts:126:1 › the search box lists every page on a phone and scrolls, so the Close button stays on screen (303ms)
  ok 221 [chromium] › tests\e2e\island.spec.ts:181:3 › the comparison › sits inside the card from 768px and under it on the phone, without moving the Download (1.6s)
  ok 230 [chromium] › tests\e2e\navigation.spec.ts:98:1 › the English search finds the new tools and presets and opens the one chosen (426ms)
  ok 232 [chromium] › tests\e2e\navigation.spec.ts:144:1 › the 404 page has a working tool search (197ms)
  ok 228 [chromium] › tests\e2e\navigation.spec.ts:53:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (977ms)
  ok 238 [chromium] › tests\e2e\tool.spec.ts:105:3 › Compress image (shared island) › a file the browser cannot decode shows the Oli error in text, with role alert (490ms)
  ok 237 [chromium] › tests\e2e\tool.spec.ts:73:3 › Compress image (shared island) › without gain, the original goes back without metadata and the text says so (919ms)
  ok 240 [chromium] › tests\e2e\tool.spec.ts:115:3 › Compress image (shared island) › an unsupported type is refused with the same message (428ms)
  ok 235 [chromium] › tests\e2e\tool.spec.ts:41:3 › Compress image (shared island) › the work runs in the Web Worker where the browser supports OffscreenCanvas (2.2s)
  ok 234 [chromium] › tests\e2e\tool.spec.ts:17:3 › Compress image (shared island) › the fixture really has GPS, and the compressed copy has no metadata at all (2.3s)
  ok 239 [chromium] › tests\e2e\tool.spec.ts:120:3 › Compress image (shared island) › events carry only the listed parameters and never the file name (1.9s)
  ok 243 [chromium] › tests\e2e\tool.spec.ts:178:1 › Image to PDF: "Show 1 more" puts the focus on the first new row, and a new sheet is announced again (948ms)
  ok 241 [chromium] › tests\e2e\tool.spec.ts:146:3 › Compress image (shared island) › the result offers the next step and Start over returns to the drop zone (2.3s)
  ok 236 [chromium] › tests\e2e\tool.spec.ts:51:3 › Compress image (shared island) › changing the option re-processes at once, without an Apply button, and keeps the focus (4.4s)
  ok 242 [chromium] › tests\e2e\tool.spec.ts:163:1 › the tool works in Portuguese and Spanish too (3.7s)
  ok 244 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › / (1.7s)
  ok 245 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/ (1.7s)
  ok 246 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/ (1.8s)
  ok 247 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/ (2.4s)
  ok 248 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /image-tools/ (1.8s)
  ok 249 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /resize-image/ (2.2s)
  ok 250 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/comprimir-imagem/ (2.1s)
  ok 251 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/comprimir-imagen/ (2.1s)
  ok 252 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /crop-image/ (2.2s)
  ok 253 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /rotate-image/ (2.2s)
  ok 254 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /heic-to-jpg/ (2.2s)
  ok 255 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /webp-to-jpg/ (2.2s)
  ok 256 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /png-to-jpg/ (2.1s)
  ok 257 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /image-to-pdf/ (2.2s)
  ok 258 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/to-100kb/ (2.1s)
  ok 259 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /compress-image/to-1mb/ (2.2s)
  ok 260 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /resize-image/youtube-thumbnail/ (2.1s)
  ok 261 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /privacy/ (1.9s)
  ok 262 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/privacidade/ (1.9s)
  ok 264 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /terms/ (1.8s)
  ok 263 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/privacidad/ (1.9s)
  ok 265 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/termos/ (1.8s)
  ok 266 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/terminos/ (1.8s)
  ok 267 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /about/ (1.7s)
  ok 268 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/sobre/ (1.7s)
  ok 270 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /contact/ (1.6s)
  ok 269 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/acerca-de/ (1.6s)
  ok 271 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/contato/ (1.7s)
  ok 272 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/contacto/ (1.7s)
  ok 276 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /support/ (1.6s)
  ok 273 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /licenses/ (2.4s)
  ok 274 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/licencas/ (2.3s)
  ok 275 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/licencias/ (2.4s)
  ok 277 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/apoie/ (1.6s)
  ok 278 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/apoyo/ (1.7s)
  ok 279 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /404.html (1.7s)
  ok 280 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /pt/404.html (1.7s)
  ok 281 [webkit] › tests\e2e\a11y.spec.ts:39:5 › axe em toda página, a 360 e 1280px, nos temas escuro e claro › /es/404.html (1.7s)
  ok 284 [webkit] › tests\e2e\a11y.spec.ts:110:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search dialog open with every page listed (2.0s)
  ok 283 [webkit] › tests\e2e\a11y.spec.ts:105:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search dialog open (2.2s)
  ok 286 [webkit] › tests\e2e\a11y.spec.ts:120:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › search without a result (peek visible) (2.0s)
  ok 282 [webkit] › tests\e2e\a11y.spec.ts:100:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › tool page with the result on screen (3.1s)
  ok 285 [webkit] › tests\e2e\a11y.spec.ts:115:3 › axe nos estados da ferramenta e da busca, a 360 e 1280px, nos temas escuro e claro › tool page with the coffee line on screen (3.2s)
  ok 288 [webkit] › tests\e2e\a11y.spec.ts:146:3 › axe com um lote na tela, a 360 e 1280px, nos temas escuro e claro › the WaterLevel with the batch count, a working row and waiting rows (3.3s)
  ok 287 [webkit] › tests\e2e\a11y.spec.ts:132:3 › axe com um lote na tela, a 360 e 1280px, nos temas escuro e claro › the queue with ready and error rows, the batch card and the comparison (4.3s)
/compress-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 290 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/: at rest, while processing, with the result and with a batch (3.2s)
/compress-image/to-100kb/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 291 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/to-100kb/: at rest, while processing, with the result and with a batch (4.3s)
  ok 289 [webkit] › tests\e2e\a11y.spec.ts:168:3 › axe com arquivo recusado, a 360 e 1280px, nos temas escuro e claro › a HEIC refused by Compress image, in the drop zone and in a row, with the link to HEIC to JPG (5.5s)
/resize-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 293 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /resize-image/: at rest, while processing, with the result and with a batch (3.4s)
/compress-image/to-1mb/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 292 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /compress-image/to-1mb/: at rest, while processing, with the result and with a batch (5.3s)
/resize-image/youtube-thumbnail/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 294 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /resize-image/youtube-thumbnail/: at rest, while processing, with the result and with a batch (4.1s)
/crop-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 295 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /crop-image/: at rest, while processing, with the result and with a batch (3.8s)
/rotate-image/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 296 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /rotate-image/: at rest, while processing, with the result and with a batch (3.2s)
arquivo em cima: menor vão 166 px
  ok 301 [webkit] › tests\e2e\ads.spec.ts:208:5 › distância dos anúncios nos outros estados a 360×740 › with a file over the drop zone (721ms)
/heic-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 297 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /heic-to-jpg/: at rest, while processing, with the result and with a batch (3.8s)
erro: menor vão 166 px
  ok 303 [webkit] › tests\e2e\ads.spec.ts:224:5 › distância dos anúncios nos outros estados a 360×740 › with the error message (866ms)
processando: menor vão 166 px
  ok 302 [webkit] › tests\e2e\ads.spec.ts:214:5 › distância dos anúncios nos outros estados a 360×740 › while processing (WaterLevel on screen) (1.5s)
/webp-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 298 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /webp-to-jpg/: at rest, while processing, with the result and with a batch (3.6s)
/png-to-jpg/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
resultado com a linha do café: menor vão 166 px
  ok 299 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /png-to-jpg/: at rest, while processing, with the result and with a batch (3.4s)
  ok 305 [webkit] › tests\e2e\ads.spec.ts:243:5 › distância dos anúncios nos outros estados a 360×740 › with the result and the coffee line (1.2s)
/image-to-pdf/ menor vão: repouso: 360px 166, 1280px 150 | processando: 1280px 150, 360px 166 | resultado: 360px 166, 1280px 150 | fila: 1280px 150, 360px 166
  ok 300 [webkit] › tests\e2e\ads.spec.ts:122:5 › distância dos anúncios a 360×740 e a 1280×800 › /image-to-pdf/: at rest, while processing, with the result and with a batch (3.4s)
busca sem resultado: menor vão 607 px
  ok 306 [webkit] › tests\e2e\ads.spec.ts:251:5 › distância dos anúncios nos outros estados a 360×740 › search dialog open without a result: the Oli keeps its distance (1.0s)
arquivo em cima: menor vão 150 px
  ok 307 [webkit] › tests\e2e\ads.spec.ts:208:5 › distância dos anúncios nos outros estados a 1280×800 › with a file over the drop zone (1.0s)
lote com a fila, o comparador e os atalhos: menor vão 166 px
fila inteira: menor vão 166 px
  ok 304 [webkit] › tests\e2e\ads.spec.ts:230:5 › distância dos anúncios nos outros estados a 360×740 › with a batch: the queue, the error row, the comparison and the chips (2.3s)
erro: menor vão 150 px
  ok 309 [webkit] › tests\e2e\ads.spec.ts:224:5 › distância dos anúncios nos outros estados a 1280×800 › with the error message (1.2s)
processando: menor vão 150 px
  ok 314 [webkit] › tests\e2e\ads.spec.ts:276:1 › the hub keeps its one content AdSlot under the grid of tools, at 360 and 1280px (550ms)
resultado com a linha do café: menor vão 150 px
  ok 311 [webkit] › tests\e2e\ads.spec.ts:243:5 › distância dos anúncios nos outros estados a 1280×800 › with the result and the coffee line (1.6s)
busca sem resultado: menor vão 168 px
  ok 312 [webkit] › tests\e2e\ads.spec.ts:251:5 › distância dos anúncios nos outros estados a 1280×800 › search dialog open without a result: the Oli keeps its distance (1.3s)
  ok 308 [webkit] › tests\e2e\ads.spec.ts:214:5 › distância dos anúncios nos outros estados a 1280×800 › while processing (WaterLevel on screen) (2.1s)
lote com a fila, o comparador e os atalhos: menor vão 150 px
/compress-image/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 7 requisições
  ok 316 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/ fit the budgets, with no worker and no wasm (944ms)
/compress-image/to-100kb/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 317 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/to-100kb/ fit the budgets, with no worker and no wasm (896ms)
/compress-image/to-1mb/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 318 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /compress-image/to-1mb/ fit the budgets, with no worker and no wasm (874ms)
fila inteira: menor vão 150 px
  ok 310 [webkit] › tests\e2e\ads.spec.ts:230:5 › distância dos anúncios nos outros estados a 1280×800 › with a batch: the queue, the error row, the comparison and the chips (2.9s)
  ok 315 [webkit] › tests\e2e\ads.spec.ts:292:1 › the AdSlot shows the accepted label per language, reserves its height and loads nothing without the variables (1.5s)
/pt/comprimir-imagem/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 7 requisições
  ok 319 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /pt/comprimir-imagem/ fit the budgets, with no worker and no wasm (834ms)
/es/comprimir-imagen/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 7 requisições
  ok 320 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /es/comprimir-imagen/ fit the budgets, with no worker and no wasm (855ms)
/resize-image/ JS inicial: 19.7 KB gzip (2 arquivos + inline), 7 requisições
  ok 321 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /resize-image/ fit the budgets, with no worker and no wasm (843ms)
/resize-image/youtube-thumbnail/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 322 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /resize-image/youtube-thumbnail/ fit the budgets, with no worker and no wasm (833ms)
/crop-image/ JS inicial: 21.5 KB gzip (2 arquivos + inline), 7 requisições
  ok 323 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /crop-image/ fit the budgets, with no worker and no wasm (790ms)
/rotate-image/ JS inicial: 19.4 KB gzip (2 arquivos + inline), 7 requisições
  ok 324 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /rotate-image/ fit the budgets, with no worker and no wasm (802ms)
/heic-to-jpg/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 325 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /heic-to-jpg/ fit the budgets, with no worker and no wasm (785ms)
/webp-to-jpg/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 326 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /webp-to-jpg/ fit the budgets, with no worker and no wasm (812ms)
/png-to-jpg/ JS inicial: 19.2 KB gzip (2 arquivos + inline), 7 requisições
  ok 327 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /png-to-jpg/ fit the budgets, with no worker and no wasm (842ms)
  ok 313 [webkit] › tests\e2e\ads.spec.ts:260:1 › legal, institutional, home and 404 pages have no AdSlot and no ad code (3.9s)
/image-to-pdf/ JS inicial: 19.3 KB gzip (2 arquivos + inline), 7 requisições
  ok 328 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /image-to-pdf/ fit the budgets, with no worker and no wasm (801ms)
/image-tools/ JS inicial: 2.5 KB gzip (0 arquivos + inline), 5 requisições
  ok 329 [webkit] › tests\e2e\budgets.spec.ts:43:3 › initial JS and requests of /image-tools/ fit the budgets, with no worker and no wasm (839ms)
/compress-image/: 7 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/: 5 requisições (/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/pt/comprimir-imagem/: 7 requisições (/pt/comprimir-imagem/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-pt.webmanifest, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/compress-image/: 7 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/compress-image/: 7 requisições (/compress-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/privacy/: 1 novas (/privacy/)
  ok 330 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /privacy/ (1.4s)
/compress-image/: 3 novas (/compress-image/, /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.DlX3QMeo.js, /_astro/island.DBsX_fHS.js)
  ok 331 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: / then /compress-image/ (1.4s)
/resize-image/: 7 requisições (/resize-image/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/ResizeImagePage.astro_astro_type_script_index_0_lang.CODDWett.js, /_astro/island.DBsX_fHS.js, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/pt/sobre/: 1 novas (/pt/sobre/)
  ok 332 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /pt/comprimir-imagem/ then /pt/sobre/ (1.3s)
/compress-image/to-100kb/: 2 novas (/compress-image/to-100kb/, /_astro/To100kbPage.astro_astro_type_script_index_0_lang.B-1pM6M9.js)
/resize-image/: 2 novas (/resize-image/, /_astro/ResizeImagePage.astro_astro_type_script_index_0_lang.CODDWett.js)
  ok 333 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /compress-image/to-100kb/ (1.3s)
  ok 334 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /compress-image/ then /resize-image/ (1.3s)
/crop-image/: 2 novas (/crop-image/, /_astro/CropImagePage.astro_astro_type_script_index_0_lang.C2iPy4ot.js)
  ok 335 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /resize-image/ then /crop-image/ (1.3s)
/image-tools/: 5 requisições (/image-tools/, /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2, /manifest-en.webmanifest, /_astro/island.D61HCvby.css, /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2)
/heic-to-jpg/: 3 novas (/heic-to-jpg/, /_astro/HeicToJpgPage.astro_astro_type_script_index_0_lang.Cd4brf8g.js, /_astro/island.DBsX_fHS.js)
  ok 336 [webkit] › tests\e2e\budgets.spec.ts:79:3 › requests: /image-tools/ then /heic-to-jpg/ (1.4s)
  ok 339 [webkit] › tests\e2e\coffee.spec.ts:163:3 › coffee line rules (English) › "Don't show this again" is stored even if the cookie choice was withdrawn meanwhile (2.6s)
  ok 338 [webkit] › tests\e2e\coffee.spec.ts:122:3 › coffee line rules (English) › a batch is one use however many files it has, an option re-run is not another, and a batch with nothing written is none (4.3s)
  ok 341 [webkit] › tests\e2e\coffee.spec.ts:172:3 › coffee line rules (English) › Decline after the line showed erases the count and stops the line, even 8 days later (3.9s)
  ok 340 [webkit] › tests\e2e\coffee.spec.ts:141:3 › coffee line rules (English) › "Don't show this again" hides the line at once, is stored and holds after 7 days and a reload (4.5s)
  ok 337 [webkit] › tests\e2e\coffee.spec.ts:73:3 › coffee line rules (English) › not on the 1st or 2nd use, on the 3rd, not again the same day, and again after 7 days (5.3s)
  ok 342 [webkit] › tests\e2e\coffee.spec.ts:193:3 › no choice: four uses never show the line and nothing is stored (3.9s)
  ok 348 [webkit] › tests\e2e\coffee.spec.ts:272:3 › support page /support/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (927ms)
  ok 343 [webkit] › tests\e2e\coffee.spec.ts:193:3 › Decline: four uses never show the line and nothing is stored (4.1s)
  ok 349 [webkit] › tests\e2e\coffee.spec.ts:272:3 › support page /pt/apoie/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (980ms)
  ok 345 [webkit] › tests\e2e\coffee.spec.ts:229:3 › en: texts, placement, link target and donate_click with place result (2.9s)
  ok 351 [webkit] › tests\e2e\consent.spec.ts:14:3 › Consent Mode v2 e aviso de cookies › consent defaults come before config, denied by region and granted elsewhere (356ms)
  ok 350 [webkit] › tests\e2e\coffee.spec.ts:272:3 › support page /es/apoyo/: card title as H1, the coffee Oli, the Ko-fi link and no other origin (887ms)
  ok 352 [webkit] › tests\e2e\consent.spec.ts:32:3 › Consent Mode v2 e aviso de cookies › page_location never carries the query string or the hash (426ms)
  ok 347 [webkit] › tests\e2e\coffee.spec.ts:229:3 › es: texts, placement, link target and donate_click with place result (2.8s)
  ok 346 [webkit] › tests\e2e\coffee.spec.ts:229:3 › pt: texts, placement, link target and donate_click with place result (3.4s)
  ok 355 [webkit] › tests\e2e\consent.spec.ts:59:3 › Consent Mode v2 e aviso de cookies › the notice stays hidden where __tcfapi says GDPR applies (437ms)
  ok 356 [webkit] › tests\e2e\consent.spec.ts:70:3 › Consent Mode v2 e aviso de cookies › the notice shows where __tcfapi says GDPR does not apply (411ms)
  ok 344 [webkit] › tests\e2e\coffee.spec.ts:209:1 › uses before the Accept are not counted: the count starts when the choice is granted (4.4s)
  ok 353 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Accept updates consent and the notice never comes back (1.3s)
  ok 360 [webkit] › tests\e2e\design.spec.ts:66:3 › fonts › every page has exactly one font preload, the same Fredoka file, with crossorigin (174ms)
  ok 357 [webkit] › tests\e2e\consent.spec.ts:80:3 › Consent Mode v2 e aviso de cookies › the privacy page button reopens the choice (992ms)
  ok 354 [webkit] › tests\e2e\consent.spec.ts:39:5 › Consent Mode v2 e aviso de cookies › Decline updates consent and the notice never comes back (1.4s)
  ok 359 [webkit] › tests\e2e\design.spec.ts:31:3 › fonts › first visit to the tool page: only the two latin woff2, once each, and a Fredoka-only preload (837ms)
  ok 361 [webkit] › tests\e2e\design.spec.ts:161:7 › Oli boxes a 360×740 › tool page states › idle: wave (723ms)
  ok 362 [webkit] › tests\e2e\design.spec.ts:165:7 › Oli boxes a 360×740 › tool page states › a file over the drop zone: gulp (750ms)
  ok 367 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /: wave (370ms)
  ok 365 [webkit] › tests\e2e\design.spec.ts:185:7 › Oli boxes a 360×740 › tool page states › error: oops (905ms)
  ok 368 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /pt/: wave (382ms)
  ok 364 [webkit] › tests\e2e\design.spec.ts:179:7 › Oli boxes a 360×740 › tool page states › result: cheer, and only one Oli inside the card (1.2s)
  ok 369 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › home /es/: wave (394ms)
  ok 363 [webkit] › tests\e2e\design.spec.ts:170:7 › Oli boxes a 360×740 › tool page states › processing: swim (1.6s)
  ok 370 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /404.html: lost (348ms)
  ok 371 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /pt/404.html: lost (341ms)
  ok 366 [webkit] › tests\e2e\design.spec.ts:190:7 › Oli boxes a 360×740 › tool page states › search without a result: the peek shows, and only then (1.3s)
  ok 358 [webkit] › tests\e2e\consent.spec.ts:90:3 › Consent Mode v2 e aviso de cookies › no gtag.js and no request to Google outside fileorca.com (2.7s)
  ok 372 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › 404 /es/404.html: lost (370ms)
  ok 373 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /support/: coffee (371ms)
  ok 374 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /pt/apoie/: coffee (388ms)
  ok 375 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 360×740 › other pages › support /es/apoyo/: coffee (385ms)
  ok 376 [webkit] › tests\e2e\design.spec.ts:161:7 › Oli boxes a 1280×800 › tool page states › idle: wave (944ms)
  ok 377 [webkit] › tests\e2e\design.spec.ts:165:7 › Oli boxes a 1280×800 › tool page states › a file over the drop zone: gulp (986ms)
  ok 382 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /: wave (424ms)
  ok 380 [webkit] › tests\e2e\design.spec.ts:185:7 › Oli boxes a 1280×800 › tool page states › error: oops (1.1s)
  ok 383 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /pt/: wave (440ms)
  ok 379 [webkit] › tests\e2e\design.spec.ts:179:7 › Oli boxes a 1280×800 › tool page states › result: cheer, and only one Oli inside the card (1.6s)
  ok 384 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › home /es/: wave (407ms)
  ok 385 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /404.html: lost (402ms)
  ok 386 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /pt/404.html: lost (420ms)
  ok 378 [webkit] › tests\e2e\design.spec.ts:170:7 › Oli boxes a 1280×800 › tool page states › processing: swim (2.0s)
  ok 381 [webkit] › tests\e2e\design.spec.ts:190:7 › Oli boxes a 1280×800 › tool page states › search without a result: the peek shows, and only then (1.9s)
  ok 387 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › 404 /es/404.html: lost (443ms)
  ok 388 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /support/: coffee (494ms)
  ok 389 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /pt/apoie/: coffee (489ms)
  ok 390 [webkit] › tests\e2e\design.spec.ts:214:11 › Oli boxes a 1280×800 › other pages › support /es/apoyo/: coffee (440ms)
  ok 391 [webkit] › tests\e2e\design.spec.ts:251:5 › prefers-reduced-motion: reduce › tool page › idle (1.0s)
  ok 392 [webkit] › tests\e2e\design.spec.ts:256:5 › prefers-reduced-motion: reduce › tool page › a file over the drop zone (1.0s)
  ok 395 [webkit] › tests\e2e\design.spec.ts:278:5 › prefers-reduced-motion: reduce › tool page › error (1.1s)
  ok 394 [webkit] › tests\e2e\design.spec.ts:272:5 › prefers-reduced-motion: reduce › tool page › result (1.2s)
  ok 397 [webkit] › tests\e2e\design.spec.ts:293:5 › prefers-reduced-motion: reduce › /support/ (577ms)
  ok 398 [webkit] › tests\e2e\design.spec.ts:293:5 › prefers-reduced-motion: reduce › /404.html (564ms)
  ok 396 [webkit] › tests\e2e\design.spec.ts:284:5 › prefers-reduced-motion: reduce › tool page › result, start over and back to idle (1.4s)
  ok 393 [webkit] › tests\e2e\design.spec.ts:262:5 › prefers-reduced-motion: reduce › tool page › processing (1.8s)
  ok 401 [webkit] › tests\e2e\design.spec.ts:324:3 › motion without the preference › support page: the coffee steam rises in a loop (348ms)
  ok 399 [webkit] › tests\e2e\design.spec.ts:305:3 › motion without the preference › idle: the wave floats in a loop (728ms)
  ok 402 [webkit] › tests\e2e\design.spec.ts:343:3 › largest contentful paint › on the tool page the LCP element is not the Oli nor an svg (471ms)
  ok 407 [webkit] › tests\e2e\design.spec.ts:484:3 › review regressions › the search placeholder is ink-muted, not the faint browser default (342ms)
  ok 405 [webkit] › tests\e2e\design.spec.ts:451:3 › review regressions › the prose keeps its width when the webfont replaces the fallback (no CLS from 68ch) (779ms)
  ok 406 [webkit] › tests\e2e\design.spec.ts:470:3 › review regressions › the segmented option keeps a focus ring after an arrow key (1.0s)
  ok 408 [webkit] › tests\e2e\design.spec.ts:501:5 › review regressions › with reduced motion › a pressed button still sinks into its lip (617ms)
  ok 400 [webkit] › tests\e2e\design.spec.ts:312:3 › motion without the preference › processing: the swim loops (1.8s)
  ok 409 [webkit] › tests\e2e\events.spec.ts:10:1 › the footer coffee link sends donate_click with place footer and the language (621ms)
  ok 410 [webkit] › tests\e2e\events.spec.ts:17:1 › the support page button links to Ko-fi without any Ko-fi script and sends donate_click (664ms)
  ok 413 [webkit] › tests\e2e\events.spec.ts:56:1 › the cookie notice has Decline first, two neutral buttons and no yellow (464ms)
  ok 414 [webkit] › tests\e2e\events.spec.ts:66:1 › the cookie notice rises above the AdSense anchor instead of covering it (470ms)
  ok 416 [webkit] › tests\e2e\events.spec.ts:109:1 › an element focused under the cookie notice moves above it, even without scroll-padding (533ms)
  ok 411 [webkit] › tests\e2e\events.spec.ts:27:1 › the next-step chip sends next_step_click (1.8s)
  ok 404 [webkit] › tests\e2e\design.spec.ts:421:3 › review regressions › reflow: the ZIP button of pt and es and the crop handles stay inside the page from 320 px (3.6s)
  ok 412 [webkit] › tests\e2e\events.spec.ts:41:1 › an English chip names the tool it leads to, and the preset page names itself (2.3s)
  ok 417 [webkit] › tests\e2e\events.spec.ts:133:1 › the search dialog has a visible close button (1.0s)
  ok 415 [webkit] › tests\e2e\events.spec.ts:86:1 › the cookie notice never covers the keyboard focus (WCAG 2.4.11) (2.9s)
  ok 421 [webkit] › tests\e2e\image-batch.spec.ts:141:3 › Ctrl+V › takes every image of the clipboard as one batch and leaves a file that is no image out (1.4s)
  ok 418 [webkit] › tests\e2e\image-batch.spec.ts:47:3 › files that cannot be read, in the middle of a batch › the corrupted, the truncated, the empty and the text file each say why, the others come out, the page does not hang and a new batch works (2.7s)
  ok 422 [webkit] › tests\e2e\image-batch.spec.ts:151:3 › Ctrl+V › a paste with no image, or one aimed at the search field, is left alone (978ms)
  ok 403 [webkit] › tests\e2e\design.spec.ts:389:3 › review regressions › reflow at 320px: no page and no tool state scrolls sideways (6.7s)
  ok 420 [webkit] › tests\e2e\image-batch.spec.ts:127:3 › N files, N outputs › more than 6 files show 6 rows and "Show 3 more", which shows the rest (2.8s)
  ok 423 [webkit] › tests\e2e\image-batch.spec.ts:161:3 › Ctrl+V › a paste aimed at a number field of the page is left alone, and the same paste anywhere else starts a batch (1.6s)
  ok 419 [webkit] › tests\e2e\image-batch.spec.ts:90:3 › N files, N outputs › one ZIP with unique names that opens, every row hands out what the ZIP holds, and a single file downloads as it is (5.1s)
  ok 428 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › crop-image: 16 files in one batch (6.1s)
  ok 427 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › compress-image-rest: 13 files in one batch (6.7s)
  ok 425 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › compress-image-photos: 9 files in one batch (7.6s)
  ok 426 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › resize-image: 16 files in one batch (7.5s)
  ok 424 [webkit] › tests\e2e\image-crop.spec.ts:94:3 › crop-image with the keyboard only › focus order, arrows, Shift with the arrows, the fields, Free and the queue (10.5s)
  ok 433 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › webp-to-jpg: 10 files in one batch (2.8s)
  ok 434 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-png: 7 files in one batch (2.1s)
  ok 429 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › rotate-image: 16 files in one batch (9.9s)
  ok 431 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-b: 7 files in one batch (9.3s)
  ok 430 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-a: 13 files in one batch (10.5s)
  ok 432 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › heic-to-jpg-png: 5 files in one batch (10.6s)
  ok 436 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-rest: 8 files in one batch (7.2s)
  ok 435 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › png-to-jpg-photos: 8 files in one batch (9.1s)
  ok 442 [webkit] › tests\e2e\image-privacy.spec.ts:47:3 › no isolation headers, no multi-thread build › the dist has no multi-thread codec, no worker helper and not a SharedArrayBuffer (37ms)
  ok 443 [webkit] › tests\e2e\image-privacy.spec.ts:66:3 › no isolation headers, no multi-thread build › the libheif .wasm in the dist is the unmodified file of the package, served as wasm and immutable (131ms)
  ok 441 [webkit] › tests\e2e\image-privacy.spec.ts:35:3 › no isolation headers, no multi-thread build › no page, script or .wasm is sent with COOP or COEP (337ms)
  ok 437 [webkit] › tests\e2e\image-matrix.spec.ts:313:3 › image-to-pdf: 16 files in one batch (7.9s)
  ok 444 [webkit] › tests\e2e\image-privacy.spec.ts:89:3 › while processing › the page is not cross-origin isolated, and libheif comes to a HEIC as the unmodified file (1.5s)
  ok 440 [webkit] › tests\e2e\image-presets.spec.ts:149:1 › resize-image/youtube-thumbnail: 1280 × 720 JPG of at most 2,000,000 bytes, cut from the centre, with the chip to Crop image (4.3s)
  ok 439 [webkit] › tests\e2e\image-presets.spec.ts:90:3 › compress-image/to-1mb: every output is a JPG of at most 1,000,000 bytes, what already fits comes back as it is (5.2s)
  ok 438 [webkit] › tests\e2e\image-presets.spec.ts:90:3 › compress-image/to-100kb: every output is a JPG of at most 100,000 bytes, what already fits comes back as it is (7.0s)
  ok 445 [webkit] › tests\e2e\image-privacy.spec.ts:142:1 › Resize image: a picture above the canvas limit takes the path without a canvas, one below it does not (4.3s)
  ok 449 [webkit] › tests\e2e\image-smoke.spec.ts:242:3 › heic-to-jpg › choosing PNG after a HEIC is on screen gives the PNG of the same main image (2.3s)
  ok 450 [webkit] › tests\e2e\image-smoke.spec.ts:253:3 › webp-to-jpg › the result says an animation became its first frame, and PNG on request gives PNG files (2.4s)
  ok 448 [webkit] › tests\e2e\image-smoke.spec.ts:210:3 › rotate-image › Left 90°, 180° and a mirror turn the whole batch the way they say (4.8s)
  ok 446 [webkit] › tests\e2e\image-smoke.spec.ts:95:3 › resize-image › the fields mirror half of the first photo, and the options change what comes out (7.6s)
  ok 447 [webkit] › tests\e2e\image-smoke.spec.ts:130:3 › crop-image › Square by default, then the box moves by keyboard and by pointer, and only the picked photo changes (6.4s)
  ok 451 [webkit] › tests\e2e\image-smoke.spec.ts:264:3 › image-to-pdf › the sheet changes only the PDF: Letter and A4 put every image on a sheet, in the order of the list (3.8s)
  ok 452 [webkit] › tests\e2e\image-smoke.spec.ts:287:3 › crop-image with the keyboard only › Tab from the ratio reaches the box, the arrows move and resize it, Tab goes on to the fields (3.7s)
  ok 453 [webkit] › tests\e2e\image-smoke.spec.ts:336:3 › axe on the option states › crop editor with a result: the box, the handles, the four fields and a batch of two (3.5s)
  ok 458 [webkit] › tests\e2e\island.spec.ts:50:3 › a batch › when every file fails the drop zone says so once and the rows say why (1.8s)
  ok 457 [webkit] › tests\e2e\island.spec.ts:26:3 › a batch › the WaterLevel counts the batch ("0%, 0 of 3 images") and the queue shows working and waiting rows (2.7s)
  ok 456 [webkit] › tests\e2e\image-smoke.spec.ts:372:3 › typed numbers › what is typed in Resize and Crop never reaches the URL or an event (3.5s)
  ok 459 [webkit] › tests\e2e\island.spec.ts:89:3 › a batch › changing the level re-processes the whole batch at once and keeps the focus on the option (2.1s)
  ok 461 [webkit] › tests\e2e\island.spec.ts:130:3 › drop › a drag that carries text is not taken over (809ms)
  ok 460 [webkit] › tests\e2e\island.spec.ts:121:3 › drop › a drop on the result card starts a new batch and the browser never opens the file (1.6s)
  ok 463 [webkit] › tests\e2e\island.spec.ts:167:3 › the comparison › appears with the card, is named, starts at 50 and moves with the arrow keys (1.7s)
  ok 462 [webkit] › tests\e2e\island.spec.ts:143:3 › events › one tool_start and one tool_complete per batch, one tool_error per failed file, a download per click (2.4s)
  ok 465 [webkit] › tests\e2e\island.spec.ts:196:3 › the comparison › picks the file of the queue it shows (1.8s)
  ok 468 [webkit] › tests\e2e\navigation.spec.ts:18:1 › pages are served with the generated headers (no X-Robots-Tag since the launch, noindex on the 404) (32ms)
  ok 464 [webkit] › tests\e2e\island.spec.ts:181:3 › the comparison › sits inside the card from 768px and under it on the phone, without moving the Download (2.3s)
  ok 455 [webkit] › tests\e2e\image-smoke.spec.ts:358:3 › axe on the option states › the options of Image to PDF and Rotate with a result (6.5s)
  ok 467 [webkit] › tests\e2e\navigation.spec.ts:5:1 › a missing page gets the nearest 404 of its language, with status 404 (643ms)
  ok 454 [webkit] › tests\e2e\image-smoke.spec.ts:344:3 › axe on the option states › resize fields, one of them in error (7.5s)
  ok 469 [webkit] › tests\e2e\navigation.spec.ts:36:1 › on a page that exists only in English, the language menu leads to the home of each language (786ms)
  ok 466 [webkit] › tests\e2e\island.spec.ts:207:1 › Start over lets go of the object URLs of the batch (1.9s)
  ok 472 [webkit] › tests\e2e\navigation.spec.ts:78:1 › the search shows only the pages that exist in the language and never falls back to English (978ms)
  ok 476 [webkit] › tests\e2e\navigation.spec.ts:152:1 › trailing slash: a path without it redirects (14ms)
  ok 474 [webkit] › tests\e2e\navigation.spec.ts:126:1 › the search box lists every page on a phone and scrolls, so the Close button stays on screen (720ms)
  ok 475 [webkit] › tests\e2e\navigation.spec.ts:144:1 › the 404 page has a working tool search (693ms)
  ok 471 [webkit] › tests\e2e\navigation.spec.ts:53:1 › tool search loads on first use, finds synonyms in any language and opens the page in the current one (1.5s)
  ok 473 [webkit] › tests\e2e\navigation.spec.ts:98:1 › the English search finds the new tools and presets and opens the one chosen (1.5s)
  ok 470 [webkit] › tests\e2e\navigation.spec.ts:43:1 › the language button goes to the equivalent page (2.3s)
  ok 481 [webkit] › tests\e2e\tool.spec.ts:105:3 › Compress image (shared island) › a file the browser cannot decode shows the Oli error in text, with role alert (1.0s)
  ok 482 [webkit] › tests\e2e\tool.spec.ts:115:3 › Compress image (shared island) › an unsupported type is refused with the same message (906ms)
  ok 480 [webkit] › tests\e2e\tool.spec.ts:73:3 › Compress image (shared island) › without gain, the original goes back without metadata and the text says so (1.5s)
este navegador não tem OffscreenCanvas: o motor rodou na página (DECISOES § 22)
  ok 478 [webkit] › tests\e2e\tool.spec.ts:41:3 › Compress image (shared island) › the work runs in the Web Worker where the browser supports OffscreenCanvas (2.6s)
  ok 477 [webkit] › tests\e2e\tool.spec.ts:17:3 › Compress image (shared island) › the fixture really has GPS, and the compressed copy has no metadata at all (2.8s)
  ok 479 [webkit] › tests\e2e\tool.spec.ts:51:3 › Compress image (shared island) › changing the option re-processes at once, without an Apply button, and keeps the focus (4.0s)
  ok 484 [webkit] › tests\e2e\tool.spec.ts:146:3 › Compress image (shared island) › the result offers the next step and Start over returns to the drop zone (2.7s)
  ok 483 [webkit] › tests\e2e\tool.spec.ts:120:3 › Compress image (shared island) › events carry only the listed parameters and never the file name (2.9s)
  ok 486 [webkit] › tests\e2e\tool.spec.ts:178:1 › Image to PDF: "Show 1 more" puts the focus on the first new row, and a new sheet is announced again (2.3s)
  ok 485 [webkit] › tests\e2e\tool.spec.ts:163:1 › the tool works in Portuguese and Spanish too (3.5s)

  486 passed (2.6m)

▶ lighthouse ci
  $ pnpm run lhci

> fileorca@0.0.0 lhci C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/lighthouse.ts

Started a web server on port 60477...
Running Lighthouse 3 time(s) on http://localhost:60477/compress-image/
Run #1...done.
Run #2...done.
Run #3...done.
Running Lighthouse 3 time(s) on http://localhost:60477/image-tools/
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!
Dumping 6 reports to disk at C:\Users\vmatusita\projetos\fileorca\.lighthouseci\reports...
Done writing reports to disk.
Checking assertions against 2 URL(s), 6 total run(s)

All results processed!
lighthouse (celular): /compress-image/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): LCP 1.50 s em body > div#fo-cookie > p#fo-cookie-text (Cookies, quickly. We use Google Analytics to see which tools help, and ads to k…); CLS 0.001
lighthouse (celular): /image-tools/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): LCP 1.35 s em div.fo-frame > main#main > div.fo-hubband > p.fo-muted (Eight tools to compress, resize, crop, rotate, convert and combine images, all …); CLS 0.000

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
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Spanish too.  Why this site exists  FileOrca exists to offer free tools with no acco..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "member of the oceanic dolphin family. Oli, the orca on this site, is a dolphin to..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ictor on LinkedIn  Skip to content  FileOrca home  Search tools  Choose a language  ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "les never leave your device  Image  FileOrca  About  Privacy  Terms  Licenses  Conta..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "e which tools help, and ads to keep FileOrca free. Your files never leave your devic..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ith a size limit.  YouTube thumbnail resizer  A 1280 × 720 JPG under 2 MB, ready for..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "r 2 MB, ready for a YouTube video.  FileOrca: free tools that never upload your file..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Your files never leave your device. FileOrca does the work in your browser, and you ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hat reach your browser when you use FileOrca, with their licenses. Tools used only t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the site are not listed.  Licenses  FileOrca stands on open-source software. This pa..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "he LGPL  HEIC photos are opened with libheif, a free library under the GNU Lesser Ge..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "t reaches your browser through the libheif-js package, which also holds libde265, the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "otos need, under the same license.  FileOrca uses libheif without any change. The co..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "der the same license.  FileOrca uses libheif without any change. The compiled librar..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ge. The compiled library is the file libheif.wasm, and the site serves it as a file ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "compiled library is the file libheif.wasm, and the site serves it as a file of it..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "on of the library. The page asks for libheif.wasm by its web address, so a build you..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "he library. The page asks for libheif.wasm by its web address, so a build you made..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "brary  the HEVC decoder inside it  the npm package that wraps it  the scripts that..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "wraps it  the scripts that build the .wasm file  The full text of the LGPL-3.0, an..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "he GPL-3.0 it refers to, are under libheif-js in the first table below.  Privacy poli..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "t table below.  Privacy policy  How FileOrca handles your data: files never leave yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "data on fileorca.com is Victor Yuki Matusita, an individual and developer based in C..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "based in Curitiba, Paraná, Brazil. FileOrca is made and run by one person.  For any..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "r.  Your files stay on your device  FileOrca tools run in your browser. The files yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "your device and are never uploaded. FileOrca has no server that processes them, and ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "file.  Site delivery (Cloudflare)  FileOrca is a static site delivered by Cloudflar..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "4)  To see which tools help people, FileOrca uses Google Analytics 4, a service from..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Ads (Google AdSense)  To stay free, FileOrca shows, or will show, ads from Google Ad..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Your cookie choice in the browser  FileOrca saves your cookie choice in your browse..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "If you accept in the cookie notice, FileOrca also counts there how many image batche..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ith the button below.  Legal bases  FileOrca follows the GDPR (the General Data Prot..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "al clauses.  How long data is kept  FileOrca never receives your files, so it keeps ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ou can also file a complaint with the ANPD (Brazil's national data protection auth..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "thority of your country.  Children  FileOrca is not directed to children. If you thi..."
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
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "The FileOrca name, the Oli mascot, the texts and the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "The FileOrca name, the Oli mascot, the texts and the design of the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "n of the site belong to Victor Yuki Matusita. Do not copy them or use them as if the..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hey were yours without permission.  FileOrca also uses open-source libraries. They k..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "extent the law allows, Victor Yuki Matusita, who runs FileOrca, is not liable for a..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ows, Victor Yuki Matusita, who runs FileOrca, is not liable for any loss or damage t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the last update.  If you keep using FileOrca after a change, the new terms apply to ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "you like.  Pick Recommended or Strong. Oli compresses each image in your browser, ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Formats it takes  JPG, PNG and WebP. Oli checks what is inside the file, not its..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "not its name.  JPG  Saved again with MozJPEG, an encoder built to make smaller JPG f..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ller JPG files.  PNG  Optimized with OxiPNG, with no loss of quality. The level you..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "llest file. PNG loses nothing, because Oli saves it without loss. Your original fi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "s tiny color changes are hard to pack. Oli only tidies the file, which often saves..."
aviso [en] COMMA_COMPOUND_SENTENCE (PUNCTUATION): Use a comma before ‘and’ if it connects two independent clauses (unless they are closely connected and short). … "often saves a little. If it is a photo and you do not need transparency, saving it..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "pens to the GPS location in my photo?  Oli saves each compressed copy from the pix..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "p or paste as many images as you like: Oli compresses them one after another, and ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y image get uploaded anywhere?  No. FileOrca compresses the images on your device, i..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hen the new copy would not be smaller, Oli gives you back the original instead of ..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "Your count images are 68% lighter.  lighter  Compression  Recommended  best balance..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "oose them, or paste them with Ctrl V.  Oli saves each one as a JPG of 100 KB or le..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "tees and what it changes  Detail  What Oli does  Target  Every file is 100,000 byt..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "quality alone cannot reach the target, Oli also reduces the dimensions and shows y..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ght.  Privacy of the file  Exif, XMP, IPTC and GPS are left out of every new file...."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "among them, count 1,024 bytes per KB. Oli aims for 100,000 bytes, so the file pas..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "much smaller. When the image is large, Oli first reduces its dimensions, which kee..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "size. If the picture is very detailed, Oli may reduce the dimensions a bit more, a..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "format, without the photo metadata. Oli never gives you a file bigger than the one yo..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "ges are ready, each 100 KB or less.  lighter  Each image comes out as a JPG of 100 K..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "oose them, or paste them with Ctrl V.  Oli saves each one as a JPG of 1 MB or less..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "tees and what it changes  Detail  What Oli does  Target  Every file is 1,000,000 b..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … ", the smaller reading, so a limit of 1 MiB (1,048,576 bytes) is also met.  Output ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "quality alone cannot reach the target, Oli also reduces the dimensions and tells y..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "dth and height.  Metadata  Exif, XMP, IPTC and GPS are not kept in the new files. ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "KB is 1,048,576 bytes, about 5% more. Oli targets 1,000,000 bytes, so the file fi..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "o has more detail than a screen shows. Oli searches for the best quality that fits..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ity further would make it look blocky. Oli reduces the dimensions a bit instead, a..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "mages are ready, each 1 MB or less.  lighter  Each image comes out as a JPG of 1 MB ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "d without loss.  Metadata  Exif, XMP, IPTC and GPS are removed, and the photo orie..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "image.  Colors  Converted to standard sRGB, the color profile that every browser a..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hotos work too.  Metadata  Exif, XMP, IPTC and GPS are removed, including the date..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "gger.  What happens to my Live Photo?  Oli converts only the main image of the fil..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "wide color range called Display P3. FileOrca converts it to sRGB, the standard that ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "d Display P3. FileOrca converts it to sRGB, the standard that every screen and app..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "can look slightly less vivid, because sRGB covers a smaller range.  Can my iPhone ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "author taken from your file names. FileOrca is only named as the program that made ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "gives one PDF.  Metadata  Exif, XMP, IPTC and GPS never reach the PDF.  Questions..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "into one PDF?  Drop them all together. Oli puts one image on each page, in the ord..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "etter and A4 keep a 0.5 inch margin.  image  Drop images here  Choose images  or pa..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "formats, as many as you like  Let go, Oli's ready  count images  As many as you l..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "dy  count images  As many as you like  Oli is on it…  done of total images  68%, d..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "As many as you like  Oli is on it…  done of total images  68%, done of total ima..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "Show Victor  Already optimized  Oops, Oli couldn't read this file  Victor is empt..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "an image in it.  Victor isn't an image Oli can read. Try formats.  Victor is a for..."
aviso [en] ENGLISH_WORD_REPEAT_RULE (MISC): Possible typo: you repeated a word. … "e. Open it in tool.  Victor is in format format, which this tool doesn't take. Try form..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "try once more.  Victor is damaged, so Oli can't read it. Try another copy of the ..."
aviso [en] UPPERCASE_SENTENCE_START (CASING): This sentence does not start with an uppercase letter. … "on of the image.  Choose other files  count files couldn't be read; the rest are re..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "couldn't be read; the rest are ready.  Oli couldn't read any of these count files...."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "This image was already optimized, so Oli kept the original image, without the ph..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "hese images were already optimized, so Oli kept the original images, without the p..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "is browser can't save format files, so Oli kept the original image, without the ph..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "This animation became a still image: Oli kept the first frame.  You asked for mo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "for more pixels than the photo has, so Oli kept the original size.  To fit the siz..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "original size.  To fit the size limit, Oli also reduced the dimensions to width × ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "the dimensions to width × height px.  Oli cropped from the center to fill the fra..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "fewer pixels than the frame needs, so Oli enlarged it and it may look softer.  Ol..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "i enlarged it and it may look softer.  Oli removed the photo metadata, including t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "oose them, or paste them with Ctrl V.  Oli converts each file the other way: a PNG..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ome in one ZIP.  Metadata  Exif, XMP, IPTC and GPS are removed, and the photo orie..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "n its place, and some choose black. FileOrca fills it with white. To keep the transp..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y image get uploaded anywhere?  No. FileOrca converts the image on your device, in y..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "they work too.  Metadata  Exif, XMP, IPTC and GPS are removed, and the photo orie..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y image get uploaded anywhere?  No. FileOrca resizes the image on your device, in yo..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "...umber from 1 to max.  YouTube thumbnail resizer, 1280 × 720 online"
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "data is removed.  YouTube thumbnail resizer  How to make a YouTube thumbnail  Drop ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "oose them, or paste them with Ctrl V.  Oli crops each one from the center to fill ..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "and the rules it follows  Detail  What Oli does  Size  1280 × 720 pixels, a 16:9 p..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "recommended 3840 × 2160 for videos. FileOrca makes 1280 × 720, which is within those..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "those rules.  Photo data  Exif, XMP, IPTC and GPS are left out of every thumbnail..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "recommends 3840 × 2160 for videos. FileOrca makes 1280 × 720, which is within those..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "at happens if my picture is not 16:9?  Oli crops it from the center to fill the fr..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "d without loss.  Metadata  Exif, XMP, IPTC and GPS are removed, and no orientation..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ps that ignore it show it sideways. FileOrca applies the tag when it saves the new f..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "ome in one ZIP.  Metadata  Exif, XMP, IPTC and GPS are removed, and the photo orie..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "JPG cannot store transparency, so FileOrca fills those areas with white. To keep t..."
aviso [en] MORFOLOGIK_RULE_EN_US (TYPOS): Possible spelling mistake found. … "y image get uploaded anywhere?  No. FileOrca converts the image on your device, in y..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "tugués.  Por qué existe este sitio  FileOrca existe para ofrecer herramientas gratis..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la familia de los delfines oceánicos. Oli, la orca de este sitio, también es un d..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ", también es un delfín.  Encuentra a Victor en internet  Sitio web de Victor  Victo..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a a Victor en internet  Sitio web de Victor  Victor en LinkedIn  Licencias del soft..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "or en internet  Sitio web de Victor  Victor en LinkedIn  Licencias del software de ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "r el sitio no aparecen.  Licencias  FileOrca se apoya en software de código abierto...."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "rar la licencia de  Copiado de  Fotos HEIC y la LGPL  Las fotos HEIC se abren con ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o de  Fotos HEIC y la LGPL  Las fotos HEIC se abren con libheif, una biblioteca li..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la LGPL  Las fotos HEIC se abren con libheif, una biblioteca libre bajo la GNU Lesse..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "if, una biblioteca libre bajo la GNU Lesser General Public License, versión 3 (LGPL..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Llega a tu navegador por el paquete libheif-js, que también incluye libde265, el de..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a tu navegador por el paquete libheif-js, que también incluye libde265, el decod..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ete libheif-js, que también incluye libde265, el decodificador de vídeo que necesita..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ador de vídeo que necesitan las fotos HEIC, bajo la misma licencia.  FileOrca usa ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "otos HEIC, bajo la misma licencia.  FileOrca usa libheif sin ningún cambio. La bibli..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ajo la misma licencia.  FileOrca usa libheif sin ningún cambio. La biblioteca compil..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a biblioteca compilada es el archivo libheif.wasm, y el sitio lo entrega como un arc..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "oteca compilada es el archivo libheif.wasm, y el sitio lo entrega como un archivo ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ión de la biblioteca. La página pide libheif.wasm por su dirección web, así que una ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la biblioteca. La página pide libheif.wasm por su dirección web, así que una versi..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "uso  la biblioteca  el decodificador HEVC que trae  el paquete npm que la envuelv..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ecodificador HEVC que trae  el paquete npm que la envuelve  los scripts que constr..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "os scripts que construyen el archivo .wasm  El texto completo de la LGPL-3.0 y el ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a GPL-3.0, a la que remite, están en libheif-js, en la primera tabla de abajo.  Polí..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "3.0, a la que remite, están en libheif-js, en la primera tabla de abajo.  Polític..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Si aceptas en el aviso de cookies, FileOrca también cuenta allí cuántas veces usast..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "aciones  Para seguir siendo gratis, FileOrca muestra, o mostrará, anuncios de Google..."
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
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "quieras.  Elige Recomendada o Fuerte. Oli comprime cada imagen en tu navegador, u..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Formatos que acepta  JPG, PNG y WebP. Oli revisa lo que hay dentro del archivo, n..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "nombre.  JPG  Se guarda de nuevo con MozJPEG, un codificador hecho para generar arch..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "más pequeños.  PNG  Se optimiza con OxiPNG, sin perder calidad. El nivel que elija..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "GPS se quitan de todos los archivos.  HEIC y AVIF  No se comprimen aquí. Convierte..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "F  No se comprimen aquí. Convierte el HEIC antes a JPG con HEIC to JPG (herramient..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "uí. Convierte el HEIC antes a JPG con HEIC to JPG (herramienta en inglés). Los arc..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "posible. El PNG no pierde nada, porque Oli lo guarda sin pérdida. Tu archivo origi..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s de color son difíciles de compactar. Oli solo ordena el archivo, y eso suele aho..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "pasa con la ubicación GPS de mi foto?  Oli guarda cada copia comprimida solo a par..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o pega todas las imágenes que quieras: Oli las comprime una tras otra, y cada una ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o la nueva copia no sería más pequeña, Oli te devuelve el original en lugar de un ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Puedo comprimir una foto de iPhone en HEIC?  Aquí no: Comprimir imagen acepta JPG,..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "JPG, PNG y WebP. Primero convierte el HEIC a JPG con HEIC to JPG, que está en ingl..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ". Primero convierte el HEIC a JPG con HEIC to JPG, que está en inglés, y después c..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "quedó un 68% más ligera.  ¡Listo! Tus count imágenes quedaron un 68% más ligeras.  ..."
aviso [es] UPPERCASE_SENTENCE_START (CASING): Esta frase no empieza con mayúscula. … "imágenes quedaron un 68% más ligeras.  más ligera  Compresión  Recomendada  mejor ..."
aviso [es] UPPERCASE_SENTENCE_START (CASING): Esta frase no empieza con mayúscula. … "ue el nivel solo cambia JPG y WebP.  imagen  Suelta las imágenes aquí  Elegir imáge..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "aquí  Elegir imágenes  o pégalas con Ctrl V · formats  formats, todas las que qui..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "gir imágenes  o pégalas con Ctrl V · formats  formats, todas las que quieras  Suélta..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "nes  o pégalas con Ctrl V · formats  formats, todas las que quieras  Suéltalo, Oli e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "mats, todas las que quieras  Suéltalo, Oli está lista  count imágenes  Todas las q..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ue quieras  Suéltalo, Oli está lista  count imágenes  Todas las que quieras  Oli se..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "count imágenes  Todas las que quieras  Oli se está encargando…  done de total imág..."
aviso [es] UPPERCASE_SENTENCE_START (CASING): Esta frase no empieza con mayúscula. … "que quieras  Oli se está encargando…  done de total imágenes  68%, done de total i..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "de total imágenes  Archivos  Mostrar count más  En cola  Trabajando  a  Descargar ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s  En cola  Trabajando  a  Descargar Victor  Cancelar Victor  Quitar Victor  Mostra..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "jando  a  Descargar Victor  Cancelar Victor  Quitar Victor  Mostrar Victor  Ya opti..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "rgar Victor  Cancelar Victor  Quitar Victor  Mostrar Victor  Ya optimizada  Uy, Oli..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "celar Victor  Quitar Victor  Mostrar Victor  Ya optimizada  Uy, Oli no pudo leer es..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "or  Mostrar Victor  Ya optimizada  Uy, Oli no pudo leer este archivo  Victor está ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Uy, Oli no pudo leer este archivo  Victor está vacío, así que no hay nada que lee..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ge un archivo que tenga una imagen.  Victor no es una imagen que Oli pueda leer. Pr..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a imagen.  Victor no es una imagen que Oli pueda leer. Prueba con un archivo forma..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "li pueda leer. Prueba con un archivo formats.  Victor es un archivo format. Ábrelo e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "eer. Prueba con un archivo formats.  Victor es un archivo format. Ábrelo en tool (e..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "chivo formats.  Victor es un archivo format. Ábrelo en tool (en inglés).  Victor es..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ictor es un archivo format. Ábrelo en tool (en inglés).  Victor es un archivo form..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "format. Ábrelo en tool (en inglés).  Victor es un archivo format. Prueba con un arc..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "l (en inglés).  Victor es un archivo format. Prueba con un archivo formats.  Victor..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "rchivo format. Prueba con un archivo formats.  Victor se corta antes de terminar, as..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "mat. Prueba con un archivo formats.  Victor se corta antes de terminar, así que fal..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "talo de nuevo e inténtalo otra vez.  Victor está dañado y Oli no puede leerlo. Prue..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "éntalo otra vez.  Victor está dañado y Oli no puede leerlo. Prueba con otra copia ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ivo.  Este navegador no pudo guardar Victor. Inténtalo de nuevo en otro navegador. ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "téntalo de nuevo en otro navegador.  Victor es más grande de lo que este navegador ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "r otros archivos  No se pudieron leer count archivos; el resto está listo.  Oli no ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "count archivos; el resto está listo.  Oli no pudo leer ninguno de estos count arc..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "o.  Oli no pudo leer ninguno de estos count archivos. La lista de abajo explica el ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "r todo · ZIP size  Armando el ZIP con count archivos…  Empezar de nuevo  Antes  Des..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "vo  Antes  Después  Tamaño  Imágenes  count imágenes  Esta imagen ya estaba optimiz..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "a imagen ya estaba optimizada, así que Oli conservó la imagen original, sin los me..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ágenes ya estaban optimizadas, así que Oli conservó las imágenes originales, sin l..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "navegador no puede guardar archivos format, así que Oli conservó la imagen origina..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "puede guardar archivos format, así que Oli conservó la imagen original, sin los me..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "animación pasó a ser una imagen fija: Oli guardó el primer fotograma.  Pediste má..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "eles de los que tiene la foto, así que Oli mantuvo el tamaño original.  Para entra..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … ".  Para entrar en el límite de tamaño, Oli también redujo las dimensiones a width ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "Oli también redujo las dimensiones a width × height px.  Oli recortó desde el cent..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "ién redujo las dimensiones a width × height px.  Oli recortó desde el centro para l..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "edujo las dimensiones a width × height px.  Oli recortó desde el centro para llen..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "las dimensiones a width × height px.  Oli recortó desde el centro para llenar el ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "s de los que pide el encuadre, así que Oli la amplió y puede verse menos nítida.  ..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "la amplió y puede verse menos nítida.  Oli eliminó los metadatos de la foto, inclu..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "vo  Comparar antes y después  Antes · size  Después · size  Siguiente:  Más herram..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "es y después  Antes · size  Después · size  Siguiente:  Más herramientas  JPG  PNG..."
aviso [es] MORFOLOGIK_RULE_ES (TYPOS): Se ha encontrado un posible error ortográfico. … "...nte:  Más herramientas  JPG  PNG  WebP  HEIC  AVIF  GIF"
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Sobre o FileOrca e quem faz o site  O FileOrca é feito e..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e o FileOrca e quem faz o site  O FileOrca é feito e mantido por Victor Yuki Matus..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a é feito e mantido por Victor Yuki Matusita, dev em Curitiba. Veja por que as ferra..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "e mantido por Victor Yuki Matusita, dev em Curitiba. Veja por que as ferramentas s..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a orca tem a ver com isso.  Sobre o FileOrca  O FileOrca é feito e mantido por uma p..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ver com isso.  Sobre o FileOrca  O FileOrca é feito e mantido por uma pessoa só: Vi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tido por uma pessoa só: Victor Yuki Matusita, dev em Curitiba, no Paraná.  É um conj..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "uma pessoa só: Victor Yuki Matusita, dev em Curitiba, no Paraná.  É um conjunto de ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "anhol.  Por que este site existe  O FileOrca existe para oferecer ferramentas grátis..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "da família dos golfinhos oceânicos. A Oli, a orca deste site, também é golfinho. ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ntes que chegam ao seu navegador no FileOrca, com as licenças. Ferramentas usadas só..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tar o site não entram.  Licenças  O FileOrca usa software de código aberto. Esta pág..."
aviso [pt] PT_WORDINESS_REPLACE_DENTRO_DE_UM (REDUNDANCY): “dentro de um” é uma expressão prolixa. É preferível dizer “num” ou “em um”. … "instalados sozinhos. Cada um vem dentro de um pacote da lista acima e acaba nos arqui..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "icença de  Copiado de  Fotos HEIC e a LGPL  As fotos HEIC são abertas com a libhei..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "GPL  As fotos HEIC são abertas com a libheif, uma biblioteca livre sob a GNU Lesser ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "heif, uma biblioteca livre sob a GNU Lesser General Public License, versão 3 (LGPL-..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ser General Public License, versão 3 (LGPL-3.0). Ela chega ao seu navegador pelo p..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a chega ao seu navegador pelo pacote libheif-js, que também traz a libde265, o decod..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a ao seu navegador pelo pacote libheif-js, que também traz a libde265, o decodifi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "C precisam, sob a mesma licença.  O FileOrca usa a libheif sem nenhuma alteração. A ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "b a mesma licença.  O FileOrca usa a libheif sem nenhuma alteração. A biblioteca com..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … ". A biblioteca compilada é o arquivo libheif.wasm, e o site o entrega como um arquiv..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "lioteca compilada é o arquivo libheif.wasm, e o site o entrega como um arquivo pró..."
aviso [pt] PARONYM_PUBLICA_535 (CONFUSED_WORDS): Quando escrita sem acento, esta palavra é um verbo. Se pretende referir-se a um substantivo ou adjetivo, deve utilizar a forma acentuada. … "próprio, byte a byte como o pacote o publica. O JavaScript que o inicia é o do própr..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ersão da biblioteca. A página pede o libheif.wasm pelo endereço dele, então uma vers..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a biblioteca. A página pede o libheif.wasm pelo endereço dele, então uma versão qu..."
aviso [pt] VERB_COMMA_CONJUNCTION (PUNCTUATION): Esta locução deve ser separada por vírgulas. … "te abaixo pode tomar o lugar dele, por exemplo com as substituições locais das ferrame..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "odificador HEVC que vem nela  o pacote npm que a envolve  os scripts que montam o ..."
aviso [pt] PT_BARBARISMS_REPLACE_SCRIPTS (STYLE): “scripts” é um estrangeirismo. É preferível dizer “roteiros”. … "nela  o pacote npm que a envolve  os scripts que montam o arquivo .wasm  O texto com..."
aviso [pt] SPACE_BEFORE_PUNCTUATION2 (TYPOGRAPHY): Remova o espaço antes deste sinal de pontuação. … "a envolve  os scripts que montam o arquivo .wasm  O texto completo da LGPL-3.0 e o d..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "lve  os scripts que montam o arquivo .wasm  O texto completo da LGPL-3.0 e o da GP..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o arquivo .wasm  O texto completo da LGPL-3.0 e o da GPL-3.0, a que ela remete, e..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "GPL-3.0, a que ela remete, estão em libheif-js, na primeira tabela abaixo.  Polític..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … ".0, a que ela remete, estão em libheif-js, na primeira tabela abaixo.  Política d..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o.  Política de privacidade  Como o FileOrca trata seus dados: os arquivos ficam no ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rocessam e seus direitos na LGPD e no GDPR.  Política de privacidade  Última atual..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "soais no fileorca.com é Victor Yuki Matusita, pessoa física e desenvolvedor, de Curi..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "dor, de Curitiba, Paraná, Brasil. O FileOrca é feito e mantido por uma pessoa só.  P..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "no seu aparelho  As ferramentas do FileOrca rodam no seu navegador. Os arquivos que..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "eu aparelho e nunca são enviados. O FileOrca não tem servidor que processe arquivos,..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o.  Entrega do site (Cloudflare)  O FileOrca é um site estático, entregue pela Cloud..."
aviso [pt] PT_WORDINESS_REPLACE_DE_ACORDO_COM_AS (REDUNDANCY): “de acordo com as” é uma expressão prolixa. É preferível dizer “conforme as”, “segundo as” ou “consoante as”. … "arquivos. A Cloudflare os trata de acordo com as próprias políticas.  Medição de uso (Go..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "is ferramentas ajudam as pessoas, o FileOrca usa o Google Analytics 4, um serviço do..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "AdSense)  Para continuar grátis, o FileOrca mostra, ou vai mostrar, anúncios do Goo..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "visitas.  No Espaço Econômico Europeu (EEE), no Reino Unido e na Suíça, uma mensag..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "escolha de cookies no navegador  O FileOrca guarda a sua escolha sobre cookies no a..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ookies no armazenamento local (local storage) do navegador, para o aviso não voltar ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "você aceitar no aviso de cookies, o FileOrca também conta ali quantas vezes você uso..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ermos de uso  Os termos para usar o FileOrca, ferramentas grátis que rodam no navega..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rmos explicam como você pode usar o FileOrca. Ao usar o site, você concorda com eles..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o site.  Quem oferece o serviço  O FileOrca (fileorca.com) é feito e mantido por um..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "tido por uma pessoa só: Victor Yuki Matusita, desenvolvedor em Curitiba, Paraná, Bra..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "essoa física, não empresa.  O que o FileOrca faz com dados pessoais está explicado n..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a página de Privacidade.  O que é o FileOrca  O FileOrca é um site com ferramentas g..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Privacidade.  O que é o FileOrca  O FileOrca é um site com ferramentas grátis que ro..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "egador. Ele foi pensado para imagens, PDFs e calculadoras. Hoje o site tem ferrame..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ar uma doação. O pagamento acontece no Ko-fi, sob as políticas dele.  A doação é ..."
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
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "iser.  Escolha Recomendada ou Forte. A Oli comprime cada imagem no seu navegador, ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Formatos aceitos  JPG, PNG e WebP. A Oli confere o que há dentro do arquivo, não..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "nome dele.  JPG  Salvo de novo com o MozJPEG, um codificador feito para gerar JPGs m..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "JPEG, um codificador feito para gerar JPGs menores.  PNG  Otimizado com o OxiPNG, ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "JPGs menores.  PNG  Otimizado com o OxiPNG, sem perder qualidade. O nível que você..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ssível. O PNG não perde nada, porque a Oli o salva sem perda. O arquivo original n..."
aviso [pt] PT_BARBARISMS_REPLACE_PIXEL (STYLE): “pixel” é um estrangeirismo. É preferível dizer “píxel”. … "quase não diminui?  O PNG guarda cada pixel exatamente como está, então sobra pouco..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "as de cor são difíceis de compactar. A Oli só arruma o arquivo, o que costuma econ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "om a localização GPS da minha foto?  A Oli salva cada cópia comprimida só a partir..."
aviso [pt] PT_BARBARISMS_REPLACE_PIXELS (STYLE): “pixels” é um estrangeirismo. É preferível dizer “píxeis”. … "ada cópia comprimida só a partir dos pixels, então a localização GPS, o modelo da c..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "olte ou cole quantas imagens quiser: a Oli comprime uma depois da outra, e cada um..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ando a nova cópia não ficaria menor, a Oli devolve o original em vez de um arquivo..."
aviso [pt] DIACRITICS (MISSPELLING): Se for um erro ortográfico, substitua por “tô”. … "ro transforme o HEIC em JPG com a HEIC to JPG, que está em inglês, e depois compr..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ficou 68% mais leve.  Prontinho! Suas count imagens ficaram 68% mais leves.  mais l..."
aviso [pt] UPPERCASE_SENTENCE_START (CASING): Esta frase não inicia com um letra maiúscula … "ount imagens ficaram 68% mais leves.  mais leve  Compressão  Recomendada  melhor e..."
aviso [pt] UPPERCASE_SENTENCE_START (CASING): Esta frase não inicia com um letra maiúscula … ", então o nível só muda JPG e WebP.  imagem  Solte as imagens aqui  Escolher imagen..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "colher imagens  ou cole com Ctrl V · formats  formats, quantas quiser  Pode soltar, ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "agens  ou cole com Ctrl V · formats  formats, quantas quiser  Pode soltar, a Oli est..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ormats, quantas quiser  Pode soltar, a Oli está pronta  count imagens  Quantas qui..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "iser  Pode soltar, a Oli está pronta  count imagens  Quantas quiser  A Oli está cui..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "onta  count imagens  Quantas quiser  A Oli está cuidando disso…  done de total ima..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "s quiser  A Oli está cuidando disso…  done de total imagens  68%, done de total im..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "o disso…  done de total imagens  68%, done de total imagens  Arquivos  Mostrar mai..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "total imagens  Arquivos  Mostrar mais count  Na fila  Trabalhando  para  Baixar Vic..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Mostrar Victor  Já otimizada  Ops, a Oli não conseguiu ler esse arquivo  Victor ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "imagem.  Victor não é uma imagem que a Oli consiga ler. Tente um arquivo formats. ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "a Oli consiga ler. Tente um arquivo formats.  Victor é um arquivo format. Abra-o em..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "rquivo formats.  Victor é um arquivo format. Abra-o em tool (em inglês).  Victor é ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "Victor é um arquivo format. Abra-o em tool (em inglês).  Victor é um arquivo forma..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ol (em inglês).  Victor é um arquivo format. Tente um arquivo formats.  Victor term..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "um arquivo format. Tente um arquivo formats.  Victor termina antes da hora, então f..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "outra vez.  Victor está danificado e a Oli não consegue lê-lo. Tente outra cópia d..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "da imagem.  Escolher outros arquivos  count arquivos não puderam ser lidos; o resto..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ram ser lidos; o resto está pronto.  A Oli não conseguiu ler nenhum destes count a..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "A Oli não conseguiu ler nenhum destes count arquivos. A lista abaixo diz o motivo. ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "r tudo · ZIP size  Montando o ZIP com count arquivos…  Começar de novo  Antes  Depo..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ovo  Antes  Depois  Tamanho  Imagens  count imagens  Essa imagem já estava otimizad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "sa imagem já estava otimizada, então a Oli manteve a imagem original, sem os metad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "imagens já estavam otimizadas, então a Oli manteve as imagens originais, sem os me..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "vegador não consegue salvar arquivos format, então a Oli manteve a imagem original,..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "nsegue salvar arquivos format, então a Oli manteve a imagem original, sem os metad..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "A animação virou uma imagem parada: a Oli guardou o primeiro quadro.  Você pediu ..."
aviso [pt] PT_BARBARISMS_REPLACE_PIXELS (STYLE): “pixels” é um estrangeirismo. É preferível dizer “píxeis”. … "o primeiro quadro.  Você pediu mais pixels do que a foto tem, então a Oli manteve ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "mais pixels do que a foto tem, então a Oli manteve o tamanho original.  Para caber..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "l.  Para caber no limite de tamanho, a Oli também reduziu as dimensões para width ..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "s dimensões para width × height px.  A Oli cortou a partir do centro para preenche..."
aviso [pt] PT_BARBARISMS_REPLACE_PIXELS (STYLE): “pixels” é um estrangeirismo. É preferível dizer “píxeis”. … "reencher o quadro.  A foto tem menos pixels do que o quadro pede, então a Oli a amp..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "s pixels do que o quadro pede, então a Oli a ampliou e ela pode ficar menos nítida..."
aviso [pt] PORTUGUESE_WORD_REPEAT_BEGINNING_RULE (STYLE): Três frases seguidas começam com a mesma palavra. Considere reformular a frase ou use um dicionário para encontrar um sinônimo. … "ampliou e ela pode ficar menos nítida.  A Oli removeu os metadados da foto, inclu..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "liou e ela pode ficar menos nítida.  A Oli removeu os metadados da foto, inclusive..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ovo  Comparar antes e depois  Antes · size  Depois · size  A seguir:  Mais ferrame..."
aviso [pt] MORFOLOGIK_RULE_PT_BR (TYPOS): Encontrado possível erro de ortografia. … "ntes e depois  Antes · size  Depois · size  A seguir:  Mais ferramentas  JPG  PNG ..."
lint:texto: 31 arquivo(s), 1434 textos, 0 erro(s) de gramática, 464 aviso(s)

Resumo do pnpm verificar
  ok       7.6 s  tipos (astro check)
  ok       2.5 s  lint (eslint)
  ok       8.7 s  build (astro build do zero)
  ok       5.2 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.5 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.5 s  links internos e páginas órfãs
  ok       0.5 s  conteúdo mínimo das ferramentas e do site
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.8 s  licenças
  ok       0.4 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     156.7 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      73.1 s  lighthouse ci
  ok      12.3 s  lint:texto (LanguageTool)
  total 275.3 s (limite 900 s)
```

</details>

## CI na PR

**O CI da PR não fica verde nesta run, e só pelo tempo.** O runner de repositório privado do GitHub Free tem 2 vCPU e 8 GB, segundo a documentação do GitHub lida em 31/out/2026. Nele, o `verificar` com a suíte inteira passa de 900 s, mesmo com todos os testes passando.

| Execução | Commit | Resultado | `verificar` |
| --- | --- | --- | ---: |
| [41196760652](https://github.com/vmatusita/fileorca/actions/runs/41196760652) | `d8b2af1` (rascunho, antes do hub) | parou no Vitest (4 testes à espera da leva do hub, do sitemap e das licenças) | — |
| [41200291640](https://github.com/vmatusita/fileorca/actions/runs/41200291640) | `df918b2` (suíte inteira) | Playwright 1414 s, 532 testes, 4 falhas só do Ubuntu (§ 83) | 1456,8 s |
| [41205310197](https://github.com/vmatusita/fileorca/actions/runs/41205310197) | `4b169ae` (depois da § 83, da § 85 e da § 86) | **os 486 testes verdes**; falha só o limite de 15 min | **1283,5 s** |

Portões da execução 41205310197 (Ubuntu 24.04, Node 24, 2 workers), em segundos:

| Portão | Tempo (s) |
| --- | ---: |
| tipos | 9,7 |
| lint | 4,1 |
| build | 9,0 |
| vitest | 17,5 |
| cabeçalhos | 0,4 |
| worker | 0,5 |
| seo | 0,6 |
| links | 0,5 |
| conteúdo | 0,7 |
| design | 0,7 |
| licenças | 5,4 |
| dinheiro e saúde | 0,5 |
| actionlint | 0,8 |
| **playwright** | **1123,4** (486 testes em 18,7 min) |
| lighthouse | 74,5 |
| lint:texto | 35,1 |

Soma da duração dos testes no log, os dois navegadores juntos, em segundos (o relógio do Playwright é cerca de metade, com 2 workers):

| Spec | Antes (41200291640) | Depois (41205310197) |
| --- | ---: | ---: |
| `image-matrix.spec.ts` | 691 | 551 |
| `a11y.spec.ts` | 771 | 370 |
| `ads.spec.ts` | 224 | 223 |
| `image-smoke.spec.ts` | 295 | 212 |
| `design.spec.ts` | 138 | 162 |
| `coffee.spec.ts` | 134 | 143 |
| `tool.spec.ts` | 106 | 118 |
| `image-presets.spec.ts` | 94 | 97 |
| as outras 8 specs | 333 | 336 |
| **total** | **2786** | **2212** |

O que foi feito para o tempo, na ordem que a ficha manda:

1. **Sem reduzir o alcance (§ 83):** o axe no modo legado e só com as violações (o axe caiu de 771 s para 370 s); os estados da F1b num carregamento cada; testes que só precisavam de uma imagem passaram ao JPEG gerado.
2. **A válvula (§ 85):** (e) e (f), com os testes delas. A matriz caiu de 691 s para 551 s.
3. **A ADR-003 (Proposta):** dividir o Playwright do CI em partes.

Para o `verificar` caber em 900 s neste runner, o Playwright precisaria ficar em uns 740 s, ou seja, uns 1460 s somados. Faltam uns 750 s de trabalho, e o que mais pesa (a matriz e o axe) é alcance que a ficha não deixa tirar. O que não foi feito, e por quê (§ 87):

- **Mais workers:** com 2 vCPU e trabalho de CPU (codecs WASM e axe), não reduz o total, e o teste mais lento do WebKit chegaria perto do limite de 60 s.
- **Os itens (a) a (d) da válvula:** poupam uns 80 s somados, longe do que falta, e tirariam produto sem fazer o CI passar.
- **Tirar checagens repetidas entre specs:** as candidatas (os estados "processando" e "lote" de cada página no `ads.spec.ts`, que repetem os da Compress, e o teste de GPS do `tool.spec.ts`, que a matriz repete) somam uns 150 s. Também não fecham a conta, e ficam anotadas para quando a ADR-003 for decidida.

O commit deste relatório roda o CI mais uma vez, depois deste texto. O resultado vai na resposta final da run.

## Matriz de fixtures

A tabela completa, ferramenta × fixture × navegador, está em [`fase-02-matriz.md`](fase-02-matriz.md), gerada da execução acima. Resumo por teste (tempo local, 6 workers):

| Teste | Ferramenta | Opções | Arquivos | Saídas | Recusados | Chromium | WebKit | Requisições para fora |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `compress-image-photos` | `compress-image` | Recommended | 9 | 3 | 6 | 6,3 s | 7,4 s | 0 |
| `compress-image-rest` | `compress-image` | Recommended | 13 | 7 | 6 | 5,8 s | 6,5 s | 0 |
| `crop-image` | `crop-image` | Square (default), centred | 16 | 10 | 6 | 2,6 s | 5,9 s | 0 |
| `heic-to-jpg-a` | `heic-to-jpg` | JPG (default) | 13 | 5 | 8 | 8,4 s | 10,4 s | 0 |
| `heic-to-jpg-b` | `heic-to-jpg` | JPG (default) | 7 | 5 | 2 | 7,6 s | 9,2 s | 0 |
| `heic-to-jpg-png` | `heic-to-jpg` | PNG | 5 | 3 | 2 | 6,9 s | 10,5 s | 0 |
| `image-to-pdf` | `image-to-pdf` | Image size (default) | 16 | 10 | 6 | 5,9 s | 7,7 s | 0 |
| `png-to-jpg-photos` | `png-to-jpg` | JPG files go to PNG | 8 | 3 | 5 | 5,7 s | 8,9 s | 0 |
| `png-to-jpg-png` | `png-to-jpg` | PNG files go to JPG | 7 | 2 | 5 | 1,1 s | 2,0 s | 0 |
| `png-to-jpg-rest` | `png-to-jpg` | JPG files go to PNG | 8 | 3 | 5 | 9,3 s | 7,1 s | 0 |
| `resize-image` | `resize-image` | Untouched: 50% of each image | 16 | 10 | 6 | 6,0 s | 7,3 s | 0 |
| `rotate-image` | `rotate-image` | Right 90° (default), no mirror | 16 | 10 | 6 | 6,2 s | 9,7 s | 0 |
| `webp-to-jpg` | `webp-to-jpg` | JPG (default) | 10 | 2 | 8 | 1,3 s | 2,6 s | 0 |

### Presets: bytes de cada saída

Bytes de cada saída (o limite é o do preset). Cada célula: `bytes (largura×altura)`; a coluna Entrada é o arquivo que entrou.

#### `/compress-image/to-100kb/`

Limite: 100.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 99.114 JPG (783×1044) | 99.769 JPG (783×1044) | reduzida para 783×1044 px |
| `gen-png-transparente.png` | 1.096.229 | 97.749 JPG (800×600) | 97.948 JPG (800×600) | só a qualidade; transparência em branco |
| `gen-webp-exif-gps.webp` | 262.648 | 98.472 JPG (1238×929) | 97.413 JPG (1238×929) | reduzida para 1238×929 px |
| `gen-webp-animada.webp` | 7.186 | 7.186 WebP (320×240) | 7.186 WebP (320×240) | já cabia: mesmo formato e sem metadados |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 97.851 JPG (1216×912) | 99.480 JPG (1216×912) | reduzida para 1216×912 px; orientação ok |

#### `/compress-image/to-1mb/`

Limite: 1.000.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 758.841 JPG (3024×4032) | 758.841 JPG (3024×4032) | só a qualidade |
| `gen-png-transparente.png` | 1.096.229 | 129.218 JPG (800×600) | 129.585 JPG (800×600) | só a qualidade; transparência em branco |
| `gen-webp-exif-gps.webp` | 262.648 | 242.170 WebP (1600×1200) | 242.170 WebP (1600×1200) | já cabia: mesmo formato e sem metadados |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 397.011 JPG (1600×1200) | 397.011 JPG (1600×1200) | já cabia: mesmo formato e sem metadados; orientação ok |

#### `/resize-image/youtube-thumbnail/`

Limite: 2.000.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 302.690 JPG (1280×720) | 343.792 JPG (1280×720) | 16:9 pelo centro |
| `gen-png-transparente.png` | 1.096.229 | 197.093 JPG (1280×720) | 205.004 JPG (1280×720) | 16:9 pelo centro; transparência em branco (dito no resultado) |
| `gen-webp-exif-gps.webp` | 262.648 | 263.742 JPG (1280×720) | 274.468 JPG (1280×720) | 16:9 pelo centro |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 278.289 JPG (1280×720) | 289.626 JPG (1280×720) | 16:9 pelo centro; orientação ok |

## Desempenho

- **Lighthouse no celular** (mediana de 3 execuções, `lighthouserc.json`):

  | Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | Elemento do LCP | CLS |
  | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
  | `/compress-image/` | 100 | 100 | 100 | 100 | 1,50 s | `p#fo-cookie-text` (aviso de cookies, § 55) | 0,001 |
  | `/image-tools/` | 100 | 100 | 100 | 100 | 1,35 s | `div.fo-hubband > p.fo-muted` (a linha do hub) | 0,000 |

- **JS inicial** (gzip, sem worker nem `.wasm` antes do primeiro arquivo; limite 80 KB): 19,4 KB na Compress image (en, pt e es), 19,3 KB nos dois presets da Compress, 19,7 KB na Resize, 19,3 KB no preset do YouTube, 21,5 KB no Crop, 19,4 KB no Rotate, 19,3 KB na HEIC to JPG, na WebP to JPG e na Image to PDF, 19,2 KB na PNG ↔ JPG. Cada página de ferramenta carrega 2 arquivos JS: o `mount` dela e o grupo `island` (§ 70). O hub: 2,5 KB, só os scripts inline.
- **Requisições** (próprio domínio, primeira visita; limite 8):

  | Página | Chromium | WebKit |
  | --- | ---: | ---: |
  | qualquer página de ferramenta ou preset | 6 (HTML, CSS, 2 JS, 2 fontes) | 7 (+ manifest) |
  | `/image-tools/` | 4 | 5 |
  | `/` | 4 | 5 |

  Novas na página seguinte (limite 3), iguais nos dois navegadores: `/compress-image/` → `/privacy/` 1; `/` → `/compress-image/` 3; `/pt/comprimir-imagem/` → `/pt/sobre/` 1; `/compress-image/` → `/compress-image/to-100kb/` 2; `/compress-image/` → `/resize-image/` 2; `/resize-image/` → `/crop-image/` 2; `/image-tools/` → `/heic-to-jpg/` 3 (o hub não tem ilha, então a ferramenta traz o `mount` e o grupo).
- **Codecs, medidos** (AMD Ryzen 5 7600X, 12 threads, Node 26.8.1, os mesmos `.wasm` de uma thread do site):
  - **libheif** (`libheif-js` 1.23.5), decodificação da imagem principal até o RGBA: 0,38 a 0,72 s nas HEIC de 12 MP (`heic-01` a `heic-07` e `heic-09`), 0,41 s na de 8,5 MP (`heic-04`), 0,24 s na da Vision Pro (2560 × 2560) e 76 ms na de 1512 × 850.
  - **Codificador AVIF** (`@jsquash/avif`, para a 2b): foto de 12 MP a 1,3 s na velocidade 10, 0,9 s na 9 (a escolhida, § 62) e 2,5 s na 8. Nos workers do Chromium e do WebKit ficou a 10% disso.
  - No runner do CI, cada teste da matriz levou de 3 a 4 vezes o tempo daqui (seção "CI na PR").

## Screenshots

`pnpm screenshots`, sobre o build final, no Chromium, com `deviceScaleFactor` 1 e movimento reduzido. Largura de 360 px, salvo indicação. Os estados saem do fluxo real: lote com um arquivo de texto no meio, worker segurado e foto de 12 MP no fim da fila.

| Estado | Largura | Claro | Escuro |
| --- | --- | --- | --- |
| Fila esperando (WaterLevel, worker segurado) | 360 px | [claro](fase-02/queue-waiting-light-360.png) | [escuro](fase-02/queue-waiting-dark-360.png) |
| Fila com pronta, erro e processando | 360 px | [claro](fase-02/queue-working-light-360.png) | [escuro](fase-02/queue-working-dark-360.png) |
| Fila pronta, com a linha de erro | 360 px | [claro](fase-02/queue-done-light-360.png) | [escuro](fase-02/queue-done-dark-360.png) |
| ResultCard do lote | 360 px | [claro](fase-02/result-card-batch-light-360.png) | [escuro](fase-02/result-card-batch-dark-360.png) |
| ResultCard do lote com o BeforeAfter dentro | 1280 px | [claro](fase-02/result-card-batch-light-1280.png) | [escuro](fase-02/result-card-batch-dark-1280.png) |
| BeforeAfter | 360 px | [claro](fase-02/before-after-light-360.png) | [escuro](fase-02/before-after-dark-360.png) |
| Editor de corte | 360 px | [claro](fase-02/crop-editor-light-360.png) | [escuro](fase-02/crop-editor-dark-360.png) |
| Campos da Resize | 360 px | [claro](fase-02/resize-fields-light-360.png) | [escuro](fase-02/resize-fields-dark-360.png) |
| Campos da Resize com erro | 360 px | [claro](fase-02/resize-fields-error-light-360.png) | [escuro](fase-02/resize-fields-error-dark-360.png) |
| Hub (faixa) | 360 px | [claro](fase-02/hub-band-light-360.png) | [escuro](fase-02/hub-band-dark-360.png) |
| Hub (faixa) | 1280 px | [claro](fase-02/hub-band-light-1280.png) | [escuro](fase-02/hub-band-dark-1280.png) |
| Hub (página inteira) | 360 px | [claro](fase-02/hub-page-light-360.png) | [escuro](fase-02/hub-page-dark-360.png) |
| Hub (página inteira) | 1280 px | [claro](fase-02/hub-page-light-1280.png) | [escuro](fase-02/hub-page-dark-1280.png) |
| Página da ferramenta (inteira) | 360 px | [claro](fase-02/tool-page-light-360.png) | [escuro](fase-02/tool-page-dark-360.png) |
| Página da ferramenta (inteira) | 1280 px | [claro](fase-02/tool-page-light-1280.png) | [escuro](fase-02/tool-page-dark-1280.png) |
| Home com a grade (o primeiro cartão) | 360 px | [claro](fase-02/tool-card-light-360.png) | [escuro](fase-02/tool-card-dark-360.png) |

Os componentes da F1b foram refeitos sobre o build final na mesma pasta (Header, Footer, DropZone, WaterLevel, ResultCard, café, busca, 404, apoio e outros; 88 arquivos).

## Prévia

O comentário do Workers Builds apareceu na PR a cada push, com o build e o deploy verdes. A URL da branch é https://fase-02-fileorca.vmatusita.workers.dev, e a do commit `4b169ae` é https://48a71195-fileorca.vmatusita.workers.dev.

Conferido no commit `4b169ae`, por `curl` e com o Playwright, nos dois endereços:

- `/`, `/image-tools/`, `/heic-to-jpg/`, `/compress-image/`, `/pt/comprimir-imagem/` e `/es/` respondem 200 com `x-robots-tag: noindex` (a regra de `*.workers.dev`, mesmo com `LAUNCHED = true`); `/nao-existe/` responde 404 com `noindex`.
- `/build.txt` traz `4b169aef603a8bd643ff395528728fcea43e83dd`.
- `/_astro/libheif-BfiPCEgt.wasm` responde 200 com `Content-Type: application/wasm` e `Cache-Control: public, max-age=31536000, immutable`, e o SHA-256 do arquivo baixado é `184d3d20f8323877f13e9f5254f9c6a0ce272c9a3a2f823b0b2bcd2ee9f73f80`, o mesmo do `libheif.wasm` do pacote.
- No Chromium (temas claro e escuro) e no WebKit, a 360 px, com os cookies recusados:
  - a HEIC to JPG converteu a `heic-06` ("Done! Your photo is converted.", `heic-06-iphone7-paisagem-gps.jpg`, 4032 × 3024);
  - a Compress image comprimiu a `jpg-02` ("Done! Your image is 72% lighter.").
  - Nenhuma requisição saiu do domínio da prévia nos seis casos.

| Prévia, 360 px | Claro | Escuro |
| --- | --- | --- |
| HEIC to JPG com a `heic-06` | [claro](fase-02/previa-heic-to-jpg-light-360.png) | [escuro](fase-02/previa-heic-to-jpg-dark-360.png) |
| Compress image com a `jpg-02` | [claro](fase-02/previa-compress-image-light-360.png) | [escuro](fase-02/previa-compress-image-dark-360.png) |

## Decisões novas

- § 58: pt e es no ar.
- § 59: aceitos e registro.
- § 60: YouTube 1280 × 720.
- § 61: codecs de uma thread sob demanda.
- § 62: qualidade dos codificadores.
- § 63: HEIC nativo ou libheif.
- § 64: truncado e corrompido.
- § 65: caminho sem canvas.
- § 66: tamanho-alvo.
- § 67: fixtures e oráculo.
- § 68: `gate:conteudo`.
- § 69: a ilha.
- § 70: dois arquivos JS por página.
- § 71: eventos e café por lote.
- § 72: antes e depois.
- § 73: Resize e campo de número.
- § 74: Crop.
- § 75: lançamento.
- § 76: axe num carregamento.
- § 77: hub, home e rodapé.
- § 78: busca por idioma.
- § 79: licenças e LGPL.
- § 80: matriz.
- § 81: anúncios, orçamentos e SEO.
- § 82: testes mudados.
- § 83: tempo do CI.
- § 84: menu de idioma.
- § 85: válvula (e) e (f).
- § 86: correções da revisão.
- § 87: CI acima de 900 s, sem mais cortes.

ADR-003 (Proposta): Playwright do CI em partes.

## Revisão adversarial

Uma passada em contexto limpo, com quatro subagentes Sonnet que não viram o código sendo escrito, contra a ficha e o diff da branch. As lentes foram:

- arquivos certos e integridade dos testes;
- privacidade, anúncios e consentimento;
- acessibilidade e design system;
- desempenho, SEO e lançamento.

Achou 1 crítico, 2 altos, 9 médios e 14 baixos. Todo crítico e alto foi corrigido. Dos médios, todos foram corrigidos, menos a memória do PDF de 40 fotos (só a cópia extra saiu) e a régua do lote longo, que ficou como pendência.

| Achado | Sev. | O que mudou |
| --- | --- | --- |
| O `verificar` passou de 900 s no CI (1457 s) | crítico | axe no modo legado e só com as violações, estados num carregamento (§ 83); válvula (e) e (f) (§ 85); ADR-003 |
| 4 testes falhavam só no Ubuntu: chip esperado por 5 s depois da foto de 8 MP; nome do download com `_` no WebKit do Linux | alto | `useImage` antes do chip; o nome é lido do link da ilha e o nome salvo aceita a troca do WebKit (§ 83) |
| O Download do lote alargava a página a 320 e 360 px (390 px em espanhol) | alto | o rótulo quebra a linha, com o tamanho embaixo; reflow testado em en, pt e es (§ 86) |
| O `stripJpeg` copiava o que vem depois do EOI (MPF, Ultra HDR, vídeo da foto em movimento), com GPS próprio, no original que volta sem ganho | médio | corta no EOI, percorre os scans, tira o MPF; sete testes (§ 86) |
| As alças do Crop saíam da coluna a 320 px | médio | margem de 24 px no `.fo-crop` (§ 86) |
| O foco caía no `body` depois de Remover, Cancelar e "Show more" no PDF | médio | foco na linha vizinha ou na primeira linha nova (§ 86) |
| Lote em andamento sem anúncio e com o foco perdido | médio | rótulo do progresso na região de status e foco no WaterLevel (§ 86) |
| Opção que dá a mesma frase não era anunciada | médio | a região é esvaziada antes da frase nova (§ 86) |
| Nenhum teto de pixels no caminho sem canvas | médio | recusa acima de 50 MP (§ 86) |
| PDF de 40 fotos de 12 MP: perto de 0,5 GB no worker, mais uma cópia na página | médio | o worker entrega com `transfer` (some uma cópia); a régua do lote longo fica para a F5 (pendência) |
| O PDF da matriz era aberto por um leitor leniente | médio | conferência estrita no Node e `PDFDocument.load` (§ 85) |
| A política de privacidade prometia calculadoras | baixo | frase no presente, nos três idiomas (§ 86) |
| `$&` num nome de arquivo e `{tool}` no nome quebravam o texto | baixo | troca por função e partição antes do nome (§ 86) |
| Os testes por página passariam num 404 | baixo | status 200 exigido no `a11y.spec.ts` (§ 83) |
| O menu de idioma de página só em inglês sem registro nem teste | baixo | § 84 e teste no `navigation.spec.ts` |
| A § 82 contava errado as rotas e não citava dois auxiliares | baixo | corrigida |
| Comentário errado no worker sobre o caminho na página | baixo | corrigido |
| O plano cita nomes de testes que mudaram (`image-heic.spec.ts`, `bmff.test.ts`, `gen-large`) | baixo | registrado aqui: os nomes reais são os casos HEIC da matriz, `engine-bmff.test.ts`, `engine-choice.test.ts` e `gen-grande-4100x4100.jpg` |
| A caixa do Crop não expõe valor, o erro dos campos do Crop não diz a faixa, uma caixa muito pequena só se move pelo teclado, a escolha da foto na fila é só a miniatura e a borda, o BeforeAfter diz só "50", o resultado é anunciado duas vezes, sobretítulo e H1 do hub iguais, o `PDFDocument` da semente não confere metadados por conta própria | baixo | não mudou nesta run; fica para a F3 (nota abaixo) |

Depois das correções, a revisão achou mais um problema: o link dentro de uma linha de erro ficava em 4,32:1. O cartão maior do lote pôs o link ao alcance do axe, e ele agora é sublinhado e herda a cor da linha (§ 86).

## O que a válvula cortou

**(e) Convert to WebP/AVIF e (f) AVIF to JPG**, nesta ordem, como a ficha manda quando o tempo do CI passa de 800 s (§ 85). Saíram as páginas, os textos, as entradas no registro, na busca, no hub, na home e no rodapé, e os testes delas. O motor ficou inteiro, com os testes unitários: decodificação e codificação de AVIF, codificação de WebP e a operação `convert`. Um AVIF largado nas outras ferramentas é recusado sem link.

O que falta para a **run 2b**:

1. As duas páginas, com os textos, o lugar no hub, na home, no rodapé e na busca, e os chips das outras ferramentas.
2. Os casos delas na matriz: AVIF na saída, decodificado onde o navegador sabe e conferido pelos bytes onde não sabe, como estava nos commits `3812f49` e `840d565`, que a 2b pode recuperar.
3. A medida do codificador AVIF no runner do CI, a parte mais pesada da matriz (50 s no WebKit do CI).
4. A decisão da ADR-003, porque com as duas ferramentas de volta o tempo do CI volta a subir.

Os itens (a) a (d) não foram cortados.

## O que é do Victor, em passos

1. Decidir a ADR-003 (dividir o Playwright do CI em partes). Sem ela, esta PR não mescla sozinha: o `verificar` do CI passa de 900 s num job só de 2 vCPU, mesmo com todos os testes verdes (seção "CI na PR"). Ou seja, o lançamento depende desta decisão. As saídas são aplicar a opção 1 da ADR numa run curta (`ajuste-ci-partes`) e depois rodar o CI desta PR de novo, ou mesclar esta PR à mão sabendo que só o tempo falhou.
2. Depois do merge, no Search Console: enviar `https://fileorca.com/sitemap-index.xml` e pedir a indexação da home (`/`) e do hub (`/image-tools/`).
3. No Bing Webmaster: enviar o mesmo sitemap.
4. Conferir o fileorca.com no celular e no computador, nos dois temas, com uma foto do próprio celular em cada ferramenta: Compress, Resize, Crop, Rotate, HEIC to JPG, WebP to JPG, PNG ↔ JPG, Image to PDF e os três presets.
5. Conferir a HEIC to JPG/PNG no Safari de um iPhone ou Mac quando tiver um à mão, porque o caminho nativo do HEIC não roda no CI. Nos primeiros dias, olhar o `tool_error` no GA4 (parâmetros `codec` e `reason`).
6. YouTube thumbnail: a ajuda oficial (lida em 31/out/2026) pede 16:9, largura mínima de 640, JPG/PNG, até 2 MB no celular e recomenda 3840 × 2160. O preset entrega 1280 × 720 até 2 MB, como manda o critério 7. Decidir se o padrão sobe (§ 60).
7. Pendências da F1a e da F1b que seguem abertas:
   - os campos vazios do `docs/F0-SAIDA.md`;
   - o e-mail da marca;
   - os textos que dependem de conta: valores do Ko-fi, retenção do GA4 e leitura jurídica das bases legais e do foro;
   - § 24 (LanguageTool local ou API pública) e § 37 (Node 26 e pnpm 12);
   - o "Comando de preview" do painel do Workers Builds;
   - a foto do Sobre;
   - a busca reversa da Oli;
   - `PUBLIC_ADS_ENABLED` desligado até a aprovação do AdSense. Os Termos e a Privacidade dizem "mostra, ou vai mostrar, anúncios": vale rever quando os anúncios ligarem.
8. Gerar o prompt da F3 e o da run 2b (Convert to WebP/AVIF e AVIF to JPG).

## Nota para a F3

- **Onde a revisão deve olhar com mais cuidado:**
  - o tempo do CI, porque toda ferramenta nova põe mais trabalho de codec na mesma fila de 2 vCPU (ADR-003);
  - a acessibilidade da ilha que o axe não vê (os baixos da tabela acima: valor da caixa do Crop, faixa no erro dos campos, BeforeAfter sem `aria-valuetext`, anúncio duplicado);
  - o caminho na página quando o worker não tem `OffscreenCanvas` (Safari antigo), que roda os codecs na thread principal e baixa outra cópia de cada `.wasm`;
  - a memória de lotes longos no celular.
- **Para acrescentar uma ferramenta de imagem:** a receita está no CLAUDE.md ("F2: ferramentas de imagem"). O registro manda no hub, na home, no rodapé, na busca, no `gate:seo` e no `gate:conteudo`, mas as listas de páginas do `budgets.spec.ts` e do `ads.spec.ts` e os casos da matriz são manuais.

## Nota para a F5

- **Motor de imagem como código aberto:** `src/engine/image/` já é autocontido (regra do ESLint: nada importa de fora da pasta), o contrato está em `types.ts`, e os testes unitários (`tests/unit/engine-*.test.ts`, `strip.test.ts`) e o oráculo das fixtures não dependem do site. Para virar um pacote ainda faltam:
  - separar o `worker.ts` do Comlink do site;
  - tirar os `?url` do Vite (aceitar URLs de `.wasm` por opção);
  - um README com o contrato e as decisões (§ 59 a § 66, § 86);
  - a licença (MIT) e o aviso das licenças dos codecs, que já estão escritos em `src/platform/licenses.ts`.
- **Semente do motor de PDF** (`src/engine/pdf/build.ts`):
  - monta um PDF com uma página por imagem, nos tamanhos "image", "letter" e "a4" (margem de 36 pt, imagem pequena centralizada sem ampliar além do papel);
  - JPEG embutido como veio e PNG quando há transparência;
  - Producer e Creator "FileOrca", sem a data de criação;
  - `useObjectStreams: false` e entrega com `transfer`.
- **O que a semente ainda não faz:** limpar metadados por conta própria (hoje depende de receber pixels recodificados pela operação `pdf-page`) e montar o PDF em partes, sem guardar todas as páginas na memória.
