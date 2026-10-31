# F2 · Matriz de fixtures

Gerada por `node scripts/fixtures/matrix-table.ts` a partir de `test-results/matriz/*.json`, que `tests/e2e/image-matrix.spec.ts` e `tests/e2e/image-presets.spec.ts` gravam a cada execução, em Chromium e WebKit. Nada aqui é escrito à mão: para refazer, rode as duas specs numa execução do Playwright (ela limpa o `test-results`) e o comando acima.

Cada ferramenta recebeu a página uma vez por navegador e um lote só com todas as fixtures que aceita (pelo formato real dos bytes) e, no meio dele, as que recusa. Cada saída foi lida do ZIP (ou do PDF) em Node: formato real, dimensões de exibição conforme o oráculo `fixtures/images/expected.json` e as opções, se abre no navegador, orientação por pixels contra a imagem em pé montada dos pixels gravados, transparência e ausência de Exif, XMP, IPTC e GPS. Cada recusa foi conferida na linha do arquivo, com a fala da Oli, o link quando há e o evento `tool_error`. Nenhuma requisição saiu de `127.0.0.1` em nenhum teste.

Legenda: `ok · formato largura×altura · tamanho · abre · notas`; `recusado (motivo)` é a fala da Oli na linha do arquivo; `—` é fixture que aquele lote não trouxe.

## Resumo por teste

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

## `compress-image`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Recommended | ok · JPG 3024×4032 · 1,2 MB · abre | ok · JPG 3024×4032 · 1,2 MB · abre |
| `jpg-02-iphone6-paisagem-gps.jpg` | Recommended | ok · JPG 3264×2448 · 717 KB · abre | ok · JPG 3264×2448 · 717 KB · abre |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Recommended | ok · JPG 3264×2448 · 550 KB · abre · orientação ok (Δ0.2) | ok · JPG 3264×2448 · 550 KB · abre · orientação ok (Δ0.4) |
| `gen-jpg-01-orientacao6.jpg` | Recommended | ok · JPG 1200×1600 · 232 KB · abre · orientação ok (Δ0.3) | ok · JPG 1200×1600 · 232 KB · abre · orientação ok (Δ0.7) |
| `gen-jpg-02-orientacao8.jpg` | Recommended | ok · JPG 1600×1200 · 241 KB · abre · orientação ok (Δ0.1) | ok · JPG 1600×1200 · 241 KB · abre · orientação ok (Δ0.5) |
| `gen-png-transparente.png` | Recommended | ok · PNG 800×600 · 889 KB · abre · transparência mantida | ok · PNG 800×600 · 889 KB · abre · transparência mantida |
| `gen-webp-exif-gps.webp` | Recommended | ok · WebP 1600×1200 · 204 KB · abre | ok · WebP 1600×1200 · 204 KB · abre |
| `gen-webp-animada.webp` | Recommended | ok · WebP 320×240 · 7 KB · abre · animação mantida | ok · WebP 320×240 · 7 KB · abre · animação mantida |
| `gen-png-extensao-jpg.jpg` | Recommended | ok · PNG 640×480 · 541 KB · abre | ok · PNG 640×480 · 541 KB · abre |
| `gen-grande-4100x4100.jpg` | Recommended | ok · JPG 4100×4100 · 138 KB · abre | ok · JPG 4100×4100 · 138 KB · abre |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | Recommended | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | Recommended | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | Recommended | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | Recommended | recusado (truncated) | recusado (truncated) |
| `gen-vazio.jpg` | Recommended | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | Recommended | recusado (unsupported) | recusado (unsupported) |

