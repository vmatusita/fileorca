# F5a · Matriz de fixtures dos PDFs

Gerada por `node scripts/fixtures/pdf-matrix-table.ts` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode a spec nos dois navegadores numa execução só do Playwright (ela limpa o `test-results`) e o comando acima.

Cada caso abriu a página da ferramenta uma vez por navegador. As ferramentas de lote receberam as fixtures pequenas num lote só, com as que recusam no meio dele (vazio, cortado, imagem ou texto com nome `.pdf`, e os PDFs com senha onde a ferramenta não os abre); as de um arquivo por vez receberam as fixtures uma depois da outra, com "Start over" entre elas. Cada arquivo grande (as 300 páginas, as 117 páginas e o escaneado de 150 páginas da NASA) tem um caso próprio em cada ferramenta (DECISOES § 175). Cada saída foi baixada e lida em Node por leitores que não são o motor: a estrutura estrita do arquivo, o `qpdf --check` (sem aviso novo), o PDF.js (cada página e a lista de operadores dela) e a conta da ferramenta contra o oráculo `fixtures/pdf/expected.json`: contagem e ordem das páginas pelos marcadores (ou, nas fixtures sem marcador, pelo tamanho, giro, imagens e primeiras palavras que o PDF.js lê da fixture), `/Rotate`, texto do número e da marca d'água, imagem da assinatura em cada página, ausência de `/Encrypt` depois da Unlock, R6 com AESv3 depois da Protect, dimensões das imagens da PDF to JPG pela resolução (com 1 px de folga) e ausência de Exif e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli.

Legenda: `ok: o que foi conferido`, `refused: a fala da linha do arquivo` e `failed: a primeira linha do erro` (uma saída que não passou); `—` é uma linha que aquele navegador não gravou.

Ao todo, 356 linhas: 270 conferidas e 84 recusas, e 2 falharam (Chromium 178, WebKit 178).

## Cobertura

Cada forma de rodar uma ferramenta contra as fixtures que ela aceita (as legíveis do oráculo; na Unlock PDF, as três com senha ou restrição; na PDF to JPG, também a só com restrição de dono), com uma linha `ok` nos dois navegadores e nenhuma `failed`.

| Ferramenta | Fixtures que aceita | Com linha ok nos dois navegadores | Faltam |
| --- | ---: | ---: | --- |
| `merge-pdf` | 10 | 10 | — |
| `split-pdf` | 10 | 10 | — |
| `pdf-to-jpg` | 11 | 11 | — |
| `compress-pdf` | 10 | 10 | — |
| `compress-pdf (lossless)` | 10 | 10 | — |
| `compress-pdf (strong)` | 10 | 9 | gen-xref-estragada.pdf (Chromium: failed, WebKit: failed) |
| `rotate-pdf` | 10 | 10 | — |
| `delete-pdf-pages` | 10 | 10 | — |
| `add-page-numbers-to-pdf` | 10 | 10 | — |
| `sign-pdf` | 10 | 10 | — |
| `protect-pdf` | 10 | 10 | — |
| `unlock-pdf` | 3 | 3 | — |
| `reorder-pdf-pages` | 10 | 10 | — |
| `watermark-pdf` | 10 | 10 | — |

## Resumo por caso

