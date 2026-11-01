# F4 · Dinheiro em inglês

Prompt da run `fase-04` do FileOrca, gerado com a skill prompt-ultracode em 31/out/2026. Ele parte da ficha "F4 · Dinheiro em inglês" do PLANO-FILEORCA.md e do estado da main em `60f84da`, o merge do `ajuste-aviso-espaco`. Antes dele roda o ajuste curto `ajuste-ci-webkit-tres` (`docs/prompts/prompt-ajuste-ci-webkit-tres.md`).

O que entrou na conversa:

- **O Victor escolheu dividir o WebKit do CI em três partes num ajuste curto antes da F4, com o merge dele.** Na F3, a parte 2 do WebKit ficou em 644 s, com alvo de 700 s. A F4 soma umas 25 páginas aos testes, e o `--shard` divide por contagem de testes. Com o ajuste antes, a PR da F4 não toca no `.github/` e mescla sozinha.
- As 18 linhas de dinheiro do `data/keywords.csv` têm `entra`: 14 calculadoras e 4 presets.
- O numpy-financial 1.1.0 foi conferido nesta conversa. Com a regra de centavos do plano, ele reproduz os números do design system v1.1:
  - parcela de $1,896.20;
  - juros de $382,636.71;
  - saldos de fim de ano de $296,646.88, $293,069.20 e $289,251.91;
  - em 15 anos, $2,613.32 e $170,398.28;
  - e o Loan Estimate de exemplo do CFPB, com $761.78.

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F4 do FileOrca: dinheiro em inglês. Ao terminar, estão no ar, só em inglês:

- as 14 calculadoras e os 4 presets de dinheiro com `entra` no `data/keywords.csv`;
- o hub `/money-calculators/`;
- os 5 guias com a calculadora embutida.

Os motores ficam em `src/calc/`, sem dependências, e batem no centavo com um oráculo independente. O oráculo usa o numpy-financial, um laço em `decimal` do Python e exemplos resolvidos de fontes oficiais, e fica gravado em `fixtures/calc/` num commit anterior a qualquer motor.

Toda calculadora:

- recalcula a cada tecla;
- mostra o resultado, o gráfico, dois cenários onde a conta compara, e o cronograma recolhido por ano;
- exporta PDF e CSV;
- guarda o cenário num link depois do `#`.

Nenhum número digitado sai do aparelho: nada vai para `?` na URL, para evento do GA4, para requisição ou para o armazenamento do navegador. Um teste prova isso. Os rascunhos de 20 contatos com blogs de finanças dos EUA ficam em `docs/lancamento/`.

O `pnpm verificar` fica verde na sua máquina e em todas as partes do CI. Tudo vai numa PR da branch `fase-04`, com o relatório. A PR não toca em `.github/`, então o job de merge a mescla sozinho quando ela sai do rascunho com o CI verde.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, e o shell é o Git Bash. O CI roda em Ubuntu, em partes de até 900 s cada (ADR-003).

A main está no merge do ajuste `ajuste-ci-webkit-tres` ou num commit mais novo. Antes dele, ela estava em `60f84da`, o merge do `ajuste-aviso-espaco`. Confira com `git log --oneline -8` e no `.github/workflows/ci.yml`. Depois do ajuste, o CI tem cinco partes: `verificar`, `playwright (chromium)` e o WebKit em três (`--shard=1/3`, `2/3` e `3/3`).

Se o `ci.yml` da main ainda tiver `--shard=1/2`, o ajuste não foi mesclado. Nesse caso, faça a run inteira, mas não rode `gh pr ready`: a PR fica em rascunho, e o relatório registra a pendência "precisa do `ajuste-ci-webkit-tres` mesclado". São dois motivos:

- com duas partes, a do WebKit tende a passar de 900 s com as páginas novas;
- a F4 se mesclaria antes do ajuste e conflitaria com ele no `DECISOES.md` e no `CLAUDE.md`.

O que está no ar em fileorca.com, indexável (`LAUNCHED = true`):

- oito ferramentas de imagem em inglês, três presets e o hub `/image-tools/`;
- a home, a Compress image e as páginas institucionais também em pt e es.

A run 2b (Convert to WebP/AVIF e AVIF to JPG, § 85) ainda não rodou e não é desta run. Não existe `src/calc/` ainda.

O portão `gate:dinheiro-saude` existe desde a F1a, mas confere zero páginas. Ele está em `scripts/gates/dinheiro-saude.ts`, com a lógica em `scripts/lib/ymyl.ts` e o teste em `tests/unit/ymyl.test.ts`. Ele exige, em toda página de rota com `adArea: 'dinheiro'`:

- os blocos `data-ymyl` `formula`, `premises`, `example`, `reviewed` (com `<time datetime="AAAA-MM-DD">`) e `disclaimer`;
- um link `data-ymyl="source"` para um domínio oficial (`consumerfinance.gov`, `federalreserve.gov` ou `bcb.gov.br`);
- o schema `Person` com Victor Yuki Matusita;
- nenhum texto proibido ("today's rates", previsão de juros, indicação de banco).

A F4 é a primeira run em que ele confere páginas de verdade.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da run e vence o resto.
2. O `CLAUDE.md` inteiro, com as seções da F1a à F3 e dos ajustes. A da F2 diz como uma ferramenta entra; a da F3 diz como o `gate:prontidao` e a revisão funcionam.
3. O `PLANO-FILEORCA.md`. A ficha "F4 · Dinheiro em inglês" do apêndice é o contrato, e as "Decisões fechadas" não mudam. Leia também estas seções:
   - "Regra das calculadoras" e "Molde da página de calculadora";
   - "Confiança em dinheiro e saúde", "Regra da página programática", "Conteúdo de apoio" e "Links" (a linha dos blogs de finanças);
   - "Orçamento de desempenho";
   - "O que derruba conta", "Doações" e "Páginas obrigatórias";
   - os eventos do GA4 em "Metas".
4. O `DECISOES.md`, do § 1 ao último. Esta run toca mais estes: § 4, § 8 (o `page_location` já vai sem `?` e sem `#`), § 10, § 20, § 23, § 52, § 58, § 68, § 69, § 70, § 76, § 77, § 78, § 81, § 84, § 95, § 96, § 101, § 102, § 105 e § 106, além do que o ajuste do WebKit registrou.
5. O `docs/design/`, que é só leitura:
   - o README (voz, Oli, layout, números e acessibilidade);
   - o README e o `preview.html` de NumberField, ResultHero, SplitChart, ScenarioCompare, AmortTable e ExportBar;
   - o README e o `preview.html` dos que a calculadora reusa: OptionGroup, NextStepChips, Placard, Oli, Faq, AdSlot, ToolCard e Breadcrumb.
6. Os relatórios:
   - do `docs/relatorios/fase-03.md`, a "Nota para a F4" e "O que a válvula cortou";
   - a § 103 (o que ficou pendente; não é desta run);
   - o `docs/relatorios/fase-02.md` e o `docs/prompts/prompt-fase-02.md`, o modelo de uma fase que acrescenta ferramentas.
7. O código:
   - `src/tools/image/` (`registry.ts`, `NumberField.tsx`, `OptionGroup.tsx`, `page.ts`, `ImageToolPage.astro`, `ImagePanel.tsx`, `pdf-client.ts`);
   - `src/engine/pdf/`, `src/i18n/routes.ts`, `src/analytics/`, `src/seo/meta.ts`, `src/views/`, `src/components/Footer.astro` e `src/search/`;
   - `astro.config.ts` (o grupo `island`) e `eslint.config.ts`;
   - `scripts/lib/` (`ymyl.ts`, `conteudo.ts`, `prontidao.ts`, `seo-pages.ts`), `scripts/screenshots.ts` e `lighthouserc.json`;
   - `tests/e2e/` (`ads`, `budgets`, `a11y`, `events`, `consent`, `cookie-footer` e `lib/pdf.ts`) e `tests/unit/` (`ymyl`, `conteudo`, `prontidao`, `routes`, `consent`, `verificar`).

