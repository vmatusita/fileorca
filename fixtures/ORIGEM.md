# Origem das fixtures

Arquivos reais de teste usados pelas runs (F2 para imagem, F5 para PDF). Uma linha por arquivo na tabela abaixo.

Regras:

- Nada de pessoas, documentos ou dados pessoais. Fotos em lugar público.
- Imagens em `fixtures/images/`, PDFs em `fixtures/pdf/`.
- Nomes sem espaço e sem acento (ex.: `heic-retrato-01.heic`).
- Nenhum arquivo acima de 50 MB.
- As fixtures nunca entram no build, no site publicado nem na pasta `src/engine/image/` que a F5 prepara para publicar sob MIT. Várias têm licença própria (veja "Licenças e atribuição").

## O que a F0 precisa trazer

- 10 fotos HEIC originais de iPhone (retrato, paisagem e uma Live Photo), em lugar público.
- 3 JPG do celular com localização ligada, em lugar público: uma em pé e duas deitadas.
- 2 PDFs escaneados pelo celular, de páginas impressas sem dado pessoal.
- 1 PDF com formulário preenchível, de um formulário público de governo.
- 1 PDF grande, com fontes embutidas, de um relatório público.

Exemplo de linha:

```
| images/heic-retrato-01.heic | HEIC original de iPhone, retrato | iCloud.com, "Original não modificado" | 2026-10-30 | praça, sem pessoas |
```

## Arquivos

Todos baixados de coleções públicas de arquivos de teste no GitHub, sem nenhuma alteração de conteúdo (só o nome mudou). Cada fonte está fixada no commit usado, e o SHA-256 de cada arquivo está em "Conferência".

