# Plano da F16: calculadoras, digitar sem tropeço e exportar números de verdade

Este plano é o gabarito da revisão adversarial final, ao lado da ficha da F16 (`PLANO-UX-QV.md`, "F16 · Calculadoras: digitar sem tropeço e exportar números de verdade", com o D13 e o D14) e do prompt da run (`docs/prompts/prompt-fase-16.txt`). Onde os dois parecem divergir, vale o mais rigoroso, com um § (decisão 1 do prompt).

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `ee767e2` ("F15: imagem, QR e o caminho entre ferramentas", PR 31). A branch é `fase-16`; a PR é a 32, aberta em rascunho logo depois do primeiro push.
- **No clone, no começo:** os dois arquivos do prompt (`docs/prompts/prompt-fase-16.md` e `.txt`) e a pasta `Claude outputs/`, sem rastreio. Os dois arquivos do prompt entraram no primeiro commit (`7cf6ff3`). O `git diff -- PLANO-FILEORCA.md` não mostrou diferença: o F14 m-1 continua aberto e o arquivo fica fora dos commits (decisão 2).
- **O `dist-base`:** a worktree `.claude/worktrees/f16-base` (destacada em `ee767e2`), com `pnpm install --frozen-lockfile` e `pnpm build`; a cópia do `dist/` fica em `.cache/f16/dist-base`, servida por `node .cache/f16/serve-base.ts 4181`.
- **As medidas do "antes"** saem de `node .cache/f16/measure.ts <origem> <pasta> <modo> <navegador>` (os modos `files`, `card`, `d13`, `speech` e `focus`), com as saídas em `.cache/f16/antes/`. O mesmo script roda no `dist/` da branch no fechamento.
- **Linha de base medida no `dist-base`:**
  - Os três oráculos com `--check` dão zero (`.cache/f16/antes/oracles.log`).
  - **O D13 confere nos dois navegadores** (`d13-*.json`): "3755,000" no preço da hipoteca em en e es, e "5005.000" no SAC × PRICE em pt, mostram o erro da faixa ("Enter a home price from $10,000 to $20,000,000.") e o card fica em $2,396.20; digitado do zero com o milhar ("3,755,000"), o card dá $19,487.32 (R$ 46.245,53 no pt).
  - **As falas** (`speech-*.json`, 120 ms entre as teclas): "99" na taxa dá **duas** falas nos três idiomas e nos dois navegadores (o resultado de 9 % a cerca de 600 ms, e o erro a cerca de 1.460 ms); "3755,000" no lugar de "375,000" dá uma fala (o erro); "425000" do zero dá uma fala (o resultado).
  - **O foco** (`focus-*.json`): o Tab (Alt+Tab no WebKit) depois de "99" no último campo principal (o prazo da hipoteca em en e es, a taxa do SAC × PRICE em pt) deixa o foco no `BODY`, a 360 e a 1280, nos dois navegadores; o Shift+Tab de lá volta ao campo.
  - **O CSV** de todas as 65 páginas com a ilha (18 calculadoras em en e em es, 8 do Brasil em pt, 11 de casa e saúde em en e 5 guias em en e em es) e o PDF das 34 em inglês, com os valores do exemplo (`antes/csv/` e `antes/pdf/`).
  - **A altura do card na carga** a 320, 360 e 1280, nas 65 páginas e nos dois navegadores (`card-*.json`; a hipoteca dá 418, 418 e 428 px).
  - **O JS** (`antes/gzip.json`, por `node .cache/f16/gzip-sizes.mjs`): 66 arquivos em `_astro/`. Cada página de calculadora carrega 3 arquivos na primeira pintura pela contagem do script (a ilha `CalcIsland…BD68fcZk.js`, com **34.281 B com gzip**; o `entry`; e o chunk comum `island.Cxrml0d8.js`, com 22.889 B), 58.602 B com gzip ao todo. As de imagem carregam o `…Page` de cada uma, o `entry` e o mesmo chunk comum (o Comprimir, 25.049 B).
  - O Vitest, o `--list` de cada navegador e os orçamentos (`budgets.spec.ts` e `i18n-budgets.spec.ts`) na worktree base, com as saídas em `.cache/f16/antes/` (os números entram no relatório).
  - A imagem `hipoteca-3755-360-antes.jpg` (`node .cache/f16/shots.ts http://127.0.0.1:4181 antes`).

