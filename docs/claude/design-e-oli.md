# Design system, Oli e fontes

O que as runs aprenderam sobre o CSS, os tokens, a Oli, os ícones, as fontes e o CLS e o aviso de cookies, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- Preact 11: os tipos de evento (`TargetedMouseEvent`) vêm de `preact`, não de `JSX.*`.

## F1b: design system e Oli

- O CSS do site é `src/styles/global.css` (entrada), `theme.css`, `fonts.css` e `components.css`, que viram um CSS só por página. O `bundle.css` de `docs/design/` é referência, nunca import. `color:` só com tokens de texto, movimento só por `transform`/`opacity`/`translate`/`scale`/`rotate`, e sem transição de cor (o `gate:design` e o `design-checks.test.ts` reprovam).
- `src/styles/theme.css` e `docs/oli/folha.html` são gerados: depois de mudar `docs/design/tokens.json` ou um SVG da Oli, rode `pnpm design:gerar` e commite os dois (os testes reprovam o arquivo desatualizado). O tema é `@theme reference inline` com `source(none)`: nenhuma classe sai do texto, e o amarelo não entra no tema.
- O sprite da Oli é montado no build por `src/oli/sprite.ts`. Uma página que mostra a Oli passa as poses em `<BaseLayout oli={[…]}>` (a `peek` entra sempre) e usa `Oli.astro` (`[data-oli]` com `<svg><use href="#oli-pose"/></svg>`, sem viewBox no host). Na ilha, as poses que o cliente troca vão em `PANEL_POSES` e a página as passa ao layout. Pose fora da lista fechada não entra sem decisão.
- Ícone: `Icon.astro` nas páginas (lê todos de `docs/design/assets/Icons`); na ilha, importe o SVG com `?raw` e use `src/icons/Icon.tsx`, para só os ícones usados irem ao JS. Ícone novo entra em `docs/design/assets/Icons/` com decisão, e o nome em `ICON_NAMES`.
- `pnpm screenshots` gera os PNG dos componentes nos dois temas em `docs/relatorios/fase-01b/` sobre o `dist/` (rode `pnpm build` antes). Não entra no `verificar`.

Pegadinhas que a F1b achou:

- Preact sem `compat` não converte `strokeWidth`: em SVG escreva `stroke-width`. Use `href` no `<use>`; `xlinkHref` sai diferente no servidor e no cliente.
- O `node-html-parser` devolve `tagName` em maiúsculas e o seletor `clipPath` não casa: compare `tagName.toLowerCase()`.
- `document.getAnimations()` ainda vê animação finita com o truque de 1 ms do `bundle.css`; o movimento reduzido do site usa `animation: none` e `transition: none`.
- O Lightning CSS reescreve `U+0000-00FF` como `U+??` e põe hex em minúsculas: teste sobre o CSS do build compara nomes e `var()`, não o texto do `tokens.css`.
- `resvg` copia `render().pixels` a cada acesso; guarde numa variável antes do laço.
- `ch` segue a fonte em uso: largura em `ch` muda na troca da fonte (CLS). Use `--fo-measure` (rem).

## F3: revisão e prontidão

Pegadinhas que a F3 achou:

- O `html` não tem fundo, então o fundo `--bg` do `body` pinta a tela inteira. Padding ou margem no `body` aparece como faixa clara depois do rodapé. Espaço reservado no fim da página vai no `.fo-footer` (`--fo-bottom-room`, do aviso e da âncora), nunca no `body` (§ 91 e § 101).
- Os screenshots de página do `pnpm screenshots` abrem com o consentimento já gravado, então o aviso de cookies não aparecia neles. A F3 acrescentou o fim da página com o aviso aberto, e a pasta passou a `docs/relatorios/fase-03/componentes/`. O script apaga a pasta dele antes de gravar: não ponha outros arquivos lá.

## Ajuste: espaço do aviso de cookies

- O aviso de cookies aberto flutua sobre o fim da página e não reserva espaço ali (DECISOES § 106). O espaço embaixo do rodapé (`--fo-bottom-room`) só abre quando um foco do teclado no fim da página ficaria embaixo do aviso, e quando a âncora do AdSense está na tela. Não volte a reservar a altura do aviso para todo mundo: no fim da página isso aparece como uma faixa vazia, que o Victor recusou duas vezes, primeiro clara (§ 91) e depois azul (§ 106).

## F5b: guias de arquivo e kit do Product Hunt

Pegadinhas que a F5b achou:

- **O CSS do site não tem `--color-*`**: o tema é `@theme reference`, e as variáveis no build são `--deep`, `--on-deep`, `--bg`, `--stroke` e `--radius-lg`.

