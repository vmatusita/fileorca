# Fase 12: monetização, com mais anúncios, a parede do bloqueador e o café

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F12 do FileOrca, a fase "Monetização: mais anúncios, parede do bloqueador e café" do `PLANO-MELHORIAS.md`. Tire o máximo de receita que as regras deixam, sem arriscar a conta do AdSense: anúncio na home e no fim das páginas, a Oli triste para quem bloqueia anúncio e um pedido de café que convence. O desenho já está escolhido: o mapa A (UX-07), a parede como no protótipo com os ajustes 1, 2 e 3 (UX-06), a pose `sad` (UX-08) e o café no mar (UX-05 A).

Ao terminar:

- o build padrão, sem as variáveis, sai sem nenhum anúncio, nenhuma caixa vazia e nada da parede;
- com as variáveis, cada molde põe os anúncios onde o mapa manda:
  - a home e o hub de guias na área nova `geral`;
  - o 1º anúncio da ferramenta depois do "Como usar";
  - os seguintes a 1.110 px ou mais um do outro, só abaixo de 768 px;
  - o multiplex a partir de 768 px e duas laterais a partir de 1280 px;
  - posição sem ID de unidade não aparece;
- o `PUBLIC_ADSENSE_SLOTS` aceita as 37 unidades, uma por posição, e um valor errado para o build;
- com o `PUBLIC_ADBLOCK_WALL` em `aviso` ou `bloqueio`, quem bloqueia anúncio em fileorca.com vê a parede da Oli triste, com o "Usar só desta vez" uma vez por dia, o aviso que fecha na UE, no Reino Unido e na Suíça e a ajuda de nove casos nos três idiomas. O Googlebot, quem está offline e quem só teve o anúncio falhando nunca a veem;
- o café fala "me ajude" nos três idiomas, na linha do ResultCard, na linha do topo do rodapé e na página de apoio. Quem bloqueia anúncio não ganha mais o café no 1º uso;
- as pendências F3 c-04, c-08 e f-06 estão fechadas;
- a Privacidade, o `docs/design/`, o `docs/OPERACAO.md`, o `docs/claude/anuncios.md` e o `docs/PENDENCIAS.md` estão em dia;
- o relatório está em `docs/relatorios/fase-12.md` e a revisão em `docs/relatorios/REVISAO-F12.md`;
- a PR da branch `fase-12` sai pronta, com o CI completo verde, e o CI a mescla sozinho.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está em `e0467c8` (a F11 e o ajuste `ajuste-header-width` mesclados) ou num commit mais novo. Confira com `git log --oneline -5`. Guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

O que mudou desde que o plano foi escrito:

- **A F11 está na main** (§ 382 a § 408):
  - o cabeçalho tem o Menu e o botão de tema, e o "Apoie a Oli" do Menu já manda o `donate_click` com o lugar `menu`;
  - o hub de guias (`/guides/`, `/pt/guias/` e `/es/guias/`) nasceu sem AdSlot, sem `adArea` e sem lateral. A F12 põe os anúncios dele pelo mapa;
  - o GuideCard (`--here`) fecha o "Como usar" de cada ferramenta e calculadora que tem guia, e já é alvo dos 150 px no `ads.spec.ts`.
- **O ajuste da largura do cabeçalho está na main** (§ 409). A partir de 1280 px, o cabeçalho passa por cima da lateral, que começa 150 px abaixo dele (o `padding-top` da `.fo-rail`, em `global.css`). Isso já é a "Lateral 1" do mapa, e a F10 p-5 está fechada.
- **As escolhas do Victor.** A lista `ESCOLHAS.md` marcada está em `.cache/ESCOLHAS-marcado.md`, fora do Git. Ele ficou com a recomendada em tudo. Para a F12 valem:
  - **UX-05 A:** a linha do café dentro do ResultCard, no mar, depois do Baixar, com a frase de confirmação depois do "Não mostrar de novo"; a linha do rodapé no topo do rodapé; a página de apoio com a Oli à direita do título, o vapor que para em 4,8 s e o Pix com o botão de 52 px;
  - **UX-06:** o protótipo com três ajustes:
    - o ajuste 1: o texto da Privacidade que diz o que sai do aparelho;
    - o ajuste 2: o bloqueio por rede é sempre aviso;
    - o ajuste 3: os botões começam com verbo, e "the ads don't show, and nothing comes in" entra no lugar de "Oli gets nothing".

    O ajuste 4 (o valor `close` no evento) não entra;
  - **UX-07 A:** 1.110 px de borda a borda, o conteúdo 2 em diante só abaixo de 768 px, o multiplex a partir de 768 px, 2 laterais a partir de 1280 px e 37 unidades;
  - **UX-08:** a pose `sad` na parede;
  - **UX-04 A** também está marcado. Ele é da F13, mas muda a F12 num ponto: o 1º anúncio da ferramenta vai para depois do "Como usar" (§ 371, e a linha "1º da ferramenta" da tabela "O que muda da seção B");
  - **as decisões avulsas:**
    - o `gate:prontidao` conta as caixas por largura, com as mesmas 150 palavras por caixa (é o ok do Victor que a F10 p-10 pedia);
    - uma unidade por posição: 37;
    - a lateral fica durante o processamento, a 150 px ou mais da coluna (a leitura da § 20);
    - o texto da página de apoio é o da seção C, como está;
    - o card em português leva um botão só, o Pix, e o Ko-fi fica ao lado do Pix na página de apoio;
    - o "recarregar" da parede usa o `fo-btn--brand`, o que muda a regra do README do Button;
    - desligar os gatilhos adicionais da vinheta é do Victor, no painel;
  - **das pendências:** a F3 f-06 sai na F12, junto com a c-04, e o "Copiar código" do Pix vai a 52 px (F10 p-4).

  O resto da lista é da F13: não toque.
- **A busca reversa da `sad` no Google Lens** é do Victor e pode não ter sido feita. Como a parede só aparece quando ele liga a variável, a F12 usa a `sad` (decisão 6), e a busca entra na lista dele, antes de ligar a parede.
- **Não existe build de teste com IDs de anúncio.** Hoje o AdSlot (`src/ads/AdSlot.astro`) desenha a caixa neutra em toda página com área, mesmo sem unidade, e o `ads.spec.ts` mede essas caixas no `dist/` padrão. Com a Mudança 10, o build padrão fica sem caixa. A distância, a densidade e a parede passam a ser medidas num build de teste, que a F12 cria (decisão 2).
- **O CI roda por classe** (F9, `scripts/ci/classificar.ts`):
  - PR em rascunho sem o rótulo `ci` roda o job `leve` (tipos, lint, build e Vitest);
  - PR pronta roda tudo: o build uma vez, os portões, o Playwright em partes e o Lighthouse;
  - depois, o `merge` mescla sozinho a PR do dono que não mexe em `.github/`. Esta PR cai na classe completa.
- **O rótulo `ci` pode não existir** (§ 338, § 401 e F11 p-1). A decisão 14 diz o que fazer.
- **O repositório é público** (§ 338). Tudo o que você commita, a PR, os logs e os artefatos do Actions ficam públicos.
- **A F9b ou outra run pode entrar na main durante esta.** Se a main andar, traga com `git merge origin/main` e confira de novo o `--list` das partes (decisão 11).
- **O próximo § livre do `DECISOES.md` é o 410,** se nada entrou depois do ajuste. Reserve os números no plano e escreva os § na ordem: um § citado antes de ser escrito prende a numeração.

Leia antes de planejar, nesta ordem de autoridade:

1. **Este prompt.** Ele faz o papel da ficha da F12 e vence o resto.
2. **O `PLANO-MELHORIAS.md`:**
   - "Mudanças no contrato" (sobretudo da 8 à 14), o parágrafo "O que não muda", "O que não é viável ou tem limite" e "Regras novas de toda run";
   - a ficha da F12 e o "Depois da F12";
   - as seções A, B e C.
3. **O `PLANO-FILEORCA.md`:** "Decisões fechadas", "Orçamento de desempenho", "Molde da página de ferramenta", "Molde da página de calculadora", "Monetização" inteira (com "O que derruba conta" e "Doações") e "Execução por IA".
4. **O `CLAUDE.md` e, de `docs/claude/`:**
   - o `anuncios.md` inteiro, o `design-e-oli.md`, o `idiomas.md`, o `playwright.md`, o `windows-git-bash.md` e o `service-worker.md`;
   - do `ci.md`, as pegadinhas gerais da F1a e as seções da F9 e da F11.
5. **A proposta da F10** (`docs/propostas/ux-v2/`):
   - no `README.md`, os itens UX-05 a UX-08, a seção 8 (o mapa de anúncios) e a tabela do contraste (seção 9);
   - a área "Especificação" de `ad-map.html`, `wall.html`, `coffee.html` e `support.html`, e a folha `oli/folha.html` com o `oli/oli-sad.svg`;
   - do `DECISOES.md`, as § 351, § 360, § 361, § 362, § 367, § 368, § 369, § 371 e § 381, e o que elas citam.
