# F18 · Matriz de fixtures dos PDFs: Organizar PDF e as presets de PDF

Gerada por `node scripts/fixtures/pdf-matrix-table.ts --table fase-18 --out docs/relatorios/fase-18-matriz-pdf.md` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode só os casos destas páginas (`--grep "Organize PDF|Extract pages|PDF to PNG"`) nos dois navegadores, numa execução só do Playwright (ela limpa o `test-results`), e o comando acima. As 12 ferramentas da F5a estão em `docs/relatorios/fase-05a-matriz.md`, que é histórica e não se regera (DECISOES § 738).

Cada página recebeu toda fixture que a ferramenta dela aceita, como na F5a (DECISOES § 175), e cada saída foi baixada e lida em Node por leitores que não são o motor, contra o oráculo `fixtures/pdf/expected.json`. O Organizar PDF, com o plano determinista da decisão 6, que move, gira e tira páginas: a contagem, a ordem pelo texto de cada página, o `/Rotate` final e o `qpdf --check`. A Extrair páginas do PDF, uma fixture depois da outra, com páginas digitadas fora de ordem e repetidas, e as recusas no meio (vazio, cortado, imagem e texto com nome `.pdf`, o PDF com senha e o só com restrição, com o link para a Unlock PDF): um PDF só, com as páginas marcadas uma vez cada, na ordem do arquivo, conferidas pela chave e pelas primeiras palavras de cada página, com o giro e os campos de formulário. A PDF para PNG, num lote com as recusas no meio, a 150 ppi sem tocar em nada, e as grandes a 300 ppi por intervalo: as páginas, as dimensões pela resolução (com 1 px de folga), o formato PNG pelos bytes, nenhum Exif e GPS, e o tamanho de cada fixture contra o JPG da PDF to JPG a 150 ppi (DECISOES § 729).

Legenda: `ok: o que foi conferido`, `refused: a fala da linha do arquivo` e `failed: a primeira linha do erro` (uma saída que não passou); `—` é uma linha que aquele navegador não gravou.

Ao todo, 92 linhas: 62 conferidas e 30 recusas (Chromium 46, WebKit 46).

## Cobertura

Cada página contra as fixtures que a ferramenta dela aceita (as legíveis do oráculo; na PDF para PNG, como na PDF to JPG, também a só com restrição de dono), com uma linha `ok` nos dois navegadores e nenhuma `failed`.

| Ferramenta | Fixtures que aceita | Com linha ok nos dois navegadores | Faltam |
| --- | ---: | ---: | --- |
| `organize-pdf` | 10 | 10 | — |
| `split-pdf-extract-pages` | 10 | 10 | — |
| `pdf-to-jpg-to-png` | 11 | 11 | — |

## Resumo por caso

| Caso | Ferramentas | Chromium | WebKit |
| --- | --- | ---: | ---: |
| `extract-117` | `split-pdf-extract-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `extract-300` | `split-pdf-extract-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `extract-nasa` | `split-pdf-extract-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `extract-small` | `split-pdf-extract-pages` | 7 ok · 6 recusadas | 7 ok · 6 recusadas |
| `organize-117` | `organize-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `organize-300` | `organize-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `organize-nasa` | `organize-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `organize-small` | `organize-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `png-big` | `pdf-to-jpg-to-png` | 3 ok · 0 recusadas | 3 ok · 0 recusadas |
| `png-small` | `pdf-to-jpg-to-png` | 8 ok · 5 recusadas | 8 ok · 5 recusadas |

## `organize-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `organize-117` | ok: page 2 moved first, pages 1 and 117 turned, page 3 out, 116 pages | ok: page 2 moved first, pages 1 and 117 turned, page 3 out, 116 pages |
| `gen-paginas-300.pdf` | `organize-300` | ok: page 2 moved first, pages 1 and 300 turned, page 3 out, 299 pages | ok: page 2 moved first, pages 1 and 300 turned, page 3 out, 299 pages |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `organize-nasa` | ok: page 2 moved first, pages 1 and 150 turned, page 3 out, 149 pages | ok: page 2 moved first, pages 1 and 150 turned, page 3 out, 149 pages |
| `gen-paginas-mistas.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 8 turned, page 3 out, 7 pages | ok: page 2 moved first, pages 1 and 8 turned, page 3 out, 7 pages |
| `gen-acoes.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 2 turned | ok: page 2 moved first, pages 1 and 2 turned |
| `gen-fotos.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 4 turned, page 3 out, 3 pages | ok: page 2 moved first, pages 1 and 4 turned, page 3 out, 3 pages |
| `gen-ja-otimizado.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 12 turned, page 3 out, 11 pages | ok: page 2 moved first, pages 1 and 12 turned, page 3 out, 11 pages |
| `gen-cortado.pdf` | `organize-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `organize-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `organize-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `organize-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `organize-small` | ok: its only page turned right | ok: its only page turned right |
| `pdf-formulario-irs-1040-2019.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 2 turned | ok: page 2 moved first, pages 1 and 2 turned |
| `gen-xref-estragada.pdf` | `organize-small` | ok: page 2 moved first, pages 1 and 3 turned, page 3 out, 2 pages | ok: page 2 moved first, pages 1 and 3 turned, page 3 out, 2 pages |

## `split-pdf-extract-pages`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `extract-117` | ok: "117, 59, 2-3" typed, pages 2, 3, 59, 117 out in the order of the file, text, turns and fields kept | ok: "117, 59, 2-3" typed, pages 2, 3, 59, 117 out in the order of the file, text, turns and fields kept |
| `gen-paginas-300.pdf` | `extract-300` | ok: "300, 150, 2-3" typed, pages 2, 3, 150, 300 out in the order of the file, text, turns and fields kept | ok: "300, 150, 2-3" typed, pages 2, 3, 150, 300 out in the order of the file, text, turns and fields kept |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `extract-nasa` | ok: "150, 75, 2-3" typed, pages 2, 3, 75, 150 out in the order of the file, text, turns and fields kept | ok: "150, 75, 2-3" typed, pages 2, 3, 75, 150 out in the order of the file, text, turns and fields kept |
| `gen-paginas-mistas.pdf` | `extract-small` | ok: "8, 4, 2-3" typed, pages 2, 3, 4, 8 out in the order of the file, text, turns and fields kept | ok: "8, 4, 2-3" typed, pages 2, 3, 4, 8 out in the order of the file, text, turns and fields kept |
| `gen-acoes.pdf` | `extract-small` | ok: "2" typed, pages 2 out in the order of the file, text, turns and fields kept | ok: "2" typed, pages 2 out in the order of the file, text, turns and fields kept |
| `gen-fotos.pdf` | `extract-small` | ok: "4, 2, 2-3" typed, pages 2, 3, 4 out in the order of the file, text, turns and fields kept | ok: "4, 2, 2-3" typed, pages 2, 3, 4 out in the order of the file, text, turns and fields kept |
| `gen-ja-otimizado.pdf` | `extract-small` | ok: "12, 6, 2-3" typed, pages 2, 3, 6, 12 out in the order of the file, text, turns and fields kept | ok: "12, 6, 2-3" typed, pages 2, 3, 6, 12 out in the order of the file, text, turns and fields kept |
| `gen-cortado.pdf` | `extract-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `extract-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `extract-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `extract-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-cifrado-aes256.pdf` | `extract-small` | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. |
| `gen-cifrado-dono.pdf` | `extract-small` | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `extract-small` | ok: "1" typed, pages 1 out in the order of the file, text, turns and fields kept | ok: "1" typed, pages 1 out in the order of the file, text, turns and fields kept |
| `pdf-formulario-irs-1040-2019.pdf` | `extract-small` | ok: "2" typed, pages 2 out in the order of the file, text, turns and fields kept | ok: "2" typed, pages 2 out in the order of the file, text, turns and fields kept |
| `gen-xref-estragada.pdf` | `extract-small` | ok: "3, 2, 2-3" typed, pages 2, 3 out in the order of the file, text, turns and fields kept | ok: "3, 2, 2-3" typed, pages 2, 3 out in the order of the file, text, turns and fields kept |

