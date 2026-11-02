# Revisão adversarial da F7

Esta é a revisão final da run `fase-07`: as 6 calculadoras de casa e as 5 de saúde em inglês, os dois hubs, o gerador de QR code, a home, o rodapé, a busca e o 404 em inglês, a Privacidade e os Termos nos três idiomas e o CI em 13 partes. Ela seguiu o método da F3 (DECISOES § 92 a § 94), como a F5a, a F5b e a F6. O gabarito foi:

- a ficha (`docs/prompts/prompt-fase-07.md`), com as decisões 1 a 13 e os critérios de aceitação;
- o plano (`docs/relatorios/fase-07-plano.md`);
- o `CLAUDE.md`, o DECISOES (§ 257 a § 273) e o `docs/design/`.

## Como rodou

- **Commit fixo:** `69fb7f3`, numa worktree só de leitura em `.claude/worktrees/revisao-f7`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build` (162 páginas). A worktree foi removida no fim.
- **Sete lentes Sonnet em contexto limpo,** num workflow, contra a ficha e o plano. Cada uma teve uma porta (`FO_PORT` de 4174 a 4180) e uma pasta só dela, `.cache/lente-<x>/`, onde ficaram as sondas e os screenshots:
  1. (a) corretude: as 11 calculadoras contra um oráculo próprio, as datas, a troca de unidade, o link do cenário, o CSV e o PDF, o QR e o plugin `qrcodeEsm`;
  2. (b) privacidade e segurança;
  3. (c) anúncio e política;
  4. (d) acessibilidade (WCAG 2.2 AA);
  5. (e) desempenho e SEO;
  6. (f) design system e voz;
  7. (g) saúde e confiança (YMYL), com as fontes lidas.
- **Céticos:** um cético Sonnet próprio para cada achado crítico, alto ou médio, e um por lente para os baixos, com a porta da lente e pasta própria, e a regra "sem reprodução, refutado".
- **Correções:** o agente principal (Opus), no checkout da branch. Crítico e alto sempre, médio quando a correção é local, cada uma com um teste que reprova no `69fb7f3` e passa no código novo, e um §. Os baixos vão para o relatório.
- **Segunda passada:** um revisor Sonnet em contexto limpo leu só o diff das correções, na mesma worktree, movida para o commit das correções e com o próprio build.
- **Tamanho:** 39 agentes no workflow (7 lentes e 32 céticos) e 1 na segunda passada.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | ---: | ---: |
| Crítico | 0 | 0 |
| Alto | 8 | 1 |
| Médio | 18 | 16 |
| Baixo | 23 | 25 |
| Refutado | — | 7 |

Por lente, depois dos céticos:

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude | 0 | 1 | 5 | 0 |
| (b) privacidade e segurança | 0 | 1 | 0 | 0 |
| (c) anúncio e política | 0 | 0 | 0 | 1 |
| (d) acessibilidade | 0 | 5 | 5 | 2 |
| (e) desempenho e SEO | 0 | 1 | 1 | 0 |
| (f) design system e voz | 1 | 6 | 6 | 2 |
| (g) saúde e confiança | 0 | 2 | 8 | 2 |

- **Achados repetidos entre lentes.** O alto e os 16 médios são 15 defeitos: o número cortado da Paint veio de duas lentes (d-2 e f-3), e o ano da data cortado também (d-3 e f-6). Entre os baixos, cinco repetem um médio: a trava de idade (a-2, do g-1), a fórmula sem o sexo (d-6, do g-3), o "0 %" do Body fat (d-10 e g-6, do f-7) e a tabela da Ovulation fora da moldura (d-12, do f-2).
- **Os céticos desceram de severidade** 14 achados: 7 de alto para médio ou baixo (a-1, a-2, d-1, d-2, f-3, g-1 e g-2) e 7 de médio para baixo (a-3, d-5, d-6, d-7, f-8, g-4 e g-5). Subiram um, o e-1, de baixo para médio. **Refutaram** 7: c-1, d-4, d-11, f-14, f-15, g-11 e g-12 (os motivos estão abaixo).
- **As correções:** o alto e 15 dos 16 médios foram corrigidos (§ 275 a § 281). Cada um tem um teste que reprova no build do `69fb7f3` e passa no novo: os 8 testes do `tests/e2e/calc-form.spec.ts` (9 com o da segunda passada) e os 3 do bloco "after the review F7" do `tests/unit/calc-defs.test.ts`. O médio que ficou, o e-1, é o CLS do breadcrumb a 320 a 390 px: a correção mexe no breadcrumb de todas as páginas ou no carregamento das fontes (§ 241), então não é local (§ 274). Cinco baixos saíram junto com os médios: a-2, d-6, d-10, g-6 e d-12.

## O que cada lente conferiu, em resumo

1. **(a) Corretude.**
   - **O oráculo próprio:** reimplementou as 11 calculadoras em Python (`Fraction` e `Decimal` de 60 dígitos), com outra semente e sem reusar nada do `calc_home_health.py`, e comparou 1.316 casos com o motor.
   - **A página:** conferiu 1.192 resultados digitados no Chromium (o número, as linhas da tabela, os sacos, as caixas e os ciclos), sem falha real.
   - **Datas:** as viradas de mês e de ano, 29 de fevereiro (2024 e 2028), as bordas de 2000 e 2099 e as fronteiras dos trimestres do Due date. Também o "hoje" em quatro fusos.
   - **O resto:** a troca de unidade, o link do cenário ida e volta nas 11, o CSV e o PDF baixados e lidos de volta.
   - **O QR:** a matriz do bundle igual à do pacote CommonJS em 30 textos, o `jsqr` no PNG e no SVG, e a margem de correção que a Oli deixa em cada versão.
2. **(b) Privacidade e segurança.**
   - **O QR:** com sentinelas, nos dois navegadores, nenhuma requisição ao endereço digitado e nenhum `href`, `src`, `prefetch` ou `preconnect`. A caixa tem `autocomplete`, `autocapitalize` e `spellcheck` desligados. Os eventos levam só `tool`, `lang` e `format`.
   - **O link do cenário:** só depois do `#`, e a página nunca escreve na URL.
   - **O "hoje":** lido do aparelho, sem UTC.
   - **Os textos:** a Privacidade e os Termos nos três idiomas contra o código. O único achado veio dali, o b-1.
