# Operação do FileOrca

O manual do site depois da F9: o que fazer em cada alerta, a revisão mensal e a anual, as tarefas de configuração que são suas e o passo a passo do repositório público. Escrito na F8 (2/nov/2026; DECISOES § 303) e ampliado na F9 (3/nov/2026; a seção "Repositório público", DECISOES § 336). O `tests/unit/operacao.test.ts` confere que todo comando `pnpm`, caminho, workflow e título de issue citado aqui existe.

Quando um alerta pedir mudança no código, ela vira uma **run curta de ajuste** (a ficha "Run curta de ajuste" do `PLANO-FILEORCA.md`): branch `ajuste-{assunto}`, só a mudança pedida e um teste que falha sem ela. Se não couber numa run curta, vira ficha de fase.

## Como os alertas chegam

- **Issues do GitHub.** Os workflows abrem issue atribuída a você (`--assignee`), e o GitHub manda e-mail para quem foi atribuído. Para não depender só disso, deixe o repositório em **Watch → Custom → Issues** (tarefa da seção "Configuração", abaixo).
- **PRs abertas.** O Dependabot abre PR no dia 1 de cada mês; a de minor e patch se mescla sozinha quando o CI fica verde. As outras esperam você.
- **E-mail do UptimeRobot,** quando o site cai (depois que você criar o monitor).
- **Search Console, GA4 e AdSense:** na revisão mensal, ou por e-mail deles.

Títulos das issues que os workflows abrem (`.github/workflows/ci.yml` e `.github/workflows/pos-deploy.yml`):

- Título: "Pós-deploy falhou para <commit>"
- Título: "Merge automático falhou na PR #<n>"
- Título: "Merge da PR #<n> sem commit de merge legível"
- Título: "CI vermelho na PR #<n> do Dependabot"

## Issue "Pós-deploy falhou para <commit>"

- **O que quer dizer:** depois de um merge, o `scripts/ci/pos-deploy.ts` esperou até 20 minutos o `build.txt` de produção trazer o commit, e ele não chegou; ou chegou e a produção reprovou (script do Cloudflare injetado, `robots.txt` diferente, `X-Robots-Tag` errado).
- **O que fazer:**
  1. Abra o link da execução na issue e leia o log: `gh run view <id> --log`.
  2. Se a linha final é "O deploy de … não chegou em 20 min.", veja o build do Workers Builds no painel do Cloudflare (seção "Build do Workers Builds vermelho", abaixo). Confira o que está no ar: `curl -s https://fileorca.com/build.txt`.
  3. Se o deploy só atrasou, rode a conferência de novo à mão: `gh workflow run pos-deploy.yml --ref main -f commit=<sha completo> -f wait_minutes=20`.
  4. Se a produção reprovou por script injetado, desligue a injeção na zona do Cloudflare (as da tabela "Injeções desligadas" do `docs/F0-SAIDA.md`).
- **Quando vira run curta:** `robots.txt` ou `X-Robots-Tag` errados no código.
- Feche a issue quando a conferência passar.

## Issues do job de merge

- **"Merge automático falhou na PR #<n>":** o CI ficou verde e a regra (`scripts/ci/pode-mesclar.ts`) decidiu mesclar, mas o GitHub recusou (conflito, PR desatualizada). Abra a PR, resolva o conflito ou peça ao Dependabot `@dependabot rebase` num comentário (PR do Dependabot), e o CI roda de novo. Se for uma PR de run, atualize a branch com a `main` e faça push.
- **"Merge da PR #<n> sem commit de merge legível":** o merge aconteceu, mas o job não leu o commit, e o pós-deploy não rodou. Rode-o à mão: pegue o commit em `git log origin/main -1` e rode `gh workflow run pos-deploy.yml --ref main -f commit=<sha completo> -f wait_minutes=20`.

## PR de major do Dependabot

