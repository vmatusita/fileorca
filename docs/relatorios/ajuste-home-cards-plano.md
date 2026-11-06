# Plano do ajuste `ajuste-home-cards`: a home com um card por ferramenta

O gabarito da revisão. A ficha é o prompt (`docs/prompts/prompt-ajuste-home-cards.md`), que vence o resto; este plano diz como a run a cumpre.

## Ponto de partida

- `origin/main` em `2bd851c` (F13b, PR 27), o "ponto de partida". A branch é `ajuste-home-cards`; a PR em rascunho é a 28.
- O `dist/` do ponto de partida foi montado numa worktree à parte, `.claude/worktrees/home-cards-base` (o build padrão em `dist/` e o build de teste em `.cache/builds/teste/` dela), sem trocar a branch do clone principal.

## O que muda, por arquivo

| Arquivo | O que muda |
| --- | --- |
| `src/views/HomeView.astro` | Cada faixa vira `section.fo-section.fo-section--cat[aria-labelledby]`, com o H2 (`heading`), a frase (`more`) num `p.fo-prose`, a `ul.fo-grid` de `li > ToolCard` e um `p.fo-more` por link do hub (`all`; na casa e saúde, `all` e `allHealth`; o QR sem link). O topo, as marcas de anúncio, a seção de guias e a de privacidade não mudam. Saem os imports do `Icon` e do `home-numbers`. |
| `src/components/home-bands.ts` | Continua a fonte única das listas. Cada item ganha `description`; `HomeChip` vira `HomeCard`, `chips` vira `cards`, `ChipCategory` vira `CardCategory`, `homeChipPaths` vira `homeCardPaths`. Nenhuma lista muda. |
| `src/components/home-numbers.ts` | Sai (só a home o lia). |
| `src/i18n/{en,pt,es}/home.ts` e `src/i18n/types.ts` | Saem `to`, `count`, `num` e `say`; `HomeBandTexts` fica com `heading`, `more` e `all`. O comentário do topo de cada arquivo diz a home de agora. Nenhuma frase nova. |
| `src/styles/components.css` | Sai o bloco `.fo-catband*` (fundo, cantos, padding, onda, título, contagem, número, frases, chips e links). O `.fo-home-top` continua na `Figtree Steady`; a `--fo-band-dark` e o `@media screen` dela ficam (os hubs a usam). Entra só `.fo-section--cat > .fo-prose { max-width: 28rem }` (o LCP, decisão 7). Nenhuma regra nova para a grade. |
| `src/ads/map.ts` | O `NEVER_INSIDE_CLASSES` troca `fo-catband` por `fo-section--cat`. |
| `scripts/lib/prontidao.ts` | O `TOOL_LINKS` volta a `main a.fo-tool`; o `realSite` continua pedindo à home a lista do `home-bands.ts`. |
| `tests/e2e/lib/ad-map.ts` | `MAP_TARGETS`: sai `.fo-catband`, entram `.fo-section--cat`, `.fo-section--cat .fo-grid` e `.fo-section--cat .fo-tool`. `TARGET_GROUPS`: `faixas` e `chips` viram `secoes` e `ferramentas`. `FORBIDDEN`: `.fo-catband` vira `.fo-section--cat`. |
| `tests/e2e/lib/ad-clearance.ts` | `TARGETS`: `.fo-catband` vira a seção, a grade e os cards da home. |
| `tests/e2e/fo-ad-map.spec.ts` | O caso `home` pede o 1º anúncio depois de `section.fo-section.fo-section--cat[aria-labelledby=tools]`, as caixas de conteúdo medidas a 360 (en 5, pt 4, es 4) e, a 1280, o conteúdo, o multiplex e a lateral. O teste do mar mede as seções e os cards no lugar das faixas e dos chips. |
| `tests/e2e/home-sea.spec.ts` | O teste do escuro sai da home (fica nos hubs). Entra o teste novo da grade (decisão 12b). |
| `tests/unit/home-numbers.test.ts` | Vira `tests/unit/home.test.ts` (`git mv`): ficam o H1, os textos sem dígito, as listas, os links dos cards e dos hubs e a frase do dinheiro (§ 591); saem as fontes dos números, o número e a frase de cada faixa, as palavras; entra o teste novo dos cards (decisão 12a). |
| `tests/unit/image-hub.test.ts`, `pdf-site.test.ts`, `hub-icons.test.ts`, `prontidao.test.ts`, `ad-map.test.ts` | Leem os cards no lugar dos chips (`a.fo-tool`, `.fo-tool h3`, `.fo-more a`); o `hub-icons` volta a ler o ícone dos cards na home; o `prontidao` prova que o portão lê os cards da home e não um chip; o `ad-map` prova que o mapa recusa uma marca dentro da seção de categoria. |
| `scripts/screenshots.ts`, `tests/unit/health-voice.test.ts` | Só comentários que diziam "chips" e "band". |
| Documentos | `docs/design/components/ToolCard`, `NextStepChips`, `AdSlot` e o `docs/design/README.md`, onde citam a faixa da home; seção nova no fim de `docs/claude/design-e-oli.md` e `docs/claude/anuncios.md`; `docs/PENDENCIAS.md` ("Registrados"); `DECISOES.md` (§ 602 em diante); relatório, revisão e imagens. |