## F8: piloto automático

Pegadinhas que a F8 achou:

- **A trilha de navegação e o aviso de cookies usam a face `Figtree Steady`** (`--fo-font-steady`, o mesmo arquivo da Figtree com `font-display: optional`, § 305; o `.fo-cookie` redefine `--fo-font-text` para ela). Os dois ficam com a fonte da primeira pintura, então não mudam de linha quando a Figtree chega. Com `swap`, a trilha volta a empurrar a ferramenta na primeira visita no celular (CLS até 0,27), e o card de cookies cresce (0,095 no Lighthouse). Texto novo que aparece na primeira visita e empurra a página ou muda de altura fixo na tela vai para essa face. Não reserve altura na trilha: duas linhas reservadas põem o resultado de cinco calculadoras abaixo da dobra (§ 124).
- **Medida de fonte atrasada sem o consentimento gravado:** o aviso de cookies só aparece na primeira visita de verdade. Uma varredura ou um teste que grava o `fo-consent` antes de abrir a página não vê o card (foi assim que o 0,095 do Lighthouse escapou das varreduras da § 305).
- **A `Figtree Fallback` tem `size-adjust: 101.2%`** (§ 305), escolhido pela varredura de todas as páginas de 320 a 412 px, cada uma num contexto novo, com a Figtree segura até a primeira pintura (o `firstVisit()` do `layout-shift.spec.ts` faz o mesmo numa página; o spec guarda as páginas da borda de cada largura). No Chromium a fonte de reserva não engorda no negrito; no WebKit, sim. Mudou a fonte, a calibração ou um texto perto da borda: rode o `layout-shift.spec.ts`.
- **No WebKit, uma página de hub não pinta enquanto a Figtree está segura:** o `requestAnimationFrame` não roda. Teste que segura a fonte espera a pintura com um teto (`setTimeout`), como o `painted()` do `layout-shift.spec.ts`. E o WebKit ainda usa uma face `optional` que chega nos 100 ms depois do pedido: para provar a fonte "atrasada", solte-a depois disso.
- **O CLS de texto com a fonte atrasada depende do sistema:** a mesma página deu 0,046 aqui e 0,257 no Linux do CI, porque a fonte de reserva se desenha diferente (§ 305). Um teste de fonte afirma o que a página garante (a trilha e o H1 parados) e imprime o CLS; o limite de CLS do projeto é o do Lighthouse.

## F10: proposta de UX/UI

Pegadinhas que a F10 achou (nos protótipos sobre o `docs/design/`; valem para quem construir a partir deles):

- **O `bundle.css` do `docs/design/` não é o CSS do site.**
  - **Medidas que diferem:** o site reserva 300 px no AdSlot de conteúdo e 644 px na lateral (o bundle diz 280 e 624); o `fo-seg__opt` tem 48 px (o bundle, 44); a Oli da DropZone fica em `top: -86px` no celular.
  - **Nomes que colidem:** o `.fo-hero` do bundle é o ResultHero das calculadoras, e o site usa o mesmo nome para o herói da home e da 404 (o ResultHero do site é `.fo-rhero`). O `.fo-page` do bundle é a prévia do ToolPage, com 360 px de largura, e colide com a célula da grade de páginas do PDF.
  - **Uma regra que o site não tem:** a `.fo-result__support a` pinta de branco também o botão da linha do café.
