# F5a · Matriz de fixtures dos PDFs

Gerada por `node scripts/fixtures/pdf-matrix-table.ts` a partir de `test-results/matriz-pdf/*.json`, que `tests/e2e/pdf-matrix.spec.ts` grava a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode a spec nos dois navegadores numa execução só do Playwright (ela limpa o `test-results`) e o comando acima.

Cada ferramenta recebeu a página uma vez por navegador e um lote com as fixtures que aceita e, no meio dele, as que recusa (vazio, cortado, imagem ou texto com nome `.pdf`, e os PDFs com senha onde a ferramenta não os abre). Cada saída foi baixada e lida em Node por leitores que não são o motor: a estrutura estrita do arquivo, o `qpdf --check` (sem aviso novo), o PDF.js (cada página e a lista de operadores dela) e a conta da ferramenta contra o oráculo `fixtures/pdf/expected.json`: contagem e ordem das páginas pelos marcadores, `/Rotate`, texto do número e da marca d'água, imagem da assinatura em cada página, ausência de `/Encrypt` depois da Unlock, R6 com AESv3 depois da Protect, dimensões das imagens da PDF to JPG pela resolução (com 1 px de folga) e ausência de Exif e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli.

Legenda: `ok: o que foi conferido` e `refused: a fala da linha do arquivo`; `—` é uma linha que aquele navegador não gravou.

Ao todo, 208 linhas: 142 conferidas e 66 recusas (Chromium 104, WebKit 104).

## Resumo por caso

| Caso | Ferramentas | Chromium | WebKit |
| --- | --- | ---: | ---: |
| `compress-lossless-strong` | `compress-pdf (lossless)`, `compress-pdf (strong)` | 6 ok · 0 recusadas | 6 ok · 0 recusadas |
| `compress-recommended` | `compress-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `delete` | `delete-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `images-big` | `pdf-to-jpg` | 4 ok · 0 recusadas | 4 ok · 0 recusadas |
| `images-small` | `pdf-to-jpg` | 6 ok · 4 recusadas | 6 ok · 4 recusadas |
| `merge-big` | `merge-pdf` | 3 ok · 3 recusadas | 3 ok · 3 recusadas |
| `merge-small` | `merge-pdf` | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `numbers` | `add-page-numbers-to-pdf` | 8 ok · 4 recusadas | 8 ok · 4 recusadas |
| `protect` | `protect-pdf` | 3 ok · 4 recusadas | 3 ok · 4 recusadas |
| `reorder` | `reorder-pdf-pages` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `rotate-batch` | `rotate-pdf` | 8 ok · 4 recusadas | 8 ok · 4 recusadas |
| `rotate-pages` | `rotate-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `sign` | `sign-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `split-big` | `split-pdf` | 2 ok · 0 recusadas | 2 ok · 0 recusadas |
| `split-each` | `split-pdf` | 1 ok · 1 recusadas | 1 ok · 1 recusadas |
| `split-ranges` | `split-pdf` | 1 ok · 0 recusadas | 1 ok · 0 recusadas |
| `unlock` | `unlock-pdf` | 3 ok · 1 recusadas | 3 ok · 1 recusadas |
| `watermark` | `watermark-pdf` | 8 ok · 4 recusadas | 8 ok · 4 recusadas |

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
| `gen-paginas-300.pdf` | `split-ranges` | ok: 3 parts by range | ok: 3 parts by range |

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
| `gen-cifrado-dono.pdf` | `images-small` | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `images-small` | ok: 1 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 1 JPG at 72 ppi, sizes within 1 px, no Exif |
| `pdf-formulario-irs-1040-2019.pdf` | `images-small` | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 2 JPG at 72 ppi, sizes within 1 px, no Exif |
| `gen-xref-estragada.pdf` | `images-small` | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif | ok: 3 JPG at 72 ppi, sizes within 1 px, no Exif |

## `compress-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cortado.pdf` | `compress-recommended` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `compress-recommended` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `compress-recommended` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `compress-recommended` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `compress-recommended` | ok: 6939 → 4646 bytes | ok: 6939 → 4646 bytes |
| `gen-acoes.pdf` | `compress-recommended` | ok: 3482 → 2102 bytes | ok: 3482 → 2102 bytes |
| `gen-fotos.pdf` | `compress-recommended` | ok: 2917866 → 950328 bytes | ok: 2917866 → 950328 bytes |
| `gen-ja-otimizado.pdf` | `compress-recommended` | ok: already optimized, original bytes (15537) | ok: already optimized, original bytes (15537) |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `compress-recommended` | ok: 167938 → 115495 bytes | ok: 167938 → 115495 bytes |
| `pdf-formulario-irs-1040-2019.pdf` | `compress-recommended` | ok: 146326 → 129958 bytes | ok: 146326 → 129958 bytes |
| `gen-xref-estragada.pdf` | `compress-recommended` | ok: 2787 → 2075 bytes | ok: 2787 → 2075 bytes |

