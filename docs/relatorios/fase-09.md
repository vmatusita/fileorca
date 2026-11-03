# F9: CI mais barato e rápido, e o preparo do repositório público

Relatório da run F9, a primeira fase do `PLANO-MELHORIAS.md`. A ficha é o `docs/prompts/prompt-fase-09.txt`, e o plano, o `docs/relatorios/fase-09-plano.md`. PR: https://github.com/vmatusita/fileorca/pull/20 (branch `fase-09`). Antes da F9: `bbd30c8`.

> **O merge é do Victor:** a PR mexe em `.github/workflows/`. **Antes de tudo, leia o `.cache/auditoria-publico.md`,** na pasta do projeto e fora do Git, porque o repositório já é público.

## Resumo

- **O CI roda por classe.**
  - Rascunho sem o rótulo `ci`: um job leve, com tipos, lint, build e Vitest. Custa 5 minutos, contra 157 de uma execução completa.
  - PR só de documentação: o build e os portões, sem o Playwright e sem o Lighthouse.
  - O resto: o CI completo, com o build feito uma vez num job `build` e baixado pelas 20 partes.
- **O `ci-ok`** resume o CI, e o `merge` espera por ele.
- **A proteção contra PR de fork** está no `pode-mesclar.ts` e nos jobs que escrevem.
- **Comandos novos:** `pnpm ci:custo <run-id>`, que mede o custo de qualquer execução, e `pnpm verificar --partes`, que roda as partes do CI em sequência na máquina.
- **O `CLAUDE.md`** caiu de 78.256 para 15.119 bytes, sem perder linha. O resto foi para `docs/claude/`.
- **O repositório público ganhou:**
  - a auditoria (`pnpm publico:auditar`, só em `.cache/`);
  - o README, o SECURITY e a licença (todos os direitos reservados);
  - o ruleset em `docs/ops/ruleset-main.json`;
  - o passo a passo no `docs/OPERACAO.md`.
- **Dois critérios da ficha não fecharam, e está dito:**
  - os 35 % de minutos a menos numa execução completa: −29,3 % brutos, numa máquina mais rápida, e −5,7 % pela conta controlada (§ 339);
  - o preparo de até 90 s em cada job do Playwright: 17 de 18 nas duas execuções (§ 325).

## Três achados que mudam a leitura deste relatório

1. **O repositório já é público, desde a criação.** A API mostra um `PublicEvent` em 28/out/2026 15:03 UTC, a hora do `created_at` (§ 338). Os planos supunham um repositório privado no GitHub Free.
   - Os minutos do Actions não são cobrados hoje. O `ci:custo` calcula "como num repositório privado", como a ficha pede.
   - O código, os relatórios, as 18 `refs/pull/*`, os logs e os artefatos já estão públicos.
   - O passo "Change visibility" da seção F já está feito. Os outros (ruleset, aprovação de fork, Code security e Features) ficaram urgentes e são do Victor.
2. **O rótulo `ci` não existe.** A run não o cria. As execuções completas saíram do `gh pr ready`, com o `gh pr ready --undo` entre elas.
3. **A máquina do runner mudou entre a linha de base e esta PR.** A imagem é a mesma, mas o disco do `/` foi de 72 para 145 GB. Os mesmos testes, sobre o mesmo `dist/`, ficaram uns 30 % mais rápidos. A comparação de custo vai com duas contas: a bruta, do `ci:custo`, e a controlada, com o tempo de teste da linha de base (§ 339).

## O custo

### Lado a lado

