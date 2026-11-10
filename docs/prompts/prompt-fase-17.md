# Fase 17: AVIF para JPG e Converter para WebP/AVIF (a run 2b)

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F17 do FileOrca, "AVIF para JPG e Converter para WebP/AVIF (a run 2b)", a quarta das cinco runs do `PLANO-UX-QV.md`. As duas ferramentas de imagem que o `data/keywords.csv` aprovou na F0 (AVIF to JPG, 10K–100K buscas por mês e subindo; Convert to WebP, 1K–10K) saíram na válvula da F2 por causa do tempo do CI (§ 85). O motor delas está pronto desde então. Esta run põe as duas no ar em inglês, português e espanhol, com a matriz de verdade, sem levar nenhuma parte do CI acima de 700 s.

Ao terminar:

- as seis páginas novas existem no build, no molde das irmãs e com os blocos do `gate:conteudo`: `/avif-to-jpg/`, `/convert-to-webp/`, `/pt/avif-para-jpg/`, `/pt/converter-para-webp/`, `/es/avif-a-jpg/` e `/es/convertir-a-webp/`;
- o AVIF to JPG recebe AVIF e entrega JPG, com a transparência em branco e a nota dela;
- o Convert to WebP recebe JPG e PNG e entrega WebP (o padrão) ou AVIF, em Recommended ou Strong, com a transparência guardada;
- um AVIF largado em qualquer outra ferramenta de imagem é recusado com o link para o AVIF to JPG do idioma da página, como o HEIC já é com o HEIC to JPG;
- as duas estão no registro, nos chips e nas relacionadas, no hub, na home, no rodapé, no menu, na busca, na "Abrir com" e no `share_target`, no sitemap, no hreflang, no OG e no schema;
- as contagens do site e do kit de lançamento dizem dez ferramentas de imagem;
- a matriz cobre as duas com cada fixture que elas aceitam, nos dois navegadores, com AVIF na saída nas fixtures pequenas, e a medida do codificador AVIF numa foto de 12 MP está num §;
- cada página nova carrega os mesmos 2 arquivos JS e as mesmas 6 requisições das irmãs, e as outras páginas, os mesmos do ponto de partida;
- nada sai do aparelho, nenhuma saída leva metadados nem GPS, e nenhum evento ou parâmetro novo vai para o GA4;
- o `docs/claude/`, o `docs/lancamento/`, o glossário e o `docs/PENDENCIAS.md` estão em dia;
- o relatório está em `docs/relatorios/fase-17.md`, a matriz em `docs/relatorios/fase-17-matriz.md` e a revisão em `docs/relatorios/REVISAO-F17.md`;
- a PR da branch `fase-17` sai pronta, com o CI completo verde, e o CI a mescla sozinho.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está em `624a168` (a F16, PR 32) ou num commit mais novo. Confira com `git log --oneline -5` e guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

No clone, sem commit:

- `docs/prompts/prompt-fase-17.md` e `docs/prompts/prompt-fase-17.txt` (este prompt);
- talvez o `PLANO-FILEORCA.md` modificado com uma linha só, posta pelo Victor antes da run (decisão 2);
- a pasta `Claude outputs/`, que fica fora de tudo.

O que você precisa saber antes de planejar:

- **A ficha da F17** está no `PLANO-UX-QV.md`, em "Fichas para a prompt-ultracode" → "F17 · AVIF para JPG e Converter para WebP/AVIF (a run 2b)": a missão, as entradas, o "Dentro", o "Fora", os critérios, a válvula e o destino. A linha D15 do diagnóstico diz de onde ela vem. Leia as duas partes inteiras, e também "O que não entra, e por quê" e "Regras de todas as runs deste plano".
- **O que mudou desde o plano.** Ele foi escrito em 9/nov/2026, antes da F14, da F15 e da F16. Nenhuma das três tocou nas duas ferramentas. A F15 mexeu na ilha de imagem (a lixeira em todo lote, os chips da Imagem para PDF que levam o PDF, o "Até um tamanho" do Comprimir), e a F16, no foco depois do campo de número das imagens (§ 692). O grupo 26 do `docs/PENDENCIAS.md` fica fora desta run: em 10/nov/2026, o Victor escolheu deixar o m-1, o m-2 e o m-3 lá. Confira a D15 e o grupo 13 no código do ponto de partida antes de planejar e registre no plano o que achar diferente.
- **O que a F2 tirou e de onde recuperar.** O commit `3812f49` tirou as páginas, as pastas, o registro, as rotas, os textos e as contagens. O `840d565` tirou os casos da matriz, dos anúncios e dos orçamentos. Os dois são da branch da F2, que entrou na main por squash (PR 5), e não estão na história da main.
  - Confira com `git cat-file -t 3812f49`. Se faltar, rode `git fetch origin pull/5/head`, que é só leitura e não cria ref.
  - Leia com `git show 3812f49 --stat`, `git show 3812f49^:<caminho>` e `git show 840d565^:<caminho>`.
  - Eles são referência, nunca patch: o código mudou muito desde então (o pt e o es da F6, o molde da F13a, as listas da F15). Nada de `git revert`, `cherry-pick` ou `git apply` deles.
- **O motor já faz tudo** (§ 61, § 62 e § 85):
  - a leitura de AVIF, pelo navegador quando ele sabe e pelo jSquash quando não sabe;
  - a escrita de AVIF, sempre pelo jSquash (qualidade 50 e 35, velocidade 9), e a de WebP;
  - a operação `{ kind: 'convert', to, level }` (`src/engine/image/types.ts` e `process.ts`).

  O `formats` dos textos da ilha já tem o AVIF, e o `ImagePanelData.converters` já tem o lugar do `avif`. O `CONVERTER_FOR`, em `src/tools/image/registry.ts`, é a fonte única dos links de conversor.
- **A ilha de imagem e o registro hoje:**
  - em `src/tools/image/`: o `registry.ts` (`IMAGE_TOOL_IDS`, `IMAGE_PAGES`, `next`, `related`, `elsewhere` e `CONVERTER_FOR`), o `page.ts` (`chipsFor`, `carryTo`, `convertersFor` e `panelData`), o `types.ts`, o `texts.ts`, o `ImagePanel.tsx` e o `ImageToolPage.astro`;
  - cada ferramenta numa pasta `src/tools/<slug>/` (`Panel.tsx`, `mount.ts`, `<Slug>Page.astro` e `i18n/{en,pt,es}.ts`), com a página em `src/pages/<slug>/index.astro`, `src/pages/pt/<caminho>/index.astro` e `src/pages/es/<caminho>/index.astro`. O `webp-to-jpg` e o `heic-to-jpg` são os moldes mais próximos;
  - as rotas em `src/i18n/routes.ts` (`RouteId`, `imageToolRoutes()` e `TRANSLATED_PATHS`) e os cartões em `src/i18n/{en,pt,es}/common.ts` (`tools`);
  - o roteiro "Como acrescentar uma ferramenta de imagem", na seção da F2 do `docs/claude/imagem.md`, que esta run atualiza (decisão 16).
- **Quem lê o registro sozinho:**
  - o hub (`ImageToolsView.astro`), a home (`home-bands.ts`), o rodapé (`tool-count.ts`), o menu (`header-menu.ts`), a busca (`search-index.json.ts`), a 404 e o OG (`src/pages/og/`);
  - a "Abrir com" (`OpenWithView.astro` e `src/share/tools.ts`) e o `share_target` do manifest (`shareAccept()`). Com o AVIF to JPG, o `image/avif` e o `.avif` passam a entrar no `accept` do manifest e na "Abrir com" (decisão 9).

  A lista fechada do parâmetro `tool` do GA4 é a `IMAGE_EVENT_TOOLS`, em `src/analytics/tool-ids.ts`, e ela não lê o registro.
- **As fixtures:**
  - uma só em AVIF, a `gen-avif.avif` (1600 × 1200, sem transparência);
  - as que o Convert to WebP aceita são os JPG e os PNG de `fixtures/images/`, pelo formato real (`expected.json`), da `gen-png-transparente.png` às fotos de celular;
  - a `jpg-01-pixel2-retrato-gps.jpg` tem 12 MP.

  Nenhuma fixture nova entra (decisão 10).
- **O próximo § livre do `DECISOES.md` é o 701.** Escreva os § na ordem. O grupo novo do `docs/PENDENCIAS.md` é o 27.
- **A linha de base,** do relatório da F16:
  - o Vitest com 136 arquivos e 2.144 testes;
  - o `--list` do Playwright com 2.406 testes por navegador, em 84 arquivos;
  - 66 arquivos JS em `dist/_astro/`;
  - 25 partes no `pnpm verificar --partes` (o build, os portões, o Lighthouse, 8 do Chromium e 14 do WebKit), somando 3.129,1 s.

  Confira tudo no ponto de partida e use os seus números.
