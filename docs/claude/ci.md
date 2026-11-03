# CI, verificar, Dependabot e merge

O que as runs aprenderam sobre o CI, o `verificar`, o Dependabot, a regra de merge, o Workers Builds e as ferramentas do projeto (Node, pnpm, Astro, Vite, Vitest), com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- O projeto usa Node 24 LTS e pnpm 10 porque o Workers Builds instala o pnpm pelo Corepack, e o Node 26 e o pnpm 12 quebram ali (DECISOES § 17). Scripts de instalação de dependência só rodam se estiverem em `onlyBuiltDependencies` no `pnpm-workspace.yaml`; aprove ali, nunca com flag. Pacote publicado no mesmo dia: fixe a versão anterior em vez de abrir exceção.
- Rodar `pnpm install` fora de um terminal interativo pede `CI=true` quando o pnpm precisa recriar o `node_modules`.
- Astro 7: `build.format` é `preserve` (DECISOES § 16), então toda página é `.../index.astro`. Use Vite 8 com Rolldown: opções em `vite.build.rolldownOptions`, não `rollupOptions`.
- O tsconfig usa `exactOptionalPropertyTypes`: não passe `undefined` para opção opcional, espalhe um objeto condicional.
- O Workers Builds desta conta usa o modelo "Worker Previews" (`wrangler preview`), que pede um bloco `previews` no `wrangler.jsonc`; enquanto a ADR-002 não for decidida, a prévia depende do comando configurado no painel.

## Ajuste da prévia: o que a F1a entendeu errado sobre o Workers Builds

