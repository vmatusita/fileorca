# F6 · Plano: português e espanhol

Plano da run `fase-06`, escrito em 1º/nov/2026 depois da exploração (seis leitores em paralelo: ficha e §, arquitetura de idioma, dinheiro, fontes do BCB, CFPB em espanhol e tempos do CI). Ele é o gabarito da revisão adversarial final, junto com o prompt (`docs/prompts/prompt-fase-06.txt`) e a ficha F6 do PLANO.

## 1. O que entra

| Bloco | pt | es |
| --- | --- | --- |
| Imagem | hub + 7 ferramentas + 3 presets (a Comprimir imagem já existe) | idem |
| PDF | hub + 12 ferramentas | idem |
| Dinheiro | hub próprio + 8 calculadoras adaptadas, sem par | hub (par do inglês) + 5 calculadoras traduzidas, com par |
| Pix | `/pt/apoie/#pix`, linha do café, rodapé | não |
| Home, rodapé, busca, 404, institucionais | com o que existe no idioma | idem |

São 63 páginas novas: 33 em português (11 de imagem, 13 de PDF, 9 de dinheiro) e 30 em espanhol (11, 13, 6). O mapa de rotas é a fonte das contagens; todo teste que conta lê o mapa.

Fora: os 15 guias e os presets de dinheiro em pt e es (os hubs e as páginas de ferramenta em pt e es não os listam), casa e saúde, alemão e francês, a 2b, a § 103, tabela oficial, nome de banco.

## 2. Interfaces

### 2.1 Mapa de rotas (`src/i18n/routes.ts`)

- `TRANSLATED_PATHS`: uma tabela `RouteId → { pt, es }` com os slugs da decisão 2, para o hub de imagem, as 7 ferramentas, os 3 presets, o hub de PDF e as 12 de PDF. `imageToolRoutes()` e `pdfRoutes()` espalham a linha nos três idiomas; o x-default fica no inglês.
- Dinheiro em espanhol: `CalcPageDef.es?: { path, file, next, related }` nas 5 linhas (`src/tools/calc/registry.ts`); `moneyRoutes()` põe `es` quando existe. O hub `money-calculators` ganha `es: '/es/calculadoras-financieras/'`.
- Dinheiro brasileiro: `BR_CALC_IDS` (`br-sac-price`, `br-vehicle-loan`, `br-personal-loan`, `br-early-payoff`, `br-credit-card`, `br-debt-payoff`, `br-compound-interest`, `br-rent-or-buy`), `BR_HUB_ID = 'br-money-calculators'` e `BR_CALC_PAGES` (caminho pt, ícone, grupo, `next`, `related`, `file`), ao lado do registro inglês, para nada que lê `CALC_PAGES` herdar uma página sem inglês. `brMoneyRoutes()` gera as 9 linhas só com `pt`, `adArea: 'dinheiro'`. `RouteId` soma `BrCalcId | typeof BR_HUB_ID`; `MoneyPageId = CalcPageId | BrCalcId`.
- `OG_LOCALE.es` passa de `es_ES` a `es_US` (o público do espanhol, decisão do Victor).

### 2.2 Textos

