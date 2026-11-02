# Revisão adversarial da F6

Esta é a revisão final da run `fase-06`: o site em português e em espanhol (imagem, PDF, as 8 calculadoras brasileiras e as 5 em espanhol), o Pix da `/pt/apoie/`, os glossários e os testes que cresceram. Ela seguiu o método da F3 (DECISOES § 92 a § 94), como a F5a e a F5b. O gabarito foi:

- a ficha (`docs/prompts/prompt-fase-06.md`), com as decisões 1 a 11 e os critérios de aceitação;
- o plano (`docs/relatorios/fase-06-plano.md`), que liga cada critério a um teste;
- o `CLAUDE.md`, o DECISOES (§ 213 a § 240), os glossários (`docs/i18n/`) e o `docs/design/`.

## Como rodou

- **Commit fixo:** `520296c`, numa worktree só de leitura em `.claude/worktrees/revisao-f6`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build` (148 páginas). A worktree foi removida no fim.
- **Sete lentes Sonnet em contexto limpo,** num workflow, contra a ficha e o plano. Cada uma teve uma porta (`FO_PORT` de 4174 a 4180) e uma pasta só dela, `.cache/lente-<x>/`, onde ficaram as sondas, os screenshots e um `relatorio.md`:
  1. (a) corretude: as calculadoras brasileiras contra o oráculo e as normas, o Pix contra o manual, o CSV e o PDF de cada idioma, as 5 em espanhol com os números do inglês;
  2. (b) privacidade e segurança;
  3. (c) anúncio e política;
  4. (d) acessibilidade (WCAG 2.2 AA);
  5. (e) desempenho e SEO;
  6. (f) design system e voz;
  7. (g) idioma.
- **Céticos:** um cético Sonnet próprio para cada achado crítico, alto ou médio, e um por lente para os baixos, cada um com porta (de 4181 em diante, sem a 4190) e pasta próprias e a regra "sem reprodução, refutado".
- **Correções:** o agente principal (Opus), no checkout da branch: crítico e alto sempre, médio quando a correção é local, cada uma com um teste que falha sem ela e um §. Os baixos vão para o relatório.
- **Segunda passada:** um revisor Sonnet em contexto limpo leu só o diff das correções, na mesma worktree, movida para o commit das correções.
- **Tamanho:** 27 agentes (7 lentes e 20 céticos), em 47 minutos.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | ---: | ---: |
| Crítico | 0 | 0 |
| Alto | 0 | 0 |
| Médio | 15 | 13 |
| Baixo | 22 | 18 |
| Refutado | — | 6 |

Por lente, depois dos céticos:

| Lente | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: |
| (a) corretude | 3 | 3 | 1 |
| (b) privacidade e segurança | 0 | 0 | 0 |
| (c) anúncio e política | 1 | 1 | 2 |
| (d) acessibilidade | 1 | 3 | 1 |
| (e) desempenho e SEO | 1 | 0 | 0 |
| (f) design system e voz | 5 | 2 | 2 |
| (g) idioma | 2 | 9 | 0 |

- **Achados repetidos entre lentes.** Os 13 médios confirmados são 10 defeitos: a PRICE com TR acima dos 16 ms por tecla foi achada por duas lentes (a-1 e e-1); o seletor de valor do Pix fora do trilho, por duas (c-1 e f-1); a parcela do SAC com seguros no resultado e sem eles no cronograma, por duas (a-2 e f-5). O "Copiar código" mudo quando a cópia falha também veio de duas (c-2 e d-3, baixos).
- **Os céticos desceram de severidade** 2 achados: o d-2 (o status do Pix depois de trocar o valor) e o g-2 (a taxa sem "ao mês" no PDF e no exemplo), de médio a baixo. **Refutaram** 6: d-4, f-7, f-9, c-3, c-4 e a-7 (os motivos estão abaixo).
- **As correções:** os 10 defeitos médios foram corrigidos, cada um com um teste que reprova no código revisado (`520296c`) e passa no novo, e um § (§ 244 a § 252). Corrigi também 4 baixos que caíram no mesmo código (d-2, d-3/c-2 e f-6, no bloco do Pix, e a parte do a-5 que é o g-1). Os outros baixos ficam no relatório da fase.

## O que cada lente conferiu, em resumo

1. **(a) Corretude.** Reimplementou as 8 calculadoras brasileiras por conta própria (Python, `Fraction` exata e `Decimal` de 90 dígitos) e comparou com o motor em 2.400 casos, linha a linha: 0 diferenças. Abriu 40 cenários e 32 resultados nas páginas, baixou CSV e PDF e comparou: 0 diferenças, fora os achados. Rodou os `--check` dos oráculos (zero), leu as normas na fonte (Res. CMN 4.881, 4.549 consolidada e 3.516, NT BCB 56/2025, Lei 14.690 art. 28, Decreto 6.306, CDC art. 52), conferiu o Pix (CRC, TLV, QR lido de volta de screenshot nos dois temas, cópia) e comparou as 5 de es com o inglês (4.218 células do CSV) e as 23 ferramentas de imagem e PDF em en, pt e es: as deterministas dão bytes idênticos.
2. **(b) Privacidade e segurança.** Nenhum defeito. Sentinelas nos campos das 13 calculadoras de pt e es, procuradas em URL, título, GA4, armazenamento, cookies e nomes de arquivo; nada sai das ferramentas de pt e es (só GET da própria origem); o Pix é estático; nenhum COOP, COEP ou `SharedArrayBuffer`. Deixou cinco notas sem prova para o Victor conferir (no relatório da fase).
3. **(c) Anúncio e política.** O rótulo do anúncio em pt e es em 85 páginas, as distâncias de 150 px nos estados de pt e es, as calculadoras nos estados de borda de 320 a 1280 px, e as regras de dinheiro em 15 páginas (nenhum banco, nenhuma "taxa de hoje", nenhuma tabela oficial).
4. **(d) Acessibilidade.** O `lang`, os nomes acessíveis traduzidos (inclusive os escondidos), os formulários das calculadoras e o bloco do Pix pelo teclado, com o axe nos estados que o `a11y.spec.ts` não alcança.
5. **(e) Desempenho e SEO.** O orçamento (com o WebKit numa amostra), o JS inicial das páginas em inglês antes e depois, o Lighthouse das URLs do `lighthouserc.json`, e o SEO das 148 páginas por uma sonda independente do mapa de rotas (hreflang, canonical, sitemaps, slugs, títulos e descrições).
6. **(f) Design system e voz.** O `gate:design` no `dist/` (verde) e sondas próprias nas 81 páginas de pt e es a 320, 360, 768 e 1280 px, nos dois temas, com screenshots de cada achado.
7. **(g) Idioma.** Leu inteiros os textos das 8 calculadoras brasileiras e do hub, das 5 em espanhol e do hub, e dos painéis de imagem e PDF; procurou frases em inglês no que a ilha desenha depois e nos PDFs gerados; conferiu moeda, número e data de cada idioma.

## Os achados

### (a) corretude

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| a-1 | médio | médio | SAC × PRICE com TR passa de 40 a 80 ms por tecla, contra o teto de 16 ms | corrigido (§ 244) |
| a-2 | médio | médio | Cronograma, CSV e PDF do SAC × PRICE mostram a parcela sem seguros e taxas, e o herói mostra com | corrigido (§ 252) |
| a-3 | médio | médio | Amortização antecipada no SAC mostra economia diferente de zero, e às vezes negativa, com R$ 0 antecipado | corrigido (§ 249) |
| a-4 | baixo | baixo | A frase da PRICE diz "fica quase igual" mesmo com TR, e logo depois diz que as parcelas sobem | relatório (pendência) |
| a-5 | baixo | baixo | Plural e preposição erradas em pt ("1 anos", "nos 1 ano", "nenhum tempo antes") | em parte (§ 249: o "nenhum tempo antes"); o resto fica no relatório |
| a-6 | baixo | baixo | O cartão aplica o mesmo IOF em reais nos dois caminhos, embora os valores financiados difiram | relatório (pendência) |
| a-7 | baixo | refutado | O JSON-LD das páginas em português declara o preço em USD | — |

### (c) anúncio e política

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| c-1 | médio | médio | OptionGroup de valores do Pix sai da pílula a 360 e 375 px | corrigido (§ 245) |
| c-2 | baixo | baixo | "Copiar código" do Pix falha em silêncio quando a área de transferência recusa ou não existe | corrigido (§ 245) |
| c-3 | baixo | refutado | Valores iniciais de IOF, seguros e taxas, tarifas e IPTU não levam a etiqueta "exemplo" | — |
| c-4 | baixo | refutado | Medidas de distância dos "outros estados" e da linha do café só existem em inglês | — |

### (d) acessibilidade

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| d-1 | médio | médio | O erro de número mal escrito diz só a faixa e contradiz o que a pessoa digitou; nenhum texto diz qual separador decimal vale | corrigido (§ 251) |
| d-2 | médio | baixo | Status "Código copiado" do Pix fica na tela depois de trocar o valor, e a área de transferência continua no código do valor antigo | corrigido (§ 245) |
| d-3 | baixo | baixo | "Copiar código" falha em silêncio quando a área de transferência não existe e dá erro não tratado quando ela recusa | corrigido (§ 245) |
| d-4 | baixo | refutado | Com o espaçamento de texto da WCAG 1.4.12, as páginas em pt e es passam a rolar de lado a 320 px, e as inglesas não | — |
| d-5 | baixo | baixo | "1 arquivos não puderam ser lidos": o status que o leitor de tela ouve não concorda em número, em pt e es | relatório (pendência) |

### (e) desempenho e SEO

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| e-1 | médio | médio | SAC × PRICE com TR passa dos 16 ms por tecla (41 a 68 ms no Chromium) e o teste dos 16 ms não cobre esse caminho | corrigido (§ 244) |

### (f) design system e voz

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| f-1 | médio | médio | Seletor de valor do Pix passa do trilho a 360 e 375 px (R$ 20 sai da pílula) | corrigido (§ 245) |
| f-2 | médio | médio | /pt/assinar-pdf/ rola de lado a 320 px na aba Imagem (botão nowrap de 323 px numa coluna de 288) | corrigido (§ 248) |
| f-3 | médio | médio | Número do ResultHero parte no meio (R$ 166.010,8 / 5) em /pt/amortizacao-antecipada/ a partir de 768 px | corrigido (§ 246) |
| f-4 | médio | médio | Valores das tabelas "Exemplo resolvido" quebram no meio do número em pt e es, no estado inicial, até a 1280 px | corrigido (§ 247) |
| f-5 | médio | médio | SAC × PRICE: "Primeira parcela" do resumo inclui os seguros, mas a coluna "Valor" do cronograma e do CSV não (e "Parcela" é o número) | corrigido (§ 252) |
| f-6 | baixo | baixo | "Copiar código" do Pix passa 17 px da coluna a 320 px | corrigido (§ 245) |
| f-7 | baixo | refutado | Rótulos longos mandam a etiqueta "exemplo" para a linha de baixo e deixam palavra órfã (alugar ou comprar, hipoteca es) | — |
| f-8 | baixo | baixo | Tamanho de arquivo e moeda com espaço comum nos textos fixos de pt e es | relatório (pendência) |
| f-9 | baixo | refutado | O portão de voz do design só cobre as páginas de PDF e os guias | — |

### (g) idioma

| Id | Lente | Depois do cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| g-1 | médio | médio | Amortização antecipada diz "você termina nenhum tempo antes" quando o prazo não encurta | corrigido (§ 249) |
| g-2 | médio | baixo | O PDF e o "Exemplo resolvido" mostram taxa mensal sem o período ("Rotativo 14%", "R$ 4.000,00, 12%, R$ 600,00") | relatório (pendência) |
| g-3 | médio | médio | 45 blocos de texto de licença em inglês em /pt/licencas/ e /es/licencias/ sem lang="en" | corrigido (§ 250) |
| g-4 | baixo | baixo | "R$ 10.000" com espaço comum em todo texto estático em português (glossário pede espaço sem quebra) | relatório (pendência) |
| g-5 | baixo | baixo | O hub brasileiro diz que o CET é um campo, mas o CET é resultado | relatório (pendência) |
| g-6 | baixo | baixo | Siglas sem a forma por extenso na primeira menção: CET em 4 páginas pt, APR em 3 páginas es | relatório (pendência) |
| g-7 | baixo | baixo | "1 arquivos não puderam ser usados" e "No se pudieron usar 1 archivos" (singular com 1) | relatório (pendência) |
| g-8 | baixo | baixo | Decalque do inglês: o nome da ferramenta com artigo, sem a palavra "ferramenta" ("a Comprimir imagem recebe e entrega", "da Redimensionar imagem", "a PDF para JPG") | relatório (pendência) |
| g-9 | baixo | baixo | Erro de formato errado leva ao nome da ferramenta sem artigo nem substantivo ("Abra-o em HEIC para JPG", "Ábrelo en HEIC a JPG") | relatório (pendência) |
| g-10 | baixo | baixo | A plaquinha da Oli no Alugar ou comprar diz "quando comprar vira" (frase sem complemento) | relatório (pendência) |
| g-11 | baixo | baixo | Resquícios do inglês e escolhas pouco naturais no espanhol do dinheiro | relatório (pendência) |

### Os refutados, com o motivo do cético

- **d-4** (Com o espaçamento de texto da WCAG 1.4.12, as páginas em pt e es passam a rolar de lado a 320 px, e as inglesas não): Reproduzi os números da lente no Chromium (.cache/cetico-d-baixos/d4.ts, com o CSS do 1.4.12 injetado a 320 px): /pt/privacidade/ 374, /es/privacidad/ 368, /pt/girar-imagem/ 341, /es/rotar-imagen/ 343, redimensionar 342, /pt/cortar-imagem/ 335, /pt/simulador-sac-price/ 329, /pt/apoie/ 325. O defeito que a lente alega não se sustenta, por quatro motivos. (1) Sem o espaçamento, a 320 px nenhuma página medida em pt, es …
- **f-7** (Rótulos longos mandam a etiqueta "exemplo" para a linha de baixo e deixam palavra órfã (alugar ou comprar, hipoteca es)): A quebra reproduz: no Chromium, a 360, 768 e 1280 px, os rótulos de /pt/alugar-ou-comprar/, /pt/amortizacao-antecipada/ e /es/calculadora-de-hipoteca/ quebram e a etiqueta "exemplo" desce de linha. O screenshot rent-360.png mostra "Reajuste do aluguel ao / ano" com "ano" sozinho. Mas nenhuma regra proíbe isso. (1) A regra do CLAUDE.md (F4) vale para os campos principais, que têm de caber numa linha para o ResultHero …
- **f-9** (O portão de voz do design só cobre as páginas de PDF e os guias): Verifiquei que checkVoice só roda sobre as páginas de PDF nos três idiomas (design.ts:67), os guias de arquivo (só em inglês) e os testes de PDF e de guias. Imagem, dinheiro, hubs e home não passam por ele. Mas isso é lacuna de cobertura, não violação. Rodei o checkVoice (voz.ts, em .cache/cetico-f-baixos/voice.ts) sobre as 146 páginas do dist, texto visível e data-props, em en, pt e es. Não achou palavra proibida, e…
- **c-3** (Valores iniciais de IOF, seguros e taxas, tarifas e IPTU não levam a etiqueta "exemplo"): A ausência da etiqueta existe: no dist, IOF, Tarifas, "Seguros e taxas" e IPTU não levam o `example`. A regra citada, porém, não proíbe isso como o projeto a aplica. (1) A regra do PLANO é a "Taxa digitada", e o NumberField/README do design system diz "Taxa é sempre digitada: o valor inicial é um exemplo e leva a etiqueta". Em src/tools/calc/defs/*.ts, todo `rate()` de br.ts leva `example: true`, sem exceção. As duas…
- **c-4** (Medidas de distância dos "outros estados" e da linha do café só existem em inglês): Confirmei a lacuna literal: o bloco "outros estados" do ads.spec.ts faz `page.goto('/compress-image/')` no beforeEach, e a linha do café só é medida ali. A ficha (decisão 9) pede "as páginas de ferramenta e de dinheiro em pt e es ... nos estados e nas larguras do inglês". O F6 cumpre isso por página: TRANSLATED_TOOL_PAGES entra no passeio de quatro estados (repouso, processando, resultado, fila) a 360 e 1280 px, o PD…
- **a-7** (O JSON-LD das páginas em português declara o preço em USD): O fato reproduz: dist/pt/simulador-sac-price/index.html traz "priceCurrency":"USD" (src/seo/meta.ts:89 fixa USD para todo idioma), igual a dist/es/… e dist/mortgage-calculator/. Mas nenhuma regra proíbe isso. Procurei priceCurrency, JSON-LD, dados estruturados e schema em prompt-fase-06.md, CLAUDE.md, DECISOES.md, PLANO-FILEORCA.md, docs/i18n/ e docs/adr/, e a "regra" citada pela lente não existe em nenhum deles. A D…

### Os baixos que ficam para depois

- **d-5** · "1 arquivos não puderam ser lidos": o status que o leitor de tela ouve não concorda em número, em pt e es. Correção sugerida: Acrescentar a variante singular (`someOne`: "1 arquivo não pôde ser lido; o resto está pronto." / "No se pudo leer 1 archivo; el resto está listo.") e escolher pela contagem no ImagePanel e no PdfPanel, nos três idiomas.
- **f-8** · Tamanho de arquivo e moeda com espaço comum nos textos fixos de pt e es. Correção sugerida: NBSP entre número e unidade nesses textos e uma checagem de /\d [KM]B/ no glossary.test.ts.
- **g-2** · O PDF e o "Exemplo resolvido" mostram taxa mensal sem o período ("Rotativo 14%", "R$ 4.000,00, 12%, R$ 600,00"). Correção sugerida: Em valueText, para 'rate' com suffix que não seja só '%', escrever o período ('14% a.m.' ou '14% ao mês'); na linha de lista (dívidas), rotular cada valor ('saldo R$ 4.000,00, juros 12% ao mês, mínimo R$ 600,00'). Teste sobre inputRows.
- **g-4** · "R$ 10.000" com espaço comum em todo texto estático em português (glossário pede espaço sem quebra). Correção sugerida: Trocar o espaço por U+00A0 depois de 'R$' nesses textos e acrescentar ao glossary.test.ts um controle que reprove /R\$ \d/ nos textos pt.
- **g-5** · O hub brasileiro diz que o CET é um campo, mas o CET é resultado. Correção sugerida: Dizer 'IOF, TR e as taxas de juros são campos; o CET é calculado'.
- **g-6** · Siglas sem a forma por extenso na primeira menção: CET em 4 páginas pt, APR em 3 páginas es. Correção sugerida: Pôr a forma por extenso no lead ou no title attribute do primeiro uso; um teste que confira, por página, que 'Custo Efetivo Total' / 'tasa porcentual anual' aparece antes da primeira sigla.
- **g-7** · "1 arquivos não puderam ser usados" e "No se pudieron usar 1 archivos" (singular com 1). Correção sugerida: Ter a variante singular ('1 arquivo não pôde ser usado; o resto está pronto.' / 'No se pudo usar 1 archivo; el resto está listo.') e escolhê-la com failed === 1, como já se faz com 'readyOne'.
- **g-8** · Decalque do inglês: o nome da ferramenta com artigo, sem a palavra "ferramenta" ("a Comprimir imagem recebe e entrega", "da Redimensionar imagem", "a PDF para JPG"). Correção sugerida: Escrever 'a ferramenta Juntar PDF' ou reformular ('O que entra e o que sai no Juntar PDF'); um teste simples que reprove artigo + nome de ferramenta nos pt.ts.
- **g-9** · Erro de formato errado leva ao nome da ferramenta sem artigo nem substantivo ("Abra-o em HEIC para JPG", "Ábrelo en HEIC a JPG"). Correção sugerida: 'Abra-o na ferramenta {tool}.' / 'Ábrelo con la herramienta {tool}.'
- **g-10** · A plaquinha da Oli no Alugar ou comprar diz "quando comprar vira" (frase sem complemento). Correção sugerida: 'quando comprar compensa' ou 'quando comprar passa à frente'.
- **g-11** · Resquícios do inglês e escolhas pouco naturais no espanhol do dinheiro. Correção sugerida: 'Reglamento Z (Regulation Z)' na primeira vez e 'Reglamento Z' depois; 'la CFPB'; 'termina al mismo tiempo' ou 'en el mismo plazo'; 'La avalancha {interestPart} y {timePart}.'; alinhar 'Ver la tabla de amortización'.
- **a-4** · A frase da PRICE diz "fica quase igual" mesmo com TR, e logo depois diz que as parcelas sobem. Correção sugerida: Quando tr > 0 usar outra frase para a PRICE, sem "quase igual" (por exemplo, começa em X e acaba em Y), e manter "quase igual" só com TR zero.
- **a-5** · Plural e preposição erradas em pt ("1 anos", "nos 1 ano", "nenhum tempo antes"). Correção sugerida: Escrever o ano como duration() (que já escolhe 1 ano ou n anos), trocar "nos {months}" por "em {months}", e dar ao early-payoff uma frase própria para o prazo que não muda ("o prazo continua o mesmo").
- **a-6** · O cartão aplica o mesmo IOF em reais nos dois caminhos, embora os valores financiados difiram. Correção sugerida: Dizer na premissa que o IOF digitado vale para os dois caminhos, ou pedir o IOF de cada caminho, ou escalar o IOF de A pela razão dos valores financiados.

## A segunda passada

Um revisor Sonnet em contexto limpo leu só o diff das correções (`520296c..8b74716`), na mesma worktree, movida para o `8b74716` e com o próprio build. Ele conferiu: os testes das correções (Vitest inteiro, 1.338 testes; os testes novos de Playwright nos dois navegadores); o ponto fixo da § 244 contra o cálculo exato em 172.796 entradas (0 diferenças), o `priceTrRows` antigo contra o novo em 600 casos (128 mil linhas) e o `sacPrice` inteiro em 300 casos (0 diferenças); a ordem do oráculo antes do motor; a amortização antecipada com R$ 0 e com valores crescentes (a economia nunca diminui); o Pix e a Assinar PDF de 320 a 414 px; a dobra a 360 × 740.

Achou 7 defeitos nas correções, nenhum crítico ou alto:

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| s-1 | médio | O número do ResultHero encolhia à toa quando o valor tem palavras, também em inglês ("3 years 1 month" de 48 para 34,6 px) | corrigido (§ 253) |
| s-2 | médio | O PDF do SAC × PRICE em A4, com a coluna nova, sobrepunha cabeçalhos e valores | corrigido (§ 255) |
| s-3 | médio | A dica do separador decimal aparecia em campos inteiros, vazios e com letras | corrigido (§ 254) |
| s-4 | baixo | Um valor inteiro longo ainda partia no meio ("$22,222,82" e "8") | corrigido (§ 253) |
| s-5 | baixo | Nenhum teste cobria a volta ao cálculo exato perto de meio centavo | corrigido (§ 255) |
| s-6 | baixo | O saldo do fim do ano ficava sob "Correção (TR)", e o cronograma rola de lado a 1280 px dentro da moldura | o saldo, corrigido (§ 256); a rolagem dentro da moldura é a da § 129 e fica |
| s-7 | baixo | A fórmula da amortização antecipada dizia "a mesma parcela" também no SAC, e a frase com R$ 0 dizia "mas você deixa de pagar R$ 0" | corrigido (§ 256) |

Cada correção da segunda passada tem um teste que reprova no `8b74716` e passa no código novo (`8b74716..` o commit de "the second pass of the review"). O revisor também lembrou que a § 226 segue dizendo que o SAC "mantém a amortização de hoje": a § 249 a substitui, e o `DECISOES.md` só acrescenta.
