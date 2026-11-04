# F11 · Navegação, guias e tema claro e escuro (relatório)

Run F11 do `PLANO-MELHORIAS.md`, com os dois desenhos já escolhidos: o cabeçalho A (o Menu de papel, UX-01) e o hub de guias A, com o GuideCard (UX-02). A ficha está em `docs/prompts/prompt-fase-11.md` e o plano em `docs/relatorios/fase-11-plano.md`. Ponto de partida: a main em `609a868`. A prévia: https://fase-11-fileorca.vmatusita.workers.dev/

## Resumo

1. Toda página, nos três idiomas, ganhou no cabeçalho um botão de tema (Sistema → Claro → Escuro) e um botão Menu, que abre uma folha de papel sem JS com as categorias do idioma e as contagens, o QR code, os Guias e o "Apoie a Oli".
2. A escolha do tema fica só no aparelho (`fo-theme`, `light` ou `dark`) e já vale na primeira pintura, sem piscar, em toda página e offline; a Privacidade diz isso nos três idiomas.
3. Os guias ganharam uma casa: `/guides/`, `/pt/guias/` e `/es/guias/`, com os guias em grupos de Imagem, PDF e Dinheiro, cada um num GuideCard que diz o que foi medido.
4. Toda entrada leva a eles: a trilha Início › Guias › guia, a coluna Guias no rodapé, o GuideCard no fim do "Como usar" de cada ferramenta e calculadora com guia, os guias das relacionadas, a busca em dois grupos e a seção "Leia um guia" na home.
5. Nenhum JS novo por página, nenhuma requisição a mais, nada na URL nem no GA4, nenhum anúncio novo e `src/ads/` intacto.

## Como a run foi feita

- **O plano** (`docs/relatorios/fase-11-plano.md`) dividiu o trabalho em fatias, com os § reservados de antemão (§ 382):
  - o agente principal fez a documentação da F10 e os ícones (decisões 12 e 4);
  - um agente Opus (G1) criou a rota do hub;
  - a partir do commit dele, dois agentes Opus trabalharam ao mesmo tempo, cada um na sua worktree: um no tema, no cabeçalho e na Privacidade (T, decisões 2 e 3), o outro no GuideCard, nos cartões do hub e nas entradas (G2, decisões 5 a 7);
  - o agente principal juntou as três branches (§ 401), fez o `docs/design/`, os § e o `docs/PENDENCIAS.md`, as medidas, as imagens e a revisão.
- **O ponto de partida** foi medido antes de mudar código, numa worktree no `609a868`: o build, o orçamento (`.cache/f11/antes/budgets.log`), os nomes dos JS e o número de testes. As provas de "reprova sem a mudança" rodaram contra uma cópia desse `dist/`.
- **A válvula não foi usada:** a seção de guias da home entrou.

## O que entrou, por decisão

- **Decisão 2, o tema** (§ 385, § 386 e § 387):
  - os dois scripts inline estão em `src/platform/theme.ts`. O `themeBootstrap()` fica no `<head>`, depois da `<meta name="color-scheme">` e antes de todo CSS. O `themeToggle()` fica logo depois do `</header>`. Juntos, dão 376 bytes com gzip;
  - o `<head>` e o lugar dos scripts estão no `src/layouts/BaseLayout.astro`, e o botão no `src/components/Header.astro`;
  - o CSS já tinha o par `data-theme` de toda regra `prefers-color-scheme`, e o `tests/unit/theme-pair.test.ts` passou a conferir isso;
  - a Privacidade fala do tema nos três idiomas (`src/i18n/{en,pt,es}/privacy.ts`): a chave `fo-theme`, os valores `light` e `dark`, que Sistema apaga a chave, que nada sai do aparelho, e o tempo de guarda.
- **Decisão 3, o cabeçalho e o Menu** (§ 388, § 389 e § 390):
  - a marcação está no `src/components/Header.astro`, e o bloco do cabeçalho do `src/styles/components.css` foi reescrito no lugar;
  - as linhas da folha, as contagens (lidas dos registros), o mapa de cada rota para uma seção e o `aria-current` saem de `src/components/header-menu.ts`;
  - o "Apoie a Oli" manda `donate_click` com o lugar `menu`, que entrou em `DONATE_PLACES` (`src/analytics/events.ts`);
  - um desvio da especificação, registrado na § 388: abaixo de 768 px, os três idiomas ficam numa linha só, para a folha terminar a 150 px ou mais do primeiro AdSlot.
- **Decisão 4, os ícones** (§ 384): `menu`, `sun`, `moon`, `theme-system` e `book` estão em `docs/design/assets/Icons/` e no `ICON_NAMES` (`src/icons/svg.ts`), e são 44 ícones agora.
- **Decisão 5, o hub de guias** (§ 393 e § 394):
  - a rota `guides` (`GUIDES_HUB_ID` em `src/tools/guides/registry.ts`, `src/i18n/routes.ts`) e as páginas `src/pages/guides/`, `src/pages/pt/guias/` e `src/pages/es/guias/`;
  - a view `src/views/GuidesHubView.astro`, os dados em `src/tools/guides/hub.ts` e os textos em `src/i18n/<lang>/guides.ts`;
  - a imagem OG está em `src/seo/images.ts` e `src/pages/og/[lang]/[id].png.ts`, e o schema e o sitemap em `scripts/lib/seo-pages.ts`;
  - a regra 7 do `gate:conteudo`, com os controles negativos, está em `scripts/lib/conteudo.ts`.
- **Decisão 6, o GuideCard** (§ 395): `src/components/GuideCard.astro` e os dados em `src/tools/guides/card.ts`. "Measured on N test files" conta os arquivos distintos do `data/guides-measured.json`, e os guias de dinheiro dizem "Numbers worked out". O README e o preview estão em `docs/design/components/GuideCard/`.
- **Decisão 7, as entradas** (§ 396, § 397 e § 398):
  - **a trilha** Início › Guias › guia nas 40 páginas de guia: `src/views/FileGuideView.astro` e `src/views/GuideView.astro`, no HTML e no `BreadcrumbList`;
  - **o rodapé:** a coluna Guias embaixo de Utilidades, em `src/components/Footer.astro`;
  - **o GuideCard --here** no fim do "Como usar": nos moldes `src/tools/image/ImageToolPage.astro`, `src/tools/pdf/PdfToolPage.astro` e `src/tools/calc/CalcTool.astro`, não nas ilhas nem no motor. São 39 páginas e 42 cartões, e a linha "Read the guide" saiu;
  - **as relacionadas:** os guias com o GuideCard, nunca com o ToolCard (`src/tools/guides/page.ts`, `RelatedCard`). Isso fecha a F5b F-12;
  - **a busca** em dois grupos, Ferramentas e Guias (`src/components/SearchBox.astro`, `src/search/search.ts`, `src/pages/search-index.json.ts`, com `kind`);
  - **a home:** a seção "Leia um guia" com o `HOME_GUIDES` (`src/views/HomeView.astro`, `src/tools/guides/hub.ts`).
