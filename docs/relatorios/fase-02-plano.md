# F2 · Plano da run (imagem em inglês e lançamento)

Gabarito da run e da revisão adversarial. Autoridade: `docs/prompts/prompt-fase-02.txt` (a ficha), depois o CLAUDE.md, o PLANO (ficha F2 e seções citadas), `docs/design/` e o DECISOES.md. Escrito em 31/out/2026, a partir da exploração (plano, design system, bibliotecas instaladas, testes e CI, fixtures).

## 1. O que a exploração mostrou (fatos que mudam o desenho)

- **Bibliotecas.** Os pacotes do jSquash não têm `exports`: dá para importar só a build de uma thread (`@jsquash/avif/codec/enc/avif_enc.js`, `@jsquash/oxipng/codec/pkg/squoosh_oxipng.js`, `@jsquash/webp/codec/enc/webp_enc_simd.js`, `@jsquash/resize/lib/resize/pkg/squoosh_resize.js`). Importar o índice ou o `encode.js` do pacote põe no `dist/` as builds de várias threads, o `pkg-parallel` do OxiPNG, o hqx e o `SharedArrayBuffer` do `wasm-feature-detect`. O `.wasm` entra com `?url` e o Vite copia o arquivo sem alteração.
- **libheif-js.** A build com o `.wasm` separado é `libheif-js/libheif-wasm/libheif.js` + `libheif.wasm` (1.463.506 bytes, SHA-256 `184d3d20…f73f80`). Ela aplica `irot`/`imir`/`clap` (as dez HEIC saem nas dimensões da coluna "Aparece"), entrega a imagem principal por `is_primary()` (a ordem é a dos ids, não a do `pitm`), não detecta HEIC truncada e não converte cor: 8 das 10 HEIC vêm em Display P3.
- **jSquash.** O decodificador JPEG não aplica a Orientation (só com `preserveOrientation: true`) e não reclama de arquivo truncado (só escreve "Premature end of JPEG file" no `printErr`); o de WebP recusa WebP animada; o OxiPNG `optimise(bytes)` mantém todos os chunks auxiliares (`optimise_raw(pixels)` e o `strip` antes resolvem). AVIF 12 MP com qualidade 50: velocidade 10 = 1,0 s, 8 = 2,5 s, 6 = 9,4 s (Ryzen 7600X).
- **Navegadores no Windows.** Nenhum dos dois decodifica HEIC; o `canvas.toBlob` grava JPG, PNG e WebP nos dois e devolve PNG para AVIF; o WebKit não tem `OffscreenCanvas` no worker; um canvas de 25 MP funciona nos dois (a escolha do caminho sem canvas é pelo número de pixels, como manda a decisão 7).
- **@cantoo/pdf-lib.** `create({ updateMetadata: false })` + `setProducer/setCreator('FileOrca')` + `save({ useObjectStreams: false })` dá um Info só com Producer e Creator. O `embedJpg` embute os bytes do JPEG como estão (o JPEG original levaria o Exif para dentro do PDF). O chunk tem 241 KB gzip, só no worker do PDF.
- **fflate.** `Zip` + `ZipPassThrough` monta um ZIP armazenado em `Blob` sem cópia e sem worker aninhado.
- **CI.** Último verde da F1b: `pnpm verificar` 488,6 s, Playwright 407,2 s (474 testes, 2 workers). O `a11y.spec.ts` é 58,6 % do tempo e cresce sozinho com as 14 páginas novas (+100 a 150 s de parede). A projeção ingênua da F2 é 950 a 1.050 s.
- **Requisições.** A página de ferramenta faz 6 (Chromium) e 7 (WebKit) de 8; o par novo `/image-tools/` → `/heic-to-jpg/` só aceita HTML + 2 JS. A ilha compartilhada tem de sair em 2 arquivos de JS por página.
- **Testes que quebram com o comportamento novo:** `pos-deploy.test.ts` e `navigation.spec.ts` (noindex antes do lançamento), os testes da busca com uma ferramenta só, `routes.test.ts`, `seo-checks.test.ts` (tamanho do sitemap), `filecard.test.ts` (o `gain` obrigatório), `tool.spec.ts` (o chip para `/`), `ads-pages.test.ts`, `coffee.test.ts` (o caminho do módulo). O `gate:licencas` já está vermelho com a LGPL do `libheif-js`.
- **Fixtures.** Os 17 SHA-256 do ORIGEM batem. A `heic-09` tem a tag de GPS vazia (o ORIGEM diz que tem GPS); a `heic-10` tem GPS zerado. O item primário das dez HEIC é `grid`; a `heic-09` tem o `meta` depois do `mdat`.

