# Idiomas, textos e guias de arquivo

O que as runs aprenderam sobre as páginas em pt e es, o formato de cada idioma, o `lint:texto`, os guias de arquivo e o kit do Product Hunt, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- A API pública do LanguageTool proíbe requisição automatizada; o `lint:texto` sobe o servidor local (DECISOES § 24). No Windows sem Java, ele baixa o JRE fixado para `.cache/`.

## F5b: guias de arquivo e kit do Product Hunt

Como acrescentar um guia de arquivo:

1. O id `guides-<slug>` em `FILE_GUIDE_IDS` e a entrada em `FILE_GUIDES` (`src/tools/guides/registry.ts`): a ferramenta embutida, o hub e até 6 relacionadas. A rota sai de `fileGuideRoutes()`.
2. As medidas: um plano em `scripts/guides/lib/plans.ts` (o caminho da pessoa: navegador onde o site escreve pelo canvas, Node onde é WASM ou pdf-lib), a tabela em `BUILDERS` de `src/tools/guides/measured.ts`, e `pnpm guias:medir`. O JSON entra num commit antes do texto.
3. O texto em `src/i18n/en/guide-<slug>.ts` (`FileGuideTexts`): todo número é `{placeholder}` do JSON (com as variantes `_off`, `_more`, `_times`, `_change`, `_exact` e `_word`), fato oficial de `facts` com a fonte, ou nome técnico de `names`. O cartão vai em `enCommon.fileGuides`.
4. A página `src/pages/guides/<slug>/index.astro`: guia de imagem passa `<XxxPage slot="tool" lang="en" embed />` (o componente da ferramenta ganha `embed` e, se precisar, `initial`); guia de PDF é só `<FileGuideView id />`.
5. Testes: os portões, o `budgets`, o `ads`, o `a11y` e o `tool-guides.spec.ts` leem o registro. O caso do guia entra em `CASES` do `tool-guides.spec.ts`.

Quando medir de novo: mudou o motor de imagem ou de PDF, o script de medidas (o teste compara o SHA-256), uma fixture, ou a versão do Playwright (o canvas muda). Depois, `pnpm guias:medir --check` tem de dar zero.

A regra dos números: nenhum algarismo à mão num texto de guia (`tests/unit/guides-numbers.test.ts`). Contagem por extenso também é número à mão: use `{nome_word}` ou tire a contagem.

Como o kit se mantém verdadeiro: o `tests/unit/launch-kit.test.ts` compara as contagens do `product-hunt.md` com os registros, as contagens de caracteres com os limites e cada imagem listada com o arquivo. Uma run que mudar uma contagem (a 2b) tem de atualizar o kit, e as imagens com `pnpm lancamento:imagens`.

Pegadinhas que a F5b achou:

- **A ferramenta embutida usa o `<script>` do componente da própria ferramenta** (§ 184). Um `<script>` que importe o mesmo `mount.ts` em outro componente faz o Rolldown tirar o módulo para um chunk comum, e a página da ferramenta passa a 3 arquivos.
- **O `.text` do `node-html-parser` cola o texto de elementos vizinhos** ("MoreIn today's"). Para contar palavras ou procurar frases, use `structuredText`.
- **`gifenc` é CommonJS no Node**: importe o default (`import gifenc from 'gifenc'`).
- **Uma consulta da busca que traz um guia muda por construção** (§ 190): dê ao guia termos que não colidam com as consultas dos testes, e uma frase com "jpeg" quando o nome diz "JPG".
- **O `pnpm guias:medir` grava o dia em UTC.** Depois das 21h em Brasília a data da medida já é a do dia seguinte. O `GUIDE_REVIEWED` e o `GUIDE_PUBLISHED` (`src/tools/guides/page.ts`) nunca ficam antes do `measuredOn`, e o teste reprova (§ 207).
- **As regras de texto que a revisão acrescentou** (`tests/unit/guides-numbers.test.ts`, § 197 a § 203 e § 208):
  - a frase diz a amostra (com placeholder de contagem);
  - um mínimo ou um máximo diz a direção;
  - nada generaliza além da amostra (a lista `GENERAL`: "usually", "often", "most PDFs", "usual", "almost free", "real PDFs"…);
  - a data da medida não vai para as fontes, que têm a própria data de leitura.
- **No kit, toda frase técnica em inglês contém uma frase provada da seção "Provas"** (`launch-kit.test.ts`, § 205). Frase nova sobre envio, offline, navegador, anúncio, Analytics, cookie, conta, lote ou memória precisa de prova, ou sai.

## F6: português e espanhol

Como uma página ganha versão em pt e es:

