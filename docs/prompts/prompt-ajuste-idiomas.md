# Ajuste idiomas: o resto do FileOrca em português e espanhol (menos casa e saúde)

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode o ajuste "idiomas" do FileOrca: leve para português e espanhol o que hoje só existe em inglês, menos casa e saúde. Ao terminar, estão no ar, indexáveis e com par no hreflang:

- o gerador de QR code em pt e es;
- em espanhol, o resto do dinheiro dos EUA: as 9 calculadoras que faltam, os 4 presets e os 5 guias de dinheiro, todos no hub `/es/calculadoras-financieras/`;
- os 10 guias de arquivo em pt e em es, listados nos hubs de imagem e de PDF de cada idioma.

São 40 páginas novas: 2 do QR, 18 do dinheiro em es e 20 guias. A home, o rodapé, a busca e o 404 de pt e es levam a elas. Nenhuma conta e nenhuma medida muda: cada página nova mostra os mesmos números da página em inglês, no formato do idioma.

Nada é enviado nem publicado. O `pnpm verificar` fica verde na sua máquina e em todas as partes do CI. Tudo vai numa PR da branch `ajuste-idiomas`, com o relatório. Se a PR não mexer em `.github/workflows/`, o CI a mescla sozinho quando ficar verde. Se mexer (decisão 9), o merge é do Victor.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, e o shell é o Git Bash. O CI roda em Ubuntu.

A main está em `1c2cb0e`, com a F8 mesclada, ou num commit mais novo. Confira com `git log --oneline -5`.

O que existe hoje (§ 58, F6 e F7):

| | en | pt | es |
| --- | --- | --- | --- |
| Imagem (8 ferramentas, 3 presets, hub) e PDF (12 ferramentas, hub) | sim | sim | sim |
| Dinheiro | 14 calculadoras, 4 presets, hub e 5 guias | 8 calculadoras próprias do Brasil e o hub delas, sem par | 5 calculadoras (hipoteca, empréstimo pessoal, cartão, dívidas, juros compostos) e o hub |
| 10 guias de arquivo | sim | não | não |
| QR code | sim | não | não |
| Casa e saúde (11 calculadoras, 2 hubs) | sim | não | não |

O que esta run reaproveita (leia o código antes de planejar):

- **O caminho de uma página em pt e es** (`CLAUDE.md`, F6, "Como uma página ganha versão em pt e es"; § 218):
  - o `TRANSLATED_PATHS` e os construtores de rota em `src/i18n/routes.ts`;
  - os textos por idioma e os tipos de `src/i18n/types.ts`. Hoje eles deixam `qr`, `guides` e `fileGuides` opcionais em pt e es e os exigem em inglês.
- **O dinheiro em espanhol** (F6, decisão 6; § 213 e § 222):
  - o bloco `es` de cada linha do `CALC_PAGES`, o `ES_CALC_IDS`, o `HOME_MONEY_IDS` e o `HUB_MONEY_IDS`, em `src/tools/calc/registry.ts`;
  - o `moneyRoutes()`;
  - a definição, o motor, as fixtures e o exemplo, que são os do inglês.
- **Os guias de dinheiro:**
  - o `src/views/GuideView.astro`, com `lang: 'en'` no tipo;
  - o `src/tools/calc/guides.ts`, que formata os números com `'en'` fixo;
  - o `GUIDES` do registro. Cada guia embute uma calculadora ou um preset com o exemplo do guia.
- **Os guias de arquivo** (`CLAUDE.md`, F5b; § 184 e § 185):
  - o `src/views/FileGuideView.astro`, com `const lang = 'en'`;
  - o `src/tools/guides/`:
    - o `registry.ts`;
    - o `measured.ts`, com as palavras de número (`WORDS`), a data em inglês e `fileSize(…, 'en')`;
    - o `page.ts`, com `enCommon` e `'en'` fixos;
  - o `data/guides-measured.json` e o `fileGuideRoutes()`;
  - o `tests/unit/guides-numbers.test.ts`, com a regra dos números e a lista `GENERAL`.
- **O QR code** (§ 271 e § 272): o `src/tools/qr-code-generator/` (o `QrTool.astro` e o `page.ts` têm `'en'` fixo), o `tests/unit/qr.test.ts` e o `tests/e2e/qr-code.spec.ts`.
- **O texto por idioma:**
  - o glossário em `docs/i18n/pt.md` e `docs/i18n/es.md`. O `glossary.test.ts` lê a seção "Nunca" de cada um;
  - o `src/i18n/dates.ts` e o `src/i18n/format.ts`;
  - o `lint:texto`, com as amostras dos placeholders (§ 123 e § 269).
- **Os portões e os testes que leem os registros:**
  - o `gate:seo`: a descrição tem de 120 a 160 caracteres nas páginas de imagem e de PDF de pt e es, e de 50 a 170 no resto;
  - o `gate:links`, o `gate:conteudo`, o `gate:prontidao` e o `gate:dinheiro-saude`;
  - os specs `a11y`, `ads`, `budgets`, `i18n-budgets`, `calc-form`, `design` (o reflow em blocos, § 306), `layout-shift`, `tool-guides`, `qr-code` e `navigation`;
  - os testes de unidade `routes`, os `seo-*`, `launch-kit` e `verificar`.

