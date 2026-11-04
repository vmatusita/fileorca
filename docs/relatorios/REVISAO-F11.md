# Revisão adversarial da F11

Revisão final da run F11, no método da F3 (`docs/claude/windows-git-bash.md`, "Método da revisão adversarial") e na regra 3 de toda run: a F11 mexe em interface e em texto, mas também em anúncio (os 150 px do cabeçalho e da folha) e em privacidade (a chave do tema), então teve cinco lentes.

## Como foi feita

- **O commit revisado:** `2b89cb1` da branch `fase-11` (as três fatias juntas, o `docs/design/`, as § até 403 e as imagens, antes do relatório). Foi numa worktree só de leitura, `.claude/worktrees/revisao-f11`, com o próprio `pnpm install` e o próprio `pnpm build` (o `dist/build.txt` conferido por cada lente).
- **Cinco lentes Sonnet em contexto limpo,** contra a ficha (`docs/prompts/prompt-fase-11.md`), o plano (`docs/relatorios/fase-11-plano.md`) e as especificações (`docs/propostas/ux-v2/header-a.html`, `guides-hub.html` e `guides-entries.html`):
  - (a) navegação, rotas e SEO;
  - (b) design system e acessibilidade;
  - (c) tema e desempenho, com a pergunta da F11 p-2;
  - (d) privacidade e anúncio;
  - (e) textos e idiomas.

  Cada lente teve a própria porta (`FO_PORT` de 4174 a 4178) e a própria pasta em `.cache/lente-<x>/`.
- **Os céticos:** um para cada achado médio (B-1 e D-1) e um só para os baixos de cada lente. São 7 agentes.
- **As correções:** um agente Opus só, na worktree `.claude/worktrees/wf_a6978b59-cc0-13`, a partir da `fase-11` (`ca91a85`), cada correção com um teste commitado antes dela. Depois, uma segunda passada (um revisor Sonnet em contexto limpo) leu o diff das correções. O agente principal juntou a branch das correções (`68aa102`) e corrigiu o que a segunda passada achou.
- **O resultado:** 15 achados. Nenhum crítico nem alto. Os dois médios (B-1 e D-1) caíram para baixo nos céticos e foram corrigidos mesmo assim. Dos baixos, 5 foram corrigidos, 3 viraram linhas novas do grupo 20 do `docs/PENDENCIAS.md`, 5 eram itens que já estavam lá e 3 foram refutados. A segunda passada achou um médio (S2-1, o B-2 tem correção só com CSS) e dois baixos, e os três foram corrigidos. Nenhum médio ficou aberto.
- **Incidentes das lentes, sem efeito em arquivo versionado:**
  - a lente (a) rodou por engano o `gate:prontidao`, que faz dois builds em `.cache/prontidao` e reescreve o `.cache/bundle-modules.json`; ela parou o processo, apagou a pasta e conferiu o `git status` limpo e o `dist/` intacto. Ao parar os próprios servidores, o filtro dela pegou também três `serve-dist.ts` que podiam ser de outras lentes;
  - a lente (c) avisou que um `Stop-Process` largo dela pode ter parado um processo de outra lente;
  - o agente das correções achou que o WebKit recusa a porta 4190 (porta restrita) e passou para a 4196; a pegadinha está no `docs/claude/playwright.md`.

  As oscilações de carga (testes que estouraram o tempo com a máquina cheia e passaram sozinhos) estão nas tabelas de cada lente. Nenhuma lente nem a segunda passada mudou arquivo versionado fora das correções.

## Os médios

- **B-1: a seção e o idioma em uso com cores forçadas.**
  - O defeito: com cores forçadas, o fundo e as bordas de toda linha do Menu ficam iguais, e a seção atual e o idioma em uso só se distinguiam pelo peso, 700 contra 600 (0,73 px numa palavra de 85 px). O item atual do menu de idioma do computador não tinha marca nenhuma.
  - O cético: baixo. O peso é a marca que a ficha pediu, a diferença existe (15 a 17% mais tinta), e a regra do menu de idioma é da F1b, não uma regressão da F11. Mas a correção é barata e segue a § 280.
  - A correção (`aa8c337`, teste em `922cf1d`): um sublinhado de 3 px em `@media (forced-colors: active)` na linha atual, no idioma em uso do Menu e no item atual do menu de idioma, sem cor nova; § 404.