### O que a exploração achou de diferente do plano

- **D13** confere no código: o `PATTERNS` de `src/calc/parse.ts` exige de 1 a 3 dígitos antes do primeiro separador de milhar. O "3,755,00" da ficha ("continua com a dica") **não** tem a dica hoje: a dica só aparece quando o texto com os separadores trocados lê, e "3.755.00" não lê em inglês. A regra nova da decisão 3 dá a dica a ele (§ 683).
- **D14** fala em "8 calculadoras". O CSV com texto da tela está em 9 tabelas de casa e de saúde (Square footage, Mulch, Paint, Tile, BTU, Calorie, BMI, Ovulation e Due date); a Concrete já sai limpa, menos o rótulo "40 lb bags" e um número de sacos acima de 999; a Body fat só tem "25.9%" e o "—". As calculadoras de dinheiro já escrevem número limpo (`{ cents }` e índices em algarismos). O teste do critério 5 percorre todas as tabelas, não uma lista de 8.
- **F6 g-2** é mais largo que o cartão de crédito do Brasil: o `valueText` do `view.ts` ignora o sufixo de toda taxa. Além do "% a.m." do Rotativo e do Parcelado (`br-credit-card`), o "% of value" / "% del valor" da manutenção e do custo de venda da Rent vs buy (en e es) também some no PDF.
- **F15 R-b-1:** a linha da fila não é trocada; o que sai do DOM é o botão das ações do `FileCard` (Baixar, depois Cancelar, depois Baixar de novo). O `NumberField` é dividido com as ferramentas de PDF: a correção fica no `ImagePanel.tsx`.
- **O `nudges` (§ 595)** passa a ler "um zero a mais" de todo valor com milhar ("375,0000" lê 3.750.000): a decisão 13 manda medir a altura do card antes e depois.
- **O rótulo `ci` não existe** (`gh label list`): a conferência no Linux do meio da run não acontece (decisão 19, § 698).

## 2. Os § reservados

Só o agente principal escreve no `DECISOES.md`. As frentes escrevem os seus rascunhos de § nas notas (`.cache/f16/front-<x>.md` da própria worktree), e o agente principal os põe nos § reservados, na junção.

| § | Assunto | Quem escreve |
| --- | --- | --- |
| 681 | A especificação: a ficha e o prompt como contrato; as diferenças achadas (o "3,755,00", o "8 calculadoras") | principal |
| 682 | Os planos, o `PLANO-FILEORCA.md` sem diferença (o F14 m-1 aberto) e o prompt gravado | principal |
| 683 | A leitura do campo (decisão 3): a regra, o `readNumber`, a dica e o link do cenário intocado | principal, com as notas da frente N |
| 684 | A mensagem de casas (decisão 4) | principal, com as notas da frente N |
| 685 | Uma fala por digitação (decisão 5): onde mora o rascunho e como a região espera | principal, com as notas da frente N |
| 686 | O foco quando o Baixar sai (decisão 6): o mecanismo e o controle seguinte | principal, com as notas da frente N |
| 687 | A forma do CSV: o `Cell`, o `Table` e o tipo de cada coluna (decisão 7) | principal, com as notas da frente X |
| 688 | O CSV de cada tabela de casa e de saúde: unidade, coluna "Unit", intervalo, data, sinal e rótulo | principal, com as notas da frente X |
| 689 | Os textos novos nos três idiomas, lado a lado (decisões 4, 7, 8 e 11) | principal |
| 690 | O PDF: a-6, g-2 e COR-16 (decisão 8) | principal, com as notas da frente X |
| 691 | Os bytes em inglês do CSV e do PDF, antes e depois (decisão 9) | principal, no fechamento |
| 692 | O foco no campo de número das imagens (decisão 10) | principal, com as notas da frente I |
| 693 | O orçamento (decisão 12) | principal, no fechamento |
| 694 | O card, o `nudges`, o CLS e os anúncios (decisão 13) | principal, com a medida da frente N |
| 695 | Os specs novos: nomes e partes (decisão 14) | principal |
| 696 | Os testes antigos que mudaram, no formato da § 341 | principal, com as notas das frentes |
| 697 | O design system: os README, antes e depois (decisão 15) | principal |
| 698 | A conferência no Linux: o rótulo `ci` não existe (decisão 19) | principal |
| 699 | Os 16 ms: as três rodadas contra o `dist-base` (critério 6) | principal, no fechamento |
| 700 | O resultado da revisão adversarial | principal, depois da revisão |

