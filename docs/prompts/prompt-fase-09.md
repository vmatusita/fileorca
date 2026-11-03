# Fase 9: CI e runs mais rápidos e baratos, e preparo do repositório público

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F9 do FileOrca, a primeira fase do `PLANO-MELHORIAS.md`: corte o custo e o tempo de cada run, no CI e no agente, sem tirar nenhum teste, e deixe o repositório pronto para virar público com segurança.

Ao terminar:

- uma execução completa do CI gasta pelo menos 35 % menos minutos de job que a linha de base. O build sai uma vez por execução, o preparo de cada job do Playwright leva até 90 s, PR em rascunho roda só um job leve e PR só de documentação pula o Playwright e o Lighthouse;
- um job `ci-ok` resume o CI, e o merge espera por ele;
- o `pnpm ci:custo <run-id>` mede o custo de qualquer execução, e o `pnpm verificar --partes` roda as partes do CI em sequência na máquina local;
- o `CLAUDE.md` tem até 25 KB, sem perder regra: o resto foi, com o texto igual, para `docs/claude/`;
- o repositório está pronto para o Victor torná-lo público: a auditoria em `.cache/auditoria-publico.md` (fora do Git), a proteção contra PR de fork, o README, o SECURITY, a licença, e o passo a passo e o ruleset no `docs/OPERACAO.md` e em `docs/ops/`.

O site não muda. Nada é publicado, e nenhuma configuração do GitHub ou do Cloudflare muda. Tudo vai numa PR da branch `fase-09`, com o relatório. A PR mexe em `.github/workflows/`, então o merge é do Victor: a run termina com a PR pronta e a execução completa do CI verde.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. O CI roda no GitHub Actions, em `ubuntu-24.04` com 2 vCPU. O repositório é privado, no GitHub Free, com 2.000 min de Actions por mês.

A main está em `bbd30c8` (o ajuste "idiomas" mesclado) ou num commit mais novo. Confira com `git log --oneline -5`. O SHA da `origin/main` no começo da run é o "antes da F9": guarde-o no plano, porque o teste do `CLAUDE.md` lê o arquivo desse commit.

O CI de hoje (`.github/workflows/ci.yml`, § 320):

- dispara em `opened`, `synchronize`, `reopened` e `ready_for_review`, com `concurrency` por PR e `cancel-in-progress`;
- tem 20 jobs de verificação: o `verificar` em 2 partes (`portões` e `lighthouse`) e o `playwright` em 18 (Chromium em 5, WebKit em 13). Depois vêm o `merge` (que roda o `scripts/ci/pode-mesclar.ts` da base), o `alerta-dependabot` e o `pos-deploy`;
- cada parte faz o checkout com `fetch-depth: 0` e o `pnpm install`, refaz o build (o `plan()` do `scripts/verificar.ts`) e, nas do Playwright, roda o `playwright install --with-deps`. A instalação chegou a 671 s numa parte (relatório do ajuste idiomas, seção "O CI");
- uma execução completa custa uns 170 minutos cobrados, e uma run gasta de 2 a 4 execuções, porque o rascunho e cada push só de documentação disparam o CI inteiro.

O `CLAUDE.md` tem 78 KB e entra no contexto de cada agente e subagente. O `pnpm verificar` inteiro passa de 900 s nesta máquina (§ 242).

O que esta run toca (leia o código antes de planejar):

- `.github/workflows/ci.yml` e `pos-deploy.yml`;
- `scripts/verificar.ts` e `tests/unit/verificar.test.ts`, que lê as matrizes do `ci.yml`;
- `scripts/ci/pode-mesclar.ts`, `tests/unit/pode-mesclar.test.ts`, `fixtures/merge-events/`, `tests/unit/merge-events.test.ts`, `tests/unit/ci-workflows.test.ts` e os ajudantes `tests/unit/lib/merge-job.ts` e `tests/unit/lib/mini-yaml.ts` (um parser de YAML próprio e limitado);
- `playwright.config.ts` (2 workers no CI) e `scripts/lib/disco.ts` (§ 109 e § 154);
- `scripts/lib/tools.ts` (ferramentas fixadas por SHA-256, baixadas para `.cache/`);
- `src/platform/build-files.ts`: fora do Workers Builds, o `build.txt` leva o `git rev-parse HEAD`;
- `tests/unit/pdf-engine-ops.test.ts` (o teste lento do F8 ensaio-3, § 299);
- `CLAUDE.md`, `docs/OPERACAO.md` com o `tests/unit/operacao.test.ts`, `docs/PENDENCIAS.md` com o `tests/unit/pendencias.test.ts`, e `docs/adr/ADR-003-playwright-em-partes-no-ci.md`.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da F9 e vence o resto.
2. O `PLANO-MELHORIAS.md` (na raiz, ainda sem rastreio): "Mudanças no contrato", "O que não é viável ou tem limite", "Regras novas de toda run", a ficha da F9 e a seção F.
3. O `PLANO-FILEORCA.md`: "Execução por IA" e as "Decisões fechadas".
4. O `CLAUDE.md` inteiro. Esta é a última run que precisa lê-lo inteiro.
5. O `DECISOES.md`, só buscando os § (nunca inteiro): § 90, § 108, § 109, § 141, § 142, § 154, § 242, § 283, § 297, § 299 a § 303 e § 320. O próximo § livre é o 323, se nada entrou depois do ajuste idiomas.
6. O `docs/relatorios/ajuste-idiomas.md` (seção "O CI") e, no `docs/PENDENCIAS.md`, as linhas § 242, § 283, F8 ensaio-3 e "Worktrees".

Você pode ler a web: a documentação do GitHub Actions, do Playwright, do gitleaks e do Cloudflare Workers Builds. Ler não é mandar pedido: não entre em conta, não crie conta e não preencha formulário.

# Escopo

Dentro, os nove itens da ficha, detalhados nas decisões abaixo:

1. O `ci:custo` e a linha de base (decisão 1).
2. O build uma vez por execução (decisão 2).
3. O preparo do job do Playwright em até 90 s (decisão 3).
4. Quando o CI roda: rascunho, rótulo `ci` e PR só de documentação (decisão 4).
5. O `ci-ok` (decisão 5).
6. Os miúdos: `fetch-depth`, o comentário do `ci.yml`, o `--partes` e o teste lento (decisão 6).
7. O `CLAUDE.md` enxuto e a pasta `docs/claude/` (decisão 7).
8. O preparo do repositório público: auditoria, fork, README, SECURITY, licença, Workers Builds, OPERACAO e ruleset (decisões 8 a 11).
9. A fonte de verdade: o `PLANO-MELHORIAS.md` no Git, a linha do `PLANO-FILEORCA.md` e a ordem nova no `CLAUDE.md` (decisão 12).

