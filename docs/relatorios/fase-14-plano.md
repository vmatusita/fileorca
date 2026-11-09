# F14 · Plano da run "Páginas de PDF à vista"

Gabarito da revisão final (o método da F3). A ficha da F14 está no `PLANO-UX-QV.md` (seção "Fichas", seções A e B, diagnóstico D1 a D6 e D16) e o prompt da run em `docs/prompts/prompt-fase-14.txt`; os dois juntos são a ficha da run, e vale o mais rigoroso. Este plano não muda nada deles: ele diz onde cada coisa vai ficar, quem faz e o que prova.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `b7a6396` (o ajuste-home-cards, PR 28). Branch `fase-14`, PR 29 em rascunho.
- **O `dist-base`:** montado numa worktree à parte (`.claude/worktrees/f14-base`, destacada em `b7a6396`, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`) e copiado para `.cache/f14/dist-base/` (`build.txt` = `b7a639617540…`).
- **Vitest:** 130 arquivos, 2.066 testes. Na primeira execução, com seis exploradores lendo o disco ao mesmo tempo, um teste passou dos 5 s (`conteudo.test.ts`, "checks the ten file guides…"); é tempo de máquina, e a contagem confere com o relatório do ajuste-home-cards.
- **Playwright `--list`:** 2.204 testes em 71 arquivos, nos dois navegadores.
- **Orçamento (`budgets.spec.ts` e `i18n-budgets.spec.ts`, Chromium, 343 testes verdes):** cada página de PDF carrega 2 arquivos JS e faz 6 requisições; o JS inicial vai de 45,1 a 45,3 KB com gzip (saída em `.cache/f14/antes/budgets.log`). Os arquivos: `PdfIsland.astro_astro_type_script_index_0_lang.*.js` (19.867 B com gzip 9) e `island.*.js` (21.211 B), mais o `entry-*.js` (1.432 B) que o segundo importa.
- **O D1 no ponto de partida** (`node .cache/f14/d1.ts before 4181`, sobre o `dist-base`): nas cinco ferramentas, a 360 e a 1280, a `img` da página Carta em pé passa da folha e perde 23 % (A4: 29 %; 432 × 576: 25 %); as deitadas cabem. No Girar, depois de um giro, a página 1 perde 34 %. É o controle negativo do critério 1 (`.cache/f14/antes/d1.json`).
- **As partes do CI** (`docs/relatorios/ajuste-home-cards.md`): 21 partes, soma 3.266,5 s, maior 395,2 s (Lighthouse); projeção da F13b no Linux: C1 ~625, C2 ~603, C3 ~565, C4 ~526, C5 ~638 s; W4 ~550, W6 ~533, W10 ~436 s.
- **O `PLANO-FILEORCA.md`:** `git diff` vazio. O Victor não pôs a linha: a run segue sem ela, com § e linha "Victor faz" no grupo 24.
- **O rótulo `ci`:** a conferir na hora da fatia 3 com `gh label list` (só leitura).

## 2. A interface que as frentes dividem

### 2.1 Arquivos novos da ilha (todos no mesmo arquivo JS da ilha; nenhum `import()` novo)

| Arquivo | Dono | O que é |
|---|---|---|
| `src/tools/pdf/grid-math.ts` | principal (fatia 1); M acrescenta | Lógica pura, com Vitest em `tests/unit/pdf-grid-math.test.ts`: `quarters(box, turns)`, `sheetRatio(box, turns)` (a proporção como a página vai sair, limitada a [0,5; 2]), `askWidth(cssWidth, dpr, cap)` (`ceil60(min(cap, cssWidth × dpr))`, nunca menos de 60), `THUMB_CAP = 720`, `VIEW_FIT_CAP = 1600`, `VIEW_ZOOM_CAP = 2400`; `span(anchor, target)`; as formas da contagem do Excluir (`leavingCount(texts, count, total)`) |
| `src/tools/pdf/PageCell.tsx` | principal (fatia 1); M muda o visual do Excluir | A célula com `memo` |
| `src/tools/pdf/PageView.tsx` | V | A vista da página |

### 2.2 A célula (`PageCell`, `memo`)

Props, todas primitivas ou estáveis: `index`, `position`, `mode`, `label` (o nome acessível já montado), `zoomLabel`, `selected`, `removes` (a grade do Excluir), `turn` (quartos de volta da pessoa), `ratio` (a proporção da folha), `active` (foco móvel), `grabbed`, `first`, `last`, `width` (a largura pedida ao cache), `thumbnails` (estável por arquivo), `texts`, `icons` (estáveis: vêm do `data-props`) e `actions` (um objeto criado uma vez por grade, com métodos que leem o estado mais novo por uma ref: `press(index, position, event)`, `key(event, index, position)`, `focus(position)`, `blur(index, position)`, `move(from, to)`, `zoom(index, position)`, `dragStart`, `dragOver`, `drop`, `dragEnd`). Nenhuma função ou objeto novo por render chega à célula; a contagem e as ações em lote ficam fora dela.

Marcação (a ordem dos filhos importa para os testes de hoje):

```
li.fo-page.fo-dogear.fo-cat--pdf[data-position][data-page][data-selected][data-grabbed]
  button.fo-page__main            (o toque continua marcando, girando ou pegando)
    span.fo-page__sheet[style=--sheet-ratio]  > img (abs, "contain"; giro ímpar com a caixa trocada)
    span.fo-page__n[aria-hidden]  (check ou lixeira no círculo, número)
    span.fo-page__badge           (só no girar)
  button.fo-btn.fo-btn--icon.fo-page__zoom   (irmão do botão da página, 48 px, na linha do número, à direita)
  span.fo-page__moves             (só no reorganizar)
```

### 2.3 A grade (`PageGrid`)

- Props novas: `removes?: boolean` (Excluir); `onSelect?: (pages: number[]) => void` no lugar de `onToggle`, `onSelectAll` e `onSelectNone` (a grade faz a conta de marcar uma, todas, nenhuma, inverter e o intervalo do Shift, e chama `onSelect` uma vez por gesto).
- **A âncora mora na grade, num lugar só** (`anchor` ref): a última página tocada na grade ou marcada na vista. Ela some quando a seleção muda por fora da grade (o intervalo digitado, o Começar de novo, a troca de arquivo): a grade guarda a seleção que ela mesma mandou e compara a cada render. Marcar todas, Desmarcar todas e Inverter seleção a apagam.
- **Pequenas e Grandes:** o `OptionGroup` (segmento) `name="${id}-size"` acima da grade em todos os modos, antes da barra da contagem. A escolha vive numa variável do módulo (`remembered`), a memória da página: nada em storage.
- **A largura pedida:** a grade mede a largura da folha (uma `ResizeObserver` na lista) e passa `askWidth(folha, devicePixelRatio, 720)` às células; o `Thumb` pede e solta com a mesma largura (efeito com `[index, thumbnails, width]`).
- **A lupa:** chama `actions.zoom(index, position)`. Na fatia 1 ela só marca a célula como ativa; a frente V troca o corpo para abrir a vista.
- **A vista dentro da grade (V):** com `viewing !== null`, a grade mostra só a `PageView` no lugar do bloco inteiro (segmento, barra, lista e ajuda), com `key` em cada filho. Ao voltar, a célula da página à vista vira a ativa, entra na tela (`scrollIntoView({ block: 'nearest' })`) e a lupa dela recebe o foco.

### 2.4 Os textos novos (fatia 1; todas as chaves nos três idiomas)

`PdfPanelTexts['grid']` ganha: `sizeLegend`, `sizeSmall`, `sizeLarge`, `invert`, `zoom`, `leaving`, `leavingCount`, `leavingOne`, `keptCount`, `keptOne`, `spanOn`, `spanOff`. `PdfPanelTexts` ganha o bloco `view`: `back`, `previous`, `next`, `enlarge`, `fit`, `title`, `titleOrder`, `remove`, `mark`, `sign`, `turn`, `openResult`, `openFile`, `frame`. Os de pt são os da seção B, sem mudar uma palavra; en e es pelo glossário (§ 623).

### 2.5 O que cada gesto diz (região `p.fo-sr[role="status"]`, uma fala por gesto)

| Gesto | Fala |
|---|---|
| Toque simples numa página da grade | nenhuma (o `aria-pressed` já diz), como hoje |
| Marcar todas, Desmarcar todas, Inverter seleção, intervalo digitado | a contagem (`selectedCount`; no Excluir, `leavingCount · keptCount`) |
| Shift+clique, Shift+Espaço | `spanOn` ou `spanOff` |
| Giro na grade ou na vista | `turned` (sem o "Done!" da execução que o giro dispara) |
| Ação de marcar na vista | a contagem, como as ações em lote |
| Troca de página na vista | `title` (ou `titleOrder`) com o estado (`leaving`, `selected`, `rotated`) |

## 3. Os § reservados

Os agentes em worktree não editam o `DECISOES.md`: cada frente escreve os seus § num rascunho (`.cache/f14-<frente>/decisoes.md` da worktree dela), com os números abaixo, e o agente principal os põe no arquivo, na ordem, na junção.

| § | Assunto | Quem |
|---|---|---|
| 617 | Os planos, o `CLAUDE.md` e o `PLANO-FILEORCA.md` sem a linha (decisão 2) | principal |
| 618 | A folha na proporção da página e o alinhamento da linha (item 1, decisão 3) | principal |
| 619 | Pequenas, Grandes e a largura pedida (item 3, decisão 4) | principal |
| 620 | A célula com `memo` (E-2, decisão 5) | principal |
| 621 | A lupa e o ícone `zoom` (decisão 6) | principal |
| 622 | A âncora num lugar só (decisão 9) | principal |
| 623 | Os textos novos nos três idiomas (decisão 11) | principal |
| 624 | A vista da página (decisão 7) | V |
| 625 | "Ver o PDF novo" e a vista do resultado (decisão 8) | V |
| 626 | O Juntar: "Ver páginas" e o Desfazer (decisão 8) | V |
| 627 | O Excluir mostra o que sai, com o contraste (item 4) | M |
| 628 | Inverter seleção, Shift+clique e Shift+Espaço (item 5) | M |
| 629 | As falas (decisão 10) | M |
| 630 | O E-4: o worker do PDF.js que ficava vivo (item 8) | M |
| 631 | O E-5 já estava corrigido (item 8) | principal |
| 632 | A medida do E-2 (decisão 12) | principal |
| 633 | O orçamento (decisão 13) | principal |
| 634 | Os anúncios com a vista aberta (decisão 14) | V |
| 635 | Os specs novos: nomes e partes (decisão 15) | principal |
| 636 | Os testes antigos que mudaram (no formato da § 341) | principal, com as notas das frentes |
| 637 | O design system: o PageView, a regra do ícone sozinho e os ícones (decisão 16) | principal |
| 638 | A conferência no Linux (decisão 20) | principal |
| 639 a 642 | sobras da V | V |
| 643 a 646 | sobras da M | M |
| 647 em diante | a revisão e o fecho | principal |

Um § que não for usado fica com um texto curto dizendo que a reserva não foi usada, para a numeração não pular.

## 4. Frentes, fatias e arquivos

1. **Fatia 1, o agente principal (a base):** item 1, a célula com `memo`, Pequenas e Grandes com a largura pedida, a lupa com o `zoom()` ainda sem a vista, o ícone `zoom` (`ICON_NAMES`, `icons.test.ts`, `PdfIcons`, `src/tools/pdf/page.ts`), a âncora e o `onSelect`, todas as chaves de texto. Testes: `island-pdf-grid.spec.ts` (critérios 1 e 7, as colunas e a largura pedida) e `pdf-grid-math.test.ts`. Specs antigos que a base quebra: `engine-paths.spec.ts` (largura 240), `pdf-pieces.spec.ts` (F-5, ≤ 240), `icons.test.ts` (71 → 72). Commit e push.
2. **Fatia 2, duas frentes `opus` em worktree, a partir do commit da fatia 1** (primeiro passo: `git merge --ff-only fase-14`; portas `FO_PORT` 4175 para a V e 4176 para a M; `--workers=2`):
   - **V (a vista):** `PageView.tsx`; a vista no `PageGrid` (as cinco ferramentas), no resultado ("Ver o PDF novo") e no Juntar ("Ver páginas de {name}"); o cache das imagens grandes; o `inspect()` e o `release()` das vistas; o CSS da vista; as listas de alvos de anúncio; os testes `island-pdf-view.spec.ts` (critérios 2, 3 e 5), `island-pdf-result.spec.ts` (critério 6 e o Juntar), `island-pdf-view-axe.spec.ts` (critério 11) e a parte da vista no `ads.spec.ts` (critério 4). Arquivos: `src/tools/pdf/PageView.tsx`, `PageGrid.tsx` (só a troca grade/vista e a volta do foco), `PdfPanel.tsx` (resultado, faixa, Juntar), `src/styles/components.css` (bloco novo da vista no fim), `tests/e2e/ads.spec.ts`, `tests/e2e/lib/ad-clearance.ts`, `tests/e2e/lib/ad-map.ts`, `tests/e2e/clearance.spec.ts` (só somar alvos).
   - **M (a marcação e o motor):** o Excluir que mostra o que sai, Inverter seleção, Shift+clique e Shift+Espaço, as falas d-2 e d-8, o E-4 (`src/engine/pdf/pdfjs.ts` ou `render.ts`, e `src/tools/pdf/client.ts`), com os testes `island-pdf-marking.spec.ts` (critério 9, item 4, d-2, d-8) e `island-pdf-workers.spec.ts` (E-4). Arquivos: `PageGrid.tsx` (barra e gestos), `PageCell.tsx` (o visual do Excluir), `grid-math.ts`, `tools.tsx` (`RangePicker` e as falas), `PdfPanel.tsx` (só o `finish` do d-8), o motor e o `client.ts`, o CSS do Excluir.
   - **O agente principal, ao mesmo tempo:** os textos das ferramentas (FAQ do D6, "Como funciona" das cinco, frases desmentidas), os glossários, o `docs/design/` (a regra, os ícones, o Button), a seção do `docs/claude/pdf.md`, a linha do `CLAUDE.md`, o `PENDENCIAS.md` e os § dele.
3. **Fatia 3, a junção:** `git merge --no-ff -F <arquivo com o trailer>` das duas branches, os conflitos, `pnpm tipos`, os specs das duas frentes nos dois navegadores, os de anúncio no build de teste, o E-4 no Juntar, a conferência no Linux.
4. **Fatia 4, o fecho:** a medida do E-2 contra o `dist-base`, o orçamento, o README e o preview do PageView, as imagens e as tabelas do relatório.
5. **A revisão adversarial** (cinco lentes Sonnet num commit fixo, céticos, correções num agente `opus`, segunda passada).
6. **O `pnpm verificar --partes`, o relatório e a sequência de fim.**

## 5. Critérios da ficha → prova

| # | Critério | Prova |
|---|---|---|
| 1 | A `img` cabe na folha e ocupa ≥ 95 % do "contain", nas cinco ferramentas, em pé, deitada, `/Rotate 90`, e no Girar depois de 1 e de 3 giros, nos dois navegadores | `island-pdf-grid.spec.ts`; controle negativo: o mesmo teste contra o `dist-base` (e o `d1.ts`) |
| 2 | A vista: abre pela lupa nas cinco; largura natural ≥ CSS × DPR; 360 × 740 (DPR 2): ≥ 300 px em Ajustar e ≥ 600 px em Ampliar; 1280 × 800: página inteira e as duas barras na janela, página ≥ 520 px de altura; ← → Home End; Esc com o foco na lupa; arrasto de 48 px | `island-pdf-view.spec.ts` |
| 3 | Marcar ou girar na vista muda a grade e a contagem, com uma fala; no Girar, o giro acumulado | `island-pdf-view.spec.ts` (`MutationObserver` na região) |
| 4 | 150 px de todo anúncio com a vista aberta nos dois modos, 360 e 1280; nada por cima da âncora simulada | `ads.spec.ts` (bloco novo, build de teste); `fo-ad-map.spec.ts`, `ads-coffee.spec.ts`, `clearance.spec.ts` verdes |
| 5 | Nenhum layout-shift sem gesto da lupa até a imagem grande (Chromium, com a CPU 6× mais lenta) | `island-pdf-view.spec.ts` |
| 6 | "Ver o PDF novo" em todo resultado de um PDF só sem cifra, nunca no Proteger, no PDF para JPG nem com ZIP (as 12); retângulo 356/356/340 a 320/360/1280 nos três idiomas | `island-pdf-result.spec.ts` |
| 7 | A lupa não intercepta a `img` nem o check, 48 px, de 320 a 1280, com 3 dígitos | `island-pdf-grid.spec.ts` (`gen-paginas-300`) |
| 8 | E-2: `ScriptDuration` ≤ metade (média de 20 toques, `gen-paginas-300`, Excluir, 1280 × 800, base e nova alternadas); E-4: nenhum worker do PDF.js do arquivo anterior sem `terminate` | `.cache/f14/e2.ts` (relatório); `island-pdf-workers.spec.ts` (reprova no ponto de partida) |
| 9 | Shift+clique da âncora até a página, sem âncora vale como clique, com a fala | `island-pdf-marking.spec.ts`; Vitest do `span` |
| 10 | JS inicial ≤ +8 KB com gzip, mesmos arquivos e requisições | `budgets.spec.ts` e `i18n-budgets.spec.ts` sem mudar número; `.cache/f14/gzip-sizes.mjs` contra o `dist-base` |
| 11 | axe com a vista aberta (dois temas, dois navegadores); Lighthouse ≥ 90; `pnpm verificar` verde | `island-pdf-view-axe.spec.ts`; `pnpm verificar --partes`; CI completo |

E os do prompt: o CLS sem gesto (`tool-slot.spec.ts`, `layout-shift.spec.ts`, os CLS do `pdf-merge.spec.ts`); a privacidade (`pdf-privacy.spec.ts`, `launch-claims.spec.ts`, `events.spec.ts`); a matriz de PDF igual (`pdf-matrix.spec.ts`); os textos (`lint:texto`, `gate:conteudo`, `english-leak.test.ts`, `glossary.test.ts`, `pdf-pieces-texts.test.ts`); os documentos (`claude-md.test.ts`, `pendencias.test.ts`, `icons.test.ts`).

## 6. Os specs novos e as partes

Os nomes `island-pdf-*` caem entre o `i18n-budgets` e o `island.spec.ts`: a parte 4 do Chromium (a mais folgada, ~526 s projetados) e as partes 9 e 10 do WebKit (83 s locais e ~436 s projetados). Nenhum deles usa o build de teste, salvo o bloco novo do `ads.spec.ts`, que já o paga. Depois de escritos: o `--list` de cada parte, antes e depois, e a projeção pelo tempo por teste; o alvo é 700 s por parte. Redividir a matriz é PR separada do Victor.

## 7. Riscos que o plano já sabe

- **`startOver` dos testes** clica `.fo-result__more > button:first-child`: o "Ver o PDF novo" vem depois do "Começar de novo".
- **Strict mode:** nenhum `role="status"` novo dentro da ilha (`pdf-tool.spec.ts:665`); a lupa não começa por "Page" (en) nem por "Delete" (os testes acham botões por `^Page N of M` e `^Delete`).
- **O `launch-claims.spec.ts` offline:** com o E-4, o Começar de novo termina o worker do PDF.js no caminho da página; o segundo arquivo cria outro, e o pedido do script tem de vir do cache (conferir no WebKit do Windows).
- **A corrida do `thumbnail()` depois do `release()`:** um desenho em voo reabre o documento; o `client.ts` precisa de uma época por id.
- **O foco:** o painel leva o foco à ação um quadro depois de mostrar a grade (§ 240); a marca de foco só se gasta com o alvo (§ 510).
- **O orçamento:** o código da vista entra no chunk da ilha; o limite é +8 KB com gzip sobre 45,1 KB.