- **D-1: a folha do Menu a 146,5 px do anúncio, de 390 a 767 px.**
  - O defeito: o 1º AdSlot do Merge PDF e do Unlock PDF em inglês sobe de y 796 para y 776 a partir de 390 px, e a folha, com linhas de 52 px, terminava em y 629,5. O `ads.spec.ts` media só 360 e 1280 px.
  - O cético: baixo. A ficha pede os 150 px "a 360 e a 1280 px", e o teste cumpria; a falta é de 3,5 px, em 2 de 178 páginas, só com o popover aberto. Mas a t-2 já não dizia a verdade, e o teste ficava cego a esse trecho.
  - A correção (`6d574b2`, teste em `333fec8`): as linhas da folha a 48 px (o `tap-min`), e o bloco do cabeçalho do `ads.spec.ts` mede também 767 px. Abaixo de 768 px, todo AdSlot fica a 178,5 px ou mais da folha aberta. É um desvio da especificação (52 px), registrado na § 404.
- **S2-1 (segunda passada): o B-2 se corrige só com CSS.** Na tabela da segunda passada, abaixo.

## A segunda passada

Um revisor Sonnet em contexto limpo leu o diff das correções (`ca91a85..a565222`) na worktree delas, refez o build com o CSS de antes e rodou contra ele os testes novos: cada um reprova sem a sua correção. Rodou também o Vitest inteiro (109 arquivos, 1.832 testes), o `pnpm tipos`, o `--list` (1.558 por navegador), os cinco `header-*.spec.ts` (176), o `ads.spec.ts` inteiro (400), o `cookie-footer`, o `navigation`, o `layout-shift` e o `a11y` (600), o `gate:design` e o `gate:cabecalhos`, e uma sonda própria das 178 páginas com anúncio em 14 larguras de 320 a 1280 px. Achou um médio e dois baixos, e o agente principal corrigiu os três (§ 405):

| Id | Sev. | Achado | Correção |
| --- | --- | --- | --- |
| S2-1 | médio | O B-2 se corrige só com CSS: a razão da § 404 para não corrigir ("engolir o clique pediria um script") era falsa, e a pegadinha ensinava às próximas runs um limite que não existe | Corrigido (`b828ff4` e `002f64d`; testes em `1c56c0b` e `304c4d5`). Com um menu aberto, o `.fo-frame` (o `main` e a lateral, para o clique também não cair num anúncio) fica com `pointer-events: none`. No WebKit, o clique de um toque chega depois de o menu fechar, e uma sonda com `hasTouch` mostrou o toque marcando o rádio mesmo com a regra: por isso, uma folha sem pintura (`body::after`, sob o cabeçalho) fica 400 ms a mais e sai por `scale`. A primeira tentativa, uma transição de `pointer-events`, reprovou no `gate:design` (só transição de movimento), e o portão não foi afrouxado. Os dois testes reprovaram antes da correção (2 seletores abertos nos dois navegadores; o toque marcou o rádio no WebKit) e passaram 3 vezes em cada navegador depois. O README do Header, a pegadinha do `docs/claude/design-e-oli.md` e a § 404 dizem a correção |
| S2-2 | baixo | O `bundle.css` do `docs/design/` ficou com o `color-scheme` escuro fora de `@media screen`, e a guarda nova não o lia | Corrigido (`cf6263d`; teste em `a1e9454`): as duas regras em `@media screen`, como no `global.css`, e o `theme-pair.test.ts` lê o `bundle.css` |
| S2-3 | baixo | Números velhos: o `docs/claude/anuncios.md` dizia que a folha termina em y 629,5; a § 404 dizia "mais baixa" para uma folha mais curta; a F11 t-2 dizia 166,5 px | Corrigido (`a2baa55`): y 597,5, "mais curta", e a t-2 com 198,5 px a 360 px e 178,5 px de 390 a 767 px |

