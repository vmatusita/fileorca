# Plano da F15: imagem, QR e o caminho entre ferramentas

Este plano é o gabarito da revisão adversarial final, ao lado da ficha da F15 (`PLANO-UX-QV.md`, "F15 · Imagem, QR e o caminho entre ferramentas", e as seções C e D) e do prompt da run (`docs/prompts/prompt-fase-15.txt`). Onde os três parecem divergir, vale o mais rigoroso, com um § (decisão 1 do prompt).

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `16b9b9bcd257f73c28a24970ba0e506002817697` ("Ajuste: as partes do CI depois da F14 (8 no Chromium, 14 no WebKit)", PR 30). A branch é `fase-15`; a PR é a 31, aberta em rascunho.
- **No clone, no começo:** só a pasta `Claude outputs/` sem rastreio. Os arquivos do prompt não estavam lá: o `prompt-fase-15.txt` foi gravado com o texto recebido e entrou no primeiro commit. O `git diff -- PLANO-FILEORCA.md` não mostrou diferença: o F14 m-1 continua aberto (decisão 2).
- **O `dist-base`:** a worktree `.claude/worktrees/f15-base` (destacada em `16b9b9b`), com `pnpm install --frozen-lockfile` e `pnpm build`; a cópia do `dist/` fica em `.cache/f15/dist-base`, servida por `node .cache/f15/serve-base.ts <porta>`.
- **Linha de base medida no `dist-base`** (saídas em `.cache/f15/antes/`):
  - Vitest: 131 arquivos e 2.083 testes. Um teste (`conteudo.test.ts`, "checks the ten file guides…") estourou os 5 s com o build e a medida do QR rodando ao lado; é a pegadinha conhecida da máquina carregada (`docs/claude/playwright.md`), não um defeito.
  - `playwright test --list`: 2.316 testes em 77 arquivos, por navegador.
  - `budgets.spec.ts` e `i18n-budgets.spec.ts` no Chromium: 343 de 343 verdes (`.cache/f15/antes/budgets-chromium.log`).
  - JS de `dist/_astro/`: 66 arquivos. Cada página de ferramenta de imagem, de PDF e do QR carrega 3 arquivos na primeira pintura pela contagem do script (a página, o `entry` e o chunk `island`; o `budgets.spec.ts` conta 2 arquivos JS próprios). A ilha de imagem (`island.CtnwMICb.js`) tem 61.349 B e **21.215 B com gzip**; a de PDF (`PdfIsland…heWJ2jSn.js`), 74.918 B e **23.759 B com gzip**; o QR (`QrTool…Ca8lCAeE.js`), 29.420 B e 10.796 B com gzip (`.cache/f15/antes/gzip.json`, por `node .cache/f15/gzip-sizes.mjs`).
  - **O D12 de hoje** (`node .cache/f15/qr-measure.ts`, `.cache/f15/antes/qr.json`, aviso de cookies respondido, depois de digitar um link, página no topo). No Chromium; o WebKit dá 0,5 px a menos:

    | Janela | Idioma | Fim do `textarea` | Fim do campo (com a ajuda) | Código (topo–fim) | Topo do Baixar PNG | Código acima da dobra? |
    | --- | --- | ---: | ---: | --- | ---: | --- |
    | 375 × 812 | en | 423 | 473 | 733–1.040 | 1.084 | não |
    | 375 × 812 | pt | 437 | 507 | 767–1.074 | 1.118 | não |
    | 375 × 812 | es | 457 | 527 | 787–1.094 | 1.138 | não |
    | 360 × 740 | en | 457 | 507 | 767–1.059 | 1.103 | não |
    | 360 × 740 | pt | 457 | 527 | 787–1.079 | 1.123 | não |
    | 360 × 740 | es | 457 | 527 | 787–1.079 | 1.123 | não |

    A 360 × 420 com o campo rolado ao topo da janela, nada do código fica à vista (o topo do código está a 430–450 px). O D12 do plano (pt a 375 × 812: o campo termina em 437, o QR de 769 a 1.072, o Baixar PNG em 1.118) confere a 2 px.
  - As caixas do painel do QR a 768 × 1024 e a 1280 × 800, com e sem código, nos três idiomas e nos dois navegadores, estão no mesmo `qr.json` (`layout`).

