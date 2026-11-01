# F4 · Plano da run (dinheiro em inglês)

Plano autossuficiente da run `fase-04`, escrito depois da exploração (seis leitores Sonnet) e antes das páginas. É o gabarito da revisão adversarial. A ficha é `docs/prompts/prompt-fase-04.md`; onde este plano e a ficha divergirem, vale a ficha.

## 1. O que entra

- 14 calculadoras e 4 presets (as 18 linhas `entra` de dinheiro do `data/keywords.csv`), o hub `/money-calculators/` e 5 guias em `/guides/<slug>/`, só em inglês, todos com `adArea: 'dinheiro'`.
- Ordem de construção (decisão 1 da ficha): Mortgage, Personal loan, Auto loan, Refinance, Home affordability (nunca se cortam); Loan amortization, Compound interest, Credit card payoff, Debt payoff, Rent vs buy, os 4 presets, Savings goal; por último Debt consolidation, Simple interest e APR to APY (a válvula pode cortar, nessa ordem inversa).
- Ids de rota: o slug com `/` trocado por `-` (`mortgage-calculator-extra-payments`); guias `guides-<slug>`; hub `money-calculators`.

| Id | URL | Grupo no hub |
| --- | --- | --- |
| `mortgage-calculator` | `/mortgage-calculator/` | crédito |
| `personal-loan-calculator` | `/personal-loan-calculator/` | crédito |
| `auto-loan-calculator` | `/auto-loan-calculator/` | crédito |
| `refinance-calculator` | `/refinance-calculator/` | crédito |
| `home-affordability-calculator` | `/home-affordability-calculator/` | crédito |
| `loan-amortization-calculator` | `/loan-amortization-calculator/` | crédito |
| `credit-card-payoff-calculator` | `/credit-card-payoff-calculator/` | crédito |
| `debt-payoff-calculator` | `/debt-payoff-calculator/` | crédito |
| `debt-consolidation-calculator` | `/debt-consolidation-calculator/` | crédito |
| `rent-vs-buy-calculator` | `/rent-vs-buy-calculator/` | crédito |
| `compound-interest-calculator` | `/compound-interest-calculator/` | educativa |
| `savings-goal-calculator` | `/savings-goal-calculator/` | educativa |
| `simple-interest-calculator` | `/simple-interest-calculator/` | educativa |
| `apr-to-apy-calculator` | `/apr-to-apy-calculator/` | educativa |
| `mortgage-calculator-extra-payments` | `/mortgage-calculator/extra-payments/` | preset da Mortgage |
| `mortgage-calculator-biweekly` | `/mortgage-calculator/biweekly/` | preset da Mortgage |
| `mortgage-calculator-15-vs-30-year` | `/mortgage-calculator/15-vs-30-year/` | preset da Mortgage |
| `loan-amortization-calculator-balloon-payment` | `/loan-amortization-calculator/balloon-payment/` | preset da Loan amortization |
| `guides-15-vs-30-year-mortgage` | `/guides/15-vs-30-year-mortgage/` | guia (preset 15 vs 30) |
| `guides-debt-snowball-vs-avalanche` | `/guides/debt-snowball-vs-avalanche/` | guia (Debt payoff) |
| `guides-extra-mortgage-payments` | `/guides/extra-mortgage-payments/` | guia (preset de pagamento extra) |
| `guides-refinance-break-even` | `/guides/refinance-break-even/` | guia (Refinance) |
| `guides-rent-vs-buy-break-even` | `/guides/rent-vs-buy-break-even/` | guia (Rent vs buy) |

## 2. O oráculo (feito, commit `d1c0243`)