## 2. Árvore do que nasce ou muda

```
scripts/fixtures/            gerador determinístico das fixtures (TypeScript, Node + Chromium do Playwright)
  generate.ts  lib/*.ts
scripts/gates/conteudo.ts    portão de conteúdo mínimo (novo, no verificar depois dos links)
scripts/lib/conteudo.ts      checagens puras do portão
fixtures/images/             fixtures geradas (gen-*) + expected.json (oráculo)
fixtures/ORIGEM.md           linhas novas em "Gerados por script"
src/engine/image/            motor (código aberto depois da F5; nada de fora da pasta)
  types.ts      contrato (operações, resultados, notas, razões)
  sniff.ts      formato pelos bytes (JPEG, PNG, WebP, GIF, ftyp HEIC/AVIF)
  bmff.ts       parser ISO-BMFF/HEIF: pitm, iinf, iloc, iref, ipco/ipma (ispe, irot, imir, clap, colr, auxC), Exif
  structure.ts  arquivo completo? (JPEG até o EOI, PNG até o IEND, WebP pelo RIFF, HEIF pelas extensões do iloc)
  probe.ts      dimensões de exibição sem decodificar
  pixels.ts     operações em ImageData: orientação, giro, espelho, corte, fundo branco, P3 → sRGB
  codecs/       carregadores sob demanda: jpeg.ts webp.ts avif.ts png.ts resize.ts heic.ts (só build de uma thread)
  decode.ts     nativo (createImageBitmap) ou WASM; a escolha HEIC nativo × libheif; o caminho sem canvas
  encode.ts     toBlob nativo ou jSquash (MozJPEG, OxiPNG, WebP, AVIF)
  target.ts     tamanho-alvo (escala estimada por bytes/pixel + busca binária da qualidade)
  process.ts    o pipeline de uma operação sobre um arquivo
  zip.ts        ZIP armazenado com o fflate
  strip.ts      (existe) metadados sem perda, § 33
  worker.ts     Comlink: process, zip, warm
src/engine/pdf/              semente do motor de PDF da F5 (worker próprio, @cantoo/pdf-lib)
  build.ts  worker.ts
src/tools/image/             a ilha compartilhada
  ImagePanel.tsx  Queue.tsx  BeforeAfter.tsx  NumberField.tsx  engine-client.ts  pdf-client.ts
  coffee.ts (vem da compress-image)  names.ts (nomes únicos)  paste.ts  registry.ts  ImageToolPage.astro
  i18n/en.ts pt.ts es.ts  (ImagePanelTexts)
src/tools/<slug>/            uma pasta por ferramenta: <Slug>Page.astro, Panel.tsx (opções + operação), mount.ts, i18n/en.ts
src/tools/<parent>/presets/<name>/   os presets (página, painel, mount, i18n/en.ts)
src/pages/<slug>/index.astro, src/pages/<parent>/<name>/index.astro, src/pages/image-tools/index.astro
src/views/ImageToolsView.astro (hub), HomeView.astro (grade), Footer.astro (coluna Image)
src/i18n/routes.ts, types.ts, texts.ts, */common.ts, en/image-tools.ts
src/search/, src/pages/search-index.json.ts, src/seo/images.ts, src/pages/og/
src/analytics/events.ts (ids e valores novos), src/platform/site.ts (LAUNCHED), src/platform/licenses.ts
src/views/LicensesView.astro (aviso da LGPL, fonte do libheif)
tests/e2e/lib/  png.ts webp.ts bmff.ts pdf.ts zip.ts pixels.ts (leitores de metadado e cabeçalho)
tests/e2e/      matriz por ferramenta (image-*.spec.ts), specs atuais adaptados
tests/unit/     motor (sniff, bmff, structure, pixels, target, escolha de caminho), conteudo, registry, names
docs/relatorios/fase-02.md, fase-02/ (screenshots), DECISOES.md § 58 em diante, CLAUDE.md (seção F2)
```

## 3. Desenho

### 3.1 Motor (`src/engine/image/`)

Uma chamada `process(file, op, accepts)` por arquivo, no worker (Comlink), ou na página quando o worker não tem `OffscreenCanvas` (§ 22).

