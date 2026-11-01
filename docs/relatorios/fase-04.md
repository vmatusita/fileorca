# F4 · Relatório (dinheiro em inglês)

Run `fase-04`, de 31/out a 1/nov/2026. Ficha: `docs/prompts/prompt-fase-04.md`. Plano: `docs/relatorios/fase-04-plano.md`. Revisão adversarial: `docs/relatorios/REVISAO-F4.md`.

## Resumo

- Entram, só em inglês: **14 calculadoras e 4 presets** (as 18 linhas `entra` de dinheiro do `data/keywords.csv`), o hub `/money-calculators/` e **5 guias**. A válvula não cortou nada: não há 4b.
- Os motores ficam em `src/calc/`, sem dependência, e batem no centavo com um oráculo independente (numpy-financial 1.1.0 + laço em `decimal` + exemplos oficiais) em **3.039 casos**, gravados em `fixtures/calc/` antes do primeiro arquivo do motor.
- Cada calculadora recalcula a cada tecla (p95 de até 2 ms no Chromium), mostra o resultado, o gráfico, os dois cenários onde compara e o cronograma recolhido por ano. Ela exporta PDF e CSV e guarda o cenário num link depois do `#`. Nenhum número digitado sai do aparelho, e o teste de privacidade prova isso nas 18 páginas e nos dois navegadores.
- 20 rascunhos de contato com blogs de finanças em `docs/lancamento/blogs-financas.md`. Nada foi enviado.
- Decisões novas: DECISOES § 110 a § 142.

## As páginas

JS inicial e requisições medidos pelo `budgets.spec.ts` no Chromium (gzip, JS próprio com o inline, primeira carga). Toda página de dinheiro carrega 2 arquivos JS: a entrada das calculadoras e o chunk `island`. A medida é a do `verificar` final, depois das correções da revisão (eram 37,5 KB antes delas).

| URL | O que responde | Casos do oráculo | JS inicial | Requisições |
| --- | --- | --- | --- | --- |
| `/mortgage-calculator/` | What your monthly payment will be, with taxes, insurance and fees. | 296 | 38,0 KB | 6 |
| `/personal-loan-calculator/` | What a personal loan costs a month, and its APR once the fee is counted. | 223 | 38,0 KB | 6 |
| `/auto-loan-calculator/` | What a car loan costs a month, and what the car costs in all. | 199 | 38,0 KB | 6 |
| `/refinance-calculator/` | Whether a new loan pays off, and in which month it breaks even. | 247 | 38,0 KB | 6 |
| `/home-affordability-calculator/` | How much house fits your income, and which limit sets the price. | 212 | 38,0 KB | 6 |
| `/loan-amortization-calculator/` | The whole schedule of a loan, payment by payment. | 153 | 38,0 KB | 6 |
| `/credit-card-payoff-calculator/` | How long a card takes to pay off, or the payment for a target date. | 209 | 38,0 KB | 6 |
| `/debt-payoff-calculator/` | Snowball or avalanche: when each plan makes you debt-free. | 81 | 38,0 KB | 6 |
| `/debt-consolidation-calculator/` | Your debts as they are against one new loan: payment, interest and time. | 71 | 38,0 KB | 6 |
| `/rent-vs-buy-calculator/` | Your net worth renting and buying, and the year buying catches up. | 136 | 38,0 KB | 6 |
| `/compound-interest-calculator/` | How a balance grows with monthly deposits and compounding. | 345 | 38,0 KB | 6 |
| `/savings-goal-calculator/` | The monthly deposit for a goal, or how long a deposit takes. | 190 | 38,0 KB | 6 |
| `/simple-interest-calculator/` | Interest on a principal for years, months or days, without compounding. | 146 | 38,0 KB | 6 |
| `/apr-to-apy-calculator/` | What a rate earns once compounding is counted, and back. | 184 | 38,0 KB | 6 |
| `/mortgage-calculator/extra-payments/` | The interest saved and the time cut when you pay a little more. | 82 | 38,0 KB | 6 |
| `/mortgage-calculator/biweekly/` | What paying half the payment every two weeks saves against paying monthly. | 78 | 38,0 KB | 6 |
| `/mortgage-calculator/15-vs-30-year/` | What the shorter term costs a month, and what it saves in interest. | 84 | 38,0 KB | 6 |
| `/loan-amortization-calculator/balloon-payment/` | The monthly payment of a balloon loan, and what is left to pay at the end. | 103 | 38,0 KB | 6 |
| `/money-calculators/` | O hub: as 18, os presets, os guias e como as contas funcionam | (sem conta própria) | 3,6 KB | 4 |
| `/guides/15-vs-30-year-mortgage/` | O custo dos dois prazos, com a tabela medida em várias taxas | os casos `guide-*` do 15 vs 30 | 38,0 KB | 6 |
| `/guides/debt-snowball-vs-avalanche/` | Snowball ou avalanche, com o exemplo resolvido | `guide-snowball-avalanche` | 38,0 KB | 6 |
| `/guides/extra-mortgage-payments/` | Quanto um pagamento extra encurta o empréstimo | `guide-extra-payments` | 38,0 KB | 6 |
| `/guides/refinance-break-even/` | Em que mês um refinanciamento se paga | `guide-refinance-break-even` e `guide-refinance-rolled` | 38,0 KB | 6 |
| `/guides/rent-vs-buy-break-even/` | Em que ano comprar alcança alugar | `guide-rent-vs-buy` | 38,0 KB | 6 |

