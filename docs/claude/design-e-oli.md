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
