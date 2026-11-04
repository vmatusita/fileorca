# Ajuste: o cabeçalho com a largura do rodapé

Run curta, pedida pelo Victor depois do merge da F11: "o header não está com a mesma largura do footer, deveria estar". O pedido e a escolha estão em `docs/prompts/prompt-ajuste-header-width.md`, e a decisão, na § 409. Ponto de partida: a main em `69f9f53` (a F11). A PR é a 24. A prévia: https://ajuste-header-width-fileorca.vmatusita.workers.dev/

## Resumo

1. O cabeçalho e o rodapé têm as mesmas bordas em toda página e largura: 24 px da janela e, a partir de 1288 px, os 1240 px da página, no centro. Abaixo de 340 px, os dois ficam com 16 px.
2. A 1280 px, o cabeçalho ia de x 36 a x 794, e o rodapé de x 24 a x 1256. Agora os dois vão de x 24 a x 1256. De 320 a 1279 px, o cabeçalho era 8 px mais largo que o rodapé de cada lado, e agora não é mais.
3. A partir de 1280 px, o cabeçalho passa por cima da lateral de anúncio, e por isso a lateral começa 150 px abaixo dele (o anúncio dela, a 1280 px, foi de y 84 para y 214). Todo controle do cabeçalho fica a 158 px desse anúncio.
4. O Menu e o menu de idioma, quando abertos, podem cobrir o alto da lateral. Eles ficam a 150 px ou mais de todo outro anúncio, e a lateral não recebe o ponteiro enquanto um deles está aberto, então o clique de fechar nunca chega ao anúncio.
5. Um teste novo confere as bordas em 14 larguras e 3 páginas, nos dois navegadores, e reprova com o CSS da main. Os dois testes do cabeçalho contra a lateral mudaram para a regra nova e reprovam com a lateral no lugar antigo.

## O conflito e a escolha

O cabeçalho terminava em x 794 de propósito (§ 388). A regra dos 150 px valia para todo controle e todo menu aberto, por causa da F10 p-5, que achou a lateral a 29 px dos botões do cabeçalho. Com as bordas do rodapé, o tema e o Menu ficam de novo em cima da lateral, e o Menu aberto (360 × 449 px em inglês) cobre o anúncio dela. A run parou e perguntou ao Victor, com três opções: a largura do rodapé com a lateral mais baixa, a largura do rodapé só nas páginas sem lateral, ou manter como estava. Ele escolheu a primeira.

## O que mudou

- **`src/styles/components.css`:** o cabeçalho e o rodapé leem a variável `--fo-edge`, igual a `max(24px, (100% - 1240px) / 2)` e a 16 px abaixo de 340 px (360 px na primeira versão; a revisão mostrou o rodapé com duas colunas de 356 a 359 px e uma a 360). As regras de 1280 px que punham o cabeçalho na grade da moldura saíram, e as reservas sem anchor dos dois menus saíram junto. Abaixo de 768 px, a folha do Menu vai de uma borda do cabeçalho à outra.
- **`src/styles/global.css`:** o `padding-top` da `.fo-rail` passou de 20 px para 150 px (`--ad-clearance`).
- **O rodapé** só mudou abaixo de 340 px, onde passou de 24 para 16 px.
- **O design system:** os READMEs do Header, do Footer, do AdSlot e do ToolPage, o `bundle.css` e o cabeçalho de celular do `preview.html` do Header.
- **As pendências:** a F10 p-5 saiu do grupo 19 para "Já corrigidos", e o total passou de 216 para 215 linhas.
- **As pegadinhas:** seções novas no fim do `docs/claude/anuncios.md` e do `docs/claude/design-e-oli.md`.

Nada mudou em `src/ads/`, no motor, nas calculadoras ou nas ilhas. Não entrou token novo nem JS.

## As medidas

Chromium e WebKit, linhas `[header]` do `header-menu.spec.ts`. As colunas mostram o espaço que o cabeçalho ocupa e a largura que ele tem, e, na última, onde ele termina.

| Largura | en | pt | es | Último controle |
| --- | --- | --- | --- | --- |
| 320 px | 282,5 de 288 | 282,5 de 288 | 282,5 de 288 | x 304 (antes, x 304) |
| 340 px | 282,5 de 292 | 282,5 de 292 | 282,5 de 292 | x 316 (antes, x 324) |
| 360 px | 294,5 de 312 | 294,5 de 312 | 294,5 de 312 | x 336 (antes, x 344) |
| 768 px | 608,2 de 720 (WebKit 612,6) | 654,5 (659,0) | 663,0 (667,5) | x 744 (antes, x 752) |
| 1280 px | 608,2 de 1232 (612,6) | 654,5 (659,0) | 663,0 (667,5) | x 1256 (antes, x 794) |

