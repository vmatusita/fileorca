# Plano de UX e qualidade de vida do FileOrca (F14 a F18)

9/nov/2026 · Victor Yuki Matusita · complementa o PLANO-MELHORIAS.md e o PLANO-FILEORCA.md (v7.1). Até a F17, este plano não muda nenhum item do contrato: cada ficha é a fonte nº 1 da run dela, como manda o CLAUDE.md. A única mudança no contrato é a da F18 (seção "Mudança no contrato"), e ela só vale se alguma candidata passar na regra.

## Resumo

Cinco runs e duas paradas suas. A primeira resolve o relato de usuário; as outras atacam o atrito que eu medi no ar nas ferramentas de maior volume.

| # | Run | O que entrega | Lentes da revisão | Merge |
|---|---|---|---|---|
| 1 | **F14 · Páginas de PDF à vista** | A miniatura mostra a página inteira; a lupa abre a página grande, com anterior e próxima; miniaturas pequenas ou grandes; no Excluir, a página marcada mostra que vai sair; Shift+clique e Inverter; "Ver o PDF novo" antes de baixar; a grade de 300 páginas sem travar | 5 (mexe em `src/engine/pdf/`) | Automático |
| — | Você | Confere no celular; passa as candidatas da F18 no Keyword Planner | — | — |
| 2 | **F15 · Imagem, QR e o caminho entre ferramentas** | Ordem e lixeira na Imagem para PDF; tirar um arquivo pronto de qualquer lote; chips certos depois de virar PDF; Comprimir "até um tamanho"; o chip que leva o arquivo também para as ferramentas com ação; o QR code logo abaixo do campo no celular | 5 (mexe na caixa do compartilhar) | Automático |
| 3 | **F16 · Calculadoras: digitar sem tropeço e exportar números** | O campo para de recusar o próprio formato; erro só quando o valor sai da faixa; uma fala por digitação; o foco não cai no `body`; CSV com números de verdade | 5 a 6 (dinheiro) | Automático |
| 4 | **F17 · AVIF para JPG e Converter para WebP/AVIF** | As duas ferramentas já aprovadas no `data/keywords.csv` (a "run 2b"), em en, pt e es | 3 | Automático |
| 5 | **F18 · Ferramentas novas que passarem na regra** | Só as candidatas da seção E que passarem no Keyword Planner; se nenhuma passar, a run não acontece | 3, ou 5 se entrar o Organizar PDF (motor) ou o Remover localização (privacidade) | Automático |

**Por que nessa ordem.** A F14 tem relato de usuário e um defeito que eu medi (a miniatura corta a página). A F15 vem depois porque mexe nas ferramentas de 100K–1M buscas por mês do `keywords.csv` (Imagem para PDF, Comprimir imagem, QR code). A F16 mexe nas páginas de RPM mais alto. A F17 e a F18 trazem páginas novas; elas vêm por último porque não consertam nada que já está no ar.

## Suas respostas (9/nov/2026)

- **Ver a página do PDF:** lupa em cada miniatura. O toque na página continua marcando.
- **Novas funções:** o AVIF para JPG e o Converter para WebP/AVIF entram. As candidatas fora do catálogo passam pelo Keyword Planner, e só entram as que passarem na regra da seção E.

## O diagnóstico

Medido em 9/nov/2026 no fileorca.com, no Chromium do app, a 375 × 812 e a 1280 × 800, com um PDF de 12 páginas Carta (título de 28 pt, texto de 11 pt) e três JPG gerados na própria página (nada foi enviado). As linhas com id do `docs/PENDENCIAS.md` foram reconferidas no código de hoje.