- **O que quer dizer:** uma dependência subiu de versão major. A regra de merge nunca mescla major: a PR espera você, e o job comenta "Merge automático: não".
- **O que fazer:**
  1. Leia as notas da versão (o link está na PR).
  2. Olhe o CI da PR. Verde não basta para major: confira a prévia do Workers Builds (link na PR) numa ferramenta de imagem, uma de PDF e uma calculadora.
  3. Mescle pela página da PR (squash) ou feche com `@dependabot ignore this major version`.
- **Quando vira run curta:** o CI ficou vermelho e a correção é no código (por exemplo, uma API que mudou).
- `typescript`, `@types/node` acima do Node do `.node-version` e o `qrcode` estão no `ignore` do `.github/dependabot.yml` (DECISOES § 298): esses sobem só numa run.

## Issue "CI vermelho na PR #<n> do Dependabot"

- **O que quer dizer:** uma PR do Dependabot (a do grupo de minor e patch, ou uma major) ficou vermelha. O GitHub não manda e-mail de falha para execução que o Dependabot começou: este job (`alerta-dependabot`, no `.github/workflows/ci.yml`) abre a issue e comenta na PR. Uma issue por PR: o próximo vermelho da mesma PR vira comentário.
- **O que fazer:**
  1. Leia a parte vermelha: `gh run view <id> --log`, com o `--attempt` se for um rerun.
  2. Se a falha for `ENOSPC` ou um travamento do WebKit, rode só a parte de novo: `gh run rerun <id> --failed`. Isso só vale em até 24 h da execução: desde a F9, as partes baixam o artefato do build, guardado por 1 dia. Depois disso, use "Re-run all jobs" na página da execução (refaz o build) ou peça `@dependabot rebase` num comentário da PR.
  3. Se a falha vier da atualização, veja a seção "Depois de certas PRs" abaixo.
  4. Feche a issue quando a PR ficar verde (ela se mescla sozinha).
- **No primeiro ciclo (1/dez/2026):** confira que a issue abriu de fato numa PR vermelha, se houver uma. A prova ao vivo só vem com uma PR real.
- **Quando vira run curta:** um teste que fixa uma versão sem razão de produto (ele passa a ler a versão do `package.json`), ou um código que a versão nova quebra.

## PR de GitHub Actions do Dependabot

- Toda PR do ecossistema `github-actions` mexe em `.github/workflows/`, então a regra de merge nunca a mescla: é sempre sua.
- **O que fazer:** confira no diff que só o SHA e o comentário de versão das actions mudaram (`git diff origin/main...<branch> -- .github/`), olhe o CI e mescle pela página da PR.

## Execução "Dependabot Updates" vermelha

- Nada avisa: entra na revisão mensal.
- **Onde olhar:** Insights → Dependency graph → Dependabot, no repositório (ou a aba Actions, execuções "Dependabot Updates"). O erro mais provável é `dependency_file_not_parseable` no `pnpm-lock.yaml`.
- **O que fazer:** abra o log da execução. Se o arquivo `.github/dependabot.yml` tiver erro, corrija numa run curta (a PR que mexe só nele se mescla sozinha).

## Build do Workers Builds vermelho

- O check do GitHub não traz o log. Abra o build no painel do Cloudflare (Workers → fileorca → Deployments) e procure as linhas `Executing user build command` e `Executing user deploy command`: elas dizem o que rodou de fato (a configuração mostrada na página pode não ser a que rodou).
- Se a linha mostra um comando errado, corrija no painel. Se é erro do código, vira run curta com o log colado na ficha.

## Queda no UptimeRobot

- **O que fazer:** abra https://fileorca.com num navegador anônimo e veja `curl -sI https://fileorca.com/`. Veja o status do Cloudflare (cloudflarestatus.com). Se só o site caiu, veja o último deploy no painel do Workers.
- Um deploy ruim volta pelo painel do Cloudflare (Deployments → Rollback para o anterior), sem mexer no código; depois, a correção vira run curta.

## Googlebot barrado

- **Como chega:** na revisão mensal, Search Console → Configurações → Estatísticas de rastreamento mostra respostas 403.
- **O que fazer:** confira a zona do Cloudflare contra o `docs/F0-SAIDA.md` (seção "Cloudflare"): Bot Fight Mode desligado, robôs de IA liberados, nenhuma regra de WAF nova barrando o Googlebot.

