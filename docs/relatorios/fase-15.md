# F15 · relatório

A segunda das cinco runs do `PLANO-UX-QV.md` ("Imagem, QR e o caminho entre ferramentas"), com a ficha no plano (a ficha da F15 e as seções C e D) e o prompt em `docs/prompts/prompt-fase-15.txt`; o plano da run está em `docs/relatorios/fase-15-plano.md`. Ponto de partida: `16b9b9b` (o ajuste das partes do CI, PR 30). PR: [vmatusita/fileorca#31](https://github.com/vmatusita/fileorca/pull/31). Prévia: https://fase-15-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio).

## Resumo

1. Na Imagem para PDF, cada foto da lista tem setas (pelo toque e pelo teclado), arrastar com o mouse e lixeira com Desfazer; o PDF sai na ordem da lista, e mudar a ordem depois do resultado refaz só o PDF, sem preparar as fotos de novo.
2. Em todo lote de imagem com dois arquivos ou mais, um arquivo pronto sai pela lixeira, com Desfazer no lugar dele até a próxima ação, e o ZIP é refeito sem codificar nada.
3. Depois de virar PDF, os chips da Imagem para PDF são Comprimir PDF, Juntar PDF e Numerar páginas, e levam o PDF; os chips das ferramentas de PDF levam o arquivo também ao Juntar, ao Dividir, ao Organizar páginas e ao Proteger, onde ele espera a ação (o F13a h-1).
4. O Comprimir imagem ganhou "Até um tamanho", com o campo "Tamanho máximo" em KB (de 20 a 10.000, começando em 200).
5. No celular, o QR code aparece logo abaixo do campo, à vista enquanto a pessoa digita; a partir de 768 px a tela é a mesma de antes.

## O que entrou, por item da ficha

### 1. A lista da Imagem para PDF (frente L; § 651, § 667 a § 670)

- `src/tools/image/ImagePanel.tsx`: a lista vira `ol.fo-filelist` (as linhas `li.fo-filelist__row`), com as setas e a lixeira fora do card (como o Juntar), o arrastar nativo da linha, o foco que segue a linha, o "Show N more" que abre a lista quando a linha movida vem de lá ou vai para lá, e o `repack()`, que refaz só o pacote quando a chave da lista muda; o Baixar fica `aria-busy` e não entrega o pacote velho (`wantDownload`).
- `src/tools/image/batch.ts` (novo, puro): `bundleKey`, `moveId`, `restoreAt`, `successor`.
- `src/tools/image/engine-client.ts`: o `zipHere()`, que monta na página o ZIP refeito (o mesmo `zipStored` e o mesmo chunk `zip.*.js`), sem mensagem ao worker de imagem.
- `src/styles/components.css`: o bloco `.fo-filelist--image` (a linha de 86 px em todo estado, os controles embaixo do card abaixo de 480 px, a linha do Desfazer com a altura medida da linha que saiu).
- Os textos (`queue.moveEarlier`, `moveLater`, `moved`, `out`, `undo`) nos três idiomas (§ 660) e a FAQ "Como mudo a ordem das páginas?" e o "Como funciona" da Imagem para PDF.
- Testes: `tests/e2e/image-list.spec.ts` (13 por navegador), `tests/unit/image-batch.test.ts` (9), os blocos novos do `tool-slot.spec.ts`, do `tool-slot-axe.spec.ts` e do `ads.spec.ts`; os ajudantes `tests/e2e/lib/workers.ts` (o espião com contagem) e `tests/e2e/lib/status.ts` (o registro das falas).

### 2. Tirar um arquivo pronto de qualquer lote de imagem (frente L; § 652, § 668 e § 669)

- A lixeira de fora do card na linha pronta de todo lote de dois arquivos ou mais (o lugar dela guardado na linha que espera ou trabalha), a linha do Desfazer no mesmo lugar e na mesma altura, o item tirado guardado até a próxima ação, o ZIP refeito com as saídas que ficaram, de dois para um (a lista à vista enquanto o Desfazer espera; o Baixar entrega o arquivo que ficou), e o Cortar que passa a escolha à linha seguinte.
- Testes: os casos do Comprimir, do Redimensionar, de dois para um, do Cortar e de um arquivo só no `image-list.spec.ts`; o `tool.spec.ts` e o `image-crop.spec.ts` mudados (§ 664).

### 3. Os chips da Imagem para PDF (fatia 1 e frente C; § 653 e § 674)

- `src/tools/image/registry.ts`: o tipo `PdfNeighbour` e o `next` da Imagem para PDF com Comprimir PDF, Juntar PDF e Numerar páginas.
- `src/tools/image/page.ts` e `src/tools/pdf/page.ts`: o `carryTo` chama o `carryOfImage` para as vizinhas de PDF; o `pdfOriginsOf` inclui a Imagem para PDF.
- `ImagePanel.tsx` (o bloco dos chips): o chip leva o PDF do pacote, com a linha `carry.linePdf`; a cópia escondida da faixa guarda essa linha e o rótulo de um PDF. Na junção, o chip apertado enquanto o PDF é refeito espera o novo (`wantFollow`; § 653).
- Testes: `tests/unit/handoff.test.ts` (a tabela dos 29 chips nos três idiomas), `tests/unit/image-texts.test.ts`, o `handoff-action.spec.ts` (a Imagem para PDF para o Comprimir PDF e para o Juntar, e o chip apertado depois de mover uma linha).

### 4. A chegada nas ferramentas com ação (frente C; § 654, § 655, § 671 a § 674)

- A regra nova de levar substitui o "só linkam" da § 497: o `carryOf` deixa de exigir `run: 'auto'`; o Proteger continua sem levar.
- `src/tools/pdf/PdfPanel.tsx`: a fala da chegada no fim da leitura, uma vez, com a origem antes da contagem; o foco onde um soltar comum o deixa (no Proteger, o botão); a nota de origem do Juntar, que sai ao somar ou tirar um PDF e volta com o Desfazer.
- Os rótulos dos chips do Juntar, do Dividir, do Organizar páginas e do Proteger nos três idiomas (§ 660).
- Testes: `tests/e2e/handoff-action.spec.ts` (10 por navegador), os blocos novos do `pdf-privacy.spec.ts`, do `launch-claims.spec.ts`, do `tool-slot.spec.ts` e do `tool-slot-axe.spec.ts`, e o ajudante `tests/e2e/lib/inbox.ts` (`arriveFrom`).

### 5. Comprimir "até um tamanho" (frente Q; § 656, § 657, § 675 e § 676)

- `src/tools/compress-image/size.ts` (novo, puro): o estado `{ level, kb }`, `MIN_KB = 20`, `MAX_KB = 10_000`, `START_KB = 200`, a operação `{ kind: 'target', maxBytes: kb × 1000 }` e o resumo do "Ajustar".
- `src/tools/compress-image/Panel.tsx`: a terceira escolha no segmento (que empilha abaixo de 480 px, `.fo-seg--stack`), o `NumberField` "Tamanho máximo" com o sufixo KB depois do `fieldset`, e a ajuda dele; a nota do PNG some com a terceira escolha.
- Os textos (`size`, `sizeHelp`, `maxLabel`, `kb`, `maxHelp`, `maxInvalid`, `upTo`) e as frases da página (o "Como funciona", a especificação, as presets e uma FAQ nova), nos três idiomas.
- Testes: `tests/e2e/image-target.spec.ts` (6 por navegador), `tests/unit/compress-target.test.ts` (9), os blocos novos do `tool-slot.spec.ts`, do `tool-slot-axe.spec.ts` e do `ads.spec.ts`.

### 6. O QR code no celular (frente Q; § 658, § 677 e § 678)

- `src/tools/qr-code-generator/QrPanel.tsx`: a ordem do DOM é o campo, a saída e as opções (o `.fo-qr__form` deu lugar a `.fo-qr__field` e `.fo-qr__options`).
- `components.css`: a partir de 768 px, áreas de grade mantêm o desenho de antes; abaixo, o campo mostra duas linhas e a prévia tem no máximo 216 px.
- Testes: `tests/e2e/qr-layout.spec.ts` (10 por navegador, com as caixas comparadas ao ponto de partida quando o `QR_BASE` é dado), os blocos novos do `tool-slot.spec.ts` e do `tool-slot-axe.spec.ts`, o `QR_TARGETS` do `ads.spec.ts` e o `MAP_TARGETS` do `lib/ad-map.ts`.

### Os documentos e as pendências

- `DECISOES.md`: § 649 a § 681 (abaixo).
- `docs/design/`: o README geral, o dos componentes, o do FileCard, o do NextStepChips, o do NumberField e o do OptionGroup, com o antes e o depois (§ 665).
- `docs/claude/`: seções novas no fim do `imagem.md`, do `pdf.md`, do `playwright.md` e do `windows-git-bash.md`.
- `docs/PENDENCIAS.md`: o F14 m-4 e o F13a h-1 em "Já corrigidos"; o grupo 25, "O que a F15 deixou".

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | Imagem para PDF com 3 fotos fora de ordem: setas (toque e teclado) e arrastar põem na ordem; o PDF sai na ordem da lista (PDF.js no Node); mudar a ordem ou tirar uma foto depois do resultado refaz só o PDF (contador) | `image-list.spec.ts`, "Image to PDF: the order of the list is the order of the pages (criterion 1)" (7 testes por navegador) | passa nos dois. As páginas lidas no Node saem `1200x1600, 1600x1200, 800x600` (a ordem pedida) pelo arrastar, pelas setas e pelo teclado; depois de cada gesto, 0 mensagem nova ao `fileorca-image` e 1 ou 2 ao `fileorca-pdf` (tabela abaixo). Também com a ordem mudada durante o preparo e durante a montagem. Controle negativo no `dist-base`: os 13 testes reprovam, por exemplo "drag: the PDF in the order of the list" e "Expected: 3, Received: 0" (`.fo-filelist__remove`) |
| 2 | A lixeira com Desfazer em toda linha pronta dos lotes de imagem; o ZIP refeito tem um arquivo a menos; de dois para um | `image-list.spec.ts`, "a ready file goes out of any batch, with Undo (criterion 2)" (6 testes por navegador) | passa nos dois. No Comprimir e no Redimensionar, o ZIP refeito tem `photo-1.jpg, photo-3.jpg` e, depois do Desfazer, os três, sem mensagem nova ao worker de imagem; de dois para um, o Baixar entrega o arquivo que ficou e a lista fica à vista até a próxima ação. Controle negativo: "a bin on every ready row: Expected: 3, Received: 0" |
| 3 | Os chips da Imagem para PDF levam a ferramentas de PDF que existem nos três idiomas | `tests/unit/handoff.test.ts` e `image-texts.test.ts`; `handoff-action.spec.ts` | passa. O `next` é Comprimir PDF, Juntar PDF e Numerar páginas, cada um com o endereço e o nome do idioma, e os três levam o PDF (`data-carry`). Controle negativo: com o registro de antes, "Compress PDF, Merge PDF and Add page numbers, in this order: expected [ 'compress-image', 'resize-image' ] to deeply equal [ 'compress-pdf', 'merge-pdf', …(1) ]" |
| 4 | O chip leva o arquivo ao Juntar, ao Dividir, ao Organizar e ao Proteger, nos dois navegadores, e nada sai do aparelho | `handoff-action.spec.ts` (10 por navegador), `pdf-privacy.spec.ts` e `launch-claims.spec.ts` (os blocos da chegada) | passa nos dois: os PDFs esperam a ação (nenhum resultado, só o `tool_start` de um soltar), a região diz a origem uma vez, a ação dá o resultado com a nota, e nenhuma requisição leva bytes do arquivo. Controle negativo no `dist-base`: os 8 primeiros testes do `handoff-action` reprovam ("toHaveAttribute(expected) failed … unexpected value \"null\""), e os blocos de privacidade com "Expected substring: \"Oli brought these 2 PDFs from Compress PDF.\" Received string: \"\"" |
| 5 | "Até 200 KB" num JPG de 12 MP e num PNG transparente: no máximo 200.000 bytes, em JPG, com a nota de fundo branco no PNG; o número fora da URL, do `dataLayer` e do storage | `image-target.spec.ts` (6 por navegador) | passa nos dois: 196.749 B (Chromium) e 199.623 B (WebKit) na `jpg-01-pixel2-retrato-gps.jpg`, 129.218 e 129.585 B no `gen-png-transparente.png`, com a nota de fundo branco; o valor digitado não aparece na URL, no `dataLayer`, no `localStorage` nem no `sessionStorage` (tabela abaixo). Controle negativo: a terceira escolha não existe no `dist-base` |
| 6 | QR a 360 × 740: o código inteiro acima da dobra em en, pt e es, e o Baixar PNG a no máximo 200 px abaixo; a 360 × 420 com o campo no topo, a metade de cima do código à vista; a 1280 × 800, o QR igual ao de antes | `qr-layout.spec.ts` (10 por navegador); `.cache/f15/qr-shots.ts` | passa nos dois: o código termina em 695 (en) e 715 px (pt e es), o Baixar PNG em 739 e 759 px; a 360 × 420 o código inteiro fica à vista; a 768 e a 1280 px as caixas são iguais às do ponto de partida a 0,5 px (288 caixas) e as capturas não têm nenhum pixel diferente (24 pares). Controle negativo: "the code ends 339.0 px from the fold" e "the upper half of the code is in view" no `dist-base` |
| 7 | CLS da interação 0 no `tool-slot.spec.ts` com a lista; anúncios verdes; orçamento e Lighthouse; `pnpm verificar` verde | os blocos novos do `tool-slot.spec.ts`; `ads.spec.ts`, `fo-ad-map.spec.ts`, `ads-coffee.spec.ts` e `clearance.spec.ts` no build de teste; `budgets.spec.ts`; `pnpm verificar --partes` | CLS 0,0000 com a lista na tela (um desenho só das linhas; no `dist-base`, quatro desenhos e 0,0087); os anúncios a 150 px ou mais de toda peça nova; cada ilha bem abaixo de +8 KB; o `verificar` abaixo |

E os critérios do prompt:

- **Os 6 itens de "Dentro"** entraram; a válvula não cortou nada.
- **O "Fora"** não foi tocado: nenhuma foto codificada de novo pela ordem ou pela lixeira, o motor de imagem sem mudança (`src/engine/` fora do diff), nada gravado do tamanho digitado, nenhum evento novo, o QR igual a partir de 768 px, nenhum chip novo para o Excluir, o Assinar ou a Marca d'água. As matrizes de imagem e de PDF passam sem nenhum esperado mudado.
- **O CLS sem gesto** continua 0 nas páginas tocadas (tabela dos anúncios e do CLS abaixo), e o guia das fotos num PDF não piorou (0,0384 → 0,0358 com o painel no topo da tela).
- **Nada sai do aparelho:** o `image-privacy.spec.ts`, o `pdf-privacy.spec.ts`, o `launch-claims.spec.ts`, o `handoff.spec.ts` e o `events.spec.ts` passam, com a lista, a chegada e o campo no caminho.
- **Os textos:** o `english-leak.test.ts`, o `glossary.test.ts`, o `image-texts.test.ts`, o `claude-md.test.ts` e o `pendencias.test.ts` passam; o `lint:texto` e o `gate:conteudo`, no `verificar` abaixo.

## As tabelas

### A lista: as mensagens aos workers antes e depois de cada gesto, e a ordem das páginas lida no Node (`image-list.spec.ts`)

As fotos foram dadas na ordem `gen-webp-exif-gps.webp`, `gen-png-transparente.png`, `gen-jpg-01-orientacao6.jpg` (páginas 1600x1200, 800x600, 1200x1600 com "Tamanho da imagem").

| Gesto (depois do resultado) | Chromium: `fileorca-image` | Chromium: `fileorca-pdf` | WebKit: `fileorca-image` | WebKit: `fileorca-pdf` | Páginas do PDF depois |
| --- | --- | --- | --- | --- | --- |
| Arrastar a 3ª linha para a 1ª | 5 → 5 | 1 → 2 | 2 → 2 | 1 → 2 | 1200x1600, 1600x1200, 800x600 |
| Duas setas "Subir" (clique) | 8 → 8 | 3 → 5 | 2 → 2 | 3 → 5 | 1200x1600, 1600x1200, 800x600 |
| Duas setas pelo teclado (Enter) | 11 → 11 | 6 → 8 | 2 → 2 | 6 → 8 | 1200x1600, 1600x1200, 800x600 |
| Lixeira na Imagem para PDF (o PNG) | 5 → 5 | 1 → 2 | 2 → 2 | 1 → 2 | 1600x1200, 1200x1600 |
| Desfazer depois da lixeira (acumulado) | 5 → 5 | 1 → 3 | 2 → 2 | 1 → 3 | 1600x1200, 800x600, 1200x1600 |
| Lixeira no Comprimir (ZIP de dois) | 6 → 6 | — | 3 → 3 | — | ZIP: photo-1.jpg, photo-3.jpg |
| Desfazer no Comprimir | 6 → 6 | — | 3 → 3 | — | ZIP: os três |
| Lixeira no Redimensionar | 6 → 6 | — | 3 → 3 | — | ZIP: photo-1.jpg, photo-3.jpg |
| Desfazer no Redimensionar | 6 → 6 | — | 3 → 3 | — | ZIP: os três |

No Chromium, o `fileorca-image` recebe a configuração, a pergunta do canvas, uma mensagem por foto e o ZIP; no WebKit do Windows as fotos são codificadas na página, e a contagem prova só o ZIP (F15 L-2 no grupo 25).

As linhas (Chromium; `.fo-filelist--image`): 146 px abaixo de 480 px e 86 px a partir dele, em todo estado (no `dist-base`, 80 px esperando e pronto e 86 trabalhando); a coluna do nome da Imagem para PDF com 184 px a 320, 224 a 360, 180 a 480, 468 a 768 e 490 a 1280.

### Os chips e a chegada (`handoff.test.ts` e `handoff-action.spec.ts`)

| Origem → destino | Leva? | O que chega | Espera a ação? |
| --- | --- | --- | --- |
| Dividir, Comprimir PDF, Girar, Desbloquear → Juntar | sim | os PDFs que saíram | sim: a lista e o botão Juntar (com um PDF só, a linha de quem precisa de mais um) |
| Imagem para PDF → Juntar | sim | o PDF | sim (um PDF: a linha de quem precisa de mais um) |
| Desbloquear → Dividir | sim, um | o PDF | sim: o card e o botão Dividir |
| Excluir → Organizar páginas | sim, um | o PDF | sim: a grade e o botão Salvar nova ordem |
| Comprimir PDF, Numerar, Assinar, Marca d'água → Proteger | sim | os PDFs | sim: o card, os campos da senha e o botão |
| Imagem para PDF → Comprimir PDF, Numerar páginas | sim | o PDF (o da ordem nova, se a lista mudou) | não: rodam sozinhos e mostram o resultado com a nota |
| Proteger → Comprimir PDF, Juntar | não (só linka) | — | — |
| Juntar → Imagem para PDF | não (só linka) | — | — |

### O tamanho máximo (`image-target.spec.ts`; o ZIP lido no Node; todas as saídas em JPG)

| Fixture | Entrada | 200 KB, Chromium | 200 KB, WebKit | 20 KB (o mínimo), Chromium | 20 KB, WebKit |
| --- | ---: | --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` (3024 × 4032) | 4,3 MB | 196.749 B, 1177 × 1569 | 199.623 B, 1177 × 1569 | 19.735 B, 304 × 405 | 19.385 B, 304 × 405 |
| `gen-png-transparente.png` (800 × 600) | 1,1 MB | 129.218 B, 800 × 600, cantos brancos, a nota de fundo branco | 129.585 B, idem | — | — |
| `gen-grande-4100x4100.jpg` (16,8 MP) | — | — | — | 19.923 B, 1048 × 1048 | 19.923 B, 1048 × 1048 |

O motor chega a 20 KB nas duas fotos pedidas e nos dois navegadores: o mínimo fica em 20 KB (§ 657).

### O QR (`.cache/f15/qr-measure.ts` e `qr-layout.spec.ts`; Chromium, o WebKit dá 0,5 px a menos)

| Janela | Idioma | Antes: fim do campo · código · Baixar PNG | Depois: fim do campo · código · Baixar PNG | Folga do código até a dobra |
| --- | --- | --- | --- | ---: |
| 360 × 740 | en | 507 · 767–1.059 · 1.103 | 459 · 479–695 · 739 | 45 px |
| 360 × 740 | pt | 527 · 787–1.079 · 1.123 | 479 · 499–715 · 759 | 25 px |
| 360 × 740 | es | 527 · 787–1.079 · 1.123 | 479 · 499–715 · 759 | 25 px |
| 375 × 812 | en | 473 · 733–1.040 · 1.084 | 425 · 445–661 · 705 | 151 px |
| 375 × 812 | pt | 507 · 767–1.074 · 1.118 | 459 · 479–695 · 739 | 117 px |
| 375 × 812 | es | 527 · 787–1.094 · 1.138 | 479 · 499–715 · 759 | 97 px |

- A 360 × 420 (o teclado aberto), com o campo rolado ao topo da janela: o código inteiro à vista, de 142 a 358 px no en e de 162 a 378 no pt e no es (antes, de 430 a 722 e de 450 a 742: nada à vista).
- A 768 × 1024 e a 1280 × 800: 288 caixas do painel (dois navegadores, três idiomas, com e sem código, 12 peças) iguais às do ponto de partida a 0,5 px; 24 pares de capturas sem nenhum pixel diferente (o controle, o painel com e sem código, acusa a diferença nos 12 pares).

### O orçamento (`node .cache/f15/gzip-sizes.mjs`, nível 9, contra o `dist-base`; o `budgets.spec.ts` e o `i18n-budgets.spec.ts` passam sem mudar número)

| Arquivo | Antes (bytes / gzip) | Depois (bytes / gzip) | Diferença com gzip |
| --- | --- | --- | ---: |
| ilha de imagem (`island.*.js`, carregada por toda página de ferramenta) | 61.349 / 21.215 | 67.078 / 22.889 | +1.674 |
| ilha de PDF (`PdfIsland…*.js`) | 74.918 / 23.759 | 75.030 / 23.791 | +32 |
| QR (`QrTool…*.js`) | 29.420 / 10.796 | 29.436 / 10.805 | +9 |
| página do Comprimir (`CompressImagePage…*.js`) | 756 / 435 | 1.430 / 728 | +293 |
| `engine-client.*.js` | 1.948 / 911 | 1.993 / 926 | +15 |
| os outros 61 arquivos | — | iguais (os dois `client.*.js` com 1 B a mais, só pelo hash importado) | — |

| Página | JS inicial antes (3 arquivos, gzip) | Depois (3 arquivos, gzip) |
| --- | ---: | ---: |
| Imagem para PDF (e o guia das fotos num PDF) | 22.967 | 24.641 |
| Comprimir imagem | 23.082 | 25.049 |
| Redimensionar, Cortar, Girar, HEIC para JPG | 23.415 / 25.337 / 23.050 / 22.961 | 25.088 / 27.010 / 24.724 / 24.638 |
| QR code (en, pt, es) | 33.443 | 35.126 |
| Juntar, Dividir, Organizar, Proteger, Comprimir PDF, Numerar e as outras de PDF | 46.406 | 48.112 |

O `budgets.spec.ts` no Chromium (o JS inicial com gzip, os 2 arquivos JS próprios e o inline, e as requisições), na linha de base e no `verificar`:

| Página | Antes | Depois |
| --- | --- | --- |
| `/image-to-pdf/` e `/guides/photos-to-one-pdf/` | 26,1 e 26,2 KB, 6 requisições | 27,8 KB, 6 requisições |
| `/compress-image/` | 26,3 KB, 6 | 28,2 KB, 6 |
| `/resize-image/` | 26,6 KB, 6 | 28,2 KB, 6 |
| `/crop-image/` | 28,5 KB, 6 | 30,1 KB, 6 |
| `/qr-code-generator/` | 36,3 KB, 6 | 37,9 KB, 6 |
| `/merge-pdf/`, `/protect-pdf/` (e o Dividir e o Organizar) | 48,9 KB, 6 | 50,6 KB, 6 |
| `/compress-pdf/` | 49,1 KB, 6 | 50,7 KB, 6 |

`dist/_astro/` tem 66 arquivos JS antes e depois, com os mesmos nomes fora o hash. Nenhuma ilha cresceu 8 KB, e o maior JS inicial (48.112 B) fica longe dos 80 KB. As requisições de cada página são as de antes (o `budgets.spec.ts` conta 6 em cada página de ferramenta, como na linha de base).

### Os anúncios: a menor distância de cada peça nova até um anúncio (build de teste; Chromium, o WebKit dá até 1 px a menos a 360)

| Página e estado | Peça | 360 × 740 | 1280 × 800 |
| --- | --- | ---: | ---: |
| Imagem para PDF, lista de três fotos | a linha (`.fo-filelist__row`) | 691 | 150 |
| | as setas (`.fo-filelist__move`) | 695 | 206 |
| | o lugar vazio (`.fo-filelist__none`) | 695 | 257 |
| | a lixeira (`.fo-filelist__remove`) | 695 | 150 |
| Imagem para PDF, com a linha do Desfazer | o Desfazer (`.fo-filelist__undo`) | 845 | 156 |
| Comprimir, "Até um tamanho" (o campo aberto, o resultado com o Ajustar, o erro do campo) | a régua, o campo, a ajuda e o erro | 551 (en, pt), 525 (es) | 150 |
| QR (repouso, com o código, acima do limite) | `.fo-qr__field`, `.fo-qr__options`, `.fo-qr__out` | 150 ou mais | 150 |

150 a 1280 px é o trilho, encostado no limite como em toda página de ferramenta; a lista não ficou mais larga que o `.fo-filelist` de antes. O `fo-ad-map.spec.ts`, o `ads-coffee.spec.ts` e o `clearance.spec.ts` (sem teste novo) passam.

### O CLS sem gesto (Chromium; o WebKit não tem a API, e lá os testes conferem que as caixas não andam)

| Caso | CLS |
| --- | ---: |
| Lista da Imagem para PDF na tela a 360 × 740, do primeiro desenho ao resultado | 0,0000 (no `dist-base`: 0,0087, com quatro desenhos das linhas) |
| Imagem para PDF com a página no topo | 0,000 |
| Chegada no Juntar e no Proteger, da carga ao arquivo esperando a ação | 0,000 |
| Imagem para PDF sob o service worker, com os chips que levam e a linha do PDF | 0,000 (a faixa com 224 px antes e depois) |
| Comprimir em "Até um tamanho": o lote e o limite digitado, a 360 e a 1280 | 0,000 |
| QR com um link digitado, en, pt e es | 0 |
| Guia das fotos num PDF, painel no topo da tela (F13b g-1), 5 vezes em cada build | 0,0384 a 0,0385 antes; 0,0358 depois |

## Os testes

- **Vitest:** 131 arquivos e 2.083 testes no ponto de partida; 133 arquivos e 2.103 testes no fim (`tests/unit/image-batch.test.ts`, 9; `tests/unit/compress-target.test.ts`, 9; e 2 a mais no `tests/unit/handoff.test.ts`), todos verdes no `verificar` abaixo.
- **Playwright `--list`:** 2.316 testes em 77 arquivos por navegador no ponto de partida; 2.377 em 81 no fim (+61: `handoff-action` 10, `image-list` 13, `image-target` 6, `qr-layout` 10, e os blocos novos do `tool-slot` (+9), do `tool-slot-axe` (+5), do `pdf-privacy` (+2), do `launch-claims` (+1), do `ads` (+4) e do `image-privacy` (+1, a revisão, d-1)).
- **Os testes antigos que mudaram** (§ 664): `tests/e2e/tool.spec.ts` ("Show 1 more"), `tests/e2e/image-crop.spec.ts` (a ordem de Tab), `tests/unit/handoff.test.ts` (quatro testes) e `tests/unit/image-texts.test.ts` (o nome do chip de PDF), e as listas de alvos dos anúncios (`QR_TARGETS`, `lib/ad-map.ts` e `lib/ad-clearance.ts`), que só cresceram ou trocaram o nó que deixou de existir pelos dois que o substituem.
- **Os specs novos e as partes** (§ 663): o `handoff-action.spec.ts` na parte 4 do Chromium e na 7 do WebKit; o `image-list.spec.ts` na 6 e na 9; o `image-target.spec.ts` na 6 e na 10; o `qr-layout.spec.ts` na 8 e na 13.

## O `pnpm verificar --partes`

No último commit de código (`9c12435`), com a máquina livre, em 9/nov/2026 (de 21:47 a 22:39):

```text
Resumo das partes do CI (pnpm verificar --partes, 25 partes lidas de .github/workflows/ci.yml)
  ok      48.6 s  build: pnpm verificar --build
  ok     182.6 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     386.4 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     155.7 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     132.5 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok     109.6 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     149.9 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok      91.4 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     156.8 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok      95.7 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     103.2 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      74.2 s  playwright: pnpm verificar --playwright=webkit --shard=1/14 --dist-pronto
  ok      96.5 s  playwright: pnpm verificar --playwright=webkit --shard=2/14 --dist-pronto
  ok      95.0 s  playwright: pnpm verificar --playwright=webkit --shard=3/14 --dist-pronto
  ok     343.8 s  playwright: pnpm verificar --playwright=webkit --shard=4/14 --dist-pronto
  ok      33.3 s  playwright: pnpm verificar --playwright=webkit --shard=5/14 --dist-pronto
  ok     137.9 s  playwright: pnpm verificar --playwright=webkit --shard=6/14 --dist-pronto
  ok      89.7 s  playwright: pnpm verificar --playwright=webkit --shard=7/14 --dist-pronto
  ok      49.4 s  playwright: pnpm verificar --playwright=webkit --shard=8/14 --dist-pronto
  ok      89.5 s  playwright: pnpm verificar --playwright=webkit --shard=9/14 --dist-pronto
  ok     104.6 s  playwright: pnpm verificar --playwright=webkit --shard=10/14 --dist-pronto
  ok     130.9 s  playwright: pnpm verificar --playwright=webkit --shard=11/14 --dist-pronto
  ok     104.9 s  playwright: pnpm verificar --playwright=webkit --shard=12/14 --dist-pronto
  ok      71.3 s  playwright: pnpm verificar --playwright=webkit --shard=13/14 --dist-pronto
  ok     107.7 s  playwright: pnpm verificar --playwright=webkit --shard=14/14 --dist-pronto
  soma 3140.8 s (parede 3140.8 s; cada parte com o limite de 900 s)
```

Todas as 25 partes passaram, com a parte maior no Lighthouse (386,4 s) e, no Playwright, a 4 do WebKit (343,8 s, a do `clearance.spec.ts`, como antes; F14 m-5). As partes dos specs novos: a 4 do Chromium (149,9 s, o `handoff-action`), a 6 (156,8 s, o `image-list` e o `image-target`), a 8 (103,2 s, o `qr-layout`, o `tool-slot` e o `tool-slot-axe`); no WebKit, a 7 (89,7 s), a 9 (89,5 s), a 10 (104,6 s), a 13 (71,3 s) e a 14 (107,7 s). Nenhuma passa de 700 s na máquina. A soma foi de 3.082,6 s (a F14) para 3.140,8 s.

O resto do `verificar`: o Vitest com 133 arquivos e 2.103 testes; o `lint:texto` com 12 arquivos, 1.185 textos e 0 erro de gramática (513 avisos, os placeholders e os falsos positivos de sempre); o `gate:conteudo`, o `gate:prontidao`, o `design` e os outros portões ok; o Lighthouse no celular com desempenho de 98 a 100 e acessibilidade, boas práticas e SEO em 100 nas páginas medidas (o Comprimir imagem e o QR com 99).

A primeira execução, no `a63c78c` (de 21:22 a 21:46), parou na parte 6 do Chromium: o teste novo do `image-privacy.spec.ts` (o d-1 da revisão) digitava 173 KB e não achava "173" no storage nem no `dataLayer`, mas o `dataLayer` sempre tem a hora do gtag ("…54.173Z") e o endereço da página na porta 4173, a do `verificar` (nas rodadas da run, a porta era a 4174). Não era vazamento: o teste passou a digitar 9.137 KB e a procurar o número inteiro (`9c12435`), e a segunda execução, acima, passou inteira.

## O custo

A última execução do CI antes deste relatório é a do push do `a63c78c` (`pnpm ci:custo 42727797616`): classe **leve**, **6 minutos cobrados**, **3,9 min de parede**, 3 jobs (o `classificar`, o `verificar (leve)` com 155,2 s de `verificar` e o `ci-ok`).

As execuções leves da run, uma por push: `a6a0bd1`, `a9521d1`, `b9311da`, `4d82d84` e `a63c78c`, todas verdes. O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list`, só leitura), e criá-lo é do Victor (§ 666). A execução completa depois do `gh pr ready` faz esse papel.

