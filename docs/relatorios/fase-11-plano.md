# F11 · Plano: navegação, guias e tema claro e escuro

Este plano é o gabarito da revisão final. A ficha da run é o `docs/prompts/prompt-fase-11.md` (o `.txt` é a mesma ficha); ela vence este plano. O desenho é o que o Victor escolheu na F10: o cabeçalho A, o Menu de papel (UX-01), e o hub de guias A, com o cartão de guia (UX-02). A especificação é a área "Especificação" do `docs/propostas/ux-v2/header-a.html`, do `guides-hub.html` (alternativa A, `?ads=off`) e do `guides-entries.html`, com as § 363 e § 364 (DECISOES § 382).

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `609a868e22f418de060bd66e110018048e03eebc` (a F10 mesclada). Branch `fase-11`, PR [#23](https://github.com/vmatusita/fileorca/pull/23) em rascunho.
- **Linha de base** (medida no ponto de partida, em `.cache/f11/antes/`, fora do Git):
  - `pnpm build`: 208 páginas (en 83, pt 55, es 70), 199 indexáveis;
  - Vitest: 102 arquivos e **1.750 testes**, verdes com o `dist/` do ponto de partida;
  - `pnpm exec playwright test --list`: **1.428 testes por navegador** (Chromium e WebKit), em 44 arquivos. Sem `dist/`, o `--list` dá zero (o `sw-killswitch.spec.ts` lê o `dist/` ao carregar);
  - `budgets.spec.ts` e `i18n-budgets.spec.ts` no Chromium: 334 testes verdes, 180 linhas "JS inicial" (`.cache/f11/antes/budgets.log`). Hubs e home de 3,3 a 4,0 KB e 4 requisições; ferramentas de 21,9 a 38,4 KB e 6 requisições; calculadoras e guias de dinheiro de 51,6 a 51,7 KB;
  - os 66 nomes de JS de `dist/_astro/` (`.cache/f11/antes/astro-js-names.txt`);
  - a cópia do `dist/` em `.cache/f11/dist-antes/` e uma worktree de leitura em `.claude/worktrees/f11-base` (o ponto de partida com o `dist/` dele): é ali que cada teste novo prova que reprova sem a mudança.
- **O rótulo `ci` não existe** (a lista de rótulos do repositório, lida pela API). A conferência do meio cai no ramo "não existe" da decisão 13 (seção 6).

## 2. Os § reservados (DECISOES § 382)

| § | Assunto | Quem |
| --- | --- | --- |
| 382 | O ponto de partida, a especificação e a reserva | principal (feito) |
| 383 | Os blocos da F10 no `docs/claude/` e o grupo 19 do PENDENCIAS | principal (feito) |
| 384 | Os ícones do cabeçalho no design system | principal (feito) |
| 385 | O tema: os três estados, a chave `fo-theme` e os dois scripts inline | agente T |
| 386 | O tema no CSS (o par `data-theme` de toda regra) e as metas | agente T |
| 387 | A Privacidade e o tema | agente T |
| 388 | O cabeçalho com o Menu (ordem, folha, popovers `absolute`, 1280 px, README do Header) | agente T |
| 389 | O mapa de cada rota para a seção do Menu e o `aria-current` | agente T |
| 390 | O "Apoie a Oli" no Menu e o lugar `menu` | agente T |
| 391 | Onde mora cada teste novo do cabeçalho e do tema | agente T |
| 392 | Os testes antigos que o cabeçalho e o tema mudaram (formato da § 341) | agente T |
| 393 | O hub de guias: a rota, os grupos, os textos e o SEO | agente G |
| 394 | A regra do `gate:conteudo` para o hub | agente G |
| 395 | O GuideCard (componente, medida, README e preview) | agente G |
| 396 | As entradas: a trilha, o rodapé, o cartão na ferramenta e na calculadora, as relacionadas | agente G |
| 397 | A busca com Ferramentas e Guias | agente G |
| 398 | A seção de guias na home e o `HOME_GUIDES` | agente G |
| 399 | Onde mora cada teste novo do hub e das entradas | agente G |
| 400 | Os testes antigos que o hub e as entradas mudaram (formato da § 341) | agente G |
| 401 em diante | O merge e o CI, o `docs/design/`, as medidas, a revisão e o fim | principal, na ordem |

## 3. Quem faz o quê, e a ordem

1. **Fatia 1, o agente principal (feita):** os cinco blocos da F10 no `docs/claude/`, o grupo 19 do `docs/PENDENCIAS.md` com o Resumo em dia e o teste que o mantém, os cinco ícones (`menu`, `sun`, `moon`, `theme-system`, `book`) e as § 382 a § 384.
2. **A rota do hub (agente G1, `opus`, em worktree, `FO_PORT=4174`):** o id da rota no `src/i18n/routes.ts`, as três páginas `.../index.astro`, a view do hub com os textos da especificação nos três idiomas, o SEO (título, descrição, canonical, `hreflang` com `x-default`, sitemap, `CollectionPage` e `BreadcrumbList`, imagem OG) e os testes que fixam a lista de rotas. Ela vem antes porque o Menu do cabeçalho leva ao hub: as fatias 3 e 4 partem do commit dela.
3. **Ao mesmo tempo, depois da rota:**
   - **agente T (`opus`, worktree, `FO_PORT=4175`):** o tema, o cabeçalho com o Menu, a Privacidade, o `DONATE_PLACES`, o README do Header e a linha do tema do `docs/design/README.md`, e os testes do cabeçalho e do tema (§ 385 a § 392);
   - **agente G2 (`opus`, worktree, `FO_PORT=4176`):** o GuideCard, o hub com os cartões em grupos, as cinco entradas (trilha, rodapé, cartão na ferramenta e na calculadora, relacionadas, busca e home), o `gate:conteudo` do hub, o `docs/design/components/GuideCard/` e os testes do hub e das entradas (§ 393 a § 400).
4. **O merge, no agente principal:** a branch de T e a de G2 em `fase-11` (`git merge --no-ff -F <arquivo>`, com o trailer), os conflitos dos textos, do CSS, dos testes e do `DECISOES.md` resolvidos (os § de T antes dos de G), o `pnpm tipos` verde. Depois, o push, a execução leve e a conferência no Linux (seção 6).
5. **O agente principal:** o `bundle.css` em dia, o `docs/PENDENCIAS.md` do fim, as pegadinhas em `docs/claude/` ("## F11: navegação, guias e tema"), as medidas (orçamento, altura do cabeçalho), as imagens e o `pnpm verificar --partes`.
6. **A revisão adversarial** (seção 7), as correções e o fim (seção 6).

Regras que valem para os três agentes: o primeiro passo é `git merge --ff-only` da branch de partida; nunca `git add -A` nem `git add .`; commits pequenos em inglês, com o trailer; não mexer em `docs/PENDENCIAS.md`, em `docs/claude/`, no `CLAUDE.md`, nos PLANOs, em `docs/adr/`, em `docs/propostas/`, em `.github/`, em `src/ads/`, em `src/sw/`, em `scripts/guides/`; sem dependência nova; nenhuma cor nova; nada de push. Os agentes em worktree escrevem as próprias notas no `.cache/` da worktree deles.

## 4. As decisões que ligam as fatias

- **A rota:** o id que o G1 escolher (proposta: `guides`), com `/guides/`, `/pt/guias/` e `/es/guias/`, indexável, sem `adArea`. Ela vale para o Menu, o rodapé, a trilha, a busca e a home.
- **O CSS:** o T muda as regras do cabeçalho e do menu de idioma onde elas estão no `components.css`; o G2 acrescenta as dele no fim do arquivo. No `bundle.css` do `docs/design/`, a mesma divisão.
- **Os textos:** os do cabeçalho e do tema no bloco do cabeçalho dos `common.ts`; os do hub, do cartão, do rodapé, da busca e da home onde o G2 escolher, de preferência em arquivo novo por idioma.
- **O idioma no Menu** mantém o `hreflang` e o `lang` (a especificação e o `english-leak.test.ts` pedem); os testes que contam três `a[hreflang]` na página passam a contar os do menu de idioma e os do Menu, cada um com os três pares.
- **O GuideCard** é um link só e nunca leva a classe `fo-tool` (o `gate:prontidao` conta `main a.fo-tool` na home e nos hubs, e o `checkFileGuide` limita a 6 os links das relacionadas).

## 5. Critério → prova

| # | Critério | Prova |
| --- | --- | --- |
| 1 | Toda página leva, pelo cabeçalho, ao hub de guias e a cada hub de categoria do idioma | `tests/e2e/header-links.spec.ts` (o HTML de toda página pelo `request`, em blocos, nos dois navegadores) e `tests/e2e/header-menu.spec.ts` (renderizado, uma página por molde e idioma, a 320, 360 e 1280 px) |
| 2 | O hub responde 200, indexável, no sitemap, `hreflang` e `x-default`, `CollectionPage` e `BreadcrumbList`, OG, cada guia uma vez, sem AdSlot; as 40 trilhas Início › Guias › o guia | `gate:seo`, `gate:links`, `gate:conteudo`; os unitários de rota e de SEO; `tests/e2e/guides-hub.spec.ts`; o teste da trilha das 40 páginas no `dist/` |
| 3 | Rodapé com Guias, GuideCard na ferramenta e na calculadora (contagem igual à dos registros), nenhum guia com ToolCard, busca em dois grupos, a home com a seção | os testes do G2 sobre o `dist/` e o `tests/e2e/guides-search.spec.ts` |
| 4 | O tema: primeira pintura, os três estados, entre páginas e idiomas, recarga, Sistema seguindo o `prefers-color-scheme` e apagando a chave, o nome do botão, o armazenamento bloqueado, nada de requisição nem evento, o offline; o par `data-theme` de todo `prefers-color-scheme` | `tests/e2e/header-theme.spec.ts`, `tests/e2e/header-theme-offline.spec.ts` (`serviceWorkers: 'allow'`, `workerOff`), `tests/unit/theme-pair.test.ts`, o unitário dos scripts inline, e a ordem do `<head>` no `header-links.spec.ts` |
| 5 | Axe zero nos dois temas e navegadores no hub, no Menu aberto e no botão de tema nos três estados; teclado; alvos de 48 px; contraste dos pares novos | `a11y.spec.ts` (o hub entra pelo `ROUTES`), `tests/e2e/header-axe.spec.ts`, o `header-menu.spec.ts`, `tests/unit/contrast.test.ts` |
| 6 | JS e requisições iguais por página, JS inicial com no máximo +1 KB e até 80 KB, os mesmos nomes de JS, o chunk da busca com no máximo +1 KB | `budgets.spec.ts` e `i18n-budgets.spec.ts` (com o hub) contra `.cache/f11/antes/`, a tabela do relatório e a lista dos nomes |
| 7 | 64 px e uma linha de 320 a 1280 px nos três idiomas, com a Figtree segura e solta; CLS de 320 a 412 px com o hub; a 1280 px, 150 px da lateral e o logo na coluna | `header-menu.spec.ts` e `layout-shift.spec.ts` |
| 8 | 150 px de todo anúncio aos controles do cabeçalho e aos menus abertos, a 360 e 1280 px; o `.fo-guidecard` como alvo; `src/ads/` sem mudança | `ads.spec.ts` e `git diff --stat origin/main...HEAD -- src/ads` vazio |
| 9 | Lighthouse ≥ 90 e CLS ≤ 0,05 em toda URL, com o `/guides/` | `lighthouserc.json` e `pnpm lhci` |
| 10 | Os textos | `pnpm lint:texto`, `english-leak.test.ts`, `glossary.test.ts` |
| 11 | A documentação | `pendencias.test.ts`, `claude-md.test.ts`, a leitura do `docs/design/` e dos § |
| 12 | Os testes só crescem, e todo antigo que mudou tem § | o antes (1.750 e 1.428) e o depois no relatório; § 384, § 392 e § 400 |
| 13 | O `pnpm verificar --partes` verde, nenhuma parte acima de 700 s | a saída no relatório |
| 14 | A revisão sem crítico, alto nem médio aberto | `docs/relatorios/REVISAO-F11.md` |
| 15 | A execução depois do `gh pr ready` verde, o `ci-ok` verde e o merge | `gh pr checks 23` e o relatório |

**As partes do CI:** os specs novos têm nomes `header-*` e `guides-*`, que ordenam entre o `events.spec.ts` e o `i18n-budgets.spec.ts` e caem nas partes mais leves (WebKit 7 e 8, Chromium 3, de 128 a 217 s na F9). Depois dos specs, o `--list` de cada parte (`--project=chromium --shard=i/5`, `--project=webkit --shard=i/13`) e a conferência de que o `design.spec.ts` e o `image-matrix.spec.ts` seguem em partes diferentes.

## 6. A PR e o CI (decisão 13)

- Cada push roda o job leve. Depois do merge das fatias: push, a execução leve verde, e `gh pr edit 23 --add-label ci`. Como o rótulo não existe, o comando falha e a conferência do meio sai; a execução final faz o papel dela (um §).
- O `gh pr ready` seguido do `--undo` não serve nesta PR: o `merge` decide pelo `github.event.pull_request.draft` do evento (o `if` do job e o JSON do `pode-mesclar`), e o `ci-ok` só usa o estado de agora para a classe leve. A execução do `ready_for_review`, verde, mesclaria a PR pela metade. Isso vai como pegadinha no `docs/claude/ci.md` e como linha no grupo 20 do PENDENCIAS.
- No fim, com tudo commitado: push, esperar a execução leve verde, `gh pr ready`, acompanhar a completa. Se ela falhar: `gh pr ready --undo`, corrigir, commitar, push, esperar a leve, `gh pr ready` de novo. O `pnpm ci:custo` da execução final vai na descrição da PR.

## 7. A revisão adversarial

Cinco lentes Sonnet em contexto limpo, sobre um commit fixo da branch, numa worktree só de leitura com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`, contra a ficha e este plano. Cada lente tem o seu `FO_PORT` e escreve só no `.cache/lente-<x>/`:

- (a) navegação, rotas e SEO; (b) design system e acessibilidade; (c) tema e desempenho; (d) privacidade e anúncio; (e) textos e idiomas.

Cada achado médio ou acima tem um cético próprio; os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada revisa o diff delas. Os baixos que sobrarem vão para o grupo 20 do PENDENCIAS. Tudo em `docs/relatorios/REVISAO-F11.md`.

## 8. Válvula

Só a seção de guias na home pode ir para a F13, com um § e uma linha no grupo 20. Nunca se cortam o Menu, o hub nos três idiomas, o tema, as outras entradas, o GuideCard nas relacionadas, os testes da decisão 10 e a revisão.
