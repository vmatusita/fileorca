# Fase 14: páginas de PDF à vista

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F14 do FileOrca, "Páginas de PDF à vista", a primeira das cinco runs do `PLANO-UX-QV.md`. A pessoa reconhece cada página antes de excluir, dividir, girar, assinar ou reorganizar, e confere o PDF novo antes de baixar. A run nasce de um relato de usuário (a miniatura pequena demais para achar a página a excluir) e de um defeito medido no ar (a miniatura corta os 22 % de baixo de toda página em pé).

Ao terminar:

- nas cinco ferramentas da grade (Excluir, Dividir, Girar, Assinar e Reorganizar), a miniatura mostra a página inteira, em pé, deitada e com `/Rotate`, e a grade tem "Pequenas" e "Grandes";
- cada miniatura tem a lupa, que abre a página grande dentro da própria ferramenta, na faixa de baixo do painel, com Anterior, Próxima, Ampliar e a ação da ferramenta, pelo toque, pelo arrasto e pelo teclado, sem camada por cima da página e sem nada na URL;
- no Excluir, a página marcada mostra que sai; Shift+clique e Inverter seleção valem nas grades de seleção; as ações em lote e o giro falam uma vez só;
- todo resultado que é um PDF só e sem cifra tem "Ver o PDF novo", e cada linha do Juntar tem "Ver páginas de {nome}";
- a grade de 300 páginas gasta no máximo a metade do script por toque, e nenhum worker do PDF.js de um arquivo anterior fica vivo no caminho sem `OffscreenCanvas`;
- nenhum anúncio fica a menos de 150 px da vista, nada do site cobre a âncora, e as páginas de PDF carregam os mesmos arquivos JS, com no máximo 8 KB a mais com gzip;
- o `PLANO-UX-QV.md` está commitado, o `CLAUDE.md` aponta para ele, e o `docs/design/`, o `docs/claude/pdf.md` e o `docs/PENDENCIAS.md` estão em dia;
- o relatório está em `docs/relatorios/fase-14.md` e a revisão em `docs/relatorios/REVISAO-F14.md`;
- a PR da branch `fase-14` sai pronta, com o CI completo verde, e o CI a mescla sozinho.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está em `b7a6396` (o ajuste-home-cards mesclado, PR 28) ou num commit mais novo. Confira com `git log --oneline -5` e guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

No clone, sem commit:

- `docs/prompts/prompt-fase-14.md` e `docs/prompts/prompt-fase-14.txt` (este prompt);
- `PLANO-UX-QV.md`, na raiz: o plano desta run e das quatro seguintes. Ele ainda não está no Git, e a ficha manda commitá-lo;
- talvez o `PLANO-FILEORCA.md` modificado com uma linha só, posta pelo Victor antes da run (decisão 2);
- a pasta `Claude outputs/`, que fica fora de tudo.

O que você precisa saber antes de planejar:

- **A ficha da F14** está no `PLANO-UX-QV.md`, em "Fichas para a prompt-ultracode" → "F14 · Páginas de PDF à vista": a missão, as entradas, os 12 itens de "Dentro", o "Fora", os 11 critérios, a válvula e o destino. Ela cita a seção A (a vista da página) e a seção B (as miniaturas e a marcação), e o diagnóstico (D1 a D6 e D16) diz o que foi medido e onde. Leia as quatro partes inteiras, e também "O que não entra, e por quê" e "Regras de todas as runs deste plano".
- **Nada mudou desde o plano.** Ele foi escrito em 9/nov/2026 sobre a main de hoje, e as linhas do `docs/PENDENCIAS.md` que ele cita foram reconferidas no código.
- **A ilha de PDF de hoje:**
  - `src/tools/pdf/PageGrid.tsx`: a grade, com os modos `select`, `order` e `rotate`, o foco móvel, o `Thumb` com o `IntersectionObserver` e o `THUMB_WIDTH = 240`;
  - `src/tools/pdf/PdfPanel.tsx`: o retângulo, a faixa de baixo (`.fo-band`), o resultado, o `m.outs`, a lista do Juntar e a região `p.fo-sr[role="status"]`;
  - `src/tools/pdf/tools.tsx`: as definições das 12 ferramentas, o `RangePicker`, o `onSelectAll` e o `onSelectNone`;
  - `src/tools/pdf/types.ts` (o `Thumbnails`) e `src/tools/pdf/client.ts` (`inspect`, `thumbnail` e `release`);
  - o motor em `src/engine/pdf/`: `pdfjs.ts`, `render.ts`, `worker.ts` e `pdfjs-core.ts`, a porta do caminho sem `OffscreenCanvas`.
- **A fixture com toda proporção já existe.** A `fixtures/pdf/gen-paginas-mistas.pdf` tem 8 páginas: Carta e A4 em pé, Carta deitada, `/Rotate` 90, 270 e 180, e dois tamanhos menores (veja `fixtures/pdf/expected.json`). A `gen-paginas-300.pdf` tem 300 páginas. Não crie fixture nova: ela mudaria a matriz de PDF e o `fixtures/ORIGEM.md`.
- **O próximo § livre do `DECISOES.md` é o 617.** Escreva os § na ordem.
- **A linha de base,** do relatório do ajuste-home-cards: o Vitest com 130 arquivos e 2.066 testes; o `--list` do Playwright com 2.204 testes por navegador, em 71 arquivos; o `pnpm verificar --partes` em 21 partes (Chromium em 5, WebKit em 13), somando 3.266,5 s, com a maior em 395,2 s. Confira no ponto de partida e use os seus números.
- **O rótulo `ci` não existia na F13b** (§ 542), e criá-lo é só do Victor. As notas da regra 1 do `CLAUDE.md` dizem o que fazer nos dois casos.
- **O repositório é público** (§ 338): tudo o que você commita, a PR, os logs e os artefatos ficam públicos.
- **O CI roda por classe** (F9): a PR em rascunho roda o job leve; a PR pronta roda tudo e, como esta run não mexe em `.github/`, é mesclada sozinha.

Leia antes de planejar, nesta ordem de autoridade:

1. **A ficha da F14 e este prompt.** Os dois juntos são a ficha da run: este prompt detalha e fecha o que a ficha deixa aberto, e nunca afrouxa um critério dela. Se parecerem conflitar, vale o mais rigoroso, com um §.
2. **O `PLANO-UX-QV.md`** (as seções que a ficha cita e as regras de todas as runs), o `PLANO-MELHORIAS.md` (as regras de toda run) e o `PLANO-FILEORCA.md` ("Execução por IA" e as "Decisões fechadas").
3. **O `CLAUDE.md`,** inteiro.
4. **De `docs/claude/`:** o `pdf.md`, o `playwright.md` e o `windows-git-bash.md` inteiros; do `design-e-oli.md` e do `anuncios.md`, as pegadinhas gerais e as seções da F12, da F13a e da F13b; do `ci.md`, as pegadinhas gerais da F1a e a seção da F9 (a divisão das partes); do `idiomas.md`, o que fala do `lint:texto` e do glossário.
5. **Do `DECISOES.md`, só buscando o §:** § 35, § 114, § 144, § 152, § 180, § 240, § 341, § 479, § 483, § 497, § 510, § 515 e o que elas citarem.
6. **Do `docs/design/`:** no `README.md`, "Layout e anúncios" e a regra "Ícone sozinho só em ação de linha"; os README do Button, do OptionGroup, do FileCard, do ResultCard e de `assets/Icons/`.
7. **Do `docs/PENDENCIAS.md`:** "Como ler", o Resumo, os grupos 10, 16, 22 e 23, "Registrados" e "Já corrigidos"; e o `tests/unit/pendencias.test.ts`, que confere o arquivo.
8. **Do `docs/i18n/`:** o glossário de pt e o de es.