| Arquivo | O que é | De onde veio | Data | Observação |
| --- | --- | --- | --- | --- |
| images/heic-01-iphone11pro-retrato-livephoto.heic | HEIC de iPhone 11 Pro, iOS 13.4.1, retrato 3024×4032, Live Photo | github.com/drewnoakes/metadata-extractor-images, `heic/IMG_2927.HEIC`, commit 7b56b64903 | 2026-10-30 | placa "No pets allowed" na rua, sem pessoas; Live Photo: só a foto (tem ContentIdentifier), o vídeo .MOV par não vem junto |
| images/heic-02-iphone11pro-retrato-livephoto.heic | HEIC de iPhone 11 Pro, iOS 13.4.1, retrato 3024×4032, Live Photo | mesmo repositório, `heic/IMG_2928.HEIC` | 2026-10-30 | piso de calçada, sem pessoas; textura fina, por isso 6,2 MB (o maior HEIC, bom para testar compressão) |
| images/heic-03-iphone11pro-retrato-livephoto.heic | HEIC de iPhone 11 Pro, iOS 13.4.1, retrato 3024×4032, Live Photo | mesmo repositório, `heic/IMG_2929.HEIC` | 2026-10-30 | minibiblioteca de rua num jardim, sem pessoas |
| images/heic-04-iphone11promax-retrato-livephoto-gps.heic | HEIC de iPhone 11 Pro Max, iOS 14.4.2, retrato 2566×3313, Live Photo, com GPS | github.com/ianare/exif-samples, `heic/IMG_5195.HEIC`, commit 5332a9cf02 | 2026-10-30 | flor ao ar livre, sem pessoas; tamanho fora do padrão do sensor (provável recorte no próprio iPhone); sem tag Orientation |
| images/heic-05-iphone13promax-retrato-orientacao6-hdr.heic | HEIC de iPhone 13 Pro Max, iOS 15.2.1, gravado 4032×3024 com rotação no contêiner e EXIF Orientation 6; aparece em pé, 3024×4032; tem mapa de ganho HDR | mesmo repositório, `heic/mobile/iphone_13_pro_max.HEIC` | 2026-10-30 | cozinha sem pessoas; sem GPS; caso da rotação dupla (veja "Notas para as runs") |
| images/heic-06-iphone7-paisagem-gps.heic | HEIC de iPhone 7, iOS 13.1.2, paisagem 4032×3024, com GPS e miniatura embutida | github.com/MikeKovarik/exifr, `test/fixtures/heic-iphone7.heic`, commit 6cbf6e9216 | 2026-10-30 | praia ao entardecer, sem pessoas |
| images/heic-07-iphone13pro-paisagem-profundidade-hdr-gps.heic | HEIC de iPhone 13 Pro, iOS 16.2, paisagem 4032×3024, modo Retrato com mapa de profundidade e mapa de ganho HDR, com GPS | github.com/bigcat88/pillow_heif, `tests/images/heif_other/pug.heic`, commit 558ee2bfbe | 2026-10-30 | um cachorro (pug), sem pessoas |
| images/heic-08-iphone13pro-paisagem-hdr-ios17.heic | HEIC de iPhone 13 Pro, iOS 17.6.1, paisagem 1512×850, com mapa de ganho HDR | github.com/johncf/apple-hdr-heic, `tests/data/hdr-sample.heic` (Git LFS), commit e64716c29a | 2026-10-30 | mar e barcos ao pôr do sol, sem pessoas; iOS mais recente do conjunto; reduzido pelo autor (não é o tamanho nativo); sem GPS |
| images/heic-09-samsung-s10-retrato-orientacao6.heic | HEIC de Samsung Galaxy S10 (SM-G975F), gravado 4032×3024 com rotação no contêiner e EXIF Orientation 6; aparece em pé, 3024×4032; com GPS | github.com/drewnoakes/metadata-extractor-images, `heic/Issue 487.heic`, commit 7b56b64903 | 2026-10-30 | superfície branca com cabo, sem pessoas; **não é iPhone** (veja "Lacunas"); HEIC de Android, sem perfil ICC |
| images/heic-10-visionpro-espacial-2imagens.heic | HEIC de Apple Vision Pro, visionOS 1.1.2, foto espacial: 2 imagens de 2560×2560 (par estéreo) no mesmo arquivo; tag de GPS presente, mas zerada (0, 0) | github.com/bigcat88/pillow_heif, `tests/images/heif_other/spatial_photo.heic`, commit 558ee2bfbe | 2026-10-30 | vaso de planta num deque, sem pessoas; **não é iPhone** (veja "Lacunas"); o único HEIC com mais de uma imagem |
| images/jpg-01-pixel2-retrato-gps.jpg | JPG de Google Pixel 2, em pé 3024×4032, com GPS | github.com/drewnoakes/metadata-extractor-images, `jpg/Google Pixel 2.jpg`, commit 7b56b64903 | 2026-10-30 | Capitólio de Wisconsin na neve, lugar público, sem pessoas |
| images/jpg-02-iphone6-paisagem-gps.jpg | JPG de iPhone 6, iOS 8.0, deitada 3264×2448, com GPS | mesmo repositório, `jpg/Apple iPhone 6.jpg` | 2026-10-30 | chão de mata com folhas, ao ar livre, sem pessoas |
| images/jpg-03-iphone5-paisagem-orientacao3-gps.jpg | JPG de iPhone 5, iOS 6.0, deitada 3264×2448 com EXIF Orientation 3 (gravada de cabeça para baixo), com GPS | mesmo repositório, `jpg/Apple iPhone 5.jpg` | 2026-10-30 | flores num canteiro à beira d'água, lugar público, sem pessoas (só uma abelha) |
| pdf/pdf-escaneado-01-pagina-livro-cor.pdf | PDF de 1 página escaneada em cor: uma imagem JPEG de 770×995 a 150 ppi, sem camada de texto | github.com/ocrmypdf/OCRmyPDF, `tests/resources/c03-29.pdf`, commit b457e9efa6 | 2026-10-30 | página de livro antigo em domínio público (capítulo III, com ilustração), papel amarelado, com cara de foto de celular; 168 KB |
| pdf/pdf-escaneado-02-relatorio-nasa-150p.pdf | PDF de 150 páginas escaneadas em preto e branco (CCITT G4, 300 ppi), sem camada de texto, linearizado | NASA CR-159065, "MAIL LOG: Program Operating Instructions" (1979), NTRS 19810023338; cópia de github.com/BradleyKH/mail-log, `NASA-contractor-report.pdf`, commit 521d6169f7 | 2026-10-30 | relatório técnico público da NASA; o único dado de pessoa é o nome do autor na capa; `qpdf --check` passa com 2 avisos na tabela de dicas da linearização (caso real de scanner antigo) |
| pdf/pdf-formulario-irs-1040-2019.pdf | Formulário 1040 de 2019 do IRS (Receita dos EUA), 2 páginas, AcroForm com 116 campos (82 de texto e 34 de marcar) mais XFA, todos em branco | arquivo original do IRS (Adobe LiveCycle Designer ES 9.0); cópia de github.com/Hopding/pdf-lib, `assets/pdfs/with_xfa_fields.pdf`, commit 93dd36e85a | 2026-10-30 | formulário público de governo, sem nenhum campo preenchido; 13 fontes, todas embutidas; formulário híbrido AcroForm + XFA |
| pdf/pdf-grande-fontes-embutidas-117p.pdf | PDF de 117 páginas, 5,3 MB, gerado no pdfTeX, com 55 fontes, todas embutidas (54 Type 1 em subconjunto e 1 Type 3), 19 imagens e 16 marcadores | "Geometrie und Topologie", notas de aula de Martin Thoma (2016); github.com/py-pdf/sample-files, `009-pdflatex-geotopo/GeoTopo.pdf`, commit 80d67b91f3 | 2026-10-30 | documento público, sem dado pessoal além do nome do autor; texto em alemão, com fórmulas e figuras vetoriais |

