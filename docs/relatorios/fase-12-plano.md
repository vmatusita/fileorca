# F12 · plano da run: monetização (mais anúncios, parede do bloqueador e café)

O gabarito da revisão final. Fonte de verdade, nesta ordem: a ficha da run (`docs/prompts/prompt-fase-12.md`, que vence o resto), a especificação dos protótipos da F10 (`docs/propostas/ux-v2/ad-map.html`, `wall.html`, `coffee.html`, `support.html`) com as § 351, § 360, § 361, § 368, § 369 e § 371, o `PLANO-MELHORIAS.md` (Mudanças 8 a 14, seções A, B e C), o `PLANO-FILEORCA.md`, o `CLAUDE.md` com `docs/claude/`, o `docs/design/`, o `DECISOES.md` e o código.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `e0467c8` (a F11 e o `ajuste-header-width`). A branch `fase-12` nasce dele; o primeiro commit (`283541d`) só traz os dois arquivos do prompt.
- **Linha de base** (`.cache/f12/antes/`, fora do Git, no `283541d`, que tem o mesmo código do `e0467c8`):
  - `pnpm install --frozen-lockfile` e `pnpm build` verdes;
  - Vitest: **109 arquivos, 1.833 testes**, verdes;
  - `playwright test --list`: **1.563 testes por navegador em 51 arquivos** (3.126 nos dois);
  - `budgets.spec.ts` e `i18n-budgets.spec.ts` no Chromium: **342 verdes** (`budgets.log`);
  - a lista dos 66 JS de `dist/_astro/`, com e sem o hash (`astro-js-files.txt`, `astro-js-names.txt`);
  - a cópia do `dist/` de partida em `.cache/f12/dist-antes/`, para as provas de "reprova sem a mudança".
- **O orçamento por página** (os arquivos JS e as requisições de cada página que os dois specs medem) sai de um script de medida que roda, no fim, contra o `dist-antes` e contra o `dist/` final, com a mesma regra do `tests/e2e/lib/budgets.ts`.

## 2. Os § reservados

O próximo § livre é o **410**. As fatias 2a, 2b e 2c correm em paralelo, então a numeração tem duas etapas:

- **Fatia 1 (o agente principal), números fixos, escritos nesta ordem:**
  - § 410 · O ponto de partida, a linha de base e a numeração dos § da F12;
  - § 411 · A especificação dos protótipos e o prompt (decisão 1);
  - § 412 · A configuração: a área `geral`, as 37 unidades e o `PUBLIC_ADBLOCK_WALL` (decisão 2);
  - § 413 · Sem ID, nada (Mudança 10), e a grade igual nos dois builds (decisão 2);
  - § 414 · O build de teste: o ajudante, a chave, o segundo servidor e o custo (decisão 2);
  - § 415 · A ajuda do Google sobre o `display: none`, e o plano B (decisão 3);
  - § 416 · A tag de recuperação e a API `googlefc` (decisão 5);
  - § 417 · A pose `sad` (decisão 6);
  - § 418 · Os testes antigos que a Mudança 10 e o build de teste mudaram (formato da § 341).
- **Fatias 2a, 2b e 2c (agentes M, P e C):** cada agente escreve os seus § no fim do `DECISOES.md` com um marcador no lugar do número (o prefixo da fase, a letra da frente e a ordem: M1, M2…, P1…, C1…), também nos comentários do código que os citam. Na junção, um script troca os marcadores por números a partir do **419**, na ordem M, P, C, e confere que nenhum marcador sobrou. Assim nenhum número é citado antes de escrito, e não há buraco. Resultado da junção: o mapa do 419 ao 425, a parede e o consentimento do 426 ao 434, e o café do 435 ao 444.
- **Fatias 4 e 5 e a revisão:** números seguintes, na ordem em que forem escritos.

## 3. O `display: none` por largura: o plano B

A leitura da ajuda (`.cache/f12/explore/e-google.md`, § 415):

- a `answer/1354736` proíbe "Hiding ad units at anytime (e.g., `display:none`)", com a exceção "unless you're implementing a responsive ad unit", e o link da exceção leva à seção "Hiding an ad unit" da `answer/9183363`;
- o exemplo da `answer/9183363` esconde uma unidade **de tamanho fixo por largura** e manda apagar as linhas `data-ad-format="auto"` e `data-full-width-responsive="true"`;
- nenhuma das páginas cita `autorelaxed` (multiplex), e nenhuma diz se uma unidade `auto` escondida faz pedido de anúncio.

