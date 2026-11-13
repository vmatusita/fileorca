# Fase 18: Ferramentas novas que passarem na regra

## Prompt (copie o bloco inteiro)

```text
ultracode

# Os números (o Victor preenche esta tabela antes de colar o prompt)

| Candidata | Termo no Keyword Planner | Tipo | Volume EUA | Lance topo mín. (US$) | Lance topo máx. (US$) | Trends EUA, 12 meses |
| --- | --- | --- | --- | --- | --- | --- |
| Organizar PDF | organize pdf | ferramenta | <PREENCHER> | <PREENCHER ou vazio> | <PREENCHER ou vazio> | <PREENCHER> |
| Extrair páginas do PDF | extract pages from pdf | preset do Dividir | <PREENCHER> | <PREENCHER ou vazio> | <PREENCHER ou vazio> | <PREENCHER> |
| PDF para PNG | pdf to png | preset do PDF para JPG | <PREENCHER> | <PREENCHER ou vazio> | <PREENCHER ou vazio> | <PREENCHER> |
| Espelhar imagem | flip image | preset do Girar imagem | <PREENCHER> | <PREENCHER ou vazio> | <PREENCHER ou vazio> | <PREENCHER> |
| Remover dados EXIF | remove exif data | ferramenta | <PREENCHER> | <PREENCHER ou vazio> | <PREENCHER ou vazio> | <PREENCHER> |

Valores que valem, os mesmos do `data/README.md`:

- Volume EUA: exatamente um de `0-10`, `10-100`, `100-1K`, `1K-10K`, `10K-100K`, `100K-1M`, `1M-10M`.
- Lance: número com ponto decimal (`2.35`) ou vazio.
- Trends: `subindo`, `estavel` ou `caindo` ("caindo" é queda contínua nos 12 meses).

# Missão

Rode a F18 do FileOrca, "Ferramentas novas que passarem na regra", a última das cinco runs do `PLANO-UX-QV.md`. A tabela acima traz o Keyword Planner (Estados Unidos, inglês) e o Google Trends (Estados Unidos, 12 meses) das cinco candidatas da seção E do plano. Aplique a regra da seção E a cada uma, grave as cinco linhas no `data/keywords.csv` e ponha no ar, em inglês, português e espanhol, só as que deram `entra`, reusando o motor e as peças que existem.

A regra (seção E):

- **Ferramenta nova** (Organizar PDF, Remover dados EXIF): `entra` com volume `10K-100K` ou maior e Trends diferente de `caindo`.
- **Preset** (Extrair páginas, PDF para PNG, Espelhar imagem): `entra` com volume `1K-10K` ou maior, Trends diferente de `caindo` e os quatro testes da regra da página programática do `PLANO-FILEORCA.md`.
- O resto fica `fora`, com a linha no `keywords.csv` do mesmo jeito.

Ao terminar, com pelo menos uma `entra`:

- as cinco linhas estão no `data/keywords.csv` (fase `F18`), com os números da tabela e a decisão pela regra;
- a linha 15 está na tabela "Mudanças no contrato" do `PLANO-MELHORIAS.md`, com o texto da seção "Mudança no contrato" do `PLANO-UX-QV.md`, e o § dela está no `DECISOES.md`;
- cada candidata `entra` tem as páginas em en, pt e es, no molde das irmãs e com os blocos do `gate:conteudo`, e está no registro, nas rotas, nos textos, no hub, no menu, na home, na busca, no sitemap, no hreflang, no OG, no schema e nas contagens do site e do kit de lançamento;
- uma ferramenta de PDF nova seguiu os cinco passos do `docs/claude/pdf.md`, com a operação testada no Node sobre as fixtures antes da ilha;
- a primeira preset de PDF, se entrar alguma, criou a peça que faltava (o `parent` no `PdfPageDef`, as rotas da preset e os blocos do `gate:conteudo`), como as presets de imagem;
- a matriz cobre cada página nova com cada fixture que ela aceita, nos dois navegadores;
- o Remover dados EXIF, se entrar, prova no Node, sobre as fixtures com GPS, que a saída não leva Exif (além do que a decisão 10 diz), XMP nem GPS e tem os mesmos pixels;
- nada sai do aparelho, e nenhum evento, parâmetro ou chave de armazenamento novo aparece;
- o `docs/claude/`, o `docs/design/`, o `docs/lancamento/`, o glossário e o `docs/PENDENCIAS.md` estão em dia;
- o relatório está em `docs/relatorios/fase-18.md`, as matrizes em `docs/relatorios/fase-18-matriz.md` (imagem) e `docs/relatorios/fase-18-matriz-pdf.md` (PDF), conforme o que entrou, e a revisão em `docs/relatorios/REVISAO-F18.md`;
- a PR da branch `fase-18` sai pronta, com o CI completo verde, e o CI a mescla sozinho.

Se nenhuma der `entra`, a F18 não acontece: siga o caminho curto da decisão 0.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está em `39d1341` (a F17, PR 33) ou num commit mais novo. Confira com `git log --oneline -5` e guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

No clone, sem commit:

- `docs/prompts/prompt-fase-18.md` e `docs/prompts/prompt-fase-18.txt` (este prompt; a tabela de números está preenchida no `.txt`, e o `.md` pode estar com ela em branco);
- talvez o `PLANO-FILEORCA.md` modificado com uma linha só, posta pelo Victor antes da run (decisão 2);
- a pasta `Claude outputs/`, que fica fora de tudo.

O que você precisa saber antes de planejar:

- **A ficha da F18** está no `PLANO-UX-QV.md`, em "Fichas para a prompt-ultracode" → "F18 · Ferramentas novas que passarem na regra": a missão, as entradas, o "Dentro", o "Fora", os critérios, a válvula e o destino. Leia também, inteiras, a seção E ("As candidatas e a regra"), a "Mudança no contrato (a partir da F18)", a seção A (a vista da página) e a B (as miniaturas e a marcação), "O que não entra, e por quê" e "Regras de todas as runs deste plano".
- **O que mudou desde o plano.** Ele foi escrito em 9/nov/2026, antes da F14 à F17, que já estão na main. O que interessa à F18:
  - a F14 fez a vista da página (`PageView.tsx`), a lupa, Pequenas e Grandes, o Excluir que mostra o que sai, o Shift+clique e o Inverter seleção (`PageGrid.tsx`, `PageCell.tsx`, `grid-math.ts`; seção F14 do `docs/claude/pdf.md`);
  - a F15 fez o chip que leva o arquivo às ferramentas com ação e a lixeira com Desfazer em todo lote de imagem;
  - a F17 pôs no ar o AVIF to JPG e o Convert to WebP e escreveu, no fim do `docs/claude/imagem.md`, o que o roteiro de uma ferramenta de imagem toca hoje (os três idiomas de uma vez, o `IMAGE_EVENT_TOOLS`, o `carry.chips`, o `now`, os ícones únicos, as listas fixas dos specs, o `CONVERTER_FOR`). Esse roteiro vale para a F18.
- **A PR das partes do CI da F17** (branch `ajuste-ci-partes-f17`, § 720: o WebKit passa de 14 para 15 partes, de merge do Victor) pode ou não estar na main. Confira com `git log --oneline origin/main -- .github/workflows/ci.yml` e com o número de partes do WebKit no `ci.yml` (15 com ela, 14 sem). O § 720 é dela: ele é reservado, esteja ela mesclada ou não (decisão 2).
- **O que o código já faz por candidata:**
  - **Organizar PDF:** a grade tem três modos (`'select' | 'order' | 'rotate'`, em `PageGrid.tsx`). O motor faz o Excluir pelo `assemble.ts` (documento novo, no `structural` de `src/engine/pdf/process.ts`) e o Reorganizar e o Girar no próprio documento (o `inPlace`). Não há operação que faça os três juntos.
  - **Extrair páginas:** o Dividir tem os modos `each`, `ranges` e `pick` (`split` em `src/tools/pdf/tools.tsx`). No `pick`, a operação é `{ kind: 'split', parts: [páginas marcadas em ordem] }`, que já entrega um PDF só.
  - **PDF para PNG:** o PDF para JPG tem a escolha de formato (`format: 'jpeg' | 'png'`), a resolução (72, 150 ou 300 ppi) e as páginas (todas ou um intervalo); a operação `images` já escreve PNG.
  - **Espelhar imagem:** o Girar imagem combina o giro (`'right' | 'left' | 'half'`, sem "nenhum") com o espelho (`'none' | 'horizontal' | 'vertical'`) na operação `rotate` do motor (`spinOf` em `src/engine/image/process.ts`). Hoje não há como só espelhar.
  - **Remover dados EXIF:** o `src/engine/image/strip.ts` tira os metadados sem decodificar (`stripMetadata`), em JPG, PNG e WebP (o `STRIPPABLE` do `process.ts`). No JPG, ele guarda o perfil de cor (ICC) e, numa foto girada, um bloco Exif mínimo só com a Orientation (§ 33). Hoje ele só roda no caminho "sem ganho" (`originalStripped`): nenhuma operação o pede direto. O guia "How to remove location data from photos" (`guides-remove-location-from-photos`, em `src/tools/guides/registry.ts`) embute hoje o Redimensionar imagem.
- **As peças que a F18 cria:**
  - não existe preset de PDF: o `PdfPageDef` (`src/tools/pdf/registry.ts`) não tem `parent`, e o `pdfRoutes()` (`src/i18n/routes.ts`) só gera ferramentas. O modelo é o das presets de imagem (`IMAGE_PRESET_IDS`, `parent`, `presetsOf()`, as rotas `/<pai>/<nome>/` do `imageToolRoutes()` e as pastas `src/tools/<pai>/presets/<nome>/`);
  - as listas fechadas do GA4 (`IMAGE_EVENT_TOOLS` e `PDF_EVENT_TOOLS`, em `src/analytics/tool-ids.ts`) já levam as presets de imagem; as de PDF entram do mesmo jeito.
- **As fixtures:** de imagem, em `fixtures/images/` (as com GPS: `jpg-01-pixel2-retrato-gps.jpg`, `jpg-02-iphone6-paisagem-gps.jpg`, `jpg-03-iphone5-paisagem-orientacao3-gps.jpg`, `gen-webp-exif-gps.webp` e os HEIC `-gps`); de PDF, em `fixtures/pdf/`, com o oráculo `expected.json`. Nenhuma fixture nova entra (decisão 15).
- **O próximo § livre do `DECISOES.md` é o 721** (o 720 é da PR das partes). Se a main já tiver um § maior, siga do seguinte. Escreva os § na ordem. O grupo novo do `docs/PENDENCIAS.md` é o 28.
- **A linha de base,** do relatório da F17 e do § 720:
  - o Vitest com 137 arquivos e 2.159 testes;
  - o `--list` do Playwright com 2.470 testes por navegador, em 85 arquivos;
  - 68 arquivos JS em `dist/_astro/`;
  - 26 partes no `pnpm verificar --partes` com a PR das partes (o build, os portões, o Lighthouse, 8 do Chromium e 15 do WebKit), ou 25 sem ela; a soma foi de 3.096,8 s na F17.

  Confira tudo no ponto de partida e use os seus números.
- **O tempo das partes no CI não é o da máquina** (§ 648, § 717 e § 720; a seção F14 do `docs/claude/ci.md`). Use os tempos de teste da execução completa mais nova que houver: a da PR das partes, se ela já rodou completa, ou a da PR 33 (`gh run list --branch fase-17 --limit 10`, `gh pr checks 33`). Leia com `.cache/f14/ci-durations.mjs` e `.cache/f14/part-files.mjs`; se eles faltarem, refaça os dois pela descrição do `docs/claude/ci.md`. O § 720 traz o tempo de cada spec da F17.
- **O rótulo `ci` não existia na F15, na F16 nem na F17** (§ 666, § 698 e § 718), e criá-lo é só do Victor. As notas da regra 1 do `CLAUDE.md` e a decisão 25 dizem o que fazer nos dois casos.
- **O repositório é público** (§ 338): tudo o que você commita, a PR, os logs e os artefatos ficam públicos. Os números do Keyword Planner podem ir para o Git; nada além deles sai da conta do Google Ads.
- **O CI roda por classe** (F9): a PR em rascunho roda o job leve; a PR pronta roda tudo e, como esta run não mexe em `.github/`, é mesclada sozinha.

Leia antes de planejar, nesta ordem de autoridade:

1. **A ficha da F18 e este prompt.** Os dois juntos são a ficha da run: este prompt detalha e fecha o que a ficha deixa aberto, e nunca afrouxa um critério dela. Se parecerem conflitar, vale o mais rigoroso, com um §.
2. **Os planos:**
   - o `PLANO-UX-QV.md`: a seção E, a "Mudança no contrato", as seções A e B, as regras de todas as runs e a ficha;
   - o `PLANO-MELHORIAS.md`: as regras de toda run e a tabela "Mudanças no contrato";
   - o `PLANO-FILEORCA.md`: "Execução por IA", as "Decisões fechadas", o "Fora do escopo", a "Regra da página programática" e o "Backlog com gatilho".
3. **O `CLAUDE.md`,** inteiro.
4. **De `docs/claude/`:**
   - o `pdf.md`, o `imagem.md`, o `playwright.md` e o `windows-git-bash.md`, inteiros;
   - do `idiomas.md`, o que fala do `lint:texto`, do glossário, dos guias de arquivo, do `guias:medir` e do kit do Product Hunt;
   - do `ci.md`, as pegadinhas gerais da F1a e as seções do ajuste do CI em partes, da F9, da F14 e da F17;
   - do `design-e-oli.md`, as pegadinhas gerais e as seções da F13a e da F14;
   - do `service-worker.md`, o que fala da "Abrir com" e do compartilhar;
   - do `anuncios.md`, o que fala da distância, da densidade e do mapa de anúncios.
5. **Do `DECISOES.md`, só buscando o §:**
   - da regra das presets e do `keywords.csv`: § 58, § 68, § 69, § 77, § 78, § 80, § 85 e § 88;
   - do PDF: § 144, § 145, § 148, § 152, § 175, § 178 e § 182, e de § 617 a § 642 (a F14);
   - do strip e dos metadados: § 33 e § 100;
   - as outras: § 191, § 290, § 291, § 341, § 447, § 469, § 479, § 491, § 496, § 497, § 582, § 648, § 653, § 654, § 666, § 698, de § 701 a § 720;
   - e o que elas citarem.
6. **Do `docs/design/`:** o `README.md` ("Layout e anúncios", os ícones e a regra "Ícone sozinho só em ação de linha"), o README de `docs/design/assets/Icons/` e os README do ToolPage, do OptionGroup, do FileCard e do PageView.
7. **Do `docs/PENDENCIAS.md`:** "Como ler", o Resumo, os grupos 24 a 27, "Registrados" e "Já corrigidos"; e o `tests/unit/pendencias.test.ts`, que confere o arquivo.
8. **Do `docs/i18n/`:** o glossário de pt e o de es.
9. **Do `data/`:** o `keywords.csv` e o `README.md`; e o `docs/F0-KEYWORDS.md`.
10. **Do `docs/lancamento/`:** o `README.md` e as contagens que o `launch-kit.test.ts` confere.

# Escopo

Dentro: o "Dentro" da ficha inteiro, só para as candidatas `entra`, com estes arquivos:

- o `data/keywords.csv` e o `data/README.md` (decisão 3);
- a linha 15 do `PLANO-MELHORIAS.md` (decisão 2);
- as pastas novas em `src/tools/` e as páginas em `src/pages/` (en, pt e es) de cada candidata `entra`;
- em `src/tools/pdf/`: o registro, os tipos, o `tools.tsx`, a `PageGrid`, a `PageCell`, a `PageView`, o `grid-math.ts`, o `page.ts`, o `texts.ts` e os textos da ilha, só no que as candidatas pedem;
- em `src/tools/image/`: o registro, o `page.ts`, os tipos e os textos da ilha, só no que as candidatas pedem;
- o `src/i18n/routes.ts`, os tipos de `src/i18n/types.ts` e os cartões de `src/i18n/{en,pt,es}/common.ts`;
- o `src/analytics/tool-ids.ts`, só os ids novos nas listas fechadas (decisão 14);
- o motor, só nisto: a operação `organize` em `src/engine/pdf/` (decisão 6) e a operação `strip` em `src/engine/image/` (decisão 10), cada uma com o Vitest no Node antes da ilha;
- o guia `guides-remove-location-from-photos`, se o Remover dados EXIF entrar (decisão 10);
- os ícones novos (decisão 12) e o que o design system pedir (decisão 21);
- os textos das outras páginas que as novas desmintam, as contagens e o kit de lançamento (decisões 13 e 17);
- os testes (decisões 15, 16 e 20) e o F17 m-1 (decisão 16);
- os documentos: `docs/claude/`, `docs/design/`, `docs/i18n/`, `docs/PENDENCIAS.md`, `DECISOES.md` e os relatórios.

Fora (não toque): o "Fora" da ficha inteiro (candidata `fora`, candidata fora da seção E, tudo o que o "Fora do escopo" do `PLANO-FILEORCA.md` mantém fora), e mais:

- o resto do motor: só as duas operações novas. Um defeito real que a matriz ache em outra parte do motor se corrige com um Vitest que reprova sem a correção e um §, e conta para as lentes (passo 5 de "Como trabalhar");
- o que as ferramentas que já existem fazem: as listas `next` e `related` delas podem ganhar as páginas novas, e o guia de localização passa a embutir o Remover dados EXIF; nada mais muda nelas;
- renomear página ou mudar caminho que existe: o "Organizar páginas do PDF" (o Reorganizar em pt) continua como está (decisão 4);
- dizer à pessoa quais metadados a foto tinha (um leitor de Exif): é ideia para depois, que vai no relatório e não no código;
- fixtures novas ou mudadas; o `pnpm fixtures` não roda;
- o `lighthouserc.json`, o `.github/`, o `.githooks/` e o `.claude/settings.json` (a PR separada das partes, se precisar, é a da decisão 25); nenhum teste novo no `clearance.spec.ts` (F14 m-5);
- chave nova no `localStorage`, no `sessionStorage` ou no IndexedDB; evento ou parâmetro novo no GA4 (os ids novos nas listas fechadas não são parâmetro novo, decisão 14); dependência nova;
- a busca além do índice (o D16, `F14 d-16`, é decisão do Victor);
- os outros itens do `docs/PENDENCIAS.md`, além do F17 m-1 e do F14 m-1 (decisões 2 e 16);
- os relatórios e as matrizes históricas (`fase-02-matriz.md`, `fase-05a-matriz.md` e `fase-17-matriz.md`), a menos que um teste exija regerar uma delas (decisão 15);
- o `PLANO-FILEORCA.md` (decisão 2), o `PLANO-UX-QV.md` e o `CLAUDE.md`;
- os § antigos do `DECISOES.md` e as seções antigas de `docs/claude/`: só se acrescenta, nunca se apaga nem se reescreve.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 721)

0. **O primeiro passo: a tabela e a regra.** Antes de qualquer branch ou commit:
   - **Leia a tabela do topo.** Se uma célula de volume ou de Trends ainda disser `<PREENCHER>`, ou trouxer um valor fora da lista, pare aqui: não crie branch, não commite e termine com uma resposta curta em português dizendo que células faltam e o que vale em cada uma. Isso não é pergunta: é a falta da entrada que a ficha exige. Nunca invente, estime nem busque na web um número para preencher a tabela. Um lance com `<PREENCHER ou vazio>` conta como vazio.
   - **Aplique a regra** da Missão a cada linha. Os quatro testes da página programática, para as presets: (1) a demanda é a linha `entra`; (2) o comportamento é o da decisão de cada preset, que muda a ferramenta, e não só o título; (3) o conteúdo, ao menos três blocos que as irmãs não têm, o `gate:conteudo` confere; (4) a geografia é a dos EUA, que é a da tabela. Uma preset com volume e Trends bons passa nos testes 2 e 4 pelo desenho deste prompt; o 3 você garante escrevendo o conteúdo.
   - **Escreva a decisão** de cada candidata no plano da run e num §, com a linha da tabela, a regra e o resultado.
   - **Nenhuma `entra`: o caminho curto.** A branch é `ajuste-keywords-f18`. Ela leva:
     - os dois arquivos do prompt, com o nome que têm;
     - as cinco linhas `fora` no `keywords.csv` e o `data/README.md` (decisão 3);
     - um § com a tabela e a regra;
     - no `docs/PENDENCIAS.md`, o F17 m-1 com o "Quem resolve" trocado de "Run F18" para "Run de ajuste de testes", e o porquê no §;
     - o relatório curto `docs/relatorios/ajuste-keywords-f18.md`.

     Sem linha 15, sem página e sem código. Revisão de run curta: uma lente e um cético (regra 3). A PR segue a decisão 25 sem a conferência do meio. Depois disso, termine.
   - **Uma ou mais `entra`: a F18 inteira,** na branch `fase-18`, com as decisões abaixo só para as candidatas `entra`. A decisão de uma candidata `fora` não se aplica.

1. **A especificação.** A ficha é contrato, palavra por palavra: o "Dentro", os critérios e a válvula. Os nomes, os caminhos e os textos que este prompt fixa também são contrato. O que nenhum dos dois diz, você decide pela régua de "Autonomia e decisões", com um §.

2. **Os planos, a linha 15 e o § 720.**
   - **A linha 15.** Com pelo menos uma `entra`, a tabela "Mudanças no contrato" do `PLANO-MELHORIAS.md` ganha a linha 15, com o texto exato da seção "Mudança no contrato (a partir da F18)" do `PLANO-UX-QV.md` (as quatro colunas: `15`, `Catálogo`, o "Antes" e o "Agora"). Nenhuma outra linha desse arquivo muda. O § dela diz que o teto do catálogo abriu só para as candidatas que passaram, quais foram, e que o gatilho do "remover metadados" no backlog foi substituído pela regra da seção E.
   - **O `PLANO-FILEORCA.md`.** A linha que a F14 deixou como "Victor faz" (F14 m-1, no grupo 24) faltava no fim da F17 e pode ter sido posta pelo Victor antes desta run. **Não edite o arquivo por nenhum caminho** (ferramenta de edição, shell, script ou `git apply`): o `.claude/settings.json` nega. No começo, rode `git diff -- PLANO-FILEORCA.md`:
     - se a diferença for só a linha do F14 m-1 acrescentada (com, no máximo, uma linha em branco junto), ela entra no primeiro commit, ao lado do prompt, e o F14 m-1 vai para "Já corrigidos", com o §;
     - se não houver diferença, siga sem ela: o F14 m-1 continua aberto;
     - se houver qualquer outra diferença, deixe o arquivo como está, fora dos commits, e registre.
   - **O `PLANO-UX-QV.md` e o `CLAUDE.md`** não mudam. Achado que desminta um plano vai num §, nunca no texto dele.
   - **O § 720** é da PR das partes da F17. Não o use nem o reescreva. Se ela ainda não estiver na main, o § dela vai entrar depois, e a numeração desta run começa no 721 de todo jeito.

3. **O `keywords.csv` e o `data/README.md`.**
   - As cinco linhas entram no fim do `data/keywords.csv`, na ordem da tabela, com as colunas do arquivo:

     | `slug` | `area` | `fase` | `tipo` | `termo` |
     | --- | --- | --- | --- | --- |
     | `organize-pdf` | `pdf` | `F18` | `ferramenta-pdf` | `organize pdf` |
     | `split-pdf/extract-pages` | `pdf` | `F18` | `preset-pdf` | `extract pages from pdf` |
     | `pdf-to-jpg/to-png` | `pdf` | `F18` | `preset-pdf` | `pdf to png` |
     | `rotate-image/flip` | `imagem` | `F18` | `preset-imagem` | `flip image` |
     | `remove-exif-data` | `imagem` | `F18` | `ferramenta-imagem` | `remove exif data` |

     As outras colunas vêm da tabela do topo, e o `decisao` vem da regra.
   - O `data/README.md` ganha o `F18` na coluna `fase` e o `preset-pdf` na coluna `tipo`. A "Regra da decisão" ganha duas linhas: as ferramentas da F18 entram com `10K-100K` ou maior e Trends diferente de `caindo` (a seção E do `PLANO-UX-QV.md` e, com alguma `entra`, a linha 15 do `PLANO-MELHORIAS.md`); a `preset-pdf` entra como a `preset-imagem`. A linha "`ferramenta-imagem` e `ferramenta-pdf` · sempre" passa a dizer "sempre, até a F17". O resto não muda. Edite como texto, nunca por planilha.
   - Teste que lê o arquivo e fixava "toda ferramenta é `entra`" ou a lista de tipos muda no formato da § 341.

4. **Os nomes, os caminhos e o glossário.**

   | Id | en | pt | es |
   | --- | --- | --- | --- |
   | `organize-pdf` | Organize PDF · `/organize-pdf/` | Gerenciar páginas do PDF · `/pt/gerenciar-paginas-pdf/` | Organizar PDF · `/es/organizar-pdf/` |
   | `split-pdf-extract-pages` | Extract pages from PDF · `/split-pdf/extract-pages/` | Extrair páginas do PDF · `/pt/dividir-pdf/extrair-paginas/` | Extraer páginas de PDF · `/es/dividir-pdf/extraer-paginas/` |
   | `pdf-to-jpg-to-png` | PDF to PNG · `/pdf-to-jpg/to-png/` | PDF para PNG · `/pt/pdf-para-jpg/para-png/` | PDF a PNG · `/es/pdf-a-jpg/a-png/` |
   | `rotate-image-flip` | Flip image · `/rotate-image/flip/` | Espelhar imagem · `/pt/girar-imagem/espelhar/` | Reflejar imagen · `/es/rotar-imagen/reflejar/` |
   | `remove-exif-data` | Remove EXIF data · `/remove-exif-data/` | Remover metadados da foto · `/pt/remover-metadados-foto/` | Quitar metadatos de la foto · `/es/quitar-metadatos-foto/` |

   - **Por que não "Organizar PDF" em pt:** o Reorganizar já se chama "Organizar páginas do PDF" em pt (`/pt/organizar-paginas-pdf/`). Duas páginas com "Organizar" no hub de pt confundem e brigam pela mesma busca, e o caminho que existe não muda. Em es, o Reorganizar é "Ordenar páginas de PDF", e "Organizar PDF" fica livre.
   - **As presets** seguem o desenho das de imagem: o caminho é `/<pai>/<nome>/`, e o id é `<pai>-<nome>` (`compress-image-to-100kb`). Os nomes de pt e es usam as palavras do glossário: "Espelhar" e "Reflejar" (a linha "Mirror"), "metadados" e "metadatos" (a linha "metadata").
   - O título, a descrição e o H1 seguem o molde das irmãs ("<Nome> online, no upload", "<Nome> online, sem upload", "<Nome> en línea, sin subir archivos"). Nas presets, o termo da tabela aparece no título e no H1 em inglês.
   - As linhas entram no glossário de pt e de es, na tabela de ferramentas: cada ferramenta depois da irmã mais próxima, cada preset logo depois da página mãe. Se o glossário ou um teste mostrar conflito com um nome desta tabela, ajuste só o nome de pt ou de es, com um §; o de en não muda.
   - Os sinônimos da busca, você escreve no padrão dos cartões irmãos de cada idioma. No mínimo: "exif", "metadata", "gps" e "location" no Remover dados EXIF; "organize", "rearrange", "rotate" e "delete" no Organizar PDF; "extract" na Extrair páginas; "png" na PDF para PNG; "flip" e "mirror" na Espelhar imagem. Os equivalentes vão em pt e es.

5. **A peça das presets de PDF** (só se entrar a Extrair páginas ou a PDF para PNG; a primeira cria, a segunda reusa).
   - O `PdfPageDef` ganha `parent?: PdfToolId`, como o `ImagePageDef`. Entram o `PDF_PRESET_IDS`, o tipo `PdfPageId` (ferramenta ou preset) e o `presetsOf()` do PDF, no molde do de imagem.
   - O `pdfRoutes()` gera as rotas das presets em `/<pai>/<nome>/`, com os caminhos de pt e es no `TRANSLATED_PATHS`. Os textos ficam em `src/tools/<pai>/presets/<nome>/i18n/{en,pt,es}.ts`, junto com os textos da ilha de PDF, como as presets de imagem.
   - A página da preset usa a mesma ilha e a mesma entrada das ferramentas de PDF (o `PdfIsland.astro` e o `PdfToolPage.astro`): ela carrega os mesmos 2 arquivos JS das irmãs. A definição da preset na ilha (`PDF_TOOLS`) parte da do pai e muda só o que a decisão dela diz.
   - O que a preset de imagem tem e a de PDF ganha igual:
     - a trilha de quatro passos, com o `skipHub` abaixo de 360 px (§ 582);
     - o lugar no hub e na busca;
     - os blocos do `gate:conteudo`, com ao menos três que as irmãs não têm;
     - o `next` e o `related` próprios;
     - o id no `PDF_EVENT_TOOLS`.
   - Confira no `dist/`, nas presets de imagem, onde elas aparecem: no hub, no menu, na home, no rodapé, na "Abrir com", no sitemap. A de PDF aparece nos mesmos lugares, e não nos outros. Registre a lista num §.
   - O `docs/claude/pdf.md` ganha, na seção da F18, o roteiro "Como acrescentar uma preset de PDF".

6. **O Organizar PDF** (só se entrar).
   - **O registro:** `files: 'single'`, `run: 'action'`, sufixo `organized`, um ícone novo (decisão 12), o `next` e o `related` (decisão 11).
   - **A operação no motor,** em `src/engine/pdf/types.ts` e `process.ts`: `{ kind: 'organize'; pages: { index: number; turn: number }[] }`.
     - A lista é a ordem de saída. Página que não está na lista sai, e o `turn` é o número de quartos de volta, no sentido do relógio, somado ao `/Rotate` dela (0 a 3).
     - Ela é feita numa passada do `assemble.ts`: as fontes na ordem nova, sem as que saem, e o giro aplicado nas páginas do documento novo. Assim valem as regras do Excluir sobre links, campos, marcadores e XFA (§ 145), e as notas dele.
     - Índice inválido e repetido saem da lista. Lista vazia, ou que tire todas as páginas, é `encode`, e a ilha nunca a manda: com todas saindo, a grade mostra o erro e a ação não roda (veja "a página que sai", abaixo).
     - **O Vitest no Node vem antes da ilha,** sobre as fixtures que o Excluir aceita (com o `expected.json`), cada uma com um plano determinista que move, gira e tira páginas, inclusive a `gen-paginas-300`, a `gen-paginas-mistas` (tamanhos e `/Rotate` diferentes) e o formulário do IRS. Ele confere a contagem, a ordem (pelo texto de cada página no PDF.js do Node), o `/Rotate` final, as notas e a abertura no qpdf. O que o motor recusa (cifra, arquivo estragado) cai nas mesmas razões do Excluir.
   - **A grade:** um modo novo, `'organize'`, na `PageGrid`, que junta o que existe:
     - a ordem do modo `'order'`: as setas na célula, pelo toque e pelo teclado, com o foco seguindo a página, e o arrastar com o mouse;
     - a marcação do modo `'select'`: o toque marca, com o Shift+clique, o Shift+Espaço, o "Marcar todas", o "Desmarcar todas", o "Inverter seleção" e o intervalo digitado (`RangePicker`);
     - **o teclado da página:** no modo `'order'`, o Espaço e o Enter pegam a página para mover; no `'organize'`, eles marcam, como no `'select'`. Mover pelo teclado fica com as setas da célula (botões). A run confere que nenhuma tecla faz duas coisas, com um § e a fala de cada gesto;
     - uma barra de ações sobre as marcadas, logo acima da grade: "Girar à direita", "Girar à esquerda" e "Tirar". Quando todas as marcadas já saem, o "Tirar" vira "Devolver". Sem página marcada, os botões ficam com `aria-disabled="true"`, focáveis, e uma ajuda diz para marcar páginas;
     - **a página que sai** fica na grade com o visual do Excluir da F14 (a imagem a 40 %, a lixeira no círculo e o nome acessível terminando em ", sai") até a pessoa a devolver. Ela não some: tirar não precisa de Desfazer. O giro aparece na folha (o `sheetRatio` com os giros, como no Girar);
     - a contagem: "{count} marcadas · o PDF novo fica com {left} páginas", com as formas de 1, nos três idiomas. Quando todas saem, o erro de "todas" do Excluir, adaptado;
     - a célula é um `PageCell` com `shouldComponentUpdate` e as funções no objeto `actions` (seção F14 do `docs/claude/pdf.md`): na `gen-paginas-300`, um toque não redesenha a grade inteira;
     - os alvos têm 48 px de 320 a 1280 px, em Pequenas e em Grandes. Se a célula de Pequenas não couber o check, as setas e a lupa com 48 px, a run decide como (uma linha a mais na célula, as setas só na célula ativa, ou outra forma que o axe e os 48 px aceitem), com um § e a medida.
   - **A vista da página (F14):** a lupa abre a vista, como no Reorganizar. O título é "Página {n} · posição {p} de {total}", e o Anterior e o Próxima seguem a ordem atual. A barra de baixo tem duas ações, "Girar 90°" (um giro por toque) e "Tirar esta página" (com `aria-pressed`), na mesma faixa do Anterior e do Próxima. Abaixo de 480 px, as duas ações vão na largura toda, uma por linha, e o Anterior e o Próxima embaixo, lado a lado. A ação usa o mesmo caminho da célula, então a grade, a contagem e a operação mudam juntas, com uma fala só.
   - **O resultado:** um PDF só, com o "Ver o PDF novo" da F14. O rótulo da ação segue o molde das irmãs com ação.
   - **Os textos:** os passos "Como funciona" citam a lupa, a marcação e a barra; o FAQ responde a diferença entre o Organizar e o Reorganizar, o Excluir e o Girar, e se dá para desfazer (as opções ficam à vista depois do resultado, e uma mudança traz a ação de volta, F13a).
   - **A válvula:** o Organizar PDF pode ir inteiro para uma F18b (decisão 26). Por isso ele vem por último na ordem das fatias e numa frente própria.

7. **A Extrair páginas** (preset do Dividir; só se entrar).
   - É o Dividir só no modo `pick`: a página abre com a grade, a lupa e o intervalo digitado, sem o segmento dos modos "cada página" e "intervalos". Entrega um PDF só, com as páginas marcadas na ordem do arquivo. O sufixo é `extracted`.
   - Isso passa no teste 2: o modo é um só, e a saída é uma só. A intenção é outra: dividir é quebrar em vários, extrair é tirar algumas (seção E).
   - O "Ver o PDF novo" aparece (a F14 já o mostra no Dividir com uma parte).
   - O FAQ diz quando usar o Dividir, o Excluir e o Organizar (se ele entrou) em vez dela.
   - A fala da contagem é a do Dividir ("marcadas"), não a do Excluir ("saem").

8. **A PDF para PNG** (preset do PDF para JPG; só se entrar).
   - O formato é PNG fixo, sem a escolha de formato. A resolução (72, 150 ou 300 ppi) e as páginas (todas ou um intervalo) continuam como no pai. O resumo do "Ajustar" diz "PNG · <resolução>".
   - A saída é a do pai: um PNG por página, e o ZIP com mais de uma.
   - Isso passa no teste 2: a ferramenta muda (sem a escolha, e outro formato de saída por padrão).
   - Os blocos próprios explicam quando o PNG serve melhor que o JPG (texto, linhas finas, transparência que o PDF não tem) e o tamanho maior dos arquivos. Toda afirmação de tamanho é conferida na matriz com as fixtures.

9. **A Espelhar imagem** (preset do Girar imagem; só se entrar).
   - **As opções:** o espelho, com "Horizontal" (o padrão) e "Vertical", sem giro. O `now` diz qual.
   - **A operação, sem mudar o motor:** o motor não tem "sem giro" (`Turn` é `'right' | 'left' | 'half'`), e meia volta seguida de um espelho é o outro espelho. Então "Horizontal" pede `{ kind: 'rotate', turn: 'half', flip: 'vertical' }`, e "Vertical" pede `{ kind: 'rotate', turn: 'half', flip: 'horizontal' }`. Um comentário no `Panel.tsx` da preset diz isso.
     - A matriz prova que a saída é o espelho certo da referência (o Exif Orientation 2 para o horizontal e 4 para o vertical, sobre a referência em pé), e nunca o outro espelho nem um giro, com a folga do `closestWrong`.
     - Se a prova mostrar diferença de pixel entre o caminho composto e o espelho puro, a alternativa é pôr `'none'` no `Turn` do motor, com um Vitest que reprova sem a mudança, um § e as cinco lentes (passo 5 de "Como trabalhar").
   - A orientação da foto é aplicada antes, como no pai: "Horizontal" espelha o que a pessoa vê.
   - `beforeAfter: 'never'`, como o pai. O `success` é o do pai.
   - O teste 2 passa: o pai não tem como só espelhar.

10. **O Remover dados EXIF** (ferramenta de imagem; só se entrar).
    - **O que aceita:** `['jpeg', 'png', 'webp']`, os formatos que o `strip.ts` limpa sem decodificar. O HEIC e o AVIF são recusados com o link ao conversor do idioma (o `CONVERTER_FOR` já faz), e o conversor também tira os metadados. O FAQ diz isso.
    - **A operação no motor:** `{ kind: 'strip' }`, em `src/engine/image/types.ts` e `process.ts`.
      - Ela devolve o arquivo pelo caminho do `originalStripped`, sem decodificar os pixels e sem o teste de "ganho". O `outcome` é um valor novo (por exemplo, `'stripped'`) ou um que já exista, decidido num §, com a frase do card que ele pede.
      - O WebP animado continua animado, se o `stripWebp` guardar os quadros. Confira e registre.
      - Arquivo estragado cai nas razões que já existem.
      - O pacote do motor (`pnpm motor:exportar`) ganha a operação, e o README dele diz isso, se ele listar as operações.
    - **A Orientation, e o que "sem Exif" quer dizer aqui.** A ficha pede saída sem Exif e com os mesmos pixels. Numa foto girada, as duas coisas só convivem com o bloco Exif mínimo que o `strip.ts` deixa (§ 33), só com a Orientation:
      - sem ele, a foto apareceria deitada;
      - aplicar o giro nos pixels exigiria codificar de novo, e a ficha pede os mesmos pixels;
      - girar o JPG sem perda pediria uma dependência nova.

      Vale então a leitura que o site usa desde a § 33: nenhum dado do Exif além da Orientation. Nada de GPS, data, aparelho, miniatura nem nome do dono. A foto sem Orientation sai sem Exif nenhum. A prova usa o `expectNoMetadata(..., { tagMayStay: true })` e o `orientationOnly` de `tests/e2e/lib/matrix.ts`. O § diz que esta é a leitura mais rigorosa que cabe nos dois critérios juntos, e o FAQ diz isso à pessoa.
    - **A prova no Node** (o critério da ficha), num Vitest que roda o motor sobre as fixtures com GPS:
      - os três JPG `-gps` e a `gen-webp-exif-gps.webp`;
      - e um PNG com `eXIf`, `tEXt`, `iTXt` e `zTXt`, montado dentro do teste a partir de uma fixture PNG (sem fixture nova).

      Ele confere, com o `metadataReport` de `tests/e2e/lib/images.ts`: nenhum GPS, XMP nem IPTC, e nenhum Exif além da Orientation. Confere também que os bytes da imagem são os mesmos da entrada: no JPG, do SOF ao EOI; no PNG, a sequência dos `IDAT`; no WebP, os `VP8`, `VP8L`, `ALPH` e os quadros. Os bytes iguais são a prova de "os mesmos pixels", mais forte que decodificar. Na matriz, nos dois navegadores, os pixels decodificados da saída são iguais aos da entrada.
    - **O painel:** sem escolha; as opções mostram só a nota (`NoteOptionsTexts`, como o AVIF to JPG). `beforeAfter: 'never'`. O card diz que a localização e os outros metadados saíram e que a foto não mudou. Um arquivo por foto, e o ZIP com mais de uma.
    - **O guia "How to remove location data from photos"** (`guides-remove-location-from-photos`) passa a embutir o Remover dados EXIF, no lugar do Redimensionar imagem.
      - Os textos do guia que falam da ferramenta embutida (os modos dela, o que ela fez com os arquivos, como usar) passam a falar da ferramenta nova, nos três idiomas.
      - Rode `pnpm guias:medir --only guides-remove-location-from-photos` sobre o `dist/` novo e confira o `data/guides-measured.json`.
      - A página do Redimensionar perde o link ao guia, e a do Remover dados EXIF o ganha (`guidesOfTool`).
      - Os testes dos guias acompanham, no formato da § 341.
    - **O `PLANO-FILEORCA.md` diz** que toda saída de imagem "aplica a orientação da foto e descarta os metadados". Aqui a orientação fica no bloco mínimo, e a foto aparece em pé: registre num § que a regra continua cumprida.

11. **Os chips, as relacionadas e o chip que leva.**
    - O `next` e o `related` de cada página nova levam a páginas que existem nos três idiomas, no limite de hoje (chips de 2 a 4, relacionadas até 6).
    - As irmãs ganham a página nova nas relacionadas onde ela é o próximo passo natural:
      - o Organizar no Reorganizar, no Excluir, no Girar PDF e no Juntar;
      - a Extrair no Dividir e no Excluir;
      - a PDF para PNG no PDF para JPG;
      - a Espelhar no Girar imagem e no Cortar;
      - o Remover dados EXIF no Comprimir, no Redimensionar e no HEIC to JPG.
      - Cada troca vai num §, e nenhuma lista passa do limite.
    - **O chip que leva** (§ 496, § 497, § 654 e a F15) leva o resultado só quando o destino aceita o formato dele. O Organizar e a Extrair, com ação, entram como destino do jeito que a F15 fez com o Juntar, o Dividir, o Reorganizar e o Proteger: o arquivo chega e espera a ação. Os rótulos de "levar" entram nos três idiomas.
    - O Proteger continua sem levar nada para fora.

12. **Os ícones.** Nenhum hub nem home repete um desenho (§ 491 e § 706).
    - O Organizar PDF e o Remover dados EXIF precisam de dois desenhos que nenhum cartão usa: um ícone do conjunto que nenhum cartão usa, conferido no `dist/`, se ele servir pelo sentido; se nenhum servir, um desenho novo no estilo do conjunto (24 × 24, a raiz do `ICON_FILE_ROOT`, traço 2, nenhuma cor por dentro, só LF), com a linha no README de `docs/design/assets/Icons/`, no `ICON_NAMES` (na ordem do `sort()`) e num §, e o `icons.test.ts` passando.
    - As presets usam o ícone do pai, como as de imagem.
    - Os mínimos do `hub-icons.test.ts` e as contagens de cartões das homes acompanham.

13. **Os textos.**
    - Os de en você escreve no registro do site, conferindo cada afirmação contra o motor e a matriz. Os de pt e es saem pelo glossário de `docs/i18n/`, no registro do site, nunca palavra por palavra.
    - Fonte externa (o que o Exif guarda, onde o celular grava a localização) é página pública lida na run, com a data, num §. Só leitura.
    - **As contagens:**
      - os hubs dizem o número por extenso ("ten" → "eleven" no de imagem com o Remover dados EXIF; "twelve" → "thirteen" no de PDF com o Organizar), em en, pt e es: título, descrição, H1 e intro;
      - procure com `grep`, nos textos dos três idiomas, nos comentários que contam e nos testes, toda contagem de ferramentas de imagem e de PDF, e corrija;
      - as contagens que o código calcula (o H1 da home, o rodapé, o menu, o cartão da Sobre) mudam sozinhas, e só as ferramentas contam: as presets não entram no H1 da home (F13b). Confira no `dist/` cada uma, nos três idiomas, antes e depois.
    - Frase de FAQ ou de especificação que as páginas novas desmentem é corrigida na mesma run. Um exemplo: a ajuda do Girar imagem não diz que espelhar exige girar.
    - Um § lista, nos três idiomas lado a lado, os textos novos das ilhas e das opções e as frases das outras páginas que mudaram.
    - O `lint:texto` dá 0 erro, e o `english-leak.test.ts`, o `glossary.test.ts`, o `gate:conteudo` e o `gate:seo` passam.

14. **O lugar no site.**
    - **O que lê o registro e as rotas** (§ 77 e § 78): o hub, a home, o rodapé, o menu, a busca, a 404, o OG, o sitemap, o hreflang e o schema. Confira no `dist/` que cada página nova aparece onde as irmãs do mesmo tipo aparecem (ferramenta como ferramenta, preset como preset), nos três idiomas, e que nenhum portão reclama.
    - **A "Abrir com" e o `share_target`** (§ 290 e § 291): o Remover dados EXIF e o Organizar entram onde as ferramentas do formato deles estão. Nenhum formato novo entra no `accept`, então ele não deve mudar: confira.
    - **O GA4:** os ids novos entram no `IMAGE_EVENT_TOOLS` e no `PDF_EVENT_TOOLS`, as listas fechadas do `tool` e do `target`, como as presets de imagem já estão. Sem isso, os eventos sairiam sem a ferramenta. Não é evento nem parâmetro novo, e a Privacidade não muda: registre num §. O `consent.test.ts` confere as listas contra os registros.

15. **As matrizes.**
    - **De imagem** (`tests/e2e/lib/matrix.ts`, `image-matrix.spec.ts` e `image-presets.spec.ts`; § 80 e § 88):
      - a Espelhar com cada fixture que ela aceita, nas duas opções, conferida como o pai: decodifica; formato e dimensões pelo oráculo; o espelho certo pelos pixels; nenhum metadado;
      - o Remover dados EXIF com cada fixture que ele aceita: os bytes da imagem iguais, os pixels decodificados iguais, a Orientation pela decisão 10 e nenhum outro metadado;
      - no meio de cada lote, o que a página recusa (o HEIC e o AVIF com o link ao conversor, a GIF e os quatro quebrados);
      - os lotes divididos pela regra da § 88, sem deixar fixture de fora;
      - nada sai do 127.0.0.1.

      A tabela sai com `node scripts/fixtures/matrix-table.ts > docs/relatorios/fase-18-matriz.md`, depois de rodar o `image-matrix.spec.ts` e o `image-presets.spec.ts` nos dois navegadores, numa execução só.
    - **De PDF** (`tests/e2e/pdf-matrix.spec.ts`; § 175): cada ferramenta e preset nova com cada fixture que ela aceita, nos dois navegadores, com a conta conferida no Node contra o `expected.json`.
      - O Organizar com o plano determinista da decisão 6.
      - A Extrair com páginas marcadas, conferidas pela ordem e pelo texto.
      - A PDF para PNG com as páginas, as dimensões pela resolução e o formato PNG pelos bytes.
      - O `pdf-matrix-table.test.ts` reprova lacuna.
      - A tabela vai em `docs/relatorios/fase-18-matriz-pdf.md`. Se o script só grava a tabela da F5a, dê a ele um caminho de saída, com um §. Se o `pdf-matrix-table.test.ts` exigir a tabela da F5a regerada, regere-a, com um §.
    - Nenhuma fixture nova: o que um teste precisa a mais (o PNG com metadados da decisão 10) nasce dentro dele.

16. **O F17 m-1** (o grupo 27 manda para a F18; fora da ficha, então a válvula pode cortá-lo).
    - Um teste irmão do `image-avif-speed.spec.ts` converte a mesma `jpg-01-pixel2-retrato-gps.jpg` para WebP no Convert to WebP, uma vez por navegador. Ele imprime `[webp 12 MP] <navegador> <s>` e afirma só o WebP das dimensões certas, sem metadados. O tempo é medida, não critério.
    - O § diz, com o número do runner (da conferência do meio ou da execução final), se a frase "AVIF takes longer to save than WebP" segue certa lá. Se não seguir, corrija a frase nos três idiomas.
    - O F17 m-1 vai para "Já corrigidos" só com o § escrito.

17. **O kit de lançamento.**
    - As contagens que o `launch-kit.test.ts` confere acompanham os registros: as ferramentas de imagem e de PDF e as frases que contam. As contagens de caracteres que os arquivos declaram são refeitas.
    - Uma linha do kit que liste o que o site faz ganha as ferramentas novas onde a lista é de ferramentas, sem passar dos limites de caracteres de cada campo.
    - **As imagens da galeria:** abra cada uma. Se alguma mostra a contagem ou a grade de um hub que mudou, regere com `pnpm lancamento:imagens` sobre o `dist/` novo e confira o `launch-kit.test.ts`. Se nenhuma mostra, não regere.

18. **O orçamento.**
    - Cada página nova carrega os mesmos arquivos JS e as mesmas requisições das irmãs (as de imagem, 2 JS e 6 requisições no Chromium; as de PDF, as da ferramenta mãe ou irmã), com o JS inicial abaixo de 80 KB com gzip. Elas entram nas listas do `budgets.spec.ts` e do `i18n-budgets.spec.ts`, com o teste "igual à irmã, requisição a requisição" da F17.
    - As outras páginas carregam os mesmos arquivos JS e as mesmas requisições do ponto de partida, conferidos arquivo a arquivo contra o `dist-base`.
    - O `dist/_astro/` ganha só o que as ilhas novas pedem. Liste os arquivos novos, com o tamanho com gzip, num §.
    - O grupo `island` de imagem e a entrada da ilha de PDF crescem no máximo 2 KB com gzip cada. O modo `'organize'` da grade é o que mais pesa: se passar, tire código primeiro, e o que sobrar vai num § e numa linha do grupo 28.
    - O `gate:licencas` continua com os mesmos pacotes do ponto de partida.

19. **Os anúncios, o layout e a acessibilidade.**
    - **Os anúncios:** as páginas novas entram nas listas do `ads.spec.ts` (com o `ON_SCREEN` das irmãs) e do `fo-ad-map.spec.ts` (o `AD_PAGES` muda, e a mudança vai no § dos testes antigos). No build de teste com IDs de anúncio, valem a distância de 150 px, nada acima da ferramenta no celular e a densidade de até 30 % a 360 × 740. No Organizar, com a vista aberta, nos dois modos, como o critério 4 da F14.
    - **O CLS** sem gesto continua 0: o `layout-shift.spec.ts` e o `tool-slot.spec.ts` com as páginas novas.
    - **O axe** nas páginas novas, nos dois temas e nos dois navegadores, com o estado de resultado e o de erro (a recusa). No Organizar, também com a barra de ações e a vista aberta.
    - **O Lighthouse:** o `lighthouserc.json` não muda (a parte dele já é a maior do CI). Meça as páginas novas com uma configuração temporária em `.cache/f18/`, sobre o mesmo `dist/`, no celular. Uma página abaixo de 90 em alguma categoria é achado a corrigir.

20. **Os testes.** Cada critério da ficha tem um teste ou uma medida com evidência. Cada teste que mede algo que já existia reprova no `dist-base`, e o controle negativo vai no relatório, com a mensagem de erro.
    - **As páginas existem:** no `dist-base`, o `serve-dist` devolve o 404 mais próximo a uma rota que falta. Exija o 200.
    - **As presets:** um teste por preset prova o teste 2 da regra no navegador:
      - a Extrair não tem o segmento dos modos e entrega um PDF só;
      - a PDF para PNG não tem a escolha de formato e entrega PNG;
      - a Espelhar não tem o giro e entrega o espelho.

      O `gate:conteudo` prova o teste 3.
    - **O Organizar:** a marcação, a barra, a ordem pelas setas e pelo teclado, o giro na folha, a página que sai, a vista com as duas ações e a contagem com uma fala só. Use os specs da grade da F14 (`island-pdf-*.spec.ts`) como molde.
    - **O registro:** um Vitest confere que o `next` e o `related` de toda página nova e das irmãs que mudaram só apontam para páginas que existem nos três idiomas.
    - **As contagens e as listas:** o `routes.test.ts` (a lista exata de ids e a busca), os testes dos hubs e dos ícones, o `conteudo.test.ts`, os `seo-*.test.ts`, o `open-with.test.ts`, o `consent.test.ts`, o `launch-kit.test.ts` e os que a exploração achar.
    - **Os specs novos,** ou os blocos novos de specs que já existem, têm nome e parte escolhidos pelos tempos de teste da execução completa mais nova e pelas partes do `.github/workflows/ci.yml` (`docs/claude/playwright.md` e `docs/claude/ci.md`), com o alvo de 700 s por parte. Projete o tempo de cada parte nos dois navegadores logo depois da fatia 1, com o `--list --shard`. Esta run pode somar até 15 páginas, mais que as 6 da F17.
    - **Os testes antigos que mudam** vão num § no formato da § 341: o que pedia, o que pede, por quê e o que continua protegido.

21. **O design system.**
    - O modo `'organize'` da grade e a barra de ações entram no README do componente que a F14 fez (`docs/design/components/PageView/` e o da grade, se houver; senão, um README novo em `docs/design/components/`), com um § e o contraste calculado de todo par de cor novo.
    - Nenhum token novo.
    - Os ícones, pela decisão 12.
    - Nenhuma regra do design system muda; se a barra de ações precisar de uma regra nova, ela vai num § e numa linha do grupo 28 para o Victor decidir, e a run segue com a forma que as regras de hoje aceitam.

22. **O `docs/claude/`.** Uma seção nova no fim de cada arquivo que esta run tocar:
    - no `pdf.md`, "F18: Organizar PDF e presets de PDF": o roteiro de uma preset de PDF, a operação `organize`, o modo `'organize'` e as pegadinhas;
    - no `imagem.md`, "F18: Espelhar imagem e Remover dados EXIF": a preset composta, a operação `strip`, a Orientation e o guia;
    - no `playwright.md`, só se houver pegadinha dele.

    As seções antigas não mudam.

23. **O `docs/PENDENCIAS.md`.**
    - Saem das tabelas abertas para "Já corrigidos", com a run e o § (no formato `| F3 c-04: … | F12, § 428: … |`), o F17 m-1 (decisão 16) e o F14 m-1 só no caso que a decisão 2 permite. Nenhum id some do arquivo (§ 341 e § 447).
    - Entra o grupo novo "## 28. O que a F18 deixou", no formato dos grupos 22 a 27 (seis colunas), com o que a run deixar:
      - o Organizar PDF, se a válvula o cortar ("Run F18b");
      - o F17 m-1, se a válvula o cortar;
      - o orçamento, se passar;
      - a regra do design system, se a decisão 21 pedir;
      - os baixos que a revisão deixar.
    - Uma candidata `fora` não vira pendência: o `keywords.csv` já a registra.
    - O Resumo e o Total acompanham.

24. **As imagens.** JPG de qualidade 80 em `docs/relatorios/fase-18/`, tiradas do `dist/` com o Chromium do Playwright, a 1x e com movimento reduzido, por um script em `.cache/f18/`. Uma por página nova que entrou, no estado que mostra o que ela faz:
    - `organizar-pdf-360-pt`: a grade com páginas marcadas, uma girada e uma saindo;
    - `organizar-pdf-vista-1280`: a vista com as duas ações;
    - `extrair-paginas-360-es`: a grade com páginas marcadas;
    - `pdf-para-png-360`: o resultado;
    - `espelhar-imagem-360-pt`: o resultado;
    - `remover-exif-360`: o resultado com a frase do card.

    Mais o hub de cada área que mudou, a 1280 px, em inglês (`hub-imagem-1280`, `hub-pdf-1280`).

25. **A PR e o CI.**
    - **A PR abre em rascunho** logo depois do primeiro push, e cada push roda o job leve.
    - **Uma conferência no Linux, no meio da run,** depois da junção das frentes (a fatia 3 de "Como trabalhar"). O WebKit de lá difere do Windows, e o F17 m-1 precisa do runner. Faça o push, espere a execução leve terminar e rode `gh pr edit <n> --add-label ci`:
      - se o rótulo existir, acompanhe a execução completa, leia os logs (as linhas `[webp 12 MP]` e `[avif 12 MP]`, a matriz e o tempo de cada parte), corrija o que só falhou lá e tire o rótulo (`gh pr edit <n> --remove-label ci`);
      - se não existir, pule a conferência e registre num §: a execução final faz esse papel. Nunca use como atalho o `gh pr ready` seguido do `--undo` com o `ci-ok` a caminho do verde.
    - **No fim,** com tudo commitado (o relatório, as matrizes, a revisão e as imagens), faça o push, espere a execução leve terminar verde e só então rode o `gh pr ready`. Acompanhe a execução completa até o fim. Se ela falhar: `gh pr ready --undo`, corrija, commite, faça o push, espere a leve e rode o `gh pr ready` de novo. A falha e a correção vão no relatório.
    - **As partes:** se a projeção (decisão 20) ou a execução completa mostrar uma parte acima de 700 s por causa dos testes desta run, faça como a F14 e a F17 (§ 648 e § 720): projete a divisão com os tempos dessa execução e abra a PR separada; o merge dela é do Victor.
      - Se a PR das partes da F17 ainda estiver aberta, não abra uma segunda que mexa no mesmo `ci.yml`. Registre num § a divisão que a F18 pediria por cima da de 15, para o Victor aplicar depois de mesclar a primeira, e uma linha no grupo 28.
    - **A descrição da PR,** mesmo depois do merge (`gh pr edit <n> --body-file <arquivo>`): o `pnpm ci:custo` da execução final, as linhas `[webp 12 MP]` e `[avif 12 MP]` do runner nos dois navegadores e o tempo da parte de cada spec que esta run tocou.

26. **A válvula de estouro.**
    - A primeira saída, para uma parte do CI acima de 700 s, é a PR separada das partes (decisão 25).
    - O Organizar PDF (custo G) pode ir inteiro para uma F18b se o limite semanal apertar ou se ele não fechar com as verificações verdes. Vão junto: as páginas, o registro, a operação e o grupo 28 com a linha "Run F18b". A linha dele no `keywords.csv` fica `entra`, e um § diz que ele ficou para a F18b.
    - O F17 m-1 também pode sair, e fica no grupo 27 com o § do porquê.
    - **Nunca se cortam:** as outras candidatas `entra`; as linhas do `keywords.csv` e a linha 15; as matrizes; a prova no Node do Remover dados EXIF; os testes dos critérios; a revisão adversarial final.

# Armadilhas conhecidas

- **O `build.format` do Astro** faz de toda página um `.../index.astro`, e o `exactOptionalPropertyTypes` pega campo opcional pela metade (o `parent?` do `PdfPageDef` é um deles): rode o `pnpm tipos` cedo (ele confere também os specs).
- **Página de ferramenta carrega exatamente os arquivos JS das irmãs.** Um import de `src/engine/` na ilha cria um arquivo a mais: a ilha de imagem fala com o motor só pelo `engine-client.ts`, e a de PDF só pelo `client.ts`. As presets de PDF entram na ilha e na entrada que existem; nada de entrada nova.
- **O `serve-dist` devolve o 404 mais próximo** para rota que falta: teste de página exige o status 200, senão passa sem a página existir.
- **"Sem metadados" é sem Exif, XMP, IPTC e GPS** (`metadataReport`), não "sem APPn": o canvas do Chromium põe um perfil ICC sRGB no JPG e no PNG, e o `strip.ts` guarda o ICC de propósito. O `metadataReport` marca `exif: true` até para o bloco só com a Orientation; a regra dele é o `orientationOnly` (decisão 10).
- **O `createImageBitmap` com `imageOrientation: 'none'` ainda aplica a Orientation** nos dois navegadores: a referência em pé sai de `withOrientation(bytes, 1)` (`tests/e2e/lib/jpeg.ts`). Para o espelho, a referência é a foto em pé espelhada, nunca a Orientation lida de novo.
- **O WebKit 27.2 do Windows não abre AVIF e não tem `OffscreenCanvas` no worker:** o desenho das páginas de PDF vai para a página (a porta do `pdfjs-core.ts`), e o worker do PDF.js é terminado no `close()` (§ 630). Teste os dois caminhos.
- **O `removePage` com `addPage` do pdf-lib estraga a árvore de páginas:** documento novo copia páginas pelo `assemble.ts` (§ 145), nunca pelo `copyPages` direto.
- **O Preact 11 desmonta os filhos velhos antes de montar os novos** (§ 624): quem quer um recurso que o componente velho segura pede antes, no gesto. A vista do Organizar segue o `held` da F14.
- **O `selected` da grade vem do `setOf(state.picked)`** (§ 622 e § 628): um `new Set(...)` a cada render apaga a âncora do Shift.
- **A classe `.fo-view` já existe;** a vista da página é `.fo-pview*`, e o título dela é um `h2` (§ 639).
- **As células têm a altura das páginas:** traga a grade para a tela antes de esperar todas as figuras (o `rootMargin` do `IntersectionObserver`, § 152).
- **A lupa não começa por "Page" em inglês:** os testes acham o botão da página por `^Page N of M` (§ 621). Um nome novo de botão na célula segue a mesma regra.
- **As opções em segmento escondem o rádio:** no teste, clique no rótulo `.fo-seg__opt`.
- **A lista de linhas mostra 6** e esconde o resto atrás de "Show N more" (`.fo-queue__more`).
- **O `warm()` liga o worker** quando o ponteiro para sobre o painel: teste que segura o motor segura antes do `goto`.
- **Cada teste da matriz tem 60 s** (§ 88). Divida o lote antes de afrouxar qualquer tempo, e nunca afrouxe.
- **O `hub-icons.test.ts` lê o desenho no `dist/`,** não o nome (§ 491).
- **O `fo-ad-map.spec.ts` conta as páginas** (190 desde a F17).
- **O `pnpm guias:medir` e o `pnpm lancamento:imagens`** ficam fora do `verificar` e leem o `dist/`: rode o `pnpm build` antes.
- **Arquivo de ícone novo** tem só LF: no Windows, o Python troca LF por CRLF. Grave com a ferramenta de escrita.
- **O `keywords.csv` se edita como texto.** O Excel em português troca o ponto por vírgula e o separador.
- **Dois Playwright no mesmo checkout** convivem com `--output=<pasta própria>` no segundo, e cada worktree usa o próprio `FO_PORT` (`docs/claude/playwright.md`).
- **O Playwright do Windows pode não sair depois do último teste** (`docs/claude/playwright.md`): veja o que fazer lá.
- **Frentes que acrescentam blocos no fim do mesmo spec** dão conflito na junção (`docs/claude/windows-git-bash.md`, F15). A guarda da worktree isolada recusa heredoc com `node` ou `git` no mesmo `&&`: grave o arquivo com a ferramenta de escrita e rode cada comando sozinho.
- **O `net::ERR_NO_BUFFER_SPACE`** no meio do `verificar --partes` é dos soquetes do Windows (`docs/claude/playwright.md`): rode de novo.
- **A máquina não mostra o tempo do CI:** use os tempos de teste da execução completa para pôr um spec numa parte. Os specs pesados vêm juntos na ordem dos nomes.
- **O "antes":** monte o `dist/` da `origin/main` numa worktree à parte (`dist-base`), nunca trocando a branch do clone principal.

# Critérios de aceitação (cada um com evidência no relatório)

1. A tabela e a regra: as cinco decisões no plano, num § e no `keywords.csv`, com os números da tabela.
2. Os critérios da ficha da F18, um por um, com a saída real do teste ou da medida, e nenhum afrouxado:
   - cada preset nova passa nos quatro testes da página programática, e cada ferramenta nova no `gate:conteudo`;
   - a matriz cobre cada fixture que cada página nova aceita, nos dois navegadores;
   - o Remover dados EXIF prova no Node, sobre as fixtures com GPS, a saída sem GPS, XMP nem Exif além da Orientation, e os mesmos pixels (decisão 10);
   - o `gate:seo`, o `gate:links`, o `gate:conteudo` e o `launch-kit.test.ts` verdes;
   - o orçamento como o das irmãs;
   - a densidade de anúncio em até 30 %;
   - o `pnpm verificar` verde.
3. O "Dentro" da ficha feito para cada candidata `entra`: a linha 15 e o § dela; o Organizar com a operação testada no Node antes da ilha; a peça das presets de PDF, se entrou alguma. O que a válvula cortou tem o § e a linha "Run F18b".
4. Nenhum item do "Fora" da ficha ou deste prompt foi tocado.
5. Nada sai do aparelho, e nenhum evento, parâmetro ou chave nova aparece: o `image-privacy.spec.ts`, o `pdf-privacy.spec.ts`, o `launch-claims.spec.ts` e o `events.spec.ts` passam com as páginas novas no caminho.
6. O `lint:texto` dá 0 erro; o `english-leak.test.ts`, o `glossary.test.ts`, o `claude-md.test.ts` e o `pendencias.test.ts` passam.
7. O Lighthouse das páginas novas ≥ 90 nas quatro categorias, o axe sem violação e o CLS sem gesto 0 (decisão 19).
8. Os documentos das decisões 3, 17, 21, 22 e 23 estão em dia.
9. Os testes antigos que mudaram estão num §, um por um; nenhum teste foi pulado, desligado ou afrouxado.
10. O `pnpm verificar --partes` passou na máquina, com a saída real no relatório, e o CI completo está verde (ou a PR separada da decisão 25 está aberta, ou o § dela explica por que não).
11. A revisão adversarial está em `docs/relatorios/REVISAO-F18.md`, sem achado alto ou médio aberto.

# Verificação: rode de verdade

- **A linha de base, antes de mudar código.** No `dist-base`:
  - `pnpm install --frozen-lockfile` e `pnpm build`;
  - o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, com a saída em `.cache/f18/antes/`;
  - o número de testes do Vitest, o `pnpm exec playwright test --list` de cada navegador e a lista dos JS de `dist/_astro/`, com o tamanho com gzip do grupo `island` e da entrada da ilha de PDF;
  - as contagens do site no `dist/` (o H1 da home, os hubs, o rodapé, o menu, o cartão da Sobre) nos três idiomas e a busca pelos sinônimos da decisão 4;
  - os controles negativos: as páginas novas dão 404, e o guia de localização embute o Redimensionar;
  - as imagens do "antes" que o relatório comparar.
- **Em cada fatia:** `pnpm tipos`, `pnpm lint`, `pnpm build`, o Vitest dos arquivos tocados e os specs que a fatia toca, nos dois projetos (`--project=chromium` e `--project=webkit`):
  - as matrizes (`image-matrix.spec.ts`, `image-presets.spec.ts` e `pdf-matrix.spec.ts`), o `image-smoke.spec.ts`, o `pdf-tool.spec.ts`, os `island-pdf-*.spec.ts`, o `image-privacy.spec.ts`, o `pdf-privacy.spec.ts`, o `launch-claims.spec.ts`, o `a11y.spec.ts`, o `layout-shift.spec.ts`, o `tool-slot.spec.ts`, o `budgets.spec.ts`, o `i18n-budgets.spec.ts`, o `events.spec.ts`, os dos guias (`guide-page.spec.ts` e `tool-guides.spec.ts`) e os specs novos;
  - os specs dos chips que levam (`handoff*.spec.ts`), da busca e da navegação, e os da "Abrir com" e do compartilhar;
  - o `ads.spec.ts`, o `fo-ad-map.spec.ts` e o `ads-coffee.spec.ts` no build de teste com IDs de anúncio.

  Leia a falha, corrija a causa e repita até passar.
- **Nunca afrouxe um limite** para um teste passar: o limite é o da ficha, o deste prompt e o do projeto.
- **O Vitest das duas operações novas roda antes das ilhas** (decisões 6 e 10), e reprova com o motor do ponto de partida.
- **O Lighthouse das páginas novas** com a configuração temporária da decisão 19.
- **O F17 m-1:** no fim, três rodadas do teste da decisão 16 nos dois navegadores, com a máquina livre.
- **O `pnpm verificar --partes` roda uma vez,** no último commit de código, com a máquina livre. Se uma parte falhar, rode a mesma parte no ponto de partida, numa worktree. Se ela falhar igual, a falha não é desta run: registre num § e no relatório, e siga. Se não, ache o que esta run mudou e corrija.
- **No CI:** acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log`. O `pnpm ci:custo <id>` da última execução vai no relatório (regra 5).

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma. A única parada prevista é a da decisão 0, quando a tabela do topo não está preenchida, e ela acontece antes de qualquer mudança.

