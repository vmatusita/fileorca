# Ferramentas de PDF

O que as runs aprenderam sobre o motor e as ferramentas de PDF (PDF.js, qpdf e pdf-lib), com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F5a: ferramentas de PDF

Como acrescentar uma ferramenta de PDF:

1. O id em `PDF_TOOL_IDS` e a entrada em `PDF_PAGES` (`src/tools/pdf/registry.ts`): ícone, `files` (`batch`, `merge` ou `single`), `run` (`auto` ou `action`), sufixo do nome, chips (`next`) e até 6 relacionadas. A rota sai de `pdfRoutes()` (`src/i18n/routes.ts`), só em inglês; o id entra em `RouteId` e em `PDF_EVENT_TOOLS` (`src/analytics/tool-ids.ts`).
2. A operação no motor: o tipo em `PdfOperation` (`src/engine/pdf/types.ts`) e o caso em `processPdf` (`src/engine/pdf/process.ts`), com o Vitest no Node sobre as fixtures antes da ilha. Falha volta como `{ ok: false, reason }` da lista fechada `PDF_REASONS`; razão nova entra também em `ERROR_REASONS` (`src/analytics/events.ts`).
3. A definição na ilha: uma entrada em `PDF_TOOLS` (`src/tools/pdf/tools.tsx`), com `operation`, `success`, `warm` e, se houver, `Options`, `grid` e `actionLabel`. Nada de entrada nova: as 12 cabem no `PdfIsland.astro`, e a página carrega 2 arquivos JS.
4. Os textos em `src/tools/<slug>/i18n/en.ts` (`PdfToolTexts`, com os blocos do `gate:conteudo`), a entrada em `PDF_TOOL_TEXTS` (`src/tools/pdf/texts.ts`) e o cartão em `src/i18n/en/common.ts` (`pdf`). A página é `src/pages/<slug>/index.astro` com `<PdfToolPage id="<slug>" />`.
5. Testes: a ferramenta na matriz (`tests/e2e/pdf-matrix.spec.ts`), com cada fixture que ela aceita, as recusas no meio do lote e a conta conferida no Node contra o `expected.json`. O `budgets`, o `ads`, o `a11y`, o `pdf-privacy`, o `gate:seo`, o `gate:conteudo` e o `gate:prontidao` leem o registro.

Regras do PDF.js e do qpdf:

- O motor é `src/engine/pdf/`, autossuficiente. O PDF.js, o qpdf, o MozJPEG e o resize só carregam sob demanda, e cada `import()` passa pelo `loading()` de `errors.ts` (falha de carga é `load`, nunca "arquivo danificado"). Nada carrega antes do primeiro arquivo; o aquecimento só busca o que o primeiro arquivo buscaria.
- PDF.js (§ 144): o build legacy, com `useWorkerFetch: false`, `useSystemFonts: false`, `enableXfa: false`, `AnnotationMode.DISABLE` e sem camada de texto nem scripting. A versão 6 não tem `isEvalSupported`; o teste de endurecimento prova no JS publicado que não há `eval` nem `new Function` no caminho de fontes e funções. Os dados vêm de `/_astro/pdfjs/<versão>/`, copiados sem mudança pelo `src/platform/pdfjs-data.ts`: os CMaps, as fontes da Foxit e dois `.wasm`. Liberation (GPL), `.icc`, qcms e quickjs não entram.
- No worker, o PDF.js roda com o "worker falso" (`globalThis.pdfjsWorker`) e `OffscreenCanvas`. Sem `OffscreenCanvas` no worker (WebKit do Windows), o desenho vai para a página com a porta do `pdfjs-core.ts`. Teste os dois caminhos.
- qpdf: `runQpdf(args, input)` com `IN` e `OUT` no lugar dos arquivos. A saída (`print` e `printErr`) fica capturada e nunca vai ao `console`, porque pode levar a senha. O MEMFS é limpo depois de cada execução, e a instância é refeita acima de 512 MB ou depois de um `abort`. No Node, o qpdf mexe no `process.exitCode`: o `scripts/lib/qpdf.ts` devolve o valor de antes.
- Cifra: `--show-encryption` diz se o arquivo pede senha ("invalid password") ou não está cifrado ("File is not encrypted"). A Protect é `--encrypt --user-password=P --owner-password=P --bits=256 --`; a Unlock é `--decrypt`, com `--password=P` quando pede. Nunca força bruta.
- pdf-lib: abra com `updateMetadata: false`, `ignoreEncryption: true`, `parseSpeed: Fastest` e `throwOnInvalidObject: false`. Documento novo copia páginas pelo `assemble.ts` (§ 145), nunca pelo `copyPages` direto, que puxa páginas de fora por links e campos.
- Geometria: tudo o que se desenha na página passa por `toUser(box, rotate, vx, vy)` (`src/engine/pdf/geometry.ts`), sobre a CropBox e o /Rotate. O texto fica em pé na tela em toda rotação.