As páginas de imagem seguem com exatamente 2 arquivos JS. Elas subiram de 0,3 a 0,4 KB gzip, porque o chunk `island` é compartilhado e ganhou os ids e os eventos das calculadoras (§ 136, com a medida de antes e depois). Pares de navegação: de imagem para calculadora, 2 requisições novas; de calculadora para calculadora, 1; do hub para uma calculadora, 3; da home para o hub, 1.

## O oráculo

**A ordem** (`git log --topo-order --format='%h %ad %s' --date=iso -- fixtures/calc src/calc`, do mais novo ao mais velho):

```
5924a33 2026-11-01 02:35:40 -0300 test(oracle): savings goal cases on both sides of 10^15 cents
eba71cb 2026-11-01 01:56:08 -0300 perf(calc): start the integer root near the answer; APY into APR takes one root
a5b1a50 2026-11-01 01:54:58 -0300 fix(calc): savings goal past 10^15 cents is too large, and its PDF summary is filled in
8544ebe 2026-11-01 01:53:48 -0300 test(oracle): a savings goal whose balance passes 10^15 cents is "too-large"
22b7c28 2026-10-31 23:42:22 -0300 feat(calc): parse and format numbers in three languages; keep src/calc free of imports
4397124 2026-10-31 23:34:36 -0300 feat(calc): add the money engines in src/calc, matching the oracle to the cent
305c0da 2026-10-31 23:34:36 -0300 fix(oracle): compute the closed-form payment over whole numbers
d1c0243 2026-10-31 23:29:19 -0300 test(calc): add the independent oracle and its fixtures for the 18 money calculators
```

As fixtures entram em `d1c0243`. O primeiro arquivo de `src/calc/` (`money.ts`) entra em `4397124`. O `305c0da` corrige o oráculo antes do motor: o meio centavo de um empréstimo de 1 mês (§ 126). Na revisão, a mudança de convenção da Savings goal (`too-large` acima de 10^15 centavos) entrou no oráculo em `8544ebe`, antes do motor em `a5b1a50`, e os casos da fronteira em `5924a33`.

**Como rodar:** `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py` (o `--check` compara sem gravar). O cabeçalho de cada arquivo traz o SHA-256 do script e as versões (Python 3.13.18, numpy 2.5.4, numpy-financial 1.1.0).

**Casos por calculadora (3.039):** mortgage 296, personal 223, auto 199, refinance 247, affordability 212, amortization 153, compound 345, card 209, debt payoff 81, rent vs buy 136, extra payments 82, biweekly 78, 15 vs 30 84, balloon 103, savings goal 190, consolidation 71, simple 146, APR to APY 184. Cada calculadora tem a grade, de 60 a 100 casos aleatórios com semente `2026-10-31/<id>`, o exemplo da página (`page-example`) e, quando houver, o do guia e os oficiais.

