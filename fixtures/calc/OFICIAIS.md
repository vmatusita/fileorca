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
