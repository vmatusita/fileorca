# F5b · Relatório (guias de arquivo em inglês e o kit do Product Hunt)

## Resumo

- **Os 10 guias de arquivo no ar, em inglês, em `/guides/<slug>/`.** Cada um embute uma ferramenta que já existia e traz dados próprios, medidos por script sobre as fixtures: 595 números em `data/guides-measured.json`, cada um com a data, a amostra e o método.
- **Nenhum número à mão.** Todo número de guia sai do JSON, de um fato oficial com fonte lida nesta run (link e data) ou de um nome técnico. O `tests/unit/guides-numbers.test.ts` reprova o resto, e o `pnpm guias:medir --check` refaz as medidas e compara.
- **Os hubs, a busca e as páginas das ferramentas embutidas** levam aos guias. Nenhuma página ficou órfã.
- **O kit do Product Hunt** está em `docs/lancamento/`: as regras lidas na fonte (com a data), os textos em inglês, 7 imagens geradas do site real (a miniatura em PNG e em GIF, e 5 da galeria) e uma prova para cada afirmação. As contagens do kit são testadas contra os registros.
- **Nada foi postado, enviado ou publicado.**
- **Revisão adversarial:** 6 lentes e 26 céticos acharam 57 pontos, nenhum crítico. Os 3 altos e os 14 médios confirmados eram 11 defeitos, e todos foram corrigidos com teste (§ 196 a § 207). A segunda passada achou 3 médios e 8 baixos nas correções: os médios e 5 baixos foram corrigidos (§ 208 a § 212).
- **A válvula não cortou nada:** os 10 guias e o GIF estão na PR.

## Os guias

Todos só em inglês (§ 58), com `Article`, `BreadcrumbList` e `Person`, a imagem de Open Graph do build e o sitemap. A área de anúncio é `arquivos` (§ 184).

| # | URL | Ferramenta | Hub | Palavras | O que foi medido | Fontes | JS inicial | Requisições |
| ---: | --- | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | `/guides/heic-to-jpg-on-windows/` | HEIC to JPG | Image tools | 1.096 | 20 números: tamanho, câmera e GPS das 10 fotos HEIC (Node) e a saída da HEIC to JPG nos dois navegadores | 4 | 20,9 KB | 6 / 7 |
| 2 | `/guides/why-is-my-pdf-so-large/` | Compress PDF | PDF tools | 1.115 | 130 números: o que ocupa cada um dos 10 PDFs (pdf-lib), o Sem perda e o Recomendado (Node, o motor) e o Forte (os dois navegadores) | 3 | 36,8 KB | 6 / 7 |
| 3 | `/guides/social-media-image-sizes/` | Resize image (e o preset do YouTube) | Image tools | 926 | 67 números: 3 fotos redimensionadas em cada uma das 12 medidas oficiais e no preset do YouTube, nos dois navegadores | 11 | 21,3 KB | 6 / 7 |
| 4 | `/guides/open-webp-save-as-jpg/` | WebP to JPG | Image tools | 900 | 21 números: os WebP de 5 arquivos (libwebp q75 do motor, Node) e a WebP to JPG nos dois navegadores | 4 | 20,9 KB | 6 / 7 |
| 5 | `/guides/jpg-vs-png/` | PNG to JPG | Image tools | 886 | 28 números: as mesmas fotos em JPG e em PNG, a volta (PSNR no Node) e o PNG transparente, nos dois navegadores | 3 | 20,8 KB | 6 / 7 |
| 6 | `/guides/remove-location-from-photos/` | Resize image em 100% (escolhida pela medida, § 186) | Image tools | 1.016 | 95 números: GPS, câmera e data de 13 fotos (Node) e as ferramentas candidatas nos dois navegadores, com o PSNR | 5 | 21,3 KB | 6 / 7 |
| 7 | `/guides/pdf-to-jpg-resolution/` | PDF to JPG | PDF tools | 900 | 131 números: 72, 150 e 300 ppi em JPG e PNG, nas páginas 1 e 2 de 5 PDFs, nos dois navegadores | 2 | 36,8 KB | 6 / 7 |
| 8 | `/guides/split-pdf-file-size/` | Split PDF | PDF tools | 991 | 65 números: a soma das partes, o que cada parte copia e os metadados repetidos, em 5 PDFs (Node, o motor) | 1 | 36,8 KB | 6 / 7 |
| 9 | `/guides/combine-pdfs-on-phone/` | Merge PDF | PDF tools | 963 | 18 números: 5 pares de PDFs juntados contra a soma dos dois (Node, o motor) | 3 | 36,8 KB | 6 / 7 |
| 10 | `/guides/photos-to-one-pdf/` | Image to PDF | Image tools | 930 | 20 números: 3 arquivos na Image to PDF direto e depois da Compress image, nos dois navegadores | 3 | 20,9 KB | 6 / 7 |

As requisições são no Chromium / no WebKit, de 8; o JS inicial é gzip, com o inline, de 80 KB. As palavras são as do texto do guia (os blocos `data-guide-text`), contadas pelo `gate:conteudo`.

- **Data das medidas:** 2/nov/2026 em UTC, o dia que o script grava (a noite de 1/nov em Brasília), no Windows 10.0.26300, com o Node 26.8.1, o Chromium 156.0.8078.4 e o WebKit 27.2 do Playwright. O JSON grava o commit de cada número.
- **Os métodos:** o caminho que a pessoa usa. O que roda no canvas foi medido pela página da ferramenta, no `dist/`, nos dois navegadores. O que roda no worker com o mesmo código (qpdf, pdf-lib, MozJPEG e os leitores de metadados) foi medido no Node, com os módulos do motor (§ 185).
- **A ferramenta do guia 6** saiu da medida (§ 186): a regra das candidatas escolheu a Resize image em 100%, que tira o GPS e o modelo da câmera e mantém o tamanho, e a página passa a opção inicial por propriedade, nunca pela URL.

