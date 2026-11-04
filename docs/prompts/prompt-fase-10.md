# Fase 10: UX/UI, diagnóstico e proposta

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F10 do FileOrca, a fase "UX/UI: diagnóstico e proposta" do `PLANO-MELHORIAS.md`. Ache onde o FileOrca perde a pessoa e onde ele parece genérico. Proponha, com protótipo, a evolução da UX e da UI com a Oli no centro, incluindo o desenho das peças que a F11 e a F12 vão construir. Nada muda no site.

Ao terminar:

- `docs/propostas/ux-v2/` tem o `index.html`, que abre todos os protótipos, o `README.md` com os itens numerados (UX-01, UX-02…) e o `ESCOLHAS.md`, a lista que o Victor marca, com a recomendação de cada item;
- os oito obrigatórios da ficha têm protótipo:
  - o cabeçalho com menu e botão de tema (2 alternativas);
  - o hub de guias e as entradas dos guias;
  - a home (2 alternativas);
  - a página de ferramenta, do soltar ao resultado (2 alternativas);
  - o card do café e a página de apoio;
  - a parede do bloqueador com a Oli triste, nos dois modos;
  - o mapa de anúncios de cada molde, com a densidade a 360×740;
  - a pose `sad`;
- cada pendência de design e acessibilidade da ficha tem destino, e cada item da lista "para avaliar" está proposto ou descartado, com o porquê;
- o diagnóstico das seis tarefas principais está no README, com a evidência de cada atrito, e as imagens estão em `docs/relatorios/fase-10/`;
- o relatório está em `docs/relatorios/fase-10.md`, e a revisão, em `docs/relatorios/REVISAO-F10.md`;
- a PR da branch `fase-10` só tem documentação, sai pronta e o CI a mescla sozinho.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está em `33be71e` (a F9 mesclada) ou num commit mais novo. Confira com `git log --oneline -5`. Guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

O que mudou desde que o plano foi escrito:

- **A F9 está na main.** O CI roda por classe (`scripts/ci/classificar.ts`):
  - PR em rascunho sem o rótulo `ci` roda o job `leve` (tipos, lint, build e Vitest);
  - PR pronta só de documentação roda a classe `portões` (o build e os portões, sem o Playwright e sem o Lighthouse) e depois o `merge`;
  - "só documentação" é todo arquivo em `docs/` fora de `docs/design/` e de `docs/oli/`, ou um `.md` da raiz. Esta PR tem de cair nessa classe.
- **O `CLAUDE.md` ficou enxuto.** As pegadinhas estão em `docs/claude/`, com um índice no `CLAUDE.md`. Leia só os arquivos do que esta run toca (lista abaixo).
- **O repositório é público desde a criação** (DECISOES § 338). Tudo o que você commita, a PR, os logs e os artefatos do Actions ficam públicos.
- **O rótulo `ci` pode não existir** (§ 338). Esta run não precisa dele.
- **A F9b** (a redivisão do CI) pode rodar antes, depois ou ao lado desta. Ela não toca o que esta run toca, fora o `DECISOES.md`.
- **O checkout dos jobs `build`, `lighthouse` e `playwright` é esparso e pula `docs/relatorios/`** (`docs/claude/ci.md`, seção da F9). Imagem fora de `docs/relatorios/` deixa todo job do CI mais lento, para sempre.
- **O próximo § livre do `DECISOES.md` é o 342,** se nada entrou depois da F9.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da F10 e vence o resto.
2. O `PLANO-MELHORIAS.md`:
   - "Mudanças no contrato", "O que não é viável ou tem limite" e "Regras novas de toda run";
   - a ficha da F10;
   - as fichas da F11, da F12 e da F13, porque elas constroem a partir do que você propõe;
   - as seções A a E.
3. O `PLANO-FILEORCA.md`:
   - "Decisões fechadas";
   - "Design: amigável, chamativo e rápido", com "A mascote: Oli, a orca", "Orçamento de desempenho" e os dois moldes;
   - "Monetização", com "O que derruba conta" e "Doações";
   - "Execução por IA".
4. O `CLAUDE.md` e, de `docs/claude/`: `design-e-oli.md`, `anuncios.md`, `playwright.md`, `windows-git-bash.md` e, do `ci.md`, só a seção da F9.
5. O `docs/design/`:
   - o `README.md` (as regras e a lista "Nunca");
   - o `tokens.css` e o `tokens.json`;
   - o `components/README.md` e os README dos componentes que a proposta toca: Header, ToolPage, DropZone, ResultCard, SupportCard, AdSlot, Oli, OliMessage, CookieNotice, Footer, ToolCard, Breadcrumb e ToolSearch;
   - o `assets/Oli/README.md` e o `MUDANCAS-v1.1.md`;
   - e o `docs/oli/folha.html`.
6. Do `docs/PENDENCIAS.md`: a seção "Como ler", os grupos 5 e 6 e as linhas F3 d-02, F7 e-1, F4-F7 e-2, F4-F7 f-1, F4-F7 f-2, ajuste-aviso-espaco, F7 f-10 e F4 ACE-7.
7. O `DECISOES.md`, só buscando os § (nunca inteiro: são 537 KB). Comece pelos que as pendências citam (§ 103, § 106, § 124, § 139, § 241, § 274 e § 305) e siga pelos que você precisar.
8. O código, só para entender o que existe, nunca para mudar:
   - o cabeçalho e o menu de idioma;
   - o molde da ferramenta e o da calculadora;
   - `src/ads/`;
   - o card do café;
   - `src/oli/sprite.ts`;
   - o tema no CSS;
   - os eventos do GA4;
   - o mapa de rotas e os registros de guias (`src/tools/guides/registry.ts` e os GUIDES de dinheiro);
   - e `tests/e2e/lib/budgets.ts`, com os orçamentos de JS e de requisições.

**Dados opcionais.** Se existir `.cache/dados-f10/`, com os eventos do GA4 por página nos últimos 28 dias e as páginas e consultas do Search Console exportados pelo Victor, use-os. Sem eles, a run segue com heurística e medida, e registra.

**A web.** Você pode ler documentação (AdSense, Coalition for Better Ads, WCAG, MDN e a ajuda dos bloqueadores de anúncio) e abrir, em repouso, as páginas dos concorrentes da decisão 3. Ler não é mandar pedido: não entre em conta, não crie conta, não preencha formulário.