# Escopo

Dentro: os 12 itens da ficha, com estes arquivos:

- a ilha de PDF (`src/tools/pdf/`), com um componente novo para a vista (o nome é seu; por exemplo, `PageView.tsx`), e o CSS da grade e da vista em `src/styles/components.css`;
- `src/tools/pdf/client.ts` e, só para o item 8, o caminho que solta o documento em `src/engine/pdf/`;
- os textos: o `PdfPanelTexts` em `src/i18n/{en,pt,es}/` e o tipo em `src/i18n/types.ts`; os `src/tools/<ferramenta>/i18n/{en,pt,es}.ts` das cinco ferramentas da grade, do Juntar e de qualquer outra ferramenta de PDF cujo texto o comportamento novo desminta;
- o ícone `zoom` em `docs/design/assets/Icons/` e onde a lista de ícones mora (`ICON_NAMES`, o sprite e os testes deles);
- os testes: specs novos; os specs que fixam o desenho de hoje da grade, do resultado e do Juntar; as listas de alvos de anúncio (`tests/e2e/ads.spec.ts`, `tests/e2e/lib/ad-clearance.ts`, `tests/e2e/lib/ad-map.ts` e, se for preciso, as listas de `src/ads/map.ts`);
- os documentos: `docs/design/components/PageView/` (README e preview), a regra do `docs/design/README.md` que a ficha nomeia, o README dos ícones, uma seção nova no fim do `docs/claude/pdf.md`, o `docs/PENDENCIAS.md`, o `DECISOES.md`, uma linha no `CLAUDE.md` e o `PLANO-UX-QV.md`, commitado sem mudança.

Fora (não toque): o "Fora" da ficha inteiro, e mais:

- o que o toque na página faz: ele continua marcando, girando ou pegando a página para mover;
- `<dialog>`, popover, `position: fixed` ou `sticky` na vista, e qualquer camada por cima da página; a Fullscreen API; `history.pushState`, `replaceState`, hash ou parâmetro na URL;
- chave nova no `localStorage`, no `sessionStorage` ou no IndexedDB; evento ou parâmetro novo no GA4; dependência nova; `import()` novo que crie arquivo JS;
- o motor além do item 8: nenhuma operação, nenhum `PdfOperation`, nenhuma fixture e nenhum byte de saída muda (a matriz de PDF continua igual);
- a busca (o D16 é do Victor), a home, os hubs, as calculadoras, as ferramentas de imagem, o QR, os guias e as páginas institucionais;
- a miniatura da página 1 na linha do Juntar, e a grade ou a lupa no PDF para JPG;
- `.github/`, o `.githooks/`, o `.claude/settings.json`, o `lighthouserc.json` e as fixtures;
- o `PLANO-FILEORCA.md` (decisão 2), o `PLANO-MELHORIAS.md` e o texto do `PLANO-UX-QV.md`;
- os § antigos do `DECISOES.md` e as seções antigas de `docs/claude/`: só se acrescenta, nunca se apaga nem se reescreve.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 617)

1. **A especificação.** As seções A e B do `PLANO-UX-QV.md` são contrato, palavra por palavra: os rótulos, as larguras, os limites, as teclas e as falas. O que elas não dizem, você decide pela régua de "Autonomia e decisões", com um §.

2. **Os planos e o `CLAUDE.md`.**
   - O `PLANO-UX-QV.md` entra no primeiro commit sem mudar um byte. Achado que desminta o plano vai num §, nunca no texto dele.
   - A ficha pede "uma linha no topo do PLANO-FILEORCA.md apontando para ele", mas o `.claude/settings.json` nega a edição desse arquivo (`Edit(/PLANO-FILEORCA.md)`), e a F13a já o deixou como estava. **Não edite o arquivo por nenhum caminho** (ferramenta de edição, shell, script ou `git apply`): quem põe a linha é o Victor, antes da run. No começo, rode `git diff -- PLANO-FILEORCA.md`:
     - se a diferença for só a linha abaixo acrescentada (com, no máximo, uma linha em branco junto), ela entra no primeiro commit, ao lado do plano;
     - se não houver diferença, siga sem ela, registre num § e ponha uma linha "Victor faz" no grupo 24 do `docs/PENDENCIAS.md`, com o texto abaixo;
     - se houver qualquer outra diferença, deixe o arquivo como está e fora dos commits, e registre.

     A linha: `**Plano de UX e qualidade de vida (9/nov/2026):** as fichas da F14 à F18 estão no PLANO-UX-QV.md. Até a F17 ele não muda nada deste plano; a única mudança no contrato (a linha 15, o catálogo) entra na F18, pela tabela "Mudanças no contrato" do PLANO-MELHORIAS.md.`
   - O `CLAUDE.md` ganha, no fim da seção "Fonte de verdade", depois do parágrafo "Na dúvida, …", num parágrafo próprio, só esta linha: `O PLANO-UX-QV.md traz as fichas da F14 à F18; a ficha de cada run continua sendo a fonte nº 1, e a mudança no contrato dele entra pela linha 15 do PLANO-MELHORIAS.md.` Nada mais muda no `CLAUDE.md`, e o `tests/unit/claude-md.test.ts` continua verde.

3. **O corte (item 1).** A `.fo-page__sheet` ganha a proporção da página como ela vai sair: a caixa do `PageBox` com o `/Rotate` dela e, no modo girar, com os giros da pessoa (largura e altura trocadas quando a soma dos quartos de volta é ímpar). A `img` encaixa em "contain", centrada. A proporção vem das caixas que a leitura já deu, antes da primeira imagem: a imagem que chega não muda a altura de nada, e o CLS sem gesto continua 0 (o `tool-slot.spec.ts` e o `layout-shift.spec.ts`). O alinhamento de uma linha da grade com proporções diferentes é seu, com § e com as imagens da `gen-paginas-mistas` no relatório.

4. **Pequenas, Grandes e a largura pedida (item 3).** Pela seção B: as colunas, o `OptionGroup` em segmento acima da grade em todos os modos, e a escolha só na memória da página. A largura pedida ao cache é `min(720, largura da folha × DPR)`, arredondada para cima em múltiplos de 60. A troca de tamanho, ou uma mudança de largura da janela que mude esse número, solta as imagens da largura velha com o mesmo `width` do `get` (§ 180 e a pegadinha "cache por índice e largura" do `docs/claude/pdf.md`). O `THUMB_WIDTH` fixo sai, ou fica só como mínimo; o que o lê (procure com `grep` em `src/`, `scripts/` e `tests/`) acompanha.