- `CommonTexts` passa a exigir, nos três idiomas: as 11 de imagem (`tools`), `imageTools`, `pdfTools`, as 12 de PDF (`pdf`), `moneyCalculators`, `calcSeal`, `footer.pdfColumn` e `moneyColumn`, `search.pdfCategory` e `moneyCategory`. `calcs` vira `Partial<Record<MoneyPageId, ToolBlurb>>` na base e é exato por idioma: `EnCommonTexts` (os 18), `PtCommonTexts` (as 8 `br-*`), `EsCommonTexts` (as 5). `guides` e `fileGuides` ficam só no inglês.
- `LangTexts` (`src/i18n/texts.ts`) ganha `image-tools`, `pdf-tools` e `money-calculators` por idioma. Em pt, `money-calculators.ts` é o hub brasileiro; em es, o hub em espanhol. `MoneyHubTexts` tem `presets*` e `guidesHeading` opcionais.
- Imagem: `IMAGE_TOOL_TEXTS: Record<ImagePageId, Record<Lang, …>>`, todos os idiomas obrigatórios.
- PDF: `PDF_TOOL_TEXTS: Record<Lang, Record<PdfToolId, …>>` e `PDF_PANEL_TEXTS: Record<Lang, PdfPanelTexts>`; os textos de opção (`option-texts.ts`) são as mesmas interfaces, implementadas em `src/tools/<slug>/i18n/{pt,es}.ts`.
- Dinheiro: `src/tools/calc/i18n/{pt,es}.ts` (compartilhado: ilha e página), `src/tools/<id>/i18n/es.ts` (5) e `src/tools/br-*/i18n/pt.ts` (8). `src/tools/calc/page.ts` passa a receber `lang` em tudo (textos, nomes, caminhos, migalhas, chips, relacionadas, datas, arquivo).
- Os moldes `PdfToolPage`, `PdfToolsView`, `ImageToolsView` e `MoneyCalculatorsView` recebem `lang` (padrão `'en'`, para os testes que já os renderizam sem idioma). A linha do guia e a seção de guias só aparecem em inglês.

### 2.3 O que vai ao arquivo baixado

- PDF: `PdfToolPanelTexts.suffix` (o sufixo do nome, por idioma; em inglês, igual ao `suffix` do registro, com teste) e `PdfPanelTexts.files` (`page`, `part`, `selected`, `zip`, `imagesZip`, `document`). Imagem: `ImagePanelTexts.files` (`zip`, `pdf`). Os nomes estão nos glossários.
- Numeração do PDF: a operação `numbers` ganha `page?` e `of?` (opcionais; sem eles, "Page" e "of", os bytes de hoje). `NumbersTexts` ganha `pageWord` e `ofWord`. As palavras passam pelo `winAnsi()`.
- Relatório de dinheiro: `ReportInput.paper?: 'a4'` (padrão Letter). Terceira mudança no motor de PDF, porque a decisão 5 pede A4 em pt: vai num § com teste. CSV: `csvText(table, yearHeading, lang)`; pt com `;` e vírgula decimal, en e es como hoje; BOM nos três.

### 2.4 Formato

- `src/calc/parse.ts`: `es` = `en` ("1,234.56", agrupa com 4 dígitos), `pt` como hoje. `money()`/`dollars()`: pt "R$ 1.234,56" (espaço sem quebra), es "$1,234.56". `%` do espanhol continua com espaço sem quebra.
- `src/i18n/format.ts`: `fileSize` à mão, sem `Intl` (en e es "2.4 MB", pt "2,4 MB"); `groupDigits(n, lang)` para o "20.000 px" do Redimensionar (sai o `toLocaleString`).
- Datas por extenso por idioma (`src/i18n/dates.ts`, fora da ilha): "1 de novembro de 2026", "1 de noviembre de 2026". "Revisado em" e "Última atualização" no dia de Brasília.

## 3. Tabela das páginas

Os caminhos são os da decisão 2 do prompt (reproduzidos nos glossários, seção "Ferramentas"). Par no hreflang: imagem e PDF ligam en, pt e es; o hub de dinheiro e as 5 calculadoras ligam en e es; as 9 brasileiras ficam sem par.