| Caso | Ferramentas | Chromium | WebKit |
| --- | --- | ---: | ---: |
| `compress-lossless-117` | `compress-pdf (lossless)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-lossless-300` | `compress-pdf (lossless)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-lossless-nasa` | `compress-pdf (lossless)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-lossless-small` | `compress-pdf (lossless)` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `compress-recommended-117` | `compress-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-recommended-300` | `compress-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-recommended-nasa` | `compress-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-recommended-small` | `compress-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `compress-strong-117` | `compress-pdf (strong)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-strong-300` | `compress-pdf (strong)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-strong-nasa` | `compress-pdf (strong)` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `compress-strong-small` | `compress-pdf (strong)` | 6 ok · 4 recusadas · 1 falharam | 6 ok · 4 recusadas · 1 falharam |
| `delete-117` | `delete-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `delete-300` | `delete-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `delete-nasa` | `delete-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `delete-small` | `delete-pdf-pages` | 7 ok · 0 recusadas | 7 ok · 0 recusadas |
| `images-big` | `pdf-to-jpg` | 4 ok · 0 recusadas | 4 ok · 0 recusadas |
| `images-small` | `pdf-to-jpg` | 8 ok · 4 recusadas | 8 ok · 4 recusadas |
| `merge-big` | `merge-pdf` | 3 ok · 3 recusadas | 3 ok · 3 recusadas |
| `merge-small` | `merge-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `numbers-117` | `add-page-numbers-to-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `numbers-300` | `add-page-numbers-to-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `numbers-nasa` | `add-page-numbers-to-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `numbers-small` | `add-page-numbers-to-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `protect-117` | `protect-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `protect-300` | `protect-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `protect-nasa` | `protect-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `protect-small` | `protect-pdf` | 7 ok · 5 recusadas | 7 ok · 5 recusadas |
| `reorder-117` | `reorder-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `reorder-300` | `reorder-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `reorder-nasa` | `reorder-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `reorder-small` | `reorder-pdf-pages` | 7 ok · 0 recusadas | 7 ok · 0 recusadas |
| `rotate-117` | `rotate-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `rotate-300` | `rotate-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `rotate-nasa` | `rotate-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `rotate-pages` | `rotate-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `rotate-small` | `rotate-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `sign-117` | `sign-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `sign-300` | `sign-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `sign-nasa` | `sign-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `sign-small` | `sign-pdf` | 7 ok · 0 recusadas | 7 ok · 0 recusadas |
| `split-big` | `split-pdf` | 2 ok · 0 recusadas | 2 ok · 0 recusadas |
| `split-each` | `split-pdf` | 1 ok · 1 recusadas | 1 ok · 1 recusadas |
| `split-nasa` | `split-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `split-ranges` | `split-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `split-small` | `split-pdf` | 5 ok · 0 recusadas | 5 ok · 0 recusadas |
| `unlock` | `unlock-pdf` | 3 ok · 1 recusadas | 3 ok · 1 recusadas |
| `watermark-117` | `watermark-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `watermark-300` | `watermark-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `watermark-nasa` | `watermark-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `watermark-small` | `watermark-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |

## `merge-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cifrado-aes256.pdf` | `merge-big` | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. | refused: gen-cifrado-aes256.pdf needs a password to open. Remove the password first with Unlock PDF. |
| `gen-cifrado-rc4-128.pdf` | `merge-big` | refused: gen-cifrado-rc4-128.pdf needs a password to open. Remove the password first with Unlock PDF. | refused: gen-cifrado-rc4-128.pdf needs a password to open. Remove the password first with Unlock PDF. |
| `gen-cifrado-dono.pdf` | `merge-big` | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. |
| `gen-paginas-300.pdf` | `merge-big` | ok: 300 pages in order, bookmarks kept | ok: 300 pages in order, bookmarks kept |
| `pdf-grande-fontes-embutidas-117p.pdf` | `merge-big` | ok: 117 pages in order, bookmarks kept | ok: 117 pages in order, bookmarks kept |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `merge-big` | ok: 150 pages in order, bookmarks kept | ok: 150 pages in order, bookmarks kept |
| `gen-cortado.pdf` | `merge-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `merge-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `merge-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `merge-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `merge-small` | ok: in the merged file, 8 pages in order | ok: in the merged file, 8 pages in order |
| `gen-acoes.pdf` | `merge-small` | ok: in the merged file, 2 pages in order | ok: in the merged file, 2 pages in order |
| `gen-fotos.pdf` | `merge-small` | ok: in the merged file, 4 pages in order | ok: in the merged file, 4 pages in order |
| `gen-ja-otimizado.pdf` | `merge-small` | ok: in the merged file, 12 pages in order | ok: in the merged file, 12 pages in order |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `merge-small` | ok: in the merged file, 1 pages in order | ok: in the merged file, 1 pages in order |
| `pdf-formulario-irs-1040-2019.pdf` | `merge-small` | ok: in the merged file, 2 pages in order | ok: in the merged file, 2 pages in order |
| `gen-xref-estragada.pdf` | `merge-small` | ok: in the merged file, 3 pages in order | ok: in the merged file, 3 pages in order |

## `split-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `split-big` | ok: 117 files | ok: 117 files |
| `pdf-formulario-irs-1040-2019.pdf` | `split-big` | ok: page 2 picked on the grid, its form fields kept | ok: page 2 picked on the grid, its form fields kept |
| `gen-paginas-mistas.pdf` | `split-each` | ok: 8 files, one page each, turns kept | ok: 8 files, one page each, turns kept |
| `gen-fotos.pdf` | `split-each` | refused: one PDF at a time | refused: one PDF at a time |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `split-nasa` | ok: 3 parts of 50 pages, every page in order | ok: 3 parts of 50 pages, every page in order |
| `gen-paginas-300.pdf` | `split-ranges` | ok: 3 parts by range | ok: 3 parts by range |
| `gen-acoes.pdf` | `split-small` | ok: 2 files, one page each, in order | ok: 2 files, one page each, in order |
| `gen-fotos.pdf` | `split-small` | ok: 4 files, one page each, in order | ok: 4 files, one page each, in order |
| `gen-ja-otimizado.pdf` | `split-small` | ok: 12 files, one page each, in order | ok: 12 files, one page each, in order |
| `gen-xref-estragada.pdf` | `split-small` | ok: 3 files, one page each, in order | ok: 3 files, one page each, in order |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `split-small` | ok: 1 files, one page each, in order | ok: 1 files, one page each, in order |

