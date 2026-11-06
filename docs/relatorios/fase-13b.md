# F13b · relatório

A segunda run da fase "UX/UI: implementação" do `PLANO-MELHORIAS.md`. A ficha é o `docs/prompts/prompt-fase-13b.txt`, e o plano, o `docs/relatorios/fase-13b-plano.md`. Ponto de partida: `bd844ca` (a `main` com a F13a). Branch `fase-13b`, PR https://github.com/vmatusita/fileorca/pull/27.

## Resumo

- A F13b construiu as escolhas do Victor na ordem dele: o card das calculadoras e o QR (UX-12 A), a página de guia de arquivo (UX-13 A), a home como o mar por categoria (UX-03 B), o mar nos hubs e a linha d'água do escuro (UX-15 A), e as páginas institucionais com o rodapé no celular (UX-17 A).
- Junto foram as 20 pendências da decisão 2, a F11 R-E-1 (a contagem sem os presets: 46, 29 e 35) e as três linhas do grupo 22 (a página de ferramenta a 320 px). Das 24 linhas, 23 estão em "Já corrigidos", com o § e o teste, e a F4 ACE-7 está em "Registrados".
- O trabalho correu em quatro frentes Opus, cada uma na sua worktree (C, G e H ao mesmo tempo, I depois da junção), e o agente principal fez a base comum (a fonte de reserva no negrito, o token `--danger-on-deep`, a linha d'água, a contagem e as datas curtas), o grupo 22, a junção, a documentação e as tabelas.
- A revisão adversarial de seis lentes achou 6 médios e 17 baixos (8 refutados): os 6 médios e 15 baixos foram corrigidos, e a segunda passada achou mais três, também corrigidos. Os §§ 535 a 601 registram as decisões.
- O `pnpm verificar --partes` passou nas 21 partes na máquina (soma de 3.374 s; a maior, 406 s). As 183 páginas do orçamento têm os mesmos JS e requisições; o Lighthouse dá de 99 a 100 com CLS 0,000; o mapa de anúncios fica em até 18,4 % de densidade, com o aviso a 310 px ou mais do 1º anúncio. A execução completa do CI roda depois deste relatório, com o `gh pr ready`.

## O que entrou, por item

### A base comum (agente principal; §§ 535 a 543)

- **A fonte de reserva no negrito (F10 p-15, § 537):** duas faces novas da `Figtree Fallback` (600 e 700 a 900), calibradas sobre a Arial Bold: a largura dos rótulos em 600 fica igual com a reserva e com a Figtree, nos dois navegadores (100,0 %). "Window area" da Paint fica numa linha a 360 px no WebKit com a Figtree segurada.
- **O token `--danger-on-deep` (§ 538):** `#FF8A80`, igual nos dois temas, para o ícone de alerta sobre o `deep` (6,04:1, onde o `danger` do claro daria 2,45:1). É o único token novo.
- **A linha d'água (§ 539):** a `.fo-sea-top` (16 px de ar em `surface` que terminam na onda, com uma crista de 2 px em `stroke`, só pseudo-elementos) no ResultHero, e a crista sobre a onda do rodapé. O resultado da página de ferramenta usa a faixa de água da F13a, sem segunda onda.
- **A contagem (§ 540):** `src/components/tool-count.ts`, lida dos registros no build, sem os presets: 46 em en, 29 em pt e 35 em es; 14 calculadoras de dinheiro em en e es (o Menu continua com 14). A Sobre e os Termos usam placeholders, e os Termos de en e es mudaram de data (5 de novembro de 2026).
- **As datas curtas (§ 543):** `shortDate` e `mediumDate`, escritas à mão (sem `Intl`), comparadas com o `Intl` do Node em todos os dias de 2026 e 2027.

### UX-12 A · as calculadoras e o QR (frente C; §§ 544 a 556)

- O Baixar PDF dentro do ResultHero; a Oli no card desde a primeira pintura (`wave` parada no exemplo, `cheer` uma vez por visita, `oops` no erro, nunca `cheer` na saúde); o erro no lugar do Baixar, com "Last result that worked: …" e o número em `on-deep-muted`; o campo culpado com `aria-invalid` e `aria-describedby` (F4 ACE-11 pelo `problemField`).
- A assinatura numa linha, com a data curta, e o topo mais justo abaixo de 768 px: na hipoteca (en e es) e no SAC × PRICE, o número termina em 592 px com o aviso de cookies aberto (o aviso começa em 604).
- O bloco que dobra (os custos da hipoteca e a TR do SAC × PRICE), com o total no título e o eco do resultado no celular; o cronograma dentro da ilha, antes dos chips, com o nome fixo; `th[scope=row]` em toda tabela; "Download CSV".
- O SAC × PRICE com a PRICE no card e as duas barras na mesma escala; os rótulos da BTU ("Normal", "Shade", "Sun") e da Paint; a etiqueta "example" compacta abaixo de 400 px; as datas curtas da Ovulation; a descrição dos anos no 15 o 30 años.
- O QR sem Baixar desligado (a altura guardada pela `.fo-qr__wait`) e com o tamanho do PNG na 2ª linha.
- Depois da revisão: o card guarda a altura com qualquer valor de verdade (§ 595), cada campo errado é descrito pela própria faixa (§ 593 e § 600), e no celular a mensagem de um campo depois do card aparece embaixo dele enquanto ele tem o foco (§ 594).

### UX-13 A · a página de guia (frente G; §§ 557 a 566)

- Os 30 guias de arquivo na ordem nova: trilha, H1, assinatura numa linha, a ficha "What we measured" (dois números lidos do `data/guides-measured.json`), a ferramenta, a introdução, o texto, as medidas, as fontes e as relacionadas.
- As tabelas sem a coluna igual em todas as linhas, agrupadas por `tbody` com `th scope="rowgroup"`, e a moldura com o nome do título; a pista de rolagem só em CSS; o link da ferramenta numa frase do texto (o `.fo-guide__open` saiu).
- A dobra: o topo do painel a 360 × 740 foi de 1.084–1.374 px para 642–718 px; o fim do Escolher a 1280 × 800, de 865–989 px para 709–767 px; a assinatura a 360, de 80–120 px para 20 px.

### UX-03 B · a home como o mar (frente H; §§ 567 a 574 e 576 a 579)

- O H1 "46 tools. 0 uploads." (29 e 35 em pt e es), o mar parado no topo com o selo e a Oli `swim` (128 px, 152 a partir de 768) que balança três vezes e para, e uma faixa por categoria com a contagem, um número com fonte, a frase da fonte, uma frase a mais, os chips e o link do hub.
- Os números (`src/components/home-numbers.ts`): 9,3 MB → 2,5 MB (as mesmas 3 fotos medidas em dois guias), 2,9 MB → 950 KB, $2,396.20 por mês, R$ 284.596 a menos de juros, 1,9 galão, 1.273 caracteres.
- Com a `wide` do BaseLayout, o `<main>` da home ocupa 1.208 px a 1280. A altura do `<main>` a 360 foi de 10.168 para 5.682 px em en (7.802 → 4.942 em pt; 7.878 → 4.848 em es).
- 3 caixas de anúncio por largura no build de teste, com 565, 512 e 524 palavras no `<main>`.

### UX-15 A · o mar nos hubs (frente H; § 575)

- O `HubSea.astro` no pé da faixa dos quatro hubs de categoria: a água, a crista de 3 px e a Oli de 72 px meio submersa, tudo `aria-hidden`. A faixa é `*-soft` no claro e `surface` no escuro. O 1º cartão do hub de imagem em en a 360 fica em 726 px.

### UX-17 A · as institucionais e o rodapé (frente I; §§ 583 a 590)

- A coluna da direita a 1280 nas seis páginas sem anúncio: o mar na 404, o cartão "FileOrca in numbers" na Sobre e na Contato, o índice "On this page" na Privacidade, nos Termos e nas Licenças. Nenhum AdSlot nem classe `fo-ad*`.
- A 404 com a Oli `lost` na água, a busca sem `shadow-pop`, três chips (a primeira ferramenta de cada hub, lida dos registros) e o status 404.
- O rodapé no celular: o hub de cada categoria à vista e as ferramentas num `<details>`. A 360 ele foi de 2.118, 1.572 e 1.606 px para 880, 760 e 760 px (en, pt, es); a partir de 768 px, os mesmos links, na mesma ordem e na mesma altura. O bloco Guias também ganhou um `details` (§ 587), sem o qual o es ficava em 814 px, acima da meta de 803.

### O grupo 22 (agente principal; §§ 580 a 582)

- **F13a R-c-1 (§ 580):** a 320 px, com uma foto de celular, o retângulo do resultado tinha 418 px no "para 100 KB" em pt e es (o desenho é de 356). Abaixo de 340 px a placa sai da fala, os botões fantasmas ficam numa linha e as falas das presets em pt e es ficam mais curtas: 356 px nas 12 páginas, a 320 e a 360.
- **F13a R-a-6 (§ 581):** a placa entrava 3,5 a 3,9 px no selo de 320 a 440 px; agora fica 2,1 a 2,6 px abaixo dele.
- **F13a R-c-3 (§ 582):** a 320 × 640 o Escolher ficava até 34,6 px sob o aviso; com a trilha das presets em duas linhas abaixo de 360 px, fica inteiro acima dele nas nove presets com a Figtree, e a no máximo 0,6 px no resto (o que sobra está no grupo 23, F13b m-1).

## A evidência de cada critério

| Critério | Evidência |
| --- | --- |
| 1. A base comum | "Window area" numa linha a 360 no WebKit com a reserva: `tests/e2e/calc-labels.spec.ts`, "the BTU rail and the Paint labels take one line …", com a Figtree e com a reserva, nos dois navegadores. O `layout-shift.spec.ts` verde de 320 a 412, e desde a revisão ele julga as 22 combinações que pioravam (§ 597). O `--danger-on-deep` nos dois temas e o `contrast.test.ts` e o `theme-pair.test.ts` verdes. A linha d'água: `tests/e2e/sea-line.spec.ts` e o "waterline" do `money-card.spec.ts`, nos dois temas, a 360 e a 1280, com a altura igual (só pseudo-elementos). A contagem: `tests/unit/tool-count.test.ts` (46, 29 e 35; o H1 da home, o cartão da Sobre, a Sobre e os Termos no `dist/`; o Menu com 14). |
| 2. As calculadoras | A tabela abaixo. Sem `fo-consent`, a 360 × 740, o número termina em 592 px na hipoteca (en e es) e no SAC × PRICE, sem interseção com o aviso (604 px); o Baixar termina em 660 px depois do Aceitar. A altura do card no exemplo, na 1ª tecla, no resultado e no erro, e com qualquer valor de verdade: `money-card.spec.ts`, "the card keeps its height …" (§ 545 e § 595). O CLS da 1ª tecla e do erro: 0 e 0 (`money-card.spec.ts`, Chromium). O erro no card, o último resultado e o ACE-11 com o pagamento do Credit card payoff: `money-card.spec.ts`. O cronograma antes dos chips e o 1º anúncio depois deles: `money-card.spec.ts` e `fo-ad-map.spec.ts`. "Download CSV", "Baixar CSV" e "Descargar CSV", o `th[scope=row]`, os rótulos, a Ovulation, a E-2 e o R2-03: `money-card.spec.ts` e `calc-labels.spec.ts`. O QR: `qr-code.spec.ts` (f-9 e f-10). A F7 obs 1: `calc-form.spec.ts`. A Oli: `money-card.spec.ts` e `fo-ad-map.spec.ts` (154 px com a caixa inflada). O p95 dos 16 ms: até 2 ms nos dois navegadores. A distância dos chips ao Baixar cresce em 61 das 65 páginas, porque o Baixar subiu para o card: o critério não se cumpre e não pode, e a § 556 e a pendência F13b c-2 registram, para o Victor. |
| 3. O guia | `tests/e2e/guide-page.spec.ts` (67 testes por navegador, nos 30 guias e nos dois navegadores): a dobra, a assinatura, o CLS do uso até 0,001 (com o controle que desliga a ilha da F13a acima de 0,05), o 1º chip, a tabela, o link e a pista. `tests/unit/guide-page.test.ts`: os números da ficha batem com o `data/guides-measured.json`. `tests/unit/conteudo.test.ts`: o `gate:conteudo` reprova a ordem antiga. |
| 4. A home | `tests/unit/home-numbers.test.ts` (o H1 e cada número com a fonte, no `dist/`) e `tool-count.test.ts`. 3 caixas por largura no build de teste e o `gate:prontidao` verde: `fo-ad-map.spec.ts` e `prontidao.test.ts`. O `<main>` com 1.208 px a 1280, e a altura dele a 360 na tabela. A Oli: 128 px, `aria-hidden`, 170 px do anúncio mais perto com a caixa inflada, 32 px da borda da coluna, nada `running` depois de 5 s (`home-sea.spec.ts`). JS e requisições iguais e CLS de carga 0. O H1 é o LCP a partir de 768 px (`home-sea.spec.ts`); no celular, a linha do topo continua sendo o LCP, como no ponto de partida (§ 574; pendência F13b h-1, para o Victor). |
| 5. Os hubs | `home-sea.spec.ts` e `design.spec.ts`, nas quatro views de hub, a 360 e a 1280. O 1º cartão do hub de imagem em en a 360: 546 → 726 px. O `gate:prontidao` conta os mesmos cartões. |
| 6. As institucionais e o rodapé | `tests/e2e/institutional.spec.ts` (26 por navegador), `tests/e2e/footer-phone.spec.ts` (13 por navegador), `tests/unit/institutional-pages.test.ts` e `tests/unit/footer-phone.test.ts`. O rodapé a 360: 880, 760 e 760 px (as metas eram 1.059, 786 e 803). |
| 7. O grupo 22 | `tests/e2e/tool-320.spec.ts` (R-c-1 e R-a-6) e o describe "first visit at 320 × 640: the Choose button of the presets" do `cookie-notice.spec.ts` (R-c-3), com as medidas acima e os §§ 580 a 582. |
| 8. Os anúncios | O `fo-ad-map.spec.ts`, o `ads.spec.ts` (com o `clearance.spec.ts`, § 592) e o `ads-coffee.spec.ts` passam nos dois navegadores no build de teste, com os alvos novos (o card, o bloco, o eco, a ficha, a moldura, as faixas, os chips e o mar). A densidade máxima é 18,4 % (calc-dinheiro), e as páginas livres continuam sem caixa. A tabela por molde está abaixo. |
| 9. A acessibilidade | O axe com zero violação nos dois temas e nos dois navegadores: `axe-calc-states.spec.ts` (o exemplo, o erro, o cronograma aberto e o bloco aberto; o QR sem e com código), `guide-page.spec.ts`, `a11y.spec.ts` (a home, os hubs, a 404, a Sobre e a Privacidade com o índice), `footer-phone.spec.ts` (o rodapé a 360 com um `details` aberto e fechado). Os 48 px: `money-card.spec.ts`, `institutional.spec.ts` e `footer-phone.spec.ts`, com as exceções da especificação. Os pares novos de tokens com o contraste no `docs/design/`. |
| 10. Nada que sai muda | O `money-calc.spec.ts`, o `calc-oracle.test.ts`, o `image-matrix.spec.ts` e o `pdf-matrix.spec.ts` passam com o mesmo esperado no `verificar --partes`. O `git diff --stat bd844ca -- fixtures/ scripts/oracle/ scripts/guides/ data/ src/sw/` sai vazio. |
| 11. O orçamento | A lista dos nomes de `dist/_astro/` sem o hash é a mesma (66). O JS inicial da hipoteca vai de 55,9 para 59,4 KB com gzip (limite de 80). O `CalcIsland` cresceu 3.535 B com gzip, e a § 600 diz por quê. As 183 páginas do `budgets.spec.ts` e do `i18n-budgets.spec.ts` têm os mesmos arquivos JS e as mesmas requisições do ponto de partida. |
| 12. O CLS e o Lighthouse | O `layout-shift.spec.ts` verde de 320 a 412 px, nos dois builds, e julgando as 22 combinações que a revisão achou (§ 597); a varredura das 208 páginas não acha nenhuma pior que o ponto de partida. O Lighthouse (celular): desempenho de 99 a 100 e CLS 0,000 nas 11 URLs do `lighthouserc.json`. |
| 13. Os textos | O `lint:texto` com 0 erro de gramática (4.509 textos em 68 arquivos), e o `english-leak.test.ts`, o `glossary.test.ts`, o `text-punctuation.test.ts` e o `health-voice.test.ts` verdes no Vitest. |
| 14. A documentação | O `docs/design/` (o README do design system e os README de 19 componentes, com o antes e o depois), o `docs/claude/` (uma seção "F13b" em oito arquivos de tema), o `docs/PENDENCIAS.md` (as 24 linhas fechadas, o grupo 23 com 14 linhas, o Resumo e o Total) e os §§ 535 a 601. O `pendencias.test.ts` passa. |
| 15. Os testes | O Vitest foi de 1.963 para 2.069 testes, e o `--list` do Playwright, de 1.903 para 2.200 por navegador. Os testes antigos que mudaram estão nas §§ 541, 546, 566, 576, 590 e 599. Cada teste novo de comportamento reprovou contra o ponto de partida, e a seção "Os testes" diz como. |
| 16. O `pnpm verificar` | O `pnpm verificar --partes` passa nas 21 partes, com a soma de 3.374,1 s e a maior parte com 406,2 s; a tabela e o registro das três tentativas estão abaixo. No CI, a projeção da maior parte é de cerca de 625 s (§ 592). |
| 17. A revisão | O `docs/relatorios/REVISAO-F13b.md` não tem achado crítico, alto nem médio aberto. |
| 18. O CI | A 1ª execução completa reprovou numa parte do Chromium (o número do card a 320 px no Linux; § 601) e em duas do WebKit, por um espelho lento do `apt`; a seção "A execução completa do CI" conta a correção. O resultado e o custo da 2ª execução vão no corpo da PR. |

## As tabelas

### As calculadoras, antes e depois (360 × 740, Chromium)

Medido com a mesma sonda (`.cache/f13b/measure.mjs`) no `dist` do ponto de partida e no do fim da run.

| Página | Fim do número, aviso aberto | Interseção com o aviso | Fim do Baixar PDF, depois do Aceitar | Do Baixar ao 1º chip | Card a 360 | Card a 1280 |
| --- | --- | --- | --- | --- | --- | --- |
| `/mortgage-calculator/` | 636 → 592 | 32 → 0 | 930 → 660 | 462 → 566 | 332 → 418 | 364 → 428 |
| `/es/calculadora-de-hipoteca/` | 678 → 592 | 52 → 0 | 998 → 660 | 462 → 676 | 358 → 434 | 390 → 454 |
| `/pt/simulador-sac-price/` | 678 → 592 | 52 → 0 | 972 → 660 | 1.060 → 1.029 | 332 → 493 | 364 → 517 |
| `/credit-card-payoff-calculator/` | 692 → 626 | 52 → 22 | 960 → 694 | 88 → 383 | 306 → 382 | 312 → 418 |
| `/debt-consolidation-calculator/` | 596 → 530 | 0 → 0 | 916 → 598 | 1.920 → 2.007 | 358 → 418 | 364 → 428 |
| `/paint-calculator/` | 636 → 592 | 32 → 0 | 816 → 660 | 744 → 1.176 | 218 → 298 | 246 → 330 |
| `/btu-calculator/` | 708 → 620 | 52 → 16 | 888 → 688 | 116 → 707 | 218 → 308 | 246 → 314 |
| `/bmi-calculator/` | 708 → 668 | 52 → 52 | 888 → 736 | 88 → 680 | 218 → 282 | 246 → 314 |
| `/ovulation-calculator/` | 568 → 496 | 0 → 0 | 800 → 564 | 88 → 776 | 270 → 334 | 298 → 366 |
| `/guides/15-vs-30-year-mortgage/` | 1.334 → 1.330 | 0 → 0 | 1.576 → 1.398 | 652 → 693 | 280 → 366 | 312 → 402 |

Páginas com card: 65 no depois (65 nas duas medidas).
- Fim do número com o aviso aberto: 568–1.616 → 496–1.640; pior que antes em 2 (/es/guias/punto-de-equilibrio-del-refinanciamiento/, /es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/).
- Número sob o aviso: 51 páginas → 31.
- Fim do Baixar depois do Aceitar: 774–1.770 → 564–1.708; mais baixo que antes em 0; acima de 740 px em 55 de 65 (/es/guias/bola-de-nieve-o-avalancha/, /es/guias/hipoteca-a-15-o-30-anos/, /es/guias/pagos-adicionales-a-la-hipoteca/, /es/guias/punto-de-equilibrio-del-refinanciamiento/, /es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/, /guides/15-vs-30-year-mortgage/, /guides/debt-snowball-vs-avalanche/, /guides/extra-mortgage-payments/, /guides/refinance-break-even/, /guides/rent-vs-buy-break-even/).
- Do Baixar ao 1º chip: 88–2.036 → 311–2.157; cresceu em 61 de 65 (o Baixar subiu para o card, § 556).
- Card a 360: 192–384 → 282–493; a 1280: 194–416 → 288–517.
- `<main>` da home a 360: / 10.168 → 5.682; /pt/ 7.802 → 4.942; /es/ 7.878 → 4.848.
- Rodapé a 360: / 2.118 → 880; /pt/ 1.572 → 760; /es/ 1.606 → 760.

O critério da distância dos chips ao Baixar ("não cresce") não se cumpre: o Baixar subiu para o card, acima dos campos que vêm depois do resultado, e a própria especificação mede 434 → 504 px no protótipo (§ 556; pendência F13b c-2, para o Victor). Nos dois guias de dinheiro em es da lista acima, o número desce 24 px (ele fica a 1.382 e 1.640 px, longe da dobra), porque o card cresceu, e o Baixar sobe 62 e 254 px.

### O guia, a home, os hubs, as institucionais e o rodapé

| Medida | Antes | Depois |
| --- | --- | --- |
| Topo do painel do guia a 360 × 740 (30 guias) | 1.084–1.374 px | 642–718 px (até 728 no WebKit com as faces de reserva) |
| Fim do Escolher do guia a 1280 × 800 | 865–989 px | 709–767 px |
| Assinatura do guia a 360 | 80–120 px | 20 px |
| `<main>` da home a 360 (en · pt · es) | 10.168 · 7.802 · 7.878 px | 5.682 · 4.942 · 4.848 px |
| Palavras do `<main>` da home (en · pt · es) | 920 · 723 · 751 | 565 · 512 · 524 |
| 1º cartão do hub de imagem em en a 360 | 546 px | 726 px |
| Rodapé a 360 (en · pt · es) | 2.118 · 1.572 · 1.606 px | 880 · 760 · 760 px |
| Links do rodapé a partir de 768 px (en · pt · es) | 46 · 32 · 33 | os mesmos, na mesma ordem e na mesma altura |
| `<main>` das seis páginas sem anúncio a 1280 | 760 px e a coluna vazia | 1.208 px, com a peça de 300 px na coluna da direita |

### O mapa de anúncios por molde (build de teste)

A densidade conservadora a 360 × 740 (as caixas da coluna e 100 px de âncora, sobre o `<main>`, com a ferramenta em repouso), a menor distância de um anúncio a cada grupo de alvos (a 360 e a 1280 px, com a Oli inflada em 12 px; os grupos novos da F13b são `cartao`, `ficha`, `tabela`, `faixas`, `chips` e `mar`) e a menor distância do aviso aberto ao 1º anúncio nas sete janelas. Build de teste, Chromium, no fim da run (`tests/e2e/fo-ad-map.spec.ts`, 53 testes verdes; a tabela sai de `.cache/f13a/admap-table.mjs`):

| Molde | Páginas | Densidade a 360 × 740 (máx. · mediana) | Menor distância (px) aos alvos | Aviso aberto, menor distância (px) nas sete janelas |
| --- | ---: | --- | --- | --- |
| home | 3 | 14,9 % · 14,9 % | menus 159, oli 170, cafe 318, grade 208, faixas 150, chips 192, mar 150 | 360×740: 670; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| tool-image | 33 | 17,5 % · 15,9 % | campos 150, menus 159, painel 150, oli 154, cafe 318, grade 166 | 360×740: 613; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| hub-arquivos | 6 | 13,6 % · 11,7 % | menus 159, oli 162, cafe 318, grade 150, mar 150 | 360×740: 1466; 1280×800: 500; 1440×900: 400; 1920×950: 350; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| hub-dinheiro | 3 | 13,7 % · 12,3 % | menus 159, oli 162, cafe 318, grade 150, mar 150 | 360×740: 1276; 1280×800: 412; 1440×900: 312; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| calc-dinheiro | 44 | 18,4 % · 15,6 % | baixar 265, campos 397, menus 159, painel 150, oli 156, cafe 318, cronograma 150, cartao 150, grade 166 | 360×740: 513; 1280×800: 310; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| guide-dinheiro | 10 | 14,3 % · 12,8 % | baixar 265, campos 545, menus 159, painel 150, oli 156, cafe 318, cronograma 418, cartao 150, grade 166 | 360×740: 1965; 1280×800: 1193; 1440×900: 1093; 1920×950: 1043; 1920×1080: 913; 768×1024: 969; 1024×1366: 627 |
| tool-pdf | 36 | 16,4 % · 14,7 % | menus 159, painel 150, oli 154, cafe 318, grade 166, campos 150 | 360×740: 585; 1280×800: 334; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| guides-hub | 3 | 14,2 % · 14,0 % | menus 159, cafe 318, grade 150 | 360×740: 1690; 1280×800: 715; 1440×900: 615; 1920×950: 565; 1920×1080: 435; 768×1024: 513; 1024×1366: 310 |
| guide-arquivos | 30 | 16,4 % · 15,0 % | campos 151, menus 159, painel 150, oli 154, cafe 318, grade 166, ficha 150, tabela 462 | 360×740: 1390; 1280×800: 808; 1440×900: 708; 1920×950: 658; 1920×1080: 528; 768×1024: 584; 1024×1366: 310 |
| hub-casa-saude | 2 | 15,3 % · 15,2 % | menus 159, oli 162, cafe 318, grade 150, mar 150 | 360×740: 1034; 1280×800: 344; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| calc-casa-saude | 11 | 17,6 % · 15,8 % | baixar 266, campos 504, menus 159, painel 150, oli 156, cafe 318, cronograma 150, cartao 150, grade 166 | 360×740: 697; 1280×800: 379; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |
| tool-qr | 3 | 14,8 % · 13,9 % | campos 481, menus 159, painel 150, oli 156, cafe 318, grade 166 | 360×740: 1029; 1280×800: 402; 1440×900: 310; 1920×950: 310; 1920×1080: 310; 768×1024: 310; 1024×1366: 310 |

184 páginas; densidade máxima 18,4 %; menor distância do aviso em qualquer janela: 310 px

No WebKit, as mesmas 184 páginas passam no `fo-ad-map.spec.ts`, no `ads.spec.ts`, no `clearance.spec.ts` e no `ads-coffee.spec.ts` (as partes do `verificar`). As páginas livres (404, Sobre, Contato, Privacidade, Termos, Licenças, Apoie, offline e "Abrir com") continuam sem caixa, também na coluna da direita nova a 1280.

### O orçamento, por página

O `budgets.spec.ts` e o `i18n-budgets.spec.ts` medem 183 páginas no build padrão: as 183 têm os mesmos arquivos JS e as mesmas requisições do ponto de partida. O JS inicial máximo é 59,4 KB com gzip no build padrão e 61,2 KB no de teste (o limite é 80 KB). Algumas páginas:

| Página | Antes (build padrão) | Depois (build padrão) | Depois (build de teste) |
| --- | --- | --- | --- |
| /compress-image/ | 26,3 KB · 2 JS · 6 req. | 26,3 KB · 2 JS · 6 req. | 28,0 KB · 2 JS · 6 req. |
| /image-tools/ | 5,0 KB · 0 JS · 4 req. | 5,0 KB · 0 JS · 4 req. | 6,8 KB · 0 JS · 4 req. |
| /mortgage-calculator/ | 55,9 KB · 2 JS · 6 req. | 59,4 KB · 2 JS · 6 req. | 61,1 KB · 2 JS · 6 req. |
| /pt/simulador-sac-price/ | 56,0 KB · 2 JS · 6 req. | 59,4 KB · 2 JS · 6 req. | 61,1 KB · 2 JS · 6 req. |
| /guides/heic-to-jpg-on-windows/ | 26,2 KB · 2 JS · 6 req. | 26,2 KB · 2 JS · 6 req. | 27,9 KB · 2 JS · 6 req. |
| /qr-code-generator/ | 36,3 KB · 2 JS · 6 req. | 36,3 KB · 2 JS · 6 req. | 38,0 KB · 2 JS · 6 req. |

A tabela das 183 páginas está em `.cache/f13b/budget-full.md`.

### O tamanho de cada ilha, com gzip

| Arquivo | Antes | Depois | Diferença |
| --- | ---: | ---: | ---: |
| `CalcIsland…_lang.js` | 30.744 B | 34.279 B | +3.535 B (§ 600) |
| `QrTool…_lang.js` | 10.778 B | 10.797 B | +19 B |
| `island.js` (a ilha de imagem) | 21.211 B | 21.211 B | 0 |
| `PdfIsland…_lang.js` | 19.867 B | 19.867 B | 0 |

Medido no build final (`node .cache/f13b/js-list.mjs dist`, gzip nível 9). A frente C trouxe +2.275 B; as correções da revisão, +1.262 B.

### O Lighthouse (celular), no `pnpm verificar --partes`

| URL | Desempenho | CLS | LCP |
| --- | ---: | ---: | --- |
| `/compress-image/` | 99 | 0,000 | 1,88 s (a ajuda do campo da faixa) |
| `/image-tools/` | 100 | 0,000 | 1,66 s (a linha do hub) |
| `/mortgage-calculator/` | 99 | 0,000 | 2,10 s (a frase do card) |
| `/guides/15-vs-30-year-mortgage/` | 99 | 0,000 | 2,10 s |
| `/compress-pdf/` | 99 | 0,000 | 1,88 s (o aviso de cookies) |
| `/pdf-tools/` | 100 | 0,000 | 1,65 s |
| `/guides/why-is-my-pdf-so-large/` | 99 | 0,000 | 1,88 s (o lead) |
| `/pt/simulador-sac-price/` | 99 | 0,000 | 2,10 s (a frase do card) |
| `/pt/apoie/` | 100 | 0,000 | 1,66 s |
| `/qr-code-generator/` | 99 | 0,000 | 1,80 s (o aviso de cookies) |
| `/guides/` | 100 | 0,000 | 1,80 s |

Acessibilidade, boas práticas e SEO: 100 nas onze. A home e os hubs de dinheiro, casa e saúde não estão no `lighthouserc.json` (pendência F13b h-2).

## Os testes

| | Ponto de partida (`bd844ca`) | Fim da run |
| --- | --- | --- |
| Vitest | 120 arquivos, 1.963 testes | 130 arquivos, 2.069 testes |
| `playwright test --list`, por navegador | 1.903 testes em 61 arquivos | 2.200 testes (5 × 440 no Chromium; 2.200 nas 13 partes do WebKit) |

Os dois números só cresceram.

**Os testes novos e como cada um reprovou contra o ponto de partida** (cada frente provou contra o `dist/` do ponto de partida, servido pelo `serve-base.ts`; as correções da revisão, contra o `dist/` do `6091422`):

- **Fatia 1 e grupo 22:** `tests/unit/tool-count.test.ts` (o teste do `dist/` reprova no ponto de partida: a Sobre e os Termos diziam 18, e o H1 da home não tinha a contagem), `tests/unit/dates-short.test.ts` (funções novas), `tests/e2e/sea-line.spec.ts` (a crista do rodapé reprova), `tests/e2e/tool-320.spec.ts` (28 de 54 reprovam: 418 px, e 3,5 a 3,9 px no selo) e o describe novo do `cookie-notice.spec.ts` (reprova: até 34,6 px sob o aviso).
- **Frente C:** `money-card.spec.ts`, `calc-labels.spec.ts` (todos menos a E-2 da Savings goal, que já passava e fica como guarda), `axe-calc-states.spec.ts` (8 de 8), os casos novos do `calc-form.spec.ts` e do `qr-code.spec.ts`; `tests/unit/dates-table.test.ts` e `calc-sprite.test.ts`.
- **Frente G:** `tests/unit/guide-page.test.ts` (os 18 do `dist/` reprovam) e `tests/e2e/guide-page.spec.ts` (44 de 67 reprovam; os 20 de uso que passam já eram cobertos pela ilha da F13a, e o controle que a desliga prova a medida).
- **Frente H:** `tests/unit/home-numbers.test.ts` (os 4 do `dist/` reprovam) e `tests/e2e/home-sea.spec.ts` (11 de 14 reprovam; os 3 que passam são guardas), mais os casos novos do `design.spec.ts` (32 reprovam) e do `hub-icons.test.ts`.
- **Frente I:** `tests/unit/institutional-pages.test.ts` (31 de 33 reprovam), `tests/unit/footer-phone.test.ts` (3 de 3), `tests/e2e/institutional.spec.ts` (26 de 26), `tests/e2e/footer-phone.spec.ts` (7 reprovam; os 6 de 768 e 1280 passam, o que prova que a lista esperada é a do ponto de partida).
- **Revisão:** os 11 testes novos do `money-card.spec.ts` reprovam 11 de 11 nos dois navegadores contra o `6091422`; os do `layout-shift.spec.ts`, do `qr-code.spec.ts` e os 4 unitários (`ad-map`, `calc-howto`, `guide-page`, `home-numbers`) também; o teste da s-2 reprova contra o `dist/` de antes dela.

**Os testes antigos que mudaram** estão, cada um no formato da § 341, nas §§ 541 (fatia 1), 546 (frente C), 566 (frente G), 576 (frente H), 590 (frente I) e 599 (as correções da revisão). Nenhum teste saiu, nenhum foi pulado (os dois `test.skip` de CLS no WebKit são os da API que o WebKit não tem, § 512) e nenhum limite afrouxou.

## O `pnpm verificar --partes`

Na máquina local (Windows), sobre o commit `9d8d75e` (o código final; depois dele só entram este relatório e o `docs/claude/ci.md`), com o build uma vez e cada parte com o limite de 900 s:

| Parte | Total | Testes |
| --- | ---: | --- |
| build | 35,5 s |  |
| portoes | 204,9 s | tipos, lint, Vitest (130 arquivos, 2.069 testes), os portões e o lint:texto |
| lighthouse | 395,2 s | 11 URLs, 3 execuções cada |
| chromium 1/5 | 179,8 s | 440 |
| chromium 2/5 | 272,1 s | 440 |
| chromium 3/5 | 210,1 s | 440 |
| chromium 4/5 | 198,7 s | 440 |
| chromium 5/5 | 159,5 s | 440 |
| webkit 1/13 | 69,1 s | 170 |
| webkit 2/13 | 134,5 s | 172 |
| webkit 3/13 | 127,3 s | 168 |
| webkit 4/13 | 406,2 s | 169 |
| webkit 5/13 | 32,1 s | 169 |
| webkit 6/13 | 179,3 s | 170 |
| webkit 7/13 | 119,8 s | 168 e 1 pulado |
| webkit 8/13 | 78,8 s | 168 |
| webkit 9/13 | 83,0 s | 169 |
| webkit 10/13 | 191,4 s | 167 e 2 pulados |
| webkit 11/13 | 111,9 s | 169 |
| webkit 12/13 | 80,3 s | 165 e 4 pulados |
| webkit 13/13 | 104,6 s | 169 |

Soma: 3.374,1 s, todas as partes verdes; a maior foi a webkit 4/13, com 406,2 s. Os 7 testes pulados no WebKit são os `test.skip` de CLS, que dependem de uma API que o WebKit não tem (§ 512).

A execução não foi de uma vez só, e o registro fica aqui:

1. **A primeira tentativa** parou na parte 3 em 0,1 s. Um commit das imagens do relatório no meio da execução mudou o `HEAD`, e o `--dist-pronto` reprovou ("o dist/ é de outro commit"). A pegadinha foi para o `docs/claude/ci.md`.
2. **A segunda tentativa** passou nas partes 1 a 11 e travou na parte 12 (webkit 4/13), no teste 170 de 169. A máquina dormiu durante a noite, e o log ficou parado de 20h52 às 9h22.
3. **Os processos travados** foram encerrados. As partes 12 a 21 rodaram uma a uma com `pnpm verificar --playwright=webkit --shard=K/13 --dist-pronto`, sobre o mesmo `dist/` do `9d8d75e`, com a máquina mantida acordada. Todas passaram.

O CI tem 5 partes do Chromium e 13 do WebKit, e as 21 partes acima são as dele (`scripts/lib/ci-parts.ts` as lê do `.github/workflows/ci.yml`). A projeção do tempo de cada parte no CI, com os tempos por teste da última execução completa, está na § 592: a maior é a chromium 1/5, com cerca de 625 s, e o critério pede no máximo 700 s.

## O custo

A última execução do CI antes deste relatório (a leve, do push de `6091422`; `pnpm ci:custo 42081714640`): classe leve, 5 minutos cobrados, 3,7 min de parede, 3 jobs (o `verificar (leve)` com 148 s, o `classificar` e o `ci-ok`). As execuções leves dos pushes anteriores da run (`a77cc09`, `44813da`, `aed6def`) também passaram. O custo da execução completa, a do `gh pr ready`, vai no corpo da PR, porque ela roda depois deste commit.

## A execução completa do CI: a falha e a correção

A 1ª execução completa, depois do `gh pr ready` sobre o `bf975f9` (`42221259414`), reprovou em três partes:

- **A "chromium 4 de 5"** reprovou num teste. No `money-card.spec.ts`, "the card keeps its height with other values…" (§ 595), a hipoteca a 320 px com a taxa 5,6 levava o card de 418 para 450 px no Linux. No Windows o teste passava: o número "$2,222.24/mo" ficava com 0,5 px de sobra, e no Linux a Fredoka desenha um pouco mais larga, então o "/mo" foi para uma linha própria. A correção (§ 601): abaixo de 768 px, o número guarda 3 px da borda na conta do CSS. Um teste novo reprova sem ela também no Windows, e o `money-card.spec.ts`, o `money-calc.spec.ts`, o `calc-form`, o `calc-labels`, o `money-es`, o `money-health`, o `money-home` e o `layout-shift` passam nos dois navegadores (404 testes).
- **A "webkit 6 de 13" e a "webkit 7 de 13"** caíram no passo "Wait for the browser", na instalação dos pacotes pelo `apt` de um espelho lento do Ubuntu, antes de qualquer teste. Não houve o que corrigir no código.

A PR voltou a rascunho (`gh pr ready --undo`), a correção subiu, a execução leve dela passou, e o `gh pr ready` rodou de novo. O resultado da 2ª execução completa e o custo dela estão no corpo da PR.

## A conferência no Linux

O rótulo `ci` não existe no repositório (só o Victor cria rótulos), então a conferência no Linux do meio da run saiu (§ 542): a execução completa depois do `gh pr ready` fez esse papel.

## A revisão

O `docs/relatorios/REVISAO-F13b.md` tem o método, os 31 achados com o veredito dos céticos e o destino de cada um, a segunda passada e o que cada lente conferiu. Em resumo: seis lentes Sonnet sobre o `6091422`, 6 médios (a altura do card com outros valores, a descrição do segundo campo errado, o CLS de carga em 22 combinações, a parte 1 do Chromium acima de 700 s projetados, a frase da faixa de dinheiro da home e a mensagem dos campos depois do card no celular), 17 baixos e 8 refutados; as correções de um agente Opus (§§ 591 a 599), a segunda passada de um revisor Sonnet sobre o diff delas (as 21 correções confirmadas e três achados novos, corrigidos pelo agente principal na § 600). Nenhum achado médio ou acima ficou aberto; os baixos b-1 e b-3 foram para o grupo 23.

## As imagens

Em `docs/relatorios/fase-13b/`, 50 imagens em JPEG (qualidade 80, escala 1, de 29 a 139 KB cada, 2,9 MB no total), com o exemplo de cada calculadora e os números medidos dos guias e da home (nenhum arquivo de pessoa, nenhuma coordenada). O "antes" saiu do `dist/` do ponto de partida (`.cache/f13b/dist-base`), o "depois" do `dist/` do fim da run (`node .cache/f13b/shots.ts`):

- o aviso aberto na hipoteca em en e no SAC × PRICE em pt a 360: `cookie-mortgage-en-360-*`, `cookie-sac-price-pt-360-*`;
- a hipoteca a 360 e a 1280, no erro e no escuro, e o cronograma: `calc-mortgage-en-360-*`, `calc-mortgage-en-1280-*`, `calc-mortgage-error-en-360-*`, `calc-mortgage-dark-en-360-*`, `calc-schedule-en-360-*`;
- a Paint e o QR sem código a 360: `calc-paint-en-360-*`, `qr-empty-en-360-*`;
- o guia do HEIC a 360, a 1280 e na tabela: `guide-heic-en-360-*`, `guide-heic-en-1280-*`, `guide-heic-table-en-360-*`;
- a home em en a 360 e a 1280, em pt e no escuro: `home-en-360-*`, `home-en-1280-*`, `home-pt-360-*`, `home-en-360-dark-*`;
- os hubs: `hub-image-en-360-*`, `hub-money-en-1280-dark-*`;
- a 404, a Sobre e a Privacidade: `404-en-360-*`, `404-en-1280-*`, `about-en-360-*`, `about-en-1280-*`, `privacy-en-1280-*`;
- o rodapé a 360: `footer-en-360-*` (a tela) e `footer-en-360-full-*` (o rodapé inteiro).

## As decisões novas

Os §§ 535 a 601 do `DECISOES.md`:

- § 535: A especificação dos seis protótipos é contrato, com o que vence e o que fica de fora
- § 536: A divisão, a ordem e as pendências da F13b
- § 537: A fonte de reserva nos pesos 600 e 700
- § 538: O token `--danger-on-deep`
- § 539: A linha d'água: a faixa da F13a no `.fo-result`, a `.fo-sea-top` dos cartões `deep` e a crista do rodapé
- § 540: Uma contagem só, sem os presets
- § 541: Os testes antigos que mudaram na fatia 1, e a data dos Termos
- § 542: Sem o rótulo `ci`, a conferência no Linux do meio da run sai
- § 543: A data curta e a data média, escritas à mão
- § 544: O topo da página de calculadora: a assinatura numa linha e o número acima do aviso
- § 545: O ResultHero é o lugar do resultado, do Baixar PDF e do erro
- § 546: Os testes antigos que mudaram com o card
- § 547: O bloco que dobra: os custos da hipoteca e a TR do SAC × PRICE
- § 548: O cronograma na ilha, com o nome fixo, e as tabelas com o cabeçalho de linha
- § 549: SAC × PRICE: a PRICE no card, as duas barras na mesma escala e os cenários lado a lado até 320 px
- § 550: Os rótulos e as tabelas estreitas das calculadoras
- § 551: O QR code: nenhum Baixar desligado e o tamanho do PNG na 2ª linha
- § 552: O foco das listas pela chave estável da linha
- § 553: O sprite das calculadoras leva as poses do card
- § 554: Os anúncios em volta do card, do bloco e do eco
- § 555: As provas de acessibilidade dos estados novos e a ordem do Tab
- § 556: O que a ficha pedia e não cabia, e o que a run deixou de fora
- § 557: A assinatura de uma linha e o histórico
- § 558: As datas dos guias no registro e os placeholders `{published}` e `{measured}`
- § 559: As tabelas das medidas: sem a coluna igual, agrupadas, e a região com o nome do título
- § 560: A ficha "What we measured" e os dois números de cada guia
- § 561: A ferramenta antes da prosa, o parágrafo dela embaixo da ilha e o CLS do uso
- § 562: O link da ferramenta numa frase do texto
- § 563: A pista de rolagem em CSS
- § 564: A dobra medida no site, e o que mudou para caber
- § 565: O `gate:conteudo` na ordem nova e os alvos novos dos anúncios
- § 566: Os testes antigos que mudaram na frente G
- § 567: A home como o mar por categoria: a marcação, os ids e os textos
- § 568: Os números das faixas e as fontes
- § 569: O número de imagem no lugar do "2.6 MB → 717 KB", e as frases da especificação reescritas com os campos reais
- § 570: Os chips da faixa de dinheiro: os 6 da especificação em en e es, os 8 do Brasil em pt
- § 571: O texto a mais da home: uma frase por faixa, e a conta do portão por largura
- § 572: A propriedade `wide` do `BaseLayout`: sem a lateral de anúncio, o `<main>` na largura da página
- § 573: Os anúncios `geral` da home e os alvos novos dos 150 px
- § 574: O H1 como LCP: a partir de 768 px, sim; no celular, a linha continua sendo o LCP, como no ponto de partida
- § 575: O mar nos hubs de categoria
- § 576: Os testes antigos que mudaram
- § 577: O movimento da Oli e da água fora da ferramenta
- § 578: A fonte Steady no topo e nas faixas da home
- § 579: Os specs novos e as partes do CI
- § 580: A 320 px, o resultado de uma foto de celular cabe no retângulo
- § 581: A placa do resultado não toca mais o selo da página
- § 582: A 320 × 640, a trilha das presets em duas linhas e o Escolher fora do aviso
- § 583: A coluna da direita a 1280 nas páginas sem anúncio: a `wide` do BaseLayout e a view `.fo-view--side`
- § 584: A 404: a faixa do mar, a busca sem sombra, os três chips e o link da home
- § 585: O índice "On this page" e os ids dos H2, e o `gate:links` que confere os `#`
- § 586: O cartão "FileOrca in numbers" e a Oli `wave` da Sobre; o número de idiomas em algarismo
- § 587: O rodapé no celular: o hub à vista e as ferramentas num `<details>`
- § 588: O movimento da 404 e da Sobre
- § 589: Os testes novos e as partes do CI
- § 590: Os testes antigos que mudaram
- § 591: As frases a mais da home dizem só o que cada calculadora faz
- § 592: O fim do `ads.spec.ts` vai para o `clearance.spec.ts`, numa parte mais leve do CI
- § 593: Com dois campos errados, cada um é descrito pela própria faixa
- § 594: No celular, a mensagem de um campo depois do card aparece embaixo dele enquanto ele tem o foco
- § 595: O card guarda a altura com qualquer valor de verdade
- § 596: A trava do build não deixa marca de anúncio nas faixas da home
- § 597: O texto das calculadoras e o topo delas e dos guias na face da primeira pintura
- § 598: Os achados baixos da revisão que se corrigem barato
- § 599: Os testes antigos que mudaram nas correções da revisão
- § 600: A ilha das calculadoras cresce 3.535 B com gzip, e as duas sobras da segunda passada da revisão
- § 601: O número do card guarda 3 px da borda abaixo de 768 px: a 1ª execução completa do CI

## A válvula de estouro

Nada que a ficha manda nunca cortar foi cortado. Ficaram de fora, com o § e uma linha no grupo 23:

- a caixa reservada `.g-after` do guia (o parágrafo da ferramenta vai embaixo da ilha da F13a; § 561, F13b g-2);
- o H1 da home como LCP no celular (a regra de tipografia do `h1-mobile` decide; § 574, F13b h-1);
- a home e os hubs de dinheiro, casa e saúde no `lighthouserc.json` (§ 574, F13b h-2);
- o `pnpm screenshots`, que procura a Placa e o 1º `.fo-export .fo-btn` nas calculadoras (a ficha deixa o comando fora da run; § 556, F13b c-1).

## A prévia

https://fase-13b-fileorca.vmatusita.workers.dev (o Workers Builds da branch; cada push gera também uma prévia pelo hash, no comentário do bot na PR).

## O que fica para depois

O grupo 23 do `docs/PENDENCIAS.md` ("O que a F13b deixou", 14 linhas): o `pnpm screenshots` (c-1), a distância dos chips ao Baixar (c-2), o que sobra da altura do card (c-3), o molde do PLANO (c-4), o CLS do juntar com o painel no topo da tela (g-1), a caixa `.g-after` (g-2), a pista no WebKit (g-3), o H1 como LCP no celular (h-1), o `lighthouserc.json` (h-2), as regras do `.fo-hero` sem uso (h-3), a dobra da 404 em pt e es (i-1), o 0,6 px do Escolher a 320 × 640 (m-1), e os baixos b-1 e b-3 da revisão.

## A lista do que é do Victor

1. **Revisar e mesclar:** a PR mescla sozinha quando o CI fica verde (o resultado da execução completa está no corpo da PR). Depois, olhar a prévia e o site nas páginas novas (uma calculadora, um guia de arquivo, a home, um hub, a 404, a Sobre e o rodapé no celular).
2. **Decidir** (grupo 23, "Victor decide"): aceitar a distância dos chips ao Baixar (c-2); a caixa `.g-after` do guia (g-2); o H1 da home como LCP no celular, que pede mudar a regra do `h1-mobile` (h-1); a dobra da 404 em pt e es (i-1). E conferir a decisão da frente I de pôr o bloco Guias do rodapé num `details` (§ 587), que a meta de altura em es pediu.
3. **Fazer** (grupo 23, "Victor faz"): atualizar o molde da calculadora do `PLANO-FILEORCA.md` (itens 5 a 7 da página) e a § 117, que ainda põem o PDF numa barra embaixo do card (c-4; a ficha mudou isso, § 545).
4. **Se quiser a conferência no Linux no meio das próximas runs:** criar o rótulo `ci` (Issues → Labels), como a § 542 lembra.
5. **Uma run de ajuste** para o `pnpm screenshots` (c-1) e para o `lighthouserc.json` com a home e os hubs novos (h-2).