1. Imagem e PDF: o caminho entra na tabela `TRANSLATED_PATHS` de `src/i18n/routes.ts` (slug sem acento, glossário), o texto em `src/tools/<slug>/i18n/{pt,es}.ts` (o mesmo tipo do inglês, as mesmas chaves e `{placeholders}`), o cartão em `src/i18n/{pt,es}/common.ts` e o arquivo `src/pages/<lang>/<slug>/index.astro` com o molde da página inglesa e `lang`. O `CommonTexts` exige todas as ferramentas nos três idiomas.
2. Dinheiro em espanhol: o bloco `es` na linha do `CALC_PAGES` (caminho, `file`, `next` e `related` só entre páginas do espanhol). A definição, o motor e as fixtures são os do inglês.
3. Uma calculadora brasileira: o caso no `scripts/oracle/calc_br.py` e as fixtures num commit antes de tudo; o id `br-*` em `BR_CALC_IDS` e `BR_CALC_PAGES`, em `ENGINES`, em `DEFS` (`src/tools/calc/defs/br.ts`) e em `CALC_EVENT_TOOLS`; o texto em `src/tools/br-<slug>/i18n/pt.ts`; a rota sai de `brMoneyRoutes()`.

Formato de cada idioma (docs/i18n/, DECISOES § 213 a § 223):

- inglês e espanhol escrevem "1,234.56" e "2.4 MB"; o espanhol põe espaço sem quebra antes do "%" ("68 %"); português, "1.234,56", "2,4 MB" e "R$ 1.234,56". Datas por extenso pelo `src/i18n/dates.ts`. Nada de `Intl` no que a página mostra.
- CSV: vírgula e ponto em inglês e espanhol; ponto e vírgula e vírgula decimal em português; BOM nos três. PDF do relatório em Letter (en, es) e A4 (pt, `paper: 'a4'`).
- O nome do arquivo baixado vem dos textos (`panel.suffix`, `files`), e as palavras da numeração do PDF também (`pageWord`, `ofWord`); em inglês, os bytes de antes.

Pegadinhas que a F6 achou:

- **O `lint:texto` do português reprova nome de opção depois de vírgula** ("Espaço pega a linha, ... e Espaço solta" deu `UPPERCASE_AFTER_COMMA`) e "não entram imposto" (`NON_IMPERSONAL_VERBS`). Ponha o nome entre aspas ou escreva "a tecla Espaço", "a opção Clara", "ficam de fora".
- **O CFPB tirou do ar o `consumerfinance.gov/es/` em julho de 2026**: toda URL dali redireciona para o inglês. As páginas em espanhol citam os PDFs em espanhol de `files.consumerfinance.gov` e, onde não há, a página em inglês com "(en inglés)".
- **Os moldes de PDF e de dinheiro e os hubs recebem `lang` com o padrão `'en'`**, porque testes antigos os renderizam sem idioma. `.map(cardOf)` passa o índice como segundo argumento: escreva `.map((id) => cardOf(id, lang))`.
- **O `gate:seo` pede de 120 a 160 caracteres na descrição** das páginas de imagem e de PDF em pt e es (as outras, de 50 a 170). Tradução fica mais longa: rode o portão depois de mudar uma descrição.

## Ajuste: idiomas

O QR code e os 10 guias de arquivo existem em en, pt e es; o dinheiro dos EUA (14 calculadoras, 4 presets, 5 guias e o hub) em en e es. Casa e saúde seguem só em inglês até o gatilho da § 273 (a escolha para ele está na § 319), e nenhuma página de dinheiro dos EUA existe em pt (DECISOES § 308).

Como uma página ganha versão num idioma:

- **Uma calculadora ou um preset em es:** o bloco `es: { path, file }` da linha do `CALC_PAGES` é obrigatório (o compilador reprova a falta); os chips, as relacionadas, a mãe e o guia são os do inglês (§ 311). O texto vai em `src/tools/<slug>/i18n/es.ts` (ou `presets/<nome>/i18n/es.ts`), com o tipo, as chaves e os `{placeholders}` do inglês, e o cartão em `src/i18n/es/common.ts` (`calcs`). A página é `src/pages/es/<caminho>/index.astro` com `<CalcTool id lang="es" />`. Não existe mais `ES_CALC_IDS`: as páginas em es são `CALC_PAGE_IDS` por `moneyPage(id, 'es')`.
- **Um guia de dinheiro em es:** `GUIDES[id].es.path`, o texto em `src/i18n/es/guide-<slug>.ts` (`GuideTexts<'guides-<slug>'>`) com o campo `words` (cabeçalhos da tabela e as palavras dos fatos, § 313), o import estático dele no `GUIDE_TEXTS` de `src/tools/calc/guides.ts` (o `lint:texto` importa esse módulo pelo Node, então nada de `import.meta.glob` ali) e `<GuideView id lang="es" />`.
- **Um guia de arquivo em pt ou es:** o slug em `SLUGS` de `src/tools/guides/registry.ts` (`FILE_GUIDES[id].paths`), o texto em `src/i18n/<lang>/guide-<slug-em-inglês>.ts`, o cartão em `common.fileGuides` e a página `src/pages/<lang>/guias/<slug>/index.astro` (o molde do inglês com `lang`: a ferramenta de imagem com `<XxxPage slot="tool" lang embed />`, a de PDF só com `<FileGuideView id lang />`).
- **O formato dos guias de arquivo** é do `src/tools/guides/measured.ts` (`GuideFormat`): separadores, "%", U+00A0 entre número e unidade em pt e es, "vezes/veces" (`times`, `timesOne`) e as contagens por extenso de `src/i18n/<lang>/file-guides.ts`. `{x_word}` é masculino e `{x_wordf}` feminino, pelo substantivo no idioma (§ 314); a tabela `FEMININE` do `guides-numbers.test.ts` diz quais contagens são femininas, e muda junto com o texto. Palavra inglesa do `data/guides-measured.json` que aparece numa página vai em `measuredTerms`, com a chave igual ao inglês: sem ela o build para.
- **O QR em outro idioma:** o texto em `src/tools/qr-code-generator/i18n/<lang>.ts` (`QR_TEXTS` no `page.ts`), o nome dos arquivos em `panel.file` (sem acento), o cartão `qr`, a coluna `footer.utilityColumn` e a categoria `search.utilityCategory` do `common.ts`, a seção `qr` da home e a frase de privacidade do `gate:conteudo` por idioma.
- **Os testes que leem os registros** pegam a página nova sozinhos; os de lista à mão que cresceram nesta run estão no relatório (`docs/relatorios/ajuste-idiomas.md`).