## Licenças e atribuição

| Fonte | Arquivos | Licença |
| --- | --- | --- |
| drewnoakes/metadata-extractor-images | heic-01 a heic-03, heic-09, jpg-01 a jpg-03 | O README libera o uso livre ("You are free to use these media files however you wish") |
| ianare/exif-samples | heic-04, heic-05 | CC BY-SA 4.0 (imagens enviadas por usuários, conforme o README). Atribuição: colaboradores de ianare/exif-samples. Variantes geradas a partir delas seguem a mesma licença |
| MikeKovarik/exifr | heic-06 | MIT, © 2020 Mike Kovařík, Mutiny.cz |
| bigcat88/pillow_heif | heic-07, heic-10 | BSD-3-Clause, © 2021-2023 colaboradores do Pillow-Heif |
| johncf/apple-hdr-heic | heic-08 | MIT, © 2024 John Charankattu |
| ocrmypdf/OCRmyPDF | pdf-escaneado-01 | Domínio público (REUSE.toml do repositório: `c03-29.pdf`, "Public domain") |
| NASA (NTRS 19810023338) | pdf-escaneado-02 | "Work of the US Gov. Public Use Permitted" (página do NTRS); distribuição pública |
| IRS | pdf-formulario-irs-1040-2019 | Obra do governo dos EUA, domínio público |
| py-pdf/sample-files | pdf-grande-fontes-embutidas-117p | CC BY-SA 4.0 (README do repositório). Atribuição: Martin Thoma. Variantes geradas a partir dele seguem a mesma licença |

## Conferência (2026-10-30)

O que foi rodado em cada arquivo: exiftool 13.60 (metadados), pillow-heif 1.8.1 com libheif (decodificação completa de todos os HEIC e JPG), poppler (pdfinfo, pdffonts, pdfimages, pdftotext) e `qpdf --check`. Todos abriram e decodificaram sem erro. Cada foto foi olhada em meia resolução para confirmar que não aparece pessoa nem documento; cinco candidatas foram descartadas por isso (veja "Lacunas").

### Imagens

"Gravado" é o tamanho dos pixels no arquivo; "aparece" é como deve ficar na tela depois de aplicar a orientação.

| Arquivo | Aparelho | Sistema | Gravado | Orientation | Aparece | GPS | Live Photo | HDR | Profundidade | Tirada em |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| heic-01 | iPhone 11 Pro | iOS 13.4.1 | 3024×4032 | 1 | 3024×4032 | não | sim | não | não | 2020-05-04 |
| heic-02 | iPhone 11 Pro | iOS 13.4.1 | 3024×4032 | 1 | 3024×4032 | não | sim | não | não | 2020-05-04 |
| heic-03 | iPhone 11 Pro | iOS 13.4.1 | 3024×4032 | 1 | 3024×4032 | não | sim | não | não | 2020-05-04 |
| heic-04 | iPhone 11 Pro Max | iOS 14.4.2 | 2566×3313 | sem tag | 2566×3313 | sim | sim | não | não | 2021-04-11 |
| heic-05 | iPhone 13 Pro Max | iOS 15.2.1 | 4032×3024 + rotação no contêiner | 6 | 3024×4032 | não | não | sim | não | 2022-02-16 |
| heic-06 | iPhone 7 | iOS 13.1.2 | 4032×3024 | 1 | 4032×3024 | sim | não | não | não | 2019-10-20 |
| heic-07 | iPhone 13 Pro | iOS 16.2 | 4032×3024 | 1 | 4032×3024 | sim | não | sim | sim | 2023-02-21 |
| heic-08 | iPhone 13 Pro | iOS 17.6.1 | 1512×850 | 1 | 1512×850 | não | não | sim | não | 2024-10-06 |
| heic-09 | Samsung Galaxy S10 | Android | 4032×3024 + rotação no contêiner | 6 | 3024×4032 | sim | não | não | não | 2020-06-30 |
| heic-10 | Apple Vision Pro | visionOS 1.1.2 | 2 × 2560×2560 | sem tag | 2560×2560 | zerado (0, 0) | não | não | não | 2024-04-22 |
| jpg-01 | Google Pixel 2 | Android | 3024×4032 | 1 | 3024×4032 | sim | não | não | não | 2019-01-19 |
| jpg-02 | iPhone 6 | iOS 8.0 | 3264×2448 | 1 | 3264×2448 | sim | não | não | não | 2014-09-16 |
| jpg-03 | iPhone 5 | iOS 6.0 | 3264×2448 | 3 | 3264×2448, girada 180° | sim | não | não | não | 2012-09-29 |

