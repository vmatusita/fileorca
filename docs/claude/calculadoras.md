# Calculadoras

O que as runs aprenderam sobre as calculadoras de dinheiro, do Brasil, de casa e de saúde, os oráculos e os formulários, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem (a versão de uma calculadora em pt ou es está em `idiomas.md`); as runs acrescentam no fim, numa seção nova.

## F4: calculadoras

Convenção do dinheiro (DECISOES § 111 e § 127):

- Dinheiro em centavos inteiros; taxa em 1/10.000 de ponto percentual (6.5% = 65000, 100% = `ONE` = 1.000.000). Divisão em BigInt, metade para cima; juros de cada período ao centavo; a última parcela zera o saldo.
- O valor esperado vem do oráculo, nunca do motor: mudou a convenção, mude o `scripts/oracle/calc.py`, regere as fixtures e commite antes do motor (o `git log -- fixtures/calc src/calc` mostra a ordem).
- `src/calc/` não importa nada de fora da pasta (regra do ESLint, testada em `quality.test.ts`).

Como acrescentar uma calculadora:

1. O caso no oráculo (`scripts/oracle/calc.py`: a função, a grade, os aleatórios com semente `2026-10-31/<id>`, o `page-example` e, se houver, o exemplo oficial em `OFFICIAL_CHECKS` e no `fixtures/calc/OFICIAIS.md`). Regere e commite as fixtures.
2. O motor em `src/calc/` e o id em `ENGINES` (`src/calc/index.ts`).
3. O id no `src/tools/calc/registry.ts` (`CALC_PAGES`: caminho, mãe, ícone, grupo, chips, relacionadas, guia e nome do arquivo) e em `CALC_EVENT_TOOLS` (`src/analytics/tool-ids.ts`); a rota sai sozinha de `moneyRoutes()`.
4. A definição em `src/tools/calc/defs/` (campos com faixa fixa, `initial` igual ao `page-example`, `toInput`, `view`) e a entrada em `DEFS`.
5. Os textos em `src/tools/<slug>/i18n/en.ts` (`CalcPageTexts`: o erro diz a faixa, os blocos que o `gate:conteudo` e o `gate:dinheiro-saude` pedem) e o cartão em `src/i18n/en/common.ts` (`calcs`); a página em `src/pages/<slug>/index.astro` com `<CalcTool id lang="en" />`.
6. Testes: o `calc-defs.test.ts`, o `budgets.spec.ts`, o `ads.spec.ts`, o `money-privacy.spec.ts` e o `a11y.spec.ts` já pegam a página pelo registro. Confira o resultado acima da dobra a 360 × 740 (o `ads.spec.ts` reprova).

Pegadinhas que a F4 achou:

- No celular, o número do ResultHero tem de ficar acima de 740 px (§ 124). Campos principais: no máximo duas linhas de dois campos de meia largura, sem ajuda fixa, com rótulo que cabe numa linha ao lado da etiqueta "example" (até uns 75 px a 15 px de fonte). O que não cabe desce para depois do resultado. As páginas de preset têm a trilha de navegação em três linhas e ficam a 13 px da dobra.
- A ilha tem duas raízes com uma store (`#fo-tool-root` e `#fo-calc-schedule`). Mudança feita na store logo depois do `hydrate()` (o link do cenário) precisa do `useCalc` que repinta se a store mudou antes da assinatura (§ 128).
- Mesmo `#` na mesma página não recarrega: no teste, vá a `about:blank` antes de abrir outro link do cenário.
- Tabela com células sem quebra numa página estreita: moldura com `width: 0; min-width: 100%` (`.fo-table-wrap`, `.fo-amort-wrap`), senão a página inteira rola para o lado a 320 px (§ 129).
- O `lint:texto` preenche os `{placeholders}` dos textos de dinheiro com valores reais (`MONEY_SAMPLES` e os números do guia, § 123). Um placeholder novo sem amostra vira "$1,234": confira se a frase ainda faz sentido.
- O PDF usa as fontes padrão (só WinAnsi): o `winAnsi()` troca o sinal de menos, as aspas curvas e o resto. Texto novo do PDF com caractere fora do WinAnsi some.
- Medida de tempo no WebKit anda de 1 em 1 ms: o teste dos 16 ms só afirma o limite no Chromium e imprime o WebKit.
- A grade dos campos usa subgrid (§ 137): cada item ocupa duas linhas, e o `CalcField` tem dois filhos, o rótulo e o `.fo-field__body`. Um `fieldset` (grupo de opções) fica fora do subgrid, porque no WebKit ele deixava 12 px vazios. Componente novo na grade: confira a altura dele e a do vizinho nos dois navegadores.
- Enquanto o resultado é um problema, ou fica velho por um campo a corrigir, o PDF e o CSV ficam desligados (§ 139). Um teste que precisa baixar arquivo tem de deixar a conta com resultado (o `money-privacy.spec.ts` desce a sentinela até isso acontecer).

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **O número do resultado no celular** (§ 124) ficou com folga zero numa página em português (o veículo, a 740 px). Português e espanhol são mais longos: meça a 360 × 740 nos dois navegadores antes de escrever o lead e os rótulos de meia largura.
- **Um rótulo com a etiqueta "exemplo" numa meia coluna** tem de caber a 360 px (palavra mais longa + 12 px + 72 px da etiqueta ≤ 158 px). A 320 px, a etiqueta desce de linha (`flex-wrap`, § 234); a 360 px isso empurraria o resultado para baixo da dobra. "Parcelamento" não coube; "Parcelado" cabe.

## F7: casa, saúde e QR code

Como uma calculadora de casa ou de saúde entra:

1. O caso no `scripts/oracle/calc_home_health.py` (a função, a grade, os aleatórios com semente `2026-11-02/<id>`, o `page-example` e, se houver, o exemplo oficial em `OFFICIAL_CHECKS` e no `fixtures/calc/OFICIAIS.md`). Onde entra π ou log10, a saída leva `exact` (30 algarismos) e o oráculo refaz o sorteio perto de um empate. Regere e commite as fixtures antes do motor.
2. O motor em `src/calc/home.ts` ou `health.ts` (frações em BigInt, `Math.PI`/`Math.log10` só onde precisa, dias por `src/calc/dates.ts`) e o id em `ENGINES`.
3. O id em `HOUSE_CALC_IDS` ou `HEALTH_CALC_IDS` e a linha em `LIFE_CALC_PAGES` (`src/tools/calc/registry.ts`): o hub (`house` ou `health`) decide o AdSlot (`casa-saude`), a cor (`home`, violeta só no preenchimento), o breadcrumb, a lista de fontes do `gate:dinheiro-saude` (`ymylHubOf`), a comemoração da Oli (nunca na saúde) e o `WebApplication`. O id entra em `CALC_EVENT_TOOLS`; a rota sai de `lifeRoutes()`.
4. A definição em `src/tools/calc/defs/house.ts` ou `health.ts` e a entrada em `DEFS`: medidas com `measure(key, decimais, min, max)` (`kind: 'dec'`), datas com `DateSpec` (`<input type="date">`, faixa fixa), a lista com menu de linha (`ListSpec.pick`) e o botão de acrescentar depois do resultado (`addBelow`); `today: true` se a conta precisa do dia do aparelho; a tabela do resultado com `open: true`.
5. Os textos em `src/tools/<id>/i18n/en.ts` (`CalcPageTexts`; o erro de cada campo diz a faixa com as casas da medida) e o cartão em `enCommon.calcs`; a página `src/pages/<id>/index.astro` com `<CalcTool id lang="en" />`.
6. Os testes que leem o registro pegam a página nova (`calc-defs`, `calc-oracle`, `a11y`, `ads`, `budgets`, `money-life-privacy`); o caso dela entra no `money-home.spec.ts` ou no `money-health.spec.ts`.

