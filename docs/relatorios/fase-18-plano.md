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