## Minutos do Actions acabando

- **Hoje não acontece:** o repositório é público, e os runners padrão do GitHub não gastam a cota de um repositório público (seção "Repositório público", abaixo). Esta seção vale se ele voltar a ser privado.
- **Onde ver:** Settings → Billing → Actions (2.000 minutos por mês no plano Free, com o repositório privado).
- **Quanto custa cada execução** (os minutos como num repositório privado, que o `pnpm ci:custo <id>` mostra; DECISOES § 323): desde a F9, um push numa PR em rascunho roda só o job leve (uns 5 minutos), uma PR só de documentação roda o build e os portões, e uma PR pronta roda o CI completo (111 minutos nas execuções da F9, contra 157 na linha de base, numa máquina mais rápida; DECISOES § 339). Cada PR do Dependabot nasce pronta e roda o CI completo, e cada rebase dela também.
- **O que fazer:** baixe o `open-pull-requests-limit` do `.github/dependabot.yml` numa run curta, feche PRs de major que você não vai mesclar agora com `@dependabot ignore this major version`, e evite reruns sem motivo. O `pnpm ci:custo <id>` mostra o que mais pesa em cada execução.

## Defeito no service worker (desativação de emergência)

- **Sinais:** páginas velhas que não atualizam depois de um deploy, uma ferramenta que só funciona em aba anônima, ou um pico de `tool_error` com `load` logo depois de um deploy.
- **O que fazer:** uma run curta de ajuste que troca `SW_ENABLED` para `false` em `src/platform/site.ts` (DECISOES § 288). O build passa a publicar um `/sw.js` que apaga todos os caches do site e se desregistra, as páginas deixam de registrar e o manifest perde o compartilhar. Na próxima visita de cada pessoa, tudo volta a vir só da rede.
- **Os testes acompanham a chave:** os specs do service worker e do compartilhar, o teste dos manifests e o do `/sw.js` leem o `SW_ENABLED` e, com ele em `false`, conferem que não há registro, cache nem compartilhar (DECISOES § 307). A run só troca a constante e roda o `pnpm verificar`.
- **O app já instalado no Android:** o aplicativo guarda o compartilhar do manifest antigo até o Chrome atualizá-lo, o que pode levar dias. Nessa janela, quem compartilha um arquivo com o app manda o arquivo ao fileorca.com, que responde 405 e não guarda nada (o mesmo acontece depois de a pessoa apagar os dados do site; a Privacidade diz isso). Desligue só por um defeito que justifique essa janela, e volte a ligar assim que der.
- Corrigido o defeito, outra run curta volta o `SW_ENABLED` para `true`.

## Pico de `tool_error` no GA4

- **Onde ver:** GA4 → Relatórios → Eventos → `tool_error`, com as dimensões ferramenta, navegador e formato.
- **O que fazer:** se o pico é de um navegador só, é compatibilidade; se é logo depois de um deploy e o motivo é `load`, é a página velha pedindo um arquivo que o deploy trocou (a pessoa recarrega e passa). Um pico que não passa vira run curta, com o navegador e o formato na ficha.

## E-mail de política do AdSense

- Leia o e-mail inteiro e abra a página citada. O que derruba conta está em "O que derruba conta" do `PLANO-FILEORCA.md`.
- Anúncio perto demais de algo clicável (Confirmed Click aplicado) vira run curta com a página e a distância.
- Responda o e-mail só depois da correção no ar.

## Uma parte do CI com `ENOSPC`

- O WebKit do runner às vezes enche o disco (DECISOES § 108, § 109 e § 141). Leia as linhas `[disco]` do log e rode só a parte de novo: `gh run rerun <id> --failed`. Não mexa em teste por causa disso.
- O `--failed` só vale em até 24 h da execução: desde a F9, as partes baixam o artefato `site` do job `build`, guardado por 1 dia, e depois disso a parte rodada de novo falha no download, por uma razão que nada tem a ver com o `ENOSPC`. Passadas as 24 h, use "Re-run all jobs" na página da execução (refaz o build; não testado na F9) ou faça um push na branch. A retenção de 1 dia fica (DECISOES § 324).