O resultado da execução completa (as partes do WebKit do Linux, as linhas `[QR 360x740]` do `qr-layout.spec.ts`, para o F15 Q-1, e as `[mensagens]` do `image-list.spec.ts`, para o F15 L-2) vai na descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo sobre o `4d82d84`, numa worktree só de leitura com install, build e build de teste próprios, com céticos ("na dúvida, refutado"): 5 achados, todos baixos, nenhum alto nem médio; 3 refutados e 2 confirmados. Os dois confirmados foram corrigidos: o e-1 (os textos de página novos nos três idiomas, lado a lado no § 660) e o e-3 (a ordem do QR na seção F15 do `docs/claude/imagem.md`, `a7c3ee2`, mesclado em `290efea`). O d-1, refutado, foi aplicado mesmo assim pela regra do mais rigoroso: o `image-privacy.spec.ts` ganhou o teste que passa pela lista e pelo campo de tamanho, como o critério 5 do prompt pede (`8c6b38d`). O b-1, refutado como defeito da F15 (é do `NumberField` de antes), foi para o grupo 25 como F15 R-b-1. A segunda passada fechou os dois corrigidos. Tudo em `docs/relatorios/REVISAO-F15.md` e na § 679.

A junção também achou e corrigiu, antes da revisão, um defeito que só aparece com as duas frentes juntas: o chip da Imagem para PDF lia o pacote que a frente L passou a refazer sem codificar, e um toque logo depois de mover uma linha levava o PDF da ordem velha. Agora o chip espera o PDF novo, como o Baixar (`66b805f`, § 653 e § 667), com um teste que reprova sem a correção (um mutante: o Comprimir PDF recebeu as páginas na ordem velha). E o ajudante `arriveFrom` dos testes passou a esperar a ativação do service worker antes de gravar a caixa (a ativação apaga os caches do site que não são as páginas, a caixa entre eles; uma corrida que derrubou um teste do WebKit com a máquina carregada).