1. **Formato pelos bytes** (`sniff.ts`). JPEG `FF D8 FF`, PNG pela assinatura, WebP `RIFF…WEBP`, GIF, e o `ftyp`: AVIF pela marca principal `avif`/`avis`; HEIC por `heic/heix/heim/heis/hevc/hevx`; com marca principal `mif1`/`msf1`, decidem as compatíveis e, se houver as duas famílias, o tipo do item primário (`av01` × `hvc1`/`grid`). Vazio → `empty`; o resto → `unknown`. Formato fora do `accepts` → `wrong-tool` (com link para a HEIC to JPG ou a AVIF to JPG) ou `wrong-format`.
2. **Arquivo completo** (`structure.ts`). JPEG: caminha pelos segmentos e pelos dados entre marcadores até o `EOI`; sem `EOI` → `truncated`; segmento malformado → `decode`. PNG: até o `IEND`. WebP: o tamanho do RIFF cabe no arquivo. HEIF/AVIF: toda extensão do `iloc` cabe no arquivo. Assim o truncado e o corrompido dão erro igual nos dois navegadores, sem depender do decodificador.
3. **Dimensões de exibição** (`probe.ts`): SOF + Orientation no JPEG (só segmentos de topo: a miniatura do Exif tem SOF próprio), IHDR, VP8/VP8L/VP8X, e no HEIF o `ispe` do item primário com `irot` (e `clap`).
4. **Caminho.** Até 16.777.216 px, canvas (`createImageBitmap` com `imageOrientation: 'from-image'`, `OffscreenCanvas` ou `<canvas>`). Acima, sem canvas: decodificador do jSquash (JPEG com orientação aplicada, WebP, AVIF) ou libheif → `ImageData` → corte, giro e espelho em código próprio, redimensionamento pelo `@jsquash/resize` → codificador do jSquash. A escolha é uma função pura testada no Vitest.
5. **HEIC.** Primeiro o nativo; ele só vale se as dimensões baterem com as do contêiner (`bmff.ts`); senão o libheif (`wasmBinary` buscado do `?url`, imagem por `is_primary()`). A orientação vem só das transformações do contêiner; a Orientation do Exif da HEIC nunca é aplicada de novo. Com perfil Display P3 no `colr`, os pixels do libheif passam por P3 → sRGB (curva sRGB, matriz 3×3 em luz linear, tabelas). Escolha testada no Vitest com decodificadores falsos.
6. **Codificar.** Compress: MozJPEG (Recommended 75, Strong 55), WebP do jSquash (75 e 55), PNG pelo `strip` + OxiPNG sobre os bytes (sem perda, qualquer tamanho). Conversões: `toBlob` nativo; se o tipo devolvido não for o pedido, o jSquash. AVIF sempre jSquash, velocidade fixada pela medida (§ registrado). PDF: JPEG para foto, PNG com transparência. Toda saída nova sai dos pixels, sem Exif, XMP, IPTC ou GPS; sem ganho ou sem codificador, o original volta pelo `strip` (§ 33).
7. **Tamanho-alvo** (`target.ts`): mede bytes/pixel numa prévia pequena, reduz a imagem para caber, faz a busca binária da qualidade (teto de tentativas) sobre a imagem reduzida e, se nem a menor qualidade cabe, reduz mais; o resultado diz as dimensões novas. Nunca recodifica a foto inteira várias vezes. Testado com codificador falso.
8. **ZIP** (`zip.ts`): `Zip` + `ZipPassThrough` (armazenado), nomes já únicos.
9. **WASM sob demanda**: cada codec é um `import()` dentro do worker; o `warm(kind)` busca o `.wasm` quando o ponteiro entra na zona ou o botão recebe o foco. Nenhum worker nem `.wasm` no JS inicial.

### 3.2 PDF (`src/engine/pdf/`)

Worker próprio. Recebe as páginas já prontas do motor de imagem (operação `pdf-page`: pixels orientados, JPEG ou PNG limpos) e o tamanho da folha: "Image size" = página do tamanho da imagem (1 px = 1 pt); Letter e A4 com margem de 36 pt, folha deitada para imagem deitada. Producer e Creator "FileOrca", sem título, autor, palavra-chave, datas ou XMP. Trocar o tamanho da folha só remonta o PDF.

### 3.3 A ilha compartilhada (`src/tools/image/`)

