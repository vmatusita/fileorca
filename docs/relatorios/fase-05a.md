# F5a · Relatório (ferramentas de PDF em inglês)

## Resumo

- **As 12 ferramentas de PDF no ar, em inglês, e o hub `/pdf-tools/`.** Tudo roda no navegador, sem upload: pdf-lib, qpdf em WebAssembly e PDF.js. A lista: Merge, Split, PDF to JPG, Compress (Sem perda, Recomendado e Forte), Rotate, Delete pages, Add page numbers, Sign, Protect, Unlock, Reorder e Watermark.
- **Base de prova:** 13 fixtures geradas antes de qualquer arquivo de ferramenta, um oráculo de leitores independentes e uma matriz com toda ferramenta contra toda fixture que ela aceita nos dois navegadores (356 linhas, nenhuma falha).
- **Testes novos:** privacidade com 10 sentinelas em toda superfície, endurecimento do PDF.js provado no JS publicado, tarefas longas, orçamento, anúncio e axe por estado.
- **Exportação:** o motor de imagem saiu pronto para código aberto (`pnpm motor:exportar --conferir` dá zero fora do repositório).
- **CI:** foi para 11 partes, com os core dumps desligados e o disco amostrado a cada 2 s. Nenhum `ENOSPC` nas execuções da PR.
- **Revisão adversarial:** 6 lentes e 31 céticos acharam 53 pontos, nenhum crítico. Os 3 altos e os 16 médios foram corrigidos, cada um com teste.
- **A válvula não cortou nada:** a Sign, a Watermark e a Reorder estão no ar.

## As páginas

Todas em inglês, só no idioma em que existem (§ 58), com WebApplication sem nota, BreadcrumbList, Open Graph do build e sitemap (§ 160).

| URL | O que faz | Fixtures que aceita | JS inicial | Requisições |
| --- | --- | --- | --- | --- |
| `/merge-pdf/` | Junta PDFs na ordem da lista (arrastar, botões, teclado) | 10 legíveis | 2 arquivos, 36,7 KB gzip | 6 (Chromium), 7 (WebKit) |
| `/split-pdf/` | Cada página, faixas ou páginas escolhidas na grade; ZIP | 10 legíveis | o mesmo | o mesmo |
| `/pdf-to-jpg/` | Páginas em JPG ou PNG a 72, 150 ou 300 ppi; ZIP | 10 legíveis + a só com restrição de dono | o mesmo | o mesmo |
| `/compress-pdf/` | Sem perda (qpdf), Recomendado (MozJPEG 75, 150 ppi) e Forte (páginas como imagem a 100 ppi) | 10 legíveis | o mesmo | o mesmo |
| `/rotate-pdf/` | Todas as páginas, ou página por página na grade | 10 legíveis | o mesmo | o mesmo |
| `/delete-pdf-pages/` | Tira as páginas escolhidas na grade ou por faixa | 10 legíveis | o mesmo | o mesmo |
| `/add-page-numbers-to-pdf/` | 6 posições, 4 formatos, início, pular a primeira | 10 legíveis | o mesmo | o mesmo |
| `/sign-pdf/` | Assinatura desenhada, enviada ou digitada, posta pela prévia ou pelo teclado | 10 legíveis | o mesmo | o mesmo |
| `/protect-pdf/` | AES-256 (R6) com senha e confirmação | 10 legíveis | o mesmo | o mesmo |
| `/unlock-pdf/` | Tira a senha (pedida) ou as restrições de dono | as 3 cifradas | o mesmo | o mesmo |
| `/reorder-pdf-pages/` | Nova ordem pela grade: arrastar, botões, teclado, inverter | 10 legíveis | o mesmo | o mesmo |
| `/watermark-pdf/` | Texto, tamanho, opacidade, diagonal ou horizontal | 10 legíveis | o mesmo | o mesmo |
| `/pdf-tools/` | O hub: faixa coral, as 12 por volume, o cartão da Image to PDF e o guia | — | 0 arquivos, 3,4 KB | — |

As "10 legíveis" são as 9 que o oráculo marca `ok` e a de índice estragado, que sai reparada. As outras quatro (vazio, cortado, JPG e texto com nome `.pdf`) são recusadas na linha, com a fala da Oli.

A home em inglês ganhou a seção "Work on a PDF" com as 12 ferramentas, o rodapé ganhou a coluna PDF (o hub e as 6 primeiras), e a busca ganhou as 12 (§ 160). Nenhuma página ficou órfã (`gate:links`).

## As fixtures

O `git log -- fixtures/pdf src/tools/pdf` mostra as fixtures antes de qualquer arquivo de ferramenta:

```
a12abbf chore: initial project setup (F0)
d5fe2a8 chore: F0 outputs, keywords and fixtures
dc838b4 test(pdf): add the generated PDF fixtures and their oracle
4cabbb2 feat(pdf): add the PDF island, the 12 PDF tool pages and the hub
```

São 13 geradas (`scripts/fixtures/pdf.ts`, chamado pelo `pnpm fixtures`) e mais as 4 da F0. A pasta `fixtures/pdf/` tem 11,98 MB.

| Fixture | O que prova | Esperado |
| --- | --- | --- |
| `gen-paginas-300` | ordem, memória, tarefas longas | 300 páginas Letter, marcador "Page N" |
| `gen-paginas-mistas` | geometria | 8 páginas: Letter, A4, deitada, /Rotate 90, 270 e 180, CropBox deslocada, MediaBox fora da origem |
| `gen-ja-otimizado` | a Compress devolve o original | 12 páginas de texto, já como o qpdf deixa |
| `gen-fotos` | o Recomendado ganha | 3 fotos RGB e 1 cinza |
| `gen-cifrado-aes256`, `gen-cifrado-rc4-128`, `gen-cifrado-dono` | Protect, Unlock e recusas | R6 AESv3 com senha; R3 RC4 com senha; R6 só de dono |
| `gen-acoes` | segurança | OpenAction com JS, Launch, URI, link interno, JS na página |
| `gen-xref-estragada` | reparo | o PDF.js abre, o qpdf não; sai reparado |
| `gen-cortado`, `gen-vazio`, `gen-jpg-extensao-pdf`, `gen-texto-extensao-pdf` | recusas | cortado, vazio, não é PDF, não é PDF |

- **O esperado** (`fixtures/pdf/expected.json`) vem de leitores independentes do motor: o PDF.js no Node e o qpdf em WASM (`--check` e `--show-encryption`).
- **Os bytes:**
  - As fixtures são deterministas: o qpdf usa `--static-id --static-aes-iv`, e o `crypto.getRandomValues` vira um contador durante a cifra AES-256.
  - O SHA-256 de cada uma está no `fixtures/ORIGEM.md` (§ 156).

## A matriz

`docs/relatorios/fase-05a-matriz.md` sai do `scripts/fixtures/pdf-matrix-table.ts` a partir dos registros do `tests/e2e/pdf-matrix.spec.ts`, nunca à mão.

- **Cobertura:** cada ferramenta e cada modo da Compress, contra cada fixture que aceita, com uma linha `ok` nos dois navegadores. O script e o `tests/unit/pdf-matrix-table.test.ts` reprovam lacuna ou saída `failed` (§ 175).
- **Linhas:** 356, sendo 272 conferidas e 84 recusas (178 por navegador). São 51 testes por navegador.
- **O que cada saída confere, no Node:**
  - o `strictPdf`;
  - o PDF.js abre e o `getOperatorList` de cada página resolve;
  - o `qpdf --check` dá zero;
  - a conta da ferramenta contra o oráculo: contagem, ordem pelos marcadores ou pela chave da página, `/Rotate`, texto do número e da marca, imagem da assinatura na página certa, R6 com AESv3 depois da Protect, nada de `/Encrypt` depois da Unlock, imagens da PDF to JPG na contagem e no tamanho, sem Exif nem GPS;
  - a Compress menor ou igual, e igual byte a byte quando não ganha.
- **A primeira versão** cobria toda ferramenta, mas não toda fixture em cada uma: a Delete, a Sign e a Reorder tinham uma fixture cada. A revisão (A-6) pediu a cobertura completa. A matriz completa achou o Forte devolvendo a `gen-xref-estragada` ainda estragada, corrigido (§ 182).

## Compress PDF: modo × fixture

Do `tests/unit/pdf-compress.test.ts`, no Node, com o mesmo código do worker. O limiar de PSNR (30 dB, página 1 a 100 ppi) foi fixado antes da primeira medida (§ 147 e § 158).

