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
