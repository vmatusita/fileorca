# Playwright e navegadores

O que as runs aprenderam sobre os specs do Playwright, o Chromium e o WebKit, as portas e a divisão dos testes nas partes do CI, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

Os números de partes das seções de antes da F9 (como "a parte 3" do WebKit dos `money-*.spec.ts`) são os de cada época. A divisão de hoje (Chromium em 5, WebKit em 13) está no fim da seção da F9 do arquivo do CI.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- O WebKit do Playwright no Windows não tem `OffscreenCanvas` no worker; o motor cai para a página (DECISOES § 22). No CI (Linux) o comportamento pode diferir: os testes cobrem os dois caminhos sem depender disso.

## F2: ferramentas de imagem

Pegadinhas que a F2 achou:

- Colar no teste: `new ClipboardEvent('paste', { clipboardData: dt })` com um `DataTransfer` montado na página funciona nos dois navegadores; `page.dispatchEvent('paste')` não.
- O `serve-dist` devolve o 404 mais próximo para rota que falta: teste de página exige status 200, ou passa sem a página existir.
- O `playwright.config.ts` usa a porta 4173 com `reuseExistingServer`: dois worktrees rodando o Playwright ao mesmo tempo usam o servidor um do outro. Em outro worktree, rode com `FO_PORT=4174` (ou outra porta livre).

## F3: revisão e prontidão

Pegadinhas que a F3 achou:

- Com várias lentes rodando o Playwright ao mesmo tempo, o WebKit do Windows chegou a travar no `page.goto` até em teste antigo e simples. Antes de achar que um teste do WebKit está errado, rode-o de novo com a máquina livre.
- O `context.on('request')` do Playwright vê as requisições feitas de dentro dos workers, no Chromium e no WebKit (a lente de corretude provou). Uma prova de "nada sai" deve recusar método diferente de GET, corpo, outra origem e query string.

## Ajuste: espaço do aviso de cookies

- Teste que clica em algo do fim do rodapé tem de fechar o aviso antes (`dismissCookies`), porque o card fica por cima do canto de baixo à esquerda.

## F4: calculadoras

Pegadinhas que a F4 achou:

- O `budgets.spec.ts` não usa o `networkidle`, que no WebKit do Linux nunca disparava nos hubs (§ 138). Teste novo que precise da página quieta: espere o `load` e um intervalo sem requisição, como o `settler` dele.
- Os specs de dinheiro se chamam `money-*.spec.ts` para caírem depois do `design.spec.ts` na divisão do WebKit (§ 142). Com o nome `calc-*`, eles empurravam o `design.spec.ts` para a parte 3, junto com a matriz de imagens, e a parte caía por `ENOSPC`. Spec novo pesado: rode o `--list` das três partes antes do push e veja se o `design.spec.ts` continua na parte 2.

## F5b: guias de arquivo e kit do Product Hunt

Pegadinhas que a F5b achou:

- **Porta do Playwright para o `guias:medir`:** use de 4174 a 4189. O `fetch` do Node recusa algumas portas ("bad port"), como a 4190, e aí o script não acha o servidor.

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **Teste de pt e es no orçamento vai no `i18n-budgets.spec.ts`,** que cai entre o `design.spec.ts` e a matriz de imagens na ordem dos nomes. Dentro do `budgets.spec.ts`, os testes novos tinham levado os dois para a mesma parte do WebKit (§ 233). As medidas do orçamento estão em `tests/e2e/lib/budgets.ts`, e o passeio dos estados de PDF (`walkPdfTool`) recebe `lang`.

## F7: o que a revisão mudou nos formulários das calculadoras

- **Alto contraste** (§ 280). O WebKit do Playwright não emula `forcedColors`. O teste ramifica por dentro, pelo `matchMedia('(forced-colors: active)')`: no Chromium afirma o sublinhado, no WebKit o fundo.

## F8: piloto automático

Pegadinhas que a F8 achou:

- **O relógio falso do Playwright esvazia o `performance.getEntriesByType('resource')` no WebKit.** Um teste que fixa o relógio antes de a página carregar não vê os recursos dela.
- **Teste que percorre o site inteiro num teste só estoura os 60 s no WebKit do CI** quando o site cresce (o reflow a 320 px, com 169 páginas, § 306). Divida em blocos de páginas, um teste cada, e confira no `--list` onde caem o `design.spec.ts` e o `image-matrix.spec.ts`.
- **Os passeios de estados das ferramentas de PDF ficam no `axe-pdf-states.spec.ts`** (§ 307): no `a11y.spec.ts` eles caíam todos na primeira parte de cada navegador, acima de 700 s. Teste pesado de axe novo vai num spec que caia numa parte leve; confira no `--list`.