Você pode ler a web (WebSearch e WebFetch) para documentação e regras oficiais:

- o CFPB e o Federal Reserve sobre hipoteca, refinanciamento, financiamento de carro, empréstimo pessoal, cartão, DTI e APR;
- a Regulation Z (12 CFR 1026, com o Apêndice J) e a Regulation DD (12 CFR 1030, com o Apêndice A, a fórmula do APY), no `consumerfinance.gov` ou no `ecfr.gov`;
- a documentação do numpy-financial;
- os blogs da decisão 14.

Ler não é mandar pedido a um serviço. Nada sai daqui além da leitura.

O oráculo roda em Python, fora do projeto Node, pelo `uv`, que o Victor instalou antes da run. O comando de referência:

```
uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py
```

Com essa versão, conferido em 31/out/2026: `npf.pmt(0.065/12, 360, -300000)` dá 1896.2040704…, e o laço de centavos da regra do plano dá os números do design system v1.1 (item 12 da lista do plano). São estes:

- parcela de $1,896.20;
- juros de $382,636.71;
- saldos de fim de ano de $296,646.88, $293,069.20 e $289,251.91;
- em 15 anos, $2,613.32 e $170,398.28 de juros, ou seja, $717 a mais por mês e $212,238 a menos de juros.

Confira com `uv --version` antes de tudo.

# Escopo

Dentro, em itens:

1. O oráculo, num commit anterior a qualquer arquivo de `src/calc/` (decisão 2).
2. Os motores em `src/calc/`, com a convenção da decisão 3.
3. A ilha das calculadoras e os seis componentes de calculadora do design system (decisões 4 e 5).
4. As 18 páginas da decisão 1, o hub, a home, o rodapé, a busca, as relacionadas e os chips (decisão 8).
5. O link do cenário (decisão 6) e o PDF e o CSV (decisão 7).
6. O conteúdo de confiança de cada página (decisão 9) e os 5 guias (decisão 10).
7. Os eventos novos (decisão 11) e a Política de Privacidade nos três idiomas (decisão 12).
8. O que cresce nos portões e testes (decisão 13), com o Lighthouse numa calculadora.
9. Os contatos de blogs em `docs/lancamento/` (decisão 14).
10. A revisão adversarial final, as correções, os screenshots, o relatório e uma seção nova no fim do `CLAUDE.md`.

Fora (não toque):

- Tudo da seção "Fora de toda run" do `CLAUDE.md`. Não envie e-mail nem preencha formulário de blog nenhum.
- Calculadoras em português ou espanhol (F6), casa e saúde (F7), PDF (F5), a 2b e o service worker (F8). A única mudança em pt e es é o texto da Privacidade, e talvez dos Termos (decisão 12).
- Tabela oficial que muda todo ano: imposto de renda, dedução de juros, limites do IRS, tabela de PMI, taxa de financiamento por estado. Também ficam fora:
  - a taxa do dia e a previsão de juros;
  - a indicação de banco, cartão, empréstimo ou produto;
  - regra que muda por estado. Quando a regra varia, ela vira campo.
- Data de calendário no cronograma. Ele corre por número de pagamento e por ano do empréstimo ("Year 1", "Payment 13"), então nada depende do dia do build.
- `.github/` inteiro e `scripts/ci/`. Achado nessas pastas vira pendência, com a correção proposta no relatório.
- As variáveis do Workers Builds, ligar anúncio e mudar o Consent Mode, as regiões ou o carregador do AdSense.
- Dependência nova, em `dependencies` ou em `devDependencies`. O numpy-financial vive só no oráculo, pelo `uv`, fora do `package.json`. O PDF usa o `@cantoo/pdf-lib`, que já existe, com as fontes padrão dele (sem fontkit). Nada de MDX nem biblioteca de gráfico.
- Cor, raio, sombra, ícone ou pose fora de `docs/design/`. O amarelo (`sun`) vai só no Baixar PDF. Nada de animação em JavaScript. As calculadoras usam os ícones que já existem, como `calculator`, `home`, `sparkline`, `table`, `link`, `download` e `pdf`.
- São só leitura: `PLANO-FILEORCA.md`, `docs/adr/ADR-001-plataforma-de-entrega.md`, `.githooks/`, `.claude/settings.json` e `docs/design/`. No `CLAUDE.md`, só uma seção nova no fim. No `DECISOES.md`, só § novos, a partir do próximo número livre.
- Tirar, pular, afrouxar ou mudar o sentido de teste que já existe. As páginas de imagem continuam passando no `budgets.spec.ts` e no `ads.spec.ts` sem mudança de asserção. Se uma mudança legítima obrigar a mexer numa asserção, registre num § qual foi e por quê.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do próximo § livre)

