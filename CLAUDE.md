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
- O `playwright.config.ts` usa a porta 4173 com `reuseExistingServer`: dois worktrees rodando o Playwright ao mesmo tempo usam o servidor um do outro.
- Em `tests/unit/pos-deploy.test.ts`, a regra de antes do lançamento é testada no commit `503b8c3` (o último com `LAUNCHED = false`), porque o pós-deploy lê o `LAUNCHED` do commit que confere.