- Um `ImagePanel` por página, renderizado no servidor e hidratado pelo `mount.ts` da ferramenta (§ 23). Cada ferramenta passa o componente de opções e a função que monta a `Operation`.
- Ordem na página: slot (DropZone → WaterLevel → ResultCard, retângulo reservado do § 20) → BeforeAfter no celular → opções → fila (`.fo-filelist`) → chips → primeiro AdSlot. O Baixar não se move depois que aparece.
- Lote sem limite (soltar, clicar e Ctrl+V; o colar não vale em campo de texto, na busca ou em diálogo). Um arquivo de cada vez no worker. O WaterLevel só depois de 400 ms, com "48%, 5 of 12 images". Soltar ou colar com um resultado na tela começa um lote novo.
- FileCards: esperando, processando (`fo-bar`), pronto, sem ganho, erro com a razão em uma frase; com mais de 6, 6 e "Show N more"; cada linha com o download dela. Um lote em que todos os arquivos falham mostra o erro na DropZone, como hoje (mantém os testes da F1b); num lote misto, o erro fica na linha e o resto sai.
- Um arquivo só baixa direto; o lote baixa num ZIP montado no worker ("Download all · ZIP 9.4 MB"); na compressão, a soma do ganho. A Image to PDF baixa um PDF.
- Opção trocada reprocessa o lote na hora (sem Aplicar, sem tirar o foco); campos numéricos esperam a pessoa parar de digitar (meio segundo). O foco vai para o Baixar quando o card aparece para um lote novo.
- "Start over" limpa a fila e revoga as URLs; bitmaps fechados, saídas como `Blob`.
- Um lote é uma tarefa: um `tool_start`, um `tool_complete` e um uso do café quando houve uma saída de verdade.
- pt e es: a Compress image usa a mesma ilha, com os textos novos e só o chip "Mais ferramentas".

### 3.4 Páginas

Molde ToolPage para as 10 ferramentas e os 3 presets: breadcrumb Home › Image tools › ferramenta (› preset), H1 + PrivacySeal, painel, chips, AdSlot, "How to" (`data-content="how"`), especificações e, na mãe, a tabela de presets (`data-content="specs"`), perguntas (`data-content="faq"`), privacidade (`data-content="privacy"`), relacionadas (`data-content="related"`). Hub `/image-tools/` com `fo-hubband`, grade e presets. Home em inglês com a grade das ferramentas de imagem e o link do hub; pt e es seguem só com a Compress image. Busca com todas as ferramentas e presets, mostrando em cada idioma só o que existe nele. OG com o ícone da ferramenta. Menu de idioma: o link de um idioma sem a página vai para a home dele (como já é).

### 3.5 Presets