# Escopo

Dentro:

1. O diagnóstico das seis tarefas (decisão 2) e a comparação com os concorrentes (decisão 3).
2. A proposta em `docs/propostas/ux-v2/`: os nove obrigatórios e a lista "para avaliar" (decisões 4 a 14).
3. As verificações em `.cache/f10/` (decisão 15).
4. Os §, a revisão adversarial e o relatório.

Fora (não toque):

- **Nenhum arquivo fora destes:**
  - `docs/propostas/ux-v2/`;
  - em `docs/relatorios/`, só os arquivos novos desta run: `fase-10.md`, `fase-10-plano.md`, `REVISAO-F10.md` e a pasta `fase-10/`;
  - em `docs/prompts/`, os dois arquivos do prompt;
  - o `DECISOES.md`, só acrescentando §.

  Isso deixa de fora `src/`, `tests/`, `scripts/`, `.github/`, `public/`, `docs/design/`, `docs/oli/`, `docs/claude/`, `docs/PENDENCIAS.md`, `docs/OPERACAO.md`, o `CLAUDE.md`, os dois PLANOs, o `astro.config.ts`, o `package.json` e o `pnpm-lock.yaml`.
- **Dependência nova de qualquer tipo,** inclusive um `pnpm dlx` ou `npx` de pacote fora do lockfile. Os scripts de apoio usam o que já está instalado: o Node, o Playwright e o `@axe-core/playwright`.
- Cor fora dos tokens sem o contraste calculado (decisão 12), e tudo da lista "Nunca" do `docs/design/README.md`.
- Qualquer coisa no Cloudflare, no GitHub (fora da PR desta run), no GA4, no Search Console ou no AdSense. Mandar arquivo, texto ou formulário a qualquer site, inclusive aos concorrentes.
- Código do site para testar uma ideia: a ideia vive no protótipo.
- O `pnpm screenshots`, que apaga e regrava `docs/relatorios/fase-03/componentes/`, e o `pnpm design:gerar`, que regrava `src/styles/theme.css` e `docs/oli/folha.html`.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 342)

1. **Onde fica cada coisa.**
   - **`docs/propostas/ux-v2/`:** o `index.html`, o `README.md`, o `ESCOLHAS.md`, os protótipos (um `.html` por peça e por alternativa), um `proto.css` comum se precisar, os SVG novos (a pose `sad` e os ícones propostos) e a folha da Oli. Só texto, HTML, CSS e SVG: nenhum PNG ou JPEG, nenhum `.js`, `.ts` ou `.mjs`.
   - **`docs/relatorios/fase-10/`:** todas as imagens, em três pastas: `diagnostico/` (só as capturas citadas), `prototipos/` e `oli/` (a pose `sad` em PNG, para a busca reversa).
   - **`.cache/f10/`, fora do Git:** os scripts de apoio, todas as capturas brutas, as capturas e as notas dos concorrentes, os dados do GA4 e do Search Console e a saída das verificações.
   - A ficha põe as screenshots dentro da proposta. Elas ficam em `docs/relatorios/fase-10/` por causa do checkout esparso do CI; o README e o `index.html` apontam para elas. O § registra o desvio e o porquê.

2. **O diagnóstico.**
   - **As seis tarefas:** comprimir imagem, HEIC para JPG, juntar PDF, hipoteca, SAC × PRICE (pt) e um guia. O guia é o mais visto, se houver dados; sem dados, um guia de arquivo com a ferramenta embutida, que exista nos três idiomas. Ache as URLs de cada idioma pelo mapa de rotas. A tarefa entra em cada idioma em que existe.
   - **A matriz:** 360×740 e 1280×800, claro e escuro, cada idioma, e duas visitas:
     - a primeira, sem o `fo-consent`, com o aviso de cookies aberto;
     - a volta, com o consentimento gravado.
   - **Os estados de cada tarefa:** repouso; arquivo em cima ou campos preenchidos; processando; resultado; erro (um arquivo inválido ou um campo fora da faixa); e o próximo passo, o que a pessoa faz depois. Use as fixtures de `fixtures/`.
   - **Onde medir:**
     - no `dist/` do ponto de partida (rode `pnpm install --frozen-lockfile` e `pnpm build` no começo), servido pelo `pnpm serve`, que é determinista;
     - para os anúncios de hoje, no build `all` que o `gate:prontidao` deixa em `.cache/prontidao/`, com os IDs de teste;
     - e, uma tarefa por categoria, no fileorca.com, com o `context.route` abortando os domínios do Google (`docs/claude/anuncios.md`). Registre a diferença, se houver.
   - **As medidas por tarefa e por tamanho:**
     - toques ou cliques até o resultado;
     - a posição do botão principal, do Baixar e do resultado contra a dobra;
     - o CLS da interação (hoje só o do carregamento é medido, F4-F7 e-2);
     - o tempo até o resultado com a fixture;
     - o que o aviso de cookies cobre na primeira visita;
     - quantas telas até o primeiro conteúdo útil;
     - o JS e as requisições da página, com os mesmos números do `budgets`.
   - **Cada atrito vira um D-NN,** com:
     - a tarefa, o idioma, o tamanho, o tema e o estado;
     - o que acontece;
     - a evidência: uma captura em `docs/relatorios/fase-10/diagnostico/`, um número medido ou uma heurística citada pelo nome (uma das 10 de Nielsen, um critério da WCAG 2.2 ou uma regra do `docs/design/README.md`);
     - a gravidade: bloqueia, atrasa ou incomoda;
     - e o UX-NN que responde a ele.
   - **"Parece genérico":** cada achado diz o quê, onde e qual regra ou princípio do design system ele trai. Se o design system não diz nada, o achado vira proposta.
   - **Com os dados do GA4 e do Search Console:** a conclusão por página (`tool_complete` sobre `tool_start`), as saídas e as páginas com muita impressão e pouco clique. No Git, só proporções e ordem: nunca número absoluto de usuários, sessões, eventos, cliques ou impressões, e nunca consulta copiada. Os números completos ficam em `.cache/f10/dados.md`.
   - A matriz inteira fica em `.cache/f10/`. Só a captura citada por um D-NN ou por um UX-NN vai para o Git.