## `crop-image`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Square (default), centred | ok · JPG 3024×3024 · 3,0 MB · abre | ok · JPG 3024×3024 · 3,0 MB · abre |
| `jpg-02-iphone6-paisagem-gps.jpg` | Square (default), centred | ok · JPG 2448×2448 · 1,5 MB · abre | ok · JPG 2448×2448 · 1,5 MB · abre |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Square (default), centred | ok · JPG 2448×2448 · 1,4 MB · abre · orientação ok (Δ0.9) | ok · JPG 2448×2448 · 1,4 MB · abre · orientação ok (Δ0.2) |
| `gen-jpg-01-orientacao6.jpg` | Square (default), centred | ok · JPG 1200×1200 · 420 KB · abre · orientação ok (Δ0.1) | ok · JPG 1200×1200 · 420 KB · abre · orientação ok (Δ0.2) |
| `gen-jpg-02-orientacao8.jpg` | Square (default), centred | ok · JPG 1200×1200 · 356 KB · abre · orientação ok (Δ0.1) | ok · JPG 1200×1200 · 356 KB · abre · orientação ok (Δ0.1) |
| `gen-png-transparente.png` | Square (default), centred | ok · PNG 600×600 · 857 KB · abre · transparência mantida | ok · PNG 600×600 · 745 KB · abre · transparência mantida |
| `gen-webp-exif-gps.webp` | Square (default), centred | ok · WebP 1200×1200 · 247 KB · abre | ok · WebP 1200×1200 · 247 KB · abre |
| `gen-webp-animada.webp` | Square (default), centred | ok · WebP 240×240 · 4 KB · abre · primeiro quadro | ok · WebP 240×240 · 4 KB · abre · primeiro quadro |
| `gen-png-extensao-jpg.jpg` | Square (default), centred | ok · PNG 480×480 · 579 KB · abre | ok · PNG 480×480 · 475 KB · abre |
| `gen-grande-4100x4100.jpg` | Square (default), centred | ok · JPG 4100×4100 · 195 KB · abre | ok · JPG 4100×4100 · 195 KB · abre |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | Square (default), centred | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | Square (default), centred | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | Square (default), centred | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | Square (default), centred | recusado (truncated) | recusado (truncated) |
| `gen-vazio.jpg` | Square (default), centred | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | Square (default), centred | recusado (unsupported) | recusado (unsupported) |