Decisão que não couber num desses vira um § novo a partir do 701, na ordem em que for escrito.

## 3. A interface que as frentes dividem (fatia 1, do agente principal)

### 3.1 Os textos que todas as calculadoras dividem (`CalcSharedTexts`, `src/tools/calc/i18n/{en,pt,es}.ts`)

| Chave | en | pt (contrato onde o prompt fixa) | es |
| --- | --- | --- | --- |
| `decimalsMany` (n ≥ 2, com `{n}`) | Use up to {n} decimal places. | Use até {n} casas decimais. | Usa hasta {n} decimales. |
| `decimalsOne` (n = 1) | Use up to 1 decimal place. | Use até 1 casa decimal. | Usa hasta 1 decimal. |
| `decimalsNone` (n = 0) | Use a whole number. | Use um número inteiro. | Usa un número entero. |
| `csvUnit` (a coluna das unidades) | Unit | Unidade | Unidad |
| `csvFrom` (o começo de um intervalo) | {label} (from) | {label} (de) | {label} (desde) |
| `csvTo` (o fim de um intervalo) | {label} (to) | {label} (até) | {label} (hasta) |

O cabeçalho com a unidade é "{rótulo} ({unidade})" nos três idiomas ("Area (sq ft)"), montado pelo código da tabela. O `{n}` da mensagem de casas já tem amostra no `lint:texto` (12, nos três idiomas); a de n = 1 não tem placeholder.

### 3.2 A forma do CSV (`src/tools/calc/types.ts`)

```ts
/** What a CSV column holds: numbers (no grouping, ASCII minus, a % glued to its number), days (YYYY-MM-DD) or text. */
export type CsvKind = 'number' | 'date' | 'text';
/** One value a cell writes in the CSV: a number at a scale, money, a day, a text, or nothing (an empty cell). */
export type CsvValue = { scaled: number; decimals: number; percent?: boolean } | { cents: number } | { day: string } | { text: string } | null;
export type Cell = { cents: number } | { text: string; short?: string; csv?: readonly CsvValue[] } | { scaled: number; decimals: number };
export interface Table {
  // ...o de hoje...
  /** The CSV columns after the year of a grouped table: the header of each (with its unit) and its kind. A text cell with
   * `csv` writes its values in that many columns; every other cell writes one. */
  csv?: readonly { head: string; kind: CsvKind }[];
}
```

A fatia 1 põe a forma no tipo, opcional. A frente X a usa em todas as tabelas, a torna obrigatória quando todas a declaram (ou registra por que não), e muda o `csvText`. A tela (`cellText`, `CalcSchedule`) e o PDF (`reportInput`) continuam lendo `head`, `text`, `short`, `cents` e `scaled` como hoje: nenhum byte da tela nem da tabela do PDF muda pelo item 5.

### 3.3 O rascunho que não lê (`src/tools/calc/store.ts`, da frente N)

```ts
interface CalcStore {
  // ...o de hoje...
  /** The field with this id has a text that does not read (on) or reads again (off): only the passages count. */
  draft(id: string, on: boolean): void;
  /** Some field has a draft that does not read now: the card's region waits. */
  drafting(): boolean;
  /** Called when `drafting()` changes, never on a key that keeps it; the island does not repaint for it. */
  onDraft(listener: () => void): () => void;
}
```

O `draft` não chama o `notify` da store (nada repinta a ilha). O `wrong(id, erro)` com erro tira o id do rascunho antes de avisar. O `CalcField` chama o `draft` na hora, dentro do `onInput` (antes do ouvinte de `input` da ilha), e nunca enquanto o erro já está à vista.

## 4. Quem faz o quê