3. **Os concorrentes:** iLovePDF, Smallpdf, TinyPNG, Squoosh e uma calculadora de hipoteca da NerdWallet.
   - **Só em repouso:** abrir a página, rolar, abrir um menu. Nunca soltar arquivo, digitar em campo, aceitar cookie, entrar em conta ou mandar qualquer coisa.
   - **O que medir:** a posição do botão principal a 360×740; quantos anúncios há nas primeiras telas, e a densidade; o cabeçalho e o menu; as entradas de guia e de ajuda; o tema escuro; o pedido de apoio.
   - **O que entra no Git:** nada deles. As capturas e as notas ficam em `.cache/f10/concorrentes/`. Nenhuma captura, logo, texto ou trecho de layout deles vai para o repositório. O README diz, em palavras, o padrão e a lacuna, com o endereço e a data.
   - Serve para achar padrão e lacuna, nunca para copiar. Se um site bloquear o robô, registre e siga com os outros.

4. **Os protótipos.**
   - **A base:** HTML estático, um arquivo por peça e por alternativa, sobre `../../design/tokens.css`, `../../design/components/bundle.css` e `../../design/fonts/fonts.css`, por caminho relativo, mais o `proto.css` da pasta para o que é novo. Nada de `src/`.
   - **Abrem pelo duplo clique (`file://`),** que é como o Victor vai abrir, e por http. Por isso:
     - script só inline e clássico (o Chromium bloqueia `type="module"` em `file://`);
     - nada de `fetch`;
     - nenhuma fonte, script ou imagem de fora do repositório.
   - **O tema** segue a convenção dos previews do `docs/design/` (`?theme=dark`). O protótipo do cabeçalho tem também o botão de tema de verdade.
   - **O idioma:** inglês, com português e espanhol onde o texto muda o desenho. O menu, a parede, o café, o hub de guias e a página de apoio saem sempre nos três.
   - **Os estados** (repouso, arquivo em cima, processando, resultado e erro; aviso, bloqueio e depois do escape na parede) mudam por um controle de protótipo fora da moldura da página, acessível por teclado e com o nome "Prototype control". Na parede, o estado vem da URL (por exemplo, `?modo=bloqueio`), porque o `showModal()` deixa o resto da página inerte, e o controle fica fora de alcance com o diálogo aberto.
   - **A Oli** entra inline, com as peças do sprite e o `oli-clip` declarado uma vez por página, sempre com `aria-hidden`. O estado é dito em texto.
   - **Cor nova** só como proposta de token, com nome, valor nos dois temas e o contraste calculado (decisão 12), declarada no `proto.css` com o prefixo `--proposta-`.
   - **O anúncio** é a caixa neutra do AdSlot, com "Advertisements", "Publicidade" ou "Anuncios", sem script nenhum.
   - **O protótipo recomendado é a especificação** que a F11 e a F12 seguem quando o Victor não escolher. Ele traz: a marcação, os tokens, os estados, os textos nos três idiomas, o teclado, o nome acessível, as medidas (alvo de 48 px e `ad-clearance`) e uma nota do que muda no JS e nas requisições da página.

5. **Os obrigatórios.** Cada um é um UX-NN, com protótipo.
   1. **O cabeçalho com menu e botão de tema,** em 2 alternativas, no celular e no computador (seções D e E, mudanças 6 e 7):
      - o botão Menu, de 48 px, abre um popover sem JS, pelo mesmo mecanismo do menu de idioma de hoje (veja como ele funciona no código), com as categorias que existem no idioma, Guias e "Apoie a Oli";
      - o botão de tema passa por Sistema, Claro e Escuro, nessa ordem, e o nome acessível diz o estado ("Tema: sistema");
      - os ícones novos (menu, sol, lua e automático) são desenhados na grade de 24 px, com traço de 2 px, em `docs/propostas/ux-v2/icons/`;
      - o script inline do tema, no `<head>`, antes do CSS, está no protótipo como a F11 vai escrever, para a primeira pintura sair sem piscar.
   2. **O hub de guias** (`/guides/`, `/pt/guias/` e `/es/guias/`):
      - os guias de cada idioma, lidos dos registros, por grupo (Imagem, PDF e Dinheiro);
      - um cartão de guia diferente do de ferramenta (fecha o F5b F-12);
      - uma introdução própria;
      - e as entradas: a trilha "Início › Guias › o guia", o link no rodapé, a seção de guias na home, o link na ferramenta que tem guia (no primeiro bloco de conteúdo depois do painel) e a categoria "Guias" na busca.
   3. **A home,** em 2 alternativas, com os anúncios da área `geral` pelo mapa (obrigatório 7).
   4. **A página de ferramenta, do soltar ao resultado,** em 2 alternativas, no comprimir imagem, e a variação de PDF onde o fluxo muda (o juntar, com a lista de arquivos). Ela responde às pendências F4-F7 e-2, f-1 e f-2.
   5. **O card do café e a página de apoio,** com os textos da seção C nos três idiomas: o card no resultado (no 3º uso com sucesso, depois no máximo uma vez a cada 7 dias), a linha do rodapé, o item do menu e a página de apoio (em pt, com o Ko-fi e o Pix). Valem as regras da seção C:
      - sem contagem regressiva, sem culpa e sem bloquear a tela;
      - nenhum texto liga doação a anúncio;
      - nada que imite anúncio ou o Baixar, e nada amarelo;
      - 150 px de qualquer anúncio.
   6. **A parede do bloqueador com a Oli triste** (seção A), num `<dialog>` aberto com `showModal()`:
      - nos dois modos: `bloqueio` (sem fechar) e `aviso` (fecha com botão e com Esc);
      - com os três botões: "Já desativei, recarregar", "Como desativar" e "Usar só desta vez";
      - o painel "Como desativar" traz os passos para uBlock Origin, AdBlock e Adblock Plus, AdGuard, Brave, Safari e Firefox no modo estrito, conferidos na ajuda pública de cada um, com o endereço;
      - o estado depois do "Usar só desta vez", já sem esse botão;
      - a variante da UE, do Reino Unido e da Suíça, que é sempre aviso;
      - os textos da seção A nos três idiomas, e o movimento reduzido;
      - nada amarelo, nada que imite um anúncio ou a mensagem do Google, nenhum texto que peça clique.
   7. **O mapa de anúncios de cada molde** (seção B): home, hub de categoria, hub de guias, ferramenta (imagem, PDF e QR), calculadora e guia, a 360×740 e a 1280×800. Ele mostra cada unidade (conteúdo, lateral e multiplex) e a área, lista as páginas livres e traz a densidade (decisão 10).
   8. **A pose `sad`** (decisão 11) e qualquer pose nova que você propuser, numa folha como a `docs/oli/folha.html`.
   9. **As pendências** (decisão 6).

