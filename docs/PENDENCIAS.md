# Pendências

Lista única do que ficou aberto no FileOrca: os baixos e os médios não corrigidos das revisões da F3 à F7, as propostas e as decisões que as fases deixaram, e o que é do Victor. Nenhum item daqui bloqueia o site, e nenhum é corrigido numa run de fase: uma run curta de ajuste pega um grupo inteiro de uma vez, ou o Victor decide.

Conferido em 2 de novembro de 2026 sobre a `main` em `29afbce` (a F7), na F8 (DECISOES § 304). A revisão das F4 a F7 e a revisão final da F8 acrescentam os baixos delas nos grupos 16 e 17. O que o código já corrigiu depois da revisão que o achou está na seção "Já corrigidos" e fica fora das tabelas.

## Como ler

- **Id:** a revisão e o id dela (`F4 COR-6` é o COR-6 do `docs/relatorios/REVISAO-F4.md`). Quando vários ids são o mesmo defeito, a linha traz o primeiro e lista os outros na coluna Fonte.
- **Fonte:** o arquivo do relatório e a § do `DECISOES.md` quando há.
- **Severidade:** a do cético, depois da revisão. Entre parênteses, a da lente quando ela mudou.
- **Quem resolve:** o tipo de run curta de ajuste, ou "Victor decide" (escolha dele) ou "Victor faz" (tarefa fora do código).
- **Antes de corrigir:** a regra do `CLAUDE.md` vale. Item de conta (motor) pede o oráculo e as fixtures num commit antes do motor. Texto em pt e es passa pelo glossário e pelo `lint:texto`. Cada correção leva um teste que reprova sem ela e um §.
- **Reconferir:** os relatórios de revisão são de antes das correções que cada fase fez. Antes de gastar tempo num item de texto, procure a frase no código: uma reescrita pode tê-la levado.

## Resumo

| Grupo | Itens | Quem resolve |
| --- | ---: | --- |
| 1. Saúde e fontes (YMYL) | 8 | Run de ajuste de saúde e fontes |
| 2. Motor, contas e formulário | 9 | Run de ajuste de contas (oráculo antes do motor) |
| 3. CSV e PDF das calculadoras | 4 | Run de ajuste de exportação |
| 4. Texto e voz em en, pt e es | 22 | Run de ajuste de texto e voz |
| 5. Acessibilidade | 12 | Run de ajuste de acessibilidade |
| 6. Layout e design system | 15 | Run de ajuste de layout |
| 7. PDF: comportamento | 4 | Run de ajuste de PDF |
| 8. SEO, títulos e imagens sociais | 7 | Run de ajuste de SEO |
| 9. Testes e portões | 7 | Run de ajuste de testes |
| 10. Desempenho | 4 | Run de ajuste de desempenho |
| 11. CI e ferramentas | 2 | Run de ajuste de CI |
| 12. Kit de lançamento | 5 | Run de ajuste do kit |
| 13. Conteúdo: a run 2b | 1 | Run 2b |
| 14. Decisões do Victor | 12 | Victor decide |
| 15. Tarefas do Victor | 12 | Victor faz |

Total: 124 linhas (alguns ids de revisões diferentes são o mesmo defeito e dividem a linha). Ordem sugerida das runs de ajuste, do que mais pesa para o que menos pesa: 1 (afirma além da fonte numa página de saúde), 4 (barato e vem de muitos itens), 5, 2 e 3 (oráculo antes), 6, 7, 8, 9, 10, 12.

## 1. Saúde e fontes (YMYL)

Run de ajuste de saúde e fontes. Todos os textos são em inglês (casa e saúde não têm pt e es), então não há glossário. O `gate:dinheiro-saude` e o `tests/unit/health-voice.test.ts` seguem verdes.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F7 g-2 | REVISAO-F7.md g-2; § 265 | baixo (alto na lente) | O Body fat diz que "o militar dos EUA" e "os serviços" deixaram o método (`src/tools/body-fat-calculator/i18n/en.ts:58` e `:79`), mas a fonte lida só diz isso do Exército. | Reescrever só com o que a fonte prova: "The U.S. Army replaced its tape test with the waist-to-height ratio in July 2026." Tirar "the U.S. military no longer uses them" e "Today the services use other methods". A frase de que cada serviço tem o método dele só entra com fonte oficial lida. Fazer primeiro: é afirmação além da fonte em página YMYL. | Run de ajuste de saúde e fontes |
| F7 a-5 | REVISAO-F7.md a-5, g-4 e f-8; § 264 | baixo (médio nas lentes) | Na Due date por concepção ou FIV a frase diz "Counted from a first day of the last period on {lmp}" com uma data que a pessoa não digitou, diz "last period" em 3 de 4 métodos, escreve "a first day" e põe a frase inteira em negrito (`src/tools/due-date-calculator/i18n/en.ts:18`). | Uma frase por método: "Counted from the first day of the last period on {date}." / "Counted from a conception date of {date}, which puts week 1 at {lmp}, the way the NICHD counts weeks." / idem para a transferência. Só o número de semanas e de dias em negrito, e `{today}` fora do `say()`. A mesma explicação na linha de resultados do PDF. | Run de ajuste de saúde e fontes |
| F7 d-7 | REVISAO-F7.md d-7 e g-5 | baixo (médio nas lentes) | O campo de data da Due date se chama "Date" nos quatro métodos (`en.ts:11`), e na transferência de embrião não diz que é a data da transferência. | Rótulo por método ("First day of last period", "Conception date", "Embryo transfer date"), como o `x-circle` da Square footage faz com `textKey`. O `Fields.tsx` passa o `textKey` ao `DateField`. Mínimo: ajuda no campo para a FIV ("the day the embryo was transferred, not the retrieval day"). | Run de ajuste de saúde e fontes |
| F7 g-9 | REVISAO-F7.md g-9 | baixo | O aviso da Due date não manda a pessoa a um profissional de saúde, ao contrário dos outros quatro. | Acrescentar ao fim do aviso: "Talk with your doctor or midwife about your pregnancy and your due date." | Run de ajuste de saúde e fontes |
| F7 g-10 | REVISAO-F7.md g-10 | baixo | Três imprecisões contra as fontes lidas: Calorie ("at least once a week"), Ovulation (dia 14 de um ciclo de 28 é o da OWH; o NICHD diz do dia 12 ao 14) e uma frase da Due date sem fonte oficial. | (a) "at least once a week"; (b) "day 14 of a 28-day cycle, the day the Office on Women's Health calculator uses; the NICHD says around day 12 to 14"; (c) tirar a frase ou citar uma fonte oficial lida. | Run de ajuste de saúde e fontes |
| F7 g-7 | REVISAO-F7.md g-7; § 267 | baixo | `BANNED_HEALTH` (`scripts/lib/ymyl.ts:47`) deixa passar as frases mais óbvias da lista de proibições da saúde. | Somar padrões para "lose weight" e "weight loss", "target", "goal", "recommended" e "normal" antes de "weight", "healthy weight range", "lose" ou "gain" seguido de número e de lb, pound ou kg (também no singular), "keto", "fasting", "bulking", "family planning" e "avoid" ou "prevent" antes de "pregnancy" (esta última fora da frase da negativa, com exceção explícita para "do not use it to prevent pregnancy"). Controle positivo e negativo no `ymyl.test.ts`. | Run de ajuste de saúde e fontes |
| F7 g-8 | REVISAO-F7.md g-8 | baixo | O PDF da Due date diz "Today the pregnancy is 10 weeks and 0 days along" sem data, e nenhum PDF de saúde leva o dia em que foi gerado. | "As of {date}" na linha "Today" do PDF, com o dia local do aparelho (nunca na URL nem em evento), ou tirar a linha do PDF e do CSV. | Run de ajuste de saúde e fontes |
| F7 fontes | `fase-07.md`; § 265 e § 266 | baixo | Fontes que não abriram (403): o texto inteiro do ACOG CO 700 (`due-date-calculator/i18n/en.ts:63` cita o resumo do PubMed), os relatórios do DTIC (as equações do Body fat vêm de Foulis 2023, Schuna 2013 e do post do Exército de 2019) e a DoDI 1308.03 (a página não cita o que ela diz). | O Victor abre cada uma no navegador dele (só leitura) e cola o trecho que confirma os números; a run de ajuste confere o texto contra ele e troca a fonte do resumo pela do documento inteiro. Sem isso, os números seguem apoiados no NIH, no NICHD e no PMC. | Victor faz, depois run de ajuste de saúde e fontes |

