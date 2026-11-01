# F5a · plano de execução (gabarito da revisão)

1/nov/2026 · branch `fase-05a` · base `6865938` (merge da F4). Este plano é a tradução da ficha da run (`docs/prompts/prompt-fase-05a.txt`) em arquivos, interfaces e testes. Ele é autossuficiente: a revisão adversarial do fim confere o código contra ele e contra a ficha.

## 1. O que a exploração fixou

- **Versões.** `pdfjs-dist` 6.4.299 (3/out/2026; a anterior é 6.3.289) e `@neslinesli93/qpdf-wasm` 0.3.0 (27/jun/2025). Nenhuma foi publicada hoje. O `@napi-rs/canvas` (MIT, opcional do PDF.js, só Node) entra no lock pela árvore do `pdfjs-dist`; os testes o usam pelo próprio PDF.js para desenhar páginas no Node (PSNR), nunca por import direto.
- **PDF.js 6.x não cobre o Safari 16.4.** O `gulpfile.mjs` da 6.4.299 fixa Safari ≥ 18 nos dois builds. Pela ficha, entra o build **legacy** (`pdfjs-dist/legacy/build/`), com três polyfills de poucas linhas carregados antes dele: `Promise.withResolvers` (Safari 17.4), `Response.prototype.bytes` e `Blob.prototype.bytes` (Safari 18.2). O WebKit do Playwright é mais novo que o 16.4, então o piso fica registrado como risco, sem prova automática.
- **`isEvalSupported` não existe mais** (saiu entre a 5.4.624 e a 5.7.284). O JS publicado da 6.4.299 não tem `eval(` nem `new Function`; o legacy tem um `Function('return this')()` morto (shim do core-js, depois de `globalThis ||`). Um teste lê o JS publicado e o `dist/` e só aceita esse caso conhecido.
- **`jbig2.wasm` do PDF.js decodifica JBIG2 e CCITT** (a fixture da NASA depende dele). O `wasmUrl` é obrigatório.
- **Fontes padrão.** Só as Foxit (BSD-3-Clause) vão ao `dist/`. As Liberation (GPL-2.0 com exceção de fonte) ficam fora: a licença não está na lista do projeto. O `.icc` (CC0-1.0) também fica fora, sem `iccUrl`. O `quickjs-eval.*` (scripting) nunca vai ao `dist/`.
- **qpdf 12.2.0** dentro do `.wasm`, cripto `native` (`--show-crypto` dá `native`), zero `SharedArrayBuffer`, `Atomics`, `pthread` e `Worker` no JS de cola e no `.wasm`, memória não compartilhada. Componentes: zlib (commit `21767c6`, licença zlib no README) e libjpeg-turbo 2.1.1 (fork ImageMagick `7aa2a89`, IJG + BSD-3 + zlib). O pacote não traz LICENSE: os textos vêm do upstream, byte a byte, para `src/platform/license-texts/`.
- **A cola do qpdf não aceita `print`/`printErr`.** A saída é capturada por `noFSInit` + `FS.init(null, out, err)` no `preRun` (um byte por chamada), e nunca chega ao `console`.
- **CI.** A base real é a execução 41279494308 (pós-§ 142): `verificar` 294,8 s, Chromium 510,3 s, WebKit 431,0 / 278,3 / 658,8 s. O `--shard` divide por contagem, em blocos contíguos, na ordem alfabética; os `pdf-*.spec.ts` caem no fim, junto da matriz de imagem.

## 2. Arquivos novos e onde cada coisa mora