O CI na última execução verde da F8 ([41548317129](https://github.com/vmatusita/fileorca/actions/runs/41548317129), commit `c999692`), pelo total do `verificar` de cada parte:

- `verificar` (`--sem-playwright`): 674,8 s;
- Chromium, 4 partes: 561,6 s, 394,4 s, 465,2 s e 436,5 s;
- WebKit, 10 partes: 454,1 s, 561,4 s, 446,7 s, 375,2 s, 305,5 s, 215,4 s, 522,2 s, 275,4 s, 663,3 s e 376,7 s.

A F6 somou 63 páginas em pt e es, e duas partes do Chromium passaram de 700 s (§ 243). Esta run soma 40.

O repositório é privado, no GitHub Free, com 2.000 min de Actions por mês, e cada execução do CI roda 15 partes. O `pnpm verificar` inteiro passa de 900 s nesta máquina (§ 242): rode as partes do CI em sequência, como a F8 fez.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da run e vence o resto.
2. O `CLAUDE.md` inteiro, em especial as seções da F5b, da F6, da F7 (o QR) e da F8 (as partes do CI).
3. O `PLANO-FILEORCA.md`:
   - as "Decisões fechadas", que são contrato;
   - "Idiomas e URLs", "Confiança em dinheiro e saúde" e "O que derruba conta";
   - as regras de anúncio da mascote e o "Backlog com gatilho".
4. O `DECISOES.md`, do § 1 ao último. O próximo § livre é o 308, se nada entrou depois da F8. Esta run toca mais estes:
   - § 58, § 123, § 124 e § 142;
   - § 184, § 185, § 197 a § 208 e § 213 a § 223;
   - § 233, § 236, § 242, § 243 e § 268;
   - § 271 a § 273, § 302, § 305 e § 306.
5. O `docs/i18n/pt.md`, o `docs/i18n/es.md` e o `docs/design/README.md` (a voz). O `docs/design/` é só leitura.
6. Os relatórios da F6 e da F8, o `REVISAO-F8.md` e o `docs/PENDENCIAS.md`.

Você pode ler a web (WebSearch e WebFetch) para as fontes oficiais em português e em espanhol. Ler não é mandar pedido a um serviço: não entre em conta, não crie conta e não preencha formulário.

# Escopo

Dentro, em itens:

1. As rotas, os registros e os tipos das 40 páginas, com o par no hreflang (decisões 1 e 2).
2. O QR em pt e es (decisão 3).
3. O dinheiro em es: as 9 calculadoras, os 4 presets, os 5 guias e o hub (decisão 4).
4. Os 10 guias de arquivo em pt e es (decisão 5).
5. Em pt e es: a home, o rodapé, a busca, o 404, os hubs de imagem e de PDF e as institucionais (decisão 6).
6. O glossário (decisão 7).
7. Os testes e os portões que crescem, e as partes do CI (decisões 8 e 9).
8. O § de casa e saúde (decisão 10).
9. Os screenshots, a revisão adversarial final, as correções, o relatório e uma seção nova no fim do `CLAUDE.md`.

Fora (não toque):

- Tudo da seção "Fora de toda run" do `CLAUDE.md`. Em especial: não mande nada a nenhum serviço, não crie conta e não publique.
- **Casa e saúde em pt e es.** Ficam para o gatilho da § 273, no fim do teste de 90 dias (31/jan/2027): nenhuma página, rota ou texto delas nesta run. As páginas em inglês de casa e saúde e os dois hubs não mudam, porque o teste está correndo.
- **O dinheiro em pt.** As 8 calculadoras brasileiras e o hub delas ficam como estão. As calculadoras, os presets e os guias dos EUA não ganham versão em pt, e o hub em pt não lista nada dos EUA.
- Alemão, francês, ferramentas novas, presets novos, guias novos e a 2b.
- **Os motores e as medidas.** Não mudam `src/calc/`, `src/engine/`, `scripts/oracle/`, `fixtures/`, `data/guides-measured.json` e os scripts de medida dos guias. Os `--check` dão zero.
  - O `measured.ts` e o `calc/guides.ts` podem receber o idioma na formatação, sem mudar o que medem ou calculam.
- **O texto das páginas em inglês** não muda. O cabeçalho delas ganha o hreflang das páginas novas, e uma frase em inglês muda só se ficar falsa (por exemplo, "only in English").
- O `docs/design/` (só leitura), o `PLANO-FILEORCA.md`, o `docs/adr/`, o `.githooks/` e o `.claude/settings.json`.
- Do `.github/`, tudo menos a matriz de partes do `ci.yml` (decisão 9). O `scripts/ci/` também fica de fora.
- **Dependências:** nenhuma nova, e o `pnpm-lock.yaml` não muda.
- **Os itens do `PENDENCIAS.md`** ficam lá. Página nova já nasce certa quando um item aberto a afetaria (por exemplo, o espaço sem quebra em "2,4 MB" da F6 f-8), mas as páginas antigas não mudam por isso.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 308)

1. **O escopo é decisão do Victor, de 2/nov/2026.** Ela revoga o "só em inglês" apenas nestes pontos:
   - a § 58;
   - os guias da F5b (§ 184);
   - as 5 calculadoras em es da F6 (decisão 6);
   - o QR da F7 (decisão 8).

   Um § diz o que entra, o que fica de fora (casa e saúde, o dinheiro dos EUA em pt) e por quê.

2. **Os caminhos.** Cada slug é sem acento, com as palavras do glossário, e segue o padrão das páginas que já existem no idioma:
   - o QR em `/pt/gerador-de-qr-code/` e em `/es/generador-de-codigo-qr/`;
   - o dinheiro em es em `/es/calculadora-de-<nome>/`, como as 5 de hoje. Cada preset fica embaixo da calculadora-mãe, como no inglês (`/es/calculadora-de-hipoteca/<nome>/`);
   - os guias em `/pt/guias/<slug>/` e em `/es/guias/<slug>/`, com o slug traduzido.

   Você escolhe cada slug, põe na tabela do glossário e registra a lista num §. Nenhum caminho que já existe muda.

3. **O QR em pt e es é o mesmo da § 272.** A ilha, a conta, o limite de 1.273 bytes, a Oli, as cores e o PNG e o SVG não mudam. Mudam:
   - os textos;
   - o selo, no idioma;
   - o nome dos arquivos baixados, que sai dos textos, sem acento (§ 219);
   - as relacionadas, que são as mesmas 4 ferramentas, no idioma.

   O erro do limite diz que acento conta 2 bytes, o que pesa mais em pt e es. A caixa de texto mantém `autocomplete="off"`, `spellcheck={false}` e `autocapitalize="off"`.

4. **O dinheiro em espanhol** segue o molde das 5 calculadoras da F6. Entram as 9 que faltam (Auto loan, Refinance, Home affordability, Loan amortization, Debt consolidation, Rent vs buy, Savings goal, Simple interest e APR to APY), os 4 presets (Extra payments, Biweekly, 15 vs 30-year e Balloon payment) e os 5 guias.
   - **As contas.** A definição, o motor, as fixtures e o exemplo inicial são os do inglês. Os números da página em es são os da página em inglês.
   - **Os textos** ficam em `src/tools/<slug>/i18n/es.ts` e `src/tools/<mãe>/presets/<nome>/i18n/es.ts`, com o tipo e as chaves do inglês.
   - **As fontes** são oficiais, em espanhol, lidas nesta run. O CFPB em espanhol está em `files.consumerfinance.gov`, porque o `consumerfinance.gov/es/` redireciona para o inglês desde julho de 2026. Sem fonte oficial em espanhol, vale a fonte em inglês do mesmo órgão, com "(en inglés)".
   - **O CSV e o PDF.** O CSV sai como o do inglês. O PDF sai em Letter, com os textos em espanhol. O nome do arquivo vem do `file` do bloco `es`, sem acento.
   - **Os links.** O `next` e o `related` do bloco `es` apontam para páginas em es, agora com presets e guias. As 5 calculadoras de hoje também ganham os vizinhos novos.
   - **O hub `/es/calculadoras-financieras/`** segue o hub em inglês: as 14 calculadoras na ordem do inglês (crédito primeiro), os presets e os guias. O `HUB_MONEY_IDS.es` vira a lista toda.
   - **A home e o rodapé em es** passam a listar as 5 calculadoras de crédito da home em inglês (`HOME_CALC_IDS`).
   - **O `ES_CALC_IDS`** deixa de ser "as cinco". Decida se ele some ou se vira derivado do registro, e registre.
   - **Os guias em es:**
     - o `GuideView` recebe o `lang`;
     - os números saem dos motores no build, formatados no espanhol: "1,234.56" e "68 %" com espaço sem quebra (§ 213);
     - a calculadora embutida é a página em es com o exemplo do guia;
     - o "Revisado por … em …" leva a data da run, no dia de Brasília (§ 223).
   - **O `gate:dinheiro-saude`** passa nas páginas novas, com as fontes oficiais delas.

5. **Os 10 guias de arquivo em pt e es.**
   - **Os números.** Saem do `data/guides-measured.json`, que não muda. Todo número continua `{placeholder}`, agora formatado no idioma: "2,4 MB" e "68%" em pt, "2.4 MB" e "68 %" em es (§ 213). A data da medida sai por extenso no idioma, pelo `src/i18n/dates.ts`.
   - **As contagens por extenso** concordam em gênero em pt e es ("duas fotos", "dos fotos", "um PDF", "una imagen"). O `{nome_word}` ganha o gênero, ou outra forma que você escolha e registre. Continua proibido escrever algarismo ou contagem à mão.
   - **A regra dos números.** O `guides-numbers.test.ts` passa a ler pt e es, com a lista `GENERAL` de cada idioma:
     - em pt: "geralmente", "normalmente", "em geral", "quase sempre" e "a maioria dos PDFs";
     - em es: "generalmente", "normalmente", "por lo general", "casi siempre" e "la mayoría de los PDF".

     O teste traz controles que reprovam.
   - **Os fatos oficiais (`facts`) e os nomes técnicos (`names`)** vêm da fonte oficial no idioma, lida nesta run, com a data de leitura. Sem ela, vale a fonte em inglês, com "(em inglês)" ou "(en inglés)".
   - **O rótulo de menu do sistema** (Windows, iOS, Android, o app Fotos, o Paint…) vem da página de suporte oficial no idioma. Sem fonte, a frase descreve a ação sem citar o rótulo.
   - **A ferramenta embutida** é a do idioma (`<XxxPage slot="tool" lang embed />`), com o `<script>` do componente da própria ferramenta (§ 184). A página carrega o mesmo número de arquivos JS do guia em inglês.
   - **Os hubs de imagem e de PDF** de pt e es listam os guias do idioma, como os hubs em inglês. O `related` de um guia só aponta para página que existe no idioma.
   - **As datas.** A publicação e a revisão de cada idioma são do dia da run e nunca ficam antes do `measuredOn` (§ 207).
   - **O `pnpm guias:medir --check`** dá zero.

6. **Em pt e es: a home, o rodapé, a busca, o 404 e as institucionais.**
   - A home e o rodapé ganham o QR no lugar em que ele está no inglês.
   - A busca lista as páginas novas no idioma, com sinônimos no idioma ("qr", "código qr", "gerar qr code"; "código qr", "generar qr", "crear código qr"). O 404 de cada idioma busca nelas.
   - As institucionais de pt e es (Privacidade, Termos, Sobre e Licenças) que falam do QR, dos guias ou das calculadoras passam a dizer o que existe no idioma. A data da última atualização muda onde o texto mudou.
   - O Open Graph sai para cada página nova, e os sitemaps de pt e es levam as páginas novas.

7. **O glossário e quem escreve.**
   - **O glossário** ganha os termos novos: o dinheiro dos EUA em es (os termos do CFPB), o QR e os guias. O próprio glossário pede um § para cada mudança.
   - **Quem escreve.** Os textos saem do modelo forte: agentes com `model: 'opus'`, um por lote, nunca Sonnet. Os lotes são o QR, o dinheiro em es, os guias de arquivo em pt e os guias de arquivo em es.
   - **A leitura do lote.** O agente principal lê cada lote contra o glossário e roda o `lint:texto` antes de o lote entrar na branch.

8. **Os testes que crescem.**
   - Os testes que leem os registros pegam as páginas novas sozinhos.
   - Os que têm listas escritas à mão ganham as páginas novas, como o `TRANSLATED_TOOL_PAGES` do `ads.spec.ts` e o `i18n-budgets.spec.ts`.
   - **As provas mínimas:**
     - cada calculadora e preset em es mostra, no exemplo, o mesmo número do ResultHero e a mesma soma da tabela da página em inglês;
     - o CSV de cada uma, lido de volta, bate com a fixture do oráculo;
     - o resultado de cada página em es fica acima de 740 px, a 360 × 740 (§ 124 e § 268);
     - o `calc-form.spec.ts` passa nas páginas em es;
     - cada guia novo está nos `CASES` do `tool-guides.spec.ts`, com a ferramenta embutida funcionando no idioma;
     - o QR em pt e es está no `qr-code.spec.ts`, com textos com acento ("ação", "año", "ñandú"). O `binaryData` é igual aos bytes UTF-8, em PNG e em SVG, com e sem a Oli, e o evento sai sem o texto;
     - o hreflang é recíproco (`gate:seo`), e nenhuma página fica órfã (`gate:links`).

9. **O CI.** Antes do primeiro push que roda o CI, rode o `--list` das partes com os testes novos e meça na sua máquina as partes que crescem.
   - **Uma parte do Playwright acima do alvo de 700 s,** na projeção ou no CI: divida mais. Mude só a matriz de partes do `ci.yml`, com o `merge` esperando todas e o `verificar.test.ts`, que lê o `ci.yml`. O `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes do WebKit (§ 142).
   - **A parte `verificar` (`--sem-playwright`)** já está em 674,8 s. O `lint:texto` confere os textos alterados contra a main, e nesta PR eles são muitos. Meça essa parte na sua máquina. Se passar de 700 s, divida-a em duas por uma opção nova do `scripts/verificar.ts`. O `verificar.test.ts` prova que as partes juntas são o todo.
   - **Se o `ci.yml` mudar,** o merge é do Victor. A descrição da PR diz isso em destaque e lista o diff do `.github/`.

10. **Casa e saúde ficam para o gatilho da § 273.** Registre num § a escolha do Victor, de 2/nov/2026, para quando o gatilho vier:
    - casa só em es, porque as 6 calculadoras usam unidades dos EUA e o mulch não é coisa do Brasil;
    - saúde em pt e es, com o sistema métrico como padrão em pt.

    Acrescente essa nota à linha "90 dias" do `PENDENCIAS.md`. Nada de código de casa e saúde nesta run.

# Armadilhas conhecidas

- **Os `'en'` fixos.** Estão no `FileGuideView.astro`, no `GuideView.astro` (o tipo `lang: 'en'`), no `src/tools/guides/page.ts` (`enCommon`), no `measured.ts` (`WORDS`, a data, `fileSize(…, 'en')`), no `src/tools/calc/guides.ts` (`dollars`, `money` e `ratePercent` com `'en'`), no `QrTool.astro` e no `qr-code-generator/page.ts`. Procure outros com `grep -rn "'en'" src/` antes de planejar.
- **Os tipos.** Com as páginas novas, os tipos de pt e es passam a exigir `qr`, `guides` (em es) e `fileGuides`, como a § 218 fez, para página sem texto não compilar.
- **O `.map(cardOf)` passa o índice como segundo argumento.** Escreva `.map((id) => cardOf(id, lang))` (`CLAUDE.md`, F6).
- **O `lint:texto` preenche os placeholders com amostras** (§ 123 e § 269). Placeholder novo sem amostra vira "$1,234": confira se a frase ainda faz sentido.
- **O cache do Vitest 5.** Um `import.meta.glob` que deveria ver arquivos novos (os `i18n/es.ts` e os `guide-*.ts` de pt e es) pode ficar com o resultado velho. Apague `node_modules/.vitest-cache` e rode de novo.
- **O `String.replace(a, b)` com "R$" ou "$" em `b`** interpreta `$'`: use `() => b`.
- **O Git Bash.** Um caminho de URL que começa com "/" vira caminho do Windows: use `MSYS_NO_PATHCONV=1`. Heredoc e `node -e` com crase, barra invertida ou apóstrofo estragam o texto: escreva arquivo pela ferramenta de escrita.
- **Os rótulos em es são mais longos.** O rótulo de meia largura com a etiqueta "ejemplo" tem de caber a 360 px: a palavra mais longa, mais 12 px, mais 72 px da etiqueta, até 158 px (`CLAUDE.md`, F6).
- **O reflow a 320 px** vai em blocos de 60 páginas (§ 306). Com umas 208 páginas, confira os blocos e o `--list`.
- **A parte do `a11y`** cresce com cada página (§ 243).
- **As fontes que não abrem.** O `consumerfinance.gov/es/` redireciona para o inglês, e o WebFetch recebe 403 de alguns sites oficiais. A fonte vira outra página oficial do mesmo órgão, e o que não abriu fica como pendência.
- **O kit do Product Hunt.** O `launch-kit.test.ts` compara contagens com os registros. Se uma contagem mudar, atualize o kit e as imagens com `pnpm lancamento:imagens`.
- **Os agentes em worktree nascem da `main`.** O primeiro passo de cada um é `git merge --ff-only ajuste-idiomas`. Agente que escreve código ou texto usa `model: 'opus'`.
- **A porta do Playwright.** Cada worktree usa o próprio `FO_PORT`, de 4174 a 4189.
- **A máquina carregada.** Com as lentes da revisão rodando o Playwright junto, o WebKit do Windows já travou no `page.goto`. Rode de novo com a máquina livre antes de achar que o teste está errado.

# Critérios de aceitação (cada um com evidência no relatório)

1. As 40 páginas novas respondem 200 no `dist/` e são indexáveis, com o canonical, o sitemap do idioma e o hreflang recíproco: en, pt e es nos guias de arquivo e no QR; en e es no dinheiro. O x-default fica no inglês. O relatório traz a tabela das páginas, com o caminho em cada idioma.
2. Cada calculadora e cada preset em es mostra, no exemplo, o mesmo número da página em inglês. O CSV de cada uma, lido de volta, bate com a fixture do oráculo, e o PDF sai em Letter com os textos em es.
3. Os guias em pt e es só têm números que vêm de placeholder. O `guides-numbers.test.ts` lê os três idiomas, com controles negativos. O `pnpm guias:medir --check`, os `--check` dos três oráculos de calculadora e o do Pix dão zero.
4. O QR em pt e es: o PNG e o SVG baixados, lidos pelo `jsqr` nos dois navegadores, devolvem os bytes UTF-8 do texto com acento. O texto não sai do aparelho nem entra em evento.
5. Os hubs, a home, o rodapé, a busca e o 404 de pt e es levam às páginas novas, e o `gate:links` não acha página órfã.
6. O `glossary.test.ts` e o `lint:texto` passam nos textos novos. O `gate:conteudo`, o `gate:seo`, o `gate:prontidao` e o `gate:dinheiro-saude` passam.
7. **O anúncio e o layout.** O `ads.spec.ts` passa nas páginas novas:
   - 150 px de folga;
   - nada acima da ferramenta no celular;
   - o resultado das calculadoras em es acima de 740 px, a 360 × 740.

   O `calc-form.spec.ts`, o reflow a 320 px e o `layout-shift.spec.ts` também passam.
8. Cada página nova carrega o mesmo número de arquivos JS da página equivalente em inglês: 2 nas ferramentas e nas calculadoras. O relatório traz a tabela por tipo de página.
9. As páginas em inglês de casa e saúde não mudaram: o `git diff --stat origin/main` das 11 pastas e do `src/i18n/life-hubs.ts` sai vazio.
10. O Lighthouse das URLs do `lighthouserc.json` fica nos limiares de hoje.
11. Todas as partes do CI estão verdes e abaixo de 900 s. O relatório traz o total de cada uma, comparado com a F8.
12. O `docs/relatorios/REVISAO-ajuste-idiomas.md` não tem achado crítico nem alto aberto.
13. O `pnpm verificar` passa numa execução limpa na sua máquina, pelas partes em sequência.

# Verificação: rode de verdade

- Siga a ordem das fatias de "Como trabalhar", e cada fatia termina verde antes da próxima.
- Leia cada falha, corrija a causa e repita até passar.
  - É proibido desligar, pular, marcar como `skip`, afrouxar limiar, mudar orçamento, ligar `retries` ou aumentar timeout para passar.
  - Se um portão estiver de fato errado, corrija o portão com um teste que prove o erro e registre no `DECISOES.md`.
- **Os `--check`.** Rode os dos três oráculos (com o `uv`), o do Pix e o `pnpm guias:medir --check`, e cole a saída. Todos dão zero.
- **No fim, uma execução limpa:** `CI=true pnpm install --frozen-lockfile` e as partes do CI em sequência, porque o todo passa de 900 s aqui (§ 242). Cole o resumo de cada parte. O limite não muda.
- **O `pnpm screenshots`** roda depois do último ajuste visual, na pasta `docs/relatorios/ajuste-idiomas/componentes/`, nos dois temas, a 360 e a 1280 px. Ele traz:
  - o QR em pt e em es;
  - uma calculadora em es com rótulos longos (Home affordability ou Rent vs buy) e um preset em es;
  - um guia de dinheiro em es;
  - um guia de arquivo de imagem em pt e um de PDF em es.
- **Depois de abrir a PR,** acompanhe com `gh pr checks <n> --watch`. Leia o total de cada parte no log (`gh run view <id> --log`, com o `--attempt` do `CLAUDE.md` depois de um rerun).
- **Os minutos do Actions.** Mande para o CI só com as partes locais verdes. O relatório diz quantas execuções a run gastou.

# Autonomia e decisões

Você está rodando sozinho e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `CLAUDE.md` e o plano.
3. O `docs/design/`, o glossário e o `DECISOES.md`.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos:

- cada slug;
- a forma do gênero nas contagens;
- o destino do `ES_CALC_IDS`;
- a fonte oficial de cada idioma, quando houver mais de uma;
- a divisão do CI.

Uma mudança de arquitetura (host, framework, estrutura do repositório) vira uma ADR "Proposta" em `docs/adr/` e uma pendência. A divisão do CI segue a ADR-003 e não é mudança de arquitetura.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- uma fonte oficial que não abre (use outra página oficial do mesmo órgão);
- o push do `ci.yml` recusado por falta do escopo `workflow` (o relatório traz o comando para o Victor rodar);
- um teste do WebKit que só falha com a máquina carregada.

Válvula de estouro, nesta ordem, se o tempo ou o limite apertar:

1. Os 5 guias de dinheiro em es e a seção de guias do hub em es.
2. Os 10 guias de arquivo em es.
3. Os 10 guias de arquivo em pt.

O que sair vira um §, uma linha no `PENDENCIAS.md` e uma run "b". Nada fica "em breve", e nenhum link aponta para página que não existe.

Nunca corte:

- o QR em pt e es;
- as 9 calculadoras, os 4 presets e o hub em es;
- o hreflang, a home, o rodapé, a busca e o 404 das páginas que entraram;
- os testes da decisão 8;
- a divisão do CI, se a projeção pedir;
- a revisão adversarial final.

# Git e segurança

- **Começo.**
  - Rode `git switch main` e `git pull --ff-only`.
  - Antes de criar a branch, o `git status` só pode mostrar como não rastreados `docs/prompts/prompt-ajuste-idiomas.md` e `docs/prompts/prompt-ajuste-idiomas.txt`, o prompt desta run.
  - Crie a branch com `git switch -c ajuste-idiomas`. Os dois arquivos entram sem edição no primeiro commit dela.
  - Se eles não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-ajuste-idiomas.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits).
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push, e o CI não roda sem PR.
- **A PR em rascunho, só com as partes locais verdes** e tudo commitado. Use `gh pr create --draft --base main --head ajuste-idiomas`, num comando separado do push. O título e a descrição vão em português, com o resumo e o link do relatório.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`.
- **Fim:**
  1. Com o CI verde no rascunho, commite o relatório (citando essa execução), a revisão e os screenshots.
  2. Faça o push e rode logo em seguida `gh pr ready`.
  3. Acompanhe essa execução até o fim.
  4. Sem `.github/workflows/` no diff, o CI mescla a PR sozinho, e a run termina com o merge feito. Com o `ci.yml` no diff, a run termina com a PR pronta e o CI verde, para o merge do Victor. Se algo impedir uma das duas coisas, a resposta final diz qual pendência.
- **No GitHub, a run só faz isto:** push da branch, a PR (`gh pr create` e `gh pr ready`) e leitura (`gh run`, `gh pr checks`).
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo create`/`edit`;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `npm publish` ou `wrangler deploy` em qualquer forma, inclusive `--dry-run`.

  O `.claude/settings.json` nega esses comandos. Não tente contornar.

