# F6 · Relatório (português e espanhol: imagem, PDF, dinheiro adaptado e o Pix)

## Resumo

- **O site está em português (`/pt/`) e em espanhol (`/es/`)** com os slugs da decisão 2 e o hreflang recíproco com o inglês: o hub de imagem, as 8 ferramentas de imagem, os 3 presets, o hub de PDF e as 12 ferramentas de PDF, cada uma processando arquivos de verdade no navegador, nos dois navegadores (`tool-i18n.spec.ts`).
- **O dinheiro em português são 8 calculadoras adaptadas ao Brasil e o hub delas**, páginas próprias sem par no hreflang. O oráculo independente (`scripts/oracle/calc_br.py`) e as 8 fixtures entraram num commit antes de qualquer motor ou definição brasileira, e todo motor bate no centavo com ele (1.392 casos, o mutante reprova).
- **O dinheiro em espanhol são as 5 calculadoras para o público hispano dos EUA**, em dólar, com par em inglês: a mesma definição, o mesmo motor e as mesmas fixtures, e os mesmos números do inglês (`calc-i18n.test.ts`).
- **O Pix está na `/pt/apoie/`:** o BR Code estático dos quatro valores bate com o oráculo (`scripts/oracle/pix.py`, commitado antes do gerador) e com o exemplo do manual do BC, e o QR de cada valor, lido de volta pelo `jsqr`, devolve o mesmo código. A linha do café em português leva ao Pix.
- **Home, rodapé, busca, 404 e institucionais** existem em pt e es, e os glossários `docs/i18n/pt.md` e `docs/i18n/es.md` vieram antes das traduções, com um teste que lê a lista "Nunca". Um teste de vazamento procura frases em inglês nas páginas de pt e es (zero).
- **A revisão adversarial** (7 lentes e 20 céticos) achou 13 médios confirmados, nenhum crítico ou alto, e todos foram corrigidos com teste e §; a segunda passada achou mais 3 médios nas correções, também corrigidos (§ 244 a § 256).
- **A válvula não cortou nada.** Nada foi enviado nem publicado.

## As páginas

As páginas de ferramenta, preset, hub e calculadora com versão em pt ou es, lidas do mapa de rotas (`src/i18n/routes.ts`), com o H1 do `dist/` e o JS inicial (gzip, com o inline) e as requisições medidos pelo `budgets.spec.ts` e pelo `i18n-budgets.spec.ts` no Chromium ("2 + 6" é 2 arquivos JS e 6 requisições). As institucionais, a home e o 404 também existem nos três idiomas (a home e as institucionais já existiam; a F6 deu a elas os cartões, o rodapé e a busca de pt e es).

| Id | en | pt | es | Par no hreflang | H1 em pt | H1 em es | JS e requisições (pt) | JS e requisições (es) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `compress-image` | `/compress-image/` | `/pt/comprimir-imagem/` | `/es/comprimir-imagen/` | en, pt-BR, es | Comprimir imagem | Comprimir imagen | 21,1 KB · 2 + 6 | 21,1 KB · 2 + 6 |
| `image-tools` | `/image-tools/` | `/pt/ferramentas-de-imagem/` | `/es/herramientas-de-imagen/` | en, pt-BR, es | Oito ferramentas de imagem, sem upload | Ocho herramientas de imagen, sin subir nada | 3,3 KB · 0 + 4 | 3,3 KB · 0 + 4 |
| `resize-image` | `/resize-image/` | `/pt/redimensionar-imagem/` | `/es/redimensionar-imagen/` | en, pt-BR, es | Redimensionar imagem | Redimensionar imagen | 21,4 KB · 2 + 6 | 21,4 KB · 2 + 6 |
| `crop-image` | `/crop-image/` | `/pt/cortar-imagem/` | `/es/recortar-imagen/` | en, pt-BR, es | Cortar imagem | Recortar imagen | 23,3 KB · 2 + 6 | 23,3 KB · 2 + 6 |
| `rotate-image` | `/rotate-image/` | `/pt/girar-imagem/` | `/es/rotar-imagen/` | en, pt-BR, es | Girar imagem | Rotar imagen | 21,1 KB · 2 + 6 | 21,1 KB · 2 + 6 |
| `heic-to-jpg` | `/heic-to-jpg/` | `/pt/heic-para-jpg/` | `/es/heic-a-jpg/` | en, pt-BR, es | HEIC para JPG | HEIC a JPG | 21,0 KB · 2 + 6 | 21,0 KB · 2 + 6 |
| `webp-to-jpg` | `/webp-to-jpg/` | `/pt/webp-para-jpg/` | `/es/webp-a-jpg/` | en, pt-BR, es | WebP para JPG | WebP a JPG | 21,0 KB · 2 + 6 | 21,0 KB · 2 + 6 |
| `png-to-jpg` | `/png-to-jpg/` | `/pt/png-para-jpg/` | `/es/png-a-jpg/` | en, pt-BR, es | PNG para JPG | PNG a JPG | 20,9 KB · 2 + 6 | 20,9 KB · 2 + 6 |
| `image-to-pdf` | `/image-to-pdf/` | `/pt/imagem-para-pdf/` | `/es/imagen-a-pdf/` | en, pt-BR, es | Imagem para PDF | Imagen a PDF | 21,0 KB · 2 + 6 | 21,0 KB · 2 + 6 |
| `compress-image-to-100kb` | `/compress-image/to-100kb/` | `/pt/comprimir-imagem/para-100kb/` | `/es/comprimir-imagen/a-100kb/` | en, pt-BR, es | Comprimir imagem para 100 KB | Comprimir imagen a 100 KB | 20,9 KB · 2 + 6 | 20,9 KB · 2 + 6 |
| `compress-image-to-1mb` | `/compress-image/to-1mb/` | `/pt/comprimir-imagem/para-1mb/` | `/es/comprimir-imagen/a-1mb/` | en, pt-BR, es | Comprimir imagem para 1 MB | Comprimir imagen a 1 MB | 20,9 KB · 2 + 6 | 20,9 KB · 2 + 6 |
| `resize-image-youtube-thumbnail` | `/resize-image/youtube-thumbnail/` | `/pt/redimensionar-imagem/miniatura-youtube/` | `/es/redimensionar-imagen/miniatura-youtube/` | en, pt-BR, es | Miniatura do YouTube | Miniatura de YouTube | 21,0 KB · 2 + 6 | 21,0 KB · 2 + 6 |
| `money-calculators` | `/money-calculators/` | — | `/es/calculadoras-financieras/` | en, es | — | Calculadoras de préstamos, deudas y ahorro | — | 3,4 KB · 0 + 4 |
| `mortgage-calculator` | `/mortgage-calculator/` | — | `/es/calculadora-de-hipoteca/` | en, es | — | Calculadora de hipoteca | — | 42,8 KB · 2 + 6 |
| `personal-loan-calculator` | `/personal-loan-calculator/` | — | `/es/calculadora-de-prestamo-personal/` | en, es | — | Calculadora de préstamo personal | — | 42,8 KB · 2 + 6 |
| `credit-card-payoff-calculator` | `/credit-card-payoff-calculator/` | — | `/es/calculadora-de-tarjeta-de-credito/` | en, es | — | Calculadora de tarjeta de crédito | — | 42,8 KB · 2 + 6 |
| `debt-payoff-calculator` | `/debt-payoff-calculator/` | — | `/es/calculadora-de-deudas/` | en, es | — | Calculadora de deudas | — | 42,8 KB · 2 + 6 |
| `compound-interest-calculator` | `/compound-interest-calculator/` | — | `/es/calculadora-de-interes-compuesto/` | en, es | — | Calculadora de interés compuesto | — | 42,8 KB · 2 + 6 |
| `br-money-calculators` | — | `/pt/calculadoras-financeiras/` | — | sem par | Calculadoras financeiras | — | 3,5 KB · 0 + 4 | — |
| `br-sac-price` | — | `/pt/simulador-sac-price/` | — | sem par | Simulador SAC × PRICE | — | 42,8 KB · 2 + 6 | — |
| `br-vehicle-loan` | — | `/pt/simulador-financiamento-veiculo/` | — | sem par | Simulador de financiamento de veículo | — | 42,8 KB · 2 + 6 | — |
| `br-personal-loan` | — | `/pt/simulador-emprestimo/` | — | sem par | Simulador de empréstimo | — | 42,8 KB · 2 + 6 | — |
| `br-early-payoff` | — | `/pt/amortizacao-antecipada/` | — | sem par | Amortização antecipada | — | 42,8 KB · 2 + 6 | — |
| `br-credit-card` | — | `/pt/calculadora-cartao-de-credito/` | — | sem par | Calculadora do cartão de crédito | — | 42,8 KB · 2 + 6 | — |
| `br-debt-payoff` | — | `/pt/calculadora-de-dividas/` | — | sem par | Calculadora de dívidas | — | 42,8 KB · 2 + 6 | — |
| `br-compound-interest` | — | `/pt/calculadora-juros-compostos/` | — | sem par | Calculadora de juros compostos | — | 42,8 KB · 2 + 6 | — |
| `br-rent-or-buy` | — | `/pt/alugar-ou-comprar/` | — | sem par | Alugar ou comprar | — | 42,8 KB · 2 + 6 | — |
| `pdf-tools` | `/pdf-tools/` | `/pt/ferramentas-pdf/` | `/es/herramientas-pdf/` | en, pt-BR, es | Ferramentas de PDF grátis que nunca enviam seus arquivos | Herramientas PDF gratis que nunca suben tus archivos | 3,4 KB · 0 + 4 | 3,4 KB · 0 + 4 |
| `merge-pdf` | `/merge-pdf/` | `/pt/juntar-pdf/` | `/es/unir-pdf/` | en, pt-BR, es | Juntar PDF | Unir PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `split-pdf` | `/split-pdf/` | `/pt/dividir-pdf/` | `/es/dividir-pdf/` | en, pt-BR, es | Dividir PDF | Dividir PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `pdf-to-jpg` | `/pdf-to-jpg/` | `/pt/pdf-para-jpg/` | `/es/pdf-a-jpg/` | en, pt-BR, es | PDF para JPG | PDF a JPG | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `compress-pdf` | `/compress-pdf/` | `/pt/comprimir-pdf/` | `/es/comprimir-pdf/` | en, pt-BR, es | Comprimir PDF | Comprimir PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `rotate-pdf` | `/rotate-pdf/` | `/pt/girar-pdf/` | `/es/rotar-pdf/` | en, pt-BR, es | Girar PDF | Rotar PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `delete-pdf-pages` | `/delete-pdf-pages/` | `/pt/excluir-paginas-pdf/` | `/es/eliminar-paginas-pdf/` | en, pt-BR, es | Excluir páginas do PDF | Eliminar páginas de PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `add-page-numbers-to-pdf` | `/add-page-numbers-to-pdf/` | `/pt/numerar-paginas-pdf/` | `/es/numerar-paginas-pdf/` | en, pt-BR, es | Numerar páginas do PDF | Numerar páginas de PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `sign-pdf` | `/sign-pdf/` | `/pt/assinar-pdf/` | `/es/firmar-pdf/` | en, pt-BR, es | Assinar PDF | Firmar PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `protect-pdf` | `/protect-pdf/` | `/pt/proteger-pdf/` | `/es/proteger-pdf/` | en, pt-BR, es | Proteger PDF | Proteger PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `unlock-pdf` | `/unlock-pdf/` | `/pt/desbloquear-pdf/` | `/es/desbloquear-pdf/` | en, pt-BR, es | Desbloquear PDF | Desbloquear PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `reorder-pdf-pages` | `/reorder-pdf-pages/` | `/pt/organizar-paginas-pdf/` | `/es/ordenar-paginas-pdf/` | en, pt-BR, es | Organizar páginas do PDF | Ordenar páginas de PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |
| `watermark-pdf` | `/watermark-pdf/` | `/pt/marca-dagua-pdf/` | `/es/marca-de-agua-pdf/` | en, pt-BR, es | Marca d'água no PDF | Marca de agua en PDF | 36,9 KB · 2 + 6 | 36,9 KB · 2 + 6 |