## `pdf-to-jpg-to-png`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-paginas-300.pdf` | `png-big` | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif |
| `pdf-grande-fontes-embutidas-117p.pdf` | `png-big` | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `png-big` | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif | ok: PNG at 300 ppi of pages 1, 2 and 117, sizes within 1 px, no Exif |
| `gen-cortado.pdf` | `png-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `png-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `png-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `png-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-cifrado-aes256.pdf` | `png-small` | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. |
| `gen-paginas-mistas.pdf` | `png-small` | ok: 8 PNG at 150 ppi, sizes within 1 px, no Exif; 671218 B against 542781 B of JPG (1.24×) | ok: 8 PNG at 150 ppi, sizes within 1 px, no Exif; 227357 B against 459100 B of JPG (0.50×) |
| `gen-acoes.pdf` | `png-small` | ok: 2 PNG at 150 ppi, sizes within 1 px, no Exif; 197849 B against 165765 B of JPG (1.19×) | ok: 2 PNG at 150 ppi, sizes within 1 px, no Exif; 70261 B against 142485 B of JPG (0.49×) |
| `gen-fotos.pdf` | `png-small` | ok: 4 PNG at 150 ppi, sizes within 1 px, no Exif; 10040558 B against 1583226 B of JPG (6.34×) | ok: 4 PNG at 150 ppi, sizes within 1 px, no Exif; 7831450 B against 1583297 B of JPG (4.95×) |
| `gen-ja-otimizado.pdf` | `png-small` | ok: 12 PNG at 150 ppi, sizes within 1 px, no Exif; 6153335 B against 5143954 B of JPG (1.20×) | ok: 12 PNG at 150 ppi, sizes within 1 px, no Exif; 2304832 B against 5184065 B of JPG (0.44×) |
| `gen-cifrado-dono.pdf` | `png-small` | ok: 3 PNG at 150 ppi, sizes within 1 px, no Exif; 265988 B against 208154 B of JPG (1.28×) | ok: 3 PNG at 150 ppi, sizes within 1 px, no Exif; 88881 B against 176548 B of JPG (0.50×) |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `png-small` | ok: 1 PNG at 150 ppi, sizes within 1 px, no Exif; 1178523 B against 196972 B of JPG (5.98×) | ok: 1 PNG at 150 ppi, sizes within 1 px, no Exif; 921547 B against 197016 B of JPG (4.68×) |
| `pdf-formulario-irs-1040-2019.pdf` | `png-small` | ok: 2 PNG at 150 ppi, sizes within 1 px, no Exif; 804124 B against 627270 B of JPG (1.28×) | ok: 2 PNG at 150 ppi, sizes within 1 px, no Exif; 316597 B against 643275 B of JPG (0.49×) |
| `gen-xref-estragada.pdf` | `png-small` | ok: 3 PNG at 150 ppi, sizes within 1 px, no Exif; 265988 B against 208154 B of JPG (1.28×) | ok: 3 PNG at 150 ppi, sizes within 1 px, no Exif; 88881 B against 176548 B of JPG (0.50×) |
