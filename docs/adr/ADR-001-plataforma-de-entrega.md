# ADR-001: Plataforma de entrega do FileOrca

**Status:** Aceito
**Data:** 28/out/2026 (revisão 2: pipeline de merge automático, zona do Cloudflare e e-mail)
**Decisor:** Victor Yuki Matusita (único dono do projeto)
**Afeta:** PLANO-FILEORCA.md (decisões fechadas, plataforma, da run ao ar, F0, F1a, F5, F8)

## Contexto

- O FileOrca é um site estático. Todo o processamento roda no navegador (Web Workers e WASM nas ferramentas de arquivo, TypeScript puro nas calculadoras), sem backend, sem conta e sem upload.
- A receita vem de anúncio, em centavos por mil pageviews. Custo que cresce com o tráfego come a margem, e a meta é custo zero e nenhum plantão.
- O tráfego é de pico: lançamento no Hacker News e no Product Hunt, robôs lendo cerca de 140 páginas em três idiomas e o risco de tráfego inválido de todo site de anúncio. Esse pico não pode encostar no Estacionou, que fica sozinho na equipe vmatusita da Vercel.
- A página de ferramenta tem orçamento de 80 KB de JS gzip, e os anúncios pesam por fora.
- Você trabalha sozinho. O código sai de runs autônomas do Claude Code, 3 por semana, com merge automático quando o CI passa. O caminho até o ar precisa ser automático e conferido por máquina.

## Decisão

1. **Framework:** Astro 7 com ilhas Preact 11 e saída estática pura: sem adaptador, sem SSR e sem função de servidor.
2. **Hospedagem:** Cloudflare Workers, plano Free, numa conta própria do FileOrca. Um Worker chamado `fileorca`, só com assets, ligado ao domínio fileorca.com como domínio próprio. O `wrangler.jsonc` tem `name`, `compatibility_date` fixa e `assets` (diretório `./dist`, `not_found_handling: "404-page"`, `html_handling: "auto-trailing-slash"`), com `workers_dev: true` e `preview_urls: true` (a produção também responde em workers.dev, sempre com noindex). Não tem `main` nem `run_worker_first`, e um teste reprova se aparecer.
3. **Build portátil:** o `dist/` é só arquivo estático. Cabeçalhos e redirecionamentos ficam num arquivo só do código (`src/platform/headers.ts`), que o build converte para `_headers` e `_redirects`. Nenhum recurso exclusivo de plataforma: trocar de host é trocar esse conversor e o DNS, sem mexer em URL nem em conteúdo.
4. **Um app só:** um repositório, sem monorepo. O motor de imagem que vira código aberto fica em `src/engine/image/`, sem importar nada de fora da pasta (o lint confere), e vai para o repositório público por um script de exportação.
5. **Repositório e pipeline:** `vmatusita/fileorca`, privado, no GitHub Free.
   - A run abre a PR a partir de uma branch `fase-*` ou `ajuste-*`. O Workers Builds gera a prévia e comenta o link na PR.
   - O GitHub Actions roda o `pnpm verificar` só em PR, cancelando a execução anterior da mesma PR.
   - Com tudo verde, um job de merge no mesmo workflow (permissions `contents`, `pull-requests` e `issues` em write) decide pelo `scripts/ci/pode-mesclar.ts`: mescla PR de `fase-*` ou `ajuste-*` e patch ou minor do Dependabot (lido pelo `dependabot/fetch-metadata`), desde que a PR não mexa em `.github/workflows/`. O merge é `gh pr merge --squash --delete-branch`, sem `--auto`. PR que mexe no pipeline, major do Dependabot e qualquer outra PR ficam para o dono, e o job comenta isso na PR. Se o GitHub recusar o merge, o job comenta e abre uma issue.
   - O merge na main dispara o Workers Builds, que publica em produção.
   - O job de merge chama o workflow pós-deploy por `workflow_call`, passando o commit do merge, porque merge feito com o `GITHUB_TOKEN` não dispara outro workflow pelo push. Merge manual dispara o pós-deploy pelo push na main. O pós-deploy também aceita `workflow_dispatch` (commit e minutos de espera), para teste.
   - O pós-deploy espera até 20 minutos o `https://fileorca.com/build.txt` trazer o commit ou um posterior e confere a produção: nenhum script `/cdn-cgi/` nem `cloudflareinsights` no HTML, `robots.txt` igual ao `public/robots.txt` e `X-Robots-Tag` de acordo com o `LAUNCHED` do commit (false exige noindex, true exige ausência). Se passar, dispara o IndexNow só com as URLs das páginas cujos arquivos mudaram (`scripts/ci/urls-alteradas.ts`). Se falhar ou o deploy não chegar, abre uma issue.
   - Sem proteção de branch no GitHub Free privado, a main tem três travas: o hook `pre-push` em `.githooks/` (ligado na F0 com `git config core.hooksPath .githooks`), as regras de negação do `.claude/settings.json` e o `CLAUDE.md`.