6. **As pendências de design e acessibilidade** (obrigatório 9).
   - São 36 linhas: os 12 itens do grupo 5, os 16 do grupo 6, e F3 d-02, F7 e-1, F4-F7 e-2, F4-F7 f-1, F4-F7 f-2, ajuste-aviso-espaco, F7 f-10 e F4 ACE-7. Reconfira cada uma no código antes, como manda o "Como ler": uma reescrita pode tê-la resolvido.
   - Cada uma ganha uma linha numa tabela do README, com:
     - o id;
     - o estado: aberta, já resolvida no código ou mudou;
     - o destino: corrigir, aceitar e registrar, ou descartar;
     - a proposta, ou, quando a pendência já traz saídas, a escolha entre elas, com a recomendada;
     - o UX-NN que responde a ela, quando a correção muda o que se vê (e aí aponta o protótipo); quando muda só o comportamento, o teste que a F13 escreveria;
     - e a run.
   - O `docs/PENDENCIAS.md` não muda nesta run. A F13 tira as que o Victor escolher.

7. **A lista "para avaliar",** sem obrigação de propor. Cada item entra no README como "proposto" (vira um UX-NN, com evidência, protótipo e custo) ou "descartado", com o porquê:
   - passar o resultado direto para a próxima ferramenta sem baixar, reusando a caixa do compartilhar da F8;
   - "suas ferramentas recentes" e "a Oli já economizou X MB para você", guardados só no navegador, com o que a Privacidade passa a dizer;
   - soltar o arquivo em qualquer lugar da página, e o que acontece quando ele cai em cima de um anúncio;
   - uma cena de fundo do mar por categoria nos hubs, em SVG leve. Hoje o design system proíbe imagem de fundo ("Mar" e "Nunca"): proposta assim é mudança de regra, e o README a apresenta como tal;
   - "mar à noite" no tema escuro, com as cores novas e o contraste;
   - microanimação da Oli por estado, com laço de até 5 s, que fecha o d-02: WCAG 2.2.2, só `transform` e `opacity`, e nada com o movimento reduzido;
   - cenário salvo nas calculadoras: nada digitado vai para o `?` da URL nem para evento do GA4.

8. **O README, o index e o ESCOLHAS.**
   - **O `README.md`,** nesta ordem:
     1. como abrir;
     2. o resumo;
     3. o diagnóstico (os D-NN por tarefa e a tabela das medidas);
     4. "O que os outros fazem";
     5. os itens UX-NN;
     6. a tabela das pendências;
     7. a lista "para avaliar";
     8. o mapa de anúncios, com a tabela da densidade;
     9. a tabela do contraste;
     10. as suposições.
   - **Cada UX-NN tem estes rótulos:**
     - **Origem:** obrigatório N da ficha, diagnóstico, pendência ou "para avaliar".
     - **Problema.**
     - **Evidência:** um D-NN, uma captura, um número ou uma heurística.
     - **Proposta,** com as alternativas.
     - **Oli:** o papel dela na peça, ou "nenhum", com o porquê.
     - **Custo:** P (cabe numa parte de uma run), M (uma run curta ou um bloco de fase, com teste novo) ou G (meia fase ou mais, ou um molde inteiro).
     - **Riscos:** orçamento (JS, requisições, CLS e Lighthouse), anúncio e acessibilidade.
     - **Protótipo:** o caminho.
     - **Recomendação.**
     - **Run:** F11, F12 ou F13.
   - **O `index.html`** é a página de entrada: cada protótipo, nos dois temas, com o link para o item do README.
   - **O `ESCOLHAS.md`:**
     - no topo: "Copie este arquivo para `.cache/ESCOLHAS-marcado.md` e marque lá. O arquivo do Git fica limpo";
     - os itens agrupados pela run que os constrói (F11, F12 e F13);
     - cada item com o id, o título, as alternativas como caixas de marcar (`- [ ]`), a recomendada com "(recomendado)" e uma linha do porquê, e o custo;
     - as pendências com o destino recomendado;
     - o grupo da F13 na ordem de prioridade que você recomenda, porque a F13 constrói na ordem da lista.

9. **"Mais único" é julgamento, então diga o critério.** Cada alternativa diz o que a torna do FileOrca e de mais ninguém: a Oli, o mar, a água, o traço, a dobra e o lábio. A segunda alternativa de cada par é de fato diferente, não uma variação de cor.

10. **A densidade** (obrigatório 7).
    - **A fórmula da seção B:** a soma da altura das caixas de anúncio na coluna principal, dividida pela altura do `<main>`, a 360×740. Confira na metodologia da Coalition for Better Ads, que a seção B cita, se e como a âncora entra, e use a leitura mais conservadora.
    - **As alturas:** a reservada pelo AdSlot de hoje no conteúdo (280 px) e, no multiplex, a altura que o AdSense documenta para o `autorelaxed` a 360 px. Confira na ajuda. Sem número publicado, use a maior medida razoável e registre.
    - **Como medir:** um script, `.cache/f10/densidade.mjs`, abre a 360×740 toda página de cada molde nos três idiomas, no `dist/`. O hub de guias, que ainda não existe, entra pelo protótipo. O script põe as caixas onde o mapa manda e confere as regras:
      - o 1º anúncio depois da peça que o mapa diz, e nunca na primeira tela da home;
      - pelo menos 1.110 px entre dois anúncios do conteúdo;
      - o multiplex no fim;
      - 150 px de Baixar, campos, menus, painel, Oli, card do café e grade de cards;
      - nada acima da ferramenta.

      Depois mede e grava o resultado em JSON.
    - **A tabela por molde:** as páginas medidas, a densidade máxima e a mediana, a página da máxima, quantos anúncios por página e a menor distância entre anúncios e até cada peça. Um molde acima de 30 % muda o mapa até caber.

