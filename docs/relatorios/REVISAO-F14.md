# Revisão adversarial da F14

A revisão final da run F14 (as páginas de PDF à vista: a folha na proporção da página, Pequenas e Grandes, a lupa e a vista da página nas cinco ferramentas da grade, no resultado e no Juntar, o Excluir que mostra o que sai, Inverter seleção e Shift, as falas, o E-2 e o E-4), contra a ficha (`PLANO-UX-QV.md`, a ficha da F14 e as seções A e B), o prompt (`docs/prompts/prompt-fase-14.txt`) e o plano (`docs/relatorios/fase-14-plano.md`), no método da F3 (`docs/claude/windows-git-bash.md`).

## O método

- **O commit fixo:** `3fbafc1` da branch `fase-14` (as duas frentes juntas e conferidas, com as imagens), numa worktree só de leitura (`.claude/worktrees/revisao-f14`), com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` e o próprio build de teste. O ponto de partida é o `b7a6396` (a `main`), e o `dist` dele, o da linha de base, foi copiado para a worktree (`.cache/f14/dist-base`).
- **Cinco lentes Sonnet em contexto limpo** (a F14 mexe em interface, em texto, no motor de PDF e no entorno dos anúncios; regra 3 de toda run): (a) design system e visual, (b) acessibilidade, (c) comportamento, desempenho e memória, (d) privacidade e anúncios, (e) textos, idiomas e documentos. Cada uma com o próprio `FO_PORT` (4184 a 4188) e escrevendo só no `.cache/lente-<x>/` da worktree. As lentes só apontam lacunas de correção ou de requisito, nunca preferência de estilo.
- **Os céticos:** um cético próprio para cada achado médio ou acima, que tentou refutá-lo relendo o contrato e o código e refazendo a medida, com a regra "na dúvida, refutado"; um cético só para os baixos de cada lente. Foram 12 agentes ao todo.
- **As correções:** num agente só, o agente principal (Opus), nos commits `d5c414d` e `99f5226`.
- **A segunda passada:** as lentes dos achados corrigidos (c, d e e), em contexto limpo, sobre o diff `3fbafc1..99f5226`.

## O que as lentes viram

- **(a) Design system e visual:** a folha e o encaixe "contain" certos em toda célula e em todo giro (Excluir, Girar e Reorganizar com a `gen-paginas-mistas`), as folhas de uma linha no mesmo chão, a lupa de 48 × 48 px fora da imagem, as colunas de Pequenas e Grandes como a seção B pede, nenhuma rolagem lateral de 320 a 1440 px; a vista contra a seção A (Ajustar e Ampliar, a barra de baixo em duas linhas abaixo de 480 px, as pontas com `aria-disabled` focáveis, a imagem girada na moldura); o CSS novo só com tokens, sem `fixed`, `sticky`, `transition` nem `sun`; o ícone `zoom` na grade e no traço dos outros; as linhas do Juntar com as alturas de antes; o "Ver o PDF novo" cabendo a 320 px nos três idiomas.
- **(b) Acessibilidade:** a lupa no foco móvel, os nomes acessíveis (", sai" no Excluir, a ação com `aria-pressed`, sem ele no Girar, a moldura de "Ampliar"), o foco de ida e volta sem cair no `body` (também no Girar e no Juntar), as teclas, as falas por gesto e uma só região de status na ilha; o axe com a vista aberta e nos estados de PDF sem violação nos dois navegadores (as falhas da rodada foram `ENOENT` nos traces, das lentes rodando na mesma pasta de artefatos).
- **(c) Comportamento, desempenho e memória:** o `memo` da célula é real (props primitivas, `actions` feito uma vez, `selected` do `setOf`); o método e os números do E-2 são sólidos; o E-4 passa; a época fecha a corrida da miniatura com o `release` nos dois caminhos; no máximo 3 imagens grandes vivas ao ampliar; o motor mudou só no abrir e fechar do documento (`pdfjs.ts`), nenhuma saída de PDF muda; o orçamento fecha em +3.892 B no arquivo da ilha; o CLS sem gesto da grade de 300 páginas deu 0.
- **(d) Privacidade e anúncios:** nada novo de `pushState`, `replaceState`, `location`, storage, `indexedDB`, `sendBeacon`, `track`, `fixed`, `sticky`, `dialog`, popover ou Fullscreen no código da F14; a sonda da lente (abrir a vista, ampliar, trocar de página, excluir, abrir o "Ver o PDF novo") não mudou a URL nem o histórico, não gravou nada no storage, não pediu nada além do pedaço `pdf-*` que já existe no ponto de partida e só pôs o `tool_start` e o `tool_complete` no `dataLayer`; o bloco da vista do `ads.spec.ts` passou (150 px ou mais, nada sobre a âncora); a busca (D16), o `src/ads` e o `ad-map.ts` intactos; as listas de alvos só cresceram.
- **(e) Textos, idiomas e documentos:** o pt é palavra por palavra a seção B, o en e o es seguem o glossário; os "Como funciona" citam a lupa; o FAQ do D6 foi reescrito, e a busca por frases desmentidas não achou outra; o `lint:texto` sem erro e o Vitest dos textos e dos documentos verde; o `CLAUDE.md` só com a linha da decisão 2, o `PLANO-UX-QV.md` idêntico ao original, o `PLANO-FILEORCA.md` intocado, o `DECISOES.md` e o `docs/claude/` só com acréscimos, o `PENDENCIAS.md` coerente.

## Os achados

8 achados das cinco lentes, nenhum crítico nem alto: 6 refutados pelos céticos, e 2 que sobreviveram (um médio e um baixo), os dois corrigidos. Um achado refutado (d-1) foi aplicado mesmo assim, pela regra do mais rigoroso.

| Id | Lente | Sev. da lente | Sev. final (cético) | Achado | Destino |
| --- | --- | --- | --- | --- | --- |
| e-1 | e | médio | médio | Os documentos citavam os § 632 a 642, que ainda não estavam no `DECISOES.md` (só em rascunhos fora do Git), e a § 635 não tinha rascunho | corrigido (`99f5226`: § 632 a § 646 no arquivo, a § 635 escrita; todo "§ N" citado existe, menos a § 647, a desta revisão) |
| c-2 | c | baixo | baixo | O teste do E-4 da vista do resultado voltava da vista antes da nova execução, então não provava que uma mudança com a vista aberta solta o documento do resultado | corrigido (`d5c414d`: o teste muda uma opção com a vista aberta e confere que a vista fecha e o worker dela acaba antes da nova execução) |
| d-1 | d | baixo | refutado | O `pdf-privacy`, o `events` e o `launch-claims` não passavam pela vista nem pelo "Ver o PDF novo", e o critério 5 do prompt diz "com a vista e o 'Ver o PDF novo' no caminho" | aplicado mesmo refutado (`d5c414d`: a vista no fluxo do Excluir do `pdf-privacy` e no da Marca d'água do `events`; § 636 e § 647) |
| c-1 | c | médio | refutado | Os 104 testes `island-pdf-*` caem todos na parte 4 do Chromium, e a soma deles com a projeção da F13b passaria dos 700 s | refutado (a parte perdeu os testes que os novos empurraram; a medida real está no `verificar --partes` e no CI; § 635) |
| c-3 | c | baixo | refutado | Três specs novos reprovaram numa execução em série dos 104, com a máquina ocupada, e passaram sozinhos | refutado (sem a mensagem de erro, com as falhas mudando de rodada para rodada; o `ENOENT` das lentes na mesma pasta é conhecido) |
| a-1 | a | baixo | refutado | A 320 × 640, a barra de cima da vista vai a três linhas e a barra de baixo passa da tela em "Ajustar" | refutado (o código segue a fórmula da seção A, e os critérios medem 360 × 740 e 1280 × 800; a página rola) |
| b-1 | b | baixo | refutado | Abaixo de 480 px, a ordem do Tab da barra de baixo (Anterior, ação, Próxima) não segue a ordem visual (a ação em cima) | refutado (a ordem do DOM é a da ficha, a sequência continua com sentido e o foco não se perde) |
| e-2 | e | baixo | refutado | O relatório e esta revisão ainda não existiam no commit revisado | refutado (o prompt põe o relatório e a revisão depois da revisão adversarial) |

## A segunda passada

As lentes c, d e e, em contexto limpo, sobre o diff `3fbafc1..99f5226`, numa worktree só de leitura no `99f5226`:

- **c-2, fechado:** o passo novo abre a vista do resultado, muda a seleção de páginas sem voltar (o `update()` do painel, que fecha a vista e solta o documento), exige que a vista suma e que o worker do PDF.js dela acabe antes da nova execução, e confere de novo depois dela. O `island-pdf-workers.spec.ts` passou 6 de 6 no Chromium e 6 de 6 no WebKit. A guarda do `run()` não é exercida sozinha (a ação só volta depois de uma mudança), mas o fechamento é o mesmo.
- **d-1, fechado:** a vista, pela lupa e pelo "Ver o PDF novo", fica antes do ponto em que o `pdf-privacy` junta o que procura (pedidos, `dataLayer`, URL, storage, cookie, console), e o `events` abre e fecha a vista do resultado com a lista dos quatro eventos no `toEqual` de sempre; nenhuma asserção saiu ou afrouxou. O Excluir do `pdf-privacy` (2 testes) e o `events` inteiro (20) passaram no Chromium. O `launch-claims` não precisava: ele confere o que sai para a rede, e o E-4 dele já passa offline depois do Começar de novo.
- **e-1, fechado:** o `DECISOES.md` só ganhou linhas no fim (`git diff b7a6396` com um hunk e nenhuma linha tirada), os § seguem em ordem sem lacuna, e todo "§ N" citado em `src/`, `tests/`, `docs/`, `scripts/` e `CLAUDE.md` existe, salvo a § 647 desta revisão. As medidas da § 632 batem com os arquivos da medida; o `claude-md.test.ts` e o `pendencias.test.ts` passaram.

## O que fica

Nenhum achado médio ou alto ficou aberto. Nenhum baixo sobrou para o grupo 24 do `docs/PENDENCIAS.md`: o único baixo que sobreviveu (c-2) foi corrigido. Os refutados ficam registrados aqui, com o motivo do cético; o a-1 (a vista a 320 × 640) e o b-1 (a ordem do Tab abaixo de 480 px) são escolhas que uma run de ajuste de layout ou de acessibilidade pode rever.