## Os oráculos vieram antes dos motores e do gerador

```
$ git log --reverse --format='%h %ad %s' --date=format:'%d/%m %H:%M' origin/main..HEAD -- fixtures/calc/br-*.json scripts/oracle/calc_br.py src/calc/br.ts src/tools/calc/defs/br.ts
d4e4536 02/11 00:43 test(calc): add the independent oracle of the Brazilian calculators and its fixtures
08de608 02/11 00:44 test(calc): a SAC loan of zero has no schedule row in the Brazilian oracle
95e1e35 02/11 00:46 test(calc): a compound balance past 10^15 cents is the error too-large in the Brazilian oracle
77d0341 02/11 00:46 feat(calc): engines of the eight calculators adapted to Brazil
176a438 02/11 00:58 feat(money): the eight calculators adapted to Brazil and their hub, in Portuguese

$ git log --reverse --format='%h %ad %s' --date=format:'%d/%m %H:%M' origin/main..HEAD -- fixtures/pix.json scripts/oracle/pix.py src/platform/pix.ts src/platform/pix-qr.ts
2b03121 02/11 00:27 test(pix): add the independent Pix oracle and its four codes
2416158 02/11 00:37 feat(pix): static BR Code, QR and copy on the Portuguese support page
```

Os dois ajustes do oráculo brasileiro (`08de608` e `95e1e35`, a linha de um empréstimo SAC de zero e o saldo dos juros compostos acima de 10^15 centavos) também vieram em commits próprios, antes do commit do motor que os segue (§ 225). As 18 fixtures em inglês não mudaram um byte.

Os três `--check`, no fim da run (zero diferença):

```
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc.py --check
igual: mortgage-calculator.json … igual: apr-to-apy-calculator.json   (as 18, exit 0)
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py --check
igual: br-sac-price.json (212 casos)
igual: br-vehicle-loan.json (174 casos)
igual: br-personal-loan.json (139 casos)
igual: br-early-payoff.json (245 casos)
igual: br-credit-card.json (265 casos)
igual: br-debt-payoff.json (74 casos)
igual: br-compound-interest.json (173 casos)
igual: br-rent-or-buy.json (110 casos)
$ uv run --no-project --python 3.13 python -I scripts/oracle/pix.py --check
fixtures/pix.json: 4 codes match the oracle (and the manual example)
```

A prova do mutante: numa cópia das fixtures, a primeira parcela SAC do exemplo da página passou de 460495 para 460496 centavos, e o `calc-oracle.test.ts` reprovou:

```
$ CALC_FIXTURES_DIR=.cache/mutante pnpm exec vitest run tests/unit/calc-oracle.test.ts
 FAIL  tests/unit/calc-oracle.test.ts > br-sac-price > matches the oracle to the cent in all 212 cases
AssertionError: 1 of 212 cases differ: expected [ Array(1) ] to deeply equal []
 Tests  1 failed | 28 passed (29)
```

## As calculadoras brasileiras

Comum às 8 (§ 226): centavos inteiros, taxa em 1/10.000 de ponto (§ 111), metade para cima, juros de cada mês ao centavo, a última parcela zera o saldo. Toda taxa é **efetiva**: "ao mês" entra exata; "ao ano" vira mensal por capitalização, piso de 10^30 · ((1 + a)^(1/12) − 1), nunca a anual dividida por 12 (Res. CMN 5.004/2022, art. 3). Nenhuma tabela oficial no código: IOF, TR, CET e juros são campos, e o valor inicial de cada taxa leva a etiqueta "exemplo". Fontes lidas em 1º/nov/2026. Os campos principais cabem em duas linhas de dois a 360 px, com o resultado acima da dobra (§ 229).