- **O tempo das partes no CI não é o da máquina** (§ 648 e a seção F14 do `docs/claude/ci.md`).
  - Use os tempos de teste da execução completa da PR 32. Ache o id com `gh pr checks 32` ou `gh run list --branch fase-16 --limit 10`.
  - Leia com os scripts `.cache/f14/ci-durations.mjs` e `.cache/f14/part-files.mjs`. Se eles não estiverem no `.cache/`, refaça os dois pela descrição do `docs/claude/ci.md`.
  - Na F2, o AVIF na saída foi a parte mais pesada da matriz: 50 s no WebKit do CI (relatório da F2).
- **O rótulo `ci` não existia na F15 nem na F16** (§ 666 e § 698), e criá-lo é só do Victor. As notas da regra 1 do `CLAUDE.md` e a decisão 19 dizem o que fazer nos dois casos.
- **O repositório é público** (§ 338): tudo o que você commita, a PR, os logs e os artefatos ficam públicos.
- **O CI roda por classe** (F9). A PR em rascunho roda o job leve. A PR pronta roda tudo e, como esta run não mexe em `.github/`, é mesclada sozinha.

Leia antes de planejar, nesta ordem de autoridade:

1. **A ficha da F17 e este prompt.** Os dois juntos são a ficha da run: este prompt detalha e fecha o que a ficha deixa aberto, e nunca afrouxa um critério dela. Se parecerem conflitar, vale o mais rigoroso, com um §.
2. **Os planos:**
   - o `PLANO-UX-QV.md`: a D15, as regras de todas as runs e a ficha;
   - o `PLANO-MELHORIAS.md`: as regras de toda run;
   - o `PLANO-FILEORCA.md`: "Execução por IA", as "Decisões fechadas" e a linha da F2 do catálogo por fase ("AVIF to JPG" e "Convert to WebP/AVIF").
3. **O `CLAUDE.md`,** inteiro.
4. **De `docs/claude/`:**
   - o `imagem.md`, o `playwright.md` e o `windows-git-bash.md`, inteiros;
   - do `idiomas.md`, o que fala do `lint:texto`, do glossário e do kit do Product Hunt, e as seções da F6, do ajuste de idiomas e da F13b;
   - do `ci.md`, as pegadinhas gerais da F1a e as seções da F2, do ajuste do CI em partes, da F9 e da F14;
   - do `design-e-oli.md`, as pegadinhas gerais e a seção da F13a (os ícones);
   - do `service-worker.md`, o que fala da "Abrir com" e do compartilhar;
   - do `anuncios.md`, o que fala da distância, da densidade e do mapa de anúncios.
5. **Do `DECISOES.md`, só buscando o §:**
   - da F2: de § 58 a § 90, com atenção à § 62, à § 69, à § 70, à § 77, à § 78, à § 80, à § 81, à § 82, à § 85 e à § 88;
   - as outras: § 46, § 191, § 290, § 291, § 341, § 469, § 490, § 491, § 496, § 497, § 602, § 614, § 648, § 653, § 654, § 663, § 666, § 680, § 695, § 698 e § 700;
   - e o que elas citarem.
6. **Do `docs/design/`:** o `README.md` ("Layout e anúncios" e os ícones), o README de `docs/design/assets/Icons/` e os README do ToolPage, do OptionGroup e do BeforeAfter.
7. **Do `docs/PENDENCIAS.md`:** "Como ler", o Resumo, os grupos 12, 13, 24 e 26, "Registrados" e "Já corrigidos"; e o `tests/unit/pendencias.test.ts`, que confere o arquivo.
8. **Do `docs/i18n/`:** o glossário de pt e o de es.
9. **Do `docs/lancamento/`:** a seção "Linhas que mudam com a 2b" do `README.md` e as linhas marcadas com `<!-- muda com a 2b -->`.

# Escopo

Dentro: o "Dentro" da ficha inteiro, com estes arquivos:

- `src/tools/avif-to-jpg/` e `src/tools/convert-to-webp/` (novos) e as seis páginas em `src/pages/`;
- em `src/tools/image/`, o registro, o `CONVERTER_FOR`, o `page.ts` e os tipos, só no que as duas pedem;
- o `ConvertToOptionsTexts`, que volta em `src/i18n/types.ts`;
- o `src/i18n/routes.ts` e os cartões de `src/i18n/{en,pt,es}/common.ts`;
- os textos da ilha (`src/tools/image/i18n/`) que as duas pedem, como o `carry` dos chips e o artigo da decisão 7;
- os textos das outras ferramentas de imagem e do hub que as duas desmintam: as linhas de especificação "AVIF files are not accepted" do Compress, do Resize, do Crop, do Rotate e da Image to PDF, nos três idiomas, e as contagens;
- o `src/analytics/tool-ids.ts`, só os dois ids na lista fechada do `tool` (decisão 9);
- os ícones das duas, se a decisão 6 pedir desenho novo (`docs/design/assets/Icons/`, `src/icons/svg.ts` e o que o `icons.test.ts` pedir);
- o glossário (`docs/i18n/pt.md` e `es.md`), só as linhas novas da decisão 3;
- o `docs/lancamento/`: as linhas marcadas e as contagens do `product-hunt.md` (decisão 11);
- os testes:
  - os casos novos da matriz (`tests/e2e/lib/matrix.ts` e `image-matrix.spec.ts`) e a recusa do AVIF com o link;
  - as páginas novas no `budgets.spec.ts`, no `i18n-budgets.spec.ts`, no `ads.spec.ts` e no `fo-ad-map.spec.ts`;
  - um teste de opções no `image-smoke.spec.ts` e a medida da decisão 10;
  - os testes que fixam as contagens, as rotas, a busca, os hubs, os ícones e o `accept` do manifest: o `routes.test.ts`, o `image-hub.test.ts`, o `hub-icons.test.ts`, o `conteudo.test.ts`, os `seo-*.test.ts`, o `image-texts.test.ts`, o `open-with.test.ts`, o `launch-kit.test.ts` e os outros que a exploração achar;
- os documentos:
  - uma seção nova no fim do `docs/claude/imagem.md` (e do `playwright.md`, se houver pegadinha dele);
  - o `docs/PENDENCIAS.md`, o `DECISOES.md` e o `docs/relatorios/fase-17-matriz.md`.

Fora (não toque): o "Fora" da ficha inteiro (mudar o que as outras ferramentas aceitam, presets novas, guia novo), e mais:

- `src/engine/`: o motor não muda. A exceção é um defeito real que a matriz das duas ache nele. Nesse caso, corrija a causa com um Vitest que reprova sem a correção e um §, e a revisão sobe para cinco lentes ("Como trabalhar", passo 5);
- uma escolha de PNG no AVIF to JPG: o catálogo do `PLANO-FILEORCA.md` diz "AVIF to JPG", e o desenho da F2 é só JPG, com a nota (decisão 5);
- o Convert to WebP aceitar WebP, HEIC, AVIF ou GIF: o desenho da F2 é JPG e PNG (decisão 5);
- as fixtures: nenhuma nova nem mudada, e o `pnpm fixtures` não roda;
- o `lighthouserc.json` (decisão 13), o `.github/`, o `.githooks/` e o `.claude/settings.json`; nenhum teste novo no `clearance.spec.ts` (F14 m-5);
- chave nova no `localStorage`, no `sessionStorage` ou no IndexedDB; evento ou parâmetro novo no GA4 (os dois ids na lista fechada do `tool` não são parâmetro novo, decisão 9); dependência nova;
- as calculadoras, a ilha de PDF, o QR e o código de `src/share/` e de `src/sw/`: o que eles leem do registro muda sozinho, e só os testes deles acompanham;
- a busca além do índice (o D16 é do Victor);
- os itens do grupo 26 do `docs/PENDENCIAS.md` (o Victor escolheu deixá-los lá) e os dos outros grupos, além do grupo 13 e do F14 m-1 (decisões 2 e 17);
- o `docs/relatorios/fase-02-matriz.md`, que é histórico;
- o `PLANO-FILEORCA.md` (decisão 2), o `PLANO-MELHORIAS.md`, o `PLANO-UX-QV.md` e o `CLAUDE.md`;
- os § antigos do `DECISOES.md` e as seções antigas de `docs/claude/`: só se acrescenta, nunca se apaga nem se reescreve.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 701)

1. **A especificação.** A ficha é contrato, palavra por palavra: o "Dentro", os critérios e a válvula. Os nomes, os caminhos e os textos que este prompt fixa também são contrato. O que nenhum dos dois diz, você decide pela régua de "Autonomia e decisões", com um §.

2. **Os planos e a linha do `PLANO-FILEORCA.md`.**
   - Nenhum plano muda. Achado que desminta o plano vai num §, nunca no texto dele.
   - A linha que a F14 deixou como "Victor faz" (F14 m-1, no grupo 24) ainda faltava no fim da F16 e pode ter sido posta pelo Victor antes desta run. **Não edite o arquivo por nenhum caminho** (ferramenta de edição, shell, script ou `git apply`): o `.claude/settings.json` nega. No começo, rode `git diff -- PLANO-FILEORCA.md`:
     - se a diferença for só a linha do F14 m-1 acrescentada (com, no máximo, uma linha em branco junto), ela entra no primeiro commit, ao lado do prompt, e o F14 m-1 vai para "Já corrigidos", com o §;
     - se não houver diferença, siga sem ela: o F14 m-1 continua aberto;
     - se houver qualquer outra diferença, deixe o arquivo como está, fora dos commits, e registre.
   - O `CLAUDE.md` não muda nesta run.

