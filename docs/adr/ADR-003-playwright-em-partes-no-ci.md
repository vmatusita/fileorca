# ADR-003: Dividir o Playwright do CI em partes

**Status:** Aceita, opção 1, com o WebKit em duas partes: decidida pelo Victor em 31/out/2026 ("Aceito a ADR-003") e implementada pelo ajuste `ajuste-ci-partes`
**Data:** 31/out/2026
**Proposta por:** run F2 (a ficha manda escrever esta ADR se o `verificar` passar de 800 s no CI)
**Afeta:** `.github/workflows/ci.yml`, `scripts/verificar.ts`, DECISOES § 57 e § 76

## Contexto

- O `pnpm verificar` roda inteiro num job só do GitHub Actions, num runner Ubuntu de 2 vCPU (repositório privado no GitHub Free), com o Playwright em 2 workers (§ 57) e um teto de 900 s que o próprio `verificar` impõe.
- Na F1b, o Playwright levou 424 s para 474 testes. Na F2, o primeiro push com a suíte inteira ([run 41200291640](https://github.com/vmatusita/fileorca/actions/runs/41200291640), commit `df918b2`) levou **1414 s** para 532 testes: a soma da duração dos testes no log é 2786 s, ou seja, os 2 workers ficaram ocupados o tempo todo. Por spec, somando os dois navegadores: axe 771 s, matriz de fixtures 691 s, smoke das ferramentas 295 s, anúncios 224 s, design 138 s, café 134 s.
- O custo novo vem de trabalho de CPU de verdade: codecs WASM de uma thread (MozJPEG, OxiPNG, libheif, jSquash) sobre fotos de 8 a 12 MP, uma vez por navegador, e o axe sobre 39 páginas em duas larguras e dois temas. O WebKit leva de 1,7 a 2 vezes o tempo do Chromium. Nada disso se tira sem tirar alcance que a ficha F2 exige (navegador, página, largura, tema, fixture e os testes dos critérios 3 a 8 e 10).
- A F2 fez o que a ficha permite sem reduzir o alcance (§ 83): o axe passou ao modo legado e só com as violações (cerca de 3 vezes mais rápido por análise, mesmas regras), e os estados da F1b viraram um carregamento cada. Depois disso, a válvula cortou (e) Convert to WebP/AVIF e (f) AVIF to JPG para a run 2b (§ 85). Com tudo isso, o CI do commit `4b169ae` ([run 41205310197](https://github.com/vmatusita/fileorca/actions/runs/41205310197)) passou os 486 testes, mas o `verificar` levou **1283,5 s** (Playwright 1123,4 s; 2212 s somados). O runner de repositório privado tem 2 vCPU (documentação do GitHub, 31/out/2026). **A PR da F2, que lança o site, não mescla sozinha enquanto esta ADR não for decidida** (§ 87).
- O teto de 900 s e o número de workers existem para o CI ser estável e caber no plano grátis (2000 min/mês). Cada ferramenta nova (a F3 e as de PDF) põe mais trabalho de codec na mesma fila.

## Opções

1. **Dividir o Playwright em jobs paralelos por navegador.** Um job roda os portões rápidos, o build, o Vitest, o Lighthouse e o `lint:texto`; dois jobs rodam o Playwright, um com `--project=chromium` e outro com `--project=webkit`, cada um sobre o mesmo `dist/` (artefato do primeiro job ou build próprio). O teto de 900 s passa a valer por job. O job de merge espera os três.
2. **Dividir por shard do Playwright** (`--shard=1/3`, `2/3`, `3/3`), com os dois navegadores em cada parte. Divide melhor quando um navegador pesa mais que o outro, e a conta de minutos é a mesma da opção 1.
3. **Runner maior** (runners de 4 ou 8 vCPU são pagos no GitHub). Mantém um job só, mas tem custo mensal.
4. **Manter um job e cortar alcance a cada ferramenta nova** (menos fixtures por navegador, axe numa largura só). Contraria a ficha F2 e o plano.

## Proposta

A opção 1. É a mais simples de ler no log, mantém o alcance inteiro e põe o WebKit, que é o mais lento, num job só dele. O `scripts/verificar.ts` ganha um modo que roda só um projeto do Playwright (por exemplo, `pnpm verificar --playwright=webkit`), e o `ci.yml` chama cada modo num job. O tempo de cada job fica perto da metade do atual, com folga para a F3. Os minutos do plano sobem pouco: o build e a instalação se repetem em cada job (cerca de 2 min por job).

## Antes de decidir

- A mudança mexe em `.github/workflows/ci.yml`, e uma PR que mexe no pipeline não é mesclada sozinha (o job de merge recusa): o merge dessa PR é seu.
- O job de merge (`scripts/ci/pode-mesclar.ts`) e o pós-deploy dependem do nome do job `verificar`; a divisão precisa manter um job de nome `verificar` (ou mudar o script, que também é do pipeline).
- Com a decisão, uma run curta (`ajuste-ci-partes`) implementa e mede três execuções seguidas.

## Decisão (31/out/2026)

O Victor aceitou a opção 1. O ajuste `ajuste-ci-partes` a implementa com uma diferença, medida: o WebKit sozinho chega a uns 710 a 925 s com a suíte da F2, conforme a velocidade do runner, perto demais do limite. Por isso ele roda em duas partes (`--shard`).

- **`scripts/verificar.ts`:** ganhou modos, e `tests/unit/verificar.test.ts` prova que as partes juntas são os mesmos passos do todo.
  - Sem argumento, roda tudo, como antes.
  - `--sem-playwright` roda todos os portões menos o Playwright.
  - `--playwright=<projeto>`, com `--shard=i/n` opcional, roda o build e só aquela parte da suíte.
  - Cada modo mantém o limite de 900 s.
- **`.github/workflows/ci.yml`:** três jobs, um para cada parte, em runners próprios e ao mesmo tempo.
  - O job `verificar` roda `--sem-playwright`.
  - O job `playwright` é uma matriz com `chromium`, `webkit 1 de 2` e `webkit 2 de 2`, com `fail-fast: false` e o relatório do Playwright de cada parte num artefato.
  - O job `merge` espera os dois. O pós-deploy não mudou.
- **O que não muda:** nenhum portão, teste, limiar, orçamento, número de workers (2 por runner) ou tempo por teste.
- **Custo:** os minutos do plano sobem pela instalação repetida em cada job, uns 2 min por job a mais.

## Adendo (31/out/2026): WebKit em três partes

Na F3, a parte 2 do WebKit chegou a 644,4 s, perto do alvo de 700 s (DECISOES § 105). O ajuste `ajuste-ci-webkit-tres` divide o WebKit em três partes antes da F4, como manda a regra desta ADR no CLAUDE.md (seção "Ajuste: CI em partes (ADR-003)") quando uma parte passa de uns 700 s (DECISOES § 108).

- **O que mudou:** a matriz do job `playwright` passa a `chromium`, `webkit 1 de 3`, `webkit 2 de 3` e `webkit 3 de 3` (`--playwright=webkit --shard=i/3`). O CI tem cinco partes, cada uma com o limite de 900 s, e o `merge` espera todas.
- **O que não mudou:** o `scripts/verificar.ts`, que já aceitava qualquer `--shard=i/n`, e nenhum teste, portão, limiar, timeout, `retries` ou número de workers.
- **Tempos** (o total do `verificar` de cada parte, do resumo no log):

  | Execução | `verificar` | Chromium | WebKit 1 | WebKit 2 | WebKit 3 |
  | --- | ---: | ---: | ---: | ---: | ---: |
  | Antes: F3, [run 41236243545](https://github.com/vmatusita/fileorca/actions/runs/41236243545) | 201,5 s | 315,2 s | 375,8 s (1 de 2) | 644,4 s (2 de 2) | — |
  | Depois: [run 41250641460](https://github.com/vmatusita/fileorca/actions/runs/41250641460), tentativa 1 | 137,7 s | 404,3 s | 186,5 s | 250,4 s | 567,3 s |
  | Depois: a mesma run, tentativa 2 | 176,8 s | 395,7 s | 296,2 s | 200,9 s | 583,9 s |

- **Leitura:** a divisão é por contagem de testes (90, 89 e 89), não por tempo. A parte 3 fica com a matriz de fixtures e segue a mais lenta, com 116 a 133 s de folga para o alvo.

## Adendo (F5a, 01/nov/2026): Chromium em três partes, WebKit em sete, e o diagnóstico do ENOSPC

A F5a soma as 12 ferramentas de PDF, com matriz, privacidade e estados novos no `a11y`, no `ads` e no `budgets`. A ficha da run (decisão 14) pede mais partes no CI, cada uma com alvo de 700 s e limite de 900 s, mexendo só no `ci.yml`.

- **O que mudou:**
  - **A matriz do job `playwright`:** dez partes.
    - `chromium 1 de 3` a `chromium 3 de 3` (`--playwright=chromium --shard=i/3`);
    - `webkit 1 de 7` a `webkit 7 de 7` (`--playwright=webkit --shard=i/7`).
    - Com o job `verificar`, o CI tem onze partes, e o `merge` espera todas.
    - O primeiro push da PR teve o Chromium em 2 e o WebKit em 5. Depois, a matriz de PDF passou a cobrir toda ferramenta contra toda fixture, e a divisão subiu para manter cada parte abaixo de 700 s e o `design.spec.ts` longe da matriz de imagens (DECISOES § 154).
  - **Os core dumps:** cada parte do Playwright os desliga.
    - O `core_pattern` do runner manda o dump ao `systemd-coredump` com limite de 2^63 bytes, e o `ulimit -c 0` sozinho não o para.
    - Por isso, o passo "Core dumps off" troca o padrão por `|/bin/false` (com `sudo -n`), e o passo do `verificar` roda com `ulimit -c 0`.
  - **O passo final** tem `if: always()` e imprime:
    - `df -h / /tmp` e o `core_pattern`;
    - o `coredumpctl list` e o journal do `systemd-coredump`;
    - as linhas do kernel sobre OOM, segfault e falta de espaço.
    - Cada comando termina em `|| true`, sem `continue-on-error`.
  - **O `scripts/lib/disco.ts`** passa a medir o `/` a cada 2 s.
    - Ele imprime uma linha só quando o espaço livre mudou 256 MB.
    - No fim, resume o ponto mais baixo e a maior queda.
    - A busca funda ganha o journal dos core dumps e os processos que mais gravaram.
- **O que não mudou:**
  - o `scripts/verificar.ts`;
  - nenhum teste, portão, limiar, timeout, `retries` ou número de workers;
  - o nome do job `verificar`, o `merge` e o `pos-deploy.yml`.
- **Divisão:** o `--shard` segue a contagem de testes na ordem dos arquivos.
  - No WebKit em 7 partes, o `design.spec.ts` fica inteiro na parte 4, sem a matriz de imagens, que cai na parte 5.
  - A matriz de PDF se divide entre as partes 6 e 7.
- **Tempos** (o total do `verificar` de cada parte, do resumo no log):

  | Execução | `verificar` | Chromium | WebKit |
  | --- | ---: | --- | --- |
  | Antes: F4, [run 41277648653](https://github.com/vmatusita/fileorca/actions/runs/41277648653) | 285,4 s | 529,4 s (1 parte) | 427,1, 273,4 e 664,2 s (3 partes) |
  | F5a com 2 + 5 partes: [run 41331507992](https://github.com/vmatusita/fileorca/actions/runs/41331507992) (`1d551fa`) | 469,3 s | 413,4 e 420,4 s | 520,2, 222,9, 220,1, 545,0 e 400,4 s |
  | F5a com 3 + 7 partes: [run 41342463565](https://github.com/vmatusita/fileorca/actions/runs/41342463565) (6e35bdd, a matriz completa) | 483,1 s | 334,1, 288,2 e 330,1 s | 331,7, 350,9, 167,6, 165,1, 277,4, 409,1 e 334,2 s |

- **Minutos:** a soma dos jobs foi de uns 42 min por push na F4, com 5 partes, e de uns 71 min na F5a, com 11 partes (run 41342463565).
- **Disco:** nas runs 41331507992 e 41342463565, todas as partes do Playwright disseram "No coredumps found.". O mínimo do `/` ficou entre 9.254 e 10.756 MB livres, com no máximo 47 MB de queda em 2 s.