## `pdf-to-jpg`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-paginas-300.pdf` | `images-big` | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) |
| `pdf-grande-fontes-embutidas-117p.pdf` | `images-big` | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `images-big` | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) |
| `gen-fotos.pdf` | `images-big` | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) | ok: PNG at 150 ppi of pages 1, 2 and 117 (those it has) |
| `gen-cortado.pdf` | `images-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `images-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `images-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `images-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `images-small` | ok: 8 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 8 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-acoes.pdf` | `images-small` | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-fotos.pdf` | `images-small` | ok: 4 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 4 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-ja-otimizado.pdf` | `images-small` | ok: 12 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 12 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-cifrado-dono.pdf` | `images-small` | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `images-small` | ok: 1 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 1 JPG at 72 ppi, sizes within 1 px, no Exif |
| `pdf-formulario-irs-1040-2019.pdf` | `images-small` | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-xref-estragada.pdf` | `images-small` | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif |

## `compress-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `compress-recommended-117` | ok: 5321132 → 5309090 bytes | ok: 5321132 → 5309090 bytes |
| `gen-paginas-300.pdf` | `compress-recommended-300` | ok: 234441 → 144327 bytes | ok: 234441 → 144327 bytes |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `compress-recommended-nasa` | ok: 3615137 → 3094027 bytes | ok: 3615137 → 3094027 bytes |
| `gen-cortado.pdf` | `compress-recommended-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `compress-recommended-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `compress-recommended-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `compress-recommended-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `compress-recommended-small` | ok: 6939 → 4646 bytes | ok: 6939 → 4646 bytes |
| `gen-acoes.pdf` | `compress-recommended-small` | ok: 3482 → 2102 bytes | ok: 3482 → 2102 bytes |
| `gen-fotos.pdf` | `compress-recommended-small` | ok: 2917866 → 950328 bytes | ok: 2917866 → 950328 bytes |
| `gen-ja-otimizado.pdf` | `compress-recommended-small` | ok: no gain, original bytes (15537) | ok: no gain, original bytes (15537) |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `compress-recommended-small` | ok: 167938 → 115495 bytes | ok: 167938 → 115495 bytes |
| `pdf-formulario-irs-1040-2019.pdf` | `compress-recommended-small` | ok: 146326 → 129958 bytes | ok: 146326 → 129958 bytes |
| `gen-xref-estragada.pdf` | `compress-recommended-small` | ok: 2787 → 2075 bytes | ok: 2787 → 2075 bytes |