E ainda: o adendo da ADR-003, os § e o `PENDENCIAS.md`, a revisão adversarial final e o relatório.

Fora (não toque):

- Tudo da seção "Fora de toda run" do `CLAUDE.md`. Em especial: não torne o repositório público e não mexa em nenhuma configuração do GitHub (visibilidade, ruleset, rótulos, Actions, Code security, Features) nem do Cloudflare. Isso é do Victor, pela seção F.
- **Os testes.** Nenhum teste sai, é pulado, amostrado ou afrouxado. O limite de 900 s não muda, nenhum timeout aumenta e nada liga `retries`.
- **O histórico.** Nada de reescrever commit publicado, `filter-repo`, rebase de branch publicada ou `--amend`, mesmo que a auditoria ache algo.
- **O site.** `src/`, `public/`, `astro.config.ts`, `docs/design/` e `docs/oli/` não mudam.
- **O número de partes do Playwright e os workers** ficam como estão, porque a F9b redivide para as máquinas do repositório público. Uma parte só se divide se passar de 700 s, como nas runs anteriores.
- Runner pago, runner maior ou self-hosted; ADR que troque host ou framework.
- O `PLANO-FILEORCA.md` (o `.claude/settings.json` nega a edição; a linha nova é do Victor, decisão 12), o `.claude/settings.json`, o `.githooks/` e o `docs/adr/ADR-001-plataforma-de-entrega.md`.
- **Dependências npm novas.** O `pnpm-lock.yaml` não muda. O gitleaks entra como ferramenta fixada no `scripts/lib/tools.ts`, como o actionlint. Toda action nova entra fixada por SHA, com a versão em comentário, como as de hoje.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do § 323)

1. **Medir primeiro: o `pnpm ci:custo <run-id> [--attempt n]`** (`scripts/ci/custo.ts`).
   - Lê a execução pelo `gh`, só com leitura: `gh run view --json` e `gh api` sem método (o `.claude/settings.json` nega `-X` e `--method`).
   - Mostra, por job: a duração, o minuto cobrado (a duração arredondada para cima, como num repositório privado), o preparo (decisão 3), os passos que mais pesam (instalação, build, testes) e o `total` do resumo do `verificar`, lido do log do job. Jobs pulados aparecem como pulados.
   - Mostra, na execução: a soma dos minutos cobrados, o tempo de parede (do início do primeiro job ao fim do último), o número de jobs que rodaram e a classe (decisão 4).
   - Sai em Markdown, pronto para o relatório. A conta fica numa função pura, testada no Vitest sobre o JSON gravado de uma execução de verdade, em `fixtures/`.
   - **A linha de base** é a execução verde do CI que levou à main de antes da F9: a última verde da PR do ajuste idiomas. Ache-a com `gh run list --workflow ci.yml` e registre o id e o resultado do `ci:custo` num §.

2. **O build uma vez por execução.**
   - Um job `build` faz o `pnpm build` e sobe o `dist/` e o `.cache/bundle-modules.json` como artefato, com retenção de 1 dia.
   - As partes do Playwright, a do Lighthouse e a dos portões baixam o artefato e não refazem o build.
   - O `scripts/verificar.ts` ganha uma opção que usa o `dist/` pronto: não apaga o `dist/`, pula o passo do build e falha se o `dist/build.txt` não for o `git rev-parse HEAD` do checkout. Você escolhe o nome da opção e registra. Sem ela, o `plan()` faz o que faz hoje, e os testes das partes antigas continuam valendo.
   - O `tests/unit/verificar.test.ts` prova que as partes juntas são o todo, com o build uma vez só. O `gate:prontidao` continua com os dois builds extras dele em `.cache/prontidao/`: eles são um portão, não o build do site.

3. **O preparo de cada job do Playwright em até 90 s.**
   - O preparo é o tempo do início do job até o início do passo que roda o `verificar`: checkout, Node e pnpm, `pnpm install`, navegador, dependências do sistema e o download do artefato. O `ci:custo` mede isso em cada job, não pela média.
   - As opções: o navegador em cache pela versão do Playwright lida do lockfile, e as dependências do sistema sem o apt lento; ou a imagem oficial do Playwright (`mcr.microsoft.com/playwright`), com a tag lida do lockfile. A escolha sai da medida no CI. Meça no máximo duas opções e registre as duas medidas.
   - **As proteções da § 154 continuam provadas no log de toda parte do Playwright:** o `core_pattern` em `|/bin/false` antes do `verificar`, o `ulimit -c 0` no passo e o passo "Disk and core dumps" no fim, com `if: always()`. O diagnóstico de disco do `disco.ts` continua rodando.

4. **Quando o CI roda.** Uma classificação decide a classe de cada execução, e os jobs pulam por `if`, nunca por `paths` ou `paths-ignore` no `on:`, que deixariam o check pendente para sempre.
   - O gatilho ganha o tipo `labeled`. Um rótulo qualquer recalcula a classe, como um `synchronize`. O `unlabeled` e o `converted_to_draft` não disparam: tirar o rótulo `ci` não roda nada até o próximo push.
   - A tabela das classes, que vale também para PR de fork:

     | Estado da PR | Rótulo `ci` | O que a PR muda | Classe | O que roda |
     | --- | --- | --- | --- | --- |
     | rascunho | não | qualquer coisa | `leve` | tipos, lint e Vitest, com o build que o Vitest pede |
     | rascunho | sim | código | `completo` | tudo |
     | rascunho | sim | só documentação | `portões` | o build e os portões, sem o Playwright e sem o Lighthouse |
     | pronta | qualquer | código | `completo` | tudo |
     | pronta | qualquer | só documentação | `portões` | o build e os portões, sem o Playwright e sem o Lighthouse |

   - **Só documentação** quer dizer: todo arquivo do diff (`git diff --no-renames --name-only base...head`, como o job de merge) está em `docs/`, fora de `docs/design/` e de `docs/oli/`, ou é um `.md` da raiz. Diff vazio, ou que a classificação não consegue ler, conta como `completo`. Antes de fechar a lista, confira que nenhum spec do Playwright e nenhum passo do Lighthouse lê um arquivo dela.
   - O script da classificação fica em `scripts/ci/` e é lido da base, como o `pode-mesclar.ts`. Na PR que o cria (esta), a base ainda não o tem, e o job usa a cópia da própria PR, como o `pode-mesclar` fez na F1a.
   - Ele é testado com eventos de exemplo (uma pasta nova em `fixtures/`), pelo mesmo caminho do job: o `env` do passo montado a partir do evento, o `git diff` e o CLI escrevendo no `GITHUB_OUTPUT`, como o `merge-events.test.ts` faz. Cada linha da tabela tem um evento, e mais estes: PR de fork, `labeled` com outro rótulo, `ready_for_review`, `reopened` e um diff que mistura documentação e código.