| id | en | pt | es |
| --- | --- | --- | --- |
| `money-calculators` | /money-calculators/ | — | /es/calculadoras-financieras/ |
| `br-money-calculators` | — | /pt/calculadoras-financeiras/ | — |
| `mortgage-calculator` | /mortgage-calculator/ | — | /es/calculadora-de-hipoteca/ |
| `personal-loan-calculator` | /personal-loan-calculator/ | — | /es/calculadora-de-prestamo-personal/ |
| `credit-card-payoff-calculator` | /credit-card-payoff-calculator/ | — | /es/calculadora-de-tarjeta-de-credito/ |
| `debt-payoff-calculator` | /debt-payoff-calculator/ | — | /es/calculadora-de-deudas/ |
| `compound-interest-calculator` | /compound-interest-calculator/ | — | /es/calculadora-de-interes-compuesto/ |
| `br-sac-price` | — | /pt/simulador-sac-price/ | — |
| `br-vehicle-loan` | — | /pt/simulador-financiamento-veiculo/ | — |
| `br-personal-loan` | — | /pt/simulador-emprestimo/ | — |
| `br-early-payoff` | — | /pt/amortizacao-antecipada/ | — |
| `br-credit-card` | — | /pt/calculadora-cartao-de-credito/ | — |
| `br-debt-payoff` | — | /pt/calculadora-de-dividas/ | — |
| `br-compound-interest` | — | /pt/calculadora-juros-compostos/ | — |
| `br-rent-or-buy` | — | /pt/alugar-ou-comprar/ | — |

Títulos, descrições (120 a 160 caracteres) e H1 vêm dos textos; o título começa pelo nome da ferramenta e o H1 é sentence case.

## 4. Dinheiro em português: convenções

Comum às 8: centavos inteiros, taxa em 1/10.000 de ponto (§ 111), metade para cima, juros de cada mês ao centavo, a última parcela zera o saldo. Toda taxa é **efetiva**: "ao mês" entra exata (j = taxa); "ao ano" vira mensal por capitalização, j = piso de 10^30 · ((1 + a)^(1/12) − 1) (a raiz inteira da § 111, `monthlyRate30(a, 1)`), nunca dividindo por 12. A Res. CMN 5.004/2022, art. 3, I, manda o contrato informar a taxa efetiva mensal e anual. Nenhuma fonte oficial lida diz que um produto usa taxa nominal; se a pessoa tem um contrato com taxa nominal, a premissa diz como converter. O oráculo é `scripts/oracle/calc_br.py`, separado e autossuficiente (decimal e numpy-financial), com as fixtures `fixtures/calc/br-*.json` num commit antes de qualquer motor ou definição brasileira; as 18 fixtures em inglês não mudam um byte.