3. **(c) Anúncio e política.**
   - **As distâncias:** os 150 px nas 14 páginas novas, de 320 a 1920 px, nos dois navegadores, também nos estados que o `ads.spec.ts` não percorre.
   - **Os AdSlots:** nada acima da ferramenta no celular, o rótulo "Advertisements" e a área certa (`casa-saude` e `utilidades`).
   - **A saúde:** o conteúdo contra "O que derruba conta" do PLANO e a política de conteúdo médico do AdSense. Nenhum achado confirmado.
4. **(d) Acessibilidade.**
   - **O axe:** em 12 estados novos, nos dois temas, a 360 e 1280 px.
   - **À mão:**
     - o QR (rótulo, descrição, alerta uma vez só);
     - o foco ao acrescentar e remover áreas;
     - a região viva do resultado (uma voz só);
     - o campo de data;
     - o alvo de toque;
     - o reflow a 320 px e o espaçamento de texto do 1.4.12;
     - o contraste dos componentes;
     - as tabelas.
5. **(e) Desempenho e SEO.**
   - **Os portões:** todos sobre o `dist/` revisado.
   - **As 14 páginas:** o `<head>` de cada uma, o schema, as imagens Open Graph, o sitemap só em inglês e os links internos.
   - **O orçamento:** 2 arquivos JS por página, 48,2 KB nas calculadoras e 28,7 KB no QR.
   - **O Lighthouse:** no celular, de 99 a 100 de desempenho nas URLs novas.
   - **A velocidade:** os 16 ms por tecla, com p95 de 0,4 a 0,9 ms.
   - **O conteúdo:** a sobreposição de texto entre as páginas novas, no máximo 24%.