5. **O `ci-ok`.**
   - Um job com o id `ci-ok` (o nome do check tem de ser exatamente `ci-ok`, sem matriz) espera todos os jobs de verificação, com `if: always()`. Ele nunca é pulado, porque um job pulado conta como aprovado num check obrigatório do GitHub.
   - Fica verde só se a classificação saiu e cada job terminou em `success`, ou em `skipped` quando a classe não pede aquele job. Fica vermelho com `failure`, com `cancelled` ou com `skipped` de um job que a classe pede.
   - A lógica é testada com casos que reprovam: cada resultado ruim, a classificação ausente e um job pulado que devia rodar.
   - O `merge` passa a esperar o `ci-ok` e só roda com ele verde. O `alerta-dependabot` espera o `ci-ok` e o `merge`.

6. **Os miúdos.**
   - **`fetch-depth: 0` só onde o histórico é lido:** o `lint:texto` (diff contra a base), o Vitest (o `pos-deploy.test.ts` lê o `HEAD~1` e o `503b8c3`, e o teste do `CLAUDE.md` lê o commit de antes da F9), a classificação e o `merge`. No resto, o checkout raso.
   - O comentário do topo do `ci.yml` descreve o CI novo.
   - **O `pnpm verificar --partes`** (§ 242): lê as matrizes do `ci.yml`, faz o build uma vez e roda cada parte em sequência, cada uma com o limite de 900 s, mostrando o total de cada uma e a soma. O `verificar.test.ts` prova que essas partes são as do `ci.yml` e que juntas são o todo.
   - **O teste lento do F8 ensaio-3** fica mais leve: ache o que o deixa lento sob carga (o PDF que ele monta ou a leitura) e corte isso no próprio teste. Nunca aumente o tempo dele. Se a causa estiver no motor (`src/`), registre e deixe para uma run de ajuste. A prova é o tempo do teste sozinho, antes e depois, e três rodadas da suíte do Vitest com a máquina carregada (o Playwright rodando ao lado).

7. **O `CLAUDE.md` enxuto.**
   - Até 25 KB: 25.600 bytes em UTF-8.
   - Fica no arquivo o núcleo: o projeto, a fonte de verdade (com a ordem nova, decisão 12), a arquitetura fixa, o Git, o que fica fora de toda run, os testes, as regras que nenhuma run quebra, como a run termina, o idioma, as tabelas de comandos, as seis "Regras novas de toda run" do `PLANO-MELHORIAS.md` e um índice do tipo "mexeu em X, leia `docs/claude/X.md`".
   - As seções de fase e as pegadinhas vão para `docs/claude/`, com o texto igual, linha por linha, nestes arquivos: `ci.md`, `imagem.md`, `pdf.md`, `calculadoras.md`, `idiomas.md`, `design-e-oli.md`, `service-worker.md`, `anuncios.md`, `playwright.md` e `windows-git-bash.md`. Cada pegadinha vai para o arquivo do tema dela.
   - As descrições de partes do CI que já foram substituídas saem: as da ADR-003, do WebKit em três partes, da F5a, da F7, da F8 e do ajuste idiomas, junto com as frases "Isto substitui…". Um § lista cada linha que saiu, e o `docs/claude/ci.md` ganha a descrição do CI novo.
   - **A regra de nunca apagar muda uma vez** (mudança 4 do contrato). A partir daqui, as runs acrescentam no arquivo do tema em `docs/claude/`, e o `CLAUDE.md` só muda no núcleo e no índice, também só acrescentando. A frase de abertura do `CLAUDE.md` diz isso.
   - **O teste** (em `tests/unit/`) lê o `CLAUDE.md` do commit de antes da F9 pelo `git show`. Ele reprova se alguma linha não vazia desse arquivo não estiver, igual, no `CLAUDE.md` novo ou num arquivo de `docs/claude/`, menos as linhas da lista do §. Reprova também o `CLAUDE.md` acima de 25.600 bytes, um arquivo de `docs/claude/` fora do índice e um item do índice sem arquivo. Traz um controle que reprova: uma linha apagada.
   - Se a main andar durante a run, as linhas novas do `CLAUDE.md` dela vão para o arquivo do tema, e o teste passa a ler o commit novo da main. Registre.

8. **A auditoria para o público** (`pnpm publico:auditar`, ou outro nome que você registra).
   - **Onde roda:** num clone espelho em `.cache/` (`git clone --mirror`). O GitHub guarda as PRs em `refs/pull/*/head`, e os commits das branches de run, apagadas depois do squash, só estão ali. Tudo isso fica público junto com o repositório.
   - **O gitleaks** (MIT), fixado no `scripts/lib/tools.ts` para `win32-x64` e `linux-x64`, com o SHA-256 conferido contra os checksums oficiais da release. Ele roda no histórico inteiro do espelho e na árvore de trabalho.
   - **A varredura de dados pessoais**, em todo arquivo e em todo blob do histórico: GPS e Exif das imagens (JPEG, PNG, WebP, HEIC e AVIF, reaproveitando os leitores que o repositório já tem), e-mail, telefone, CPF (com o dígito verificador, para cortar falso positivo), endereço e os e-mails de autor e de quem commitou. Confira também se o `docs/lancamento/` tem contato pessoal de terceiros.
   - **A classificação de cada achado:** segredo real; público por natureza (já está no site, como o ID do AdSense, a chave do IndexNow, a chave Pix e o contato da marca); dado do Victor; dado de terceiro; falso positivo.
   - **Onde fica o resultado:** só em `.cache/auditoria-publico.md`, que o `.gitignore` já cobre (prove com `git check-ignore -v`). Num repositório público, a coordenada e o achado ficariam públicos. O relatório, a PR, os commits, o `DECISOES.md`, o `PENDENCIAS.md` e a sua resposta final dizem só quantos achados há de cada tipo.
   - Nenhum achado é corrigido nesta run. Decidir é do Victor, pela seção F.

