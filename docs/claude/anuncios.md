# Anúncios, prontidão, GA4 e Pix

O que as runs aprenderam sobre os anúncios, a prontidão para o AdSense, o GA4 e o Pix, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F3: revisão e prontidão

O `gate:prontidao` (`scripts/gates/prontidao.ts`, com a lógica em `scripts/lib/prontidao.ts`) entra no `verificar` na parte `--sem-playwright`. Ele confere se o site está pronto para o pedido do AdSense (DECISOES § 95).

- **O que confere.** Faz dois builds extras do mesmo código em `.cache/prontidao/`: `client`, só com o ID de teste `ca-pub-0000000000000000`, e `all`, com as três variáveis. Confere também o `dist/` real. São 18 itens:
  - a meta tag e o `ads.txt` exatos;
  - o carregador só nas ferramentas;
  - nada de anúncio sem o ID;
  - as seis páginas obrigatórias nos três idiomas e no rodapé;
  - o Contato e a Privacidade com o que o AdSense pede;
  - nenhum texto de obra nem ID de mentira;
  - cartões e busca só do registro;
  - H1, título e descrição próprios;
  - 60 palavras no `<main>` e 150 palavras por AdSlot;
  - `robots.txt`, `noindex` e sitemaps.
- **O `dist/` fica intacto.** O registro do bundle (`.cache/bundle-modules.json`) é devolvido depois de cada build.
- **Como acrescentar um item.** Escreva uma função `check…(site: Site): Row[]` no `scripts/lib/prontidao.ts` e chame-a no portão. No `tests/unit/prontidao.test.ts`, ponha um controle positivo (o site de mentira do `makeSite()` passa) e um negativo para cada quebra. A linha do `ads.txt` fica escrita à mão no portão, a partir da ajuda do AdSense, e nunca sai do `adsTxt()` do site.
- **Reuso.** O `robots.txt` é conferido por `robotsProblems()` (`scripts/lib/seo-checks.ts`), o `_headers` é lido por `headerBlocks()` e `patternApplies()` (`scripts/lib/headers-file.ts`), e o texto visível vem de `visibleText()` (`scripts/lib/conteudo.ts`).

Pegadinhas que a F3 achou:

- Navegador na produção só com `context.route` abortando os domínios do Google (`google`, `googletagmanager`, `google-analytics`, `doubleclick`, `gstatic`, `googlesyndication`), para a visita não entrar no GA4. A prévia em `*.workers.dev` nem pede o `gtag.js`.

## F6: português e espanhol

O Pix: a chave aleatória está em `src/platform/pix.ts` (uma linha, copiada do `docs/F0-SAIDA.md`). O gerador reproduz o exemplo do manual e os quatro códigos do `fixtures/pix.json` (`tests/unit/pix.test.ts`); o QR é desenhado no build com o `qrcode` e lido de volta com o `jsqr` em cada SVG do `dist/pt/apoie/` (`tests/unit/pix-qr.test.ts`). A troca de valor é CSS (`:has(:checked)`) e o copiar é um script inline; o "Copiar código" manda o `donate_click` com o lugar `pix`.

## F10: o mapa de anúncios

Pegadinhas que a F10 achou ao medir o mapa (`docs/propostas/ux-v2/ad-map.html`, DECISOES § 351, § 360 e § 361):