## As medidas vieram antes dos textos

```
$ git log --format='%h %ad %s' --date=format:'%Y-%m-%d %H:%M' -- data/guides-measured.json src/i18n/en/guide-<os 10 guias>.ts
58ca0d6 2026-11-01 22:07 fix(guides): keep the sources' own date and the last claims inside the sample
fbd6a15 2026-11-01 21:43 fix(guides): say what the sample measured, with its size, direction and browser
51ee1f9 2026-11-01 21:40 fix(guides): compare each measured column by its own method, and measure what the texts now need
105a408 2026-11-01 20:32 chore(guides): measure the ten guides again on the final code
db64771 2026-11-01 20:25 fix(guides): read two measured counts the way a person would say them
3717b5f 2026-11-01 20:08 feat(guides): link the guides from the hubs, the tools and the search, and check them in the gates
9990715 2026-11-01 19:55 feat(guides): add the ten file guides with their embedded tools
0851d18 2026-11-01 19:35 feat(guides): add the measurements of the ten file guides

$ git log --format='%h %s' --diff-filter=A -- data/guides-measured.json scripts/guides/measure.ts src/i18n/en/guide-heic-to-jpg-on-windows.ts
9990715 feat(guides): add the ten file guides with their embedded tools
0851d18 feat(guides): add the measurements of the ten file guides
9b40d59 feat(guides): add the measurement script for the file guides
```

- **`9b40d59`:** o script de medida (`scripts/guides/`), os tipos do JSON e o registro dos guias.
- **`0851d18`:** o `data/guides-measured.json` e o `tests/unit/guides-measured.test.ts`.
- **`9990715`:** o texto dos guias, todos de uma vez, depois das medidas.
- **`105a408`:** a medida refeita no código final. Os 541 valores ficaram iguais, e só o commit gravado em cada número mudou.
- **`51ee1f9`, depois `fbd6a15` e `58ca0d6`:** as correções da revisão. O script e o JSON com as medidas novas (595 números) entraram num commit antes dos textos que as usam, e a última rodada de texto só usa números que já estavam no JSON.

## O checklist de cada guia (decisão 5)

Os itens que valem igual para os 10 têm a mesma prova:

1. **Nenhum número à mão:** o `guides-numbers.test.ts` lê o texto de cada guia com os placeholders vazios e reprova qualquer algarismo que não seja um fato oficial da lista do guia ou um nome técnico (`names`), e o `guides-measured.test.ts` exige que cada placeholder resolva no JSON (§ 189). As contagens por extenso ("two", "four") o teste não lê: as que restam estão nos baixos A-14 e F-10 da revisão.
2. **Fato com fonte:** cada fato de sistema, aplicativo ou rede é um `facts` com o id de uma fonte do guia, e cada fonte tem o link e a data da leitura (1/nov/2026). O `gate:conteudo` reprova fonte sem link `https` ou sem o `<time>` da leitura.
3. **Nada que vence:** nenhum título tem ano (o `gate:seo` reprova `19xx` e `20xx`), nenhum preço ou versão de aplicativo de terceiro. O "Reviewed" diz "First version, with the measurements of November 2, 2026" (no guia 3, também que as páginas de ajuda foram lidas na data dada com cada fonte), e a revisão e a publicação nunca vêm antes da medida (§ 207).
5. **Sem canibalização:** o `gate:seo` reprova título ou H1 que comece pelo nome da ferramenta embutida ou repita o de outra página (§ 187). Cada guia responde por quê, quando e como, e leva à ferramenta.
6. **A voz:** sentence case nos H1 e nos H2, sem emoji, sem as palavras proibidas da § 153 (o `gate:design` lê os textos dos guias, § 188), e a Oli só no painel da ferramenta.
7. **Sem enchimento:** o `gate:conteudo` reprova as frases da lista `FILLER` (`scripts/lib/file-guides.ts`: "in today's world", "delve", "it's important to note", "in conclusion" e outras).
8. **Gramática:** o `lint:texto` passa os 10 guias com os placeholders preenchidos pelos valores medidos (`fillFor`, § 189), com zero erro de gramática.

O que muda de guia para guia:

| # | Guia | 1 · Placeholders | 2 · Fontes (fatos) | 4 · Honestidade: o que o texto diz |
| ---: | --- | ---: | ---: | --- |
| 1 | HEIC to JPG on Windows | 19 | 4 (2) | "Converting re-encodes the picture, so the JPG is a new file"; "Of our {files} photos, {gpsBefore} had real GPS coordinates" |
| 2 | Why is my PDF so large | 35 | 3 (2) | "Compress PDF never hands back a file bigger than the one you gave it"; no Forte, "the text can no longer be selected or searched"; o ganho de cada modo nos PDFs gerados e nos reais, separados |
| 3 | Social media image sizes | 31 | 11 (11) | "the resized copy is written from its pixels"; "only {exactFrames_word} of our {outputs} resized photos came out at the exact size" |
| 4 | Open WebP, save as JPG | 14 | 4 (1) | "each JPG is written from the pixels of the image"; a transparência ("choose PNG instead if you need the transparency kept") e a animação, medida num WebP animado |
| 5 | JPG or PNG | 19 | 3 (0) | "Transparency decides it": os {transparentCornersBefore_word} cantos transparentes do PNG de teste viraram brancos no JPG |
| 6 | Remove location from photos | 23 | 5 (0) | a cópia é escrita dos pixels; "All {withGps_word} of our real phone photos in JPG had GPS coordinates" |
| 7 | PDF to JPG resolution | 35 | 2 (0) | "the first page of our PDF of photos weighed … as PNG against … as JPG"; texto e desenho viram pontos |
| 8 | Split PDF file size | 26 | 1 (0) | "We split {files_word} PDFs of our tests"; os três que cresceram, com quanto cada um, e a parte de cada pedaço que é cópia dos metadados |
| 9 | Combine PDFs on a phone | 13 | 3 (1) | "The merged file was never bigger than the two together, and it came out smaller in {smaller} of the {pairs} pairs, by very different amounts", com o que deu cada par |
| 10 | Photos into one PDF | 16 | 3 (0) | "Photos are written into the PDF as JPGs at a high quality; an image with transparency goes in as PNG" |

