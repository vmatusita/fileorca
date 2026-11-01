# Revisão adversarial da F5a

Esta é a revisão final da run `fase-05a`: as 12 ferramentas de PDF em inglês, o hub `/pdf-tools/`, a exportação do motor de imagem e o CI em oito partes. Ela seguiu o método da F3 (DECISOES § 92 a § 94) e o da F4 (§ 139). O gabarito foi:

- a ficha (`docs/prompts/prompt-fase-05a.md`);
- o plano (`docs/relatorios/fase-05a-plano.md`), cuja seção 9 liga cada critério a um teste;
- o `CLAUDE.md`, o DECISOES (§ 143 a § 172) e o `docs/design/`.

## Como rodou

- **Commit fixo:** `7dab17c`, numa worktree só de leitura em `.claude/worktrees/revisao-f5a`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`. A worktree foi removida no fim.
- **Seis lentes Sonnet em contexto limpo.** Cada uma teve uma porta (`FO_PORT` de 4174 a 4179) e uma pasta só dela, `.cache/lente-<x>/`, onde ficaram as sondas e os screenshots:
  1. (a) corretude dos PDFs, com o pacote exportado;
  2. (b) privacidade, segurança e licenças;
  3. (c) anúncio e política;
  4. (d) acessibilidade (WCAG 2.2 AA);
  5. (e) desempenho e SEO;
  6. (f) design system.
- **Céticos:** um cético próprio para cada achado crítico, alto ou médio, e um por lente para os baixos. Foram 31 céticos, cada um tentando refutar com a regra "sem reprodução, refutado", com porta e pasta próprias. Ao todo, 37 agentes.
- **Ids:** as lentes (a) e (d) numeraram os achados como `A-n`. Aqui, os da (d) viraram `D-n`, e cada veredito foi ligado à lente pelo texto do pedido de cada cético.
- **Correções:** os achados altos e os médios de correção local foram corrigidos em dois agentes (Opus), cada um com um teste que falha sem a correção.
  - Um agente só mexeu na ilha, no motor e no CSS, como pede a ficha.
  - Outro, numa worktree própria, cuidou só de testes e de arquivos à parte: a matriz, a `/licenses` e a busca.
  - Os baixos vão para o relatório.
- **Segunda passada:** um revisor Sonnet em contexto limpo leu só o diff das correções, na mesma worktree, movida para o commit das correções.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | ---: | ---: |
| Crítico | 0 | 0 |
| Alto | 4 | 3 |
| Médio | 21 | 16 |
| Baixo | 28 | 27 |
| Refutado | — | 7 |

Por lente, depois dos céticos:

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude | 2 | 5 | 4 | 0 |
| (b) privacidade, segurança e licenças | 0 | 1 | 2 | 2 |
| (c) anúncio e política | 0 | 0 | 1 | 3 |
| (d) acessibilidade | 1 | 4 | 7 | 0 |
| (e) desempenho e SEO | 0 | 2 | 4 | 0 |
| (f) design system | 0 | 4 | 9 | 2 |

- **Os três altos foram corrigidos:**
  - **A-1:** um PDF cortado no meio de uma imagem era aceito e devolvido sem a imagem, com "Done";
  - **A-6:** a matriz não rodava toda ferramenta contra toda fixture que ela aceita (critério 3);
  - **D-1:** depois do botão de ação, o foco caía no `<body>`.
- **Os 16 médios:**
  - 15 foram corrigidos no código ou nos testes;
  - o A-8 e o F-1 são o mesmo defeito (a fala de sucesso da PDF to JPG) e tiveram uma correção só.
- **Os céticos mudaram a severidade de:**
  - 3 achados para cima: o A-6 (de médio a alto) e o A-8 (de baixo a médio), na lente (a), e um dos altos da (d), que ficou alto;
  - 8 achados para baixo, entre eles o D-2, o F-1, o C-1 e o E-2.

## O que cada lente conferiu, em resumo

- **(a) Corretude:**
  - a matriz passou com 18 de 18 testes nos dois navegadores;
  - uma sonda própria rodou as 12 operações nas 10 fixtures legíveis (107 saídas), cada saída conferida com o `qpdf --check`, o PDF.js página por página e a contagem do oráculo;
  - a numeração nas 6 posições sobre as 8 páginas mistas e 11 combinações estranhas de caixas (CropBox maior que a MediaBox, origem negativa, `/Rotate` -90 e 450);
  - a assinatura em pé no canto pedido em toda rotação;
  - os atributos herdados numa árvore de páginas aninhada;
  - a regra dos metadados (§ 145);
  - o formulário do IRS em toda ferramenta;
  - os marcadores e os links remapeados;
  - a Protect e a Unlock com 11 senhas (acento, CJK, emoji, 100 caracteres);
  - o arquivo de 300 páginas na Sign, na numeração, na marca, na Reorder e na Delete;
  - as faixas nos limites;
  - o ZIP com nomes em UTF-8;
  - o pacote exportado, com `tsc` e `vitest` verdes (12 arquivos e 145 testes).
- **(b) Privacidade, segurança e licenças:**
  - o `pdf-privacy` e o `pdf-hardening` nos dois navegadores;
  - a `gen-acoes` nos 9 fluxos que não desenham, sem diálogo, popup, navegação ou requisição;
  - o JS publicado sem `eval` (só o `Function('return this')` morto do core-js);
  - os `.wasm` sem memória compartilhada, sem import de thread e sem TLS;
  - a saída do qpdf presa no buffer;
  - nenhuma operação acrescenta Info, data, Producer ou CreatorTool;
  - a assinatura enviada sem Exif nem GPS;
  - o pacote exportado sem nada do site;
  - o `ci.yml` com as actions fixadas por SHA.
  - Ela também julgou a § 167 (as ações do arquivo da pessoa ficam): a decisão não quebra a decisão 4 nem o critério 7.
- **(c) Anúncio e política:**
  - o `ads.spec.ts` nos dois navegadores, com o menor vão de 166 px a 360 e de 150 px a 1280;
  - a regra dos 150 px contra todo descendente da ilha, em 12 páginas e 14 larguras;
  - estados que o passeio do teste não alcança (lote com recusas, senha mostrada);
  - barra de rolagem clássica;
  - os itens do `gate:prontidao` sobre o `dist/` real (336 a 404 palavras por AdSlot);
  - os textos honestos da Unlock, da Protect e da Sign, palavra por palavra;
  - a Privacidade e os Termos nos três idiomas;
  - o aviso do Forte antes da escolha.
- **(d) Acessibilidade:**
  - o axe por estado nos dois navegadores, e um passeio próprio nos estados que o teste pula;
  - o tamanho dos alvos (2.5.8);
  - o foco nunca coberto pelo aviso de cookies (2.4.11);
  - o foco itinerante da grade, sem armadilha;
  - os nomes acessíveis da grade e o anúncio de cada movimento uma vez;
  - os campos de senha;
  - a caixa da assinatura pelo teclado;
  - o reflow a 320 px e o espaçamento de texto (1.4.10 e 1.4.12);
  - o movimento reduzido;
  - o contraste nos dois temas.
- **(e) Desempenho e SEO:**
  - o orçamento nos dois navegadores: 36,1 KB gzip, 6 requisições no Chromium e 7 no WebKit, e os pares de navegação;
  - nada do motor antes do primeiro arquivo, com uma sonda própria do aquecimento nas 12 ferramentas;
  - as páginas de imagem e de dinheiro com 0,2 a 0,5 KB a mais;
  - nenhuma tarefa longa nas quatro ferramentas;
  - os arquivos pesados já dentro da página;
  - a memória do worker e da página;
  - a grade de 300 páginas, com no máximo 48 `<img>` vivos;
  - o Lighthouse (`/compress-pdf/` 99 e `/pdf-tools/` 100);
  - o schema, o canonical, o sitemap e o hreflang das páginas só em inglês;
  - a canibalização entre a Compress image e a Compress PDF, sem problema.
- **(f) Design system:**
  - nenhuma cor fora dos tokens;
  - o `gate:design` e a voz das 713 frases de PDF;
  - a Oli só com as nove poses e `aria-hidden`;
  - a faixa coral do hub;
  - os quatro ícones novos ao lado dos vizinhos, de 20 a 96 px;
  - toda classe `fo-*` com regra;
  - mais de 120 screenshots próprios nos dois temas, a 360 e a 1280, também no WebKit.

## Achados que vieram de fora das lentes

- **O worker de PDF avaliado duas vezes no WebKit** (§ 168): achado pelo agente do teste de privacidade antes da revisão. Corrigido com o `expose()` só na primeira cópia, com teste.
- **As ferramentas de imagem paradas no WebKit do CI** (§ 172):
  - A run 41330210631, no commit `84bc004`, ficou vermelha nas cinco partes do WebKit, só nos testes de imagem.
  - A exportação do motor passou as URLs dos `.wasm` por mensagem ao worker. Os chunks dos codecs leem o `wasmUrl()` e o `loading()` da entrada do worker, e o WebKit avalia essa entrada de novo para eles. A segunda cópia nunca recebeu as URLs, então todo codec no worker falhava como `load`.
  - No WebKit do Windows o motor de imagem roda na página, por isso nada disso aparecia aqui.
  - A correção guarda as URLs no `globalThis`, para a segunda cópia as tomar, e faz o `EngineError` reconhecer o erro da outra cópia. Os testes de unidade avaliam os módulos duas vezes e falham sem ela (commits `0bfa678` e `1d551fa`).
  - A run seguinte, 41331507992, ficou verde nas oito partes.

## Os achados

Legenda: a severidade da lente → o veredito do cético. "Corrigido" leva o commit e o teste que falha sem a correção. A § é a do DECISOES.

### (a) Corretude dos PDFs

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| A-1 | alto → alto | Um PDF cortado no meio de uma imagem era aceito, e a ferramenta devolvia o PDF sem a imagem, com "Done" (31 de 32 pontos de corte de um escaneado; a foto 4 da `gen-fotos` sumia) | Corrigido em `693ccf1` (§ 174): sem `%%EOF` e sem índice que aponte para dentro, é cortado; recurso de página que não existe, cortado ou danificado. Vitest com cortes do escaneado, da `gen-fotos` e da `gen-xref-estragada`, e a recusa no navegador |
| A-2 | médio → médio | Merge, Split e Delete perdiam o `/OCProperties`, e as camadas ocultas do original apareciam | Corrigido em `aef7779` (§ 178): o `/OCProperties` dos grupos usados vem junto, com o estado de cada arquivo. Teste com pixels contados pelo PDF.js |
| A-3 | médio → médio | A Sign em páginas de formatos diferentes podia cortar a assinatura na borda | Corrigido em `20c4a66` (§ 178): a caixa se encaixa em cada página |
| A-4 | médio → médio | A PDF to JPG com faixa fora do arquivo não fazia nada nem dizia nada, e num lote travava todos | Corrigido em `2b17781` (§ 178): erro do campo contra o maior arquivo, e no lote a recusa na linha do arquivo sem página da faixa |
| A-5 | médio → médio | Na Rotate, as voltas página por página do arquivo anterior iam para o próximo | Corrigido em `31e28b5` (§ 178): as opções de um arquivo (`perFile`) voltam ao início com um arquivo novo |
| A-6 | médio → alto | A matriz não rodava toda ferramenta contra toda fixture aceita (Delete, Sign e Reorder com uma fixture; Split com 4; Protect com 3) | Corrigido em `6c59e04` (§ 175): 51 testes por navegador, toda ferramenta e todo modo contra toda fixture aceita; a tabela abre com a cobertura, e o `pdf-matrix-table.test.ts` reprova lacuna (64 contra a tabela antiga). A matriz completa achou o Forte devolvendo a `gen-xref-estragada` estragada, corrigido em `88b85bb` (§ 182) |
| A-7 | baixo → baixo | A marca "Large" na diagonal de uma página em pé passa das bordas e corta a primeira e a última letra | Relatório |
| A-8 | baixo → médio | A PDF to JPG dizia "your 3 PDFs" para um PDF de 3 páginas | Corrigido com o F-1 em `b8c53fe` (§ 178) |
| A-9 | baixo → baixo | A página tira aspas curvas, travessões e o euro do texto da marca antes de o `winAnsi()` do motor poder trocá-los | Relatório |
| A-10 | baixo → baixo | Numerar um PDF de 1 página com "Skip the first page" não escreve nada e diz que numerou | Relatório |
| A-11 | baixo → baixo | Uma assinatura em JPG leva o fundo branco e pinta uma caixa opaca sobre a página | Relatório |

### (b) Privacidade, segurança e licenças

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| B-1 | médio → médio | O core-js (MIT) vai dentro do build legacy do PDF.js sem texto na `/licenses`, e o `gate:licencas` não o via | Corrigido em `4abff84` (§ 179): o texto do core-js 3.50.0 na `/licenses`, e o portão lê os marcadores de módulo do bundle; controle negativo no `licenses.test.ts` |
| B-2 | baixo → baixo | O `verbosity: 0` não vale no caminho da página: o primeiro arquivo no WebKit sem `OffscreenCanvas` escreve avisos do PDF.js no console | Relatório |
| B-3 | baixo → baixo | O critério 7 só é vigiado nos 7 fluxos que desenham; os outros 9 fluxos que aceitam a `gen-acoes` não têm a guarda de diálogo, popup e navegação (a lente rodou os 9, sem nada) | Relatório |
| B-4 | baixo → refutado | A Delete e a Split mantêm o XMP de origem | Refutado: é a regra da § 145 |
| B-5 | baixo → refutado | Os avisos do runtime do Emscripten no `qpdf.wasm` | Refutado: é a convenção dos `.wasm` que já estavam (§ 79), e a ficha (decisão 2) nomeia os componentes a listar |

### (c) Anúncio e política

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| C-1 | médio → baixo | A Compress PDF chama o Forte de "smallest file" e diz que ele "goes furthest", mas num PDF de texto o Forte não ganha nada | Relatório |
| C-2 | baixo → refutado | O aviso "só para arquivos que você pode abrir" da Unlock não está na ferramenta | Refutado: está nas especificações e no Faq da página, e a ficha não pede mais |
| C-3 | baixo → refutado | A Privacidade cita o PDF.js e o qpdf, mas não o pdf-lib | Refutado: é o que a ficha (item 10) pede |
| C-4 | baixo → refutado | "No limit" ao lado do limite de 1 GiB por arquivo | Refutado: é a promessa fechada do PLANO ("has no limits", "lote sem limite"), que nenhuma run muda |

### (d) Acessibilidade

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| D-1 | alto → alto | Depois do botão de ação o foco caía no `<body>` (Delete, Reorder, Split com opção mudada), e o DropZone vazio piscava durante o trabalho | Corrigido em `276dc79` (§ 176): a ação pede o resultado e o foco vai para o Baixar; o cartão fica no lugar durante o trabalho |
| D-2 | alto → médio | Os erros de validação e a senha errada nunca eram anunciados | Corrigido em `b8b983c` (§ 177): todos são `role=alert` |
| D-3 | médio → médio | O botão "Show" trocava o texto para "Hide" e também usava `aria-pressed`; os dois botões da Protect tinham o mesmo nome | Corrigido em `901d4c3` (§ 177): nome estável e próprio, estado só no `aria-pressed` |
| D-4 | médio → médio | A grade puxava o foco de outros controles com um foco pendente velho | Corrigido em `594c647` (§ 177) |
| D-5 | médio → médio | Na lista do Merge, depois de "Move X down" o foco ia para "Move X up", e Enter duas vezes desfazia o movimento | Corrigido em `31d5c53` (§ 177) |
| D-6 | médio → baixo | Na caixa da assinatura, onde o `+` precisa de Shift, o `+` cresce 10 pontos e o `−` diminui 1 | Relatório |
| D-7 | médio → baixo | Página escolhida e não escolhida diferem só pela cor e 1 px da borda | Relatório |
| D-8 | médio → baixo | As linhas do Merge mostram uns 12 caracteres do nome a 360 px | Relatório (o F-2 deu mais largura à linha) |
| D-9 | baixo → baixo | O anel de foco da caixa da assinatura é cortado na borda da página, e os movimentos pelo teclado não são anunciados | Relatório |
| D-10 | baixo → baixo | Frases de status que dizem a coisa errada ou pouco ("Reverse order" é o anúncio; a Rotate diz só "Done") | Relatório |
| D-11 | baixo → baixo | Uma página ou linha pegada continua pegada quando o foco sai; a Unlock põe o foco em "Start over" e não no campo de senha | Relatório |
| D-12 | baixo → baixo | O `fo-btn--sm` (40 px) é usado no celular pelas peças novas, contra o token `tap-min` | Relatório |

### (e) Desempenho e SEO

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| E-1 | médio → médio | A busca mandava "merge pdf" e "pdf to jpg" (com Enter) para a Image to PDF | Corrigido em `f6806dc` (§ 180): a busca ordena por proximidade; teste no `routes.test.ts` e no `navigation.spec.ts` |
| E-2 | médio → baixo | A grade desenha de novo todas as células a cada clique ou tecla, e o custo cresce com o número de páginas | Relatório |
| E-3 | médio → médio | As miniaturas da grade não eram canceladas nem limitadas, e uma resposta atrasada punha no `<img>` uma URL de blob já revogada | Corrigido em `bcf06ec` (§ 180): duas por vez, a que saiu da tela não é desenhada, e a resposta atrasada é descartada |
| E-4 | baixo → baixo | No caminho da página, cada documento aberto deixa o Worker de leitura do PDF.js rodando | Relatório |
| E-5 | baixo → baixo | Desenhar miniaturas deixa uns 0,85 MB de memória nativa por página até o próximo GC | Relatório |
| E-6 | baixo → baixo | A prévia da página na Sign é a miniatura de 240 px esticada | Relatório (o mesmo do F-5) |

### (f) Design system

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| F-1 | alto → médio | A fala de sucesso da PDF to JPG dizia "your 8 PDFs" para um PDF | Corrigido em `b8c53fe` (§ 178): a fala conta as imagens |
| F-2 | médio → médio | A lista do Merge a 360 px espremia o cartão em 216 px, e um arquivo recusado virava uma coluna de 412 px, uma palavra por linha | Corrigido em `bc3b9e3` (§ 181): abaixo de 480 px a linha vira duas |
| F-3 | médio → médio | Cinco linhas de erro das peças novas não tinham o ícone de alerta do padrão | Corrigido em `4fcba88` (§ 181): todo erro sai do FieldError |
| F-4 | médio → médio | O envio da assinatura era o `input` nativo cru (20 px, sem borda) | Corrigido em `de70141` (§ 181): o rótulo tem visual de botão, e o nome do arquivo aparece |
| F-5 | médio → baixo | A prévia da posição na Sign é uma miniatura de 240 px esticada | Relatório |
| F-6 | médio → baixo | O FileCard de PDF mostra um quadrado vazio no lugar da miniatura | Relatório |
| F-7 | baixo → baixo | O FileCard dentro do painel corta a dobra com a cor da página, e um entalhe escuro aparece no tema escuro | Relatório |
| F-8 | baixo → baixo | A borda de 3 px da célula escolhida passa da dobra e deixa um quadradinho em volta dela | Relatório |
| F-9 | baixo → refutado | Os botões de mover desativados parecem mais fortes que os ativos | Refutado: é o estilo de botão desativado do sistema |
| F-10 | baixo → baixo | Os dois avisos das peças novas não usam a nota do design system (fundo `brand-soft` com o ícone de info) | Relatório |
| F-11 | baixo → baixo | "Skip the first page" é uma caixa de seleção nativa sem estilo | Relatório |
| F-12 | baixo → baixo | No celular, a ajuda do DropZone de cinco ferramentas começa em minúscula ("one PDF at a time") | Relatório |
| F-13 | baixo → baixo | A Unlock mostra o mesmo arquivo duas vezes depois de uma senha errada | Relatório |
| F-14 | baixo → baixo | Acabamento a 360 px: "Pick none" quebra desalinhado, o trilho da Split vira uma pílula de duas linhas, e há linhas de ajuda repetidas | Relatório |
| F-15 | baixo → refutado | Os screenshots das peças novas ainda não estavam em `7dab17c` | Refutado: o `pnpm screenshots` roda depois do último ajuste visual, como a ficha pede |

## A segunda passada

Um revisor Sonnet em contexto limpo leu só o diff das correções (`7dab17c..6e35bdd`, 39 arquivos), na mesma worktree, movida para `6e35bdd` e com build próprio. Ele rodou o Vitest inteiro (1.192 testes) e, nos dois navegadores, o `pdf-tool`, o `pdf-privacy`, o `a11y` e o `ads` de PDF, o `design` e a matriz de imagens. Também reproduziu cada correção com sondas próprias e o motor de antes lado a lado.

- **O CI:** ele conferiu a run 41342463565 (11 partes verdes) e o `ci.yml`.
- **As regras:** nenhum teste existente pulado, afrouxado ou com timeout maior. As asserções que mudaram estão nas §§.

| Id | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| S-1 | médio | A checagem de recursos da § 174 recusava um PDF completo que cita uma fonte ou imagem ausente, que o formato lê como `null` e o PDF.js abre | Corrigido em `3fa0e14` (§ 183): a checagem vale só num arquivo sem o fim |
| S-2 | médio | A prévia da Sign era desenhada de novo a cada render do painel (40 desenhos em 40 movimentos do ponteiro) | Corrigido em `93b1967` (§ 183): o efeito depende do id e da leitura do arquivo |
| S-3 | baixo | Um PDF completo seguido de mais de 64 KB de lixo é recusado como cortado | Registrado na § 183: a janela de 64 KB fica, porque procurar no arquivo inteiro deixaria passar um corte de atualização incremental |
| S-4 | baixo | Sem ganho, a reescrita reparada pode ficar maior que a entrada estragada (796 contra 767 bytes num PDF mínimo) | Registrado na § 183: "nunca sai um PDF quebrado" vem antes de "nunca maior"; nas fixtures ela é sempre menor |
| S-5 | baixo | A fala da Merge perdeu a contagem de arquivos com a correção do A-8 | Corrigido em `93b1967` (§ 183) |
| S-6 | baixo | Trocar o modo da assinatura deixava o nome da imagem enviada sem a assinatura | Corrigido em `93b1967` (§ 183) |

Cada correção da segunda passada tem um teste que falhou contra o código de antes:

- **S-1:** o `pdf-engine-open.test.ts` falhava com `{ ok: false, reason: 'corrupted' }`.
- **S-2:** a prévia mostrava duas imagens.
- **S-5:** a fala não tinha a contagem.
- **S-6:** o nome continuava na tela.

## A worktree

A worktree `.claude/worktrees/revisao-f5a` foi removida com `git worktree remove` no fim da revisão.