## 2. Motor, contas e formulário

Run de ajuste de contas. A ordem é a do `CLAUDE.md` (F4): o caso entra no oráculo (`scripts/oracle/calc.py` ou `calc_br.py`), as fixtures são regeradas e commitadas, e só então o motor e o texto mudam. Os `--check` dos oráculos têm de dar zero no fim.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F4 COR-7 | REVISAO-F4.md COR-7 | baixo | Com entrada igual ao preço (empréstimo zero), os presets de hipoteca mostram frases sem sentido, e o oráculo não tem esse caso. | Caso no oráculo; o motor trata empréstimo zero (resultado ou fala própria, sem "payoff in 0 years"). | Run de ajuste de contas |
| F4 COR-10 | REVISAO-F4.md COR-10 | baixo | Na Home affordability o "máximo" da frase sai arredondado para cima em dólares (o resumo e o PDF levam centavos), e o teto negativo usa hífen. | Arredondar para baixo na frase (nunca prometer mais que a conta) ou escrever com centavos; sinal de menos próprio. | Run de ajuste de contas |
| F4 COR-11 | REVISAO-F4.md COR-11 | baixo | O "mínimo" das falas too-low é a condição necessária, não a suficiente: quem digita o mínimo cai noutro erro ou em prazos de 40 anos. | Dizer "pelo menos X só para cobrir os juros", ou calcular no motor o mínimo que de fato fecha a conta (oráculo antes). | Run de ajuste de contas |
| F4 COR-12 | REVISAO-F4.md COR-12 | baixo | O oráculo não cobre o limite de 1.200 meses (`too-long`) em três calculadoras nem o extra único no último mês. | Casos novos no `scripts/oracle/calc.py` (hoje os `too-long` estão nas linhas 385, 449, 590, 620 e 1069), fixtures e testes. | Run de ajuste de contas |
| F4 COR-14 | REVISAO-F4.md COR-14 | baixo | Credit card por prazo com saldo menor que o prazo em centavos mostra "pay $0.00 a month". | Caso no oráculo; parcela mínima de 1 centavo ou erro "saldo pequeno demais para esse prazo". | Run de ajuste de contas |
| F4 COR-17 | REVISAO-F4.md COR-17 | baixo | O Refinance sem economia nem custo diz "breaks even in month 1", e o atalho mostra "Month 0". | Fala própria para "sem economia e sem custo"; o atalho não mostra mês 0. | Run de ajuste de contas |
| F6 a-6 | REVISAO-F6.md a-6; § 226 | baixo | O cartão (`br-credit-card`) aplica o mesmo IOF em reais nos dois caminhos, embora os valores financiados difiram. | A saída mais simples: dizer na premissa que o IOF digitado vale para os dois caminhos. Alternativas: pedir o IOF de cada caminho, ou escalar o de A pela razão dos valores. | Run de ajuste de contas |
| F7 a-4 | REVISAO-F7.md a-4 | baixo | Um valor dentro da faixa, mas com mais casas do que o campo aceita, recebe um erro de faixa falso e, às vezes, a dica errada "Use a dot". | Quando o texto é um número bem formado do idioma e só passa nas casas: "Use up to 2 decimals", sem a faixa nem a dica. Sem a dica de separador se o texto já tem o separador do idioma. | Run de ajuste de contas |
| F4 DES-3 | REVISAO-F4.md DES-3 | baixo (médio na lente) | O campo recusa o próprio formato ao editar no lugar ("1,2" no meio de "375,000"), e a fala do erro diz a faixa de um valor que está na faixa. | Aceitar o formato intermediário enquanto se digita e formatar só ao sair do campo; a fala do erro só aparece quando o valor sai da faixa. | Run de ajuste de contas |

## 3. CSV e PDF das calculadoras

Run de ajuste de exportação. O PDF e o CSV são feitos no aparelho (`src/tools/calc/exports.ts`, `src/engine/pdf/report.ts`); em inglês os bytes de antes não podem mudar sem registro.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F7 a-3 | REVISAO-F7.md a-3 | baixo (médio na lente) | O CSV de 8 calculadoras novas grava o texto da tela (milhar, unidade, sinal de menos U+2212, datas por extenso) em vez de números. | Células numéricas com o tipo `{ scaled, decimals }` ou um novo `{ int }`, a unidade no cabeçalho da coluna ("Amount (sq ft)"), o ajuste do BTU como número ASCII com sinal, datas AAAA-MM-DD. Teste: nenhuma célula do CSV com vírgula de milhar nem unidade. | Run de ajuste de exportação |
| F7 a-6 | REVISAO-F7.md a-6 | baixo | O PDF lista o círculo da Square footage sem dizer que a medida é o diâmetro. | Em `inputRows`, o rótulo `${item.key}-${opção}` quando existir, como o `DebtList` faz com `textKey`: "Circle: diameter 24.5 ft". | Run de ajuste de exportação |
| F6 g-2 | REVISAO-F6.md g-2; § 252 | baixo (médio na lente) | O PDF e o "Exemplo resolvido" mostram taxa mensal sem o período ("Rotativo 14%", "R$ 4.000,00, 12%, R$ 600,00"). | Em `valueText`, para `rate` com sufixo que não seja só `%`, escrever o período ("14% a.m." / "14% ao mês"); na linha de lista (dívidas), rotular cada valor. Teste sobre `inputRows`. | Run de ajuste de exportação |
| F4 COR-16 | REVISAO-F4.md COR-16 | baixo | Linhas do PDF sem rótulo e dois números de "você" na Savings goal. | Rótulo em toda linha do PDF; um só "você". | Run de ajuste de exportação |

## 4. Texto e voz em en, pt e es