## `compress-pdf (lossless)`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `compress-lossless-117` | ok: 5321132 → 5309090 bytes | ok: 5321132 → 5309090 bytes |
| `gen-paginas-300.pdf` | `compress-lossless-300` | ok: 234441 → 144327 bytes | ok: 234441 → 144327 bytes |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `compress-lossless-nasa` | ok: 3615137 → 3094027 bytes | ok: 3615137 → 3094027 bytes |
| `gen-cortado.pdf` | `compress-lossless-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `compress-lossless-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `compress-lossless-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `compress-lossless-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `compress-lossless-small` | ok: 6939 → 4646 bytes | ok: 6939 → 4646 bytes |
| `gen-acoes.pdf` | `compress-lossless-small` | ok: 3482 → 2102 bytes | ok: 3482 → 2102 bytes |
| `gen-fotos.pdf` | `compress-lossless-small` | ok: 2917866 → 2917039 bytes | ok: 2917866 → 2917039 bytes |
| `gen-ja-otimizado.pdf` | `compress-lossless-small` | ok: no gain, original bytes (15537) | ok: no gain, original bytes (15537) |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `compress-lossless-small` | ok: 167938 → 167716 bytes | ok: 167938 → 167716 bytes |
| `pdf-formulario-irs-1040-2019.pdf` | `compress-lossless-small` | ok: 146326 → 129958 bytes | ok: 146326 → 129958 bytes |
| `gen-xref-estragada.pdf` | `compress-lossless-small` | ok: 2787 → 2075 bytes | ok: 2787 → 2075 bytes |

## `compress-pdf (strong)`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `compress-strong-117` | ok: no gain, original bytes (5321132) | ok: no gain, original bytes (5321132) |
| `gen-paginas-300.pdf` | `compress-strong-300` | ok: no gain, original bytes (234441) | ok: no gain, original bytes (234441) |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `compress-strong-nasa` | ok: no gain, original bytes (3615137) | ok: no gain, original bytes (3615137) |
| `gen-cortado.pdf` | `compress-strong-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `compress-strong-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `compress-strong-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `compress-strong-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `compress-strong-small` | ok: no gain, original bytes (6939) | ok: no gain, original bytes (6939) |
| `gen-acoes.pdf` | `compress-strong-small` | ok: no gain, original bytes (3482) | ok: no gain, original bytes (3482) |
| `gen-fotos.pdf` | `compress-strong-small` | ok: 2917866 → 353818 bytes | ok: 2917866 → 352268 bytes |
| `gen-ja-otimizado.pdf` | `compress-strong-small` | ok: no gain, original bytes (15537) | ok: no gain, original bytes (15537) |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `compress-strong-small` | ok: 167938 → 54102 bytes | ok: 167938 → 54147 bytes |
| `pdf-formulario-irs-1040-2019.pdf` | `compress-strong-small` | ok: no gain, original bytes (146326) | ok: no gain, original bytes (146326) |
| `gen-xref-estragada.pdf` | `compress-strong-small` | failed: strict structure: +   "the startxref offset 999999 is not inside the body of the file", | failed: strict structure: +   "the startxref offset 999999 is not inside the body of the file", |