6. **O `docs/design/`:** o `README.md` (sobretudo "Layout e anúncios", "Oli" e a lista "Nunca"), o `tokens.css`, os README do AdSlot, do Button, da Oli, do ResultCard, do SupportCard, do Footer e do CookieNotice, e o `assets/Oli/README.md`.
7. **Do `docs/PENDENCIAS.md`:** "Como ler", o Resumo, as linhas F3 c-04, c-08 e f-06 e F5a D-12, os grupos 19 e 20 e "Já corrigidos depois da revisão".
8. **O `DECISOES.md`, só buscando o §** (são 700 KB, nunca inteiro). Comece pelas § 3, § 9, § 20, § 49, § 95, § 101, § 103, § 106, § 306, § 307, § 338, § 341, § 351, § 360, § 361, § 362, § 368, § 369, § 371, § 372, § 388, § 401, § 404 e § 409, e siga pelas que você precisar.
9. **O código que a run toca:**
   - os anúncios: `src/ads/config.ts`, `AdSlot.astro` e `AdsenseHead.astro`; o tipo `AdArea` e o `adArea` das rotas em `src/i18n/routes.ts`; cada view e molde que põe um AdSlot ou a `.fo-rail` (os hubs, `HomeView.astro`, `GuidesHubView.astro`, `GuideView.astro`, `FileGuideView.astro`, `ImageToolPage.astro`, `PdfToolPage.astro`, `CalcTool.astro` e a página do QR);
   - a página: `src/layouts/BaseLayout.astro`, `src/styles/global.css` e `components.css`;
   - o consentimento e os eventos: `src/analytics/consent.ts`, `src/components/CookieNotice.astro` e `src/analytics/events.ts`;
   - a Oli: `src/oli/poses.ts`, `src/oli/sprite.ts`, `scripts/lib/design-checks.ts` e `scripts/gates/design.ts`;
   - o café: `src/tools/image/coffee.ts`, a linha do café em `ImagePanel.tsx` e `PdfPanel.tsx`, `src/components/Footer.astro`, `src/components/SupportCard.astro`, as páginas de apoio e `src/platform/pix.ts`;
   - os textos: `src/i18n/<lang>/` (o `common.ts`, o `privacy.ts` e os do café e do apoio);
   - os portões e os testes: `scripts/lib/prontidao.ts`, `scripts/gates/prontidao.ts`, `tests/unit/prontidao.test.ts`, o `playwright.config.ts` e, em `tests/e2e/`, o `ads.spec.ts`, o `coffee.spec.ts`, os `consent*.spec.ts`, o `cookie-footer.spec.ts`, o `events.spec.ts`, o `design.spec.ts`, o `budgets.spec.ts`, o `i18n-budgets.spec.ts`, o `layout-shift.spec.ts`, o `a11y.spec.ts` e o `money-pix.spec.ts`.

# Escopo

Dentro:

1. A configuração, a Mudança 10 e o build de teste (decisão 2).
2. O mapa de anúncios inteiro, com a área `geral`, o multiplex, a lateral 2, a trava de densidade e o `gate:prontidao` por largura (decisões 3 e 4).
3. A parede inteira, com a Privacidade e o evento (decisão 5).
4. A pose `sad` (decisão 6).
5. O café: o card, o rodapé, a página de apoio, o Pix e o fim do gatilho de quem bloqueia (decisão 7).
6. A F3 c-04 e a f-06 (decisão 8).
7. O `docs/design/`, o `docs/OPERACAO.md`, o `docs/claude/anuncios.md` e o `docs/PENDENCIAS.md` (decisões 9 e 13).
8. Os testes, os §, a revisão adversarial e o relatório.

Fora (não toque):

- **O que a política do AdSense proíbe ou o plano tira:**
  - posicionamento automático dentro da página, side rail automático e refresh de anúncio;
  - qualquer texto que peça clique, ou que peça para ver ou tocar num anúncio;
  - o café como forma de tirar a parede, e script do Ko-fi;
  - código de Worker e qualquer chamada à API do AdSense.
- **O resto da proposta:** a página de ferramenta nova (UX-04, menos o lugar do 1º anúncio), a home nova (UX-03), o aviso de cookies compacto (UX-09), a Oli por estado (UX-10), as calculadoras (UX-12), o guia (UX-13) e o resto da lista. As pendências de design e acessibilidade da F13 também ficam, menos a f-06 e o botão do Pix.
- **Componente fora do que as seções A, B e C pedem.** O cabeçalho e o Menu só mudam se o mapa exigir, e a regra dos 150 px vale também para eles.
- **Dependência nova,** inclusive um `pnpm dlx` ou `npx` de pacote fora do lockfile. Arquivo JS novo por página. Cor nova: nenhum token novo.
- **Arquivos fora da run:** `.github/`, o `CLAUDE.md`, os dois PLANOs, `docs/adr/` e `docs/propostas/` (o registro da F10).
- **Código fora da run:** o motor, as contas das calculadoras, o service worker (`src/sw/`) e o resto das ilhas. Nas ilhas, só a linha do café muda.
- **O `pnpm screenshots`,** que apaga e regrava `docs/relatorios/fase-03/componentes/`. O `pnpm design:gerar` só entra para a folha da Oli (decisão 6).
- **Qualquer coisa no Cloudflare, no AdSense, no GA4 ou no Search Console,** e no GitHub fora da PR desta run.
- **Os IDs reais do AdSense** nunca entram no repositório. Os testes usam o `ca-pub-0000000000000000` e IDs de unidade falsos.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 410)

1. **A especificação.**
   - A área "Especificação" de `ad-map.html`, `wall.html`, `coffee.html` e `support.html` é o contrato, junto com as § 351, § 360, § 361, § 368, § 369 e § 371. Ela traz a marcação, as classes, os tokens, os estados, os textos nos três idiomas, o teclado, o nome acessível, as medidas, o esboço do script da parede e o que a F12 testa.
   - Onde ela e este prompt divergem, vale este prompt.
   - Os protótipos estão sobre o `bundle.css` do `docs/design/`, que não é o CSS do site. Construa sobre o `components.css` e o `global.css`, e confira cada medida no `dist/`.
   - O site não importa nada de `docs/propostas/`. O script dos previews (`?modo=`, `?state=`, `?lang=` e `?theme=`) e o controle de protótipo não vão para o site.

2. **A configuração, a Mudança 10 e o build de teste.**
   - **A área `geral`** entra no tipo `AdArea` e é a área da home e do hub de guias.
   - **As unidades:**
     - por área, o `PUBLIC_ADSENSE_SLOTS` aceita `conteudo`, de `conteudo-2` a `conteudo-9`, `lateral`, `lateral-2` e `multiplex`, cada uma com o ID em `^\d{6,}$`;
     - área ou unidade desconhecida, ou ID fora do formato, para o build, como hoje;
     - a posição n do conteúdo usa a unidade `conteudo-n` da área da página;
     - o modelo do JSON das 37 unidades é o do `ad-map.html` ("As unidades e o PUBLIC_ADSENSE_SLOTS").
   - **A variável `PUBLIC_ADBLOCK_WALL`:**
     - `desligado` (o padrão, também sem a variável), `aviso` ou `bloqueio`;
     - valor inválido para o build;
     - ela só vale com o `scriptEnabled` (as três variáveis de hoje).
   - **Sem ID, nada (Mudança 10).** A posição sem unidade não entra no HTML: nem caixa, nem rótulo, nem espaço reservado, nem script de push. O build padrão sai sem nenhuma `.fo-ad`, sem `ins.adsbygoogle` e sem nada da parede.
   - **A grade da página não muda com ou sem anúncio.**
     - A partir de 1280 px, a coluna da lateral continua no lugar, vazia quando não há unidade, para o conteúdo, o cabeçalho e o rodapé ficarem nas mesmas bordas nos dois builds (§ 409).
     - As imagens do relatório mostram, a 1280 px, uma página do build padrão.
   - **O build de teste** é o mesmo código com as variáveis de teste: o `ca-pub-0000000000000000`, IDs falsos nas 37 unidades (o pior caso, com o máximo de caixas) e a parede em `bloqueio`.
     - **Quem faz:** um ajudante só, em `scripts/lib/`, que o `gate:prontidao` também usa nos builds extras dele (hoje `client` e `all`). O resultado fica em `.cache/`, com a chave do commit e das variáveis. Com a árvore suja, ele refaz.
     - **No Playwright:** ele é feito uma vez por processo, só quando roda um spec que o usa, e servido por um segundo servidor, numa porta própria derivada do `FO_PORT`. As outras partes do CI não pagam por ele.
     - **Ele não toca em `.github/`** e não é "o build do site". A regra "o build uma vez por execução" (Mudança 3) fala do `dist/`, e o build de teste é uma fixture, como os builds do `gate:prontidao`. Registre isso num §, com o custo no CI: os segundos a mais em cada parte que o usa, lidos do `ci:custo`. Se o `verificar.test.ts` fixar algo diferente, ele muda no formato da § 341.
     - **Nenhuma parte do CI pode passar de 700 s** por causa dele. Se passar, junte os specs que o usam em menos partes (pelo nome do arquivo). Nunca tire teste.
   - **O que só depende do build** (a variável desligada, o valor inválido e o build padrão) se prova no Vitest e no `gate:prontidao`, que já faz builds extras. Não crie um build de teste por modo: o modo `aviso` também aparece pela região, no mesmo build de teste.