A exceção não cobre, sem dúvida, as unidades `auto` e `autorelaxed`. Vale o **plano B**:

- nenhuma unidade escondida por CSS: o HTML não tem `<ins>`;
- cada caixa (`div.fo-ad`, com o rótulo) traz a largura em que vale (`data-ad-media`), e o CSS mostra a caixa só nessa largura. A caixa visível reserva o espaço no HTML (sem CLS);
- o script de push único, só em fileorca.com, percorre as caixas no carregamento: a que bate com a largura (`matchMedia`) ganha o `<ins>` e um `push()`, e perde a regra de largura (fica visível em qualquer largura dali em diante); a que não bate sai do DOM. A lateral 2 entra só se a coluna tiver 2.638 px;
- girar o aparelho ou mudar a janela depois não cria nem tira anúncio, e nada é empurrado de novo.

## 4. A arquitetura, peça por peça

### 4.1 Configuração (fatia 1, `src/ads/config.ts`)

- `AdArea` ganha `geral` (`src/i18n/routes.ts`).
- Unidades: `conteudo`, `conteudo-2` a `conteudo-9`, `lateral`, `lateral-2` e `multiplex`, cada uma com o ID em `^\d{6,}$`. Área, unidade ou ID errados param o build.
- `PUBLIC_ADBLOCK_WALL`: `desligado` (padrão, também vazio), `aviso` ou `bloqueio`; outro valor para o build. O modo efetivo é `desligado` sem o `scriptEnabled`.
- A posição n do conteúdo usa `conteudo-n` (`contentUnit(n)`).

### 4.2 Sem ID, nada (fatia 1)

- O `AdSlot` não desenha nada sem unidade: nem caixa, nem rótulo, nem script.
- A grade fica: a página com anúncio mantém a `fo-frame--rail` (a coluna da lateral, vazia), e o `<aside>` só entra quando a lateral tem conteúdo.

### 4.3 O build de teste (fatia 1)

- **Ajudante único:** `scripts/lib/test-build.ts` (`buildVariant(nome, env)`), que o `gate:prontidao` usa nos builds `client` e `all` e que faz o build de teste (`teste`). Saída em `.cache/builds/<nome>/`, com a chave do commit e das variáveis em `.cache/builds/<nome>.key.json`; com a árvore suja (arquivo rastreado mudado, ou arquivo novo fora de `.cache/`, `Claude outputs/`, `docs/prompts/` e `docs/relatorios/`), ele refaz. O registro do bundle é devolvido como no `gate:prontidao`. Uma trava em diretório impede dois processos de construir a mesma variante ao mesmo tempo.
- **As variáveis do build de teste:** `ca-pub-0000000000000000`, IDs falsos nas 37 unidades (o pior caso) e a parede em `bloqueio`.
- **O segundo servidor:** `scripts/serve-test-build.ts`, na porta `FO_PORT + 100` (4273 a 4289), declarado como segundo `webServer` do Playwright. Ele sobe na hora e só constrói quando um spec pede (`/__test-build` no `beforeAll` dos specs que o usam), uma vez por execução do Playwright (`FO_RUN_ID`). As partes do CI sem esses specs pagam só a subida do processo.
- **Visto como fileorca.com:** `tests/e2e/lib/production.ts` abre `https://fileorca.com/…` e responde pelo `context.route` com os arquivos do servidor de teste; os domínios do Google são abortados ou respondidos por stub (o `adsbygoogle.js` com erro ou com stub, a tag de recuperação com o stub do `googlefc`). Nenhum teste chega ao Google.
- **O `serve-dist.ts`** ganha a raiz como opção (`root`, padrão `dist`), sem mudar o que faz hoje.

### 4.4 O mapa (fatia 2a, agente M)