## `rotate-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `rotate-117` | ok: every /Rotate +90, 117 pages | ok: every /Rotate +90, 117 pages |
| `gen-paginas-300.pdf` | `rotate-300` | ok: every /Rotate +90, 300 pages | ok: every /Rotate +90, 300 pages |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `rotate-nasa` | ok: every /Rotate +90, 150 pages | ok: every /Rotate +90, 150 pages |
| `gen-paginas-mistas.pdf` | `rotate-pages` | ok: page 1 +180, page 4 +90, the rest as they were | ok: page 1 +180, page 4 +90, the rest as they were |
| `gen-cortado.pdf` | `rotate-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `rotate-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `rotate-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `rotate-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-acoes.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-fotos.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-ja-otimizado.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `pdf-formulario-irs-1040-2019.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-xref-estragada.pdf` | `rotate-small` | ok: every /Rotate +90 | ok: every /Rotate +90 |

## `delete-pdf-pages`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `delete-117` | ok: pages 2-116 out, 2 left in order | ok: pages 2-116 out, 2 left in order |
| `gen-paginas-300.pdf` | `delete-300` | ok: pages 2-299 out, every page picked refused | ok: pages 2-299 out, every page picked refused |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `delete-nasa` | ok: pages 2-149 out, 2 left in order | ok: pages 2-149 out, 2 left in order |
| `gen-paginas-mistas.pdf` | `delete-small` | ok: pages 1, 8 out, 6 left in order | ok: pages 1, 8 out, 6 left in order |
| `gen-acoes.pdf` | `delete-small` | ok: pages 2 out, 1 left in order | ok: pages 2 out, 1 left in order |
| `gen-fotos.pdf` | `delete-small` | ok: pages 1, 4 out, 2 left in order | ok: pages 1, 4 out, 2 left in order |
| `gen-ja-otimizado.pdf` | `delete-small` | ok: pages 1, 12 out, 10 left in order | ok: pages 1, 12 out, 10 left in order |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `delete-small` | ok: its only page picked, "needs at least one page" said, nothing deleted | ok: its only page picked, "needs at least one page" said, nothing deleted |
| `pdf-formulario-irs-1040-2019.pdf` | `delete-small` | ok: pages 2 out, 1 left in order | ok: pages 2 out, 1 left in order |
| `gen-xref-estragada.pdf` | `delete-small` | ok: pages 1, 3 out, 1 left in order | ok: pages 1, 3 out, 1 left in order |

## `add-page-numbers-to-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `numbers-117` | ok: "Page N of M" at the bottom centre of 117 pages, upright | ok: "Page N of M" at the bottom centre of 117 pages, upright |
| `gen-paginas-300.pdf` | `numbers-300` | ok: "Page N of M" at the bottom centre of 300 pages, upright | ok: "Page N of M" at the bottom centre of 300 pages, upright |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `numbers-nasa` | ok: "Page N of M" at the bottom centre of 150 pages, upright | ok: "Page N of M" at the bottom centre of 150 pages, upright |
| `gen-cortado.pdf` | `numbers-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `numbers-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `numbers-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `numbers-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-acoes.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-fotos.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-ja-otimizado.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `pdf-formulario-irs-1040-2019.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-xref-estragada.pdf` | `numbers-small` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |

## `sign-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `sign-117` | ok: the signature image on each of 117 pages | ok: the signature image on each of 117 pages |
| `gen-paginas-300.pdf` | `sign-300` | ok: the signature image on each of 300 pages | ok: the signature image on each of 300 pages |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `sign-nasa` | ok: the signature image on each of 150 pages | ok: the signature image on each of 150 pages |
| `gen-paginas-mistas.pdf` | `sign-small` | ok: the signature image on each of 8 pages | ok: the signature image on each of 8 pages |
| `gen-acoes.pdf` | `sign-small` | ok: the signature image on each of 2 pages | ok: the signature image on each of 2 pages |
| `gen-fotos.pdf` | `sign-small` | ok: the signature image on each of 4 pages | ok: the signature image on each of 4 pages |
| `gen-ja-otimizado.pdf` | `sign-small` | ok: the signature image on each of 12 pages | ok: the signature image on each of 12 pages |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `sign-small` | ok: the signature image on each of 1 pages | ok: the signature image on each of 1 pages |
| `pdf-formulario-irs-1040-2019.pdf` | `sign-small` | ok: the signature image on each of 2 pages | ok: the signature image on each of 2 pages |
| `gen-xref-estragada.pdf` | `sign-small` | ok: the signature image on each of 3 pages | ok: the signature image on each of 3 pages |