As palavras de cada guia ficam entre 800 e 1.500 pelo `gate:conteudo` (a tabela "Os guias", acima).

## O teste dos números, o teste das medidas e o `--check`

`pnpm exec vitest run tests/unit/guides-numbers.test.ts tests/unit/guides-measured.test.ts tests/unit/launch-kit.test.ts --reporter=verbose`, no commit `cfd1868`:

```
✓ tests/unit/guides-measured.test.ts > a deterministic part, measured again in Node with the same code > Compress PDF: Lossless and Recommended on the scanned page give the file values
✓ tests/unit/guides-measured.test.ts > a deterministic part, measured again in Node with the same code > Split PDF: the metadata each part of the NASA report repeats is what the file says (DECISOES § 200)
✓ tests/unit/guides-measured.test.ts > a deterministic part, measured again in Node with the same code > Split PDF: the parts of the tax form and of the 117-page book add up to the file
✓ tests/unit/guides-measured.test.ts > a deterministic part, measured again in Node with the same code > what takes the space in the tax form, and the merged pair of the scan and the form
✓ tests/unit/guides-measured.test.ts > guias:medir --check compares each column by who measured it (DECISOES § 185 and § 196) > compares the measured numbers the same way, by the method of each one
✓ tests/unit/guides-measured.test.ts > guias:medir --check compares each column by who measured it (DECISOES § 185 and § 196) > fails a Node value moved by 1.9% in a table that mixes Node and browser columns
✓ tests/unit/guides-measured.test.ts > guias:medir --check compares each column by who measured it (DECISOES § 185 and § 196) > passes a browser value moved within 2%, and fails one moved past it
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > are never newer than the review and publication dates the guides show
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > come from the script as it is now (the SHA-256 of scripts/guides/ is the one in the file)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > explain, in guide 8, the growth of the scans with the metadata every part repeats, as measured (DECISOES § 200)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > give every number and every table its sample, method, date and commit
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > hold every placeholder of every guide text, or the guide names it as an official fact
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > read a placeholder with a suffix as a way of writing the number, and nothing else
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > reject a number with no sample, a method with no browser version, a date of another day and a hand-written guide
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > say, in guide 6, which tools the two browsers wrote differently, from the measurement (DECISOES § 202)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > say, in guide 8, how much each file that grew grew, and what of a part is metadata (DECISOES § 209)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > say, in guide 9, how much smaller each merged pair came out (DECISOES § 208)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > settle the tool of guide 6, and the registry embeds that tool (DECISOES § 186)
✓ tests/unit/guides-measured.test.ts > the measurements of the file guides > take an official size only from the words of its page, and fail a size the page does not give (DECISOES § 198)
✓ tests/unit/guides-numbers.test.ts > the claims of the file guides stay inside their sample > catch a generalization, a minimum called the best and a missing sample (controls)
✓ tests/unit/guides-numbers.test.ts > the claims of the file guides stay inside their sample > never give the sources the date of the measurement
✓ tests/unit/guides-numbers.test.ts > the claims of the file guides stay inside their sample > say what the sample did, never what files usually do
✓ tests/unit/guides-numbers.test.ts > the claims of the file guides stay inside their sample > say whether a measured number is the lowest or the highest
✓ tests/unit/guides-numbers.test.ts > the claims of the file guides stay inside their sample > state how many files each measurement rests on
✓ tests/unit/guides-numbers.test.ts > the number check catches what it should (controls) > catches a forbidden word and an exclamation in a guide
✓ tests/unit/guides-numbers.test.ts > the number check catches what it should (controls) > fails a measured result typed by hand, in prose, a list, a heading or a table head
✓ tests/unit/guides-numbers.test.ts > the number check catches what it should (controls) > fails an official figure whose source the guide does not cite, and a source with no date
✓ tests/unit/guides-numbers.test.ts > the number check catches what it should (controls) > passes a guide whose numbers are placeholders, facts and names
✓ tests/unit/guides-numbers.test.ts > the numbers of the file guides > are all placeholders, official figures with a source, or technical names
✓ tests/unit/guides-numbers.test.ts > the numbers of the file guides > cite, in guide 3, every page the measured sizes were read on
✓ tests/unit/guides-numbers.test.ts > the numbers of the file guides > follow the voice of the design README: no forbidden word, emoji, arrow or exclamation
✓ tests/unit/guides-numbers.test.ts > the numbers of the file guides > hold no stray digit in the texts every guide shares, nor in the cards of the guides
✓ tests/unit/launch-kit.test.ts > the counts of the Product Hunt kit > equal the registries, in every phrase and in the counts line
✓ tests/unit/launch-kit.test.ts > the counts of the Product Hunt kit > fail when a registry and the kit disagree (control)
✓ tests/unit/launch-kit.test.ts > the images of the Product Hunt kit > are the thumbnail (PNG and GIF) and three to six gallery images
✓ tests/unit/launch-kit.test.ts > the images of the Product Hunt kit > carry nothing of the machine that made them: PNG image chunks only, GIF frames and loop only
✓ tests/unit/launch-kit.test.ts > the images of the Product Hunt kit > exist with the size and weight the kit states, inside the limits, each with a caption
✓ tests/unit/launch-kit.test.ts > the texts of the Product Hunt kit > fail an answer with no proof, an untested browser, offline without the codec, a loose "unlock" and "measured" on all guides (controls)
✓ tests/unit/launch-kit.test.ts > the texts of the Product Hunt kit > name a test that exists for every proof
✓ tests/unit/launch-kit.test.ts > the texts of the Product Hunt kit > say no forbidden word, no "fastest", "best" or "#1" in the English texts
✓ tests/unit/launch-kit.test.ts > the texts of the Product Hunt kit > state the right character counts, inside the limits read on Product Hunt
✓ tests/unit/launch-kit.test.ts > the texts of the Product Hunt kit > tie every technical sentence in English to a proof, and claim only what the proofs cover (DECISOES § 204 and § 205)
Test Files  3 passed (3)
Tests  42 passed (42)
```