5. **A célula com `memo` (item 8, E-2).** Cada célula vira um componente com `memo`, cujas props só mudam quando muda o estado dela: marcada, posição, giros, ativa no foco móvel e tamanho. Os callbacks chegam estáveis (por `useCallback` ou por ref), e nenhum objeto ou função nova por render passa como prop. A contagem e as ações em lote ficam fora das células.

6. **A lupa (item 2).** Pela seção A: um botão irmão do botão da página, nunca dentro dele, na linha do número, alinhado à direita, fora da imagem, com 48 px, o ícone `zoom` e o nome "Ver a página {n} em tamanho grande". Só a lupa da célula ativa fica no Tab. No Reorganizar, a lupa convive com as setas da célula ativa, e a 320 px nada passa da largura da célula. O ícone `zoom` é uma lupa com "+", com o traço, a grade e os cantos dos ícones de hoje (`docs/design/assets/Icons/README.md`), e o contraste dele vai calculado no §.

7. **A vista (item 2, seção A).** Um componente da ilha de PDF, que vai no mesmo arquivo JS da ilha (sem `import()` novo). Os pontos que a seção A deixa abertos:
   - **os ícones:** "Próxima" usa o `chevron-right`; "Anterior" e "Voltar às páginas" usam o `chevron-right` espelhado pelo CSS. Nenhum ícone novo além do `zoom`;
   - **ao abrir,** o foco vai ao título (o `h3` com `tabindex="-1"`), e a vista entra na tela (pelo próprio foco ou por um `scrollIntoView`), sem rolagem animada quando a pessoa pede movimento reduzido;
   - **a ação de cada ferramenta** usa o mesmo caminho da célula (`onToggle` e `onTurn`): a grade, a contagem e a operação mudam juntas, com uma fala só;
   - **o arrasto lateral:** Pointer Events na imagem, só em "Ajustar", com `touch-action: pan-y pinch-zoom` na moldura (a rolagem vertical e a pinça continuam do navegador), 48 px ou mais, menos de 30° de inclinação e `visualViewport.scale` entre 0,99 e 1,01;
   - **as imagens grandes:** no máximo três guardadas (a da tela, a anterior e a próxima), e a anterior e a próxima só são pedidas depois que a da tela chega. O `drop` usa a mesma largura do `get`;
   - **no Girar página por página depois do resultado,** a vista abre dentro do "Ajustar" aberto, no lugar da grade;
   - **com a vista aberta, se a pessoa troca de arquivo, solta outro ou aperta Começar de novo,** a vista fecha sem deixar o foco num botão que sumiu: o foco vai para onde o painel já o leva hoje nesses casos.

8. **O resultado e o Juntar (itens 6 e 7).**
   - "Ver o PDF novo" aparece quando o resultado é um PDF só e sem cifra: o Proteger, o PDF para JPG e todo resultado em ZIP nunca o mostram; o Dividir com uma parte só, sim. A regra lê o resultado e a operação, não uma lista de nomes de ferramenta.
   - O botão é fantasma, ao lado do "Começar de novo", como o "Antes e depois" das imagens. Se a 320 px ele não couber no retângulo de 356 px em algum idioma, ele vira o primeiro item da faixa de baixo nos três idiomas, antes dos chips, com a altura reservada desde o gesto da ação, como os chips (§ 483). A medida e a escolha vão num §.
   - A vista do resultado faz o `inspect()` dos bytes de saída (`m.outs`), tem um cache próprio e faz o `release()` ao voltar, no Começar de novo e a cada execução nova.
   - **"A cada execução nova" (item 8, E-4) vale para o documento do resultado anterior,** nunca para o arquivo de entrada que a grade ainda mostra: soltar a entrada a cada execução obrigaria a ler o arquivo de novo a cada giro ou marca.
   - No Juntar, "Ver páginas de {name}" entra na linha das ações de cada arquivo (as setas, a lixeira e ele), com 48 px; abaixo de 480 px, na linha de 48 px embaixo do card (§ 515). A vista usa as caixas que a leitura já deu, só desenha o que a pessoa olha e faz o `release()` ao voltar e quando a linha sai da lista. Com o Desfazer à espera, você decide entre soltar logo (e o Desfazer lê de novo) ou soltar quando o Desfazer expira, com §.

9. **A marcação (itens 4 e 5, seção B).**
   - No Excluir: a lixeira no círculo do check, a imagem com opacidade de 40 %, o número e o círculo com o contraste de hoje (calculado no §, nos dois temas), o nome acessível terminando em ", sai" (e o equivalente em en e es) e a contagem com as formas de 1 da seção B. Nada muda no Dividir nem no Assinar.
   - Inverter seleção entra ao lado de "Marcar todas" e "Desmarcar todas", onde esses dois existem hoje. No Excluir, inverter até marcar tudo dá o erro de "todas marcadas" de hoje.
   - Shift+clique e Shift+Espaço pela seção B. A âncora mora num lugar só, que a grade e a vista usam: a última página tocada na grade ou marcada na vista; nenhuma antes do primeiro toque e depois de Marcar todas, Desmarcar todas, Inverter seleção ou do intervalo digitado.

10. **As falas (item 9).** Tudo pela região do painel (`p.fo-sr[role="status"]`), uma fala por gesto:
    - d-2: Marcar todas, Desmarcar todas, Inverter seleção e o intervalo digitado dizem a contagem (no Excluir, na forma do Excluir);
    - d-8: no Girar página por página, um giro na grade ou na vista diz uma frase só, e o "Done!" da execução automática não se repete quando ela vem do giro;
    - o Shift+clique diz "Páginas {from} a {to} marcadas" (ou "desmarcadas");
    - a troca de página na vista diz "Página {n} de {total}", com o estado quando houver.

    Os testes contam as mudanças da região com um `MutationObserver`: uma por gesto.

11. **Os textos (item 10).** Os de pt são os da seção B, sem mudar uma palavra. Os de en e es saem pelo glossário de `docs/i18n/`, no registro de cada idioma, e vão num § com os três idiomas lado a lado. Os passos "Como funciona" das cinco ferramentas da grade citam a lupa, nos três idiomas. O FAQ "Dá para desfazer?" do Excluir (D6) passa a dizer o que a F13a já faz: as opções ficam à vista depois do resultado, e uma mudança traz a ação de volta. Procure com `grep` nos textos das 12 ferramentas de PDF e dos guias de PDF toda frase que o comportamento novo desminta, como "baixe e abra em outro programa", e corrija nos três idiomas. O `lint:texto` dá 0 erro, e o `english-leak.test.ts`, o `glossary.test.ts` e o `gate:conteudo` passam.

