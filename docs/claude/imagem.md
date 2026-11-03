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
