# CLAUDE.md · FileOrca

Regras para toda run do Claude Code neste repositório. Valem junto com a ficha da run e o PLANO-FILEORCA.md. As runs só acrescentam a este arquivo (seção nova no fim); nunca apagam nem afrouxam uma regra.

## O projeto em cinco linhas

- fileorca.com: ferramentas de imagem e PDF e calculadoras, em inglês, português e espanhol, tudo no navegador, sem conta, sem upload e sem servidor.
- Astro 7 com saída estática e ilhas Preact 11, hospedado no Cloudflare Workers (plano Free), num Worker `fileorca` só com assets (ADR-001).
- Receita de anúncio (AdSense, depois Journey e Mediavine) e doação (Ko-fi e Pix).
- Dono único: Victor Yuki Matusita. O código sai de runs autônomas com merge automático quando o CI passa.
- Um comando confere tudo: `pnpm verificar`.

## Fonte de verdade

1. A ficha da run (vence o resto).
2. PLANO-FILEORCA.md (as "Decisões fechadas" são contrato: nenhuma run muda).
3. DECISOES.md (§ numerados), docs/adr/, docs/design/ (design system), docs/F0-SAIDA.md e data/keywords.csv.
4. O código existente.

Na dúvida, a opção mais simples e reversível, registrada no DECISOES.md.

## Arquitetura é fixa

Host, framework, estrutura do repositório e pipeline não mudam numa run. Se a run achar que precisa mudar, escreve uma ADR nova com status "Proposta" em docs/adr/, deixa a mudança de fora e registra a pendência no relatório.

## Git (a main não tem proteção no GitHub Free: estas regras são a proteção)

- Trabalhe numa branch `fase-NN` (ou `fase-NNa`, `fase-NNb`, `fase-01c`) ou `ajuste-{assunto}` nas runs curtas. Commits pequenos, mensagem em inglês.
- No fim, abra a PR com `gh pr create`. O merge é do CI: **nunca** rode `gh pr merge`.
- **Nunca**: push na main, force push, `git reset --hard`, `--amend` em commit alheio, `--no-verify`, mexer em `core.hooksPath` ou no `.githooks/`.
- A trava tem três camadas: o hook `.githooks/pre-push`, as regras de negação do `.claude/settings.json` e este arquivo. Não contorne nenhuma.

## Fora de toda run

DNS, configuração da zona, Worker e variáveis do Workers Builds no Cloudflare; deploy direto com wrangler; configurações do repositório no GitHub; criar contas; enviar e-mail, post ou pedido a qualquer serviço; publicar repositório; código de Worker (o Worker é só assets); formulário que colete cartão de crédito; dependência com licença fora da lista (MIT, Apache-2.0, BSD, ISC, 0BSD, MPL-2.0, OFL-1.1 para fontes e LGPL-3.0 só em arquivo separado; nunca AGPL nem licença não comercial).

## Testes

- `pnpm verificar` roda tudo (tipos, lint, Vitest, Playwright em Chromium e WebKit, axe, Lighthouse CI, licenças, hreflang, links, órfãs, orçamentos de JS e de requisições, distância dos anúncios, cabeçalhos, Worker sem código, conteúdo de dinheiro e saúde, lint:texto).
- Rode até passar, corrigindo a causa. Desligar, pular ou afrouxar teste é proibido.
- Calculadora: os valores esperados vêm de oráculo independente (numpy-financial e exemplos oficiais), gravados em fixtures/calc/ num commit antes do motor. Nunca gere o esperado rodando o próprio motor.

## Regras que nenhuma run quebra

- Nenhum arquivo do usuário sai do aparelho. Nenhum número digitado vai para `?` na URL nem para evento do GA4.
- Anúncio: nada a menos de 150 px (`ad-clearance`) do Baixar, dos campos, do painel ou da Oli; nada acima da ferramenta no celular, dentro do painel, no processamento, no cronograma ou nas páginas jurídicas. Só âncora e vinheta como formatos automáticos.
- Design: docs/design/ manda. Nenhuma cor fora dos tokens; amarelo (`sun`) só no Baixar; a Oli tem nove poses fechadas e é `aria-hidden`.
- Nenhuma página recebe COOP/COEP; nenhuma ferramenta usa SharedArrayBuffer.

## Como a run termina

- Válvula de estouro: o que a ficha permite cortar vira pendência no relatório e vai para uma run "b". O que a ficha diz que nunca se corta, não se corta.
- Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca. Bloqueio real (ID faltando, serviço fora do ar) não para a run: siga com placeholder e registre a pendência.
- Grave o próprio prompt em docs/prompts/ (`prompt-fase-NN.md` ou `prompt-ajuste-{assunto}.md`) na PR da run.
- Relatório em docs/relatorios/fase-NN.md (ou ajuste-{assunto}.md), em português: saída real do `pnpm verificar`, link da prévia, decisões novas e a lista do que sobrou para o Victor fazer.
- Subagentes Sonnet para exploração e revisão; a revisão adversarial final roda em contexto limpo, contra a ficha.

## Idioma

Narrativa, relatórios e docs em português. Código, nomes de arquivo e commits em inglês. Textos do site nos arquivos de tradução de cada idioma.

## F1a: comandos e pegadinhas

Scripts do `package.json` (todos rodam igual no Windows e no Ubuntu, em TypeScript com o Node puro, sem bash):

| Comando | O que faz |
| --- | --- |
| `pnpm verificar` | Tudo, em ordem, com o tempo de cada portão; para na primeira falha e reprova acima de 15 min |
| `pnpm tipos` / `pnpm lint` / `pnpm test` | `astro check`, ESLint, Vitest |
| `pnpm build` | Build estático em `dist/` (grava `_headers`, `_redirects` e `build.txt`) |
| `pnpm e2e` | Playwright em Chromium e WebKit sobre o `dist/` (precisa de build antes) |
| `pnpm lhci` | Lighthouse CI no celular sobre o `dist/`, com o Chromium do Playwright |
| `pnpm lint:texto` | LanguageTool local nos textos alterados contra `origin/main` |
| `pnpm gate:cabecalhos`, `gate:worker`, `gate:seo`, `gate:links`, `gate:licencas`, `gate:dinheiro-saude`, `gate:actionlint` | Um portão pós-build de cada vez |
| `pnpm serve` | Serve o `dist/` como o Cloudflare (barra no fim, 404 mais próximo, `_headers`) |

Rodar um teste só: `pnpm exec vitest run tests/unit/ads.test.ts`, `pnpm exec playwright test tests/e2e/ads.spec.ts --project=webkit`. Primeira vez numa máquina: `pnpm exec playwright install chromium webkit` (no Ubuntu, com `--with-deps`).

Pegadinhas que a F1a achou:

- O projeto usa Node 24 LTS e pnpm 10 porque o Workers Builds instala o pnpm pelo Corepack, e o Node 26 e o pnpm 12 quebram ali (DECISOES § 17). Scripts de instalação de dependência só rodam se estiverem em `onlyBuiltDependencies` no `pnpm-workspace.yaml`; aprove ali, nunca com flag. Pacote publicado no mesmo dia: fixe a versão anterior em vez de abrir exceção.
- Rodar `pnpm install` fora de um terminal interativo pede `CI=true` quando o pnpm precisa recriar o `node_modules`.
- Astro 7: `build.format` é `preserve` (DECISOES § 16), então toda página é `.../index.astro`. Use Vite 8 com Rolldown: opções em `vite.build.rolldownOptions`, não `rollupOptions`.
- Preact 11: os tipos de evento (`TargetedMouseEvent`) vêm de `preact`, não de `JSX.*`.
- A ilha da ferramenta é hidratada por um `mount.ts` (DECISOES § 23). Um `<script>` do Astro com `import()` vira arquivo externo e puxa o `preload-helper`: para módulo carregado no primeiro uso, use `?worker&url` com um entry que publica a API no `window` (a busca faz assim).
- O WebKit do Playwright no Windows não tem `OffscreenCanvas` no worker; o motor cai para a página (DECISOES § 22). No CI (Linux) o comportamento pode diferir: os testes cobrem os dois caminhos sem depender disso.
- O tsconfig usa `exactOptionalPropertyTypes`: não passe `undefined` para opção opcional, espalhe um objeto condicional.
- No Git Bash do Claude Code, heredoc pode engolir `\\` e falhar com aspas; escreva arquivos com a ferramenta de edição.
- `git push` e `gh pr create --base main` na mesma linha casam com a regra de negação de push na main do `.claude/settings.json`: rode em comandos separados.
- A API pública do LanguageTool proíbe requisição automatizada; o `lint:texto` sobe o servidor local (DECISOES § 24). No Windows sem Java, ele baixa o JRE fixado para `.cache/`.
- O Workers Builds desta conta usa o modelo "Worker Previews" (`wrangler preview`), que pede um bloco `previews` no `wrangler.jsonc`; enquanto a ADR-002 não for decidida, a prévia depende do comando configurado no painel.

## Ajuste da prévia: o que a F1a entendeu errado sobre o Workers Builds