6. **(f) Design system e voz.**
   - **Os screenshots:** das 14 páginas a 320, 360 e 1280 px (e 768 e 1024 no QR), nos dois temas.
   - **O estilo calculado:** nenhum texto em violeta ou lima, e o amarelo só no Baixar.
   - **A voz:** nenhuma exclamação, palavra banida ou emoji.
   - **A Oli:** a pose `cheer` só em casa.
   - **Os componentes:** usados como o README manda.
   - **O resultado:** os achados de layout das tabelas, dos campos e dos menus.
7. **(g) Saúde e confiança.**
   - **As fontes:** leu as fontes citadas e conferiu os números de cada uma: CDC, PubMed 2305711, NIDDK, Office on Women's Health, NICHD, PMC4387083, PMC10282178, MedlinePlus, Energy Star, NIST e EPA.
   - **O texto:** procurou o que a ficha proíbe nas 5 páginas, no hub, na home, na busca, no PDF e no CSV.
   - **O tom e os avisos:** o tom neutro, o mínimo de idade com o porquê, o aviso educativo e o encaminhamento a um profissional.
   - **O portão:** o `gate:dinheiro-saude`, com 52 de 52.

## Os achados

### (a) corretude

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| a-1 | alto | médio | Abrir um link do cenário da Square footage com 2 ou mais áreas leva o foco e a rolagem para a última área | corrigido (§ 278) |
| a-2 | alto | baixo | A trava de idade não impede o resultado de adulto: com idade abaixo do mínimo o resultado antigo fica na tela e o PDF e o CSV seguem ligados | corrigido com o g-1 (§ 276) |
| a-3 | médio | baixo | O CSV de 8 calculadoras novas grava o texto da tela (milhar, unidade, sinal de menos U+2212, datas por extenso) em vez de números | relatório (pendência) |
| a-4 | baixo | baixo | Um valor dentro da faixa, mas com mais casas do que o campo aceita, recebe um erro de faixa falso e, às vezes, a dica errada "Use a dot" | relatório (pendência) |
| a-5 | baixo | baixo | Due date por concepção ou FIV diz "Counted from a first day of the last period on…" com uma data que a pessoa não digitou | relatório (pendência) |
| a-6 | baixo | baixo | O PDF lista o círculo da Square footage sem dizer que a medida é o diâmetro | relatório (pendência) |

### (b) privacidade e segurança

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| b-1 | médio | médio | A Privacidade promete que o Copy link leva "só" números e datas, mas o link também leva escolhas (sexo da fórmula, unidade, método da data de parto incluindo transferência de embrião) | corrigido (§ 281) |

### (c) anúncio e política

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| c-1 | baixo | refutado | Páginas de saúde abrem com um resultado de exemplo sem rótulo de exemplo ("Your BMI 23.6, Healthy Weight" antes de qualquer digitação) | — |

### (d) acessibilidade

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| d-1 | alto | médio | A unidade (ft, in, cm, sq ft, %, days) só existe num span visual: o nome acessível do campo não a diz | corrigido (§ 279) |
| d-2 | alto | médio | O valor do campo Coverage da Paint fica cortado a 360 px ("35(" em vez de "350"), e outros campos de meia largura cortam a 320 px | corrigido (§ 277) |
| d-3 | médio | médio | O campo de data nativo corta o ano a 320 px ("19/10/202") nas páginas Ovulation e Due date | corrigido (§ 277) |
| d-4 | médio | refutado | O campo de data dispara role="alert" e aria-invalid enquanto a pessoa ainda digita uma data válida | — |
| d-5 | médio | baixo | As tabelas de resultado das 11 calculadoras não têm cabeçalho de linha: o primeiro dado de cada linha é <td> | relatório (pendência) |
| d-6 | médio | baixo | Calorie e Body fat dão o resultado de um sexo padrão (Female) que a frase do resultado não diz, e a escolha fica depois do resultado e dos botões de baixar | corrigido com o g-3 (§ 281) |
| d-7 | médio | baixo | O rótulo do campo de data da Due date é só "Date", igual para última menstruação, concepção e transferência de embrião | relatório (pendência) |
| d-8 | médio | médio | O estado marcado do OptionGroup some em modo de alto contraste (forced-colors): US/Metric, On/Off e os tamanhos ficam idênticos | corrigido (§ 280) |
| d-9 | médio | médio | O placeholder da caixa do QR tem contraste de 3,34:1 no tema claro | corrigido (§ 280) |
| d-10 | baixo | baixo | No problema do Body fat o número grande mostra "0 %" como se fosse o resultado | corrigido com o f-7 (§ 281) |
| d-11 | baixo | refutado | A moldura das tabelas de resultado é sempre uma parada de Tab (tabindex=0), mesmo quando não rola | — |
| d-12 | baixo | baixo | A tabela da Ovulation tem 842 px a 320 px (3 telas de rolagem lateral) porque as datas não quebram linha | corrigido com o f-2 (§ 275) |