Run de ajuste de texto e voz. Texto novo em pt e es passa pelo glossário (`docs/i18n/`, `glossary.test.ts`) e pelo `lint:texto`, com as regras da F6. Itens de guia (F5b) só têm texto em inglês.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F3 f-04 | REVISAO-F3.md f-04; REVISAO-F6.md d-5 e g-7 | baixo | O plural do status de lote com uma falha está errado nos três idiomas e nos dois painéis: "1 files couldn't be read", "1 arquivos não puderam ser lidos", "No se pudieron leer 1 archivos" (`src/tools/image/ImagePanel.tsx:399`, `src/tools/pdf/PdfPanel.tsx:430`; chave `errors.some` em `src/tools/image/i18n/*.ts:47-48` e `src/tools/pdf/i18n/*.ts:87-88`). O leitor de tela ouve a frase errada. | Chave `someOne` por idioma ("1 arquivo não pôde ser lido; o resto está pronto.", "No se pudo leer 1 archivo; el resto está listo.") e escolha por `failed === 1`, como `readyOne`. Teste no `image-batch.spec.ts` (já tem um lote com falhas) e no do PDF. | Run de ajuste de texto e voz |
| F4 COR-6 | REVISAO-F4.md COR-6 | baixo | Singular com n = 1 em texto fixo: "1 years", "1 days", "1 months", "1 payments" (por exemplo `src/tools/mortgage-calculator/i18n/en.ts:52`, `due-date-calculator/i18n/en.ts:27`, `rent-vs-buy-calculator/i18n/en.ts:30-43`). | Variantes singulares como o `duration` de `src/tools/calc/i18n/en.ts:36`, e um teste que renderiza cada frase com n = 1. | Run de ajuste de texto e voz |
| F6 a-5 | REVISAO-F6.md a-5; § 249 | baixo | Em pt: "1 anos" e "nos 1 ano" (o "nenhum tempo antes" já saiu na § 249). | Escrever o ano com `duration()`, trocar "nos {months}" por "em {months}", e uma frase própria da amortização antecipada para o prazo que não muda ("o prazo continua o mesmo"). | Run de ajuste de texto e voz |
| F6 f-8 | REVISAO-F6.md f-8 e g-4 | baixo | Tamanho de arquivo e moeda com espaço comum nos textos fixos de pt e es ("2,4 MB", "R$ 10.000", "100 KB" em `resize-image/i18n/pt.ts:50`). O glossário pede espaço sem quebra. | U+00A0 entre número e unidade e depois de "R$", e no `glossary.test.ts` controles que reprovem `/\d [KM]B/` e `/R\$ \d/` nos textos de pt (e `/\d [KM]B/` nos de es). | Run de ajuste de texto e voz |
| F6 g-5 | REVISAO-F6.md g-5 | baixo | O hub brasileiro diz que o CET é um campo, mas o CET é resultado (`src/i18n/pt/money-calculators.ts:10` e `:25`). | "IOF, TR e as taxas de juros são campos; o CET é calculado." | Run de ajuste de texto e voz |
| F6 g-6 | REVISAO-F6.md g-6 | baixo | Siglas sem a forma por extenso na primeira menção: CET em 4 páginas pt, APR em 3 páginas es. | "Custo Efetivo Total" e "tasa porcentual anual" no lead ou no `title` do primeiro uso, e um teste por página: o extenso vem antes da primeira sigla. | Run de ajuste de texto e voz |
| F6 g-8 | REVISAO-F6.md g-8 | baixo | Decalque do inglês: o nome da ferramenta com artigo e sem a palavra "ferramenta" ("a Comprimir imagem recebe e entrega" em `compress-image/i18n/pt.ts:20` e `:37`, "da Redimensionar imagem", "a PDF para JPG"). | "a ferramenta Juntar PDF", ou reformular ("O que entra e o que sai no Juntar PDF"); teste que reprove artigo + nome de ferramenta nos `pt.ts`. | Run de ajuste de texto e voz |
| F6 g-9 | REVISAO-F6.md g-9 | baixo | O erro de formato errado leva ao nome da ferramenta sem artigo nem substantivo ("Abra-o em HEIC para JPG", "Ábrelo en HEIC a JPG"). | "Abra-o na ferramenta {tool}." / "Ábrelo con la herramienta {tool}." | Run de ajuste de texto e voz |
| F6 g-10 | REVISAO-F6.md g-10 | baixo | A plaquinha da Oli no Alugar ou comprar diz "quando comprar vira" (`src/tools/br-rent-or-buy/i18n/pt.ts:35`), frase sem complemento. | "quando comprar compensa" ou "quando comprar passa à frente". | Run de ajuste de texto e voz |
| F6 g-11 | REVISAO-F6.md g-11 | baixo | Resquícios do inglês e escolhas pouco naturais no espanhol do dinheiro (`mortgage-calculator/i18n/es.ts:80`, `personal-loan-calculator/i18n/es.ts:36` e `:66`). | "Reglamento Z (Regulation Z)" na primeira vez e "Reglamento Z" depois; "la CFPB"; "termina al mismo tiempo" ou "en el mismo plazo"; "La avalancha {interestPart} y {timePart}."; alinhar "Ver la tabla de amortización". | Run de ajuste de texto e voz |
| F6 a-4 | REVISAO-F6.md a-4; § 241 | baixo | A frase do SAC × PRICE diz que a PRICE "fica quase igual" mesmo com TR, e logo depois diz que as parcelas sobem. | Com `tr > 0`, "começa em X e termina em Y"; "quase igual" só com TR zero. Atenção: a frase foi mexida na § 241 por causa do CLS (0,0502 no `/pt/simulador-sac-price/`): medir o Lighthouse de novo. | Run de ajuste de texto e voz |
| F4 COR-13 | REVISAO-F4.md COR-13 | baixo | Rent vs buy: "Buying catches up in Year N" pode valer só por um tempo; a tabela por ano mostra. | "Buying first catches up in Year N", ou a frase do ano em que passa a valer para sempre. | Run de ajuste de texto e voz |
| F4 COR-15 | REVISAO-F4.md COR-15 | baixo | Afirmações de texto gerais demais: PMI igual nos dois prazos, premissa do guia de extras, "juros uma vez por mês" em todas. | Reescrever com "neste exemplo" ou condicionar ao caso. | Run de ajuste de texto e voz |
| F5a C-1 | REVISAO-F5a.md C-1 | baixo (médio na lente) | A Compress PDF chama o Forte de "smallest file" e diz que ele "goes furthest" (`src/tools/compress-pdf/i18n/en.ts:92`), mas num PDF de texto o Forte não ganha nada. | "Tries harder" / "may be smaller", como a pergunta do FAQ já diz; conferir os três idiomas. | Run de ajuste de texto e voz |
| F5a F-12 | REVISAO-F5a.md F-12 | baixo | No celular, a ajuda do DropZone de cinco ferramentas de PDF começa em minúscula ("one PDF at a time", `delete-pdf-pages/i18n/en.ts:74`). | Frase inteira com inicial maiúscula ou ajuda reformulada, nos três idiomas. | Run de ajuste de texto e voz |
| F5b A-9 | REVISAO-F5b.md A-9 | baixo | Guia 3: células da tabela e frases mais soltas que a fonte. | Reler a fonte de cada célula e apertar a frase. | Run de ajuste de texto e voz |
| F5b A-11 | REVISAO-F5b.md A-11, A-12 e F-9 (os restos) | baixo | Frases soltas que sobraram: "100% of their combined size" ao lado de "a little smaller" (guia 9); "ten of the 10 photos" (guia 1); "Recommended one" (guia 2); "0.5 times in WebKit" (guia 7); o ponto depois do rótulo que termina em "?" nas fontes da Adobe; Instagram e X lidos só pela cópia do buscador. | Reescrever cada uma. Reconferir antes: uma reescrita pode já ter levado a frase. Para as fontes do Instagram e do X, ver a tarefa do Victor (grupo 15). | Run de ajuste de texto e voz |
| F5b F-6 | REVISAO-F5b.md F-6 | baixo (médio na lente) | Guia 6: o rótulo da opção entra cru na frase ("set to By percentage, 100"; ver `guide-remove-location-from-photos.ts:14` e o guia 6). | Frase que não repete o rótulo da interface, ou o rótulo entre aspas. | Run de ajuste de texto e voz |
| F5b F-10 | REVISAO-F5b.md F-10 e A-14 | baixo | Contagens por extenso que o `guides-numbers.test.ts` não lê ("Two things stay on purpose" em `guide-remove-location-from-photos.ts:54`, "multiplies the pixels by four" em `guide-pdf-to-jpg-resolution.ts:19`, "twice as many pixels"). | Estender o teste a numerais por extenso e trocar cada um por `{nome_word}` do JSON medido, ou tirar a contagem. | Run de ajuste de texto e voz |
| F5b A-13 | REVISAO-F5b.md A-13, C-4 e F-15 | baixo | Os guias 9 e 10 mandam usar o Preview do iPhone sem dizer a versão do iOS (`guide-combine-pdfs-on-phone.ts:17-19`, `guide-photos-to-one-pdf.ts:19`). | Dizer a versão em que o recurso aparece, com a fonte da Apple, ou "on a recent iPhone". | Run de ajuste de texto e voz |
| F5b C-5 | REVISAO-F5b.md C-5 | baixo | "The original, byte for byte" no texto da Compress PDF sem a exceção do arquivo com índice refeito (§ 182). | Acrescentar a exceção ou dizer "sem mexer no conteúdo". | Run de ajuste de texto e voz |
| F5b 2ª #6 e #8 | REVISAO-F5b.md, segunda passada, itens 6, 8, 10 e 12 | baixo | Guia 3: "WebKit wrote slightly larger files" não diz o navegador dos números; o `stated` do YouTube costura duas frases da página; frases longas nos guias 2, 4 e 8; o "Reviewed" diz 2 de novembro (UTC, a noite de 1.º em Brasília). | Dizer o navegador; separar as duas frases do `stated`; partir as frases longas; a data do UTC fica como está (§ 207) e o item 12 só informa. | Run de ajuste de texto e voz |

## 5. Acessibilidade