- A falha dos builds do Workers Builds na F1a era o comando de build salvo no painel (`pnpm buid`): os cinco logs lidos param na etapa de build, e os dois lidos até o fim mostram `Command "buid" not found`. O Node 26 e o pnpm 12 instalam sem erro ali (DECISOES § 37): a pegadinha da F1a sobre eles vale só como registro, e o projeto segue em Node 24 e pnpm 10 até o Victor decidir voltar.
- A pegadinha do bloco `previews` é real: o `npx wrangler preview` das branches recusa rodar sem `"previews": {}` no `wrangler.jsonc` (prévia da PR #3). A ADR-002 foi aceita na opção 2 e o bloco vazio faz parte do contrato (DECISOES § 38); nada entra dentro dele sem uma ADR nova. Trocar o comando de prévia no painel não teve efeito em três builds (ADR-002). Isto substitui a última pegadinha da F1a, acima.
- Build do Workers Builds vermelho: o check do GitHub não traz o log. Antes de mudar código ou configuração, peça o log ao Victor (ou leia no Chrome dele, só leitura, quando ele pedir) e procure a linha `Executing user build command`. Não deduza a causa pelo tempo até a falha.
- A configuração mostrada na página de um build nem sempre é a que rodou (no ajuste, o build `d925f68d` mostrava `pnpm build` depois da correção, e o log dele traz `Executing user build command: pnpm buid`). Confie nas linhas `Executing user build command` e `Executing user deploy command` do log.

## F1b: design system e Oli

- O CSS do site é `src/styles/global.css` (entrada), `theme.css`, `fonts.css` e `components.css`, que viram um CSS só por página. O `bundle.css` de `docs/design/` é referência, nunca import. `color:` só com tokens de texto, movimento só por `transform`/`opacity`/`translate`/`scale`/`rotate`, e sem transição de cor (o `gate:design` e o `design-checks.test.ts` reprovam).
- `src/styles/theme.css` e `docs/oli/folha.html` são gerados: depois de mudar `docs/design/tokens.json` ou um SVG da Oli, rode `pnpm design:gerar` e commite os dois (os testes reprovam o arquivo desatualizado). O tema é `@theme reference inline` com `source(none)`: nenhuma classe sai do texto, e o amarelo não entra no tema.
- O sprite da Oli é montado no build por `src/oli/sprite.ts`. Uma página que mostra a Oli passa as poses em `<BaseLayout oli={[…]}>` (a `peek` entra sempre) e usa `Oli.astro` (`[data-oli]` com `<svg><use href="#oli-pose"/></svg>`, sem viewBox no host). Na ilha, as poses que o cliente troca vão em `PANEL_POSES` e a página as passa ao layout. Pose fora da lista fechada não entra sem decisão.
- Ícone: `Icon.astro` nas páginas (lê todos de `docs/design/assets/Icons`); na ilha, importe o SVG com `?raw` e use `src/icons/Icon.tsx`, para só os ícones usados irem ao JS. Ícone novo entra em `docs/design/assets/Icons/` com decisão, e o nome em `ICON_NAMES`.
- `pnpm screenshots` gera os PNG dos componentes nos dois temas em `docs/relatorios/fase-01b/` sobre o `dist/` (rode `pnpm build` antes). Não entra no `verificar`.

Pegadinhas que a F1b achou:

- Preact sem `compat` não converte `strokeWidth`: em SVG escreva `stroke-width`. Use `href` no `<use>`; `xlinkHref` sai diferente no servidor e no cliente.
- O `node-html-parser` devolve `tagName` em maiúsculas e o seletor `clipPath` não casa: compare `tagName.toLowerCase()`.
- `document.getAnimations()` ainda vê animação finita com o truque de 1 ms do `bundle.css`; o movimento reduzido do site usa `animation: none` e `transition: none`.
- O Lightning CSS reescreve `U+0000-00FF` como `U+??` e põe hex em minúsculas: teste sobre o CSS do build compara nomes e `var()`, não o texto do `tokens.css`.
- `resvg` copia `render().pixels` a cada acesso; guarde numa variável antes do laço.
- No Git Bash, `cat >> arquivo <<'EOF'` com texto longo em português falhou com "unexpected EOF": escreva com a ferramenta de edição.
- O runner do CI é umas 5 vezes mais lento que a máquina local, e a Oli em loop deixou o axe quase 2 vezes mais lento lá: o `verificar` chegou a 758 s de 900. O `a11y.spec.ts` roda com movimento reduzido (§ 57). Antes de acrescentar testes pesados (vários envios, páginas com animação), confira o tempo do Playwright no log do CI (`gh run view <id> --log`).
- `ch` segue a fonte em uso: largura em `ch` muda na troca da fonte (CLS). Use `--fo-measure` (rem).

## F2: ferramentas de imagem

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm fixtures` | Regera as fixtures `gen-*` de `fixtures/images/` a partir da F0 (`--check` compara sem gravar, `--no-webkit` pula a checagem no WebKit). Fora do `verificar`: o CI lê os arquivos commitados, e os SHA-256 do `fixtures/ORIGEM.md` são a verdade |
| `pnpm gate:conteudo` | Conteúdo mínimo das páginas de ferramenta e de preset, e título, descrição e texto proibido no site inteiro (DECISOES § 68) |
| `node scripts/fixtures/matrix-table.ts > docs/relatorios/fase-02-matriz.md` | A tabela ferramenta × fixture × navegador, a partir de `test-results/matriz/*.json`: rode antes `image-matrix.spec.ts` e `image-presets.spec.ts` nos dois navegadores, numa execução só do Playwright |

Como acrescentar uma ferramenta de imagem:

1. O id em `IMAGE_TOOL_IDS` (ou `IMAGE_PRESET_IDS`) e a entrada em `IMAGE_PAGES`, em `src/tools/image/registry.ts`: o que aceita (formato real, dos bytes), o ícone, os chips (`next`), as relacionadas (até 6), o `beforeAfter` e o `pdf`. A rota entra na lista de `imageToolRoutes()` em `src/i18n/routes.ts` e o id em `RouteId`; a função gera a rota só com `en` e `adArea: 'arquivos'`.
2. `src/tools/<slug>/Panel.tsx`, que exporta `TOOL: ImageTool<S, O>` (`operation`, `Options` e, se precisar, `warm`, `success`, `pdfSize`, `selectable`); `mount.ts`, que só chama `mountIsland(Panel)`; `<Slug>Page.astro`, sobre o `ImageToolPage.astro`; e `src/pages/<slug>/index.astro`. Opção com escolha usa o `OptionGroup`; número, o `NumberField`.
3. Textos em `src/tools/<slug>/i18n/en.ts` (`ImageToolTexts<Opções>`, com os blocos que o `gate:conteudo` pede) e o cartão em `src/i18n/en/common.ts` (`tools`). O hub, a home, o rodapé e a busca leem o registro.
4. Testes: a ferramenta na matriz (`tests/e2e/lib/matrix.ts`), no `TOOL_PAGES` do `budgets.spec.ts` e do `ads.spec.ts` (se ela não aceita JPG, um arquivo pequeno que ela aceite em `SMALL_OF`) e um teste de opções no `image-smoke.spec.ts`. O `a11y.spec.ts`, o `gate:seo` e o `gate:conteudo` já pegam a página nova pelo mapa de rotas e pelo registro.

Pegadinhas que a F2 achou:

- Página de ferramenta carrega exatamente 2 arquivos JS (o `mount` e o grupo `island` do `astro.config.ts`). Um import de `src/engine/` na ilha cria um terceiro arquivo e estoura o orçamento de requisições: a ilha fala com o motor só pelo `engine-client.ts` (Comlink) e repete a conta que precisar (o `box.ts` do Crop tem a própria caixa centrada).
- O worker do motor é `src/engine/image/worker.ts` e vira `/_astro/worker-*.js`: não mude o nome. O `dist/` leva cada codec duas vezes (`-` para o worker e `.` para a página, que é o caminho do WebKit sem `OffscreenCanvas`): é esperado.
- Só a build de uma thread de cada codec (`@jsquash/*` por import fundo, com `?url` no `.wasm`); nada de `_mt`, `pkg-parallel`, hqx, magic-kernel nem `wasm-feature-detect`. O `image-privacy.spec.ts` reprova.
- O JS de cola do libheif é um chunk só dele (grupo `libheif`), e o `gate:licencas` exige isso e o `.wasm` idêntico ao do pacote. Pacote novo no bundle precisa estar na /licenses: o gate lê os módulos de cada chunk em `.cache/bundle-modules.json`.
- `createImageBitmap` com `imageOrientation: 'none'` ainda aplica a Orientation do Exif nos dois navegadores. A referência em pé dos testes sai de `withOrientation(bytes, 1)` (`tests/e2e/lib/jpeg.ts`).
- O codificador de canvas do Chromium põe um perfil ICC sRGB no JPG e no PNG: "sem metadados" é sem Exif, XMP, IPTC e GPS (`metadataReport`), não "sem APPn".
- O WebKit 27.2 do Windows não decodifica AVIF e não tem `OffscreenCanvas` no worker; nenhum dos dois navegadores decodifica HEIC. No Linux do CI o WebKit pode diferir: os testes detectam e registram.
- Colar no teste: `new ClipboardEvent('paste', { clipboardData: dt })` com um `DataTransfer` montado na página funciona nos dois navegadores; `page.dispatchEvent('paste')` não.
- O `warm()` liga o worker quando o ponteiro para sobre o painel: teste que segura o motor (`slowEngine`) tem que segurar antes do `goto`.
- O `serve-dist` devolve o 404 mais próximo para rota que falta: teste de página exige status 200, ou passa sem a página existir.
- O `playwright.config.ts` usa a porta 4173 com `reuseExistingServer`: dois worktrees rodando o Playwright ao mesmo tempo usam o servidor um do outro. Em outro worktree, rode com `FO_PORT=4174` (ou outra porta livre).
- Em `tests/unit/pos-deploy.test.ts`, a regra de antes do lançamento é testada no commit `503b8c3` (o último com `LAUNCHED = false`), porque o pós-deploy lê o `LAUNCHED` do commit que confere.

## Ajuste: CI em partes (ADR-003)

- O CI roda o `pnpm verificar` em partes, cada uma num job com o limite de 900 s: `verificar` (`pnpm verificar --sem-playwright`, todos os portões menos o Playwright) e `playwright (chromium)`, `playwright (webkit 1 de 2)` e `playwright (webkit 2 de 2)` (`pnpm verificar --playwright=webkit --shard=1/2`). O `merge` espera todos. Na sua máquina, `pnpm verificar` sem argumento continua rodando tudo.
- Para reproduzir uma parte que falhou só no CI, rode o mesmo comando do job, que está no nome do passo. Cada parte do Playwright sobe o relatório como artefato `playwright-report-<n>`.
- Teste novo pesado vai para a parte em que cair pelo `--shard` do Playwright; confira o tempo de cada job no log (`gh run view <id> --log`). Se uma parte passar de uns 700 s, divida mais (outro `--shard`) num ajuste, nunca aumente o limite.
- `tests/unit/verificar.test.ts` prova que as partes juntas são os mesmos passos do todo: um portão novo entra em `STEPS` e cai sozinho na parte certa.

## F3: revisão e prontidão

O `gate:prontidao` (`scripts/gates/prontidao.ts`, com a lógica em `scripts/lib/prontidao.ts`) entra no `verificar` na parte `--sem-playwright`. Ele confere se o site está pronto para o pedido do AdSense (DECISOES § 95).

- **O que confere.** Faz dois builds extras do mesmo código em `.cache/prontidao/`: `client`, só com o ID de teste `ca-pub-0000000000000000`, e `all`, com as três variáveis. Confere também o `dist/` real. São 18 itens:
  - a meta tag e o `ads.txt` exatos;
  - o carregador só nas ferramentas;
  - nada de anúncio sem o ID;
  - as seis páginas obrigatórias nos três idiomas e no rodapé;
  - o Contato e a Privacidade com o que o AdSense pede;
  - nenhum texto de obra nem ID de mentira;
  - cartões e busca só do registro;
  - H1, título e descrição próprios;
  - 60 palavras no `<main>` e 150 palavras por AdSlot;
  - `robots.txt`, `noindex` e sitemaps.
- **O `dist/` fica intacto.** O registro do bundle (`.cache/bundle-modules.json`) é devolvido depois de cada build.
- **Como acrescentar um item.** Escreva uma função `check…(site: Site): Row[]` no `scripts/lib/prontidao.ts` e chame-a no portão. No `tests/unit/prontidao.test.ts`, ponha um controle positivo (o site de mentira do `makeSite()` passa) e um negativo para cada quebra. A linha do `ads.txt` fica escrita à mão no portão, a partir da ajuda do AdSense, e nunca sai do `adsTxt()` do site.
- **Reuso.** O `robots.txt` é conferido por `robotsProblems()` (`scripts/lib/seo-checks.ts`), o `_headers` é lido por `headerBlocks()` e `patternApplies()` (`scripts/lib/headers-file.ts`), e o texto visível vem de `visibleText()` (`scripts/lib/conteudo.ts`).

Método da revisão adversarial (DECISOES § 92 a § 94):

- Seis lentes Sonnet em contexto limpo: corretude, privacidade, anúncio, acessibilidade, desempenho e SEO, e design system.
- Elas rodam sobre um commit fixo, numa worktree só de leitura (`git worktree add --detach .claude/worktrees/revisao-f3 <commit>`, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`).
- Cada lente tem o próprio `FO_PORT` (4174…4179) e a própria `--output`, e escreve só em `.cache/lente-<x>/` da worktree.
- Cada achado crítico, alto ou médio tem um cético próprio que tenta refutar. Os baixos de cada lente vão a um cético só.
- As correções ficam num agente só. Depois, uma segunda passada revisa o diff.
- Remova a worktree no fim com `git worktree remove`.

Pegadinhas que a F3 achou:

- O `html` não tem fundo, então o fundo `--bg` do `body` pinta a tela inteira. Padding ou margem no `body` aparece como faixa clara depois do rodapé. Espaço reservado no fim da página vai no `.fo-footer` (`--fo-bottom-room`, do aviso e da âncora), nunca no `body` (§ 91 e § 101).
- Os screenshots de página do `pnpm screenshots` abrem com o consentimento já gravado, então o aviso de cookies não aparecia neles. A F3 acrescentou o fim da página com o aviso aberto, e a pasta passou a `docs/relatorios/fase-03/componentes/`. O script apaga a pasta dele antes de gravar: não ponha outros arquivos lá.
- Navegador na produção só com `context.route` abortando os domínios do Google (`google`, `googletagmanager`, `google-analytics`, `doubleclick`, `gstatic`, `googlesyndication`), para a visita não entrar no GA4. A prévia em `*.workers.dev` nem pede o `gtag.js`.
- Com várias lentes rodando o Playwright ao mesmo tempo, o WebKit do Windows chegou a travar no `page.goto` até em teste antigo e simples. Antes de achar que um teste do WebKit está errado, rode-o de novo com a máquina livre.
- Toda carga sob demanda do motor (um `import()` de codec, a cola do jSquash, o `.wasm`) passa pelo `loading()` de `src/engine/image/errors.ts`. Uma falha de carga vira `EngineError('load')`, com a fala "recarregue a página", e nunca "arquivo danificado". O `load` fica fora do `HOPELESS`, então a próxima execução tenta de novo (§ 102 e § 104). Um `import()` novo no motor sem o `loading()` volta a chamar um arquivo bom de "danificado".
- Um worker sem `OffscreenCanvas` não faz trabalho de imagem: o motor roda na página, e o `warm()` não aquece o worker (§ 102). Para testar esse caminho nos dois navegadores, sirva o script do worker de imagem (o que não tem `PDFDocument`) com `delete globalThis.OffscreenCanvas;` na frente, por `page.route` (`tests/e2e/engine-paths.spec.ts`).
- O `context.on('request')` do Playwright vê as requisições feitas de dentro dos workers, no Chromium e no WebKit (a lente de corretude provou). Uma prova de "nada sai" deve recusar método diferente de GET, corpo, outra origem e query string.
- No Git Bash, `node -e "…"` com crases no texto JS executa as crases como comando do shell e estraga o texto (aconteceu com um § do DECISOES). Texto com crase vai para um arquivo, pela ferramenta de escrita, e o script Node o lê.

## Ajuste: espaço do aviso de cookies

- O aviso de cookies aberto flutua sobre o fim da página e não reserva espaço ali (DECISOES § 106). O espaço embaixo do rodapé (`--fo-bottom-room`) só abre quando um foco do teclado no fim da página ficaria embaixo do aviso, e quando a âncora do AdSense está na tela. Não volte a reservar a altura do aviso para todo mundo: no fim da página isso aparece como uma faixa vazia, que o Victor recusou duas vezes, primeiro clara (§ 91) e depois azul (§ 106).
- Teste que clica em algo do fim do rodapé tem de fechar o aviso antes (`dismissCookies`), porque o card fica por cima do canto de baixo à esquerda.

## Ajuste: WebKit em três partes

- O CI passa a ter cinco partes, cada uma num job com o limite de 900 s: `verificar` (`pnpm verificar --sem-playwright`), `playwright (chromium)` e `playwright (webkit 1 de 3)`, `playwright (webkit 2 de 3)` e `playwright (webkit 3 de 3)` (`pnpm verificar --playwright=webkit --shard=i/3`). Isto substitui a descrição das partes na seção "Ajuste: CI em partes (ADR-003)", que fica como está; o resto daquela seção continua valendo (DECISOES § 108).
- O `--shard` do Playwright, com `fullyParallel: true`, divide por contagem de testes na ordem dos arquivos. Hoje a parte 1 fica com o `a11y`, o `ads` e o `budgets`; a 2, com o `design`, os de cookies e o `coffee`; a 3, com a matriz, o `image-smoke` e o resto. Spec novo no começo da lista empurra para as partes seguintes testes que hoje estão nas primeiras. Antes de somar muitos testes, rode `pnpm exec playwright test --project=webkit --shard=i/3 --list` e veja onde caem.
- O `tests/unit/verificar.test.ts` não lê o `ci.yml`: a lista de partes dele é escrita à mão e segue com `1/2` e `2/2`. A asserção tira o `--shard` antes de comparar, então prova a cobertura para qualquer número de partes.

Pegadinhas que o ajuste achou:

- Depois de um `gh run rerun <id>`, o `gh run view <id> --log` mostra a última tentativa. Para ler uma tentativa anterior, use `gh run view <id> --attempt <n> --log`, e o mesmo `--attempt` com `--json jobs`.
- O tempo do job não é o tempo da parte. O `playwright install --with-deps` chegou a 356 s num rerun, porque o apt do runner estava lento, e esse tempo fica fora do `verificar` e do limite de 900 s. Compare as partes pelo `total` do resumo do `verificar` no log.
- Na primeira execução com três partes, o `/` da parte 2 do WebKit caiu de 10,9 GB livres para 609 MB em 60 s do `design.spec.ts` (da Oli a 1280 × 800 às regressões da revisão), e o diagnóstico de disco não achou onde (DECISOES § 108). No rerun não aconteceu. Se uma parte do WebKit falhar com `ENOSPC`, comece pelas linhas `[disco]` dela.

## Ajuste: diagnóstico de disco

- O `scripts/lib/disco.ts` (só no Linux do CI) faz uma busca funda quando o `/` perde mais de 2 GB: as linhas `[disco] busca funda:` trazem os arquivos apagados e ainda abertos (do `/proc`, com os processos), os arquivos grandes gravados desde o início, as pastas de `/var`, os dumps e os maiores processos (DECISOES § 109). Se uma parte falhar com `ENOSPC`, leia essas linhas antes de mexer em teste.
- Todo `find` do diagnóstico roda com `timeout` e `nice` dentro do próprio comando e diz se foi "completo" ou "interrompido". Um `find` com o timeout do `execSync` em volta morre sem imprimir e deixa o processo órfão: foi assim que o `find` antigo disse "(nenhum)" por 20 s em toda parte, desde a § 90.
- A busca funda só roda no Linux, então o `tests/unit/disco.test.ts` prova a leitura do `/proc` no Vitest do CI. No Windows, o mesmo teste só confere que não há `/proc`. Teste que depende do sistema ramifica por dentro e nunca usa `skip` nem `runIf`.

## F4: calculadoras

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py` | Regera `fixtures/calc/` (`--check` compara sem gravar, `--only <id>` faz uma calculadora). Fora do `verificar`: o CI lê as fixtures commitadas, e o `calc-oracle.test.ts` confere o SHA-256 do script |
| `CALC_FIXTURES_DIR=<cópia> pnpm exec vitest run tests/unit/calc-oracle.test.ts` | A prova do mutante: uma cópia das fixtures com um centavo mudado tem de reprovar |
| `pnpm exec playwright test tests/e2e/money-speed.spec.ts --project=chromium` | A medida dos 16 ms por tecla (p50 e p95 no log, linhas `[16 ms]`) |

Convenção do dinheiro (DECISOES § 111 e § 127):

- Dinheiro em centavos inteiros; taxa em 1/10.000 de ponto percentual (6.5% = 65000, 100% = `ONE` = 1.000.000). Divisão em BigInt, metade para cima; juros de cada período ao centavo; a última parcela zera o saldo.
- O valor esperado vem do oráculo, nunca do motor: mudou a convenção, mude o `scripts/oracle/calc.py`, regere as fixtures e commite antes do motor (o `git log -- fixtures/calc src/calc` mostra a ordem).
- `src/calc/` não importa nada de fora da pasta (regra do ESLint, testada em `quality.test.ts`).

Como acrescentar uma calculadora:

1. O caso no oráculo (`scripts/oracle/calc.py`: a função, a grade, os aleatórios com semente `2026-10-31/<id>`, o `page-example` e, se houver, o exemplo oficial em `OFFICIAL_CHECKS` e no `fixtures/calc/OFICIAIS.md`). Regere e commite as fixtures.
2. O motor em `src/calc/` e o id em `ENGINES` (`src/calc/index.ts`).
3. O id no `src/tools/calc/registry.ts` (`CALC_PAGES`: caminho, mãe, ícone, grupo, chips, relacionadas, guia e nome do arquivo) e em `CALC_EVENT_TOOLS` (`src/analytics/tool-ids.ts`); a rota sai sozinha de `moneyRoutes()`.
4. A definição em `src/tools/calc/defs/` (campos com faixa fixa, `initial` igual ao `page-example`, `toInput`, `view`) e a entrada em `DEFS`.
5. Os textos em `src/tools/<slug>/i18n/en.ts` (`CalcPageTexts`: o erro diz a faixa, os blocos que o `gate:conteudo` e o `gate:dinheiro-saude` pedem) e o cartão em `src/i18n/en/common.ts` (`calcs`); a página em `src/pages/<slug>/index.astro` com `<CalcTool id lang="en" />`.
6. Testes: o `calc-defs.test.ts`, o `budgets.spec.ts`, o `ads.spec.ts`, o `money-privacy.spec.ts` e o `a11y.spec.ts` já pegam a página pelo registro. Confira o resultado acima da dobra a 360 × 740 (o `ads.spec.ts` reprova).

Pegadinhas que a F4 achou:

- No celular, o número do ResultHero tem de ficar acima de 740 px (§ 124). Campos principais: no máximo duas linhas de dois campos de meia largura, sem ajuda fixa, com rótulo que cabe numa linha ao lado da etiqueta "example" (até uns 75 px a 15 px de fonte). O que não cabe desce para depois do resultado. As páginas de preset têm a trilha de navegação em três linhas e ficam a 13 px da dobra.
- A ilha tem duas raízes com uma store (`#fo-tool-root` e `#fo-calc-schedule`). Mudança feita na store logo depois do `hydrate()` (o link do cenário) precisa do `useCalc` que repinta se a store mudou antes da assinatura (§ 128).
- Mesmo `#` na mesma página não recarrega: no teste, vá a `about:blank` antes de abrir outro link do cenário.
- Tabela com células sem quebra numa página estreita: moldura com `width: 0; min-width: 100%` (`.fo-table-wrap`, `.fo-amort-wrap`), senão a página inteira rola para o lado a 320 px (§ 129).
- O `lint:texto` preenche os `{placeholders}` dos textos de dinheiro com valores reais (`MONEY_SAMPLES` e os números do guia, § 123). Um placeholder novo sem amostra vira "$1,234": confira se a frase ainda faz sentido.
- O PDF usa as fontes padrão (só WinAnsi): o `winAnsi()` troca o sinal de menos, as aspas curvas e o resto. Texto novo do PDF com caractere fora do WinAnsi some.
- O uv desta máquina foi instalado pelo `winget` e não está no PATH do PowerShell nem do Git Bash: chame pelo caminho completo (`…\WinGet\Packages\astral-sh.uv_…\uv.exe`). Não há `python` no PATH; o `uv run … python -I script.py` serve para script de apoio também.
- No Git Bash, heredoc com apóstrofo (`cat <<'EOF'` com "mortgage pages'") quebra o comando: escreva o arquivo com a ferramenta de escrita. Script Python que grava texto no Windows troca LF por CRLF; o Git normaliza no commit.
- Medida de tempo no WebKit anda de 1 em 1 ms: o teste dos 16 ms só afirma o limite no Chromium e imprime o WebKit.
- A grade dos campos usa subgrid (§ 137): cada item ocupa duas linhas, e o `CalcField` tem dois filhos, o rótulo e o `.fo-field__body`. Um `fieldset` (grupo de opções) fica fora do subgrid, porque no WebKit ele deixava 12 px vazios. Componente novo na grade: confira a altura dele e a do vizinho nos dois navegadores.
- Enquanto o resultado é um problema, ou fica velho por um campo a corrigir, o PDF e o CSV ficam desligados (§ 139). Um teste que precisa baixar arquivo tem de deixar a conta com resultado (o `money-privacy.spec.ts` desce a sentinela até isso acontecer).
- O `budgets.spec.ts` não usa o `networkidle`, que no WebKit do Linux nunca disparava nos hubs (§ 138). Teste novo que precise da página quieta: espere o `load` e um intervalo sem requisição, como o `settler` dele.
- O `ENOSPC` do WebKit do CI segue o `design.spec.ts` em qualquer parte (§ 108, § 109 e § 141). Se uma parte cair assim, leia as linhas `[disco]` e rode de novo só ela; não mexa em teste.
- No Git Bash, um `node -e "…"` com acento grave dentro de aspas duplas executa o trecho como comando (o texto some sem erro). Script com Markdown ou template literal vai para um arquivo, pela ferramenta de escrita.
- Para provar que um teste falha sem a correção, nunca use `git checkout <commit> -- arquivo` com mudança não commitada no mesmo arquivo: o `checkout HEAD` de volta apaga a mudança. Rode o teste contra o `dist/` antigo (antes do build) ou injete a regra antiga no teste.
- Os specs de dinheiro se chamam `money-*.spec.ts` para caírem depois do `design.spec.ts` na divisão do WebKit (§ 142). Com o nome `calc-*`, eles empurravam o `design.spec.ts` para a parte 3, junto com a matriz de imagens, e a parte caía por `ENOSPC`. Spec novo pesado: rode o `--list` das três partes antes do push e veja se o `design.spec.ts` continua na parte 2.

## F5a: ferramentas de PDF

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm fixtures` | Regera também as 13 fixtures `gen-*` de `fixtures/pdf/` e o oráculo `fixtures/pdf/expected.json` (`scripts/fixtures/pdf.ts`; `--no-pdf` pula). Deterministas: o qpdf com `--static-id --static-aes-iv` e o `crypto.getRandomValues` trocado por um contador durante a cifra |
| `node scripts/fixtures/pdf-matrix-table.ts` | Monta `docs/relatorios/fase-05a-matriz.md` a partir de `test-results/matriz-pdf/*.json`: rode antes o `pdf-matrix.spec.ts` nos dois navegadores, numa execução só do Playwright |
| `pnpm motor:exportar` | Grava o pacote `fileorca-image-engine` em `.cache/oss/fileorca-image-engine/` (`--conferir` copia para uma pasta temporária fora do repositório e roda `npm install`, `tsc --noEmit` e `vitest run`; usa a rede e fica fora do `verificar`) |

Como acrescentar uma ferramenta de PDF:

1. O id em `PDF_TOOL_IDS` e a entrada em `PDF_PAGES` (`src/tools/pdf/registry.ts`): ícone, `files` (`batch`, `merge` ou `single`), `run` (`auto` ou `action`), sufixo do nome, chips (`next`) e até 6 relacionadas. A rota sai de `pdfRoutes()` (`src/i18n/routes.ts`), só em inglês; o id entra em `RouteId` e em `PDF_EVENT_TOOLS` (`src/analytics/tool-ids.ts`).
2. A operação no motor: o tipo em `PdfOperation` (`src/engine/pdf/types.ts`) e o caso em `processPdf` (`src/engine/pdf/process.ts`), com o Vitest no Node sobre as fixtures antes da ilha. Falha volta como `{ ok: false, reason }` da lista fechada `PDF_REASONS`; razão nova entra também em `ERROR_REASONS` (`src/analytics/events.ts`).
3. A definição na ilha: uma entrada em `PDF_TOOLS` (`src/tools/pdf/tools.tsx`), com `operation`, `success`, `warm` e, se houver, `Options`, `grid` e `actionLabel`. Nada de entrada nova: as 12 cabem no `PdfIsland.astro`, e a página carrega 2 arquivos JS.
4. Os textos em `src/tools/<slug>/i18n/en.ts` (`PdfToolTexts`, com os blocos do `gate:conteudo`), a entrada em `PDF_TOOL_TEXTS` (`src/tools/pdf/texts.ts`) e o cartão em `src/i18n/en/common.ts` (`pdf`). A página é `src/pages/<slug>/index.astro` com `<PdfToolPage id="<slug>" />`.
5. Testes: a ferramenta na matriz (`tests/e2e/pdf-matrix.spec.ts`), com cada fixture que ela aceita, as recusas no meio do lote e a conta conferida no Node contra o `expected.json`. O `budgets`, o `ads`, o `a11y`, o `pdf-privacy`, o `gate:seo`, o `gate:conteudo` e o `gate:prontidao` leem o registro.

Regras do PDF.js e do qpdf:

- O motor é `src/engine/pdf/`, autossuficiente. O PDF.js, o qpdf, o MozJPEG e o resize só carregam sob demanda, e cada `import()` passa pelo `loading()` de `errors.ts` (falha de carga é `load`, nunca "arquivo danificado"). Nada carrega antes do primeiro arquivo; o aquecimento só busca o que o primeiro arquivo buscaria.
- PDF.js (§ 144): o build legacy, com `useWorkerFetch: false`, `useSystemFonts: false`, `enableXfa: false`, `AnnotationMode.DISABLE` e sem camada de texto nem scripting. A versão 6 não tem `isEvalSupported`; o teste de endurecimento prova no JS publicado que não há `eval` nem `new Function` no caminho de fontes e funções. Os dados vêm de `/_astro/pdfjs/<versão>/`, copiados sem mudança pelo `src/platform/pdfjs-data.ts`: os CMaps, as fontes da Foxit e dois `.wasm`. Liberation (GPL), `.icc`, qcms e quickjs não entram.
- No worker, o PDF.js roda com o "worker falso" (`globalThis.pdfjsWorker`) e `OffscreenCanvas`. Sem `OffscreenCanvas` no worker (WebKit do Windows), o desenho vai para a página com a porta do `pdfjs-core.ts`. Teste os dois caminhos.
- qpdf: `runQpdf(args, input)` com `IN` e `OUT` no lugar dos arquivos. A saída (`print` e `printErr`) fica capturada e nunca vai ao `console`, porque pode levar a senha. O MEMFS é limpo depois de cada execução, e a instância é refeita acima de 512 MB ou depois de um `abort`. No Node, o qpdf mexe no `process.exitCode`: o `scripts/lib/qpdf.ts` devolve o valor de antes.
- Cifra: `--show-encryption` diz se o arquivo pede senha ("invalid password") ou não está cifrado ("File is not encrypted"). A Protect é `--encrypt --user-password=P --owner-password=P --bits=256 --`; a Unlock é `--decrypt`, com `--password=P` quando pede. Nunca força bruta.
- pdf-lib: abra com `updateMetadata: false`, `ignoreEncryption: true`, `parseSpeed: Fastest` e `throwOnInvalidObject: false`. Documento novo copia páginas pelo `assemble.ts` (§ 145), nunca pelo `copyPages` direto, que puxa páginas de fora por links e campos.
- Geometria: tudo o que se desenha na página passa por `toUser(box, rotate, vx, vy)` (`src/engine/pdf/geometry.ts`), sobre a CropBox e o /Rotate. O texto fica em pé na tela em toda rotação.

Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)" e "Ajuste: WebKit em três partes", que ficam como estão.

- **As partes:** são onze, cada uma num job com o limite de 900 s e o alvo de 700 s.
  - o `verificar` (`--sem-playwright`);
  - o `playwright (chromium 1 de 3)` ao `3 de 3` (`--playwright=chromium --shard=i/3`);
  - o `playwright (webkit 1 de 7)` ao `7 de 7` (`--playwright=webkit --shard=i/7`).
- **O que cada parte do Playwright faz:** desliga os core dumps e termina com o passo "Disk and core dumps" (`if: always()`). O `disco.ts` amostra o `/` a cada 2 s (§ 154).
- **Antes de somar specs:** rode o `--list` de cada parte (Chromium em 3, WebKit em 7) e veja onde caem o `design.spec.ts` e a matriz de imagens.
  - Hoje o `design.spec.ts` fica inteiro na parte 4 do WebKit, e a matriz de imagens na parte 5.
  - Com 6 partes, os dois cairiam juntos (§ 142).
- **O `tests/unit/verificar.test.ts`** traz as partes da F5a escritas à mão. Mudou o `ci.yml`, mude o teste.

Pegadinhas que a F5a achou:

- O `pnpm tipos` (`astro check`) confere também os specs: um `getByRole('button', { name: texts.panel.action })` com texto opcional reprova no CI. Rode o `pnpm tipos` antes do push, não só o Vitest e o Playwright.
- Um arquivo que pede senha ou é restrito tem de contar como sem saída no painel (`HOPELESS` do `PdfPanel.tsx`). Senão ele entra no pedido da Merge, e a Merge inteira falha com "pede senha" em toda linha.
- O campo de arquivo das ferramentas de um arquivo por vez é `multiple` mesmo assim: o segundo arquivo vira a recusa na linha, e o `setInputFiles` com dois arquivos funciona no teste.
- As opções em segmento escondem o rádio: no teste, clique no rótulo `.fo-seg__opt` (o `.check()` do rádio trava).
- A lista de linhas mostra 6 e esconde o resto atrás de "Show N more": um teste que lê a razão de uma linha escondida clica antes em `.fo-queue__more`.
- O `readWithPdfjs` dos testes precisa de `new Uint8Array(bytes)`, não de um `Buffer` do Node.
- O `removePage` com `addPage` do pdf-lib estraga a árvore de páginas (`CorruptPageTreeError`): o Reorder refaz a lista `Kids` da raiz e copia os atributos herdados.
- O PDF.js no Node desenha com o `@napi-rs/canvas`, que vem como dependência opcional do `pdfjs-dist`: não é dependência nova e não entra no bundle.
- A AES-256 R6 do qpdf sorteia o IV e a chave mesmo com `--static-aes-iv`: a fixture só fica determinista com o `crypto.getRandomValues` trocado durante a cifra.
- O `--allow-weak-crypto` do qpdf vem antes do `--encrypt` na linha de comando.
- `setCropBox` e `setMediaBox` do pdf-lib recebem x, y, largura e altura, não dois cantos.
- **O WebKit avalia duas vezes a entrada de um worker de módulo** quando um chunk carregado sob demanda importa dela, e o bundler põe ali os ajudantes compartilhados (§ 168 e § 172). Todo módulo do worker passa a existir duas vezes.
  - O `expose()` roda só na primeira cópia.
  - Estado que o worker recebe por mensagem (as URLs dos `.wasm` do motor de imagem) fica também no `globalThis`, para a segunda cópia o tomar.
  - Classe de erro reconhecida por `instanceof` precisa do `Symbol.hasInstance`.
  - O `tests/unit/worker-once.test.ts` avalia as entradas duas vezes no mesmo escopo. Worker novo entra nele.
- **O WebKit do Windows não processa imagem no worker** (sem `OffscreenCanvas`), então um defeito do caminho do worker só aparece no WebKit do Linux do CI. Foi assim que a run 41330210631 achou as ferramentas de imagem paradas.
  - Mudança no motor de imagem ou no worker pede o CI antes de dar como pronta.
- **A matriz de PDF roda toda ferramenta contra toda fixture que ela aceita** (§ 175).
  - Ferramenta ou fixture nova entra nela, e o `pdf-matrix-table.test.ts` reprova lacuna.
  - Regere a tabela com uma execução só, nos dois navegadores, e o `node scripts/fixtures/pdf-matrix-table.ts > docs/relatorios/fase-05a-matriz.md`.
- **Arquivo reparado** (índice refeito pelo pdf-lib) nunca volta estragado: sem ganho, a Compress devolve a reescrita reparada, não os bytes de entrada (§ 182).
- **Estado próprio de um componente de opções** (a área de assinatura) precisa recomeçar quando o "Start over" limpa o estado da ferramenta.
  - Uma `key` pelo arquivo não serve, porque o arquivo só aparece depois de lido.
- **O `pnpm screenshots` reusa o passeio de estados de `tests/e2e/lib/pdf-states.ts`.** O `expect` do Playwright funciona fora do runner.
  - As miniaturas da grade são desenhadas só na tela, então o script espera as imagens das células visíveis.
- **Agentes em worktree (Workflow com `isolation: 'worktree'`) nasceram da `main`**, não da branch da run. Cada um teve de avançar a própria branch (`git merge --ff-only fase-05a`) antes de trabalhar.
  - No briefing de um agente em worktree, peça isso como primeiro passo.
- **Três agentes de workflow eram Sonnet** e assinaram os commits como "Claude Sonnet 5.5": foram 15 de 76 commits da run. O histórico ficou com o nome verdadeiro de cada modelo, e nada foi reescrito (`--amend` é proibido).
  - Para código, passe `model: 'opus'` ao agente.

## F5b: guias de arquivo e kit do Product Hunt

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm guias:medir` | Mede o que os 10 guias de arquivo dizem, sobre o `dist/` (rode `pnpm build` antes) e no Node, e grava `data/guides-measured.json` (`--check` refaz e compara: Node exato, navegador com a tolerância da § 185; `--only <id>` mede um guia). Fora do `verificar` |
| `pnpm lancamento:imagens` | Gera a miniatura (PNG e GIF da Oli) e a galeria do Product Hunt em `docs/lancamento/product-hunt/`, a partir do `dist/` e do `docs/design/`, e reescreve a tabela das imagens do `product-hunt.md`. Fora do `verificar` |

Como acrescentar um guia de arquivo:

1. O id `guides-<slug>` em `FILE_GUIDE_IDS` e a entrada em `FILE_GUIDES` (`src/tools/guides/registry.ts`): a ferramenta embutida, o hub e até 6 relacionadas. A rota sai de `fileGuideRoutes()`.
2. As medidas: um plano em `scripts/guides/lib/plans.ts` (o caminho da pessoa: navegador onde o site escreve pelo canvas, Node onde é WASM ou pdf-lib), a tabela em `BUILDERS` de `src/tools/guides/measured.ts`, e `pnpm guias:medir`. O JSON entra num commit antes do texto.
3. O texto em `src/i18n/en/guide-<slug>.ts` (`FileGuideTexts`): todo número é `{placeholder}` do JSON (com as variantes `_off`, `_more`, `_times`, `_change`, `_exact` e `_word`), fato oficial de `facts` com a fonte, ou nome técnico de `names`. O cartão vai em `enCommon.fileGuides`.
4. A página `src/pages/guides/<slug>/index.astro`: guia de imagem passa `<XxxPage slot="tool" lang="en" embed />` (o componente da ferramenta ganha `embed` e, se precisar, `initial`); guia de PDF é só `<FileGuideView id />`.
5. Testes: os portões, o `budgets`, o `ads`, o `a11y` e o `tool-guides.spec.ts` leem o registro. O caso do guia entra em `CASES` do `tool-guides.spec.ts`.

Quando medir de novo: mudou o motor de imagem ou de PDF, o script de medidas (o teste compara o SHA-256), uma fixture, ou a versão do Playwright (o canvas muda). Depois, `pnpm guias:medir --check` tem de dar zero.

A regra dos números: nenhum algarismo à mão num texto de guia (`tests/unit/guides-numbers.test.ts`). Contagem por extenso também é número à mão: use `{nome_word}` ou tire a contagem.

Como o kit se mantém verdadeiro: o `tests/unit/launch-kit.test.ts` compara as contagens do `product-hunt.md` com os registros, as contagens de caracteres com os limites e cada imagem listada com o arquivo. Uma run que mudar uma contagem (a 2b) tem de atualizar o kit, e as imagens com `pnpm lancamento:imagens`.

Pegadinhas que a F5b achou:

- **A ferramenta embutida usa o `<script>` do componente da própria ferramenta** (§ 184). Um `<script>` que importe o mesmo `mount.ts` em outro componente faz o Rolldown tirar o módulo para um chunk comum, e a página da ferramenta passa a 3 arquivos.
- **No Git Bash, heredoc troca `\\` por `\` mesmo com `<<'EOF'`**: um script `node` que escreve `"\\b"` numa string JS para gravar `\b` grava o caractere de backspace (0x08), invisível no `grep`. Código com barra invertida vai pela ferramenta de escrita. Para achar o estrago: `grep -rln $'\x08' --include=*.ts src scripts tests`.
- **O `.text` do `node-html-parser` cola o texto de elementos vizinhos** ("MoreIn today's"). Para contar palavras ou procurar frases, use `structuredText`.
- **O CSS do site não tem `--color-*`**: o tema é `@theme reference`, e as variáveis no build são `--deep`, `--on-deep`, `--bg`, `--stroke` e `--radius-lg`.
- **`gifenc` é CommonJS no Node**: importe o default (`import gifenc from 'gifenc'`).
- **O `node -e` e o heredoc do Git Bash** seguem as regras da F3 e da F4: texto com crase ou barra invertida vai para um arquivo.
- **Uma consulta da busca que traz um guia muda por construção** (§ 190): dê ao guia termos que não colidam com as consultas dos testes, e uma frase com "jpeg" quando o nome diz "JPG".
- **O `pnpm guias:medir` grava o dia em UTC.** Depois das 21h em Brasília a data da medida já é a do dia seguinte. O `GUIDE_REVIEWED` e o `GUIDE_PUBLISHED` (`src/tools/guides/page.ts`) nunca ficam antes do `measuredOn`, e o teste reprova (§ 207).
- **Porta do Playwright para o `guias:medir`:** use de 4174 a 4189. O `fetch` do Node recusa algumas portas ("bad port"), como a 4190, e aí o script não acha o servidor.
- **As regras de texto que a revisão acrescentou** (`tests/unit/guides-numbers.test.ts`, § 197 a § 203 e § 208):
  - a frase diz a amostra (com placeholder de contagem);
  - um mínimo ou um máximo diz a direção;
  - nada generaliza além da amostra (a lista `GENERAL`: "usually", "often", "most PDFs", "usual", "almost free", "real PDFs"…);
  - a data da medida não vai para as fontes, que têm a própria data de leitura.
- **No kit, toda frase técnica em inglês contém uma frase provada da seção "Provas"** (`launch-kit.test.ts`, § 205). Frase nova sobre envio, offline, navegador, anúncio, Analytics, cookie, conta, lote ou memória precisa de prova, ou sai.

## F6: português e espanhol

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 python -I scripts/oracle/pix.py` | Regera `fixtures/pix.json` (o exemplo do manual do BC e os quatro códigos do Pix), só com a biblioteca padrão; `--check` compara sem gravar |
| `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py` | Regera `fixtures/calc/br-*.json`, as 8 calculadoras brasileiras (`--check`, `--only <id>`). O `calc.py` e as 18 fixtures em inglês não mudam |

Como uma página ganha versão em pt e es:

1. Imagem e PDF: o caminho entra na tabela `TRANSLATED_PATHS` de `src/i18n/routes.ts` (slug sem acento, glossário), o texto em `src/tools/<slug>/i18n/{pt,es}.ts` (o mesmo tipo do inglês, as mesmas chaves e `{placeholders}`), o cartão em `src/i18n/{pt,es}/common.ts` e o arquivo `src/pages/<lang>/<slug>/index.astro` com o molde da página inglesa e `lang`. O `CommonTexts` exige todas as ferramentas nos três idiomas.
2. Dinheiro em espanhol: o bloco `es` na linha do `CALC_PAGES` (caminho, `file`, `next` e `related` só entre páginas do espanhol). A definição, o motor e as fixtures são os do inglês.
3. Uma calculadora brasileira: o caso no `scripts/oracle/calc_br.py` e as fixtures num commit antes de tudo; o id `br-*` em `BR_CALC_IDS` e `BR_CALC_PAGES`, em `ENGINES`, em `DEFS` (`src/tools/calc/defs/br.ts`) e em `CALC_EVENT_TOOLS`; o texto em `src/tools/br-<slug>/i18n/pt.ts`; a rota sai de `brMoneyRoutes()`.

Formato de cada idioma (docs/i18n/, DECISOES § 213 a § 223):

- inglês e espanhol escrevem "1,234.56" e "2.4 MB"; o espanhol põe espaço sem quebra antes do "%" ("68 %"); português, "1.234,56", "2,4 MB" e "R$ 1.234,56". Datas por extenso pelo `src/i18n/dates.ts`. Nada de `Intl` no que a página mostra.
- CSV: vírgula e ponto em inglês e espanhol; ponto e vírgula e vírgula decimal em português; BOM nos três. PDF do relatório em Letter (en, es) e A4 (pt, `paper: 'a4'`).
- O nome do arquivo baixado vem dos textos (`panel.suffix`, `files`), e as palavras da numeração do PDF também (`pageWord`, `ofWord`); em inglês, os bytes de antes.

O Pix: a chave aleatória está em `src/platform/pix.ts` (uma linha, copiada do `docs/F0-SAIDA.md`). O gerador reproduz o exemplo do manual e os quatro códigos do `fixtures/pix.json` (`tests/unit/pix.test.ts`); o QR é desenhado no build com o `qrcode` e lido de volta com o `jsqr` em cada SVG do `dist/pt/apoie/` (`tests/unit/pix-qr.test.ts`). A troca de valor é CSS (`:has(:checked)`) e o copiar é um script inline; o "Copiar código" manda o `donate_click` com o lugar `pix`.

Pegadinhas que a F6 achou:

- **O Vitest 5 guarda um cache de módulos em `node_modules/.vitest-cache`**, pela chave do conteúdo do arquivo. Um `import.meta.glob` que deveria ver arquivos novos (as pastas `br-*`) fica com o resultado velho enquanto o arquivo que chama o glob não muda. Se um teste diz que um texto "não existe" e o build acha, apague `node_modules/.vitest-cache` e rode de novo.
- **No Node, `String.replace(a, b)` interpreta `$'`, `$&` e `$$` em `b`.** Um script que troca texto com "R$ " no meio duplicou metade de um arquivo de teste. Use `s.replace(a, () => b)` ou `split(a).join(b)`.
- **No Git Bash, argumento que começa com "/" vira caminho do Windows** ("/pt/apoie/" virou "C:/Program Files/Git/pt/apoie/"). Para passar caminhos de URL a um script, use `MSYS_NO_PATHCONV=1`.
- **O `lint:texto` do português reprova nome de opção depois de vírgula** ("Espaço pega a linha, ... e Espaço solta" deu `UPPERCASE_AFTER_COMMA`) e "não entram imposto" (`NON_IMPERSONAL_VERBS`). Ponha o nome entre aspas ou escreva "a tecla Espaço", "a opção Clara", "ficam de fora".
- **O CFPB tirou do ar o `consumerfinance.gov/es/` em julho de 2026**: toda URL dali redireciona para o inglês. As páginas em espanhol citam os PDFs em espanhol de `files.consumerfinance.gov` e, onde não há, a página em inglês com "(en inglés)".
- **Os moldes de PDF e de dinheiro e os hubs recebem `lang` com o padrão `'en'`**, porque testes antigos os renderizam sem idioma. `.map(cardOf)` passa o índice como segundo argumento: escreva `.map((id) => cardOf(id, lang))`.
- **O número do resultado no celular** (§ 124) ficou com folga zero numa página em português (o veículo, a 740 px). Português e espanhol são mais longos: meça a 360 × 740 nos dois navegadores antes de escrever o lead e os rótulos de meia largura.
- **Um rótulo com a etiqueta "exemplo" numa meia coluna** tem de caber a 360 px (palavra mais longa + 12 px + 72 px da etiqueta ≤ 158 px). A 320 px, a etiqueta desce de linha (`flex-wrap`, § 234); a 360 px isso empurraria o resultado para baixo da dobra. "Parcelamento" não coube; "Parcelado" cabe.
- **Teste de pt e es no orçamento vai no `i18n-budgets.spec.ts`,** que cai entre o `design.spec.ts` e a matriz de imagens na ordem dos nomes. Dentro do `budgets.spec.ts`, os testes novos tinham levado os dois para a mesma parte do WebKit (§ 233). As medidas do orçamento estão em `tests/e2e/lib/budgets.ts`, e o passeio dos estados de PDF (`walkPdfTool`) recebe `lang`.
- **O `gate:seo` pede de 120 a 160 caracteres na descrição** das páginas de imagem e de PDF em pt e es (as outras, de 50 a 170). Tradução fica mais longa: rode o portão depois de mudar uma descrição.
- **Um `fill` logo depois de soltar um PDF** corria com o painel, que leva o foco ao botão da ação um quadro depois de mostrar as opções (§ 240). O painel agora deixa o foco num campo de texto onde ele já está. Um teste que precisa do foco num campo assim que ele aparece pode focá-lo por um `MutationObserver` na página, antes dos efeitos da ilha.
- **O `.github/` não mudou,** mas com 1.038 testes por navegador a parte 1 do Chromium (o `a11y` inteiro) chegou a 764 s e a 3 a 711 s no CI, acima do alvo de 700 s (§ 243). A próxima run que somar páginas divide o Chromium em 4 partes primeiro. A estimativa pelo par em inglês errou para menos: os testes de pt e es custam mais no runner. Antes de somar testes, rode o `--list` das partes e compare com os tempos do último CI (`gh run view <id> --log`).

## F7: casa, saúde e QR code

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 python -I scripts/oracle/calc_home_health.py` | Regera as 11 fixtures de casa e saúde (`fixtures/calc/<id>.json`), só com a biblioteca padrão (`fractions`, `decimal` com 50 dígitos, `datetime`); `--check` compara sem gravar, `--only <id>` faz uma calculadora. Os outros dois oráculos não mudam |

Como uma calculadora de casa ou de saúde entra:

1. O caso no `scripts/oracle/calc_home_health.py` (a função, a grade, os aleatórios com semente `2026-11-02/<id>`, o `page-example` e, se houver, o exemplo oficial em `OFFICIAL_CHECKS` e no `fixtures/calc/OFICIAIS.md`). Onde entra π ou log10, a saída leva `exact` (30 algarismos) e o oráculo refaz o sorteio perto de um empate. Regere e commite as fixtures antes do motor.
2. O motor em `src/calc/home.ts` ou `health.ts` (frações em BigInt, `Math.PI`/`Math.log10` só onde precisa, dias por `src/calc/dates.ts`) e o id em `ENGINES`.
3. O id em `HOUSE_CALC_IDS` ou `HEALTH_CALC_IDS` e a linha em `LIFE_CALC_PAGES` (`src/tools/calc/registry.ts`): o hub (`house` ou `health`) decide o AdSlot (`casa-saude`), a cor (`home`, violeta só no preenchimento), o breadcrumb, a lista de fontes do `gate:dinheiro-saude` (`ymylHubOf`), a comemoração da Oli (nunca na saúde) e o `WebApplication`. O id entra em `CALC_EVENT_TOOLS`; a rota sai de `lifeRoutes()`.
4. A definição em `src/tools/calc/defs/house.ts` ou `health.ts` e a entrada em `DEFS`: medidas com `measure(key, decimais, min, max)` (`kind: 'dec'`), datas com `DateSpec` (`<input type="date">`, faixa fixa), a lista com menu de linha (`ListSpec.pick`) e o botão de acrescentar depois do resultado (`addBelow`); `today: true` se a conta precisa do dia do aparelho; a tabela do resultado com `open: true`.
5. Os textos em `src/tools/<id>/i18n/en.ts` (`CalcPageTexts`; o erro de cada campo diz a faixa com as casas da medida) e o cartão em `enCommon.calcs`; a página `src/pages/<id>/index.astro` com `<CalcTool id lang="en" />`.
6. Os testes que leem o registro pegam a página nova (`calc-defs`, `calc-oracle`, `a11y`, `ads`, `budgets`, `money-life-privacy`); o caso dela entra no `money-home.spec.ts` ou no `money-health.spec.ts`.

O hub de cada uma é lido de `LIFE_HUB_IDS` (a ordem) e de `src/i18n/life-hubs.ts` (os textos, só em inglês), pela view `src/views/LifeCalculatorsView.astro`.

Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes" e "F5a", que ficam como estão.

- **As partes:** são treze, cada uma num job com o limite de 900 s e o alvo de 700 s: o `verificar` (`--sem-playwright`), o `playwright (chromium 1 de 4)` ao `4 de 4` (`--playwright=chromium --shard=i/4`) e o `playwright (webkit 1 de 8)` ao `8 de 8` (`--playwright=webkit --shard=i/8`).
- **Antes de somar specs:** rode o `--list` de cada parte (Chromium em 4, WebKit em 8) e veja onde caem o `design.spec.ts` e o `image-matrix.spec.ts`, que nunca podem ficar na mesma parte do WebKit (§ 142).
- **O `tests/unit/verificar.test.ts`** traz as 13 partes escritas à mão. Mudou o `ci.yml`, mude o teste.

O QR code:

- Fica em `src/tools/qr-code-generator/` (a ilha, a conta em `qr.ts`, sem DOM, e o único `<script>` da página no componente dela). Página `/qr-code-generator/`, só em inglês, área `utilidades`, sem hub nem link do cenário.
- O `qrcode` está em `dependencies` só por esta página: o import é o caminho fundo `qrcode/lib/core/qrcode.js` (22 módulos e o `dijkstrajs`), estático, e nada do chunk `island` importa o QR. O plugin `qrcodeEsm()` (`src/platform/qrcode-esm.ts`) entrega esses arquivos CommonJS ao bundler como ES modules (§ 271), e a página carrega 2 arquivos JS. O `gate:licencas` reprova `qrcode` ou `dijkstrajs` no `island` ou em mais de um chunk.
- A leitura é provada pelo `jsqr` (o `binaryData` igual aos bytes UTF-8 do texto), no Node (`tests/unit/qr.test.ts`, o SVG rasterizado pelo `@resvg/resvg-js`) e nos dois navegadores (`tests/e2e/qr-code.spec.ts`, o PNG e o SVG baixados, com e sem a Oli).

Pegadinhas que a F7 achou:

- **No Node, `String.replace(a, b)` interpreta `$'` no texto novo** (de novo, como na F6): um teste com `'R$ ' : '$'}` virou meio arquivo. Em script de remendo, use sempre `t.replace(a, () => b)`.
- **O `lead` de uma calculadora em três linhas** custa 56 px a 360 px: com um OptionGroup e duas linhas de campos de meia largura, o resultado passa da dobra. O `lead` das páginas com OptionGroup cabe numa linha.
- **Um pacote CommonJS numa página faz o Rolldown carregar o `rolldown-runtime.*.js`** (o ajudante `__commonJS`), que ele divide com os chunks preguiçosos: um terceiro arquivo JS. O runtime não entra em grupo de `codeSplitting` e o `experimentalInlineCommonChunks` não roda no build do Astro. Para CommonJS simples, converta para ES module no build, como o `qrcodeEsm()` (§ 271), e prove a contagem no `budgets.spec.ts`.
- **O `jsqr` só lê com pixels por módulo inteiros**: o PNG do QR sai numa escala inteira, nunca num tamanho fixo de 512 px.
- **Datas:** o motor só vê dias inteiros; o "hoje" é lido pela ilha com `getFullYear()`, `getMonth()` e `getDate()` do aparelho, nunca do UTC. Nos testes, fixe o relógio com `page.clock` e o fuso no contexto.
- **O WebFetch não abre** acog.org, apps.dtic.mil nem esd.whs.mil (403), e o NCBI Bookshelf pede reCAPTCHA: a fonte vira o PubMed, o PMC ou outra página oficial do mesmo órgão, e o que não abriu fica como pendência.

## F7: o que a revisão mudou nos formulários das calculadoras

- **Erro de faixa vai ao store** (§ 276). O `CalcField` e o `DateField` recebem `report` (o `wrong(id, is)` do store) e avisam quando mostram ou deixam de mostrar o erro de faixa. Enquanto houver um campo assim, o resultado fica velho: aparece a linha "Fix the highlighted field…", e o PDF e o CSV ficam desligados. Campo novo que valida a própria faixa passa o `report` adiante, como o `NumberInput` do `Fields.tsx`.
- **Tabela aberta** (§ 275). Uma tabela sem grupos por ano (`CalcView.open`) sai com `fo-amort--flat`: sem coluna fixa e com texto que quebra. Ela tem de caber a 320 px. O `calc-form.spec.ts` mede isso nas páginas de casa e saúde.
- **Campos estreitos** (§ 277). O `calc-form.spec.ts` lê os `DEFS` e confere, a 320 e 360 px:
  - cada número visível com o exemplo e com o máximo da faixa (`scrollWidth ≤ clientWidth`);
  - cada opção de cada menu, medida com a fonte do menu;
  - o menu e a data na linha inteira abaixo de 360 px, só nas páginas de casa e saúde (`fo-calc--home`, § 282); as de dinheiro guardam as meias linhas, e o teste confere.

  Antes de criar um campo de meia largura com unidade longa, ou um menu com opção longa, rode esse spec.
- **Alto contraste** (§ 280). O WebKit do Playwright não emula `forcedColors`. O teste ramifica por dentro, pelo `matchMedia('(forced-colors: active)')`: no Chromium afirma o sublinhado, no WebKit o fundo.
- **Foco das áreas** (§ 278). Só o clique no "Add an area" move o foco para a linha nova (`addedBelow`, estado do módulo `Fields.tsx`). As linhas que o link do cenário traz não mexem no foco.

## F8: piloto automático

O service worker (DECISOES § 285 a § 294):

- **Arquivos:** `src/sw/shared.ts` (o que a página e o worker combinam), `src/sw/logic.ts` (as regras puras, no Vitest) e `src/sw/main.ts` (os eventos). O `src/sw/build.ts` costura os três num script clássico, `dist/sw.js`, no `astro:build:done` do `src/platform/build-files.ts`. Arquivo novo do worker só importa os de antes dele na lista `SW_FILES`, sem `export { }` nem `import` de pacote: o build recusa.
- **O que entra no cache:** só GET da mesma origem, resposta 200 `basic` sem redirecionamento. Navegação e o resto vão à rede primeiro; `/_astro/*` vem do cache primeiro. Nunca entram `/build.txt`, `/cdn-cgi/*`, `ads.txt`, `robots.txt`, os sitemaps, a chave do IndexNow, o `/sw.js` e a caixa de entrada.
- **A chave** é `origin + pathname`, sem `?` e sem `#`, em todo `put` e `match`. **A versão** é o commit do `build.txt` no nome do cache (`fileorca-pages-<commit>`); no `activate`, o resto sai.
- **A desativação:** `SW_ENABLED = false` em `src/platform/site.ts` (run curta). O `/sw.js` passa a apagar os caches e se desregistrar, o `BaseLayout` não registra e o manifest perde o `share_target`.
- **Nos testes:** `serviceWorkers: 'block'` é o padrão do `playwright.config.ts`. Um spec do worker liga com `test.use({ serviceWorkers: 'allow' })` e sobe o próprio servidor do `dist/` (`tests/e2e/lib/sw-server.ts`): origem limpa, `/sw.js` trocável, e a rede desligada de verdade com `close()`. Os ajudantes estão em `tests/e2e/lib/sw.ts` (`controlled`, `kept`, `allKept`, `offline`, `reloadOffline`, `share`).
- **O registro** (`src/platform/sw-register.ts`) é inline, depois do `load`, e nunca espera o `ready`.

O compartilhar (§ 290 e § 291):

- **A caixa** é o Cache Storage `fileorca-inbox` (entradas `/__fileorca-inbox/<n>`, o nome em cabeçalho). O worker a enche no POST da ação do manifest e responde 303.
- **A página "Abrir com"** é `src/views/OpenWithView.astro` com o script `src/share/client.ts`, que não importa nada do chunk `island` (2 arquivos JS: a entrada e o chunk `sniff`). As ferramentas e o `accept` dos manifests saem de `src/share/tools.ts`, que lê os registros.
- **A entrega** é o `takeInbox(page)` de `src/tools/image/inbox.ts`, na montagem do `ImagePanel` e do `PdfPanel`, pelo caminho do soltar. A escolha vai no `sessionStorage` da aba (`{tool, order}`), nunca na URL.

O Dependabot (§ 298 e § 299):

- **O arquivo** é `.github/dependabot.yml`: npm e GitHub Actions, mensal (dia 1, 06:00 de São Paulo), um grupo de minor e patch por ecossistema, major em PR própria, `cooldown` de 7 dias, `labels: []` e `ignore` sempre com a razão no comentário de cima (o `tests/unit/dependabot.test.ts` reprova `ignore` sem razão).
- **Fica para o Victor:** toda major, toda PR de GitHub Actions (mexe em `.github/workflows/`) e o que o `docs/OPERACAO.md` lista depois de certas PRs.
- **Teste que fixa versão:** se uma PR do grupo ficar vermelha porque um teste fixa uma versão sem razão de produto, o teste passa a ler a versão do `package.json` ou do lockfile (run curta). Se a versão nova quebra de fato, a dependência ganha um `ignore` com a razão.

A regra de merge (§ 297):

- Os eventos de exemplo estão em `fixtures/merge-events/`, e o `tests/unit/merge-events.test.ts` os leva pelo mesmo caminho do job (o `env` do Decide, o `git diff`, o `jq` do próprio `ci.yml` e o CLI com o `GITHUB_OUTPUT`). Caso novo é um JSON a mais.
- A chamada do CLI no `ci.yml` não muda junto com o script: o job roda o `pode-mesclar.ts` da base, e uma chamada nova chegaria ao script velho. Mudar a chamada pede duas PRs (primeiro o script aceita as duas formas, depois o `ci.yml` muda), e o teste fixa a chamada de hoje.
- Toda issue dos workflows leva `--assignee "$OWNER"` (§ 301): o `tests/unit/ci-workflows.test.ts` reprova uma sem isso, e o `tests/unit/operacao.test.ts` reprova título de issue que o `docs/OPERACAO.md` não cite.

Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes", "F5a" e "F7", que ficam como estão.

- **As partes:** são quinze, cada uma num job com o limite de 900 s e o alvo de 700 s: o `verificar` (`--sem-playwright`), o `playwright (chromium 1 de 4)` ao `4 de 4` e o `playwright (webkit 1 de 10)` ao `10 de 10` (§ 302). O job `alerta-dependabot` vem depois de todas.
- **O `tests/unit/verificar.test.ts`** lê a matriz do próprio `ci.yml`. Antes de somar specs, rode o `--list` das partes e veja onde caem o `design.spec.ts` e o `image-matrix.spec.ts` (§ 142).

Pegadinhas que a F8 achou:

- **O gancho `astro:build:done` roda com o carregador do Vite fechado:** um `import()` ali falha com "Vite module runner has been closed". Use `createRequire` (pacote CommonJS) ou import estático.
- **O relógio falso do Playwright esvazia o `performance.getEntriesByType('resource')` no WebKit.** Um teste que fixa o relógio antes de a página carregar não vê os recursos dela.
- **No WebKit do Playwright, o `setOffline(false)` não chega ao service worker,** que segue sem rede; e os pedidos feitos pelo worker não aparecem no `context.on('request')`. O teste ramifica por dentro.
- **Com `serviceWorkers: 'block'`, o `navigator.serviceWorker.register()` resolve `undefined` e o `ready` nunca resolve.** Script de página não espera o `ready`.
- **O pedido do `/sw.js` para registrar não aparece no `context.on('request')`:** confira no servidor do teste.
- **`caches.open()` cria o cache que falta:** um teste que lista os caches enquanto o worker apaga um deles o recria. Leia os nomes com `caches.keys()` e confira com `caches.has()` antes de abrir.
- **No Git Bash, ` ` e crases num `sed` ou num `node -e` somem.** Texto com barra invertida, crase ou apóstrofo vai num arquivo escrito pela ferramenta de escrita (como nas fases anteriores).
- **O Victor não assistia o repositório:** issue sem responsável podia não dar e-mail. Por isso o `--assignee`.
- **A trilha de navegação usa a face `Figtree Trail`** (`--fo-font-trail`, o mesmo arquivo da Figtree com `font-display: optional`, § 305). Ela fica com a fonte da primeira pintura, então nunca muda de linha quando a Figtree chega. Com `swap` ela volta a empurrar a ferramenta na primeira visita no celular (CLS até 0,27), que o Lighthouse não vê porque mede a 412 px sem atrasar a fonte. Não reserve altura na trilha: duas linhas reservadas põem o resultado de cinco calculadoras abaixo da dobra (§ 124).
- **A `Figtree Fallback` tem `size-adjust: 101.2%`** (§ 305), escolhido pela varredura de todas as páginas de 320 a 412 px, cada uma num contexto novo, com a Figtree segura até a primeira pintura (o `firstVisit()` do `layout-shift.spec.ts` faz o mesmo numa página; o spec guarda as páginas da borda de cada largura). No Chromium a fonte de reserva não engorda no negrito; no WebKit, sim. Mudou a fonte, a calibração ou um texto perto da borda: rode o `layout-shift.spec.ts`.
- **No WebKit, uma página de hub não pinta enquanto a Figtree está segura:** o `requestAnimationFrame` não roda. Teste que segura a fonte espera a pintura com um teto (`setTimeout`), como o `painted()` do `layout-shift.spec.ts`. E o WebKit ainda usa uma face `optional` que chega nos 100 ms depois do pedido: para provar a fonte "atrasada", solte-a depois disso.
- **O CLS de texto com a fonte atrasada depende do sistema:** a mesma página deu 0,046 aqui e 0,257 no Linux do CI, porque a fonte de reserva se desenha diferente (§ 305). Um teste de fonte afirma o que a página garante (a trilha e o H1 parados) e imprime o CLS; o limite de CLS do projeto é o do Lighthouse.
- **Teste que percorre o site inteiro num teste só estoura os 60 s no WebKit do CI** quando o site cresce (o reflow a 320 px, com 169 páginas, § 306). Divida em blocos de páginas, um teste cada, e confira no `--list` onde caem o `design.spec.ts` e o `image-matrix.spec.ts`.
- **O erro de faixa das calculadoras espera 800 ms sem tecla ou a saída do campo** (`SETTLE_MS`, § 305). Teste que digita um valor fora da faixa espera o alerta com `expect` (que já espera), nunca na hora.