| Fatia | Quem | O que | Arquivos |
| --- | --- | --- | --- |
| 1 | principal | O primeiro commit, o push, a PR em rascunho; o plano; as chaves de texto da seção 3.1 nos tipos e nos três idiomas; a forma da seção 3.2 no tipo | `docs/relatorios/fase-16-plano.md`, `src/tools/calc/types.ts`, `src/tools/calc/i18n/{en,pt,es}.ts` |
| 2 | frente N (opus, worktree) | Itens 1 a 4: a leitura, a mensagem de casas, a fala, o foco do Baixar; as reservas e o `nudges`; os testes dos critérios 1 a 4; a medida da altura do card (decisão 13) | `src/calc/parse.ts`, `src/tools/calc/{CalcField.tsx,form.ts,store.ts,ResultHero.tsx,CalcPanel.tsx,Fields.tsx}`; `tests/unit/calc-parse.test.ts`, `tests/unit/calc-field.test.ts` (novo), `tests/unit/calc-reserves.test.ts`; `tests/e2e/money-input.spec.ts` (novo), `tests/e2e/money-calc.spec.ts` (o teste da dica) |
| 2 | frente X (opus, worktree) | Itens 5, 6 e 7: o CSV de toda tabela, o PDF (a-6, g-2, COR-16), a conferência com o oráculo, os bytes antes e depois | `src/tools/calc/{exports.ts,view.ts,types.ts}`, `src/tools/calc/defs/*.ts`, os textos de `src/tools/<calculadora>/i18n/` que o CSV e o PDF pedem, `src/tools/calc/i18n/*` (só chave nova que a X precisar), a linha `csv={…}` do `CalcPanel.tsx`; `tests/unit/calc-csv.test.ts` (novo), `tests/unit/calc-report.test.ts`, `tests/unit/calc-defs.test.ts`, `tests/unit/calc-i18n.test.ts`, `tests/e2e/lib/life-calc.ts`, `tests/e2e/money-home.spec.ts`, `tests/e2e/money-health.spec.ts`, `tests/e2e/money-export.spec.ts` (novo) e os outros specs que fixam o CSV |
| 2 | frente I (opus, worktree) | Item 8: o foco depois do `render()` do lote | `src/tools/image/ImagePanel.tsx` (e o `NumberField.tsx` só se for preciso, sem mudar o que o PDF vê); `tests/e2e/image-focus.spec.ts` (novo) |
| 2 | principal, ao mesmo tempo | Os textos das páginas que o comportamento novo desmentir; os README do `docs/design/`; a seção nova do `docs/claude/calculadoras.md`; o `docs/PENDENCIAS.md`; os § | `docs/` |
| 3 | principal | A junção de N, X e I (merge `--no-ff` com o trailer), os conflitos, o `pnpm tipos`, os specs das três frentes nos dois navegadores, os de anúncio no build de teste; a conferência no Linux (pulada, § 698) | — |
| 4 | principal | O orçamento contra o `dist-base`; as três rodadas dos 16 ms; a altura do card; os oráculos com `--check`; as imagens; as tabelas do relatório | — |
| 5 | seis lentes Sonnet + céticos + um agente de correções (opus) | A revisão adversarial sobre um commit fixo, numa worktree só de leitura | `docs/relatorios/REVISAO-F16.md` |
| 6 | principal | O `pnpm verificar --partes`, o relatório, a sequência de fim da decisão 19 | `docs/relatorios/fase-16.md` |

Donos dos arquivos divididos: o `types.ts` é da X depois da fatia 1 (a N não mexe nele); o `CalcPanel.tsx` é da N, menos a linha do `csv={…}` da `ExportBar`, que a X pode mudar; o `money-calc.spec.ts` é das duas (a N, o teste da dica; a X, os do CSV), e a junção junta os blocos.

Portas: a N usa `FO_PORT=4175`, a X 4176, a I 4177; o `dist-base` fica em 4181 (só leitura, para os controles negativos); cada frente serve o próprio `dist/` em 4185, 4186 e 4187 quando precisar do `measure.ts`.

## 5. As regras de cada frente

### Frente N

