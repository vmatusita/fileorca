# F18 · Plano da run

O gabarito da revisão final, junto com a ficha da F18 (`PLANO-UX-QV.md`, "F18 · Ferramentas novas que passarem na regra") e o prompt (`docs/prompts/prompt-fase-18.txt`). Autossuficiente: quem lê só este arquivo sabe o que a run faz, quem faz, em que ordem e o que prova cada critério.

## 1. A tabela, a regra e a decisão de cada candidata

Os números foram dados pelo Victor na conversa, célula por célula, escolhendo entre os valores que o `data/README.md` aceita (§ 721). Os lances ficaram vazios.

| Candidata | Termo | Tipo | Volume EUA | Lances | Trends | Regra | Decisão |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organizar PDF | organize pdf | ferramenta | 10K-100K | vazios | estavel | `10K-100K`+ e não `caindo` | entra |
| Extrair páginas do PDF | extract pages from pdf | preset do Dividir | 10K-100K | vazios | subindo | `1K-10K`+, não `caindo`, 4 testes | entra |
| PDF para PNG | pdf to png | preset do PDF para JPG | 10K-100K | vazios | estavel | `1K-10K`+, não `caindo`, 4 testes | entra |
| Espelhar imagem | flip image | preset do Girar imagem | 10K-100K | vazios | subindo | `1K-10K`+, não `caindo`, 4 testes | entra |
| Remover dados EXIF | remove exif data | ferramenta | 10K-100K | vazios | subindo | `10K-100K`+ e não `caindo` | entra |

Os quatro testes da página programática nas três presets: (1) a demanda é a linha `entra`; (2) o comportamento muda a ferramenta (a Extrair com um modo e uma saída; a PDF para PNG sem a escolha de formato e com PNG; a Espelhar sem o giro), provado por um teste no navegador por preset; (3) ao menos três blocos de conteúdo que as irmãs não têm, provados pelo `gate:conteudo`; (4) a geografia é a dos EUA, a da tabela.

