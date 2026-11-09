# Ferramentas e motor de imagem

O que as runs aprenderam sobre o motor e as ferramentas de imagem, os workers e o QR code, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- A ilha da ferramenta é hidratada por um `mount.ts` (DECISOES § 23). Um `<script>` do Astro com `import()` vira arquivo externo e puxa o `preload-helper`: para módulo carregado no primeiro uso, use `?worker&url` com um entry que publica a API no `window` (a busca faz assim).

## F2: ferramentas de imagem

Como acrescentar uma ferramenta de imagem:

1. O id em `IMAGE_TOOL_IDS` (ou `IMAGE_PRESET_IDS`) e a entrada em `IMAGE_PAGES`, em `src/tools/image/registry.ts`: o que aceita (formato real, dos bytes), o ícone, os chips (`next`), as relacionadas (até 6), o `beforeAfter` e o `pdf`. A rota entra na lista de `imageToolRoutes()` em `src/i18n/routes.ts` e o id em `RouteId`; a função gera a rota só com `en` e `adArea: 'arquivos'`.
2. `src/tools/<slug>/Panel.tsx`, que exporta `TOOL: ImageTool<S, O>` (`operation`, `Options` e, se precisar, `warm`, `success`, `pdfSize`, `selectable`); `mount.ts`, que só chama `mountIsland(Panel)`; `<Slug>Page.astro`, sobre o `ImageToolPage.astro`; e `src/pages/<slug>/index.astro`. Opção com escolha usa o `OptionGroup`; número, o `NumberField`.
3. Textos em `src/tools/<slug>/i18n/en.ts` (`ImageToolTexts<Opções>`, com os blocos que o `gate:conteudo` pede) e o cartão em `src/i18n/en/common.ts` (`tools`). O hub, a home, o rodapé e a busca leem o registro.
4. Testes: a ferramenta na matriz (`tests/e2e/lib/matrix.ts`), no `TOOL_PAGES` do `budgets.spec.ts` e do `ads.spec.ts` (se ela não aceita JPG, um arquivo pequeno que ela aceite em `SMALL_OF`) e um teste de opções no `image-smoke.spec.ts`. O `a11y.spec.ts`, o `gate:seo` e o `gate:conteudo` já pegam a página nova pelo mapa de rotas e pelo registro.

Pegadinhas que a F2 achou:

- Página de ferramenta carrega exatamente 2 arquivos JS (o `mount` e o grupo `island` do `astro.config.ts`). Um import de `src/engine/` na ilha cria um terceiro arquivo e estoura o orçamento de requisições: a ilha fala com o motor só pelo `engine-client.ts` (Comlink) e repete a conta que precisar (o `box.ts` do Crop tem a própria caixa centrada).
- O worker do motor é `src/engine/image/worker.ts` e vira `/_astro/worker-*.js`: não mude o nome. O `dist/` leva cada codec duas vezes (`-` para o worker e `.` para a página, que é o caminho do WebKit sem `OffscreenCanvas`): é esperado.
- Só a build de uma thread de cada codec (`@jsquash/*` por import fundo, com `?url` no `.wasm`); nada de `_mt`, `pkg-parallel`, hqx, magic-kernel nem `wasm-feature-detect`. O `image-privacy.spec.ts` reprova.
- O JS de cola do libheif é um chunk só dele (grupo `libheif`), e o `gate:licencas` exige isso e o `.wasm` idêntico ao do pacote. Pacote novo no bundle precisa estar na /licenses: o gate lê os módulos de cada chunk em `.cache/bundle-modules.json`.
- `createImageBitmap` com `imageOrientation: 'none'` ainda aplica a Orientation do Exif nos dois navegadores. A referência em pé dos testes sai de `withOrientation(bytes, 1)` (`tests/e2e/lib/jpeg.ts`).
- O codificador de canvas do Chromium põe um perfil ICC sRGB no JPG e no PNG: "sem metadados" é sem Exif, XMP, IPTC e GPS (`metadataReport`), não "sem APPn".
- O WebKit 27.2 do Windows não decodifica AVIF e não tem `OffscreenCanvas` no worker; nenhum dos dois navegadores decodifica HEIC. No Linux do CI o WebKit pode diferir: os testes detectam e registram.
- O `warm()` liga o worker quando o ponteiro para sobre o painel: teste que segura o motor (`slowEngine`) tem que segurar antes do `goto`.

## F3: revisão e prontidão

