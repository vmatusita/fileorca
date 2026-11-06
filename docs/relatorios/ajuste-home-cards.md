# Ajuste: a home com um card por ferramenta

Run curta, pedida pelo Victor em 6/nov/2026, depois do merge da F13b: "to achando que o estilo anterior da pagina inicial estava mais bonito, digo isso na parte dos cards onde tinha um para cada ferramenta, ele assim como se fosse um card só por categoria ficou feio". Perguntado, ele escolheu cada categoria "igual à F13a" (o título, uma frase, a grade de cards e o link do hub, no fundo da página), sem o bloco colorido, sem a contagem e sem o número de destaque; o topo da F13b fica. O prompt está em `docs/prompts/prompt-ajuste-home-cards.md`, o plano em `docs/relatorios/ajuste-home-cards-plano.md` e as decisões nas § 602 a § 616. Ponto de partida: a main em `2bd851c` (a F13b). A PR é a 28. A prévia: https://ajuste-home-cards-fileorca.vmatusita.workers.dev/

## Resumo

1. Em `/`, `/pt/` e `/es/`, cada categoria é uma seção (`section.fo-section.fo-section--cat`) com o H2, a frase, a grade `.fo-grid` com um `ToolCard` por ferramenta (ícone, nome e descrição) e o link do hub: 38 cards em en, 29 em pt e 27 em es, nas listas da F13b.
2. O topo da F13b não mudou: o HTML do `.fo-home-top` é idêntico ao do ponto de partida nos três idiomas (o H1 com 46, 29 e 35, a linha, o mar com o selo e a Oli `swim`).
3. Saíram a faixa colorida, os chips, a contagem, o número e a frase da fonte, com o `src/components/home-numbers.ts`, os campos `to`, `count`, `num` e `say` dos textos e o CSS `.fo-catband*`. Nenhuma frase do site foi escrita ou reescrita.
4. Os anúncios seguem as regras, com as seções e os cards da home como alvos dos 150 px. Com as descrições dos cards, a home tem 909, 765 e 756 palavras, e o mapa dá 5, 4 e 4 caixas de conteúdo a 360 px (eram 3) e a lateral 2 no HTML.
5. O CLS de carga continua 0 de 320 a 1280 px, e as seções, na `Figtree Steady` como o topo, não mudam de tamanho quando a Figtree chega, nem abaixo da dobra. O H1 continua o LCP a partir de 768 px, com a frase de cada seção em até 28rem. A home ficou mais longa: 15,5 telas em en a 360 × 740 (9,1 antes), registrado como escolha.

## O que mudou

- **`src/views/HomeView.astro`:** cada faixa virou `section.fo-section.fo-section--cat[aria-labelledby]`, com os ids de antes (`tools`, `pdf-home`, `money-home`, `life-home` e `qr-home`), na mesma ordem: o H2, a frase (`more`) num `p.fo-prose`, a `ul.fo-grid` com um `li > ToolCard` por ferramenta e um `p.fo-more` por link do hub (dois na de casa e saúde, nenhum na do QR). O topo, as marcas de anúncio, os guias e a privacidade não mudaram (§ 603).
- **`src/components/home-bands.ts`:** continua a fonte única das listas; cada item ganhou a descrição, e os nomes de "chip" viraram de "card" (`HomeCard`, `cards`, `CardCategory`, `homeCardPaths`). Nenhuma lista mudou (§ 605).
- **`src/components/home-numbers.ts`:** saiu. **`src/i18n/{en,pt,es}/home.ts` e `src/i18n/types.ts`:** saíram os campos `to`, `count`, `num` e `say`; o comentário do topo de cada `home.ts` diz a home de agora (§ 604 e § 611).
- **`src/styles/components.css`:** saiu o bloco `.fo-catband*`; a regra da `Figtree Steady` passou da `.fo-catband` à `.fo-section--cat` (o topo continua nela; § 607), e a `--fo-band-dark` fica para os hubs. Entrou uma regra só, a da frase da seção: `max-width: 28rem` (o LCP, § 608) e 12 px embaixo (§ 616). A grade é a `.fo-grid` dos hubs (§ 606).
- **`src/ads/map.ts`:** o `NEVER_INSIDE_CLASSES` troca `fo-catband` por `fo-section--cat`. **`scripts/lib/prontidao.ts`:** o `TOOL_LINKS` volta a `main a.fo-tool` (§ 609 e § 610).
- **Os testes:** `tests/unit/home-numbers.test.ts` virou `tests/unit/home.test.ts`; mudaram o `image-hub`, o `pdf-site`, o `hub-icons`, o `prontidao`, o `ad-map` (unidade), o `home-sea.spec.ts`, o `fo-ad-map.spec.ts` e as listas de alvos de `tests/e2e/lib/ad-map.ts` e `lib/ad-clearance.ts`; o `health-voice.test.ts` e o `scripts/screenshots.ts`, só no comentário.
- **Os documentos:** os README do `ToolCard`, do `NextStepChips`, do `AdSlot` e o `docs/design/README.md`; seções novas no fim do `docs/claude/design-e-oli.md` e do `docs/claude/anuncios.md`; a altura da home em "Registrados" do `docs/PENDENCIAS.md`; as § 602 a § 616.