3. **Os nomes, os caminhos e o glossário.**

   | Id | en | pt | es |
   | --- | --- | --- | --- |
   | `avif-to-jpg` | AVIF to JPG · `/avif-to-jpg/` | AVIF para JPG · `/pt/avif-para-jpg/` | AVIF a JPG · `/es/avif-a-jpg/` |
   | `convert-to-webp` | Convert to WebP · `/convert-to-webp/` | Converter para WebP · `/pt/converter-para-webp/` | Convertir a WebP · `/es/convertir-a-webp/` |

   - Os nomes seguem as irmãs ("WebP para JPG", "WebP a JPG"), e o verbo é o que o hub de cada idioma já usa ("converter", "convertir"). As duas linhas entram no glossário de pt e de es, na tabela de ferramentas, logo depois de "PNG to JPG".
   - O título, a descrição e o H1 seguem o molde das irmãs: "<Nome> online, no upload" em en, "<Nome> online, sem upload" em pt e "<Nome> en línea, sin subir archivos" em es. O AVIF do Convert to WebP aparece na descrição, nos passos e na especificação, nunca no nome nem no caminho.
   - Os sinônimos da busca em en são os do cartão da F2 (`git show 3812f49^:src/i18n/en/common.ts`). Os de pt e es você escreve no padrão dos cartões irmãos de cada idioma.

4. **O ponto de partida do código e dos textos.**
   - **Os textos em inglês** das duas (`git show 3812f49^:src/tools/<slug>/i18n/en.ts`) e os cartões são o rascunho.
     - Adapte ao tipo de hoje (`ImageToolTexts` e os blocos que o `gate:conteudo` pede desde a F13a) e às regras de texto de hoje.
     - Confira cada afirmação contra o motor de hoje (a transparência, a velocidade do AVIF, os metadados, o tamanho) e corrija o que não valer.
     - A frase de suporte dos navegadores ao AVIF e ao WebP leva a fonte num §: a página de compatibilidade lida na run, com a data.
   - **A ilha:** o `Panel.tsx` das duas (`git show 3812f49^:src/tools/<slug>/Panel.tsx`) é o rascunho. Adapte ao `ImageTool` de hoje, com o `now` do resumo do "Ajustar" (F13a) onde houver escolha.
   - **Os testes:** os casos da matriz de `git show 840d565^:tests/e2e/lib/matrix.ts` e do `image-matrix.spec.ts` dele são o rascunho: o `avifHasAlpha`, a sonda que descobre se o navegador abre AVIF e o `AVIF_LINK`. Adapte à matriz de hoje.

5. **O desenho das duas ferramentas.**
   - **AVIF to JPG:**
     - aceita `['avif']`, pelos bytes;
     - entrega JPG, sem escolha: as opções mostram só a nota, como na F2 (`NoteOptionsTexts`);
     - a transparência vira branco, com a nota `flattened`;
     - `beforeAfter: 'lossy'`; um arquivo por AVIF, e o ZIP com mais de um;
     - o `warm`, você decide pelo orçamento, com um §: o decodificador do jSquash só se busca no gesto, nunca na carga.
   - **Convert to WebP:**
     - aceita `['jpeg', 'png']`;
     - entrega WebP (o padrão) ou AVIF, em Recommended (o padrão) ou Strong, pela operação `{ kind: 'convert', to, level }`;
     - a transparência do PNG fica nas duas saídas;
     - `beforeAfter: 'lossy'`;
     - o resumo do "Ajustar" (`now`) diz o formato e o nível ("WebP · Recommended");
     - o `ConvertToOptionsTexts` volta com as chaves da F2 (`formatLegend`, `webp`, `avif`, `levelLegend`, `recommended`, `recommendedHelp`, `strong` e `strongHelp`), e mais o que o `now` pedir.
   - **Os chips e as relacionadas:**
     - volte as listas `next` e `related` ao que o diff do `3812f49` tirou: o Convert to WebP no `next` do Compress e do preset de 1 MB, e as duas nas relacionadas das irmãs;
     - ajuste ao que entrou depois: os chips de PDF da Image to PDF (F15) não mudam, as relacionadas vão até 6, e os chips seguem o limite de hoje;
     - o `next` do AVIF to JPG leva às ferramentas que abrem JPG (Compress, Resize e Image to PDF, como os outros conversores), e o do Convert to WebP, ao Resize e ao Compress.
   - **O chip que leva** (§ 496, § 497 e § 654) leva o resultado só quando o destino aceita o formato dele (o `takes()` de `src/share/`). Com a saída em AVIF, nenhum destino de imagem leva o arquivo, e o chip só abre a página. Os rótulos de "levar" (`carry.chips`) entram para os destinos novos que precisarem, nos três idiomas.
   - **O `CONVERTER_FOR`** ganha `avif: 'avif-to-jpg'`, e sai o comentário que diz que o AVIF to JPG é da run 2b.

6. **Os ícones.** Nenhum hub nem home repete um desenho (§ 491); a home só repete o `compress` e o `rotate`. As duas ferramentas precisam de dois desenhos que não estão em nenhum cartão do hub de imagem nem das homes.
   - Use um ícone do conjunto que nenhum cartão usa, conferido no `dist/`, se ele servir pelo sentido.
   - Se nenhum servir, desenhe um novo no estilo do conjunto: 24 × 24, a raiz do `ICON_FILE_ROOT`, traço 2, nenhuma cor por dentro e só LF. Ele entra em `docs/design/assets/Icons/`, com a linha no README de lá, no `ICON_NAMES` e num §, e o `icons.test.ts` passa. O contraste é o do texto (o traço é `currentColor`).
   - O mínimo de cartões do hub de imagem no `hub-icons.test.ts` passa de 8 para 10, e as contagens de cartões das homes acompanham.

7. **A recusa do AVIF nas outras ferramentas.**
   - Com o `CONVERTER_FOR`, a linha de um AVIF recusado no Compress, no Resize, no Crop, no Rotate, na Image to PDF e nas presets passa a dizer o formato e a levar o link para o AVIF to JPG do idioma da página, como o HEIC já faz (o `wrongTool`). No Convert to WebP também. Confira o HEIC to JPG, o WebP to JPG e o PNG to JPG pela mesma regra e registre.
   - **O artigo em inglês.** O `wrongTool` de hoje é "{name} is a {format} file. Open it in {tool}.", e com o AVIF ele daria "is a AVIF file". A F2 tinha o mesmo erro, e a matriz o aceitava com `/is an? AVIF file/`.
     - Em inglês, a frase diz "an AVIF file" e continua "a HEIC file".
     - O jeito (um artigo por formato nos textos, ou duas frases) você decide, com um §.
     - O teste confere a frase exata, nunca `an?`.
     - O pt ("é um arquivo AVIF") e o es ("es un archivo AVIF") já servem.
   - As linhas de especificação que dizem "AVIF files are not accepted" passam a dizer, como as do HEIC, que o AVIF passa antes pelo AVIF to JPG, nos três idiomas. O que a ferramenta aceita não muda.

8. **Os textos.**
   - Os de en saem da decisão 4. Os de pt e es saem pelo glossário de `docs/i18n/`, no registro do site, nunca palavra por palavra.
   - Os rótulos do nível no Convert to WebP são os do Comprimir de cada idioma ("Recomendada" e "Forte" em pt; "Recomendada" e "Fuerte" em es; as ajudas também). Confira as chaves dele e use as mesmas palavras.
   - **As contagens:**
     - "Eight" vira "Ten" no hub de imagem em inglês (título, descrição, H1 e intro); "Oito" vira "Dez" em pt, e "Ocho" vira "Diez" em es;
     - procure com `grep`, nos textos dos três idiomas, nos comentários que contam ("the eight image tools") e nos testes, toda contagem de ferramentas de imagem, e corrija;
     - as contagens que o código calcula (o H1 da home, o rodapé, o menu) mudam sozinhas: confira no `dist/` que cada uma ganha 2, nos três idiomas.
   - Um § lista, nos três idiomas lado a lado, os textos novos da ilha e das opções e as frases das outras páginas que mudaram.
   - O `lint:texto` dá 0 erro, e o `english-leak.test.ts`, o `glossary.test.ts`, o `gate:conteudo` e o `gate:seo` passam.