- `scripts/oracle/calc.py`, rodado com `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py` (`--check` compara sem gravar). Não importa nada do repositório; o SHA-256 do script (fim de linha LF) vai no cabeçalho de cada `fixtures/calc/<id>.json`.
- Convenção: dinheiro em centavos inteiros; taxa em 1/10.000 de ponto percentual (6.5% = 65000); juros de cada período = saldo × taxa ÷ períodos por ano, arredondado ao centavo, metade para cima; parcela pela fórmula fechada, arredondada igual; a última parcela zera o saldo (no último período ou assim que a parcela cobre saldo e juros); máximos (affordability) arredondados para baixo; taxa mensal de outra capitalização = (1 + r/n)^(n/12) − 1 cortada em 30 casas; laço acima de 1.200 meses = erro `too-long`; saldo acima de 10^15 centavos = `too-large`.
- Conferências pelo numpy-financial dentro do limite que o arredondamento permite (`pmt`, `ipmt`, `ppmt`, `fv`, `pv`, `nper`, `irr`).
- 3.034 casos: grade, 60 a 100 aleatórios com semente `2026-10-31/<id>`, o exemplo de cada página (`page-example`), o exemplo principal de cada guia (`guide:<slug>`) e os exemplos externos de `fixtures/calc/OFICIAIS.md` (H-24 do CFPB, Regulation DD Apêndice A, Regulation Z Apêndice J, documentação do numpy-financial), cada um conferido contra o número publicado.
- Cronograma inteiro só nos casos `full` (uns 25); nos outros, parcela, juros, contagem, última parcela e saldos de fim de ano. Total de 1,6 MB.
- Casos por calculadora: mortgage 296, personal 223, auto 199, refinance 247, affordability 212, amortization 153, compound 345, card 209, debt payoff 81, rent vs buy 136, extra 82, biweekly 78, 15 vs 30 84, balloon 103, savings 185, consolidation 71, simple 146, APR/APY 184.

### Convenções que cada calculadora fixa (vão para o DECISOES)

- Mortgage: imposto e seguro anuais ÷ 12, metade para cima; PMI e HOA mensais, sem término automático; entrada em $ ou em % do preço.
- Personal loan: a tarifa sai do valor recebido; APR atuarial (Apêndice J) sobre as parcelas reais, em centésimos de ponto, metade para cima; sem tarifa, sem APR.
- Auto: financiado = preço + impostos e taxas − entrada − troca, nunca abaixo de zero; custo total = preço + impostos e taxas + juros.
- Refinance: empate = primeiro mês em que custos de fechamento + juros pagos no novo ≤ juros que o atual teria cobrado até ali (vale para custo pago à vista ou somado ao empréstimo); o atalho custos ÷ economia mensal também aparece.
- Home affordability: tetos de 28% e 36% (campos, regra de bolso) sobre a renda bruta mensal, para baixo; o que sobra depois de imposto, seguro e HOA vira a parcela de principal e juros; o empréstimo máximo é o valor presente, para baixo.
- Compound: taxa mensal efetiva da capitalização escolhida; aporte no começo ou no fim do mês.
- Credit card: juros do mês = APR ÷ 12 sobre o saldo, nenhuma compra nova; pagamento que não cobre os juros do primeiro mês dá o mínimo (juros + 1 centavo).
- Debt payoff: orçamento constante (soma dos mínimos + extra); snowball pelo menor saldo inicial, avalanche pelo maior APR, empate pela ordem digitada; o mínimo de uma dívida quitada fica no orçamento.
- Rent vs buy: o caminho mais barato investe a diferença do mês; o inquilino começa com a entrada investida; rendimento mensal = taxa ÷ 12; valor do imóvel, manutenção e aluguel mudam uma vez por ano; imposto, seguro e HOA fixos; sem imposto de renda, dedução ou ganho de capital.
- Extra payments: extra mensal em todo mês, anual a cada 12ª parcela, único no mês N.
- Biweekly: 26 meias parcelas por ano (meia parcela = parcela ÷ 2, metade para cima), juros de cada quinzena = taxa ÷ 26 sobre o saldo; meses = meias parcelas × 12 ÷ 26, para cima.
- Balloon: parcela pelo prazo de amortização; balão = saldo depois da parcela regular do mês do balão.
- Savings goal: depósito no fim do mês; o depósito é o menor valor em centavos que chega à meta no prazo.
- Debt consolidation: cada dívida atual paga com a própria parcela fixa; tarifa somada ao empréstimo novo.
- Simple interest: ano de 365 dias; tempo inteiro em anos, meses ou dias.
- APR to APY: (1 + r/n)^n − 1 e o inverso; resultado em duas casas, metade para cima (Regulation DD § 1030.3(f)(1)).

