# Ajuste · Diagnóstico da queda de disco do WebKit no CI: relatório

Branch `ajuste-ci-disco`, PR [vmatusita/fileorca#10](https://github.com/vmatusita/fileorca/pull/10), que depende da [vmatusita/fileorca#9](https://github.com/vmatusita/fileorca/pull/9). Prompt: `docs/prompts/prompt-ajuste-ci-disco.md`. Decisão: DECISOES § 109. Run de 31/out/2026, feita na mesma sessão do `ajuste-ci-webkit-tres`, a pedido do Victor.

## Resumo

- **O que se procurava:** na run 41250641460, tentativa 1, o `/` da parte `playwright (webkit 2 de 3)` caiu de 10,9 GB livres para 609 MB durante o `design.spec.ts`, e o diagnóstico não achou onde.
- **O que mudou:** o `scripts/lib/disco.ts` ganhou uma busca funda, que roda quando o `/` cai mais de 2 GB.
- **Medida:** cinco execuções da parte 2 de 3 com o diagnóstico novo (a primeira e mais quatro repetições só desse job). A queda não voltou. Com as duas da PR #9, ela apareceu 1 vez em 7. A causa segue desconhecida, e o diagnóstico fica pronto para a próxima vez.
- **Correção da § 108:** o `find` do fim, que "não achou nada", nunca chegou a terminar. Ele parou no timeout de 20 s em todas as partes de todas as execuções desde a § 90. Agora ele termina em 2 a 4 s e diz se foi completo ou interrompido.
- **O que não mudou:** nenhum teste, portão, limiar, timeout, `retries`, número de workers ou arquivo do `.github/`.

Prévia do Cloudflare (commit `7669259`): https://ajuste-ci-disco-fileorca.vmatusita.workers.dev.

## O que mudou

- **`scripts/lib/disco.ts`:** continua só lendo e só no Linux do CI.
  - **Busca funda:** quando o `/` perde mais de 2048 MB desde a linha de base, no máximo duas vezes durante a execução e de novo no fim se o espaço não voltou. As linhas `[disco] busca funda:` trazem:
    - os arquivos apagados e ainda abertos no `/`, lidos do `/proc`, em blocos de disco, cada um uma vez, com os processos que os seguram e quantos processos não deu para ler (deste usuário e de outros);
    - os arquivos acima de 20 MB gravados desde o início, começando por `/tmp`, `/home` e `/var`;
    - o `du` de `/var/log`, `/var/tmp`, `/var/crash`, `/var/cache` e `/var/lib/systemd/coredump`, o `core_pattern` e a lista dos dumps;
    - os maiores processos (`ps` por RSS).
  - **Linha de base:** sobe quando o espaço volta, então uma segunda queda também aparece.
  - **`find`:** roda com `timeout -k 5` e `nice -n 19` dentro do próprio comando. Assim ele termina, o `sort` imprime o que viu e não sobra processo órfão. Cada saída diz "(completo em N s)" ou "(interrompido em N s, resultado parcial)". O `find` do fim olha só `/tmp`, `/var` e `/home`.
  - **Erros:** cada seção da busca tem o próprio `try`, e um erro do diagnóstico nunca derruba a parte.
- **`tests/unit/disco.test.ts`** (8 testes):
  - o `df`;
  - o gatilho, com o teto de duas buscas e a linha de base que sobe;
  - o resumo dos arquivos abertos;
  - a leitura do `find`;
  - o rótulo de corte;
  - um arquivo apagado e ainda aberto achado no `/proc`. No Linux, este roda de verdade e passou no Vitest do CI; nos outros sistemas, confere que não há `/proc`, então nunca aparece como pulado.
- **`DECISOES.md`:** § 109. **`CLAUDE.md`:** seção nova no fim, "Ajuste: diagnóstico de disco".

## Revisão

Um subagente Sonnet revisou o diff em contexto limpo, duas vezes, e eu corrigi tudo o que ele achou.

- **Primeira passada:**
  - o timeout do `execSync` matava só o `sh`, deixava o `find` órfão e devolvia "(nenhum)";
  - o tamanho aparente no lugar dos blocos em disco;
  - arquivos de outros sistemas de arquivos na soma;
  - nenhum teto de buscas;
  - a linha de base que nunca subia;
  - um `try` só para a busca inteira;
  - partes sem teste.
- **Segunda passada:**
  - o `ionice` podia falhar em silêncio e deixar o `find` sem disco;
  - o `find` da busca começava pelo `/` inteiro;
  - a contagem dos processos sem leitura misturava root e o próprio usuário;
  - o arquivo do teste era compressível;
  - um comentário afirmava o que não estava provado;
  - o `it.runIf` aparecia como pulado no Windows. Pela letra do `CLAUDE.md`, isso é pular teste, e ele virou um teste que sempre roda e ramifica por dentro.

O primeiro achado da primeira passada levou à medida que corrige a § 108: em todas as partes das runs 41231605642, 41236243545, 41241805727 e 41250641460, o "(nenhum)" do `find` antigo saiu exatos 20,0 s depois do título.

## `pnpm verificar` local

Windows 11, AMD Ryzen 5 7600X, Node 26.8.1 (o CI usa o 24.22.2) e pnpm 10.34.9, no commit `2237678`, o último com código. Vitest: `Test Files 49 passed (49)` e `Tests 786 passed (786)`. Playwright: `536 passed (2.4m)`. A saída completa está em `.cache/ajuste-ci-disco/verificar-3.log`.

```text
Resumo do pnpm verificar (tudo)
  ok       7.6 s  tipos (astro check)
  ok       2.5 s  lint (eslint)
  ok       8.9 s  build (astro build do zero)
  ok       5.3 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.3 s  worker sem código
  ok       0.4 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       0.5 s  conteúdo mínimo das ferramentas e do site
  ok      17.7 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.5 s  licenças
  ok       0.4 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     145.2 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      72.9 s  lighthouse ci
  ok       0.4 s  lint:texto (LanguageTool)
  total 269.4 s (limite 900 s)
verificar exit 0
```

## CI na PR

Run [41255949928](https://github.com/vmatusita/fileorca/actions/runs/41255949928), commit `7669259`, verde nas cinco partes. No Vitest do job `verificar`, `tests/unit/disco.test.ts (8 tests)` passou no Ubuntu, com o teste do `/proc` incluído.

| Parte | Total do `verificar` | Job | Mínimo livre no `/` | `find` do fim |
| --- | ---: | ---: | ---: | --- |
| `verificar` | 161,2 s | 300 s | 10 798 MB | completo em 3,7 s (o binário do Chromium do Playwright, 287 MB) |
| `playwright (chromium)` | 381,0 s | 519 s | 9708 MB | completo em 3,0 s (o mesmo binário) |
| `playwright (webkit 1 de 3)` | 213,3 s | 337 s | 10 325 MB | completo em 2,5 s, nenhum |
| `playwright (webkit 2 de 3)` | 141,0 s | 528 s | 10 892 MB | completo em 2,3 s, nenhum |
| `playwright (webkit 3 de 3)` | 556,8 s | 817 s | 10 261 MB | completo em 2,5 s, nenhum |

Nos jobs, o tempo a mais sobre o `verificar` vem do `playwright install --with-deps`, como no ajuste anterior.

Repetições só do job `playwright (webkit 2 de 3)` (`gh run rerun 41255949928 --job <id>`):

| Tentativa | Resultado | Total do `verificar` | Job | Mínimo livre no `/` | Buscas fundas |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | verde | 141,0 s | 528 s | 10 892 MB | 0 |
| 2 | verde | 122,2 s | 248 s | 10 898 MB | 0 |
| 3 | verde | 149,3 s | 281 s | 10 890 MB | 0 |
| 4 | verde | 181,8 s | 353 s | 10 895 MB | 0 |
| 5 | verde | 183,7 s | 304 s | 10 885 MB | 0 |

A queda não se repetiu, então a busca funda não rodou no CI. O teste do `/proc` no Vitest do CI é o que prova que a leitura dela funciona no runner.

O job `merge` comentou "Merge automático: não. A PR mexe em .github/workflows/, então o merge fica para o Victor." em cada tentativa. Isso é esperado enquanto a PR #9 não entrar na `main` (veja abaixo).

## O que a medida mostra

- **Frequência:** a queda apareceu 1 vez em 7 execuções da parte 2 de 3, todas com o mesmo código de teste. É intermitente: com a mesma divisão e o mesmo código, ela aparece numa execução e não na outra. Com o WebKit em duas partes, não apareceu em nenhuma das cinco execuções conferidas.
- **Onde não está:** no fim da execução com a queda, o `du` de `.`, `/tmp`, `/dev/shm` e `$HOME` somou uns 2,5 GB. Os 10 GB não estavam em arquivo comum dessas pastas.
- **Candidatos:** um arquivo apagado e ainda aberto (o `df` conta, o `du` não) ou um arquivo numa pasta que o `du` não olhava, como `/var/log` ou os dumps de processo. A busca funda mostra os dois.
- **Na próxima queda,** o log da parte terá a linha `[disco] busca funda: o / caiu para N MB livres`, com a resposta. Se ela mostrar que a saída mexe no `.github/` ou no `playwright.config.ts`, a proposta vai para o Victor (§ 109).

## Decisão nova

**§ 109 · O diagnóstico de disco olha mais fundo quando o `/` cai, e o `find` do fim deixa de mentir.**

- A busca funda roda quando o `/` cai mais de 2 GB (no máximo duas vezes, e uma no fim), mostrando os arquivos apagados e abertos, os arquivos novos, `/var`, os dumps e os processos.
- O `find` roda sob o próprio limite e diz se terminou.
- A § 108 é corrigida: aquele `find` nunca terminou.
- A queda não se repetiu em cinco execuções. Causa ainda desconhecida.

O texto inteiro está no `DECISOES.md`.

## O que é do Victor

1. Mesclar a PR [vmatusita/fileorca#9](https://github.com/vmatusita/fileorca/pull/9) pelo GitHub, com "Squash and merge", e apagar a branch. Ela mexe em `.github/workflows/`, e as travas do repositório (`gh pr merge` negado no `.claude/settings.json`) deixam esse merge com você.
2. Depois disso, trazer a `main` para esta branch (`git merge origin/main` na `ajuste-ci-disco`) e fazer o push. A PR #10 passa a mostrar só o diagnóstico, e o job `merge` do CI a mescla sozinho quando o CI ficar verde. Esse passo pode ser meu, na mesma sessão, assim que a #9 entrar.
3. Na próxima queda de disco no CI, ler as linhas `[disco] busca funda:` da parte. A causa vai estar ali.