**Os exemplos oficiais** estão em `fixtures/calc/OFICIAIS.md`, com a URL e a data de leitura (31/out/2026):

- Reproduzidos no centavo: o H-24(B) do CFPB ($761.78), o exemplo do design system ($1,896.20 e $382,636.71), os dois carros da página do CFPB ($597 e $320), os dois exemplos do Apêndice J da Regulation Z (APR de 12.83% e de 9.69%), as três faixas do Apêndice A da Regulation DD (5.39%, 5.65% e 5.92%) e o `pmt`, o `ipmt` e o `nper` da documentação do numpy-financial.
- Deixados de fora, com o motivo: os juros de $3,024 do carro em 72 meses (a página multiplica a parcela por 72, sem a última parcela que zera o saldo), o total do `ipmt` e o `fv` sem arredondamento, o ano 1 do exemplo de juros compostos do CFPB ($1,049.99 por mês contra $1,050 por ano), o APR e o TIP do H-24 (custos de fechamento), o empate de 27 meses do Federal Reserve (depois do imposto) e os casos irregulares dos Apêndices J e A.

**O teste** (`tests/unit/calc-oracle.test.ts`) confere os 3.039 casos no centavo, o SHA-256 do script e a versão do numpy-financial, numa execução de 21 testes (um por calculadora, mais os do cabeçalho), que passam.

**O mutante que reprova.** Copiei as 18 fixtures para uma pasta temporária e troquei a parcela do caso `design-system` da Mortgage de 189620 para 189621 centavos. A saída de `CALC_FIXTURES_DIR=<cópia> pnpm exec vitest run tests/unit/calc-oracle.test.ts`, cortada nos números do cronograma:

```
     × matches the oracle to the cent in all 296 cases 18ms
 FAIL  tests/unit/calc-oracle.test.ts > mortgage-calculator > matches the oracle to the cent in all 296 cases
AssertionError: 1 of 296 cases differ: expected [ Array(1) ] to deeply equal []
+   "design-system (design-system): got {\"down\":7500000,\"loan\":30000000,\"payment\":189620,… expected {\"down\":7500000,\"loan\":30000000,\"payment\":189621,…
      Tests  1 failed | 20 passed (21)
```

Com as fixtures de verdade, o mesmo comando dá `Tests  21 passed (21)`.

## A privacidade dos números

`tests/e2e/money-privacy.spec.ts` roda nas 18 páginas e nos dois navegadores: 38 testes passaram no `verificar` final (18 páginas mais o teste do próprio buscador, em cada navegador). Desde a revisão, o teste tenta a sentinela seguinte, mais curta, quando a primeira transforma o resultado num problema (com o PDF e o CSV desligados), e volta o campo ao valor dele se nenhuma der resultado. Todas as sentinelas digitadas entram na busca. Em cada página ele:

1. digita uma sentinela longa e única em todo campo de número que está na tela, inclusive cada linha das listas de dívidas: 987654.32 (ou a maior que a faixa aceita) para dinheiro, 13.5791 para taxa e 287 para contagem;
2. abre o cronograma, baixa o CSV e o PDF, copia o link, clica num chip e abre o link copiado numa carga nova;
3. procura cada sentinela, em toda forma que ela pode tomar ("987654.32", "987,654.32", "98765432", "987654", "13.5791", "0.135791", "135791") e sem dígito colado antes ou depois, em:
   - toda requisição de qualquer origem, com o método, a URL e o corpo;
   - o `dataLayer` (e o `page_location` sem `#`), o `document.title` e o `location.search`;
   - o `localStorage`, o `sessionStorage` e os cookies;
   - os nomes dos arquivos baixados (`mortgage-schedule.csv`, `mortgage-schedule.pdf`).

Nenhuma sentinela aparece. O único lugar com os números é o link copiado, depois do `#`, e o teste confere que ele traz a primeira sentinela de dinheiro em centavos.