Run de ajuste de acessibilidade (WCAG 2.2 AA). Cada correção leva axe ou teste de teclado nos dois navegadores; o `a11y.spec.ts` roda com movimento reduzido (§ 57).

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F4 ACE-9 | REVISAO-F4.md ACE-9; REVISAO-F7.md d-5; REVISAO-F5b.md D-2 | baixo (médio nas lentes de F7 e F5b) | As tabelas de resultado não têm cabeçalho de linha: o primeiro dado de cada linha é `<td>` (`src/tools/calc/AmortTable.tsx:53` só tem `th scope="col"`), na região e na tabela com o mesmo nome, nas 11 calculadoras de casa e saúde e em 3 tabelas medidas dos guias. | Primeira célula como `<th scope="row">` nas tabelas abertas (flag `rowHeader` nas `open` da F7; o cronograma de amortização fica como está), CSS `th[scope=row]` com o peso e o alinhamento do `td`, nome diferente para a região. | Run de ajuste de acessibilidade |
| F4 ACE-11 | REVISAO-F4.md ACE-11 | baixo | Credit card payoff: o pagamento que não cobre os juros não marca o campo com `aria-invalid` (a Oli já não comemora, DES-2). | O erro de "problema" marca o campo do pagamento (`aria-invalid` e ligação ao erro), como o erro de faixa. | Run de ajuste de acessibilidade |
| F4 ACE-8 | REVISAO-F4.md ACE-8 | baixo | Os botões "CSV" (`src/tools/calc/ExportBar.tsx:87-92`) e o de mostrar o cronograma têm nome fraco, e o rótulo muda junto com `aria-expanded`. | `aria-label` "Download CSV"; rótulo fixo no botão do cronograma, só `aria-expanded` muda. | Run de ajuste de acessibilidade |
| F7 obs 1 | REVISAO-F7.md, segunda passada | baixo | Existe desde a F4 uma corrida de foco na lista de áreas e de dívidas: com menos de 16 ms entre digitar e apertar Enter no "Remove", o foco vai ao lugar errado. Só a automação chega lá, mas o erro de faixa que re-renderiza o painel abriu a janela também com valor errado. | Fixar o foco pelo id da linha depois do re-render, não pelo índice, e um teste com `page.keyboard` sem espera. | Run de ajuste de acessibilidade |
| F3 f-06 | REVISAO-F3.md f-06 | baixo | Depois de "Change my cookie choice" a reserva do aviso não se recalcula quando a largura muda: o `return` da linha 44 do `src/components/CookieNotice.astro` vem antes do `addEventListener('resize',reserve)` e do `ResizeObserver` da linha 45. A 1280 para 320 px em `/es/privacidad/` o último texto do rodapé passa 4 px por baixo do aviso. | Mover o `resize` e o `ResizeObserver` para antes do `return`, ou registrá-los dentro de `show()`. Teste no `cookie-footer.spec.ts`: reabrir pelo botão e trocar a largura. | Run de ajuste de acessibilidade |
| F5a D-6 | REVISAO-F5a.md D-6 | baixo (médio na lente) | Na caixa da assinatura o `+` precisa de Shift (teclado dos EUA) e o passo vira 10 vezes: o `+` cresce 10 pontos e o `−` diminui 1 (`src/tools/pdf/SignatureArea.tsx:239-250`). | Ignorar o Shift nas teclas `+`, `=`, `-` e `_`, passo fixo; Shift só nas setas. | Run de ajuste de acessibilidade |
| F5a D-7 | REVISAO-F5a.md D-7 | baixo (médio na lente) | Página escolhida e não escolhida na grade diferem só pela cor e 1 px da borda (WCAG 1.4.1 e 1.4.11). | Marca que não depende da cor: ícone de check no canto da célula escolhida, borda de 3 px sem passar da dobra (F-8). | Run de ajuste de acessibilidade |
| F5a D-8 | REVISAO-F5a.md D-8 | baixo (médio na lente) | As linhas do Merge mostram uns 12 caracteres do nome a 360 px (o F-2 já deu mais largura). | Nome em duas linhas com `overflow-wrap: anywhere`, ou o nome completo no `title` e em `aria-label`. | Run de ajuste de acessibilidade |
| F5a D-9 | REVISAO-F5a.md D-9 | baixo | O anel de foco da caixa da assinatura é cortado na borda da página, e os movimentos pelo teclado não são anunciados. | Anel por dentro da borda (outline-offset negativo) e região `role="status"` com a nova posição, uma vez por pausa. | Run de ajuste de acessibilidade |
| F5a D-10 | REVISAO-F5a.md D-10 | baixo | Frases de status que dizem a coisa errada ou pouco: "Reverse order" é o anúncio; a Rotate diz só "Done". | Anúncio com a ação e o resultado ("Pages reversed", "Rotated 3 pages"), nos três idiomas. | Run de ajuste de acessibilidade |
| F5a D-11 | REVISAO-F5a.md D-11 | baixo | Uma página ou linha pegada continua pegada quando o foco sai; a Unlock põe o foco em "Start over" e não no campo de senha. | Soltar a pegada no `blur`; na Unlock com senha errada, foco no campo (§ 177, § 240). | Run de ajuste de acessibilidade |
| F5a D-12 | REVISAO-F5a.md D-12 | baixo | O `fo-btn--sm` (40 px) é usado no celular pelas peças novas (`PageGrid.tsx:203` e `:206`, `SignatureArea.tsx:318`, `tools.tsx:601`), contra o token `tap-min`. | `fo-btn` normal abaixo de 768 px nessas peças. | Run de ajuste de acessibilidade |

## 6. Layout e design system

Run de ajuste de layout. Só tokens (nenhuma cor fora deles); o `gate:design` e o `design-checks.test.ts` seguem verdes; screenshots novos nos dois temas.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F5a F-5 | REVISAO-F5a.md F-5 e E-6 | baixo (médio na lente) | A prévia da posição na Sign é a miniatura de 240 px esticada. | Desenhar a prévia no tamanho da caixa (uma página só, na resolução da tela). | Run de ajuste de layout |
| F5a F-6 | REVISAO-F5a.md F-6 | baixo (médio na lente) | O FileCard de PDF mostra um quadrado vazio no lugar da miniatura. | Miniatura da primeira página, ou o ícone `pdf` do design system. | Run de ajuste de layout |
| F5a F-7 | REVISAO-F5a.md F-7 | baixo | O FileCard dentro do painel corta a dobra com a cor da página, e um entalhe escuro aparece no tema escuro. | Dobra com o token de superfície do painel. | Run de ajuste de layout |
| F5a F-8 | REVISAO-F5a.md F-8 | baixo | A borda de 3 px da célula escolhida passa da dobra e deixa um quadradinho em volta dela. | Borda por dentro (`box-shadow: inset` com token) ou dobra recortada. | Run de ajuste de layout |
| F5a F-10 | REVISAO-F5a.md F-10 | baixo | Os dois avisos das peças novas não usam a nota do design system (fundo `brand-soft` com o ícone de info). | Trocar pelo componente de nota. | Run de ajuste de layout |
| F5a F-11 | REVISAO-F5a.md F-11 | baixo | "Skip the first page" é uma caixa de seleção nativa sem estilo (`src/tools/pdf/tools.tsx:393`). | O componente de opção do design system (OptionGroup ou check). | Run de ajuste de layout |
| F5a F-13 | REVISAO-F5a.md F-13 | baixo | A Unlock mostra o mesmo arquivo duas vezes depois de uma senha errada. | Uma linha só, com o erro dentro dela. | Run de ajuste de layout |
| F5a F-14 | REVISAO-F5a.md F-14 | baixo | Acabamento a 360 px: "Pick none" quebra desalinhado, o trilho da Split vira uma pílula de duas linhas, e há linhas de ajuda repetidas. | Ajustar a grade dos três; tirar a ajuda repetida. | Run de ajuste de layout |
| F5b F-2 | REVISAO-F5b.md F-2 e D-5 | baixo (médio na lente) | As tabelas "What we measured" dos guias são cortadas no computador e rolam duas a três telas a 360 px sem nenhuma pista visual. | Sombra de borda ou seta de rolagem na moldura (`.fo-table-wrap`), sem coluna fixa. | Run de ajuste de layout |
| F5b F-12 | REVISAO-F5b.md F-12 | baixo | O cartão de guia é igual ao de ferramenta na seção de relacionadas. | Etiqueta "Guide" ou ícone próprio no cartão do guia. | Run de ajuste de layout |
| F5b F-13 | REVISAO-F5b.md F-13 | baixo | Ruído nas tabelas e na linha "Reviewed" dos guias. | Reler a tabela renderizada e tirar o repetido. | Run de ajuste de layout |
| F7 f-9 | REVISAO-F7.md f-9 | baixo | O Baixar PNG do QR quebra o tamanho em outra linha e deixa um "·" no começo da linha (`.fo-qr__actions .fo-btn`, `src/styles/components.css`). | O ponto dentro de um `<span>` que só aparece quando cabe, ou o tamanho sempre na segunda linha sem o "·", com `white-space: nowrap` no `.fo-btn__meta`. | Run de ajuste de layout |
| F7 f-13 | REVISAO-F7.md f-13 | baixo | No BTU, "Heavy shade" e "Very sunny" quebram em duas linhas no trilho segmentado a 360 e 320 px. | Rótulos de uma palavra ("Normal", "Shade", "Sun") com a explicação na ajuda, ou o grupo em linha inteira com `white-space: nowrap`. | Run de ajuste de layout |
| F7 obs 2 | REVISAO-F7.md, segunda passada | baixo | A tabela da Ovulation quebra datas no meio a 320 px ("November / 1, 2026"). | `white-space: nowrap` na célula da data sem voltar à coluna fixa (§ 275). | Run de ajuste de layout |
| F7 obs 3 | REVISAO-F7.md, segunda passada | baixo | A etiqueta "example" desce de linha em "Coverage per gallon" (e o vizinho "Doors" fica mais baixo); o teste dos menus (`calc-form.spec.ts`, § 277) supõe uma seta de 26 px, com folga de 3 px no pior caso ("Rectangle" a 360 px). | Rótulo mais curto na Mulch; no teste, medir a seta do navegador em vez de supor 26 px. | Run de ajuste de layout |