Pegadinhas que o ajuste achou:

- **O CSV não leva espaço sem quebra:** o `csvCell` cola o "%" ao número em toda célula de texto; a tela e o PDF guardam o espaço da § 213.
- **Uma palavra inglesa do `data/guides-measured.json` sem `measuredTerms`** no texto de pt ou es para o build com o nome da palavra. É de propósito: sem a chave, a página mostraria inglês.
- **Datas:** o `guias:medir` grava o dia em UTC, e a revisão e a publicação das páginas novas ficaram num dia só, 3/nov/2026, que é o UTC da medida e o dia de Brasília da revisão (§ 312). A data de uma página nova nunca fica antes do `measuredOn`.
- **O LanguageTool lê "for" como verbo dentro de uma frase em português** ("Meta for Developers" deu erro de concordância): nome próprio inglês no meio da frase vai traduzido ou com "(em inglês)".
- **A documentação da Apple em `/la/` tem o título em inglês** e o texto em espanhol; a de `/br/` tem o título em português. O rótulo da fonte segue o título que a página mostra (§ 321, R2-06).

## F9: CI e repositório público

Pegadinhas que a F9 achou:

- **Até um comentário em `scripts/guides/` muda o SHA-256** que o `tests/unit/guides-measured.test.ts` confere contra o `data/guides-measured.json`: a F9 trocou um comentário do `scripts/guides/lib/browser.ts` e o teste reprovou. Mexer ali pede o `pnpm guias:medir` de novo; para só atualizar uma referência num comentário, deixe como está.

## F10: textos dos protótipos

- **Os textos em pt e es dos protótipos de `docs/propostas/ux-v2/` não passam pelo `lint:texto`,** que só lê os arquivos de tradução do site. A run que construir um item copia os textos da especificação para os arquivos de tradução e passa o glossário (`docs/i18n/`) e o LanguageTool lá.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- O texto de uma especificação da F10 não passou pelo glossário: a nota do hub de guias em pt dizia "hipoteca", que a tabela Nunca de `docs/i18n/pt.md` proíbe, e o `glossary.test.ts` reprovou o arquivo de texto e a página do `dist/`. Antes de copiar um texto da proposta, confira a tabela Nunca do idioma (F11: virou "financiamento imobiliário").

## F12: monetização

Pegadinhas que a F12 achou nos textos da parede e do café (DECISOES § 431 e § 441).