Régua de decisão:

1. A ficha da F18 e este prompt.
2. A seção E, a "Mudança no contrato" e as regras de todas as runs do `PLANO-UX-QV.md`.
3. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md`, o `CLAUDE.md`, o `docs/claude/` e o `docs/design/`.
4. O `DECISOES.md`, o `data/README.md` e o código: as presets de imagem, a grade da F14 e as irmãs de cada página nova.
5. Na dúvida, a opção mais simples e mais reversível que não piore o orçamento, a acessibilidade, o anúncio nem o tempo do CI.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos:

- os ícones;
- o `outcome` do `strip` e a frase do card;
- o WebP animado no `strip`;
- a célula do Organizar em Pequenas;
- o rótulo da ação do Organizar;
- os sinônimos da busca;
- o `next` e o `related` de cada página;
- os lugares onde as presets de PDF aparecem;
- o caminho de saída da tabela da matriz de PDF;
- a divisão dos lotes;
- cada teste antigo que mudou.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- o rótulo `ci` não existe (decisão 25);
- a PR das partes da F17 não está na main (decisões 2 e 25);
- a página pública da decisão 13 não abre: escreva a frase sem a citar e registre a pendência no grupo 28;
- a main muda no meio da run: `git fetch` e `git merge origin/main` na branch, nunca rebase, renumerando os § se colidirem;
- o Lighthouse oscila numa URL: rode de novo uma vez e, se cair de novo, ache a causa.

Válvula de estouro: a decisão 26.

# Git e segurança

- **Começo:**
  - `git switch main` e `git pull --ff-only`;
  - o `git status` pode mostrar, sem rastreio, os dois arquivos do prompt e a pasta `Claude outputs/`, e, modificado, o `PLANO-FILEORCA.md` (decisão 2). Qualquer outra coisa: não mexa, não commite e registre;
  - a decisão 0, antes de qualquer branch;
  - `git switch -c fase-18` (ou `ajuste-keywords-f18`, no caminho curto). O primeiro commit leva os dois arquivos do prompt, e o `PLANO-FILEORCA.md` só no caso que a decisão 2 permite;
  - se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como o recebeu, em `docs/prompts/prompt-fase-18.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main. Adicione por caminho, nunca `git add -A`.