## 7. PDF: comportamento

Run de ajuste de PDF. O motor é `src/engine/pdf/`; a matriz de PDF (`pdf-matrix.spec.ts`, § 175) e o `pnpm guias:medir --check` rodam depois (um motor que muda bytes muda os guias medidos).

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F5a A-7 | REVISAO-F5a.md A-7 | baixo | A marca "Large" na diagonal de uma página em pé passa das bordas e corta a primeira e a última letra (`WATERMARK_SIZE.large = 0.8` em `src/engine/pdf/operations.ts:117`). | Limitar a largura do texto ao que cabe na diagonal da página, não a uma fração fixa. | Run de ajuste de PDF |
| F5a A-9 | REVISAO-F5a.md A-9 | baixo | A página tira aspas curvas, travessões e o euro do texto da marca antes de o `winAnsi()` do motor poder trocá-los (`src/tools/pdf/tools.tsx:650`). | Deixar a troca só para o `winAnsi()` e avisar o que não cabe no WinAnsi. | Run de ajuste de PDF |
| F5a A-10 | REVISAO-F5a.md A-10 | baixo | Numerar um PDF de 1 página com "Skip the first page" não escreve nada e diz que numerou (`numberPages`, `operations.ts:89-117`). | Desligar a opção com 1 página, ou dizer "nothing to number". | Run de ajuste de PDF |
| F5a A-11 | REVISAO-F5a.md A-11 | baixo | Uma assinatura em JPG leva o fundo branco e pinta uma caixa opaca sobre a página. | Tornar o branco transparente (limiar) ou avisar na ajuda que o PNG com fundo transparente é melhor. | Run de ajuste de PDF |

## 8. SEO, títulos e imagens sociais

Run de ajuste de SEO. `pnpm gate:seo`, `gate:conteudo` e `gate:prontidao` seguem verdes; o IndexNow só roda no pós-deploy.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F3 e-04 | REVISAO-F3.md e-04; § 45 | baixo | O favicon é só `data:image/svg+xml` (`src/layouts/BaseLayout.astro:69`) e `/favicon.ico` dá 404; o Google lista BMP, GIF, ICO, PNG, JPEG, PPM e TIFF e precisa rastrear o arquivo. Hoje só o `apple-touch-icon` de 180 px (`BaseLayout.astro:71`) é arquivo; como o Google escolhe entre os dois não está documentado. | Saída A: `public/favicon.ico` (48 × 48, do mesmo `APP_ICON_SVG` de `src/seo/images.ts`) sem `<link>`: custa 0 requisição, mas só vale se o Google ainda usar o caminho antigo. Saída B: `<link rel="icon" href="/favicon.ico">`, que custa 1 requisição (o WebKit já usa 7 de 8 nas páginas de ferramenta; a F8 mexe nos ícones do manifest e no orçamento). O § 45 escolheu a data URI justamente para não gastar a requisição. | Victor decide, depois run de ajuste de SEO |
| F5b E-1 | REVISAO-F5b.md E-1 | baixo | Seis títulos de guia passam de 70 caracteres e uma descrição passa de 160. | Encurtar; o `gate:seo` ganha o limite para guias. | Run de ajuste de SEO |
| F5b E-4 | REVISAO-F5b.md E-4 | baixo | Uma nova medida ou uma nova data de revisão não chega ao IndexNow nem ao `lastmod` (o sitemap não tem `lastmod`). | `lastmod` do sitemap a partir de `GUIDE_REVIEWED` e `measuredOn`; IndexNow com a URL do guia que mudou. | Run de ajuste de SEO |
| F5b E-5 | REVISAO-F5b.md E-5 e F-11 | baixo | Os nomes de cartão dos guias 6 e 8 estão cortados e diferem do H1, e o do 8 aparece assim no Open Graph. | Nome de cartão igual ao H1 ou uma forma curta completa; regerar o OG no build. | Run de ajuste de SEO |
| F5b E-6 | REVISAO-F5b.md E-6; § 190 | baixo | A busca por "jpg to pdf" traz o guia da direção contrária e não traz o guia das fotos em um PDF. | Sinônimos do guia certo no registro; sem colidir com as consultas dos testes (§ 190). | Run de ajuste de SEO |
| F7 e-2 | REVISAO-F7.md e-2 e f-12 | baixo | A imagem Open Graph do gerador de QR diz "Your files never leave your device" (`src/seo/images.ts:14`), e a página não tem arquivo nenhum. | No ramo do QR de `heading()`, devolver o `texts.seal` da página (`src/tools/qr-code-generator/i18n/en.ts`) e regerar o PNG; teste que compara o selo do OG com o da página. | Run de ajuste de SEO |
| F4 SEO-2 | REVISAO-F4.md SEO-2 | baixo | Título e descrição da calculadora e do guia correspondente puxam o mesmo ângulo (sobreposição medida de 18 a 25% do texto). | Diferenciar o ângulo: calculadora "faça a conta", guia "entenda a decisão". | Run de ajuste de SEO |

## 9. Testes e portões