## Depois de certas PRs

Saído do ensaio do Dependabot da F8 (DECISOES § 299):

- **`pdfjs-dist` com outro `core-js` dentro (a próxima minor, 6.5, traz o 3.51.0):** a PR do grupo fica vermelha no `gate:licencas` e no `tests/unit/licenses.test.ts`, porque a /licenses tem o texto da versão anterior (DECISOES § 179). A correção é uma run curta numa branch de ajuste, mesclada antes de a PR do Dependabot ficar verde:
  1. Compare o SHA-256 do LICENSE da versão nova do core-js (`https://github.com/zloirock/core-js/blob/v<versão>/LICENSE`) com o da cópia em `src/platform/license-texts/`.
  2. Se o texto é o mesmo, renomeie a cópia com `git mv` para o nome da versão nova; se mudou, grave os bytes novos.
  3. Troque o rótulo, o arquivo e o endereço da entrada do core-js em `src/platform/licenses.ts`, e a chave da tabela de hashes do `tests/unit/licenses.test.ts`.
  4. Acrescente uma linha à § 179 do `DECISOES.md`.
- **`pdfjs-dist`, de novo:** o `tests/unit/pdf-hardening.test.ts` lê o código publicado do PDF.js (sem `eval`, as fábricas do motor com todos os métodos das do PDF.js). Se ele reprovar, a correção é uma run curta que relê o código novo; nunca afrouxar o teste.
- **`@cantoo/pdf-lib`, `@neslinesli93/qpdf-wasm`, `@jsquash/*`, `fflate`, `pdfjs-dist` ou `@playwright/test`:** depois do merge, rode `pnpm guias:medir --check` (com `pnpm build` antes). Se der diferença, uma run curta mede de novo com `pnpm guias:medir` e commita o `data/guides-measured.json`.
- **Codecs (`@jsquash/*`, `libheif-js`, qpdf):** confira na página /licenses se as versões das bibliotecas compiladas mudaram (o teste não pega isso sozinho).

## Revisão mensal (30 minutos)

- [ ] Search Console: páginas entre as posições 5 e 15 ganham conteúdo e link interno (anote para uma run).
- [ ] Search Console: categoria sem impressão em 90 dias para de crescer até você entender o motivo.
- [ ] Search Console: estatísticas de rastreamento sem 403 (seção "Googlebot barrado") e zero erro de hreflang.
- [ ] AdSense: status do Confirmed Click.
- [ ] GA4: os `tool_error` do mês (seção acima).
- [ ] GitHub: a PR de minor e patch do Dependabot se mesclou? Há PR de major ou de Actions esperando? A execução "Dependabot Updates" está verde?
- [ ] GitHub: minutos do Actions do mês.
- [ ] Issues abertas: alguma esquecida?
- [ ] As ferramentas fixadas por SHA-256 em `scripts/lib/tools.ts` (actionlint, shellcheck, LanguageTool, JRE), o `packageManager` do `package.json` e o `.node-version`: alguma versão nova importante? Vira run curta.
- [ ] O `docs/PENDENCIAS.md`: escolha um grupo para a próxima run de ajuste.

## Revisão anual (meia hora)

- As fontes das calculadoras de dinheiro, casa e saúde: abrir cada uma citada nas páginas e conferir se mudou (taxas, limites, fórmulas oficiais). Mudança vira run com o oráculo regerado.
- As medidas das redes sociais do guia de tamanhos de imagem (`src/i18n/en/guide-social-media-image-sizes.ts`).

## Configuração que é sua

- [ ] **Watch do repositório:** Watch → Custom → Issues (e Pull requests, se quiser), para receber todo e-mail de issue.
- [ ] **UptimeRobot:** monitor HTTPS de https://fileorca.com a cada 5 minutos, com alerta para o Gmail da marca.
- [ ] **Depois do merge da F8:** Insights → Dependency graph → Dependabot, conferir que o `.github/dependabot.yml` foi aceito sem erro.
- [ ] **Opcional:** Settings → Advanced Security (antes "Code security") → Dependabot security updates, para PRs de segurança fora do mês (elas também rodam o CI inteiro).