12. **O desempenho e a memória (item 8).**
    - **E-2, a medida:** o `ScriptDuration` do Chromium (CDP `Performance.getMetrics`) na `gen-paginas-300`, no Excluir, a 1280 × 800, com a média de 20 toques em páginas à vista. Meça o `dist/` do ponto de partida (o `dist-base`) e o de depois na mesma máquina e na mesma rodada, alternando os dois (base, nova, base, nova…), com o script em `.cache/f14/`, fora do Git. O critério é o da ficha: no máximo a metade. O relatório traz as 20 medidas de cada lado, a média, o desvio e um controle de ruído (base contra base). Se depois de duas abordagens a razão não chegar à metade, registre a medida real e o perfil de onde vai o tempo num §, e diga no relatório que o critério 8 não se cumpriu. Nunca afrouxe a conta.
    - **E-4, o teste:** no caminho sem `OffscreenCanvas` (veja como o `engine-paths.spec.ts` o força), com o construtor `Worker` trocado num `addInitScript` por um espião que anota cada `new Worker` e cada `terminate`. Depois de trocar de arquivo, de tirar uma linha do Juntar e do Começar de novo, nenhum worker do PDF.js do arquivo anterior fica sem `terminate`. O teste reprova no ponto de partida.
    - **E-5** vai para "Já corrigidos" do `docs/PENDENCIAS.md`, com um § que cita o `page.cleanup()` e o canvas zerado de `src/engine/pdf/pdfjs.ts` (confira as linhas no código de hoje).

13. **O orçamento (critério 10).** As páginas de PDF carregam os mesmos arquivos JS e as mesmas requisições do ponto de partida (o `budgets.spec.ts` e o `i18n-budgets.spec.ts`, sem mudar número nenhum), e o JS inicial cresce no máximo 8 KB com gzip, medido arquivo a arquivo contra o `dist-base`. Se passar: primeiro tire código; se ainda passar, registre num § e numa pendência do grupo 24, sem cortar os itens 1 a 6. O limite de 80 KB do projeto nunca passa.

14. **Os anúncios (critério 4).** No build de teste (veja o `docs/claude/anuncios.md`):
    - o `ads.spec.ts` mede com a vista aberta, em "Ajustar" e em "Ampliar", a 360 × 740 e a 1280 × 800, no mínimo nas cinco ferramentas em en e no Excluir em pt e es;
    - todo controle da vista (os botões, a moldura e a imagem), a lupa, o "Ver o PDF novo", o "Ver páginas" e o segmento de tamanho entram nas listas de alvos dos 150 px, e os alvos de hoje não encolhem;
    - com a vista aberta, nenhum elemento do site fica por cima da âncora simulada: o `elementFromPoint` nos pontos da área dela não devolve nada do `<main>` nem da ilha;
    - o `fo-ad-map.spec.ts` e o `ads-coffee.spec.ts` continuam verdes.

15. **Os testes.** Cada critério da ficha tem um teste ou uma medida com evidência, e cada teste que mede algo que já existia reprova no `dist-base` (o controle negativo vai no relatório, com a mensagem de erro):
    - critério 1: a `gen-paginas-mistas` nas cinco ferramentas, nos dois navegadores, mais o Girar depois de 1 e de 3 giros;
    - critério 2: a 360 × 740 com `deviceScaleFactor: 2` e a 1280 × 800 com 1, a largura natural contra a largura em CSS × DPR, as medidas da ficha, as teclas, o Esc com o foco de volta e o arrasto de 48 px;
    - critério 5: atrase a chegada da imagem grande para depois dos 500 ms do `hadRecentInput` (por exemplo, com o CDP `Emulation.setCPUThrottlingRate`), senão o teste não prova nada; nenhum gancho de teste no código do site;
    - critério 6: o teste percorre as 12 ferramentas de PDF e mede o retângulo nos três idiomas;
    - critério 7: o `elementFromPoint` no centro da `img` e do check devolve eles, não a lupa, com números de página de três dígitos (a `gen-paginas-300`);
    - critério 11: o axe com a vista aberta vai num spec que caia numa parte leve (pegadinha do `axe-pdf-states.spec.ts` no `docs/claude/playwright.md`);
    - a lógica pura (a proporção pela caixa, o `/Rotate` e os giros; a largura pedida; o intervalo da âncora; as formas da contagem) ganha Vitest.

    Cada spec novo tem nome e parte escolhidos pelo tempo medido com o `--list` e as partes do `.github/workflows/ci.yml` (`docs/claude/playwright.md`), com o alvo de 700 s por parte. Se for preciso redividir as partes, a mudança em `.github/workflows/` vai numa PR separada, de merge do Victor, e esta run segue sem ela. Os testes antigos que mudam vão num § no formato da § 341: o que pedia, o que pede, por quê e o que continua protegido.

16. **O design system (item 11).** O `docs/design/components/PageView/` ganha o README (a anatomia de cima para baixo, os estados, o teclado e o toque, o foco, as falas, as larguras, a regra de anúncio e o que a vista nunca faz) e o `preview.html`, no padrão dos outros previews, só com tokens. A regra "Ícone sozinho só em ação de linha" do `docs/design/README.md` passa a citar a lupa da grade de páginas como ação de item, com o texto de antes e o de depois no §. O README dos ícones ganha o `zoom`. Os README do FileCard, do ResultCard e o `docs/design/components/README.md` mudam só onde a F14 os desmentir.

17. **O `docs/claude/pdf.md`.** Uma seção nova no fim, "F14: páginas de PDF à vista", com o que a próxima run precisa saber: a proporção da folha, a largura pedida, onde a vista abre, o cache das imagens grandes, a âncora, o `release()` e as pegadinhas que você achar. As seções antigas não mudam. Pegadinha de Playwright ou de anúncio vai numa seção nova no fim do `playwright.md` ou do `anuncios.md`.

18. **O `docs/PENDENCIAS.md` (item 12).**
    - Saem das tabelas abertas para "Já corrigidos", com a run e o § (no formato `| F3 c-04: … | F12, § 428: … |`): F5a E-2, F5a E-4, F5a E-5, F4-F7 d-2 e F4-F7 d-8. Nenhum id some do arquivo: o `pendencias.test.ts` procura os baixos das revisões (§ 341 e § 447).
    - Entra o grupo novo "## 24. O que a F14 deixou", no formato dos grupos 22 e 23 (seis colunas), com pelo menos: o D16 (a busca por cima da âncora; "Victor decide") e o "JPG to PDF" como termo da busca do site e do título da Imagem para PDF ("Run de ajuste de SEO"). Entra também o que a run deixar: o item 7, se a válvula o cortar ("Run F14b"); a linha do `PLANO-FILEORCA.md`, se faltar ("Victor faz"); o orçamento, se passar; os baixos que a revisão deixar.
    - O Resumo e o Total acompanham.

19. **As imagens.** JPG de qualidade 80 em `docs/relatorios/fase-14/`, tiradas do `dist/` com o Chromium do Playwright, a 1x e com movimento reduzido, por um script em `.cache/f14/` (o `pnpm screenshots` quebra nas calculadoras, F13b c-1):
    - `grade-mistas-360` e `grade-mistas-1280`, cada uma com `-antes` e `-depois` (o Excluir com a `gen-paginas-mistas`);
    - `grade-grandes-1280` e `excluir-sai-360` (três páginas marcadas);
    - `vista-ajustar-360`, `vista-ampliar-360`, `vista-ajustar-1280`, `vista-girar-1280` (depois de um giro) e `vista-1280-escuro`;
    - `resultado-ver-pdf-360` e `juntar-ver-paginas-360`.

