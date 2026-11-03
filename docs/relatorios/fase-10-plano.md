# F10 · Plano da run (UX/UI: diagnóstico e proposta)

3/nov/2026 · branch `fase-10` · PR [vmatusita/fileorca#22](https://github.com/vmatusita/fileorca/pull/22) (rascunho) · gabarito da revisão adversarial final.

Este plano é autossuficiente: diz de onde a run parte, o que mede, o que entrega, quem faz cada parte, em que ordem e qual script ou comando prova cada critério da ficha (`docs/prompts/prompt-fase-10.txt`, que vence o resto).

## 1. Ponto de partida

- **`origin/main` no começo da run: `33be71e`** (a F9 mesclada, PR #20). A branch `fase-10` saiu dela; o primeiro commit (`87ef4c8`) traz os dois arquivos do prompt, sem edição.
- `pnpm install --frozen-lockfile` e `pnpm build` rodaram em `87ef4c8`: 208 páginas, `dist/build.txt` = `87ef4c8`. O `src/` é o mesmo da `33be71e`.
- O build `all` do `gate:prontidao` existe em `.cache/prontidao/all/`. O `build.txt` dele diz `f868c62` (a ponta da `fase-09` antes do squash), mas `src/`, `public/`, `astro.config.ts` e `package.json` são idênticos aos de `33be71e`, então ele serve como está. Ele tem 178 páginas com AdSlot (1 de conteúdo e 1 lateral cada).
- **Não existe `.cache/dados-f10/`.** Sem GA4 e sem Search Console, o diagnóstico é só heurística e medida (§ 359).
- Próximo § livre do `DECISOES.md`: **342**.
- O `git status` do começo só tinha, sem rastreio, os dois arquivos do prompt e a pasta `Claude outputs/` (que nunca entra). O `PLANO-FILEORCA.md` não estava modificado.

## 2. O que a exploração achou e muda o plano

As notas completas ficam em `.cache/f10/explore/` (fora do Git): `regras.md`, `site.md`, `ads-cafe.md`, `design.md`, `oli.md`, `pendencias-a.md`, `pendencias-b.md`, `pesquisa-ads.md` e `pesquisa-bloqueadores.md`. As dos concorrentes ficam em `.cache/f10/concorrentes/`.

1. **As pendências são 37, não 36.** O grupo 5 tem 13 linhas: a "Idiomas R2-03" entrou no ajuste idiomas sem atualizar o Resumo do `PENDENCIAS.md`, e a ficha herdou o 12. A tabela do README terá as 37 (§ 347). A conta errada do Resumo vai para "Para o PENDENCIAS" do relatório.
2. **A caixa de anúncio de conteúdo reserva 300 px** (`src/styles/components.css:387`), não 280, e a lateral reserva 644 px. A densidade usa os 300 px, que é a medida real e a mais conservadora (§ 351).
3. **O multiplex a 360 px mede uns 1.666 px.** A ajuda do AdSense não publica a altura; ela vem do código público do carregador (1 coluna × 6 linhas). A run planeja com 1.700 px. Sozinho, ele pede 5.554 px de conteúdo principal para ficar em 30 %, então não cabe nas páginas de ferramenta no celular. O mapa da seção B muda no celular, e a run registra a mudança (§ 351 e § 361).
4. **A âncora entra na densidade, contada uma vez** (Coalition for Better Ads: "The height of each sticky ad is counted once"). A leitura conservadora soma 100 px de âncora ao numerador. O denominador é o `<main>` sem a grade de relacionadas, que o Google tira do "conteúdo principal" (§ 351).
5. **Não existe hub de guias.** Os 10 guias de arquivo existem nos três idiomas, todos com a ferramenta embutida. Os 5 de dinheiro existem só em en e es.
6. **O aviso de cookies na primeira visita, a 360×740, tem 200 px (en) ou 222 px (pt e es)**, de 27 a 30 % da tela. Em pt ele cobre 32 dos 60 px do "Escolher imagem", e a 320 px cobre o botão nos três idiomas (F4-F7 f-1).
7. **O CLS da interação** nas ferramentas de imagem vem do BeforeAfter, montado entre o status e as opções abaixo de 768 px: 0,067 no Compress e 0,059 no HEIC to JPG (F4-F7 e-2).
8. **Sem hipoteca em pt:** a tarefa "hipoteca" roda em en e es, e o SAC × PRICE só em pt (§ 358).
9. **O menu de idioma abre sem JS** com o `popover` nativo (`popovertarget="fo-langmenu"`). O botão Menu proposto usa o mesmo mecanismo.
10. **Não há CSP de script** (só `frame-ancestors`), então o script inline do tema não pede hash.
11. **O texto de apoio de hoje e o da seção C mencionam anúncio e café na mesma frase** ("Ads cover the costs; every coffee becomes the next tool"). A run lê a regra "nenhum texto liga doação a anúncio" como: a doação não compra, não troca e não tira anúncio, e nenhum texto sugere isso. A tensão vai para um § e para a lente (c) da revisão (§ 362).
12. **Os concorrentes:** nenhum tem tema escuro nem botão de tema, ninguém pede apoio no momento do resultado, e só um afirma que o arquivo fica no aparelho. Nenhum material deles entra no Git.

## 3. A matriz do diagnóstico (decisão 2)

**As seis tarefas e as URLs** (conferidas no `dist/`):

| Tarefa | en | pt | es |
|---|---|---|---|
| Comprimir imagem | `/compress-image/` | `/pt/comprimir-imagem/` | `/es/comprimir-imagen/` |
| HEIC para JPG | `/heic-to-jpg/` | `/pt/heic-para-jpg/` | `/es/heic-a-jpg/` |
| Juntar PDF | `/merge-pdf/` | `/pt/juntar-pdf/` | `/es/unir-pdf/` |
| Hipoteca | `/mortgage-calculator/` | não existe | `/es/calculadora-de-hipoteca/` |
| SAC × PRICE | não existe | `/pt/simulador-sac-price/` | não existe |
| Guia (`heic-to-jpg-on-windows`) | `/guides/heic-to-jpg-on-windows/` | `/pt/guias/heic-para-jpg-no-windows/` | `/es/guias/heic-a-jpg-en-windows/` |

São 15 pares de tarefa e idioma. O guia escolhido é um guia de arquivo com a ferramenta embutida que existe nos três idiomas e liga a tarefa do HEIC ao guia (§ 358).

**As dimensões:** 360×740 e 1280×800; claro e escuro (`colorScheme` emulado); a primeira visita (sem `fo-consent`, com o aviso aberto) e a volta (`fo-consent` gravado). São 15 × 2 × 2 × 2 = 120 sessões, todas no Chromium. Uma amostra no WebKit (cada tarefa em um idioma, 360, claro, volta, repouso e resultado) diz se algo muda de navegador.

**Os estados de cada sessão:**
1. repouso;
2. arquivo em cima (o `dragenter` com um `DataTransfer`) ou campos preenchidos;
3. processando (a CPU desacelerada pelo CDP, para o WaterLevel aparecer);
4. resultado;
5. erro (um arquivo inválido, ou um campo fora da faixa: `#fo-calc-r` = 99 na hipoteca e `#fo-calc-n` = 5 no SAC × PRICE);
6. próximo passo (o que a pessoa vê e toca depois do Baixar: os chips, a rolagem até o primeiro anúncio e as relacionadas).

As fixtures vêm de `fixtures/` (JPG para comprimir, HEIC, dois PDFs para juntar, e um arquivo inválido).

**As medidas, por sessão:**
- os toques ou cliques até o resultado;
- o topo e a base do botão principal, do Baixar e do resultado, contra a dobra (740 ou 800);
- o CLS da interação: todas as entradas de `layout-shift` depois do primeiro gesto, com e sem `hadRecentInput`, mais a soma no padrão do CLS;
- o tempo até o resultado com a fixture;
- o retângulo do aviso de cookies na primeira visita, a fração da tela que ele cobre e o que fica embaixo dele (o botão principal, o resultado, o Baixar);
- as telas até o primeiro conteúdo útil (o `y` do primeiro controle da ferramenta sobre a altura da tela);
- o JS e as requisições da página, com as mesmas regras de `tests/e2e/lib/budgets.ts`: JS do próprio domínio em gzip, scripts inline incluídos, 80 KB; até 8 requisições na primeira página.

**Onde medir:**
- **o `dist/` de `87ef4c8`,** servido por `pnpm serve` (`PORT` de 4174 a 4189);
- **os anúncios de hoje,** no `.cache/prontidao/all/`, servido do mesmo jeito: a posição de cada AdSlot contra o Baixar, os campos e a dobra, e a densidade de hoje;
- **o fileorca.com,** com o `context.route` abortando os domínios do Google (`google`, `googletagmanager`, `google-analytics`, `doubleclick`, `gstatic`, `googlesyndication`). É uma tarefa por categoria: comprimir imagem, juntar PDF e hipoteca, em en, a 360 e a 1280, claro, nas duas visitas. A diferença contra o `dist/` vai registrada.

**O que entra no Git:** só a captura citada por um D-NN ou por um UX-NN, em `docs/relatorios/fase-10/diagnostico/`, com o nome no padrão `<tarefa>-<idioma>-<largura>-<tema>-<estado>.jpg` (JPEG q80, escala 1, até 500 KB). A matriz inteira e o JSON das medidas ficam em `.cache/f10/diag/`.

**Os D-NN:** cada atrito traz a tarefa, o idioma, o tamanho, o tema e o estado; o que acontece; a evidência (uma captura, um número medido ou uma heurística citada pelo nome: as 10 de Nielsen, um critério da WCAG 2.2 ou uma regra do `docs/design/README.md`); a gravidade (bloqueia, atrasa ou incomoda); e o UX-NN que responde a ele. "Parece genérico" vira G-NN, com o quê, onde e a regra ou o princípio do design system que ele trai. Quando o design system não diz nada, o G-NN vira proposta.

## 4. Os scripts de `.cache/f10/` (decisão 15)

Todos são `.mjs`, porque um `.ts` em `.cache/` entraria no `astro check`, e todos ficam fora do Git. Cada um sai com código diferente de zero quando reprova.

| Script | O que faz | Prova |
|---|---|---|
| `diff.mjs` | `git fetch`, depois `git diff --name-only origin/main...HEAD`: todo arquivo dentro do escopo; o diff nos caminhos proibidos vazio; o `DECISOES.md` só ganha linhas; a proposta só com HTML, CSS, Markdown e SVG; as imagens nas três pastas; a classe do CI esperada `portões` | critério 1 |
| `readme.mjs` | as seções do README na ordem da decisão 8; os dez rótulos de cada UX-NN; o custo P/M/G e a run; o protótipo existe; os obrigatórios 1 a 8, com duas alternativas no 1, no 3 e no 4; os D-NN completos; as 37 pendências (ids lidos de `.cache/f10/pendencias-ids.json`, conferidos contra o `PENDENCIAS.md`); os 7 itens "para avaliar"; os links e caminhos dos três arquivos; o `index.html` abre cada protótipo nos dois temas; o `ESCOLHAS.md` com a linha do topo, os três grupos, cada UX-NN e cada pendência com a recomendação | critério 2 |
| `prototipos.mjs` | cada `.html` da proposta no Chromium e no WebKit, claro e escuro, a 360×740 e a 1280×800, por http (um servidor estático na raiz do repositório) e, no Chromium, por `file://`: zero `console.error` e `pageerror`, zero violação do axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa`), zero requisição para fora do repositório, alvo de 48 px nos controles da página, nenhum script externo, `type="module"` ou `fetch(`. Com `--shots`, grava as screenshots de `docs/relatorios/fase-10/prototipos/` | critério 3 |
| `contraste.mjs` | a fórmula da WCAG 2.2 em todo par novo (`.cache/f10/contraste-pares.json`), nos dois temas; todo token `--proposta-` num par; os dois blocos escuros iguais; nenhuma cor literal na proposta fora das declarações `--proposta-` e da Oli; com `--readme`, a tabela do README com os mesmos números | critério 4 |
| `densidade.mjs` | a 360×740, toda página de cada molde nos três idiomas, no `dist/` (o hub de guias pelo protótipo): põe as caixas onde o mapa manda, confere as regras (o 1º depois da peça certa e nunca na primeira tela da home, 1.110 px entre anúncios do conteúdo, o multiplex no fim, 150 px das peças, nada acima da ferramenta) e mede a densidade pela fórmula da ficha e pela conservadora; grava o JSON e a tabela por molde | critério 5 |
| `oli-sad.mjs` | mede o `<symbol>` da `sad` como o `src/oli/sprite.ts` o montaria (importa a função, empurra `sad` na lista só dentro do processo), mede as dez poses e confere se o SVG avulso, a folha e os dois PNG existem | critério 6 |
| `imagens.mjs` | cada imagem de `docs/relatorios/fase-10/` até 500 KB, o total até 25 MB, os nomes no padrão, o tipo verdadeiro (JPEG ou PNG), nenhuma imagem na proposta, toda imagem citada pelo README, pelo `index.html`, pela folha ou pelo relatório | critério 7 |
| `diag/capturar.mjs` | a matriz do diagnóstico e as medidas (seção 3) | os D-NN |
| `concorrentes/capturar.mjs` | os concorrentes em repouso (já rodou na exploração) | "O que os outros fazem" |

As saídas reais vão para o relatório.

## 5. Os itens UX-NN previstos

Os oito primeiros são os obrigatórios. A numeração do resto sai do diagnóstico, das pendências e da lista "para avaliar", e o README é a lista final.

| Id | Peça | Origem | Protótipos | Run prevista |
|---|---|---|---|---|
| UX-01 | Cabeçalho com menu e botão de tema (A e B), no celular e no computador; ícones menu, sol, lua e automático em `icons/` | obrigatório 1 | `header-a.html`, `header-b.html` | F11 |
| UX-02 | Hub de guias (en, pt e es) e as entradas: trilha, rodapé, seção na home, link na ferramenta, categoria na busca; cartão de guia diferente do de ferramenta | obrigatório 2 | `guides-hub.html`, `guides-entries.html` | F11 |
| UX-03 | Home (A e B), com os anúncios da área `geral` pelo mapa | obrigatório 3 | `home-a.html`, `home-b.html` | F13 (a seção de guias na F11, os anúncios na F12) |
| UX-04 | Página de ferramenta, do soltar ao resultado (A e B), no comprimir imagem, e a variação do juntar PDF | obrigatório 4; F4-F7 e-2, f-1 e f-2 | `tool-a.html`, `tool-b.html`, `tool-a-merge.html`, `tool-b-merge.html` | F13 |
| UX-05 | Card do café no resultado, linha do rodapé, item do menu e a página de apoio (pt com Ko-fi e Pix) | obrigatório 5 | `coffee.html`, `support.html` | F12 |
| UX-06 | Parede do bloqueador com a Oli triste, `bloqueio` e `aviso`, o "Como desativar", o depois do escape e a variante da UE | obrigatório 6 | `wall.html` (estado pela URL) | F12 |
| UX-07 | Mapa de anúncios de cada molde a 360×740 e a 1280×800, com a densidade | obrigatório 7 | `ad-map.html` | F12 |
| UX-08 | A pose `sad` | obrigatório 8 | `oli/oli-sad.svg`, `oli/folha.html` | F12 |
| UX-09 em diante | Do diagnóstico, das pendências com mudança visual e da lista "para avaliar" (previstos: o aviso de cookies compacto, a acessibilidade das peças do PDF, o layout das calculadoras de casa e saúde, a Oli animada por estado, o mar à noite, o resultado passado à próxima ferramenta, as ferramentas recentes e o soltar em qualquer lugar) | diagnóstico, pendência ou "para avaliar" | um `.html` por item | F13 |

Cada protótipo recomendado é a especificação que a F11, a F12 e a F13 seguem. Ele traz a marcação, os tokens, os estados, os textos nos três idiomas, o teclado, o nome acessível, as medidas (alvo de 48 px e `ad-clearance`) e uma nota do que muda no JS e nas requisições.

**As convenções de todo protótipo** (a base da fatia 2 as fixa):
- HTML estático sobre `../../design/tokens.css`, `../../design/components/bundle.css` e `../../design/fonts/fonts.css`, mais o `proto.css` da pasta e um CSS por grupo quando precisar;
- abre por duplo clique (`file://`) e por http: script só inline e clássico, nada de `fetch` e nada de fora do repositório;
- o tema escuro é `?theme=dark`, a convenção dos previews do `docs/design/`;
- o idioma é `?lang=pt|es`; o estado é `?state=…`, e na parede é `?modo=…`;
- o controle de protótipo fica fora da moldura da página, é acessível por teclado e tem o nome "Prototype control" (`[data-proto-control]`);
- as variantes que o `prototipos.mjs` testa e fotografa vão nos `<meta name="proto-variants">` e `<meta name="proto-shots">`;
- a Oli entra inline com as peças do sprite e o `oli-clip` declarado uma vez, sempre `aria-hidden`, e o estado é dito em texto;
- o anúncio é a caixa neutra do AdSlot ("Advertisements", "Publicidade" ou "Anuncios"), sem script;
- cor nova só como `--proposta-*`, com os dois temas e o contraste calculado.

## 6. Quem faz o quê

- **O agente principal (Opus 5.5):** o plano, os §, a integração das branches, o `index.html`, o README, o `ESCOLHAS.md`, o relatório, os scripts de verificação e a sequência de Git e CI.
- **A exploração:** dez subagentes Sonnet (o dos concorrentes, que escreveu e rodou um script, foi Opus), já feita.
- **A fatia 1 (o diagnóstico):** um agente Opus escreve e roda o `diag/capturar.mjs` e grava o JSON das medidas. Depois, seis agentes de análise (um por tarefa) leem as capturas e as medidas e propõem os D-NN, e um agente de design (Opus) propõe os G-NN. A curadoria final é minha.
- **A fatia 2 (a base dos protótipos):** um agente Opus, no checkout principal.
- **A fatia 3 (os obrigatórios 1, 2, 5, 6 e 8):** agentes Opus em worktree, um por grupo de arquivos: o cabeçalho e os ícones; os guias; o café e a página de apoio; a pose `sad` e a folha, e depois a parede, que usa a pose. O primeiro passo de cada um é `git merge --ff-only fase-10`, e todo commit de merge leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`).
- **A fatia 4 (o obrigatório 7 e o `densidade.mjs`):** um agente Opus.
- **A fatia 5 (os obrigatórios 3 e 4):** dois agentes Opus em worktree, a home e a ferramenta, cada um com as duas alternativas.
- **A fatia 6 (o obrigatório 9 e a lista "para avaliar"):** agentes Opus, um por grupo de protótipos novos (as pendências do PDF, as das calculadoras e os itens propostos da lista).
- **A revisão:** quatro lentes Sonnet em contexto limpo, céticos Sonnet, um agente de correção Opus e uma segunda passada (seção 9).

Nenhum agente toca em `src/`, `tests/`, `scripts/`, `.github/`, `public/`, `docs/design/`, `docs/oli/`, `docs/claude/`, `docs/PENDENCIAS.md`, `docs/OPERACAO.md`, `CLAUDE.md`, os PLANOs, `package.json` ou `pnpm-lock.yaml`. Nenhum roda o `pnpm screenshots` nem o `pnpm design:gerar`. Nenhum usa dependência nova.

## 7. A ordem das fatias

Cada fatia termina com as verificações dela verdes e um commit (`docs: …`). O push vai nos marcos, e cada push roda o job `leve` da PR em rascunho.

1. **O diagnóstico.** O `diag/capturar.mjs`, a matriz no `dist/`, no build `all` e no fileorca.com, os D-NN e os G-NN, e as capturas citadas em `diagnostico/`. A fatia 2 e a pose `sad` rodam ao mesmo tempo, porque não dependem dela.
2. **A base dos protótipos.** O `proto.css`, o `index.html` inicial, o controle de protótipo, a Oli inline e a caixa do anúncio, com o `prototipos.mjs` verde.
3. **Os obrigatórios 1, 2, 5, 6 e 8,** em worktrees; depois, o merge na `fase-10` e o `prototipos.mjs` verde.
4. **O obrigatório 7** e o `densidade.mjs` verde.
5. **Os obrigatórios 3 e 4:** as primeiras alternativas, depois as segundas.
6. **O obrigatório 9 e a lista "para avaliar".**
7. **O README, o `ESCOLHAS.md`, o `index.html`, o contraste e as imagens,** com todas as verificações verdes.
8. **A revisão adversarial** sobre um commit fixo, as correções e a segunda passada.
9. **O fim:** o relatório, o `pnpm verificar --partes` (uma vez, com a máquina livre, sobre o último commit antes do relatório), o push, a espera da execução leve verde, o `gh pr ready` e a execução `portões`.

## 8. Os critérios e a prova de cada um

| # | Critério | Prova |
|---|---|---|
| 1 | Só documentação | `node .cache/f10/diff.mjs`; `git diff --stat origin/main...HEAD -- src tests scripts .github public docs/design docs/oli docs/claude docs/PENDENCIAS.md docs/OPERACAO.md CLAUDE.md package.json pnpm-lock.yaml astro.config.ts` vazio; o `pnpm ci:custo` da execução final com a classe `portões` |
| 2 | O README e o ESCOLHAS | `node .cache/f10/readme.mjs` |
| 3 | Os protótipos | `node .cache/f10/prototipos.mjs` (os dois navegadores, os dois temas, os dois tamanhos e `file://`) |
| 4 | O contraste | `node .cache/f10/contraste.mjs --readme` |
| 5 | A densidade | `node .cache/f10/densidade.mjs`: nenhum molde acima de 30 % a 360×740, e as regras de distância verdes |
| 6 | A pose `sad` | `node .cache/f10/oli-sad.mjs`: o `<symbol>` com até 4.096 bytes, e o SVG avulso, a folha e os dois PNG presentes |
| 7 | As imagens | `node .cache/f10/imagens.mjs` |
| 8 | O `pnpm verificar` | `pnpm verificar --partes`, com o resumo de cada parte e a soma no relatório |
| 9 | A revisão | `docs/relatorios/REVISAO-F10.md` sem achado crítico nem alto aberto |
| 10 | O CI | a execução depois do `gh pr ready` verde, com o `ci-ok` verde e o `merge` mesclando a PR (ou o motivo) |

## 9. A revisão adversarial (método da F3)

- Ela roda sobre um commit fixo e registrado da `fase-10`, numa worktree só de leitura (`git worktree add --detach .claude/worktrees/revisao-f10 <commit>`, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`).
- São quatro lentes Sonnet em contexto limpo, contra a ficha e este plano. Cada uma tem o próprio `FO_PORT` (de 4182 a 4185) e escreve só em `.cache/lente-<x>/`.
  - **(a) A evidência:** cada atrito se reproduz, os números conferem (refazer uma amostra), a heurística está citada certa, e nada dos concorrentes nem número absoluto do GA4 entrou no Git.
  - **(b) O design system, a Oli e a acessibilidade:** os tokens, a lista "Nunca", o contraste, o axe, o teclado, o leitor de tela, o movimento reduzido, a WCAG 2.2.2, o alvo de 48 px e a pose `sad`.
  - **(c) O anúncio, a parede e o café:** o mapa contra a seção B e "O que não muda"; a densidade refeita por conta própria; os 150 px; "O que derruba conta"; a parede contra a seção A (os modos, o escape, a região e o caso do Googlebot); textos sem pedido de clique; o café sem culpa.
  - **(d) A viabilidade e o contrato:** cada proposta cabe na F11, na F12 ou na F13 sem estourar o JS, as requisições, o CLS ou o Lighthouse, sem arquivo JS novo por página e sem dependência; nada contradiz as "Decisões fechadas" ou as "Mudanças no contrato" sem dizer; e os critérios 1 a 7.
- Cada achado médio ou acima ganha um cético próprio; os baixos de cada lente vão a um cético só.
- As correções ficam num agente Opus, e uma segunda passada revisa o diff delas.
- Os baixos que sobrarem vão para "Para o PENDENCIAS" do relatório. Tudo fica em `docs/relatorios/REVISAO-F10.md`. A worktree é removida no fim.

## 10. Os § previstos

Cada decisão da ficha ganha um §, em ordem; as novas vêm depois.

| § | Assunto |
|---|---|
| 342 a 357 | As decisões 1 a 16 da ficha, uma por §, com o desvio das screenshots (decisão 1) e as escolhas feitas dentro de cada uma |
| 358 | As URLs das tarefas e o guia do diagnóstico |
| 359 | Sem dados do GA4 e do Search Console |
| 360 | Como a densidade foi medida na prática (as alturas e as leituras estão na § 351) |
| 361 | O mapa de anúncios: o que muda da seção B, e a alternativa B |
| 362 | "Nenhum texto liga doação a anúncio": a leitura |
| 363 e 364 | O cabeçalho (UX-01) e o hub de guias (UX-02) |
| 365 a 367 | O destino das 37 pendências, a lista "para avaliar" e o que torna cada alternativa do FileOrca |
| 368 a 371 | O café (UX-05), a parede (UX-06), a home (UX-03) e a página de ferramenta (UX-04) |
| 372 a 379 | Os itens UX-09 a UX-18 |
| 380 | As screenshots e o verificador dos protótipos |

(Esta tabela foi atualizada no fim da fatia 7, com a numeração final.)

## 11. Riscos e a válvula

- **O tempo.** A válvula da ficha deixa cortar só as segundas alternativas da home e da ferramenta (obrigatórios 3 e 4), com um § e uma linha em "Para o PENDENCIAS". A run não planeja usá-la.
- **O WebKit do Windows trava sob carga.** As capturas e o `prototipos.mjs` rodam com no máximo dois navegadores ao mesmo tempo, e uma falha no WebKit é repetida com a máquina livre antes de virar defeito.
- **Os agentes em worktree nascem da `main`.** O briefing pede o `git merge --ff-only fase-10` como primeiro passo.
- **O repositório é público.** O prompt, o plano, o relatório, a revisão e as imagens ficam públicos. Nenhum dado pessoal, nenhum número absoluto do GA4 e nenhum material dos concorrentes entra no Git, e o Pix dos protótipos é de mentira (sem a chave real e sem QR que se leia).