9. **O lugar no site.**
   - **O que lê o registro e as rotas** (§ 77 e § 78): o hub, a home, o rodapé, o menu, a busca, a 404, o OG, o sitemap, o hreflang e o schema. Confira no `dist/` que as duas aparecem em cada um, nos três idiomas, e que nenhum portão (`gate:seo`, `gate:links`, as órfãs e o hreflang) reclama.
   - **A "Abrir com" e o `share_target`** (§ 290 e § 291) passam a aceitar AVIF. O `accept` do manifest ganha o `image/avif` e o `.avif` (confira o que o `shareAccept()` dá), e um AVIF compartilhado mostra o AVIF to JPG na "Abrir com". Os testes da F8 que fixam o `accept` mudam no formato da § 341. A Privacidade não lista formatos e não muda: confira.
   - **O GA4:**
     - os dois ids entram em `IMAGE_EVENT_TOOLS` (`src/analytics/tool-ids.ts`), a lista fechada dos parâmetros `tool` e `target`. Sem isso, o `tool_start` e o `tool_complete` das duas sairiam sem a ferramenta;
     - não é evento nem parâmetro novo, e a Privacidade não muda: registre num §;
     - o `codec` já tem o `image/avif`.

10. **A matriz e a medida do AVIF.**
    - **A matriz** (`tests/e2e/lib/matrix.ts` e `image-matrix.spec.ts`; § 80 e § 88):
      - o Convert to WebP com cada fixture que ele aceita (os JPG e os PNG pelo formato real do `expected.json`), em WebP, nos dois navegadores, conferido como as irmãs: decodifica; formato e dimensões pelo oráculo; orientação pelos pixels; transparência guardada; e nenhum Exif, XMP, IPTC nem GPS;
      - o Convert to WebP em AVIF nas fixtures pequenas, nos dois navegadores: no mínimo uma JPG com Orientation, a PNG transparente e a PNG com nome `.jpg`, e nunca a de 12 MP nem a `gen-grande`. O AVIF decodifica onde o navegador abre a fixture AVIF, e é conferido pelos bytes onde não abre. Na PNG transparente, ele tem o plano alfa (`avifHasAlpha`), e nenhum leva metadados;
      - o AVIF to JPG com a `gen-avif.avif`, nos dois navegadores (no WebKit do Windows, pelo jSquash);
      - a transparência do AVIF to JPG, sem fixture nova: no mesmo teste, o AVIF com alfa que o Convert to WebP fez da PNG transparente entra no AVIF to JPG e sai JPG, com a nota `flattened` e o fundo branco nos pixels;
      - no meio de cada lote, o que a ferramenta recusa (§ 80): o AVIF to JPG recebe um arquivo pequeno de cada outro formato e os quatro quebrados; o Convert to WebP, um HEIC, o AVIF, a WebP e os quatro quebrados;
      - nas outras ferramentas, o AVIF recusado com o link novo (decisão 7);
      - os lotes divididos pela regra da § 88, de uns 9,5 s locais por lote, sem deixar fixture de fora;
      - a prova de que nada sai do 127.0.0.1, como em toda a matriz.

      A tabela sai com `node scripts/fixtures/matrix-table.ts > docs/relatorios/fase-17-matriz.md`, depois de rodar o `image-matrix.spec.ts` e o `image-presets.spec.ts` nos dois navegadores numa execução só (o comando da F2 no `CLAUDE.md`).
    - **A medida do codificador AVIF,** que a ficha pede num §:
      - um teste converte a `jpg-01-pixel2-retrato-gps.jpg` (12 MP) para AVIF no Convert to WebP, uma vez por navegador;
      - ele imprime uma linha `[avif 12 MP] <navegador> <segundos>`, com o tempo do gesto até o Baixar;
      - ele só afirma que a saída é um AVIF das dimensões certas, sem metadados. O tempo é medida, não critério, como o `money-speed.spec.ts` no WebKit;
      - ele fica no CI, para cada execução completa registrar o número do runner;
      - o nome, o lugar (um spec próprio ou um teste no spec da matriz) e a parte, você decide pela decisão 14.
    - **O § da medida** traz a máquina (os dois navegadores, três rodadas) e o runner do CI (os dois navegadores, lidos no log de uma execução completa).
      - Com o rótulo `ci`, o número do runner vem da conferência do meio da run (decisão 19).
      - Sem ele, a única execução completa é a final. O § sai com o número da máquina e diz que o do runner vai na descrição da PR. O grupo 27 ganha a linha "copiar para um § o `[avif 12 MP]` do runner, da descrição da PR da F17", para a F18.

11. **O kit de lançamento.**
    - As linhas marcadas com `<!-- muda com a 2b -->` em `docs/lancamento/` (no `show-hn.md`, no `alternativeto.md` e no `diretorios.md`) passam a dizer o que o site faz hoje: entram a conversão para WebP e AVIF e o AVIF para JPG, e sai o "No AVIF yet".
    - Os limites de caracteres que os arquivos dizem continuam valendo: reconte cada campo (a descrição curta do AlternativeTo tem até 150).
    - Os comentários `<!-- muda com a 2b -->` saem das linhas que você mudou. A seção "Linhas que mudam com a 2b" do `README.md` passa a dizer que a F17 as mudou, com a data, sem apagar a tabela.
    - No `product-hunt.md`, "8 image tools" vira "10 image tools", e o mesmo vale para toda contagem que o `launch-kit.test.ts` confere, com as contagens de caracteres que o arquivo declara refeitas.
    - **As imagens da galeria** (`docs/lancamento/product-hunt/`): abra cada uma.
      - Se alguma mostra a contagem de ferramentas de imagem ou a grade do hub de imagem, regere a galeria com `pnpm lancamento:imagens` sobre o `dist/` novo (ele reescreve a tabela das imagens do `product-hunt.md`) e confira o `launch-kit.test.ts`.
      - Se nenhuma mostra, não regere.

12. **O orçamento.**
    - Cada página nova carrega os mesmos 2 arquivos JS e as mesmas 6 requisições das irmãs, com o JS inicial abaixo de 80 KB com gzip. As seis entram nas listas do `budgets.spec.ts` e do `i18n-budgets.spec.ts`.
    - As outras páginas carregam os mesmos arquivos JS e as mesmas requisições do ponto de partida, medido arquivo a arquivo contra o `dist-base`.
    - O `dist/_astro/` ganha só o que as duas ilhas novas pedem (o `mount` de cada uma). Liste os arquivos novos, com o tamanho com gzip, num §.
    - O grupo `island`, que todas as ferramentas de imagem dividem, cresce no máximo 1 KB com gzip. Se passar, tire código primeiro, e o que sobrar vai num § e numa linha do grupo 27.
    - O `gate:licencas` continua com os mesmos pacotes do ponto de partida: o codificador e o decodificador de AVIF já estão no bundle (§ 85).

13. **Os anúncios, o layout e a acessibilidade.**
    - **Os anúncios:** as seis páginas entram nas listas do `ads.spec.ts` (com o `.fo-ba` no `ON_SCREEN`, como as irmãs que têm antes e depois) e do `fo-ad-map.spec.ts`. No build de teste com IDs de anúncio, valem a distância de 150 px, nada acima da ferramenta no celular e a densidade de até 30 % a 360 × 740.
    - **O CLS** sem gesto continua 0 nas seis: o `layout-shift.spec.ts` e o `tool-slot.spec.ts`, se eles leem as páginas pelo registro; se não, acrescente.
    - **O axe** nas seis, nos dois temas e nos dois navegadores, com o estado de resultado (o antes e depois) e o de erro (a recusa).
    - **O Lighthouse:** o `lighthouserc.json` não muda, porque a parte do Lighthouse já é a maior do CI (391,9 s na máquina). Meça as seis páginas com uma configuração temporária em `.cache/f17/`, sobre o mesmo `dist/`, no celular, e ponha no relatório as quatro categorias e o CLS. Uma página abaixo de 90 em alguma categoria é achado a corrigir.

14. **Os testes.** Cada critério da ficha tem um teste ou uma medida com evidência. Cada teste que mede algo que já existia reprova no `dist-base`, e o controle negativo vai no relatório, com a mensagem de erro.
    - **A matriz:** como a decisão 10, com a tabela do `fase-17-matriz.md`. Os controles negativos: no `dist-base`, a página do AVIF to JPG não existe (o `serve-dist` devolve o 404 mais próximo: exija o 200), e o AVIF recusado no Compress não tem o link.
    - **A recusa com o link:** a frase exata em en, pt e es, o `href` do idioma da página e o nome do link, em `tests/e2e/lib/matrix.ts`, como o `HEIC_LINK`; e o `image-texts.test.ts` sobre os textos.
    - **As opções do Convert to WebP,** no `image-smoke.spec.ts`: trocar WebP por AVIF e Recommended por Strong refaz o resultado com o formato certo e um arquivo menor no Strong do que no Recommended, na mesma foto, e o resumo do "Ajustar" diz o formato e o nível.
    - **O chip com AVIF na saída:** depois do Convert to WebP em AVIF, nenhum chip leva o arquivo a um destino que não aceita AVIF (ele só abre a página); com WebP na saída, o chip do Compress leva (§ 497).
    - **O registro:** um Vitest confere que o `next` e o `related` das duas e das irmãs só apontam para ferramentas que existem nos três idiomas, e que o `CONVERTER_FOR` aponta para uma ferramenta que aceita aquele formato.
    - **As contagens e as listas:**
      - o `image-hub.test.ts` (10 ferramentas) e o `hub-icons.test.ts` (o mínimo de 10 e as homes);
      - o `conteudo.test.ts`, os `seo-*.test.ts`, o `open-with.test.ts` e o `launch-kit.test.ts`;
      - o `routes.test.ts`: a lista exata de ids e a busca, em que "avif" passa a achar o AVIF to JPG e o Convert to WebP em cada idioma.
    - **Os specs novos,** ou os blocos novos de specs que já existem, têm nome e parte escolhidos pelos tempos de teste da execução completa da PR 32 e pelas partes do `.github/workflows/ci.yml` (`docs/claude/playwright.md` e `docs/claude/ci.md`), com o alvo de 700 s por parte.
      - Os casos da matriz ficam no `image-matrix.spec.ts`, que já tem a parte dele. Projete o tempo novo dessa parte nos dois navegadores antes de escrever: na F2, o AVIF na saída custou 50 s no WebKit do CI.
      - Se for preciso redividir as partes, a mudança em `.github/workflows/` vai numa PR separada, de merge do Victor, e esta run segue sem ela (decisão 19).
    - **Os testes antigos que mudam** (as contagens, a lista de rotas, a busca, o `accept` do manifest, a recusa do AVIF sem link, o mínimo de cartões) vão num § no formato da § 341: o que pedia, o que pede, por quê e o que continua protegido.