### (e) desempenho e SEO

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| e-1 | baixo | médio | CLS de 0,20 em janela estreita com escala 1 (320 a 390 px): o breadcrumb quebra quando o Figtree chega; o Lighthouse só mede a 412 px | pendência (correção não local, § 274) |
| e-2 | baixo | baixo | A imagem Open Graph do gerador de QR diz "Your files never leave your device", e a página não tem arquivo nenhum | relatório (pendência) |

### (f) design system e voz

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| f-1 | alto | alto | Tabelas de resultado abertas rotulam a coluna errada a 360 px (cabeçalho fixo à direita sobre outra coluna) | corrigido (§ 275) |
| f-2 | médio | médio | Ovulation e Due date escondem a coluna que é a resposta (janela fértil, data) atrás de rolagem lateral, sem pista | corrigido (§ 275) |
| f-3 | alto | médio | O número do campo 'Coverage' do Paint (350) fica cortado a 360 px e some a 320 px | corrigido (§ 277) |
| f-4 | médio | médio | O <select> corta o texto escolhido: 'Length × width' (Mulch) em todas as larguras; 'Room walls' e 'Last period' a 320 px | corrigido (§ 277) |
| f-5 | médio | médio | O <select> estica até 102 px quando o campo vizinho mostra erro | corrigido (§ 277) |
| f-6 | médio | médio | O campo de data corta o ano a 320 px ('07/09/202') | corrigido (§ 277) |
| f-7 | médio | médio | Body fat com medidas inválidas mostra '0 %' em tamanho de resultado | corrigido (§ 281) |
| f-8 | médio | baixo | Due date: a frase do resultado diz 'last period' em 3 de 4 métodos e põe em negrito a frase inteira | relatório (pendência) |
| f-9 | baixo | baixo | O Baixar PNG do QR quebra o tamanho em outra linha e deixa um '·' no começo da linha | relatório (pendência) |
| f-10 | baixo | baixo | O Baixar do QR aparece desabilitado e cinza quando não há código | relatório (pendência) |
| f-11 | baixo | baixo | Nenhum portão de voz cobre as 14 páginas novas | relatório (pendência) |
| f-12 | baixo | baixo | A imagem Open Graph do QR diz 'Your files never leave your device' | relatório (pendência) |
| f-13 | baixo | baixo | No BTU, 'Heavy shade' e 'Very sunny' quebram em duas linhas no trilho segmentado a 360 e 320 px | relatório (pendência) |
| f-14 | baixo | refutado | No ResultHero, o mês da data vira 'unidade' pequena e apagada ('June' + '14, 2027') | — |
| f-15 | baixo | refutado | O rodapé em inglês passou a ter 1.917 px a 360 px (1.291 em português) e 7 colunas apertadas a 1280 | — |

