# F9: plano da run

Gabarito da revisão adversarial final. A ficha é o `docs/prompts/prompt-fase-09.txt`; este plano diz como cada pedido dela vira arquivo, teste e prova.

## Âncoras

- **Antes da F9:** `bbd30c8367baeed677d1bf05648856847cdf5d8e` (`origin/main` no começo da run, o merge do ajuste idiomas). O teste do `CLAUDE.md` lê esse commit.
- **Branch:** `fase-09`. Primeiro commit: `892b10f` (o `PLANO-MELHORIAS.md` e o prompt).
- **Próximo § livre:** 323.
- **Contagens de antes:** 1.428 testes do Playwright por navegador; 93 arquivos e 1.597 testes do Vitest (`docs/relatorios/ajuste-idiomas.md`).

## Achados da exploração que mudam a run

1. **O repositório já é público, desde a criação.** A API mostra um `PublicEvent` em 28/out/2026 15:03 UTC, a mesma hora do `created_at`. O prompt e o `PLANO-FILEORCA.md` supõem repositório privado.
   - Tudo o que a run empurra fica público na hora: a auditoria continua só em `.cache/`.
   - Os minutos do Actions de um repositório público não são cobrados. O `ci:custo` calcula "como num repositório privado", como a ficha pede.
   - A linha de base já rodou nas máquinas de repositório público. A comparação de custo é justa: mesmas máquinas antes e depois.
   - **Nota depois das medidas:** a frase acima não se confirmou. O tipo de máquina mudou entre a linha de base e as execuções da PR (o `/` foi de 72 para 145 GB, e os mesmos testes ficaram uns 30 % mais rápidos), por causa desconhecida. O relatório usa também uma conta controlada (DECISOES § 338 e § 339).
   - Configuração lida por GET: nenhum ruleset, aprovação de PR de fork em `first_time_contributors`, secret scanning e push protection desligados, relato privado desligado, Wiki e Projects ligados. Os passos 3 a 6 da seção F do `PLANO-MELHORIAS.md` ficam urgentes. Nada disso é desta run.
2. **O rótulo `ci` não existe.** A run não cria rótulo. Vale o caminho da ficha: a execução completa sai do `gh pr ready`. Se ela falhar, `gh pr ready --undo`, a correção, e `gh pr ready` de novo.
3. **O `PLANO-FILEORCA.md` não tem diff.** A linha do Victor não está lá: a run não toca no arquivo e registra a pendência.
4. **O `docs/prompts/prompt-fase-09.md` está atrás do `.txt`** em dois pontos: o caso do rótulo `ci` inexistente e o `--undo`. A ficha manda commitar os dois sem edição. O `.txt` é o prompt que a run recebeu, e o `Claude outputs/PLANO-MELHORIAS.md` (versão final) foi copiado por cima do da raiz.
5. **A meta de −35 % numa execução completa não fecha só com o build único e o preparo.** Os três exploradores chegaram à mesma conta:
   - Dos 157 minutos da linha de base, 120,5 são o passo `pnpm verificar` (testes e portões). Mais 10,3 vêm do arredondamento por job.
   - O preparo soma 24,5 minutos e o build repetido soma 6,5.
   - Mesmo com os dois zerados, o piso é de uns 127 minutos (−19 %). O realista é de −5 % a −10 %.
   - A ficha proíbe cortar teste, mudar partes e mudar workers. A run implementa tudo, mede de verdade e registra a conta num § e no relatório, sem esconder o critério que não fecha.
   - A economia grande desta fase está nas execuções que deixam de ser completas: o rascunho leve e a PR só de documentação.

## Linha de base

Execução `41590377930`: a última verde da PR #19 (ajuste idiomas), commit `8513580`, `ready_for_review`. O `pnpm ci:custo 41590377930` dá:

- 157 minutos cobrados;
- 11,1 min de parede;
- 21 jobs rodaram e 2 foram pulados;
- preparo dos jobs do Playwright de 55 s a 128 s, com 1 de 18 acima de 90 s;
- maior `total`: 574,7 s, no `chromium 5 de 5`;
- 20 builds, um por parte, de 12 s a 24 s.

## O CI novo

### As classes (`scripts/ci/classificar.ts`, lido da base)