15. **O design system.** Nenhum componente nem token novo; ícone novo, só pela decisão 6. Nenhuma regra do design system muda.

16. **O `docs/claude/`.** Uma seção nova no fim do `imagem.md`, "F17: AVIF para JPG e Converter para WebP", com:
    - o que mudou desde a F2 no roteiro "Como acrescentar uma ferramenta de imagem": as pastas de pt e es, o `TRANSLATED_PATHS`, o glossário, o `IMAGE_EVENT_TOOLS`, o `carry` dos chips, o `now`, os ícones únicos por hub e o `fo-ad-map.spec.ts`;
    - a recusa com o artigo em inglês;
    - a medida do AVIF;
    - as pegadinhas que você achar.

    Pegadinha de Playwright vai numa seção nova no fim do `playwright.md`. As seções antigas não mudam.

17. **O `docs/PENDENCIAS.md`.**
    - Saem das tabelas abertas para "Já corrigidos", com a run e o § (no formato `| F3 c-04: … | F12, § 428: … |`): o F2 2b do grupo 13, e o F14 m-1 só no caso que a decisão 2 permite. Nenhum id some do arquivo (§ 341 e § 447).
    - O grupo 13, vazio, mantém o título e ganha uma linha dizendo que a F17 o fechou, como os grupos 3, 5 e 6.
    - Entra o grupo novo "## 27. O que a F17 deixou", no formato dos grupos 22 a 26 (seis colunas), com o que a run deixar:
      - o pt e o es, se a válvula os cortar ("Run F17b");
      - a medida do runner, no caso da decisão 10;
      - o orçamento da ilha, se passar;
      - os baixos que a revisão deixar.
    - O Resumo e o Total acompanham.

18. **As imagens.** JPG de qualidade 80 em `docs/relatorios/fase-17/`, tiradas do `dist/` com o Chromium do Playwright, a 1x e com movimento reduzido, por um script em `.cache/f17/`:
    - `avif-para-jpg-360-pt`: o resultado de um AVIF, com o antes e depois;
    - `converter-webp-avif-360`: o Convert to WebP com o AVIF escolhido e o resultado da PNG transparente;
    - `hub-imagem-1280`: o hub de imagem em inglês, com os dez cartões;
    - `recusa-avif-360-es`: um AVIF largado no Comprimir em espanhol, com o link para o AVIF a JPG.

19. **A PR e o CI.**
    - **A PR abre em rascunho** logo depois do primeiro push, e cada push roda o job leve.
    - **Uma conferência no Linux, no meio da run,** depois da junção das frentes (a fatia 3 de "Como trabalhar"). O WebKit de lá pode abrir AVIF onde o do Windows não abre (`docs/claude/imagem.md`, F2), e a medida do AVIF precisa do runner. Faça o push, espere a execução leve terminar e rode `gh pr edit <n> --add-label ci`:
      - se o rótulo existir, acompanhe a execução completa, leia os logs (as linhas `[avif 12 MP]` e o que a matriz registrou sobre o AVIF em cada navegador), corrija o que só falhou lá e tire o rótulo (`gh pr edit <n> --remove-label ci`);
      - se não existir, pule a conferência e registre num §: a execução final faz esse papel, e a medida do runner segue a decisão 10. Nunca use como atalho o `gh pr ready` seguido do `--undo` com o `ci-ok` a caminho do verde.
    - **No fim,** com tudo commitado (o relatório, a matriz, a revisão e as imagens), faça o push, espere a execução leve terminar verde, e só então rode o `gh pr ready`. Acompanhe a execução completa até o fim. Se ela falhar: `gh pr ready --undo`, corrija, commite, faça o push, espere a leve e rode o `gh pr ready` de novo. A falha e a correção vão no relatório.
    - **As partes:** se a projeção (decisão 14) ou a execução completa mostrar uma parte acima de 700 s por causa dos testes desta run, faça como a F14 (§ 648): projete a divisão com os tempos dessa execução e abra a PR separada; o merge dela é do Victor.
    - **A descrição da PR,** mesmo depois do merge (`gh pr edit <n> --body-file <arquivo>`): o `pnpm ci:custo` da execução final, as linhas `[avif 12 MP]` do runner nos dois navegadores e o tempo da parte de cada spec que esta run tocou.

# Armadilhas conhecidas

- **O `build.format` do Astro** faz de toda página um `.../index.astro`, e o `exactOptionalPropertyTypes` pega campo opcional pela metade: rode o `pnpm tipos` cedo (ele confere também os specs).
- **Página de ferramenta carrega exatamente 2 arquivos JS** (o `mount` e o grupo `island`). Um import de `src/engine/` na ilha cria um terceiro arquivo: a ilha fala com o motor só pelo `engine-client.ts` (`docs/claude/imagem.md`, F2).
- **Só a build de uma thread de cada codec** (`avif_enc`, nunca `avif_enc_mt`): o `image-privacy.spec.ts` reprova o resto.
- **O WebKit 27.2 do Windows não abre AVIF** e não tem `OffscreenCanvas` no worker. No Linux do CI, o WebKit pode diferir: os testes detectam o que o navegador abre (a sonda do `840d565^`) e registram, nunca supõem.
- **"Sem metadados" é sem Exif, XMP, IPTC e GPS** (`metadataReport`), não "sem APPn": o canvas do Chromium põe um perfil ICC sRGB no JPG e no PNG.
- **O `createImageBitmap` com `imageOrientation: 'none'` ainda aplica a Orientation** nos dois navegadores: a referência em pé sai de `withOrientation(bytes, 1)` (`tests/e2e/lib/jpeg.ts`).
- **O `serve-dist` devolve o 404 mais próximo** para rota que falta: teste de página exige o status 200, senão passa sem a página existir.
- **O `warm()` liga o worker** quando o ponteiro para sobre o painel: teste que segura o motor (`slowEngine`) segura antes do `goto`.
- **Cada teste da matriz tem 60 s** (§ 88): um lote com AVIF na saída no WebKit pode passar disso. Divida o lote antes de afrouxar qualquer tempo, e nunca afrouxe.
- **O artigo do `wrongTool` em inglês** (decisão 7): "a AVIF" passa no `lint:texto` se a amostra do placeholder não for AVIF. Confira a frase com o AVIF de verdade.
- **O `hub-icons.test.ts` lê o desenho no `dist/`,** não o nome (§ 491): dois nomes com o mesmo desenho contam como repetição.
- **O `fo-ad-map.spec.ts` conta as páginas** (184 hoje): o número muda com as seis, e a mudança vai no § dos testes antigos.
- **A busca do `routes.test.ts`** espera que "avif" não ache nada desde a § 85: é um dos testes antigos que mudam.
- **Os commits `3812f49` e `840d565` não estão na história da main** (squash da PR 5): `git fetch origin pull/5/head`, e só `git show`.
- **O `pnpm lancamento:imagens`** fica fora do `verificar` e lê o `dist/`: rode o `pnpm build` antes.
- **Arquivo de ícone novo** tem só LF: no Windows, o Python troca LF por CRLF (`docs/claude/windows-git-bash.md`). Grave com a ferramenta de escrita.
- **Dois Playwright no mesmo checkout** convivem com `--output=<pasta própria>` no segundo, e cada worktree usa o próprio `FO_PORT` (`docs/claude/playwright.md`, F2 e F15).
- **O Playwright do Windows pode não sair depois do último teste** (`docs/claude/playwright.md`, "Ajuste da largura do cabeçalho"): veja o que fazer lá.
- **Frentes que acrescentam blocos no fim do mesmo spec** dão conflito na junção (`docs/claude/windows-git-bash.md`, F15). A guarda da worktree isolada recusa heredoc com `node` ou `git` no mesmo `&&`: grave o arquivo com a ferramenta de escrita e rode cada comando sozinho.
- **A máquina não mostra o tempo do CI:** use os tempos de teste da execução completa para pôr um spec numa parte (`docs/claude/ci.md`, F14). Os specs pesados vêm juntos na ordem dos nomes.
- **O "antes":** monte o `dist/` da `origin/main` numa worktree à parte (`dist-base`), nunca trocando a branch do clone principal.