- **A especificação da F10 não passou pelo glossário:** a nota do Brave em espanhol dizia "móvil", que a tabela Nunca de `docs/i18n/es.md` proíbe; ficou "celular". Texto copiado de um protótipo passa pelo `glossary.test.ts` e pelo `lint:texto` como qualquer outro.
- **Nenhum texto da parede ou do café diz "click", "clique" ou "clic"**, sem diferença de maiúscula, os passos da ajuda dos bloqueadores inclusive (os testes da parede e do café têm a lista). Os passos dizem "Toque", "Abra", "Escolha".
- **O nome de um menu de outro produto, em pt e es,** vem da tradução do próprio produto: as do AdBlock estão em `github.com/betafish-inc/adblock-releases` (`_locales/<idioma>/messages.json`). As páginas da Apple não devolvem o texto do artigo ao WebFetch; o que não deu para conferir foi para o grupo 21 do `docs/PENDENCIAS.md`.
- **O `lint:texto` numa worktree sem baixar nada:** suba o LanguageTool do `.cache` do checkout principal numa porta própria e aponte o `LANGUAGETOOL_URL` para ela; a 8081, a padrão, pode colidir com outro agente.

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **A contagem nos textos (§ 540):** a Sobre e os Termos levam `{image}`, `{pdf}`, `{money}`, `{life}`, `{brazil}` e `{spanish}`, que o `AboutView.astro` e o `LegalView.astro` preenchem pelo `countValues(lang)` de `src/components/tool-count.ts`. O `lint:texto` lê esses arquivos com as amostras `COUNT_SAMPLES` do `scripts/gates/lint-texto.ts`; um número novo na contagem pede a amostra nova, e o `tool-count.test.ts` confere que as amostras são as do módulo.
- **As datas curtas (§ 543):** `shortDate` e `mediumDate` do `src/i18n/dates.ts` são à mão, como o `longDate` (§ 112), e o `dates-short.test.ts` as compara com o `Intl` do Node em dois anos inteiros. O mês abreviado do espanhol é o do CLDR: "sept", não "sep".
- **As amostras novas do `lint:texto`** (`scripts/gates/lint-texto.ts`): `label` e `value` (o "Last result that worked: {label} {value}.") nos três idiomas, e `extras` em es (o total do bloco de custos, que o `lint-texto-money.test.ts` pede para os textos novos em espanhol).
- **O `lint:texto` preenche o placeholder desconhecido com o próprio nome, e o `{name}` com "Victor":** "nuestra {link}" virou "nuestra link" (erro de concordância em es), e um texto de link "página {name}" virou "página Victor" (erro de gênero em pt). Deixe o artigo e o substantivo fora do placeholder e ponha no link só o nome próprio ("nuestra página {link}", com o nome da ferramenta no link; DECISOES § 562).
- **Placeholder novo num texto de guia de arquivo** precisa estar no `globals()` do `src/tools/guides/measured.ts`, nos `facts` do guia ou no JSON: o "hold every placeholder of every guide text" do `guides-measured.test.ts` reprova o resto. As datas do histórico (`{published}` e `{measured}`) entraram no `globals()`; por isso as datas dos guias moraram para o `registry.ts` (o `page.ts` usa o `import.meta.glob`, que o Node do `lint:texto` não roda).
- **A dobra dos guias depende do texto próprio de cada um:** a trilha de três linhas e o H1 de três ou quatro linhas (no WebKit, com as faces de reserva) são o que mais pesa, e eles não são da página. O que cabe ajustar é a pergunta (`lead`) e o título da ferramenta (`toolHeading`, ao lado da Oli, com 232 px a 360): o `guide-page.spec.ts` mede os 30 com a fonte e, por idioma, com as fontes abortadas. Um texto novo ou mais longo num guia passa por ele (DECISOES § 564).
- **O `fileSize` põe um espaço sem quebra entre o número e a unidade** ("9.3 MB"), e o `dollars` do pt também ("R$ 284.596"): um teste que compara com texto digitado normaliza o ` ` antes. O `lint:texto` lê os `{placeholders}` da home como palavras ("photos fotos de celular", "n ferramentas"): só avisos; nenhum erro de gramática nos três idiomas.

## F17: AVIF para JPG e Converter para WebP

- **O LanguageTool 6.6 não protege o artigo antes de uma sigla:** "Victor is a AVIF file." não dá match nenhum, nem com o AVIF escrito na frase; a regra `EN_A_VS_AN` só acusa palavras que conhece ("a apple", "a avif" minúsculo, "a MRI"), e mesmo então o match vem como `misspelling`/`MISC`, que o `lint:texto` conta como aviso. A pegadinha "'a AVIF' passa se a amostra do placeholder não for AVIF" é só metade: passa sempre. Artigo antes de sigla se prova com teste de frase exata (o `image-texts.test.ts`, a matriz), e a frase leva o formato escrito, sem `{format}` (§ 708).
- **O `lint:texto` numa worktree:** suba o LanguageTool do checkout principal com o Java de lá, de dentro de `…/.cache/languagetool-6.6/LanguageTool-6.6`, em segundo plano (`…/.cache/jre-21.0.13+9/jdk-21.0.13+9-jre/bin/java.exe -Xmx1g -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8093`), e rode `LANGUAGETOOL_URL=http://127.0.0.1:8093 pnpm lint:texto`.
- **Uma descrição no limite do `gate:seo`:** a de pt do Converter para WebP tem 160 caracteres, o máximo; qualquer mudança nela precisa encurtar outra parte.

## F18: ferramentas novas que passaram na regra