## 3. O motor (`src/calc/`, feito, commit `4397124`)

- `money.ts`: `RATE_SCALE`, `ONE`, `MAX_MONTHS`, `MAX_CENTS`, `divRound/divFloor/divCeil` (BigInt), `interest`, `perMonth`, `share`, `annuityPayment` (fração exata), `presentValue`, `amortize/schedule`, `summarize`, `yearEnd`, `cumulativeInterest`, `iroot`, `monthlyRate30`, `root30`.
- `loans.ts`, `savings.ts`, `debts.ts`, `rent-vs-buy.ts`: uma função por calculadora, entrada e saída iguais às do oráculo (mais o cronograma).
- `index.ts`: `ENGINES` por id de página, `CALC_IDS`, `EngineInput`, `EngineResult`.
- `parse.ts` e `format.ts` (a fazer): parser de número dos três idiomas ("1,234.56", "1.234,56", "1 234,56") para inteiros escalados sem ponto flutuante; formatação manual (sem `Intl`, para o HTML do servidor e o do navegador serem iguais).
- Regra do ESLint: `src/calc` entra na regra `engine-self-contained`, numa variante que também recusa pacote (nada de fora da pasta); teste em `tests/unit/quality.test.ts`.
- Teste: `tests/unit/calc-oracle.test.ts` (3.034 casos no centavo, SHA-256 do script, versão do numpy-financial). Mutante: uma cópia de `fixtures/calc/` com um centavo mudado em `CALC_FIXTURES_DIR` reprova.

## 4. A ilha e o orçamento

Forma escolhida (a "A" da exploração): **uma entrada de JS para todas as páginas de calculadora e guias**.

- `src/tools/calc/CalcIsland.astro` é o único componente com `<script>import './mount.ts';</script>`. O `mount.ts` hidrata duas raízes com um estado compartilhado: `#fo-tool-root` (campos, resultado, ExportBar, cenários e chips) e `#fo-calc-schedule` (o cronograma), para o primeiro AdSlot ficar entre os chips e o cronograma, como o molde do plano manda.
- A entrada traz a ilha, os seis componentes, as 18 definições e `src/calc/` inteiro (a conta é síncrona a cada tecla). O que já está no grupo `island` (Preact, ícones, `format.ts`, `analytics/`, a Oli) fica lá. Os ícones chegam como miolo de SVG pelas props, nunca por `?raw`, para o chunk `island` das páginas de imagem não mudar.
- Sob demanda: o PDF (o worker de PDF que já existe ganha `report`, e o `pdf-client.ts` ganha `buildReport`), só no clique.
- Projeção: 2 arquivos JS (entrada + `island`); JS inicial ≈ 17 KB (`island`) + 15 a 25 KB (entrada) + 3 KB inline ≈ 35 a 45 KB gzip (orçamento 80); 6/7 requisições na primeira página (orçamento 8); imagem → calculadora = 2 novas, calculadora → calculadora = 1 (orçamento 3). As páginas de calculadora e os guias entram numa lista própria `CALC_PAGES` do `budgets.spec.ts`, com exatamente 2 arquivos; o hub de dinheiro não tem ilha (0 arquivos de ilha, até 2). O `TOOL_PAGES` das imagens não muda.
- O `astro.config.ts` não muda: a regra das 2 peças se mantém por construção (nenhum código novo em `src/tools/image/`, nenhum import de valor de código de calculadora em módulos do grupo `island`). Um teste do Vitest lê o `dist/` e prova que cada página de calculadora carrega só a entrada e o `island`.

### Definição de calculadora (`src/tools/calc/defs/<id>.ts`)