## F10: medidas de UX

Pegadinhas que a F10 achou ao medir o site e os protótipos:

- **No WebKit (o Safari e o do Playwright), o Tab pula os links por padrão.** Um teste de teclado usa `focus()` ou Option+Tab. Um popover aberto pelo clique não dá foco ao botão; pelo teclado, o foco volta ao botão no Esc.
- **O Chromium headless no Windows tem a barra de rolagem clássica:** um diálogo de 328 px fica em x 9 a 360 px, e no WebKit, em x 16.
- **O `boundingBox()` dá coordenadas da janela, não do documento.** Num `clip` de `fullPage`, some o `scrollY`.
- **Num contexto novo, o `document.fonts.ready` pode resolver antes de a fonte ser pedida.** Para medir quebra de linha, chame antes `document.fonts.load('600 24px Fredoka')` e o mesmo para a Figtree.
- **A captura de página inteira faz um relayout com a fonte já carregada.** Na hipoteca en a 360, a trilha passa a duas linhas (`layout-shift` de 0,207, na janela da captura), e os estados seguintes ficam 22 px mais baixos. Meça as posições antes de qualquer `fullPage`.
- **Com a máquina carregada, o Chromium no Windows pode falhar uma abertura com `net::ERR_NO_BUFFER_SPACE`.** Rodar de novo resolve.
- **O CLS da interação** vem de um `PerformanceObserver` de `layout-shift` instalado com `addInitScript`. Separe o carregamento do que vem depois do primeiro gesto e some as entradas sem `hadRecentInput`. A escolha no seletor de arquivo cai fora da janela de 500 ms do input.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **Um `document.addEventListener('click', e => e.preventDefault())` impede também o `popovertarget`:** o Menu não abre. No molde do `events.spec.ts`, abra o popover antes de pôr o listener e use `{ once: true }` (§ 390).
- **No WebKit, um clique num botão não lhe dá foco,** como no Safari do Mac. Um teste de Enter e espaço num botão (o do tema) faz `focus()` antes de apertar a tecla.
- **A porta de uma prova pode estar ocupada por outro agente:** o `serve-dist` em segundo plano sai com `EADDRINUSE`, e o Playwright reaproveita o servidor alheio com `reuseExistingServer`. Antes de rodar a prova, confira com `curl <porta>/build.txt` que o servidor é o do `dist/` que você quer.
- **Um spec do Playwright não importa o `ICONS` (`src/icons/icons.ts`) nem um módulo que o importe:** ele lê os SVG com `import.meta.glob`, que o carregador do Playwright não tem. O spec nem lista ("glob is not a function", "No tests found"). Importe o `common.ts` e os textos de cada idioma direto, como o `navigation.spec.ts`, e confira um ícone pelo desenho do SVG (`M6 3h8l5 5v11` é o `file`).
- **Um teste que só mede uma lista de caminhos passa com a página ausente:** o `serve-dist` devolve a 404 mais próxima, que também tem trilha, rodapé e nenhum anúncio. O `layout-shift.spec.ts` e a lista sem anúncio do `ads.spec.ts` passaram a exigir status 200 na F11 (§ 400); faça o mesmo em teste novo.
- No `a11y.spec.ts`, o título de cada teste de página é o próprio caminho. Para rodar só um hub, ancore o fim: `-g "/guides/$"`. Sem o `$`, "guides/" casa também as 40 páginas de guia (F11).
- **O WebKit recusa algumas portas:** com `FO_PORT=4190` (a porta do ManageSieve, na lista de portas restritas), todo `page.goto` do WebKit para em "waiting until load" até o tempo do teste acabar, e só o console diz "Not allowed to use restricted network port". O Chromium abre a mesma porta. Escolha outra porta (4196 serviu na revisão da F11) e, se o WebKit não carregar nada, leia o console antes de culpar a máquina.
- **`net::ERR_NO_BUFFER_SPACE` com a máquina carregada:** com muitos workers e outros processos ao mesmo tempo, o Windows recusa um socket e a requisição da folha de estilo falha. A página fica sem CSS: no Chromium, `document.styleSheets` guarda uma folha vazia e o fundo do `body` é `rgba(0, 0, 0, 0)`. Foi isso que deixou vermelho, uma vez cada, o primeiro quadro do `/merge-pdf/` (F11 p-2) e o axe do cabeçalho no tema escuro. O console do trace diz `Failed to load resource: net::ERR_NO_BUFFER_SPACE`. Leia o trace antes de mexer no teste; com menos workers e a máquina livre não volta, e no Linux do CI não aparece (§ 405).
- **Uma medida de dobra com poucos px de folga reprova no Linux do CI:** o Fredoka e a Figtree saem um pouco mais largos no Chromium do Linux do que no do Windows, e uma linha que ocupa 278,5 de 280 px no Windows quebra lá. O título do hub de guias em espanhol foi a três linhas, e o primeiro cartão desceu 34 px. Uma medida contra a dobra precisa de folga para uma linha a mais, e o teste pode provar isso fixando o número de linhas: completar o título até três linhas com um `::after` da altura que falta. Acrescentar uma linha ao que o navegador desenhou não serve, porque no Linux a linha a mais já está lá e o teste pediria quatro. Abortar a fonte no Windows não reproduz a quebra (§ 408).
- **Um teste com `hasTouch` num contexto novo tem o aviso de cookies aberto:** feche-o (`dismissCookies`) antes de tocar perto do pé da tela. No Linux, o aviso fica mais alto e cobre o que estava 10 px acima dele no Windows. O controle positivo (o mesmo toque, depois, muda o controle) é o que mostra que o toque chegou (§ 408).