| Estado da PR | Rótulo `ci` | O que a PR muda | Classe | Jobs |
| --- | --- | --- | --- | --- |
| rascunho | não | qualquer coisa | `leve` | `classificar`, `leve`, `ci-ok` |
| rascunho | sim | código | `completo` | todos |
| rascunho | sim | só documentação | `portões` | `classificar`, `build`, `portoes`, `ci-ok` |
| pronta | qualquer | código | `completo` | todos (e `merge`) |
| pronta | qualquer | só documentação | `portões` | `classificar`, `build`, `portoes`, `ci-ok` (e `merge`) |

- **Só documentação:** todo arquivo do diff está em `docs/`, fora de `docs/design/` e de `docs/oli/`, ou é um `.md` da raiz. Nenhum spec do Playwright, nenhum passo do Lighthouse e nenhum arquivo do build lê esses arquivos. Diff vazio ou ilegível conta como `completo`.
- **Gatilho:** `opened`, `synchronize`, `reopened`, `ready_for_review` e `labeled`. O pulo é por `if` de job, nunca por `paths`.

### Os jobs

| Job | `needs` | Roda quando | Faz |
| --- | --- | --- | --- |
| `classificar` | nenhum | sempre | Checkout completo, o script da base (ou o da PR, se a base não tem), `git diff --no-renames`, `jq` e o CLI. Saída `classe`. |
| `leve` | `classificar` | `leve` | `pnpm verificar --leve`: tipos, lint, build e Vitest. Checkout completo, porque o Vitest lê o histórico. |
| `build` | `classificar` | `portões` ou `completo` | `pnpm verificar --build` e o artefato `site` (`dist/` e `.cache/bundle-modules.json`, `include-hidden-files`, 1 dia). Checkout raso. |
| `portoes` | `classificar`, `build` | `portões` ou `completo` | Cache das ferramentas, depois o artefato (o dele vence), depois `pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto`. Checkout completo. |
| `lighthouse` | `classificar`, `build` | `completo` | Chromium em segundo plano, o artefato e `pnpm verificar --lighthouse --dist-pronto`. Checkout raso. |
| `playwright` (18) | `classificar`, `build` | `completo` | Navegador e pacotes do sistema em segundo plano, o artefato, o Node e o pnpm, a espera, as proteções da § 154 e `pnpm verificar <parte> --dist-pronto`. Checkout raso. |
| `ci-ok` | os seis acima | `always()` | `scripts/ci/ci-ok.ts` da base sobre `toJSON(needs)`. |
| `merge` | `ci-ok` | `ci-ok` verde, PR pronta e não fork | O de hoje, com o `jq` levando o repositório do head, o repositório e o dono. |
| `alerta-dependabot` | `ci-ok`, `merge` | `failure()`, Dependabot e não fork | O de hoje. |
| `pos-deploy` | `merge` | `merged` e não fork | O de hoje; o `pos-deploy.yml` ganha a mesma guarda. |

### O `ci-ok`

- **Verde** só com a classe saída e cada job em `success`, ou em `skipped` quando a classe não pede aquele job.
- **Vermelho** com `failure`, com `cancelled`, com `skipped` de job pedido, sem classe, ou com um job da lista fora do `needs`.

### As opções do `verificar`

- `--build`: só o build.
- `--dist-pronto`: não apaga o `dist/`, tira o build e falha se o `dist/build.txt` não é o `git rev-parse HEAD`.
- `--leve`: o job do rascunho.
- `--partes`: as partes do `ci.yml` em sequência, lidas pelo `scripts/lib/ci-parts.ts`. O `mini-yaml.ts` vai para `scripts/lib/`.

### O preparo (decisão 3)

- **Primeira opção medida (A):** checkout raso; `npx playwright@<versão do lockfile> install --with-deps <navegador>` em segundo plano (`setsid nohup`), enquanto o job baixa o artefato e prepara o Node e o pnpm; depois, um passo espera o status.
- **Segunda opção (B), só se A não fechar em 90 s:** a imagem `mcr.microsoft.com/playwright:v<versão>-noble` puxada em segundo plano e rodada por `docker run` num passo, com o `sysctl` no host.

## Critérios e provas

