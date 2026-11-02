# Exemplos externos do oráculo das calculadoras

Exemplos resolvidos de fonte oficial (e da documentação do numpy-financial) que entram em `fixtures/calc/` como casos marcados com a fonte. O `scripts/oracle/calc.py` confere cada número publicado contra o resultado do próprio laço (`OFFICIAL_CHECKS`) e para se um deles não bater. Todas as páginas foram lidas em **31/out/2026**.

A regra do oráculo é a do plano: parcela arredondada ao centavo, juros de cada período arredondados ao centavo (metade para cima) e a última parcela zerando o saldo. Um exemplo que só bate com outra convenção fica de fora, com o motivo.

## Reproduzidos

| Caso | Calculadora | Fonte (lida em 31/out/2026) | O que a fonte publica | O que o oráculo dá |
| --- | --- | --- | --- | --- |
| `cfpb-h24` | `mortgage-calculator` | CFPB, Regulation Z, Apêndice H, modelo H-24(B) "Mortgage Loan Transaction Loan Estimate - Fixed Rate Loan Sample": <https://www.consumerfinance.gov/rules-policy/regulations/1026/h/#H24-B> (números nas imagens <https://files.consumerfinance.gov/eregulations/ER31DE13.016.png> e <https://files.consumerfinance.gov/eregulations/ER31DE13.018.png>) | Preço $180,000, empréstimo $162,000, 30 anos a 3.875%: principal e juros de **$761.78**; em 5 anos, **$15,773** de principal pago | $761.78; saldo de $146,227.42 depois de 60 parcelas, ou seja, $15,772.58 de principal, que o formulário mostra arredondado em $15,773 |
| `design-system` | `mortgage-calculator` | Design system v1.1 do FileOrca (`docs/design/`, item 12 do plano), conferido com `npf.pmt(0.065/12, 360, -300000)` = 1896.2040704… | $300,000 a 6.5% em 30 anos: **$1,896.20**, juros de **$382,636.71**, saldos de fim de ano de **$296,646.88**, **$293,069.20** e **$289,251.91** | Os mesmos números |
| `design-system` | `mortgage-calculator-15-vs-30-year` | O mesmo exemplo do design system | Em 15 anos, **$2,613.32** e **$170,398.28** de juros: **$717** a mais por mês e **$212,238** a menos de juros | Os mesmos números |
| `cfpb-auto-36` | `auto-loan-calculator` | CFPB, "How do I compare auto loan offers?": <https://www.consumerfinance.gov/ask-cfpb/how-do-i-compare-auto-loan-offers-what-should-i-look-at-besides-the-monthly-payment-en-753/> (reviewed Jan 30, 2024) | $20,000 a 4.75% em 36 meses: parcela de **$597** e **$1,498** de juros (em dólares inteiros) | $597.17 e $1,498.18 |
| `cfpb-auto-72` | `auto-loan-calculator` | A mesma página | Em 72 meses: parcela de **$320** | $319.78 (os juros ficam de fora, veja abaixo) |
| `regz-j-b9` | `personal-loan-calculator` | CFPB, Regulation Z, Apêndice J, (b)(9), exemplo da iteração: <https://www.consumerfinance.gov/rules-policy/regulations/1026/j/> (imagem <https://files.consumerfinance.gov/eregulations/ER22DE11.063-2.png>) | $1,000 financiados e 36 parcelas mensais de $33.61: **APR de 12.83%** | Um empréstimo de $1,209.96 a 0% em 36 meses com tarifa de 17.3526% ($209.96) tem os mesmos $1,000 financiados e as mesmas 36 parcelas de $33.61; APR de 12.83% |
| `regz-j-c1i` | `personal-loan-calculator` | A mesma página, (c)(1)(i) (imagem <https://files.consumerfinance.gov/eregulations/ER22DE11.064-1.png>) | $5,000 financiados, 24 parcelas mensais de $230, primeiro período regular: **APR de 9.69%** | $5,520 a 0% em 24 meses com tarifa de 9.4203% ($520.00): $5,000 financiados, 24 parcelas de $230, APR de 9.69% |
| `regdd-a-tier-1` | `apr-to-apy-calculator` | CFPB, Regulation DD, Apêndice A, Parte I.D (taxa em faixas, capitalização diária): <https://www.consumerfinance.gov/rules-policy/regulations/1030/a/>; arredondamento do § 1030.3(f)(1): <https://www.consumerfinance.gov/rules-policy/regulations/1030/3/> | 5.25% com capitalização diária: **APY de 5.39%** ($53.90 sobre $1,000) | 5.39% |
| `regdd-a-tier-2` | `apr-to-apy-calculator` | A mesma página | 5.50% com capitalização diária: **APY de 5.65%** ($452.29 sobre $8,000) | 5.65% |
| `regdd-a-tier-3` | `apr-to-apy-calculator` | A mesma página | 5.75% com capitalização diária: **APY de 5.92%** ($1,183.61 sobre $20,000) | 5.92% |
| `npf-docs-pmt` | `loan-amortization-calculator` | numpy-financial 1.1.0, `pmt`: <https://numpy.org/numpy-financial/latest/_api_stubs/numpy_financial.pmt.html> | $200,000 a 7.5% em 15 anos: **$1,854.02** | $1,854.02 |
| `npf-docs-ipmt` | `loan-amortization-calculator` | numpy-financial 1.1.0, `ipmt`: <https://numpy.org/numpy-financial/latest/_api_stubs/numpy_financial.ipmt.html> | $2,500 a 8.24% em 12 meses, parcela 1: principal **$200.58**, juros **$17.17**, saldo **$2,299.42** | Os mesmos números, com a parcela de $217.75 |
| `npf-docs-nper` | `credit-card-payoff-calculator` | numpy-financial 1.1.0, `nper`: <https://numpy.org/numpy-financial/latest/_api_stubs/numpy_financial.nper.html> | $8,000 a 7% pagando $150 por mês: **64.07** pagamentos ("over 64 months") | 65 meses (o 65º é a parcela menor que zera o saldo) |

## Deixados de fora, com o motivo

| Exemplo | Fonte | Motivo |
| --- | --- | --- |
| Juros de **$3,024** no carro de $20,000 a 4.75% em 72 meses | CFPB, a página do carro acima | A página multiplica a parcela por 72 (72 × $319.78 − $20,000 = $3,024.16). Pela regra do plano, a última parcela zera o saldo ($320.16) e os juros dão $3,024.54, que arredonda para $3,025. A parcela de $320 entra. |
| Total de juros de **−112.98** do `ipmt` | numpy-financial, a página do `ipmt` | A documentação soma juros sem arredondar. Com os juros de cada mês ao centavo o total é $112.97. A parcela 1 entra. |
| $100 por mês a 5% por 10 anos com $100 iniciais: **$15,692.93** | numpy-financial, a página do `fv` | Sem arredondamento. O laço de centavos chega a $15,692.97; o caso fica como caso comum (`npf-docs-fv-like`). |
| $1,000 a 5% com capitalização anual: **$1,050** no ano 1 e **$1,102.50** no ano 2 | CFPB, "How does compound interest work?": <https://www.consumerfinance.gov/ask-cfpb/how-does-compound-interest-work-en-1683/> | A calculadora corre por mês com a taxa efetiva mensal da capitalização escolhida, arredondando os juros de cada mês. O ano 1 fecha em $1,049.99 (o ano 2 dá $1,102.50). O caso fica como caso comum (`cfpb-compound-like`). |
| APR de **4.274%**, TIP de **69.45%** e "In 5 Years" **$56,582** do H-24(B) | CFPB, Apêndice H | Dependem de custos de fechamento, seguro de hipoteca e juros pré-pagos que a calculadora não modela. |
| Ponto de equilíbrio de **27 meses** ($2,500 / $91) | Federal Reserve, "A Consumer's Guide to Mortgage Refinancings": <https://www.federalreserve.gov/pubs/refinancings/> (update de 27/ago/2008) | Usa a economia depois do imposto (fator 0.72) e parcelas em dólares inteiros ($1,199 e $1,073, quando a conta dá $1,199.10 e $1,073.64). A calculadora não trata imposto. |
| Apêndice J (c)(1)(ii) a (v), (c)(2) e seguintes | CFPB, Apêndice J | Primeiro período ou primeira parcela irregular, períodos semimensais, trimestrais ou semanais: a Personal loan só tem parcelas mensais iguais com o primeiro período regular. |
| Apêndice A da Regulation DD, Partes I.A, I.B, I.C, I.E e II | CFPB, Apêndice A | Partem dos juros em dólares de um prazo em dias (ou de taxas em degraus), não de uma taxa nominal com capitalização, que é a entrada da APR to APY. |

## Brasil (F6): as calculadoras adaptadas

O oráculo é o `scripts/oracle/calc_br.py`. Fontes lidas em 1º/nov/2026, nos sites do Banco Central (bcb.gov.br) e do governo federal (gov.br).

### Reproduzidos

| Caso | Calculadora | Fonte | O que a fonte publica | O que o oráculo dá |
| --- | --- | --- | --- | --- |
| `boletim-8-cet` | `br-personal-loan` | Boletim Consumo e Finanças nº 8, "Custo Efetivo Total" (BCB e Senacon, 30/jul/2014): <https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor/Anexos/boletimconsumofinancas08-cet-2013-custo-efetivo-total.pdf> | R$ 1.000 financiados a 12% ao ano, 5 parcelas de **R$ 205,73**, tarifa de R$ 50 e IOF de R$ 10 pagos à vista: **CET de 43,93% ao ano (3,08% ao mês)** | Com a taxa no campo de quatro casas (0,9489% ao mês): parcela de R$ 205,73, R$ 940 liberados, CET de 43,93% ao ano e 3,08% ao mês |
| `in-83-demonstrativo` | `br-personal-loan` | Instrução Normativa BCB nº 83/2021, art. 2 (o demonstrativo do CET): <https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Instru%C3%A7%C3%A3o%20Normativa%20BCB&numero=83> | R$ 1.000 solicitados, R$ 80 de despesas financiadas, 1% ao mês, 24 parcelas de **R$ 50,84**, valor financiado **R$ 1.080** | Parcela de R$ 50,84 e R$ 1.080 financiados |

### Deixados de fora, com o motivo

| Exemplo | Fonte | Motivo |
| --- | --- | --- |
| Total das parcelas de **R$ 1.220,16** | IN BCB 83, a mesma tabela | A tabela multiplica a parcela por 24 (24 × R$ 50,84). Pela regra do plano a última parcela zera o saldo, e o total dá R$ 1.220,14. A parcela e o valor financiado entram. A tabela não publica o CET. |
| CET de **120,10% ao ano** (6,79% ao mês) | Guia de Excelência na Oferta de Produtos e Serviços Financeiros, Operações de Crédito, 3ª edição (BCB): <https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/guia_de_excelencia/guia_de_excelencia_oferta_de_produtos_servi%C3%A7os_financeiros.pdf> | R$ 10.000 em 36 parcelas de R$ 736,44 dão CET de 116,18% ao ano: o exemplo inclui custos de uns R$ 175 que o texto não revela. Não é reproduzível. |
| As quatro simulações da Calculadora do Cidadão | <https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormFinanciamentoPrestacoesFixas.do?method=exibirFormFinanciamentoPrestacoesFixas> | A página só mostra as entradas; o resultado aparece depois de enviar o formulário, o que a run não faz. |
| SAC e PRICE com números | BCB (Nota Técnica nº 56/2025 e Calculadora do Cidadão) | Nenhuma fonte oficial lida publica um cronograma SAC ou PRICE com números. A convenção segue a descrição da Nota Técnica nº 56, e o oráculo é o único árbitro. |
| Teto do cartão com números | Lei 14.690/2023, art. 28; Res. CMN 4.549, arts. 2-A a 2-D | A lei e a resolução não trazem exemplo numérico. As notícias oficiais (gov.br, dezembro de 2023 e janeiro de 2024) dizem "R$ 1.000 de dívida, no máximo R$ 1.000 de juros"; o caso `cap-bites` testa o teto. |

## Casa e saúde (F7)

O `scripts/oracle/calc_home_health.py` só usa a biblioteca padrão do Python (`fractions`, `decimal` com 50 dígitos e `datetime`). As tabelas que a conta usa (a da Energy Star, as faixas do CDC) estão transcritas no próprio script, e cada exemplo publicado que bate com a convenção entra como caso marcado e é conferido em `OFFICIAL_CHECKS`. Todas as páginas foram lidas em **2/nov/2026**.

### Reproduzidos

| Caso | Calculadora | Fonte | O que a fonte publica | O que o oráculo dá |
| --- | --- | --- | --- | --- |
| `cdc-5-ft-8-in-200-lb` | `bmi-calculator` | CDC, "BMI Frequently Asked Questions": <https://www.cdc.gov/bmi/faq/index.html> | Um adulto de 5 pés e 8 polegadas com 200 libras tem **BMI de 30.4** (faixa Obesity) | 703 × 200 ÷ 68² = 30,4066…, mostrado 30.4, Class 1 Obesity |
| `energystar-12-ft-6-in` | `square-footage-calculator` | Energy Star, "Room Air Conditioners", passo 1: <https://www.energystar.gov/products/room_air_conditioners> | "12 ft., 6 inches, is 12.5 ft." | Um retângulo de 12.5 × 10 ft dá 125.00 sq ft |
| `energystar-row-01` a `energystar-row-14` | `btu-calculator` | Energy Star, a mesma página, tabela "Area To Be Cooled (square feet) / Capacity Needed (BTUs per hour)" | As 14 linhas, de 100 a 2.500 sq ft: 5,000 a **34,000** BTU por hora | O piso de cada linha, sem ajuste, dá a capacidade da linha |
| `nichd-ivf-day-3` e `nichd-ivf-day-5` | `due-date-calculator` | NIH, nuMoM2b (estudo do NICHD), PMC4387083: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4387083/> | Data provável = transferência **+ 263 dias** (embrião de 3 dias) e **+ 261 dias** (de 5 dias); inseminação + 266 | 17/mar/2026 + 263 = 5/dez/2026; + 261 = 3/dez/2026 |
| `nichd-40-weeks` | `due-date-calculator` | NICHD, "About Pregnancy": <https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo> | "about 40 weeks ... from the last menstrual period to delivery" | Última menstruação + 280 dias |

### Deixados de fora, com o motivo

| Exemplo | Fonte | Motivo |
| --- | --- | --- |
| A última linha da tabela escrita **"34,00"** | Energy Star, "ENERGY STAR Certified Room Air Conditioners": <https://www.energystar.gov/most-efficient/me-certified-room-ac/> | Erro de digitação da cópia da tabela: a página principal (acima) traz 34,000, com as mesmas 13 linhas antes dela. O oráculo usa 34,000. |
| "If the room measures 525 square feet, look for ... 14,000 Btu/hr" | Energy Star, folheto de junho de 2003: <https://www.energystar.gov/ia/partners/manuf_res/marketing_res/ROOM_AIRCONDITIONER.pdf> | Na tabela de 2003 a linha era "500 to 700"; a de hoje é "450 up to 550" = 12,000 e "550 up to 700" = 14,000. O oráculo segue a tabela de hoje. |
| O cálculo de 46.73% e 38.62% de gordura | Exército dos EUA, "DCS G-1, Health Promotion Policy" (2019): <https://api.army.mil/e2/c/downloads/566092.pdf> | O exemplo arredonda cada logaritmo a 2 casas e tem dois erros de digitação (73,387 no lugar de 78,387; "LOG10(71)"). Sem arredondar, as equações de Hodgdon e Beckett dão 47,31% e 38,57%. |
| O dia da ovulação do calculador da Office on Women's Health | OWH, "Ovulation calculator": <https://www.womenshealth.gov/ovulation-calculator> | Não há exemplo publicado, só o código da página: a ovulação no dia (ciclo − 14) do ciclo, que é o que o oráculo faz (DECISOES da F7). |
| O texto inteiro do ACOG Committee Opinion 700 | <https://pubmed.ncbi.nlm.nih.gov/28426621/> (só o resumo abriu; o acog.org deu 403) | Os 280, 266, 263 e 261 dias vêm do NICHD e do PMC4387083. O resumo do CO 700 entra só como fonte da regra de que a ultrassonografia do começo da gravidez prevalece. |