A 1280 px, o logo fica em x 24, como as colunas do rodapé, e o anúncio da lateral fica em x 944 e y 214. A folha do Menu aberta vai de x 896 a 1256, com 449 px de altura em inglês e 349 em português e espanhol.

## Os testes

- **O teste novo** (`header-menu.spec.ts`, no fim): em `/compress-image/` (com lateral), `/pt/guias/` e `/es/` (sem lateral), a 320, 339, 340, 359, 360, 390, 767, 768, 1024, 1279, 1280, 1288, 1440 e 1920 px, o primeiro controle começa onde começam as colunas e a base do rodapé, e o último termina onde elas terminam, com 0,5 px de tolerância. A folha aberta vai de uma borda à outra abaixo de 768 px e termina na borda da direita a partir daí. E o rodapé nunca perde coluna ao alargar. São 6 testes, 3 por navegador.
- **O teste de 1280 px** (`header-menu.spec.ts`, nos três idiomas): saíram o logo na coluna, o último botão no fim da coluna e a folha a 150 px da lateral. Entraram a lateral 150 px abaixo do cabeçalho, os controles a 150 px dela e, com a folha aberta, o `.fo-frame` sem ponteiro.
- **O bloco do cabeçalho do `ads.spec.ts`** (178 páginas com área de anúncio, a 360, 767 e 1280 px): com os menus fechados, os controles continuam medidos contra todo anúncio, a lateral também. Com um menu aberto, a medida é contra todo anúncio que não é da lateral. Para a lateral, o teste confere que o clique chega a ela com os menus fechados (o controle positivo) e não chega com um menu aberto, num ponto 20 px abaixo do menu aberto, fora da própria folha (a revisão achou o primeiro ponto dentro dela).
- **Os controles negativos:**
  - o CSS da main com o teste novo: reprovou nas três páginas, já a 320 px ("o cabeçalho começa em x 16.0, o rodapé em x 24.0");
  - o CSS da main com o teste de 1280 px: reprovou nos três idiomas, porque a lateral fica a 20 px do cabeçalho, e não a 150;
  - o cabeçalho novo com a lateral ainda a 20 px, no bloco do `ads.spec.ts`: reprovou com "AdSlot a 29px de fo-header__search";
  - sem as duas regras que seguram o clique de fechar (o `pointer-events: none` do `.fo-frame` e o `body::after`), no mesmo bloco: reprovou com "a lateral recebe o clique com o Menu aberto";
  - a troca da borda em 360 px, no teste de bordas: reprovou nas três páginas com "o rodapé perdeu coluna ao alargar (2 antes, 1 agora)", a 360 px.
- **Os specs que a mudança toca,** nos dois navegadores, antes do `verificar`: `header-menu`, `cookie-footer` e `layout-shift` (152 testes) e, no `ads.spec.ts`, o bloco do cabeçalho, o do rótulo e o do hub (28 testes). Depois das correções da revisão, de novo: `header-menu` e `cookie-footer` (122 testes) e o bloco do cabeçalho do `ads.spec.ts` (24 testes). Todos passaram.

## As imagens

7 imagens em `docs/relatorios/ajuste-header-width/`, tiradas do `dist/` com o Chromium do Playwright, a 1x e com movimento reduzido, em `/compress-image/`:

- `antes-1280-topo.png` e `depois-1280-topo.png`: o cabeçalho a 1280 px, antes e depois;
- `depois-1280-menu.png`: o Menu aberto a 1280 px, sobre o alto da lateral;
- `depois-1280-rodape.png`: o rodapé a 1280 px, com as mesmas bordas (cortado acima da assinatura);
- `antes-360-topo.png`, `depois-360-topo.png` e `depois-360-menu.png`: o celular, e a folha de uma borda à outra.

## O `pnpm verificar --partes`

Uma vez, sobre o `3ff2549` (o código final; depois dele só mudaram documentos e um comentário de teste), na máquina Windows. As 21 partes passaram:

| Parte | O que roda | Tempo |
| --- | --- | ---: |
| 1 | build | 34,4 s |
| 2 | portões: tipos 11,0 s, lint 4,8 s, Vitest 34,3 s (109 arquivos, 1.833 testes), prontidão 72,2 s, licenças 6,0 s e os outros nove, todos `ok` | 136,2 s |
| 3 | Lighthouse CI | 389,3 s |
| 4 a 8 | Playwright no Chromium, partes 1 a 5 (313, 313, 313, 312 e 312 testes) | 100,3, 140,9, 58,0, 100,8 e 88,4 s |
| 9 a 17 | Playwright no WebKit, partes 1 a 9 (121, 121, 121 e seis de 120 testes) | 49,2, 53,2, 101,6, 81,5, 48,1, 49,0, 47,3, 34,0 e 58,8 s |
| 18 a 21 | Playwright no WebKit, partes 10 a 13 (120 testes cada) | 71,7, 46,4, 85,6 e 54,7 s |

A soma das partes é 1.829,4 s (30,5 min), e a maior é a do Lighthouse, com 389,3 s, abaixo dos 900 s. São 1.563 testes do Playwright em cada navegador, todos verdes, sem `flaky`.

Um tropeço da máquina, não do código: na primeira passada, a parte 18 listou os 120 testes como `ok` e o Playwright não saiu. Um worker e um processo do WebKit ficaram vivos, e o log ficou parado por 1 h 30 sem o resumo. A run encerrou a árvore do processo e rodou de novo as partes 18 a 21, uma a uma, com `timeout 600` e o mesmo `dist/` (o `HEAD` não tinha mudado). Os tempos da tabela são dessa segunda passada. A pegadinha foi para o `docs/claude/playwright.md`.

## O custo

A última execução do CI antes deste relatório foi a leve do `ee091cd` (`pnpm ci:custo 41823296952`): 5 minutos cobrados, 3,5 min de parede e 3 jobs rodados (7 pulados). O `verificar --leve` levou 134,9 s. A execução completa sai do `gh pr ready`, depois deste commit, e o custo dela vai para a descrição da PR.

## A revisão

Cinco lentes Sonnet, um cético por achado médio e um para os baixos (regra 3: o ajuste mexe em anúncio). O detalhe está em `docs/relatorios/REVISAO-ajuste-header-width.md`.

- **Nenhum alto.** Os 9 achados confirmados são 4 defeitos, todos corrigidos, e 2 achados foram refutados.
- **O médio:** a conferência da lateral com o Menu aberto sondava um ponto dentro da própria folha e não podia reprovar. Agora o ponto fica abaixo do menu aberto, e o controle negativo reprova.
- **Os baixos:** o rodapé perdia uma coluna a 360 px (a troca da borda foi para 340 px), o cabeçalho de celular do `preview.html` e dois títulos de teste.
- **A segunda passada:** um revisor Sonnet em contexto limpo leu o diff das correções (`ee091cd..3ff2549`). Não achou defeito: o ponto novo fica fora da folha e dentro do anúncio nos três idiomas, o cabeçalho cabe a partir de 331 px, e o rodapé não perde coluna de 320 a 1920 px. Ele apontou um texto antigo impreciso: a diferença de 8 px começava em 320 px, e não em 360. O texto foi corrigido aqui, na § 409 e no comentário do teste.

## As decisões novas

- § 409: o cabeçalho com a largura do rodapé, a lateral 150 px abaixo do cabeçalho e o menu aberto sobre a lateral.

## Os desvios

- **Um efeito que fica:** a 360 px, o cabeçalho e o rodapé ficam a 24 px da janela, e o conteúdo da página continua a 16 px. A partir de 1288 px, o cabeçalho e o rodapé ocupam 1240 px, e o conteúdo, 1208. O pedido era alinhar o cabeçalho com o rodapé, não com o conteúdo. Se a ideia for alinhar os três, é outra decisão.
- **O anúncio da lateral desce 130 px.** A 1280 × 800, a caixa dele (644 px, com o rótulo) vai de y 214 a 858 e passa 58 px da dobra. Antes, ia de y 84 a 728 e cabia inteira na tela. Foi o preço que a escolha aceitou ("a lateral desce para começar 150 px abaixo do cabeçalho").

## O que fica para o Victor

1. `git pull` e conferir o cabeçalho e o rodapé no computador (a 1280 px e numa tela larga) e no celular, na prévia ou no fileorca.com depois do deploy.
2. Decidir se o conteúdo da página também deve ter as bordas do cabeçalho e do rodapé (hoje fica a 16 px no celular e em 1208 px a partir de 1288 px).