### (g) saúde e confiança

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| g-1 | alto | médio | O mínimo de idade das páginas de saúde é só uma mensagem: o resultado, o PDF e o CSV continuam, e o PDF imprime a idade do exemplo | corrigido (§ 276) |
| g-2 | alto | baixo | A página do Body fat afirma que 'o militar dos EUA' e 'os serviços' deixaram esse método, mas a fonte citada só diz isso do Exército | relatório (pendência) |
| g-3 | médio | médio | Calorie e Body fat mostram o resultado da fórmula 'Female' (padrão) sem dizer qual fórmula usaram, e o seletor de sexo fica 278 px abaixo da dobra no celular | corrigido (§ 281) |
| g-4 | médio | baixo | No Due date por concepção ou FIV, o resultado diz 'Counted from a first day of the last period on ...' com uma data que a pessoa não digitou | relatório (pendência) |
| g-5 | médio | baixo | O campo de data do Due date se chama 'Date' nos quatro métodos, e nas opções de FIV não diz que é a data da transferência | relatório (pendência) |
| g-6 | baixo | baixo | Body fat com medidas impossíveis mostra '0 %' como número grande do resultado | corrigido com o f-7 (§ 281) |
| g-7 | baixo | baixo | O BANNED_HEALTH deixa passar as frases mais óbvias da lista de proibições da saúde | relatório (pendência) |
| g-8 | baixo | baixo | O PDF do Due date diz 'Today the pregnancy is 10 weeks and 0 days along' sem data, e nenhum PDF de saúde leva o dia em que foi gerado | relatório (pendência) |
| g-9 | baixo | baixo | O aviso do Due date não manda a pessoa a um profissional, ao contrário dos outros quatro | relatório (pendência) |
| g-10 | baixo | baixo | Pequenas imprecisões em relação às fontes lidas (Calorie, Ovulation, Due date) | relatório (pendência) |
| g-11 | baixo | refutado | O título do BTU ('... Size by Energy Star') pode ser lido como produto do programa Energy Star | — |
| g-12 | baixo | refutado | No Ovulation, nenhum aviso de estimativa nem de 'não serve para evitar gravidez' fica perto do resultado | — |

### Os refutados, com o motivo do cético