1. **Catálogo e ordem de construção.** As 18 linhas de dinheiro do `data/keywords.csv` têm `entra`, e todas estão no escopo. A ordem abaixo põe primeiro as cinco que a ficha nunca corta. Depois vêm as outras, pela regra do `data/README.md` (piso da faixa de volume vezes o lance; sem lance, conta 1). As três que a válvula pode cortar ficam no fim. A URL é o slug com barra no fim. O id da rota é o slug com `/` trocado por `-`. Os campos com taxa ou premissa trazem um exemplo rotulado "example". Em cada item vêm a pergunta que a página responde, os campos, o resultado e o oráculo.

   1. **Mortgage** (`/mortgage-calculator/`). Quanto fica a parcela da hipoteca.
      - Campos: preço do imóvel, entrada ($ ou %), prazo, juros, imposto do imóvel por ano, seguro por ano, e PMI e HOA por mês, opcionais e sem regra automática de término.
      - Resultado: a parcela total (principal e juros mais os itens), os juros totais, o SplitChart, o cronograma e o link.
      - Oráculo: `npf.pmt` e o laço de centavos, mais o exemplo do design system e o Loan Estimate de exemplo do CFPB. Confirme no site do CFPB antes de usar: o modelo H-24 tem $162,000 a 3.875% em 30 anos, com $761.78 de principal e juros.
   2. **Personal loan** (`/personal-loan-calculator/`).
      - Campos: valor, juros, prazo em meses e tarifa de originação (%, opcional).
      - Resultado: a parcela, os juros e o custo total. Com tarifa, também o APR efetivo.
      - Oráculo: `npf.pmt`, `npf.rate` e o laço.
   3. **Auto loan** (`/auto-loan-calculator/`).
      - Campos: preço, entrada, valor de troca, impostos e taxas em $ (um campo; nenhuma regra estadual), juros e prazo em meses.
      - Resultado: o valor financiado, a parcela, os juros, o custo total e o cronograma.
      - Oráculo: `npf.pmt` e o laço.
   4. **Refinance** (`/refinance-calculator/`). Vale refinanciar, e em que mês empata.
      - Campos: saldo atual, juros atuais, meses restantes, juros novos, prazo novo e custos de fechamento, pagos à parte ou somados ao saldo.
      - Resultado: a parcela nova, a economia por mês, o mês de empate e a diferença de juros e de custo no total, num ScenarioCompare do atual com o novo.
      - Oráculo: `npf.pmt` e o laço.
   5. **Home affordability** (`/home-affordability-calculator/`). Quanto de casa cabe na renda.
      - Campos: renda anual, dívidas mensais, entrada, juros, prazo, imposto, seguro e HOA. Também os limites de DTI de 28% e de 36%, como campos rotulados como regra de bolso comum. O texto diz que o banco decide e cita o CFPB.
      - Resultado: o preço máximo, a parcela máxima e qual dos limites segurou a conta.
      - Oráculo: `npf.pv` e o laço.
   6. **Loan amortization** (`/loan-amortization-calculator/`).
      - Campos: valor, juros e prazo.
      - Resultado: a parcela, os juros e o cronograma completo, que é o destaque da página.
      - Oráculo: o laço, conferido por `npf.ipmt` e `npf.ppmt`.
   7. **Compound interest** (`/compound-interest-calculator/`).
      - Campos: valor inicial, aporte mensal, juros ao ano, capitalização (anual, semestral, trimestral, mensal ou diária), anos e aporte no começo ou no fim do mês.
      - Resultado: o valor final, o total aportado, os juros e a tabela por ano.
      - A taxa do mês é a efetiva da capitalização escolhida, uma convenção declarada nas premissas.
      - Oráculo: o laço de centavos, conferido por `npf.fv`.
   8. **Credit card payoff** (`/credit-card-payoff-calculator/`).
      - Campos: saldo e APR, com dois modos: um pagamento fixo dá o número de meses, ou uma meta em meses dá o pagamento.
      - Resultado: os meses, os juros e o tempo dito como "3 years 4 months".
      - Premissas: juros do mês igual ao APR dividido por 12 sobre o saldo, e nenhuma compra nova.
      - Um pagamento que não cobre os juros dá a fala de erro, com o mínimo que cobre.
      - Oráculo: `npf.nper`, `npf.pmt` e o laço.
   9. **Debt payoff** (`/debt-payoff-calculator/`). Snowball ou avalanche.
      - Campos: até 10 dívidas (saldo, APR e mínimo) e um extra por mês.
      - Resultado: os meses, os juros e a ordem de quitação de cada método, num ScenarioCompare. O mínimo de uma dívida quitada passa para a próxima.
      - Oráculo: uma simulação em Python.
   10. **Rent vs buy** (`/rent-vs-buy-calculator/`).
       - Campos: preço, entrada, juros, prazo, imposto, seguro, manutenção (% ao ano), HOA, valorização (%), custo de venda (%), aluguel, reajuste do aluguel (%), rendimento do investimento (%) e anos.
       - Resultado: o patrimônio de cada caminho no ano N e o ano de empate, num ScenarioCompare.
       - Premissas: não entra imposto (nem dedução nem ganho de capital), e isso fica dito.
       - Oráculo: uma simulação em Python.
   11. **Mortgage with extra payments** (`/mortgage-calculator/extra-payments/`).
       - Campos: os da Mortgage, mais um extra mensal, um anual e um único (no mês N).
       - Resultado: os meses e os juros economizados, num ScenarioCompare sem e com o extra.
       - Oráculo: o laço.
   12. **Biweekly mortgage** (`/mortgage-calculator/biweekly/`).
       - Campos: os da Mortgage.
       - Resultado: a economia de juros e de meses.
       - A convenção da quinzena (26 meias parcelas por ano e como os juros correm) fica escolhida, declarada nas premissas e registrada.
       - Oráculo: o laço.
   13. **15 vs 30-year mortgage** (`/mortgage-calculator/15-vs-30-year/`).
       - Campos: preço, entrada e os juros de cada prazo.
       - Resultado: um ScenarioCompare de A com B e a frase da diferença.
       - Oráculo: `npf.pmt` e o laço, mais o exemplo do design system.
   14. **Balloon loan** (`/loan-amortization-calculator/balloon-payment/`).
       - Campos: valor, juros, prazo de amortização e mês do balão.
       - Resultado: a parcela e o valor do balão.
       - Oráculo: o laço, conferido por `npf.fv`.
   15. **Savings goal** (`/savings-goal-calculator/`).
       - Campos: a meta, o que já está guardado, os juros ao ano e o prazo. Ou o aporte, para saber o prazo.
       - Resultado: o aporte por mês, ou os meses.
       - Oráculo: `npf.pmt` e `npf.nper`, e o laço.
   16. **Debt consolidation** (`/debt-consolidation-calculator/`). A válvula pode cortar.
       - Campos: as dívidas atuais (saldo, APR e parcela) e o empréstimo novo (APR, prazo e tarifa em %).
       - Resultado: a parcela, os juros, o custo total e os meses dos dois lados, num ScenarioCompare.
       - Oráculo: `npf` e a simulação.
   17. **Simple interest** (`/simple-interest-calculator/`). A válvula pode cortar.
       - Campos: principal, taxa ao ano e tempo em anos, meses ou dias, com o ano de 365 dias.
       - Resultado: os juros e o total.
       - Oráculo: `decimal`.
   18. **APR to APY** (`/apr-to-apy-calculator/`). A válvula pode cortar.
       - Campos: a taxa, a capitalização e a direção (APR para APY ou o contrário).
       - Resultado: a outra taxa, com duas casas como a Regulation DD pede, e a tabela por capitalização.
       - Oráculo: `decimal`, mais os exemplos do Apêndice A da Regulation DD que você reproduzir.

   Os presets passam na regra da página programática do plano, com três blocos que não existem na página-mãe nem nos irmãos. No hub, as de crédito vêm antes das educativas.

2. **O oráculo vem antes do motor.**
   - Um script Python separado, `scripts/oracle/calc.py`, não importa nada do repositório. Ele usa o numpy-financial 1.1.0 e um laço em `decimal` com `ROUND_HALF_UP`, na regra do plano: a parcela arredondada ao centavo, os juros de cada período arredondados ao centavo, metade para cima, e a última parcela zerando o saldo.
   - Ele grava `fixtures/calc/<calculadora>.json`. Cada arquivo tem:
     - os casos de uma grade: juros 0%, juros baixos, típicos e altos (até 29.99% e mais nos cartões), prazos de 1, 12, 180 e 360, valores pequenos e grandes, a última parcela menor e o pagamento que não cobre os juros;
     - casos aleatórios com semente fixa;
     - o esperado;
     - um cabeçalho com o SHA-256 do script, as versões do Python, do numpy e do numpy-financial, e a data.
   - Guarde o cronograma inteiro só nos casos canônicos (uns 20 no total). Nos outros, guarde a parcela, os juros totais, o número de pagamentos, a última parcela e os saldos de fim de ano. O total de `fixtures/calc/` fica abaixo de uns 3 MB.
   - Os exemplos externos entram como casos marcados com a fonte:
     - o do design system;
     - os oficiais que você ler e reproduzir no centavo (o Loan Estimate H-24 do CFPB; o Apêndice A da Regulation DD; o Apêndice J da Regulation Z, se a Personal loan mostrar o APR com tarifa).
     Cada um traz a URL e a data da leitura em `fixtures/calc/OFICIAIS.md`. Exemplo oficial que o motor não reproduz no centavo por uma convenção diferente fica de fora, com o motivo escrito.
   - A origem entra no `fixtures/ORIGEM.md`.
   - O oráculo de todas as 18 calculadoras entra antes do primeiro arquivo de `src/calc/`. O relatório prova a ordem com `git log --format='%h %ad %s' --date=iso -- fixtures/calc src/calc`.
   - O CI nunca roda Python, só lê os JSON. Um teste do Vitest compara o motor com cada caso, no centavo. Outro reprova se o SHA-256 do script mudou sem as fixtures serem refeitas.
   - O esperado nunca sai do motor. Se motor e oráculo divergirem, ache a causa nos dois lados. Nunca ajuste o esperado para bater.
   - Se não houver `uv` nem Python que rode o numpy-financial, tente uma vez `winget install --id astral-sh.uv -e --accept-source-agreements --accept-package-agreements`. Se mesmo assim falhar, é bloqueio real: escreva o script e o resto, registre a pendência e deixe a PR em rascunho. Calculadora de dinheiro sem oráculo rodado não vai ao ar.