9. **A proteção contra PR de fork.**
   - O `pode-mesclar.ts` só mescla PR cujo head é deste repositório e cujo autor é o dono do repositório ou o Dependabot. Uma PR de branch `fase-*` de outro autor, ou de um fork, nunca é mesclada.
   - **A chamada do CLI no `ci.yml` não muda** (§ 297): o job roda o script da base, e uma chamada nova chegaria ao script velho. Os dados novos entram no `pr.json` pelo `jq`, e o script novo recusa o merge quando eles faltam. Atualize o `JQ_ON_MAIN` do `merge-events.test.ts` e deixe o `CLI_ON_MAIN` como está.
   - Os jobs que escrevem (`merge`, `alerta-dependabot` e `pos-deploy`) não rodam em PR de fork, por `if` no job. Nenhum workflow usa `pull_request_target`.
   - Tudo provado no `ci-workflows.test.ts` e em eventos novos de `fixtures/merge-events/`: um fork com nome de branch de run, uma PR do próprio repositório de outro autor, uma do Dependabot e uma do dono.
   - O `docs/OPERACAO.md` diz que o `ci-ok` de uma PR de fork roda o `ci.yml` da própria PR, então verde ali não prova nada: o merge de PR de fork é sempre do Victor, depois de ler o diff.

10. **README, SECURITY e licença.**
    - `README.md` em português: o que é o FileOrca, como rodar (`pnpm install`, `pnpm dev`, `pnpm verificar` e o `--partes`) e a licença.
    - `SECURITY.md`: como relatar uma falha em particular, pelo relato privado do GitHub (que o Victor liga na seção F) ou pelo contato público do site.
    - A licença é "todos os direitos reservados", num `LICENSE`, com o `package.json` coerente com ela. O README diz que o motor de imagem continua no repositório MIT separado (`pnpm motor:exportar`). Confira que o `gate:licencas` não reprova o campo novo do `package.json`.

11. **Workers Builds, OPERACAO e ruleset.**
    - Confira na documentação do Cloudflare Workers Builds se PR de fork gera build ou prévia. Registre num § e no `docs/OPERACAO.md`, com o que o Victor deve conferir no painel.
    - O `docs/OPERACAO.md` ganha a seção "Repositório público", com o passo a passo da seção F do `PLANO-MELHORIAS.md`, o merge de PR de fork (decisão 9) e o que muda nos logs e nos artefatos do Actions, que ficam públicos.
    - O ruleset vai em `docs/ops/ruleset-main.json`, no formato que o "Import a ruleset" do GitHub aceita (confira na documentação). Ele cobre a branch padrão, com PR obrigatória sem aprovação exigida (o Victor trabalha sozinho e o CI mescla), o check `ci-ok` obrigatório, vindo do GitHub Actions, sem exigir branch atualizada, e sem force push nem exclusão. O `ci-ok` é o único check exigido, então mudar as partes nunca mexe no ruleset. Um teste confere o JSON.
    - O `operacao.test.ts` passa: todo caminho e todo script citado existe.

12. **A fonte de verdade.**
    - O `PLANO-MELHORIAS.md` entra no primeiro commit. Se existir `Claude outputs/PLANO-MELHORIAS.md` diferente do da raiz, ele é a versão final: copie-o por cima do da raiz antes do commit e registre. A pasta `Claude outputs/` nunca entra em commit.
    - **A linha do `PLANO-FILEORCA.md` é do Victor:** o `.claude/settings.json` nega a sua edição, e contornar isso por outro caminho é proibido. Se o `git diff PLANO-FILEORCA.md` mostrar só linhas acrescentadas no topo, apontando para o `PLANO-MELHORIAS.md`, o arquivo entra no primeiro commit sem edição. Se não houver diff, ou se o diff mudar outra coisa, não toque nele e registre a pendência.
    - O `CLAUDE.md` passa a dizer a ordem nova: a ficha da run, o `PLANO-MELHORIAS.md` (nos itens de "Mudanças no contrato"), o `PLANO-FILEORCA.md`, o `CLAUDE.md` e `docs/claude/`, o `DECISOES.md` e o código.

13. **As regras novas valem já nesta run,** a partir do momento em que o `ci.yml` novo está na branch.
    - Abra a PR em rascunho logo depois do primeiro push com o `ci.yml` novo. Antes disso, uma PR aberta rodaria o CI velho, com 20 jobs, a cada push.
    - Para conferir no Linux do CI, ponha o rótulo `ci` (`gh pr edit <n> --add-label ci`), espere a execução terminar e tire o rótulo (`--remove-label ci`). Com o rótulo na PR, todo push roda o CI completo.
    - No fim, tudo commitado, inclusive o relatório e a revisão, e então o `gh pr ready`.

14. **O adendo da ADR-003.** O build único, o preparo novo, as classes e o `ci-ok` entram como um adendo da ADR-003, como a § 302 e a § 320 fizeram. A ficha manda, então a ADR continua "Aceita".

# Armadilhas conhecidas