## As imagens

Em `docs/relatorios/fase-15/` (JPEG 80, 1x, movimento reduzido, Chromium do Playwright; o "antes" do `dist-base`, o "depois" do `dist/` da junção):

- `imagem-pdf-lista-360-antes.jpg` e `imagem-pdf-lista-360-depois.jpg`: a Imagem para PDF com três fotos, sem botão nas linhas e depois com as setas e a lixeira embaixo de cada card; `imagem-pdf-lista-1280.jpg`, os controles ao lado do card.
- `lote-desfazer-360.jpg`: o Comprimir com três fotos, uma tirada, e a linha "gen-png-transparente.png saiu da lista." com o Desfazer.
- `imagem-pdf-chips-360.jpg`: o resultado da Imagem para PDF com os chips Comprimir PDF, Juntar PDF e Numerar páginas e a linha do PDF.
- `juntar-chegada-360.jpg` e `proteger-chegada-360.jpg`: o PDF que um chip trouxe, esperando a ação.
- `comprimir-ate-360.jpg` e `comprimir-ate-1280-escuro.jpg`: "Até um tamanho" com o campo "Tamanho máximo".
- `qr-360-antes.jpg` e `qr-360-depois.jpg`, `qr-360x420-depois.jpg` (o teclado aberto), `qr-1280-antes.jpg` e `qr-1280-depois.jpg` (iguais).