- **A PR em rascunho** abre logo depois do primeiro push, num comando separado do push: `gh pr create --draft --base main --head fase-18`, com o título "F18: ferramentas novas que passaram na regra" (no caminho curto, "Ajuste: keywords da F18"). O título e a descrição vão em português; a descrição traz a tabela, as decisões, e diz que o merge é do CI.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push (`https://fase-18-fileorca.vmatusita.workers.dev/`), que é o build padrão: mostra as páginas novas, nunca anúncio.
- **Agentes em worktree** (regra 6 do `CLAUDE.md`): o primeiro passo de cada um é `git merge --ff-only fase-18`, e todo merge de volta leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`). As worktrees são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:**
  - o push da branch;
  - na PR dela, `gh pr create`, `gh pr ready`, `gh pr edit` (só a descrição e o rótulo `ci`) e o `gh pr ready --undo`, só depois de uma execução final vermelha;
  - leitura (`git fetch`, `gh run`, `gh pr checks`, `gh pr view`, `gh label list` e `gh api` sem método);
  - um `gh run rerun` por falha que pareça instável, registrado;
  - e, só se a decisão 25 pedir, a PR separada das partes do CI.
- **Na web, só leitura:** as páginas públicas da decisão 13. Nada de postar, criar conta, enviar formulário nem abrir o Keyword Planner ou o Google Trends.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`; mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh label` (além do `list`), `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`;
  - editar o `PLANO-FILEORCA.md` por qualquer caminho;
  - mudar um número da tabela do topo;
  - postar, criar conta ou subir arquivo para qualquer serviço (o Search Console é do Victor);
  - `wrangler deploy` em qualquer forma.

  O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

0. **A decisão 0,** sozinho, antes de tudo.
1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo. Só as frentes das candidatas `entra`:
   - (a) a ficha, a seção E e este prompt num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) as presets de imagem de ponta a ponta (registro, rotas, pastas, ilha, trilha, hub, busca, `gate:conteudo`, eventos) e o que falta no lado do PDF para uma preset;
   - (c) a grade da F14 (os três modos, a `PageCell`, a vista, o `grid-math.ts`, a marcação e as falas), o Excluir, o Reorganizar e o Girar, e o `structural` e o `inPlace` do motor de PDF;
   - (d) o `strip.ts`, o `originalStripped`, o `metadataReport`, o `orientationOnly`, o guia de localização e o `guias:medir`;
   - (e) o Girar imagem, o `spinOf` e os casos de orientação da matriz;
   - (f) quem lê os registros (hubs, home, rodapé, menu, busca, 404, OG, "Abrir com", manifest) e os testes que fixam contagens e listas;
   - (g) o orçamento, os anúncios e as partes do CI: os specs de orçamento e de anúncio, o `.github/workflows/ci.yml`, o `--list` e os tempos da execução completa mais nova;
   - (h) o `keywords.csv`, o `data/README.md`, o kit de lançamento e os testes que leem os dois.
2. **A linha de base** (seção "Verificação").
3. **Planejar.** Escreva `docs/relatorios/fase-18-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz:
   - a tabela, a regra e a decisão de cada candidata;
   - o ponto de partida e a linha de base;
   - os § reservados;
   - a interface que as frentes dividem: os ids, as rotas, as chaves dos textos novos, as operações novas do motor e o dono de cada arquivo que mais de uma frente toca (os textos das ilhas, os `common.ts`, o `routes.ts`, os registros, o `matrix.ts`, a `PageGrid`);
   - quem faz o quê, a ordem das fatias e os arquivos de cada frente;
   - a projeção do tempo das partes com os testes novos;
   - cada critério ligado a um teste ou comando.
4. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. **O agente principal:**
      - o primeiro commit, o push e a PR em rascunho;
      - o `keywords.csv`, o `data/README.md` e a linha 15;
      - a base em inglês: os ids nos registros, as rotas dos três idiomas (com o `TRANSLATED_PATHS`), os tipos, as listas do GA4, a peça das presets de PDF (decisão 5), as pastas e as páginas em inglês com os textos de en, os cartões de `src/i18n/en/common.ts` e os § reservados.

      Nas ferramentas com operação nova, a página em inglês nasce com o painel e a operação em placeholder que a frente troca. Com o `pnpm tipos` e o `pnpm build` verdes, commit e push.
   2. **As frentes ao mesmo tempo,** cada uma num agente `opus` na sua worktree, a partir desse commit, só com o que entrou. Com uma ou duas candidatas pequenas, junte as frentes em menos:
      - **P (as presets de PDF):** a Extrair e a PDF para PNG de ponta a ponta, os casos delas na matriz de PDF e os testes de preset;
      - **O (o Organizar PDF):** a operação `organize` com o Vitest no Node primeiro, o modo `'organize'` da grade, a barra, a vista, os casos na matriz de PDF, os testes da grade e o README do design system;
      - **I (a imagem):** a Espelhar e o Remover dados EXIF, a operação `strip` com o Vitest no Node primeiro, o guia de localização, o `guias:medir`, os casos da matriz de imagem e o F17 m-1;
      - **T (os textos e os idiomas):** as páginas, os textos e os cartões de pt e es de tudo o que entrou, o glossário, as contagens, as frases desmentidas, as páginas de pt e es no `i18n-budgets.spec.ts` e o `lint:texto`;
      - **S (o site):** os ícones, o `next`, o `related` e o chip que leva, o que lê os registros, o Vitest dos registros e os testes de contagens e listas.

      Ao mesmo tempo, o agente principal faz o que não colide com elas: o kit de lançamento, o `docs/claude/`, o `PENDENCIAS.md` e os §.
   3. **O agente principal junta as frentes,** com a O por último (a válvula da decisão 26 pode deixá-la de fora sem desfazer as outras):
      - resolve os conflitos e deixa o `pnpm tipos` verde;
      - roda os specs das frentes nos dois navegadores e os de anúncio no build de teste;
      - faz a conferência no Linux (decisão 25).
   4. **O agente principal fecha:**
      - o orçamento contra o `dist-base`;
      - o Lighthouse das páginas novas;
      - as três rodadas do F17 m-1;
      - as tabelas das matrizes;
      - a projeção das partes;
      - as imagens e as tabelas do relatório.
5. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`):
   - sobre um commit fixo e registrado da branch, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` e o próprio build de teste;
   - contra a ficha, este prompt e o plano;
   - cada lente com o próprio `FO_PORT`, escrevendo só no `.cache/lente-<x>/` da worktree.

   Se entraram só presets, são três lentes Sonnet em contexto limpo (regra 3), apontando só lacunas de correção ou de requisito, nunca preferência de estilo:
   - (a) **as ferramentas e a privacidade:** as matrizes contra a decisão 15; as saídas e os metadados; os testes 2 das presets; os chips que levam; nada sai do aparelho;
   - (b) **o site, o SEO e os idiomas:** as rotas, os caminhos, o hreflang, o sitemap, o OG, o schema, a busca, os hubs, a home, o menu, o rodapé, a "Abrir com", as contagens, os textos contra o glossário, as frases desmentidas, o `keywords.csv`, a linha 15, o kit e os documentos;
   - (c) **o orçamento, os anúncios, a acessibilidade e o CI:** os JS e as requisições, o grupo `island` e a ilha de PDF, a distância, a densidade e o CLS, o axe e o Lighthouse, os ícones únicos e as partes.

   Se entrou o Organizar PDF ou o Remover dados EXIF, ou se o motor mudou em outro ponto, a regra 3 e a ficha pedem cinco lentes: some (d) **o motor**, contra os Vitest das operações novas, as fixtures e o `expected.json`; e (e) **a privacidade**, separada da (a): o `strip` e a Orientation, a prova dos bytes, o guia, nada fora do aparelho, nada na URL, no `dataLayer` nem no armazenamento.

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo, com a regra "na dúvida, refutado"; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada das lentes dos achados corrigidos revisa o diff delas. Os baixos que sobrarem vão para o grupo 28 do `docs/PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F18.md`.
6. **Fechar:** o `pnpm verificar --partes`, o relatório e a sequência de fim da decisão 25.

