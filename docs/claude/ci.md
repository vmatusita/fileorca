# CI, verificar, Dependabot e merge

O que as runs aprenderam sobre o CI, o `verificar`, o Dependabot, a regra de merge, o Workers Builds e as ferramentas do projeto (Node, pnpm, Astro, Vite, Vitest), com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

Os números de partes das seções de antes da F9 ("Hoje a parte 1…", "Chromium em 4, WebKit em 8", "divide o Chromium em 4 partes") são os de cada época. A divisão de hoje está no fim da seção da F9.

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

## F9: o CI por classes, o build único e o ci-ok

O CI desde a F9 (DECISOES § 323 a § 340 e o adendo da F9 na ADR-003). O comentário do topo do `.github/workflows/ci.yml` diz o mesmo, em inglês.

- **As classes** saem do `scripts/ci/classificar.ts`, lido da base:
  - rascunho sem o rótulo `ci`: `leve`, que roda tipos, lint, build e Vitest num job só;
  - rascunho com o rótulo, ou PR pronta: `completo`, ou `portões` quando todo arquivo do diff é documentação.

  "Documentação" é todo arquivo em `docs/` fora de `docs/design/` e de `docs/oli/`, ou um `.md` da raiz. Diff vazio ou ilegível conta como `completo`. Um rótulo qualquer recalcula a classe (`labeled`); tirar um rótulo não roda nada.
- **Os jobs:**
  - `classificar`;
  - `leve`;
  - `build`: o build único e o artefato `site`, com o `dist/` e o `.cache/bundle-modules.json`, guardado por 1 dia;
  - `portoes`: `--sem-playwright --sem-lighthouse --dist-pronto`;
  - `lighthouse`: `--lighthouse --dist-pronto`;
  - `playwright`: as 18 partes do ajuste idiomas, com `--dist-pronto`;
  - `ci-ok`, `merge`, `alerta-dependabot` e `pos-deploy`.

  O pulo é por `if` de job, nunca por `paths`.
- **O `ci-ok`** roda sempre e é o único check que o ruleset (`docs/ops/ruleset-main.json`) exige. Verde só com a classe saída e cada job que ela pede verde (`REQUIRED` do `scripts/ci/ci-ok.ts`, lido da base).
  - Job novo de verificação entra no `needs` do `ci-ok` e no `REQUIRED`; o `tests/unit/ci-workflows.test.ts` reprova a falta.
  - O `merge` espera o `ci-ok` e não roda em rascunho nem em PR de fork.
- **A prova de que as partes são o todo:** o `tests/unit/verificar.test.ts` lê as partes do `ci.yml` pelo `ciParts()` (`scripts/lib/ci-parts.ts`) e confere que juntas cobrem o `pnpm verificar` inteiro, com o build uma vez e cada portão uma vez. Cada comando é comparado sem as opções (`--project`, `--shard`), então a prova vale para qualquer número de partes.
- **Na máquina:** `pnpm verificar` sem argumento continua rodando tudo, num processo só. `pnpm verificar --partes` roda as partes do `ci.yml` em sequência, o build uma vez, cada parte com o próprio limite de 900 s, e soma.
- **O custo:** `pnpm ci:custo <run-id>` (com `--attempt <n>` depois de um rerun). O relatório traz o da última execução do CI (regra 5).
- **Os scripts lidos da base** (`pode-mesclar.ts`, `classificar.ts` e `ci-ok.ts`): a chamada de cada um no `ci.yml` não muda depois de ir para a main, porque o job roda o script da base. Dado novo entra no JSON que o `jq` monta, e o script novo aceita a falta dele ou recusa.

Pegadinhas que a F9 achou:

- **O repositório é público desde a criação** (28/out/2026, o `PublicEvent` da API). Os planos supunham privado. Logs, artefatos e `refs/pull/*` são públicos: nada de dado pessoal, token ou achado de auditoria em log, artefato, commit ou PR.
- **O rótulo `ci` não existia** na F9, e criar rótulo é do Victor. Sem ele, a execução completa no meio da run sai do `gh pr ready`, e o `gh pr ready --undo` volta ao rascunho.
- **O `upload-artifact` ignora caminho oculto** desde a v4.4: o `.cache/bundle-modules.json` só entra no artefato com `include-hidden-files: true`.
- **O cache das ferramentas guardava a pasta `.cache/` inteira** (uns 555 MB por PR, com os builds do `gate:prontidao` e um `bundle-modules.json` velho). Desde a F9 ele guarda só as pastas das ferramentas fixadas e, no `portoes`, volta antes do download do artefato. O cache do Actions de uma PR só serve à própria PR, e a `main` não gera cache: a primeira execução de cada PR é fria.
- **Um job de matriz pulado** aparece no `gh run view` e no `ci:custo` com o nome sem expandir: `playwright (${{ matrix.part }})`.
- **O Node roda os `.ts` de `scripts/` por remoção de tipos**, que recusa "parameter property" (`constructor(private x)`) com `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. O Vitest aceita, então o erro só aparece quando o Node roda o arquivo direto. Nada de parameter property, `enum` ou `namespace` em arquivo que um script importa.
- **A meta de minutos de uma execução completa:** o passo `pnpm verificar` das partes é uns três quartos do custo, e o preparo e o build somam um quinto. A economia grande vem das execuções que deixam de ser completas: o rascunho e a PR só de documentação (§ 339).
- **Medir na máquina com outros agentes rodando** deixa o Vitest e o Playwright lentos. Os tempos do relatório saem com a máquina livre, ou dizem que não.
- **O `pnpm verificar --partes` confere o `dist/build.txt` contra o `HEAD` no começo de cada parte:** um commit ou um merge no checkout enquanto ele roda faz as partes seguintes pararem. Integre o trabalho dos agentes numa worktree desanexada (`git worktree add --detach`) e traga o resultado depois.
- **Um push seguido do `gh pr ready` (ou de um rótulo novo) cancela a execução anterior do mesmo commit,** e o `ci-ok` dela roda assim mesmo (`always()`) e sai vermelho, porque a classificação foi cancelada. A API mostra o que fica: os dois check runs `ci-ok` (o vermelho da cancelada e o verde da execução nova) continuam no commit, em suítes diferentes, e o `statusCheckRollup` do commit `8727853` da PR da F9 ficou `FAILURE`. Não se sabe se o ruleset bloqueia o merge por causa do vermelho velho: não foi testado (pendência "F9 ci-ok duplicado"). O `if: always()` do `ci-ok` fica, porque a ficha da F9 o manda; trocar por `!cancelled()` é decisão do Victor, depois do teste.
- **O `success()` implícito do `if` de um job olha também os ancestrais indiretos:** um job pulado dois níveis acima pula o job, mesmo com o `needs` direto verde. Na F9, o `leve` (pulado em toda execução completa) pulou o `merge` através do `ci-ok`. Job que tem de rodar depois de jobs de classes que se excluem leva uma função de status no `if` (`!cancelled()`, `always()` ou `failure()`) e confere o resultado do `needs` direto; o `tests/unit/ci-workflows.test.ts` reprova a falta.
- **O tipo de máquina do runner mudou entre a linha de base e a F9,** uma vez, e a causa é desconhecida. A linha de base e as execuções de antes rodaram com 72 GB no `/`, e todas as execuções da PR da F9 com 145 GB; os mesmos testes ficaram uns 30 % mais rápidos. A imagem base é a mesma, com alguns jobs numa versão mais nova. O `nproc` (4 vCPU) só passou a ser impresso na F9, então a linha de base não tem essa medida. Para comparar o custo entre execuções, use a conta controlada da § 339 (cada parte com o tempo de teste de uma execução só), não só o total do `ci:custo`.
- **O `apt` dos pacotes do sistema do WebKit varia** de 32 a 62 s, e passou de 90 s uma vez em cada execução completa da F9 (§ 325). O passo "Wait for the browser" mostra o tempo de cada fase (linhas `[navegador]`) e passa a mostrar a linha "Fetched" do `apt` (ela entrou depois da última execução completa da F9 e ainda não apareceu num log): leia as duas antes de mexer no preparo.

O que a revisão da F9 acrescentou:

- **O fim da run:** com tudo commitado, rode o `gh pr ready` antes do último push, para o último commit ganhar uma execução só, a completa (o `gh pr ready` dispara uma completa no commit de antes, que o push cancela); ou espere a execução leve do último push terminar antes do `gh pr ready`. O push seguido logo do `gh pr ready` deixa no último commit o `ci-ok` vermelho da execução leve cancelada, ao lado do verde da completa (pegadinha acima). Prefira a primeira: na segunda, até a completa terminar, o único `ci-ok` do commit é o verde da leve (o `merge` automático espera o da completa, mas um merge à mão nessa janela passaria só com tipos, lint e Vitest). Esta linha acrescenta à regra 1 do `CLAUDE.md`, que tem a mesma nota.
- **O `ci-ok` lê o estado de rascunho da PR na hora** (`gh api` com `pull-requests: read`, em `PR_DRAFT_NOW`). A classe vem do payload do evento, e a execução de um `synchronize` mandado com a PR em rascunho pode sobreviver ao `ready_for_review` do segundo seguinte (o `cancel-in-progress` fica com a última enfileirada, e a ordem dos webhooks não é garantida). Uma execução `leve` de uma PR que já está pronta sai vermelha, com a linha "a classe é leve, mas a PR está pronta". Sem o `PR_DRAFT_NOW`, ou com outro valor que `true` e `false`, o script falha. Para a completa rodar nesse caso: `gh pr ready --undo` e `gh pr ready` de novo, ou rodar de novo a execução cancelada do `ready_for_review`. Um erro passageiro do `gh api` também deixa o `ci-ok` vermelho, de propósito (falha fechada): rode a execução de novo.
- **O passo Verdict só fica verde com a linha `ci-ok: verde` na saída** (`tee` num arquivo e `grep -qx`, com o `pipefail` ligado no passo, porque o shell padrão de um `run:` é `bash -e`, sem `pipefail`). Um script que nunca chega ao veredito (um Node sem `import.meta.main`, vindo do `.node-version` da PR) falha o passo. Mudou o texto da linha verde no `ci-ok.ts`: são duas PRs, como na § 297, porque o job lê o script da base. A primeira faz o `grep` do `ci.yml` aceitar os dois textos; a segunda troca o texto do script.
- **O `alerta-dependabot` tem `!cancelled()` no `if`:** o `ci-ok` de uma execução cancelada sai vermelho, e isso não é CI vermelho.
- **O `gh run rerun <id> --failed` só vale em até 24 h da execução:** as partes baixam o artefato `site` do job `build`, guardado por 1 dia, e um rerun só da parte vermelha depois disso falha no download, por uma razão que nada tem a ver com a falha de antes. Depois de 24 h, use o "Re-run all jobs" (que refaz o `build`; não testado na F9) ou um push.
- **A divisão de hoje:** o Chromium em 5 partes e o WebKit em 13, as 18 partes do job `playwright`, com 2 workers cada (as do ajuste idiomas, § 320). A F9 não mudou a divisão; a F9b redivide para as máquinas de hoje.
- **A proteção contra fork:** os jobs que escrevem (`merge`, `alerta-dependabot` e a chamada do `pos-deploy`, e o job `conferir` do `pos-deploy.yml`) têm no `if` a guarda `github.event.pull_request.head.repo.full_name == github.repository`; o `pode-mesclar.ts` só mescla PR cujo head é deste repositório e cujo autor é o dono ou o Dependabot, com os campos `headRepo`, `repo` e `repoOwner` que o `jq` do `merge` monta; nenhum workflow usa `pull_request_target` (o `tests/unit/ci-workflows.test.ts` reprova). O `ci-ok` de uma PR de fork roda o `ci.yml` da própria PR, então o merge dela é sempre do Victor (§ 333).
- **O histórico do checkout:** `fetch-depth: 0` só onde ele é lido, no `classificar`, no `leve`, no `portoes` e no `merge`; o `build`, o `lighthouse`, as partes do `playwright` e o `ci-ok` fazem o checkout raso (§ 328). Teste novo do Vitest que lê o histórico roda no `leve` e no `portoes`, que já têm tudo.
- **O preparo em segundo plano:** nas partes do `playwright` e no `lighthouse`, o navegador e os pacotes do sistema instalam por `npx playwright@<versão do lockfile>` em segundo plano, enquanto o job baixa o artefato e prepara o Node e o pnpm, e o passo "Wait for the browser" espera e falha se a instalação falhou (§ 325).
- **Para reproduzir uma parte na máquina:** `pnpm verificar --build` e depois o comando do passo do job, que leva `--dist-pronto` e para se o `dist/build.txt` não for o `HEAD`.
- **O `apt` do espelho do runner pode travar no download dos pacotes do WebKit** por minutos: na execução final da F9, a espera de 300 s se esgotou com o download parado no meio. A espera do "Wait for the browser" é de 1.200 s, abaixo dos 30 min do job; não a encurte. Uma parte que parar aí pede só rodar de novo.
- **O checkout raso da árvore inteira pode levar minutos:** são 448 MB versionados, 392 MB deles capturas de tela de `docs/relatorios/`, e um checkout raso não aproveita os pacotes prontos do servidor (na F9, de 13 a 132 s). Os jobs `build`, `lighthouse` e `playwright` fazem checkout esparso sem `docs/relatorios/`. Um spec, um portão do build ou o Lighthouse que passe a ler `docs/relatorios/` reprova no `tests/unit/ci-workflows.test.ts`; se precisar mesmo, tire o padrão do job e registre.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **`gh pr ready` seguido de `gh pr ready --undo` não serve para conferir no Linux no meio da run:** o job `merge` decide pelo `github.event.pull_request.draft` do evento (o `if` dele e o JSON que o `pode-mesclar` lê), e o `ci-ok` só olha o rascunho de agora (`PR_DRAFT_NOW`) na classe leve. A execução do `ready_for_review`, se ficar verde, chega ao `gh pr merge` mesmo com a PR de volta ao rascunho: ou mescla a PR pela metade, ou, se o GitHub recusar o rascunho, deixa o job vermelho, um comentário na PR e uma issue para o Victor. Sem o rótulo `ci`, a conferência no Linux é a execução final, com tudo commitado (§ 401).
- **Com outro agente rodando na máquina, o Vitest inteiro deu timeouts de 5 s** nos testes do `conteudo.test.ts` que rodam o portão em subprocesso e no `pdf-hardening.test.ts` (1 a 3 de 1.800; sozinhos, de 1 a 3 s). Rode de novo com a máquina livre e meça o portão antes e depois (o versão do commit de antes e a de agora, alternadas, sobre o mesmo `dist/`) antes de achar que o código ficou lento (§ 400).
- Uma rota indexável nova nasce órfã no `gate:links` até uma página de outra rota ligar a ela. O menu de idioma e os `hreflang` dela mesma não contam. Na F11, o hub de guias só saiu da lista de órfãs com a trilha dos guias (Início › Guias › o guia): planeje a primeira entrada junto com a rota.

## F13a: página de ferramenta

Pegadinhas que a F13a achou no aviso compacto, na Oli por estado, na página de ferramenta "um lugar só", nas peças de PDF, no chip que leva o arquivo, nos ícones e no soltar em qualquer lugar (DECISOES § 456 em diante).

- **O `tests/unit/conteudo.test.ts`, "checks the ten file guides of the registry, and fails when one loses its tool or is missing (F5b)"**, roda o portão num processo filho e reprovou uma vez por tempo quando rodou com o `pnpm tipos` ao mesmo tempo na máquina. Passou nas duas vezes seguintes, sem mudança. Não rode o Vitest inteiro ao lado do `astro check`. (os ícones)

## F13b: calculadoras, guia, home, hubs e institucionais

Pegadinhas que a F13b achou no card das calculadoras e no QR code, no guia de arquivo, na home e nos hubs, nas páginas institucionais e no rodapé, no resultado a 320 px e na fonte de reserva (DECISOES § 535 em diante):

- **O `src/components/home-numbers.ts` importa o `qr.ts`, que importa o `qrcode` e um `?raw`:** ele serve ao Astro e ao Vitest, não a um script do Node puro. Um script que precise dos números da home lê as fontes direto (o `data/guides-measured.json`, as fixtures e o `MAX_BYTES`), como o `home-numbers.test.ts`.
- **O Vitest inteiro com as outras frentes rodando na máquina** estourou os 5 s em 8 testes (o `conteudo.test.ts` e três de PDF); os quatro arquivos passam sozinhos (170 testes). É carga da máquina, não regressão.
- **O `gate:links` confere os `#` (§ 585):** todo link para uma parte de página (`#id` na mesma página ou `/guides/#image` em outra) precisa achar o id na página de destino (929 links em 211 páginas na F13b). Um id gerado a partir de texto que mudar quebra o portão, não só o teste.
- **Teste somado depois de um spec pesado muda a parte dele (§ 592):** o `--shard` corta por contagem na ordem dos arquivos, e um spec com `beforeAll` (o `useTestBuild`) vira grupos de `ceil(n / partes)` testes seguidos, cada um num worker só. Os 280 testes da F13b, todos depois de `ads`, levaram o `ads.spec.ts` inteiro para a parte 1 do Chromium (771 s por worker projetados). Projete cada parte com o tempo de cada teste da última execução completa (`gh run view <id> --log --job <id>`, só leitura), somado sobre os testes que o `--list --shard=k/n --reporter=json` dá a cada parte, e, se uma parte passar de 650 s, mova testes pesados para um arquivo cujo nome caia numa parte leve, com os ajudantes em `tests/e2e/lib/` (o `clearance.spec.ts` e o `lib/ad-clearance.ts`).
- **Nenhum commit enquanto o `pnpm verificar --partes` roda:** a parte do build grava o `HEAD` no `dist/build.txt`, e as partes seguintes rodam com `--dist-pronto`, que reprova se o `HEAD` mudou. Na F13b, um commit das imagens do relatório no meio da execução derrubou a parte do Lighthouse em 0,1 s ("o dist/ é de outro commit"), e a execução inteira teve de recomeçar. Edite à vontade, mas commite antes ou depois.
