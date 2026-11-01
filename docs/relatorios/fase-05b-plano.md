# F5b · Plano: guias de arquivo em inglês e o kit do Product Hunt

Plano da run `fase-05b`, escrito em 1/nov/2026 depois da exploração (seis lentes Sonnet: checklist, arquitetura, caminhos de medida, fontes oficiais, Product Hunt e CI). Ele é o gabarito da revisão adversarial. A ficha da run é `docs/prompts/prompt-fase-05b.txt`; o que este plano decide e a ficha não diz vira um § do `DECISOES.md` a partir do § 184.

## 1. Os 10 guias

| # | Id da rota (`guides-<slug>`) | Caminho | Ferramenta embutida | Hub | Fixture do spec novo |
| --- | --- | --- | --- | --- | --- |
| 1 | `guides-heic-to-jpg-on-windows` | `/guides/heic-to-jpg-on-windows/` | `heic-to-jpg` | Image tools | `heic-06-iphone7-paisagem-gps.heic` |
| 2 | `guides-why-is-my-pdf-so-large` | `/guides/why-is-my-pdf-so-large/` | `compress-pdf` | PDF tools | `gen-fotos.pdf` |
| 3 | `guides-social-media-image-sizes` | `/guides/social-media-image-sizes/` | `resize-image` (link para o preset do YouTube) | Image tools | `jpg-02-iphone6-paisagem-gps.jpg` |
| 4 | `guides-open-webp-save-as-jpg` | `/guides/open-webp-save-as-jpg/` | `webp-to-jpg` | Image tools | `gen-webp-exif-gps.webp` |
| 5 | `guides-jpg-vs-png` | `/guides/jpg-vs-png/` | `png-to-jpg` | Image tools | `gen-png-transparente.png` |
| 6 | `guides-remove-location-from-photos` | `/guides/remove-location-from-photos/` | a escolhida pela medida (§ 186; esperado: `resize-image` em 100%) | Image tools | `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` |
| 7 | `guides-pdf-to-jpg-resolution` | `/guides/pdf-to-jpg-resolution/` | `pdf-to-jpg` | PDF tools | `gen-paginas-mistas.pdf` |
| 8 | `guides-split-pdf-file-size` | `/guides/split-pdf-file-size/` | `split-pdf` | PDF tools | `gen-paginas-mistas.pdf` |
| 9 | `guides-combine-pdfs-on-phone` | `/guides/combine-pdfs-on-phone/` | `merge-pdf` | PDF tools | `gen-paginas-mistas.pdf` + `gen-acoes.pdf` |
| 10 | `guides-photos-to-one-pdf` | `/guides/photos-to-one-pdf/` | `image-to-pdf` | Image tools | `jpg-02` + `gen-png-transparente.png` |

Títulos começam pelo nome do guia, em Title Case, e o H1 vem em sentence case (§ 122), sem ano. Nenhum dos dois começa pelo H1 da ferramenta (canibalização, teste em `seo-pages`).

## 2. Registro, rotas e view

- **Registro** em `src/tools/guides/registry.ts` (só dados; nunca importado pelo cliente):

  ```ts
  export const FILE_GUIDE_IDS = [/* os 10 ids */] as const;
  export type FileGuideId = (typeof FILE_GUIDE_IDS)[number];
  export interface FileGuideDef {
    id: FileGuideId;
    path: string;                       // '/guides/<slug>/'
    tool: ImageToolId | PdfToolId;      // a ferramenta embutida
    hub: 'image-tools' | 'pdf-tools';
    related: readonly (ImageToolId | ImagePresetId | PdfToolId | FileGuideId)[]; // até 6, que existem
  }
  export const FILE_GUIDES: Record<FileGuideId, FileGuideDef>;
  export function guidesOfTool(tool): FileGuideId[];  // a linha "guia" da página da ferramenta
  ```

  O `GUIDE_IDS` das calculadoras não muda (ele alimenta o `gate:dinheiro-saude` 24 de 24).