```
src/engine/pdf/                      motor, autocontido (ESLint), só pacotes
  worker.ts                          Comlink: build, report (contrato da F2/F4) + as operações novas
  types.ts                           PdfReason, PdfOperation, PdfInspect, PdfResult
  errors.ts                          PdfEngineError e loading() (modelo de src/engine/image/errors.ts)
  sniff.ts                           tipo pelos bytes (%PDF- no 1º KB), imagem/texto/vazio
  open.ts                            carga pelo pdf-lib, validação da estrutura, cifra
  qpdf.ts                            cola + .wasm sob demanda, captura de saída, MEMFS limpo
  pdfjs.ts                           PDF.js legacy sob demanda (worker: fake worker + OffscreenCanvas; página: HTMLCanvas)
  pdfjs-core.ts                      entrada de worker do PDF.js para o caminho da página
  polyfills.ts                       Promise.withResolvers, Response/Blob.bytes
  geometry.ts                        caixa visível (CropBox ∩ MediaBox) e /Rotate → coordenadas de usuário
  assemble.ts                        cópia de páginas para documento novo (Merge, Split, Delete): links, AcroForm, marcadores
  metadata.ts                        Info e XMP do documento de origem
  operations.ts                      rotate, numbers, watermark, sign, reorder (no lugar)
  compress.ts                        sem perda (qpdf), Recomendado (imagens DCT + qpdf), Forte (páginas como imagem)
  images.ts                          classificação das imagens DCT e recodificação (MozJPEG + Lanczos do jSquash)
  raster.ts                          PDF to JPG e o Forte sobre um Renderer (worker ou página)
  zip.ts                             ZIP "stored" (cópia de src/engine/image/zip.ts, por causa da regra de pasta)
src/tools/pdf/                       ilha única das 12 ferramentas (fora do chunk island)
  registry.ts                        PDF_TOOL_IDS, PDF_HUB_ID, PDF_PAGES (dados puros)
  types.ts                           PdfPanelData, PdfToolDef
  PdfIsland.astro                    o único <script> que importa mount.ts (uma entrada para as 12)
  mount.ts                           hidrata o PdfPanel com a definição da página
  PdfPanel.tsx                       a ilha: DropZone, WaterLevel, ResultCard, fila, opções, grade
  tools.tsx                          as 12 definições (opções, pedido ao motor, validação)
  PageGrid.tsx                       peça nova: grade de páginas
  PasswordField.tsx                  peça nova: campo de senha
  SignatureArea.tsx                  peça nova: área de assinatura
  TextField.tsx                      campo de texto e de faixas, no estilo do NumberField
  ranges.ts                          "1-3, 5, 8-10" → índices (na página; o motor só recebe números)
  names.ts                           nomes de saída únicos (modelo de image/names.ts)
  client.ts                          sob demanda: Comlink com o worker e o caminho da página para desenhar
  page.ts                            lado do build: data-props, migalhas, chips, relacionadas
  PdfToolPage.astro                  molde (o mesmo do ImageToolPage, blocos data-content)
  i18n/en.ts                         textos compartilhados do painel
src/tools/<slug>/i18n/en.ts          conteúdo de cada página (casa o TEXT_FILE do lint:texto)
src/pages/<slug>/index.astro         as 12 páginas; src/pages/pdf-tools/index.astro, o hub
src/views/PdfToolsView.astro         o hub
scripts/fixtures/pdf.ts              fixtures de PDF e o oráculo (já feito)
scripts/lib/qpdf.ts                  qpdf no Node para fixtures e testes (já feito)
scripts/oss/image-engine.ts          exportação do motor de imagem
```

Regra dos chunks: nada de `src/tools/pdf/` é importado por valor de `src/tools/image/`, `src/analytics/`, `src/icons/`, `src/i18n/format.ts` ou `src/oli/poses.ts`. O PDF importa da ilha de imagem só o que já está no `island` (`OptionGroup`, `NumberField`, `Oli`, `paste.ts`, `coffee.ts`, `summary.ts`, `FileCard`, `Icon.tsx`, `format.ts`, `events.ts`). Ícones da ilha de PDF vêm prontos no `data-props` (markup do `ICONS` no build), nunca por `?raw` (que levaria o SVG ao `island`). Nada de `src/tools/calc/` (seria uma segunda entrada a dividir um chunk).

## 3. Interfaces

### Registro (`src/tools/pdf/registry.ts`)