- **A área `geral`** na home e no hub de guias, que ganham a coluna lateral.
- **As fronteiras:** a view marca as fronteiras permitidas, em ordem (um marcador de fronteira no HTML de cada view). Um ajudante de build (`src/ads/flow.ts` ou o nome que o código usar) estima a altura a 360 px dos blocos entre as fronteiras (as linhas de texto vezes 26 px, e as alturas fixas de tabela, grade e painel) e escolhe, de cima para baixo, a primeira fronteira a 1.110 px ou mais da base do anúncio anterior, com 15 % de folga (a estimativa tem de passar de 1.110 × 1,15). O 1º anúncio de cada molde tem lugar fixo (a tabela da § 371 e da decisão 3).
- **O conteúdo 2 em diante** só abaixo de 768 px; o **multiplex** (`autorelaxed`) como último bloco do `<main>`, a partir de 768 px, a 150 px ou mais de toda grade; **as laterais** a partir de 1280 px, a 2ª em `position: absolute`, 1.200 px abaixo da 1ª, só em página com 600 palavras ou mais no `<main>` e só quando a coluna tem 2.638 px.
- **O push:** um script inline só, por página, no lugar dos scripts de cada caixa (o plano B da seção 3).
- **Os rótulos:** `common.adLabel` em toda caixa e no `aria-label` do `<aside>`.
- **O `gate:prontidao` por largura** (decisão 4) e a conferência, no build `all`, de que nada da parede entra no HTML.
- **Os testes do mapa** no build de teste, em blocos de páginas (decisão 11), e o `ads.spec.ts` nas regras de hoje mais as novas.

### 4.5 A parede (fatia 2b, agente P)

- O componente (`src/components/AdblockWall.astro`): o `<dialog id="fo-wall">`, a isca `#fo-bait` e o script inline no fim do `<body>`, só nas páginas com anúncio e só com a variável ligada; a tag de recuperação no `<head>` e o `onerror` de uma linha no carregador (`AdsenseHead.astro`).
- A detecção na ordem da decisão 5, os modos, o ajuste 2, o escape (`fo-wall-escape`), a região (`__tcfapi` e o fuso), a pose numa constante (`WALL_POSE = 'sad'`), o evento `adblock_wall` com as listas fechadas no `events.ts`, a Privacidade do ajuste 1 nos três idiomas.
- O consentimento: a c-04 (saída A) e a f-06.

### 4.6 O café (fatia 2c, agente C)

- A linha do ResultCard nas duas ilhas, com a confirmação (`role="status"`) e o foco no Baixar; em português, um botão só, o Pix.
- O fim do gatilho do 1º uso de quem bloqueia (o `isAdBlocked`, o `adsOn` e o resto saem).
- A linha do topo do rodapé (48 px), a página de apoio (a Oli à direita do título, o vapor que para em 4,8 s, o Pix com o "Copiar código" de 52 px antes do QR no celular e o QR de 160 px no computador).

### 4.7 A pose `sad` (fatia 1)

- `docs/design/assets/Oli/oli-sad.svg`, na lista fechada em todo lugar, o sprite só com ela nas páginas com a parede, a folha pelo `pnpm design:gerar`.

## 5. Quem faz o quê, e a ordem

1. **Fatia 1 (agente principal):** 4.1, 4.2, 4.3 e 4.7, com os testes antigos que elas mudam re-apontados ao build de teste (§ 418). Commit, push e PR em rascunho.
2. **Fatia 2 (três agentes `opus`, cada um na sua worktree, a partir do commit da fatia 1):** M (4.4), P (4.5) e C (4.6). Cada um roda o `pnpm tipos`, o `pnpm lint`, o Vitest e os specs que toca nos dois navegadores, commita na sua branch e devolve o relatório com as pegadinhas novas.
3. **Fatia 3 (agente principal):** junta as três (`git merge --no-ff -F <arquivo>`), resolve os conflitos (`BaseLayout.astro`, `components.css`, os textos e o `DECISOES.md`), renumera os § e deixa o `pnpm tipos` verde. Conferência no Linux (decisão 14).
4. **Fatia 4:** o `docs/design/` (README do AdSlot, `README.md` "Layout e anúncios", Button, Oli, AdblockWall novo, ResultCard, Footer, SupportCard), o `docs/OPERACAO.md`, o `docs/claude/anuncios.md` ("## F12: monetização"), os textos que faltarem, os § e o `docs/PENDENCIAS.md`.
5. **Fatia 5:** as verificações completas, as tabelas do mapa e do orçamento e as imagens.
6. **A revisão adversarial:** seis lentes Sonnet num commit fixo, numa worktree só de leitura; um cético por achado médio ou acima e um para os baixos; as correções num agente `opus` e uma segunda passada.
7. **O fim:** o relatório, o `pnpm verificar --partes` e a sequência da decisão 14.