## A prévia

https://fase-15-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio). O build da prévia do commit `a9521d1` falhou no Workers Builds (sem log fora do painel do Cloudflare); o push seguinte (`b9311da`), com o mesmo código de site, publicou a prévia verde.

## As decisões novas

§ 649 a § 680 no `DECISOES.md`: a especificação (649), os planos e o prompt (650), a lista (651), a lixeira em todo lote (652), os chips da Imagem para PDF (653), a regra nova de levar, que substitui o "só linkam" da § 497 (654), a chegada (655), o "Até um tamanho" (656) e o mínimo (657), o QR (658), as falas (659), os textos (660), o orçamento (661), os anúncios e o CLS (662), os specs e as partes (663), os testes antigos que mudaram (664), o design system (665), a conferência no Linux (666), as decisões da frente L (667 a 670), da frente C (671 a 674) e da frente Q (675 a 678), a revisão (679) e as partes e o custo do CI (680).

## A válvula de estouro

Não foi usada: os seis itens entraram, os itens 2 e 4 inclusive.

## A lista do que é do Victor

1. `git pull` e, no Android (na prévia ou no fileorca.com depois do deploy): montar um PDF com 5 fotos fora de ordem e consertar a ordem; tirar uma foto da lista e desfazer; comprimir uma foto "até 300 KB"; digitar um link no QR com o teclado aberto e ver o código aparecer.
2. Num lote de PDFs, tocar em "Proteger estes PDFs com senha" e conferir que os arquivos chegam esperando a senha.
3. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
5. Nenhuma PR das partes do CI foi aberta: na máquina, nenhuma parte com os specs novos passou de 700 s (a maior foi 156,8 s). Se a execução completa mostrar o contrário, a descrição da PR diz.
6. Gerar o prompt da F16 com a skill, com o SHA da main e o grupo 25 do `docs/PENDENCIAS.md`.