3. **A convenção numérica do motor.**
   - Todo dinheiro vai em centavos inteiros. A taxa vai como inteiro numa unidade que você fixa e registra (por exemplo, milésimos de ponto percentual).
   - Os juros de cada período saem por conta inteira exata (`BigInt`) com metade para cima. Assim o motor e o `decimal` do Python dão o mesmo centavo sem depender de arredondamento de ponto flutuante.
   - A parcela sai da fórmula fechada e é arredondada ao centavo. Juros 0% têm o caminho próprio, sem divisão por zero. A última parcela zera o saldo.
   - `src/calc/` não importa nada de fora da pasta. Uma regra nova no `eslint.config.ts` confere isso, com um teste que prova que um import de fora reprova.
   - Na tela, como nos exemplos do design system, a parcela vai com centavos e os totais da frase vão em dólares inteiros. O cronograma, o CSV e o PDF vão com centavos.
   - O parser de número já aceita o formato dos três idiomas ("1,234.56", "1.234,56" e o espanhol), com teste, porque a F6 usa. O site só mostra o inglês por enquanto.

4. **Uma ilha para todas as calculadoras, e o orçamento.**
   - Como a § 69 fez com as imagens, há uma ilha só, por exemplo em `src/tools/calc/`. Cada calculadora declara a sua definição: campos, conta, frase do resultado, cronograma, cenários, chips e relacionadas. As páginas, o hub, a busca e os testes leem um registro único.
   - O `NumberField` de calculadora segue o README dele:
     - decimal, com prefixo ou sufixo;
     - formata ao sair do campo;
     - recalcula a cada tecla válida, sem a pausa de 500 ms do campo das imagens;
     - o valor inválido mantém o último resultado;
     - a fala do erro diz a faixa aceita ("Enter a rate from 0 to 40%"). Cada campo tem uma faixa fixa, registrada.
   - O orçamento vale para toda página nova:
     - no máximo 80 KB gzip de JS inicial;
     - no máximo 8 requisições na primeira página;
     - no máximo 3 novas na seguinte, nos dois sentidos (de imagem para calculadora e de calculadora para calculadora);
     - nenhum worker, `.wasm` ou PDF antes do primeiro uso.
   - As páginas de imagem continuam com exatamente 2 arquivos JS e passam no `budgets.spec.ts` sem mudança.
   - A divisão em chunks é sua, no `astro.config.ts`. No `budgets.spec.ts`, o `TOOL_PAGES` (que afirma exatamente 2 arquivos) não muda. As páginas novas entram numa lista própria (`CALC_PAGES`, mais o hub e os guias), com o número exato de arquivos JS que você fixar e registrar. Se a calculadora também ficar em exatamente 2 arquivos, ela pode entrar no `TOOL_PAGES`. Registre a medida de antes e de depois das páginas de imagem e das de calculadora.
   - O cronograma só é montado quando a pessoa abre a seção. Recalcular custa no máximo 16 ms por tecla (critério 7).

5. **Campos, resultado e voz** (o molde do plano e os READMEs dos componentes).
   - Não existe botão Calcular. No celular, o resultado fica logo abaixo dos campos principais, acima da dobra a 360 × 740.
   - O ResultHero tem o número grande e a frase com os números em negrito.
   - O `aria-live` do ResultHero espera 500 ms depois da última tecla e é a única voz do resultado. Nada mais anuncia o número (§ 102). O "Link copied" da ExportBar tem o `role="status"` próprio, como o README pede.
   - A Oli aparece em `cheer`, com a Placa, só no primeiro resultado da visita. A marca dessa visita, se for guardada, é um booleano, nunca um número.
   - O SplitChart é um SVG próprio. O ScenarioCompare dá a frase da diferença sem eleger vencedor. O AmortTable vem recolhido por ano, com o primeiro ano aberto.
   - A ExportBar tem PDF (amarelo), CSV e Copiar link, nessa ordem.
   - Os chips de próximo passo levam a calculadoras que existem.
   - A linha do café não entra nas calculadoras nesta fase. O link do rodapé continua. Registre isso.
   - Voz do design system: sentence case, sem emoji, sem as palavras proibidas e uma exclamação por tela.

6. **O link do cenário e a privacidade dos números.**
   - O link guarda os números depois do `#`, com chaves curtas e uma versão (`#v=1&…`).
   - A página lê o `#` uma vez, na carga. Cada valor passa pela faixa do campo, e o que vier inválido é ignorado em silêncio.
   - A página nunca escreve na URL: nada de `pushState`, `replaceState` ou atribuição a `location.hash`. O botão só monta o texto e copia para a área de transferência. Ele vira "Link copied" por 2 s, num `role="status"`. Se a área de transferência não existir, ele mostra o link num campo só de leitura.
   - Nenhum número vai para `localStorage`, `sessionStorage`, cookie, IndexedDB, título da página, nome de arquivo baixado, `dataLayer`, evento ou requisição.
   - O teste de privacidade (critério 4) prova tudo isso.

7. **PDF e CSV.**
   - O PDF é montado com o `@cantoo/pdf-lib` só no clique, no worker de PDF que já existe ou num módulo carregado sob demanda. Ele usa as fontes padrão. Traz o nome da calculadora, os números de entrada, o resultado, as premissas, o cronograma inteiro (quando houver), o aviso de ferramenta educativa e o endereço fileorca.com.
   - O CSV sai da ilha, com BOM UTF-8. Em inglês ele usa vírgula como separador e ponto como decimal, com aspas pela RFC 4180. Uma linha de cabeçalho vem antes das mesmas linhas da tabela.
   - Os nomes de arquivo são fixos e sem números, como `mortgage-schedule.pdf`.
   - Uma falha ao carregar o PDF dá a fala de "recarregue a página" e nunca trava a página (o `loading()` da § 102 é o modelo).
   - Os testes conferem:
     - o CSV, lido de volta, é igual ao cronograma do oráculo, centavo por centavo;
     - o PDF passa no `strictPdf` de `tests/e2e/lib/pdf.ts`;
     - o PDF traz o total e a última linha do cronograma, lidos do content stream descomprimido no Node.

8. **Hub, home, rodapé, busca e relacionadas.**
   - O hub `/money-calculators/` segue o molde do `/image-tools/` (§ 77 e § 96):
     - o `fo-hubband` com H1 próprio;
     - a grade, com as de crédito primeiro;
     - a tabela dos presets e a lista dos guias;
     - um texto "how these calculators work", que passa no portão de dinheiro com fórmula, premissas, exemplo, fonte, "Revisado em" e aviso, e dá as 150 palavras por AdSlot do `gate:prontidao`.
   - A home em inglês ganha a seção de dinheiro, com as cinco de crédito e o link do hub. A home continua sem anúncio.
   - O rodapé ganha a coluna Money em inglês. Os links dela são escolha sua, registrada, contanto que nenhuma página fique órfã.
   - A busca ganha as calculadoras e os guias. Cada página tem até 6 relacionadas que existem.
   - O schema é `WebApplication` sem nota, mais `BreadcrumbList` e `Person`. Os guias usam `Article`, com autor e datas.
   - A imagem de Open Graph de cada página nova sai do build, e as páginas novas entram no sitemap.
   - O hreflang segue a § 58 (página só em inglês), e o menu de idioma segue a § 84.