| Calculadora | Campos principais (≤ 2 linhas de 2) | Depois do resultado | Convenção |
| --- | --- | --- | --- |
| SAC × PRICE | valor do imóvel, entrada (R$ ou %), prazo (meses), juros ao ano | TR ao mês, seguros e taxas (R$/mês) | No começo de cada mês a TR corrige o saldo (`share`, metade para cima), antes dos juros. SAC: amortização = saldo corrigido ÷ meses que faltam. PRICE: com TR zero a parcela é a do primeiro mês, fixa; com TR, recalculada sobre o saldo corrigido e os meses que faltam. Seguros e taxas somam à parcela e não mudam. Dois cronogramas, uma tabela agrupada por sistema e ano. |
| Financiamento de veículo | preço, entrada, prazo (meses), juros ao mês | IOF (R$), tarifas (R$), financiar junto ou pagar à vista | PRICE. Financiados: principal = preço − entrada + IOF + tarifas; à vista: principal = preço − entrada e a pessoa paga IOF e tarifas na contratação. CET pela Res. CMN 4.881/2020: FC0 = crédito liberado menos o que é pago na frente; parcelas mensais iguais, expoente j/12 (o mesmo do exemplo oficial do Boletim nº 8 do BCB e da Senacon, 43,93% ao ano e 3,08% ao mês); CET ao ano em centésimos, metade para cima; ao mês derivado. |
| Empréstimo | valor, prazo, juros ao mês | IOF, tarifas, modo | O mesmo motor de crédito, sem preço e entrada. Exemplo oficial da IN BCB 83/2021: 1.000 + 80 de despesas financiadas, 1% ao mês, 24 × R$ 50,84 = R$ 1.220,16. |
| Amortização antecipada | saldo devedor, valor a antecipar, juros ao mês, meses que faltam | sistema (SAC ou PRICE) | Res. CMN 5.004/2022, art. 7: valor presente à taxa do contrato, total ou parcial, sem tarifa (Res. 3.516, art. 1); antecipar X abate X do saldo hoje. Reduzir o prazo: PRICE mantém a parcela, SAC mantém a amortização. Reduzir a parcela: mesmo prazo, parcela recalculada. Juros que deixa de pagar = juros sem antecipar − juros do cenário. |
| Cartão de crédito | fatura, pagamento mínimo, juros do rotativo ao mês, juros do parcelamento ao mês | parcelas, IOF (R$) | Res. CMN 4.549/2017 (rotativo só até a fatura seguinte; depois, parcelamento) e Lei 14.690/2023, art. 28, com os arts. 2-A a 2-D da 4.549 (pela 5.112/2023): juros e encargos de cada operação ≤ valor original. A: paga o mínimo; o resto fica um mês no rotativo e o saldo vai para o parcelamento; o teto é o resto (montante inicial do rotativo), contado desde o rotativo. B: parcela a fatura já; o teto é a fatura. O IOF entra no principal do parcelamento e fica fora do teto (o art. 2-A não o põe em "juros" nem "encargos"). Quando o teto morde, os juros param e as parcelas só amortizam. |
| Dívidas | as dívidas (saldo, juros ao mês, mínimo) | pagamento extra | Bola de neve × avalanche: o motor inglês `debtPayoff` com taxa = 12 × a mensal (mesma fração, mesmo arredondamento); o oráculo faz o laço com a taxa mensal direta. |
| Juros compostos | valor inicial, aporte mensal, juros, prazo (meses) | unidade da taxa (ao mês ou ao ano) | Juros do mês sobre o saldo, aporte no fim do mês. Resultado bruto: sem imposto de renda, que é tabela oficial. |
| Alugar ou comprar | valor do imóvel, aluguel, entrada, anos da comparação | sistema (SAC padrão), juros ao ano, prazo, ITBI e cartório (% do imóvel), IPTU (R$/ano), manutenção, valorização, custo de venda, reajuste do aluguel, rendimento | A estrutura do motor inglês: quem gasta menos no mês investe a diferença; o inquilino começa com entrada + ITBI + cartório investidos; valor e aluguel mudam uma vez por ano; rendimento efetivo convertido por capitalização. Sem imposto. |

Fontes (lidas em 1º/nov/2026, links completos no relatório): Res. CMN 4.881/2020 e IN BCB 83/2021 (CET), Res. CMN 4.549/2017 consolidada e 5.112/2023, Lei 14.690/2023 no planalto.gov.br (cartão), Res. CMN 5.004/2022 e 3.516/2007, CDC art. 52 (liquidação), Decreto 6.306/2007 (IOF, estrutura de alíquota diária × dias até 365 + adicional; nenhuma alíquota no código), Nota Técnica BCB 56/2025 (SAC e PRICE), Res. CMN 4.624/2018 com a 5.124/2024 (TR), Calculadora do Cidadão (prestações fixas). `planalto.gov.br` entra na lista oficial do `scripts/lib/ymyl.ts`, com teste.

Oficiais no oráculo: Boletim nº 8 (CET 43,93% ao ano e 3,08% ao mês, conferido no `OFFICIAL_CHECKS`) e IN 83 (parcela 50,84 e total 1.220,16). O Guia de Excelência (CET 120,10%) não é reproduzível (custos não revelados) e vai para o `OFICIAIS.md` com o motivo. Não há exemplo numérico oficial de SAC ou PRICE: o oráculo é o único árbitro.