## 6. Cada critério, o teste ou o comando que o prova

| Critério | Prova |
|---|---|
| 1. O build padrão | Vitest novo que varre o `dist/` (nenhuma `.fo-ad`, `ins.adsbygoogle`, push, `#fo-wall`, `#fo-bait`, script da parede nem `sad`); o script de medida do orçamento contra o `dist-antes`; a lista de `dist/_astro/` sem o hash |
| 2. A configuração | `tests/unit/ads.test.ts` (as 37 unidades, a `geral` e o `PUBLIC_ADBLOCK_WALL`, e os valores errados que param o build) |
| 3. O mapa | Os specs do mapa no build de teste, em blocos, nos dois navegadores; a tabela por molde no relatório |
| 4. O `gate:prontidao` | `pnpm gate:prontidao`; `tests/unit/prontidao.test.ts` com um controle negativo por largura |
| 5. A parede | O spec da parede no build de teste, nos dois navegadores; `events.spec.ts`; a matriz no relatório |
| 6. A acessibilidade | O axe no spec da parede (bloqueio, aviso, ajuda aberta, depois do escape) e nos specs do café e do apoio, nos dois temas e nos dois navegadores; `design.spec.ts` (o vapor) |
| 7. Os textos | O Vitest da lista "click", "clique" e "clic"; `pnpm lint:texto`; `english-leak.test.ts`; `glossary.test.ts` |
| 8. O café | `coffee.spec.ts`, `coffee.test.ts`, `money-pix.spec.ts`; o tamanho gzip da ilha antes e depois |
| 9. O consentimento | `consent.test.ts` (c-04), `cookie-footer.spec.ts` (f-06), cada um reprovando no ponto de partida |
| 10. A Privacidade | Vitest sobre `src/i18n/<lang>/privacy.ts` |
| 11. O orçamento | `budgets.spec.ts` e `i18n-budgets.spec.ts` (build padrão); a medida do JS inicial no build de teste; `layout-shift.spec.ts` nos dois builds |
| 12. O Lighthouse | `pnpm lhci` no `dist/` padrão |
| 13. A documentação | `pendencias.test.ts`, `operacao.test.ts`, `claude-md.test.ts`; os § a partir do 410 |
| 14. Os testes | As contagens antes e depois; os § no formato da § 341 |
| 15. O `verificar` | `pnpm verificar --partes` uma vez, no último commit; `pnpm ci:custo` |
| 16. A revisão | `docs/relatorios/REVISAO-F12.md` |
| 17. O CI | `gh pr checks --watch` depois do `gh pr ready` |

## 7. Riscos e como a run os trata

- **As partes do CI:** o `ci.yml` está fora da run, então um spec novo pesado tem de cair numa parte leve pelo nome do arquivo; o `--list` de cada parte é conferido depois de cada fatia, e o `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes. Nenhuma parte passa de 700 s.
- **O `<dialog>`:** o `closedby` não existe em todo navegador, o `CloseWatcher` do Chromium deixa um 2º Esc fechar e o WebKit não dá foco por clique: as três camadas da § 369 e um teste com dois Esc seguidos.
- **A estimativa de altura:** se o teste reprovar uma página nos 1.110 px, corrige-se a estimativa ou a fronteira, nunca o limite.
- **Um build de teste velho:** a chave do commit e das variáveis, e o refazer com a árvore suja.
- **A válvula:** a lateral 2 e o multiplex podem ir para uma F12b, cada um com um § e uma linha no grupo 21. Nunca se corta: a home e o hub de guias com anúncio, a Mudança 10, a trava de densidade, a parede inteira, os textos do café, a c-04, os testes da decisão 11 e a revisão.
- **Fora da run:** `.github/`, `CLAUDE.md`, os dois PLANOs, `docs/adr/`, `docs/propostas/`, `src/sw/`, o motor, as contas das calculadoras, `scripts/guides/`, o `pnpm screenshots`, dependência nova e cor nova. O diff final é conferido contra esta lista.