Run de ajuste de testes. Portão ou teste que protege mais não pode deixar nada que passa hoje reprovar: cada regra nova leva controle positivo e negativo.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F3 b-06 | REVISAO-F3.md b-06; § 104 | baixo | A prova de "nada sai" não vê WebSocket (a parte do GET com query saiu na § 104: `tests/e2e/launch-claims.spec.ts:109-110`). | `page.on('websocket')` e `context.on('request')` com `resourceType() === 'websocket'` reprovando; controle positivo com um WebSocket aberto por `page.evaluate`. | Run de ajuste de testes |
| F3 f-03 | REVISAO-F3.md f-03; § 103 | baixo | Nenhum portão cobre cor funcional (`rgb`, `hsl`, nome), raio e sombra literais, degradê, vidro e borda de um lado só. O site cumpre hoje. | Ampliar o `gate:design` (`scripts/gates/design.ts`, `scripts/lib/design-checks.ts`): reprovar funções de cor e nomes de cor fora de `var(--token)` ou `color-mix` de tokens, `border-radius` fora de `var(--radius-*)`, `0`, `50%` e `inherit`, `box-shadow` fora de `var(--shadow-*)`, `none` e as duas exceções escritas, `gradient(` fora do `.fo-dogear::after`, `backdrop-filter` e `filter` com blur. Controles negativos no `design-checks.test.ts`. | Run de ajuste de testes |
| F7 f-11 | REVISAO-F7.md f-11; F6 f-9 (refutado) | baixo | O portão de voz do `gate:design` só lê as páginas de PDF e os guias (`scripts/gates/design.ts:76-107`); imagem, dinheiro, casa e saúde, QR, hubs e home não passam por ele. A lente varreu as 146 páginas e não achou nada: é lacuna de proteção. | Somar os ids de imagem, dinheiro, `LIFE_CALC_IDS`, os hubs e `QR_ID` ao `checkVoice` (texto visível e `data-props`); para a saúde, exigir 0 exclamações. A F8 acrescenta duas páginas novas (offline e "Abrir com"): entram juntas. | Run de ajuste de testes |
| F4 PRI-4 | REVISAO-F4.md PRI-4; § 113 | baixo | O `cleanParams` fecha `tool`, `place`, `target`, `format`, `outcome`, `reason` e `codec` (`src/analytics/events.ts:65-74`), mas `lang` e `browser` aceitam qualquer texto. Nenhum vem de campo digitado. | `lang` contra `['en','pt','es']`; `browser` contra o formato de `browserLabel()` (`nome-versão`); teste no `consent.test.ts`. | Run de ajuste de testes |
| F5a B-3 | REVISAO-F5a.md B-3 | baixo | O critério 7 (nenhuma ação do arquivo da pessoa roda) só é vigiado nos 7 fluxos que desenham; os outros 9 fluxos que aceitam a `gen-acoes` não têm a guarda de diálogo, popup e navegação (a lente rodou os 9 e não achou nada). | Estender a guarda do `pdf-privacy.spec.ts` aos 16 fluxos. | Run de ajuste de testes |
| F5a B-2 | REVISAO-F5a.md B-2 | baixo | O `verbosity: 0` (`src/engine/pdf/pdfjs.ts:144`) não vale no caminho da página: o primeiro arquivo no WebKit sem `OffscreenCanvas` escreve avisos do PDF.js no console. | Passar `verbosity: 0` também ao núcleo carregado na página (`pdfjs-core.ts`), e uma asserção de console limpo no caminho da página (conferir se algum aviso leva o nome do arquivo). | Run de ajuste de testes |
| F4 PRI-1 | REVISAO-F4.md PRI-1 | baixo | O `money-privacy.spec.ts` deixa 14 sentinelas fora da busca e não digita nos campos que só aparecem com outro modo, nas linhas novas de dívidas nem na entrada em %. A sonda da lente cobriu 40 cenários e não achou vazamento. | Digitar sentinela em todo campo de cada modo, em 10 linhas de dívidas e na entrada em %, e procurá-las na URL, no `dataLayer`, no storage e nas requisições. Custo: uma carga a mais por modo; o spec se chama `money-*` por causa da divisão do WebKit (§ 142). | Run de ajuste de testes |

## 10. Desempenho

Run de ajuste de desempenho. Nenhum limiar muda; medir antes e depois (orçamento, Lighthouse, tarefa longa).

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F3 e-02 | REVISAO-F3.md e-02 (médio na lente); § 69 | baixo | Memória de lote longo: o ZIP montado ao fim do lote duplica as saídas no processo do navegador (cerca de 13 MB por HEIC de 12 MP; 20 HEIC = 612 MB no Chromium; sem vazamento depois do "Start over"), e o limite real em celular nunca foi medido (`src/tools/image/ImagePanel.tsx:279-283`). | Registrar num § o custo medido (cerca de 2 vezes a soma das saídas) e medir num celular de verdade. Não montar o ZIP só no clique: o rótulo "Download all · ZIP 9.4 MB" e a § 69 pedem o ZIP pronto, e o Safari pode recusar download depois de um `await`. Uma régua automática pede leitura de `/proc` no Linux e traz risco de teste instável (o `performance.memory` não enxerga os blobs). | Victor decide (registrar), depois run de ajuste de desempenho |
| F5a E-2 | REVISAO-F5a.md E-2 | baixo (médio na lente) | A grade de páginas desenha de novo todas as células a cada clique ou tecla, e o custo cresce com o número de páginas (300 na `gen-paginas-300`). | `memo` por célula, com a chave da página e do estado dela. | Run de ajuste de desempenho |
| F5a E-4 | REVISAO-F5a.md E-4 | baixo | No caminho da página (WebKit sem `OffscreenCanvas`), cada documento aberto deixa o Worker de leitura do PDF.js rodando. | `destroy()` do documento e do worker ao trocar de arquivo ou no "Start over". | Run de ajuste de desempenho |
| F5a E-5 | REVISAO-F5a.md E-5 | baixo | Desenhar miniaturas deixa uns 0,85 MB de memória nativa por página até o próximo GC. | `page.cleanup()` depois de cada miniatura e canvas de 1 px ao soltar. | Run de ajuste de desempenho |

## 11. CI e ferramentas

Run de ajuste de CI. Mexe em `scripts/` ou em `.github/workflows/ci.yml`, então o merge é do Victor quando tocar o workflow.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| § 242 | DECISOES.md § 242 | baixo | O `pnpm verificar` inteiro passou de 900 s na máquina local (1.169,4 s na F6) e não há comando que rode as partes do CI em sequência e some os totais (`scripts/verificar.ts:45-51` só tem `--sem-playwright` e `--playwright=`). | Modo `pnpm verificar --partes`: as 13 partes em sequência, cada uma no limite de 900 s, com o total de cada uma e a soma. Não muda o `ci.yml`. O `verificar.test.ts` prova que as partes juntas são o todo. | Run de ajuste de CI |
| § 283 | DECISOES.md § 283 e § 302 | baixo | As partes 2 e 7 do WebKit passaram do alvo de 700 s uma vez cada (833,1 s e 730,0 s). A F8 aplicou a segunda proposta (o WebKit em 10 partes, § 302); a primeira ficou de fora, porque com 10 partes ela não muda a pior parte. | Se uma parte do WebKit voltar a passar de 700 s: `axe-states.spec.ts` com o passeio de estados do `a11y.spec.ts` (84 testes, 819 s de WebKit), caindo depois do `ads.spec.ts`. Rodar o `--list` de cada parte antes, e manter o `design.spec.ts` e o `image-matrix.spec.ts` em partes diferentes (§ 142). | Run de ajuste de CI |

## 12. Kit de lançamento

Run de ajuste do kit (`docs/lancamento/` e `pnpm lancamento:imagens`). O `launch-kit.test.ts` compara contagens, limites de caracteres e imagens; a F8 não mexe no kit.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F5b F-7 | REVISAO-F5b.md F-7 e D-7 | baixo (médio na lente) | O texto da galeria 2 do Product Hunt fica ilegível no tamanho da galeria (uns 8 px), e as legendas das imagens 2 e 3 dizem pouco. | Fonte maior (mín. 14 px no tamanho final) e legendas que dizem o que a imagem mostra. | Run de ajuste do kit |
| F5b F-8 | REVISAO-F5b.md F-8 | baixo | As galerias 4 e 5 ficam coladas ao canto arredondado, e a galeria 1 corta cartões pela metade. | Margem interna e recorte por cartão inteiro. | Run de ajuste do kit |
| F5b B-3 | REVISAO-F5b.md B-3 | baixo | A galeria 2 mostra fotos de terceiros (MIT e CC BY-SA 4.0) sem atribuição. | Linha de crédito na imagem ou no texto do kit, ou fotos do próprio projeto. | Run de ajuste do kit |
| F5b B-2 | REVISAO-F5b.md B-2 | baixo | A prova 1 do kit só vale no `dist/` local, e o primeiro comentário convida a abrir a aba Network sem avisar do tráfego do Google em fileorca.com. | Dizer no comentário que, em fileorca.com, a aba Network mostra também o Google Analytics (sem o arquivo) e como filtrar. | Run de ajuste do kit |
| F5b C-3 | REVISAO-F5b.md C-3 | baixo | "Once a tool has loaded, it keeps working offline" vale para 20 ferramentas, mas o teste cobria 6 ferramentas e 2 guias. A F8 passa a provar o offline de verdade (service worker); depois dela o kit pode dizer mais. | Reescrever a frase do offline contra o que o spec da F8 prova e atualizar a seção "Provas" do `product-hunt.md` e do `show-hn.md`. | Run de ajuste do kit |