```ts
export const PDF_TOOL_IDS = ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages',
  'add-page-numbers-to-pdf', 'sign-pdf', 'protect-pdf', 'unlock-pdf', 'reorder-pdf-pages', 'watermark-pdf'] as const;
export const PDF_HUB_ID = 'pdf-tools';
export interface PdfPageDef {
  id: PdfToolId; path: string; icon: IconName;
  files: 'batch' | 'merge' | 'single';      // lote, N→1, um por vez
  run: 'auto' | 'action';                   // roda ao soltar (como as imagens) ou espera o botão
  next: readonly (PdfToolId | 'image-to-pdf' | 'compress-image')[];   // 2 a 4
  related: readonly (PdfToolId | 'image-to-pdf')[];                     // até 6
  suffix: string;                           // nome de saída: "<original>-<suffix>.pdf"
}
```

Ordem do hub: por faixa de volume do `data/keywords.csv` e, dentro da faixa, a ordem do CSV. A Image to PDF entra no hub como cartão para a página dela (que continua no hub de imagem), no fim da faixa de 100K–1M.

### Motor (`src/engine/pdf/worker.ts`, Comlink)

```ts
type PdfReason = 'empty' | 'not-pdf' | 'truncated' | 'corrupted' | 'needs-password' | 'wrong-password' | 'restricted'
  | 'not-encrypted' | 'too-large' | 'encode' | 'load';
interface PdfInspect { ok: true; pages: number; boxes: { width: number; height: number; rotate: number }[];
  lock: 'none' | 'restricted' | 'password'; form: { fields: number; xfa: boolean }; outline: boolean; repaired: boolean; }
type PdfOperation =
  | { kind: 'merge' } | { kind: 'split'; parts: number[][] } | { kind: 'delete'; keep: number[] }
  | { kind: 'reorder'; order: number[] } | { kind: 'rotate'; turns: number[] }      // um giro por página, 0..3
  | { kind: 'numbers'; position: Position; format: NumberFormat; start: number; skipFirst: boolean }
  | { kind: 'watermark'; text: string; size: 'small' | 'medium' | 'large'; opacity: 'light' | 'medium' | 'strong'; direction: 'diagonal' | 'horizontal' }
  | { kind: 'sign'; image: Uint8Array; pages: number[]; box: { x: number; y: number; width: number } }
  | { kind: 'compress'; mode: 'lossless' | 'recommended' | 'strong' }
  | { kind: 'protect'; password: string } | { kind: 'unlock'; password: string | null }
  | { kind: 'images'; format: 'jpeg' | 'png'; ppi: 72 | 150 | 300; pages: number[] | null };
type PdfResult = { ok: true; outputs: { bytes: Uint8Array; kind: 'pdf' | 'jpeg' | 'png'; page?: number; width?: number; height?: number }[];
  outcome: 'new' | 'unchanged'; notes: PdfNote[] } | { ok: false; reason: PdfReason };
api = { build, report, canvasInWorker, inspect(file, password?), process(op, files), thumbnail(fileId, page, width), release(fileId), zip(entries), warm(kinds) }
```

- Nunca rejeita por arquivo ruim; a falha de carga de código passa por `loading()` e vira `load`.
- O tipo vem dos bytes. Cifra: o pdf-lib acusa `/Encrypt`; o qpdf (só para o arquivo cifrado) diz se pede senha ou só tem restrições.
- `transfer` em toda saída de bytes. O qpdf apaga os arquivos do MEMFS depois de cada execução e a instância é trocada quando a memória passa de 512 MB.

## 4. Decisões de produto (cada uma vira um §)