- `/compress-image/to-100kb/` e `/compress-image/to-1mb/`: saída JPG de no máximo 100.000 e 1.000.000 bytes; o que já cabe volta sem metadados, no formato dele; a transparência vira branco e a tela diz isso.
- `/resize-image/youtube-thumbnail/`: 1280×720 JPG, até 2 MB, corte central; a página oficial (https://support.google.com/youtube/answer/72431, lida em 31/out/2026) pede 16:9, pelo menos 640 px de largura, JPG ou PNG e até 2 MB pelo celular, e recomenda 3840×2160; 1280×720 cabe nessas regras (§ registrado e pendência para o Victor).
- Cada preset muda o comportamento e tem 3 blocos próprios (especificação, passos e perguntas), conferidos pelo `gate:conteudo`.

## 4. Critérios → evidência

| # | Critério | Teste ou comando |
| --- | --- | --- |
| 1 | verificar verde local e no CI, ≤ 900 s (CI ≤ 800 s) | `pnpm verificar` (saída no relatório), `gh run view` |
| 2 | 15 portões + `gate:conteudo`, nada afrouxado | `scripts/verificar.ts`, revisão do diff dos testes |
| 3 | matriz ferramenta × fixture × navegador | `tests/e2e/image-*.spec.ts` gravam `test-results/matriz/*.json`; `scripts/fixtures/matrix-table.ts` monta a tabela |
| 4 | nenhuma saída com GPS/Exif/XMP | leitores `tests/e2e/lib/{jpeg,png,webp,bmff,pdf}.ts` sobre toda saída da matriz |
| 5 | corrompido, truncado, vazio e texto com extensão errada | matriz (no meio do lote) + teste de lote novo depois |
| 6 | lote, ZIP, nomes únicos, download direto, Ctrl+V, "Show N more" | `image-batch.spec.ts` |
| 7 | presets nos bytes e dimensões | `image-presets.spec.ts` |
| 8 | HEIC: dez JPG nas dimensões, `heic-10` com um arquivo, SHA-256 do `.wasm`, escolha do caminho e parser | `image-heic.spec.ts`, `tests/unit/bmff.test.ts`, `tests/unit/decode-choice.test.ts`, teste do `dist/` |
| 9 | caminho sem canvas na Compress e na Resize | matriz com `gen-large` + `tests/unit/decode-choice.test.ts` |
| 10 | privacidade (requisições, `crossOriginIsolated`, COOP/COEP, build de várias threads, números digitados, eventos) | matriz (requisições), `image-privacy.spec.ts`, teste do `dist/` (nomes `_mt`, `pkg-parallel`, `SharedArrayBuffer`) |
| 11 | JS inicial ≤ 80 KB, ≤ 8 requisições, ≤ 3 novas | `budgets.spec.ts` sobre as rotas + os pares novos |
| 12 | Lighthouse em `/compress-image/` e `/image-tools/` | `lighthouserc.json`, `pnpm lhci` |
| 13 | axe em toda página e nos estados novos | `a11y.spec.ts` (rotas + estados), teclado do corte em `image-crop.spec.ts` |
| 14 | distância dos AdSlots | `ads.spec.ts` (alvos novos: NumberFields, alças, fila) |
| 15 | `gate:conteudo` com teste de unidade | `tests/unit/conteudo.test.ts` |
| 16 | `LAUNCHED = true` e `_headers` | `tests/unit/platform.test.ts`, `gate:cabecalhos` |
| 17 | sitemap, hreflang, órfãs, links | `gate:seo`, `gate:links`, `tests/unit/seo-checks.test.ts` |
| 18 | /licenses e `gate:licencas` | `gate:licencas`, `tests/unit/quality.test.ts` |
| 19 | prévia da PR | curl + Playwright contra a URL da prévia (relatório) |
| 20 | depois do merge | curl e `gh run list --workflow pos-deploy.yml` (só leitura) |

## 5. Tempo do CI

Alvo: ≤ 800 s no commit final. O que a run faz, sem reduzir alcance:

1. `a11y.spec.ts`: uma carga de página por página e navegador, com as duas larguras e os dois temas no mesmo teste (`setViewportSize` e `emulateMedia`), mesmas regras do axe e o mesmo movimento reduzido. Corta de 3 a 4 cargas por página.
2. Matriz: uma página por ferramenta e navegador recebe o lote inteiro num envio só e confere cada saída a partir do ZIP, no Node. As fixtures geradas ficam pequenas (até 1600 px), a grande é um JPG simples logo acima do limite.
3. HEIC: JPG com as dez (em dois lotes de cinco, para caber nos 60 s do WebKit no CI), PNG com a `heic-05`, a `heic-07` e a `heic-10`.
4. Presets com uma foto grande, o PNG transparente e o WebP.
5. Orçamentos e distância dos anúncios das páginas novas no mesmo teste por página e largura.
6. Primeiro push cedo (PR em rascunho) para medir o custo por arquivo no runner e projetar o resto.

Se mesmo assim passar de 800 s: a válvula corta (e) e (f) e a run escreve uma ADR "Proposta" para dividir o Playwright do CI.

## 6. Fora

Tudo da seção "Fora" do prompt: `.github/` e `scripts/ci/`, PDF além da Image to PDF, calculadoras (menos o NumberField), páginas novas em pt e es, Pix, anúncio ligado, service worker, levar o arquivo entre ferramentas, GIF e vídeo, cor/ícone/pose fora do design system.

## 7. Ordem de execução

1. Fixtures, oráculo e leitores (commit próprio, antes do motor). Em paralelo: `gate:conteudo` e os textos das páginas.
2. Motor (decodificar, orientar, transformar, codificar, metadados, worker, codecs sob demanda, caminho sem canvas) e o motor de PDF.
3. A ilha compartilhada com lote, fila, ZIP e Ctrl+V; a Compress image migrada (en, pt, es).
4. PR em rascunho e a primeira medida do CI.
5. Resize, HEIC to JPG/PNG, Image to PDF; os presets.
6. Crop, Rotate, WebP to JPG/PNG, PNG to JPG.
7. Hub, home, busca, relacionadas, chips; `gate:conteudo` no verificar.
8. Licenças e `LAUNCHED = true`.
9. AVIF to JPG e Convert to WebP/AVIF.
10. Válvula, screenshots, revisão adversarial, relatório, `gh pr ready`, conferências depois do merge.