6. **Indexação controlada:**
   - `X-Robots-Tag: noindex` na regra absoluta `https://:version.:subdomain.workers.dev/*` do `_headers`, que cobre toda prévia e toda Version URL.
   - Até o lançamento, a constante `LAUNCHED` (`src/platform/site.ts`) fica false e põe noindex em todo o site. A run da F2 troca para true.
7. **Zona do Cloudflare**, configurada pelo dono na F0 e nunca por uma run:
   - Ligado: Always Use HTTPS.
   - Desligado: Email Address Obfuscation, Rocket Loader, configuração automática do Web Analytics, Bot Fight Mode, Bot Preference Sync e robots.txt gerenciado.
   - Rastreadores de IA: Search, Agent e Training em Allow.
   - DNS: o domínio ligado ao Worker; `www` AAAA `100::` com proxy e a regra de redirecionamento "Redirect from WWW to root" (301); o TXT do Search Console; o `_dmarc` com `v=DMARC1; p=reject`.
   - E-mail: Cloudflare Email Routing, que cria os MX, o SPF `v=spf1 include:_spf.mx.cloudflare.net ~all` e o DKIM, e encaminha contato@fileorca.com para o Gmail da marca.
8. **Domínio:** fileorca.com fica no GoDaddy, com os nameservers no Cloudflare, até completar 60 dias da compra. Aí vai para o Cloudflare Registrar, e o DNSSEC é ligado depois da transferência.

## Por que

- **Custo:** no Workers, requisição e banda de arquivo estático não são cobradas, em qualquer volume. O plano Free aceita domínio próprio, inclusive o domínio raiz, e site com anúncio. O único veto específico do plano grátis é processar ou coletar cartão de crédito no site, o que o FileOrca não faz: o Ko-fi é um link para fora e o Pix é um QR.
- **Isolamento:** conta, fatura e DNS próprios. O pior dia do FileOrca não encosta no Estacionou.
- **Peso da página:** o Preact mede 5,6 KB gzip, e a ilha da ferramenta cabe no orçamento de 80 KB com o anúncio por fora.
- **Pipeline:** com 3 runs por semana e ninguém revisando código à mão, o portão é o `pnpm verificar`, e o pós-deploy faz a conferência de produção que uma pessoa faria. No GitHub Free privado não há auto-merge nativo nem proteção de branch, então o merge é um job comum do CI que só roda depois do verificar. PR que muda o próprio pipeline passa por você: é a única mudança que poderia desligar as travas.
- **Robôs:** desde 15/set/2026, domínio novo no Cloudflare bloqueia por padrão os robôs de treino de IA em páginas com anúncio. Robô misto, como o Googlebot e o Bingbot, é bloqueado onde o treino é bloqueado. Liberar as três categorias é o que mantém o site no Google quando os anúncios ligarem.
- **Zona sem injeção:** o Email Address Obfuscation vem ligado, e ele, o Rocket Loader, o Web Analytics automático e o Bot Fight Mode (por meio das detecções em JavaScript) põem script no HTML. Isso estoura os orçamentos de JS e de requisições, e o Bot Fight Mode ainda pode desafiar os verificadores das redes de anúncio.
- **E-mail:** o Email Routing fica no mesmo painel do DNS e cria os próprios registros. Como o encaminhamento precisa do `include` do Cloudflare no SPF, um `v=spf1 -all` puro não serve. O DMARC `p=reject` continua barrando e-mail falso em nome do domínio, que não envia nada.

## Consequências

**Fica mais fácil:**

- Custo de hospedagem zero em qualquer cenário de tráfego, inclusive viral.
- A fatura, a cota e o DNS do Estacionou ficam intocados.
- Nenhuma PR de fase espera por uma pessoa (menos as que mexem no pipeline), e um deploy que não chega ao ar vira issue sozinho.
- Trocar de host no futuro, porque o build não depende de nenhum.

**Fica mais difícil:**

- Cloudflare e GitHub, cada um com conta e 2FA.
- O DNS e a zona são do dono, na F0. Nenhuma run toca neles.
- No Free, o Workers Builds roda um build por vez, com limite de 20 minutos, e as PRs do Dependabot entram em fila.
- Um bug que passa no `pnpm verificar` vai ao ar sem olho humano. A correção é uma run curta, e o `tool_error` do GA4 e as conferências depois de cada fase são a rede.
- O site nunca pode coletar cartão de crédito.

## Revisitar se

- O Cloudflare passar a cobrar requisição a arquivo estático ou limitar o plano Free.
- O site precisar de código no servidor ou de pagamento com cartão. Aí entram o limite de 100 mil invocações por dia do Free e o Workers Paid.
- O build passar de 20 minutos, ou o CI passar de 2.000 minutos por mês no GitHub Actions.
- O Cloudflare mudar de novo o padrão de robôs ou de injeção de script na zona (o pós-deploy e o rastreamento no Search Console avisam).
- Em 7/dez/2026, na entrada do piloto automático: algum merge automático levou bug ao ar?