### O D7 a D12 no código do ponto de partida

- **D7** confere: as linhas da Imagem para PDF (`ImagePanel.tsx:1137`) são `div[role="listitem"]` sem botão na linha pronta; a FAQ manda começar de novo (`src/tools/image-to-pdf/i18n/pt.ts:41`).
- **D8** confere: `next: ['compress-image', 'resize-image']` (`src/tools/image/registry.ts:111`), e o tipo do `next` é `readonly ImageToolId[]`.
- **D9** confere, e há mais: o `removeItem` (`ImagePanel.tsx:556`) serve ao × de quem espera ou trabalha e à lixeira do erro, e **não refaz o pacote**: o `run()` só refaz o ZIP quando há foto a codificar (`rebuild` em `:374`), então tirar uma linha hoje deixaria o ZIP velho.
- **D10** confere: o segmento só tem `recommended` e `strong` (`src/tools/compress-image/Panel.tsx:15-27`), e a operação `{ kind: 'target', maxBytes }` é a das presets. O pt do site diz "Recomendada" (a seção D escreve "Recomendado"; vale o texto do site, § 649).
- **D11** confere: os 10 pares que saem de PDF (Dividir, Comprimir PDF, Girar e Desbloquear para o Juntar; Desbloquear para o Dividir; Excluir para o Organizar; Comprimir PDF, Numerar, Assinar e Marca d'água para o Proteger), mais a Imagem para PDF para o Juntar. Nenhum par a mais nem a menos.
- **D12** confere (acima). **Achado novo, que o plano não previa:** a 360 × 740, só mudar a ordem não basta. O campo com a ajuda termina em 527 px no pt e no es (507 no en); com o vão de 20 px de hoje e a prévia de 240 px, o código terminaria em 787 px, 47 px abaixo da dobra. A frente Q precisa de cerca de 50 px abaixo de 768 px, mais uma folga para o Linux do CI, sem tocar no desenho a partir de 768 px (§ 658).

## 2. Os § reservados

| § | Assunto | Quem escreve |
| --- | --- | --- |
| 649 | A especificação: C e D e os textos do pt como contrato; "Recomendada" | principal |
| 650 | Os planos, o `PLANO-FILEORCA.md` sem diferença e o prompt gravado | principal |
| 651 | A lista da Imagem para PDF (decisão 3) | principal, com o que a frente L medir |
| 652 | Tirar um arquivo pronto de qualquer lote (decisão 4) | principal, com o que a frente L medir |
| 653 | Os chips da Imagem para PDF (decisão 5) | principal |
| 654 | A regra nova de levar, que substitui a de "só linkam" da § 497 (decisão 6) | principal (fatia 1) |
| 655 | A chegada nas ferramentas com ação (decisão 6) | principal, com o que a frente C decidir |
| 656 | Comprimir "até um tamanho" (decisão 7) | principal, com o que a frente Q medir |
| 657 | O mínimo do "Tamanho máximo" (a medida) | frente Q |
| 658 | O QR no celular: a ordem do DOM, a grade a partir de 768 px, a ordem de Tab e as medidas abaixo de 768 px (decisão 8) | frente Q |
| 659 | As falas: uma por gesto (decisão 9) | principal |
| 660 | Os textos novos nos três idiomas, lado a lado (decisão 10) | principal (fatia 1) |
| 661 | O orçamento (decisão 11) | principal, no fechamento |
| 662 | Os anúncios e o CLS (decisão 12) | principal, no fechamento |
| 663 | Os specs novos: nomes e partes (decisão 13) | principal |
| 664 | Os testes antigos que mudaram, no formato da § 341 (decisão 13) | principal, com as notas das frentes |
| 665 | O design system: os README, antes e depois (decisão 14) | principal |
| 666 | A conferência no Linux: o rótulo `ci` não existe (decisão 18) | principal |
| 667 a 670 | Decisões próprias da frente L | frente L (nas notas) |
| 671 a 674 | Decisões próprias da frente C | frente C (nas notas) |
| 675 a 678 | Decisões próprias da frente Q | frente Q (nas notas) |
| 679 | A revisão adversarial da F15 | principal |
| 680 | As partes do CI e o custo da execução final | principal |
| 681 em diante | O que a revisão ou o fechamento pedirem | principal |

As frentes não editam o `DECISOES.md`: escrevem o texto dos § delas em `C:/Users/vmatusita/projetos/fileorca/.cache/f15/front-<L|C|Q>.md`, e o principal os põe nos números reservados na junção. Número reservado que sobrar vira "Reserva não usada (F15, frente X)", como na F14.

## 3. A interface que as frentes dividem (a fatia 1 entrega)

### Textos (`src/i18n/types.ts` e os três idiomas)

- `ImagePanelTexts.queue` ganha `moveEarlier`, `moveLater`, `moved`, `out` e `undo`, com as palavras do Juntar em cada idioma (o `remove` já existe e é igual ao do Juntar).
- `ImagePanelTexts.carry.chips` ganha `compress-pdf`, `merge-pdf` e `add-page-numbers-to-pdf`; `ImagePanelTexts.carry` ganha `linePdf` (a linha de levar com as palavras do PDF, para a Imagem para PDF).
- `PdfPanelTexts.carry.chips` ganha `merge-pdf`, `split-pdf`, `reorder-pdf-pages` e `protect-pdf` (os rótulos do pt são os da decisão 6, palavra por palavra).
- `CompressOptionsTexts` ganha `size` ("Até um tamanho"), `sizeHelp` (o `small` da terceira escolha), `maxLabel` ("Tamanho máximo"), `kb` (o sufixo), `maxHelp` (a ajuda do campo: JPG, fundo branco, a foto que já cabe), `maxInvalid` (o erro, com `{min}` e `{max}`) e `upTo` (o resumo do "Ajustar", "Até {n} KB").
- Os textos dos três idiomas estão na § 660.

### Tipos e dados

- `src/tools/image/registry.ts`: `export type PdfNeighbour = 'compress-pdf' | 'merge-pdf' | 'add-page-numbers-to-pdf'`, e `ImagePageDef.next: readonly (ImageToolId | PdfNeighbour)[]`. O valor do `next` da Imagem para PDF só muda na frente C.
- `src/tools/image/types.ts`: `ChipData.target: ImageToolId | PdfNeighbour | 'home'`; `ImagePanelData.listIcons: { chevron: string; trash: string }` (o miolo dos ícones da seta e da lixeira de fora do card, lido no build, como os `carryIcons`: um `?raw` repetido cresceria o chunk `island`).
- `src/tools/image/page.ts`: o `chipsFor` já sabe montar um chip para uma vizinha de PDF (nome do `common.tools`, ícone e categoria de `PDF_PAGES`); o `carryTo` devolve nada para ela até a frente C; o `panelData` passa os `listIcons`.

### A forma do item removido e do Desfazer (frente L)

- `m.undo: { item: Item; position: number; said: boolean } | null`, como no Juntar. O item tirado sai de `m.items`, mas **não é liberado** (o `outUrl`, a miniatura e a saída continuam vivos) até a próxima ação que muda o lote; aí o `release(item)` acontece.
- A próxima ação que muda o lote limpa o Desfazer: outra remoção, mover uma linha, mudar uma opção (`update`), arquivos novos por qualquer caminho (`startBatch`) e o Começar de novo. Baixar não limpa.
- A linha do Desfazer tem `key` própria (`out-<id>`), a mesma altura da linha que saiu, a frase "{name} saiu da lista." no `span[role="status"]` dela 50 ms depois de aparecer (como o Juntar), e o Desfazer `fo-btn--ghost` de 48 px, sem tempo marcado. O foco vai ao Desfazer; o Desfazer devolve a linha ao mesmo índice e o foco à lixeira dela.
- **As classes novas** (as listas de alvos dos anúncios as leem; nenhuma frente renomeia): `.fo-filelist__moves`, `.fo-filelist__move` (com `--up` e `--down`), `.fo-filelist__none` (o lugar vazio de 48 px), `.fo-filelist__remove` (a lixeira de fora do card) e `.fo-filelist__undo` (a linha do Desfazer). A lista da Imagem para PDF é `ol.fo-filelist` com `li.fo-filelist__row`.

### A chave do pacote (frente L)

- PDF: o tamanho de página e a ordem dos ids das linhas prontas (`<pdfSize>|<id>,<id>,…`); ZIP: a ordem dos ids das linhas prontas. O `run()` refaz o pacote quando há foto a codificar **ou** quando a chave de agora difere da do pacote que existe (também com dois ou mais prontos e nenhum pacote; com um pronto e um pacote de ZIP, o pacote some). O PDF lê a ordem da lista no momento em que é montado e compara a chave depois de montar: mudou no meio, monta de novo.
- O `m.bundle` mantém a forma de hoje (`kind`, `blob`, `url`, `name`, `key`): a frente C lê o `blob` e o `name` do PDF para o chip que leva.

### A regra de levar (§ 654)

- O chip leva quando o destino aceita o que a página faz (`takes()` com os `accepts` dos registros; no cliente, o `carries()` com os formatos do resultado de agora), rode ele sozinho ou espere a ação. Nunca leva: a partir do Proteger (o PDF sai cifrado); de uma página que faz PDF para uma ferramenta de imagem; de uma página que faz imagem para uma ferramenta de PDF que não aceita imagem. O destino de um arquivo só (`files: 'single'`) recebe um.
- No build, o `carryOf` (PDF) e o `carryTo` (imagem) deixam de exigir `run: 'auto'`; o rótulo do chip tem de existir nos textos (sem rótulo, o chip só linka).

## 4. As frentes, os donos e a ordem

### Fatia 1 (principal, na `fase-15`)

Os textos novos (tipos e três idiomas), o `PdfNeighbour`, o `ChipData.target`, os `listIcons`, o `chipsFor` que já sabe montar a vizinha de PDF, a § 654 (a regra) e a § 660 (os textos), e as § 649 e 650. Commit e push; o job leve tem de ficar verde.

### Fatia 2: três frentes `opus`, cada uma na sua worktree, a partir do commit da fatia 1

**Frente L (a lista e o lote): os itens 1 e 2.**
- Dona de: `src/tools/image/ImagePanel.tsx` (o `Model`, o `Item`, o `run`, o `assemble`, o `finish` e o `hush`, o `removeItem` e os novos `removeRow`, `undoRemove` e `moveItem`, o `rowProps`, a lista e o "Show N more", o foco, o `showQueue` e o `deliverable` de dois para um, o `selected` do Cortar), um módulo puro novo `src/tools/image/batch.ts` (mover, tirar, a chave do pacote; importado estaticamente: nenhum arquivo JS novo), o CSS da lista e das linhas (`.fo-filelist*`, `.fo-queue*`), e o `src/tools/image-crop` só se o Cortar pedir.
- Não toca: o bloco dos chips do resultado (`outgoing`, `takes`, `filesFor`, `carryLine`, `ChipRow`, `CarryLine`, a cópia escondida da faixa), que é da C.
- Testes: `tests/e2e/image-list.spec.ts` (critérios 1 e 2), `tests/unit/image-batch.test.ts` (a lógica pura), a lista da Imagem para PDF no `tool-slot.spec.ts` (CLS), no `tool-slot-axe.spec.ts` (axe) e no `ads.spec.ts` (150 px, com a linha do Desfazer), as listas de alvos (`ad-clearance.ts` e `ad-map.ts`), e os testes antigos que a lista muda (`tool.spec.ts:188`, `image-crop.spec.ts` na ordem de Tab do lote de 2), com a nota de cada um para a § 664.

**Frente C (o caminho entre ferramentas): os itens 3 e 4.**
- Dona de: `src/tools/image/registry.ts` (o `next` da Imagem para PDF), `src/tools/image/page.ts` (`carryTo`, `originsOf`), `src/tools/image/inbox.ts` (só se a forma do `Outgoing` pedir), o bloco dos chips do resultado no `ImagePanel.tsx` (o PDF no `outgoing`, a linha `.fo-carry` com `linePdf`, a cópia escondida), `src/tools/pdf/page.ts` (`carryOf`, `pdfOriginsOf` com a Imagem para PDF), `src/tools/pdf/PdfPanel.tsx` (a chegada nas ferramentas com ação: o `addFiles`, a frase de chegada uma vez, a nota de origem e o `m.from` do Juntar ao somar ou tirar, a caixa vazia) e `src/share/logic.ts` só se a regra pedir (sem mudar o `takes()`).
- Testes: `tests/unit/handoff.test.ts` (a tabela dos pares, as origens, a Imagem para PDF), um Vitest do critério 3 (os chips da Imagem para PDF levam a ferramentas de PDF que existem em en, pt e es), `tests/e2e/handoff-action.spec.ts` (o critério 4: a chegada no Juntar, no Dividir, no Organizar páginas e no Proteger, nos dois navegadores, esperando a ação e dando o resultado; a privacidade da caixa e da aba; o Proteger que não leva), o caso novo no `pdf-privacy.spec.ts` e no `launch-claims.spec.ts`, a chegada no Juntar e no Proteger no `tool-slot.spec.ts` (CLS) e no `tool-slot-axe.spec.ts`, e o `image-texts.test.ts` (o `blurbOf` dos alvos de PDF), com a nota de cada teste mudado.

**Frente Q (o Comprimir e o QR): os itens 5 e 6.**
- Dona de: `src/tools/compress-image/Panel.tsx`, o CSS do segmento (`.fo-seg*`, com escopo) e do QR (`.fo-qr*`), `src/tools/qr-code-generator/QrPanel.tsx`.
- Testes: `tests/e2e/image-target.spec.ts` (o critério 5 e a medida do mínimo nos dois navegadores, com a `jpg-01-pixel2-retrato-gps.jpg` e a `gen-grande-4100x4100.jpg`; o valor 217 fora da URL, do `dataLayer` e do storage; o segmento de três a 320 px nos três idiomas), `tests/e2e/qr-layout.spec.ts` (o critério 6: a 360 × 740 nos três idiomas, a 360 × 420, a ordem de Tab, as caixas a 768 e a 1280 com e sem código), o script `.cache/f15/qr-shots.ts` (a captura do painel no `dist-base` e no novo, `maxDiffPixels: 0`), um Vitest da lógica (`tests/unit/compress-target.test.ts`: o mínimo, o máximo, o resumo "Até {n} KB" nos três idiomas, a operação), o Comprimir em "Até um tamanho" e o QR no `tool-slot.spec.ts` (CLS), no `tool-slot-axe.spec.ts` e no `ads.spec.ts`.

**Os arquivos de teste que duas frentes tocam** (`tool-slot.spec.ts`, `tool-slot-axe.spec.ts`, `ads.spec.ts`, `lib/ad-clearance.ts`, `lib/ad-map.ts`): cada frente acrescenta um bloco `test.describe` próprio no fim do arquivo (ou uma entrada na lista), sem mexer no que já existe; a junção resolve os conflitos de fim de arquivo. Ajudantes que mais de uma frente quer (o espião de `Worker` com contagem de mensagens, a gravação da região com `MutationObserver`, o `watchShifts` do CLS) vão em `tests/e2e/lib/` com nome de arquivo por frente (`lib/workers.ts` da L, `lib/status.ts` da L, `lib/shifts.ts` da Q); a C usa os da L depois da junção ou copia o que precisar no próprio spec.

**O principal, ao mesmo tempo, na `fase-15`:** os textos das páginas (a FAQ e o "Como funciona" da Imagem para PDF; o "Como funciona", a especificação, a frase das presets e a FAQ do Comprimir; as frases desmentidas que o `grep` achou), os README do `docs/design/`, o `docs/claude/`, o `docs/PENDENCIAS.md` e os §. Nenhuma frente edita esses arquivos; uma frente que precisar de uma mudança de texto a escreve nas notas.

### Fatia 3 (principal): a junção

`git merge --no-ff -F <arquivo>` de L, depois C, depois Q, com o trailer `Co-Authored-By`; o `pnpm tipos` verde; os specs das três frentes nos dois navegadores; os de anúncio no build de teste. A conferência no Linux não acontece: o rótulo `ci` não existe (`gh label list`), e criá-lo é do Victor (§ 666); a execução final faz esse papel.

### Fatia 4 (principal): o fechamento

O orçamento contra o `dist-base` (arquivo a arquivo e o gzip de cada ilha), o CLS do guia das fotos num PDF no `dist-base` e no novo (F13b g-1), as imagens de `docs/relatorios/fase-15/` (`.cache/f15/shots.ts`) e as tabelas do relatório.

## 5. Cada critério, o teste e o comando

| Critério (ficha e prompt) | Prova | Controle negativo no `dist-base` |
| --- | --- | --- |
| 1. A lista da Imagem para PDF: setas pelo toque e pelo teclado, o arrastar, a ordem do PDF lida no Node com o PDF.js, mover e tirar depois do resultado refazem só o PDF | `image-list.spec.ts` (três fotos fora de ordem: `gen-jpg-01-orientacao6.jpg`, `gen-webp-exif-gps.webp`, `gen-png-transparente.png`; "Tamanho da imagem"; o espião de `Worker` conta 0 mensagens ao `fileorca-image` e ≥ 1 ao `fileorca-pdf` depois do gesto) | as setas e a lixeira não existem: o spec reprova ao procurar o botão "Move … up" |
| 2. A lixeira com Desfazer em toda linha pronta; o ZIP refeito com um a menos, sem codificar; de dois para um | `image-list.spec.ts` (Comprimir e Redimensionar com 3 arquivos; `readZip` no Node; o espião; o Desfazer devolve a linha e o foco à lixeira; de dois para um, a lista à vista e o Baixar do arquivo que ficou; o Cortar passa a escolha) e `tests/unit/image-batch.test.ts` | a linha pronta não tem "Remove …" |
| 3. Os chips da Imagem para PDF levam a ferramentas de PDF que existem nos três idiomas | `tests/unit/handoff.test.ts` (ou um Vitest próprio) sobre o registro e as rotas | o `next` de hoje aponta para ferramentas de imagem |
| 4. O chip leva ao Juntar, ao Dividir, ao Organizar páginas e ao Proteger, nos dois navegadores; nada sai do aparelho; o Proteger não leva | `handoff-action.spec.ts`, `handoff.test.ts`, o caso novo do `pdf-privacy.spec.ts` e do `launch-claims.spec.ts` | o chip não tem `data-carry` nesses destinos |
| 5. "Até 200 KB" com a foto de 12 MP e o PNG com transparência: ≤ 200.000 B, JPG, a nota de fundo branco; o 217 fora da URL, do `dataLayer` e do storage | `image-target.spec.ts` (dois navegadores) e `tests/unit/compress-target.test.ts` | a terceira escolha não existe |
| 6. O QR a 360 × 740: o código inteiro acima da dobra em en, pt e es e o Baixar PNG a ≤ 200 px abaixo dela; a 360 × 420, a metade de cima do código à vista; a 768 e a 1280, as caixas iguais às do `dist-base` a 0,5 px e a captura sem pixel diferente | `qr-layout.spec.ts` (dois navegadores; com `QR_BASE` apontando o servidor do `dist-base`, ele compara as caixas uma a uma; sem ele, compara com as relações do desenho de hoje) e `.cache/f15/qr-shots.ts` (`maxDiffPixels: 0`) | o código termina 47 px abaixo da dobra no pt (tabela da seção 1) |
| 7. CLS 0 sem gesto; anúncios verdes; orçamento; Lighthouse; `pnpm verificar` | `tool-slot.spec.ts` (a lista da Imagem para PDF, o Comprimir em "Até um tamanho", a chegada no Juntar e no Proteger, o QR), `layout-shift.spec.ts` sem mudar número, `ads.spec.ts`, `fo-ad-map.spec.ts`, `ads-coffee.spec.ts`, `clearance.spec.ts`, `budgets.spec.ts`, `i18n-budgets.spec.ts`, `.cache/f15/gzip-sizes.mjs`, `pnpm verificar --partes` e o CI completo | — |
| Nada sai do aparelho; nada na URL, no histórico, no storage ou no GA4 | `image-privacy.spec.ts`, `pdf-privacy.spec.ts`, `launch-claims.spec.ts`, `handoff.spec.ts`, `handoff-action.spec.ts`, `events.spec.ts`, `image-target.spec.ts` | — |
| Textos | `pnpm lint:texto` (0 erro), `gate:conteudo`, `english-leak.test.ts`, `glossary.test.ts`, `image-texts.test.ts`, `claude-md.test.ts`, `pendencias.test.ts` | — |
| A lógica pura | `tests/unit/image-batch.test.ts` (mover, tirar, a chave), `tests/unit/handoff.test.ts` (a tabela dos pares), `tests/unit/compress-target.test.ts` (mínimo, máximo, resumo nos três idiomas) | — |

## 6. Os specs novos e as partes do CI

Os tempos de teste são da execução completa `42688966415` (`.cache/f14/ci-durations-30.json`), e as partes são as do `ci.yml` (8 no Chromium, 14 no WebKit, `--shard`, que corta por contagem na ordem dos nomes). O alvo é 700 s por parte.

| Spec | Cai em | Folga hoje (verificar no CI) |
| --- | --- | --- |
| `handoff-action.spec.ts` (antes do `handoff.spec.ts`) | Chromium 4, WebKit 7 | 437 a 498 s; 280 a 321 s |
| `image-list.spec.ts` (entre `image-crop` e `image-matrix`) | Chromium 6, WebKit 9 | 443 a 455 s; 320 s |
| `image-target.spec.ts` (entre `image-smoke` e `institutional`) | Chromium 6, WebKit 10 | 443 a 455 s; 342 a 384 s |
| `qr-layout.spec.ts` (depois do `qr-code`) | Chromium 8, WebKit 13 | 372 a 391 s; 238 a 244 s |
| blocos novos no `tool-slot.spec.ts`, no `tool-slot-axe.spec.ts` e no `ads.spec.ts` | Chromium 1, 2 e 8; WebKit 2, 3 e 14 | todas abaixo de 520 s |

A parte 4 do WebKit (a do `clearance.spec.ts`) já passava de 700 s antes da F15 (782,4 s na `42688966415`; F14 m-5): ela não é "por causa dos specs desta run". Os testes novos depois do `clearance` empurram as fronteiras para a frente e podem levar a ela uns poucos testes do fim do `clearance`; a medida da execução final decide (§ 680). Depois de dar os nomes, `node .cache/f14/part-files.mjs .cache/f14/ci-durations-30.json <projeto> <n>` mostra as partes (os specs novos com 0 s; a estimativa vai na § 663).

## 7. Riscos que o plano já vê

- **O QR a 360 × 740** (seção 1): a frente Q precisa de uns 50 px abaixo de 768 px, com folga para uma linha a mais da fonte do Linux nos três idiomas.
- **O resultado na tela até o PDF novo:** uma reexecução só do pacote não pode trocar o cartão pelo WaterLevel nem tirar a faixa do lugar (`hadCard`).
- **A fala do Desfazer:** a decisão 9 diz "pela região", e a 4 e o Juntar dizem "pela linha do Desfazer". Fica a do Juntar (o `span[role="status"]` da linha), e a região da ilha cala nesse gesto (§ 659); o teste conta as falas das duas.
- **O erro do campo do Comprimir** fala pelo `role="alert"` do `NumberField` de hoje, não pela região (§ 659).
- **A parte 4 do WebKit** (seção 6).
- **A máquina carregada:** três frentes com Playwright ao mesmo tempo; cada worktree usa o próprio `FO_PORT` (L 4175, C 4176, Q 4177; o principal, 4174) e `--workers=2`.
