# F14 · relatório

A primeira das cinco runs do `PLANO-UX-QV.md` ("Páginas de PDF à vista"), com a ficha no plano (a ficha da F14 e as seções A e B) e o prompt em `docs/prompts/prompt-fase-14.txt`; o plano da run está em `docs/relatorios/fase-14-plano.md`. Ponto de partida: `b7a6396` (o ajuste-home-cards mesclado, PR 28). PR: [vmatusita/fileorca#29](https://github.com/vmatusita/fileorca/pull/29). Prévia: https://fase-14-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio).

## Resumo

1. A miniatura de cada página mostra a página inteira, em pé, deitada ou girada (antes perdia os 22 a 29 % de baixo de toda página em pé), e a grade tem "Pequenas" e "Grandes", com as figuras desenhadas na largura que a tela mostra.
2. A lupa de cada página abre a página grande dentro da própria ferramenta, com Anterior, Próxima, Ampliar e a ação da ferramenta (tirar, marcar, assinar, girar), pelo toque, pelo arrasto e pelo teclado, sem camada por cima da página e sem nada na URL.
3. No Excluir, a página marcada mostra que sai (a lixeira no círculo e a página apagada); Shift+clique e "Inverter seleção" marcam muitas de uma vez; as ações em lote e o giro falam uma vez só.
4. Todo resultado que é um PDF só e sem senha tem "Ver o PDF novo", e cada arquivo do Juntar tem "Ver páginas".
5. Com 300 páginas, um toque gasta menos de um terço do script de antes, e o worker do PDF.js de um arquivo que saiu não fica mais vivo no Safari do Windows.

## O que entrou, por item da ficha

### 1. O corte (D1) (§ 618)

- `src/tools/pdf/grid-math.ts` (novo): `quarters`, `pageRatio`, `sheetRatio` (a proporção como a página vai sair, com o `/Rotate` e os giros, limitada a [0,5; 2]).
- `src/tools/pdf/PageCell.tsx` (novo): a folha com `--sheet-ratio`, a `img` em "contain"; o selo do giro dentro da folha.
- `src/styles/components.css`: a folha com a proporção, o fio `hairline`, a `img` em posição absoluta, a caixa trocada no giro ímpar (com `max-width: none`), as folhas de uma linha em pé sobre a linha dos números.
- Testes: `tests/e2e/island-pdf-grid.spec.ts` ("criterion 1"), `tests/unit/pdf-grid-math.test.ts`.

### 2. A lupa e a vista da página (§ 621, § 624, § 639 a § 642)

- A lupa: `PageCell.tsx` (`.fo-page__zoom`, irmã do botão da página, só a da célula ativa no Tab); o ícone `zoom` (`docs/design/assets/Icons/zoom.svg`, `src/icons/svg.ts`, `src/tools/pdf/page.ts`, `PdfIcons`).
- A vista: `src/tools/pdf/PageView.tsx` (novo), no lugar da grade em `PageGrid.tsx` (a prop `view` nos cinco usos de `tools.tsx`), com o título `h2`, Ajustar e Ampliar, Anterior, a ação e Próxima, as teclas, o arrasto, as três imagens grandes e as falas; a memória do módulo que a reabre depois do primeiro giro do Girar.
- Testes: `island-pdf-view.spec.ts` (critérios 2, 3 e 5), `island-pdf-view-axe.spec.ts` (critério 11), o bloco novo do `ads.spec.ts` (critério 4).

### 3. Pequenas e Grandes (§ 619)

- `PageGrid.tsx`: o `OptionGroup` acima da grade, a escolha na memória do módulo, a largura pedida medida (`askWidth`, um `ResizeObserver`); `PageCell.tsx`: o `Thumb` pede e solta com a mesma largura.
- Testes: `island-pdf-grid.spec.ts` ("section B"), `engine-paths.spec.ts` e `pdf-pieces.spec.ts` (§ 636).

### 4. O Excluir mostra o que sai (§ 627)

- `PageCell.tsx` (a lixeira no círculo, `data-leaving`), `PageGrid.tsx` (o nome ", sai", a contagem `countOf`), `grid-math.ts` (`leavingCount`, `countOf`), o CSS (a página a 40 %).
- Testes: `island-pdf-marking.spec.ts`, `pdf-grid-math.test.ts`.

### 5. Shift+clique e Inverter seleção (§ 622 e § 628)

- `PageGrid.tsx`: o `onSelect` no lugar do `onToggle`, `onSelectAll` e `onSelectNone`; a âncora num lugar só; o `extend` (Shift+clique e Shift+Espaço), o Inverter; `grid-math.ts`: `span`, `spanned`, `inverted`, `setOf`; `tools.tsx`: o `selected` pelo `setOf`.
- Testes: `island-pdf-marking.spec.ts`, `pdf-grid-math.test.ts`.

### 6. "Ver o PDF novo" (§ 625)

- `src/tools/pdf/PdfPanel.tsx`: o botão depois do "Começar de novo" quando o resultado é um PDF só e a operação não é `protect`; a vista do resultado como o primeiro item da faixa, com o `inspect()` dos bytes de saída, um cache próprio (`pictures()`, chave `r<n>`) e o `release()` ao voltar, no Começar de novo, a cada execução nova e numa mudança das opções.
- Testes: `island-pdf-result.spec.ts` (critério 6, nas 12 ferramentas e nos três idiomas).

### 7. Juntar: "Ver páginas de {name}" (§ 626)

- `PdfPanel.tsx`: o botão em cada linha lida (48 px, embaixo do card abaixo de 480 px), a vista do arquivo com as caixas da leitura (chave `m<n>`), o `release()` ao voltar e quando a linha sai (também com o Desfazer à espera). A válvula não foi usada: o item entrou.
- Testes: `island-pdf-result.spec.ts`, `island-pdf-workers.spec.ts`.

### 8. Desempenho e memória (§ 620, § 630, § 631 e § 632)

- E-2: a célula com `memo` (`PageCell` com `shouldComponentUpdate`, as `actions` feitas uma vez).
- E-4: `src/engine/pdf/pdfjs.ts` (o `close()` do `openForDrawing` destrói o documento, o `PDFWorker` e termina a porta, também no ramo de erro), `src/tools/pdf/client.ts` (uma época por id).
- E-5: já corrigido no código (§ 631), foi para "Já corrigidos".
- Testes: `island-pdf-workers.spec.ts`; a medida do E-2 em `.cache/f14/e2.ts`.

### 9. As falas (§ 629)

- `PageGrid.tsx` (as ações em lote, o Shift, a ação da vista), `tools.tsx` (o `RangePicker` diz a contagem), `PdfPanel.tsx` (o `hush`: o giro não repete o "Done!").
- Testes: `island-pdf-marking.spec.ts`, `island-pdf-view.spec.ts` (critério 3), com `MutationObserver` na região.

### 10. Os textos (§ 623)

- `src/i18n/types.ts` e `src/tools/pdf/i18n/{en,pt,es}.ts` (o bloco `grid` e o `view`); os passos "Como funciona" das cinco ferramentas da grade e o FAQ "Dá para desfazer?" do Excluir (D6), nos três idiomas; os glossários `docs/i18n/pt.md` e `es.md`.

### 11. Os documentos (§ 617 e § 637)

- `docs/design/components/PageView/` (README e preview), a regra "Ícone sozinho" do `docs/design/README.md` (e do README dos ícones e do Button), os README do ResultCard e do FileCard, o índice dos componentes; as seções F14 de `docs/claude/pdf.md`, `playwright.md` e `anuncios.md`; o `PLANO-UX-QV.md` commitado sem mudança (`f0cd0ce`); a linha do `CLAUDE.md`. O `PLANO-FILEORCA.md` não tinha a linha do Victor e o `.claude/settings.json` nega a edição: ficou como estava, com a linha "Victor faz" no grupo 24 (F14 m-1).

### 12. As pendências

- `docs/PENDENCIAS.md`: F5a E-2, E-4, E-5 e F4-F7 d-2, d-8 em "Já corrigidos"; o grupo 24 "O que a F14 deixou" com o D16 (Victor decide), o "JPG to PDF" (run de SEO), a linha do `PLANO-FILEORCA.md` (Victor faz) e duas sobras de antes da F14 que as frentes acharam (o foco no `body` depois do primeiro giro do Girar sem a vista, F14 m-2; as duas falas ao mover uma linha do Juntar depois do resultado, F14 m-3); o Resumo e o Total (190 linhas).

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | A `img` cabe na folha e ocupa ≥ 95 % do "contain", nas cinco ferramentas, em pé, deitada e com `/Rotate 90`, e no Girar depois de 1 e de 3 giros, nos dois navegadores | `island-pdf-grid.spec.ts`, "criterion 1" (7 testes por navegador) | passa nos dois; de 100,0 a 101,0 % do encaixe. Controle negativo contra o `dist-base`: os 7 reprovam, por exemplo "sign-pdf, page 1: the picture 96.3125 × 124.421875 fits in its sheet 96.328125 × 96.328125 — Expected: true, Received: false" |
| 2 | A vista abre pela lupa nas cinco; largura natural ≥ CSS × DPR; 360 × 740: ≥ 300 px em Ajustar e ≥ 600 px em Ampliar; 1280 × 800: página e barras na janela, página ≥ 520 px; ← → Home End Esc; arrasto de 48 px | `island-pdf-view.spec.ts` | passa nos dois. Medido: a 360 × 740 com DPR 2, a página tem 328 px em Ajustar e 656 px em Ampliar, com a imagem de 660 e 1.320 px naturais; a 1280 × 800, a moldura tem 417 × 540 px e as barras vão de 33 a 709 px. Controle negativo: "locator.click: Test timeout of 60000ms exceeded" (não há lupa) |
| 3 | Marcar ou girar na vista muda a grade e a contagem, com uma fala; no Girar, o giro acumulado | `island-pdf-view.spec.ts`, "criterion 3" (Excluir, Dividir, Assinar e Girar) | passa nos dois; uma mudança da região por gesto, e a fala é a contagem que a barra mostra; no Girar, só a frase do giro (sem o "Done!") e a imagem a 90° e 180° |
| 4 | Com a vista aberta nos dois modos, 150 px de todo anúncio a 360 × 740 e a 1280 × 800; nada sobre a âncora simulada | `ads.spec.ts`, o bloco da F14 (8 testes por navegador, no build de teste) | passa nos dois; a menor distância é 150 px (a borda da coluna, a 1280) e 528 px a 360 (tabela abaixo); em 40 pontos da âncora o `elementFromPoint` dá a âncora; o mutante `.fo-pview__bar { position: relative; z-index: 1 }` reprova (12 de 40 pontos). `fo-ad-map`, `ads-coffee` e `clearance` verdes (606 de 606 com o `ads` e o `layout-shift`) |
| 5 | Da lupa até a imagem grande, nenhum layout-shift sem gesto (Chromium) | `island-pdf-view.spec.ts`, "criterion 5" (caminho da página, CPU 20×, a imagem chega de 773 a 1.690 ms depois do toque) | passa; mutante (a folha sem proporção) mede `[0.0312, 0.0943]` e reprova (§ 641) |
| 6 | "Ver o PDF novo" em todo PDF só sem cifra (o Dividir com uma parte inclusive), nunca no Proteger, no PDF para JPG nem com ZIP; o retângulo de 356/340 px a 320, 360 e 1280 nos três idiomas | `island-pdf-result.spec.ts` (as 12 ferramentas × 3 idiomas) | passa nos dois; o botão cabe na linha (a 320, o es usa 251 de 252 px) e, quebrada em duas de propósito, o retângulo continua igual. Controle negativo: "Expected: 1, Received: 0" (o botão) |
| 7 | A lupa não intercepta a `img` nem o check, 48 px, de 320 a 1280, com 3 dígitos | `island-pdf-grid.spec.ts`, "criterion 7" (`gen-paginas-300`, Excluir e Reorganizar, 320, 360, 768 e 1280 px, páginas 1, 10, 100 e 300) | passa nos dois; controle negativo: "Cannot read properties of null (reading 'getBoundingClientRect')" (não há lupa) |
| 8 | E-2: `ScriptDuration` ≤ metade; E-4: nenhum worker do PDF.js do arquivo anterior sem `terminate` | `.cache/f14/e2.ts` (§ 632); `island-pdf-workers.spec.ts` | E-2: razão 0,317 e 0,289 em duas rodadas, com o controle base contra base em 0,971 e 1,001 (tabela abaixo). E-4: passa nos dois (trocar de arquivo, voltar ao primeiro, Começar de novo, PDF para JPG, as vistas do Juntar e do resultado); controle negativo: "after another file: the PDF.js workers of the file before are terminated — Expected: 0, Received: 1" |
| 9 | Shift+clique marca da âncora até a página; sem âncora vale como clique; com a fala | `island-pdf-marking.spec.ts`, `pdf-grid-math.test.ts` | passa nos dois; controle negativo: "Expected: 'Pages 2 to 5 picked', Received: '1 PDF ready'" |
| 10 | JS inicial ≤ +8 KB com gzip, mesmos arquivos e requisições | `budgets.spec.ts` e `i18n-budgets.spec.ts` sem mudar número; `.cache/f14/gzip-sizes.mjs` | +3.896 B (o arquivo da ilha de PDF +3.892 B, o compartilhado +4 B); 2 arquivos e 6 requisições em toda página de PDF, como antes (tabela abaixo) |
| 11 | axe com a vista aberta nos dois temas e nos dois navegadores; Lighthouse ≥ 90; `pnpm verificar` verde | `island-pdf-view-axe.spec.ts`; `pnpm verificar --partes`; o CI | sem violação nos dois temas, a 360 e a 1280, nos dois navegadores; o Lighthouse e o `verificar` abaixo |

E os critérios do prompt: o CLS sem gesto continua 0 (o `tool-slot.spec.ts`, o `layout-shift.spec.ts` e os CLS do `pdf-merge.spec.ts` passam); nada sai do aparelho nem vai para a URL, o histórico, o storage ou o GA4 (o `pdf-privacy.spec.ts` e o `events.spec.ts` passam com a vista no caminho, e o `launch-claims.spec.ts` passa); a matriz de PDF passa inteira, sem nenhum esperado mudado (só o texto da contagem do Excluir, § 636); o `lint:texto` dá 0 erro (18 arquivos, 1.377 textos, 432 avisos), e o `english-leak`, o `glossary`, o `claude-md` e o `pendencias` passam.

## As tabelas

### O D1, antes e depois (a `gen-paginas-mistas`, `.cache/f14/d1.ts`, Chromium, DPR 1; o "depois" medido no `dist/` da fatia 1, e a geometria das células não mudou mais: o `island-pdf-grid.spec.ts` passa no fim)

| Ferramenta e largura | Antes: páginas cortadas | Antes: o pior corte | Depois: páginas inteiras | Depois: menor fração do encaixe |
|---|---|---|---|---:|
| delete-pdf-pages a 360 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| split-pdf a 360 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| rotate-pdf a 360 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| rotate-pdf a 360, depois de 1 giro da página 1 px | 4 de 8 (1, 2, 6, 7) | 34 % (página 1) | 8 de 8 | 100,0 % |
| rotate-pdf a 360, depois de 3 giros da página 1 px | 4 de 8 (1, 2, 6, 7) | 34 % (página 1) | 8 de 8 | 100,0 % |
| sign-pdf a 360 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| reorder-pdf-pages a 360 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| delete-pdf-pages a 1280 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| split-pdf a 1280 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| rotate-pdf a 1280 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| rotate-pdf a 1280, depois de 1 giro da página 1 px | 4 de 8 (1, 2, 6, 7) | 34 % (página 1) | 8 de 8 | 100,0 % |
| rotate-pdf a 1280, depois de 3 giros da página 1 px | 4 de 8 (1, 2, 6, 7) | 34 % (página 1) | 8 de 8 | 100,0 % |
| sign-pdf a 1280 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |
| reorder-pdf-pages a 1280 px | 4 de 8 (1, 2, 6, 7) | 29 % (página 2) | 8 de 8 | 100,0 % |

As páginas 1, 2, 6 e 7 da `gen-paginas-mistas` ficam em pé (Carta, A4, Carta com `/Rotate 180` e 432 × 576); a 3, a 4, a 5 e a 8 ficam deitadas. No ponto de partida, a `img` de 96 × 124 px ficava numa folha de 96 × 96 a 1280 (138 × 178 em 138 × 138 a 360).

### A vista (Excluir, página 1, Carta em pé; px CSS; Chromium e WebKit do Windows dão as mesmas caixas)

| Janela | Modo | Barra de cima | Moldura | Folha | Barra de baixo | Imagem (natural / CSS) |
|---|---|---|---|---|---|---|
| 360 × 740, DPR 2 | Ajustar | 328 × 88 | 328 × 424 | 328 × 424 | 328 × 120 (duas linhas) | 660 × 854 / 328 |
| 360 × 740, DPR 2 | Ampliar | 328 × 88 | 328 × 555 (rola) | 656 × 849 | 328 × 120 | 1.320 × 1.708 / 656 |
| 1280 × 800, DPR 1 | Ajustar | 758 × 56 | 417 × 540 | 417 × 540 | 758 × 56 | 420 × 543 / 417 |
| 1280 × 800, DPR 1 | Ampliar | 758 × 56 | 758 × 600 (rola) | 1.516 × 1.962 | 758 × 56 | 1.560 × 2.018 / 1.516 |

### O E-2 (ms de script da thread principal por toque; `gen-paginas-300`, Excluir, 1280 × 800)

| Rodada | Base: média (desvio) | Nova: média (desvio) | Base 2: média (desvio) | Nova ÷ base | Base 2 ÷ base |
|---|---:|---:|---:|---:|---:|
| 1 | 3,671 (1,217) | 1,162 (0,370) | 3,563 (1,468) | 0,317 | 0,971 |
| 2 | 3,692 (1,891) | 1,069 (0,358) | 3,694 (1,323) | 0,289 | 1,001 |

As 20 medidas de cada lado, da rodada 1:

| Toque | Base | Nova | Base 2 |
|---:|---:|---:|---:|
| 1 | 5,724 | 1,565 | 5,684 |
| 2 | 3,919 | 1,568 | 3,297 |
| 3 | 4,472 | 1,747 | 7,012 |
| 4 | 3,125 | 0,738 | 3,944 |
| 5 | 4,422 | 1,095 | 3,599 |
| 6 | 3,869 | 0,908 | 3,391 |
| 7 | 5,621 | 1,807 | 5,59 |
| 8 | 2,064 | 0,695 | 2,399 |
| 9 | 4,991 | 1,233 | 4,1 |
| 10 | 2,71 | 0,85 | 1,847 |
| 11 | 3,526 | 1,252 | 5,29 |
| 12 | 1,939 | 0,632 | 2,291 |
| 13 | 4,886 | 1,242 | 3,295 |
| 14 | 2,014 | 1,124 | 1,877 |
| 15 | 3,416 | 1,653 | 3,213 |
| 16 | 3,503 | 1,281 | 2,832 |
| 17 | 3,408 | 1,226 | 4,739 |
| 18 | 1,846 | 0,582 | 1,9 |
| 19 | 5,06 | 1,115 | 3,153 |
| 20 | 2,901 | 0,935 | 1,803 |

### O orçamento, por página (o `budgets.spec.ts` e o `i18n-budgets.spec.ts`, Chromium; JS inicial com gzip, arquivos JS, requisições)

| Página | Antes: JS inicial, arquivos, requisições | Depois: JS inicial, arquivos, requisições |
|---|---|---|
| `/add-page-numbers-to-pdf/` | 45,2 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/compress-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/delete-pdf-pages/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/comprimir-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/es/desbloquear-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/es/dividir-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/eliminar-paginas-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/firmar-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/guias/dividir-pdf-y-tamano-del-archivo/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/es/guias/por-que-mi-pdf-pesa-tanto/` | 45,4 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/es/guias/resolucion-de-pdf-a-jpg/` | 45,4 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/es/guias/unir-pdf-en-el-celular/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/es/herramientas-pdf/` | 5,2 KB, 0, 4 | 5,2 KB, 0, 4 |
| `/es/marca-de-agua-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/numerar-paginas-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/es/ordenar-paginas-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/pdf-a-jpg/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/es/proteger-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/es/rotar-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/es/unir-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/guides/combine-pdfs-on-phone/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/guides/pdf-to-jpg-resolution/` | 45,3 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/guides/split-pdf-file-size/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/guides/why-is-my-pdf-so-large/` | 45,3 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/merge-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pdf-to-jpg/` | 45,2 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pdf-tools/` | 5,1 KB, 0, 4 | 5,1 KB, 0, 4 |
| `/protect-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/assinar-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/comprimir-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pt/desbloquear-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pt/dividir-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/excluir-paginas-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/ferramentas-pdf/` | 5,2 KB, 0, 4 | 5,2 KB, 0, 4 |
| `/pt/girar-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pt/guias/dividir-pdf-e-tamanho-do-arquivo/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/pt/guias/juntar-pdfs-no-celular/` | 45,2 KB, 2, 6 | 49,0 KB, 2, 6 |
| `/pt/guias/por-que-meu-pdf-esta-tao-grande/` | 45,4 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/pt/guias/resolucao-de-pdf-para-jpg/` | 45,4 KB, 2, 6 | 49,2 KB, 2, 6 |
| `/pt/juntar-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/marca-dagua-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/numerar-paginas-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pt/organizar-paginas-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/pt/pdf-para-jpg/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/pt/proteger-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/reorder-pdf-pages/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/rotate-pdf/` | 45,3 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/sign-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/split-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |
| `/unlock-pdf/` | 45,2 KB, 2, 6 | 49,1 KB, 2, 6 |
| `/watermark-pdf/` | 45,1 KB, 2, 6 | 48,9 KB, 2, 6 |

### O tamanho de cada arquivo JS da página de PDF, com gzip (nível 9, contra o `dist-base`)

| Arquivo | Antes | Depois | Diferença |
|---|---:|---:|---:|
| `PdfIsland.astro_astro_type_script_index_0_lang.*.js` (a ilha de PDF) | 19.867 B | 23.759 B | +3.892 B |
| `island.*.js` (o pedaço compartilhado das ilhas) | 21.211 B | 21.215 B | +4 B |
| `entry.*.js` | 1.432 B | 1.432 B | 0 |
| Total do JS inicial | 42.510 B | 46.406 B | +3.896 B |

O build tem os mesmos 66 arquivos JS, nenhum novo.

### Os anúncios: a menor distância de cada controle novo até um anúncio (build de teste, o menor valor do Chromium e do WebKit)

| Controle | 360, Ajustar | 360, Ampliar | 1280, Ajustar | 1280, Ampliar |
|---|---:|---:|---:|---:|
| botões da vista | 528 | 528 | 150 | 150 |
| moldura | 644 | 644 | 320 | 150 |
| imagem (a parte vista) | 644 | 644 | 320 | 150 |
| lupa (na grade) | 590 | — | 182 | — |
| segmento de tamanho (na grade) | 1.576 | — | 150 | — |
| "Ver o PDF novo" (Excluir en, pt e es) | 2.270 | — | 293 | — |
| "Ver páginas" (Juntar) | 1.224 | — | 176 | — |

Os 150 px a 1280 são a borda da coluna: a ilha inteira já fica a 150 px da lateral.

## Os testes

- **Vitest:** 130 arquivos e 2.066 testes no ponto de partida; 131 arquivos e 2.083 testes no fim (`tests/unit/pdf-grid-math.test.ts`, 17 testes).
- **Playwright `--list`:** 2.204 testes em 71 arquivos por navegador no ponto de partida; 2.316 em 77 no fim (+112: `island-pdf-grid` 13, `island-pdf-marking` 21, `island-pdf-result` 41, `island-pdf-view` 16, `island-pdf-view-axe` 7, `island-pdf-workers` 6 e o bloco da F14 do `ads.spec.ts`, 8).
- **Os testes antigos que mudaram** (§ 636): `tests/unit/icons.test.ts` (71 → 72 ícones), `tests/e2e/engine-paths.spec.ts` (a largura pedida no lugar de 240 px, a grade trazida para a tela), `tests/e2e/pdf-pieces.spec.ts` (F-5: a largura pedida; D-7: ", comes out" no Excluir) e `tests/e2e/pdf-matrix.spec.ts` (a contagem do Excluir). Só acrescentados: `TARGETS`, `PDF_TARGETS`, o bloco do `ads.spec.ts` e, pela revisão, a vista no `pdf-privacy.spec.ts` e no `events.spec.ts`.
- **Os specs novos e as partes** (§ 635): os `island-pdf-*` caem na parte 4 do Chromium e nas 9 e 10 do WebKit; o tempo deles e o de cada parte estão no `verificar --partes` abaixo.

## O `pnpm verificar --partes`

No último commit de código (`0cfa61c`), com a máquina livre, em 9/nov/2026 (de 15:27 a 16:18):

```text
Resumo das partes do CI (pnpm verificar --partes, 21 partes lidas de .github/workflows/ci.yml)
  ok      48.6 s  build: pnpm verificar --build
  ok     181.0 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     392.8 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     193.4 s  playwright: pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto
  ok     234.5 s  playwright: pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto
  ok     184.4 s  playwright: pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto
  ok     186.1 s  playwright: pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto
  ok     159.5 s  playwright: pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto
  ok      69.0 s  playwright: pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto
  ok     101.9 s  playwright: pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto
  ok      98.6 s  playwright: pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto
  ok     336.6 s  playwright: pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto
  ok      41.4 s  playwright: pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto
  ok     128.6 s  playwright: pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto
  ok     107.8 s  playwright: pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto
  ok      59.8 s  playwright: pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto
  ok     106.5 s  playwright: pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto
  ok     158.8 s  playwright: pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto
  ok     100.5 s  playwright: pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto
  ok      88.0 s  playwright: pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto
  ok     104.6 s  playwright: pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto
  soma 3082.6 s (parede 3082.6 s; cada parte com o limite de 900 s)
```

Todas as 21 partes passaram. A soma caiu de 3.266,5 s (o ajuste-home-cards) para 3.082,6 s, e a maior parte continua o Lighthouse (392,8 s; era 395,2 s). A parte 4 do Chromium, a dos specs novos, levou 186,1 s (era 197,4 s): ela ganhou os 104 testes `island-pdf-*` e perdeu 59 do `i18n-budgets` para a 3 e o rabo dos `money-*` para a 5. No WebKit, a 9 e a 10 (69 e 35 testes novos) levaram 106,5 e 158,8 s (eram 83,0 e 181,1 s). Nenhuma parte passou de 700 s na máquina. O Lighthouse no celular deu de 99 a 100 em todas as páginas medidas (`/compress-pdf/`: performance 99, acessibilidade 100, boas práticas 100, SEO 100); o Vitest, 131 arquivos e 2.083 testes.

## O custo

A última execução do CI antes deste relatório é a do push do `0cfa61c` (`pnpm ci:custo 42674176617 --attempt 2`): classe **leve**, **4 minutos cobrados**, **2,4 min de parede**, 3 jobs (o `classificar`, o `verificar (leve)` com 89,4 s de `verificar` e o `ci-ok`). A primeira tentativa dela terminou em falha sem ter criado os jobs depois do `classificar` (o `classificar` disse "leve", e o `verificar (leve)` e o `ci-ok` não chegaram a existir na execução): uma falha da plataforma, que a run tratou com o único `gh run rerun` permitido para uma falha instável; a tentativa 2 passou sem mudança nenhuma. A execução final (a completa, depois do `gh pr ready`) vai na descrição da PR.

As execuções leves da run, uma por push: `f0cd0ce`, `846574f`, `6342984`, `06982b5` e `0cfa61c`, todas verdes (a do `06982b5`: 5 minutos cobrados e 3,5 min de parede).

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list`, só leitura), e criá-lo é do Victor (§ 638). A execução completa depois do `gh pr ready` faz esse papel.