- **O LanguageTool de es lê "quita" antes de um substantivo como adjetivo** ("quita páginas", "quita metadatos": `AGREEMENT_ADJ_NOUN`); com o artigo ("quita las páginas", "quítales los metadatos") passa.
- **O LanguageTool de en lê o nome curto de uma página como sujeito plural:** "Extract pages gives one PDF…" cai no `AGREEMENT_SENT_START_2` ("pages gives"); com o nome inteiro ("Extract pages from PDF gives…") passa. E "Form fields on the pages you keep stay." cai no `KEEP_SEEING` ("keep stay"); "Form fields stay on the pages you keep." passa (§ 736).
- **A busca junta os termos dos três idiomas:** um sinônimo de es (como "organizar páginas" num cartão) empata com o nome de outra página em pt e toma a busca dela pela ordem do índice. Antes de pôr um sinônimo, confira que ele não é o nome inteiro de outra página em idioma nenhum (§ 180 e § 724).
- **Uma medida nova dos guias sobe só a revisão** (a ressalva à pegadinha da F5b acima, "O `GUIDE_REVIEWED` e o `GUIDE_PUBLISHED` … nunca ficam antes do `measuredOn`"): o `GUIDE_REVIEWED` e o `GUIDE_REVIEWED_ON` de pt e es vão para o `measuredOn`; o `GUIDE_PUBLISHED` e o `GUIDE_PUBLISHED_ON` ficam no dia da primeira versão de cada idioma, e a linha do histórico diz o dia da medida ("The numbers were measured again on {measured}.", "Os números foram medidos de novo em {measured}.", "Los números se midieron de nuevo el {measured}."). As quatro constantes estão em `src/tools/guides/registry.ts` desde a F13b (§ 558; a pegadinha da F5b diz `page.ts`, a história de então), com o comentário que diz isso. O `guides-measured.test.ts` reprova a publicação depois da revisão, e o `guide-page.test.ts` reprova o histórico sem a data da medida (§ 733).

## F19a: Novidades, datas e um fato, um lugar

- **Toda run que muda o que a pessoa vê acrescenta a entrada dela no fim do `src/platform/changelog.ts`**, com `pr: null` e o dia da run em Brasília, e o texto dela em `src/i18n/{en,pt,es}/whats-new.ts` (título de até 60 caracteres sem ponto final, de uma a três frases, sem dígito e sem exclamação). Antes, troca o `pr: null` da entrada anterior pelo número da PR dela (e pelo dia do merge, com a tolerância de um dia): só a entrada mais nova pode ficar sem `pr` (DECISOES § 757). Uma entrada nova não precisa nomear a Novidades: o `lastmod` dela é o da entrada mais nova que ela mostra (§ 756).
- **`conteudo` ou `site`:** `site` é só o que é de todas as páginas (Menu, tema, rodapé, aviso de cookies, assinatura, quadro do autor); se a mesma mudança também muda o texto de uma página (a Privacidade, por exemplo), a entrada é `conteudo` com essa página (§ 768).
- **Nomear um `RouteId` numa entrada é o nascimento da página** em cada idioma da `langs` da entrada: para uma página que ainda não existe num idioma, use um grupo `all:<grupo>`, que só alcança as páginas já nascidas (§ 751). Uma mudança só em inglês que muda a Privacidade ou os Termos dos três idiomas pede uma entrada própria dos três idiomas (§ 755). O `node .cache/f19a/check-births.ts` não fica no Git: o `changelog.test.ts` faz a mesma conta contra o git.
- **Um fato, um lugar** (§ 764 e § 765): nas páginas de ferramenta, preset, calculadora e QR code, cada fato da lista do `scripts/lib/repeticao.ts` mora num bloco só (o mapa da § 764), e duas frases de 8 palavras ou mais com Dice de bigramas de 0,45 ou mais em blocos diferentes reprovam no `gate:conteudo`. Cada pergunta do FAQ é um bloco. Os passos dizem só a ação; a privacidade, uma ou duas frases com o link "Como conferir" do molde; o FAQ, o porquê, o caso de borda e o "e se". Texto novo numa dessas páginas passa pelo `gate:conteudo` antes do commit, e um padrão que acusa uma frase que não diz o fato se corrige no padrão (com a frase negativa no `repeticao.test.ts`), nunca no texto.
- **As premissas das calculadoras não mudam para cortar repetição:** o `panel.premises` é também o PDF exportado; quem cede é a resposta do FAQ ou a frase da fórmula (§ 767).
- **Pegadinhas do `lint:texto` desta run:** em en, "unlock" fora do nome "Unlock PDF" reprova o `routes.test.ts`, e "Image tools now says" cai no `AGREEMENT_SENT_START_2` (diga "The Image tools page"); "…on FileOrca, newest first, with…" cai no `THE_SUPERLATIVE`; em pt, "não são aconselhamento" cai no `LINKING_VERB_PREDICATE_AGREEMENT`; em es, "Acerca de dice" cai no `PREP_VERB`. Um placeholder desconhecido (`{whatsNew}`) vira a palavra "whatsNew" para o LanguageTool: só aviso de ortografia.
- **Os links dos textos jurídicos** são o endereço `https://fileorca.com/…` cru, que o `RichText` da `LegalView` transforma em link (§ 759).
- **O `findClaims` pega "number one" e "works best"** num texto de ferramenta: reescreva a frase, não o padrão.

