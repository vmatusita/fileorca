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