O `money-calc.spec.ts` prova o resto da decisão 6: a página lê o `#` uma vez, ignora o valor fora da faixa e o link de outra versão, e nunca chama `pushState` nem `replaceState`.

## Os 16 ms por tecla

`tests/e2e/money-speed.spec.ts`: 30 teclas por calculadora, nas três da ficha e, desde a revisão (COR-1), na APY para APR com capitalização diária (Backspace no último dígito e um dígito novo, alternados, para cada tecla mudar o resultado), medidas dentro da página num `page.evaluate` só, do `input` ao `MutationObserver` ver o ResultHero mudar. Nenhuma linha de mês existe no DOM antes de o cronograma abrir. Saída do `verificar` final local:

| Calculadora | Chromium p50 | Chromium p95 | WebKit p50 | WebKit p95 |
| --- | --- | --- | --- | --- |
| Rent vs buy | 0,60 ms | 1,90 ms | 1,00 ms | 2,00 ms |
| Debt payoff com 10 dívidas | 0,60 ms | 0,90 ms | 1,00 ms | 1,00 ms |
| Mortgage com pagamento extra | 0,60 ms | 1,40 ms | 1,00 ms | 2,00 ms |
| APY para APR, capitalização diária | 1,10 ms | 1,60 ms | 2,00 ms | 4,00 ms |

Antes da revisão, a APY para APR custava 22,6 ms de p50 e 26,7 ms de p95 por tecla no Chromium (medida da lente de corretude), acima do limite. O `iroot` passou a começar de uma estimativa de ponto flutuante, com as mesmas raízes (§ 139).

O limite de 16 ms vale no Chromium, como a ficha pede. O relógio do WebKit anda de 1 em 1 ms, então ele é medido e impresso (§ 135).

## Lighthouse