- **A animação de uma peça da Oli dentro de um `<use>` (o vapor da `coffee`) mira o elemento do `<symbol>` no sprite.** O seletor precisa pendurar num ancestral do sprite (`html`, `body`), nunca numa seção da página: o símbolo não descende dela.
- **Trocar a lista `animation` de [a] para [a, b] preserva a animação `a`** (o mesmo nome na mesma posição) e só começa a `b`. É assim que um aceno curto no `:hover` não recomeça o aceno de 3 s.
- **Uma regra `.x { display: grid }` vence o atributo `hidden`.** Use `.x:not([hidden])`. No `<dialog>`, o `display: flex` vai só em `[open]`, senão o diálogo fechado aparece.
- **O `::backdrop` herda as variáveis do `<html>`** a partir do Chrome 122 e do Safari 17.4.
- **Um `[popover]` no top layer com `position: absolute` usa o bloco inicial como referência.** Só o anchor positioning acerta a posição: o Chromium e o WebKit do Playwright suportam, com uma reserva `top`. Zere o estilo do navegador (`position: fixed`, `inset: 0`, `margin: auto`, `overflow: auto`).
- **Com cores forçadas, uma borda transparente aparece, e uma marca de estado feita só de borda ou de fundo some.** Marque o estado com peso ou com ícone também.
- **`aria-labelledby` num `<code>` reprova no axe** (`aria-prohibited-attr`): use um rótulo visível antes do código.
- **O `.fo-prose p` vence uma classe simples dentro de um cartão posto em texto corrido.** Use `span` ou um seletor `.fo-prose .x`.
- **Os ícones de `docs/design/assets/Icons/` têm `stroke="#0F1B2D"` no `<svg>` raiz,** como o `tests/unit/icons.test.ts` confere. Um ícone com `currentColor` no raiz, como os do UX-01 na proposta, reprova o teste: converta ao mover.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **No Chromium, um texto `font-display: optional` que estava em `display: none` na primeira pintura usa a fonte se ela já tiver chegado quando o texto aparecer** (o código do idioma a 320 px, alargado a 768 px depois de a Figtree chegar, mudou 2 px). Numa largura fixa, a Steady fica parada. Meça "a fonte segura e solta" com um contexto novo por largura, nunca redimensionando a página que já pintou (`header-menu.spec.ts`, § 388).
- **O `bundle.css` do `docs/design/` não tem o preflight do site,** então tudo nele é `box-sizing: content-box`. Uma linha de `min-height: 52px` com padding e borda dá 64 px no preview. Regra nova de componente no bundle leva `box-sizing: border-box` (a região do Header, § 388).
- **Um link-cartão com as partes em `span` cola as palavras no nome dele:** sem espaço no HTML entre os itens de grade, o `textContent` (e o `structuredText` do node-html-parser) fica "GuideHow to…". Ponha `{' '}` entre as partes: entre itens de grade o espaço não aparece na tela (o GuideCard, § 395).
- **A faixa e os chips do topo de um hub também mudam de linha quando a Figtree chega:** no hub de guias, a frase da faixa a 412 px (en) e os atalhos a 393 px (pt) empurravam os cartões de 26 a 56 px (CLS 0,108 no Chromium). Texto do topo de página nova vai na face `Figtree Steady`, como a trilha. Leia o `[cls]` que o `layout-shift.spec.ts` imprime para a página nova: o teste só reprova a trilha, o H1 e o aviso, não o CLS (§ 393).
- **Um listbox com `role="group"` dentro:** o `n`-ésimo filho da lista deixa de ser a `n`-ésima opção. Numere os ids na ordem da tela, role a própria opção (`querySelectorAll('[role="option"]')[n]`) e monte o array dos resultados já na ordem dos grupos, para o Enter abrir o que está marcado (a busca, § 397).
- **O clique que fecha um popover automático segue para o que está embaixo** (a luz de dispensa do navegador; o Menu e o menu de idioma). A partir de 768 px, o clique fora da folha aberta cai na DropZone de uma ferramenta e abre o seletor de arquivos, no Chromium e no WebKit. Abaixo de 768 px, a folha cobre a DropZone, mas um toque logo abaixo dela muda um controle (um rádio do Rotate image). Um `::backdrop` com `pointer-events: auto` não segura o clique. Segura só com CSS, sem script (segunda passada da revisão, § 405): com um menu aberto, `pointer-events: none` no `.fo-frame`; e, como no WebKit o clique de um toque chega depois de o menu fechar, uma folha sem pintura (`body::after`, sob o cabeçalho, que ganhou `z-index`) fica 400 ms a mais e sai por `scale`, com `transition-delay`. Um teste que clica na página logo depois de fechar um menu espera a página voltar a receber o ponteiro (o `takesPointer` do `header-menu.spec.ts`); clique por coordenada (`page.mouse`, `page.touchscreen`), porque o `locator.click` espera o elemento receber o ponteiro.
- **O `gate:design` só aceita transição de `transform`, `opacity`, `translate`, `scale` e `rotate`:** para atrasar outra coisa (o `pointer-events` que volta depois de um menu fechar), use um elemento que sai por `scale` com `transition-delay`, nunca uma transição de `pointer-events`. E o minificador põe o `transition-behavior` antes do atalho `transition`, que o zera: se precisar do `allow-discrete`, escreva-o dentro do atalho. O `transition: none !important` do movimento reduzido (`global.css`) apaga qualquer atraso: um atraso que não move nada na tela precisa da sua exceção com `!important` (§ 405).

## Ajuste da largura do cabeçalho

Pegadinhas do ajuste que deu ao cabeçalho as bordas do rodapé (DECISOES § 409).

