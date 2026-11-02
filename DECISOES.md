# Decisões do FileOrca

Registro de decisões com § numerados. Cada run acrescenta § novos no fim; nenhum § é apagado. Quando uma decisão nova substitui outra, o § novo diz qual substitui. As "Decisões fechadas" do PLANO-FILEORCA.md continuam sendo contrato e não aparecem aqui.

## § 1 · Plataforma de entrega (F1a, 30/out/2026)

A plataforma (Astro 7 estático com ilhas Preact 11, Worker `fileorca` só com assets no Cloudflare Workers Free, Workers Builds, CI no GitHub Actions com job de merge e pós-deploy) está decidida na [ADR-001](docs/adr/ADR-001-plataforma-de-entrega.md). Mudança de host, framework, estrutura ou pipeline só com ADR nova.

## § 2 · Design system v1.1 em docs/design/ (F1a, 30/out/2026)

O design system v1.1 já veio no pacote da F0 em `docs/design/` (ver `docs/design/MUDANCAS-v1.1.md`), com as correções que a ficha da F1b mandava aplicar. É a fonte de tokens, componentes, voz e regras visuais. A F1a usa a marcação v1.1 como está (nomes, classes `fo-*` e ARIA) com estilo provisório; a F1b implementa o visual. `docs/design/` é só leitura nas runs que não forem de design.

## § 3 · Ko-fi em ko-fi.com/victormatusita (F1a, 30/out/2026)

- **Decisão:** o link de doação é `https://ko-fi.com/victormatusita`, e não `ko-fi.com/fileorca` como diz o plano.
- **Por quê:** endereço informado pelo Victor ao gerar o prompt da F1a.
- **Alternativa:** manter ko-fi.com/fileorca (não existe).
- **Onde:** `KOFI_URL` em `src/platform/site.ts` e `docs/F0-SAIDA.md`.

## § 4 · Rotas e mapa de equivalência (F1a, 30/out/2026)

- **Decisão:** inglês na raiz e os outros idiomas em pasta com slug traduzido, sempre com barra no fim. O mapa fica em `src/i18n/routes.ts`, uma linha por página, com o caminho em cada idioma equivalente:

  | Página | en | pt | es |
  | --- | --- | --- | --- |
  | Home | / | /pt/ | /es/ |
  | Compress image | /compress-image/ | /pt/comprimir-imagem/ | /es/comprimir-imagen/ |
  | Privacidade | /privacy/ | /pt/privacidade/ | /es/privacidad/ |
  | Termos | /terms/ | /pt/termos/ | /es/terminos/ |
  | Sobre | /about/ | /pt/sobre/ | /es/acerca-de/ |
  | Contato | /contact/ | /pt/contato/ | /es/contacto/ |
  | Licenças | /licenses/ | /pt/licencas/ | /es/licencias/ |
  | Apoio | /support/ | /pt/apoie/ | /es/apoyo/ |
  | 404 | /404.html | /pt/404.html | /es/404.html |

  O 404 fica fora do sitemap e do hreflang (`indexable: false`).
- **Por quê:** prompt da F1a e plano ("Idiomas e URLs").
- **Alternativa:** o roteamento i18n do Astro, que não deixa declarar equivalência por página nem slug traduzido sem duplicar o mapa.

## § 5 · Página de apoio mínima já na F1a (F1a, 30/out/2026)

- **Decisão:** /support/, /pt/apoie/ e /es/apoyo/ nascem mínimas: o título e o texto da tabela de Doações do plano, um botão-link para o Ko-fi (sem widget e sem script do Ko-fi) e o evento `donate_click` com `place: "support_page"`. Em português, por enquanto sem Pix (é da F6). A F1b veste a página com o SupportCard e a Oli `coffee`.
- **Por quê:** o link "Support" do rodapé não pode quebrar.

## § 6 · Só links para páginas que existem (F1a, 30/out/2026)

- **Decisão:** breadcrumb, rodapé e ToolCards só linkam páginas que existem. Até a F2, o breadcrumb da ferramenta é Home › Compress image, sem hub (/image-tools/ é da F2).
- **Por quê:** o portão de links internos reprova link quebrado.

## § 7 · Motor provisório da Compress image (F1a, 30/out/2026)

- **Decisão:** um Web Worker com Comlink (`src/engine/image/`) decodifica JPG, PNG e WebP com `createImageBitmap` e regrava num `OffscreenCanvas` no mesmo formato, o que descarta os metadados, inclusive o GPS. Sem jSquash, HEIC, orientação fina ou ZIP (F2). A tela mostra os tamanhos reais; sem ganho, diz que o arquivo já estava otimizado e entrega o original. Arquivo que o navegador não decodifica cai no erro, com a fala da Oli em texto. O texto da página não promete o que o motor provisório não faz.
- **Por quê:** exercitar o molde, o worker, os estados e o orçamento de JS; a F2 troca o motor sem mexer no molde.

## § 8 · GA4 só em fileorca.com (F1a, 30/out/2026)

- **Decisão:** o `gtag.js` só é injetado quando `location.hostname === "fileorca.com"`. Localhost, CI e prévias em *.workers.dev nunca mandam nada ao Google. A camada de consentimento e o `dataLayer` rodam sempre, para os testes conferirem. O `page_location` vai como origem + caminho, sem `?` e sem `#` (o link do cenário da F4 guarda números no `#`).
- **Por quê:** prompt da F1a; nenhum número digitado sai do aparelho.

## § 9 · Consent Mode v2 por região (F1a, 30/out/2026)

- **Decisão:** padrão `denied` nas quatro chaves (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) na UE (27 países), no EEE (Islândia, Liechtenstein e Noruega), no Reino Unido (GB) e na Suíça (CH), e `granted` no resto, tudo declarado antes do `config`.
- **Por quê:** a política de consentimento do Google cobre o EEE inteiro, não só a UE; o plano fala em UE, Reino Unido e Suíça.

## § 10 · Eventos do GA4 com lista fechada (F1a, 30/out/2026)

- **Decisão:** `src/analytics/events.ts` define, com tipos e conferência em tempo de execução, os eventos `tool_start`, `tool_complete`, `download`, `next_step_click`, `tool_error` (com navegador e codec) e `donate_click` (com o lugar). Parâmetro fora da lista reprova no teste e é descartado em produção. Nenhum evento leva nome de arquivo, conteúdo ou número digitado.

## § 11 · IndexNow só com LAUNCHED = true (F1a, 30/out/2026)

- **Decisão:** com `LAUNCHED = false`, o pós-deploy confere tudo mas não dispara o IndexNow, porque as páginas estão em noindex. Com `true`, dispara só as URLs que mudaram (`scripts/ci/urls-alteradas.ts`).

## § 12 · Noindex só por cabeçalho (F1a, 30/out/2026)

- **Decisão:** noindex só pelo cabeçalho `X-Robots-Tag` gerado em `src/platform/headers.ts`, como manda a ADR. Nunca por `<meta name="robots">`; um teste reprova a meta.

## § 13 · dependencies × devDependencies e licenças (F1a, 30/out/2026)

- **Decisão:** o que vai para o navegador fica em `dependencies` (astro e @astrojs/preact, pelo runtime das ilhas; preact; comlink; tailwindcss, pelo CSS gerado). Build, teste e CI ficam em `devDependencies`. A /licenses é gerada das `dependencies` mais as fontes (OFL). O portão de licenças (`pnpm gate:licencas`) confere as duas listas (dependências diretas de cada lado) contra as licenças permitidas do CLAUDE.md e, na árvore instalada inteira, reprova AGPL, GPL, SSPL, BUSL, licença não comercial e licença desconhecida. As licenças permissivas fora da lista que aparecem só em dependências transitivas de ferramentas de build (BlueOak-1.0.0, CC0-1.0, CC-BY-3.0/4.0 de dados como o caniuse-lite) são listadas na saída do portão, sem reprovar, porque não vão ao navegador nem são escolha da run.
- **Alternativa:** reprovar toda transitiva fora da lista, o que tiraria do projeto o próprio Astro, o Lighthouse e o Playwright.

## § 14 · Merge recusa rascunho (F1a, 30/out/2026)

- **Decisão:** o `pode-mesclar.ts` também recusa PR em rascunho, sem comentário e sem issue, porque o `gh pr merge` falharia nela. O `ci.yml` escuta `opened`, `synchronize`, `reopened` e `ready_for_review`, para a decisão de merge rodar quando o rascunho fica pronto.
- **Por que sem comentário:** cada push num rascunho rodaria o CI de novo e encheria a PR de comentários iguais.

## § 15 · Busca Ctrl+K carregada no primeiro uso (F1a, 30/out/2026)

- **Decisão:** a busca de ferramentas não pesa no carregamento: o código e o índice só carregam no primeiro uso (foco, clique ou Ctrl+K). O molde segue com uma ilha Preact só, a do painel da ferramenta; a busca é TypeScript sem framework.
- **Como:** `src/search/entry.ts` é empacotado à parte (`?worker&url`, que no Vite 8 devolve a URL de um bundle ES próprio) e importado por URL num script inline de 0,6 KB. Um `<script>` processado do Astro com `import()` viraria arquivo externo e puxaria o `preload-helper` em toda página.

## § 16 · build.format "preserve" (F1a, 30/out/2026)

- **Decisão:** `build.format: 'preserve'` no `astro.config.ts`, com toda página em `.../index.astro` e os 404 em `404.astro`.
- **Por quê:** com o padrão `'directory'`, o Astro 7.4 grava `src/pages/pt/404.astro` como `pt/404/index.html`, e o `not_found_handling: "404-page"` do Cloudflare procura `pt/404.html`. Conferido no build em 30/out/2026.
- **Alternativa:** mover o arquivo num hook depois do build (mais frágil).

## § 17 · Node 24 LTS e pnpm 10, por causa do build image do Workers Builds (F1a, 30/out/2026)

- **Decisão:** `.node-version` em 24.22.2 (LTS "Krypton", em manutenção até abr/2028) e `packageManager: pnpm@10.34.9`. O `pnpm-workspace.yaml` aprova só os scripts de instalação do esbuild e do workerd (`onlyBuiltDependencies`). O eslint fica em 10.13 porque o 10.14 saiu no próprio dia da run, e o TypeScript em 6.0, porque o `@astrojs/check` e o typescript-eslint ainda não aceitam o 7.
- **Por quê:** a run começou com o Node 26.13.0 (LTS ativa desde 28/out/2026) e o pnpm 12.16.1. O CI do GitHub instalou e buildou com eles, mas o build da prévia no Workers Builds caiu em menos de 17 s depois do push, antes de instalar. O build image instala o pnpm pelo Corepack, que o Node 25+ não traz mais, e o pnpm 12 é distribuído como executável nativo por dependência opcional, o que o Corepack antigo não baixa. Com Node 24 a falha passou para uns 27 s, e com pnpm 10 para uns 60 s: cada troca fez o build ir mais longe. O lockfile (v9) é o mesmo nas duas versões do pnpm.
- **Não confirmado:** o log do build fica no painel do Cloudflare, que a run não acessa; o build com pnpm 10 ainda falhou numa etapa posterior (ver ADR-002 e o relatório). Voltar ao Node 26 e ao pnpm 12 é uma linha cada, quando o build image aceitar.
- **Atualização (§ 37):** a falha era o comando de build salvo no painel (`pnpm buid`); o Node 26 e o pnpm 12 instalam sem erro no Workers Builds. Voltar a eles não é só uma linha (ver § 37).

## § 18 · Estilo provisório da F1a (F1a, 30/out/2026)

- **Decisão:** `src/styles/global.css` importa só o preflight do Tailwind 4 e `docs/design/tokens.css`, sem tema nem utilitários do Tailwind (que gerariam classes a partir das palavras dos textos e cores fora dos tokens). As regras usam as classes `fo-*` do design system e só variáveis dos tokens; as fontes são as do sistema até a F1b. Um teste reprova hex fora do `tokens.css` e amarelo fora do Baixar.
- **Por quê:** a identidade visual é da F1b; a F1a precisa de um molde que funcione, meça e passe no axe.

## § 19 · Seletor da Oli: `[data-oli]` (F1a, 30/out/2026)

- **Decisão:** todo lugar da Oli é um elemento com `data-oli="<pose>"` (`wave`, `gulp`, `swim`, `cheer`, `oops`…), `aria-hidden="true"`, com a caixa no tamanho do design system (88 px no DropZone do celular, 112 px a partir de 768 px, 72 px no WaterLevel, 72 ou 96 px no ResultCard). Na F1a a caixa fica vazia; a F1b põe a arte dentro dela e mantém o atributo.
- **Por quê:** o design system não define um seletor único; o teste de distância dos anúncios mede `[data-oli]` desde já.

## § 20 · Alturas reservadas (F1a, 30/out/2026)

- **Decisão:** o lugar do painel (`.fo-slot`) reserva 380 px no celular e 340 px a partir de 768 px, para DropZone, WaterLevel e ResultCard ocuparem o mesmo retângulo. O AdSlot de conteúdo reserva 300 px e o lateral 644 px (o `bundle.css` diz 280 e 624). No computador, o vão entre a coluna da ferramenta e o trilho é o próprio `ad-clearance` (`column-gap: 150px`).
- **Por quê:** com o rótulo e o respiro do AdSlot (44 px), 280 px deixam 236 px para uma unidade de 250 px e 624 px deixam 580 px para a 300×600, o que mexeria a página quando o anúncio chegasse (CLS). O teste de distância achou o trilho a 148 px do painel a 1280 px antes do `column-gap`.

## § 21 · Imagem de Open Graph (F1a, 30/out/2026)

- **Decisão:** uma imagem de 1200×630 por página indexável e idioma (24), gerada no build com satori e resvg, com o título da página sobre o fundo do mar. A fonte é o `.woff` do `@fontsource/figtree` (OFL-1.1), porque o satori não lê woff2; fica em `devDependencies`, já que a imagem não distribui a fonte. A Oli segurando o ícone da ferramenta entra na F1b, junto com a arte dela.

## § 22 · Motor na página quando o worker não tem OffscreenCanvas (F1a, 30/out/2026)

- **Decisão:** o worker responde `no-canvas` quando não existe `OffscreenCanvas` (Safari antes do 16.4, e o WebKit do Playwright no Windows), e o mesmo `recompress()` roda então na página com um `<canvas>`.
- **Por quê:** achado no teste em WebKit; sem isso a ferramenta falharia nesses navegadores. O motor continua fora do carregamento inicial (só carrega quando chega a imagem).

## § 23 · Ilha do painel hidratada por um script e runtime do Preact num chunk (F1a, 30/out/2026)

- **Decisão:** o `ToolPanel` é renderizado pelo Astro em HTML estático (com o `@astrojs/preact`) e hidratado por `src/tools/compress-image/mount.ts` com o `hydrate()` do Preact, em vez de `client:load`. O `astro.config.ts` junta o Preact e o `preload-helper` num chunk só (`codeSplitting.groups`, nome `preact-runtime`).
- **Por quê:** com `client:load` a página da ferramenta baixava cinco arquivos de JS (componente, renderer, preact, hooks, preload-helper), e ir da home para a ferramenta somava 6 requisições novas, acima das 3 do orçamento. Agora são dois arquivos (11,6 KB gzip com os scripts inline). Continua sendo uma ilha Preact só por página.
- **Para a F2:** cada ferramenta segue o mesmo molde (um `mount.ts` por ferramenta).

## § 24 · lint:texto contra um LanguageTool local (F1a, 30/out/2026)

- **Decisão:** o `pnpm lint:texto` sobe um servidor local do LanguageTool 6.6 (distribuição oficial, conferida por SHA-256) e confere nele os textos alterados contra o merge-base com `origin/main`, nos três idiomas. Reprova só erro de gramática (issueType `grammar` ou categorias `GRAMMAR` e `AGREEMENT*`); ortografia, estilo e tipografia são avisos. Usa o Java 17+ instalado (o runner do GitHub tem) ou baixa o JRE Temurin 21 fixado. `LANGUAGETOOL_URL` aponta para outro servidor. Sem servidor, avisa e não reprova.
- **Por quê:** a página da API pública diz "Do not send automated requests" (dev.languagetool.org/public-http-api, conferida em 30/out/2026), e o CI é exatamente isso. Com servidor local não há limite por minuto, e a F1a inteira (30 arquivos, 741 textos) roda em uns 16 s.
- **Alternativa:** a API pública com os limites publicados (20 req/min, 75 KB/min, 20 KB por pedido), como diz o plano. Fica disponível com `LANGUAGETOOL_URL=https://api.languagetool.org`, se o Victor decidir assim.

## § 25 · Uma imagem por vez no motor provisório (F1a, 30/out/2026)

- **Decisão:** a página-modelo aceita uma imagem por vez (JPG, PNG ou WebP), e os textos dizem isso. Lote, ZIP, HEIC e a fila de FileCards são da F2.
- **Por quê:** o texto não promete o que o motor provisório não faz (§ 7).

## § 26 · O job de merge usa o pode-mesclar da main (F1a, 30/out/2026)

- **Decisão:** o job de merge roda o `scripts/ci/pode-mesclar.ts` tirado do commit base da PR (`git show $BASE_SHA:...`), não o da própria PR. Só a PR que cria o pipeline, sem o script na main, usa a própria cópia. A lista de arquivos vem de `git diff base...head`, sem o limite do `gh pr view --json files`. O merge usa `--match-head-commit`.
- **Por quê:** sem isso uma PR `fase-*` poderia mudar a regra que decide o próprio merge.

## § 27 · Próximo passo aponta para a home até a F2 (F1a, 30/out/2026)

- **Decisão:** o NextStepChips da página-modelo tem um chip, "More tools" / "Mais ferramentas" / "Más herramientas", para a home do idioma. A F2 troca pelos chips das ferramentas de verdade (converter em PDF, redimensionar).
- **Por quê:** só se linka página que existe (§ 6), e o evento `next_step_click` precisa ser exercitado.

## § 28 · Botão para mudar a escolha de cookies (F1a, 30/out/2026)

- **Decisão:** o aviso de cookies não volta sozinho depois da escolha, e a política de privacidade tem um botão que apaga a escolha guardada e mostra o aviso de novo.
- **Por quê:** o GDPR e a LGPD pedem que retirar o consentimento seja tão fácil quanto dar.

## § 29 · Noindex nos próprios 404 (F1a, 30/out/2026)

- **Decisão:** o `_headers` tem as regras `/404` e `/:lang/404` com `X-Robots-Tag: noindex`, que continuam depois do lançamento.
- **Por quê:** com `html_handling: "auto-trailing-slash"`, o Cloudflare responde `/404` e `/pt/404` com 200 (o `/404.html` vira 307 para `/404`), e essa página não pode ser indexada.

## § 30 · Cabeçalho provisório (F1a, 30/out/2026)

- **Decisão:** o logo é a palavra "FileOrca" em texto (a arte é da F1b); a busca é um botão com o texto visível em toda largura (o ícone sozinho no celular entra com os ícones, na F1b); o idioma abre um menu nativo (`popover`), sem JavaScript, com os links para a página equivalente.

## § 31 · Ferramentas fixadas por SHA-256 e CI fixado (F1a, 30/out/2026)

- **Decisão:** actionlint 1.7.12, LanguageTool 6.6 e o JRE Temurin 21.0.13 são baixados para `.cache/` (fora do git) por `scripts/lib/tools.ts`, que confere o SHA-256 antes de usar, em Windows e Linux; o CI guarda `.cache/` com `actions/cache`. As ações do GitHub ficam fixadas pelo SHA do commit, e o runner em `ubuntu-24.04` (o `ubuntu-latest` está migrando para o 26.04 até 19/nov/2026).

## § 32 · hreflang `pt-BR` (F1a, 30/out/2026)

- **Decisão:** o português sai como `pt-BR` no `lang` e no hreflang; o inglês como `en` (também x-default) e o espanhol como `es`.
- **Por quê:** o português do site é o brasileiro; o espanhol é neutro.

## § 33 · Sem ganho, o original volta sem metadados (F1a, 30/out/2026)

- **Decisão:** quando a cópia nova não fica menor (ou o navegador não grava o formato), o motor devolve os pixels originais com os metadados removidos sem perda (`src/engine/image/strip.ts`): no JPEG saem Exif, XMP, IPTC e comentários, ficam o perfil de cor (APP2) e, numa foto girada, um Exif mínimo só com a Orientation; no PNG saem `tEXt`, `zTXt`, `iTXt`, `eXIf` e `tIME`; no WebP saem os chunks `EXIF` e `XMP `. Quando o navegador não grava o formato (Safari com WebP), a tela diz isso e o `tool_error` sai com `reason: "encode"`.
- **Por quê:** achado da revisão adversarial: o caso sem ganho devolvia o arquivo com GPS, e a página promete que a cópia sai sem a localização.

## § 34 · Anúncio só em fileorca.com e o trilho só a partir de 1280 px (F1a, 30/out/2026)

- **Decisão:** como o `gtag.js`, o carregador do AdSense e o `push` de cada unidade só rodam quando `location.hostname === "fileorca.com"`; as prévias em *.workers.dev recebem as mesmas variáveis de build e nunca pedem anúncio. A unidade do trilho (300×600) só faz o `push` com `matchMedia('(min-width: 1280px)')`, porque abaixo disso o trilho está escondido.
- **Por quê:** achados da revisão adversarial (anúncio pedido em prévia e unidade invisível).

## § 35 · Aviso de cookies acima da âncora (F1a, 30/out/2026)

- **Decisão:** com o AdSense na página, o aviso de cookies observa a âncora (`ins.adsbygoogle[data-anchor-status="displayed"]`) e sobe a própria altura dela (`--fo-anchor`), sem nunca cobri-la nem ficar coberto.
- **Por quê:** regra do CookieNotice no design system.

## § 36 · O aviso de cookies tira o foco de baixo de si (F1a, 30/out/2026)

- **Decisão:** além do `scroll-padding-bottom`, o aviso de cookies ouve o `focusin` e, se o elemento focado ficaria sob o aviso (ou fora da tela), rola a página antes de o navegador revelar o foco, até o elemento ficar 8 px acima do aviso. Não age dentro do próprio aviso nem dentro de um `<dialog>`.
- **Por quê:** o teste de WCAG 2.4.11 falhou uma vez no WebKit do Ubuntu, no commit do relatório, com o foco no link "Compress image" do rodapé coberto pelo aviso, apesar do `scroll-padding`. Sem acesso ao trace, a run não fixou a causa exata; a garantia passou a não depender de o navegador respeitar o `scroll-padding`, e um teste novo tira o `scroll-padding` para provar isso.

## § 37 · A falha do Workers Builds era o comando de build no painel (ajuste-previa-build, 30/out/2026)

- **Decisão:** registrar a causa real e manter, por ora, o Node 24.22.2 e o pnpm 10.34.9 do § 17. Voltar ao Node 26 e ao pnpm 12 fica como decisão do Victor, numa run própria.
- **Por quê:** o comando de build salvo no painel era `pnpm buid`. Os cinco logs de prévia e de produção lidos no painel mostram a instalação ok e a parada na etapa de build, em 2 s; os dois lidos até o fim trazem `Command "buid" not found`, um deles com Node 26.13.0 e pnpm 12.16.1 (build `d925f68d`, "Done in 7.2s using pnpm v12.16.1"). A razão do § 17 (o build image não instalaria o pnpm 12) não se sustenta. Com o comando corrigido para `pnpm build`, o build de produção passou (build `a49d23cc`) e o pós-deploy ficou verde. O Node 24 e o pnpm 10 funcionam no CI e no Workers Builds, então trocar de novo não é urgente. A volta não é só uma linha: o pnpm 12 aprova os scripts de instalação por `allowBuilds`, não por `onlyBuiltDependencies`, então o `pnpm-workspace.yaml`, o `packageManager`, o `.node-version` e o cache do CI mudam juntos.

## § 38 · Bloco `previews` vazio no `wrangler.jsonc` (ajuste-previa-build, 30/out/2026)

- **Decisão:** o `wrangler.jsonc` ganha `"previews": {}` e a ADR-002 fica aceita na opção 2. O portão "worker sem código" e o teste de plataforma aceitam o campo só se for um objeto vazio.
- **Por quê:** o Worker `fileorca` está no modelo "Worker Previews", em que o build das branches roda `npx wrangler preview`, e esse comando recusa rodar sem o bloco. Trocar o comando de prévia no painel para `npx wrangler versions upload` (opção 1) não teve efeito em três builds seguidos. O Victor escolheu a opção 2 na sessão. Bloco vazio: a prévia usa as mesmas configurações da produção, e nada de código entra no Worker.

## § 39 · Conferência do design system v1.1 (F1b, 31/out/2026)

- **Decisão:** as 12 correções da lista "Correções do design system v1.1" do plano já estão em `docs/design/`. Nada foi aplicado e `docs/design/` não muda nesta run.
- **Item a item** (conferido nos arquivos, não só no `MUDANCAS-v1.1.md`):

  | # | Correção | Resultado | Onde |
  | --- | --- | --- | --- |
  | 1 | DropZone sem `role="button"` nem `tabindex`; o botão leva o `aria-describedby` | aplicada | `components/DropZone/README.md:9`, `DropZone/preview.html:15,26-27`; nenhum `role="button"` ou `tabindex` nos `*.html` |
  | 2 | WaterLevel e `fo-bar` com `aria-label` | aplicada | `WaterLevel/preview.html:15,28`; as barras de exemplo sem `role` (`WaterLevel/preview.html:29`, `FileCard/preview.html:23`) não são progressbar; no site cada `fo-bar` leva `role` e o nome do arquivo |
  | 3 | Logo `role="img"` + `aria-label="FileOrca"`; "EN" visível no nome do idioma; 48 px | aplicada | `Header/preview.html:16,24,27,35`; `bundle.css:61,262-266` |
  | 4 | ToolSearch como combobox | aplicada | `ToolSearch/preview.html:15-20,24`; `bundle.css:275-276` |
  | 5 | Rodapé com H2; título do SupportCard no nível da página | aplicada | `Footer/preview.html:17-20`; `SupportCard/README.md:7`; `bundle.css:330` |
  | 6 | Rótulo "Advertisements" / "Publicidade" / "Anuncios" em 12 px, sem `aria-label` | aplicada | `AdSlot/README.md:5-7`; `bundle.css:321` |
  | 7 | Tema escuro também por `prefers-color-scheme` | aplicada | `tokens.css:3,48,78-109`; `bundle.css:6-7`; os dois blocos escuros são idênticos |
  | 8 | Token `brand-on-deep` (#5AA2FF) | aplicada | `tokens.json:135-139`; `tokens.css:20`; 5,28:1 sobre `deep` |
  | 9 | Fala da Oli em 20/26; WaterLevel com 340 px a partir de 768 px; ano do AmortTable com 48 px | aplicada | `tokens.css:162`; `bundle.css:111,245,254` |
  | 10 | Seta como ícone `arrow-right` em `fo-icon--inline`, com "to" em `fo-sr` | aplicada | `FileCard/preview.html:18`; `bundle.css:14,16` |
  | 11 | Nenhum "up to 50" | aplicada | só a proibição em `README.md:33` |
  | 12 | Exemplos de financiamento ($1,896.20, $382,637, saldos e 15 anos) | aplicada | recalculado em centavos: `AmortTable/preview.html:17-20`, `ResultHero/preview.html:17-21`, `ScenarioCompare/preview.html:15-16` |

- **Diferenças achadas (para o Victor, sem efeito na run):**
  - O `MUDANCAS-v1.1.md` tem 13 itens, em outra ordem (o 9 do plano é o 11 dele, o 10 é o 12, o 11 é o 10 e o 12 é o 9; o 13, "notas corrigidas", não está no plano). A nota dele de que o artifact ainda mostra o v1 ficou velha.
  - O artifact do design system vivo (https://claude.ai/artifact/ECjKLGYoW4JL72TKSNWDgT) foi lido em 31/out/2026: o `tokens.json` dele tem o mesmo conteúdo do `docs/design/tokens.json` (muda só a formatação do arquivo) e o README é o mesmo, sem o parágrafo de abertura do pacote. Vale `docs/design/`.
- **Por quê:** o § 2 já registrava que o pacote veio no v1.1; o prompt da F1b manda conferir antes de implementar e só aplicar o que faltasse, num commit só.

## § 40 · O contrato medido vale mais que o `bundle.css` (F1b, 31/out/2026)

- **Decisão:** o `bundle.css` é a referência de estilo, não um import. O CSS do site traz só os componentes que existem nas páginas, com as mesmas classes `fo-*` e a marcação v1.1, em quatro arquivos que viram um CSS só por página: `src/styles/global.css` (entrada, base e molde), `theme.css` (gerado, § 41), `fonts.css` (§ 42) e `components.css`. Onde o `bundle.css` diverge do que os testes da F1a medem, vale o DECISOES: AdSlot com 300 e 644 px (§ 20; o `bundle.css` diz 280 e 624), `.fo-slot` com 380/340 px, a Oli do DropZone em `top:-86px; right:0` no celular (o molde ToolPage; o `bundle.css` diz `-58px`), o vão do trilho igual ao `ad-clearance` e as classes exatas dos testes (`fo-ad fo-ad--content`, só `fo-btn` nos botões de cookies).
- **Ajustes desta run:** a opção do OptionGroup fica com 48 px (`tap-min`), porque os 44 px do `bundle.css` só davam 48 com `content-box`, e o preflight usa `border-box`; o `.fo-top` ganha 136 px à direita a partir de 768 px, para a Oli de 112 px não cobrir o H1; o sublinhado de "link dentro do texto" vale só para `a` sem classe (link com classe é vestido pelo componente; o Breadcrumb ganhou `fo-crumbs__link`); o anel de foco da opção do OptionGroup aparece em qualquer foco do rádio (`:has(input:focus)`), porque o WebKit perde o `:focus-visible` quando a seta troca de opção, e o README pede o anel em tudo que recebe foco; o placeholder da busca usa `ink-muted` (o padrão do navegador dava 3,3:1); abaixo de 360 px o `fo-btn--lg` encolhe o respiro lateral e os textos jurídicos quebram endereço longo, para a página caber em 320 px.
- **Por quê:** decisão 1 do prompt da F1b.

## § 41 · Tema do Tailwind v4 gerado dos tokens (F1b, 31/out/2026)

- **Decisão:** `src/styles/theme.css` é gerado de `docs/design/tokens.json` por `scripts/design/tema.ts` (`pnpm design:gerar`) e nunca editado à mão: `@theme reference inline { --*: initial; --color-<x>: var(--<x>); … }`, com cores, espaçamento (`--spacing-<n>: var(--space-<n>)`), raios, sombras, as duas famílias e os easings. O tema padrão do Tailwind sai inteiro; `reference inline` não emite nada em `:root` e evita o ciclo `--radius-xl: var(--radius-xl)` que `@theme inline` emitiria; os utilitários entram com `@import "tailwindcss/utilities.css" layer(utilities) source(none)`, então nenhum arquivo é varrido e nenhuma palavra de texto vira classe (o problema do § 18). O preflight passa para `layer(base)`.
- **O amarelo fica fora do tema:** `sun`, `on-sun`, `sun-edge`, `shadow-lip-sun` e `shadow-lip-on-deep` não são mapeados, para nenhuma utilidade poder pintar amarelo; o `sun` existe só nas regras do `.fo-btn--download`.
- **Testes:** `theme.test.ts` reprova o arquivo desatualizado e compila o tema com o `tailwindcss` para provar que não sai variável nem ciclo; o portão `design` reprova, no CSS do build, variável `--color-*`, `--radius-*`, `--shadow-*` ou `--font-*` cujo valor não seja um token (ou a própria definição do `tokens.css`).
- **Alternativas:** `@theme inline` com valores literais (duplicaria os números do `tokens.css`); `@import "tailwindcss"` com `@source` restrito (comentários e textos dos componentes ainda gerariam utilitários, inclusive `transition`, que fere o § 44).

## § 42 · Fontes: só os arquivos latinos, preload da Fredoka e fallback com métrica (F1b, 31/out/2026)

- **Decisão:** `@fontsource-variable/fredoka` e `/figtree` 5.3.0 em `dependencies`, usados só pelo arquivo latino (`*-latin-wght-normal.woff2`), num `@font-face` próprio em `src/styles/fonts.css`, com os nomes `Fredoka` e `Figtree` do `tokens.css`, o `unicode-range` latino do pacote e `font-display: swap`. O CSS dos pacotes não é importado (traria latin-ext e hebrew, com os nomes "Fredoka Variable"). O `BaseLayout` faz preload só da Fredoka, importando o mesmo arquivo com `?url`: o Vite dá o mesmo nome com hash ao `url()` do CSS e ao preload (conferido no build), com `crossorigin`.
- **Fallback:** faces "Fredoka Fallback" e "Figtree Fallback" sobre `local("Arial")`, Helvetica, Liberation Sans e Roboto, com `size-adjust` 100,5 % e 99,9 % (largura de um texto de amostra nos três idiomas na fonte contra a Arial, medida nos arquivos), `ascent-override` 96,9 % e 95,1 %, `descent-override` 23,5 % e 25 % e `line-gap-override` 0 % (as métricas `hhea` divididas pelo `size-adjust`). A medida do texto também: `68ch` segue a fonte em uso, então a coluna de texto alargava uns 90 px quando a Figtree substituía o fallback (CLS de 0,14 nas páginas jurídicas, achado da revisão). O site usa `--fo-measure: calc(68 * 0.641rem)`, os mesmos 68 caracteres medidos no `0` da Figtree, que não mexe com a troca. Como o `tokens.css` não muda, as pilhas do CSS são `--fo-font-display: "Fredoka", "Fredoka Fallback", var(--font-display)` e `--fo-font-text`, derivadas do token.
- **Por quê:** decisão 3 do prompt. A API de fontes do Astro gera família com hash (`Fredoka-150d…`) e um `<style>` por página, o que quebraria o contrato do `tokens.css` e o "um CSS por página". Com as duas fontes, a página da ferramenta faz 7 requisições no WebKit (limite 8), e a home já baixa as duas, então o par home → ferramenta segue com 3 novas.

## § 43 · Sprite da Oli montado no build (F1b, 31/out/2026)

- **Decisão:** `src/oli/sprite.ts` lê `docs/design/assets/Oli/oli-*.svg` e `Logo/logo-light.svg` no build, confere a estrutura (falha com o nome do arquivo se a run 1c mudar o desenho de um jeito inesperado) e monta: um `<symbol id="oli-<pose>">` por pose; cada filho do grupo da pose que aparece igual, byte a byte, em duas ou mais das oito poses de corpo inteiro vira uma peça `oli-p<N>` (13 peças), referenciada por `<use>`; o `clipPath` `oli-clip` uma vez (é igual nas oito poses e no logo, e o build confere); a `peek` com o viewBox `0 18 128 80` e sem o `clipPath` `ic`, que nada usa. Os paths e atributos ficam como no arquivo (só os grupos vazios saem).
- **Por página:** `OliSprite.astro`, no início do `<body>`, leva só os símbolos das poses da página (o `BaseLayout` recebe `oli` e sempre acrescenta a `peek`, por causa do diálogo de busca), as peças que eles e o logo usam e o `oli-clip`. O sprite é `<svg class="fo-sprite" aria-hidden="true" width="0" height="0">`, fora da tela por CSS, nunca `display:none`.
- **Tamanho por pose** (símbolo + peças + `oli-clip`, UTF-8, sem compressão): wave 2653, gulp 2881, swim 2695, cheer 2756, oops 2813, buoy 2903, lost 3103, coffee 3079 e peek 1475 bytes; limite 4096. O `sprite.test.ts` confere os tamanhos, os nomes, os ids e a equivalência de pixels com o arquivo original no resvg (no máximo 8 pixels com diferença de canal acima de 32, em 65.536; o medido é 0 ou 1).

## § 44 · A Oli nas caixas e o movimento só em CSS (F1b, 31/out/2026)

- **Decisão:** toda caixa `[data-oli]` leva `<svg aria-hidden="true"><use href="#oli-<pose>"/></svg>`, sem viewBox no host (com viewBox a `peek` desloca 18 unidades). No `ToolPanel`, trocar a pose é trocar o `href` (`href`, não `xlink:href`, que o servidor e o cliente do Preact escrevem diferente). O `ToolPanel` exporta `PANEL_POSES` (`wave`, `gulp`, `swim`, `cheer`, `oops`), que a página põe no sprite.
- **Movimento:** só `transform`, `opacity`, `translate`, `scale` e `rotate`. A `wave` flutua em loop (`dur-float`), a `gulp` cresce 5 % (`scale`, com transição), a `swim` balança em loop, a `cheer` salta uma vez (`dur-cheer`) no ResultCard, a Placard entra com `fo-pop` e o vapor do `coffee` sobe. A água do DropZone e do WaterLevel é uma camada da altura da caixa que desce com `translateY(100% - nível)`, e a crista da onda anda com `translateX`; no WaterLevel a Oli nada dentro dessa camada e sobe junto com ela (o `bottom` animado do `bundle.css` saiu). Botões, chips, opções e DropZone trocam de cor sem transição; só o `transform` transiciona.
- **Movimento reduzido:** `animation: none` e `transition: none` em tudo, e o hover não desloca. O `bundle.css` usava 1 ms, o que deixaria animações finitas em `document.getAnimations()`.
- **Testes:** o portão `design` reprova `@keyframes` ou `transition` que mexa em outra propriedade; o `design.spec.ts` confere `getAnimations()` vazio nos estados do fluxo com `reducedMotion: 'reduce'`, e não vazio sem ele.

## § 45 · Logo, favicon e ícone do app (F1b, 31/out/2026)

- **Decisão:** o logo do `logo-light.svg` vai inline no Header (`Logo.astro`), com a Oli espelhada feita só de `<use>` das peças do sprite (sem o `<defs>` próprio, usando o `oli-clip` da página) e o texto com "File" em `var(--ink)` e "Orca" em `var(--brand)` (classes `fo-logo__file` e `fo-logo__orca`), `role="img"` e `aria-label="FileOrca"`, 38 px de altura no celular e 44 px no computador, dentro do link de 48 px. O favicon é o `app-icon.svg` em data URI; os PNG de 192 e 512 e o `apple-touch-icon` de 180 (opaco, fundo `brand`, porque o iOS preenche transparência com preto) saem do mesmo arquivo pelo resvg. O logo do Organization segue `/icon-512.png`.

## § 46 · Ícones inline (F1b, 31/out/2026)

- **Decisão:** os 35 SVG de `docs/design/assets/Icons/` entram inline, com a raiz trocada por uma nossa: `class="fo-icon"`, `stroke="currentColor"` e `aria-hidden="true"`. Nas páginas Astro, `Icon.astro` lê todos por `import.meta.glob` no servidor; na ilha, cada ícone é importado com `?raw` (só os que ela usa vão para o JS) e desenhado por `Icon.tsx` com `dangerouslySetInnerHTML`, que o Preact mantém na hidratação. Na busca, o ícone da ferramenta vem dentro do `search-index.json`, sem requisição nova. Nada de sprite externo nem pacote de ícones.
- **No celular** a busca do Header fica só com o ícone, num alvo de 48 px, e o texto "Search tools" vira texto escondido no mesmo botão, então o nome acessível não muda. Isso fecha o § 30.
- **Setas:** nenhum texto do site usa "→" nem "↔" hoje; o portão `design` reprova os dois no HTML do build. Onde houver "antes → depois" (o FileCard), a seta é o ícone `arrow-right` em `fo-icon--inline` com "to" / "para" / "a" em `fo-sr`.

## § 47 · Folha da Oli gerada do mesmo sprite (F1b, 31/out/2026)

- **Decisão:** `docs/oli/folha.html` é gerada por `scripts/design/folha.ts` (`pnpm design:gerar`) com o `spriteMarkup` do site: as nove poses em 32, 64 e 512 px sobre o fundo claro e sobre o escuro (onde o aro aparece), e o ícone do app em 16 e 32 px como `<img>` em data URI (o `ic` dele não se repete). Abre por `file://`, sem rede e sem link para outro arquivo. O `folha.test.ts` reprova a folha desatualizada.

## § 48 · SupportCard e página de apoio (F1b, 31/out/2026)

- **Decisão:** o SupportCard leva a Oli `coffee` (96 px no celular, 128 px no computador), o título no nível da página (o H1, no estilo `h1`/`h1-mobile`, e não os 22 px do `bundle.css`, porque é o título da página), o texto da tabela de Doações, um botão secundário para o `KOFI_URL` com o ícone `coffee` e os valores sugeridos em texto. Não são três botões com valores: o link do Ko-fi não leva o valor. Nenhum script ou widget do Ko-fi; o `donate_click` segue com `place: "support_page"`. "Quem está por trás" e "o que o próximo café paga" ficam abaixo do card.

## § 49 · Linha do café no ResultCard (F1b, 31/out/2026)

- **Decisão:** a linha aparece só com o arquivo pronto, depois do Baixar e das estatísticas, com o texto da tabela de Doações (sem exclamação), um botão secundário (nunca `sun`) e "Não mostrar de novo". Regra (`src/tools/compress-image/coffee.ts`): cada arquivo que chega ao resultado é um uso (trocar a opção e reprocessar não conta outro); a linha aparece no 3º uso naquele navegador e depois no máximo uma vez a cada 7 dias. A contagem fica em `localStorage["fo-coffee"]` (`{ uses, shownAt, never }`) e só é gravada com `fo-consent = "granted"`; com Recusar ou sem escolha nada é gravado e a linha não aparece. "Não mostrar de novo" é gravado sempre, porque é pedido da própria pessoa.
- **Quem bloqueia anúncio** vê a linha já no 1º uso (com o Aceitar), só quando as três variáveis do AdSense estão preenchidas no build, no fileorca.com, e o carregador do AdSense não rodou (`adsbygoogle.loaded`) ou a unidade de conteúdo ficou com altura 0. Testado na regra pura (`coffee.test.ts`); no navegador não dá para provocar, porque o anúncio só roda em fileorca.com (§ 34).
- **Só ganho de verdade conta:** um arquivo que voltou "já otimizado" ou que o navegador não grava não conta como uso nem mostra a linha (ela diz "se te ajudou"); se a opção Forte depois o deixa menor, aí ele conta.
- **Consentimento retirado:** sem o Aceitar, a página da ferramenta apaga a contagem guardada ao abrir e a cada uso, e só o "não mostrar de novo" fica. Quem recusa na página de privacidade fica com a contagem até abrir uma ferramenta (sem uso nenhum dela nesse meio-tempo), porque o script do aviso de cookies é da camada de consentimento, fora desta run.
- **Altura:** no uso em que a linha aparece, o card passa dos 380/340 px reservados do § 20 e empurra as opções para baixo. Acontece no máximo uma vez por semana, depois de a pessoa soltar o arquivo, e o Baixar não se move; reservar a altura em todo resultado deixaria um vazio nos outros usos.
- **Destino:** em inglês e espanhol, o Ko-fi; em português, até a F6 trazer o Pix, "Apoiar com um café" leva a /pt/apoie/. O clique manda `donate_click` com `place: "result"` (já estava na lista fechada do § 10).
- **Política de privacidade:** a seção da escolha de cookies ganhou, nos três idiomas, um parágrafo dizendo que, com o Aceitar, o site conta ali os arquivos terminados para o pedido de café, e que essa contagem fica só no navegador e nunca sai dele.

## § 50 · Imagem de Open Graph com o logo e a Oli (F1b, 31/out/2026)

- **Decisão:** a mesma imagem por página indexável e idioma do § 21 (24 imagens de 1200×630), agora com o logo escuro (`logo-dark.svg`) no topo, o título em Fredoka 600 e o subtítulo em Figtree 400 (os `.woff` estáticos de `@fontsource/fredoka` e `@fontsource/figtree`, em `devDependencies`) e a Oli `wave` original num disco `water` (o do tema escuro) à direita. Na Compress image, o ícone `compress` num quadrado `turquesa` fica ao lado da Oli. Sem desenho novo da Oli; só cores de token.
- **Atualiza o § 21:** o satori 0.63.2 lê woff2; o `.woff` segue por ser o que a F1a já usava. Só o subconjunto latino está carregado; um título fora dele pediria o `latin-ext`.

## § 51 · Screenshots fora do verificar (F1b, 31/out/2026)

- **Decisão:** `pnpm screenshots` (`scripts/screenshots.ts`) gera, sobre o `dist/` e com o Chromium do Playwright, um PNG por componente e por tema a 360 px (Header, Footer e a página da ferramenta também a 1280), recortado no elemento, com `deviceScaleFactor` 1 e movimento reduzido, em `docs/relatorios/fase-01b/`. Os estados saem do fluxo real (arrastar por cima, arquivo que não é imagem, motor segurado para o WaterLevel aparecer, foto real, 3º uso com o Aceitar para a linha do café). O FileCard e o OliMessage, que nenhuma página usa ainda, saem da marcação do `preview.html` deles com o CSS do build. Nenhum gancho de teste no código do site. Não entra no verificar, porque a imagem muda entre Windows e Ubuntu.

## § 52 · Testes de qualidade com o mesmo alcance (F1b, 31/out/2026)

- **Decisão:** a lista esperada de `browserPackages()` ganha `@fontsource-variable/figtree` e `@fontsource-variable/fredoka` (dependência nova legítima, que vai ao navegador; a /licenses lista as duas com OFL-1.1). O teste do amarelo passa a ler todo `src/styles/*.css` e os `<style>` dos `.astro`, e pega a família inteira (`sun`, `on-sun`, `sun-edge`, `shadow-lip-sun`, `shadow-lip-on-deep`); o de hex continua lendo todo `.css`, `.astro` e `.tsx` de `src/`. Nenhum limiar, orçamento ou lista da F1a mudou.
- **Portão novo:** `pnpm gate:design` entra no verificar depois dos links e confere, no build, um CSS por página, o sprite (ids únicos, `oli-clip` uma vez, sem `ic`, poses da lista, `[data-oli]` com `aria-hidden` e o `<use>` certo, símbolos das poses que a página usa), as fontes (dois woff2 latinos, preload só da Fredoka com a mesma URL), as variáveis do tema, o movimento e as setas. O `color:` só com tokens de texto é conferido no CSS de `src/styles/` (no build, o preflight do Tailwind traz um `color-mix` no `::placeholder`). O Lighthouse ganha a asserção de CLS ≤ 0,05, e o portão reprova se o elemento LCP for a Oli.

## § 53 · FileCard e OliMessage prontos, sem uso em página (F1b, 31/out/2026)

- **Decisão:** o FileCard é um componente Preact (`src/components/FileCard.tsx`), porque a fila da F2 vive na ilha da ferramenta: estados pronto (tamanhos com a seta-ícone e o ganho em `success` com `check`), processando (`fo-bar` com `role="progressbar"` e o nome do arquivo, preenchida por `scaleX`) e erro (`danger-soft`, ícone `alert`), com os botões de linha nomeados pelo arquivo. O CSS do OliMessage também fica pronto para os avisos e a tela offline. Nenhum dos dois aparece numa página nesta fase.

## § 54 · ResultCard no celular segue o molde ToolPage (F1b, 31/out/2026)

- **Decisão:** abaixo de 768 px o ResultCard usa o molde do celular: Oli de 72 px, fala em 18/24 px, Baixar em bloco e "Start over" centralizado; a Placard fica escondida (o número já está na fala da Oli, e com ela o card passaria dos 380 px reservados do § 20). A partir de 768 px entram a Oli de 96 px, a fala em 20/26 e a Placard girada.
- **Por quê:** o `ToolPage/preview.html` do celular não tem a Placard, e o § 20 reserva o mesmo retângulo para os três estados.

## § 55 · O elemento LCP da página-modelo é o texto do aviso de cookies (F1b, 31/out/2026)

- **Registro:** o Lighthouse não dispensa o aviso de cookies, e o parágrafo dele é o maior bloco de texto da primeira tela a 360 px (já era assim na F1a). O portão confere que o LCP não é a Oli nem um SVG; o H1 e a DropZone seguem sendo os maiores elementos do conteúdo. Fazer o LCP voltar ao H1 mexeria no aviso de consentimento, que está fora desta run.

## § 56 · Oli de 96 px nos heróis do celular (F1b, 31/out/2026)

- **Decisão:** na home, no 404 e no SupportCard a Oli tem 96 px abaixo de 768 px e 128 px a partir daí. O README da Oli pede 128 px ou mais nesses lugares; a 360 px, 128 px deixariam menos de 190 px para o H1 ao lado. 96 px está na faixa da DropZone e do ResultCard (88 a 112 px) e segue lendo bem.

## § 57 · axe com movimento reduzido e o estado do café pronto nos testes que só precisam dele (F1b, 31/out/2026)

- **Decisão:** o `a11y.spec.ts` roda com `reducedMotion: 'reduce'`, com o mesmo alcance (27 páginas, 360 e 1280 px, dois temas, os mesmos estados e as mesmas regras do axe). Os testes de axe e de distância dos anúncios que só precisam da linha do café na tela chegam a ela com o Aceitar e uma contagem de dois usos no `localStorage`, num envio só; a regra do café segue testada uso a uso no `coffee.spec.ts`.
- **Por quê:** no runner do CI, as páginas com a Oli em loop deixaram o axe 1,8 a 3 vezes mais lento que na F1a, e o `pnpm verificar` foi a 758 s (limite 900), com a variação de uns 25 % entre execuções que a F1a já tinha visto. O site só anima `transform` e `opacity`, então as cores que o axe confere são as mesmas, e com a página parada o resultado não depende do quadro da animação. O movimento é testado à parte no `design.spec.ts`.
- **Alternativa:** mais workers no CI (o runner tem poucos núcleos e a F1a escolheu 2 por estabilidade) ou cortar casos do axe (reduziria o alcance).

## § 58 · Português e espanhol no ar; ferramenta que só existe em inglês (F2, 31/out/2026)

- **Decisão:** as páginas que já existem em português e espanhol seguem no mapa de rotas e passam a ser indexadas no lançamento (decisão do Victor ao gerar o prompt da F2, 31/out/2026; fecha a "Nota para a F2" da F1a). Nenhuma página nova nasce nesses idiomas. As nove ferramentas novas, os três presets e o hub `/image-tools/` têm rota só com `en`; os textos ficam em `src/tools/<slug>/i18n/en.ts` e `src/tools/<mãe>/presets/<nome>/i18n/en.ts`, e os tipos deixam a ferramenta existir só em inglês (`EnCommonTexts` exige todas as ferramentas; `CommonTexts` de pt e es só a Compress image). A Compress image em pt e es usa o motor e a ilha novos, com os textos de lote, ZIP e formatos reescritos e sem a frase "uma de cada vez" do § 25. Os chips dela seguem com o "Mais ferramentas" do § 27, e o breadcrumb segue sem hub (§ 6).
- **Por quê:** é a decisão do Victor; texto de enfeite em pt e es para página que não existe seria conteúdo vazio.
- **Alternativa:** tirar pt e es do mapa até a F6 (perderia as páginas que já existem).

## § 59 · O que cada ferramenta aceita e entrega; o tipo vem dos bytes (F2, 31/out/2026)

- **Decisão:** a tabela da decisão 2 do prompt vira o registro `src/tools/image/registry.ts` (aceita, ícone, chips, relacionadas, BeforeAfter, PDF), lido pelas páginas, pela ilha, pela busca, pelo hub e pelos testes. O formato sai sempre da assinatura dos bytes (`src/engine/image/sniff.ts`), nunca da extensão: um PNG chamado `.jpg` é tratado como PNG e a saída leva a extensão certa. No `ftyp`, AVIF pela marca principal `avif`/`avis`; HEIC por `heic/heix/heim/heis/hevc/hevx`; com `mif1`/`msf1`/`miaf`, pelas marcas compatíveis e, se aparecerem as duas famílias, pelo tipo do item primário (`av01` × `hvc1`/`grid`). Arquivo vazio, que não é imagem ou de formato que a ferramenta não aceita é recusado na linha dele com a fala da Oli, o nome e o que fazer; o resto do lote segue. As ferramentas gerais (Compress, Resize, Crop, Rotate e Image to PDF) recusam HEIC e AVIF com o link para a HEIC to JPG ou a AVIF to JPG. Ícones: `compress`, `resize`, `crop`, `rotate`, `convert` (as cinco conversões) e `pdf`; nenhum ícone novo.
- **Por quê:** simplicidade e o tempo do CI (cada HEIC aceito numa ferramenta geral seria mais um decodificador WASM de 12 MP por navegador). A aceitação de HEIC e AVIF nas ferramentas gerais fica para rever depois do lançamento, com o `tool_error` do GA4.
- **Alternativa:** aceitar HEIC em todas (mais WASM e mais CI) ou confiar na extensão (erra com arquivo renomeado).

## § 60 · YouTube thumbnail: 1280 × 720, conferido na ajuda oficial (F2, 31/out/2026)

- **Decisão:** o preset `/resize-image/youtube-thumbnail/` entrega 1280 × 720 em JPG de até 2.000.000 bytes, com corte central para preencher o 16:9 e uma linha que diz isso, com o chip da Crop image. A ajuda oficial (https://support.google.com/youtube/answer/72431, lida com WebFetch em 31/out/2026) hoje pede 16:9, pelo menos 640 px de largura, JPG ou PNG e até 2 MB no envio pelo celular (50 MB no computador), e recomenda 3840 × 2160 para vídeos. 1280 × 720 cabe em todas essas regras e é o tamanho que o prompt e o critério 7 pedem. Foto menor que 1280 × 720 é aumentada para o quadro, e o resultado diz isso.
- **Por quê:** o critério da run é 1280 × 720 e ele respeita a fonte oficial; 3840 × 2160 em JPG passaria dos 2 MB do celular com frequência.
- **Alternativa:** seguir a recomendação nova de 3840 × 2160 (pendência para o Victor decidir, no relatório).

## § 61 · Motor: só a build de uma thread de cada codec, carregada no primeiro uso (F2, 31/out/2026)

- **Decisão:** o motor (`src/engine/image/`) importa direto a cola de uma thread de cada pacote: `@jsquash/jpeg/codec/{dec,enc}`, `@jsquash/webp/codec/dec` e `codec/enc/webp_enc_simd.js`, `@jsquash/avif/codec/{dec,enc}/avif_*.js` (nunca `avif_enc_mt`), `@jsquash/oxipng/codec/pkg/` (nunca `pkg-parallel`), `@jsquash/resize/lib/resize/pkg/` (nunca o índice, que traz hqx e magic-kernel) e `libheif-js/libheif-wasm/libheif.js`, cada um com o `.wasm` por `?url` (o Vite copia o arquivo sem alteração). Cada codec é um `import()` dentro do worker, feito quando chega o primeiro arquivo que precisa dele; `warm()` só busca e compila, quando o ponteiro entra na zona ou o botão recebe o foco. Nenhum worker, codec ou `.wasm` entra no JS inicial. O codificador WebP é só o SIMD (Safari 16.4 em diante; sem SIMD a saída é `cannot-encode` e volta o original sem metadados). A regra de "pasta autocontida" do ESLint passa a valer também para `src/engine/pdf/`.
- **Por quê:** importar o índice ou o `encode.js` dos pacotes põe no `dist/` as builds de várias threads (3,5 MB do AVIF), o `pkg-parallel` do OxiPNG e a string `SharedArrayBuffer` do `wasm-feature-detect` (medido na exploração). Sem COOP/COEP essas builds nunca rodariam, mas iriam ao `dist/` e ao /licenses.
- **Alternativa:** os índices dos pacotes com um alias no Vite (mais frágil) ou também o WebP sem SIMD (+281 KB para navegadores de antes de 2023).

## § 62 · Qualidade e esforço dos codificadores (F2, 31/out/2026)

- **Decisão:** Compress: MozJPEG com qualidade 75 (Recommended) e 55 (Strong), progressivo; WebP do jSquash 75 e 55; PNG sem perda pelo `strip` + OxiPNG sobre os bytes (nível 2 até 4 MP, nível 1 acima), sem decodificar. Conversões: o `toBlob` nativo, com o jSquash quando o tipo devolvido não é o pedido. AVIF: sempre o jSquash, qualidade 50 (Recommended) e 35 (Strong), **velocidade 9**. Medido numa foto de 12 MP (Ryzen 5 7600X, Node; os workers do Chromium e do WebKit ficaram a 10 % disso): velocidade 10 = 1,3 s; 9 = 0,9 s (632.681 bytes); 8 = 2,5 s (600.699 bytes, 5 % menor); 7 = 4,7 s; 6 (padrão da biblioteca) = 9,4 s. Num notebook comum (2 a 4 vezes mais lento) a velocidade 9 fica em 2 a 4 s por foto de 12 MP.
- **Por quê:** a velocidade 8 custaria 2,7 vezes o tempo por 5 % de bytes; a 6 levaria meio minuto num notebook. MozJPEG 75 equivale, a olho, ao JPEG 0,82 do motor provisório, com arquivo menor.
- **Alternativa:** velocidade 8 (mais lenta) ou 10 (igual em bytes e mais lenta que a 9 nesta build).

## § 63 · HEIC: nativo só com as dimensões do contêiner; libheif com P3 → sRGB (F2, 31/out/2026)

- **Decisão:** a HEIC passa primeiro pelo `createImageBitmap`; o resultado só vale se a largura e a altura forem as que o contêiner declara (`ispe` do item primário com `irot`, lido por `src/engine/image/bmff.ts`). Senão, o `libheif-js` (`wasmBinary` buscado do `.wasm` separado, imagem escolhida por `is_primary()`: a ordem é a dos ids, e a `heic-10` com o `pitm` trocado prova isso). A Orientation do Exif da HEIC nunca é aplicada: o libheif já aplica `irot`/`imir`/`clap`, e o nativo é conferido pelas dimensões (a armadilha da `heic-05` e da `heic-09`). Os pixels do libheif e do decodificador AVIF do jSquash vêm sem conversão de cor; quando o `colr` traz um perfil Display P3 (8 das 10 HEIC), o motor converte para sRGB (curva sRGB, matrizes do CSS Color 4 em luz linear, tabelas), e a saída sai sem o perfil P3. O libavif não aplica `irot`/`imir`/`clap`: o motor aplica depois do decodificador. Nenhum dos dois navegadores do Playwright no Windows decodifica HEIC: a matriz cobre o libheif nos dois; o caminho nativo é coberto pelo Vitest com decodificadores falsos e fica para o Victor conferir num Safari.
- **Por quê:** um Safari que aplicasse a Orientation do Exif por cima do `irot` entregaria a foto deitada; conferir pelas dimensões pega esse caso sem gancho de teste.
- **Alternativa:** sempre o libheif (1,4 MB a mais no Safari, que decodifica HEIC sozinho).

## § 64 · Truncado e corrompido reconhecidos pela estrutura (F2, 31/out/2026)

- **Decisão:** antes de decodificar, `src/engine/image/structure.ts` confere o arquivo: JPEG caminhado pelos segmentos e pelos dados entre marcadores até o `EOI` (bytes depois do `EOI` são aceitos: as fotos "motion" do Pixel guardam um vídeo ali); sem `EOI` → `truncated`; marcador ruim, comprimento além do fim ou `SOS` sem `SOF` → `decode`. PNG até o `IEND`; WebP pelo tamanho do RIFF; HEIF e AVIF pelas extensões do `iloc`. Um corte dentro de um segmento de cabeçalho conta como dano (`decode`). A fixture corrompida tem o primeiro DQT apontando para dentro da imagem e a altura do SOF zerada: os dois navegadores a recusam e o motor também.
- **Por quê:** o Chromium recusa o JPEG truncado e o WebKit decodifica a parte de cima sem erro (medido); o libheif e o decodificador JPEG do jSquash também aceitam arquivo cortado. Pela estrutura, o resultado é igual em todo navegador e o lote segue.
- **Alternativa:** confiar no erro do decodificador (cada navegador faria uma coisa) ou no aviso "Premature end of JPEG file" do `printErr` (só no caminho do jSquash).

## § 65 · Caminho sem canvas acima de 16.777.216 px (F2, 31/out/2026)

- **Decisão:** a escolha é pelo número de pixels de exibição, igual em todo navegador (`src/engine/image/choice.ts`, testada no Vitest: 4096 × 4096 vai pelo canvas, 4097 × 4096 não). Acima do limite: decodificador do jSquash (JPEG com a orientação aplicada, WebP, AVIF) ou libheif → `ImageData` → corte, giro e espelho em código próprio → `@jsquash/resize` (lanczos3, só o pacote `lib/resize/pkg`) → MozJPEG, WebP ou OxiPNG. PNG acima do limite não tem decodificador entre as dependências permitidas: a Compress não precisa (o OxiPNG trabalha nos bytes), as outras ferramentas recusam com `too-large`; WebP animada acima do limite também é `too-large` (o decodificador do jSquash não lê animação). Abaixo do limite, os pixels que vieram de WASM voltam para um canvas, e as conversões usam os codificadores nativos. A redução no canvas é feita por metades (o Safari serrilha reduções maiores que 2×).
- **Por quê:** o limite é o do Safari no iPhone, e as fotos de 24 MP dos iPhones recentes passam dele; escolher pelos pixels faz os dois caminhos rodarem no Chromium e no WebKit do CI.
- **Alternativa:** um decodificador de PNG próprio sobre o `fflate` (mais código no motor) ou deixar o caminho sem canvas só na Compress e na HEIC to JPG (a válvula (a), que não foi preciso usar).

## § 66 · Tamanho-alvo sem recodificar a foto inteira (F2, 31/out/2026)

- **Decisão:** `src/engine/image/target.ts` mede bytes por pixel em quatro ladrilhos da foto na resolução original, estima a escala (expoente de densidade 0,85, depois 0,7 nas novas tentativas, margem de 0,92), reduz a imagem uma vez e faz a busca binária da qualidade do MozJPEG (40 a 90, no máximo 6 tentativas) sobre a imagem reduzida; se nem a qualidade 40 cabe, reduz mais (até 3 vezes) e o resultado diz as dimensões novas; depois disso, falha com `encode`. Arquivo que já cabe volta pelo `strip`, no formato dele (`fits`). A transparência vira branco (a nota `flattened`). Com um codificador falso, o Vitest prova que a foto de 12 MP é codificada no tamanho original no máximo uma vez.
- **Por quê:** a decisão 5 do prompt; recodificar 12 MP várias vezes levaria dezenas de segundos num celular.
- **Alternativa:** busca da qualidade na foto inteira (lenta) ou escala fixa por faixa de tamanho (erra muito com fotos de detalhe diferente).

## § 67 · Fixtures geradas e o oráculo (F2, 31/out/2026)

- **Decisão:** `scripts/fixtures/generate.ts` (`pnpm fixtures`) gera, de forma determinística, as 12 fixtures `gen-*` a partir da F0 (Chromium do Playwright para desenhar e codificar, montagem de bytes no Node e o codificador AVIF do jSquash no Node), e `fixtures/images/expected.json` é o oráculo das 25 (dimensões de exibição e gravadas, Orientation, GPS, transparência, número de imagens, dados do contêiner HEIF e o resultado esperado). As variantes 6 e 8 levam o APP1 original com o GPS e só o valor da Orientation trocado (um byte de diferença, provado no teste). O `hasGps` do oráculo é "a tag de GPS existe"; o `gpsKind` diz se ela é real, zerada (`heic-10`) ou vazia. A `heic-09` tem a tag de GPS vazia, ao contrário do que o ORIGEM diz na conferência; o ORIGEM fica como está (só linhas novas em "Gerados por script") e o oráculo registra a divergência. O CI nunca regenera as fixtures: os arquivos commitados e os SHA-256 do ORIGEM são a verdade.
- **Por quê:** a decisão 11 do prompt. O `createImageBitmap` com `imageOrientation: 'none'` ainda aplica a Orientation nos dois navegadores (medido), então a referência em pé dos testes é montada decodificando uma cópia com a tag trocada para 1 (`withOrientation` em `tests/e2e/lib/jpeg.ts`) e girando os pixels no próprio teste, sem o código em teste.
- **Alternativa:** decodificar a referência com o jSquash nos testes (usaria a mesma biblioteca do motor).

## § 68 · Portão de conteúdo mínimo (F2, 31/out/2026)

- **Decisão:** `pnpm gate:conteudo` (`scripts/gates/conteudo.ts`, checagens puras em `scripts/lib/conteudo.ts`, provadas uma a uma em `tests/unit/conteudo.test.ts`) roda depois dos links. Toda página de `IMAGE_PAGES` (as 13 em inglês e a Compress image em pt e es) precisa dos blocos `data-content`: "how" com uma `ol` de pelo menos 3 itens, "specs" com uma tabela com linha de corpo, "faq" com pelo menos 4 `details` com pergunta e resposta, "privacy" com texto e "related" com pelo menos um link. Cada preset precisa de 3 blocos cujo texto normalizado não aparece na página-mãe nem nos presets irmãos. No site inteiro (menos os 404), título e descrição não se repetem, e o texto visível não tem "coming soon", "em breve", "próximamente", "lorem", "ipsum", "placeholder text", "más adelante", "more tools are coming" nem os equivalentes em pt e es; "TODO" e "TBD" só em maiúsculas ("todo" é palavra comum em pt e es). O portão também falha se uma página do registro não existe no `dist/`. O `lint:texto` pulava os textos dos presets; o filtro foi corrigido e testado (`tests/unit/lint-texto-files.test.ts`).
- **Por quê:** a decisão 10 do prompt, no molde do portão de dinheiro e saúde (§ 52 e `scripts/lib/ymyl.ts`).
- **Alternativa:** checar pelo texto das seções (quebraria com qualquer revisão de texto).

## § 69 · Uma ilha para as dez ferramentas e os presets (F2, 31/out/2026)

- **Decisão:** `src/tools/image/ImagePanel.tsx` é a ilha de todas as ferramentas de imagem. Cada ferramenta entrega um `ImageTool<S, O>` (`src/tools/image/types.ts`): `operation(estado, arquivo)` diz ao motor o que fazer, `Options` desenha as opções, e `warm`, `success`, `pdfSize` e `selectable` cobrem o resto. O estado é um modelo mutável redesenhado por `render()`. Um arquivo só volta ao motor quando `JSON.stringify(operation)` muda, o que já dá três regras: trocar o papel do PDF só refaz o PDF; no Crop, só a foto com a caixa editada roda de novo; arquivo que falhou não é tentado de novo, a não ser que a falha tenha sido `encode` ou `too-large`. Os arquivos passam um de cada vez pelo worker, ou pela página quando o worker não tem `OffscreenCanvas` (§ 22). A fila só aparece com 2 arquivos ou mais (um arquivo mantém o visual da F1b) e mostra 6 linhas mais "Show N more". Um arquivo baixa direto. Dois ou mais viram um ZIP sem compressão montado no worker (`fflate`), com nomes únicos (" (2)", " (3)") e o nome do ZIP em inglês nos três idiomas. Enquanto o ZIP é montado, o WaterLevel fica com `aria-busy`, e o Download só aparece quando o ZIP existe: o cartão nunca mostra um Download desligado. Mudar uma opção processa o lote de novo e deixa o foco na opção; o foco só vai para o Download num lote novo. Se todos os arquivos falham, volta o erro da DropZone da F1b. Num lote misto, as falhas viram linhas de erro e o resto sai. O WaterLevel só aparece depois de 400 ms e leva a contagem ("0%, 0 of 3 images").
- **Por quê:** a decisão 2 do prompt (uma ilha só, com a mesma fila e o mesmo cartão). Comparar a operação serializada evita uma regra de "o que mudou" em cada ferramenta.
- **Alternativa:** uma ilha por ferramenta, como na F1b (dez cópias do lote, da fila e do ZIP), ou um ZIP comprimido (as imagens já vêm comprimidas e o tempo dobraria).

## § 70 · Duas peças de JS por página de ferramenta (F2, 31/out/2026)

- **Decisão:** o grupo `island` do Rolldown (`astro.config.ts`, que antes se chamava `preact-runtime`) junta o Preact, `src/tools/image/*` (menos `engine-client` e `pdf-client`), o FileCard, os ícones, a formatação, a análise e os SVG `?raw`. Toda página de ferramenta e de preset carrega exatamente 2 arquivos JS antes do primeiro uso: o `mount` da ferramenta e o grupo. Medido: 18,5 a 21,2 KB gzip, 6 requisições no Chromium e 7 no WebKit, e 2 requisições novas na próxima página de ferramenta. O `src/tools/crop-image/box.ts` tem a própria conta da caixa centrada, presa à do motor por uma varredura no Vitest, porque importar `centeredBox` do motor criava um terceiro arquivo (`geometry-*.js`). O `warm` (busca do codec quando o ponteiro passa pela zona) é vazio nas ferramentas do caminho nativo, `['heic']` na HEIC to JPG e `['jpeg']` no preset do YouTube.
- **Por quê:** o orçamento de 8 requisições na primeira página e de 3 novas na seguinte (§ 50). Aquecer os codecs de WebP e AVIF ao passar o ponteiro custaria mais de 1 MB para quem só olha.
- **Alternativa:** um grupo por ferramenta (o código comum seria baixado de novo em cada página) ou aquecer todos os codecs (gasto de dados sem uso).

## § 71 · Eventos e café por lote (F2, 31/out/2026)

- **Decisão:** um `tool_start` e um `tool_complete` por lote; um `tool_error` por arquivo que falha. O `tool` é o id da página no registro (ferramenta ou preset), nunca um nome de arquivo. O `outcome` sai de uma lista fechada (`smaller`, `unchanged`, `converted`, `resized`, `cropped`, `rotated`, `pdf` e `failed` quando nada saiu); o `reason` vem do motor (`empty`, `unsupported`, `wrong-tool`, `truncated`, `decode`, `encode`, `too-large`); o `codec` é o formato lido dos bytes, também numa lista fechada. O `cleanParams` agora descarta, além do parâmetro fora da lista, o valor fora das listas fechadas. O `next_step_click` leva o id da ferramenta de destino ou `home`. O café conta um uso por lote que deu uma saída de verdade.
- **Por quê:** a decisão 8 do prompt e a regra de nenhum número digitado nem nome de arquivo em evento (§ 10). Um lote de 40 fotos não pode virar 40 usos nem 40 `tool_complete`.
- **Alternativa:** um `tool_complete` por arquivo (estoura a cota do GA4 e mistura lote com uso).

## § 72 · Antes e depois (F2, 31/out/2026)

- **Decisão:** `src/tools/image/BeforeAfter.tsx` mostra a mesma foto antes e depois, com um divisor que se arrasta e um controle de teclado. O registro diz onde ele aparece: `always` (Compress e os três presets, PNG incluído), `lossy` (os quatro conversores e o Convert to WebP/AVIF, quando a saída é JPG, WebP ou AVIF) ou `never` (Resize, Crop, Rotate e Image to PDF, em que a geometria muda ou não há perda). Só aparece com um arquivo novo (`outcome: 'new'`). No lote, mostra a foto escolhida na fila: a miniatura de cada linha é o botão "Show {nome}" (`aria-pressed`), e a linha escolhida ganha a borda de 3 px da marca. A posição (dentro do cartão a partir de 768 px, abaixo dele no celular) é decidida por `matchMedia`, não por CSS: um elemento só não sai e entra no cartão, e a proporção vem da imagem de verdade, então o Download não se mexe.
- **Por quê:** a decisão 6 do prompt e o molde do design (o Download não pula, CLS).
- **Alternativa:** dois elementos alternados por CSS (duas imagens decodificadas e o dobro de memória no celular).

## § 73 · Resize e o campo de número (F2, 31/out/2026)

- **Decisão:** a Resize sem toque nenhum entrega 50%, e os campos mostram a metade da primeira foto. Os campos só passam a valer como caixa na primeira edição ou na troca de modo. "By size" encaixa cada foto na caixa sem nunca aumentar; o motor responde `fits` com a nota `not-enlarged` quando a caixa é maior. O `NumberField` aceita só inteiros, aplica depois de 500 ms parado ou ao sair do campo, usa `inputmode=decimal`, mostra o erro com `role=alert` e `aria-describedby` e guarda o último resultado válido enquanto o valor está errado. O limite é 20.000 px, mostrado com a formatação do idioma. O valor digitado nunca vai para a URL nem para um evento (testado em `image-smoke.spec.ts`).
- **Por quê:** a decisão 4 do prompt. Preencher os campos e reprocessar a primeira foto quando o tamanho chega tirava o foco do Download.
- **Alternativa:** campos vazios até a primeira edição (a ferramenta não daria resultado na hora).
- **Consequência:** num lote de tamanhos misturados sem toque, cada foto sai com 50% dela, não com uma caixa comum.

## § 74 · Crop: caixa por foto, teclado e alças (F2, 31/out/2026)

- **Decisão:** Square (o padrão), 4:5, 16:9 ou Free, com o editor e quatro campos. A caixa é um grupo focável chamado "Crop area", descrito pela ajuda de teclado: as setas movem 1% da foto, e Shift com as setas redimensiona em volta do centro. A ferramenta recebe a caixa ao soltar o ponteiro ou 350 ms depois da última tecla. Cada foto guarda a própria caixa; trocar a proporção limpa as caixas. No Free, a foto escolhida fica com a caixa atual e as outras saem inteiras, porque sem caixa e sem proporção o motor devolve a imagem toda. Os campos mostram a caixa já aplicada, não o rascunho, e os limites deles mudam para a caixa não sair da foto. As quatro alças são `span` de 48 px com `aria-hidden`, porque os textos não têm nome para alça: o caminho acessível é a caixa mais os campos. Pelo ponteiro e pelas teclas, cada lado fica com pelo menos 2% do lado menor; pelos campos, com 1 px. O `.fo-crop` não usa `touch-action: none`: fora da caixa, o dedo rola a página.
- **Por quê:** a decisão 3 do prompt e o critério de teclado (WCAG 2.1.1 e 2.5.7).
- **Alternativa:** uma caixa para o lote inteiro (fotos de proporção diferente sairiam cortadas fora do lugar).

## § 75 · Lançamento: `LAUNCHED = true` (F2, 31/out/2026)

- **Decisão:** a F2 muda `LAUNCHED` para `true` em `src/platform/site.ts`. O `_headers` deixa de mandar `X-Robots-Tag` em fileorca.com; o `noindex` continua em todo `*.workers.dev` e nas páginas `/404`, `/pt/404` e `/es/404`. O `pos-deploy.test.ts` passou a testar a regra de antes do lançamento num commit fixo que ainda a tem (`503b8c3`, o último da main com `LAUNCHED = false`; o CI clona o histórico inteiro), e a de depois no `HEAD`. O teste "keeps LAUNCHED false in the F1a" virou "LAUNCHED is true, and it was false before". O teste de cabeçalhos do `navigation.spec.ts` agora exige a ausência do `X-Robots-Tag` nas páginas e o `noindex` nos três 404. O pós-deploy (`scripts/ci/pos-deploy.ts`, que esta run não toca) avisa o IndexNow só das URLs que mudaram.
- **Por quê:** a decisão 1 do prompt (o site lança nesta PR, com a meta de 8/nov). O pós-deploy lê o `LAUNCHED` do commit que ele confere, então o merge desta PR é o lançamento.
- **Alternativa:** um commit de lançamento numa PR separada (o prompt fecha a run numa PR só).

## § 76 · axe uma vez por página e os estados no mesmo carregamento (F2, 31/out/2026)

- **Decisão:** no `a11y.spec.ts`, cada página carrega uma vez por navegador, e o axe roda nas quatro combinações (360 e 1280 px, temas escuro e claro) trocando o viewport e o `prefers-color-scheme` no lugar. Os estados novos (fila com linhas prontas e com erro, cartão do lote, comparação, WaterLevel com linhas esperando) fazem o mesmo: chegam ao estado uma vez e rodam as quatro combinações. Os estados de opção das ferramentas (editor do Crop, campos da Resize com erro, opções do Image to PDF, do Rotate e do Convert) estão no `image-smoke.spec.ts`, no teste da própria ferramenta. Nenhuma regra, tag ou limiar do axe mudou.
- **Por quê:** o site não decide layout nem tema por script na carga, então redimensionar e trocar o tema no lugar dá a mesma página que uma carga nova. Antes, eram quatro cargas por página: com 39 páginas, o axe sozinho passaria do tempo do CI (o orçamento do prompt e a § 57).
- **Alternativa:** dividir o Playwright em fragmentos (mexe no `.github/`, fora desta run).

## § 77 · Hub, home e rodapé pelo mapa de rotas (F2, 31/out/2026)

- **Decisão:** o hub `/image-tools/` (`src/views/ImageToolsView.astro`) tem o `fo-hubband` com sobretítulo, H1 e uma linha, a grade das dez ferramentas, um AdSlot de conteúdo depois da grade, a tabela dos três presets (`presetsCaption` e `presetsHead` entraram no `ImageToolsTexts`) e o AdSlot do trilho, como nas ferramentas. O schema é `BreadcrumbList` mais `CollectionPage` (`collectionPageLd` em `src/seo/meta.ts`), sem hreflang (a página só existe em inglês). Os textos vêm direto do arquivo em inglês, sem entrada no `TEXTS`. A home em inglês mostra os dez cartões e um link para o hub (`.fo-more`, regra nova para link debaixo de grade; `HomeTexts.hubLink` é opcional e só existe em inglês). As homes de pt e es seguem só com a Compress image, sem link para o hub: a home monta um cartão só para ferramenta com caminho no idioma. No rodapé, a coluna Image lista em inglês o hub e as dez ferramentas (11 links), e em pt e es só a Compress image. Nada de anúncio na home. O `ads.spec.ts` confere no hub um AdSlot de conteúdo debaixo da grade, nas duas larguras; não há painel, campo, Download nem Oli para medir os 150 px.
- **Por quê:** a decisão 9 do prompt e a § 58 (nenhum texto em pt ou es para página que só existe em inglês).
- **Alternativa:** a lista de ferramentas escrita à mão em cada idioma (desatualiza a cada ferramenta nova).

## § 78 · Busca com todas as páginas, só as do idioma (F2, 31/out/2026)

- **Decisão:** o índice (`src/pages/search-index.json.ts`) tem 13 entradas, as dez ferramentas e os três presets do registro, cada uma com link só nos idiomas em que a rota existe. `filterEntries(entries, query, lang)` descarta a entrada sem `href[lang]`, e escolher um resultado nunca cai no link em inglês. Os termos de uma entrada (nome e sinônimos) vêm de todo idioma que tem o texto, mas a entrada só aparece onde tem link: em pt, "heic" não acha nada. A lista do diálogo ganhou `max-height: min(50vh, 400px)` com rolagem e `scrollIntoView({ block: 'nearest' })` na linha ativa: sem isso, 13 linhas de 48 px passavam de um celular de 740 px e escondiam o Fechar.
- **Por quê:** a decisão 9 do prompt; a busca não pode mandar quem está em pt para uma página em inglês sem avisar.
- **Alternativa:** mostrar em pt e es os resultados em inglês com uma etiqueta (seria tradução de enfeite, que a § 58 proíbe).

## § 79 · Licenças: o bundle de verdade contra a /licenses, e a LGPL num arquivo à parte (F2, 31/out/2026)

- **Decisão:** um plugin do Rolldown (`src/platform/bundle-record.ts`, registrado no build da página e no do worker) grava em `.cache/bundle-modules.json` os módulos de cada chunk do `_astro/`, e o `gate:licencas` falha se o arquivo falta ou não bate com o `dist/`. Os pacotes que entram dentro de outros ficam numa lista no código (`BUNDLED_TRANSITIVE`: culori, html-entities, node-html-better-parser e tslib, do `@cantoo/pdf-lib`, e `@preact/signals` e `@preact/signals-core`, do `@astrojs/preact`, que vão para o `dist/` embora nenhuma página os carregue), conferida nos dois sentidos: todo pacote do bundle está na página, e todo transitivo da lista ainda está no bundle. O `browserPackages()` continua igual às `dependencies` e ganhou as oito bibliotecas novas (`quality.test.ts`, mudança legítima como a § 52). A página lista 17 pacotes, com versão, SPDX e os textos: os arquivos de licença dos codecs do jSquash; o texto da libavif 1.0.1 e os da libaom 3.7.0 (LICENSE e PATENTS), guardados byte a byte em `src/platform/license-texts/` com a URL de origem e o SHA-256 preso num teste (lidos com `curl` em raw.githubusercontent.com e googlesource, porque o WebFetch devolve resumo, não o texto exato); e o texto da libwebp também debaixo do `@jsquash/avif`, porque a libsharpyuv dentro do `avif_enc.wasm` sai de um commit da libwebp. LGPL só como arquivo separado (`SEPARATE_FILE_RULES`): o `libheif.wasm` do `dist/` tem que ser idêntico ao do pacote (SHA-256 `184d3d20…`, as duas cópias, a da página e a do worker), o JS de cola (`libheif-wasm/libheif.js`) é um chunk só dele nos dois builds (o grupo `libheif` do `astro.config.ts`) sem nada além de módulos virtuais, e nenhum chunk leva wasm em base64. O aviso da LGPL diz o que a biblioteca é, que vai sem alteração num arquivo à parte e que a pessoa pode trocá-la, e leva o texto da LGPL-3.0 e o da GPL-3.0 a que ela remete, mais os links do código: libheif `v1.23.5`, libheif-js `1.23.5` (sem o "v": `tree/v1.23.5` dá 404) e libheif-emscripten `v1.23.5`. A libde265 aparece na v1.0.15, a padrão do `build-emscripten.sh` da libheif; se o libheif-emscripten trocou essa versão, não foi conferido (pendência).
- **Por quê:** a decisão 13 do prompt. Com a cola num chunk próprio, trocar a biblioteca é trocar dois arquivos, sem mexer no nosso código; a regra anterior da leva deixava a cola junto do nosso `heic.ts`.
- **Alternativa:** ler a lista de pacotes do `pnpm licenses` (que não diz o que de fato entra no bundle) ou embutir o `.wasm` (fere a LGPL).
- **Consequência:** a /licenses tem cerca de 218 KB de HTML por idioma, quase tudo texto de licença. Preload-helper do Vite e os auxiliares do Rolldown (MIT, módulos virtuais minúsculos) não aparecem na lista.

## § 80 · A matriz de fixtures (F2, 31/out/2026)

- **Decisão:** `tests/e2e/image-matrix.spec.ts` manda, para cada ferramenta e navegador, todo arquivo que ela aceita (pelo formato real, do `expected.json`) e, no meio do lote, os que ela recusa: as ferramentas gerais recebem um HEIC, o AVIF e os quatro quebrados (corrompido, truncado, vazio e o texto com nome de PNG); as especializadas recebem um arquivo pequeno de cada outro formato mais os quatro quebrados. Cada saída é lida do evento de download e aberta na página com o UMD do `fflate` injetado no teste (o ZIP) ou com `tests/e2e/lib/pdf.ts` (o PDF), e conferida: decodifica, formato e dimensões pelo oráculo e pelas opções, orientação pelos pixels (jpg-03 e as variantes 6 e 8), `heic-05` e `heic-09` pelas dimensões, transparência onde o formato guarda e a nota `flattened` no JPG, e nenhum GPS nem Exif, XMP ou IPTC (`heic-10` com o GPS zerado incluído). Um JPEG que volta sem ganho pode manter um bloco Exif só com a Orientation (o `strip` da § 33); qualquer outra tag falha. O AVIF só precisa decodificar onde o navegador decodifica a fixture AVIF (no Chromium sim, no WebKit do Windows não); nos outros, é conferido pelos bytes, plano alfa incluído. Cada teste grava `test-results/matriz/<ferramenta>-<navegador>.json`, e `scripts/fixtures/matrix-table.ts` monta `docs/relatorios/fase-02-matriz.md` a partir desses arquivos (nunca escrita à mão). Um lote só é dividido quando passaria de uns 9,5 s locais: Compress, PNG ↔ JPG e Convert to WebP em dois (as três fotos grandes contra o resto), os dez HEIC em dois lotes de cinco mais um lote de três para o PNG; nenhuma fixture ficou de fora. Todo teste da matriz também registra as requisições da página e do worker e exige que nenhuma saia do 127.0.0.1. O `image-privacy.spec.ts` lê os cabeçalhos de toda página do `dist/` (sem COOP e sem COEP), procura build de várias threads e a palavra `SharedArrayBuffer` no JS, compara o `.wasm` do libheif com o do pacote e confere o caminho sem canvas pela Resize, porque a Compress aquece todos os codecs no primeiro uso e uma requisição ali não prova nada; a Compress fica coberta pela matriz, com a `gen-grande` no lote. Os testes do `island.spec.ts` e do `image-smoke.spec.ts` que eram subconjunto de um teste da matriz, do lote ou dos presets foram movidos para lá, e cada asserção ficou num lugar só (a lista está na § 82).
- **Por quê:** os critérios 3 a 10 do prompt dentro do orçamento de tempo do CI: uma página por ferramenta e navegador, com o lote inteiro num envio só.
- **Alternativa:** um teste por fixture (cerca de 400 cargas de página, muito acima dos 15 min).

## § 81 · Anúncios, orçamentos e SEO para todas as páginas de imagem (F2, 31/out/2026)

- **Decisão:** o `ads.spec.ts` carrega cada página de ferramenta e de preset uma vez por navegador e mede quatro estados (em repouso, processando, com o resultado e com um lote de dois), cada um a 360 × 740 e a 1280 × 800 no mesmo carregamento, contra o Download, os campos, o editor de corte com a caixa e as alças, a fila, a comparação, o painel e a Oli; também exige nenhum AdSlot dentro do `#fo-tool-root` e o mesmo número de AdSlots em todo estado. O teste antigo "nenhum AdSlot acima do painel" entrou nessa volta. O worker é segurado antes do `goto`, porque o `warm()` o liga quando o ponteiro para sobre o painel. O `budgets.spec.ts` exige em toda página da lista status 200 (o `serve-dist` devolve o 404 para rota que falta, e o hub passava sem existir), até 8 requisições, até 80 KB de JS e nenhum worker nem `.wasm`; página de ferramenta tem exatamente 2 arquivos JS, e o hub no máximo 2; os pares são os três de antes mais `/compress-image/` → `/resize-image/`, `/compress-image/` → `/compress-image/to-100kb/`, `/resize-image/` → `/crop-image/` e `/image-tools/` → `/heic-to-jpg/`. O `gate:seo` tira do registro as páginas de ferramenta e de preset (`scripts/lib/seo-pages.ts`): o título começa pelo H1, `WebApplication` e `BreadcrumbList` com `url` e a última migalha iguais ao canonical, e todas no sitemap em inglês; o hub precisa da `BreadcrumbList`. O `lighthouserc.json` ganhou `/image-tools/` ao lado de `/compress-image/`, com os mesmos limiares. O `image-crop.spec.ts` cobre o que o teste de teclado do `image-smoke.spec.ts` não cobre: os campos espelham a caixa, digitar num campo move a caixa e a ordem do foco. No WebKit, o Tab não para em link (como no Safari padrão), então ali só se exige que o foco saia do editor depois do último campo. O `a11y.spec.ts` ganhou o estado do HEIC recusado (na DropZone e na linha da fila, com o link para o conversor).
- **Por quê:** os critérios 11, 12, 13, 14 e 17 do prompt, sem uma carga de página por checagem.
- **Alternativa:** um teste por estado e largura (o dobro de cargas, como na F1b).

## § 82 · Testes que mudaram na F2, e por quê (F2, 31/out/2026)

A decisão 14 do prompt: nenhuma asserção saiu; cada uma mudou de seletor, de texto ou de lugar. Os testes novos (motor, leitores, fixtures, matriz, lote, presets, privacidade, ilha, smoke, corte, hub, conteúdo, licenças, SEO) não estão aqui.

- `tests/e2e/tool.spec.ts`: o describe "Compress image (motor provisório)" perdeu o "motor provisório" (o motor agora é o de verdade). Os botões "Choose image" e "Choose another file" viraram "Choose images" e "Choose other files" (lote). O teste do chip, que esperava `href="/"`, agora espera de 2 a 4 chips com o primeiro link numa ferramenta do `next` do registro, e em pt e es os chips vão para a home do idioma (§ 58).
- `tests/unit/routes.test.ts`: a lista exata de ids ganhou as rotas novas (13 na leva do hub; 11 depois da válvula da § 85: o hub, sete ferramentas e três presets); as checagens de idioma usam `languagesOf` (rota só em inglês); a varredura de palavras proibidas cobre os textos de imagem; o bloco da busca foi reescrito para o índice novo ("compress" acha 3, "heif" acha 1, "heic" em pt e es não acha nada, "avif" não acha nada depois da § 85, "shrink" e "jpg" por idioma).
- `tests/unit/seo-checks.test.ts`: o tamanho dos sitemaps passou de 8 em cada idioma para 19 em inglês (21 antes da § 85) e 8 em pt e es; entraram testes de pt e es só com a Compress image, de nenhum hreflang em página só em inglês e do `collectionPageLd`.
- `tests/e2e/lib/jpeg.ts`: o `hasGps()` que o `tool.spec.ts` usa desde a F1a passou a ler o GPS por um `tiffHasGps` novo, e o `openTiff` devolve `null` para uma ordem de bytes inválida (os leitores são provados com controles positivos e negativos em `tests/unit/readers.test.ts`). `tests/e2e/lib/page.ts` só ganhou funções (`chooseImages`, `jpegBatch`, `pasteFiles`, `slowEngine` e outras) e um `export`.
- `tests/unit/coffee.test.ts`: o caminho do import mudou de `src/tools/compress-image/coffee.ts` para `src/tools/image/coffee.ts`. `tests/e2e/coffee.spec.ts`: a regra no comentário passou de "um uso é um arquivo" para "um uso é um lote com pelo menos uma saída de verdade" (§ 71), com um teste novo do lote.
- `tests/unit/ads-pages.test.ts`: renderizava só a Compress image; agora renderiza toda página encontrada pelas pastas, conferida contra o registro.
- `tests/unit/filecard.test.ts`: o comentário dizia que nenhuma página usava o FileCard; agora ele é a linha da fila, com um describe novo para os estados da fila. `tests/unit/consent.test.ts`: asserções novas para os valores de evento da F2 e para o tipo da ferramenta (um nome de arquivo não passa). `tests/e2e/events.spec.ts`: um teste novo do chip em inglês.
- `tests/e2e/a11y.spec.ts`: uma carga por página e quatro combinações no lugar (§ 76); estados novos do lote e do HEIC recusado; a busca que esperava 1 opção para "compress" agora espera 3 para "compress" e 1 para "heif", e o teste em linha digita "heif". `tests/e2e/design.spec.ts`: o teste da peek digita "heif" (1) e depois "compress" (3); entrou o lote com nomes longos na checagem de rolagem lateral.
- `tests/e2e/ads.spec.ts`: os testes por página viraram uma volta por página e navegador (§ 81), com todas as asserções antigas; entraram os alvos novos e o hub. `tests/e2e/budgets.spec.ts`: as páginas e os pares novos, a origem lida do `baseURL` e o status 200 em toda página.
- `tests/e2e/navigation.spec.ts`: o teste de cabeçalhos agora exige a ausência do `X-Robots-Tag` e o `noindex` nos três 404 (§ 75); entraram testes do filtro de idioma da busca, da busca em inglês e da rolagem no celular. `tests/unit/pos-deploy.test.ts`: § 75.
- `tests/unit/quality.test.ts`: a lista esperada de `browserPackages()` ganhou as oito bibliotecas novas (§ 79).
- `tests/e2e/island.spec.ts` e `tests/e2e/image-smoke.spec.ts` (novos na F2, mexidos pela matriz, § 80): "N arquivos dão N saídas", "mais de 6 arquivos" e "um arquivo ruim no meio" foram para o `image-batch.spec.ts`; os dois testes de colar viraram o describe `Ctrl+V` dele, e o describe `paste and drop` virou `drop`; o teste do HEIC e do AVIF mandados ao conversor foi para as linhas de recusa da matriz; do smoke saíram o `youtube-thumbnail` (para os presets), o `png-to-jpg` e o `avif-to-jpg` (para a matriz), e os outros ficaram só com os passos de reprocessar por opção; o teste do Rotate agora julga Left 90°, 180° e o espelho pelos pixels (as dimensões não distinguem Left de Right); o teste dos números digitados ganhou a checagem dos parâmetros fechados e de nenhum nome de arquivo.
- Depois do primeiro CI completo (§ 83, § 85 e § 86): `a11y.spec.ts` (estados num carregamento, status 200, helper do axe), `events.spec.ts` (chip depois do `useImage`), `image-batch.spec.ts` (nome lido do link), `consent.spec.ts` e `tool.spec.ts` (origem do `baseURL`), `navigation.spec.ts` (menu de idioma de página só em inglês; contagem da busca tirada do registro); a válvula tirou das specs e dos testes unitários só os casos das duas ferramentas cortadas e mudou as contagens (`image-hub.test.ts` 10 → 8, `conteudo.test.ts` 13 → 11 e 15 → 13 páginas, a recusa do AVIF sem link na matriz e no `image-texts.test.ts`, o registro inventado do `matrix-table.test.ts` passou de `convert-to-webp` para `webp-to-jpg`); a revisão acrescentou asserções ao `design.spec.ts` (reflow com o Download do lote em en, pt e es a 320, 360 e 390 px e o editor de corte), ao `island.spec.ts` (foco depois de Remover, de "Show more" e no WaterLevel, região de status) e ao `tool.spec.ts` (Image to PDF: linha sem botão recebe o foco, frase dita de novo), e o "remover" do `island.spec.ts` passou do clique para o teclado.

## § 83 · O tempo do CI: o axe no modo legado e os estados num carregamento (F2, 31/out/2026)

- **Contexto:** o primeiro push com a suíte inteira levou o `verificar` a 1457 s no CI (run 41200291640; Playwright 1414 s para 532 testes, 2786 s somando a duração dos testes nos 2 workers). Os maiores: axe 771 s, matriz 691 s, smoke 295 s, anúncios 224 s.
- **Decisão:** primeiro o que a ficha permite sem reduzir o alcance. (1) O axe roda por um helper só (`tests/e2e/lib/axe.ts`) no modo legado do `@axe-core/playwright` (`setLegacyMode(true)`: roda o `axe.run` na própria página, em vez de abrir uma página em branco no contexto a cada análise para juntar o resultado dos frames; nenhuma página dos testes tem iframe, porque os anúncios ficam desligados) e com `resultTypes: ['violations']` (todas as regras rodam e todas as violações voltam; o axe só deixa de juntar os nós das regras que passam). Mesmas tags, mesmas regras, mesmo resultado; medido aqui, de cerca de 450 ms para cerca de 140 ms por análise nos dois navegadores. (2) Os quatro estados da F1b no `a11y.spec.ts` (resultado, busca aberta, linha do café, busca sem resultado) e a busca com todas as páginas rodavam uma vez por largura e tema (um carregamento e um processamento cada); agora cada estado é alcançado uma vez por navegador e o axe roda as quatro combinações no lugar, como na § 76. O estado do resultado com a foto de 8 MP saiu: a comparação e o cartão do lote são lidos no teste do lote. (3) A volta por página agora exige status 200 (achado da revisão: o 404 mais próximo também passaria no axe). (4) Os dois testes do chip no `events.spec.ts` esperavam o chip por 5 s depois de mandar a foto de 8 MP, e o MozJPEG no runner passou disso: agora usam o `useImage` (JPEG gerado, que espera o resultado como as outras specs), com as mesmas asserções do chip e do evento. (5) No `image-batch.spec.ts`, o nome de cada linha é lido do próprio link que a ilha cria (o nome do site, igual em todo sistema), e o nome salvo pelo navegador pode trocar o espaço por `_`, como o WebKit do Linux faz. (6) O `playwright.config.ts` lê a porta de `FO_PORT` (4173 por padrão; o CI não muda), e o `consent.spec.ts` e o `tool.spec.ts` deixaram de fixar `127.0.0.1:4173` no texto da asserção.
- **Por quê:** a seção "Orçamento de tempo do CI" do prompt; o que ela permite vem antes da válvula.
- **Alternativa:** mais workers no CI (o runner tem 2 vCPU e a mudança pede a medida de várias execuções) ou axe numa largura só (tira alcance).

## § 84 · O menu de idioma numa página que só existe em inglês (F2, 31/out/2026)

- **Decisão:** como já fazia desde a F1a (`src/components/Header.astro`), o menu de idioma de uma página sem tradução leva à home do outro idioma (`/pt/` e `/es/`), nunca a uma página que não existe, e não muda de aparência. O `navigation.spec.ts` agora confere isso na HEIC to JPG.
- **Por quê:** a decisão 9 do prompt pede que o menu nunca leve a uma página que falta e que o jeito fique registrado; a revisão achou o registro faltando.
- **Alternativa:** esconder as outras línguas no menu dessas páginas (a pessoa que quer o site em português perderia o caminho).

## § 85 · Válvula: Convert to WebP/AVIF e AVIF to JPG ficam para a run 2b (F2, 31/out/2026)

- **Decisão:** com o `verificar` a 1457 s no CI, a válvula cortou, na ordem que o prompt manda para o tempo do CI, o item (e) Convert to WebP/AVIF e o item (f) AVIF to JPG, com os testes deles. Saíram as páginas, as pastas das ferramentas, as entradas do registro (e todo `next` e `related` que apontava para elas, trocados por outras ferramentas que existem), as rotas, os textos dos cartões, o `ConvertToOptionsTexts` e as menções nos textos das outras páginas; "ten" virou "eight" no hub, no Sobre e nos comentários. O motor fica inteiro (decodificação e codificação de AVIF, codificação de WebP e a operação `convert`, com os testes unitários), porque é carregado sob demanda e a 2b reusa; o `gate:licencas` segue com os mesmos 17 pacotes no bundle. Um AVIF largado em outra ferramenta continua recusado na linha dele, agora sem link (o `CONVERTER_FOR` só tem o HEIC e é a fonte única dos links de conversor), com a frase que diz o formato e o que a ferramenta aceita; em inglês o `wrongFormat` virou "{name} is in {format} format, which this tool doesn't take. Try {formats}." (a frase antiga dava "a AVIF"). As linhas de especificação de Resize, Crop, Rotate e Image to PDF dizem que AVIF não é aceito. A matriz perdeu os casos dessas duas ferramentas e a decodificação de AVIF na saída (a 2b recupera dos commits 3812f49 e 840d565); a fixture AVIF segue no meio dos lotes das outras ferramentas, como recusa. As contagens das § 58 a § 82 (dez ferramentas, 13 entradas na busca, 21 páginas no sitemap em inglês, os quatro conversores) passam a ser oito ferramentas, 11 entradas, 19 páginas e dois conversores (WebP to JPG e PNG ↔ JPG, mais a HEIC to JPG). Ver a ADR-003.
- **Por quê:** a válvula e a seção "Orçamento de tempo do CI" do prompt ("Se mesmo assim o CI passar de 800 s, a válvula corta na ordem (e) e (f) primeiro").
- **O que falta para a 2b:** as duas páginas com os textos, os casos da matriz (AVIF na saída, nos dois navegadores), a medida de tempo do codificador AVIF no runner e o lugar delas no hub, na home, no rodapé e na busca.
- **Junto com o corte (achado da revisão):** o PDF da matriz agora também passa por uma conferência estrita no Node, sobre os mesmos bytes (`strictPdf` em `tests/e2e/lib/pdf.ts`): cabeçalho `%PDF`, `%%EOF`, `startxref` apontando para a tabela ou o fluxo de xref, cada entrada da tabela no seu objeto, `/Size` e `/Root` no trailer, e o `PDFDocument.load` do `@cantoo/pdf-lib` com `throwOnInvalidObject` achando o mesmo número de páginas (`tests/unit/pdf-strict.test.ts`, com controles positivos e negativos).

## § 86 · Correções da revisão adversarial (F2, 31/out/2026)

- **Decisão:** (1) O Download do lote ("Download all · ZIP 1,4 MB") quebra a linha: o ícone e o rótulo na primeira, o tamanho centralizado embaixo; antes alargava a página a 320 e 360 px (e a 390 px em espanhol). (2) O `.fo-crop` tem 24 px de margem e fica 48 px mais estreito, então as alças de 48 px cabem na coluna sem encolher. (3) O `stripJpeg` copia a imagem só até o EOI dela, percorre todos os scans (JPEG progressivo), pula os bytes 0xFF de preenchimento e só mantém o APP2 do ICC: o MPF e qualquer outro APP2 saem, e o que vem depois do EOI (a segunda imagem do MPF, o mapa de ganho do Ultra HDR, o vídeo da foto em movimento, que podem trazer Exif e GPS próprios) não vai mais na cópia que volta sem ganho (`tests/unit/strip.test.ts`, sete testes, seis falham no código antigo). (4) Acima de 50.000.000 pixels de exibição, o caminho sem canvas recusa com `too-large` antes de carregar codec (`WASM_MAX_PIXELS` em `decodeSource`, que cobre as fotos de 48 MP); arquivo que não precisa ser decodificado (já cabe no tamanho-alvo, redimensionamento sem efeito, PNG na Compress) ainda volta limpo. O worker do PDF devolve os bytes com `transfer`, sem cópia. (5) Depois de Remover ou Cancelar uma linha, o foco vai para a linha seguinte, a anterior, o WaterLevel, o Start over ou o Escolher; o "Show N more" foca o primeiro botão da primeira linha nova, ou a própria linha (`tabindex=-1` com o nome do arquivo) quando ela não tem botão (Image to PDF); quando a DropZone sai da tela, o foco vai para o WaterLevel, e a região de status diz o rótulo do progresso no começo do lote; numa opção que roda de novo, a região de status é esvaziada antes da frase nova, para a frase igual ser dita de novo. (6) O FileCard troca o `{name}` por função (um nome com `$&` saía errado no nome acessível), a frase com `{tool}` é partida antes de o nome do arquivo entrar, o comentário do worker do motor sobre o caminho na página foi corrigido, e a política de privacidade não promete mais calculadoras ("When calculators arrive"), nos três idiomas. (7) O link dentro de uma linha de erro (`.fo-file__err a`) agora é sublinhado e herda a cor da linha: o azul da marca sobre o vermelho claro dava 4,32:1, e o cartão mais alto do lote o pôs ao alcance do axe.
- **Por quê:** os achados críticos, altos e médios da revisão adversarial (relatório, seção "Revisão adversarial").
- **Alternativa:** para o teto de pixels, decodificar em faixas (o jSquash não tem) ou deixar a aba cair.

## § 87 · O CI segue acima de 900 s: nenhum corte a mais, a decisão é da ADR-003 (F2, 31/out/2026)

- **Contexto:** depois da § 83, da § 85 e da § 86, o CI do commit `4b169ae` (run 41205310197) passou os 486 testes, mas o `verificar` levou 1283,5 s (Playwright 1123,4 s; 2212 s somando a duração dos testes nos 2 workers). O runner de repositório privado do GitHub Free tem 2 vCPU e 8 GB (documentação do GitHub, lida em 31/out/2026). Para caber em 900 s, o Playwright precisaria de uns 740 s de relógio, ou seja, uns 1460 s somados.
- **Decisão:** a run não corta mais nada e não muda os workers. A PR fica com o código, os testes e o relatório completos, e o CI só falha pelo tempo. A saída é a ADR-003 (dividir o Playwright em partes), que mexe no `.github/` e é do Victor; até lá, ele pode mesclar à mão.
- **Por quê:**
  - Os itens (a) a (d) da válvula poupam uns 80 s somados, longe dos uns 750 s que faltam, e tirariam produto sem fazer o CI passar.
  - Tirar checagens repetidas entre specs, que a ficha permite com registro, renderia uns 150 s. As candidatas são os estados "processando" e "lote" de cada página no `ads.spec.ts`, que repetem os da Compress, e o teste de GPS do `tool.spec.ts`, que a matriz repete.
  - Mais workers num runner de 2 vCPU, com trabalho de CPU (codecs WASM e axe), não reduzem o total, e a ficha pede a medida de várias execuções. O teste mais lento do WebKit (37 s) chegaria perto dos 60 s por teste.
  - O que pesa de verdade (a matriz e o axe em toda página, largura, tema e navegador) é alcance que a ficha não deixa tirar.
- **Alternativa:** cortar (a) a (d) e as checagens repetidas e tentar workers 3 (provavelmente uns 1050 s a 1100 s, ainda acima de 900, com risco de teste instável).

## § 88 · Os lotes pesados da matriz divididos para os 60 s de cada teste (F2, 31/out/2026)

- **Contexto:** na execução 41207385209 (commit `2100e9b`, só documentos a mais que o anterior), o runner foi uns 40% mais lento. No WebKit, `heic-to-jpg-png` e `png-to-jpg-photos` passaram dos 60 s que cada teste tem, `heic-to-jpg-a` levou 59 s, `rotate-image` 52 s e `heic-to-jpg-b` 49 s. Na execução anterior, os mesmos ficaram entre 33 s e 46 s.
- **Decisão:** dividir os lotes que chegam perto do limite, como a ficha permite: "um lote só é dividido quando não cabe em 60 s no WebKit do CI".
  - O HEIC para JPG passa a quatro lotes (1 e 2; 5 e 6; 3, 4 e 10; 7, 8 e 9), e para PNG a dois (5 e 10; 7).
  - Na PNG ↔ JPG, a foto de 12 MP vai sozinha e as outras duas grandes juntas.
  - O Rotate passa a dois lotes: as fotos grandes e o resto, com a animação.
  - Cada lote leva uma parte das recusas no meio, e todas as recusas continuam em cada ferramenta.
  - Nenhuma fixture, opção ou checagem saiu. O tempo somado sobe pouco (uma carga de página a mais por lote), e cada teste fica com folga para a variação do runner. Localmente, nenhum lote passou de 8 s.
- **Por quê:** um teste que passa ou falha conforme a velocidade do runner não serve de portão, e com a ADR-003 o mesmo teste rodaria no mesmo runner.
- **Alternativa:** aumentar o tempo por teste (proibido pela ficha).

## § 89 · ADR-003 aceita: a F2 com o CI em partes (F2, 31/out/2026)

- **Decisão:** o Victor aceitou a ADR-003, e o ajuste `ajuste-ci-partes` (PR #6, `de6a4f1` na `main`) a implementou. O `pnpm verificar` ganhou os modos `--sem-playwright` e `--playwright=<projeto> --shard=i/n`, e o CI roda quatro jobs em paralelo, cada um com o limite de 900 s: `verificar`, `playwright (chromium)`, `playwright (webkit 1 de 2)` e `playwright (webkit 2 de 2)`. A `fase-02` recebeu a `main` por merge. O único conflito foi o fim do CLAUDE.md, onde as duas seções novas ficaram, a da F2 e depois a do ajuste; o `scripts/verificar.ts` juntou sozinho o `gate:conteudo` da F2 aos modos do ajuste, e o `tests/unit/verificar.test.ts` confere que as partes cobrem todos os passos. A pegadinha da porta no CLAUDE.md agora cita o `FO_PORT`. A § 87 deixa de valer: o limite de 900 s passa a ser por parte.
- **Por quê:** a ADR-003 e a resposta do Victor ("Aceito a ADR-003").

## § 90 · Trace sem screencast: o disco do runner enchia com o WebKit sozinho no job (F2, 31/out/2026)

- **Contexto:** com o CI em partes, as duas partes do WebKit falharam com `ENOSPC: no space left on device` ao fechar o contexto do navegador. O mesmo aconteceu nas duas tentativas e no push seguinte. O runner não deu aviso de disco. O diagnóstico novo do `verificar` (`scripts/lib/disco.ts`, só no Linux do CI: o `df` de `/`, `/tmp` e `/dev/shm` a cada 20 s, e no fim as maiores pastas) mostrou o `/` indo de 10,9 GB livres a 109 MB em uns 60 s, durante os testes da Oli animada a 1280 px do `design.spec.ts`. O espaço voltou inteiro quando o worker reiniciou, depois da falha. O `/dev/shm` não mudou.
- **Decisão:** o `trace` do `playwright.config.ts` passa a `{ mode: 'retain-on-failure', screenshots: false }`. O trace de um teste que falha mantém os snapshots do DOM, a rede e o código, e deixa de gravar o screencast. O diagnóstico de disco fica no `verificar` e também mede os artefatos do Playwright e as pastas do `/tmp`, para a próxima falha dizer onde o espaço foi. Nenhum teste, limiar ou tempo mudou.
- **Por quê:** o trace guarda os quadros do screencast nos recursos do worker, que só se apagam quando o worker termina. Antes, cada worker alternava entre o Chromium e o WebKit e reiniciava o navegador; com o WebKit sozinho no job, dois workers acumulam quadros das páginas animadas até encher os 11 GB livres. Aqui no Windows o mesmo diretório ficou em poucos MB, porque o WebKit do Windows é outro build, e por isso a confirmação vem do CI.
- **Alternativa:** um passo que libera disco no runner (mexe no `.github/` e só adia o problema) ou `workers: 1` no WebKit (o dobro do tempo).

## § 91 · O aviso de cookies reserva o espaço no rodapé, não no `body` (F3, 31/out/2026)

- **Contexto:** o Victor viu uma faixa clara embaixo do rodapé escuro enquanto o aviso de cookies está aberto (Chrome e Edge do Windows). A causa, provada: o `reserve()` do `CookieNotice.astro` punha no `document.body` um `padding-bottom` igual à altura do aviso + o `bottom` + 8 px (a garantia da § 36). O `html` não tem fundo próprio, então o fundo `--bg` do `body` pinta a tela inteira, e o `padding` do `body` fica depois do `.fo-footer` (o último elemento da página, fundo `--deep`). O teste novo `tests/e2e/cookie-footer.spec.ts` mediu, no código de antes, 216 px do `body` abaixo do rodapé a 360 px (nos dois navegadores) e, com a âncora do AdSense, 316 px com a última linha do rodapé a 105 px do aviso: a âncora era contada duas vezes (pelos 96 px do `.fo-footer--anchor` e pelo `bottom` do aviso).
- **Decisão:** o script publica a altura que precisa reservar em `--fo-cookie-room` no `<html>` (e a tira quando o aviso some; a variável passou a `--fo-bottom-room` na § 101, quando a âncora ganhou reserva própria), e o `.fo-footer` soma essa variável ao padding de baixo. No celular com os anúncios ligados, o `.fo-footer--anchor` usa o maior entre os 96 px da âncora e o respiro normal + a reserva, porque a reserva já conta a âncora embaixo do aviso. O `scroll-padding-bottom` continua no `<html>` e o `focusin` da § 36 não mudou. Nenhuma cor, sombra, raio ou JS a mais; o script continua `is:inline`.
- **Prova:** o `cookie-footer.spec.ts` carrega a home, a Compress image e a Privacidade uma vez por navegador e, no mesmo carregamento (§ 76), confere a 360 × 740, 768 × 1024 e 1280 × 800, nos temas claro e escuro, por `prefers-color-scheme` e por `html[data-theme]`, que `scrollHeight` menos o fim do rodapé dá no máximo 1 px, que a última linha do rodapé fica acima do aviso e que o rodapé tem fundo diferente do `body`. Depois de Aceitar ou Recusar: nenhum padding no `body`, nenhum `scroll-padding` e nenhum estilo inline no `html`, e o rodapé volta aos 24 px (ou aos 96 px com `.fo-footer--anchor` a 360 px). Um teste foca o último link do rodapé a 360 e 1280 px, com e sem `scroll-padding`. Antes da correção, 8 testes falharam e 2 passaram; depois, os 10 passam, e os testes de cookies do `events.spec.ts` e do `consent.spec.ts` passam sem mudança.
- **Os outros três sintomas:** o aviso fecha (o `consent.spec.ts` clica em Aceitar e Recusar e espera o aviso escondido), não volta (o mesmo teste navega por três páginas depois da escolha) e a página não pula na carga (a reserva entra antes da primeira pintura, pelo script inline no fim do `body`; o CLS do Lighthouse está no relatório). Nenhum dos três se reproduziu.
- **Alternativa:** dar ao `html` o fundo `--deep` (pintaria de azul o fim da página antes do rodapé enquanto ela carrega e muda o canvas do site inteiro) ou um elemento vazio depois do rodapé com a altura da reserva (mais marcação e o mesmo resultado).

## § 92 · Revisão da F3: seis lentes sobre um commit fixo, numa worktree só de leitura (F3, 31/out/2026)

- **Decisão:** a revisão cobre tudo o que está na `main` mais a correção do aviso, o `gate:prontidao` e o hub. O commit revisado é o do plano `docs/relatorios/fase-03-plano.md`, e o hash fica registrado no `REVISAO-F3.md`.
- **O gabarito:** as fichas F1a, F1b e F2, os critérios dos prompts dessas runs, o CLAUDE.md, o DECISOES.md, o `docs/design/`, a "Nota para a F3" e os baixos da F2.
- **As seis lentes:** corretude, privacidade, anúncio e consentimento, acessibilidade, desempenho e SEO técnico, e aderência ao design system. Cada lente é um subagente Sonnet em contexto limpo, que trabalha só por leitura numa worktree em `.claude/worktrees/revisao-f3`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`.
- **Execução em paralelo:** cada lente tem a própria porta (`FO_PORT` de 4174 a 4179) e a própria pasta de saída do Playwright, para duas execuções nunca usarem o servidor uma da outra.
- **O que a lente devolve:** cada achado com id, severidade, `arquivo:linha`, evidência rodada, a regra violada, a correção proposta e o custo no CI. Preferência de estilo não é achado.
- **Por quê:** a ficha F3 pede revisão adversarial em subagentes paralelos. Uma worktree fixa evita que a revisão leia código que eu estou mudando, e a porta própria evita o problema da porta 4173 que a F2 achou.
- **Alternativa:** revisar na pasta de trabalho. Seria mais barato, mas a lente leria arquivos no meio da edição.

## § 93 · Severidade e cético por achado (F3, 31/out/2026)

- **Decisão:** a severidade segue a decisão 3 do prompt da F3.
  - **Crítico:** arquivo que sai, número na URL ou no GA4, "O que derruba conta", `noindex` ou `robots.txt` em produção, saída errada ou com GPS, merge ou pós-deploy quebrados.
  - **Alto:** WCAG A ou AA no fluxo principal, desvio visível do design system em componente de toda página, erro funcional, item de prontidão, orçamento estourado ou promessa da Privacidade não cumprida.
  - **Médio:** erro real de impacto pequeno, ou teste que não prova o que diz.
  - **Baixo:** o resto.
- **Os céticos:** cada crítico, alto e médio ganha um cético Sonnet próprio, em contexto limpo, que tenta refutar o achado. Ele reproduz o problema, lê a regra e procura teste que já cubra o caso. Os baixos de cada lente vão a um cético só, em lote. O veredito é confirmado, refutado com a evidência, ou rebaixado com a severidade nova. Só o confirmado segue.
- **Por quê:** um achado plausível e errado custa uma correção desnecessária e um teste a mais no CI.

## § 94 · O que se corrige na F3 (F3, 31/out/2026)

- **Decisão:**
  - Crítico e alto confirmados: sempre.
  - Médio: quando a correção é local, isto é, não muda a arquitetura, não toca no que está fora do escopo e soma no máximo uns 30 s a uma parte do CI. Senão, vira pendência da run 3b.
  - Baixo: só os oito herdados da F2. Os outros vão para o relatório.
- **Regras das correções:** cada correção testável ganha um teste que falha sem ela, e cada uma entra num §. Achado em `.github/` ou `scripts/ci/` não é corrigido aqui: vira pendência com a correção proposta, para uma run de ajuste com o merge do Victor. As correções ficam num agente só, para não colidirem no CSS e na ilha.
- **Segunda passada:** subagentes novos revisam só o diff das correções, até não sobrar crítico nem alto aberto.

## § 95 · `gate:prontidao`: o site pronto para o pedido do AdSense (F3, 31/out/2026)

- **Decisão:** um portão novo, `pnpm gate:prontidao` (`scripts/gates/prontidao.ts`, lógica em `scripts/lib/prontidao.ts`), no `STEPS` do `verificar` logo depois do `gate:conteudo`, e por isso na parte `--sem-playwright` do CI. Ele imprime uma tabela item → ok ou FALHA → como conferiu e reprova se um item falha. São 18 itens:
  - **(a) AdSense pronto para o ID, sem anúncio ligado.** O portão faz dois builds extras do mesmo código, com `astro build --outDir .cache/prontidao/<nome>`: `client`, só com `PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000` (o estado depois do passo 2 de "Como o anúncio liga", que é o que a revisão do AdSense vê), e `all`, com as três variáveis (unidades de teste e `PUBLIC_ADS_ENABLED=true`). No `client`, toda página tem uma `<meta name="google-adsense-account">` no `<head>` com o ID, o `/ads.txt` tem exatamente a linha `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0` e não há carregador nem unidade. A linha está escrita à mão no portão, a partir da ajuda do AdSense (support.google.com/adsense/answer/12171612, lida em 31/out/2026), e nunca sai do `adsTxt()` do site. No `all`, o carregador está em toda página com área de anúncio, sempre com a trava do hostname, e em nenhuma outra (jurídicas, institucionais, home, 404). No `dist/` real (sem o ID), não há meta, `ads.txt`, carregador nem unidade, e os AdSlots são só o espaço neutro.
  - **(b) Páginas obrigatórias.** Sobre, Contato, Privacidade, Termos, Licenças e Apoio existem nos três idiomas, indexáveis e com o arquivo no build (o handler de assets responde 200). As seis estão no rodapé de toda página, no idioma dela. O Contato mostra `contato@fileorca.com` com link `mailto`. A Privacidade, nos três idiomas, cita o Google como parceiro de publicidade e os cookies de terceiros (as frases da página "Required content" do AdSense, support.google.com/adsense/answer/1348695), e tem o link do Ads Settings (adssettings.google.com, myadcenter.google.com ou google.com/settings/ads), o link de sites parceiros (policies.google.com/technologies/partner-sites), o controlador e o e-mail.
  - **(c) Nenhuma página "em breve".** O texto visível de todo HTML não tem os textos provisórios do `gate:conteudo` mais "under construction", "em construção" e "en construcción" (TODO e TBD só em maiúsculas, porque "todo" é palavra em português e espanhol). Nenhum arquivo de texto do build (HTML, JSON, XML, TXT, manifest), com os scripts, tem ID de mentira (`ca-pub-0000…`, `pub-0000…`, `G-XXXX…`, `example.com`). Os cartões da home de cada idioma e do hub são exatamente as ferramentas do registro naquele idioma, e cada item do `search-index.json` leva a uma página que existe e está no registro.
  - **(d) Conteúdo de verdade.** Toda página indexável tem um H1, e nenhum H1, título ou descrição se repete. O `<main>` tem pelo menos **60 palavras** visíveis, sem o rótulo dos AdSlots: a página mais curta do site hoje é o Contato, com 74 em inglês e 78 em português e espanhol, e o 60 deixa folga para uma revisão de texto sem aceitar uma página vazia. Cada AdSlot pede **150 palavras** do `<main>`, mais ou menos uma tela de texto no celular a 16/26 px. As ferramentas têm de 242 a 372 palavras por AdSlot.
  - **(e) Rastreável.** O `robots.txt` não tem `Disallow` com caminho em grupo nenhum (Googlebot e Mediapartners-Google incluídos), tem `Allow: /` e aponta o índice de sitemaps. Nenhuma página indexável tem `<meta name="robots">` ou `googlebot` com `noindex`, nem regra do `_headers` que vale em fileorca.com com `X-Robots-Tag: noindex`. O índice lista os três sitemaps, e cada URL deles é página indexável com o arquivo no build.
- **Reuso:** a checagem do `robots.txt` saiu do `gate:seo` para `robotsProblems()` em `scripts/lib/seo-checks.ts`, e o `gate:seo` a chama. Ficou mais estrita: aceita espaço antes do `Disallow` e ignora maiúsculas. A leitura do `_headers` saiu do `gate:cabecalhos` para `headerBlocks()` em `scripts/lib/headers-file.ts`, ao lado do `patternApplies()` (`*` e `:nome` como o Cloudflare lê). O texto visível vem do `visibleText()`, exportado do `scripts/lib/conteudo.ts`, que o `findPlaceholders()` passou a usar. Os sitemaps passam pelo `validateSitemap()` e pelo `sitemapUrls()`. Nenhuma checagem dos portões antigos mudou de sentido.
- **Custo:** os dois builds levam uns 22 s cada aqui. O portão inteiro leva uns 46 s. O registro do bundle (`.cache/bundle-modules.json`), que o `gate:licencas` lê, é guardado antes de cada build e devolvido depois, mesmo quando o build falha. O `dist/` nunca é tocado.
- **Prova:** `tests/unit/prontidao.test.ts` monta sites de mentira numa pasta temporária. Um passa nos 14 itens do build de hoje, e os builds com o ID passam nos 4 deles. Depois, uma quebra de cada vez reprova o item certo: `ads.txt` com `ca-pub-`, com `RESELLER`, com linha a mais ou ausente; meta faltando ou com outro ID; carregador só com o ID, numa página jurídica ou sem a trava do hostname; meta, `ads.txt` ou unidade no build de hoje; página obrigatória faltando; rodapé sem o Apoio; Contato sem o e-mail; Privacidade sem cada um dos seis itens; "Coming soon", "Under construction", "Em breve", "em construção", "Próximamente", "en construcción", "Lorem ipsum" e "TODO" nos três idiomas, mas não o "todo" do português; ID de mentira num script; cartão e item de busca de ferramenta que não existe; título repetido e dois H1; `<main>` curto; AdSlot demais para o texto; `robots.txt` que bloqueia o Mediapartners-Google, que bloqueia um caminho para o Googlebot ou que não aponta os sitemaps; `noindex` por meta, pelo `/*` e por regra absoluta de fileorca.com; sitemap com página que não existe ou não é indexável.
- **Alternativa:** conferir a meta e o `ads.txt` pelo Astro container no Vitest. Isso já existe no `ads-pages.test.ts` e no `ads.test.ts`, mas não prova o `dist/` que o Workers Builds publica. Também dava para fazer um build só, com as três variáveis, mas ele não mostra o estado com só o ID, que é o que a revisão do AdSense vê.

## § 96 · O hub ganha o guia "qual ferramenta usar" e um H1 próprio (F3, 31/out/2026)

- **Contexto:** a primeira execução do `gate:prontidao` reprovou o hub `/image-tools/` no item "Mais conteúdo que anúncio". O hub tem dois AdSlots (§ 77) para 193 palavras no `<main>`, e o resto do site tem pelo menos 242 por AdSlot. A ajuda do AdSense recusa sites com conteúdo insuficiente e telas que servem só para navegação. Era também um baixo que a F2 deixou para a F3: o sobretítulo e o H1 do hub eram iguais ("Image tools").
- **Decisão:** o hub ganha, depois da tabela dos presets, a seção "Which tool do you need?". Ela tem um parágrafo de como as ferramentas funcionam, uma linha por ferramenta (o problema e a ferramenta, com link) e uma frase sobre os metadados. Cada afirmação sai do cartão ou da página da ferramenta. O H1 passa a "Eight image tools, zero uploads", como no `preview.html` do ToolCard ("10 tools, zero uploads"), e o sobretítulo segue "Image tools". O `<main>` do hub passa a mais de 300 palavras. Os textos novos estão em `ImageToolsTexts` (`guideHeading`, `guideIntro`, `guide`, `guideOutro`). Os AdSlots ficam como estão.
- **Asserção que mudou:** em `tests/unit/image-hub.test.ts`, o H1 esperado deixou de ser `['Image tools']` e passou a `['Eight image tools, zero uploads']`. A asserção antiga afirmava o próprio baixo. Entrou também a asserção de que o sobretítulo é diferente do H1.
- **Linhas que mudam com a 2b:** o "Eight" do H1, do título, da descrição e da introdução, e a lista do guia, que ganha as duas ferramentas novas.
- **Alternativa:** tirar os AdSlots do hub (perde receita e contraria a § 77) ou baixar o limiar até o hub passar (a regra deixaria de medir alguma coisa).

## § 97 · A produção conferida só por leitura (F3, 31/out/2026)

- **Decisão:** antes do merge, a produção é conferida com `curl` (GET e HEAD). As saídas vão para o relatório. O que foi conferido:
  - `build.txt` em `f549f1b`;
  - `robots.txt` igual ao `public/robots.txt`;
  - o índice e os três sitemaps iguais aos do `dist/` (19, 8 e 8 URLs);
  - as 18 páginas obrigatórias com 200 e sem `x-robots-tag`;
  - uma URL inexistente com 404;
  - nenhum `/cdn-cgi/` nem `cloudflareinsights` em seis páginas;
  - `http://`, `www` e `http://www` com 301 até `https://fileorca.com/` (`http://www` passa por `https://www` antes);
  - `/ads.txt` com 404;
  - HSTS, nosniff, Referrer-Policy e `frame-ancestors` na home;
  - `immutable` nos `/_astro/` e `must-revalidate` no HTML;
  - a chave do IndexNow.
- **Navegador:** só com `context.route` abortando todo domínio do Google (`.cache/f3/check-band.ts`), para nenhuma visita minha entrar no GA4. Assim a faixa do aviso foi medida na produção antes do merge: 202 px a 1280 e 216 px a 360, nos dois temas. Na prévia da PR (`736b1cd`), a medida deu 0 px nas quatro combinações. Na prévia, o `gtag.js` nem é pedido, por causa da trava de hostname.
- **Por quê:** decisão 6 da ficha. Visita de navegador sem bloqueio contaria como tráfego no GA4.

## § 98 · Textos de lançamento e as provas do Show HN (F3, 31/out/2026)

- **Decisão:** `docs/lancamento/` tem quatro arquivos: `README.md` (ordem, checklist e avisos), `show-hn.md`, `alternativeto.md` e `diretorios.md`. Os textos que vão para fora estão em inglês, e as explicações para o Victor em português. Nada foi enviado.
- **Diretórios: 10, não 20** (a válvula da ficha permite). Nove candidatos exigem selo ou backlink, vendem link dofollow ou pacote de envio, ou dependem de voto, e ficaram de fora pela política de spam de links do Google. Quatro listas estão paradas ou fechadas, e oito páginas não abriram para a ferramenta de leitura (403, erro de certificado, 404). O BetaList, pago, ficou numa lista à parte. A lista com o motivo de cada um está no próprio arquivo.
- **AlternativeTo:** o FAQ recusa "a collection or suite of simple online tools", com conversores e editores de foto entre os exemplos. A chance de aprovação é baixa, e o texto fica pronto mesmo assim, como manda a ficha. Os limites dos campos ficam atrás de login. O texto usa tamanhos conservadores (descrição curta de 140 caracteres, longa de 705) e registra a lacuna.
- **Show HN:** o título principal tem 68 caracteres, e as variações têm 72, 78 e 78. As diretrizes do HN proíbem texto gerado ou editado por IA nos comentários, então o `README.md` e o `show-hn.md` pedem ao Victor que reescreva o título e o comentário com as próprias palavras. O rascunho vale como roteiro de fatos.
- **As três afirmações técnicas e as provas:**
  - **"No byte of your file leaves your browser":** `tests/e2e/launch-claims.spec.ts`, no Chromium e no WebKit, na Compress (MozJPEG), na HEIC to JPG (libheif) e na Image to PDF. Da carga até o download, toda requisição da página e dos workers é um GET para a própria origem, sem corpo.
  - **"After the page and the codec load, the tool keeps working offline":** no mesmo teste, `context.setOffline(true)` depois do primeiro arquivo. O segundo arquivo é processado e baixado sem nenhuma requisição de rede.
  - **"The only third-party traffic is Google Analytics":** na produção, com os domínios do Google bloqueados, a home e um uso real da Compress pediram só `fileorca.com` e `www.googletagmanager.com`. Fora da produção, o `consent.spec.ts` e a trava de hostname.
- **Frase corrigida:** "Each tool runs in a Web Worker" virou "The image work runs in a Web Worker…", com a ressalva do navegador sem `OffscreenCanvas` no worker, onde o motor roda na página (§ 22).
- **LanguageTool:** os 15 blocos em inglês passaram pelo LanguageTool local do `lint:texto`, com nenhum erro de gramática (37 apontamentos de nomes próprios e estilo). O alcance do portão não mudou.
- **Custo do teste no CI:** três testes por navegador, uns 23 s no Chromium e 30 s no WebKit aqui. No WebKit, os três se dividem entre as duas partes do CI.
- **Alternativa:** prova por um script fora do `verificar`. Ela não protegeria a afirmação pública de uma regressão futura.

## § 99 · Testes que mudaram na F3, e por quê (F3, 31/out/2026)

- `tests/unit/image-hub.test.ts`: o H1 esperado do hub mudou (§ 96).
- `tests/e2e/island.spec.ts`, no teste "one tool_start and one tool_complete per batch…": falhou uma vez no WebKit 2 de 2 do CI (run 41227322450, commit `736b1cd`, nenhum arquivo do teste ou da ilha mudado) com 1 `download` em vez de 2. Aqui passou 8 vezes em 8 no WebKit.
  - **A causa:** uma corrida do próprio teste. A opção Strong refaz o lote, e o cartão de resultado continua na tela nos primeiros 400 ms da nova execução (`showCard` com `!m.showLevel`). Por isso o `toBeVisible` passava na hora, e o clique em "Download a.jpg" podia cair no instante em que a linha era redesenhada.
  - **A mudança:** o teste guarda o texto do Download do lote (o tamanho do ZIP), clica em Strong e espera esse texto mudar, ou seja, o ZIP novo pronto, antes de clicar na linha.
  - Nenhuma asserção mudou: segue exigindo um `tool_start`, um `tool_complete`, um `tool_error` e dois `download`.
- `tests/e2e/navigation.spec.ts`, no teste "tool search loads on first use…": o localizador `getByText('Nenhuma ferramenta').or(…empty-title)` passou a `locator('[data-search-empty-title]')`, com o texto inteiro. A região de status da busca (§ 101) diz as mesmas palavras, então o texto sozinho achava dois elementos. A asserção é a mesma: o título do estado vazio traz a busca.
- `tests/e2e/cookie-footer.spec.ts` (teste novo da F3), no caso "with the AdSense anchor and the notice at once…": depois de Recusar, com a âncora ainda na tela, o rodapé deixou de esperar 96 px e o `scroll-padding` deixou de esperar `auto`. A âncora agora mantém a própria reserva, de 108 px (§ 101). O teste passou a tirar a âncora e conferir que a reserva some por inteiro (96 px, `auto`, nenhum estilo inline). A asserção antiga afirmava o defeito c-02 da revisão.
- `tests/e2e/image-smoke.spec.ts`, no teste do Crop: o nome acessível esperado da caixa passou de `'Crop area'` a `'Crop area, 1200 by 1200 pixels, at 0, 200'`. A caixa agora diz o que cobre (baixo 1 da F2, § 102), e a asserção antiga afirmava a falta do valor.
- `tests/e2e/tool.spec.ts`, no teste "the work runs in the Web Worker…": o `console.log` do caminho virou asserção (achado a-03, § 102). O teste lê no próprio worker se ele tem `OffscreenCanvas`. Se tem, não pode haver pedido ao chunk `process`, que só o caminho da página importa; se não tem, o motor rodou na página. Com o mutante da revisão (motor sempre na página), o teste agora reprova no Chromium.
- `tests/unit/consent.test.ts`: a lista de valores de `reason` do `tool_error` ganhou `load` (§ 102).
- `tests/e2e/image-smoke.spec.ts`, no teste "the sheet changes only the PDF…" da Image to PDF. Ele falhou uma vez no WebKit 2 de 2 do CI (run 41235192185, `72f0c2d`) com "no download link", dentro do `expect.poll`. Enquanto o PDF é montado de novo para a folha nova, o link some por um instante; o `downloadBytes` lança, e um `expect.poll` cujo callback lança desiste na hora em vez de tentar de novo. Agora a ausência do link é só mais uma tentativa da sondagem. O valor esperado (as dimensões de cada página em Letter e em A4) não mudou. O `image-crop.spec.ts` já tratava o mesmo instante com o `currentDownload()`.
- `tests/e2e/engine-paths.spec.ts` (teste novo da F3), no caso "a codec that cannot load…". No WebKit do Linux, o worker tem `OffscreenCanvas` e busca os codecs ele mesmo, e o `page.route` não segura esses pedidos. Por isso o teste falhou no CI. Ele agora força o caminho da página, onde a página busca os codecs e o `page.route` vale nos dois navegadores. O caminho do worker carrega pelo mesmo `loading()` do motor.

## § 100 · O removedor de metadados guarda só o que a imagem precisa (F3, 31/out/2026)

- **Contexto:** os achados b-01 e a-04 da revisão (lentes de privacidade e de corretude, cada uma por conta própria) acharam o mesmo problema. O `strip.ts` era uma lista de bloqueio: no PNG tirava só `tEXt`, `zTXt`, `iTXt`, `eXIf` e `tIME`, e no WebP só `EXIF` e `XMP `. Chunks privados ou desconhecidos (`caBX` do C2PA, `zxIf`, `exIf`, `dSIG`, `vpAg`, `prVW`, `orNT`) passavam inteiros pela Compress de PNG, pelo caso "sem ganho" e pelos presets, com o cartão dizendo que os metadados saíram. Prova da lente: um PNG com texto de GPS nesses chunks saiu da `/compress-image/` com o texto, no Chromium e no WebKit. O cético rebaixou o b-01 de alto para médio, porque o critério nomeia GPS, Exif, XMP e IPTC nos lugares padrão, que já saíam.
- **Decisão:** lista de permissão.
  - **PNG:** ficam `IHDR`, `PLTE`, `IDAT`, `IEND`, `tRNS`, `gAMA`, `cHRM`, `sRGB`, `iCCP`, `sBIT`, `bKGD`, `pHYs`, `cICP`, `mDCV`, `cLLI` e os do APNG (`acTL`, `fcTL`, `fdAT`).
  - **WebP:** ficam `VP8X` (sem os bits de EXIF e XMP), `VP8 `, `VP8L`, `ALPH`, `ANIM`, `ANMF` e `ICCP`.
  - **JPEG:** o APP0 fica só se for JFIF, e o APP14 só se for Adobe. Um JFXX com miniatura ou um bloco privado com o mesmo marcador sai. O resto não mudou: o ICC fica, a Orientation mínima fica, e nada depois do EOI é copiado.
- **Prova:** três testes novos em `tests/unit/strip.test.ts` falham no código antigo e passam no novo. São um PNG com os seis chunks privados e um desconhecido, todos com texto de GPS; um JPEG com JFXX e um APP14 que não é Adobe; e um WebP com dois chunks desconhecidos. Os testes antigos de `strip` e de `process` continuam verdes.

## § 101 · Consentimento, âncora, busca e portão depois da revisão (F3, 31/out/2026)

Achados médios confirmados pelos céticos e corrigidos, cada um com teste que falha no código de antes. As provas estão em `tests/e2e/consent-choice.spec.ts` (novo), `tests/e2e/cookie-footer.spec.ts`, `tests/e2e/navigation.spec.ts` e `tests/unit/prontidao.test.ts`.

- **c-01 · a CMP que chega depois do `load`.** O aviso próprio olhava o `__tcfapi` duas vezes, na hora e no `load`, e nunca mais. A CMP do Google vem com o carregador do AdSense e pode chegar depois do `load`; aí os dois avisos ficavam juntos na UE. O aviso agora procura a CMP a cada 500 ms, por até 30 s, até ela responder ou o aviso sumir. Teste: a CMP definida 300 ms e 3 s depois do `load` esconde o aviso.
- **c-02 · a âncora com o aviso fechado.** Sem o aviso, nada reservava espaço para a âncora, e o foco do teclado podia ficar inteiro debaixo dela (WCAG 2.4.11). A reserva passou a ser do aviso e da âncora: `--fo-bottom-room` e o `scroll-padding-bottom` valem o maior entre a altura do aviso e a da âncora mais 8 px. O `focusin` da § 36 usa o topo da âncora quando o aviso some. A variável `--fo-cookie-room` da § 91 virou `--fo-bottom-room`. Teste: âncora de 100 px, aviso recusado, 45 Tabs a 360 px e nenhum foco coberto. Uma asserção do teste da § 91 mudou; ver a § 99.
- **c-03 · o portão e a trava do hostname.** O `gate:prontidao` procurava a trava na página inteira, e a trava do push de cada AdSlot bastava para aprovar um carregador sem trava. Agora cada script que carrega o AdSense ou empurra uma unidade precisa ter a trava dentro dele. Teste: carregador sem trava com push travado, e push sem trava, reprovam.
- **b-02 · Recusar apaga a contagem do café na hora.** Antes, a contagem só era apagada quando uma ferramenta abria, e a Privacidade diz, nos três idiomas, que ela é apagada ao recusar. O script do aviso apaga a contagem no clique em Recusar, como o `forget()` do `coffee.ts`: o "não mostrar de novo" fica. Teste: Aceitar, contagem gravada, Recusar, contagem apagada; com "nunca", sobra `{uses: 0, never: true}`.
- **b-03 · "Mudar minha escolha" guarda a escolha até haver outra.** O botão apagava a escolha antes de a pessoa escolher de novo. Quem abria e saía voltava ao padrão concedido fora da UE, sem nenhuma ação. Agora o botão só abre o aviso. Teste: Recusar, reabrir, sair sem escolher, e a página seguinte reaplica a Recusa.
- **d-04 · o foco volta a quem abriu o aviso.** Depois de escolher no aviso reaberto pelo botão, o foco caía no `body` (WCAG 2.4.3). Agora ele volta ao botão "Mudar minha escolha". Teste por teclado.
- **d-01 · a busca anuncia o "sem resultado".** O bloco vazio aparecia sem região viva (WCAG 4.1.3). O cético rebaixou de alto para médio, porque a busca é um atalho e não o fluxo principal. A `SearchBox` ganhou um `<p class="fo-sr" role="status">` fora do bloco escondido, que diz o mesmo título. Teste: a região diz "Nenhuma ferramenta chamada "heic"" e se esvazia quando há resultado.
- **Custo no CI:** uns 7 testes de uma carga cada por navegador, de 3 a 8 s cada.

## § 102 · Mais correções da revisão: motor, PDF, privacidade, voz, amarelo, anúncio do resultado e Crop (F3, 31/out/2026)

Achados médios confirmados e os baixos da F2 que se confirmaram. Cada um tem teste que falha no código de antes.

- **a-01 · o motor que não carrega.** Se o chunk do motor não chega (sem rede, ou um chunk que sumiu depois de um deploy), um arquivo bom era chamado de "danificado" (`decode`) e nunca tentado de novo.
  - Agora o painel usa um motivo próprio, `load`, que fica fora do `HOPELESS` e tem fala própria nos três idiomas: "Oli couldn't load what she needs to read {name}. Check your connection and reload the page."
  - O `tool_error` leva `reason: 'load'`, um valor novo na lista fechada `ERROR_REASONS`, sem evento nem parâmetro novo.
  - Teste em `tests/e2e/engine-paths.spec.ts`.
- **a-02 · o worker do PDF que não sobe.** O `pdf-client.ts` não ouvia o `error` do worker, e o painel ficava em "Building your PDF" para sempre.
  - Agora ele corre a montagem contra um `broken` (como o `engine-client.ts`), rejeita com `EngineUnavailable` e deixa o próximo PDF abrir um worker novo.
  - O painel trata isso como `load`, e também o import dinâmico que falha.
  - Teste: com o worker do PDF bloqueado, o painel termina na fala de `load`.
- **e-01 · o caminho da página, de novo.** Um worker sem `OffscreenCanvas` não faz trabalho de imagem, mas o `warm()` do ponteiro sobre o painel baixava nele os codecs que a página depois baixava de novo (300 KB na Compress, 1,4 MB de libheif na HEIC). O `warm()` agora espera o `canvasInWorker()` e só aquece um worker que vai trabalhar. O teste do caminho da página exige cada `.wasm` uma vez só; no código de antes, o mesmo teste achou três repetidos. A trava da thread principal nesse caminho (de 2,4 a 3 s por foto grande) é do próprio caminho (Safari antes do 16.4) e não muda.
- **a-03 · o caminho da página.** Um teste novo tira o `OffscreenCanvas` do worker do motor, nos dois navegadores, e exige o resultado pelo caminho da página. O teste antigo do worker passou a afirmar o caminho (ver a § 99).
- **b-04 · o Analytics depois da Recusa.** O Consent Mode avançado manda pings sem cookie depois da Recusa (documentação do Google, support.google.com/analytics/answer/9976101). A Privacidade, nos três idiomas, passou a dizer isso na seção de consentimento, e o `gate:prontidao` confere a frase.
- **d-03 (e o baixo 6 da F2) · o resultado anunciado uma vez.** O cartão tinha `aria-live="polite"`, e a região `role="status"` dizia a mesma frase. Num lote de N arquivos, o cartão falava N + 1 vezes, com números que ainda não eram os finais.
  - O `aria-live` saiu do cartão, e a região de status passou a ser a única voz da ferramenta. Teste no `island.spec.ts`.
  - **Desvio do README do ResultCard:** ele pede `aria-live` no cartão para o leitor de tela ouvir a fala da Oli. A fala continua sendo dita, só que uma vez, pela região de status.
- **f-01 · o teste do amarelo.** O teste via só `var(--sun…)`. Agora procura também, fora do Baixar, o hex e o `rgb()` que só a família do amarelo usa no `tokens.css` (#FFC93C e #B8870F), com amostras que provam a regra.
- **f-02 · o teste de voz.** O teste agora:
  - cobre as oito palavras do README, com as variações ("supercharged", "magical", "mágica");
  - recusa emoji;
  - só aceita exclamação na fala de sucesso de cada ferramenta (`done` e `doneMany`), uma por fala.
- **d-06 (baixo 3 da F2) · a caixa pequena do Crop.** As alças de 48 px cobriam uma caixa pequena, e o ponteiro só conseguia redimensioná-la. Quando a caixa tem menos de duas alças de lado, apertar dentro dela a move, e a metade de fora de cada alça ainda a redimensiona. O cético subiu o achado para médio.
- **d-07 (baixo 1 da F2) · o valor da caixa do Crop.** Um `group` não tem valor próprio, então o nome acessível passou a dizer o que a caixa cobre: "Crop area, 480 by 480 pixels, at 80, 0". O nome acompanha as setas.
- **Os outros baixos da F2:**
  - 2 (faixa no erro do Crop), 4 (escolha na fila) e 5 (`aria-valuetext` do BeforeAfter): refutados pelos céticos. A evidência está no `REVISAO-F3.md`.
  - 7 (sobretítulo e H1 do hub): corrigido na § 96.
  - 8 (metadados do PDF): fica para a F5. A lente de privacidade gerou um PDF e achou só Producer e Creator "FileOrca", sem data, XMP nem Exif.
- **Custo no CI:** uns quatro testes de uma carga por navegador (de 4 a 8 s cada), mais asserções em testes que já existem.

## § 103 · O que a revisão deixa pendente, e com quem (F3, 31/out/2026)

- **d-02 · os loops da Oli e do vapor (WCAG 2.2.2), do Victor.** A `wave` da Oli (3 s, `alternate`, infinita) e o vapor da caneca (1,8 s, infinito) começam sozinhos, passam de 5 s e não têm controle de pausa. O cético rebaixou o achado de alto para médio: o W3C ainda discute se `prefers-reduced-motion` basta (issue #3766), e o site já para tudo com a preferência (§ 44, § 57). A correção é local, mas muda uma regra do design system: o README da Oli fala em "loop", e a F1b já tinha deixado essa decisão para o Victor. Por isso ela não entrou aqui. São duas saídas:
  - limitar cada loop a menos de 5 s e deixar a Oli em repouso (a lente propõe a `wave` em 4,5 s, uma vez, e o vapor em 2 ciclos), o que muda os testes de movimento do `design.spec.ts`;
  - ou um controle de pausa.
- **c-04 · o Aceitar do aviso próprio e a CMP na UE, do Victor antes de ligar os anúncios.** A escolha feita no aviso próprio numa página sem a CMP do Google (home, jurídicas, Apoio, 404) é reaplicada como `ad_*` concedido na página de ferramenta, antes de a mensagem do Google perguntar. Só existe com os anúncios ligados. São duas saídas:
  - nas regiões negadas por padrão, reaplicar só o `analytics_storage`;
  - ou carregar a CMP em toda página, o que muda a arquitetura e pede ADR.
  O Victor confere o comportamento real na UE com a CMP publicada.
- **c-08 · a detecção de bloqueador do café.** O ramo `!adsbygoogle.loaded` pode dar falso positivo com o script ainda carregando. Revisar com o anúncio real, ao ligar os anúncios.
- **b-07 · a retenção do GA4, do Victor.** A Privacidade diz "o período configurado no Google Analytics". Quando o Victor fixar a retenção no GA4, o número entra nos três idiomas. Na produção, o Cloudflare manda os cabeçalhos `Nel`/`Report-To` (relatório de erro de rede para `a.nel.cloudflare.com`) e `Speculation-Rules: "/cdn-cgi/speculation"` (Speed Brain). Os dois vêm da configuração da zona, fora do repositório. São do Cloudflare, que já é quem entrega o site, então o texto do Show HN continua certo ("o único terceiro é o Google Analytics"). O Victor decide se desliga o Speed Brain.
- **e-05 · `/_astro/*` em 404 com `immutable`.** O `_headers` não condiciona a regra ao status, e o hash muda a cada build. Só importa num rollback ou na defasagem de propagação de um deploy. A correção do a-01 (§ 102) cobre o efeito visível: a fala certa e nada travado.
- **Baixos para a run 3b**, cada um com a correção proposta no `REVISAO-F3.md`:
  - a-05: APNG perde a animação sem nota;
  - a-06: pt e es fora do `ads.spec.ts`;
  - b-06: GET com query e WebSocket fora da prova de "nada sai";
  - e-02: régua de memória do lote longo, com o ZIP montado cedo;
  - e-04: `favicon.ico` para o Google;
  - f-03: cor funcional, raio, sombra e os "Nunca" do README sem portão;
  - f-04: "1 files" no plural;
  - f-06: reserva do aviso reaberto que não se recalcula ao mudar a largura.
- **Por quê:** a decisão 4 do prompt (baixos só os da F2; médio só se local) e a régua de quem decide: design e anúncio ligado são do Victor.

## § 104 · O que a segunda passada achou e foi corrigido (F3, 31/out/2026)

- **Contexto:** a segunda passada rodou com três revisores novos (consentimento, motor e integridade dos testes) sobre o diff `736b1cd..1380bb8`. Os 19 achados corrigidos fecharam, cada um com a prova da primeira passada rodada contra o `dist/` novo e com mutantes dos testes novos. Não apareceu nenhum crítico nem alto. Apareceram dois médios, confirmados por céticos, e cinco baixos que dizem respeito aos testes e às correções desta run. Todos foram corrigidos aqui, porque são defeitos das próprias correções.
- **p2-motor-01 (médio) · o codec que não carrega, dentro do motor.** O a-01 cobria o chunk do motor, mas um `.wasm` ou a cola JS de um codec que não chega ainda virava "danificado" (HEIC) ou "este navegador não grava JPG" (Compress).
  - `FailureReason` ganhou `load`, e `loading()` em `src/engine/image/errors.ts` transforma em `EngineError('load')` a falha de cada carga sob demanda: os módulos de codec importados por `decode.ts`, `encode.ts`, `process.ts` e `work.ts`, a cola dos codecs do jSquash e o `compiled()` e o `bytesOf()` do `runtime.ts`.
  - A Compress de PNG deixa passar o `load` em vez de devolver o original com a nota de "não grava".
  - O motor segue autocontido.
  - Teste: com os `.wasm` bloqueados, a HEIC to JPG e a Compress dizem para recarregar; depois de liberar a rede, uma troca de opção processa o arquivo de novo. Isso cobre também o p2-integridade-05 (o `load` fora do `HOPELESS`).
- **p2-integridade-01 (médio) e p2-consentimento-02 (baixo) · o portão e o carregador por `src`.** A correção do c-03 conferia a trava só no corpo dos scripts. Um `<script src=".../adsbygoogle.js">`, o trecho que a ajuda do AdSense manda colar, passava. Agora qualquer `<script src>` do AdSense reprova, e o push é reconhecido em qualquer forma (`adsbygoogle….push(`). Teste: carregador por `src` e `window.adsbygoogle.push` sem trava reprovam.
- **p2-consentimento-01 (baixo, regressão do c-01) · o aviso que piscava.** A busca a cada 500 ms tinha trocado a checagem no `load`. Com a CMP presente antes do `load` (o caso comum), o aviso próprio ficava meio segundo na tela. O aviso volta a olhar a CMP no `load`, além da busca de 30 s, sem abrir uma segunda cadeia. Teste: com a CMP definida no `DOMContentLoaded`, o aviso some até 100 ms depois do `load`.
- **Testes reforçados:**
  - **p2-integridade-03:** o `launch-claims.spec.ts` também recusa query string.
  - **p2-integridade-04 e p2-motor-02:** o teste do `strip` confere os 18 chunks que a lista de permissão guarda no PNG, `fdAT`, `cICP`, `mDCV` e `cLLI` incluídos, e o `ANIM` e o `ANMF` no WebP.
  - **p2-motor-03:** o teste da caixa pequena do Crop prova que a metade de fora da alça ainda redimensiona. O mutante "caixa pequena nunca redimensiona" agora reprova.
  - **p2-integridade-02:** o teste do amarelo aceita `rgb()` com espaços e lê os `style` inline dos `.astro` e `.tsx`.
- **Por quê:** a decisão 4 do prompt pede uma segunda passada até não sobrar crítico nem alto. Não sobrou nenhum. Os médios novos eram locais, e os baixos eram falhas dos testes novos desta run. Deixá-los seria entregar testes que não provam o que dizem.

## § 105 · O tempo do CI na F3 e a proposta de um terceiro `--shard` do WebKit (F3, 31/out/2026)

- **Medido** (o total de cada parte, do resumo do `verificar` no log):

  | Run | Commit | `verificar` | Chromium | WebKit 1 de 2 | WebKit 2 de 2 |
  | --- | --- | ---: | ---: | ---: | ---: |
  | 41226056230 | `cf5fba8` (só o aviso) | 164,0 s | 391,0 s | 253,9 s | 430,8 s |
  | 41231605642 | `803ba1b` | 160,2 s | 312,5 s | 368,1 s | 598,7 s |
  | 41235192185 | `72f0c2d` | 202,0 s | 390,5 s | 383,2 s | 655,3 s (2 falhas, § 99) |
  | 41236243545 | `0d2cb94` | 201,5 s | 315,2 s | 375,8 s | 644,4 s |

- **O que a F3 somou:**
  - o `gate:prontidao`, de 10 a 15 s na parte `verificar`;
  - as specs novas (`cookie-footer`, `consent-choice`, `engine-paths` e `launch-claims`), uns 90 s somados no WebKit e uns 50 s no Chromium;
  - os passos novos em specs que já existiam, poucos segundos.
- **Por que a parte 2 do WebKit cresce:** ela fica com a matriz (uns 416 s somados nos 2 workers), o `image-smoke`, o `design` e o `launch-claims`. O mesmo runner variou de 30 a 40% entre execuções (§ 88), e a parte 2 foi de 431 s a 655 s entre a primeira e a última execução desta run.
- **Decisão:** todas as partes ficaram abaixo de 700 s, e nenhum limite, `retries` ou tempo por teste mudou. Como a parte 2 do WebKit ficou a uns 50 s do alvo, o relatório propõe ao Victor dividir o WebKit em três partes (`--shard=1/3`, `2/3` e `3/3`), um ajuste do `.github/workflows/ci.yml` que é do Victor (ADR-003). O `verificar.ts` já aceita qualquer `--shard=i/n`, e o `verificar.test.ts` cobre isso.
- **Alternativa:** mover a matriz para um projeto só dela, o que mexeria nos testes e no `.github/`.

## § 106 · O aviso de cookies não reserva espaço no fim da página, só para o foco do teclado (ajuste-aviso-espaco, 31/out/2026)

- **Contexto:** depois do merge da F3, o Victor viu em fileorca.com, a uns 1920 px, uma área azul-escura vazia de uns 220 px embaixo do rodapé, que só sumia ao aceitar os cookies: "fica todo esse espaço até eu aceitar os cookies". A § 91 tinha tirado a faixa clara (o padding no `body`) e passado a reserva para o rodapé. A reserva continuou: a altura do aviso, para todo mundo, enquanto ele estava aberto. Medido no código de antes: o rodapé termina com 240 px de padding a 360 px (24 do respiro mais 216 de reserva) e com 340 px quando a âncora do AdSense está na tela.
- **Decisão:** o aviso aberto flutua por cima do fim da página, como qualquer banner, e não reserva espaço ali. O espaço só abre quando a garantia da § 36 precisa dele: um elemento recebe o foco do teclado embaixo do aviso e a página já não tem como rolar o bastante. Nesse momento, o `focusin` abre a reserva do aviso no rodapé (`--fo-bottom-room`) e rola. A reserva fica aberta até o aviso sumir.
- **O que não muda:**
  - O `scroll-padding-bottom` segue contando o aviso e a âncora; ele não cria espaço na página, só serve para levar o foco para cima.
  - A âncora do AdSense mantém a reserva própria enquanto está na tela (§ 101).
  - O documento continua terminando no rodapé (§ 91).
  - O teste de 45 Tabs e o teste sem `scroll-padding` passam sem mudança.
- **A troca, aceita pelo pedido:** enquanto a pessoa não escolhe, o card cobre o canto de baixo à esquerda do rodapé no fim da página. A 1280 px ele cobre o link do café e parte da coluna Image; no celular, a base do rodapé. Quem usa mouse ou toque escolhe no próprio aviso, que segue não modal. O teclado nunca fica coberto.
- **Testes que mudaram:**
  - `tests/e2e/cookie-footer.spec.ts` (da F3): a volta pelas larguras e temas deixou de exigir a última linha do rodapé acima do aviso aberto. Agora exige o rodapé com o respiro normal de 24 px, sem reserva, e ganhou a largura de 1920 × 1035 do screenshot. O teste do último link do rodapé com foco também confere que a página segue terminando no rodapé. O teste da âncora confere que, sem foco, só a reserva da âncora existe (132 px) e que o foco no último link abre a reserva do aviso sem contar a âncora duas vezes.
  - `tests/e2e/events.spec.ts`, no teste "the footer coffee link sends donate_click…": ele fecha o aviso antes de clicar no link do café, porque o assunto dele é o evento e o card agora fica por cima do link no fim da página.
  - No código de antes, 8 testes do `cookie-footer.spec.ts` falharam com o rodapé a 240 px e 340 px; depois, os 178 testes de cookies, eventos, consentimento, café e axe passam nos dois navegadores.
- **Alternativa:** deixar o aviso em posição `sticky` no fim do fluxo. No fim da página, o resultado seria o mesmo bloco ocupado embaixo do rodapé, o mesmo espaço que o Victor recusou.

## § 107 · O `ads.spec.ts` espera o layout assentar depois de cada mudança de largura (ajuste-aviso-espaco, 31/out/2026)

- **Contexto:** no CI da PR do ajuste (run 41240391852, WebKit 1 de 2), o teste "/webp-to-jpg/: at rest, while processing, with the result and with a batch" falhou com "com a fila de dois arquivos: AdSlot a 133px de fo-tool-island". Aqui, o mesmo teste falhou 3 vezes em 6 no Chromium, com "`.fo-ba` na tela com o resultado: 0". Em outras rodadas, ele passou 12 vezes em 12 no build da F2 (`f549f1b`), no merge da F3 (`94a1428`) e no próprio build do ajuste. Era intermitente e não tinha relação com o aviso de cookies.
- **Causa:** a ilha decide por um `matchMedia('(min-width: 768px)')` se a comparação fica dentro do cartão ou embaixo dele. A troca só acontece no evento de mudança da media query e numa renderização logo depois. O `atBothWidths` media logo depois do `setViewportSize`, às vezes no meio da troca: a comparação ainda fora do lugar (sem caixa) ou o layout com a largura velha por um quadro.
- **Decisão:** depois de cada `setViewportSize`, o `atBothWidths` espera dois quadros de animação (`requestAnimationFrame` duas vezes) antes de medir. Nenhuma asserção, distância ou alvo mudou. O teste inteiro passa (52 testes nos dois navegadores), e o caso intermitente passou 12 vezes em 12.
- **Alternativa:** esperar uma condição específica da comparação, que só existe em parte das páginas e dos estados.

## § 108 · O WebKit do CI em três partes (ajuste-ci-webkit-tres, 31/out/2026)

- **Contexto:** na F3, a parte 2 do WebKit chegou a 644,4 s (§ 105), com alvo de 700 s e limite de 900 s, e o mesmo runner varia de 30 a 40% entre execuções (§ 88 e § 105). A F4 vai somar umas 25 páginas aos testes. Com `fullyParallel: true`, o `--shard` do Playwright divide por contagem de testes, na ordem dos arquivos.
- **Decisão:** a matriz do job `playwright` do `ci.yml` passa a ter `chromium`, `webkit 1 de 3`, `webkit 2 de 3` e `webkit 3 de 3`, com `--playwright=webkit --shard=1/3`, `2/3` e `3/3`. Com o `verificar`, o CI fica com cinco partes, cada uma com o limite de 900 s. O `merge` segue com `needs: [verificar, playwright]`, que espera todas as entradas da matriz. O Chromium segue numa parte só.
- **O que não mudou:** nenhum teste, portão, limiar, timeout, `retries` ou número de workers, nem os outros jobs, o `pos-deploy.yml` e o `scripts/ci/`. O `scripts/verificar.ts` também não: o `plan()` já aceita `--shard=1/3`, `2/3` e `3/3` (conferido aqui).
- **O `tests/unit/verificar.test.ts` ficou como está.** Ele não lê o `ci.yml`. A lista de partes dele é escrita à mão e segue com `1/2` e `2/2`. A ficha só manda ajustar teste ou script que leia a matriz, e nenhum lê (a revisão em contexto limpo procurou em `tests/` e `scripts/`). A asserção de cobertura tira o `--shard` antes de comparar, então vale para qualquer número de partes.
- **Divisão:** 90, 89 e 89 testes, que somam os 268 do WebKit.
  - A parte 1 fica com `a11y`, `ads` e 18 testes do `budgets`.
  - A 2 fica com 3 do `budgets`, `coffee`, os de consentimento e cookies, o `design` inteiro e 2 do `engine-paths`.
  - A 3 fica com o resto: a matriz, o `image-smoke`, o `events`, o `island`, o `navigation`, o `tool` e as specs menores de imagem.
- **Medido** (o total de cada parte, do resumo do `verificar` no log):

  | Execução | `verificar` | Chromium | WebKit 1 | WebKit 2 | WebKit 3 |
  | --- | ---: | ---: | ---: | ---: | ---: |
  | F3, 41236243545 (duas partes) | 201,5 s | 315,2 s | 375,8 s | 644,4 s | — |
  | 41250641460, tentativa 1 | 137,7 s | 404,3 s | 186,5 s | 250,4 s | 567,3 s |
  | 41250641460, tentativa 2 | 176,8 s | 395,7 s | 296,2 s | 200,9 s | 583,9 s |

  A parte mais lenta caiu de 644,4 s para 567,3 s e 583,9 s. Todas ficaram abaixo de 700 s nas duas execuções.
- **A parte 3 segue a mais pesada.** Ela fica com a matriz, que a divisão por contagem não separa, e tem 2 a 3 vezes o tempo das outras duas partes do WebKit. A folga dela para o alvo é de 116 a 133 s.
- **Disco na parte 2:** na tentativa 1, o `/` da parte 2 caiu de 10,9 GB livres para 609 MB em uns 60 s, em três degraus (2958, 4003 e 3327 MB). A janela começa nos testes da Oli a 1280 × 800 do `design.spec.ts` e segue pelos de movimento reduzido, de movimento e de regressão da mesma spec, a da § 90. O espaço não voltou até o fim.
  - Os 89 testes passaram.
  - O `du` das pastas medidas e o `find` de arquivos acima de 200 MB não acharam o espaço.
  - Na tentativa 2, a mesma parte ficou o tempo todo com uns 10,9 GB livres.
  - Nas quatro execuções recentes com duas partes (41231605642, 41237303682, 41240391852 e 41241805727) e na F3, nenhuma parte desceu de 9,7 GB livres.
  - Fica como risco registrado, sem contorno. Achar a causa pede mudar o diagnóstico (`scripts/lib/disco.ts`), que fica fora desta ficha.
- **Por quê:** a ADR-003 manda dividir mais, num ajuste, quando uma parte passa de uns 700 s, e a § 105 propôs o terceiro `--shard`. Feito antes da F4, o ajuste deixa a PR da F4 sem mexer no `.github/`, e ela mescla sozinha.
- **Alternativa:** mover a matriz para um projeto só dela (§ 105), o que mexeria nos testes. A outra seria uma quarta parte por contagem, que manteria a matriz quase inteira na última.

## § 109 · O diagnóstico de disco olha mais fundo quando o `/` cai, e o `find` do fim deixa de mentir (ajuste-ci-disco, 31/out/2026)

- **Contexto:** na run 41250641460, tentativa 1, o `/` da parte `playwright (webkit 2 de 3)` caiu de 10 897 MB livres para 609 MB em 60 s, durante o `design.spec.ts`, e não voltou até o fim (§ 108). O diagnóstico de então só olhava `.`, `/tmp`, `/dev/shm` e `$HOME` com o `du`, além de um `find / -xdev -size +200M`.
- **Correção da § 108:** a frase "o `find` de arquivos acima de 200 MB não achou o espaço" não vale. Aquele `find` nunca terminou.
  - Em todas as partes das execuções 41231605642, 41236243545, 41241805727 e 41250641460, o "(nenhum)" saiu exatos 20,0 s depois do título, que era o timeout do `execSync`.
  - O timeout matava só o `sh`, e o `sort` só imprime quando o `find` termina. Por isso o resultado vinha vazio e o `find` seguia órfão.
  - Desde a § 90, o passo custava 20 s em cada parte e não dizia nada.
- **Decisão:** o `scripts/lib/disco.ts` continua só lendo e só no Linux do CI.
  - **Busca funda.** Roda quando o `/` perde mais de 2048 MB (no máximo duas vezes durante a execução, e de novo no fim se o espaço não voltou). Ela mostra:
    - os arquivos apagados e ainda abertos no `/`, lidos do `/proc`, em blocos de disco, com os processos que os seguram e quantos processos não deu para ler, deste usuário e de outros;
    - os arquivos acima de 20 MB gravados desde o início, começando por `/tmp`, `/home` e `/var`;
    - o `du` de `/var/log`, `/var/tmp`, `/var/crash`, `/var/cache` e dos dumps de processo, e o `core_pattern`;
    - os maiores processos.
  - **A linha de base volta a subir** quando o espaço volta, então uma segunda queda também aparece.
  - **O `find`.** Roda com `timeout -k 5` e `nice -n 19` dentro do próprio comando e escreve "(interrompido em N s, resultado parcial)" ou "(completo em N s)". O do fim olha só `/tmp`, `/var` e `/home`, onde uma execução grava, e passou a terminar em 2 a 4 s.
  - **Nenhum erro do diagnóstico derruba a parte.** Cada seção da busca tem o próprio `try`.
- **O que não mudou:** nenhum teste, portão, limiar, timeout, `retries` ou número de workers, nem o `.github/`.
- **Teste novo:** `tests/unit/disco.test.ts`, com 8 testes.
  - Sete testam as partes puras: o `df`, o gatilho com a linha de base, o resumo dos arquivos abertos, o `find` e o rótulo de corte.
  - O último abre e apaga um arquivo e o acha no `/proc`. No Linux, ele roda de verdade no Vitest do job `verificar` do CI, e lá passou. Nos outros sistemas, o mesmo teste afirma que não há `/proc`, então ele nunca aparece como pulado.
- **Medido** (PR #10, run 41255949928, com o WebKit em três partes da § 108):
  - A parte 2 de 3 rodou cinco vezes: a primeira tentativa e mais quatro repetições só desse job.
  - Todas passaram, com o mínimo entre 10 885 e 10 898 MB livres, e nenhuma busca funda disparou.
  - Somadas as duas tentativas da run 41250641460, a queda apareceu 1 vez em 7 execuções da parte 2 de 3.
- **Causa:** segue desconhecida. O que já dá para dizer:
  - A queda não é de arquivo comum embaixo de `.` ou de `$HOME`.
  - Os candidatos são um arquivo apagado e ainda aberto, ou um arquivo numa pasta que o `du` não olhava, como `/var/log` ou os dumps. A busca funda mostra os dois na próxima vez.
- **Por quê:** o cartão desta run pediu o diagnóstico e a medida. Um `find` que estoura o tempo e diz "(nenhum)" engana quem lê o log.
- **Alternativa:** um passo no workflow que libera disco ou junta mais dados, mas isso mexe no `.github/` e é do Victor (§ 90). A outra seria rodar o diagnóstico fundo em toda parte, a custo de até uns 60 s de `find` em cada uma.

## § 110 · O catálogo de dinheiro, os ids de rota e uma ilha para todas as calculadoras (F4, 31/out/2026)

- **Contexto:** a ficha da F4 põe no ar, só em inglês, as 14 calculadoras e os 4 presets com `entra` no `data/keywords.csv`, o hub `/money-calculators/` e 5 guias. Ela deixa a divisão em chunks e o número de arquivos JS por página para a run fixar.
- **Decisão:**
  - **Registro único.** `src/tools/calc/registry.ts` é só dado serializável: `CALC_TOOL_IDS` (o hub mostra as de crédito primeiro), `CALC_PRESET_IDS`, `GUIDE_IDS`, `MONEY_HUB_ID` e, por página, o caminho, a mãe, o ícone, o grupo, os chips, as relacionadas, o guia e o nome fixo do arquivo exportado. Páginas, hub, home, rodapé, busca, portões e testes leem dele.
  - **Ids.** O id da rota é o slug com `/` trocado por `-` (`mortgage-calculator-extra-payments`); o do guia é `guides-<slug>`; o do hub, `money-calculators`. Toda rota de dinheiro tem `adArea: 'dinheiro'` e só o caminho em inglês (`moneyRoutes()` em `src/i18n/routes.ts`).
  - **Uma ilha.** `src/tools/calc/CalcIsland.astro` é o único `<script>` das calculadoras e dos guias: a entrada `mount.ts` hidrata duas raízes com uma store só, `#fo-tool-root` (campos, ResultHero, ExportBar, cenários e chips) e `#fo-calc-schedule` (o cronograma), para o primeiro AdSlot ficar entre os chips e o cronograma. A entrada leva a ilha, as 18 definições (`src/tools/calc/defs/`) e `src/calc/` inteiro, porque a conta é síncrona a cada tecla.
  - **Dois arquivos JS.** Toda página de calculadora, preset e guia carrega exatamente a entrada e o chunk `island`. O `astro.config.ts` não mudou. O `budgets.spec.ts` ganhou a lista `CALC_PAGES` (as 18 e os 5 guias, lidos do registro) com `CALC_JS_FILES = 2`, e o hub de dinheiro entrou em `HUB_PAGES`. O `TOOL_PAGES` das imagens não mudou.
  - **Sob demanda.** O PDF só no clique, pelo worker de PDF que já existia (§ 115).
- **Por quê:** uma entrada só faz a segunda calculadora custar só o HTML (1 requisição nova) e mantém as páginas de imagem com os mesmos 2 arquivos.
- **Alternativa:** uma entrada por calculadora, que pouparia uns 10 KB por página e custaria uma requisição a mais de calculadora para calculadora; ou o motor num worker, que tiraria a conta síncrona e o teste dos 16 ms.

## § 111 · A aritmética do dinheiro: centavos inteiros, taxa em décimos de milésimo e BigInt (F4, 31/out/2026)

- **Decisão:** `src/calc/money.ts`, sem dependência nenhuma (uma regra do ESLint recusa pacote em `src/calc`, com teste em `tests/unit/quality.test.ts`).
  - Dinheiro em centavos inteiros (number). Taxa como inteiro em 1/10.000 de ponto percentual: 6.5% = 65000, e 100% = `ONE` = 1.000.000.
  - Divisões em BigInt com arredondamento metade para cima (para longe do zero); juros de cada período = saldo × taxa ÷ períodos por ano, ao centavo.
  - Parcela pela fórmula fechada calculada como uma fração exata, arredondada ao centavo. A última parcela zera o saldo, no último período ou antes, quando a parcela cobre saldo e juros. Máximos (affordability) arredondados para baixo.
  - Taxa mensal de outra capitalização = piso de 10^30 × ((1 + r/n)^(n/12) − 1), por raiz inteira de Newton.
  - Laço acima de 1.200 meses dá o erro `too-long`; saldo acima de 10^15 centavos dá `too-large`.
- **Por quê:** é a convenção do oráculo (§ 126), que só bate no centavo sem ponto flutuante.

## § 112 · O número que a pessoa digita (F4, 31/out/2026)

- **Decisão:** `src/calc/parse.ts` lê "1,234.56" em inglês, "1.234,56" em português e espanhol (e o espaço fino como milhar) direto para inteiro escalado, sem `parseFloat`; formata à mão, sem `Intl`, para o HTML do servidor e o do navegador serem iguais. Campo de texto com `inputmode="decimal"`, nunca `type="number"`; ao sair do campo o número volta no formato da página. Testes em `tests/unit/calc-parse.test.ts`.

## § 113 · Os eventos das calculadoras, em listas fechadas (F4, 31/out/2026)

- **Decisão:** três eventos novos no `EVENT_PARAMS`: `calc_complete` (`tool`, `lang`), uma vez por carga, na primeira mudança válida feita pela pessoa (nunca na carga nem na leitura do link); `export_click` (`tool`, `lang`, `format`: `pdf` ou `csv`); `share_click` (`tool`, `lang`). O `next_step_click` aceita as calculadoras como alvo.
  - `tool` e `target` vêm de `src/analytics/tool-ids.ts` (as páginas de imagem e as 18 de dinheiro, escritas por extenso no grupo `island`), e `format` de `EXPORT_FORMATS`. Valor fora da lista cai, seja qual for.
  - O `consent.test.ts` passou a listar os nove eventos e prova que um número digitado nunca passa (asserção mudada e registrada aqui). O `events.spec.ts` prova os quatro eventos de ponta a ponta.
- **Por quê:** o critério 4 da ficha: nenhum número digitado vai para evento.

## § 114 · O link do cenário e a privacidade dos números (F4, 31/out/2026)

- **Decisão:** o link é `#v=1&<chave>=<valor>…`, com as chaves curtas dos campos e os valores em unidades do motor. A lista de dívidas vai como `d0b`, `d0r`, `d0m`…
  - A página lê o `#` uma vez, depois da hidratação. Cada valor passa pela faixa do campo e o inválido é ignorado; outra versão ignora o link inteiro; um par que o link quebre (entrada acima do preço) volta à base dos dois.
  - A página nunca escreve na URL. O botão monta o texto e copia; vira "Link copied" por 2 s num `role="status"`; sem área de transferência, mostra o link num campo só de leitura.
  - A marca da primeira comemoração da Oli é `sessionStorage['fo-calc-cheer'] = '1'`, nunca um número.
  - O guia preenche a calculadora pelas props e não lê o `#`; o link que ele copia aponta para a página da calculadora.
- **Prova:** `tests/e2e/money-privacy.spec.ts`, nas 18 páginas e nos dois navegadores, digita sentinelas longas em todo campo, abre o cronograma, baixa PDF e CSV, copia o link, clica num chip e abre o link copiado. Depois procura cada sentinela, em toda forma que ela pode tomar e sem dígito colado, nas requisições (URL e corpo, de qualquer origem), no `dataLayer`, no título, no `location.search`, nos dois storages, nos cookies e nos nomes de arquivo.

## § 115 · O PDF e o CSV (F4, 31/out/2026)

- **Decisão:**
  - **PDF.** `src/engine/pdf/report.ts`, no worker de PDF que já existia (método `report`), com o `@cantoo/pdf-lib` e as fontes padrão (só WinAnsi; `winAnsi()` troca o que a fonte não tem). Página Letter, com o nome da calculadora, o que a pessoa digitou, os resultados, as premissas, o cronograma inteiro, o aviso de ferramenta educativa, "Made with the free calculators at fileorca.com" e "Page n of N". O `src/tools/image/pdf-client.ts` ganhou `buildReport`, carregado só no clique.
  - **CSV.** Sai da ilha: BOM UTF-8, vírgula, ponto decimal sem milhar, aspas pela RFC 4180, CRLF, cabeçalho e as mesmas linhas da tabela (a tabela por ano ganha o ano como primeira coluna).
  - **Nomes fixos** do registro (`mortgage-schedule.pdf`), sem número.
  - **Falha.** Uma falha ao carregar o PDF mostra "Oli couldn't load the PDF maker. Reload the page and try again." num `role="alert"`, e a calculadora segue funcionando.
- **Prova:** `tests/e2e/money-calc.spec.ts` lê o CSV de volta contra o cronograma do oráculo, linha por linha, nas seis calculadoras de cronograma, e confere o PDF da hipoteca no `strictPdf` e pelo texto do content stream (`tests/e2e/lib/pdf-text.ts`). `tests/unit/calc-report.test.ts` confere o relatório no Node.

## § 116 · As faixas fixas dos campos (F4, 31/out/2026)

- **Decisão:** cada campo tem uma faixa fixa, e a fala do erro diz a faixa ("Enter a rate from 0 to 40%."). A tabela completa está em `docs/relatorios/fase-04-plano.md`, seção 5. As principais:
  - preço do imóvel de $10,000 a $20,000,000; prazo de 1 a 40 anos (Loan amortization, 1 a 50);
  - juros de empréstimo de 0 a 40%; APR de cartão e de dívida de 0 a 60%;
  - imposto do imóvel de $0 a $1,000,000 por ano; seguro de $0 a $100,000; PMI e HOA de $0 a $10,000 por mês;
  - de 1 a 10 dívidas; meses de 1 a 1.200 onde há laço.
- **Valor inválido:** mantém o último resultado, com `aria-invalid`, a mensagem ligada por `aria-describedby` e a linha "Fix the highlighted field to update the result.". `tests/unit/calc-defs.test.ts` confere cada erro contra a faixa do campo.

## § 117 · O molde da página de calculadora (F4, 31/out/2026)

- **Decisão:** `src/tools/calc/CalcTool.astro`, um molde para as 14 e os 4 presets (sem o sufixo `Page`, fora do glob do `ads-pages.test.ts`):
  1. breadcrumb, H1, a linha do que a página responde, "Reviewed by … on … First published …" (`data-ymyl="reviewed"`, com `<time datetime>`) e o selo "Your numbers stay on your device";
  2. a ilha: campos principais, ResultHero com SplitChart, ExportBar (PDF amarelo, CSV e Copy link, nessa ordem), os campos de baixo, ScenarioCompare onde a conta compara e os chips. Lado a lado a partir de 768 px; no celular, o resultado logo depois dos campos principais (§ 124);
  3. o primeiro AdSlot, a 150 px dos chips;
  4. o cronograma recolhido por ano, montado só ao abrir, com o primeiro ano aberto;
  5. como usar, como funciona (fórmula, premissas, exemplo resolvido pelo motor, fontes e aviso), presets, perguntas, privacidade, relacionadas e o AdSlot do trilho.
- **Nomes:** o ResultHero é `.fo-rhero`, porque `.fo-hero` é o herói da home. O schema é `WebApplication` com `applicationCategory: 'FinanceApplication'` e sem nota, mais `BreadcrumbList` e `Person`.
- **Voz:** o `aria-live` do ResultHero fala 500 ms depois da última tecla e é a única voz do resultado. O "Link copied" tem o `role="status"` dele; o erro do campo tem `role="alert"`.

## § 118 · O hub, a home, o rodapé e a busca (F4, 31/out/2026)

- **Decisão:**
  - **Hub.** `/money-calculators/` (`src/views/MoneyCalculatorsView.astro`), no molde do `/image-tools/`: o `fo-hubband` com H1, a grade (crédito primeiro, depois as educativas), um AdSlot de conteúdo, a tabela dos presets, a lista dos guias e "How these calculators work" com os blocos `data-ymyl`. Schema `CollectionPage`, `BreadcrumbList` e `Person`.
  - **Home** em inglês: uma seção de dinheiro abaixo da de imagem, com as cinco de crédito (Mortgage, Refinance, Auto loan, Personal loan e Home affordability) e o link do hub, sem anúncio.
  - **Rodapé** em inglês: a coluna Money, com o hub e as mesmas cinco. Nenhuma página fica órfã: as outras saem do hub, dos chips e das relacionadas.
  - **Busca:** as 18 e os 5 guias, na categoria "Money calculators".
- **Testes mudados:** o `image-hub.test.ts` passou a procurar os cartões de imagem só na seção "Choose a tool", porque a home ganhou a seção de dinheiro, e ganhou a asserção da seção nova.

## § 119 · Os guias (F4, 31/out/2026)

- **Decisão:** `/guides/<slug>/` (`src/views/GuideView.astro`, texto em `src/i18n/en/guide-<slug>.ts`).
  - O texto tem de 800 a 1.500 palavras, contadas por teste em `tests/unit/calc-guides.test.ts`.
  - A calculadora embutida é a mesma ilha, preenchida com o exemplo do texto por propriedade da página.
  - Todo número do texto sai do motor no build (`src/tools/calc/guides.ts`), e o exemplo principal está nas fixtures como `guide:<slug>`.
  - Cada guia tem uma tabela medida pelo motor no build, com a data (o custo dos dois prazos em várias taxas, por exemplo), e os blocos `data-ymyl`.
  - O AdSlot vem só depois da calculadora. Schema `Article` com autor `Person`, `datePublished` e `dateModified`.
- **Canibalização:** o guia responde "por quê" e "quando" e leva à calculadora; o título e o H1 não repetem os da calculadora.

## § 120 · O portão de dinheiro conta as páginas pelo mapa de rotas (F4, 31/out/2026)

- **Decisão:** o `gate:dinheiro-saude` exige que o número de páginas conferidas seja igual ao de rotas com `adArea: 'dinheiro'` (`expectedYmylPages()` em `scripts/lib/ymyl.ts`). Zero reprova. Hoje são 24 de 24: o hub, as 18 e os 5 guias. O `routes.test.ts` garante a área `dinheiro` em toda rota que sai do registro das calculadoras, dos guias e do hub, lendo os ids, não a URL. Nenhum domínio oficial novo entrou na lista: as fontes são do CFPB e do Federal Reserve.

## § 121 · O portão de conteúdo nas calculadoras (F4, 31/out/2026)

- **Decisão:** o `gate:conteudo` passou a conferir as 18 páginas pelo registro: "como usar" com 3 passos ou mais (`data-content="how"`), 4 perguntas ou mais, a nota de privacidade com "Your numbers stay on your device" e as relacionadas. Cada preset tem três blocos próprios (`data-content="own"`), que a mãe e os irmãos não têm.

## § 122 · Título e H1 das páginas de dinheiro sem diferença de caixa (F4, 31/out/2026)

- **Decisão:** o título vem em Title Case ("Mortgage Calculator with Taxes, Insurance and PMI") e o H1 em sentence case ("Mortgage calculator"), como o design system pede. O `titleProblem` de `scripts/lib/seo-pages.ts` compara sem caixa nas páginas de dinheiro, e só nelas.

## § 123 · O `lint:texto` lê os textos de dinheiro como a pessoa os lê (F4, 31/out/2026)

- **Decisão:** nos arquivos de texto de dinheiro (`isMoneyText`), o `lint:texto` troca cada `{placeholder}` por um valor realista antes de mandar ao LanguageTool local. Os guias usam os números que o motor dá à página (`fillFor`); as calculadoras usam as amostras de `MONEY_SAMPLES`; um nome sem amostra vira uma quantia ("$1,234"). Os outros textos seguem com o preenchimento da F1a. Teste em `tests/unit/lint-texto-money.test.ts`.
- **Por quê:** "{payment} a month" virava "payment a month" e dava erro de gramática falso.

## § 124 · No celular, o resultado acima da dobra a 360 × 740 (F4, 1/nov/2026)

- **Contexto:** o teste novo do `ads.spec.ts` mediu o número do ResultHero entre 760 e 1.988 px na primeira versão. O topo da calculadora reservava 96 px à direita (o lugar da Oli da DropZone, que a calculadora não tem), os campos de taxa de meia largura quebravam em três linhas com a ajuda e a etiqueta "example", e as listas de dívidas vinham antes do resultado.
- **Decisão:**
  - `.fo-top--calc` tira os 96 px nas calculadoras e nos guias.
  - Os campos principais ficam em no máximo duas linhas de dois campos de meia largura. Neles não há ajuda fixa, e o rótulo cabe numa linha com a etiqueta: "Interest rate" virou "Rate"; "15-year rate" virou "15-yr rate"; "Balloon due with payment" virou "Balloon with payment"; "Other debt payments per month" virou "Monthly debts"; "Yearly income before taxes" virou "Gross yearly income"; "New loan rate" virou "New rate". O que a ajuda dizia foi para os passos do "como usar".
  - O que não cabe desce para depois do resultado, com um título: a troca da Auto loan, os meses restantes da Refinance, o prazo da Home affordability e o do preset de pagamento extra, a taxa da Savings goal, e as listas de dívidas da Debt payoff e da Debt consolidation.
  - O modo da Credit card payoff e da Savings goal virou um `<select>` de meia largura ("I want to know": "The time" ou "The payment").
  - A entrada perdeu a linha com a outra unidade ("$75,000.00" sob "20 %"): o menu de unidade converte. O "$" do campo saiu, porque o menu já mostra "$" ou "%".
  - Três leads foram encurtados para duas linhas.
  - Uma duração no ResultHero ("3 years 1 month") mantém os números grandes e as palavras no tamanho da unidade, numa linha só.
- **Medido** (Chromium e WebKit, número do resultado a 360 × 740): de 590 a 727 px nas 18; as três páginas de preset da hipoteca ficam em 727 px, porque a trilha de navegação delas tem três linhas.
- **Por quê:** é a decisão 5 da ficha. O teste vale para as 18 nos dois navegadores.
- **Alternativa:** tirar o "Reviewed by" do topo (o molde do plano o põe lá) ou diminuir o ResultHero abaixo do design system.

## § 125 · A busca em inglês conta as páginas de dinheiro (F4, 1/nov/2026)

- **Decisão:** sem nada digitado, a busca lista 34 páginas em inglês: as 8 ferramentas e 3 presets de imagem, as 18 de dinheiro e os 5 guias. O `a11y.spec.ts` ("search dialog open with every page listed") e o `navigation.spec.ts` ("the search box lists every page on a phone") passaram a somar `CALC_PAGE_IDS` e `GUIDE_IDS` à conta, lida dos registros. Asserção mudada por construção; o teste segue igual.

## § 126 · O oráculo, a correção do meio centavo e os exemplos oficiais (F4, 31/out/2026)

- **Decisão:** `scripts/oracle/calc.py`, com numpy-financial 1.1.0 e um laço em `decimal`, gravou `fixtures/calc/` (18 arquivos, 3.034 casos) no commit `d1c0243`, antes de qualquer arquivo de `src/calc/` (`4397124`). Ele roda com `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py`, e o `--check` compara sem gravar. O cabeçalho de cada arquivo traz o SHA-256 do script (fim de linha LF) e as versões.
- **Correção** (`305c0da`, antes do motor): um empréstimo de 1 mês de $15,000 a 29.99% tem parcela exata de $15,374.875. O oráculo elevava a taxa mensal dízima a uma potência em `decimal` e perdia o meio centavo. A parcela e o valor presente passaram a ser uma divisão inteira. Só 4 casos da grade mudaram.
- **Exemplos oficiais:** os que batem pela convenção entram como casos marcados (H-24 do CFPB, Regulation Z Apêndice J, Regulation DD Apêndice A, as páginas do CFPB sobre carro e a documentação do numpy-financial). Os que só batem com outra convenção ficam de fora, com o motivo, em `fixtures/calc/OFICIAIS.md`: os juros de $3,024 do carro em 72 meses, o total do `ipmt`, o `fv` sem arredondamento e o ano 1 do exemplo de juros compostos do CFPB.
- **Mutante:** uma cópia das fixtures com um centavo mudado (`CALC_FIXTURES_DIR`) reprova o `calc-oracle.test.ts` (saída no relatório da F4).

## § 127 · As convenções que cada calculadora fixa (F4, 31/out/2026)

- **Decisão:** as convenções valem para o motor e para o oráculo, e cada página as declara nas premissas:
  - **Mortgage:** imposto e seguro anuais ÷ 12, metade para cima. PMI e HOA são mensais e o PMI não termina sozinho. A entrada vai em $ ou em % do preço.
  - **Personal loan:** a tarifa sai do valor recebido. A APR é atuarial (Apêndice J) sobre as parcelas reais, em centésimos de ponto, metade para cima.
  - **Auto:** financiado = preço + impostos e taxas − entrada − troca, nunca abaixo de zero.
  - **Refinance:** o empate é o primeiro mês em que custos de fechamento + juros pagos no novo ≤ juros que o atual teria cobrado até ali. O atalho custos ÷ economia mensal também aparece.
  - **Home affordability:** tetos de 28% e 36% (campos) sobre a renda bruta mensal, para baixo. O empréstimo máximo é o valor presente da parcela que sobra, para baixo.
  - **Compound interest:** taxa mensal efetiva da capitalização escolhida (§ 111), depósito no começo ou no fim do mês.
  - **Credit card:** APR ÷ 12 sobre o saldo, sem compra nova. Um pagamento que não cobre os juros do primeiro mês dá o mínimo.
  - **Debt payoff:** orçamento constante (soma dos mínimos + extra). Snowball pelo menor saldo inicial, avalanche pelo maior APR, empate pela ordem digitada. O mínimo de uma dívida quitada fica no orçamento.
  - **Rent vs buy:** o caminho mais barato investe a diferença do mês, e o inquilino começa com a entrada investida. Valor, manutenção e aluguel mudam uma vez por ano. Não há imposto de renda, dedução ou ganho de capital.
  - **Biweekly:** 26 meias parcelas por ano (meia = parcela ÷ 2, metade para cima), com juros de cada quinzena à taxa ÷ 26. Os meses são as meias parcelas × 12 ÷ 26, para cima.
  - **Balloon:** a parcela vem do prazo de amortização; o balão é o saldo depois da parcela do mês do balão.
  - **Savings goal:** depósito no fim do mês; o depósito é o menor valor em centavos que chega à meta no prazo.
  - **Simple interest:** ano de 365 dias.
  - **APR to APY:** (1 + r/n)^n − 1 e o inverso, em duas casas, metade para cima (Regulation DD § 1030.3(f)(1)).

## § 128 · O link do cenário se perdia numa carga rápida (F4, 1/nov/2026)

- **Contexto:** o `mount.ts` aplica o link logo depois do `hydrate()`, e o Preact assina a store num `useEffect`, que roda depois. Numa carga rápida, a mudança chegava antes da assinatura e a página ficava com o exemplo. O `money-calc.spec.ts` pegou o defeito, que o teste de privacidade não via.
- **Decisão:** o `useCalc` (`src/tools/calc/store.ts`) guarda o estado do render e, ao assinar, repinta se a store mudou no meio.

## § 129 · Tabela larga rola dentro da moldura, nunca a página (F4, 1/nov/2026)

- **Contexto:** a 320 px, os cinco guias rolavam para o lado (de 536 a 713 px), porque as células sem quebra da tabela medida alargavam a coluna da página. O cronograma aberto fazia o mesmo (540 px).
- **Decisão:** `.fo-table-wrap` e `.fo-amort-wrap` ganharam `width: 0; min-width: 100%`. A tabela rola dentro da moldura (que já era uma região com foco), e a página fica em 320 px. O teste de reflow do `design.spec.ts` pega os guias pelo mapa de rotas; o `money-calc.spec.ts` confere o cronograma aberto a 320 px.

## § 130 · A linha do café fica fora das calculadoras nesta fase (F4, 31/out/2026)

- **Decisão:** a ilha das calculadoras não mostra a linha do café, como a ficha manda. O link do rodapé continua em toda página.

## § 131 · O que a ilha das calculadoras reaproveita das imagens (F4, 31/out/2026)

- **Decisão:**
  - As páginas de calculadora passam `PANEL_POSES` ao layout, porque o ResultHero usa a pose `cheer`. O sprite é o mesmo das ferramentas de imagem.
  - O `OptionGroup` e o `Icon.tsx` vêm de `src/tools/image/` e `src/icons/`. Os ícones da ilha chegam como miolo de SVG pelas props, para o chunk `island` das imagens não mudar de conteúdo.
  - O `pdf-client.ts` de `src/tools/image/` ganhou `buildReport`, carregado só no clique.

## § 132 · O nome "15-year vs 30-year" (F4, 31/out/2026)

- **Decisão:** o preset e o guia escrevem "15-year vs 30-year" (o `data/keywords.csv` tem "15 vs 30 year"). É a forma que o LanguageTool aceitou sem aviso, e deixa claro que os dois números são prazos em anos. Na meia largura do celular, os rótulos dos campos são "15-yr rate" e "30-yr rate" (§ 124).

## § 133 · O uv instalado nesta máquina para o oráculo (F4, 31/out/2026)

- **Contexto:** a máquina não tinha Python nem o uv no PATH.
- **Decisão:** o uv foi instalado uma vez pelo `winget` (pacote `astral-sh.uv`) e é chamado pelo caminho completo. Ele baixa o Python 3.13 e o numpy-financial 1.1.0 num ambiente temporário. Nada disso entra no `package.json`, no lockfile nem no CI: o CI lê as fixtures commitadas, e o `calc-oracle.test.ts` confere o SHA-256 do script.

## § 134 · Os 20 blogs de finanças (F4, 31/out/2026)

- **Decisão:** `docs/lancamento/blogs-financas.md` traz 20 blogs de finanças pessoais dos EUA, com o motivo da escolha, a página de contato lida e um rascunho de e-mail em inglês para cada um. Nada foi enviado nem preenchido: o envio é do Victor (fora de toda run).

## § 135 · Lighthouse, screenshots e a medida dos 16 ms (F4, 1/nov/2026)

- **Decisão:**
  - O `lighthouserc.json` ganhou `/mortgage-calculator/` e `/guides/15-vs-30-year-mortgage/`, com as mesmas asserções: desempenho ≥ 0.9 e CLS ≤ 0.05 na mediana. Na máquina local, os dois deram 99 de desempenho e CLS 0.000.
  - O `pnpm screenshots` grava em `docs/relatorios/fase-04/componentes/` (a pasta da F3 fica como estava), com os componentes de calculadora e as páginas de dinheiro a 360 e 1280 px, nos dois temas.
  - O `tests/e2e/money-speed.spec.ts` mede 30 teclas dentro da página, do evento `input` ao `MutationObserver` ver o ResultHero mudar, na Rent vs buy, na Debt payoff com 10 dívidas e no preset de pagamento extra. No Chromium, a p95 tem de ficar em até 16 ms; o WebKit mede e imprime, porque o relógio dele anda de 1 em 1 ms e a ficha fala do Chromium.

## § 136 · O JS das páginas, antes e depois da F4 (F4, 1/nov/2026)

- **Medido** com o `budgets.spec.ts` no Chromium, JS próprio em gzip com o inline. "Antes" é a `main` em `92f2b5b`, num worktree à parte; "depois" é a branch `fase-04`:

| Página | Antes | Depois |
| --- | --- | --- |
| `/compress-image/` | 20,3 KB, 2 arquivos, 6 requisições | 20,6 KB, 2 arquivos, 6 requisições |
| `/crop-image/` | 22,5 KB | 22,9 KB |
| `/resize-image/` | 20,5 KB | 20,9 KB |
| as outras de imagem | 20,1 a 20,3 KB | 20,4 a 20,7 KB |
| `/image-tools/` | 3,3 KB, 0 arquivos, 4 requisições | 3,3 KB, 0 arquivos, 4 requisições |
| as 18 de dinheiro e os 5 guias | (não existiam) | 37,5 KB, 2 arquivos, 6 requisições (38,0 KB depois das correções da revisão, § 139) |
| `/money-calculators/` | (não existia) | 3,6 KB, 0 arquivos, 4 requisições |

- **Por que as de imagem subiram 0,3 a 0,4 KB:** o chunk `island` é o mesmo para imagem e dinheiro. Ele ganhou a lista de ids das calculadoras em `tool-ids.ts` e os eventos novos (§ 113).
- **Pares:** de imagem para calculadora, 2 requisições novas (o HTML e a entrada); de calculadora para calculadora, 1 (o HTML); do hub para uma calculadora, 3 (o HTML, a entrada e o `island`). Todas cabem no orçamento de 3.

## § 137 · Dois campos lado a lado dividem a linha do rótulo (subgrid) (F4, 1/nov/2026)

- **Contexto:** no screenshot de 1280 px, o campo de HOA ficava 34 px abaixo do de PMI, que tem uma linha de ajuda embaixo. O `.fo-field` esticava até a altura da linha da grade, e a sobra ia para as linhas `auto` dele, inclusive a da caixa: a caixa do HOA chegava a 86 px a 1280 e 96 px a 360, contra os 52 do `control-h`. As lentes de design e de acessibilidade acharam o mesmo (DES-1). A primeira tentativa, `align-items: start`, desalinhava ao contrário quando um rótulo quebrava em duas linhas ("Home insurance per year" a 360 px).
- **Decisão:** o `CalcField` passa a ter dois filhos, o rótulo e o corpo (`.fo-field__body`: a caixa, a ajuda e o erro). Cada item da `.fo-calc__fields` ocupa duas linhas da grade, e o campo as usa com `grid-template-rows: subgrid`. Os dois campos de uma linha dividem a altura do rótulo, as caixas começam juntas e ficam com 52 px. A etiqueta "example" fica centrada no rótulo, que deixa de ter 21 px.
- **Prova:** `money-calc.spec.ts`, "two fields side by side keep their inputs on one line" e "the box of every field is control-h high", a 360 e a 1280 px, com ajuda, etiqueta e erro.

## § 138 · O orçamento espera a página ficar quieta sem o `networkidle` (F4, 1/nov/2026)

- **Contexto:** no CI, a parte 2 do WebKit falhou duas vezes seguidas no `budgets.spec.ts` dos hubs (o `/money-calculators/` na execução 41272269545; o `/image-tools/` e o `/money-calculators/` na 41273044165). O `page.waitForLoadState('networkidle')` estourou os 60 s. Os traces do artefato `playwright-report-2` mostram as cinco requisições de cada hub respondidas com 200 em menos de 2 s. A página estava quieta, e o evento do Playwright nunca veio. Na máquina local, a mesma parte passa inteira.
- **Decisão:** o `budgets.spec.ts` espera de outro jeito, num `settler` próprio. Ele aguarda o evento `load` e depois 1 s sem requisição nova, com todas respondidas ou falhas. Também espera os corpos dos scripts que mede. É mais rígido que o `networkidle`, que pede 0,5 s. Passados 20 s sem a página assentar, o teste falha listando as requisições abertas, em vez de travar. Os limites do orçamento não mudaram, e nenhum `retries` entrou.
- **Por quê:** a própria documentação do Playwright desaconselha o `networkidle`, e o trace provou que o site não segurava a rede.

## § 139 · A revisão adversarial da F4 e o que ela corrigiu (F4, 1/nov/2026)

- **Método** (F3, § 92 a § 94):
  - **Lentes.** Seis lentes Sonnet em contexto limpo, sobre o commit `ebfd6c1`, na worktree só de leitura `.claude/worktrees/revisao-f4`, com install e build próprios. Cada lente teve a sua porta (4174 a 4179) e a sua pasta em `.cache/`.
  - **Céticos.** Um cético por achado crítico, alto ou médio, e um por lente para os baixos, num total de 30 agentes.
  - **Correções.** Feitas num agente só, com um teste que falha sem cada uma.
  - **Segunda passada.** Revisou o diff `ebfd6c1..5d3f16b` e achou 2 médios e 5 baixos, todos corrigidos com teste em `5924a33` e `381fc3f`: o PDF e o CSV também ficam desligados com o resultado velho; o grupo de opções sai do subgrid; o cabeçalho "Balance" acompanha o saldo; e há casos do oráculo dos dois lados de 10^15 centavos.
- **Resultado:**
  - **Achados.** 54, sendo 2 refutados. Nenhum crítico ficou de pé: o único foi rebaixado a médio pelo cético. Ficou 1 alto (DES-1, § 137).
  - **Corrigidos.** Todo achado de severidade média ou alta, depois do cético, e os baixos de correção local.
  - **Pendentes.** Os outros baixos vão para o relatório. A tabela completa, com commit e teste de cada correção, está em `docs/relatorios/REVISAO-F4.md`.
- **O que mudou de comportamento:**
  - **Savings goal.** Passa a dar "too-large" acima de 10^15 centavos, como a Compound interest. O oráculo mudou antes (`8544ebe`) e o motor depois (`a5b1a50`), com três casos novos.
  - **Problema no resultado.** Enquanto o resultado é um problema (um pagamento abaixo dos juros, dívidas acima do limite), o PDF e o CSV ficam desligados e a Oli não comemora. A comemoração da visita espera um resultado.
  - **Voz do resultado.** A região viva do ResultHero fala 500 ms depois da última tecla, também a que não muda o número.
  - **Campo que aceita negativo.** A valorização do imóvel abre o teclado de texto, porque o decimal do iPhone não tem o sinal de menos.
  - **Raiz inteira.** O `iroot` começa de uma estimativa de ponto flutuante. São as mesmas raízes, conferidas uma a uma em 9.064 casos. A APY para APR caiu de 22 ms para 1,6 ms por tecla e entrou no teste dos 16 ms.
  - **Textos.**
    - O FAQ da Personal loan explica a tarifa somada ao saldo de modo que a APR fique certa.
    - As premissas do Biweekly não se contradizem mais.
    - A Privacidade, nos três idiomas, cita a marca de sessão da Oli, com a data de 1/nov/2026 (os Termos também ganharam a data).
    - Cada guia linka a página da calculadora que embute.
    - O schema `WebApplication` usa o H1.

## § 140 · O ResultHero no celular e a comemoração no fim do cartão (F4, 1/nov/2026)

- **Decisão:**
  - **Tamanhos no celular.** Abaixo de 768 px, o número do ResultHero fica em 48/52 px e o cartão tem `space-5` de respiro. A partir de 768 px, valem os tamanhos do design system: 60/64 px e `space-6`. É o que deixa o resultado acima da dobra a 360 × 740 (§ 124). O README do ResultHero não fixa os tamanhos do celular, e a lente de design pediu o registro (DES-11).
  - **Comemoração no fim do cartão.** A Oli em `cheer`, com a Placa, entra no fim do cartão, depois do gráfico. Na primeira tecla da visita, ela entrava acima do número e o empurrava 96 px para baixo, e no celular ele saía da dobra. Isso foi visto na prévia; o commit é o `69eb38e`, com teste no `money-calc.spec.ts`.

## § 141 · O `ENOSPC` do WebKit voltou, agora na parte 3 (F4, 1/nov/2026)

- **Contexto:** na execução 41275792910 (commit `5d3f16b`), a parte `playwright (webkit 3 de 3)` falhou em dois testes do `design.spec.ts` que a F4 não tocou: "processing: the swim loops" e "support page: the coffee steam rises in a loop". Os dois morreram com `browserContext.close: ENOSPC: no space left on device, write` às 05:21:04.
- **O que o diagnóstico da § 109 mostrou:**
  - Às 05:10:49, durante os testes da Oli a 1280 × 800, o `/` caiu de 10.883 para 7.737 MB livres. A busca funda disparou e não achou arquivo apagado e aberto, arquivo acima de 20 MB gravado, pasta de sistema grande nem core dump; o `find` foi interrompido em 60 s. O espaço voltou a 10.873 MB.
  - Às 05:20:50, havia 10.220 MB livres. Os dois testes caíram 14 s depois, e às 05:21:05 o disco já estava com 10.880 MB livres. A amostra de 20 s não pegou o fundo da queda.
- **O que se sabe:**
  - A queda segue o `design.spec.ts` (Oli e movimento) no WebKit do Linux, qualquer que seja a parte em que ele cai. Na § 108 ela foi na parte 2.
  - Ela some em segundos. Na F4, o `design.spec.ts` passou para a parte 3, porque as páginas novas empurram os testes pela divisão por contagem.
  - As execuções 41274088572 (`5eee3a5`) e anteriores da mesma PR passaram nessa spec.
- **A segunda vez seguida:** na execução 41276724285 (commit `e45415e`), na mesma parte, caíram outros dois testes da mesma spec: "result, start over and back to idle" e "/support/", com movimento reduzido. Foi às 05:24:4x, e a amostra pegou o `/` com 8.244 MB livres, ainda descendo. De novo a busca funda não achou arquivo, e 155 processos de outros usuários não puderam ser lidos.
- **Hipótese, não provada:** o `core_pattern` do runner manda os dumps para o `systemd-coredump`, que roda como root. Um processo do WebKit que cai nessa spec geraria um dump grande. Ele encheria o `/` por segundos e seria descartado acima do limite do `systemd-coredump`, sem deixar arquivo. Isso explicaria a queda e a volta rápidas. Para confirmar, basta um `coredumpctl list` no fim das partes do WebKit.
- **Decisão:** nada muda em teste, `retries`, timeout ou workflow. A F4 não pode mexer no `.github/`, e o diagnóstico é de outro ajuste (§ 109). Quando a parte cair por `ENOSPC`, roda de novo só ela (`gh run rerun --failed`, a prática do `CLAUDE.md`), e cada ocorrência vai para o relatório. Fica a proposta para um ajuste do Victor:
  - um `coredumpctl list` no fim das partes do WebKit;
  - desligar os core dumps dos navegadores no CI;
  - amostrar o disco a cada 2 s durante o `design.spec.ts`.

## § 142 · Os specs de dinheiro se chamam `money-*` para o `design.spec.ts` voltar à parte 2 (F4, 1/nov/2026)

- **Contexto:** depois dos testes novos da revisão (commit `5d3f16b`), a parte 3 do WebKit caiu por `ENOSPC` em três de quatro execuções: 41275792910, 41276724285 e 41278520009. A § 141 tem as duas primeiras.
  - Na terceira, os testes que caíram foram outros: dois do `image-batch.spec.ts`. O `/` foi a 2.611 MB livres às 05:54:38.
  - Na mesma hora havia um `WPEWebProcess` com 1,16 GB de memória, e 3 processos do próprio usuário não deixaram ler o `/proc`; os processos do WebKit rodam numa sandbox.
  - Antes da revisão, a parte 3 passava.
- **A causa provável:** o `--shard` divide por contagem de testes, na ordem dos arquivos (CLAUDE.md, "Ajuste: WebKit em três partes"). Os 55 testes de dinheiro do WebKit (`calc.spec.ts`, `calc-privacy.spec.ts` e `calc-speed.spec.ts`) entravam entre o `budgets` e o `coffee`. Eles empurraram 41 dos 50 testes do `design.spec.ts` para a parte 3, junto com a matriz e os lotes de imagem.
  - A Oli em movimento e o processamento de imagem são os testes que mais pesam no WebKit, e passaram a rodar ao mesmo tempo, na mesma parte.
  - Antes da F4, o `design.spec.ts` ficava na parte 2, com os de cookies e o do café.
- **Decisão:**
  - **Nomes novos.** Os três specs passam a se chamar `money-calc.spec.ts`, `money-privacy.spec.ts` e `money-speed.spec.ts` e caem depois do `design.spec.ts` na ordem. O `--list` das partes do WebKit fica assim:
    - parte 1: o `a11y`, o `ads` e o começo do `budgets`;
    - parte 2: o `design` inteiro (50 testes), o resto do `budgets`, o `coffee`, o `events` e os de cookies;
    - parte 3: a matriz e os testes de imagem, mais os de dinheiro.
  - **O que não mudou:** nenhum teste, contagem, limite, `retries` ou workflow. O commit dos nomes novos roda o CI inteiro de novo; a execução vermelha 41278520009 não foi repetida, para o `merge` não decidir sobre um commit antigo.
  - **Referências.** As do CLAUDE.md, das §§ desta run, do plano, da revisão e do relatório foram atualizadas para os nomes novos.
- **Alternativa:** um quarto `--shard`, ou liberar disco no começo dos jobs do WebKit. As duas mexem no `.github/` e ficam com o Victor, com a proposta da § 141.

## § 143 · As duas dependências do PDF e os textos de licença (F5a, 1/nov/2026)

- **O que entrou:** só as duas da decisão 2 da ficha.
  - `pdfjs-dist` 6.4.299 (Apache-2.0), acima do piso 4.2.67, que corrige a injeção pela FontMatrix.
  - `@neslinesli93/qpdf-wasm` 0.3.0, a cola em ISC do qpdf 12.2.0 (Apache-2.0) compilado para WebAssembly.
- **Os textos do qpdf:** o pacote do npm não traz nenhum. A `/licenses` mostra os textos de cima, gravados em `src/platform/license-texts/` a partir das fontes fixadas no Dockerfile do pacote (`UPSTREAM_TEXTS`):
  - o qpdf 12.2.0 e o NOTICE dele;
  - o zlib do commit `21767c6`;
  - o libjpeg-turbo 2.1.1 do fork do ImageMagick (`7aa2a89`), com o README do IJG.
  - A licença ISC da própria cola não vem no pacote: ela entra como texto próprio (`UPSTREAM_OWN_TEXTS`), lido quando o pacote não tem o arquivo.
- **O `@napi-rs/canvas`** (MIT) vem como dependência opcional do `pdfjs-dist` e só roda no Node dos testes (o desenho para o PSNR). Ele não entra no bundle.
- **Teste:** o `tests/unit/licenses.test.ts` confere o hash de cada texto novo. A lista de pacotes de navegador do `tests/unit/quality.test.ts` cresceu com os dois, como na § 52.

## § 144 · O PDF.js no site: build legacy, onde roda e o que vai para o `dist/` (F5a, 1/nov/2026)

- **Build:** o legacy do `pdfjs-dist`. Dois polyfills (`src/engine/pdf/polyfills.ts`) entram só onde faltam: `Promise.withResolvers` e o `bytes()` de `Response` e `Blob`.
- **Onde roda:**
  - No worker de PDF (`src/engine/pdf/worker.ts`), o PDF.js usa o "worker falso": o `pdf.worker.mjs` é carregado no mesmo worker e publicado em `globalThis.pdfjsWorker`. O desenho usa uma fábrica de `OffscreenCanvas` e uma de filtros sem DOM. Ali as fontes viram caminhos (`disableFontFace`).
  - Num navegador sem `OffscreenCanvas` no worker (o WebKit do Windows, § 22 e § 102), o PDF.js roda na página, com a porta de worker do `src/engine/pdf/pdfjs-core.ts`. A matriz passa pelos dois caminhos.
- **Opções do `getDocument`:**
  - `useWorkerFetch: false`, `useSystemFonts: false`, `enableXfa: false` e `stopAtErrors: false`;
  - o desenho com `AnnotationMode.DISABLE`, sem camada de texto e sem scripting.
  - Os dados vêm da própria origem, em `/_astro/pdfjs/<versão>/`, por uma fábrica própria (`SiteDataFactory`): os CMaps, as fontes padrão da Foxit e os `.wasm` do JPEG 2000 (`openjpeg.wasm`) e do JBIG2 e CCITT (`jbig2.wasm`).
- **O `isEvalSupported`:** a versão 6 não tem mais a opção. O texto não aparece nem no `pdf.mjs` nem no `pdf.worker.mjs` do pacote. A prova pedida pela ficha (decisão 4) é o teste de endurecimento sobre o JS publicado: nenhum `eval` nem `new Function` no caminho de fontes e funções (§ 157).
- **O que não é copiado:**
  - as fontes Liberation (GPL-2.0 com exceção de fonte);
  - o perfil de cor em CC0 (`.icc`);
  - o qcms, que o PDF.js só carrega com `useWorkerFetch`;
  - a sandbox de scripting (`quickjs-eval`) e os substitutos em asm.js.
- **A cópia:** o `src/platform/pdfjs-data.ts` copia os arquivos sem mudança no `astro:build:done`. A pasta leva a versão, então o cache dela é imutável como o resto do `/_astro/`.

## § 145 · Metadados, formulário, marcadores e links nas ferramentas de PDF (F5a, 1/nov/2026)

A decisão 4 da ficha pede a regra dos metadados, que fecha o item 8 da F2.

- **Metadados:**
  - o PDF da pessoa, mudado no lugar (Rotate, numeração, marca d'água, Sign e Reorder), mantém o Info e o XMP: o pdf-lib abre com `updateMetadata: false`;
  - um documento novo (Merge, as partes da Split, a Delete e o Forte) leva o Info e o XMP do primeiro arquivo de origem, e nada do aparelho;
  - o qpdf (Compress, Protect e Unlock) preserva tudo.
- **Formulário:**
  - Merge, Split e Delete copiam só os campos com widget nas páginas copiadas, podados a esses widgets. Um nome repetido de outro arquivo ganha " (2)";
  - Rotate, numeração, marca d'água, Sign e Reorder mantêm o AcroForm;
  - toda ferramenta do pdf-lib tira a camada XFA e diz isso na linha, porque o XFA descreveria páginas que mudaram. O qpdf mantém o XFA. O Forte perde o formulário e diz isso antes da escolha.
- **Marcadores e links:** um documento novo leva os marcadores e os links internos que apontam para páginas copiadas. Um destino com nome vira explícito. O que aponta para página que ficou de fora cai, e os links para a web ficam.
- **Como a cópia é planejada** (`src/engine/pdf/assemble.ts`): o `PDFObjectCopier` do pdf-lib recebe o mapa de páginas antes de copiar. Cada página copiada aponta para a referência nova, e cada página de fora aponta para `null`. Assim, um link ou um campo não puxa uma página que ficou de fora.

## § 146 · Numeração e marca d'água (F5a, 1/nov/2026)

- **Numeração:**
  - Helvetica 10 pt, a 28 pt da borda da página visível (a CropBox, com o /Rotate), sempre em pé na tela;
  - seis posições (em cima ou embaixo, à esquerda, no centro ou à direita) e quatro formatos: "N", "Page N", "Page N of T" e "N of T". O "Page" fica em inglês em toda página;
  - "Pular a primeira" deixa a página 1 sem número, e a página 2 recebe o início escolhido;
  - o "of T" é o último número escrito, não a contagem de páginas.
- **Marca d'água:**
  - Helvetica Bold, cinza 50%, no centro da página visível;
  - na diagonal, a 45° na tela, ou na horizontal;
  - o tamanho é a largura do texto: 35%, 55% ou 80% da diagonal (ou da largura), nunca mais alta que um terço da página;
  - opacidade de 15%, 30% ou 50%;
  - só os caracteres que a fonte padrão desenha (WinAnsi). Um texto que fica vazio depois disso é recusado com a fala.

## § 147 · Compress PDF: os três modos e o limiar de PSNR (F5a, 1/nov/2026)

Os valores foram fixados antes de medir.

- **Sem perda:** o qpdf com `--object-streams=generate --compress-streams=y --recompress-flate --compression-level=9 --remove-unreferenced-resources=yes --deterministic-id`.
- **Recomendado:**
  - toda imagem JPEG (DCTDecode) RGB ou cinza, de 8 bits, sem `/Decode` e sem máscara, é decodificada pelo MozJPEG;
  - ela é reduzida a 150 ppi efetivos quando passa disso no maior tamanho que pode ter na maior página que a usa;
  - depois, é regravada pelo MozJPEG com qualidade 75 e só troca a original quando fica menor;
  - CMYK, YCCK, indexada, 16 bits, JPX, JBIG2, CCITT, imagem inline e imagem acima de 50 MP ficam como estão;
  - depois disso, o documento passa pelo mesmo qpdf do Sem perda. Os codecs são os de uma thread do jSquash, sem canvas, então rodam no worker em todo navegador.
- **Forte:** cada página é desenhada pelo PDF.js a 100 ppi, gravada em JPEG com qualidade 0,6 e posta num PDF novo do tamanho da página visível.
  - O plano falava em MozJPEG 60. A página já sai de um canvas, então o JPEG é o do próprio canvas (`convertToBlob`), e nenhum codec a mais precisa ser baixado.
  - A opção diz, antes da escolha, que o texto deixa de ser selecionável e que o formulário e os links se perdem.
- **Em qualquer modo:** um resultado igual ou maior volta como o original, byte a byte, com a fala de que o arquivo já estava otimizado.
- **PSNR:** a página 1 do Recomendado, desenhada a 100 ppi e comparada com a original, fica em 30 dB ou mais. Os números de cada fixture com foto estão na § 158 e na tabela do relatório.

## § 148 · Uma ilha para as 12 ferramentas, o registro e o hub (F5a, 1/nov/2026)

- **O registro:** `src/tools/pdf/registry.ts` é a fonte única.
  - Cada ferramenta tem o id e o caminho, o ícone, o que recebe (`batch`, `merge` ou `single`) e como roda (`auto`, ao soltar, ou `action`, num botão).
  - Tem também os chips (`next`), até 6 relacionadas (que podem ser a Image to PDF e a Compress image) e o sufixo do nome.
  - As páginas, o hub, a busca, os eventos e os testes leem o registro.
- **A ilha:**
  - uma entrada só (`src/tools/pdf/PdfIsland.astro` com o `mount.ts`), com o painel e as 12 definições, mais o grupo `island` de sempre: 2 arquivos JS por página, o modelo da § 69 e da § 110;
  - os ícones que só o PDF usa chegam pelas props, como marcação, para não engordar o `island`, que as páginas de imagem e de dinheiro também carregam;
  - o motor fica atrás do `src/tools/pdf/client.ts` (Comlink), como o de imagem.
- **Recusas na linha:** um arquivo que pede senha ou é restrito conta como sem saída (`HOPELESS`), como o vazio e o cortado.
  - Na primeira versão, um cifrado no meio de uma Merge entrava no pedido. A Merge inteira falhava, e toda linha dizia "pede senha".
  - O campo de arquivo aceita sempre vários, então um segundo arquivo numa ferramenta de um por vez vira a recusa "one-at-a-time" na linha, em vez de o navegador ignorar o arquivo.
- **O hub `/pdf-tools/`:**
  - segue o `/image-tools/` (§ 77 e § 96): faixa coral com H1 próprio, a grade em ordem de volume, o guia "qual ferramenta usar" e o texto que dá as 150 palavras por AdSlot;
  - a Image to PDF entra como cartão para a página dela, que continua no hub de imagem. Pelo volume (100K a 1M), o cartão fecha a primeira faixa, depois das quatro ferramentas de PDF dessa faixa.

## § 149 · Quatro ícones novos: sign, watermark, page-number e reorder (F5a, 1/nov/2026)

- **Contexto:** a decisão 6 da ficha abre `docs/design/assets/Icons/` só para os ícones novos do PDF.
- **Decisão:** os quatro foram desenhados no estilo da pasta: grade de 24, traço 2, pontas e cantos redondos e `currentColor`.
  - O README da pasta passa de 35 para 39 ícones, e os nomes entram em `ICON_NAMES`.
  - O `tests/unit/icons.test.ts` conta 39.
  - As outras ferramentas usam ícones que já existiam: merge, split, image, compress, rotate, trash, lock e unlock.

## § 150 · Os nomes do que as ferramentas de PDF devolvem (F5a, 1/nov/2026)

- **Regra geral:** `<original>-<sufixo>.pdf`, com o sufixo do registro: merged, split, compressed, rotated, edited, numbered, signed, protected, unlocked, reordered e watermarked.
  - Os nomes são únicos dentro do lote e do ZIP, como os de imagem.
- **Split:** por faixas sai `-part-1`, `-part-2`, na ordem, e nunca a faixa digitada. Uma página por arquivo sai `-page-N`.
- **PDF to JPG:** sai `-page-N.jpg` (ou `.png`), com o número da página no documento.
- **Nada digitado vai para um nome:** nem senha, nem faixa, nem texto.
- **ZIP:** `fileorca-pdfs.zip`, ou `fileorca-pdf-images.zip` na PDF to JPG, em inglês em toda página, como os de imagem.

## § 151 · Os eventos das ferramentas de PDF (F5a, 1/nov/2026)

- **Os mesmos eventos das imagens** (§ 71). O `tool` sai de uma lista fechada, `PDF_EVENT_TOOLS` (`src/analytics/tool-ids.ts`), escrita à mão e conferida contra o registro.
- **O `outcome` ganhou:** merged, split, deleted, numbered, reordered, watermarked, signed, protected e unlocked.
- **O `reason` ganhou:** not-pdf, corrupted, needs-password, wrong-password, restricted e not-encrypted. O empty, o too-large e o load já existiam.
- **Outras listas:** o `codec` ganhou `application/pdf`. O `next_step_click` aceita as páginas de PDF como destino.
- **O que nunca vai em parâmetro:** número, faixa, texto, senha, contagem de páginas ou nome de arquivo.

## § 152 · As peças novas: grade de páginas, campo de senha e área de assinatura (F5a, 1/nov/2026)

- **Grade de páginas** (`src/tools/pdf/PageGrid.tsx`):
  - Uma célula por página. A miniatura é desenhada só enquanto a célula está na tela, a 2× da largura em CSS, e é solta quando ela sai.
  - Três usos:
    - **escolher:** a célula é um botão com `aria-pressed`, e o Espaço ou o clique a escolhe (Split, Delete, Sign e a faixa da PDF to JPG);
    - **ordem:** a página se move pelo arraste, pelos botões "Move earlier" e "Move later" de cada célula (WCAG 2.5.7) e pelo teclado. O Espaço pega a página, as setas a movem e o Espaço a solta (Reorder);
    - **girar:** a célula gira a página um quarto de volta à direita (Rotate, página por página).
  - Uma parada de Tab para a grade inteira, com foco itinerante (setas, Home e End). Os botões de mover da célula com foco também entram no Tab.
  - Cada mudança é dita uma vez na região de status do painel. O foco segue a página movida.
  - O visual é o do FileCard: traço, raio e a dobra na cor do PDF, sem cor nova.
- **Campo de senha** (`src/tools/pdf/PasswordField.tsx`):
  - a caixa do NumberField com o botão "Show password" (`aria-pressed` e `aria-controls`), que troca o campo entre senha e texto;
  - o rótulo fica visível, e a regra (4 a 100 caracteres) é uma linha de ajuda. O erro repete a regra, ligado por `aria-describedby` e `aria-invalid`;
  - o `autocomplete` é `new-password` na Protect, com confirmação igual, e `current-password` na Unlock;
  - nada digitado é guardado ou enviado.
- **Área de assinatura** (`src/tools/pdf/SignatureArea.tsx`):
  - três jeitos, em OptionGroup:
    - desenhar num `<canvas>` (ponteiro, caneta ou dedo), com o botão "Clear";
    - enviar um PNG ou JPG, desenhado de novo num canvas, então nenhum metadado viaja;
    - digitar o nome, desenhado com a fonte de títulos do site;
  - o resultado é um PNG de fundo transparente, na tinta do tema claro (tokens do `docs/design/`), qualquer que seja o tema da tela;
  - a posição fica numa prévia da página:
    - arrastar com o ponteiro;
    - setas movem 1%, e com Shift, 10%;
    - `+` e `−` mudam a largura;
    - os campos X, Y e largura, em porcentagem;
  - as páginas: esta, todas ou as escolhidas na grade;
  - nada fica guardado.
- **CSS:** o bloco F5a de `src/styles/components.css`, só com tokens. No celular, abaixo de 480 px, os grupos de opção com linha de ajuda empilham as opções. Assim, a `/compress-pdf/` não rola para o lado a 320 px (o `design.spec.ts` reprovava com 322 px).

## § 153 · "Unlock PDF" é nome de ferramenta, não o verbo proibido da voz (F5a, 1/nov/2026)

- **Contexto:** o README do design proíbe "unlock" como verbo de marketing ("Unlock your photos"), e o `tests/unit/routes.test.ts` procura a palavra em todo texto do site. "Unlock PDF" é o nome da ferramenta, o termo de busca do `data/keywords.csv`.
- **Decisão:** o teste tira só o nome exato ("Unlock PDF") e o id da rota ("unlock-pdf", que o guia do hub cita) antes da busca, e passa a ler também os textos de PDF. Qualquer outro "unlock" continua reprovando, e o teste prova isso com amostras dos dois lados.

## § 154 · O CI em onze partes, os core dumps desligados e a amostra de disco a cada 2 s (F5a, 1/nov/2026)

- **As partes:**
  - `verificar` (`--sem-playwright`);
  - `chromium 1 de 3` a `3 de 3`;
  - `webkit 1 de 7` a `7 de 7`.
  - Cada uma tem o limite de 900 s e o alvo de 700 s. O resto do workflow ficou como estava (adendo da ADR-003).
- **Por que onze:**
  - O primeiro push da PR teve o Chromium em 2 partes e o WebKit em 5. A run verde 41331507992 (`1d551fa`) deu de 220 a 545 s por parte, e o `verificar` foi a 469 s.
  - Depois, a matriz passou a rodar toda ferramenta contra toda fixture (§ 175), e o `pdf-tool.spec.ts` foi de 3 para 22 testes (§ 176 a § 182).
  - Com a mesma divisão, a parte 5 do WebKit teria a matriz inteira, o `pdf-privacy` e o `pdf-tool`, acima de 700 s pela medida local e a razão do CI.
  - Com 6 partes, o `design.spec.ts` ficaria dividido com a matriz de imagens na mesma parte, a combinação das quedas de disco da § 142.
  - Com 7 partes, ele fica inteiro na parte 4, com os de cookies e o `engine-paths`, longe da matriz de imagens (parte 5), e a matriz de PDF se divide entre as partes 6 e 7.
  - O Chromium em 3 partes põe o dinheiro e todos os `pdf-*` na parte 3.
  - A ficha esperava o WebKit em 4 ou 5 partes. O alvo de 700 s e a § 142 vêm antes da expectativa.
- **Core dumps:** o `core_pattern` do runner é `|/usr/lib/systemd/systemd-coredump %P %u %g %s %t 9223372036854775808 %h %d`: os dumps vão ao `systemd-coredump` com um limite de 2^63 bytes, ou seja, sem limite, e o `ulimit -c 0` sozinho não os para.
  - Cada parte do Playwright troca o padrão por `|/bin/false` (`sudo -n sysctl`) e roda o `verificar` com `ulimit -c 0`.
  - É a hipótese da § 141: um dump grande de um processo do WebKit encheria o disco.
- **Diagnóstico em toda parte do Playwright, com `if: always()`:**
  - `df -h / /tmp`, o `core_pattern` e o `coredumpctl list`;
  - o journal do `systemd-coredump`;
  - as linhas do kernel sobre OOM, segfault e falta de espaço.
  - Cada comando termina em `|| true`.
  - Na run 41331507992, todas as partes disseram "No coredumps found.".
- **O `scripts/lib/disco.ts`:**
  - mede o `/` a cada 2 s pelo `statfsSync` e imprime uma linha só quando o espaço livre mudou 256 MB (`createRecorder`);
  - no fim, resume o ponto mais baixo e a maior queda;
  - a busca funda ganha o journal dos core dumps e os processos que mais gravaram (`write_bytes`).
  - A amostra de 20 s da § 141 não pegava o fundo das quedas.
  - Na run 41331507992, o mínimo foi de 9.254 a 10.756 MB livres por parte, e a maior queda em 2 s foi de 47 MB.
- **Testes:**
  - dois testes novos no `tests/unit/disco.test.ts`, um com a série da execução 41277648653 e um com disco parado;
  - o `tests/unit/verificar.test.ts` cobre as partes novas.
- **Divisão:** o `--list` de cada parte foi conferido a cada push com spec novo. É a mudança de parte que a § 142 pede para registrar.
  - No WebKit em 7 partes:
    - parte 1: o `a11y` (84);
    - parte 2: o resto do `a11y`, o `ads` e o começo do `budgets`;
    - parte 3: o `budgets` e o `coffee`;
    - parte 4: os de consentimento e cookies, o `design` inteiro (50), o `engine-paths` e parte do `events`;
    - parte 5: a matriz de imagens, os outros specs de imagem e o começo do dinheiro;
    - parte 6: o dinheiro, a navegação, o `pdf-hardening` e metade da matriz de PDF;
    - parte 7: a outra metade, o `pdf-privacy`, o `pdf-speed`, o `pdf-tool` e o `tool`.
  - No Chromium em 3 partes:
    - parte 1: o `a11y`, o `ads` e o começo do `budgets`;
    - parte 2: o resto até a imagem;
    - parte 3: o dinheiro e os `pdf-*`.

## § 155 · Os `.wasm` do PDF entram na lista do `image-privacy.spec.ts` (F5a, 1/nov/2026)

- **Contexto:** o teste "the dist has no multi-thread codec" aceita só os `.wasm` dos codecs de uma thread em uso, e reprovou o `qpdf.wasm`, o `jbig2.wasm` e o `openjpeg.wasm`.
- **Decisão:** a lista ganha os três, que também são builds de uma thread: o do qpdf é o único do pacote, e os dois do PDF.js são os decodificadores de JPEG 2000 e de JBIG2 e CCITT. O resto do teste ficou como estava:
  - nada com nome de build de várias threads;
  - nenhum `SharedArrayBuffer`;
  - todo `.wasm` servido como `application/wasm`, com cache imutável.

## § 156 · As fixtures de PDF e o oráculo (F5a, 1/nov/2026)

- **Ordem:** as 13 fixtures `gen-*` de `fixtures/pdf/` e o `fixtures/pdf/expected.json` entraram num commit próprio (`dc838b4`), antes de qualquer arquivo de ferramenta (`git log -- fixtures/pdf src/tools/pdf`).
- **Gerador:** `scripts/fixtures/pdf.ts`, chamado pelo `pnpm fixtures`, que também regera as fixtures de imagem (`--no-pdf` pula).
  - As páginas saem do pdf-lib, com o marcador "Page N" em cada uma.
  - A cifra sai do qpdf em WASM no Node (`scripts/lib/qpdf.ts`), com `--static-id --static-aes-iv`.
  - A AES-256 R6 ainda sorteia a chave do arquivo, então o `crypto.getRandomValues` é trocado por um contador SHA-256 durante a cifra. Duas gerações seguidas dão os mesmos bytes, e o SHA-256 de cada arquivo está no `fixtures/ORIGEM.md`.
- **O oráculo vem de leitores independentes do motor:**
  - o PDF.js no Node (contagem, caixas, rotação, marcadores, texto);
  - o `qpdf --check` e o `--show-encryption`.
  - O motor nunca gera o esperado.
- **Casos de borda:**
  - a `gen-xref-estragada` abre no PDF.js e falha no qpdf, então o esperado é "reparada": o pdf-lib reconstrói a tabela, e o arquivo sai reparado, com a fala na linha;
  - a `gen-cortado` é `truncated`;
  - a `gen-vazio`, a `gen-jpg-extensao-pdf` e a `gen-texto-extensao-pdf` são recusadas.
- **Tamanho:** `fixtures/pdf/` tem 11,98 MB com as 4 da F0. O `tests/unit/pdf-fixtures.test.ts` confere os hashes e o oráculo.

## § 157 · O PDF.js endurecido, provado no JS publicado (F5a, 1/nov/2026)

- **O `isEvalSupported`:** o PDF.js 6.4.299 não tem mais a opção, nem na API nem nos tipos (§ 144), então não há o que desligar.
- **A prova sobre o código publicado:** o `tests/unit/pdf-hardening.test.ts` lê com o parser do TypeScript (comentário e string não enganam) o `legacy/build/pdf.mjs` e o `pdf.worker.mjs` que o site importa.
  - Zero `eval`, zero timer com string e zero `new Function`.
  - Uma única chamada `Function('return this')()`: o último elo da busca do objeto global do core-js, depois de `typeof globalThis == 'object' && globalThis`. O teste a fixa pela posição na cadeia.
  - Se a opção voltar numa versão futura, o teste exige `isEvalSupported: false` no `src/engine/pdf/pdfjs.ts`.
- **Imports dinâmicos:** dois `import()` de especificador calculado ficam fixados por texto, e um terceiro reprova:
  - o `workerSrc` da API, que não roda, porque o motor põe `globalThis.pdfjsWorker` antes de carregar a API;
  - o substituto asm.js do decodificador, que só roda se o `.wasm` falhar e não é servido.
- **O qcms:** o `IccColorSpace.setOptions` volta antes de ligar o qcms (e o XHR síncrono do `qcms_bg.wasm`) quando `useWorkerFetch` é falso. O teste fixa essa guarda e a opção.
- **As opções do `getDocument`:** ficam fixadas pela sintaxe, com uma lista de opções proibidas (`url`, `httpHeaders`, `withCredentials`, `docBaseUrl`, `iccUrl`, `enableScripting`, `enableWebGPU`, `pdfBug` e outras). Nenhum arquivo de `src/engine/pdf/` ou `src/tools/pdf/` pede texto, anotações, scripts ou XFA da página.
- **Sem rede no motor:** `src/engine/pdf/` e `src/tools/pdf/` não têm URL em string, XHR, WebSocket, EventSource, `sendBeacon`, `importScripts`, `eval` nem `import()` calculado. Há só dois `fetch`, ambos de arquivos da própria origem.
- **O `dist/`:** o `tests/e2e/pdf-hardening.spec.ts` lê os arquivos, sem abrir página, e fica no Playwright porque precisa do build. Ele confere:
  - nenhum `eval` nem `new Function` em todo script de `dist/_astro`, não só nos do PDF.js;
  - as mesmas opções no worker minificado;
  - nada de qcms, `.icc`, QuickJS, Liberation ou asm.js.
- **O leitor de sintaxe** (`tests/e2e/lib/js-code.ts`) usa o pacote `typescript`, que já é dependência de desenvolvimento. Um controle prova que ele acha cada forma de `eval` e ignora comentário e string.

## § 158 · Compress PDF medido: modo × fixture e o PSNR (F5a, 1/nov/2026)

- **O teste:** o `tests/unit/pdf-compress.test.ts` roda os três modos em todas as 10 fixtures que o Compress aceita, no Node. Em cada linha ele confere:
  - nunca maior;
  - sem ganho, os mesmos bytes;
  - saída nova menor, passando no `qpdf --check` e com as páginas do oráculo;
  - o Recomendado acima do PSNR;
  - o Forte com uma imagem por página, nenhum texto, o tamanho como mostrado e `/Rotate 0`.
- **Os limiares:** o `PSNR_MIN_DB` = 30 dB foi fixado antes da primeira medida. Depois, um segundo limite: o Recomendado tira pelo menos 40% da `gen-fotos`.
- **Medido:**
  - Recomendado: `gen-fotos` 0,326 da original, a 36,1 dB, e `pdf-escaneado-01` 0,688, a 37,3 dB. Nas outras fixtures o Recomendado só mexe no qpdf, e a página sai com os mesmos pixels;
  - Sem perda: de 0,604 (`gen-acoes`) a 1,000, e a `gen-ja-otimizado` volta byte a byte nos três modos;
  - Forte: só ganha na `gen-fotos` (0,121) e na `pdf-escaneado-01` (0,322). Nas outras, as imagens ficam maiores, e o original volta byte a byte;
  - a geometria das 8 páginas mistas no Forte, provada com o mesmo desenho: de 30,9 a 42,2 dB por página contra a original.
- **A tabela inteira** está no relatório. O arquivo é o mais lento do Vitest, com uns 28 s locais.

## § 159 · Protect e Unlock provados (F5a, 1/nov/2026)

- **O teste:** o `tests/unit/pdf-lock.test.ts` prova:
  - a Protect em R6 com AESv3, sem permissão retida e com a senha de abrir igual à de dono;
  - nenhum byte da senha no arquivo, em Latin-1, UTF-8, UTF-16 nos dois sentidos ou hexadecimal;
  - a ida e volta pelo qpdf, pelo PDF.js e pela Unlock, com senha acentuada e com senha de 100 caracteres;
  - que a senha de dono também abre na Unlock;
  - tentativas erradas sem limite: cinco seguidas, e a certa ainda funciona.
- **A senha não vaza:** ela nunca vai ao console, ao stdout ou stderr, nem ao objeto de falha. Os ouvintes têm controle positivo.
- **O exit code:** o qpdf devolve o `process.exitCode` como estava. Sem isso, uma senha errada no Node deixaria o status 2 e reprovaria o Vitest.
- **As recusas:** as outras ferramentas recusam arquivo que pede senha e levam à Unlock. A PDF to JPG desenha o arquivo só restrito. A Unlock tira as restrições de dono sem pedir senha, e nunca tenta adivinhar.

## § 160 · O PDF na home, no rodapé, na busca e no `gate:seo` (F5a, 1/nov/2026)

- **Home em inglês:** a seção "Work on a PDF" fica entre a de imagem e a de dinheiro, com os 12 cartões do registro na ordem do hub e o link "See all PDF tools".
  - A de dinheiro mostra só 5 de 14. O PDF mostra as 12, porque é a categoria de maior volume e cabe em 4 linhas.
  - Em pt e es não sai nada.
- **Rodapé em inglês:** a coluna PDF fica entre Image e Money, com o hub e os 6 primeiros do registro (Merge, Split, PDF to JPG, Compress, Rotate e Delete). Nenhuma página fica órfã, porque o hub liga as 12.
- **Busca:** as 12 ferramentas, na categoria `pdf`, depois das de imagem e antes das de dinheiro, só em inglês. Os hubs não entram, como os outros. O algoritmo não mudou, e o efeito aparece nos testes (§ 171):
  - "compress" passa de 3 para 4 resultados, e a Compress PDF vem por último, então ArrowDown e Enter ainda levam à `/compress-image/to-100kb/`;
  - "shrink" passa de 4 para 5;
  - "jpg to pdf" lista também a PDF to JPG, depois da Image to PDF.
- **`gate:seo`:**
  - ferramenta de PDF pede Organization, BreadcrumbList e WebApplication sem nota, o título começando pelo H1 e o schema terminando no canonical;
  - o hub pede CollectionPage e BreadcrumbList;
  - as 13 URLs têm de estar no sitemap em inglês.
  - Um controle negativo (o tipo do schema trocado no `dist/`) reprova. O `PdfToolPage.astro` já cumpria tudo, inclusive a página só em inglês sem hreflang (§ 58) e o menu de idioma (§ 84).

## § 161 · Privacidade, Termos e Sobre com o PDF (F5a, 1/nov/2026)

- **Privacidade, nos três idiomas:**
  - o PDF é lido e gravado no aparelho, pelo PDF.js e pelo qpdf;
  - o que se digita (faixa, texto da marca d'água) fica no navegador;
  - a senha não sai do aparelho nem fica guardada, nem em servidor nem no navegador;
  - a assinatura não fica guardada em lugar nenhum.
  - A frase do pedido de café em inglês passa a falar de lotes de imagem ou de PDF, porque o painel de PDF também conta o uso. O pt e o es já eram genéricos.
- **Termos:** a seção "PDF tools: passwords and signatures" traz três regras.
  - **Protect:** a senha é da pessoa. O site não a recebe nem a recupera, e uma senha perdida não abre mais o arquivo.
  - **Unlock:** só para arquivos que a pessoa tem o direito de abrir e mudar. A ferramenta nunca adivinha nem quebra senha: a senha é pedida.
  - **Sign:** é a imagem de uma assinatura, não uma assinatura digital com certificado. Pode não valer como assinatura qualificada, e o site não dá conselho jurídico.
- **Nomes:** no pt e no es, os nomes das ferramentas ficam em inglês, porque as páginas só existem em inglês.
- **Sobre:** "12 PDF tools" (en), "as de PDF" (pt) e "las de PDF" (es).
- **Data:** "Last updated" segue em 1º de novembro de 2026.
- **Revisão:** o pt e o es passaram pelo `lint:texto` sem erro.

## § 162 · O `gate:conteudo` e o `gate:prontidao` leem o registro de PDF (F5a, 1/nov/2026)

- **`gate:conteudo`:** confere as 12 páginas e o hub, lidos do registro. Cada página precisa de:
  - o H1 com o nome da ferramenta, junto do PrivacySeal;
  - o título começando pelo nome, e a descrição;
  - as especificações: o que aceita, um limite, o que se mantém (formulário, marcadores e links, cada um com a sua palavra; a PDF to JPG, que gera imagens, fica isenta) e uma linha por modo (`PDF_MODES`);
  - 4 perguntas reais no Faq;
  - a nota de privacidade: aparelho ou navegador, e nada enviado; a senha na Protect e na Unlock, a assinatura na Sign;
  - no máximo 6 relacionadas.
  - Nada de "best", "#1", "fastest", "trusted by", ganho em % ou "x", número de usuários ou tempo prometido. Os números que são fatos do código (35%, 150 ppi, 4 a 100 caracteres, qualidade 75) passam, com controle positivo.
- **Lacunas reais que o portão achou, corrigidas no texto:**
  - a Compress PDF não dizia o que acontece com os marcadores: o Sem perda e o Recomendado mantêm, e o Forte perde, com o formulário e os links;
  - a Protect PDF não dizia que o formulário, os links e os marcadores ficam.
- **`gate:prontidao`:** o `realSite()` lê o registro de PDF.
  - A busca tem os 12 ids.
  - O hub lista os 12 cartões mais o da Image to PDF.
  - A home em inglês lista os cartões de dinheiro e os 12 de PDF.
  - Três linhas novas conferem as 13 páginas uma a uma: na rota, indexável, com área de anúncio; H1, título e descrição próprios; 60 palavras no `<main>`, 150 por AdSlot e pelo menos um AdSlot.
  - O `checkContent` foi dividido em funções menores, sem mudar as mensagens.
- **Controles:** positivos e negativos para cada regra no `tests/unit/conteudo.test.ts` e no `tests/unit/prontidao.test.ts`.

## § 163 · O `gate:licencas` compara cada `.wasm` e cada dado com o pacote (F5a, 1/nov/2026)

- **Pacotes:** o portão exige o `pdfjs-dist` e o `@neslinesli93/qpdf-wasm` no bundle.
- **Todo `.wasm` de `dist/_astro`:**
  - tem o nome de um `.wasm` de pacote que chega ao navegador;
  - tem os mesmos bytes (SHA-256);
  - é de um pacote listado na `/licenses`.
  - Um `.wasm` fora de `_astro/` reprova.
- **Tudo em `dist/_astro/pdfjs/<versão>/`:**
  - é idêntico ao arquivo do `pdfjs-dist`;
  - é de um tipo que a `/licenses` cobre (jbig2 e openjpeg, `.bcmap`, `Foxit*.pfb`), o que barra Liberation, `.icc`, qcms e quickjs;
  - é exatamente a lista que o build copia;
  - fica numa só pasta, com a versão instalada.
  - Os controles incluem um mutante de um byte sobre os arquivos reais do pacote.
- **A `/licenses` lista só o que vai ao navegador:** um texto "X, in y.wasm" exige o `y.wasm` servido.
  - O `qcms_bg.wasm` não é copiado (§ 144), então o texto da biblioteca qcms saiu do `src/platform/licenses.ts`, e o rótulo saiu do `tests/unit/licenses.test.ts` (§ 171).
  - O texto "PDF.js glue of qcms_bg.wasm" fica, porque a cola em JS (wasm-bindgen, MIT) está dentro do `pdf.worker` e vai ao navegador.
  - Nada que vai ao navegador perdeu o texto.

## § 164 · Lighthouse e o `gate:design` com o PDF (F5a, 1/nov/2026)

- **Lighthouse:** o `lighthouserc.json` ganha a `/compress-pdf/` e a `/pdf-tools/`, com as mesmas asserções. Medianas no celular:

  | Página | Desempenho | CLS | LCP |
  | --- | ---: | ---: | ---: |
  | `/compress-pdf/` | 99 | 0,000 | 1,89 s |
  | `/pdf-tools/` | 100 | 0,000 | 1,44 s |

  Acessibilidade, boas práticas e SEO ficaram em 100 nas duas. As quatro páginas que já estavam não pioraram.
- **Voz:** o `checkVoice` (`scripts/lib/design-checks.ts`) aplica as regras de voz do README:
  - nenhuma palavra proibida, com as terminações;
  - sem emoji, setas ou "up to 50";
  - exclamação só uma vez, e só no fim com sucesso.
  - "Unlock PDF" sai antes, como na § 153.
  - O `gate:design` aplica o `checkVoice` ao texto visível e aos textos do painel das 13 páginas construídas. O `tests/unit/quality.test.ts` o aplica aos arquivos de texto lidos pelo registro.
- **CSS:** o bloco F5a do `components.css` é lido pelo marcador e conferido: amarelo só no Baixar, cor de texto só em token, movimento só nas cinco propriedades. Um controle quebra cada regra de propósito.
- **Cores:** o código de PDF não tem cor hexadecimal fora dos tokens.

## § 165 · O motor de imagem pronto para código aberto (F5a, 1/nov/2026)

A ficha (item 13) dá dois caminhos. A escolha foi o caminho A, com o mesmo código no site e no pacote.

- **As URLs dos `.wasm` em tempo de execução:**
  - o motor não importa nenhum `.wasm`;
  - o `src/engine/image/codecs/wasm.ts` guarda as nove URLs (`configureWasm` e `wasmUrl`), sem valor padrão;
  - um codec pedido antes da configuração falha como `load`, e a tentativa seguinte, já configurada, funciona.
- **O `src/tools/image/engine-client.ts`:** é o único arquivo que conhece o Vite e fica fora do `island`.
  - Ele importa os nove `.wasm` com `?url`.
  - Manda as URLs ao worker como primeira mensagem; o Comlink entrega as mensagens em ordem.
  - No caminho da página, chama o `configureWasm`.
  - O worker mantém o nome e a saída `/_astro/worker-*.js`.
- **O efeito no `dist/`:**
  - o worker de imagem passa a buscar os `.wasm` do build da página (nomes com ponto), e a cópia do `libheif.wasm` do build do worker (1,46 MB) deixou de existir;
  - as cópias com hífen dos codecs do jSquash continuam, porque a cola as emite e o worker de PDF as usa;
  - o JS inicial das páginas de imagem não cresceu: −3 B na `/compress-image/` e −1 B na `/resize-image/`. O worker cresceu 120 B gzip, e o `engine-client` 216 B.
- **O pacote `fileorca-image-engine` 0.1.0 (MIT):**
  - só código-fonte TypeScript, sem etapa de build, com o worker como entrada opcional (`./worker`);
  - dependências exatas, nas versões do site, para os `.wasm` serem os mesmos;
  - sem `repository` nem `homepage`, então o domínio aparece só no crédito do README;
  - o README traz o contrato e as decisões citadas no código (§ 7, 22, 33, 59 a 66, 86, 100 e 104);
  - o THIRD-PARTY-NOTICES põe o libheif em LGPL-3.0, como `.wasm` à parte, sem alteração e trocável, com os links do código;
  - nenhum ID do GA4, Ko-fi, Pix ou e-mail.
- **Fixtures:** entram 6 de 25, as conferidas contra o `fixtures/ORIGEM.md`.
  - Entram as 4 sem fonte externa, a `heic-08` (MIT) e a `heic-10` (BSD-3-Clause, GPS zerado).
  - Ficam fora, na dúvida:
    - as de "uso livre" sem menção a redistribuição;
    - as CC BY-SA;
    - as com GPS real.
  - Os testes que dependem delas saem do pacote por AST, não por texto. Vão 12 arquivos com 145 testes, e 20 testes ficam só no site.
- **O exportador** (`scripts/oss/image-engine.ts`, `pnpm motor:exportar`):
  - recusa escrever no repositório, acima dele, dentro dele fora de `.cache/`, ou numa pasta não vazia que não seja uma exportação anterior;
  - ao reexportar, preserva `.git`, `node_modules` e `package-lock.json` do clone.
- **A conferência** (`pnpm motor:exportar --conferir`): numa pasta temporária fora do repositório, `npm install`, `tsc --noEmit` e `vitest run` deram zero (12 arquivos e 145 testes). O `tests/unit/oss-image-engine.test.ts` exporta duas vezes e confere a estrutura, as licenças, os imports, a ausência do site e a igualdade das duas cópias.
- **Para o Victor:** o passo a passo do repositório público está em `docs/lancamento/codigo-aberto.md`.

## § 166 · O teste de privacidade das ferramentas de PDF (F5a, 1/nov/2026)

- **As 10 sentinelas** do `tests/e2e/pdf-privacy.spec.ts`:
  - a senha e uma senha errada;
  - o texto da marca d'água e o nome assinado;
  - um marcador de texto dentro do arquivo e o nome do arquivo;
  - o número inicial 8317;
  - três faixas válidas para 12 páginas.
  - Toda sentinela é procurada em toda superfície, em todo teste, não só na da ferramenta do teste.
- **"Sem caractere colado":** sentinela de 12 caracteres ou mais é busca de substring. A curta (o número) conta só como palavra inteira, porque um nome com hash do build pode ter os mesmos dígitos. Cada sentinela também é procurada sem espaços e com percent-encoding.
- **As superfícies:**
  - as requisições do contexto, inclusive as dos workers, com método, URL, cabeçalhos e corpo. Só passa GET da própria origem, sem corpo e sem query string;
  - `dataLayer`, `title`, `location.href`, `search` e `hash`;
  - `localStorage`, `sessionStorage`, nomes do IndexedDB e cookies;
  - o console da página e dos workers, e o `pageerror`;
  - os nomes dos downloads e das entradas do ZIP. O nome do arquivo da pessoa só pode aparecer ali, e o teste exige que apareça (controle positivo).
- **O PDF protegido:** é procurado em ASCII, UTF-16 e hexadecimal. O texto das páginas também não pode aparecer em claro.
- **O fluxo de cada uma das 12 páginas:**
  - as ferramentas que rodam ao soltar recebem as opções antes do arquivo, e as de botão, depois;
  - o arquivo entra por um drop de verdade, e o Baixar é clicado;
  - o chip é clicado com a navegação impedida, para ler o `next_step_click`. Só o teste da Protect segue o chip e procura nas duas páginas.
  - O PDF de teste é feito na hora com o pdf-lib, e trancado com o qpdf para a Unlock: nenhuma fixture nova.
- **As regras da § 80 no qpdf e no PDF.js:** a página e os workers sem `crossOriginIsolated` e sem `SharedArrayBuffer`. O `qpdf.wasm` e o `jbig2.wasm` recebidos pelo navegador são idênticos aos dos pacotes, servidos como `application/wasm`. Nenhuma fixture faz o PDF.js buscar o `openjpeg.wasm`, e o teste o confere se ele vier.
- **Lançamento:** o `tests/e2e/launch-claims.spec.ts` ganhou a Compress PDF, a PDF to JPG e a Protect PDF, com as mesmas asserções dos casos de imagem.

## § 167 · As ações do arquivo da pessoa ficam no arquivo, e nenhuma roda aqui (F5a, 1/nov/2026)

- **Medido com a `gen-acoes`:** toda ferramenta que escreve PDF mantém as ações do arquivo da pessoa (JavaScript, Launch e `/AA`; nas que mudam no lugar, também o `/OpenAction` e o JavaScript de `/Names`). Só a PDF to JPG, que devolve imagens, não leva nada.
- **Decisão:** as saídas ficam assim.
  - A ficha (decisão 4) pede que nenhum script do PDF rode no site e que a ferramenta não abra diálogo, popup, navegação ou requisição. As duas coisas valem: o PDF.js roda sem scripting e sem camada de anotações, e o teste prova que nada disso acontece em 7 fluxos com a `gen-acoes`.
  - Tirar as ações da saída mudaria o arquivo da pessoa além do que ela pediu, e quebraria os scripts de cálculo de formulários. É a mesma regra dos metadados (§ 145).
  - O teste afirma que nenhuma ferramenta acrescenta uma ação que o arquivo não tinha, que a saída abre no PDF.js e que passa no `qpdf --check`.
- **Alternativa, se o Victor quiser:** tirar o JavaScript e o Launch de toda saída. Isso mexe em todas as ferramentas do pdf-lib e do qpdf, e a página diria isso.

## § 168 · Defeitos que os testes novos acharam, corrigidos (F5a, 1/nov/2026)

- **A Merge com uma linha movida durante a leitura:** o `readAll` do `PdfPanel.tsx` andava pela lista viva. Mover uma linha enquanto os arquivos eram lidos pulava o arquivo que tomou o lugar: ele ficava em "Reading..." para sempre, e o botão oferecia juntar só o outro.
  - Agora o `readAll` anda por uma cópia da lista.
  - Teste: "Merge PDF: a row moved while the files are still being read", com o worker segurado.
- **O worker avaliado duas vezes no WebKit:** um chunk que o worker carrega sob demanda importa o ajudante CommonJS do bundler do chunk de entrada, e o WebKit avalia de novo o script de entrada.
  - Com isso, todo módulo do worker existia duas vezes: um segundo `expose()` respondia cada chamada de novo. Eram 5 execuções do qpdf para 3 arquivos na Protect, e um segundo `qpdf.wasm` buscado, até offline.
  - Agora o `expose()` roda só na primeira cópia, marcada com um `Symbol.for` no `globalThis`.
  - Teste: o `qpdf.wasm` é buscado uma vez só depois de dois arquivos, e com dois falha no WebKit sem a correção. O worker de imagem tem a mesma forma, porque os chunks dos codecs importam do chunk de entrada (§ 172).
- **O foco da grade depois de mover:** o foco ia para a posição, e não para a página. A grade repintava um ciclo antes de o painel entregar a ordem nova, e o foco caía na página que estava naquele lugar (cerca de 25% das execuções, sob carga).
  - Agora o foco segue a página movida, e só quando ela já está na posição nova.
- **A Merge pelo teclado:** a página prometia "move it with the keyboard", e a lista só tinha os botões "Move up" e "Move down".
  - Cada linha ganhou uma alça (botão com o ícone reorder, `aria-pressed`, "Pick up {name}").
  - Espaço ou Enter pega a linha, as setas a movem, Home e End a levam às pontas, Espaço solta, e Escape solta sem dizer nada.
  - A ajuda da lista diz as teclas.
- **Uma frase só por passo:** soltar uma página na grade repetia a frase do último movimento. Agora a região de status diz "pegou", cada movimento e "soltou" uma vez (`grid.dropped`, `queue.picked`, `queue.dropped`).
- **Teclado igual ao arraste:** o `tests/e2e/pdf-tool.spec.ts` prova, na Reorder e na Merge, que a mesma ordem nova feita pelo arraste, pelos botões e pelo teclado dá saídas com a mesma ordem de páginas.

## § 169 · Tarefas longas, o caminho sem `OffscreenCanvas` e os eventos de PDF (F5a, 1/nov/2026)

- **Tarefas longas** (`tests/e2e/pdf-speed.spec.ts`): no Chromium, nenhuma tarefa acima de 200 ms na thread principal com a `gen-paginas-300`. A maior tarefa medida foi 0 ms nas quatro ferramentas:
  - Merge de duas cópias (600 páginas);
  - Split em 300 arquivos e ZIP;
  - Compress sem perda;
  - numeração.
- **Como mede:** um `PerformanceObserver` de `longtask` com `buffered`, ligado antes do arquivo.
  - Um controle de 260 ms tem de ser visto.
  - O WebKit não tem essas entradas: ele roda o mesmo fluxo e imprime o tempo, sem `skip`.
- **Sem `OffscreenCanvas` no worker** (`tests/e2e/engine-paths.spec.ts`): a PDF to JPG, o Forte e as miniaturas da grade rodam nos dois navegadores com o worker de PDF servido com `delete globalThis.OffscreenCanvas;` na frente.
  - O caminho da página é provado pelos arquivos buscados: o `pdfjs-core` e o `render`, e nunca o `pdf.worker`.
  - A saída é conferida no Node.
- **Eventos:**
  - `PDF_EVENT_TOOLS` igual ao registro;
  - `OUTCOMES` e `ERROR_REASONS` fixados por lista exata, e toda razão de `PDF_REASONS` está em `ERROR_REASONS`;
  - `one-at-a-time` nunca é enviada;
  - o conjunto de nomes de parâmetro é fixo.
  - No navegador, uma Watermark com texto sentinela, uma recusa em lote e a Unlock com senha errada e certa só mostram parâmetros das listas fechadas.

## § 170 · Orçamento, anúncio e acessibilidade por estado nas páginas de PDF (F5a, 1/nov/2026)

- **Orçamento** (`tests/e2e/budgets.spec.ts`):
  - as 12 páginas, lidas do registro, carregam exatamente 2 arquivos JS: 35,8 KB gzip de 80, e 6 requisições no Chromium e 7 no WebKit, de 8;
  - o `/pdf-tools/` entra nos hubs, com 3,4 KB e nenhum JS;
  - nada do motor antes do primeiro arquivo: um padrão único com worker, Comlink, `.wasm`, PDF.js, qpdf e os chunks do motor.
  - Dois controles positivos provam os nomes reais: a Compress PDF traz o qpdf e nenhum PDF.js, e a PDF to JPG traz o PDF.js e nenhum qpdf. O aquecimento sobre a zona não busca a biblioteca da outra ferramenta.
- **A Image to PDF e o PDF da calculadora** rodam de verdade e não buscam nenhum arquivo do qpdf nem do PDF.js.
- **Pares de navegação** (no máximo 3 requisições novas):

  | Par | Novas |
  | --- | ---: |
  | PDF para PDF | 1 |
  | Hub para ferramenta | 3 |
  | Home para hub | 1 |
  | Imagem para PDF, e de volta | 2 |
  | Calculadora para PDF, e de volta | 2 |

- **Um ajudante de estados** (`tests/e2e/lib/pdf-states.ts`): percorre os estados de cada página uma vez por carregamento. O `ads.spec.ts` e o `a11y.spec.ts` leem os mesmos estados:
  - repouso;
  - processando, com o worker segurado;
  - pronto;
  - lista da Merge;
  - grade com escolha;
  - erro de senha;
  - os três modos da assinatura;
  - resultado.
- **Anúncio:** os alvos novos são a grade, o campo de senha, a área de assinatura, a lista da Merge (com a alça), o cartão de pronto e a pilha de opções.
  - O menor vão medido foi 150 px no trilho a 1280, e de 158 a 166 px a 360.
  - Nenhuma página precisou mudar.
- **Acessibilidade:** o axe roda a 360 e a 1280, nos dois temas, em cada estado:
  - repouso;
  - lista;
  - grade com escolha, giro ou movimento;
  - senha errada e senhas diferentes;
  - os três modos da assinatura;
  - resultado.
  - O "processando" é o mesmo WaterLevel das imagens.
- **O `island` cresceu** com os ids e os eventos novos: de 0,2 a 0,4 KB nas páginas de imagem, e de 0,4 a 0,5 KB nas de dinheiro. O número de arquivos não mudou. A tabela de antes e depois está no relatório.

## § 171 · Asserções que mudaram porque o site cresceu (F5a, 1/nov/2026)

A ficha permite mudar um valor esperado que cresceu com o site, com registro. Nenhuma asserção perdeu o sentido:

- **`tests/unit/routes.test.ts`:**
  - o índice da busca lista os 12 de PDF (contagem `11 + PDF_TOOL_IDS.length + 18 + 5`);
  - "compress" ganha a `compress-pdf` no fim, e "shrink" também;
  - "jpg to pdf" dá a Image to PDF e depois a PDF to JPG;
  - a lista em inglês sem texto ganha os 12, e o pt e o es não mudam;
  - a contagem `englishOnly` soma os 13 de PDF;
  - a voz lê também os textos de PDF (§ 153).
- **`tests/e2e/navigation.spec.ts` e `tests/e2e/a11y.spec.ts`:**
  - "compress" passa de 3 para 4 resultados, e o ArrowDown com Enter ainda cai na `/compress-image/to-100kb/`;
  - "shrink" passa de 4 para 5;
  - "jpg to pdf" lista a PDF to JPG depois da Image to PDF;
  - as contagens de "lista todas as páginas" somam `PDF_TOOL_IDS.length`, lido do registro.
- **`tests/e2e/design.spec.ts`:** a busca por "compress" com a Oli escondida passa de 3 para 4 resultados.
- **`tests/unit/seo-checks.test.ts`:** o tamanho do sitemap em inglês passa a `19 + 24 + 13`.
- **`tests/unit/ads-pages.test.ts`:** a lista de páginas de ferramenta ganha as 12 de PDF e o hub. O glob de páginas de imagem deixa de fora `src/tools/pdf/`, que não é página de imagem.
- **`tests/unit/icons.test.ts`:** 39 ícones (§ 149).
- **`tests/unit/quality.test.ts`:** os dois pacotes novos na lista de pacotes do navegador (§ 143).
- **`tests/unit/prontidao.test.ts`:**
  - a home em inglês lista os 12 cartões de PDF depois dos de dinheiro;
  - a busca soma `PDF_TOOL_IDS.length`;
  - o `makeSite()` ganhou um segundo argumento, que sem uso faz o mesmo site de antes.
- **`tests/unit/licenses.test.ts`:** o rótulo do qcms saiu, porque o arquivo não é servido (§ 163).
- **`tests/e2e/image-privacy.spec.ts`:** a lista de `.wasm` ganhou os três do PDF (§ 155).

## § 172 · O worker de imagem, avaliado duas vezes pelo WebKit, responde uma vez e conhece os `.wasm` (F5a, 1/nov/2026)

- **Contexto:** o defeito da § 168 no worker de PDF tem a mesma forma no worker de imagem. Os chunks dos codecs (`avif`, `heic`, `jpeg`, `png`, `resize`, `webp` e o `runtime`) importam do chunk de entrada do worker o ajudante CommonJS do bundler (conferido no `dist/`).
  - Num WebKit com `OffscreenCanvas` no worker (o Safari de hoje e, talvez, o WebKit do Linux do CI), o primeiro codec carregado faria o worker existir duas vezes. Cada arquivo seria processado duas vezes, com o dobro da memória no iPhone.
  - No WebKit do Windows o worker de imagem não processa (§ 22 e § 102), então nenhum teste do navegador daqui reproduz o defeito.
- **Decisão:**
  - O `src/engine/image/worker.ts` passa a chamar o `expose()` só na primeira cópia, com a marca `Symbol.for('fileorca.image-engine.exposed')` no `globalThis`, como o worker de PDF.
  - O comportamento no Chromium não muda.
  - O README do pacote exportado ganha a decisão, porque o motor a cita (§ 165).
- **Teste:** o `tests/unit/worker-once.test.ts` avalia a entrada de cada worker duas vezes no mesmo escopo, como o WebKit faz, e conta as chamadas do `expose()` com o Comlink substituído.
  - Sem a correção, o worker de imagem dá 2 e reprova.
  - O nome não começa por `engine-`, para o exportador não levar o teste ao pacote, porque ele também importa o worker de PDF.
- **O que o CI mostrou depois** (run 41330210631, commit `84bc004`): as cinco partes do WebKit ficaram vermelhas, só nos testes de imagem, com o resultado que não vinha e as contagens da fila erradas.
  - O worker de imagem do WebKit do Linux processa, e a exportação do motor (§ 165) tinha trocado as URLs fixas dos codecs por URLs mandadas ao worker numa mensagem (`configure`).
  - Os chunks dos codecs importam da entrada do worker o `wasmUrl()` e o `loading()`, e não só o ajudante do bundler. Eles rodavam contra a segunda cópia, que nunca recebeu o `configure`, e todo codec falhava como `load`.
  - O mesmo valeria para todo Safari com `OffscreenCanvas` no worker.
- **A segunda correção** (commit `1d551fa`):
  - o `configure` do worker guarda as URLs também no `globalThis` (`Symbol.for('fileorca.image-engine.wasm-urls')`), e a segunda cópia, ao nascer, as toma;
  - o `EngineError` reconhece o erro da classe da outra cópia (`Symbol.hasInstance`, pelo nome e pela razão), então uma falha guarda a sua razão;
  - dois testes novos no `worker-once.test.ts` falham sem a correção: a segunda cópia conhece as URLs, e o erro da outra cópia é um `EngineError` com a razão;
  - a run 41331507992 ficou verde nas oito partes.
- **O worker de PDF** só exporta o ajudante do bundler ao chunk do qpdf, e os arquivos dele são configurados no topo do módulo, então as duas cópias se configuram sozinhas.

## § 173 · A revisão adversarial da F5a (F5a, 1/nov/2026)

- **Como:** o método da F3 e da F4 (§ 92 a § 94 e § 139), com seis lentes Sonnet em contexto limpo sobre o commit `7dab17c`, numa worktree só de leitura, e 31 céticos (um por achado crítico, alto ou médio, e um por lente para os baixos).
- **Resultado:** 53 achados, nenhum crítico. Depois dos céticos, ficaram 3 altos, 16 médios, 27 baixos e 7 refutados.
- **Correções:** os altos e todos os médios foram corrigidos, cada um com um teste que falha sem a correção.
  - Foram dois agentes Opus: um só na ilha, no motor e no CSS, como pede a ficha; outro numa worktree própria, para a matriz, a `/licenses` e a busca.
  - O A-8 e o F-1 eram o mesmo defeito.
  - Os baixos ficam no relatório.
- **Achados novos das correções:** a matriz completa achou o Forte devolvendo um arquivo reparado ainda estragado, e a mesma run achou a área de assinatura guardando o nome depois do "Start over" (§ 182).
- **Detalhe:** `docs/relatorios/REVISAO-F5a.md`, com a segunda passada sobre o diff das correções.

## § 174 · PDF cortado no meio de uma imagem é recusado (F5a, 1/nov/2026)

- **Achado A-1 (alto):** um PDF cortado no meio de uma imagem era aceito e devolvido sem a imagem, com "Done". Isso aconteceu em 31 de 32 pontos de corte de um escaneado, e a foto 4 da `gen-fotos` sumia. O `openPdf` só conferia a MediaBox e os `/Contents` de cada página.
- **Decisão:** um PDF sem `%%EOF` e sem índice que aponte para dentro dele é cortado (`truncated`).
  - Uma página cujos recursos citam uma imagem ou fonte que o arquivo não tem é recusada: cortada, ou danificada (`corrupted`) quando o arquivo tem fim.
  - A `gen-xref-estragada` segue reparada, e a `gen-cortado` segue cortada.
  - Um arquivo cortado depois do último objeto, sem nada visível perdido, também passa a ser recusado como cortado.
- **Testes:**
  - no `tests/unit/pdf-engine-open.test.ts`, cortes de 10% a 95% do escaneado, da `gen-fotos` e da `gen-xref-estragada`, e um arquivo inteiro com uma referência de imagem ou fonte quebrada;
  - no `pdf-tool.spec.ts`, a recusa na linha da Rotate (commit `693ccf1`).

## § 175 · A matriz de PDF roda toda ferramenta contra toda fixture que ela aceita (F5a, 1/nov/2026)

- **Achado A-6 (de médio a alto pelo cético):** a matriz rodava a Delete, a Sign e a Reorder com uma fixture cada, a Split com 4 e a Protect com 3. Isso fere o critério 3 e a decisão 12 da ficha ("cada ferramenta, cada fixture que ela aceita e os dois navegadores").
- **Decisão:** o `pdf-matrix.spec.ts` passou de 18 para 51 testes por navegador.
  - Cada ferramenta, e cada modo da Compress, roda todas as fixtures que aceita.
  - As pequenas vão num lote só, com as recusadas no meio. Nas ferramentas de um arquivo por vez, elas vão uma depois da outra, com "Start over".
  - Cada arquivo grande (300 páginas, 117 páginas, o escaneado de 150 páginas) tem um teste próprio em cada ferramenta.
  - Uma página sem marcador é reconhecida por uma chave lida pelo PDF.js (tamanho, giro, imagens, primeiras palavras).
  - Os quatro casos do Forte nos arquivos grandes têm 240 s de limite. Um Forte num arquivo só não se divide, e nenhuma conferência foi afrouxada.
- **A tabela** (`docs/relatorios/fase-05a-matriz.md`) abre com a cobertura. O script e o `tests/unit/pdf-matrix-table.test.ts` reprovam combinação faltando ou saída `failed`. Contra a tabela antiga, o teste dá 64 lacunas.
- **Asserções que mudaram com a matriz:**
  - o Forte usa a regra dos bytes originais sem ganho, já usada no Recomendado, porque o escaneado da NASA tem dois avisos do qpdf no original;
  - a Protect afirma a recusa do arquivo só de dono;
  - a Sign confere as imagens de cada página mais uma;
  - a Reorder confere as chaves das páginas invertidas;
  - os arquivos grandes saíram do lote pequeno para testes próprios.
- **Commit:** `6c59e04`. A matriz completa achou o defeito do Forte da § 182.

## § 176 · O foco depois do botão de ação vai para o Baixar (F5a, 1/nov/2026)

- **Achado D-1 (alto):** depois do botão de ação, o foco caía no `<body>` (Delete, Reorder, Split com uma opção mudada), e o DropZone vazio piscava enquanto a Oli trabalhava. O `update()` limpava o pedido de foco, e o estado "processando" sem a WaterLevel caía no ramo do DropZone.
- **Decisão:**
  - Apertar a ação pede o resultado: o foco vai para o Baixar quando ele chega.
  - Enquanto a Oli trabalha, o cartão de pronto fica no lugar, nunca o DropZone vazio.
  - Nas ferramentas que rodam ao soltar, a WaterLevel da leitura continua na execução que vem logo depois.
- **Teste:** no `pdf-tool.spec.ts`, Delete, Reorder e Split pelo teclado, nos dois navegadores. Depois do Enter na ação, o Baixar fica com o foco, e o DropZone nunca aparece entre o Enter e o resultado (commit `276dc79`).

## § 177 · Erros anunciados, senha com nome estável e foco que não volta (F5a, 1/nov/2026)

- **D-2 (de alto a médio):** os erros de campo do painel de PDF são alerta (`role=alert`), como o do NumberField.
  - Isso vale para a senha errada, a regra e a confirmação da senha, a falta de escolha, a faixa, o texto da marca d'água e a imagem da assinatura.
  - A falha do envio da assinatura tem linha própria e `aria-invalid` no campo (commit `b8b983c`).
- **D-3:** o botão de mostrar a senha mantém o texto "Show" e um nome que diz o campo ("Show password", "Show password confirmation"). O estado fica só no `aria-pressed`, com o visual pressionado da alça do Merge (commit `901d4c3`).
- **D-4:** a grade de páginas não guarda foco pendente quando a seta não move nada, e descarta o pendente quando o foco já está num controle fora dela (commit `594c647`).
- **D-5:** na lista do Merge, o foco fica na mesma seta apertada da linha movida. Ele vai para a outra seta só quando a apertada fica desativada na ponta (commit `31d5c53`).
- **Testes:** um por achado no `pdf-tool.spec.ts`, nos dois navegadores, cada um falhando sem a correção.

## § 178 · Correções de corretude das ferramentas de PDF (F5a, 1/nov/2026)

- **A-2:** Merge, Split e Delete levam o `/OCProperties` dos grupos que as páginas copiadas usam, com o estado ligado ou desligado de cada arquivo e a ordem do painel podada. Uma camada oculta continua oculta. O teste conta os pixels com o PDF.js (commit `aef7779`).
- **A-3:** assinar páginas de formatos diferentes encaixa a caixa em cada página. A imagem sobe ou recua da borda, e só diminui se for mais alta que a página (commit `20c4a66`).
- **A-4:** na PDF to JPG, uma faixa com página que nenhum arquivo tem é erro do campo, conferido contra o maior arquivo (commit `2b17781`).
  - Num lote, o arquivo sem nenhuma página da faixa é recusado na linha dele ("has no page in that range"), e os outros saem.
  - O `no-pages` é razão só do painel e não vai ao GA4, como o `one-at-a-time`.
- **A-5:** uma ferramenta de lote declara as opções que são de um arquivo (`perFile`). Um arquivo novo que substitui os anteriores volta essas opções ao início. O Rotate declara as voltas e o escopo (commit `31e28b5`).
- **A-8 e F-1:** a fala de sucesso conta o que saiu (commit `b8c53fe`).
  - Na PDF to JPG, várias imagens dão "Done! Oli turned the pages into {count} images.".
  - Uma imagem só dá "Done! Oli turned your PDF into an image.".
- **Testes:** um por achado, no Vitest ou no `pdf-tool.spec.ts`, cada um falhando sem a correção.

## § 179 · O core-js do PDF.js na `/licenses` (F5a, 1/nov/2026)

- **Achado B-1:** o core-js 3.50.0 (MIT) vai compilado dentro do build legacy do PDF.js, sem texto na `/licenses`, e o `gate:licencas` não o via.
- **Decisão:**
  - O texto do LICENSE do pacote npm do core-js 3.50.0 entra em `src/platform/license-texts/`, listado no `pdfjs-dist` com o campo `embeds: 'core-js'`.
  - O `gate:licencas` lê os marcadores `// MODULE: ./node_modules/<pacote>/` de todo arquivo pronto do bundle. Ele reprova pacote compilado sem texto ou com texto de outra versão.
- **Teste:** um controle negativo no `tests/unit/licenses.test.ts` (commit `4abff84`).

## § 180 · A busca leva ao nome pedido, e as miniaturas da grade não se atropelam (F5a, 1/nov/2026)

- **E-1:** a busca mandava "merge pdf" e "pdf to jpg", com Enter, para a Image to PDF.
  - Ela passa a ordenar por proximidade, mantendo a ordem do índice dentro de cada degrau:
    - primeiro, nome ou sinônimo igual à busca;
    - depois, um que contém a busca inteira;
    - por fim, palavra por palavra.
  - A Image to PDF troca os sinônimos "merge" e "combine" por "merge images" e "combine images".
  - No `routes.test.ts`, "merge pdf" passa a vir antes de "image to pdf" (commit `f6806dc`).
- **E-3:** as miniaturas da grade são compartilhadas por contagem, e a prévia da Sign segura a sua.
  - Elas são desenhadas duas por vez.
  - A que saiu da tela antes da vez não é desenhada.
  - A resposta que chega depois que a célula saiu é descartada.
  - O teste varre a grade de 300 páginas e falhava com 248 imagens de URL já revogada (commit `bcf06ec`).

## § 181 · As peças novas no padrão do design system (F5a, 1/nov/2026)

- **F-2:** abaixo de 480 px, a linha da lista do Merge vira duas: o cartão na largura da lista, e a alça e as setas embaixo. Antes, um arquivo recusado virava uma coluna de 412 px (commit `bc3b9e3`).
- **F-3:** todo erro de campo do painel de PDF sai do FieldError: ícone de alerta, frase e `role=alert` (commit `4fcba88`).
- **F-4:** no envio da assinatura, o campo nativo fica fora da vista, mas com foco, nome e teclado. O rótulo dele tem o visual de botão (ícone de envio, "Choose a signature image"), e o nome do arquivo escolhido aparece ao lado (commit `de70141`).
- **Testes:** no `pdf-tool.spec.ts`, nos dois navegadores.

## § 182 · O Forte não devolve um arquivo estragado, e a assinatura recomeça com o "Start over" (F5a, 1/nov/2026)

- **Compress:** sem ganho, a Compress devolvia os bytes que entraram.
  - Num arquivo cujo índice o pdf-lib teve de refazer, esses bytes são os estragados. A matriz completa (§ 175) achou o Forte devolvendo a `gen-xref-estragada` estragada, contra a decisão 4 da ficha ("Nunca sai um PDF quebrado") e a § 156.
  - Agora, num arquivo reparado, o que volta sem ganho é a reescrita reparada pelo passo sem perda, tirada antes de o Recomendado mexer no documento. Isso vale nos três modos e no caminho da página do Forte.
  - O `tests/unit/pdf-compress.test.ts` afirma que um arquivo reparado nunca volta com os bytes de entrada, e falha no Forte sem a correção. Quando o Forte não ganha, a saída é a mesma do Sem perda (commit `88b85bb`).
- **Sign:** a área de assinatura guardava o nome digitado, o desenho e a imagem escolhida depois de o "Start over" limpar a assinatura no estado da ferramenta.
  - O nome aparecia sem assinatura, e digitar o mesmo nome de novo não desenhava nada. Isso foi achado quando a matriz assinou um arquivo depois do outro.
  - Agora a área separa a limpeza que ela mesma faz da limpeza da ferramenta, e na segunda recomeça.
  - Uma chave (`key`) pelo arquivo foi tentada antes e desfeita: o arquivo só aparece depois de lido, e a área montava de novo no meio da escolha do modo.
  - O teste no `pdf-tool.spec.ts` falhava com o campo ainda em "Orca Signer" (commit `6caccef`).

## § 183 · A segunda passada da revisão (F5a, 1/nov/2026)

- **Como:** um revisor Sonnet em contexto limpo leu só o diff das correções (`7dab17c..6e35bdd`), na worktree da revisão movida para `6e35bdd`, com o próprio build. Ele achou 2 médios e 4 baixos, nenhum crítico ou alto, e nenhuma correção que deixasse de resolver o achado.
- **S-1 (médio), corrigido:** a checagem de recursos da § 174 recusava como danificado um PDF completo que cita, nos recursos de uma página, uma fonte ou imagem que o arquivo não tem.
  - Pelo formato PDF, essa referência vale `null`, e o PDF.js lê o arquivo.
  - A checagem passa a valer só num arquivo sem o fim, onde ela é o rastro de um corte.
  - Os 15 cortes dos testes da § 174 continuam recusados.
  - O teste novo do `pdf-engine-open.test.ts` afirma os dois lados (completo, lido; sem o `%%EOF`, cortado) e falha sem a correção.
- **S-2 (médio), corrigido:** a prévia da página na Sign era desenhada de novo a cada render do painel, porque o efeito dependia da vista do arquivo, que o painel refaz a cada render. Com o `drop` da § 180, cada movimento da caixa soltava a imagem e pedia outra ao worker.
  - O efeito passa a depender do id do arquivo e da leitura dele.
  - O teste observa a prévia durante dez movimentos e falhava com duas imagens.
- **S-5 (baixo), corrigido:** a correção do A-8 (§ 178) tirou a contagem da fala da Merge, que tem uma saída só. A Merge volta a dizer quantos arquivos juntou ("joined your 3 PDFs into one").
- **S-6 (baixo), corrigido:** trocar o modo da assinatura deixava o nome da imagem enviada sem a assinatura dela. A troca de modo também apaga o nome e o erro do envio.
- **S-3 (baixo), registrado:** o fim do arquivo (`%%EOF`) é procurado nos últimos 64 KB. Um PDF completo seguido de mais de 64 KB de lixo é recusado como cortado.
  - Procurar no arquivo inteiro acharia o `%%EOF` de uma revisão anterior num arquivo de atualização incremental cortado no meio da última, e um corte desses voltaria a passar.
  - Fica a janela de 64 KB.
- **S-4 (baixo), registrado:** a reescrita reparada que a Compress devolve sem ganho (§ 182) pode ficar maior que a entrada estragada (num PDF mínimo, 796 contra 767 bytes). A decisão 4 da ficha ("Nunca sai um PDF quebrado") vem antes do "nunca maior".
  - Nas fixtures, a reparada é menor que a entrada em todos os modos.
- **Testes:** os quatro corrigidos têm teste no Vitest ou no `pdf-tool.spec.ts`, e cada um falhou contra o código de antes.

## § 184 · O registro, a view e a ferramenta embutida dos guias de arquivo (F5b, 1/nov/2026)

- **Registro:** `src/tools/guides/registry.ts` (`FILE_GUIDE_IDS`, `FILE_GUIDES`), só dados e nunca importado pela ilha. Cada guia tem o caminho, a ferramenta embutida, o hub e até 6 relacionadas. O `GUIDE_IDS` das calculadoras não muda: ele alimenta o `gate:dinheiro-saude` (24 de 24).
- **View:** `src/views/FileGuideView.astro`, nova. A `GuideView` do dinheiro fica como está, presa à calculadora e aos blocos `data-ymyl`.
- **Ferramenta de imagem embutida:** cada página de ferramenta embutida (`src/tools/<slug>/<Slug>Page.astro`) ganha `embed`, que troca o molde `ImageToolPage` por `src/tools/image/ImageToolEmbed.astro` (só o `#fo-tool-root` com o `data-props` e o slot). O `<script>` do `mount.ts` continua no mesmo componente, então a página da ferramenta e o guia carregam a mesma entrada, com o mesmo nome e hash, e o chunk `island`: dois arquivos.
  - Alternativa recusada: um `<script>` num componente do guia. O Rolldown tiraria o `mount.ts` para um chunk comum, e a página da ferramenta passaria a três arquivos.
  - Alternativa recusada: um componente `<Slug>Island.astro` por ferramenta. Renomearia a entrada das páginas que já estão no ar e mexeria no `ImageToolPage`.
- **Ferramenta de PDF embutida:** o `PdfIsland.astro` de sempre, a entrada das 12 páginas.

## § 185 · A tolerância do `pnpm guias:medir --check` (F5b, 1/nov/2026)

- **Decisão, fixada antes da primeira medida que vai para o arquivo:** as medidas do Node comparam exatas. As do navegador comparam bytes e razões com até 2% de diferença relativa e PSNR com até 0,5 dB; dimensões, contagens e presença de metadado comparam exatas.
- **Por quê:** o canvas do Chromium e do WebKit codifica diferente de uma versão para outra, e o Playwright atualiza os dois. Na mesma máquina e na mesma versão o resultado repete byte a byte (os protótipos da exploração repetiram), então a tolerância só cobre a troca de versão.
- **Onde:** `TOLERANCE` em `scripts/guides/measure.ts`, gravada também no JSON (`tolerance`).

## § 186 · A ferramenta do guia 6 sai de uma regra fixada antes da medida (F5b, 1/nov/2026)

- **Regra:** entre as ferramentas de imagem que aceitam JPG, cada uma com a opção que menos mexe na foto e que se escolhe num passo só (sem desenhar caixa), vence a que devolve um JPG do mesmo tamanho na tela com o maior PSNR no pior caso contra os pixels do original; empate, o menor arquivo. Os dois navegadores têm de concordar.
  - **As opções:** Compress image (Recommended, a mais leve das duas), Resize image (By percentage, 100), Crop image (Square, o padrão; a imagem inteira pede quatro campos), Rotate image (Right, o padrão; não existe girar zero), PNG to JPG (o padrão: o JPG vira PNG) e Image to PDF (o padrão).
  - **O PSNR:** o original e a cópia passam pelo mesmo decodificador (MozJPEG no Node, ou o leitor de PNG dos testes). Tamanho diferente (o recorte, o giro, o PDF) fica fora.
- **Amostra:** as três fotos reais com GPS das fixtures, no Chromium e no WebKit.
- **Consequência:** o guia embute a ferramenta vencedora com a opção vencedora, por propriedade da página. Para isso o `ImagePanelData` ganha `initial`, aplicado no estado inicial do `ImagePanel`; nunca pela URL.

## § 187 · O `gate:seo` nos guias de arquivo (F5b, 1/nov/2026)

- **Decisão:** cada guia de arquivo pede `Article`, `BreadcrumbList` e `Person`, como os guias de dinheiro, e o breadcrumb termina no próprio guia (`requiredSchemaTypes` e `schemaProblems` em `scripts/lib/seo-pages.ts`).
- **O título:** começa pelo nome do guia (o do cartão, em `enCommon.fileGuides`), em Title Case, comparado sem caixa como na § 122. Nem o título nem o H1 têm ano, e nenhum dos dois começa pelo H1 da ferramenta embutida, que o portão lê na página dela no `dist/` (`fileGuideTitleProblems`).
- **Por quê:** a ficha pede título sem ano e sem canibalizar a página da ferramenta. Por isso o guia 7 se chama "Which resolution to choose for PDF to JPG", e não "PDF to JPG: …".
- **Testes:** controles positivos e negativos em `tests/unit/seo-pages.test.ts`. Os guias também entram no sitemap em inglês que o portão confere.

## § 188 · O `gate:conteudo` e a voz nos guias de arquivo (F5b, 1/nov/2026)

- **Decisão:** `checkFileGuide` (`scripts/lib/file-guides.ts`) confere cada guia do registro.
  - Os blocos aparecem na ordem da decisão 4: breadcrumb, H1, "Reviewed" com as duas datas, introdução, uma só raiz `#fo-tool-root`, o link para a página da ferramenta, o AdSlot de conteúdo, "What we measured" com tabela em `.fo-table-wrap` e a data, as fontes com link `https` e a data da leitura, e até 6 relacionadas. São no máximo 2 AdSlots.
  - O texto próprio tem de 800 a 1.500 palavras.
  - Nenhuma frase de enchimento: "in today's world", "delve", "it's important to note", "in conclusion" e parentes.
- **O que conta como palavra:** só os blocos `data-guide-text` da view (o topo, a introdução, as seções e as notas da medida). Ficam de fora a ferramenta, as tabelas, as fontes e os cartões. O texto de cada bloco é lido com quebra entre os elementos, para um título e o parágrafo seguinte não virarem uma palavra só.
- **Voz:** o `gate:design` passa as regras de voz (`checkVoice`) no texto visível de cada guia, e o `tests/unit/guides-numbers.test.ts` passa as mesmas regras nos arquivos de texto.
- **Testes:** controles positivos e negativos em `tests/unit/conteudo.test.ts`. O `dist` falso do teste do portão passou a ter os 10 guias.

## § 189 · Nenhum número à mão nos guias de arquivo (F5b, 1/nov/2026)

- **Decisão:** todo algarismo de um texto de guia fica num `{placeholder}`. Um placeholder é uma de três coisas:
  - um número de `data/guides-measured.json`, num jeito de escrever fixo: `{nome}` no padrão da unidade, ou `{nome_off}`, `{nome_more}`, `{nome_times}`, `{nome_change}`, `{nome_exact}` e `{nome_word}`;
  - um fato que a medida decidiu (a opção do guia 6);
  - um fato oficial da lista curta do próprio guia (`facts`), com a fonte que o guia cita.
- **Fora disso:** só os nomes técnicos de `names`, como "H.264", "W3C" e "Windows 11". O `src/tools/guides/measured.ts` só formata e nunca faz conta.
- **O teste:** `tests/unit/guides-numbers.test.ts` reprova algarismo fora disso, em prosa, lista, título ou cabeçalho de tabela. Ele reprova também um fato cuja fonte o guia não cita, e uma fonte sem a data da leitura. No guia 3, cada página oficial de medida do JSON tem de estar entre as fontes. O teste tem controles positivos e negativos.
- **Contagens em palavras:** contagens escritas por extenso ("three photos") também seriam número à mão. Os textos usam `{nome_word}` ou deixam a contagem de fora.
- **`lint:texto`:** um guia de arquivo não é texto de dinheiro (`fileGuideOf`). Ele é preenchido com os valores que a página mostra, e os links e as datas das fontes (`href`, `read`) ficam fora da leitura. O teste está em `tests/unit/lint-texto-money.test.ts`.

## § 190 · A busca e as contagens com os guias de arquivo (F5b, 1/nov/2026)

- **Decisão:** os 10 guias entram no fim do índice da busca, na categoria do hub (Image ou PDF), com o nome e dois ou três termos que não colidem com as consultas dos testes.
  - Os guias que dizem "JPG" no nome ganham uma frase com "jpeg", para "jpg" e "jpeg" continuarem achando a mesma lista na mesma ordem.
  - Nenhum guia diz "merge", para "merge" seguir achando só Merge PDF e Image to PDF.
- **O que mudou por construção** (a § 125 e a § 171 são o precedente):
  - `routes.test.ts`: a lista de rotas ganha os 10 ids; as páginas só em inglês passam de 48 a 58; o índice da busca passa de 46 a 56 entradas.
  - As consultas `jpg to pdf` e `heic` ganham o guia no fim (`routes.test.ts`; a de `jpg to pdf` também no `navigation.spec.ts`).
  - `pdf to jpg` passa a `pdf-to-jpg`, o guia de resolução e Image to PDF, porque o nome do guia diz "PDF to JPG". A ferramenta continua primeiro, que é onde vai o Enter (§ 180).
  - `pdf` ganha os guias cujo nome diz PDF, depois das ferramentas.
  - `seo-checks.test.ts`: o sitemap em inglês passa de 56 a 66 URLs.
  - `prontidao.test.ts`: os ids da busca ganham os 10 guias.
- **Por quê:** a ficha manda os guias para a busca. Nenhuma consulta perdeu o primeiro resultado, e nenhuma ferramenta saiu de uma lista.

## § 191 · O kit do Product Hunt e o teste que o lê (F5b, 1/nov/2026)

- **Decisão:** `docs/lancamento/product-hunt.md` no modelo do `show-hn.md`.
  - As regras vêm só das páginas do Product Hunt, lidas em 1/nov/2026 e resumidas em português.
  - Os textos que vão para fora estão em inglês: o nome, 3 taglines, 2 descrições, as tags sugeridas, o primeiro comentário como roteiro e as respostas prováveis.
  - O arquivo traz as imagens com a legenda, as provas e o checklist do dia.
- **O teste:** `tests/unit/launch-kit.test.ts`, no `verificar`, lê o arquivo e reprova:
  - uma contagem do produto ("8 image tools", "15 guides"…) diferente dos registros;
  - uma contagem de caracteres diferente do texto ou acima do limite lido;
  - uma imagem listada que falte, tenha outro tamanho ou peso, passe do limite, não tenha legenda ou leve metadado da máquina;
  - uma prova que cite um arquivo de teste que não existe.
- **Por quê:** a ficha pede que o kit não minta quando uma run mudar uma contagem (a 2b). O `show-hn.md` marcava essas linhas com um comentário; aqui o teste as segura.
- **Limites:** onde duas páginas oficiais discordam, vale o mais estreito, e o texto manda conferir no formulário. A miniatura fica até 2 MB (uma página diz 2 MB, outra 3 MB) e a galeria até 3 MB por imagem.
- **Data do lançamento:** a primeira terça depois do merge, às 12:01 AM do Pacífico, 5h01 em Brasília (o horário de verão dos EUA acabou em 1/nov/2026). O texto também diz o limite de agendamento ("de amanhã até 30 dias") e que 3/nov/2026 é dia de eleição nos EUA.

## § 192 · O GIF da Oli e o `gifenc` (F5b, 1/nov/2026)

- **Decisão:** o GIF animado da miniatura (240 × 240) sai de quadros desenhados pelo `@resvg/resvg-js`, que já era `devDependency`.
  - O desenho usa o SVG da pose (`docs/design/assets/Oli/`, só `wave` e `cheer`) e as cores dos tokens.
  - O movimento sai dos keyframes do próprio site (`fo-float` e `fo-cheer`, lidos em `src/styles/components.css`), com a duração e a curva dos tokens (`dur-float`, `dur-cheer`, `ease-in-out`, `ease-spring`), calculados quadro a quadro.
  - Uma paleta só, para a cor não piscar entre quadros.
- **O codificador:** `gifenc` 1.0.3 (MIT, de 2022), a única `devDependency` nova, fixada na versão exata. O `pnpm-lock.yaml` mudou só por ela, e o `gate:licencas` fica verde. O pacote não traz tipos: a declaração está em `scripts/lancamento/gifenc.d.ts`.
- **Alternativa recusada:** um codificador próprio em `scripts/`, com LZW e quantização feitos à mão. Daria mais código para testar e mais risco de GIF quebrado, para uma imagem que sai do `verificar`.
- **Nada disso entra no bundle:** o script fica em `scripts/lancamento/`.

## § 193 · A galeria do Product Hunt (F5b, 1/nov/2026)

- **Decisão:** são 5 imagens de 1270 × 760, cada uma com um estado real do `dist/` servido, aberto no Chromium com o consentimento já escolhido (sem o aviso de cookies):
  1. a home;
  2. a HEIC to JPG com duas fotos do iPhone convertidas;
  3. a Compress PDF com o PDF de fotos (`gen-fotos`);
  4. a tabela medida do guia "Why is my PDF so large?";
  5. a calculadora de financiamento com o exemplo.
- **A moldura:** fundo `deep`, legenda em Fredoka na cor `on-deep` e o logo escuro, lidos das variáveis do CSS do próprio site.
  - Na imagem 4, a moldura de rolagem da tabela (§ 129) é aberta só para a foto, para a tabela sair inteira.
  - As poses que aparecem são as do site naquele estado: `wave` na home e `cheer` no resultado.
  - O amarelo só aparece no Download dos screenshots.
- **Por que 5:** a ficha pede de 3 a 6. Com 5, a galeria cobre as três áreas, um guia e a ferramenta mais buscada, sem repetir estado.

## § 194 · O guia que entra no Lighthouse (F5b, 1/nov/2026)

- **Decisão:** `/guides/why-is-my-pdf-so-large/` entra no `lighthouserc.json`.
- **Por quê:** a ficha pede o guia de entrada mais pesada pela medida. No `budgets.spec.ts`, os guias de PDF carregam 36,8 KB gzip (a entrada do `PdfIsland` e o chunk `island`), contra 20,8 a 21,3 KB dos de imagem. Entre os quatro guias de PDF, que empatam no JS, esse é o do plano (guia 2) e o de mais texto.
- **As páginas que já estavam** seguem na lista, com as mesmas asserções.

## § 195 · Os hubs e as páginas das ferramentas levam aos guias (F5b, 1/nov/2026)

- **Hubs:** o `/image-tools/` e o `/pdf-tools/` ganham a seção "Guides" (`aria-labelledby="guides"`; o id `guide` já é do "qual ferramenta usar"), uma linha por guia do hub, com link simples e sem `fo-tool`. O `checkNothingUnfinished` conta os cartões dos hubs contra o registro.
- **Ferramentas:** a página de cada ferramenta embutida ganha um parágrafo `fo-guide-links` com o link para o guia dela.
  - O link sai do registro (`guidesOfTool`) e fica fora de qualquer bloco `data-content`, entre as especificações e as perguntas, longe dos dois AdSlots. O `ads.spec.ts` confere os 150 px.
  - Só em inglês, onde os guias existem (§ 6).
  - A Resize image leva aos dois guias que a embutem: o das redes sociais e o da localização.

## § 196 · O `--check` compara cada coluna pelo método dela (F5b, revisão final, A-6)

- **Achado:** o `compareTables` do `scripts/guides/measure.ts` dava a tolerância de 2% a uma tabela inteira quando algum método dela era o Playwright, e tirava a unidade do nome da coluna (`/bytes$/`). Numa tabela mista, uma coluna do Node (o Lossless e o Recommended do guia 2) passava com 1,9% a mais, e uma do navegador (`strongBytesChromium`) era comparada exata, contra a decisão 3 da ficha e a § 185.
- **Mudou:** cada tabela do JSON ganha `kinds`, um por coluna, com quem mediu (`node` ou `playwright`) e a unidade (ou `label`). O plano declara a coluna ao montar a tabela (`label`, `inNode`, `inBrowser`, em `scripts/guides/lib/record.ts`), e uma coluna do navegador numa tabela sem método do navegador é erro. A comparação saiu para `scripts/guides/lib/compare.ts`, que o teste importa (o `measure.ts` mede ao ser importado): Node exato, navegador com a tolerância da unidade, rótulo igual.
- **De quebra:** as quatro fixtures geradas da tabela do Compress que não tinham número gêmeo exato (`gen-acoes`, `gen-paginas-300`, `gen-paginas-mistas`, `gen-xref-estragada`) ganham os números do Lossless e do Recommended (§ 197).
- **Teste:** `tests/unit/guides-measured.test.ts`, "guias:medir --check compares each column by who measured it": sobre a tabela do Compress, o Lossless e o Recommended mudados em 1,9% reprovam, o Forte do Chromium e do WebKit mudado em 1,9% passa, e em 2,5% reprova; o mesmo para os números. O `fileProblems` reprova tabela sem um `kind` por coluna.

## § 197 · O guia 2 diz o que se mediu, e um teste reprova a generalização (F5b, revisão final, A-4 e A-10)

- **Achado:** o guia "Why is my PDF so large?" dizia que o Compress "gains almost nothing on a PDF of text", que a reescrita sem perda é "a modest gain, never a dramatic one", que "Most PDFs are small" e que o peso é "almost always one of two things", com "Adobe says the same". A própria tabela mostra o Lossless tirando de 26% a 40% dos PDFs só de texto gerados pelo script das fixtures (escritos sem object streams) e de 0% a 14% dos documentos reais. A página da Adobe diz "can directly impact" e "can sometimes increase", mais fraco que o texto.
- **Mudou:** o texto cita o que se mediu, por placeholder: o Lossless no PDF longo só de texto (`textOnlyLosslessRatio`), os bytes que ele tirou das notas de aula (`bookLosslessSaved`) e do PDF de fotos (`photosLosslessSaved`, no lugar do "2.9 MB to 2.9 MB"), e a amostra de "what takes the space" (`spaceFiles`). A nota da tabela diz quais PDFs são documentos reais e quais o script de teste escreveu, e a descrição troca "real files" por "our test PDFs". A Adobe entra com a hesitação dela. Saem também "usually email", "often goes" e "a much smaller file than any compression afterward".
- **Medida nova:** o plano do guia 2 grava o Lossless e o Recommended das quatro fixtures geradas que faltavam (§ 196), o `LosslessSaved` de cada PDF e o `spaceFiles`.
- **Teste:** `tests/unit/guides-numbers.test.ts`, "say what the sample did, never what files usually do": a lista `GENERAL` (usually, often, rarely, typically, most of the time, almost always, almost nothing, in most cases, never a dramatic, says the same, most PDFs, most photos e as outras) reprova a frase em qualquer texto de guia de arquivo, com controles positivo e negativo. Antes da correção, 18 frases em 6 guias caíam nela.

## § 198 · O tamanho oficial é só o que a página diz (F5b, revisão final, A-2, C-8 e A-9)

- **Achado:** a linha da miniatura do YouTube punha "1,280 × 720" na coluna "Official size". A página citada (https://support.google.com/youtube/answer/72431, relida em 1/nov/2026 sem login) não traz 1280 nem 720: recomenda 3840 × 2160 para vídeos, largura mínima de 640, sugere 16:9 ("try to upload") e dá 2 MB no celular. O 1280 × 720 é o que o preset do site faz (§ 60).
- **Mudou:** cada `OfficialSize` ganha `stated`, as palavras da página que dão o tamanho e o limite, como lidas. A linha do YouTube passa a 3840 × 2160 com o limite de 2 MB, e a coluna "Our photos came out" mostra o 1280 × 720 que o preset fez, medido nas saídas (`thumbnailWidth` e `thumbnailHeight`; o tamanho do preset só fica no script para contar as saídas exatas). O texto troca "asks for thumbnails in 16:9" por "suggests the 16:9 shape" e "exactly the size in the table" pelo tamanho medido.
- **As palavras de cada página:** relidas em 1/nov/2026. As páginas do Instagram devolvem só "Help Center" ao leitor e a do X devolve 403, então as palavras delas são o texto da própria página como o buscador o mostra.
- **De quebra (baixos):** o "(ad specs)" repetido do Pinterest sai (C-8), e a linha diz que o limite de 20 MB é o do computador ("uploaded from a computer"; a página dá 32 MB no app, A-9). O título "File size is rarely the problem" vira "File size was not the problem for our photos".
- **Teste:** `tests/unit/guides-measured.test.ts`, "take an official size only from the words of its page": a largura e a altura (ou a largura e uma razão que dá a altura) e o limite têm de estar no `stated`. Controles: o 3840 × 2160 com as palavras da página passa, o 1280 × 720 com as mesmas palavras reprova, e um limite que a página não dá reprova.

## § 199 · O mínimo e o máximo dizem a direção (F5b, revisão final, A-3)

- **Achado:** o guia 6 dizia "the closest it came to the original was 35.7 dB". O número é o mínimo das três fotos (`compressImagePsnrMinChromium`, o pior caso); a melhor foto deu 39,2 dB. A coluna "Pixels" mostrava o mínimo sem dizer.
- **Mudou:** a frase diz "its lowest score on our photos", e que mais alto é mais perto. A coluna passa a "Pixels, worst photo", e a legenda e a introdução da tabela dizem que ela mostra a pior das fotos.
- **Teste:** `tests/unit/guides-numbers.test.ts`, "say whether a measured number is the lowest or the highest": um placeholder medido com `Min` ou `Max` no nome tem, na mesma frase, a outra ponta (uma faixa) ou uma palavra da direção (lowest, worst, largest, up to…), e um mínimo nunca vem com closest, best ou highest. Controles com a frase antiga, com uma frase sem direção e com a faixa.

## § 200 · O guia 8 mede o que as partes repetem: os metadados (F5b, revisão final, A-5 e F-4)

- **Achado:** o guia 8 explicava os 32% a mais das partes do relatório da NASA com "the small frame every PDF needs around its pages". Cerca de 80% do crescimento é o XMP do documento (6.202 B), copiado em cada uma das 150 partes (930.300 B), porque um documento novo leva os metadados do primeiro arquivo (§ 145). O título "Where they barely grew: scans" e a frase "splitting costs almost nothing extra" chamavam de quase nada um terço a mais, e a introdução dizia "Most of the time that changes little" com 3 dos 5 PDFs mais pesados em partes.
- **Mudou:** o `breakdown` do `scripts/guides/lib/node-pdf.ts` passa a contar os streams de metadados (`/Type /Metadata` ou `/Subtype /XML`), e o plano do guia 8 grava, para cada PDF, os metadados do original e das partes, o crescimento, o crescimento por parte e a parte do crescimento que é metadado (`reportMetadataShare`, 80%). O texto diz isso com placeholders, renomeia o título para "Scans: what every part repeats", troca a frase final pelo custo por parte (`reportGrowthPerPart`) e a introdução pela amostra (`{files_word}`, `{bigger_word}`, `{bookRatio_times}`). O PDF de fotos diz o crescimento ao byte (`photosGrowth_exact`), no lugar do "2.9 MB against 2.9 MB" (F-9). A frase da Adobe ganha o "sometimes" da página (A-10).
- **O motor não muda:** copiar os metadados para cada parte é a decisão da § 145; só a medida e o texto mudaram.
- **Testes:** `tests/unit/guides-measured.test.ts`, "Split PDF: the metadata each part of the NASA report repeats is what the file says" (a divisão refeita no Node dá os mesmos bytes de metadados e de crescimento do JSON, e o metadado é mais da metade do crescimento) e "explain, in guide 8, the growth of the scans with the metadata every part repeats" (o texto cita os quatro números e não traz mais as frases antigas).

## § 201 · As outras generalizações dos guias (F5b, revisão final, F-4)

- **Achado:** além dos guias 2 e 8, o guia 4 dizia "how much smaller a web image usually is" sobre três fotos com WebP do próprio motor, e o guia 9 dizia que o Compress "can usually bring a PDF of photos or scans well under" o limite, contra o scan preto e branco do guia 2, que quase não encolhe.
- **Mudou:** o guia 4 diz quanto as cópias WebP pesaram, na qualidade do codificador do site (`webpRatio`); o guia 9 diz o que as medidas do guia 2 mostraram (o PDF de fotos e a página escaneada em cores bem mais leves, o scan preto e branco pouco) e aponta para ele. A mesma regra da § 197 pegou e corrigiu "usually" e "often" nos guias 1, 4, 9 e 10: no guia 1, as fotos convertidas "came out bigger together" (uma ficou menor) e "half of them grew by … or less" no lugar de "the middle photo grew by" (A-11); no guia 10, o PDF das fotos ficou "{pdfRatioChromium} as heavy" no lugar de "roughly as heavy … which is often too heavy".
- **Teste:** o mesmo da § 197.

## § 202 · O guia 6 diz onde os navegadores diferiram, por um fato da medida (F5b, revisão final, A-8)

- **Achado:** a nota da tabela do guia 6 dizia que o Chromium e o WebKit "agreed on every tool", e o PNG to JPG deu 48,7 MB no Chromium e 37,6 MB no WebKit. A frase "PNG files 5.2 times the size" não dizia o navegador.
- **Mudou:** o plano grava o fato `browsersDiffer` (os nomes das candidatas cujo tamanho de saída difere entre os navegadores, hoje "PNG to JPG") e os números `browsersSameSize` e `candidates`. A nota diz "The two browsers wrote files of the same size with {browsersSameSize_word} of the {candidates_word} tools; with {browsersDiffer}, the sizes differed", e a frase do PNG diz os dois navegadores (`pngToJpgRatioChromium_times` e `pngToJpgRatioWebkit_times`).
- **Teste:** `tests/unit/guides-measured.test.ts`, "say, in guide 6, which tools the two browsers wrote differently, from the measurement": o fato e os números são refeitos a partir das linhas da tabela, e o texto usa `{browsersDiffer}` e não diz mais "agreed on every tool".

## § 203 · Cada guia diz o tamanho da amostra (F5b, revisão final, F-3)

- **Achado:** o guia 10 não dizia em lugar nenhum quantas fotos mediu, e os guias 4, 5 e 7 só deixavam a contagem implícita na tabela ("our real phone photos", "the real PDFs of our tests"), contra a decisão 5.4 da ficha.
- **Mudou:** os planos dos guias 3, 4, 5 e 10 gravam `photos`, o do 7 grava `files` e o do 9 grava `pdfs` (os arquivos dos pares). A introdução ou a nota da tabela de cada guia diz a contagem por placeholder (`{photos_word}`, `{files_word}`, `{pdfs_word}`, `{spaceFiles_word}`), e as frases de medida dos guias 4, 5 e 10 também.
- **Teste:** `tests/unit/guides-numbers.test.ts`, "state how many files each measurement rests on": a introdução ou a nota da tabela de cada guia tem um placeholder de contagem medida igual à amostra de uma das tabelas dele. Antes, 9 dos 10 guias reprovavam (o guia 1 já dizia `{files}`). Controles: sem contagem, com uma contagem que não é a amostra (`{gpsBefore}`) e com `{files}`.

## § 204 · O kit diz "measured" só dos 10 guias de arquivo (F5b, revisão final, A-1, C-1, B-1 e F-5)

- **Achado:** as descrições A e B e o primeiro comentário do `docs/lancamento/product-hunt.md` diziam que os 15 guias tinham números medidos em arquivos de teste. Só os 10 guias de arquivo têm; os 5 de dinheiro são calculados pelos motores das calculadoras. O teste do kit conferia só o 15.
- **Mudou:** "15 guides, 10 of them with numbers measured on real test files" nas descrições, e "10 file guides … and 5 money guides worked out by the engines of the calculators" no comentário. A prova 5 e a legenda da galeria 4 seguem o mesmo recorte: a legenda fica "File guides with numbers measured on our test files", porque a tabela da imagem tem dois PDFs que o script de teste escreveu (§ 197), e a imagem foi refeita com `pnpm lancamento:imagens`. As contagens de caracteres foram refeitas (443, 313 e 1.544).
- **Teste:** `tests/unit/launch-kit.test.ts` ganha as contagens `file-guides` e `money-guides` (frases "N file guides" e "N money guides" e a linha de contagens) e a regra de "measured": numa frase em inglês ou numa prova, a contagem mais próxima antes de "measured" é a de `FILE_GUIDE_IDS`, ou a frase diz "file guides". Controles com as três frases antigas e com a legenda antiga.

## § 205 · Cada frase técnica do kit traz uma frase provada (F5b, revisão final, A-7, C-2, C-7 e F-14)

- **Achado:** o kit afirmava além das provas: "Once a tool has loaded, it keeps working if you go offline" (o teste só prova o segundo arquivo do mesmo codec; o `show-hn.md` e a § 98 dizem "after the page and the codec load"), "Use a current Chrome, Edge, Firefox or Safari" (os testes rodam só Chromium e WebKit), respostas sem prova citada (anúncios longe das ferramentas, Analytics com Consent Mode, aviso de cookies, Ko-fi, "No limit on how many files", "no account"), o "unlock" solto numa lista (§ 153), uma origem que falava de "most sites" e a legenda da galeria 5 sem prova.
- **Mudou:** a frase de offline volta à ressalva do codec; a resposta dos navegadores nomeia só os dois motores testados; "No limit on how many files" e "For most files the device is fast enough" saem; o "unlock" vira "add or remove a password"; a origem sai, com uma nota para o Victor contar a dele sem falar de outros sites. A seção "Provas" passa a ter, no título de cada item, as frases provadas entre aspas, e ganha os itens dos anúncios (`ads.spec.ts`), do Ko-fi (`coffee.spec.ts`), do Analytics e do aviso (`consent.spec.ts`, `consent-choice.spec.ts`) e dos números das calculadoras (`money-privacy.spec.ts`). A prova de "There is no account" ganha uma asserção de verdade no `tests/unit/routes.test.ts` ("has no page of an account").
- **Teste:** `tests/unit/launch-kit.test.ts`, "tie every technical sentence in English to a proof…": cada frase em inglês (blocos, taglines, respostas e legendas) que fale de envio, offline, navegador, anúncio, Analytics, cookie, conta, lote, ZIP, Ctrl+V ou WebAssembly tem de conter uma frase de uma prova cujos arquivos existem; offline sem "codec", um navegador fora dos projetos do `playwright.config.ts`, uma palavra proibida fora do nome "Unlock PDF" e "most sites" reprovam. Controles: uma resposta técnica sem prova, a resposta antiga dos navegadores, a frase antiga de offline, o "unlock" solto (e "Unlock PDF", que passa), a origem antiga e uma prova cujo arquivo não existe.

## § 206 · A Oli do painel não cobre o texto do guia (F5b, revisão final, F-1 e D-1)

- **Achado:** abaixo de 768 px, a Oli da DropZone (`.fo-drop__oli`, 86 px acima da borda do painel) cobria as últimas palavras do parágrafo logo acima da ferramenta, nos 10 guias, no Chromium e no WebKit. Na página da ferramenta o H1 guarda esse lugar (`.fo-top`, 96 px à direita, 136 px a partir de 768); no guia, o parágrafo tinha a largura toda.
- **Mudou:** a seção do título e do parágrafo da ferramenta no `FileGuideView.astro` ganha a classe `fo-guide__tool`, com o mesmo `padding-right` do `.fo-top` (96 px, 136 px a partir de 768), em `src/styles/components.css`. Sem cor nova nem token novo. Como o `.fo-prose` limita a largura do conteúdo, o recuo só tira largura onde a página é mais estreita que a medida de leitura mais o recuo; no computador o texto fica igual.
- **Teste:** `tests/e2e/tool-guides.spec.ts`, "the Oli of the panel covers no line of text": em cada guia, a 320, 360, 390 e 600 px, nenhum retângulo de linha de texto do `<main>` cruza a caixa de `[data-oli]`. O spec fica no fim da divisão do CI, e o `--list` das partes mostra o `design.spec.ts` inteiro na parte 4 do WebKit e a matriz de imagens na parte 5.

## § 207 · As datas dos guias de arquivo seguem o dia da medida (F5b, revisão final)

- **Achado:** a medida refeita pelas correções da revisão saiu com a data de 2/nov/2026, porque o `pnpm guias:medir` grava o dia em UTC e já passava da meia-noite UTC (21h48 de 1/nov em Brasília). Os guias passaram a dizer "Reviewed … November 1, 2026 … with the measurements of November 2, 2026": a revisão antes da medida que ela mostra.
- **Mudou:** o `GUIDE_REVIEWED` e o `GUIDE_PUBLISHED` (`src/tools/guides/page.ts`) passam a 2026-11-02, o dia em UTC da última medida e do merge desta run. O script continua gravando o dia em UTC; as fontes lidas em 1/nov seguem com essa data.
- **Teste:** `tests/unit/guides-measured.test.ts`, "are never newer than the review and publication dates the guides show": o `measuredOn` do JSON não pode ser depois do `GUIDE_REVIEWED` nem do `GUIDE_PUBLISHED`. Antes da mudança: "reviewed 2026-11-01, measured 2026-11-02".

## § 208 · As fontes têm a data delas, e o que sobrou das generalizações sai (F5b, segunda passada, itens 1 e 3)

- **Achado:** o "changed" do guia 3 dizia "with the measurements and the help pages of {date}". O `{date}` é o dia da medida (2/nov, § 207), e as 11 fontes foram lidas em 1/nov, como diz cada fonte. Sobravam também frases do tipo que a § 197 tirou: "Pictures: the usual suspect" (guia 2), "measured on real files" na descrição do guia 8, "when we merged real PDFs", "merging is almost free" (sustentado por um par só) e "in 5 of the 5 pairs it was a little smaller" (com −23% e −18% na tabela) no guia 9.
- **Mudou:**
  - O guia 3 diz a data da medida e que as páginas foram lidas na data de cada fonte, sem data à mão.
  - O título do guia 2 vira "Pictures: the weight of our heaviest PDFs", e a descrição do guia 8 diz "our test PDFs".
  - O guia 9 diz o que cada par deu. Os dois pares que arredondam para 100% vêm em bytes (`_exact`); os outros vêm com a queda de cada um. O par gerado (−18%) é explicado: o script de teste escreveu os dois PDFs sem object streams, e o Merge grava com elas (`saveDoc` de `src/engine/pdf/process.ts`). Saem "One pair stood out" (A-11) e as "small savings".
- **Teste:**
  - A lista `GENERAL` de `tests/unit/guides-numbers.test.ts` ganha "usual", "almost free", "real PDFs" e "real files". "Real phone photos" e "real documents" seguem permitidos, e há controles para os dois lados.
  - "never give the sources the date of the measurement": uma frase com `{date}` que fale de help pages, sources ou "read on" reprova.
  - `tests/unit/guides-measured.test.ts`, "say, in guide 9, how much smaller each merged pair came out": cada par do JSON aparece no texto pela razão ou pelos bytes.
  - Antes da correção: 4 frases na lista, o "changed" do guia 3 e `guide 9 cites {bookFormRatio}`.

## § 209 · O guia 8 diz quanto cresceu cada arquivo, e quanto da parte é metadado (F5b, segunda passada, item 7)

- **Achado:** a introdução dizia que as partes de "three of them" pesaram mais, e um deles cresceu 1.304 bytes (0% na tabela). A frase do fim dizia "about 7.7 KB heavier per part", que é o crescimento por parte inteiro; o XMP é 6,2 KB dele.
- **Mudou:** a introdução nomeia os três arquivos, cada um com o seu crescimento: `{bookRatio_times}`, `{reportRatio_more}` e `{photosGrowth_exact}`. A frase do fim diz que cada parte do relatório somou cerca de `{reportGrowthPerPart}`, dos quais `{reportMetadata}` são a cópia dos metadados e o resto é estrutura.
- **Teste:** `tests/unit/guides-measured.test.ts`, "say, in guide 8, how much each file that grew grew, and what of a part is metadata".
  - A frase que conta os arquivos que cresceram (`{bigger}`) cita a razão ou o crescimento de cada arquivo com `Growth` positivo no JSON.
  - O número desses arquivos é o `bigger`.
  - `{reportGrowthPerPart}` e `{reportMetadata}` vêm na mesma frase.
  - Antes: "the growth of report: expected 'We split {files_word} PDFs…' to match".

## § 210 · O fato vazio não deixa a frase do guia 6 sem ferramenta (F5b, segunda passada, item 9)

- **Achado:** "with {browsersDiffer}, the sizes differed" vira "with , the sizes differed" numa medida nova em que os dois navegadores concordem em todas as ferramentas.
- **Mudou:** o teste do guia 6 exige o fato `browsersDiffer` não vazio enquanto o texto o lê. Uma medida em que os navegadores concordem reprova até a frase mudar. O texto não muda.
- **Teste:** `tests/unit/guides-measured.test.ts`, "say, in guide 6, which tools the two browsers wrote differently", com a função `differProblems`. O controle com o fato vazio reprova ("sem nenhuma ferramenta"), e o fato medido ("PNG to JPG") passa.

## § 211 · O kit diz "our test files" e não promete o que um aparelho aguenta (F5b, segunda passada, itens 2 e 11)

- **Achado:** a descrição A, o primeiro comentário e o título da prova 5 diziam "real test files". Parte dos PDFs medidos foi escrita pelo script (`gen-*`), a mesma razão da legenda da galeria 4 (§ 204). A resposta "Are there limits?" dizia que "a very large photo or a very long PDF can be too much for the memory of an older phone", e a run nunca mediu memória.
- **Mudou:** os três textos dizem "measured on our test files". A resposta dos limites diz "I have not tested the largest file each phone can open, so tell me if one fails". Não diz "measured", que a § 204 reserva aos guias de arquivo. As contagens de caracteres passam a 442, 313 e 1.543. A § 204 fica como está.
- **Teste:** `tests/unit/launch-kit.test.ts`.
  - O `claimProblems` reprova "real test files" num texto em inglês ou numa prova.
  - O `TECHNICAL` ganha "memory", "older phone" e "too much for", que pedem prova.
  - Há controles com "real test files", com a frase antiga da memória e com a nova, que passa.
  - Antes: quatro frases com "real test files" e a da memória sem prova.

## § 212 · O recuo da Oli estreita o texto também no computador, e o teste vai a 768 e 1280 px (F5b, segunda passada, itens 4 e 5)

- **Achado:** a § 206 e o comentário do `components.css` diziam que, no computador, o texto do guia ficava igual. A seção `.fo-guide__tool` é `border-box`, então o recuo sai da medida de leitura. Medido no Chromium, o título e o parágrafo acima da ferramenta têm 561 px a 768, 1024 e 1280 px, contra os 697 px do resto da prosa; a 360 px têm 232 px, contra 328 px. O teste da Oli não passava pelas larguras com o recuo de 136 px.
- **O que acontece de fato:** o recuo é necessário também no computador. Com ele zerado a partir de 768 px, a Oli cobre a última linha do parágrafo a 768 e a 1280 px em todos os guias (por exemplo "768 px: 'Drop a PDF and it is compressed in this ' (46 × 8 px)"). A coluna da ferramenta tem a largura da prosa, e a Oli fica dentro dela. O layout fica como está; só o comentário muda. A § 206 não foi editada.
- **Teste:** `tests/e2e/tool-guides.spec.ts`, "the Oli of the panel covers no line of text", passa a 320, 360, 390, 600, 768 e 1280 px. A falha acima saiu de uma execução com o recuo de 768 px em diante zerado por uma folha de estilo injetada no próprio teste, que não ficou no código. O `--list` das partes mostra o `design.spec.ts` inteiro na parte 4 do WebKit (50 testes) e a matriz de imagens na parte 5 (18). O número de testes não mudou.

## § 213 · O espanhol escreve número como nos EUA; o português, dinheiro como "R$ 1.234,56" (F6, decisão 1)

- **Decisão do Victor (1º/nov/2026):** as páginas em espanhol são para o público hispânico dos EUA, e o espanhol do site inteiro passa a escrever número como o inglês: "1,234.56", "2.4 MB", "20,000 px". O "68 %" com espaço sem quebra continua, porque é a voz do design system. O português segue com "1.234,56".
- **Mudou:**
  - `src/calc/parse.ts`: no espanhol, ponto decimal e vírgula no milhar, também com quatro dígitos ("1,234"). Sai a regra da RAE que a § 112 tinha posto (agrupar só a partir de cinco dígitos, com espaço sem quebra). A § 112 vale como estava para o inglês e o português.
  - `money()` e `dollars()`: "R$ 1.234,56" no português (com espaço sem quebra), "$1,234.56" no espanhol. Antes os dois escreviam "1.234,56 $".
  - `src/i18n/format.ts`: o `fileSize` passa a ser escrito à mão, sem `Intl` (a § 112 já pedia isso para o que a página mostra), e ganha o `groupDigits`, que substitui o `toLocaleString` do Redimensionar ("20,000" / "20.000").
- **Testes que mudaram por construção** (modelo da § 171): `tests/unit/calc-parse.test.ts` deixa de aceitar "1.234,56", "1 234,56" e "12 345,6" no espanhol e passa a recusá-los; espera "1,234" e "12,345" onde esperava "1234" e "12 345"; `money(123_456, 'pt')` passa de "1.234,56 $" a "R$ 1.234,56"; `hundredthsPercent(513, 'es')` passa de "5,13 %" a "5.13 %". `tests/unit/routes.test.ts` ganha o "2.4 MB" do espanhol, o "1,000 KB" e o `groupDigits`.

## § 214 · O `og:locale` do espanhol é `es_US` (F6, decisão 1)

- **Alternativas:** `es_ES` (o de antes, que fala com a Espanha), `es_LA` (o rótulo do Facebook para a América Latina, que não é código de região) e `es_US`.
- **Escolha:** `es_US`, o público que o Victor decidiu para o espanhol do dinheiro, e o mesmo do formato de número. As ferramentas de arquivo servem a América Latina também, mas o `og:locale` é um só por idioma no mapa (`OG_LOCALE`). Nenhum teste fixava o valor.

## § 215 · O sufixo "unlocked" do nome de arquivo não é a palavra proibida (F6)

- **Achado:** o sufixo do arquivo baixado passou do registro para os textos (`panel.suffix`, para seguir o idioma). O teste de voz (`checkVoice` e o `routes.test.ts`) leu "unlocked" do Unlock PDF e reprovou pela palavra proibida "unlock".
- **Decisão:** o nome de arquivo "relatorio-unlocked.pdf" existe desde a F5a e não muda em inglês; é nome técnico, como o id `unlock-pdf` que a § 153 já tira da conta. O `FILE_SUFFIX` de `scripts/lib/design-checks.ts` tira só o valor exato "unlocked" na chave exata `.panel.suffix`; "unlocked" em qualquer outro texto continua reprovando. Os controles da § 153 ("unlocked files" reprova) seguem no teste.

## § 216 · A linha do café em português leva ao Pix, e o "Copiar código" é o lugar `pix` do `donate_click` (F6, decisão 8)

- **Mudou:** o botão da linha do café no card de resultado, em português, diz "Pagar um café no Pix" (tabela "Doações" do PLANO) e leva a `/pt/apoie/#pix`, nas ferramentas de imagem e de PDF. Até a F6 dizia "Apoiar com um café" e levava a `/pt/apoie/` (§ 49).
- **Evento:** o "Copiar código" manda o `donate_click` com o lugar novo `pix`. O Pix fica separado do Ko-fi da mesma página (`support_page`), para os 60 dias de medição do PLANO dizerem qual dos dois é usado. A lista de lugares virou constante fechada (`DONATE_PLACES`) e entrou no `cleanParams`, como as outras listas da § 10.
- **Testes:** `tests/unit/pix.test.ts` ("keeps the place pix and drops a place outside the list"); `tests/e2e/coffee.spec.ts` muda por construção o texto e o destino do botão em português, e passa a conferir que o `#pix` fica na tela depois do clique.

## § 217 · O Pix: oráculo, gerador, QR em SVG e a troca de valor só com CSS (F6, decisão 8)

- **Fontes, lidas em 1º/nov/2026 no bcb.gov.br:** Manual de Padrões para Iniciação do Pix, versão 2.10.0 (19/ago/2026), § 2.6 (QR estático), com o exemplo `…63041D3D`; Manual do BR Code 2.0.1; Regulamento do Pix (Resolução BCB nº 1/2020), arts. 40 a 41-B (devolução iniciada pelo recebedor, em até 90 dias; o MED não cobre arrependimento). A versão 2.11.0-rc1 (29/out/2026) não muda a seção do QR estático.
- **O código:** os campos 00, 26 (GUI e a chave do `docs/F0-SAIDA.md`), 52, 53, 54 só com valor, 58, 59 (`VICTOR YUKI MATUSITA`), 60 (`CURITIBA`), 62 com 05 `***` e 63 (CRC16-CCITT, 0x1021, início 0xFFFF). Sem o campo 01, que é opcional e não aparece no exemplo estático do manual.
- **Ordem dos commits:** `scripts/oracle/pix.py` e `fixtures/pix.json` (commit `2b03121`) vêm antes do gerador `src/platform/pix.ts`. O oráculo usa só a biblioteca padrão (o CRC é o `binascii.crc_hqx`), lê a chave e o nome do `docs/F0-SAIDA.md` e para se não reproduzir o exemplo do manual.
- **QR:** o pacote `qrcode` 1.5.4 (MIT), em `devDependencies` e só no build. Nível de correção M: o manual não fixa nível, e M é o comum para código lido da tela; os quatro códigos (144 a 153 caracteres) ficam na versão 7 (45 × 45 módulos). Zona de silêncio de 4 módulos, fundo `#FFFFFF` (a exceção do design system para o QR do Pix) e módulos em `currentColor`, pintados com o token `deep` pelo CSS (igual nos dois temas). A prova é o `tests/unit/pix-qr.test.ts`: cada SVG do `dist/pt/apoie/` é rasterizado com o `@resvg/resvg-js` e lido pelo `jsqr` 1.4.0 (Apache-2.0, `devDependencies`), e devolve o código do JSON.
- **Troca de valor sem ilha:** os quatro blocos estão no HTML; o CSS mostra o do rádio marcado (`:has(input[value="5"]:checked)`). O copiar é um `<script is:inline>` de nove linhas (`navigator.clipboard.writeText`), sem requisição. O card permite encolher (`.fo-support > div { min-width: 0 }`) para o código ter reticências a 360 px.

## § 218 · Onde moram os caminhos por idioma e como os tipos passam a exigir os textos (F6, decisões 2 e 4)

- **Caminhos:** a tabela `TRANSLATED_PATHS` de `src/i18n/routes.ts` dá os caminhos pt e es das páginas de imagem e de PDF e dos dois hubs (a tabela da decisão 2). As 5 calculadoras em espanhol têm `es: { path, file, next, related }` na própria linha do `CALC_PAGES`. As 8 brasileiras ficam num registro ao lado, `BR_CALC_PAGES` (com o hub `br-money-calculators`), para nada que lê o `CALC_PAGES` (todo ele com página em inglês) herdar uma página sem inglês. `MoneyPageId` junta os dois; `moneyPage(id, lang)` devolve a página de um idioma ou `null`.
- **Tipos:** o `CommonTexts` passa a exigir, em todo idioma, as 11 de imagem, as 12 de PDF, os nomes dos hubs e as categorias da busca; `calcs` é exato por idioma (`EnCommonTexts`, `PtCommonTexts`, `EsCommonTexts`). Os mapas `IMAGE_TOOL_TEXTS` e `PDF_TOOL_TEXTS` exigem os três idiomas. Os hubs entraram no `TEXTS[lang]`.
- **Os moldes** de PDF, de dinheiro e dos hubs recebem `lang` (com o padrão `'en'` onde um teste já os renderizava sem idioma). A linha do guia e a seção de guias só aparecem em inglês.

## § 219 · O nome do arquivo baixado segue o idioma (F6, decisão 4)

- **Mudou:** o sufixo do PDF (`panel.suffix`), as partes do Dividir e do PDF para JPG (`page`, `part`, `selected`), os nomes dos ZIPs e o `documento.pdf` vêm dos textos do painel (`files`), com os valores dos glossários (`docs/i18n/`). Em inglês os valores são os de antes (o registro e as constantes de `names.ts`, que ficam para os testes).
- **Os nomes de lote da imagem** (`fileorca-images.zip` e `.pdf`) também passam a seguir o idioma ("fileorca-imagens", "fileorca-imagenes"), o que muda o ZIP da Comprimir imagem em pt e es, a única página que já existia. A § 58 dizia "English on every page" porque só havia inglês.

## § 220 · A palavra da numeração de páginas vem da página (F6, decisão 4)

- **Mudou no motor de PDF:** a operação `numbers` ganha `page?` e `of?`, opcionais. Sem elas, "Page" e "of": os testes do motor que não as passam e a saída em inglês não mudam um byte (a página em inglês manda "Page" e "of", o mesmo texto). As palavras passam pelo `winAnsi()`. Na ilha, o `start` da ferramenta põe as palavras dos textos (`pageWord`, `ofWord` de `NumbersTexts`) no estado, como a marca d'água já fazia com o texto padrão.

## § 221 · O PDF do relatório de dinheiro em A4 no português: terceira mudança no motor de PDF (F6, decisão 5)

- **Mudou:** `ReportInput.paper?: 'a4'`; sem ele, Letter, como antes. O tamanho de A4 é o do `build.ts` (595,28 × 841,89 pt). A ilha só põe `paper: 'a4'` numa página em português.
- **Por que é uma terceira mudança:** o prompt permite no motor de PDF o texto que vem da página e a correção de defeito com teste. A decisão 5 do mesmo prompt pede o PDF em A4 em português, então o tamanho tem de entrar no motor. Em inglês e espanhol a saída não muda.

## § 222 · O CSV por idioma (F6, decisões 1, 5 e 6)

- **Mudou:** `csvText(table, yearHeading, lang)`: no português, ponto e vírgula entre as colunas e vírgula decimal ("1896,20"); no inglês e no espanhol, vírgula e ponto, como antes. BOM UTF-8 e CRLF nos três. Uma célula com o separador do idioma vai entre aspas.

## § 223 · As datas por extenso e no dia de Brasília (F6, decisão 1)

- **Mudou:** `src/i18n/dates.ts` escreve "October 31, 2026", "1 de novembro de 2026" e "1 de noviembre de 2026", à mão (fora da ilha). As páginas de dinheiro em pt e es nasceram na F6: `REVIEWED_ON` e `FIRST_PUBLISHED_ON` dizem o dia em Brasília em que a run as revisou, e `SOURCES_READ_ON` o dia em que as fontes foram lidas (1º/nov/2026). As inglesas ficam com 31/out/2026.

## § 224 · Os glossários e o que eles proíbem (F6, decisão 3)

- **Arquivos:** `docs/i18n/pt.md` e `docs/i18n/es.md`, escritos antes de qualquer tradução: registro, formato, termos de arquivo, ferramentas e opções, nomes de arquivo, dinheiro, falas da Oli, pedido de café e a lista "Nunca".
- **Escolhas:** em português, "Baixar", "arquivo", "aparelho", "celular", "lote"; "upload" só no bordão "sem upload"; "parcela" e "saldo devedor" no dinheiro; nada de português de Portugal. Em espanhol, "Descargar", "archivo", "dispositivo", "computadora", "teléfono/celular", "tú"; no dinheiro, os termos do CFPB em espanhol ("pago mensual", "pago inicial", "tasa porcentual anual (APR)"), nunca "enganche", "cuota mensual" nem "tasa de porcentaje anual".
- **O site do CFPB em espanhol saiu do ar:** todo `consumerfinance.gov/es/` redireciona para o inglês desde julho de 2026 (lido em 1º/nov/2026). As páginas em espanhol citam os PDFs em espanhol do CFPB que seguem no ar e, onde não há, a página em inglês do CFPB com "(en inglés)" no rótulo, como a decisão 6 já previa.

## § 225 · O oráculo das calculadoras brasileiras é um script separado, `scripts/oracle/calc_br.py` (F6, decisão 5)

- **Alternativas:** estender o `scripts/oracle/calc.py` ou escrever um script ao lado.
- **Escolha:** o script separado, autossuficiente (decimal, inteiros exatos e o numpy-financial 1.1.0 só para conferir), com o mesmo comando do `uv` e `python -I`. Assim as 18 fixtures em inglês e o `calc.py` não mudam um byte (o `git diff --stat` delas sai vazio), e um defeito de ajudante de um lado não contamina o outro. As fixtures ficam na mesma pasta (`fixtures/calc/br-*.json`), que o `CALC_FIXTURES_DIR`, o `calc-defs.test.ts` e os specs já leem.
- **Ordem dos commits:** `d4e4536` (oráculo e fixtures), `08de608` e `95e1e35` (duas correções do oráculo, regeradas, ainda antes do motor) vêm antes de `77d0341` (os motores) e de `176a438` (as definições e os textos). O registro `BR_CALC_PAGES` (caminhos e links, sem conta) entrou antes, no commit da fundação `de98350`.
- **Teste que mudou por construção** (modelo da § 171): o `tests/unit/calc-oracle.test.ts` conferia o SHA-256 do `calc.py` em toda fixture. Agora cada fixture tem de ter sido escrita pelo seu script (`calc.py` para os ids em inglês, `calc_br.py` para os `br-*`), com o SHA dele, e os dois scripts têm de aparecer. A prova do mutante vale para as novas: com um centavo mudado na `br-sac-price.json` o teste reprova ("1 of 212 cases differ").

## § 226 · As convenções das oito calculadoras brasileiras (F6, decisão 5)

Fontes lidas em 1º/nov/2026 (os links completos estão nas páginas e no relatório da F6). Comum às oito: centavos inteiros, taxa em 1/10.000 de ponto (§ 111), metade para cima, juros de cada mês ao centavo, a última parcela zera o saldo. Toda taxa é efetiva (Res. CMN 5.004/2022, art. 3, I): "ao mês" entra como está; "ao ano" vira mensal por capitalização, j = piso de 10^30 · ((1 + a)^(1/12) − 1), com a raiz inteira da § 111. Nenhuma fonte oficial lida diz que algum desses produtos use taxa nominal; a premissa de cada página diz que a taxa é a efetiva. Um saldo acima de 10^15 centavos é o erro `too-large` (juros compostos), como no inglês.

- **SAC × PRICE** (`br-sac-price`): campos principais valor do imóvel, entrada (R$ ou %), prazo (12 a 420 meses) e juros ao ano; depois do resultado, a TR ao mês (0 a 2%, exemplo 0) e os seguros e taxas por mês. A TR corrige o saldo no começo do mês, antes dos juros (`share`, metade para cima). SAC: amortização = saldo corrigido ÷ meses que faltam. PRICE: com TR zero a parcela é a do primeiro mês, fixa; com TR, recalculada sobre o saldo corrigido e os meses que faltam (a descrição da Nota Técnica BCB nº 56/2025). Os seguros somam à parcela e não mudam (a premissa diz que o real muda com o saldo e a idade). Dois cronogramas numa tabela agrupada por sistema e ano. O recálculo exato da PRICE com TR só roda quando a pessoa digita uma TR; o prazo vai até 420 meses (o que a medida da exploração mostrou caber nos 16 ms).
- **Financiamento de veículo e empréstimo** (`br-vehicle-loan`, `br-personal-loan`): PRICE com juros ao mês. O IOF e as tarifas são campos em reais, copiados da proposta (a forma mais simples que o Decreto 6.306/2007 sustenta: a alíquota diária × dias, limitada a 365, mais a adicional, que a run não grava), com a escolha "financiar junto" (padrão, como o demonstrativo da IN BCB 83/2021) ou "pagar à vista" (como o Boletim nº 8). O CET segue a Res. CMN 4.881/2020: a taxa mensal c com FC0 = Σ Pk ÷ (1 + c)^k, FC0 = o crédito menos o que é pago na contratação; os períodos são meses iguais (expoente j/12 do ano), a convenção que reproduz o exemplo oficial do Boletim nº 8 (43,93% ao ano e 3,08% ao mês). Com as datas reais o CET muda alguns centésimos; a premissa diz isso. O CET ao ano é (1 + c)^12 − 1, em centésimos, metade para cima, do mensal sem arredondar. O motor resolve c em ponto flutuante; o oráculo, em decimal, e recusa todo caso a menos de 10^-6 de uma fronteira de arredondamento.
- **Amortização antecipada** (`br-early-payoff`): saldo, valor a antecipar, juros ao mês, meses que faltam e o sistema (PRICE padrão). Pela Res. CMN 5.004/2022, art. 7, o valor antecipado abate o saldo hoje, e os juros futuros incidem só sobre o resto (o valor presente pela taxa do contrato); sem tarifa (Res. 3.516/2007, art. 1). Reduzir o prazo: PRICE mantém a parcela, SAC mantém a amortização de hoje. Reduzir a parcela: os mesmos meses, parcela recalculada. A premissa diz que vale para taxa prefixada.
- **Cartão de crédito** (`br-credit-card`): fatura, mínimo, juros do rotativo e do parcelamento ao mês; depois, o número de parcelas e o IOF. A: paga o mínimo; o resto fica um mês no rotativo (Res. CMN 4.549/2017, art. 1) e vai para o parcelamento (art. 2), com a primeira parcela no mês seguinte. B: a fatura inteira no parcelamento já. O teto da Lei 14.690/2023, art. 28, com os arts. 2-A a 2-D da 4.549: juros e encargos de cada operação ≤ valor original, que em A é o montante inicial do rotativo (contado desde o rotativo) e em B a fatura; quando o teto morde, os juros param. O IOF entra no valor parcelado e fica fora do teto (o art. 2-A define juros e encargos sem o imposto; leitura da run, dita na premissa). O caso `cap-bites` do oráculo prova o teto.
- **Dívidas** (`br-debt-payoff`): bola de neve × avalanche com juros ao mês. O motor é o inglês com taxa = 12 × a mensal: interest(b, 12r) = b · 12r ÷ (12 · ONE) = b · r ÷ ONE, a mesma fração e o mesmo arredondamento, e a ordem da avalanche não muda. O oráculo faz o laço com a taxa mensal direta, o que prova a equivalência.
- **Juros compostos** (`br-compound-interest`): valor inicial, aporte mensal, juros (ao ano ou ao mês, efetivos) e prazo em meses; aporte no fim do mês; resultado bruto, sem imposto de renda (tabela oficial).
- **Alugar ou comprar** (`br-rent-or-buy`): a estrutura do motor inglês, com o financiamento em SAC (padrão) ou PRICE, o ITBI e o cartório em % do valor pagos na compra (e investidos por quem aluga), o IPTU por ano, e as taxas de rendimento, valorização e reajuste efetivas ao ano.

## § 227 · O `lint:texto` lê o dinheiro de pt e es no formato do idioma (F6)

- **Mudou:** o `isMoneyText` passa a reconhecer as pastas `src/tools/br-*`, os hubs de dinheiro de pt e es e as calculadoras em espanhol. As amostras do dinheiro e as comuns ganham versões por idioma ("R$ 1.234,56", "3 anos e 4 meses", "6,5%"; "$1,234.56", "3 años 4 meses", "6.5 %"). O inglês fica com as amostras da § 123.
- **Teste:** `tests/unit/lint-texto-money.test.ts`, "knows the money texts of Portuguese and Spanish and fills them in their format", com os controles do que não é texto de dinheiro.

## § 228 · Os testes das calculadoras passam pelas brasileiras e pelas espanholas (F6)

- **Mudou por construção** (modelo da § 171): o `tests/unit/calc-defs.test.ts` cobria as 18 páginas do registro em inglês. Agora cobre as 26 definições (as 18 e as 8 brasileiras) e as 31 páginas (as 18 em inglês, as 8 em português e as 5 em espanhol), cada uma no idioma dela: o exemplo inicial é o `page-example` do oráculo; o erro de cada campo diz a faixa no formato da página ("R$ 10.000" em português, "$10,000" em espanhol e inglês); a view se monta sem placeholder nas pontas de cada faixa e em cada opção; o link do cenário vai e volta. A entrada em porcentagem aceita "0 a 100%" e "0 a 100 %". Os estados de erro brasileiros (saldo acima de 10^15, IOF e tarifas à vista acima do crédito, nada a financiar) entram na lista dos que mostram o problema.
- **Mudou por construção:** o `tests/unit/consent.test.ts` compara a lista fechada `CALC_EVENT_TOOLS` com os 18 ids e os 8 `br-*`.

## § 229 · As páginas de dinheiro em português e espanhol mostram o número do resultado acima da dobra (F6)

- **Medida a 360 × 740, no Chromium e no WebKit do Windows:** SAC × PRICE 678 px, veículo 740 px (antes do ajuste), empréstimo 706, amortização antecipada 706, cartão 732, dívidas 610, juros compostos 712, alugar ou comprar 678, hipoteca em espanhol 678.
- **Ajustes:** o lead do veículo encurtou para "A parcela do veículo e quanto o crédito custa de verdade." (a folga era zero). No cartão, os rótulos de juros com a etiqueta "exemplo" quebravam linha ("Rotativo a.m."); viraram "Rotativo" e "Parcelamento", com "% a.m." no sufixo do campo. Os rótulos de juros das outras usam "Juros a.a." e "Juros a.m.", que cabem ao lado da etiqueta (a § 124 pede uns 75 px).

## § 230 · Os testes de unidade que mudaram por construção com as páginas de pt e es (F6, modelo da § 171)

Cada asserção abaixo dizia "só em inglês" ou trazia uma contagem do site de antes da F6. Agora diz a verdade nova, quase sempre lendo do mapa de rotas e dos registros, e continua reprovando uma quebra real.

- **`routes.test.ts`:** as rotas de imagem, os dois hubs e o PDF existem nos três idiomas (antes, só a Comprimir imagem); o hub de dinheiro e as 5 de `ES_CALC_IDS` em en e es; as 9 brasileiras só em pt. O que segue só em inglês: os 15 guias e as 13 calculadoras sem par. A voz passa a ler os textos de PDF dos três idiomas. A busca: os idiomas de cada entrada vêm do registro, e as brasileiras entram depois das inglesas; "merge pdf" em pt acha a Juntar PDF (antes, nada); "mortgage" em es acha a hipoteca, em pt continua vazio.
- **`seo-checks.test.ts`:** os sitemaps de pt e es passam de 8 páginas para as contagens do mapa; o hreflang de imagem e PDF liga en, pt-BR e es com o x-default; o do dinheiro em espanhol, en e es; as brasileiras não têm cluster.
- **`image-texts.test.ts`, `image-hub.test.ts`, `pdf-site.test.ts`, `seo-pages.test.ts`:** chips, relacionadas, trilha, cartões, home, rodapé e hub em pt e es apontam para as páginas do idioma (antes, para a home ou para o inglês). O exemplo da § 84 (o menu de idioma numa página sem tradução leva à home do outro idioma) passou para um guia de arquivo, que segue só em inglês. A frase da assinatura na Privacidade em espanhol e os nomes das ferramentas nos Termos seguem a tradução.
- **`conteudo.test.ts`, `prontidao.test.ts`, `ymyl.test.ts`:** as contagens saem de `allPages()` e do mapa (33 páginas de imagem, 39 de PDF, 31 de calculadora; 24 + 1 + 5 + 9 páginas de dinheiro no portão de dinheiro e saúde).
- **`quality.test.ts`:** a voz e a busca de cor dos textos de PDF leem os três idiomas.
- **`calc-defs.test.ts`:** a data da Privacidade em pt e es passa a "2 de novembro de 2026" (o texto mudou na F6, e a decisão 1 escreve a data sem o "1º").

## § 231 · Os portões passam a ler pt e es (F6, decisão 9)

- **`gate:conteudo`:** a frase do selo das calculadoras e as regras das páginas de PDF (o que aceita, o limite, o que fica no arquivo, os modos, os segredos, "no aparelho", "não é enviado" e as afirmações proibidas) ganham uma versão por idioma, com as palavras dos glossários. Controles: a página completa passa em cada idioma; a página em inglês reprova nas regras de pt e es e a traduzida nas do inglês; cada quebra tem o seu teste.
- **`gate:prontidao`:** os cartões da home e dos hubs são conferidos em cada idioma; a busca inclui as brasileiras que estão no mapa; as páginas de PDF são conferidas nos três idiomas. **O H1 próprio passa a ser comparado dentro de cada idioma:** pelo glossário, "Dividir PDF", "Comprimir PDF", "Proteger PDF" e "Desbloquear PDF" são iguais em pt e es, e o mesmo H1 em dois idiomas não é conteúdo repetido. Título e descrição continuam únicos no site inteiro. Controles: o mesmo H1 em pt e es passa; em duas páginas pt reprova.
- **`gate:seo`:** a descrição das páginas de imagem e de PDF em pt e es tem de 120 a 160 caracteres (decisão 4); as outras seguem com 50 a 170. As brasileiras ganham o schema das calculadoras (WebApplication, BreadcrumbList e Person) e ficam fora de `MONEY_PAGE_IDS`, que exige o inglês. Cada página tem de estar no sitemap de cada idioma dela e em nenhum outro.
- **`gate:design`:** a voz das páginas de PDF passa a ler as 39 páginas, com as palavras proibidas de cada glossário ("revolucionário", "turbinado", "sem esforço"; "revolucionario", "sin esfuerzo").
- **`scripts/lib/ymyl.ts`:** `planalto.gov.br` entra nas fontes oficiais do dinheiro (as leis citadas pelas páginas brasileiras), com controles ("planalto.gov.br.evil.test" reprova). O texto proibido ganha formas de pt e es ("taxas de hoje", "juros de hoje", "as taxas vão subir", "las tasas subirán", "recomendamos este banco"), com controles positivo e negativo.

## § 232 · O teste do glossário e o teste de vazamento de inglês (F6, decisões 3 e 4)

- **`tests/unit/glossary.test.ts`:** lê a tabela "Nunca" de `docs/i18n/pt.md` e `docs/i18n/es.md` e reprova o termo, sem maiúsculas e por palavra inteira (com acento), nos arquivos de texto do idioma (menos os sinônimos da busca, que a pessoa digita) e no texto das páginas do idioma no `dist/` (texto visível, título, descrição e os atributos acessíveis). Controles: cada termo é pego, até quebrado em duas linhas; "móvil" não casa dentro de "automóvil"; "fazer upload" não casa com "sem upload".
- **`tests/unit/english-leak.test.ts`:** junta as frases dos arquivos em inglês (menos o que não é prosa e o rótulo das fontes, que podem ficar em inglês pela decisão 6) e reprova a frase que aparecer igual numa página de pt ou es: no texto visível, no título, na descrição, no Open Graph, nos atributos acessíveis e em cada string do `data-props`. Uma frase conta com 4 palavras, ou 3 palavras e 20 caracteres, com pelo menos 3 palavras de prosa; nomes próprios, formatos e tokens técnicos não contam. Os textos das licenças (`<pre>` da página de Licenças) ficam de fora. Com os esqueletos ele achou 1.371 frases em pt e 1.693 em es; com as traduções, zero.

## § 233 · Os testes de navegador de pt e es, os que mudaram por construção e a divisão do CI (F6, decisões 4, 9 e 11)

- **Novos.** `tool-i18n.spec.ts`: as 23 páginas de imagem e de PDF em pt e es, nos dois navegadores, com um arquivo de verdade, a frase de sucesso do idioma, o arquivo com nome no idioma (ZIP, PDF de imagens, sufixo de cada ferramenta de PDF, páginas e ZIPs da Dividir e da PDF para JPG), nenhuma frase em inglês dos textos da ferramenta no painel e só GET da própria origem, sem corpo e sem query. `i18n-budgets.spec.ts`: as páginas de pt e es no orçamento de JS e de requisições, com o número de arquivos do par em inglês, e a prova de que cada uma carrega exatamente os mesmos arquivos JS, nome e hash, da página em inglês (as brasileiras, os das calculadoras em inglês; as de apoio, os de `/support/`). No `a11y.spec.ts`: o resultado de cada ferramenta de imagem em pt e es, o passeio de cada ferramenta de PDF em pt e es, uma calculadora de cada idioma com erro, comemoração, cronograma aberto e link copiado, e o Pix com um valor escolhido e o código copiado. No `ads.spec.ts`: as mesmas páginas e estados em pt e es, os três hubs nos três idiomas e o resultado acima da dobra a 360 × 740 nas 13 calculadoras de pt e es. No `money-privacy.spec.ts`: as 5 de es e as 8 brasileiras, com a sentinela digitada no formato do idioma e procurada nos formatos dos três. No `money-speed.spec.ts`: SAC × PRICE, veículo com CET e alugar ou comprar. No `money-calc.spec.ts`: o CSV e o PDF baixados da página em es (o cronograma do oráculo inglês, Carta) e em pt (as duas tabelas do oráculo brasileiro, ponto e vírgula, vírgula decimal, A4). `tests/unit/calc-i18n.test.ts`: as 5 de es dão o mesmo centavo do inglês, o CSV de pt sai com os centavos do oráculo, o PDF é Carta em en e es e A4 em pt.
- **O passeio de PDF** (`tests/e2e/lib/pdf-states.ts`) lê os rótulos do idioma da página; em inglês, os rótulos são os mesmos de antes. As medidas do orçamento foram para `tests/e2e/lib/budgets.ts` sem mudar o que medem; o `budgets.spec.ts` as chama.
- **Por construção.** `navigation.spec.ts`: o exemplo da § 84 passou para um guia de arquivo (a HEIC para JPG existe em pt e es); a busca em pt mostra as 31 páginas que o mapa lhe dá, cada linha com um nome em português, e "mortgage" continua sem resultado; "shrink" e "achicar" acham a Comprimir imagem primeiro, não sozinha. `tool.spec.ts` e `events.spec.ts`: os chips da Comprimir imagem em pt e es levam às páginas do idioma (antes, à home, § 27), e o evento leva `target: 'resize-image'`.
- **Divisão do CI.** Os testes de orçamento de pt e es estão num arquivo próprio porque, dentro do `budgets.spec.ts`, empurravam o `design.spec.ts` para a parte 5 do WebKit, junto da matriz de imagens (§ 108 e § 142). Com o arquivo `i18n-budgets.spec.ts`, o `--list` dá o `design.spec.ts` inteiro na parte 4 e a matriz na 5. A estimativa de cada parte, com o tempo de cada teste do CI da F5b e o do par em inglês para os novos (`.cache/ci-estimate.ts`, ajuste total ≈ 9 s + 0,533 × soma), fica entre 191 s e 680 s: nenhuma acima de 700 s, então o `.github/` não muda. O reflow a 320 px passa a ler 145 páginas; a 19,8 s no WebKit do CI com 85, a projeção é de uns 33 s, longe do limite de 60 s, e o teste não foi dividido.

## § 234 · Três ajustes de pt para caber a 320 px (F6)

O teste de reflow a 320 px achou três páginas de pt que rolavam para o lado:
- **Calculadora do cartão** (344 px): o rótulo "Parcelamento" com a etiqueta "exemplo" não cabia na meia coluna (138 px). O rótulo passa a "Parcelado", que cabe ao lado da etiqueta a 360 px, e o rótulo de um campo das calculadoras ganha `flex-wrap: wrap`: quando uma palavra e a etiqueta não cabem lado a lado, a etiqueta desce de linha. Em inglês nada muda, porque nenhum rótulo com etiqueta chega a esse limite.
- **Alugar ou comprar** (334 px): "Manutenção" e "Rendimento" com a etiqueta, nos campos de depois do resultado. O mesmo `flex-wrap` resolve.
- **Apoie** (341 px): os quatro valores do Pix e o botão "Apoiar com um café no Ko-fi". Abaixo de 360 px, os valores do Pix ficam com 4 px de respiro e "Qualquer valor" pode quebrar em duas linhas; o botão passa a "Apoiar no Ko-fi".

## § 235 · A Imagem para PDF segue na categoria Imagem da busca (F6)

O índice da busca passou a montar as entradas de todos os idiomas com uma função só, e a categoria escrita ao lado do nome passou a seguir a cor: a Imagem para PDF, que tem a cor de PDF, apareceu como "PDF" na busca em inglês (o `navigation.spec.ts` pegou). A função recebe a categoria separada da cor, e a Imagem para PDF volta à categoria Imagem, como antes da F6, nos três idiomas.

## § 236 · O código das calculadoras brasileiras vai no arquivo comum das calculadoras (F6)

As oito calculadoras brasileiras usam a mesma ilha das inglesas e das espanholas: o `mount.ts` das calculadoras leva as definições e os motores de todas, e cada página carrega dois arquivos JS (§ 110). Com isso, o JS inicial de uma calculadora em inglês passou de 38,5 KB para 42,8 KB gzip (o `budgets.spec.ts` do CI da F5b e o da F6), longe do teto de 80 KB. Separar o código brasileiro num segundo `mount` faria o Rolldown tirar o que as duas entradas dividem para um chunk comum, e toda calculadora passaria a três arquivos, o que o orçamento de requisições proíbe (a pegadinha da § 184); pôr esse código no grupo `island` levaria as calculadoras para as páginas de imagem. As páginas de imagem (20,9 KB a 21,1 KB) e de PDF (36,7 KB a 36,9 KB) ficaram praticamente iguais. Se uma fase futura juntar muito mais código às calculadoras, a separação por região vira uma ADR.

## § 237 · As cinco calculadoras em espanhol (F6, decisão 6)

As 5 (hipoteca, préstamo personal, tarjeta de crédito, deudas e interés compuesto) usam a definição, o motor, as fixtures e o exemplo inicial da página em inglês: `moneyRoutes()` dá a cada uma o caminho de `CALC_PAGES[id].es`, e o hreflang as liga ao inglês. Os textos são de `src/tools/<id>/i18n/es.ts` e os comuns de `src/tools/calc/i18n/es.ts`. O CSV tem a forma do inglês e o PDF é Carta (§ 222). Os chips e as relacionadas ficam entre as 5 (`next` e `related` de `es`), sem preset e sem guia, que só existem em inglês. As fontes: o CFPB tirou do ar o `consumerfinance.gov/es/` (§ 224), então cada página cita os PDFs em espanhol do CFPB que seguem no ar e, onde não há, a página em inglês com "(en inglés)" no rótulo. O `tests/unit/calc-i18n.test.ts` prova que as views en e es dão os mesmos valores (§ 233).

## § 238 · Home, rodapé, busca, 404 e institucionais em pt e es (F6, decisão 7)

- **Home e rodapé** de cada idioma mostram as ferramentas de imagem e de PDF do idioma e as calculadoras do idioma: em pt, as 8 brasileiras e o hub delas (`HOME_MONEY_IDS` e `HUB_MONEY_IDS` do registro); em es, as 5 e o hub em espanhol. Nenhum link leva a uma página que o idioma não tem.
- **A busca** mostra em cada idioma só as páginas que ele tem (31 em pt, as de imagem, de PDF e as brasileiras; 28 em es), com os sinônimos dos três idiomas juntos, e nunca oferece a página em inglês (§ 233 e § 235).
- **O 404 de pt e de es** tem a busca do idioma.
- **As institucionais** (Sobre, Privacidade, Termos, Licenças, Contato e Apoie) de pt e es passaram a ter o conteúdo das inglesas, com as ferramentas de PDF e as calculadoras; a Privacidade de pt diz que o código do Pix é estático, montado com o site, que escolher um valor não faz requisição e que o Copiar código só manda o evento de clique em doação, sem o código e sem o valor; os Termos de pt dizem que a doação por Pix é voluntária e como pedir a devolução. A data de "Última atualização" de pt e es é 2 de novembro de 2026, por extenso (§ 223 e § 230).

## § 239 · As traduções foram feitas por agentes em paralelo (F6, decisão 10)

Sete agentes Opus, cada um numa worktree própria, cada um dono de arquivos que nenhum outro tocava: imagem em pt, PDF em pt, imagem em es, PDF em es, dinheiro em es, as institucionais de pt e as de es. O primeiro passo de cada um foi `git merge --ff-only fase-06` (a pegadinha da F5a), e o trabalho voltou à branch por merge (`5ada9f7` a `9a4481e`). Os textos de dinheiro em português, os motores, os registros e o Pix foram do agente principal. Um agente de testes de unidade, na árvore principal, atualizou os portões e os testes que liam só o inglês (§ 230 a § 232). Todos os commits da run levam o nome verdadeiro do modelo (Claude Opus 5.5).

## § 240 · O painel de PDF não tira o foco de um campo em que a pessoa já digita (F6)

O `pdf-privacy.spec.ts` da Excluir páginas falhou 1 vez em 5 no WebKit do Windows, com a máquina livre: o intervalo digitado no campo "Pick pages by number" sumia. O trace mostrou o campo vazio 7 ms depois do `fill`. As opções e os campos delas aparecem com o cartão de pronto, e o painel leva o foco ao botão da ação num efeito que roda um quadro depois. O que se digitava nesse quadro ia para o botão. O defeito vem da F5a, e a F6 não mexeu nessa parte do painel. Agora, quando o foco já está num campo de texto da ilha (não o de arquivo, nem rádio ou caixa de seleção), o painel o deixa lá. O teste novo do `pdf-tool.spec.ts` foca o campo no instante em que ele aparece, antes dos efeitos da ilha, e confere que o foco e o texto ficam. Sem a correção, ele reprova nos dois navegadores.

## § 241 · A frase do SAC × PRICE quebra igual antes e depois da fonte (F6)

O Lighthouse do `pnpm verificar` deu CLS de 0,0502 no `/pt/simulador-sac-price/`, acima do limite de 0,05, igual nas três execuções. O deslocamento vinha da frase do ResultHero, coberta pelo aviso de cookies, e não do aviso: o Figtree chega uns 80 ms depois da primeira pintura, e a 412 px a palavra "começa" cabia na segunda linha com ele e descia com o "Figtree Fallback". O fim da frase subia uma linha, mesmo com as 4 linhas mantidas (sonda `.cache/probe-cls8.ts`). Em inglês, as quebras das duas fontes coincidem por acaso (CLS de 0,0008 na hipoteca). Pré-carregar o Figtree quebraria a regra do design system (um preload só, o da Fredoka, que o `gate:design` confere), e mexer no `size-adjust` do fallback mudaria todas as páginas. A frase passou a "No SAC a parcela vai de {sacFirst} a {sacLast}. Na PRICE ela começa em {price} e fica quase igual nos {months}.", que diz o mesmo e quebra igual nas duas fontes de 390 a 430 px (os celulares mais comuns e o Lighthouse; a 360 e a 375 px ainda há diferença). O CLS da página caiu para 0,0007.

## § 242 · O `pnpm verificar` inteiro passou de 900 s na máquina local (F6, medida e proposta)

Numa execução limpa no Windows desta run, o todo levou 1.169,4 s: 717,3 s de Playwright (os 2.076 testes dos dois navegadores, `2076 passed (11.9m)`), 318,5 s de Lighthouse (as 9 URLs, 3 vezes cada) e 133,6 s do resto. Na F5b o todo tinha dado 786,4 s (433,8 s de Playwright e 247,7 s de Lighthouse). O que cresceu foram as 63 páginas de pt e es no axe, no orçamento e nos anúncios, os estados de pt e es e o `tool-i18n.spec.ts`, além das duas URLs novas do Lighthouse. Como a ficha manda, rodaram as mesmas 11 partes do CI em sequência, cada uma no limite de 900 s, e o resumo de cada uma vai no relatório. O limite não muda. Proposta, para uma run de ajuste: um modo `pnpm verificar --partes`, que rode as partes do CI em sequência e some os totais, para a máquina local seguir o mesmo caminho do CI sem um comando por parte. Nada disso muda o `ci.yml`.

## § 243 · Duas partes do Chromium passaram do alvo de 700 s no CI (F6, decisão 11: medida e proposta)

Na primeira execução do CI da PR (run 41397565308, commit `520296c`), as 11 partes passaram, todas abaixo do limite de 900 s. Duas ficaram acima do alvo de 700 s: `playwright (chromium 1 de 3)`, com 764,0 s (346 testes em 12,4 min: o `a11y.spec.ts` inteiro e 118 do `ads.spec.ts`), e `playwright (chromium 3 de 3)`, com 710,6 s (a matriz de PDF, a matriz de imagens, o `tool-i18n.spec.ts` e os `money-*`). A estimativa de antes do push (§ 233) dava 680 s e 637 s. O resto: `verificar` 669,9 s, WebKit de 238,7 s a 674,8 s, Chromium 2 de 3 com 334,0 s. Pela decisão 11, de 700 a 900 s a run registra a medida e a proposta, e o `.github/` não muda. **Proposta, para uma run de ajuste:** o Chromium em 4 partes (`--playwright=chromium --shard=i/4`), com o `tests/unit/verificar.test.ts` atualizado e o `merge` esperando a parte nova. Pela contagem de hoje, cada parte ficaria com uns 260 testes, e a mais pesada (a do `a11y`) perto de 570 s. Antes, rodar o `--list` das 4 partes, porque o `design.spec.ts` e a matriz de imagens também caem no Chromium (a regra da § 142 vale para o WebKit, mas a parte do `a11y` é a que cresce com cada página nova).

## § 244 · A parcela da PRICE com TR em ponto fixo (F6, revisão e-1)

A § 226 dizia que o recálculo exato da PRICE com TR cabia nos 16 ms por tecla. Não cabia: o `money-speed.spec.ts` só media o SAC × PRICE com TR zero, e a lente (e) da revisão mediu, com TR de 0,1% e 420 meses, 58 ms de p50 por tecla no Chromium. Cada mês chamava o `annuity30`, que eleva (10^30 + j) à potência do prazo que falta: 420 potências de números de até 42 mil bits por tecla. Agora o `annuityByTerm` (`src/calc/br.ts`) faz (1 + j)^m em ponto fixo de 192 bits, uma multiplicação por mês, e a parcela é L·j·q / (q − 1) nesse ponto fixo. O erro dela fica abaixo de 2^-120 de centavo em toda entrada que os campos aceitam (juros até 30% ao ano ou 5% ao mês, até R$ 20 milhões, até 420 meses), e o arredondamento metade para cima sai igual ao do `annuity30`. Se a parcela cai a menos de 2^-60 de centavo de um meio centavo, o `annuity30` exato é calculado. Os 212 casos do SAC × PRICE no oráculo seguem iguais. O `tests/unit/calc-br-annuity.test.ts` compara as duas contas em mais de 5 mil entradas. O caso novo do `money-speed.spec.ts`, com TR de 0,1% e 420 meses, reprovou com o build antigo (p95 de 60 ms) e passa com o novo (p95 de 2,4 ms). No motor, a PRICE com TR caiu de 26,8 ms para 0,47 ms em 420 meses.

## § 245 · O bloco do Pix cabe de 320 a 390 px e diz quando a cópia falha (F6, revisão c-1, f-1, f-6, d-2, c-2 e d-3)

- **O seletor de valor** passava do trilho a 360 e 375 px: os quatro valores pedem 303 px, e o trilho tem 284 px a 360. O respiro menor e o "Qualquer valor" em duas linhas valiam só abaixo de 360 px; agora valem abaixo de 390 px.
- **O "Copiar código"** passava 17 px da coluna a 320 px (`white-space: nowrap`): ele quebra a linha quando precisa.
- **O status "Código copiado"** ficava na tela depois de trocar o valor, com o código antigo na área de transferência: trocar o valor o esvazia.
- **Um navegador sem área de transferência, ou que recusa a cópia,** deixava o botão mudo, com um erro não tratado na página. Agora o status diz "O navegador não deixou copiar. Selecione o código acima e copie, ou use o QR." (`copyFailed`).

Os dois testes novos do `money-pix.spec.ts` reprovam no build do `520296c` e passam no novo, nos dois navegadores.

## § 246 · O número do ResultHero cabe numa linha pelo tamanho do texto (F6, revisão f-3)

A lente (f) achou o "R$ 166.010,85" da amortização antecipada partido no meio a partir de 768 px ("R$ 166.010,8" e "5"): a 60 px, os 13 caracteres passavam dos 311 px do cartão, e o `overflow-wrap: anywhere` cortava onde calhava. Medindo as 31 calculadoras, o defeito era maior: em pt, o "/mês" descia sozinho de linha a 320, 768 e 1280 px no SAC × PRICE, no veículo, no empréstimo e nas dívidas, e a hipoteca em espanhol ia a duas linhas a 320 px. Agora o ResultHero passa ao CSS o tamanho do texto do número (`--fo-num-chars`) e a largura da unidade (`--fo-num-unit`, 11 px por caractere da unidade de 20 px), o cartão é um contêiner (`container-type: inline-size`), e a fonte do número é `min(48px, (100cqi − unidade) / (caracteres × 0,47))`, ou 60 px no lugar de 48 a partir de 768 px. Os algarismos medem uns 0,43 a 0,47 em por caractere na Fredoka. Os números em inglês seguem com 48 e 60 px, porque cabem com folga, e o número em si não quebra mais (`white-space: nowrap` nos algarismos). Um valor enorme digitado continua sem rolar a página de lado: a fonte desce com ele. O teste novo do `money-calc.spec.ts` reprova no build do `520296c` em 11 casos e passa no novo, nos dois navegadores.

## § 247 · Os valores do "Exemplo resolvido" não quebram dentro de um número (F6, revisão f-4)

A lente (f) achou valores das tabelas do exemplo partidos no meio ("R$ 1.084.638,2" e "0" no SAC × PRICE a 1280 px, "$375,000.0" e "0" na hipoteca em espanhol), pelo `overflow-wrap: anywhere` das tabelas do site. O defeito existia também em inglês, a 320 px (a refinanciamento, com "$1,807.02" partido). Agora uma célula de valor do exemplo quebra só nos espaços comuns: o "R$" vai colado ao número pelo espaço sem quebra, e um valor sem espaço nenhum ("−$3,489.77") não quebra (`fo-example__whole`, `white-space: nowrap`). Um texto longo, como a ordem das dívidas, segue quebrando nos espaços, e a página não rola de lado. O teste novo do `money-calc.spec.ts` olha as 31 calculadoras a 320, 360 e 1280 px: reprova no build do `520296c` e passa no novo, nos dois navegadores.

## § 248 · O botão da imagem da Assinar PDF quebra a linha a 320 px (F6, revisão f-2)

Na Assinar PDF em português, a aba "Imagem" rolava a página 19 px para o lado a 320 px: o botão "Escolher a imagem da assinatura" tem 323 px e não quebrava (`white-space: nowrap` do `.fo-btn`), numa coluna de 288 px. Dentro de `.fo-sign__upload`, o botão passa a quebrar o rótulo quando a coluna é mais estreita que ele (`max-width: 100%`, `white-space: normal`); o texto ficou como estava. O teste novo do `tool-i18n.spec.ts` abre essa aba a 320 px nos três idiomas: reprova no build do `520296c` (339 px em pt) e passa no novo, nos dois navegadores.

## § 249 · Antecipar no SAC encurta o prazo pelas amortizações inteiras que o valor cobre (F6, revisão a-3 e g-1)

A § 226 dizia que, no SAC, "reduzir o prazo" mantém a amortização de hoje. O motor e o oráculo faziam isso com uma amortização fixa, enquanto o contrato sem antecipar arredonda saldo ÷ meses que faltam a cada mês. Com R$ 0 antecipado, os dois cronogramas diferiam em centavos. A lente (a) achou 27 de 56 casos com economia diferente de zero e 15 negativos: o herói chegou a mostrar "−R$ 2,62" e a frase, "termina -1 anos e -1 meses antes". Agora o prazo novo é o de hoje menos uma unidade para cada amortização de hoje que o valor antecipado cobre (n − ⌊x ÷ A⌋, no mínimo 1), e o cronograma segue a regra do contrato. Com R$ 0, ele é o próprio contrato. O oráculo mudou primeiro, no commit `807e14c`, e afirma isso (`ensure`). As outras sete fixtures brasileiras mudaram só o hash do script. A premissa da página diz a regra nova. Com isso, um valor menor que uma amortização não encurta o prazo, e a frase, que dizia "você termina nenhum tempo antes" (g-1), passa a "Esse valor não chega a encurtar o prazo, mas você deixa de pagar … de juros". O `tests/unit/calc-br-early.test.ts` reprova no código do `520296c` em três casos (SAC com zero, SAC com valor pequeno e a frase) e passa no novo.

## § 250 · Os textos das licenças em pt e es levam `lang="en"` (F6, revisão g-3)

As páginas de Licenças em pt e es mostram os 45 textos de licença em inglês, como as licenças pedem, e o teste de vazamento os deixa de fora por isso (§ 232). Mas nada marcava o idioma deles, e um leitor de tela lia as 37 mil palavras com a voz do português ou do espanhol (WCAG 3.1.2). O `<pre>` de cada licença leva `lang="en"` fora da página inglesa. O teste novo do `english-leak.test.ts` reprova no build do `520296c` e passa no novo.

## § 251 · O erro de um número escrito do jeito de outro idioma diz como escrever os decimais (F6, revisão d-1)

Em pt, "11.5" num campo de 0 a 30% dava "Digite juros de 0 a 30% ao ano.", o que contradiz o que a pessoa digitou: o número está na faixa, só não está escrito com a vírgula. Em es, "6,5" dava o mesmo, e em inglês também. O campo usava uma só mensagem para texto que não é número do idioma e para número fora da faixa. Agora, quando o texto não é um número do idioma da página, a mensagem é a faixa mais a dica (`decimalHint`): "Use vírgula nos decimais, como 11,5.", "Usa punto en los decimales, como 6.5." e "Use a dot for the decimals, like 6.5.". Um número fora da faixa segue com a faixa só. O teste novo do `money-calc.spec.ts` reprova no build do `520296c` e passa no novo, nos dois navegadores.

## § 252 · O cronograma do SAC × PRICE mostra a parcela com os seguros e as taxas (F6, revisão a-2 e f-5)

O resultado do SAC × PRICE dizia "Primeira parcela no SAC R$ 4.754,95", com os R$ 150 de seguros e taxas por mês, e o cronograma, o CSV e o PDF mostravam a mesma parcela como R$ 4.604,95, sem eles e sem aviso. Na tabela, a coluna "Parcela" era o número e "Valor" era o dinheiro, ao contrário do resto da página. Agora a coluna da parcela leva os seguros e as taxas, que também têm uma coluna própria quando o campo não é zero: parcela = amortização + juros + seguros e taxas, igual no cronograma, no CSV e no PDF. As colunas das tabelas em português passaram a "Nº" e "Parcela" (antes "Parcela" e "Valor"). O oráculo não mudou: as linhas dele são as do financiamento, e a parcela com seguros é a soma que o resultado já mostrava. O teste do CSV do `money-calc.spec.ts` e o do `calc-i18n.test.ts` mudaram por construção (a parcela esperada soma os seguros, e a coluna nova entra no cabeçalho). O do `money-calc.spec.ts` reprova no build do `520296c` e passa no novo.

## § 253 · O número do ResultHero medido caractere a caractere (F6, segunda passada da revisão)

A segunda passada achou dois defeitos da § 246. Primeiro, o número encolhia à toa quando o valor tem palavras, também em inglês: "3 years 1 month" caiu de 48 para 34,6 px a 320 px e de 60 para 42,6 px a 768 px, porque a conta tratava as palavras, desenhadas na letra pequena de 20 px, como algarismos. Segundo, um valor inteiro longo ainda partia no meio ("$22,222,82" e "8"): o `nowrap` só valia para os números com palavras, e 0,47 em por caractere é pouco para algarismos largos. Agora o ResultHero mede o número com a largura real de cada caractere da Fredoka 600, medida com o espaçamento do número (de 0,374 em no "1" a 0,568 em no "2", 0,215 na vírgula e 0,441 no "$"). As palavras, a unidade e os espaços entre as peças entram em px (11 px por letra da letra pequena, que mede 9,9 px em média e 15 px no "m"; 8 px entre as peças). Todo número é um `span` que não quebra. A soma das larguras já sai um pouco maior que o texto (o kerning tira uns 1%), e essa é a folga. Com o exemplo de cada página, os números das 18 calculadoras em inglês ficam em 48 px, e em 60 px a partir de 768 px, como antes da F6. O teste do `money-calc.spec.ts` passa a exigir isso e a abrir a de juros compostos com "$22,222,828". Ele reprova no `8b74716` e passa no novo.

## § 254 · A dica do separador decimal só onde ela resolve (F6, segunda passada da revisão)

A § 251 mostrava a dica em todo texto que não fosse número do idioma: num campo de meses ("Digite um prazo de 12 a 420 meses. Use vírgula nos decimais"), num campo vazio, em letras, e até em inglês, para quem já tinha usado o ponto ("30.5" num campo de anos). Agora a dica só aparece num campo de dinheiro ou de taxa, e só quando trocar o ponto pela vírgula (e a vírgula pelo ponto) faz do texto um número do idioma. O teste do `money-calc.spec.ts` ganhou as letras, o campo vazio e o campo inteiro: reprova no `8b74716` e passa no novo.

## § 255 · As colunas do PDF da calculadora pelo tamanho do texto, quando ele não cabe (F6, segunda passada da revisão)

A coluna de seguros e taxas da § 252 levou a tabela do SAC × PRICE a 8 colunas em A4, e o PDF dividia a largura em partes iguais: "Juros" encostava em "Seguros e taxas", e "R$ 150,00" ficava por cima do saldo. O desenho da tabela (`columnLayout`, em `src/engine/pdf/report.ts`) segue o de sempre quando todo texto cabe na sua parte. É o caso de toda tabela em inglês e em espanhol, e os PDFs das 23 calculadoras saem com os mesmos bytes do código anterior (comparação feita uma vez nesta run; o `calc-report.test.ts` prova a divisão igual em todas). Quando algum texto passaria da parte dele, as colunas ficam da largura do maior texto, mais 6 pt, e a fonte da tabela diminui se ainda não couberem. O teste do SAC × PRICE em A4 reprova com a divisão igual e passa com a nova. Na mesma passada, o `calc-br-annuity.test.ts` ganhou os empates de meio centavo (5% ao mês sobre 30 centavos dá 31,5): sem a volta ao `annuity30` da § 244, o teste reprova.

## § 256 · O saldo do ano sob a coluna do saldo, e a amortização antecipada sem valor (F6, segunda passada da revisão)

- **A linha de cada ano** do cronograma punha o saldo do fim do ano na última coluna, que no SAC × PRICE é "Correção (TR)". A tabela agora diz a coluna do saldo (`endColumn`), e a linha do ano a usa. O teste do `money-calc.spec.ts` reprova no `8b74716` e passa no novo.
- **A fórmula da amortização antecipada** dizia "o saldo menor com a mesma parcela (reduzir o prazo)" também para o SAC, que agora encurta o prazo pelas amortizações cobertas (§ 249). O texto diz as duas regras.
- **Com R$ 0 antecipado**, a frase dizia "Esse valor não chega a encurtar o prazo, mas você deixa de pagar R$ 0 de juros". Agora diz "Sem valor a antecipar, o contrato segue como está: digite quanto você quer adiantar." O `calc-br-early.test.ts` confere nos dois sistemas.

## § 257 · As calculadoras de casa e saúde num registro irmão do de dinheiro (F7, decisão 1)

- **Decisão:** as 11 calculadoras da F7 ficam em `LIFE_CALC_PAGES` (`src/tools/calc/registry.ts`), ao lado de `CALC_PAGES` e de `BR_CALC_PAGES`, com `HOUSE_CALC_IDS` e `HEALTH_CALC_IDS` na ordem dos hubs, `HOUSE_HUB_ID = 'home-calculators'` e `HEALTH_HUB_ID = 'health-calculators'`. Cada linha diz o caminho, o hub (`house` ou `health`), o ícone, os chips, as relacionadas (só do mesmo hub) e o nome fixo do PDF e do CSV. `AnyCalcId = MoneyPageId | LifeCalcId` é o tipo da ilha (`CalcDef.id`, `CalcPanelData.page`, `DEFS`), e `calcAreaOf(id)` diz `money`, `house` ou `health`. A área decide o AdSlot (`dinheiro` ou `casa-saude`), a cor (`money` ou `home`, o violeta só como preenchimento), o hub do breadcrumb, o `WebApplication` (`FinanceApplication`, `UtilitiesApplication` ou `HealthApplication`), a comemoração da Oli (nunca na saúde) e a lista de fontes do `gate:dinheiro-saude`.
- **Por quê:** o que lê `CALC_PAGES` supõe dinheiro (cronograma, centavos, presets, versão em espanhol); estender aquele registro levaria as páginas novas para testes e portões que não fazem sentido para elas. O registro irmão repete o que a F6 fez com as calculadoras brasileiras. `HOME_CALC_IDS` continua sendo "as calculadoras de dinheiro da home".
- **Alternativa:** estender `CALC_PAGES` com `area` e `hub` (mais simples no tipo, mas cada teste de dinheiro teria de filtrar por área).
- **Uma ilha só:** as 11 definições e os motores entram no `mount.ts` comum (§ 110 e § 236); toda página de calculadora continua com 2 arquivos JS.

## § 258 · Medidas, contas exatas e o `exact` onde entram π e log10 (F7, decisões 2 a 4)

- **Decisão:** um campo de medida é `kind: 'dec'` com `decimals` (`NumberSpec`): um número inteiro de 10^-decimais da unidade, lido pelo `parse.ts` sem `parseFloat`. Comprimento em centésimos de pé ou de polegada, área em centésimos de pé quadrado, peso e circunferência em décimos. O `DECIMALS` do dinheiro não muda; `decimalsOf()` e `display()` com `decimals` cobrem a medida. Na tabela, a célula `{ scaled, decimals }` sai com as casas fixas na tela, no PDF e no CSV (sem separador de milhar no CSV).
- **As contas:** área, volume, BMI, calorias, galões e peças são frações em BigInt (`src/calc/home.ts`, `src/calc/health.ts`), arredondadas uma vez, no fim, metade para cima, na casa mostrada; o que se compra é o teto da conta exata. As conversões são as exatas do NIST (HB 44, Apêndice C, e SP 811): 1 in = 2,54 cm; 1 lb = 0,45359237 kg; 1 ft = 12 in; 1 yd³ = 27 ft³; 1 ft³ = 1.728 in³; tonelada curta = 2.000 lb.
- **π e log10:** o círculo (Square footage, Concrete redondo) e a gordura corporal usam `Math.PI` e `Math.log10`. O resultado leva `exact`, o valor antes do arredondamento; o oráculo (`scripts/oracle/calc_home_health.py`, `decimal` com 50 dígitos) grava o mesmo `exact` com 30 algarismos, e o `calc-oracle.test.ts` exige o valor mostrado igual e a diferença do `exact` abaixo de 1e-9 (`exactGaps`, com o próprio controle). O oráculo refaz o sorteio quando o valor mostrado fica a menos de 1e-9 de um empate de arredondamento (ou um teto a menos de 1e-9 de um inteiro) e grava quantos refez em `nearTiesDrawnAgain` (1 caso, no Concrete).
- **Faixas:** as dimensões ficam pequenas o bastante para o erro do ponto flutuante não chegar perto de 1e-9 (Square footage até 300 ft por lado; Concrete redondo até 240 polegadas de diâmetro e de profundidade).
- **Fontes de casa:** a lista do `gate:dinheiro-saude` ganha `house`: `energystar.gov`, `energy.gov` e `nist.gov`, com controles positivos e negativos no `ymyl.test.ts`. A página escolhe a lista pelo hub (`ymylHubOf`, `src/i18n/routes.ts`). A de saúde não precisou de domínio novo: cada página de saúde cita ao menos um `cdc.gov` ou `nih.gov` (CDC, PubMed, PMC, NICHD, NIDDK); as outras fontes que ela cita (womenshealth.gov, medlineplus.gov, army.mil) são oficiais e ficam como leitura complementar.
- **Teste:** `calc-oracle.test.ts` (11 fixtures novas, 2.421 casos), o mutante (`CALC_FIXTURES_DIR`, um BMI e um `exact` mudados: reprovam os dois) e o `--check` do oráculo.

## § 259 · Asserções que mudaram porque o site cresceu (F7)

A ficha permite mudar um valor esperado que cresceu com o site, com registro. Nenhuma asserção perdeu o sentido:

- **`tests/unit/ymyl.test.ts`:** a contagem do portão soma os 2 hubs e as 11 calculadoras de casa e saúde (`life = 13`).
- **`tests/unit/calc-oracle.test.ts`:** o conjunto de scripts do oráculo passa de dois para três; o `numpyFinancial` é exigido só nos dois de dinheiro, e o de casa e saúde (sem pacote) tem de gravar `nearTiesDrawnAgain`.
- **`tests/unit/calc-defs.test.ts`:**
  - as definições passam de 26 para 37;
  - o link do cenário não leva o `today` do Due date, que a ilha lê do aparelho;
  - a "última atualização" da Privacidade em inglês passa a 2 de novembro de 2026.
- **`tests/unit/routes.test.ts`:**
  - a ordem do mapa ganha os 2 hubs, as 11 calculadoras e o QR depois dos guias de arquivo;
  - as páginas só em inglês somam 14;
  - o índice da busca e a lista vazia em inglês ganham as 11 calculadoras e o QR no fim.
- **`tests/unit/seo-checks.test.ts`:** o sitemap em inglês soma as linhas `casa-saude` e `utilidades`, lidas do mapa.
- **`tests/unit/consent.test.ts`:** `CALC_EVENT_TOOLS` soma `LIFE_CALC_IDS`, e `EVENT_TOOLS` ganha `UTILITY_EVENT_TOOLS` no fim.
- **`tests/unit/pdf-site.test.ts`:** a home em inglês ganha as seções de casa, saúde e QR depois da de dinheiro; o rodapé em inglês ganha as colunas Home, Health e Utilities antes de FileOrca.
- **`tests/unit/prontidao.test.ts`:** os cartões da home em inglês somam as 6 de casa, as 5 de saúde e o QR; a busca soma 12, e as 12 ferramentas de PDF deixam de fechar a lista.
- **`tests/unit/conteudo.test.ts`:** a contagem de calculadoras do portão soma as 11 (42 páginas).
- **`tests/unit/design-checks.test.ts` e `scripts/gates/design.ts`:** as páginas de saúde pedem todas as poses da ilha menos `cheer`, que passa a ser proibida nelas (a regra antiga exigia o símbolo em toda página de ferramenta).
- **`tests/e2e/a11y.spec.ts` e `tests/e2e/navigation.spec.ts`:** o diálogo e a caixa da busca listam as 11 calculadoras e o QR (de 56 para 68 em inglês), lidos dos registros.
- **`tests/e2e/budgets.spec.ts`:** `HUB_PAGES` e a lista de calculadoras só crescem.
- **`tests/e2e/money-speed.spec.ts`:** os casos do BMI e da Square footage com 10 áreas têm a tabela aberta, então o "nenhuma linha antes de abrir" vale só para as de dinheiro.

## § 260 · A tabela da Energy Star e a ordem dos ajustes do BTU (F7, decisão 5.6)

- **A tabela:** a de https://www.energystar.gov/products/room_air_conditioners, lida em 2/nov/2026, transcrita no oráculo e no motor (`ENERGY_STAR_ROWS`). Cada linha vai do primeiro número até o segundo, sem incluí-lo ("150 up to 250" começa em 150), e a última inclui 2.500 sq ft. Fora de 100 a 2.500 sq ft, o campo diz a faixa.
- **O "34,00":** a cópia da tabela em https://www.energystar.gov/most-efficient/me-certified-room-ac/ escreve a última capacidade "34,00"; a página principal escreve 34,000, com as mesmas 13 linhas antes. O oráculo usa 34,000 e o `fixtures/calc/OFICIAIS.md` registra o erro de digitação.
- **A ordem:** a Energy Star não fixa a ordem dos ajustes. A página aplica, nesta ordem: o valor da tabela; menos 10% com muita sombra ou mais 10% com muito sol (uma escolha só, sobre o valor da tabela); mais 600 BTU por pessoa além de duas; mais 4.000 BTU na cozinha. Como o valor da tabela é múltiplo de 1.000, o resultado é sempre inteiro, sem arredondamento.
- **Alternativa:** somar pessoas e cozinha antes do percentual (daria 60 a 400 BTU a mais com sol e 60 a 400 a menos com sombra); ficou a ordem em que a fonte lista os ajustes, com o percentual sobre o número que a própria tabela dá.

## § 261 · Trocar de unidade não converte: cada sistema guarda os próprios valores (F7, decisão 2)

- **Decisão:** BMI, Calorie e Body fat têm o OptionGroup "US / Metric" (US primeiro). Cada sistema tem os próprios campos e chaves (pés, polegadas e libras; centímetros e quilos; no Body fat, as circunferências em polegadas `nk`, `wa`, `hp` e em centímetros `nkc`, `wac`, `hpc`). Trocar mostra os campos do outro sistema com os valores dele: o exemplo da unidade ou o que a pessoa digitou nele antes. A unidade vai no link do cenário (`u=metric`), nunca no armazenamento do aparelho.
- **Por quê:** converter na troca arredonda (160 lb viram 72,6 kg, que voltam como 160,1 lb), e o resultado mudaria só porque a pessoa trocou de unidade. Os dois exemplos são casos `page-example` do oráculo.
- **Alternativa:** converter o que está digitado ao trocar (mais cômodo para quem digitou num sistema e quer ver no outro, com o arredondamento acima).
- **Teste:** o spec de saúde troca de unidade nos dois navegadores e confere o resultado do exemplo métrico contra o oráculo.

## § 262 · O campo de data é o do navegador, com faixa fixa (F7, decisão 6)

- **Decisão:** `DateSpec` (`kind: 'date'`) e `DateField.tsx`: o `<input type="date">` nativo, com `min` e `max`, o rótulo e o FieldError do design system (ícone de alerta, `role="alert"`), feito só com tokens. O valor é o dia "AAAA-MM-DD", o mesmo em qualquer idioma do aparelho; o link leva `d=2026-09-07`, e o `readLink` confere que é um dia real e está na faixa. A faixa é fixa, de 1/jan/2000 a 31/dez/2099, para não mudar com o dia em que a página abre. Dia vazio, incompleto ou fora da faixa mostra o erro com a faixa, e o resultado fica o último que deu certo.
- **Por quê:** o campo nativo dá o calendário do telefone, cabe em meia linha (o resultado fica acima da dobra a 360 × 740) e não depende de formato de data do idioma. Três campos (mês, dia, ano) pediriam uma linha a mais.
- **As datas da tela:** saem por extenso pelo `src/i18n/dates.ts`, sem `Intl`, que a ilha passa a importar (era só do build).
- **Hoje:** o Due date tem `today: true`. O exemplo da página usa o dia do exemplo (2/nov/2026); depois da hidratação, o `mount.ts` põe o dia local do aparelho (`getFullYear`, `getMonth`, `getDate`, nunca UTC), uma vez, sem passar pelo link e sem escrever nele. O motor só vê dias inteiros (`src/calc/dates.ts`, o calendário gregoriano em números inteiros).

## § 263 · Os eventos da F7 (F7, decisões 6 e 8)

- **Calculadoras:** os 11 ids entram em `CALC_EVENT_TOOLS` (`src/analytics/tool-ids.ts`); `calc_complete`, `export_click` e `share_click` aceitam `AnyCalcId`.
- **QR:** a lista nova `UTILITY_EVENT_TOOLS = ['qr-code-generator']` entra em `EVENT_TOOLS`, e `EXPORT_FORMATS` ganha `png` e `svg`. Baixar o QR manda `export_click` com `tool: 'qr-code-generator'` e o formato; nada do texto.
- **Teste:** `consent.test.ts` (as listas iguais aos registros) e `events.spec.ts`.

## § 264 · As datas das páginas de casa e saúde (F7, decisão 6)

- **Decisão:** `LIFE_REVIEWED`, `LIFE_FIRST_PUBLISHED` e `LIFE_SOURCES_READ_ON` (`src/tools/calc/page.ts`) são 2/nov/2026, o dia em Brasília em que a run escreveu as páginas e leu as fontes (§ 207 e § 223). `datesOf(id ou área, lang)` dá os três dias de uma página ou de um hub; as páginas de dinheiro continuam com os dias delas. O `Reviewed.astro` recebe `of` (a página ou a área).

## § 265 · As convenções de saúde, conferidas nas fontes (F7, decisão 5)

- **Idade mínima:** todas as páginas de saúde dizem "for adults 18 and older". O BMI aceita idade de 20 a 120, porque as faixas de adulto do CDC são para 20 anos ou mais ("This BMI calculator is for adults 20 and older"); o Calorie aceita de 19 a 78, as idades da amostra de Mifflin e St Jeor (498 adultos saudáveis de 19 a 78 anos); o Body fat aceita de 18 a 120. Cada página diz qual mínimo vale e por quê.
- **BMI:** a fórmula do CDC (703 × lb ÷ in², ou kg ÷ m²), arredondada a uma casa, e a faixa lida desse número mostrado, como a calculadora do CDC escreve as faixas (18.5 to 24.9, 25.0 to 29.9...). Com o valor cru, 24,96 cairia em Healthy Weight pela tabela "to less than 25" e em Overweight pela de uma casa; ficou a de uma casa, a da calculadora do CDC. Os nomes são os do CDC, em texto, nunca só por cor (Underweight; Healthy Weight; Overweight; Class 1, Class 2 e Class 3 Obesity).
- **Calorie:** Mifflin-St Jeor nas formas por sexo do artigo de 1990 (10 × kg + 6,25 × cm − 5 × idade + 5 ou − 161). Não há fonte oficial dos fatores 1,2 a 1,9. O fator é o nível de atividade física (PAL) do NIH Body Weight Planner, um campo de 1.4 a 2.5 com o exemplo 1.6, que é o padrão do próprio planner, e a ajuda diz a origem. O apêndice do modelo (NIDDK) usa o PAL sobre o repouso do Mifflin-St Jeor. O rótulo do sexo diz "Sex used by the formula".
- **Ovulation:** a ovulação no dia (ciclo − 14) do ciclo, isto é, início + ciclo − 15 dias: o dia 14 de um ciclo de 28, como o NICHD ("Around day 12 to 14 in an average 28-day cycle") e o calculador da Office on Women's Health contam. O prompt partia da "próxima menstruação − 14", que dá o dia 15; a convenção mudou um dia para bater com as fontes, e as premissas da página dizem isso. A janela fértil é a dos 5 dias antes da ovulação e o dia dela. O ciclo vai de 20 a 40 dias, a faixa do calculador da OWH; a página diz que ciclos fora de 24 a 38 dias valem uma conversa com médico ou enfermeira, que é estimativa e que não serve para evitar gravidez.
- **Body fat:** as equações de Hodgdon e Beckett (1984) em polegadas, conferidas em três fontes abertas (os relatórios do DTIC deram 403): Foulis 2023 e Schuna 2013 no PMC, e o post do Exército de 2019. O métrico é dividido por 2,54 antes. Uma diferença de zero ou menos (cintura menos pescoço; cintura mais quadril menos pescoço) não tem logaritmo e vira o aviso de conferir as medidas; um resultado fora de 0,1% a 99,9% também. Sem faixa nem classificação. A página diz, pela fonte (army.mil, julho de 2026), que o Exército trocou o teste de fita pela razão cintura-altura, e nunca chama o resultado de padrão militar atual. A DoDI 1308.03 não abriu (403); a página não cita o que ela diz.
- **Due date:** 280 dias da última menstruação (NICHD: cerca de 40 semanas); 266 da concepção; 263 de uma transferência de embrião de 3 dias e 261 de um de 5 dias (NIH, estudo nuMoM2b, PMC4387083). O texto inteiro do ACOG CO 700 não abriu (403 no acog.org; só o resumo no PubMed): os números vêm do NIH, e o resumo do CO 700 fica como fonte da regra de que a ultrassonografia do começo prevalece. Sem fonte oficial para o ajuste pela duração do ciclo, a página diz que a regra supõe ciclo de cerca de 28 dias. Os trimestres são os do NICHD (semanas 1 a 12, 13 a 28 e 29 a 40: começam nos dias 0, 84 e 196); o termo completo começa na semana 39 (dia 273). A idade gestacional de hoje aparece de 0 a 300 dias (até 42 semanas e 6 dias); antes do primeiro dia, a frase diz que ainda não há semanas; depois de 300 dias, que passou de 42 semanas.
- **Tom:** nenhuma exclamação, elogio ou julgamento no resultado; a Oli não comemora (o sprite das páginas de saúde não leva a pose `cheer`); o aviso diz que não é recomendação médica e manda procurar um profissional de saúde.

## § 266 · As convenções de casa (F7, decisão 5)

- **Square footage:** uma lista de 1 a 10 áreas (`a0s`, `a0x`, `a0y` no link, como a lista de dívidas da § 114), cada uma com o menu de forma (`ListSpec.pick`): retângulo (comprimento × largura) e triângulo (comprimento × largura ÷ 2), como a Energy Star mede um cômodo, e círculo (π × diâmetro² ÷ 4, pelo NIST, que escreve 0,7854 × d²; a página usa π). O total vem da soma exata, não da soma das linhas arredondadas.
- **Concrete:** laje ou sapata (comprimento e largura em pés, espessura em polegadas) ou redonda (diâmetro e profundidade em polegadas, para um furo de poste ou uma coluna), com quantidade e folga; sacos de 40, 60 e 80 lb pelo rendimento de cada um, um campo com exemplos 0,30, 0,45 e 0,60 cu ft. Não há fonte oficial do rendimento do saco: o rótulo é de exemplo e a página manda conferir a embalagem.
- **Mulch & gravel:** o slug é `mulch-calculator`; o nome, "Mulch and gravel calculator". A área por comprimento e largura ou digitada; o saco de mulch (exemplo 2 cu ft) e o de gravel (exemplo 0,5 cu ft) são campos separados; a densidade do gravel (exemplo 1,28 tonelada curta por jarda cúbica) vem da tabela de conversão da EPA ("Gravel, loose: 1 cubic yard, 2,565 lb").
- **Paint:** perímetro × pé-direito ou a área digitada, menos portas (exemplo 21 sq ft) e janelas (exemplo 15 sq ft); o rendimento é campo (exemplo 350 sq ft por galão); a EPA usa 400 sq ft por galão como padrão de modelo e cita 250 a 400 como faixa da indústria. Aberturas que cobrem a parede inteira viram o aviso "nada a pintar", com o PDF e o CSV desligados.
- **Tile:** peças = teto da área × 144 × (1 + folga) ÷ área da peça; caixas = teto das peças ÷ peças por caixa, e 0 quer dizer "não sei". A junta fica fora da conta (premissa).

## § 267 · O que uma página de saúde nunca diz (F7, decisão 7)

- **Decisão:** `BANNED_HEALTH` (`scripts/lib/ymyl.ts`) vale nas páginas do hub de saúde, além do `BANNED` de sempre: "ideal weight", "you should lose", meta de perda ou ganho de peso, "lose 10 pounds", faixa de peso saudável para a altura, déficit ou superávit de calorias, "eat … calories to lose", plano de dieta ou de refeições, "macros", "birth control" e "safe days". O nome de faixa do CDC "Healthy Weight" continua permitido.
- **Teste:** `ymyl.test.ts`, com um controle positivo por padrão, controles negativos com as frases das páginas e a prova de que a lista de dinheiro não muda.

## § 268 · O resultado das páginas novas acima da dobra a 360 × 740 (F7, decisão 6)

- **Medido** (Chromium, 360 × 740, o fim do número do ResultHero): na primeira versão, o BMI, o Concrete e o BTU ficavam em 764 px; o Calorie e o Body fat em 864; o Mulch em 820; a Square footage em 1.184. O que passava: o `lead` em três linhas (84 px), dois OptionGroups (unidade e sexo) com duas linhas de campos, o H1 e o breadcrumb da Square footage e do Mulch em duas linhas, e a lista de áreas com o botão de acrescentar.
- **Decisão:**
  - o `lead` dessas páginas cabe numa linha a 360 px ("Your BMI from your height and weight.");
  - o sexo da fórmula (Calorie e Body fat) vem depois do resultado, com o nível de atividade, o quadril e a idade; o OptionGroup de unidade fica antes, com duas linhas de campos de meia largura;
  - no Mulch, o material (e o saco e a densidade de cada um) vem depois do resultado: o volume, que é o número do ResultHero, não depende dele;
  - na Square footage, o exemplo tem uma área só (15 × 12 ft; o oráculo mudou antes, em `6955512`, e o exemplo de duas áreas ficou como caso da grade), e o botão "Add an area" vem depois do resultado (`ListSpec.addBelow`): as áreas continuam antes dele, e uma área acrescentada leva o foco ao menu de forma dela.
- **Depois:** de 568 a 714 px nas 11, nos dois sistemas de unidade; o `ads.spec.ts` prova nos dois navegadores.
- **Alternativa:** um OptionGroup e um campo lado a lado numa linha (o `fieldset` fica fora do subgrid, § 137) ou a lista de áreas em três colunas a 360 px (os campos ficariam com uns 77 px).

## § 269 · O `lint:texto` lê os textos de casa e saúde com amostras próprias (F7, decisão 11)

- **Achado:** o `lint:texto` trata todo `src/tools/*-calculator/` como texto de dinheiro e preenche cada `{placeholder}` com uma amostra de `MONEY_SAMPLES` (§ 123); sem amostra, vira "$1,234". Nas páginas novas, `{x}`, `{area}`, `{bmi}` ou `{weeks}` virariam dinheiro, e o `{x}` já é dinheiro no Refinance.
- **Decisão:** `isLifeText` separa os textos das 11 calculadoras e dos 2 hubs; eles são preenchidos por `LIFE_SAMPLES` (valores dos exemplos do oráculo) e `LIFE_SAMPLES_BY_KEY` (o "{n} week" e o "{n} day" leem 1). Um placeholder sem amostra vira "12", nunca dinheiro. Os textos de dinheiro ficam como estavam, e o `lint-texto-money.test.ts` prova os dois lados.
- **Corrigido:** o LanguageTool local achou 7 erros nos textos novos (Paint, Square footage, Concrete e Body fat), reescritos ("Gallons to buy, rounded up: {buy}.", "the labels on paint cans", "subtract doors"...). Depois: 0 erros.
- **Prontidão:** o `gate:prontidao` confere os cartões das seções novas da home em inglês, os dois hubs na ordem de `LIFE_HUB_IDS` e a busca com as 11 calculadoras e o QR no fim; o build com as três variáveis ganhou unidades de teste para as áreas `casa-saude` e `utilidades`, para a trava do hostname valer também nessas páginas.

## § 270 · O JS das calculadoras com as 11 novas (F7, decisão 6)

- **Medido** pelo `budgets.spec.ts` (JS inicial em gzip, o build da `main` contra o da `fase-07`):

  | Página | Antes | Depois |
  | --- | ---: | ---: |
  | `/mortgage-calculator/` | 43,4 KB | 50,6 KB |
  | `/bmi-calculator/` | não existia | 50,6 KB |
  | `/compress-image/` | 21,1 KB | 21,2 KB |
  | `/merge-pdf/` | 36,9 KB | 37,0 KB |
  | `/home-calculators/` e `/health-calculators/` | não existiam | 3,4 KB |

- **Leitura:** a entrada comum das calculadoras passou de 23,2 para 30,4 KB com as 11 definições e os motores (§ 236), e cada página de calculadora continua com 2 arquivos JS, com 63% do teto de 80 KB. Não foi preciso a ADR de separação por região.
- **Imagem e PDF:** o chunk `island` cresceu 93 bytes em gzip pelas listas fechadas de eventos (§ 263: os 11 ids, o `qr-code-generator`, `png` e `svg`), que moram em `src/analytics/` de propósito (§ 113). Nenhum código de calculadora nem do QR entrou ali: o `budgets.spec.ts` prova pelo `.cache/bundle-modules.json` que nenhum arquivo das páginas de imagem e de PDF tem módulo da F7.

## § 271 · O `qrcode` entra no bundle como ES modules (F7, decisão 8)

- **Achado:** com o `import { create } from 'qrcode/lib/core/qrcode.js'`, a página do QR carregava 3 arquivos JS: a entrada, o `island` e o `rolldown-runtime.*.js` (0,4 KB gzip). O `qrcode` e o `dijkstrajs` são CommonJS, o Rolldown os embrulha num ajudante (`__commonJS`) e põe esse ajudante num chunk que ele divide com os chunks preguiçosos das ferramentas de imagem (HEIC, libheif, o cliente do PDF).
- **Tentado:** pôr o runtime no grupo `island` (o Rolldown não oferece esse módulo aos grupos: a sonda no `test` nunca o viu) e `experimentalInlineCommonChunks` (pede `preserveEntrySignatures: false`, que o build do Astro não aceita, nem no ambiente `client`).
- **Decisão:** o plugin `qrcodeEsm()` (`src/platform/qrcode-esm.ts`, no `astro.config.ts`) entrega ao bundler os arquivos de `qrcode/lib/core/` e o `dijkstra.js` como ES modules: cada `require('./x')` vira o import padrão daquele módulo, o arquivo roda com `module` e `exports` locais, e `module.exports` é o export padrão (mais os nomes de `exports.nome =`). O código deles é CommonJS simples (requires no topo, com texto fixo, sem ciclo); o plugin recusa um `require` que não seja texto fixo. Os ids dos módulos continuam os arquivos de `node_modules`, então o registro do bundle e o `gate:licencas` veem os mesmos pacotes.
- **Depois:** 2 arquivos JS na página do QR; o `island` com o mesmo hash; as páginas de imagem, de PDF e de calculadora com os mesmos arquivos. O `budgets.spec.ts` passa a conferir os 2 arquivos do QR, e o `tests/unit/qrcode-esm.test.ts` roda os arquivos convertidos como ES modules no Node e prova a mesma matriz do pacote, em três textos.
- **Alternativa:** aceitar o terceiro arquivo com um registro (0,4 KB e uma requisição), ou copiar o `qrcode` para o repositório já em ES modules (código de terceiro fora do `node_modules`, que o `gate:licencas` não veria).
- **Não é arquitetura:** o host, o framework e o pipeline não mudam; o plugin é do build, como o `recordBundledModules` e o `platformFiles`.

## § 272 · O gerador de QR code (F7, decisão 8)

- **A matriz:** `create([{ data: bytes, mode: 'byte' }], { errorCorrectionLevel: 'H' })`, com os bytes do `TextEncoder`; o teste prova o nível H (`bit === 2`) e que um nível inválido viraria M em silêncio. O `qrcode` 1.5.4 não emite ECI: o modo byte leva o UTF-8 cru.
- **O limite:** 1.273 bytes de UTF-8, a capacidade da versão 40 em H. A leitura pelo `jsqr` prova o maior permitido com a Oli no meio, no menor PNG (740 px a 4 px por módulo), no Node e nos dois navegadores, então o limite não precisou baixar. O erro diz o limite e que acento conta 2 e emoji 4; a contagem fica ao lado do rótulo, fora do alerta, para o leitor de tela não repetir o alerta a cada tecla. Texto vazio ou só de espaços não gera QR; o erro só aparece depois que a pessoa digitou.
- **A Oli:** o ícone do app (`docs/design/assets/Logo/app-icon.svg`, com o clip renomeado `fo-qr-oli`) num quadro branco centrado e alinhado à grade, de lado ímpar = 2 × arredondamento((0,22 × n − 1) / 2) + 1 módulos, com 10% de margem; os módulos sob o quadro não são desenhados. Em 160 leituras (4 textos por versão, da 1 à 40) não houve falha; a sondagem leu até 30% na versão 1 e 46% na 40. Ligada por padrão; desligada, o QR sai sem logo.
- **O PNG:** do `<canvas>` da página (sem worker), em escala inteira de pixels por módulo, porque o `jsqr` falha com escala fracionária (512 px fixos leram 16 de 25 conteúdos): "Small", "Medium" e "Large" miram 512, 1.024 e 2.048 px, com escala = máx(4, piso(alvo ÷ (n + 8))), e a tela diz o tamanho real. O fundo branco é pintado antes (um pixel transparente o `jsqr` lê como preto).
- **As cores:** módulos `#000000` sobre `#FFFFFF` no arquivo baixado e na prévia, nos dois temas: um QR é lido como escuro sobre claro por toda câmera. Os hex só existem em `qr.ts` (atributos do SVG e `fillStyle` do canvas), nunca no CSS, no modelo da exceção do QR do Pix no README do design.
- **O resto:** nomes fixos `qr-code.png` e `qr-code.svg`; o SVG é montado pelo nosso código, sem o texto da pessoa; a caixa de texto tem `autocomplete="off"`, `spellcheck={false}` e `autocapitalize="off"` (o corretor avançado do Chrome envia o texto ao Google); o selo diz "Your text never leaves your device"; as relacionadas são Resize image, PNG to JPG, Image to PDF e Compress image; a /licenses credita o "QRCode for JavaScript" de Kazuhiko Arase, de onde o núcleo do `qrcode` vem; o `gate:licencas` reprova `qrcode` ou `dijkstrajs` no `island` ou em mais de um chunk.
- **Testes:** `tests/unit/qr.test.ts` (o SVG rasterizado pelo `@resvg/resvg-js` e lido pelo `jsqr` em todas as 40 versões) e `tests/e2e/qr-code.spec.ts` (o PNG e o SVG baixados, com e sem a Oli, um endereço curto, um longo, acento e emoji e o maior permitido, o `binaryData` igual aos bytes UTF-8, a privacidade do texto e os eventos sem ele), mais o QR no `ads.spec.ts`, no `a11y.spec.ts` e no `budgets.spec.ts`.

## § 273 · O teste de 90 dias de casa e saúde começa em 2 de novembro de 2026 (F7, decisão 12)

- **Início:** 2/nov/2026, o dia em Brasília em que a run abriu a PR da F7 (o plano estimava por volta de 25/fev/2027 para o fim, contando de uma F7 mais tardia).
- **Fim:** 31/jan/2027, 90 dias depois.
- **O que olhar no fim:** no Search Console, as impressões de cada uma das 11 calculadoras de casa e saúde (e dos dois hubs) nos 90 dias, contadas a partir do dia em que as páginas entraram em produção.
- **Gatilho do backlog** (PLANO, "Backlog com gatilho"): as calculadoras de casa e de saúde com impressão nos 90 dias ganham versão em português e em espanhol, numa run própria; as sem impressão ficam só em inglês.
- **Atenção:** se o merge da PR acontecer dias depois, as páginas só passam a contar dali; o fim continua em 31/jan/2027, e a leitura deve dizer quantos dias de produção cada página teve.

## § 274 · A revisão adversarial da F7 (F7, 2/nov/2026)

- **Método:** o da F3 (§ 92 a § 94), com sete lentes Sonnet em contexto limpo: corretude, privacidade e segurança, anúncio e política, acessibilidade, desempenho e SEO, design system e voz, e saúde e confiança. Elas rodaram sobre o commit `69fb7f3`, numa worktree só de leitura (`.claude/worktrees/revisao-f7`), cada uma com o próprio `FO_PORT` (4174 a 4180). Cada achado crítico, alto ou médio teve um cético próprio; os baixos de cada lente, um cético só. Foram 39 agentes.
- **Números:** 49 achados (8 altos, 18 médios e 23 baixos, na gravidade da lente). Depois dos céticos: nenhum crítico, 1 alto, 16 médios, 25 baixos e 7 refutados.
- **Corrigidos:** o alto (f-1, § 275) e 15 dos 16 médios (§ 275 a § 281), cada um com um teste que reprova no build do `69fb7f3` e passa no novo. Cinco baixos saíram junto, porque eram o mesmo defeito de um médio: a-2 (g-1), d-6 (g-3), d-10 e g-6 (f-7) e d-12 (f-2).
- **Não corrigido:** o e-1, o CLS de 0,20 a 320 a 390 px com escala 1. O breadcrumb quebra em duas linhas quando a Figtree chega e empurra a ferramenta 22 px. A correção mexe no breadcrumb de todas as páginas do site ou no carregamento das fontes (§ 241), então não é local. Fica como pendência no relatório, com as duas saídas da lente: reservar duas linhas no breadcrumb abaixo de 420 px, ou uma ADR "Proposta" para pré-carregar a Figtree.
- **Os baixos restantes** vão para o relatório (`docs/relatorios/REVISAO-F7.md`).
- **Os testes novos:** `tests/e2e/calc-form.spec.ts` (8 testes por navegador) e o bloco "after the review F7" do `tests/unit/calc-defs.test.ts` (3 testes). O nome `calc-form` põe o spec antes do `design.spec.ts`, numa parte leve do WebKit (§ 142).

## § 275 · As tabelas abertas do resultado cabem a 320 px, sem coluna fixa (F7, revisão f-1 e f-2)

- **O defeito:** a 360 px, o último cabeçalho das tabelas abertas (§ 260) ficava grudado na borda direita e aparecia sobre outra coluna. O "Your BMI" ficava sobre a faixa do CDC, e o "Square feet" sobre o tamanho da área. A regra vinha das tabelas por ano (F4, DES-10), em que o saldo do fim do ano também fica fixo; nas tabelas abertas as células não ficavam.
- **A segunda parte:** a Ovulation (842 px numa moldura de 324) e a Due date (434 px) escondiam a resposta atrás da rolagem lateral.
- **A decisão:** uma tabela sem grupos por ano ganha a classe `fo-amort--flat`. Ela não tem coluna fixa, o texto das células quebra linha, e o respiro lateral cai para 8 px abaixo de 480 px. As tabelas por ano do dinheiro não mudam.
- **A Ovulation passa a 3 colunas:** janela fértil, ovulação e próxima menstruação. A coluna "Cycle starts" repetia a próxima menstruação da linha de cima e, na primeira linha, o dia digitado. A legenda já dizia essas três coisas. Com as 4 colunas e a quebra de linha, a tabela pedia 349 px a 320.
- **O teste:** a 320 e a 360 px, nas 11 páginas e nos dois navegadores, a moldura não rola para o lado, e cada cabeçalho fica sobre as células da própria coluna.

## § 276 · O erro de faixa de um campo deixa o resultado velho, com o PDF e o CSV desligados (F7, revisão g-1 e a-2)

- **O defeito:** a § 116 diz que um valor inválido mantém o último resultado "com a linha 'Fix the highlighted field to update the result.'", e a § 139 desliga o PDF e o CSV com o resultado velho. Mas o erro de faixa de um campo nunca chegava ao estado da calculadora. Só um problema entre campos (o `atMost`, a entrada maior que o preço) marcava o resultado velho. Sem a linha, o PDF e o CSV seguiam ligados.
- **Na saúde:** com idade 16 no BMI, a página seguia com o resultado de adulto e baixava um PDF com "Age 35 years", a idade do exemplo.
- **A decisão:** o `CalcField` e o `DateField` avisam o store (`wrong(id, is)`) quando mostram ou deixam de mostrar o erro de faixa, e quando somem da tela. O resultado fica velho enquanto houver um campo assim, e aparecem a linha e o PDF e o CSV desligados, como a § 116 e a § 139 dizem.
- **Vale para todas as calculadoras,** também as de dinheiro: é a regra da F4 cumprida, não uma regra nova.
- **O teste:** a idade abaixo do mínimo no BMI, no Calorie e no Body fat, a quantidade 0 no Concrete e um dia fora da faixa na Due date mostram a linha e desligam o PDF e o CSV. O valor certo devolve os três.

## § 277 · Os campos estreitos mostram o número, o menu e a data inteiros (F7, revisão d-2, f-3, f-4, f-5, d-3 e f-6)

- **O número:** a cobertura da Paint mostrava "35(" a 360 px e "3" a 320, ao lado de "sq ft/gal". Os máximos da faixa também saíam cortados em campos de meia largura: "20,000" no Tile, "2,500" no BTU, "120" na idade e "0.45" no Concrete a 320 px.
  - Abaixo de 390 px, o respiro do campo cai de 16 para 12 px e o da unidade para 8 px; abaixo de 360 px, o do campo cai para 8 px.
  - O campo da Paint passa a "Coverage per gallon", com a unidade "sq ft".
- **O menu:** o texto escolhido saía cortado.
  - "Length × width" na Mulch, em toda largura; "Rectangle" numa área a 360 px; "Room walls" e "Last period" a 320 px; "IVF, day-3 embryo" a 360.
  - O respiro direito do menu cai para 8 px (a seta nativa fica dentro da caixa).
  - Os rótulos passam a "Dimensions", "IVF, day 3" e "IVF, day 5". A explicação da transferência segue no texto da página.
- **A data:** o ano saía cortado a 320 px ("07/09/202").
  - Abaixo de 360 px, um menu ou uma data dos campos principais ocupa a linha inteira.
  - O resultado acima da dobra segue medido a 360 px (§ 124), onde nada muda de linha.
- **A altura do menu:** o menu esticava até 102 px quando o campo ao lado mostrava erro. Ele passa a ficar no `.fo-field__body`, como o número e a data.
- **Os testes:**
  - a 320 e a 360 px, nas 11 páginas, cada número visível mostra inteiros o exemplo e o máximo da faixa (`scrollWidth ≤ clientWidth`);
  - cada opção de cada menu cabe à esquerda da seta, medida com a fonte do próprio menu;
  - abaixo de 360 px, o menu e a data ocupam a linha;
  - na Paint, o menu não muda de altura com o erro do campo ao lado.

## § 278 · O link do cenário não leva o foco para a última área (F7, revisão a-1)

O efeito da lista de áreas movia o foco para a última linha sempre que a lista crescia. Abrir um link da Square footage com 10 áreas levava o foco ao menu da décima e rolava a página 2.604 px. Agora só o clique no "Add an area" de baixo do resultado marca a lista (`addedBelow`), e só essa marca move o foco. As linhas que o link traz, lidas depois da hidratação, deixam o foco e a rolagem onde estão. O teste abre o link com 3 áreas e confere o foco fora da lista e o `scrollY` em 0. Depois, o "Add an area" leva o foco ao menu da quarta área.

## § 279 · A unidade do campo entra na descrição dele (F7, revisão d-1)

A unidade (ft, in, sq ft, cu ft, %, years, days) só existia num `span` visual: o leitor de tela dizia "Thickness, 4" no Concrete, que mistura pés e polegadas. Agora o prefixo e o sufixo têm `id` e entram no `aria-describedby` do campo, antes do erro e da ajuda. O menu de unidade da entrada (dinheiro) tem o próprio `aria-label` e não muda. O teste confere, nas 11 páginas, que a descrição de cada campo com unidade contém a unidade.

## § 280 · A opção escolhida no alto contraste e o placeholder do QR (F7, revisão d-8 e d-9)

- **O alto contraste:** no modo de cores forçadas, o fundo e a borda da opção escolhida do OptionGroup somem. US e Metric, ou On e Off, ficavam iguais.
  - Ali a opção escolhida ganha um sublinhado de 3 px (`text-decoration`, que segue a cor do texto forçada). Nenhuma cor de sistema entra no CSS.
  - O teste emula `forcedColors: 'active'` no Chromium. O WebKit não emula o modo, então ali o teste confere o fundo da opção escolhida.
- **O placeholder do QR:** os navegadores pintam o placeholder com a cor do texto a 50% de alfa. Isso dá 3,34:1 no tema claro.
  - A caixa do QR usa `--ink-muted` com opacidade 1, como a busca já fazia.
  - O teste mede 4,5:1 ou mais nos dois temas.

## § 281 · O Body fat sem "0 %", a fórmula na frase do resultado e a Privacidade com as escolhas (F7, revisão f-7, g-3 e b-1)

- **O "0 %":** medidas que a equação da Marinha não aceita mostravam "Body fat 0 %" no número grande, um valor de saúde falso. Agora o número é um travessão, sem unidade, como nos problemas das calculadoras de dinheiro.
- **A fórmula:** o sexo da fórmula fica depois do resultado no celular (§ 268), e a frase do Calorie e do Body fat não dizia qual fórmula fez o número. Com as mesmas medidas, o Body fat dá 25,9% pela feminina e 10,9% pela masculina. Agora a frase diz "By the female formula" ou "with the male formula", com a palavra em negrito. O `lint:texto` ganhou a amostra `sex`.
- **A Privacidade:** a página prometia que o link copiado levava "só" números e datas. Mas ele leva também as escolhas: a unidade, o sexo da fórmula, a forma de contar a data do parto, a forma do concreto e o resto.
  - O texto passa a dizer isso nos três idiomas.
  - As notas de privacidade do Calorie, do Body fat e da Due date também.
  - A data de atualização continua 2 de novembro de 2026.
- **Os testes:** no `calc-defs.test.ts`:
  - o problema do Body fat sem algarismo;
  - a palavra da fórmula em negrito na frase, nos dois sexos;
  - o texto das escolhas na Privacidade em en, pt e es e nas três notas.