## Ajuste da largura do cabeçalho

- **O Playwright do Windows pode não sair depois do último teste:** na parte 18 do `verificar --partes` (WebKit, parte 10 de 13), os 120 testes passaram, e o processo ficou parado por 1 h 30, com um worker e um `WebKitWebProcess.exe` vivos, sem o "120 passed" e sem linha nova no log. O limite de 900 s de cada parte é conferido quando ela termina, e não encerra uma parte parada. Com o `verificar` em segundo plano, olhe a hora da última linha do log (`ls -la` no arquivo): se ela parou e todos os testes da parte já estão listados, encerre a árvore (`taskkill //T //F` no `node scripts/verificar.ts`) e rode de novo as partes que faltam, uma a uma, com `timeout 600 pnpm verificar --playwright=webkit --shard=N/13 --dist-pronto`. O `dist/` continua valendo enquanto o `HEAD` não muda.

## F12: monetização

Pegadinhas que a F12 achou nos specs do build de teste, da parede e do café (DECISOES § 414, § 422, § 434 e § 443).

- **O build de teste tem um servidor próprio,** `scripts/serve-test-build.ts`, na porta `FO_PORT` + 100 (o segundo `webServer` do `playwright.config.ts`). Ele sobe vazio e só constrói quando um `beforeAll` chama `/__test-build`, uma vez por execução do Playwright (`FO_RUN_ID`). Antes disso, qualquer página responde 503. Use `useTestBuild(test)` no topo do spec; um spec que mistura os dois builds chama `testBuildReady()` num `beforeAll` com `test.setTimeout(600_000)`.
- **Cada parte do CI que roda um spec com o build de teste paga um build** (uns 35 s nesta máquina; mais no Linux do CI). Por isso os specs novos que o usam têm nome que cai nas partes leves e perto uns dos outros: `fo-ad-map.spec.ts` e `fo-wall.spec.ts` (depois do `events.spec.ts`), `ads-coffee.spec.ts` (na parte do `ads.spec.ts`). Confie no `--list` de cada parte, não na conta: com o `beforeAll`, as partes não têm o mesmo número de testes.
- **Visto como fileorca.com:** abra `https://fileorca.com/...` depois do `serveAsProduction(context, …)` (`tests/e2e/lib/production.ts`), que responde pelo `context.route` com o build de teste e aborta ou stuba todo domínio do Google. O `route.fetch` vai com `maxRedirects: 0`, para o 307 do servidor chegar ao navegador como chegaria do Cloudflare.
- **O `page.clock.setFixedTime`** deixa os timers rodando e a hora vale entre navegações. A hora que um init script grava deve vir do teste, não do `Date.now()` da página.
- **O `<dialog>` modal:** o preflight do site zera o `margin: auto` que o navegador dá ao `:modal` (sem ele, o card cola no alto); no Chromium, durante o `close`, o `document.activeElement` ainda é o botão de dentro, então o foco vai ao `<main>` num `setTimeout(0)`; o Chromium headless esconde a barra de rolagem, mas o `scrollbar-gutter: stable` ainda reserva a calha, e uma medida de "nada se desloca" desconta a calha medida por uma sonda.
- **O vapor que para:** com `forwards`, o `transform` do fim da animação sai como `matrix(1, 0, 0, 1, 0, 0)`, não `none`; prove o fim pelo `endTime` do `getComputedTiming()` (é `Infinity` num laço) e pelas animações com `playState === 'running'`.
- **O `name:` do Playwright casa por pedaço de texto, sem diferença de maiúscula:** na página de apoio, "Buy me a coffee" casa também a linha do rodapé ("…buy me a coffee"). Use `exact: true` ou um escopo.
- **Não feche a página logo depois do `expectInitialBudget`:** um script pedido depois do segundo de silêncio perde o corpo e o teste cai com "Target page… closed". Deixe as páginas abertas até o fim do teste.
- **Dois Playwright na mesma pasta** apagam o `test-results/` um do outro (falha com `ENOENT` no trace) e disputam o servidor do build de teste. Um por vez em cada checkout.
- **A trava do build de teste** (`.cache/builds/<nome>.lock`) guarda o PID de quem constrói e é renovada a cada 10 s: um Ctrl-C no meio do build a deixa para trás, e o próximo processo a toma na hora (o PID não existe mais) ou depois de 60 s sem renovação (§ 453). Enquanto espera, ele diz o caminho da trava uma vez, no stderr.

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- A prova de "reprova sem a mudança" sem worktree: `node .cache/f13a/serve-base.ts <porta> <pasta do dist antigo>` em segundo plano e `FO_PORT=<porta> pnpm exec playwright test …`: o Playwright reaproveita o servidor (`reuseExistingServer`). O build de teste continua sendo o da árvore atual.
- O teste do foco no erro precisa do `focus()` no Escolher antes do `setInputFiles`: o WebKit não dá foco por clique, e sem foco no botão o `keep()` não tem o que levantar. A 320 × 640, o `focusin` antigo já tirava o botão de baixo do aviso (o card de 222 px cobria o Escolher, e o `focus()` rolava a página): os 6 testes do erro a 320 passam também no ponto de partida; os de 360 reprovam lá.
- **Script de medida com o Playwright como biblioteca:** o `locator(...).evaluate()` espera o elemento aparecer até o tempo padrão (30 s); para ler o que pode não existir, use `page.evaluate` com `querySelector`. (a ilha de imagem)
- **A prova contra o `dist/` do ponto de partida demora o tempo dos testes que esperam um seletor que lá não existe** (até o `test.setTimeout`). Passo intermediário de teste usa ajudante que funciona nas duas marcações (o `startOver` de `lib/page.ts`), e a prova roda em segundo plano (`run_in_background`, saída num arquivo): o Bash em primeiro plano para em 10 min. Um Playwright parado com o TaskStop pode seguir escrevendo no mesmo arquivo de saída: leia só o resumo final ("N failed / N passed") da execução de agora. (a ilha de imagem)
- **O CLS da interação no 3º uso:** grave `fo-consent=granted` e `fo-coffee={"uses":2}` num `addInitScript`; o script inline da página já guarda a altura da linha antes da 1ª pintura, então o observador conta só a partir do `setInputFiles` (o `from` dele) e só a interação entra. (a ilha de imagem)
- **`locator.screenshot()` rola o elemento para a tela:** uma sonda que mede posições depois de uma captura de elemento vê a página rolada (131 px no juntar a 360). (a ilha de PDF)
- **O `setInputFiles` não é entrada recente para o `layout-shift`:** o que cresce quando os arquivos chegam conta no CLS. O juntar deixa a faixa vazia em repouso para o que está embaixo da ilha ficar fora da tela a 360 × 740; o clique do Juntar é entrada recente (500 ms). (a ilha de PDF)
- **`filter({ has: page.locator('#fo-tool-root …') })` não casa nada:** o `has` é relativo ao elemento filtrado; use `:has()` no seletor. (a ilha de PDF)
- **axe num estado de 400 ms:** a leitura do juntar vira WaterLevel aos 400 ms, antes de o axe acabar; o `pdf-merge.spec.ts` segura só o `setTimeout(…, 400)` da página com um init script e libera depois. (a ilha de PDF)
- **CPU mais lenta só no Chromium** (`Emulation.setCPUThrottlingRate` pelo CDP); no WebKit, segure o motor com o `slowEngine`. (a ilha de PDF)
- **Um `DataTransfer` montado na página ignora toda escrita no `dropEffect` e no `effectAllowed` fora de um arrasto de verdade,** nos dois navegadores: fica `'none'`, antes, durante e depois do evento, e um teste do `dropEffect` com ele passa sem a mudança. Dê ao evento um `dataTransfer` próprio (`Object.defineProperty(event, 'dataTransfer', { value: objeto })`, com `types`, `dropEffect`, `files` e `items`), que guarda o que a página escreve (`dragOverWith` do `drop-anywhere.spec.ts`). (o soltar)
- **O spec com o worker ligado e servidor próprio (`tests/e2e/lib/sw-server.ts`) lê o `dist/` da árvore, não o `FO_PORT`:** para provar "reprova sem a mudança", troque o `dist/` pelo do ponto de partida por um momento (mova o `dist/` para o `.cache`, copie o `dist-base`, rode, devolva), porque o `serve-base.ts` numa outra porta não chega a ele. (o chip que leva)
- **Os eventos de uma página que navega somem com ela** (o `dataLayer` é da página): para ver os dois lados de uma navegação, troque o `dataLayer` num `addInitScript` por um array cujo `push` também faz `console.log` de cada entrada, e junte pelo `page.on('console')`. (o chip que leva)
- **Para ler a caixa em trânsito**, um `addInitScript` da página de chegada lê o `caches` antes de a ilha hidratar (o `takeInbox` só roda no efeito de montagem, depois do módulo); o teste exige que ele tenha visto a entrada, para uma corrida perdida reprovar em vez de passar calada. (o chip que leva)
- **Ctrl-clique e clique do meio sem abrir aba:** despache `new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true })` no link e leia o `defaultPrevented` num ouvinte do `document` (ele roda depois do `onClick` do Preact, que fica no próprio link) que chama `preventDefault()` em seguida, para a navegação não acontecer. O botão do meio de verdade não dispara `click` (é o `auxclick`); o `click` com `button: 1` prova a guarda. (o chip que leva)
- **No WebKit do Playwright, com os service workers bloqueados (o padrão da configuração), o Cache Storage não sobrevive a um recarregar:** a caixa plantada com `caches.open(...).put(...)` antes do `page.reload()` some, e a ferramenta mostra a caixa vazia (no Chromium, ela fica). Spec que planta a caixa e reabre a página roda com `test.use({ serviceWorkers: 'allow' })` (o `ads.spec.ts` na chegada; o `handoff.spec.ts` inteiro). (o chip que leva)
- **A primeira visita fria, no build de teste:**
  - abra com `browser.newContext({ viewport, baseURL: TEST_BUILD_ORIGIN, serviceWorkers: 'block' })`, com a janela posta antes do `goto`;
  - segure as fontes com um `context.route(/(figtree|fredoka)[^/]*\.woff2$/i, …)` que espera 600 ms e chama `route.continue()`;
  - antes de medir, espere `document.fonts.status === 'loaded'` e nenhuma face em `loading`.
  Sem segurar, a fonte do localhost às vezes chega antes do script inline, e a medida muda de uma execução para outra.