- **Rotas:** `fileGuideRoutes()` em `src/i18n/routes.ts`, depois de `pdfRoutes()`, só com `en`, `adArea: 'arquivos'`, `view: 'src/views/FileGuideView.astro'`, textos `src/i18n/{lang}/guide-<slug>.ts` mais os da ferramenta. `FileGuideId` entra no `RouteId`.
- **Página:** `src/pages/guides/<slug>/index.astro`. Guia de imagem: `<FileGuideView id><XxxPage slot="tool" lang="en" embed /></FileGuideView>`. Guia de PDF: `<FileGuideView id />`, e a view põe o `PdfIsland`.
- **Embutir a ferramenta de imagem com 2 arquivos JS:** cada `src/tools/<slug>/<Slug>Page.astro` das ferramentas embutidas ganha `embed?: boolean` e escolhe o molde: `ImageToolPage` (como hoje) ou `src/tools/image/ImageToolEmbed.astro` (só o `#fo-tool-root` com `data-props` e o slot). O `<script>import './mount.ts'</script>` continua no mesmo componente, então a página da ferramenta e o guia carregam a mesma entrada (mesmo nome e hash), mais o chunk `island`. Um `<script>` novo em outro componente criaria um terceiro arquivo nas duas páginas. A saída HTML das páginas de ferramenta não muda.
- **Opções iniciais por propriedade da página:** `ImagePanelData` ganha `initial?` (parcial do estado), aplicado no `useState` do `ImagePanel`. Só o guia 6 usa (Resize em 100%). Nunca pela URL.
- **PDF:** `<PdfIsland data={panelData(tool)} />`, a mesma entrada das 12 páginas.
- **View** `src/views/FileGuideView.astro` (a `GuideView` do dinheiro não muda), na ordem da decisão 4:
  1. breadcrumb Home › Image tools (ou PDF tools) › H1;
  2. `.fo-top.fo-top--calc` com H1, `lead` (a pergunta que o guia responde) e o "Reviewed" (autor, datas e o que mudou), em `src/tools/guides/Reviewed.astro`, sem `data-ymyl`;
  3. introdução;
  4. a ferramenta (H2 + uma linha, `#fo-tool-root`, e o link "Open the <ferramenta> tool");
  5. a primeira metade das seções;
  6. o AdSlot de conteúdo (`area="arquivos"`), só depois da ferramenta;
  7. a segunda metade;
  8. a tabela "What we measured" em `.fo-table-wrap` (§ 129), com data, amostra e método;
  9. as fontes, com link e data da leitura;
  10. as relacionadas (até 6, `ToolCard`);
  11. o AdSlot do trilho.

  Schema `Article` (autor `Person`, `datePublished`, `dateModified`), `BreadcrumbList` e `Person`. `oli={PANEL_POSES}`.
- **Textos:** `src/i18n/en/guide-<slug>.ts`, tipo `FileGuideTexts` (em `src/i18n/types.ts`), com `facts` (fatos oficiais com fonte, usados como `{placeholder}`), `names` (nomes técnicos com algarismo) e `sources` (`id`, rótulo, link e data da leitura). Cartões em `enCommon.fileGuides`.

## 3. As medidas

- **Script:** `scripts/guides/measure.ts` (`pnpm guias:medir`, `--check` refaz e compara, `--only <id>` faz um guia), com as partes em `scripts/guides/lib/`. Grava `data/guides-measured.json`.
- **O JSON:** `script.sha256` (dos arquivos de `scripts/guides/`, com fim de linha normalizado), `commit`, `measuredOn`, os navegadores com versão e o sistema, a tolerância, e por guia: `numbers` (cada um com `value`, `unit`, `sample` com `files` e `count`, `method` com `runner`, `engine` ou `browser` e versão, `date` e `commit`), `rows` (as linhas da tabela) e, no guia 3, as medidas oficiais com a fonte.
- **Caminho de cada medida** (o da pessoa):

  | Guia | Node, mesmo código | Playwright sobre o `dist/` |
  | --- | --- | --- |
  | 1 HEIC | tamanho, dimensões e GPS das entradas (`probe`, `metadataReport`) | a saída da HEIC to JPG (canvas q92), Chromium e WebKit |
  | 2 PDF grande | o que ocupa o espaço (pdf-lib), Lossless e Recommended (`processPdf`) | Strong (PDF.js no canvas), Chromium e WebKit |
  | 3 Redes | — | Resize por tamanho em cada medida oficial, e o preset do YouTube, Chromium e WebKit |
  | 4 WebP | os WebP das fotos (libwebp q75, o codec do motor), metadados das entradas | WebP to JPG, Chromium e WebKit |
  | 5 JPG ou PNG | — | JPG para PNG e de volta, e o PNG transparente, Chromium e WebKit |
  | 6 Localização | GPS, modelo e data das entradas; PSNR (decodificador MozJPEG do Node nas duas imagens) | as candidatas, Chromium e WebKit |
  | 7 PDF to JPG | — | 72, 150 e 300 ppi em JPG e PNG, páginas 1 e 2 dos PDFs reais, Chromium e WebKit |
  | 8 Split | soma das partes e o que cada parte copia (`processPdf`, pdf-lib) | — |
  | 9 Merge | juntado contra a soma, em pares de fixtures | — |
  | 10 Fotos em PDF | — | Image to PDF direto e depois da Compress image, Chromium e WebKit |