11. **A pose `sad`.**
    - Feita com as peças do sprite (as do `docs/oli/folha.html` e do `src/oli/sprite.ts`). O `<symbol>` dela tem até 4.096 bytes, medido como o `src/oli/sprite.ts` o montaria: um script em `.cache/f10/` pode importar a função dele, sem mudá-la. O arquivo avulso segue os de `docs/design/assets/Oli/`: 128×128, com as cores fixas do README das poses.
    - Triste, sem culpa e sem pedir clique (seção A e mudança 12), olhando para a esquerda, para o conteúdo, e legível de 32 px para cima.
    - Em `docs/propostas/ux-v2/oli/`: o `oli-sad.svg` e o `folha.html`, com a pose sozinha e ao lado das nove, nos dois fundos, em 32, 64 e 128 px, e dentro da parede.
    - Em `docs/relatorios/fase-10/oli/`: o PNG de 512 px no fundo claro e no escuro, para a busca reversa que o Victor faz.
    - Uma pose nova além da `sad` só entra se o diagnóstico pedir, como proposta, no mesmo formato.

12. **O contraste.** Todo par de cor novo (texto sobre fundo, ícone sobre fundo, borda de controle sobre fundo) tem o contraste da WCAG calculado nos dois temas por um script (`.cache/f10/contraste.mjs`, com a fórmula da WCAG 2.2). Texto: 4,5:1, ou 3:1 se for grande. Componente e ícone que carrega sentido: 3:1. A tabela vai no README. Par reprovado não entra.

13. **As imagens.**
    - Escala 1. JPEG de qualidade 80 para página inteira, PNG para recorte.
    - Cada imagem com até 500 KB, e o total novo em `docs/relatorios/fase-10/` até 25 MB. O script de verificação mede.
    - Nomes em inglês, com a tarefa, o idioma, o tamanho, o tema e o estado (por exemplo, `compress-image-pt-360-dark-result.jpg`).

14. **O que iria para outros arquivos.** O critério 1 limita o diff, então:
    - as pegadinhas novas vão para uma seção "Para o docs/claude/" do relatório, com o arquivo do tema e o texto pronto;
    - o que seria pendência vai para uma seção "Para o PENDENCIAS" do relatório.

    A próxima run copia as duas.

15. **As verificações,** scripts em `.cache/f10/`, em `.mjs`, fora do Git:
    - `diff.mjs`: depois de um `git fetch`, todo arquivo do `git diff --name-only origin/main...HEAD` está nos caminhos permitidos (o escopo). Os três pontos comparam com a base comum, então o que um `git merge origin/main` traz da main não conta;
    - `readme.mjs`: cada UX-NN tem todos os rótulos da decisão 8; todo link e todo caminho do README, do `index.html` e do `ESCOLHAS.md` existe; os obrigatórios 1 a 8 estão lá, com as alternativas; a tabela das pendências tem as 36 linhas; a lista "para avaliar" tem os 7 itens; e o `ESCOLHAS.md` tem cada UX-NN e cada pendência, cada um com a recomendação;
    - `prototipos.mjs`: cada protótipo, no Chromium e no WebKit, claro e escuro, a 360×740 e a 1280×800:
      - zero `console.error` e zero `pageerror`;
      - zero violação do axe, com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa`;
      - zero requisição para fora do repositório;
      - e, no Chromium, a mesma página aberta por `file://`, sem erro.

      O mesmo script grava as screenshots de `docs/relatorios/fase-10/prototipos/`, no Chromium, nos dois temas e nos dois tamanhos;
    - `contraste.mjs` e `densidade.mjs` (decisões 10 e 12);
    - `imagens.mjs`: o tamanho de cada imagem e o total.

    Cada script sai com código diferente de zero quando reprova. As saídas vão para o relatório.

16. **A PR e o CI.**
    - A PR abre em rascunho logo depois do primeiro push, e cada push roda o job leve. Não use o rótulo `ci`.
    - **No fim,** com tudo commitado (o relatório, a revisão e as imagens): faça o push, espere a execução leve terminar verde e só então rode o `gh pr ready`. Assim nenhum `ci-ok` vermelho de uma leve cancelada fica no commit (pendência "F9 ci-ok duplicado"). O `gh pr ready` dispara a classe `portões`, e o `merge` mescla sozinho. Acompanhe essa execução até o fim.
    - Depois do `gh pr ready`, nada de push. O `pnpm ci:custo` da execução final vai na descrição da PR (`gh pr edit <n> --body-file <arquivo>`), mesmo depois do merge.

# Armadilhas conhecidas

- **`file://` no Chromium bloqueia `type="module"` e `fetch`.** Por isso o script dos protótipos é inline e clássico (decisão 4). Teste por `file://` também, não só por http.
- **O `bundle.css` do `docs/design/` é a referência, não o CSS do site,** e os dois podem diferir em detalhe. O protótipo mostra a proposta sobre o design system; o que depende da página real (a dobra, o CLS, a distância de um anúncio) se mede no `dist/`.
- **A trilha e o aviso de cookies usam a face `Figtree Steady`** (`docs/claude/design-e-oli.md`, F8). Uma proposta que mexe no cabeçalho, na trilha ou no topo do molde diz o risco de CLS, e a F11 mede.
- **O aviso de cookies só aparece na primeira visita.** Uma captura que grava o `fo-consent` antes de abrir a página não o vê. Por isso a matriz tem as duas visitas.
- **O fileorca.com só com os domínios do Google abortados** (`google`, `googletagmanager`, `google-analytics`, `doubleclick`, `gstatic` e `googlesyndication`), para a visita não entrar no GA4. Na prévia (`*.workers.dev`), o `gtag.js` nem carrega.
- **O `dist/` local não tem anúncio,** porque não tem os IDs. Os AdSlots de hoje estão no build `all` do `gate:prontidao`, em `.cache/prontidao/`. Se ele não existir, rode o `pnpm gate:prontidao` uma vez.
- **O `serve-dist` devolve o 404 mais próximo** para rota que falta. Confira o status 200 antes de medir uma página.
- **O WebKit do Windows trava no `page.goto` com a máquina carregada.** Rode as capturas com no máximo dois navegadores ao mesmo tempo. Antes de achar que algo está errado, rode de novo com a máquina livre.
- **Portas:** cada worktree usa o próprio `FO_PORT`, de 4174 a 4189. O `fetch` do Node recusa algumas portas fora disso (a 4190 dá "bad port").
- **O Git Bash:** heredoc e `node -e` com crase, barra invertida ou apóstrofo estragam o texto, e argumento que começa com "/" vira caminho do Windows (`MSYS_NO_PATHCONV=1`). Escreva arquivo pela ferramenta de escrita. O `git push` e o `gh pr create --base main` vão em comandos separados.
- **Nunca `git add -A` nem `git add .`:** a pasta `Claude outputs/` está na raiz, sem rastreio, e nunca entra. Adicione por caminho.
- **Os agentes em worktree nascem da `main`.** O primeiro passo de cada um é `git merge --ff-only fase-10`. Todo commit de merge leva o trailer `Co-Authored-By`, com a mensagem num arquivo (`git merge --no-ff -F <arquivo>`). Agente que escreve protótipo ou script usa `model: 'opus'`.
- **Um teste do Vitest que reprove por causa de um arquivo novo em `docs/`:** corrija o arquivo, nunca o teste (`tests/` está fora).
- **O `docs/oli/folha.html` é gerado.** Copie a estrutura dele para a folha nova; não o edite e não rode o gerador.
- **Tudo o que você commita fica público:** este prompt, o relatório, a revisão e as imagens. Nenhum dado pessoal, nenhum número absoluto do GA4 e nenhum material dos concorrentes entra no Git.