| # | Onde | Achado | Evidência | Run |
|---|---|---|---|---|
| D1 | Grade de páginas do PDF (Excluir, Dividir, Girar, Assinar, Reorganizar) | **A miniatura corta os 22 % de baixo de toda página em pé.** A `.fo-page__sheet` é quadrada (`aspect-ratio: 1`) com `overflow: hidden`, e o `max-height: 100%` da `img` não vale dentro da célula da grade. O rodapé, a assinatura e o número da página nunca aparecem. | A 1280: a `img` tem 96 × 124 px numa folha de 96 × 96. A 375: 146 × 188 numa folha de 146 × 146. | F14 |
| D2 | A mesma grade | **O relato do usuário.** A página é pequena demais para reconhecer, e não há como abrir maior. No computador a miniatura é ainda menor que no celular. | O texto de 11 pt sai com 1,7 px de altura a 1280 e 2,6 px a 375; o título de 28 pt, com 4,4 e 6,7 px. A grade usa `minmax(112px, 1fr)` e pede imagens de 240 px. | F14 |
| D3 | Resultado das ferramentas de PDF | Não dá para conferir o PDF novo antes de baixar. Para saber se saiu a página certa, a pessoa baixa e abre em outro programa. | A ResultCard do PDF só tem Baixar e Começar de novo; a das imagens tem "Antes e depois". | F14 |
| D4 | Lista do Juntar PDF | Cada linha mostra nome, páginas e tamanho, e nada do conteúdo. Dois arquivos de nome parecido são indistinguíveis. | O FileCard do PDF usa o ícone (F5a F-6, escolha da F10). | F14 (válvula) |
| D5 | A grade com muitas páginas | Um toque redesenha todas as células, e o custo cresce com o número de páginas (300 na `gen-paginas-300`). Miniaturas maiores pioram. O E-5 do PENDENCIAS (memória por miniatura) já está resolvido no código: o `drawPage` chama `page.cleanup()` e o canvas é zerado depois de cada desenho. O E-4 (o worker do PDF.js que fica vivo no caminho sem `OffscreenCanvas`) depende do `release()`, e ninguém mediu. | PENDENCIAS F5a E-2, E-4 e E-5; `src/engine/pdf/pdfjs.ts:196` e `:211`; `release()` em `src/tools/pdf/client.ts`. | F14 |
| D6 | Excluir páginas, FAQ | A pergunta "Dá para desfazer?" manda apertar Começar de novo e escolher o arquivo outra vez; desde a F13a, nas ferramentas com ação, as opções ficam à vista depois do resultado e uma mudança traz a ação de volta. | `src/tools/delete-pdf-pages/i18n/pt.ts`, FAQ 2; comentário da faixa em `PdfPanel.tsx` (§ 483). | F14 |
| D7 | Imagem para PDF (100K–1M) | **Não dá para mudar a ordem nem tirar uma foto da lista.** As linhas não têm nenhum botão; o FAQ manda começar de novo e escolher os arquivos na ordem certa. O Juntar PDF já tem setas (pelo toque e pelo teclado), arrastar com o mouse, lixeira e Desfazer (§ 479 e D-21). | Três fotos soltas fora de ordem: três linhas sem botão. FAQ "Como mudo a ordem das páginas?" em `image-to-pdf/i18n/pt.ts`. | F15 |
| D8 | Imagem para PDF, chips | Depois de criar um PDF, os chips oferecem Comprimir imagem e Redimensionar imagem, ferramentas que não abrem PDF. | `next: ['compress-image', 'resize-image']` em `src/tools/image/registry.ts`; o tipo de `next` só aceita ferramenta de imagem. | F15 |
| D9 | Todo lote de imagem | Um arquivo já pronto não sai do lote: a lixeira só existe na linha de erro. Uma foto errada num lote de 20 vai junto no ZIP. | `rowProps` do `ImagePanel.tsx`: `onRemove` só no estado `error`. | F15 |
| D10 | Comprimir imagem (100K–1M) | Só "Recomendado" e "Forte". Formulário de concurso, gov.br ou faculdade pede "até 300 KB", e a pessoa precisa adivinhar ou caçar uma preset. O motor já faz qualquer tamanho. | A operação `{ kind: 'target', maxBytes }` existe e é a das presets de 100 KB e 1 MB. | F15 |
| D11 | Chips que levam o arquivo | Para os destinos que esperam uma ação, o chip só abre a página, e a pessoa escolhe o arquivo de novo. Pelos `next` de hoje, esses destinos são o Juntar (vindo do Dividir, do Comprimir, do Girar e do Desbloquear), o Dividir (do Desbloquear), o Reorganizar (do Excluir) e o Proteger (do Comprimir, da Numeração, do Assinar e da Marca d'água); a F15 soma o Juntar vindo da Imagem para PDF. | PENDENCIAS F13a h-1; DECISOES § 497; `next` em `src/tools/pdf/registry.ts`. | F15 |
| D12 | Gerador de QR code (100K–1M), celular | O código aparece longe do campo: a 375 × 812, o campo termina em 437 px, o QR ocupa de 769 a 1.072 px e o Baixar PNG fica em 1.118 px. Com o teclado aberto, a pessoa nunca vê o código nascer enquanto digita. | Medido na `/pt/gerador-de-qr-code/`. | F15 |
| D13 | Calculadoras, campos | **O campo recusa o próprio formato.** Na hipoteca, ao trocar "375,000" por "3755,000" (3,755,000, dentro da faixa), aparece "Enter a home price from $10,000 to $20,000,000" e o card fica no último resultado. A causa: o `parseScaled` exige de 1 a 3 dígitos antes da primeira vírgula. | Reproduzido em `/mortgage-calculator/`; `PATTERNS` em `src/calc/parse.ts`. PENDENCIAS F4 DES-3, com F7 a-4, F13b R-b-1 e R-b-3. | F16 |
| D14 | Calculadoras, CSV | O CSV de 8 calculadoras grava o texto da tela (milhar, unidade, sinal U+2212, data por extenso). No Excel e no Google Planilhas a coluna vira texto e não soma. | PENDENCIAS F7 a-3, com F7 a-6, F6 g-2 e F4 COR-16. | F16 |
| D15 | Catálogo de imagem | AVIF para JPG (10K–100K, subindo) e Converter para WebP/AVIF ("convert image to webp", 1K–10K) estão `entra` no `keywords.csv` desde a F0 e ficaram de fora pela válvula da F2. O motor está pronto. | DECISOES § 85; PENDENCIAS F2 2b. | F17 |
| D16 | Busca (Ctrl K) | A busca abre com `showModal()`, e o fundo do diálogo (`::backdrop`) cobre a janela inteira enquanto ela está aberta, âncora do AdSense incluída. O `docs/design/README.md` diz que "nada do site" cobre a âncora, e o Google pede que o conteúdo não cubra anúncio. É aberta pela pessoa e dura segundos, mas é uma exceção que ninguém registrou. | `openSearch()` em `src/search/search.ts`; regra "O único fixo é a âncora do AdSense, e nada do site a cobre" do design system. | Você decide (a F14 registra no PENDENCIAS) |

**Onde passei e não achei atrito novo:** a home, os hubs, os guias, a busca (fora o D16), o cabeçalho, o rodapé e a página de apoio. O que segue aberto nelas já está no `docs/PENDENCIAS.md` (texto, SEO e leitor de tela) e continua com as runs de ajuste de lá.

## O que não entra, e por quê

- **"Tela cheia" por cima da página.** Por dois motivos. Primeiro, a página grande cobriria a âncora do AdSense enquanto aberta: o design system diz que nada do site a cobre ("Layout e anúncios" no `docs/design/README.md`; a § 35 fez o aviso de cookies subir por causa disso), e o Google pede que o conteúdo não cubra anúncio. Segundo, a Fullscreen API não existe no iPhone para nada além de vídeo. A F14 abre a página grande **dentro da própria ferramenta**, na faixa de baixo do painel, na largura da coluna. No celular isso dá a mesma largura que a tela cheia daria (a coluna é a tela menos 32 px), e o "Ampliar" dobra o tamanho para ler o texto miúdo.
- **O toque que abre a página.** Foi a sua escolha: marcar 10 páginas continuaria com 10 toques, não 20.
- **Pinça e gestos próprios de zoom.** A vista da página tem "Ampliar" (o dobro da largura da coluna, rolando) e deixa a pinça do navegador como está. Gesto próprio é código frágil nos dois motores e briga com a rolagem.
- **Guardar o tamanho das miniaturas.** Seria mais uma chave no `localStorage`, que a Privacidade teria de citar nos três idiomas. A escolha vale enquanto a página está aberta.
- **Evento novo no GA4.** O `tool_start` e o `tool_complete` das cinco ferramentas da grade já mostram se a conclusão sobe. Evento novo muda a Privacidade nos três idiomas.
- **Uma página "JPG para PDF".** Falha no teste 2 da regra da página programática ("o preset muda a ferramenta, não só o título") e canibaliza a Imagem para PDF. A saída é pôr o termo na busca do site e no título dela, numa run de SEO do PENDENCIAS.
- **"Suas ferramentas recentes" e "cenário salvo".** Continuam descartados pelos motivos da F10 (A-2 e A-7): aparelho compartilhado, consentimento e a promessa da Privacidade. Nenhum dado novo muda isso.
- **Achar páginas em branco sozinho.** Pede desenhar todas as páginas; num PDF de 300 páginas no celular, são minutos de CPU. A vista da página resolve a conferência.
- **A grade no PDF para JPG.** Ele roda sozinho a cada mudança de opção, então cada toque na grade refaria a conversão de todas as páginas. O intervalo digitado continua, e a vista da página não entra nele.
- **Miniatura da página 1 no Juntar.** A F10 escolheu o ícone (F5a F-6). O botão "Ver páginas" da F14 dá o mesmo resultado sem desenhar nada até a pessoa pedir.
- **PDF para Word e editar o texto do PDF.** Continuam no "Fora do escopo" do PLANO-FILEORCA: só saem bons com servidor.
- **O resto do backlog com gatilho** (favicon, paleta, Base64, foto de passaporte, vídeo e áudio, remover fundo): fica com o gatilho de hoje. Só o "remover metadados" vira candidata, porque o motor já faz.

## Regras de todas as runs deste plano

Valem junto com o CLAUDE.md, as regras de "Execução por IA" do PLANO-FILEORCA e as "Regras novas de toda run" do PLANO-MELHORIAS.

- **O que não muda:** nenhum arquivo sai do aparelho; nenhum número ou texto digitado, nome de arquivo ou página escolhida vai para a URL, o histórico do navegador ou o GA4; nenhuma chave nova no `localStorage`; nenhum evento novo no GA4; nenhuma dependência nova; anúncio a 150 px ou mais do Baixar, dos campos, do painel e da Oli; nada de anúncio dentro do painel ou da vista da página; nada do site por cima da âncora; amarelo (`sun`) só no Baixar; a Oli com as dez poses fechadas e `aria-hidden`.
- **Orçamento:** JS inicial de até 80 KB com gzip; os mesmos arquivos JS e as mesmas requisições por página do ponto de partida (`budgets.spec.ts` e `i18n-budgets.spec.ts`), menos nas páginas novas da F17 e da F18, que carregam o mesmo número de arquivos das irmãs; CLS de até 0,05 e zero sem gesto; Lighthouse ≥ 90; axe sem violação nos dois temas e nos dois navegadores; alvos de 48 px.
- **Texto:** en, pt e es nos arquivos de tradução, pelo glossário de `docs/i18n/` e pelo `lint:texto`. Frase de FAQ ou de especificação que o comportamento novo desmente é corrigida na mesma run.
- **Design system:** componente, ícone ou token novo entra em `docs/design/` com § no DECISOES.md e o contraste calculado. Mudança de regra do design system só a que a ficha nomeia.
- **CI:** medir o tempo das partes antes de somar spec; spec novo entra na parte pelo tempo medido (`docs/claude/playwright.md`), com o alvo de 700 s por parte. Se for preciso redividir as partes, a mudança em `.github/workflows/` vai numa PR separada, com o seu merge, e a run segue sem ela.
- **Ordem:** cada run começa com a PR da anterior já mesclada na main, para os § do DECISOES.md e os grupos do PENDENCIAS não colidirem.
- **Pendências:** o que a run fecha sai do `docs/PENDENCIAS.md`; o que ela deixa entra num grupo novo com o nome dela.

## Fichas para a prompt-ultracode

Uma ficha por run, no formato do apêndice do PLANO-FILEORCA. Critério é sempre algo que um comando confere.

### F14 · Páginas de PDF à vista

| Campo | Conteúdo |
|---|---|
| Missão | A pessoa reconhece cada página antes de excluir, dividir, girar, assinar ou reorganizar, e confere o PDF novo antes de baixar. |
| Entradas | Este plano (diagnóstico D1 a D6 e D16, seções A e B); `src/tools/pdf/` (`PageGrid.tsx`, `tools.tsx`, `PdfPanel.tsx`, `types.ts`); `src/components/FileCard.tsx`; `src/engine/pdf/pdfjs.ts` e `render.ts`; `docs/claude/pdf.md` e `docs/claude/design-e-oli.md`; `docs/design/` (Button, OptionGroup, FileCard, ícones, "Layout e anúncios"); DECISOES § 35, § 180 e § 483; PENDENCIAS F5a E-2, E-4, E-5 e F4-F7 d-2 e d-8; o relato do usuário (miniatura pequena demais para achar a página a excluir). |
| Dentro | **1. O corte (D1):** a miniatura mostra a página inteira, em pé, deitada e com `/Rotate`: a folha recebe a proporção da página como ela vai sair, já com os giros da pessoa no modo girar (proporção invertida quando o giro é ímpar), e a `img` se encaixa nela em "contain". **2. A lupa e a vista da página** (seção A): nas cinco ferramentas da grade. **3. Pequenas e Grandes** (seção B). **4. No Excluir, a página marcada mostra que sai** (seção B). **5. Shift+clique e Inverter seleção** (seção B). **6. "Ver o PDF novo"** (seção A, modo resultado): em todo resultado que é um PDF só e sem cifra. **7. Juntar:** "Ver páginas de {nome}" em cada linha, que abre a vista daquele arquivo. **8. Desempenho e memória:** E-2 (cada célula vira um componente com `memo`, que só redesenha quando o estado dela muda); E-4 (no caminho sem `OffscreenCanvas`, ao trocar de arquivo, ao tirar uma linha do Juntar, no Começar de novo e a cada execução nova, o `release()` fecha o documento e termina o worker do PDF.js daquele arquivo; a vista do resultado faz o `inspect()` dos bytes de saída, e ela e a do Juntar fazem o `release()` ao voltar); E-5 vai para "Já corrigidos" do PENDENCIAS, com § que cita o `page.cleanup()` e o canvas zerado. **9. Falas:** d-2 (Marcar todas, Desmarcar todas, Inverter seleção e o intervalo digitado dizem a contagem) e d-8 (no Girar página por página, uma frase por giro). **10. Textos:** os novos nos três idiomas (seção B traz os do pt); os passos "Como funciona" das cinco ferramentas citam a lupa; o FAQ do D6 e qualquer outro que o comportamento desminta. **11. Documentos:** `docs/design/components/PageView/` (README e preview); o ícone `zoom` (lupa com +) em `docs/design/assets/Icons/`; a mudança de regra que esta run faz, com §: a linha "Ícone sozinho só em ação de linha" do `docs/design/README.md` passa a citar a lupa da grade de páginas como ação de item; a seção da F14 em `docs/claude/pdf.md`; o PLANO-UX-QV.md commitado na raiz; uma linha no topo do PLANO-FILEORCA.md apontando para ele; e, no fim da seção "Fonte de verdade" do CLAUDE.md, só acrescentando: "O PLANO-UX-QV.md traz as fichas da F14 à F18; a ficha de cada run continua sendo a fonte nº 1, e a mudança no contrato dele entra pela linha 15 do PLANO-MELHORIAS.md". **12. Pendências:** o grupo novo "O que a F14 deixou", com duas linhas para você: o D16 (a busca por cima da âncora, "Victor decide") e o "JPG to PDF" como termo da busca do site e do título da Imagem para PDF ("Run de ajuste de SEO"). |
| Fora | Mudar o que o toque na página faz (continua marcando); diálogo modal, popover ou qualquer camada por cima da página; Fullscreen API; mexer na URL ou no histórico (§ 114); gesto próprio de pinça; chave nova no `localStorage`; evento novo no GA4; arquivo JS novo; mudança no motor além do item 8; miniatura da página 1 na linha do Juntar; mexer na busca (o D16 é decisão sua). |
| Critérios | (1) Nas cinco ferramentas, nos dois navegadores, com uma página em pé, uma deitada, uma com `/Rotate 90` e, no Girar, depois de 1 e de 3 giros: o `getBoundingClientRect` da `img` cabe inteiro na `.fo-page__sheet` e ocupa pelo menos 95 % do encaixe "contain". (2) A vista abre pela lupa de cada uma das cinco ferramentas; a imagem tem largura natural ≥ largura em CSS × DPR; a 360 × 740, uma página Carta em pé tem pelo menos 300 px de largura em "Ajustar" e pelo menos 600 px em "Ampliar"; a 1280 × 800, em "Ajustar", a página inteira e as duas barras cabem na janela, com a página de pelo menos 520 px de altura; com o foco dentro da vista, ← e → trocam a página, Home e End vão às pontas, e Esc volta às páginas com o foco no botão que abriu a vista; o arrasto lateral de 48 px troca a página em "Ajustar". (3) Marcar ou girar na vista muda a grade e a contagem, com uma fala só; no Girar, a imagem grande mostra o giro acumulado. (4) No build de teste com IDs de anúncio, com a vista aberta nos dois modos: todo controle dela fica a 150 px ou mais de todo anúncio, a 360 × 740 e a 1280 × 800 (o `ads.spec.ts` mede com a vista aberta), e nenhum elemento do site fica por cima da âncora simulada. (5) Do toque na lupa até a imagem grande chegar, nenhum layout-shift sem gesto (`hadRecentInput` falso) no Chromium. (6) "Ver o PDF novo" aparece em todo resultado que é um PDF só e sem cifra (o Dividir com uma parte inclusive), e nunca no Proteger, no PDF para JPG nem com ZIP (o teste percorre as 12 ferramentas); o retângulo continua com 356 px a 320 e a 360 e com 340 px a 1280, nos três idiomas (ou o botão vai para a faixa, pela regra da seção A). (7) A lupa não intercepta a caixa da `img` nem o check, e fica com 48 px, de 320 a 1280 px, com números de página de até três dígitos. (8) E-2: na `gen-paginas-300`, o `ScriptDuration` do Chromium (CDP `Performance.getMetrics`, média de 20 toques) cai para no máximo a metade do medido no `dist/` do ponto de partida, na mesma máquina e na mesma rodada (como a F13b fez com o `dist-base`). E-4: no caminho sem `OffscreenCanvas`, com o `Worker` trocado por um espião no `addInitScript`, depois de trocar de arquivo e do Começar de novo nenhum worker do arquivo anterior fica sem `terminate`. (9) Shift+clique marca da âncora até a página tocada e vale como clique simples sem âncora, com a fala da seção B. (10) Orçamento: o JS inicial das páginas de PDF cresce no máximo 8 KB com gzip, com os mesmos arquivos e requisições; se passar, a run registra § e pendência e não corta os itens 1 a 6. (11) axe com a vista aberta nos dois temas e nos dois navegadores; Lighthouse ≥ 90; pnpm verificar verde. |
| Válvula de estouro | O item 7 (Juntar) pode ir para uma F14b. Nunca cortar os itens 1 a 6 e 8 a 12. |
| Destino | Branch fase-14, PR, relatório em docs/relatorios/fase-14.md. |

**Depois da F14, você:** abre `/pt/excluir-paginas-pdf/` no seu Android com um PDF de verdade, usa a lupa, arrasta para o lado, amplia, marca uma página na vista e volta à grade. No computador, confere as setas e o Esc. Decide o D16 (a busca por cima da âncora). Por 2 semanas, acompanha no GA4 o `tool_complete` sobre o `tool_start` das cinco ferramentas da grade. Passa as candidatas da seção E no Keyword Planner (30 min).

### F15 · Imagem, QR e o caminho entre ferramentas

| Campo | Conteúdo |
|---|---|
| Missão | Tirar os recomeços desnecessários das ferramentas de maior volume: ordem e lixeira no lote, o próximo passo certo, o tamanho que o formulário pede e o QR code à vista enquanto a pessoa digita. |
| Entradas | Este plano (D7 a D12 e seções C e D); `src/tools/image/` (`ImagePanel.tsx`, `registry.ts`, `types.ts`, `inbox.ts`); `src/tools/pdf/PdfPanel.tsx` (a lista do Juntar, § 479, como modelo, e a chegada pelo chip); `src/tools/compress-image/` e as presets; `src/engine/image/target.ts`; `src/share/`; `src/tools/qr-code-generator/`; `docs/claude/imagem.md`, `docs/claude/pdf.md` e `docs/claude/service-worker.md`; PENDENCIAS F13a h-1. |
| Dentro | **1. A lista da Imagem para PDF** (seção C). **2. Tirar um arquivo pronto de qualquer lote de imagem:** a lixeira com Desfazer na linha pronta, como no Juntar; o ZIP é refeito sem codificar de novo. Ao tirar um de dois arquivos, a lista fica à vista enquanto o Desfazer espera; na próxima ação, com um arquivo só, a ilha volta ao card de um arquivo. Com um arquivo só desde o começo, não há lixeira: o Começar de novo já faz isso. **3. Os chips da Imagem para PDF:** Comprimir PDF, Juntar PDF e Numerar páginas, levando o PDF quando o destino aceita; o tipo de `next` das imagens passa a aceitar vizinhas de PDF, como o `ImageNeighbour` faz do outro lado. **4. A chegada nas ferramentas com ação** (h-1): o arquivo que o chip leva entra na lista do Juntar, ou no painel do Dividir, do Reorganizar e do Proteger, e espera a ação; os rótulos desses chips nos três idiomas; o Proteger continua sem levar nada para fora (o PDF dele sai cifrado); um § substitui a regra "só linkam" da § 497. **5. Comprimir "até um tamanho"** (seção D). **6. O QR code no celular:** a ordem do DOM passa a ser campo, saída (o código e os dois Baixar) e opções; a partir de 768 px, áreas de grade mantêm na tela o desenho de hoje, e um § registra a ordem de Tab nova (campo, saída, opções), também no computador. Abaixo de 768 px, a prévia tem até 240 px de lado. |
| Fora | Codificar de novo uma imagem pronta por causa da ordem ou da lixeira; mudar o motor de imagem (a operação `target` já existe); gravar o tamanho digitado em qualquer lugar; evento novo; mudar o desenho do QR na tela a partir de 768 px; chip novo para o Excluir, o Assinar ou a Marca d'água (nenhum `next` leva a eles hoje). |
| Critérios | (1) Imagem para PDF com 3 fotos fora de ordem: as setas (pelo toque e pelo teclado) e o arrastar com o mouse põem na ordem; o PDF sai na ordem da lista, conferido no Node com o PDF.js; mudar a ordem ou tirar uma foto depois do resultado refaz só o PDF (o motor de imagem não é chamado de novo: contador no teste). (2) A lixeira com Desfazer em toda linha pronta, nos lotes de imagem; o ZIP refeito tem um arquivo a menos; de dois para um, a passagem descrita no item 2. (3) Os chips da Imagem para PDF levam a ferramentas de PDF que existem nos três idiomas (teste sobre o registro). (4) O chip leva o arquivo ao Juntar, ao Dividir, ao Reorganizar e ao Proteger, nos dois navegadores, e nada sai do aparelho (o `pdf-privacy.spec.ts` e o `launch-claims.spec.ts` cobrem o caminho novo). (5) "Até 200 KB" num JPG de 12 MP e num PNG com transparência: o arquivo sai com no máximo 200.000 bytes, em JPG, com a nota de fundo branco no PNG; o número digitado não aparece na URL, no `dataLayer`, no `localStorage` nem no `sessionStorage`. (6) QR a 360 × 740, numa volta (sem o aviso de cookies): depois de digitar um link, o código inteiro fica acima da dobra em en, pt e es, e o Baixar PNG fica a no máximo 200 px abaixo dela. Com a janela de 360 × 420 (o teclado aberto) e o campo rolado até o topo da janela, a metade de cima do código fica à vista. A 1280 × 800, o screenshot do QR é igual ao de antes, a menos da ordem de Tab. (7) CLS da interação 0 no `tool-slot.spec.ts` com a lista da Imagem para PDF; distância e densidade de anúncio verdes; orçamento e Lighthouse como nas regras; pnpm verificar verde. |
| Válvula de estouro | Os itens 2 e 4 podem ir para uma F15b. Nunca cortar os itens 1, 3, 5 e 6. |
| Destino | Branch fase-15, PR, relatório em docs/relatorios/fase-15.md. |

**Depois da F15, você:** no celular, monta um PDF com 5 fotos fora de ordem e conserta a ordem; comprime uma foto "até 300 KB"; digita um link no QR com o teclado aberto e vê o código aparecer.

### F16 · Calculadoras: digitar sem tropeço e exportar números de verdade

| Campo | Conteúdo |
|---|---|
| Missão | O campo aceita o que a pessoa digita no formato da página, só reclama de valor fora da faixa, fala uma vez por digitação, e o CSV abre no Excel e no Google Planilhas com números que somam. |
| Entradas | Este plano (D13 e D14); `src/calc/parse.ts`; `src/tools/calc/` (`CalcField.tsx`, `form.ts`, `store.ts`, `CalcPanel.tsx`, `exports.ts`, `view.ts`); `src/engine/pdf/report.ts`; `docs/claude/calculadoras.md`; PENDENCIAS F4 DES-3, F7 a-4, F13b R-b-1, F13b R-b-3 e o grupo 3 inteiro (F7 a-3, F7 a-6, F6 g-2, F4 COR-16). |
| Dentro | **1. O formato enquanto se digita (DES-3):** em cada idioma, o separador de milhar (a vírgula em en e es, o ponto em pt) seguido de exatamente 3 dígitos é milhar, qualquer que seja o tamanho do grupo antes dele ("3755,000" é 3.755.000); seguido de 1 ou 2 dígitos no fim, continua o caso de hoje, com a dica do separador decimal; em qualquer outra posição, ele é ignorado. O campo volta ao formato do idioma ao sair. **2. O erro de casas (a-4):** um número bem formado que só passa nas casas do campo recebe "Use até {n} casas decimais" (com o n do campo; "Use até 1 casa decimal" com n = 1; "Use um número inteiro" com n = 0), sem a faixa e sem a dica do separador, nos três idiomas. **3. Uma fala por digitação (R-b-3):** enquanto um campo tem um rascunho que não lê, a região viva do card espera. **4. O foco (R-b-1):** quando o Baixar sai do DOM com o foco a caminho dele, o foco vai para o controle seguinte que existe na ordem de tabulação, nunca para o `body`, e sem prender o foco no campo. **5. O CSV (a-3):** células numéricas como número, sem milhar, unidade nem sinal U+2212; a unidade no cabeçalho da coluna; datas AAAA-MM-DD; o separador e o BOM de hoje. **6. O resto do grupo 3:** a-6 (o círculo da Square footage diz que a medida é o diâmetro), g-2 (a taxa com o período no PDF e no exemplo resolvido) e COR-16 (rótulo em toda linha do PDF e um "você" só na Savings goal). **7. Registro:** um § com os bytes novos do CSV e do PDF em inglês, como o grupo 3 pede. |
| Fora | Fórmula, motor de conta, oráculo e fixtures (nenhum número de resultado muda); o layout do card da F13b; campo novo; os itens do grupo 2 do PENDENCIAS que mexem em conta. |
| Critérios | (1) Vitest do `parse.ts` com os casos dos três idiomas: "3755,000" (en) e "3755.000" (pt) leem 3.755.000; "6,5" na taxa em en continua com a dica; "1,234" é 1.234; "375,0005" lê 3.750.005; "3,755,00" continua com a dica; controles negativos para o que já era recusado; a mensagem de casas com n = 0, 1 e 2. (2) Na `/mortgage-calculator/`, trocar "375,000" por "3755,000" não mostra erro e a parcela muda; o mesmo em pt e es nas calculadoras de lá. (3) Uma fala só na região viva para cada valor digitado (teste com o `MutationObserver` da região). (4) O Tab depois de um valor errado no último campo principal leva o foco ao controle seguinte, nunca ao `body`, a 360 e a 1280, nos dois navegadores; Shift+Tab volta ao campo. (5) Nenhuma célula do CSV de nenhuma calculadora, em en, pt e es, tem milhar, unidade, U+2212 ou data por extenso (teste sobre o arquivo gerado); o `money-privacy.spec.ts` continua verde. (6) Os 16 ms por tecla: o p95 do `money-speed.spec.ts` não piora mais que 1 ms. (7) As fixtures do oráculo e o `calc-oracle.test.ts` sem mudança; pnpm verificar verde. |
| Válvula de estouro | O item 6 pode ir para uma F16b. Nunca cortar os itens 1 a 5 e 7. |
| Destino | Branch fase-16, PR, relatório em docs/relatorios/fase-16.md. |

**Depois da F16, você:** na hipoteca, apaga e digita no meio do número; abre um CSV no Google Planilhas e soma uma coluna.

### F17 · AVIF para JPG e Converter para WebP/AVIF (a run 2b)

| Campo | Conteúdo |
|---|---|
| Missão | Pôr no ar as duas ferramentas de imagem que o `keywords.csv` aprovou na F0 e que a válvula da F2 tirou, nos três idiomas. |
| Entradas | PENDENCIAS F2 2b (a lista inteira do que falta); DECISOES § 85 e ADR-003; os commits `3812f49` e `840d565` (os casos da matriz); `src/tools/image/registry.ts`, `src/i18n/routes.ts` e os textos de imagem; `docs/claude/imagem.md` e `docs/claude/idiomas.md`; `docs/lancamento/` (as 18 linhas marcadas `<!-- muda com a 2b -->`). |
| Dentro | As duas páginas em en, pt e es (slugs `avif-to-jpg` e `convert-to-webp` em inglês, os de pt e es pelo glossário), com os blocos do `gate:conteudo`. O Converter para WebP/AVIF é o desenho da F2: a escolha da saída entre WebP (o padrão) e AVIF, com o `ConvertToOptionsTexts`. O registro (`IMAGE_TOOL_IDS`, `IMAGE_PAGES`, chips e relacionadas); o `CONVERTER_FOR` com o AVIF, para a recusa das outras ferramentas levar à AVIF para JPG; os casos da matriz (AVIF na saída nos dois navegadores); a medida do codificador AVIF registrada num § (segundos por foto de 12 MP no runner do CI, nos dois navegadores), com a matriz nas fixtures pequenas para caber no tempo da parte; o lugar no hub, na home, no rodapé, no menu e na busca; sitemap, hreflang, OG e schema; as contagens do site ("eight" vira "ten" e o equivalente em pt e es) e do kit de lançamento. |
| Fora | Mudar o que as outras ferramentas aceitam; presets novas; guia novo. |
| Critérios | A matriz das duas ferramentas com cada fixture que elas aceitam, nos dois navegadores; a recusa de AVIF nas outras ferramentas com o link novo; `gate:seo`, `gate:links`, `gate:conteudo` e `launch-kit.test.ts` verdes; cada página nova com os mesmos 2 arquivos JS e 6 requisições das irmãs; a densidade de anúncio em até 30 % a 360 × 740; nenhuma parte do CI acima de 700 s; pnpm verificar verde. |
| Válvula de estouro | O pt e o es podem ir para uma F17b se o CI passar de 700 s numa parte. Nunca cortar as duas páginas em inglês e a matriz. |
| Destino | Branch fase-17, PR, relatório em docs/relatorios/fase-17.md. |

**Depois da F17, você:** pede no Search Console a indexação das seis páginas novas.

### F18 · Ferramentas novas que passarem na regra

Só acontece se alguma candidata da seção E passar. A ficha é gerada com os números que você tirou do Keyword Planner.

| Campo | Conteúdo |
|---|---|
| Missão | Pôr no ar, nos três idiomas, as candidatas da seção E que passaram na regra, reusando o motor e as peças que existem. |
| Entradas | A seção E e a "Mudança no contrato" deste plano; os números do Keyword Planner e do Google Trends que você colar na conversa; `docs/claude/pdf.md` ("Como acrescentar uma ferramenta de PDF") e `docs/claude/imagem.md`; a vista da página e a grade da F14. |
| Dentro | **1.** As linhas das candidatas no `data/keywords.csv` (fase F18), com os seus números e a decisão pela regra. **2.** A linha 15 na tabela "Mudanças no contrato" do PLANO-MELHORIAS.md, com o texto da seção "Mudança no contrato" deste plano, e o § no DECISOES.md. **3.** Cada candidata `entra`, como a seção E descreve, com as páginas em en, pt e es, o registro, as rotas, os textos, o lugar no hub, no menu, na home e na busca, sitemap, hreflang, OG e schema, e as contagens do site e do kit de lançamento. **4.** Uma ferramenta de PDF nova segue os cinco passos do `docs/claude/pdf.md`, com a operação testada no Node sobre as fixtures antes da ilha e o caso na matriz. **5.** A primeira preset de PDF cria a peça que falta: o `parent` no `PdfPageDef`, as rotas da preset e os blocos do `gate:conteudo`, como as presets de imagem. |
| Fora | Candidata `fora`; candidata fora da seção E; tudo o que o "Fora do escopo" do PLANO-FILEORCA mantém fora. |
| Critérios | Cada preset nova passa nos quatro testes da página programática, e cada ferramenta nova no `gate:conteudo`; a matriz cobre cada fixture que a ferramenta aceita, nos dois navegadores; o Remover localização prova no Node, sobre as fixtures com GPS, que a saída não tem Exif, XMP nem GPS e tem os mesmos pixels; `gate:seo`, `gate:links`, `gate:conteudo` e `launch-kit.test.ts` verdes; orçamento como o das irmãs; densidade de anúncio em até 30 %; pnpm verificar verde. |
| Válvula de estouro | O Organizar PDF (custo G) pode ir para uma F18b. As outras não se cortam. |
| Destino | Branch fase-18, PR, relatório em docs/relatorios/fase-18.md. |

## Especificações

### A. A vista da página (F14)

**A lupa.** Cada célula da grade ganha um botão de 48 px com o ícone `zoom`, na linha do número da página, alinhado à direita, fora da imagem: ele nunca cobre o rodapé da página, que é justamente o que o D1 quer mostrar. Ele é irmão do botão da página, nunca dentro dele. Nome acessível: "Ver a página {n} em tamanho grande". Segue o foco móvel da grade: só a lupa da célula ativa fica no Tab, como as setas do Reorganizar. É a ação de item da grade, a leitura que a F14 escreve na regra "Ícone sozinho só em ação de linha".

**Onde a página grande abre.** Na faixa de baixo do painel (a `.fo-band`), no lugar onde a grade está, e fica lá até a pessoa voltar: antes do resultado, no lugar da grade; no Girar página por página depois do resultado, dentro do "Ajustar" aberto, no lugar da grade; no modo resultado e no Juntar, como o primeiro item da faixa. Não é diálogo, popover nem camada por cima da página: a vista empurra o resto da página para baixo, por um gesto da pessoa, e nada do site cobre a âncora. A região de status do painel é a que fala. Nada muda na URL nem no histórico.

**De cima para baixo:**

1. Barra de cima: o título "Página {n} de {total}" (um `h3` com `tabindex="-1"`) e o botão "Voltar às páginas", com o ícone e a palavra.
2. A página, inteira e centrada, numa moldura com a proporção dela. Em "Ajustar" (o padrão), a largura da coluna, limitada pela altura `100dvh − 260px`, para as duas barras caberem na tela. Em "Ampliar", o dobro da largura da coluna, até 1.600 px em CSS, rolando nos dois sentidos dentro da moldura (`max-height: 75dvh`, `overscroll-behavior: contain`). Um botão alterna "Ampliar" e "Ajustar".
3. Barra de baixo: "Anterior", a ação da ferramenta e "Próxima", cada uma com o ícone `chevron` e a palavra. Abaixo de 480 px, em duas linhas: a ação na largura toda e, embaixo, Anterior e Próxima lado a lado. Na primeira e na última página, o botão do lado que não existe fica com `aria-disabled="true"` e não faz nada: ele continua focável, para o foco nunca cair no `body` quando a pessoa chega à ponta com ele.

**A ação de cada ferramenta,** um botão com `aria-pressed` e o rótulo fixo:

| Ferramenta | Ação |
|---|---|
| Excluir | "Tirar esta página" |
| Dividir (modo Escolher) | "Marcar esta página" |
| Assinar (modo Escolher) | "Assinar esta página" |
| Girar (página por página) | "Girar 90°" (um giro por toque, sem `aria-pressed`) |
| Reorganizar | Nenhuma: o título diz "Página {n} · posição {p} de {total}", com n o número no arquivo. Anterior e Próxima seguem a ordem atual da grade. Mover continua na grade |
| Juntar, "Ver o PDF novo" | Nenhuma: só ver |

A ação usa o mesmo caminho da célula (`onToggle`, `onTurn`), então a grade, a contagem e a operação mudam juntas. No Girar, a imagem grande mostra o giro acumulado. Cada troca de página diz uma vez, pela região do painel, "Página {n} de {total}", com o estado ("sai", "marcada", "girada {graus}°") quando houver.

**Teclado e toque:** com o foco dentro da vista, ← e → trocam a página, Home e End vão à primeira e à última, e Esc volta às páginas. Em "Ajustar", o arrasto lateral de 48 px ou mais na imagem (com menos de 30° de inclinação) troca a página, só com a pinça do navegador sem zoom (`visualViewport.scale` entre 0,99 e 1,01); em "Ampliar", o arrasto rola a moldura. Ao abrir, o foco vai para o título da vista. Ao voltar, o foco vai para o botão que abriu a vista: na grade, a lupa da página que estava à vista (essa célula vira a ativa do foco móvel e entra na tela com `scrollIntoView({ block: 'nearest' })`); no modo resultado, o "Ver o PDF novo"; no Juntar, o "Ver páginas" daquela linha.

**A imagem:** sai do cache das miniaturas (`thumbnails.get(index, width)`), com a largura arredondada para cima em 60 px: `min(1600, largura da moldura × DPR)` em "Ajustar" e `min(2400, …)` em "Ampliar". Enquanto ela chega, a miniatura de 240 px fica na mesma moldura, que já tem a proporção da página, e a troca não mexe em nada. Ficam guardadas no máximo três imagens grandes (a da tela, a anterior e a próxima); o resto é solto pelo `drop`.

**Modo resultado ("Ver o PDF novo"):** um botão fantasma ao lado do "Começar de novo", como o "Antes e depois" das imagens, quando o resultado é um PDF só e sem cifra. Abre a vista sobre os bytes de saída (`m.outs`), só para ver, com um cache próprio que é solto no Começar de novo e a cada execução nova. Se o botão não couber no retângulo de 356 px a 320 px em algum idioma, ele vira o primeiro item da faixa de baixo nos três idiomas, antes dos chips, com a altura reservada desde o gesto da ação, como os chips (§ 483). A vista do resultado faz o `inspect()` dos bytes de saída (o número de páginas e as caixas) e o `release()` ao voltar.

**Juntar:** o botão "Ver páginas de {nome}" entra na linha das ações de cada arquivo (setas, lixeira e ele), com 48 px; abre a vista daquele arquivo, só para ver, e só desenha o que a pessoa olha. Ela usa as caixas que a leitura do arquivo já deu e faz o `release()` ao voltar e quando a linha sai da lista.

### B. As miniaturas e a marcação (F14)

- **Pequenas e Grandes:** uma linha "Tamanho das páginas: Pequenas · Grandes" (o OptionGroup em segmento) acima da grade, em todos os modos. Pequenas é o padrão, com `minmax(128px, 1fr)` (16 px a mais que hoje, para a lupa caber ao lado do número de até três dígitos): duas colunas a 320 e a 360 px, cinco a 1280 px. Grandes é `minmax(232px, 1fr)`: uma coluna a 360 px e três a 1280 px. A imagem pedida é `min(720, largura da folha × DPR)`, arredondada para cima em 60 px; a troca solta as imagens da largura velha. A escolha não é guardada.
- **A lupa na célula:** na linha do número, alinhada à direita, fora da imagem (seção A).
- **No Excluir, a página que sai:** o círculo do check mostra a lixeira em vez do check, a imagem fica com opacidade de 40 % (o número e o círculo continuam com o contraste de hoje), e o nome acessível termina em ", sai". A contagem vira "{count} de {total} saem · o PDF novo fica com {left} páginas", com as formas de 1: "1 de 12 sai" e "fica com 1 página". No Dividir e no Assinar nada muda (o check quer dizer "entra").
- **Inverter seleção:** um botão ao lado de "Marcar todas" e "Desmarcar todas". No Excluir, inverter até marcar tudo continua dando o erro de "todas marcadas".
- **Shift+clique:** marca ou desmarca, da âncora até a página tocada, todas com o estado novo da página tocada. A âncora é a última página tocada na grade ou marcada na vista; antes do primeiro toque, e depois de Marcar todas, Desmarcar todas, Inverter seleção ou do intervalo digitado, não há âncora, e o Shift+clique vale como clique simples. Shift+Espaço faz o mesmo pelo teclado. A fala é "Páginas {from} a {to} marcadas" (ou "desmarcadas").
- **Os textos em pt** (a run escreve en e es pelo glossário): "Tamanho das páginas", "Pequenas", "Grandes", "Inverter seleção", "Ver a página {n} em tamanho grande", "Voltar às páginas", "Anterior", "Próxima", "Ampliar", "Ajustar", "Ver o PDF novo", "Ver páginas de {name}", "Página {n} de {total}", "Página {n} · posição {p} de {total}", "Tirar esta página", "Marcar esta página", "Assinar esta página", "Girar 90°".

### C. A lista da Imagem para PDF (F15)

- O mesmo comportamento do Juntar PDF (§ 479 e D-21), escrito na ilha de imagem (a lista do Juntar mora na ilha de PDF e não é um componente separado): em cada linha, as setas "antes" e "depois" (pelo toque e pelo teclado, com o foco que segue a linha movida), o arrastar com o mouse e a lixeira com Desfazer; a ordem da lista é a ordem das páginas.
- A miniatura de cada linha continua sendo a da foto, para a pessoa reconhecer.
- Mudar a ordem ou tirar uma foto depois do resultado refaz só o PDF: a chave do pacote passa a levar a ordem dos ids, e nenhuma foto é codificada de novo.
- O FAQ "Como mudo a ordem das páginas?" e o passo do "Como funciona" passam a dizer como mudar a ordem, nos três idiomas.

### D. Comprimir "até um tamanho" (F15)

- O segmento ganha a terceira escolha, "Até um tamanho", depois de "Recomendado" e "Forte".
- Com ela, aparece o campo "Tamanho máximo", com o sufixo KB, de 20 a 10.000, começando em 200. O valor vai para a operação `{ kind: 'target', maxBytes: valor × 1000 }`, a mesma das presets (1 KB = 1.000 bytes, a leitura menor, que passa também em formulário que conta 1.024).
- A ajuda diz que a foto sai em JPG e que a transparência vira fundo branco (a nota `flattened` do motor). Uma foto que já cabe volta só sem os metadados, como nas presets.
- O resumo do "Ajustar" diz "Até 200 KB". As presets de 100 KB e 1 MB continuam como estão.
- Se, nas fixtures de 12 MP, o motor não chegar a 20 KB, a run sobe o mínimo para o menor valor que ele alcança em todas e registra num §.

### E. As candidatas e a regra (F18)

**A regra** (a mesma lógica da F0, no Keyword Planner com país Estados Unidos e idioma inglês, e no Google Trends dos EUA em 12 meses):

- **Ferramenta nova:** `entra` com volume de 10K–100K ou mais e Trends diferente de caindo.
- **Preset (página de uma ferramenta que existe):** `entra` com volume de 1K–10K ou mais, Trends diferente de caindo e os quatro testes da regra da página programática.
- O resto fica `fora`, com a linha no `keywords.csv` do mesmo jeito.

**As candidatas:**

| Candidata | Termo para o Keyword Planner | Tipo | Como é feita | Custo |
|---|---|---|---|---|
| Organizar PDF | organize pdf | Ferramenta | Uma grade com mover, girar e tirar página, e a vista da página da F14; uma operação nova no motor que compõe as três numa passada do `assemble.ts` | G |
| Extrair páginas do PDF | extract pages from pdf | Preset do Dividir | O Dividir só com o modo Escolher: a página abre com a grade e a lupa, sem os modos "cada página" e "intervalos", e entrega um PDF só. Passa no teste 2 porque a ferramenta muda (um modo só, uma saída só), ao contrário do "JPG para PDF", que seria a Imagem para PDF com outro título. A intenção também é outra: dividir é quebrar em vários; extrair é tirar algumas | M (a primeira preset de PDF cria a peça; item 5 da F18) |
| PDF para PNG | pdf to png | Preset do PDF para JPG | O formato PNG fixo, sem a escolha de formato | P se o Extrair entrar junto; M se entrar sozinha |
| Espelhar imagem | flip image | Preset do Girar imagem | O espelho como primeira escolha, sem giro | P |
| Remover localização da foto | remove exif data | Ferramenta (sai do backlog "remover metadados" por esta regra, que substitui o gatilho dele) | O caminho do motor que tira os metadados sem codificar de novo (`strip.ts`), só nos formatos que ele cobre; os outros são recusados com o link para a ferramenta certa; o guia "Remove location from photos" passa a apontar para ela | M |

Cole na conversa da F18 o volume e o Trends de cada termo. A run grava as linhas e constrói só as que deram `entra`.

## Mudança no contrato (a partir da F18)

| # | Tema | Antes (PLANO-FILEORCA v7.1) | Agora |
|---|---|---|---|
| 15 | Catálogo | "Escopo: 48 ferramentas em quatro áreas"; "o catálogo é o teto"; o "remover metadados" no backlog com gatilho | O teto abre só para as candidatas da seção E do PLANO-UX-QV.md que passarem na regra da seção E. Para o "remover metadados", essa regra substitui o gatilho do backlog. O "Fora do escopo" e os outros itens do backlog não mudam. |

A F18 escreve esta linha na tabela "Mudanças no contrato" do PLANO-MELHORIAS.md, que o CLAUDE.md já põe acima do PLANO-FILEORCA para os itens dela. Assim nenhuma run mexe nas "Decisões fechadas" do PLANO-FILEORCA; o CLAUDE.md só ganha, na F14, a linha que aponta para este plano.

## Calendário sugerido

| Quando | O quê |
|---|---|
| Seg 9/nov | Você lê o plano e gera o prompt da F14 |
| Ter 10/nov | F14 |
| Qua 11/nov | Você: confere a F14 no celular; Keyword Planner das candidatas (30 min); prompt da F15 |
| Qui 12/nov | F15 |
| Sex 13/nov | F16 |
| Seg 16/nov | F17 |
| Qua 18/nov | F18, se alguma candidata passou |

Cada data vale só com a PR da run anterior já mesclada. Se o limite semanal do Claude Code apertar, a F17 e a F18 passam para a semana seguinte; a ordem não muda. O ciclo do Dependabot em 1/dez e o gatilho de casa e saúde em 31/jan/2027 não mudam.

## Como gerar cada prompt

Abra uma conversa com a skill prompt-ultracode e cole, nesta ordem:

```text
Projeto: FileOrca, repositório vmatusita/fileorca, clone em C:\Users\vmatusita\projetos\fileorca (Windows, Git Bash).
Fonte de verdade: a ficha abaixo > PLANO-MELHORIAS.md (seção "Mudanças no contrato") > PLANO-FILEORCA.md > CLAUDE.md e docs/claude/ > DECISOES.md > código.
Plano: PLANO-UX-QV.md (diagnóstico, "Regras de todas as runs deste plano" e as especificações que a ficha cita).
Regras de toda run: as de "Execução por IA" do PLANO-FILEORCA.md, as de "Regras novas de toda run" do PLANO-MELHORIAS.md e as de "Regras de todas as runs deste plano" do PLANO-UX-QV.md.
Último commit da main: <sha>.
O que mudou desde o plano: <pendências da run anterior; na F18, os números do Keyword Planner e do Trends de cada candidata>.

<a ficha da run, inteira>
```

Na F14, o PLANO-UX-QV.md ainda não está no Git: a ficha manda a run commitá-lo.

## Pendências que este plano fecha

| Pendência (docs/PENDENCIAS.md) | Run |
|---|---|
| F5a E-2 e F5a E-4 (grupo 10); F5a E-5 (grupo 10, para "Já corrigidos": o código já faz); F4-F7 d-2 e d-8 (grupo 16) | F14 |
| F13a h-1 (grupo 22) | F15 |
| F4 DES-3, F7 a-4 (grupo 2); F7 a-3, F7 a-6, F6 g-2, F4 COR-16 (grupo 3, inteiro); F13b R-b-1 e R-b-3 (grupo 23) | F16 |
| F2 2b (grupo 13) | F17 |

## Fontes

- [Google: conteúdo que cobre anúncios servidos pelo Google](https://support.google.com/publisherpolicies/answer/11191353)
- [caniuse: `Element.requestFullscreen`](https://caniuse.com/mdn-api_element_requestfullscreen) (no Safari do iOS, suporte parcial: só no iPad) e [o fórum da Apple sobre a Fullscreen API em elemento que não é vídeo no iPhone](https://developer.apple.com/forums/thread/133248)
- Medidas próprias no fileorca.com em 9/nov/2026 (Chromium do app da Claude, 375 × 812 e 1280 × 800), com arquivos gerados na página
