# Plano da F17: AVIF para JPG e Converter para WebP/AVIF (a run 2b)

Este plano é o gabarito da revisão adversarial final, ao lado da ficha da F17 (`PLANO-UX-QV.md`, "F17 · AVIF para JPG e Converter para WebP/AVIF (a run 2b)", com a linha D15) e do prompt da run (`docs/prompts/prompt-fase-17.txt`). Onde os dois parecem divergir, vale o mais rigoroso, com um §.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `624a168` ("F16: calculadoras, digitar sem tropeço e exportar números de verdade", PR 32). A branch é `fase-17`; a PR é a 33, aberta em rascunho logo depois do primeiro push.
- **No clone, no começo:** os dois arquivos do prompt e a pasta `Claude outputs/`, sem rastreio. Os dois arquivos do prompt entraram no primeiro commit (`cf8d19d`). O `git diff -- PLANO-FILEORCA.md` não mostrou diferença: o F14 m-1 continua aberto, e o arquivo não muda (decisão 2).
- **O `dist-base`:** a worktree `.claude/worktrees/f17-base` (destacada em `624a168`), com `pnpm install --frozen-lockfile` e `pnpm build` (`.cache/f17/base-build.sh`); a cópia do `dist/` fica em `.cache/f17/dist-base`.
- **Linha de base medida no ponto de partida** (`.cache/f17/antes/`):
  - Vitest: 136 arquivos e 2.144 testes. Na rodada da linha de base, com sete exploradores e um build na mesma máquina, um teste do `conteudo.test.ts` ("checks the ten file guides…") passou dos 5 s e reprovou por tempo; os outros 2.143 passaram. É carga da máquina, não defeito: o relatório da F16 tem o mesmo arquivo verde. Ele é medido de novo na máquina livre, no fechamento.
  - `playwright test --list`: 2.406 testes por navegador, em 84 arquivos.
  - `dist/_astro/`: 66 arquivos JS; o grupo `island` (`island.CMhec-MJ.js`) com 68.161 bytes e **23.291 bytes com gzip** (nível 9; `.cache/f17/antes/astro-js.json`).
  - O `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium: 343 testes verdes (`.cache/f17/antes/budgets-chromium.log`); as irmãs (`/heic-to-jpg/`, `/webp-to-jpg/`, `/png-to-jpg/` e as de pt e es) com 2 arquivos JS, de 28,1 a 28,2 KB com gzip, e 6 requisições.
  - As contagens do site, o `accept` do manifest, a busca por "avif" e os controles negativos (a página do AVIF to JPG dá 404 no `serve-dist`; o AVIF recusado no Compress não tem link) são medidos no `dist-base` no fechamento, pelo mesmo script do `dist/` novo (`.cache/f17/measure-site.mjs`).

### O que a exploração achou de diferente do plano e do prompt

- **D15 e o grupo 13 conferem no código:** o motor tem a leitura e a escrita de AVIF, a escrita de WebP e a operação `convert` com `level`; o `ImagePanelData.converters` já tem o lugar do `avif`; o `convertersFor()` do `page.ts` já itera `heic` e `avif`, e basta o `CONVERTER_FOR` ganhar o `avif`. Nada da F14, F15 ou F16 tocou nas duas ferramentas.
- **Os tipos pedem os três idiomas desde a F6:** `IMAGE_TOOL_TEXTS` é `Record<ImagePageId, Record<Lang, …>>`, e o `tools` de cada `common.ts` é `Record<ImagePageId, ToolBlurb>`. Uma ferramenta nova não compila só em inglês, então a fatia 1 entra nos três idiomas (as rotas com o `TRANSLATED_PATHS`, as seis páginas, os cartões e os textos de pt e es), como o "Como trabalhar" pede para as rotas, e a frente T revisa os textos de pt e es em vez de escrevê-los do zero (§ 705).
- **O roteiro "Como acrescentar uma ferramenta de imagem"** (`docs/claude/imagem.md`, F2) diz que a rota nasce "só com `en`": desatualizado desde a F6 (o `TRANSLATED_PATHS`). A seção nova da F17 diz o que mudou (decisão 16).
- **A parte 4 do WebKit já passa do alvo de 700 s no ponto de partida:** na execução completa da PR 32 (`42850434817`), o `total` do `verificar` dessa parte deu 746,0 s (job de 831 s), com o `clearance.spec.ts` inteiro nela (83 testes, 819 s de teste). É o F14 m-5 (grupo 24), fora desta run ("Fora": nenhum teste novo no `clearance.spec.ts`; os itens de outros grupos). A run projeta as partes com os testes novos e mostra que nenhuma parte passa de 700 s **por causa dos testes desta run**, e que a 4 do WebKit não piora por eles (§ 717).
- **O rótulo `ci` não existe** (`gh label list`, 10/nov/2026): a conferência no Linux do meio da run não acontece; a execução final faz esse papel, e a medida do AVIF no runner vai na descrição da PR e numa linha do grupo 27 (decisões 10 e 19; § 718).
- **A galeria do kit** (`docs/lancamento/product-hunt/`): nenhuma imagem mostra a contagem de ferramentas de imagem nem a grade do hub de imagem (a `gallery-1.png` é a home antiga, com seis cartões inteiros que não mudam). Pela decisão 11, a galeria não é regerada (§ 713).
- **`python3` não existe nesta máquina** (o atalho da Microsoft Store): edição por script usa o `node`.

## 2. Os § reservados

Só o agente principal escreve no `DECISOES.md`. As frentes escrevem os rascunhos de § e as pegadinhas em `C:/Users/vmatusita/projetos/fileorca/.cache/f17/fronts/<frente>.md` (no clone principal, pelo caminho absoluto), e o agente principal os põe nos § reservados, na junção.

| § | Assunto | Quem escreve |
| --- | --- | --- |
| 701 | A especificação: a ficha e o prompt como contrato; o que a exploração achou (D15, o grupo 13, o roteiro velho) | principal |
| 702 | Os planos, o `PLANO-FILEORCA.md` sem diferença (o F14 m-1 aberto) e o prompt gravado | principal |
| 703 | Os nomes, os caminhos e o glossário (decisão 3); as palavras de pt e es | principal, com as notas da frente T |
| 704 | Os textos de en: o rascunho da F2 conferido contra o motor; a frase de suporte com a fonte (decisão 4) | principal |
| 705 | A fatia 1 nos três idiomas (os tipos pedem pt e es) e o `warm` das duas ferramentas | principal |
| 706 | Os ícones (decisão 6) | principal, com as notas da frente S |
| 707 | O `next`, o `related` e o `carry` (decisão 5) | principal, com as notas da frente S |
| 708 | A recusa do AVIF com o link e o artigo em inglês (decisão 7) | principal, com as notas da frente T |
| 709 | As frases desmentidas e as contagens; os textos novos nos três idiomas, lado a lado (decisão 8) | principal, com as notas da frente T |
| 710 | O lugar no site: os leitores do registro, a "Abrir com", o `share_target` e o GA4 (decisão 9) | principal, com as notas da frente S |
| 711 | A matriz das duas ferramentas: as fixtures, o AVIF na saída e os lotes (decisão 10) | principal, com as notas da frente M |
| 712 | A medida do codificador AVIF numa foto de 12 MP (decisão 10) | principal, com a medida do fechamento |
| 713 | O kit de lançamento (decisão 11) | principal |
| 714 | O orçamento (decisão 12) | principal, no fechamento |
| 715 | Os anúncios, o CLS, o axe e o Lighthouse (decisão 13) | principal, no fechamento |
| 716 | Os testes antigos que mudaram, no formato da § 341 (decisão 14) | principal, com as notas das frentes |
| 717 | Os specs novos, os nomes e as partes do CI; a parte 4 do WebKit (decisões 14 e 19) | principal |
| 718 | A conferência no Linux: o rótulo `ci` não existe (decisão 19) | principal |
| 719 | O resultado da revisão adversarial | principal, depois da revisão |

Decisão que não couber num desses vira um § novo a partir do 720, na ordem em que for escrito.

## 3. A interface que as frentes dividem (fatia 1, do agente principal)

- **Os ids e as rotas** (decisão 3), em `IMAGE_TOOL_IDS` depois de `png-to-jpg` e antes de `image-to-pdf`, no `RouteId`, no `imageToolRoutes()` e no `TRANSLATED_PATHS`:

  | Id | en | pt | es |
  | --- | --- | --- | --- |
  | `avif-to-jpg` | AVIF to JPG · `/avif-to-jpg/` | AVIF para JPG · `/pt/avif-para-jpg/` | AVIF a JPG · `/es/avif-a-jpg/` |
  | `convert-to-webp` | Convert to WebP · `/convert-to-webp/` | Converter para WebP · `/pt/converter-para-webp/` | Convertir a WebP · `/es/convertir-a-webp/` |

- **O registro:** `avif-to-jpg` aceita `['avif']`, `beforeAfter: 'lossy'`, `next: ['compress-image', 'resize-image', 'image-to-pdf']`; `convert-to-webp` aceita `['jpeg', 'png']`, `beforeAfter: 'lossy'`, `next: ['resize-image', 'compress-image']`. O `icon` das duas é `convert` na fatia 1 (provisório: a frente S troca pela decisão 6), e o `related` é o da F2 (a frente S ajusta, com as listas das irmãs). `CONVERTER_FOR = { heic: 'heic-to-jpg', avif: 'avif-to-jpg' }`.
- **O `IMAGE_EVENT_TOOLS`** ganha os dois ids, na ordem do registro.
- **O `ConvertToOptionsTexts`** (`src/i18n/types.ts`): `formatLegend`, `webp`, `avif`, `levelLegend`, `recommended`, `recommendedHelp`, `strong`, `strongHelp` e `now` ("{format} · {level}", que dá "WebP · Recommended").
- **As ilhas:** `src/tools/avif-to-jpg/` (`NoteOptionsTexts`, sem `now`, como o PNG to JPG: a frase fica à vista) e `src/tools/convert-to-webp/` (dois `OptionGroup`, `cw-format` e `cw-level`; `now` pelo `fmt`). As duas com `warm: []` e `success: 'converted'`.
- **Os textos fixos que mais de uma frente usa:**
  - o hub de imagem: en `title` "Image tools: ten free tools, no upload", `h1` "Ten image tools, zero uploads", a descrição e a intro com "Ten"; pt "Ferramentas de imagem: dez ferramentas grátis, sem upload", `h1` "Dez ferramentas de imagem, sem upload"; es "Herramientas de imagen: diez gratis, sin subir archivos", `h1` "Diez herramientas de imagen, sin subir nada" (a frente T escreve; a frente S fixa nos testes do hub);
  - a frase da recusa com o link (a frente T escreve; a frente M fixa no `AVIF_LINK` da matriz): en "photo.avif is an AVIF file. Open it in AVIF to JPG." e "x.heic is a HEIC file. Open it in HEIC to JPG."; pt "… é um arquivo AVIF. Abra-o em AVIF para JPG."; es "… es un archivo AVIF. Ábrelo en AVIF a JPG.", com o link no nome da ferramenta e o `href` do idioma da página;
  - a linha de especificação das ferramentas gerais (a frente T escreve): en "HEIC photos go through HEIC to JPG first, and AVIF files through AVIF to JPG."
- **O dono de cada arquivo que mais de uma frente toca:**
  - `src/tools/image/i18n/{en,pt,es}.ts`: a frente T no bloco `errors` (a recusa); a frente S só no bloco `carry.chips`. Nenhuma outra linha.
  - `src/i18n/types.ts`: a frente T no `ImagePanelTexts.errors`; a frente S só no tipo do `carry.chips`.
  - `src/i18n/{en,pt,es}/common.ts`: os cartões já estão na fatia 1; a frente T pode mudar o texto dos cartões de pt e es; a frente S, nada.
  - `src/tools/image/registry.ts` e `page.ts`: só a frente S.
  - `src/tools/image/ImagePanel.tsx`: só a frente T (a recusa).
  - `tests/e2e/lib/matrix.ts`, `image-matrix.spec.ts`, `image-smoke.spec.ts`, `budgets.spec.ts`, `ads.spec.ts`, `lib/ad-clearance.ts`, `fo-ad-map.spec.ts`, `lib/ad-map.ts`, `tool-slot.spec.ts`, `tool-i18n.spec.ts`, `a11y.spec.ts`, `launch-claims.spec.ts`, `image-privacy.spec.ts`, `events.spec.ts`, `scripts/fixtures/matrix-table.ts`: só a frente M.
  - `tests/unit/image-texts.test.ts`, `tool-count.test.ts`, `home.test.ts`, `island.spec.ts`, `scripts/gates/lint-texto.ts`: só a frente T.
  - `tests/unit/image-hub.test.ts`, `hub-icons.test.ts`, `icons.test.ts`, `conteudo.test.ts`, `routes.test.ts`, `seo-*.test.ts`, `open-with.test.ts`, `image-tool-ops.test.ts`, `tests/e2e/share-target.spec.ts` e o Vitest novo do registro: só a frente S.
  - `DECISOES.md`, `docs/PENDENCIAS.md`, `docs/claude/`, `docs/lancamento/`, `docs/relatorios/`: só o agente principal.

## 4. Quem faz o quê, e a ordem

1. **Fatia 1, o agente principal** (feita antes das frentes): o primeiro commit, o push e a PR em rascunho; a base (o registro, as rotas dos três idiomas, o `CONVERTER_FOR`, o `IMAGE_EVENT_TOOLS`, o `ConvertToOptionsTexts`, as duas ilhas, as seis páginas, os textos de en e um primeiro texto de pt e es, os cartões dos três idiomas e as duas linhas do glossário). Com o `pnpm tipos` e o `pnpm build` verdes, commit e push.
2. **Fatia 2, três frentes ao mesmo tempo**, cada uma num agente `opus` na sua worktree, a partir do commit da fatia 1 (o primeiro passo de cada uma é `git merge --ff-only fase-17`):
   - **M (a matriz e os testes de ponta a ponta):** a decisão 10 inteira (a matriz e a medida), a prova da recusa com o link (decisão 7), as opções no `image-smoke.spec.ts`, o chip com AVIF na saída, as páginas no `budgets.spec.ts`, no `ads.spec.ts` (com o `.fo-ba` no `ON_SCREEN`), no `SMALL_OF` e no `fo-ad-map.spec.ts` (184 → 190), as entradas de AVIF do `tool-slot.spec.ts`, do `tool-i18n.spec.ts` e do `a11y.spec.ts`, e as páginas novas no `image-privacy.spec.ts`, no `launch-claims.spec.ts` e no `events.spec.ts` (o `tool` dos dois ids).
   - **T (os textos e os idiomas):** a revisão dos textos de pt e es das duas ferramentas e dos cartões, as 15 linhas de especificação do AVIF nas outras ferramentas (três idiomas), o artigo em inglês (decisão 7), as contagens (decisão 8: o hub nos três idiomas e as linhas do `guide`, os comentários que contam, o `COUNT_SAMPLES` do `lint:texto`), o `image-texts.test.ts`, o `tool-count.test.ts`, o `home.test.ts`, o `island.spec.ts` (a frase do HEIC), o `i18n-budgets.spec.ts` (confere que as páginas de pt e es entram) e o `lint:texto` com 0 erro.
   - **S (o site e os ícones):** os ícones (decisão 6), o `next`, o `related` e o `carry` (decisão 5), o que lê o registro (decisão 9, conferido no `dist/` nos três idiomas), o Vitest do registro e os testes de contagens e listas (o `image-hub.test.ts`, o `hub-icons.test.ts`, o `icons.test.ts`, o `conteudo.test.ts`, o `routes.test.ts` com a busca por "avif", os `seo-*.test.ts`, o `open-with.test.ts`, o `image-tool-ops.test.ts` e o `share-target.spec.ts`).
   - **O agente principal, ao mesmo tempo:** o kit de lançamento (decisão 11), a seção do `docs/claude/imagem.md` (rascunho), o `docs/PENDENCIAS.md` e os § que não dependem das frentes.
3. **Fatia 3, o agente principal junta M, T e S** (`git merge --no-ff -F <arquivo>` com o trailer), resolve os conflitos, deixa o `pnpm tipos` verde, roda os specs das três frentes nos dois navegadores e os de anúncio no build de teste. A conferência no Linux não acontece (o rótulo `ci` não existe; § 718).
4. **Fatia 4, o agente principal fecha:** o orçamento contra o `dist-base`, o Lighthouse das seis páginas (`.cache/f17/lhci/`), as três rodadas da medida do AVIF, a tabela da matriz, a projeção das partes, as imagens e as tabelas do relatório.
5. **A revisão adversarial final** (três lentes Sonnet em contexto limpo, sobre um commit fixo, numa worktree só de leitura), as correções num agente `opus` e a segunda passada.
6. **Fechar:** o `pnpm verificar --partes`, o relatório e a sequência de fim da decisão 19.

## 5. A projeção do tempo das partes

Pelos tempos de teste da execução completa da PR 32 (`42850434817`; `.cache/f17/explore/ci-durations-42850434817.json`, lidos por `.cache/f14/ci-durations.mjs`), a matriz de imagem fica nas partes 5 e 6 do Chromium (`total` de 324,1 e 541,3 s) e na 9 do WebKit (347,7 s). O que esta run soma, por estimativa antes de escrever (a F2 mediu o AVIF na saída em 6,0 s locais e 50 s no WebKit do CI, com as oito fixtures; aqui ele vai só nas fixtures pequenas):

| Bloco novo | Testes por navegador | Chromium (s de teste) | WebKit (s de teste) |
| --- | --- | --- | --- |
| Matriz: Convert to WebP em WebP (2 lotes), em AVIF (1 lote, fixtures pequenas), AVIF to JPG (1 lote, com a cadeia da transparência) | 4 | ~25 | ~50 |
| A medida do AVIF numa foto de 12 MP | 1 | ~5 | ~15 |
| `budgets` (2), `ads` (6), `i18n-budgets` (8), `a11y` (≈ 12 a 18), `tool-slot`, `tool-i18n` e `fo-ad-map` (1 bloco a mais) | ≈ 40 | ~150 | ~250 |

Numa parte, o tempo é de 0,52 a 0,73 vez a soma dos testes dela (§ 648), e os testes novos se espalham pelas partes pela ordem dos nomes. A pior parte que recebe a matriz (a 6 do Chromium) iria de 541 a uns 560 s; a 9 do WebKit, de 348 a uns 400 s. A projeção de verdade sai do `--list --shard` da branch com os testes novos (`.cache/f14/part-files.mjs`) na fatia 4, e vai no § 717. Se uma parte passar de 700 s por causa dos testes desta run, a PR separada das partes (decisão 19).

## 6. Cada critério e o que o prova

| Critério (ficha e prompt) | Prova |
| --- | --- |
| A matriz das duas com cada fixture que elas aceitam, nos dois navegadores; AVIF na saída nas fixtures pequenas | `image-matrix.spec.ts` (Chromium e WebKit) e a tabela `docs/relatorios/fase-17-matriz.md` (`node scripts/fixtures/matrix-table.ts`) |
| A recusa de AVIF nas outras ferramentas com o link novo | `image-matrix.spec.ts` (o `AVIF_LINK`, frase exata, `href` e nome nos três idiomas) e `image-texts.test.ts`; controle negativo no `dist-base` |
| `gate:seo`, `gate:links`, `gate:conteudo` e `launch-kit.test.ts` verdes | os portões no `pnpm verificar --partes` e o Vitest |
| Cada página nova com os mesmos 2 JS e 6 requisições das irmãs; as outras como no ponto de partida | `budgets.spec.ts`, `i18n-budgets.spec.ts` e a comparação arquivo a arquivo com o `dist-base` (`.cache/f17/compare-budgets.mjs`) |
| A densidade de anúncio em até 30 % a 360 × 740; a distância de 150 px | `ads.spec.ts` e `fo-ad-map.spec.ts` no build de teste |
| Nenhuma parte do CI acima de 700 s por causa desta run | a projeção do § 717 e a execução completa final |
| `pnpm verificar` verde | `pnpm verificar --partes` na máquina e o CI completo |
| As contagens dizem dez ferramentas de imagem (site e kit) | `image-hub.test.ts`, `tool-count.test.ts`, `launch-kit.test.ts` e a medida do `dist/` (`.cache/f17/measure-site.mjs`) |
| A medida do AVIF numa foto de 12 MP | o spec da medida (três rodadas na máquina, nos dois navegadores) e as linhas `[avif 12 MP]` da execução completa |
| Nada sai do aparelho; nenhuma saída leva metadados nem GPS; nenhum evento ou parâmetro novo no GA4 | `image-privacy.spec.ts`, `launch-claims.spec.ts`, `events.spec.ts` e a matriz (`metadataReport`) |
| `lint:texto` com 0 erro; `english-leak`, `glossary`, `claude-md` e `pendencias` verdes | `pnpm lint:texto` e o Vitest |
| Lighthouse ≥ 90 nas seis páginas; axe sem violação; CLS sem gesto 0 | `.cache/f17/lhci/` (configuração temporária), `a11y.spec.ts`, `layout-shift.spec.ts` e `tool-slot.spec.ts` |
| Os documentos (decisões 11, 16 e 17) em dia | `launch-kit.test.ts`, `claude-md.test.ts`, `pendencias.test.ts` e a leitura da revisão |
| Os testes antigos que mudaram, num §, um por um | § 716 |
| A revisão adversarial sem achado alto ou médio aberto | `docs/relatorios/REVISAO-F17.md` |