## `heic-to-jpg`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `heic-01-iphone11pro-retrato-livephoto.heic` | JPG (default) | ok · JPG 3024×4032 · 1,2 MB · abre | ok · JPG 3024×4032 · 1,2 MB · abre |
| `heic-02-iphone11pro-retrato-livephoto.heic` | JPG (default) | ok · JPG 3024×4032 · 6,3 MB · abre | ok · JPG 3024×4032 · 6,3 MB · abre |
| `heic-03-iphone11pro-retrato-livephoto.heic` | JPG (default) | ok · JPG 3024×4032 · 3,7 MB · abre | ok · JPG 3024×4032 · 3,7 MB · abre |
| `heic-04-iphone11promax-retrato-livephoto-gps.heic` | JPG (default) | ok · JPG 2566×3313 · 1,4 MB · abre | ok · JPG 2566×3313 · 1,4 MB · abre |
| `heic-10-visionpro-espacial-2imagens.heic` | JPG (default) | ok · JPG 2560×2560 · 1,2 MB · abre | ok · JPG 2560×2560 · 1,2 MB · abre |
| `heic-05-iphone13promax-retrato-orientacao6-hdr.heic` | JPG (default) | ok · JPG 3024×4032 · 3,2 MB · abre | ok · JPG 3024×4032 · 3,2 MB · abre |
| `heic-06-iphone7-paisagem-gps.heic` | JPG (default) | ok · JPG 4032×3024 · 2,7 MB · abre | ok · JPG 4032×3024 · 2,7 MB · abre |
| `heic-07-iphone13pro-paisagem-profundidade-hdr-gps.heic` | JPG (default) | ok · JPG 4032×3024 · 1,5 MB · abre | ok · JPG 4032×3024 · 1,5 MB · abre |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | JPG (default) | ok · JPG 1512×850 · 309 KB · abre | ok · JPG 1512×850 · 309 KB · abre |
| `heic-09-samsung-s10-retrato-orientacao6.heic` | JPG (default) | ok · JPG 3024×4032 · 2,0 MB · abre | ok · JPG 3024×4032 · 2,0 MB · abre |
| `gen-jpg-02-orientacao8.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-png-extensao-jpg.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-webp-animada.webp` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-truncado.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-vazio.jpg` | JPG (default) | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | JPG (default) | recusado (unsupported) | recusado (unsupported) |
| `heic-05-iphone13promax-retrato-orientacao6-hdr.heic` | PNG | ok · PNG 3024×4032 · 21,4 MB · abre | ok · PNG 3024×4032 · 15,8 MB · abre |
| `heic-07-iphone13pro-paisagem-profundidade-hdr-gps.heic` | PNG | ok · PNG 4032×3024 · 10,7 MB · abre | ok · PNG 4032×3024 · 6,8 MB · abre |
| `heic-10-visionpro-espacial-2imagens.heic` | PNG | ok · PNG 2560×2560 · 8,2 MB · abre | ok · PNG 2560×2560 · 5,4 MB · abre |
| `gen-vazio.jpg` | PNG | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | PNG | recusado (unsupported) | recusado (unsupported) |

## `image-to-pdf`

Um PDF com 10 páginas (10,5 MB em Chromium), uma imagem por página, na ordem da fila; a página tem o tamanho da imagem.

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Image size (default) | ok · JPG 3024×4032 · 3,6 MB · página do PDF · 3024×4032 px numa página de 3024×4032 pt | ok · JPG 3024×4032 · 3,6 MB · página do PDF · 3024×4032 px numa página de 3024×4032 pt |
| `jpg-02-iphone6-paisagem-gps.jpg` | Image size (default) | ok · JPG 3264×2448 · 2,1 MB · página do PDF · 3264×2448 px numa página de 3264×2448 pt | ok · JPG 3264×2448 · 2,1 MB · página do PDF · 3264×2448 px numa página de 3264×2448 pt |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Image size (default) | ok · JPG 3264×2448 · 1,8 MB · página do PDF · 3264×2448 px numa página de 3264×2448 pt; orientação ok (Δ0.1) | ok · JPG 3264×2448 · 1,8 MB · página do PDF · 3264×2448 px numa página de 3264×2448 pt; orientação ok (Δ0.2) |
| `gen-jpg-01-orientacao6.jpg` | Image size (default) | ok · JPG 1200×1600 · 474 KB · página do PDF · 1200×1600 px numa página de 1200×1600 pt; orientação ok (Δ0.1) | ok · JPG 1200×1600 · 474 KB · página do PDF · 1200×1600 px numa página de 1200×1600 pt; orientação ok (Δ0.1) |
| `gen-jpg-02-orientacao8.jpg` | Image size (default) | ok · JPG 1600×1200 · 462 KB · página do PDF · 1600×1200 px numa página de 1600×1200 pt; orientação ok (Δ0.1) | ok · JPG 1600×1200 · 462 KB · página do PDF · 1600×1200 px numa página de 1600×1200 pt; orientação ok (Δ0.1) |
| `gen-png-transparente.png` | Image size (default) | ok · PNG 800×600 · 1,1 MB · página do PDF · 800×600 px numa página de 800×600 pt; transparência mantida (máscara) | ok · PNG 800×600 · 1,1 MB · página do PDF · 800×600 px numa página de 800×600 pt; transparência mantida (máscara) |
| `gen-webp-exif-gps.webp` | Image size (default) | ok · JPG 1600×1200 · 510 KB · página do PDF · 1600×1200 px numa página de 1600×1200 pt | ok · JPG 1600×1200 · 510 KB · página do PDF · 1600×1200 px numa página de 1600×1200 pt |
| `gen-webp-animada.webp` | Image size (default) | ok · JPG 320×240 · 10 KB · página do PDF · 320×240 px numa página de 320×240 pt | ok · JPG 320×240 · 10 KB · página do PDF · 320×240 px numa página de 320×240 pt |
| `gen-png-extensao-jpg.jpg` | Image size (default) | ok · JPG 640×480 · 123 KB · página do PDF · 640×480 px numa página de 640×480 pt | ok · JPG 640×480 · 123 KB · página do PDF · 640×480 px numa página de 640×480 pt |
| `gen-grande-4100x4100.jpg` | Image size (default) | ok · JPG 4100×4100 · 277 KB · página do PDF · 4100×4100 px numa página de 4100×4100 pt | ok · JPG 4100×4100 · 277 KB · página do PDF · 4100×4100 px numa página de 4100×4100 pt |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | Image size (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | Image size (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | Image size (default) | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | Image size (default) | recusado (truncated) | recusado (truncated) |
| `gen-vazio.jpg` | Image size (default) | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | Image size (default) | recusado (unsupported) | recusado (unsupported) |

## `png-to-jpg`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | JPG files go to PNG | ok · PNG 3024×4032 · 22,0 MB · abre | ok · PNG 3024×4032 · 16,6 MB · abre |
| `jpg-02-iphone6-paisagem-gps.jpg` | JPG files go to PNG | ok · PNG 3264×2448 · 14,1 MB · abre | ok · PNG 3264×2448 · 11,0 MB · abre |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | JPG files go to PNG | ok · PNG 3264×2448 · 12,7 MB · abre · orientação ok (Δ0.0) | ok · PNG 3264×2448 · 10,0 MB · abre · orientação ok (Δ0.0) |
| `gen-jpg-01-orientacao6.jpg` | JPG files go to PNG | ok · PNG 1200×1600 · 3,4 MB · abre · orientação ok (Δ0.0) | ok · PNG 1200×1600 · 2,6 MB · abre · orientação ok (Δ0.0) |
| `gen-jpg-02-orientacao8.jpg` | JPG files go to PNG | ok · PNG 1600×1200 · 3,8 MB · abre · orientação ok (Δ0.0) | ok · PNG 1600×1200 · 3,0 MB · abre · orientação ok (Δ0.0) |
| `gen-grande-4100x4100.jpg` | JPG files go to PNG | ok · PNG 4100×4100 · 218 KB · abre | ok · PNG 4100×4100 · 218 KB · abre |
| `gen-webp-animada.webp` | JPG files go to PNG | recusado (wrong-tool) | recusado (wrong-tool) |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | JPG files go to PNG | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | JPG files go to PNG | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | JPG files go to PNG | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | JPG files go to PNG | recusado (truncated) | recusado (truncated) |
| `gen-png-transparente.png` | PNG files go to JPG | ok · JPG 800×600 · 121 KB · abre · transparência em branco | ok · JPG 800×600 · 122 KB · abre · transparência em branco |
| `gen-png-extensao-jpg.jpg` | PNG files go to JPG | ok · JPG 640×480 · 123 KB · abre | ok · JPG 640×480 · 123 KB · abre |
| `gen-webp-animada.webp` | PNG files go to JPG | recusado (wrong-tool) | recusado (wrong-tool) |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | PNG files go to JPG | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | PNG files go to JPG | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-vazio.jpg` | PNG files go to JPG | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | PNG files go to JPG | recusado (unsupported) | recusado (unsupported) |