9. **Confiança (YMYL) em toda página do hub de dinheiro**, inclusive o hub e os guias:
   - a fórmula em texto;
   - as premissas;
   - um exemplo resolvido, com os números do oráculo;
   - a fonte oficial: o CFPB ou o Federal Reserve, com a página exata lida na data;
   - o autor e o "Revisado em", com a data da run e "First published";
   - o aviso curto de ferramenta educativa.

   O texto não tem taxa do dia, previsão nem indicação de produto. O portão de dinheiro passa a exigir que o número de páginas conferidas seja igual ao número de rotas com `adArea: 'dinheiro'`, e zero reprova. Um teste no `routes.test.ts` garante a área `dinheiro` em toda rota que sai do registro das calculadoras (as calculadoras e os presets), dos guias e do hub. O teste lê os ids do registro, não o sufixo da URL. Se precisar de outro domínio oficial na lista (por exemplo `ecfr.gov`), ele entra com teste e §.

   Cada página de calculadora também precisa:

   - de "como usar" em 3 passos ou mais;
   - de pelo menos 4 perguntas reais no Faq;
   - da nota de privacidade ("Your numbers stay on your device");
   - das relacionadas.

   O `gate:conteudo` ganha esses blocos para as calculadoras, com controles positivos e negativos no `tests/unit/conteudo.test.ts`. O `gate:prontidao` passa a ler o registro das calculadoras: cartões e busca só do registro, H1, título e descrição próprios, 60 palavras por página e 150 por AdSlot. Os títulos começam pelo nome da calculadora, como "Mortgage Calculator with Extra Payments | FileOrca".

10. **Os 5 guias, em `/guides/<slug>/`, só em inglês.**
    - São páginas Astro com o texto em arquivos TypeScript de tradução, como o resto do site, e sem índice `/guides/` nesta fase. O breadcrumb é Home › Money calculators › título.
    - Os temas são estes. Os dois primeiros vêm do plano; os títulos podem mudar, mas sem ano no título.
      1. "15 vs 30-year mortgage: the real cost", com o preset 15 vs 30 embutido.
      2. "Snowball vs avalanche, with numbers", com a Debt payoff.
      3. "How extra payments shorten a mortgage", com o preset de pagamento extra.
      4. "Refinancing: find your break-even month", com a Refinance.
      5. "Rent vs buy: when buying starts to pay off", com a Rent vs buy.
    - A calculadora embutida vem preenchida com o exemplo do texto, por propriedade da página e nunca pela URL.
    - Todo número do guia sai do motor no build, e o exemplo principal de cada guia está nas fixtures do oráculo, com teste. O dado próprio que torna o guia difícil de copiar é uma tabela medida por script, como o custo dos dois prazos em várias taxas, com a data.
    - Cada guia tem de 800 a 1.500 palavras e passa num checklist fixo, que o relatório mostra item por item:
      1. nenhum resultado de conta escrito à mão: todo resultado sai do motor (prazos do título, limites de DTI e números citados de regra oficial não são resultado);
      2. nada de taxa do dia, previsão ou produto;
      3. a fórmula, as premissas, o exemplo, a fonte e o aviso;
      4. as regras citadas com fonte oficial;
      5. a voz do design system;
      6. nenhuma frase de enchimento ("in today's world", "delve", "it's important to note", "in conclusion");
      7. zero erro de gramática no `lint:texto`.
    - Os guias são do modelo forte, não de subagente.

11. **Eventos.**
    - Entram na lista fechada de `src/analytics/events.ts`:
      - `calc_complete` (`tool`, `lang`), uma vez por carga, na primeira mudança válida feita pela pessoa, nunca na carga;
      - `export_click` (`tool`, `lang`, `format`: `pdf` ou `csv`);
      - `share_click` (`tool`, `lang`).
    - O `next_step_click` passa a aceitar alvos de calculadora.
    - O `tool` é o id da página, de uma lista fechada tirada do registro. Nenhum parâmetro leva número.
    - Os testes ficam no `tests/unit/consent.test.ts` e no `events.spec.ts`.

12. **Política de Privacidade nos três idiomas.**
    - Diz que os números digitados ficam no aparelho e que o link do cenário guarda os números depois do `#`, parte que o navegador não envia. Diz também que o PDF e o CSV são gerados no aparelho e que nenhum evento leva número.
    - Os Termos ganham, nos três idiomas, a frase de que as calculadoras são educativas e não são recomendação financeira, se ainda não disserem.
    - O Sobre muda só se listar o que o site tem.
    - O pt e o es passam pelo `lint:texto`.

13. **Portões e testes que crescem.** Nenhum portão fica mais frouxo.
    - O `ads.spec.ts` ganha cada página nova e o hub. Ele mede a 360 × 740 e a 1280 × 800, com o cronograma fechado e com um ano aberto. Os alvos são cada campo, cada `<select>`, o ResultHero, os três botões da ExportBar, o ScenarioCompare e o AmortTable, além do que já mede. Nenhum anúncio fica acima da ferramenta no celular, entre os campos ou dentro do cronograma.
    - O `budgets.spec.ts` e o `a11y.spec.ts` ganham as páginas novas, com os estados no mesmo carregamento (§ 76): resultado, erro de campo, cronograma aberto, cenários e "Link copied".
    - O `gate:design` e os testes de qualidade aceitam o amarelo do Baixar PDF da ExportBar e nenhum outro.
    - O `lighthouserc.json` ganha a `/mortgage-calculator/` e um guia. Desempenho 90 ou mais e CLS de até 0,05.
    - O `pnpm screenshots` passa a gravar os componentes e as páginas de calculadora nos dois temas, a 360 e a 1280 px, em `docs/relatorios/fase-04/componentes/`. A pasta da F3 fica como está.

14. **Contatos com blogs de finanças dos EUA, em `docs/lancamento/blogs-financas.md`.**
    - São 20 blogs de finanças pessoais, reais e ativos, com um post nos últimos 90 dias, aberto com o WebFetch na data da run, e um caminho público de contato. Escolha pela relevância para as calculadoras que entraram.
    - Cada linha traz:
      - o nome, a URL, a página de contato e o post recente lido;
      - um artigo do blog em que a calculadora ajuda, com a URL aberta;
      - o ângulo: grátis, sem cadastro, o link do cenário e o cronograma em PDF para citar;
      - o rascunho do e-mail em inglês, personalizado, de `contato@fileorca.com`, assinado por Victor Yuki Matusita;
      - o status "não enviado".
    - Nunca entra link pago, troca de links, guest post em troca de link nem lista que vende link (as políticas de spam do Google). Nada de "best", "#1" ou número que não foi medido.
    - Atualize o `docs/lancamento/README.md` com a ordem (depois do merge da F4) e o checklist. Os textos em inglês passam pelo LanguageTool local que o `lint:texto` sobe, e o resultado vai colado.
    - Um subagente Sonnet com acesso à web faz essa parte em paralelo, escrevendo só em `docs/lancamento/`.

15. **Tempo do CI.**
    - Cada parte fica abaixo de 900 s, com alvo de 700 s.
    - Os testes novos são baratos: uma carga por página e navegador, com as larguras, os temas e os estados no mesmo carregamento, e as contas pesadas no Vitest, não no navegador.
    - Leia o tempo de cada parte com `gh run view <id> --log`. Se uma passar de 700 s, registre e proponha no relatório mais uma divisão, que é um ajuste de `.github/` do Victor.
    - Nunca aumente o limite, ligue `retries` ou aumente o timeout.

# Pontos de atenção

- A "Nota para a F4" da F3, em resumo:
  - nenhum import do motor na ilha, só pelo cliente sob demanda;
  - as páginas novas entram no `TOOL_PAGES` do `ads.spec.ts` e na lista de orçamento da decisão 4;
  - o campo diz a faixa;
  - o resultado não é anunciado a cada tecla;
  - 150 palavras do `<main>` por AdSlot, ou seja, 300 com dois AdSlots;
  - o hub precisa de texto próprio;
  - `reason` e `outcome` novos entram na lista fechada com teste.