1. **A leitura (item 1, decisão 3).** No `parse.ts`, uma função ao lado do `parseScaled` diz por que um texto não lê, e o `parseScaled` passa a usá-la sem mudar a assinatura nem o contrato (número ou `null`). Em cada idioma, G é o separador de milhar e D o decimal:
   - O texto se divide no D. Mais de um D, ou um G depois do D, não lê.
   - Na parte inteira, cada G seguido de exatamente 3 dígitos e depois de outro G, do D ou do fim é milhar; seguido de 1 ou 2 dígitos e do fim do texto (sem D) não lê, e o motivo é "separador" (a dica); em qualquer outra posição é ignorado. Milhar e ignorado tiram o G do número.
   - O sinal da moeda, o %, o menos só no campo que aceita negativo, os 15 dígitos e as casas do campo continuam como hoje. O `readLink` não muda.
2. **A dica** aparece só em campo com casas, quando o motivo é "separador" ou quando o texto com os separadores trocados lê (§ 251 e § 254).
3. **A mensagem de casas (item 2, decisão 4).** Uma função pura no `form.ts` dá a mensagem de um texto: nenhuma (lê e está na faixa), a de casas (bem formado, mais casas que o campo, e o valor com as casas cortadas na faixa), ou a da faixa, com a dica quando a regra 2 manda. O n é o `decimalsOf`. A mensagem vai pelo `report` de hoje (o card, o `aria-invalid`, o `aria-describedby`; § 545 e § 593), e a mais longa de cada campo entra no `heroReserves`.
4. **A fala (item 3, decisão 5).** A store da seção 3.3. O `ResultHero` para o tempo que estiver correndo enquanto houver rascunho, guarda que havia fala, e fala uma vez quando o rascunho lê de novo ou vira erro. A fala de hoje (o texto e os 500 ms contados da última tecla) não muda.
5. **O foco (item 4, decisão 6).** O `ResultHero` sabe quando o Baixar tem o foco ou é o alvo dele (o `relatedTarget` de um `focusout` na ilha) e, quando o Baixar sai do DOM com o foco nele ou a caminho, põe o foco no controle seguinte que existe na ordem de tabulação, depois do lugar do Baixar (hoje, o Copiar link). Sem `preventDefault`, sem devolver o foco ao campo. Conferir nos dois navegadores que o `relatedTarget` vem (no WebKit, com Alt+Tab), com a ordem do DOM como reserva.
6. **O card (decisão 13).** Medir a altura do card na carga em todas as páginas, a 320, 360 e 1280, nos dois navegadores, com `node <principal>/.cache/f16/measure.ts <origem> <pasta> card <navegador>`, contra o `.cache/f16/antes/card-*.json`. Se alguma mudar, o `nudges` guarda os valores de hoje (com um rascunho de §), a menos que a reserva nova resolva o F13b c-3 sem levar número para baixo da dobra.
7. **Os 16 ms:** o `onInput` não pode ficar mais caro que uma leitura e uma troca de conjunto; nada de repintar a ilha por causa do rascunho.

### Frente X

1. **Cada célula do CSV guarda uma coisa só** (decisão 7): número no formato do CSV do idioma, sem milhar, com o menos ASCII, as casas da célula e o % colado; data AAAA-MM-DD; ou texto (o nome da linha, da categoria ou do item, o rótulo do grupo). Nenhum texto com U+2212, número com milhar, número seguido de unidade, nem nome de mês dos três idiomas.
2. **A unidade sai da célula:** para o cabeçalho quando a coluna tem uma só; para a coluna "Unit" logo depois dela quando a coluna mistura (dinheiro nessa coluna leva USD, ou BRL no pt). Um nome de linha com número e unidade ("Bags of 2 cu ft", "40 lb bags", "Energy Star table for 350.00 sq ft", "12 × 12 in") muda só no CSV, sem perder dado que só o CSV traria; cada escolha num rascunho de §.
3. **Intervalo** em duas colunas (de, até), o lado aberto vazio; "—" vazio. As linhas são as da tela: só as colunas se desdobram.
4. **O separador, as aspas, o CRLF e o BOM** não mudam. A tela e o PDF não mudam pelo item 5.
5. **Toda tabela declara as colunas do CSV** com o tipo, e o Vitest confere cada célula contra o tipo da coluna.
6. **O PDF (item 6, decisão 8):** a-6 ("Circle: diameter 24.5 ft"), g-2 (o período do sufixo da taxa, "14% a.m.", e cada valor de uma linha de lista com o rótulo), COR-16 (rótulo em toda linha do PDF e um "você" só na Savings goal, sem mudar texto do resultado na tela). O `fieldText` (a linha do card) não muda. Cada correção com um teste sobre o `inputRows` ou o `reportInput` que reprova sem ela.
7. **Os bytes em inglês** (decisão 9): para cada calculadora em inglês cujo CSV ou PDF mudou, o cabeçalho e as três primeiras linhas do CSV, antes e depois, e as linhas de texto do PDF que mudaram, antes e depois (os do "antes" em `.cache/f16/antes/csv` e `antes/pdf`).