O hub de cada uma é lido de `LIFE_HUB_IDS` (a ordem) e de `src/i18n/life-hubs.ts` (os textos, só em inglês), pela view `src/views/LifeCalculatorsView.astro`.

Pegadinhas que a F7 achou:

- **O `lead` de uma calculadora em três linhas** custa 56 px a 360 px: com um OptionGroup e duas linhas de campos de meia largura, o resultado passa da dobra. O `lead` das páginas com OptionGroup cabe numa linha.
- **Datas:** o motor só vê dias inteiros; o "hoje" é lido pela ilha com `getFullYear()`, `getMonth()` e `getDate()` do aparelho, nunca do UTC. Nos testes, fixe o relógio com `page.clock` e o fuso no contexto.
- **O WebFetch não abre** acog.org, apps.dtic.mil nem esd.whs.mil (403), e o NCBI Bookshelf pede reCAPTCHA: a fonte vira o PubMed, o PMC ou outra página oficial do mesmo órgão, e o que não abriu fica como pendência.

## F7: o que a revisão mudou nos formulários das calculadoras

- **Erro de faixa vai ao store** (§ 276). O `CalcField` e o `DateField` recebem `report` (o `wrong(id, is)` do store) e avisam quando mostram ou deixam de mostrar o erro de faixa. Enquanto houver um campo assim, o resultado fica velho: aparece a linha "Fix the highlighted field…", e o PDF e o CSV ficam desligados. Campo novo que valida a própria faixa passa o `report` adiante, como o `NumberInput` do `Fields.tsx`.
- **Tabela aberta** (§ 275). Uma tabela sem grupos por ano (`CalcView.open`) sai com `fo-amort--flat`: sem coluna fixa e com texto que quebra. Ela tem de caber a 320 px. O `calc-form.spec.ts` mede isso nas páginas de casa e saúde.
- **Campos estreitos** (§ 277). O `calc-form.spec.ts` lê os `DEFS` e confere, a 320 e 360 px:
  - cada número visível com o exemplo e com o máximo da faixa (`scrollWidth ≤ clientWidth`);
  - cada opção de cada menu, medida com a fonte do menu;
  - o menu e a data na linha inteira abaixo de 360 px, só nas páginas de casa e saúde (`fo-calc--home`, § 282); as de dinheiro guardam as meias linhas, e o teste confere.

  Antes de criar um campo de meia largura com unidade longa, ou um menu com opção longa, rode esse spec.
- **Foco das áreas** (§ 278). Só o clique no "Add an area" move o foco para a linha nova (`addedBelow`, estado do módulo `Fields.tsx`). As linhas que o link do cenário traz não mexem no foco.

## F8: piloto automático

Pegadinhas que a F8 achou:

- **O erro de faixa das calculadoras espera 800 ms sem tecla ou a saída do campo** (`SETTLE_MS`, § 305). Teste que digita um valor fora da faixa espera o alerta com `expect` (que já espera), nunca na hora.

## Ajuste: idiomas

Pegadinhas que o ajuste achou:

- **A regra dos 740 px (§ 124) é medida só com a Figtree** (o `ads.spec.ts`). Na primeira visita, com a fonte de reserva, um lead ou um rótulo mais longo ganha uma linha e gasta a folga: o lead completo da Alquilar o comprar em es levou o número de 712 a 740 px e o CLS de 0 a 0,020 (§ 321, R2-01). Texto novo perto da dobra: rode o `layout-shift.spec.ts` na largura da página e confira o CLS que ele imprime.
- **Um rótulo de meia largura com duas palavras quebra inteiro** e leva a etiqueta "ejemplo" para a linha de baixo na fonte de reserva ("Tasa nueva", "Tasa anual"). A regra da F6 (palavra mais longa + 12 + 72 ≤ 158 px) não vê isso (pendência "Idiomas E-2").

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **O ResultHero é o lugar do resultado, do Baixar PDF e do erro** (DECISOES § 545). O Baixar PDF é o `.fo-rhero .fo-btn--download` (não mais o 1º `.fo-export .fo-btn`); a ExportBar tem só o "Download CSV" (o `nth(0)`) e o Copiar link (o `nth(1)`). Sem resultado (campo errado ou conta impossível), o Baixar sai do DOM (`toHaveCount(0)`, nunca `toBeDisabled`), e o lugar dele (`.fo-rhero__get`) guarda a altura com a mensagem `#fo-rhero-error`. Teste que usava o `isEnabled()` do Baixar como sinal de "há resultado" passa a contar o botão, depois de dois quadros.
- **O erro de um campo não mora mais no campo:** não existe `#fo-calc-<k>-error` nem `role="alert"` no formulário. A mensagem está em `#fo-rhero-error`, o campo tem `aria-invalid` e o `aria-describedby` com `fo-rhero-error`, e a região viva do card diz o erro meio segundo depois (uma voz só, § 102). O "Last result that worked: {label} {value}." fica em `.fo-rhero__stale`, na célula da frase (que fica com `visibility: hidden`).
- **O store guarda o último resultado que valeu** (`good`: a `view` e os valores) e os campos com erro (`errors`, por id, com a mensagem e o rótulo). O `report` dos campos passou de `(id, wrong: boolean)` a `(id, { message, label } | null)`. Um erro marca o store como tocado (sem isso, o primeiro erro da visita ficava sem voz).
- **Um problema da conta que aponta um campo** declara `problemField` na `CalcView` (`pay`, `x`, `d{n}p`, `d`, `dep`): o campo ganha `aria-invalid` e a descrição do card (F4 ACE-11). Problema novo que aponta um campo: declare o campo.
- **O card não cresce:** a célula da frase guarda a altura da linha de erro mais longa por um `data-reserve` desenhado por um `::after` escondido (nunca texto da página: o `gate:prontidao` e o leitor de tela não o leem). Texto novo do card perto do erro: rode o "the card keeps its height…" do `money-card.spec.ts`.
- **O ícone de alerta do campo fica dentro da caixa, antes da unidade** (`.fo-input__flag`). Antes do rótulo, como a especificação desenhou, ele levava 40 rótulos de meia largura a uma segunda linha a 360 px (uma sonda mediu).
- **O bloco que dobra** (`CalcDef.disclose`): os campos de dentro só entram no DOM com o bloco aberto. Teste que preenche `tx`, `in`, `pmi`, `hoa` (a hipoteca e os presets dela) ou `tr`, `f` (o SAC × PRICE) clica antes no `[aria-controls="fo-calc-more-fields"]`. O total do título é a `CalcView.more`.
- **O cronograma é parte da ilha** (`#fo-calc-schedule` dentro do `#fo-tool-root`, antes dos chips). O botão é o `#fo-calc-schedule button[aria-controls="fo-schedule-table"]`, com o nome do título da seção (não há mais "Show the full schedule"). A 1ª célula de cada linha de dados é `th[scope=row]`: quem lê as células de uma linha lê `th, td`.
- **Uma tabela pode ter uma forma curta para a tela** (`{ text, short }`, a Ovulation): o CSV e o PDF leem o `text` (longo), a tela o `short`. As datas curtas são à mão (`tableDate` e `tableRange` do `src/i18n/dates.ts`), com o mês preso ao dia por um espaço que não quebra.
- **As listas (dívidas, áreas)** levam a chave estável em `data-row`, e o foco volta pela chave depois do re-render; os ids por índice ficam. Os botões da lista leem os valores do store na hora (`latest`), não os da renderização: uma tecla e um Enter no mesmo instante não perdem o valor.
- **O topo da calculadora no celular é mais justo** (`.fo-top--calcpage`, § 544): 4 px entre as linhas, o lead em 16/24, o item da própria página na trilha só para o leitor de tela. Com isso o número da hipoteca e do SAC × PRICE termina em 592 px a 360 × 740 (o aviso começa em 604). Texto novo no topo de uma calculadora: meça com o "the number ends above the cookie notice…" do `money-card.spec.ts`; a folga é de 4 px.
- **A marca `wide`** (`FieldBase.wide`) põe um campo de meia largura na linha inteira abaixo de 360 px (a Paint: área da porta, janelas, área da janela). Rótulo novo de meia largura com a etiqueta: confira a 320 px.
- **O preset 15 o 30 años** usa a `desc` dos `FieldTexts` (uma descrição escondida); use a mesma chave quando um rótulo curto deixar uma palavra de fora.
- **Dois campos errados (§ 593):** só o campo que o card nomeia (o primeiro errado da página, ou o que um problema aponta) tem o `aria-describedby` com `fo-rhero-error`; um outro campo errado aponta para a própria mensagem, `#<id>-error` (`.fo-field__msg`, sem `role` nem região viva). Teste que lê a descrição de um campo errado que não é o primeiro procura o id próprio.
- **O card guarda o lugar de cada peça que outro valor muda (§ 595):** o `heroReserves` do `CalcPanel` calcula uma vez, dos valores do começo, as reservas desenhadas por pseudo-elementos escondidos: a mensagem mais longa no lugar do Baixar, a frase mais larga (o exemplo e o exemplo com um zero a mais ou um dígito a menos em cada campo principal, cada algarismo como "0" e o negrito em maiúsculas), o "Last result that worked" mais longo, o rótulo mais longo e as linhas da legenda. Problema novo de uma conta entra no `CalcDef.problems` (as chaves dos textos da `view`), senão o lugar do Baixar não o conhece e o card cresce. Texto novo no card: rode o "the card keeps its height with other values…" do `money-card.spec.ts`.
- **O número do card e o Linux do CI (§ 601):** o tamanho do número sai de uma conta (`numberFit` e o `calc()` do `.fo-rhero__num`) que no Windows pode deixar menos de 1 px de sobra, e a Fredoka desenha um pouco mais larga no Linux: a unidade ("/mo") desce uma linha só no CI. Abaixo de 768 px a conta guarda 3 px; um valor novo de exemplo, ou uma unidade nova, passa pelo teste "the number keeps 2px from the edge of the card…" do `money-card.spec.ts`, e o exemplo em inglês tem de continuar nos 48 px a 320 (o teste da § 253 no `money-calc.spec.ts`).