| | Linha de base | Rascunho (`leve`) | Completa 1 | Completa 2 (a última antes do relatório) |
| --- | ---: | ---: | ---: | ---: |
| Execução | 41590377930 | 41652974779 | 41658317282 | 41660597548 |
| Commit | `8513580` (PR #19) | `77ea4e8` | `8727853` | `9e2d7d4` |
| Classe | completo (antes da F9) | leve | completo | completo |
| Minutos cobrados | 157 | 5 | 111 | 111 |
| Com o tempo de teste da linha de base | 157 | — | 148 (−5,7 %) | 148 (−5,7 %) |
| Tempo de parede | 11,1 min | 3,5 min | 8,8 min | 9,3 min |
| Jobs que rodaram / pulados | 21 / 2 | 3 / 7 | 23 / 4 | 24 / 3 |
| Preparo dos jobs do Playwright | 55 a 128 s; 1 de 18 > 90 s | — | 41 a 116 s; 1 de 18 > 90 s | 40 a 122 s; 1 de 18 > 90 s |
| Maior `total` de parte | 574,7 s | 126,4 s | 358,6 s | 361,7 s |
| Builds do site | 20 | 1 (o do `leve`) | 1 (o job `build`) | 1 (o job `build`) |
| Tempo de teste somado das 20 partes | 113,9 min | — | 78,7 min | 75,7 min |

- **A conta controlada** (`§ 339`) pega cada parte da execução nova e troca o tempo de teste dela pelo da linha de base: a duração do job, menos o `total` do `verificar`, mais o `total` da linha de base sem o build. Os jobs novos (`classificar`, `build` e `ci-ok`) entram como medidos. É o que a F9 economiza sozinha numa execução completa: o build de 20 partes, uns 20 s de preparo por parte e um pouco de arredondamento, menos os três jobs novos.
- **O critério 1 não fechou.** A conta bruta dá −29,3 %, abaixo dos 35 %; a controlada dá −5,7 %. Os 35 % pediriam cortar tempo de teste, mudar as partes ou os workers, que a ficha proíbe. A F9b redivide para as máquinas de 4 vCPU (pendência "F9 35 %").
- **A economia grande da F9** está nas execuções que deixam de ser completas.
  - Na PR #19, cada push em rascunho rodou o CI inteiro, de 157 a 166 minutos. Agora um push em rascunho custa 5.
  - Uma PR só de documentação roda só o build e os portões.

### `pnpm ci:custo 41590377930` (a linha de base)

#### Execução 41590377930 (tentativa 1)

- Branch `ajuste-idiomas`, commit `8513580`, evento `pull_request`, criada em 2026-11-03T06:31:05Z, resultado `success`.
- Classe: **completo (CI de antes da F9)**.
- Minutos cobrados: **157** (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: **11.1 min** (do início do primeiro job ao fim do último).
- Jobs: 21 rodaram, 2 pulados.

| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| alerta-dependabot | pulado | | 0 | | | |
| merge | success | 28 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (7 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (6 s); Set up job (1 s) |
| playwright (chromium 1 de 5) | success | 471 s | 8 | 55 s | 411.8 s | pnpm verificar --playwright=chromium --shard=1/5 (412 s); Run pnpm exec playwright install --with-deps chromium (19 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (16 s) |
| playwright (chromium 2 de 5) | success | 595 s | 10 | 62 s | 528.6 s | pnpm verificar --playwright=chromium --shard=2/5 (529 s); Run pnpm exec playwright install --with-deps chromium (24 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (12 s) |
| playwright (chromium 3 de 5) | success | 370 s | 7 | 62 s | 303.1 s | pnpm verificar --playwright=chromium --shard=3/5 (304 s); Run pnpm exec playwright install --with-deps chromium (24 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (13 s) |
| playwright (chromium 4 de 5) | success | 418 s | 7 | 71 s | 343.6 s | pnpm verificar --playwright=chromium --shard=4/5 (344 s); Run pnpm exec playwright install --with-deps chromium (27 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (15 s) |
| playwright (chromium 5 de 5) | success | 636 s | 11 | 58 s | 574.7 s | pnpm verificar --playwright=chromium --shard=5/5 (575 s); Run pnpm exec playwright install --with-deps chromium (22 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (11 s) |
| playwright (webkit 1 de 13) | success | 346 s | 6 | 74 s | 267.9 s | pnpm verificar --playwright=webkit --shard=1/13 (268 s); Run pnpm exec playwright install --with-deps webkit (35 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (16 s) |
| playwright (webkit 2 de 13) | success | 424 s | 8 | 77 s | 343.1 s | pnpm verificar --playwright=webkit --shard=2/13 (344 s); Run pnpm exec playwright install --with-deps webkit (35 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (14 s) |
| playwright (webkit 3 de 13) | success | 508 s | 9 | 78 s | 425.5 s | pnpm verificar --playwright=webkit --shard=3/13 (426 s); Run pnpm exec playwright install --with-deps webkit (34 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (15 s) |
| playwright (webkit 4 de 13) | success | 451 s | 8 | 79 s | 367.4 s | pnpm verificar --playwright=webkit --shard=4/13 (368 s); Run pnpm exec playwright install --with-deps webkit (35 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (15 s) |
| playwright (webkit 5 de 13) | success | 489 s | 9 | 84 s | 400.7 s | pnpm verificar --playwright=webkit --shard=5/13 (401 s); Run pnpm exec playwright install --with-deps webkit (43 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (14 s) |
| playwright (webkit 6 de 13) | success | 311 s | 6 | 81 s | 226.7 s | pnpm verificar --playwright=webkit --shard=6/13 (227 s); Run pnpm exec playwright install --with-deps webkit (45 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (14 s) |
| playwright (webkit 7 de 13) | success | 310 s | 6 | 72 s | 234.6 s | pnpm verificar --playwright=webkit --shard=7/13 (235 s); Run pnpm exec playwright install --with-deps webkit (36 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (12 s) |
| playwright (webkit 8 de 13) | success | 325 s | 6 | 128 s | 191.6 s | pnpm verificar --playwright=webkit --shard=8/13 (193 s); Run pnpm exec playwright install --with-deps webkit (86 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (14 s) |
| playwright (webkit 9 de 13) | success | 587 s | 10 | 80 s | 501.6 s | pnpm verificar --playwright=webkit --shard=9/13 (502 s); Run pnpm exec playwright install --with-deps webkit (41 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (13 s) |
| playwright (webkit 10 de 13) | success | 379 s | 7 | 82 s | 293.0 s | pnpm verificar --playwright=webkit --shard=10/13 (293 s); Run pnpm exec playwright install --with-deps webkit (42 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (15 s) |
| playwright (webkit 11 de 13) | success | 393 s | 7 | 73 s | 314.6 s | pnpm verificar --playwright=webkit --shard=11/13 (315 s); Run pnpm exec playwright install --with-deps webkit (36 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (16 s) |
| playwright (webkit 12 de 13) | success | 449 s | 8 | 68 s | 377.3 s | pnpm verificar --playwright=webkit --shard=12/13 (377 s); Run pnpm exec playwright install --with-deps webkit (33 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (14 s) |
| playwright (webkit 13 de 13) | success | 526 s | 9 | 76 s | 446.4 s | pnpm verificar --playwright=webkit --shard=13/13 (446 s); Run pnpm exec playwright install --with-deps webkit (39 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (13 s) |
| pos-deploy | pulado | | 0 | | | |
| verificar (lighthouse) | success | 478 s | 8 | 63 s | 411.7 s | pnpm verificar --lighthouse (413 s); Run pnpm exec playwright install --with-deps chromium (24 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (11 s) |
| verificar (portões) | success | 310 s | 6 | 46 s | 258.4 s | pnpm verificar --sem-playwright --sem-lighthouse (259 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (16 s); Run pnpm install --frozen-lockfile (9 s) |

Jobs que rodaram o build do site no verificar: playwright (chromium 1 de 5) (16 s), playwright (chromium 2 de 5) (23 s), playwright (chromium 3 de 5) (24 s), playwright (chromium 4 de 5) (16 s), playwright (chromium 5 de 5) (22 s), playwright (webkit 1 de 13) (12 s), playwright (webkit 2 de 13) (20 s), playwright (webkit 3 de 13) (21 s), playwright (webkit 4 de 13) (22 s), playwright (webkit 5 de 13) (18 s), playwright (webkit 6 de 13) (18 s), playwright (webkit 7 de 13) (23 s), playwright (webkit 8 de 13) (24 s), playwright (webkit 9 de 13) (22 s), playwright (webkit 10 de 13) (15 s), playwright (webkit 11 de 13) (15 s), playwright (webkit 12 de 13) (17 s), playwright (webkit 13 de 13) (24 s), verificar (lighthouse) (22 s), verificar (portões) (15 s).
Preparo dos jobs do Playwright: o maior foi 128 s (playwright (webkit 8 de 13)); 1 de 18 acima de 90 s.
Total do verificar: o maior foi 574.7 s (playwright (chromium 5 de 5)); 0 de 20 partes acima do alvo de 700 s.

### `pnpm ci:custo 41652974779` (o rascunho, classe `leve`)

#### Execução 41652974779 (tentativa 1)

- Branch `fase-09`, commit `77ea4e8`, evento `pull_request`, criada em 2026-11-03T14:22:02Z, resultado `success`.
- Classe: **leve**.
- Minutos cobrados: **5** (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: **3.5 min** (do início do primeiro job ao fim do último).
- Jobs: 3 rodaram, 7 pulados.

| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| alerta-dependabot | pulado | | 0 | | | |
| build | pulado | | 0 | | | |
| ci-ok | success | 27 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (14 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (7 s); Set up job (1 s) |
| classificar | success | 16 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (6 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (6 s); Set up job (1 s) |
| merge | pulado | | 0 | | | |
| playwright (${{ matrix.part }}) | pulado | | 0 | | | |
| pos-deploy | pulado | | 0 | | | |
| verificar (leve) | success | 160 s | 3 | 24 s | 126.4 s | pnpm verificar --leve (127 s); Run pnpm install --frozen-lockfile (8 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (6 s) |
| verificar (lighthouse) | pulado | | 0 | | | |
| verificar (portões) | pulado | | 0 | | | |

Jobs que rodaram o build do site no verificar: verificar (leve) (17 s).
Total do verificar: o maior foi 126.4 s (verificar (leve)); 0 de 1 partes acima do alvo de 700 s.

### `pnpm ci:custo 41660597548` (a última execução completa antes do relatório)

#### Execução 41660597548 (tentativa 1)

- Branch `fase-09`, commit `9e2d7d4`, evento `pull_request`, criada em 2026-11-03T15:07:36Z, resultado `success`.
- Classe: **completo**.
- Minutos cobrados: **111** (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: **9.3 min** (do início do primeiro job ao fim do último).
- Jobs: 24 rodaram, 3 pulados.

| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| alerta-dependabot | pulado | | 0 | | | |
| build | success | 61 s | 2 | 33 s | 21.3 s | pnpm verificar --build (22 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (11 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s) |
| ci-ok | success | 30 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (20 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (5 s); Set up job (1 s) |
| classificar | success | 12 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (7 s); Set up job (1 s); Post Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (1 s) |
| merge | success | 25 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (15 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (5 s); Set up job (1 s) |
| playwright (chromium 1 de 5) | success | 391 s | 7 | 56 s | 330.6 s | pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto (331 s); Wait for the browser (17 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (11 s) |
| playwright (chromium 2 de 5) | success | 400 s | 7 | 56 s | 341.5 s | pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto (342 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (23 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| playwright (chromium 3 de 5) | success | 272 s | 5 | 51 s | 216.8 s | pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto (217 s); Wait for the browser (14 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (11 s) |
| playwright (chromium 4 de 5) | success | 372 s | 7 | 44 s | 323.7 s | pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto (324 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (15 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (10 s) |
| playwright (chromium 5 de 5) | success | 285 s | 5 | 40 s | 241.4 s | pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto (242 s); Download the build (11 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (9 s) |
| playwright (webkit 1 de 13) | success | 268 s | 5 | 75 s | 188.4 s | pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto (188 s); Wait for the browser (39 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (11 s) |
| playwright (webkit 2 de 13) | success | 289 s | 5 | 55 s | 230.0 s | pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto (231 s); Wait for the browser (22 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (11 s) |
| playwright (webkit 3 de 13) | success | 247 s | 5 | 57 s | 186.2 s | pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto (187 s); Wait for the browser (27 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (13 s) |
| playwright (webkit 4 de 13) | success | 218 s | 4 | 53 s | 161.8 s | pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto (162 s); Wait for the browser (24 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (9 s) |
| playwright (webkit 5 de 13) | success | 328 s | 6 | 83 s | 240.2 s | pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto (241 s); Wait for the browser (50 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (12 s) |
| playwright (webkit 6 de 13) | success | 221 s | 4 | 68 s | 147.6 s | pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto (148 s); Wait for the browser (26 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (16 s) |
| playwright (webkit 7 de 13) | success | 255 s | 5 | 122 s | 127.4 s | pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto (128 s); Wait for the browser (80 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (14 s) |
| playwright (webkit 8 de 13) | success | 186 s | 4 | 55 s | 127.3 s | pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto (128 s); Wait for the browser (26 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (13 s) |
| playwright (webkit 9 de 13) | success | 331 s | 6 | 56 s | 271.8 s | pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto (272 s); Wait for the browser (20 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (10 s) |
| playwright (webkit 10 de 13) | success | 267 s | 5 | 48 s | 213.8 s | pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto (215 s); Wait for the browser (16 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s) |
| playwright (webkit 11 de 13) | success | 263 s | 5 | 53 s | 207.0 s | pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto (207 s); Wait for the browser (16 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (13 s) |
| playwright (webkit 12 de 13) | success | 353 s | 6 | 56 s | 293.3 s | pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto (293 s); Wait for the browser (17 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (13 s) |
| playwright (webkit 13 de 13) | success | 296 s | 5 | 63 s | 229.0 s | pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto (229 s); Wait for the browser (23 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (12 s) |
| pos-deploy | pulado | | 0 | | | |
| verificar (leve) | pulado | | 0 | | | |
| verificar (lighthouse) | success | 418 s | 7 | 52 s | 361.7 s | pnpm verificar --lighthouse --dist-pronto (363 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (18 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (10 s) |
| verificar (portões) | success | 138 s | 3 | 33 s | 100.9 s | pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto (102 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (9 s); Run pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 (7 s) |

Jobs que rodaram o build do site no verificar: build (18 s).
Preparo dos jobs do Playwright: o maior foi 122 s (playwright (webkit 7 de 13)); 1 de 18 acima de 90 s.
Total do verificar: o maior foi 361.7 s (verificar (lighthouse)); 0 de 21 partes acima do alvo de 700 s.

A primeira completa (41658317282) teve o mesmo total, 111 minutos, com o `merge` pulado pelo defeito da § 327, corrigido na segunda. O `ci:custo` da execução do `gh pr ready` final vai na descrição da PR.

## O CI novo

| Estado da PR | Rótulo `ci` | O que a PR muda | Classe | O que roda |
| --- | --- | --- | --- | --- |
| rascunho | não | qualquer coisa | `leve` | `classificar`, `leve` (tipos, lint, build e Vitest) e `ci-ok` |
| rascunho | sim | código | `completo` | tudo |
| rascunho | sim | só documentação | `portões` | `classificar`, `build`, `portoes` e `ci-ok` |
| pronta | qualquer | código | `completo` | tudo, e o `merge` |
| pronta | qualquer | só documentação | `portões` | `classificar`, `build`, `portoes`, `ci-ok` e o `merge` |

- **Os jobs:**
  - `classificar`: `scripts/ci/classificar.ts`, lido da base;
  - `leve`;
  - `build`: o único build, com o artefato `site`, de 1 dia (o `dist/` e o `.cache/bundle-modules.json`);
  - `portoes`, `lighthouse` e as 18 partes do `playwright`, com `--dist-pronto`;
  - `ci-ok`, que roda sempre (`scripts/ci/ci-ok.ts`, lido da base);
  - `merge`, `alerta-dependabot` e `pos-deploy`, que nunca rodam em PR de fork.

  O pulo é por `if` de job, nunca por `paths`. O gatilho ganhou o `labeled`.
- **O `ci-ok`** fica verde só com a classe saída e cada job que ela pede em `success`, ou em `skipped` quando a classe não pede aquele job. Fica vermelho com `failure`, `cancelled`, `skipped` de job pedido, classe ausente ou um job fora do `needs`. É o único check do ruleset.
- **O defeito que a primeira execução completa achou (§ 327):** o `merge` foi pulado com o `ci-ok` verde. O `success()` implícito do `if` olha também os ancestrais indiretos, e o `leve` é sempre pulado numa execução completa. O `merge` e o `pos-deploy` ganharam uma função de status explícita, e um teste exige isso de todo job depois de classes que se excluem. Na segunda execução, o `merge` rodou e o `pode-mesclar.ts` da base comentou "A PR mexe em .github/workflows/, então o merge fica para o Victor", como deve.

## As provas

- **Critério 2, o rascunho leve:** a execução 41652974779 (`opened` em rascunho) rodou 3 jobs: `classificar`, `verificar (leve)` e `ci-ok`. O `build`, os portões, o Lighthouse e as 18 partes do Playwright foram pulados. Custo: 5 minutos.
- **Critério 3, as classes:** os 20 eventos de `fixtures/ci-events/` passam pelo caminho do job no `tests/unit/ci-events.test.ts`:
  - um evento por linha da tabela;
  - fork, `labeled` com outro rótulo, `ready_for_review`, `reopened` e diff misto;
  - as bordas de `docs/design/`, `docs/oli/`, `.md` fora da raiz, `LICENSE`, diff vazio e diff ilegível (o bloco do `git diff` do job, rodado de verdade).

  O `pronta-docs` sai `portões`.
- **Critério 4, o `ci-ok`:** verde nas duas execuções completas e na leve. O `tests/unit/ci-ok.test.ts` reprova cada resultado ruim em cada job de cada classe, a classificação ausente, um job pedido e pulado e o `needs` ilegível. O `merge` espera o `ci-ok` (`tests/unit/ci-workflows.test.ts`).
- **Critério 5, o build único:**
  - nos logs da execução 41658317282, a linha `▶ build (astro build do zero)` aparece só no job `build`;
  - o `ci:custo` mostra "Jobs que rodaram o build do site no verificar: build";
  - o `tests/unit/verificar.test.ts` lê as partes do `.github/workflows/ci.yml` e confere que juntas são o `pnpm verificar` inteiro, com o build uma vez e cada portão uma vez;
  - os dois builds do `gate:prontidao` em `.cache/prontidao/` são um portão e continuam.
- **Critério 6, nenhum teste a menos:**
  - o `pnpm exec playwright test --list` dá 1.428 testes em 44 arquivos em cada navegador, o mesmo do `bbd30c8`;
  - na execução 41658317282, as partes aprovaram 286 + 286 + 286 + 285 + 285 = 1.428 no Chromium e 11 × 110 + 2 × 109 = 1.428 no WebKit;
  - o Vitest foi de 93 arquivos e 1.597 testes para 102 arquivos e 1.735 testes;
  - nenhum `skip`, `only`, `retries`, timeout maior ou limiar menor (§ 341).
- **Critério 7, o site igual:** `git diff --stat bbd30c8 -- src public astro.config.ts docs/design docs/oli` sai vazio.
- **Critério 8, a § 154:** nos logs das 18 partes do Playwright da execução 41658317282 aparecem:
  - o `kernel.core_pattern = |/bin/false` do passo "Core dumps off", antes do `verificar` (18 de 18);
  - o passo "Disk and core dumps", com o `df` e o `core_pattern: |/bin/false` (18 de 18);
  - as linhas `[disco]` (as 18 partes, os portões, o Lighthouse e o `build`).

  O disco livre mínimo foi de 81 a 85 GB, contra 7 a 10 GB na linha de base, porque a máquina tem 145 GB.
- **Critério 11, o fork:**
  - o `tests/unit/pode-mesclar.test.ts`, os eventos `fork-run-branch`, `other-author-run-branch` e `missing-head-repo` de `fixtures/merge-events/`, e o `tests/unit/ci-workflows.test.ts` (nenhum `pull_request_target`, e os três jobs que escrevem, todos com a guarda);
  - com `MERGE_SCRIPT=<o pode-mesclar.ts do bbd30c8>`, os três eventos novos reprovam (3 falhas, 20 aprovados): a proteção é o que os faz passar.
- **Critério 14, o teste lento:** o "keeps the links that stay inside a part…" lê os links do oráculo (§ 330).
  - Sozinho, foi de 1.735, 1.699 e 1.714 ms para 325, 303 e 313 ms.
  - Três rodadas do Vitest inteiro com o Playwright (`chromium --shard=2/5`) rodando ao lado passaram, com 96 arquivos e 1.664 testes, e ele levou 224, 181 e 147 ms. O tempo limite dele não mudou.

## O CLAUDE.md

- **O `CLAUDE.md`:** de 78.256 bytes (557 linhas) para 15.119 bytes.
  - Ficaram o núcleo, as seis regras de toda run do `PLANO-MELHORIAS.md` (literais), o índice e as tabelas de comandos de todas as fases, com a da F9.
  - A abertura diz a regra nova: as runs acrescentam no arquivo do tema em `docs/claude/`, e o `CLAUDE.md` só muda no núcleo e no índice, também só acrescentando.
- **Os arquivos de `docs/claude/`**, em bytes:

| Arquivo | Bytes |
| --- | ---: |
| `ci.md` (com a seção da F9) | 17.608 |
| `idiomas.md` | 11.125 |
| `calculadoras.md` | 9.999 |
| `pdf.md` | 7.256 |
| `imagem.md` | 7.167 |
| `windows-git-bash.md` | 6.660 |
| `design-e-oli.md` | 6.438 |
| `service-worker.md` | 4.856 |
| `playwright.md` | 4.261 |
| `anuncios.md` | 2.751 |

- **O que saiu:** 24 linhas, listadas com o texto igual no § 331.
  - 19 são as descrições de partes do CI já substituídas: as da ADR-003, do WebKit em três partes, da F5a, da F7, da F8 e do ajuste idiomas, com as frases "Isto substitui…";
  - 5 foram reescritas de propósito: a abertura, os itens 2 a 4 da fonte de verdade e a linha da PR, agora em rascunho desde o começo.
- **A prova:** o `tests/unit/claude-md.test.ts` (13 testes) confere cada linha não vazia do `CLAUDE.md` de `bbd30c8` contra o novo e `docs/claude/`, o limite de 25.600 bytes, o índice e as regras novas. Os controles reprovam uma linha apagada, uma linha alterada, o arquivo com 25.601 bytes e um arquivo fora do índice.

## A auditoria

`pnpm publico:auditar` (§ 332) rodou na pasta do projeto, num espelho (`git clone --mirror`) com 20 refs, das quais 18 `refs/pull/*`:

- **Varridos:** 575 commits e 3.970 blobs (3.210 de texto, 788 imagens e 14 pulados), mais 42 blobs que só a branch local tem.
- **O gitleaks 8.30.1** leu 573 de 573 commits com mudança de texto, e a árvore.
- **Os achados únicos, só a contagem por tipo:**

| Tipo | Achados |
| --- | ---: |
| segredo real | 0 |
| público por natureza | 16 |
| dado do Victor | 4 |
| dado de terceiro | 17 |
| falso positivo | 28 |

O arquivo completo está em `.cache/auditoria-publico.md`, e o `git check-ignore -v .cache/auditoria-publico.md` dá `.gitignore:10:.cache/`. Nenhum achado foi corrigido: a decisão é do Victor.

## Fork e Workers Builds

- **A proteção:** o `pode-mesclar.ts` só mescla PR cujo head é deste repositório e cujo autor é o dono ou o Dependabot. Recusa também quando os dados faltam. Os jobs que escrevem não rodam em PR de fork, e nenhum workflow usa `pull_request_target` (§ 333).
- **Uma PR de fork roda o `ci.yml` dela mesma,** então o `ci-ok` verde dela não prova nada: o merge de fork é sempre do Victor, depois de ler o diff (`docs/OPERACAO.md`).
- **O Workers Builds** (§ 335): a documentação dele não fala de fork; a prévia nasce de um push numa branch do repositório conectado. Só a do Pages diz que PR de fork não gera prévia. O `docs/OPERACAO.md` lista o que o Victor confere no painel e o teste com uma PR de fork de verdade.

## O `pnpm verificar --partes`

Na máquina local (Windows, com os agentes da run rodando ao lado), sobre o commit `77ea4e8`:

```text
Resumo das partes do CI (pnpm verificar --partes, 21 partes lidas de .github/workflows/ci.yml)
  ok      38.4 s  build: pnpm verificar --build
  ok     130.4 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     341.3 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok      82.9 s  playwright: pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto
  ok     107.8 s  playwright: pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto
  ok      75.8 s  playwright: pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto
  ok      91.7 s  playwright: pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto
  ok      82.3 s  playwright: pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto
  ok      43.3 s  playwright: pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto
  ok      44.4 s  playwright: pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto
  ok      52.9 s  playwright: pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto
  ok      54.8 s  playwright: pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto
  ok      60.9 s  playwright: pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto
  ok      48.7 s  playwright: pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto
  ok      30.0 s  playwright: pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto
  ok      38.0 s  playwright: pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto
  ok      59.7 s  playwright: pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto
  ok      48.2 s  playwright: pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto
  ok      52.8 s  playwright: pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto
  ok      70.6 s  playwright: pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto
  ok      48.2 s  playwright: pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto
  soma 1603.1 s (parede 1603.1 s; cada parte com o limite de 900 s)
```

Nenhuma parte passou de 900 s. As partes do Playwright aprovaram 1.428 testes em cada navegador. O `--partes` final, depois de `CI=true pnpm install --frozen-lockfile`, está na seção seguinte.

A execução final do `--partes`, depois de `CI=true pnpm install --frozen-lockfile`, entra depois da revisão.

## As execuções do CI desta run

| Execução | Commit | Evento | Classe | Resultado | Minutos |
| --- | --- | --- | --- | --- | ---: |
| 41652974779 | `77ea4e8` | `opened` (rascunho) | leve | verde | 5 |
| 41658314769 | `8727853` | `synchronize` (rascunho) | leve, cancelada pelo `ready_for_review` | cancelada | 2 |
| 41658317282 | `8727853` | `ready_for_review` | completo | verde (o `merge` pulado, § 327) | 111 |
| 41660597548 | `9e2d7d4` | `synchronize` (pronta) | completo | verde | 111 |
| 41662993159 | `a85630b` | `synchronize` (rascunho) | leve | verde | (no relatório final) |

## A revisão

A revisão adversarial roda sobre o commit deste relatório; o resumo entra depois dela, e o detalhe fica no `docs/relatorios/REVISAO-F9.md`.

## A prévia

https://fase-09-fileorca.vmatusita.workers.dev (o Workers Builds publica a prévia de cada push da branch; o build da `77ea4e8` saiu verde).

## Decisões novas

O `DECISOES.md` vai do § 323 ao § 341:

| § | Assunto |
| --- | --- |
| 323 | o `ci:custo` e a linha de base |
| 324 | o build uma vez por execução |
| 325 | o preparo do Playwright |
| 326 | as classes |
| 327 | o `ci-ok`, e o `merge` pulado da primeira execução |
| 328 | os miúdos: o `fetch-depth`, o cache das ferramentas e o `mini-yaml.ts` em `scripts/lib/` |
| 329 | o `--partes` |
| 330 | o teste lento |
| 331 | o `CLAUDE.md` enxuto e as linhas que saíram |
| 332 | a auditoria |
| 333 | a proteção contra fork |
| 334 | o README, o SECURITY e a licença |
| 335 | o Workers Builds |
| 336 | o ruleset e o OPERACAO |
| 337 | a fonte de verdade |
| 338 | o repositório já público e o rótulo `ci` |
| 339 | a meta de 35 % e a conta controlada |
| 340 | o adendo da ADR-003 e as pendências |
| 341 | os testes que mudaram junto com o CI |

## O que a válvula cortou

Nada. A compactação do `CLAUDE.md` e o `--partes` entraram nesta run.

## O que é do Victor

1. **Ler o `.cache/auditoria-publico.md` antes de tudo** e decidir por categoria, pela seção F do `PLANO-MELHORIAS.md` e pela seção "Repositório público" do `docs/OPERACAO.md`. O repositório já é público, então isto é urgente. Se quiser refazer a auditoria, rode `pnpm publico:auditar`.
2. **Conferir o diff do `.github/`** (`ci.yml` e `pos-deploy.yml`) e dar o merge da PR #20 (squash, apagando a branch).
3. **Os passos da seção F, na ordem do `docs/OPERACAO.md`.** A visibilidade já é pública. Falta:
   - importar o ruleset de `docs/ops/ruleset-main.json`, só depois do merge;
   - a aprovação de PR de fork para todos os externos;
   - o Code security: secret scanning, push protection e o relato privado;
   - as Features: desligar o Wiki e o Projects;
   - conferir o Workers Builds no painel, e testar com uma PR de fork de verdade.
4. **Criar o rótulo `ci`** (Issues → Labels), de que a regra 1 do `CLAUDE.md` depende, e **acrescentar a linha no topo do `PLANO-FILEORCA.md`** apontando para o `PLANO-MELHORIAS.md` (decisão 12; o arquivo não tinha a linha).
5. **Na primeira PR depois disso,** conferir que o check `ci-ok` aparece e que o merge automático acontece.
6. **Gerar o prompt da F9b** com o `pnpm ci:custo` da primeira execução depois do merge, e com a conta controlada, porque a máquina do runner varia. A F9b redivide as partes e os workers para as máquinas de 4 vCPU (pendências "F9 35 %", "F9 preparo" e § 283).
7. As outras pendências da F9 estão no grupo 18 do `docs/PENDENCIAS.md`: a cópia `.md` do prompt, o motor MIT e o que a auditoria não lê.