- O aviso de cookies flutua sobre o fim da página (§ 106). Teste que clica no fim do rodapé fecha o aviso antes (`dismissCookies`).
- O GA4 só carrega em fileorca.com (§ 8). Nos testes, o `dataLayer` existe, e é nele, nas requisições de toda origem e no armazenamento que o teste de privacidade procura os números.
- O `exactOptionalPropertyTypes` do tsconfig, os tipos de evento de `preact` e o `stroke-width` em SVG estão no `CLAUDE.md`.
- No Git Bash, escreva arquivos com a ferramenta de edição. Rode `git push` e `gh pr create` em comandos separados. O `node -e` com crase estraga o texto.
- Subagentes que rodam o Playwright ao mesmo tempo usam cada um o próprio `FO_PORT` e a própria `--output`, nunca a pasta em que você edita.
- O WebKit do Windows pode travar com várias execuções do Playwright ao mesmo tempo. Antes de achar que um teste do WebKit está errado, rode-o de novo com a máquina livre.

# Critérios de aceitação (cada um com evidência no relatório)

1. As 18 páginas, o hub e os 5 guias respondem 200 no `dist/` e na prévia, cada um com o H1, o título e a descrição dele. Se a válvula cortar algo, a lista diz o que foi para a 4b.
2. O oráculo de todas as calculadoras está num commit anterior ao primeiro arquivo de `src/calc/`, provado pelo `git log`. O teste do Vitest compara todos os casos e fica verde, com o número de casos por calculadora. Ele reprova uma mudança de um centavo, provada por um mutante: mude uma fixture numa cópia temporária e cole a falha. O teste do SHA-256 também fica verde.
3. Os exemplos externos (o do design system e os oficiais reproduzidos) batem no centavo, com a URL e a data de cada um em `fixtures/calc/OFICIAIS.md`.
4. O teste de privacidade fica verde nos dois navegadores, em toda página de calculadora. Ele digita valores-sentinela longos e únicos em todo campo da página, por exemplo 987654.32 para dinheiro, 13.5791 para taxa e 287 para meses. Depois abre o cronograma, exporta o PDF e o CSV, copia o link, clica num chip e carrega uma página com `#`. Por fim, procura cada sentinela nas formas que ele pode tomar ("987654.32", "987,654.32", "98765432", "987654", "13.5791", "0.135791"). A busca exige que não haja dígito colado antes ou depois, para não casar com qualquer número. Os lugares onde ela procura:
   - toda URL e todo corpo de requisição, de qualquer origem;
   - o `dataLayer`, o `document.title`, o `location.search`, o `localStorage`, o `sessionStorage` e os cookies;
   - o nome dos arquivos baixados.

   Nenhum aparece. O `page_location` não tem `#`. A cópia da área de transferência é o único lugar em que o link com números aparece.
5. O `gate:dinheiro-saude` confere todas as páginas do hub de dinheiro, com a contagem igual ao número de rotas, e fica verde. O `gate:conteudo` e o `gate:prontidao` ficam verdes com as páginas novas, e os controles negativos novos reprovam.
6. O `budgets.spec.ts` fica verde, com o JS inicial e as requisições de cada página nova. As páginas de imagem seguem com 2 arquivos JS e dentro do orçamento, e a tabela mostra o JS e as requisições delas antes e depois.
7. Um teste no Chromium mede 30 teclas nas três calculadoras mais pesadas: a Rent vs buy, a Debt payoff com 10 dívidas e o preset de pagamento extra. A medida roda dentro da página, num `page.evaluate` só por calculadora, sem ida e volta ao Playwright a cada tecla. Ela vai do disparo do evento `input` com `performance.now()` até o `MutationObserver` ver o número novo no ResultHero, e afirma que a p95 fica em até 16 ms. O teste também prova que nenhuma linha de mês existe no DOM antes de o cronograma abrir.
8. O CSV de uma página com cronograma, lido de volta, é igual ao oráculo, e o PDF passa nas conferências da decisão 7.
9. O Lighthouse no celular da `/mortgage-calculator/` e do guia dá desempenho 90 ou mais e CLS de até 0,05. As páginas que já estavam no `lighthouserc.json` não pioram.
10. O `docs/lancamento/blogs-financas.md` tem 20 blogs (ou pelo menos 10, pela válvula), cada um com a URL aberta na data, e o LanguageTool não acha erro de gramática nos textos.
11. O `pnpm verificar` fica verde na sua máquina, com a saída e o tempo de cada portão, e em todas as partes do CI, com o tempo de cada uma, todas abaixo de 900 s. Nenhum `skip`, `fixme`, `only`, `retries` ou `continue-on-error` novo.
12. Nenhuma dependência nova: o `package.json` só ganha scripts, e o `pnpm-lock.yaml` não muda. Nada em `.github/`, `scripts/ci/` e nos arquivos só de leitura: `git diff --stat origin/main...HEAD -- .github scripts/ci PLANO-FILEORCA.md docs/adr/ADR-001-plataforma-de-entrega.md .githooks .claude/settings.json docs/design` é vazio.
13. O comentário do Workers Builds aparece na PR, e o Playwright confere na prévia, com o Google bloqueado, a Mortgage a 360 e a 1280 px, com screenshot.
14. Depois do merge, só por leitura (na resposta final, não no relatório):
    - o `https://fileorca.com/build.txt` traz o commit do merge;
    - o pós-deploy está verde (`gh run list --workflow pos-deploy.yml`);
    - a `/mortgage-calculator/` e o `/money-calculators/` respondem 200 sem `x-robots-tag`;
    - o sitemap em inglês lista as páginas novas.

# Verificação: rode de verdade

- Na ordem: o oráculo, depois o teste do motor contra ele, falhando enquanto o motor não existe, e depois o motor até passar. O mesmo vale para cada página: o teste de anúncio, orçamento e privacidade dela antes de dar a página por pronta.
- Leia cada falha, corrija a causa e repita até passar. É proibido desligar, pular, marcar como skip, afrouxar limiar, mudar orçamento, ligar `retries` ou aumentar timeout para passar. Se um portão estiver de fato errado, corrija o portão com um teste que prove o erro e registre no `DECISOES.md`.
- No fim, rode o verificar inteiro numa execução limpa (`pnpm install --frozen-lockfile` e `pnpm verificar`, que já builda do zero) e guarde a saída completa. Rode o `pnpm screenshots` depois do último ajuste visual.
- Depois de abrir a PR, acompanhe com `gh pr checks <n> --watch` e conserte o que só falha no Ubuntu. Leia o tempo de cada parte no log. Espere o comentário do Workers Builds por até 30 min, olhando a cada poucos minutos com `gh pr view <n> --comments`. Se o build do Workers Builds ficar vermelho, o check não traz o log e a causa não se deduz pelo tempo (`CLAUDE.md`): registre a pendência com o ID do build e siga.

# Autonomia e decisões

Você está rodando sozinho e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `CLAUDE.md`, a ficha F4 e o resto do plano.
3. O `docs/design/` e o `DECISOES.md`.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: a unidade da taxa, a convenção da quinzena, a faixa de cada campo, os chunks, os links do rodapé.

Uma mudança de arquitetura (host, framework, estrutura, pipeline) vira uma ADR "Proposta" em `docs/adr/` e uma pendência. O resto segue.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- uma página oficial que não abre;
- um blog fora do ar;
- o LanguageTool sem responder;
- o comentário do Workers Builds que não chega.

A exceção é o oráculo (decisão 2): sem ele, a PR fica em rascunho.

Válvula de estouro, nesta ordem, se o tempo ou o limite apertar:

1. Os contatos de blogs caem de 20 para 10.
2. A Simple interest, a APR to APY e a Debt consolidation vão para a run 4b, nessa ordem de corte, com as fixtures delas já feitas. Saem as páginas, as rotas, os cartões e todo link para elas (§ 85 é o modelo), e nada fica "em breve".

O que for cortado vai para o relatório como pendência, com o que falta.

Nunca corte:

- o oráculo antes do motor e o teste no centavo;
- a Mortgage, a Refinance, a Auto loan, a Personal loan e a Home affordability;
- o teste de privacidade dos números e o link do cenário;
- o PDF e o CSV;
- o portão de dinheiro conferindo as páginas de verdade;
- o hub e os 5 guias;
- a revisão adversarial final.