Pegadinhas que a F5a achou:

- Um arquivo que pede senha ou é restrito tem de contar como sem saída no painel (`HOPELESS` do `PdfPanel.tsx`). Senão ele entra no pedido da Merge, e a Merge inteira falha com "pede senha" em toda linha.
- O campo de arquivo das ferramentas de um arquivo por vez é `multiple` mesmo assim: o segundo arquivo vira a recusa na linha, e o `setInputFiles` com dois arquivos funciona no teste.
- As opções em segmento escondem o rádio: no teste, clique no rótulo `.fo-seg__opt` (o `.check()` do rádio trava).
- A lista de linhas mostra 6 e esconde o resto atrás de "Show N more": um teste que lê a razão de uma linha escondida clica antes em `.fo-queue__more`.
- O `readWithPdfjs` dos testes precisa de `new Uint8Array(bytes)`, não de um `Buffer` do Node.
- O `removePage` com `addPage` do pdf-lib estraga a árvore de páginas (`CorruptPageTreeError`): o Reorder refaz a lista `Kids` da raiz e copia os atributos herdados.
- O PDF.js no Node desenha com o `@napi-rs/canvas`, que vem como dependência opcional do `pdfjs-dist`: não é dependência nova e não entra no bundle.
- A AES-256 R6 do qpdf sorteia o IV e a chave mesmo com `--static-aes-iv`: a fixture só fica determinista com o `crypto.getRandomValues` trocado durante a cifra.
- O `--allow-weak-crypto` do qpdf vem antes do `--encrypt` na linha de comando.
- `setCropBox` e `setMediaBox` do pdf-lib recebem x, y, largura e altura, não dois cantos.
- **A matriz de PDF roda toda ferramenta contra toda fixture que ela aceita** (§ 175).
  - Ferramenta ou fixture nova entra nela, e o `pdf-matrix-table.test.ts` reprova lacuna.
  - Regere a tabela com uma execução só, nos dois navegadores, e o `node scripts/fixtures/pdf-matrix-table.ts > docs/relatorios/fase-05a-matriz.md`.
- **Arquivo reparado** (índice refeito pelo pdf-lib) nunca volta estragado: sem ganho, a Compress devolve a reescrita reparada, não os bytes de entrada (§ 182).
- **Estado próprio de um componente de opções** (a área de assinatura) precisa recomeçar quando o "Start over" limpa o estado da ferramenta.
  - Uma `key` pelo arquivo não serve, porque o arquivo só aparece depois de lido.
- **O `pnpm screenshots` reusa o passeio de estados de `tests/e2e/lib/pdf-states.ts`.** O `expect` do Playwright funciona fora do runner.
  - As miniaturas da grade são desenhadas só na tela, então o script espera as imagens das células visíveis.

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **Um `fill` logo depois de soltar um PDF** corria com o painel, que leva o foco ao botão da ação um quadro depois de mostrar as opções (§ 240). O painel agora deixa o foco num campo de texto onde ele já está. Um teste que precisa do foco num campo assim que ele aparece pode focá-lo por um `MutationObserver` na página, antes dos efeitos da ilha.

## Ajuste: idiomas

Pegadinhas que o ajuste achou:

- **O painel de PDF leva o foco à ação um quadro depois de mostrar a grade** (§ 240). Teste que dá foco a uma página da grade ou a um campo logo depois de abrir um arquivo espera antes o foco na ação; senão o movimento chega depois e tira o foco, só no runner lento (§ 322).

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- **O Preact reaproveita filhos sem `key` pelo tipo, em outra posição.** Quando a linha de espera (`<p>`) virava o Juntar (`<button>`), o Preact usou o `<p>` velho como o `<p>` da ajuda e o botão do "Add more" como o Juntar; o Chromium mediu isso como deslocamento (CLS 0,07 a 0,19 no juntar). Painel cujos filhos trocam de tipo leva `key` em cada filho (`count`, `hold`, `action`, `help`, `list`, `add`, `restart`). (a ilha de PDF)
- **Um `<details>` fechado ainda faz o layout do conteúdo** (content-visibility): `getBoundingClientRect` dos campos escondidos devolve caixas de verdade, e o `boxes()` do `ads.spec.ts` os conta como alvos (72 a 124 px do anúncio nos guias do Comprimir e do PDF para JPG). O corpo do "Adjust" e do "Order" só entra no DOM aberto. (a ilha de PDF)
- **Depois do resultado, as opções das ferramentas automáticas ficam no "Adjust" fechado:** teste que muda uma opção com o resultado na tela abre antes `#fo-tool-root .fo-adjust > summary` (o Girar página por página é o caso). Antes do resultado, mude a opção antes do arquivo. (a ilha de PDF)
- **A região da ilha é o `p.fo-sr[role="status"]`:** o Juntar tem a da contagem (`.fo-count`), que vem antes no DOM; um `[role="status"]` sem escopo pega a contagem. As linhas do Juntar continuam com a classe `fo-filelist__row` (os specs de privacidade, da matriz e dos eventos a leem). (a ilha de PDF)
- **A regra da linha de sucesso (`SUCCESS_LINE`) do `scripts/lib/design-checks.ts` é repetida no `tests/unit/routes.test.ts`:** frase de sucesso com chave nova muda as duas. (a ilha de PDF)
- **O cache das miniaturas é por (índice, largura):** a grade pede 240 px, a prévia da Assinar pede `min(1080, largura × DPR)` arredondada a 60 px; o `drop` precisa da mesma largura do `get`. (a ilha de PDF)
- **A ilha de PDF guarda as saídas da última execução em `m.outs`** (os bytes e os nomes do Baixar) para o chip que leva, e monta os `Blob` só no clique. A linha `.fo-carry` da faixa entra com os chips sempre que algum pode levar, escondida (`.fo-next--kept`, `aria-hidden`) quando nenhum leva agora: o seletor da linha à vista é `.fo-carry:not(.fo-next--kept)`. Os chips do Protect PDF nunca levam (o PDF sai cifrado), nem os que vão para uma ferramenta com ação. (o chip que leva)
- **Marca de foco do modelo só se gasta quando o alvo existe.** O efeito pendente da renderização anterior roda no começo da seguinte (o Preact roda os efeitos pendentes antes de renderizar de novo): quando o motor responde dentro de um quadro, ele vê a marca nova (`focusWrong`) com o DOM velho, e uma marca gasta nessa hora nunca põe o foco. O D-11 do Unlock reprovava assim no WebKit; a marca agora espera o campo com `aria-invalid` (DECISOES § 510). Para achar esse tipo de coisa, troque `HTMLElement.prototype.focus` e `Element.prototype.querySelector` num `addInitScript` por versões que anotam a hora e o alvo. (a ilha de PDF)
- **Abaixo de 480 px a linha do Juntar ocupa duas linhas** (DECISOES § 515): em cima, o card na largura da lista; embaixo, as setas e a lixeira numa linha de 48 px, com `--fo-row-h` de 154 px.
  - Um teste que compara um controle com o card usa o `y` (embaixo do card), não o `x` (ao lado dele).
  - O card pronto não tem a trilha das ações (`.fo-file__actions:empty` some).

## F14: páginas de PDF à vista

O que a próxima run precisa saber da grade de páginas, da lupa, da vista da página, da marcação e do worker do PDF.js (DECISOES § 617 a § 642).

