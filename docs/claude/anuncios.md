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
- **O Aceitar do aviso próprio depende do fuso do aparelho** (`src/platform/region.ts`, § 428 e § 449): todo spec que leia o payload do Aceitar, ou o modo da parede sem `__tcfapi`, fixa o `timezoneId` (`America/Sao_Paulo` para as quatro chaves e a parede em `bloqueio`; um `Europe/*` ou `Asia/Nicosia` para só o `analytics_storage` e o `aviso`). A CI roda em UTC e esta máquina em `America/Sao_Paulo`, os dois fora da lista: um spec sem o fuso passa aqui e falha num aparelho na Europa.
- **O navegador devolve o nome canônico do fuso, não o do sistema:** o Chipre é `Asia/Nicosia` (nunca `Europe/Nicosia`), e o Chromium e o Node dão `Atlantic/Faeroe` para `Atlantic/Faroe` (o WebKit, não). Fuso novo na lista entra no oráculo (`tests/e2e/lib/region-zones.ts`), que o `region.test.ts` e o `consent.spec.ts` passam pelo `Intl` do Node e dos dois navegadores.
- **Para ver o aviso da parede na UE, a VPN não basta:** ela muda o IP, e a parede lê o `__tcfapi` (que o bloqueador costuma barrar) ou o fuso do aparelho. O roteiro do `docs/OPERACAO.md` (passo 7) manda mudar o fuso do sistema.

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- A F12 R-A-2 não se resolve só com o aviso compacto: no build de teste, com o card de 360 × 128, faltavam distância exatamente as mesmas 307 medidas da revisão da F12 (19 a 1440, 108 a 1920, 60 a 768 × 1024, 120 a 1024 × 1366), porque nas janelas altas o 1º anúncio cai no fim da primeira tela, por baixo do canto do aviso. A regra é o `lower()` do script do aviso (§ 459): desce o 1º anúncio de conteúdo para baixo do aviso, mais 24 px, e o devolve quando o aviso some.
- O `lower()` roda antes da primeira pintura (o script inline espera a folha de estilo) e no `resize`, nunca depois de uma mudança do conteúdo: mexer no anúncio depois da pintura desloca tudo embaixo dele (CLS). O teste do mapa troca a janela com `setViewportSize` na mesma página, e o `resize` recalcula.
- A distância de 1.200 px entre o conteúdo 1 e o multiplex, a densidade e os vãos são medidos depois da escolha, com o anúncio de volta ao lugar.
- **O `boxes()` do `ads.spec.ts` não filtra o que está escondido num `<details>` fechado:** as caixas têm tamanho. Campo escondido entra no DOM só quando aparece (ou o filtro passa a usar `checkVisibility()`). (a ilha de PDF)
- **O `lower()` decide antes de a fonte chegar** (revisão da F13a, d-1; DECISOES § 517): o script inline espera a folha de estilo, não a Figtree nem a Fredoka. Numa primeira visita com o cache vazio ele mede o layout das fontes de reserva, e a troca sobe o anúncio até 92 px no Chromium e 120 px no WebKit (o número de duas linhas de uma calculadora cai para uma; medido em /pt/amortizacao-antecipada/ a 1024 × 1366 e em /es/calculadora-de-amortizacion-de-prestamos/pago-global/ a 768 × 1024). A folga é de 160 px: o anúncio desce quando o topo dele fica a menos de 150 + 160 px da base do aviso, e até lá. O mapa não vê a deriva, porque troca a janela numa página já assentada; o teste de primeira visita fria (contexto novo, janela antes do `goto`, os `.woff2` segurados 600 ms por um `context.route`) vê.
- **O `hide()` não devolve o anúncio** (DECISOES § 518). Só o clique em Aceitar ou Recusar chama o `unlower()`. O `tcf()` só o chama antes da primeira pintura, enquanto o `drawn` ainda é 0. Num teste que esconde o aviso pelo `__tcfapi` depois da pintura, o anúncio continua onde estava.
- **O `boxes()` do `ads.spec.ts` infla a Oli:** quem medir a distância de outra peça com ele recebe a caixa crua; só o `[data-oli]` cresce 12 px.

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **Os alvos novos das calculadoras** (`CALC_TARGETS` do `ads.spec.ts` e `MAP_TARGETS` de `lib/ad-map.ts`): `.fo-rhero__get`, `.fo-rhero__error`, `.fo-calc__fold`, `.fo-disclose`, `.fo-calc__echo`; o grupo `cartao` na tabela do mapa. O teste das calculadoras do `ads.spec.ts` mede também com o bloco de custos aberto.
- **O 1º anúncio da calculadora** fica logo depois da ilha e antes do "How to use" (`[data-content=how]`): o cronograma saiu de depois do anúncio para dentro da ilha. A estimativa (`src/ads/estimate.ts`) segue tratando o `#fo-tool-root` como 300 px.
- **A seção "What we measured" sem `aria-labelledby`:** o mapa (`isMeasured` do `src/ads/map.ts` e o `measured()` do `tests/e2e/lib/ad-map.ts`) a reconhece pelo `data-content="measured"`, que ficou. A ficha (`[data-content="facts"]`) e a moldura (`.fo-guide__frame`) são alvos dos 150 px e grupos `ficha` e `tabela` do relatório do mapa (DECISOES § 565).
- **A home é contada pelos chips:** o `gate:prontidao` lê `TOOL_LINKS` (`main a.fo-tool, main .fo-catband__chips a.fo-chip`, em `scripts/lib/prontidao.ts`), e um chip solto fora de uma faixa (o NextStepChips) não conta como cartão do catálogo. A lista da faixa de dinheiro é a `HOME_BAND_MONEY_IDS` de `src/components/home-bands.ts`, que o portão importa: o módulo não importa os textos (os nomes entram como parâmetro), para o portão rodar no Node sem o `TEXTS` (DECISOES § 570 e § 576).
- **A estimativa a 360 px erra para menos nos chips** (26 px por chip, como item de lista, contra uma fileira de 48 px com 8 px de vão): a home dá 3 anúncios por largura sem ensinar a estimativa, com vãos de 1.632 a 2.944 px. Um texto que encurte a home perto de 1.110 px é pego pelo `fo-ad-map.spec.ts`, que agora pede 3 caixas a 360 e o conteúdo, o multiplex e a lateral a 1280 (DECISOES § 573).
- **As caixas "só no celular" e "só no computador" da F12 não usam `fo-mobile-only` nem `fo-desktop-only`:** elas levam o `data-ad-media` do `adBoxHtml` (`src/ads/map.ts`), escondido por media query no CSS da F12. A ficha da F13b citava as classes; a home seguiu o mecanismo real (DECISOES § 573).
- **A palavra a mais da home:** 3 caixas pedem 450 palavras no `<main>`, e com 600 a lateral 2 entra. A home tem 560, 512 e 524 (en, pt, es); o `home-numbers.test.ts` reprova abaixo de 450 e a partir de 595 (DECISOES § 571).