- **Decisão 8, o `docs/design/`** (§ 402): o README do sistema (o tema), o Header (README, preview e `bundle.css`), o GuideCard, os README do Footer, do Breadcrumb e do ToolSearch, e os ícones.
- **A revisão adversarial** (§ 404 e § 405), em cima das decisões 2 e 3:
  - com cores forçadas, a seção e o idioma em uso do Menu, e o do menu de idioma, ganham um sublinhado de 3 px;
  - as linhas da folha do Menu passaram de 52 para 48 px (o `tap-min`), um desvio da especificação: de 390 a 767 px, a folha ficava a 146,5 px do 1º AdSlot do Merge PDF e do Unlock PDF;
  - o tema escuro vale só na tela (`@media screen`), e a impressão sai sempre clara;
  - o clique ou o toque que fecha um menu não chega mais à página embaixo (a DropZone abria o seletor de arquivos), só com CSS;
  - o `bundle.css` e o README do Header acompanham.
- **Decisão 12, a documentação da F10** (§ 383): os cinco blocos da F10 estão no `docs/claude/`, com o texto igual. O grupo 19 entrou no `docs/PENDENCIAS.md`, e o Resumo, que estava errado, foi corrigido; um teste agora o confere.
- **Decisão 13, a PR e o CI** (§ 401 e o fim deste relatório).

## A evidência, critério por critério

As saídas abaixo são do build do merge (`cc008df`), dos commits seguintes e do `pnpm verificar --partes` no último commit de código, na máquina local. As saídas completas estão em `.cache/f11/depois/`, fora do Git.

1. **O cabeçalho em toda página.**
   - O `tests/e2e/header-links.spec.ts` lê o HTML das 211 páginas do mapa de rotas, nos dois navegadores, e confere:
     - a folha do Menu, com os hubs do idioma na ordem;
     - o `aria-current="page"` no próprio hub;
     - os idiomas;
     - a ordem do `<head>`;
     - o script do botão logo depois do `</header>`.
   - O `tests/e2e/header-menu.spec.ts`, com 52 testes por navegador, cobre os moldes nos três idiomas, a abertura pelo clique e pelo teclado, o Esc e o foco, um menu fechando o outro, as cores forçadas (o peso e o sublinhado), o clique e o toque que fecham um menu sem chegar à página, e as 21 medidas da Figtree.
   - Os dois rodaram verdes na execução conjunta e no `verificar --partes` do fim.
2. **O hub de guias.**
   - Os portões:
     - `seo: ok, 202 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps`;
     - `links: ok, 14992 links internos em 211 páginas, nenhuma órfã`;
     - `conteúdo: ok, … 3 do hub de guias`, com `palavras próprias do hub de guias: en 91, pt 108, es 97`.
   - Os testes: o `tests/unit/guides-hub-route.test.ts` (rota, sitemap, canonical, `hreflang` com `x-default`, OG de 1200 × 630, `CollectionPage`, `BreadcrumbList` e zero anúncio) e o `tests/e2e/guides-hub.spec.ts`, nos dois navegadores.
   - A dobra: a 360 × 740, o nome do primeiro cartão fica acima de 740 px nos três idiomas, também com uma linha a mais no título (§ 408).
   - O controle negativo da regra nova do `gate:conteudo` está no `tests/unit/conteudo.test.ts`: o site falso fica verde e depois vermelho em pt e es.
3. **As entradas.**
   - O `tests/unit/guides-entries.test.ts` confere:
     - o bloco Guias no rodapé das 211 páginas;
     - os 42 cartões --here das 39 páginas, contra os registros, sem a linha antiga;
     - nenhum guia com o ToolCard em todo o HTML do `dist/` (no ponto de partida, eram 108 cartões de guia com o ToolCard);
     - o índice da busca com `kind`;
     - a seção da home.
   - O `tests/e2e/guides-search.spec.ts` confere os dois grupos com nome, a ordem e as setas entre os grupos.
4. **O tema.**
   - Os testes: o `tests/unit/theme-script.test.ts` (11), o `tests/unit/theme-pair.test.ts` (7, com os controles negativos), o `tests/e2e/header-theme.spec.ts` (15 por navegador) e o `tests/e2e/header-theme-offline.spec.ts` (1 por navegador).
   - O que eles cobrem:
     - o primeiro quadro de 9 moldes no tema guardado, com o sistema no esquema oposto;
     - a escolha entre páginas e idiomas;
     - Sistema apagando a chave;
     - o armazenamento bloqueado;
     - nada mandado;
     - o offline com o service worker;
     - a impressão no tema claro, com o Escuro guardado e com Sistema num sistema escuro (§ 404).
   - Na execução conjunta, o primeiro quadro do `/merge-pdf/` reprovou uma vez no Chromium e não se repetiu em 324 execuções (§ 401, F11 p-2). A causa apareceu na revisão (§ 405): numa falha igual do axe do cabeçalho, o trace mostrou a folha de estilo recusada pela rede da máquina carregada (`net::ERR_NO_BUFFER_SPACE`, do Windows), e uma sonda com a folha abortada dá o mesmo quadro. Não é o tema.
5. **A acessibilidade.**
   - O `tests/e2e/header-axe.spec.ts` roda o axe em 13 páginas, com o Menu aberto e o botão nos três estados, a 360 e a 1280 px, nos dois navegadores.
   - O `a11y.spec.ts` inteiro (261 por navegador) rodou verde na execução conjunta e no `verificar --partes` do fim, com o hub e os 40 guias.
   - O `tests/unit/contrast.test.ts` confere os pares novos: o traço sobre `brand-soft` e as cores do GuideCard.