20. **A PR e o CI.**
    - **A PR abre em rascunho** logo depois do primeiro push, e cada push roda o job leve.
    - **Uma conferência no Linux, no meio da run,** depois da junção das frentes (fatia 3 de "Como trabalhar"): o WebKit e as fontes de lá diferem do Windows (§ 305), e esta run mexe no CLS e em medidas. Faça o push, espere a execução leve terminar e rode `gh pr edit <n> --add-label ci`:
      - se o rótulo existir, acompanhe a execução completa, leia os logs, corrija o que só falhou lá e tire o rótulo (`gh pr edit <n> --remove-label ci`);
      - se não existir, pule a conferência e registre num §: a execução final faz esse papel. Nunca use como atalho o `gh pr ready` seguido do `--undo` com o `ci-ok` a caminho do verde.
    - **No fim,** com tudo commitado (o relatório, a revisão e as imagens): faça o push, espere a execução leve terminar verde, e só então rode o `gh pr ready`; acompanhe a execução completa até o fim. Se ela falhar: `gh pr ready --undo`, corrija, commite, faça o push, espere a leve e rode o `gh pr ready` de novo. A falha e a correção vão no relatório.
    - **O custo:** o `pnpm ci:custo` da execução final vai na descrição da PR (`gh pr edit <n> --body-file <arquivo>`), mesmo depois do merge.

# Armadilhas conhecidas

- **O `build.format` do Astro** faz de toda página um `.../index.astro`, e o `exactOptionalPropertyTypes` pega campo opcional pela metade: rode o `pnpm tipos` cedo (ele confere também os specs).
- **O Preact reaproveita filhos sem `key` pelo tipo, em outra posição** (F13a, `docs/claude/pdf.md`): a faixa que troca entre a grade e a vista leva `key` em cada filho, senão o Chromium mede deslocamento.
- **O painel leva o foco à ação um quadro depois de mostrar a grade** (§ 240): o foco da vista ao abrir não pode ser roubado por esse movimento, e o teste que foca uma página ou a lupa logo depois de abrir o arquivo espera antes o foco na ação.
- **Marca de foco só se gasta quando o alvo existe** (§ 510): vale para o foco de volta na lupa, no "Ver o PDF novo" e no "Ver páginas".
- **Depois do resultado, as opções das ferramentas automáticas ficam no "Adjust" fechado,** e o corpo dele só entra no DOM aberto: o Girar página por página depois do resultado abre o "Adjust" antes.
- **A região da ilha é o `p.fo-sr[role="status"]`:** o Juntar tem a da contagem (`.fo-count`) antes no DOM.
- **O cache das miniaturas é por (índice, largura),** e o `drop` precisa da mesma largura do `get`.
- **Abaixo de 480 px, a linha do Juntar ocupa duas linhas** (§ 515): um teste que compara um controle com o card usa o `y`, não o `x`. A lista mostra 6 linhas e esconde o resto atrás de "Show N more" (`.fo-queue__more`).
- **As opções em segmento escondem o rádio:** no teste, clique no rótulo `.fo-seg__opt`.
- **O WebKit do Windows não tem `OffscreenCanvas` no worker:** lá o desenho já vai pela porta da página. Teste os dois caminhos. O WebKit do Linux do CI difere do Windows (§ 305).
- **As medidas de anúncio só valem no build de teste,** e cada parte do CI que roda um spec com ele paga um build (`docs/claude/playwright.md`, F12).
- **O `hadRecentInput` desculpa 500 ms depois do gesto:** o teste do critério 5 precisa da imagem chegando depois disso.
- **O Playwright do Windows pode não sair depois do último teste** (`docs/claude/playwright.md`, "Ajuste da largura do cabeçalho"): veja o que fazer lá.
- **A regra da linha de sucesso (`SUCCESS_LINE`) do `scripts/lib/design-checks.ts` é repetida no `tests/unit/routes.test.ts`:** frase de sucesso nova muda as duas.
- **O "antes":** monte o `dist/` da `origin/main` numa worktree à parte (`dist-base`), nunca trocando a branch do clone principal.

# Critérios de aceitação (cada um com evidência no relatório)

1. Os 11 critérios da ficha da F14, um por um, com a saída real do teste ou da medida, e nenhum afrouxado. Se um não se cumprir (o 8 ou o 10, pelas regras das decisões 12 e 13), o relatório diz isso com a medida real, e o § e a pendência existem.
2. Os 12 itens de "Dentro" feitos; o item 7, se a válvula o cortar, com o § e a linha "Run F14b".
3. Nenhum item do "Fora" da ficha ou deste prompt foi tocado; a matriz de PDF e as saídas de todas as ferramentas iguais às do ponto de partida.
4. O CLS sem gesto continua 0 nas páginas de PDF, na carga e na interação (o `tool-slot.spec.ts` e o `layout-shift.spec.ts`), com a grade nova e a vista.
5. Nada sai do aparelho, e nada vai para a URL, o histórico, o storage ou o GA4: o `pdf-privacy.spec.ts`, o `launch-claims.spec.ts` e o `events.spec.ts` passam, com a vista e o "Ver o PDF novo" no caminho.
6. O `lint:texto` dá 0 erro; o `gate:conteudo`, o `english-leak.test.ts`, o `glossary.test.ts`, o `claude-md.test.ts` e o `pendencias.test.ts` passam.
7. Os documentos da decisão 16 e da 17, o `PENDENCIAS.md` da 18, a linha do `CLAUDE.md` e o `PLANO-UX-QV.md` commitado sem mudança.
8. Os testes antigos que mudaram estão num §, um por um; nenhum teste foi pulado, desligado ou afrouxado.
9. O `pnpm verificar --partes` passou na máquina, com a saída real no relatório; os specs novos não levam nenhuma parte do CI acima de 700 s (ou a PR separada da decisão 15 está aberta); o CI completo está verde.
10. A revisão adversarial está em `docs/relatorios/REVISAO-F14.md`, sem achado alto ou médio aberto.

# Verificação: rode de verdade

- **A linha de base, antes de mudar código.** No `dist-base`:
  - `pnpm install --frozen-lockfile` e `pnpm build`;
  - o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, com a saída em `.cache/f14/antes/`;
  - o número de testes do Vitest e o `pnpm exec playwright test --list` de cada navegador, a lista dos JS de `dist/_astro/` e o tamanho de cada ilha com gzip;
  - a medida do D1 (a `img` contra a folha) nas cinco ferramentas, que vira o controle negativo do critério 1;
  - as imagens do "antes".
