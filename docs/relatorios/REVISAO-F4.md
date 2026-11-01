# Revisão adversarial da F4

Revisão final da run `fase-04` (calculadoras de dinheiro em inglês), no método da F3 (DECISOES § 92 a § 94 e § 139). O gabarito foi a ficha (`docs/prompts/prompt-fase-04.md`), o plano (`docs/relatorios/fase-04-plano.md`), o `CLAUDE.md`, o DECISOES.md § 110 a § 136 e o `docs/design/`.

## Como rodou

- **Commit fixo:** `ebfd6c1`, numa worktree só de leitura em `.claude/worktrees/revisao-f4`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`. A worktree foi removida no fim.
- **Seis lentes Sonnet em contexto limpo**, cada uma com uma porta (`FO_PORT` 4174 a 4179) e uma pasta só dela em `.cache/lente-<x>/`:
  1. corretude financeira;
  2. privacidade dos números;
  3. anúncio, política e YMYL;
  4. acessibilidade;
  5. desempenho e SEO;
  6. design system.
- **Céticos:** um cético próprio para cada achado crítico, alto ou médio, e um cético por lente para os baixos. Foram 24 céticos, cada um tentando refutar o achado com a regra "sem reprodução, refutado". Somando as lentes, foram 30 agentes, 1.290 chamadas de ferramenta e 34 minutos.
- **Correções:** num agente só (o principal), cada uma com um teste que falha sem ela. Commits `8544ebe`, `a5b1a50`, `eba71cb`, `5d3f16b` e `e45415e`.
- **Segunda passada:** um revisor Sonnet em contexto limpo leu só o diff das correções (`ebfd6c1..5d3f16b`) na mesma worktree, movida para `5d3f16b`.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | --- | --- |
| Crítico | 1 | 0 |
| Alto | 1 | 1 |
| Médio | 16 | 18 |
| Baixo | 36 | 33 |
| Refutado | (n/a) | 2 |

- O único crítico da lente de acessibilidade era o número quebrado da Savings goal ("$1.2,261,029,503,889,166e+.27"). O cético o rebaixou a médio, porque só aparece com valores extremos dentro das faixas. É o mesmo ANU-2 da lente de anúncio. Foi corrigido no oráculo e no motor.
- O único alto (DES-1, as caixas esticadas ao lado de um campo com ajuda) foi corrigido com subgrid (§ 137).
- Os céticos subiram cinco baixos para médio: COR-8, ACE-4, ACE-6, ACE-10 e DES-10. Todos foram corrigidos.
- Eles baixaram quatro médios para baixo: COR-5, ACE-3, SEO-1 e DES-3. O COR-5 e o SEO-1 foram corrigidos assim mesmo.
- **Regra aplicada:**
  - crítico e alto confirmados, sempre;
  - médio, quando a correção é local (todos eram);
  - baixo, quando a correção era local e barata; os outros vão para o relatório.
- **Situação dos 54:** 32 corrigidos (contando os achados repetidos entre lentes) e 2 refutados. Ficam 20 pendentes: 18 baixos, o ACE-11 corrigido em parte e o DES-11, que virou registro (§ 140).

## O que cada lente conferiu, em resumo

- **Corretude:**
  - os testes do oráculo, das definições, dos guias e do relatório, com 42 testes;
  - as convenções do motor contra o oráculo, linha a linha;
  - um fuzz de 7.038 renderizações das 18 definições, com invariantes (soma do cronograma, total, saldo final zero, sem `NaN` ou placeholder);
  - todo valor em dólar das frases, rastreado até um número do motor;
  - as premissas e os FAQ lidos contra o motor;
  - os 5 guias, frase a frase;
  - a APR refeita à parte;
  - casos de borda pelas views reais.
- **Privacidade:**
  - os três specs da calculadora, nos dois navegadores (46 testes em cada);
  - uma sonda própria em 40 cenários (cada opção de cada escolha, entrada em %, 10 linhas de dívidas e os 5 guias), com controle positivo de `fetch`, `sendBeacon` e `fetch` dentro do worker;
  - o PDF sem metadados, a busca e um fuzz de 144 links do cenário.
  - Nenhum número saiu do aparelho.
- **Anúncio e YMYL:**
  - o `ads.spec.ts` inteiro nos dois navegadores (50 testes em cada);
  - uma medida própria de 23 páginas em seis larguras, com a Oli e o cronograma aberto;
  - os blocos `data-ymyl` das 24 páginas, os portões de dinheiro e de conteúdo, a busca por texto proibido e a Privacidade e os Termos nos três idiomas.
- **Acessibilidade:**
  - o axe nas 25 páginas de dinheiro e em estados extras;
  - a árvore de acessibilidade pelo CDP;
  - a voz única, a navegação só por teclado nos dois navegadores e nas duas larguras, o contraste não textual, o reflow a 320 px, os valores máximos e o espaçamento de texto do WCAG 1.4.12.
- **Desempenho e SEO:**
  - o orçamento e os 16 ms;
  - o pior caso do motor com a CPU 4 vezes mais lenta;
  - o `gate:seo`, o `gate:links`, o JSON-LD e os sitemaps;
  - o CLS e o LCP em 24 páginas;
  - um Lighthouse próprio;
  - a canibalização (sobreposição de 6-gramas do guia com a calculadora, de 18 a 25%).
- **Design system:**
  - o `design-checks.test.ts`;
  - a cor computada em 20 páginas, nos dois temas;
  - o CSS do bloco Money contra o `bundle.css`;
  - a Oli e as suas poses;
  - os alvos de toque, os chips, as relacionadas e o breadcrumb;
  - os estados em PNG a 360 e 1280 px.

## Achados que vieram de fora das lentes

Antes da revisão, a própria run achou e corrigiu três defeitos, com teste:

- **A comemoração empurrava o número** (`69eb38e`, § 140): na prévia, depois da primeira tecla, o número descia 96 px e saía da dobra no celular.
- **Campos desalinhados** (`b3bb351`, § 137): achado no screenshot de 1280 px. É o mesmo DES-1 das lentes.
- **O `networkidle` do WebKit do CI** (`5eee3a5`, § 138): nunca disparava nos hubs, com as requisições todas respondidas.

## Os achados

Na coluna "Lente → cético", a primeira severidade é a da lente; depois vêm o veredito do cético e a severidade dele. A lente de acessibilidade reusou os ids COR-1 e DES-1 em dois achados próprios: são o número quebrado da Savings goal e as caixas esticadas, e aparecem com esses ids na tabela dela.

### (a) Corretude financeira

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| COR-1 | médio → confirmado (médio) | APY para APR custa 22 ms por tecla (orçamento da decisão 4: 16 ms) e calcula a raiz 365 duas vezes | corrigido em `eba71cb`; teste: `calc-speed.spec.ts`, "APY into APR, daily" (p95 1,6 ms) |
| COR-2 | médio → confirmado (médio) | O FAQ da Personal loan manda zerar a tarifa financiada, e a página passa a mostrar a taxa nominal como APR | corrigido em `5d3f16b`; teste: `calc-defs.test.ts`, "the FAQ way to enter a fee added to the balance gives the true APR" |
| COR-3 | médio → parcial (médio) | Estado de erro: o PDF da Savings goal leva '{deposit}' cru e o PDF de qualquer erro estoura a página | corrigido em `a5b1a50 e 5d3f16b`; teste: `calc-defs.test.ts` (pontas das faixas e estados de erro) e `calc.spec.ts` (DES-2, COR-3) |
| COR-4 | médio → confirmado (médio) | Taxas pré-preenchidas sem a etiqueta 'example': taxa atual do Refinance e APR das dívidas | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "every prefilled rate carries the example tag" |
| COR-5 | médio → parcial (baixo) | Guia do Refinance diz 'a new 30 years loan' | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "each guide links the calculator it embeds" (sem "N years loan") |
| COR-6 | baixo → confirmado (baixo) | Singular e plural errados com n = 1: '1 years', '1 days', '1 months', '1 payments' | pendente (baixo): "1 years", "1 payments" com n = 1; texto, sem número errado |
| COR-7 | baixo → confirmado (baixo) | Com entrada = preço (empréstimo zero) os presets de hipoteca mostram frases sem sentido, e o oráculo não tem esse caso | pendente (baixo): entrada igual ao preço nos presets dá frase sem sentido; caso de borda raro |
| COR-8 | baixo → confirmado (médio) | Extra payments: com extra abaixo de uns $5 por mês a frase diz que não há extra, ao lado de um valor de juros economizados | corrigido em `5d3f16b`; teste: `calc-defs.test.ts`, "an extra too small to end the loan sooner still says what it saves" |
| COR-9 | baixo → refutado (baixo) | A frase da diferença destoa em 1 dólar da diferença dos dois cards em cerca de 28% dos casos | refutado pelo cético |
| COR-10 | baixo → parcial (baixo) | Home affordability: o 'máximo' sai arredondado para cima em dólares e o teto negativo usa hífen | pendente (baixo): arredondamento do máximo em dólares na frase da Home affordability; o resumo e o PDF têm centavos |
| COR-11 | baixo → parcial (baixo) | O 'mínimo' das falas too-low é a condição necessária e leva a outro erro ou a prazos de 40 anos | pendente (baixo): o "mínimo" das falas too-low é a condição necessária, não a suficiente |
| COR-12 | baixo → confirmado (baixo) | O oráculo não cobre o limite de 1.200 meses (too-long) em três calculadoras nem o extra único no último mês | pendente (baixo): o oráculo ainda não cobre too-long em três calculadoras nem o extra único no último mês |
| COR-13 | baixo → confirmado (baixo) | Rent vs buy: 'Buying catches up in Year N' pode valer só por um tempo | pendente (baixo): "Buying catches up in Year N" pode valer só por um tempo; a tabela por ano mostra |
| COR-14 | baixo → confirmado (baixo) | Credit card por prazo com saldo pequeno: 'pay $0.00 a month' | pendente (baixo): Credit card por prazo com saldo menor que o prazo em centavos dá parcela de $0.00; muda o motor, então pede caso no oráculo antes |
| COR-15 | baixo → confirmado (baixo) | Afirmações de texto que não valem em geral (PMI igual nos dois prazos; premissa do guia de extras; 'juros uma vez por mês' em todas) | pendente (baixo): afirmações de texto gerais demais (PMI igual nos dois prazos e outras) |
| COR-16 | baixo → confirmado (baixo) | Linhas do PDF sem rótulo e dois números de 'você' na poupança | pendente (baixo): linhas do PDF sem rótulo e dois números de "você" na poupança |
| COR-17 | baixo → confirmado (baixo) | Refinance sem economia nem custo diz 'breaks even in month 1' e o atalho mostra 'Month 0' | pendente (baixo): Refinance sem economia nem custo diz "breaks even in month 1" |

### (b) Privacidade dos números

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| PRI-1 | baixo → parcial (baixo) | O teste de privacidade deixa 14 sentinelas fora da busca e nunca digita nos campos de modo, nas linhas novas de dividas nem na entrada em % | pendente (baixo): o teste não digita nos campos que só aparecem com outro modo nem em linhas novas de dívidas; a sonda da lente cobriu 40 cenários e não achou vazamento |
| PRI-2 | baixo → confirmado (baixo) | A asserção de que o link copiado foi lido nunca falha | corrigido em `5d3f16b`; teste: a própria asserção de `calc-privacy.spec.ts`, agora contra a sentinela no formato da página |
| PRI-3 | baixo → confirmado (baixo) | Sem area de transferencia, o campo com o link fica com os numeros antigos depois de qualquer edicao | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "without a clipboard, the shown link follows the numbers" |
| PRI-4 | baixo → parcial (baixo) | cleanParams so fecha tool, target, format, outcome, reason e codec; lang, place e browser aceitam qualquer texto, e o teste so prova os fechados | pendente (baixo): lang, place e browser aceitam qualquer texto no cleanParams; nenhum deles vem de campo digitado |
| PRI-5 | baixo → refutado (baixo) | O # com os numeros fica no location.href durante a visita inteira e o teste nao ve nenhum script de terceiro que o leia (AdSense) | refutado pelo cético |

### (c) Anúncio, política e YMYL

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| ANU-1 | médio → parcial (médio) | Com a Oli cheer e a Placa, um resultado de 7 dígitos ou mais alarga o ResultHero: o painel passa de 150 px do anúncio lateral e a página rola no celular | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "a long result with the cheer stays in its column" |
| ANU-2 | médio → confirmado (médio) | Savings goal mostra o número 1.2,261,029,503,889,166e+.27 na legenda de juros quando a meta já está atingida, num valor que a faixa do campo aceita | corrigido em `8544ebe (oráculo) e a5b1a50 (motor)`; teste: `calc-oracle.test.ts` (casos too-large) e `calc-defs.test.ts` |
| ANU-3 | médio → confirmado (médio) | Campos de taxa preenchidos com um valor de exemplo sem a etiqueta 'example' na Refinance e nas listas de dívidas | corrigido em `5d3f16b`; teste: o mesmo de COR-4 |
| ANU-4 | baixo → confirmado (baixo) | As premissas do preset Biweekly se contradizem: 'juros uma vez por mês, taxa ÷ 12' e 'juros a cada duas semanas, taxa ÷ 26' | corrigido em `5d3f16b`; teste: `calc-defs.test.ts`, "Biweekly: the monthly rule of interest is said as the comparison" |
| ANU-5 | baixo → confirmado (baixo) | A Privacidade não cita o sessionStorage da Oli e traz 'Última atualização' de 31/out com texto mudado em 1/nov | corrigido em `5d3f16b`; teste: `calc-defs.test.ts`, "the privacy policy names the Oli's session mark" |

### (d) Acessibilidade

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| COR-1 | crítico → parcial (médio) | Savings goal mostra número quebrado ('$1.2,261,029,503,889,166e+.27') com valores dentro das faixas aceitas | corrigido em `8544ebe e a5b1a50`; teste: o mesmo de ANU-2 |
| ACE-1 | médio → confirmado (médio) | O atraso de 500 ms do aria-live conta desde a última mudança do resultado, não desde a última tecla | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the hero speaks half a second after the last key press" |
| ACE-2 | médio → parcial (médio) | O campo 'Home value change per year' (aceita negativo) usa inputmode="decimal", cujo teclado do iPhone não tem o sinal de menos | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the one field that takes a minus opens the text keyboard" |
| ACE-3 | médio → parcial (baixo) | A unidade do campo (years, months, %, $) é só visual: não entra no nome nem na descrição do campo | pendente (baixo): a unidade (years, %, $) é visual e o nome do campo não a traz; o erro diz a unidade |
| DES-1 | médio → confirmado (médio) | Um campo ao lado de outro com ajuda ou erro estica e passa de 48 px (HOA dues fica com 86 a 96 px de altura na Mortgage) | corrigido em `b3bb351 e 5d3f16b`; teste: `calc.spec.ts`, "two fields side by side keep their inputs on one line" e "the box of every field is control-h high" |
| ACE-4 | baixo → confirmado (médio) | O aria-label do SplitChart traz os valores mas não as porcentagens que o README pede | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the chart is named with whole dollars and both shares" |
| ACE-5 | baixo → confirmado (baixo) | O cabeçalho fixo do cronograma cobre quase todo o botão de ano ao voltar com Shift+Tab | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the header never hides a year" |
| ACE-6 | baixo → confirmado (médio) | Na lista de dívidas o foco vai para o body quando o botão focado some (décima dívida, última linha removida, mínimo) | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the keyboard focus stays in the list when debts come and go" |
| ACE-7 | baixo → parcial (baixo) | A ordem de tabulação no computador pula para a coluna do resultado e volta (campos principais, ExportBar, campos opcionais) | pendente (baixo): no computador a tabulação vai aos campos principais, à coluna do resultado e volta aos opcionais; é a ordem do HTML, que o molde fixa |
| ACE-8 | baixo → parcial (baixo) | Botões 'CSV' e o de mostrar o cronograma: nome fraco e rótulo que muda junto com aria-expanded | pendente (baixo): "CSV" e o botão do cronograma com nome fraco |
| ACE-9 | baixo → parcial (baixo) | AmortTable sem cabeçalho de linha (th scope=row) e região e tabela com o mesmo nome | pendente (baixo): o cronograma sem th scope=row e a região com o mesmo nome da tabela |
| ACE-10 | baixo → confirmado (médio) | Reflow: a legenda do gráfico alarga a página com números de 10 dígitos a 320 px, e o espaçamento de texto do WCAG 1.4.12 alarga a página por causa da Oli com a Placa | corrigido em `5d3f16b`; teste: o mesmo de ANU-1, mais a legenda de 10 dígitos a 320 px |
| ACE-11 | baixo → confirmado (baixo) | Credit card payoff: pagamento que não cobre os juros não marca o campo, e a Oli comemora com uma placa '-' | em parte: a Oli não comemora no problema (DES-2); o campo do pagamento ainda não é marcado com aria-invalid. Pendente (baixo) |

### (e) Desempenho e SEO

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| SEO-1 | médio → parcial (baixo) | Os 5 guias embutem uma calculadora mas nao linkam a pagina dela (link interno so de ida) | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "each guide links the calculator it embeds" |
| SEO-2 | baixo → parcial (baixo) | Titulo e descricao da calculadora puxam o mesmo angulo do guia correspondente | pendente (baixo): título e descrição da calculadora e do guia puxam ângulos parecidos; a sobreposição medida do texto é de 18 a 25% |
| SEO-3 | baixo → confirmado (baixo) | WebApplication.name de dois presets nao e o H1 nem o ultimo item do breadcrumb | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the pages name their calculator as their H1" |

### (f) Design system

| Id | Lente → cético | Achado | Situação |
| --- | --- | --- | --- |
| DES-1 | alto → confirmado (alto) | Campo vizinho de outro com ajuda, etiqueta ou erro estica a caixa do input acima de control-h | corrigido em `b3bb351 e 5d3f16b`; teste: o mesmo de DES-1 da lente de acessibilidade |
| DES-2 | médio → confirmado (médio) | Oli em cheer com a Placa '-' no estado de erro do resultado | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "a problem shows no Oli and turns the PDF and CSV off" |
| DES-3 | médio → parcial (baixo) | O campo recusa o próprio formato ao editar no lugar e a fala do erro diz a faixa de um valor que está na faixa | pendente (baixo): o campo recusa o próprio formato ao editar no lugar ("1,2" no meio de "375,000"); a fala do erro diz a faixa |
| DES-4 | médio → confirmado (médio) | Taxa pré-preenchida sem a etiqueta 'example' (Refinance, Debt payoff, Debt consolidation e dois guias) | corrigido em `5d3f16b`; teste: o mesmo de COR-4 |
| DES-5 | baixo → confirmado (baixo) | A Placa do ResultHero entra sem .fo-pop | corrigido em `5d3f16b`; teste: `calc.spec.ts` (a Placa com `.fo-pop`) |
| DES-6 | baixo → confirmado (baixo) | SplitChart: aria-label sem porcentagens e valores com centavos enquanto a frase acima está em dólares inteiros | corrigido em `5d3f16b`; teste: o mesmo de ACE-4 |
| DES-7 | baixo → confirmado (baixo) | Legenda do SplitChart quebra com um '·' solto a 360 px nos guias | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "its legend keeps the share with its amount" |
| DES-8 | baixo → confirmado (baixo) | Falha do PDF diz o erro sem o ícone alert | corrigido em `e45415e`; teste: `calc.spec.ts`, "a PDF maker that cannot load" |
| DES-9 | baixo → confirmado (baixo) | ScenarioCompare empilha em 372 a 379 px de viewport, onde o README manda ficar lado a lado | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the two scenarios stay side by side from 340px of column" |
| DES-10 | baixo → confirmado (médio) | O saldo de fim de ano do AmortTable fica fora da tela a 360 px | corrigido em `5d3f16b`; teste: `calc.spec.ts`, "the balance of each year stays in the frame" |
| DES-11 | baixo → parcial (baixo) | Tamanho do número do ResultHero e respiro do cartão no celular fora dos estilos nomeados e sem decisão registrada | registrado na DECISOES § 140 (os tamanhos do ResultHero no celular), sem mudança de código |

## A segunda passada

Um revisor Sonnet em contexto limpo leu só o diff das correções (`ebfd6c1..5d3f16b`), na mesma worktree movida para `5d3f16b`.

**O que ele conferiu:**
- o Vitest inteiro: 862 testes, todos verdes;
- os specs da calculadora, de anúncio, de orçamento, de velocidade, de eventos, de navegação e de acessibilidade nos dois navegadores, todos verdes;
- o `iroot` novo contra o antigo em 11.475 casos (m pequeno, k de 1 a 5.000, potências exatas ±2 e o formato real do motor), com 0 diferenças;
- a hidratação: o HTML do servidor contra o DOM hidratado;
- o alinhamento da grade de campos em 23 páginas e 5 larguras;
- uma cópia instrumentada do teste de privacidade, para ver que a asserção nova de "o link foi lido" não é vazia.

**Achados e situação:**

| # | Severidade | Achado | Situação |
| --- | --- | --- | --- |
| 1 | médio | Com um campo a corrigir (resultado velho), o PDF e o CSV seguiam ligados e saíam com as entradas novas e o resultado antigo | corrigido em `381fc3f`; teste: `calc.spec.ts`, "a stale result (a field to fix) turns the PDF and CSV off" |
| 2 | médio | No WebKit, o subgrid deixava 12 px vazios embaixo de um grupo de opções (fieldset), e o número do resultado descia uns 12 px | corrigido em `381fc3f` (o fieldset ocupa uma linha, sem subgrid); teste: "a group of options keeps the 16px gap", que falhava só no WebKit |
| 3 | baixo | O teste da Placa longa não chegava às regras dela: o passo de 320 px abria por link, sem tecla e sem a Oli | corrigido em `381fc3f`: o passo digita numa aba nova e confere a Placa de 13 caracteres dentro do cartão. Com as regras antigas injetadas, o cartão vai a 429 px e o teste acusa |
| 4 | baixo | O teste das pontas das faixas pulava a lista de dívidas e a entrada | corrigido em `381fc3f` |
| 5 | baixo | O caso "large-under-cap" do oráculo ficava 500 vezes abaixo de 10^15 | corrigido em `5924a33`: dois casos novos do oráculo, a 0,80 × 10^15 e acima do limite |
| 6 | baixo | O código citava as §§ 137 a 139 e este arquivo antes de eles existirem | corrigido no commit de documentação |
| 7 | baixo | A 360 px, o saldo do ano ficava visível, mas o cabeçalho "Balance" não | corrigido em `381fc3f` (o cabeçalho também fica à direita); teste: "the Balance heading stays over the balance of the year" |

**Fora do diff**, ele achou mais dois:
- "With the 28% housing limit setting the limit" repetia "limit": virou "Under the 28% housing limit".
- A asserção da data da Privacidade (`not.toMatch(/31/)`) era fraca: passou a conferir a data exata nos três idiomas.

Os três testes novos da segunda passada falham contra o build anterior às correções e passam depois delas, nos dois navegadores (434 testes de ponta a ponta verdes).

## A worktree

A worktree `.claude/worktrees/revisao-f4` foi removida com `git worktree remove` depois da segunda passada. Os scripts e as medidas das lentes ficaram no `.cache/` dela e saíram junto, como na F3.