### PDFs

| Arquivo | Páginas | Versão | Formulário | Fontes (embutidas) | Imagens | qpdf --check | Tamanho |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pdf-escaneado-01 | 1 | 1.3 | não | 0 | 1 JPEG | ok | 167.938 bytes |
| pdf-escaneado-02 | 150 | 1.3 | não | 12 declaradas, nenhuma embutida e nenhuma usada | 150 CCITT | ok, com 2 avisos de linearização | 3.615.137 bytes |
| pdf-formulario-irs-1040-2019 | 2 | 1.7 | AcroForm (116 campos) + XFA | 13 (13) | 0 | ok | 146.326 bytes |
| pdf-grande-fontes-embutidas-117p | 117 | 1.5 | não | 55 (55) | 19 | ok | 5.321.132 bytes |

### SHA-256

```
c00f914293509bc0056c6c8827cbf4dfb089aacb632b4b510276ec95be03097d  images/heic-01-iphone11pro-retrato-livephoto.heic
7d677d740f933c3aaeee03b1f03092bc6dea813960d1ba293758751774e2fb7b  images/heic-02-iphone11pro-retrato-livephoto.heic
89acffc252c0b2bd27620a1f7b65b9cf1fd6340e8af3f76ba007514f91bafeff  images/heic-03-iphone11pro-retrato-livephoto.heic
d9b9ebe21c4127080414f2b86f6ecb900dc2ca902be82b39be93b61ccb622680  images/heic-04-iphone11promax-retrato-livephoto-gps.heic
e760c80eed310e4f27c092d5487693ca8e104e7cc01d25ba4828deb28f679676  images/heic-05-iphone13promax-retrato-orientacao6-hdr.heic
599f04081cac8d3682a0f06a46f892744beb86356fb2b74f0afc79414272fdba  images/heic-06-iphone7-paisagem-gps.heic
1ddce96766efbfa0f6bdf634bdab26bdeff831393df8d67f4cdc7b7a7afebc67  images/heic-07-iphone13pro-paisagem-profundidade-hdr-gps.heic
c690fa4ecc6ae71ee9a926de869a95835a5d41e764ccbc200647e2fb9d0800cc  images/heic-08-iphone13pro-paisagem-hdr-ios17.heic
edb1aa1895dc2d1b3647c098f18e3671fa0166355469b2d2428274a4d8fd9801  images/heic-09-samsung-s10-retrato-orientacao6.heic
ef941d328072a2df034adb3c3b46f41117606bfc8fcc100dff975d31f55ec028  images/heic-10-visionpro-espacial-2imagens.heic
624dd02ad1550f2b504945ab0f85bbcfe4ab0a0778bb9a3ad3f1a6d636429370  images/jpg-01-pixel2-retrato-gps.jpg
b9b48cc85181b1d25c138ba84cdf9b38c03a1ef3d896f3aaf1f1199dc6e9e119  images/jpg-02-iphone6-paisagem-gps.jpg
662e58cc178ebab64139d7cb6ef2fe7f23e2f18ccb96606f5f86827a653c53ba  images/jpg-03-iphone5-paisagem-orientacao3-gps.jpg
c2ff83af7d028c95209cc7eebdf80fd5bb4cd292973ed6601e4bab7d1929f201  pdf/pdf-escaneado-01-pagina-livro-cor.pdf
1fe8326cdef6f449874b3a1d064d17a0d293ec71d47ebe26b45e709b3f81c84d  pdf/pdf-escaneado-02-relatorio-nasa-150p.pdf
c0ce611fedd25b47b78ef8bc10a4f91c4382030f32f420e7f819f778bfb57ec1  pdf/pdf-formulario-irs-1040-2019.pdf
a0b9242aef9b5a2c4850160cc9aaf64f5c7b8be705d6872ae28aebf5ab512540  pdf/pdf-grande-fontes-embutidas-117p.pdf
```

