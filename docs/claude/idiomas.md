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