# Critérios de aceitação (cada um com evidência no relatório)

1. Os critérios da ficha da F17, um por um, com a saída real do teste ou da medida, e nenhum afrouxado:
   - a matriz das duas com cada fixture que elas aceitam, nos dois navegadores;
   - a recusa de AVIF nas outras ferramentas com o link novo;
   - o `gate:seo`, o `gate:links`, o `gate:conteudo` e o `launch-kit.test.ts` verdes;
   - cada página nova com os mesmos 2 arquivos JS e 6 requisições das irmãs;
   - a densidade de anúncio em até 30 % a 360 × 740;
   - nenhuma parte do CI acima de 700 s;
   - o `pnpm verificar` verde.
2. O "Dentro" da ficha feito, com a medida do AVIF num § (decisão 10); o pt e o es, se a válvula os cortar, com o § e a linha "Run F17b".
3. Nenhum item do "Fora" da ficha ou deste prompt foi tocado.
4. Nada sai do aparelho, nenhuma saída leva metadados nem GPS, e nenhum evento ou parâmetro novo vai para o GA4: o `image-privacy.spec.ts`, o `launch-claims.spec.ts` e o `events.spec.ts` passam com as páginas novas no caminho.
5. O `lint:texto` dá 0 erro; o `gate:conteudo`, o `english-leak.test.ts`, o `glossary.test.ts`, o `claude-md.test.ts` e o `pendencias.test.ts` passam.
6. O Lighthouse das seis páginas ≥ 90 nas quatro categorias, o axe sem violação e o CLS sem gesto 0 (decisão 13).
7. Os documentos das decisões 11, 16 e 17 estão em dia.
8. Os testes antigos que mudaram estão num §, um por um; nenhum teste foi pulado, desligado ou afrouxado.
9. O `pnpm verificar --partes` passou na máquina, com a saída real no relatório, e o CI completo está verde (ou a PR separada da decisão 19 está aberta).
10. A revisão adversarial está em `docs/relatorios/REVISAO-F17.md`, sem achado alto ou médio aberto.

# Verificação: rode de verdade

- **A linha de base, antes de mudar código.** No `dist-base`:
  - `pnpm install --frozen-lockfile` e `pnpm build`;
  - o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, com a saída em `.cache/f17/antes/`;
  - o número de testes do Vitest, o `pnpm exec playwright test --list` de cada navegador e a lista dos JS de `dist/_astro/`, com o tamanho do grupo `island` com gzip;
  - as contagens do site no `dist/` (o H1 da home, o hub de imagem, o rodapé, o menu) nos três idiomas, o `accept` do manifest e a busca por "avif";
  - os controles negativos: a página do AVIF to JPG dá 404, e o AVIF recusado no Compress não tem link;
  - as imagens do "antes" que o relatório comparar.
- **Em cada fatia:** `pnpm tipos`, `pnpm lint`, `pnpm build`, o Vitest dos arquivos tocados e os specs que a fatia toca, nos dois projetos (`--project=chromium` e `--project=webkit`):
  - no mínimo o `image-matrix.spec.ts`, o `image-presets.spec.ts`, o `image-smoke.spec.ts`, o `image-batch.spec.ts`, o `image-list.spec.ts`, o `image-privacy.spec.ts`, o `launch-claims.spec.ts`, o `a11y.spec.ts`, o `layout-shift.spec.ts`, o `tool-slot.spec.ts`, o `budgets.spec.ts`, o `i18n-budgets.spec.ts` e os specs novos;
  - os specs dos chips que levam (`handoff*.spec.ts`), da busca e da navegação, e os da "Abrir com" e do compartilhar;
  - o `ads.spec.ts`, o `fo-ad-map.spec.ts` e o `ads-coffee.spec.ts` no build de teste com IDs de anúncio.

  Leia a falha, corrija a causa e repita até passar.
- **Nunca afrouxe um limite** para um teste passar: o limite é o da ficha, o deste prompt e o do projeto.
- **A medida do AVIF:** no fim, três rodadas do teste da decisão 10 nos dois navegadores, com a máquina livre.
- **O Lighthouse das seis páginas** com a configuração temporária da decisão 13.
- **O `pnpm verificar --partes` roda uma vez,** no último commit de código, com a máquina livre. Se uma parte falhar, rode a mesma parte no ponto de partida, numa worktree. Se ela falhar igual, a falha não é desta run: registre num § e no relatório, e siga. Se não, ache o que esta run mudou e corrija.
- **No CI:** acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log`. O `pnpm ci:custo <id>` da última execução vai no relatório (regra 5).

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. A ficha da F17 e este prompt.
2. A D15 e as regras de todas as runs do `PLANO-UX-QV.md`.
3. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md`, o `CLAUDE.md`, o `docs/claude/` e o `docs/design/`.
4. O `DECISOES.md`, o desenho da F2 (`3812f49^` e `840d565^`) e o código.
5. Na dúvida, a opção mais simples e mais reversível que não piore o orçamento, a acessibilidade, o anúncio nem o tempo do CI.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: os ícones; o `warm` do AVIF to JPG; o jeito do artigo em inglês; as fixtures pequenas do AVIF na saída e a divisão dos lotes; o nome, o lugar e a parte da medida; o `next` e o `related` de cada ferramenta; cada teste antigo que mudou.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- o rótulo `ci` não existe (decisão 19);
- o `git fetch origin pull/5/head` falha: reconstrua pelo § 85, pelo relatório da F2 e pelo `docs/prompts/prompt-fase-02.md`, e registre num §;
- a página de compatibilidade da decisão 4 não abre: escreva a frase de suporte sem citar versão de navegador e registre a pendência no grupo 27;
- a main muda no meio da run: `git fetch` e `git merge origin/main` na branch, nunca rebase, renumerando os § se colidirem;
- o Lighthouse oscila numa URL: rode de novo uma vez e, se cair de novo, ache a causa.

Válvula de estouro: se a projeção ou a execução completa mostrar uma parte acima de 700 s, a primeira saída é a PR separada das partes (decisão 19). Só se nem a redivisão segurar uma parte abaixo de 700 s, ou se o limite semanal apertar, o pt e o es das duas ferramentas saem para uma F17b, com um § e a linha "Run F17b" no grupo 27. Nunca corte as duas páginas em inglês, a matriz, a recusa com o link, os testes dos critérios nem a revisão adversarial final.

# Git e segurança

- **Começo:**
  - `git switch main` e `git pull --ff-only`;
  - o `git status` pode mostrar, sem rastreio, os dois arquivos do prompt e a pasta `Claude outputs/`, e, modificado, o `PLANO-FILEORCA.md` (decisão 2). Qualquer outra coisa: não mexa, não commite e registre;
  - `git switch -c fase-17`. O primeiro commit leva os dois arquivos do prompt, e o `PLANO-FILEORCA.md` só no caso que a decisão 2 permite;
  - se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como o recebeu, em `docs/prompts/prompt-fase-17.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main. Adicione por caminho, nunca `git add -A`.
- **A PR em rascunho** abre logo depois do primeiro push, num comando separado do push: `gh pr create --draft --base main --head fase-17`, com o título "F17: AVIF para JPG e Converter para WebP/AVIF". O título e a descrição vão em português, e a descrição diz que o merge é do CI.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push (`https://fase-17-fileorca.vmatusita.workers.dev/`), que é o build padrão: mostra as páginas novas, nunca anúncio.
- **Agentes em worktree** (regra 6 do `CLAUDE.md`): o primeiro passo de cada um é `git merge --ff-only fase-17`, e todo merge de volta leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`). As worktrees são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:**
  - o push da branch;
  - na PR dela, `gh pr create`, `gh pr ready`, `gh pr edit` (só a descrição e o rótulo `ci`) e o `gh pr ready --undo`, só depois de uma execução final vermelha;
  - leitura (`git fetch`, `gh run`, `gh pr checks`, `gh pr view`, `gh label list` e `gh api` sem método);
  - um `gh run rerun` por falha que pareça instável, registrado;
  - e, só se a decisão 19 pedir, a PR separada das partes do CI.
- **Na web, só leitura:** a página de compatibilidade da decisão 4. Nada de postar, criar conta ou enviar formulário.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`; mexer em `core.hooksPath` ou em `.githooks/`;
  - `git revert`, `cherry-pick` ou `git apply` dos commits da F2 (decisão 4);
  - `gh pr merge`, `gh label` (além do `list`), `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`;
  - editar o `PLANO-FILEORCA.md` por qualquer caminho;
  - postar, criar conta ou subir arquivo para qualquer serviço (o Search Console é do Victor);
  - `wrangler deploy` em qualquer forma.

  O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) a ficha e este prompt num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) o roteiro de uma ferramenta de imagem hoje: o registro, o `page.ts`, as props da ilha, as pastas do `webp-to-jpg` e do `heic-to-jpg`, as páginas em pt e es, as rotas, os cartões, o `IMAGE_EVENT_TOOLS` e o `carry`; e o diff do `3812f49` ligado a cada arquivo de hoje;
   - (c) a matriz: o `matrix.ts`, o `image-matrix.spec.ts`, o diff do `840d565`, a § 80 e a § 88, os lotes de hoje e o tempo de cada lote na execução completa da PR 32;
   - (d) quem lê o registro (o hub, a home, o rodapé, o menu, a busca, a 404, o OG, a "Abrir com" e o manifest) e os testes que fixam contagens e listas;
   - (e) os textos: os de en do `3812f49^`, o glossário, as linhas "AVIF files are not accepted" nos três idiomas, as contagens, o `wrongTool` e as amostras do `lint:texto`;
   - (f) o orçamento, os anúncios e as partes do CI: o `budgets.spec.ts`, o `i18n-budgets.spec.ts`, o `ads.spec.ts`, o `fo-ad-map.spec.ts`, o `.github/workflows/ci.yml`, o `--list` e os tempos da execução completa da PR 32;
   - (g) o kit de lançamento: as linhas marcadas, as contagens do `product-hunt.md`, as imagens da galeria e o `launch-kit.test.ts`.