- **O cabeçalho e o rodapé leem a mesma borda,** `--fo-edge` (`components.css`). Mude a borda num, e o outro muda junto. O teste de bordas do `header-menu.spec.ts` confere as duas em 14 larguras, de 320 a 1920 px. Abaixo de 340 px, a borda é 16 px, porque a 320 px o cabeçalho usa 282,5 dos 288 px: controle novo no cabeçalho do celular não cabe. A troca não fica em 360 px por causa do rodapé: com 16 px de 356 a 359 px, ele ganhava a segunda coluna e a perdia a 360 (o mesmo teste confere que o rodapé nunca perde coluna ao alargar).
- **Um `100%` dentro de uma variável é resolvido onde ela é usada.** No `padding` do cabeçalho e do rodapé, ele é a largura do `body`. No `right` de um popover, que está na camada superior, é a largura da janela. As duas coincidem, então a reserva sem anchor dos menus fica na borda do cabeçalho.

## F12: monetização

Pegadinhas que a F12 achou na pose `sad`, na parede e no café (DECISOES § 417, § 426, § 439 e § 440).

- **A Oli tem dez poses desde a F12:** a `sad` entrou na lista fechada, só para a parede do bloqueador (Mudança 12 do `PLANO-MELHORIAS.md`). O núcleo do `CLAUDE.md` ainda diz "nove poses fechadas", porque a F12 não podia mexer nele (§ 417): vale a Mudança 12. A pose da parede é a constante `WALL_POSE` (`src/oli/poses.ts`); o `gate:design` e o `default-build.test.ts` reprovam a `sad` no `dist/` padrão.
- **O tema escuro no `::backdrop`:** o `theme-pair.test.ts` exige o par no mesmo elemento e dentro de `@media screen`. O mar da parede é uma variável privada do componente (`--fo-wall-sea`), com a `water` em `:root` e o `deep` no `html` escuro; não é token.
- **O movimento reduzido não chega ao `::backdrop`:** ele não está no `*, *::before, *::after` do `global.css`, e precisa de linha própria.
- **Um rótulo com hífen quebra no hífen:** "Me ajude com um café (Ko-fi)" partia em "(Ko-" e "fi)" num `fo-btn` com `white-space: normal`. Nenhum CSS impede a quebra no hífen; um `span` com `nowrap` na última palavra resolve sem mudar o nome acessível.
- **O vapor da caneca para em 4,8 s:** `fo-steam` roda duas vezes e o `fo-steam-rest` termina com `forwards`, e a segunda nuvem só atrasa. O seletor continua pendurado num ancestral do sprite, nunca numa seção (F1b).
- **O foco posto por script depois de um fechar pelo teclado é `:focus-visible`:** o `<main>` que recebe o foco quando a parede fecha com Esc ganhava o anel de 3 px em volta da página inteira. O `<main>` com `tabindex="-1"` não é controle e fica sem o anel (`global.css`, § 450); um controle que recebe foco assim continua com ele.
- **Prove a cor de um tema pelos tokens do tema na tela:** um teste que só confere a opacidade (o "0,92" do mar) passa com qualquer cor. O teste do mar (§ 451) compara o `::backdrop` com o `color-mix` da `water` e do `deep` lidos na página, nas seis combinações do esquema do sistema com o `data-theme`.

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- O `keep()` do aviso com só um `ResizeObserver` no `<main>` não dispara no erro da DropZone: o painel tem altura mínima (e, com o UX-04, fixa), e o `<main>` não muda de tamanho. Um `MutationObserver` no `<main>` (filhos, texto, `data-state` e `hidden`) chama o `keep()` num `requestAnimationFrame`, depois do layout (§ 458).
- O vapor sem `forwards` sai do `getAnimations()` quando acaba: o `every(state === 'finished')` passa vazio, e a prova do fim é o estilo dos dois `<path>` do `#oli-coffee`. O `backwards` do 2º fio fica de propósito (sem ele o fio aparece parado no atraso e some de uma vez).
- A regra do laço (`checkLoops`) é função à parte do `checkMotion` (o teste antigo do `checkMotion` usa um laço infinito como exemplo bom) e lê o CSS minificado do `dist/`, onde as aspas dos atributos somem (`[data-oli=swim]>svg`): ela compara sem aspas e sem espaços.
- O `pnpm lancamento:imagens` lê os `@keyframes` direto do `components.css` (o GIF da miniatura): tirar ou renomear um `@keyframes` da Oli quebra o script, que fica fora do `verificar`. Ele lê agora o `fo-hello` e entende `0%, 100%`.
- A Oli do canto do retângulo é irmã da `.fo-drop` dentro do `.fo-slot`: o aceno curto do `:hover` e do `:focus-within` casa por `.fo-slot:has(.fo-drop:is(:hover, :focus-within)) > [data-oli="wave"]`.
- **A água deslizada é tão alta quanto a caixa:** o `.fo-water` sobe por `translateY(100% - nível)`, então uma camada que só desce passa da base da caixa pelo mesmo tanto (o `deep` do resultado passava 20 px do card). O `deep` do resultado é posto (`inset: var(--fo-surf) 0 0; transform: none`) e um `clip-path: inset(-12px 0 0 0)` segura a crista da onda (o `::before` começa em `left: -48px`) dentro dos lados. (a ilha de imagem)
- **A Oli do retângulo alcança 78 px acima dele:** com o H1 na largura toda, o fim de um H1 longo cai sob ela onde o selo cabe numa linha (390 a 767 px). No celular, a linha do selo da página de ferramenta guarda a altura de duas linhas (`.fo-top--tool .fo-top__seal { min-height: 52px }`); o `tool-slot.spec.ts` mede de 320 a 1280 px nas 33 páginas. (a ilha de imagem)
- **A faixa de baixo tem uma cópia escondida da linha do resultado** (`.fo-band__ghost`, `aria-hidden`, `visibility: hidden`, na mesma célula de grade da `.fo-band__now`): ela dá à faixa a altura dos chips desde a primeira pintura. Os chips da cópia são `span` e a linha não tem a classe `fo-next`, então seletor de chip em teste usa `nav.fo-next a.fo-chip`; um `.fo-chip` solto conta também os da cópia (no mesmo lugar). (a ilha de imagem)
- **Com o selo redondo no repouso e no arquivo em cima (decisões 5 e 8), as medidas do `tool.css` do protótipo (que não tinha o selo) não cabem:** a partir de 768 px a zona usa linhas a 8 px e a parte seca 8 px acima da água; com o arquivo em cima as palavras boiam na superfície (`padding-bottom: calc(var(--slot-h) * 0.6 - var(--space-12))`). (a ilha de imagem)
- **A base do retângulo (§ 463) foi medida sem o selo redondo da DropZone, que a ficha mantém:** com ele, a DropZone em repouso tinha 362 px a partir de 768 px e, com o arquivo em cima, 396 a 426 px a 360 px (386 a 1280). Na ilha de PDF, os vãos do repouso caem a 8 px e o topo a 12 px a partir de 768 px, e com o arquivo em cima as palavras ficam no meio do retângulo, sobre a água. (a ilha de PDF)
- **A pasta `docs/propostas/ux-v2/icons/` tem 32 arquivos, não 27.** Cinco deles (`book`, `menu`, `moon`, `sun`, `theme-system`) já estão no conjunto desde a F11, e na proposta têm `stroke="currentColor"` na raiz: copiá-los reprova o `icons.test.ts`. O conjunto agora tem **71** (a especificação diz 66 porque contou 39 em vez de 44). (os ícones)
- **Copie ícone com `cp`, nunca regravando por script** (o Python no Windows troca LF por CRLF). O `icons.test.ts` passou a conferir só LF e uma quebra de linha no fim de cada arquivo. (os ícones)
- **A `ICON_NAMES` fica na ordem do `sort()` do JavaScript**, que põe o hífen antes das letras (`coin-plus` antes de `coins`, `file` antes de `file-drop`, `theme-system` antes de `thermometer`). Um teste guarda a ordem. (os ícones)
- **Um ícone por ferramenta:** o `tests/unit/hub-icons.test.ts` lê o `dist/` e reprova quando um hub (imagem, PDF, dinheiro en/es, dinheiro pt, casa, saúde, em todo idioma) mostra o mesmo desenho em dois cartões, e quando uma home repete outro desenho além do `compress` e do `rotate` (imagem e PDF). Uma ferramenta nova num hub precisa de um ícone que o hub ainda não tem: desenhe um na grade de 24 px (README dos ícones) em vez de pegar um emprestado. Ele compara o desenho (o miolo do `<svg>`), não o nome do campo `icon`. Rode `pnpm build` antes; `FO_HUB_ICONS_DIST=<pasta>` aponta para outro build. (os ícones)
- **Nas imagens OG**, o `src/seo/images.ts` troca só o primeiro `stroke="#…"`; os pontos dos ícones novos (`stroke-width="2.6"`, sem cor) herdam a cor da raiz e saem certos no resvg (conferido no `og/en/auto-loan-calculator.png`, os faróis do `car`, e no `og/en/heic-to-jpg.png`). (os ícones)