# Git e segurança

- Comece com `git switch main` e `git pull --ff-only`. Antes de criar a branch, o `git status` só pode mostrar como não rastreados `docs/prompts/prompt-fase-04.md` e `docs/prompts/prompt-fase-04.txt`, o prompt desta run. Se o ajuste do WebKit não rodou, `docs/prompts/prompt-ajuste-ci-webkit-tres.md` e `.txt` também podem aparecer: deixe-os como estão e não os commite. Crie a branch com `git switch -c fase-04`. Os dois arquivos entram sem edição no primeiro commit dela. Se eles não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-04.txt`.
- Faça commits pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits). O commit do oráculo vem antes de qualquer arquivo de `src/calc/`.
- Faça push só em marcos (uns seis na run inteira), porque cada push roda todas as partes do CI e gasta minutos do plano grátis do GitHub.
- Abra a PR cedo, em rascunho, logo que a Mortgage estiver no ar no `dist/` com os testes dela verdes. Use `gh pr create --draft --base main --head fase-04`, num comando separado do push. Título e descrição em português, com o resumo e o link do relatório.
- A worktree da revisão (`.claude/worktrees/revisao-f4`) é só de leitura. Remova-a no fim com `git worktree remove`.
- Rode `gh pr ready` só no fim (e nunca com o WebKit ainda em duas partes no `ci.yml`, como diz o Contexto), com o relatório, a revisão, os contatos e os screenshots commitados e o verificar local verde. Com o CI verde, o job de merge mescla sozinho e o Workers Builds publica. Depois do `ready`, acompanhe o CI até o fim. Se ele falhar, corrija e envie. Depois do merge, faça as conferências do critério 14 só por leitura e não abra outra PR: o que sobrar vai para a resposta final como pendência.
- Nunca:
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh api` com método de escrita, `gh secret` ou `gh variable`;
  - `wrangler deploy` em qualquer forma, inclusive `--dry-run`.

  O `.claude/settings.json` nega esses comandos. Não tente contornar.
- Na produção, nada de visita de navegador sem bloquear os domínios do Google com `context.route` (`CLAUDE.md`, F3), para nenhum acesso seu cair no GA4.

# Como trabalhar

1. **Explorar**, com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) a ficha F4, as seções do plano e as regras do `CLAUDE.md`, transformadas num checklist "requisito → onde vai ficar → que teste prova";
   - (b) a arquitetura das ferramentas de imagem (registro, ilha, molde da página, chunks, orçamento e portões), e o jeito de uma calculadora entrar sem quebrar os 2 arquivos JS das páginas de imagem;
   - (c) os seis componentes de calculadora do design system, do README e do `preview.html`, com a marcação, os estados e os tokens;
   - (d) as fontes oficiais e os exemplos resolvidos (CFPB, Federal Reserve, Regulation Z e Regulation DD), com a URL, a data e os números de cada exemplo, e a documentação do numpy-financial.

   Em paralelo, desde o começo, o subagente dos blogs (decisão 14).
2. **Planejar.** Escreva `docs/relatorios/fase-04-plano.md`, autossuficiente. Ele traz:
   - as interfaces de `src/calc/` e da definição de calculadora;
   - a lista de casos do oráculo por calculadora;
   - a faixa de cada campo;
   - os chunks e o orçamento projetado;
   - o molde das páginas, do hub e dos guias;
   - cada critério ligado a um teste ou comando;
   - a ordem de construção e a projeção do tempo do CI.

   Ele é o gabarito da revisão.
3. **Implementar** em fatias que terminam verdes, nesta ordem:
   - o oráculo das 18, num commit;
   - o núcleo de `src/calc/` (centavos, taxa, parcela, laço) com o teste contra o oráculo;
   - a ilha, os componentes e a Mortgage inteira, com PDF, CSV, link e os testes de anúncio, orçamento, axe e privacidade; depois, a PR em rascunho;
   - as outras quatro que nunca se cortam;
   - as demais, na ordem da decisão 1;
   - o hub, a home, o rodapé e a busca;
   - os 5 guias;
   - a Privacidade e os Termos;
   - o Lighthouse e os screenshots.

   O código fica no modelo forte, num agente só, para não colidir na ilha, no CSS e no registro.
4. **Revisão adversarial final**, no método da F3 (`CLAUDE.md`, F3, § 92 a § 94):
   - Ela roda sobre um commit fixo, registrado, numa worktree só de leitura com o próprio `pnpm install --frozen-lockfile` e `pnpm build`. Cada lente usa um `FO_PORT` (4174 a 4179) e uma `--output` só dela.
   - São seis lentes Sonnet em contexto limpo, contra este prompt e a ficha:
     - (a) corretude financeira: motor contra oráculo, casos de borda, premissas honestas, frase e gráfico iguais aos números;
     - (b) privacidade dos números;
     - (c) anúncio, política e YMYL;
     - (d) acessibilidade (WCAG 2.2 AA: campos, erros, `aria-live`, tabela, gráfico e teclado);
     - (e) desempenho e SEO (orçamento, 16 ms, Lighthouse, schema, sitemaps, canibalização entre guia e calculadora);
     - (f) aderência ao design system.
   - Cada achado crítico, alto ou médio ganha um cético próprio, e os baixos de cada lente vão a um cético só.
   - Crítico e alto confirmados: sempre corrigidos. Médio: corrigido se a correção é local. Baixo: vai para o relatório. Cada correção leva um teste que falha sem ela e um §.
   - Depois, uma segunda passada revisa o diff das correções.
   - Tudo fica em `docs/relatorios/REVISAO-F4.md`. Remova a worktree no fim.

# Relatório final

Escreva `docs/relatorios/fase-04.md` em português, commitado na branch antes do `gh pr ready`. Como o relatório entra antes do merge:

- ele cita a última execução verde do CI com código ou teste, com o link e o tempo de cada parte;
- o CI do commit do relatório, o merge e as conferências do critério 14 vão na resposta final, como a F3 fez.

O relatório traz:

- o resumo e a tabela das páginas: URL, o que responde, número de casos do oráculo, JS inicial e requisições;
- o oráculo:
  - o `git log` que prova a ordem;
  - os casos por calculadora;
  - a saída do teste;
  - o mutante que reprova;
  - os exemplos oficiais reproduzidos e os deixados de fora, com o motivo;
- a saída do teste de privacidade e o que ele procura;
- a medida dos 16 ms (p50 e p95 por calculadora);
- o resumo da revisão por lente e severidade, apontando para o `REVISAO-F4.md`;
- a saída real e completa do `pnpm verificar` local, com o tempo de cada portão, e o link da execução verde do CI, com o tempo de cada parte;
- o Lighthouse das páginas do `lighthouserc.json`;
- os screenshots;
- o link da prévia, o que você conferiu nela e, depois do merge, o que conferiu no fileorca.com;
- as decisões novas, apontando os §;
- o que a válvula cortou e o que fica para a 4b, se houver;
- **a lista do que é do Victor, em passos:**
  1. Abrir três calculadoras no celular e no computador.
  2. Enviar os contatos de `docs/lancamento/blogs-financas.md`, reescrevendo cada e-mail com as próprias palavras.
  3. No Search Console, pedir a indexação do `/money-calculators/` e da Mortgage.
  4. As pendências que seguem abertas da F3 (§ 103) e do `docs/F0-SAIDA.md`.
  5. Gerar o prompt da 2b e o da F5a.
- uma nota para a F6: o que o dinheiro adaptado em português vai reusar (o parser, o CSV com ponto e vírgula, o registro, as fixtures) e onde vai esbarrar.

Acrescente no fim do `CLAUDE.md` uma seção curta, "F4: calculadoras", com:

- o comando do oráculo e como refazer as fixtures;
- como acrescentar uma calculadora: o registro, as fixtures, o motor, a página, os textos e os testes, como a F2 fez para as imagens;
- a convenção numérica;
- as armadilhas que você achou.

Não apague nada do que já existe.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR e se o merge automático e o pós-deploy aconteceram.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, a descrição da PR e as explicações de `docs/lancamento/`.

Em inglês:

- o código, os nomes de arquivo, os identificadores e os commits;
- o script do oráculo;
- os textos das páginas;
- os e-mails para os blogs.

Os textos do site ficam nos arquivos de tradução de cada idioma, com a voz de `docs/design/README.md`: sentence case, sem emoji e sem as palavras proibidas.
```

## Como executar

São três etapas: o pré-voo, o ajuste curto do CI (com o seu merge) e a F4.

### 1. Pré-voo (uns 15 min, uma vez)

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 60f84da (o merge do ajuste do aviso) ou mais novo
git status                  # só os 4 arquivos de prompt em docs/prompts/ como não rastreados
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado na conta dona de vmatusita/fileorca
claude --version            # o modo auto pede 2.1.83 ou mais
winget install --id astral-sh.uv -e
```

Feche e abra o terminal. Depois confira o oráculo:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -c "import numpy_financial as npf; print(round(npf.pmt(0.065/12, 360, -300000), 2))"
```

O comando tem que imprimir `1896.2`. Na primeira vez, o `uv` baixa um Python 3.13 só dele, então pode demorar um pouco. Não achei Python em `Program Files` nem em `AppData\Local\Programs`, e é por isso que o `uv` entra. Sem ele, a F4 escreve tudo, mas deixa a PR em rascunho: calculadora de dinheiro sem oráculo rodado não vai ao ar.

Por último, deixe o PC sem suspender:

```powershell
powercfg /change standby-timeout-ac 0
```

Volte o valor ao normal depois da F4.

### 2. Ajuste do WebKit em três partes (uns 30 a 50 min, merge seu)

```powershell
claude --model opus --permission-mode auto -n ajuste-ci-webkit-tres
```

Cole o conteúdo inteiro de `docs\prompts\prompt-ajuste-ci-webkit-tres.txt` e deixe rodar.

Quando a PR estiver com as cinco partes verdes, abra a PR no GitHub e use **Squash and merge**, depois **Delete branch**. O job de merge vai ter comentado que a PR mexe no pipeline e fica com você: é o esperado. Depois:

```powershell
git switch main
git pull --ff-only
gh run list --workflow pos-deploy.yml --limit 1   # verde
git status                                        # só docs/prompts/prompt-fase-04.md e .txt como não rastreados
```

### 3. A F4

```powershell
claude --model opus --permission-mode auto -n fase-04
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-04.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar: `/goal pnpm verificar verde, fixtures/calc commitado antes de src/calc, docs/relatorios/REVISAO-F4.md sem achado crítico ou alto aberto e a PR da fase-04 marcada como pronta`. Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-04` e mande: "continue de onde parou: leia docs/relatorios/fase-04-plano.md, o git log da branch fase-04 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-04.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-04.json
(Get-Content $HOME\run-fase-04.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Esta é a maior run até aqui.** São 18 páginas, o hub, 5 guias, o oráculo, a pesquisa de 20 blogs e uma revisão em seis lentes com céticos. Comece com bastante folga no limite semanal do Claude Code. Se ele acabar no meio, retome na janela seguinte: os commits pequenos guardam o que já foi feito, e a válvula manda as três últimas calculadoras para uma 4b se for preciso.

**Por que o modo `auto`:** a run faz várias coisas sem perguntar:

- `uv run` (baixa o numpy-financial);
- `pnpm` (build, Vitest, Playwright em várias portas e Lighthouse);
- cria e remove uma worktree;
- lê a web;
- faz commit e push da branch;
- abre a PR e a marca como pronta.

O `auto` deixa tudo isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo: push na main, `gh pr merge`, `wrangler deploy`, reset e amend. O prompt não pede nada disso, nem pede para mandar nada para fora: os e-mails dos blogs ficam só em rascunho. Instalar o `uv` no pré-voo evita que a run precise do `winget`, que o classificador pode barrar.

### 4. Acompanhar

- A PR aparece em rascunho em github.com/vmatusita/fileorca/pulls quando a Mortgage fica pronta. Ela traz o link da prévia, e dá para testar a Mortgage no celular enquanto o resto é construído.
- O oráculo aparece cedo na branch, em `fixtures/calc/`, antes de qualquer arquivo de `src/calc/`.
- A revisão sai em `docs/relatorios/REVISAO-F4.md`, perto do fim.
- **Atenção:** quando a run marca a PR como pronta e o CI fica verde, o merge é automático, e o Workers Builds publica.

### 5. Ao voltar

1. Leia `docs/relatorios/fase-04.md` e confira as evidências:
   - o `git log` que mostra o oráculo antes do motor, e o mutante de um centavo que reprova;
   - a saída do teste de privacidade dos números;
   - a medida dos 16 ms por tecla;
   - a saída do `pnpm verificar` e o tempo de cada parte do CI;
   - o `REVISAO-F4.md`, com o veredito de cada cético.
2. Confira a produção:

   ```powershell
   curl.exe -s https://fileorca.com/build.txt         # o commit do merge
   gh run list --workflow pos-deploy.yml --limit 3    # verde
   git switch main; git pull --ff-only
   ```

   Abra a `https://fileorca.com/mortgage-calculator/` no celular. Mude os números, use "Copy link", abra o link copiado noutra aba e veja os mesmos números. Baixe o PDF e o CSV.
3. Siga a lista "O que é do Victor" do relatório: os e-mails dos blogs (reescritos com as suas palavras, de 2 a 3 h) e o pedido de indexação do hub e da Mortgage no Search Console.
4. Gere o prompt da 2b e o da F5a.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta de ajuste, com o que aprendeu.

## Suposições que fiz

- **O ajuste do WebKit roda antes, e você o mescla.** Foi a sua escolha. Se a F4 rodar sem ele, ela faz tudo, mas deixa a PR em rascunho até o ajuste entrar. Assim nada estoura o CI, e a F4 não se mescla antes do ajuste.
- **Entram as 18 com `entra`.** A válvula da ficha só corta as três últimas (Debt consolidation, Simple interest e APR to APY), e os contatos podem cair de 20 para 10.
- **O oráculo roda pelo `uv`, com o numpy-financial 1.1.0 e um laço em `decimal`.** O motor guarda a taxa e o dinheiro em inteiros, com os juros de cada período por conta exata, para bater no centavo sem depender de ponto flutuante.
- **Os guias ficam em `/guides/<slug>/`, sem página índice por enquanto.** Os dois temas do plano entram, e os outros três são escolha minha: pagamento extra, ponto de empate do refinanciamento e alugar ou comprar. Cada um embute uma calculadora diferente.
- **O cronograma corre por número de pagamento e ano do empréstimo, sem data de calendário.** Assim nada depende do dia do build, e os testes ficam estáveis.
- **Nenhuma regra estadual nem tabela anual:**
  - PMI e HOA são campos simples em $ por mês;
  - os impostos e as taxas do carro são um campo só;
  - os limites de DTI de 28% e 36% são campos de exemplo.
- **A linha do café fica fora das calculadoras nesta fase.** O link do rodapé continua.
- **No pt e no es, a F4 só toca a Privacidade**, e os Termos se precisar. Essas páginas existem nos três idiomas.
- **Nenhuma dependência nova nem ícone novo.** O PDF usa o `@cantoo/pdf-lib`, que já está no projeto, com as fontes padrão.
- **A 2b segue pendente e não depende da F4.**
- **O estado do AdSense não muda nada nesta run.** Não importa se você já criou o `PUBLIC_ADSENSE_CLIENT` ou pediu a revisão.