Nada mudou no topo da home, nos hubs, no `src/ads/estimate.ts`, na lógica do mapa, no `PUBLIC_ADSENSE_SLOTS`, no `tool-count.ts`, no `.github/` ou nos planos. Não entrou token novo, JS nem texto do site.

## As medidas

Chromium do Playwright nesta máquina (`.cache/home-cards/measure.ts` e `lcp.ts`, fora do Git), no `dist/` do ponto de partida (montado numa worktree à parte) e no de depois. As alturas são medidas depois de recarregar a página com a Figtree no cache, para a face `optional` da `Figtree Steady` pintá-la (sem isso, a faixa da F13b em pt saía na fonte de reserva, com os 4.942 px de `<main>` do relatório da F13b).

| Medida | en antes → depois | pt antes → depois | es antes → depois |
| --- | --- | --- | --- |
| Palavras do `<main>` (a conta do `gate:prontidao`) | 565 → 909 | 512 → 765 | 524 → 756 |
| Altura da página a 360 × 740 | 6.754 px, 9,1 telas → 11.490 px, 15,5 telas | 5.838 px, 7,9 → 9.542 px, 12,9 | 5.800 px, 7,8 → 9.182 px, 12,4 |
| `<main>` a 360 | 5.682 → 10.418 px | 4.886 → 8.590 px | 4.848 → 8.230 px |
| Cards | 0 (38 chips) → 38 | 0 (29 chips) → 29 | 0 (27 chips) → 27 |
| A grade a 1280 (build padrão) | 5 por linha, 229 px; descrição de até 4 linhas | igual | igual |
| O HTML do `.fo-home-top` | idêntico (802 caracteres) | idêntico (804) | idêntico (815) |

A F10 G-02 media 10.981 px (14,8 telas) na home da F13a em en; a de agora tem 0,7 tela a mais (§ 614).

**As caixas de anúncio por largura no build de teste** (os IDs falsos das 37 unidades):

| Largura | en antes → depois | pt antes → depois | es antes → depois |
| --- | --- | --- | --- |
| 360, 412 e 459 px | 3 de conteúdo → 5 | 3 → 4 | 3 → 4 |
| 600 px | o 1º | o 1º | o 1º |
| 768 px | o 1º e o multiplex | igual | igual |
| 1280 e 1440 px | o 1º, o multiplex e a lateral | igual | igual |
| A lateral 2 no HTML (só aparece em fileorca.com) | não → sim | não → sim | não → sim |
| Topo do 1º anúncio a 360 / a 1280 | 1.402 → 2.336 / 1.008 → 1.366 | 1.440 → 2.462 / 1.064 → 1.414 | 1.462 → 2.444 / 1.086 → 1.458 |
| Menor vão entre dois de conteúdo a 360 (a 459) | 1.950 (1.836) → 1.714 (1.688) | 1.926 (1.818) → 1.964 (1.892) | 1.632 (1.544) → 1.784 (1.714) |

