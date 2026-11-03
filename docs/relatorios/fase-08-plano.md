# Plano da F8 · Piloto automático

Plano da run `fase-08`, escrito em 2/nov/2026 depois da exploração (oito leitores Sonnet) e antes da maior parte da implementação. É o gabarito da revisão adversarial final (`REVISAO-F8.md`), junto com a ficha (`docs/prompts/prompt-fase-08.txt`). A main estava em `29afbce` (merge da F7); a branch nasceu em `15fab5b`.

## 1. O que a run entrega

1. A revisão das F4 a F7 no método da F3, com as correções de crítico, alto e médio local (`REVISAO-F4-F7.md`).
2. O `docs/PENDENCIAS.md`, com os baixos e as pendências de todas as revisões e decisões.
3. O `.github/dependabot.yml`, ensaiado numa worktree descartável, com os testes que travariam a PR mensal resolvidos.
4. A regra de merge provada com eventos de exemplo (`fixtures/merge-events/`).
5. O service worker: offline das páginas visitadas, página offline por idioma, desativação de emergência.
6. O compartilhar no Android: `share_target` nos manifests, a página "Abrir com", a caixa de entrada e a entrega à ilha.
7. O alerta de CI vermelho nas PRs do Dependabot e as issues atribuídas ao Victor.
8. A prova do aviso de deploy (já feita: execução 41488759711, issue #16).
9. O `docs/OPERACAO.md` com o teste dele.
10. O CI dividido para caber no alvo de 700 s por parte.

## 2. O service worker

### 2.1 Arquivos

| Arquivo | Papel |
| --- | --- |
| `src/sw/shared.ts` | O que a página e o worker combinam: prefixo dos caches, nome do cache da versão, a caixa de entrada (nome, prefixo das entradas, cabeçalhos, prazo de 1 h, campo do formulário, chave do `sessionStorage`) e o `inboxExpired()`. Não importa nada. |
| `src/sw/logic.ts` | As regras puras: `cacheKey`, `langOfPath`, `offlineOrder`, `neverCached`, `strategyFor`, `isCacheable`, `cachesToDelete`, `warmList`, `isListedPage`, `titleOf`. Importa só o `shared.ts`. |
| `src/sw/main.ts` | Os eventos `install`, `activate`, `fetch` e `message`, e a desativação. Os tipos do worker são declarados no próprio arquivo (o `lib: webworker` brigaria com o DOM). |
| `src/sw/build.ts` | Costura os três arquivos num script clássico: tira os tipos com o `typescript` (já é dependência), remove os `import` relativos e os `export`, e põe tudo numa função depois do `SW_CONFIG`. Recusa qualquer outro `import`/`export`. |
| `src/platform/build-files.ts` | No `astro:build:done`, grava `dist/sw.js` com o commit do `build.txt`, as páginas offline e os arquivos de cada uma (lidos do HTML e do CSS do build), as ações do compartilhar e os caminhos que nunca entram. |
| `src/platform/sw-register.ts` | O script inline do `BaseLayout`: depois do `load`, registra o `/sw.js`; quando o worker ativa, manda a lista de arquivos que a página carregou (`warm`). Nunca espera o `ready` (com `serviceWorkers: 'block'` ele nunca resolve). |
| `src/platform/site.ts` | `SW_ENABLED`, a desativação de emergência. |

Nenhum arquivo JS novo nas páginas: o registro é inline e o `/sw.js` é um arquivo estático dos assets, sem "worker" no nome.

### 2.2 Pedido → estratégia → entra no cache?

| Pedido | Estratégia | Entra no cache? |
| --- | --- | --- |
| Outra origem (Google, anúncio, GA4) | `pass`: sem `respondWith` | Nunca |
| Mesma origem, método diferente de GET (fora o compartilhar) | `pass` | Nunca |
| POST na ação do compartilhar (`/open-with/`, `/pt/abrir-com/`, `/es/abrir-con/`) | `share`: guarda os arquivos na caixa e responde 303 para a mesma página em GET | Só na caixa (`fileorca-inbox`), com chave sintética |
| Pedido com `Range` | `pass` | Nunca (206) |
| `/build.txt`, `/cdn-cgi/*`, `/ads.txt`, `/robots.txt`, `/sitemap*.xml`, `/<chave IndexNow>.txt`, `/sw.js`, `/__fileorca-inbox/*` | `pass` | Nunca |
| Navegação (HTML) | `navigate`: rede primeiro (`fetch(event.request)`, que devolve o `opaqueredirect` do 307 para o navegador seguir); sem rede, a cópia guardada; sem cópia, a página offline do idioma do caminho, depois a de outro idioma guardada | Só resposta 200 `basic` sem redirecionamento |
| `/_astro/*` | `cache-first` (o nome leva o hash) | Só 200 `basic` sem redirecionamento |
| O resto da mesma origem (manifest, ícones, `/search-index.json`) | `network-first`, com a cópia como reserva | Só 200 `basic` sem redirecionamento |

- **A chave:** `origin + pathname`, sem `?` e sem `#`, em todo `put` e `match`. O `#` chega no `request.url` da navegação nos dois navegadores (lab da exploração); a chave o tira antes.
- **A versão:** o cache é `fileorca-pages-<commit>`. No `activate`, o worker apaga os caches `fileorca-*` de outras versões e a caixa de entrada. Os `/_astro/*` não atravessam versões: é o mais simples e reversível, e o 404 de um chunk velho depois de um deploy (§ 103, e-05) já acontece sem o worker.
- **`skipWaiting` e `clients.claim`:** sim, nos dois modos. Uma aba antiga que precisar de um chunk que o deploy apagou recebe o `load` de hoje.
- **Primeira página:** o worker não existia quando ela carregou. O script de registro manda o endereço e os `performance` entries quando o worker ativa; o worker filtra pela mesma regra (`warmList`) e busca o que falta (do cache HTTP, na maioria).
- **Página offline:** no `install`, só a do idioma das janelas abertas (`clients.matchAll`), com o CSS e as fontes dela. Cada navegação guardada garante a do idioma dela.
- **O motor:** entra no cache quando a ferramenta o carrega com rede (é `/_astro/*`). Nada se baixa só para o offline.

### 2.3 A desativação de emergência

- `SW_ENABLED = false` em `src/platform/site.ts`:
  - o build grava um `/sw.js` que, no `install`, faz `skipWaiting`, e no `activate` apaga todo cache `fileorca-*` e se desregistra (sem `fetch`: tudo vai à rede);
  - o `BaseLayout` não registra;
  - o manifest perde o `share_target` (sem worker, o POST cairia no 405 do Cloudflare).
- O `/sw.js` tem `Cache-Control: no-cache`, então a próxima navegação de quem tem o worker busca a desativação.
- Prova: `tests/e2e/sw-killswitch.spec.ts`, com um servidor próprio que troca o `/sw.js` pelo de desativação e, de volta, pelo normal.

### 2.4 A página offline

- Rotas `offline`: `/offline/`, `/pt/offline/`, `/es/sin-conexion/` (glossário: "offline" em pt, "sin conexión" em es). `indexable: false`, sem `adArea`, `X-Robots-Tag: noindex` no `_headers`.
- Mostra: o H1, o `OliMessage` offline (`buoy`, `role="status"`, tom `surface`) dizendo a verdade ("esta página ainda não foi guardada"), a lista das páginas guardadas (script inline que lê o cache e o `<title>` de cada página, como texto) e o link da home.
- A linha "Offline" da tabela de falas (`docs/design/README.md` e os glossários) promete demais: passa a dizer que a Oli segue funcionando nas páginas já abertas. O `PLANO-FILEORCA.md` não pode ser editado (`.claude/settings.json`), então o desvio fica no §.

### 2.5 A ferramenta guardada sem o motor

- Offline (`navigator.onLine === false`), a falha `load` mostra a fala offline da Oli (`buoy`, `role="status"`, tom neutro), nas ilhas de imagem e de PDF, nos três idiomas. Com rede, nada muda.
- O PDF das calculadoras carrega o `pdf-client` e o worker de PDF só no clique: offline sem esse chunk, o `ExportBar` também mostra a fala offline em vez de "recarregue a página".

## 3. O compartilhar

- **Rotas `open-with`:** `/open-with/`, `/pt/abrir-com/`, `/es/abrir-con/`, `indexable: false`, sem anúncio.
- **Manifest:** `id` igual ao `start_url` de hoje (`/`, `/pt/`, `/es/`); `share_target` com `action` da página do idioma, `POST`, `multipart/form-data`, um campo `files` com o `accept` gerado por `shareAccept()` (`src/share/tools.ts`): os tipos e as extensões das ferramentas de imagem (JPG, PNG, WebP, HEIC) e o PDF. Sem `text` nem `url`. Ligado ao `SW_ENABLED`.
- **A caixa de entrada:** o Cache Storage `fileorca-inbox`, entradas `/__fileorca-inbox/<n>` (um contador, nunca o nome), com o nome codificado e a hora em cabeçalhos. Apaga: depois da entrega, no `activate` de um worker novo, e depois de 1 h (o worker confere em cada navegação; a ilha e a página ignoram entrada vencida).
- **A página "Abrir com":** os 20 cartões (8 de imagem e 12 de PDF, só ferramentas) saem do registro no build, escondidos. O script (`src/share/client.ts`) lê a caixa, mostra nome, tamanho e formato (lido dos primeiros 64 KB pelos `sniff` dos motores) e revela as ferramentas que aceitam pelo menos um arquivo, com "Abre N de M arquivos" no cartão. Sem arquivos: a fala e os links dos hubs.
- **A escolha:** o clique grava no `sessionStorage` da aba `{tool, order}` (a ordem põe primeiro os arquivos que a ferramenta aceita). Nada vai na URL.
- **A entrega:** `takeInbox(page)` (`src/tools/image/inbox.ts`, no chunk `island`), chamado no `useEffect` de montagem do `ImagePanel` e do `PdfPanel`, entrega os arquivos ao `startBatch` / `addFiles` (o caminho do soltar), e apaga a caixa.
- **Arquivos JS:** a "Abrir com" carrega 2 (a entrada e o chunk `sniff`, que o `process` preguiçoso também importa). As páginas de ferramenta seguem com 2.

## 4. O Dependabot

```yaml
version: 2
updates:
  - package-ecosystem: npm          # o pnpm-lock.yaml (lockfile 9.0) é lido pelo ecossistema npm
    directory: /
    schedule: { interval: monthly, time: "06:00", timezone: America/Sao_Paulo }   # dia 1 de cada mês
    cooldown: { default-days: 7 }   # nada publicado há menos de uma semana (F1a: pacote do mesmo dia)
    open-pull-requests-limit: 3     # 1 grupo + até 2 majors; cada PR custa ~130 min de Actions
    versioning-strategy: increase   # reescreve exato e "~" sem virar "||"
    commit-message: { prefix: chore, include: scope }   # chore(deps): …, chore(deps-dev): …
    groups:
      npm-minor-patch: { applies-to: version-updates, patterns: ["*"], update-types: [minor, patch] }
    ignore:                          # cada um com a razão escrita no comentário de cima
      - dependency-name: "@types/node"   # segue o major do .node-version (§ 17 e § 37)
        update-types: ["version-update:semver-major"]
      - ... (o que o ensaio pedir)
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: monthly, time: "06:00", timezone: America/Sao_Paulo }
    cooldown: { default-days: 7 }
    open-pull-requests-limit: 1
    commit-message: { prefix: ci, include: scope }
    groups:
      actions-minor-patch: { applies-to: version-updates, patterns: ["*"], update-types: [minor, patch] }
```

- Sem rótulos, revisores, `pull_request_target` nem segredos. As PRs de GitHub Actions mexem em `.github/workflows/` e ficam sempre para o Victor.
- **O ensaio:** uma worktree descartável de `dda73f2`, com a leva de hoje (astro 7.4.5, preact 11.1.1, wrangler 4.156.2, eslint ~10.14.0, pdfjs-dist 6.5.438, vitest 5.1.0), `pnpm verificar --sem-playwright` e o `budgets`, o `image-smoke` e o `pdf-tool` com `FO_PORT=4182`. Cada falha vira (a) teste que lê a versão, (b) `ignore` com razão, ou (c) passo do `OPERACAO.md`.
- **O teste:** `tests/unit/dependabot.test.ts`, com o leitor de YAML pequeno dos testes (`tests/unit/lib/mini-yaml.ts`), sem dependência nova.

## 5. Os eventos de exemplo da regra de merge

16 fixtures em `fixtures/merge-events/`, cada uma com o payload `pull_request` (só os campos que o job lê), os arquivos do `git diff` e a saída do `fetch-metadata`:

| Caso | `merge` | `comment` |
| --- | --- | --- |
| Dependabot patch, minor, grupo minor, grupo patch | true | false |
| Dependabot major, tipo vazio, fora de `dependabot/`, grupo de Actions | false | true |
| `fase-08`, `fase-05a`, `ajuste-ci-disco`, `ajuste-dependabot` (só `.github/dependabot.yml`) | true | false |
| branch qualquer, PR que mexe em `.github/workflows/`, rename de workflow para fora da pasta | false | true |
| rascunho | false | false |

O `tests/unit/merge-events.test.ts` lê o job `merge` do `ci.yml`, monta o `env` do passo Decide a partir do evento, refaz o `git diff --no-renames` num repositório de rascunho para o rename, roda o `jq` do próprio `ci.yml` onde existe (no Ubuntu é obrigatório) e compara com a versão em TypeScript, e roda o CLI com o `GITHUB_OUTPUT`. A chamada do CLI, o `git diff` e o `jq` ficam iguais aos da main, e o teste fixa isso.

## 6. O alerta de CI vermelho no Dependabot

```yaml
  alerta-dependabot:
    needs: [verificar, playwright, merge]
    if: failure() && github.event.pull_request.user.login == 'dependabot[bot]'
    permissions: { issues: write, pull-requests: write }
```

- Sem checkout: só o `gh`. Procura uma issue aberta com o título exato "CI vermelho na PR #N do Dependabot"; se houver, comenta; se não, abre, atribuída ao dono do repositório. Comenta também na PR.
- O `merge` entra no `needs` além do pedido da ficha: uma falha do `fetch-metadata` ou do `gh pr merge` também avisa.
- As issues do pós-deploy e do job de merge passam a ser atribuídas ao dono (`--assignee`): a exploração viu que o Victor não assiste o repositório, e sem atribuição o e-mail não sai. Mudou o `pos-deploy.yml`, então a prova da decisão 15 roda de novo com `--ref fase-08`.
- Prova: `gate:actionlint` e `tests/unit/ci-workflows.test.ts` (gatilho, condição, permissões, `needs`, títulos).

## 7. O `docs/OPERACAO.md`

Índice: como os alertas chegam; issue do pós-deploy; issues do merge; PR de major; issue de CI vermelho no Dependabot; PR de GitHub Actions; "Dependabot Updates" vermelho; Workers Builds vermelho; UptimeRobot; Googlebot barrado; minutos do Actions; defeito no service worker (desativação); pico de `tool_error`; e-mail do AdSense; `ENOSPC` numa parte; passos depois de certas PRs (o ensaio); revisão mensal; revisão anual; tarefas de configuração do Victor; pendências. O `tests/unit/operacao.test.ts` confere os `pnpm <script>`, os caminhos, os workflows e os títulos de issue.

## 8. O CI

- **Medida (run 41465872919):** pior parte o WebKit 7 (730 s); o `verificar` em 680 s.
- **Projeção com os specs novos** (`sw-offline`, `sw-privacy`, `sw-killswitch`, `share-target`, `manifest`, mais o que a revisão pedir): o WebKit em 8 partes passa de 700 s em 98 % dos sorteios; em 10, a pior parte fica em 627 s (cenário médio) e 649 s (alto). O Chromium em 4 aguenta (pior parte 510 a 623 s).
- **Decisão:** WebKit em 10 partes (15 jobs), adendo da ADR-003. O passeio de estados do `a11y` fica onde está (com 10 partes, o ganho dele não muda o máximo). Os nomes `sw-*`, `share-target` e `manifest` caem depois de `qr-code` e não juntam `design` e `image-matrix` numa parte.
- Se o `verificar` passar de 700 s no CI, o Lighthouse vai para uma parte própria (ajuste do `plan()`).

## 9. Critérios → prova

| Critério | Prova |
| --- | --- |
| 1 revisão F4-F7 | `REVISAO-F4-F7.md`; testes das correções |
| 2 pendências | `docs/PENDENCIAS.md`; `tests/unit/pendencias.test.ts` |
| 3 Dependabot | `tests/unit/dependabot.test.ts`; relatório do ensaio |
| 4 regra de merge | `tests/unit/merge-events.test.ts` |
| 5 aviso de deploy | execução 41488759711, issue #16 (e a repetição com `--ref fase-08`) |
| 6 alerta | `gate:actionlint`; `tests/unit/ci-workflows.test.ts` |
| 7 offline | `tests/e2e/sw-offline.spec.ts` |
| 8 privacidade do cache | `tests/e2e/sw-privacy.spec.ts` |
| 9 desativação e versão | `tests/e2e/sw-killswitch.spec.ts`; `tests/unit/sw-logic.test.ts` |
| 10 compartilhar | `tests/e2e/share-target.spec.ts` |
| 11 manifests | `tests/unit/manifest.test.ts` e o `manifest.spec.ts` (a ação no `dist/`) |
| 12 orçamento | `budgets.spec.ts` (inalterado) e `sw-budgets` no `sw-offline.spec.ts` |
| 13 Lighthouse | `pnpm lhci` |
| 14 OPERACAO | `tests/unit/operacao.test.ts` |
| 15 CI | as 15 partes verdes |
| 16 revisão F8 | `REVISAO-F8.md` |
| 17 verificar local | `pnpm verificar` numa execução limpa |

## 10. Os testes E2E do service worker

- `serviceWorkers: 'block'` vira o padrão do `playwright.config.ts`. Os specs `sw-*` e `share-target` usam `test.use({ serviceWorkers: 'allow' })`.
- Cada teste sobe o próprio servidor do `dist/` numa porta livre (`tests/e2e/lib/sw-server.ts`, com a lógica do `serve-dist`): origem limpa por teste, troca do `/sw.js` para a desativação e a versão nova, e "rede desligada" de verdade (o servidor fecha e derruba as conexões), com `context.setOffline(true)` para o `navigator.onLine`.
- O `serve-dist` responde 405 a método diferente de GET e HEAD, como o Cloudflare (exploração, `wrangler dev`), e o teste do compartilhar prova que o POST nunca chega ao servidor.
- No WebKit os specs rodam e registram o que acontece; o que só o Chromium expõe (eventos de rede do worker, `context.serviceWorkers()`) ramifica por dentro, sem `skip`.

## 11. Ordem de construção

1. Primeiro push e prova do aviso de deploy (feito).
2. Ensaio, `dependabot.yml`, testes que travariam a PR mensal, eventos de exemplo.
3. Service worker, registro, cabeçalho, desativação, página offline e os specs.
4. Compartilhar: manifests, "Abrir com", entrega à ilha, spec.
5. Privacidade nos três idiomas.
6. Alerta, assignee, divisão do CI, `verificar.test.ts`.
7. Correções da revisão F4-F7.
8. `OPERACAO.md`, `PENDENCIAS.md` e testes.
9. Lighthouse, screenshots, `--list`.
10. Revisão adversarial final e relatório.