**A causa da F11 p-2,** achada no caminho: numa execução com 6 workers, o axe do cabeçalho do `/merge-pdf/` reprovou no tema escuro do Chromium e passou ao rodar de novo. O console do trace mostra `net::ERR_NO_BUFFER_SPACE` na folha de estilo, e uma sonda com a folha abortada dá o mesmo quadro da p-2 (uma folha vazia em `document.styleSheets` e o `body` com `rgba(0, 0, 0, 0)`). A p-2 é a máquina carregada, não o tema; a linha dela no PENDENCIAS e o `docs/claude/playwright.md` dizem isso (§ 405). A lente (c) já tinha concluído que era um artefato da medida, sem achar a causa.

## Lente A: navegação, rotas e SEO

Nenhum achado crítico, alto nem médio. A lente conferiu, nas 211 páginas do `dist/`: o Menu (hubs na ordem, `aria-current`, idiomas na página equivalente), a trilha e o `BreadcrumbList` das 40 páginas de guia, os três hubs (15, 10 e 15 cartões, sem anúncio, `CollectionPage`, OG de 1200 × 630, sitemap), os cartões `--here` contra os registros, nenhum guia como ToolCard, o rodapé, a home, ids repetidos e o `<head>` contra o ponto de partida. Andou Menu → hub → guia → trilha → hub nos dois navegadores.

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| A-1 | baixo | duplicado | Na busca em dois grupos, o guia digitado pelo nome vai para depois das ferramentas que casam as palavras soltas; em es, "jpg o png" põe o guia na posição 10 de 10 (`src/search/search.ts`) | Somado à F11 g-1 (o exemplo em espanhol) |
| A-2 | baixo | duplicado | O teste F7 do QR code do `conteudo.test.ts`, que roda o portão em subprocesso, estoura os 5 s do Vitest com a máquina carregada | Somado à F11 g-4 |

## Lente B: design system e acessibilidade

Tokens (nenhum hex, rgb nem `--sun` no diff), axe com zero violação, alvos de 48 px, teclado, nome e estado do botão de tema e do Menu, ordem do `<head>` e os README do Header e do GuideCard contra o código: conformes. Confirmou a severidade de t-1, t-2 e g-2 e achou a t-3 subestimada (agrava o B-1). Quatro testes "reflow 320" e um axe de guia no WebKit estouraram 60 s com a máquina cheia e passaram sozinhos.

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| B-1 | médio | baixo | Com cores forçadas, a seção atual e o idioma em uso do Menu só se distinguem pelo peso; o menu de idioma do computador não tem marca (`src/styles/components.css`) | Corrigido (`aa8c337`, teste em `922cf1d`): sublinhado de 3 px em `forced-colors`; § 404 |
| B-2 | baixo | baixo | O clique que fecha o Menu passa para o que está embaixo e abre o seletor de arquivos da DropZone (a partir de 768 px) ou muda um controle logo abaixo da folha (`src/components/Header.astro`) | Corrigido na segunda passada (S2-1): só com CSS, para clique e toque; § 405 |
| B-3 | baixo | baixo, em parte | O README do sistema e o `bundle.css` não receberam todas as regras novas da F11 | O `.fo-search__group` já era a F11 g-2, e as classes de página do hub não vão ao bundle. O resto (as linhas 67 e 91 do README e o `.fo-footer__more`): PENDENCIAS F11 R-B-3, junto da g-2 |

## Lente C: tema e desempenho

Nenhum achado crítico, alto nem médio. A primeira pintura sai no tema guardado nas 211 páginas (ordem do `<head>` conferida, e um screencast do compositor em 30 cargas sem nenhum quadro de cor errada). JS e requisições iguais em 180 páginas (+0,2 a +0,3 KB inline), CSS de 13,1 para 14,0 KB com gzip, CLS idêntico ao do ponto de partida em 236 combinações, o cabeçalho com 64 px e uma linha em 84 medidas, e Lighthouse 100 nas quatro categorias nos três hubs.

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| C-1 | baixo | baixo | Com o Escuro guardado (ou Sistema num sistema escuro), a impressão sai com texto claro no papel branco: o escuro valia em toda mídia (`docs/design/tokens.css`, `src/styles/global.css`). O cético mediu 2,41:1 no PDF do Chromium | Corrigido (`d4010fb`, testes em `60e4840`): o escuro só em `@media screen`; § 404. O `bundle.css` foi na segunda passada (S2-2) |
| C-2 | baixo | baixo | O tema não é relido quando a página volta do bfcache; o cético reproduziu no Chromium completo, com o bfcache ligado (`src/platform/theme.ts`) | PENDENCIAS F11 R-C-2: a correção é JS novo em toda página (um `pageshow`), fora da revisão; o Victor decide |
| C-3 | baixo | duplicado | O quadro transparente da F11 p-2 é um artefato da medida, sem causa achada; a lente propôs endurecer a medida | É a F11 p-2. A causa apareceu depois (a folha falhou na rede, `ERR_NO_BUFFER_SPACE`), e a linha da p-2 diz isso; § 405 |