- **A margem de 150 px do `.fo-ad` não colapsa na grade do `.fo-main`** (gap de 16 px). Cada caixa de conteúdo soma 616 px ao `<main>`, e o vizinho fica a 166 px.
- **A lateral, a 1280 px, fica a 29 px dos botões de idioma e de busca do cabeçalho** (y 84), e o menu de idioma aberto (`position: fixed`) cai em cima dela. O `ads.spec.ts` não põe o cabeçalho nos alvos. Ponha `.fo-header a`, `.fo-header button` e os popovers, e dê à lateral um `padding-top` de 150 px.
- **O `gate:prontidao` conta toda caixa `fo-ad fo-ad--` do HTML,** mesmo a escondida por CSS naquela largura (150 palavras por caixa).
- **O multiplex a 1280 px:** a coluna tem 758 px, então o `ins` tem `floor(758 × 0,6)` = 454 px, e a caixa, 498 px com o rótulo. A 360 px, o carregador dá 1 coluna × 6 linhas: 1.666 px, que nenhum molde cabe em 30 %.
- **Para medir a densidade,** grave o `fo-consent`, espere `#fo-tool-root[data-hydrated="true"]` e meça com a ferramenta em repouso. A seção "O que medimos" dos guias de dinheiro não tem `data-content`, só o `h2#measured`.
- **A vinheta do AdSense tem "gatilhos adicionais" ligados por padrão desde 9/mar/2026:** o botão Voltar, 30 s parado, a volta à aba e o fim do artigo. Eles podem pôr uma vinheta durante o processamento, e desligar é do Victor, no painel.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **A folha do Menu abre no topo da página e precisa terminar 150 px acima do 1º AdSlot:** a 360 px, o do Merge PDF e do Unlock PDF fica em y 796, e a folha em inglês termina em y 597,5 (629,5 com as linhas de 52 px da § 388; § 404). Linha nova na folha, ou anúncio mais alto num molde: rode o bloco do cabeçalho do `ads.spec.ts`, que mede as 178 páginas com área de anúncio.
- **Abaixo de 768 px, a folha tem a mesma altura em toda largura, mas o 1º AdSlot sobe quando o texto da página quebra menos:** o do Merge PDF e do Unlock PDF fica em y 796 até 384 px e em y 776 a partir de 390 px. Com as linhas de 52 px, a folha ficava a 146,5 px dele de 390 a 767 px, e o teste, que media só 360 e 1280 px, não via. Por isso o bloco do cabeçalho mede também 767 px, a largura em que os dois mais se aproximam, e as linhas passaram a 48 px (revisão F11 D-1, § 404).

## Ajuste da largura do cabeçalho

Pegadinhas do ajuste que deu ao cabeçalho as bordas do rodapé (DECISOES § 409).

- **A partir de 1280 px, o cabeçalho passa por cima da lateral,** e só os 150 px de `padding-top` da `.fo-rail` (`global.css`) seguram os controles longe do anúncio dela (158 px). Mudar a altura do cabeçalho ou o `padding-top` da lateral pede o bloco do cabeçalho do `ads.spec.ts`: com a lateral a 20 px, ele reprova a 29 px da busca.
- **Um menu aberto cobre o alto da lateral.** Por isso o `ads.spec.ts` mede o menu aberto contra todo anúncio menos o da lateral (`.fo-ad:not(.fo-ad--rail)`) e confere, no lugar, que o clique não chega a ela (`railTakesPointer`). O ponto dessa conferência fica abaixo do menu aberto: no alto da lateral, ele cairia dentro da própria folha, e a conferência passaria sem a regra que segura o clique (revisão da § 409). A conferência com os menus fechados espera (`expect.poll`), porque a folha que segura o clique de fechar fica 400 ms.

## F12: monetização

Pegadinhas que a F12 achou no mapa de anúncios, na parede do bloqueador, no café e no build de teste (DECISOES § 410 a § 445).