Para conferir, salve o bloco acima num arquivo e rode `sha256sum -c` dentro de `fixtures/`. Confira antes de cada commit que mexer aqui: algumas ferramentas de cópia gravam metadado novo dentro da imagem. Aconteceu na entrega destes arquivos (um manifesto C2PA de 5.876 bytes entrou em cada foto) e foi desfeito baixando cada foto de novo direto da fonte.

## Notas para as runs

- **Rotação dupla no HEIC.** heic-05 e heic-09 vêm com os pixels deitados, uma rotação no próprio contêiner HEIF (caixa `irot`) e, além disso, EXIF Orientation 6. Safari e libheif já entregam a imagem girada pelo `irot`. Se o código aplicar a Orientation do EXIF de novo, a foto sai deitada. Saída certa: 3024×4032, em pé.
- **Orientação no JPG.** jpg-03 vem com Orientation 3: sem aplicar, sai de cabeça para baixo. A F2 gera as outras variantes (6 e 8) a partir de jpg-01 e jpg-02.
- **GPS.** heic-04, heic-06, heic-07, heic-09 e os três JPG têm GPS de verdade; heic-10 tem a tag de GPS com coordenadas zeradas, que também precisa sumir. São os arquivos para o critério "nenhuma saída leva GPS" da F2.
- **Live Photo.** heic-01 a heic-04 são a foto de Live Photos (tag ContentIdentifier da Apple). O vídeo par não está incluído, como acontece quando alguém envia só a foto.
- **Mais de uma imagem no HEIC.** heic-05, heic-07 e heic-08 trazem o mapa de ganho HDR da Apple como imagem auxiliar, heic-07 também traz o mapa de profundidade do modo Retrato e heic-10 traz duas imagens completas (olho esquerdo e direito). A conversão deve usar só a imagem principal e devolver um arquivo por HEIC.
- **Escaneados sem texto.** Nenhum dos dois PDFs escaneados tem camada de texto. O da NASA declara 12 fontes padrão que nenhuma página usa.

## Lacunas

- **Duas fotos não são de iPhone.** Só achei 8 HEIC de iPhone com licença livre e sem pessoas. Quatro outras candidatas de iPhone foram descartadas por mostrar pessoas (um escritório com colegas ao fundo, um interior de mosteiro com turistas, uma piscina com banhistas e uma pessoa de costas diante de um telão). Pelo mesmo motivo, uma foto noturna de Galaxy S7 Edge com silhuetas ao fundo deu lugar a jpg-03. As duas vagas ficaram com um Samsung Galaxy S10 (HEIC de Android) e um Apple Vision Pro (HEIC com duas imagens), que cobrem casos que o iPhone sozinho não cobre. Para cumprir à risca, troque heic-09 e heic-10 por fotos suas de iPhone, sem pessoas, e atualize as duas linhas.
- **Escaneados.** pdf-escaneado-01 parece foto de celular (página colorida em JPEG), mas pdf-escaneado-02 saiu de um scanner de mesa (preto e branco, CCITT). Os dois cobrem o que a F5 precisa: página única colorida e documento longo em preto e branco.
- **Lugar público.** heic-05 (cozinha), heic-07 (cachorro em casa) e heic-10 (deque de uma casa) são de lugares particulares. Não aparece pessoa nem documento, as fotos já foram publicadas pelos donos como arquivo de teste. heic-05 não tem GPS e heic-10 tem GPS zerado; heic-07 tem o GPS que os donos publicaram junto com a foto.

## Gerados por script

As runs acrescentam aqui o que gerarem a partir dos arquivos acima (variantes de orientação EXIF, PNG transparente, WebP, AVIF, arquivo corrompido, PDF protegido e afins), com o script que gerou cada um.