6. **O orçamento.**
   - O `budgets.spec.ts` e o `i18n-budgets.spec.ts`, no Chromium: `342 passed (1.7m)`.
   - A comparação com o ponto de partida: `antes 180 páginas, depois 183; maior aumento +0.3 KB; maior JS inicial 51.9 KB; faltando 0` e `arquivos e requisições iguais em toda página, aumento <= 1 KB`. A tabela completa vem abaixo.
   - Os 66 nomes de `dist/_astro/*.js`, sem o hash, são iguais aos do ponto de partida.
   - O chunk da busca foi de 1.321 para 1.455 bytes com gzip (+134 B) e só carrega no primeiro uso, como o `guides-search.spec.ts` confere.
7. **O cabeçalho e o CLS.**
   - O `layout-shift.spec.ts` está verde nos dois navegadores, com os três hubs e 17 páginas da borda. O `[cls]` dos hubs dá 0,000 de 320 a 412 px.
   - A tabela da altura do cabeçalho vem abaixo. A 1280 px, o último botão termina em x 794 e a lateral começa em x 944: 150 px. A folha aberta vai até x 794, e o logo fica na coluna, em x 36.
8. **O anúncio.**
   - O bloco "the header and its open menus stay 150px…" do `ads.spec.ts` percorre as 178 páginas com área de anúncio, a 360, a 767 e a 1280 px, com o Menu e o menu de idioma abertos. Abaixo de 768 px, todo AdSlot fica a 178,5 px ou mais da folha aberta (§ 404), e a 1280 px a lateral fica a 150 px do último botão e da folha.
   - O hub está na lista sem anúncio, e cada página dessa lista responde 200.
   - `git diff --stat origin/main...HEAD -- src/ads` sai vazio, assim como `src/sw`, `scripts/guides`, `.github`, o `CLAUDE.md`, os dois PLANOs, `docs/adr`, `docs/propostas`, o `package.json` e o `pnpm-lock.yaml`. O `_headers` não tem COOP nem COEP.
9. **O Lighthouse:** no `pnpm verificar --partes`, abaixo, com o `/guides/` no `lighthouserc.json`.
10. **Os textos:**
    - `lint:texto: 18 arquivo(s), 1218 textos, 0 erro(s) de gramática, 240 aviso(s)`;
    - `english-leak.test.ts` e `glossary.test.ts`: `22 passed`.
11. **A documentação:**
    - os blocos da F10 e as pegadinhas da F11 estão no `docs/claude/`;
    - no `docs/PENDENCIAS.md`, a F5b F-12, a F10 p-1 e a F10 p-20 foram para "Já corrigidos", a F10 p-5 ficou com o que sobra para a F12, e o grupo 20 entrou;
    - o `pendencias.test.ts` passa;
    - o `docs/design/` tem o Header, a linha do tema, o GuideCard e os 44 ícones;
    - os § vão do 382 ao 408.
12. **Os testes:** as contagens e os testes antigos que mudaram estão na seção seguinte.

## O orçamento

O `budgets.spec.ts` e o `i18n-budgets.spec.ts` medem 183 páginas (180 no ponto de partida, mais os três hubs). A comparação com o ponto de partida (`.cache/f11/antes/budgets.log` contra `.cache/f11/depois/budgets.log`):

```text
antes 180 páginas, depois 183; maior aumento +0.3 KB; maior JS inicial 51.9 KB; faltando 0
arquivos e requisições iguais em toda página, aumento <= 1 KB
```

- O mesmo número de arquivos JS e de requisições em toda página que já existia. O aumento é o dos dois scripts inline do tema (376 bytes com gzip): de +0,2 a +0,3 KB de JS inicial.
- Os três hubs novos: `/guides/` 4,2 KB, `/pt/guias/` 4,1 KB e `/es/guias/` 4,4 KB, todos com 0 arquivo JS e 4 requisições.
- O CSS continua num arquivo só: de 13,1 para 14,0 KB com gzip (lente c da revisão), sem orçamento próprio.
- As correções da revisão só mexeram em CSS: nenhum JS nem requisição mudou depois da tabela.

<details>
<summary>A tabela de toda página medida (antes e depois)</summary>