- **Em cada fatia:** `pnpm tipos`, `pnpm lint`, `pnpm build`, o Vitest dos arquivos tocados e os specs que a fatia toca, nos dois projetos (`--project=chromium` e `--project=webkit`): no mínimo o `pdf-tool.spec.ts`, o `pdf-pieces.spec.ts`, o `pdf-merge.spec.ts`, o `axe-pdf-states.spec.ts`, o `tool-slot.spec.ts`, o `engine-paths.spec.ts` e os specs novos. Depois de mexer na faixa ou no resultado, rode também o `ads.spec.ts`, o `fo-ad-map.spec.ts` e o `ads-coffee.spec.ts` no build de teste. Leia a falha, corrija a causa e repita até passar.
- **Nunca afrouxe um limite** para um teste passar: o limite é o da ficha, o deste prompt e o do projeto.
- **O `pnpm verificar --partes` roda uma vez,** no último commit de código, com a máquina livre. Se uma parte falhar: rode a mesma parte no ponto de partida, numa worktree. Se falhar igual, a falha não é desta run: registre num § e no relatório, e siga. Se não, ache o que esta run mudou e corrija.
- **No CI:** acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log`. O `pnpm ci:custo <id>` da última execução vai no relatório (regra 5).

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. A ficha da F14 e este prompt.
2. As seções A e B, o diagnóstico e as regras de todas as runs do `PLANO-UX-QV.md`.
3. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md`, o `CLAUDE.md`, `docs/claude/` e `docs/design/`.
4. O `DECISOES.md` e o código.
5. Na dúvida, a opção mais simples e mais reversível que não piore o orçamento, a acessibilidade nem o anúncio.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: o alinhamento de uma linha da grade com proporções diferentes; o lugar do "Ver o PDF novo"; o Desfazer do Juntar e o `release()`; o nome e a parte de cada spec novo; cada teste antigo que mudou.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos: o rótulo `ci` não existe (decisão 20); o Victor não pôs a linha do `PLANO-FILEORCA.md` (decisão 2); a main muda no meio da run (`git fetch` e `git merge origin/main` na branch, nunca rebase, renumerando os § se colidirem); o Lighthouse oscila numa URL (rode a parte de novo uma vez; se cair de novo, ache a causa).

Válvula de estouro, se o tempo ou o limite apertar: só o item 7 (o Juntar) pode sair, para uma F14b, com um § e a linha "Run F14b" no grupo 24. Nunca corte os itens 1 a 6 e 8 a 12, os testes dos critérios nem a revisão adversarial final.

# Git e segurança

- **Começo:**
  - `git switch main` e `git pull --ff-only`;
  - o `git status` pode mostrar, sem rastreio, os dois arquivos do prompt, o `PLANO-UX-QV.md` e a pasta `Claude outputs/`, e, modificado, o `PLANO-FILEORCA.md` (decisão 2). Qualquer outra coisa: não mexa, não commite e registre;
  - `git switch -c fase-14`. O primeiro commit leva os dois arquivos do prompt e o `PLANO-UX-QV.md`, sem edição, e o `PLANO-FILEORCA.md` só no caso que a decisão 2 permite;
  - se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como o recebeu, em `docs/prompts/prompt-fase-14.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main. Adicione por caminho, nunca `git add -A`.
- **A PR em rascunho** abre logo depois do primeiro push, num comando separado do push: `gh pr create --draft --base main --head fase-14`, com o título "F14: páginas de PDF à vista". O título e a descrição vão em português, e a descrição diz que o merge é do CI.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push (`https://fase-14-fileorca.vmatusita.workers.dev/`), que é o build padrão: mostra a grade e a vista, nunca anúncio.
- **Agentes em worktree** (regra 6 do `CLAUDE.md`): o primeiro passo de cada um é `git merge --ff-only fase-14`, e todo merge de volta leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`). As worktrees são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:** o push da branch; na PR dela, `gh pr create`, `gh pr ready`, `gh pr edit` (só a descrição e o rótulo `ci`) e o `gh pr ready --undo` só depois de uma execução final vermelha; leitura (`gh run`, `gh pr checks`, `gh pr view` e `gh api` sem método); um `gh run rerun` por falha que pareça instável, registrado; e, só se a decisão 15 pedir, a PR separada das partes do CI.
- **Na web, nada.** Esta run não precisa de página de fora.
- **Nunca:** push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`; mexer em `core.hooksPath` ou em `.githooks/`; `gh pr merge`, `gh label`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`; editar o `PLANO-FILEORCA.md` por qualquer caminho; postar, criar conta ou subir arquivo para qualquer serviço; `wrangler deploy` em qualquer forma. O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) a ficha, as seções A e B e este prompt num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) a ilha de PDF: o `PageGrid.tsx`, o `PdfPanel.tsx` (a faixa, o resultado, o `m.outs`, o Juntar, a região e o foco), o `tools.tsx` (as cinco ferramentas da grade e as opções delas), o `types.ts`, o `client.ts` e o caminho do `release()` até o motor, nos dois caminhos do PDF.js;
   - (c) os testes que fixam a grade, o resultado e o Juntar de hoje (`pdf-tool`, `pdf-pieces`, `pdf-merge`, `axe-pdf-states`, `tool-slot`, `layout-shift`, `pdf-privacy`, `engine-paths`, `events`, `budgets`), com o que cada um lê;
   - (d) os anúncios e o orçamento: as listas de alvos do `ads.spec.ts`, do `ad-clearance.ts` e do `ad-map.ts`, a âncora simulada do build de teste e as medidas do `budgets.spec.ts`;
   - (e) os textos e os documentos: os `i18n` das 12 ferramentas de PDF, o `PdfPanelTexts`, o glossário, o `docs/design/` (a regra dos ícones, o README dos ícones, a `ICON_NAMES` e os testes do sprite), o formato do `PENDENCIAS.md` e o `claude-md.test.ts`;
   - (f) as partes do CI: o `.github/workflows/ci.yml`, o `--list`, os tempos do último relatório e as regras do `docs/claude/playwright.md` para pôr spec novo numa parte.
2. **A linha de base** (seção "Verificação").
3. **Planejar.** Escreva `docs/relatorios/fase-14-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz: o ponto de partida e a linha de base; os § reservados; a interface que as frentes dividem (as props da célula, a âncora, o `onZoom`, as chaves dos textos); quem faz o quê, a ordem das fatias e os arquivos de cada frente; e cada critério ligado a um teste ou comando.
4. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. **O agente principal:** o primeiro commit, o push e a PR em rascunho; depois, a base: o item 1 (o corte), a célula com `memo` (E-2), Pequenas e Grandes com a largura pedida (item 3), o botão da lupa na célula com um `onZoom` ainda sem a vista, o ícone `zoom`, a âncora num lugar só e todas as chaves de texto novas nos tipos e nos três idiomas. Os testes dos critérios 1 e 7. Commit e push.
   2. **Duas frentes ao mesmo tempo,** cada uma num agente `opus` na sua worktree, a partir desse commit:
      - **V (a vista):** o componente da vista e a ligação dele nas cinco ferramentas (decisão 7), o modo resultado e o "Ver o PDF novo" (item 6), o Juntar (item 7), o cache das imagens grandes, o `inspect()` e o `release()` das vistas, com os testes dos critérios 2, 3, 5 e 6 e a parte da vista no critério 4;
      - **M (a marcação e o motor):** o Excluir que mostra o que sai (item 4), Inverter seleção, Shift+clique e Shift+Espaço (item 5), as falas d-2 e d-8 (item 9) e o E-4 (item 8), com os testes dos critérios 8 (o E-4) e 9.

      As duas frentes tocam o `PageGrid.tsx` e o `PdfPanel.tsx`: o plano diz quem é dono de cada parte, e a junção resolve o resto. Ao mesmo tempo, o agente principal faz o que não colide com elas: os textos das ferramentas (o FAQ do D6, os "Como funciona" e as frases desmentidas), o `docs/design/` (a regra, os ícones), o `docs/claude/pdf.md`, a linha do `CLAUDE.md`, o `PENDENCIAS.md` e os §.
   3. **O agente principal junta V e M,** resolve os conflitos, deixa o `pnpm tipos` verde, roda os specs das duas frentes nos dois navegadores e os de anúncio no build de teste, e faz a conferência no Linux (decisão 20).
   4. **O agente principal fecha:** a medida do E-2 contra o `dist-base` na mesma rodada, o orçamento, o README e o preview do `PageView` com a API final, as imagens e as tabelas do relatório.
5. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`): sobre um commit fixo e registrado da branch, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` e o próprio build de teste, contra a ficha, este prompt e o plano; cada lente com o próprio `FO_PORT`, escrevendo só no `.cache/lente-<x>/` da worktree. A F14 mexe em interface, em texto, no motor de PDF (o `release()`) e no entorno dos anúncios: são cinco lentes Sonnet em contexto limpo (regra 3), apontando só lacunas de correção ou de requisito, nunca preferência de estilo:
   - (a) **design system e visual:** a folha e o "contain" em toda proporção e nos giros; Pequenas e Grandes de 320 a 1440 px; a vista contra a seção A; os tokens, nada em `sun` fora do Baixar, o ícone `zoom` e os dois temas;
   - (b) **acessibilidade:** a lupa no foco móvel e os 48 px; os nomes acessíveis; o foco de ida e volta, nunca no `body` (também nas pontas com `aria-disabled`); as teclas; a alternativa por botão ao arrasto; uma fala por gesto (d-2, d-8, Shift, troca de página); o axe nos dois temas e nos dois navegadores;
   - (c) **comportamento, desempenho e memória:** o `memo` de verdade e a medida do E-2; o E-4 em todos os caminhos de soltar; o cache das grandes (no máximo três, o `drop` com a mesma largura); a grade de 300 páginas; o CLS da grade e da vista; as saídas iguais (a matriz); o orçamento e as partes do CI;
   - (d) **privacidade e anúncios:** nada sai do aparelho; nada na URL, no histórico, no storage ou no GA4; os 150 px com a vista aberta nos dois modos; nada por cima da âncora; nenhuma camada; a busca (D16) intocada;
   - (e) **textos, idiomas e documentos:** os textos contra a seção B; en e es pelo glossário; o FAQ do D6 e as frases desmentidas; os "Como funciona"; o `lint:texto`; os README, o `docs/claude/pdf.md`, o `CLAUDE.md`, os planos, o `PENDENCIAS.md` e os §.

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo, com a regra "na dúvida, refutado"; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada das lentes dos achados corrigidos revisa o diff delas. Os baixos que sobrarem vão para o grupo 24 do `docs/PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F14.md`.
6. **Fechar:** o `pnpm verificar --partes`, o relatório e a sequência de fim da decisão 20.

# Relatório final

Escreva `docs/relatorios/fase-14.md` em português, no formato do `fase-13a.md`, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo: o que muda para a pessoa nas ferramentas de PDF, em até cinco linhas;
- o que entrou, por item da ficha, com os arquivos e os §;
- a evidência de cada um dos 11 critérios, com a saída real dos comandos e dos specs, e os controles negativos com a mensagem de erro;
- as tabelas:
  - o D1, antes e depois: a `img` contra a folha nas cinco ferramentas, a 360 e a 1280, com a `gen-paginas-mistas`;
  - a vista: as larguras e as alturas medidas a 360 × 740 e a 1280 × 800, em "Ajustar" e em "Ampliar";
  - o E-2: as 20 medidas de cada lado, a média, o desvio, o controle de ruído e a razão;
  - o orçamento: os JS e as requisições de cada página de PDF, antes e depois, e o tamanho de cada ilha com gzip;
  - os anúncios: a menor distância de cada controle novo até um anúncio, por largura e por modo da vista;
- o número de testes do Vitest e do `--list` de cada navegador, antes e depois, e os testes antigos que mudaram, com o § de cada um;
- a saída real do `pnpm verificar --partes`, com o tempo de cada parte e a soma;
- o custo (regra 5): o `pnpm ci:custo` da última execução antes do relatório; o da execução final vai na descrição da PR;
- o que a conferência no Linux achou, ou o § que diz por que ela não houve;
- o resumo da revisão, apontando para o `REVISAO-F14.md`;
- as imagens de `docs/relatorios/fase-14/`;
- o link da prévia (`https://fase-14-fileorca.vmatusita.workers.dev/`);
- as decisões novas, apontando os §, e o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. `git pull` e, no Android, abrir `/pt/excluir-paginas-pdf/` (na prévia ou no fileorca.com depois do deploy) com um PDF de verdade: usar a lupa, arrastar para o lado, ampliar, marcar uma página na vista e voltar à grade. No computador, conferir as setas e o Esc.
  2. Decidir o D16 (a busca por cima da âncora), no grupo 24 do `docs/PENDENCIAS.md`.
  3. Por duas semanas, acompanhar no GA4 o `tool_complete` sobre o `tool_start` das cinco ferramentas da grade.
  4. Passar as candidatas da seção E do `PLANO-UX-QV.md` no Keyword Planner (30 min).
  5. Se a linha do `PLANO-FILEORCA.md` faltou, pô-la (o texto está no grupo 24).
  6. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
  7. Gerar o prompt da F15 com a skill, com o SHA da main e o grupo 24 do `docs/PENDENCIAS.md`.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR, o estado do CI (mesclada ou esperando, e por quê) e os passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `docs/PENDENCIAS.md`, os README do `docs/design/`, o `docs/claude/` e a descrição da PR. O site fala inglês, português e espanhol, nos arquivos de tradução de cada idioma.

Em inglês: o código, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-fase-14.md` e `prompt-fase-14.txt` já estão em `docs\prompts\` no seu clone, sem commit, e o `PLANO-UX-QV.md` está na raiz, também sem commit. A run põe os três no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # b7a6396 (o ajuste-home-cards) ou mais novo
git status                  # sem rastreio: os dois arquivos do prompt, PLANO-UX-QV.md e "Claude outputs\"
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado
claude --version            # o modo auto pede 2.1.83 ou mais
```

Depois:

1. **Ponha a linha do `PLANO-FILEORCA.md` (1 min, recomendado).** A ficha pede uma linha no topo dele apontando para o plano novo, mas o `.claude/settings.json` proíbe as runs de editar esse arquivo, então quem põe é você. Abra o `PLANO-FILEORCA.md` no editor. Depois da linha 3 (a que começa com "29/out/2026") e da linha em branco que vem depois dela, cole esta linha e mais uma linha em branco:

   ```text
   **Plano de UX e qualidade de vida (9/nov/2026):** as fichas da F14 à F18 estão no PLANO-UX-QV.md. Até a F17 ele não muda nada deste plano; a única mudança no contrato (a linha 15, o catálogo) entra na F18, pela tabela "Mudanças no contrato" do PLANO-MELHORIAS.md.
   ```

   Salve em UTF-8 e confira com `git diff --stat`: tem que dar `PLANO-FILEORCA.md | 2 ++`. A run confere o diff e commita a linha junto com o plano. Se você pular este passo, a run segue sem a linha e a deixa como pendência sua.
2. **Crie o rótulo `ci`, se ainda não criou (30 s, recomendado).** No GitHub, abra Issues → Labels → New label, com o nome `ci`. Com ele, a run confere o WebKit do Linux no meio, depois de juntar as duas frentes. Esta run mexe no CLS e em medidas finas, e sem o rótulo uma falha que só aparece no Linux custa uma volta a mais no fim.
3. **A energia:** `powercfg /change standby-timeout-ac 0`. Volte ao normal depois da run.
4. **O disco:** a run faz o build do site e o build de teste várias vezes, em até cinco worktrees (a base, as duas frentes e a revisão). Deixe uns 20 GB livres.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-14
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-14.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal a miniatura inteira, a lupa e a vista da página nas cinco ferramentas da grade, Pequenas e Grandes, o Excluir que mostra o que sai, Shift+clique e Inverter, o Ver o PDF novo e os 11 critérios da ficha da F14 com evidência, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F14.md sem achado alto ou médio aberto e a PR da fase-14 pronta, com o ci-ok verde
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-14` e mande: "continue de onde parou: leia docs/relatorios/fase-14-plano.md, o git log da branch fase-14 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-14.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-14.json
(Get-Content $HOME\run-fase-14.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`.** A run faz muita coisa sem perguntar:

- builda o site e o build de teste e roda o Playwright em várias portas, também em worktrees;
- cria e remove as worktrees das frentes e da revisão;
- roda o LanguageTool local e o Lighthouse;
- faz push da branch, abre a PR em rascunho, põe e tira o rótulo `ci` (se existir) e marca a PR como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo (push na main, `gh pr merge`, `gh api` com método, `wrangler deploy`, reset, amend e a edição do `PLANO-FILEORCA.md`), e o prompt não pede nada disso. A run não usa a web.

**O tamanho da run.** Fica perto da F13a:

- refaz a grade de páginas e põe um componente novo (a vista) nas cinco ferramentas, no resultado das 12 e no Juntar;
- tem duas frentes em paralelo, mais a junção;
- a medida do E-2 roda 40 vezes a grade de 300 páginas, e o mapa de anúncios roda de novo com a vista aberta;
- a revisão tem cinco lentes, com céticos (a run mexe no `release()` do motor de PDF);
- o `pnpm verificar --partes` local leva uns 55 min (foram 54 no ajuste-home-cards).

Comece com folga no limite semanal do Claude Code. Se apertar, a válvula manda só o "Ver páginas" do Juntar para uma F14b. O resto nunca sai.

### 3. Acompanhar

- **Não mexa no clone durante a run.** Ela está na branch `fase-14` dessa pasta.
- **A PR aparece cedo, em rascunho.** Cada push roda só o job leve (uns 4 min).
- **A prévia** (`https://fase-14-fileorca.vmatusita.workers.dev/`) é o build padrão: mostra a grade nova e a vista, mas nunca anúncio. As medidas de anúncio aparecem no relatório.
- **Não marque a PR como pronta.** O `gh pr ready` é o último passo da run. Depois dele, o CI roda tudo e mescla sozinho.

### 4. Ao voltar

1. **Atualize a main:** `git switch main` e `git pull --ff-only`. Se a PR não foi mesclada, o relatório e a resposta final dizem por quê.
2. **Confira no Android,** na prévia ou no fileorca.com depois do deploy: abra `/pt/excluir-paginas-pdf/` com um PDF de verdade, use a lupa, arraste para o lado, amplie, marque uma página na vista e volte à grade. No computador, confira as setas, o Home, o End e o Esc.
3. **Leia `docs\relatorios\fase-14.md`** e confira as evidências:
   - a tabela do D1: a miniatura inteira em toda proporção;
   - a vista: as larguras a 360 e a 1280;
   - o E-2: a razão de no máximo 0,5 contra o ponto de partida;
   - o orçamento: os mesmos arquivos JS, com no máximo 8 KB a mais;
   - os anúncios: nenhuma distância abaixo de 150 px com a vista aberta;
   - o `pnpm verificar --partes` verde e o veredito do `REVISAO-F14.md`.
4. **Olhe as imagens** de `docs\relatorios\fase-14\`, sobretudo `grade-mistas-360-antes.jpg` contra `grade-mistas-360-depois.jpg` e `vista-ajustar-360.jpg`.
5. **Depois, pelo plano:** decida o D16; acompanhe o GA4 por duas semanas; passe as candidatas da F18 no Keyword Planner; e gere o prompt da F15 com a skill.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `b7a6396`,** com o ajuste-home-cards mesclado (PR 28), e nada mudou desde o plano. O próximo § livre é o 617.
- **A linha do `PLANO-FILEORCA.md` fica com você,** no pré-voo. A ficha pede a linha, mas o `.claude/settings.json` proíbe as runs de editar o arquivo, e a F13a também não mexeu nele. A run só commita a linha que você puser e confere o diff antes. Sem ela, vira pendência sua.
- **Só o `zoom` é ícone novo.** "Anterior" e "Voltar às páginas" usam o `chevron-right` espelhado, porque o projeto não tem chevron para a esquerda e a ficha só nomeia o `zoom`.
- **O "a cada execução nova" do E-4 vale para o PDF do resultado anterior,** não para o arquivo que a grade mostra. Soltar a entrada a cada execução faria a ferramenta ler o arquivo de novo a cada giro ou marca.
- **A medida do E-2 é local,** na mesma máquina e na mesma rodada, como a ficha pede. Tempo de script no CI oscila demais para virar teste. Se a razão não chegar à metade, o relatório diz isso com a medida real, sem afrouxar a conta.
- **O teste do CLS da vista atrasa a imagem grande** com a CPU lenta. Senão, a janela de 500 ms do `hadRecentInput` desculparia qualquer pulo, e o teste não provaria nada.
- **O teste de anúncio com a vista aberta roda nas cinco ferramentas em en e no Excluir em pt e es,** para não pesar nas partes do CI. A run pode pôr mais.
- **As duas frentes (a vista e a marcação) rodam em paralelo** depois de uma base comum feita pelo agente principal. Elas dividem o `PageGrid.tsx` e o `PdfPanel.tsx`, e o plano da run diz quem é dono de cada parte.
- **A revisão tem cinco lentes,** como o plano pede (a run mexe no `release()` do motor de PDF).
- **O merge é automático:** a PR não mexe em `.github/`. Se as partes do CI precisarem de nova divisão, isso vai numa PR separada, com merge seu.
