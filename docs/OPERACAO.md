# Operação do FileOrca

O manual do site depois da F8: o que fazer em cada alerta, a revisão mensal e a anual, e as tarefas de configuração que são suas. Escrito na F8 (2/nov/2026; DECISOES § 303). O `tests/unit/operacao.test.ts` confere que todo comando `pnpm`, caminho, workflow e título de issue citado aqui existe.

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
  2. Se a falha for `ENOSPC` ou um travamento do WebKit, rode só a parte de novo: `gh run rerun <id> --failed`.
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

- **Onde ver:** Settings → Billing → Actions (2.000 minutos por mês no plano Free, com o repositório privado).
- Cada execução do CI custa uns 135 minutos (15 partes). Cada PR do Dependabot roda o CI inteiro, e cada rebase dela também.
- **O que fazer:** baixe o `open-pull-requests-limit` do `.github/dependabot.yml` numa run curta, feche PRs de major que você não vai mesclar agora com `@dependabot ignore this major version`, e evite reruns sem motivo.

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
- [ ] **Opcional:** Settings → Code security → Dependabot security updates, para PRs de segurança fora do mês (elas também rodam o CI inteiro).

## Pendências

O que ficou para depois está em `docs/PENDENCIAS.md`, agrupado por tipo de run.