| Página | Antes | Depois | Δ KB |
| --- | --- | --- | --- |
| /compress-image/to-1mb/ | 21.9 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.3 |
| /es/comprimir-imagen/ | 22.2 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.2 |
| /pt/comprimir-imagem/ | 22.2 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.2 |
| /compress-image/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /compress-image/to-100kb/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /resize-image/ | 22.4 KB, 2 JS, 6 req | 22.6 KB, 2 JS, 6 req | +0.2 |
| /resize-image/youtube-thumbnail/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /rotate-image/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /crop-image/ | 24.3 KB, 2 JS, 6 req | 24.6 KB, 2 JS, 6 req | +0.3 |
| /heic-to-jpg/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /webp-to-jpg/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /png-to-jpg/ | 21.9 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.3 |
| /image-to-pdf/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /image-tools/ | 3.6 KB, 0 JS, 4 req | 3.8 KB, 0 JS, 4 req | +0.2 |
| /qr-code-generator/ | 32.2 KB, 2 JS, 6 req | 32.5 KB, 2 JS, 6 req | +0.3 |
| /money-calculators/ | 3.9 KB, 0 JS, 4 req | 4.2 KB, 0 JS, 4 req | +0.3 |
| /pdf-tools/ | 3.7 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.2 |
| /home-calculators/ | 3.7 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.2 |
| /health-calculators/ | 3.7 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.2 |
| /guides/ | (nova) | 4.2 KB, 0 JS, 4 req | |
| /mortgage-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /personal-loan-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /auto-loan-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /refinance-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /home-affordability-calculator/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /loan-amortization-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /credit-card-payoff-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /rent-vs-buy-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /debt-payoff-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /debt-consolidation-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /compound-interest-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /savings-goal-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /simple-interest-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /mortgage-calculator/biweekly/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /apr-to-apy-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /mortgage-calculator/extra-payments/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /mortgage-calculator/15-vs-30-year/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /loan-amortization-calculator/balloon-payment/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /guides/15-vs-30-year-mortgage/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /guides/extra-mortgage-payments/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /guides/debt-snowball-vs-avalanche/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /guides/refinance-break-even/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /guides/rent-vs-buy-break-even/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /square-footage-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /concrete-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /paint-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /mulch-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /tile-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /btu-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /bmi-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /calorie-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /ovulation-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /body-fat-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /due-date-calculator/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /merge-pdf/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /split-pdf/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /pdf-to-jpg/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /compress-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /rotate-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /delete-pdf-pages/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /add-page-numbers-to-pdf/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /sign-pdf/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /protect-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /unlock-pdf/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /reorder-pdf-pages/ | 38.2 KB, 2 JS, 6 req | 38.4 KB, 2 JS, 6 req | +0.2 |
| /watermark-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /guides/heic-to-jpg-on-windows/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /guides/why-is-my-pdf-so-large/ | 38.3 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.2 |
| /guides/social-media-image-sizes/ | 22.5 KB, 2 JS, 6 req | 22.7 KB, 2 JS, 6 req | +0.2 |
| /guides/open-webp-save-as-jpg/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /guides/jpg-vs-png/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /guides/remove-location-from-photos/ | 22.5 KB, 2 JS, 6 req | 22.7 KB, 2 JS, 6 req | +0.2 |
| /guides/pdf-to-jpg-resolution/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /guides/split-pdf-file-size/ | 38.3 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.2 |
| /guides/combine-pdfs-on-phone/ | 38.3 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.2 |
| /guides/photos-to-one-pdf/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /pt/redimensionar-imagem/ | 22.4 KB, 2 JS, 6 req | 22.7 KB, 2 JS, 6 req | +0.3 |
| /pt/cortar-imagem/ | 24.4 KB, 2 JS, 6 req | 24.6 KB, 2 JS, 6 req | +0.2 |
| /pt/girar-imagem/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /pt/heic-para-jpg/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /pt/webp-para-jpg/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /pt/png-para-jpg/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /pt/imagem-para-pdf/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /pt/comprimir-imagem/para-100kb/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /pt/comprimir-imagem/para-1mb/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /pt/redimensionar-imagem/miniatura-youtube/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /es/recortar-imagen/ | 24.4 KB, 2 JS, 6 req | 24.6 KB, 2 JS, 6 req | +0.2 |
| /es/redimensionar-imagen/ | 22.4 KB, 2 JS, 6 req | 22.7 KB, 2 JS, 6 req | +0.3 |
| /es/rotar-imagen/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /es/heic-a-jpg/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /es/png-a-jpg/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /es/webp-a-jpg/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /es/imagen-a-pdf/ | 22.1 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.2 |
| /es/comprimir-imagen/a-100kb/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /es/redimensionar-imagen/miniatura-youtube/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /es/comprimir-imagen/a-1mb/ | 22 KB, 2 JS, 6 req | 22.2 KB, 2 JS, 6 req | +0.2 |
| /pt/gerador-de-qr-code/ | 32.3 KB, 2 JS, 6 req | 32.5 KB, 2 JS, 6 req | +0.2 |
| /es/generador-de-codigo-qr/ | 32.3 KB, 2 JS, 6 req | 32.5 KB, 2 JS, 6 req | +0.2 |
| /pt/dividir-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/juntar-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/pdf-para-jpg/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/comprimir-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/excluir-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/girar-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/numerar-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/assinar-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/proteger-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/desbloquear-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/organizar-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /pt/marca-dagua-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/unir-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/dividir-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/pdf-a-jpg/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/comprimir-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/rotar-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/eliminar-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/numerar-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/firmar-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/proteger-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/desbloquear-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/ordenar-paginas-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/marca-de-agua-pdf/ | 38.2 KB, 2 JS, 6 req | 38.5 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-hipoteca/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-prestamo-personal/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-prestamo-para-auto/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-refinanciamiento/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-cuanta-casa-puedo-pagar/ | 51.7 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.2 |
| /es/calculadora-de-amortizacion-de-prestamos/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-tarjeta-de-credito/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-deudas/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /es/calculadora-de-consolidacion-de-deudas/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-alquilar-o-comprar/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-interes-compuesto/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-meta-de-ahorro/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-interes-simple/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-apr-a-apy/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-hipoteca/pagos-adicionales/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-hipoteca/pagos-cada-dos-semanas/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-hipoteca/15-o-30-anos/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/calculadora-de-amortizacion-de-prestamos/pago-global/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/guias/hipoteca-a-15-o-30-anos/ | 51.6 KB, 2 JS, 6 req | 51.8 KB, 2 JS, 6 req | +0.2 |
| /es/guias/bola-de-nieve-o-avalancha/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/guias/pagos-adicionales-a-la-hipoteca/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/guias/punto-de-equilibrio-del-refinanciamiento/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/ | 51.7 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.2 |
| /pt/simulador-sac-price/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/simulador-financiamento-veiculo/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/simulador-emprestimo/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/amortizacao-antecipada/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/calculadora-cartao-de-credito/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/calculadora-de-dividas/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/calculadora-juros-compostos/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/alugar-ou-comprar/ | 51.6 KB, 2 JS, 6 req | 51.9 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/heic-para-jpg-no-windows/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/por-que-meu-pdf-esta-tao-grande/ | 38.4 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.2 |
| /pt/guias/tamanhos-de-imagem-para-redes-sociais/ | 22.5 KB, 2 JS, 6 req | 22.8 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/abrir-webp-e-salvar-como-jpg/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/jpg-ou-png/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/remover-localizacao-das-fotos/ | 22.6 KB, 2 JS, 6 req | 22.8 KB, 2 JS, 6 req | +0.2 |
| /pt/guias/resolucao-de-pdf-para-jpg/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/dividir-pdf-e-tamanho-do-arquivo/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/juntar-pdfs-no-celular/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /pt/guias/fotos-em-um-pdf/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /es/guias/heic-a-jpg-en-windows/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /es/guias/por-que-mi-pdf-pesa-tanto/ | 38.4 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.2 |
| /es/guias/tamanos-de-imagen-para-redes-sociales/ | 22.5 KB, 2 JS, 6 req | 22.8 KB, 2 JS, 6 req | +0.3 |
| /es/guias/abrir-webp-y-guardar-como-jpg/ | 22.2 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.2 |
| /es/guias/jpg-o-png/ | 22 KB, 2 JS, 6 req | 22.3 KB, 2 JS, 6 req | +0.3 |
| /es/guias/quitar-la-ubicacion-de-las-fotos/ | 22.6 KB, 2 JS, 6 req | 22.8 KB, 2 JS, 6 req | +0.2 |
| /es/guias/resolucion-de-pdf-a-jpg/ | 38.4 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.2 |
| /es/guias/dividir-pdf-y-tamano-del-archivo/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /es/guias/unir-pdf-en-el-celular/ | 38.3 KB, 2 JS, 6 req | 38.6 KB, 2 JS, 6 req | +0.3 |
| /es/guias/fotos-en-un-solo-pdf/ | 22.1 KB, 2 JS, 6 req | 22.4 KB, 2 JS, 6 req | +0.3 |
| /pt/ferramentas-de-imagem/ | 3.6 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.3 |
| /pt/ferramentas-pdf/ | 3.7 KB, 0 JS, 4 req | 4 KB, 0 JS, 4 req | +0.3 |
| /pt/calculadoras-financeiras/ | 3.8 KB, 0 JS, 4 req | 4 KB, 0 JS, 4 req | +0.2 |
| /pt/guias/ | (nova) | 4.1 KB, 0 JS, 4 req | |
| /es/herramientas-de-imagen/ | 3.6 KB, 0 JS, 4 req | 3.8 KB, 0 JS, 4 req | +0.2 |
| /es/herramientas-pdf/ | 3.7 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.2 |
| /es/calculadoras-financieras/ | 4 KB, 0 JS, 4 req | 4.2 KB, 0 JS, 4 req | +0.2 |
| /es/guias/ | (nova) | 4.4 KB, 0 JS, 4 req | |
| /pt/apoie/ | 3.6 KB, 0 JS, 4 req | 3.9 KB, 0 JS, 4 req | +0.3 |
| /es/apoyo/ | 3.3 KB, 0 JS, 4 req | 3.6 KB, 0 JS, 4 req | +0.3 |