- **O teste dos números** (`guides-numbers.test.ts`) reprova algarismo à mão em prosa, lista, título ou cabeçalho de tabela, fato oficial sem a fonte citada, fonte sem data, generalização além da amostra, mínimo ou máximo sem a direção dita, amostra não dita e a data da medida dada às fontes. Cada regra tem controle positivo e negativo.
- **O teste das medidas** (`guides-measured.test.ts`) confere o SHA-256 do script, a amostra, o método, a data e o commit de cada número, cada placeholder dos textos, a comparação do `--check` por coluna e uma parte determinista refeita no Node (Split, Compress e o que ocupa o formulário).
- **O `--check`,** depois da última mudança nos guias, sobre o `dist/` do commit `cfd1868`, a última linha do log:

  ```
  guias:medir --check: 0 difference(s) in 307.3 s
  ```

  O Node compara exato, e o navegador com a tolerância da § 185 (2% nos bytes, 0,5 dB no PSNR), coluna por coluna (§ 196).

## O spec novo e o `launch-claims.spec.ts`

Do log do `pnpm verificar` local (commit `cfd1868`), nos dois navegadores: 58 testes, todos verdes.

- **`tests/e2e/tool-guides.spec.ts`** (novo, 21 testes por navegador):
  - "the embedded tool works, gives a sound file and keeps it in the browser", um por guia. A fixture do guia entra na ferramenta embutida, e a saída passa nas mesmas conferências da página da ferramenta: abre, está no formato pedido e não leva GPS. Toda requisição, da página e dos workers, é um GET para a própria origem, sem corpo e sem query string, e o nome do arquivo só aparece no nome do download;
  - "the Oli of the panel covers no line of text, at 320, 360, 390, 600, 768, 1280 px", um por guia (§ 206 e § 212);
  - "every file guide has its case here, read from the registry".
- **`tests/e2e/launch-claims.spec.ts`** (8 testes por navegador): "no byte of the file leaves the browser, and the tool keeps working offline", em `/compress-image/`, `/heic-to-jpg/`, `/image-to-pdf/`, `/compress-pdf/`, `/pdf-to-jpg/`, `/protect-pdf/` e nos guias `/guides/heic-to-jpg-on-windows/` e `/guides/why-is-my-pdf-so-large/`.

```
[chromium] › tests/e2e/tool-guides.spec.ts › /guides/heic-to-jpg-on-windows/: the embedded tool works, gives a sound file and keeps it in the browser (1.9s)
[chromium] › tests/e2e/tool-guides.spec.ts › /guides/why-is-my-pdf-so-large/: the Oli of the panel covers no line of text, at 320, 360, 390, 600, 768, 1280 px (729ms)
[webkit] › tests/e2e/tool-guides.spec.ts › /guides/pdf-to-jpg-resolution/: the embedded tool works, gives a sound file and keeps it in the browser (2.4s)
[webkit] › tests/e2e/launch-claims.spec.ts › /guides/why-is-my-pdf-so-large/: no byte of the file leaves the browser, and the tool keeps working offline (2.1s)
… (58 linhas "ok", nenhuma falha)
```

## Orçamento

- **Os guias** carregam exatamente 2 arquivos JS: a entrada da ferramenta embutida e o grupo `island`, os mesmos arquivos (mesmo nome e hash) da página da ferramenta (§ 184). Nada do motor carrega antes do primeiro arquivo.

  | Guias | JS inicial (gzip, com o inline) | Requisições |
  | --- | --- | --- |
  | De imagem (1, 3, 4, 5, 6 e 10) | 20,8 a 21,3 KB de 80 | 6 no Chromium, 7 no WebKit, de 8 |
  | De PDF (2, 7, 8 e 9) | 36,8 KB de 80 | 6 no Chromium, 7 no WebKit, de 8 |

- **Pares de navegação** (até 3 requisições novas, `budgets.spec.ts`):

  | Par | Novas |
  | --- | ---: |
  | Ferramenta para o guia dela, e de volta | 1 (só o HTML) |
  | Hub para guia | 3 |
  | Guia de imagem para guia de PDF | 2 |
- **As páginas que já existiam**, antes e depois (gzip, com o inline). O número de arquivos não mudou. As de imagem cresceram até 0,1 KB, com a opção inicial do painel (`initial`) e a linha do guia.

  | Páginas | F5a | F5b |
  | --- | --- | --- |
  | Compress image, presets, pt e es | 20,7 a 20,9 KB | 20,8 a 21,0 KB |
  | Resize image | 21,2 KB | 21,2 KB |
  | Crop image | 23,1 KB | 23,1 KB |
  | Outras de imagem | 20,7 a 20,8 KB | 20,7 a 20,9 KB |
  | Calculadoras, presets e guias de dinheiro | 38,5 KB | 38,5 KB |
  | As 12 de PDF | 36,7 KB | 36,7 KB |
  | Hubs de imagem, de dinheiro e de PDF | 3,3, 3,6 e 3,4 KB | 3,3, 3,6 e 3,4 KB |

## Lighthouse