| Arquivo | Gerado de | Script | Run |
| --- | --- | --- | --- |
| images/gen-jpg-01-orientacao6.jpg | jpg-01 (uso livre, drewnoakes/metadata-extractor-images): reduzida a 1200×1600, gravada girada em 1600×1200 com Orientation 6 no APP1 original (GPS mantido) | scripts/fixtures/generate.ts · sha256 38b64bc79360caf756aa841c0685443be911498b8139924f12c8fb7d941d53bd | F2 |
| images/gen-jpg-02-orientacao8.jpg | jpg-02 (uso livre, drewnoakes/metadata-extractor-images): gravada girada em 1200×1600 com Orientation 8 no APP1 original (GPS mantido), aparece em 1600×1200 | scripts/fixtures/generate.ts · sha256 8c25d3babd1ddc1669a1d1bab356613bfdd21b6c296ba0b4fac228aeae8e1a89 | F2 |
| images/gen-png-transparente.png | jpg-03 (uso livre, drewnoakes/metadata-extractor-images): 800×600 em pé, com degradê de transparência e os quatro cantos transparentes | scripts/fixtures/generate.ts · sha256 b80a2b2a11354cf407b16d7641e84a9e037999fb737eca7bb45ad7ab00aae57b | F2 |
| images/gen-webp-exif-gps.webp | jpg-02 (uso livre, drewnoakes/metadata-extractor-images): 1600×1200 em WebP com perda, VP8X e chunk EXIF com o TIFF da jpg-02 (GPS) | scripts/fixtures/generate.ts · sha256 f063f082744fe3af58ebd78e07d92755557e85becc60b885923dc116797fa46a | F2 |
| images/gen-webp-animada.webp | sem fonte externa, desenhada no script: 2 quadros de 320×240 (vermelho e azul), VP8X com animação, ANIM e 2 ANMF | scripts/fixtures/generate.ts · sha256 3aba208d87a09b1d0f3f4c85ba6aab3e5b7a6a431f2ca18bec521076c4b7ee43 | F2 |
| images/gen-avif.avif | jpg-03 (uso livre, drewnoakes/metadata-extractor-images): 1600×1200 com a Orientation 3 já aplicada, AVIF do @jsquash/avif (qualidade 50, velocidade 8) | scripts/fixtures/generate.ts · sha256 3cfaa81076134a0099454a9f6c32a5e708cf6dc5f95916fe9d5e9ff32acebaa8 | F2 |
| images/gen-jpg-truncado.jpg | jpg-02 (uso livre, drewnoakes/metadata-extractor-images): 1600×1200 cortada em 60% dos bytes, sem o marcador de fim (EOI) | scripts/fixtures/generate.ts · sha256 ab5c3e4f8abff83fcd79f2afa11b77cd7c1a2f514c6cba4793c2e7b3a674e9c3 | F2 |
| images/gen-jpg-corrompido.jpg | jpg-02 (uso livre, drewnoakes/metadata-extractor-images): 800×600 com o tamanho do primeiro DQT e a altura do SOF danificados (começa com FF D8 FF e termina com FF D9) | scripts/fixtures/generate.ts · sha256 de2192cac15c0396d2de471532c1852d0e57a63b7ee373a142c26e4861e133a2 | F2 |
| images/gen-png-extensao-jpg.jpg | jpg-02 (uso livre, drewnoakes/metadata-extractor-images): PNG de 640×480 com extensão .jpg | scripts/fixtures/generate.ts · sha256 df8236e9139467c86197722b0c8ff3a45d9406637a2587c8af752b3114f1026b | F2 |
| images/gen-texto-extensao-png.png | sem fonte externa: texto UTF-8 escrito no script, com extensão .png | scripts/fixtures/generate.ts · sha256 dc5d3985b7f3b212a58e0f82c66e705bad42ff54633581f41751cd43160c3774 | F2 |
| images/gen-vazio.jpg | sem fonte externa: arquivo de 0 bytes com extensão .jpg | scripts/fixtures/generate.ts · sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 | F2 |
| images/gen-grande-4100x4100.jpg | sem fonte externa, desenhada no script: 4100×4100 = 16.810.000 px (32.784 acima do limite do canvas), degradê e blocos de cor, sem metadados | scripts/fixtures/generate.ts · sha256 9b58a5919e0c67b27b8d2fe46c22e7612af01685280d06a4ca9306f0f3e52ea4 | F2 |