| # | Critério | Prova |
| --- | --- | --- |
| 1 | −35 % de minutos, preparo ≤ 90 s, partes ≤ 700 s | `pnpm ci:custo` da linha de base e da execução completa, lado a lado. O −35 % deve ficar abaixo da meta (achado 5); o relatório traz a conta. |
| 2 | Rascunho leve | `pnpm ci:custo` da execução do `opened` em rascunho: classe `leve`, sem Playwright nem Lighthouse. |
| 3 | Classes | `tests/unit/ci-events.test.ts` sobre `fixtures/ci-events/` (20 eventos). O `pronta-docs` sai `portões`. |
| 4 | `ci-ok` | `tests/unit/ci-ok.test.ts` (casos que reprovam), `tests/unit/ci-workflows.test.ts` (`needs` e `if`), execução verde. |
| 5 | Build único | `tests/unit/verificar.test.ts` (build uma vez entre as partes do `ci.yml`), `tests/unit/ci-workflows.test.ts` e o log da execução completa. |
| 6 | Nenhum teste a menos | `--list` dos dois navegadores ≥ 1.428, a soma dos aprovados nas partes e o Vitest ≥ 1.597. |
| 7 | Site igual | `git diff --stat bbd30c8 -- src public astro.config.ts docs/design docs/oli` vazio. |
| 8 | § 154 | `tests/unit/ci-workflows.test.ts` e o `grep` nos logs das 18 partes. |
| 9 | `CLAUDE.md` | `tests/unit/claude-md.test.ts` com os controles e `wc -c CLAUDE.md`. |
| 10 | Auditoria | `pnpm publico:auditar` e `git check-ignore -v .cache/auditoria-publico.md`; o relatório só traz contagens. |
| 11 | Fork | `tests/unit/pode-mesclar.test.ts` e `tests/unit/merge-events.test.ts` (com `MERGE_SCRIPT` do `bbd30c8`: os três casos novos reprovam), mais `tests/unit/ci-workflows.test.ts`. |
| 12 | Papéis do público | `README.md`, `SECURITY.md`, `LICENSE`, `docs/ops/ruleset-main.json`, `tests/unit/ruleset.test.ts` e `tests/unit/operacao.test.ts`. |
| 13 | `--partes` | `pnpm verificar --partes` local, com os totais no relatório. |
| 14 | Teste lento | O tempo sozinho antes e depois, e três rodadas do Vitest com o Playwright ao lado. |
| 15 | Revisão | `docs/relatorios/REVISAO-F9.md`. |
| 16 | CI | A execução do `gh pr ready` verde, com o `ci-ok` verde. |

## Fatias

1. `ci:custo` e a linha de base (`scripts/ci/custo.ts`, `fixtures/ci-custo/`, `tests/unit/ci-custo.test.ts`).
2. `verificar.ts`: `--build`, `--dist-pronto`, `--leve` e `--partes`, com o `verificar.test.ts`.
3. Classificação, `ci-ok` e a proteção contra fork, com os eventos de exemplo.
4. O `ci.yml` e o `pos-deploy.yml` novos, com os testes, o `actionlint`, o push e a PR em rascunho (a primeira execução leve).
5. A execução completa, pelo `gh pr ready`, e o preparo. Se falhar: `--undo`, a correção e de novo.
6. O teste lento do F8 ensaio-3.
7. A auditoria, o README, o SECURITY, a licença, o Workers Builds, o `OPERACAO.md` e o ruleset. Vai num agente Opus em worktree, em paralelo.
8. O `CLAUDE.md` enxuto e a `docs/claude/`. Vai num agente Opus em worktree, em paralelo.
9. O adendo da ADR-003, os §, o `PENDENCIAS.md` e o `--partes` final.
10. A revisão adversarial (seis lentes Sonnet, céticos, correções num agente Opus e a segunda passada), o relatório e o `gh pr ready` final.

## Orçamento de execuções do CI

- **Push em rascunho:** classe `leve`, uns 6 minutos (`classificar`, `leve`, `ci-ok`). Pode haver vários.
- **Execuções completas:** no máximo três, cada uma só com as partes locais verdes. Todas saem do `gh pr ready`, porque o rótulo `ci` não existe; entre elas, `gh pr ready --undo`. A última é a do fim, com tudo commitado.
- **Rerun:** um por falha que pareça instável, registrado.