## A revisão

Cinco lentes Sonnet em contexto limpo sobre o `3fbafc1`, com céticos: 8 achados, nenhum crítico nem alto, 6 refutados; o e-1 (médio: os § citados que ainda não estavam no `DECISOES.md`) e o c-2 (baixo: o teste do E-4 da vista do resultado) foram corrigidos, e o d-1 (a vista no caminho do `pdf-privacy` e do `events`), refutado, foi aplicado pela regra do mais rigoroso. A segunda passada fechou os três. Nenhum baixo sobrou para o grupo 24. Tudo em `docs/relatorios/REVISAO-F14.md` e na § 647.

## As imagens

Em `docs/relatorios/fase-14/` (JPEG 80, 1x, movimento reduzido, Chromium do Playwright, do `dist/`):

- `grade-mistas-360-antes.jpg` e `grade-mistas-360-depois.jpg`, `grade-mistas-1280-antes.jpg` e `grade-mistas-1280-depois.jpg`: o Excluir com a `gen-paginas-mistas`, antes (as páginas em pé cortadas) e depois (a página inteira, em pé e deitada, na linha dos números).
- `grade-grandes-1280.jpg`: Grandes, três colunas.
- `excluir-sai-360.jpg`: três páginas que saem (a lixeira, a página a 40 %, a contagem "3 of 8 come out · the new PDF keeps 5 pages").
- `vista-ajustar-360.jpg`, `vista-ampliar-360.jpg`, `vista-ajustar-1280.jpg`, `vista-girar-1280.jpg` (depois de um giro) e `vista-1280-escuro.jpg`.
- `resultado-ver-pdf-360.jpg` e `juntar-ver-paginas-360.jpg`.

