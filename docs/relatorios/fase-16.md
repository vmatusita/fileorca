# F16 · relatório

A terceira das cinco runs do `PLANO-UX-QV.md` ("Calculadoras: digitar sem tropeço e exportar números de verdade"), com a ficha no plano (a ficha da F16, com o D13 e o D14) e o prompt em `docs/prompts/prompt-fase-16.txt`; o plano da run está em `docs/relatorios/fase-16-plano.md`. Ponto de partida: `ee767e2` (a F15, PR 31). PR: [vmatusita/fileorca#32](https://github.com/vmatusita/fileorca/pull/32). Prévia: https://fase-16-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio).

## Resumo

1. O campo das calculadoras aceita um dígito digitado no meio de um número com milhar ("3755,000" no lugar de "375,000" lê 3.755.000) e só reclama de valor fora da faixa; ao sair, o número volta ao formato do idioma.
2. Um número com casas demais diz quantas casas o campo aceita ("Use até 2 casas decimais.", "Use um número inteiro."), sem a faixa e sem a dica errada.
3. A região viva do card fala uma vez por digitação: o "99" na taxa diz só o erro, não mais o resultado do "9" antes dele; e, quando o erro tira o Baixar PDF, o foco vai ao Copiar link, nunca à página.
4. O CSV de casa e de saúde guarda uma coisa por célula (número sem milhar, data AAAA-MM-DD, a unidade no cabeçalho ou na coluna "Unit", o intervalo em duas colunas), e o PDF rotula cada valor das listas e diz o período da taxa ("14% a.m.", "Circle: diameter 24.5 ft").
5. Nas ferramentas de imagem, o Tab para fora do campo de número num lote leva o foco ao controle da linha, ou à própria linha enquanto ela espera, nunca à página.

## O que entrou, por item da ficha

### 1. O formato enquanto se digita (frente N; § 683; F4 DES-3)

- `src/calc/parse.ts` (o único arquivo de `src/calc/` no diff): o `readNumber`, que divide o texto no separador decimal e nos de milhar e devolve as partes ou o motivo de não ler (`'separator'`, que dá a dica, ou `'format'`), o `scaledOf` e o `parseScaled` com a mesma assinatura sobre eles; o `PATTERNS` (a causa do D13) saiu. A escrita (`formatScaled`, `money`, `dollars`, `ratePercent`, `hundredthsPercent`) não mudou.
- `src/tools/calc/form.ts`: o `readNumber` novo entra como `readTyped`; o `readLink`, o `WHOLE` e o link do cenário não mudaram.
- Testes: o bloco novo do `tests/unit/calc-parse.test.ts` (os casos da ficha e da decisão 3, nos três idiomas, à mão) e o critério 2 do `tests/e2e/money-input.spec.ts`.

### 2. A mensagem de casas (frente N; § 684; F7 a-4)

- `form.ts`: `fieldMessage` (puro) e `decimalsMessage`; `CalcField.tsx` e `Fields.tsx` a usam pelo mesmo caminho do erro; o `heroReserves` do `CalcPanel.tsx` a põe nas reservas do card.
- Os textos `decimalsMany`, `decimalsOne` e `decimalsNone` nos três idiomas (§ 689).
- Testes: `tests/unit/calc-field.test.ts` (novo), `calc-reserves.test.ts` e o teste da dica do `money-calc.spec.ts` (§ 696).

### 3. Uma fala por digitação (frente N; § 685; F13b R-b-3)

- `src/tools/calc/store.ts`: `draft`, `drafting` e `onDraft`, fora do `state` e sem repintar a ilha; o `wrong` com erro desliga o rascunho.
- `CalcField.tsx` marca e desmarca o rascunho; `ResultHero.tsx` segura a fala enquanto há rascunho e fala uma vez quando ele acaba. O texto e os 500 ms não mudaram.
- Testes: o critério 3 do `money-input.spec.ts` e o `calc-field.test.ts`.

### 4. O foco quando o Baixar sai (frente N; § 686; F13b R-b-1)

- `ResultHero.tsx`: a marca do foco no Baixar (ou a caminho dele) lida na renderização, e um `useLayoutEffect` que põe o foco no primeiro controle depois do lugar do Baixar que o Tab alcança (`nextControl`, puro, e `controlsAfter`).
- Testes: o critério 4 do `money-input.spec.ts` (en, pt, es, a Square footage e as dívidas, a 360 e a 1280) e o `calc-field.test.ts`.

### 5. O CSV com uma coisa por célula (frente X; § 687 e § 688; F7 a-3)

- `src/tools/calc/types.ts`: o `CsvKind`, o `CsvValue`, o `csv` da célula de texto e o `Table.csv`, obrigatório (o cabeçalho e o tipo de cada coluna).
- `src/tools/calc/exports.ts`: o `csvCells` e o `csvValue`; o `csvText` com o cabeçalho do `Table.csv`. O separador, as aspas, o CRLF e o BOM não mudaram.
- `src/tools/calc/view.ts` (`columns`, `headed`, `ItemLine`, `itemTable`, `itemPairs`), `defs/shared.ts` (`unitOf`, `fieldHead`, `csvNumber`), as 11 tabelas de `defs/house.ts` e `defs/health.ts` (com o `BMI_BANDS`) e a declaração das colunas em todas as outras definições.
- Os textos novos só em inglês (`csvX`, `csvY`, `colWeight`, `weightUnit`, `bagsName`, `tonsUnit`, `baseName`) e os de todas as calculadoras (`csvUnit`, `csvFrom`, `csvTo`; § 689).
- Testes: `tests/unit/calc-csv.test.ts` (novo), `tests/e2e/money-export.spec.ts` (novo) e os specs de casa e de saúde com o cabeçalho e as linhas do CSV (§ 696).

### 6. O resto do grupo 3 (frente X; § 690; F7 a-6, F6 g-2, F4 COR-16)

- `view.ts`, `inputRows`: cada valor de uma linha de lista com o rótulo do campo (o da opção da linha quando existe) e a taxa com o resto do sufixo (`listedText`, `inline`). O `report.ts` e a linha "Last result that worked" (`fieldText`) não mudaram.
- O COR-16 fechou no PDF (rótulo em toda linha; um só "você" na Savings goal, "Your deposits"); a legenda "Your money" do gráfico do card, texto do resultado na tela, ficou fora (grupo 26, F16 m-1).
- Testes: 5 novos no `tests/unit/calc-report.test.ts`.

### 7. Os bytes em inglês (frente X e agente principal; § 691)

- O cabeçalho e as três primeiras linhas do CSV das 11 calculadoras de casa e de saúde, e as linhas que mudaram nas 6 PDFs, antes e depois, na § 691 e nas tabelas abaixo.

### 8. O foco depois do campo de número das imagens (frente I; § 692; F15 R-b-1)

- `src/tools/image/ImagePanel.tsx`: o `onBlurCapture` na raiz da ilha (`noteLanding`) guarda para onde o foco ia, e um `useLayoutEffect` o leva ao controle do mesmo papel na linha, ou à própria linha enquanto ela espera; o bloco antigo do foco perdido cede à marca.
- `src/tools/image/landing.ts` (novo, puro): `landingMove` e `landingSpent`. O `NumberField.tsx` não mudou (o das ferramentas de PDF é o mesmo).
- Testes: `tests/e2e/image-focus.spec.ts` (novo) e `tests/unit/image-landing.test.ts` (novo).

### Os documentos e as pendências

- `DECISOES.md`: § 681 a § 700 (abaixo).
- `docs/design/`: o README do NumberField, o do ResultHero e o da ExportBar, com o antes e o depois (§ 697).
- `docs/claude/`: seções novas no fim do `calculadoras.md`, do `playwright.md` e do `imagem.md`.
- `docs/PENDENCIAS.md`: o F4 DES-3, o F7 a-4, o F7 a-3, o F7 a-6, o F6 g-2, o F4 COR-16, o F13b c-3, o F13b R-b-1, o F13b R-b-3 e o F15 R-b-1 em "Já corrigidos"; o grupo 3 fechado; o grupo 26, "O que a F16 deixou" (5 linhas). O total foi de 194 para 189 linhas.

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | Vitest do `parse.ts` nos três idiomas ("3755,000" e "3755.000" leem 3.755.000; "6,5" com a dica; "1,234"; "375,0005"; "3,755,00" com a dica; os negativos); a mensagem de casas com n = 0, 1, 2 e 4 | `tests/unit/calc-parse.test.ts` (o bloco novo, 53 casos à mão) e `tests/unit/calc-field.test.ts` | passa (tabela da leitura abaixo). Controle negativo: os casos novos rodados com o `parse.ts` do ponto de partida reprovam 2 de 2 testes, com "expected [ …(16) ] to deeply equal []" (`en "3755,000": esperado 375500000, veio null`, …) e "expected null to be -3755000" |
| 2 | Na hipoteca, "375,000" → "3755,000" sem erro e com a parcela do número digitado do zero; o mesmo em pt e es | `money-input.spec.ts`, critério 2 (o cursor no meio por `setSelectionRange`, a tecla pelo `page.keyboard`) | passa nos dois: $19,487.32/mo (en), $19,487.32/mes (es) e R$ 46.245,53/mês (pt, "5005.000" no SAC × PRICE), sem erro, e "3,755,000" / "5.005.000" ao sair. Controle negativo no `dist-base`: "Expected: \"$19,487.32/mo\" Received: \"$2,396.20/mo\"" (e o mesmo em pt e es) |
| 3 | Uma fala só na região viva para cada valor digitado (`MutationObserver`) | `money-input.spec.ts`, critério 3 | passa nos dois e nos três idiomas (tabela das falas abaixo). Controle negativo: "99" no `dist-base` dá "Expected length: 1 Received length: 2" (o resultado de 9% e depois o erro) |
| 4 | O Tab depois de um valor errado no último campo principal leva ao controle seguinte, nunca ao `body`, a 360 e a 1280, nos dois navegadores; Shift+Tab volta | `money-input.spec.ts`, critério 4 | passa: o Copiar link ("Copy link", "Copiar link", "Copiar enlace") nas três páginas e na Square footage; o Shift+Tab volta ao campo (tabela do foco abaixo). Controle negativo: "Expected: \"Copy link\" Received: \"BODY\"" |
| 5 | Nenhuma célula do CSV de nenhuma calculadora, em en, pt e es, com milhar, unidade, U+2212 ou data por extenso; o `money-privacy.spec.ts` verde | `calc-csv.test.ts` (as 65 páginas com o exemplo e com os 144 conjuntos do `nudges`, os números do oráculo, o BTU negativo, as datas); `money-export.spec.ts` (o CSV baixado, byte a byte); `money-privacy.spec.ts` | passa. Controle negativo com os CSVs do ponto de partida (`CALC_CSV_DIR`): "en-btu-calculator: expected [ …(12) ] to deeply equal []", com "row 1, column 2 (\"9,000\"): not a number of the CSV" e "row 2, column 2 (\"+900\")…"; o `money-export` no `dist-base` reprova no Tile e na Ovulation |
| 6 | Os 16 ms: o p95 do `money-speed.spec.ts` não piora mais que 1 ms | três rodadas alternadas contra o `dist-base` (§ 699) | a maior diferença das medianas do p95 é +0,20 ms (tabela abaixo) |
| 7 | As fixtures do oráculo e o `calc-oracle.test.ts` sem mudança; `pnpm verificar` verde | `git diff --stat ee767e2 -- src/calc scripts/oracle fixtures`; os três oráculos com `--check`; o `verificar --partes` | o diff mostra só `src/calc/parse.ts | 83 ++++---`; as 37 fixtures "igual"; o `verificar` abaixo |
| Item 6 | a-6, g-2 e COR-16, cada um com um teste sobre o `inputRows` ou o `reportInput` que reprova sem ele | `calc-report.test.ts` (5 novos) | passa. Controle negativo no código do ponto de partida: 4 de 5 reprovam ("- \"Circle: diameter 24.5 ft\" + \"Circle: 24.5 ft\"", "[ 'Rotativo', '14%' ] … [ 'Rotativo', '14% a.m.' ]", "debt-payoff-calculator en Debt 1: expected '$4,800.00' to match /^\\p{L}…/u"); o do "você" da Savings goal passa nos dois (o PDF já tinha um só) |
| Item 8 | Num lote de três no Comprimir e no Redimensionar, depois do resultado, o Tab para fora do campo leva ao controle seguinte, nunca ao `body`; o Shift+Tab volta; o lote refaz uma vez | `image-focus.spec.ts` (Comprimir, Redimensionar e Cortar) e `image-landing.test.ts` | passa nos dois (tabela abaixo). Controle negativo no `dist-base`: 3 de 3 reprovam nos dois navegadores, "the page had the focus while the batch was made again", com 45 a 67 amostras "BODY"; um mutante com `useEffect` reprova no Chromium com 2 amostras |

E os critérios do prompt:

- **Os 8 itens** entraram; a válvula não cortou nada.
- **Nenhum número de resultado mudou:** só o `parse.ts` em `src/calc/`, os oráculos e o `calc-oracle.test.ts` sem mudança, e os números de tabela, de resultado e de premissa iguais nas 34 PDFs em inglês (§ 691).
- **O card não cresce** (o "the card keeps its height…" passa com as mensagens novas), e o CLS sem gesto continua 0 (o `layout-shift.spec.ts` sem mudança de número). A exceção da decisão 13 foi usada: 13 combinações ficaram de 22 a 26 px mais altas na carga, com o F13b c-3 resolvido e nenhum número abaixo da dobra (§ 694).
- **Nada sai do aparelho:** o `money-privacy`, o `money-life-privacy`, o `events` e o `image-privacy` passam, com a mensagem de casas, a fala, o Tab e o CSV novos no caminho (os testes novos da revisão, d-1).
- **Os textos:** o `english-leak`, o `glossary`, o `claude-md` e o `pendencias` passam; o `lint:texto` e o `gate:conteudo`, no `verificar` abaixo.
- **O orçamento:** os mesmos 66 arquivos JS e as mesmas requisições; a ilha das calculadoras +2.007 B com gzip, abaixo dos 4 KB (§ 693).

## As tabelas

### A leitura: cada caso do Vitest pelo `parseScaled` do ponto de partida e do novo

O valor está na unidade do campo, escrito em pt. "A dica" é o motivo `'separator'`: o campo com casas mostra a faixa com "Use a dot for the decimals, like 6.5." (en), "Usa punto en los decimales, como 6.5." (es) ou "Use vírgula nos decimais, como 11,5." (pt). O texto que lê com casas demais para o campo não entra aqui: ele leva a mensagem de casas (a seção seguinte).

| Idioma | Texto | Campo | Antes (`ee767e2`) | Depois (F16) |
| --- | --- | --- | --- | --- |
| en | `3755,000` | dinheiro (2 casas) | não lê | 3.755.000,00 **(muda)** |
| es | `3755,000` | dinheiro (2 casas) | não lê | 3.755.000,00 **(muda)** |
| pt | `3755.000` | dinheiro (2 casas) | não lê | 3.755.000,00 **(muda)** |
| pt | `5005.000` | dinheiro (2 casas) | não lê | 5.005.000,00 **(muda)** |
| en | `3755,000.50` | dinheiro (2 casas) | não lê | 3.755.000,50 **(muda)** |
| pt | `3755.000,50` | dinheiro (2 casas) | não lê | 3.755.000,50 **(muda)** |
| en | `1,234` | dinheiro (2 casas) | 1.234,00 | 1.234,00 |
| es | `1,234` | dinheiro (2 casas) | 1.234,00 | 1.234,00 |
| pt | `1.234` | dinheiro (2 casas) | 1.234,00 | 1.234,00 |
| en | `1,234` | inteiro (0 casa) | 1.234 | 1.234 |
| en | `375,0005` | dinheiro (2 casas) | não lê | 3.750.005,00 **(muda)** |
| es | `375,0005` | dinheiro (2 casas) | não lê | 3.750.005,00 **(muda)** |
| pt | `375.0005` | dinheiro (2 casas) | não lê | 3.750.005,00 **(muda)** |
| en | `375,` | dinheiro (2 casas) | não lê | 375,00 **(muda)** |
| es | `375,` | dinheiro (2 casas) | não lê | 375,00 **(muda)** |
| pt | `375.` | dinheiro (2 casas) | não lê | 375,00 **(muda)** |
| en | `,500` | dinheiro (2 casas) | não lê | 500,00 **(muda)** |
| en | `12,34,567` | inteiro (0 casa) | não lê | 1.234.567 **(muda)** |
| en | `1,23.5` | dinheiro (2 casas) | não lê | 123,50 **(muda)** |
| pt | `1.23,5` | dinheiro (2 casas) | não lê | 123,50 **(muda)** |
| en | `6,5` | taxa (4 casas) | não lê | não lê (`separator`: a dica) |
| es | `6,5` | taxa (4 casas) | não lê | não lê (`separator`: a dica) |
| pt | `11.5` | taxa (4 casas) | não lê | não lê (`separator`: a dica) |
| en | `3,755,00` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| es | `3,755,00` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| pt | `3.755.00` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| en | `12,34,56` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| en | `1,23` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| en | `,5` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| en | `375,0` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| pt | `375.00` | dinheiro (2 casas) | não lê | não lê (`separator`: a dica) |
| en | `1.234,56` | dinheiro (2 casas) | não lê | não lê (`format`) |
| es | `1.234,56` | dinheiro (2 casas) | não lê | não lê (`format`) |
| pt | `1,234.56` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `1.5,0` | dinheiro (2 casas) | não lê | não lê (`format`) |
| pt | `1,5.0` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `abc` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `1.2.3` | dinheiro (2 casas) | não lê | não lê (`format`) |
| pt | `1,2,3` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `-5` | taxa (4 casas) | não lê | não lê (`format`) |
| en | `(vazio)` | dinheiro (2 casas) | não lê | não lê (`format`) |
| es | `.` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `1 234` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `1e5` | dinheiro (2 casas) | não lê | não lê (`format`) |
| en | `--1` | taxa (4 casas) | não lê | não lê (`format`) |

### A mensagem de casas (`calc-field.test.ts` e `money-calc.spec.ts`)

| Campo | Texto (en / pt / es) | Antes | Depois |
| --- | --- | --- | --- |
| O prazo da hipoteca (n = 0) | "30.5" / "12,5" (o prazo do SAC × PRICE) / "30.5" | a faixa ("Enter a term from 1 to 40 years.") | "Use a whole number." / "Use um número inteiro." / "Usa un número entero." |
| A taxa (n = 4) | 5 casas | a faixa | "Use up to 4 decimal places." / "Use até 4 casas decimais." / "Usa hasta 4 decimales." |
| O preço (n = 2) | 3 casas | a faixa (às vezes com a dica) | "Use up to 2 decimal places." / "Use até 2 casas decimais." / "Usa hasta 2 decimales." |
| O peso da BMI (n = 1) | 2 casas | a faixa | "Use up to 1 decimal place." (só em inglês) |
| Casas demais com o valor cortado fora da faixa | "20,000,000.011" no preço | a faixa | a faixa, como antes |

### As falas

| Sequência | Antes, Chromium | Antes, WebKit | Depois, Chromium | Depois, WebKit |
| --- | --- | --- | --- | --- |
| en rate 99 | 2: o resultado (635 ms), o erro (1460 ms) | 2: o resultado (598 ms), o erro (1463 ms) | 1: o erro (1462 ms) | 1: o erro (1441 ms) |
| en price 3755,000 | 1: o erro (1350 ms) | 1: o erro (1372 ms) | 1: o resultado (510 ms) | 1: o resultado (553 ms) |
| en price 425000 | 1: o resultado (1144 ms) | 1: o resultado (1206 ms) | 1: o resultado (1164 ms) | 1: o resultado (1182 ms) |
| es rate 99 | 2: o resultado (637 ms), o erro (1467 ms) | 2: o resultado (595 ms), o erro (1462 ms) | 1: o erro (1465 ms) | 1: o erro (1449 ms) |
| es price 3755,000 | 1: o erro (1330 ms) | 1: o erro (1391 ms) | 1: o resultado (513 ms) | 1: o resultado (535 ms) |
| es price 425000 | 1: o resultado (1155 ms) | 1: o resultado (1187 ms) | 1: o resultado (1173 ms) | 1: o resultado (1195 ms) |
| pt rate 99 | 2: o resultado (620 ms), o erro (1457 ms) | 2: o resultado (589 ms), o erro (1455 ms) | 1: o erro (1455 ms) | 1: o erro (1453 ms) |
| pt price 5005.000 | 1: o erro (1355 ms) | 1: o erro (1377 ms) | 1: o resultado (515 ms) | 1: o resultado (549 ms) |
| pt price 425000 | 1: o resultado (1154 ms) | 1: o resultado (1216 ms) | 1: o resultado (1154 ms) | 1: o resultado (1186 ms) |

O texto de cada fala do depois:

- en rate 99: "Enter a rate from 0 to 40%. Last result that worked: Rate 9%. Fix the highlighted field to update the result."
- en price 3755,000: "Monthly payment: $19,487.32/mo. Over 30 years at 6.5% you'll pay $6,835,439 on the loan, of which $3,831,439 is interest. Taxes, insurance and fees add $500.00 a month."
- en price 425000: "Monthly payment: $2,649.03/mo. Over 30 years at 6.5% you'll pay $773,652 on the loan, of which $433,652 is interest. Taxes, insurance and fees add $500.00 a month."
- es rate 99: "Escribe una tasa de 0 a 40 %. Último resultado válido: Tasa 9 %. Corrige el campo marcado para actualizar el resultado."
- es price 3755,000: "Pago mensual: $19,487.32/mes. En 30 años al 6.5 %, pagarás $6,835,439 por el préstamo, de los cuales $3,831,439 son intereses. Los impuestos, los seguros y las cuotas suman $500.00 al mes."
- es price 425000: "Pago mensual: $2,649.03/mes. En 30 años al 6.5 %, pagarás $773,652 por el préstamo, de los cuales $433,652 son intereses. Los impuestos, los seguros y las cuotas suman $500.00 al mes."
- pt rate 99: "Digite juros de 0 a 30% ao ano. Último resultado que valeu: Juros a.a. 9%. Corrija o campo destacado para atualizar o resultado."
- pt price 5005.000: "Primeira parcela no SAC: R$ 46.245,53/mês. No SAC a parcela cai até R$ 11.369,37; na PRICE fica quase igual nos 30 anos. A PRICE paga R$ 2.848.816 a mais de juros."
- pt price 425000: "Primeira parcela no SAC: R$ 4.064,20/mês. No SAC a parcela cai até R$ 1.102,69; na PRICE fica quase igual nos 30 anos. A PRICE paga R$ 241.897 a mais de juros."

### O foco depois do Tab (Alt+Tab no WebKit) com "99" no último campo principal

| Página e campo | Largura | Antes, Chromium | Antes, WebKit | Depois, Chromium | Depois, WebKit | Shift+Tab depois |
| --- | --- | --- | --- | --- | --- | --- |
| en mortgage term | 360 | BODY | BODY | Copy link | Copy link | #fo-calc-t (Chromium), #fo-calc-t (WebKit) |
| es mortgage term | 360 | BODY | BODY | Copiar enlace | Copiar enlace | #fo-calc-t (Chromium), #fo-calc-t (WebKit) |
| pt sac-price rate | 360 | BODY | BODY | Copiar link | Copiar link | #fo-calc-r (Chromium), #fo-calc-r (WebKit) |
| en mortgage term | 1280 | BODY | BODY | Copy link | Copy link | #fo-calc-t (Chromium), #fo-calc-t (WebKit) |
| es mortgage term | 1280 | BODY | BODY | Copiar enlace | Copiar enlace | #fo-calc-t (Chromium), #fo-calc-t (WebKit) |
| pt sac-price rate | 1280 | BODY | BODY | Copiar link | Copiar link | #fo-calc-r (Chromium), #fo-calc-r (WebKit) |

### O foco no item 8 (`.cache/f16/focus-probe.ts`, 1280 × 800, lote de três, depois do resultado; "quadros no `body`" do Tab até 800 ms depois do fim da reexecução)

| Campo | Antes, Chromium | Antes, WebKit | Depois, Chromium | Depois, WebKit | Shift+Tab depois | Execuções |
| --- | --- | --- | --- | --- | --- | --- |
| Comprimir, `#ci-max` ("Até um tamanho") | `body` (52 de 52 quadros) | `body` (54 de 54) | a linha 1 e, quando ela volta a trabalhar, o "Show photo-1.jpg" (0 de 51) | o "Show photo-1.jpg" (0 de 55) | volta ao `#ci-max` | 1 |
| Redimensionar, `#rz-height` | `body` (51 de 51) | `body` (59 de 59) | a linha 1 e depois o Baixar dela (0 de 53) | o mesmo (0 de 59) | volta ao `#rz-height` | 1 |
| Redimensionar, `#rz-width` | `#rz-height` (0 de 51) | `#rz-height` (0 de 57) | o mesmo (0 de 52) | o mesmo (0 de 58) | volta ao `#rz-width` | 1 |
| Cortar, `#cr-height` | `body` (50 de 50) | `body` (55 de 55) | a linha 1 e depois o "Show photo-1.jpg" (0 de 50) | o "Show photo-1.jpg" (0 de 56) | volta ao `#cr-height` | 1 |

No ponto de partida, o Shift+Tab de lá ia ao campo anterior (Chromium) ou ao "Ajustar" (WebKit). A revisão (lente b) repetiu em pt e es, com lotes de dois e de três: 0 amostra no `body`.

### O CSV: as colunas e o tipo de cada uma, por calculadora e idioma (o `Table.csv`; o ano de uma tabela agrupada é a 1ª coluna, de texto)

| Página | Idioma | Colunas do CSV |
| --- | --- | --- |
| mortgage-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| mortgage-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| personal-loan-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| personal-loan-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| auto-loan-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| auto-loan-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| refinance-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| refinance-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| home-affordability-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| home-affordability-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| loan-amortization-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| loan-amortization-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| credit-card-payoff-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| credit-card-payoff-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| debt-payoff-calculator | en | Year (número), Snowball (número), Avalanche (número) |
| debt-payoff-calculator | es | Año (número), Bola de nieve (número), Avalancha (número) |
| debt-consolidation-calculator | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| debt-consolidation-calculator | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| rent-vs-buy-calculator | en | Year (número), Buying (número), Renting (número) |
| rent-vs-buy-calculator | es | Año (número), Comprar (número), Alquilar (número) |
| compound-interest-calculator | en | Year (número), Your deposits (número), Interest (número), Balance (número) |
| compound-interest-calculator | es | Año (número), Tus depósitos (número), Intereses (número), Saldo (número) |
| savings-goal-calculator | en | Year (texto), Month (número), Deposit (número), Interest (número), Balance (número) |
| savings-goal-calculator | es | Año (texto), Mes (número), Depósito (número), Intereses (número), Saldo (número) |
| simple-interest-calculator | en | After, in years (número), Interest (número), Total (número) |
| simple-interest-calculator | es | Tiempo, en años (número), Intereses (número), Total (número) |
| apr-to-apy-calculator | en | Compounding (texto), APY (número) |
| apr-to-apy-calculator | es | Capitalización (texto), APY (número) |
| mortgage-calculator-extra-payments | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| mortgage-calculator-extra-payments | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| mortgage-calculator-biweekly | en | Year (texto), Half payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| mortgage-calculator-biweekly | es | Año (texto), Medio pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| mortgage-calculator-15-vs-30-year | en | Year (número), 15-year balance (número), 30-year balance (número) |
| mortgage-calculator-15-vs-30-year | es | Año (número), Saldo a 15 años (número), Saldo a 30 años (número) |
| loan-amortization-calculator-balloon-payment | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| loan-amortization-calculator-balloon-payment | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| br-sac-price | pt | Ano (texto), Nº (número), Parcela (número), Amortização (número), Juros (número), Seguros e taxas (número), Saldo devedor (número), Correção (TR) (número) |
| br-vehicle-loan | pt | Ano (texto), Nº (número), Parcela (número), Amortização (número), Juros (número), Saldo devedor (número) |
| br-personal-loan | pt | Ano (texto), Nº (número), Parcela (número), Amortização (número), Juros (número), Saldo devedor (número) |
| br-early-payoff | pt | Ano (texto), Nº (número), Parcela (número), Amortização (número), Juros (número), Saldo devedor (número) |
| br-credit-card | pt | Ano (texto), Nº (número), Parcela (número), Amortização (número), Juros (número), Saldo devedor (número) |
| br-debt-payoff | pt | Ano (número), Bola de neve (número), Avalanche (número) |
| br-compound-interest | pt | Ano (número), Total aportado (número), Juros ganhos (número), Saldo (número) |
| br-rent-or-buy | pt | Ano (número), Comprando (número), Alugando (número) |
| square-footage-calculator | en | Area (texto), Shape (texto), Length, base or diameter (ft) (número), Width or height (ft) (número), Square feet (número) |
| concrete-calculator | en | Bag weight (lb) (número), Yield (cu ft) (número), Bags to buy (número) |
| mulch-calculator | en | Item (texto), Amount (número), Unit (texto), Bag size (cu ft) (número) |
| paint-calculator | en | Item (texto), Amount (número), Unit (texto) |
| tile-calculator | en | Item (texto), Amount (número), Unit (texto), Tile length (in) (número), Tile width (in) (número) |
| btu-calculator | en | Step (texto), BTU per hour (número), Room area (sq ft) (número) |
| bmi-calculator | en | Category (texto), BMI (from) (número), BMI (to) (número), Your BMI (número) |
| calorie-calculator | en | Step (texto), Amount (número), Unit (texto) |
| ovulation-calculator | en | Fertile window (from) (data), Fertile window (to) (data), Ovulation (data), Next period (data) |
| body-fat-calculator | en | Step (texto), Value (número), Equation (texto) |
| due-date-calculator | en | Milestone (texto), Date (data) |
| guides-15-vs-30-year-mortgage (guia) | en | Year (número), 15-year balance (número), 30-year balance (número) |
| guides-15-vs-30-year-mortgage (guia) | es | Año (número), Saldo a 15 años (número), Saldo a 30 años (número) |
| guides-debt-snowball-vs-avalanche (guia) | en | Year (número), Snowball (número), Avalanche (número) |
| guides-debt-snowball-vs-avalanche (guia) | es | Año (número), Bola de nieve (número), Avalancha (número) |
| guides-extra-mortgage-payments (guia) | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| guides-extra-mortgage-payments (guia) | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| guides-refinance-break-even (guia) | en | Year (texto), Payment (número), Amount (número), Principal (número), Interest (número), Balance (número) |
| guides-refinance-break-even (guia) | es | Año (texto), Pago (número), Monto (número), Capital (número), Intereses (número), Saldo (número) |
| guides-rent-vs-buy-break-even (guia) | en | Year (número), Buying (número), Renting (número) |
| guides-rent-vs-buy-break-even (guia) | es | Año (número), Comprar (número), Alquilar (número) |

Os bytes em inglês, antes e depois (o cabeçalho e as três primeiras linhas), estão na § 691; os 54 CSVs de dinheiro e dos guias (en, es e pt) têm os mesmos bytes do ponto de partida, e mudaram só os 11 de casa e de saúde:

| Calculadora | Antes | Depois |
| --- | --- | --- |
| BMI (224 → 213 B) | `Category,BMI,Your BMI` / `Underweight,below 18.5,` / `Healthy Weight,18.5 to 24.9,23.6` / `Overweight,25.0 to 29.9,` | `Category,BMI (from),BMI (to),Your BMI` / `Underweight,,18.4,` / `Healthy Weight,18.5,24.9,23.6` / `Overweight,25.0,29.9,` |
| Body fat (88 → 99 B) | `Step,Value` / `Equation,"Female: neck, waist at its narrowest and hip"` / `Body fat,25.9%` | `Step,Value,Equation` / `Equation,,"Female: neck, waist at its narrowest and hip"` / `Body fat,25.9%,` |
| BTU (157 → 160 B) | `Step,BTU per hour` / `Energy Star table for 350.00 sq ft,"9,000"` / `Very sunny (10% more),+900` / `People past two (600 each),+600` | `Step,BTU per hour,Room area (sq ft)` / `Energy Star table,9000,350.00` / `Very sunny (10% more),900,` / `People past two (600 each),600,` |
| Calorie (105 → 106 B) | `Step,Amount` / `At rest (Mifflin-St Jeor),"1,376 kcal"` / `Activity level,1.6` / `Calories a day,"2,202 kcal"` | `Step,Amount,Unit` / `At rest (Mifflin-St Jeor),1376,kcal` / `Activity level,1.60,` / `Calories a day,2202,kcal` |
| Concrete (95 → 83 B) | `Bag,Yield (cu ft),Bags to buy` / `40 lb bags,0.30,123` / `60 lb bags,0.45,82` / `80 lb bags,0.60,62` | `Bag weight (lb),Yield (cu ft),Bags to buy` / `40,0.30,123` / `60,0.45,82` / `80,0.60,62` |
| Due date (248 → 215 B) | `Milestone,Date` / `First trimester starts (week 1),"September 7, 2026"` / `Second trimester starts (week 13),"November 30, 2026"` / `Third trimester starts (week 29),"March 22, 2027"` | `Milestone,Date` / `First trimester starts (week 1),2026-09-07` / `Second trimester starts (week 13),2026-11-30` / `Third trimester starts (week 29),2027-03-22` |
| Mulch (108 → 128 B) | `Item,Amount` / `Area,200.00 sq ft` / `Volume needed,1.85 cu yd` / `In cubic feet,50.00 cu ft` | `Item,Amount,Unit,Bag size (cu ft)` / `Area,200.00,sq ft,` / `Volume needed,1.85,cu yd,` / `In cubic feet,50.00,cu ft,` |
| Ovulation (508 → 338 B) | `Fertile window,Ovulation,Next period` / `"October 27, 2026 to November 1, 2026","November 1, 2026","November 16, 2026"` / `"November 24, 2026 to November 29, 2026","November 29, 2026","December 14, 2026"` / `"December 22, 2026 to December 27, 2026","December 27, 2026","January 11, 2027"` | `Fertile window (from),Fertile window (to),Ovulation,Next period` / `2026-10-27,2026-11-01,2026-11-01,2026-11-16` / `2026-11-24,2026-11-29,2026-11-29,2026-12-14` / `2026-12-22,2026-12-27,2026-12-27,2027-01-11` |
| Paint (149 → 156 B) | `Item,Amount` / `Wall area,384.00 sq ft` / `Doors and windows,51.00 sq ft` / `Area to paint,333.00 sq ft` | `Item,Amount,Unit` / `Wall area,384.00,sq ft` / `Doors and windows,51.00,sq ft` / `Area to paint,333.00,sq ft` |
| Square footage (69 → 117 B) | `Area,Shape,Size,Square feet` / `Area 1,Rectangle,15 × 12 ft,180.00` | `Area,Shape,"Length, base or diameter (ft)",Width or height (ft),Square feet` / `Area 1,Rectangle,15.00,12.00,180.00` |
| Tile (113 → 164 B) | `Item,Amount` / `Area,120.00 sq ft` / `Tile size,12 × 12 in` / `Extra for cuts,10%` | `Item,Amount,Unit,Tile length (in),Tile width (in)` / `Area,120.00,sq ft,,` / `Tile size,,,12.00,12.00` / `Extra for cuts,10%,,,` |

### O PDF: as linhas que mudaram (item 6; texto lido pelo PDF.js no Node, as peças de cada linha juntadas por " | ")

| PDF | Antes | Depois |
| --- | --- | --- |
| Debt payoff e o guia Debt snowball vs avalanche (4 linhas cada) | `Debt 1 \| $4,800.00, 24.99%, $120.00` (… `Debt 4 \| $3,600.00, 11.5%, $110.00`) | `Debt 1 \| balance $4,800.00, APR 24.99%, minimum payment $120.00` (… `Debt 4 \| balance $3,600.00, APR 11.5%, minimum payment $110.00`) |
| Debt consolidation (3 linhas) | `Debt 1 \| $5,200.00, 24.99%, $180.00` · `Debt 2 \| $3,100.00, 19.99%, $110.00` · `Debt 3 \| $1,700.00, 27.99%, $65.00` | `Debt 1 \| balance $5,200.00, APR 24.99%, monthly payment $180.00` · `Debt 2 \| balance $3,100.00, APR 19.99%, monthly payment $110.00` · `Debt 3 \| balance $1,700.00, APR 27.99%, monthly payment $65.00` |
| Rent vs buy e o guia Rent vs buy break-even (2 linhas cada) | `Upkeep per year \| 1%` · `Cost to sell \| 6%` | `Upkeep per year \| 1% of value` · `Cost to sell \| 6% of value` |
| Square footage (1 linha) | `Area 1 \| Rectangle: 15 ft x 12 ft` | `Area 1 \| Rectangle: length 15 ft x width 12 ft` |

As outras 28 PDFs em inglês têm o mesmo texto; nas 34, a tabela, os resultados e as premissas são os mesmos. No "Exemplo resolvido" das páginas mudaram as mesmas linhas em 9 páginas (a Debt payoff en e es, a Debt consolidation en e es, a Rent vs buy en e es, o Cartão de crédito pt, o Quitar dívidas pt e a Square footage en).

### Os 16 ms (`money-speed.spec.ts`, Chromium, três rodadas alternadas, o `dist-base` na 4181 e a junção na 4185, com a máquina livre; § 699)

| Caso | dist-base: p50 / p95 (rodadas 1, 2, 3) | Mediana do p95 | F16: p50 / p95 (rodadas 1, 2, 3) | Mediana do p95 | Diferença |
| --- | --- | ---: | --- | ---: | ---: |
| mortgage with extra payments | 0,60 / 1,20 · 0,60 / 1,10 · 0,60 / 1,20 | 1,20 | 0,60 / 1,40 · 0,70 / 1,40 · 0,60 / 1,20 | 1,40 | +0,20 |
| rent vs buy | 0,60 / 1,20 · 0,70 / 2,00 · 0,50 / 1,00 | 1,20 | 0,60 / 1,30 · 0,60 / 1,40 · 0,80 / 2,00 | 1,40 | +0,20 |
| APY into APR, daily | 1,20 / 1,50 · 1,20 / 1,60 · 1,20 / 1,40 | 1,50 | 1,30 / 1,60 · 1,20 / 1,60 · 1,20 / 1,60 | 1,60 | +0,10 |
| SAC × PRICE with a TR, 420 months | 1,40 / 2,40 · 1,40 / 2,60 · 1,40 / 2,40 | 2,40 | 1,40 / 2,50 · 1,40 / 2,30 · 1,40 / 2,80 | 2,50 | +0,10 |
| SAC × PRICE | 0,90 / 1,60 · 1,00 / 1,40 · 1,00 / 1,60 | 1,60 | 1,00 / 1,60 · 0,90 / 2,00 · 1,00 / 1,70 | 1,70 | +0,10 |
| BMI | 0,20 / 0,50 · 0,20 / 0,80 · 0,20 / 0,60 | 0,60 | 0,20 / 0,60 · 0,20 / 0,60 · 0,20 / 0,90 | 0,60 | +0,00 |
| rent or buy in Brazil | 0,40 / 1,30 · 0,50 / 1,20 · 0,50 / 1,10 | 1,20 | 0,50 / 1,20 · 0,50 / 1,00 · 0,50 / 1,50 | 1,20 | +0,00 |
| vehicle loan with the CET | 0,50 / 1,30 · 0,50 / 1,60 · 0,50 / 1,80 | 1,60 | 0,50 / 1,90 · 0,70 / 1,80 · 0,40 / 1,70 | 1,80 | +0,20 |
| debt payoff with 10 debts | 0,40 / 1,00 · 0,60 / 1,10 · 0,50 / 1,10 | 1,10 | 0,60 / 1,40 · 0,40 / 0,80 · 0,50 / 0,90 | 0,90 | −0,20 |
| square footage with 10 areas | 0,30 / 0,60 · 0,30 / 0,80 · 0,30 / 0,50 | 0,60 | 0,30 / 0,70 · 0,30 / 0,60 · 0,30 / 0,60 | 0,60 | +0,00 |

A lente e da revisão repetiu as três rodadas alternadas (com a máquina dividida com as outras lentes): a maior diferença das medianas foi +0,5 ms (o SAC × PRICE), abaixo de 1 ms.

### A altura do card na carga (`measure.ts card`, as 65 páginas, a 320, a 360 e a 1280, contra o `dist-base`; § 694)

| Página | Largura | Antes | Depois |
| --- | --- | ---: | ---: |
| Personal loan | 360 | 392 | 418 |
| Auto loan | 360 | 366 | 392 |
| Home affordability | 1280 | 454 | 480 |
| Biweekly | 1280 | 454 | 476 |
| 15 o 30 años (es) | 360 | 392 | 414 |
| O guia Hipoteca a 15 o 30 años (es) | 360 | 392 | 414 |
| Cuánta casa (es) | 320 | 552 | 578 |
| Meta de ahorro (es) | 320 | 408 | 434 |
| Interés simple (es) | 360 | 366 | 392 |
| Simulador de financiamento de veículo (pt) | 320 | 450 | 476 |
| Amortização antecipada (pt) | 320 | 406 | 432 |
| Cartão de crédito (pt) | 1280 | 428 | 450 |
| Alugar ou comprar (pt) | 1280 | 340 | 366 |

As mesmas 13 nos dois navegadores; nenhuma diminuiu. O Chromium dá 179 de 195 iguais (as 13 e três que oscilam no próprio ponto de partida: a Square footage e a Paint a 320, o guia do refinanciamento em es a 320), e o WebKit 182 de 195. A revisão viu que a altura na carga de algumas páginas depende do que o contexto já carregou (a Biweekly a 1280 dá 454 nos dois `dist` do Chromium com um contexto novo a cada carga; § 700). O F13b c-3 (o card que crescia com um valor de outra ordem de grandeza digitado tecla a tecla, a 360) foi de 3 páginas para 0, nos dois navegadores.

### O orçamento (`gzip-sizes.mjs`, nível 9, contra o `dist-base`; o `budgets.spec.ts` e o `i18n-budgets.spec.ts` passam sem mudar número)

| Arquivo | Antes (B gzip) | Depois (B gzip) | Diferença |
| --- | ---: | ---: | ---: |
| `CalcIsland…js` (a ilha das calculadoras) | 34.281 | 36.288 | +2.007 |
| `island.*.js` (o chunk comum) | 22.889 | 23.291 | +402 |
| `PdfIsland…js` | 23.791 | 23.795 | +4 (só o nome do chunk comum) |
| Os outros 24 que mudaram de nome | — | — | de −2 a +2 |

| Página (primeira pintura) | Arquivos | Antes (B gzip) | Depois (B gzip) |
| --- | ---: | ---: | ---: |
| Toda calculadora e guia com a ilha (a hipoteca, o SAC × PRICE, a BMI…) | 3 | 58.602 | 61.011 |
| Comprimir imagem | 3 | 25.049 | 25.452 |
| Redimensionar imagem | 3 | 25.088 | 25.491 |
| Cortar imagem | 3 | 27.010 | 27.413 |
| Imagem para PDF | 3 | 24.641 | 25.044 |

Os mesmos 66 arquivos em `dist/_astro/`, nenhum `import()` novo, nenhuma requisição nova (a lente e comparou as requisições de JS e CSS das 208 páginas: 0 diferente).

### Os anúncios e o CLS

Nenhum controle novo, então nenhum alvo novo de anúncio. Na junção, no build de teste e nos dois navegadores: o `ads.spec.ts` (136 testes), o `fo-ad-map.spec.ts` (53) e o `ads-coffee.spec.ts` (1) passam; o `clearance.spec.ts` (83) passou na revisão (lente d). O `layout-shift.spec.ts` passa sem mudança de número, e a mensagem de casas não muda a altura da página (a lente d mediu o `scrollHeight` igual antes e depois, em 4 calculadoras, a 360 × 740 e a 1280 × 800).

### Os oráculos com `--check`

```text
igual: mortgage-calculator.json (296 casos)
igual: personal-loan-calculator.json (223 casos)
igual: auto-loan-calculator.json (199 casos)
igual: refinance-calculator.json (247 casos)
igual: home-affordability-calculator.json (212 casos)
igual: loan-amortization-calculator.json (153 casos)
igual: compound-interest-calculator.json (345 casos)
igual: credit-card-payoff-calculator.json (209 casos)
igual: debt-payoff-calculator.json (81 casos)
igual: rent-vs-buy-calculator.json (136 casos)
igual: mortgage-calculator-extra-payments.json (82 casos)
igual: mortgage-calculator-biweekly.json (78 casos)
igual: mortgage-calculator-15-vs-30-year.json (84 casos)
igual: loan-amortization-calculator-balloon-payment.json (103 casos)
igual: savings-goal-calculator.json (190 casos)
igual: debt-consolidation-calculator.json (71 casos)
igual: simple-interest-calculator.json (146 casos)
igual: apr-to-apy-calculator.json (184 casos)
calc exit 0
igual: br-sac-price.json (212 casos)
igual: br-vehicle-loan.json (174 casos)
igual: br-personal-loan.json (139 casos)
igual: br-early-payoff.json (245 casos)
igual: br-credit-card.json (265 casos)
igual: br-debt-payoff.json (74 casos)
igual: br-compound-interest.json (173 casos)
igual: br-rent-or-buy.json (110 casos)
calc_br exit 0
igual: square-footage-calculator.json (154 casos)
igual: concrete-calculator.json (172 casos)
igual: mulch-calculator.json (264 casos)
igual: paint-calculator.json (209 casos)
igual: tile-calculator.json (245 casos)
igual: btu-calculator.json (452 casos)
igual: bmi-calculator.json (149 casos)
igual: calorie-calculator.json (134 casos)
igual: ovulation-calculator.json (139 casos)
igual: body-fat-calculator.json (187 casos)
igual: due-date-calculator.json (327 casos)
home_health exit 0
```

## Os testes

- **Vitest:** 133 arquivos e 2.103 testes no ponto de partida; 136 arquivos e 2.144 testes no fim (`calc-field.test.ts`, 12; `calc-csv.test.ts`, 10; `image-landing.test.ts`, 10; e 2 a mais no `calc-parse`, 2 no `calc-reserves` e 5 no `calc-report`), todos verdes no `verificar` abaixo.
- **Playwright `--list`:** 2.377 testes em 81 arquivos por navegador no ponto de partida; 2.406 em 84 no fim (+29: `money-input` 17, `money-export` 5, `image-focus` 3, e os blocos novos do `money-privacy` (+3) e do `image-privacy` (+1), da revisão, d-1).
- **Os testes antigos que mudaram** (§ 696): o teste da dica do `money-calc.spec.ts` (agora com a mensagem de casas exata), o `calc-reserves.test.ts` (a mensagem de casas entre as reservas), dois testes do `calc-defs.test.ts` (o `Table.csv` obrigatório; a célula com o número do CSV), o `tests/e2e/lib/life-calc.ts` (o menos ASCII) e os 11 testes de CSV do `money-home.spec.ts` e do `money-health.spec.ts` (o cabeçalho e as linhas próprios do CSV). O "the card keeps its height with other values…" do `money-card.spec.ts` não mudou uma linha e passou a provar a reserva do F13b c-3.
- **Os specs novos e as partes** (§ 695): o `image-focus.spec.ts` na 5/8 do Chromium e na 9/14 do WebKit; o `money-export.spec.ts` e o `money-input.spec.ts` na 7/8 do Chromium e nas 11/14 e 12/14 do WebKit. Nenhum na 4 do WebKit, a do `clearance.spec.ts`.

## O `pnpm verificar --partes`

No commit `1cab4f6` (o último, com as correções da revisão, o § 700 e o `REVISAO-F16.md`; o código é o do `d93cd0f`), com a máquina livre, em 10/nov/2026 (de 12:03 a 12:56):

```text
Resumo das partes do CI (pnpm verificar --partes, 25 partes lidas de .github/workflows/ci.yml)
  ok      45.5 s  build: pnpm verificar --build
  ok     175.4 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     391.9 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     143.0 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     154.3 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok      98.7 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     141.5 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok      94.2 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     153.2 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok     100.5 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     103.2 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      66.6 s  playwright: pnpm verificar --playwright=webkit --shard=1/14 --dist-pronto
  ok      98.2 s  playwright: pnpm verificar --playwright=webkit --shard=2/14 --dist-pronto
  ok      92.8 s  playwright: pnpm verificar --playwright=webkit --shard=3/14 --dist-pronto
  ok     341.9 s  playwright: pnpm verificar --playwright=webkit --shard=4/14 --dist-pronto
  ok      30.0 s  playwright: pnpm verificar --playwright=webkit --shard=5/14 --dist-pronto
  ok     138.0 s  playwright: pnpm verificar --playwright=webkit --shard=6/14 --dist-pronto
  ok      90.6 s  playwright: pnpm verificar --playwright=webkit --shard=7/14 --dist-pronto
  ok      50.8 s  playwright: pnpm verificar --playwright=webkit --shard=8/14 --dist-pronto
  ok      95.6 s  playwright: pnpm verificar --playwright=webkit --shard=9/14 --dist-pronto
  ok     109.8 s  playwright: pnpm verificar --playwright=webkit --shard=10/14 --dist-pronto
  ok     123.1 s  playwright: pnpm verificar --playwright=webkit --shard=11/14 --dist-pronto
  ok     110.6 s  playwright: pnpm verificar --playwright=webkit --shard=12/14 --dist-pronto
  ok      71.8 s  playwright: pnpm verificar --playwright=webkit --shard=13/14 --dist-pronto
  ok     107.9 s  playwright: pnpm verificar --playwright=webkit --shard=14/14 --dist-pronto
  soma 3129.1 s (parede 3129.1 s; cada parte com o limite de 900 s)
```

Todas as 25 partes passaram, com a parte maior no Lighthouse (391,9 s) e, no Playwright, a 4 do WebKit (341,9 s, a do `clearance.spec.ts`, como antes; F14 m-5). As partes dos specs novos: a 5 do Chromium (94,2 s, o `image-focus`), a 7 (100,5 s, o `money-export` e o `money-input`); no WebKit, a 9 (95,6 s), a 11 (123,1 s) e a 12 (110,6 s). Nenhuma passa de 700 s na máquina. A soma foi de 3.140,8 s (a F15) para 3.129,1 s.

O resto do `verificar`: o Vitest com 136 arquivos e 2.144 testes; os tipos com 0 erro; o `lint:texto` com 7 arquivos, 491 textos e 0 erro de gramática (53 avisos, os nomes próprios e os placeholders de sempre); o `gate:conteudo`, o `gate:prontidao`, o `design`, o `actionlint` e os outros portões ok; o Lighthouse no celular com desempenho de 99 a 100 e acessibilidade, boas práticas e SEO em 100 nas 11 páginas medidas, o CLS 0,000 em todas (a hipoteca e o SAC × PRICE com 99, o LCP de 2,10 s na frase do card).

## O custo

A última execução do CI antes deste relatório é a do push do `1cab4f6` (`pnpm ci:custo 42840433570`): classe **leve**, **6 minutos cobrados**, **3,6 min de parede**, 3 jobs (o `classificar`, o `verificar (leve)` com 158,2 s de `verificar` e o `ci-ok`).

As execuções leves da run, uma por push: `7cf6ff3`, `c6bc112`, `5351bcb`, `321eda0` e `1cab4f6`, todas verdes. O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list`, só leitura), e criá-lo é do Victor (§ 698). A execução completa depois do `gh pr ready` faz esse papel; o resultado dela (o foco, a fala e a altura do card no WebKit e nas fontes do Linux, e o tempo das partes com os specs novos) vai na descrição da PR.

## A revisão

Seis lentes Sonnet em contexto limpo sobre o `321eda0`, numa worktree só de leitura com install, build e build de teste próprios, com céticos ("na dúvida, refutado"): 4 achados, nenhum alto; 1 médio na lente (d-1), que o cético rebaixou a baixo, e 3 baixos. Sobreviveram 2, os dois corrigidos: o d-1 (os specs de privacidade passaram a andar pela mensagem de casas, pelo rascunho, pelo Tab e pelo CSV novo; 3 testes no `money-privacy.spec.ts` e 1 no `image-privacy.spec.ts`, `c1521fc`, com controles negativos no `dist-base` e em dois mutantes) e o f-1 (dois comentários e a pegadinha da F13b diziam que o CSV guarda a data longa; `597edb9` e um bullet no `docs/claude/calculadoras.md`). O E-1 (a Biweekly a 1280 no Chromium, que depende do contexto) e o f-2 (um apóstrofo) foram refutados. A segunda passada (d e f) não achou nada novo de código. As correções entraram no `d93cd0f`. Nenhum baixo novo foi para o grupo 26. Tudo em `docs/relatorios/REVISAO-F16.md` e na § 700.

A junção das três frentes teve um conflito só (o comentário do `nudges` no `CalcPanel.tsx`, que as frentes N e X exportaram igual), resolvido com o texto da frente N.

## As imagens

Em `docs/relatorios/fase-16/` (JPEG 80, 1x, movimento reduzido, Chromium do Playwright, `.cache/f16/shots.ts`; o "antes" do `dist-base`, o resto do `dist/` da junção):

- `hipoteca-3755-360-antes.jpg` e `hipoteca-3755-360-depois.jpg`: o "3755,000" no preço da hipoteca a 360 px, com o erro da faixa e o card parado em $2,396.20 antes, e o card em $19,487.32 depois.
- `casas-decimais-360-pt.jpg`: o Simulador de financiamento de veículo com "80.000,567" no preço e "Use até 2 casas decimais." no card.
- `foco-copiar-link-1280.jpg`: a hipoteca a 1280 px com "99" no prazo e o Tab: o erro no card e o foco no Copiar link.

## A prévia

https://fase-16-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio).

## As decisões novas

§ 681 a § 700 no `DECISOES.md`: a especificação e o que a exploração achou diferente (681), os planos e o prompt (682), a leitura do campo (683), a mensagem de casas (684), uma fala por digitação (685), o foco quando o Baixar sai (686), a forma do CSV (687), o CSV de casa e de saúde (688), os textos nos três idiomas (689), o PDF (690), os bytes em inglês (691), o foco do campo das imagens (692), o orçamento (693), o card, o `nudges` e o c-3 (694), os specs e as partes (695), os testes antigos que mudaram (696), o design system (697), a conferência no Linux (698), os 16 ms (699) e a revisão (700).

## A válvula de estouro

Não foi usada: os oito itens entraram, os itens 6 e 8 inclusive.

## A lista do que é do Victor

1. `git pull` e, na prévia ou no fileorca.com depois do deploy, na hipoteca em inglês, apagar e digitar no meio do número ("3755,000" no lugar de "375,000"); numa calculadora do Brasil, o mesmo com o ponto ("5005.000" no SAC × PRICE); e, num campo de dinheiro de lá, digitar um valor com três casas ("1.234,567") para ler a mensagem de casas.
2. Baixar três CSV (uma calculadora de dinheiro em inglês, uma de casa ou saúde e uma do Brasil), abrir no Google Planilhas e no Excel e somar uma coluna (o do Brasil numa planilha em português).
3. Com um leitor de tela (NVDA no computador ou TalkBack no Android), digitar "99" na taxa e ouvir uma fala só.
4. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
5. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
6. Nenhuma PR das partes do CI foi aberta: na máquina, nenhuma parte com os specs novos passou de 700 s (a maior do Playwright foi a 4 do WebKit, 341,9 s, a do `clearance.spec.ts`, sem spec novo). Se a execução completa mostrar o contrário, a descrição da PR diz.
7. Gerar o prompt da F17 com a skill, com o SHA da main e o grupo 26 do `docs/PENDENCIAS.md`. As escolhas do grupo 26 que são dele: a legenda da Savings goal (m-1), a altura do card na carga (m-2) e a dica do separador num número bem formado (m-3).