| Tema | Decisão |
| --- | --- |
| Metadados | O PDF da pessoa mantém o Info e o XMP (in-place, pdf-lib com `updateMetadata: false`). Documento novo (Merge, partes da Split, Delete, Forte) leva o Info e o XMP do (primeiro) arquivo de origem, sem nada do aparelho. O qpdf (Compress, Protect, Unlock) preserva tudo. Fecha o item 8 da F2. |
| Formulário | Merge, Split e Delete copiam os campos cujos widgets ficam nas páginas copiadas (nomes repetidos ganham sufixo). Rotate, numeração, marca d'água, assinatura e Reorder mantêm o AcroForm. Toda ferramenta do pdf-lib tira o XFA e diz isso; o qpdf mantém o XFA. O Forte perde o formulário e diz antes. |
| Marcadores e links | Documento novo leva os marcadores e os links internos que apontam para páginas copiadas (remapeados); os que apontam para fora caem. Links para a web ficam. |
| Nomes | `<original>-<sufixo>.pdf`; Split por faixas `-part-N`, cada página `-page-N`; PDF to JPG `-page-N.jpg` (número da página do documento). Nenhum valor digitado entra no nome. ZIP `fileorca-pdfs.zip` (ou `fileorca-images.zip` na PDF to JPG). |
| Numeração | Helvetica 10 pt, margem de 28 pt da borda visível; "Page" em inglês; pular a primeira começa no início escolhido na página 2; "of N" é o último número. |
| Marca d'água | Helvetica Bold, cinza 50%, centro da página visível; diagonal a 45° na tela; tamanho pela largura do texto: 35%, 55% ou 80% da diagonal (ou da largura); opacidade 15%, 30% ou 50%. |
| Recomendado | DCT RGB ou cinza, 8 bits, sem /Decode: MozJPEG qualidade 75; reduz a 150 ppi efetivos no maior tamanho que a imagem pode ter na maior página que a usa; troca só se ficar menor; imagens acima de 50 MP ficam como estão. |
| Forte | Cada página desenhada a 100 ppi, MozJPEG qualidade 60, página do tamanho visível. |
| PSNR | Página 1 a 100 ppi, original × Recomendado, ≥ 30 dB (fixado antes de medir). |
| Arquivo com índice estragado | Lido pelo pdf-lib, que reconstrói a tabela: sai reparado, com a fala da Oli na linha. O cortado na metade, o vazio, o JPG e o texto são recusados na linha. |

## 5. Fixtures (já geradas, commit próprio)

| Arquivo | O que prova | Esperado (PDF.js + qpdf) |
| --- | --- | --- |
| `gen-paginas-300` | ordem (marcador "Page N"), memória, tarefas longas | 300 Letter, rotação 0 |
| `gen-paginas-mistas` | geometria | 8 páginas: Letter, A4, deitada, /Rotate 90, 270, 180, CropBox deslocada, MediaBox fora da origem |
| `gen-ja-otimizado` | Compress devolve o original | 12 páginas de texto, já com as opções do sem perda |
| `gen-fotos` | Recomendado ganha | 4 páginas, 3 fotos RGB e 1 cinza, MozJPEG 92 |
| `gen-cifrado-aes256`, `gen-cifrado-rc4-128`, `gen-cifrado-dono` | Protect/Unlock e recusas | R6 AESv3 com senha; R3 RC4 com senha; R6 só dono com restrições |
| `gen-acoes` | segurança | OpenAction JS, Launch, URI, link interno, JS na página 2 |
| `gen-xref-estragada` | reparo | o PDF.js abre as 3 páginas, o qpdf não |
| `gen-cortado`, `gen-vazio`, `gen-jpg-extensao-pdf`, `gen-texto-extensao-pdf` | recusas | truncated, empty, not-pdf, not-pdf |

Mais as 4 da F0. O `fixtures/pdf/` fica em 11,98 MB. O `pnpm fixtures` passa a rodar também o `scripts/fixtures/pdf.ts`.

## 6. As ferramentas

| Ferramenta | Arquivos | Roda | Opções | Saída |
| --- | --- | --- | --- | --- |
| Merge | N→1 (lista) | botão | ordem (arrastar, botões, teclado) | 1 PDF |
| Split | 1 | botão | cada página / faixas / escolhidas na grade | 1 PDF ou ZIP |
| PDF to JPG | lote | ao soltar | JPG ou PNG; 72, 150, 300 ppi; todas ou faixa | imagens, ZIP |
| Compress | lote | ao soltar | Sem perda / Recomendado / Forte (aviso antes) | PDF; o original se não ganha |
| Protect | lote | botão | senha + confirmação | PDF AES-256 R6 |
| Unlock | 1 | ao soltar (dono) / botão (senha) | senha quando pede | PDF sem /Encrypt |
| Rotate | lote (todas) ou 1 (por página) | ao soltar | 90 à direita, 180, 90 à esquerda; por página na grade | PDF |
| Delete | 1 | botão | grade ou faixa → seleção | PDF; apagar todas dá a fala |
| Numeração | lote | ao soltar | 6 posições, 4 formatos, início, pular a primeira | PDF |
| Reorder | 1 | botão | grade com arrastar, botões, teclado; inverter | PDF |
| Watermark | lote | botão | texto, tamanho, opacidade, direção | PDF |
| Sign | 1 | botão | desenhar / enviar PNG ou JPG / digitar; posição por ponteiro, teclado e campos; páginas | PDF |