# Como trabalhar

1. **Explorar**, com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) as regras desta run, do `CLAUDE.md` e do plano, num checklist "requisito → onde vai ficar → que teste prova";
   - (b) o caminho de uma página nova em pt e es:
     - as rotas e os tipos;
     - os `'en'` fixos, com arquivo e linha;
     - os hubs, a home, o rodapé, a busca, o 404, os sitemaps e o Open Graph;
     - o que o service worker e a página offline leem do mapa de rotas;
   - (c) os guias: o que o `measured.ts`, o `calc/guides.ts` e o `guides-numbers.test.ts` supõem do inglês, e a lista de placeholders com contagem por extenso, com o gênero do substantivo em pt e es;
   - (d) as fontes oficiais em pt-BR e em es de cada guia e de cada calculadora em es, com link e data, e o que não abriu;
   - (e) o CI: o tempo por spec da execução 41548317129, a projeção do `--list` com as páginas novas e o tempo do `lint:texto` com a diff desta PR.
2. **Planejar.** Escreva `docs/relatorios/ajuste-idiomas-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz:
   - a tabela das 40 páginas, com os caminhos;
   - os arquivos de texto de cada lote;
   - as mudanças de código que tiram os `'en'` fixos;
   - cada critério ligado a um teste ou comando;
   - a projeção das partes do CI;
   - a ordem de construção.
3. **Implementar** em fatias que terminam verdes, nesta ordem:
   1. as rotas, os tipos e o idioma nos moldes, com os testes de rota e ainda sem texto novo;
   2. o QR em pt e es, que é pequeno e prova o caminho inteiro;
   3. o dinheiro em es: as 9 calculadoras, os 4 presets, o hub, a home e o rodapé; depois, os 5 guias;
   4. os guias de arquivo: a formatação por idioma, o gênero das contagens e o teste dos números em pt e es; depois, os textos em pt; depois, os textos em es;
   5. a busca, o 404, as institucionais e o glossário;
   6. a projeção e, se precisar, a divisão do CI;
   7. o Lighthouse, os screenshots e o `--list` das partes.

   Os textos de cada lote saem dos agentes `opus` em worktree. Eles rodam em paralelo com o código quando não dependem dele.
4. **A revisão adversarial final,** no método da F3 (`CLAUDE.md`), sobre um commit fixo e registrado da branch, contra este prompt e o plano.
   - **As lentes:** cinco lentes Sonnet em contexto limpo:
     - (a) o português: glossário, registro, voz, português do Brasil e os nomes de menu conferidos na fonte;
     - (b) o espanhol: glossário, termos do CFPB e o espanhol do público dos EUA;
     - (c) os números e o formato: placeholders, formato de cada idioma, concordância de gênero, o mesmo resultado do inglês, o CSV e o PDF;
     - (d) SEO e idiomas: hreflang, canonical, sitemaps, slugs, órfãs, descrições e links só para páginas que existem no idioma;
     - (e) anúncio, acessibilidade e orçamento das páginas novas, a 320, 360 e 1280 px.
   - **Os céticos:** cada achado crítico, alto ou médio tem um cético próprio. Os baixos de cada lente vão a um cético só.
   - **As correções** ficam num agente só (`opus`). Depois, uma segunda passada revisa o diff.
   - **Os baixos que ficarem** vão para o `PENDENCIAS.md`.
   - Tudo fica em `docs/relatorios/REVISAO-ajuste-idiomas.md`. Remova a worktree no fim.

# Relatório final

Escreva `docs/relatorios/ajuste-idiomas.md` em português, commitado na branch antes do `gh pr ready`. Ele cita a última execução verde do CI com código ou teste, com o link e o total de cada parte.

O relatório traz:

- o resumo;
- a tabela das 40 páginas, com o caminho em en, pt e es;
- a prova dos números iguais entre es e en e a saída dos `--check`;
- o QR lido de volta: a saída do spec nos dois navegadores;
- o orçamento por tipo de página;
- o Lighthouse;
- o CI: a tabela das partes contra a F8, onde o `--list` pôs os testes novos e quantas execuções a run gastou;
- o resumo da revisão, apontando para o `REVISAO-ajuste-idiomas.md`;
- a saída real das partes do `pnpm verificar` em sequência, com o tempo de cada portão;
- o link da prévia e o que você conferiu nela;
- as decisões novas, apontando os §;
- o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. **O merge.** Sem `.github/` no diff, ele já aconteceu. Com o `ci.yml` no diff, conferir o diff (`git diff origin/main...ajuste-idiomas -- .github/`) e dar o merge pela página da PR (squash, apagando a branch).
  2. **A produção.** Conferir o pós-deploy e o `build.txt`.
  3. **O português no ar.** Ler os guias e o QR em pt, como pede a decisão fechada "Revisão humana". O que precisar de ajuste vira uma run curta.
  4. **No celular:** gerar um QR em pt com acento e ler com a câmera; abrir uma calculadora e um guia em es.
  5. **O Search Console:** se quiser acelerar, pedir a indexação dos hubs de pt e es.
  6. **31/jan/2027:** o gatilho de casa e saúde, pela § 273 e pelo § da decisão 10.

Acrescente no fim do `CLAUDE.md` uma seção curta, "Ajuste: idiomas", com:

- como uma calculadora em es, um guia de arquivo e o QR ganham versão num idioma: o caminho, os textos, a formatação, o gênero das contagens e os testes;
- as partes do CI, se mudaram, substituindo a descrição das seções anteriores, que ficam como estão;
- as armadilhas que você achou.

Não apague nada do que já existe.

Termine a resposta final com:

- um resumo de cinco linhas em português;
- o link da PR e o estado do CI;
- se o merge já aconteceu ou se é do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `PENDENCIAS.md` e a descrição da PR.

Em inglês: o código, os nomes de arquivo, os identificadores e os commits.

Os textos do site ficam nos arquivos de tradução de cada idioma, com a voz de `docs/design/README.md` e o glossário de `docs/i18n/`.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-ajuste-idiomas.md` e `prompt-ajuste-idiomas.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run os põe no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 1c2cb0e (a F8) ou mais novo
git status                  # só docs/prompts/prompt-ajuste-idiomas.md e .txt como não rastreados
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado; "workflow" nos escopos (se a run dividir o CI)
claude --version            # o modo auto pede 2.1.83 ou mais
powercfg /change standby-timeout-ac 0
```