## `protect-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `protect-117` | ok: R6 AESv3, opens only with the password, 117 pages | ok: R6 AESv3, opens only with the password, 117 pages |
| `gen-paginas-300.pdf` | `protect-300` | ok: R6 AESv3, opens only with the password, 300 pages | ok: R6 AESv3, opens only with the password, 300 pages |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `protect-nasa` | ok: R6 AESv3, opens only with the password, 150 pages | ok: R6 AESv3, opens only with the password, 150 pages |
| `gen-cortado.pdf` | `protect-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `protect-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `protect-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `protect-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-cifrado-dono.pdf` | `protect-small` | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. | refused: gen-cifrado-dono.pdf has editing restrictions. Remove them first with Unlock PDF. |
| `gen-paginas-mistas.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-acoes.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-fotos.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-ja-otimizado.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `pdf-formulario-irs-1040-2019.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-xref-estragada.pdf` | `protect-small` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |

## `unlock-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cifrado-aes256.pdf` | `unlock` | ok: wrong password said, right one removed it, no /Encrypt | ok: wrong password said, right one removed it, no /Encrypt |
| `gen-cifrado-rc4-128.pdf` | `unlock` | ok: wrong password said, right one removed it, no /Encrypt | ok: wrong password said, right one removed it, no /Encrypt |
| `gen-cifrado-dono.pdf` | `unlock` | ok: restrictions removed without a password | ok: restrictions removed without a password |
| `gen-paginas-mistas.pdf` | `unlock` | refused: no password or restrictions | refused: no password or restrictions |

## `reorder-pdf-pages`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `reorder-117` | ok: 117 pages reversed | ok: 117 pages reversed |
| `gen-paginas-300.pdf` | `reorder-300` | ok: 300 pages reversed | ok: 300 pages reversed |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `reorder-nasa` | ok: 150 pages reversed | ok: 150 pages reversed |
| `gen-paginas-mistas.pdf` | `reorder-small` | ok: 8 pages reversed | ok: 8 pages reversed |
| `gen-acoes.pdf` | `reorder-small` | ok: 2 pages reversed | ok: 2 pages reversed |
| `gen-fotos.pdf` | `reorder-small` | ok: 4 pages reversed | ok: 4 pages reversed |
| `gen-ja-otimizado.pdf` | `reorder-small` | ok: 12 pages reversed | ok: 12 pages reversed |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `reorder-small` | ok: one page, "move a page" said, nothing written | ok: one page, "move a page" said, nothing written |
| `pdf-formulario-irs-1040-2019.pdf` | `reorder-small` | ok: 2 pages reversed | ok: 2 pages reversed |
| `gen-xref-estragada.pdf` | `reorder-small` | ok: 3 pages reversed | ok: 3 pages reversed |

## `watermark-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `pdf-grande-fontes-embutidas-117p.pdf` | `watermark-117` | ok: the text on each of 117 pages | ok: the text on each of 117 pages |
| `gen-paginas-300.pdf` | `watermark-300` | ok: the text on each of 300 pages | ok: the text on each of 300 pages |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `watermark-nasa` | ok: the text on each of 150 pages | ok: the text on each of 150 pages |
| `gen-cortado.pdf` | `watermark-small` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `watermark-small` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `watermark-small` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `watermark-small` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `gen-acoes.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `gen-fotos.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `gen-ja-otimizado.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `pdf-formulario-irs-1040-2019.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
| `gen-xref-estragada.pdf` | `watermark-small` | ok: the text on every page | ok: the text on every page |