## Lente D: privacidade e anúncio

O `fo-theme` só guarda `light` ou `dark`, a troca não manda requisição, evento nem endereço, o `donate_click` ganhou só o lugar `menu`, a Privacidade fala do tema nos três idiomas, nenhum COOP nem COEP, o `src/ads/` sem diff, o hub sem anúncio (também no build com os IDs de teste), o GuideCard a 369 px ou mais dos anúncios, e o Menu a 1280 px a 150,000 px da lateral em todas as larguras de 1280 a 2560 px. Uma mutação (folha alongada) reprovou 10 dos 12 blocos do cabeçalho do `ads.spec.ts`. A varredura do diff atrás de dado pessoal, token e ID real não achou nada novo.

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| D-1 | médio | baixo | A folha do Menu fica a 146,5 px do 1º AdSlot do Merge PDF e do Unlock PDF de 390 a 767 px; o teste só media 360 e 1280 px (`src/styles/components.css`, `tests/e2e/ads.spec.ts`) | Corrigido (`6d574b2`, teste em `333fec8`): linhas de 48 px e o bloco mede 767 px; § 404 |
| D-2 | baixo | baixo | Os blocos de 15 páginas do cabeçalho no `ads.spec.ts` usam o tempo padrão de 60 s e estouram no WebKit com a máquina carregada | Corrigido (`7b39ad6`): `test.setTimeout(120_000)`, como nos testes longos das calculadoras |

## Lente E: textos e idiomas

Os textos novos batem com as especificações palavra por palavra (a única diferença, "financiamento imobiliário" na nota de pt, é do glossário e da § 393), as chaves e os `{placeholders}` são os mesmos nos três idiomas, e nenhum texto visível está fora dos arquivos de tradução. Glossário, `english-leak`, `lint:texto` (0 erro, 240 avisos), `gate:conteudo` e `gate:seo` passam. No Vitest inteiro com a máquina cheia, 32 testes estouraram os 5 s (a g-4) e passaram sozinhos.

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| E-1 | baixo | baixo | O Menu diz 14 calculadoras de dinheiro em en e es, e a Sobre e os Termos dizem 18 (os 4 presets contam lá) | PENDENCIAS F11 R-E-1: o 18 é da § 321 e está num teste, e mudar os Termos muda texto jurídico; o Victor escolhe o número |
| E-2 | baixo | refutado | "Each guide lists the files it used…" pode ser lido como regra também dos guias de dinheiro | Nada: a frase continua o sujeito da anterior ("The image and PDF guides"), e a seguinte fala dos de dinheiro; é o texto da especificação |
| E-3 | baixo | refutado | Os textos com `{n}` não têm singular ("Measured on 1 test files") | Nada: o menor n hoje é 3, um guia de um arquivo só contraria o método, e o cartão já reprova n = 0 |
| E-4 | baixo | refutado | O glossário de pt e es não ganhou Menu, Tema, Idioma, "Apoie a Oli" e "Ko-fi ou Pix" | Nada: a ficha pede os termos que o `glossary.test.ts` pedir, e ele não pede; os textos estão na § 390 e nos `common.ts` |
| E-5 | baixo | duplicado | O aviso do `lint:texto` sobre o `{n}` pega mais textos do que a F11 g-3 diz | Somado à F11 g-3 (o Menu, a introdução e a faixa do hub) |