```ts
interface CalcDef<S, I, R> {
  id: CalcPageId;
  fields: FieldSpec[];          // money | rate | int | choice | select | list (dívidas)
  initial: S;                   // em unidades do motor; toInput(initial) é o page-example do oráculo
  toInput(state: S): I;
  compute(input: I): R;         // ENGINES[id]
  view(result: R, state: S, t, lang): CalcView;   // ResultHero, SplitChart, cenários, cronograma, CSV, PDF
}
```

- Cada campo tem chave curta (a do link do cenário), faixa fixa (seção 5) e, se for taxa, a etiqueta "example". O texto (rótulo, ajuda, erro com a faixa) vem do arquivo de texto da página, pelas props.
- O registro `src/tools/calc/registry.ts` é só dado serializável (ids, ícone, grupo, chips, relacionadas, presets, guia): lido por páginas, hub, home, rodapé, busca, portões e testes. Os ids que o GA4 aceita vêm de `src/analytics/tool-ids.ts` (literal no grupo `island`), com teste que os iguala aos dois registros.

## 5. Faixas dos campos (fixas; a fala do erro diz a faixa)

| Campo | Faixa |
| --- | --- |
| Preço do imóvel | $10,000 a $20,000,000 |
| Entrada | $0 até o preço, ou 0 a 100% |
| Prazo (anos) | 1 a 40 (Loan amortization 1 a 50) |
| Juros de empréstimo | 0 a 40% |
| APR de cartão e de dívida | 0 a 60% |
| Imposto do imóvel por ano | $0 a $1,000,000 |
| Seguro por ano | $0 a $100,000 |
| PMI e HOA por mês | $0 a $10,000 |
| Personal loan: valor; meses; tarifa | $100 a $1,000,000; 1 a 120; 0 a 20% |
| Auto: preço; entrada e troca; impostos e taxas; meses | $500 a $2,000,000; $0 a $2,000,000; $0 a $500,000; 1 a 120 |
| Refinance: saldo; meses restantes; custos | $1,000 a $20,000,000; 1 a 480; $0 a $1,000,000 |
| Affordability: renda anual; dívidas por mês; entrada; tetos | $1,000 a $100,000,000; $0 a $1,000,000; $0 a $100,000,000; 1 a 100% |
| Loan amortization e Balloon: valor; mês do balão | $100 a $100,000,000; 1 até o prazo em meses − 1 |
| Compound: inicial; aporte; anos | $0 a $10,000,000; $0 a $1,000,000; 1 a 80 |
| Credit card: saldo; pagamento; meses | $1 a $1,000,000; $1 a $1,000,000; 1 a 600 |
| Debt payoff e consolidation: dívidas; saldo; mínimo ou parcela; extra | 1 a 10; $1 a $1,000,000; $0 a $100,000 (parcela $1 a $100,000); $0 a $1,000,000 |
| Rent vs buy: manutenção; valorização; custo de venda; aluguel; reajuste; rendimento; anos | 0 a 10%; −10 a 20%; 0 a 20%; $1 a $1,000,000; 0 a 20%; 0 a 20%; 1 a 40 |
| Extra payments: mensal; anual; único; mês do único | $0 a $1,000,000; $0 a $10,000,000; $0 a $100,000,000; 1 até o prazo em meses |
| Savings goal: meta; guardado; meses; depósito | $1 a $100,000,000; $0 a $100,000,000; 1 a 1,200; $0 a $1,000,000 |
| Consolidation: meses do novo; tarifa | 1 a 120; 0 a 20% |
| Simple interest: principal; taxa; tempo | $0.01 a $100,000,000; 0 a 100%; 0 a 100 anos, 0 a 1,200 meses ou 0 a 36,500 dias |
| APR to APY: taxa | 0 a 100% |

## 6. O molde das páginas

Calculadora (`src/tools/calc/CalcTool.astro`, sem o sufixo `Page` para não entrar no glob do `ads-pages.test.ts`):