## `resize-image`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Untouched: 50% of each image | ok · JPG 1512×2016 · 918 KB · abre | ok · JPG 1512×2016 · 980 KB · abre |
| `jpg-02-iphone6-paisagem-gps.jpg` | Untouched: 50% of each image | ok · JPG 1632×1224 · 589 KB · abre | ok · JPG 1632×1224 · 622 KB · abre |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Untouched: 50% of each image | ok · JPG 1632×1224 · 461 KB · abre · orientação ok (Δ0.1) | ok · JPG 1632×1224 · 486 KB · abre · orientação ok (Δ0.4) |
| `gen-jpg-01-orientacao6.jpg` | Untouched: 50% of each image | ok · JPG 600×800 · 156 KB · abre · orientação ok (Δ0.1) | ok · JPG 600×800 · 164 KB · abre · orientação ok (Δ1.2) |
| `gen-jpg-02-orientacao8.jpg` | Untouched: 50% of each image | ok · JPG 800×600 · 182 KB · abre · orientação ok (Δ0.1) | ok · JPG 800×600 · 191 KB · abre · orientação ok (Δ0.8) |
| `gen-png-transparente.png` | Untouched: 50% of each image | ok · PNG 400×300 · 313 KB · abre · transparência mantida | ok · PNG 400×300 · 292 KB · abre · transparência mantida |
| `gen-webp-exif-gps.webp` | Untouched: 50% of each image | ok · WebP 800×600 · 155 KB · abre | ok · WebP 800×600 · 162 KB · abre |
| `gen-webp-animada.webp` | Untouched: 50% of each image | ok · WebP 160×120 · 3 KB · abre · primeiro quadro | ok · WebP 160×120 · 3 KB · abre · primeiro quadro |
| `gen-png-extensao-jpg.jpg` | Untouched: 50% of each image | ok · PNG 320×240 · 210 KB · abre | ok · PNG 320×240 · 185 KB · abre |
| `gen-grande-4100x4100.jpg` | Untouched: 50% of each image | ok · JPG 2050×2050 · 136 KB · abre | ok · JPG 2050×2050 · 136 KB · abre |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | Untouched: 50% of each image | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | Untouched: 50% of each image | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | Untouched: 50% of each image | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | Untouched: 50% of each image | recusado (truncated) | recusado (truncated) |
| `gen-vazio.jpg` | Untouched: 50% of each image | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | Untouched: 50% of each image | recusado (unsupported) | recusado (unsupported) |