2. **A linha de base** (seção "Verificação").
3. **Planejar.** Escreva `docs/relatorios/fase-17-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz:
   - o ponto de partida e a linha de base;
   - os § reservados;
   - a interface que as frentes dividem: os ids, as rotas, as chaves dos textos novos e o dono de cada arquivo que mais de uma frente toca (os textos da ilha, os `common.ts`, o `matrix.ts`);
   - quem faz o quê, a ordem das fatias e os arquivos de cada frente;
   - a projeção do tempo das partes com os testes novos;
   - cada critério ligado a um teste ou comando.
4. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. **O agente principal:** o primeiro commit, o push e a PR em rascunho. Depois, a base, em inglês:
      - os ids no registro (`IMAGE_TOOL_IDS` e `IMAGE_PAGES`), o `RouteId` e as rotas dos três idiomas (com o `TRANSLATED_PATHS`), o `CONVERTER_FOR`, o `IMAGE_EVENT_TOOLS` e o `ConvertToOptionsTexts`;
      - as duas ferramentas em inglês (as pastas, o `Panel.tsx`, o `mount.ts`, a página e os textos de en, pela decisão 4) e os cartões de `src/i18n/en/common.ts`;
      - as linhas do glossário e os § reservados.

      Com o `pnpm tipos` e o `pnpm build` verdes, commit e push.
   2. **Três frentes ao mesmo tempo,** cada uma num agente `opus` na sua worktree, a partir desse commit:
      - **M (a matriz e os testes de ponta a ponta):** a decisão 10 inteira (a matriz e a medida), a prova da recusa com o link (decisão 7), as opções no `image-smoke.spec.ts`, o chip com AVIF na saída e as páginas em inglês no `budgets.spec.ts`, no `ads.spec.ts` e no `fo-ad-map.spec.ts`, nos dois navegadores;
      - **T (os textos e os idiomas):** as páginas, os textos e os cartões de pt e es, as linhas de especificação do AVIF nas outras ferramentas (três idiomas), o artigo em inglês (decisão 7), as contagens (decisão 8), as páginas de pt e es no `i18n-budgets.spec.ts`, o `image-texts.test.ts` e o `lint:texto`;
      - **S (o site e os ícones):** os ícones (decisão 6), o `next`, o `related` e o `carry` (decisão 5), o que lê o registro (decisão 9), o Vitest do registro e os testes de contagens e listas (o `image-hub.test.ts`, o `hub-icons.test.ts`, o `conteudo.test.ts`, o `routes.test.ts`, os `seo-*.test.ts` e o `open-with.test.ts`).

      Ao mesmo tempo, o agente principal faz o que não colide com elas: o kit de lançamento (decisão 11), o `docs/claude/`, o `PENDENCIAS.md` e os §.
   3. **O agente principal junta M, T e S:** resolve os conflitos, deixa o `pnpm tipos` verde, roda os specs das três frentes nos dois navegadores e os de anúncio no build de teste, e faz a conferência no Linux (decisão 19).
   4. **O agente principal fecha:** o orçamento contra o `dist-base`, o Lighthouse das seis páginas, as três rodadas da medida do AVIF, a tabela da matriz, a projeção das partes, as imagens e as tabelas do relatório.
5. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`):
   - sobre um commit fixo e registrado da branch, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` e o próprio build de teste;
   - contra a ficha, este prompt e o plano;
   - cada lente com o próprio `FO_PORT`, escrevendo só no `.cache/lente-<x>/` da worktree.

   A F17 é fase de interface e de texto: três lentes Sonnet em contexto limpo (regra 3), apontando só lacunas de correção ou de requisito, nunca preferência de estilo:
   - (a) **as ferramentas e a privacidade:** a matriz contra a decisão 10; as saídas, os metadados e o GPS; a transparência nas duas; a recusa com o link e o artigo; os chips que levam; nada sai do aparelho; o motor intocado;
   - (b) **o site, o SEO e os idiomas:** as rotas, os caminhos, o hreflang, o sitemap, o OG, o schema, a busca, o hub, a home, o menu, o rodapé e a "Abrir com"; as contagens; os textos contra o glossário e as decisões; as frases desmentidas; o kit de lançamento; o `lint:texto`; os documentos;
   - (c) **o orçamento, os anúncios, a acessibilidade e o CI:** os 2 JS e as 6 requisições; o grupo `island`; a distância, a densidade e o CLS; o axe e o Lighthouse; os ícones únicos; as partes e a medida do AVIF.

   Se o motor mudou (a exceção do "Fora"), a regra 3 pede cinco lentes: some (d) **o motor**, contra o Vitest novo e as fixtures, e (e) **a privacidade**, separada da (a).

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo, com a regra "na dúvida, refutado"; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada das lentes dos achados corrigidos revisa o diff delas. Os baixos que sobrarem vão para o grupo 27 do `docs/PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F17.md`.
6. **Fechar:** o `pnpm verificar --partes`, o relatório e a sequência de fim da decisão 19.

# Relatório final

Escreva `docs/relatorios/fase-17.md` em português, no formato do `fase-16.md`, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo: o que muda para a pessoa (as duas ferramentas, a recusa do AVIF com o caminho, o lugar delas no site), em até cinco linhas;
- o que entrou, por item da ficha, com os arquivos e os §;
- a evidência de cada critério da ficha, com a saída real dos comandos e dos specs, e os controles negativos com a mensagem de erro;
- as tabelas:
  - a matriz: o resumo por ferramenta e navegador, apontando para o `fase-17-matriz.md`;
  - a recusa: a frase do AVIF em cada ferramenta e idioma, antes e depois;
  - as contagens: cada lugar do site e do kit que conta ferramentas de imagem, antes e depois, nos três idiomas;
  - o orçamento: os JS e as requisições de cada página nova e das irmãs, os arquivos novos de `dist/_astro/` e o grupo `island` com gzip, antes e depois;
  - os anúncios: a distância e a densidade das seis páginas;
  - o Lighthouse das seis páginas;
  - a medida do AVIF: os segundos por navegador nas três rodadas da máquina, e os do runner (ou onde eles vão estar);
  - os ícones: o nome e o desenho escolhidos, e onde cada um aparece;
- o número de testes do Vitest e do `--list` de cada navegador, antes e depois, e os testes antigos que mudaram, com o § de cada um;
- a saída real do `pnpm verificar --partes`, com o tempo de cada parte e a soma;
- a projeção das partes do CI com os testes novos;
- o custo (regra 5): o `pnpm ci:custo` da última execução antes do relatório; o da execução final vai na descrição da PR;
- o que a conferência no Linux achou, ou o § que diz por que ela não houve;
- o resumo da revisão, apontando para o `REVISAO-F17.md`;
- as imagens de `docs/relatorios/fase-17/`;
- o link da prévia (`https://fase-17-fileorca.vmatusita.workers.dev/`);
- as decisões novas, apontando os §, e o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. `git pull` e, na prévia ou no fileorca.com depois do deploy: converter um AVIF de verdade no celular e no computador; converter uma foto para WebP e outra para AVIF e abrir os resultados; largar um AVIF no Comprimir e seguir o link.
  2. No Search Console, pedir a indexação das seis páginas novas (a ficha manda).
  3. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
  4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
  5. Se a decisão 19 abriu a PR das partes do CI, mesclá-la depois da execução completa dela.
  6. Passar as candidatas da seção E do `PLANO-UX-QV.md` no Keyword Planner e no Google Trends, se ainda não passou, e gerar o prompt da F18 com a skill, com os números, o SHA da main e o grupo 27 do `docs/PENDENCIAS.md`.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR, o estado do CI (mesclada ou esperando, e por quê) e os passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `docs/PENDENCIAS.md`, o `docs/claude/`, o `docs/lancamento/` e a descrição da PR. O site fala inglês, português e espanhol, nos arquivos de tradução de cada idioma; o kit de lançamento, na língua de cada texto pronto.