1. Breadcrumb (Home › Money calculators › [mãe ›] nome).
2. H1 com o nome, uma linha do que responde e "Reviewed by Victor Yuki Matusita on <data>" (o bloco `data-ymyl="reviewed"` com `<time>` e "First published").
3. A ilha: campos principais, resultado (ResultHero com SplitChart, Oli `cheer` com a Placa só no primeiro resultado da carga), ExportBar (PDF amarelo, CSV, Copy link), os campos opcionais, ScenarioCompare onde a conta compara, os chips. Lado a lado no computador; no celular o resultado logo depois dos campos principais, acima da dobra a 360 × 740.
4. AdSlot de conteúdo (150 px de margem).
5. O cronograma recolhido por ano (`#fo-calc-schedule`), montado só ao abrir, com o primeiro ano aberto.
6. "How to use" (3 passos ou mais), "How it works" com fórmula (`formula`), premissas (`premises`), exemplo resolvido pelo motor (`example`), fonte oficial (`source`) e aviso (`disclaimer`), FAQ (4 ou mais), nota de privacidade ("Your numbers stay on your device"), relacionadas (até 6), AdSlot do trilho.
- Presets: três blocos próprios (o "how", a explicação da convenção e o FAQ) que não existem na mãe nem nos irmãos.
- Schema: `WebApplication` com `applicationCategory: 'FinanceApplication'` e sem nota, `BreadcrumbList`, `Person`.
- Título: "<Nome em Title Case> … | FileOrca"; o `titleProblem` passa a comparar sem caixa nas páginas de dinheiro (H1 em sentence case).

Hub (`src/views/MoneyCalculatorsView.astro`): `fo-hubband fo-cat--money` (sobretítulo, H1, uma linha), a grade (crédito primeiro), AdSlot de conteúdo, tabela dos presets, lista dos guias, "How these calculators work" com os blocos `data-ymyl`, AdSlot do trilho. Schema `CollectionPage`, `BreadcrumbList`, `Person`.

Guia (`src/views/GuideView.astro`, texto em `src/i18n/en/guide-<slug>.ts`): breadcrumb Home › Money calculators › título; H1, autor e datas; introdução; a calculadora embutida (mesma `CalcIsland`, preenchida por propriedade da página, nunca pela URL; o link copiado aponta para a página da calculadora); o texto (800 a 1.500 palavras), a tabela medida pelo motor no build (com a data), fórmula, premissas, exemplo, fonte e aviso; AdSlot só depois da calculadora. Schema `Article` (autor `Person`, `datePublished`, `dateModified`) e `BreadcrumbList`.

Home em inglês: seção de dinheiro com as cinco de crédito e o link do hub, sem anúncio. Rodapé em inglês: coluna Money com o hub e as cinco de crédito. Busca: as 18 e os 5 guias, categoria "Money calculators".

## 7. Link do cenário, PDF e CSV

- `#v=1&<chave>=<valor>…`: valores em unidades do motor (inteiros); a página lê o `#` uma vez, depois da hidratação; cada valor passa pela faixa do campo; inválido é ignorado. A página nunca escreve na URL. O botão monta o texto, copia com `navigator.clipboard.writeText` e vira "Link copied" por 2 s num `role="status"`; sem área de transferência, mostra o link num campo só de leitura.
- CSV: na ilha, BOM UTF-8, vírgula, ponto decimal, aspas RFC 4180, cabeçalho e as mesmas linhas da tabela. Nome fixo (`mortgage-schedule.csv`).
- PDF: `buildReport` no worker de PDF existente (`src/engine/pdf/report.ts`, autocontido, fontes padrão, só WinAnsi): nome, entradas, resultado, premissas, cronograma inteiro, aviso e fileorca.com. Falha de carga = fala "recarregue a página".
- Nenhum número em `localStorage`, `sessionStorage`, cookie, IndexedDB, título, nome de arquivo, `dataLayer`, evento ou requisição. A marca da Oli é `sessionStorage['fo-calc-cheer'] = '1'`.

## 8. Eventos

`calc_complete` (`tool`, `lang`) uma vez por carga, na primeira mudança válida feita pela pessoa; `export_click` (`tool`, `lang`, `format`: `pdf` | `csv`); `share_click` (`tool`, `lang`); `next_step_click` com alvo de calculadora. `tool`, `target` e `format` em listas fechadas (`CLOSED_VALUES`).

