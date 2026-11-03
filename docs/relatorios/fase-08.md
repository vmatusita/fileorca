# Relatório da F8 · Piloto automático

A run `fase-08` deixa o site andar sozinho entre as runs: as dependências chegam pelo Dependabot e se mesclam quando o CI passa, o aviso de deploy e o CI vermelho do Dependabot chegam por issue, o site funciona offline nas páginas visitadas, e o Android abre imagens e PDFs no FileOrca pelo "Compartilhar". Ela também revisou as F4 a F7 e juntou o que está aberto numa lista só. A PR é a [vmatusita/fileorca#18](https://github.com/vmatusita/fileorca/pull/18). **O merge é do Victor:** a PR muda `.github/workflows/`, e o job de merge não a mescla sozinho.

O código final é o commit `c999692`. A última execução verde do CI com código ou teste é a [execução 41548317129](https://github.com/vmatusita/fileorca/actions/runs/41548317129), no `c999692`, com as 15 partes verdes.

## Resumo

- **A revisão das F4 a F7** (8 lentes e 20 céticos sobre o `29afbce`) achou 1 alto e 9 médios, que são 8 defeitos. O alto (o salto de layout da trilha de navegação na primeira visita) e 6 dos defeitos médios foram corrigidos, cada um com um teste que reprova no commit revisado (§ 305). O médio e-2 e os 19 baixos foram para o `PENDENCIAS.md`. A segunda passada achou o corte de links da primeira versão da correção do e-1, que foi refeita.
- **O `docs/PENDENCIAS.md`** junta numa lista só, em 17 grupos por tipo de run, 170 linhas: os baixos e os médios abertos das revisões F3 a F8, as decisões e as tarefas do Victor. O teste dele lê das revisões o que ficou aberto.
- **O Dependabot:** o `.github/dependabot.yml` (npm e GitHub Actions, mensal, minor e patch agrupados, major em PR própria, `cooldown` de 7 dias) foi ensaiado numa worktree descartável; das três falhas, duas foram corrigidas aqui e uma é um teste lento que já existia. A regra de merge está provada com 16 eventos de exemplo pelo mesmo caminho do job.
- **Offline:** um service worker guarda as páginas visitadas e os arquivos do próprio site que elas pedem, mostra a página offline do idioma com a Oli `buoy`, e tem a desativação de emergência provada. Nada que a pessoa digitou ou abriu entra no cache.
- **"Abrir com", no Android:** o manifest de cada idioma tem o `share_target`; o worker guarda os arquivos compartilhados numa caixa no aparelho, a página "Abrir com" mostra as ferramentas que os aceitam, e a ferramenta escolhida os recebe pelo caminho do soltar.
- **Alertas:** o aviso de deploy provado duas vezes (issues [#16](https://github.com/vmatusita/fileorca/issues/16) e [#17](https://github.com/vmatusita/fileorca/issues/17), comentadas); o CI vermelho numa PR do Dependabot abre uma issue atribuída ao Victor; toda issue dos workflows sai com `--assignee`.
- **O `docs/OPERACAO.md`** diz o que fazer em cada alerta, com teste.
- **O CI** tem 15 partes (o `verificar`, o Chromium em 4 e o WebKit em 10), todas verdes e abaixo do alvo de 700 s na execução do código final (a pior, o `verificar`, com 674,8 s).
- **A revisão final da F8** (5 lentes e 26 céticos sobre o `2f104be`) achou 7 altos (4 defeitos) e 10 médios. Todos os altos e os médios locais foram corrigidos (§ 305 a § 307); um deles, o compartilhar sem worker, ficou corrigido no texto, e a mudança de código é decisão do Victor. Os 18 baixos foram para o `PENDENCIAS.md`. A segunda passada achou 1 médio e 3 baixos nas correções, todos tratados.
- **O Lighthouse** das 10 URLs fica nos limiares de hoje: desempenho de 99 a 100 e CLS de 0,000 a 0,001.
- **A válvula não cortou nada.** Fora do repositório, só o disparo de teste do pós-deploy e as duas issues que ele abriu.

## A revisão das F4 a F7

Tudo em [`REVISAO-F4-F7.md`](REVISAO-F4-F7.md). Oito lentes Sonnet sobre o `29afbce` (a `main` do começo da run), com um cético por achado crítico, alto ou médio e um por lente para os baixos.

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude | — | 2 | 1 | — |
| (b) privacidade e segurança | — | — | 1 | — |
| (c) anúncio e política | — | — | 1 | — |
| (d) acessibilidade | — | 3 | 5 | — |
| (e) desempenho e SEO | 1 | 1 | 1 | — |
| (f) design system e voz | — | — | 5 | 1 |
| (g) dinheiro e saúde | — | — | 3 | 1 |
| (h) idiomas e formatos | — | 3 | 2 | — |
| **Total depois dos céticos** | **1** | **9** | **19** | **2** |

O a-1 é o h-2 e o a-2 é o h-3, então os 10 altos e médios são 8 defeitos. Corrigidos, cada um com teste e na § 305:

- **e-1 (alto):** a trilha de navegação e o aviso de cookies usam uma face da Figtree com `font-display: optional` (`Figtree Steady`) e ficam com a fonte da primeira pintura; a fonte de reserva passou a 101,2 %. Na varredura das 159 páginas com a Figtree segura até a primeira pintura, o pior CLS caiu de 0,201 a 0,317 para 0,032 a 0,048 de 320 a 393 px e 0,079 a 412 px. A primeira versão (a trilha numa linha que rolava) cortava links e foi refeita (s-1 da segunda passada); a reserva de duas linhas foi descartada porque punha o resultado de cinco calculadoras abaixo da dobra.
- **h-1:** o Sobre em inglês conta todas as áreas e os idiomas.
- **h-2/a-1:** o CET acima de 10.000.000 % ao ano vira um problema, nunca notação exponencial.
- **h-3/a-2:** no PDF das dívidas em pt e es, o valor que não cabe na linha do rótulo desce para a de baixo.
- **d-1:** as ferramentas de PDF com botão de ação anunciam os prontos e as recusas depois da leitura.
- **d-3:** o número e a frase do cartão de resultado quebram em vez de sair do cartão com o espaçamento de texto do WCAG 1.4.12.
- **d-4:** o erro de faixa espera 800 ms sem tecla ou a saída do campo.

O médio e-2 (o cartão de resultado das ferramentas de imagem empurra as opções no celular) pede decidir o molde da página de ferramenta e foi para o `PENDENCIAS.md`, com os 19 baixos (grupo 16). A segunda passada achou 1 alto, 2 médios e 3 baixos nas correções: o alto (o corte de links) e os dois médios foram corrigidos, um baixo foi refutado, um ficou como pendência e o outro era do próprio diff.

## O `PENDENCIAS.md`

[`docs/PENDENCIAS.md`](../PENDENCIAS.md): 170 linhas em 17 grupos, cada uma com o id, a fonte, a severidade, o defeito, a correção proposta e quem resolve. Os grupos seguem o tipo de run (saúde e fontes, contas, exportação, texto e voz, acessibilidade, layout, PDF, SEO, testes, desempenho, CI, kit, a 2b) e terminam nas decisões do Victor, nas tarefas do Victor, na revisão das F4 a F7 e no que a F8 deixou. O `tests/unit/pendencias.test.ts` confere os itens que a decisão 3 nomeia, as seis colunas de cada linha, um baixo de cada revisão da F8 e, desde a revisão final, cada achado que as revisões F3 a F7 deixaram aberto (assim apareceu o F3 a-05, que faltava).

## O Dependabot

O arquivo é o [`.github/dependabot.yml`](../../.github/dependabot.yml) (§ 298):

- **npm** e **GitHub Actions**, os dois em `/`; mensal, no dia 1, às 06:00 de São Paulo;
- `cooldown` de 7 dias (sem configurar, seriam 3);
- um grupo de minor e patch por ecossistema (`npm-minor-patch` e `actions-minor-patch`); cada major em PR própria;
- até 3 PRs abertas no npm e 1 nas actions; `versioning-strategy: increase`; `commit-message` com `chore` e `ci`, como a main; `labels: []`;
- `ignore`, cada um com a razão escrita em cima: `@types/node` major (segue o Node 24), `typescript` minor e major (o `typescript-eslint` e o `@astrojs/check` ainda não aceitam o 7) e o `qrcode` (o `qrcodeEsm()` reescreve o pacote por versão).

**O ensaio** (§ 299), numa worktree descartável de `dda73f2`, removida no fim. O grupo de minor e patch levaria hoje:

| Pacote | De → para |
| --- | --- |
| `astro` | ^7.4.4 → ^7.4.5 |
| `preact` | ^11.1.0 → ^11.1.1 |
| `wrangler` (dev) | ^4.156.0 → ^4.156.2 |
| `eslint` (dev) | ~10.13.0 → ~10.14.0 |
| `pdfjs-dist` | ^6.4.299 → ^6.5.438 |
| `vitest` (dev) | ^5.0.5 → ^5.1.0 |

As majors (`typescript` 7.0.2, `@types/node` 26.6.6 e `node-html-parser` 9.0.6) ficam fora do grupo; com os `ignore`, sobra uma PR de major, a do `node-html-parser`, que é do Victor. Com o `cooldown` de 7 dias, um ciclo hoje levaria só o `eslint`; o de 1º de dezembro leva os seis.

A saída antes dos ajustes (`pnpm verificar --sem-playwright`, que para na primeira falha):

```
Resumo do pnpm verificar (sem o Playwright)
  ok      12.0 s  tipos (astro check)
  ok       5.5 s  lint (eslint)
  ok      28.2 s  build (astro build do zero)
  FALHA   43.8 s  vitest
  total 89.5 s (limite 900 s)
```

As três falhas e o destino de cada uma:

1. **O PDF.js 6.5 chama `canvasFactory.getNoAlphaContext()`,** que a fábrica do motor não tinha: todo desenho de página no worker do Chromium falhava. **Corrigido nesta run** (o método, e um teste no `pdf-hardening.test.ts` que exige nas fábricas do motor todo método público das fábricas do PDF.js instalado).
2. **O core-js do PDF.js 6.5 é o 3.51.0,** e a /licenses tem o texto do 3.50.0 (o mesmo SHA-256). **O teste passa a ler a versão** do `src/platform/licenses.ts`; recopiar o texto é um passo do `OPERACAO.md` depois da PR do grupo.
3. **Um teste do `pdf-engine-ops.test.ts` estoura os 5 s** com a máquina carregada, com e sem a atualização. **Fica no `PENDENCIAS.md`** (F8 ensaio-3).

A saída depois dos ajustes, com as seis atualizações aplicadas: os portões todos verdes (`gate:cabecalhos`, `gate:worker`, `gate:seo`, `gate:links`, `gate:conteudo`, `gate:prontidao`, `gate:design`, `gate:licencas`, `gate:dinheiro-saude`, `gate:actionlint`, o `lhci` com desempenho de 99 a 100 e o `lint:texto`), o Vitest com 1.460 de 1.460, e o `budgets`, o `image-smoke` e o `pdf-tool` com 152 de 152 no Chromium e no WebKit. O `guias:medir --check` deu zero diferença no PDF to JPG e no Compress forte. Nenhuma dependência mudou na PR.

## A regra de merge: os eventos de exemplo

16 eventos em `fixtures/merge-events/`, pelo mesmo caminho do job (`tests/unit/merge-events.test.ts`, § 297): o `env` do passo Decide montado do evento, o `git diff` do job (o rename refeito num repositório de rascunho), o `jq` do próprio `ci.yml` (obrigatório no Linux do CI) e o `pode-mesclar.ts` com o `GITHUB_OUTPUT`. A chamada do CLI no `ci.yml` é a mesma da main, e o teste a fixa.

| Evento | Autor | Branch | Rascunho | fetch-metadata | Arquivos | merge | comment | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dependabot-actions-group | dependabot[bot] | `dependabot/github_actions/actions-minor-patch-a1b2c3d4e5` | não | version-update:semver-patch · actions-minor-patch | .github/workflows/ci.yml, .github/workflows/pos-deploy.yml | false | true | A PR mexe em .github/workflows/, então o merge fica para o Victor. |
| dependabot-empty-type | dependabot[bot] | `dependabot/npm_and_yarn/fflate-0.8.4` | não | (vazio) | package.json, pnpm-lock.yaml | false | true | Atualização de tipo desconhecido (vazio) do Dependabot: o merge fica para o Victor. |
| dependabot-group-minor | dependabot[bot] | `dependabot/npm_and_yarn/npm-minor-patch-3f9c2a1b7e` | não | version-update:semver-minor · npm-minor-patch | package.json, pnpm-lock.yaml | true | false | Dependabot minor: merge automático. |
| dependabot-group-patch | dependabot[bot] | `dependabot/npm_and_yarn/npm-minor-patch-8d1e0c4f22` | não | version-update:semver-patch · npm-minor-patch | package.json, pnpm-lock.yaml | true | false | Dependabot patch: merge automático. |
| dependabot-major | dependabot[bot] | `dependabot/npm_and_yarn/typescript-7.0.0` | não | version-update:semver-major | package.json, pnpm-lock.yaml | false | true | Atualização major do Dependabot: o merge fica para o Victor. |
| dependabot-minor | dependabot[bot] | `dependabot/npm_and_yarn/vitest-5.1.0` | não | version-update:semver-minor | package.json, pnpm-lock.yaml | true | false | Dependabot minor: merge automático. |
| dependabot-outside-branch | dependabot[bot] | `fase-08` | não | version-update:semver-patch | package.json, pnpm-lock.yaml | false | true | PR do Dependabot fora de uma branch dependabot/: fica para o Victor. |
| dependabot-patch | dependabot[bot] | `dependabot/npm_and_yarn/astro-7.4.5` | não | version-update:semver-patch | package.json, pnpm-lock.yaml | true | false | Dependabot patch: merge automático. |
| draft | vmatusita | `fase-08` | sim | — | src/sw/logic.ts | false | false | PR em rascunho: o merge espera ela ficar pronta. |
| other-branch | vmatusita | `feature/offline-cache` | não | — | src/sw/logic.ts | false | true | A branch feature/offline-cache não é fase-* nem ajuste-*: o merge fica para o Victor. |
| run-ajuste-ci-disco | vmatusita | `ajuste-ci-disco` | não | — | scripts/lib/disco.ts | true | false | Branch de run (ajuste-ci-disco) com o verificar verde: merge automático. |
| run-dependabot-config | vmatusita | `ajuste-dependabot` | não | — | .github/dependabot.yml | true | false | Branch de run (ajuste-dependabot) com o verificar verde: merge automático. |
| run-fase-05a | vmatusita | `fase-05a` | não | — | src/engine/pdf/process.ts | true | false | Branch de run (fase-05a) com o verificar verde: merge automático. |
| run-fase-08 | vmatusita | `fase-08` | não | — | src/sw/logic.ts, docs/OPERACAO.md | true | false | Branch de run (fase-08) com o verificar verde: merge automático. |
| run-renames-workflow-out | vmatusita | `ajuste-ci-partes` | não | — | rename .github/workflows/old.yml → docs/old.yml | false | true | A PR mexe em .github/workflows/, então o merge fica para o Victor. |
| run-touches-workflows | vmatusita | `fase-08` | não | — | .github/workflows/ci.yml, tests/unit/ci-alert.test.ts | false | true | A PR mexe em .github/workflows/, então o merge fica para o Victor. |

## A prova do aviso de deploy

- **Antes do disparo,** a leitura do `scripts/ci/pos-deploy.ts`: quando o deploy não chega, o script sai com `process.exit(1)` logo depois da espera, antes do `checkProduction` e do IndexNow.
- **O disparo** (§ 284), logo depois do primeiro push, com o SHA completo do primeiro commit da `fase-08`:

  ```
  gh workflow run pos-deploy.yml --ref main -f commit=15fab5b2419980d6fba683ec88c8480e576e5e74 -f wait_minutes=2
  ```

  - Execução: [41488759711](https://github.com/vmatusita/fileorca/actions/runs/41488759711), "Conferir produção" vermelho e "Abrir issue" verde.
  - As linhas do log:

    ```
    Esperando https://fileorca.com/build.txt trazer 15fab5b (até 2 min)
    build.txt traz 29afbce, ainda sem 15fab5b
    build.txt traz 29afbce, ainda sem 15fab5b
    build.txt traz 29afbce, ainda sem 15fab5b
    build.txt traz 29afbce, ainda sem 15fab5b
    O deploy de 15fab5b não chegou em 2 min.
    ```
  - A issue: [#16](https://github.com/vmatusita/fileorca/issues/16), comentada ("Disparo de teste da F8, a prova do aviso de deploy. Victor: confira se o e-mail chegou e feche esta issue.").
- **A repetição com `--ref fase-08`,** porque a run mudou o `pos-deploy.yml` (as issues passam a ser atribuídas ao dono, § 301): execução [41497600846](https://github.com/vmatusita/fileorca/actions/runs/41497600846), com as mesmas linhas no log e o passo "Abrir issue" verde; a issue [#17](https://github.com/vmatusita/fileorca/issues/17), já atribuída a `vmatusita`, comentada do mesmo jeito.
- Nenhuma das duas foi fechada: é com o Victor.

## O service worker

| Pedido | Estratégia | Entra no cache? |
| --- | --- | --- |
| Outra origem (Google, anúncio, GA4) | sem `respondWith` | nunca |
| Mesma origem, método diferente de GET (fora o compartilhar) | sem `respondWith` | nunca |
| POST na ação do compartilhar | caixa de entrada e 303 para a página em GET | só na caixa, com chave sintética |
| Pedido com `Range` | sem `respondWith` | nunca |
| `/build.txt`, `/cdn-cgi/*`, `ads.txt`, `robots.txt`, sitemaps, a chave do IndexNow, `/sw.js` | sem `respondWith` | nunca |
| Navegação | rede primeiro; sem rede, a cópia; sem cópia, a página offline do idioma (depois a de outro idioma) | 200 `basic` sem redirecionamento |
| `/_astro/*` | cache primeiro | 200 `basic` sem redirecionamento |
| O resto da mesma origem | rede primeiro, cópia como reserva | 200 `basic` sem redirecionamento |

- **A chave:** `origin + pathname` (sem `?` e sem `#`). **A versão:** o commit do `build.txt` no nome do cache (`fileorca-pages-<commit>`); no `activate`, os outros caches do site saem, a caixa também. **A página que traz uma versão nova** manda a lista dela de novo no `controllerchange` e fica no cache novo (§ 307). **A desativação:** `SW_ENABLED` (§ 288). **A página offline:** § 289.

Os specs do worker, na execução local das partes (a parte 4 do Chromium e a 10 do WebKit):

```
ok [chromium] › share-target.spec.ts:114:1 › an inbox past its hour is deleted on the next visit; one within the hour stays (854ms)
ok [chromium] › share-target.spec.ts:135:1 › a file no tool takes: the files are listed and the page says so (301ms)
ok [chromium] › share-target.spec.ts:145:1 › opened directly, with no files, the page explains and leads to the hubs, with at most 2 JS files (203ms)
ok [chromium] › share-target.spec.ts:160:1 › the three manifests of the build: the icons, the id and the action of the share target answer (43ms)
ok [chromium] › share-target.spec.ts:32:1 › an image and a PDF shared: the files, the tools that take them, and Compress image gets them (982ms)
ok [chromium] › share-target.spec.ts:68:1 › a PDF shared in Portuguese goes to Rotate PDF by its island (586ms)
ok [chromium] › share-target.spec.ts:85:1 › shared files: the page never says there is nothing to open, and nothing on screen moves (649ms)
ok [chromium] › sw-killswitch.spec.ts:32:1 › the built /sw.js follows SW_ENABLED, at the version of build.txt (2ms)
ok [chromium] › sw-killswitch.spec.ts:37:1 › the kill switch empties every cache of the site and unregisters; turned back on, it keeps pages again (2.5s)
ok [chromium] › sw-killswitch.spec.ts:69:1 › a new build deletes the caches of the old one and the inbox when it activates, and keeps the page that brought it (2.4s)
ok [chromium] › sw-offline.spec.ts:106:1 › the Due date offline still reads today from the device clock (434ms)
ok [chromium] › sw-offline.spec.ts:125:1 › the QR code offline: the PNG read by jsQR gives the text back (457ms)
ok [chromium] › sw-offline.spec.ts:143:1 › a page never visited shows the offline page of its language, with the buoy and the kept pages (640ms)
ok [chromium] › sw-offline.spec.ts:169:1 › a tool kept without its engine says so offline, in buoy, and works again with the network (850ms)
ok [chromium] › sw-offline.spec.ts:204:1 › the worker passes on the redirect of an address without its slash, and never keeps a 404 (850ms)
ok [chromium] › sw-offline.spec.ts:234:1 › with the worker on, a tool page keeps its 2 JS files and no engine before the first file (179ms)
ok [chromium] › sw-offline.spec.ts:53:1 › Compress image and Rotate PDF, used once with the network, work offline with other files (1.2s)
ok [chromium] › sw-offline.spec.ts:81:1 › a money calculator in English and one in Portuguese recalculate and export the CSV and the PDF offline (1.9s)
ok [chromium] › sw-privacy.spec.ts:28:1 › nothing typed or opened enters a cache, nothing leaves by the worker, and the inbox ends empty (1.3s)
(chromium, parte 4 de 4: 301 passed (1.3m))

ok [webkit] › share-target.spec.ts:114:1 › an inbox past its hour is deleted on the next visit; one within the hour stays (1.6s)
ok [webkit] › share-target.spec.ts:135:1 › a file no tool takes: the files are listed and the page says so (1.0s)
ok [webkit] › share-target.spec.ts:145:1 › opened directly, with no files, the page explains and leads to the hubs, with at most 2 JS files (572ms)
ok [webkit] › share-target.spec.ts:160:1 › the three manifests of the build: the icons, the id and the action of the share target answer (49ms)
ok [webkit] › share-target.spec.ts:32:1 › an image and a PDF shared: the files, the tools that take them, and Compress image gets them (3.0s)
ok [webkit] › share-target.spec.ts:68:1 › a PDF shared in Portuguese goes to Rotate PDF by its island (1.9s)
ok [webkit] › share-target.spec.ts:85:1 › shared files: the page never says there is nothing to open, and nothing on screen moves (1.3s)
ok [webkit] › sw-killswitch.spec.ts:32:1 › the built /sw.js follows SW_ENABLED, at the version of build.txt (2ms)
ok [webkit] › sw-killswitch.spec.ts:37:1 › the kill switch empties every cache of the site and unregisters; turned back on, it keeps pages again (1.9s)
ok [webkit] › sw-killswitch.spec.ts:69:1 › a new build deletes the caches of the old one and the inbox when it activates, and keeps the page that brought it (2.0s)
ok [webkit] › sw-offline.spec.ts:106:1 › the Due date offline still reads today from the device clock (1.3s)
ok [webkit] › sw-offline.spec.ts:125:1 › the QR code offline: the PNG read by jsQR gives the text back (1.6s)
ok [webkit] › sw-offline.spec.ts:143:1 › a page never visited shows the offline page of its language, with the buoy and the kept pages (1.5s)
ok [webkit] › sw-offline.spec.ts:169:1 › a tool kept without its engine says so offline, in buoy, and works again with the network (1.9s)
ok [webkit] › sw-offline.spec.ts:204:1 › the worker passes on the redirect of an address without its slash, and never keeps a 404 (1.6s)
ok [webkit] › sw-offline.spec.ts:234:1 › with the worker on, a tool page keeps its 2 JS files and no engine before the first file (863ms)
ok [webkit] › sw-offline.spec.ts:53:1 › Compress image and Rotate PDF, used once with the network, work offline with other files (3.4s)
ok [webkit] › sw-offline.spec.ts:81:1 › a money calculator in English and one in Portuguese recalculate and export the CSV and the PDF offline (5.4s)
ok [webkit] › sw-privacy.spec.ts:28:1 › nothing typed or opened enters a cache, nothing leaves by the worker, and the inbox ends empty (5.3s)
(webkit, parte 10 de 10: 120 passed (46.8s))
```

O que o worker acrescenta à página de ferramenta (o teste do orçamento com o worker ligado, critério 12):

```
[sw-orcamento] chromium: antes do load 6 pedidos (2 JS); depois: /sw.js e 10 pelo worker: /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.PwqruWA_.js /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2 /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2 /_astro/island.ConZybmP.css /_astro/island.WaFDQpo_.js /compress-image/ /icon-180.png /manifest-en.webmanifest /offline/ /sw.js
[sw-orcamento] webkit: antes do load 8 pedidos (2 JS); depois: /sw.js e 0 pelo worker: 
```

**O dump das chaves de todos os caches,** depois de links do cenário com números (`#v=1&p=77712300`), um número digitado (424242), uma imagem e um PDF processados com nomes-sentinela e um compartilhar entregue ao Compress image (o `sw-privacy.spec.ts`, que confere que nenhuma chave tem `#`, `?`, número digitado ou nome de arquivo, que nenhum corpo é um arquivo aberto, que nada sai pelo worker e que a caixa termina vazia):

```
[sw-chaves] chromium: fileorca-pages-c99969227d214d9cd9275e9e91a887001a7ccc78
  /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2
  /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2
  /_astro/island.ConZybmP.css
  /offline/
  /
  /manifest-en.webmanifest
  /icon-180.png
  /mortgage-calculator/
  /_astro/CalcIsland.astro_astro_type_script_index_0_lang.C3Ve7ZjQ.js
  /_astro/island.WaFDQpo_.js
  /due-date-calculator/
  /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.PwqruWA_.js
  /_astro/engine-client.CmFRPEoB.js
  /_astro/comlink.D8cw1sLp.js
  /_astro/worker-D4hhrwrE.js
  /_astro/jpeg-DBbFT7XZ.js
  /_astro/runtime-DOQr9Zjy.js
  /_astro/mozjpeg_enc-yDU1ddnq.js
  /_astro/mozjpeg_enc.DO-zoExo.wasm
  /rotate-pdf/
  /_astro/PdfIsland.astro_astro_type_script_index_0_lang.0GjIDn3c.js
  /_astro/client.hNlcDuD7.js
  /_astro/worker-C2YpyWmi.js
  /open-with/
  /_astro/OpenWithView.astro_astro_type_script_index_0_lang.DfRnTKdp.js
  /_astro/sniff.D4tR_cXw.js
  /compress-image/
[sw-chaves] webkit: fileorca-pages-c99969227d214d9cd9275e9e91a887001a7ccc78
  /_astro/figtree-latin-wght-normal.D_ZTVpCC.woff2
  /_astro/fredoka-latin-wght-normal.DM6njrJ3.woff2
  /_astro/island.ConZybmP.css
  /offline/
  /
  /manifest-en.webmanifest
  /icon-180.png
  /mortgage-calculator/
  /_astro/CalcIsland.astro_astro_type_script_index_0_lang.C3Ve7ZjQ.js
  /_astro/island.WaFDQpo_.js
  /due-date-calculator/
  /compress-image/
  /_astro/CompressImagePage.astro_astro_type_script_index_0_lang.PwqruWA_.js
  /_astro/engine-client.CmFRPEoB.js
  /_astro/comlink.D8cw1sLp.js
  /_astro/worker-D4hhrwrE.js
  /_astro/process.FKn5S-6S.js
  /_astro/sniff.D4tR_cXw.js
  /_astro/jpeg.Z6c5wRan.js
  /_astro/runtime.BRyLttMa.js
  /_astro/mozjpeg_enc.DO-zoExo.wasm
  /_astro/mozjpeg_enc.CuwbGD99.js
  /rotate-pdf/
  /_astro/PdfIsland.astro_astro_type_script_index_0_lang.0GjIDn3c.js
  /_astro/client.hNlcDuD7.js
  /_astro/worker-C2YpyWmi.js
  /open-with/
  /_astro/OpenWithView.astro_astro_type_script_index_0_lang.DfRnTKdp.js
```

**A desativação** (o `sw-killswitch.spec.ts`, nos dois navegadores): com o worker ativo e páginas guardadas, o servidor do teste troca o `/sw.js` pelo que o build grava com `SW_ENABLED = false`; os caches do site somem, o registro some, e a página volta a vir só da rede. Religado, ele registra e guarda de novo. Num build de outra versão, os caches da versão velha e a caixa saem, e a página que trouxe a versão nova fica no cache novo e recarrega offline. Com a constante em `false` de verdade (um build com a chave desligada, § 307), o Vitest inteiro e os specs do worker e de orçamento passaram (1.513 e 266 testes): cada teste do worker confere por dentro que não há registro nem cache.

## O compartilhar

O `share-target.spec.ts` faz o que o Android faz: um POST `multipart` de navegação para a ação do manifest, com uma imagem e um PDF. O worker guarda os arquivos na caixa e manda a página para ela mesma em GET; a "Abrir com" mostra os arquivos e as 18 ferramentas que aceitam algum deles; o Compress image recebe a imagem pela ilha, recusa o PDF na linha, e o resultado baixa; a caixa termina vazia e o servidor não recebe nenhum POST. O spec também prova o Rotate PDF em português, um arquivo que nenhuma ferramenta aceita, a "Abrir com" aberta direto (com no máximo 2 arquivos JS), os três manifests, o prazo da caixa e que a página nunca diz "nada para abrir" sobre arquivos compartilhados.

Os screenshots estão em [`fase-08/componentes/`](fase-08/componentes/): a "Abrir com" com uma imagem e um PDF (`f8-open-with-files-*`) e vazia (`f8-open-with-empty-*`), a página offline nos três idiomas (`f8-offline-{en,pt,es}-*`), a fala offline numa ferramenta guardada sem o motor (`f8-tool-offline-*`) e a página offline no lugar de uma ferramenta nunca aberta (`f8-tool-offline-page-*`), nos dois temas, a 360 e a 1280 px (28 arquivos, entre os 350 da pasta).

## O orçamento, antes e depois

Antes é a `main` (`29afbce`); depois, o `dist/` do `c999692`.

| Página | Antes (`29afbce`) | Depois (`c999692`) |
| --- | --- | --- |
| `/compress-image/` | 2 JS, 51234 B (18324 B gzip); inline 6919 B | 2 JS, 53526 B (19005 B gzip); inline 7770 B |
| `/merge-pdf/` | 2 JS, 102441 B (34548 B gzip); inline 6919 B | 2 JS, 105498 B (35463 B gzip); inline 7770 B |
| `/mortgage-calculator/` | 2 JS, 152643 B (48436 B gzip); inline 6919 B | 2 JS, 155431 B (48961 B gzip); inline 7770 B |
| `/qr-code-generator/` | 2 JS, 79754 B (28665 B gzip); inline 6919 B | 2 JS, 82051 B (29350 B gzip); inline 7770 B |
| `/` | 0 JS, 0 B (0 B gzip); inline 6919 B | 0 JS, 0 B (0 B gzip); inline 7770 B |
| `/open-with/` | — | 2 JS, 10766 B (4816 B gzip); inline 7770 B |
| `/offline/` | — | 0 JS, 0 B (0 B gzip); inline 8993 B |

"JS" é o que a página pede ao carregar (os arquivos do `<script src>` e o que eles importam); "inline" são os scripts dentro do HTML (o consentimento, o tema, os cookies e, agora, o registro do worker).

- As páginas de ferramenta seguem com 2 arquivos JS e sem `worker` nem `.wasm` antes do primeiro arquivo (`budgets.spec.ts` e `i18n-budgets.spec.ts`, sem mudança).
- O JS inicial muda só pelo script inline do registro: o inline passa de 6.919 para 7.770 bytes em toda página, os 851 bytes do registro (706 na primeira versão; a lista de novo no `controllerchange`, § 307, somou o resto). O critério não vale ao pé da letra: os 2 arquivos JS das páginas de ferramenta crescem de 2,3 a 3,1 KB (de 0,5 a 0,9 KB em gzip), pela entrega da caixa à ilha e pela fala offline, que a ficha pede nas decisões 4 e 10 (o e-7 da revisão final, no `PENDENCIAS.md`).
- A "Abrir com" carrega 2 arquivos JS (a entrada e o chunk `sniff`).

## O Lighthouse

Celular, mediana de 3 execuções, na parte `--sem-playwright` do `verificar` local no código final. Os limiares não mudaram (desempenho ≥ 0,9 e CLS ≤ 0,05 reprovam; o resto avisa).

| URL | Desempenho | Acessibilidade | Boas práticas | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/compress-image/` | 100 | 100 | 100 | 100 | 1,28 s | 1,67 s | 0 ms | 0,000 |
| `/compress-pdf/` | 99 | 100 | 100 | 100 | 1,35 s | 1,80 s | 0 ms | 0,000 |
| `/guides/15-vs-30-year-mortgage/` | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,000 |
| `/guides/why-is-my-pdf-so-large/` | 99 | 100 | 100 | 100 | 1,44 s | 1,89 s | 0 ms | 0,000 |
| `/image-tools/` | 100 | 100 | 100 | 100 | 1,05 s | 1,35 s | 0 ms | 0,000 |
| `/mortgage-calculator/` | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,001 |
| `/pdf-tools/` | 100 | 100 | 100 | 100 | 1,05 s | 1,35 s | 0 ms | 0,000 |
| `/pt/apoie/` | 100 | 100 | 100 | 100 | 1,14 s | 1,59 s | 0 ms | 0,000 |
| `/pt/simulador-sac-price/` | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,001 |
| `/qr-code-generator/` | 100 | 100 | 100 | 100 | 1,13 s | 1,51 s | 0 ms | 0,000 |

O CLS chegou a 0,095 a 0,100 em 6 das 10 URLs no `2f104be`, pelo aviso de cookies que crescia quando a Figtree chegava (§ 305); com o aviso na face que não troca, voltou a 0,000 a 0,001.

## O CI

15 partes, cada uma com o limite de 900 s e o alvo de 700 s (§ 302): o `verificar` (`--sem-playwright`), o Chromium em 4 e o WebKit em 10. O job `alerta-dependabot` vem depois de todas. O total é o do resumo do `verificar` em cada log.

| Parte | F7, [41465872919](https://github.com/vmatusita/fileorca/actions/runs/41465872919) | `9dde35e`, [41527759079](https://github.com/vmatusita/fileorca/actions/runs/41527759079) | `7f99892`, [41544109691](https://github.com/vmatusita/fileorca/actions/runs/41544109691) | `c999692`, [41548317129](https://github.com/vmatusita/fileorca/actions/runs/41548317129) |
| --- | ---: | ---: | ---: | ---: |
| verificar | 680,5 s | 693,3 s | 680,7 s | 674,8 s |
| chromium 1 de 4 | 471 s | 756,9 s | 366,2 s | 561,6 s |
| chromium 2 de 4 | 349 s | 357,3 s | 503,7 s | 394,4 s |
| chromium 3 de 4 | 418 s | 337,4 s | 431,2 s | 465,2 s |
| chromium 4 de 4 | 478 s | 590,6 s | 596,3 s | 436,5 s |
| webkit 1 de 10 | — | 350,8 s | 475,7 s | 454,1 s |
| webkit 2 de 10 | — | 540,9 s | 560,8 s | 561,4 s |
| webkit 3 de 10 | — | 460,1 s | 356,0 s | 446,7 s |
| webkit 4 de 10 | — | 220,1 s | 485,1 s | 375,2 s |
| webkit 5 de 10 | — | 240,0 s | 292,2 s | 305,5 s |
| webkit 6 de 10 | — | 231,5 s | 233,7 s | 215,4 s |
| webkit 7 de 10 | — | 625,9 s | 621,9 s | 522,2 s |
| webkit 8 de 10 | — | 364,5 s | 239,6 s | 275,4 s |
| webkit 9 de 10 | — | 492,1 s | 645,1 s | 663,3 s |
| webkit 10 de 10 | — | 297,1 s | 283,0 s | 376,7 s |

Na F7, o WebKit tinha 8 partes: 576, 601, 384, 309, 218, 664, 730 e 355 s. As três execuções da F8 acima estão todas verdes; o `9dde35e` teve a parte 1 do Chromium em 756,9 s, acima do alvo, o que levou à mudança do c-4 (§ 307). No `c999692`, a pior parte é o `verificar`, com 674,8 s.

**Onde o `--list` pôs os specs novos:** os do worker e do compartilhar (`sw-offline`, `sw-privacy`, `sw-killswitch`, `share-target`) caem na parte 4 do Chromium e na 10 do WebKit; o `layout-shift` na 3 do Chromium e nas 7 e 8 do WebKit; o `axe-pdf-states` na 2 do Chromium e na 4 do WebKit. O `design.spec.ts` fica nas partes 5 e 6 do WebKit e o `image-matrix.spec.ts` na 7 (§ 142).

**O que mudou no caminho:**

- No `2f104be`, três partes caíram: o Lighthouse (o aviso de cookies), a 3 do Chromium (o `layout-shift.spec.ts` no Linux) e a 6 do WebKit (o reflow a 320 px, que passou dos 60 s de um teste ao somar 6 páginas). As três correções estão nas § 305 e § 306.
- A parte 2 do WebKit passou do alvo uma vez (721,5 s) e a 1 do Chromium outra (756,9 s). Os 36 passeios de estados de PDF saíram do `a11y.spec.ts` para um spec próprio (§ 307), e a parte 1 do Chromium caiu para 366,2 s.

## A revisão final

Tudo em [`REVISAO-F8.md`](REVISAO-F8.md). Cinco lentes Sonnet sobre o `2f104be`:

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) privacidade e segurança do worker e do compartilhar | 1 | 1 | 1 | 1 |
| (b) corretude do offline e da atualização | 1 | 3 | 5 | 1 |
| (c) operação | 2 | 3 | 4 | 1 |
| (d) acessibilidade, design e voz | — | 2 | 5 | — |
| (e) desempenho | 3 | 1 | 3 | 1 |
| **Total depois dos céticos** | **7** | **10** | **18** | **4** |

Os 7 altos são 4 defeitos: três já tinham caído no CI da PR (o aviso de cookies no Lighthouse, o `layout-shift.spec.ts` no Linux e o reflow), e o quarto é o b-1 (a página do deploy não ficava no cache novo). O a-1 (sem worker, o compartilhar do app instalado sobe até o fileorca.com) ficou corrigido no texto da Privacidade, da "Abrir com" e do `OPERACAO.md`; manter um worker de plantão na desativação muda a decisão 7 da ficha e é do Victor. Os médios locais foram corrigidos, cada um com um teste que reprova no `2f104be` (§ 307). A segunda passada achou 1 médio e 3 baixos no diff das correções: o `controllerchange` mandava a lista duas vezes, o teste da fonte atrasada precisava dizer o que prova (e o CLS do texto fora do Windows virou a pendência F8 s-2), o parágrafo da Privacidade se contradizia, e o teste da ida e volta da desativação falhava em 20 a 30 % das vezes. Os quatro foram tratados.

## `pnpm verificar` local

O `pnpm verificar` inteiro passa de 900 s nesta máquina (§ 242). Como a ficha manda, rodei as 15 partes do CI em sequência, depois de uma instalação limpa, no commit final do código (`c999692`). As 15 passaram, com saída 0, e somam 1708,8 s de verificar (1.716 s de relógio com a instalação). O script é `.cache/f8/run-parts.sh`, e os logs ficam em `.cache/f8/local/`.

```
$ CI=true pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 576ms using pnpm v10.34.9
(saída 0)
```

```
$ pnpm verificar --sem-playwright
  (vitest) Test Files  92 passed (92) · Tests  1514 passed (1514)
  prontidão: ok, 21 itens
  design: ok, 168 páginas e 1 CSS conferidos
  lint:texto: 20 arquivo(s), 1072 textos, 0 erro(s) de gramática, 447 aviso(s)
Resumo do pnpm verificar (sem o Playwright)
  ok       9.5 s  tipos (astro check)
  ok       4.2 s  lint (eslint)
  ok      25.5 s  build (astro build do zero)
  ok      32.2 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.7 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.8 s  links internos e páginas órfãs
  ok       1.2 s  conteúdo mínimo das ferramentas e do site
  ok      52.6 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.4 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.4 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     340.7 s  lighthouse ci
  ok      10.8 s  lint:texto (LanguageTool)
  total 486.8 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=chromium --shard=1/4
  302 passed (1.3m)
Resumo do pnpm verificar (Playwright no chromium, parte 1 de 4)
  ok      24.3 s  build (astro build do zero)
  ok      77.5 s  playwright (chromium, parte 1 de 4, axe, anúncios, orçamentos)
  total 101.9 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=chromium --shard=2/4
  302 passed (1.7m)
Resumo do pnpm verificar (Playwright no chromium, parte 2 de 4)
  ok      24.3 s  build (astro build do zero)
  ok     104.2 s  playwright (chromium, parte 2 de 4, axe, anúncios, orçamentos)
  total 128.6 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=chromium --shard=3/4
  302 passed (1.4m)
Resumo do pnpm verificar (Playwright no chromium, parte 3 de 4)
  ok      24.4 s  build (astro build do zero)
  ok      84.8 s  playwright (chromium, parte 3 de 4, axe, anúncios, orçamentos)
  total 109.3 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=chromium --shard=4/4
  301 passed (1.3m)
Resumo do pnpm verificar (Playwright no chromium, parte 4 de 4)
  ok      23.7 s  build (astro build do zero)
  ok      79.2 s  playwright (chromium, parte 4 de 4, axe, anúncios, orçamentos)
  total 103.0 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=1/10
  121 passed (43.8s)
Resumo do pnpm verificar (Playwright no webkit, parte 1 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      44.3 s  playwright (webkit, parte 1 de 10, axe, anúncios, orçamentos)
  total 68.0 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=2/10
  121 passed (56.9s)
Resumo do pnpm verificar (Playwright no webkit, parte 2 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      57.5 s  playwright (webkit, parte 2 de 10, axe, anúncios, orçamentos)
  total 81.1 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=3/10
  121 passed (54.6s)
Resumo do pnpm verificar (Playwright no webkit, parte 3 de 10)
  ok      23.7 s  build (astro build do zero)
  ok      55.1 s  playwright (webkit, parte 3 de 10, axe, anúncios, orçamentos)
  total 78.9 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=4/10
  121 passed (1.0m)
Resumo do pnpm verificar (Playwright no webkit, parte 4 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      61.1 s  playwright (webkit, parte 4 de 10, axe, anúncios, orçamentos)
  total 84.8 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=5/10
  121 passed (46.8s)
Resumo do pnpm verificar (Playwright no webkit, parte 5 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      47.4 s  playwright (webkit, parte 5 de 10, axe, anúncios, orçamentos)
  total 71.1 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=6/10
  121 passed (36.4s)
Resumo do pnpm verificar (Playwright no webkit, parte 6 de 10)
  ok      23.8 s  build (astro build do zero)
  ok      37.0 s  playwright (webkit, parte 6 de 10, axe, anúncios, orçamentos)
  total 60.8 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=7/10
  121 passed (1.1m)
Resumo do pnpm verificar (Playwright no webkit, parte 7 de 10)
  ok      23.7 s  build (astro build do zero)
  ok      68.9 s  playwright (webkit, parte 7 de 10, axe, anúncios, orçamentos)
  total 92.7 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=8/10
  120 passed (43.3s)
Resumo do pnpm verificar (Playwright no webkit, parte 8 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      43.9 s  playwright (webkit, parte 8 de 10, axe, anúncios, orçamentos)
  total 67.6 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=9/10
  120 passed (1.3m)
Resumo do pnpm verificar (Playwright no webkit, parte 9 de 10)
  ok      23.5 s  build (astro build do zero)
  ok      79.6 s  playwright (webkit, parte 9 de 10, axe, anúncios, orçamentos)
  total 103.1 s (limite 900 s)
(saída 0)
```

```
$ pnpm verificar --playwright=webkit --shard=10/10
  120 passed (46.8s)
Resumo do pnpm verificar (Playwright no webkit, parte 10 de 10)
  ok      23.6 s  build (astro build do zero)
  ok      47.4 s  playwright (webkit, parte 10 de 10, axe, anúncios, orçamentos)
  total 71.1 s (limite 900 s)
(saída 0)
```

Os `--check` dos oráculos, no código final:

```
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc.py --check
igual: mortgage-calculator.json (296 casos)
igual: personal-loan-calculator.json (223 casos)
igual: auto-loan-calculator.json (199 casos)
igual: refinance-calculator.json (247 casos)
igual: home-affordability-calculator.json (212 casos)
igual: loan-amortization-calculator.json (153 casos)
igual: compound-interest-calculator.json (345 casos)
igual: credit-card-payoff-calculator.json (209 casos)
igual: debt-payoff-calculator.json (81 casos)
igual: rent-vs-buy-calculator.json (136 casos)
igual: mortgage-calculator-extra-payments.json (82 casos)
igual: mortgage-calculator-biweekly.json (78 casos)
igual: mortgage-calculator-15-vs-30-year.json (84 casos)
igual: loan-amortization-calculator-balloon-payment.json (103 casos)
igual: savings-goal-calculator.json (190 casos)
igual: debt-consolidation-calculator.json (71 casos)
igual: simple-interest-calculator.json (146 casos)
igual: apr-to-apy-calculator.json (184 casos)

$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py --check
igual: br-sac-price.json (212 casos)
igual: br-vehicle-loan.json (174 casos)
igual: br-personal-loan.json (139 casos)
igual: br-early-payoff.json (245 casos)
igual: br-credit-card.json (265 casos)
igual: br-debt-payoff.json (74 casos)
igual: br-compound-interest.json (173 casos)
igual: br-rent-or-buy.json (110 casos)

$ uv run --no-project --python 3.13 python -I scripts/oracle/calc_home_health.py --check
igual: square-footage-calculator.json (154 casos)
igual: concrete-calculator.json (172 casos)
igual: mulch-calculator.json (264 casos)
igual: paint-calculator.json (209 casos)
igual: tile-calculator.json (245 casos)
igual: btu-calculator.json (452 casos)
igual: bmi-calculator.json (149 casos)
igual: calorie-calculator.json (134 casos)
igual: ovulation-calculator.json (139 casos)
igual: body-fat-calculator.json (187 casos)
igual: due-date-calculator.json (327 casos)

$ uv run --no-project --python 3.13 python -I scripts/oracle/pix.py --check
fixtures/pix.json: 4 codes match the oracle (and the manual example)
```

O `pnpm guias:medir --check`, porque o `report.ts` e o `pdfjs.ts` mudaram: `guias:medir --check: 0 difference(s) in 305.3 s`.

## A prévia

[https://fase-08-fileorca.vmatusita.workers.dev](https://fase-08-fileorca.vmatusita.workers.dev), no commit final do código (`c999692`: o `build.txt` da prévia confere). O que eu conferi nela com uma sonda do Playwright no Chromium (`.cache/f8/previa-check.mjs`), com o worker liberado, os domínios do Google bloqueados e sem escolha de cookies:

```
build.txt: c99969227d214d9cd9275e9e91a887001a7ccc78
/sw.js: 200 · Cache-Control: no-cache · ligado · versão c99969227d214d9cd9275e9e91a887001a7ccc78
manifest-en: id / · start_url / · share_target POST /open-with/ (13 tipos e extensões)
manifest-pt: id /pt/ · start_url /pt/ · share_target POST /pt/abrir-com/ (13 tipos e extensões)
manifest-es: id /es/ · start_url /es/ · share_target POST /es/abrir-con/ (13 tipos e extensões)
360px /compress-image/ com rede: 200 · controlada pelo worker · resultado na tela · 16 chaves no cache (1 .wasm, 2 páginas)
360px /compress-image/ sem rede: 200 · do worker: true · outro arquivo processado
360px /pt/girar-pdf/ sem rede, nunca visitada: 200 · do worker: true · h1 "You're offline" · buoy: 1 · guardadas: Compress image online, free, no upload
360px /open-with/ sem arquivos: "Nothing to open here yet." · hubs: 2
1280px /compress-image/ com rede: 200 · controlada pelo worker · resultado na tela · 16 chaves no cache (1 .wasm, 2 páginas)
1280px /compress-image/ sem rede: 200 · do worker: true · outro arquivo processado
1280px /pt/girar-pdf/ sem rede, nunca visitada: 200 · do worker: true · h1 "You're offline" · buoy: 1 · guardadas: Compress image online, free, no upload
1280px /open-with/ sem arquivos: "Nothing to open here yet." · hubs: 2
```

- **O `/sw.js`** responde com `no-cache` e está ligado, na versão do `build.txt`.
- **Os três manifests** trazem o `id` igual ao `start_url` e o `share_target` da "Abrir com" do idioma.
- **O Compress image** usado uma vez com rede volta sem rede, vindo do worker, e processa outro arquivo.
- **Uma página nunca visitada,** sem rede, mostra a página offline com a `buoy` e a lista das guardadas. A da `/pt/girar-pdf/` vem em inglês porque só a página offline do idioma visitado foi guardada (decisão 8: vale a de outro idioma que estiver guardada).
- **A "Abrir com"** sem arquivos explica e leva aos dois hubs.
- Antes, no `a93f30e`, um POST em `/open-with/` sem o worker recebeu 405 do Cloudflare, como o `serve-dist` passou a imitar. Uma vez, durante a troca da prévia para o `c999692`, o `/build.txt` respondeu o erro 1101 do Cloudflare; repetido logo depois, todas as páginas responderam 200.

## Decisões novas

Do § 284 ao § 307 do `DECISOES.md`:

- § 284: a abertura (o prompt e a prova do aviso de deploy);
- § 285 a § 294: o service worker (a estratégia, a chave, o arquivo e o registro, a desativação, a página offline, o compartilhar, o manifest, a fala offline, a troca de versão e os testes);
- § 295: nenhum evento novo no GA4;
- § 296: o leitor de YAML dos testes;
- § 297 a § 301: os eventos de merge, o `dependabot.yml`, o ensaio, o alerta do Dependabot e as issues atribuídas;
- § 302: o WebKit em 10 partes;
- § 303 e § 304: o `OPERACAO.md` e o `PENDENCIAS.md`;
- § 305: as correções da revisão das F4 a F7 (a trilha e o aviso de cookies na `Figtree Steady`);
- § 306: o reflow a 320 px em blocos de páginas;
- § 307: as correções da revisão final.

## O que a válvula cortou

Nada. Ficou para o Victor o que a ficha já dizia ser dele (o merge, o aparelho Android, o iPhone, o UptimeRobot e as configurações do GitHub) e uma decisão nova, a do a-1.

## O que é do Victor, em passos

1. **O merge.** Conferir o diff do `.github/` (`git diff origin/main...fase-08 -- .github/`: o `dependabot.yml` novo, o WebKit em 10 partes, o job `alerta-dependabot` e o `--assignee` nas issues do `ci.yml` e do `pos-deploy.yml`) e dar o merge pela página da PR (squash, apagando a branch). Depois, conferir o pós-deploy e o `build.txt` de produção.
2. **A issue de teste.** Conferir que o e-mail das issues [#16](https://github.com/vmatusita/fileorca/issues/16) e [#17](https://github.com/vmatusita/fileorca/issues/17) chegou e fechá-las. Se não chegou, ajustar as notificações do GitHub (o repositório em "Watching", o e-mail ligado).
3. **O UptimeRobot.** Criar o monitor HTTPS de fileorca.com a cada 5 minutos, com alerta para o Gmail da marca.
4. **O Dependabot, logo depois do merge.**
   - Conferir em Insights → Dependency graph → Dependabot que o arquivo foi aceito sem erro.
   - Acompanhar a primeira leva de PRs e os minutos do Actions.
   - A PR de minor e patch tem de se mesclar sozinha. As de major e as de GitHub Actions esperam por você. Depois da PR do grupo com o PDF.js 6.5, rodar o passo do core-js do `OPERACAO.md`.
5. **No celular Android,** na produção:
   - instalar o site e visitar uma ferramenta;
   - usar a ferramenta com rede e depois sem rede;
   - compartilhar uma foto da galeria com o FileOrca e escolher uma ferramenta na "Abrir com".
6. **No iPhone:** o offline no Safari. O iOS não tem o compartilhar.
7. **O `docs/OPERACAO.md`.** Ler uma vez e marcar a revisão mensal na agenda.
8. **A decisão do a-1** (`PENDENCIAS.md`, grupo 14, F8 a-1): se a desativação de emergência deve manter por uns 30 dias um worker que só responde ao compartilhar, para o app instalado nunca mandar arquivos ao servidor nessa janela. Hoje a Privacidade diz a condição.
9. **As pendências:** o [`docs/PENDENCIAS.md`](../PENDENCIAS.md).
10. **Opcional:** ligar as atualizações de segurança do Dependabot nas configurações do repositório.