- **c-1** (Páginas de saúde abrem com um resultado de exemplo sem rótulo de exemplo ("Your BMI 23.6, Healthy Weight" antes de qualquer digitação)): A evidência se reproduz, mas ela mostra o comportamento decidido e igual ao das páginas de dinheiro. Reproduzi com node-html-parser sobre #fo-tool-root no dist/ do 69fb7f3: bmi, due-date, ovulation e body-fat têm 0 `.fo-tag`, e o Calorie tem 1 (o nível de atividade). O que não se sustenta é a regra citada. (1) A regra de origem é a do PLANO (Regra das calculadoras, 'Taxa digitada'): 'O valor inicial é um exemplo rotu…
- **d-4** (O campo de data dispara role="alert" e aria-invalid enquanto a pessoa ainda digita uma data válida): O comportamento é real, mas é o decidido e igual ao padrão aceito do NumberField; a regra citada não exige o que o achado diz. Reproduzi no Chromium com `.cache/cetico-d/repro.mjs`, na página /ovulation-calculator/ do dist/, porta 4177. Digitando 0 3 1 1 2 0 2 6, o valor foi para "" com aria-invalid e depois para 0002-11-03, 0020-11-03 e 0202-11-03, todos inválidos e todos com o alerta. O valor final 2026-11-03 ficou…
- **d-11** (A moldura das tabelas de resultado é sempre uma parada de Tab (tabindex=0), mesmo quando não rola): O comportamento é o decidido e a regra citada não diz o que o achado afirma. (1) O tabindex=0 sempre ligado é o padrão do site desde antes da F7: a moldura é a mesma de FileGuideView.astro:90 e GuideView.astro:94, e o § 129 registra a moldura como "uma região com foco". (2) O axe scrollable-region-focusable exige foco em quem rola e não proíbe foco em quem não rola. Rodei o axe com as tags wcag2a/aa, 21, 22 e best-pr…
- **f-14** (No ResultHero, o mês da data vira 'unidade' pequena e apagada ('June' + '14, 2027')): O comportamento reproduz ('June' em <small> e '14,' '2027' grandes: <p class=fo-rhero__num><small>June</small><span>14,</span><span>2027</span>), mas é o mecanismo decidido. ResultHero.tsx:22-28 e a § 246/§ 253 mantêm os números grandes e as palavras no tamanho da unidade para o valor caber numa linha, e o prompt (linha 460) manda a data por extenso passar pela mesma medida caractere a caractere e conferir a 320 e a …
- **f-15** (O rodapé em inglês passou a ter 1.917 px a 360 px (1.291 em português) e 7 colunas apertadas a 1280): As medidas reproduzem (footer.mjs): altura do <footer> a 360 px = 1917 em /bmi-calculator/, /compress-image/ e / contra 1291 em /pt/ e 1323 em /es/, e a 1280 px são 7 colunas de 155 px em que 'Personal loan', 'Home affordability', 'Square footage' e 'Mulch and gravel calculator' quebram. Mas o crescimento é o decidido. A decisão 9 do prompt diz 'O rodapé em inglês ganha as colunas do que entrou. Nenhuma página fica ó…
- **g-11** (O título do BTU ('... Size by Energy Star') pode ser lido como produto do programa Energy Star): O título publicado é 'BTU Calculator: Room Air Conditioner Size by Energy Star \| FileOrca'. O 'by X' segue o padrão do site para nomear o método ou a fonte da conta: 'Body Fat Calculator by the Navy Tape Measure Method', 'Calorie Calculator: Daily Calories by Mifflin-St Jeor', 'Due Date Calculator by Last Period...'. Nenhuma frase do título, da descrição ('from the Energy Star table'), dos cartões, das premissas nem…
- **g-12** (No Ovulation, nenhum aviso de estimativa nem de 'não serve para evitar gravidez' fica perto do resultado): Medi o Ovulation a 360x740. O aviso de estimativa está junto do número: o lead diz 'Your estimated ovulation days...', o rótulo do hero é 'Estimated ovulation' (y 506) e a frase diz 'about October 27... to November 1...' (y 602), então a metade 'nenhum aviso de estimativa perto do resultado' é falsa. A outra metade é verdadeira: o 'do not use it to prevent pregnancy' só aparece no bloco 'Educational tool' (data-ymyl=…

### Os baixos que ficam para depois

- **a-3** · O CSV de 8 calculadoras novas grava o texto da tela (milhar, unidade, sinal de menos U+2212, datas por extenso) em vez de números. Correção sugerida: Dar às células numéricas dessas tabelas o tipo `{ scaled, decimals }` ou um novo `{ int }`, com a unidade no cabeçalho da coluna ("Amount (sq ft)"), e escrever o ajuste do BTU como número com sinal ASCII. Datas no CSV em AAAA-MM-DD (o oráculo já guarda assim) ou numa coluna extra. Teste: nenhuma célula do CSV com vírgula de milhar nem unidade.
- **a-4** · Um valor dentro da faixa, mas com mais casas do que o campo aceita, recebe um erro de faixa falso e, às vezes, a dica errada "Use a dot". Correção sugerida: Quando o texto é um número bem formado do idioma e só passa nas casas, dizer "Use up to 2 decimals" no lugar da faixa e da dica; e não mostrar a dica de separador se o texto já tem o separador do idioma.
- **a-5** · Due date por concepção ou FIV diz "Counted from a first day of the last period on…" com uma data que a pessoa não digitou. Correção sugerida: Uma frase por método: "Counted as if the last period began on {lmp}" para concepção e FIV, e a frase atual só para a última menstruação.
- **a-6** · O PDF lista o círculo da Square footage sem dizer que a medida é o diâmetro. Correção sugerida: Em `inputRows`, usar o rótulo `${item.key}-${opção}` quando existir (como o `DebtList` já faz com `textKey`) e escrever "Circle: diameter 24.5 ft".
- **d-5** · As tabelas de resultado das 11 calculadoras não têm cabeçalho de linha: o primeiro dado de cada linha é <td>. Correção sugerida: No AmortTable, para tabelas sem grupos, renderizar a primeira célula como <th scope="row"> (uma flag Table.rowHeader=true nas tabelas open do F7, deixando o cronograma de amortização como está). Ajustar a CSS .fo-amort th[scope=row] para o mesmo peso e alinhamento do td.
- **d-7** · O rótulo do campo de data da Due date é só "Date", igual para última menstruação, concepção e transferência de embrião. Correção sugerida: Rótulo por método, como o x-circle da Square footage (textKey = `d-${método}`): "First day of last period", "Conception date", "Embryo transfer date". O Fields.tsx precisa passar o textKey ao DateField, ou o rótulo vira "Date counted from" como solução mínima.
- **e-2** · A imagem Open Graph do gerador de QR diz "Your files never leave your device", e a página não tem arquivo nenhum. Correção sugerida: No ramo do QR de heading(), devolver o texto do selo da página (`texts.seal` do src/tools/qr-code-generator/i18n/en.ts) no lugar do `seal` comum, e regerar o PNG no build.
- **f-8** · Due date: a frase do resultado diz 'last period' em 3 de 4 métodos e põe em negrito a frase inteira. Correção sugerida: Uma frase por método ('Counted from conception on {date}, which is the same as a last period starting {lmp}.'), e {today} fora do say() (texto plano) ou só o número de semanas e de dias em negrito.
- **f-9** · O Baixar PNG do QR quebra o tamanho em outra linha e deixa um '·' no começo da linha. Correção sugerida: Pôr o ponto dentro de um <span> que só aparece quando cabe, ou deixar o tamanho sempre em segunda linha sem o '·' (a 360 px), com white-space: nowrap no .fo-btn__meta.
- **f-10** · O Baixar do QR aparece desabilitado e cinza quando não há código. Correção sugerida: Não renderizar os dois botões de baixar até haver um código (mostrar só a prévia vazia), ou registrar num § que o QR segue a § 139.
- **f-11** · Nenhum portão de voz cobre as 14 páginas novas. Correção sugerida: Acrescentar ao gate:design os ids de LIFE_CALC_IDS, os dois hubs e QR_ID com checkVoice no texto visível e nos data-props, e, para a saúde, exigir 0 exclamações.
- **f-12** · A imagem Open Graph do QR diz 'Your files never leave your device'. Correção sugerida: Usar o selo do texto do QR (texts.seal) no heading() do QR, e um teste que compare o selo do OG com o da página.
- **f-13** · No BTU, 'Heavy shade' e 'Very sunny' quebram em duas linhas no trilho segmentado a 360 e 320 px. Correção sugerida: Rótulos de uma palavra ('Normal', 'Shade', 'Sun') com a explicação na ajuda, ou o grupo em linha inteira com white-space: nowrap.
- **g-2** · A página do Body fat afirma que 'o militar dos EUA' e 'os serviços' deixaram esse método, mas a fonte citada só diz isso do Exército. Correção sugerida: Reescrever os dois trechos só com o que a fonte prova: 'The U.S. Army replaced its tape test with the waist-to-height ratio in July 2026. Each service sets its own method, so this estimate is not an official military body fat figure.' (a segunda frase só se houver fonte oficial lida; senão, 'this page does not offer the result as a military standard'). Tirar 'the U.S. military no longer uses them'
- **g-4** · No Due date por concepção ou FIV, o resultado diz 'Counted from a first day of the last period on ...' com uma data que a pessoa não digitou. Correção sugerida: Uma frase por método: 'Counted from the first day of the last period on {date}.' / 'Counted from a conception date of {date}, which puts week 1 at {lmp}, the way the NICHD counts weeks.' / idem para a transferência. Corrigir 'a first day'. Pôr a mesma explicação no PDF (linha de resultados).
- **g-5** · O campo de data do Due date se chama 'Date' nos quatro métodos, e nas opções de FIV não diz que é a data da transferência. Correção sugerida: Rótulo dependente do método ('First day of last period', 'Conception date', 'Embryo transfer date'), ou texto de ajuda no campo para as opções de FIV ('the day the embryo was transferred, not the retrieval day').
- **g-7** · O BANNED_HEALTH deixa passar as frases mais óbvias da lista de proibições da saúde. Correção sugerida: Acrescentar: /\blose(?:ing)? weight\b/, /\bweight[- ]loss\b/, /\b(?:target\|goal\|recommended\|normal) weight\b/, /\bhealthy weight range\b/, /\b(?:lose\|gain) \d+(?:\.\d+)? ?(?:lbs?\|pounds?\|kg)\b/ (singular), /\b(?:keto\|fasting\|bulking)\b/, /\bfamily planning\b/, /\b(?:avoid\|prevent) pregnancy\b/ fora da frase da negativa (com exceção explícita para a frase atual 'do not use it to prevent pr
- **g-8** · O PDF do Due date diz 'Today the pregnancy is 10 weeks and 0 days along' sem data, e nenhum PDF de saúde leva o dia em que foi gerado. Correção sugerida: Pôr 'As of {date}' (o dia local do aparelho, sem ir à URL nem a evento) na linha 'Today' do PDF do Due date, ou tirar essa linha do PDF e do CSV.
- **g-9** · O aviso do Due date não manda a pessoa a um profissional, ao contrário dos outros quatro. Correção sugerida: Acrescentar 'Talk with your doctor or midwife about your pregnancy and your due date.' ao fim do aviso.
- **g-10** · Pequenas imprecisões em relação às fontes lidas (Calorie, Ovulation, Due date). Correção sugerida: (a) 'at least once a week'; (b) 'day 14 of a 28-day cycle, the day the Office on Women’s Health calculator uses; the NICHD says around day 12 to 14'; (c) tirar a frase ou citar uma fonte oficial.

## A segunda passada

Um revisor Sonnet em contexto limpo leu só o diff das correções (`69fb7f3..083f5a7`), na mesma worktree, movida para o `083f5a7` e com o próprio build. Ele conferiu:

- **Os testes e portões:** o Vitest inteiro (1.422 testes), os tipos, o lint e os portões. O `gate:dinheiro-saude` deu 52 de 52 e o `gate:prontidao`, 21 itens.
- **O `lint:texto`:** 9 arquivos, 0 erros.
- **O Playwright, nos dois navegadores:** 946 testes por navegador, entre eles o `calc-form`, os `money-*`, o `ads`, o `a11y`, os dois de orçamento e os vizinhos do diff.
- **As medidas:** as correções de 300 a 600 px e o resultado acima da dobra a 360 e 390 px.
- **Os estados:** o erro de faixa nas três línguas, com a troca de unidade, uma área removida e a forma "Circle" escondendo um campo. Também o foco de 3, 5 e 10 áreas, o alto contraste, o placeholder e o PDF e o CSV da Ovulation em 3 colunas.

Achou 2 defeitos, os dois baixos, ambos corrigidos (§ 282):

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| s-1 | baixo | Abaixo de 360 px, a regra do menu e da data em linha inteira pegava também a entrada (número com menu de unidade) e os menus das calculadoras de dinheiro: a 320 px o resultado da hipoteca descia 96 px | corrigido (§ 282): a regra vale só nas páginas de casa e saúde (`fo-calc--home`) |
| s-2 | baixo | O teste do erro de faixa não tinha calculadora de dinheiro, embora a regra valha para elas | corrigido (§ 282): a hipoteca em en e es e o empréstimo pessoal em pt |

O teste novo do s-1 reprova no build do `083f5a7` (a entrada da hipoteca, o menu do cartão, da meta de poupança, dos juros simples e da APR) e passa no `d163c61`. Os casos de dinheiro do s-2 reprovam no `69fb7f3`, onde o erro de faixa não marcava o resultado velho. O `calc-form.spec.ts` passa com 9 testes em cada navegador.

O revisor deixou também observações sem defeito provado:

- **A corrida de foco.** Existe na lista de áreas e de dívidas desde a F4. Só a automação a alcança: menos de 16 ms entre digitar e apertar Enter no "Remove". Com o erro de faixa re-renderizando o painel, a janela passou a existir também com valor errado.
- **A tabela da Ovulation.** A 320 px, algumas datas quebram no meio ("November / 1, 2026").
- **"Coverage per gallon".** A etiqueta "example" desce de linha, e o vizinho "Doors" fica mais baixo.
- **"IVF, day 3".** Ficou menos explícito qual data digitar ao lado de "Date". A página explica nos passos e na fórmula, e isso é o d-7 e o g-5 da lista dos baixos.
- **O teste dos menus.** Supõe uma seta de 26 px. No pior caso ("Rectangle" a 360 px), a folga é de 3 px. Passou no Linux do CI nos dois navegadores (`083f5a7`).