No celular, mediana de 3 execuções, no `pnpm verificar` local do commit `cfd1868`. O `lighthouserc.json` ganhou o guia mais pesado, `/guides/why-is-my-pdf-so-large/` (§ 194).

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/compress-image/` | 100 | 100 | 100 | 100 | 1,65 s | 0,001 |
| `/image-tools/` | 100 | 100 | 100 | 100 | 1,35 s | 0,000 |
| `/mortgage-calculator/` | 99 | 100 | 100 | 100 | 1,89 s | 0,001 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 100 | 100 | 100 | 1,82 s | 0,000 |
| `/compress-pdf/` | 99 | 100 | 100 | 100 | 1,80 s | 0,000 |
| `/pdf-tools/` | 100 | 100 | 100 | 100 | 1,35 s | 0,000 |
| `/guides/why-is-my-pdf-so-large/` (nova) | 99 | 100 | 100 | 100 | 1,89 s | 0,005 |

As seis páginas que já estavam ficaram com as mesmas notas da F5a. A lente (e) da revisão mediu mais 5 guias com a máquina carregada pelas outras lentes: de 94 a 97 de desempenho e 100 nas outras notas.

## Screenshots

- **Onde:** `pnpm screenshots` grava em `docs/relatorios/fase-05b/componentes/` (252 PNG), sobre o `dist/` do commit `61fe611`, o último com mudança visual. As pastas das fases anteriores ficaram como estavam.
- **Os guias**, nos dois temas, a 360 e a 1280 px:
  - `guide-heic-*`: o guia 1 em repouso;
  - `guide-heic-result-*`: o guia 1 com uma foto HEIC convertida, o resultado e o Baixar;
  - `guide-pdf-*`: o guia 2, com a ferramenta embutida e a tabela medida;
  - `image-hub-guides-*`: a seção Guides do `/image-tools/`, a 360 px.
- **O resto** (componentes, páginas, peças de PDF) sai do mesmo script da F5a, para comparar.

## O kit do Product Hunt

Tudo em `docs/lancamento/`. Nada foi enviado: nenhuma conta, nenhum post e nenhum agendamento (§ 191).

- **O que tem** (`docs/lancamento/product-hunt.md`):
  - um aviso no topo: o Product Hunt não quer comentário escrito por IA, então o primeiro comentário é um roteiro de fatos para o Victor reescrever;
  - o resumo das regras, em português;
  - o nome, 3 taglines (55, 56 e 55 caracteres de 60), 2 descrições (442 e 313 de 500) e os tópicos;
  - o primeiro comentário em inglês (1.543 de 5.000 caracteres), as perguntas prováveis com o roteiro de resposta, a tabela das imagens e as 12 provas;
  - o que ficou fora de propósito ("fastest", "best", comparações, "open source" sem o repositório no ar, tamanho máximo de arquivo, Safari de verdade);
  - o checklist da véspera, do dia, do que não fazer e do depois.
  - O `docs/lancamento/README.md` ganhou as linhas do kit e a ordem: o Product Hunt na primeira terça depois do merge da F5b.
- **As regras, lidas em 1/nov/2026** em 18 páginas do próprio Product Hunt (links no kit). O que importa:
  - qualquer pessoa com conta pessoal posta, e o maker pode lançar o próprio produto;
  - o lançamento entra às 12:01 AM do Pacífico: 5h01 em Brasília em novembro, porque o horário de verão dos EUA acabou em 1/nov;
  - é proibido pedir upvote em qualquer canal, sorteio ligado a voto, voto pago, spam, contas extras e anúncio do próprio Product Hunt no dia;
  - os limites: nome 40, tagline 60, descrição 500, até 3 tópicos, primeiro comentário 5.000, miniatura 240 × 240 até 2 MB e galeria 1270 × 760 abaixo de 3 MB;
  - o logo deles não pode ser alterado, e nenhuma imagem do kit usa o logo, o gato, um selo ou as cores do Product Hunt.
  - Onde duas páginas oficiais discordam (a espera de uma semana para postar, 2 MB ou 3 MB na miniatura, 1 ou 2 imagens na galeria), o kit diz e manda conferir no formulário.
- **Cada afirmação e o teste dela.** A seção "Provas" do kit põe no título de cada item as frases provadas, entre aspas. O `launch-kit.test.ts` exige que cada arquivo citado exista e que toda frase técnica em inglês (de envio, offline, navegador, anúncio, Analytics, cookie, conta, lote, ZIP, Ctrl+V, WebAssembly ou memória) contenha uma delas (§ 205).

  | Afirmação | Teste |
  | --- | --- |
  | "not uploaded", "never upload your files", "no request carries it" | `tests/e2e/launch-claims.spec.ts`, nos dois navegadores, em 6 ferramentas e em 2 guias |
  | "the tool keeps working if you go offline", só depois que a página e o codec carregaram | `launch-claims.spec.ts` (`context.setOffline(true)` e um segundo arquivo do mesmo codec) |
  | "WebAssembly codecs that load the first time you need them" | `tests/e2e/budgets.spec.ts` |
  | "tested automatically in Chromium and in WebKit", e nenhum outro navegador | `playwright.config.ts` e as partes do CI |
  | "10 of them with numbers measured on our test files" | `tests/unit/guides-measured.test.ts`, `guides-numbers.test.ts` e `calc-guides.test.ts` |
  | "There is no account", "No sign-up" | `tests/unit/routes.test.ts` ("has no page of an account") |
  | "paste with Ctrl+V", "a whole batch", "as one ZIP" | `tests/e2e/image-batch.spec.ts` |
  | "kept away from the tools" | `tests/e2e/ads.spec.ts` |
  | "an optional Ko-fi link" | `tests/e2e/coffee.spec.ts` |
  | "Google Analytics with Consent Mode, only on fileorca.com", "a cookie notice with Accept and Decline" | `tests/e2e/consent.spec.ts` e `consent-choice.spec.ts` |
  | "keep your numbers on your device" (legenda da galeria 5) | `tests/e2e/money-privacy.spec.ts` |

- **As contagens** (8 image tools, 3 presets, 12 PDF tools, 14 money calculators, 15 guides, 10 file guides e 5 money guides): o `tests/unit/launch-kit.test.ts` lê cada frase do kit que diz uma contagem e a linha `<!-- contagens: … -->`, e compara com `IMAGE_TOOL_IDS`, `IMAGE_PRESET_IDS`, `PDF_TOOL_IDS`, `CALC_TOOL_IDS`, `FILE_GUIDE_IDS`, `GUIDE_IDS` e a soma dos dois. A palavra "measured" só vale junto da contagem dos guias de arquivo (§ 204). O controle negativo troca "12 PDF tools" por "13" e reprova. O mesmo teste confere as contagens de caracteres, os limites e as palavras proibidas ("fastest", "best", "#1", "upvote", "support us").
- **As imagens** (`pnpm lancamento:imagens`, de `scripts/lancamento/imagens.ts`, sobre o `dist/` servido, com o consentimento recusado e os domínios do Google bloqueados; § 192 e § 193):

  | Arquivo | Uso | Tamanho | Peso |
  | --- | --- | --- | ---: |
  | `thumbnail.png` | Miniatura estática: a Oli em `wave` | 240 × 240 | 9.954 bytes |
  | `thumbnail.gif` | Miniatura animada: `wave` flutuando (`fo-float`) e depois `cheer` (`fo-cheer`) | 240 × 240 | 235.811 bytes |
  | `gallery-1.png` | A home em inglês | 1270 × 760 | 108.535 bytes |
  | `gallery-2.png` | HEIC to JPG com duas fotos de iPhone convertidas | 1270 × 760 | 151.228 bytes |
  | `gallery-3.png` | Compress PDF com o PDF de fotos | 1270 × 760 | 115.062 bytes |
  | `gallery-4.png` | O guia "Why is my PDF so large?" e a tabela medida | 1270 × 760 | 75.557 bytes |
  | `gallery-5.png` | A calculadora de financiamento com o exemplo | 1270 × 760 | 165.127 bytes |

  - O teste confere o tamanho e o peso de cada uma contra a tabela do kit, os limites e a legenda.
  - Os PNG só têm chunks de imagem, e o GIF só tem os quadros e o laço `NETSCAPE2.0`: nenhum nome da máquina, data ou comentário.
- **O GIF** sai dos SVG das poses `wave` e `cheer` (`@resvg/resvg-js`, que já estava no projeto), com os keyframes e as curvas dos tokens (`dur-float` 3.000 ms e `dur-cheer` 600 ms), e é codificado pelo `gifenc` 1.0.3 (MIT), a única devDependency nova (§ 192).

## CI

A última execução verde com código ou teste é a [run 41372335840](https://github.com/vmatusita/fileorca/actions/runs/41372335840), no commit `cfd1868`, com as 11 partes. O total é o do resumo do `verificar` de cada parte; a coluna da F5a é a [run 41344610873](https://github.com/vmatusita/fileorca/actions/runs/41344610873).

| Parte | Comando | Testes | Total F5a | Total F5b | Job |
| --- | --- | --- | ---: | ---: | ---: |
| `verificar` | `pnpm verificar --sem-playwright` | tipos, lint, build, Vitest, os portões, o Lighthouse das sete URLs e o `lint:texto` | 401,0 s | 374,9 s | 432 s |
| `playwright (chromium 1 de 3)` | `--playwright=chromium --shard=1/3` | 220 passed | 345,0 s | 323,2 s | 395 s |
| `playwright (chromium 2 de 3)` | `--playwright=chromium --shard=2/3` | 219 passed | 292,0 s | 316,7 s | 376 s |
| `playwright (chromium 3 de 3)` | `--playwright=chromium --shard=3/3` | 219 passed | 260,6 s | 460,0 s | 528 s |
| `playwright (webkit 1 de 7)` | `--playwright=webkit --shard=1/7` | 94 passed | 350,3 s | 221,9 s | 290 s |
| `playwright (webkit 2 de 7)` | `--playwright=webkit --shard=2/7` | 94 passed | 217,4 s | 403,2 s | 482 s |
| `playwright (webkit 3 de 7)` | `--playwright=webkit --shard=3/7` | 94 passed | 143,2 s | 143,5 s | 218 s |
| `playwright (webkit 4 de 7)` | `--playwright=webkit --shard=4/7` | 94 passed | 120,4 s | 226,0 s | 292 s |
| `playwright (webkit 5 de 7)` | `--playwright=webkit --shard=5/7` | 94 passed | 406,1 s | 520,9 s | 592 s |
| `playwright (webkit 6 de 7)` | `--playwright=webkit --shard=6/7` | 94 passed | 415,1 s | 507,7 s | 575 s |
| `playwright (webkit 7 de 7)` | `--playwright=webkit --shard=7/7` | 94 passed | 322,4 s | 432,6 s | 581 s |

- **A parte mais pesada** é a 5 do WebKit, com 520,9 s, abaixo do alvo de 700 s e do limite de 900 s. Nenhuma parte passou de 700 s, então o `ci.yml` não precisou de mais partes.
- **O que mudou de lugar:** os 70 testes novos de Playwright por navegador (658 em cada um, contra 588 na F5a: os guias no `a11y`, no `ads` e no `budgets`, o `tool-guides` e os casos de guia do `launch-claims`) empurraram specs para as partes seguintes. A parte 3 do Chromium ficou com o `tool-guides` e a matriz de PDF inteira (de 260,6 s para 460,0 s).
- **Minutos de runner:** a soma dos jobs desta execução é 4.761 s, uns 79 min por push. Na F5a eram uns 69 min.
- **Disco:** toda parte do Playwright terminou com "No coredumps found.", e nenhuma deu `ENOSPC`.
- **Falhas no meio do caminho:** nenhuma. Esta foi a primeira execução da PR, e passou.

- **Onde o `--list` pôs os specs** (commit `cfd1868`; entre parênteses, o número de testes na parte):

  | Parte | Specs |
  | --- | --- |
  | WebKit 1 de 7 | `a11y` (94) |
  | WebKit 2 de 7 | `a11y` (22), `ads` (72) |
  | WebKit 3 de 7 | `ads` (2), `budgets` (92) |
  | WebKit 4 de 7 | `budgets` (3), `coffee`, `consent-choice`, `consent`, `cookie-footer`, **`design` (50, inteiro)**, `engine-paths` |
  | WebKit 5 de 7 | `events`, `image-batch`, `image-crop`, **`image-matrix` (18)**, `image-presets`, `image-privacy`, `image-smoke`, `island`, `launch-claims` (8), `money-calc` (16) |
  | WebKit 6 de 7 | `money-calc` (16), `money-privacy`, `money-speed`, `navigation`, `pdf-hardening`, `pdf-matrix` (39) |
  | WebKit 7 de 7 | `pdf-matrix` (12), `pdf-privacy`, `pdf-speed`, `pdf-tool`, **`tool-guides` (21)**, `tool` |
  | Chromium 1 de 3 | `a11y` (116), `ads` (74), `budgets` (30) |
  | Chromium 2 de 3 | `budgets` (65), os de cookies e de consentimento, `design` (50), `engine-paths`, `events`, os de imagem, `island` (3) |
  | Chromium 3 de 3 | `island` (7), `launch-claims` (8), os de dinheiro, `navigation`, os de PDF, `tool-guides` (21), `tool` |

  O `design.spec.ts` e a matriz de imagens seguem em partes diferentes do WebKit (4 e 5), como pede a § 142. O spec novo se chama `tool-guides` para cair no fim da lista.
- **O `.github/` não mudou**, e nenhum teste ganhou `skip`, `fixme`, `only` ou `retries`.

## A revisão adversarial

Detalhe em `docs/relatorios/REVISAO-F5b.md`. Commit fixo `105a408`, numa worktree só de leitura (removida no fim), seis lentes Sonnet e um cético por achado crítico, alto ou médio (um por lente para os baixos): 32 agentes em 34 minutos.

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude dos números e dos fatos | 2 | 6 | 6 | 0 |
| (b) privacidade e segurança | 0 | 1 | 2 | 3 |
| (c) anúncio e política | 1 | 1 | 6 | 0 |
| (d) acessibilidade | 0 | 1 | 4 | 2 |
| (e) desempenho e SEO | 0 | 0 | 4 | 3 |
| (f) design system e voz | 0 | 5 | 10 | 0 |

- **Nenhum crítico.** Os 3 altos e os 14 médios confirmados são 11 defeitos (o "15 guides measured" do kit foi achado por quatro lentes):
  - o kit dizia que os 15 guias têm números medidos (só os 10 de arquivo têm) e afirmava além das provas (offline sem o codec, Firefox, respostas sem teste);
  - textos que generalizavam além da amostra ou contra a própria tabela (guias 2, 4, 8 e 9), a amostra não dita (guias 4, 5, 7 e 10), um mínimo chamado de melhor caso e uma concordância falsa entre navegadores (guia 6), a causa errada do crescimento no Split (guia 8);
  - o tamanho "oficial" da miniatura do YouTube, que a página citada não dá;
  - o `--check`, que escolhia exato ou tolerância pelo nome da coluna;
  - a Oli do painel tapando a última linha do texto acima da ferramenta, abaixo de 768 px.
- **As correções:** um agente só (Opus), cada uma com um teste que falha sem ela (§ 196 a § 206), e uma de data que elas criaram (§ 207). A medida foi refeita, com 0 diferença no `--check`.
- **A segunda passada,** sobre o diff das correções, achou 3 médios e 8 baixos, nenhum crítico ou alto. Os 3 médios e 5 baixos foram corrigidos com teste (§ 208 a § 212).
- **Os baixos que ficam** (32 da revisão, menos os que as correções levaram junto, e 4 da segunda passada) estão listados no `REVISAO-F5b.md`.

## `pnpm verificar` local

No commit `cfd1868`, depois de `CI=true pnpm install --frozen-lockfile`, sem argumento: todos os passos, em ordem, nos dois navegadores.

```
Resumo do pnpm verificar (tudo)
  ok       9.3 s  tipos (astro check)
  ok       3.6 s  lint (eslint)
  ok      14.8 s  build (astro build do zero)
  ok      29.6 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.6 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.6 s  links internos e páginas órfãs
  ok       0.8 s  conteúdo mínimo das ferramentas e do site
  ok      30.2 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.8 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.8 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     433.8 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok     247.7 s  lighthouse ci
  ok       7.3 s  lint:texto (LanguageTool)
  total 786.4 s (limite 900 s)