## Repositório público

Escrito na F9 (3/nov/2026; DECISOES § 332 a § 336), a partir da seção F do `PLANO-MELHORIAS.md`.

**O repositório já é público.** O GitHub registra a visibilidade pública desde a criação, em 28/out/2026: o histórico inteiro, com as `refs/pull/*` das PRs, já pode ser lido por qualquer pessoa. O passo "Change visibility" da seção F já está feito. Os outros passos ficaram urgentes, porque hoje a `main` não tem ruleset, uma PR de fork de quem já contribuiu roda o CI sem a sua aprovação, e o secret scanning, o push protection e o relato privado de falhas estão desligados.

### Passo a passo, nesta ordem

Os passos 2, 3 e 4 são só configuração e não dependem do merge da F9: faça-os logo depois da auditoria. Só o ruleset (passo 6) espera o merge (passo 5).

1. **Leia a auditoria antes de tudo.** Rode `pnpm publico:auditar` na pasta do projeto, com a branch `fase-09` em uso: o script (e o README, o SECURITY e o LICENSE) só chega à `main` com o merge do passo 5. Ele leva uns 20 s, atualiza o espelho em `.cache/auditoria/` e, na primeira vez numa máquina, baixa o gitleaks fixado por SHA-256 no `scripts/lib/tools.ts`. Rode de novo mesmo que o `.cache/auditoria-publico.md` já exista: a auditoria da run foi feita antes dos últimos commits da F9, e a decisão vale sobre o histórico de agora. Abra o `.cache/auditoria-publico.md`. O arquivo fica fora do Git e traz cada achado com o valor, onde ele aparece (arquivo, commit e ref) e a categoria. No terminal saem só as contagens. Decida por categoria:
   - **Segredo real:** gire o segredo no serviço dele agora, porque o histórico já está público.
   - **Dado de terceiro** (por exemplo, o e-mail de uma pessoa num arquivo do repositório): tirar do arquivo atual numa run curta resolve o arquivo, mas não o histórico. Veja se o dado já era público no site da pessoa.
   - **GPS:** cada foto com a coordenada. Confira se alguma aponta para um lugar que você não quer mostrar.
   - **Dado do Victor** (o e-mail dos commits e as contas com o nome da marca): já está público com o histórico.
   - **Público por natureza e falso positivo:** só conferência, sem ação. Um achado só cai em falso positivo por estar só em `tests/` ou `fixtures/` (pendência "F9 auditoria testes"): passe o olho nos valores dessas linhas também.

   Reescrever o histórico não está no plano: quebra os testes que leem commits antigos e os links dos relatórios. Se algo não puder continuar público, a saída sem reescrever é voltar o repositório para privado (Settings → General → Danger Zone → Change visibility). Quem já clonou ou fez fork continua com a cópia. Antes de voltar, saiba o que muda:
   - **O ruleset pode deixar de valer:** no plano Free, um repositório privado pode ficar sem ele. A página "About rulesets" do GitHub, lida na F9, fala dos planos Team e Enterprise e não confirma o Free privado: confira lá, e na página do seu plano, antes de mudar. Sem o ruleset, a proteção da `main` volta a ser só o hook, o `.claude/settings.json` e o `CLAUDE.md`.
   - **Os minutos do Actions voltam a contar** (seção "Minutos do Actions acabando"), e uma execução completa custa mais de 100 minutos.
