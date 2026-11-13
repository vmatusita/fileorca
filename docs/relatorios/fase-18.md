# F18 · relatório

A última das cinco runs do `PLANO-UX-QV.md` ("Ferramentas novas que passarem na regra"), com a ficha no plano (a ficha da F18) e o prompt em `docs/prompts/prompt-fase-18.txt`; o plano da run está em `docs/relatorios/fase-18-plano.md`. Ponto de partida: `39d1341` (a F17, PR 33). PR: [vmatusita/fileorca#35](https://github.com/vmatusita/fileorca/pull/35), da branch `fase-18`. De `39d1341` a `b09c9f0`: 86 commits (79 sem os de merge), 276 arquivos, +10.972 e −1.923 linhas.

## Resumo

1. **Organizar PDF** (Gerenciar páginas do PDF, Organizar PDF): numa grade só, a pessoa marca páginas, gira, tira e muda de lugar, abre cada uma na lupa e salva um PDF novo.
2. **Remover dados EXIF** (Remover metadados da foto, Quitar metadatos de la foto): tira a localização e os outros metadados de fotos JPG, PNG e WebP sem tocar nos pixels; o guia "How to remove location data from photos" passa a usá-lo.
3. Três presets: **Extrair páginas do PDF** (as páginas marcadas num PDF só), **PDF para PNG** (cada página em PNG, sem a escolha de formato) e **Espelhar imagem** (horizontal ou vertical, sem giro).
4. As 15 páginas (cinco em en, pt e es) estão nos hubs, na busca e nas relacionadas das irmãs; as duas ferramentas também na home, no menu ("11 ferramentas" de imagem, "13" de PDF) e na "Abrir com"; nada sai do aparelho.
5. O Converter para WebP não diz mais que o AVIF sempre demora mais para salvar: no WebKit, a WebP demorou mais (F17 m-1).

## A tabela do topo, a regra e a decisão de cada candidata

Os números foram dados pelo Victor na conversa, célula por célula, entre os valores que o `data/README.md` aceita; os lances ficaram vazios (§ 721). Nada foi estimado nem buscado pela run.

| Candidata | Termo | Tipo | Volume EUA | Lances | Trends EUA, 12 meses | Regra (seção E) | Decisão |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organizar PDF | organize pdf | ferramenta | 10K-100K | vazios | estavel | `10K-100K` ou mais e não `caindo` | **entra** |
| Extrair páginas do PDF | extract pages from pdf | preset do Dividir | 10K-100K | vazios | subindo | `1K-10K` ou mais, não `caindo` e os 4 testes | **entra** |
| PDF para PNG | pdf to png | preset do PDF para JPG | 10K-100K | vazios | estavel | `1K-10K` ou mais, não `caindo` e os 4 testes | **entra** |
| Espelhar imagem | flip image | preset do Girar imagem | 10K-100K | vazios | subindo | `1K-10K` ou mais, não `caindo` e os 4 testes | **entra** |
| Remover dados EXIF | remove exif data | ferramenta | 10K-100K | vazios | subindo | `10K-100K` ou mais e não `caindo` | **entra** |

Os quatro testes da página programática nas três presets: (1) a demanda é a linha `entra`; (2) o comportamento muda a ferramenta (a Extrair com um modo só e uma saída só; a PDF para PNG sem a escolha de formato e com PNG; a Espelhar sem o giro); (3) três blocos de conteúdo ou mais que as irmãs não têm, pelo `gate:conteudo`; (4) a geografia é a dos EUA, a da tabela. Com as cinco `entra`, a run foi a F18 inteira; o caminho curto da decisão 0 não aconteceu.

## O que entrou, por item da ficha

### 1. A tabela, o `keywords.csv` e a linha 15 (fatia 1; § 721 a § 723)

- `data/keywords.csv`: as cinco linhas no fim, fase `F18`, com os números da tabela e `entra` (`a63f058`). `data/README.md`: o `F18` na coluna `fase`, o `preset-pdf` na coluna `tipo`, as duas linhas novas da "Regra da decisão", "sempre, até a F17", e "67 linhas" (§ 723).
- `PLANO-MELHORIAS.md`: a linha 15 da tabela "Mudanças no contrato", com o texto da seção "Mudança no contrato" do `PLANO-UX-QV.md` (uma linha acrescentada, nada mais). O teto do catálogo abriu só para as cinco, e o gatilho do "remover metadados" do backlog deu lugar à regra da seção E (§ 722).
- O `PLANO-FILEORCA.md` não tinha diferença no começo: o F14 m-1 continua aberto, e o arquivo não entrou em commit (§ 722).

### 2. Os nomes, os caminhos, o glossário e a busca (fatia 1 e frentes S e T; § 724)

- Os ids e caminhos da decisão 4, sem mudança, no registro (`src/tools/image/registry.ts`, `src/tools/pdf/registry.ts`), nas rotas (`src/i18n/routes.ts`, `TRANSLATED_PATHS`) e nas 15 páginas de `src/pages/`.
- Os sinônimos da busca nos três idiomas; "organize pdf" e "organizar pdf" saíram do Reorganizar, "pdf to png", "pdf para png" e "pdf a png" saíram do PDF para JPG, e o Delete PDF pages e o Rotate PDF ganharam "delete" e "rotate", para o nome inteiro de cada página achar essa página primeiro (§ 180).
- O glossário (`docs/i18n/pt.md` e `es.md`): as cinco linhas, a "Mirror" de es com "Horizontal · Vertical", as palavras da grade do Organizar; os sufixos `-gerenciado`/`-organizado` e `-extraido`.

### 3. A peça das presets de PDF (fatia 1 e frente P; § 725)

- `PDF_PRESET_IDS`, `PdfPresetId`, `PdfPageId`, `PdfPageDef.parent?`, `presetsOf()`, `toolOf()` e `PDF_PAGES` com as presets; o `pdfRoutes()` com as rotas `/<pai>/<nome>/`; a ilha recebe `base` (a ferramenta) além de `page`; o `MAKES` e o `pdfOriginsOf` com as presets.
- A mesma ilha e a mesma entrada das ferramentas de PDF (`PdfIsland.astro`, `PdfToolPage.astro`), a trilha de quatro passos com o `skipHub` abaixo de 360 px, a tabela das presets na página do pai e no hub de PDF, os portões (`gate:seo`, `gate:prontidao`, `gate:design`, `gate:conteudo` com o `checkPresetPage`) e o `PDF_WALKS` com as presets. Onde a preset de PDF aparece, lido no `dist/`, é igual às presets de imagem (a tabela no § 725).
- O roteiro "Como acrescentar uma preset de PDF" está na seção da F18 do `docs/claude/pdf.md`.

### 4. O Organizar PDF (frente O; § 726, § 727 e § 744)

- **O motor:** `{ kind: 'organize'; pages: { index; turn }[] }` em `src/engine/pdf/types.ts` e `process.ts`, numa passada do `assemble.ts`, com as regras do Excluir sobre links, campos, marcadores e XFA. O Vitest no Node (`tests/unit/pdf-organize.test.ts`, 25 testes) entrou em commits próprios antes da ilha (`83cad5f`, `54be01f`, depois `6fd6dc9`).
- **A grade:** o modo `'organize'` na `PageGrid` e na `PageCell` (`src/tools/pdf/`): a marcação do `'select'`, as setas e o arrastar do `'order'`, a barra de ações ("Girar à direita", "Girar à esquerda", "Tirar"/"Devolver") com `aria-disabled` sem página marcada, a página que sai com o visual do Excluir, o giro na folha, a contagem "{count} marcadas · o PDF novo fica com {left} páginas", e nenhuma tecla que faça duas coisas. A vista (`PageView`) com "Página {n} · posição {p} de {total}", "Girar 90°" e "Tirar esta página" (`aria-pressed`). A ação "Save changes"; a saída `<nome>-organized.pdf`, com o "Ver o PDF novo".
- **O design system:** `docs/design/components/PageGrid/README.md` (novo) e a linha do Organizar no README da `PageView`; nenhum token, nenhuma regra nova; o contraste de cada par novo no § 744.
- **A prova no navegador:** `tests/e2e/island-pdf-organize.spec.ts` (novo, 17 testes por navegador), o `organize-pdf` no `island-pdf-grid.spec.ts`, o axe da vista no `island-pdf-view-axe.spec.ts`, o `case 'organize-pdf'` do `walkPdfTool` e `tests/e2e/ads-organize.spec.ts` (novo).

### 5. A Extrair páginas do PDF (frente P; § 728)

- `src/tools/split-pdf/presets/extract-pages/i18n/{en,pt,es}.ts` e o `ExtractOptions` em `src/tools/pdf/tools.tsx`: o Dividir só no modo `pick`, sem o segmento dos modos, a grade logo de cara, um PDF só na ordem do arquivo, sufixo `extracted`, a contagem do Dividir ("marcadas") e o "Ver o PDF novo".

### 6. A PDF para PNG (frente P; § 729)

- `src/tools/pdf-to-jpg/presets/to-png/i18n/{en,pt,es}.ts` e o `PngOptions`: PNG fixo, sem a escolha de formato, a resolução e as páginas do pai, o resumo "PNG · <resolução>", a saída do pai (um PNG por página, o ZIP com mais de uma).
- As frases de tamanho saíram da medida (246 páginas, as três resoluções, os dois navegadores): num PDF de fotos o PNG soma várias vezes o JPG; num PDF de texto e linhas, entre a metade e o dobro, e pode até ser menor (no WebKit). As frases do pai PDF para JPG que a medida desmentia mudaram nos três idiomas (§ 729 e § 736).

### 7. A Espelhar imagem (frente I; § 730)

- `src/tools/rotate-image/presets/flip/` (o `Panel.tsx`, a `FlipPage.astro`, o `mount.ts`, os textos): Horizontal (o padrão) e Vertical, sem giro. Sem mudar o motor: Horizontal pede `{ kind: 'rotate', turn: 'half', flip: 'vertical' }`, Vertical `{ …, flip: 'horizontal' }`, com o comentário no `Panel.tsx`. O `'none'` no `Turn` não foi preciso (Δ ≤ 0,2 contra o espelho puro).

### 8. O Remover dados EXIF e o guia de localização (frente I; § 731 a § 733 e § 749)

- **O motor:** `{ kind: 'strip' }` em `src/engine/image/types.ts` e `process.ts`, pelo `originalStripped`, sem decodificar e sem o teste de ganho; o `outcome` é o `'new'` de sempre (nenhuma linha da ilha mudou). A prova no Node (`tests/unit/strip-op.test.ts`, 13 casos) veio antes da ilha (`9efb55e`, `c9794ea`, depois `4f3b3be`). O pacote do motor (`scripts/oss/image-engine-template/README.md`) ganhou a operação.
- **A ferramenta:** `src/tools/remove-exif-data/` (o `Panel.tsx`, a `RemoveExifDataPage.astro`, o `mount.ts`, os textos): JPG, PNG e WebP, sem escolha, a frase do card "Done! The location and the other metadata are out of your photo, and the picture did not change.", a WebP animada continua animada.
- **A Orientation:** num JPG girado fica um bloco Exif de uma entrada, só com a Orientation (§ 732); o PNG e a WebP com Orientation no Exif ficam no F18 m-1.
- **A correção da revisão:** o `stripJpeg` tirava a miniatura de dentro do Exif, mas guardava a de um APP0 JFIF; agora o JFIF fica só com o cabeçalho (§ 749, `2c213cb`). Nenhuma fixture tinha essa miniatura: as 11 legíveis saem com os mesmos bytes de antes.
- **O guia:** `guides-remove-location-from-photos` embute o Remover dados EXIF nos três idiomas; o `pnpm guias:medir` refeito inteiro (nenhum número dos outros nove guias mudou), o empate com o Redimensionar a 100 % vai para a ferramenta sem opção a ajustar, e as datas dos guias e a linha do histórico dizem a verdade (§ 733).

### 9. O `next`, o `related` e o chip que leva (frente S; § 734)

- As cinco com chips e relacionadas que existem nos três idiomas; as irmãs ganham a página nova no lugar do último cartão que os próprios chips já mostram (a lista de cada troca está no § 734). O Organizar é o 4º chip do Juntar e a Extrair o 4º do Desbloquear, como destinos com ação (os `PAIRS` de 29 para 37). Nenhum chip leva ao Remover dados EXIF (toda ferramenta de imagem já entrega sem metadados). `tests/unit/registry-lists.test.ts` (novo, 5 testes).

### 10. Os ícones (frente S; § 735)

- `page-grid` e `pin-x`, dois desenhos novos em `docs/design/assets/Icons/`, no `ICON_NAMES`, no README dos ícones (76) e no `icons.test.ts`; o `hub-icons.test.ts` com o teste dos dois. As presets usam o ícone do pai.

### 11. Os textos, as contagens e as frases desmentidas (frente T e junção; § 736)

- Os textos de pt e es das cinco páginas, dos cartões, dos hubs e das tabelas das presets, pelo glossário; os hubs de imagem dizem "eleven", "onze", "once"; os comentários que contam; as frases desmentidas do Girar imagem (o espelho sozinho está na Espelhar), do guia de localização e do PDF para JPG; o link da home "All image tools and ready-made settings". A tabela dos três idiomas lado a lado está no § 736.

### 12. O lugar no site e o GA4 (frente S; § 737)

- Nenhum leitor do registro mudou de código para as ferramentas: o hub, a home, o rodapé, o menu, a busca, a OG, o sitemap, o hreflang, o schema e a "Abrir com" pegam as páginas sozinhos (zero diferenças contra uma irmã do mesmo tipo, `.cache/f18/fronts/S/places.json`). O `accept` do manifest não mudou. Os cinco ids nas listas fechadas `IMAGE_EVENT_TOOLS` e `PDF_EVENT_TOOLS`, e dois valores novos do `outcome` que já existe, `organized` e `cleaned`; nenhum evento nem parâmetro novo.

### 13. As matrizes (frentes P, O e I; § 738)

- `tests/e2e/image-matrix.spec.ts` e `tests/e2e/lib/matrix.ts`: a Espelhar (4 lotes por navegador) e o Remover dados EXIF (2 lotes), com a GIF feita no teste e a conferência nova dos bytes da imagem e dos pixels decodificados. `tests/e2e/pdf-matrix.spec.ts`: o bloco do Organizar e o das presets. O `scripts/fixtures/pdf-matrix-table.ts` ganhou tabelas com nome (`--table`, `--out`); a tabela da F5a não mudou.

### 14. O F17 m-1 (frente I e fechamento; § 739)

- `tests/e2e/image-webp-speed.spec.ts` (novo), irmão do `image-avif-speed.spec.ts`; pelas três rodadas da máquina, a frase "AVIF takes longer to save than WebP" saiu da linha "Speed" e do FAQ do Converter para WebP nos três idiomas (`8a1d1c1`).

### 15. O kit de lançamento (§ 740)

- `docs/lancamento/`: as contagens 11 · 4 · 13 no `product-hunt.md` (o primeiro comentário de 1.586 para 1.648 caracteres, com as páginas novas nas listas), o `show-hn.md`, o `alternativeto.md` (748 → 785 caracteres), o `diretorios.md` e o `README.md`. A galeria não foi regerada: nenhuma imagem mostra uma contagem ou uma grade que mudou.

### 16. O orçamento, os anúncios, o CLS, o axe e o Lighthouse (frente E e fechamento; § 741 e § 742)

- As listas fixas dos specs (`budgets`, `i18n-budgets`, `ads`, `fo-ad-map`, `layout-shift`, `tool-slot`, `a11y`, `tool-i18n`, `share-target`, `cookie-notice`, `navigation`, `footer-phone`, `tool-320`, `pdf-merge`) e os blocos F18 do `layout-shift`, do `a11y` e do `events`.

### Os documentos e as pendências

- `DECISOES.md`: § 721 a § 749 (752 linhas acrescentadas, nenhuma apagada).
- `docs/claude/`: uma seção F18 no fim do `pdf.md`, do `imagem.md`, do `idiomas.md`, do `design-e-oli.md`, do `playwright.md`, do `ci.md` e do `windows-git-bash.md` (só acréscimos).
- `docs/PENDENCIAS.md`: o grupo 28, "O que a F18 deixou" (F18 m-1, a Orientation do PNG e da WebP no `strip`; F18 m-2, o WebKit em 17 partes depois da PR 34); o F17 m-1 e o "F9 comentário guias" em "Já corrigidos"; o F14 m-1 continua aberto. O total fica em 190 linhas.

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | Cada preset nova nos quatro testes da página programática, e cada ferramenta nova no `gate:conteudo` | testes 1 e 4: § 721 e o `keywords.csv`; teste 2: `pdf-presets.spec.ts` (Extrair e PDF para PNG, 5 testes por navegador), a matriz e o `image-tool-ops.test.ts` (Espelhar); teste 3 e as ferramentas: o `gate:conteudo` com o `checkPresetPage` | passa: "conteúdo: ok, 45 página(s) de ferramenta e de preset, 55 de calculadora, 48 de PDF (as ferramentas, as presets e o hub), 30 guia(s) de arquivo…". Controles: no código da fatia 1 o teste 2 reprova nos dois navegadores com "Locator: locator('#fo-tool-root').locator('input[name=\"fo-split-mode\"]') · Expected: 0 · Received: 3" (Extrair) e "…input[name=\"fo-images-format\"] · Expected: 0 · Received: 2" (PNG); a Espelhar com o mapeamento ingênuo reprova com "jpg-01-pixel2-retrato-gps.jpg: mean difference to the upright picture … Expected: < 6, Received: 79.54154155815966"; sem o `checkPresetPage`, "fails when a PDF preset repeats its parent…" reprova (a preset igual ao pai passava) |
| 2 | A matriz com cada fixture que cada página aceita, nos dois navegadores | `image-matrix.spec.ts` e `image-presets.spec.ts` numa execução (74 de 74, 2,0 min); os casos da F18 do `pdf-matrix.spec.ts` (20 de 20, 57,1 s); `matrix-table.test.ts` e `pdf-matrix-table.test.ts` reprovam lacuna | as tabelas em `docs/relatorios/fase-18-matriz.md` e `fase-18-matriz-pdf.md`; a cobertura de PDF completa (Organizar 10 de 10, Extrair 10 de 10, PNG 11 de 11, todas com linha `ok` nos dois navegadores). Controle por mutação: a tabela sem a `pdf-to-jpg-to-png` reprova "gives every tool and preset of the registry exactly one table" (`expected [ 'add-page-numbers-to-pdf', …(13) ] to deeply equal [ 'add-page-numbers-to-pdf', …(14) ]`) |
| 3 | O Remover dados EXIF prova no Node, sobre as fixtures com GPS, a saída sem GPS, XMP nem Exif além da Orientation, e os mesmos pixels | `tests/unit/strip-op.test.ts` (13 casos), com o `metadataReport`, o `orientationOnly` e o `imageBytes` dos testes, nunca os do motor; a matriz com o `pixelHash` | passa (a tabela da prova abaixo). Controle: contra o motor do ponto de partida, 10 de 13 reprovam com "Error: expected a result, got {\"ok\":false,\"reason\":\"decode\",\"source\":\"jpeg\"}" (e `webp`, `png`, e `load` na de 16,8 MP) |
| 4 | `gate:seo`, `gate:links`, `gate:conteudo` e `launch-kit.test.ts` verdes | os portões e o Vitest (na lente b da revisão, no `31b9770`, e no `verificar`) | "seo: ok, 223 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps"; "links: ok, 17240 links internos em 232 páginas, nenhuma órfã, 1006 links para uma parte de página, todos com o id"; o `gate:conteudo` acima; o `launch-kit.test.ts` com 10 testes. Controle: com os registros da fatia 1 (11 · 13) e o kit antigo, "equal the registries, in every phrase and in the counts line" reprova com `expected [ …(15) ] to deeply equal []` |
| 5 | O orçamento como o das irmãs | `budgets.spec.ts` (o "igual à irmã, requisição a requisição") e `i18n-budgets.spec.ts`; os JS de cada página contra o `dist-base`; o grupo `island` e a entrada da ilha de PDF | 2 arquivos e 6 requisições no Chromium (7 no WebKit) em cada página nova, como a irmã; 28,1 a 54,0 KB, abaixo de 80 KB; ilhas +44 B e +1.110 B, abaixo de +2.048 B. Controle no `dist-base`: os 18 testes novos reprovam ("Error: /organize-pdf/ existe · Expected: 200 · Received: 404") |
| 6 | A densidade de anúncio em até 30 % | `ads.spec.ts`, `fo-ad-map.spec.ts`, `ads-coffee.spec.ts` e `ads-organize.spec.ts` no build de teste | de 14,1 % a 16,9 % a 360 × 740; o Organizar com a vista aberta 12,0 a 12,4 %; 412 de 412 nos dois navegadores. Controle: o mapa de rotas do ponto de partida dá "AD_PAGES do ponto de partida: 190 (o teste pede 205)" |
| 7 | O `pnpm verificar` verde | `pnpm verificar --partes` no commit final | as 25 partes passaram no `b09c9f0` em 13/nov/2026, soma de 3.575,7 s, nenhuma acima de 900 s (seção "O `pnpm verificar --partes`") |

E os critérios do prompt:

- **1. A tabela e a regra:** as cinco decisões no plano (seção 1), no § 721 e no `keywords.csv`, com os números da tabela.
- **3. O "Dentro":** a linha 15 e o § 722; o Organizar com a operação testada no Node antes da ilha (§ 726); a peça das presets de PDF (§ 725). A válvula não cortou nada.
- **4. Nada do "Fora":** `git diff --stat 39d1341 -- fixtures lighthouserc.json .github .githooks .claude/settings.json PLANO-FILEORCA.md PLANO-UX-QV.md CLAUDE.md docs/relatorios/fase-02-matriz.md docs/relatorios/fase-05a-matriz.md docs/relatorios/fase-17-matriz.md package.json pnpm-lock.yaml src/sw src/calc src/tools/calc` não lista nenhum arquivo. O motor mudou só nas duas operações e na miniatura do JFIF (§ 749, pela regra do "Fora": um Vitest que reprova sem a correção e um §): `src/engine/image/{process,strip,types}.ts` e `src/engine/pdf/{process,types}.ts`. O `clearance.spec.ts` mudou só na linha do `GUIDE_ON_SCREEN` (§ 743, item 37); as presets de PDF entram nele pelo `PDF_WALKS`, sem teste escrito à mão (§ 742). O `DECISOES.md` e o `docs/claude/` só ganharam linhas. Nenhuma dependência, chave de armazenamento, evento ou parâmetro novo.
- **5. Nada sai do aparelho:** o `image-privacy.spec.ts` (com os casos de sentinela do Remover dados EXIF e da Espelhar), o `pdf-privacy.spec.ts` (o Organizar, a Extrair e a PDF para PNG em `TOOLS` e `DRAWS`), o `launch-claims.spec.ts` (as cinco páginas) e o `events.spec.ts` (um teste por página nova, nada do arquivo no `dataLayer`) passam nos dois navegadores; os casos novos reprovam no `dist-base` (404).
- **6. Os textos:** o `lint:texto` com 75 arquivos, 5.303 textos e **0 erro de gramática** (1.705 avisos, siglas e "app", como no resto do site); o `english-leak`, o `glossary`, o `claude-md` e o `pendencias` passam (o `english-leak` e o `glossary` reprovavam na fatia 1 pelos placeholders: "200 frase(s) em inglês nas páginas em pt").
- **7. O Lighthouse, o axe e o CLS:** 99 ou 100 de desempenho e 100 nas outras categorias nas 15 páginas; o axe sem violação nos dois temas e navegadores, com o resultado, a recusa, a barra e a vista do Organizar; o CLS sem gesto 0,000 nas 15 páginas (§ 742).
- **8. Os documentos:** o `data/README.md` (§ 723), o kit (§ 740), o `docs/design/` (§ 735 e § 744), o `docs/claude/` e o `docs/PENDENCIAS.md`.
- **9. Os testes antigos que mudaram:** no § 743, um por um; nenhum teste foi pulado, desligado ou afrouxado.
- **10. O `verificar --partes` e o CI:** o `pnpm verificar --partes` passou nas 25 partes no `b09c9f0` (seção abaixo); a execução completa final do CI vai na descrição da PR, depois do `gh pr ready`.
- **11. A revisão:** em `docs/relatorios/REVISAO-F18.md` (§ 748), sem achado alto, médio ou baixo aberto.

## As tabelas

### As matrizes

O resumo por página e navegador; as células de cada fixture estão em `docs/relatorios/fase-18-matriz.md` (imagem, 360 linhas, `88bf435`) e `docs/relatorios/fase-18-matriz-pdf.md` (PDF, 92 linhas, `a43db84`). Nenhuma requisição saiu de `127.0.0.1`.

**Imagem** (`image-matrix.spec.ts` e `image-presets.spec.ts` inteiros, uma execução, 74 de 74):

| Teste | Opções | Arquivos | Saídas | Recusados | Chromium | WebKit |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `remove-exif-data-photos` | sem escolha | 6 | 3 | 3 | 1,8 s | 3,7 s |
| `remove-exif-data-rest` | sem escolha | 11 | 7 | 4 | 1,4 s | 4,0 s |
| `rotate-image-flip-photos` | Horizontal (padrão) | 6 | 3 | 3 | 2,3 s | 3,8 s |
| `rotate-image-flip-rest` | Horizontal (padrão) | 11 | 7 | 4 | 3,8 s | 6,0 s |
| `rotate-image-flip-vertical-photos` | Vertical | 6 | 3 | 3 | 2,4 s | 4,0 s |
| `rotate-image-flip-vertical-rest` | Vertical | 11 | 7 | 4 | 3,8 s | 6,1 s |
| os 22 lotes das outras ferramentas | | | | | 0,6 a 5,6 s | 1,4 a 6,6 s |

- **Remover dados EXIF:** as 10 fixtures que aceita com "mesmos bytes da imagem; mesmos pixels decodificados" nos dois navegadores, "só a tag Orientation" nos três JPG girados, "transparência mantida" no PNG e "animação mantida" na WebP animada; recusados o HEIC e o AVIF (com o link ao conversor), a GIF feita no teste, o corrompido, o truncado, o vazio e o texto.
- **Espelhar:** as 10 fixtures nas duas opções, o espelho certo pelos pixels contra a foto em pé espelhada (Δ de 0,0 a 0,2, limite 6) e nunca o outro espelho nem um giro; as mesmas recusas.
- O maior lote do WebKit (6,6 s, o do Converter para WebP) fica longe dos 60 s da § 88.

**PDF** (os casos da F18 do `pdf-matrix.spec.ts`, uma execução, 20 de 20 em 57,1 s):

| Caso | Página | Chromium | WebKit |
| --- | --- | --- | --- |
| `organize-small` | Organizar PDF | 7 ok · 4 recusadas | 7 ok · 4 recusadas |
| `organize-300`, `organize-117`, `organize-nasa` | Organizar PDF | 1 ok cada | 1 ok cada |
| `extract-small` | Extrair páginas do PDF | 7 ok · 6 recusadas | 7 ok · 6 recusadas |
| `extract-300`, `extract-117`, `extract-nasa` | Extrair páginas do PDF | 1 ok cada | 1 ok cada |
| `png-small` (150 ppi) | PDF para PNG | 8 ok · 5 recusadas | 8 ok · 5 recusadas |
| `png-big` (300 ppi, `1-2, 117`) | PDF para PNG | 3 ok | 3 ok |

O Organizar com o plano da decisão 6 (a página 2 um lugar antes, as páginas 1 e N giradas, a 3 fora), conferido no Node pela contagem, pela ordem, pelo `/Rotate` e pelo `qpdf --check`; a Extrair com páginas fora de ordem e repetidas, na ordem do arquivo; a PDF para PNG pelas dimensões da resolução, pelo PNG nos bytes e pela razão PNG/JPG de cada PDF (acima de 3 nas fotos; entre 0,4 e 2 nos de texto). As recusas (vazio, cortado, imagem e texto com nome `.pdf`, com senha) com a fala e o link para a Unlock PDF.

### A prova do Remover dados EXIF

Por fixture, os metadados antes e depois (só o tipo e o número de entradas do Exif, nunca um valor), contados no Node sobre as fixtures, antes e depois do `stripMetadata` (o caminho do `{ kind: 'strip' }`, § 731). Os bytes da imagem iguais vêm do `strip-op.test.ts` (o `imageBytes`: no JPG, do SOI ao EOI sem os APPn e COM; no PNG, o `IHDR` e os `IDAT`; na WebP, o `VP8`/`VP8L`/`ALPH`/`ANMF`) e da matriz (os mesmos bytes e os mesmos pixels decodificados, nos dois navegadores).

A contagem saiu de um script só de leitura, `.cache/f18/meta-kinds.ts` (fora do Git), que imprime só tipos e números de entradas.

| Fixture | Antes | Depois | Bytes do arquivo | Bytes da imagem |
| --- | --- | --- | --- | --- |
| `jpg-01-pixel2-retrato-gps.jpg` | Exif com 71 entradas (13 no IFD0, 38 no Exif, 11 de GPS, 9 da miniatura); JFIF; perfil de cor | JFIF; perfil de cor; nenhum Exif | 4.360.452 → 4.321.186 | iguais |
| `jpg-02-iphone6-paisagem-gps.jpg` | Exif com 64 entradas (11, 33, 14 de GPS, 6 da miniatura) | nada | 2.590.700 → 2.570.220 | iguais |
| `jpg-03-iphone5-paisagem-orientacao3-gps.jpg` | Exif com 50 entradas (11, 24, 9 de GPS, 6 da miniatura) | Exif com 1 entrada, a Orientation (3, a mesma) | 2.366.947 → 2.350.599 | iguais |
| `gen-jpg-01-orientacao6.jpg` | Exif com 71 entradas (13, 38, 11 de GPS, 9 da miniatura); JFIF; perfil de cor | Exif com 1 entrada, a Orientation (6); JFIF; perfil de cor | 443.889 → 404.659 | iguais |
| `gen-jpg-02-orientacao8.jpg` | Exif com 64 entradas (11, 33, 14 de GPS, 6 da miniatura); JFIF; perfil de cor | Exif com 1 entrada, a Orientation (8); JFIF; perfil de cor | 417.455 → 397.011 | iguais |
| `gen-webp-exif-gps.webp` | chunk EXIF com 64 entradas (11, 33, 14 de GPS, 6 da miniatura) | nada | 262.648 → 242.170 | iguais |
| PNG montado no teste (a `gen-png-transparente.png` com quatro chunks) | `eXIf` com 50 entradas (9 de GPS, a Orientation 3), `tEXt`, `iTXt` (XMP), `zTXt` | nada | menor | iguais (`IHDR` e `IDAT`) |
| `gen-webp-animada.webp` | nada | nada (2 quadros, animada) | 7.186, idêntico | iguais |
| `gen-png-transparente.png`, `gen-png-extensao-jpg.jpg` | nada | nada | 1.096.229 e 772.738, idênticos | iguais |
| `gen-grande-4100x4100.jpg` (16,8 MP) | JFIF; perfil de cor | JFIF; perfil de cor | 194.818, idêntico | iguais |

Em todas as saídas: nenhum GPS de nenhum tipo, nenhum XMP, IPTC ou texto de PNG (`metadataReport`), e o perfil de cor igual ao da entrada. A Orientation fica só nos três JPG girados, sozinha no bloco (`orientationOnly`), e a foto aparece em pé como aparecia (§ 732). O `stripMetadata` de antes e o de depois da § 749 dão os mesmos bytes nas 11 fixtures legíveis (`.cache/f18/fronts/review-fixes/strip-old-vs-new.txt`).

### As contagens

Medidas no `dist-base` (`.cache/f18/antes/site.json`) e no `dist/` da frente S (`.cache/f18/fronts/S/site-after.json`) pelo mesmo script (`.cache/f18/measure-site.mjs`); os textos dos hubs de pt e es depois são os finais da frente T (`src/i18n/{pt,es}/image-tools.ts`), que a frente S mediu antes de eles entrarem.

| Lugar | en antes → depois | pt antes → depois | es antes → depois |
| --- | --- | --- | --- |
| H1 da home | 48 tools. 0 uploads. → **50** | 31 ferramentas. 0 uploads. → **33** | 37 herramientas. 0 subidas. → **39** |
| Título do hub de imagem | Image tools: ten free tools, no upload → **eleven** | Ferramentas de imagem: dez ferramentas grátis, sem upload → **onze** | Herramientas de imagen: diez gratis, sin subir archivos → **once** |
| H1 do hub de imagem | Ten image tools, zero uploads → **Eleven** | Dez ferramentas de imagem, sem upload → **Onze** | Diez herramientas de imagen, sin subir nada → **Once** |
| Descrição e introdução do hub de imagem | "Ten…" → "**Eleven** free image tools…", com "clean images" | "Dez…" → "**Onze** ferramentas…", com "tire os metadados delas" | "Diez…" → "**Once** herramientas…", com "quítales los metadatos" |
| Cartões do hub de imagem | 10 → **11** | 10 → **11** | 10 → **11** |
| Cartões do hub de PDF (o hub não conta por extenso) | 13 → **14** | 13 → **14** | 13 → **14** |
| Cartões da home | 40 → **42** | 31 → **33** | 29 → **31** |
| Rodapé (resumo e links) | All 10 image tools → All **11** (10 → 11 links) | Todas as 10 → Todas as **11** | Las 10 → Las **11** |
| Menu | Image tools, 10 → **11** tools; PDF tools, 12 → **13** tools | 10 → **11**; 12 → **13** ferramentas | 10 → **11**; 12 → **13** herramientas |
| Cartão "FileOrca em números" da Sobre | 10 · 12 · 14 · 11 → **11 · 13** · 14 · 11 | 10 · 12 · 8 · 3 → **11 · 13** · 8 · 3 | 10 · 12 · 14 · 3 → **11 · 13** · 14 · 3 |
| "Abrir com" | 22 → **24** cartões | 22 → **24** | 22 → **24** |
| `accept` do manifest | 15 entradas, **sem mudança** | 15, sem mudança | 15, sem mudança |
| Índice da busca | 78 → **83** entradas (os três idiomas) | | |
| Kit (`product-hunt.md`) | "10 image tools", "3 presets", "12 PDF tools" → **11**, **4**, **13** (a nota do item 4, as Descrições A e B, o primeiro comentário, a prova 6 e a linha das contagens) | — | — |

As presets não entram no H1 da home (F13b). A busca pelos sinônimos da decisão 4, antes → depois (o índice junta os termos dos três idiomas):

| Busca | Antes | Depois |
| --- | --- | --- |
| exif, gps, location | o guia de localização | Remover dados EXIF, o guia |
| metadata, metadados, metadatos | nada | Remover dados EXIF |
| organize | Reorganizar | Organizar PDF |
| rearrange | Reorganizar | Organizar PDF, Reorganizar |
| extract, extrair, extraer | Dividir PDF | Dividir PDF, Extrair páginas |
| flip | Girar imagem, Girar PDF | Girar imagem, Espelhar, Girar PDF |
| mirror, espelhar, reflejar | Girar imagem | Girar imagem, Espelhar |
| png | 11 páginas | 14 (mais o Remover dados EXIF, a Espelhar e a PDF para PNG) |

O nome inteiro de cada página nova a acha primeiro, em cada idioma ("pdf to png", "extrair páginas do pdf", "espelhar imagem", "gerenciar páginas", "quitar metadatos"), e "delete" e "rotate" acham o Delete PDF pages e o Rotate PDF antes do Organizar (`routes.test.ts`, § 724).

### O orçamento

| Página | JS inicial com gzip | Arquivos JS | Requisições (Chromium / WebKit) | Irmã | JS da irmã |
| --- | ---: | ---: | ---: | --- | ---: |
| `/remove-exif-data/` | 28,1 e 29,8 KB | 2 | 6 / 7 | `/webp-to-jpg/` | 28,2 e 29,9 KB |
| `/rotate-image/flip/` | 28,2 e 29,9 KB | 2 | 6 / 7 | `/rotate-image/` | 28,3 e 30,0 KB |
| `/organize-pdf/` | 52,1 e 53,8 KB | 2 | 6 / 7 | `/reorder-pdf-pages/` | 52,1 e 53,8 KB |
| `/split-pdf/extract-pages/` | 52,1 e 53,8 KB | 2 | 6 / 7 | `/split-pdf/` | 52,1 e 53,8 KB |
| `/pdf-to-jpg/to-png/` | 52,3 e 54,0 KB | 2 | 6 / 7 | `/pdf-to-jpg/` | 52,3 e 54,0 KB |

As duas medidas de cada página são a do teste de orçamento e a do "igual à irmã" (o `dist/` da junção, `92184bc`). As de pt e es dão os mesmos números e carregam os mesmos arquivos da de en, nome e hash.

- **Os arquivos novos de `dist/_astro/`** (68 → 70 JS): `FlipPage.astro_astro_type_script_index_0_lang.*.js` (508 B, 323 B com gzip) e `RemoveExifDataPage.astro_astro_type_script_index_0_lang.*.js` (263 B, 219 B com gzip). O Organizar e as presets de PDF não somam arquivo: usam a entrada da ilha de PDF.
- **As ilhas, com gzip nível 9** (`.cache/f18/island-size.mjs`): o grupo `island` de imagem de 23.288 B para **23.332 B** (+44 B, da fatia 1); a entrada da ilha de PDF de 23.803 B para **24.913 B** (+1.110 B: o modo `'organize'`, a barra, as duas ações da vista e as opções das presets); o `pdf-client`, 514 B, sem mudança. Os dois dentro do teto de +2.048 B.
- **As outras páginas** (`.cache/f18/compare-js.json`): das 214 do ponto de partida, 211 carregam exatamente os mesmos arquivos JS; as 3 outras são o guia de localização em en, pt e es, que trocou a entrada do `ResizeImagePage` pela do `RemoveExifDataPage` (a decisão 10), com os mesmos 2 arquivos.
- O `gate:licencas` com os mesmos pacotes (o `package.json` e o `pnpm-lock.yaml` sem diff).

### Os anúncios

No build de teste com os ids de anúncio, nos dois navegadores (`ads.spec.ts`, `fo-ad-map.spec.ts` com 190 → 205 páginas, `ads-coffee.spec.ts`: 412 de 412):

| Página (en, pt, es) | Caixas a 360 | Densidade a 360 × 740 (Chromium \| WebKit) | a 768 | Menor vão a 360 | Menor vão a 1280 |
| --- | ---: | --- | ---: | --- | ---: |
| Remover dados EXIF | 2 | 16,0–16,2 % \| 16,4–16,5 % | 24,2 % | 476 a 477 px | 150 px |
| Espelhar imagem | 2 | 16,6–16,7 % \| 16,9 % | 24,6 % | 446 a 447 px (en), 472 a 473 px (pt, es) | 150 px |
| Organizar PDF | 2 | 14,1 % \| 14,2 % | 22,7 % | 688 a 690 px (com a barra e a vista) | 150 px |
| Extrair páginas do PDF | 2 | 15,5 % \| 15,7 % | 24,2–24,4 % | 640 a 668 px (repouso, leitura, grade, grade marcada, resultado) | 150 px |
| PDF para PNG | 2 | 15,3–15,4 % | 23,1–23,2 % | 472 a 529 px (repouso, leitura, resultado) | 150 px |

- O Organizar com a barra e a vista aberta (`ads-organize.spec.ts`, 6 de 6): densidade de 10,4 % com a grade e de 12,0 a 12,4 % com a vista; a barra a 2.073 px a 360 e o menor vão de 150 px a 1280.
- O 1º anúncio depois do "Como usar", nada acima da ferramenta no celular, 1.110 px ou mais entre dois anúncios de conteúdo (de 1.637 a 2.305 px). A 4ª ficha do Juntar e do Desbloquear não mexeu nos vãos (18 de 18).

### O Lighthouse das 15 páginas (celular, três execuções, a representativa)

Com uma configuração temporária em `.cache/f18/lhci/`, sobre o `dist/` do `21a2954`; o `lighthouserc.json` não mudou.

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | CLS | LCP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/organize-pdf/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/split-pdf/extract-pages/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/pdf-to-jpg/to-png/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/rotate-image/flip/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/remove-exif-data/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/pt/gerenciar-paginas-pdf/` | 99 | 100 | 100 | 100 | 0,000 | 1,97 s |
| `/pt/dividir-pdf/extrair-paginas/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/pt/pdf-para-jpg/para-png/` | 99 | 100 | 100 | 100 | 0,000 | 1,97 s |
| `/pt/girar-imagem/espelhar/` | 100 | 100 | 100 | 100 | 0,000 | 1,73 s |
| `/pt/remover-metadados-foto/` | 99 | 100 | 100 | 100 | 0,000 | 1,97 s |
| `/es/organizar-pdf/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/es/dividir-pdf/extraer-paginas/` | 99 | 100 | 100 | 100 | 0,000 | 1,96 s |
| `/es/pdf-a-jpg/a-png/` | 99 | 100 | 100 | 100 | 0,000 | 1,95 s |
| `/es/rotar-imagen/reflejar/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/es/quitar-metadatos-foto/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |

### O F17 m-1: a WebP e o AVIF de 12 MP (`jpg-01-pixel2-retrato-gps.jpg`, 3024 × 4032, no Converter para WebP)

Na máquina livre, `--workers=1`, os dois specs juntos nos dois navegadores, sobre o `dist/` do `21a2954` (`.cache/f18/speed-round-1.log` a `speed-round-3.log`; 12 de 12 passaram), em segundos:

| Onde | WebP, Chromium | AVIF, Chromium | WebP, WebKit | AVIF, WebKit |
| --- | ---: | ---: | ---: | ---: |
| Máquina, rodada 1 | 0,9 | 1,4 | 2,0 | 1,7 |
| Máquina, rodada 2 | 0,9 | 1,4 | 1,9 | 1,6 |
| Máquina, rodada 3 | 0,9 | 1,4 | 1,8 | 1,5 |
| Runner, F17 (§ 720, a execução completa da PR 34) | não medido | 2,0 | não medido | 4,9 |
| Runner, execução final da F18 | virá da execução final, na descrição da PR | virá da execução final, na descrição da PR | virá da execução final, na descrição da PR | virá da execução final, na descrição da PR |

No Chromium a WebP sai mais rápido nas três rodadas; no WebKit, o AVIF sai mais rápido nas três. A frase "AVIF takes longer to save than WebP" era falsa no WebKit, então saiu nos três idiomas sem esperar o runner (§ 739): a linha "Speed" diz "A bigger photo takes longer to save, in both formats. Which of the two saves faster depends on the browser.", e o FAQ não fala mais de velocidade. Os números do runner vão para a descrição da PR só como registro.

### Os ícones

| Ferramenta | Ícone | Desenho | Onde aparece |
| --- | --- | --- | --- |
| Organizar PDF | `page-grid` | quatro páginas numa grade 2 × 2, a última virada 20° | cartão no hub de PDF e nas homes dos três idiomas, "Abrir com", relacionadas do Reorganizar, do Excluir, do Girar PDF, do Juntar e da Extrair, 4º chip do Juntar, OG, busca |
| Remover dados EXIF | `pin-x` | o alfinete de localização com o ponto e um × ao lado | cartão no hub de imagem e nas homes, "Abrir com", relacionadas do Comprimir, do Redimensionar e do HEIC para JPG, OG, busca |
| Extrair páginas, PDF para PNG, Espelhar | `split`, `image`, `rotate` | os dos pais | os lugares das presets (tabela das presets, busca, OG) |

Nenhum dos 26 ícones do conjunto que não estavam em cartão servia pelo sentido (§ 735). Os dois na grade de 24 px, traço 2, sem cor por dentro; o contraste do traço é de 6,94:1 no cartão de imagem e 6,16:1 no de PDF, nos dois temas. O conjunto vai de 74 a 76.

## Os testes

- **Vitest:** 137 arquivos e 2.159 testes no ponto de partida; 140 arquivos e 2.224 testes no `8a1d1c1` (os três arquivos novos: `pdf-organize.test.ts`, `strip-op.test.ts` e `registry-lists.test.ts`). As correções da revisão somaram testes ao `strip.test.ts`; o número final: 140 arquivos e 2.229 testes, todos verdes, no `verificar --partes` do `b09c9f0`.
- **Playwright `--list`:** 2.470 testes por navegador em 85 arquivos no ponto de partida; 2.684 em 89 no `8a1d1c1` (os quatro arquivos novos: `island-pdf-organize.spec.ts`, `ads-organize.spec.ts`, `pdf-presets.spec.ts` e `image-webp-speed.spec.ts`). As correções da revisão somaram casos ao `launch-claims`, ao `pdf-privacy` e ao `image-privacy`; o número final: 2.695 testes por navegador em 89 arquivos, no `b09c9f0`.
- **A junção** (o `dist/` do `356f0b0`, as seis frentes; 38 specs nos dois navegadores, `--workers=3`, 51,6 min; `.cache/f18/junction-specs.log`): **3.659 passaram**, 6 foram pulados e 5 reprovaram, por três causas que nenhuma frente via sozinha: o CLS da PDF para PNG (a linha do formato com duas linhas na fonte de reserva; corrigida no texto, `c5fb475`), o aviso de cookies sobre o Escolher da Extrair em es (0,59 px, a mesma medida e a mesma causa da irmã `/es/eliminar-paginas-pdf/`; `42eb5e4`) e o teste do hub de PDF do `events.spec.ts` (as presets de PDF são linhas da tabela, não cartões; `781baea`). Cada correção tem o controle no `dist-base`, e os specs delas passaram inteiros de novo (§ 742 e § 737).
- **Os testes antigos que mudaram** (§ 743, 47 itens, mais 4 da revisão): os que leem o registro de PDF e passam a ler as presets (`consent`, `conteudo`, `design-checks`, `pdf-site`, `prontidao`, `quality`, `seo-checks`, `pdf-matrix-table`, `axe-pdf-states`, `island-pdf-result`, `lib/pdf-states.ts`, `budgets`, `i18n-budgets`, `pdf-merge`); as contagens e as listas (`home`, `image-hub`, `icons`, `routes`, `tool-count` e o `COUNT_SAMPLES`, `launch-kit`, `fo-ad-map` 190 → 205, `footer-phone`, `share-target`, `a11y` e `navigation` da busca, `tool-i18n`); os chips (`handoff`, `image-registry`); o guia de localização (`guide-page`, `guides-entries`, `guides-measured`, `guides-numbers`, `tool-guides`, a linha do `GUIDE_ON_SCREEN` do `clearance`); o `reference()` do `lib/matrix.ts`; o `cookie-notice` da Extrair em es; o hub de PDF do `events`; a leitura do resultado das presets de PDF, que ficou só no `axe-pdf-states`; e, da revisão, o `launch-claims` (as cinco páginas), o `pdf-privacy` (as duas presets), o limite de baixo da razão PNG/JPG no `pdf-matrix` e os casos de sentinela do `image-privacy`. Os limites que mudaram: o tempo de três testes do `conteudo.test.ts` que rodam o portão duas ou três vezes (item 9, sem asserção mudada) e a Extrair em es na tolerância de 1 px que a irmã tem desde a F13b (item 45, sem tolerância nova). Nenhum teste saiu, foi pulado ou desligado.

## O `pnpm verificar --partes`

Rodou uma vez, no último commit de código e de documentos da revisão, `b09c9f0`, de 13/nov/2026 às 09h12 às 10h11, com a máquina livre (a execução de 11/nov no mesmo commit foi cortada no meio do Lighthouse, quando a sessão acabou, sem reprovar nada; o log dela ficou em `.cache/f18/verificar-partes-cortado.log`).

```text
Resumo das partes do CI (pnpm verificar --partes, 25 partes lidas de .github/workflows/ci.yml)
  ok      56.9 s  build: pnpm verificar --build
  ok     118.5 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     398.1 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     164.4 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     144.6 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok     224.3 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     161.9 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok     107.4 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     173.8 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok     124.9 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     114.9 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      78.0 s  playwright: pnpm verificar --playwright=webkit --shard=1/14 --dist-pronto
  ok     117.5 s  playwright: pnpm verificar --playwright=webkit --shard=2/14 --dist-pronto
  ok     112.3 s  playwright: pnpm verificar --playwright=webkit --shard=3/14 --dist-pronto
  ok     398.3 s  playwright: pnpm verificar --playwright=webkit --shard=4/14 --dist-pronto
  ok      42.5 s  playwright: pnpm verificar --playwright=webkit --shard=5/14 --dist-pronto
  ok     156.7 s  playwright: pnpm verificar --playwright=webkit --shard=6/14 --dist-pronto
  ok     100.6 s  playwright: pnpm verificar --playwright=webkit --shard=7/14 --dist-pronto
  ok      59.0 s  playwright: pnpm verificar --playwright=webkit --shard=8/14 --dist-pronto
  ok     107.0 s  playwright: pnpm verificar --playwright=webkit --shard=9/14 --dist-pronto
  ok     123.6 s  playwright: pnpm verificar --playwright=webkit --shard=10/14 --dist-pronto
  ok     148.5 s  playwright: pnpm verificar --playwright=webkit --shard=11/14 --dist-pronto
  ok     135.7 s  playwright: pnpm verificar --playwright=webkit --shard=12/14 --dist-pronto
  ok      84.0 s  playwright: pnpm verificar --playwright=webkit --shard=13/14 --dist-pronto
  ok     122.3 s  playwright: pnpm verificar --playwright=webkit --shard=14/14 --dist-pronto
  soma 3575.7 s (parede 3575.7 s; cada parte com o limite de 900 s)
```

As duas partes maiores são o Lighthouse (398,1 s) e a WebKit 4/14 (398,3 s), a do `clearance.spec.ts` inteiro, agora com as presets de PDF e o Organizar no passeio de estados (§ 742); na F17 essa parte tinha dado 364,3 s na máquina (`.cache/f17/verificar-partes.log`), e os 34 s a mais são os testes da F18 que caem nela. Nas 22 partes do Playwright passaram 5.390 testes e 8 foram pulados (os testes de um navegador só), sem nenhuma falha, nenhuma nova tentativa e nenhum `net::ERR_NO_BUFFER_SPACE`. A WebKit 5/14 (42,5 s, 188 testes) e a 8/14 (59,0 s, 191 testes) são curtas porque levam testes curtos (o café, os cartões dos guias, a distância dos anúncios), conferido no log.

O resto do verificar, na parte 2 (os portões), com as linhas reais da saída:

```text
  ok      15.6 s  tipos (astro check)
  ok       7.1 s  lint (eslint)
  ok      43.1 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       1.1 s  seo (hreflang, sitemaps, canonical, robots)
  ok       1.7 s  links internos e páginas órfãs
  ok       2.0 s  conteúdo mínimo das ferramentas e do site
  ok       4.0 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       2.1 s  design (sprite, fontes, tema, movimento, setas)
  ok       9.2 s  licenças
  ok       0.6 s  conteúdo de dinheiro e saúde
  ok       0.6 s  actionlint
  ok      30.6 s  lint:texto (LanguageTool)
```

O Vitest: 140 arquivos e 2.229 testes, todos verdes. O `lint:texto`: 75 arquivos, 5.303 textos, 0 erro de gramática, 1.705 avisos (os de ortografia, nos sufixos sem acento como `-extraido` e nos nomes de produto).

## A projeção das partes do CI

A projeção (§ 747; `.cache/f18/proj/proj-slice1.md` e `proj-final.md`) usa os tempos por teste das execuções completas mais novas, a da PR 34 (`42908729924`, Chromium em 8 e WebKit em 15) e a da F17 (`42903419182`, WebKit em 14), e o `--list --shard` desta branch; o teste sem tempo de CI ganha o da página irmã, ou o tempo medido pela frente vezes a razão CI/máquina do spec mais parecido.

- **Depois da fatia 1** (só as páginas que entraram sozinhas pelos registros): a maior parte foi a 6/14 do WebKit, com 648 s (pessimista 778 s); no Chromium, a 4/8 com 583 s.
- **Com todos os testes do `8a1d1c1`** (212 testes novos no Chromium, 699 s de soma; 220 no WebKit, 1.092 s em 14 partes):

| Configuração | Parte mais justa | Central | Pessimista | Acima de 700 s |
| --- | --- | ---: | ---: | --- |
| Chromium em 8 | 4/8 | 620 s | 634 s | nenhuma |
| WebKit em 14 (o `ci.yml` desta branch e da main) | 6/14 | 666 s | 796 s | nenhuma no central; 6/14 (796) e 4/14 (764) no pessimista |
| WebKit em 15 (a PR 34, aberta) | 7/15 | 726 s | 922 s | **a 7/15 no central** (o `fo-ad-map` inteiro, o `guide-page` e o `fo-wall`) |

O CI desta PR roda com 14 partes no WebKit, e nenhuma passa de 700 s no central. Com as 15 da PR 34, a 7/15 passaria de 592 s para 726 s por causa dos testes desta run; como a PR 34 está aberta e mexe no mesmo `ci.yml`, a run não abriu uma segunda PR (decisão 25): a divisão fica no § 747 e no F18 m-2. Com 16 partes a maior seria a 7/16 (671 s); com **17**, a 5/17 (657 s), a recomendada. Os specs que mais somam: `a11y` (+34 testes), `pdf-matrix` (+10), `clearance` (+9, pelo `PDF_WALKS`), `axe-pdf-states` (+9), `island-pdf-organize` (+17), `image-matrix` (+8). O tempo de verdade de cada parte vai na descrição da PR.

**O que a execução completa mostrou** (`43432440540`, no `c461e0d`, § 747): a parte WebKit 4/14 reprovou por tempo, com os 198 testes verdes e 908,9 s, acima do limite de 900 s (o `clearance` com 1.015 s de soma e o `budgets` com 256 s). A projeção acima errou essa parte: as partes que montam o build de teste dos anúncios pagam uns 228 s de custo fixo, e as outras uns 38 s, e ela usava um número só. Com os tempos reais de cada teste dessa execução (`.cache/f18/proj/real-parts.mjs`), o alto de cada configuração do WebKit fica: 14 partes, 909 s (a 4/14); **15 partes (a PR 34), 780 s** (a 11/15; a 4/15 com 727 s, o `clearance` dividido); 16 partes, 838 s; 17 partes, 881 s (com 16 e 17 o `clearance` cai inteiro numa parte). As 15 da PR 34 resolvem, e a recomendação de 17 do § 747 ficou substituída. O Victor escolheu mesclar a PR 34, e a `fase-18` junta a main e roda a execução completa de novo.

## O custo

`pnpm ci:custo 43423241405`, a execução leve do push do `b09c9f0` (a última antes deste relatório):

- Branch `fase-18`, commit `b09c9f0`, evento `pull_request`, resultado `success`. Classe: **leve**.
- Minutos cobrados: **5** (o `verificar (leve)` 3, o `classificar` 1, o `ci-ok` 1). Tempo de parede: **3,2 min**. Jobs: 3 rodaram, 7 pulados.
- O `verificar (leve)` levou 159 s, com 132,6 s de `pnpm verificar --leve` (os tipos, o lint, o build e o Vitest).

As execuções leves da run, uma por push: `9900ca8` verde (o prompt gravado, `43052964661`); `50ba4e6` vermelha (`43060300237`: a fatia 1, com os testes de contagem, de lista e de placeholders que as frentes ainda iam mudar, como o `routes`, o `consent`, o `conteudo`, o `english-leak` e o `launch-kit`); `9ac7608` vermelha (`43068541201`: o `pdf-matrix-table.test.ts`, que esperava as linhas do Organizar na tabela da F18, ainda sem a frente O); `31b9770` verde (`43090084926`, o commit da revisão); `b09c9f0` verde (`43423241405`). Nenhum commit foi feito por causa das vermelhas. O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

`pnpm ci:custo 43432440540`, a primeira execução completa (`c461e0d`, classe **completo**, resultado `failure` pela WebKit 4/14): **218** minutos cobrados, **17,6 min** de parede, 27 jobs rodaram e 4 foram pulados; o maior `verificar` foi o da WebKit 4/14, com 908,9 s, e 2 das 25 partes passaram do alvo de 700 s (a 4/14 e a 11/14, com 707 s).

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list` de 11/nov/2026, só leitura), como na F15, na F16 e na F17, e criá-lo é do Victor (§ 746). A execução completa depois do `gh pr ready` faz esse papel: é a primeira vez que as cinco páginas e as matrizes delas rodam no WebKit do Linux.

A primeira execução completa (`43432440540`, no `c461e0d`, 13/nov/2026): 25 partes, 24 verdes; a WebKit 4/14 reprovou só por tempo (908,9 s, os 198 testes verdes), e a correção é a divisão em 15 da PR 34 (§ 747). As matrizes de imagem e de PDF rodaram no WebKit do Linux pela primeira vez e passaram. As linhas do runner: `[webp 12 MP] chromium 1.4`, `[avif 12 MP] chromium 3.6`, `[webp 12 MP] webkit 3.0`, `[avif 12 MP] webkit 3.3`: no runner o AVIF demorou mais nos dois navegadores, por pouco no WebKit, e na máquina o WebKit salvou o WebP mais devagar (§ 739); a frase nova do Converter para WebP, "qual dos dois salva mais rápido depende do navegador", segue certa nos dois lugares. O resultado da execução completa depois da junção com a main vai na descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo (a run mexeu no motor e na privacidade) sobre o `31b9770`, numa worktree só de leitura com install, build e build de teste próprios: (a) as ferramentas, (b) o site, o SEO, os idiomas e os documentos, (c) o orçamento, os anúncios, a acessibilidade e o CI, (d) o motor, (e) a privacidade; um cético por achado médio ou acima e um por lente para os baixos, "na dúvida, refutado".

- **9 achados, nenhum alto.** Confirmado o E-2 (baixo): o `stripJpeg` guardava a miniatura de um JFIF, e a página promete que a miniatura sai; corrigido no motor (`2c213cb`, § 749). O E-1 (médio: o `launch-claims.spec.ts` sem as cinco páginas e o `pdf-privacy.spec.ts` sem as duas presets) foi refutado pelo cético, e corrigido assim mesmo pela leitura mais rigorosa do critério 5 (`e2b4039`). Os outros sete refutados (o comentário do `browser.ts` dos guias, o índice do design system, o número do runner, a parte 4/14 e três sobre a Orientation do PNG e da WebP, que o § 732 e o F18 m-1 já registram).
- **Uma nota fora dos achados** (lente a): "much closer in size" não cobria o WebKit, onde o PNG chega à metade do JPG; as frases e o limite de baixo da matriz foram corrigidos (`e556e7a`).
- **A segunda passada** (lentes a, d e e, sobre `31b9770..e556e7a`): 6 itens, nenhum alto; corrigidos o A2-1 (médio: as frases falam do PDF inteiro, como a medida; `dd8281d`), o A2-2 (`e03c065`), o d-2 (o JFIF curto e o JFXX, `80363f7`) e o E2-1 (os casos de sentinela no `image-privacy.spec.ts`, `6c55333`); o d-1 se resolve pelo § 749.
- **Nenhum achado aberto**, e nenhum baixo novo no grupo 28. Os testes novos das correções reprovam no código ou no `dist` de antes. O relato está em `docs/relatorios/REVISAO-F18.md` (§ 748).

A junção das seis frentes (P, I, S, E, T e, por último, O) achou as três falhas da seção "Os testes" e os comentários que ainda contavam 12 ferramentas de PDF (`92184bc`).

## As imagens

Em `docs/relatorios/fase-18/` (JPEG 80, 1x, movimento reduzido, Chromium do Playwright, `.cache/f18/shots.ts`, do `dist/` do fechamento):

- `organizar-pdf-360-pt.jpg`: o Gerenciar páginas do PDF a 360 px, com as páginas 2 e 4 giradas, a 6 saindo e as três marcadas.
- `organizar-pdf-vista-1280.jpg`: a vista da página 3 do Organize PDF a 1280 px, com "Turn 90°" e "Take this page out" na barra de baixo.
- `extrair-paginas-360-es.jpg`: o Extraer páginas de PDF a 360 px, com a grade e as páginas 1 e 3 marcadas.
- `pdf-para-png-360.jpg`: o resultado do PDF to PNG a 360 px (a página escaneada a 72 ppi, "Adjust · PNG · 72 ppi").
- `espelhar-imagem-360-pt.jpg`: o resultado da Espelhar imagem a 360 px, com uma foto deitada espelhada.
- `remover-exif-360.jpg`: o resultado do Remove EXIF data a 360 px, com a foto de celular com GPS e a frase do card.
- `hub-imagem-1280.jpg`: o hub de imagem em inglês, com os onze cartões.
- `hub-pdf-1280.jpg`: o hub de PDF em inglês, com os catorze cartões e a tabela das presets.

## A prévia

https://fase-18-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio).

## As decisões novas

§ 721 a § 749 no `DECISOES.md`: a tabela e a regra (721), a linha 15 e o teto do catálogo (722), o `keywords.csv` e o `data/README.md` (723), os nomes, os caminhos, o glossário e a busca (724), a peça das presets de PDF e onde as presets aparecem (725), a operação `organize` (726), o modo `'organize'` da grade, a barra e a vista (727), a Extrair (728), a PDF para PNG e a medida dos tamanhos (729), a Espelhar (730), a operação `strip` (731), a Orientation e o que "sem Exif" quer dizer (732), o guia de localização e o `guias:medir` (733), o `next`, o `related` e o chip que leva (734), os ícones (735), os textos (736), o lugar no site e o GA4 (737), as matrizes (738), o F17 m-1 (739), o kit (740), o orçamento (741), os anúncios, o CLS, o axe e o Lighthouse (742), os testes antigos que mudaram (743), o design system (744), as frentes e a junção (745), o rótulo `ci` (746), as partes do CI (747), a revisão (748) e a miniatura do JFIF (749).

## A válvula de estouro

Não cortou nada: o Organizar PDF ficou na F18, com a operação, a grade, a vista, a matriz e os testes, e não há F18b; o F17 m-1 foi fechado (§ 739). Nenhuma PR das partes do CI foi aberta: o CI desta PR, com 14 partes no WebKit, não passa de 700 s na projeção central, e a divisão em 17 por cima da PR 34 ficou no § 747 e no F18 m-2.

## As ideias que ficaram fora, de propósito

Uma linha cada, sem virar pendência:

- Um leitor de metadados que diga à pessoa o que a foto tinha (a localização, a data, o aparelho) antes de tirar (decisão 10: fora do código desta run).
- Aplicar a Orientation nos pixels sem recodificar o JPG, para a foto girada sair sem Exif nenhum: pediria uma dependência nova (§ 732).
- Um chip de outra ferramenta de imagem para o Remover dados EXIF: hoje levaria uma foto já sem metadados (§ 734).
- Dizer, na página do Converter para WebP, qual formato salva mais rápido em cada navegador: a próxima versão de cada motor pode desmentir, sem teste que mantenha a frase (§ 739).
- Desempatar a busca pelo nome dentro de cada passo: mudaria resultados fixados desde a F2 (§ 724).

## A lista do que é do Victor

1. `git pull` e, na prévia ou no fileorca.com depois do deploy, usar cada página nova no celular e no computador:
   - no Organizar PDF: marcar páginas, girar, tirar, mover com as setas (e arrastar com o mouse), abrir a vista pela lupa e salvar;
   - no Remover dados EXIF: uma foto do celular com localização, conferindo depois, no próprio celular ou no computador, que a localização sumiu e a foto continua igual;
   - na Extrair páginas, na PDF para PNG e na Espelhar imagem: um arquivo de verdade em cada uma.
2. No Search Console, pedir a indexação das 15 páginas novas: `/organize-pdf/`, `/pt/gerenciar-paginas-pdf/`, `/es/organizar-pdf/`, `/split-pdf/extract-pages/`, `/pt/dividir-pdf/extrair-paginas/`, `/es/dividir-pdf/extraer-paginas/`, `/pdf-to-jpg/to-png/`, `/pt/pdf-para-jpg/para-png/`, `/es/pdf-a-jpg/a-png/`, `/rotate-image/flip/`, `/pt/girar-imagem/espelhar/`, `/es/rotar-imagen/reflejar/`, `/remove-exif-data/`, `/pt/remover-metadados-foto/`, `/es/quitar-metadatos-foto/`. Se quiser, também os três guias de localização, que trocaram a ferramenta: `/guides/remove-location-from-photos/`, `/pt/guias/remover-localizacao-das-fotos/`, `/es/guias/quitar-la-ubicacion-de-las-fotos/`.
3. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
5. Mesclar a PR 34 (as partes do CI da F17, `ajuste-ci-partes-f17`): a F18 depende dela, porque com o WebKit em 14 partes a 4/14 passa de 900 s (§ 747). Depois, acompanhar as partes nas próximas execuções completas, como o F18 m-2 diz: com 15, a 11/15 e a 4/15 podem ficar acima do alvo de 700 s.
6. Nada de F18b: o Organizar PDF entrou nesta run.
7. Por 2 semanas, acompanhar no GA4 o `tool_start` e o `tool_complete` das páginas novas, pelo `tool`: `remove-exif-data` (`outcome` `cleaned`), `rotate-image-flip` (`rotated`), `organize-pdf` (`organized`), `split-pdf-extract-pages` (`split`) e `pdf-to-jpg-to-png` (`converted`).