`pnpm lhci` no celular, mediana de 3 execuções, no `verificar` final local:

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/compress-image/` | 100 | 100 | 100 | 100 | 1,67 s | 0,001 |
| `/image-tools/` | 100 | 100 | 100 | 100 | 1,35 s | 0,000 |
| `/mortgage-calculator/` | 99 | 100 | 100 | 100 | 1,82 s (a frase do ResultHero) | 0,000 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 100 | 100 | 100 | 1,91 s (o primeiro parágrafo) | 0,000 |

## Screenshots

`pnpm screenshots` grava em `docs/relatorios/fase-04/componentes/` (120 PNG, nos dois temas, refeitos sobre o build final, depois das correções da revisão):

- os componentes da calculadora: `number-fields-*`, `number-fields-error-*`, `result-hero-*`, `export-bar-copied-*`, `amort-table-*` (cronograma aberto) e `scenario-compare-*`;
- as páginas inteiras a 360 e 1280 px: `money-mortgage-calculator-*`, `money-money-calculators-*` (o hub), `money-15-vs-30-year-mortgage-*` (um guia) e `money-debt-payoff-calculator-*` (a lista de dívidas depois do resultado);
- os componentes de imagem das fases anteriores, regerados sobre o build da F4.

A pasta da F3 (`docs/relatorios/fase-03/componentes/`) ficou como estava.

## A revisão adversarial

O detalhe está em `docs/relatorios/REVISAO-F4.md`. Foram seis lentes Sonnet em contexto limpo sobre o commit `ebfd6c1`, numa worktree só de leitura, com 24 céticos (30 agentes no total).

| Lente | Achados | Crítico/alto/médio (depois do cético) | Corrigidos | Refutados |
| --- | --- | --- | --- | --- |
| (a) Corretude financeira | 17 | 5 médios | 6 | 1 |
| (b) Privacidade dos números | 5 | 0 | 2 | 1 |
| (c) Anúncio, política e YMYL | 5 | 3 médios | 5 | 0 |
| (d) Acessibilidade | 13 | 7 médios | 8 | 0 |
| (e) Desempenho e SEO | 3 | 0 | 2 | 0 |
| (f) Design system | 11 | 1 alto e 3 médios | 9 | 0 |

- **Nenhum crítico ficou de pé:** o único era o número quebrado da Savings goal, que o cético rebaixou a médio e que foi corrigido.
- **O alto** eram as caixas esticadas ao lado de um campo com ajuda, corrigidas com subgrid (§ 137).
- **Todos os médios foram corrigidos**, cada um com um teste que falha sem a correção.
- **Os baixos ficam pendentes:** 18 baixos, mais o ACE-11 (corrigido em parte) e o DES-11 (que virou registro). A lista está no `REVISAO-F4.md`, com o motivo de cada um. Os principais:
  - "1 years" com n = 1;
  - a parcela de $0.00 com saldo menor que o prazo em centavos, que muda o motor e pede caso no oráculo antes;
  - o campo do pagamento sem `aria-invalid` quando a parcela não cobre os juros;
  - o teste de privacidade sem os campos que só aparecem com outro modo (a sonda da lente cobriu 40 cenários e não achou vazamento).
- **A segunda passada** revisou o diff das correções (`ebfd6c1..5d3f16b`) e achou 2 médios e 5 baixos, todos corrigidos com teste em `5924a33` e `381fc3f`:
  - o PDF e o CSV ficam desligados também com um campo a corrigir;
  - o grupo de opções sai do subgrid, que deixava 12 px vazios no WebKit;
  - o cabeçalho "Balance" acompanha o saldo no celular;
  - o oráculo ganhou casos dos dois lados de 10^15 centavos;
  - e dois testes passaram a provar o que dizem.

## Decisões novas

DECISOES § 110 a § 142:

- **§ 110 a § 123:** catálogo e ids, uma ilha com dois arquivos JS, a aritmética do dinheiro, o parser, os eventos, o link do cenário, o PDF e o CSV, as faixas, o molde da página, o hub, a home, o rodapé e a busca, os guias, e os portões de dinheiro, de conteúdo, de título e do `lint:texto`.
- **§ 124:** o resultado acima da dobra no celular, com os campos principais em pares, rótulos curtos e o resto depois do resultado.
- **§ 125:** a busca em inglês conta as 34 páginas.
- **§ 126 e § 127:** o oráculo, a correção do meio centavo, os exemplos oficiais e as convenções de cada calculadora.
- **§ 128 e § 129:** o link do cenário que se perdia numa carga rápida, e a tabela larga que rola dentro da moldura.
- **§ 130 a § 133:** a linha do café fora das calculadoras, o que a ilha reaproveita das imagens, o nome "15-year vs 30-year" e o uv desta máquina.
- **§ 134 a § 136:** os blogs, o Lighthouse e os screenshots com a medida dos 16 ms, e o JS antes e depois.
- **§ 137 a § 140:** o subgrid dos campos, a espera do orçamento no lugar do `networkidle`, a revisão e as suas correções, e o ResultHero no celular.
- **§ 141:** o `ENOSPC` do WebKit do CI, que voltou duas vezes na parte 3, com a hipótese e a proposta de ajuste.
- **§ 142:** os specs de dinheiro se chamam `money-*.spec.ts`, para o `design.spec.ts` voltar à parte 2. Os testes novos o tinham empurrado para a parte 3, junto com a matriz de imagens.

## pnpm verificar local

Execução limpa em 1/nov/2026, no commit `58de070`, o último com código de produção. Depois dele entraram este relatório, as §§ 136, 141 e 142 do `DECISOES.md` e a troca de nome dos três specs de dinheiro (`calc*.spec.ts` para `money-*.spec.ts`, § 142), sem mudança no conteúdo deles. Os 55 testes renomeados rodaram de novo aqui, no Chromium: 55 de 55 verdes.

- **Ambiente:** Windows 11, Node 26.8.1 (o CI usa o 24 do `.node-version`) e pnpm 10.
- **Install:** o `pnpm install --frozen-lockfile` passou (`install exit 0`).
- **Build do zero:** o `pnpm verificar` apagou o `dist/` e buildou de novo.

A saída completa tem 1.644 linhas e fica em `.cache/f4/verificar-final.log`. Abaixo vão o resumo e as linhas de cada contagem.

```
Resumo do pnpm verificar (tudo)
  ok       7.9 s  tipos (astro check)
  ok       2.7 s  lint (eslint)
  ok      12.0 s  build (astro build do zero)
  ok       5.5 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.6 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.5 s  links internos e páginas órfãs
  ok       0.6 s  conteúdo mínimo das ferramentas e do site
  ok      25.3 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.7 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.7 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     213.0 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok     143.1 s  lighthouse ci
  ok      11.5 s  lint:texto (LanguageTool)
  total 430.7 s (limite 900 s)