</details>

## A altura do cabeçalho

O `header-menu.spec.ts` mede o cabeçalho em 7 larguras, nos 3 idiomas e nos 2 navegadores, com a Figtree segura até a primeira pintura e depois solta. Em todas as 84 combinações, o cabeçalho tem 64 px e uma linha, antes e depois da fonte, e nenhum controle muda de largura. Cada célula diz quanto os controles ocupam da largura útil (a do cabeçalho menos o padding), em px:

| Largura | en | pt | es | Controles |
| ---: | --- | --- | --- | ---: |
| 320 | 282.5 de 288.0 | 282.5 de 288.0 | 282.5 de 288.0 | 4 |
| 360 | 294.5 de 328.0 | 294.5 de 328.0 | 294.5 de 328.0 | 4 |
| 390 | 294.5 de 358.0 | 294.5 de 358.0 | 294.5 de 358.0 | 4 |
| 412 | 294.5 de 380.0 | 294.5 de 380.0 | 294.5 de 380.0 | 4 |
| 768 | 608.2 de 736.0 (WebKit 612.6) | 654.5 de 736.0 (WebKit 659.0) | 663.0 de 736.0 (WebKit 667.5) | 5 |
| 1024 | 608.2 de 992.0 (WebKit 612.6) | 654.5 de 992.0 (WebKit 659.0) | 663.0 de 992.0 (WebKit 667.5) | 5 |
| 1280 | 608.2 de 758.0 (WebKit 612.6) | 654.5 de 758.0 (WebKit 659.0) | 663.0 de 758.0 (WebKit 667.5) | 5 |

- Abaixo de 360 px, o vão entre os controles fecha para 4 px: o logo, a busca, o tema e o Menu ocupam 282,5 de 288 px a 320.
- A partir de 768 px, o idioma entra e são 5 controles; o WebKit mede 4,4 a 4,5 px a mais no texto do botão de idioma, e cabe com folga.
- A 1280 px, nos 3 idiomas e nos 2 navegadores: o logo em x 36 (o começo da coluna), o último botão termina em x 794 (o fim da coluna), e a lateral começa em x 944, a 150 px. A folha aberta vai de x 434 a x 794, com 449 px de altura em inglês e 349 px em português e espanhol (481 e 373 com as linhas de 52 px de antes da revisão).

## Os testes

| | Ponto de partida (`609a868`) | Fim |
| --- | --- | --- |
| Vitest | 102 arquivos, 1.750 testes | 109 arquivos, 1.833 testes |
| Playwright `--list`, por navegador | 1.428 testes em 44 arquivos | 1.560 testes em 51 arquivos |

Os arquivos novos: 7 do Vitest (`theme-script`, `theme-pair`, `header-menu`, `privacy-theme`, `guides-card`, `guides-entries` e `guides-hub-route`) e 7 do Playwright (`header-links`, `header-menu`, `header-theme`, `header-theme-offline`, `header-axe`, `guides-hub` e `guides-search`). Cada teste novo tem a prova de que reprova sem a mudança, contra uma cópia do `dist/` do ponto de partida ou no commit do teste, antes da correção (§ 391, § 399, § 404 e § 405).

Os testes antigos que mudaram, cada um com o que protegia, por que mudou e a proteção que continua, no formato da § 341:

- **§ 384:** o `icons.test.ts` (a contagem de ícones foi de 39 a 44, a da pasta).
- **§ 392 (o tema e o cabeçalho):** dois testes do `pdf-site.test.ts` (os `hreflang` agora estão no menu de idioma e no fim do Menu), o `pix.test.ts` (o `DONATE_PLACES` ganhou `menu`), o `calc-defs.test.ts` (a data da Privacidade em inglês) e o comentário do `tests/e2e/lib/axe.ts`.
- **§ 400 (o hub e as entradas):** o `routes.test.ts` (a ordem dos ids com o hub), o `seo-checks.test.ts` (uma URL a mais em cada sitemap), o `build()` do `conteudo.test.ts`, dois testes do `pdf-site.test.ts` (a seção de guias da home e a coluna Guias do rodapé), o `navigation.spec.ts` (o título vazio e a categoria "Guide" na busca), dois blocos do `ads.spec.ts` (o cartão de guia no lugar da linha antiga, e o hub entre as páginas sem anúncio) e o `layout-shift.spec.ts` (os hubs e 17 páginas da borda).
- **§ 404 (a revisão):** o teste de cada molde do `header-menu.spec.ts` (as linhas da folha com 48 px ou mais, não 52).
- **§ 406 (o fim):** sete leituras da região de status no `island.spec.ts`, no `tool.spec.ts` e no `image-batch.spec.ts` passaram a olhar a da ferramenta (`#fo-tool-root`): a região de status do botão de tema, no cabeçalho de toda página, fazia o `page.getByRole('status')` achar duas.
- **Só acréscimos,** sem asserção mudada: o bloco do cabeçalho no `ads.spec.ts` (que a revisão estendeu a 767 px), o teste do Apoie a Oli no `events.spec.ts`, o par `stroke` sobre `brand-soft` no `contrast.test.ts`, os hubs no `budgets.spec.ts`, no `i18n-budgets.spec.ts` e no `ads-pages.test.ts`, e o cluster do hub no `seo-checks.test.ts`.
- **Um tempo que mudou:** os blocos do cabeçalho no `ads.spec.ts`, criados nesta run, ganharam `test.setTimeout(120_000)` na revisão (D-2), a convenção dos testes longos das calculadoras. No WebKit, com a máquina carregada, 15 páginas em três larguras passavam dos 60 s do padrão sem nenhuma asserção falhar. Nenhuma asserção nem limite de medida mudou.
- Nenhum teste saiu e nenhum foi pulado.

## O `pnpm verificar --partes`

Rodou antes do primeiro `gh pr ready`. As correções da § 408, depois dele, mudaram uma regra de CSS do hub de guias e dois testes desta run; os specs que elas tocam (o `guides-hub`, o `header-menu`, o `layout-shift`, o `a11y` dos guias, o `design`, o `navigation` e o `guides-search`, 336 testes nos dois navegadores) passaram, e a execução completa do CI roda tudo de novo no Linux.

A primeira execução, no `3275ede`, com a máquina livre, parou na parte 4 do Chromium: 3 testes antigos liam a primeira região de status da página, e o cabeçalho agora tem a do tema (§ 406). Depois da mudança nos testes, o `verificar --partes` rodou de novo, inteiro, no `75e98d9` (o último commit de código), com a máquina livre (nenhum outro processo do repositório, nenhum servidor de pé). A saída real da segunda execução:

```text
Resumo das partes do CI (pnpm verificar --partes, 21 partes lidas de .github/workflows/ci.yml)
  ok      34.5 s  build: pnpm verificar --build
  ok     144.5 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     390.7 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok      92.1 s  playwright: pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto
  ok     132.8 s  playwright: pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto
  ok      57.1 s  playwright: pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto
  ok     100.5 s  playwright: pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto
  ok      87.2 s  playwright: pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto
  ok      47.8 s  playwright: pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto
  ok      51.6 s  playwright: pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto
  ok      88.3 s  playwright: pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto
  ok      73.9 s  playwright: pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto
  ok      50.8 s  playwright: pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto
  ok      45.8 s  playwright: pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto
  ok      46.1 s  playwright: pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto
  ok      33.2 s  playwright: pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto
  ok      59.0 s  playwright: pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto
  ok      68.2 s  playwright: pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto
  ok      44.8 s  playwright: pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto
  ok      83.1 s  playwright: pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto
  ok      52.6 s  playwright: pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto
  soma 1784.6 s (parede 1784.6 s; cada parte com o limite de 900 s)
```

As 21 partes passaram. A maior é a do Lighthouse, com 390,7 s, e nenhuma passa dos 700 s; a soma é 1.784,6 s. O resumo dos portões (a parte 2), com o `lint:texto` e o Vitest:

```text
Resumo do pnpm verificar (sem o Playwright e sem o Lighthouse, com o dist/ pronto)
  ok      10.7 s  tipos (astro check)
  ok       4.6 s  lint (eslint)
  ok      34.1 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.9 s  seo (hreflang, sitemaps, canonical, robots)
  ok       1.0 s  links internos e páginas órfãs
  ok       1.6 s  conteúdo mínimo das ferramentas e do site
  ok      71.5 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.9 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.0 s  licenças
  ok       0.6 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok      10.0 s  lint:texto (LanguageTool)
  total 144.4 s (limite 900 s)
```

O Lighthouse no celular (a parte 3), com o `/guides/` entre as 11 páginas do `lighthouserc.json`:

```text
lighthouse (celular): /compress-image/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /image-tools/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /mortgage-calculator/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /guides/15-vs-30-year-mortgage/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /compress-pdf/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /pdf-tools/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /guides/why-is-my-pdf-so-large/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /pt/simulador-sac-price/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /pt/apoie/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /qr-code-generator/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): /guides/ → performance 100, accessibility 100, best-practices 100, seo 100
```

A primeira execução, no `3275ede`, parou assim (a parte 4 do Chromium, com o `--partes` parando na primeira falha):

```text
  3 failed
    [chromium] › tests\e2e\image-batch.spec.ts:47:3 › files that cannot be read, in the middle of a batch › the corrupted, the truncated, the empty and the text file each say why, the others come out, the page does not hang and a new batch works 
    [chromium] › tests\e2e\island.spec.ts:26:3 › a batch › the WaterLevel counts the batch ("0%, 0 of 3 images") and the queue shows working and waiting rows 
    [chromium] › tests\e2e\island.spec.ts:93:3 › a batch › changing the level re-processes the whole batch at once and keeps the focus on the option 
  309 passed (1.7m)
```

## O custo

O `pnpm ci:custo` da última execução do CI antes desta versão do relatório, a completa do primeiro `gh pr ready` (no `3a743ab`, vermelha; § 408):

### Execução 41791116378 (tentativa 1)