## 13. Conteúdo: a run 2b

Run 2b (conteúdo). Não é correção: é a parte da F2 que a válvula do CI cortou (§ 85).

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F2 2b | DECISOES.md § 85; ADR-003 | baixo | Convert to WebP/AVIF e AVIF to JPG ficaram de fora com o `verificar` a 1.457 s. O motor guarda a decodificação e a codificação de AVIF, a codificação de WebP e a operação `convert`, com os testes de unidade. | Páginas e pastas das duas ferramentas, entradas no registro (`IMAGE_TOOL_IDS`, `IMAGE_PAGES`) e as rotas, os textos (`ImageToolTexts`, cartões em `common.ts`), os casos da matriz (AVIF na saída, nos dois navegadores; recuperar dos commits `3812f49` e `840d565`), a medida de tempo do codificador AVIF no runner, o lugar no hub, na home, no rodapé e na busca. Depois da F6, também pt e es (`TRANSLATED_PATHS`, glossário). Atualizar o kit (`launch-kit.test.ts` compara as contagens: "eight" vira "ten") e as 18 linhas marcadas `<!-- muda com a 2b -->` em `docs/lancamento/`. Medir o JS do `budgets.spec.ts` e o CI antes de somar testes. | Run 2b |

## 14. Decisões do Victor