| Calculadora | Campos principais | Depois do resultado | Convenção | Casos do oráculo |
| --- | --- | --- | --- | ---: |
| Simulador SAC × PRICE | valor do imóvel, entrada (R$ ou %), prazo em meses, juros ao ano | TR ao mês, seguros e taxas por mês | A TR corrige o saldo no começo do mês, antes dos juros. SAC: amortização = saldo corrigido ÷ meses que faltam. PRICE: com TR zero a parcela é fixa; com TR, recalculada sobre o saldo corrigido. Seguros e taxas somam à parcela. Duas tabelas, agrupadas por sistema e ano. | 212 |
| Financiamento de veículo | preço, entrada, prazo, juros ao mês | IOF (R$), tarifas (R$), financiar junto ou pagar à vista | PRICE. Financiados, o principal leva IOF e tarifas; à vista, a pessoa os paga na contratação. CET pela Res. CMN 4.881/2020: fluxo do crédito liberado e das parcelas, períodos mensais iguais, expoente j/12; ao ano em centésimos, ao mês derivado. | 174 |
| Simulador de empréstimo | valor, prazo, juros ao mês | IOF, tarifas, modo | O mesmo motor de crédito, sem preço e entrada. | 139 |
| Amortização antecipada | saldo devedor, valor a antecipar, juros ao mês, meses que faltam | sistema (SAC ou PRICE) | Res. CMN 5.004/2022, art. 7: valor presente pela taxa do contrato, sem tarifa (Res. 3.516, art. 1). Reduzir o prazo (a PRICE mantém a parcela, o SAC a amortização) ou a parcela (mesmo prazo). | 245 |
| Cartão de crédito | fatura, pagamento mínimo, rotativo ao mês, parcelado ao mês | parcelas, IOF (R$) | Res. CMN 4.549/2017 (rotativo só até a fatura seguinte, depois o parcelamento) e Lei 14.690/2023, art. 28: juros e encargos de cada operação até o valor original. A: paga o mínimo, um mês no rotativo e o resto parcelado. B: parcela a fatura já. O IOF entra no principal e fica fora do teto. Quando o teto morde, os juros param. | 265 |
| Calculadora de dívidas | as dívidas (saldo, juros ao mês, mínimo) | pagamento extra | Bola de neve × avalanche, com o motor inglês e a taxa = 12 × a mensal (mesma fração); o oráculo faz o laço com a taxa mensal direta. | 74 |
| Juros compostos | valor inicial, aporte mensal, juros, prazo em meses | unidade da taxa (ao mês ou ao ano) | Juros do mês sobre o saldo, aporte no fim do mês, resultado bruto (o imposto de renda é tabela oficial). Acima de R$ 10 trilhões, o resultado é o erro "grande demais" (§ 225). | 173 |
| Alugar ou comprar | valor do imóvel, aluguel, entrada, anos | sistema (SAC), juros ao ano, prazo, ITBI e cartório (% do valor), IPTU, manutenção, valorização, custo de venda, reajuste do aluguel, rendimento | O motor inglês: quem gasta menos no mês investe a diferença; o inquilino começa com entrada, ITBI e cartório investidos; valor e aluguel mudam uma vez por ano. Sem imposto. | 110 |

**Os exemplos oficiais** (`fixtures/calc/OFICIAIS.md`, seção Brasil): entraram o Boletim Consumo e Finanças nº 8 (BCB e Senacon; R$ 1.000 a 12% ao ano em 5 parcelas de R$ 205,73, tarifa de R$ 50 e IOF de R$ 10 à vista: CET de 43,93% ao ano e 3,08% ao mês) e a IN BCB 83/2021 (R$ 1.000 + R$ 80 financiados a 1% ao mês: 24 × R$ 50,84 e R$ 1.080 financiados), os dois no `OFFICIAL_CHECKS`. Ficaram de fora, com o motivo no arquivo: o total de R$ 1.220,16 da IN 83 (a tabela multiplica a parcela por 24; pela regra da última parcela o total dá R$ 1.220,14), o CET de 120,10% do Guia de Excelência (custos não revelados), as simulações da Calculadora do Cidadão (o resultado só sai enviando o formulário, o que a run não faz), e o SAC, a PRICE e o teto do cartão com números (nenhuma fonte oficial lida publica um).

**As fontes de cada página** (lidas em 1º/nov/2026):

