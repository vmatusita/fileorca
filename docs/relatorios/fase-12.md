# F12 · Monetização: mais anúncios, parede do bloqueador e café

Relatório da run F12 (prompt em `docs/prompts/prompt-fase-12.md`, plano em `docs/relatorios/fase-12-plano.md`, revisão em `docs/relatorios/REVISAO-F12.md`). Branch `fase-12`, PR [vmatusita/fileorca#25](https://github.com/vmatusita/fileorca/pull/25). Ponto de partida: `e0467c8`.

## Resumo

1. **Nada muda no ar até o Victor ligar as variáveis.** O build sem elas (o de hoje e o da prévia) não tem caixa de anúncio, parede nem a pose `sad`, e carrega os mesmos arquivos e as mesmas requisições de antes.
2. **Com os anúncios ligados,** a home e o hub de guias ganham anúncio (área `geral`), o celular em pé passa de 1 para 2 a 5 anúncios de conteúdo por página (a 1.110 px ou mais um do outro), o computador ganha o multiplex no fim e uma 2ª lateral: 37 unidades, uma por posição, com a densidade em até 19 % no celular (o limite é 30 %).
3. **Com a parede ligada,** quem bloqueia anúncio em fileorca.com vê a Oli triste pedindo para desligar o bloqueador, com o "Usar só desta vez" uma vez por dia; na UE, no Reino Unido e na Suíça é um aviso que fecha, e o Googlebot, quem está offline e quem só teve o anúncio falhando nunca a veem.
4. **O café fala "me ajude"** no card do resultado, no topo do rodapé e na página de apoio nova (o Pix com o botão de 52 px), e quem bloqueia anúncio não ganha mais o café no 1º uso.
5. **A c-04, a c-08 e a f-06 da F3 estão fechadas,** e a receita só começa depois dos passos do Victor no fim deste relatório.

## O que entrou, por decisão da ficha

| Decisão | O que entrou | Onde | § |
| --- | --- | --- | --- |
| 1. A especificação | O contrato dos protótipos, com o que vale do prompt | — | 411 |
| 2. A configuração e o build de teste | A área `geral`, as 37 unidades, o `PUBLIC_ADBLOCK_WALL`; sem ID, nada (Mudança 10); o build de teste com o ajudante, a chave e o segundo servidor | `src/ads/config.ts`, `src/ads/AdSlot.astro`, `src/layouts/BaseLayout.astro`, `scripts/lib/test-build.ts`, `scripts/serve-test-build.ts`, `scripts/serve-dist.ts`, `playwright.config.ts`, `tests/e2e/lib/test-build.ts`, `tests/e2e/lib/production.ts` | 412 a 414, 453, 455 |
| 3. O mapa | As marcas das views, a estimativa a 360 px, as caixas por largura, o push único (plano B), o multiplex, as duas laterais, o aviso de cookies a 150 px | `src/ads/map.ts`, `estimate.ts`, `html.ts`, `AdBreak.astro`, as views e os moldes, `src/styles/components.css` | 415, 419, 420, 422 a 425, 445 |
| 4. O `gate:prontidao` | A conta por largura, os controles negativos e nada da parede no build `all` | `scripts/lib/prontidao.ts`, `scripts/gates/prontidao.ts`, `tests/unit/prontidao.test.ts` | 421 |
| 5. A parede | O componente, a detecção, os modos, o escape, a região, a tag de recuperação, o evento e a Privacidade | `src/components/AdblockWall.astro`, `src/ads/wall.ts`, `src/ads/AdsenseHead.astro`, `src/platform/region.ts`, `src/analytics/events.ts`, `src/i18n/<lang>/wall.ts` e `privacy.ts` | 416, 426 a 434, 449 a 452 |
| 6. A pose `sad` | A décima pose, só na parede, numa constante | `docs/design/assets/Oli/oli-sad.svg`, `src/oli/poses.ts`, `scripts/lib/design-checks.ts`, `scripts/gates/design.ts`, `docs/oli/folha.html` | 417 |
| 7. O café | O card com a confirmação, um botão só em pt, o fim do gatilho de quem bloqueia, o rodapé, a página de apoio e o Pix | `src/tools/image/coffee.ts`, `ImagePanel.tsx`, `PdfPanel.tsx`, `src/components/Footer.astro`, `SupportCard.astro`, `src/views/SupportView.astro` | 435 a 444 |
| 8. O consentimento | A c-04 pela saída A (o fuso do aparelho) e a f-06 | `src/analytics/consent.ts`, `src/components/CookieNotice.astro`, `src/platform/region.ts` | 428, 429, 449 |
| 9. O `docs/design/` e o `docs/OPERACAO.md` | AdSlot, Layout e anúncios, Button, Oli, AdblockWall (novo), ResultCard, Footer, SupportCard; a seção "Anúncios e parede do bloqueador" | `docs/design/`, `docs/OPERACAO.md` | 425, 433, 444, 454 |
| 10. Os textos | A parede com o ajuste 3, o café da seção C, os glossários | `src/i18n/<lang>/`, `src/tools/*/i18n/`, `docs/i18n/` | 431, 441, 452 |
| 11. Os testes | Ver "Os testes" abaixo | `tests/` | 418, 422, 423, 434, 443, 447 |
| 12. As imagens | 26 imagens | `docs/relatorios/fase-12/` | — |
| 13. `docs/claude/` e `docs/PENDENCIAS.md` | A seção "F12: monetização" em cinco arquivos de tema; o PENDENCIAS com 10 itens fechados, a t-3 aceita e o grupo 21 | `docs/claude/`, `docs/PENDENCIAS.md` | 446, 447 |
| 14. A PR e o CI | Rascunho desde o 1º push; sem o rótulo `ci`, a conferência no Linux é a execução final | — | 448 |

## O que a ajuda do Google disse, e a escolha

- **O `display: none` (§ 415).** A `support.google.com/adsense/answer/1354736` proíbe "Hiding ad units at anytime (e.g., `display:none`)", "unless you're implementing a responsive ad unit", e o link da exceção leva ao exemplo da `answer/9183363`, que esconde uma unidade de tamanho fixo por largura e manda apagar as linhas `data-ad-format="auto"` e `data-full-width-responsive`. Nenhuma página cita o `autorelaxed` (o multiplex). A exceção não cobre, sem dúvida, as unidades do mapa, então vale o **plano B**: o HTML não tem `<ins>`, cada caixa diz a largura em que vale, e o push único, só em fileorca.com, dá o `<ins>` e um `push()` à caixa da largura certa no carregamento e tira a outra do DOM. Girar o aparelho depois não cria nem tira anúncio.
- **A tag de recuperação e a API (§ 416).** A ajuda (`answer/11575177`) manda a tag para o `<head>` e não traz o código; a forma (um script de `fundingchoicesmessages.google.com/i/pub-…?ers=1` e o `signalGooglefcPresent`) veio de cópias públicas, e o Victor a confere na aba Tagging. A `fc-api-docs` define o `googlefc.callbackQueue` com `AD_BLOCK_DATA_READY` e o `getAdBlockerStatus()` (0 desconhecido, 1 extensão, 2 rede, 3 sem bloqueador); o exemplo da própria página usa um nome errado do enum, e o código compara pelos números. O "error protection code" não entra.

## A evidência de cada critério

1. **O build padrão.**
   - `tests/unit/default-build.test.ts` (novo) varre as 211 páginas do `dist/`: nenhuma caixa, rótulo, unidade, push, carregador, parede, isca, tag ou `sad`. Contra o `dist/` do ponto de partida, reprovou nas 178 páginas com área de anúncio (a caixa neutra e o rótulo).
   - O orçamento, com o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, antes e depois: **as 183 páginas medidas com os mesmos arquivos JS e as mesmas requisições, e as 59 medidas da página seguinte iguais** (`node .cache/f12/budget-compare.mjs`). Os 66 nomes de `dist/_astro/` sem o hash são os mesmos.
2. **A configuração.** `tests/unit/ads.test.ts`: as 37 unidades e a `geral` passam, cada área, unidade e ID errados e cada valor errado do `PUBLIC_ADBLOCK_WALL` reprovam com a mensagem certa, e a parede só vale com as três variáveis (§ 412).
3. **O mapa,** no build de teste, `tests/e2e/fo-ad-map.spec.ts` (51 testes por navegador) e `tests/e2e/ads.spec.ts` (201), verdes nos dois navegadores: a densidade conservadora em até 30 % nas 184 páginas a 360 × 740 e a 459 × 900, a 600 × 960, a 768 × 1024 e a 812 × 375; 1.110 px ou mais entre anúncios de conteúdo; 150 px de todo alvo (o Baixar, os campos, os menus abertos, o painel, a Oli, a linha do café do card e do rodapé, a grade no multiplex, o aviso de cookies aberto a 360 × 740 e a 1280 × 800); nada acima da ferramenta; o 1º da home a 2.110 px ou mais no celular; o 1º da ferramenta depois do "Como usar"; as 27 páginas livres sem anúncio; as larguras de cada caixa; um `push` por caixa da largura, uma vez só. A tabela está abaixo.
4. **O `gate:prontidao`** passa com 22 itens, contando por largura (celular a 360 px, computador a 1280 px); o `tests/unit/prontidao.test.ts` tem um controle negativo em cada largura. Contando toda caixa do HTML, 89 das 184 páginas reprovariam; por largura, nenhuma (§ 421).
5. **A parede.** `tests/e2e/fo-wall.spec.ts`, 38 casos, verdes nos dois navegadores; a matriz está abaixo. O `adblock_wall` só com as listas fechadas, no `events.spec.ts`.
6. **A acessibilidade.** O axe dá zero nos dois temas, a 360 e a 1280 px, nos dois navegadores, na parede em bloqueio, em aviso, com a ajuda aberta e depois do escape (`fo-wall.spec.ts`), na linha do café e na página de apoio (`ads-coffee.spec.ts`, `coffee.spec.ts`, `a11y.spec.ts`). O foco abre no recarregar, fica preso e cai no `<main>` (sem o anel, § 450); todo alvo novo tem 48 px; o vapor para em 4,8 s (`design.spec.ts`); nada se mexe com o movimento reduzido.
7. **Os textos.** A lista "click", "clique" e "clic" passa nos textos da parede (`tests/unit/wall.test.ts`) e do café (`tests/unit/coffee-texts.test.ts`); o `glossary.test.ts` e o `english-leak.test.ts` (que passou a ler a parede em pt e es) passam; o `pnpm lint:texto` sai com 0 erro de gramática em 1.501 textos.
8. **O café.** Os textos da seção C nos três lugares, o 1º uso de quem bloqueia sem café, a confirmação com `role="status"` e o foco no Baixar, um botão só em pt (`coffee.spec.ts`, `ads-coffee.spec.ts`, `coffee.test.ts`); o "Copiar código" com 52 px antes do QR no celular (`money-pix.spec.ts`). As ilhas encolheram: `island` de 18.612 para 18.544 B com gzip (−68) e `PdfIsland` de 16.893 para 16.787 (−106), dentro dos +0,5 KB.
9. **O consentimento.** A c-04 (`consent.spec.ts` e `consent.test.ts`, com o oráculo dos fusos das 32 regiões) e a f-06 (`cookie-footer.spec.ts`, 1280 para 320 px em `/es/privacidad/`) passam, e reprovaram contra o ponto de partida (§ 428, § 429, § 449).
10. **A Privacidade** tem o texto do ajuste 1 nos três idiomas (`tests/unit/wall.test.ts`).
11. **O orçamento e o CLS.** No build de teste, o JS inicial fica em até **54,1 KB** com gzip (limite 80) nas 184 páginas medidas no Chromium; o inline do push tem 894 B (469 com gzip), o da parede 3.796 B (1.696 com gzip) e a tag de recuperação 522 B (327). No build padrão, o maior JS inicial foi de 51,9 para 52,3 KB (o script do consentimento com o fuso da c-04). O `layout-shift.spec.ts` passa de 320 a 412 px nos dois builds; o CLS impresso é o mesmo nos dois, com o maior em 0,051 em `/es/calculadora-de-consolidacion-de-deudas/` a 360 px, o mesmo número do ponto de partida (a pendência "Idiomas E-2", § 321, da F13; o Lighthouse mede 0,000 nela).
12. **O Lighthouse:** desempenho de 99 a 100 (a mediana de 3 rodadas) e CLS de no máximo 0,001 nas 11 URLs do `lighthouserc.json` (o `verificar --partes` abaixo).
13. **A documentação.** O `docs/design/`, o `docs/OPERACAO.md`, o `docs/claude/` (cinco arquivos de tema) e o `docs/PENDENCIAS.md` em dia; o `pendencias.test.ts`, o `operacao.test.ts` e o `claude-md.test.ts` passam; os § vão do 410 ao 455.
14. **Os testes.** O Vitest foi de 109 arquivos e 1.833 testes para 115 e 1.909; o `--list` do Playwright, de 1.563 para 1.693 por navegador (51 para 54 arquivos). Os testes antigos que mudaram estão abaixo, cada um com o seu §.
15. **O `pnpm verificar --partes`:** as 21 partes verdes, soma de 2.414,1 s, a maior com 391,5 s (o Lighthouse); nenhuma acima de 700 s (abaixo).
16. **A revisão:** nenhum achado crítico, alto ou médio aberto (`docs/relatorios/REVISAO-F12.md`).
17. **O CI:** a execução depois do `gh pr ready` vai na descrição da PR, com o custo.

## As tabelas

### O mapa por molde, no build de teste (Chromium)

184 páginas, 540 anúncios de conteúdo a 360 × 740; densidade máxima 19,0 %, mediana 15,3 %. As distâncias são as menores medidas, em px, de qualquer anúncio até o alvo, a 360 × 740 e a 1280 × 800 ("—": o molde não tem o alvo em repouso). O WebKit deu praticamente o mesmo.

| Molde | Págs. | Anúncios a 360 | Densidade 360 máx · med. | 768×1024 máx | 812×375 máx | Menor vão entre anúncios | Baixar | Campos | Menus | Painel | Oli | Café | Cronograma | Grade |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 3 | 4–5 | 12,7 % · 12,6 % | 16,2 % | 16,5 % | 1.528 | — | — | 159 | — | 150 | 318 | — | 150 |
| Hub de guias | 3 | 2–3 | 14,2 % · 14,0 % | 23,4 % | 23,7 % | 1.496 | — | — | 159 | — | — | 318 | — | 150 |
| Ferramenta de imagem | 33 | 2 | 18,0 % · 16,4 % | 26,2 % | 26,5 % | 1.361 | — | 150 | 159 | 150 | 168 | 318 | — | 166 |
| Ferramenta de PDF | 36 | 2 | 16,9 % · 15,1 % | 25,4 % | 25,7 % | 1.782 | — | 150 | 159 | 150 | 168 | 318 | — | 166 |
| QR code | 3 | 2 | 14,8 % · 13,9 % | 23,4 % | 23,7 % | 1.600 | 176 | 481 | 159 | 150 | 168 | 318 | — | 166 |
| Hub de arquivos | 6 | 2 | 13,7 % · 11,8 % | 23,7 % | 24,2 % | 1.496 | — | — | 159 | — | — | 318 | — | 150 |
| Hub de dinheiro | 3 | 2–3 | 13,9 % · 12,4 % | 23,7 % | 24,0 % | 1.416 | — | — | 159 | — | — | 318 | — | 150 |
| Hub de casa e saúde | 2 | 2 | 15,5 % · 15,4 % | 26,1 % | 26,5 % | 1.338 | — | — | 159 | — | — | 318 | — | 150 |
| Calculadora de dinheiro | 44 | 2–5 | 18,3 % · 15,3 % | 21,4 % | 21,7 % | 1.300 | 320 | 318 | 159 | 150 | — | 318 | 214 | 166 |
| Calculadora de casa e saúde | 11 | 3–4 | 19,0 % · 17,6 % | 21,4 % | 21,7 % | 1.343 | 302 | 290 | 159 | 150 | — | 318 | 214 | 166 |
| Guia de arquivo | 30 | 3–5 | 16,5 % · 15,3 % | 18,0 % | 18,3 % | 1.316 | — | 230 | 159 | 150 | 168 | 318 | — | 166 |
| Guia de dinheiro | 10 | 3–4 | 13,9 % · 12,4 % | 16,3 % | 16,5 % | 1.336 | 347 | 545 | 159 | 150 | — | 318 | 308 | 166 |
| Livres | 27 | 0 | 0 | 0 | 0 | — | — | — | — | — | — | — | — | — |

- A 1280 × 800, o multiplex fica a 1.366 px ou mais do conteúdo 1, e a lateral 2 está no HTML de 172 das 184 páginas (as de 600 palavras ou mais), mostrada onde a coluna tem 2.638 px.
- O conteúdo 2 em diante vale só até 459 px (§ 445): a menor distância entre dois anúncios de conteúdo é 1.345 px a 320, 1.300 a 360, 1.219 a 412, 1.146 a 440 e 1.120 a 459 px. De 460 a 767 px a página fica só com o 1º.
- A home: o 1º anúncio começa a 2.110 px ou mais no celular, fora da primeira tela também a 1280 px.

### A parede: caso × navegador × resultado

Todos os 38 casos do `fo-wall.spec.ts` passam no Chromium e no WebKit (na suíte inteira de 3.376 testes e nas execuções da revisão e do `verificar`).

| Grupo | Caso | Chromium | WebKit |
| --- | --- | --- | --- |
| O sinal do Google | A extensão abre em bloqueio, com o foco no recarregar | passa | passa |
| | O nome do exemplo do Google (`EXTENSION_LEVEL_AD_BLOCKER`) abre também | passa | passa |
| | O bloqueio por rede dá sempre o aviso, mesmo com a variável em bloqueio (ajuste 2) | passa | passa |
| | Sem bloqueador, a detecção acaba: nenhuma parede, mesmo com o erro e a isca escondida | passa | passa |
| | O status desconhecido não decide: o sinal reserva ainda abre | passa | passa |
| | Uma resposta do Google depois da janela de 4 s não faz nada | passa | passa |
| | A página em português tem a parede em português | passa | passa |
| O sinal reserva | O erro do carregador e a isca escondida, juntos, abrem 4 s depois do `load` | passa | passa |
| | Só o erro, com a isca no lugar (o Googlebot), nunca abre | passa | passa |
| | Só a isca escondida, com o carregador lá, nunca abre | passa | passa |
| Onde nunca abre | Um anúncio preenchido encerra a detecção (Acceptable Ads) | passa | passa |
| | Offline, nada é detectado | passa | passa |
| | As páginas livres não têm a parede nem a pose | passa | passa |
| | Fora de fileorca.com (o mesmo build em 127.0.0.1) | passa | passa |
| O escape | Libera por 30 minutos, depois volta sem o botão até a meia-noite local | passa | passa |
| | Sem `localStorage`, libera só a página aberta | passa | passa |
| A região | `__tcfapi` com GDPR: espera a mensagem e abre o aviso | passa | passa |
| | `tcloaded` com GDPR dá o aviso na hora | passa | passa |
| | `__tcfapi` sem GDPR mantém a variável (bloqueio) | passa | passa |
| | Sem `__tcfapi`, o fuso `Europe/Berlin`, `Europe/London`, `Atlantic/Canary` e `Asia/Nicosia` dá o aviso, e o fuso fica no aparelho | passa | passa |
| O teclado e o Esc | O foco preso no diálogo e no `<main>` ao fechar com Esc | passa | passa |
| | O botão de fechar fecha o aviso | passa | passa |
| | No bloqueio, nenhum Esc fecha, nem dois seguidos | passa | passa |
| | O `Ctrl+K` não abre a busca por cima | passa | passa |
| | A ajuda com `aria-expanded`, as nove entradas uma por vez e o rodapé à vista | passa | passa |
| A cara | Todo alvo com 48 px ou mais, com a ajuda aberta, a 360 e a 1280 px | passa | passa |
| | O card a 16 px das bordas no celular e sobre a coluna da ferramenta a partir de 1280 px | passa | passa |
| | Nada em `sun`, nenhum anúncio nem link dentro; a rolagem travada sem deslocamento; a Oli da página escondida | passa | passa |
| | O mar é a `water` no claro e o `deep` no escuro, pelo sistema e pelo botão de tema | passa | passa |
| | Uma entrada de até 480 ms, e nada se mexe com o movimento reduzido | passa | passa |
| | A `sad` no sprite só das páginas com a parede, em até 4 KB | passa | passa |
| | O axe em bloqueio, em aviso, com a ajuda aberta e depois do escape, nos dois temas, a 360 e a 1280 px | passa | passa |

### O orçamento

| Medida | Antes (`e0467c8`) | Depois | Limite |
| --- | --- | --- | --- |
| Build padrão: arquivos JS por página (183 páginas) | os da linha de base | os mesmos nas 183 | os do ponto de partida |
| Build padrão: requisições por página (183) e na página seguinte (59) | as da linha de base | as mesmas | as do ponto de partida |
| Build padrão: nomes de `dist/_astro/` sem o hash | 66 | os mesmos 66 | iguais |
| Build padrão: maior JS inicial (gzip) | 51,9 KB | 52,3 KB | 80 KB |
| Build de teste: maior JS inicial (gzip, com o push e a parede) | — | 54,1 KB | 80 KB |
| Ilha `island` (gzip) | 18.612 B | 18.544 B | +512 B |
| Ilha `PdfIsland` (gzip) | 16.893 B | 16.787 B | +512 B |

A tabela página a página do build padrão (JS, requisições e KB antes e depois) foi gerada fora do Git (`.cache/f12/depois/budget-table.md`); nenhuma página mudou de arquivos nem de requisições.

## Os testes

- **O Vitest:** de 109 arquivos e 1.833 testes para 115 e 1.909.
- **O `--list` do Playwright:** de 1.563 para 1.693 por navegador (de 51 para 54 arquivos: `fo-ad-map.spec.ts`, `fo-wall.spec.ts` e `ads-coffee.spec.ts`). O `design.spec.ts` e o `image-matrix.spec.ts` seguem em partes diferentes (3 e 4 no Chromium, 6 e 10 no WebKit).
- **A suíte inteira** rodou uma vez antes da revisão, no código junto: 3.376 testes verdes (1.688 por navegador).
- **Os testes antigos que mudaram,** cada um no formato da § 341, sem nenhum sair, ser pulado ou afrouxar:
  - § 418 (a Mudança 10 e o build de teste): `ads.test.ts`, `ads-pages.test.ts`, `image-hub.test.ts`, `prontidao.test.ts`, `conteudo.test.ts`, `ads.spec.ts`, `header-menu.spec.ts`, e as nove poses em `design-checks.test.ts`, `sprite.test.ts`, `folha.test.ts` e `design.spec.ts`;
  - § 423 (o mapa): `ads.spec.ts` (o 1º anúncio depois do "Como usar", as 27 livres, os hubs, o bloco do cabeçalho com 184 páginas), `ads.test.ts`, `ads-pages.test.ts`, `guides-hub-route.test.ts`, `guides-hub.spec.ts` e as mensagens do `prontidao.test.ts`;
  - § 424 (a regra dos guias no `gate:conteudo`): `conteudo.test.ts`;
  - § 434 (a parede e o consentimento): `consent.test.ts`, `calc-defs.test.ts` (a data da Privacidade) e `consent.spec.ts`;
  - § 443 (o café): `coffee.test.ts`, `routes.test.ts`, `english-leak.test.ts`, `coffee.spec.ts`, `events.spec.ts`, `money-pix.spec.ts`, `design.spec.ts` (o vapor que para) e `header-menu.spec.ts` (a linha nova do rodapé);
  - § 447 (o PENDENCIAS): `pendencias.test.ts`;
  - § 449, § 450 e § 454 (as correções da revisão): `consent.test.ts`, `wall.test.ts`, `consent.spec.ts`, `fo-wall.spec.ts` e `prontidao.test.ts`.

## O `pnpm verificar --partes`

Rodou uma vez, no `24ec0e1` (o último commit de código), com a máquina livre: **as 21 partes verdes, soma de 2.414,1 s, nenhuma acima de 700 s** (o limite de cada parte é 900 s).

| Parte | Comando | Total |
| --- | --- | ---: |
| build | `pnpm verificar --build` | 34,3 s |
| portões | `pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto` | 151,1 s |
| Lighthouse | `pnpm verificar --lighthouse --dist-pronto` | 391,5 s |
| Chromium 1/5 | `--playwright=chromium --shard=1/5 --dist-pronto` | 226,3 s |
| Chromium 2/5 | `--shard=2/5` | 125,2 s |
| Chromium 3/5 | `--shard=3/5` | 110,7 s |
| Chromium 4/5 | `--shard=4/5` | 114,3 s |
| Chromium 5/5 | `--shard=5/5` | 92,3 s |
| WebKit 1/13 | `--playwright=webkit --shard=1/13 --dist-pronto` | 52,5 s |
| WebKit 2/13 | `--shard=2/13` | 60,9 s |
| WebKit 3/13 | `--shard=3/13` | 302,8 s |
| WebKit 4/13 | `--shard=4/13` | 81,4 s |
| WebKit 5/13 | `--shard=5/13` | 61,2 s |
| WebKit 6/13 | `--shard=6/13` | 95,7 s |
| WebKit 7/13 | `--shard=7/13` | 140,4 s |
| WebKit 8/13 | `--shard=8/13` | 34,8 s |
| WebKit 9/13 | `--shard=9/13` | 53,4 s |
| WebKit 10/13 | `--shard=10/13` | 85,3 s |
| WebKit 11/13 | `--shard=11/13` | 57,7 s |
| WebKit 12/13 | `--shard=12/13` | 84,5 s |
| WebKit 13/13 | `--shard=13/13` | 58,0 s |
| **Soma** | | **2.414,1 s** |

- **Os portões:** o Vitest com 115 arquivos e 1.909 testes verdes; o `gate:prontidao` com 22 itens (o build `client` em 33,0 s, o `all` reaproveitado do `gate:conteudo`, na mesma parte); o `lint:texto` com 18 arquivos, 1.501 textos e 0 erro de gramática (543 avisos de estilo); todos os outros portões verdes.
- **O Lighthouse** (11 URLs, 3 rodadas cada, celular): desempenho de 99 a 100 em toda URL (a mediana), acessibilidade, boas práticas e SEO em 100, CLS de 0,000 em dez e 0,001 em `/pt/simulador-sac-price/`.
- **O build de teste nas partes:** a parte 1 do Chromium fez o build de teste (por isso os 226 s) e as outras o reaproveitaram, porque a árvore estava limpa e o commit era o mesmo; no CI, cada parte é uma máquina nova e paga o seu.
- **O primeiro `verificar --partes`,** no `fadb2fc`, parou na parte dos portões: o teste novo da trava (§ 455) caiu com um `EPERM` do Windows na leitura do arquivo do dono, com o Vitest inteiro ao lado. A correção (`24ec0e1`) está na § 455, e esta é a execução depois dela.

## O custo

- **A última execução do CI antes deste relatório** (`pnpm ci:custo 41889498163`, a execução leve do `1d63498`): classe **leve**, **5 minutos cobrados**, **3,5 min de parede**, 3 jobs rodaram e 7 foram pulados; o `verificar (leve)` levou 161 s (125 s do `verificar`, 17 s do build).
- **O build de teste no CI** só roda na execução completa: cada parte que roda um spec com ele paga um build (35 a 53 s nesta máquina; mais no Linux do CI). São as partes 1 a 4 do Chromium e as 3, 4, 6, 7, 8 e 10 do WebKit. O `ci:custo` da execução final, com os segundos de cada parte, vai na descrição da PR.

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh api repos/vmatusita/fileorca/labels/ci` deu 404) e criá-lo é do Victor (§ 448). A execução final, depois do `gh pr ready`, faz o papel dela, e o atalho do `ready` seguido do `--undo` não foi usado (§ 401).

## A revisão

Seis lentes Sonnet em contexto limpo, no commit `1d63498`, numa worktree só de leitura com o próprio build e o próprio build de teste; um cético para cada achado médio e um para os baixos de cada lente; um agente Opus para as correções e uma segunda passada sobre o diff delas. **22 achados, nenhum crítico nem alto.** O médio confirmado (C-1, o fuso do Chipre fora da região, que fazia a c-04 voltar e a parede abrir em bloqueio num país da UE) e dez baixos foram corrigidos (§ 449 a § 454); um baixo (A-2, o aviso de cookies perto do 1º anúncio em janelas que a ficha não mede) foi para o grupo 21; dez foram refutados. A segunda passada achou uma corrida na tomada da trava do build de teste, corrigida com um teste de dois processos (§ 455), e o primeiro `verificar --partes` achou um `EPERM` na leitura dessa trava, corrigido também. Detalhes em `docs/relatorios/REVISAO-F12.md`.

## As imagens

Em `docs/relatorios/fase-12/` (26 JPEG de qualidade 80, escala 1, 2,9 MB no total, todas abaixo de 300 KB):

- **A parede** (12): `wall-block-en-360-light`, `wall-block-en-360-dark`, `wall-block-en-1280-light`, `wall-notice-en-1280-dark`, `wall-help-en-360-light`, `wall-help-en-1280-dark`, `wall-after-escape-en-360-light`, `wall-block-pt-360-light`, `wall-notice-pt-360-dark`, `wall-block-pt-1280-light`, `wall-help-pt-1280-light`, `wall-after-escape-pt-1280-dark`.
- **O mapa no build de teste** (8, recortados): `map-home-360`, `map-home-1280`, `map-tool-360`, `map-tool-1280`, `map-calculator-360`, `map-calculator-1280`, `map-guide-360`, `map-guide-1280`.
- **O build padrão a 1280 px, sem caixa** (1): `default-build-tool-1280`.
- **O café** (5): `coffee-card-en-360`, `coffee-confirmation-en-360`, `coffee-footer-pt-360`, `support-pt-360`, `support-pt-1280`.

## A prévia

`https://fase-12-fileorca.vmatusita.workers.dev/` é o build padrão: ela não mostra anúncio nem parede. Nela se vê a linha do café no topo do rodapé, a página de apoio nova (`/pt/apoie/`) e, no 3º uso de uma ferramenta com o aviso de cookies aceito, a linha do café no resultado.

## As decisões novas

Do § 410 ao § 455 do `DECISOES.md`: o ponto de partida e a numeração (410), a especificação (411), a configuração (412), a Mudança 10 (413), o build de teste (414), a ajuda do Google e o plano B (415), a tag e a API (416), a `sad` (417), os testes da fatia 1 (418), o mapa (419 a 425), a parede e o consentimento (426 a 434), o café (435 a 444), o conteúdo 2 só até 459 px (445), a t-3 aceita (446), o PENDENCIAS (447), a conferência no Linux (448) e a revisão (449 a 455).

## A válvula

Nada foi cortado: a lateral 2 e o multiplex entraram.

## O que é do Victor, em passos

1. **`git pull` e conferir na prévia,** ou no fileorca.com depois do deploy: nenhuma caixa vazia, a linha do café no topo do rodapé, a página de apoio nova e, no 3º uso de uma ferramenta (com os cookies aceitos), a linha do café no resultado.
2. **A busca reversa da `sad` no Google Lens** (15 min, com os PNG de `docs/relatorios/fase-10/oli/`). Se ela achar algo parecido demais, pedir uma run curta que troca a pose da parede pela `oops` (a constante `WALL_POSE` de `src/oli/poses.ts`).
3. **Com o AdSense aprovado, o passo a passo da seção "Anúncios e parede do bloqueador" do `docs/OPERACAO.md`:**
   - criar as 37 unidades e atualizar o `PUBLIC_ADSENSE_SLOTS` pelo modelo de lá;
   - deixar a mensagem de recuperação do Google em Rascunho, sem mostrar a quem usa Acceptable Ads, e conferir a tag na aba Tagging;
   - desligar os gatilhos adicionais da vinheta;
   - pôr o `PUBLIC_ADBLOCK_WALL` em `bloqueio` e usar o Retry no último build da `main`;
   - testar com o uBlock Origin no computador, com o Brave no Android e com o fuso do aparelho na Europa (a VPN não muda o fuso que a parede lê);
   - se a parede só aparecer pelo sinal reserva, publicar a mensagem do Google com a inclusão em `/__sem-mensagem/`.
4. **Antes de ligar a parede na UE** (lá ela é só aviso), conferir a leitura da ePrivacy sobre a chave do escape (F10 p-9) e, com a mensagem de consentimento publicada, a c-04 no `dataLayer` (F12 p-6).
5. **Ler os textos em português** da parede e do café, e acompanhar por 2 semanas, no GA4, as páginas por sessão e o `adblock_wall` e, no Search Console, os Core Web Vitals.
6. **Criar o rótulo `ci`** (Issues → Labels), para a próxima run conferir no Linux no meio dela (F11 p-1).
7. **Gerar o prompt da F13a** com a lista marcada e o que a F12 deixou (o grupo 21 do `docs/PENDENCIAS.md`).