# Relatório final

Escreva `docs/relatorios/fase-18.md` em português, no formato do `fase-17.md`, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo: o que muda para a pessoa (cada página nova e o que ela faz), em até cinco linhas;
- a tabela do topo, a regra e a decisão de cada candidata;
- o que entrou, por item da ficha, com os arquivos e os §;
- a evidência de cada critério da ficha, com a saída real dos comandos e dos specs, e os controles negativos com a mensagem de erro;
- as tabelas:
  - as matrizes: o resumo por página e navegador, apontando para o `fase-18-matriz.md` e o `fase-18-matriz-pdf.md`;
  - a prova do Remover dados EXIF: por fixture, os metadados antes e depois (só o tipo e a contagem, nunca o valor: o repositório é público) e os bytes da imagem iguais;
  - as contagens: cada lugar do site e do kit que conta ferramentas, antes e depois, nos três idiomas;
  - o orçamento: os JS e as requisições de cada página nova e da irmã, os arquivos novos de `dist/_astro/`, e o grupo `island` e a ilha de PDF com gzip, antes e depois;
  - os anúncios: a distância e a densidade das páginas novas;
  - o Lighthouse das páginas novas;
  - o F17 m-1: os segundos do WebP e do AVIF por navegador, na máquina e no runner;
  - os ícones: o nome e o desenho escolhidos, e onde cada um aparece;