| Modo | Fixture | Antes (bytes) | Depois (bytes) | Razão | Resultado | PSNR (dB) |
| --- | --- | ---: | ---: | ---: | --- | ---: |
| Sem perda | `gen-acoes` | 3.482 | 2.102 | 0,604 | menor | |
| Sem perda | `gen-fotos` | 2.917.866 | 2.917.039 | 1,000 | menor | |
| Sem perda | `gen-ja-otimizado` | 15.537 | 15.537 | 1,000 | o original | |
| Sem perda | `gen-paginas-300` | 234.441 | 144.327 | 0,616 | menor | |
| Sem perda | `gen-paginas-mistas` | 6.939 | 4.646 | 0,670 | menor | |
| Sem perda | `gen-xref-estragada` | 2.787 | 2.075 | 0,745 | menor, reparado | |
| Sem perda | `pdf-escaneado-01` | 167.938 | 167.716 | 0,999 | menor | |
| Sem perda | `pdf-escaneado-02` (NASA, 150 p.) | 3.615.137 | 3.094.027 | 0,856 | menor | |
| Sem perda | `pdf-formulario-irs-1040` | 146.326 | 129.958 | 0,888 | menor | |
| Sem perda | `pdf-grande-fontes-117p` | 5.321.132 | 5.309.090 | 0,998 | menor | |
| Recomendado | `gen-acoes` | 3.482 | 2.102 | 0,604 | menor | mesmos pixels |
| Recomendado | `gen-fotos` | 2.917.866 | 950.328 | **0,326** | menor | **36,1** |
| Recomendado | `gen-ja-otimizado` | 15.537 | 15.537 | 1,000 | o original | mesmos pixels |
| Recomendado | `gen-paginas-300` | 234.441 | 144.327 | 0,616 | menor | mesmos pixels |
| Recomendado | `gen-paginas-mistas` | 6.939 | 4.646 | 0,670 | menor | mesmos pixels |
| Recomendado | `gen-xref-estragada` | 2.787 | 2.075 | 0,745 | menor, reparado | mesmos pixels |
| Recomendado | `pdf-escaneado-01` | 167.938 | 115.495 | 0,688 | menor | **37,3** |
| Recomendado | `pdf-escaneado-02` | 3.615.137 | 3.094.027 | 0,856 | menor | mesmos pixels |
| Recomendado | `pdf-formulario-irs-1040` | 146.326 | 129.958 | 0,888 | menor | mesmos pixels |
| Recomendado | `pdf-grande-fontes-117p` | 5.321.132 | 5.309.090 | 0,998 | menor | mesmos pixels |
| Forte | `gen-acoes` | 3.482 | 3.482 | 1,000 | o original | |
| Forte | `gen-fotos` | 2.917.866 | 354.186 | 0,121 | menor | |
| Forte | `gen-ja-otimizado` | 15.537 | 15.537 | 1,000 | o original | |
| Forte | `gen-paginas-300` | 234.441 | 234.441 | 1,000 | o original | |
| Forte | `gen-paginas-mistas` | 6.939 | 6.939 | 1,000 | o original | |
| Forte | `gen-xref-estragada` | 2.787 | 2.075 | 0,745 | reparado (a saída do Sem perda) | |
| Forte | `pdf-escaneado-01` | 167.938 | 54.133 | 0,322 | menor | |
| Forte | `pdf-escaneado-02` | 3.615.137 | 3.615.137 | 1,000 | o original | |
| Forte | `pdf-formulario-irs-1040` | 146.326 | 146.326 | 1,000 | o original | |
| Forte | `pdf-grande-fontes-117p` | 5.321.132 | 5.321.132 | 1,000 | o original | |

- **Nunca maior:** nenhuma saída passa do original. Sem ganho, volta o original byte a byte, com a fala de que o arquivo já estava otimizado.
  - A exceção é o arquivo reparado, que nunca volta estragado (§ 182).
- **O Recomendado** ganha nas fotos (0,326, a 36,1 dB) e no escaneado (0,688, a 37,3 dB), acima do limiar de 30 dB. Nas outras fixtures, só o qpdf mexe, e a página sai com os mesmos pixels.
- **O Forte** só ganha onde há fotos. Nas páginas mistas, a geometria provada no desenho dá de 30,9 a 42,2 dB por página.
  - O aviso do Forte (texto não selecionável; formulário, links e marcadores perdidos) aparece antes da escolha.

## Protect e Unlock

- **No Vitest** (`tests/unit/pdf-lock.test.ts`, § 159):
  - a Protect sai em R6 com AESv3, sem permissão retida, com a senha de abrir igual à de dono;
  - o PDF.js e o qpdf só abrem com a senha;
  - a senha não está nos bytes em Latin-1, UTF-8, UTF-16 ou hexadecimal;
  - senha acentuada e senha de 100 caracteres fazem a ida e volta;
  - a Unlock tira o `/Encrypt` das três cifradas, e a saída abre sem senha;
  - a senha errada dá `wrong-password`, e a certa funciona depois, mesmo após cinco erradas;
  - a senha nunca vai ao console nem ao stdout.
- **Na matriz:** as mesmas provas nos dois navegadores, com o `qpdf --show-encryption` das saídas.
- **Na revisão:** a lente (a) passou 11 senhas pela ida e volta (acento, CJK, emoji, aspas, barra, tabulação, largura cheia).
- **A11y da senha** (§ 177): a senha errada e os erros de regra são alerta, e o botão "Show" tem nome estável e próprio em cada campo.

## Privacidade e segurança