# Critérios de aceitação (cada um com evidência no relatório)

1. **Só documentação.** O `diff.mjs` passa, e o `git diff --stat origin/main...HEAD -- src tests scripts .github public docs/design docs/oli docs/claude docs/PENDENCIAS.md docs/OPERACAO.md CLAUDE.md package.json pnpm-lock.yaml astro.config.ts` sai vazio. O `ci:custo` da execução final mostra a classe `portões`.
2. **O README e o ESCOLHAS.** O `readme.mjs` passa: todo UX-NN com evidência, protótipo, custo e os outros rótulos; os obrigatórios 1 a 8 presentes (com 2 alternativas no 1, e no 3 e no 4 se a válvula não as cortou); as 36 pendências; os 7 itens "para avaliar"; e cada item e cada pendência no `ESCOLHAS.md`, com a recomendação.
3. **Os protótipos.** O `prototipos.mjs` passa nos dois navegadores, nos dois temas e nos dois tamanhos, e por `file://`.
4. **O contraste.** Todo par novo passa no `contraste.mjs`, com a tabela no README.
5. **A densidade.** Nenhum molde passa de 30 % a 360×740 no `densidade.mjs`, e as regras de distância da decisão 10 passam.
6. **A pose `sad`.** O `<symbol>` tem até 4.096 bytes. O SVG avulso, a folha e os dois PNG existem.
7. **As imagens.** O `imagens.mjs` passa: até 500 KB cada uma e até 25 MB no total.
8. **O pnpm verificar.** O `pnpm verificar --partes` passa na máquina local (regra 2 de toda run), com o resumo de cada parte e a soma no relatório.
9. **A revisão.** O `docs/relatorios/REVISAO-F10.md` não tem achado crítico nem alto aberto.
10. **O CI.** A execução depois do `gh pr ready` termina verde, com o `ci-ok` verde, e o `merge` mescla a PR, ou diz por que não.

# Verificação: rode de verdade

- Rode os scripts da decisão 15 ao fim de cada fatia, leia a saída, corrija a causa e repita até passar. Nunca afrouxe um limite de script para ele passar: o limite é o da ficha.
- O `pnpm verificar --partes` roda uma vez, no último commit, com a máquina livre. Se uma parte falhar, rode a mesma parte no ponto de partida, numa worktree. Se falhar igual, a falha não é desta run: registre num §, ponha no relatório e siga. Se não falhar igual, ache o que esta run mudou e corrija.
- No CI, o rascunho roda leve a cada push. Acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log`.

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md`, o `CLAUDE.md`, `docs/claude/` e `docs/design/`.
3. O `DECISOES.md` e o código.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Por exemplo: qual guia entra no diagnóstico, a altura do multiplex, como a âncora entra na densidade, o que torna cada alternativa única e o destino de cada pendência.

Uma proposta que mude uma "Decisão fechada" do PLANO ou uma regra do design system é apresentada como tal no README, com o que muda e o porquê, e fica para o Victor escolher. Uma mudança de arquitetura vira uma ADR "Proposta" (no README, não em `docs/adr/`, que fica fora do diff) e uma linha em "Para o PENDENCIAS".

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run. Siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- um concorrente bloqueia o robô;
- a ajuda do AdSense não publica a altura do multiplex;
- o fileorca.com fora do ar: o diagnóstico fica no `dist/`;
- sem `.cache/dados-f10/`: só heurística e medida.

Válvula de estouro, se o tempo ou o limite apertar: as segundas alternativas da home e da página de ferramenta (obrigatórios 3 e 4) podem sair, com um § e uma linha em "Para o PENDENCIAS". O resto da ficha não tem válvula.

Nunca corte: os obrigatórios 1, 2, 5, 6, 7 e 8, as verificações da decisão 15 e a revisão adversarial final.

# Git e segurança

- **Começo:**
  - rode `git switch main` e `git pull --ff-only`;
  - o `git status` pode mostrar, sem rastreio, `docs/prompts/prompt-fase-10.md`, `docs/prompts/prompt-fase-10.txt` e a pasta `Claude outputs/`. Se o `PLANO-FILEORCA.md` aparecer modificado (a linha que o Victor acrescenta no topo), deixe-o como está e fora dos commits desta run. Qualquer outra coisa: não mexa, não commite e registre;
  - crie a branch com `git switch -c fase-10`. O primeiro commit leva os dois arquivos do prompt, sem edição;
  - se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-10.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits, `docs:` aqui).