Pegadinhas que a F3 achou:

- Toda carga sob demanda do motor (um `import()` de codec, a cola do jSquash, o `.wasm`) passa pelo `loading()` de `src/engine/image/errors.ts`. Uma falha de carga vira `EngineError('load')`, com a fala "recarregue a página", e nunca "arquivo danificado". O `load` fica fora do `HOPELESS`, então a próxima execução tenta de novo (§ 102 e § 104). Um `import()` novo no motor sem o `loading()` volta a chamar um arquivo bom de "danificado".
- Um worker sem `OffscreenCanvas` não faz trabalho de imagem: o motor roda na página, e o `warm()` não aquece o worker (§ 102). Para testar esse caminho nos dois navegadores, sirva o script do worker de imagem (o que não tem `PDFDocument`) com `delete globalThis.OffscreenCanvas;` na frente, por `page.route` (`tests/e2e/engine-paths.spec.ts`).

## F5a: ferramentas de PDF

Pegadinhas que a F5a achou:

- **O WebKit avalia duas vezes a entrada de um worker de módulo** quando um chunk carregado sob demanda importa dela, e o bundler põe ali os ajudantes compartilhados (§ 168 e § 172). Todo módulo do worker passa a existir duas vezes.
  - O `expose()` roda só na primeira cópia.
  - Estado que o worker recebe por mensagem (as URLs dos `.wasm` do motor de imagem) fica também no `globalThis`, para a segunda cópia o tomar.
  - Classe de erro reconhecida por `instanceof` precisa do `Symbol.hasInstance`.
  - O `tests/unit/worker-once.test.ts` avalia as entradas duas vezes no mesmo escopo. Worker novo entra nele.
- **O WebKit do Windows não processa imagem no worker** (sem `OffscreenCanvas`), então um defeito do caminho do worker só aparece no WebKit do Linux do CI. Foi assim que a run 41330210631 achou as ferramentas de imagem paradas.
  - Mudança no motor de imagem ou no worker pede o CI antes de dar como pronta.

## F7: casa, saúde e QR code

O QR code:

- Fica em `src/tools/qr-code-generator/` (a ilha, a conta em `qr.ts`, sem DOM, e o único `<script>` da página no componente dela). Página `/qr-code-generator/`, só em inglês, área `utilidades`, sem hub nem link do cenário.
- O `qrcode` está em `dependencies` só por esta página: o import é o caminho fundo `qrcode/lib/core/qrcode.js` (22 módulos e o `dijkstrajs`), estático, e nada do chunk `island` importa o QR. O plugin `qrcodeEsm()` (`src/platform/qrcode-esm.ts`) entrega esses arquivos CommonJS ao bundler como ES modules (§ 271), e a página carrega 2 arquivos JS. O `gate:licencas` reprova `qrcode` ou `dijkstrajs` no `island` ou em mais de um chunk.
- A leitura é provada pelo `jsqr` (o `binaryData` igual aos bytes UTF-8 do texto), no Node (`tests/unit/qr.test.ts`, o SVG rasterizado pelo `@resvg/resvg-js`) e nos dois navegadores (`tests/e2e/qr-code.spec.ts`, o PNG e o SVG baixados, com e sem a Oli).

Pegadinhas que a F7 achou:

- **Um pacote CommonJS numa página faz o Rolldown carregar o `rolldown-runtime.*.js`** (o ajudante `__commonJS`), que ele divide com os chunks preguiçosos: um terceiro arquivo JS. O runtime não entra em grupo de `codeSplitting` e o `experimentalInlineCommonChunks` não roda no build do Astro. Para CommonJS simples, converta para ES module no build, como o `qrcodeEsm()` (§ 271), e prove a contagem no `budgets.spec.ts`.
- **O `jsqr` só lê com pixels por módulo inteiros**: o PNG do QR sai numa escala inteira, nunca num tamanho fixo de 512 px.

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- **Um nó que o Preact move perde o foco.** Sem `key`, o Preact casa os filhos por posição e tipo; quando um filho muda de posição entre dois estados, ele procura o mesmo tipo por perto e move o nó com `insertBefore`, e no Chromium mover o elemento focado tira o foco dele (vai para o `body`). Na zona da ilha de imagem os filhos têm lugar fixo em todo estado, com um buraco (`null`) onde o estado não tem a peça, para o botão do repouso ser o mesmo nó do Escolher outros arquivos (DECISOES § 468). Peça nova na zona entra no mesmo lugar em todos os estados. (O `cookie-notice.spec.ts` da fatia 1 reprovou nos 12 casos do erro até isso.) (a ilha de imagem)
- **O `useEffect` do Preact roda depois da pintura e pode rodar entre um `render()` da ilha e a renderização que ele pediu.** A marca de onde estava o foco (`slotFocus`, `bandFocus`), apagada no fim de cada efeito, pode ser apagada pelo efeito da renderização anterior antes de o nó sair. Não confie na devolução do foco para um controle que troca de estado: mantenha o nó. (a ilha de imagem)
- **A hidratação do Preact não mexe nos atributos que já estão no HTML.** Um script inline que marca o DOM antes da hidratação (o `data-coffee` do `COFFEE_AHEAD_SCRIPT`) continua lá e o vnode não sabe dele: a ilha toma a mesma decisão num efeito de montagem e tira o atributo se discordar (§ 470). (a ilha de imagem)
- **A faixa de baixo escolhe a linha pelo lote, não pelo cartão:** opções à vista, ou chips e "Ajustar", pelo `hadCard` do lote (uma reexecução por opção o mantém), não pelo `showCard`, que some nos 400 ms em que o WaterLevel volta. Assim o `details` e o rádio focado são os mesmos nós enquanto o lote refaz. (a ilha de imagem)
- **Depois do resultado, as opções moram no "Ajustar" fechado:** spec que muda opção depois do resultado chama `openAdjust(page)` de `tests/e2e/lib/page.ts`; o que mede o comparador chama `openCompare(page)`. Um lote novo sobre um resultado fecha os dois de novo. O `startOver(page)` clica no 1º botão de `.fo-result__more` (card de imagem) ou em `.fo-result__actions > button` (card de PDF de hoje). (a ilha de imagem)
- **O rótulo do chip que leva só existe no cliente,** depois da hidratação e com um service worker no controle: com o padrão `serviceWorkers: 'block'` todo spec vê o nome da ferramenta, como antes. A linha `.fo-carry` à vista é a de `.fo-band__now`; a cópia escondida da faixa tem outra, com o rótulo do lote de 10 arquivos nos chips (a altura mais longa), no mesmo lugar. (o chip que leva)
- **Um ícone `?raw` usado em dois lugares sai duas vezes no chunk** (o bundler põe a string em cada uso). Ícone que só uma peça usa vem no `data-props`, como os da ilha de PDF (`carryIcons` da ilha de imagem). (o chip que leva)
- **O soltar é do documento (`catchDrops` de `paste.ts`):** um lote que começa por outro caminho (o seletor, o colar, a chegada de um chip) chama o `reset()` dele, senão um arrasto pela metade deixa o contador acima de zero e a zona presa no `over`. Todo `dragleave` desconta (o `tool-slot-axe.spec.ts` despacha um sem `dataTransfer`), sem passar de zero. A zona não tem mais `onDragEnter`: o `dragOver(page)` de `lib/page.ts` despacha o `dragenter` nela, e ele sobe ao documento. (o soltar)
- **As notas do resultado da ilha de imagem correm num parágrafo** (os `li` em linha; DECISOES § 516). Toda nota termina com ponto, e um teste que lê `.fo-result__notes li` continua recebendo um texto por nota. A nota de onde os arquivos vieram (`.fo-result__from`) fica numa linha só dela.
- **Meça o retângulo com uma foto de celular** (`jpg-02-iphone6-paisagem-gps.jpg`, com EXIF e GPS), não só com o JPEG gerado na página. Nas presets de tamanho, a foto traz a nota da redução, e a fala de pt e es ocupa três linhas.
- **O aquecimento (`warmOnce`) é só antes do 1º arquivo:** o `startBatch()` o dá por feito (DECISOES § 534). Sem isso, o ponteiro que entra no retângulo para clicar no Baixar, ou o foco que o Start over dá ao Escolher, aquecia depois do 1º uso os codecs que a foto não usou (7 arquivos na Compress), e com a rede desligada eles viravam pedidos que o `launch-claims.spec.ts` acusa. Gatilho novo de aquecimento respeita o mesmo `warmed`. (a ilha de imagem)

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **O resultado a 320 px (§ 580 e § 581):** abaixo de 340 px a placa do resultado não aparece, e os botões fantasmas ficam numa linha com 14 px de texto; até 440 px a placa pende 6 px menos. A medida da placa girada (−4°) precisa dos quatro cantos: a caixa do `getBoundingClientRect()` de um elemento girado é a caixa envolvente e dá o dobro da invasão real (8,5 px contra 3,6). A sonda é `.cache/f13b/g22-probe.mjs`, e o teste, `tests/e2e/tool-320.spec.ts`.
- **A trilha das presets (§ 582):** o `Breadcrumb.astro` com `skipHub` esconde o 2º passo de uma trilha de quatro abaixo de 360 px; o `BreadcrumbList` continua com os quatro. Só o `ImageToolPage.astro` usa a opção.