Recusas na linha, com fala da Oli: vazio, não é PDF (imagem: link para a Image to PDF), cortado, pede senha (link para a Unlock), restrito (link para a Unlock; a PDF to JPG desenha), segundo arquivo numa ferramenta de um por vez.

## 7. Peças novas

- **Grade de páginas.** `<ul>` de células com miniatura (desenhada só quando aparece, a 2× de 120 px CSS, solta quando sai da tela), um botão principal por célula com nome "Page 3 of 12, rotated 90°, selected" (`aria-pressed` no modo escolher), foco itinerante (setas, Home, End), Espaço escolhe. Modo ordem: arrastar com o ponteiro, botões "Move earlier" e "Move later" em toda célula (WCAG 2.5.7) e, pelo teclado, Espaço pega a página e as setas a movem. Modo girar: botão de girar por célula. A região de status diz cada mudança uma vez. Visual: o do FileCard (borda `stroke-2`, raio `xs` na miniatura, dobra na cor `pdf`), sem cor nova.
- **Campo de senha.** Rótulo, `<input type="password">` com `autocomplete` (`new-password` na Protect, `current-password` na Unlock), botão "Show password" com `aria-pressed` e `aria-controls`, erro com a regra em `aria-describedby` e `aria-invalid`. Regra: 4 a 100 caracteres; a confirmação tem de ser igual.
- **Área de assinatura.** OptionGroup Draw / Upload / Type. Desenhar: `<canvas>` com ponteiro e "Clear"; Enviar: PNG ou JPG, regravado num canvas (sem metadados); Digitar: campo de texto desenhado em canvas com a Fredoka do site. Posição: prévia da página com a caixa da assinatura, que se arrasta; foco na caixa, setas movem 1% (Shift, 10%), + e − mudam a largura; campos X, Y e largura em %. Páginas: esta, todas ou escolhidas na grade.

Cada peça ganha § com marcação, estados e teclado, e screenshots nos dois temas.

## 8. Orçamento e chunks

- Página de PDF: 2 arquivos JS (a entrada do `PdfIsland.astro` com o painel e as 12 definições, e o `island`). Projeção: ~30 KB gzip da entrada + 17,5 KB do `island` ≈ 48 KB (limite 80).
- Nada de worker, `.wasm`, PDF.js ou qpdf antes do primeiro arquivo; o aquecimento sobre a zona liga o worker de PDF e, nas ferramentas do qpdf, compila o `.wasm`.
- Sob demanda, no worker de PDF: pdf-lib (já é o worker de hoje), qpdf (cola 16 KB + `.wasm` 443 KB gzip), PDF.js legacy (~540 KB gzip) e os `.wasm` dele, MozJPEG e resize do jSquash (Recomendado).
- A Image to PDF e o PDF das calculadoras continuam no mesmo worker e só baixam o pdf-lib (teste pelas requisições).
- Imagem e dinheiro: os mesmos arquivos JS. O `island` cresce só pelos ids e eventos novos (`tool-ids.ts`, `events.ts`); tabela de antes e depois no relatório.

## 9. Critérios → prova