2. **Advanced Security** (antes "Code security" ou "Code security and analysis"): Settings → Advanced Security (na seção "Security and quality" do menu lateral). Ligue Secret Protection (o secret scanning de antes) e, dentro dela, Push protection, e ligue Private vulnerability reporting. O `SECURITY.md` manda relatar pelo relato privado: até você ligá-lo, o botão "Report a vulnerability" não aparece, e o relato vai pelo e-mail do site. Ligue antes do merge da F9, que leva o `SECURITY.md` à `main`.
3. **Aprovação de PR de fork:** Settings → Actions → General, na parte de aprovação de workflows de PR de fork, escolha "Require approval for all external contributors". Hoje está em "first-time contributors".
4. **Features:** Settings → General → Features, desligue Wiki e Projects (hoje ligados) e confira que Discussions está desligado. Issues fica, porque os alertas dos workflows usam.
5. **Dê o merge da PR da F9** (squash, apagando a branch), depois de ler o diff do `.github/`. Ela traz o check `ci-ok`, a proteção contra PR de fork no `scripts/ci/pode-mesclar.ts` e as guardas dos jobs que escrevem.
6. **Importe o ruleset da `main`,** só depois do passo 5: antes de o `.github/workflows/ci.yml` com o job `ci-ok` estar na `main`, nenhuma PR recebe esse check, e todas ficariam esperando. Settings → Rules → Rulesets → New ruleset → Import a ruleset → escolha o `docs/ops/ruleset-main.json` → revise → Create.
   - O que ele exige: só na branch padrão, PR obrigatória sem aprovação e só com squash; o `ci-ok` vindo do GitHub Actions como o único check, sem exigir a branch atualizada; nenhum force push e nenhuma exclusão; ninguém contorna. O `tests/unit/ruleset.test.ts` confere o arquivo.
   - Como o `ci-ok` resume o CI inteiro, mudar as partes do CI nunca mexe no ruleset.
   - Se um dia precisar mesclar com o `ci-ok` vermelho, mude o ruleset para Disabled (Settings → Rules → Rulesets → main → Enforcement status), mescle e volte para Active.
   - **Um `ci-ok` vermelho de execução cancelada no mesmo commit.** Quando um push e o `gh pr ready` (ou um rótulo) chegam juntos, a primeira execução é cancelada, e o `ci-ok` dela (que sempre roda) sai vermelho e fica no commit ao lado do verde da execução nova (DECISOES § 327). Não se sabe se o ruleset recusa o merge por causa dele: não foi testado (pendência "F9 ci-ok duplicado"). Se o merge for recusado assim (issue "Merge automático falhou na PR #<n>" com o `ci-ok` verde na execução nova), rode de novo a execução cancelada (`gh run rerun <id da cancelada>`) ou faça um push na branch; nenhum dos dois foi testado. Se nada resolver, a saída é a de cima (Disabled, merge, Active).
7. **Workers Builds:** confira o painel do Cloudflare e o app do GitHub (subseção "Workers Builds e PR de fork", abaixo).
8. **Na primeira PR depois disso,** confira que o check `ci-ok` aparece e que o merge automático acontece. Se ela tiver uma execução cancelada no mesmo commit, veja se o merge passou mesmo assim e registre a resposta numa run curta (pendência "F9 ci-ok duplicado"). Gere o prompt da F9b com o custo dessa execução: `pnpm ci:custo <id da execução>`.

### Merge de PR de fork

- Uma PR de fork roda o `.github/workflows/ci.yml` **da própria PR**, não o da `main`. Quem abre a PR pode mudar o workflow para o `ci-ok` sair verde sem testar nada. Verde ali não prova nada.
- Por isso o merge de PR de fork é sempre seu, depois de ler o diff inteiro, com atenção a `.github/`, `scripts/`, `package.json`, `pnpm-lock.yaml` e `.githooks/`.
  - O job `merge` não roda em PR de fork, e o `scripts/ci/pode-mesclar.ts` recusa a PR cujo head não é deste repositório e a de autor que não seja o dono ou o Dependabot. Uma PR de branch `fase-*` de outra pessoa também não se mescla sozinha.
  - Os jobs que escrevem (o `merge`, o `alerta-dependabot` e o `.github/workflows/pos-deploy.yml`) não rodam em PR de fork, e nenhum workflow usa `pull_request_target`.
  - O token de uma PR de fork só lê, e os workflows não usam nenhum segredo do repositório.
