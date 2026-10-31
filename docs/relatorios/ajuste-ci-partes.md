# Ajuste · CI em partes (ADR-003): relatório

Branch `ajuste-ci-partes`, PR [vmatusita/fileorca#6](https://github.com/vmatusita/fileorca/pull/6). Prompt: `docs/prompts/prompt-ajuste-ci-partes.md`. Decisão: `docs/adr/ADR-003-playwright-em-partes-no-ci.md` (Aceita). Run de 31/out/2026.

## Resumo

O Victor aceitou a ADR-003 depois da run F2. Nela, os 496 testes passavam, mas o `verificar` do CI levava de 1283 a 1645 s num job só de 2 vCPU, e o limite é 900 s.

Agora o CI roda o `pnpm verificar` em quatro partes, em runners próprios e ao mesmo tempo, cada uma com o limite de 900 s:

- os portões sem o Playwright;
- o Playwright no Chromium;
- o WebKit em duas metades.

Nenhum portão, teste, limiar, orçamento, número de workers ou tempo por teste mudou. Um teste unitário prova que as partes juntas são os mesmos passos do `verificar` inteiro.

## O que mudou

- **`scripts/verificar.ts`:** os passos viraram uma lista exportada (`STEPS`), e a função pura `plan(args)` escolhe os de cada parte. O código que roda fica atrás de `import.meta.main`.
  - Sem argumento, roda tudo.
  - `--sem-playwright` roda tudo menos o passo `e2e`.
  - `--playwright=chromium|webkit`, com `--shard=i/n` opcional, roda o build e o `pnpm run e2e --project=… --shard=…`.
  - Argumento desconhecido para com a mensagem de uso. O resumo diz qual parte rodou, e o limite de 900 s vale para cada parte.
- **`tests/unit/verificar.test.ts`** (5 testes):
  - o todo sem argumento;
  - `--sem-playwright` sem o passo do Playwright;
  - os comandos de cada parte;
  - as quatro partes do CI juntas cobrindo exatamente os passos do todo;
  - argumentos recusados.
- **`.github/workflows/ci.yml`:**
  - O job `verificar` instala só o Chromium (para o Lighthouse) e roda `pnpm verificar --sem-playwright`, com o `LINT_TEXTO_BASE` de antes.
  - O job `playwright` é uma matriz (`chromium`, `webkit 1 de 2`, `webkit 2 de 2`) com `fail-fast: false`. Cada parte instala só o navegador dela e sobe o relatório do Playwright como `playwright-report-<n>` quando falha.
  - O job `merge` passa a esperar `[verificar, playwright]`. O pós-deploy e o `scripts/ci/pode-mesclar.ts` não mudaram.
- **`docs/adr/ADR-003-playwright-em-partes-no-ci.md`:** a ADR passa a "Aceita", com a seção "Decisão". O mesmo texto foi commitado na `fase-02`, para o merge da `main` não dar conflito.
- **`CLAUDE.md`:** seção nova no fim, "Ajuste: CI em partes (ADR-003)".

## Por que o WebKit em duas partes

Na execução mais rápida do CI da F2, o WebKit somou 1421 s de testes, o que dá uns 710 s de relógio com 2 workers. Na mais lenta, o runner foi uns 30% mais lento, e o WebKit sozinho chegaria a uns 925 s. Em duas partes, cada uma fica perto da metade disso. O Chromium sozinho somou uns 790 s na execução rápida (uns 400 s de relógio).

## pnpm verificar local, em partes

Windows 11, AMD Ryzen 5 7600X, Node 26.8.1, sobre a `main` (suíte da F1b), uma parte depois da outra:

| Parte | Comando | Resultado | Total |
| --- | --- | --- | ---: |
| portões | `pnpm verificar --sem-playwright` | 14 passos verdes; Vitest 22 arquivos e 275 testes; Lighthouse 59,9 s | 132,1 s |
| Chromium | `pnpm verificar --playwright=chromium` | 237 testes | 109,2 s |
| WebKit, parte 1 | `pnpm verificar --playwright=webkit --shard=1/2` | 119 testes | 93,6 s |
| WebKit, parte 2 | `pnpm verificar --playwright=webkit --shard=2/2` | 118 testes | 93,9 s |

As três partes do Playwright somam os 474 testes da F1b (237 por navegador). O `gate:actionlint` aprovou o workflow novo.

## CI na PR

Execução [41213168324](https://github.com/vmatusita/fileorca/actions/runs/41213168324), commit `a7322ac`, já com o workflow novo (o CI de uma PR roda o workflow da própria PR). As quatro partes começaram juntas e o CI inteiro levou uns 5 min de relógio, do começo das partes ao fim do `merge`:

| Job | Duração do job | `verificar` da parte | Testes |
| --- | ---: | ---: | ---: |
| `verificar` (`--sem-playwright`) | 2 min 46 s | 75,0 s (Lighthouse 39,6 s) | Vitest 275 |
| `playwright (chromium)` | 3 min 52 s | 171,2 s (Playwright 166,6 s) | 237 |
| `playwright (webkit 1 de 2)` | 4 min 4 s | 169,4 s (Playwright 165,9 s) | 119 |
| `playwright (webkit 2 de 2)` | 4 min 36 s | 191,0 s (Playwright 184,7 s) | 118 |
| `merge` | 18 s | — | — |

Todas verdes. O job `merge` respondeu "Merge automático: não. A PR mexe em .github/workflows/, então o merge fica para o Victor.", como manda o `pode-mesclar.ts`. Na F1b, o mesmo conjunto rodava num job só em 505 s de `verificar`.

## O que é do Victor

1. Mesclar esta PR. Ela mexe em `.github/workflows/`, então o job de merge não a mescla sozinho, e o `gh pr merge` é proibido nas runs.
2. Depois do merge, a run traz a `main` para a `fase-02`, com o conflito do fim do CLAUDE.md e do `scripts/verificar.ts` resolvido, e o CI da PR da F2 (vmatusita/fileorca#5) roda em partes. Com tudo verde, o job de merge mescla a F2 sozinho, e o site lança.
