# F13a · relatório

A primeira das duas runs da fase "UX/UI: implementação" do `PLANO-MELHORIAS.md`, com a ficha em `docs/prompts/prompt-fase-13a.txt` e o plano em `docs/relatorios/fase-13a-plano.md`. Ponto de partida: `14341bc` (a F12 mesclada). PR: [vmatusita/fileorca#26](https://github.com/vmatusita/fileorca/pull/26). Prévia: https://fase-13a-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio).

## Resumo

1. O aviso de cookies ficou com duas linhas e 128 px no celular (eram 200 a 244), repete o selo da própria página e nunca cobre o Escolher, o Escolher outros arquivos nem o Baixar; onde o 1º anúncio ficaria perto dele, o anúncio desce.
2. A Oli faz um movimento curto por estado e para; só a braçada do progresso repete.
3. As ferramentas de imagem e de PDF viraram "um lugar só": um retângulo da mesma altura do soltar ao resultado, a Oli num canto, o resultado como o mar que subiu, os chips logo abaixo do Baixar, os erros que dizem o caso, e a página não pula (CLS 0,000); o juntar tem a lista no retângulo, com a lixeira e o Desfazer.
4. As peças de PDF fecharam as 15 pendências da F5a, e o chip de próximo passo leva o arquivo para a ferramenta seguinte, sem nada sair do aparelho.
5. Cada ferramenta tem o seu ícone (71 no conjunto), e um arquivo solto em qualquer lugar de uma página com ferramenta vai para ela; numa página sem ferramenta, o cursor diz que não.

## O que entrou, por item

### UX-09 · o aviso de cookies compacto (§ 458 e § 459)

- `src/components/CookieNotice.astro`: o texto novo ("**Cookies** for Google Analytics and ads." e o selo da própria página, que a página passa pela prop `seal` da `BaseLayout`); o `keep()`, que tira de baixo do aviso o foco que se mexeu sem mudar, com um `ResizeObserver` e um `MutationObserver` no `<main>` (o segundo é um desvio da especificação, registrado: com o retângulo de altura fixa, o `<main>` não muda de tamanho no erro); o `lower()`, que desce o 1º anúncio de conteúdo para baixo do aviso aberto onde faltar distância (F12 R-A-2), antes da primeira pintura e no `resize`.
- `src/styles/components.css`: o card de 128 px (duas linhas no estilo `small`), 360 px de largura a partir de 768 px, os lados de 8 px (desvio registrado: com os 12 da especificação, os textos mais longos quebravam em três linhas no WebKit).
- `src/layouts/BaseLayout.astro`, `src/tools/calc/CalcTool.astro`, `src/tools/qr-code-generator/QrTool.astro`, os dois hubs de calculadora: o selo de cada página. `src/i18n/<lang>/common.ts`: o título e o corpo novos.
- Testes: `tests/e2e/cookie-notice.spec.ts` (novo), `tests/unit/cookie-seal.test.ts` (novo), as sete janelas no `tests/e2e/fo-ad-map.spec.ts`.

### UX-10 · a Oli por estado, com laço curto (§ 460)

- `src/styles/components.css`: um movimento curto por estado (o aceno da `wave` uma vez em 3 s, com o aceno curto no ponteiro ou no foco da DropZone; a `gulp`, a `oops`, a `buoy`, a `lost`, a `peek`; o vapor que assenta em 3,12 s); só a `swim` em laço.
- `scripts/lib/design-checks.ts` e `scripts/gates/design.ts`: a regra `checkLoops` (`infinite` só nos seletores do progresso). `scripts/lancamento/imagens.ts` lê o `fo-hello`.
- Testes: os do movimento no `tests/e2e/design.spec.ts` e o bloco "laço só no progresso" do `tests/unit/design-checks.test.ts`.

### UX-04 A · a página de ferramenta "um lugar só" (§ 463 a § 477, § 478 a § 484, § 495)

- A base no `components.css` (§ 463): o retângulo de 356/340 px, a faixa de 196/120 px, a Oli no canto, a água 30/60 %, o erro sem o selo, o resultado como o mar que subiu, a linha dos números, o "Ajustar"; o H1 na largura toda nos dois moldes.
- A ilha de imagem (frente I, `src/tools/image/`): a Oli única no canto, a faixa com as opções e depois os chips e o "Ajustar", o antes e depois só a pedido (com o puxador de duas setas, D-09), os erros que dizem o caso (D-06, D-17), a mudança com sinal no HEIC (p-13), a linha do café guardada antes do resultado (um script inline espia o 3º uso antes da primeira pintura); a ferramenta embutida dos guias usa a mesma ilha.
- A ilha de PDF (frente P, `src/tools/pdf/`): o mesmo retângulo nas 12 ferramentas; o juntar com a lista no retângulo (a contagem, o Juntar no lugar do Escolher, a ajuda da ordem à vista, o número da ordem, as setas sem a alça, a lixeira e o Desfazer, a leitura que já é a lista); a altura que cada família guarda (§ 481); e, depois da junção, as `key` da zona e dos cartões e a reserva do café nas ferramentas automáticas (§ 495).
- Testes: `tests/e2e/tool-slot.spec.ts`, `tests/e2e/tool-slot-axe.spec.ts`, `tests/e2e/pdf-merge.spec.ts` (novos) e os testes antigos que mudaram (§ 475 e § 487).

### UX-11 A · as peças de PDF (§ 485 e § 486)

- Em dois commits, como a ficha manda: primeiro o CSS e a marcação (D-7, D-8, D-12, D-23, F-6, F-7, F-8, F-10, F-11, F-14), depois o comportamento (D-6, D-9, D-10, D-11, F-5, F-13).
- Testes: `tests/e2e/pdf-pieces.spec.ts` e `tests/unit/pdf-pieces-texts.test.ts` (novos).

### UX-14 · o chip que leva o arquivo (§ 496 a § 500, § 504 e § 505)

- `src/tools/image/inbox.ts` (a cópia da regra `takes()`, a gravação na caixa `fileorca-inbox`, o `takeInbox` que devolve `{files, from, lost}`), as duas ilhas (o rótulo "Resize this image" no cliente, a linha `.fo-carry`, a nota de origem, a caixa vazia com a Oli `lost`), os textos nos três idiomas e o parágrafo novo da Privacidade (`src/i18n/<lang>/privacy.ts`). O `src/sw/` não mudou.
- Testes: `tests/e2e/handoff.spec.ts` e `tests/unit/handoff.test.ts` (novos).

### UX-16 · os ícones próprios por ferramenta (§ 490 a § 493)

- Os 27 ícones em `docs/design/assets/Icons/` (71 no conjunto), a `ICON_NAMES`, as 33 trocas do campo `icon` nos registros e o selo `file-drop` da DropZone em repouso.
- Testes: `tests/unit/icons.test.ts` (71) e `tests/unit/hub-icons.test.ts` (novo); o selo no `tests/e2e/tool-slot.spec.ts`.

### UX-18 A · o soltar em qualquer lugar (§ 501 a § 503)

- `src/tools/image/paste.ts` (`catchDrops`, o contador no lugar do `relatedTarget`), as duas ilhas sem os ouvintes da zona, o painel trazido à vista; nas páginas sem ferramenta de arquivo, um script inline da `BaseLayout` com o `dropEffect = 'none'` (F10 p-11).
- Teste: `tests/e2e/drop-anywhere.spec.ts` (novo).

## A evidência de cada critério

Tudo abaixo foi medido no estado final (`c4e2c18`, o código igual ao do commit do relatório), salvo onde digo.

1. **O aviso compacto.** `tests/e2e/cookie-notice.spec.ts` (novo), verde nos dois navegadores no `pnpm verificar --partes`: a 360 × 740, sem `fo-consent`, no comprimir, no HEIC e no juntar (en, pt e es), na hipoteca (en e es) e no SAC × PRICE, o `#fo-cookie` tem 128 px (até 130) e o Escolher ou o primeiro campo fica inteiro acima dele; a 320 × 640, 128 px no en e 148 no pt e no es; a partir de 768 px, 360 px de largura; o texto contém o selo da página (imagem, PDF, calculadora, QR; `common.seal` na home e o `calcSeal` nos hubs de calculadora), e o `tests/unit/cookie-seal.test.ts` confere toda página do `dist/`; no erro com o `gen-texto-extensao-png.png`, a 360 × 740 e a 320 × 640, nos três idiomas, o foco fica no "Choose other files" e o fundo dele 8 px ou mais acima do aviso; a 1280 px, no fim da página, o card cobre no máximo 2 links do rodapé; as nove variantes de texto ficam em duas linhas com a Figtree e com a reserva, a 360 e a 1280 px. As sete janelas da R-A-2: o `fo-ad-map.spec.ts` (tabela do mapa abaixo) e o teste de primeira visita fria (§ 517). O teste da f-06 (`cookie-footer.spec.ts`) continua verde.
2. **A Oli.** `tests/e2e/design.spec.ts`, "motion without the preference": nas seis páginas, toda animação fora do progresso tem `iterations` finito e `endTime` de até 5.000 ms, e nada está `running` 3,2 s depois de abrir (o vapor termina em 3.120 ms); com o movimento reduzido, o `getAnimations()` fica vazio também em `/`, `/merge-pdf/`, `/qr-code-generator/` e `/open-with/`. `tests/unit/design-checks.test.ts`, "laço só no progresso": a regra `checkLoops` reprova o `components.css` do ponto de partida (a `wave` da linha 14) e passa no de agora; o `pnpm gate:design` a roda sobre o CSS do `dist/` ("laço sem fim só no progresso").
3. **A página de ferramenta.** `tests/e2e/tool-slot.spec.ts` (novo): o retângulo com 356,0 px a 360 e 340,0 px a 1280 em repouso, com o arquivo em cima, processando, no resultado e no erro, nas 33 páginas de imagem; o CLS da interação a 360 × 740 de 0,000 no comprimir, no HEIC, no WebP e no redimensionar, e de 0,000 no 3º uso com a linha do café; a base do retângulo até 740 px a 360 × 740, com e sem a fonte (a pior, a preset "para 100 KB" em pt, foi de 754 para 696 px); o foco no Baixar sem rolar na 1ª visita, nos três idiomas, também com o motor segurado além dos 400 ms (§ 514); os chips a 184 px do Baixar a 360 e a 158 px a 1280 (eram 568); o D-06, o D-17, o D-09, a p-13 e uma foto de celular nas presets (§ 516). `tests/e2e/pdf-merge.spec.ts` (novo): o juntar com CLS 0,000 no 1º e no 3º uso, as quatro ferramentas automáticas com CLS de até 0,002 (§ 495), os chips a 187 px do Baixar a 360 (até 400), o D-21, o D-22, o D-26 e o D-27 nos dois navegadores, o nome do juntar com 208 px a 360 (§ 515).
4. **As peças de PDF.** `tests/e2e/pdf-pieces.spec.ts` (novo, 27 por navegador) cobre os 13 testes da tabela "Testes da F13" do `pdf-pieces.html` (o D-12 em cada uma das 12 ferramentas), e o `tests/unit/pdf-pieces-texts.test.ts` a metade de texto do D-10. Verdes nos navegadores que a tabela pede.
5. **O chip que leva.** `tests/e2e/handoff.spec.ts` (novo, com o service worker ligado e servidor próprio): o comprimir leva a foto para o redimensionar com a nota de origem e o foco no Baixar, e a caixa fica apagada (`caches.has` falso, a chave do `sessionStorage` sumida); Enter no chip leva; a rede leva só GET sem corpo e sem query, nenhum byte nem nome do arquivo; o `sessionStorage` em trânsito tem só `{tool, order, from}`; o `dataLayer` só o `next_step_click` de sempre; Ctrl, Shift, Meta e o botão do meio só linkam; a caixa vazia na imagem e no PDF. `tests/unit/handoff.test.ts`: a cópia de `takes()` igual à original numa grade de 5.600 casos.
6. **Os ícones.** `tests/unit/icons.test.ts` com os 71 ícones; `tests/unit/hub-icons.test.ts` (novo): nenhum hub repete um ícone entre os cartões (no ponto de partida, 11 dos 16 testes reprovam); a DropZone em repouso com o `file-drop` (`tool-slot.spec.ts`, nas duas ilhas).
7. **O soltar.** `tests/e2e/drop-anywhere.spec.ts` (novo): o HEIC solto no H1 do guia chega à ferramenta com o painel à vista; o `dragenter` no `body` leva a zona ao `over` e o `dragleave` a devolve; dois PDFs soltos no H1 do juntar entram na lista; em `/` e em `/money-calculators/` o `dragover` de arquivos termina com `dropEffect` `'none'` e o soltar é recusado (com o `'copy'` posto antes, para o teste não passar sem a mudança); a zona não fica presa quando o arquivo entra sobre o Escolher (§ 519).
8. **Os anúncios,** no build de teste: `fo-ad-map.spec.ts`, `ads.spec.ts` e `ads-coffee.spec.ts` verdes nos dois navegadores, com os alvos novos (a faixa, o "Ajustar", os chips, a linha `.fo-carry`, a nota de origem, o estado `lost`, os controles do juntar e a Oli com a caixa inflada em 12 px); a tabela por molde está abaixo.
9. **A acessibilidade.** O axe zero violação nos dois temas e nos dois navegadores no aviso aberto, nos estados da ilha de imagem (`tool-slot-axe.spec.ts`), no juntar lendo, com a lista e com uma linha tirada, nas peças de PDF (`axe-pdf-states.spec.ts`, `pdf-merge.spec.ts`) e na caixa vazia (`handoff.spec.ts`); todo botão visível do `#fo-tool-root` com 48 px ou mais a 360 e a 1280 (`tool-slot.spec.ts` e o D-12 do `pdf-pieces.spec.ts`); o contraste de todo par novo nos README do DropZone, do ResultCard, do ToolPage, do FileCard, do OptionGroup e do CookieNotice.
10. **Os arquivos que saem não mudam.** `image-matrix.spec.ts`, `image-presets.spec.ts` e `pdf-matrix.spec.ts` verdes com o mesmo esperado; `git diff --stat 14341bc -- fixtures/ scripts/oracle/ scripts/guides/` sai vazio.
11. **O orçamento.** Tabela abaixo: as 183 páginas que o `budgets.spec.ts` e o `i18n-budgets.spec.ts` medem têm os mesmos arquivos JS e as mesmas requisições do ponto de partida; a lista dos 66 nomes de `dist/_astro/*.js` sem o hash é a mesma; o JS inicial máximo é de 56,0 KB com gzip (57,7 no build de teste). A ilha de imagem cresceu 2.685 B e a de PDF 3.090 B com gzip (a § 511 diz por quê).
12. **O CLS e o Lighthouse.** O `layout-shift.spec.ts` verde de 320 a 412 px nos dois builds. O Lighthouse (celular), nas 10 URLs do `lighthouserc.json`: desempenho de 99 a 100 e CLS de 0,000 a 0,001 (abaixo).
13. **Os textos.** `pnpm lint:texto` no `verificar`: 36 arquivos, 2.899 textos, 0 erro de gramática (954 avisos, quase todos "Oli", "FileOrca" e os placeholders, como a F11 g-3 registra); o `english-leak.test.ts` e o `glossary.test.ts` verdes no Vitest.
14. **A documentação.** O `docs/design/` (as mudanças de regra de cada componente, com o antes e o depois e o §, e o contraste), o `docs/claude/` (a seção "## F13a: página de ferramenta" em oito arquivos de tema: todos menos o das calculadoras e o dos idiomas, que a F13a não tocou) e o `docs/PENDENCIAS.md` (as 25 pendências em "Já corrigidos", a F7 e-1 descartada, o grupo 22 com 14 linhas, o Resumo e o Total) em dia; o `pendencias.test.ts` verde; os § vão de 456 a 533.
15. **Os testes.** Os números abaixo só cresceram; cada teste antigo que mudou está num § no formato da § 341; cada teste novo de comportamento reprovou contra o ponto de partida (ou, para os da revisão, contra o `411502b`), com a contagem em cada §.
16. **O `pnpm verificar --partes`.** Verde nas 21 partes, a maior com 392 s (o Lighthouse), nenhuma acima de 700 s (abaixo).
17. **A revisão.** `docs/relatorios/REVISAO-F13a.md`: nenhum achado crítico, alto ou médio aberto.
18. **O CI.** A execução depois do `gh pr ready` está na descrição da PR (o custo e o resultado).

## As tabelas

### O antes e o depois de cada item, medido

| Medida | Antes (`14341bc`) | Depois | De onde |
| --- | --- | --- | --- |
| O aviso a 360 × 740 (en · pt · es) | 344 × 200 · 344 × 222 · 344 × 222 | 344 × 128 nos três | `.cache/f13a/cookie-measure.ts` |
| O aviso a 320 × 640 (en · pt · es) | 304 × 222 · 304 × 222 · 304 × 244 | 304 × 128 · 304 × 148 · 304 × 148 | idem |
| O aviso a 1280 × 800 | 440 × 178 a 200 | 360 × 128 | idem |
| O Escolher do comprimir coberto pelo aviso (360 · 320 px, en · pt · es) | 0 · 32 · 0 px e 60 · 60 · 60 px | 0 em todos | idem |
| Links do rodapé sob o aviso, no fim da página a 1280 (en · pt · es) | 5 · 6 · 6 | 2 · 2 · 2 | idem |
| O aviso aberto a menos de 150 px do 1º anúncio (build de teste) | 307 medidas nas cinco janelas novas | nenhuma; numa primeira visita fria, mínimo de 218 px (Chromium) e 190 (WebKit) | `fo-ad-map.spec.ts`; § 459 e § 517 |
| Animações sem fim fora do progresso | a `wave` (3 s, `infinite alternate`) | nenhuma; o vapor assenta em 3,12 s (era 4,8 s) | `design.spec.ts`, `checkLoops` |
| O retângulo da ferramenta de imagem a 360 px | 380 px em repouso, e o cartão crescia com o conteúdo | 356 px em todo estado (340 px a 1280) | `tool-slot.spec.ts` |
| O CLS da interação a 360 × 740 (comprimir · HEIC) | 0,067 · 0,059 (diagnóstico da F10); 0,088 no 3º uso | 0,000 · 0,000; 0,000 no 3º uso | `tool-slot.spec.ts` |
| O CLS nas ferramentas de PDF automáticas (1º · 3º uso) | 0,035 · 0,232 (na junção das frentes) | até 0,002 · até 0,002 | `pdf-merge.spec.ts`; § 495 |
| Os chips até o Baixar no comprimir (360 · 1280 px) | 568 px · longe | 184 · 158 px | `tool-slot.spec.ts` |
| Os chips até o Baixar no juntar a 360 px | 0,44 a 0,78 tela | 187 px | `pdf-merge.spec.ts` |
| A rolagem do foco no Baixar na 1ª visita a 360 × 740 (en · pt · es) | 315 · 16 · 281 px | 0 · 0 · 0 (também com o motor segurado) | `tool-slot.spec.ts`; § 514 |
| A base do retângulo a 360 × 740, a pior página | 754 px (`/pt/comprimir-imagem/para-100kb/`) | 696 px | `tool-slot.spec.ts` |
| O nome do arquivo no juntar (360 · 320 px) | 224 · 184 px | 208 · 168 px | `pdf-merge.spec.ts`; § 515 |
| Desenhos diferentes por hub (cartões / desenhos) | imagem 8/6, dinheiro 14/6, dinheiro pt 8/4, casa 6/3, saúde 5/2 | 8/8, 14/14, 8/8, 6/6, 5/5 | `hub-icons.test.ts` |

### O mapa de anúncios por molde (build de teste)

A densidade conservadora a 360 × 740 (as caixas da coluna e 100 px de âncora, sobre o `<main>`, com a ferramenta em repouso), a menor distância de um anúncio a cada grupo de alvos (a 360 e a 1280 px; os alvos novos da F13a, como a faixa, o "Ajustar", os chips, a linha `.fo-carry`, a nota de origem, o estado `lost` e os controles do juntar, entram no grupo "painel", que o teste exige a 150 px ou mais) e a menor distância do aviso aberto ao 1º anúncio de conteúdo em cada uma das sete janelas, na rolagem 0. Chromium:

| Molde | Páginas | Densidade a 360 × 740 (máx. · mediana) | Menor distância (px) aos alvos | Aviso aberto, menor distância (px) nas sete janelas |
| --- | ---: | --- | --- | --- |
| home | 3 | 12,7 % · 12,6 % | menus 159, oli 154, cafe 318, grade 150 | 360×740: 1378; 1280×800: 366; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| tool-image | 33 | 17,5 % · 15,9 % | campos 150, menus 159, painel 150, oli 154, cafe 318, grade 166 | 360×740: 613; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| hub-arquivos | 6 | 13,7 % · 11,8 % | menus 159, cafe 318, grade 150 | 360×740: 1410; 1280×800: 436; 1440×900: 336; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| hub-dinheiro | 3 | 13,9 % · 12,4 % | menus 159, cafe 318, grade 150 | 360×740: 1220; 1280×800: 348; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| calc-dinheiro | 44 | 18,3 % · 15,3 % | baixar 320, campos 318, menus 159, painel 150, cafe 318, cronograma 214, grade 166 | 360×740: 470; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| guide-dinheiro | 10 | 13,9 % · 12,4 % | baixar 347, campos 545, menus 159, painel 150, cafe 318, cronograma 308, grade 166 | 360×740: 2274; 1280×800: 1282; 1440×900: 1182; 1920×950: 1132; 1920×1080: 1002; 768×1024: 1058; 1024×1366: 716 |
| tool-pdf | 36 | 16,4 % · 14,7 % | menus 159, painel 150, oli 154, cafe 318, grade 166, campos 150 | 360×740: 585; 1280×800: 334; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| guides-hub | 3 | 14,2 % · 14,0 % | menus 159, cafe 318, grade 150 | 360×740: 1690; 1280×800: 715; 1440×900: 615; 1920×950: 565; 1920×1080: 435; 768×1024: 513; 1024×1366: 310 |
| guide-arquivos | 30 | 16,5 % · 15,3 % | campos 230, menus 159, painel 150, oli 154, cafe 318, grade 166 | 360×740: 1400; 1280×800: 744; 1440×900: 644; 1920×950: 594; 1920×1080: 464; 768×1024: 520; 1024×1366: 310 |
| hub-casa-saude | 2 | 15,5 % · 15,4 % | menus 159, cafe 318, grade 150 | 360×740: 978; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| calc-casa-saude | 11 | 19,0 % · 17,6 % | baixar 302, campos 290, menus 159, painel 150, cafe 318, cronograma 214, grade 166 | 360×740: 344; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| tool-qr | 3 | 14,8 % · 13,9 % | baixar 176, campos 481, menus 159, painel 150, oli 156, cafe 318, grade 166 | 360×740: 1029; 1280×800: 402; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |

184 páginas; densidade máxima 19,0 %; menor distância do aviso em qualquer janela: 310 px

WebKit: as mesmas 184 páginas; densidade máxima 18,9 %; menor distância do aviso em qualquer janela: 310 px.

Os menores vãos medidos pelos estados das ferramentas no `ads.spec.ts` (frentes e revisão): a 360 × 740, 551 px no comprimir em todos os estados (com o antes e depois e o "Ajustar" abertos, a chegada pelo chip e a caixa vazia), 685 no HEIC (também no erro do PNG com o chip), 877 no redimensionar, 473 no cortar, 397 no resultado com a linha do café e de 525 a 798 nas ferramentas de PDF; a 1280 × 800, 150 px, a lateral, em todas (a Oli, com a caixa inflada, a 154 px).

### O orçamento, por página

| Página | Antes (build padrão) | Depois (build padrão) | Depois (build de teste) |
| --- | --- | --- | --- |
| /add-page-numbers-to-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /apr-to-apy-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /auto-loan-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /bmi-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /body-fat-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /btu-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /calorie-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /compound-interest-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /compress-image/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /compress-image/to-100kb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /compress-image/to-1mb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /compress-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /concrete-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /credit-card-payoff-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /crop-image/ | 24,8 KB · 2 JS · 6 req. | 28,5 KB · 2 JS · 6 req. | 30,2 KB · 2 JS · 6 req. |
| /debt-consolidation-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /debt-payoff-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /delete-pdf-pages/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /due-date-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /es/apoyo/ | 3,8 KB · 0 JS · 4 req. | 4,8 KB · 0 JS · 4 req. | – |
| /es/calculadora-de-alquilar-o-comprar/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-amortizacion-de-prestamos/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-amortizacion-de-prestamos/pago-global/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-apr-a-apy/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-consolidacion-de-deudas/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-cuanta-casa-puedo-pagar/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-deudas/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /es/calculadora-de-hipoteca/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-hipoteca/15-o-30-anos/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-hipoteca/pagos-adicionales/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-hipoteca/pagos-cada-dos-semanas/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-interes-compuesto/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-interes-simple/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-meta-de-ahorro/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-prestamo-para-auto/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-prestamo-personal/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-refinanciamiento/ | 52,4 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadora-de-tarjeta-de-credito/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/calculadoras-financieras/ | 4,5 KB · 0 JS · 4 req. | 5,5 KB · 0 JS · 4 req. | 7,2 KB · 0 JS · 4 req. |
| /es/comprimir-imagen/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /es/comprimir-imagen/a-100kb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /es/comprimir-imagen/a-1mb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /es/comprimir-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /es/desbloquear-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /es/dividir-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/eliminar-paginas-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/firmar-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/generador-de-codigo-qr/ | 32,7 KB · 2 JS · 6 req. | 36,3 KB · 2 JS · 6 req. | 38,0 KB · 2 JS · 6 req. |
| /es/guias/ | 4,6 KB · 0 JS · 4 req. | 5,6 KB · 0 JS · 4 req. | 7,3 KB · 0 JS · 4 req. |
| /es/guias/abrir-webp-y-guardar-como-jpg/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /es/guias/bola-de-nieve-o-avalancha/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /es/guias/dividir-pdf-y-tamano-del-archivo/ | 38,7 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /es/guias/fotos-en-un-solo-pdf/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /es/guias/heic-a-jpg-en-windows/ | 22,5 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /es/guias/hipoteca-a-15-o-30-anos/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /es/guias/jpg-o-png/ | 22,5 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. | – |
| /es/guias/pagos-adicionales-a-la-hipoteca/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/guias/por-que-mi-pdf-pesa-tanto/ | 38,7 KB · 2 JS · 6 req. | 45,4 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /es/guias/punto-de-equilibrio-del-refinanciamiento/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /es/guias/quitar-la-ubicacion-de-las-fotos/ | 23,0 KB · 2 JS · 6 req. | 28,4 KB · 2 JS · 6 req. | – |
| /es/guias/resolucion-de-pdf-a-jpg/ | 38,7 KB · 2 JS · 6 req. | 45,4 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /es/guias/tamanos-de-imagen-para-redes-sociales/ | 23,0 KB · 2 JS · 6 req. | 26,7 KB · 2 JS · 6 req. | 28,4 KB · 2 JS · 6 req. |
| /es/guias/unir-pdf-en-el-celular/ | 38,6 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /es/heic-a-jpg/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /es/herramientas-de-imagen/ | 4,1 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /es/herramientas-pdf/ | 4,2 KB · 0 JS · 4 req. | 6,9 KB · 0 JS · 4 req. | – |
| /es/imagen-a-pdf/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /es/marca-de-agua-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/numerar-paginas-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /es/ordenar-paginas-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/pdf-a-jpg/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /es/png-a-jpg/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /es/proteger-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /es/recortar-imagen/ | 24,8 KB · 2 JS · 6 req. | 28,5 KB · 2 JS · 6 req. | 30,2 KB · 2 JS · 6 req. |
| /es/redimensionar-imagen/ | 22,9 KB · 2 JS · 6 req. | 26,6 KB · 2 JS · 6 req. | 28,3 KB · 2 JS · 6 req. |
| /es/redimensionar-imagen/miniatura-youtube/ | 22,5 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /es/rotar-imagen/ | 22,5 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /es/rotar-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /es/unir-pdf/ | 38,5 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. | – |
| /es/webp-a-jpg/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /guides/ | 4,5 KB · 0 JS · 4 req. | 5,4 KB · 0 JS · 4 req. | 7,2 KB · 0 JS · 4 req. |
| /guides/15-vs-30-year-mortgage/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /guides/combine-pdfs-on-phone/ | 38,6 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /guides/debt-snowball-vs-avalanche/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /guides/extra-mortgage-payments/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /guides/heic-to-jpg-on-windows/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /guides/jpg-vs-png/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /guides/open-webp-save-as-jpg/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /guides/pdf-to-jpg-resolution/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /guides/photos-to-one-pdf/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /guides/refinance-break-even/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /guides/remove-location-from-photos/ | 22,9 KB · 2 JS · 6 req. | 26,7 KB · 2 JS · 6 req. | – |
| /guides/rent-vs-buy-break-even/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /guides/social-media-image-sizes/ | 22,9 KB · 2 JS · 6 req. | 26,7 KB · 2 JS · 6 req. | 28,4 KB · 2 JS · 6 req. |
| /guides/split-pdf-file-size/ | 38,6 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /guides/why-is-my-pdf-so-large/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /health-calculators/ | 4,1 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /heic-to-jpg/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /home-affordability-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /home-calculators/ | 4,2 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /image-to-pdf/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /image-tools/ | 4,1 KB · 0 JS · 4 req. | 5,0 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /loan-amortization-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /loan-amortization-calculator/balloon-payment/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /merge-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | – |
| /money-calculators/ | 4,4 KB · 0 JS · 4 req. | 5,4 KB · 0 JS · 4 req. | 7,1 KB · 0 JS · 4 req. |
| /mortgage-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /mortgage-calculator/15-vs-30-year/ | 52,4 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /mortgage-calculator/biweekly/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /mortgage-calculator/extra-payments/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /mulch-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /ovulation-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /paint-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /pdf-to-jpg/ | 38,5 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pdf-tools/ | 4,2 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | – |
| /personal-loan-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /png-to-jpg/ | 22,4 KB · 2 JS · 6 req. | 26,0 KB · 2 JS · 6 req. | 27,7 KB · 2 JS · 6 req. |
| /protect-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/alugar-ou-comprar/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/amortizacao-antecipada/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/apoie/ | 4,1 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | – |
| /pt/assinar-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/calculadora-cartao-de-credito/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/calculadora-de-dividas/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/calculadora-juros-compostos/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/calculadoras-financeiras/ | 4,3 KB · 0 JS · 4 req. | 5,3 KB · 0 JS · 4 req. | 7,0 KB · 0 JS · 4 req. |
| /pt/comprimir-imagem/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /pt/comprimir-imagem/para-100kb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /pt/comprimir-imagem/para-1mb/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /pt/comprimir-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pt/cortar-imagem/ | 24,8 KB · 2 JS · 6 req. | 28,5 KB · 2 JS · 6 req. | 30,2 KB · 2 JS · 6 req. |
| /pt/desbloquear-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pt/dividir-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/excluir-paginas-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/ferramentas-de-imagem/ | 4,1 KB · 0 JS · 4 req. | 5,1 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /pt/ferramentas-pdf/ | 4,2 KB · 0 JS · 4 req. | 6,9 KB · 0 JS · 4 req. | – |
| /pt/gerador-de-qr-code/ | 32,7 KB · 2 JS · 6 req. | 36,3 KB · 2 JS · 6 req. | 38,0 KB · 2 JS · 6 req. |
| /pt/girar-imagem/ | 22,5 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /pt/girar-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pt/guias/ | 4,4 KB · 0 JS · 4 req. | 5,3 KB · 0 JS · 4 req. | 7,0 KB · 0 JS · 4 req. |
| /pt/guias/abrir-webp-e-salvar-como-jpg/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /pt/guias/dividir-pdf-e-tamanho-do-arquivo/ | 38,7 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /pt/guias/fotos-em-um-pdf/ | 22,6 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /pt/guias/heic-para-jpg-no-windows/ | 22,5 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /pt/guias/jpg-ou-png/ | 22,5 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /pt/guias/juntar-pdfs-no-celular/ | 38,6 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 46,9 KB · 2 JS · 6 req. |
| /pt/guias/por-que-meu-pdf-esta-tao-grande/ | 38,7 KB · 2 JS · 6 req. | 45,4 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /pt/guias/remover-localizacao-das-fotos/ | 23,0 KB · 2 JS · 6 req. | 28,4 KB · 2 JS · 6 req. | – |
| /pt/guias/resolucao-de-pdf-para-jpg/ | 38,7 KB · 2 JS · 6 req. | 45,4 KB · 2 JS · 6 req. | 47,1 KB · 2 JS · 6 req. |
| /pt/guias/tamanhos-de-imagem-para-redes-sociais/ | 23,0 KB · 2 JS · 6 req. | 26,7 KB · 2 JS · 6 req. | 28,4 KB · 2 JS · 6 req. |
| /pt/heic-para-jpg/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /pt/imagem-para-pdf/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /pt/juntar-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | – |
| /pt/marca-dagua-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/numerar-paginas-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pt/organizar-paginas-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/pdf-para-jpg/ | 38,6 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /pt/png-para-jpg/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /pt/proteger-pdf/ | 38,6 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /pt/redimensionar-imagem/ | 22,8 KB · 2 JS · 6 req. | 26,6 KB · 2 JS · 6 req. | 28,3 KB · 2 JS · 6 req. |
| /pt/redimensionar-imagem/miniatura-youtube/ | 22,5 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /pt/simulador-emprestimo/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/simulador-financiamento-veiculo/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/simulador-sac-price/ | 52,4 KB · 2 JS · 6 req. | 56,0 KB · 2 JS · 6 req. | 57,7 KB · 2 JS · 6 req. |
| /pt/webp-para-jpg/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /qr-code-generator/ | 32,7 KB · 2 JS · 6 req. | 36,3 KB · 2 JS · 6 req. | 38,0 KB · 2 JS · 6 req. |
| /refinance-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /rent-vs-buy-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /reorder-pdf-pages/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /resize-image/ | 22,8 KB · 2 JS · 6 req. | 26,6 KB · 2 JS · 6 req. | 28,3 KB · 2 JS · 6 req. |
| /resize-image/youtube-thumbnail/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |
| /rotate-image/ | 22,5 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /rotate-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,3 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /savings-goal-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /sign-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /simple-interest-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /split-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /square-footage-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /tile-calculator/ | 52,3 KB · 2 JS · 6 req. | 55,9 KB · 2 JS · 6 req. | 57,6 KB · 2 JS · 6 req. |
| /unlock-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,2 KB · 2 JS · 6 req. | 47,0 KB · 2 JS · 6 req. |
| /watermark-pdf/ | 38,5 KB · 2 JS · 6 req. | 45,1 KB · 2 JS · 6 req. | 46,8 KB · 2 JS · 6 req. |
| /webp-to-jpg/ | 22,4 KB · 2 JS · 6 req. | 26,1 KB · 2 JS · 6 req. | 27,8 KB · 2 JS · 6 req. |

183 páginas; 183 com os mesmos arquivos JS e as mesmas requisições antes e depois; JS inicial máximo depois: 56 KB (padrão) e 57.7 KB (teste); páginas do build de teste: 174

O script inline de cada página cresceu cerca de 1 KB com gzip (na página Sobre, de 3.990 para 4.982 B): o `keep()`, o `lower()` e a guarda do foco do aviso, e o `dropEffect` das páginas sem ferramenta de arquivo. Nas páginas de ferramenta entra também a espiada do café (303 B com gzip).

### O tamanho de cada ilha, com gzip

| Arquivo | Antes | Depois | Diferença |
| --- | ---: | ---: | ---: |
| `island.js` (a ilha de imagem e o pedaço comum) | 18.523 B | 21.208 B | +2.685 B |
| `PdfIsland…_lang.js` (a ilha de PDF) | 16.781 B | 19.871 B | +3.090 B (§ 511) |
| `CalcIsland…_lang.js` | 30.751 B | 30.661 B | −90 B |
| As entradas de cada página de imagem | 223 a 2.686 B | 225 a 2.693 B | +1 a +65 B |

### O Lighthouse (celular), no `pnpm verificar --partes`

| URL | Desempenho | CLS |
| --- | ---: | ---: |
| `/compress-image/` | 100 | 0,000 |
| `/image-tools/` | 100 | 0,000 |
| `/mortgage-calculator/` | 99 | 0,001 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 0,000 |
| `/compress-pdf/` | 99 | 0,000 |
| `/pdf-tools/` | 100 | 0,000 |
| `/guides/why-is-my-pdf-so-large/` | 99 | 0,000 |
| `/pt/simulador-sac-price/` | 99 | 0,001 |
| `/pt/apoie/` | 100 | 0,000 |
| `/qr-code-generator/` | 100 | 0,000 |

Acessibilidade, boas práticas e SEO: 100 nas dez.

### As 25 pendências da F13a

| Pendência | O que era | Teste | § |
| --- | --- | --- | --- |
| F3 d-02 | a `wave` e o vapor em laço (WCAG 2.2.2) | `design.spec.ts`, "motion without the preference" (seis páginas, até 5 s, nada `running` em 3,2 s); `design-checks.test.ts`, "laço só no progresso" | § 460 |
| F4-F7 e-2 | o CLS da interação nas ferramentas de imagem | `tool-slot.spec.ts`, "the interaction moves nothing at 360 × 740" (1º e 3º uso); `pdf-merge.spec.ts` (o juntar e as automáticas) | § 466, § 470, § 495 |
| F4-F7 f-2 | a zona de soltar abaixo da dobra no pt | `tool-slot.spec.ts`, "the rectangle ends above the fold of a 360 × 740 phone" | § 463, § 465 |
| F10 p-13 | o JPG maior que o HEIC | `tool-slot.spec.ts`, "F10 p-13: …" e "e-2: no text of the WebP to JPG page…" | § 472, § 521 |
| F10 p-14 | o erro que manda tentar PNG (D-06) e o PNG no HEIC (D-17) | `tool-slot.spec.ts`, "D-06 (en, pt, es)" e "D-17 (en, pt, es)" | § 468, § 469 |
| F4-F7 f-1 | o aviso sobre o Escolher (saída a) | `cookie-notice.spec.ts`, "first visit at 360 × 740" e "the error of the DropZone…" | § 458 |
| ajuste-aviso-espaco | o aviso sobre o canto do rodapé | `cookie-notice.spec.ts`, "at the end of a page at 1280px" | § 458 |
| F12 R-A-2 | o aviso perto do 1º anúncio em outras janelas | `fo-ad-map.spec.ts` (as sete janelas; a primeira visita fria) | § 459, § 517 |
| F5a D-6 | as teclas de passo da caixa da assinatura | `pdf-pieces.spec.ts`, "D-6: …" | § 486 |
| F5a D-7 | a página escolhida só pela cor | `pdf-pieces.spec.ts`, "D-7 and F-8: …" | § 485 |
| F5a D-8 | o nome cortado no juntar | `pdf-pieces.spec.ts`, "D-8: …"; `pdf-merge.spec.ts`, "D-8 at 320 px / at 360 px" | § 485, § 515 |
| F5a D-9 | o anel cortado e a posição que ninguém dizia | `pdf-pieces.spec.ts`, "D-9: …" | § 486 |
| F5a D-10 | as frases do Inverter e da Rotate | `pdf-pieces.spec.ts`, os dois "D-10: …"; `pdf-pieces-texts.test.ts` | § 486 |
| F5a D-11 | a pegada que não se soltava e o foco da senha errada | `pdf-pieces.spec.ts`, "D-11: …" e "D-11 and F-13: …" | § 486, § 510 |
| F5a D-12 | o `fo-btn--sm` de 40 px | `pdf-pieces.spec.ts`, "D-12: <ferramenta> …" (12 ferramentas, 360 e 1280 px) | § 485 |
| F5a F-5 | a prévia da Assinar desenhada pequena | `pdf-pieces.spec.ts`, "F-5: …" (DPR 2); `pdf-matrix.spec.ts` (o PDF igual) | § 486 |
| F5a F-6 | o FileCard de PDF com o quadrado vazio | `pdf-pieces.spec.ts`, "F-6 and F-7 (light, dark)" | § 485 |
| F5a F-7 | a dobra cortada com a cor da página | `pdf-pieces.spec.ts`, "F-6 and F-7 (light, dark)" | § 485 |
| F5a F-8 | a borda da célula sobre a dobra | `pdf-pieces.spec.ts`, "D-7 and F-8: …" | § 485 |
| F5a F-10 | os avisos fora do design system | `pdf-pieces.spec.ts`, "F-10: …" | § 485 |
| F5a F-11 | a caixa nativa do "Skip the first page" | `pdf-pieces.spec.ts`, "F-11: …" (o PDF sem número na página 1) | § 485 |
| F5a F-13 | a Unlock com o arquivo duas vezes | `pdf-pieces.spec.ts`, "D-11 and F-13: …" | § 486 |
| F5a F-14 | o acabamento da grade e do trilho a 360 px | `pdf-pieces.spec.ts`, "F-14: …" | § 485 |
| F10 p-11 | o `dragover` que prometia copiar | `drop-anywhere.spec.ts` (o `dropEffect` `'none'` e o soltar recusado em `/` e `/money-calculators/`) | § 503 |
| F7 e-1 | o CLS do breadcrumb com a fonte atrasada | descartada (a § 305 já resolveu; o `layout-shift.spec.ts` prova de 320 a 412 px) | § 457 |

Todas estão em "Já corrigidos depois da revisão" do `docs/PENDENCIAS.md`, com o teste e o §; a F7 e-1, como descartada.

## Os testes

| | Antes | Depois |
| --- | ---: | ---: |
| Vitest | 115 arquivos, 1.909 testes | 120 arquivos, 1.963 testes |
| `playwright test --list`, por navegador | 54 arquivos, 1.693 testes | 61 arquivos, 1.902 testes |

Os specs novos: `cookie-notice`, `tool-slot`, `tool-slot-axe`, `pdf-merge`, `pdf-pieces`, `handoff` e `drop-anywhere` (Playwright); `cookie-seal`, `hub-icons`, `pdf-pieces-texts`, `handoff` e `inbox-store` (Vitest). Nas partes do CI: o `design.spec.ts` cai nas partes 2 e 3 do Chromium e na 6 do WebKit, e o `image-matrix.spec.ts` na 4 do Chromium e na 9 do WebKit (partes diferentes); os specs novos pesados ficam nas partes 3 e 5 do Chromium e de 5 a 13 do WebKit (§ 474, § 489 e § 508).

**Os testes antigos que mudaram,** cada um com o seu § no formato da § 341 (o que protegia e como a proteção continua): § 462 (o aceno e o vapor do `design.spec.ts`, as sete janelas do `fo-ad-map.spec.ts` e o `pendencias.test.ts`), § 475 (a frente de imagem: o antes e depois aberto e a Oli do cartão no `island.spec.ts`, as opções depois do resultado em vários specs, a razão do D-06 no `image-batch.spec.ts` e no `lib/matrix.ts`, o `startOver`, o `a11y.spec.ts`, o `ads.spec.ts`), § 487 (a frente de PDF: a alça e as setas do juntar no `pdf-tool.spec.ts`, o "Adjust" do girar, o `pdf-states.ts`, a regra da linha de sucesso), § 492 (o `icons.test.ts`), § 507 (o `privacy-share.test.ts`, a data da Privacidade no `calc-defs.test.ts`, os alvos do mapa), § 533 (os da revisão). O teste do D-27 do juntar (novo nesta run) ganhou um retrato sem corrida (§ 512).

## O `pnpm verificar --partes`

Rodou uma vez, no estado final (`c4e2c18`), com a máquina livre. A saída real do resumo:

```
Resumo das partes do CI (pnpm verificar --partes, 21 partes lidas de .github/workflows/ci.yml)
  ok      35.0 s  build: pnpm verificar --build
  ok     161.7 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     392.3 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     248.8 s  playwright: pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto
  ok     151.4 s  playwright: pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto
  ok     132.5 s  playwright: pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto
  ok     119.1 s  playwright: pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto
  ok     138.8 s  playwright: pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto
  ok      57.6 s  playwright: pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto
  ok      77.6 s  playwright: pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto
  ok     249.5 s  playwright: pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto
  ok      75.7 s  playwright: pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto
  ok      55.4 s  playwright: pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto
  ok     106.1 s  playwright: pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto
  ok      64.5 s  playwright: pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto
  ok      40.0 s  playwright: pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto
  ok      77.7 s  playwright: pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto
  ok      74.5 s  playwright: pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto
  ok      96.8 s  playwright: pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto
  ok      67.4 s  playwright: pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto
  ok      89.0 s  playwright: pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto
  soma 2511.4 s (parede 2511.4 s; cada parte com o limite de 900 s)
```

Os portões do `verificar`, todos `ok`: tipos, lint, Vitest (120 arquivos, 1.963 testes), cabeçalhos, worker sem código, SEO (202 páginas indexáveis), links (14.992, nenhuma órfã), conteúdo (33 páginas de ferramenta e de preset, 39 de PDF, 30 guias), prontidão para o AdSense (22 itens), design (211 páginas), licenças, dinheiro e saúde, actionlint e `lint:texto` (0 erro). O Playwright das 18 partes: 3.800 testes passaram e 4 foram pulados (os de CLS do `pdf-merge.spec.ts`, que só existem no Chromium), sem nenhuma falha.

Antes dele, duas execuções inteiras do Playwright na mesma máquina, com a máquina carregada, tiveram uma falha instável cada no `money-calc.spec.ts` (calculadoras, fora da F13a; passaram três vezes sozinhas) e uma no D-27 do juntar, que virou o teste sem corrida da § 512.

## O custo

A última execução do CI antes do relatório (a leve, do push de `0ab0aa0`, `pnpm ci:custo 41973712053`): classe leve, 5 minutos cobrados, 3,0 min de parede, 3 jobs (o `verificar (leve)` com 141 s, o `classificar` e o `ci-ok`). O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

## A conferência no Linux

Não houve: o rótulo `ci` não existe no repositório (§ 461), e a run não o cria. A execução completa do fim faz o papel dela. O que a run fez para não depender só dela: o card do aviso ganhou folga para as fontes mais largas do Linux (§ 458), e a regra do 1º anúncio, 160 px de folga para a troca das fontes (§ 517).

## A revisão

Cinco lentes Sonnet em contexto limpo sobre o commit fixo `411502b`, um cético por achado médio ou acima, um agente Opus de correções e uma segunda passada sobre o diff delas (`docs/relatorios/REVISAO-F13a.md`). 24 achados; depois dos céticos, 5 médios, 17 baixos e 2 refutados. Os 5 médios foram corrigidos (a Oli com a caixa inflada contra os anúncios, o foco no WaterLevel que rolava a página, o nome do juntar, a foto de celular que crescia o retângulo, o 1º anúncio descido antes da fonte), 10 baixos também, e 7 baixos ficaram registrados (grupo 22). A segunda passada não achou nada novo. Nenhum achado crítico, alto ou médio ficou aberto.

## As imagens

Em `docs/relatorios/fase-13a/`, 36 imagens em JPEG (qualidade 80, escala 1, de 21 a 106 KB cada, 1,5 MB no total), só com as fixtures `gen-*` e uma foto gerada na página (nenhuma coordenada, nenhum metadado, nenhum nome de arquivo com dado pessoal). O "antes" saiu do `dist/` do ponto de partida, o "depois" do `dist/` final:

- o aviso a 360 px, no comprimir em pt e na hipoteca em en: `cookie-compress-pt-360-before.jpg` e `-after.jpg`, `cookie-mortgage-en-360-before.jpg` e `-after.jpg`;
- o comprimir a 360 px em repouso, no resultado e no erro, e a 1280 px no resultado: `compress-rest-360-*`, `compress-result-360-*`, `compress-error-360-*`, `compress-result-1280-*`;
- o erro do PNG no HEIC: `heic-png-error-360-after.jpg`;
- o juntar a 360 px com a lista e com uma linha tirada: `merge-list-360-*`, `merge-removed-360-after.jpg`;
- as peças de PDF: a grade com as páginas marcadas, a caixa da assinatura, o FileCard, a Unlock e o trilho de três escolhas a 360 px: `pdf-grid-360-*`, `pdf-signature-360-*`, `pdf-filecard-360-*`, `pdf-unlock-360-*`, `pdf-rail-360-*`;
- o chip que leva, a chegada e a caixa vazia: `handoff-chip-360-after.jpg`, `handoff-arrival-360-after.jpg`, `handoff-lost-360-after.jpg`;
- um hub a 1280 px e o selo da DropZone: `hub-money-1280-*`, `dropzone-seal-1280-*`;
- o guia do HEIC a 1280 px com o arquivo sendo arrastado sobre o H1: `guide-drag-over-h1-1280-after.jpg`;
- no tema escuro, o resultado e a lista do juntar: `compress-result-360-dark-after.jpg`, `merge-list-360-dark-after.jpg`.

## As decisões novas

Os § 456 a § 533 do `DECISOES.md`:

- **A fatia 1:** § 456 (a especificação é o contrato), § 457 (a divisão da F13), § 458 (o aviso compacto, com os dois desvios registrados), § 459 (o aviso e o 1º anúncio nas sete janelas), § 460 (a Oli por estado), § 461 (o rótulo `ci`), § 462 (os testes antigos da fatia 1), § 463 (a base da página de ferramenta).
- **A frente de imagem:** § 464 a § 477 (o retângulo, a Oli e o selo, a faixa e o "Ajustar", o antes e depois e a região viva, os erros, o 3º uso do café, o puxador, o arquivo que cresce, os alvos dos anúncios, as partes do CI, os testes antigos, os itens do molde do `PLANO-FILEORCA.md` que a ficha substitui, os textos).
- **A frente de PDF:** § 478 a § 489 (o retângulo, o juntar, as palavras novas, como cada família guarda a altura, os números, o "Adjust", o café, as peças em dois commits, os testes antigos, os alvos, as partes).
- **A frente dos ícones:** § 490 a § 492; **a junção:** § 493 (o selo `file-drop`) e § 494; **a correção da junção:** § 495 (o CLS das ferramentas de PDF automáticas).
- **A frente do chip e do soltar:** § 496 a § 510 (o caminho do clique à chegada, quais destinos levam, a chegada, a caixa vazia, a faixa, o soltar, o contador, o `dropEffect`, a Privacidade, o service worker que não muda, os alvos, os testes, as partes, o orçamento, o foco da senha errada).
- **O fim:** § 511 (a ilha de PDF passou de 3 KB), § 512 (o Playwright inteiro e o D-27), § 513 a § 533 (as correções e os registros da revisão).

## A válvula de estouro

Não foi usada: os sete itens da F13a entraram (UX-09, UX-10, UX-04 A, UX-11 A, UX-14, UX-16 e UX-18 A), com as 25 pendências.

## A prévia

https://fase-13a-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio; o Workers Builds publica cada push).

## O que fica para a F13b

- **Os itens:** UX-12 A (as calculadoras e o QR), UX-13 A (a página de guia, menos o que a ilha nova já mudou na ferramenta embutida), UX-03 B (a home, com a decisão avulsa do texto), UX-15 A (o mar nos hubs e no escuro) e UX-17 A (as páginas institucionais e o rodapé).
- **As 20 pendências da lista "Fora":** F4 ACE-7 (aceitar e registrar), ACE-8, ACE-9 e ACE-11; F7 obs 1, obs 2, obs 3, f-9, f-10 e f-13; Idiomas E-2 e R2-03; F5b F-2 e F-13; F10 p-2, p-3, p-15, p-16, p-17 e p-19.
- **A válvula de estouro:** não foi usada; os sete itens entraram.
- **O que a F13a viu e é da área deles:**
  - a home: a Oli do topo ficou a 150 px da lateral a partir de 1280 px, e a F13a só a afastou o mínimo (revisão a-2); a home nova mede de novo;
  - as calculadoras: o número do resultado ainda fica sob o aviso a 360 × 740 (F10 p-19, com o UX-12), e o aviso desce o 1º anúncio delas nas janelas altas (§ 459), que o molde novo mede de novo;
  - o guia: a ferramenta embutida já tem a página nova (o retângulo, a Oli no canto, o soltar no H1 do guia); o molde do guia (UX-13) decide o resto;
  - o grupo 22 do `docs/PENDENCIAS.md` ("O que a F13a deixou").

## A lista do que é do Victor

1. `git pull` e conferir na prévia (https://fase-13a-fileorca.vmatusita.workers.dev/), ou no fileorca.com depois do deploy, no celular e no computador:
   - o aviso de cookies menor, na primeira visita (aba anônima);
   - o comprimir, o HEIC para JPG e o juntar, do soltar ao resultado;
   - o chip que leva a imagem para a próxima ferramenta ("Resize this image");
   - um arquivo solto sobre o título de um guia;
   - os ícones novos nos hubs.
2. Ler os textos novos em português: o aviso, os erros, o juntar, os chips e o parágrafo novo da Privacidade.
3. Conferir com o NVDA e o VoiceOver as regiões vivas novas (a posição da assinatura, a linha tirada do juntar e a nota de chegada), junto da F11 t-1 e da F12 p-2.
4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir, para a F13b conferir no Linux no meio dela.
5. Gerar o prompt da F13b com a skill: a ficha da F13, o SHA da main, a lista marcada (`.cache/ESCOLHAS-marcado.md`) e a seção "O que fica para a F13b" deste relatório, com o grupo 22 do `docs/PENDENCIAS.md`.