- Com o passo 3, cada execução de PR de fork espera você clicar em "Approve and run". Leia o diff antes de aprovar: aprovar roda o código da PR num runner do GitHub.

### O que fica público no Actions

- Qualquer pessoa lê os logs de toda execução, e qualquer conta do GitHub baixa os artefatos.
- **Os artefatos:** o do build (o `dist/` e o `.cache/bundle-modules.json`), com retenção de 1 dia, e os relatórios do Playwright (`playwright-report-<n>`), com 7 dias. O `dist/` é o site que já está no ar; os relatórios trazem screenshots das páginas e as fixtures de teste, que são amostras públicas (`fixtures/ORIGEM.md`).
- **Os logs:** nenhum passo imprime token ou variável de ambiente. No job `merge`, o `GH_TOKEN` é variável do job inteiro: chega também ao checkout, ao `setup-node`, ao `dependabot/fetch-metadata` e ao passo que roda o `scripts/ci/pode-mesclar.ts`, embora só dois passos chamem o `gh`. No `alerta-dependabot`, o único passo chama o `gh`; no `ci-ok`, o token entra só no passo Verdict, com permissão só de leitura. O GitHub mascara o token no log. O diagnóstico de disco (`scripts/lib/disco.ts`) mostra caminhos e tamanhos do runner e o nome dos processos, nunca a linha de comando nem o ambiente.
- A auditoria não roda no CI: o `.cache/auditoria-publico.md` só existe na sua máquina.
- Título de PR, de issue e mensagem de commit também ficam públicos: nunca ponha dado pessoal neles.
- Os comentários do Workers Builds nas PRs também são públicos: trazem o status do build, a URL da prévia no `workers.dev` e o link do painel do Cloudflare, com o ID da conta (que não é segredo).
- Num repositório público, os runners padrão do GitHub não gastam a cota de minutos. A seção "Minutos do Actions acabando" vale enquanto o repositório for privado.

### Workers Builds e PR de fork

- **O que a documentação do Cloudflare diz** (lida em 3/nov/2026):
  - Workers Builds, página "Build branches": com **Enable Preview Builds** ligado (Settings → Build → Branch control), "every push to a branch that is not your production branch triggers a preview build".
  - Workers Builds, página "GitHub integration": o Cloudflare publica a cada push numa branch do repositório conectado e comenta na PR o status do build e a URL da prévia. O app do GitHub se chama "Cloudflare Workers and Pages", é o mesmo do Pages, e a página recomenda limitar o acesso aos repositórios que você publica.
  - Nenhuma página do Workers Builds (build branches, GitHub integration, configuration) fala de fork. Só a do Pages fala: "preview URLs will not be created for pull requests created from forks of your repository".
  - Os exemplos de automação de prévias do Cloudflare, com GitHub Actions, lembram que os segredos do repositório não chegam a PR de fork. O CI do FileOrca não usa credencial do Cloudflare: quem publica é só o Workers Builds.
- **O que isso quer dizer:** a prévia nasce de um push numa branch deste repositório. O push de quem fez fork vai para o repositório dele, então o esperado é nenhum build. Como a documentação do Workers Builds não diz isso, confira de verdade.
- **O que você confere:**
  1. No Cloudflare, Workers → fileorca → Settings → Build → Branch control: a branch de produção é a `main`, e Enable Preview Builds está como você quer.
  2. Nas variáveis e nos segredos do build e nas configurações das prévias: só valores que o site já publica, nenhum token.
  3. No GitHub, na sua conta, Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages → Configure: Repository access em "Only select repositories", só com o `fileorca` (e o repositório do motor, quando existir).
  4. Um teste de verdade: de uma segunda conta (sua ou de alguém de confiança), faça um fork, abra uma PR que muda uma linha de um `.md` e veja se aparece check, comentário ou build do Workers Builds. Depois feche a PR.
- **Se uma PR de fork gerar build:** desligue Enable Preview Builds até decidir, porque o build roda o código da PR com as variáveis do build, e registre numa run curta.

## Pendências

O que ficou para depois está em `docs/PENDENCIAS.md`, agrupado por tipo de run.