- **SAC × PRICE:** [Nota Técnica BCB nº 56 (out/2025)](https://www.bcb.gov.br/content/publicacoes/notastecnicas/NT_56_202510.pdf); [Res. CMN nº 4.624/2018, a TR (com a 5.124/2024)](https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50511/Res_4624_v1_O.pdf); [Calculadora do Cidadão, prestações fixas](https://www3.bcb.gov.br/CALCIDADAO/publico/exibirMetodologiaFinanciamentoPrestacoesFixas.do?method=exibirMetodologiaFinanciamentoPrestacoesFixas).
- **Veículo e empréstimo:** [Res. CMN nº 4.881/2020, o CET](https://www.bcb.gov.br/content/estabilidadefinanceira/especialnor/Resolu%C3%A7%C3%A3o4881.pdf); [IN BCB nº 83/2021](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Instru%C3%A7%C3%A3o%20Normativa%20BCB&numero=83); [Decreto nº 6.306/2007, o IOF](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm).
- **Amortização antecipada:** [Res. CMN nº 5.004/2022](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5004); [Res. CMN nº 3.516/2007](https://www.bcb.gov.br/pre/normativos/res/2007/pdf/res_3516_v2_l.pdf); [CDC, art. 52, § 2º](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm).
- **Cartão:** [Res. CMN nº 4.549/2017 consolidada (com a 5.112/2023)](https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50330/Res_4549_v2_L.pdf); [Lei nº 14.690/2023, art. 28](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14690.htm).
- **Dívidas:** a Res. CMN nº 5.004/2022, arts. 6 e 7, e a Res. CMN nº 4.549/2017.
- **Juros compostos e alugar ou comprar:** a Calculadora do Cidadão, a Nota Técnica nº 56 e a Res. CMN nº 5.004/2022, art. 3.

O CSV de pt sai com ponto e vírgula, vírgula decimal e BOM, e o PDF em A4 com "Página N de M" (§ 221 e § 222); o `money-calc.spec.ts` lê os dois de volta, baixados da página, contra o oráculo.

## As 5 em espanhol

A mesma definição, o mesmo motor, as mesmas fixtures e o mesmo exemplo inicial do inglês. O `tests/unit/calc-i18n.test.ts` compara as views en e es: cada valor e cada taxa iguais, caractere a caractere, menos o espaço fino antes do "%" no espanhol ("15.09 %", decisão 1), e as mesmas linhas da tabela ao centavo. O CSV tem a forma do inglês (vírgula e ponto decimal) e o PDF é Carta. As fontes são os PDFs em espanhol do CFPB que seguem no ar e, onde não há, a página em inglês com "(en inglés)" (§ 224: o CFPB tirou do ar o `consumerfinance.gov/es/`).

## O Pix

- **Os quatro códigos** (`fixtures/pix.json`, do oráculo; chave aleatória do `docs/F0-SAIDA.md`, "VICTOR YUKI MATUSITA", "CURITIBA"):
  - qualquer valor: `…6304` + `1A96`;
  - R$ 5,00: `…6304` + `24F8`;
  - R$ 10,00: `…6304` + `D23E`;
  - R$ 20,00: `…6304` + `5E5A`.
- **O manual:** o oráculo e o gerador reproduzem o exemplo estático do manual do BR Code (`…63041D3D`), com o CRC16-CCITT-FALSE (0x1021, início 0xFFFF).
- **O QR:** o `qrcode` (nível M, versão 7, 45 × 45 módulos, zona de silêncio de 4) desenha o SVG no build, em `currentColor` sobre `#FFFFFF`. O `tests/unit/pix-qr.test.ts` rasteriza cada SVG do `dist/` com o `@resvg/resvg-js` e lê com o `jsqr`: os quatro devolvem o código do JSON.
- **A `/pt/apoie/`** mostra "Um café no Pix" com o grupo Qualquer valor, R$ 5, R$ 10 e R$ 20 (trocado só por CSS), o QR, o "copia e cola" com "Copiar código", "Em nome de Victor Yuki Matusita" e a nota da devolução. O Ko-fi continua ("Apoiar no Ko-fi"). O `money-pix.spec.ts`, nos dois navegadores, confere cada valor, a cópia exata do código e nenhuma requisição.
- **A linha do café em português** é "Pagar um café no Pix" e leva a `/pt/apoie/#pix`; o rodapé diz "Curtiu? Me paga um café". O `donate_click` ganhou o lugar `pix` na lista fechada (§ 216).

## Os testes novos e o que eles dizem

- **`tests/unit/english-leak.test.ts` e `tests/unit/glossary.test.ts`** (§ 232), com o Vitest em modo detalhado sobre o `dist/` do commit final (no `verificar` eles entram no passo do Vitest):

```
$ pnpm exec vitest run tests/unit/english-leak.test.ts tests/unit/glossary.test.ts --reporter=verbose
 RUN  v5.0.5 C:/Users/vmatusita/projetos/fileorca
 ✓ tests/unit/glossary.test.ts > the "Nunca" tables of the glossaries > finds the terms of each glossary, the known ones among them (so an empty or broken table cannot pass) 2ms
 ✓ tests/unit/glossary.test.ts > the "Nunca" tables of the glossaries > reads only the table under "## Nunca": the header, the rule and the other sections are left out 0ms
 ✓ tests/unit/glossary.test.ts > the matcher (controls) > catches every term of each glossary, in any case, inside a sentence and across a line break (positive control) 49ms
 ✓ tests/unit/glossary.test.ts > the matcher (controls) > lets the near misses and the words that only hold a term pass (negative control) 0ms
 ✓ tests/unit/glossary.test.ts > the pt texts follow docs/i18n/pt.md > has no "Nunca" term in a text file of pt (src/i18n/pt/*.ts and src/tools/**/i18n/pt.ts) 6ms
 ✓ tests/unit/glossary.test.ts > the pt texts follow docs/i18n/pt.md > has no "Nunca" term on a page of pt in dist/ 248ms
 ✓ tests/unit/english-leak.test.ts > the English phrases the pages are compared with > reads the English text files: thousands of phrases, the known ones among them, and none made of names and form...
 ✓ tests/unit/english-leak.test.ts > the English phrases the pages are compared with > cuts at placeholders, URLs, e-mails and the end of a sentence, and keeps the pieces of 4 words, or of 3 words ...
 ✓ tests/unit/english-leak.test.ts > the detector, on pages made here (controls) > catches an English sentence put in the visible text of a Portuguese page (positive control) 20ms
 ✓ tests/unit/english-leak.test.ts > the detector, on pages made here (controls) > catches an English line in the data-props of the island, at any depth (positive control) 1ms
 ✓ tests/unit/english-leak.test.ts > the detector, on pages made here (controls) > catches an English title, an English aria-label and a glued neighbour (positive controls) 1ms
 ✓ tests/unit/english-leak.test.ts > the detector, on pages made here (controls) > leaves out the license texts of the Licenses page only, and nothing around them 3ms
 ✓ tests/unit/english-leak.test.ts > the detector, on pages made here (controls) > passes a Portuguese page made only of names, formats, numbers, links and Portuguese (negative control) 1ms
 ✓ tests/unit/english-leak.test.ts > no English phrase on the pages of Portuguese and Spanish in dist/ (prompt F6, decision 4) > reads every page of pt and es of the route map from dist/ 4ms
 ✓ tests/unit/english-leak.test.ts > no English phrase on the pages of Portuguese and Spanish in dist/ (prompt F6, decision 4) > has no English phrase in the visible text or the data-props of a pag...
 ✓ tests/unit/glossary.test.ts > the es texts follow docs/i18n/es.md > has no "Nunca" term in a text file of es (src/i18n/es/*.ts and src/tools/**/i18n/es.ts) 4ms
 ✓ tests/unit/glossary.test.ts > the es texts follow docs/i18n/es.md > has no "Nunca" term on a page of es in dist/ 131ms
 ✓ tests/unit/english-leak.test.ts > no English phrase on the pages of Portuguese and Spanish in dist/ (prompt F6, decision 4) > has no English phrase in the visible text or the data-props of a pag...
 Test Files  2 passed (2)
      Tests  18 passed (18)
   Start at  02:18:45
   Duration  1.52s (transform 49%, tests 34%, import 17%)
```

- **`tests/e2e/tool-i18n.spec.ts`** (§ 233): as 11 páginas de imagem e as 12 de PDF em pt e es, com um arquivo de verdade cada, e as ZIPs e páginas da Dividir PDF e da PDF para JPG; 49 testes por navegador, verdes no Chromium e no WebKit (na parte 3 do Chromium e na 7 do WebKit).
- **Os `money-*`:** o `money-privacy.spec.ts` com as 5 de es e as 8 brasileiras (32 testes por navegador); o `money-speed.spec.ts` com SAC × PRICE, SAC × PRICE com TR em 420 meses (o caso que a revisão achou acima do limite, § 244), veículo e alugar ou comprar (p95 de 2,2 ms, 2,4 ms, 0,6 ms e 0,9 ms por tecla no Chromium, contra o limite de 16 ms); o `money-calc.spec.ts` com o CSV e o PDF baixados em es e em pt, contra os oráculos, e, depois da revisão, o número do ResultHero numa linha e os valores do exemplo inteiros nas 31 calculadoras, e a dica do separador decimal; o `money-pix.spec.ts` com os quatro valores do Pix, nos dois navegadores.
- **O `a11y.spec.ts`** leu as 145 páginas a 360 e 1280 px nos dois temas, mais 49 estados novos de pt e es (o resultado de cada ferramenta de imagem, o passeio de cada ferramenta de PDF, uma calculadora de cada idioma e o Pix). O **`ads.spec.ts`** mediu as distâncias nas mesmas páginas e estados em pt e es e o número do ResultHero acima da dobra a 360 × 740 nas 13 calculadoras de pt e es. O **`budgets.spec.ts`** e o **`i18n-budgets.spec.ts`** estão na seção do orçamento.
- **`tests/unit/calc-i18n.test.ts`:** as 5 de es com os números do inglês, o CSV de pt com os centavos do oráculo e o tamanho do PDF em cada idioma (16 testes).

## Os glossários

Os arquivos são a fonte: `docs/i18n/pt.md` e `docs/i18n/es.md` (§ 224). Em resumo:

- **Registro.** Português do Brasil com "você", informal e caloroso; espanhol neutro com "tú", para o público hispano dos EUA. Sentence case, botão com verbo no infinitivo e sem ponto, uma exclamação só no sucesso ("Prontinho!", "¡Listo!"), a Oli em terceira pessoa, erro que diz o que houve e o que fazer.
- **Formato** (§ 213 e § 223). pt: "1.234,56", "R$ 1.234,56", "68%", "2,4 MB", "1 de novembro de 2026". es: "1,234.56", "$1,234.56", "68 %" com espaço fino, "2.4 MB", "1 de noviembre de 2026".
- **Arquivos, ferramentas e opções.** Cada termo da interface, com o nome das 23 ferramentas e das opções, e o nome do arquivo baixado: em pt, `-juntado`, `-dividido`, `-pagina-N`, `-parte-N`, `-selecionadas`, `-comprimido`, `-girado`, `-organizado`, `-numerado`, `-marca-dagua`, `-assinado`, `-protegido`, `-desbloqueado`, `fileorca-imagens.zip`; em es, `-unido`, `-pagina-N`, `-parte-N`, `-seleccionadas`, `-rotado`, `-ordenado`, `-marca-de-agua`, `-firmado`, `fileorca-imagenes.zip` e o resto (§ 219).
- **Dinheiro.** Em pt, os termos das 8 brasileiras (taxa efetiva ao mês e ao ano, CET, IOF, TR, SAC e PRICE, rotativo e parcelamento, saldo devedor, amortização), com os nomes dos arquivos CSV e PDF; em es, os termos do CFPB em espanhol (pago mensual, tasa de interés, APR, pago inicial).
- **A lista "Nunca"** (17 termos em pt, 15 em es), que o `tests/unit/glossary.test.ts` lê e procura nos textos e nas páginas: em pt, "ficheiro", "ecrã", "telemóvel", "descarregar", "utilizador", "palavra-passe", "fazer upload", "fazer o download", "deletar", "printar", "clique aqui", "vocês", "hipoteca", "taxa de hoje", "taxa do dia", "juros de hoje"; em es, "ordenador", "móvil", "vosotros", "vuestro", "usted", "fichero", "pinchar", "enganche", "tasa de porcentaje anual", "cuota mensual", "mensualidad", "tasa de hoy".

## Orçamento

**As páginas de pt e es** cabem no orçamento (80 KB de JS inicial em gzip, com o inline; 8 requisições; 3 novas na página seguinte) com o número de arquivos JS do par em inglês, e o `i18n-budgets.spec.ts` prova que cada uma carrega **exatamente os mesmos arquivos JS, nome e hash,** da página em inglês: as 22 de imagem, as 24 de PDF, as 5 de es (as do inglês), as 8 brasileiras (as das calculadoras em inglês), os 6 hubs e as 2 páginas de apoio (as de `/support/`). Os números de cada página estão na tabela das páginas, acima. A `/pt/apoie/` tem 3,2 KB de JS inicial (só inline: o tema, o consentimento e o script do Pix) e 4 requisições.

**As páginas em inglês, antes e depois** (antes: o `budgets.spec.ts` do CI da F5b, run 41373965430, Chromium; depois: o desta run, Chromium; os mesmos arquivos e as mesmas requisições):

| Páginas | Antes (F5b) | Depois (F6) | Arquivos JS | Requisições |
| --- | ---: | ---: | --- | --- |
| `/png-to-jpg/` | 20,7 KB | 20,9 KB | 2 → 2 | 6 → 6 |
| `/compress-image/to-100kb/`, `/compress-image/to-1mb/` | 20,8 KB | 20,9 KB | 2 → 2 | 6 → 6 |
| `/guides/jpg-vs-png/`, `/heic-to-jpg/`, `/image-to-pdf/` e mais 2 | 20,8 KB | 21,0 KB | 2 → 2 | 6 → 6 |
| `/guides/open-webp-save-as-jpg/`, `/guides/photos-to-one-pdf/`, `/rotate-image/` | 20,9 KB | 21,0 KB | 2 → 2 | 6 → 6 |
| `/compress-image/`, `/guides/heic-to-jpg-on-windows/` | 20,9 KB | 21,1 KB | 2 → 2 | 6 → 6 |
| `/resize-image/` | 21,2 KB | 21,3 KB | 2 → 2 | 6 → 6 |
| `/guides/social-media-image-sizes/` | 21,3 KB | 21,4 KB | 2 → 2 | 6 → 6 |
| `/guides/remove-location-from-photos/` | 21,3 KB | 21,5 KB | 2 → 2 | 6 → 6 |
| `/crop-image/` | 23,1 KB | 23,3 KB | 2 → 2 | 6 → 6 |
| `/image-tools/` | 3,3 KB | 3,3 KB | 0 → 0 | 4 → 4 |
| `/pdf-tools/` | 3,4 KB | 3,4 KB | 0 → 0 | 4 → 4 |
| `/money-calculators/` | 3,6 KB | 3,6 KB | 0 → 0 | 4 → 4 |
| `/merge-pdf/`, `/reorder-pdf-pages/`, `/sign-pdf/` e mais 1 | 36,7 KB | 36,8 KB | 2 → 2 | 6 → 6 |
| `/add-page-numbers-to-pdf/`, `/compress-pdf/`, `/delete-pdf-pages/` e mais 5 | 36,7 KB | 36,9 KB | 2 → 2 | 6 → 6 |
| `/guides/combine-pdfs-on-phone/`, `/guides/split-pdf-file-size/` | 36,8 KB | 36,9 KB | 2 → 2 | 6 → 6 |
| `/guides/pdf-to-jpg-resolution/`, `/guides/why-is-my-pdf-so-large/` | 36,8 KB | 37,0 KB | 2 → 2 | 6 → 6 |
| `/debt-payoff-calculator/`, `/guides/15-vs-30-year-mortgage/`, `/guides/debt-snowball-vs-avalanche/` e mais 5 | 38,5 KB | 42,7 KB | 2 → 2 | 6 → 6 |
| `/apr-to-apy-calculator/`, `/auto-loan-calculator/`, `/compound-interest-calculator/` e mais 12 | 38,5 KB | 42,8 KB | 2 → 2 | 6 → 6 |

As de imagem e de PDF cresceram de 0,1 a 0,2 KB (os nomes de arquivo e os números que passaram a vir dos textos de cada idioma, no `format.ts` e no painel). As calculadoras cresceram 4,2 a 4,3 KB, porque as definições e os motores brasileiros estão no arquivo comum das calculadoras (§ 236): separá-los criaria um terceiro arquivo JS por página.

## Lighthouse

No celular, mediana de 3 execuções, na parte `--sem-playwright` do `verificar` local no código final (commit `a6ed5c5`, com as duas passadas da revisão). O `lighthouserc.json` ganhou `/pt/simulador-sac-price/` e `/pt/apoie/` (decisão 9).

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS | Na F5b |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/compress-image/` | 100 | 100 | 100 | 100 | 1,65 s | 0,001 | 100, 1,65 s, 0,001 |
| `/image-tools/` | 100 | 100 | 100 | 100 | 1,35 s | 0,000 | 100, 1,35 s, 0,000 |
| `/mortgage-calculator/` | 99 | 100 | 100 | 100 | 1,88 s | 0,001 | 99, 1,89 s, 0,001 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 100 | 100 | 100 | 1,82 s | 0,000 | 99, 1,82 s, 0,000 |
| `/compress-pdf/` | 99 | 100 | 100 | 100 | 1,82 s | 0,000 | 99, 1,80 s, 0,000 |
| `/pdf-tools/` | 100 | 100 | 100 | 100 | 1,35 s | 0,014 | 100, 1,35 s, 0,000 |
| `/guides/why-is-my-pdf-so-large/` | 99 | 100 | 100 | 100 | 1,80 s | 0,005 | 99, 1,89 s, 0,005 |
| `/pt/simulador-sac-price/` (nova) | 99 | 100 | 100 | 100 | 1,88 s | 0,001 | — |
| `/pt/apoie/` (nova) | 100 | 100 | 100 | 100 | 1,50 s | 0,000 | — |

- **As duas novas** passam no critério (desempenho de 90 ou mais e CLS de até 0,05). O SAC × PRICE tinha dado CLS de 0,0502 no `verificar` inteiro, pela frase do ResultHero que requebrava quando o Figtree chegava; com a frase nova, de 0,000 a 0,001 (§ 241).
- **As sete que já estavam** ficaram com as mesmas notas de desempenho da F5b. O CLS da `/pdf-tools/` deu 0,014 nesta mediana: as execuções dela alternam entre 0,000 e 0,014 (um bloco do hub que se move quando a fonte chega), também nas execuções de antes da revisão desta run, abaixo do limite de 0,05. Nas partes de antes da revisão, a `/compress-image/` tinha dado 99 (LCP de 1,74 s), e no `verificar` inteiro, 100: variação de uma execução para outra.

## Screenshots

- **Onde:** `pnpm screenshots` grava em `docs/relatorios/fase-06/componentes/` (290 PNG), sobre o `dist/` do commit `a6ed5c5`, o último com mudança visual, nos temas claro e escuro. As pastas das fases anteriores ficaram como estavam.
- **O que a F6 acrescentou** (38 PNG, a 360 e a 1280 px, nos dois temas):
  - uma ferramenta de imagem com o resultado, em pt e em es (`i18n-image-pt-*`, `i18n-image-es-*`);
  - uma ferramenta de PDF com o resultado, em pt e em es (`i18n-pdf-merge-pt-*`, `i18n-pdf-merge-es-*`);
  - calculadoras em pt e em es: o SAC × PRICE, a do cartão de crédito e o hub brasileiro (`i18n-sac-price-pt-*`, `i18n-card-pt-*`, `i18n-hub-pt-*`), e a hipoteca em espanhol (`i18n-mortgage-es-*`);
  - a `/pt/apoie/` inteira (`i18n-support-pt-*`) e o bloco do Pix sozinho a 360 px (`pix-light-360`, `pix-dark-360`).
- **O resto** são as capturas das fases anteriores, refeitas sobre o `dist/` de agora (os componentes, as páginas de imagem, de PDF, de dinheiro e os guias, em inglês).

## CI

**A divisão do `ci.yml` não mudou** (as 11 partes da F5a: o `verificar --sem-playwright`, o Chromium em 3 e o WebKit em 7), e o `.github/` ficou como estava.

**Onde o `--list` pôs os specs** (contagem de testes de cada spec em cada parte, no commit final):

| Parte | Specs (testes) |
| --- | --- |
| chromium 1 de 3 | a11y 228, ads 118 |
| chromium 2 de 3 | ads 15, budgets 95, coffee 14, consent-choice 6, consent 8, cookie-footer 6, design 50, engine-paths 7, events 15, i18n-budgets 130 |
| chromium 3 de 3 | i18n-budgets 9, image-batch 6, image-crop 2, image-matrix 18, image-presets 3, image-privacy 5, image-smoke 11, island 10, launch-claims 8, money-calc 34, money-pix 2, money-privacy 32, money-speed 7, navigation 11, pdf-hardening 5, pdf-matrix 51, pdf-privacy 22, pdf-speed 4, pdf-tool 26, tool-guides 21, tool-i18n 49, tool 10 |
| webkit 1 de 7 | a11y 149 |
| webkit 2 de 7 | a11y 79, ads 70 |
| webkit 3 de 7 | ads 63, budgets 85 |
| webkit 4 de 7 | budgets 10, coffee 14, consent-choice 6, consent 8, cookie-footer 6, **design 50**, engine-paths 7, events 15, i18n-budgets 32 |
| webkit 5 de 7 | i18n-budgets 107, image-batch 6, image-crop 2, **image-matrix 18**, image-presets 3, image-privacy 5, image-smoke 7 |
| webkit 6 de 7 | image-smoke 4, island 10, launch-claims 8, money-calc 34, money-pix 2, money-privacy 32, money-speed 7, navigation 11, pdf-hardening 5, pdf-matrix 35 |
| webkit 7 de 7 | pdf-matrix 16, pdf-privacy 22, pdf-speed 4, pdf-tool 26, tool-guides 21, tool-i18n 49, tool 10 |

O `design.spec.ts` ficou inteiro na parte 4 do WebKit e a matriz de imagens na 5 (§ 108 e § 142). Com os testes de orçamento de pt e es dentro do `budgets.spec.ts`, os dois tinham caído juntos na parte 5; o arquivo `i18n-budgets.spec.ts`, que cai entre eles na ordem dos nomes, resolveu (§ 233).

**A estimativa antes do push** (`.cache/ci-estimate.ts`: o tempo de cada teste do CI da F5b, o do par em inglês para um teste novo, e o ajuste total ≈ 9 s + 0,533 × soma dos testes, tirado das 10 partes do Playwright da F5b):

| Parte | Testes (novos) | Estimativa |
| --- | ---: | ---: |
| chromium 1 de 3 | 346 (168) | 680 s |
| chromium 2 de 3 | 346 (133) | 300 s |
| chromium 3 de 3 | 346 (79) | 637 s |
| webkit 1 de 7 | 149 (63) | 346 s |
| webkit 2 de 7 | 149 (71) | 538 s |
| webkit 3 de 7 | 148 (37) | 286 s |
| webkit 4 de 7 | 148 (32) | 191 s |
| webkit 5 de 7 | 148 (107) | 325 s |
| webkit 6 de 7 | 148 (21) | 483 s |
| webkit 7 de 7 | 148 (50) | 642 s |

**A execução do CI** ([run 41397565308](https://github.com/vmatusita/fileorca/actions/runs/41397565308), commit `520296c`, a primeira da PR): as 11 partes verdes de primeira, sem rerun. O total do `verificar` de cada parte, contra a F5b ([run 41373965430](https://github.com/vmatusita/fileorca/actions/runs/41373965430)):

| Parte | Comando | Testes | F5b | F6 (estimativa) | F6 (CI) |
| --- | --- | --- | ---: | ---: | ---: |
| `verificar` | `pnpm verificar --sem-playwright` | tipos, lint, build, Vitest (1.330), os portões, o Lighthouse das 9 URLs e o `lint:texto` | 533,2 s | — | 669,9 s |
| `playwright (chromium 1 de 3)` | `--playwright=chromium --shard=1/3` | 346 passed | 374,0 s | 680 s | **764,0 s** |
| `playwright (chromium 2 de 3)` | `--playwright=chromium --shard=2/3` | 346 passed | 323,5 s | 300 s | 334,0 s |
| `playwright (chromium 3 de 3)` | `--playwright=chromium --shard=3/3` | 346 passed | 363,9 s | 637 s | **710,6 s** |
| `playwright (webkit 1 de 7)` | `--playwright=webkit --shard=1/7` | 149 passed | 227,4 s | 346 s | 573,8 s |
| `playwright (webkit 2 de 7)` | `--playwright=webkit --shard=2/7` | 149 passed | 329,4 s | 538 s | 674,7 s |
| `playwright (webkit 3 de 7)` | `--playwright=webkit --shard=3/7` | 148 passed | 109,1 s | 286 s | 363,6 s |
| `playwright (webkit 4 de 7)` | `--playwright=webkit --shard=4/7` | 148 passed | 135,8 s | 191 s | 238,7 s |
| `playwright (webkit 5 de 7)` | `--playwright=webkit --shard=5/7` | 148 passed | 313,3 s | 325 s | 533,3 s |
| `playwright (webkit 6 de 7)` | `--playwright=webkit --shard=6/7` | 148 passed | 400,1 s | 483 s | 674,8 s |
| `playwright (webkit 7 de 7)` | `--playwright=webkit --shard=7/7` | 148 passed | 399,3 s | 642 s | 617,7 s |

- **Duas partes passaram do alvo de 700 s,** abaixo do limite de 900 s: a 1 e a 3 do Chromium. Pela decisão 11, o `.github/` não mudou; a medida e a proposta (o Chromium em 4 partes, numa run de ajuste) estão na § 243. A estimativa errou para menos em quase todas as partes: os testes novos de pt e es custaram mais que o par em inglês no runner.
- **Minutos de runner:** a soma dos jobs desta execução é 7.031 s, uns 117 min por push. Na F5b eram uns 79 min.
- **Disco:** toda parte do Playwright terminou com "No coredumps found.", e nenhuma deu `ENOSPC`.
- **O `merge`** rodou e não mesclou, porque a PR estava em rascunho.

**A execução final** ([run 41410030945](https://github.com/vmatusita/fileorca/actions/runs/41410030945), commit `a6ed5c5`, o código da PR depois das duas passadas da revisão, com os testes novos delas): as 11 partes verdes de primeira, sem rerun. É a execução que este relatório cita como o CI verde no rascunho.

| Parte | Testes | F6 (primeira, `520296c`) | F6 (final, `a6ed5c5`) |
| --- | --- | ---: | ---: |
| `verificar` | tipos, lint, build, Vitest (1.342), os portões, o Lighthouse das 9 URLs e o `lint:texto` | 669,9 s | 583,6 s |
| `playwright (chromium 1 de 3)` | 349 passed | 764,0 s | 663,0 s |
| `playwright (chromium 2 de 3)` | 349 passed | 334,0 s | 349,4 s |
| `playwright (chromium 3 de 3)` | 348 passed | 710,6 s | **727,3 s** |
| `playwright (webkit 1 de 7)` | 150 passed | 573,8 s | 553,7 s |
| `playwright (webkit 2 de 7)` | 150 passed | 674,7 s | 510,3 s |
| `playwright (webkit 3 de 7)` | 150 passed | 363,6 s | 271,4 s |
| `playwright (webkit 4 de 7)` | 149 passed | 238,7 s | 308,7 s |
| `playwright (webkit 5 de 7)` | 149 passed | 533,3 s | 544,8 s |
| `playwright (webkit 6 de 7)` | 149 passed | 674,8 s | 697,6 s |
| `playwright (webkit 7 de 7)` | 149 passed | 617,7 s | 580,1 s |

- **Uma parte passou do alvo de 700 s,** abaixo do limite de 900 s: a 3 do Chromium, com 727,3 s. A 6 do WebKit ficou a 2,4 s do alvo. A § 243 vale como está: o Chromium em 4 partes, numa run de ajuste, sem mudar o `.github/` nesta.
- **A divisão do WebKit** ficou como na primeira execução: o `design.spec.ts` inteiro na parte 4 (50 testes) e a matriz de imagens na 5 (18 testes).
- **Minutos de runner:** a soma dos jobs é 6.595 s, uns 110 min por push.
- **Disco:** as 11 partes terminaram com "No coredumps found.", e nenhuma deu `ENOSPC`. A busca funda do `disco.ts` rodou uma vez, na parte 1 do Chromium, quando o `/` caiu para 8.655 MB livres, e a parte passou.
- **O `merge`** rodou e não mesclou, porque a PR estava em rascunho; o `pos-deploy` foi pulado.

## A revisão adversarial

O método da F3 (§ 92 a § 94), sobre o commit fixo `520296c`, numa worktree só de leitura (`.claude/worktrees/revisao-f6`, removida no fim): sete lentes Sonnet em contexto limpo, um cético por achado médio ou acima e um por lente para os baixos. O detalhe está em [`REVISAO-F6.md`](REVISAO-F6.md).

| Severidade | Lentes | Depois dos céticos | Corrigidos |
| --- | ---: | ---: | ---: |
| Crítico | 0 | 0 | — |
| Alto | 0 | 0 | — |
| Médio | 15 | 13 (10 defeitos) | 13 |
| Baixo | 22 | 18 | 4, e parte de um quinto |
| Refutado | — | 6 | — |

- **Corrigidos, cada um com um teste que reprova no `520296c` e um §:**
  - a PRICE com TR, que passava de 40 a 80 ms por tecla e agora fica em 2,4 ms (§ 244);
  - o bloco do Pix de 320 a 390 px, com o status que se apaga e a cópia que pode falhar (§ 245);
  - o número do ResultHero, que partia no meio (§ 246);
  - os valores do exemplo resolvido, que partiam no meio, também em inglês (§ 247);
  - a Assinar PDF em pt, que rolava de lado a 320 px (§ 248);
  - a amortização antecipada no SAC, que mostrava economia, até negativa, com R$ 0 antecipado, e dizia "nenhum tempo antes" (§ 249, com o oráculo mudado antes do motor, no `807e14c`);
  - as licenças em inglês sem `lang="en"` (§ 250);
  - o erro do separador decimal (§ 251);
  - a parcela do SAC sem os seguros no cronograma (§ 252).
- **Os baixos que ficaram** estão listados no `REVISAO-F6.md` e na lista do Victor: plural e preposição em alguns resultados ("1 anos", "nos 1 ano"), espaço comum antes de KB, MB e R$ nos textos fixos, a taxa sem "ao mês" no PDF e no exemplo, siglas sem a forma por extenso, decalques do inglês ("a Comprimir imagem recebe"), "1 arquivos", resquícios de inglês no espanhol ("Regulation Z"), o IOF do cartão igual nos dois caminhos e a frase da PRICE com TR.
- **A segunda passada** leu o diff das correções e achou 3 médios e 4 baixos nelas (o número do ResultHero que encolhia à toa em inglês, o PDF do SAC × PRICE com colunas sobrepostas, a dica decimal em campos inteiros, e quatro menores). Todos foram corrigidos, com teste e § (§ 253 a § 256).

## `pnpm verificar` local

**O todo, numa execução limpa** (`CI=true pnpm install --frozen-lockfile`, depois `pnpm verificar`, que builda do zero), no commit `4174e5a` com a descrição de `/es/dividir-pdf/` já corrigida (a primeira execução parou no `gate:seo` aos 71,6 s: a descrição tinha 164 caracteres, de um limite de 160):

```
Resumo do pnpm verificar (tudo)
  ok       9.8 s  tipos (astro check)
  ok       4.1 s  lint (eslint)
  ok      25.1 s  build (astro build do zero)
  ok      31.8 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.7 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.8 s  links internos e páginas órfãs
  ok       1.2 s  conteúdo mínimo das ferramentas e do site
  ok      51.0 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.2 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.1 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok     717.3 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  FALHA  318.5 s  lighthouse ci
  total 1169.4 s (limite 900 s)
  FALHA: o verificar passou de 15 minutos.
```

- **O Playwright** deu `2076 passed (11.9m)`: os 1.038 testes de cada navegador, juntos.
- **O Lighthouse** achou CLS de 0,0502 no `/pt/simulador-sac-price/`. A causa e a correção estão na § 241, e o Lighthouse das partes, abaixo, já roda com ela.
- **O todo passa dos 900 s só pelo tamanho da suíte:** 717 s de Playwright mais 318 s de Lighthouse já dão 1.035 s. Por isso, como a ficha pede, as mesmas 11 partes do CI rodaram em sequência, cada uma com o limite de 900 s (o resumo de cada uma está abaixo). A medida e a proposta estão na § 242: o limite não muda, e o CI já roda em partes desde a ADR-003.

**As 11 partes do CI, em sequência,** no commit `cc1d9f9` (com a frase nova do SAC × PRICE; o código depois dele mudou só pela revisão, e o Playwright inteiro rodou de novo sobre as correções, abaixo):

```
sem-playwright: total 473.9 s (limite 900 s), 1330 passed (1330)
chromium-1: total 132.0 s (limite 900 s), 346 passed (1.8m)
chromium-2: total 105.1 s (limite 900 s), 346 passed (1.3m)
chromium-3: total 123.6 s (limite 900 s), 346 passed (1.6m)
webkit-1: total 77.8 s (limite 900 s), 149 passed (52.7s)
webkit-2: total 112.7 s (limite 900 s), 149 passed (1.5m)
webkit-3: total 83.4 s (limite 900 s), 148 passed (58.3s)
webkit-4: total 65.0 s (limite 900 s), 148 passed (40.3s)
webkit-5: total 93.2 s (limite 900 s), 148 passed (1.1m)
webkit-6: total 105.0 s (limite 900 s), 148 passed (1.3m)
webkit-7: total 93.5 s (limite 900 s), 148 passed (1.1m)
```

O resumo da parte `--sem-playwright`:

```
Resumo do pnpm verificar (sem o Playwright)
  ok       9.7 s  tipos (astro check)
  ok       3.9 s  lint (eslint)
  ok      24.9 s  build (astro build do zero)
  ok      31.7 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.7 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.7 s  links internos e páginas órfãs
  ok       1.1 s  conteúdo mínimo das ferramentas e do site
  ok      49.9 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.2 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.0 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok     316.5 s  lighthouse ci
  ok      25.8 s  lint:texto (LanguageTool)
  total 473.9 s (limite 900 s)
```

Depois da primeira leva de correções da revisão (commit `8b74716`), o Playwright inteiro deu `1045 passed` no Chromium (4,8 min) e no WebKit (7,6 min).

**Depois das duas passadas da revisão**, no código final (commit `a6ed5c5`), o `verificar` rodou de novo em três partes, cada uma no limite de 900 s (o todo, de novo, passaria dele pelo tamanho da suíte, § 242):

```
Resumo do pnpm verificar (sem o Playwright)
  ok       9.7 s  tipos (astro check)
  ok       3.8 s  lint (eslint)
  ok      24.4 s  build (astro build do zero)
  ok      32.4 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.7 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.8 s  links internos e páginas órfãs
  ok       1.1 s  conteúdo mínimo das ferramentas e do site
  ok      51.4 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.3 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.4 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok     317.4 s  lighthouse ci
  ok      25.5 s  lint:texto (LanguageTool)
  total 476.8 s (limite 900 s)

pnpm verificar --playwright=chromium: 1046 passed (4.7m), total 308.0 s (limite 900 s)
pnpm verificar --playwright=webkit: 1046 passed (7.3m), total 460.9 s (limite 900 s)
```

## Prévia

[https://fase-06-fileorca.vmatusita.workers.dev](https://fase-06-fileorca.vmatusita.workers.dev).

O que eu conferi nela no commit `520296c` (o da revisão), com uma sonda do Playwright (`.cache/previa-f6.ts`: Chromium, os domínios do Google bloqueados por `context.route`, o consentimento recusado), a 360 e a 1280 px, com um screenshot de página inteira de cada visita (em `.cache/previa/`, fora do repositório):

```
[prévia] build.txt: 520296c080d2d8f320afec54cdd49d6aa27b94f0 (o commit esperado)
[prévia] /pt/comprimir-imagem/ a 360: 200, lang pt-BR, H1 "Comprimir imagem", 2 arquivos JS no carregamento, "Prontinho! Suas 2 imagens ficaram 68% mais leves.", baixa fileorca-imagens.zip, 13 requisições, fora da regra: nenhuma
[prévia] /es/unir-pdf/ a 360: 200, lang es, H1 "Unir PDF", 2 arquivos JS no carregamento, "¡Listo! Oli juntó tus 2 PDF en uno solo.", baixa gen-paginas-mistas-unido.pdf, 9 requisições, fora da regra: nenhuma
[prévia] /pt/simulador-sac-price/ a 360: 200, lang pt-BR, H1 "Simulador SAC × PRICE", 2 arquivos JS no carregamento, ResultHero "Primeira parcela no SAC R$ 4.754,95 /mês No SAC a parcela vai de R$ 4.754,95 a R", número a 678 px do topo, 6 requisições, fora da regra: nenhuma
[prévia] /pt/apoie/ a 360: 200, lang pt-BR, H1 "Ferramentas grátis, feitas por uma pessoa só", 0 arquivos JS no carregamento, Pix: 4 códigos iguais aos do fixtures/pix.json, 4 QR, 4 requisições, fora da regra: nenhuma
[prévia] /pt/comprimir-imagem/ a 1280: 200, lang pt-BR, H1 "Comprimir imagem", 2 arquivos JS no carregamento, "Prontinho! Suas 2 imagens ficaram 68% mais leves.", baixa fileorca-imagens.zip, 13 requisições, fora da regra: nenhuma
[prévia] /es/unir-pdf/ a 1280: 200, lang es, H1 "Unir PDF", 2 arquivos JS no carregamento, "¡Listo! Oli juntó tus 2 PDF en uno solo.", baixa gen-paginas-mistas-unido.pdf, 9 requisições, fora da regra: nenhuma
[prévia] /pt/simulador-sac-price/ a 1280: 200, lang pt-BR, H1 "Simulador SAC × PRICE", 2 arquivos JS no carregamento, ResultHero "Primeira parcela no SAC R$ 4.754,95 /mês No SAC a parcela vai de R$ 4.754,95 a R", número a 452 px do topo, 6 requisições, fora da regra: nenhuma
[prévia] /pt/apoie/ a 1280: 200, lang pt-BR, H1 "Ferramentas grátis, feitas por uma pessoa só", 0 arquivos JS no carregamento, Pix: 4 códigos iguais aos do fixtures/pix.json, 4 QR, 4 requisições, fora da regra: nenhuma
```

- **Uma ferramenta de imagem em pt** (a Comprimir imagem, com duas fotos): a frase de sucesso em português e a ZIP `fileorca-imagens.zip`.
- **Uma de PDF em es** (a Unir PDF, com dois PDFs): a frase em espanhol e o arquivo `gen-paginas-mistas-unido.pdf`.
- **O simulador SAC × PRICE:** o número do ResultHero a 678 px do topo a 360 × 740, acima da dobra.
- **A `/pt/apoie/`:** os quatro códigos do Pix iguais aos do `fixtures/pix.json`, com os quatro QR.
- **"Fora da regra"** é toda requisição que não seja um GET para a própria origem, sem corpo e sem query string (os domínios do Google bloqueados ficam fora da conta): nenhuma.

**A prévia não chegou ao código final.** O Workers Builds não buildou os dois pushes da revisão (`8b74716` e `a6ed5c5`, enviados juntos): o `8b74716` não tem check do Cloudflare, e o check suite `cloudflare-workers-and-pages` do `a6ed5c5` ficou em `queued` desde as 08:01 UTC, sem nenhum check run, até a última leitura (08:18 UTC). Às 08:18 a prévia ainda servia o `520296c`. Não deduzi a causa (CLAUDE.md, "Ajuste da prévia"). O código depois do `520296c` mudou só pelas correções da revisão, que o CI final e o `verificar` local cobrem; a prévia de cada correção ficou sem sonda. Ver o build no painel é um passo do Victor, abaixo.

## Decisões novas

Do § 213 ao § 256 do `DECISOES.md`. As 11 decisões da ficha estão registradas assim: 1 (§ 213, § 214, § 222 e § 223), 2 (§ 218), 3 (§ 224 e § 232), 4 (§ 218 a § 220, § 232 e § 233), 5 (§ 221, § 222, § 225 e § 226), 6 (§ 222 e § 237), 7 (§ 238), 8 (§ 216 e § 217), 9 (§ 231 e § 233), 10 (§ 239) e 11 (§ 233).

- **§ 213 e § 214:** o espanhol escreve número como nos EUA, e o `og:locale` dele é `es_US`.
- **§ 215:** o sufixo "unlocked" não é a palavra proibida do `gate:design`.
- **§ 216 e § 217:** o Pix (oráculo, gerador, QR em SVG, a troca de valor só com CSS) e o lugar `pix` do `donate_click`.
- **§ 218 a § 220:** os caminhos por idioma, os tipos que exigem os textos de pt e es, o nome do arquivo baixado e as palavras da numeração de páginas vindos da página.
- **§ 221 e § 222:** o PDF do relatório de dinheiro em A4 no português (a terceira mudança no motor de PDF, que em inglês dá os mesmos bytes) e o CSV por idioma.
- **§ 223 e § 224:** as datas por extenso e no dia de Brasília; os glossários e a lista "Nunca".
- **§ 225 a § 229:** o oráculo brasileiro separado, as convenções das 8, o `lint:texto` com o dinheiro de pt e es, os testes das calculadoras e a dobra a 360 × 740.
- **§ 230 a § 233:** os testes que mudaram por construção, os portões que passaram a ler pt e es, o teste do glossário e o de vazamento, os testes de navegador novos e a divisão do CI.
- **§ 234 a § 236:** três ajustes de pt para caber a 320 px, a Imagem para PDF de volta à categoria Imagem da busca, e o código brasileiro no arquivo comum das calculadoras.
- **§ 237 a § 239:** as 5 em espanhol, as páginas comuns de pt e es e as traduções por agentes.
- **§ 240:** o painel de PDF não tira o foco de um campo em que a pessoa já digita.
- **§ 241 a § 243:** a frase do SAC × PRICE que quebra igual antes e depois da fonte (o CLS de 0,0502), o `verificar` local acima de 900 s e as partes que rodaram, e as duas partes do Chromium acima de 700 s no CI, com a proposta de 4 partes.
- **§ 244 a § 252:** as correções da revisão (a PRICE com TR em ponto fixo, o Pix, o número do ResultHero, o exemplo resolvido, a Assinar PDF a 320 px, a amortização antecipada no SAC, as licenças com `lang="en"`, a dica decimal e os seguros no cronograma).
- **§ 253 a § 256:** as correções da segunda passada (o número medido caractere a caractere, a dica só onde resolve, as colunas do PDF pelo texto e o saldo do ano na coluna certa).

## O que a válvula cortou

Nada. As três frentes que a ficha deixava cortar (o dinheiro em espanhol, o PDF em espanhol e a imagem em espanhol) estão nesta PR, e não há run 6b.

## O que é do Victor, em passos

1. **O merge.** O `.github/` não mudou, então o job de merge mescla a PR com o CI verde depois do `gh pr ready`: conferir o merge, o pós-deploy e o `build.txt` de produção, que a resposta final da run traz. A proposta de dividir o Chromium em 4 partes (§ 243) é para uma run de ajuste.
2. **O Pix.** Na `/pt/apoie/`, escanear com o app do banco o QR de cada um dos quatro valores (Qualquer valor, R$ 5, R$ 10 e R$ 20) e conferir o nome (Victor Yuki Matusita) e o valor, **sem pagar**. Depois, tocar em "Copiar código" e colar no Pix copia e cola do app.
3. **Ler o português no site:** as 8 calculadoras primeiro (`/pt/calculadoras-financeiras/`), depois imagem e PDF. Ajustes viram uma run curta de ajuste. A linha "Revisado por" das calculadoras leva o nome dele.
4. **No celular,** abrir uma ferramenta de imagem em espanhol (`/es/comprimir-imagen/`) e a calculadora de hipoteca em espanhol (`/es/calculadora-de-hipoteca/`).
5. **No Search Console,** pedir a indexação dos hubs de pt e es (`/pt/ferramentas-de-imagem/`, `/pt/ferramentas-pdf/`, `/pt/calculadoras-financeiras/`, `/es/herramientas-de-imagen/`, `/es/herramientas-pdf/`, `/es/calculadoras-financieras/`) e do `/pt/simulador-sac-price/`.
6. **Se for postar no Product Hunt depois do merge,** conferir as contagens do kit (`docs/lancamento/product-hunt.md`); o `launch-kit.test.ts` reprova se elas não baterem com os registros.
7. **As pendências que seguem abertas:** a 2b (§ 85), os baixos das revisões da F4, da F5a e da F5b, a § 103, o `docs/F0-SAIDA.md`, e os baixos desta revisão (no `REVISAO-F6.md`). A válvula não cortou nada, então não há 6b.
8. **As notas da lente de privacidade, sem prova e fora das regras escritas, para conferir:** com os anúncios ligados, se os pedidos do AdSense levam o `#` do link do cenário de uma calculadora (aba Rede); se o navegador oferece salvar a senha da Proteger e da Desbloquear PDF (os textos dizem que ela não fica guardada); se a lista de eventos da Privacidade deve citar a rolagem e o clique de saída da medição otimizada do GA4.
9. **O Workers Builds da `fase-06`.** No painel do Cloudflare, só para ler, ver por que o build do `a6ed5c5` ficou na fila sem começar (o check suite em `queued` desde as 08:01 UTC). O deploy da `main` passa pelo mesmo Workers Builds: se a fila seguir parada, o pós-deploy e o `build.txt` de produção mostram, e a resposta final da run traz os dois.
10. **Gerar o prompt da F7.**

## Nota para a F7

- **Casa e saúde ficam em inglês** (plano): as páginas novas entram só no mapa em inglês, e o teste de vazamento e o do glossário não as leem.
- **O `qrcode` passa a ir para o navegador** se uma página montar um QR no cliente: aí ele sai de `devDependencies` para `dependencies` (hoje o QR do Pix é montado no build e o pacote não entra no bundle).
- **A home e o rodapé de pt e es** leem as calculadoras do idioma de `HOME_MONEY_IDS` e `HUB_MONEY_IDS` (`src/tools/calc/registry.ts`): uma calculadora nova que só existe em inglês não entra neles, e a busca de pt e es não a mostra (o `navigation.spec.ts` prova que a busca nunca oferece a página em inglês).
- **O arquivo comum das calculadoras** já leva as 26 definições e os motores (42,8 KB, § 236). Muitas calculadoras novas pedem uma ADR para separar o código por região sem passar de 2 arquivos JS.
- **A divisão do CI:** o `i18n-budgets.spec.ts` foi nomeado para cair entre o `design.spec.ts` e a matriz de imagens; spec novo no começo da lista desloca essa fronteira. Rode o `--list` das 7 partes do WebKit antes do push.

## Nota para a F8

- **As páginas de pt e es no service worker:** o precache precisa das 63 páginas novas (e dos dados do PDF.js em `/_astro/pdfjs/`), e a página offline, de uma versão por idioma.
- **O que a revisão da F8 deve olhar no dinheiro brasileiro:** que nada do service worker guarde números digitados (o link do cenário leva os números depois do #, que o navegador não envia, mas um cache de navegação não pode gravar a URL com o #); que o CSV e o PDF, feitos no aparelho, sigam sem rede; e que a página offline não mostre calculadora sem o motor.