- o número de testes do Vitest e do `--list` de cada navegador, antes e depois, e os testes antigos que mudaram, com o § de cada um;
- a saída real do `pnpm verificar --partes`, com o tempo de cada parte e a soma;
- a projeção das partes do CI com os testes novos;
- o custo (regra 5): o `pnpm ci:custo` da última execução antes do relatório; o da execução final vai na descrição da PR;
- o que a conferência no Linux achou, ou o § que diz por que ela não houve;
- o resumo da revisão, apontando para o `REVISAO-F18.md`;
- as imagens de `docs/relatorios/fase-18/`;
- o link da prévia (`https://fase-18-fileorca.vmatusita.workers.dev/`);
- as decisões novas, apontando os §, e o que a válvula cortou, se cortou;
- as ideias que ficaram fora de propósito (o leitor de metadados da decisão 10, se você o achar útil), em uma linha cada, sem virar pendência;
- **a lista do que é do Victor, em passos:**
  1. `git pull` e, na prévia ou no fileorca.com depois do deploy, usar cada página nova no celular e no computador. No Organizar: marcar, girar, tirar, mover e abrir a vista. No Remover dados EXIF: uma foto do celular com localização, conferindo depois, no próprio celular ou no computador, que a localização sumiu e a foto continua igual.
  2. No Search Console, pedir a indexação de cada página nova (a lista vai aqui, com os caminhos).
  3. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
  4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
  5. Mesclar a PR das partes do CI da F17, se ainda não mesclou, e a desta run, se a decisão 25 abriu uma.
  6. Se o Organizar foi para a F18b, gerar o prompt dela com a skill, com o grupo 28.
  7. Por 2 semanas, acompanhar no GA4 o `tool_start` e o `tool_complete` das páginas novas.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR, o estado do CI (mesclada ou esperando, e por quê) e os passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `docs/PENDENCIAS.md`, o `docs/claude/`, o `docs/design/`, o `data/README.md` e a descrição da PR. O site fala inglês, português e espanhol, nos arquivos de tradução de cada idioma; o kit de lançamento, na língua de cada texto pronto.

Em inglês: o código, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

São cinco etapas: os números, o pré-voo, a run, o acompanhamento e a volta.

### 1. Os números (uns 30 min)

O prompt só roda com a tabela do topo preenchida. Sem ela, a run para no primeiro passo, sem mudar nada.