Desempenho: com TR zero (o exemplo inicial) a PRICE é o laço de parcela fixa; o recálculo exato só roda quando a pessoa digita uma TR, e o prazo vai até 420 meses. O `money-speed.spec.ts` mede o SAC × PRICE.

## 5. Dinheiro em espanhol

As 5 usam a mesma definição, o mesmo motor, as mesmas fixtures e o mesmo exemplo inicial da página em inglês; um teste compara as views en e es (os valores de dinheiro iguais caractere a caractere, porque o espanhol escreve número como o inglês). CSV como o inglês, PDF em Letter. `next` e `related` só entre as 5. Sem presets e sem guia.

Fontes: o CFPB tirou do ar o `consumerfinance.gov/es/` entre 26/jun e 18/jul/2026 (tudo redireciona para o inglês). As páginas citam os PDFs em espanhol do CFPB que seguem no ar (Toolkit hipotecário, formulários H-28, "Plan de acción contra la deuda") e, onde não há, a página oficial em inglês do CFPB com "(en inglés)" no rótulo. Um teste reprova `consumerfinance.gov/es/` nos textos.

## 6. Pix

- Fontes: Manual de Padrões para Iniciação do Pix v2.10.0 (19/08/2026), § 2.6 (QR estático), e Manual do BR Code v2.0.1; Regulamento (Res. BCB 1/2020), arts. 40 a 41-B (devolução pelo recebedor em até 90 dias; o MED não cobre arrependimento).
- Código: 00 `01`; 26 com 00 `br.gov.bcb.pix` e 01 a chave aleatória (`src/platform/pix.ts`, uma linha de configuração, copiada do `docs/F0-SAIDA.md`); 52 `0000`; 53 `986`; 54 só com valor (`5.00`, `10.00`, `20.00`); 58 `BR`; 59 `VICTOR YUKI MATUSITA`; 60 `CURITIBA`; 62 com 05 `***`; 63 CRC16-CCITT (0x1021, início 0xFFFF), 4 hexadecimais maiúsculos. Sem o campo 01 (opcional; o exemplo estático do manual não o tem).
- Oráculo: `scripts/oracle/pix.py`, só biblioteca padrão, CRC do `binascii.crc_hqx`; reproduz `…63041D3D` e grava `fixtures/pix.json` (os quatro códigos, SHA-256 do script, versão do Python), num commit antes do gerador.
- Gerador `src/platform/pix.ts` (TypeScript, sem dependência, CRC próprio) no build. QR pelo `qrcode` (MIT, devDependency, só no build), nível de correção M, zona de silêncio de 4 módulos, módulos em `currentColor` com `color: var(--deep)` e fundo `#FFFFFF` (a exceção do design system). O teste rasteriza cada SVG do `dist/` com o `@resvg/resvg-js` e lê com o `jsqr` (Apache-2.0, devDependency).
- Página `/pt/apoie/`: o SupportCard ganha o bloco `.fo-pix` com o OptionGroup (Qualquer valor, R$ 5, R$ 10, R$ 20) trocado só por CSS (`:has(:checked)`), o QR, o "copia e cola" com "Copiar código" (script inline mínimo, `navigator.clipboard`) e "Em nome de Victor Yuki Matusita". O Ko-fi continua. `donate_click` com o lugar novo `pix` (lista fechada, com teste).
- A linha do café em português vira "Pagar um café no Pix" → `/pt/apoie/#pix`; o rodapé diz "Curtiu? Me paga um café".

## 7. Glossários

`docs/i18n/pt.md` e `docs/i18n/es.md`: registro, formato, termos de arquivo, ferramentas e opções, nome do arquivo baixado, dinheiro, falas da Oli, pedido de café e a lista "Nunca". O `tests/unit/glossary.test.ts` lê a lista e reprova o termo nos arquivos de texto do idioma e no texto visível das páginas do idioma no `dist/`, com controles.

## 8. Critério → prova