- **A PR em rascunho** abre logo depois do primeiro push: `gh pr create --draft --base main --head fase-10`, num comando separado do push. O título e a descrição vão em português. A descrição diz que a PR só tem documentação e que o merge é do CI.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push, e ela deve ser o site de sempre.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:** o push da branch; na PR dela, `gh pr create`, `gh pr ready` e `gh pr edit` (só a descrição); leitura (`gh run`, `gh pr checks` e `gh api` sem método); e um `gh run rerun` por falha que pareça instável, registrado.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh label`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `wrangler deploy` em qualquer forma.

  O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) as regras desta run, num checklist "requisito → onde vai ficar → que script ou comando prova";
   - (b) o site de hoje: as URLs das seis tarefas em cada idioma, os moldes, o cabeçalho e o menu de idioma, onde cada AdSlot cai hoje (`src/ads/` e o build `all`), o card do café, a Oli e o sprite, o tema no CSS, os eventos do GA4 e os orçamentos;
   - (c) o design system: as regras, os tokens, a lista "Nunca", as peças do sprite da Oli e o que cada componente tocado diz;
   - (d) as 36 pendências, reconferidas no código;
   - (e) a pesquisa: a altura do multiplex e a repetição de unidade na ajuda do AdSense, a metodologia de densidade da Coalition for Better Ads e a âncora, e os passos de cada bloqueador na ajuda pública dele;
   - (f) os concorrentes, em repouso (decisão 3);
   - (g) os dados de `.cache/dados-f10/`, se existirem.
2. **Planejar.** Escreva `docs/relatorios/fase-10-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz: o ponto de partida; a matriz do diagnóstico; os scripts de `.cache/f10/`; os UX-NN previstos; quem faz o quê; a ordem das fatias; e cada critério ligado a um script ou comando.
3. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. os scripts de captura e de medida, a matriz do diagnóstico e os D-NN;
   2. a base dos protótipos: o `proto.css`, o `index.html`, o controle de protótipo, a Oli inline e a caixa do anúncio, com o `prototipos.mjs` verde nela;
   3. os obrigatórios 1, 2, 5, 6 e 8, por agentes `opus` em worktree, um por grupo de arquivos;
   4. o obrigatório 7 e a densidade;
   5. os obrigatórios 3 e 4: as primeiras alternativas, depois as segundas;
   6. o obrigatório 9 e a lista "para avaliar";
   7. o README, o ESCOLHAS, o contraste e as imagens, com todas as verificações verdes.
4. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`), sobre um commit fixo e registrado da branch, numa worktree só de leitura, contra este prompt e o plano. A F10 não muda o site, mas o mapa de anúncios e a parede viram código na F12 sem outra revisão de desenho. Por isso são quatro lentes Sonnet em contexto limpo, uma a mais que as três de uma fase de interface (regra 3):
   - (a) a evidência: cada atrito se reproduz, os números conferem (refaça uma amostra das medidas), a heurística está citada certa, e nada dos concorrentes nem número absoluto do GA4 entrou no Git;
   - (b) o design system, a Oli e a acessibilidade: tokens, lista "Nunca", contraste, axe, teclado, leitor de tela, movimento reduzido, WCAG 2.2.2, alvo de 48 px e a pose `sad`;
   - (c) o anúncio, a parede e o café: o mapa contra a seção B e "O que não muda", a densidade refeita por conta própria, os 150 px, "O que derruba conta" do PLANO, a parede contra a seção A (modos, escape, região e o caso do Googlebot), os textos sem pedido de clique e o café sem culpa;
   - (d) a viabilidade e o contrato: cada proposta cabe na F11, na F12 ou na F13 sem estourar o JS, as requisições, o CLS ou o Lighthouse, sem arquivo JS novo por página e sem dependência; nada contradiz as "Decisões fechadas" ou as "Mudanças no contrato" sem dizer; e os critérios 1 a 7.

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`). Depois, uma segunda passada revisa o diff das correções. Os baixos que sobrarem vão para "Para o PENDENCIAS" do relatório. Tudo fica em `docs/relatorios/REVISAO-F10.md`. Remova a worktree no fim.
5. **Fechar:** o relatório, o `pnpm verificar --partes` e a sequência de fim da decisão 16.

# Relatório final

Escreva `docs/relatorios/fase-10.md` em português, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo, com os cinco achados que mais pesam no diagnóstico e as recomendações principais;
- o que foi medido: a matriz, as tarefas, os idiomas, e se havia dados do GA4 e do Search Console;
- os itens UX-NN numa tabela curta (id, título, origem, custo, run e recomendação), apontando para o README;
- o mapa de anúncios: a tabela da densidade e as suposições (o multiplex e a âncora);
- a pose `sad`: o tamanho do `<symbol>` e onde estão a folha e os PNG;
- a saída real de cada verificação de `.cache/f10/`;
- a saída real do `pnpm verificar --partes`, com o total de cada parte e a soma;
- o custo (regra 5 de toda run): o `pnpm ci:custo` da última execução antes do relatório. O da execução final vai na descrição da PR;
- o resumo da revisão, apontando para o `REVISAO-F10.md`;
- o link da prévia (`https://fase-10-fileorca.vmatusita.workers.dev/`);
- as decisões novas, apontando os §;
- o que a válvula cortou, se cortou;
- "Para o docs/claude/" e "Para o PENDENCIAS" (decisão 14);
- **a lista do que é do Victor, em passos:**
  1. `git pull` e abrir `docs/propostas/ux-v2/index.html` no navegador.
  2. Ler o README, copiar o `ESCOLHAS.md` para `.cache/ESCOLHAS-marcado.md` e marcar lá.
  3. Fazer a busca reversa da pose `sad` no Google Lens com os PNG de `docs/relatorios/fase-10/oli/` (15 min, como na F1b).
  4. Gerar o prompt da F11 com a lista marcada e as seções "Para o docs/claude/" e "Para o PENDENCIAS" deste relatório.

Termine a resposta final com:

- um resumo de cinco linhas em português;
- o link da PR e o estado do CI (mesclada ou esperando, e por quê);
- os quatro passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o README, o `ESCOLHAS.md` e a descrição da PR. Os protótipos falam em inglês, português e espanhol, como o site.