- **O `verificar` apaga o `dist/` no começo** (`rmSync('dist')`). A opção nova não pode apagar.
- **O `build.txt` no CI é o commit de merge da PR** (`github.sha`), o mesmo em todo job da execução, porque o checkout de `pull_request` é o `refs/pull/<n>/merge`. Compare com o `git rev-parse HEAD` do checkout do próprio job.
- **O Vitest precisa do `dist/`** (o `pix-qr.test.ts` lê o `dist/pt/apoie/`) e do histórico (o `pos-deploy.test.ts` lê o `HEAD~1` e o `503b8c3`). A classe `leve` também precisa dos dois.
- **O cache das ferramentas guarda a pasta `.cache/` inteira** (`actions/cache` com a chave do `tools.ts`). Restaurado depois do artefato, ele traria um `bundle-modules.json` velho. O do artefato tem de vencer.
- **Um job pulado conta como aprovado num check obrigatório.** Por isso o `ci-ok` usa `if: always()` e decide pela classe.
- **O `labeled` dispara com qualquer rótulo.** Com `cancel-in-progress`, ele cancela a execução em andamento e refaz a classe. Hoje o Dependabot não põe rótulo (`labels: []`).
- **O `merge-events.test.ts` fixa a chamada do CLI** (`CLI_ON_MAIN`) e o `jq` (`JQ_ON_MAIN`). O primeiro não muda; o segundo muda junto com o `ci.yml`.
- **Nesta PR, quem decide o merge é o `pode-mesclar.ts` velho, da base.** Ele diz "mexe em .github/workflows/: o merge fica para o Victor". Está certo.
- **O `mini-yaml.ts` é um parser próprio.** YAML novo no `ci.yml` (um `container:`, um `if` em várias linhas, uma âncora) precisa caber nele, ou ele cresce, com teste.
- **O `gate:actionlint` roda o shellcheck** nos `run:` do `ci.yml`.
- **As actions entram fixadas por SHA**, com a versão em comentário, e o Dependabot de GitHub Actions as atualiza.
- **Com `container:`, todo passo do job roda dentro do contêiner,** e o `core_pattern` é do kernel do host, que o contêiner não pode mudar. Se a imagem do Playwright vencer na medida, o `sysctl` continua no host (por exemplo, com o contêiner rodado por um passo `docker run`). O diagnóstico de disco e o "Disk and core dumps" continuam mostrando o disco de verdade.
- **O `ENOSPC` do WebKit** (§ 141 e § 154): o preparo novo não pode tirar disco das partes. Compare o `df` do log antes e depois.
- **O artefato conta no armazenamento do Actions,** que é limitado no plano Free privado. Meça o tamanho, use retenção de 1 dia e registre. O `upload-artifact` da v4 em diante não sobrescreve um nome na mesma execução.
- **Duas execuções do mesmo código variam até ±35 %** (§ 320), e o tempo do job não é o tempo da parte (§ 108). Compare o custo entre execuções da mesma classe, e o tempo das partes pelo `total` do `verificar`.
- **O GitHub guarda `refs/pull/*`.** A auditoria que olha só o clone de trabalho não vê os commits das branches de run apagadas. Por isso o espelho.
- **Tudo o que você commita vai ficar público,** inclusive este prompt, o relatório e a revisão. Nenhum achado da auditoria, nenhuma coordenada e nenhum dado pessoal entra em arquivo do Git, em mensagem de commit, na PR ou na resposta final.
- **Os logs e os artefatos do Actions também ficam públicos.** Confira que nenhum passo imprime variável de ambiente, token ou dado pessoal. O diagnóstico de disco lista processos e arquivos: confira o que ele mostra.
- **O `gh api` com `-X` ou `--method` é negado.** O `ci:custo` só lê.
- **O Git Bash:** heredoc e `node -e` com crase, barra invertida ou apóstrofo estragam o texto; um argumento que começa com "/" vira caminho do Windows (`MSYS_NO_PATHCONV=1`). Escreva arquivo pela ferramenta de escrita. O `git push` e o `gh pr create --base main` vão em comandos separados.
- **Depois de um `gh run rerun`,** o log padrão é o da última tentativa: use `--attempt <n>`.
- **Os agentes em worktree nascem da `main`.** O primeiro passo de cada um é `git merge --ff-only fase-09`, todo merge leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`), agente que escreve código usa `model: 'opus'`, e cada worktree usa o próprio `FO_PORT`, de 4174 a 4189.
- **A máquina carregada.** Com as lentes rodando o Playwright junto, o WebKit do Windows já travou no `page.goto`. Rode de novo com a máquina livre antes de achar que um teste está errado.

# Critérios de aceitação (cada um com evidência no relatório)

1. **O custo.** O `pnpm ci:custo` da última execução completa da PR mostra pelo menos 35 % menos minutos cobrados que a linha de base, o preparo de cada job do Playwright em até 90 s e o `total` de cada parte em até 700 s. O relatório traz as duas saídas lado a lado.
2. **O rascunho leve.** Uma execução de verdade desta PR, em rascunho e sem o rótulo, não roda nenhum job do Playwright nem o do Lighthouse. O `ci:custo` dela prova.
3. **As classes.** Cada linha da tabela da decisão 4 e cada caso extra tem um evento de exemplo que passa pelo caminho do job. A PR de exemplo só de documentação sai como `portões`.
4. **O `ci-ok`.** Fica verde na execução completa desta PR. O `merge` espera por ele, e o teste da lógica reprova cada caso ruim.
5. **O build único.** Na execução completa, só o job `build` roda o `pnpm build`. O log prova (os builds do `gate:prontidao` em `.cache/prontidao/` não contam), e o `verificar.test.ts` prova o plano.
6. **Nenhum teste a menos.** O `pnpm exec playwright test --list` de cada navegador dá pelo menos o número do commit de antes da F9 (1.428 em cada um, se for o `bbd30c8`). A soma dos testes que passaram nas partes da execução completa é igual ao `--list`. O número de testes do Vitest não cai.
7. **O site igual.** O `git diff --stat <antes da F9> -- src public astro.config.ts docs/design docs/oli` sai vazio.
8. **As proteções da § 154.** Os logs de todas as partes do Playwright da execução completa mostram o `core_pattern` em `|/bin/false` e o passo "Disk and core dumps".
9. **O `CLAUDE.md`.** Até 25.600 bytes, e o teste da decisão 7 verde, com o controle que reprova.
10. **A auditoria.** O gitleaks rodou no histórico inteiro do espelho, com `refs/pull/*`. O `.cache/auditoria-publico.md` existe e está ignorado pelo Git (`git check-ignore -v`). O relatório traz só a contagem por tipo.
11. **O fork.** Os testes da decisão 9 passam, e reprovam sem a proteção. Nenhum workflow usa `pull_request_target`.
12. **Os papéis do público.** O README, o SECURITY, o LICENSE e o `docs/ops/ruleset-main.json` existem, o teste do ruleset passa e o `operacao.test.ts` passa.
13. **O `--partes`.** O `pnpm verificar --partes` passa na máquina local, com o total de cada parte e a soma no relatório.
14. **O teste lento.** O tempo dele sozinho cai, e as três rodadas sob carga passam, sem nenhum tempo maior.
15. **A revisão.** O `docs/relatorios/REVISAO-F9.md` não tem achado crítico nem alto aberto.
16. **O CI.** A execução completa depois do `gh pr ready` termina verde, com o `ci-ok` verde.

# Verificação: rode de verdade

- Siga a ordem das fatias de "Como trabalhar", e cada fatia termina verde antes da próxima. Rode o spec ou o teste alvo enquanto corrige.
- Leia cada falha, corrija a causa e repita até passar. É proibido desligar, pular, marcar como `skip`, afrouxar limiar, mudar orçamento, ligar `retries` ou aumentar timeout.
- Se um teste estiver de fato errado (por exemplo, o `ci-workflows.test.ts`, que fixa o gatilho e os `needs` de hoje), mude-o junto com o que ele protege. Explique num § e mostre no relatório que a proteção continua.
- **Antes do primeiro push com o `ci.yml` novo:** `pnpm tipos`, `pnpm lint`, o Vitest inteiro e o `pnpm gate:actionlint`.
- **No CI:** o rascunho roda leve a cada push. Use o rótulo `ci` para as execuções completas no meio da run, no máximo umas três, e só com as partes locais verdes. Acompanhe com `gh pr checks <n> --watch` e leia os logs com `gh run view <id> --log` (com `--attempt` depois de um rerun).
- **No fim, uma execução limpa:** `CI=true pnpm install --frozen-lockfile` e o `pnpm verificar --partes`. Cole o resumo de cada parte e a soma. O limite não muda.
- **Os minutos do Actions:** o relatório diz quantas execuções a run gastou, de que classe, e o `ci:custo` de cada uma.

# Autonomia e decisões

Você está rodando sozinho e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `PLANO-MELHORIAS.md`, o `PLANO-FILEORCA.md` e o `CLAUDE.md`.
3. O `DECISOES.md` e o código.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: os nomes das opções e dos scripts; a forma do preparo; o lugar da lógica do `ci-ok`; o destino de cada seção do `CLAUDE.md`; o formato do ruleset.

Uma mudança de arquitetura (host, framework, estrutura do repositório) vira uma ADR "Proposta" em `docs/adr/` e uma pendência. O que esta ficha pede no CI segue a ADR-003, com um adendo (decisão 14).

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca. Isso vale também para o preparo de 90 s. Se, depois de três abordagens medidas, ele não chegar lá, registre num § a melhor medida, as tentativas e o porquê, ponha a linha no `PENDENCIAS.md` para a F9b e siga. O relatório diz isso em destaque.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- **o Actions sem minutos** (o job nem começa, com aviso de cobrança ou de limite): não insista. Termine tudo o que é local, abra a PR e diga no relatório e na resposta final que o CI não rodou e o que fica para conferir;
- **o push do `ci.yml` recusado** por falta do escopo `workflow`: o relatório traz o comando para o Victor rodar;
- **o download do gitleaks recusado:** o resto da varredura segue, e a pendência diz o que faltou;
- **o `PLANO-FILEORCA.md` sem a linha do Victor:** pendência, sem editar.

Válvula de estouro, se o tempo ou o limite apertar: a compactação do `CLAUDE.md` (decisão 7) e o `--partes` (decisão 6) vão para a F9b, com um § e uma linha no `PENDENCIAS.md`.

Nunca corte: o `ci:custo`, o build único, o rascunho sem CI completo, a PR de documentação leve, o `ci-ok`, a auditoria, a proteção contra fork e a revisão adversarial final.

# Git e segurança

- **Começo.**
  - Rode `git switch main` e `git pull --ff-only`.
  - Antes de criar a branch, o `git status` pode mostrar como não rastreados `docs/prompts/prompt-fase-09.md`, `docs/prompts/prompt-fase-09.txt`, `PLANO-MELHORIAS.md` e, se ainda existir, a pasta `Claude outputs/`. Como modificado, só o `PLANO-FILEORCA.md`, com as linhas do Victor no topo.
  - Crie a branch com `git switch -c fase-09`. O primeiro commit leva os dois arquivos do prompt sem edição, o `PLANO-MELHORIAS.md` (decisão 12) e o `PLANO-FILEORCA.md`, se o diff dele for o esperado.
  - Se os arquivos do prompt não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-09.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits).
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push.
- **A PR em rascunho** abre logo depois do primeiro push com o `ci.yml` novo (decisão 13): `gh pr create --draft --base main --head fase-09`, num comando separado do push.
  - O título e a descrição vão em português.
  - A descrição diz em destaque que o merge é do Victor, porque a PR mexe em `.github/workflows/`, e lista os arquivos do `.github/` que mudaram.
  - Nenhum achado da auditoria vai nela.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`. O espelho da auditoria fica em `.cache/`.
- **Fim:**
  1. Com a última execução completa (com o rótulo) verde e os critérios conferidos, commite o relatório (citando essa execução e o `ci:custo` dela), a revisão e o resto. Tire o rótulo `ci` antes do push.
  2. Faça o push (roda leve) e rode logo em seguida o `gh pr ready`, que dispara a execução completa final.
  3. Acompanhe essa execução até o fim. Com ela verde, ponha o `ci:custo` dela na descrição da PR (`gh pr edit <n> --body-file <arquivo>`), sem commit novo: um push numa PR pronta roda tudo de novo.
  4. A run termina com a PR pronta, a execução completa verde e o `ci-ok` verde, para o merge do Victor. Se algo impedir, a resposta final diz o quê.
- **No GitHub, a run só faz isto:** push da branch; `gh pr create`, `gh pr ready` e `gh pr edit` (só o rótulo `ci` e a descrição) na PR dela; leitura (`gh run`, `gh pr checks`, `gh api` sem método); e um `gh run rerun` por falha que pareça instável, registrado.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh label create`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo create`/`edit`, nem qualquer configuração do repositório;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `npm publish` ou `wrangler deploy` em qualquer forma, inclusive `--dry-run`.

  O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

1. **Explorar**, com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) as regras desta run, do `PLANO-MELHORIAS.md` e do `CLAUDE.md`, num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) o CI de hoje: o `ci.yml`, o `verificar.ts`, os testes que leem o `ci.yml` e, pela linha de base, o tempo de cada passo de cada job (de onde vem o custo);
   - (c) o preparo do Playwright: o cache dos navegadores, a imagem oficial, o que o apt instala hoje e quanto leva, e o que a § 154 exige;
   - (d) o mapa do `CLAUDE.md`: cada seção e cada pegadinha, com o arquivo de `docs/claude/` para onde vai, e as linhas substituídas;
   - (e) o público: o que existe em `refs/pull/*`, como rodar o gitleaks no espelho, os leitores de Exif do repositório, o formato de importação de ruleset e o que a documentação do Workers Builds diz sobre fork.
2. **Planejar.** Escreva `docs/relatorios/fase-09-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz: o SHA de antes da F9; a linha de base; o desenho do `ci.yml` novo (jobs, `needs`, `if` e classes); cada critério ligado a um teste ou comando; a ordem das fatias; e o orçamento de execuções do CI.
3. **Implementar** em fatias que terminam verdes, nesta ordem:
   1. o `ci:custo` e a linha de base, sem mudar o CI;
   2. a opção do `dist/` pronto e o `--partes` no `verificar.ts`, com o `verificar.test.ts`;
   3. a classificação, a lógica do `ci-ok` e a proteção contra fork no `pode-mesclar.ts`, com os eventos de exemplo;
   4. o `ci.yml` novo (classificação, build, leve, partes com o artefato, `ci-ok`, `merge`, alertas e as guardas de fork), com o `ci-workflows.test.ts` e o `actionlint`. Depois, o push e a PR em rascunho: a primeira execução leve prova o critério 2;
   5. o rótulo `ci`, a execução completa e o `ci:custo`; o preparo de até 90 s, medido em no máximo duas opções;
   6. o teste lento do F8 ensaio-3;
   7. a auditoria, o README, o SECURITY, o LICENSE, o Workers Builds, o `OPERACAO.md` e o ruleset;
   8. o `CLAUDE.md` enxuto e a pasta `docs/claude/`, com o teste;
   9. o adendo da ADR-003, os §, o `PENDENCIAS.md` (§ 242, § 283 e F8 ensaio-3 fechados ou atualizados, e as pendências novas) e o `--partes` final.

   Código e testes podem sair de agentes `opus` em worktree, em paralelo, quando não dependem um do outro.
4. **A revisão adversarial final,** no método da F3 (`CLAUDE.md`), sobre um commit fixo e registrado da branch, contra este prompt e o plano. A F9 mexe em CI e em privacidade, então são seis lentes Sonnet em contexto limpo:
   - (a) a corretude do CI: classes, eventos, `ci-ok`, `needs`, `if`, concorrência e o que acontece com um job pulado, cancelado ou com falha;
   - (b) a segurança do repositório público: fork, permissões, `pull_request_target`, o que vaza nos logs e nos artefatos, e se algum achado da auditoria entrou no Git;
   - (c) o custo e o tempo: a medida, o preparo, o build único e as proteções da § 154;
   - (d) os testes: nada saiu nem afrouxou, as partes são o todo e o `--list` bate;
   - (e) o `CLAUDE.md`: nenhuma regra perdida, o índice leva a cada arquivo e as regras novas estão no núcleo;
   - (f) os papéis do Victor: o `OPERACAO.md`, o ruleset, o README, o SECURITY e a licença, lidos como quem vai seguir o passo a passo.

   Cada achado médio ou acima tem um cético próprio que tenta refutar; os baixos de cada lente vão a um cético só (regra 3 das "Regras novas"). As correções ficam num agente só (`opus`). Depois, uma segunda passada revisa o diff. Os baixos que ficarem vão para o `PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F9.md`. Remova a worktree no fim.

# Relatório final

Escreva `docs/relatorios/fase-09.md` em português, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo;
- **o custo** (regra 5 das "Regras novas"): o `ci:custo` da linha de base, de uma execução leve e da última execução completa, lado a lado, com os minutos cobrados, o tempo de parede, o número de jobs, o preparo de cada job e o `total` de cada parte;
- o desenho do CI novo: a tabela das classes, os jobs e o `ci-ok`;
- as provas: o build único, os testes contados (`--list` e Vitest), o site igual e as linhas da § 154 nos logs;
- o `CLAUDE.md`: o tamanho antes e depois, os arquivos de `docs/claude/` com o tamanho de cada um e o § das linhas substituídas;
- a auditoria: só a contagem por tipo, e onde está o arquivo completo;
- a proteção contra fork e o que a documentação do Workers Builds diz;
- a saída real do `pnpm verificar --partes`, com o total de cada parte e a soma;
- quantas execuções do CI a run gastou, de que classe, com o `ci:custo` de cada uma;
- o resumo da revisão, apontando para o `REVISAO-F9.md`;
- o link da prévia;
- as decisões novas, apontando os §;
- o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. Ler o `.cache/auditoria-publico.md` antes de tudo e decidir pela seção F do `PLANO-MELHORIAS.md`.
  2. Conferir o diff do `.github/` e dar o merge da PR (squash, apagando a branch).
  3. Se for publicar: os passos da seção F, na ordem (visibilidade, o ruleset de `docs/ops/ruleset-main.json`, a aprovação de PR de fork, o Code security e as Features).
  4. Na primeira PR depois disso, conferir o check `ci-ok` e o merge automático.
  5. Gerar o prompt da F9b com o `ci:custo` da primeira execução pública. Se não publicar, a F9b não acontece.

As pegadinhas que você achar vão para o arquivo do tema em `docs/claude/` (o `ci.md`, para as do CI). O `CLAUDE.md` ganha só o que for núcleo ou índice. Não apague nada do que já existe, fora o que a decisão 7 manda.

Termine a resposta final com:

- um resumo de cinco linhas em português;
- o link da PR e o estado do CI;
- que o merge é do Victor e que o primeiro passo dele é ler o `.cache/auditoria-publico.md`, com a contagem de achados por tipo e nada além disso.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `PENDENCIAS.md`, o `README.md`, o `SECURITY.md`, os arquivos de `docs/claude/` e a descrição da PR.

Em inglês: o código, os nomes de arquivo, os identificadores, os comentários do `ci.yml` e os commits.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 15 min)

Os arquivos `prompt-fase-09.md` e `prompt-fase-09.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run os põe no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # bbd30c8 (o ajuste idiomas) ou mais novo
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado, com "workflow" nos escopos
claude --version            # o modo auto pede 2.1.83 ou mais
```

Depois, quatro coisas que a run não pode fazer sozinha:

1. **A versão final do plano.** A cópia em `Claude outputs\` é 15 s mais nova que a da raiz e tem duas frases revistas (o build do job leve e o nome do item em Settings → Actions):

   ```powershell
   Copy-Item "Claude outputs\PLANO-MELHORIAS.md" PLANO-MELHORIAS.md -Force
   Remove-Item "Claude outputs" -Recurse
   ```

2. **A linha no topo do `PLANO-FILEORCA.md`.** O `.claude/settings.json` proíbe a run de editar esse arquivo. Abra-o (`code PLANO-FILEORCA.md`) e cole o texto abaixo depois da linha "29/out/2026 · Victor Yuki Matusita · v7.1…", com uma linha em branco antes:

   ```text
   **Plano de melhorias (3/nov/2026):** o PLANO-MELHORIAS.md complementa este plano, da F9 à F13. Onde os dois conflitam, vale o PLANO-MELHORIAS.md, só nos itens da seção "Mudanças no contrato".
   ```

   Salve e confira com `git diff PLANO-FILEORCA.md`: só linhas novas no topo. A run commita o arquivo como está.

3. **O rótulo `ci`.** Criar rótulo é configuração do repositório, que fica fora de toda run:

   ```powershell
   gh label create ci --color 1D76DB --description "Roda o CI completo numa PR em rascunho"
   ```

4. **O escopo `workflow`.** A PR mexe em `.github/workflows/`, e o push é recusado sem ele:

   ```powershell
   gh auth refresh -h github.com -s workflow
   ```

O `git status` deve mostrar `PLANO-FILEORCA.md` modificado e, como não rastreados, `PLANO-MELHORIAS.md` e os dois arquivos do prompt.

E mais:

- **Os minutos do Actions.** Confira o uso em github.com → Settings → Billing and plans. Estimo uns 450 min para a run: umas 3 execuções completas no formato novo (até uns 110 min cada) e umas 10 leves (uns 10 min cada). Se sobrarem menos de 500 min no ciclo, espere a virada ou aceite que a parte do CI vira pendência: a run segue com tudo o que é local.
- **A energia.** `powercfg /change standby-timeout-ac 0`, e volte ao normal depois da run.
- **Opcional:** a limpeza das worktrees antigas (pendência "Worktrees", com os comandos no `docs\PENDENCIAS.md`). Libera disco para os agentes e para o espelho da auditoria.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-09
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-09.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal o pnpm verificar --partes verde na máquina local, a execução completa do CI da PR da fase-09 verde com o ci-ok verde, docs/relatorios/REVISAO-F9.md sem achado crítico ou alto aberto, .cache/auditoria-publico.md gravado e a PR fora do rascunho, esperando o merge do Victor
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-09` e mande: "continue de onde parou: leia docs/relatorios/fase-09-plano.md, o git log da branch fase-09 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-09.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-09.json
(Get-Content $HOME\run-fase-09.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**Por que o modo `auto`:** a run faz muita coisa sem perguntar:

- builda e roda o Vitest, o Playwright em várias portas e o Lighthouse;
- clona o espelho do repositório e baixa o gitleaks;
- lê a documentação do GitHub, do Playwright e do Cloudflare;
- cria e remove worktrees de agentes e da revisão;
- faz push da branch, abre a PR em rascunho, põe e tira o rótulo `ci` e marca a PR como pronta.

O `auto` deixa isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo: push na main, `gh pr merge`, `gh repo edit`, `gh api` com método, `wrangler deploy`, reset e amend. O prompt não pede nada disso, e proíbe também o `gh label create`.

**O tamanho da run.** Parecido com a F8:

- o CI redesenhado, com medidas que esperam execuções reais (cada execução completa leva uns 15 a 25 min de relógio);
- a auditoria do histórico inteiro;
- o `CLAUDE.md` dividido em 11 arquivos, com o teste;
- a revisão em seis lentes, com céticos.

Comece com folga no limite semanal do Claude Code. Se apertar, a válvula manda a compactação do `CLAUDE.md` e o `--partes` para a F9b. O resto nunca sai.

### 3. Acompanhar

- **A PR aparece cedo, em rascunho,** assim que o `ci.yml` novo estiver na branch. Os pushes dela rodam só o job leve.
- **A run põe e tira o rótulo `ci` sozinha.** Não mexa no rótulo e não marque a PR como pronta: o `gh pr ready` é o último passo dela.
- **A prévia da branch** (`https://fase-09-fileorca.vmatusita.workers.dev/`) deve ser o site de sempre: a F9 não muda o site.

### 4. Ao voltar

1. **Leia o `.cache\auditoria-publico.md` antes de tudo.** Ele fica fora do Git de propósito. Decida pela seção F do `PLANO-MELHORIAS.md`:
   - segredo achado: gire o segredo no serviço dele e não publique até resolver;
   - dado de terceiro: avalie se ele já era público;
   - GPS das fotos de teste: confira cada coordenada;
   - o e-mail dos commits fica público.
2. **Leia `docs\relatorios\fase-09.md`** e confira as evidências:
   - o `ci:custo` lado a lado: pelo menos 35 % a menos, preparo de até 90 s e partes de até 700 s;
   - a execução em rascunho sem o Playwright;
   - o `--list` com o mesmo número de testes;
   - o `CLAUDE.md` com até 25 KB;
   - o veredito do `REVISAO-F9.md`.
3. **Confira o diff do `.github/`:**

   ```powershell
   git fetch origin fase-09
   git diff --stat main...origin/fase-09 -- .github
   git diff main...origin/fase-09 -- .github
   ```

   Se estiver certo, use "Squash and merge" na página da PR e apague a branch.
4. **Se decidir publicar,** siga a seção F na ordem: visibilidade, ruleset (importando `docs/ops/ruleset-main.json`), aprovação de PR de fork, Code security e Features. Depois, gere o prompt da F9b com o `ci:custo` da primeira execução pública.
5. **Se decidir não publicar,** a economia do CI vale do mesmo jeito e a F9b não acontece. No plano Free, o ruleset só vale em repositório público.

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta, com o que aprendeu.

## Suposições que fiz

- **A main está em `bbd30c8`,** com o ajuste idiomas mesclado: é o HEAD do seu clone e o `origin/main` que ele conhece.
- **A versão final do `PLANO-MELHORIAS.md` é a de `Claude outputs\`.** A diferença para a da raiz são duas frases. Se você não copiar, a run copia sozinha (decisão 12).
- **A linha do `PLANO-FILEORCA.md` é sua,** porque o `.claude/settings.json` nega a edição desse arquivo à run. Sem ela, vira pendência.
- **O rótulo `ci` é seu,** porque criar rótulo é configuração do repositório.
- **A linha de base** é a execução verde do CI que levou à main de hoje (a última verde da PR do ajuste idiomas).
- **A F9 já segue as regras novas:** a PR abre em rascunho assim que o `ci.yml` novo estiver na branch, e o rótulo `ci` serve para as execuções completas do meio.
- **O `labeled` recalcula a classe** com qualquer rótulo. O `unlabeled` não dispara, então tirar o rótulo `ci` não gasta minuto.
- **O número de partes e os workers não mudam,** porque a F9b redivide para as máquinas de 4 vCPU.
- **O preparo** é medido do início do job ao passo do `verificar`. Se os 90 s não saírem depois de três abordagens medidas, a melhor medida vai para o relatório como pendência da F9b. A ficha não põe esse item entre os que nunca se cortam.
- **25 KB = 25.600 bytes.**
- **A auditoria roda num clone espelho em `.cache\`,** para ver os commits das PRs (`refs/pull/*`), que ficam públicos junto.
- **O README e o SECURITY saem em português,** pela regra de idioma do projeto.
- **O ruleset não exige aprovação nem branch atualizada,** para o CI continuar mesclando sozinho.
- **O prompt não traz nenhum dado pessoal,** porque ele entra no repositório que vai ficar público.