| Critério | Prova |
| --- | --- |
| 1 · páginas 200 com H1, título, descrição, `lang`, canonical | `routes.test.ts` (arquivos = mapa), `gate:seo`, `gate:links`, `tool-i18n.spec.ts`, prévia |
| 2 · hreflang, x-default, sitemaps | `gate:seo` e `seo-checks.test.ts` com as contagens do mapa |
| 3 · vazamento de inglês e glossário | `tests/unit/english-leak.test.ts`, `tests/unit/glossary.test.ts` |
| 4 · cada ferramenta pt/es processa uma fixture | `tests/e2e/tool-i18n.spec.ts` (Chromium e WebKit) |
| 5 · dinheiro pt contra o oráculo | `git log -- fixtures/calc src/calc src/tools/calc`, `calc-oracle.test.ts`, mutante, `calc_br.py --check`, `calc.py --check` |
| 6 · 5 em espanhol = inglês; CSV e PDF por idioma | `calc-i18n.test.ts`, `calc-report.test.ts`, `money-calc.spec.ts` |
| 7 · Pix | `pix.py --check`, `tests/unit/pix.test.ts`, `tests/unit/pix-qr.test.ts`, `tests/e2e/money-pix.spec.ts` |
| 8 · LanguageTool | `pnpm lint:texto` com amostras de pt e es |
| 9 · orçamento | `budgets.spec.ts` (pt/es nos mesmos 2 arquivos JS, nome e hash, da página em inglês) |
| 10 · anúncio, a11y, dobra | `ads.spec.ts`, `a11y.spec.ts`, `money-*` |
| 11 · Lighthouse | `lighthouserc.json` com `/pt/simulador-sac-price/` e `/pt/apoie/` |
| 12 · portões | `gate:conteudo`, `gate:prontidao`, `gate:dinheiro-saude`, `gate:links`, `gate:licencas` |
| 13 a 17 · CI, verificar, dependências, prévia, merge | logs do CI, `pnpm verificar`, `git diff --stat`, Playwright na prévia |

## 9. CI

Projeção da exploração (modelo que reproduz a run 41372335840 com ±4%): nenhuma parte passa de 700 s no cenário central se os testes novos por idioma ficarem em arquivos próprios que não empurrem o `design.spec.ts` para a parte da matriz de imagens. Plano: os testes novos de pt e es em `i18n-*.spec.ts` e `money-*.spec.ts`; o teste de reflow a 320 px do `design.spec.ts` dividido por idioma, porque com 148 páginas ele chegaria perto do limite de 60 s por teste. Antes de cada push com testes novos, o `--list` das 3 partes do Chromium e das 7 do WebKit, conferindo que o `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes. O `pnpm verificar` local inteiro deve passar de 900 s: nesse caso rodam as partes do CI em sequência, e a medida vai num §.

## 10. Ordem de construção

1. Fundação (agente principal): glossários e teste; número, CSV, PDF e datas; caminhos e tipos por idioma; os moldes de PDF e de dinheiro com `lang`; páginas e textos-esqueleto; teste de vazamento de inglês.
2. Pix (agente principal): oráculo (commit), gerador, QR, testes, SupportCard, linha do café, rodapé.
3. Traduções em paralelo (agentes Opus em worktree, cada um dono de arquivos que nenhum outro toca): imagem pt, PDF pt, imagem es, PDF es, dinheiro es. Enquanto isso, o agente principal faz o dinheiro brasileiro.
4. Dinheiro pt (agente principal): oráculo (commit), motores, definições e textos, uma calculadora por vez, com testes.
5. Home, rodapé, busca, 404 e institucionais de pt e de es.
6. Junção das traduções, portões e testes que crescem, `--list`, Lighthouse, screenshots.
7. Revisão adversarial (sete lentes Sonnet numa worktree só de leitura), céticos, correções, segunda passada, relatório, PR.