Em inglês: o código dos scripts, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-fase-10.md` e `prompt-fase-10.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run os põe no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 33be71e (a F9) ou mais novo
git status                  # sem rastreio: os dois arquivos do prompt e "Claude outputs\"
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado
claude --version            # o modo auto pede 2.1.83 ou mais
```

Depois:

1. **Os dados do GA4 e do Search Console (opcional, mas recomendado).** Sem eles, o diagnóstico fica só com heurística e medida. Crie a pasta `.cache\dados-f10\` e ponha nela:
   - **do GA4:** uma exploração livre dos últimos 28 dias, com o caminho da página e o nome do evento nas linhas e a contagem de eventos nos valores, exportada em CSV;
   - **do Search Console:** Desempenho → Resultados da pesquisa, últimos 28 dias, Exportar → CSV. Vem um `.zip` com as páginas e as consultas: descompacte-o na pasta.

   A pasta `.cache\` fica fora do Git. Como o repositório é público, a run cita só proporções e ordem, nunca número absoluto.
2. **A F9b antes ou depois:** tanto faz. A F10 não depende dela, e as duas só dividem o `DECISOES.md`, que a run concilia.
3. **A energia:** `powercfg /change standby-timeout-ac 0`, e volte ao normal depois da run.
4. **Os minutos do Actions** não pesam: o repositório é público (§ 338). Nesta run, o rascunho roda só o job leve, e a execução final, só os portões.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-10
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-10.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal docs/propostas/ux-v2/ com o index.html, o README.md e o ESCOLHAS.md, os oito obrigatórios com protótipo, todas as verificações de .cache/f10/ verdes, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F10.md sem achado crítico ou alto aberto e a PR da fase-10 pronta, com o ci-ok verde
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-10` e mande: "continue de onde parou: leia docs/relatorios/fase-10-plano.md, o git log da branch fase-10 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-10.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-10.json
(Get-Content $HOME\run-fase-10.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`:** a run faz muita coisa sem perguntar:

- builda o site e roda o Playwright em várias portas, para as capturas, o axe e a densidade;
- abre o fileorca.com e as páginas dos concorrentes (só lendo);
- lê a ajuda do AdSense, da Coalition for Better Ads e dos bloqueadores de anúncio;
- cria e remove worktrees dos agentes e da revisão;
- faz push da branch, abre a PR em rascunho e a marca como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo (push na main, `gh pr merge`, `gh api` com método, `wrangler deploy`, reset e amend), e o prompt não pede nada disso.

**O tamanho da run.** No CI, é bem menor que a F9. No trabalho visual, é maior:

- umas 200 capturas do diagnóstico em `.cache\` (só as citadas entram no Git);
- uns 20 protótipos, com axe nos dois navegadores;
- as 36 pendências reconferidas no código;
- a revisão em quatro lentes, com céticos;
- o `pnpm verificar --partes` local, de uns 26 min.

Comece com folga no limite semanal do Claude Code. Se apertar, a válvula corta as segundas alternativas da home e da página de ferramenta. O resto nunca sai.

### 3. Acompanhar

- **Não mexa no clone durante a run.** Ela está na branch `fase-10` dessa pasta.
- **A PR aparece cedo, em rascunho.** Cada push dela roda só o job leve (uns 5 min).
- **A prévia** (`https://fase-10-fileorca.vmatusita.workers.dev/`) deve ser o site de sempre: a F10 não muda o site.
- **Não marque a PR como pronta.** O `gh pr ready` é o último passo da run. Depois dele, o CI roda os portões e mescla sozinho.

### 4. Ao voltar

1. **Atualize a main:** `git switch main` e `git pull --ff-only`. Se a PR não foi mesclada, o relatório e a resposta final dizem por quê.
2. **Abra `docs\propostas\ux-v2\index.html`** com um duplo clique. Os protótipos abrem direto do disco, nos dois temas.
3. **Leia o `README.md` da mesma pasta** e marque as escolhas numa cópia, para o arquivo do Git ficar limpo:

   ```powershell
   Copy-Item docs\propostas\ux-v2\ESCOLHAS.md .cache\ESCOLHAS-marcado.md
   code .cache\ESCOLHAS-marcado.md
   ```

4. **A busca reversa da pose `sad`** (15 min, como na F1b): suba os PNG de `docs\relatorios\fase-10\oli\` no Google Lens e confira que ela não se parece com um personagem que já existe.
5. **Leia `docs\relatorios\fase-10.md`** e confira as evidências:
   - a saída de cada verificação de `.cache/f10/`;
   - a tabela da densidade, com nenhum molde acima de 30 %, e as suposições do multiplex e da âncora;
   - o `pnpm verificar --partes` verde;
   - o veredito do `REVISAO-F10.md`.
6. **Gere o prompt da F11** com a skill: a ficha da F11, o SHA da main, a lista marcada e as seções "Para o docs/claude/" e "Para o PENDENCIAS" do relatório da F10.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `33be71e`,** com a F9 mesclada, e a F9b ainda não rodou. A F10 não depende dela.
- **As imagens ficam em `docs/relatorios/fase-10/`, não em `docs/propostas/ux-v2/`.** A ficha põe as screenshots dentro da proposta, mas o checkout esparso do CI (F9) só pula `docs/relatorios/`. Na proposta, cada imagem deixaria todo job do CI mais lento, para sempre. O README e o `index.html` apontam para elas, e a run registra o desvio num §.
- **O critério do diff vale ao pé da letra:** nada em `docs/claude/` nem em `docs/PENDENCIAS.md`. As pegadinhas e as pendências novas vão para duas seções do relatório, e a F11 as copia (está no passo 6 da volta).
- **Os concorrentes são lidos só em repouso:** sem soltar arquivo e sem digitar. Mandar arquivo a qualquer serviço é proibido em toda run. Nada deles entra no Git, porque o repositório é público.
- **Os dados do GA4 e do Search Console** entram no Git só como proporção e ordem.
- **A revisão tem quatro lentes:** as três de uma fase de interface (regra 3) mais uma de anúncio, porque o mapa e a parede viram código na F12 sem outra revisão de desenho.
- **Limites que eu fixei,** porque a ficha não os diz: até 500 KB por imagem e 25 MB no total, e o `<symbol>` da `sad` com até 4.096 bytes (os "4 KB" da ficha). A altura do multiplex e o peso da âncora na densidade ficam para a run pesquisar, na leitura mais conservadora.
- **O guia do diagnóstico** é o mais visto, se você exportar os dados. Sem eles, um guia de arquivo que exista nos três idiomas.
- **O `ESCOLHAS.md` é marcado numa cópia em `.cache\`.** O plano diz para marcar "na sua máquina, sem commit". Com a cópia, um arquivo do Git modificado não atravessa a F11.
- **O merge é automático:** a PR cai na classe `portões`, e o `pode-mesclar` mescla PR só de documentação do dono.
- **O prompt não traz nenhum dado pessoal,** porque ele entra no repositório público.