### Frente I

1. No `blur` do campo de número das imagens, guardar para onde o foco ia (o `relatedTarget`), de preferência por um `focusout` na raiz do `ImagePanel` (o `NumberField` é dividido com o PDF). Depois do `render()`, se o foco caiu no `body` ou o nó guardado saiu do DOM, pôr o foco nele ou no mesmo lugar da linha nova (a mesma `data-row`, o mesmo papel do botão). Sem prender o foco no campo. A marca só se gasta quando o alvo existe (§ 510 e a pegadinha da F13a do `imagem.md`).
2. Vale no "Tamanho máximo" do Comprimir, na largura e na altura do Redimensionar, e no Cortar se ele refizer a linha escolhida.

## 6. Os critérios, cada um com o seu teste ou comando

| Critério | Prova | Controle negativo (no `dist-base` ou na regra antiga) |
| --- | --- | --- |
| Ficha 1 / prompt 14 (a leitura) | `tests/unit/calc-parse.test.ts`: os casos da ficha e da decisão 3 nos três idiomas, escritos à mão ("3755,000" en e "3755.000" pt leem 3.755.000; "6,5" na taxa en com a dica; "1,234" lê 1.234; "375,0005" lê 3.750.005; "3,755,00" com a dica; "375," lê 375; "1.234,56" en e "1,234.56" pt não leem, com a dica; um G depois do D; os negativos de sempre: letras, dois D, o menos sem negativo, 16 dígitos, vazio); `tests/unit/calc-field.test.ts`: a mensagem de casas com n = 0, 1, 2 e 4 | O Vitest novo rodado com o `parse.ts` do ponto de partida reprova nos casos novos |
| Ficha 2 | `tests/e2e/money-input.spec.ts`: o cursor no meio do número (`setSelectionRange`) e a tecla pelo `page.keyboard`, na hipoteca em en, no SAC × PRICE em pt e na hipoteca em es: sem erro, e a parcela igual à do número digitado do zero | No `dist-base`, o erro da faixa (`d13-*.json`) |
| Ficha 3 | `money-input.spec.ts`: o `MutationObserver` no `p.fo-sr[aria-live]` do `.fo-rhero`, uma fala por valor digitado ("99" na taxa, "3755,000" no lugar de "375,000", "425000" do zero), em en, pt e es | No `dist-base`, o "99" dá duas falas (`speech-*.json`) |
| Ficha 4 | `money-input.spec.ts`: Tab (Alt+Tab no WebKit) depois de um valor errado no último campo principal (en, pt, es) e num campo de lista (as dívidas, a Square footage): o `activeElement` é o controle seguinte, nunca o `body`, a 360 e a 1280; o Shift+Tab volta ao campo | No `dist-base`, `BODY` (`focus-*.json`) |
| Ficha 5 | `tests/unit/calc-csv.test.ts`: o CSV de toda calculadora em cada idioma que ela tem, com o exemplo, com os `nudges`, com o BTU negativo e com uma data; o tipo de cada coluna; as expressões de número e de data; nada proibido no texto; os números de casa e saúde iguais aos da fixture `page-example`. `tests/e2e/money-export.spec.ts`: o CSV baixado de uma calculadora de cada tipo, nos dois navegadores, com os bytes do Vitest. `money-privacy.spec.ts` e `money-life-privacy.spec.ts` verdes | O Vitest novo reprova nas tabelas do ponto de partida (`antes/csv/`) |
| Ficha 6 | `money-speed.spec.ts` no Chromium, três rodadas alternadas `dist-base` e novo; a mediana dos p95 do novo não passa a do `dist-base` em mais de 1 ms em nenhum caso | — |
| Ficha 7 | `git diff --stat ee767e2 -- src/calc scripts/oracle fixtures` só com o `src/calc/parse.ts`; os três oráculos com `--check` dão zero; o `calc-oracle.test.ts` sem mudança | — |
| Item 6 | `tests/unit/calc-report.test.ts`: a-6, g-2 e COR-16, cada um sobre o `inputRows` ou o `reportInput` | Cada teste reprova sem a correção |
| Item 8 | `tests/e2e/image-focus.spec.ts`: lote de três no Comprimir (em "Até um tamanho") e no Redimensionar; depois do resultado, o Tab para fora do campo leva ao controle seguinte, nunca ao `body`, nos dois navegadores; o Shift+Tab volta; o lote refaz uma vez (o contador de `tests/e2e/lib/workers.ts` no Chromium, o `href` do Baixar nos dois) | No `dist-base`, o foco no `body` |
| Decisão 12 | `budgets.spec.ts` e `i18n-budgets.spec.ts` sem mudar número; `gzip-sizes.mjs` arquivo a arquivo contra o `dist-base`; a ilha das calculadoras cresce até 4 KB com gzip | — |
| Decisão 13 | `money-card.spec.ts` ("the card keeps its height…", "the number ends above the cookie notice…", "the number keeps 2px…"); `measure.ts card` antes e depois; `layout-shift.spec.ts`; `ads.spec.ts`, `fo-ad-map.spec.ts` e `ads-coffee.spec.ts` no build de teste | — |
| Prompt, critério 5 | `money-privacy.spec.ts`, `money-life-privacy.spec.ts`, `events.spec.ts`, `image-privacy.spec.ts` | — |
| Prompt, critério 6 | `pnpm lint:texto` com 0 erro; `gate:conteudo`, `gate:dinheiro-saude`, `english-leak.test.ts`, `glossary.test.ts`, `claude-md.test.ts`, `pendencias.test.ts` | — |
| Prompt, critério 9 | `pnpm verificar --partes` na máquina; os specs novos nas partes pelo tempo da PR 31 (`money-input` e `money-export` caem no Chromium 7 e no WebKit 11 ou 12; `image-focus` no Chromium 5 ou 6 e no WebKit 9); o CI completo verde | — |