| # | Prova |
| --- | --- |
| 1 | `gate:links`, `gate:conteudo`, `budgets.spec.ts` (200), prévia |
| 2 | `git log -- fixtures/pdf src/tools/pdf`, `pnpm fixtures --check`, `tests/unit/pdf-fixtures.test.ts` |
| 3 | `tests/e2e/pdf-matrix.spec.ts` + `scripts/fixtures/pdf-matrix-table.ts` → `docs/relatorios/fase-05a-matriz.md` |
| 4 | `tests/unit/pdf-compress.test.ts` (tabela modo × fixture, PSNR) e a matriz |
| 5 | `pdf-matrix` (Protect e Unlock) e `tests/unit/pdf-lock.test.ts` |
| 6 | `tests/e2e/pdf-privacy.spec.ts` |
| 7 | `pdf-privacy.spec.ts` (gen-acoes) e `tests/unit/pdf-hardening.test.ts` (sem eval, sem CDN, sem quickjs) |
| 8 | `budgets.spec.ts` (lista de PDF lida do registro, pares, nada de qpdf/PDF.js na Image to PDF e nas calculadoras) |
| 9 | `tests/e2e/pdf-speed.spec.ts` (PerformanceObserver, Chromium) |
| 10 | `a11y.spec.ts` (estados) e `pdf-tool.spec.ts` (teclado = arrastar) |
| 11 | `ads.spec.ts` com `PDF_TARGETS` |
| 12 | `lighthouserc.json` com `/compress-pdf/` e `/pdf-tools/` |
| 13 | `pnpm motor:exportar --conferir` e `tests/unit/oss-image-engine.test.ts` |
| 14 | `gate:licencas` (pacotes, `.wasm` e dados idênticos aos do pacote, textos) e `image-privacy.spec.ts` |
| 15 | CI em partes, `verificar.test.ts`, `actionlint` |
| 16 | `pnpm verificar` local |
| 17 | `git diff --stat` do critério |
| 18 | comentário do Workers Builds e Playwright na prévia |

## 10. CI

Projeção da exploração: 143 testes novos por navegador (WebKit 404 → ~547, soma de ~2.563 s para ~4.590 s; Chromium para ~1.900 s). Decisão de partida, a medir no primeiro push: Chromium em 3 partes e WebKit em 6 partes, divididas por contagem (`--shard=i/n`, sem a variável interna `PWTEST_SHARD_WEIGHTS`, que o Playwright não documenta). Os `pdf-*.spec.ts` são escritos para cada teste custar pouco (um carregamento de página e um lote por teste, como a matriz de imagem). O `design.spec.ts` não pode cair na mesma parte da matriz de PDF; o `--list` de cada parte é conferido antes de cada push. ENOSPC: `kernel.core_pattern` para `|/bin/false` e `ulimit -c 0` no passo do Playwright, passo `if: always()` com `df -h /`, `coredumpctl list` e o journal do `systemd-coredump`, e amostra de disco a cada 2 s no `disco.ts`.

## 11. Exportação do motor de imagem

Caminho A da exploração: as URLs dos `.wasm` passam por opção em tempo de execução (`configureWasm`), com o mesmo código no site e no pacote. O `engine-client.ts` (fora do `island`) importa os `?url` e configura o worker na primeira mensagem e a página no caminho sem canvas. O worker vira entrada opcional do pacote (`./worker`). O exportador copia a fonte byte a byte, os testes `engine-*.test.ts` e `strip.test.ts` com os imports reescritos e só as fixtures redistribuíveis (as desenhadas no script e as de licença MIT/BSD sem GPS real), tirando por AST os testes que dependem das outras.

## 12. Ordem de construção

1. Dependências, `/licenses` e `gate:licencas`.
2. Fixtures (commit próprio, antes de qualquer arquivo de ferramenta).
3. Núcleo do motor (tipo pelos bytes, carga, cifra, razões) com Vitest falhando antes.
4. Ilha e Merge inteira, com matriz, anúncio, orçamento, axe e privacidade.
5. CI dividido e diagnóstico do ENOSPC; primeiro push e PR em rascunho.
6. Split, PDF to JPG, Compress (três modos).
7. Protect e Unlock.
8. Rotate, Delete, numeração.
9. Reorder, Watermark, Sign (a válvula corta nesta ordem inversa: Sign, Watermark, Reorder).
10. Hub, home, rodapé, busca.
11. Privacidade e Termos nos três idiomas.
12. Exportação do motor de imagem.
13. Lighthouse e screenshots; revisão adversarial; relatório.