- A falha dos builds do Workers Builds na F1a era o comando de build salvo no painel (`pnpm buid`): os cinco logs lidos param na etapa de build, e os dois lidos até o fim mostram `Command "buid" not found`. O Node 26 e o pnpm 12 instalam sem erro ali (DECISOES § 37): a pegadinha da F1a sobre eles vale só como registro, e o projeto segue em Node 24 e pnpm 10 até o Victor decidir voltar.
- A pegadinha do bloco `previews` é real: o `npx wrangler preview` das branches recusa rodar sem `"previews": {}` no `wrangler.jsonc` (prévia da PR #3). A ADR-002 foi aceita na opção 2 e o bloco vazio faz parte do contrato (DECISOES § 38); nada entra dentro dele sem uma ADR nova. Trocar o comando de prévia no painel não teve efeito em três builds (ADR-002). Isto substitui a última pegadinha da F1a, acima.
- Build do Workers Builds vermelho: o check do GitHub não traz o log. Antes de mudar código ou configuração, peça o log ao Victor (ou leia no Chrome dele, só leitura, quando ele pedir) e procure a linha `Executing user build command`. Não deduza a causa pelo tempo até a falha.
- A configuração mostrada na página de um build nem sempre é a que rodou (no ajuste, o build `d925f68d` mostrava `pnpm build` depois da correção, e o log dele traz `Executing user build command: pnpm buid`). Confie nas linhas `Executing user build command` e `Executing user deploy command` do log.

## F1b: design system e Oli

Pegadinhas que a F1b achou:

- O runner do CI é umas 5 vezes mais lento que a máquina local, e a Oli em loop deixou o axe quase 2 vezes mais lento lá: o `verificar` chegou a 758 s de 900. O `a11y.spec.ts` roda com movimento reduzido (§ 57). Antes de acrescentar testes pesados (vários envios, páginas com animação), confira o tempo do Playwright no log do CI (`gh run view <id> --log`).

## F2: ferramentas de imagem

Pegadinhas que a F2 achou:

- Em `tests/unit/pos-deploy.test.ts`, a regra de antes do lançamento é testada no commit `503b8c3` (o último com `LAUNCHED = false`), porque o pós-deploy lê o `LAUNCHED` do commit que confere.

## Ajuste: CI em partes (ADR-003)

- Para reproduzir uma parte que falhou só no CI, rode o mesmo comando do job, que está no nome do passo. Cada parte do Playwright sobe o relatório como artefato `playwright-report-<n>`.
- Teste novo pesado vai para a parte em que cair pelo `--shard` do Playwright; confira o tempo de cada job no log (`gh run view <id> --log`). Se uma parte passar de uns 700 s, divida mais (outro `--shard`) num ajuste, nunca aumente o limite.
- `tests/unit/verificar.test.ts` prova que as partes juntas são os mesmos passos do todo: um portão novo entra em `STEPS` e cai sozinho na parte certa.

## Ajuste: WebKit em três partes

- O `--shard` do Playwright, com `fullyParallel: true`, divide por contagem de testes na ordem dos arquivos. Hoje a parte 1 fica com o `a11y`, o `ads` e o `budgets`; a 2, com o `design`, os de cookies e o `coffee`; a 3, com a matriz, o `image-smoke` e o resto. Spec novo no começo da lista empurra para as partes seguintes testes que hoje estão nas primeiras. Antes de somar muitos testes, rode `pnpm exec playwright test --project=webkit --shard=i/3 --list` e veja onde caem.

Pegadinhas que o ajuste achou:

- Depois de um `gh run rerun <id>`, o `gh run view <id> --log` mostra a última tentativa. Para ler uma tentativa anterior, use `gh run view <id> --attempt <n> --log`, e o mesmo `--attempt` com `--json jobs`.
- O tempo do job não é o tempo da parte. O `playwright install --with-deps` chegou a 356 s num rerun, porque o apt do runner estava lento, e esse tempo fica fora do `verificar` e do limite de 900 s. Compare as partes pelo `total` do resumo do `verificar` no log.
- Na primeira execução com três partes, o `/` da parte 2 do WebKit caiu de 10,9 GB livres para 609 MB em 60 s do `design.spec.ts` (da Oli a 1280 × 800 às regressões da revisão), e o diagnóstico de disco não achou onde (DECISOES § 108). No rerun não aconteceu. Se uma parte do WebKit falhar com `ENOSPC`, comece pelas linhas `[disco]` dela.

## Ajuste: diagnóstico de disco

- O `scripts/lib/disco.ts` (só no Linux do CI) faz uma busca funda quando o `/` perde mais de 2 GB: as linhas `[disco] busca funda:` trazem os arquivos apagados e ainda abertos (do `/proc`, com os processos), os arquivos grandes gravados desde o início, as pastas de `/var`, os dumps e os maiores processos (DECISOES § 109). Se uma parte falhar com `ENOSPC`, leia essas linhas antes de mexer em teste.
- Todo `find` do diagnóstico roda com `timeout` e `nice` dentro do próprio comando e diz se foi "completo" ou "interrompido". Um `find` com o timeout do `execSync` em volta morre sem imprimir e deixa o processo órfão: foi assim que o `find` antigo disse "(nenhum)" por 20 s em toda parte, desde a § 90.
- A busca funda só roda no Linux, então o `tests/unit/disco.test.ts` prova a leitura do `/proc` no Vitest do CI. No Windows, o mesmo teste só confere que não há `/proc`. Teste que depende do sistema ramifica por dentro e nunca usa `skip` nem `runIf`.

## F4: calculadoras

Pegadinhas que a F4 achou:

- O `ENOSPC` do WebKit do CI segue o `design.spec.ts` em qualquer parte (§ 108, § 109 e § 141). Se uma parte cair assim, leia as linhas `[disco]` e rode de novo só ela; não mexa em teste.

## F5a: ferramentas de PDF

Partes do CI (o que continua valendo depois da F9, que tirou a lista das partes de então):

- **O que cada parte do Playwright faz:** desliga os core dumps e termina com o passo "Disk and core dumps" (`if: always()`). O `disco.ts` amostra o `/` a cada 2 s (§ 154).

Pegadinhas que a F5a achou:

- O `pnpm tipos` (`astro check`) confere também os specs: um `getByRole('button', { name: texts.panel.action })` com texto opcional reprova no CI. Rode o `pnpm tipos` antes do push, não só o Vitest e o Playwright.

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **O Vitest 5 guarda um cache de módulos em `node_modules/.vitest-cache`**, pela chave do conteúdo do arquivo. Um `import.meta.glob` que deveria ver arquivos novos (as pastas `br-*`) fica com o resultado velho enquanto o arquivo que chama o glob não muda. Se um teste diz que um texto "não existe" e o build acha, apague `node_modules/.vitest-cache` e rode de novo.
- **O `.github/` não mudou,** mas com 1.038 testes por navegador a parte 1 do Chromium (o `a11y` inteiro) chegou a 764 s e a 3 a 711 s no CI, acima do alvo de 700 s (§ 243). A próxima run que somar páginas divide o Chromium em 4 partes primeiro. A estimativa pelo par em inglês errou para menos: os testes de pt e es custam mais no runner. Antes de somar testes, rode o `--list` das partes e compare com os tempos do último CI (`gh run view <id> --log`).

## F7: casa, saúde e QR code

Partes do CI (o que continua valendo depois da F9, que tirou a lista das partes de então):

- **Antes de somar specs:** rode o `--list` de cada parte (Chromium em 4, WebKit em 8) e veja onde caem o `design.spec.ts` e o `image-matrix.spec.ts`, que nunca podem ficar na mesma parte do WebKit (§ 142).

## F8: piloto automático

O Dependabot (§ 298 e § 299):

- **O arquivo** é `.github/dependabot.yml`: npm e GitHub Actions, mensal (dia 1, 06:00 de São Paulo), um grupo de minor e patch por ecossistema, major em PR própria, `cooldown` de 7 dias, `labels: []` e `ignore` sempre com a razão no comentário de cima (o `tests/unit/dependabot.test.ts` reprova `ignore` sem razão).
- **Fica para o Victor:** toda major, toda PR de GitHub Actions (mexe em `.github/workflows/`) e o que o `docs/OPERACAO.md` lista depois de certas PRs.
- **Teste que fixa versão:** se uma PR do grupo ficar vermelha porque um teste fixa uma versão sem razão de produto, o teste passa a ler a versão do `package.json` ou do lockfile (run curta). Se a versão nova quebra de fato, a dependência ganha um `ignore` com a razão.

A regra de merge (§ 297):

- Os eventos de exemplo estão em `fixtures/merge-events/`, e o `tests/unit/merge-events.test.ts` os leva pelo mesmo caminho do job (o `env` do Decide, o `git diff`, o `jq` do próprio `ci.yml` e o CLI com o `GITHUB_OUTPUT`). Caso novo é um JSON a mais.
- A chamada do CLI no `ci.yml` não muda junto com o script: o job roda o `pode-mesclar.ts` da base, e uma chamada nova chegaria ao script velho. Mudar a chamada pede duas PRs (primeiro o script aceita as duas formas, depois o `ci.yml` muda), e o teste fixa a chamada de hoje.
- Toda issue dos workflows leva `--assignee "$OWNER"` (§ 301): o `tests/unit/ci-workflows.test.ts` reprova uma sem isso, e o `tests/unit/operacao.test.ts` reprova título de issue que o `docs/OPERACAO.md` não cite.

Partes do CI (o que continua valendo depois da F9, que tirou a lista das partes de então):

- **O `tests/unit/verificar.test.ts`** lê a matriz do próprio `ci.yml`. Antes de somar specs, rode o `--list` das partes e veja onde caem o `design.spec.ts` e o `image-matrix.spec.ts` (§ 142).

Pegadinhas que a F8 achou:

- **O Victor não assistia o repositório:** issue sem responsável podia não dar e-mail. Por isso o `--assignee`.

## Ajuste: idiomas

Partes do CI (o que continua valendo depois da F9, que tirou a lista das partes de então):

- **O `tests/unit/verificar.test.ts`** lê as duas matrizes do `ci.yml`. Antes de somar specs, rode o `--list` das partes e veja onde caem o `design.spec.ts` e o `image-matrix.spec.ts` (§ 142).

Pegadinhas que o ajuste achou:

- **A estimativa das partes do CI** é o tempo médio por teste de cada spec na última execução, vezes os testes de cada spec no `--list` da parte, dividido pelos 2 workers, mais 33 s. Ela reproduziu a F8 com erro de 1 a 3 %, mas os testes de pt e es custaram mais no runner do que os do inglês (§ 320).