## 7. Os specs novos e as partes

- Os nomes saem das partes da execução completa da PR 31 (`42737967110`; o `--shard` corta a lista dos testes em ordem alfabética, sem lista no `ci.yml`): `money-input.spec.ts` e `money-export.spec.ts` entram entre o `money-home` e o `money-life-privacy` (Chromium 7, com 388 s; WebKit 11 ou 12, com 492 e 440 s). O `image-focus.spec.ts` entra entre o `image-crop` e o `image-list` (Chromium 5 ou 6, com 298 e 586 s; WebKit 9, com 357 s). Nenhum cai na parte 4 do WebKit (a do `clearance.spec.ts`, já acima de 700 s pelo F14 m-5). Depois de criar os arquivos, o `--list --shard` confere.
- Nenhum spec novo usa o build de teste.

## 8. A ordem do fechamento

1. A junção, com o `pnpm tipos`, o `pnpm lint`, o `pnpm build`, o Vitest inteiro e os specs da seção "Verificação" do prompt nos dois navegadores.
2. O push, a execução leve verde.
3. A conferência no Linux: pulada (o rótulo `ci` não existe; § 698).
4. O orçamento, os 16 ms (três rodadas), a altura do card, os oráculos, as imagens.
5. A revisão adversarial sobre um commit fixo, as correções, a segunda passada.
6. O `pnpm verificar --partes` no último commit de código, com a máquina livre.
7. O relatório e a revisão commitados; o push; a execução leve verde; o `gh pr ready`; a execução completa acompanhada até o fim; o `pnpm ci:custo` na descrição da PR.