3. **O mapa de anúncios** (UX-07 A e seção B).
   - **O contrato** é a área "Especificação · UX-07" do `ad-map.html` e a seção 8 do README: a tabela molde a molde, onde um anúncio pode entrar (a fronteira de bloco), os formatos, os rótulos, a marcação e a tabela "O que muda da seção B".
   - **O 1º anúncio de cada molde:**
     - home: depois da 1ª seção de cards, com o topo nunca na primeira tela do celular;
     - hubs de categoria: depois da 1ª grade; no hub de dinheiro, depois da grade de crédito;
     - hub de guias: depois da 1ª grade de guias;
     - ferramenta (imagem, PDF e QR): depois do "Como usar", o primeiro bloco de conteúdo depois do painel, a 150 px ou mais do GuideCard que fecha esse bloco;
     - calculadora: depois do painel e antes do cronograma, nunca entre os campos nem dentro do cronograma;
     - guia: no texto, depois da ferramenta embutida, com um parágrafo entre os dois.
   - **Os seguintes:**
     - só abaixo de 768 px;
     - a 1.110 px ou mais um do outro, de borda a borda (da base de um ao topo do outro, com os 150 px de margem dentro);
     - só em fronteira de bloco, e nunca colados em tabela, em todo molde.
   - **A escolha das fronteiras é do build.**
     - A view marca as fronteiras permitidas, em ordem.
     - Um ajudante escolhe, de cima para baixo, a primeira a 1.110 px ou mais da anterior, pela estimativa da altura a 360 px da especificação, com 15 % de folga para errar sempre para menos anúncio.
     - O teste mede a altura de verdade. Se ele reprovar uma página, corrija a estimativa ou a fronteira, nunca o limite.
   - **O multiplex** (`data-ad-format="autorelaxed"`) é o último bloco do `<main>`, só a partir de 768 px, a 150 px ou mais de toda grade de cards, as relacionadas inclusive.
   - **As laterais,** só a partir de 1280 px:
     - a 1ª começa 150 px abaixo do cabeçalho, como já está;
     - a 2ª fica em `position: absolute`, 1.200 px abaixo da 1ª, de borda a borda, só quando cabe e só em página com 600 palavras ou mais no `<main>`;
     - os 1.200 px são um número só para todos os moldes, a home inclusive (fecha a F10 p-18);
     - a home ganha a coluna lateral;
     - nenhuma lateral gruda ao rolar.
   - **O `display: none` por largura.** Antes de escrever a marcação, leia com o WebFetch as páginas `support.google.com/adsense/answer/1354736` e `answer/9183363`. Registre num § o que elas dizem, com citações curtas.
     - Se a exceção para unidade responsiva cobrir, sem dúvida, as unidades `auto` e `autorelaxed`, esconda por CSS, como na marcação da especificação.
     - Se a ajuda não cobrir, não abrir ou deixar dúvida, vale o plano B da especificação: nenhuma unidade escondida por CSS. A caixa da largura certa reserva o espaço no HTML, e o script de push único cria o `<ins>` só nas caixas cuja largura bate no carregamento (`matchMedia`). Girar o aparelho ou mudar a janela depois não cria nem tira anúncio.
     - Na dúvida, o plano B, porque ele é seguro nas duas leituras.
   - **O push é um script inline só, por página,** no lugar dos scripts de cada caixa. Ele empurra uma vez cada unidade que aparece, só em fileorca.com, como hoje. Nenhum refresh.
   - **Os rótulos:** "Advertisements", "Publicidade" e "Anuncios", em toda caixa e no `aria-label` do `<aside>` da lateral. A caixa não recebe foco.
   - **As regras de "O que não muda" valem em todo molde:**
     - 150 px (`ad-clearance`) entre qualquer anúncio e o Baixar, os campos, os menus (abertos e fechados), o painel, a Oli, a linha do café e, no multiplex, a grade de cards;
     - nada acima da ferramenta no celular;
     - nenhum anúncio no painel, no processamento, no cronograma nem nas páginas livres (Privacidade, Termos, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com");
     - só a âncora e a vinheta como formatos automáticos, ligadas no painel, nunca no código.
   - **A lateral durante o processamento** fica, a 150 px ou mais da coluna (§ 20).
   - **O aviso de cookies aberto, na rolagem 0,** fica a 150 px ou mais da 1ª caixa de conteúdo, a 360 × 740 e a 1280 × 800 (F10 p-12 e § 372). Se não ficar, o anúncio desce, nunca o aviso.

4. **O `gate:prontidao` por largura** (fecha a F10 p-10).
   - **A regra continua:** 150 palavras do `<main>` para cada caixa que a página mostra. Ela passa a contar por largura:
     - no celular, as caixas de conteúdo que aparecem abaixo de 768 px;
     - no computador, o conteúdo 1, as laterais e o multiplex.
   - **Um §** diz por que isso não afrouxa a regra (uma tela de texto por anúncio que aparece) e que o Victor deu o ok no `ESCOLHAS.md`.
   - **O `tests/unit/prontidao.test.ts`** ganha um controle negativo em cada largura: uma página com uma caixa a mais do que as palavras deixam reprova. O controle positivo continua.
   - **O portão confere também,** no build `all` (anúncios ligados e parede desligada), que nada da parede entra no HTML.

5. **A parede** (seção A, UX-06 e os ajustes 1, 2 e 3).
   - **O contrato** é a área "Especificação" do `wall.html` e a § 369, com os ajustes abaixo. O esboço do script é um ponto de partida: escreva o de verdade, com testes.
   - **Onde:**
     - em toda página com anúncio, a home e o hub de guias inclusive;
     - só com o `scriptEnabled`, a variável em `aviso` ou `bloqueio` e o `location.hostname` igual a fileorca.com;
     - nunca nas páginas livres;
     - com a variável desligada, nada entra no HTML: nem o diálogo, nem o script, nem a isca, nem a pose.
   - **A detecção, nesta ordem:**
     1. offline (`navigator.onLine` falso): nada é detectado;
     2. o sinal do Google: a tag de recuperação de bloqueio do Privacy & messaging, gerada a partir do `PUBLIC_ADSENSE_CLIENT`, e o `googlefc.getAdBlockerStatus()` no `AD_BLOCK_DATA_READY`. Antes de escrever a tag, leia com o WebFetch o `support.google.com/adsense/answer/11575177` e o `developers.google.com/funding-choices/fc-api-docs`, e registre num § a forma da tag e da API;
     3. o sinal reserva, se o `googlefc` não responder em 4 s: o `adsbygoogle.js` deu `error` (o carregador do `AdsenseHead.astro` ganha um `onerror` de uma linha) e a isca `#fo-bait` foi escondida. Os dois juntos, nunca um só;
     4. um `ins.adsbygoogle[data-ad-status="filled"]` na página encerra a detecção: quem vê anúncio com o Acceptable Ads não é barrado.
   - **O ajuste 2:** o `NETWORK_LEVEL_AD_BLOCKER` abre sempre no modo `aviso`, mesmo com a variável em `bloqueio`. O `EXTENSION_AD_BLOCKER` e o sinal reserva seguem a variável.
   - **Os modos,** com o `<dialog>` aberto por `showModal()`:
     - no `bloqueio`, sem fechar, com as três camadas da § 369 contra o Esc (o `closedby="none"`, o `cancel` com `preventDefault()` e o `close` que reabre);
     - no `aviso`, com o botão de fechar e o Esc (`closedby="closerequest"`).
   - **O escape:**
     - o "Usar só desta vez" libera o site por 30 minutos naquele navegador, uma vez por dia (o dia do aparelho, que vira à meia-noite local);
     - a chave `fo-wall-escape` guarda a hora do escape, sem depender do aviso de cookies (o precedente da § 49). Sem `localStorage`, o escape vale só para a página aberta;
     - depois dos 30 minutos, a parede volta sem o botão até o dia seguinte, com a linha de "volta amanhã";
     - uma página aberta dentro dos 30 minutos fica livre até a próxima navegação.
   - **A região:**
     - na UE, no Reino Unido e na Suíça, sempre `aviso`;
     - ela vem do `__tcfapi` (o `gdprApplies`), e a parede espera o `tcloaded` ou o `useractioncomplete`, para nunca cobrir a mensagem de consentimento;
     - sem `__tcfapi`, vale o fuso do aparelho, com a lista da seção A. Ele é lido só no aparelho e nunca vai para evento, URL ou armazenamento.
   - **A cara:**
     - a pose `sad` à direita do título, olhando para ele, `aria-hidden`;
     - o card do design system sobre o mar: a `water` a 92 % no claro e o `deep` a 92 % no escuro, sem token novo;
     - o "recarregar" com o `fo-btn--brand fo-btn--lg`, o "Ver como desativar" neutro com lábio e o "Usar só desta vez" ghost;
     - nada em `sun`, nada com a cara do AdSlot, nenhum anúncio e nenhum link para fora dentro do diálogo;
     - com a parede aberta, a rolagem trava sem deslocar nada (`scrollbar-gutter: stable`), e a Oli da página some (`visibility`);
     - uma entrada só, de até 480 ms, e nada se mexe com o movimento reduzido.
   - **O teclado:** o foco abre no "recarregar"; o modal nativo prende o foco; ao fechar sem foco anterior, o foco vai ao `<main>` (`tabindex="-1"`).
   - **A ajuda:**
     - o botão com `aria-expanded` abre o painel com as nove entradas em `<details name>`;
     - o rodapé do card, com o recarregar e o escape, fica sempre à vista;
     - os passos marcados "a conferir" na especificação são conferidos com o WebFetch, na ajuda pública de cada produto. O que não der para conferir fica com o texto da especificação e vira uma linha no grupo 21 do `docs/PENDENCIAS.md`, para o Victor;
     - abrir primeiro a entrada do navegador da pessoa é opcional: só se for barato, e sem nada sair do aparelho.
   - **O evento `adblock_wall`,** pelo `foTrack`:
     - o `action` em lista fechada: `shown`, `reload`, `help` e `escape`, com o `help` só ao abrir o painel;
     - o `mode` em lista fechada: `aviso` e `bloqueio`;
     - as listas ficam no `src/analytics/events.ts`. Sem `close`.
   - **A Privacidade** (`src/i18n/<lang>/privacy.ts`), nos três idiomas, leva o texto do ajuste 1, o da "Proposta para o Victor decidir" na área "Privacidade" do `wall.html`. Ele diz:
     - que a verificação usa a ferramenta de recuperação do Google;
     - que o GA4 conta quando o aviso aparece e qual botão foi usado;
     - que o navegador guarda só a hora do "Usar só desta vez" (a chave `fo-wall-escape`).
   - **O JS:** um script inline no fim do `<body>`, só nas páginas com a parede. Nenhum arquivo novo. A tag do Google é de terceiros e só carrega em fileorca.com, com os anúncios e a parede ligados.
   - **O café não tira a parede,** e a parede não fala do café.

6. **A pose `sad`** (UX-08).
   - **O SVG** de `docs/propostas/ux-v2/oli/oli-sad.svg` vai para `docs/design/assets/Oli/oli-sad.svg`, no formato dos outros. O `<symbol>` sai das peças do sprite, sem peça nova e sem cor nova, e as nove poses não mudam de tamanho.
   - **O nome entra na lista fechada,** em todo lugar onde ela mora: `src/oli/poses.ts`, `scripts/lib/design-checks.ts`, `scripts/gates/design.ts`, `tests/unit/design-checks.test.ts` e `tests/e2e/design.spec.ts`.
   - **A documentação:** o `assets/Oli/README.md` e o README da Oli passam a dez poses, com a regra "a `sad` só na parede". A folha sai do `pnpm design:gerar`, e o diff dele só pode trazer a pose nova.
   - **O sprite** só leva a `sad` nas páginas com a parede.
   - **A pose da parede é uma constante só,** para a troca pela `oops` ser uma linha, se a busca reversa do Victor achar algo parecido.

7. **O café** (seção C e UX-05 A).
   - **O contrato** é a área "Especificação" do `coffee.html` (alternativa A) e do `support.html`, e a § 368. Os textos são os da seção C, sem mudar uma vírgula, mais a frase de confirmação nova da especificação.
   - **O card:**
     - a linha fica dentro do ResultCard, no fundo `deep`, depois do Baixar, do Começar de novo e das notas, onde ela já mora (`ImagePanel.tsx` e `PdfPanel.tsx`);
     - um botão neutro: o Ko-fi em inglês e espanhol, pelo `KOFI_URL` da § 3; em português, só o Pix, para `/pt/apoie/#pix`;
     - o ghost "Não mostrar de novo" põe no lugar a confirmação (`role="status"`) e devolve o foco ao Baixar.
   - **Quando:**
     - no 3º uso com sucesso, depois no máximo uma vez a cada 7 dias e nunca depois do "Não mostrar de novo";
     - a contagem só com o Aceitar do aviso (§ 49 e § 101);
     - o gatilho do 1º uso para quem bloqueia anúncio sai, com o `isAdBlocked` (Mudança 11; fecha a F3 c-08).
   - **O rodapé:** a linha do café sobe para o topo do rodapé, com o texto da seção C e 48 px de alvo. Ela fica a 150 px ou mais da âncora (fecha a F10 p-6).
   - **A página de apoio:**
     - o título e o texto da seção C, como estão;
     - a Oli `coffee` à direita do título, olhando para o texto;
     - o vapor para sozinho em até 4,8 s, e nada se mexe com o movimento reduzido;
     - no Pix, o "copia e cola" com o botão de 52 px vem primeiro no celular, e o QR tem 160 px no computador (fecha a F10 p-4 e a parte do Pix da F5a D-12).
   - **As regras de sempre:**
     - a linha não repete o "Done!" da Oli;
     - nenhum texto do café tem exclamação, prazo, contagem de usos ou "click", "clique" e "clic";
     - nenhum texto do card fala de anúncio;
     - o card nunca fica colado num anúncio e não imita anúncio nem o Baixar, e nada é `sun`.
   - **O orçamento:** nenhum arquivo JS novo, e a ilha cresce no máximo 0,5 KB com gzip.

8. **O consentimento** (F3 c-04 e f-06).
   - **A c-04, pela saída A.** Nas regiões negadas por padrão (as do Consent Mode por região, § 9), a escolha feita no aviso próprio reaplica só o `analytics_storage`. Os `ad_*` ficam com a mensagem do Google. Fora dessas regiões, nada muda. Leia as § 9 e § 103 antes.
   - **A f-06:** no `CookieNotice.astro`, o `resize` e o `ResizeObserver` passam a valer também no aviso reaberto pelo "Change my cookie choice".
   - **Os testes,** cada um reprovando sem a mudança: a c-04 no teste do consentimento; a f-06 no `cookie-footer.spec.ts`, reabrindo pelo botão e mudando a largura de 1280 para 320 px em `/es/privacidad/`.

9. **O `docs/design/` e o `docs/OPERACAO.md`.** Cada regra nova tem um §, com o texto de antes e o de depois:
   - **o README do AdSlot:** sem ID, nada; as caixas por largura (ou o plano B); o multiplex; a lateral 2; o push único; os rótulos;
   - **o `docs/design/README.md`:** a seção "Layout e anúncios" com o mapa, a densidade de até 30 % e os 1.110 px;
   - **o README do Button:** o `fo-btn--brand` também no "recarregar" da parede (a mudança de regra que o Victor aceitou);
   - **a Oli:** dez poses, a `sad` só na parede (decisão 6);
   - **a parede,** como componente novo (`docs/design/components/AdblockWall/` ou o nome que o código usar), com o `README.md` e o `preview.html` no formato dos outros e o estilo no `bundle.css`;
   - **o ResultCard, o Footer e o SupportCard:** o café novo;
   - **o `docs/OPERACAO.md`:**
     - o modelo do `PUBLIC_ADSENSE_SLOTS`, com as 37 unidades e o nome de cada uma;
     - o `PUBLIC_ADBLOCK_WALL` e os três valores;
     - o passo a passo do "Depois da F12" do `PLANO-MELHORIAS.md`, com a busca reversa da `sad` antes de ligar a parede e os gatilhos adicionais da vinheta;
     - onde olhar o resultado: o relatório de recuperação do AdSense e o `adblock_wall` no GA4, que é um piso (quem bloqueia anúncio costuma bloquear o GA4 também).

10. **Os textos.**
    - **Onde:** em inglês, português e espanhol, nos arquivos de tradução de cada idioma, com as mesmas chaves e os mesmos `{placeholders}`.
    - **A parede, com o ajuste 3:**
      - o título: "Oli lives on ads" · "A Oli vive dos anúncios" · "Oli vive de los anuncios";
      - o texto: a 1ª e a 3ª frase da seção A, com a 2ª trocada por "With an ad blocker on, the ads don't show, and nothing comes in." · "Com um bloqueador ligado, os anúncios não aparecem e nada entra." · "Con un bloqueador activado, los anuncios no se ven y no entra nada.";
      - o botão principal: "Reload, it's off now" · "Recarregar, já desativei" · "Recargar, ya lo desactivé";
      - a ajuda: "See how to turn it off" · "Ver como desativar" · "Ver cómo desactivarlo";
      - o escape: "Continue just this once" · "Usar só desta vez" · "Seguir solo esta vez";
      - a linha de depois do escape cita o escape com o nome novo;
      - o "Fechar", o título e a dica do painel e os passos, como na especificação.
    - **O café:** os da seção C e a confirmação da especificação.
    - **As conferências:**
      - o glossário (`docs/i18n/pt.md` e `es.md`) ganha os termos novos que o `glossary.test.ts` pedir;
      - o `lint:texto` e o `english-leak.test.ts` passam;
      - um teste com a lista "click", "clique" e "clic", sem diferença de maiúscula, passa em todo texto da parede e do café, nos três idiomas.
    - **A voz:** triste sem culpa; sem "Aviso" ou "Atenção" no título; sem ícone de alerta; sem pedir que a pessoa veja ou toque em anúncio. Números só no formato do idioma.

11. **Os testes.** Cada critério tem o seu, e cada teste novo reprova sem a mudança. Prove com o `dist/` e o build de teste do ponto de partida, nunca com `git checkout -- arquivo` sobre mudança não commitada.
    - **O build padrão,** lido do `dist/` sem renderizar, em toda página: nenhuma `.fo-ad`, nenhum `ins.adsbygoogle`, nenhum script de push, nada da parede (o `#fo-wall`, o `#fo-bait` e o script) e nenhuma `sad` no sprite.
    - **A configuração,** no Vitest: as 37 unidades e a `geral` passam; área, unidade e ID errados, e o `PUBLIC_ADBLOCK_WALL` inválido, reprovam.
    - **O mapa,** no build de teste, em todas as páginas com anúncio dos três idiomas, em blocos de páginas (um teste só para o site inteiro estoura os 60 s no WebKit do CI, § 306):
      - a densidade conservadora da § 351 em até 30 % a 360 × 740: as caixas da coluna principal mais 100 px de âncora, contada uma vez, sobre o `<main>` sem as relacionadas, com a ferramenta em repouso;
      - a mesma densidade a 768 × 1024 e a 812 × 375, nas páginas de maior densidade de cada molde;
      - 1.110 px ou mais entre dois anúncios de conteúdo, de borda a borda;
      - 150 px de cada anúncio até todos os alvos do `ads.spec.ts` de hoje, a linha do café do ResultCard e a do rodapé, os controles e os menus abertos do cabeçalho e, no multiplex, toda grade de cards;
      - nada acima da ferramenta no celular, e o topo do 1º anúncio da home abaixo da primeira tela a 360 × 740;
      - o conteúdo 2 em diante só abaixo de 768 px, o multiplex só a partir de 768 px e as laterais só a partir de 1280 px, com a 2ª a 1.200 px da 1ª e só em página com 600 palavras ou mais;
      - nenhum anúncio e nenhuma parede nas páginas livres;
      - a caixa nunca dentro do painel, do cronograma, da ferramenta embutida, de grade, de tabela ou de lista, e nunca colada em tabela;
      - a linha do café do rodapé a 150 px ou mais da âncora, simulada como a faixa de 100 px no pé da tela, com a página rolada até o fim;
      - na rolagem 0, com o aviso de cookies aberto, a 1ª caixa de conteúdo a 150 px ou mais dele, a 360 × 740 e a 1280 × 800.
    - **O `gate:prontidao` por largura,** com os controles da decisão 4.
    - **A parede,** no build de teste, nos dois navegadores, com o servidor de teste visto como fileorca.com (as armadilhas dizem como):
      - abre com o sinal do Google (`EXTENSION_AD_BLOCKER`), em `bloqueio`;
      - o `NETWORK_LEVEL_AD_BLOCKER` abre em `aviso`, e o `NO_AD_BLOCKER` não abre;
      - abre com o sinal reserva (o `error` e a isca escondida);
      - não abre com só o `error` e a isca visível (o caso do Googlebot), com só a isca escondida, com um anúncio `filled`, offline, nas páginas livres nem fora de fileorca.com;
      - o escape funciona uma vez por dia, por 30 minutos, e a parede volta sem o botão até a meia-noite local, pelo relógio do Playwright;
      - a região: o `__tcfapi` falso com `gdprApplies` dá o aviso, e só depois do `tcloaded`; sem ele, um fuso `Europe/` (o `timezoneId` do contexto) dá o aviso;
      - o foco abre no recarregar, fica preso no diálogo e cai no `<main>` ao fechar;
      - o Esc só fecha no aviso, e no bloqueio nem dois Esc seguidos fecham;
      - o painel tem `aria-expanded`, todo alvo tem 48 px e o axe dá zero nos dois temas;
      - nada em `sun`, nenhum `ins` nem `.fo-ad` dentro do diálogo, e a rolagem travada sem deslocamento;
      - o `adblock_wall` só com valores das listas fechadas, no `events.spec.ts`.
    - **O café:**
      - o 3º uso, os 7 dias e o "Não mostrar de novo" continuam;
      - o 1º uso de quem bloqueia anúncio não mostra mais o café;
      - a confirmação tem `role="status"`, e o foco vai ao Baixar;
      - o card em português tem um botão só, para `/pt/apoie/#pix`;
      - a linha do rodapé fica no topo, com 48 px;
      - o vapor para em até 4,8 s, no teste de movimento do `design.spec.ts`;
      - o "Copiar código" tem 52 px e vem antes do QR no celular;
      - o axe da página de apoio dá zero nos dois temas.
    - **O consentimento:** a c-04 e a f-06 (decisão 8).
    - **A Oli:** a `sad` na lista fechada, com até 4 KB no sprite, e só nas páginas com a parede.
    - **O orçamento e o CLS:**
      - no build padrão, o número de arquivos JS e o de requisições de cada página que o `budgets.spec.ts` e o `i18n-budgets.spec.ts` medem são os do ponto de partida, e a lista dos nomes dos JS de `dist/_astro/`, sem o hash, é a mesma;
      - no build de teste, o JS inicial (gzip, com o inline do push e da parede) fica em até 80 KB nas páginas que os dois specs medem;
      - o `layout-shift.spec.ts` fica verde de 320 a 412 px, no build padrão e no build de teste.
    - **O teste antigo que fixa o que esta run muda.** Exemplos: as caixas no `dist/` padrão, o 1º anúncio depois dos chips, a conta do `gate:prontidao` por caixa do HTML, o café no 1º uso de quem bloqueia, a linha do café no fim do rodapé, as nove poses e os textos antigos do café.
      - Ele muda no mesmo commit que o código que ele protege.
      - Cada um entra num §, no formato da § 341: o que ele protegia e como a proteção continua.
      - Nenhum teste sai, nenhum é pulado e nenhum limite afrouxa. O número de testes do Vitest e o do `--list` do Playwright só crescem; o antes e o depois vão no relatório.
    - **A divisão nas partes:**
      - um spec novo pesado vai num arquivo cujo nome caia numa parte leve;
      - rode o `--list` de cada parte (`docs/claude/playwright.md` e a seção da F9 do `ci.md`);
      - confira que o `design.spec.ts` e o `image-matrix.spec.ts` continuam em partes diferentes.

12. **As imagens do relatório.**
    - **Quais:** até 28 capturas em `docs/relatorios/fase-12/`:
      - a parede no bloqueio, no aviso, com a ajuda aberta e depois do escape, em en e pt, a 360 e a 1280 px, no claro e no escuro (até 12 combinações);
      - o mapa no build de teste: a home, uma ferramenta, uma calculadora e um guia, a 360 e a 1280 px;
      - uma página do build padrão a 1280 px, sem caixa;
      - a linha do café no ResultCard, a confirmação, a linha do rodapé e a página de apoio em pt, com o Pix.
    - **Como:** JPEG de qualidade 80 ou PNG, escala 1, até 300 KB cada uma e 8 MB no total, com nome em inglês. A página inteira do mapa pode ser recortada.
    - **Onde:** nada de imagem fora de `docs/relatorios/`, porque o checkout esparso do CI só pula essa pasta.

13. **O `docs/claude/` e o `docs/PENDENCIAS.md`.**
    - **As pegadinhas novas desta run** vão no fim do arquivo de tema de `docs/claude/` (sobretudo o `anuncios.md`), numa seção "## F12: monetização". O `CLAUDE.md` não muda.
    - **O `docs/PENDENCIAS.md`, no fim:**
      - vão para "Já corrigidos depois da revisão", com o § da F12: a F3 c-04, a c-08 e a f-06; a F10 p-4, a p-6, a p-8 (o Victor escolheu o texto), a p-10, a p-12 e a p-18; e a F11 t-2;
      - a F11 t-3: aceite (vai para "Registrados") ou volte ao ícone check, se a folha mudar, com um §;
      - a linha da F5a D-12 ganha a nota de que o Pix saiu na F12, e o resto fica com a F13;
      - um grupo "21. O que a F12 deixou" recebe o que a run e a revisão deixarem, com os passos "a conferir" da ajuda que não deram para conferir;
      - o Resumo e o Total em dia.

      Nada some sem rastro: o `tests/unit/pendencias.test.ts` procura os ids no arquivo inteiro.

14. **A PR e o CI.**
    - **A PR abre em rascunho** logo depois do primeiro push, e cada push roda o job leve.
    - **Uma conferência no Linux, no meio da run,** depois que o mapa, a parede e o build de teste estiverem na branch. O WebKit e as fontes de lá diferem do Windows (§ 305), e o build de teste no CI é novo. Faça o push, espere a execução leve terminar e rode `gh pr edit <n> --add-label ci`:
      - **se o rótulo existir,** acompanhe a execução completa, leia os logs, corrija o que só falhou lá e tire o rótulo depois (`gh pr edit <n> --remove-label ci`). Com a PR em rascunho, o `merge` não roda;
      - **se não existir,** pule esta conferência e registre num §: a execução final é a conferência no Linux. Nunca use como atalho o `gh pr ready` seguido do `--undo`: o job `merge` decide pelo rascunho do payload do evento, e com o `ci-ok` verde ele tentaria mesclar a PR pela metade (§ 401 e F11 p-1).
    - **No fim,** com tudo commitado (o relatório, a revisão e as imagens):
      1. faça o push e espere a execução leve terminar verde;
      2. só então rode o `gh pr ready`;
      3. acompanhe a execução completa até o fim.

      Se ela falhar: `gh pr ready --undo`, corrija, commite, faça o push, espere a leve e rode o `gh pr ready` de novo. A falha e a correção vão no relatório.
    - **O custo:** o `pnpm ci:custo` da execução final vai na descrição da PR (`gh pr edit <n> --body-file <arquivo>`), mesmo depois do merge.

# Armadilhas conhecidas

- **O site só pede anúncio e só abre a parede em fileorca.com** (`location.hostname`).
  - Um caminho que funciona nos dois navegadores: abrir `https://fileorca.com/...` no teste e responder pelo `context.route`, com os arquivos do build de teste.
  - Responda também, pelo `route`, os domínios do Google: o `adsbygoogle.js` com erro ou com um stub, e a tag de recuperação com um stub que define o `googlefc` com o status de cada caso.
  - Nenhum teste chega ao Google de verdade.
- **O relógio e o fuso:** use o `page.clock` do Playwright para os 30 minutos e a meia-noite, e o `timezoneId` do contexto para a região.
- **O `<dialog>`:**
  - o `closedby` não existe em todo navegador, então as três camadas da § 369 valem;
  - o `CloseWatcher` do Chromium deixa um segundo Esc fechar sem gesto no meio;
  - o modal nativo deixa o resto inerte;
  - o WebKit não dá foco a um botão por clique.
- **A isca** nunca é um `ins.adsbygoogle` e fica fora da tela, sem texto. O bloqueador a esconde pelas listas cosméticas; no teste, esconda-a com CSS injetado.
- **O carregador do AdSense, a medida do mapa e o portão** (as pegadinhas da F10 no `anuncios.md`):
  - a margem de 150 px da `.fo-ad` não colapsa no `gap` da grade do `.fo-main`;
  - o `gate:prontidao` conta hoje toda caixa do HTML, mesmo a escondida;
  - o multiplex tem `floor(758 × 0,6)` = 454 px de `ins` a 1280 px, e 1.666 px no celular, onde não cabe em 30 %;
  - para medir a densidade, grave o `fo-consent`, espere o `#fo-tool-root[data-hydrated="true"]` e meça a ferramenta em repouso;
  - a seção "O que medimos" dos guias de dinheiro não tem `data-content`, só o `h2#measured`.
- **O cabeçalho e os anúncios** (as pegadinhas da F11 e do ajuste, no `anuncios.md`):
  - a folha do Menu precisa terminar 150 px acima do 1º AdSlot;
  - abaixo de 768 px, o 1º AdSlot sobe quando o texto quebra menos, e por isso o bloco do cabeçalho do `ads.spec.ts` mede também 767 px;
  - a partir de 1280 px, só o `padding-top` da `.fo-rail` segura os controles longe da lateral;
  - um menu aberto cobre o alto da lateral, e o `ads.spec.ts` confere o `railTakesPointer`.
- **O café:**
  - a `.fo-result__support a` pinta de branco também o botão da linha;
  - a animação do vapor dentro de um `<use>` mira o elemento do `<symbol>`, e o seletor pendura num ancestral do sprite (`html` ou `body`), nunca numa seção (`design-e-oli.md`).
- **Um build de teste velho mede a coisa errada:** um build em `.cache/` de outro commit ou de outra árvore. A chave do commit e das variáveis, e o refazer com a árvore suja, existem por isso.
- **O `serve-dist` devolve o 404 mais próximo** para rota que falta: confira o status 200 antes de afirmar uma página. Uma página que falta também não tem anúncio, e um teste "sem anúncio" passaria com ela.
- **O CLS e as fontes:**
  - o CLS de texto com a fonte atrasada muda entre Windows e Linux (§ 305);
  - a captura de página inteira faz um relayout com a fonte já carregada: meça antes de qualquer `fullPage`;
  - no WebKit, um hub não pinta enquanto a Figtree está segura.
- **O `boundingBox()`** dá coordenadas da janela, não do documento. O Chromium headless no Windows tem a barra de rolagem clássica, que muda as larguras.
- **As portas:** cada worktree usa o próprio `FO_PORT`, de 4174 a 4189, e o servidor do build de teste usa outra porta derivada dele, sem colidir.
- **O Astro e o TypeScript:**
  - o `build.format` é `preserve`, então toda página é um `.../index.astro`;
  - o tsconfig usa `exactOptionalPropertyTypes`: espalhe um objeto condicional, nunca passe `undefined`;
  - o `pnpm tipos` confere também os specs. Rode-o antes do push.
- **Os moldes e os hubs recebem `lang` com o padrão `'en'`.** Escreva `.map((id) => cardOf(id, lang))`, nunca `.map(cardOf)`.
- **O `lint:texto`:**
  - no português, ele reprova nome de opção depois de vírgula e lê "for" como verbo num nome inglês;
  - ele lê o `{n}` como "n" (F11 g-3, só aviso);
  - os módulos que ele importa usam import estático.
- **Não mexa em `scripts/guides/`,** nem num comentário: o `guides-measured.test.ts` confere o SHA-256 dos scripts de medida.
- **O service worker nos testes:** o padrão é `serviceWorkers: 'block'`. Com ele ligado, o worker responderia do cache o que o `route` espera ver.
- **O Git Bash:**
  - heredoc e `node -e` com crase, barra invertida ou apóstrofo estragam o texto: escreva arquivo pela ferramenta de escrita;
  - argumento que começa com "/" vira caminho do Windows (`MSYS_NO_PATHCONV=1`);
  - o `git push` e o `gh pr create --base main` vão em comandos separados;
  - no Node, `String.replace(a, b)` interpreta `$` em `b`: use `s.replace(a, () => b)`.
- **Nunca `git add -A` nem `git add .`:** a pasta `Claude outputs/` está na raiz, sem rastreio, e nunca entra. Adicione por caminho.
- **Os agentes em worktree:**
  - eles nascem da `main`: o primeiro passo de cada um é `git merge --ff-only fase-12`;
  - todo commit de merge leva o trailer `Co-Authored-By`, com a mensagem num arquivo (`git merge --no-ff -F <arquivo>`);
  - um agente que escreve código usa `model: 'opus'`;
  - um agente em worktree não escreve no checkout principal. Ele lê o `.cache/` do principal pelo caminho absoluto, mas grava no `.cache/` da própria worktree, e o agente principal copia o que precisa antes do `git worktree remove`;
  - dois agentes que acrescentam no mesmo arquivo (os `common.ts`, o `privacy.ts`, o `events.ts`, o `components.css` e o `BaseLayout.astro`) dão conflito no merge: junte as duas partes e rode o `pnpm tipos`.
- **O repositório é público:** nenhum dado pessoal, ID real do AdSense ou segredo no que você commita, nem no prompt, no relatório, na revisão ou nas imagens.

# Critérios de aceitação (cada um com evidência no relatório)

1. **O build padrão.**
   - Nenhuma página do `dist/` tem anúncio, caixa, script de push, parede, isca ou `sad`.
   - Os arquivos JS e as requisições de cada página medida são os do ponto de partida, e a lista dos nomes dos JS de `dist/_astro/` é a mesma.
2. **A configuração.** As 37 unidades, a área `geral` e o `PUBLIC_ADBLOCK_WALL` passam no Vitest, e os valores errados param o build.
3. **O mapa,** no build de teste:
   - a densidade conservadora fica em até 30 % em toda página com anúncio a 360 × 740, e nas páginas medidas a 768 × 1024 e a 812 × 375;
   - há 1.110 px ou mais entre anúncios de conteúdo;
   - cada anúncio fica a 150 px ou mais do Baixar, dos campos, dos menus (com o Menu e o idioma abertos), do painel, da Oli, da linha do café e, no multiplex, da grade de cards;
   - nada fica acima da ferramenta no celular, e o 1º da home fica fora da primeira tela;
   - o 1º da ferramenta vem depois do "Como usar";
   - as 27 páginas livres não têm anúncio;
   - o conteúdo 2 em diante, o multiplex e as laterais só aparecem nas larguras do mapa;
   - o relatório traz a tabela por molde: anúncios por página, densidade máxima e mediana e as menores distâncias.
4. **O `gate:prontidao`** fica verde, contando por largura, com os controles negativos.
5. **A parede.** Todos os casos da decisão 11 passam nos dois navegadores, e a matriz "caso × navegador × resultado" vai no relatório.
6. **A acessibilidade.**
   - O axe dá zero violação nos dois temas e nos dois navegadores na parede (bloqueio, aviso, ajuda aberta e depois do escape), na linha do café e na página de apoio.
   - O teclado segue a especificação, e todo alvo novo tem 48 px ou mais.
   - O vapor para em até 4,8 s, e nada se mexe com o movimento reduzido.
7. **Os textos.** O teste da lista "click", "clique" e "clic", o `lint:texto`, o `english-leak.test.ts` e o `glossary.test.ts` passam.
8. **O café.**
   - Os três lugares têm os textos da seção C.
   - O 1º uso de quem bloqueia anúncio não mostra o café.
   - A confirmação e o foco seguem a especificação, e o card em português tem um botão só.
   - O "Copiar código" tem 52 px, e a ilha cresce no máximo 0,5 KB com gzip.
9. **O consentimento.** Os testes da c-04 e da f-06 passam, e reprovam sem a mudança.
10. **A Privacidade** tem o texto do ajuste 1 nos três idiomas.
11. **O orçamento.** No build de teste, o JS inicial fica em até 80 KB nas páginas medidas, com o tamanho do inline do push e da parede no relatório. O CLS fica em até 0,05 de 320 a 412 px nos dois builds.
12. **O Lighthouse.** O desempenho fica em 90 ou mais (mediana) e o CLS em até 0,05 em toda URL do `lighthouserc.json`.
13. **A documentação.** O `docs/design/`, o `docs/OPERACAO.md`, o `docs/claude/anuncios.md` e o `docs/PENDENCIAS.md` estão como as decisões 9 e 13 pedem, o `pendencias.test.ts` passa, e os § começam no 410.
14. **Os testes.** O número de testes do Vitest e o do `--list` do Playwright só cresceram, e todo teste antigo que mudou tem o seu §.
15. **O `pnpm verificar`.** O `pnpm verificar --partes` passa na máquina local, com o total de cada parte e a soma no relatório. Nenhuma parte passa de 700 s, nem no CI.
16. **A revisão.** O `docs/relatorios/REVISAO-F12.md` não tem achado crítico, alto nem médio aberto.
17. **O CI.** A execução depois do `gh pr ready` termina verde, com o `ci-ok` verde, e o `merge` mescla a PR, ou o relatório diz por que não.

# Verificação: rode de verdade

- **A linha de base, antes de mudar código.** No ponto de partida:
  - rode `pnpm install --frozen-lockfile` e `pnpm build`;
  - rode o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, com a saída em `.cache/f12/antes/`;
  - guarde o número de testes do Vitest e o do `pnpm exec playwright test --list` de cada navegador, e a lista dos JS de `dist/_astro/`;
  - guarde uma cópia desse `dist/` para as provas de "reprova sem a mudança".
- **Em cada fatia:** rode o `pnpm tipos`, o `pnpm lint`, o Vitest, os specs que a fatia toca nos dois navegadores e os portões que ela toca. Leia a saída, corrija a causa e repita até passar.
- **Nunca afrouxe um limite** para um teste passar: o limite é o deste prompt e o do projeto.
- **O `pnpm verificar --partes` roda uma vez,** no último commit, com a máquina livre. Se uma parte falhar:
  - rode a mesma parte no ponto de partida, numa worktree;
  - se falhar igual, a falha não é desta run: registre num §, ponha no relatório e siga;
  - se não falhar igual, ache o que esta run mudou e corrija.
- **No CI:** acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log`.

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. A especificação dos protótipos e as § 351, § 360, § 361, § 368, § 369 e § 371.
3. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md`, o `CLAUDE.md`, `docs/claude/` e `docs/design/`.
4. O `DECISOES.md` e o código.
5. Na dúvida, a opção mais simples, a mais reversível e a mais segura para a conta do AdSense.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: o `display: none` ou o plano B, a forma da tag de recuperação, o ajudante do build de teste e o custo dele, a estimativa de altura das fronteiras, o nome do componente da parede, onde cada teste novo mora e cada teste antigo que mudou.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run. Siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- uma página da ajuda do Google não abre: siga a opção segura (o plano B, e a tag na forma da especificação) e registre;
- o rótulo `ci` não existe: a conferência do meio sai, e a execução final faz o papel dela (decisão 14);
- a main muda as partes no meio da run: traga a main e confira o `--list`;
- o Lighthouse oscila numa URL: rode a parte de novo uma vez e registre; se cair de novo, ache a causa.

Válvula de estouro, se o tempo ou o limite apertar: a lateral 2 e o multiplex podem ir para uma F12b, cada um com um § e uma linha no grupo 21 do `docs/PENDENCIAS.md`. Sem eles, o resto do mapa continua com as mesmas travas.

Nunca corte: a home e o hub de guias com anúncio, a Mudança 10 no build padrão, a trava de densidade, a parede inteira, os textos do café, a c-04, os testes da decisão 11 e a revisão adversarial final.

# Git e segurança

- **Começo:**
  - rode `git switch main` e `git pull --ff-only`;
  - o `git status` pode mostrar, sem rastreio, `docs/prompts/prompt-fase-12.md`, `docs/prompts/prompt-fase-12.txt` e a pasta `Claude outputs/`. Se o `PLANO-FILEORCA.md` aparecer modificado, deixe-o como está e fora dos commits. Qualquer outra coisa: não mexa, não commite e registre;
  - crie a branch com `git switch -c fase-12`. O primeiro commit leva os dois arquivos do prompt, sem edição;
  - se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-12.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits).