**`tests/e2e/pdf-privacy.spec.ts`** (§ 166), 22 testes por navegador:

- os fluxos das 12 páginas;
- a Merge com linha movida durante a leitura;
- um controle positivo dos coletores, com vazamentos plantados;
- 7 fluxos com a `gen-acoes`;
- o isolamento do qpdf e do PDF.js.

O que ele procura:

- **10 sentinelas:** a senha, uma senha errada, o texto da marca, o nome assinado, um marcador dentro do arquivo, o número inicial 8317, três faixas e o nome do arquivo.
- **Onde:** toda requisição de toda origem (inclusive dos workers), com método, URL, cabeçalhos e corpo. Só passa GET da própria origem, sem corpo e sem query string.
  - Também o `dataLayer`, o `title` e o `location`.
  - Também o `localStorage`, o `sessionStorage`, o IndexedDB e os cookies.
  - Também o console da página e dos workers, e os nomes dos downloads e das entradas do ZIP.
  - O nome do arquivo da pessoa só pode aparecer no nome do download, e o teste exige que apareça.
- **O PDF protegido** não leva a senha nem o texto das páginas em claro.
- **A `gen-acoes`** não abre diálogo, popup, navegação nem requisição. A revisão (lente b) rodou também os 9 fluxos que não desenham, sem nada.
  - As ações do arquivo da pessoa ficam na saída, e nenhuma roda no site (§ 167).
- **O qpdf e o PDF.js** seguem as regras da § 80:
  - página e workers sem `crossOriginIsolated` e sem `SharedArrayBuffer`;
  - o `qpdf.wasm` e o `jbig2.wasm` recebidos são idênticos aos dos pacotes.

**Endurecimento** (§ 157):

- O PDF.js 6 não tem mais o `isEvalSupported`. O `tests/unit/pdf-hardening.test.ts` lê o JS publicado com o parser do TypeScript: zero `eval`, zero `new Function` e uma só chamada `Function('return this')` (a do core-js).
- O `tests/e2e/pdf-hardening.spec.ts` confere o mesmo em todo script do `dist/`, e também nada de qcms, `.icc`, QuickJS, Liberation ou asm.js.

**Lançamento:** o `launch-claims.spec.ts` ganhou a Compress PDF, a PDF to JPG e a Protect PDF, offline.

**Saída do teste** (`pnpm verificar` local, no commit `2975fc6`): 22 testes por navegador, todos verdes. No Chromium:

```
✓ typed values, names and files stay in the browser › /merge-pdf/: drop, options, run, download and chip leave nothing of the sentinels anywhere
✓ … o mesmo nas outras 11 páginas (split, pdf-to-jpg, compress, rotate, delete, numbers, sign, protect, unlock, reorder, watermark)
✓ Merge PDF: a row moved while the files are still being read does not leave a file unread
✓ the collectors see a leak planted in the page and in a worker, on every surface they read
✓ gen-acoes.pdf: nothing in the file runs › PDF to JPG / the Strong mode of Compress PDF / the grids of Delete, Reorder, Rotate and Split / the preview of Sign PDF: no dialog, popup, navigation or request, and the output adds no action of its own
✓ qpdf and PDF.js work on a page that is not cross-origin isolated, with the unmodified .wasm files of their packages
```

O `pdf-hardening.spec.ts` deu 5 de 5 em cada navegador, e o `launch-claims.spec.ts`, 6 de 6.

## Tarefas longas e tempo na `gen-paginas-300`

Do `tests/e2e/pdf-speed.spec.ts` (§ 169), com o `PerformanceObserver` de `longtask` dentro da página. O limite de 200 ms vale no Chromium. O WebKit não tem essas entradas e só imprime o tempo.

As linhas do `pnpm verificar` local (commit `2975fc6`). O "run" vai do clique na ação, ou do soltar o arquivo numa ferramenta que roda sozinha, até o resultado na página:

```
[200 ms] chromium merge-pdf: longest task 0 ms (0 over 50 ms), run 274 ms
[200 ms] chromium split-pdf: longest task 0 ms (0 over 50 ms), run 179 ms
[200 ms] chromium compress-pdf (lossless): longest task 0 ms (0 over 50 ms), run 206 ms
[200 ms] chromium add-page-numbers-to-pdf: longest task 0 ms (0 over 50 ms), run 311 ms
[200 ms] webkit merge-pdf: no longtask entries in this browser, run 406 ms
[200 ms] webkit compress-pdf (lossless): no longtask entries in this browser, run 508 ms
[200 ms] webkit add-page-numbers-to-pdf: no longtask entries in this browser, run 488 ms
[200 ms] webkit split-pdf: no longtask entries in this browser, run 1292 ms
```