Com cinco `entra`, a run é a F18 inteira, na branch `fase-18` (vmatusita/fileorca#35), e o caminho curto da decisão 0 não acontece.

## 2. O ponto de partida e a linha de base

- **Ponto de partida:** `origin/main` em `39d13418783b9ab3084a06cab6dc1289ca5e5c4c` (a F17, PR 33). A PR das partes do CI da F17 (vmatusita/fileorca#34, § 720, WebKit em 15 partes) está aberta e sem merge: o `ci.yml` da main tem 8 partes do Chromium e 14 do WebKit, e o `pnpm verificar --partes` da máquina tem 25 partes.
- **O `PLANO-FILEORCA.md`:** sem diferença no começo; o F14 m-1 continua aberto (§ 722).
- **O rótulo `ci`:** não existe (`gh label list` de 11/nov/2026); a conferência no Linux do meio da run não acontece, e a execução completa final faz o papel dela (decisão 25, § 746).
- **A linha de base** (worktree `.claude/worktrees/f18-base`, saída em `.cache/f18/antes/`):
  - Vitest: 137 arquivos, 2.159 testes (uma falha por tempo esgotado sob carga no `conteudo.test.ts`, que passa sozinho).
  - Playwright `--list`: 2.470 testes por navegador, em 85 arquivos.
  - `dist/_astro/`: 68 arquivos JS.
  - Orçamento no Chromium: 355 testes verdes.
  - Ilhas com gzip: o grupo `island` de imagem com 23.288 B; a entrada da ilha de PDF com 23.803 B. O teto da F18 é +2.048 B em cada.
  - Contagens: H1 da home "48 tools. 0 uploads." (en) e "31 ferramentas. 0 uploads." (pt); menu com 10 ferramentas de imagem e 12 de PDF; hub de imagem "Ten image tools, zero uploads" com 10 cartões; hub de PDF com 13 cartões.
  - Controles negativos: as 15 páginas novas dão 404, e o guia de localização embute o `resize-image`.

## 3. Os § reservados

O `DECISOES.md` da main termina no § 719; o § 720 é da PR das partes. Esta run escreve do § 721 em diante, na ordem. As frentes escrevem os § delas num arquivo de notas, com o número reservado abaixo, e o agente principal os põe no `DECISOES.md` na junção.

| § | Assunto | Quem escreve |
| --- | --- | --- |
| 721 | A tabela e a regra: as cinco entram | principal |
| 722 | A linha 15, o teto do catálogo e o `PLANO-FILEORCA.md` sem diferença | principal |
| 723 | O `keywords.csv` e o `data/README.md` | principal |
| 724 | Os nomes, os caminhos, o glossário e os sinônimos da busca | principal (en) e T (pt, es) |
| 725 | A peça das presets de PDF e os lugares onde as presets aparecem | principal e P |
| 726 | A operação `organize` do motor | O |
| 727 | O modo `'organize'` da grade: teclado, barra, célula em Pequenas, vista e falas | O |
| 728 | A Extrair páginas do PDF | P |
| 729 | A PDF para PNG | P |
| 730 | A Espelhar imagem: o caminho composto e a prova | I |
| 731 | A operação `strip`: o `outcome`, a frase do card e o WebP animado | I |
| 732 | A Orientation e o que "sem Exif" quer dizer; a regra do `PLANO-FILEORCA.md` continua cumprida | I |
| 733 | O guia de localização com o Remover dados EXIF e o `guias:medir` | I |
| 734 | O `next`, o `related` e o chip que leva | S |
| 735 | Os ícones | S |
| 736 | Os textos: as fontes externas, as contagens, as frases desmentidas e a tabela dos três idiomas | T |
| 737 | O lugar no site, a "Abrir com", o `share_target` e as listas do GA4 | S |
| 738 | As matrizes: os lotes e o caminho da tabela de PDF | principal, com P, O e I |
| 739 | O F17 m-1: o WebP de 12 MP | principal, com I |
| 740 | O kit de lançamento | principal |
| 741 | O orçamento | principal |
| 742 | Os anúncios, o CLS, o axe e o Lighthouse | principal |
| 743 | Os testes antigos que mudaram (formato da § 341) | principal, com as notas das frentes |
| 744 | O design system: a grade do Organizar, a barra de ações e o contraste | O |
| 745 | As frentes, quem escreve os textos de cada idioma e a junção | principal |
| 746 | A conferência no Linux: o rótulo `ci` não existe | principal |
| 747 | As partes do CI com os testes novos | principal |
| 748 | A revisão adversarial da F18 | principal |

Um § que aparecer a mais entra depois do 748, na ordem em que nascer.

## 4. A interface que as frentes dividem

- **Os ids e os caminhos** são os da decisão 4 (tabela no § 724). A ordem: o `remove-exif-data` no fim do `IMAGE_TOOL_IDS`, a `rotate-image-flip` no fim do `IMAGE_PRESET_IDS`, o `organize-pdf` logo antes do `reorder-pdf-pages` no `PDF_TOOL_IDS`, e o `PDF_PRESET_IDS` novo com `split-pdf-extract-pages` e `pdf-to-jpg-to-png`.
- **Os tipos e funções da peça das presets de PDF** (fatia 1, `src/tools/pdf/registry.ts`): `PdfPresetId`, `PdfPageId = PdfToolId | PdfPresetId`, `PdfPageDef.parent?`, `presetsOf()`, `toolOf()` e `PDF_PAGES: Record<PdfPageId, PdfPageDef>`. A ilha recebe `base` (a ferramenta da página) no `data-props`: `base` onde o código quer dizer "esta ferramenta", `page` onde quer dizer "esta página" (eventos, caixa de entrada, `PDF_TOOLS[page]`, o sufixo).
- **As operações novas do motor:** `{ kind: 'organize'; pages: { index: number; turn: number }[] }` no `PdfOperation` (frente O) e `{ kind: 'strip' }` no `Operation` de imagem (frente I), cada uma com o Vitest no Node antes da ilha.
- **O GA4:** os cinco ids no `IMAGE_EVENT_TOOLS` e no `PDF_EVENT_TOOLS`; dois valores novos do parâmetro `outcome` que já existe, `organized` e `cleaned`; as presets usam o `success` do pai (`split`, `converted`, `rotated`).
- **As chaves de texto:** os textos das páginas em `src/tools/<slug>/i18n/{en,pt,es}.ts` e `src/tools/<pai>/presets/<nome>/i18n/{en,pt,es}.ts`; `FlipOptionsTexts` e os `presets*` dos hubs e dos pais em `src/i18n/types.ts`; as chaves novas da grade e da vista do Organizar (frente O) e dos chips que levam (frente S), cada uma nos três idiomas pela frente que a cria.
- **Os donos dos arquivos que mais de uma frente toca:**

| Arquivo | Dono |
| --- | --- |
| `src/tools/pdf/registry.ts`, `src/tools/image/registry.ts` | fatia 1; o `next` e o `related`, S |
| `src/tools/pdf/tools.tsx` | as presets, P; o Organizar, O |
| `src/tools/pdf/PageGrid.tsx`, `PageCell.tsx`, `PageView.tsx`, `grid-math.ts` | O |
| `src/i18n/types.ts` | chaves da P, da O, da I e da S, em lugares diferentes |
| `src/i18n/{pt,es}/common.ts` | T (os cartões); en, fatia 1 |
| `src/tools/<página nova>/i18n/{pt,es}.ts` | T (as chaves novas que P e I criarem vêm com o valor delas) |
| `tests/e2e/pdf-matrix.spec.ts` | um bloco da P, um da O |
| `tests/e2e/lib/matrix.ts`, `image-matrix.spec.ts` | I |
| `tests/e2e/lib/pdf-states.ts` | o `case 'organize-pdf'`, O; as presets nos laços, P |
| `tests/unit/conteudo.test.ts` | P |
| `tests/unit/launch-kit.test.ts`, o kit, `docs/claude/`, `docs/PENDENCIAS.md`, `DECISOES.md` | agente principal |
| `budgets`, `ads`, `fo-ad-map`, `layout-shift`, `tool-slot`, `a11y`, `tool-i18n`, `share-target`, `cookie-notice`, `navigation`, `footer-phone` (specs) | E |
| `clearance.spec.ts` | a linha do `GUIDE_ON_SCREEN`, I |

## 5. Quem faz o quê, e a ordem

1. **Fatia 1** (feita, `cfd2756` a `50ba4e6`): a base em inglês (§ 745).
2. **As frentes**, em worktrees, a partir do `50ba4e6`, com os briefings em `.cache/f18/fronts/brief-*.md`:
   - **P**, as presets de PDF: as opções sem o segmento e sem a escolha de formato, o laço do `gate:conteudo`, a matriz das duas, a tabela da matriz de PDF e o teste 2 no navegador;
   - **O**, o Organizar PDF: a operação `organize` e o Vitest no Node, o modo `'organize'` da grade, a barra, a vista, a matriz, os specs da grade e o README do design system;
   - **I**, a imagem: a operação `strip` e a prova no Node, a Espelhar, a ilha do Remover dados EXIF, o guia de localização e o `guias:medir`, a matriz de imagem e o F17 m-1;
   - **T**, pt e es: as páginas, os cartões, os hubs, o glossário, as frases desmentidas e o `lint:texto`;
   - **S**, o site: os ícones, o `next` e o `related`, os chips que levam, quem lê os registros e os testes de contagem do Vitest;
   - **E**, as listas fixas dos specs: orçamento, anúncios, CLS, axe, navegação.
3. **Ao mesmo tempo, o agente principal:** os § na ordem, o kit de lançamento, o `docs/claude/` e o `docs/PENDENCIAS.md`.
4. **A junção:** P, I, S, E, T e, por último, O; o `pnpm tipos` verde a cada uma; os specs das frentes nos dois navegadores e os de anúncio no build de teste.
5. **O fechamento:** o orçamento contra o `dist-base`, o Lighthouse das páginas novas (configuração temporária em `.cache/f18/`), as três rodadas do F17 m-1, as tabelas das matrizes regeradas numa execução só, a projeção das partes e as imagens.
6. **A revisão adversarial** com cinco lentes (o Organizar e o Remover dados EXIF mexem no motor e na privacidade).
7. **O fim:** o `pnpm verificar --partes`, o relatório e a sequência da decisão 25.

## 6. A projeção das partes

Depois da fatia 1, com os tempos da execução completa da PR 34 (`42908729924`) e os da F17 (`42903419182`): em `.cache/f18/proj/proj-slice1.md`, resumida no relatório. A projeção final, com os specs das frentes, vai no § 747.

## 7. Cada critério e a prova

| Critério | Prova |
| --- | --- |
| 1. A tabela e a regra | § 721, as cinco linhas do `keywords.csv`, este plano |
| Ficha: as presets nos quatro testes | teste 2 por preset no navegador (P, I); `gate:conteudo` com três blocos próprios (teste 3); § 721 (testes 1 e 4) |
| Ficha: as ferramentas no `gate:conteudo` | `pnpm gate:conteudo` |
| Ficha: a matriz com cada fixture, nos dois navegadores | `image-matrix.spec.ts` e `pdf-matrix.spec.ts`; `docs/relatorios/fase-18-matriz.md` e `fase-18-matriz-pdf.md`; o `pdf-matrix-table.test.ts` e o `matrix-table.test.ts` reprovam lacuna |
| Ficha: o Remover dados EXIF prova no Node | o Vitest da operação `strip` (bytes da imagem iguais, nenhum GPS, XMP nem IPTC, só a Orientation), com o controle negativo |
| Ficha: `gate:seo`, `gate:links`, `gate:conteudo`, `launch-kit.test.ts` | os portões e o Vitest |
| Ficha: o orçamento como o das irmãs | `budgets.spec.ts` e `i18n-budgets.spec.ts`, o "igual à irmã"; os arquivos de `dist/_astro/` contra o `dist-base`; o grupo `island` e a entrada da ilha de PDF com no máximo +2 KB |
| Ficha: a densidade de anúncio | `ads.spec.ts` e `fo-ad-map.spec.ts` no build de teste, a 360 × 740, com a vista do Organizar aberta |
| Ficha: `pnpm verificar` | `pnpm verificar --partes` na máquina e o CI completo |
| 3. O "Dentro" | a linha 15 e o § 722; o Vitest do `organize` antes da ilha; a peça das presets de PDF (§ 725) |
| 4. Nada do "Fora" | a revisão (lente b) contra a lista do prompt; o `git diff` do ponto de partida |
| 5. Nada sai do aparelho | `image-privacy`, `pdf-privacy`, `launch-claims` e `events` com as páginas novas |
| 6. Os textos | `pnpm lint:texto` com 0 erro; `english-leak`, `glossary`, `claude-md` e `pendencias` verdes |
| 7. Lighthouse, axe e CLS | o Lighthouse com a configuração temporária (≥ 90 nas quatro categorias); `a11y.spec.ts` e os specs da grade; `layout-shift.spec.ts` e `tool-slot.spec.ts` |
| 8. Os documentos | `data/README.md`, o kit, `docs/design/`, `docs/claude/`, `docs/PENDENCIAS.md` |
| 9. Os testes antigos | o § 743, um por um |
| 10. O `verificar --partes` e o CI | a saída no relatório; o CI verde na PR |
| 11. A revisão | `docs/relatorios/REVISAO-F18.md`, sem achado alto ou médio aberto |