## F16: digitar sem tropeço e exportar números de verdade

Pegadinhas que a F16 achou na leitura do campo, na mensagem de casas, na fala e no foco do card, e no CSV e no PDF das calculadoras (DECISOES § 683 a § 696).

- **O `parseScaled` não é mais uma expressão regular** (§ 683): ele chama o `readNumber` do `src/calc/parse.ts`, que divide o texto no separador decimal e nos de milhar e devolve as partes ou o motivo de não ler (`'separator'` dá a dica do separador; `'format'`, não). Um caso novo de leitura entra no `readNumber` e no `tests/unit/calc-parse.test.ts`, escrito à mão nos três idiomas, com o motivo. A escrita (`formatScaled` e as outras) não muda, e uma run de calculadora confere com `git diff --stat <base> -- src/calc`.
- **O `form.ts` tem dois `readNumber`:** o do link do cenário (privado, só inteiros sem separador, o `WHOLE`) e o do `parse.ts`, importado como `readTyped`. O link não lê o que a pessoa digita: não troque um pelo outro.
- **A mensagem do campo sai do `fieldMessage`** (`form.ts`, pura): nenhuma, a faixa, a mensagem de casas (§ 684) ou a faixa com a dica. Um campo com casas novas, ou um tipo novo de campo, ganha a mensagem de casas pelo `decimalsOf`, e o `heroReserves` a reserva no lugar do Baixar sem mais nada. O valor que decide entre a mensagem de casas e a faixa é o cortado, nunca o arredondado.
- **O rascunho da store não repinta** (§ 685): `draft(id, ligado)`, `drafting()` e `onDraft(ouvinte)` ficam fora do `state` e nunca chamam o `notify`. Quem precisa saber do rascunho usa o `onDraft`, nunca o `useCalc`. O campo só marca rascunho com o erro fora da vista; o fim do `SETTLE_MS`, o `blur`, a desmontagem e o `wrong(id, erro)` desligam.
- **O foco do Baixar decide na renderização, antes do commit** (§ 686): quando um nó com o foco sai do DOM, o Chromium dispara nele um `focusout` com `relatedTarget` nulo, e o WebKit não dispara nada. Uma marca que um efeito lesse já teria sido apagada no Chromium. O `document.activeElement` no Baixar, lido na renderização, basta.
- **O "um zero a mais" de um número com milhar lê desde a F16** ("375,0000" é 3.750.000) e entra nas reservas do card pelo `nudges` (§ 694). Um teste que digita "375,0000" espera um resultado dez vezes maior, não um erro; o "the card keeps its height with other values…" do `money-card.spec.ts` passou a provar essa reserva.
- **A altura do card no Chromium a 320 px oscila em algumas páginas** na mesma `dist` (a Square footage dá 282 ou 308 px; a Paint e o guia do refinanciamento em es também), pelas fontes. Compare várias cargas de cada `dist` antes de chamar uma diferença de mudança.
- **Toda tabela declara as colunas do CSV** (`Table.csv`, obrigatório; § 687): o cabeçalho com a unidade e o tipo (`number`, `date` ou `text`). Uma célula de texto leva no `csv` os valores que o CSV escreve (número na escala, centavos, dia AAAA-MM-DD, texto ou `null`), e eles se desdobram em tantas colunas quantos forem. A tabela de item e valor de casa e saúde sai do `itemTable` (`view.ts`), e as linhas do PDF saem das mesmas linhas pelo `itemPairs`. O `calc-csv.test.ts` percorre todas as tabelas de todas as páginas com o exemplo e com os `nudges`; o `CALC_CSV_DIR` aponta as conferências do exemplo para uma pasta de CSVs baixados (`<idioma>-<id>.csv`), como o `CALC_FIXTURES_DIR` do `calc-oracle.test.ts`.
- **Os cabeçalhos de dinheiro ficam sem moeda** (§ 687): o "(USD)"/"(BRL)" da decisão 7 vale só para uma coluna que misture dinheiro com outra unidade, e nenhuma tabela de hoje mistura. Mudar o cabeçalho de dinheiro muda os bytes de 54 CSVs que o `money-calc`, o `money-es`, o `calc-i18n` e o `calc-defs` fixam.
- **O PDF rotula cada valor de uma linha de lista pelo `inputRows`** (§ 690), com o rótulo do campo (o da opção da linha, quando existe) em minúscula, menos sigla ("APR"): o `lint:texto` do pt reprova maiúscula depois de vírgula. O `fieldText` (a linha "Last result that worked" do card) não leva rótulo nem o resto do sufixo, e um teste o prende.
- **A ferramenta de escrita dos agentes troca um escape `\uXXXX` escrito no código pelo caractere** (o `\u00A0` de uma expressão regular virou um espaço sem quebra literal, e o `\uFEFF`, o BOM). Confira com `grep` ou `od -c` depois de escrever, e num teste prefira `String.fromCharCode(0xa0)`.
- **O `vitest.config.ts` só roda `tests/unit/**`:** um teste temporário de despejo vai em `tests/unit/` e sai antes do commit. O `conteudo.test.ts` estoura os 5 s quando outro processo roda o Playwright na mesma máquina; ele passa sozinho.