```

- **O Vitest:** 70 arquivos e 1.246 testes. Na F5a, eram 67 arquivos e 1.192 testes.
- **O Playwright:** 1.316 testes nos dois navegadores, todos verdes. Na F5a, eram 1.176.
- **O `lint:texto`:** 12 arquivos, 731 textos, 0 erro de gramática e 88 avisos de estilo.
- **O tempo:** subiu de 715,2 s, na F5a, para 786,4 s, com os guias no Playwright e no Lighthouse. O limite local continua 900 s; no CI, a mesma suíte se divide em 11 partes.

## Prévia

[https://fase-05b-fileorca.vmatusita.workers.dev](https://fase-05b-fileorca.vmatusita.workers.dev).

O que eu conferi nela no commit `cfd1868` (o último com código; a mesma sonda deu o mesmo resultado no `105a408`, o commit da revisão), com um Playwright de sonda (Chromium, os domínios do Google bloqueados por `context.route`, o consentimento recusado), um guia de imagem e um de PDF, a 360 e a 1280 px, com uma fixture cada:

```
[prévia] build.txt: cfd1868f0f9fae7b52aa9bc6f1bad33d72088835
[prévia] /guides/heic-to-jpg-on-windows/ a 360: 200, H1 "How to convert HEIC to JPG on Windows", 2 arquivos JS no carregamento, 1764955 → 2744933 bytes (heic-06-iphone7-paisagem-gps.jpg), 14 requisições, fora da regra: nenhuma
[prévia] /guides/heic-to-jpg-on-windows/ a 1280: 200, H1 "How to convert HEIC to JPG on Windows", 2 arquivos JS no carregamento, 1764955 → 2744933 bytes (heic-06-iphone7-paisagem-gps.jpg), 14 requisições, fora da regra: nenhuma
[prévia] /guides/why-is-my-pdf-so-large/ a 360: 200, H1 "Why is my PDF so large?", 2 arquivos JS no carregamento, 2917866 → 950328 bytes (gen-fotos-compressed.pdf), 17 requisições, fora da regra: nenhuma
[prévia] /guides/why-is-my-pdf-so-large/ a 1280: 200, H1 "Why is my PDF so large?", 2 arquivos JS no carregamento, 2917866 → 950328 bytes (gen-fotos-compressed.pdf), 17 requisições, fora da regra: nenhuma
```

- **Os bytes batem com o JSON:** a HEIC to JPG da prévia deu os mesmos 2.744.933 bytes que a medida gravou para a `heic-06` no Chromium, e o Recomendado da Compress PDF deu os mesmos 950.328 bytes da `gen-fotos.pdf`.
- **"Fora da regra"** é toda requisição que não seja um GET para a própria origem, sem corpo e sem query string (os domínios do Google bloqueados ficam fora da conta).
- **Nos screenshots da sonda** (`.cache/previa/`, fora do repositório), a 360 px o parágrafo acima da ferramenta já fica com o recuo da Oli (§ 206), e o resultado mostra o Baixar e a frase "Oli removed the photo metadata, including the GPS location".

## Decisões novas

- **§ 184 a § 186:** o registro, a view e a ferramenta embutida; a tolerância do `--check`; a regra da ferramenta do guia 6.
- **§ 187 a § 190:** o `gate:seo` (títulos, H1 e canibalização), o `gate:conteudo` e a voz, a regra dos números e o `lint:texto`, e as contagens da busca que mudaram por construção.
- **§ 191 a § 195:** o kit e o teste dele, o GIF com o `gifenc`, a galeria, o Lighthouse do guia e os links dos hubs e das ferramentas.
- **§ 196 a § 207:** as correções da revisão final (a comparação do `--check` por coluna, a amostra e a direção ditas nos textos, os tamanhos oficiais só com as palavras da página, a causa do crescimento no Split, o kit só com o que as provas cobrem, o lugar da Oli no guia e as datas dos guias).
- **§ 208 a § 212:** as correções da segunda passada.

## O que a válvula cortou

Nada. Os 10 guias, o kit, as imagens e o GIF estão na PR, e não há 5c.

## O que é do Victor, em passos

1. O merge é automático. Conferir na PR o merge, o pós-deploy e o `build.txt` (a resposta final da run traz os três).
2. Abrir dois guias no celular e no computador e usar a ferramenta embutida: o `/guides/heic-to-jpg-on-windows/` com uma foto do iPhone e o `/guides/why-is-my-pdf-so-large/` com um PDF pesado.
3. Ler os 10 guias: a linha "Reviewed" e o schema `Article` levam o seu nome (baixo C-6 da revisão). Se algo não for como você diria, vira uma run curta. Depois, no Search Console, pedir a indexação dos três guias do plano: `/guides/heic-to-jpg-on-windows/`, `/guides/why-is-my-pdf-so-large/` e `/guides/social-media-image-sizes/`.
4. Ler o `docs/lancamento/product-hunt.md`:
   - reescrever o primeiro comentário com as próprias palavras (o rascunho é um roteiro de fatos, e a regra do Product Hunt sobre texto gerado por IA está resumida no kit);
   - conferir no dia as contagens e os tamanhos (o `launch-kit.test.ts` reprova se um registro mudar);
   - criar ou conferir a conta no Product Hunt;
   - agendar para a primeira terça depois do merge, às 00:01 do horário do Pacífico (05:01 em Brasília, em novembro);
   - pôr o link do repositório público do motor só se ele estiver no ar.
5. Uma vez por ano, com as fontes das calculadoras: revisar o guia das medidas das redes sociais (as fontes estão no próprio guia, com a data da leitura) e rodar o `pnpm guias:medir` de novo.
6. As pendências que seguem abertas: a 2b (§ 85), os baixos da F4 e da F5a, a § 103, o `docs/F0-SAIDA.md` e os baixos desta run (`REVISAO-F5b.md`).
7. Gerar o prompt da F6. Não há 5c.

## Nota para a F6

- **Os guias ficam em inglês**, como diz o plano. Os de português e espanhol, se vierem, são páginas próprias, com medidas e fontes próprias.
- **Os hubs em português e espanhol** não têm guias de arquivo para listar. O hreflang só liga páginas equivalentes, então um hub em português não aponta para um guia em inglês por hreflang. A seção Guides deles fica de fora até existir o guia no idioma, como a linha do guia nas páginas de ferramenta, que hoje só sai em inglês.
- **O que muda com o idioma na ferramenta embutida:** os textos do painel (`src/tools/<slug>/i18n/`), os nomes das opções, a fala da Oli e o link "Open the … tool". O guia passa a ferramenta com `lang`, então o molde já segue o idioma; a opção inicial do guia 6 não depende de texto.

## Nota para a F8

- **Os guias no service worker:** a página e os 2 arquivos JS são os mesmos da ferramenta, então o cache da ferramenta já serve o guia; falta pôr o HTML dos guias e a imagem de Open Graph na lista do offline.
- **Medir de novo quando um motor muda:** uma mudança em `src/engine/` muda os bytes de saída. O `pnpm guias:medir --check` mostra a diferença, e a regra é rodar o `pnpm guias:medir`, conferir a frase de cada número que mudou e commitar o JSON novo antes de qualquer texto.