- **A Merge** junta duas cópias das 300 páginas (600 páginas), e a Split dá um ZIP de 300 arquivos.
- **Nenhuma tarefa** passou de 50 ms no Chromium, e um controle de 260 ms prova que o observador as vê (§ 169).
- **A revisão** (lente e) mediu também os arquivos pesados e a grade de 300 páginas: no máximo 48 `<img>` vivos, e cada URL de miniatura criada é revogada.

## Orçamento

- **As 12 páginas de PDF** carregam exatamente 2 arquivos JS: 36,7 KB gzip de 80 (eram 35,8 KB antes das correções da revisão), e 6 requisições no Chromium e 7 no WebKit, de 8. O hub tem 3,4 KB e nenhum JS (§ 170).
- **Nada do motor antes do primeiro arquivo.** O aquecimento sobre a zona busca só o que o primeiro arquivo buscaria: o qpdf na Compress, na Protect e na Unlock, e o PDF.js na PDF to JPG e na Sign.
- **A Image to PDF e o PDF das calculadoras** não buscam nem o qpdf nem o PDF.js.
- **Pares de navegação:**

  | Par | Novas |
  | --- | ---: |
  | PDF para PDF | 1 |
  | Hub para ferramenta | 3 |
  | Imagem para PDF, e de volta | 2 |
  | Calculadora para PDF, e de volta | 2 |

- **As páginas que já existiam**, antes e depois (gzip, com o inline). O número de arquivos não mudou: o `island` cresceu só com os ids e os eventos de PDF.

  | Páginas | F4 | F5a |
  | --- | --- | --- |
  | Compress image, presets, pt e es | 20,4 a 20,7 KB | 20,7 a 20,9 KB |
  | Resize image | 20,9 KB | 21,2 KB |
  | Crop image | 22,9 KB | 23,1 KB |
  | Outras de imagem | 20,4 a 20,6 KB | 20,7 a 20,8 KB |
  | Calculadoras, presets e guias | 38,0 a 38,1 KB | 38,5 KB |
  | Hubs de imagem e de dinheiro | 3,3 e 3,6 KB | 3,3 e 3,6 KB |

- **O JS inicial das páginas de imagem** não cresceu com a exportação do motor: −3 B na `/compress-image/` e −1 B na `/resize-image/` (§ 165).

## Lighthouse

No celular, mediana de 3 execuções (`pnpm verificar` local, commit `2975fc6`):

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/compress-image/` | 100 | 100 | 100 | 100 | 1,65 s | 0,001 |
| `/image-tools/` | 100 | 100 | 100 | 100 | 1,44 s | 0,000 |
| `/mortgage-calculator/` | 99 | 100 | 100 | 100 | 1,80 s | 0,001 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 100 | 100 | 100 | 1,80 s | 0,000 |
| `/compress-pdf/` (nova) | 99 | 100 | 100 | 100 | 1,82 s | 0,000 |
| `/pdf-tools/` (nova) | 100 | 100 | 100 | 100 | 1,35 s | 0,014 |

As quatro páginas que já estavam não pioraram (§ 164).

## Screenshots, ícones e peças novas

- **Onde:** `pnpm screenshots` grava em `docs/relatorios/fase-05a/componentes/`, nos dois temas, a 360 e a 1280 px. As pastas da F3 e da F4 ficaram como estavam.
- **As peças de PDF** saem do mesmo passeio de estados que o `ads.spec.ts` e o `a11y.spec.ts` olham (`tests/e2e/lib/pdf-states.ts`):
  - a lista do Merge;
  - a grade de páginas em escolha, ordem e giro;
  - o campo de senha com erro;
  - a área de assinatura nos três modos;
  - os resultados.
- **Também:** as páginas inteiras da Merge, da Compress, da Protect e da Sign, o hub, a seção de PDF da home, o rodapé e a folha com os quatro ícones novos ao lado dos vizinhos.
- **Ícones novos** (`docs/design/assets/Icons/`, § 149): `sign`, `watermark`, `page-number` e `reorder`, no estilo da pasta (grade de 24, traço 2, pontas redondas, `currentColor`). O README passou de 35 para 39.
- **Peças novas** (§ 152, § 176, § 177 e § 181):
  - **a grade de páginas:** foco itinerante, Espaço escolhe ou pega, setas movem, botões "Move earlier" e "Move later", e cada mudança dita uma vez;
  - **o campo de senha:** "Show" com `aria-pressed`, e erro como alerta com o ícone;
  - **a área de assinatura:** desenhar, enviar ou digitar. A caixa se move pelo ponteiro, pelas setas e pelos campos X, Y e largura.

## A exportação do motor de imagem

- **Caminho A** (§ 165): o site passa as URLs dos `.wasm` ao motor em tempo de execução (`configureWasm`), com o mesmo código no site e no pacote.
  - O worker mantém o nome e a saída `/_astro/worker-*.js`, e os `.wasm` são os mesmos, idênticos aos dos pacotes.
  - O worker com Comlink entra como entrada opcional do pacote (`./worker`).
- **O pacote** (`.cache/oss/fileorca-image-engine/`, 57 arquivos):
  - o código e 12 arquivos de teste (145 testes; 20 testes ficam só no site, porque dependem de fotos sem licença de redistribuição);
  - 6 de 25 fixtures, as que o `fixtures/ORIGEM.md` deixa redistribuir;
  - o `package.json` (MIT, 0.1.0, dependências exatas, nas versões do site), o `tsconfig.json`, o README com o contrato e as decisões, o LICENSE ("Copyright (c) 2026 Victor Yuki Matusita"), o THIRD-PARTY-NOTICES (libheif em LGPL-3.0, como `.wasm` à parte e trocável) e o `.gitignore`;
  - nada do site: nem GA4, nem Ko-fi, nem Pix, nem e-mail.
- **O que o CI achou** (§ 172): a exportação deixou o worker de imagem do WebKit sem as URLs, porque o WebKit avalia a entrada do worker duas vezes.
  - O CI da PR mostrou isso, e a correção entrou com testes.
  - O pacote leva a decisão no README.
- **Saída do `pnpm motor:exportar --conferir`**, depois da última mudança no motor:

```
[conferir] npm install: exit 0 in 7.5 s
[conferir] tsc --noEmit: exit 0 in 1.4 s
 Test Files  12 passed (12)
      Tests  145 passed (145)