## F15: imagem, QR e o caminho entre ferramentas

O que a próxima run precisa saber da lista e do lote de imagem, dos chips que levam o PDF, do "Até um tamanho" e do QR (DECISOES § 649 a § 678).

- **O `zipFiles` do `engine-client.ts` manda o ZIP ao worker `fileorca-image`.** Um ZIP refeito sem codificar nada (a lixeira, o Desfazer) vai pelo `zipHere()`, na página, com o mesmo `zipStored` e o chunk `zip.*.js` que o caminho sem worker já tinha; senão o espião conta uma mensagem ao worker de imagem depois do gesto (§ 667).
- **Enquanto o pacote é refeito, o `m.bundle` é o de antes do gesto.** O Baixar (`wantDownload`) e o chip que leva o PDF da Imagem para PDF (`wantFollow`) esperam o pacote novo, e o teste de "ocupado" se lê do modelo na hora do toque (`m.bundle.key !== keyNow()`), não da constante `busy` do render: o toque pode vir antes da renderização do gesto (§ 653 e § 667). Quem puser outro botão que use o pacote faz o mesmo.
- **A barra da linha que trabalha (`.fo-bar`) deixava o card 6 px mais alto** (80, 86, 80 px): com a lista na tela, cada foto pronta movia as linhas de baixo. Na lista de imagem, a coluna das palavras guarda o lugar da barra desde o começo (§ 668).
- **Uma marca de foco numa linha que o Preact move só se gasta com a ordem das linhas na tela igual à do modelo** (`listIsDrawn`): o efeito pendente de uma renderização anterior roda antes do diff, com a lista velha, e um foco dado ali se perde quando a linha se move (o § 510 com a ordem, além da existência do alvo; § 669).
- **A fila da ilha de PDF usa as mesmas classes de linha** (`.fo-filelist`, `.fo-filelist__row`): regra de linha da lista de imagem vai sob `.fo-filelist--image`.
- **No WebKit do Windows o worker de imagem recebe só duas mensagens por lote** (a configuração e a pergunta do canvas): as fotos são codificadas na página, e o primeiro ZIP ainda vai ao worker. A prova de "nenhuma mensagem ao `fileorca-image` depois do gesto" é forte no Chromium; no WebKit do Windows ela prova o ZIP.
- **A cópia escondida da faixa da Imagem para PDF usa o `one` dos chips que levam** (sempre um PDF), não o `many` de 10: "Merge this PDF with others" é mais longo que "Merge these 10 PDFs" (§ 674).
- **A régua `.fo-seg` com `flex: 1` não transborda por palavra longa:** o item cresce até o `min-content` da palavra ("Recommended", 131 px) e os outros encolhem até o rótulo ir a duas ou três linhas. A medida de "cabe lado a lado" olha a régua dentro do `fieldset` e o número de linhas de cada rótulo (um `Range` sobre o texto), não só o `scrollWidth` de cada escolha (§ 675).
- **No QR, o `rows={4}` do `textarea` só dá a altura quando nenhum CSS a fixa;** para mostrar menos linhas abaixo de uma largura, a regra põe `height` e `min-height` na `@media` (o `min-height: 120px` de antes continua mandando a partir de 768 px; § 677).
- **Um número que a página e o spec dividem vai num módulo puro ao lado do painel** (o `src/tools/compress-image/size.ts`, com o `MIN_KB`): um spec do Playwright não importa o `Panel.tsx` (ele puxa a `ImagePanel` e os ícones `?raw`, que o carregador do Playwright não tem), e o import estático do painel não cria arquivo JS novo no `dist/_astro/`.
- **O es agrupa os milhares com vírgula** ("10,000", como o `groupDigits` e o glossário do es); só o pt usa ponto. Um texto de página que escreve o número à mão segue o mesmo, ou discorda do erro do campo (§ 656).