## Ações

| # | Quando | Quem | Ação |
|---|---|---|---|
| 1 | F0 | Você | Conta do Cloudflare com 2FA; zona fileorca.com; nameservers no GoDaddy; registros importados apagados |
| 2 | F0 | Você | Configuração da zona e DNS do item 7 da decisão, inclusive o Email Routing |
| 3 | F0 | Você | Primeiro commit na main com o conteúdo da pasta repo-inicial, que já traz esta ADR em `docs/adr/`, o `CLAUDE.md` e o hook `pre-push`; o `claude-settings.json` vai para `.claude/settings.json` |
| 4 | F0 | Você | Worker `fileorca` (Hello World), domínio próprio fileorca.com, build ligado ao repositório com `pnpm build`, prévia de branch e `PUBLIC_ADS_ENABLED=false`; no fim da F0, `git config core.hooksPath .githooks` |
| 5 | F1a | Claude, depois você | `wrangler.jsonc`, `src/platform/headers.ts`, `LAUNCHED`, `build.txt`, teste de Worker sem código, `ci.yml` com o job de merge, `pos-deploy.yml`, `scripts/ci/` e o § 1 do `DECISOES.md` apontando para esta ADR. O merge dessa PR é seu, porque ela cria o pipeline |
| 6 | F2 | Claude | `LAUNCHED = true`: o merge lança o site |
| 7 | F5a | Claude | `src/engine/image/` autocontido, com o script de exportação |
| 8 | F8 | Claude | Dependabot com grupo de minor e patch, regra de merge testada com eventos de exemplo e aviso de deploy provado por `workflow_dispatch` |
| 9 | Depois da F8 | Você | Monitor HTTPS no UptimeRobot, a cada 5 minutos |
| 10 | 60 dias depois da compra | Você | Transferência para o Cloudflare Registrar e DNSSEC ligado |

## Fontes

- [Cloudflare: preços do Workers](https://developers.cloudflare.com/workers/platform/pricing/) ("requests to static assets are free and unlimited"), [limites](https://developers.cloudflare.com/workers/platform/limits/) (20 mil arquivos por versão no Free, 25 MiB por arquivo, 100 mil invocações por dia) e [domínios próprios](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) (domínio raiz aceito; DNS e certificado criados pelo Cloudflare)
- [Cloudflare: termos de uso](https://www.cloudflare.com/terms/) (sem restrição a uso comercial ou anúncio; no plano grátis, veto a processar ou coletar cartão, seção 2.2.1(h)), conferidos em 28/out/2026
- [Cloudflare: Workers Builds, limites](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) (3.000 min/mês, um build por vez, 20 min por build) e [configuração](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) (`WORKERS_CI_COMMIT_SHA`, `WORKERS_CI_BRANCH`; deploy padrão `npx wrangler deploy`), conferidos em 28/out/2026
- [Cloudflare: cabeçalhos em assets estáticos](https://developers.cloudflare.com/workers/static-assets/headers/) (até 100 regras; URL absoluta com placeholders, como `https://:version.:subdomain.workers.dev/*`) e [Version URLs](https://developers.cloudflare.com/workers/configuration/previews/) (`<versão>-<worker>.<subdomínio>.workers.dev`), conferidos em 28/out/2026
- [Cloudflare: bloqueio de robôs de IA](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots) (categorias Search, Agent e Training; padrão novo em 15/set/2026), [robots.txt gerenciado e Bot Preference Sync](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt) e [Help Net Security](https://www.helpnetsecurity.com/2026/07/02/cloudflare-ai-crawler-controls/) (robôs mistos como Googlebot, Applebot e Bingbot bloqueados onde o treino é bloqueado), conferidos em 28/out/2026
- [Cloudflare: detecções em JavaScript](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/) (ligadas sem opção no Bot Fight Mode; injetam script em `/cdn-cgi/challenge-platform/`)
- [Cloudflare: Email Routing, registros de DNS](https://developers.cloudflare.com/email-service/configuration/domains/) (MX `route1/2/3.mx.cloudflare.net`, SPF com `include:_spf.mx.cloudflare.net`, DKIM `cf2024-1._domainkey`)
- [GitHub: auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request) (no GitHub Free, só em repositório público) e [Dependabot com GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions) (`fetch-metadata`; permissions de escrita declaradas no workflow)
- [Cloudflare compra a Astro (jan/2026)](https://secure.businesswire.com/news/home/20260116386991/en/Cloudflare-Acquires-Astro-to-Accelerate-the-Future-of-High-Performance-Web-Development)
- Medição própria em 23/out/2026: Preact 11 com 5,6 KB gzip (esbuild minificado)