## Os § reservados

Escritos na ordem, um por decisão da ficha:

| § | Assunto |
| --- | --- |
| 602 | A escolha do Victor: a home volta à grade de cards da F13a (decisão 1) |
| 603 | As seções de categoria da home (decisão 2) |
| 604 | O que sai: a faixa, os chips, a contagem, o número e a frase da fonte (decisão 3) |
| 605 | O `home-bands.ts` continua a fonte das listas, agora de cards (decisão 4) |
| 606 | A grade é a `.fo-grid` de hoje (decisão 5) |
| 607 | A fonte das seções, medida (decisão 6) |
| 608 | O LCP com os cards (decisão 7) |
| 609 | Os anúncios da home com os cards (decisão 8) |
| 610 | O `gate:prontidao` lê os cards (decisão 9) |
| 611 | Os textos: só saem campos (decisão 10) |
| 612 | Os testes antigos que mudaram (decisão 11, no formato da § 341) |
| 613 | Os testes novos e os controles negativos (decisão 12) |
| 614 | A altura da home em telas (decisão 13) |
| 615 | Os documentos (decisão 14) |
| 616 em diante | O que a revisão mudar |

## As medidas já feitas (Chromium, nesta máquina)

- O HTML do `.fo-home-top` é idêntico ao do ponto de partida nos três idiomas (802, 804 e 815 caracteres).
- Palavras do `<main>` (a conta do `gate:prontidao`): 565, 512 e 524 antes; 909, 765 e 756 depois.
- A grade a 1280 no build padrão: 5 cards por linha, de 229 px, descrições de até 4 linhas, nenhuma cortada.
- O CLS de carga com a Figtree segurada (o "the load moves nothing"): 0 de 320 a 1280 nos três idiomas, sem a `Figtree Steady` nas seções.
- O LCP: a frase da seção de imagem em en passava o H1 a partir de 768 px (29.835 contra 27.663 px²); com `max-width: 28rem`, 18.959.
- O build de teste a 360: 5, 4 e 4 caixas de conteúdo (eram 3), com vãos de 1.676 px ou mais; a 1280, o conteúdo, o multiplex e a lateral, e a lateral 2 no HTML (mais de 600 palavras).

## Os testes novos (cada um reprova contra o `dist/` do ponto de partida)

1. `tests/unit/home.test.ts`: nos três idiomas, cada seção de categoria tem um `a.fo-tool` por item da lista de `home-bands.ts`, com o H3 do nome, a descrição e o ícone, e o `<main>` não tem `.fo-catband`, `.fo-chip` nem `.fo-catband__num`.
2. `tests/e2e/home-sea.spec.ts`: a 360 e a 1280, os cards de cada linha da grade têm a mesma altura e nenhum card passa da coluna nem deixa o texto vazar, nos três idiomas, no Chromium e no WebKit.
3. Depois da revisão (b-1, § 607): `tests/e2e/home-sea.spec.ts`, com a Figtree segurada 1,5 s, nenhuma seção de categoria muda de altura quando ela chega, também abaixo da dobra (as seções passaram à `Figtree Steady`).

## A verificação de ponta a ponta

1. `pnpm tipos` e `pnpm lint`.
2. `pnpm build` e os testes de unidade mexidos (`home`, `image-hub`, `pdf-site`, `hub-icons`, `prontidao`, `ad-map`, `health-voice`, `tool-count`, `default-build`).
3. Nos dois navegadores: `home-sea.spec.ts`, `design.spec.ts`, `layout-shift.spec.ts`, `a11y.spec.ts` (a home), `fo-ad-map.spec.ts` e o `ads.spec.ts`.
4. `pnpm gate:prontidao` e `pnpm lint:texto`.
5. Os controles negativos contra o `dist/` do ponto de partida.
6. A medida de antes e depois (`.cache/home-cards/measure.ts`) e as imagens.
7. `pnpm verificar --partes` uma vez, antes do `gh pr ready`.
8. A revisão: cinco lentes Sonnet em contexto limpo, céticos, correções e segunda passada.