- **Tolerância do `--check`** (fixada antes da primeira medida, § 185): Node exato; no navegador, bytes com até 2% de diferença relativa, PSNR com até 0,5 dB, dimensões, contagens e presença de metadado exatas.
- **Teste** `tests/unit/guides-measured.test.ts` (no `verificar`): SHA-256 do script igual ao do JSON; estrutura, data, amostra e método de cada número; todo placeholder de guia existe no JSON ou nos fatos oficiais do guia; e a soma das partes da Split e o Lossless de uma fixture refeitos no Node dão exatamente o JSON.
- **Ordem:** o JSON entra num commit antes de qualquer `guide-<slug>.ts` de arquivo. Prova: `git log --format='%h %s' -- data/guides-measured.json src/i18n/en/guide-*.ts`.

## 4. Os portões e testes que crescem

| O quê | Onde |
| --- | --- |
| Blocos da view e 800 a 1.500 palavras | `checkFileGuide` em `scripts/lib/conteudo.ts`, laço no `gate:conteudo`, controles no `conteudo.test.ts` |
| H1, título, descrição, 60 palavras, 150 por AdSlot, busca e cartões do registro | `scripts/lib/prontidao.ts` (`searchIds`), `prontidao.test.ts` |
| Schema `Article` e título sem ano e sem o H1 da ferramenta | `scripts/lib/seo-pages.ts`, `seo-pages.test.ts`, `gate:seo` |
| Nenhum número à mão | `tests/unit/guides-numbers.test.ts` (controles positivos e negativos) |
| `lint:texto` com os valores medidos | `fillFor` em `scripts/gates/lint-texto.ts`, `lint-texto-money.test.ts` |
| Voz (palavras proibidas, emoji, setas) nos textos dos guias | `routes.test.ts`, `gate:design` (`voicePaths`) |
| 2 arquivos JS, 80 KB, 8 e 3 requisições | lista nova no `budgets.spec.ts` |
| 150 px, nada acima da ferramenta no celular, em repouso e com resultado, a 360 e a 1280 | `ads.spec.ts` |
| Acessibilidade de cada guia, e da ferramenta com resultado | `a11y.spec.ts` |
| Reflow a 320 px, tabela em `.fo-table-wrap` | `design.spec.ts` |
| Ferramenta embutida nos dois navegadores, saída e privacidade | `tests/e2e/tool-guides.spec.ts` (novo) |
| Um guia de imagem e um de PDF | `launch-claims.spec.ts` |
| Lighthouse do guia de entrada mais pesada | `lighthouserc.json` |

Contagens que mudam por construção (busca: 46 para 56 em inglês; sitemap; listas literais de consultas que agora trazem um guia depois das ferramentas) ganham o § 190.

## 5. Hubs, ferramentas, busca e SEO

- `/image-tools/` e `/pdf-tools/`: seção nova `aria-labelledby="guides"` (o id `guide` já é do "qual ferramenta"), uma linha `<li><a>nome</a>: descrição</li>` por guia, sem `fo-tool` (o `checkNothingUnfinished` conta cartões).
- Página de cada ferramenta embutida (só em inglês, § 6): um parágrafo `fo-guide-link` fora de qualquer `data-content`, entre as especificações e as perguntas, longe dos dois AdSlots; teste da distância no `ads.spec.ts`.
- Busca: os 10 entram em `src/pages/search-index.json.ts`, na categoria do hub (imagem ou PDF), com o nome do guia como termo, depois das ferramentas da área.
- OG: `src/pages/og/[lang]/[id].png.ts` com o nome do guia e o ícone da ferramenta, na cor do hub.
- Sitemap e hreflang saem do mapa de rotas (§ 58), e o menu de idioma segue a § 84.