- Branch `fase-11`, commit `3a743ab`, evento `pull_request`, criada em 2026-11-04T07:16:27Z, resultado `failure`.
- Classe: **completo**.
- Minutos cobrados: **121** (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: **10.1 min** (do início do primeiro job ao fim do último).
- Jobs: 23 rodaram, 4 pulados.

| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| alerta-dependabot | pulado | | 0 | | | |
| build | success | 54 s | 1 | 23 s | 22.3 s | pnpm verificar --build (23 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (7 s); Run pnpm install --frozen-lockfile (7 s) |
| ci-ok | failure | 33 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (16 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (7 s); Verdict (6 s) |
| classificar | success | 14 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (7 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (4 s); Set up job (1 s) |
| merge | pulado | | 0 | | | |
| playwright (chromium 1 de 5) | success | 450 s | 8 | 36 s | 409.7 s | pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto (410 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s); Run pnpm install --frozen-lockfile (9 s) |
| playwright (chromium 2 de 5) | success | 417 s | 7 | 32 s | 381.8 s | pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto (382 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s); Run pnpm install --frozen-lockfile (7 s) |
| playwright (chromium 3 de 5) | failure | 212 s | 4 | 30 s | 177.5 s | pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto (178 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s); Run pnpm install --frozen-lockfile (6 s) |
| playwright (chromium 4 de 5) | success | 400 s | 7 | 36 s | 359.6 s | pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto (360 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (12 s); Run pnpm install --frozen-lockfile (9 s) |
| playwright (chromium 5 de 5) | success | 389 s | 7 | 41 s | 344.3 s | pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto (345 s); Wait for the browser (12 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 1 de 13) | success | 310 s | 6 | 53 s | 252.9 s | pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto (253 s); Wait for the browser (25 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 2 de 13) | success | 320 s | 6 | 47 s | 269.8 s | pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto (270 s); Wait for the browser (18 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 3 de 13) | success | 369 s | 7 | 49 s | 317.0 s | pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto (317 s); Wait for the browser (22 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s) |
| playwright (webkit 4 de 13) | success | 390 s | 7 | 48 s | 338.7 s | pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto (339 s); Wait for the browser (20 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 5 de 13) | success | 255 s | 5 | 49 s | 202.9 s | pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto (204 s); Wait for the browser (23 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (8 s) |
| playwright (webkit 6 de 13) | success | 237 s | 4 | 48 s | 184.6 s | pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto (185 s); Wait for the browser (20 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 7 de 13) | success | 262 s | 5 | 53 s | 205.0 s | pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto (206 s); Wait for the browser (23 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 8 de 13) | success | 252 s | 5 | 122 s | 125.3 s | pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto (126 s); Wait for the browser (88 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (11 s) |
| playwright (webkit 9 de 13) | success | 240 s | 4 | 47 s | 189.8 s | pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto (190 s); Wait for the browser (21 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s) |
| playwright (webkit 10 de 13) | success | 497 s | 9 | 132 s | 360.5 s | pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto (361 s); Wait for the browser (98 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (12 s) |
| playwright (webkit 11 de 13) | success | 208 s | 4 | 49 s | 155.9 s | pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto (157 s); Wait for the browser (21 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s) |
| playwright (webkit 12 de 13) | success | 399 s | 7 | 46 s | 349.1 s | pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto (350 s); Wait for the browser (19 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (webkit 13 de 13) | success | 213 s | 4 | 46 s | 163.9 s | pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto (164 s); Wait for the browser (23 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (8 s) |
| pos-deploy | pulado | | 0 | | | |
| verificar (leve) | pulado | | 0 | | | |
| verificar (lighthouse) | success | 445 s | 8 | 42 s | 400.0 s | pnpm verificar --lighthouse --dist-pronto (400 s); Wait for the browser (14 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| verificar (portões) | success | 198 s | 4 | 33 s | 158.9 s | pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto (159 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (7 s) |

Jobs que rodaram o build do site no verificar: build (19 s).
Preparo dos jobs do Playwright: o maior foi 132 s (playwright (webkit 10 de 13)); 2 de 18 acima de 90 s.
Total do verificar: o maior foi 409.7 s (playwright (chromium 1 de 5)); 0 de 21 partes acima do alvo de 700 s.

A leve do push do `75e98d9`, a anterior, custou 5 minutos cobrados e 3,1 min de parede (3 jobs). O custo da execução completa final vai na descrição da PR, porque só existe depois do relatório.

## A conferência no Linux

No meio da run, não houve: o rótulo `ci` não existe no repositório (o `gh api` do rótulo, só leitura, respondeu 404), e a run não cria rótulos. O atalho de pôr a PR pronta e voltá-la ao rascunho foi recusado, porque o job `merge` lê o rascunho do evento, e uma execução verde do `ready_for_review` chegaria ao `gh pr merge` com a PR de volta ao rascunho (§ 401, `docs/claude/ci.md`, F11 p-1). As execuções leves do CI (tipos, lint, build e Vitest, no Ubuntu) passaram em todo push da run.

A conferência no Linux foi, então, a execução completa do `gh pr ready`. A primeira, no `3a743ab`, reprovou na parte 3 do Chromium, com 2 testes desta run que tinham passado no Windows (§ 408):

- **o hub de guias em espanhol a 360 × 740:** no Linux, o título vai a três linhas (a 2ª linha, "muestran los números", ocupa 278,5 dos 280 px no Windows), e o nome do primeiro cartão desce para y 765,14, abaixo da dobra de 740 px que a especificação pede. A correção: o primeiro grupo fica 32 px abaixo dos atalhos, não 64, e o nome fica em y 733 mesmo com o título em três linhas. O teste agora põe uma linha a mais no título e exige a dobra do mesmo jeito; reprovou antes da correção com 765,0, o número do CI;
- **o toque que fecha o Menu:** o teste não fechava o aviso de cookies, que no Linux fica mais alto e cobriu o rádio; o controle positivo do próprio teste acusou. A correção é o `dismissCookies` no teste.

As outras 22 partes passaram. A PR voltou ao rascunho e as correções entraram. Um push no caminho (`ebb6379`) levou um erro de tipo no teste novo; o `pnpm tipos` local o pegou logo depois, o `cb80298` corrigiu, e a execução leve do `ebb6379` foi cancelada pelo push seguinte. Então a sequência do fim recomeçou: o push, a execução leve verde e o `gh pr ready`. O resultado da execução completa final está na descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo (navegação e SEO, design system e acessibilidade, tema e desempenho, privacidade e anúncio, textos e idiomas) sobre o `2b89cb1`, 7 céticos, um agente Opus para as correções e uma segunda passada sobre o diff delas.

- Foram 15 achados, nenhum crítico nem alto. Os dois médios (B-1 e D-1) caíram para baixo nos céticos e foram corrigidos mesmo assim, com o C-1 e o D-2.
- A segunda passada achou um médio: o B-2 (o clique que fecha o Menu chegava à DropZone) tinha correção só com CSS. O agente principal a fez, para clique e toque. Nenhum médio ficou aberto.
- Os baixos que sobraram estão no grupo 20 do `docs/PENDENCIAS.md`: as linhas R-B-3, R-C-2 e R-E-1, e acréscimos à g-1, à g-3, à g-4 e à p-2. Três achados foram refutados.
- No caminho, a causa da F11 p-2 apareceu: a folha de estilo recusada pela rede da máquina carregada.

Tudo está em `docs/relatorios/REVISAO-F11.md`.

## As imagens

22 imagens em `docs/relatorios/fase-11/`, 1,3 MB no total, a maior com 103 KB. Foram tiradas do `dist/`, com o Chromium do Playwright, a 1x e com movimento reduzido. As do Menu foram refeitas depois das linhas de 48 px, e as do hub depois do espaço novo acima do primeiro grupo (§ 408).

| Arquivo | O que mostra |
| --- | --- |
| `01-cabecalho-en-360-claro.png` | O cabeçalho a 360 px: logo, busca, tema e Menu numa linha de 64 px |
| `02-menu-en-360-claro.png` | A folha do Menu em inglês, a 360 px, com a seção da página marcada e os idiomas numa linha |
| `03-menu-en-360-escuro.png` | A mesma folha no tema escuro |
| `04-menu-pt-360-claro.png` | A folha em português |
| `05-menu-es-360-escuro.png` | A folha em espanhol, no escuro |
| `06-cabecalho-en-1280-claro.png` | O cabeçalho a 1280 px no Merge PDF, na grade da moldura, com a lateral livre |
| `07-menu-en-1280-claro.png` | A folha aberta a 1280 px, terminando onde termina a coluna |
| `08-menu-pt-1280-escuro.png` | A folha em português a 1280 px, no escuro |
| `09-idioma-en-1280-claro.png` | O menu de idioma a 1280 px |
| `10-tema-sistema-escuro.png` | O botão de tema em Sistema, com o sistema escuro |
| `11-tema-claro.png` | O botão em Claro |
| `12-tema-escuro.png` | O botão em Escuro |
| `13-hub-en-360-claro.png` | O hub de guias em inglês a 360 px |
| `14-hub-en-360-escuro.png` | O mesmo hub no escuro |
| `15-hub-pt-360-claro.png` | O hub em português, só com guias de arquivo |
| `16-hub-es-1280-claro.png` | O hub em espanhol a 1280 px |
| `17-hub-en-1280-escuro.png` | O hub em inglês a 1280 px, no escuro |
| `18-guidecard-ferramenta-en-360.png` | O GuideCard no fim do "Como usar" de uma ferramenta |
| `19-relacionadas-en-1280.png` | As relacionadas de um guia, com o GuideCard |
| `20-home-guias-en-1280.png` | A seção "Read a guide" da home |
| `21-rodape-guias-en-1280.png` | A coluna Guias do rodapé, embaixo de Utilidades |
| `22-busca-pt-1280-claro.png` | A busca em dois grupos, Ferramentas e Guias |

## A prévia

https://fase-11-fileorca.vmatusita.workers.dev/ (o Workers Builds gera a prévia a cada push da branch).

## As decisões novas

- § 382: o ponto de partida, a especificação e a reserva dos §.
- § 383 e § 384: os blocos da F10 no `docs/claude/` e os ícones do cabeçalho.
- § 385 a § 392: o tema, o CSS e as metas, a Privacidade, o cabeçalho com o Menu, o mapa das seções, o "Apoie a Oli", e os testes novos e antigos da fatia.
- § 393 a § 400: o hub, a regra do `gate:conteudo`, o GuideCard, as entradas, a busca, a home, e os testes novos e antigos da fatia.
- § 401: o merge das três fatias e a conferência no Linux.
- § 402: o `docs/design/` depois da F11.
- § 403: as medidas do fim.
- § 404 e § 405: as correções da revisão e da segunda passada, e a causa da F11 p-2.
- § 406: os testes antigos que a região de status do tema mudou.
- § 407: o fim da run.
- § 408: a primeira execução completa vermelha e as duas correções.

## O que a válvula cortou

Nada. A seção "Leia um guia" da home, a única coisa que a ficha deixava cortar, entrou.

## Desvios e avisos

- **Da especificação:**
  - abaixo de 768 px, os três idiomas ficam numa linha só, no fim do Menu, sem o ícone check (§ 388, F11 t-3);
  - as linhas da folha têm 48 px, não 52 (§ 404);
  - o Menu diz 14 calculadoras de dinheiro, não 18, porque conta as calculadoras e não os presets (§ 389, F11 R-E-1).
- **Da ficha:**
  - no começo da run, um `gh label list`, só leitura, para saber se o rótulo `ci` existia. A ficha manda nunca usar `gh label`, e depois disso só o `gh api` sem método foi usado (§ 401);
  - também no começo, um `git stash` sem nome, desfeito em seguida, que a pegadinha das worktrees manda evitar. Nada de outra sessão foi tocado.
- **Na revisão:** os incidentes das lentes (um `gate:prontidao` rodado por engano e processos de outras lentes parados) estão no `REVISAO-F11.md`, sem efeito em arquivo versionado.

## O que fica com o Victor

1. `git pull` e conferir no celular o Menu, o tema (Sistema, Claro e Escuro, e se a escolha fica) e os guias, na prévia ou no fileorca.com depois do deploy.
2. No Search Console, pedir a indexação de `/guides/`, `/pt/guias/` e `/es/guias/` (Inspeção de URL → Solicitar indexação).
3. Gerar o prompt da F12 com a lista marcada e o que a F11 deixou (o grupo 20 do `docs/PENDENCIAS.md` e a F10 p-5). No grupo 20, são dele a F11 p-1 (criar o rótulo `ci` ou mudar o `merge`), a t-1 (o leitor de tela), a g-1 (a ordem da busca), a R-C-2 (o tema depois do Voltar) e a R-E-1 (14 ou 18 calculadoras).