[conferir] vitest run: exit 0 in 1.4 s
[conferir] npm install: ok | tsc --noEmit: ok | vitest run: ok
[conferir] zero: the package installs, compiles and passes its own tests outside the repository.
```

- **Para o Victor:** o passo a passo do repositório público está em `docs/lancamento/codigo-aberto.md`. O `tests/unit/oss-image-engine.test.ts` (no `verificar`) exporta duas vezes e confere a estrutura, as licenças, os imports, a ausência do site e a igualdade das cópias.

## Licenças novas

- **`pdfjs-dist` 6.4.299 (Apache-2.0):**
  - os textos dos decodificadores `.wasm` (JBIG2/CCITT do PDFium e OpenJPEG), com os das colas;
  - os CMaps;
  - as fontes Foxit;
  - o core-js 3.50.0, compilado dentro do build legacy (§ 179).
  - O texto do qcms saiu, porque o arquivo não é servido (§ 163).
- **`@neslinesli93/qpdf-wasm` 0.3.0 (ISC):** o qpdf 12.2.0 com o NOTICE, o zlib e o libjpeg-turbo 2.1.1 com o README do IJG. O pacote não traz nenhum texto, e eles saem das fontes fixadas no Dockerfile (§ 143).
- **O `gate:licencas`** confere que cada `.wasm` e cada arquivo de dados do `dist/` é idêntico ao do pacote, e que todo pacote compilado dentro de outro tem texto.

## CI

A última execução verde com código ou teste é a [run 41344610873](https://github.com/vmatusita/fileorca/actions/runs/41344610873), no commit `2975fc6`, com as 11 partes. O total é o do resumo do `verificar` de cada parte:

| Parte | Comando | Testes | Total do `verificar` | Job |
| --- | --- | --- | ---: | ---: |
| `verificar` | `pnpm verificar --sem-playwright` | tipos, lint, build, Vitest, os portões, o Lighthouse das seis URLs e o `lint:texto` | 401,0 s | 484 s |
| `playwright (chromium 1 de 3)` | `--playwright=chromium --shard=1/3` | 196 passed | 345,0 s | 428 s |
| `playwright (chromium 2 de 3)` | `--playwright=chromium --shard=2/3` | 196 passed | 292,0 s | 372 s |
| `playwright (chromium 3 de 3)` | `--playwright=chromium --shard=3/3` | 196 passed | 260,6 s | 320 s |
| `playwright (webkit 1 de 7)` | `--playwright=webkit --shard=1/7` | 84 passed | 350,3 s | 423 s |
| `playwright (webkit 2 de 7)` | `--playwright=webkit --shard=2/7` | 84 passed | 217,4 s | 294 s |
| `playwright (webkit 3 de 7)` | `--playwright=webkit --shard=3/7` | 84 passed | 143,2 s | 218 s |
| `playwright (webkit 4 de 7)` | `--playwright=webkit --shard=4/7` | 84 passed | 120,4 s | 186 s |
| `playwright (webkit 5 de 7)` | `--playwright=webkit --shard=5/7` | 84 passed | 406,1 s | 504 s |
| `playwright (webkit 6 de 7)` | `--playwright=webkit --shard=6/7` | 84 passed | 415,1 s | 483 s |
| `playwright (webkit 7 de 7)` | `--playwright=webkit --shard=7/7` | 84 passed | 322,4 s | 424 s |

- **Antes e depois:**
  - Na F4 ([run 41277648653](https://github.com/vmatusita/fileorca/actions/runs/41277648653)), as cinco partes deram 285,4 s (`verificar`), 529,4 s (Chromium) e 427,1, 273,4 e 664,2 s (WebKit), e a mais pesada ficou a 36 s do alvo de 700 s.
  - Agora a mais pesada é a parte 6 do WebKit, com 415,1 s.
  - A tabela com a divisão intermediária (Chromium em 2, WebKit em 5) está no adendo da ADR-003.
- **Minutos de runner:** a soma dos jobs desta run é 4.136 s (uns 69 min por push). Na F4 eram uns 42 min.
- **Diagnóstico do `ENOSPC`:**
  - O `core_pattern` original do runner é `|/usr/lib/systemd/systemd-coredump %P %u %g %s %t 9223372036854775808 %h %d`: os dumps iam para o `systemd-coredump` com um limite de 2^63 bytes, sem limite de fato.
  - Com o padrão em `|/bin/false`, toda parte do Playwright disse "No coredumps found.".
  - O `/` ficou com no mínimo 9.224 MB livres (Chromium 1 de 3), e a maior queda em 2 s foi de 56 MB.
  - Nenhum `ENOSPC` em nenhuma execução da PR. A hipótese da § 141 (um dump grande enchendo o disco) não foi provada nem desmentida, porque a queda não voltou; o diagnóstico fica ligado (§ 154).
- **Falhas no meio do caminho:**

  | Run | Commit | Parte | O que foi | O que mudou |
  | --- | --- | --- | --- | --- |
  | 41325449775 | `27ba055` | `verificar` | `astro check`: 10 erros de tipo no `pdf-matrix.spec.ts` (`name` opcional no `getByRole`) | um ajudante tipado (`fd4ca1a`) |
  | 41330210631 | `84bc004` | as 5 do WebKit | as ferramentas de imagem paradas no worker: os codecs liam as URLs dos `.wasm` da segunda cópia da entrada do worker (§ 172) | a segunda cópia toma as URLs, e o `EngineError` reconhece a outra cópia (`1d551fa`) |

- **Regras:** não há `skip`, `fixme`, `only`, `retries` nem `continue-on-error` novo. O `merge` espera as 11 partes e não mescla PR em rascunho nem PR que muda o pipeline.

## A revisão adversarial

Detalhe em `docs/relatorios/REVISAO-F5a.md` (§ 173).

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude | 2 | 5 | 4 | 0 |
| (b) privacidade, segurança e licenças | 0 | 1 | 2 | 2 |
| (c) anúncio e política | 0 | 0 | 1 | 3 |
| (d) acessibilidade | 1 | 4 | 7 | 0 |
| (e) desempenho e SEO | 0 | 2 | 4 | 0 |
| (f) design system | 0 | 4 | 9 | 2 |

Nenhum crítico. Os 3 altos (A-1, A-6 e D-1) e os 16 médios foram corrigidos, cada um com um teste que falha sem a correção (§ 174 a § 181). Os 27 baixos estão listados no `REVISAO-F5a.md` como pendência. As correções acharam mais dois defeitos, também corrigidos (§ 182). A segunda passada, sobre o diff das correções, achou 2 médios e 4 baixos, nenhum crítico ou alto: 4 corrigidos com teste e 2 registrados (§ 183).

## `pnpm verificar` local

No commit `2975fc6`, o último com código, sem argumento: todos os passos, em ordem, nos dois navegadores.

```
Resumo do pnpm verificar (tudo)
  ok       8.9 s  tipos (astro check)
  ok       3.6 s  lint (eslint)
  ok      14.9 s  build (astro build do zero)
  ok      30.4 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.5 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.6 s  links internos e páginas órfãs
  ok       0.7 s  conteúdo mínimo das ferramentas e do site
  ok      29.6 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.8 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.9 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     393.8 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok     212.1 s  lighthouse ci
  ok      11.8 s  lint:texto (LanguageTool)
  total 715.2 s (limite 900 s)