## `rotate-image`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Right 90° (default), no mirror | ok · JPG 4032×3024 · 3,5 MB · abre | ok · JPG 4032×3024 · 3,5 MB · abre |
| `jpg-02-iphone6-paisagem-gps.jpg` | Right 90° (default), no mirror | ok · JPG 2448×3264 · 2,1 MB · abre | ok · JPG 2448×3264 · 2,1 MB · abre |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Right 90° (default), no mirror | ok · JPG 2448×3264 · 1,7 MB · abre · orientação ok (Δ0.1) | ok · JPG 2448×3264 · 1,7 MB · abre · orientação ok (Δ0.2) |
| `gen-jpg-01-orientacao6.jpg` | Right 90° (default), no mirror | ok · JPG 1600×1200 · 467 KB · abre · orientação ok (Δ0.1) | ok · JPG 1600×1200 · 467 KB · abre · orientação ok (Δ0.1) |
| `gen-jpg-02-orientacao8.jpg` | Right 90° (default), no mirror | ok · JPG 1200×1600 · 455 KB · abre · orientação ok (Δ0.1) | ok · JPG 1200×1600 · 455 KB · abre · orientação ok (Δ0.1) |
| `gen-png-transparente.png` | Right 90° (default), no mirror | ok · PNG 600×800 · 1,1 MB · abre · transparência mantida | ok · PNG 600×800 · 956 KB · abre · transparência mantida |
| `gen-webp-exif-gps.webp` | Right 90° (default), no mirror | ok · WebP 1200×1600 · 355 KB · abre | ok · WebP 1200×1600 · 355 KB · abre |
| `gen-webp-animada.webp` | Right 90° (default), no mirror | ok · WebP 240×320 · 5 KB · abre · primeiro quadro | ok · WebP 240×320 · 5 KB · abre · primeiro quadro |
| `gen-png-extensao-jpg.jpg` | Right 90° (default), no mirror | ok · PNG 480×640 · 751 KB · abre | ok · PNG 480×640 · 643 KB · abre |
| `gen-grande-4100x4100.jpg` | Right 90° (default), no mirror | ok · JPG 4100×4100 · 350 KB · abre | ok · JPG 4100×4100 · 350 KB · abre |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | Right 90° (default), no mirror | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | Right 90° (default), no mirror | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | Right 90° (default), no mirror | recusado (decode) | recusado (decode) |
| `gen-jpg-truncado.jpg` | Right 90° (default), no mirror | recusado (truncated) | recusado (truncated) |
| `gen-vazio.jpg` | Right 90° (default), no mirror | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | Right 90° (default), no mirror | recusado (unsupported) | recusado (unsupported) |