## F19b: guias novos com dado próprio

Como acrescentar um guia de arquivo, desde a F19b (o roteiro da F5b continua; isto é o que mudou):

1. O id em `FILE_GUIDE_IDS`, a entrada em `FILE_GUIDES` (a ferramenta, o hub, até 6 relacionadas que existam nos três idiomas, sem a ferramenta embutida), o `TOOL_SECTION`, os `SLUGS` de pt e es (pelos glossários) e o dia do guia no `OWN_DAY` de `src/tools/guides/registry.ts`: o dia em UTC da medida, que é também o da revisão e o da primeira publicação nos três idiomas (DECISOES § 778). Os dez primeiros seguem com o `GUIDE_REVIEWED_ON` e o `GUIDE_PUBLISHED_ON`. Leia os dias de um guia por `reviewedOn(id, lang)`, `publishedOn(id, lang)` e `measuredOf(id)`, nunca pelo `measuredOn` do arquivo, que é só o mais novo deles.
2. O registro entra antes da medida, com um esboço no `PLANS` e no `BUILDERS` (os dois são `Record<FileGuideId, …>`): o `pnpm tipos` fica verde, e o build e o `lint:texto` param no guia com "<id>: no measured file in data/guides-measured.json". Faça o `pnpm build` verde antes do registro, guarde o `dist/` e meça o guia novo nele.
3. A medida: `pnpm guias:medir --only <id>` mede um guia que o arquivo ainda não tem e guarda os outros como estavam; um guia que o arquivo já tinha nunca sai (§ 795). O commit do JSON vem antes do texto. Depois, o `--check` inteiro com 0 diferença e a prova de que os guias de antes ficaram iguais byte a byte (só `script`, `commit` e `measuredOn` mudam no topo do arquivo).
4. Os textos de en, pt e es com os placeholders. O título começa pelo nome do cartão e não leva " | FileOrca": o `pageTitle` acrescenta a marca, e o `gate:seo` reprova a marca duas vezes no fim de qualquer título (§ 780). A linha do guia na tabela `FEMININE` do `guides-numbers.test.ts` entra no mesmo commit do texto de pt e es; duas frentes que a acrescentam no fim do bloco dão conflito, e a resolução é manter as duas.
5. Os specs: o caso em `CASES` do `tool-guides.spec.ts` e no `USE` do `guide-page.spec.ts` com o fluxo real da ferramenta (`tests/e2e/lib/guide-flows.ts`: a assinatura digitada e a senha duas vezes no `prepare`; o que a ferramenta mostra ao abrir no `opens`; o que nenhum pedido pode levar no `typed`). Uma ferramenta que espera assinatura ou senha não faz nada se o caso só soltar o arquivo, e o teste do CLS do uso espera o Baixar por 60 s. O `SPEC_N` (arquivos) ou o `SPEC_TEXTS` (textos) do `guides-card.test.ts`, contados à mão pelo plano; e, se a tabela agrupar pela primeira coluna, a lista dos agrupados do `guide-page.test.ts`.
6. Todo guia novo passa no `gate:conteudo` com a regra de repetição dos guias (os blocos `data-guide-text`; frases de 8 palavras ou mais com Dice de 0,45 ou mais entre quaisquer dois; os `GUIDE_FACTS`, o envio, o aparelho, os números da calculadora e a privacidade do texto do QR, num bloco só) e nas 800 a 1.500 palavras. Os 15 guias de antes estão no `GUIDES_BEFORE_F19B` (`scripts/lib/repeticao.ts`) e ficam fora das duas regras até alguém corrigi-los (§ 792).

Como acrescentar um guia de dinheiro:

1. O id em `GUIDE_IDS` e a entrada em `GUIDES` de `src/tools/calc/registry.ts` (o caminho de es, a calculadora, as relacionadas), o `guide` da calculadora e o dia no `GUIDE_OWN_DAY` de `src/tools/calc/page.ts` (a revisão, a primeira publicação e a leitura das fontes, o dia da run em Brasília).
2. Os casos no `scripts/oracle/calc.py`, com o `source` `guide:<slug>`: o exemplo é o da calculadora ao abrir (`DEFS[calc].initial`), e toda outra entrada que o guia cita também é um caso, listada no `GUIDE_INPUTS` de `src/tools/calc/guides.ts` (o `calc-guides.test.ts` reprova uma que não for). As fixtures e o hash num commit antes dos textos (DECISOES § 787).
3. O texto mínimo nasce com duas partes, ou com dois parágrafos na primeira: com uma parte de um parágrafo, a `GuideView` não acha a marca do 1º anúncio, e o build para com "mapa de anúncios: 5 marca(s) antes da do 1º anúncio; nenhuma marca do 1º anúncio" em toda frente que construir (§ 795).
4. Os blocos de texto do guia levam `data-guide-text` na `GuideView` (o topo, a introdução, o parágrafo da calculadora, as partes, o parágrafo antes da tabela, a fórmula, as premissas, o exemplo e o aviso). O `checkMoneyGuide` do `gate:conteudo` pede de 800 a 1.500 palavras deles, sem enchimento, e a repetição vale como nos guias de arquivo; os cinco de antes ficam fora (§ 792).
5. Nenhum algarismo à mão, nem na fórmula ("÷ the months in a year", "a twelfth of") nem nos rótulos das fontes: o `guides-numbers.test.ts` só lê os guias de arquivo, e nos de dinheiro a regra se segue à mão. Toda frase de direção ("never below", "the smallest step") é uma que o `it` do guia no `calc-guides.test.ts` prova; o resto fica de fora.
6. Nenhum título de parte igual ao `calcHeading`, e o `tableHeading` diferente do `tableCaption`: o axe reprova o `landmark-unique` (duas regiões com o mesmo nome, porque o `tableCaption` nomeia a região rolável da tabela).
7. O es usa o mesmo conjunto de placeholders do en (o `calc-guides.test.ts`), o "$" colado ("$95,000", o glossário e o `dollars(…, 'es')`, nunca "US$") e, com uma porcentagem, "por encima de" no lugar de "más" ou "menos" (o `CLAIMS_BY_LANG.es` lê "0.13 % más" como promessa de ganho).

O guia do QR code (DECISOES § 786 e § 794):

- O grupo Utilidades (`hub: 'utilities'`, grupo `util`, a cor lima) entra no hub e no rodapé só onde o idioma tem um guia dele (`shownGroups`); a home não ganha cartão de Utilidades (§ 398).
- A amostra é de textos feitos pelo script (`textSample` em `scripts/guides/lib/record.ts`, `{ kind: 'texts', texts, count }`), só num guia do QR; o cartão diz "Measured on N test texts"; um guia mede arquivos ou textos, nunca os dois.
- O aviso de cookies e o cartão OG do guia dizem o selo do QR (o texto, não o arquivo); a área de anúncio vem da rota (`QR_AREA`, `utilidades`, com 2 anúncios de conteúdo no máximo).
- A página passa `<QrTool slot="tool" lang embed />`: o `QrTool.astro` guarda o único `<script>` e escolhe o `QrEmbed.astro` ou o `QrPageMold.astro`; a página do QR e os guias carregam os mesmos 2 arquivos.
- O `toolHeading` do guia tem duas linhas a 360 px (232 px ao lado da Oli): a Oli do painel do QR sobe 86 px (a do slot de imagem, 78), e com uma linha ela cobre a ficha "O que medimos" (`guide-page.spec.ts`).
- Nos specs, o caso digita o texto (`input`) em vez de soltar arquivo, e o painel não tem chips depois do resultado (`noChips`).

Pegadinhas que a F19b achou:

- **A qualidade de um JPG que a página não mostra** se lê nas tabelas de quantização da saída (só os segmentos antes do primeiro SOS: a miniatura Exif tem DQT própria, dentro do APP1), comparadas com as do `encodeJpeg` do motor no Node em cada qualidade de 40 a 90. Só um casamento exato e único vira número; sem ele, a qualidade sai do guia (§ 781).
- **O qpdf do motor guarda as opções globais entre execuções:** um Proteger PDF depois de um Comprimir PDF na mesma instância herda o `--compression-level=9` e escreve outros bytes, e o `--check` inteiro (que mede todos os guias num processo) diverge do `--only`. Meça o Proteger e o Desbloquear num processo Node próprio (`lockFresh`, `scripts/guides/lib/lock-child.ts`, com a senha pelo ambiente) (§ 784).
- **O nome de um placeholder também passa pela voz:** o `checkVoice` do `guides-numbers.test.ts` lê `{unlockedPages_word}` e reprova o "unlock" (`FORBIDDEN_WORDS`), mesmo que a página não diga a palavra. Use um placeholder de mesmo valor com outro nome (`{ownerPages_word}`).
- **A busca mostra toda ferramenta antes de todo guia** (`groupEntries`, § 397): um nome de guia cujas palavras estejam todas nos termos de uma ferramenta ("APR o APY": o "o" de "calculadora") nunca vem primeiro. Em cada idioma, o nome do guia precisa de uma palavra que nenhuma ferramenta tenha nos termos (os três idiomas juntos), e a conferência é na ordem da tela, `groupEntries(filterEntries(…))`, não só no `filterEntries` (§ 790).
- **Um sinônimo de uma palavra só igual a uma consulta** ("jpeg") põe o guia com closeness 0 nela e o tira da ordem da consulta irmã ("jpg"): use uma frase ("webp or jpeg"). E um sinônimo de outra página igual ao nome inteiro de um guia novo empata com ele: troque o nome do guia antes de tirar o sinônimo antigo (§ 724 e § 790).
- **Contagem por extenso escrita à mão em título de tabela, legenda ou título de parte** ("Three PDFs…", "Two kinds of signature", "When two people have to sign") é número à mão, e nenhum teste lê esses campos (o título e a legenda das tabelas não passam pelo preenchimento): reescreva sem contar ("Our photos in each format", "When more than one person has to sign").
- **O `lint:texto` de uma frente quando os textos das outras ainda não se preenchem:** `LINT_TEXTO_BASE=<commit de partida da frente>` lê só os arquivos que ela mudou.
- **O LanguageTool desta run:** em en, "100,000 bytes or less" (`FEWER_LESS`: "no larger than"), "a smallest size" (`THE_SUPERLATIVE`), "interest by fixed payment" (`INTERESTED_BY`), ", so it can…" (`NO_COMMA_BEFORE_SO`), "millimetres" (inglês britânico: o site escreve "millimeters") e a nota "Measured on {date} through…", que pede a vírgula depois da data (`MISSING_COMMA_AFTER_YEAR`, aviso); título, descrição e H1 começando pela mesma palavra dão `ENGLISH_WORD_REPEAT_BEGINNING_RULE`. Em pt, "X e Y parecem proteção" (`LINKING_VERB_PREDICATE_AGREEMENT`), "PDFs de teste protegidos" e "PDFs de teste fechados" (`GENERAL_NUMBER_AGREEMENT_ERRORS`: escreva "os PDFs de teste que protegemos"), uma lista de navegadores sem artigo depois de vírgula (`UPPERCASE_AFTER_COMMA`: "o Chrome 85, o Edge 121…") e "mais à frente que". Em es, "…el de antes, contada byte por byte" (`AGREEMENT_PARTICIPLE_NOUN`) e "Suelta imágenes" (`AGREEMENT_ADJ_NOUN`: "Suelta tus imágenes", como a página da ferramenta).
- **"más adelante" é texto provisório para o `gate:conteudo`** (a lista `PLACEHOLDERS` de `scripts/lib/conteudo.ts`): em es, "por delante de".
- **Uma página oficial que o WebFetch não lê:** o EUR-Lex devolve corpo vazio, e uma porcentagem que só está numa imagem (a tabela da correção de erros da Denso Wave) não vem no texto. Leia no navegador embutido, só navegação e leitura (`document.body.innerText`, ou a imagem na tela), registre a leitura num arquivo do `.cache/` e diga no § como foi lida; se a regra da frente pede o número no texto lido, ele fica de fora. Uma página atrás de verificação contra bots (`travel.state.gov`) não se contorna: o fato sai e vira pendência.
- **Um PDF oficial** (o kit do CFPB, o relatório dos cartões, o folheto do Fed) se baixa pelo WebFetch e se lê pelo PDF.js do próprio projeto (um `pdftext.mjs` no `.cache/`, com os cMaps para o texto em espanhol); o rótulo diz "(PDF)" e a página impressa que sustenta o fato vai no §. Leia a URL localizada antes de citar a inglesa: o MDN, o qrcode.com, o qpdf e o NIST não têm pt nem es (404), e o rótulo leva "(em inglês)" / "(en inglés)".
- **Um `*Page.astro` dentro de `src/tools/<ferramenta>/` vira página de ferramenta de imagem** para o `ads-pages.test.ts` (o glob `src/tools/*/*Page.astro`): o molde da página do QR se chama `QrPageMold.astro`.
- **A dobra dos guias de dinheiro não tem spec:** o `guide-page.spec.ts` lê só os guias de arquivo ("No tests found" pelo caminho de um guia de dinheiro). Meça num spec de rascunho no método do `layout-shift.spec.ts` (a Figtree presa até a primeira pintura), a 320, 360, 375, 393 e 412 px, nos dois navegadores; um parágrafo do topo que troca de linha quando a Figtree chega dá CLS (0,004 a 0,009 nas primeiras versões dos guias 6 a 8). Meça as alturas de cada candidato com a Figtree e com as faces de reserva e fique com o texto que tem a mesma altura nas duas (§ 801 a § 803).
- **Um controle negativo com uma contagem escrita à mão** ("15 guides … measured" no `launch-kit.test.ts`) deixa de reprovar quando uma contagem do site chega ao mesmo número: use a contagem do registro e confira antes que ela é diferente da outra.
- **O cache do Vitest com páginas novas:** toda frente apagou o `node_modules/.vitest-cache` antes do Vitest, porque os testes que leem o `dist/` e o `import.meta.glob` acham as páginas novas só sem o cache de antes (a pegadinha da F17, no `windows-git-bash.md`).
- **O U+00A0 dos fatos de pt e es** (entre o número e a unidade, "0,254 mm") foi gravado por script, não pela ferramenta de escrita, e conferido com `grep -c $'\xc2\xa0'` (a pegadinha do `windows-git-bash.md`).