- **O escopo `workflow` do `gh`.** A run só mexe no `ci.yml` se o CI precisar de mais partes. Sem esse escopo, o push dele é recusado no meio da run. Deixe pronto:

  ```powershell
  gh auth refresh -s workflow
  ```

- **O `uv`.** A run roda os `--check` dos oráculos com ele:

  ```powershell
  $uv = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter uv.exe | Select-Object -First 1 -ExpandProperty FullName
  & $uv --version
  ```

- **Os minutos do Actions.** Confira o uso em github.com → Settings → Billing and plans.
  - Com 15 partes, estimo umas 2 h a 2 h 30 de runner por execução. A F7 gastava de 120 a 135 min com 13 partes.
  - Conte 3 ou 4 execuções: até uns 600 min, num plano de 2.000 min por mês.
  - Se faltar minuto, o CI não roda.
- Volte o `powercfg` ao normal depois da run.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n ajuste-idiomas
```

Cole o conteúdo inteiro de `docs\prompts\prompt-ajuste-idiomas.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal as partes do pnpm verificar verdes na máquina local, todas as partes do CI verdes, docs/relatorios/REVISAO-ajuste-idiomas.md sem achado crítico ou alto aberto, e a PR da ajuste-idiomas fora do rascunho (mesclada pelo CI, ou esperando o merge do Victor se mexeu no .github)
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume ajuste-idiomas` e mande: "continue de onde parou: leia docs/relatorios/ajuste-idiomas-plano.md, o git log da branch ajuste-idiomas e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-ajuste-idiomas.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-ajuste-idiomas.json
(Get-Content $HOME\run-ajuste-idiomas.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**O tamanho da run.** O nome é de run curta (`ajuste-*`), mas o tamanho é parecido com o da F6:

- 40 páginas novas;
- uns 50 arquivos de texto em pt e es;
- a formatação dos guias por idioma, com o gênero das contagens;
- fontes oficiais para ler nos dois idiomas;
- a revisão em cinco lentes, com céticos.

Comece com folga no limite semanal do Claude Code. Os commits pequenos guardam o que já foi feito, e a run retoma na janela seguinte. Se apertar, a válvula manda para uma run "b", nesta ordem: os guias de dinheiro em es, os guias de arquivo em es e os guias de arquivo em pt. O QR e o dinheiro em es nunca saem.

**Por que o modo `auto`:** a run faz várias coisas sem perguntar:

- builda e roda o Vitest, o Playwright em várias portas e o Lighthouse;
- roda os `--check` com o `uv`;
- lê a web (CFPB em espanhol e páginas de suporte da Apple, do Google e da Microsoft);
- cria e remove worktrees de agentes e da revisão;
- faz commit e push da branch, abre a PR em rascunho e a marca como pronta.

O `auto` deixa tudo isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo: push na main, `gh pr merge`, `gh repo create`, `wrangler deploy`, reset e amend. O prompt não pede nada disso.

### 3. Acompanhar

- **A prévia sai antes da PR.** A branch ganha prévia a cada push, sem gastar minutos do Actions. Ela fica em `https://ajuste-idiomas-fileorca.vmatusita.workers.dev/`, e o QR em pt deve aparecer cedo, em `/pt/gerador-de-qr-code/`.
- **A PR aparece em rascunho só no fim,** com as partes locais verdes. A revisão sai em `docs/relatorios/REVISAO-ajuste-idiomas.md`.
- **O merge.** Sem mudança no `.github/workflows/`, a PR entra no ar sozinha quando o CI fica verde, como manda o plano para branches `ajuste-*`. Se a run dividir o CI, o job de merge comenta que não mescla, e o merge é seu.