## `webp-to-jpg`

| Fixture | Opções | Chromium | WebKit |
| --- | --- | --- | --- |
| `gen-webp-exif-gps.webp` | JPG (default) | ok · JPG 1600×1200 · 510 KB · abre · orientação ok (Δ0.9) | ok · JPG 1600×1200 · 510 KB · abre · orientação ok (Δ0.9) |
| `gen-webp-animada.webp` | JPG (default) | ok · JPG 320×240 · 10 KB · abre · primeiro quadro (vermelho) | ok · JPG 320×240 · 10 KB · abre · primeiro quadro (vermelho) |
| `gen-jpg-02-orientacao8.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-png-extensao-jpg.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `heic-08-iphone13pro-paisagem-hdr-ios17.heic` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-avif.avif` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-corrompido.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-jpg-truncado.jpg` | JPG (default) | recusado (wrong-tool) | recusado (wrong-tool) |
| `gen-vazio.jpg` | JPG (default) | recusado (empty) | recusado (empty) |
| `gen-texto-extensao-png.png` | JPG (default) | recusado (unsupported) | recusado (unsupported) |

## Presets

Bytes de cada saída (o limite é o do preset). Cada célula: `bytes (largura×altura)`; a coluna Entrada é o arquivo que entrou.

### `/compress-image/to-100kb/`

Limite: 100.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 99.114 JPG (783×1044) | 99.769 JPG (783×1044) | reduzida para 783×1044 px |
| `gen-png-transparente.png` | 1.096.229 | 97.749 JPG (800×600) | 97.948 JPG (800×600) | só a qualidade; transparência em branco |
| `gen-webp-exif-gps.webp` | 262.648 | 98.472 JPG (1238×929) | 97.413 JPG (1238×929) | reduzida para 1238×929 px |
| `gen-webp-animada.webp` | 7.186 | 7.186 WebP (320×240) | 7.186 WebP (320×240) | já cabia: mesmo formato e sem metadados |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 97.851 JPG (1216×912) | 99.480 JPG (1216×912) | reduzida para 1216×912 px; orientação ok |

### `/compress-image/to-1mb/`

Limite: 1.000.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 758.841 JPG (3024×4032) | 758.841 JPG (3024×4032) | só a qualidade |
| `gen-png-transparente.png` | 1.096.229 | 129.218 JPG (800×600) | 129.585 JPG (800×600) | só a qualidade; transparência em branco |
| `gen-webp-exif-gps.webp` | 262.648 | 242.170 WebP (1600×1200) | 242.170 WebP (1600×1200) | já cabia: mesmo formato e sem metadados |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 397.011 JPG (1600×1200) | 397.011 JPG (1600×1200) | já cabia: mesmo formato e sem metadados; orientação ok |

### `/resize-image/youtube-thumbnail/`

Limite: 2.000.000 bytes.

| Fixture | Entrada | Chromium | WebKit | Notas |
| --- | ---: | ---: | ---: | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | 4.360.452 | 302.690 JPG (1280×720) | 343.792 JPG (1280×720) | 16:9 pelo centro |
| `gen-png-transparente.png` | 1.096.229 | 197.093 JPG (1280×720) | 205.004 JPG (1280×720) | 16:9 pelo centro; transparência em branco (dito no resultado) |
| `gen-webp-exif-gps.webp` | 262.648 | 263.742 JPG (1280×720) | 274.468 JPG (1280×720) | 16:9 pelo centro |
| `gen-jpg-02-orientacao8.jpg` | 417.455 | 278.289 JPG (1280×720) | 289.626 JPG (1280×720) | 16:9 pelo centro; orientação ok |