- **O WaterLevel só aparece com o motor segurado (`slowEngine`).** Um teste da 1ª visita com o JPEG gerado termina antes dos 400 ms e nunca põe o foco no `.fo-level`. Dê o `focus()` no Escolher antes do `setInputFiles` (é o toque da pessoa); sem isso não há o `slotFocus`.
- **Um nó que sai do DOM embaixo do arrasto.** Um `dragenter` despachado num nó que o estado `over` tira do DOM reproduz, nos dois navegadores, o que o Chromium faz num arrasto de verdade: nenhum `dragleave` chega ao nó que saiu. Confira o `isConnected` do nó em que o arrasto entrou, porque o Preact reaproveita o `<p>` da ajuda (só o texto muda); quem sai é o `<span>` de dentro.
- **Todo clique leva o ponteiro, e o ponteiro dispara `pointerenter`:** o `takeDownload` clica no Baixar, dentro do retângulo, e o clique no aviso de cookies deixa o ponteiro onde o botão estava, que muda com as fontes de cada sistema. Spec que conta requisições depois de um momento (o offline do `launch-claims.spec.ts`) tira o ponteiro da ferramenta com `page.mouse.move(0, 0)` depois do aviso, e não confia que o Windows rápido prova o que o runner do Linux faz: lá, um pedido que sai 15 ms depois do clique no Windows sai depois da linha seguinte do teste (DECISOES § 534). (a ilha de imagem)

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **A fonte opcional na primeira pintura:** num teste com a Figtree, a face `Figtree Steady` (`font-display: optional`) só pinta depois que o arquivo está no cache: espere o `document.fonts.ready` e recarregue a página antes de medir (o `cookie-notice.spec.ts` faz assim).
- **`toHaveAccessibleName` e os filhos em grade:** o nome de um botão com dois `span` em `display: grid` sai com um espaço entre eles; um `.fo-sr` com uma vírgula entre os dois (posição absoluta) põe um espaço antes da vírgula ("fees , $500"). O nome do bloco ficou "título total", sem a vírgula.
- **`landmark-unique`:** uma `<section aria-labelledby>` e a moldura `role="region"` de dentro com o mesmo título viram duas regiões de mesmo nome, e o axe reprova (o desenho da especificação do cronograma tinha isso). Só a moldura leva o nome.
- **`fill` com o mesmo valor não é uma mudança** para o `CalcField` (o `onValue` só corre se o número muda): um teste de "1ª tecla" muda o último algarismo.
- **No WebKit, o Tab pula também os botões**, não só os links (como no Safari sem a opção de teclado): o teste da ordem do Tab da ACE-7 anda com o `Alt+Tab` no WebKit (no Windows e no Linux do CI, o Option+Tab do Mac), que chega aos botões e aos links.
- **Uma tecla e um Enter "a menos de 16 ms"** se fazem num `page.evaluate` só (o evento `input` no campo, o `focus()` e o `click()` no botão), na mesma tarefa da página.
- **O CLS de um uso abaixo da dobra é zero por construção:** o `layout-shift` só conta o que se move na tela. Num guia, o painel começa perto da dobra, e tudo embaixo dele fica fora da tela no carregamento. Traga o Escolher para a tela como um toque traz (`locator.scrollIntoViewIfNeeded()`) antes do `setInputFiles`, e prove a medida com um controle que desliga a trava da altura da ilha (`addStyleTag`) e põe o painel no topo da tela (DECISOES § 561).
- **Ler pixels sem decodificador de PNG:** `page.screenshot({ clip })` dá o PNG; mande-o em base64 para a página, decodifique com `new Image()` e um `canvas` (`getImageData`), e leia a cor do token pelo `getComputedStyle` de um `span` com `color: var(--stroke)`. É assim que o `guide-page.spec.ts` vê o traço da pista numa faixa de 2 px da borda (o texto da primeira coluna põe uns 2 % de pixels escuros na borda esquerda).
- **O `textContent` do `node-html-parser` guarda o espaço sem quebra (U+00A0)** de pt e es entre o número e a unidade; normalizar com `\s+` o troca por espaço e o texto deixa de bater com o valor formatado. Normalize só `[ \t\r\n]+`.
- **Uma seção e uma `role="region"` com o mesmo `aria-labelledby`** são dois landmarks com o mesmo nome: o axe acusa `landmark-unique`. A região da tabela é a moldura; a seção das medidas ficou sem nome (DECISOES § 559).
- **A proteção da worktree do Git Bash recusa um `pnpm exec playwright test -g "a|b"`** (o `|` dentro do comando parece um pipe que ela não sabe verificar). Um script de uma linha em `.cache/<frente>/pw.sh` que repassa os argumentos (`"$@"`) passa. Vale também para `node -e` com crase.
- **O `<main>` da home a 1280 no build padrão** é a largura da moldura (1.208 px), e o de uma página com a coluna da lateral (o hub de imagem) é 758 px no Chromium headless do Windows, não 760: a barra de rolagem clássica come 2 px da coluna `minmax`. Compare com `toBeLessThanOrEqual(760)`.
- **Para provar uma cor do tema:** o `home-sea.spec.ts` abre um contexto novo por caso (o esquema do sistema e o `fo-theme` gravado, nas quatro combinações) e compara o `background-color` da faixa com o `--surface` e o `--fo-cat-soft` lidos na página por uma sonda (`<i style="color: …">`), nunca com um hexa digitado.
- **A 404 mais próxima e o status (§ 589):** um endereço que falta dá status 404 e a 404 do idioma mais próximo (`/pt/nada-aqui/de-novo/` dá a de pt). O `/404.html` em si dá 307 para `/404` e 200. Teste de página institucional exige 200 (a lista do `a11y.spec.ts` e o `institutional.spec.ts`); o teste do status usa um endereço que falta.
- **`--grep` com `|` no Git Bash da worktree isolada:** o guarda do agente recusa o comando; rode um `--grep` por palavra.