O `fo-ad-map.spec.ts` inteiro passou nos dois navegadores (106 testes): os 150 px de todo alvo (as seções e os cards da home entre eles), nada na primeira tela, nada dentro de seção ou de grade, 1.110 px entre dois de conteúdo, a densidade e os formatos. O `gate:prontidao` passou com os 22 itens; o "Mais conteúdo que anúncio" pede 750 palavras em en e 600 em pt e es a 360, e 600 a 1280.

**O CLS e o LCP:**

- **O CLS de carga** (Figtree segurada 600 ms; "the load moves nothing" do `home-sea.spec.ts`): 0 a 320, 360, 393, 412, 768 e 1280 px nos três idiomas, antes e depois. Esse teste só vê a primeira tela: na primeira versão, com as seções na Figtree, ele dava 0, mas abaixo da dobra as seções mudavam de 2 a 26 px de altura quando a Figtree chegava (revisão b-1). Com as seções na `Figtree Steady`, nenhuma muda, nos dois navegadores (§ 607).
- **O LCP** (`PerformanceObserver` no Chromium): a partir de 768 px, o H1 nos três idiomas (27.720, 38.556 e 39.249 px², antes e depois). A frase da seção de imagem passava o H1 em en (29.835 px²) antes do `max-width: 28rem`; com ele, 18.959. No celular, a linha do topo em en e pt, como antes; em es, a frase da seção de imagem a 360 e 412 (31.137 e 26.909 px²), onde antes era a linha do topo e a frase a mais da faixa (§ 608).

## Os testes

- **Os que mudaram,** um por um, estão na § 612: o `home-numbers.test.ts` virou `home.test.ts` (saíram as fontes dos números, o número e a frase de cada faixa e a conta das palavras; ficaram o H1, os textos sem dígito, as listas, os links e a frase do dinheiro), e o `image-hub`, o `pdf-site`, o `hub-icons`, o `prontidao`, o `ad-map`, o `home-sea.spec.ts` (o escuro, só nos hubs) e o `fo-ad-map.spec.ts` (o caso `home` com as caixas medidas e o mar) leem os cards e as seções.
- **Os novos** (§ 613): no `home.test.ts`, "shows in each category section one ToolCard per tool of its list, with the H3 of the name, the description and the icon, and no band, chip or number of the F13b in <main>"; no `home-sea.spec.ts`, "at 360 px / at 1280 px: the cards of each category section have one height per row and stay in the column" (reforçado pela revisão d-1: o texto que passa a borda do card também reprova) e "the category sections keep their size when Figtree arrives late, below the fold too" (revisão b-1), nos dois navegadores.
- **Os controles negativos**, cada um contra o ponto de partida:
  - o teste novo do `home.test.ts`, com `FO_HOME_DIST` no `dist/` do ponto de partida: reprova com `AssertionError: en: expected [] to deeply equal [ 'tools', 'pdf-home', …(3) ]` (e os dois testes que mudaram de seletor também reprovam lá);
  - os testes novos do `home-sea.spec.ts`, com o `dist/` do ponto de partida servido na porta 4380 (`FO_PORT=4380`): os 4 reprovam (Chromium e WebKit, 360 e 1280), com `Error: / a 360 … - Array [ "tools", "pdf-home", … + Array []`;
  - o caso novo do `prontidao.test.ts` e o do `ad-map.test.ts`, rodados com o código do ponto de partida (na worktree dele): reprovam com `expected '' to match /faltam os cartões…/` e `expected '' to match /dentro de section\.fo-section\.fo-sec…/`;
  - o teste da Steady, contra o `dist/` do commit revisado (`edbf7ad`, as seções na Figtree): reprova nos dois navegadores com "/es/ a 320, seção 2: 2602 → 2576 px" e mais sete; contra o ponto de partida, pelo tempo (não há seção a esperar);
  - o teste da grade reforçado, contra o mutante da lente d (`.fo-tool { height: 100px; display: block }` injetado num `dist/` copiado): reprova a 360 e a 1280 ("/ a 360 tools … Expected: 0 Received: 1"); a versão de antes do reforço passava.