- **A folha tem a proporção da página como ela vai sair** (`--sheet-ratio` na `.fo-page__sheet`, de `sheetRatio(box, giros)` em `src/tools/pdf/grid-math.ts`): a caixa, o `/Rotate` e, no Girar, os giros da pessoa, limitada a [0,5; 2]. A `img` ocupa a folha em posição absoluta, com `object-fit: contain`; com um giro ímpar, a caixa dela é a da folha com os lados trocados e o `rotate` a deixa do tamanho da folha (§ 618). A vista (`.fo-pview__sheet`, `--view-ratio`) faz o mesmo.
- **O preflight dá `max-width: 100%` a toda `img`:** uma `img` em posição absoluta mais larga que o pai (a caixa girada) fica cortada sem aviso; a regra girada leva `max-width: none` e `max-height: none`.
- **As células têm a altura das páginas:** um teste que espera todas as figuras de uma grade sem rolar pode ver só as da tela e as de até 300 px dela (o `rootMargin` do `IntersectionObserver`, § 152). Traga a grade para a tela antes (`scrollIntoViewIfNeeded` na última célula), como uma pessoa faz.
- **A largura pedida ao cache** é a largura da folha vezes o DPR, arredondada para cima em 60 px e até 720 (`askWidth`), medida pela grade antes da primeira pintura e por um `ResizeObserver` na lista; a barra de rolagem que aparece quando a grade cresce estreita a coluna e pode mudar a largura uma vez. Teste que confere a largura de uma figura calcula o esperado da folha medida, nunca um número fixo (§ 619).
- **A célula é um `PageCell` com `shouldComponentUpdate`** (sem o `preact/compat`): só redesenha quando uma prop dela muda. Função nova por render que chegue a ela desfaz isso: as funções vão no objeto `actions`, feito uma vez por grade, que lê o estado novo por uma ref (`latest`). O `say` do painel muda a cada render, então também passa pela ref (§ 620).
- **O `selected` da grade vem do `setOf(state.picked)`** (`grid-math.ts`): a grade percebe pela identidade do `Set` uma seleção que não foi ela que entregou (um intervalo digitado, mesmo com as mesmas páginas) e apaga a âncora do Shift. Um `new Set(...)` a cada render apagaria a âncora em toda renderização (§ 622 e § 628).
- **A lupa** (`.fo-page__zoom`) é irmã do botão da página, na mesma área da grade da célula, no canto de baixo à direita; a linha do número tem 48 px e guarda 52 px à direita. Ela fica no Tab só na célula ativa, e o nome em inglês não começa por "Page" (os testes acham o botão da página por `^Page N of M`) (§ 621).
- **O Preact 11 desmonta os filhos velhos antes de montar os novos:** quando a vista toma o lugar da grade, as células soltam as figuras delas antes de a vista renderizar, e um `get` da vista chega tarde (a figura já revogada). Quem quer um recurso que o componente velho segura pede antes, no gesto: o `zoom` da grade faz o `get` no clique e entrega a promessa à vista (`held`) (§ 624).
- **A classe `.fo-view` já existe** (a moldura das páginas institucionais): a vista da página é `.fo-pview*`. O título dela é um `h2` (a ilha vem logo depois do `h1`; um `h3` reprova o `heading-order` do axe, § 639).
- **O primeiro giro do Girar página por página monta a grade de novo:** o resultado chega, as opções vão para dentro do "Ajustar" (outro pai na árvore) e o `PageGrid` nasce outra vez, com o estado zerado. O que precisa sobreviver a isso fica numa memória do módulo (a vista usa `kept`, com `WeakRef` no cache; § 640). Sem a vista aberta, o foco ainda cai no `body` nesse giro (F14 m-2 no `docs/PENDENCIAS.md`).
- **O Assinar tem um segundo `p.fo-sr[role="status"]`** (`#fo-sign-box-status`), dentro da faixa: o seletor da região do painel é `#fo-tool-root .fo-pdf-island > p.fo-sr[role="status"]`.
- **A faixa tem `key` em cada filho** (`next`, `carry`, `order`, `adjust`, `options` e a chave da vista), porque a vista do resultado e a do Juntar entram como primeiro filho e empurram os outros.
- **O cache das miniaturas é a função `pictures(chave, arquivo, caixas, cliente)`** do `PdfPanel`, usada pela grade (`f<id>`), pela vista do resultado (`r<n>`) e pela do Juntar (`m<n>`); as chaves das vistas têm um contador por abertura e nunca se repetem (§ 625).
- **O PDF.js não destrói um `PDFWorker` que recebeu de fora, e o `PDFWorker.destroy()` não termina a porta:** no caminho da página, quem cria o `new Worker(pdfjs-core)` é quem o termina, no `close()` do `openForDrawing`, também no ramo de erro (§ 630).
- **Um `release(id)` avança a época do id:** um `thumbnail()` que esperava o `start().canvas` quando o `release` chegou devolve `null` e não abre o arquivo de novo (§ 630).
- **O "Done!" de uma execução automática e a frase do gesto:** a execução pode acabar dentro dos 50 ms do `say`, e aí a região diria o "Done!" antes da frase do gesto. O `hush` do `PdfPanel` cala a execução que um gesto com frase disparou (o giro, § 629); uma frase nova dita junto de um `update()` numa ferramenta automática segue a mesma regra.