A maioria traz uma saída recomendada; a run de ajuste só começa depois da escolha do Victor.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| F3 d-02 | REVISAO-F3.md d-02; § 103 | médio (alto na lente) | A `wave` da Oli (3 s, `alternate`, infinita) e o vapor da caneca (1,8 s, infinito) começam sozinhos, passam de 5 s e não têm pausa (WCAG 2.2.2). O site já para tudo com `prefers-reduced-motion` (§ 44, § 57); o W3C ainda discute se isso basta (issue #3766). Os laços estão em `src/styles/components.css:14`, `:16`, `:17` e `:68`. | Saída A: limitar cada laço a menos de 5 s e deixar a Oli em repouso (a `wave` em 4,5 s, uma vez; o vapor em 2 ciclos); muda os testes de movimento do `design.spec.ts` e o README da Oli ("loop"). Saída B: um controle de pausa. Recomendada: A, por ser local e sem controle novo. | Victor decide |
| F3 c-04 | REVISAO-F3.md c-04; § 103 | baixo | A escolha feita no aviso próprio numa página sem a CMP do Google (home, jurídicas, Apoio, 404) é reaplicada como `ad_*` concedido na página de ferramenta, antes de a mensagem do Google perguntar. Só existe com os anúncios ligados. | Saída A: nas regiões negadas por padrão, reaplicar só `analytics_storage`. Saída B: carregar a CMP em toda página (muda a arquitetura e pede ADR). O Victor confere o comportamento real na UE com a CMP publicada. | Victor decide, antes de ligar os anúncios |
| F3 c-08 | REVISAO-F3.md c-08; § 103 | baixo | O ramo `!adsbygoogle.loaded` da detecção de bloqueador pode dar falso positivo com o script ainda carregando e mostrar o café já no primeiro uso. | Revisar com o anúncio real, ao ligar os anúncios (esperar o `load` do carregador). | Victor decide, ao ligar os anúncios |
| F3 b-07 | REVISAO-F3.md b-07; § 103 | baixo | A Privacidade diz "o período configurado no Google Analytics" (`src/i18n/en/privacy.ts:118`) sem o número. Na produção, o Cloudflare manda `Nel`/`Report-To` e `Speculation-Rules` (Speed Brain), fora do repositório. | O Victor fixa a retenção no GA4 e o número entra nos três idiomas; decide se desliga o Speed Brain na zona. O texto do Show HN segue certo ("o único terceiro é o Google Analytics"). | Victor decide |
| F3 e-05 | REVISAO-F3.md e-05; § 103 | baixo | `/_astro/*` devolve `immutable` de 1 ano também em 404 (`src/platform/headers.ts:36`); o `_headers` não condiciona a regra ao status. O cético mediu: no Chromium o 404 fica no cache HTTP por um ano e nem o reload o revalida; no WebKit não. Só importa num rollback ou na defasagem de um deploy (o hash muda a cada build). | Aceitar e registrar (não há correção dentro do `_headers`). A § 102 e a § 104 já dão a fala "recarregue a página". O service worker da F8 nunca guarda resposta que não seja 200 (§ 285); falta, se o Victor quiser, refazer um `/_astro/*` que voltou 404 com `cache: 'reload'` para passar por cima do cache HTTP. | Victor decide |
| F2 § 60 | DECISOES.md § 60 | baixo | O preset YouTube thumbnail entrega 1280 × 720 até 2 MB; a ajuda do YouTube hoje recomenda 3840 × 2160 e aceita 2 MB no celular. | Manter 1280 × 720 (cabe em todas as regras e nos 2 MB) ou subir o padrão. Os guias já dizem os dois (F5b A-2). | Victor decide |
| F7 e-1 | REVISAO-F7.md e-1; § 274 | médio (baixo na lente) | CLS de 0,20 de 320 a 390 px com escala 1: o breadcrumb quebra em duas linhas quando o Figtree chega e empurra a ferramenta 22 px (`.fo-crumbs`, `src/styles/components.css:101`). O Lighthouse só mede a 412 px. A correção mexe no breadcrumb de todas as páginas ou no carregamento das fontes (§ 241), então não é local. | Saída A: reservar duas linhas no breadcrumb abaixo de 420 px (`min-height` de 2 × 20 px + o padding). Saída B: ADR "Proposta" para pré-carregar o Figtree (quebra a regra de um preload só, que o `gate:design` confere). Recomendada: A. Teste: CLS a 320, 360, 390 px no Chromium. | Victor decide |
| F5b C-6 | REVISAO-F5b.md C-6 e A-13 | baixo | A linha "Reviewed by Victor Yuki Matusita" (guias de arquivo, `Reviewed.astro` das calculadoras de dinheiro, brasileiras e de saúde) afirma uma revisão humana que as runs não tiveram. É linha de confiança em dinheiro e saúde. | O Victor lê as páginas e confirma, ou o texto passa a dizer só o autor e a data ("Written by ... on ..."). Antes de pedir a indexação. | Victor decide |
| F4 ACE-7 | REVISAO-F4.md ACE-7 | baixo | No computador a tabulação vai aos campos principais, à coluna do resultado e volta aos opcionais. É a ordem do HTML, que o molde fixa. | Aceitar e registrar num § (candidato a fechar sem mudar), ou pôr os campos opcionais antes da coluna do resultado no DOM numa run de acessibilidade. | Victor decide |
| F7 f-10 | REVISAO-F7.md f-10 | baixo | O Baixar do QR aparece desabilitado e cinza quando não há código. | Não renderizar os dois botões até haver código, ou registrar num § que o QR segue a § 139 (botão desligado enquanto não há resultado). | Victor decide |
| ajuste-aviso-espaco | `ajuste-aviso-espaco.md`; § 106 | baixo | O card do aviso de cookies aberto fica por cima do canto de baixo à esquerda do rodapé. | Um card menor no computador, ou a primeira coluna do rodapé afastada do canto. As duas são decisão de design. | Victor decide |
| F6 notas | `fase-06.md`, lista do Victor, item 8 | baixo | Notas da lente de privacidade, sem prova e fora das regras escritas (a lente deixou cinco; o relatório lista três): com os anúncios ligados, se os pedidos do AdSense levam o `#` do link do cenário de uma calculadora (aba Rede); se o navegador oferece salvar a senha da Proteger e da Desbloquear PDF (os textos dizem que ela não fica guardada); se a lista de eventos da Privacidade deve citar a rolagem e o clique de saída da medição otimizada do GA4. | O Victor confere cada uma com os anúncios ligados; o que falhar vira correção (`autocomplete="off"` e nome do campo sem pista de senha; texto da Privacidade). | Victor decide |

## 15. Tarefas do Victor

Fora do código. As duas primeiras são as que a ficha da F8 nomeia (decisão 3); o resto são pendências que os relatórios das fases dizem que seguem abertas, e o Victor pode riscar as que já fez.

| Id | Fonte | Sev. | Defeito | Correção proposta | Quem resolve |
| --- | --- | --- | --- | --- | --- |
| Worktrees | `fase-07.md`, lista do Victor, item 7; `docs/prompts/prompt-fase-08.txt`, decisão 3 | baixo | Sete worktrees registradas, de 30 e 31 de outubro (os relatórios dizem cinco), seguem em `.claude/worktrees/`, todas sem mudança não commitada: `ajuste-ci-partes` (a PR #6 já foi mesclada), `wf_55c0785e-3ef-1` e `-2` e `wf_ffd6e7ec-d08-1` a `-4` (agentes da F2). Há ainda 30 pastas sem `.git` (29 só com `node_modules`, e a `revisao-f7` com `.cache` e `node_modules`), restos de worktrees já removidas, e 14 branches locais `worktree-*` (`agent-a4a9ed286890e434e`, `wf_f5593ece-ec5-1` a `-7`, `wf_55c0785e-3ef-1` e `-2`, `wf_ffd6e7ec-d08-1` a `-4`). | Para cada worktree registrada: `git worktree remove .claude/worktrees/<nome>` e, depois, `git branch -D worktree-<nome>` (a `ajuste-ci-partes` leva o nome da branch sem prefixo). As pastas restantes se apagam à mão (`.claude/worktrees/` está no `.gitignore`). Nada disso muda o repositório. A `revisao-f4-f7` é a revisão da F8 e sai quando ela terminar. | Victor faz |
| Fontes | `fase-07.md`; § 265 | baixo | ACOG CO 700 (texto inteiro), relatórios do DTIC e DoDI 1308.03 deram 403; o NCBI Bookshelf pede reCAPTCHA. Ver o grupo 1. | O Victor abre e confere os trechos citados. | Victor faz |
| F5b A-12 | REVISAO-F5b.md A-12 | baixo | As palavras do Instagram e do X nos guias vêm da cópia da página no buscador, que o leitor não abriu. | O Victor abre as duas páginas e confere as frases. | Victor faz |
| 90 dias | DECISOES.md § 273 | baixo | O teste de 90 dias de casa e saúde vai de 2 de novembro de 2026 a 31 de janeiro de 2027. | Em 31 de janeiro, olhar no Search Console as impressões das 11 calculadoras e dos 2 hubs; as que tiverem impressão ganham pt e es numa run própria. Se o merge atrasar, contar os dias de produção de cada página. | Victor faz |
| F0-SAIDA | `docs/F0-SAIDA.md`; `fase-01a.md` | baixo | Campos vazios: data de compra e data-limite para transferir o domínio ao Cloudflare Registrar (compra + 60 dias), nameservers, zona ativa desde, Search Console verificado (sim/não), Bing Webmaster (sim/não), PayPal no Ko-fi, redes reservadas, INPI e USPTO, `data/keywords.csv` e a data da F0. | O Victor preenche; o prazo de transferência é o que tem data. | Victor faz |
| Sobre e Oli | `fase-02.md`, item 7 | baixo | A foto do Sobre e a busca reversa da Oli (bom fazer antes do Show HN). | O Victor escolhe a foto; a busca reversa é uma conferência dele. | Victor faz |
| HEIC no Safari | `fase-02.md`, item 5 | baixo | O caminho nativo da HEIC não roda no CI: falta conferir num iPhone ou Mac de verdade. | Abrir a HEIC to JPG no Safari; nos primeiros dias olhar o `tool_error` no GA4 (`codec` e `reason`). | Victor faz |
| Contas e jurídico | `fase-02.md`, item 7; `ajuste-previa-build.md` | baixo | Textos que dependem de conta (valores do Ko-fi, retenção do GA4 e leitura jurídica das bases legais e do foro), e-mail da marca, e `PUBLIC_ADS_ENABLED` desligado até a aprovação (Termos e Privacidade dizem "mostra, ou vai mostrar, anúncios"). | O Victor fecha e pede uma run curta para ajustar os textos. | Victor faz |
| Painel do Cloudflare | `ajuste-previa-build.md` | baixo | Voltar o "Comando de preview" do painel para `npx wrangler preview`. Opcional: decidir se volta ao Node 26 e ao pnpm 12 (§ 37). | Conferir no painel; o Node 24 e o pnpm 10 funcionam. | Victor faz |
| Motor aberto | `fase-05a.md`, item 4; § 165 | baixo | Criar o repositório público do motor de imagem (`pnpm motor:exportar`, `docs/lancamento/codigo-aberto.md`). Não consta que tenha sido criado. | O Victor cria e confere; o kit só cita o link se ele estiver no ar. | Victor faz |
| Pix e português | `fase-06.md`, itens 2 a 5 | baixo | Escanear o QR dos quatro valores do Pix na `/pt/apoie/` sem pagar; ler o português das 8 calculadoras e de imagem e PDF; abrir uma ferramenta e a hipoteca em espanhol no celular; pedir indexação dos hubs de pt e es. | O Victor confere; ajuste vira run curta. | Victor faz |
| Energia do PC | `fase-05a.md`, item 9 | baixo | Voltar o `powercfg` ao normal na máquina de desenvolvimento. | Conferir; sem efeito no repositório. | Victor faz |

## Registrados (escolhas, não defeitos)

| Item | O que é |
| --- | --- |
| F5a S-3 (§ 183) | A janela de 64 KB de lixo depois do `%%EOF` fica: procurar no arquivo inteiro deixaria passar um corte de atualização incremental. |
| F5a S-4 (§ 183) | Sem ganho, a reescrita reparada pode ficar maior que a entrada estragada (796 contra 767 bytes num PDF mínimo): "nunca sai um PDF quebrado" vem antes de "nunca maior". |
| F6 s-6 (§ 129) | O cronograma rola de lado a 1280 px dentro da moldura. |

## Já corrigidos depois da revisão (fora das tabelas)

| Item | Onde foi corrigido |
| --- | --- |
| F3 a-06: pt e es fora do `ads.spec.ts` | F6: `tests/e2e/ads.spec.ts:47-49` e `:139` (`TRANSLATED_TOOL_PAGES`), mais os hubs em `:300` e `:382` e os PDFs em `:579-626` (§ 233) |
| F3 b-06: GET com query na prova de "nada sai" | § 104 (p2-integridade-03): `tests/e2e/launch-claims.spec.ts:109-110`. Só o WebSocket segue aberto (grupo 9) |
| F4 ACE-3: a unidade do campo não entra na descrição | F7, § 279: `src/tools/calc/CalcField.tsx:85-90` (`prefixId` e `suffixId` no `aria-describedby`), para todas as calculadoras |
| F4 PRI-4: parte do `cleanParams` | `tool`, `place`, `target` e `format` hoje têm lista fechada (`src/analytics/events.ts:65-74`); `lang` e `browser` seguem abertos (grupo 9) |
| § 243: duas partes do Chromium acima de 700 s | F7: o CI passou a 4 partes do Chromium e 8 do WebKit (`.github/workflows/ci.yml:56-91`) |
| § 105 e § 141: o terceiro `--shard` e o `ENOSPC` do WebKit | Ajustes `ajuste-ci-webkit-tres` e `ajuste-ci-disco` (§ 108, § 109 e § 154) |
| F3 p2-*: os 7 achados da segunda passada | § 104 |
| F6 s-6: a rolagem do cronograma a 1280 px | Fica como é: a da § 129 (rolagem dentro da moldura) |