- **Os specs que a mudança toca**, nos dois navegadores, antes do `verificar`: o `home-sea.spec.ts` (32 testes), o `fo-ad-map.spec.ts` inteiro (106), o `design.spec.ts` e o `layout-shift.spec.ts` inteiros (274), o axe da home nos três idiomas e o teste das páginas livres do `ads.spec.ts` (20). Depois da margem da frase (§ 616), de novo o `home-sea.spec.ts` e os testes da home do `fo-ad-map.spec.ts` (72); depois da Steady nas seções, o `home-sea.spec.ts` inteiro (34) e os testes da home do `fo-ad-map.spec.ts` com os de primeira visita do `layout-shift.spec.ts` (106). Todos passaram. O `pnpm tipos`, o `pnpm lint`, o `gate:prontidao` (22 itens) e o `lint:texto` (0 erro de gramática e 12 avisos, o ruído de sempre: o `{n}` lido como "n" e o nome FileOrca) também.
- **Os números:** o Vitest foi de 130 arquivos e 2.069 testes para 130 arquivos e 2.066 testes (saíram 4 testes da home e entrou 1). O `--list` do Playwright foi de 2.201 para 2.204 testes por navegador, em 71 arquivos (os 2 testes novos da grade e o da Steady).

## As imagens

10 imagens em `docs/relatorios/ajuste-home-cards/`, JPG de qualidade 80, tiradas do `dist/` com o Chromium do Playwright, a 1x e com movimento reduzido (`.cache/home-cards/shots.ts`, fora do Git). Cada uma tem duas telas de altura; as de 360 px começam na primeira seção de categoria (o topo não mudou), e a de 1280 px, no alto da página:

- `home-en-360-antes.jpg` e `home-en-360-depois.jpg`;
- `home-en-1280-antes.jpg` e `home-en-1280-depois.jpg`;
- `home-en-360-dark-antes.jpg` e `home-en-360-dark-depois.jpg`;
- `home-pt-360-antes.jpg` e `home-pt-360-depois.jpg`;
- `home-es-360-antes.jpg` e `home-es-360-depois.jpg`.

## O `pnpm verificar --partes`

Uma vez, sobre o `a5fb3bb` (o código final; depois dele só mudaram documentos), na máquina Windows, das 13:49 às 14:44. As 21 partes passaram:

| Parte | O que roda | Tempo |
| --- | --- | ---: |
| 1 | build | 34,1 s |
| 2 | portões: tipos 11,8 s, lint 5,3 s, Vitest 37,9 s (130 arquivos, 2.066 testes), conteúdo 35,4 s, prontidão 36,7 s, licenças 7,5 s, `lint:texto` 6,3 s e os outros sete, todos `ok` | 147,4 s |
| 3 | Lighthouse CI | 395,2 s |
| 4 a 8 | Playwright no Chromium, partes 1 a 5 (441, 441, 441, 441 e 440 testes) | 181,8, 272,4, 211,0, 197,4 e 159,8 s |
| 9 a 21 | Playwright no WebKit, partes 1 a 13 (170, 172, 168, 170, 170, 171 e 1 pulado, 169, 168, 169 e 2 pulados, 167, 169 e 4 pulados, 165 e 169 testes) | 70,0, 132,7, 126,0, 387,9, 32,0, 178,9, 100,5, 82,6, 83,0, 181,1, 110,3, 78,7 e 103,5 s |

A soma das partes é 3.266,5 s (54,4 min), e a maior é a do Lighthouse, com 395,2 s, abaixo dos 900 s. São 2.204 testes do Playwright em cada navegador, todos verdes, sem `flaky`. Os 7 pulados do WebKit são os testes de CLS de interação que só o Chromium mede (`guide-page`, `money-card` e `pdf-merge`, com `test.skip(browserName !== 'chromium')`), que a run não tocou.