## 9. Critérios → prova

| # | Critério | Prova |
| --- | --- | --- |
| 1 | 18 páginas, hub e 5 guias com 200, H1, título e descrição | `routes.test.ts`, `gate:seo`, `gate:prontidao`, `budgets.spec.ts` (status 200), prévia |
| 2 | Oráculo antes do motor; teste no centavo; mutante; SHA | `git log … -- fixtures/calc src/calc`, `calc-oracle.test.ts`, mutante com `CALC_FIXTURES_DIR` |
| 3 | Exemplos externos | `OFFICIAL_CHECKS` no oráculo, `OFICIAIS.md`, casos no teste |
| 4 | Privacidade dos números | `tests/e2e/money-privacy.spec.ts` (sentinelas em todo campo, cronograma, PDF, CSV, link, chip, carga com `#`) |
| 5 | Portões de dinheiro, conteúdo e prontidão | `gate:dinheiro-saude` (contagem = rotas `dinheiro`, zero reprova), `gate:conteudo`, `gate:prontidao`, controles em `ymyl/conteudo/prontidao.test.ts` |
| 6 | Orçamento | `budgets.spec.ts` (`CALC_PAGES`, pares), teste do `dist/` |
| 7 | 16 ms por tecla | `tests/e2e/money-speed.spec.ts` (Chromium, 30 teclas por `page.evaluate`, p95 ≤ 16 ms, nenhuma linha de mês antes de abrir) |
| 8 | CSV = oráculo, PDF | `money-calc.spec.ts` (CSV lido de volta contra o caso `full`), `strictPdf` e texto do content stream |
| 9 | Lighthouse | `lighthouserc.json` com `/mortgage-calculator/` e `/guides/15-vs-30-year-mortgage/` |
| 10 | Blogs | `docs/lancamento/blogs-financas.md` (20, LanguageTool) |
| 11 | `pnpm verificar` e CI | saída local e `gh run view` |
| 12 | Sem dependência nova, nada nos só-leitura | `git diff --stat` do critério |
| 13 | Prévia | comentário do Workers Builds e Playwright na prévia com o Google bloqueado |

## 10. Testes que crescem (nenhum afrouxa)

- `ads.spec.ts`: bloco novo para as 18 e o hub, a 360 × 740 e 1280 × 800, cronograma fechado e com um ano aberto; alvos novos (ResultHero, ExportBar, ScenarioCompare, AmortTable, `select`).
- `budgets.spec.ts`: `CALC_PAGES` (18 + guias) com exatamente 2 arquivos, o hub, e pares imagem → calculadora, calculadora → calculadora, hub → calculadora, home → hub.
- `a11y.spec.ts`: as rotas novas entram pelo mapa; estados (resultado, erro de campo, cronograma aberto, cenários, "Link copied") numa carga por calculadora representativa.
- `events.spec.ts`, `consent.test.ts`, `routes.test.ts`, `seo-pages.test.ts`, `seo-checks.test.ts`, `image-hub.test.ts`, `ads-pages.test.ts`, `navigation.spec.ts`: o que muda por construção vai, asserção por asserção, num §.
- `lighthouserc.json`: duas URLs novas. `scripts/screenshots.ts`: pasta `docs/relatorios/fase-04/componentes/`.

## 11. Tempo do CI (projeção)

A F3 deixou as partes em 138 a 177 s (`verificar`), ~400 s (Chromium) e 186 a 584 s (WebKit em três). A F4 soma umas 24 rotas ao axe e ao reflow (automáticos), 18 cargas de privacidade, 19 de anúncio e 25 de orçamento por navegador: o Chromium tende a uns 600 a 650 s e cada parte do WebKit ganha uns 100 a 150 s. O `verificar` ganha o Lighthouse de duas URLs (~70 s) e os builds maiores do `gate:prontidao`. Se uma parte passar de 700 s, o relatório propõe a divisão (ajuste de `.github/`, do Victor).