## 6. O kit do Product Hunt

- `docs/lancamento/product-hunt.md` no modelo do `show-hn.md`: "Leia antes de usar"; "Regras que importam" (fontes lidas em 1/nov/2026: quem posta, o dia e a hora, o que é proibido, IA, campos e limites, marca); nome, taglines e descrições com a contagem do script; tópicos; primeiro comentário (roteiro de fatos, o Victor reescreve); perguntas prováveis; imagens com legenda, tamanho e peso; provas; o que ficou fora; checklist do dia.
- Limites lidos: nome 40, tagline 60, descrição 500, até 3 tags, primeiro comentário 5.000, miniatura 240 × 240 (até 2 MB, o mais estrito de duas páginas), galeria 1270 × 760 (abaixo de 3 MB cada). Lançamento às 12:01 AM Pacific Time; em novembro, 5h01 em Brasília.
- Imagens por `pnpm lancamento:imagens` (`scripts/lancamento/imagens.ts`, fora do `verificar`): miniatura PNG, GIF da Oli (`wave` e `cheer`, quadros desenhados pelo resvg a partir dos keyframes do CSS do site, codificados pelo `gifenc`, a única `devDependency` nova) e 5 imagens da galeria com screenshots de estados reais do `dist/` servido, sem o aviso de cookies. Sem marca do Product Hunt.
- Provas: cada afirmação técnica aponta um teste (`launch-claims`, `image-privacy`, `pdf-privacy`, `budgets`). As contagens do produto e as contagens de caracteres são conferidas por `tests/unit/launch-kit.test.ts`, que lê o `.md`.

## 7. O CI

- Antes de cada push com teste novo, o `--list` das 3 partes do Chromium e das 7 do WebKit; o `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes do WebKit (hoje 4 e 5). Projeção da exploração, cenário médio (+57 testes por navegador): maior parte do WebKit em uns 434 s, do Chromium em uns 402 s. Janela: até uns 51 testes novos antes do `design` com os 14 de depois da matriz.
- O spec novo se chama `tool-guides.spec.ts` (cai no fim da lista, antes do `tool.spec.ts`).
- Nada no `.github/`. PR em rascunho só com o `pnpm verificar` local verde.

## 8. Critérios e prova

| Critério | Prova |
| --- | --- |
| 1 Guias com 200, H1, título, descrição e schema | `budgets.spec` (200), `gate:seo`, `gate:conteudo`, Playwright na prévia |
| 2 JSON antes dos textos; teste; `--check` = 0 | `git log`; `guides-measured.test.ts`; saída do `pnpm guias:medir --check` |
| 3 Ferramenta embutida nos dois navegadores | `tool-guides.spec.ts` |
| 4 Checklist, palavras, números, fontes | relatório; `gate:conteudo`; `guides-numbers.test.ts` |
| 5 Orçamento | `budgets.spec.ts`, tabela antes e depois |
| 6 `ads`, `a11y`, reflow, spec novo, `launch-claims` | specs |
| 7 Lighthouse | `pnpm lhci` |
| 8 Portões | `pnpm verificar` |
| 9 Kit | `product-hunt.md`, `launch-kit.test.ts`, `pnpm lancamento:imagens` |
| 10 CI | `gh run view`, `git diff --stat` dos caminhos proibidos |
| 11 `verificar` local | saída completa |
| 12 Dependências | `git diff package.json pnpm-lock.yaml` |
| 13 Prévia | `build.txt` e Playwright com o Google bloqueado |
| 14 Merge e pós-deploy | resposta final |

## 9. Ordem de construção

1. Script de medidas, JSON e teste (um commit).
2. Registro, rotas, view, embed, `initial`, guia 1 com todos os testes.
3. Guias 2 e 3.
4. Guias 4 a 10.
5. Hubs, linha nas ferramentas, busca, OG.
6. Kit: textos, provas, teste das contagens, imagens e GIF.
7. Lighthouse, screenshots, `verificar` limpo, PR em rascunho, revisão adversarial, correções, relatório, `gh pr ready`.

Válvula (ficha): GIF; guias 9 e 10; guias 7 e 8. Nunca se cortam os guias 1 a 3, o script e o teste das medidas, os testes de privacidade, orçamento, anúncio e acessibilidade, os textos do kit com provas, a miniatura, 3 imagens da galeria e a revisão.