- **A PR em rascunho** abre logo depois do primeiro push, num comando separado do push: `gh pr create --draft --base main --head fase-12`. O título e a descrição vão em português, e a descrição diz que o merge é do CI.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push (`https://fase-12-fileorca.vmatusita.workers.dev/`). A prévia é o build padrão: ela não mostra anúncio nem parede.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:**
  - o push da branch;
  - na PR dela, `gh pr create`, `gh pr ready`, `gh pr edit` (só a descrição e o rótulo `ci`) e o `gh pr ready --undo` só depois de uma execução final vermelha (decisão 14);
  - leitura (`gh run`, `gh pr checks`, `gh pr view` e `gh api` sem método);
  - um `gh run rerun` por falha que pareça instável, registrado.
- **Na web, só leitura:** o WebFetch nas páginas de ajuda que este prompt cita e na ajuda pública de cada bloqueador. Nada de formulário, conta ou envio.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh label`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `wrangler deploy` em qualquer forma.

  O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) as regras desta run, num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) os anúncios no código: o AdSlot, o `AdsenseHead`, o `config.ts`, cada view e molde que põe uma caixa ou a lateral, a grade da página, os builds do `gate:prontidao` e como o `ads.spec.ts`, o `budgets.spec.ts` e o `layout-shift.spec.ts` medem hoje;
   - (c) a parede e o consentimento: o `<head>` e o fim do `<body>` do `BaseLayout`, o `consent.ts` (as regiões da § 9), o `CookieNotice.astro`, o `events.ts`, a Privacidade e o sprite da Oli;
   - (d) o café: o `coffee.ts`, a linha nas duas ilhas, o rodapé, o `SupportCard`, as páginas de apoio, o Pix e os specs do café e do Pix;
   - (e) a ajuda do Google, pelo WebFetch: as `answer/1354736`, `answer/9183363`, `answer/11576085` e `answer/11575177` do AdSense e a `fc-api-docs`, com o que cada uma diz sobre o `display: none`, a tag de recuperação e a API, em citações curtas;
   - (f) a especificação dos quatro protótipos, separando o que é contrato do que é só do `bundle.css`, e os testes que fixam o que muda, com a divisão das partes (`--list`).
2. **A linha de base** (seção "Verificação").
3. **Planejar.** Escreva `docs/relatorios/fase-12-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz:
   - o ponto de partida e a linha de base;
   - os § reservados;
   - a escolha do `display: none` ou do plano B, com a fonte;
   - quem faz o quê e a ordem das fatias;
   - cada critério ligado a um teste ou comando.
4. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. o agente principal faz a configuração, a Mudança 10, o ajudante e o servidor do build de teste, o jeito de servir como fileorca.com nos testes e a pose `sad` (decisões 2 e 6). Commit e push;
   2. a partir desse commit, três agentes `opus` trabalham ao mesmo tempo, cada um na sua worktree:
      - M: o mapa, o `gate:prontidao` por largura e os testes do mapa (decisões 3 e 4);
      - P: a parede, a Privacidade, o evento e o consentimento (decisões 5 e 8);
      - C: o café, o rodapé e a página de apoio (decisão 7);
   3. o agente principal junta as três, resolve os conflitos, deixa o `pnpm tipos` verde e faz a conferência no Linux (decisão 14);
   4. o `docs/design/`, o `docs/OPERACAO.md`, os textos que faltarem, os § e o `docs/PENDENCIAS.md` (decisões 9, 10 e 13);
   5. as verificações completas, as tabelas do mapa e do orçamento e as imagens.
5. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`):
   - sobre um commit fixo e registrado da branch, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` e o próprio build de teste;
   - contra este prompt e o plano;
   - cada lente com o próprio `FO_PORT` e escrevendo só no `.cache/lente-<x>/` da worktree.

   A F12 mexe em anúncio, em privacidade e em consentimento: são seis lentes Sonnet em contexto limpo (regra 3):
   - (a) **política e mapa de anúncios:**
     - o mapa molde a molde contra a especificação;
     - a densidade conservadora, os 1.110 px e os 150 px de todo alvo;
     - nada acima da ferramenta, e as páginas livres;
     - os formatos, o push único sem refresh e o `display: none` ou o plano B contra a ajuda do Google;
     - as unidades, o `PUBLIC_ADSENSE_SLOTS` e o `gate:prontidao` por largura;
     - nada que peça clique ou imite anúncio ("O que derruba conta");
   - (b) **a parede:**
     - a ordem da detecção, os dois sinais juntos, o Googlebot, o offline e o anúncio `filled`;
     - os modos e o ajuste 2;
     - o escape: 30 minutos, uma vez por dia, a meia-noite local e o caso sem `localStorage`;
     - a região, as páginas livres, o build padrão e a variável desligada;
     - a mensagem do Google nunca coberta;
   - (c) **privacidade e consentimento:**
     - a c-04 e a f-06;
     - o `fo-wall-escape` como única chave nova, e o fuso só no aparelho;
     - o `adblock_wall` só com listas fechadas, e nada na URL;
     - a Privacidade certa nos três idiomas;
     - a contagem do café só com o Aceitar;
     - nenhum dado pessoal nem ID real no repositório;
   - (d) **design system, acessibilidade e Oli:**
     - os tokens, a lista "Nunca" e nada em `sun`;
     - a parede e o café contra a especificação, e o `fo-btn--brand` registrado;
     - a `sad` na lista fechada e só na parede;
     - o foco, o Esc e a inércia do diálogo;
     - o axe nos dois temas e nos dois navegadores, e os alvos de 48 px;
     - a confirmação do café, o vapor de 4,8 s, o movimento reduzido e as cores forçadas;
   - (e) **desempenho e build:**
     - o build padrão sem nada;
     - os JS e as requisições antes e depois, e o inline do push e da parede dentro dos 80 KB;
     - o CLS nos dois builds e o Lighthouse;
     - o build de teste: a chave, o custo no CI e nenhuma parte acima de 700 s;
     - os portões;
   - (f) **textos e idiomas:**
     - os textos da parede (com o ajuste 3), dos passos e do café nos três idiomas, contra a especificação e a seção C;
     - o glossário, o `lint:texto`, o `english-leak` e a lista "click", "clique" e "clic";
     - a voz (triste sem culpa, sem exclamação no café) e o formato de número de cada idioma.

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada revisa o diff delas. Os baixos que sobrarem vão para o grupo 21 do `docs/PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F12.md`. Remova a worktree no fim.
6. **Fechar:** o relatório, o `pnpm verificar --partes` e a sequência de fim da decisão 14.