## A prévia

https://fase-14-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio).

## As decisões novas

§ 617 a § 647 no `DECISOES.md`: os planos e o `CLAUDE.md` (617), a folha (618), Pequenas e Grandes (619), a célula com `memo` (620), a lupa e o ícone (621), a âncora (622), os textos (623), a vista (624), o "Ver o PDF novo" (625), o Juntar (626), o Excluir (627), Inverter e Shift (628), as falas (629), o E-4 (630), o E-5 (631), a medida do E-2 (632), o orçamento (633), os anúncios (634), os specs e as partes (635), os testes antigos (636), o design system (637), a conferência no Linux (638), o título `h2` (639), a vista depois do primeiro giro (640), o critério 5 com a CPU 20× (641), as setas em Ampliar (642), as reservas não usadas (643 a 646) e a revisão (647).

## A válvula de estouro

Não foi usada: o item 7 (o Juntar) entrou.

## A lista do que é do Victor

1. `git pull` e, no Android, abrir `/pt/excluir-paginas-pdf/` (na prévia ou no fileorca.com depois do deploy) com um PDF de verdade: usar a lupa, arrastar para o lado, ampliar, marcar uma página na vista e voltar à grade. No computador, conferir as setas e o Esc.
2. Decidir o D16 (a busca por cima da âncora), no grupo 24 do `docs/PENDENCIAS.md` (F14 d-16).
3. Por duas semanas, acompanhar no GA4 o `tool_complete` sobre o `tool_start` das cinco ferramentas da grade.
4. Passar as candidatas da seção E do `PLANO-UX-QV.md` no Keyword Planner (30 min).
5. Pôr a linha do `PLANO-FILEORCA.md`, que faltou (o texto está no grupo 24, F14 m-1).
6. Criar o rótulo `ci` (Issues → Labels), que ainda não existe.
7. Gerar o prompt da F15 com a skill, com o SHA da main e o grupo 24 do `docs/PENDENCIAS.md`.