verificar exit 0
```

```
cabeçalhos: ok, 6 regras, LAUNCHED = true, build.txt 58de070
worker sem código: ok, só assets em ./dist, sem main, sem run_worker_first, sem _worker.js e sem functions/
seo: ok, 59 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps
links: ok, 2216 links internos em 62 páginas, nenhuma órfã
conteúdo: ok, 13 página(s) de ferramenta e de preset, 18 de calculadora e 59 página(s) do site conferida(s)
prontidão: ok, 18 itens
design sprite da Oli: ok, 62 páginas, ids únicos, um oli-clip, poses da lista fechada e caixas [data-oli] com o próprio símbolo
licenças: ok, 15 dependências de navegador, 6 dentro de outras, 17 pacotes no bundle, 18 de build, 876 pacotes na árvore, /licenses em 3 idiomas
dinheiro e saúde: ok, 24 de 24 página(s) desses hubs conferida(s)
lint:texto: 36 arquivo(s), 2238 textos, 0 erro(s) de gramática, 243 aviso(s)
```

- **Vitest:** 55 arquivos, 862 passed (862).
- **Playwright:** 808 passed (3.5m) nos dois navegadores. Não há `retries`, `skip`, `fixme` nem `only`: o `git diff 92f2b5b..HEAD -- tests playwright.config.ts` não acrescenta nenhum.
- **`lint:texto`:** os 243 avisos são de ortografia (nomes próprios, FileOrca e Ko-fi) e de estilo, como na F3. Erro de gramática, nenhum.
- **Sem dependência nova:** o `package.json` e o `pnpm-lock.yaml` não mudaram. Nada mudou em `.github/`, `scripts/ci/`, `.githooks/`, `.claude/settings.json`, `PLANO-FILEORCA.md`, `docs/adr/` e `docs/design/`: o `git diff --stat 92f2b5b..HEAD` desses caminhos sai vazio.

## CI na PR

Execução verde do CI no commit `58de070` (o último com código ou teste antes deste relatório): run [41277648653](https://github.com/vmatusita/fileorca/actions/runs/41277648653). As cinco partes, com o total do resumo do `verificar` e a duração do job:

| Parte | Comando | Testes | Total do `verificar` | Job |
| --- | --- | --- | ---: | ---: |
| `verificar` | `pnpm verificar --sem-playwright` | os passos sem o Playwright: tipos, lint, build, Vitest, os portões, o Lighthouse das quatro URLs e o `lint:texto` | 285,4 s | 352 s |
| `playwright (chromium)` | `pnpm verificar --playwright=chromium` | 404 passed | 529,4 s | 588 s |
| `playwright (webkit 1 de 3)` | `pnpm verificar --playwright=webkit --shard=1/3` | 135 passed | 427,1 s | 490 s |
| `playwright (webkit 2 de 3)` | `pnpm verificar --playwright=webkit --shard=2/3` | 135 passed | 273,4 s | 335 s |
| `playwright (webkit 3 de 3)` | `pnpm verificar --playwright=webkit --shard=3/3` | 134 passed | 664,2 s | 745 s |

- **Limites:** todas as partes ficaram abaixo de 900 s, e o `verificar` de cada uma abaixo do alvo de 700 s.
- **A parte 3 do WebKit** é a mais pesada, a 36 s do alvo. Ela ficou com o `design.spec.ts` e os testes novos de calculadora que caem nela pela divisão por contagem. Se passar de 700 s, a ADR-003 manda dividir mais, num ajuste de `.github/` do Victor.
- **O job `merge`** respondeu "sem merge - PR em rascunho: o merge espera ela ficar pronta".
- **A run verde anterior,** 41274088572, no commit `5eee3a5`: `verificar` 283,8 s; Chromium 514,1 s; WebKit 317,9, 245,6 e 498,7 s.

Falhas no meio do caminho:

| Run | Commit | Parte | O que foi | O que mudou |
| --- | --- | --- | --- | --- |
| 41272269545 | `ebfd6c1` | WebKit 2 de 3 | O `budgets.spec.ts` do `/money-calculators/` estourou 60 s no `networkidle`, com as requisições todas respondidas (trace do artefato) | a espera própria do `budgets.spec.ts` (§ 138) |
| 41273044165 | `b3bb351` | WebKit 2 de 3 | O mesmo, nos dois hubs | o mesmo |
| 41275792910 | `5d3f16b` | WebKit 3 de 3 | `ENOSPC` em dois testes de movimento do `design.spec.ts`, com o disco caindo e voltando em segundos | nada em teste; registrado na § 141 |
| 41276724285 | `e45415e` | WebKit 3 de 3 | `ENOSPC` em dois testes de movimento reduzido da mesma spec | o mesmo |
| 41278520009 | `93a5d2d` (este relatório) | WebKit 3 de 3 | `ENOSPC` em dois testes do `image-batch.spec.ts`, com o `/` a 2.611 MB livres | os specs de dinheiro passaram a se chamar `money-*.spec.ts` e o `design.spec.ts` voltou à parte 2 (§ 142); a parte que caiu rodou de novo |

Não há `skip`, `fixme`, `only`, `retries` nem `continue-on-error` novo: o `git diff 92f2b5b..HEAD -- tests playwright.config.ts | grep -E "test.(skip|fixme|only)|retries|continue-on-error"` dá vazio.

## Prévia

- **Link:** <https://fase-04-fileorca.vmatusita.workers.dev>, do comentário do Workers Builds na PR. Ele serve o commit `58de070`: o `build.txt` da prévia traz `58de070430726f85450a7353686e5686e3a18d69`.
- **Como conferi:** com o Playwright (Chromium), bloqueando os domínios do Google com `context.route`, e com o script em `.cache/previa.ts`:
  - `/mortgage-calculator/`, `/money-calculators/`, `/guides/refinance-break-even/`, `/debt-payoff-calculator/` e `/`: 200, `x-robots-tag: noindex` (prévia) e o H1 certo em cada uma.
  - **Mortgage a 360 × 740 e a 1280 × 800:** a ilha hidrata, e o preço 420,000 muda a parcela de $2,396.20 para $2,623.75 sem botão. A 360 px, o número termina em 658 px depois da primeira tecla, com a Oli comemorando embaixo do gráfico.
  - **Nenhuma requisição** saiu para fora da prévia.
- **O que a prévia pegou:** na primeira visita (commit `ebfd6c1`), a Oli entrava acima do número na primeira tecla e o empurrava para 755 px, abaixo da dobra. A correção e o teste estão em `69eb38e` (§ 140).
- **Screenshots:** a Mortgage na prévia está em `docs/relatorios/fase-04/previa/mortgage-360.png` e `mortgage-1280.png`.

## O que a válvula cortou

Nada. As 18 páginas, o hub e os 5 guias entraram. Não há 4b.

## O que é do Victor, em passos

1. **Abrir três calculadoras no celular e no computador**, depois do merge: a Mortgage (`/mortgage-calculator/`), a Debt payoff (`/debt-payoff-calculator/`, com a lista de dívidas depois do resultado) e o preset 15-year vs 30-year. Em cada uma: mudar um número e ver o resultado mudar sem botão; abrir o cronograma; baixar o PDF e o CSV; tocar em "Copy link" e abrir o link noutra aba.
2. **Enviar os contatos de `docs/lancamento/blogs-financas.md`**, reescrevendo cada e-mail com as próprias palavras. A ordem de prioridade (A, B, C) está na tabela. Nenhum rascunho pede link; recuse quem pedir dinheiro ou troca.
3. **No Search Console**, pedir a indexação do `/money-calculators/` e do `/mortgage-calculator/` (Inspeção de URL → Solicitar indexação).
4. **As pendências que seguem abertas** da F3 (DECISOES § 103) e do `docs/F0-SAIDA.md`. A F4 não fechou nenhuma delas.
5. **Gerar o prompt da 2b e o da F5a.**
6. **Um ajuste para o `ENOSPC` do WebKit do CI** (DECISOES § 141). O disco do runner some por segundos durante o `design.spec.ts` no WebKit; foram duas vezes seguidas na parte 3 nesta PR. Proposta:
   - um `coredumpctl list` no fim das partes do WebKit, para confirmar se é core dump;
   - desligar os core dumps dos navegadores no CI;
   - amostrar o disco a cada 2 s nessa spec.

   Tudo isso mexe no `.github/` ou no diagnóstico, por isso fica com você.
7. **Decidir os achados baixos que a revisão deixou** (tabela no `docs/relatorios/REVISAO-F4.md`), para uma 4b ou para a F5:
   - "1 years" com n = 1;
   - a parcela de $0.00 com saldo menor que o prazo em centavos, que muda o motor e pede caso no oráculo antes;
   - o campo do pagamento sem `aria-invalid` quando não cobre os juros;
   - o teste de privacidade sem os campos de outro modo.

## Nota para a F6 (dinheiro adaptado em português)

O que a F6 reusa:

- **O parser e a formatação** (`src/calc/parse.ts`): já leem e escrevem "1.234,56" em português e espanhol, com testes. O `display()` de `src/tools/calc/form.ts` e o `formatScaled` aceitam o idioma.
- **O registro e a ilha** (`src/tools/calc/registry.ts`, `CalcPanel`, `defs/`): uma calculadora em português é outra entrada do registro com rotas `pt`, os textos em `src/tools/<slug>/i18n/pt.ts` e a mesma definição, se a conta for a mesma.
- **As fixtures e o oráculo**: a convenção (centavos, taxa em 1/10.000 de ponto, metade para cima) vale para o real. O oráculo ganha os casos da conta brasileira com a mesma estrutura.
- **O CSV**: o `csvText` já separa a célula do texto; em português ele precisa de ponto e vírgula como separador e vírgula decimal (o Excel brasileiro abre assim). Hoje o separador e o decimal são fixos em inglês, então isso é uma mudança em `exports.ts`, com teste.
- **O PDF**: o `report.ts` usa as fontes padrão (WinAnsi), que cobrem os acentos do português ("ç", "ã", "é"). Os textos do PDF vêm do `CalcSharedTexts`, que ganha a versão `pt`.

Onde vai esbarrar:

- **As contas não são as mesmas.** O financiamento brasileiro usa SAC e Price, com TR, seguros MIP e DFI e taxa de administração; o rotativo do cartão tem IOF. As definições da F4 são de convenção americana (PMI, HOA, APR da Regulation Z, APY da Regulation DD) e não se traduzem: são calculadoras novas, com oráculo próprio e fontes do Banco Central.
- **As fontes oficiais** do portão de dinheiro hoje são do CFPB e do Federal Reserve. A F6 precisa acrescentar `bcb.gov.br` (e o que mais usar) na lista do `scripts/lib/ymyl.ts`, com teste e §.
- **As rotas e o hreflang.** As páginas de dinheiro existem só em inglês (§ 58 e § 110). Uma calculadora brasileira não é a tradução da americana, então o hreflang não as liga: cada uma é página própria, e o `routes.test.ts` precisa saber disso.
- **O espaço no celular.** Rótulos em português são mais longos ("Taxa de juros" com a etiqueta "exemplo"). A regra da § 124, com dois campos por linha e o rótulo numa linha, vai pedir rótulos curtos ou uma linha a mais, conferidos pelo `ads.spec.ts` a 360 × 740.
- **O `lint:texto`** preenche os placeholders de dinheiro com amostras em inglês (`MONEY_SAMPLES`). Os textos em português precisam de amostras em reais ("R$ 1.234,56").