# Relatório final

Escreva `docs/relatorios/fase-12.md` em português, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo: o que muda para a pessoa e para a receita, em cinco linhas, dizendo que nada de anúncio nem de parede aparece até o Victor ligar as variáveis;
- o que entrou, por decisão, apontando os arquivos;
- o que a ajuda do Google disse, e a escolha do `display: none` ou do plano B;
- a evidência de cada critério, com a saída real dos comandos e dos specs;
- as tabelas:
  - o mapa por molde: anúncios por página, densidade máxima e mediana a 360 × 740, as medidas a 768 × 1024 e a 812 × 375 e as menores distâncias;
  - a matriz da parede: caso × navegador × resultado;
  - o orçamento: antes e depois, por página, nos dois builds;
- o número de testes do Vitest e do `--list`, antes e depois, e a lista dos testes antigos que mudaram, com o § de cada um;
- a saída real do `pnpm verificar --partes`, com o total de cada parte e a soma;
- o custo (regra 5 de toda run): o `pnpm ci:custo` da última execução antes do relatório, com os segundos que o build de teste soma em cada parte. O da execução final vai na descrição da PR;
- o que a conferência no Linux achou;
- o resumo da revisão, apontando para o `REVISAO-F12.md`;
- as imagens de `docs/relatorios/fase-12/`;
- o link da prévia (`https://fase-12-fileorca.vmatusita.workers.dev/`), lembrando que ela é o build padrão;
- as decisões novas, apontando os §;
- o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. `git pull` e conferir na prévia, ou no fileorca.com depois do deploy: nenhuma caixa vazia, a linha do café no topo do rodapé, a página de apoio nova e, no 3º uso de uma ferramenta, a linha do café no resultado.
  2. Fazer a busca reversa da `sad` no Google Lens (15 min, com os PNG de `docs/relatorios/fase-10/oli/`). Se ela achar algo parecido, pedir uma run curta que troca a pose da parede pela `oops` (uma constante).
  3. Com o AdSense aprovado, seguir o passo a passo do `docs/OPERACAO.md`:
     - criar as 37 unidades e atualizar o `PUBLIC_ADSENSE_SLOTS`;
     - deixar a mensagem de recuperação do Google em Rascunho, sem mostrar a quem usa Acceptable Ads;
     - desligar os gatilhos adicionais da vinheta;
     - pôr o `PUBLIC_ADBLOCK_WALL` em `bloqueio` e usar o Retry no último build da main;
     - testar com o uBlock Origin no computador, com o Brave no Android e com uma VPN da UE;
     - se a parede só aparecer pelo sinal reserva, publicar a mensagem do Google com a inclusão em `/__sem-mensagem/`.
  4. Antes de ligar a parede na UE (lá ela é só aviso), conferir a leitura da ePrivacy sobre a chave do escape (F10 p-9).
  5. Ler os textos em português da parede e do café, e acompanhar por 2 semanas, no GA4, as páginas por sessão e o `adblock_wall` e, no Search Console, os Core Web Vitals.
  6. Gerar o prompt da F13a com a lista marcada e o que a F12 deixou (o grupo 21 do `docs/PENDENCIAS.md`).