```

- **O Vitest:** 67 arquivos e 1.192 testes. Na F4, eram 55 arquivos e 862 testes.
- **O Playwright:** 1.176 testes nos dois navegadores, todos verdes. Na F4, eram 808.
- **O tempo:** subiu de 430,7 s, na F4, para 715,2 s, com as 12 ferramentas, a matriz completa e os estados de PDF. O limite local continua 900 s; no CI, a mesma suíte se divide em 11 partes.

## Prévia

[https://fase-05a-fileorca.vmatusita.workers.dev](https://fase-05a-fileorca.vmatusita.workers.dev).

O Workers Builds publicou a prévia até o commit `6e35bdd`. Para o `2975fc6`, ele não rodou: não há check nem linha na tabela do comentário. A prévia tem todas as correções da revisão, menos as quatro da segunda passada (§ 183). O CI do `2975fc6` está verde.

O que eu conferi nela, com um Playwright de sonda (Chromium, os domínios do Google bloqueados) e as saídas lidas no Node:

```
[prévia] build.txt: 6e35bdd8a65297b42de37aa402666a0f03f3bc1a
[prévia] /pdf-tools/: 200, 13 cartões, H1 "Free PDF tools that never upload your files"
[prévia] Merge: gen-paginas-mistas-merged.pdf, 20 páginas, qpdf --check 0
[prévia] Compress (Recomendado): 2917866 → 950328 bytes (0.326)
[prévia] Protect: gen-paginas-mistas-protected.pdf, R = 6 | stream encryption method: AESv3 | string encryption method: AESv3 | file encryption method: AESv3
[prévia] Unlock: gen-paginas-mistas-protected-unlocked.pdf, abre sem senha: true, /Encrypt: false
```

## Decisões novas

- **§ 143 a § 155:** dependências, PDF.js, metadados, numeração e marca, Compress, ilha e hub, ícones, nomes, eventos, peças novas, a exceção do "Unlock PDF" na voz, o CI e os `.wasm` do PDF.
- **§ 156 a § 172:** fixtures, endurecimento, a tabela do Compress, Protect e Unlock, home, rodapé e busca, Privacidade e Termos, os portões, o motor aberto, a privacidade, as ações do arquivo, os defeitos achados pelos testes, velocidade, orçamento e acessibilidade, as asserções que mudaram e o worker de imagem.
- **§ 173 a § 182:** a revisão e as correções.

## O que a válvula cortou

Nada. As 12 ferramentas estão no ar, e não há 5c.

## O que é do Victor, em passos

1. Ler a PR e dar o merge pelo GitHub ("Squash and merge"), com o CI verde. Depois, conferir o pós-deploy e o `build.txt`. A PR muda o `.github/workflows/ci.yml`, então o merge automático recusa, e o merge é seu.
2. Abrir três ferramentas no celular e no computador: a Merge, o Compress e a ida e volta da Protect com a Unlock.
3. No Search Console, pedir a indexação do `/pdf-tools/`, da `/compress-pdf/` e da `/merge-pdf/`.
4. Criar o repositório público do motor de imagem, pelo `docs/lancamento/codigo-aberto.md`.
5. Olhar os ícones novos e as peças novas nos screenshots (`docs/relatorios/fase-05a/componentes/`). Ajuste vira uma run curta.
6. Gerar o prompt da 5b. Não há 5c. A 2b segue pendente.
7. As pendências que seguem abertas: a § 103, os baixos da F4, os 27 baixos da F5a (`REVISAO-F5a.md`) e o `docs/F0-SAIDA.md`.
8. Os minutos do GitHub Actions: com 11 partes, cada push gasta uns 69 min de runner (veja a tabela do CI). Se o Workers Builds não publicar a prévia do último commit, confira no painel da Cloudflare.
9. Voltar o `powercfg` ao normal.

## Nota para a 5b

- **O que dá para medir por script, sem navegador:**
  - o Compress por modo (o `tests/unit/pdf-compress.test.ts` já imprime a tabela);
  - os tamanhos e o tempo de cada operação de PDF no Node;
  - as conversões de imagem pelo motor exportado (`fileorca-image-engine`, que roda no Node sem canvas);
  - a PDF to JPG por resolução pede o PDF.js no Node com o `@napi-rs/canvas`, como os testes fazem.
- **O que precisa do Playwright:** o caminho de canvas das imagens, as miniaturas e o tempo na thread principal.
- **O kit do Product Hunt** vai pedir screenshots das peças (já em `docs/relatorios/fase-05a/componentes/`), uma frase por ferramenta e a prova de privacidade (a saída do `pdf-privacy.spec.ts`).

## Nota para a F6

O PDF em português e espanhol pede:

- os textos de cada ferramenta e do painel;
- a palavra "Page" da numeração, que hoje é inglês fixo no motor;
- a cobertura do WinAnsi para a marca d'água: os acentos do português e do espanhol cabem, e as aspas curvas e o travessão viram retos (baixo A-9);
- os slugs das 12 páginas;
- o menu de idioma, que hoje leva às homes (§ 84).