## `compress-pdf (lossless)`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-paginas-300.pdf` | `compress-lossless-strong` | ok: 234441 → 144327 bytes | ok: 234441 → 144327 bytes |
| `pdf-grande-fontes-embutidas-117p.pdf` | `compress-lossless-strong` | ok: 5321132 → 5309090 bytes | ok: 5321132 → 5309090 bytes |
| `pdf-escaneado-02-relatorio-nasa-150p.pdf` | `compress-lossless-strong` | ok: 3615137 → 3094027 bytes | ok: 3615137 → 3094027 bytes |

## `compress-pdf (strong)`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-fotos.pdf` | `compress-lossless-strong` | ok: pages as pictures, 2917866 → 353818 bytes | ok: pages as pictures, 2917866 → 352268 bytes |
| `gen-paginas-mistas.pdf` | `compress-lossless-strong` | ok: no gain, original bytes | ok: no gain, original bytes |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `compress-lossless-strong` | ok: pages as pictures, 167938 → 54102 bytes | ok: pages as pictures, 167938 → 54147 bytes |

## `rotate-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cortado.pdf` | `rotate-batch` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `rotate-batch` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `rotate-batch` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `rotate-batch` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-acoes.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-fotos.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-ja-otimizado.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `pdf-formulario-irs-1040-2019.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-xref-estragada.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-paginas-300.pdf` | `rotate-batch` | ok: every /Rotate +90 | ok: every /Rotate +90 |
| `gen-paginas-mistas.pdf` | `rotate-pages` | ok: page 1 +180, page 4 +90, the rest as they were | ok: page 1 +180, page 4 +90, the rest as they were |

## `delete-pdf-pages`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-paginas-300.pdf` | `delete` | ok: pages 2-299 out, every page picked refused | ok: pages 2-299 out, every page picked refused |

## `add-page-numbers-to-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cortado.pdf` | `numbers` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `numbers` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `numbers` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `numbers` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-acoes.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-fotos.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-ja-otimizado.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `pdf-formulario-irs-1040-2019.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `gen-xref-estragada.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |
| `pdf-grande-fontes-embutidas-117p.pdf` | `numbers` | ok: "Page N of M" at the bottom centre, upright | ok: "Page N of M" at the bottom centre, upright |

## `sign-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-paginas-mistas.pdf` | `sign` | ok: the signature image on every page | ok: the signature image on every page |

## `protect-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cortado.pdf` | `protect` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `protect` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `protect` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `protect` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `protect` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-fotos.pdf` | `protect` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |
| `gen-paginas-300.pdf` | `protect` | ok: R6 AESv3, opens only with the password | ok: R6 AESv3, opens only with the password |

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
| `gen-paginas-mistas.pdf` | `reorder` | ok: reversed | ok: reversed |

## `watermark-pdf`

| Fixture | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-cortado.pdf` | `watermark` | refused: gen-cortado.pdf stops before its end. Download it again and try once more. | refused: gen-cortado.pdf stops before its end. Download it again and try once more. |
| `gen-vazio.pdf` | `watermark` | refused: gen-vazio.pdf is empty. Choose the file again. | refused: gen-vazio.pdf is empty. Choose the file again. |
| `gen-jpg-extensao-pdf.pdf` | `watermark` | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. | refused: gen-jpg-extensao-pdf.pdf is an image, not a PDF. Turn it into one with Image to PDF. |
| `gen-texto-extensao-pdf.pdf` | `watermark` | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. | refused: gen-texto-extensao-pdf.pdf isn't a PDF. Choose a file that ends in .pdf and opens as a document. |
| `gen-paginas-mistas.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `gen-acoes.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `gen-fotos.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `gen-ja-otimizado.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `pdf-escaneado-01-pagina-livro-cor.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `pdf-formulario-irs-1040-2019.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `gen-xref-estragada.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
| `gen-paginas-300.pdf` | `watermark` | ok: the text on every page | ok: the text on every page |