Termine a resposta final com:

- um resumo de cinco linhas em português;
- o link da PR e o estado do CI (mesclada ou esperando, e por quê);
- os passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `docs/PENDENCIAS.md`, o `docs/OPERACAO.md`, os README do `docs/design/` e a descrição da PR. O site fala inglês, português e espanhol, nos arquivos de tradução de cada idioma.

Em inglês: o código, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-fase-12.md` e `prompt-fase-12.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run os põe no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # e0467c8 (o ajuste da largura do cabeçalho) ou mais novo
git status                  # sem rastreio: os dois arquivos do prompt e "Claude outputs\"
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado
claude --version            # o modo auto pede 2.1.83 ou mais
Test-Path .cache\ESCOLHAS-marcado.md   # True
```

Depois:

1. **Crie o rótulo `ci`, se ainda não criou (recomendado, 30 s).** No GitHub, abra Issues → Labels → New label, com o nome `ci`. É a F11 p-1. Nesta run ele vale mais que na F11: o build de teste é novo no CI, e com o rótulo a run confere o Linux no meio do caminho. Sem ele, a execução final faz esse papel, e uma falha que só aparece no Linux custa uma volta a mais no fim.
2. **A busca reversa da `sad`:** pode ser antes ou depois da run. A run usa a `sad` de qualquer jeito, e a parede só aparece quando você ligar a variável.
3. **A energia:** `powercfg /change standby-timeout-ac 0`. Volte ao normal depois da run.
4. **O disco:** a run faz o build do site e o build de teste várias vezes, em worktrees. Deixe uns 20 GB livres.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-12
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-12.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal o build padrão sem anúncio nem caixa, o mapa, a parede e o café prontos, os testes da decisão 11 verdes nos dois navegadores, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F12.md sem achado crítico, alto ou médio aberto e a PR da fase-12 pronta, com o ci-ok verde
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-12` e mande: "continue de onde parou: leia docs/relatorios/fase-12-plano.md, o git log da branch fase-12 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-12.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-12.json
(Get-Content $HOME\run-fase-12.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`.** A run faz muita coisa sem perguntar:

- builda o site e o build de teste, e roda o Playwright em várias portas, também em worktrees;
- cria e remove as worktrees dos agentes e da revisão;
- lê a ajuda do AdSense e dos bloqueadores pelo WebFetch, só leitura;
- roda o LanguageTool local e o Lighthouse;
- faz push da branch, abre a PR em rascunho, põe e tira o rótulo `ci` (se ele existir) e marca a PR como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo (push na main, `gh pr merge`, `gh api` com método, `wrangler deploy`, reset e amend), e o prompt não pede nada disso.

**O tamanho da run.** É maior que a F11:

- o mapa entra nas 181 páginas com anúncio, com o build de teste novo e a medida de densidade e distância em todas;
- a parede tem uns 20 casos de teste nos dois navegadores;
- o café muda em três lugares e nas duas ilhas;
- a revisão tem seis lentes, com céticos;
- o `pnpm verificar --partes` local leva uns 30 a 35 min;
- o CI completo roda duas vezes com o rótulo `ci` (a conferência do meio e a final) e uma sem ele.

Comece com folga no limite semanal do Claude Code. Se apertar, a válvula manda só a lateral 2 e o multiplex para uma F12b. O resto nunca sai.

### 3. Acompanhar

- **Não mexa no clone durante a run.** Ela está na branch `fase-12` dessa pasta.
- **A PR aparece cedo, em rascunho.** Cada push dela roda só o job leve (uns 4 min).
- **A prévia** (`https://fase-12-fileorca.vmatusita.workers.dev/`) é o build padrão: ela mostra o café novo e a página sem caixa de anúncio, mas nunca anúncio nem parede. Isso é o esperado. A parede e o mapa aparecem nas imagens do relatório.
- **Não marque a PR como pronta.** O `gh pr ready` é o último passo da run. Depois dele, o CI roda tudo e mescla sozinho.

### 4. Ao voltar

1. **Atualize a main:** `git switch main` e `git pull --ff-only`. Se a PR não foi mesclada, o relatório e a resposta final dizem por quê.
2. **Confira no celular,** na prévia ou no fileorca.com depois do deploy:
   - nenhuma página com caixa de anúncio vazia;
   - a linha do café no topo do rodapé;
   - a página de apoio nova (em pt, o Pix com o botão grande primeiro);
   - no 3º uso de uma ferramenta, a linha do café no resultado e o "Não mostrar de novo".
3. **Leia `docs\relatorios\fase-12.md`** e confira as evidências:
   - a tabela do mapa: nenhuma densidade acima de 30 %;
   - a matriz da parede;
   - o que a ajuda do Google disse sobre o `display: none`;
   - a tabela do orçamento;
   - o `pnpm verificar --partes` verde e o custo do build de teste no CI;
   - os testes antigos que mudaram, cada um com o seu §;
   - o veredito do `REVISAO-F12.md`.
4. **Leia as imagens de `docs\relatorios\fase-12\`,** sobretudo a parede em português.
5. **Faça a busca reversa da `sad`,** se ainda não fez.
6. **Com o AdSense aprovado,** siga o passo a passo do `docs\OPERACAO.md`.
7. **Gere o prompt da F13a** com a skill: a ficha da F13, o SHA da main, a lista marcada (`.cache\ESCOLHAS-marcado.md`) e o que a F12 deixou (o grupo 21 do `docs\PENDENCIAS.md`).

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `e0467c8`,** com a F11 e o ajuste da largura do cabeçalho. O próximo § livre é o 410.
- **Valem as suas escolhas da lista marcada,** todas as recomendadas: UX-05 A, UX-06 com os ajustes 1, 2 e 3 (sem o 4), UX-07 A e UX-08 `sad`, mais as decisões avulsas da F12. O prompt cita só isso, sem dado pessoal, porque ele entra no repositório público.
- **O UX-04 A marcado já move o 1º anúncio da ferramenta** para depois do "Como usar" nesta run, como a § 371 e o mapa dizem. A página de ferramenta nova continua na F13.
- **A busca reversa da `sad` não foi feita.** A run usa a `sad` mesmo assim, porque a parede só aparece quando você liga a variável. A pose fica numa constante só, para a troca pela `oops` ser uma linha.
- **O build de teste é a decisão mais nova do prompt.** Hoje não existe build com IDs de anúncio, e a Mudança 10 tira as caixas do build padrão. Por isso escolhi:
  - ele é feito dentro do Playwright, só nas partes que o usam, e reaproveitado pelo `gate:prontidao`;
  - ele não toca em `.github/`, então o merge continua automático;
  - o custo esperado é o de um build a mais por parte que o usa (o build no CI leva uns 20 s).
- **Sem anúncio, a coluna da lateral continua no lugar a partir de 1280 px,** vazia. Assim o conteúdo, o cabeçalho e o rodapé ficam nas mesmas bordas com e sem anúncio. É a opção mais simples e reversível; recentrar a página seria outra decisão.
- **O `display: none` por largura fica a cargo da ajuda do Google,** que a run lê antes de construir. Na dúvida, vale o plano B (o `<ins>` criado só onde a largura bate), que é seguro nas duas leituras.
- **A distância entre as duas laterais é de 1.200 px em todo molde,** a home inclusive. Isso fecha a F10 p-18.
- **A ilha pode crescer até 0,5 KB com gzip.** A especificação mediu menos de 200 bytes; dei folga para a confirmação nos três idiomas.
- **A revisão tem seis lentes,** pela regra 3: anúncio, parede, privacidade e consentimento, design e acessibilidade, desempenho e textos.
- **O rótulo `ci` pode não existir.** O prompt trata os dois casos, como na F11, e nunca usa o `gh pr ready` seguido do `--undo` como atalho.
- **O merge é automático:** a PR não mexe em `.github/`, e o `pode-mesclar` mescla a PR do dono quando o `ci-ok` fica verde.