### 4. Ao voltar

1. Leia `docs/relatorios/ajuste-idiomas.md` e confira as evidências:
   - a tabela das 40 páginas;
   - a prova de que cada calculadora em es mostra o mesmo número do inglês, e os `--check` em zero;
   - a leitura do QR pelo `jsqr`, com acento, nos dois navegadores;
   - a tabela das partes do CI, todas abaixo de 900 s;
   - o `REVISAO-ajuste-idiomas.md`, com o veredito de cada cético.
2. Se a PR mexeu no `.github/`, confira o diff e dê o merge:

   ```powershell
   git fetch origin ajuste-idiomas
   git diff --stat main...origin/ajuste-idiomas -- .github
   git diff main...origin/ajuste-idiomas -- .github
   ```

   Ele deve mostrar só a matriz de partes do `ci.yml`. Se estiver certo, use "Squash and merge" na página da PR e apague a branch.
3. Confira a produção:

   ```powershell
   git switch main; git pull --ff-only
   gh run list --workflow pos-deploy.yml --limit 1   # verde
   curl.exe -s https://fileorca.com/build.txt         # o commit do merge
   ```

4. Leia o português dos guias e do QR no ar. No celular, gere um QR com acento em `/pt/gerador-de-qr-code/` e leia com a câmera. Abra uma calculadora e um guia em espanhol.
5. Siga a lista "O que é do Victor" do relatório.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **O nome é `ajuste-idiomas`,** porque o `CLAUDE.md` chama de `ajuste-{assunto}` as runs fora das fases. Com isso, o merge é automático se o `.github/` não mudar.
- **Casa e saúde ficam de fora,** como você escolheu. A run registra num § a sua escolha para fevereiro: casa só em es, e saúde em pt e es, com o sistema métrico como padrão em pt.
- **O dinheiro dos EUA não vai para pt.** O português já tem as 8 calculadoras próprias do Brasil, e hipoteca, refinanciamento e APR dos EUA não servem para o público daqui.
- **Os caminhos:** o QR em `/pt/gerador-de-qr-code/` e `/es/generador-de-codigo-qr/`, e os guias em `/pt/guias/…` e `/es/guias/…`. A run escolhe o resto dos slugs pelo glossário.
- **A home e o rodapé em es** passam a mostrar as mesmas 5 calculadoras de crédito da home em inglês. Hoje eles mostram as 5 que existiam em espanhol.
- **Os textos saem de agentes Opus, um por lote.** Na F6 o agente principal escreveu tudo, mas aqui o volume não cabe no contexto dele. O agente principal lê cada lote contra o glossário.
- **A divisão do CI é permitida se a projeção pedir.** Nesse caso, o merge passa a ser seu. A parte `verificar` já está em 674,8 s, e o `lint:texto` dessa PR vai ser grande.
- **O Lighthouse não ganha URL nova,** porque as páginas novas usam moldes que já são medidos.
- **As pendências do `PENDENCIAS.md` ficam onde estão.** As páginas novas já nascem certas, sem mexer nas antigas.