1. **Keyword Planner.** No Google Ads, abra Ferramentas → Planejador de palavras-chave → "Ver volume de pesquisa e previsões". Cole os cinco termos, um por linha:

   ```text
   organize pdf
   extract pages from pdf
   pdf to png
   flip image
   remove exif data
   ```

   Ponha Local: Estados Unidos e Idioma: Inglês. Na aba "Métricas históricas", anote de cada termo:
   - a **Média de pesquisas mensais**: "100 – 1 mil" vira `100-1K`, "1 mil – 10 mil" vira `1K-10K`, "10 mil – 100 mil" vira `10K-100K`, e "100 mil – 1 mi" vira `100K-1M`;
   - o **Lance da parte superior da página**, o intervalo baixo e o alto, em dólar e com ponto decimal (`2.35`). Se a conta não mostrar, deixe vazio.
2. **Google Trends.** Em trends.google.com, ponha País: Estados Unidos e Período: últimos 12 meses, um termo de cada vez. O valor é `caindo` só se a curva cai sem parar nos 12 meses. Se ela sobe com clareza, é `subindo`; o resto é `estavel` (sem acento).
3. **Preencha a tabela** no arquivo `docs\prompts\prompt-fase-18.txt` do seu clone, que é o que você cola. Edite no VS Code, não no Excel. Troque cada `<PREENCHER>`; nas colunas de lance, troque `<PREENCHER ou vazio>` pelo número ou apague, deixando a célula vazia. O `.md` pode ficar com a tabela em branco: a run grava os números no `data\keywords.csv`, que é a fonte de verdade.

Não precisa decidir nada: a run aplica a regra. Se nenhuma candidata passar, rode o prompt do mesmo jeito: ele faz só o registro curto (as cinco linhas `fora` no CSV) numa branch `ajuste-keywords-f18`, sem página nova.

### 2. Pré-voo (uns 10 min)

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 39d1341 (a F17) ou mais novo
git status                  # sem rastreio: os dois arquivos do prompt e "Claude outputs\"
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado
claude --version            # o modo auto pede 2.1.83 ou mais
```

O clone estava na branch `ajuste-ci-partes-f17` quando eu olhei; o `git switch main` resolve isso, e os dois arquivos do prompt vão junto (são arquivos sem rastreio).

Depois:

1. **Mescle a PR das partes do CI da F17 antes (recomendado).** É a PR da branch `ajuste-ci-partes-f17`, que passa o WebKit para 15 partes (§ 720). A F18 pode somar até 15 páginas, e sem essa divisão as partes do WebKit já estão acima de 700 s. Confira que a execução completa dela está verde e mescle. Depois faça o `git pull --ff-only` de novo. Se você não mesclar, a run segue, mas não abre uma segunda PR de CI por cima dessa: ela deixa a divisão anotada para você.
2. **Crie o rótulo `ci`, se ainda não criou (30 s).** No GitHub: Issues → Labels → New label, com o nome `ci`. Com ele, a run confere tudo no Linux no meio do caminho e grava o tempo do WebP no runner (o F17 m-1). Sem ele, isso só sai na execução final. Na F14, na F15 e na F17, a falta do rótulo custou uma volta a mais no fim.
3. **Ponha a linha do `PLANO-FILEORCA.md` (1 min, opcional).** Ela ainda falta. É o F14 m-1, que só você pode fazer, porque o `.claude/settings.json` proíbe as runs de editar esse arquivo. Abra o `PLANO-FILEORCA.md` no editor. Depois da linha 3 (a que começa com "29/out/2026") e da linha em branco que vem depois dela, cole esta linha e mais uma linha em branco:

   ```text
   **Plano de UX e qualidade de vida (9/nov/2026):** as fichas da F14 à F18 estão no PLANO-UX-QV.md. Até a F17 ele não muda nada deste plano; a única mudança no contrato (a linha 15, o catálogo) entra na F18, pela tabela "Mudanças no contrato" do PLANO-MELHORIAS.md.
   ```

   Salve em UTF-8 e confira com `git diff --stat`: tem que dar `PLANO-FILEORCA.md | 2 ++`. A run commita a linha junto com o prompt.
4. **A energia:** `powercfg /change standby-timeout-ac 0`. Volte ao normal depois da run.
5. **O disco:** a run faz o build do site e o build de teste várias vezes, em até sete worktrees (a base, até cinco frentes e a revisão). Deixe uns 25 GB livres.

### 3. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-18
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-18.txt`, já com a tabela preenchida, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal as cinco linhas da F18 no data/keywords.csv, as páginas das candidatas que deram entra no ar no build, os critérios da ficha com evidência no relatório, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F18.md sem achado alto ou médio aberto e a PR da fase-18 pronta, com o ci-ok verde
```

Um avaliador separado confere essa condição a cada turno. No caminho curto (nenhuma `entra`), ele não serve: pule.

Se cair ou o limite acabar, retome com `claude --resume fase-18` e mande: "continue de onde parou: leia docs/relatorios/fase-18-plano.md, o git log da branch fase-18 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-18.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-18.json
(Get-Content $HOME\run-fase-18.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`.** A run faz muita coisa sem perguntar:

- builda o site e o build de teste e roda o Playwright em várias portas, também em worktrees;
- cria e remove as worktrees das frentes e da revisão;
- roda o LanguageTool local, o Lighthouse, o `pnpm guias:medir` e, se as imagens da galeria pedirem, o `pnpm lancamento:imagens`;
- lê páginas públicas na web para os textos (só leitura);
- faz push da branch, abre a PR em rascunho, põe e tira o rótulo `ci` (se existir) e marca a PR como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo (push na main, `gh pr merge`, `gh api` com método, `wrangler deploy`, reset, amend e a edição do `PLANO-FILEORCA.md`), e o prompt não pede nada disso.

**O tamanho da run** depende do que passar:

- **Só presets** (Extrair, PDF para PNG, Espelhar): parecida com a F17, umas 3 a 9 páginas, com três lentes na revisão.
- **Com o Remover dados EXIF:** soma uma operação nova no motor de imagem e o guia de localização, e a revisão sobe para cinco lentes.
- **Com o Organizar PDF:** é a maior run do plano. Ele traz uma operação nova no motor de PDF e um modo novo da grade, com barra de ações e vista, e a revisão vai a cinco lentes. A válvula pode mandá-lo inteiro para uma F18b.
- O `pnpm verificar --partes` local leva uns 55 min, e um pouco mais com páginas novas.

Comece com folga no limite semanal do Claude Code. Se o Organizar entrar e o limite apertar, a run o separa sozinha; as outras candidatas nunca saem.

### 4. Acompanhar

- **Não mexa no clone durante a run.** Ela está na branch `fase-18` dessa pasta (ou `ajuste-keywords-f18`).
- **A primeira coisa que ela faz é ler a tabela.** Se você esqueceu uma célula, ela para em segundos e diz qual. Preencha e cole de novo.
- **A PR aparece cedo, em rascunho,** com a tabela e as decisões na descrição. Cada push roda só o job leve (uns 4 min).
- **A prévia** (`https://fase-18-fileorca.vmatusita.workers.dev/`) é o build padrão: dá para usar as páginas novas de verdade nela, mas ela nunca mostra anúncio.
- **Não marque a PR como pronta.** O `gh pr ready` é o último passo da run. Depois dele, o CI roda tudo e mescla sozinho.

### 5. Ao voltar

1. **Atualize a main:** `git switch main` e `git pull --ff-only`. Se a PR não foi mesclada, o relatório e a resposta final dizem por quê.
2. **Confira no navegador,** na prévia ou no fileorca.com depois do deploy, cada página que entrou:
   - **Organizar PDF:** com um PDF de verdade no celular, marque páginas, gire, tire, mova, abra a lupa e use as duas ações da vista; confira o PDF novo antes de baixar;
   - **Extrair páginas:** marque três páginas e confira que sai um PDF só;
   - **PDF para PNG:** converta um PDF e abra os PNG;
   - **Espelhar imagem:** espelhe uma foto do celular nas duas direções;
   - **Remover dados EXIF:** passe uma foto do celular com localização e confira, nas propriedades do arquivo (no computador) ou na galeria (no celular), que a localização sumiu e a foto continua em pé e igual.
3. **Leia `docs\relatorios\fase-18.md`** e confira as evidências:
   - a tabela e a decisão de cada candidata, e as cinco linhas no `data\keywords.csv`;
   - a linha 15 no `PLANO-MELHORIAS.md`;
   - as matrizes: nenhuma fixture aceita de fora, nos dois navegadores;
   - a prova do Remover dados EXIF: nenhum GPS, e os bytes da imagem iguais;
   - o orçamento: as páginas novas com os mesmos JS das irmãs, e as outras iguais ao ponto de partida;
   - o `pnpm verificar --partes` verde e o veredito do `REVISAO-F18.md`.
4. **Olhe as imagens** de `docs\relatorios\fase-18\`.
5. **No Search Console,** peça a indexação das páginas novas (a lista está no relatório).
6. **Se o Organizar foi para a F18b,** gere o prompt dela com a skill, colando o grupo 28 do `docs\PENDENCIAS.md`.

Com isso, o `PLANO-UX-QV.md` termina. O que segue aberto está no `docs\PENDENCIAS.md`, para as runs de ajuste, e o D16 (a busca por cima da âncora) continua sendo decisão sua.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `39d1341`,** com a F17 mesclada (PR 33). O próximo § livre é o **721**, porque o 720 é da PR das partes (`ajuste-ci-partes-f17`), mesclada ou não. O grupo novo do PENDENCIAS é o 28.
- **A PR das partes da F17 ainda não estava mesclada,** pelo seu clone (o último fetch foi em 10/nov, às 18:37, e o clone estava na branch dela). O guia pede para mesclar antes. Se você não mesclar, a run segue sem abrir uma segunda PR de CI por cima.
- **Os nomes e os caminhos** fui eu que fixei. O principal: em pt, o Organizar PDF vira **"Gerenciar páginas do PDF"**, porque o Reorganizar já se chama "Organizar páginas do PDF" em pt, e duas páginas com "Organizar" no hub confundem e brigam pela mesma busca. Em es, ele fica "Organizar PDF", já que lá o Reorganizar é "Ordenar páginas de PDF". As presets seguem o padrão das de imagem (`/split-pdf/extract-pages/`, `/pdf-to-jpg/to-png/`, `/rotate-image/flip/`). Em en, a ferramenta de metadados é **"Remove EXIF data"**, o termo que você vai medir.
- **O Espelhar imagem não mexe no motor.** O motor não tem "sem giro", mas meia volta com um espelho dá o outro espelho, e a matriz prova os pixels. Se a prova falhar, a run põe "sem giro" no motor e sobe a revisão para cinco lentes.
- **No Remover dados EXIF, uma foto girada guarda o bloco Exif mínimo com a Orientation.** Sem ele, a foto apareceria deitada, e aplicar o giro exigiria recodificar, o que quebraria "os mesmos pixels" da ficha. É o que o site faz desde a § 33. Nenhum GPS, data, aparelho ou miniatura fica. Li "sem Exif" da ficha assim, e a run registra num §.
- **O Remover dados EXIF aceita JPG, PNG e WebP,** os formatos que o motor limpa sem recodificar. HEIC e AVIF vão para os conversores, que também tiram os metadados.
- **No Organizar PDF, a página tirada fica na grade, apagada,** até você a devolver, como no Excluir da F14. Assim não precisa de Desfazer. O giro e a saída valem para as páginas marcadas, por uma barra acima da grade, e a vista ganha "Girar 90°" e "Tirar esta página".
- **O F17 m-1** (medir o WebP de 12 MP no runner) entra nesta run, porque o grupo 27 o manda para a F18. A válvula pode cortá-lo.
- **A revisão tem três lentes se entrarem só presets,** e cinco se entrar o Organizar ou o Remover dados EXIF, como diz a ficha.
- **O merge é automático:** a PR não mexe em `.github/`. Se as partes do CI precisarem de nova divisão, isso vai numa PR separada, com merge seu.