- **Sem ID, nada (Mudança 10):** o build padrão não tem caixa de anúncio. A distância, a densidade e a parede só se medem no build de teste (`scripts/lib/test-build.ts`, a variante `teste`): o mesmo código com o `ca-pub-0000000000000000`, IDs falsos nas 37 unidades e a parede em `bloqueio`. Um spec que lê o build de teste chama `useTestBuild(test)` (`tests/e2e/lib/test-build.ts`); o que o build padrão não pode ter vai no `default-build.test.ts` ou no spec, pela origem do `dist/` (`DEFAULT_BUILD_ORIGIN`).
- **O ajudante refaz o build com a árvore suja:** um arquivo rastreado mudado em qualquer lugar (um relatório também), ou um arquivo novo em `src/`, `public/`, `docs/design/`, `scripts/` ou nas configurações da raiz. Nesta máquina são uns 35 s por variante. Com a árvore limpa e o mesmo commit, ele reaproveita `.cache/builds/<nome>/`.
- **O `gate:conteudo` e o `gate:prontidao` usam o build `all`:** as palavras por caixa e os blocos dos guias de arquivo são conferidos lá, porque o `dist/` não tem caixa. O teste do portão de conteúdo aponta a pasta com o `FO_ADS_BUILD`.
- **O mapa sai do build, pelas marcas das views:** cada view põe `AdBreak` (um comentário HTML, `<!--fo-ad:first-->` ou `<!--fo-ad:break-->`) nas fronteiras permitidas, e a `BaseLayout` renderiza o `<main>` em texto e chama `layOutAds` (`src/ads/map.ts`). Uma marca em lugar proibido (dentro de grade, tabela, lista, pergunta, painel, cronograma; logo depois de um título; colada numa tabela; ao lado de "O que medimos") derruba o build, em qualquer página, com a página e o motivo na mensagem. As views não põem mais `AdSlot` nem o slot `rail`: passam `adArea` à `BaseLayout`.
- **A estimativa da altura a 360 px** (`src/ads/estimate.ts`) erra para menos e foi calibrada no `dist/`. Mudou fonte, card ou espaçamento? Quem pega é o `fo-ad-map.spec.ts` (1.110 px de borda a borda); a correção vai na estimativa ou na fronteira, nunca no limite.
- **Os 1.110 px só valem até 459 px:** acima disso o texto quebra menos e dois anúncios do celular chegam a 1.104 px (480 px) e a 882 px (767 px). Por isso o conteúdo 2 em diante vale só até 459 px (§ 445), e o teste mede também a 459 × 900.
- **O `hidden` não esconde a caixa:** a `.fo-ad` tem `display: grid`, e a regra `.fo-ad[hidden] { display: none; }` é que segura a lateral 2.
- **O plano B (§ 415):** nenhum `<ins>` no HTML. As caixas trazem a largura em `data-ad-media`, e o push único, só em fileorca.com, dá o `<ins>` à caixa da largura certa e tira a regra de largura dela (ela fica à vista em qualquer largura depois); a outra sai do DOM. Um teste que conta caixas em fileorca.com conta só as da largura do carregamento.
- **O aviso de cookies aberto a 1280 × 800** ficava a 100 a 130 px do 1º anúncio das calculadoras curtas. O `margin-top` extra de 96 px a partir de 768 px (`.fo-calc-island ~ .fo-ad[data-ad-unit="conteudo"]`) desce o anúncio; o aviso não muda.
- **A parede e o `gate:prontidao`:** todo script que casa `adsbygoogle.js`, `pagead2.googlesyndication.com` ou `adsbygoogle…push(` precisa do texto exato `location.hostname==="fileorca.com"`. O script da parede cita o `ins.adsbygoogle` do anúncio preenchido e traz a trava. No build `all` (a parede desligada), o portão reprova qualquer peça da parede.
- **O `default-build.test.ts` reprova `fo-wall` em qualquer página do `dist/`:** por isso a Privacidade descreve a chave do escape sem escrever o nome dela.
- **O stub do `googlefc`** (`tests/e2e/lib/wall.ts`) roda a fila que a página já encheu e troca o `callbackQueue` por um `push` que roda na hora; o enum vai com os nomes e os números, e um caso usa o nome errado do exemplo do Google (`EXTENSION_LEVEL_AD_BLOCKER`).
- **Um `context.route` registrado depois do `serveAsProduction` vence:** é assim que um teste troca o HTML de uma página de fileorca.com.
- **O teste da f-06 precisa recarregar a página com a escolha guardada:** reabrir o aviso na mesma página da primeira escolha passa sem a correção, porque os ouvintes da primeira visita continuam lá.
- **O café saiu do gatilho de quem bloqueia anúncio** (Mudança 11): o `isAdBlocked`, o `adsBlocked` e a prop `adsOn` não existem mais. Quem bloqueia vê a parede, e o café continua no 3º uso, para todos.
- **O `events.ts` está no pedaço comum das ilhas:** uma lista nova de evento pesa na conta de 0,5 KB da ilha (o `adblock_wall` somou 82 B com gzip; o café novo tirou 149).
