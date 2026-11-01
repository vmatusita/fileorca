# Ajuste · WebKit do CI em três partes: relatório

Branch `ajuste-ci-webkit-tres`, PR [vmatusita/fileorca#9](https://github.com/vmatusita/fileorca/pull/9). Prompt: `docs/prompts/prompt-ajuste-ci-webkit-tres.txt` (com o `.md` que o acompanha). Decisão: ADR-003 (adendo de 31/out/2026) e DECISOES § 108. Run de 31/out/2026, a partir da `main` em `60f84da`.

## Resumo

O WebKit do CI passou de duas para três partes, antes da F4. O CI agora tem cinco partes, cada uma num job com o limite de 900 s:

- `verificar`;
- `playwright (chromium)`;
- `playwright (webkit 1 de 3)`, `playwright (webkit 2 de 3)` e `playwright (webkit 3 de 3)`.

O `merge` continua esperando todas.

O CI da PR passou nas cinco partes nas duas execuções medidas. A parte mais lenta foi de 644,4 s, na F3, para 567,3 s e 583,9 s, e todas ficaram abaixo do alvo de 700 s. A parte 3 do WebKit ficou com a matriz de fixtures e segue a mais pesada.

Nenhum teste, portão, limiar, timeout, `retries` ou número de workers mudou.

Na primeira execução, o disco da parte 2 do WebKit caiu a 609 MB livres sem falhar nenhum teste. No rerun isso não se repetiu. Fica registrado como risco (§ 108).

Prévia do Cloudflare (commit `a6f7a22`): https://ajuste-ci-webkit-tres-fileorca.vmatusita.workers.dev.

## O que mudou

- **`.github/workflows/ci.yml`:**
  - A matriz do job `playwright` passou de três entradas para quatro.
  - O `chromium` ficou igual.
  - As entradas do WebKit agora são `webkit 1 de 3`, `webkit 2 de 3` e `webkit 3 de 3`, com `args` igual a `--playwright=webkit --shard=1/3`, `2/3` e `3/3`.
  - O comentário do topo diz "WebKit in three shards".
  - Nada mais no arquivo mudou.
- **`docs/adr/ADR-003-playwright-em-partes-no-ci.md`:** um adendo datado no fim, com os tempos de antes e de depois.
- **`DECISOES.md`:** § 108.
- **`CLAUDE.md`:** seção nova no fim, "Ajuste: WebKit em três partes". Ela substitui a descrição das partes da seção "Ajuste: CI em partes (ADR-003)", que ficou como estava, e traz três pegadinhas.
- **Este relatório e o prompt da run** (`docs/prompts/prompt-ajuste-ci-webkit-tres.md` e `.txt`, sem edição, no primeiro commit).

Nenhum teste ou script lê a matriz do `ci.yml`, então nenhum mudou. O `tests/unit/verificar.test.ts` tem a própria lista das partes, escrita à mão com `1/2` e `2/2`, e não lê o workflow. Ficou como está, como a ficha manda. A asserção de cobertura tira o `--shard` antes de comparar, então segue provando que as partes cobrem o todo para qualquer número de partes (§ 108).

O `scripts/verificar.ts` não mudou: o `plan()` já aceita as três partes. Conferido aqui, chamando a função:

```text
Playwright no webkit, parte 1 de 3: pnpm run build && pnpm run e2e --project=webkit --shard=1/3
Playwright no webkit, parte 2 de 3: pnpm run build && pnpm run e2e --project=webkit --shard=2/3
Playwright no webkit, parte 3 de 3: pnpm run build && pnpm run e2e --project=webkit --shard=3/3
```

## Critério 1: actionlint

```text
$ pnpm gate:actionlint

> fileorca@0.0.0 gate:actionlint C:\Users\vmatusita\projetos\fileorca
> node scripts/gates/actionlint.ts

actionlint 1.7.12 com shellcheck 0.11.0: ok, .github/workflows/ci.yml e .github/workflows/pos-deploy.yml sem erro
```

## Critério 2: a divisão das partes

A última linha de cada `--list`:

```text
$ pnpm exec playwright test --project=webkit --shard=1/3 --list
Total: 90 tests in 3 files
$ pnpm exec playwright test --project=webkit --shard=2/3 --list
Total: 89 tests in 7 files
$ pnpm exec playwright test --project=webkit --shard=3/3 --list
Total: 89 tests in 12 files
$ pnpm exec playwright test --project=webkit --list
Total: 268 tests in 20 files
```

90 + 89 + 89 = 268. A revisão em contexto limpo comparou as listas completas: a união das três partes é igual à lista do total, sem teste repetido nem faltando.

O que cai em cada parte (testes por arquivo):

| Parte | Arquivos |
| --- | --- |
| 1 de 3 | `a11y` 46, `ads` 26, `budgets` 18 |
| 2 de 3 | `budgets` 3, `coffee` 14, `consent` 8, `consent-choice` 6, `cookie-footer` 6, `design` 50, `engine-paths` 2 |
| 3 de 3 | `engine-paths` 2, `events` 9, `image-batch` 6, `image-crop` 2, `image-matrix` 18, `image-presets` 3, `image-privacy` 5, `image-smoke` 11, `island` 10, `launch-claims` 3, `navigation` 10, `tool` 10 |

Antes, as duas partes tinham 134 testes cada. O `--shard` divide por contagem de testes, na ordem dos arquivos, e não por tempo. Por isso a parte 3 fica com a matriz inteira e com o `image-smoke`, que são o grosso do tempo da antiga parte 2 de 2.

## Critério 3: `pnpm verificar` local

Windows 11, AMD Ryzen 5 7600X, Node 26.8.1 (o CI usa o 24.22.2 do `.node-version`) e pnpm 10.34.9, no commit `a6f7a22`. O `verificar` apagou o `dist/` e buildou do zero. Vitest: `Test Files 48 passed (48)` e `Tests 778 passed (778)`. Playwright: `536 passed (2.5m)`, ou 268 por navegador. A saída completa está em `.cache/ajuste-ci-webkit-tres/verificar.log`.

```text
Resumo do pnpm verificar (tudo)
  ok       7.2 s  tipos (astro check)
  ok       2.3 s  lint (eslint)
  ok       8.2 s  build (astro build do zero)
  ok       5.1 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.5 s  links internos e páginas órfãs
  ok       0.5 s  conteúdo mínimo das ferramentas e do site
  ok      17.2 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.4 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.3 s  actionlint
  ok     151.9 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      71.8 s  lighthouse ci
  ok       0.4 s  lint:texto (LanguageTool)
  total 272.8 s (limite 900 s)
verificar exit 0
```

## Critério 4: o CI da PR nas cinco partes

Execução [41250641460](https://github.com/vmatusita/fileorca/actions/runs/41250641460), no commit `a6f7a22`, o único com mudança no `ci.yml`. A segunda medida é a tentativa 2 da mesma execução (`gh run rerun 41250641460`). Os tempos da coluna "Total do `verificar`" saem da linha `total` do resumo no log (`gh run view 41250641460 --attempt <n> --log`). A coluna "Job" é a duração do job, do `startedAt` ao `completedAt`.

### Tentativa 1

| Parte | Testes | Playwright | Total do `verificar` | Job |
| --- | ---: | ---: | ---: | ---: |
| `verificar` (`--sem-playwright`) | Vitest 778 | — | 137,7 s | 206 s |
| `playwright (chromium)` | 268 passed | 376,3 s | 404,3 s | 471 s |
| `playwright (webkit 1 de 3)` | 90 passed | 161,7 s | 186,5 s | 267 s |
| `playwright (webkit 2 de 3)` | 89 passed | 221,3 s | 250,4 s | 405 s |
| `playwright (webkit 3 de 3)` | 89 passed | 539,6 s | 567,3 s | 654 s |
| `merge` | — | — | — | 15 s |

```text
playwright (webkit 3 de 3) | Resumo do pnpm verificar (Playwright no webkit, parte 3 de 3)
playwright (webkit 3 de 3) |   ok       7.1 s  build (astro build do zero)
playwright (webkit 3 de 3) |   ok     539.6 s  playwright (webkit, parte 3 de 3, axe, anúncios, orçamentos)
playwright (webkit 3 de 3) |   total 567.3 s (limite 900 s)
```

### Tentativa 2

| Parte | Testes | Playwright | Total do `verificar` | Job |
| --- | ---: | ---: | ---: | ---: |
| `verificar` (`--sem-playwright`) | Vitest 778 | — | 176,8 s | 354 s |
| `playwright (chromium)` | 268 passed | 367,8 s | 395,7 s | 474 s |
| `playwright (webkit 1 de 3)` | 90 passed | 268,0 s | 296,2 s | 557 s |
| `playwright (webkit 2 de 3)` | 89 passed | 172,7 s | 200,9 s | 591 s |
| `playwright (webkit 3 de 3)` | 89 passed | 555,9 s | 583,9 s | 737 s |
| `merge` | — | — | — | 14 s |

```text
playwright (webkit 3 de 3) | Resumo do pnpm verificar (Playwright no webkit, parte 3 de 3)
playwright (webkit 3 de 3) |   ok     555.9 s  playwright (webkit, parte 3 de 3, axe, anúncios, orçamentos)
playwright (webkit 3 de 3) |   total 583.9 s (limite 900 s)
```

Na tentativa 2, os jobs ficaram bem mais longos que o `verificar` deles por causa do passo `pnpm exec playwright install --with-deps`. O apt do runner estava lento, e o passo levou 145 s no job `verificar`, 223 s no WebKit 1, 356 s no WebKit 2 e 117 s no WebKit 3. Na tentativa 1, o mesmo passo levou de 27 a 110 s. Esse tempo fica fora do `verificar` e do limite de 900 s, e o job tem `timeout-minutes: 30`, que não mudou.

## Critério 5: os tempos, antes e depois

O total do `verificar` de cada parte. O alvo é toda parte abaixo de 700 s, e o limite é 900 s.

| Parte | F3, run 41236243545 (duas partes) | Tentativa 1 | Tentativa 2 |
| --- | ---: | ---: | ---: |
| `verificar` | 201,5 s | 137,7 s | 176,8 s |
| Chromium | 315,2 s | 404,3 s | 395,7 s |
| WebKit 1 de 2 | 375,8 s | — | — |
| WebKit 2 de 2 | 644,4 s | — | — |
| WebKit 1 de 3 | — | 186,5 s | 296,2 s |
| WebKit 2 de 3 | — | 250,4 s | 200,9 s |
| WebKit 3 de 3 | — | 567,3 s | 583,9 s |
| Parte mais lenta | 644,4 s | 567,3 s | 583,9 s |

Nenhuma parte passou de 700 s em nenhuma das duas execuções, então não há proposta de quarta parte.

Leitura:

- A parte mais lenta caiu uns 60 a 77 s, e a folga dela para o alvo foi de uns 56 s para 116 a 133 s.
- A parte 3 tem de 2 a 3 vezes o tempo das outras duas partes do WebKit. Ela ficou com a matriz, que a divisão por contagem não separa.
- O Chromium, que não mudou, foi de 315,2 s na F3 para 395,7 a 404,3 s. Isso fica um pouco acima da faixa que a § 105 mediu (312,5 a 391,0 s), mas dentro da variação de 30 a 40% do runner (§ 88 e § 105).
- Quando a F4 somar testes no começo da lista (o `a11y` é o primeiro arquivo), cada parte cresce um terço deles em contagem. Os testes novos ficam nas primeiras partes, e a parte 3 recebe, além da matriz, o fim do `design.spec.ts` que hoje está na parte 2. Antes de juntar muitos testes, vale rodar o `--list` das três partes (CLAUDE.md, seção nova).

## Critério 6: o comentário do job `merge`

O job `merge` comentou uma vez em cada tentativa, com o mesmo texto:

> Merge automático: não. A PR mexe em .github/workflows/, então o merge fica para o Victor.

São os comentários [6550414510](https://github.com/vmatusita/fileorca/pull/9#issuecomment-6550414510) (tentativa 1, 23:11:31 UTC) e [6550551545](https://github.com/vmatusita/fileorca/pull/9#issuecomment-6550551545) (tentativa 2, 23:25:07 UTC). Nas duas tentativas, o `pos-deploy` saiu como `skipped`, porque não houve merge.

## Critério 7: os arquivos da PR

```text
$ git diff --stat origin/main...HEAD
 .github/workflows/ci.yml                       |  13 +-
 CLAUDE.md                                      |  12 ++
 DECISOES.md                                    |  29 +++
 docs/adr/ADR-003-playwright-em-partes-no-ci.md |  16 ++
 docs/prompts/prompt-ajuste-ci-webkit-tres.md   | 160 ++++++++++++++++
 docs/prompts/prompt-ajuste-ci-webkit-tres.txt  | 127 ++++++++++++
 docs/relatorios/ajuste-ci-webkit-tres.md       | 256 +++++++++++++++++++++++++
 7 files changed, 608 insertions(+), 5 deletions(-)
```

Só o `ci.yml`, o `DECISOES.md`, a ADR-003, o `CLAUDE.md`, este relatório e os dois arquivos do prompt. Nenhum teste ou script mudou, porque nenhum lê a matriz do `ci.yml`. Os arquivos `docs/prompts/prompt-fase-04.md` e `.txt`, da próxima run, seguem fora do Git e no mesmo lugar.

## Revisão antes do primeiro push

A ficha pede um subagente Sonnet em contexto limpo conferindo o diff do `ci.yml` contra ela. Rodaram duas lentes Sonnet sobre o commit `a6f7a22`, só de leitura:

- **requisitos:** a matriz, o comentário, o `merge` e o que a ficha diz para não mexer;
- **pipeline:** as expressões da matriz, o nome único do artefato `playwright-report-<n>`, o `needs` do `merge`, o `pode-mesclar.ts`, o `pos-deploy.yml`, o `plan()` do `verificar.ts` com `3/3` e a união das listas do `--shard`.

Para cada achado, um cético Sonnet próprio tentou refutá-lo.

Nenhuma lente achou lacuna de requisito ou de correção. Houve um achado baixo: a parte 3 fica com o peso da matriz, e o ganho pode ser menor do que a média sugere. O cético o refutou como lacuna, porque ele não pede mudança no YAML e a ficha já trata o caso de uma parte acima de 700 s. A sugestão de registrar que o `--shard` divide por contagem entrou neste relatório e na § 108. As lentes também conferiram, por `GET`, que a `main` não tem proteção de branch nem ruleset, então nenhum check obrigatório usa o nome antigo das partes.

## Risco registrado: o disco da parte 2 do WebKit

Na tentativa 1, o diagnóstico de disco do `verificar` mostrou o `/` da parte 2 de 3 caindo de 10 897 MB livres às 23:04:44 para 609 MB às 23:05:44. A queda veio em três degraus, de 2958, 4003 e 3327 MB, numa janela de 60 s do `design.spec.ts`. A janela começa nos testes "Oli boxes a 1280×800", que terminaram às 23:05:06 com 7939 MB livres, e segue pelos de "prefers-reduced-motion: reduce", "motion without the preference" e "review regressions":

```text
[disco] 23:04:44 / usado 62412 MB, livre 10897 MB | ...
[disco] 23:05:05 / usado 65370 MB, livre 7939 MB | ...
[disco] 23:05:24 / usado 69374 MB, livre 3936 MB | ...
[disco] 23:05:44 / usado 72700 MB, livre 609 MB | ...
[disco] fim: / usado 72700 MB, livre 609 MB | ...
```

- Os 89 testes passaram, e o espaço não voltou até o fim.
- O `du` das pastas que o diagnóstico mede deu uns 2,5 GB no total: `/home/runner` 1647 MB e o projeto 876 MB.
- O `find / -xdev -type f -size +200M` não achou nenhum arquivo. O espaço está num lugar que o diagnóstico não enxerga, talvez arquivos apagados que algum processo ainda segura abertos.
- O log da parte não tem nenhuma linha de erro ou queda do WebKit.

É a mesma spec da § 90 (o `design.spec.ts`, que começa pela Oli animada a 1280 px), onde a queda tinha levado ao `ENOSPC`.

- Na tentativa 2, a mesma parte ficou o tempo todo com uns 10,9 GB livres.
- Na F3 (41236243545) e em quatro execuções recentes com duas partes (41231605642, 41237303682, 41240391852 e 41241805727), nenhuma parte desceu de 9,7 GB livres.

A queda é intermitente, e esta é a primeira vez que ela aparece depois da § 90. Não houve contorno.

Achar a causa pede mudar o diagnóstico (`scripts/lib/disco.ts`, por exemplo com `lsof +L1` e as pastas fora de `$HOME`), e isso fica fora desta ficha. Proposta para um ajuste próprio: ampliar o diagnóstico e medir de novo a parte 2.

## Decisão nova

**§ 108 · O WebKit do CI em três partes.** A matriz do job `playwright` passa a `chromium` e `webkit 1, 2 e 3 de 3` (`--shard=i/3`), e o CI fica com cinco partes de 900 s cada, com o `merge` esperando todas.

- O `verificar.ts` e o `verificar.test.ts` ficam como estão: o primeiro já aceita `3/3`, e o segundo não lê o `ci.yml`.
- A divisão é 90, 89 e 89 testes.
- A parte mais lenta caiu de 644,4 s para 567,3 s e 583,9 s.
- A queda de disco da parte 2 na tentativa 1 fica registrada como risco.
- Alternativas: mover a matriz para um projeto só dela, ou uma quarta parte por contagem.

O texto inteiro está no `DECISOES.md`.

## O que é do Victor

1. Conferir as cinco partes verdes na PR [vmatusita/fileorca#9](https://github.com/vmatusita/fileorca/pull/9).
2. Dar o merge pelo GitHub, com "Squash and merge", e apagar a branch.
3. Conferir o pós-deploy com `gh run list --workflow pos-deploy.yml --limit 1`.
4. Rodar `git switch main` e `git pull --ff-only` antes da F4.

O push do commit final (só documentos) faz o CI rodar de novo. Esta run não esperou essa última execução, como a ficha permite.