## O custo

A última execução do CI antes deste relatório foi a leve do `a5fb3bb` (`pnpm ci:custo 42255054065`): 4 minutos cobrados, 2,5 min de parede e 3 jobs rodados (7 pulados). O `verificar --leve` levou 94,1 s. A execução completa sai do `gh pr ready`, depois deste commit, e o custo dela vai para a descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo, sobre o commit `edbf7ad` numa worktree só de leitura, um cético por achado médio ou acima e um para os baixos (regra 3: o ajuste mexe nos alvos de anúncio). O detalhe está em `docs/relatorios/REVISAO-ajuste-home-cards.md`.

- **Nenhum alto nem médio.** As lentes acharam 4 baixos, e o cético refutou os 4.
- **Dois refutados foram corrigidos mesmo assim,** porque apontavam algo real: as seções mudavam de altura abaixo da dobra quando a Figtree chegava (b-1; as seções passaram à `Figtree Steady`, § 607, com um teste novo), e o teste da grade não pegava o texto que sai por baixo do card (d-1; reforçado, § 613).
- **Os outros dois ficam:** as seções "PENDENTE" do relatório eram o estado esperado do commit revisado (e-1), e a fixture do `prontidao.test.ts` com a marcação da F13b é de propósito (e-2, § 610).
- **A segunda passada:** as lentes (b) e (d), em contexto limpo, leram o diff das correções (`edbf7ad..a5fb3bb`) e não acharam defeito: as duas correções reprovam nos mutantes (as seções de volta na Figtree; o card de 100 px) e passam no código, nos dois navegadores.

## As decisões novas

- § 602: a escolha do Victor, a home volta à grade de cards da F13a (o que deixa de valer das § 567 a § 571, § 573, § 578 e § 591, e o que continua).
- § 603: as seções de categoria da home.
- § 604: o que sai (a faixa, os chips, a contagem, o número e a frase da fonte).
- § 605: o `home-bands.ts` continua a fonte das listas, agora de cards.
- § 606: a grade é a `.fo-grid` de hoje.
- § 607: a fonte das seções, a `Figtree Steady`, como o topo (revisão b-1).
- § 608: o LCP com os cards (a frase da seção em até 28rem).
- § 609: os anúncios da home com os cards.
- § 610: o `gate:prontidao` lê os cards.
- § 611: os textos, só saem campos.
- § 612: os testes antigos que mudaram, no formato da § 341.
- § 613: os testes novos e os controles negativos.
- § 614: a altura da home em telas.
- § 615: os documentos.
- § 616: a frase da seção guarda 12 px da grade.

## Os desvios

- **A home ficou mais longa** (15,5 telas em en a 360 × 740, contra 9,1 na F13b e 14,8 na F13a): é a consequência da escolha, registrada em "Registrados" do `docs/PENDENCIAS.md` (§ 614).
- **Mais anúncios no celular e a lateral 2 de volta:** com as descrições dos cards, o mapa dá 5 caixas de conteúdo a 360 px em en e 4 em pt e es (eram 3), e a lateral 2 entra no HTML (§ 609). Todas as regras de anúncio passam; o número é consequência das palavras, não uma posição nova.
- **Uma regra de CSS que a F13a não tinha:** a frase da seção tem `max-width: 28rem` e 12 px embaixo (§ 608 e § 616). Sem a primeira, o H1 deixava de ser o LCP em en; sem a segunda, a frase encostava nos cards.
- **Um `fo-catband` fica em `tests/`,** fora do teste que confere que a home não o tem: a fixture do `prontidao.test.ts` que prova que o portão não conta mais o chip de uma faixa (§ 610).

## O que fica para o Victor

1. `git pull` e conferir a home nos três idiomas no celular e no computador, na prévia ou no fileorca.com depois do deploy (o topo igual, as seções de cards embaixo).
2. Se a home longa incomodar, a saída mais simples é mostrar menos cards por seção na home (por exemplo, os 6 mais usados de cada categoria e o link do hub), o que pediria uma decisão sobre as listas.