Em inglês: o código, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-fase-17.md` e `prompt-fase-17.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run põe os dois no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 624a168 (a F16) ou mais novo
git status                  # sem rastreio: os dois arquivos do prompt e "Claude outputs\"
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado
claude --version            # o modo auto pede 2.1.83 ou mais
```

Depois:

1. **Crie o rótulo `ci`, se ainda não criou (30 s, muito recomendado nesta run).** No GitHub, abra Issues → Labels → New label, com o nome `ci`. A F17 precisa do Linux do CI por dois motivos:
   - o WebKit de lá pode abrir AVIF onde o do Windows não abre, e a matriz muda de caminho conforme o navegador;
   - a ficha pede, num §, o tempo do codificador AVIF no runner.

   Com o rótulo, a run confere tudo no meio e grava o número no §. Sem ele, o número do runner só sai na execução final, vai para a descrição da PR, e a F18 o copia para um §. Na F14 e na F15, a falta do rótulo custou uma volta a mais no fim.
2. **Ponha a linha do `PLANO-FILEORCA.md` (1 min, opcional).** Ela ainda falta: conferi a main hoje. É o F14 m-1, que só você pode fazer, porque o `.claude/settings.json` proíbe as runs de editar esse arquivo. Abra o `PLANO-FILEORCA.md` no editor. Depois da linha 3 (a que começa com "29/out/2026") e da linha em branco que vem depois dela, cole esta linha e mais uma linha em branco:

   ```text
   **Plano de UX e qualidade de vida (9/nov/2026):** as fichas da F14 à F18 estão no PLANO-UX-QV.md. Até a F17 ele não muda nada deste plano; a única mudança no contrato (a linha 15, o catálogo) entra na F18, pela tabela "Mudanças no contrato" do PLANO-MELHORIAS.md.
   ```

   Salve em UTF-8 e confira com `git diff --stat`: tem que dar `PLANO-FILEORCA.md | 2 ++`. A run confere o diff e commita a linha junto com o prompt. Se você pular este passo, a run segue sem a linha, e ela continua como pendência sua.
3. **A energia:** `powercfg /change standby-timeout-ac 0`. Volte ao normal depois da run.
4. **O disco:** a run faz o build do site e o build de teste várias vezes, em até cinco worktrees (a base, as três frentes e a revisão). Deixe uns 20 GB livres.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-17
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-17.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal as seis páginas da F17 no ar no build, os critérios da ficha com evidência no relatório, a medida do AVIF num §, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F17.md sem achado alto ou médio aberto e a PR da fase-17 pronta, com o ci-ok verde
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-17` e mande: "continue de onde parou: leia docs/relatorios/fase-17-plano.md, o git log da branch fase-17 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-17.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-17.json
(Get-Content $HOME\run-fase-17.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`.** A run faz muita coisa sem perguntar:

- builda o site e o build de teste e roda o Playwright em várias portas, também em worktrees;
- cria e remove as worktrees das frentes e da revisão;
- busca do GitHub a PR 5 da F2 (`git fetch origin pull/5/head`, só leitura) para recuperar o desenho das duas ferramentas;
- roda o LanguageTool local, o Lighthouse e, se as imagens da galeria pedirem, o `pnpm lancamento:imagens`;
- lê uma página de compatibilidade na web para a frase de suporte ao AVIF;
- faz push da branch, abre a PR em rascunho, põe e tira o rótulo `ci` (se existir) e marca a PR como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo (push na main, `gh pr merge`, `gh api` com método, `wrangler deploy`, reset, amend e a edição do `PLANO-FILEORCA.md`), e o prompt não pede nada disso.

**O tamanho da run.** Menor que a F16 em lógica e maior em páginas e em matriz:

- duas ferramentas em três idiomas (seis páginas), a maior parte recuperada da F2 e adaptada;
- três frentes (a matriz, os textos e o site), mais a junção;
- a matriz codifica AVIF nos dois navegadores, o passo mais lento do CI na F2;
- a revisão tem três lentes, com céticos;
- o `pnpm verificar --partes` local leva uns 55 min (foram 53 na F16).

Comece com folga no limite semanal do Claude Code. Se apertar, a válvula manda o pt e o es das duas ferramentas para uma F17b. As páginas em inglês e a matriz nunca saem.

### 3. Acompanhar

- **Não mexa no clone durante a run.** Ela está na branch `fase-17` dessa pasta.
- **A PR aparece cedo, em rascunho.** Cada push roda só o job leve (uns 4 min).
- **A prévia** (`https://fase-17-fileorca.vmatusita.workers.dev/`) é o build padrão: dá para converter AVIF e WebP de verdade nela, mas ela nunca mostra anúncio.
- **Não marque a PR como pronta.** O `gh pr ready` é o último passo da run. Depois dele, o CI roda tudo e mescla sozinho.

### 4. Ao voltar

1. **Atualize a main:** `git switch main` e `git pull --ff-only`. Se a PR não foi mesclada, o relatório e a resposta final dizem por quê.
2. **Confira no navegador,** na prévia ou no fileorca.com depois do deploy:
   - converta um AVIF de verdade (salve uma imagem AVIF de um site, ou converta uma foto para AVIF no próprio Convert to WebP) no AVIF to JPG, no celular e no computador;
   - converta uma foto para WebP e outra para AVIF no Convert to WebP e abra os dois resultados;
   - largue um AVIF no Comprimir e siga o link para o AVIF to JPG.
3. **Leia `docs\relatorios\fase-17.md`** e confira as evidências:
   - a matriz: nenhuma fixture aceita de fora, nos dois navegadores, e o AVIF na saída conferido;
   - a recusa: a frase "an AVIF file" em inglês e o link certo em cada idioma;
   - o orçamento: 2 JS e 6 requisições nas seis páginas, e as outras iguais ao ponto de partida;
   - a medida do AVIF no §, ou o aviso de que o número do runner está na descrição da PR;
   - o `pnpm verificar --partes` verde e o veredito do `REVISAO-F17.md`.
4. **Olhe as imagens** de `docs\relatorios\fase-17\`.
5. **No Search Console,** peça a indexação das seis páginas novas.
6. **Depois, pelo plano:** passe as candidatas da F18 no Keyword Planner e no Google Trends (30 min, se ainda não passou) e gere o prompt da F18 com a skill, colando os números, o SHA da main e o grupo 27 do `docs\PENDENCIAS.md`.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `624a168`,** com a F16 mesclada (PR 32). O próximo § livre é o 701, e o grupo novo do PENDENCIAS é o 27.
- **O grupo 26 fica fora,** como você escolheu: o m-1, o m-2 e o m-3 continuam lá.
- **Os nomes e os caminhos em pt e es** fui eu que fixei ("AVIF para JPG", "Converter para WebP", "AVIF a JPG", "Convertir a WebP"), no padrão das irmãs. O glossário ainda não tinha essas linhas, e a run as acrescenta.
- **O AVIF to JPG entrega só JPG,** sem a escolha de PNG que o HEIC e o WebP têm, porque o catálogo diz "AVIF to JPG". **O Convert to WebP aceita só JPG e PNG,** como na F2.
- **Os commits `3812f49` e `840d565` só existem na ref da PR 5** (a F2 entrou por squash). A run os busca com um `git fetch` só de leitura e usa como referência, nunca como patch.
- **A frase de recusa em inglês tem um erro latente:** com o AVIF, ela daria "is a AVIF file". A F2 já tinha esse erro e a matriz o aceitava. A run corrige para "an AVIF file".
- **O AVIF entra sozinho no `share_target` e na "Abrir com",** porque eles leem o que as ferramentas aceitam. Os testes que fixam o `accept` mudam, e a Privacidade não.
- **Os dois ids novos entram na lista fechada do `tool` do GA4.** Isso não é parâmetro novo, e sem eles os eventos das duas iriam sem a ferramenta.
- **O `lighthouserc.json` não muda:** a parte do Lighthouse já é a maior do CI. As seis páginas são medidas na máquina, com uma configuração temporária.
- **O limite de 1 KB no grupo `island`** é meu: as duas ilhas novas têm o próprio `mount`, e o código comum quase não deveria crescer.
- **A transparência do AVIF to JPG é testada sem fixture nova:** o AVIF com alfa sai do próprio Convert to WebP, no mesmo teste.
- **Sem o rótulo `ci`,** a medida do AVIF no runner sai só na execução final. Ela vai para a descrição da PR, e a F18 a copia para um §.
- **A revisão tem três lentes,** como a ficha diz. Se a run precisar mexer no motor, ela sobe para cinco.
- **O merge é automático:** a PR não mexe em `.github/`. Se as partes do CI precisarem de nova divisão, isso vai numa PR separada, com merge seu.
