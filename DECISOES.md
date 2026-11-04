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

## § 282 · A segunda passada da revisão da F7 (F7, segunda passada, s-1 e s-2)

Um revisor Sonnet em contexto limpo leu só o diff das correções (`69fb7f3..083f5a7`), na worktree da revisão, movida para o `083f5a7` e com o próprio build. Ele rodou o Vitest, os tipos, o lint, os portões, o `lint:texto` e 946 testes de Playwright por navegador. Não achou falha em nenhuma correção e deixou 2 achados baixos.

- **s-1:** a regra da § 277 que põe um menu ou uma data na linha inteira abaixo de 360 px pegava qualquer campo de meia largura com um `select` dentro.
  - Isso incluía a entrada (número com o menu de unidade) e os menus das calculadoras de dinheiro.
  - A 320 px, o resultado da hipoteca descia de 658 para 754 px; o mesmo valia para a APR, o cartão, a meta de poupança, os juros simples e a hipoteca em espanhol.
  - A regra passa a valer só nas páginas de casa e saúde: o painel delas ganha a classe `fo-calc--home`, que vem do `cat` da página. As de dinheiro voltam ao que eram.
  - O teste novo do `calc-form.spec.ts` abre as calculadoras de dinheiro em en, es e pt a 320 px e confere que nenhum campo de meia largura ocupa a linha. Ele reprova no build do `083f5a7` (a entrada da hipoteca, o menu do cartão e outros) e passa no novo.
- **s-2:** o teste do erro de faixa (§ 276) não tinha calculadora de dinheiro, embora a regra valha para elas.
  - Entraram a hipoteca com taxa 99, em inglês e em espanhol, e o empréstimo pessoal brasileiro com valor 0, cada um com a linha no idioma da página.
  - Esses casos reprovam no código revisado (`69fb7f3`), onde o erro de faixa não marcava o resultado velho.
- **Observações sem defeito**, que ficam no relatório:
  - uma corrida de foco na lista de áreas e de dívidas, anterior à F7, que só a automação alcança (menos de 16 ms entre digitar e apertar Enter no "Remove");
  - datas da tabela da Ovulation que quebram no meio a 320 px ("November / 1, 2026");
  - a etiqueta "example" que desce de linha em "Coverage per gallon";
  - a folga de 3 px do teste dos menus na Square footage a 360 px, que supõe uma seta de 26 px.

## § 283 · As partes 2 e 7 do WebKit passaram do alvo de 700 s, uma vez cada (F7, decisão 10)

- **A parte 2 do WebKit** (`--playwright=webkit --shard=2/8`) tem a segunda metade do `a11y.spec.ts` (100 testes) e o começo do `ads.spec.ts` (46 testes). O `a11y` dessa metade é o mais pesado: o passeio de estados das ferramentas de PDF (de 18 a 37 s por teste no runner).
- **A parte 7 do WebKit** tem os `money-*` (os três da F7 entre eles, com uns 200 s de testes) e 43 testes da matriz de PDF, que somam 740 s sozinhos.
- **As medidas** (o total do `verificar` da parte, do resumo no log):

  | Execução | Parte 2 | Parte 7 |
  | --- | ---: | ---: |
  | [run 41449325645](https://github.com/vmatusita/fileorca/actions/runs/41449325645) (`69fb7f3`) | **833,1 s** (1.243 s de `a11y` e 363 s de `ads` somados, em 2 workers) | 692,4 s |
  | [run 41459127177](https://github.com/vmatusita/fileorca/actions/runs/41459127177) (`083f5a7`) | 690,0 s | 653,5 s |
  | [run 41465872919](https://github.com/vmatusita/fileorca/actions/runs/41465872919) (`9d09714`, o código final) | 600,8 s | **730,0 s** |

  As outras 11 partes ficaram abaixo de 700 s nas três.
- **A leitura:** as duas partes estão perto do alvo e variam de 70 a 230 s de um runner para outro, com os mesmos testes. Nenhuma passou do limite de 900 s, então a divisão desta run fica como a ficha fixou (13 partes).
- **A proposta,** numa run de ajuste, antes de somar testes de acessibilidade, de dinheiro ou de PDF:
  1. tirar o passeio de estados do `a11y.spec.ts` para um arquivo próprio que caia depois do `ads.spec.ts` na ordem dos nomes (por exemplo, `axe-states.spec.ts`). Assim, os testes pesados se dividem entre as partes 3 e 4 do WebKit, hoje mais leves (de 245 a 432 s);
  2. o WebKit em 9 partes, que também tira peso da parte 7.

  Antes de escolher, rode o `--list` das partes e confira onde caem o `design.spec.ts` e a matriz de imagens (§ 142).

## § 284 · A abertura da F8: o prompt, o primeiro push e a prova do aviso de deploy (F8, decisão 15)

- **O prompt:** os dois arquivos `docs/prompts/prompt-fase-08.md` e `.txt` não estavam na pasta antes da branch. A run gravou o prompt como recebeu em `docs/prompts/prompt-fase-08.txt`, como a ficha manda nesse caso, e ele entrou sozinho no primeiro commit (`15fab5b`). Não há `.md`.
- **A prova:** com a branch no GitHub, `gh workflow run pos-deploy.yml --ref main -f commit=15fab5b2419980d6fba683ec88c8480e576e5e74 -f wait_minutes=2` ([execução 41488759711](https://github.com/vmatusita/fileorca/actions/runs/41488759711)). O checkout com `fetch-depth: 0` achou o commit da branch, sem erro de `rev-parse`; o log tem "Esperando … (até 2 min)", quatro "build.txt traz 29afbce, ainda sem 15fab5b" e "O deploy de 15fab5b não chegou em 2 min."; o passo "Abrir issue" ficou verde e abriu a [issue #16](https://github.com/vmatusita/fileorca/issues/16), comentada.
- **Antes do disparo,** a leitura do `scripts/ci/pos-deploy.ts`: a espera que não chega sai com `process.exit(1)` antes do `checkProduction` e do IndexNow.
- **A repetição:** a run mudou o `pos-deploy.yml` (o responsável da issue, § 301), então a prova rodou de novo com `--ref fase-08` ([execução 41497600846](https://github.com/vmatusita/fileorca/actions/runs/41497600846)), com as mesmas linhas no log e a [issue #17](https://github.com/vmatusita/fileorca/issues/17) já atribuída ao Victor, comentada.

## § 285 · A estratégia do cache do service worker (F8, decisões 4 e 5)

- **A tabela** (`src/sw/logic.ts`, `strategyFor`):

  | Pedido | Estratégia | Entra no cache? |
  | --- | --- | --- |
  | Outra origem | sem `respondWith` | nunca |
  | Mesma origem, método diferente de GET (fora o compartilhar) | sem `respondWith` | nunca |
  | POST na ação do compartilhar | a caixa de entrada e um 303 para a página em GET (§ 290) | só na caixa |
  | Pedido com `Range` | sem `respondWith` | nunca |
  | `/build.txt`, `/cdn-cgi/*`, `/ads.txt`, `/robots.txt`, `/sitemap*.xml`, a chave do IndexNow, `/sw.js` | sem `respondWith` | nunca |
  | Navegação | rede primeiro; sem rede, a cópia; sem cópia, a página offline do idioma, depois a de outro idioma guardada | 200 `basic` sem redirecionamento |
  | `/_astro/*` | cache primeiro (o nome leva o hash) | 200 `basic` sem redirecionamento |
  | O resto da mesma origem | rede primeiro, com a cópia como reserva | 200 `basic` sem redirecionamento |

- **A navegação usa `fetch(event.request)`:** o 307 do `auto-trailing-slash` volta como `opaqueredirect`, que o navegador segue; nunca entra no cache. Responder uma navegação com uma resposta `redirected: true` daria erro de rede no Chromium e no WebKit (a exploração mediu).
- **A primeira página:** o worker não existia quando ela carregou. O script de registro manda, quando o worker ativa, o endereço da página e os arquivos dela: as tags (`script[src]`, a folha de estilo, os preloads, o manifest e o ícone) e o que o `performance` lista. Nunca os `alternate` e o `canonical`, que são outras páginas. O worker passa a lista pela mesma regra (`warmList`) e busca o que falta, quase tudo do cache HTTP. As tags entraram porque o relógio falso do Playwright esvazia o `performance` no WebKit (o teste do Due date achou), e uma página real pode ter o mesmo problema.
- **O motor** entra no cache quando a ferramenta o carrega com rede, no primeiro arquivo, como qualquer `/_astro/*`. Nada se baixa só para o offline, fora a página offline do idioma e os arquivos dela (§ 289).
- **Alternativas:** cache primeiro para todo GET (o online passaria a servir cópia velha de HTML e de manifest); guardar o site de antemão (fora da ficha).

## § 286 · A chave e o que nunca entra no cache (F8, decisão 5)

- **A chave** é `origin + pathname` em todo `put` e `match`, sem `?` e sem `#`. O `#` chega no `request.url` da navegação nos dois navegadores (exploração); a chave o tira antes de qualquer coisa.
- **Nunca entra:** os caminhos que o build passa em `SW_CONFIG.never` (`src/platform/build-files.ts`, `SW_NEVER`: `/build.txt`, `/ads.txt`, `/robots.txt`, `/sw.js` e `/<chave do IndexNow>.txt`), mais `/cdn-cgi/*`, os sitemaps e as entradas sintéticas da caixa. Resposta 206, 404, opaca, `opaqueredirect` ou redirecionada nunca entra (`isCacheable`).
- **Prova:** `tests/unit/sw-logic.test.ts` e o `tests/e2e/sw-privacy.spec.ts`, que lê as chaves de todos os caches depois de links do cenário, números, arquivos e um compartilhar.

## § 287 · O arquivo `/sw.js`, o registro e o cabeçalho (F8, decisão 6)

- **O build:** `src/sw/build.ts` costura `src/sw/shared.ts`, `logic.ts` e `main.ts` num script clássico: o compilador do `typescript` (já é dependência) tira os tipos, os `import` relativos e os `export` saem, e tudo vai numa função depois do `SW_CONFIG` (o commit do `build.txt`, as páginas offline e os arquivos delas, as ações do compartilhar e os caminhos de `never`). Um `import` ou `export` que ele não sabe juntar reprova o build. O `typescript` vem por `createRequire`: o gancho `astro:build:done` roda depois que o Astro fecha o carregador de módulos do Vite, e um `import()` ali falha.
- **Por que não o Vite:** um chunk emitido pelo Rolldown dividiria módulos com a ilha; o `?worker&url` dá nome com hash dentro de `/_astro/`, e a ficha pede `/sw.js` na raiz, com escopo `/`. O nome não tem "worker" (o orçamento reprova).
- **Os tipos:** `main.ts` declara os tipos do worker que usa, sem `lib: webworker`, que brigaria com o DOM no mesmo `tsconfig`.
- **O registro:** um script inline no `BaseLayout` (`src/platform/sw-register.ts`), depois do `load`, só onde há `serviceWorker`. Ele nunca espera o `ready`: com `serviceWorkers: 'block'` o `register()` resolve `undefined` e o `ready` nunca resolve.
- **O cabeçalho:** `/sw.js` com `Cache-Control: no-cache`, conferido pelo `gate:cabecalhos`, que também exige o `dist/sw.js`. O `gate:worker` passa a afirmar que o `sw.js` é o arquivo que o `src/sw/build.ts` gera, sem `import` nem `export`, e que o `wrangler.jsonc` não o cita: é arquivo estático dos assets, não código de Worker.

## § 288 · A desativação de emergência (F8, decisão 7)

- **A constante:** `SW_ENABLED` em `src/platform/site.ts`. Com `false`, o build grava o mesmo script com `enabled: false`: no `install`, `skipWaiting`; no `activate`, apaga todo cache `fileorca-*` e se desregistra; sem `fetch`, tudo vai à rede. O `BaseLayout` deixa de registrar.
- **O manifest perde o `share_target`** com a desativação: sem worker, o POST do Android cairia no 405 do Cloudflare.
- **Sem recarregar as abas abertas:** um `client.navigate()` faria a pessoa perder o arquivo que estava processando. As abas abertas param de usar o cache na hora (sem `fetch`) e saem do controle na próxima navegação.
- **Prova:** `tests/e2e/sw-killswitch.spec.ts`, com o servidor do teste trocando o `/sw.js` pela versão com `enabled: false` e depois pela normal, nos dois navegadores.

## § 289 · A página offline (F8, decisão 8)

- **Os slugs:** `/offline/`, `/pt/offline/` e `/es/sin-conexion/`, pelos glossários ("offline" em pt, "sin conexión" em es). O título em pt é "Sem internet", porque "Offline" repetia o do inglês (o `gate:conteudo` reprova título repetido).
- **O que mostra:** o H1, o `OliMessage` offline (`buoy`, `role="status"`, tom `surface`) dizendo que esta página ainda não foi guardada, a lista das páginas guardadas (um script inline que lê o cache e o `<title>` de cada página, como texto, sem as páginas offline e do compartilhar) e o link da home.
- **O que o worker guarda:** no `install`, a página offline do idioma das janelas abertas, com a folha de estilo e as duas fontes latinas dela (lidas do HTML e do CSS do build). Cada navegação guardada garante a do idioma dela.
- **O desvio da tabela de falas:** a linha "Offline" ("No internet? No problem, Oli works offline.") prometia que tudo funciona offline. Ela passa a dizer "No internet? Oli keeps working on the pages you already opened." em `docs/design/README.md` e nos glossários. O `PLANO-FILEORCA.md` (linha 289) não pode ser editado (`.claude/settings.json`) e fica com a frase antiga: este § é o registro.

## § 290 · O compartilhar: a página "Abrir com", a caixa de entrada e a entrega (F8, decisões 1 e 10)

- **Os slugs:** `/open-with/`, `/pt/abrir-com/` e `/es/abrir-con/`.
- **A caixa:** o Cache Storage `fileorca-inbox`, com as entradas `/__fileorca-inbox/<n>` (um contador, nunca o nome), o nome codificado e a hora em cabeçalhos. Cache Storage em vez de IndexedDB: a página e a ilha leem com a mesma API do resto, sem código de IndexedDB.
- **O prazo:** uma hora. A caixa se apaga depois da entrega, no `activate` de um worker novo, e depois do prazo (o worker confere em cada navegação; a página e a ilha ignoram entrada vencida).
- **A escolha:** o clique num cartão grava no `sessionStorage` da aba `{tool, order}`, sem nome de arquivo. A ordem põe primeiro os arquivos que a ferramenta aceita, para uma ferramenta de um arquivo receber um que ela abre.
- **A entrega:** `takeInbox(page)`, em `src/tools/image/inbox.ts` (no chunk `island`), chamado na montagem do `ImagePanel` e do `PdfPanel`: os arquivos vão ao `startBatch` e ao `addFiles`, o caminho do soltar, e a recusa na linha é a de hoje.
- **A página:** os 20 cartões (8 de imagem e 12 de PDF) saem do registro no build, escondidos, com o `ToolCard` (que ganhou um `slot` para a linha "Abre N de M arquivos"). O script (`src/share/client.ts`) lê os primeiros 64 KB de cada arquivo e usa os `sniff` dos motores. Ele não importa nada do chunk `island`: os nomes da caixa vêm de atributos da página, e o tamanho é escrito por uma cópia do `fileSize()` que o `tests/unit/open-with.test.ts` compara com a original. A página carrega 2 arquivos JS: a entrada e o chunk `sniff`, que o chunk preguiçoso `process` também importa.
- **O servidor nunca recebe o POST:** o `serve-dist` responde 405 a método diferente de GET e HEAD, como o Cloudflare (a exploração mediu no `wrangler dev`), e o teste confere o log do servidor.

## § 291 · O manifest: o `id` e o `share_target` (F8, decisão 9)

- **O `id`** é o `start_url` de hoje (`/`, `/pt/`, `/es/`), escrito: quem já instalou continua com o mesmo app.
- **O `share_target`:** a ação da página "Abrir com" do idioma, `POST`, `multipart/form-data`, um campo `files` com o `accept` de `shareAccept()` (`src/share/tools.ts`): os tipos e as extensões de JPG, PNG, WebP e HEIC (as ferramentas de imagem) e o PDF. Sem `text` nem `url`.
- **Prova:** `tests/unit/open-with.test.ts` (os três manifests contra os registros) e o teste dos manifests no `tests/e2e/share-target.spec.ts` (os ícones e a ação respondem 200 no `dist/`).

## § 292 · A fala offline numa ferramenta guardada sem o motor (F8, decisão 4)

- **Imagem e PDF:** quando todo arquivo falhou com `load` e o navegador diz que está offline (`navigator.onLine === false`), a zona de soltar vai ao estado `offline`: `role="status"`, a `buoy`, o ícone `offline` e o texto "No internet, and this tool isn't fully saved yet. Use it once with internet and it'll work offline too." A linha de cada arquivo diz "Oli needs the internet once to open {name} here." Com rede, a fala de hoje ("recarregue a página") não muda.
- **A `buoy` nas páginas:** só nas que têm as ilhas de imagem e de PDF (`FILE_PANEL_POSES`: as ferramentas e os guias de arquivo), e o `gate:design` exige a pose onde há zona de soltar.
- **As calculadoras:** o PDF delas carrega o gerador só no clique. Offline, sem o gerador guardado, o `ExportBar` diz "No internet, and the PDF maker isn't saved yet. Download a PDF once with internet and it works offline too." em vez de "recarregue a página". O CSV não depende de nada.

## § 293 · A troca de versão: os caches velhos saem, sem navigation preload (F8, decisão 5)

- No `activate`, o worker apaga todo cache `fileorca-*` que não é o da versão dele, inclusive a caixa de entrada. Os `/_astro/*` não atravessam versões.
- `skipWaiting` e `clients.claim` nos dois modos. Uma aba antiga que pedir um chunk que o deploy apagou recebe a fala `load` de hoje.
- **Sem navigation preload:** ele só ajuda quando a resposta vem da rede, e o ganho (50 a 250 ms de partida do worker) não paga o código a mais. Fica registrado.
- **Prova:** o segundo teste do `sw-killswitch.spec.ts` troca o `/sw.js` por um de outra versão e confere que só o cache novo fica.

## § 294 · Os testes do service worker (F8)

- **`serviceWorkers: 'block'`** é o padrão do `playwright.config.ts`: com o worker, o `page.route` e o `context.route` deixam de ver o que ele responde. Os specs `sw-offline`, `sw-privacy`, `sw-killswitch` e `share-target` ligam com `test.use({ serviceWorkers: 'allow' })`.
- **Um servidor por teste** (`tests/e2e/lib/sw-server.ts`, com a lógica do `serve-dist`): origem limpa, troca do `/sw.js`, e a rede desligada de verdade (o servidor fecha e derruba as conexões), com `context.setOffline(true)` para o `navigator.onLine`.
- **WebKit:** os specs rodam nos dois navegadores. Onde o WebKit difere, o teste ramifica por dentro: ele não informa os pedidos do worker (a prova de "nada sai" pelo worker é do Chromium, e a regra é provada no Vitest), e o `setOffline(false)` não chega ao worker (a volta da rede numa ferramenta sem motor é afirmada só no Chromium).
- **O relógio:** o Due date é guardado com o relógio real e conferido offline com o relógio fixado, porque o relógio falso do Playwright esvazia o `performance` no WebKit.

## § 295 · O GA4 na F8: nenhum evento novo (F8, decisão 19)

- Nenhum evento novo. O uso da "Abrir com" não é contado: a ficha não pede, e o evento teria de passar pelas listas fechadas sem levar dado de arquivo. Offline, o `gtag` não é carregado de novo (a cópia da página traz o `dataLayer`, e o script do Google é de outra origem, que o worker não guarda); nada fica numa fila.

## § 296 · O leitor de YAML dos testes (F8)

- `tests/unit/lib/mini-yaml.ts` lê o subconjunto que os arquivos do repositório usam (mapas, listas, listas em linha, aspas, comentários e blocos `|` e `>`), e recusa âncora, chave repetida, recuo estranho e mais de um documento. Os testes do `dependabot.yml`, do `ci.yml` e dos eventos de merge o usam. **Por quê:** a ficha pede o teste sem dependência nova, e não há parser de YAML entre as dependências.

## § 297 · Os eventos de exemplo da regra de merge (F8, decisão 13)

- **As fixtures:** 16 arquivos em `fixtures/merge-events/`, cada um com o payload `pull_request` só com os campos que o job lê, os arquivos do `git diff` (ou um rename que o teste refaz num repositório de rascunho) e a saída do `fetch-metadata` (`update-type`, o maior do grupo, e `dependency-group`).
- **O caminho do job:** o `tests/unit/merge-events.test.ts` lê o job `merge` do `ci.yml`, monta o `env` do passo Decide a partir do evento, roda o `git diff --no-renames` do job no rename, roda o `jq` do próprio `ci.yml` onde ele existe (no Ubuntu é obrigatório: o teste reprova sem ele no Linux) e compara com a versão em TypeScript, e roda o CLI com o `GITHUB_OUTPUT`. No Windows, sem `jq`, o teste confere que o `jq` do `ci.yml` é o da main.
- **A chamada do CLI não muda:** o job roda o `pode-mesclar.ts` da base; uma chamada nova chegaria ao script velho e a PR ficaria vermelha. O teste fixa a chamada, o `git diff` e o `jq` da main.

## § 298 · O `.github/dependabot.yml` (F8, decisão 11)

- **Ecossistemas:** `npm` (o pnpm é lido pelo `pnpm-lock.yaml`, lockfile 9.0) e `github-actions`, os dois em `/`.
- **Agenda:** `monthly` (dia 1), às 06:00 de São Paulo (`timezone: America/Sao_Paulo`). O `day` só vale para `weekly`.
- **`cooldown: { default-days: 7 }`:** nada publicado há menos de uma semana. Sem configurar, o padrão seria 3 dias.
- **`open-pull-requests-limit`:** 3 no npm (o grupo e até duas majors; a primeira leva de hoje tem uma major fora dos `ignore`), 1 nas actions. Cada PR roda o CI inteiro (uns 135 minutos de Actions com 15 partes).
- **`versioning-strategy: increase`:** reescreve a versão exata e o `~` para a nova, em vez de juntar com `||`.
- **`commit-message`:** `chore` no npm (`chore(deps): …` e `chore(deps-dev): …`) e `ci` nas actions, com `include: scope`.
- **`labels: []`:** o Dependabot criaria os rótulos `dependencies` e `javascript` no repositório, que é configuração fora do repositório.
- **`ignore`, cada um com a razão escrita em cima:**
  - `@types/node` major: segue o major do `.node-version` (§ 17 e § 37);
  - `typescript` minor e major: o `typescript-eslint` aceita até `<6.1.0` e o `@astrojs/check` só o 5 e o 6 (§ 17); TypeScript sobe numa run;
  - `qrcode`, inteiro: o `qrcodeEsm()` reescreve o `lib/core` dele por versão, e o aviso de licença é fixado por SHA-256 (§ 271).
  - O `packageManager` não é dependência para o Dependabot: não precisa de `ignore`, e o pnpm sobe à mão.
- **O que não entra:** revisores, `pull_request_target`, segredos. `rebase-strategy` fica no padrão: com o limite de 3 PRs, os rebases são poucos, e sem rebase a PR com conflito no lockfile não se mesclaria.
- **Prova:** `tests/unit/dependabot.test.ts`. O GitHub só valida o arquivo depois do merge na main: tarefa do Victor no `OPERACAO.md`.

## § 299 · O ensaio do Dependabot (F8, decisão 12)

- **Onde:** uma worktree descartável de `dda73f2` (a `fase-08` da hora), removida no fim. Nenhuma dependência mudou na branch.
- **A leva de minor e patch de hoje** (estratégia `increase`): `astro` 7.4.4 → 7.4.5, `preact` 11.1.0 → 11.1.1, `wrangler` 4.156.0 → 4.156.2, `eslint` ~10.13.0 → ~10.14.0, `pdfjs-dist` 6.4.299 → 6.5.438 e `vitest` 5.0.5 → 5.1.0. As fixadas em versão exata (`qrcode`, `@types/qrcode`, `gifenc`, `jsqr`) já estão na última. Com o `cooldown` de 7 dias, um ciclo hoje levaria só o `eslint`; o de 1º de dezembro leva as seis.
- **O que quebrou e o destino de cada falha:**
  1. **O PDF.js 6.5 chama `canvasFactory.getNoAlphaContext()` no `render()`,** e a `OffscreenFactory` do motor (`src/engine/pdf/pdfjs.ts`) não tinha o método: todo desenho de página no worker do Chromium falhava com "This browser couldn't write the new PDF". **Destino:** a correção entrou nesta run (o método, que a 6.4 já fazia pelo canvas, e um teste no `pdf-hardening.test.ts` que exige nas fábricas do motor todo método público das fábricas-base do PDF.js instalado). Um `ignore` do `pdfjs-dist >= 6.5.0` seguraria também as correções de segurança do PDF.js, por isso não.
  2. **O build legacy do PDF.js 6.5 traz o core-js 3.51.0,** e a /licenses tem o texto do 3.50.0: reprovam o `gate:licencas` e o `licenses.test.ts`. O texto da licença é o mesmo (SHA-256 igual), mas a regra da § 179 pede o texto da versão. **Destino:** (a) o teste dos arquivos reais passa a ler a versão do `src/platform/licenses.ts` em vez de repetir o literal; (c) recopiar o texto e trocar a entrada é um passo do `docs/OPERACAO.md` ("Depois de certas PRs"), numa run curta antes de a PR do grupo ficar verde.
  3. **Um teste do `pdf-engine-ops.test.ts` estoura os 5 s** com a suíte inteira e a máquina carregada pelas lentes da revisão, com e sem a atualização (2 de 3 rodadas em cada). Sozinho, leva 1,3 s. **Destino:** nenhum do Dependabot; vai para o `PENDENCIAS.md` (o tempo do teste não muda).
- **Depois dos ajustes:** todos os portões verdes (o `lhci` com desempenho de 99 a 100), o Vitest com 1.460 de 1.460 (com `--maxWorkers=6`, pela falha 3), e o `budgets`, o `image-smoke` e o `pdf-tool` com 152 de 152 no Chromium e no WebKit. O `guias:medir --check` deu zero diferença no PDF to JPG e no Compress forte.
- **A primeira leva de majors:** `typescript` 7.0.2, `@types/node` 26.6.6 e `node-html-parser` 9.0.6. Com os `ignore` do `typescript` e do `@types/node`, sobra uma PR de major (o `node-html-parser`), que fica para o Victor. Por isso o limite de 3 PRs abertas no npm.
- **Nenhum `ignore` novo saiu do ensaio.**

## § 300 · O alerta de CI vermelho numa PR do Dependabot (F8, decisão 14)

- **O job `alerta-dependabot`** no `ci.yml`: `needs: [verificar, playwright, merge]`, `if: failure() && github.event.pull_request.user.login == 'dependabot[bot]'`, `permissions` só `issues: write` e `pull-requests: write`. Sem checkout: só o `gh`, com o número da PR, nunca o título nem a branch.
- **O `merge` no `needs`,** além do que a ficha pediu: uma falha do `fetch-metadata` ou do `gh pr merge` numa PR do Dependabot também avisa.
- **Uma issue por PR:** "CI vermelho na PR #N do Dependabot", procurada pelo título exato entre as abertas; o próximo vermelho da mesma PR vira comentário. O job também comenta na PR.
- **Prova:** o `gate:actionlint` e o `tests/unit/ci-workflows.test.ts`. A prova ao vivo só vem com uma PR real vermelha (o `OPERACAO.md` diz o que olhar no primeiro ciclo).

## § 301 · As issues dos workflows atribuídas ao dono do repositório (F8)

- **O achado:** o Victor não assiste o repositório (`subscribers_count: 0`), e o GitHub só manda e-mail de issue para quem assiste, foi atribuído ou mencionado. As issues do `github-actions[bot]` podiam não chegar.
- **A decisão:** todo `gh issue create` dos workflows leva `--assignee "$OWNER"` (`github.repository_owner`): o pós-deploy, as duas do job de merge e o alerta do Dependabot. O `OPERACAO.md` pede também o Watch do repositório.
- **Alternativa:** mencionar `@vmatusita` no corpo. A atribuição é mais limpa e aparece no filtro "Assigned to me".

## § 302 · O WebKit em 10 partes (F8, decisão 2; terceiro adendo da ADR-003)

- **A medida:** na [run 41465872919](https://github.com/vmatusita/fileorca/actions/runs/41465872919), a parte 7 do WebKit chegou a 730 s e a 2 já tinha passado de 700 s (§ 283).
- **A projeção:** com os specs novos (`sw-offline`, `sw-privacy`, `sw-killswitch`, `share-target`), o WebKit em 8 partes passaria de 700 s em 98 % dos sorteios; em 10, a pior parte fica perto de 630 a 650 s. O Chromium em 4 aguenta.
- **A decisão:** WebKit em 10 partes, Chromium em 4 e o `verificar`: 15 partes. O passeio de estados do `a11y` fica onde está (com 10 partes ele não muda a pior parte; vai para o `PENDENCIAS.md` como reserva). Os nomes `sw-*` e `share-target` caem depois de `qr-code`, e o `design.spec.ts` e o `image-matrix.spec.ts` seguem em partes diferentes (§ 142).
- **O teste:** o `tests/unit/verificar.test.ts` lê a matriz do próprio `ci.yml` e confere que as 15 partes cobrem o todo.

## § 303 · O `docs/OPERACAO.md` (F8, decisão 16)

- Uma seção por alerta (como chega, o que quer dizer, o que fazer com os comandos, quando vira run curta), a revisão mensal como lista, a anual, as tarefas de configuração do Victor e o ponteiro para o `PENDENCIAS.md`.
- **Prova:** `tests/unit/operacao.test.ts`: todo `pnpm` citado é script do `package.json` (ou comando do próprio pnpm), todo caminho e workflow existe, os títulos de issue são exatamente os dos workflows, e cada alerta da ficha tem a seção dele.

## § 304 · O `docs/PENDENCIAS.md` (F8, decisão 3)

- A lista única do que ficou aberto, agrupada por tipo de run (saúde e fontes, contas, exportação, texto e voz, acessibilidade, layout, PDF, SEO, testes, desempenho, CI, kit, a 2b, decisões e tarefas do Victor), com id, fonte, severidade, defeito, correção proposta e quem resolve.
- Conferida contra o código de hoje: o que uma fase já corrigiu fica numa seção à parte.
- **Prova:** `tests/unit/pendencias.test.ts`: os itens que a ficha nomeia, as seis colunas de cada linha, e uma linha para cada baixo das duas revisões da F8.

## § 305 · As correções da revisão das F4 a F7 (F8, decisão 17)

- **A revisão:** oito lentes Sonnet sobre o `29afbce`, com céticos por achado (`docs/relatorios/REVISAO-F4-F7.md`): 1 alto, 9 médios (8 defeitos), 19 baixos e 2 refutados depois dos céticos. Nenhum crítico.
- **e-1 (alto): a trilha de navegação e o aviso de cookies com uma face da Figtree que não troca de fonte, e a fonte de reserva recalibrada.**
  - **O defeito:** na primeira visita no celular, uma trilha que cabia numa linha com a fonte de reserva quebrava em duas quando a Figtree chegava (ou passava de duas para três, nos presets), empurrando a ferramenta 22 a 34 px. O CLS ia de 0,12 a 0,27 de 320 a 412 px, e o Lighthouse não via (mede a 412 px, sem atrasar a fonte). Era o e-1 da F7 (§ 274), mais grave.
  - **A correção:** a trilha usa a família `Figtree Steady` (`--fo-font-steady`), um segundo `@font-face` do mesmo arquivo da Figtree, com `font-display: optional`. A trilha fica com a fonte da primeira pintura: na primeira visita lenta, a fonte de reserva até o fim da página; da segunda página em diante (o arquivo já está no cache), a Figtree. O navegador baixa o arquivo uma vez para as duas faces (o `design.spec.ts` conta os `.woff2`), e o `gate:design` aceita essa face só com a URL da Figtree e `optional`. O CSS da trilha volta ao de antes da revisão: ela quebra no celular, como o README do Breadcrumb permite. A `Figtree Fallback` passa de `size-adjust: 99.9%` (a largura da Figtree no peso 300, o padrão do arquivo variável) para 101,2% (um pouco além da largura no peso 500), que tira o resto do deslocamento nos parágrafos.
  - **O aviso de cookies:** o Lighthouse do CI no `2f104be` ([execução 41521634445](https://github.com/vmatusita/fileorca/actions/runs/41521634445), parte `verificar`) reprovou o CLS em 6 das 10 URLs, de 0,095 a 0,100, e o elemento era o `#fo-cookie`: com 101,2%, o texto do card fixo no pé da tela quebrava diferente nas duas fontes, e o card crescia quando a Figtree chegava. Com 99,9% isso não acontecia, e as varreduras não viam porque gravavam o consentimento antes de abrir a página. O `.fo-cookie` redefine `--fo-font-text` para a face que não troca, e todo texto dele fica com a fonte da primeira pintura. O Lighthouse local voltou a CLS de 0,000 a 0,001 nas 10 URLs. Daí o nome da família: `Figtree Steady`, não só da trilha.
  - **As medidas:** a varredura de 159 páginas, com a Figtree segura até a primeira pintura no Chromium, deu de máximo, antes e depois: 0,201 e 0,032 a 320 px; 0,254 e 0,036 a 360 px; 0,299 e 0,048 a 375 px; 0,195 e 0,041 a 393 px; 0,317 e 0,079 a 412 px. Acima de 0,05 eram 6, 6, 13, 3 e 9 páginas; agora, só uma a 412 px. Como primeira visita de verdade, com o aviso de cookies aberto, os máximos de depois são os mesmos, e os de antes passam de 0,05 em 6, 6, 24, 3 e 11 páginas. Contra 99,9% e 100,5% com a mesma trilha, 101,2% teve o menor máximo em toda largura (99,9% chegou a 0,211 a 375 px, e 100,5% a 0,121 a 320 px). O que sobra a 412 px é o `/pt/privacidade/` (0,077 a 0,079 nas três calibrações): um parágrafo que perde uma linha com a Figtree, abaixo do limite "bom" de 0,1.
  - **O que sobra no WebKit:** o Chromium decide a face `optional` na primeira pintura. O WebKit ainda usa o arquivo que chega no período de bloqueio de 100 ms depois do pedido, e a trilha pode mudar de linha nessa janela (provado: soltar a fonte 100 ms depois do pedido muda a trilha; 160 ms ou mais, não, e a face fica em `error`). Antes, com `swap`, qualquer chegada depois da pintura mudava a trilha.
  - **Alternativas descartadas:** a trilha numa linha só que rola dentro dela (a primeira versão desta correção: a segunda passada achou links e o anel de foco cortados, s-1); reservar a altura de duas linhas abaixo de 480 px (zera o CLS de uma para duas linhas, mas põe o número do resultado de cinco calculadoras de casa e saúde 2 px abaixo da dobra, § 124, e não cobre a passagem de duas para três linhas, 0,14 no `/mortgage-calculator/biweekly/` a 375 px); reservar só abaixo de 360 px (deixa 3 ou 4 páginas por largura perto de 0,2); fontes de reserva por peso (a trilha fica a menos de 1 px da borda, e nenhuma calibração é exata); `font-display: optional` ou o preload na Figtree inteira (mudaria a fonte do texto todo na primeira visita, e o `gate:design` aceita só o preload da Fredoka, § 42).
  - **Teste:** `tests/e2e/layout-shift.spec.ts`. Cada largura (320, 360, 375, 393 e 412 px) leva as páginas que ficaram na borda de uma linha ali nas varreduras, mais as 12 da primeira medida a 360 e 393 px: 51 visitas por navegador, em 8 testes, cada uma num contexto novo. A Figtree é segurada até a primeira pintura (no WebKit, solta 150 ms depois, fora do período de bloqueio), e a trilha e o H1 têm de ficar onde a primeira pintura os pôs, nos dois navegadores; nenhum item passa da largura da trilha. Com a face da trilha em `swap`, 11 dos 16 testes reprovam, nos dois navegadores. O `design-checks.test.ts` prova o portão da face nova.
  - **O CLS somado fica impresso, não julgado:** a primeira versão do teste afirmava CLS ≤ 0,05 no Chromium e passou aqui, mas no Linux do CI ([execução 41521634445](https://github.com/vmatusita/fileorca/actions/runs/41521634445), parte 3 do Chromium) deu 0,060 no `/refinance-calculator/` a 375 px e 0,257 no `/es/calculadora-de-deudas/` a 412 px, onde esta máquina mede 0,001 e 0,046 (aqui, a frase do resultado perde uma linha). O resto do texto ainda troca de fonte, e a fonte de reserva se desenha diferente em cada sistema (no Android, ela é a Roboto, não a Arial da calibração). A correção do e-1 garante a trilha, e é isso que o teste afirma; o CLS de cada página sai no log (`[cls]`, com o que se moveu), e o limite de CLS do projeto segue com o Lighthouse.
- **h-1 (médio):** o Sobre em inglês contava só o compressor de imagem em pt e es. Agora conta as ferramentas de imagem e de PDF, as calculadoras de dinheiro, de casa e de saúde e o QR code, e as versões em pt e es. Teste: `tests/unit/about-counts.test.ts`, contra os registros.
- **h-2 e a-1 (médio):** o CET das calculadoras brasileiras de empréstimo e de veículo saía em notação exponencial com tarifas muito maiores que o crédito. Acima de 10.000.000% ao ano (`CET_YEAR_LIMIT`, em `src/tools/calc/defs/br.ts`) o resultado é um problema, com o texto `cetTooHigh` e o PDF e o CSV desligados. Teste: `calc-defs.test.ts`, "after the review F4-F7".
- **h-3 e a-2 (médio):** no PDF das calculadoras de dívidas em pt e es com 9 ou 10 dívidas, o valor da "Ordem de quitação" era desenhado sobre o rótulo. No `pairs()` de `src/engine/pdf/report.ts`, um valor que não cabe na linha do rótulo (com 12 pt de folga) vai para as linhas de baixo, alinhado à direita; o que cabe sai como antes, com os mesmos bytes. Teste: `calc-report.test.ts`, lido pelo PDF.js com 10 dívidas em pt, es e en. O `pnpm guias:medir --check` não muda (o relatório das calculadoras não é medido pelos guias).
- **d-1 (médio):** nas ferramentas de PDF com botão de ação, o foco ia ao botão depois da leitura e nada era anunciado. O status diz agora os arquivos prontos ("1 PDF ready") ou as recusas ("1 files couldn't be used; the rest are ready."), com as mesmas palavras da tela; no Merge com um PDF só depois das recusas, a recusa e o que ainda falta ("Add at least one more PDF to merge."). Teste: `pdf-tool.spec.ts`.
- **d-3 (médio, subido pelo cético):** com o espaçamento de texto do WCAG 1.4.12, o número e a frase do cartão de resultado saíam do cartão a 320 px, e o texto claro sumia no fundo da página. O número e a frase quebram (`overflow-wrap: anywhere`) em vez de sair. Teste: `calc-form.spec.ts`.
- **d-4 (médio, subido pelo cético):** digitar 425.000 num campo que começa em 10.000 passava por 4, 42, 425 e 4.250, e cada um disparava o alerta de faixa, a linha vermelha e o resultado velho (a página pulava 70 px). O erro de faixa espera agora 800 ms sem tecla (`SETTLE_MS`) ou a saída do campo; um valor válido vai à conta na hora, como antes. O mesmo no campo de data. Teste: `calc-form.spec.ts`.
- **O médio que ficou:** o e-2 (o cartão de resultado das ferramentas de imagem empurra as opções no celular) pede decidir onde ficam as opções no estado de resultado, o que muda o molde da página de ferramenta: vai para o `PENDENCIAS.md`, com os 19 baixos (grupo 16).
- **A segunda passada:** um revisor Sonnet em contexto limpo sobre o diff das correções achou 1 alto, 2 médios e 3 baixos (`REVISAO-F4-F7.md`, "A segunda passada"):
  - **s-1 (alto):** a trilha de uma linha que rola cortava links e o anel de foco a 320 a 393 px. Corrigido com a face `optional` da trilha (acima), que deixa a trilha quebrar de novo; o teste do e-1 confere que nenhum item passa da largura da trilha.
  - **s-2 (médio):** o 101,2% regredia páginas fora da amostra do teste, e o comentário dizia "peso 400". A varredura passou a cobrir as 159 páginas em cinco larguras, o valor foi escolhido pelo máximo dela, o teste leva as páginas da borda de cada largura, e o comentário diz o peso 500.
  - **s-3 (médio):** no Merge com um PDF pronto e um recusado, o status dizia "the rest are ready" e a tela, "Add at least one more PDF". O status junta as duas frases. Teste: `pdf-tool.spec.ts`.
  - **s-4 (baixo):** o rótulo do PDF pode ficar sozinho no pé da página quando o valor desce (hoje não alcançável). Vai para o `PENDENCIAS.md`, grupo 16.
  - **s-5 (refutado):** o revisor leu os limites do IOF e das tarifas em centavos (500.000), mas o `money()` recebe reais: o máximo é 50.000.000 centavos, e os valores do teste do h-2 estavam na faixa. O teste ganhou a prova de que cada valor fica na faixa do campo (`inRange` e `problems()`), com os custos no máximo.
  - **s-6 (baixo, da própria correção):** o comentário do `DECIMALS` ficou acima do `SETTLE_MS` novo, em `src/tools/calc/form.ts`. Voltou para cima do `DECIMALS`: é um defeito do diff desta run, não um baixo do código revisado.

## § 306 · O reflow a 320 px em blocos de páginas (F8, CI)

- **A medida:** na [execução 41521634445](https://github.com/vmatusita/fileorca/actions/runs/41521634445), a parte 6 do WebKit caiu no teste "reflow at 320px: no page and no tool state scrolls sideways" do `design.spec.ts` pelo limite de 60 s. O trace mostra 169 carregamentos em 33,8 s e o lote de imagens do fim parado aos 53 s. Na F7, o teste inteiro levou 36,5 s; a F8 somou 6 páginas (a offline e a "Abrir com" nos três idiomas).
- **Não é carregamento mais lento:** nesta máquina, no WebKit a 320 px, as 159 páginas do `dist/` da main levam 8,8 s, e as 165 da F8, 8,4 s.
- **A decisão:** as páginas vão em blocos de 60, um teste cada, e o estado da ferramenta (o erro, o lote com nomes longos e o botão do ZIP) num teste próprio. As asserções são as mesmas, e o limite de 60 s não muda. Com 168 páginas, são 3 blocos; o `design.spec.ts` segue nas partes 5 e 6 do WebKit, e a matriz de imagens na 7 (§ 142).

## § 307 · As correções da revisão final da F8 (F8, passo 5)

- **A revisão:** cinco lentes Sonnet sobre o `2f104be`, com céticos por achado (`docs/relatorios/REVISAO-F8.md`): 7 altos (4 defeitos), 10 médios, 18 baixos e 4 refutados. Nenhum crítico. Os altos c-1/e-1, c-2/e-2 e c-3/e-4 e o médio e-3 já tinham caído no CI da PR e estão nas § 305 e § 306.
- **b-1 (alto): a página que traz uma versão nova fica no cache novo.** O registro mandava a lista da página ao worker ativo no `load`; a versão nova assumia a página depois e apagava aquele cache, e a página do deploy não ficava guardada (até a próxima visita). O `src/platform/sw-register.ts` manda a lista de novo no `controllerchange`; guardar duas vezes na primeira instalação não faz mal. O script inline passa de 706 para 844 bytes. Teste: o terceiro do `sw-killswitch.spec.ts` não recarrega mais antes de conferir: a navegação traz a versão nova, a página e os `/_astro/` dela estão no cache novo e ela recarrega offline (reprova no `2f104be` nos dois navegadores).
- **a-1 (alto): o compartilhar sem worker.** Sem service worker (a desativação de emergência, ou os dados do site apagados com o app instalado), o Android manda os arquivos de um compartilhar ao fileorca.com, que responde 405 sem guardar nada; a lente mediu o corpo chegando ao servidor nos dois navegadores. A decisão 7 da ficha manda o worker da desativação se desregistrar, e o caso dos dados apagados não tem conserto do lado do site. A correção torna a promessa verdadeira: a Privacidade, nos três idiomas, diz que os arquivos ficam no aparelho pela parte do site que o navegador guarda para o offline, e que, sem ela, o Android os envia ao fileorca.com, que os recusa; a descrição da "Abrir com" em inglês deixa de dizer "never go anywhere else"; o `OPERACAO.md` avisa da janela do app instalado na desativação. Manter por uns 30 dias um worker de plantão que só responde ao POST com um 303 muda a decisão 7: fica para o Victor (`PENDENCIAS.md`, grupo 14). Teste: `tests/unit/privacy-share.test.ts`.
- **a-2: o prazo da caixa.** O worker apaga a caixa vencida na próxima navegação do site, não sozinho. A Privacidade dizia "depois de uma hora" e passa a dizer "na próxima vez que você abrir o FileOrca depois de uma hora". Testes: o `privacy-share.test.ts` e um caso no `share-target.spec.ts` (uma caixa de 10 minutos fica; uma de 65 sai na visita seguinte).
- **b-2: a desativação sem mexer em teste.** Os specs do worker e do compartilhar chamam `workerOff()` (`tests/e2e/lib/sw.ts`) antes do primeiro `controlled()`: com `SW_ENABLED` em `false`, o teste confere por dentro que a página não registra nada e que não há registro nem cache do site, e termina. O teste dos manifests compara o `share_target` com o `SW_ENABLED`, e o do `/sw.js` construído também. Prova: com a constante em `false`, o Vitest inteiro (1.513), os portões do worker e dos cabeçalhos e 266 testes dos specs do worker e de orçamento passam; no `2f104be`, 3 testes de unidade reprovavam.
- **b-4: o redirecionamento e o 404 pelo worker.** Um caso novo no `sw-offline.spec.ts`: o endereço sem a barra segue o 307 até a página (sem chave sem barra no cache), e uma página e um `/_astro/` que não existem dão 404 e não entram no cache. Com o `/sw.js` trocando o `fetch(event.request)` por `fetch(event.request.url)`, ele reprova nos dois navegadores.
- **b-9 e d-1: a lista da página offline.** As funções `isListedPage` e `titleOf` do `src/sw/logic.ts` não eram usadas (a página roda o script de `src/platform/offline-list.ts`) e saíram; o `tests/unit/offline-list.test.ts` roda o próprio script publicado num DOM e num Cache Storage falsos. Cada link da lista ganha o `lang` do caminho (WCAG 3.1.2), pelo `LANG_TAG`.
- **c-4: a parte acima de 700 s.** A parte 2 do WebKit fechou em 721,5 s numa execução e a 1 do Chromium em 756,9 s na seguinte. As duas são do `a11y.spec.ts`, e os 36 passeios de estados das ferramentas de PDF (de 10 a 21 s cada no runner) caíam todos nelas. Eles vão para `tests/e2e/axe-pdf-states.spec.ts`, logo depois do `ads.spec.ts`, e o `--shard` os põe na parte 2 do Chromium e na 4 do WebKit, as mais leves; o `violationsEverywhere()` passa para `tests/e2e/lib/axe.ts`. Nenhuma asserção muda. O `design.spec.ts` segue nas partes 5 e 6 do WebKit e a matriz de imagens na 7.
- **c-5: o PENDENCIAS.md completo.** O baixo F3 a-05 (o APNG vira imagem parada sem nota) faltava; entrou no grupo 4. O `pendencias.test.ts` passa a ler das revisões F3 a F7 cada achado que ficou aberto e exige o id na lista.
- **d-2: a "Abrir com" sem o falso "nada para abrir".** O estado vazio nasce escondido e só aparece quando a leitura da caixa termina vazia ou falha; um `<noscript>` diz o mesmo sem JavaScript. A área da página tem a altura mínima de uma tela, e a lista que entra não empurra o rodapé (o CLS era 0,25). Teste: no `share-target.spec.ts`, cada quadro até os arquivos aparecerem é conferido, e o CLS no Chromium fica abaixo de 0,05 (reprova no `2f104be` nos dois navegadores).
- **Os baixos:** os 18 vão para o `PENDENCIAS.md`, grupo 17.
- **A segunda passada** (`REVISAO-F8.md`, "A segunda passada"): 1 médio e 3 baixos, todos no diff desta run.
  - **s-1:** o `controllerchange` só manda a lista a um controlador que não é o worker que já a recebeu (`c!==w`): na primeira instalação, o aviso a mais fazia o worker baixar de novo a página, o manifest, o ícone e, no WebKit, os 2 JS. O script inline fica com 851 bytes (706 no 2f104be).
  - **s-2:** o teste da fonte atrasada passa a se chamar pelo que afirma (a trilha, o H1 e o aviso ficam no lugar). O CLS do texto que muda de linha fora do Windows (0,257 e 0,125 no Linux do CI) vai para o `PENDENCIAS.md` (F8 s-2): a fonte de reserva é calibrada sobre a Arial, e o Android usa a Roboto.
  - **s-3:** o parágrafo da Privacidade sobre o compartilhar dizia que os arquivos ficam na parte do site guardada para o offline, e o de cima, que nenhum arquivo entra nessa cópia. Os arquivos ficam num lugar próprio do armazenamento, separado da cópia das páginas, e a frase de 47 palavras virou três, nos três idiomas.
  - **s-4:** o teste de ida e volta da desativação falhava em 20 a 30 % das vezes com um worker só, porque o registro do recarregamento se juntava ao da desativação ainda em curso. Ele espera o `/sw.js` da desativação chegar e o registro sumir antes de religar.

## § 308 · O escopo do ajuste "idiomas" (ajuste idiomas, decisão 1)

- **A decisão é do Victor, de 2/nov/2026** (`docs/prompts/prompt-ajuste-idiomas.md`). Ela revoga o "só em inglês" em quatro pontos: a § 58 (as páginas que existiam só em inglês), os guias da F5b (§ 184), as 5 calculadoras em espanhol da F6 (decisão 6) e o QR da F7 (decisão 8).
- **O que entra (40 páginas):** o gerador de QR code em pt e es; em espanhol, as 9 calculadoras dos EUA que faltavam, os 4 presets e os 5 guias de dinheiro, no hub `/es/calculadoras-financieras/`; os 10 guias de arquivo em pt e em es. Cada página nova é a mesma página do inglês, traduzida, com par no hreflang e o x-default no inglês.
- **O que fica de fora, e por quê:**
  - **Casa e saúde** (11 calculadoras e 2 hubs) seguem só em inglês até o gatilho da § 273 (fim do teste de 90 dias, 31/jan/2027): o teste está correndo, e mexer nelas agora o estragaria. A escolha para o gatilho está na § 319.
  - **O dinheiro dos EUA em português:** o público de pt é o Brasil, com as 8 calculadoras adaptadas (F6, decisão 5). Uma hipoteca americana em português não serve a ninguém, e "hipoteca" é termo proibido no glossário de pt.
- **O PLANO:** as linhas 63, 70, 477 e 860 do `PLANO-FILEORCA.md` ("os 15 guias ficam só em inglês", "em espanhol: hipoteca, préstamo…") ficam superadas por esta decisão. Nenhuma delas está nas "Decisões fechadas", e a ficha da run vence o plano (CLAUDE.md, "Fonte de verdade"). O `PLANO-FILEORCA.md` não é editado nesta run.

## § 309 · Os caminhos das 40 páginas (ajuste idiomas, decisão 2)

- **A regra:** slug sem acento, com as palavras do glossário, no padrão das páginas do idioma. Nenhum caminho que existia mudou. A tabela das 40 está no `docs/relatorios/ajuste-idiomas-plano.md` e nos glossários (as 13 calculadoras e presets e os 5 guias de dinheiro entraram na tabela do `docs/i18n/es.md` na revisão, § 321).
- **O QR:** `/pt/gerador-de-qr-code/` e `/es/generador-de-codigo-qr/`, como a ficha fixou.
- **O dinheiro em es:** `/es/calculadora-de-<nome>/`, como as 5 da F6, e cada preset embaixo da calculadora-mãe. As escolhas:
  - **`prestamo-para-auto`:** o glossário do CFPB (mar/2024) escreve "préstamo para automóvil (o vehículo)", a FTC "carro". "Auto" é a palavra dos hispanos dos EUA e cabe no padrão "préstamo para…" do CFPB. "Coche" é de outros países.
  - **`pagos-cada-dos-semanas`:** o biweekly é a cada duas semanas (26 pagamentos no ano). "Quincenal" é duas vezes por mês (24), e o próprio glossário do CFPB põe as duas formas lado a lado; a página não pode sugerir a outra conta.
  - **`pago-global`:** o termo do glossário e do Toolkit hipotecario do CFPB para balloon payment. O formulário H-28(D) diz "cuota extraordinaria", e o site fica com a forma do glossário do CFPB. (Corrigido na revisão, § 321: este item dizia que "cuota" estava proibida no glossário de es, e só "cuota mensual" está; "cuota de la asociación de propietarios (HOA)" é termo do site.)
  - **`cuanta-casa-puedo-pagar`:** a pergunta que a página responde, como a pessoa a faz ("¿cuánta casa puedo pagar?"). "Asequibilidad" é tradução literal de affordability e pouco usada.
  - **`amortizacion-de-prestamos`**, **`refinanciamiento`** (CFPB, H-28(C)), **`consolidacion-de-deudas`** (FDIC, FTC), **`alquilar-o-comprar`**, **`meta-de-ahorro`**, **`interes-simple`**, **`apr-a-apy`** (o site escreve APR e APY, as siglas do mercado dos EUA).
  - **Os guias** em `/es/guias/<slug>/`: `hipoteca-a-15-o-30-anos`, `bola-de-nieve-o-avalancha`, `pagos-adicionales-a-la-hipoteca`, `punto-de-equilibrio-del-refinanciamiento`, `punto-de-equilibrio-entre-alquilar-y-comprar`.
- **Os guias de arquivo** em `/pt/guias/<slug>/` e `/es/guias/<slug>/`, com o slug traduzido (lista no plano). Os slugs dos guias de dinheiro e dos de arquivo em `/es/guias/` são distintos entre si.
- **Os arquivos de texto** guardam o slug em inglês (`src/i18n/es/guide-jpg-vs-png.ts`): o mapa de rotas e os testes acham o texto pelo id, e a URL traduzida mora só no registro.
- **O nome do PDF e do CSV** de cada página de dinheiro em es está no bloco `es` do registro, sem acento (lista no plano).

## § 310 · O QR em português e em espanhol (ajuste idiomas, decisão 3)

- **O mesmo QR da § 272:** a ilha, a conta, o limite de 1.273 bytes, a Oli, as cores, o PNG e o SVG não mudam. O `QrTool.astro` recebe o `lang`; os textos ficam em `src/tools/qr-code-generator/i18n/{pt,es}.ts` (`QR_TEXTS` no `page.ts`).
- **O nome dos arquivos** sai dos textos (`panel.file`), sem acento (§ 219): `qr-code.png` e `qr-code.svg` em inglês e em português ("QR code" é o nome do código no Brasil), `codigo-qr.png` e `codigo-qr.svg` em espanhol. Antes era a constante `FILE_NAMES` do painel.
- **O selo** no idioma ("Seu texto nem sai do aparelho", "Tu texto nunca sale de tu dispositivo"), e a frase de privacidade que o `gate:conteudo` pede, por idioma.
- **O cartão Open Graph** do QR em pt e es leva o selo da própria página, não o "seus arquivos" do site (a página não tem arquivo). O cartão em inglês continua como está: é a pendência F7 e-2, que vale para a página antiga.
- **As relacionadas** são as mesmas 4 ferramentas, no idioma (`qrRelated(lang)`).

## § 311 · O dinheiro em espanhol: o bloco `es` obrigatório e o fim do `ES_CALC_IDS` (ajuste idiomas, decisão 4)

- **O bloco `es`** de cada linha do `CALC_PAGES` passa a ser obrigatório e só tem o caminho e o nome do arquivo (`{ path, file }`). Os chips (`next`), as relacionadas, a calculadora-mãe e o guia são os do inglês, porque toda página que o inglês liga existe em espanhol. O compilador reprova uma calculadora nova sem página em es.
- **O `ES_CALC_IDS` sumiu.** Alternativas: (a) apagar; (b) derivar do registro (`CALC_PAGE_IDS.filter(…)`); (c) manter como alias de `CALC_TOOL_IDS`. Fica a (a): com o bloco obrigatório, "as páginas em es" são todas as do registro (`CALC_PAGE_IDS` por `moneyPage(id, 'es')`), e um nome que diz "as cinco" mentiria (a (c) ainda deixaria os presets de fora). O tipo `EsCalcId` vira `CalcPageId`. Os 13 testes que importavam o nome passaram a ler o registro.
- **A home e o rodapé em es** listam as 5 calculadoras de crédito da home em inglês (`HOME_MONEY_IDS.es = HOME_CALC_IDS`), e o hub em es as 14 na ordem do inglês (`HUB_MONEY_IDS.es = CALC_TOOL_IDS`), com os presets e os guias.
- **O `moneyPage()`** em es leva a mãe e o guia (antes os descartava, e o preset em es perderia a calculadora-mãe na trilha). O `presetRows()` e o `guideOf()` servem o inglês e o espanhol.
- **As 5 calculadoras da F6** ganham os vizinhos novos (chips e relacionadas iguais aos do inglês), e a hipoteca em es ganha a tabela dos presets. O texto delas não muda.

## § 312 · As datas das páginas novas (ajuste idiomas; § 207 e § 223)

- **Uma data só, 3/nov/2026** (`IDIOMAS_DAY` em `src/tools/calc/page.ts`; `GUIDE_REVIEWED_ON` e `GUIDE_PUBLISHED_ON` em `src/tools/guides/page.ts`; o `read` de cada fonte dos guias de arquivo). A run começou às 22h30 de 2/nov em Brasília (01h30 de 3/nov em UTC), e os redatores escreveram os textos e leram as fontes entre essa hora e a madrugada de 3/nov. Alternativas: (a) 2/nov, o dia em Brasília da primeira versão dos textos; (b) 3/nov. Fica a (b): é o dia em UTC de toda leitura de fonte (a convenção do `measuredOn` dos guias, § 207), e o dia em Brasília da revisão final e da publicação, que não podem acontecer antes da meia-noite (a revisão adversarial e o merge vêm depois). Assim nenhuma página diz que foi revisada ou publicada antes de o ser.
- **Dinheiro em es:** as 13 calculadoras e presets novos e os 5 guias levam o dia da run no "Revisado", no "Publicado por primera vez" e na leitura das fontes. As 5 calculadoras da F6 guardam os dias delas (o texto não mudou). O hub em es, cujo texto foi reescrito, leva o dia da run no "Revisado" e guarda a primeira publicação e a leitura das fontes da F6. O `datesOf()` decide pela página (antes era uma data por idioma).
- **Guias de arquivo em pt e es:** revisados e publicados no dia da run, nunca antes do `measuredOn` (2/nov/2026 em UTC, § 207).

## § 313 · Os guias de dinheiro em espanhol: as palavras dos motores nos textos (ajuste idiomas, decisão 4)

- **O problema:** o `src/tools/calc/guides.ts` escrevia em inglês, no código, as palavras dos fatos e das tabelas ("the big card, then the small card", "month 41", "never", "year 8", "not within 30 years" e os cabeçalhos das tabelas).
- **A decisão:** essas palavras passam para o texto de cada guia, num campo `words` com o tipo de cada guia (`GuideWordsById`), e o `GUIDE_FACTS[id](lang)` escreve os números no idioma (dólares, taxas com U+00A0 antes do "%" em es, durações do `duration` do idioma). As palavras do inglês foram copiadas para os `en.ts` sem mudar uma letra: a página em inglês sai igual.
- **Alternativa recusada:** uma tabela `Record<Lang, …>` dentro do `guides.ts`. Texto do site mora nos arquivos de tradução (CLAUDE.md, "Idioma"), e o `glossary.test.ts` e o `lint:texto` só leem esses arquivos.
- **Prova:** o `calc-guides.test.ts` confere, em inglês e em espanhol, que todo placeholder do texto tem fato, que os placeholders do es são os do en, e que cada fato e cada célula da tabela em es tem os mesmos algarismos do inglês.

## § 314 · Os guias de arquivo em português e espanhol: o formato e o gênero das contagens (ajuste idiomas, decisão 5)

- **O formato** (`src/tools/guides/measured.ts`, `GuideFormat`): tamanho, separadores e "%" do idioma (§ 213); um espaço sem quebra entre número e unidade em pt e es ("2,4 MB", "42,2 dB", "150 ppi", "1.304 bytes"), como o glossário pede e a pendência F6 f-8 cobra das páginas antigas; o inglês sai como antes. "Vezes/veces" saem dos textos compartilhados (`times`, `timesOne`): em pt o singular abaixo de 2 ("0,5 vez", norma do singular com parte inteira menor que 2), em es só no 1 exato.
- **O gênero das contagens por extenso:** `{x_word}` é masculino e `{x_wordf}` feminino, pelo substantivo que a contagem acompanha no idioma ("duas fotos", "dos fotos", "um PDF", "una imagen"). Alternativas: (a) o sufixo no placeholder; (b) um mapa de gêneros por guia nos textos; (c) uma variante por número. Fica a (a): o texto diz o gênero onde usa a contagem, e o código não precisa conhecer o substantivo. As palavras (de zero a doze, nos dois gêneros) ficam em `src/i18n/{lang}/file-guides.ts`. Em es o 1 masculino é "un", então o substantivo vem logo depois.
- **As provas:** o `guides-numbers.test.ts` tem uma tabela com o gênero de cada contagem em pt e es (a partir dos substantivos dos textos), reprova `{x_wordf}` em inglês, uma contagem que abre frase (sairia em minúscula) e um "un" sem substantivo; os controles reprovam cada caso.
- **As palavras inglesas do `data/guides-measured.json`** (o "use" dos tamanhos oficiais do guia 3, a opção e as ferramentas do guia 6) são traduzidas no campo `measuredTerms` de cada guia, com a chave igual ao texto em inglês. Falta de tradução para o build, e o teste confere que os algarismos da tradução são os da chave.
- **As células sem gênero:** "Nada" e "Sem GPS"/"Sin GPS" nas tabelas, porque a mesma palavra serve a colunas de gêneros diferentes.
- **O guia 3 em pt e es** cita a página de ajuda do idioma quando ela dá o mesmo número; o teste compara pelo id da fonte, não pelo endereço.
- **O defeito achado:** o teste dos placeholders do `guides-measured.test.ts` usava `/{(w+)}/`, sem a barra, e não conferia nada. A regex foi corrigida (os 10 guias em inglês passam) e o teste lê os três idiomas.

## § 315 · A regra dos números em português e espanhol (ajuste idiomas, decisão 5)

- **A regra não muda:** nenhum algarismo à mão (§ 189), a frase diz a amostra, um mínimo ou um máximo diz a direção (§ 199), nada generaliza além da amostra (§ 197 e § 208) e a data da medida não vai para as fontes (§ 208).
- **As listas por idioma:** `GENERAL` com as palavras da ficha ("geralmente", "normalmente", "em geral", "quase sempre", "a maioria dos PDFs"; "generalmente", "normalmente", "por lo general", "casi siempre", "la mayoría de los PDF") e as equivalentes da lista inglesa; `SOURCES`, `LOW`, `HIGH` e `CLAIMS_BEST` por idioma. Todas com borda Unicode (o `\b` do JavaScript é ASCII e não casa "até" nem "típicamente").
- **O "free" dos fatos oficiais** vira "grátis"/"gratuito" em pt e "gratis"/"gratuito" em es.
- **Os controles** em pt e es reprovam cada lista e aceitam "fotos reais de celular" e "fotos reales de celular".

## § 316 · Os lotes de texto e quem escreve (ajuste idiomas, decisão 7)

- **Os redatores são agentes Opus em worktree**, um por lote, nunca Sonnet. Os quatro lotes da ficha (QR, dinheiro em es, guias de arquivo em pt, guias de arquivo em es) foram divididos pelo tamanho: o dinheiro em calculadoras / presets, guias e hub; cada lote de guias em imagem / PDF. São 7 agentes, cada um com um conjunto de arquivos só seu. O glossário e as convenções (gênero, `measuredTerms`, palavras dos motores) vieram antes, no brief comum, para os dois agentes de um idioma escreverem igual.
- **Os arquivos compartilhados** (`src/i18n/{pt,es}/common.ts`, as homes, o glossário) ficaram com o agente principal: os redatores devolveram os cartões e os termos novos na resposta, e o agente principal os integrou. Assim nenhum par de agentes mexeu no mesmo arquivo.
- **Os stubs:** enquanto os lotes eram escritos, cada arquivo de texto novo existia como cópia do inglês marcada `// STUB-IDIOMAS`, para o build e os testes rodarem. Nenhum stub chega à PR (o `english-leak.test.ts` reprova texto inglês numa página de pt e es, e a busca pelo marcador fica no relatório).
- **A leitura de cada lote:** o agente principal leu cada lote contra o glossário e rodou o `lint:texto` antes de o lote entrar na branch.

## § 317 · O glossário do ajuste "idiomas" (ajuste idiomas, decisão 7)

- **O que entrou:** em `docs/i18n/pt.md`, o QR code (a seção nova, o nome da página e os nomes dos arquivos) e os 10 guias de arquivo (nomes, caminhos, termos e os rótulos de sistema como as páginas de suporte em português escrevem); em `docs/i18n/es.md`, o mesmo para o QR e os guias, e o resto do dinheiro dos EUA (os termos do Toolkit hipotecario, dos formulários H-28 e do glossário do CFPB, conferidos em 3/nov/2026). Os termos vieram dos redatores de cada lote; o agente principal os juntou e conferiu com os textos.
- **Duas correções do que a F6 escreveu:**
  - **A data do glossário do CFPB:** o `es.md` dizia "abril de 2021". Os arquivos que existem são o "Spanish-English glossary of financial terms" de março de 2024 (o que o site segue) e a edição de abril de 2022; não há uma de 2021.
  - **O motivo da linha "Nunca" de "tasa de porcentaje anual":** dizia "o CFPB não usa essa forma", e o glossário do CFPB de 2024 e o do FDIC usam. A regra continua (o site escreve "tasa porcentual anual (APR)", como o Toolkit, os formulários H-28 e a FTC); o motivo passou a dizer isso.
- **APY:** fica "rendimiento porcentual anual (APY)", como a F6 e a calculadora de interés compuesto já escrevem. Alternativa: "porcentaje de rendimiento anual", a forma do FDIC (o CFPB não tem o termo em espanhol). Ficar com a forma do site evita duas grafias do mesmo termo e casa com "tasa porcentual anual".
- **"Declaración de Cierre":** os textos novos usam a forma do formulário H-28(G) e do Toolkit. O texto do préstamo personal da F6 diz "Divulgación de Cierre" (a forma do glossário do CFPB): a página antiga não muda nesta run, e a diferença vai para o `PENDENCIAS.md`.
- **"Carro" e "coche":** nenhum texto em espanhol usa "coche" (de outros países) nem "carro" (forma da FTC); a página diz "auto". "Préstamo para carro" fica só entre os sinônimos da busca, porque é como muita gente procura. Nenhum dos dois entrou no "Nunca", porque o teste do glossário leria também os sinônimos e os endereços das fontes.
- **"Quincenal":** fora dos textos e dos sinônimos (§ 309). Não entrou no "Nunca" porque uma frase que explique a diferença precisaria da palavra.

## § 318 · Os portões e os testes com idioma (ajuste idiomas, decisão 8)

- **`gate:seo`:** o título de um guia de arquivo é comparado com o nome do cartão do idioma da página e com o H1 da ferramenta no idioma; um guia sem nome no cartão do idioma vira problema (antes um nome vazio aprovaria qualquer título). O QR entrou na checagem de sitemap por registro (`SITEMAP_REGISTRY_IDS`).
- **`gate:conteudo`:** o QR é conferido no idioma de cada página, com a frase de privacidade de cada um ("your text stays on your device", "seu texto fica no seu aparelho", "tu texto se queda en tu dispositivo") e o "never opens"/"nunca abre"; os guias, nos três idiomas (10 × 3, e o mapa de rotas tem de bater com o registro). A data da medida é procurada no formato do idioma, com os meses do `src/i18n/dates.ts`. O `FILLER` ganhou listas de pt e es (sem "hoy en día" e "nos dias de hoje", que são texto normal); pt e es também passam pela lista inglesa. O limite de 800 a 1.500 palavras não mudou.
- **`gate:design`:** a voz dos guias de arquivo nos três idiomas (só o texto visível, como na F5b) e a das outras 21 páginas novas (QR em pt e es, as 13 páginas e o hub de dinheiro em es, os 5 guias de dinheiro em es), no texto visível e no `data-props` (`scripts/lib/voice-pages.ts`). As 5 calculadoras da F6 em es e as outras páginas antigas ficam de fora: é a pendência F7 f-11, que vale para elas.
- **`lint:texto`:** os guias de arquivo de pt e es são preenchidos pelo `fillValues` no formato do idioma, e os guias de dinheiro em es pelo `GUIDE_FACTS[id]('es')`; o espanhol ganhou amostras para os placeholders das calculadoras novas que não são dinheiro (`front`, `back`, `rule`, `paymentDiff`, `totalDiff`, `interestEffect`, `interestPart`, `timePart`, `base`, e por página onde o nome muda de sentido), e o QR para `{max}`, `{count}` e `{side}`. O portão importa os módulos pelo Node: o `measured.ts` e o `guides.ts` não usam `import.meta.glob`.
- **Os specs:**
  - **`qr-code.spec.ts`** roda em en, pt e es: em pt e es, um teste de ida e volta por idioma (PNG e SVG, com e sem a Oli, lidos pelo jsqr com o `binaryData` igual aos bytes UTF-8 de um texto com "ação", "año", "ñandú" e emoji) e o de privacidade (nada sai, o evento leva o `lang` e não o texto, a caixa com `autocomplete`, `spellcheck` e `autocapitalize` desligados).
  - **`money-es.spec.ts`** (novo, o nome cai entre `money-calc` e `money-health`): as 18 páginas em es em 6 blocos de 3, cada um no limite padrão de 60 s; o ResultHero e as linhas da tabela aberta iguais aos do inglês (como números), o CSV contra a fixture do oráculo (o mapa depende da calculadora: cronograma linha a linha, saldos de fim de ano, o APY, a última linha dos juros simples) e o PDF em Letter com os rótulos em espanhol. Com o mapa do oráculo trocado de propósito, 5 dos 6 blocos reprovam.
  - **`money-calc.spec.ts` e `calc-form.spec.ts`:** os testes que percorrem todas as páginas de dinheiro (44) vão em blocos de 15, com os 120 s de antes por bloco (§ 306).
  - **`tool-guides.spec.ts`:** os 30 guias; em pt e es um teste por guia faz as duas provas (a ferramenta funciona no idioma e a Oli não cobre linha), com o limite de 90 s que o teste da ferramenta já tinha.
  - **`ads.spec.ts`:** as 18 páginas de dinheiro em es com a regra dos 740 px, os 5 guias de dinheiro em es, os guias de arquivo nos três idiomas e o QR em pt e es.
  - **`i18n-budgets.spec.ts`:** o orçamento e o par em `SAME_FILES` (os mesmos arquivos JS do inglês) para as 40 páginas.
  - **`navigation.spec.ts`:** o exemplo de página só em inglês passa a ser o `/bmi-calculator/` (o guia ganhou par); a busca e o 404 de pt e es acham o QR pelos sinônimos da ficha e as páginas novas.
  - **`layout-shift.spec.ts`:** a varredura da § 305 refeita nas 45 páginas de pt e es, de 320 a 412 px, nos dois navegadores (a § 305 olhava só o Chromium); as páginas na borda entraram em `CASES`.
  - **`a11y.spec.ts`:** o QR com código e acima do limite em cada idioma; mais nada (o spec já domina a parte 1 do Chromium).

## § 319 · Casa e saúde: a escolha para o gatilho da § 273 (ajuste idiomas, decisão 10)

- **A escolha do Victor, de 2/nov/2026, para quando o gatilho vier** (31/jan/2027, § 273):
  - **casa só em espanhol:** as 6 calculadoras usam unidades dos EUA (pés, jardas, galões), e o mulch não é coisa do Brasil;
  - **saúde em português e em espanhol,** com o sistema métrico como padrão em português.
- **Nesta run** nada de código, rota ou texto de casa e saúde mudou. A nota entrou na linha "90 dias" do `docs/PENDENCIAS.md`.

## § 320 · O CI em 20 partes (ajuste idiomas, decisão 9; na linha da ADR-003, que não muda)

- **A projeção** (exploração e, com o tempo por spec da execução 41548317129 e o modelo de partição do `--shard`, que reproduz a F8 com erro de 1 a 3 %): as 40 páginas somam uns 250 testes por navegador; com as partes da F8, a parte 9 do WebKit iria a uns 732 s e a 1 do Chromium a 653 s. A parte `verificar` iria de 674,8 s a uns 715 s (o `lint:texto` com a diff desta PR, o build e o Vitest crescem; o Lighthouse sozinho são 382,6 s). A variância entre execuções do mesmo código chega a ±35 %.
- **A decisão:** Chromium em 5 partes, WebKit em 13, e a parte `verificar` em duas: `--sem-playwright --sem-lighthouse` (todos os portões menos o Lighthouse) e `--lighthouse` (o build e o Lighthouse). São opções novas do `scripts/verificar.ts`. O job `verificar` virou uma matriz de duas entradas com o mesmo id, então o `needs` do `merge` e do `alerta-dependabot` não muda; só a parte do Lighthouse instala o Chromium.
- **Alternativas:** dividir só o Playwright (a parte `verificar` passaria do alvo de 700 s e pediria outro ajuste do `ci.yml` logo depois); tirar o Vitest da parte `verificar` (fica desequilibrado: uns 160 s contra 555 s); encaixar o Lighthouse numa parte do Chromium (a mais leve iria a 690 a 860 s).
- **12 ou 13 partes do WebKit:** a primeira divisão foi em 12. Com os testes prontos, o `--list` e o custo por teste da F8 deram uns 694 s à parte 11 (a matriz de PDF, o `pdf-tool` inteiro e o QR), no limite do alvo, e a variância de ±35 % a levaria a mais de 900 s. Em 13, a pior fica em uns 560 s (a mesma estimativa: o custo médio por teste de cada spec na execução 41548317129, vezes os testes de cada spec no `--list` da parte, dividido pelos 2 workers, mais 33 s). As 19 partes locais passaram com 12 antes da troca.
- **O `design.spec.ts` e o `image-matrix.spec.ts`** ficam em partes diferentes do WebKit (§ 142): pelo `--list` em 13, o `design` cai nas partes 6 e 7 e a matriz de imagens na 9, com o `i18n-budgets` entre elas.
- **O custo:** cada execução passa de 15 para 20 jobs, de uns 141 para uns 170 minutos cobrados (`docs/OPERACAO.md`).
- **A prova:** o `tests/unit/verificar.test.ts` lê as duas matrizes do `ci.yml` e confere que as 20 partes cobrem o todo, cada portão numa parte só; recusa as combinações que não conhece. Com o `ci.yml` no diff, o merge desta PR é do Victor (§ 297).

## § 321 · As correções da revisão do ajuste "idiomas" (ajuste idiomas, revisão adversarial)

A revisão das cinco lentes (`docs/relatorios/REVISAO-ajuste-idiomas.md`) confirmou 20 achados, todos baixos depois dos céticos (C-1 e B2, C-2 e B1, D2 e E-4 são o mesmo defeito, visto por duas lentes). Um agente só corrigiu os que eram triviais e seguros, cada correção de comportamento com um teste que reprova sem ela.

- **"ppp" no guia de resolução em espanhol (C-1 e B2).** A ferramenta PDF a JPG embutida na mesma página escreve "72 ppp" desde a F6, e o guia escrevia "72 ppi". Alternativas: (a) a unidade do guia vira "ppp" em es; (b) a ferramenta vira "ppi"; (c) o guia define o par uma vez. Fica a (a): a (b) mexeria em texto da F6 (PDF a JPG e Comprimir PDF), e a (c) deixaria as duas siglas na página. A unidade sai dos textos compartilhados de cada idioma (`ppi` em `src/i18n/{en,pt,es}/file-guides.ts`, "{n} ppp" só em es), e o `measured.ts` a lê; o inglês e o português ficam como estavam. "ppi" entrou no "Nunca" do `docs/i18n/es.md`. Prova: `guides-measured.test.ts` ("the unit of a resolution") e o `glossary.test.ts` sobre o `dist/es`.
- **"Chico · Mediano · Grande" no QR em espanhol (E-1).** Com "Pequeño", o trilho do tamanho do PNG passava 16,6 px da coluna a 320 px e encostava na borda do cartão, nos dois navegadores. Medido no `dist/`: "Pequeño · Medio" passa 0,3 px (como o português), "Chico · Mediano" cabe sem sobra. Fica "Chico", a palavra de tamanho do espanhol dos EUA, e "Mediano" continua. O CSS do `.fo-seg`, que é de todas as ferramentas, não mudou. Prova: o `qr-code.spec.ts` confere, a 320 px, nos três idiomas e nos dois navegadores, que as partes de cada grupo de opções ficam na coluna (menos de 1 px de arredondamento).
- **O link do exemplo da FAQ do QR (D1).** O RichText transforma em link o "https://fileorca.com/" da resposta, e em pt e es ele levava à home em inglês. Cada idioma passa a mostrar a home do próprio idioma (`https://fileorca.com/pt/` e `/es/`, 24 bytes, ainda a grade de 29 quadradinhos na correção H). Prova: o `qr.test.ts` lê a resposta de cada idioma, confere que o link é a home do idioma e que a grade dele é a que a resposta diz; o `english-leak.test.ts` reprova, no `dist/`, link de página de pt ou es para fora do idioma, salvo o seletor de idioma (`hreflang`).
- **O CSV em espanhol sem espaço sem quebra (C-5).** A tabela da APR a APY tem os percentuais como texto, e o "5.00 %" da tela ia para o arquivo. O `csvCell` cola o "%" ao número em toda célula de texto ("5.00%", como o CSV em inglês, decisão 4); a tela e o PDF guardam o espaço da § 213. Prova: o `calc-defs.test.ts` (nenhum U+00A0 no CSV das 18 páginas em es) e o `money-es.spec.ts`, cujo `csvNumber` deixou de aceitar o espaço antes do "%".
- **O singular nas páginas novas em espanhol (C-3).** "durante 1 años", "Después de 1 pagos" e "1 meses" ahorrados. O texto de cada página dá a forma singular numa chave `<chave>One` da `view` (`yearsOne`, `monthsOne`, `daysOne`, `paymentsOne`), lida só quando a contagem é 1; o pago global reescreveu a frase sem a contagem. O inglês não tem essas chaves e escreve como antes: a pendência F4 COR-6 continua valendo para ele e para as 5 páginas em es da F6 ("en 1 pagos" da tarjeta de crédito). O `lint:texto` preenche as chaves singulares com 1. Prova: `calc-defs.test.ts` ("the singular of the new Spanish pages") e `lint-texto-money.test.ts`.
- **"Tasa a 15" e "Tasa a 30" (B5).** Os campos de taxa do preset 15 o 30 años diziam só "A 15 años". "Tasa a 15 años" não cabe ao lado da etiqueta "ejemplo" a 360 px e põe o resultado abaixo de 740 px (o cético mediu 748), então o rótulo ficou com "Tasa" e sem "años", que o H1 e o resultado dizem. Prova: o `calc-defs.test.ts` reprova campo em es cujo erro pede uma "tasa" e cujo rótulo não diz "tasa"; o `ads.spec.ts` confere os 740 px.
- **"comprar alcanza a alquilar" (B4).** O título, o lead e o cartão diziam "el año en que comprar alcanza", que em espanhol lê "comprar basta". O título passa a "cuándo comprar alcanza a alquilar", o lead e o cartão completam a frase, e a plaquinha da Oli diz "punto de equilibrio", o termo do guia.
- **As contagens do Sobre e dos Términos em espanhol (D7).** Diziam "las 14 calculadoras de dinero", e o Sobre em inglês diz 18 (as 14 e os 4 presets). Os dois passam a "las 18 calculadoras de dinero con sus guías". Prova: o `about-counts.test.ts` confere o Sobre em pt e em es e os Términos em es contra os registros.
- **As fontes em inglês dentro de páginas em pt e es (D2 e E-4).** Três títulos estavam em inglês dentro da frase ("Help with uploading a profile photo", "Portable Network Graphics (PNG) Specification"), lidos pelo leitor de tela com a voz da página (WCAG 3.1.2). Ficam no idioma da página, com "(em inglês)"/"(en inglés)", como as fontes do dinheiro em es fazem desde a F6. Alternativa recusada: um `lang="en"` no trecho do título, que pediria um campo novo em toda fonte e mudaria o HTML das páginas antigas. O "Safari 14 Release Notes" do guia de WebP em es fica: é o nome do documento, e a fonte é marcada como "versión en español". Prova: o `text-punctuation.test.ts` reprova fonte marcada como inglesa com palavra inglesa no título.
- **A pontuação (B1, C-2 e PT-03).** "{winnerOption}.Una foto" ganhou o espaço; a fonte da Adobe em pt perdeu o "?" do título, porque a lista põe um ponto depois do rótulo ("grande?. Lido em"). As páginas em inglês têm o mesmo "?." e não mudam (a ficha não deixa mexer no texto delas). Prova: o `text-punctuation.test.ts`, nos três idiomas para o ponto colado e em pt e es para o "?" no fim do rótulo.
- **O texto em pt (PT-01, PT-02 e PT-07).** "cada modo" virou "cada nível" (o glossário); a coluna e a legenda do guia de HEIC dizem "Variação", como os guias de PDF; "tão menor" virou "bem menor"; "o mesmo decodificador aberto" virou "um decodificador de código aberto, o mesmo em todos os navegadores". As outras frases do PT-07 ficaram: o cético as julgou corretas.
- **Os glossários (B10 e D5).** A nota do "pago global" no `docs/i18n/es.md` e no § 309 dizia que "cuota" era proibida; agora diz a razão real. O `es.md` ganhou a tabela das 18 páginas de dinheiro em es (caminho e arquivo, as 5 da F6 incluídas) e a dos 5 guias de dinheiro; o `glossary.test.ts` confere cada caminho e cada arquivo contra o registro, e os caminhos dos guias de arquivo e do QR nos dois glossários.
- **O pulo das calculadoras em es na primeira visita (E-2).** Fica aberto (pendência "Idiomas E-2"): encurtar "Tasa nueva" e "Tasa anual" mexe na tradução e nos rótulos de meia largura. As cinco páginas entraram nos `CASES` do `layout-shift.spec.ts`, que imprime o CLS delas (o número de testes não mudou: as larguras de 360 e 412 px ganharam páginas nos blocos que já existiam).
- **A segunda passada (R2-01 a R2-08).** Um revisor Sonnet em contexto limpo leu o diff das correções e mediu as páginas de novo. Um médio e sete baixos:
  - **R2-01 (médio, corrigido).** O lead completo da Alquilar o comprar ("y el año en que comprar alcanza a alquilar") ganhava uma linha com a fonte de reserva: o número do resultado ia de 712 a 740 px na primeira visita (folga zero na § 124) e o CLS de 0,000 a 0,020 a 360 px. O lead e o cartão passam a "y cuándo comprar alcanza a alquilar", como o título; o revisor mediu 712 px nas duas fontes e nos dois navegadores. A página entrou nos `CASES` de 360 px do `layout-shift.spec.ts`, que imprime o CLS dela.
  - **R2-02 (corrigido).** A pendência "Idiomas E-2" dizia "todos abaixo do limite de 0,05" e listava 0,051. Agora diz que o 0,051 passa por pouco e que nenhuma das páginas está nas URLs do `lhci`.
  - **R2-03 (aceito, pendência "Idiomas R2-03").** "Tasa a 15" fica sem os anos no nome acessível: com eles, o resultado desce a 748 px. A correção é uma descrição acessível, sem mudar o rótulo.
  - **R2-04 (pendência "Idiomas R2-04").** "Chico" no QR e "Pequeño" na Marca de agua PDF da F6. O `es.md` diz que "Chico" é só do QR.
  - **R2-05 (pendência "Idiomas R2-05").** O "?." das fontes da Adobe nas páginas em inglês, que esta run não muda. A correção é no `FileGuideView.astro`, sem mexer em texto.
  - **R2-06 (aceito).** O rótulo "Safari 14 Release Notes (versión en español)" fica: a página da Apple em `/la/` tem o título em inglês e o resto em espanhol (lido em 3/nov/2026: título "Safari 14 Release Notes", resumo "Lanzamiento: 16 de septiembre de 2020"). A de `/br/` tem o título em português, que o guia em pt usa.
  - **R2-07.** O `docs/relatorios/REVISAO-ajuste-idiomas.md` entra na mesma PR.
  - **R2-08 (corrigido).** O espaço sem quebra do `csvCell` e do teste do CSV passa a ser escrito `\u00A0`, como no resto do `calc-defs.test.ts`: o caractere literal some num editor que normaliza espaços.

## § 322 · A corrida de foco do Reorder no WebKit do CI (ajuste idiomas)

- **O que falhou.** Na primeira execução do CI desta PR (41571847874), a parte 12 de 13 do WebKit caiu no `pdf-tool.spec.ts`, no passo de teclado da Reorder: depois de abrir o arquivo de novo, o teste dava foco a uma página da grade e apertava as teclas, e o status dizia "1 PDF ready" em vez da página pegada. Nesta máquina o teste passava.
- **A causa.** Quando o arquivo fica pronto, o painel leva o foco ao botão da ação um quadro depois de mostrar a grade (§ 240). O teste esperava só a grade e dava o foco à página antes desse movimento; no runner mais lento, o movimento chegava depois e tirava o foco da página.
- **A correção.** O teste espera o foco no botão da ação, que é o que o painel garante, e só então foca a página. O painel não mudou: o foco na ação é o comportamento da § 240.
- **Alternativas.** Mudar o painel para não mover o foco quando a pessoa já está numa página da grade (mudança de produto que a ficha não pede, e a § 240 já trata o caso dos campos de texto); um `waitForTimeout` (proibido: esperar tempo em vez de estado).
- **A prova.** O teste passou três vezes seguidas em cada navegador nesta máquina, e o CI da PR roda a parte de novo.

## § 323 · O pnpm ci:custo e a linha de base (F9, decisão 1)

- **O comando:** `pnpm ci:custo <run-id> [--attempt n]` (`scripts/ci/custo.ts`). Ele só lê, pelo `gh`: `gh run view --json` para os jobs e os passos e `gh run view --job <id> --log` para o log de cada job que rodou. O `.claude/settings.json` nega o `gh api` com método, e o script não precisa dele.
- **Por job, mostra:**
  - a duração e o minuto cobrado: a duração arredondada para cima, como num repositório privado;
  - o preparo: do início do job ao início do passo cujo nome começa com `pnpm verificar`;
  - os três passos que mais pesam;
  - o `total` e os passos do resumo do `verificar`, lidos do log.

  Jobs pulados aparecem como pulados, com 0 minuto.
- **Na execução, mostra:**
  - a soma dos minutos cobrados;
  - o tempo de parede, do início do primeiro job que rodou ao fim do último;
  - quantos jobs rodaram e quantos foram pulados;
  - a classe, lida da linha `classificar: classe <x>` do log da classificação. Sem o job, é "completo (CI de antes da F9)"; com o job e sem a linha, "desconhecida".

  Depois da tabela vêm três linhas: os jobs que rodaram o build, o maior preparo dos jobs do Playwright (com quantos passaram de 90 s) e o maior `total` (com quantos passaram do alvo de 700 s).
- **A saída** é Markdown, pronta para o relatório. A conta é a função pura `summarize()`. O `tests/unit/ci-custo.test.ts` roda sobre a execução gravada em `fixtures/ci-custo/run-41590377930.json`: o JSON do `gh` e, por job, só as linhas do log que o script lê. O mesmo teste confere que o script não chama o `gh` com método nem com outra coisa que `run view`.
- **A linha de base** é a execução `41590377930`: a última verde da PR #19 (ajuste idiomas), commit `8513580`, evento `ready_for_review`, tentativa 1. O `pnpm ci:custo 41590377930` dá:
  - 157 minutos cobrados e 11,1 min de parede;
  - 21 jobs que rodaram e 2 pulados;
  - preparo dos jobs do Playwright de 55 a 128 s, com 1 de 18 acima de 90 s (o `webkit 8 de 13`, com 86 s de `playwright install`);
  - o maior `total` em 574,7 s (`chromium 5 de 5`), com nenhuma parte acima de 700 s;
  - os 20 builds, um por parte, de 12 a 24 s.

  As outras execuções verdes da mesma PR deram 166 (`41584397815`) e 160 minutos (`41571847874`, com uma parte vermelha). O "uns 170" do prompt é a estimativa da § 320.
- **Alternativas:**
  - ler os logs pela API de jobs (`gh api .../jobs/<id>/logs`), que é o mesmo dado com outro formato de linha;
  - calcular o custo pelo `billable` da API de uso (`/actions/runs/<id>/timing`), que não existe para repositório público e não dá o preparo.

## § 324 · O build uma vez por execução (F9, decisão 2)

- **O job `build`** roda `pnpm verificar --build` e sobe o artefato `site`: o `dist/` e o `.cache/bundle-modules.json`, com `include-hidden-files: true` (o `upload-artifact` da v4.4 em diante ignora caminho oculto, e o `.cache/` é oculto), `if-no-files-found: error` e retenção de 1 dia. O registro do bundle vai junto porque o `gate:licencas` e o `budgets.spec.ts` (`BUNDLE_RECORD`) o leem.
- **As partes que usam o build** (`portoes`, `lighthouse` e as 18 do `playwright`) baixam o artefato e rodam o `verificar` com `--dist-pronto`. No `portoes`, o cache das ferramentas (`.cache/` inteiro, chave do `tools.ts`) vem antes do download, então o `bundle-modules.json` do artefato vence o de um cache velho. O `upload-artifact` da v4 em diante não sobrescreve um nome na mesma execução, e só o `build` sobe o `site`.
- **As opções do `scripts/verificar.ts`:**
  - `--build`: só o passo do build (apaga o `dist/` antes, como sempre);
  - `--dist-pronto`: modificador de qualquer parte. Não apaga o `dist/`, tira o build do plano e para antes do primeiro passo se o `dist/build.txt` não for o `git rev-parse HEAD` do checkout (`distProblem()`). No CI de PR, todos os jobs de uma execução fazem o checkout do mesmo commit de merge (`github.sha`), que é o que o `build-files.ts` grava;
  - `--leve`: tipos, lint, build e Vitest (§ 326).

  Sem as opções, o `plan()` faz o que fazia, e os testes das partes antigas continuam valendo.
- **O `gate:prontidao`** continua com os dois builds extras dele em `.cache/prontidao/`: é um portão, não o build do site.
- **Os nomes.** `--build` segue o `--lighthouse` (uma parte que roda uma coisa só); `--dist-pronto` segue o `--sem-playwright` (português, como os outros). Alternativas: `--so-build` e `--usar-dist` (mais longas e menos claras).
- **Alternativa recusada:** o build dentro do job `portoes`, com o upload no meio. O `needs` é por job: as partes do Playwright esperariam os portões inteiros.
- **A prova:**
  - o `tests/unit/verificar.test.ts` lê as partes do `ci.yml` (`scripts/lib/ci-parts.ts`) e confere que juntas são o `pnpm verificar` inteiro, com o build uma vez, cada portão uma vez e o `e2e` uma vez por parte;
  - o `tests/unit/ci-workflows.test.ts` confere que só o job `build` roda o build, que o upload leva o registro e que cada parte baixa o artefato depois do cache.

  O teste do ajuste idiomas que lia as duas matrizes do `ci.yml` (`matrixOf('verificar')`) perdeu essa leitura, porque o job `verificar` deixou de existir. As asserções dele sobre o `plan()` ficaram, e a do `ci.yml` passou ao teste novo, mais forte: as partes vêm do arquivo e o build conta uma vez.
- **O tamanho do artefato** (revisão da F9, C-2; medido com `gh api repos/vmatusita/fileorca/actions/runs/41660597548/artifacts`, só leitura): o `site` tem 23.038.126 bytes (23,0 MB) na execução 41660597548, e 23.038.125 na 41658317282. É o único artefato de uma execução verde (os relatórios do Playwright só sobem numa falha), um por execução completa ou de documentação, e expira 24 h depois do upload. O `dist/` sem compressão tem uns 46 MB.
- **A retenção de 1 dia e o rerun** (revisão da F9, A-3 e C-4): um `gh run rerun <id> --failed` feito mais de 24 h depois da execução roda só a parte vermelha, que não acha mais o artefato e falha no download. O `docs/OPERACAO.md` e o `docs/claude/ci.md` dizem que o `--failed` só vale em até 24 h e que, depois, a saída é o "Re-run all jobs" (que refaz o `build`) ou um push. A retenção não mudou: a ficha manda 1 dia. Se o "Re-run all jobs" tropeça no upload de um `site` que já existe na execução (o `upload-artifact` sem `overwrite` falha com nome repetido) não foi testado.

## § 325 · O preparo dos jobs do Playwright (F9, decisão 3)

- **O que é o preparo:** do início do job ao início do passo que roda o `pnpm verificar`. Inclui o checkout, o Node e o pnpm, o `pnpm install`, o navegador, os pacotes do sistema e o download do artefato. O `pnpm ci:custo` mede cada job, não a média.
- **Onde estava o tempo** (linha de base, execução 41590377930): o preparo foi de 55 a 128 s, com mediana de uns 75 s e 1 dos 18 jobs acima de 90 s.
  - O `playwright install --with-deps` levava de 19 a 27 s no Chromium e de 33 a 45 s no WebKit, com 86 s no pior caso.
  - A parte lenta é o `apt` do WebKit: uns 180 pacotes e 114 MB. O download do navegador leva de 3 a 8 s.
  - O `setup-node` levava de 11 a 17 s (o Node 24.22.2 não vem na imagem do runner, mais o cache do pnpm), e o `pnpm install`, de 7 a 12 s.
- **Abordagem 1, medida na execução 41658317282:** checkout raso, e logo depois o `npx playwright@<versão do lockfile> install --with-deps <navegador>` em segundo plano (`setsid nohup`, com a saída num arquivo), enquanto o job baixa o artefato e prepara o Node e o pnpm.
  - A versão sai do `pnpm-lock.yaml` (a linha `'@playwright/test@x.y.z':`), então o navegador é a mesma revisão que o `@playwright/test` instalado procura.
  - Um passo "Wait for the browser" espera o status do processo e falha se a instalação falhou, mostrando o fim do log dela. A espera era de até 300 s; passou a 1.200 s depois da execução final 41677467607 (abaixo).
  - O job do Lighthouse faz o mesmo, com o Chromium.
  - **Resultado:** o preparo dos 18 jobs foi de 41 a 116 s, com mediana de 53 s. Só o WebKit 13 de 13 passou de 90 s: 116 s, com 79 s de espera pelo navegador.
- **Abordagem 2, medida na execução 41660597548:** a 1, mais o `dpkg` sem `fsync` (`force-unsafe-io`) e sem o gatilho do `man-db`. A instalação passou a ser feita em duas etapas, os pacotes do sistema e depois o navegador, cada uma com o próprio tempo no log (linhas `[navegador]`).
  - **Resultado:** o preparo foi de 40 a 122 s, com mediana de 56 s. Só o WebKit 7 de 13 passou de 90 s: 122 s.
  - **Os pacotes do sistema** levaram de 13 a 33 s no Chromium e de 32 a 62 s no WebKit, com 99 s no WebKit 7. O navegador levou de 4 a 13 s.
- **A conclusão:** o critério "até 90 s em cada job" não fechou. Nas duas execuções, 17 dos 18 jobs ficaram em até 90 s (antes, 17 de 18 também, com mediana de uns 75 s). Em cada execução, um job do WebKit passou, pela variação do `apt` dos pacotes do sistema, e não pelo trabalho do job. A mediana caiu uns 20 s. O passo de espera passa a mostrar a linha "Fetched" do `apt`, para separar um espelho lento de um `dpkg` lento. A pendência "F9 preparo" fica para a F9b.
- **A opção B,** a imagem oficial `mcr.microsoft.com/playwright:v1.64.1-noble` rodada por um passo `docker run`, não foi medida: as duas medidas permitidas foram para a opção A. Contra a B pesavam:
  - 990 MB de camadas, com os três navegadores;
  - o Node 26 da imagem, quando o projeto pede o 24;
  - o diagnóstico de disco pela metade dentro do contêiner;
  - o disco: a § 141 registra `ENOSPC` com 72 GB. As máquinas desta run têm 145 GB, mas a linha de base rodou numa de 72 GB, e a máquina mudou entre a linha de base e a F9 (§ 339).
- **Alternativa recusada: o navegador em cache pelo `actions/cache`.** A documentação do Playwright desaconselha, porque restaurar leva o mesmo que baixar. O cache de uma PR só serve à própria PR, então a primeira execução seria fria. E o `apt`, que é a parte lenta, não se guarda assim.
- **As proteções da § 154 não mudaram.** Nos logs das 18 partes da execução 41658317282 aparecem:
  - o passo "Core dumps off" (`kernel.core_pattern = |/bin/false`) antes do `verificar`;
  - o `ulimit -c 0` no passo;
  - o passo "Disk and core dumps", com o `df` e o `core_pattern: |/bin/false`;
  - as linhas `[disco]`.

  O `tests/unit/ci-workflows.test.ts` fixa os passos. O disco livre mínimo das partes foi de 81 a 85 GB, contra 7 a 10 GB na linha de base: outra máquina (abaixo, § 339).
- **O que a revisão da F9 corrigiu neste registro** (C-5 e B-5):
  - **A abordagem 2 não deu ganho separável da 1.** As medianas foram 53 s (1) e 56 s (2), e os máximos 116 s e 122 s: o `dpkg` sem `fsync` e sem o `man-db` não mudou o preparo de forma que se meça em duas execuções. A queda de uns 20 s na mediana é das duas contra a linha de base (uns 75 s), e vem da instalação em segundo plano. A variante 2 ficou no `ci.yml` porque não piorou nada e dá o tempo de cada fase no log (linhas `[navegador]`), que a F9b vai usar.
  - **A opção B ficou sem medida por escolha, não por limite.** A ficha deixava medir duas opções, e a run gastou as duas em variantes da A, pelas razões acima. Medir a B é da F9b (pendência "F9 preparo").
  - **A linha "Fetched" do `apt`** entrou no passo de espera depois da última execução completa da F9 e ainda não apareceu num log; o `docs/claude/ci.md` diz que o passo "passa a mostrar" a linha.
  - **O `npx --yes playwright@<versão>`** baixa do registro do npm a versão exata que o `pnpm-lock.yaml` fixa, e o npm confere o hash que o registro publica para ela; uma versão publicada não muda. O que ele não faz é conferir esse pacote contra o `integrity` do `pnpm-lock.yaml`, como o `pnpm install --frozen-lockfile` fazia antes da F9 com o navegador. Conferir contra o lockfile (o `dist.integrity` de `npm view` contra a linha do lockfile, ou o navegador depois do `pnpm install`) fica para a F9b (pendência "F9 npx integridade"). O workflow só lê (`contents: read`) e não usa segredo, e o runner é descartável.
- **A execução final (41677467607) parou no preparo.** No WebKit 1 de 13, o `apt` travou baixando os pacotes do sistema do espelho `azure.archive.ubuntu.com` (o `apt-get update` levou 1 s; o download dos pacotes parou no meio), e a espera de 300 s se esgotou. As outras partes seguiram. No fluxo de antes da F9, a instalação no primeiro plano só parava no limite de 30 min do job, e já tinha levado 356 s (§ 108). O limite de 300 s era um defeito do desenho, não do teste. A espera passou a 1.200 s, abaixo dos 30 min do job. Pela ficha, a PR voltou a rascunho (`gh pr ready --undo`), a correção entrou e a PR ficou pronta de novo, o que deu mais uma execução completa. A linha "Fetched" do log da 41677467607 mostra que o `apt-get update` foi rápido e o download dos pacotes é que parou, o que aponta para o espelho, e não para o `dpkg` (pendência "F9 preparo").
- **Abordagem 3, depois da execução 41677467607:** o checkout esparso, sem `docs/relatorios/`, nos jobs `build`, `lighthouse` e `playwright` (`sparse-checkout` com `/*` e `!/docs/relatorios/`, em modo não cone; o `actions/checkout` fixado baixa então só os blobs do padrão, com `--filter=blob:none`). Nessa execução, o checkout raso da árvore inteira (448 MB versionados, 392 MB deles capturas de tela de `docs/relatorios/`) levou de 13 a 132 s, e foi a maior parte dos preparos acima de 90 s (8 de 18, com o `apt` mais lento que nas outras). No teste local, a árvore esparsa tem 59 MB. Nada do que esses jobs rodam lê `docs/relatorios/` (o `tests/unit/ci-workflows.test.ts` confere o código, fora dos comentários). A medida dela vai na descrição da PR, com o `ci:custo` da execução final; se o critério dos 90 s ainda não fechar, a pendência "F9 preparo" fica com a melhor medida das três.

## § 326 · Quando o CI roda: as classes (F9, decisão 4)

- **O script** é o `scripts/ci/classificar.ts`, com a função pura `classify()` e um CLI que lê o JSON do job e escreve `classe` e `motivo` no `GITHUB_OUTPUT`, e a linha `classificar: classe <x> - <motivo>` no log (o `ci:custo` a lê). O job `classificar` lê o script da base, como o `pode-mesclar.ts`; nesta PR a base não o tem e o job usa a cópia da própria PR.
- **A chamada do CLI** recebe um arquivo JSON (`isDraft`, `labels` e `files`, montado pelo `jq`), não argumentos soltos. Um campo novo entra no JSON sem mudar a chamada, que fica fixa depois de ir para a main (a regra da § 297, que o `tests/unit/ci-events.test.ts` fixa em `CLI_ON_MAIN`).
- **A tabela** é a da ficha:
  - rascunho sem o rótulo `ci`: `leve`;
  - rascunho com o rótulo, ou PR pronta: `completo`, ou `portões` quando todo arquivo do diff é documentação.

  "Só documentação" é todo arquivo em `docs/`, fora de `docs/design/` e de `docs/oli/`, ou um `.md` da raiz. O `LICENSE` não é `.md` e conta como código. Diff vazio, ou que o job não consegue ler (o `git diff` falhou), conta como `completo`.
- **A lista foi conferida:**
  - nenhum spec do Playwright lê `docs/` nem um `.md` da raiz: os `readFileSync` dos specs vão a `fixtures/`, `dist/`, `node_modules/` e `.cache/`, e as menções a `docs/` são comentários;
  - o Lighthouse lê só o `dist/` e o `.lighthouseci/`;
  - o build não importa nada de `docs/` fora de `docs/design/` e `docs/oli/`.

  O Vitest e os portões leem `docs/` (o `operacao.test.ts`, o `pendencias.test.ts`, o `launch-kit.test.ts` e o teste do `CLAUDE.md`) e rodam na classe `portões`.
- **O gatilho** ganhou o `labeled`. Um rótulo qualquer recalcula a classe, como um `synchronize`, e o `cancel-in-progress` cancela a execução em andamento. O `unlabeled` e o `converted_to_draft` não disparam. O Dependabot não põe rótulo (`labels: []`).
- **O pulo** é por `if` de job, nunca por `paths`. O `ci-ok` (§ 327) roda sempre.
- **O job `leve`** constrói o próprio `dist/`, porque o Vitest o lê (o `pix-qr.test.ts`). Alternativa: baixar o artefato do job `build`, que custaria um job a mais em todo push de rascunho.
- **A prova:** os 20 eventos de `fixtures/ci-events/` (um por linha da tabela, mais o fork, o `labeled` com outro rótulo, o `ready_for_review`, o `reopened`, o diff misto, as bordas de `docs/design/`, `docs/oli/`, `.md` fora da raiz, `LICENSE`, diff vazio e diff ilegível) passam pelo caminho do job no `tests/unit/ci-events.test.ts`:
  - o `env` do passo renderizado do evento (o `render()` ganhou o `toJSON(a.*.b)`);
  - o bloco do `git diff` rodado de verdade num repositório de rascunho, para o diff ilegível;
  - o `jq` real onde existe;
  - o CLI escrevendo no `GITHUB_OUTPUT`.

  O `pronta-docs` sai `portões`.

## § 327 · O ci-ok (F9, decisão 5)

- **O job** tem o id e o nome `ci-ok`, sem matriz, `if: always()` e `needs` com os seis jobs de verificação (`classificar`, `leve`, `build`, `portoes`, `lighthouse` e `playwright`). Um job pulado conta como aprovado num check obrigatório, por isso ele nunca é pulado.
- **A regra** é o `scripts/ci/ci-ok.ts` (função pura `verdict()` sobre o `toJSON(needs)`):
  - verde só com a classe saída e cada job em `success`, ou em `skipped` quando a classe não pede aquele job;
  - vermelho com `failure`, com `cancelled`, com `skipped` de um job pedido, sem classe e com um job da lista fora do `needs` (um `ci.yml` que deixou de esperar um job).

  Os jobs de cada classe estão em `REQUIRED`, e o teste confere que o `needs` do `ci-ok` é a união deles.
- **O script vem da base**, como o `pode-mesclar.ts`. Uma PR que não mexe em `.github/workflows/` não pode trocar a regra do próprio check e ter o merge automático; nesta PR a base não o tem e o job usa a cópia da PR. O job faz o checkout raso do commit de merge e um `git fetch --depth=1` do commit da base, sem `|| true`: se o fetch falhar, o job falha, e nunca cai na cópia da PR. Por isso é o único checkout que guarda as credenciais (o token só lê).
- **Alternativa recusada:** a regra escrita em `bash` e `jq` no próprio `ci.yml`, que também ficaria protegida (o merge recusa PR que mexe em workflow), mas não teria teste no Windows.
- **O `merge`** passa a esperar o `ci-ok` e só roda com ele verde, com a PR pronta (o `merge` de rascunho só dizia "rascunho"; pulá-lo economiza um minuto por push) e fora de fork (§ 333). O `alerta-dependabot` espera o `ci-ok` e o `merge`.
- **Execução cancelada.** Com `always()`, o `ci-ok` de uma execução cancelada roda e sai vermelho; a execução nova do mesmo commit (um `labeled`, ou o `gh pr ready` logo depois de um push) termina depois, com o próprio `ci-ok`. Aconteceu nesta PR: a execução do push de `8727853` foi cancelada pelo `ready_for_review`, e o `ci-ok` dela saiu vermelho. A frase de antes ("o da execução nova é o que vale", "ficou vermelho até a completa terminar verde") não tinha prova, e a API a desmente no commit: os dois check runs `ci-ok` (o vermelho da cancelada e o verde da 41658317282) continuam no `8727853`, em suítes diferentes, mesmo com `filter=latest`, e o `statusCheckRollup` dele ficou `FAILURE`. O que não se sabe: se o ruleset, que exige só o `ci-ok`, recusa o merge por causa do vermelho velho. Não foi testado, porque não há ruleset; a documentação do GitHub não diz qual de dois check runs de mesmo nome num commit vale (abaixo, "A revisão da F9").
- **O merge pulado na primeira execução completa (41658317282).** O `ci-ok` ficou verde e o `merge` foi pulado. O `success()` implícito do `if` de um job olha também os ancestrais indiretos, e o `leve` é ancestral do `merge` através do `ci-ok`: numa execução completa ou de documentação ele é sempre pulado, então o merge automático nunca aconteceria. O `merge` passa a `needs.ci-ok.result == 'success' && !cancelled() && …` e o `pos-deploy` a `needs.merge.result == 'success' && !cancelled() && …`: com uma função de status no `if`, o GitHub não acrescenta o `success()`. O `tests/unit/ci-workflows.test.ts` ganhou a regra geral (todo job depois do `leve` e do `build`, que se excluem, tem função de status explícita: `ci-ok`, `merge`, `alerta-dependabot` e `pos-deploy`), que reprova o `if` de antes.
- **A prova:**
  - o `tests/unit/ci-ok.test.ts` reprova cada resultado ruim em cada job de cada classe, a classificação ausente, falha, pulada, vazia ou desconhecida, um job pedido e pulado, e o `needs` ilegível, e roda o CLI;
  - o `tests/unit/ci-workflows.test.ts` confere o job e o `merge`.
- **A revisão da F9** (achados A-1, A-2, A-4, A-5, B-1, D-1 e F-1):
  - **O estado de rascunho na hora (A-2).** A classe sai do payload do evento. No fim de uma run, o `synchronize` de um push (rascunho) e o `ready_for_review` chegam com um segundo de diferença, e o `cancel-in-progress` fica com a execução enfileirada por último, numa ordem que o GitHub não garante: se a do push vencesse, uma PR pronta ficaria com o `ci-ok` verde da classe `leve`. O job `ci-ok` passou a ler o estado da PR com `gh api "repos/$GH_REPO/pulls/$PR" --jq .draft` (com `permissions: contents: read, pull-requests: read` no job, e `GH_TOKEN`, `GH_REPO` e `PR` só no passo Verdict) e a passá-lo ao script em `PR_DRAFT_NOW`, sem mudar a chamada do CLI. O `verdict(needs, draftNow?)` dá vermelho para a classe `leve` com `draftNow === false`, com a linha "a classe é leve, mas a PR está pronta: esta execução veio de um evento de rascunho; a execução completa tem de rodar". Sem a variável, ou com outro valor que `true` e `false`, o CLI falha. As outras classes rodam tudo o que pedem, rascunho ou não. Alternativas recusadas: ler o estado no `classificar` (a corrida continua entre o `classificar` e o fim da execução, e o `ci-ok` é o que o ruleset lê); usar só o payload (é a falha).
  - **O veredito tem de aparecer (A-4).** O shell padrão de um `run:` sem `shell:` é `bash -e {0}`, sem `pipefail`, e o workflow não tem `defaults`. O passo Verdict liga o `pipefail`, grava a saída do script com `tee` num arquivo e só fica verde com `grep -qx 'ci-ok: verde'` nele. Um script que nunca chega ao veredito (um Node sem `import.meta.main`, que viria do `.node-version` da própria PR) falha o passo. O `tests/unit/ci-workflows.test.ts` roda o fim do passo em `bash -e` contra o script de verdade e contra scripts que não dizem nada, dizem vermelho ou saem com 1.
  - **O script sozinho (A-5).** O teste do CLI copia o `ci-ok.ts` para uma pasta temporária e roda de lá, como o job faz em `$RUNNER_TEMP/ci/`: um import de arquivo irmão falharia no Vitest, e não só depois de ir para a `main`.
  - **A função de status explícita (D-1).** A regra geral do `ci-workflows.test.ts` aceitava `success()`, que é o mesmo que o implícito. Agora aceita só `always()`, `cancelled()` (como em `!cancelled()`) e `failure()`, com um controle que põe `success() &&` no `if` do `merge` e outro que tira o `!cancelled()`, e espera a falha.
  - **O `ci-ok` duplicado (A-1, B-1 e F-1).** O `if: always()` do `ci-ok` fica, porque a ficha da F9 o manda. O `alerta-dependabot` ganhou `!cancelled()` (`failure() && !cancelled() && …`): o `ci-ok` de uma execução cancelada sai vermelho, e uma PR do Dependabot cuja execução é cancelada (um rebase, um rótulo) não pode abrir a issue "CI vermelho". O texto do `docs/claude/ci.md` e o item acima dizem o que a API mostrou e o que não se sabe. O fim de run passou a ser outro, acrescentado (nunca trocado) numa nota à regra 1 do `CLAUDE.md` e no `docs/claude/ci.md`: rodar o `gh pr ready` antes do último push, para o último commit ganhar uma execução só, a completa, ou esperar a execução leve terminar antes do `gh pr ready`. O `docs/OPERACAO.md` diz o que fazer se o merge for recusado por um `ci-ok` vermelho de execução cancelada (rodar de novo a cancelada com `gh run rerun <id>`, ou um push; não testado). Testar com o ruleset ativo, e escolher entre `always()` e `!cancelled()` se ele bloquear, é do Victor (pendência "F9 ci-ok duplicado").
- **A segunda passada da revisão (R2-1, R2-3 e R2-7).**
  - O fim de run do `CLAUDE.md` (o `gh pr ready` antes do último push, ou esperar a execução leve entre os dois) refina a ficha da F9, que diz "o push e logo em seguida o `gh pr ready`". A ficha de cada run vence, e a nota diz isso. Nesta run, o fim foi o push, a espera da execução leve e o `gh pr ready`, na ordem da ficha.
  - O `docs/claude/ci.md` diz como fazer a completa rodar quando o `ci-ok` sai vermelho com a classe `leve` numa PR pronta (`gh pr ready --undo` e `gh pr ready`, ou rodar de novo a execução do `ready_for_review`), e que um erro passageiro do `gh api` pede só rodar de novo.
  - O teste da função de status reprova também um `success()` escrito em qualquer ponto do `if`, mesmo ao lado de `!cancelled()`.

## § 328 · Os miúdos do CI (F9, decisão 6)

- **`fetch-depth: 0` só onde o histórico é lido:** no `classificar` (o `git diff` três pontos pede o merge-base), no `leve` e no `portoes` (o Vitest lê o `HEAD~1`, o `503b8c3` e o `CLAUDE.md` de antes da F9, e o `lint:texto` faz o diff contra a base) e no `merge`. O `build`, o `lighthouse`, as 18 partes do Playwright e o `ci-ok` fazem o checkout raso. O `build.txt` só pede o `git rev-parse HEAD`, que funciona raso.
- **`persist-credentials: false`** em todo checkout menos o do `ci-ok` (§ 327).
- **O comentário do topo do `ci.yml`** descreve o CI novo: as classes, os jobs, o artefato, o preparo, o `ci-ok` e a guarda de fork.
- **O cache das ferramentas** guardava a pasta `.cache/` inteira, uns 555 MB por PR com os builds do `gate:prontidao` e um `bundle-modules.json` velho (o limite de cache do repositório é de 10 GB, e as PRs já ocupavam 8,56 GB). Ele passa a guardar só as pastas das ferramentas fixadas (`.cache/actionlint-*`, `shellcheck-*`, `languagetool-*` e `jre-*`). O download do artefato continua depois dele, e o `tests/unit/ci-workflows.test.ts` confere os dois. O cache de uma PR só serve à própria PR, e a `main` não gera cache, então a primeira execução de cada PR é fria.
- **O `mini-yaml.ts`** foi de `tests/unit/lib/` para `scripts/lib/`, porque o `pnpm verificar --partes` lê o `ci.yml` com ele. O `tests/unit/lib/mini-yaml.ts` o reexporta, e os testes não mudam o import. A classe `Reader` trocou a "parameter property" por um campo comum: o Node roda o arquivo por remoção de tipos, que não aceita essa sintaxe.

## § 329 · O pnpm verificar --partes (F9, decisão 6; fecha a § 242)

- **O que faz:**
  - lê as partes do `.github/workflows/ci.yml` pelo `scripts/lib/ci-parts.ts` (cada linha `pnpm verificar <args>` dos passos, na ordem dos jobs, com o `${{ matrix.args }}` expandido por entrada da matriz), menos a do job `leve`, que é a classe do rascunho e não parte do todo;
  - roda cada uma como um `node scripts/verificar.ts <args>` próprio, em sequência: primeiro o `--build`, depois as 20 com `--dist-pronto`. Cada parte tem o próprio limite de 900 s e imprime o próprio resumo;
  - para na primeira que falha e mostra o tempo de cada parte e a soma.
- **Na máquina local**, o `CI` não está definido, então o Playwright usa o número de workers padrão, e os tempos não se comparam com os do CI.
- **A prova:** o `tests/unit/verificar.test.ts` confere que as partes do `ci.yml` são o build e as 20 do ajuste idiomas com `--dist-pronto`, e que juntas são o todo, com o build uma vez. A execução real está no relatório.

## § 330 · O teste lento do F8 ensaio-3 (F9, decisão 6; fecha a pendência)

- **O teste:** "keeps the links that stay inside a part and drops the ones that lead out of it", do `tests/unit/pdf-engine-ops.test.ts`. Ele estourava os 5 s do Vitest com a suíte inteira numa máquina carregada (§ 299, falha 3). Nesta run estourou de novo uma vez, com os agentes rodando ao lado (5.009 ms).
- **A causa, no próprio teste:** ele lia com o PDF.js as 117 páginas do `pdf-grande-fontes-embutidas-117p.pdf`, com o texto, as anotações e a lista de operadores de cada página, só para achar a primeira página com 30 links e a contagem dela. Era a maior parte do tempo. O motor (`src/`) não tem culpa: o split de uma página e a leitura da saída são rápidos.
- **A correção:** a contagem de links de cada página vem do oráculo `fixtures/pdf/expected.json`, que guarda a leitura do PDF.js no momento em que a fixture foi feita (`scripts/fixtures/pdf.ts`), independente do motor. O teste confere que o oráculo tem as 117 páginas e que a página existe. A saída continua lida pelo PDF.js e pelo qpdf, e as asserções são as mesmas, mais uma (a saída tem uma página). O tempo limite do teste não mudou.
- **As medidas, todas nesta máquina:**
  - sozinho, três vezes: de 1.735, 1.699 e 1.714 ms para 325, 303 e 313 ms;
  - o Vitest inteiro três vezes com o Playwright rodando ao lado (`chromium --shard=2/5`, 2 workers): as três rodadas passaram, com 96 arquivos e 1.664 testes, e o teste levou 224, 181 e 147 ms.
- **Alternativa recusada:** ler só a página certa da fonte com o PDF.js. Seria mais rápido que antes, mas ainda pediria para abrir o PDF de 5 MB, que o oráculo já leu.

## § 331 · O CLAUDE.md enxuto e a pasta docs/claude/ (F9, decisão 7)

- **O tamanho.** O `CLAUDE.md` de `bbd30c8` (a main de antes da F9) tinha 78.256 bytes e 557 linhas, e entrava inteiro no contexto de cada agente e subagente. O novo tem 15.119 bytes, abaixo dos 25.600 da ficha. Os dez arquivos de `docs/claude/` somam 70.602 bytes: `ci.md` 11.253, `idiomas.md` 10.713, `calculadoras.md` 9.999, `pdf.md` 7.256, `imagem.md` 7.167, `design-e-oli.md` 6.438, `windows-git-bash.md` 5.908, `service-worker.md` 4.856, `playwright.md` 4.261 e `anuncios.md` 2.751. Depois, a seção da F9 (o CI novo e as pegadinhas da run) levou o `ci.md` a 16.053 bytes e o `windows-git-bash.md` a 6.660; o `CLAUDE.md` não mudou. Esses números são os do primeiro registro; os de agora estão no item "Os tamanhos depois da revisão", abaixo.
- **O núcleo, no `CLAUDE.md`:** a abertura; o projeto; a fonte de verdade, com a ordem nova da decisão 12; a arquitetura fixa; o Git; o que fica fora de toda run; os testes; as regras que nenhuma run quebra; como a run termina; o idioma; as "Regras novas de toda run" do `PLANO-MELHORIAS.md`, com o texto literal das linhas 62 a 69 dele, sob "Regras de toda run (PLANO-MELHORIAS.md)"; o índice "mexeu em X, leia `docs/claude/X.md`", uma linha por arquivo; e as tabelas de comandos de todas as fases (F1a, F2, F4, F5a, F5b, F6 e F7, cada uma com a linha que a abre), mais a tabela nova da F9.
- **Como as linhas foram.** Por script, do `git show bbd30c8:CLAUDE.md`: cada linha não vazia tem um destino (o núcleo, um arquivo de tema, ou a lista abaixo), e o script grava o texto lido, sem redigitar. A linha com U+00A0 (o `sed` da F8) foi junto. Dentro de cada arquivo, as linhas seguem a ordem do arquivo antigo, sob o cabeçalho `##` de origem.
- **O destino de cada seção:**
  - "O projeto em cinco linhas" até "Idioma": no núcleo, com as linhas reescritas abaixo.
  - "F1a: comandos e pegadinhas": a tabela e o "Rodar um teste só" no núcleo. As pegadinhas: Node e pnpm, `CI=true`, Astro e Vite, `exactOptionalPropertyTypes` e Worker Previews no `ci.md`; Preact no `design-e-oli.md`; `mount.ts` no `imagem.md`; o WebKit sem `OffscreenCanvas` no `playwright.md`; o heredoc e o push com a PR na mesma linha no `windows-git-bash.md`; o LanguageTool no `idiomas.md`.
  - "Ajuste da prévia": inteiro no `ci.md`.
  - "F1b": o CSS, o tema, a Oli, os ícones, o `pnpm screenshots` e as pegadinhas de CSS e SVG no `design-e-oli.md`; o `cat >>` no `windows-git-bash.md`; o runner 5 vezes mais lento no `ci.md`.
  - "F2": a tabela no núcleo; o passo a passo e as pegadinhas do motor no `imagem.md`; o colar, o `serve-dist` e a porta 4173 no `playwright.md`; o `pos-deploy.test.ts` no `ci.md`.
  - "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes" e "Ajuste: diagnóstico de disco": no `ci.md`, menos as linhas que saíram.
  - "F3": o `gate:prontidao` e o navegador na produção sem o Google no `anuncios.md`; o método da revisão adversarial e o `node -e` no `windows-git-bash.md`; o fundo do `body` e os screenshots com o aviso no `design-e-oli.md`; o `loading()` e o worker sem `OffscreenCanvas` no `imagem.md`; o WebKit travado e o `context.on('request')` no `playwright.md`.
  - "Ajuste: espaço do aviso de cookies": a regra no `design-e-oli.md`; o `dismissCookies` no `playwright.md`.
  - "F4": a tabela no núcleo; a convenção do dinheiro, o passo a passo e as pegadinhas de calculadora no `calculadoras.md`; o uv, o heredoc, o `node -e` e o `git checkout` no `windows-git-bash.md`; o `networkidle` e os `money-*.spec.ts` no `playwright.md`; o `ENOSPC` no `ci.md`.
  - "F5a": a tabela no núcleo; o passo a passo, as regras do PDF.js, do qpdf e do pdf-lib e as pegadinhas de PDF no `pdf.md`; o worker avaliado duas vezes e o WebKit do Windows sem imagem no worker no `imagem.md`; o que cada parte do Playwright faz (§ 154) e o `pnpm tipos` no `ci.md`; os agentes em worktree no `windows-git-bash.md`.
  - "F5b": a tabela no núcleo; o guia de arquivo, a regra dos números, o kit e as pegadinhas de texto no `idiomas.md`; o `--color-*` no `design-e-oli.md`; a porta do `guias:medir` no `playwright.md`; o heredoc e o `node -e` no `windows-git-bash.md`.
  - "F6": a tabela no núcleo; o passo a passo de pt e es, o formato de cada idioma e as pegadinhas de texto no `idiomas.md`; o Pix no `anuncios.md`; o cache do Vitest e o "`.github/` não mudou" no `ci.md`; o número do resultado e o rótulo com "exemplo" no `calculadoras.md`; o `i18n-budgets.spec.ts` no `playwright.md`; o `fill` depois de soltar o PDF no `pdf.md`; o `String.replace` e o "/" no `windows-git-bash.md`.
  - "F7: casa, saúde e QR code": a tabela no núcleo; a calculadora de casa ou saúde, os hubs, o `lead`, as datas e o WebFetch no `calculadoras.md`; o QR code, o CommonJS e o `jsqr` no `imagem.md`; o `design.spec.ts` e o `image-matrix.spec.ts` nunca na mesma parte no `ci.md`; o `String.replace` no `windows-git-bash.md`.
  - "F7: o que a revisão mudou nos formulários das calculadoras": no `calculadoras.md`, menos o alto contraste, no `playwright.md`.
  - "F8": o service worker, o compartilhar e as pegadinhas deles no `service-worker.md`; o Dependabot, a regra de merge, o `verificar.test.ts` e o `--assignee` no `ci.md`; as fontes e o CLS no `design-e-oli.md`; o relógio falso, o teste do site inteiro e o `axe-pdf-states.spec.ts` no `playwright.md`; o `SETTLE_MS` no `calculadoras.md`; o `sed` no `windows-git-bash.md`.
  - "Ajuste: idiomas": a introdução e "Como uma página ganha versão num idioma" no `idiomas.md`; o `verificar.test.ts` e a estimativa das partes no `ci.md`; os 740 px e o rótulo de duas palavras no `calculadoras.md`; o foco da ação no `pdf.md`; o ` `, o trailer dos merges e o `git worktree remove` no `windows-git-bash.md`.
- **O critério de tema.** Cada linha de conteúdo vai para um arquivo só, o do assunto dela: o comportamento de uma ferramenta, para o arquivo dela; um macete do Playwright, do navegador ou do runner, para o `playwright.md`; o CI, o `verificar`, o Dependabot, a regra de merge, o Workers Builds e as ferramentas do projeto (Node, pnpm, Astro, Vite e Vitest), para o `ci.md`; o shell, o Git, as worktrees e os agentes, para o `windows-git-bash.md`. Os julgamentos: o método da revisão adversarial foi para o `windows-git-bash.md` (é trabalho de worktree e de agente); os guias de arquivo e o kit do Product Hunt, para o `idiomas.md` (são regras de texto); o QR code, para o `imagem.md`; o Pix, para o `anuncios.md` (a receita); os passos de uma calculadora em pt e es (antigas 390, 391, 532 e 533) ficaram só no `idiomas.md`, e a abertura do `calculadoras.md` aponta para lá. Só se repetem os cabeçalhos `##` de origem e as linhas que abrem uma lista ("Pegadinhas que a F4 achou:"): cada arquivo leva os das linhas dele.
- **O que é texto novo.** No núcleo: a abertura, os itens 2 a 6 da fonte de verdade, a linha da PR em rascunho, a linha do ruleset (`docs/ops/ruleset-main.json`, a quarta camada, que o Victor importa no GitHub), a seção das regras de toda run, o índice, o "Comandos" com os subtítulos de cada fase e a tabela da F9. Em `docs/claude/`: o título e a frase de abertura de cada arquivo e, no `ci.md`, a linha "Partes do CI (o que continua valendo depois da F9, que tirou a lista das partes de então):" antes das quatro regras das partes cuja linha de abertura saiu (as antigas 298, 438, 501 e 542). Também são texto novo as seções "F9: …" do fim do `ci.md` (o CI novo e as pegadinhas da run), do `windows-git-bash.md` e do `idiomas.md` (pegadinhas da run), e o que a revisão da F9 acrescentou (abaixo).
- **A regra de nunca apagar muda uma vez** (mudança 4 do contrato do `PLANO-MELHORIAS.md`). A abertura do `CLAUDE.md` diz que a F9 compactou o arquivo uma vez e que, daqui em diante, as runs acrescentam no arquivo do tema em `docs/claude/` (seção nova no fim), e o `CLAUDE.md` só muda no núcleo e no índice, também só acrescentando; nunca apagam nem afrouxam uma regra. Um arquivo novo de `docs/claude/` entra com uma linha no índice.
- **A prova.** O `tests/unit/claude-md.test.ts` (a lógica é a função pura `claudeMdProblems`, em `tests/unit/lib/claude-md.ts`) lê o `CLAUDE.md` de `bbd30c8` pelo `git show` e reprova:
  - uma linha não vazia dele que não esteja, igual, no `CLAUDE.md` ou num arquivo de `docs/claude/` (a linha inteira, sem os espaços do fim, nunca um pedaço), a não ser que esteja no bloco abaixo;
  - uma linha do bloco que ainda esteja no `CLAUDE.md` ou em `docs/claude/`, ou que não seja do arquivo antigo;
  - o `CLAUDE.md` acima de 25.600 bytes;
  - um arquivo de `docs/claude/` fora do índice, um item do índice sem arquivo ou um arquivo citado em duas linhas do índice;
  - uma linha da seção "Regras novas de toda run" do `PLANO-MELHORIAS.md` que não esteja, igual, no `CLAUDE.md`.

  O teste acha este § pelo título e pela frase que abre o bloco, nunca pelo número, que pode mudar num merge com a main. Os controles rodam a mesma função sobre entradas mudadas em memória e esperam a falha: uma linha apagada de `docs/claude/`, uma linha com texto a mais no fim, o `CLAUDE.md` com 25.601 bytes, um arquivo fora do índice, um item do índice sem arquivo, uma linha do bloco de volta em `docs/claude/` e uma regra nova fora do `CLAUDE.md`.
- **Se a main andar** antes do merge da F9 com linhas novas no `CLAUDE.md`, elas vão, com o texto igual, para o arquivo do tema, e a constante `BEFORE_F9` do teste passa ao commit novo da main (o comentário dela diz isso). A frase que abre o bloco continua com `bbd30c8`: ela é o nome do bloco, não a constante.
- **A revisão da F9** (achados E-1 a E-6 e D-5):
  - **O núcleo preso ao `CLAUDE.md` (E-3).** O teste só perguntava se cada linha de antes estava em algum arquivo, então uma regra do núcleo podia ir para `docs/claude/` sem reprovar. A função `coreLines()` (`tests/unit/lib/claude-md.ts`) dá as linhas do `CLAUDE.md` de `bbd30c8` que este § deu ao núcleo: todas as linhas acima do primeiro cabeçalho de fase ("## F1a: "), menos as do bloco das que saíram, e, nas seções de fase, as linhas das tabelas de comandos e as que as abrem ("Comandos novos:", "Scripts do `package.json`…" e "Rodar um teste só:"). São 79 linhas (35 e 44), e nenhuma está também num arquivo de tema. O `claudeMdProblems` reprova uma delas fora do `CLAUDE.md`, e um controle move uma linha do núcleo (e uma linha de tabela) para o `ci.md` e espera a falha. As linhas novas da F9 no núcleo ficam fora dessa lista: a F9 pode ajustá-las, e as seis regras já têm o teste delas.
  - **O índice com os assuntos que faltavam (E-1 e E-2).** As linhas do índice, que são da F9, passaram a dizer como texto, sem um segundo caminho entre crases (o teste proíbe dois numa linha): o Astro e o `build.format`, o TypeScript e o `exactOptionalPropertyTypes` e o `pnpm tipos` nos specs (na linha do `ci.md`); o Preact (na do `design-e-oli.md`); a ilha e o `mount.ts` (na do `imagem.md`); e que o `pnpm screenshots` tem pegadinhas também nos arquivos do service worker e de PDF, o `lint:texto` também no das calculadoras, e o `uv` no do Git Bash.
  - **Regras novas do núcleo (E-5), só acrescentando:** em "Regras que nenhuma run quebra", a do repositório público (nenhum dado pessoal, token ou achado da auditoria em arquivo do Git, commit, PR, log ou artefato); em "Fora de toda run", criar ou mudar rótulos do GitHub e importar ou mudar rulesets; e, depois das seis regras, as notas à regra 1 (o rótulo `ci` depende de o Victor criá-lo, e o fim de run da § 327).
  - **Os números de partes antigos (E-4).** O começo do `ci.md` e do `playwright.md` ganhou uma linha que diz que os números de partes das seções de antes da F9 são os de cada época, e o fim da seção da F9 do `ci.md` ganhou "O que a revisão da F9 acrescentou": o fim de run, o estado de rascunho na hora, a linha verde, o `--failed` em 24 h, a divisão de hoje (Chromium em 5, WebKit em 13), a proteção contra fork, o `fetch-depth`, o preparo em segundo plano e como reproduzir uma parte (`pnpm verificar --build` e depois o comando do passo).
  - **Os tamanhos depois da revisão (E-6, `wc -c`):** o `CLAUDE.md` tem 16.966 bytes (era 15.119 no commit da revisão, `859f7b4`); os dez arquivos somam 83.131 bytes: `ci.md` 22.395 (17.608 em `859f7b4`), `idiomas.md` 11.125, `calculadoras.md` 9.999, `pdf.md` 7.256, `imagem.md` 7.167, `windows-git-bash.md` 6.660, `design-e-oli.md` 6.438, `service-worker.md` 4.856, `playwright.md` 4.484 e `anuncios.md` 2.751.
  - **O comentário do `scripts/guides/lib/browser.ts` (D-5)** ainda aponta para o `CLAUDE.md` (F3) sobre os domínios do Google, que foram para o `anuncios.md`. Ele não mudou: o `tests/unit/guides-measured.test.ts` confere o SHA-256 dos arquivos de `scripts/guides/`, e mudar um byte pediria medir os guias de novo (`pnpm guias:medir`), fora do escopo da F9. Fica para a próxima run que medir os guias (pendência "F9 comentário guias").
- **Alternativas.** Deixar a linha da PR antiga e só somar a regra nova 1 (as duas se contradiriam, e a antiga manda abrir a PR no fim). Tirar do núcleo as tabelas de comandos (a ficha manda que fiquem). Tirar também as linhas 205, 298, 438, 501 e 542, que falam das partes (são regras que continuam valendo, mesmo com números de partes velhos: a mecânica do `--shard`, as proteções da § 154, o `design.spec.ts` longe do `image-matrix.spec.ts`, o `verificar.test.ts` que lê as matrizes e o `--list` antes de somar specs). Pôr uma pegadinha em dois arquivos (dobraria a manutenção e o risco de as cópias divergirem). A mensagem do commit `docs: slim CLAUDE.md…` diz "four lines rewritten"; são cinco (3, 16, 17, 18 e 29), e nada foi reescrito no histórico.

### As linhas que saíram

Linhas que saíram do CLAUDE.md de bbd30c8, texto igual:

```text
Regras para toda run do Claude Code neste repositório. Valem junto com a ficha da run e o PLANO-FILEORCA.md. As runs só acrescentam a este arquivo (seção nova no fim); nunca apagam nem afrouxam uma regra.
2. PLANO-FILEORCA.md (as "Decisões fechadas" são contrato: nenhuma run muda).
3. DECISOES.md (§ numerados), docs/adr/, docs/design/ (design system), docs/F0-SAIDA.md e data/keywords.csv.
4. O código existente.
- No fim, abra a PR com `gh pr create`. O merge é do CI: **nunca** rode `gh pr merge`.
- O CI roda o `pnpm verificar` em partes, cada uma num job com o limite de 900 s: `verificar` (`pnpm verificar --sem-playwright`, todos os portões menos o Playwright) e `playwright (chromium)`, `playwright (webkit 1 de 2)` e `playwright (webkit 2 de 2)` (`pnpm verificar --playwright=webkit --shard=1/2`). O `merge` espera todos. Na sua máquina, `pnpm verificar` sem argumento continua rodando tudo.
- O CI passa a ter cinco partes, cada uma num job com o limite de 900 s: `verificar` (`pnpm verificar --sem-playwright`), `playwright (chromium)` e `playwright (webkit 1 de 3)`, `playwright (webkit 2 de 3)` e `playwright (webkit 3 de 3)` (`pnpm verificar --playwright=webkit --shard=i/3`). Isto substitui a descrição das partes na seção "Ajuste: CI em partes (ADR-003)", que fica como está; o resto daquela seção continua valendo (DECISOES § 108).
- O `tests/unit/verificar.test.ts` não lê o `ci.yml`: a lista de partes dele é escrita à mão e segue com `1/2` e `2/2`. A asserção tira o `--shard` antes de comparar, então prova a cobertura para qualquer número de partes.
Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)" e "Ajuste: WebKit em três partes", que ficam como estão.
- **As partes:** são onze, cada uma num job com o limite de 900 s e o alvo de 700 s.
  - o `verificar` (`--sem-playwright`);
  - o `playwright (chromium 1 de 3)` ao `3 de 3` (`--playwright=chromium --shard=i/3`);
  - o `playwright (webkit 1 de 7)` ao `7 de 7` (`--playwright=webkit --shard=i/7`).
- **Antes de somar specs:** rode o `--list` de cada parte (Chromium em 3, WebKit em 7) e veja onde caem o `design.spec.ts` e a matriz de imagens.
  - Hoje o `design.spec.ts` fica inteiro na parte 4 do WebKit, e a matriz de imagens na parte 5.
  - Com 6 partes, os dois cairiam juntos (§ 142).
- **O `tests/unit/verificar.test.ts`** traz as partes da F5a escritas à mão. Mudou o `ci.yml`, mude o teste.
Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes" e "F5a", que ficam como estão.
- **As partes:** são treze, cada uma num job com o limite de 900 s e o alvo de 700 s: o `verificar` (`--sem-playwright`), o `playwright (chromium 1 de 4)` ao `4 de 4` (`--playwright=chromium --shard=i/4`) e o `playwright (webkit 1 de 8)` ao `8 de 8` (`--playwright=webkit --shard=i/8`).
- **O `tests/unit/verificar.test.ts`** traz as 13 partes escritas à mão. Mudou o `ci.yml`, mude o teste.
Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes", "F5a" e "F7", que ficam como estão.
- **As partes:** são quinze, cada uma num job com o limite de 900 s e o alvo de 700 s: o `verificar` (`--sem-playwright`), o `playwright (chromium 1 de 4)` ao `4 de 4` e o `playwright (webkit 1 de 10)` ao `10 de 10` (§ 302). O job `alerta-dependabot` vem depois de todas.
Partes do CI. Isto substitui a descrição das seções "Ajuste: CI em partes (ADR-003)", "Ajuste: WebKit em três partes", "F5a", "F7" e "F8", que ficam como estão.
- **As partes:** são vinte, cada uma num job com o limite de 900 s e o alvo de 700 s: o `verificar` em duas (`--sem-playwright --sem-lighthouse` e `--lighthouse`, uma matriz no mesmo job, então o `merge` e o `alerta-dependabot` esperam as duas), o `playwright (chromium 1 de 5)` ao `5 de 5` e o `playwright (webkit 1 de 13)` ao `13 de 13` (§ 320).
```

Por que cada uma saiu (o número é a linha no `CLAUDE.md` de `bbd30c8`):

- **3** (a abertura, "As runs só acrescentam a este arquivo"): reescrita pela mudança 4 do contrato; a abertura nova diz a regra de acrescentar em `docs/claude/`.
- **16, 17 e 18** (os itens 2 a 4 da fonte de verdade): reescritos pela decisão 12, na ordem nova. O `PLANO-MELHORIAS.md` entra em 2 e o `CLAUDE.md` com `docs/claude/` em 4; o texto do `PLANO-FILEORCA.md`, do `DECISOES.md` e do código continua, com outro número. O item 1 (linha 15) ficou igual.
- **29** ("No fim, abra a PR com `gh pr create`"): conflitava com a regra nova 1, a PR em rascunho desde o começo. A linha nova manda abrir com `gh pr create --draft` logo depois do primeiro push e marcar com `gh pr ready` no fim, e guarda o "**nunca** rode `gh pr merge`".
- **153** (as partes da ADR-003: `verificar`, `chromium`, `webkit 1 de 2` e `2 de 2`): descrição de partes substituída pela linha 204. O que ainda vale dela, "`pnpm verificar` sem argumento roda tudo", está na tabela da F1a, no núcleo.
- **204** (as cinco partes do "WebKit em três partes", com o "Isto substitui"): descrição substituída pela da F5a.
- **206** (o `verificar.test.ts` "não lê o `ci.yml`", com a lista à mão em `1/2` e `2/2`): falsa desde a F8; as linhas 501 e 542, que ficam, dizem que o teste lê as matrizes do `ci.yml`.
- **292** ("Partes do CI. Isto substitui…", da F5a): a frase "Isto substitui"; a descrição que ela abria saiu.
- **294 a 297** (as onze partes da F5a, com as três sublinhas): descrição substituída pela da F7.
- **299, 300 e 301** ("Antes de somar specs" com o Chromium em 3 e o WebKit em 7, o `design.spec.ts` na parte 4 e "Com 6 partes"): a posição das onze partes. A regra continua nas linhas 438, 501 e 542 do `ci.md` e na 262 do `playwright.md`.
- **302** (o `verificar.test.ts` com as partes da F5a escritas à mão): falsa desde a F8 (linhas 501 e 542).
- **435** ("Partes do CI. Isto substitui…", da F7): a frase "Isto substitui".
- **437** (as treze partes da F7): descrição substituída pela da F8.
- **439** (o `verificar.test.ts` com as 13 partes escritas à mão): falsa desde a F8.
- **498** ("Partes do CI. Isto substitui…", da F8): a frase "Isto substitui".
- **500** (as quinze partes da F8): descrição substituída pela do ajuste idiomas.
- **539** ("Partes do CI. Isto substitui…", do ajuste idiomas): a frase "Isto substitui".
- **541** (as vinte partes do ajuste idiomas, § 320): descrição substituída pela do CI da F9, que fica na seção da F9 do `docs/claude/ci.md` e no adendo da ADR-003.

## § 332 · A auditoria para o repositório público (F9, decisão 8)

- **O comando:** `pnpm publico:auditar` (`scripts/publico/auditar.ts`), no padrão `grupo:verbo` dos scripts de apoio (`motor:exportar`, `guias:medir`). A lógica pura fica em `scripts/publico/lib/`: `pii.ts`, `exif.ts`, `classify.ts`, `git-parse.ts` e `report.ts`. Os 43 testes de `tests/unit/publico-{pii,exif,classify,report}.test.ts` usam só dados sintéticos: CPFs feitos pelo próprio dígito, domínios de exemplo ou fictícios, a faixa 555-01xx e um Exif com GPS montado em memória. Também confirmam que uma amostra pública com GPS (`fixtures/images/jpg-02-iphone6-paisagem-gps.jpg`) é lida, sem gravar a coordenada no teste. Fica fora do `verificar`, porque usa a rede.
- **O espelho:** `git clone --mirror` em `.cache/auditoria/fileorca.git` e, nas vezes seguintes, `git remote update --prune`. A URL usada é a pública, fixa no script, e nunca a do remoto local, que pode levar token. O espelho traz as `refs/pull/*/head`, onde estão os commits das branches de run apagadas depois do squash.
- **O gitleaks 8.30.1 (MIT):** fixado no `scripts/lib/tools.ts` (`GITLEAKS`) para `win32-x64` e `linux-x64`. Os dois SHA-256 conferem com o `gitleaks_8.30.1_checksums.txt` da release.
  - **No histórico:** `gitleaks git <espelho> --log-opts="--all --full-history -m --no-textconv --no-ext-diff"`. O `-m` existe porque o padrão (`--all --full-history`) deixa de fora o diff dos commits de merge. O `--no-textconv --no-ext-diff` existe porque o Git for Windows liga os PDFs a um textconv no gitattributes do sistema, e um repositório bare não lê o `*.pdf binary` do projeto. Na primeira execução, o textconv falhou numa fixture, o `git log` parou e o gitleaks disse 225 de 566 commits com o código 7, como se tivesse lido tudo.
  - **A conferência da completude:** o script compara os commits que o gitleaks diz ter lido com os commits cujo diff tem texto. Um commit que só mexe em binários não entra no `git log -p`. Quando os números não batem, ou quando o gitleaks imprime uma linha `ERR`, o script mostra "INCOMPLETO".
  - **Na árvore:** o HEAD do espelho e o HEAD local (quando diferem) saem por `git archive` para `.cache/auditoria/tree*`, e o gitleaks roda com `gitleaks dir` sobre eles. Essas pastas são apagadas no fim, porque o `tsconfig.json` não exclui `.cache/` e elas têm `.ts`.
  - **Alternativas recusadas:**
    - o `gitleaks dir .` na raiz, que lê `node_modules`, `dist` e `.cache`;
    - o gitleaks no clone de trabalho, que não vê as `refs/pull/*`;
    - as opções padrão de log, que pulam os merges e, no Windows, pararam no meio.
- **Os dados pessoais:** a busca roda em todo blob do espelho (`cat-file --batch-all-objects`, lido em fluxo pelo `cat-file --batch`) e em cada blob da branch local que o espelho não tem. Cada blob fica num try/catch.
  - **Imagens (JPEG, PNG, WebP, HEIC e AVIF):** os leitores de `tests/e2e/lib/` (`metadataReport`, `exifBlock`, `pngExif`, `webpExif` e `exifItems`), mais um leitor de TIFF que dá a coordenada e as tags Artist, Copyright, XPAuthor, CameraOwnerName e BodySerialNumber, e o GPS e o `dc:creator` do XMP.
  - **Texto** (sem NUL nos primeiros 8 KB, até 20 MB):
    - e-mail;
    - telefone do Brasil e dos EUA, só com separador;
    - CPF com o dígito verificador certo (11 dígitos soltos só logo depois da palavra "CPF");
    - endereço: CEP depois da palavra, ou rua com número no formato do Brasil ou dos EUA;
    - perfil pessoal em rede social, só em `docs/lancamento/`.
  - **Também entram** as mensagens de commit e as identidades de autor e de quem commitou.
  - **Ficam de fora** os PDFs, as fontes e o GIF, contados por formato.
- **A classificação:** cada achado é deduplicado por valor, com o número de ocorrências, os arquivos, os commits e as refs.
  - **O contexto vem do repositório, nunca escrito à mão:**
    - as strings de `src/platform/site.ts` e `pix.ts`;
    - os domínios da marca;
    - o `git config user.name` e o `user.email`, o `AUTHOR.name` e o login do dono, mais os e-mails dos commits com esses nomes;
    - as amostras listadas no `fixtures/ORIGEM.md`, com as coordenadas delas.
  - **Segredo real:** é o que sobra das regras abaixo.
  - **Público por natureza:**
    - valor que o site publica;
    - endereço na marca;
    - no-reply e robôs;
    - texto de licença em `src/`;
    - metadado de pacote npm no lockfile.
  - **Dado do Victor:** os e-mails e nomes dele, e as contas com o nome da marca fora do domínio dela.
  - **Dado de terceiro:**
    - os demais e-mails, com uma nota que separa o endereço pessoal do endereço de função;
    - o GPS das amostras públicas, nota "já publicada na origem";
    - telefone, CPF ou endereço fora dos testes.
  - **Falso positivo:**
    - domínio de exemplo;
    - valor só em `tests/` ou `fixtures/`;
    - hash;
    - palavra só de letras: o gitleaks leu "Especificaciones" como segredo do LinkedIn;
    - a faixa 555-01xx.
  - **Um GPS de fora do `fixtures/ORIGEM.md`** vai para "dado do Victor" para ele conferir.
- **Onde fica o resultado:** só em `.cache/auditoria-publico.md`, e os JSON do gitleaks em `.cache/auditoria/`. O `.gitignore:10:.cache/` cobre os dois, e o `git check-ignore -v` confirma. O terminal mostra só contagens: um teste prova que nenhum valor chega às linhas do terminal. O script recusa gravar fora de `.cache/` antes de qualquer trabalho, e um teste o roda com `--saida docs/...`.
- **A execução desta run** (3/nov/2026, na worktree do agente):
  - **Varridos:**
    - 20 refs, das quais 18 em `refs/pull/*`, já com a PR desta run;
    - 575 commits;
    - 3.970 blobs: 3.186 de texto, 788 imagens e 14 pulados (11 PDF, 1 GIF e 2 WOFF2);
    - mais 18 blobs que só a branch local tem.
  - **O gitleaks** leu 573 de 573 commits com mudança de texto.
  - **Os 65 achados únicos:**
    - segredo real: 0;
    - público por natureza: 16;
    - dado do Victor: 4;
    - dado de terceiro: 17;
    - falso positivo: 28.
- **Nenhum achado foi corrigido.** A decisão é do Victor, pela seção F do `PLANO-MELHORIAS.md`.
- **A revisão da F9 (B-3 e B-6).**
  - A classificação põe em "falso positivo" todo achado que só aparece em `tests/`, `fixtures/`, `scripts/oracle/` ou `scripts/fixtures/`, sem olhar o valor. Hoje esses achados são sentinelas de teste, mas um segredo de verdade colado num teste cairia ali. A correção (só os padrões sintéticos conhecidos viram falso positivo; o resto vai a "a conferir") muda a contagem da auditoria e pede rodá-la de novo, então ficou para uma run de ajuste (pendência "F9 auditoria testes"). O `docs/OPERACAO.md` pede ao Victor que passe o olho também nos falsos positivos dessas pastas.
  - O `docs/OPERACAO.md` dava como exemplo de dado de terceiro um arquivo pelo nome. O exemplo virou genérico ("o e-mail de uma pessoa num arquivo do repositório"), e a busca por frases que liguem um achado a um arquivo, a um valor ou a uma pessoa (`git grep`) não achou outra nos textos da F9 que a revisão pode mudar. O `PLANO-MELHORIAS.md` (do Victor) cita a pasta `docs/lancamento/` num exemplo genérico, escrito antes da auditoria, e ficou como está.
  - O exemplo antigo continua no histórico: ele entrou no commit `6002159`, que já estava na `origin/fase-09`, e reescrever o histórico está fora da run. O arquivo que ele citava já era público, e o achado continua contado só no `.cache/auditoria-publico.md` (a segunda passada da revisão).

## § 333 · A proteção contra PR de fork (F9, decisão 9)

- **O `pode-mesclar.ts`** só mescla PR cujo head é deste repositório e cujo autor é o dono do repositório (o login de `github.repository_owner`) ou o Dependabot. Uma PR de branch `fase-*` de outro autor, ou de um fork, nunca é mesclada. Quando os dados faltam (um `pr.json` de antes da F9, ou o fork apagado, sem `head.repo`), recusa, com comentário. A regra (`origin()`) vem logo depois do rascunho, antes da de workflow.
- **Os dados** entram no `pr.json` pelo `jq` do passo Decide (`headRepo`, `repo` e `repoOwner`), a partir de três variáveis novas do passo (`HEAD_REPO`, `REPO` e `REPO_OWNER`). A chamada do CLI não muda (§ 297): o script velho da base ignora os campos, e o novo recusa sem eles. O `JQ_ON_MAIN` do `tests/unit/merge-events.test.ts` mudou junto, e o `CLI_ON_MAIN` ficou.
- **Os jobs que escrevem** não rodam em PR de fork, por `if` no job: o `merge`, o `alerta-dependabot`, a chamada do `pos-deploy` e o job `conferir` do `pos-deploy.yml`. A condição é `github.event.pull_request.head.repo.full_name == github.repository`; com o fork apagado o lado esquerdo é vazio e o job não roda. Nenhum workflow usa `pull_request_target`.
- **O `ci-ok` de uma PR de fork** roda o `ci.yml` da própria PR, então verde ali não prova nada: o merge de PR de fork é sempre do Victor, depois de ler o diff (`docs/OPERACAO.md`).
- **A prova:**
  - o `tests/unit/pode-mesclar.test.ts` (fork com nome de branch de run e com o login do Dependabot, outro autor, dados ausentes);
  - os eventos novos de `fixtures/merge-events/` (`fork-run-branch`, `other-author-run-branch` e `missing-head-repo`; o Dependabot e o dono são os casos de antes, que ganharam o `head.repo` do payload real);
  - o `tests/unit/ci-workflows.test.ts` (os jobs com permissão de escrita são exatamente esses três e todos têm a guarda; nenhum `pull_request_target`).

  Com `MERGE_SCRIPT=<o pode-mesclar.ts do bbd30c8>`, os três eventos novos reprovam: a proteção é o que os faz passar.

## § 334 · README, SECURITY e a licença (F9, decisão 10)

- **O `README.md`, em português:**
  - o que é o FileOrca;
  - como rodar: Node 24 pelo `.node-version`, pnpm 10 pelo `packageManager` com o Corepack, `pnpm install`, o Playwright na primeira vez, `pnpm dev`, `pnpm verificar` e `pnpm verificar --partes`;
  - a licença, e que o motor de imagem é distribuído à parte sob MIT, no repositório `fileorca-image-engine`, gerado pelo `pnpm motor:exportar` (passo a passo em `docs/lancamento/codigo-aberto.md`).
- **O `SECURITY.md`:**
  - o relato em particular: pela aba Security → Report a vulnerability, que o Victor liga na seção F, ou, enquanto o botão não aparece, pelo `contato@fileorca.com`, o `CONTACT_EMAIL` de `src/platform/site.ts`;
  - nunca em issue, PR ou discussão pública;
  - o que mandar, o escopo (o site, as prévias e os workflows; os serviços de terceiros ficam fora) e o que esperar, sem prazo prometido.
- **O `LICENSE`:**
  - em inglês: "Copyright (c) 2026 Victor Yuki Matusita. All rights reserved.", nenhuma licença concedida, e só o que os Termos de Serviço do GitHub exigem (ver e fazer fork no GitHub);
  - as exceções: a cópia MIT do motor no repositório separado, e os arquivos de terceiros com as próprias licenças (dependências, fontes OFL, `src/platform/license-texts/` e fixtures do `fixtures/ORIGEM.md`);
  - um parágrafo curto em português.
- **O `package.json`:** ganha `"license": "UNLICENSED"`, a convenção do npm para "nenhum direito concedido", e mantém o `"private": true`.
  - **Alternativas recusadas:**
    - sem o campo: o npm avisa "No license field", e o arquivo não diz nada;
    - `"SEE LICENSE IN LICENSE"`: é válido, mas sugere uma licença a ler;
    - MIT ou uma licença de código-fonte disponível: a ficha manda "todos os direitos reservados".
  - **O `gate:licencas` passa,** rodado com o `dist/` desta branch: "licenças: ok". O license-checker roda com `--excludePrivatePackages`, então o pacote raiz não entra na árvore.
- **O motor aberto:** o repositório `fileorca-image-engine` ainda não consta como criado (pendência "Motor aberto"). Por isso o LICENSE fala da "cópia publicada no repositório separado".
- **A revisão da F9 (F-5):** o README e o LICENSE falavam no presente de um repositório que não existe (`gh repo view vmatusita/fileorca-image-engine` não o acha). Os dois passaram ao futuro: a cópia MIT do motor vale quando o repositório for publicado, e o README diz que ele ainda não existe.

## § 335 · Workers Builds e PR de fork (F9, decisão 11)

- **O que a documentação do Cloudflare diz** (lida em 3/nov/2026):
  - Workers Builds, página "Build branches": com Enable Preview Builds (Settings → Build → Branch control), cada push numa branch que não é a de produção gera um build de prévia.
  - Workers Builds, página "GitHub integration": o Cloudflare publica a cada push e comenta na PR o status e a URL da prévia. O app do GitHub é "Cloudflare Workers and Pages", o mesmo do Pages, e a página recomenda limitar o acesso aos repositórios usados.
  - As páginas do Workers Builds (build branches, GitHub integration e configuration) não falam de fork. Só a do Pages diz que URL de prévia não é criada para PR de fork.
  - Os exemplos de automação de prévias, com GitHub Actions, lembram que os segredos não chegam a PR de fork e mandam conferir `head.repo.full_name` antes de expor credenciais. O CI do FileOrca não usa credencial do Cloudflare.
- **A conclusão:** o build nasce de push numa branch do repositório conectado, e o push de quem fez fork vai para o repositório dele. O esperado é nenhum build, mas o Workers Builds não documenta isso.
- **O registro:** o `docs/OPERACAO.md` ("Workers Builds e PR de fork") lista o que o Victor confere:
  - o Branch control;
  - as variáveis e os segredos do build e das prévias, que devem ser só valores públicos;
  - o acesso do app só ao `fileorca`;
  - uma PR de fork de verdade, de uma segunda conta.
  - Se ela gerar build, ele desliga o Enable Preview Builds e registra numa run curta.
- **Alternativas:**
  - desligar as prévias antes de publicar: perde a prévia das runs, que a regra nova 1 do `PLANO-MELHORIAS.md` usa;
  - aceitar sem testar: a documentação não cobre o caso.

## § 336 · O ruleset da main e a seção "Repositório público" do OPERACAO (F9, decisão 11)

- **O formato:** `docs/ops/ruleset-main.json` é o corpo do `POST /repos/{owner}/{repo}/rulesets`, o mesmo JSON que o Settings → Rules → Rulesets → New ruleset → Import a ruleset lê. A fonte é a documentação do GitHub, "Managing rulesets for a repository" (Importing) e REST "Create a repository ruleset", e os exemplos do `github/ruleset-recipes` usam a mesma forma. O arquivo não tem `id`, `source` nem `source_type`, que são da exportação de um ruleset que já existe.
- **O conteúdo:**
  - nome `main`, `target: branch`, `enforcement: active`;
  - `ref_name.include` só com `~DEFAULT_BRANCH`, `exclude` vazio, `bypass_actors` vazio;
  - as regras `deletion` e `non_fast_forward`;
  - `pull_request` com 0 aprovação, os quatro booleanos em false e `allowed_merge_methods: ["squash"]`, porque o job de merge usa `gh pr merge --squash`;
  - `required_status_checks` só com `{context: "ci-ok", integration_id: 15368}`, o app do GitHub Actions confirmado pelo `gh api apps/github-actions`, e `strict_required_status_checks_policy: false` e `do_not_enforce_on_create: false`.
- **Alternativas recusadas:**
  - exigir cada parte do CI como check: cada mudança de partes mexeria no ruleset, e a ficha recusa;
  - exigir uma aprovação: o Victor trabalha sozinho, e o autor não aprova a própria PR;
  - bypass para o admin: contornaria a trava. Numa emergência, o OPERACAO manda desativar o ruleset, mesclar e reativar;
  - branch atualizada obrigatória: cada merge pediria outro CI completo;
  - merge ou rebase liberados: a `main` é só squash.
- **O teste:** `tests/unit/ruleset.test.ts`, com 14 testes, dos quais 10 são controles que reprovam: bypass, todas as branches, sem exclusão, sem force push, aprovação, branch atualizada, check de qualquer app, segundo check, regra `update` e modo `evaluate`.
- **A seção "Repositório público" do `docs/OPERACAO.md`** entra antes de "Pendências", e os 18 cabeçalhos exigidos não mudam. Ela tem quatro partes:
  - **O passo a passo:** a seção F adaptada.
    - O repositório já é público desde 28/out/2026, então o "Change visibility" já está feito e o resto ficou urgente.
    - A auditoria vem primeiro.
    - Voltar a privado é a única saída sem reescrever o histórico.
    - O ruleset só entra depois de o `ci-ok` estar na `main`.
    - Depois vêm a aprovação de fork para todos os externos, o Code security, as Features (Wiki e Projects desligados, Issues fica), o Workers Builds e a primeira PR.
  - **O merge de PR de fork:** o `ci-ok` dela roda o `.github/workflows/ci.yml` da própria PR, então o merge é sempre do Victor, depois de ler o diff.
  - **O que fica público no Actions:**
    - os logs e os artefatos: o build com 1 dia e os relatórios do Playwright com 7;
    - nenhum passo imprime token ou ambiente;
    - o `disco.ts` mostra só o nome dos processos;
    - os runners de repositório público não gastam a cota de minutos.
  - **O Workers Builds e a PR de fork:** o que a § 335 registra.
- **Os caminhos do texto:** toda citação entre crases é um caminho completo (`.github/workflows/ci.yml`, `docs/ops/ruleset-main.json`), e o `operacao.test.ts` passa.
- **A revisão da F9** (achados B-2, B-4, B-6, C-4, F-2, F-3, F-4, F-7 e F-8, e o B-1 e o F-1 do `ci-ok` duplicado):
  - **A ordem nova do passo a passo:** 1 a auditoria; 2 o Advanced Security, 3 a aprovação de PR de fork e 4 as Features, que são só configuração e não dependem do merge (o relato privado fica ligado antes de o `SECURITY.md` chegar à `main`); 5 o merge da F9; 6 o ruleset, que espera o `ci-ok` na `main`; 7 o Workers Builds; 8 a primeira PR. A ficha da F9 listava a ordem da seção F (escrita com o repositório privado); com ele público desde a criação, só o ruleset depende do merge, e a ordem da ficha continua sendo a das dependências.
  - **A auditoria (passo 1):** o `pnpm publico:auditar` só existe na branch `fase-09` até o merge; a primeira execução numa máquina baixa o gitleaks fixado por SHA-256; e há commits depois da auditoria da run, então o Victor roda de novo antes de decidir.
  - **Voltar a privado:** a página "About rulesets" do GitHub, lida na revisão, fala dos planos Team e Enterprise e não confirma o ruleset num repositório privado do plano Free: o texto diz que ele pode deixar de valer e manda conferir, e lembra que os minutos do Actions voltam a contar.
  - **Os nomes dos menus** (lidos na documentação do GitHub em 3/nov/2026): Settings → "Advanced Security", na seção "Security and quality" do menu lateral, com "Secret Protection" (o secret scanning), "Push protection" dentro dela e "Private vulnerability reporting". O texto põe o nome antigo ("Code security") entre parênteses, também no item do Dependabot security updates.
  - **O `ci-ok` vermelho de execução cancelada (passo 6 e passo 8):** o que fazer se o merge for recusado por ele (rodar de novo a execução cancelada com `gh run rerun <id>`, ou um push; não testado) e conferir isso na primeira PR (§ 327, pendência "F9 ci-ok duplicado").
  - **O `--failed` em 24 h** nas duas receitas de rerun (§ 324).
  - **O `GH_TOKEN`:** no job `merge` ele é variável do job inteiro, e o texto agora diz isso (e onde ele entra no `alerta-dependabot` e no `ci-ok`). O `env` do job não mudou nesta revisão.
  - **O que fica público:** o exemplo de dado de terceiro ficou genérico, sem caminho (§ 332), e a lista ganhou os comentários do Workers Builds nas PRs (a URL da prévia e o link do painel com o ID da conta).
  - **A abertura** diz "depois da F9", e o `tests/unit/operacao.test.ts` confere a seção "Repositório público" com os quatro `###` dela, e que o passo do ruleset cita o `docs/ops/ruleset-main.json` e vem depois do merge.

## § 337 · A fonte de verdade da F9 (F9, decisão 12)

- **O `PLANO-MELHORIAS.md`** entrou no primeiro commit (`892b10f`). O `Claude outputs/PLANO-MELHORIAS.md` era diferente do da raiz (a ficha da F9 sem "com o build só se o Vitest precisar" e o passo 4 da seção F com outro texto): pela ficha, ele é a versão final e foi copiado por cima antes do commit. A pasta `Claude outputs/` não entra em commit.
- **O `PLANO-FILEORCA.md` não tinha diff:** a linha do Victor no topo, apontando para o `PLANO-MELHORIAS.md`, não estava lá. A run não tocou no arquivo (o `.claude/settings.json` nega a edição) e registrou a pendência.
- **O prompt** entrou sem edição, nos dois arquivos que estavam em `docs/prompts/`. O `.txt` é o que a run recebeu. O `.md` está atrás dele em dois pontos: o caso do rótulo `ci` inexistente e o `--undo` do `gh pr ready`. O `Claude outputs/prompt-fase-09.md` tem a versão atual do `.md`; a ficha manda os dois arquivos sem edição, e a run seguiu o `.txt`.
- **A ordem nova** está no `CLAUDE.md`: a ficha da run, o `PLANO-MELHORIAS.md` (nos itens de "Mudanças no contrato"), o `PLANO-FILEORCA.md`, o `CLAUDE.md` e `docs/claude/`, o `DECISOES.md` e o código.

## § 338 · O repositório já era público, e o rótulo ci não existe (F9, exploração)

- **O fato.** A ficha e o `PLANO-FILEORCA.md` partem de um repositório privado, no GitHub Free, com 2.000 minutos por mês. A API diz outra coisa:
  - `visibility: public`;
  - um `PublicEvent` em 28/out/2026 15:03 UTC, a mesma hora do `created_at`. O repositório é público desde a criação.

  O código, os relatórios, as `refs/pull/*` (16 hoje, com 548 commits que só existem ali), os logs e os artefatos do Actions já estão públicos.
- **O que a run mudou por isso:** nada no escopo.
  - A auditoria segue só em `.cache/` e nunca entra no Git, na PR ou na resposta.
  - A proteção contra fork entra como a ficha manda.
  - O `docs/OPERACAO.md` diz que o passo da visibilidade já está feito e que os outros da seção F ficam urgentes: o ruleset, a aprovação de workflow de fork, o secret scanning, a push protection, o relato privado e as Features.

  Nenhuma configuração do GitHub mudou; elas são do Victor.
- **O custo.** Os minutos de um repositório público não são cobrados. O `ci:custo` calcula "como num repositório privado" (o minuto arredondado por job), como a ficha pede. A linha de base também rodou como repositório público, mas o tipo de máquina mudou entre ela e as execuções desta PR (o disco do `/` foi de 72 para 145 GB, e os testes ficaram uns 30 % mais rápidos): por isso o relatório traz também uma conta controlada (§ 339). A revisão da F9 (C-1) mostrou que foi um degrau, não uma variação: a máquina mudou uma vez entre a linha de base e a F9, e a causa é desconhecida (§ 339).
- **O rótulo `ci` não existe** (`gh label list` mostra só os padrões). A run não o cria (`gh label create` é proibido). As execuções completas saem do `gh pr ready`, e o `gh pr ready --undo` volta ao rascunho entre elas. Criar o rótulo é do Victor.

## § 339 · A meta de 35 % numa execução completa (F9, decisão 1 e critério 1)

- **A conta da linha de base** (§ 323): 157 minutos cobrados.
  - 120,5 min no passo `pnpm verificar` das 20 partes, dos quais 6,5 min de build e o resto testes e portões;
  - 24,5 min de preparo;
  - 10,3 min de arredondamento ao minuto, por job;
  - o resto em caudas e no `merge`.
- **O teto do que a ficha deixa mexer:**
  - mesmo com o preparo e o build zerados, a execução completa iria a uns 127 minutos (−19 %);
  - com o preparo em 45 s, o build único e os três jobs novos (`classificar`, `build` e `ci-ok`), a estimativa é de 142 a 151 minutos (−4 % a −10 %).

  Os 35 % pediriam cortar tempo de teste, mudar o número de partes ou os workers, e a ficha proíbe os três (a F9b redivide).
- **O que as duas execuções completas da PR mostraram** (41658317282 e 41660597548): 111 minutos cobrados cada uma, contra 157 da linha de base (−29,3 %). Esse número mistura duas coisas.
  - **A máquina mudou.** A imagem base é a mesma (`ubuntu-24.04`, versão 20261025.353.1, com alguns jobs numa versão mais nova; abaixo), mas o `/` das partes tem 145 GB, contra 72 GB na linha de base, e o tempo de teste somado das 20 partes caiu de 113,9 para 78,7 e 75,7 minutos (−31 % e −34 %), com os mesmos testes sobre o mesmo `dist/`. O runner tem 4 vCPU nas execuções da F9 (o log do preparo passou a imprimir o `nproc`); a linha de base não tem essa medida.
  - **A conta controlada:** cada parte da execução nova com o tempo de teste da linha de base (a duração do job menos o `total` dele, mais o `total` da linha de base sem o build), e os jobs novos como foram medidos. Ela dá 148 minutos nas duas execuções: −5,7 %, dentro da estimativa de antes. É o que a F9 economiza sozinha numa execução completa.
- **O critério 1 não fechou.** Pela conta bruta, −29,3 % não chegam aos 35 %; pela controlada, a F9 sozinha dá −5,7 %. A run implementou o build único, o preparo em segundo plano, o cache menor e as classes, e o relatório traz as duas saídas do `ci:custo` lado a lado e a conta controlada. A economia que a run entrega está nas execuções que deixam de ser completas:
  - um push em rascunho custava uma execução completa (157 a 166 minutos na PR #19) e passa a custar 5 (`41652974779`: 3 jobs, 3,5 min de parede);
  - uma PR só de documentação pula o Playwright e o Lighthouse.
- **Para a F9b:** redividir as partes e os workers para as máquinas de repositório público (4 vCPU) é a alavanca que falta, medida com o `pnpm ci:custo` antes e depois e com a conta controlada, porque a máquina mudou entre a linha de base e a F9 e pode mudar de novo. Linha "F9 35 %" no `PENDENCIAS.md`.
- **O que a revisão da F9 corrigiu neste registro** (C-1 e C-6):
  - **A máquina mudou entre a linha de base e a F9,** uma vez; o "varia" do primeiro registro (aqui, na § 325 e no `docs/claude/ci.md`) dizia mais do que os dados mostram. Todas as execuções de antes que a revisão leu (a linha de base e mais quatro) têm 72 GB no `/`, e todas as da PR da F9, 145 GB, sem alternância. A causa é desconhecida: entre a linha de base (06:46 UTC de 3/nov) e a primeira execução nova (14:22 UTC) não houve execução do CI. A imagem também não é exatamente a mesma: a base é a 20261025.353.1, mas cinco jobs da 41660597548 e um da 41658317282 rodaram na 20261101.360.1, com o mesmo disco. O "4 vCPU" é medida só das execuções da F9 (o `nproc` passou a ser impresso no preparo nesta run); a linha de base não tem essa medida.
  - **A conta controlada é conservadora, e dá uma faixa.** O tempo de teste da linha de base leva os 48,6 s do `lint:texto` do job dos portões, porque a PR #19 mudou texto do site; a PR da F9 não muda, e o mesmo passo levou 0,7 s nas duas execuções novas. Com o `lint:texto` de cada execução nova no lugar do da linha de base (o resto igual), a conta dá 147 minutos nas duas execuções, contra 148. A F9 sozinha economiza de 9 a 10 minutos numa execução completa: −5,7 % a −6,4 %. O tempo do Vitest também varia dentro da mesma máquina (121,6 s na linha de base, 82,1 s e 51,7 s nas duas execuções novas), um ruído maior que esse viés, e a faixa é o que a conta sustenta.

## § 340 · O adendo da ADR-003 e as pendências (F9, decisão 14)

- **O adendo** "Adendo (F9, 03/nov/2026): o build uma vez, as classes de execução e o ci-ok" entra na ADR-003, como a § 302 e a § 320 fizeram, e a ADR continua Aceita. Ele diz o que mudou (o build, as classes, o `ci-ok` e o preparo), o que não mudou (as 20 partes, os limites, os workers e os testes) e onde está a prova.
- **O `docs/PENDENCIAS.md`:**
  - a § 242 sai das linhas abertas para a tabela "Já corrigidos" (`pnpm verificar --partes`, § 329);
  - a "F8 ensaio-3" sai do mesmo jeito (§ 330);
  - a § 283 fica, atualizada: a F9 manteve as partes, e a F9b a absorve;
  - entra o grupo 18, "O que a F9 deixou".

## § 341 · Os testes que mudaram junto com o CI (F9)

A ficha manda mudar um teste que fixa o CI de antes junto com o que ele protege, e mostrar que a proteção continua.

- **`tests/unit/ci-workflows.test.ts`.** Fixava o gatilho de antes (sem `labeled`), o `needs` do `alerta-dependabot` (`verificar`, `playwright` e `merge`) e o `if` dele sem a guarda de fork. Agora fixa:
  - o gatilho com `labeled` e o `alerta-dependabot` depois do `ci-ok` e do `merge`, com a guarda;
  - o `if` de cada job por classe, sem `paths`;
  - o `ci-ok` (nome, sem matriz, `always()`, o `needs` igual ao `REQUIRED`);
  - o `merge` depois do `ci-ok` e sem rascunho nem fork;
  - o build só no job `build`, com o artefato baixado depois do cache;
  - o `fetch-depth: 0` só nos quatro jobs que leem o histórico;
  - nenhum `pull_request_target`, e os jobs com permissão de escrita, todos com a guarda;
  - as proteções da § 154 e a espera pelo navegador.

  Os testes do alerta e das issues continuam iguais.
- **`tests/unit/merge-events.test.ts`.**
  - O `JQ_ON_MAIN` e o `env` do Decide ganharam os três campos do fork; o `CLI_ON_MAIN` e o `DIFF_ON_MAIN` não mudaram.
  - As 16 fixtures de antes ganharam o `head.repo.full_name` do payload real, e o resultado esperado de cada uma não mudou.
  - O `MERGE_SCRIPT` deixa rodar os eventos com outro script: com o do `bbd30c8`, os três eventos novos reprovam.
- **`tests/unit/pode-mesclar.test.ts`.** A base dos casos ganhou o repositório e o dono. Todos os casos de antes dão o mesmo resultado; os novos são os do fork.
- **`tests/unit/verificar.test.ts`.** O teste do ajuste idiomas lia as duas matrizes do job `verificar`, que deixou de existir. As asserções dele sobre o `plan()` ficaram. A leitura do `ci.yml` foi para o teste novo, que lê todas as partes do arquivo e confere o todo com o build uma vez. A lista do que o `plan()` recusa ganhou os casos novos.
- **`tests/unit/pendencias.test.ts`.** A lista de ids obrigatórios perdeu a `§ 242`, que a F9 fechou. O teste passa a exigir que ela não esteja nas linhas abertas e esteja na tabela "Já corrigidos" com a § 329, então ela não some sem rastro.
- **`tests/unit/pdf-engine-ops.test.ts`.** O teste do split lê do oráculo os links da fonte (§ 330). As asserções sobre a saída são as mesmas, mais uma.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite ou tempo mudou.** O Vitest foi de 93 arquivos e 1.597 testes para 102 arquivos e 1.735 testes, e o `--list` do Playwright continua em 1.428 por navegador.
- **Depois da revisão da F9.** O 1.735 acima é o da execução 41658317282; o teste do `merge` pulado (§ 327) levou o commit revisado (`859f7b4`) a 1.736 (revisão, D-2). As correções da revisão só acrescentaram testes: 13, nos arquivos `ci-ok` (o estado de rascunho na hora e o CLI sem `PR_DRAFT_NOW`), `ci-workflows` (as permissões e o `env` do `ci-ok`, a linha verde, o passo rodado em `bash -e` e o controle do `success()`), `claude-md` (o núcleo e o controle dele) e `operacao` (a seção "Repositório público" e o passo do ruleset). O Vitest inteiro dá 102 arquivos e 1.749 testes, verdes nesta máquina. Mudaram, sem perder asserção: o `alerta-dependabot` fixado com `!cancelled()`, a regex da função de status sem `success()` e o título de um teste do `verificar.test.ts` que prometia ler as matrizes do `ci.yml` (D-3).

## § 342 · Onde fica cada coisa, e as screenshots fora da proposta (F10, decisão 1)

- **`docs/propostas/ux-v2/`** guarda só texto: o `index.html`, o `README.md`, o `ESCOLHAS.md`, os protótipos (um `.html` por peça e por alternativa), o `proto.css` comum, os CSS de grupo quando precisam, os SVG novos (`icons/` e `oli/oli-sad.svg`) e a folha da Oli (`oli/folha.html`). Nenhum PNG ou JPEG, e nenhum `.js`, `.ts` ou `.mjs`: o script dos protótipos é inline. O `diff.mjs` confere.
- **`docs/relatorios/fase-10/`** guarda todas as imagens, em três pastas: `diagnostico/` (só as capturas que um D-NN ou um UX-NN cita), `prototipos/` (as screenshots dos protótipos) e `oli/` (os dois PNG de 512 px da pose `sad`, para a busca reversa).
- **`.cache/f10/`**, fora do Git, guarda os scripts de apoio, todas as capturas brutas, as capturas e as notas dos concorrentes e a saída das verificações. Não há dados do GA4 nem do Search Console (§ 359).
- **O desvio.** A ficha da F10 no `PLANO-MELHORIAS.md` põe as screenshots dos protótipos dentro de `docs/propostas/ux-v2/`, e a ficha da run (decisão 1) as põe em `docs/relatorios/fase-10/`. Vale a da run: o checkout dos jobs `build`, `lighthouse` e `playwright` é esparso e pula só `docs/relatorios/` (§ 325). Uma imagem em `docs/propostas/` entraria em todo checkout desses jobs, em toda execução do CI, para sempre. O README e o `index.html` apontam para `../../relatorios/fase-10/`.

## § 343 · O diagnóstico: tarefas, matriz, estados e onde medir (F10, decisão 2)

- **As seis tarefas:** comprimir imagem, HEIC para JPG, juntar PDF, hipoteca, SAC × PRICE (pt) e um guia (§ 358 diz qual). Cada uma entra em cada idioma em que existe: 15 pares de tarefa e idioma. A hipoteca não existe em pt, e o SAC × PRICE só existe em pt.
- **A matriz:** 360×740 e 1280×800, claro e escuro, a primeira visita (sem `fo-consent`, com o aviso aberto) e a volta (com o consentimento gravado). São 120 sessões, no Chromium. Uma amostra no WebKit (cada tarefa num idioma, 360, claro, volta) diz o que muda de navegador; a ficha não pede a matriz inteira nos dois.
- **Os estados:** repouso, arquivo em cima (ou campos preenchidos), processando (a CPU desacelerada pelo CDP, para o WaterLevel aparecer), resultado, erro e o próximo passo. O juntar PDF ganha o estado "lista".
- **Onde medir:** o `dist/` de `87ef4c8` (o mesmo `src/` da `33be71e`), servido como o `pnpm serve`; os anúncios de hoje no build `all` de `.cache/prontidao/all/`; e o fileorca.com, com o Google abortado, numa tarefa por categoria (imagem, PDF e dinheiro).
- **O CLS da interação** (que nenhum teste mede hoje, F4-F7 e-2) sai de um `PerformanceObserver` de `layout-shift` instalado antes da página. Ele separa o carregamento do que vem depois do primeiro gesto, e soma as entradas com e sem `hadRecentInput`.
- **O que entra no Git:** só a captura citada por um D-NN ou um UX-NN. A matriz inteira e o JSON das medidas ficam em `.cache/f10/diag/`.

## § 344 · Os concorrentes, só em repouso e fora do Git (F10, decisão 3)

- **Os cinco:** iLovePDF (a home e o juntar PDF), Smallpdf (o juntar PDF; ele não tem página de comprimir imagem, e sete endereços prováveis deram 404), TinyPNG, Squoosh e a calculadora de hipoteca da NerdWallet. Todos abertos em 3/nov/2026, a 360×740 e a 1280×800, nos dois temas.
- **Só repouso:** abrir, rolar e abrir o menu. Nenhum arquivo, nenhum campo digitado e nenhum clique no banner de cookies (nem para recusar). Para medir sem o banner, ele foi escondido por um CSS local, que não manda nada ao site. Nenhum site bloqueou o robô.
- **Nada deles entra no Git.** As capturas, as notas e as medidas ficam em `.cache/f10/concorrentes/`. O README diz o padrão e a lacuna em palavras, com o endereço e a data.

## § 345 · Os protótipos: base, `file://`, tema, idioma e estado (F10, decisão 4)

- **A base:** HTML estático sobre `../../design/tokens.css`, `../../design/components/bundle.css` e `../../design/fonts/fonts.css`, mais o `proto.css` da pasta. Nada de `src/`. Onde o `bundle.css` difere do site (o AdSlot de 300 px e não 280; o painel de 380 e 340 px; a Oli em `top: -86px`), o protótipo segue o site e diz isso.
- **Abre pelo duplo clique e por http.** O script é só inline e clássico, porque o Chromium bloqueia `type="module"` em `file://`. Nada de `fetch`, e nada de fora do repositório. O `prototipos.mjs` abre cada página pelos dois caminhos.
- **O tema** segue a convenção dos previews (`?theme=dark`). O protótipo do cabeçalho tem também o botão de tema de verdade, com o script inline como a F11 vai escrever.
- **O idioma** é `?lang=pt|es`. O inglês é o padrão e a página continua legível sem JS. O menu, a parede, o café, o hub de guias e a página de apoio saem sempre nos três.
- **O estado** é `?state=…`, e na parede é `?modo=…`, porque o `showModal()` deixa o resto da página inerte e um controle na página ficaria fora de alcance com o diálogo aberto.
- **O controle de protótipo** fica fora da moldura da página, no fluxo e nunca por cima do conteúdo. É um `<nav data-proto-control aria-label="Prototype control">` de links, acessível por teclado.
- **As variantes** que o verificador testa e fotografa ficam nos `<meta name="proto-variants">` e `<meta name="proto-shots">` de cada página.
- **A Oli** entra inline, com as peças do sprite e o `oli-clip` declarado uma vez, sempre `aria-hidden`. O estado é dito em texto.
- **Cor nova** só como `--proposta-*`, nos dois temas, com o contraste calculado (§ 353).
- **O anúncio** é a caixa neutra do AdSlot, com o rótulo do idioma e sem script. Em produção, pela Mudança 10, o espaço só existe quando a unidade tem ID: a caixa do protótipo é o desenho do espaço com a unidade.
- **O protótipo recomendado é a especificação** que a F11 e a F12 seguem quando o Victor não escolher (a decisão 4 da ficha). Na F13, só entra o item que o Victor marcar (§ 381, d-01). Cada um traz, numa área fora da moldura (`.proto-spec`): a marcação, os tokens, os estados, os textos nos três idiomas, o teclado, o nome acessível, as medidas e uma nota do que muda no JS e nas requisições.

## § 346 · Os obrigatórios viram UX-01 a UX-08 (F10, decisão 5)

| Obrigatório | Item | Protótipos | Run |
|---|---|---|---|
| 1. Cabeçalho com menu e botão de tema, em 2 alternativas | UX-01 | `header-a.html`, `header-b.html` | F11 |
| 2. Hub de guias e as entradas | UX-02 | `guides-hub.html`, `guides-entries.html` | F11 |
| 3. Home, em 2 alternativas | UX-03 | `home-a.html`, `home-b.html` | F13 (guias na F11, anúncios na F12) |
| 4. Página de ferramenta, em 2 alternativas, e a variação do PDF | UX-04 | `tool-a.html`, `tool-b.html`, `tool-a-merge.html`, `tool-b-merge.html` | F13 |
| 5. Card do café e página de apoio | UX-05 | `coffee.html`, `support.html` | F12 |
| 6. Parede do bloqueador | UX-06 | `wall.html` | F12 |
| 7. Mapa de anúncios | UX-07 | `ad-map.html` | F12 |
| 8. A pose `sad` | UX-08 | `oli/oli-sad.svg`, `oli/folha.html` | F12 |

O 9 (as pendências) é a tabela do README. Cada pendência que muda o que se vê aponta para um UX-NN com protótipo (do UX-09 em diante).

## § 347 · As pendências: 37 linhas, não 36 (F10, decisão 6)

- **A conta.** A ficha diz 36 (os 12 itens do grupo 5, os 16 do grupo 6 e 8 avulsas), mas o grupo 5 tem 13 linhas. A 13ª é a "Idiomas R2-03", que o ajuste idiomas acrescentou sem atualizar o Resumo do `PENDENCIAS.md` (que diz 12 e soma 183 no total). A ficha herdou o número do Resumo.
- **A escolha:** a tabela do README tem as 37, e o `readme.mjs` confere os 37 ids contra o `PENDENCIAS.md` (desde a revisão, ele lê as linhas dos grupos 5 e 6 e as 8 avulsas do próprio `PENDENCIAS.md` e as cruza com o `.cache/f10/pendencias-ids.json`; § 381, d-07). Deixar uma pendência de acessibilidade de fora para bater o número seria a opção pior: ela ficaria sem destino. A correção do Resumo vai para "Para o PENDENCIAS" do relatório, porque o `PENDENCIAS.md` não muda nesta run.
- **A reconferência:** cada uma foi reconferida no código de hoje (`87ef4c8`) antes do destino, como manda o "Como ler". A F7 e-1 já está resolvida (a face `Figtree Steady` da § 305); a F4 ACE-9, a F5a D-8, a F4-F7 e-2 e a F4-F7 f-1 mudaram de forma; as outras seguem abertas com o mesmo código.
- **Cada linha** traz o id, o estado (aberta, já resolvida ou mudou), o destino (corrigir, aceitar e registrar, ou descartar), a proposta ou a escolha entre as saídas que a pendência já traz, o UX-NN (quando muda o que se vê) ou o teste que a F13 escreveria (quando muda só o comportamento), e a run. O destino recomendado de cada uma está na § 365.

## § 348 · A lista "para avaliar" (F10, decisão 7)

Os sete itens entram no README como "proposto" (com UX-NN, evidência, protótipo e custo) ou "descartado" (com o porquê). As escolhas e as razões estão na § 366. Duas delas mudam regra do design system e são apresentadas como tal:
- a cena de fundo do mar nos hubs ("Mar": "Nenhuma imagem de fundo no site"; "Nunca": "imagem de fundo");
- o "mar à noite", porque pede cor nova no tema escuro.

## § 349 · O README, o index e o ESCOLHAS (F10, decisão 8)

- **O `README.md`,** nesta ordem: como abrir; o resumo; o diagnóstico (os D-NN por tarefa e a tabela das medidas); "O que os outros fazem"; os itens UX-NN; a tabela das pendências; a lista "para avaliar"; o mapa de anúncios com a densidade; a tabela do contraste; as suposições.
- **Os rótulos de cada UX-NN:** Origem, Problema, Evidência, Proposta (com as alternativas), Oli, Custo (P, M ou G), Riscos (orçamento, anúncio e acessibilidade), Protótipo, Recomendação e Run.
- **Cada D-NN** tem uma linha "Onde" (tarefa, idioma, tamanho, tema e estado), "O que acontece", "Evidência", "Gravidade" (bloqueia, atrasa ou incomoda) e "Responde" (o UX-NN).
- **O `index.html`** abre cada protótipo nos dois temas e liga cada um ao item do README.
- **O `ESCOLHAS.md`** começa com "Copie este arquivo para `.cache/ESCOLHAS-marcado.md` e marque lá. O arquivo do Git fica limpo". Os itens ficam agrupados pela run que os constrói (F11, F12 e F13). Cada um traz o id, o título, as alternativas como caixas de marcar, a recomendada com "(recomendado)", uma linha do porquê e o custo; as pendências vêm com o destino recomendado. O grupo da F13 segue a ordem de prioridade recomendada, porque a F13 constrói os itens marcados na ordem da lista. As decisões que não são um item inteiro ficam no grupo "Decisões avulsas", com caixas (§ 381, d-08).
- O `readme.mjs` confere tudo isso: desde a revisão, também o link escuro de cada protótipo no `index.html` (`?theme=dark`), uma caixa por alternativa e as colunas da proposta e do que responde em cada pendência (§ 381, d-07).

## § 350 · "Mais único": o critério (F10, decisão 9)

Uma alternativa é "do FileOrca e de mais ninguém" quando a forma dela sai de uma das seis imagens do design system e não de um padrão de site de ferramentas: a **Oli** (ela reage, olha para o conteúdo e diz o estado), o **mar** (o fundo `deep` onde o resultado chega), a **água** (que sobe enquanto a ferramenta trabalha, com a borda de onda), o **traço** (a borda de 2 px preto-orca do que se toca), a **dobra** (o canto dobrado do papel, que é a ponta da barbatana) e o **lábio** (a sombra sólida do que se aperta). Cada alternativa diz no README qual dessas imagens a define. A segunda de cada par muda a estrutura (onde as coisas ficam e como se chega a elas), não só a cor. Os pares e o que os separa estão na § 367.

## § 351 · A densidade: fórmula, alturas e a âncora (F10, decisão 10)

- **A fórmula da seção B:** a soma da altura das caixas de anúncio na coluna principal, dividida pela altura do `<main>`, a 360×740.
- **A metodologia da Coalition for Better Ads** ("Ad Density Higher Than 30%", lida em 3/nov/2026) mede contra o conteúdo principal, "not the viewport". Ela conta o anúncio fixo uma vez ("The height of each sticky ad is counted once"). A leitura do Google tira do conteúdo principal o cabeçalho, o rodapé, a navegação e as recomendações de conteúdo ("relacionados").
- **A leitura mais conservadora, que a run usa como trava:**
  - o numerador soma as caixas e mais 100 px de âncora, uma vez. A âncora padrão tem 50 px; os 100 px são a âncora alta da pesquisa (320×100). A dinâmica pode passar disso, e o AdSense não publica a altura;
  - o denominador é o `<main>` sem a grade de ferramentas relacionadas;
  - a página é medida no estado de menor altura (a ferramenta em repouso).

  O `densidade.mjs` mede as duas (a da ficha e a conservadora), e a trava é a conservadora.
- **As alturas:**
  - **o conteúdo tem 300 px:** é o que o AdSlot do site reserva (`src/styles/components.css:387`). A ficha e o README do AdSlot dizem 280; os 300 px são a medida real e a mais conservadora;
  - **a lateral tem 644 px.** Ela fica fora da coluna principal e não entra na conta do celular;
  - **o multiplex tem 1.700 px a 360 px.** A ajuda do AdSense não publica número. Pelo código público do carregador (`adsbygoogle.js`, lido em 3/nov/2026), o padrão do celular é 1 coluna × 6 linhas, com a altura `floor((L/1,91 + 80) × 6 + 56)`: 1.666 px com o `ins` de 360 px e 1.566 px com 328. A run usa 1.700 px, a maior medida razoável. Os atributos `data-matched-content-*` estão "deprecated" na ajuda, e o carregador os sobrescreve, então não dá para contar com um multiplex menor.
- **A distância entre dois anúncios do conteúdo** é lida de borda a borda: pelo menos 1.110 px de conteúdo entre a base de um e o topo do outro. É a leitura que dá menos anúncio, e a mesma dos 150 px de `ad-clearance`. A outra leitura (1.110 px de topo a topo) está na § 361, como a alternativa.

## § 352 · A pose `sad` (F10, decisão 11)

- **Feita com as peças do sprite,** como as nove: o corpo, a cauda, a dorsal, a dobra azul da barbatana, as manchas, o aro branco e o contorno vêm das outras poses. O que é dela é o rosto e o gesto.
- **Triste, sem culpa e sem pedir clique** (seção A e Mudança 12): sem lágrima escorrendo, sem gesto de pedir e sem apontar para botão. Ela olha para a esquerda, para o conteúdo, e lê a partir de 32 px.
- **O `<symbol>`** é medido como o `src/oli/sprite.ts` o montaria, pelo `.cache/f10/oli-sad.mjs`, que importa a função sem mudá-la. O limite é de 4.096 bytes, e as dez poses são medidas juntas, porque uma pose nova pode mudar as peças compartilhadas.
- **Os arquivos:** o `docs/propostas/ux-v2/oli/oli-sad.svg` (128×128, as cores fixas do README das poses); a `docs/propostas/ux-v2/oli/folha.html` (a pose sozinha e ao lado das nove, nos dois fundos, em 32, 64 e 128 px, e dentro da parede); e os dois PNG de 512 px em `docs/relatorios/fase-10/oli/`, para a busca reversa do Victor.
- **O que não muda:** o sprite, a lista fechada de poses e o `docs/oli/folha.html` não mudam nesta run. A F12 põe a `sad` no sprite e na lista, se o Victor a escolher; sem escolha, a parede usa a `oops`.
- Nenhuma outra pose nova foi proposta (§ 367 diz se o diagnóstico pediu alguma).

## § 353 · O contraste (F10, decisão 12)

- **Todo par de cor novo** é calculado nos dois temas pelo `.cache/f10/contraste.mjs`, com a fórmula da luminância relativa da WCAG 2.2: texto sobre fundo, ícone sobre fundo e borda de controle sobre fundo. Isso vale para os tokens `--proposta-*` e também para combinações novas de tokens que já existem.
- **Os mínimos:** 4,5:1 para texto, 3:1 para texto grande e 3:1 para componente e ícone que carrega sentido. Par reprovado não entra.
- **O escuro de cada token proposto** é declarado duas vezes: no `[data-theme="dark"]` e no `prefers-color-scheme`. O script confere que os dois são iguais.
- **Fora dos tokens, só a Oli.** O script reprova cor literal em qualquer HTML ou CSS da proposta, salvo as declarações `--proposta-` e a Oli, que tem cores fixas pelo design system.
- A tabela vai no README, e o `--readme` confere os números.

## § 354 · As imagens (F10, decisão 13)

- **O formato:** escala 1, JPEG de qualidade 80 para página inteira e PNG para recorte.
- **O tamanho:** cada imagem com até 500 KB (lidos como 500.000 bytes) e o total novo de `docs/relatorios/fase-10/` com até 25 MB (25.000.000 bytes). As duas leituras são as mais estritas.
- **O nome:** em inglês, com a tarefa, o idioma, o tamanho, o tema e o estado (por exemplo, `compress-image-pt-360-dark-result.jpg`). As screenshots dos protótipos seguem `<protótipo>-<idioma>-<estado>-<largura>-<tema>.jpg` (por exemplo, `tool-a-en-rest-360-light.jpg`), e o `imagens.mjs` exige esse padrão em `prototipos/` (§ 381, d-11).
- **O `imagens.mjs`** mede cada imagem e o total, confere o tipo verdadeiro do arquivo e a pasta, e reprova imagem sem referência no README, no `index.html`, na folha ou no relatório.

## § 355 · O que iria para outros arquivos (F10, decisão 14)

O critério 1 limita o diff a `docs/propostas/ux-v2/`, aos arquivos novos da run em `docs/relatorios/`, ao prompt e ao fim do `DECISOES.md`. Por isso, o que outra run copiaria fica no relatório:
- as pegadinhas novas vão para a seção "Para o docs/claude/", com o arquivo do tema e o texto pronto;
- as pendências novas vão para a seção "Para o PENDENCIAS", com a linha pronta no formato das seis colunas.

Uma proposta que mudaria a arquitetura vira uma ADR "Proposta" no README, não em `docs/adr/`, e uma linha em "Para o PENDENCIAS".

## § 356 · As verificações (F10, decisão 15)

Os sete scripts ficam em `.cache/f10/`, em `.mjs`, fora do Git:
- `diff.mjs`: o escopo, com `origin/main...HEAD`;
- `readme.mjs`: o README, o `index.html` e o `ESCOLHAS.md`;
- `prototipos.mjs`: os protótipos;
- `contraste.mjs`: o contraste;
- `densidade.mjs`: a densidade;
- `oli-sad.mjs`: a pose `sad`;
- `imagens.mjs`: as imagens.

Cada um sai com código diferente de zero quando reprova, e as saídas reais vão para o relatório.

Nos três pontos em que a ficha deixa a leitura em aberto, os scripts usam a mais estrita:
- o `diff.mjs` confere também a classe que o CI vai dar (`portões`);
- o `prototipos.mjs` reprova controle da página abaixo de 48 px, e não só abaixo dos 24 px que o axe cobra pela WCAG 2.5.8;
- o `readme.mjs` lê os ids das pendências do `PENDENCIAS.md` (as linhas dos grupos 5 e 6 e as 8 avulsas) e os cruza com o arquivo da ordem, e não usa um número fixo; ele roda de qualquer pasta, com os caminhos da raiz do repositório (§ 381, d-07).

## § 357 · A PR e o CI (F10, decisão 16)

- **A PR:** [vmatusita/fileorca#22](https://github.com/vmatusita/fileorca/pull/22) abriu em rascunho logo depois do primeiro push. Cada push roda o job `leve`, e a run não usa o rótulo `ci`.
- **No fim,** com tudo commitado (o relatório, a revisão e as imagens):
  1. o push;
  2. a espera da execução leve verde;
  3. o `gh pr ready`.

  Assim nenhum `ci-ok` vermelho de uma execução leve cancelada fica no commit (pendência "F9 ci-ok duplicado"). O `gh pr ready` dispara a classe `portões`, e o `merge` mescla sozinho.
- **Depois do `gh pr ready`,** nada de push. O `pnpm ci:custo` da execução final vai na descrição da PR (`gh pr edit 22 --body-file`), mesmo depois do merge.

## § 358 · As URLs das tarefas e o guia do diagnóstico (F10)

- **As URLs** vêm do mapa de rotas (`src/i18n/routes.ts`) e foram conferidas no `dist/`:

  | Tarefa | en | pt | es |
  |---|---|---|---|
  | Comprimir imagem | `/compress-image/` | `/pt/comprimir-imagem/` | `/es/comprimir-imagen/` |
  | HEIC para JPG | `/heic-to-jpg/` | `/pt/heic-para-jpg/` | `/es/heic-a-jpg/` |
  | Juntar PDF | `/merge-pdf/` | `/pt/juntar-pdf/` | `/es/unir-pdf/` |
  | Hipoteca | `/mortgage-calculator/` | — | `/es/calculadora-de-hipoteca/` |
  | SAC × PRICE | — | `/pt/simulador-sac-price/` | — |
- **A hipoteca não existe em pt.** O `br-sac-price` nasce da hipoteca, mas os registros dizem que as páginas não são equivalentes (sem par no hreflang). A tarefa entra em en e es, e o SAC × PRICE fica como a tarefa de pt.
- **O guia:** `guides-heic-to-jpg-on-windows` (`/guides/heic-to-jpg-on-windows/`, `/pt/guias/heic-para-jpg-no-windows/`, `/es/guias/heic-a-jpg-en-windows/`).
  - **Por quê:** sem dados do GA4 (§ 359), a ficha manda um guia de arquivo com a ferramenta embutida que exista nos três idiomas. Os 10 guias de arquivo cumprem isso, e este liga a tarefa do HEIC ao guia: o mesmo motor, numa página de leitura.
  - **A alternativa:** o `guides-combine-pdfs-on-phone`, que embute o juntar PDF.

## § 359 · Sem dados do GA4 e do Search Console (F10)

`.cache/dados-f10/` não existe: o Victor não exportou os eventos do GA4 nem as páginas e consultas do Search Console antes da run.

O diagnóstico seguiu só com medida e heurística, como a ficha prevê. Ficaram para quando houver dados:
- a conclusão por página (`tool_complete` sobre `tool_start`);
- as saídas;
- as páginas com muita impressão e pouco clique;
- a escolha do guia mais visto.

O relatório lista isso no que é do Victor. No Git, nunca vai número absoluto: só proporção e ordem.

## § 360 · Como a densidade foi medida na prática (F10, decisão 10)

- **O script:** o `.cache/f10/densidade.mjs`, fora do Git. Ele abre a 360×740 as 208 páginas do `dist/` e o protótipo do hub de guias, com o `fo-consent` gravado e a ferramenta hidratada em repouso, e insere caixas de 300 px onde o mapa manda.
- **Onde a caixa entra:** só em fronteira de bloco. Vale:
  - entre seções do `<main>`;
  - entre parágrafos de uma seção de texto, nunca logo depois de um título;
  - entre perguntas.

  Nunca dentro de grade, tabela, painel, cronograma, ferramenta embutida, lista, formulário, trilha, topo ou faixa da categoria. Nunca colada em tabela.
- **A margem não colapsa.** A margem de 150 px do `.fo-ad` não colapsa na grade do `.fo-main` (gap de 16 px): cada caixa soma 616 px ao `<main>`, e o vizinho fica a 166 px. A densidade conta a caixa de 300 px; a margem entra no denominador, como no site.
- **A 1280×800:**
  - o multiplex tem 498 px de caixa: o `ins` de `floor(758 × 0,6)` = 454 px, pela fórmula do carregador para a coluna de 758 px, mais o rótulo;
  - as laterais têm 300×644 cada.
- **O tempo e a saída:** 11 s para as 211 páginas. O resultado vai para `.cache/f10/densidade.json` e `densidade.md`, e a tabela, para a seção 8 do README.
- **O resultado:** nenhum molde passa de 30 % na leitura conservadora. O pior é a ferramenta de imagem, com 22,3 % em `/png-to-jpg/`.

## § 361 · O mapa de anúncios: o que muda da seção B, e a alternativa B (F10, obrigatório 7)

- **O multiplex só a partir de 768 px.** Com 1.700 px a 360 px (§ 351), 10 dos 12 moldes passam de 30 % na conservadora (até 41,6 %); só a home (26,0 %) e o guia de dinheiro (26,1 %) caberiam. O multiplex cresce com a tela (1.830 px a 412 px), então a regra é por largura, igual para todos. A F12 o esconde abaixo de 768 px por CSS. É uma suposição: a ajuda do AdSense proíbe esconder unidade "a não ser ao implementar uma unidade responsiva" (`support.google.com/adsense/answer/1354736`) e mostra a media query com `display: none` no código responsivo (`answer/9183363`, num exemplo de tamanho fixo por largura). A F12 confere as duas páginas antes. Plano B, se não puder: o script de `push` cria o `<ins>` só nas caixas cuja largura bate no carregamento e empurra uma vez, sem refresh; sem permissão e sem o plano B, o multiplex sai (§ 381, c-02).
  - **A 768 px,** onde o multiplex começa, o conteúdo 1 e o multiplex do carregador dão no máximo 26,1 % na conservadora a 768×1024 e 26,5 % a 812×375, em 19 páginas (`.cache/f10/densidade768.mjs`; § 381, c-04).
  - **A alternativa recusada:** o multiplex só na home e nos guias de dinheiro, uma regra por molde, frágil.
- **O conteúdo 2 em diante só abaixo de 768 px.** A 1280×800, as fronteiras escolhidas no celular ficam a 726 px umas das outras, menos de 1,5 tela (1.200 px). No computador, esse papel é das duas laterais e do multiplex.
- **As laterais:**
  - **A lateral 1 começa 150 px abaixo do cabeçalho.** Hoje ela fica a 29 px do botão de idioma e da busca, que são menus (UX-01 e UX-07; `.cache/f10/agentes/header/medir-rail.mjs`), e o menu de idioma aberto cai em cima dela. Os protótipos a desenham assim desde a revisão (§ 381, c-01).
  - **Ao lado da água:** a lateral fica a 150 px ou mais da coluna enquanto o WaterLevel está na tela; "ao lado" é lido como a menos de 150 px, a leitura da § 20. A leitura literal do README do WaterLevel (a lateral some no processamento) é uma decisão avulsa do Victor (§ 381, a-02).
  - **A lateral 2 fica 1.200 px abaixo da 1ª, de borda a borda,** em `position: absolute` numa coluna esticada, e só aparece quando cabe. Isso vale para as 181 páginas com anúncio, sem CLS.
- **Os primeiros anúncios:**
  - **o 1º da ferramenta,** com o UX-04 A marcado, vai depois do "Como usar" (§ 371): a F12 lê a marca e o põe ali; sem a marca, depois dos chips, como a seção B (§ 381, d-04);
  - **o 1º do hub de dinheiro** vai depois da grade de crédito, pela letra da seção B; hoje vem depois das duas grades;
  - **o 1º do guia** vai no texto, logo depois da ferramenta embutida, com um parágrafo entre os dois; hoje vem depois da metade do texto.
- **Nunca colado em tabela, em todo molde.** A seção B pede isso só no guia. Uma regra só é mais simples de escrever e testar.
- **Uma unidade por posição:** `conteudo`, `conteudo-2` a `conteudo-5`, `lateral`, `lateral-2` e `multiplex`. São 37 unidades com a alternativa A, contra as 15 da seção B, que o Victor cria à mão no AdSense (uma decisão avulsa do `ESCOLHAS.md`). A ajuda do AdSense não tem regra sobre repetir unidade, e uma por posição separa o relatório. Sem ID, a posição não aparece (Mudança 10), então o Victor limita as caixas criando menos unidades.
- **A alternativa B** lê os 1.110 px de topo a topo, como uma frequência. Ela dá 807 anúncios de conteúdo no celular contra 618 (4,5 por página contra 3,4), 43 unidades e o pior molde em 24,0 %. A recomendação é a A, a leitura da § 351.
- **O `gate:prontidao` conta toda caixa do HTML** (150 palavras do `<main>` por caixa), mesmo a escondida naquela largura. Com o mapa, 111 das 181 páginas reprovariam; contando o que cada largura mostra, 0 no celular e 14 no computador.
  - **A recomendação:** a F12 conta por largura e mantém as 150 palavras por caixa. Isso muda a conta de um teste, então pede o ok do Victor e um §.
  - **Sem o ok:** o teto é palavras ÷ 150 caixas por página, e o mapa encolhe. O ok é uma caixa das "Decisões avulsas" do `ESCOLHAS.md`.
  - **A conta é da home de hoje** (560 a 758 palavras). A home B do UX-03 tem 345 a 376: com 3 caixas por largura, o portão pede 450, então ou a F13 escreve de 75 a 105 palavras a mais, ou a B fica com 2 anúncios por largura (§ 370, § 381, c-03).

## § 362 · "Nenhum texto liga doação a anúncio": a leitura (F10)

- **A tensão:** o texto da página de apoio da seção C diz "Ads cover the costs; every coffee becomes the next tool", e a parede da seção A diz "With your ad blocker on, Oli gets nothing". As duas falam de anúncio e de dinheiro, e a regra do PLANO diz que "nenhum texto liga doação a anúncio".
- **A leitura:** a regra proíbe dizer ou sugerir que a doação compra, troca ou tira anúncio, ou que doar compensa o bloqueador. Ela vem junto de "sem anúncio para quem doa continua fora". Dizer que os anúncios pagam os custos e que o café vira a próxima ferramenta não troca uma coisa pela outra. Por isso os protótipos usam os textos das seções A e C exatamente.
- **As redações sem a primeira metade:** o protótipo da página de apoio traz uma (`support.html?texto=ajuste`), e o README da parede, outra, como proposta. O Victor marca no `ESCOLHAS.md`: a da parede no ajuste 3 do UX-06, a da página de apoio nas "Decisões avulsas" (desde a revisão, § 381, c-06). A parede nunca menciona o café como forma de sair dela (F12, "Fora").
- **Para a revisão:** a lente (c) testa esta leitura.

## § 363 · O cabeçalho: o espaço no celular, a grade a 1280 e os menus (F10, UX-01)

- **O idioma entra no Menu abaixo de 768 px,** nas duas alternativas.
  - **As medidas:** o logo tem 126,5 px, e a busca, o tema e o Menu têm 48 px cada. Com 8 px de espaço, dá 294,4 px, e sobram 33,6 px a 360. Com 4 px de espaço, dá 282,4 de 288 px a 320. As cinco peças juntas só caberiam a partir de 398 px.
  - **As alternativas recusadas:** o logo só com a Oli (tiraria "FileOrca" do celular), o tema dentro do Menu (a seção D pede o botão no cabeçalho) e o idioma sem o globo (ainda não cabe).
- **A partir de 1280 px, o cabeçalho segue a grade da moldura.** O logo fica em x 36, alinhado com a coluna (hoje ele fica em x 16), e o último controle, em x 794, a 150 px da lateral (x 944).
  - **A alternativa recusada:** descer a lateral para y 388 ou mais, o que tiraria metade dela da primeira tela.
- **Os menus em `position: absolute`,** com o anchor positioning e uma reserva `top: 68px`. O menu de idioma de hoje passa de `fixed` para `absolute`, para nunca ficar parado sobre a página, e sobre um anúncio, enquanto ela rola.
- **O botão de tema:** o nome e o ícone vêm do CSS, a partir do `data-theme` do `<html>`, então ficam certos já na primeira pintura, sem script.
  - **Os scripts inline:** 185 bytes no `<head>` e 422 no botão, 320 em gzip juntos.
  - **As metas:** entra a `<meta name="color-scheme" content="light dark">`; o `theme-color` fica igual.
- **Os ícones novos** ficam em `docs/propostas/ux-v2/icons/`: menu, sol, lua, sistema e livro (Guias), no formato dos 39. Eles usam `currentColor` porque a proposta não aceita cor literal; na F11 vão para `docs/design/assets/Icons/` com o traço dos outros.
- **A recomendação é a A** (o Menu de papel, em toda largura): um padrão só, 64 px e uma linha em toda largura, e metade do teste da B.

## § 364 · O hub de guias e o cartão de guia (F10, UX-02)

- **Nenhuma Oli no hub.** Ela diz estado, e o hub não tem estado. A 360 px, uma Oli de 96 px deixaria só 168 px para o H1, e o hub tem até 5 caixas de anúncio.
- **A introdução em duas partes:**
  - **no topo:** a frase da faixa (en 32 palavras, pt 28, es 31);
  - **no fim:** "Como os guias são feitos" (en 59, es 66, pt 44 mais a nota de que pt não tem guias de dinheiro, 36).

  O texto próprio soma en 91, pt 108 e es 97 palavras. Um parágrafo de 60 a 75 palavras no topo foi medido e empurrava o primeiro cartão para baixo da dobra.
- **O cartão de guia (`.fo-guidecard`)** diz "Measured on N test files", com o N lido de `data/guides-measured.json` no build. Os guias de dinheiro dizem "Numbers worked out". Ele também diz qual ferramenta o guia traz. É diferente do ToolCard (fecha a F5b F-12).
- **A faixa do hub** usa `brand-soft`. O hub não tem cor de categoria, e o `surface-sunken` é o chão do AdSlot.
- **As entradas:**
  - **o rodapé:** o bloco "Guides" fica embaixo de Utilities; uma 8ª coluna não cabe a 1280 px;
  - **a home:** 4 guias, um por grupo e um quarto para o celular, escolhidos pelo volume do `data/keywords.csv`;
  - **a ferramenta que tem guia:** o cartão vai no fim da seção "How it works";
  - **a busca:** ela ganha `kind: 'tool' | 'guide'` e agrupa em Tools e Guides.
- **Para a F12:** o hub entra no mapa como os hubs de categoria. A densidade conservadora é de 14,1 %.

## § 365 · O destino das 37 pendências (F10, decisão 6)

- **A conta:** 35 vão para "corrigir", 1 para "aceitar e registrar" e 1 para "descartar". Por run: 35 na F13, 1 na F11 (a F5b F-12, com o cartão de guia do UX-02, como o `PLANO-MELHORIAS.md` já manda) e 1 na F12 (a F3 f-06, junto com a c-04, que mexe no mesmo script do consentimento).
- **O estado:**
  - 30 estão abertas com o mesmo código;
  - 6 mudaram de forma: a F4 ACE-9, a F5a D-8, a F5a F-11, a F4-F7 e-2, a F4-F7 f-1 e a F4-F7 f-2;
  - 1 já está resolvida: a F7 e-1, pela face `Figtree Steady` da § 305.
- **As duas que não vão para "corrigir":**
  - **a F7 e-1, descartar:** já resolvida. Sai do `PENDENCIAS.md` citando a § 305, e o `layout-shift.spec.ts` já prova;
  - **a F4 ACE-7, aceitar e registrar:** a ordem de tabulação "campos principais, resultado, campos opcionais" segue o molde da calculadora (§ 124: o resultado logo depois dos campos principais), e mudar o DOM poria o resultado depois dos opcionais no leitor de tela. A linha diz o teste que confere a ordem.
- **O que responde a cada uma:**
  - **mudança visual:** o UX-NN com o protótipo. São 25 linhas:
    - UX-11 (as 12 do PDF);
    - UX-12 (as 9 das calculadoras e do QR);
    - UX-13 (2);
    - UX-09 (2);
    - UX-04 (2);
    - UX-10 (1);
    - UX-02 (1).
  - **só comportamento:** o teste que a F13 escreveria (a F7 obs 1, a F3 f-06, a Idiomas R2-03, a F5a D-10 e a F5a D-11), com o que ele afirma e que reprova sem a correção.
- **Onde as pendências apontam além do texto:**
  - a F4 ACE-9 junta dois defeitos opostos: falta cabeçalho de linha nas calculadoras, e ele se repete nos guias;
  - a F7 obs 3 diz "Mulch", mas os rótulos que quebram são os da Paint;
  - a F5a D-12 cresceu com o "Copiar código" do Pix, de 40 px.

  As três vão para "Para o PENDENCIAS" do relatório.

## § 366 · A lista "para avaliar": cinco propostas e dois descartes (F10, decisão 7)

| Item | Situação | Por quê |
|---|---|---|
| A-1 · o resultado direto para a próxima ferramenta | proposto (UX-14) | O README do NextStepChips promete chips que "levam o arquivo, ou a pessoa", e hoje o destino abre vazio (D-05, D-11, D-49). A caixa da F8 já existe (Cache Storage `fileorca-inbox` e o `takeInbox` nas ilhas, § 290). O custo é cerca de 1 KB em gzip no chunk que já existe, sem arquivo nem requisição nova. |
| A-2 · as ferramentas recentes e "a Oli já economizou X MB" | descartado | Não há evidência de atrito (nenhum D-NN ou G-NN), as seis tarefas começam na URL da ferramenta e não há GA4 para medir a volta (§ 359). No aparelho compartilhado, a lista mostra o que foi usado (as calculadoras de saúde e de dinheiro dizem muito). Pela § 49, só daria para gravar depois do Aceitar. E custaria JS e risco de CLS em toda página. Volta à mesa se o GA4 mostrar muita volta à mesma ferramenta. |
| A-3 · soltar o arquivo em qualquer lugar | proposto (UX-18) | Hoje o `dragover` do documento promete "copiar" na página inteira, e o `drop` fora da ilha some em silêncio (contra o README da DropZone). A alternativa recomendada aceita o soltar em todo o conteúdo do site e não toca no anúncio: o iframe de outra origem recebe o próprio arrasto, e a zona volta ao repouso. O véu na tela inteira cobre os anúncios durante o arrasto e fica como mudança de regra. |
| A-4 · a cena de fundo do mar nos hubs | proposto como alternativa B do UX-15 (mudança de regra) | Cinco SVG inline de 0,55 a 0,72 KB resolvem o G-05, mas mudam "Mar: nenhuma imagem de fundo" e "Nunca: imagem de fundo". A alternativa A do UX-15 (o aquário, dentro das regras) é a recomendada. |
| A-5 · o "mar à noite" | proposto como alternativa B do escuro do UX-15 (mudança de regra) | No escuro, o `deep` fica 1,33:1 mais claro que o chão (G-07). A B propõe `--proposta-mar-noite` e `--proposta-crista`, com os pares acima do mínimo, e muda "`deep` igual nos dois temas". A A (a onda no topo do ResultCard e do ResultHero) resolve pela forma, sem cor nova, e é a recomendada. |
| A-6 · a microanimação da Oli por estado | proposto (UX-10) | Fecha a F3 d-02 (WCAG 2.2.2): o maior movimento que começa sozinho acaba em 3.120 ms, nada roda aos 5,5 s, e o movimento reduzido não tem animação. É só CSS. Muda a frase "loops com `ease-in-out`" da regra "Movimento". |
| A-7 · o cenário salvo nas calculadoras | descartado | Contradiz o princípio 6 ("o cenário vive no link") e a § 114 ("a página nunca escreve na URL"), e quebraria o `money-privacy.spec.ts`, que procura cada número digitado no `localStorage` e no `sessionStorage`. No aparelho compartilhado, a próxima pessoa veria os números de quem veio antes. O link do `#` já guarda o cenário quando a pessoa pede. |

## § 367 · O que torna cada alternativa do FileOrca, e nenhuma pose nova além da `sad` (F10, decisão 9)

| Item | Alternativa A | Alternativa B | Recomendada |
|---|---|---|---|
| UX-01 · cabeçalho | o Menu de papel: um botão em toda largura, a folha com a **dobra** e o **traço** marcando a seção | o **mar**: a navegação exposta no computador, com a seção "debaixo d'água"; uma gaveta de mar fundo no celular, com a Oli na borda | A (um padrão só, 64 px e uma linha) |
| UX-03 · home | a **Oli** na borda da **água** de uma zona "solte qualquer arquivo", com as categorias em papéis com a **dobra** | o **mar** por categoria: faixas com a onda e um número medido, as ferramentas como chips, a Oli nadando na faixa de água | B (sem JS) |
| UX-04 · página de ferramenta | a **água**: um lugar só, o resultado como o mar que subiu, a placa presa pela Oli | a **dobra**: o arquivo como papel que afunda e volta; a bandeja ao lado no computador e as abas no celular | A (M, sem arquivo novo) |
| UX-07 · mapa de anúncios | 1.110 px de borda a borda | 1.110 px de topo a topo | A (a leitura da § 351) |
| UX-15 · hubs | o aquário: a água, a crista na cor da categoria e a Oli `swim`, dentro das regras | a cena por categoria em SVG (mudança de regra) | A |
| UX-15 · escuro | a onda no topo do ResultCard e do ResultHero (a profundidade pela forma) | as cores do "mar à noite" (mudança de regra) | A |
| UX-18 · soltar em qualquer lugar | o soltar em todo o conteúdo, sem tocar no anúncio | o véu na tela inteira, que cobre os anúncios (mudança de regra) | A |

- **Em cada par, a B muda a estrutura** (onde as coisas ficam e como se chega a elas), não só a cor. No UX-07 e no UX-15, ela muda a regra.
- **Os itens de uma alternativa só:** o UX-02, o UX-05, o UX-06, o UX-08 a o UX-14, o UX-16 e o UX-17. A ficha não pede duas para eles, e onde há uma escolha de desenho real ela aparece como estado do protótipo e linha do `ESCOLHAS.md` (por exemplo, a F7 f-10 e a F5a F-10).
- **Nenhuma pose nova além da `sad`.** O diagnóstico não pediu nenhuma:
  - o UX-10 anima as nove de sempre;
  - o UX-14 usa a `lost` fora da 404, para a caixa vazia da ferramenta, o que é uso novo de uma pose que já existe;
  - o G-08 (a calculadora sem a Oli) se resolve com a `wave` na borda do ResultHero (UX-12).

## § 368 · O card do café e a página de apoio (F10, UX-05)

- **O link do Ko-fi** é o `https://ko-fi.com/victormatusita` da § 3 (o `KOFI_URL` do site). O `ko-fi.com/fileorca` do PLANO e da ficha não existe. O protótipo segue a § 3 e diz a diferença.
- **Em pt, o card leva um botão só,** "Pagar um café no Pix" (para `/pt/apoie/#pix`, como hoje). O rótulo do Ko-fi vai no botão da página de apoio, onde os dois caminhos ficam lado a lado. Dois botões no card seriam três alvos de 52 px no celular. É desvio da seção C, que lista os dois rótulos em pt; o README e o `ESCOLHAS.md` o dizem como desvio, e os dois botões ficam como alternativa nas "Decisões avulsas" (§ 381, d-12).
- **Sem "Agora não".** A linha já aparece no máximo uma vez a cada 7 dias. O "Não mostrar de novo" grava `{"never": true}` e põe no lugar uma frase de confirmação (`role="status"`), texto novo nos três idiomas que a F12 passa pelo LanguageTool.
- **A linha do rodapé vai para o topo do rodapé.** Hoje a base dela fica a 24 a 46 px da âncora do AdSense, e "O pedido de café nunca encosta num anúncio".
- **O gatilho do 1º uso para quem bloqueia anúncio sai** (Mudança 11), junto com a F3 c-08. Fica o 3º uso para todos.
- **A Oli `coffee` fica à direita do título,** olhando para ele (G-10). O vapor passa a parar sozinho em 4,8 s (a saída A da F3 d-02).
- **O "Copiar código" do Pix vira um botão de 52 px** (F5a D-12) e, no celular, vem antes do QR.
- **O Pix do protótipo é de mentira:** um QR que não lê e um código "exemplo".

## § 369 · A parede do bloqueador (F10, UX-06)

- **O fundo do diálogo:** no claro, a `water` a 92 %; no escuro, o `deep` a 92 %, sem token novo.
  - O `deep` no claro viraria o véu escuro da mensagem do Google.
  - A `water` no escuro daria 2,59:1 na borda do card.
- **O botão principal é o `fo-btn--brand`**, nunca amarelo. A ordem fica marca, neutro e ghost, com um primário só.
- **A ajuda:**
  - um botão com `aria-expanded` abre o painel;
  - as 9 entradas são `<details name>` (uma aberta por vez);
  - o recarregar e o escape ficam num rodapé fixo do card, sempre à vista.
- **O Esc no bloqueio** tem três camadas: o `closedby="none"`, o `cancel` com `preventDefault` e o `close` que reabre. O `CloseWatcher` do Chromium deixa um segundo Esc fechar sem gesto no meio. No aviso, vale o `closedby="closerequest"`.
- **A partir de 1280 px, o card centra na coluna da ferramenta,** com a Oli a 256 px da lateral. Centrado na janela, ela ficaria a 28 px dela.
- **Com a parede aberta,** a rolagem trava (CLS 0) e a Oli da página some: uma Oli por tela.
- **O escape:** a data vai para o `fo-wall-escape`, sem depender do aviso de cookies, pelo precedente da § 49.
- **Na UE,** a parede espera o `__tcfapi` dar `tcloaded` ou `useractioncomplete`, para não deixar a mensagem de consentimento inerte.
- **A detecção:** um anúncio preenchido encerra a detecção (o caso do Acceptable Ads), e a isca nunca é um `ins.adsbygoogle`.
- **Os textos novos,** fora da seção A, nos três idiomas: a linha do depois do escape, o título e a dica do painel, e o "Fechar".
- **O texto da Privacidade da seção A** ("nada sai do aparelho") não bate com a realidade: a tag do Google conta a detecção ao Google, e o `adblock_wall` vai para o GA4. A especificação propõe outro texto, e a decisão é do Victor ("Para o PENDENCIAS").

## § 370 · A home: a alternativa B, os números e os anúncios por largura (F10, UX-03)

- **A recomendação é a B** (o mar por categoria). Ela resolve os G-01, G-02, G-03, G-06, G-18 e G-21 sem nenhum JS: a home continua sem ilha, com 4 requisições e 3,1 KB de JS inline. O `<main>` cai de 8.872 px para 4.696 px a 360 (en, sem anúncio).
  - **A alternativa A** (a zona "solte qualquer arquivo", que reusa o `formatOfBytes` e a caixa de entrada do "Abrir com" da F8) dá mais papel à Oli. Em troca, ela quebra a regra "nenhum arquivo JS novo por página": mais 4,9 KB em gzip (o script e o chunk `sniff`), e as requisições vão de 4 para 6. Ela também repete a zona de soltar da página de ferramenta.
- **As contagens do H1** seguem a conta da página Sobre de cada idioma: 50 em en (8 + 12 + 18 + 11 + 1), 29 em pt e 39 em es. O registro `HUB_MONEY_IDS` tem 14 calculadoras de dinheiro em en e es; as 4 variantes de hipoteca e de saldo final são presets. A F13 decide se elas entram na conta, com um §.
- **Todo número das faixas e das descrições tem fonte no repositório:** o medido (o `data/guides-measured.json`), o exato (o preset de 1280×720, o AES-256 do proteger PDF) ou o exemplo (`fixtures/calc/`). A exceção é o "2,6 MB → 717 KB" do comprimir, que vem do diagnóstico da F10, fora do Git: a F13 grava esse número numa fixture antes de usá-lo.
- **Os anúncios da home:** caixas só no celular ou só a partir de 768 px (`fo-mobile-only` e `fo-desktop-only`), porque com uma posição fixa os 1.110 px não valem em todas as larguras. Desde a revisão, os protótipos da home e do guia seguem o mapa a partir de 768 px: só o conteúdo 1 e o multiplex, com a altura do carregador (§ 381, c-05). O `gate:prontidao` limita a home B: 345 a 376 palavras pedem 75 a 105 a mais para os 3 anúncios por largura (§ 361; § 381, c-03). As duas laterais ficam 800 px uma da outra na home (uma tela a 1280×800, nunca as duas à vista); a seção B não fixa esse número, e o mapa geral (§ 361) usa 1.200 px. A F12 escolhe um número só.

## § 371 · A página de ferramenta: a alternativa A e o 1º anúncio depois do "Como usar" (F10, UX-04)

- **A recomendação é a A** ("um lugar só, mais firme", a água). O retângulo tem a mesma altura em todos os estados: 356 px no celular e 340 a partir de 768. O resultado é o mar que subiu, com a placa também a 360. Uma faixa de altura fixa abaixo do retângulo mostra as opções e, no resultado, os chips e o "Ajustar". O antes e depois abre só quando a pessoa pede.
  - **O que a medida do protótipo dá:** o Baixar termina em 440 px (en) e em 486 (pt, es), acima do topo do aviso de hoje (532 e 510); os chips ficam a 158 a 182 px do Baixar; a preset em pt vai até 696 px; o CLS da interação esperado é 0,00.
  - **O custo:** G, porque refaz o molde da página de ferramenta (a ficha: "um molde inteiro"), embora fique dentro das duas ilhas que já existem, sem arquivo novo; conta também o retrabalho do `island.spec.ts`, do `a11y.spec.ts` e do `ads.spec.ts`. Pode ir em duas partes: a imagem entre os três primeiros da F13, e o juntar depois ou na 13b (§ 381, d-06).
  - **Os atritos do juntar e do erro** (§ 381, a-01): a lixeira com desfazer em cada linha (D-21), a leitura que já é a lista, com o WaterLevel só depois de 400 ms (D-27), a ajuda da ordem à vista (D-26), o Juntar no ponto onde estava o Escolher (D-22), o erro que diz o caso (D-06) e aponta o PNG para JPG na página do HEIC (D-17), e o puxador com as duas setas (D-09).
  - **A alternativa B** (o papel com a dobra, com a bandeja ao lado no computador e as abas no celular) é G e deixa o Baixar a 8 px do aviso no celular.
- **O que muda no design system:**
  - a água da DropZone em repouso sobe de 12 % para 30 %, e com o arquivo em cima, de 38 % para 60 %;
  - no WaterLevel, a Oli fica no canto, e não na superfície;
  - a placa fica `aria-hidden`, porque repete o número da fala.

  Os README da DropZone e do WaterLevel mudam com §, se o Victor escolher.
- **O 1º anúncio de conteúdo vai para depois do "Como usar".** A seção B diz "depois dos chips", e o mapa (§ 361) mediu assim. Na A, os chips ficam dentro da faixa colada no resultado, e o anúncio logo depois dela cairia na primeira tela a 1280 (D-55). Depois do "Como usar", ele fica em y 1.085 no comprimir e em y 949 no juntar, a 1280. Se o Victor escolher a A, a F12 põe o 1º anúncio da ferramenta depois do primeiro bloco de conteúdo (é ela quem move, lendo a marca do UX-04; a tabela "O que muda da seção B" do README tem a linha); a densidade do mapa não piora, porque a contagem e a altura do `<main>` são as mesmas.
- **No juntar,** a alça (pegar com espaço) sai, e as setas da linha cobrem o teclado e a WCAG 2.5.7. O UX-11 A desenha a linha do Juntar do mesmo jeito; sem o UX-04 A marcado, a alça fica ghost (§ 374; § 381, d-05).

## § 372 · O aviso de cookies compacto (F10, UX-09)

- **O card fica no mesmo lugar, mais baixo:**
  - o texto em `small` (14/20 px) e em duas linhas a 360 px nos três idiomas, com a Figtree e com a Figtree Fallback;
  - 128 px de altura a 360×740 (hoje são 200 e 222), ou 16,5 % da tela;
  - 360 px de largura a partir de 768 px (hoje são 440);
  - os dois botões iguais, lado a lado.
- **O texto repete o selo da própria página:** arquivo, números ou o texto do QR. Hoje as calculadoras dizem "seu arquivo não sai do aparelho" logo abaixo do selo "seus números" (D-29, D-45). Isso muda uma linha do README do CookieNotice: "lembra que o arquivo não sai do aparelho" passa a "repete o selo da página". O "aceitando ou não" sai do card porque não cabe em duas linhas em pt e es; as razões ficam na Privacidade.
- **O `keep()` no script inline:** com o aviso aberto, um ResizeObserver no `#main` tira de baixo dele o elemento focado que se mexeu sem o foco mudar.
  - **A causa achada para o D-01 e o D-10:** no erro, o Preact reaproveita o mesmo `<button>` (`ImagePanel.tsx:843` e `:851`), o foco não muda de elemento e o `focusin` do aviso nunca dispara.
  - **O F3 f-06:** o `resize` e o ResizeObserver passam a valer também no aviso reaberto.
- **O que continua igual:** o aviso não bloqueia, não reserva espaço no fim da página (§ 91 e § 106), usa a `Figtree Steady` e fica acima da âncora.
- **A saída recusada:** o aviso no fluxo, depois da ferramenta (a (b) da F4-F7 f-1). Ela empurraria a página na primeira visita e reabriria o espaço reservado que o Victor recusou duas vezes.
- **O que ainda depende de outros itens:**
  - o número das calculadoras a 360 só sai de baixo do aviso quando o UX-12 o sobe para acima de 596 px;
  - a 320×640, o "Escolher" do pt e do es espera o UX-04;
  - na rolagem 0, a 1ª caixa de conteúdo precisa ficar a 150 px do aviso aberto (y ≥ 882 a 360×740 e y ≥ 934 a 1280×800), e é a F12 que confere.

## § 373 · A Oli por estado, com laço curto (F10, UX-10, F3 d-02)

- **A saída A da F3 d-02:** cada movimento que começa sozinho para antes de 5 s. O maior acaba em 3.120 ms, e nenhum roda aos 5,5 s. A `wave` faz um aceno e para, e um aceno curto volta no `:hover` e no `:focus-within`. O vapor da `coffee` faz dois ciclos e para visível. A `swim` só aparece com o WaterLevel (depois de 400 ms), e a `cheer` dura 0,6 s, uma vez.
- **As nove poses ganham uma reação por estado:** `wave` na espera, `gulp` com o arquivo em cima, `swim` na água, `cheer` no resultado, `oops` no erro, `coffee` no apoio, `buoy` offline, `lost` na 404 e `peek` na busca vazia. A `oops`, a `buoy`, a `lost` e a `peek` hoje não reagem a nada.
- **O custo:** só CSS, só `transform` e `opacity`, nenhum JS, nenhuma requisição e CLS 0. Com o movimento reduzido, não há nenhuma animação, e o quadro parado é o mesmo do movimento.
- **A mudança de regra:** a regra "Movimento" do design system ("loops com `ease-in-out`") passa a dizer que nenhum laço que começa sozinho passa de 5 s.
- **Duas pegadinhas:**
  - a animação do vapor mira o `<path>` do `<symbol>` dentro do sprite, então o seletor precisa pendurar num ancestral do sprite;
  - trocar a lista `animation` de [a] para [a, b] preserva a animação `a` e só começa a `b`.

## § 374 · As peças do PDF (F10, UX-11)

- **O `fo-btn--sm` sai das quatro peças de PDF** (F5a D-12), que ficam com 52 px. A sugestão da pendência, 48 px só no celular, reprova no verificador da F10, que exige 48 px também a 1280. O único `--sm` que sobra é o "Copiar código" do Pix, que o UX-05 também tira.
- **A caixa "Pular a primeira página" vira um OptionGroup** ("Primeira página: Numerar / Pular", F5a F-11). Ela é a única caixa de seleção nativa do site, e o design system já tem a peça para escolhas de 2 a 4. Aceitar a caixa nativa estilizada fica como a alternativa.
- **O aviso da Sign e o do Compress "forte" viram a nota do design system** (`brand-soft` e o ícone `info`, F5a F-10). Na alternativa A, a frase do README do OptionGroup "avisa antes, em OliMessage info" passa a "numa nota", o que muda uma regra; a alternativa B segue o README, com a Oli `wave`.
- **As setas do Juntar e do Organizar viram `fo-btn--icon`** com traço e lábio (D-23), e as desativadas seguem o estado desabilitado do README no Organizar. No Juntar, a linha segue o UX-04 A: sem alça, e onde a seta não anda fica um lugar vazio de 48 px (§ 381, d-05).
- **A página escolhida ganha um ícone `check`** além da cor (D-7, WCAG 1.4.1), e a borda dela não passa da dobra (F-8).
- **A dobra do FileCard no painel ganha a cor do painel** (F-7). O FileCard de PDF ganha o ícone `pdf` no lugar do quadrado vazio (F-6).
- **Uma pegadinha:** o `.fo-page` do `bundle.css` (a prévia do ToolPage, com 360 px de largura) colide com a célula da grade de páginas do site.

## § 375 · As calculadoras e o QR (F10, UX-12)

- **O resultado e o Baixar PDF acima da dobra a 360,** com o Baixar em bloco (D-30, D-31, D-39, D-44). O número do ResultHero termina acima de 596 px, para o aviso compacto (UX-09) não o cobrir.
- **O erro de faixa avisa que o número está velho e não empurra o card** (D-34, D-35, D-41). A borda de erro tem 2 px mais 1 px de `box-shadow`, para o campo não crescer.
- **A F4 ACE-11:** o campo culpado ganha `aria-invalid` e um `aria-describedby` para a frase do herói, sem repetir a frase.
- **A F4 ACE-8:** o botão do CSV ganha um verbo ("Baixar CSV"), e o do cronograma fica com um texto fixo e o chevron que gira com o `aria-expanded`.
- **A F4 ACE-9:** a tabela aberta ganha o cabeçalho de linha, sem o `sticky` herdado do `.fo-amort th`.
- **A Oli `wave` senta na borda do ResultHero** (G-08), a 150 px de qualquer anúncio. O H2 em Figtree vira Fredoka (G-19, D-46).
- **O token novo:** `--proposta-danger-on-deep` (`#FF8A80`), para o ícone de alerta sobre o `deep`. O `danger` tem só 2,45:1 ali no tema claro.
- **A F7 f-10 tem duas saídas:**
  - **A:** esconder o Baixar até haver código, como diz o README do Button;
  - **B:** aceitar o Baixar desabilitado e registrar.

  A recomendada é a A. A mesma regra vale para o Baixar PDF das calculadoras, ligado pelas § 139 e § 276.
- **A ordem na F13:** o bloco dos rótulos (a BTU, a Paint, a Ovulation e o es E-2) e o do QR, que são P, podem ir antes, sozinhos.

## § 376 · A página de guia (F10, UX-13)

- **Uma ficha "o que medimos" logo abaixo do H1,** com dois ou três números em `number-md` (G-17). A ferramenta vem antes da prosa longa: o "Escolher" vai de y 1.338 para y 898 a 360. A assinatura cabe numa linha só (F5b F-13, G-23).
- **O resultado não empurra o texto:** a caixa reservada é a mesma da ilha da página de ferramenta (UX-04), e o CLS da interação fica em até 0,05.
- **A tabela ganha uma pista de rolagem** (F5b F-2): a sombra de borda feita com token, no traço tracejado da DropZone.
- **A repetição da primeira coluna sai** (a metade dos guias da F4 ACE-9): um `tbody` por valor repetido, com `th scope="rowgroup"` e o `th scope="row"` na célula que separa as linhas.
- **O que muda no `gate:conteudo`** (§ 184, decisão 4 da F5b): o `checkFileGuide` passa a pedir a ordem trilha, H1, assinatura, ficha, ferramenta, introdução, anúncio, medidas, fontes e relacionadas, e procura o link da ferramenta no texto do guia. O `dinheiro-saude` só confere o bloco `[data-ymyl="reviewed"]` e não olha a posição, então a assinatura numa linha não fere o portão.
- **Os anúncios pelo mapa:** a densidade fica em 11,2 % e em 13,5 % na conservadora a 360.
- **Uma dependência:** com a ferramenta mais alta a 1280, o aviso de cookies de hoje cobriria dois terços do "Escolher" na primeira visita, então o UX-09 vem junto ou antes.

## § 377 · O resultado para a próxima ferramenta e o soltar em qualquer lugar (F10, UX-14 e UX-18)

- **O UX-14:** o chip de próximo passo leva o resultado pela caixa da F8.
  - **O que muda no código:** o `takeInbox` passa a devolver `{files, from, lost}`, e o `sessionStorage` ganha o `from`.
  - **A caixa vazia** (a Oli `lost`, "Escolher imagens" e "Voltar para o Comprimir imagem") é um estado novo da DropZone, que ganha uma linha no README dela.
  - **A privacidade:** nada sai do aparelho, e a caixa é apagada na entrega ou depois de 1 h, pelo service worker. A Privacidade ganha um parágrafo nos três idiomas, e o GA4 não muda.
  - **A ordem:** ele vem junto com o UX-04 ou logo depois.
- **O UX-18:** a alternativa A aceita o soltar em todo o conteúdo do site e acende a zona onde ela estiver; em cima de um anúncio, a zona volta ao repouso. A alternativa B, o véu na tela inteira, cobre os anúncios durante o arrasto, e nenhuma política lida o autoriza. Ela põe a Oli em cima de um anúncio coberto, então fica como mudança de regra.
- **Para o PENDENCIAS, qualquer que seja a escolha:** hoje o `dragover` do documento promete "copiar" na página inteira, e o `drop` fora da ilha some em silêncio (`ImagePanel.tsx:587-596`, `PdfPanel.tsx:658-666`). A correção mínima é o `dropEffect = 'none'` fora da ilha, com um teste.

## § 378 · O mar nos hubs e no escuro (F10, UX-15)

- **A alternativa A dos hubs, o aquário, fica dentro das regras:** a borda de baixo da faixa em onda (a forma do rodapé, como elemento, nunca imagem de fundo), a água no fundo da faixa e a Oli `swim`, que para depois de três balanços (4,8 s). No escuro, a faixa é `surface`, com a cor cheia só na crista (G-21).
- **A alternativa B dos hubs, a cena, muda a regra:** cinco SVG inline de 0,55 a 0,72 KB, `aria-hidden`, só com tokens, nunca o LCP e nunca atrás de texto. Ela muda "Mar: nenhuma imagem de fundo" e "Nunca: imagem de fundo".
- **O escuro na alternativa A:** a onda vai para o topo do ResultCard e do ResultHero, para a profundidade se ler pela forma e não pela luminância (G-07). A crista fica em `stroke`, com 4,07:1 contra o chão.
- **O escuro na alternativa B, o mar à noite, muda a regra "`deep` igual nos dois temas":**
  - `--proposta-mar-noite`: `#051230` no escuro, 1,01:1 abaixo do chão;
  - `--proposta-crista`: `#9DB7DA` no escuro;
  - os sete pares (UX15-N1 a UX15-N7) passam nos dois temas.
- **A sobreposição:** a borda de cima do ResultCard em onda é a mesma do UX-04 A. Se os dois forem escolhidos, a F13 constrói uma vez.

## § 379 · Os ícones próprios e as páginas institucionais (F10, UX-16 e UX-17)

- **Os ícones:**
  - **27 ícones novos** em `docs/propostas/ux-v2/icons/`, no formato dos 39 do design system (grade de 24 px, traço de 2 px, `stroke="#0F1B2D"` no `<svg>` raiz, como o `tests/unit/icons.test.ts` confere): carro, cartão, porcentagem, área, tinta, saco, pá, balança, termômetro, calendário, carrinho de bebê, entre outros, e o `file-drop` da DropZone (G-11).
  - **O mapa ferramenta → ícone** está no `icons.html`: as 50 ferramentas de en, as 29 de pt e as 39 de es, com 33 trocas.
  - **Os ícones do UX-01** (menu, sol, lua, sistema e livro) usam `currentColor` no `<svg>` raiz. Na F11, eles vão para `docs/design/assets/Icons/` no formato do design system, com o traço `#0F1B2D`, ou o teste reprova.
- **As páginas institucionais:**
  - **a 404:** a Oli `lost` de 128 px ou mais numa faixa de água, a busca sem a sombra de pop e três links de ferramentas reais (G-13);
  - **a Sobre:** quatro números em `number-md`, por idioma, tirados dos registros no build. O 11 de casa e saúde só existe em en; em pt e es, o quarto número é "3 idiomas" (G-14);
  - **o rodapé no celular:** cada categoria num `<details>`, com o hub como link principal (G-15);
  - **a 1280, sem a lateral:** a coluna da direita das páginas livres recebe o cartão dos números, ou a coluna se centra (G-06).
- **As duas Olis** param depois de 4,8 s (F3 d-02).

## § 380 · As screenshots e o verificador dos protótipos (F10, decisões 13 e 15)

- **A screenshot fotografa a página do site, sem o controle e sem a especificação.** O `prototipos.mjs --shots` mira o `.proto-page` de cada protótipo, a 360×740 e a 1280×800, nos dois temas, no Chromium, em JPEG de qualidade 80 e escala 1. A folha da Oli e o `index.html`, que não têm `.proto-page`, saem inteiros.
- **Só a primeira variante do `<meta name="proto-shots">` de cada protótipo** (`--shots-max 1`), com o nome `<protótipo>-<idioma>-<estado>-<largura>-<tema>.jpg` (desde a revisão, § 381, d-11). Com todas as variantes que os agentes pediram, as screenshots passariam dos 25 MB, somadas às capturas do diagnóstico.
- **Quando uma screenshot passa de 500 KB,** ela continua em qualidade 80 e é cortada nas primeiras telas.
- **O `index.html` é gerado do README** pelo `.cache/f10/gen-index.mjs`: cada item com o link do README, os protótipos nos dois temas, os estados que o item cita e as screenshots. Assim toda imagem de `prototipos/` tem referência.
- **O filtro de cor do `contraste.mjs`** passou a tirar o sprite inteiro da Oli (`<svg class="fo-sprite">`), com as peças `oli-p…` de cores fixas. Antes, toda página com a Oli reprovava pela cor literal das peças, que é permitida pelo design system ("exceto dentro da Oli").

## § 381 · O que a revisão da F10 mudou (F10, revisão adversarial)

A revisão (quatro lentes Sonnet e os céticos, sobre `4d8e946`) deu 34 achados: 1 médio e 32 baixos que ficaram e 1 refutado. As correções ficaram num agente só, nas fontes do README (`.cache/f10/readme-parts/`, `.cache/f10/results/` e `.cache/f10/diag/`), nos protótipos e nos scripts de `.cache/f10/`. O que mudou, achado a achado:

- **a-01 (médio):** o UX-04 A responde aos sete atritos na proposta, na especificação e nos estados dos protótipos. No `tool-a-merge.html`: a lixeira de 48 px em cada linha, com "scan.pdf saiu da lista." e Desfazer no lugar da linha até a próxima ação (D-21, `?state=removed`); a leitura que já é a lista, com "Lendo…", a barra e o × de cada arquivo, e o WaterLevel só depois de 400 ms (D-27, `?state=reading`); a ajuda da ordem à vista entre o Juntar e as linhas (D-26); e o registro de que o ponto do Escolher cai no Juntar e o Começar de novo vai para o pé (D-22). No `tool-a.html`: os casos de erro (`?error=content`, a extensão que não bate, D-06; `?error=heic`, o PNG na página do HEIC com o chip para o PNG para JPG, D-17) e o puxador com as duas setas (D-09, também no `tool-b.html` e no `guide-page.html`). A Evidência do UX-04 nomeia os D-NN. A lista do juntar ficou mais alta, e o retângulo guarda 480, 564 e 540 px a 360 (en, pt, es): os chips do juntar ficam a 290 a 374 px do Baixar (0,39 a 0,51 tela), contra 0,44 a 0,78 tela hoje e os 194 a 298 px que o protótipo dava antes da revisão.
- **a-02:** a tabela "O que muda da seção B" cita o UX-01, o UX-07 e o `medir-rail.mjs` para os 29 px, e não o D-07; o UX-07, a § 361 e uma decisão avulsa dizem o que acontece com a lateral ao lado da água. A gravidade do D-07 fica (o cético: "derruba conta" não é nível da escala da ficha).
- **a-03:** G-15 com 42 links; G-16 com 7 perguntas e a tabela de 10 linhas mais o cabeçalho; o UX-07 com "10 dos 12 moldes (9 dos 11 do `dist/` e o hub de guias)" e as 178 páginas do `dist/` mais os 3 hubs de guias (181).
- **a-04:** o G-12 cita as capturas em pt (`support-pt-360-light.jpg`, de volta ao Git, e `support-pt-1280-dark.jpg`); o G-21 cita o hub de dinheiro escuro (`hub-money-en-1280-dark.jpg`); o D-43 traz os y medidos (o título em 1922 e o botão em 1980 a 2032, abaixo do anúncio) e o D-08 o y do "How it works" (1458), sem a captura de página inteira que saiu do Git. A `support-en-360-light.jpg` deixou de ser citada e saiu.
- **a-05:** o "até 2 px" do escuro ressalva o artefato da trilha, e o D-32 e o D-33 trazem os valores sem ele (≈ 958 e 1.460).
- **a-06:** o D-55 atribui a frase ao `PLANO-FILEORCA.md` (molde da página de ferramenta, item 6), e do `docs/design/README.md` fica só a regra dos 150 px.
- **a-07:** o 2.4.11 é "Foco não encoberto (mínimo)" no D-01 e no D-10.
- **a-08 (refutado, fica):** o nome dos concorrentes numa frase descritiva fora da seção 4 não copia captura, logo, texto nem layout, que é o que a decisão 3 proíbe. Só a remissão do G-16 a "notas" virou "seção 4", e a do U-12 também.
- **a-09:** os scripts dos agentes saíram das worktrees para `.cache/f10/agentes/<nome>/` (um por agente, com um `LEIA.txt`), e o README e o `header-a.html` citam esse caminho; o intervalo do idioma (62,4 a 63,1) diz que é da Figtree e da fonte de reserva.
- **b-01:** o `proto.css` aplica a regra do UX-10 em todo protótipo: a `wave` flutua uma vez (2 × 1,5 s) e para; só a `swim` do processamento é laço, com a duração pelo nome. O laço infinito de hoje fica só no "antes" do `oli-motion.html`.
- **b-02:** todo protótipo que não é o do cabeçalho diz no controle qual cabeçalho mostra ("um marcador de lugar" ou "o de hoje") e aponta para o `header-a.html`; a frase do `home-b.html` e a ordem do Tab do `support.html` dizem o cabeçalho do UX-01 A.
- **b-03:** a 320×568, o `tool-a.html` e o `tool-b.html` (as opções e o botão do erro podem quebrar linha), o `handoff.html` (o Baixar do card com a regra do site, `components.css:177-181`) e o `icons.html` (as tabelas do mapa) cabem. O `.cache/f10/revisao-reflow.mjs` confere toda variante de todo protótipo a 320 px e passa.
- **b-04:** no rodapé do UX-17 (`pages.css`), o link do hub de cada categoria, a linha institucional e a do café passam a 48 px; os links das ferramentas dentro de uma lista aberta ficam com os 32 px de hoje, como exceção dita na especificação. As alturas e as porcentagens do rodapé foram medidas de novo (A corta de 54 a 61 %).
- **b-05:** o UX-06, o Resumo e o `ESCOLHAS.md` dizem que o `fo-btn--brand` no "recarregar" muda a regra do Button/README, e o botão padrão com lábio é uma decisão avulsa.
- **b-06:** a especificação do `header-a.html` diz o que foi conferido (a árvore de acessibilidade do Chromium) e o que fica para a F11 (NVDA, VoiceOver e o WebKit, com a região `role="status"` como saída); a do `wall.html` diz para onde vai o foco quando não havia foco antes (o `<main>` com `tabindex="-1"`).
- **c-01:** o `.proto-rail` começa 150 px abaixo do cabeçalho (`padding-top: var(--ad-clearance)`), como a § 361: a lateral fica a 159 px dos controles em todos os protótipos. O comentário do `proto.css` e as Medidas do `tool-a.html` dizem isso.
- **c-02:** a § 361, a suposição 6, a seção 8 e o `ad-map.html` tratam o `display: none` como suposição, citam as duas páginas da ajuda (`answer/1354736` e `answer/9183363`) e dão o plano B (o `<ins>` criado por script só onde a largura bate, sem refresh); o `ESCOLHAS.md` diz a consequência.
- **c-03:** o UX-03, a seção 8, a § 361, a § 370, o `ad-map.html` e uma decisão avulsa dizem que a home B tem 345 a 376 palavras e que, sem 75 a 105 a mais, o `gate:prontidao` a deixa com 2 anúncios por largura.
- **c-04:** o `.cache/f10/densidade768.mjs` (feito do script da lente c) mediu 19 páginas a 768×1024 (máximo de 26,1 %, `/home-calculators/`) e a 812×375 (26,5 %, `/health-calculators/`); a seção 8, o `ad-map.html` e o teste da F12 trazem as duas larguras.
- **c-05:** a partir de 768 px, os protótipos da home e do guia seguem o mapa: só o conteúdo 1 e o multiplex (o 2º da home A e o 3º do guia ficam só no celular; a caixa só do computador da home B e do guia saiu). O multiplex tem uma altura só, a do carregador mais o rótulo (485 a 500 px na coluna, 498 ao lado da lateral; na home sem lateral, pela largura).
- **c-06:** o texto da página de apoio tem as duas caixas nas "Decisões avulsas"; a § 362 diz onde.
- **c-07:** o `ad-map.html` traz o hub de guias medido, "10 dos 12", a home de hoje separada da home B, a densidade a 768 px, a linha do 1º da ferramenta com o UX-04 A, a lateral ao lado da água e o plano B do `display: none`.
- **d-01:** a regra do item sem marca é por run, no `ESCOLHAS.md`, no README (seções 1 e 5, suposição 15) e na § 345: na F11 e na F12 vale a recomendada (decisão 4 da ficha), menos a pose, que sem marca usa a `oops` (ficha da F12); na F13 só entra o marcado (ficha da F13: "Fora: item não escolhido"), e isso vale para as pendências.
- **d-02:** a linha do cabeçalho da seção 4 e o U-12 dizem que o idioma fica à vista a partir de 768 px e entra no Menu no celular; o UX-01 ganhou a linha de risco, e o Resumo e o `ESCOLHAS.md` a mudança de regra.
- **d-03:** a lista do Resumo "O que muda regra do design system" tem as onze mudanças (UX-01, UX-04 A, UX-06, UX-09, UX-10, UX-11 A, UX-12 A, UX-15 B, UX-16, UX-17 e UX-18 B), e o porquê de cada item do `ESCOLHAS.md` diz "muda regra".
- **d-04:** a tabela "O que muda da seção B" (README e `ad-map.html`) tem a linha do 1º da ferramenta; o UX-04, o UX-07, a § 361, a § 371 e o `ESCOLHAS.md` dizem que a F12 move o anúncio se o UX-04 A for marcado.
- **d-05:** a linha do Juntar do UX-11 A (`pdf-pieces.html`) segue o UX-04 A: sem a alça e com o lugar vazio onde a seta não anda; o teste do F5a D-11 cobre o Juntar só sem o UX-04 A, e a pendência, o README e a § 374 dizem o mesmo.
- **d-06:** o custo do UX-04 A é G (refaz o molde), com o retrabalho dos testes que existem, e o `ESCOLHAS.md` diz que ele pode ir em duas partes: a imagem entre os três primeiros da F13 e o juntar depois.
- **d-07:** o `readme.mjs` lê os ids das pendências do `PENDENCIAS.md` (grupos 5 e 6 e as 8 avulsas) e os cruza com o `pendencias-ids.json`, roda de qualquer pasta, exige o link `?theme=dark` de cada protótipo, uma caixa por alternativa (pelo menos 2) e as colunas da proposta e do que responde; a § 347, a § 349 e a § 356 dizem o que ele faz.
- **d-08:** o `ESCOLHAS.md` tem o grupo "Decisões avulsas", com caixas para a conta do `gate:prontidao`, as 37 unidades, a lateral ao lado da água, a vinheta, o texto da página de apoio, o card do café em pt, o botão da parede e o texto da home B.
- **d-09:** saíram as linhas-fantasma ("Pendências do UX-09:" e as outras, e a "nenhuma desta tarefa") e a conta é "29 dos grupos 5 e 6 (13 e 16) e 8 avulsas".
- **d-10:** o título da § 366 diz "cinco propostas e dois descartes".
- **d-11:** as screenshots dos protótipos se chamam `<protótipo>-<idioma>-<estado>-<largura>-<tema>.jpg`; o `prototipos.mjs` grava assim, o `gen-index.mjs` as acha e o `imagens.mjs` exige o padrão em `prototipos/`. As 100 foram gravadas de novo, e três estados novos do UX-04 A (a remoção com desfazer e a leitura do juntar, e o erro do HEIC) entraram a 360 no claro, pelo `.cache/f10/revisao-shots-estados.mjs` (23,75 MB de 25 no total).
- **d-12:** o UX-05 diz que o card em pt com um botão só é desvio da seção C, e os dois botões ficam como alternativa nas "Decisões avulsas".

Os scripts novos desta revisão, em `.cache/f10/`: `densidade768.mjs`, `revisao-proto-ads.mjs`, `revisao-reflow.mjs`, `revisao-ux04.mjs` e os `revisao-patch-*.mjs` de cada correção.

**A segunda passada** (sobre o diff `4d8e946..d5f8fed`) concordou com as correções e achou 1 problema médio e 9 baixos criados por elas. O agente principal corrigiu os dez:
- **N1 (médio):** no `tool-a-merge.html`, a faixa de altura fixa sumia nos estados novos de leitura e de remoção, e o conteúdo abaixo pulava 268 px, contra o "CLS 0" da especificação. Agora a faixa vale em todos os estados, e as duas capturas foram regravadas.
- **N2 e N3:** os números do rodapé no UX-17 batem com o `pages.html`: 753, 633 e 633 px (−61, −54 e −55 %), e 42 links.
- **N4:** a home B mostra 3 caixas a 1280. A lateral 2 só entra com 600 palavras ou mais (a regra do UX-07), e o protótipo a desenha para mostrar onde ela entraria.
- **N5 e N6:** a lista dos D-NN do UX-04 está certa, e os estados novos têm link.
- **N7 e N8:** o `ESCOLHAS.md` diz onde está cada mudança de regra e que, na F11 e na F12, um item sem marca aceita a mudança da recomendada.
- **N9:** o "(notas)" saiu dos G-NN e U-NN.
- **N10:** a contagem do juntar ("Lendo 2 PDFs…" e depois "2 PDFs prontos") ganhou `role="status"`.

## § 382 · A F11: o ponto de partida, a especificação e a reserva dos § (F11, decisão 1)

- **O ponto de partida** é a `origin/main` em `609a868e22f418de060bd66e110018048e03eebc` (a F10 mesclada), na branch `fase-11`. A linha de base (build, orçamentos, número de testes e a lista dos JS de `dist/_astro/`) foi medida nele e fica em `.cache/f11/antes/`, fora do Git; a cópia do `dist/` dele fica em `.cache/f11/dist-antes/`, para provar que cada teste novo reprova sem a mudança.
- **A especificação.** A área "Especificação" do `header-a.html`, do `guides-hub.html` (alternativa A, com `?ads=off`) e do `guides-entries.html` é o contrato, junto com a § 363 e a § 364. Onde ela diverge da ficha da run, vale a ficha. O site constrói sobre o `components.css` e as medidas dele, nunca sobre o `bundle.css` do `docs/design/` (as diferenças estão no bloco da F10 do `docs/claude/design-e-oli.md`), e não importa nada de `docs/propostas/`: nem o script dos previews (`?theme=`, `?lang=`, `?state=`) nem o controle do protótipo.
- **As fatias:**
  1. a documentação da F10 e os ícones, no agente principal (§ 383 e § 384);
  2. o tema, o cabeçalho e a Privacidade, num agente em worktree (§ 385 a § 392);
  3. ao mesmo tempo, o hub de guias, o GuideCard e as entradas, noutro agente em worktree (§ 393 a § 400);
  4. o merge das duas no agente principal e a conferência no Linux;
  5. o `docs/design/`, o `docs/PENDENCIAS.md` e as pegadinhas;
  6. as verificações completas, as medidas e as imagens, e depois a revisão adversarial.
- **A reserva dos §** (pegadinha da F10: um § citado antes de ser escrito prende a numeração):
  - **§ 383 e § 384:** a documentação da F10 e os ícones;
  - **§ 385 a § 392, do agente do tema e do cabeçalho:** 385 o tema (os três estados, a chave e os scripts), 386 o tema no CSS e as metas, 387 a Privacidade, 388 o cabeçalho com o Menu, 389 o mapa de cada rota para a seção do Menu, 390 o "Apoie a Oli" e o lugar `menu`, 391 onde mora cada teste novo da fatia, 392 os testes antigos que a fatia mudou;
  - **§ 393 a § 400, do agente dos guias:** 393 o hub (a rota, os grupos e o SEO), 394 a regra do `gate:conteudo` para o hub, 395 o GuideCard, 396 as entradas (a trilha, o rodapé, o cartão e as relacionadas), 397 a busca, 398 a seção da home, 399 onde mora cada teste novo da fatia, 400 os testes antigos que a fatia mudou;
  - **a partir da § 401:** os do agente principal, na ordem em que forem escritos (o merge e o CI, o `docs/design/`, as medidas e a revisão).

  Cada agente escreve só os seus números, um a um e na ordem. Uma decisão a mais entra como item de um dos seus §, nunca como § novo.

## § 383 · Os blocos da F10 no docs/claude/ e o grupo 19 do PENDENCIAS (F11, decisão 12)

- **Os cinco blocos** da seção "Para o docs/claude/" do `docs/relatorios/fase-10.md` entraram com o texto igual, cada um como seção nova no fim do arquivo de tema: "F10: proposta de UX/UI" no `design-e-oli.md`, "F10: o mapa de anúncios" no `anuncios.md`, "F10: medidas de UX" no `playwright.md`, "F10: agentes em worktree" no `windows-git-bash.md` e "F10: textos dos protótipos" no `idiomas.md`. Um script copiou cada bloco entre as cercas do relatório, para o texto não mudar nem num caractere. O `CLAUDE.md` não mudou.
- **O grupo 19 do `docs/PENDENCIAS.md`** ("O que a F10 deixou") recebeu as 20 linhas F10 p-1 a p-20, com o texto igual, no formato das seis colunas.
- **O Resumo estava atrás das tabelas em dois grupos** (a F10 p-1 achou um):
  - **o grupo 4** tem 26 linhas, e o Resumo dizia 23: as três linhas "Idiomas" (R2-05, R2-04 e g-1) entraram sem ele;
  - **o grupo 5** tem 13, e o Resumo dizia 12: a "Idiomas R2-03" entrou sem ele.

  O Resumo passou a 26 e 13, ganhou a linha do grupo 19, e o Total foi de 183 para 207 (os 187 de antes, que o Resumo dizia 183, mais os 20 da F10).
- **Um teste novo** no `tests/unit/pendencias.test.ts` conta as linhas de seis colunas de cada grupo numerado e confere a linha do Resumo e o Total. Com o `PENDENCIAS.md` de antes, ele reprova (grupos 4 e 5 e o Total).
- **No fim da run,** a F5b F-12, a F10 p-20 e a F10 p-1 vão para "Já corrigidos depois da revisão", com o § da F11 que fechou cada uma; a F10 p-5 fica só com o que sobrar para a F12; e o grupo 20 recebe o que a F11 deixar.

## § 384 · Os ícones do cabeçalho no design system (F11, decisão 4)

- **Os cinco ícones do UX-01** (`menu`, `sun`, `moon`, `theme-system` e `book`) foram de `docs/propostas/ux-v2/icons/` para `docs/design/assets/Icons/`. O desenho é o mesmo; só o `stroke` do `<svg>` raiz mudou, de `currentColor` para o `#0F1B2D` da `ICON_FILE_ROOT` de `src/icons/svg.ts`. Os arquivos da proposta ficam como estão: `docs/propostas/` é o registro da F10.
- **Os nomes entraram no `ICON_NAMES`** em ordem alfabética, e o `src/icons/icons.ts` os lê do mesmo jeito que os outros (no build, nunca numa ilha). Isso fecha a F10 p-20.
- **O `assets/Icons/README.md`** passou de 39 para 44 ícones, com uma linha "Cabeçalho" na lista.
- **O teste antigo que mudou** (no formato da § 341): o `tests/unit/icons.test.ts` fixava a contagem em 39 (`toHaveLength(39)` e o título). A ficha esperava que ele passasse sem mudar, mas a contagem é a da pasta, e a pasta ganhou os cinco: o número foi a 44, e o título diz de onde vêm os cinco. A proteção continua: a lista de `ICON_NAMES` é igual à dos arquivos da pasta, e cada arquivo começa pela `ICON_FILE_ROOT` sem cor nem `id` dentro, como antes. Os outros dois testes do arquivo não mudaram.

## § 385 · O tema: os três estados, a chave `fo-theme` e os dois scripts inline (F11, decisão 2)

- **Os três estados:** Sistema (o padrão), Claro e Escuro. O botão de tema do cabeçalho passa por eles nessa ordem, e Escuro volta a Sistema. O nome acessível diz o estado: "Theme: system", "Theme: light" e "Theme: dark" em inglês; "Tema: sistema", "Tema: claro" e "Tema: escuro" em português; "Tema: sistema", "Tema: claro" e "Tema: oscuro" em espanhol (`common.header.theme`).
- **A escolha** fica no `localStorage`, na chave `fo-theme`, com `light` ou `dark`. Sem a chave, vale Sistema, e voltar a Sistema apaga a chave. Ela não depende do aviso de cookies: é uma preferência que a pessoa pede no botão. Sistema não põe `data-theme`, então o `prefers-color-scheme` decide, como antes.
- **Os dois scripts** moram em `src/platform/theme.ts`, como funções que devolvem a string, no molde do `consentBootstrap()`: o `themeBootstrap()` e o `themeToggle()`, com a chave na constante `THEME_STORAGE_KEY`. Entram com `<script is:inline set:html>`, sem arquivo novo e sem requisição:
  - **o do `<head>`** só lê. É o da especificação, palavra por palavra, e vem depois do `charset`, do `viewport` e da `<meta name="color-scheme" content="light dark">`. O Astro põe a folha de estilo no fim do `<head>`, então ele roda antes de todo CSS, e a primeira pintura já sai no tema guardado;
  - **o do botão** vem no `Header.astro`, logo depois do `</header>`. A cada clique (Enter e espaço clicam um botão), ele põe o próximo estado no `<html>`, na meta e na chave, e escreve o nome novo na região de status.
- **Os tamanhos:** o do `<head>` tem 185 bytes (157 com gzip nível 9); o do botão, 572 (331); os dois juntos, como o orçamento os soma, 376 bytes com gzip. A especificação media 422 bytes no botão: a região de status custou 150 bytes, porque o script acha a região pelo `[data-theme-status]` e o nome pela classe do estado (`.fo-theme__state--light .fo-sr`), e não pela posição.
  - **As alternativas:** o `nextElementSibling` e o índice do rascunho da `.cache/f11/explore-d1-spec-header.md` (522 bytes), ou o `innerText` do botão. Ficaram de fora porque quebram em silêncio se a marcação mudar de ordem.
- **A região de status:** um `<span class="fo-sr" role="status" data-theme-status>`, vazio na carga (não anuncia nada ao abrir a página), logo depois do botão de tema e antes do botão Menu. Ela não pode ficar entre o botão Menu e a folha: o `:has(+ :popover-open)` exige a folha como irmã imediata do botão. O `.fo-sr` é `absolute`, então não entra no espaço do cabeçalho.
- **A ordem no `<head>`:** a meta e o script do tema vêm antes do script do consentimento.
  - **Por quê:** os dois são independentes, o do tema é o menor, e assim a meta e o script que a muda ficam juntos. O consentimento continua declarado antes de todo `config` e de todo evento (§ 9), que é o que a regra dele pede.
  - **A alternativa:** depois do consentimento, o que a especificação também aceitava.
- **O armazenamento bloqueado** (janela privada, dados do site bloqueados): a leitura e a escrita ficam em `try/catch`. A página abre em Sistema, sem erro, e o botão troca o tema só daquela página.
- **Outra aba** só muda ao recarregar, sem `storage` listener, como na especificação.
- **Nada sai do aparelho:** trocar o tema não faz requisição, não manda evento do GA4 nem mexe na URL ou no histórico. O script não toca em `fetch`, `location`, `history`, `gtag` nem no `dataLayer`, e o teste unitário confere o texto dele.
- **O service worker não muda:** ele guarda a página inteira, com os dois scripts, então a página guardada e a página offline seguem a escolha. O `header-theme-offline.spec.ts` prova, com o worker ligado e a rede desligada de verdade.

## § 386 · O tema no CSS e as metas (F11, decisão 2)

- **O par de toda regra.** O CSS do site tem só duas regras de `prefers-color-scheme`, no `global.css` (o `color-scheme` do `<html>`) e no `docs/design/tokens.css` (as variáveis de cor), e as duas já tinham o par com `data-theme`. O cabeçalho novo não acrescenta nenhuma: o botão de tema mostra um dos três estados pelo `data-theme` do `<html>` (`html:not([data-theme])`, `[data-theme="light"]` e `[data-theme="dark"]`), e as cores do Menu são todas por token.
- **O teste do par** é o `tests/unit/theme-pair.test.ts`; o `tests/unit/theme.test.ts` já existia e é do tema do Tailwind. Ele lê todo `.css` de `src/styles/` (o `theme.css`, o `fonts.css`, o `global.css` e o `components.css`) e o `docs/design/tokens.css`, e confere em cada regra dentro de `@media (prefers-color-scheme: dark)`, em qualquer `@layer` ou `@supports`:
  - a guarda `:not([data-theme="light"])` em cada seletor, para a página forçada clara num sistema escuro não pegar o valor escuro;
  - o par `[data-theme="dark"]` fora da media query, com as mesmas declarações, para a página forçada escura num sistema claro;
  - um valor claro de cada propriedade, no mesmo elemento ou em `[data-theme="light"]`.

  A regra de `prefers-color-scheme: light` segue o espelho. O controle negativo tem cinco casos: sem a guarda, sem o par, o par com outro valor, sem o valor claro, e o espelho claro. O `bundle.css` do `docs/design/` fica de fora, porque é referência e nunca import (ele também tem o par).
- **A prova no navegador:** a página forçada clara num sistema escuro fica com o fundo e o texto da página clara, e a forçada escura num sistema claro, com o fundo escuro (`header-theme.spec.ts`). O primeiro quadro de cada molde já sai no tema guardado.
- **As metas:** a `<meta name="color-scheme" content="light dark">` entra logo depois do `viewport`. O script do `<head>` troca o `content` para `light` ou `dark` quando há escolha, e o botão o troca para `light`, `dark` ou de volta para `light dark`. Antes de o CSS chegar, o fundo da aba segue a escolha; depois, quem manda é o `html { color-scheme }` do `global.css`. O `theme-color` não muda: uma meta só, `#0C2B5E`, sem `media`.
- **A linha do tema do `docs/design/README.md`** (decisão 8):
  - **antes:** "O tema escuro segue o sistema (`prefers-color-scheme`) só com CSS, sem script; `data-theme="light"` ou `"dark"` no `<html>` força um dos dois (para testes e previews)."
  - **depois:** "O tema tem três estados: Sistema (o padrão, que segue o `prefers-color-scheme` só com CSS), Claro e Escuro, escolhidos no botão de tema do cabeçalho (Header). A escolha fica no navegador, na chave `fo-theme` do `localStorage` (`light` ou `dark`; voltar a Sistema apaga a chave), e um script inline mínimo no `<head>`, depois da `<meta name="color-scheme" content="light dark">` e antes do CSS, põe `data-theme="light"` ou `"dark"` no `<html>` antes da primeira pintura; em Sistema, nenhum `data-theme`. Toda regra de `prefers-color-scheme` tem o par com `data-theme` (`tokens.css` e o CSS do site), e os testes e previews também forçam um dos dois pelo `data-theme`."

  O comentário do `tokens.css` ("data-theme ... forces either one") continua certo e não mudou, e o `MUDANCAS-v1.1.md` é histórico.
- **A § 76 continua valendo.** O axe troca o `prefers-color-scheme` no lugar, e o único tema que um script decide na carga é uma escolha guardada. Todo contexto de teste começa com o armazenamento vazio, ou seja, em Sistema, sem `data-theme`. O comentário do `tests/e2e/lib/axe.ts` diz isso agora (§ 392), e o axe com o botão nos três estados fica no `header-axe.spec.ts`.

## § 387 · A Privacidade e o tema (F11, decisão 2)

- **Onde:** nos três idiomas e com a mesma forma (o `routes.test.ts` confere que as seções da Privacidade têm o mesmo número de parágrafos e de itens em en, pt e es), em três lugares:
  - **no resumo da introdução:** "your files never leave your device, and the theme you pick in the header stays in your browser" (pt: "e o tema que você escolhe no cabeçalho fica no seu navegador"; es: "y el tema que eliges en el encabezado se queda en tu navegador");
  - **junto da escolha de cookies:** um parágrafo novo, logo depois do registro do aviso, na seção que passou a se chamar "Your cookie choice and your theme in the browser" ("Sua escolha de cookies e o seu tema no navegador", "Tu elección de cookies y tu tema en el navegador");
  - **na lista de "How long data is kept":** um item novo, "Theme choice", depois do da escolha de cookies.
- **O que o parágrafo diz:**
  - o que fica guardado: a chave `fo-theme`, com `light` ou `dark`, só quando a pessoa escolhe Claro ou Escuro; Sistema, o padrão, não guarda nada;
  - que fica no aparelho e nunca é enviado a lugar nenhum;
  - que não depende do aviso de cookies, porque é a pessoa quem pede;
  - como apagar: voltar o botão a Sistema ou limpar os dados do site no navegador.
- **A data** "Last updated" em inglês foi a 3 de novembro de 2026, o dia da mudança; em português e em espanhol ela já estava nesse dia. O `calc-defs.test.ts` fixa as três (§ 392).
- **O que não mudou:** a lista dos eventos do GA4. O "Click on a donation link" já cobre o lugar `menu` (§ 390), e o tema não manda evento. Os itens que o `gate:prontidao` pede na Privacidade continuam lá.
- **O teste:** o `tests/unit/privacy-theme.test.ts` acha, em cada idioma, a chave no resumo, o parágrafo na seção do aviso, com `light`, `dark`, os nomes dos três estados e as quatro afirmações, e um item só na lista do tempo de guarda. Com os textos de antes, os três casos reprovam.

## § 388 · O cabeçalho com o Menu (F11, decisão 3)

- **A marcação** é a da especificação (`header-a.html`), no `src/components/Header.astro`, na ordem do DOM e da tela: pular para o conteúdo (no layout), logo, busca, botão de idioma e menu de idioma, botão de tema, a região de status, botão Menu e a folha. Cada popover vem logo depois do botão que o abre, e nada fica entre o botão Menu e a folha.
  - **O Menu** é um `popover` com `popovertarget`, sem script, como o menu de idioma. A folha é `nav#fo-menu.fo-menu.fo-dogear`, com o nome "Menu" ("Menú").
  - **As linhas** são as do § 389.
  - **As props do Header não mudaram** (`lang`, `route`, `t`): o que a folha precisa sai do módulo `src/components/header-menu.ts`, e o teste que renderiza o `Header` sozinho (`pdf-site.test.ts`) continua chamando-o do mesmo jeito.
- **O CSS** foi reescrito no lugar do bloco do cabeçalho do `components.css`, sem arquivo nem token novo. Ele vem do `header.css` da proposta, com o que muda no site:
  - o `--font-text` virou `--fo-font-text`;
  - o círculo das linhas usa `--on-cat` e `--on-violeta` por um seletor `:where(.fo-cat--image, …) > .fo-menu__dot`, como o `.fo-chip__dot`, porque o `--fo-on-cat` do `bundle.css` não existe no site;
  - não entraram as regras que são só do protótipo nem as da alternativa B.
- **A face Figtree Steady** (`--fo-font-steady`) está em todo texto do cabeçalho: a busca, o "Ctrl K", o código do idioma e o "Menu".
  - **A folha** fica na `--fo-font-text`: ela abre depois da primeira pintura, e numa primeira visita com a Figtree atrasada a Steady ficaria na fonte de reserva a visita inteira.
  - **A alternativa** era redefinir `--fo-font-text` no `.fo-header`, como o `.fo-cookie` faz, o que levaria a folha para a Steady também.
  - **A medida:** a 320, 360, 390, 412, 768, 1024 e 1280 px, cada largura num contexto com a Figtree segura até a primeira pintura e depois solta, nenhum controle do cabeçalho muda de posição nem de largura, nos dois navegadores.
  - **Uma pegadinha nova:** no Chromium, um texto `optional` que estava em `display: none` na primeira pintura (o idioma a 320 px) e aparece depois de a fonte chegar já sai na Figtree. Uma página aberta a 320 px e alargada até 768 px antes de a fonte chegar ainda vê o idioma mudar 2 px; numa largura fixa, nada muda.
- **A partir de 1280 px, uma regra só para toda página.**
  - **A regra:** o `padding` do cabeçalho põe o logo onde começa a coluna da ferramenta (x 36) e o último botão onde ela termina (x 794), a 150 px da lateral (x 944).
  - **Nas páginas sem lateral** (a home, os hubs de guias, as institucionais e as jurídicas), o último botão termina também em x 794, 2 px antes do fim da coluna de 760 px delas: o cabeçalho é o mesmo em toda página e não pula quando se passa de uma para outra.
  - **A alternativa,** proposta na nota d1 (seção 0, item 6), era uma classe por página com lateral (uma prop do `Header` ou um `body:has(.fo-frame--rail)`) e o cabeçalho na largura da moldura inteira nas outras. Ela pede uma prop ou um `:has` no `body`, e o cabeçalho mudaria de lugar entre as páginas.
- **Os dois popovers** são `position: absolute`, com o anchor positioning (o `position-anchor` no botão) e a reserva `top: 68px` (64 + `--space-1`) onde ele não existe.
  - **O menu de idioma** passou de `fixed` para `absolute`, e a reserva dele foi de 64 para 68 px, como a do Menu (§ 363).
  - **Na reserva a partir de 1280 px,** os dois terminam na borda direita do cabeçalho (x 794), e não a 16 px da janela. A especificação não tratava o menu de idioma sem anchor.
  - **Abrir um fecha o outro:** são dois `popover` automáticos.
- **Os idiomas no Menu numa linha de três, abaixo de 768 px.** É um desvio da especificação, que punha um idioma por linha, com o ícone `check`.
  - **Por quê:** a 360 px, a folha em inglês (a mais alta, com casa e saúde) terminava em y 729,5. O primeiro AdSlot do Merge PDF e do Unlock PDF fica em y 796 nos três idiomas (67 px da folha), e o do PNG to JPG e do Delete PDF pages, em y 852 (123 px). A especificação contava com o primeiro anúncio de cada molde em y 880 ou mais, mas mediu só os moldes de imagem.
  - **O resultado:** com os três idiomas lado a lado, em alvos de 48 px, a folha termina em y 629,5 em inglês e 521,5 em português e espanhol. Todo AdSlot das 178 páginas com anúncio fica a 166,5 px ou mais, e o `ads.spec.ts` confere toda página, a 360 e a 1280 px.
  - **O idioma em uso** guarda o fundo `brand-soft`, o traço de 2 px e o peso 700, que marca também com cores forçadas, além do `aria-current`. O `check` saiu, porque não cabe na linha: "Português" tem 74,6 px, e cada alvo, 88 px a 320 px.
  - **As alternativas:**
    - linhas de 48 px, sem espaço entre elas e com o rótulo "Language" escondido: a folha em inglês ainda terminava em y 641,5, a 154,5 px, e no limite;
    - uma altura máxima com rolagem dentro da folha: a dobra sai da caixa, e o idioma ficaria escondido;
    - descer o AdSlot da ferramenta de PDF: mexe no mapa de anúncios, fora da F11;
    - as categorias em duas colunas: os nomes quebram de linha.
- **As medidas** (Chromium e WebKit, `header-menu.spec.ts`, linhas `[header]`):
  - 64 px e uma linha em toda largura de 320 a 1280 px, nos três idiomas, com a Figtree segura e solta;
  - a 320 px, logo, busca, tema e Menu ocupam 282,5 de 288 px (sobram 5,5), e a 360 px, 294,5 de 328;
  - a 768 px, com o idioma e o texto "Menu", ocupam 608,2 px em en, 654,5 em pt e 663,0 em es, de 736, no Chromium (612,6, 659,0 e 667,5 no WebKit);
  - a 1280 px, o logo fica em x 36 e o último botão termina em x 794, na coluna. A lateral começa em x 944, e a folha aberta vai de x 434 a 794, com 481 px de altura em en e 373 em pt e es.
  - Todo controle tem 48 × 48 px; as linhas da folha, 52 px; os idiomas, 48.
- **A F10 p-5.**
  - **O que a grade resolve:** a 1280 px, a lateral começa em y 84 e em x 944, e o último botão termina em x 794. Um controle do cabeçalho fica a 150 px dela na horizontal (o `ads.spec.ts` mede 150 e mais). O menu de idioma e o Menu, `absolute`, terminam em x 794 ou antes.
  - **O que sobra:** o `padding-top` de 150 px na lateral deixa de ser preciso para a regra dos 150 px. Da F10 p-5 não sobra nada obrigatório para a F12, que decide se ainda quer a lateral mais baixa no mapa novo (UX-07).
- **O README do Header** (decisão 8), cada regra com o antes e o depois:
  - **a descrição:** antes, "O cabeçalho fino: logo, busca de ferramentas e idioma. Nada mais."; depois, "O cabeçalho: logo, busca de ferramentas, idioma (a partir de 768px), tema e Menu, nessa ordem no DOM e na tela. Cada menu vem logo depois do botão que o abre.";
  - **a altura:** antes, "64px de altura, fundo `bg`, divisor `hairline` embaixo. Não gruda ao rolar…"; depois, a mesma regra com "64px de altura e uma linha só em toda largura, de 320 a 1280px, nos três idiomas, antes e depois da fonte", mais a face Figtree Steady em todo texto do cabeçalho;
  - **o idioma:** antes, ele levava para a página equivalente ou "para o hub do idioma"; depois, "para a home do idioma", que é a regra do código, e, abaixo de 768px, ele fica no fim do Menu, em três alvos lado a lado;
  - **o tema e o Menu:** não existiam; agora há uma regra para o botão de tema (os três estados, o nome pelo CSS, a região de status e a chave), uma para o Menu (o `popover`, a folha com a dobra, as linhas, o `aria-current` e o peso, o Esc e o foco), uma para os dois menus `absolute` com o anchor e a reserva de 68px, uma para a grade a partir de 1280px e uma para os 150px de todo controle e menu aberto;
  - **os alvos:** antes, "Logo, busca e idioma têm alvo de `tap-min` (48px)."; depois, "Logo, busca, idioma, tema e Menu têm alvo de `tap-min` (48px); as linhas da folha têm 52px, e os idiomas, 48px.";
  - **o menu:** antes, "Sem menu hambúrguer: as categorias ficam na home e nos hubs."; depois, a regra saiu, e o Menu tomou o lugar dela.

  O `preview.html` mostra o cabeçalho do computador e o do celular, o botão de tema que passa pelos três estados e a folha aberta nas duas larguras. A região do Header no `bundle.css` traz as regras novas, com `box-sizing: border-box`, porque o `bundle.css` não tem o preflight do site.

## § 389 · O mapa de cada rota para a seção do Menu e o `aria-current` (F11, decisão 3)

- **Onde mora:** em `src/components/header-menu.ts`, que roda no Node, sem `import.meta.glob`. Ele tem as seções (`MENU_SECTIONS`, na ordem da folha), a página de cada seção por idioma (`sectionPage`), as páginas de cada seção, as páginas sem seção (`NO_SECTION`), a contagem (`sectionCount`), as linhas de um idioma (`menuGroups`) e os links de idioma (`languageLinks`, a regra do menu de idioma de antes, só mudada de lugar).
- **O mapa:**
  - **Imagem:** o hub `image-tools` é a página da seção ("page"), e as 8 ferramentas e os 3 presets marcam "true";
  - **PDF:** o hub `pdf-tools` ("page") e as 12 ferramentas ("true");
  - **Dinheiro:** os dois hubs ("page"), o `money-calculators` (en e es) e o `br-money-calculators` (pt), e as 14 calculadoras, os 4 presets e as 8 calculadoras do Brasil ("true");
  - **Casa e Saúde:** o `home-calculators` e o `health-calculators` ("page"), e as 6 e as 5 calculadoras de cada um ("true");
  - **QR code:** o `qr-code-generator` ("page");
  - **Guias:** o hub `guides` ("page"), e os 10 guias de arquivo e os 5 de dinheiro ("true"). Um guia marca Guias, e não a categoria da ferramenta que ele embute ou da calculadora que ele explica, como a especificação pede;
  - **Apoie a Oli:** a página `support` ("page");
  - **Sem seção:** a home, a Privacidade, os Termos, o Sobre, o Contato, as Licenças, a página offline, a "Abrir com" e a 404.

  O `header-menu.test.ts` confere que toda rota do `ROUTES` está numa seção só ou na lista sem seção, com os hubs em "page".
- **O `aria-current`:** "page" na própria página da seção e "true" numa página dela. A linha que não é a da página fica sem o atributo: o Astro escreveria `aria-current="false"` para um `false`, e o seletor `[aria-current]` o pegaria. O mesmo vale para o idioma em uso no fim da folha ("true").
- **As linhas de cada idioma:** só as seções cuja página existe nele (`pagePath`). Em inglês são oito; em português e espanhol, seis, sem Casa e Saúde, e a linha de Dinheiro leva ao hub do Brasil em português.
- **A contagem de cada linha**, sempre dos registros:
  - **Imagem:** `IMAGE_TOOL_IDS` com página no idioma, 8, as ferramentas da grade do hub (os presets ficam na tabela dele);
  - **PDF:** `PDF_TOOL_IDS`, 12;
  - **Dinheiro:** `HUB_MONEY_IDS[lang].length`, 14 em en e es e 8 em pt, os cartões do hub. A tabela da especificação dizia 18 em en e es, porque contou também os 4 presets, o que nenhum hub mostra como cartão;
  - **Casa:** `HOUSE_CALC_IDS`, 6; **Saúde:** `HEALTH_CALC_IDS`, 5;
  - **Guias:** `hubGuides(lang).length`, 15, 10 e 15 (o `src/tools/guides/hub.ts` do hub de guias).

  O número sai com o `groupDigits` do idioma, nos textos `common.header.menuTools`, `menuCalculators` e `menuGuides` ("{n} tools", "{n} ferramentas", "{n} herramientas"…). O QR code diz os formatos ("PNG or SVG"), e o Apoie a Oli diz como apoiar ("Ko-fi"; "Ko-fi ou Pix" em português).
- **Os nomes** são os que o site já tem (`imageTools`, `pdfTools`, `moneyCalculators`, `homeCalculators`, `healthCalculators`, `qr.name` e o `guidesHub` do hub de guias). Os textos novos do cabeçalho ficam no bloco `header` dos três `common.ts`: `menu`, `theme`, `menuLanguage`, `menuTools`, `menuCalculators`, `menuGuides`, `menuQr`, `support` e `supportMeta`.
- **Os ícones** são os do design system: `image`, `pdf`, `calculator`, `home`, `heart`, `qr`, `book` e `coffee`, com o círculo na cor da categoria (`fo-cat--image`, `--pdf`, `--money`, `--home` e `--util`) e o `brand-soft` em Guias e no Apoie a Oli.

## § 390 · O "Apoie a Oli" no Menu e o lugar `menu` (F11, decisão 3)

- **A linha:** "Support Oli", "Apoie a Oli" e "Apoya a Oli", com o ícone `coffee` no círculo `brand-soft` e a linha de baixo "Ko-fi" ("Ko-fi ou Pix" em português). Ela leva à página de apoio do idioma (`/support/`, `/pt/apoie/`, `/es/apoyo/`) e leva `data-track="donate_click"` e `data-track-place="menu"`.
- **O evento:** o script que o `BaseLayout` já tinha (o `[data-track]` delegado) manda `donate_click` com `{ lang, place: 'menu' }`. Nada de script novo.
- **A lista fechada:** o `menu` entrou no fim de `DONATE_PLACES` (`src/analytics/events.ts`), e com ele o tipo `DonatePlace` e o `CLOSED_VALUES.place` do `cleanParams`, que lê a mesma lista. O `foTrack` do navegador filtra só os nomes dos parâmetros, e o `EVENT_PARAMS` não mudou.
- **A Privacidade** não mudou por isso: o "Click on a donation link" já cobre o lugar novo.
- **Os testes:**
  - o `events.spec.ts` clica a linha a 360 px em espanhol (`/es/unir-pdf/`) e a 1280 px em inglês (`/guides/`) e espera `['event', 'donate_click', { lang, place: 'menu' }]`;
  - o `pix.test.ts` fixa a lista nova e o `cleanParams` com `menu` e com um lugar fora da lista (§ 392).
- **O café** fica como está: o card, os textos novos, a linha do rodapé e a página de apoio são da F12.

## § 391 · Onde mora cada teste novo do cabeçalho e do tema (F11, decisão 10)

- **No Vitest** (roda em todo push, no job `leve`):
  - `tests/unit/theme-script.test.ts`: os dois scripts num contexto próprio (`runInNewContext`), como o `consent.test.ts`. Confere a leitura, a escrita, a remoção da chave, o armazenamento bloqueado, a página sem meta, sem botão ou sem região, nada mandado e nenhum `storage` listener, e os tamanhos (376 bytes com gzip, abaixo de 512);
  - `tests/unit/theme-pair.test.ts`: o par de toda regra de `prefers-color-scheme` (§ 386), com o controle negativo;
  - `tests/unit/header-menu.test.ts`: o mapa de cada rota (§ 389), as contagens pelos registros, as linhas de cada idioma, os links de idioma e o `Header` renderizado (a ordem dos filhos, os nomes, o evento do Apoie a Oli e o script logo depois do `</header>`);
  - `tests/unit/privacy-theme.test.ts`: a Privacidade nos três idiomas (§ 387).
- **No Playwright,** com nomes `header-*`, que ordenam entre o `events.spec.ts` e o `i18n-budgets.spec.ts` e caem nas partes leves:
  - `header-axe.spec.ts`: o axe com o Menu aberto e o botão nos três estados, nos dois temas;
  - `header-links.spec.ts`: o HTML de toda página pelo `request`, em blocos de 24, com o Menu e a ordem do `<head>`;
  - `header-menu.spec.ts`: o Menu numa página por molde e idioma a 320, 360 e 1280 px; a altura e as medidas a sete larguras com a Figtree segura e solta; os dois menus que se fecham; e o peso com cores forçadas;
  - `header-theme-offline.spec.ts`: o tema offline, com o worker;
  - `header-theme.spec.ts`: o primeiro quadro em cada molde, a escolha entre páginas e idiomas, Sistema, os nomes, o armazenamento bloqueado e nada mandado.

  As partes de cada um estão na tabela de baixo.
- **Nos specs que já existiam:**
  - `tests/e2e/ads.spec.ts`: um bloco próprio, no meio do arquivo e longe do bloco do `.fo-guide-links` que o G2 troca. Ele mede o cabeçalho e os dois menus abertos contra todo AdSlot das 178 páginas com área de anúncio, a 360 e a 1280 px, em 12 blocos de 15 páginas, com o `expectClearance` do arquivo;
  - `tests/e2e/events.spec.ts`: o `donate_click` com o lugar `menu` (§ 390);
  - `tests/unit/contrast.test.ts`: o par novo `stroke` sobre `brand-soft` (uso `ui`, 3,20:1 no escuro). O resto dos pares do Menu já estava na lista.
- **O apoio comum:** o `tests/e2e/lib/header.ts` tem as páginas de cada molde, o que a folha deve listar e para onde leva cada idioma, tirados do mapa de rotas e não do módulo que monta a folha, e a cor do fundo de cada tema, tirada do `tokens.json`.
- **Cada teste novo reprova sem a mudança.** As provas são contra o `dist/` do ponto de partida (`.cache/f11/dist-antes`, servido na porta 4184) e estão no relatório do agente. O `theme-pair.test.ts` passa com o CSS de antes, que já tinha o par: a prova dele é o controle negativo e uma cópia do `global.css` sem a guarda, com que ele reprova.
- **As partes do CI.** O `--list` de cada parte (`--project=chromium --shard=i/5` e `--project=webkit --shard=i/13`), com os specs novos, no commit do agente T, antes do merge com o G2:

  | Spec | Testes por navegador | Chromium | WebKit |
  | --- | --- | --- | --- |
  | `header-axe.spec.ts` | 13 | 3 | 7 |
  | `header-links.spec.ts` | 9 | 3 | 7 |
  | `header-menu.spec.ts` | 49 | 3 | 7 |
  | `header-theme-offline.spec.ts` | 1 | 3 | 7 |
  | `header-theme.spec.ts` | 14 | 3 | 7 |
  | `ads.spec.ts`, o bloco do cabeçalho | 12 | 1 e 2 | 3 e 4 |
  | `events.spec.ts`, o Apoie a Oli | 1 | 3 | 7 |

  O `design.spec.ts` e o `image-matrix.spec.ts` continuam em partes diferentes: Chromium 3 e 4, WebKit 6 e 7 contra 9 e 10. O `--list` foi de 1.428 testes por navegador no ponto de partida a 1.431 com o hub do G1 (o `a11y.spec.ts` lê o `ROUTES`) e a 1.530 com os 99 desta fatia. A parte 7 do WebKit, a mais leve na F9 (128 s), recebe quase todos os specs novos; a do Chromium é a 3 (217 s na F9). Os specs `guides-*` do G2 ordenam antes dos `header-*` e empurram as fronteiras, então o `--list` se refaz depois do merge.

## § 392 · Os testes antigos que o cabeçalho e o tema mudaram (F11, no formato da § 341)

A ficha manda mudar um teste que fixa o cabeçalho, o tema ou a Privacidade de antes junto com o que ele protege, e mostrar que a proteção continua.

- **`tests/unit/pdf-site.test.ts`,** dois testes.
  - **O primeiro** ("has the reciprocal hreflang cluster…") fixava `a[hreflang]` da página inteira igual aos três pares do menu de idioma. Com os idiomas no fim do Menu, a página tem seis. Agora fixa:
    - os três pares no `.fo-langmenu`;
    - os mesmos três pares no `.fo-menu__lang`;
    - seis `a[hreflang]` na página, nenhum fora dos dois menus.
  - **O segundo** ("keeps § 84…") lia `a[hreflang]` do `Header` sozinho. Agora lê o menu de idioma e confere que a lista do Menu é igual a ela.

  Os dois pares da § 84 continuam: a página só em inglês leva às homes dos outros idiomas, e o guia de PDF leva ao mesmo guia. O `Header` é chamado com as mesmas props.
- **`tests/unit/pix.test.ts`.** Fixava `DONATE_PLACES` igual a `['result', 'footer', 'support_page', 'pix']`. Agora fixa a lista com `menu` no fim e confere que o `cleanParams` guarda `menu` e descarta um lugar fora da lista (`header`). As asserções do `pix` e do `pix-copia-e-cola` continuam iguais.
- **`tests/unit/calc-defs.test.ts`** ("the privacy policy names the Oli's session mark…"). Fixava a data "Last updated: November 2, 2026" da Privacidade em inglês. Agora fixa "November 3, 2026", o dia em que a página ganhou a chave do tema (§ 387). As datas de pt e es e a asserção do armazenamento da sessão continuam iguais.
- **`tests/e2e/lib/axe.ts`.** Só o comentário mudou. Ele dizia que o site não decide tema por script na carga; agora diz que o único tema decidido na carga é uma escolha guardada, que todo contexto de teste começa sem ela e que o botão de tema fica no `header-axe.spec.ts`. As combinações, as regras e o código não mudaram.
- **Só acrescentados,** sem nenhuma asserção mudada: o bloco do cabeçalho no `ads.spec.ts`, o teste do Apoie a Oli no `events.spec.ts` e o par `stroke` sobre `brand-soft` no `contrast.test.ts`.
- **Os que passaram sem mudar,** rodados nos dois navegadores:
  - `navigation.spec.ts`: o botão de idioma continua a partir de 768 px, com o nome começando pelo código, e o idioma do Menu fica escondido a 1280 px;
  - `cookie-footer.spec.ts` e `a11y.spec.ts`: o tema trocado no lugar, em Sistema;
  - `layout-shift.spec.ts`: a trilha e o H1 parados com a Figtree atrasada, e o cabeçalho com a mesma altura;
  - `design.spec.ts`;
  - `english-leak.test.ts` e `image-hub.test.ts`: os links do Menu são todos do idioma, e os de idioma levam `hreflang`.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite ou tempo mudou.** O Vitest foi de 103 arquivos e 1.766 testes (o commit do hub, `0e8f8ea`) para 107 arquivos e 1.796 testes. O `--list` do Playwright foi de 1.431 para 1.530 testes por navegador; no ponto de partida eram 1.428.

## § 393 · O hub de guias: a rota, os grupos, os textos e o SEO (F11, decisão 5)

O hub nasceu no agente G1 (a rota, as três páginas, os textos e o SEO) e ganhou os cartões no agente G2. As decisões que a ficha não fixou:

- **O id da rota é `'guides'`,** na constante `GUIDES_HUB_ID` de `src/tools/guides/registry.ts`, como o `PDF_HUB_ID` mora em `pdf/registry.ts`. As alternativas eram `'guides-hub'`, que colide com o prefixo `guides-` de todo id de guia (os `replace(/^guides-/)` e os `startsWith`), e um literal em `routes.ts`. O `'guides'`, sem hífen, nunca é lido como guia, e a especificação já usa `pathFor('guides', lang)`. Os caminhos: `/guides/`, `/pt/guias/` e `/es/guias/`; indexável, sem `adArea`.
- **A posição em `ROUTES`:** logo antes de `...fileGuideRoutes()`, depois das ferramentas de PDF e antes dos guias de arquivo, pela convenção do arquivo de o hub vir antes das próprias páginas (o de dinheiro, o de PDF, os de casa e saúde). As alternativas eram depois dos guias ou dentro de `fileGuideRoutes()`, o que pediria renomear a função. No `PAGES`, o hub fica nas posições 136 a 138.
- **Os textos do hub** ficam em `src/i18n/<lang>/guides.ts`, com a chave `TEXTS[lang].guides` e o tipo `GuidesHubTexts`, pela convenção arquivo = chave = id da rota (`image-tools.ts`, `pdf-tools.ts`, `money-calculators.ts`). O nome não casa com o glob `guide-*.ts` dos textos de cada guia. O `common.guidesHub` ("Guides", "Guias", "Guías") é o segundo passo da trilha do hub e dos 40 guias, o título do bloco Guias do rodapé e o nome que o Menu do cabeçalho pode usar.
- **Os textos são os da especificação,** palavra por palavra, com uma exceção: na nota de pt, "hipoteca" virou "financiamento imobiliário", porque o `glossary.test.ts` reprova "hipoteca" (`docs/i18n/pt.md`, tabela "Nunca": no Brasil, hipoteca é a garantia, não o crédito).
- **A contagem** da descrição e da frase da faixa é `{n}`, preenchido com `groupDigits(hubGuides(lang).length, lang)`: 15, 10 e 15, lidos do registro, nenhum algarismo à mão.
- **Os dados:** `src/tools/guides/hub.ts` (`HUB_GROUPS`, `hubGuides(lang)` e `hubGroup(group, lang)`) roda no Node, sem `import.meta.glob`: os guias de arquivo na ordem de `FILE_GUIDE_IDS`, no grupo do hub de cada um; os de dinheiro na ordem de `GUIDE_IDS`, só onde o idioma tem a página. O `gate:conteudo` e o rodapé leem dali.
- **A marcação:** a trilha Início › Guias; a faixa `.fo-hubband.fo-cat--guide` com o sobretítulo, o H1 e a frase; `nav.fo-jump[aria-label]` com três `a.fo-chip` (ícones `image`, `pdf` e `calculator`); uma `section.fo-section#<grupo>[aria-labelledby]` com H2 por grupo, cada guia um GuideCard com H3 numa `ul.fo-guidecards` (§ 395); em pt, o grupo Dinheiro é só a `p.fo-section__note` com o link para `/pt/calculadoras-financeiras/`; no fim, `section.fo-section.fo-prose#how`. A frase da faixa, a nota e o texto do fim levam `data-hub-text`, que o `gate:conteudo` conta (§ 394). A view lança erro no build se um grupo ficar vazio sem nota. Sem Oli, sem AdSlot, sem lateral, sem ilha e sem script próprio.
- **O CSS** vai no fim do `components.css`: `.fo-cat--guide { --fo-cat-soft: var(--brand-soft) }`, `.fo-jump ul` e `.fo-section__note`, mais o bloco do GuideCard (§ 395). Nenhum token novo.
- **A imagem OG** de cada idioma é `/og/<lang>/guides.png` (1200 × 630): o H1 do idioma com o `common.seal`, e o ícone `book` (o mesmo dos Guias no Menu) num ladrilho `brand-soft`, uma categoria nova `guide` no `TILE` de `src/seo/images.ts` com o valor do token claro (`#E3EEFE`, que já está no `tokens.css`). As alternativas eram sem ladrilho, como a home, ou a cor de uma categoria; o hub não tem cor própria, e o tom dele é o `brand-soft`.
- **O schema:** `Organization`, `BreadcrumbList` (Início › Guias, posições 1 e 2) e `CollectionPage` com `name` = H1, a descrição, a URL, o idioma, o `publisher` e um `ItemList` com `numberOfItems` de 15, 10 ou 15 e um `ListItem` por guia, na ordem da página. Sem `Person`, como o hub de PDF. Em `scripts/lib/seo-pages.ts`, o `requiredSchemaTypes('guides')` é `['Organization', 'BreadcrumbList', 'CollectionPage']`, o `schemaProblems` confere o hub e o `SITEMAP_REGISTRY_IDS` ganhou `'guides'`.
- **Os comprimentos,** com " | FileOrca" nos títulos: títulos de 67, 57 e 64 caracteres; descrições de 129, 107 e 132 (en, pt, es), na faixa de 50 a 170. O hub não entra na faixa de 120 a 160 das páginas traduzidas de imagem e PDF: a descrição em pt reprovaria. O texto próprio soma en 91, pt 108 e es 97 palavras (o `gate:conteudo` imprime). O HTML tem 56,0 KB em en, 48,2 KB em pt e 56,5 KB em es, sem compressão; a especificação estimava uns 45 KB, e a diferença são os ícones dos 15 cartões, inline como em toda página.
- **A primeira visita sem pulo.** Com a fonte de reserva, a frase da faixa tomava uma linha a mais a 412 px (en) e os atalhos, duas linhas a 393 px (pt): quando a Figtree chegava, os cartões subiam de 26 a 56 px (CLS de até 0,108 no Chromium, no `layout-shift.spec.ts`). A faixa e os atalhos do hub passaram à face `Figtree Steady` (`--fo-font-steady`), como a trilha (§ 305), e ficam com a fonte da primeira pintura: o CLS do hub caiu para 0,004 no máximo. Só o hub de guias muda; as faixas dos hubs de categoria ficam como estão.
- **O `gate:links`:** o hub nasceu órfão, porque nenhuma página de outra rota ligava a ele. A primeira entrada da decisão 7 resolveu: a trilha dos 40 guias passou a Início › Guias › o guia (§ 396). Depois, o rodapé de toda página e a home também levam a ele.

## § 394 · A regra do gate:conteudo para o hub de guias (F11, decisão 5)

- **A regra 7 do portão** (`checkGuidesHub` em `scripts/lib/conteudo.ts`), no molde da do hub de PDF (§ 162), confere o hub de cada idioma da rota:
  - um H1;
  - um título que começa por "Guides", "Guias" ou "Guías" (`GUIDES_HUB_TITLE`) e uma meta description;
  - a introdução própria na faixa: um bloco `data-hub-text` dentro da `.fo-hubband`, com texto;
  - o texto próprio, somado nos blocos `data-hub-text` (a frase da faixa, a nota de um grupo sem guia e "Como os guias são feitos"), entre 60 e 120 palavras (`GUIDES_HUB_WORDS`);
  - um `main a.fo-guidecard` para cada guia que os registros dão ao idioma (`hubGuides`), nenhum outro e nenhum repetido;
  - nenhum `a.fo-tool` no hub: um guia nunca aparece como ferramenta;
  - as três seções dos grupos, com os ids das âncoras (`#image`, `#pdf`, `#money`), cada uma com cartões ou com a nota que diz por que não tem;
  - nenhuma afirmação sem medida (`findClaims`, nas palavras do idioma).
- **Por que 60 a 120 palavras.** É a proposta da especificação. O mínimo de 60 é o do `gate:prontidao` para uma página sem anúncio (§ 95). O máximo de 120 guarda o topo curto, que é o que deixa o primeiro cartão acima da dobra a 360 × 740 (§ 364: um parágrafo de 60 a 75 palavras no topo empurrava o cartão para baixo). O hub de hoje dá en 91, pt 108 e es 97. As palavras dos cartões não contam: são o texto dos guias, não o do hub.
- **A linha do resumo** do portão ganhou "; N do hub de guias" no fim, depois de "página(s) do site conferida(s)". No meio da linha, as duas regex do `tests/unit/conteudo.test.ts` que a leem teriam de mudar. O portão também imprime as palavras próprias de cada hub, como já faz com as dos guias de arquivo.
- **Os controles negativos** (`tests/unit/conteudo.test.ts`, "portão de conteúdo: o hub de guias (F11)"): uma fábrica `guidesHubPage()` monta o hub com os textos reais e os caminhos dos registros, e cada teste quebra uma regra (sem H1 e com dois, o título sem o nome do hub e o inglês no hub em pt, sem descrição, sem introdução, 52 e 121 palavras, 120 passando, faltando um cartão, um cartão fora do registro, um repetido, um ToolCard, um guia de dinheiro no hub em pt, sem a seção de um grupo, um grupo sem cartão nem nota, a nota de pt tirada, a afirmação em inglês e em espanhol). Um teste roda o portão sobre o site falso: verde com os três hubs, vermelho com um cartão a menos em pt e com o texto curto em es, e "a página não existe no dist" sem o hub em pt.

## § 395 · O GuideCard (F11, decisão 6)

- **O componente** é `src/components/GuideCard.astro`, com as props da especificação: `href`, `name`, `description`, `category` (o grupo do guia: `image`, `pdf` ou `money`, a cor da dobra), `proof` (a medida já escrita no idioma), `tool` opcional (`{ name, icon, category }`, a categoria da ferramenta, que pode não ser a do grupo: Image to PDF é coral num guia de imagem) e `headingLevel`. Mais uma, `lang` (padrão `'en'`, como os moldes): o componente lê no idioma o "Guide" e o "Tool in the guide".
- **A variante `--here` é o cartão sem `headingLevel`:** sem título (o nome e a descrição são `span`, então o `.fo-prose p` do bloco "How to" não lhes dá margem) e sem pé. A alternativa era uma prop `variant`; ficou de fora porque a especificação define o `--here` justamente por "sem H3 e sem o pé", e a lista de props da ficha não tem outra.
- **Um link só,** com a classe `fo-guidecard` e nunca `fo-tool` (o `gate:prontidao` e o `gate:conteudo` contam `main a.fo-tool` na home e nos hubs). O nome acessível é o texto do link, na ordem: "Guide", o nome, a descrição, a medida e, no cartão completo, "Tool in the guide" e a ferramenta. Entre as partes vai um espaço (`{' '}`): elas são itens de grade, o espaço não aparece na tela, e o texto do link fica "Guide How to convert…" e não "GuideHow to convert…" em qualquer leitor. Os ícones (`file`, `table` e o da ferramenta) são `aria-hidden`.
- **A medida.** Num guia de arquivo, "Measured on N test files" ("Medido em N arquivos de teste", "Medida con N archivos de prueba"), com o N escrito por `groupDigits` no idioma. O N é o número de arquivos distintos de todas as `sample.files` do guia em `data/guides-measured.json`, numa varredura de qualquer profundidade (`measuredFiles` em `src/tools/guides/card.ts`): 10, 10, 3, 5, 4, 13, 5, 5, 7 e 3, na ordem de `FILE_GUIDE_IDS`, os mesmos que a especificação contou à mão. Num guia de dinheiro, "Numbers worked out" ("Números calculados"); pt não tem guia de dinheiro, e a chave é opcional lá.
- **Os dados do cartão** saem de `guideCardData(id, lang)` (`src/tools/guides/card.ts`), que lê o cartão do guia (`common.fileGuides` e `common.guides`), o grupo, a medida e a ferramenta (o cartão da ferramenta de imagem ou de PDF, ou o da calculadora). O módulo roda no Node e no build, nunca numa ilha: o JSON tem 471 KB.
- **Os textos do cartão** ficam em `TEXTS[lang].guides.card` (`kind`, `measured`, `workedOut` e `tool`, tipo `GuideCardTexts`), nos arquivos `guides.ts` do hub. As alternativas eram o `common.ts`, que o agente do cabeçalho edita ao mesmo tempo (conflito no merge), e um arquivo novo `guide-card.ts`, que o glob `guide-*.ts` dos textos de cada guia leria como um guia.
- **O nome antigo.** A interface `GuideCard` de `src/tools/guides/page.ts` (os dados do ToolCard de um guia nas relacionadas) virou `RelatedCard`, a união de `RelatedToolCard` e `RelatedGuideCard` com o campo `kind`, e a função `guideCard()` saiu (§ 396).
- **O CSS** é o da seção 3 do `guides.css` da proposta, no fim do `components.css` num bloco "F11: guides", com `var(--fo-font-text)` no lugar do `var(--font-text)` do `bundle.css`. Acrescenta o `.fo-guidehere` (o invólucro do `--here`: uma coluna, 16 px acima e entre dois cartões; a grade `.fo-guidecards` poria os dois lado a lado) e o hover sem movimento com `prefers-reduced-motion`, no mesmo bloco, para não tocar na linha do `global.css` que o agente do tema pode editar. Movimento só por `transform`; cor só de tokens de texto (`ink`, `ink-muted` e `brand`).
- **O contraste.** Nenhum token novo. Os pares que o cartão e o hub põem na tela já estavam no `tests/unit/contrast.test.ts`; um teste novo lê as regras `.fo-guidecard` do `components.css` e confere que cada cor delas tem o seu par sobre `surface`, e que os três pares novos do UX-02 têm os valores do README da proposta: `ink` sobre `brand-soft` 14,76 e 11,99; `ink-muted` sobre `brand-soft` 5,98 e 6,17; `brand` sobre `surface` 5,09 e 6,11 (claro e escuro).
- **O `docs/design/`.** O `components/GuideCard/README.md` e o `preview.html` (no formato do ToolCard, com o hub, um PDF, um de dinheiro e o `--here`) são novos. No `components/README.md`, a frase "Para ver todos os previews juntos, abra `../index.html`." passou a "Para ver todos os previews juntos, abra `../index.html`. A F11 acrescentou o GuideCard, o 28º componente (DECISOES § 395); o `../index.html` e a conferência abaixo são de antes dele.", e a tabela ganhou a linha do GuideCard depois do ToolCard. O `bundle.css` ganhou o bloco "GuideCard (F11)" no fim. O `../index.html` e a "Conferência" de 29/out (o axe dos 28 blocos) ficam como estavam: o `pnpm design:gerar` e as capturas ficam fora desta run.

## § 396 · As entradas dos guias: a trilha, o rodapé, o cartão na ferramenta e as relacionadas (F11, decisão 7)

- **A trilha** dos 40 guias (15 en, 10 pt, 15 es) é Início › Guias › o guia, no HTML e no `BreadcrumbList`, com o hub na posição 2: o `crumbsFor` de `src/tools/guides/page.ts` (guias de arquivo) e as `crumbs` de `src/views/GuideView.astro` (guias de dinheiro, que levavam ao hub de dinheiro). Feito pelo G1; o teste lê as 40 páginas no `dist/` (`tests/unit/guides-hub-route.test.ts`).
- **O rodapé.** O bloco Guias fica embaixo de Utilidades, na mesma coluna (`div.fo-footer__more`, 24 px acima): uma 8ª coluna não cabe a 1280 px. O título é o `common.guidesHub`; os links são "All guides" ("Todos os guias", "Todas las guías", a chave nova `common.footer.guidesAll`) para o hub e os grupos que têm guia no idioma, com o H2 de cada grupo no hub ("Image guides" etc.) e as âncoras `#image`, `#pdf` e `#money`. Em pt são o hub, imagem e PDF. No hub, o "All guides" leva `aria-current="page"`: o `BaseLayout` passa a rota ao `Footer` por uma prop nova, `current` (a alternativa era o `Astro.url`, menos explícito).
- **A ferramenta e a calculadora que têm guia.** O GuideCard `--here` fecha o bloco "How to" (`section[data-content="how"]`), o primeiro bloco depois do painel, depois dos passos, dentro do `.fo-guidehere`; com dois guias (Resize image), dois cartões, um embaixo do outro. Na calculadora, o primeiro bloco depois do painel é o cronograma, que não recebe nada; o cartão vai para o fim do "How to", logo depois dele, e o link saiu do bloco "how it works". Os guias vêm de `guidesOfTool` (ferramentas) e de `CALC_PAGES[id].guide` (calculadoras, onde o guia tem página no idioma): 27 páginas de ferramenta com 30 cartões e 12 de calculadora com 12 (a hipoteca e o preset 15 vs 30 levam o mesmo guia), em en e es; 39 páginas e 42 cartões.
- **A linha "Read the guide" saiu,** e as chaves dela também: `FileGuidesSharedTexts.guideLink` (os três `file-guides.ts` e o tipo), `CalcPageShared.guide` (os três `calc/i18n/*.ts` e o tipo) e a função `guideOf` de `src/tools/calc/page.ts`. Nenhum `.fo-guide-links` sobra.
- **As relacionadas (fecha a F5b F-12).** O `relatedFor` dos guias de arquivo devolve cada cartão com o `kind`: uma ferramenta segue com o ToolCard, um guia vira o GuideCard completo (H3 e o pé com a ferramenta), na mesma `ul.fo-grid` de 220 px. São 18 guias nas relacionadas de cada idioma, 54 no total. Um link por cartão, então o limite de seis links das relacionadas (`checkFileGuide`) continua. As relacionadas das ferramentas, das calculadoras e dos guias de dinheiro não têm guia.
- **O `docs/design/`** diz as duas entradas que mudam regra de componente:
  - no `components/Footer/README.md`, a linha "Colunas de links por categoria e a coluna FileOrca (About, Privacy, Terms, Licenses, Contact)." ganhou, depois dela, "Embaixo de Utilities, na mesma coluna, o bloco Guides (F11, DECISOES § 396): "All guides" e os grupos do hub que têm guia no idioma; no hub, "All guides" leva `aria-current="page"`.";
  - no `components/Breadcrumb/README.md`, "Sempre Home → hub da categoria → ferramenta → preset." passou a "Sempre Home → hub da categoria → ferramenta → preset; num guia, Home → Guides → o guia (F11, DECISOES § 396).".
- **O glossário** (`docs/i18n/pt.md` e `es.md`, que pede um § a cada mudança) ganhou a seção "O hub de guias, o cartão e a busca (F11)" com os termos novos: o hub, os grupos, "All guides", o tipo e a medida do cartão, a ferramenta no guia, a seção da home e a busca em dois grupos, com a concordância do título vazio.

## § 397 · A busca com Ferramentas e Guias (F11, decisão 7)

- **O índice.** Cada entrada de `/search-index.json` ganhou `kind: 'tool' | 'guide'`. Os 15 guias (os de dinheiro e os de arquivo) são `'guide'`, com o ícone `file` e a categoria "Guide" ("Guia", "Guía") de cada idioma; o `cat` segue o do grupo (`image`, `pdf` ou `money`), que pinta o círculo. Antes, um guia de arquivo vinha com o ícone da ferramenta e a categoria do hub ("Image", "PDF"), e um de dinheiro com a de dinheiro. Nenhuma entrada nova, e a ordem do índice não mudou.
- **Os grupos.** O `filterEntries` ordena como antes; o `groupEntries` põe todas as ferramentas e depois todos os guias, sem mudar a ordem dentro de cada grupo, e o `render` monta, dentro do `role="listbox"`, um `div[role="group"]` por grupo que tem resultado, com o `aria-labelledby` no título (`div.fo-search__group`, "Tools" e "Guides" no idioma) e os `div[role="option"]` dentro. Grupo vazio não tem título. A lista passou de `ul` para `div`: um `ul` só pode ter `li`, e a marcação da especificação é de `div`. O nome de cada opção vai num `span` (o CSS da especificação o deixa quebrar ao lado do círculo).
- **O teclado.** O foco fica no campo, e o `aria-activedescendant` aponta a opção marcada; os ids das opções seguem a ordem da tela (`<lista>-0`, `-1`…), então as setas passam de um grupo para o outro, pulam os títulos e dão a volta; o `select()` rola a própria opção, não o `n`-ésimo filho da lista (que agora é um grupo). Enter abre, Esc fecha.
- **Os textos:** o nome do campo "Search tools and guides", o placeholder "Find a tool or a guide", o nome da lista "Results", os títulos dos grupos (`search.toolsGroup` e `search.guidesGroup`, nomes desta run), a categoria `search.guideCategory` e o vazio "No tool or guide called "{query}"", nos três idiomas, como na especificação. O título vazio em es passou de "No hay ninguna herramienta llamada" para "Ninguna herramienta o guía llamada". O `dialogLabel` e o `emptyHint` ficam como estavam (a especificação não os muda), e o botão do cabeçalho segue "Search tools". Os títulos dos grupos chegam ao módulo pelos atributos `data-tools` e `data-guides` da lista, para o chunk da busca não carregar textos.
- **Uma consequência da ordem fixa.** A especificação manda Ferramentas antes de Guias, sempre. Um guia digitado pelo nome inteiro fica depois das ferramentas que têm todas as palavras dele: "jpg or png" mostra Crop image e Rotate image antes do guia "JPG or PNG: which one to use", e o Enter abre o Crop image. A regra da § 180 (o nome digitado vem primeiro) vale dentro de cada grupo. Nenhuma consulta dos testes da busca perdeu o primeiro resultado; a consequência vai como pendência para o Victor decidir se a ordem dos grupos segue o resultado mais próximo.
- **O `docs/design/components/ToolSearch/README.md`:** "a lista é `role="listbox"` com nome ("Tools")" passou a "com nome ("Results")", e uma linha nova diz os dois grupos: "Dois grupos (F11, DECISOES § 397): primeiro as ferramentas, depois os guias, cada um um `role="group"` nomeado pelo título dele ("Tools", "Guides", na legenda `caption` em `ink-muted`). Grupo vazio não tem título. Um guia tem o ícone `file`, o círculo da cor do grupo dele e "Guide" à direita. As setas passam de um grupo para o outro, pulando os títulos." O `preview.html` dele e o `bundle.css` ficam para a run que regenerar o design system (`.fo-search__group` está só no `components.css` do site).
- **O peso.** O chunk da busca (`dist/_astro/entry-*.js`) foi de 2.629 para 2.984 bytes, e de 1.298 para 1.432 com gzip nível 9 (+134 bytes; o limite é +1 KB). O `search-index.json` foi de 45.820 para 46.520 bytes (8.949 para 8.987 com gzip). A busca continua carregando só no primeiro uso (o teste do `guides-search.spec.ts` e o do `navigation.spec.ts`).

## § 398 · A seção de guias na home e o HOME_GUIDES (F11, decisão 7)

- **A seção "Read a guide"** ("Leia um guia", "Lee una guía") entra na home dos três idiomas entre a do QR code e "Your files stay with you", no molde das outras: `section.fo-section[aria-labelledby="guides-home"]`, H2, `p.fo-prose` ("Each guide answers one question with numbers and has the tool inside."), a grade `ul.fo-guidecards` com os quatro GuideCards (H3 e o pé) e `p.fo-more` com "See all 15 guides" ("Ver os 10 guias", "Ver las 15 guías"), o `{n}` lido do registro, para o hub do idioma. A válvula da ficha não foi usada.
- **O `HOME_GUIDES`** mora em `src/tools/guides/hub.ts`, que já junta os guias de arquivo e os de dinheiro (a alternativa era o `registry.ts` dos guias de arquivo, que passaria a importar o registro das calculadoras). Em en e es: HEIC to JPG on Windows (imagem), Why is my PDF so large? (PDF), How to combine PDFs on a phone (o quarto, o único guia escrito para o celular) e How extra payments shorten a mortgage (dinheiro), a ordem do protótipo. Em pt, sem guia de dinheiro, "JPG ou PNG: qual usar" fica no lugar do de dinheiro. O módulo lança erro se um id não tiver página no idioma.
- **Os textos** ficam no `home.ts` de cada idioma (`home.guides`, obrigatório no `HomeTexts`), e não num arquivo novo: a seção é da home. A home continua sem AdSlot, e o `gate:prontidao` continua contando só os `a.fo-tool` dela.

## § 399 · Onde mora cada teste novo do hub e das entradas (F11, decisão 10)

- **Os unitários (Vitest; rodam no job `leve` e no `verificar`):**
  - `tests/unit/guides-card.test.ts`, novo, 8 testes: a medida de cada guia de arquivo contra a contagem da especificação e contra a forma do JSON, e a varredura de qualquer profundidade (2); os dados do cartão nos três idiomas, de arquivo e de dinheiro, e os textos do cartão sem algarismo (3); os cartões do hub no `dist/`, um teste por idioma: um link, o nome que começa por "Guide", o H3 embaixo do H2, a medida e a ferramenta (3).
  - `tests/unit/guides-entries.test.ts`, novo, 17 testes, todos sobre o `dist/` (precisa do `pnpm build` antes, como o `guides-hub-route.test.ts`): o bloco Guias no rodapé de cada uma das 211 páginas, um teste por idioma, e as âncoras do hub (5); os cartões `--here` de toda ferramenta e calculadora, contados contra os registros (39 páginas e 42 cartões), e a linha antiga sumida (1); nenhum guia com o ToolCard em todo HTML do `dist/` e os guias das relacionadas com o GuideCard (3); o índice da busca com o `kind`, o ícone e a categoria, e a ordem dos grupos (3); a seção da home e o `HOME_GUIDES` (4); o `/guides/` no `lighthouserc.json` (1).
  - `tests/unit/conteudo.test.ts`: mais 7, a regra do hub com os controles negativos (6) e o portão rodado sobre o site falso (1, com o limite de 60 s, como o do `pdf-site.test.ts`: roda o portão duas vezes num subprocesso).
  - `tests/unit/contrast.test.ts`: mais 2, as cores do cartão lidas do `components.css` e os três pares do UX-02.
- **"Nenhum guia com o ToolCard em qualquer página" mora no Vitest, sobre o `dist/`.** Ele lê todo HTML do build (as 211 páginas e as 404) em menos de um segundo, sem navegador. A alternativa era um spec do Playwright, que abriria as 211 páginas nos dois navegadores, num teste só (estoura os 60 s do WebKit no CI, § 306) ou em blocos, para conferir uma marcação estática. Da mesma forma, o rodapé de toda página e a contagem dos cartões `--here` são unitários sobre o `dist/`. A trilha das 40 páginas, no HTML e no `BreadcrumbList`, fica no `tests/unit/guides-hub-route.test.ts` do G1.
- **Os specs do Playwright,** com nomes `guides-*`, que ordenam entre o `events.spec.ts` e o `i18n-budgets.spec.ts` e caem nas partes leves:
  - `tests/e2e/guides-hub.spec.ts`, novo, 6 testes por navegador (dois por idioma): o hub renderizado, cada guia do idioma uma vez no grupo dele, o GuideCard com um link só e o nome que começa por "Guide", "Guia" ou "Guía", H1, H2 e H3 sem pular nível, nenhum AdSlot, os atalhos de 48 px e as âncoras, o primeiro cartão acima da dobra a 360 × 740, os cartões com 300 px ou mais de largura e 200 de altura, e o "All guides" como página atual no rodapé. O axe do hub nos dois temas fica no `a11y.spec.ts`, que lê o mapa de rotas.
  - `tests/e2e/guides-search.spec.ts`, novo, 7 testes por navegador: o índice servido com o `kind` (1) e, por idioma, os dois grupos com o nome acessível, a ordem, os ids, as setas entre os grupos e o Enter num guia (3), e o grupo vazio sem título, o vazio e a busca carregando só no primeiro uso (3).
  - mais 4 no `budgets.spec.ts` (o `/guides/` e três pares de requisições), 4 no `i18n-budgets.spec.ts` (os dois hubs e os mesmos arquivos de `/guides/`) e 5 no `layout-shift.spec.ts` (de 10 para 15 por navegador: os hubs em toda largura e as páginas da borda da varredura nova); os dois testes que mudaram no `ads.spec.ts` não somam.
- **As partes do CI,** pelo `--list` desta worktree (`--shard=i/5` no Chromium e `--shard=i/13` no WebKit; o merge com o agente do cabeçalho muda as fronteiras, e o agente principal confere de novo): o `guides-hub.spec.ts` e o `guides-search.spec.ts` caem na parte 3 do Chromium e na 7 do WebKit; o `layout-shift.spec.ts` na 4 do Chromium e na 10 do WebKit. O `design.spec.ts` (Chromium 3, WebKit 6 e 7) e o `image-matrix.spec.ts` (Chromium 4, WebKit 9) seguem em partes diferentes.
- **As contas:** o Vitest foi de 103 arquivos e 1.766 testes (o commit do G1) para 105 arquivos e 1.800 (+34: 8, 17, 7 e 2). O `--list` do Playwright foi de 1.431 para 1.457 por navegador (+26: 6, 7, 4, 4 e 5).
- **A prova de que cada teste novo reprova sem a mudança,** contra o `dist/` do ponto de partida (`.cache/f11/dist-antes/`, servido numa porta própria para os specs e posto no lugar do `dist/` para os unitários): os 13 testes novos do `guides-hub.spec.ts` e do `guides-search.spec.ts` reprovam (o hub responde 404; o índice não tem `kind`; a lista não tem grupos); os 17 do `guides-entries.test.ts` e os 3 do `guides-card.test.ts` que leem o `dist/` reprovam (sem o bloco Guias no rodapé, sem cartões, 108 guias com o ToolCard nas páginas, sem a seção da home, sem o hub); os testes novos e mudados do `budgets`, do `i18n-budgets`, do `layout-shift` e do `ads.spec.ts` reprovam (20, pelo status do hub ou pela falta do cartão); os do `contrast.test.ts` reprovam com o `components.css` do ponto de partida (0 regras `.fo-guidecard`). Os unitários que leem só os registros (a medida, os dados do cartão, o `HOME_GUIDES`, o `groupEntries`, a regra do portão) importam módulos e funções que o ponto de partida não tem (`src/tools/guides/card.ts`, `HOME_GUIDES`, `groupEntries`, `checkGuidesHub`): o arquivo nem carrega.

## § 400 · Os testes antigos que o hub e as entradas mudaram (F11, decisão 10)

A ficha manda mudar um teste que fixa o que a fatia muda junto com o que ele protege, e mostrar que a proteção continua. São os do G1 (a rota e a trilha) e os do G2 (o cartão e as entradas), cada um no mesmo commit do código que ele protege.

- **`tests/unit/routes.test.ts:56-68` (G1).** O teste "has the routes of the site…" fixava a ordem exata dos ids do mapa de rotas. Agora fixa a mesma ordem, com o `GUIDES_HUB_ID` logo antes de `...FILE_GUIDE_IDS`. As outras asserções do teste continuam iguais e passam sem mudar (a `adArea` 'arquivos', os idiomas por id, as páginas só em inglês, 'dinheiro' e 'utilidades'): o hub não tem `adArea`, e o `languagesFor` dele dá os três idiomas.
- **`tests/unit/seo-checks.test.ts:85` (G1).** O `SIZES` dos sitemaps fixava en 80, pt 52 e es 67 URLs. Agora fixa 81, 53 e 68, com "+ 1" em cada soma e um comentário da F11. A asserção ao lado, que compara o comprimento com as rotas indexáveis que têm caminho no idioma (lidas do mapa), continua igual e protege a contagem.
- **`tests/unit/seo-checks.test.ts:120` (G1).** Só acréscimo: a lista do cluster `['en', 'pt-BR', 'es', 'x-default']` ganhou o `GUIDES_HUB_ID`, o que prova o `hreflang` recíproco e o `x-default` do hub. Nenhuma asserção mudou.
- **`tests/unit/ads-pages.test.ts:53` (G1).** Só acréscimo: o `NO_ADS` ganhou `['guides', GuidesHubView, {}]`. Nos três estados do build (`none`, `client`, `all`) e nos três idiomas, o hub fica sem `adsbygoogle.js`, sem `class="adsbygoogle"` e sem `class="fo-ad"`. Nenhuma asserção mudou, e o número de testes também não.
- **`tests/unit/conteudo.test.ts`, o `build()` (G2).** O site falso escrevia um esboço (`<p>id</p>`) para toda rota que o teste não conhecia, o hub entre elas; o esboço reprova a regra nova (§ 394). Agora escreve o hub de `guidesHubPage()`, que passa todas as regras. As duas regex da linha do resumo não mudaram: a contagem nova vai no fim da linha.
- **`tests/unit/pdf-site.test.ts`, a home (G2).** A ordem das seções da home fixava `[…, 'qr-home', 'privacy-home']` em en, pt e es. Agora fixa `[…, 'qr-home', 'guides-home', 'privacy-home']`. As asserções de nenhum AdSlot e da Oli ao lado do H1 continuam.
- **`tests/unit/pdf-site.test.ts`, o rodapé (G2).** Fixava os títulos das colunas de en (`[…, 'Utilities', 'FileOrca']`) e de pt e es, e lia a coluna Utilidades por todos os `li a` dela. Agora os títulos ganharam "Guides" ("Guias", "Guías", o `common.guidesHub`) depois de Utilities, uma asserção nova fixa as 7 colunas de en (o bloco Guias fica na mesma coluna, não numa 8ª), e a lista da coluna Utilidades é a do primeiro `ul` dela (o QR code). As asserções da coluna de PDF, das de casa e saúde e de pt e es sem link para página em inglês continuam iguais.
- **`tests/e2e/navigation.spec.ts` (G2).** Fixava o título vazio em pt "Nenhuma ferramenta chamada" (dois lugares), a linha de um guia de arquivo com a categoria do hub ("Imagem", "PDF"), a do guia de resolução em "jpg to pdf" com "PDF" e as dos guias de dinheiro do 404 em es com a categoria de dinheiro. Agora fixa "Nenhuma ferramenta ou guia chamado" e a categoria "Guide" ("Guia", "Guía") de todo guia. As consultas, as contagens e a primeira opção de cada consulta não mudaram: nelas, os guias já vinham depois das ferramentas.
- **`tests/e2e/ads.spec.ts`, a linha do guia (G2).** Os três testes (um por idioma) mediam `.fo-guide-links`: visível, fora do painel e a 150 px de todo AdSlot. Agora medem o `.fo-guidecard` dentro de `section[data-content="how"]`, com as mesmas três afirmações, e também nas calculadoras que um guia traz (6 em en e es; nenhuma em pt). O título mudou para "the guide card of each tool and calculator a guide embeds stays 150px from every AdSlot, at 360 and 1280px".
- **`tests/e2e/ads.spec.ts`, as páginas sem anúncio (G2).** A lista ganhou `/guides/`, `/pt/guias/` e `/es/guias/`, lidos do mapa, e cada página da lista, fora as 404, tem de responder 200 (o `serve-dist` responde uma rota que falta com a 404 mais próxima, que também não tem anúncio). O título ganhou "guides hub". As duas asserções de antes (nenhum `.fo-ad`, nenhum código do AdSense) continuam.
- **`tests/e2e/budgets.spec.ts` e `tests/e2e/i18n-budgets.spec.ts` (G2).** Só acréscimo: o hub nas listas de hubs, com as regras deles (no máximo dois arquivos de JS), três pares de requisições e o par dos mesmos arquivos de pt e es com `/guides/`. Nenhuma asserção mudou.
- **`tests/e2e/layout-shift.spec.ts` (G2).** O `CASES` ganhou os três hubs em toda largura e as 17 páginas que a varredura nova pôs na borda de uma linha (a trilha dos 40 guias mudou); a visita passou a exigir status 200. Os testes por navegador passaram de 10 para 15, e os nomes dos blocos mudaram com as listas. A asserção de cada página (a trilha, o H1 e o aviso parados quando a Figtree chega) não mudou.
- **Por construção, sem editar:** o `tests/e2e/a11y.spec.ts` ganhou 3 testes por navegador (o hub nos três idiomas), e o reflow a 320 px do `tests/e2e/design.spec.ts` continua em 4 blocos, com o título do 4º de "(pages 181 to 208)" para "(pages 181 to 211)".
- **Conferidos, sem mudar:** o `tests/unit/routes.test.ts` da busca (o `filterEntries` ordena como antes), as contagens de opções da busca no `a11y.spec.ts` e no `design.spec.ts`, o `tool-guides.spec.ts`, o `tool-i18n.spec.ts`, o `cookie-footer.spec.ts`, o `events.spec.ts`, o `image-hub.test.ts` e o `guides-hub-route.test.ts`.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite ou tempo mudou.** O Vitest foi de 102 arquivos e 1.751 testes (o `41cdf4a`; 1.750 no ponto de partida `609a868`) para 105 arquivos e 1.800 testes, passando pelos 103 e 1.766 do G1, e o `--list` do Playwright foi de 1.428 para 1.457 por navegador (1.431 no G1).

## § 401 · O merge das três fatias e a conferência no Linux (F11, decisão 13)

- **As três fatias entraram na `fase-11` por `git merge --no-ff`, com o trailer (regra 6), na ordem do plano:** G1, a rota do hub (`ca87dbf`); T, o tema, o cabeçalho e a Privacidade (`8c1a815`); e G2, o GuideCard e as entradas (`cc008df`). O T e o G2 partiram do commit do G1 (`0e8f8ea`) e tocaram onze arquivos em comum. O Git juntou dez sozinho, porque o plano separou as regiões: as chaves do `header` e as do `footer` e da `search`, o bloco do cabeçalho reescrito no lugar e o resto no fim do `components.css`, e linhas diferentes dos testes. Só o `DECISOES.md` teve conflito: as § 385 a § 392 (T) ficaram antes das § 393 a § 400 (G2), como o plano mandava.
- **Depois do merge:**
  - `pnpm tipos` com 0 erros, `pnpm lint` verde e o build com 211 páginas;
  - o Vitest com 109 arquivos e 1.830 testes (1.750 no ponto de partida);
  - os portões do build verdes;
  - o `--list` com 1.556 testes por navegador (1.428 no ponto de partida), em partes que ainda separam o `design.spec.ts` do `image-matrix.spec.ts` (Chromium 3 e 4; WebKit 6 e 9-10).

  Os specs em que as duas fatias se encontram rodaram juntos, nos dois navegadores: o cabeçalho de toda página, o hub com os cartões, os anúncios, o `layout-shift`, o `a11y`, a navegação, os eventos, o design e os guias. Foram 15 specs numa execução só, de 8,4 min: 1.423 verdes e 1 vermelho, o primeiro quadro do `/merge-pdf/` no Chromium (`header-theme.spec.ts:79`). Um quadro teve o fundo do `body` transparente (`rgba(0, 0, 0, 0)`) em vez do claro guardado. O teste não reprovou de novo em 54 execuções sozinho, em 180 com 14 workers no Chromium nem em 90 com 8 workers no WebKit. Ficou como a F11 p-2 do grupo 20 e foi para a lente de tema e desempenho da revisão.
- **A conferência no Linux no meio da run não rodou,** porque o rótulo `ci` não existe no repositório. O `gh api repos/<dono>/<repo>/labels/ci`, só leitura, respondeu 404. No começo da run, um `gh label list`, também só leitura, já tinha mostrado o mesmo; a ficha manda nunca usar `gh label`, e isso fica registrado no relatório. A run não cria o rótulo (CLAUDE.md, "Fora de toda run").
- **O `gh pr ready` seguido do `gh pr ready --undo` foi recusado como atalho:**
  - o job `merge` decide pelo `github.event.pull_request.draft` do evento, no `if` dele e no JSON que o `pode-mesclar` lê;
  - o `ci-ok` só olha o rascunho de agora (`PR_DRAFT_NOW`) na classe leve;
  - a execução do `ready_for_review` chegaria, verde, ao `gh pr merge` com a PR já de volta ao rascunho.

  O resultado seria uma PR pela metade na `main` ou, se o GitHub recusasse o rascunho, um job vermelho, um comentário e uma issue para o Victor. A conferência no Linux é a execução final, com tudo commitado. A pegadinha está na seção F11 do `docs/claude/ci.md`; a escolha (criar o rótulo, ou fazer o `merge` ler o rascunho de agora) é do Victor, na linha F11 p-1 do grupo 20 do `docs/PENDENCIAS.md`.

## § 402 · O `docs/design/` depois da F11 (F11, decisão 8)

As regras novas entraram nos README pelas fatias, cada uma com o texto de antes e o de depois no § dela. Este § junta o que mudou e o que ficou de fora:

- **Ícones:** 44, com os cinco do cabeçalho (§ 384).
- **O README do sistema:** a linha do tema, com os três estados, a chave `fo-theme`, o script do `<head>` e o par de toda regra de `prefers-color-scheme` (§ 386).
- **O Header:**
  - o README, regra a regra, e o preview com o botão de tema, o Menu e a folha (§ 388);
  - a região do Header no `bundle.css`, com `box-sizing: border-box`, porque o bundle não tem o preflight do site.
- **O GuideCard:** o 28º componente, com README, preview, o bloco no fim do `bundle.css` e a linha na tabela de `components/README.md` (§ 395).
- **Footer, Breadcrumb e ToolSearch:** os README dizem o bloco Guias, a trilha Início › Guias › guia e os dois grupos da busca (§ 396 e § 397).
- **Nenhum token novo:** o `git diff` do ponto de partida até aqui não toca o `tokens.json` nem o `tokens.css`, e nenhum hex entrou no CSS do site. O `gate:design` passa com 211 páginas e 1 CSS.
- **Ficou de fora, para a run que regenerar o design system** (F11 g-2, no grupo 20):
  - o `docs/design/index.html` sem o GuideCard;
  - a "Conferência" do axe de 29/out, de antes dele;
  - o preview do ToolSearch e o `.fo-search__group` no `bundle.css`.

  A ficha proíbe o `pnpm design:gerar` nesta run.

## § 403 · As medidas do fim, depois do merge (F11, decisões 3, 9 e 11)

Sobre o build do merge (`cc008df`), na máquina local:

- **Orçamento de JS:** o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, 342 verdes. As 180 linhas "JS inicial" do ponto de partida (`.cache/f11/antes/budgets.log`), comparadas página a página:
  - todas têm o mesmo número de arquivos JS e de requisições;
  - o maior aumento é de +0,3 KB, dos dois scripts inline do tema (376 bytes com gzip, § 385);
  - o maior JS inicial do site é 51,9 KB, para um limite de 80.

  Os três hubs novos têm 0 arquivo JS e 4 requisições, como os hubs de categoria.
- **Nenhum arquivo JS novo por página:** os nomes de `dist/_astro/*.js` sem o hash são os mesmos 66 do ponto de partida.
- **A busca:**
  - o chunk do `entry` foi de 1.321 para 1.455 bytes com `gzip -9` (+134 B, limite +1 KB) e continua só no primeiro uso;
  - o `search-index.json` foi de 8.946 para 8.985 bytes com gzip.
- **A altura do cabeçalho** (as 90 linhas `[header]` do `header-menu.spec.ts`, nos dois navegadores, com a Figtree segura e solta): 64 px e uma linha em toda largura de 320 a 1280 px, nos três idiomas, sem nada se mover quando a fonte chega.
  - A 320 px, os quatro controles ocupam 282,5 de 288 px.
  - A 1280 px, o logo começa na coluna (x 36), o último controle termina em x 794 e a lateral começa em x 944: 150 px.

  A tabela por largura está no relatório.
- **As partes do CI:** o `--list` dá 1.556 testes por navegador:
  - Chromium em 5 partes, de 311 e 312;
  - WebKit em 13 partes, de 119 e 120;
  - os specs `guides-*` e `header-*` caem nas partes leves (Chromium 3, WebKit 7 e 8);
  - o `design.spec.ts` e o `image-matrix.spec.ts` seguem em partes diferentes.

## § 404 · As correções da revisão adversarial (F11)

Depois dos céticos, a revisão adversarial da F11 deixou de pé oito achados, todos baixos: o B-1 e o D-1 chegaram como médios, e os céticos os rebaixaram. Quatro foram corrigidos aqui. Cada um tem um teste que reprova sem a correção, provado no commit do teste, sobre o build de antes (`ca91a85`). Os outros quatro foram para o PENDENCIAS.

- **B-1, a marca da seção e do idioma com cores forçadas.**
  - **O defeito:** com cores forçadas, o fundo e as bordas de toda linha do Menu ficam iguais. A seção atual e o idioma em uso só se distinguiam pelo peso, 700 contra 600. O item atual do menu de idioma do computador (uma regra da F1b) não tinha marca nenhuma.
  - **A correção:** em `@media (forced-colors: active)`, um sublinhado de 3 px (`stroke-3`, a 4 px do texto) no nome da linha atual, no idioma em uso do Menu e no item atual do menu de idioma, como na opção escolhida do OptionGroup (§ 280). Nenhuma cor entra, porque o sublinhado segue a cor forçada, e o peso 700 continua. O README do Header e a região do Header no `bundle.css` dizem o mesmo.
  - **O teste:** `header-menu.spec.ts`, "with forced colours the section and the language in use are underlined too…".
    - No Chromium, com `forcedColors: 'active'`, ele exige `underline` na linha atual e no idioma em uso a 360 px e no item atual do menu de idioma a 1280 px, e `none` nos outros.
    - No WebKit, que não emula cores forçadas, exige `none` em todos.
    - No commit `922cf1d`, o Chromium reprovou: esperava `underline` e recebeu `none`.
- **C-1, a impressão com o Escuro.**
  - **O defeito:** o bloco `[data-theme="dark"]` do `tokens.css` e o `color-scheme` escuro do `<html>` valiam em toda mídia. Com o Escuro guardado, ou com Sistema num sistema escuro, a impressão saía com o texto claro sobre o papel branco, porque o navegador não imprime o fundo por padrão. O cético mediu, no PDF do Chromium, o texto clareado para rgb(165, 167, 169), 2,41:1 sobre o branco.
  - **A correção:** as quatro regras do escuro ficam em `@media screen`: no `tokens.css`, as variáveis em `[data-theme="dark"]` e em `prefers-color-scheme: dark`; no `global.css`, as duas de `color-scheme`. A impressão sai sempre no tema claro. Nenhum token nem valor mudou, e o par da § 386 continua. A linha do tema do `docs/design/README.md` diz isso.
  - **Os testes:**
    - `theme-pair.test.ts`, um `describe` novo com dois testes. Toda regra do escuro que pinta (uma variável, o `color-scheme`, `color` ou `background`) tem de estar em `@media screen`, em todo CSS do `src/styles/` e no `tokens.css`, e os controles negativos mostram que a checagem acusa a regra fora da tela. O `styleRules` passou a guardar as `@media` em volta de cada regra (o campo `media`), sem mudar as asserções que já existiam. No commit `60e4840`, reprovou com as duas regras do `global.css`.
    - `header-theme.spec.ts`, "the print is in the light theme…". Com o Escuro guardado, e depois com Sistema num sistema escuro, o `emulateMedia({ media: 'print' })` dá o texto, o fundo e o `color-scheme` da página clara, e na tela a página continua escura. No mesmo commit, reprovou nos dois navegadores, com o texto rgb(247, 250, 253), o fundo rgb(11, 21, 36) e o `color-scheme` dark.
- **D-1, a folha do Menu a 146,5 px do anúncio, de 390 a 767 px.**
  - **O defeito:** abaixo de 768 px, a folha tem a mesma altura em toda largura, mas o 1º AdSlot do Merge PDF e do Unlock PDF em inglês sobe de y 796 para y 776 a partir de 390 px. Com as linhas de 52 px, a folha terminava em y 629,5, a 146,5 px dele, nos dois navegadores. O `ads.spec.ts` media só 360 e 1280 px, e a frase da § 388 ("todo AdSlot das 178 páginas … a 166,5 px ou mais") só valia até 384 px.
  - **A correção:** as linhas da folha passam a ter 48 px, o `tap-min` de todo controle e dos idiomas (`min-height: var(--tap-min)` e padding vertical 0; o nome e a contagem, 38 px, ficam centrados). É um desvio da especificação (`header-a.html`), que pedia 52 px.
    - A folha em inglês termina em y 597,5 (antes, 629,5), e a de português e espanhol em y 497,5 (antes, 521,5).
    - Abaixo de 768 px, todo AdSlot fica a 178,5 px ou mais da folha aberta; de 320 a 384 px, a 198,5 px ou mais.
    - A 1280 px, a folha fica 32 px mais curta em inglês e 24 px em português e espanhol.
    - O README do Header, a região do Header no `bundle.css`, o comentário do CSS e o `docs/claude/anuncios.md` dizem as medidas novas.
  - **O teste:** o bloco do cabeçalho do `ads.spec.ts` mede também 767 px (360, 767 e 1280). Abaixo de 768 px, a folha não muda de altura e o anúncio só sobe com a largura, então 767 px é onde os dois mais se aproximam. No commit `333fec8`, os blocos do `/merge-pdf/` e do `/unlock-pdf/` reprovaram nos dois navegadores, com 146,5 px a 767 px. Depois da correção, os 24 blocos passam.
  - **As alternativas:**
    - 48 px de altura mínima com o padding de 4 px: as linhas ficavam com 50 px, e o vão com 162,5 px;
    - medir 390 e 412 px em vez de 767: uma largura a mais, sem pegar o ponto mais perto;
    - a solução da raiz, o 1º anúncio dos moldes de PDF abaixo de y 880, continua com a F12 (UX-07).
- **D-2, o tempo dos blocos do cabeçalho.**
  - **O defeito:** cada bloco abre 15 páginas e, em cada largura, abre e fecha os menus. No WebKit, com a máquina carregada, estourava os 60 s do padrão sem nenhuma asserção de vão falhar.
  - **A correção:** `test.setTimeout(120_000)` no teste do bloco, como nos testes longos das calculadoras. Nenhuma asserção mudou.
  - **A prova:** com o tempo global baixado para 5 s (`--timeout=5000`, um runner muito mais lento), os 12 blocos do Chromium reprovaram no commit `333fec8` com "Test timeout of 5000ms exceeded". No `7b39ad6`, os 12 passaram em 17,3 s, porque o bloco tem o tempo dele.
- **O teste antigo que mudou (no formato da § 341).** No `tests/e2e/header-menu.spec.ts`, o teste de cada molde fixava as linhas da folha com 52 px ou mais, a altura da especificação. Agora fixa 48 px ou mais, porque o D-1 passou as linhas a 48 px. A proteção continua: toda linha é um alvo de 48 px, como os idiomas e os controles, e o vão da folha aos anúncios, que a altura servia, está no `ads.spec.ts`, agora também a 767 px.
- **Só acrescentados,** sem nenhuma asserção mudada: o teste do sublinhado no `header-menu.spec.ts`, o da impressão no `header-theme.spec.ts`, o `describe` da impressão e o campo `media` no `theme-pair.test.ts`, e a largura de 767 px e o tempo de 120 s no bloco do cabeçalho do `ads.spec.ts`.
- **As pegadinhas novas:**
  - no `docs/claude/design-e-oli.md`, o clique que fecha um popover segue para o que está embaixo (B-2; a correção só com CSS, da § 405, está no mesmo bullet);
  - no `docs/claude/anuncios.md`, o 1º AdSlot que sobe com a largura (D-1);
  - no `docs/claude/playwright.md`, o WebKit recusa a porta 4190, que está na lista de portas restritas: todo `page.goto` fica parado até o tempo do teste acabar.
- **Os que foram para o PENDENCIAS, sem correção:**
  - B-2: é o comportamento padrão do popover, e engolir o clique pediria um script; a pegadinha ficou escrita. A segunda passada mostrou que basta CSS, e o B-2 foi corrigido na § 405;
  - B-3: o README do sistema e o `bundle.css`, junto do F11 g-2, na run que regenerar o design system;
  - C-2: o tema não é relido ao voltar do bfcache, e a correção é JS novo em toda página, fora desta revisão;
  - E-1: o Menu diz 14 calculadoras de dinheiro, e a Sobre e os Termos em inglês e espanhol dizem 18. As duas páginas estão fora do diff da F11, e o 18 é decisão da § 321.
- **As contagens:** o Vitest tem 109 arquivos e 1.832 testes (+2, os do `theme-pair.test.ts`), e o `--list` do Playwright, 1.558 testes por navegador (+2, o do sublinhado e o da impressão).

## § 405 · A segunda passada da revisão adversarial e a causa da F11 p-2 (F11)

A segunda passada revisou o diff das correções da § 404 (o merge `68aa102`) e confirmou as quatro: cada teste novo reprova sem a sua correção. Ela deixou três achados, e o agente principal corrigiu os três.

- **S2-1 (médio), o B-2 se corrige só com CSS.** A § 404 deixava o B-2 no PENDENCIAS porque "engolir o clique pediria um script". A segunda passada mostrou que não: com `body:has(:popover-open) main { pointer-events: none; }`, o clique que fecha o menu cai no `body` e não chega à ferramenta.
  - **A especificação** (`header-a.html`, "esse clique segue para o que está embaixo: se fosse um anúncio, seria um clique acidental") trata a passagem como risco, não como recurso: por isso pede os 150 px. A correção vai no mesmo sentido, e os 150 px continuam medidos no `ads.spec.ts`.
  - **A correção**, no `src/styles/components.css`, ao lado do menu de idioma:
    - com o Menu ou o menu de idioma aberto, o `.fo-frame` (o `main` e a lateral) fica com `pointer-events: none`. É o `.fo-frame` e não só o `main`, para o clique de fechar também não cair num anúncio da lateral;
    - no WebKit, o clique de um toque chega depois de o menu fechar, e a regra sozinha não bastava: com o `hasTouch`, o toque de fechar marcava o rádio do Rotate image. Por isso, uma folha que nunca se pinta (`body::after`, fixa, `z-index: 10`) cobre a página enquanto um menu está aberto e 400 ms depois, e sai por `scale` com `transition-delay`. O cabeçalho ganhou `position: relative` e `z-index: 11`, para ficar acima dela e continuar clicável (abrir um menu fecha o outro). O aviso de cookies, com `z-index: 20`, também fica acima;
    - o atraso não move nada na tela, então vale também com movimento reduzido: o `transition: none !important` do `global.css` ganhou, só para esta folha, a exceção com `!important`;
    - sem `:has()`, as regras caem e a página fica como antes.
  - **O que não serviu:** uma transição de `pointer-events` no `.fo-frame` (`allow-discrete` com atraso) segurava o toque nos dois navegadores, mas o `gate:design` só aceita transição de `transform`, `opacity`, `translate`, `scale` e `rotate`, e afrouxar o portão é proibido. No caminho, o minificador pôs o `transition-behavior` antes do atalho `transition`, que o zerou; a pegadinha foi para o `docs/claude/design-e-oli.md`.
  - **Os testes**, no `header-menu.spec.ts`, cada um commitado antes da correção:
    - "the click that closes a menu does not reach the page under it…": a 1280 px, no `/compress-image/`, o clique no meio da DropZone com o Menu e depois com o menu de idioma abertos fecha o menu e não abre o seletor; com a página livre, o mesmo clique abre. A 390 px, um rádio do Rotate image logo abaixo da folha continua sem marca. No commit `1c56c0b`, sobre o build de antes, reprovou nos dois navegadores, com 2 seletores abertos;
    - "the tap that closes the Menu on a touch screen…", com `hasTouch`, com e sem movimento reduzido. No commit `304c4d5`, sobre o build só com o `pointer-events: none`, reprovou no WebKit: o toque de fechar marcou o rádio;
    - os dois clicam por coordenada (`page.mouse`, `page.touchscreen`) e esperam a página voltar a receber o ponteiro (`takesPointer`) antes do clique de controle;
    - depois da correção, os dois passaram 3 vezes em cada navegador.
  - O README do Header diz que o clique fora da folha só fecha o menu. O bullet da pegadinha do B-2 no `docs/claude/design-e-oli.md`, desta run, foi corrigido.
- **S2-2 (baixo), o `bundle.css`.** As duas regras de `color-scheme` escuro do `docs/design/components/bundle.css` foram para `@media screen`, como no `global.css`. O `theme-pair.test.ts` ganhou um teste que lê o `bundle.css` com o `darkOnPaperProblems`; no commit dele, reprovou com as duas regras.
- **S2-3 (baixo), os números velhos.** No `docs/claude/anuncios.md`, a folha termina em y 597,5 (629,5 com as linhas de 52 px). Na § 404, a folha fica "mais curta", não "mais baixa". A linha F11 t-2 do PENDENCIAS diz 198,5 px a 360 px e 178,5 px de 390 a 767 px.
- **A causa da F11 p-2.** Numa execução com 6 workers, o axe do cabeçalho do `/merge-pdf/` no Chromium reprovou no tema escuro (contraste em todo texto) e passou ao rodar de novo. O console do trace mostra `Failed to load resource: net::ERR_NO_BUFFER_SPACE` na folha `island.*.css`: o Windows recusou o socket, com a máquina carregada. Uma sonda com a requisição da folha abortada dá o mesmo quadro da p-2: `document.styleSheets` com uma folha vazia e o fundo do `body` em `rgba(0, 0, 0, 0)`. A p-2 é isso, não um piscar do tema. A linha F11 p-2 ficou com a causa, e a pegadinha foi para o `docs/claude/playwright.md`.
- **O que mais a revisão somou ao grupo 20:** a A-1 (o exemplo em espanhol) à g-1, a E-5 (os outros textos com `{n}`) à g-3, a A-2 (o teste do QR code) à g-4, e as linhas novas F11 R-B-3, R-C-2 e R-E-1. O grupo 20 tem 12 linhas, e o PENDENCIAS, 216.
- **As contagens:** o Vitest tem 109 arquivos e 1.833 testes (+1, o do `bundle.css`), e o `--list` do Playwright, 1.560 testes por navegador (+2, o do clique e o do toque).

## § 406 · Os testes antigos que a região de status do tema mudou (F11, no formato da § 341)

O primeiro `pnpm verificar --partes` do fim (no `3275ede`) parou na parte 4 do Chromium com 3 reprovações. A região de status do botão de tema (`<span class="fo-sr" role="status" data-theme-status>`, § 385), que fica no cabeçalho de toda página, fez o `page.getByRole('status')` de testes antigos achar dois elementos (o modo estrito do Playwright reprova), e o `document.querySelector('[role="status"]')` achar a do cabeçalho, que vem antes no DOM. Nenhum spec que a run rodou antes do fim (os 15 da execução conjunta, os da revisão e os tocados pelas correções) lê a região de status da página inteira, e a execução leve do CI não roda o Playwright: por isso só o `verificar` completo viu.

- **O que mudou:** sete leituras passaram a olhar a região da ferramenta, `#fo-tool-root`, como já faziam o `pdf-tool.spec.ts`, o `sw-offline.spec.ts` e a linha 51 do próprio `island.spec.ts`:
  - `tests/e2e/island.spec.ts`: as três asserções do texto da região (linhas 43, 47 e 117) e o observador que anota o que a região disse (linha 100);
  - `tests/e2e/tool.spec.ts`: a asserção da frase do Image to PDF (linha 203) e o observador dela (linha 205);
  - `tests/e2e/image-batch.spec.ts`: a frase do lote com arquivos ilegíveis (linha 68).
- **O que protegiam, e continua:** a frase que a ferramenta diz na região de status (o começo, o fim e o lote com erros), e que a região é esvaziada antes de a mesma frase voltar. Os textos esperados, os tempos e a ordem não mudaram. O `island.spec.ts:51` continua exigindo uma região de status só dentro da ferramenta, e o `header-theme.spec.ts` confere a do cabeçalho.
- **Por que não o produto:** a página pode ter mais de uma região de status, e a do tema só fala quando a pessoa troca o tema. Tirar o `role="status"` dela mudaria a § 385 para servir a um seletor de teste.
- **A prova:** os 3 reprovaram no `verificar`; depois da mudança, o `island.spec.ts`, o `tool.spec.ts` e o `image-batch.spec.ts` passaram inteiros nos dois navegadores (52 testes). O `verificar --partes` rodou de novo, inteiro (§ 407).

## § 407 · O fim da F11: o verificar, o custo e a sequência do fim (F11, decisão 13)

- **O `pnpm verificar --partes`** rodou duas vezes, com a máquina livre. A primeira, no `3275ede`, parou na parte 4 do Chromium com 3 testes antigos que liam a primeira região de status da página (§ 406). A segunda, no `75e98d9`, o último commit de código antes do primeiro `gh pr ready` (as correções da § 408 vieram depois): as 21 partes verdes, a soma de 1.784,6 s, e a maior parte, a do Lighthouse, com 390,7 s, abaixo dos 700 s. A saída real está no relatório.
- **As contagens do fim:** o Vitest com 109 arquivos e 1.833 testes (1.750 em 102 no ponto de partida), e o `--list` do Playwright com 1.560 testes por navegador em 51 arquivos (1.428 em 44).
- **O custo** da última execução do CI antes do relatório, a leve do push do `75e98d9`, está no relatório; o da execução completa vai na descrição da PR.
- **A sequência do fim,** a da ficha: tudo commitado (o relatório, a revisão e as imagens), o push, a execução leve do último push terminada verde, e só então o `gh pr ready`, para o último commit não ficar com um `ci-ok` vermelho de uma execução cancelada ao lado do verde da completa (CLAUDE.md, notas à regra 1). A execução completa é a conferência no Linux que a run não teve no meio (§ 401). Se ela ficar vermelha: `gh pr ready --undo`, a correção, o push, a execução leve e o `gh pr ready` de novo.
- **As worktrees** da run foram removidas com `git worktree remove`: a do ponto de partida (`f11-base`), a da revisão (`revisao-f11`) e a das correções (`wf_a6978b59-cc0-13`, com a branch dela já mesclada). As das três fatias já não existiam. As de outras runs ficaram.

## § 408 · A primeira execução completa vermelha e as duas correções (F11, decisão 13)

A execução completa do `gh pr ready` (a 41791116378, no `3a743ab`, a primeira conferência no Linux da run) reprovou na parte 3 do Chromium: 2 testes desta run, verdes no Windows nas duas execuções do `verificar --partes`. As outras 22 partes passaram, e o `merge` não rodou. A PR voltou ao rascunho (`gh pr ready --undo`) antes da correção, como a ficha manda. O custo dessa execução: 121 minutos cobrados, 10,1 min de parede, 23 jobs.

- **O hub de guias em espanhol, a 360 × 740** (`guides-hub.spec.ts`, "the shortcuts lead to the three groups…"):
  - o nome do primeiro cartão terminou em y 765,14, e a especificação pede que ele fique acima de 740 nos três idiomas (§ 364);
  - a causa: a 2ª linha do H1, "muestran los números", ocupa 278,5 dos 280 px no Chromium do Windows (278,4 com a fonte de reserva). No Linux do CI, o Fredoka sai um pouco mais largo, e o título vai a três linhas: 731,14 + 34 = 765,14. No Windows, nenhuma fonte bloqueada reproduz isso;
  - a correção, sem mexer no tipo do título nem no padding da faixa (`components.css`): o primeiro grupo fica 32 px abaixo dos atalhos (`.fo-jump + .fo-section { margin-top: var(--space-4) }`), não os 64 px de uma seção a outra. O nome do primeiro cartão fica em y 699 com o título em duas linhas, e em y 733 com três;
  - o teste: o mesmo teste agora também põe o H1 em três linhas (acrescenta embaixo dele as linhas de 34 px que faltam para três) e exige o nome acima de 740 do mesmo jeito. Na primeira versão (`9d01a85`), ele acrescentava uma linha ao que o navegador desenhou: reprovou antes da correção nos três idiomas e nos dois navegadores com 765,0, o número do CI, e passou depois no Windows. Mas no Linux o título em espanhol já tem três linhas, e a linha a mais fez quatro: a segunda execução completa (a 41794528865, no `04d9708`; 119 minutos cobrados, 9,9 min de parede) reprovou só nessa asserção, com 767, enquanto a da dobra de verdade passou. A versão de agora (`254a64e`) mede contra três linhas onde quer que o título seja desenhado. Com o espaço antigo de 64 px, ela dá 768 no Windows; com o novo, 736, e o Linux deu 733 com o título de verdade em três linhas. As imagens 13 a 17 do relatório foram refeitas.
- **O toque que fecha o Menu** (`header-menu.spec.ts`, o teste com `hasTouch` da § 405):
  - o controle positivo do teste (depois da espera, o mesmo toque marca o rádio) reprovou: o toque não marcou;
  - a causa: o teste abre um contexto novo e não fechava o aviso de cookies. A 390 × 900, o aviso começa 10 px abaixo do centro do rádio no Windows. O texto dele ocupa mais espaço no Linux, e o aviso cobriu o rádio. O snapshot do trace do CI mostra o aviso aberto. No Linux, o toque de fechar caía no aviso, e o teste não provava nada: o controle positivo é o que mostrou isso;
  - a correção, só no teste (`3acc508`): o `dismissCookies` antes de abrir o Menu, como no teste do clique.
- **As pegadinhas** foram para o `docs/claude/playwright.md`.
- **Um tropeço no caminho:** o push do `ebb6379` levou um erro de tipo no teste novo do hub (`style.remove()` num `ElementHandle<Node>`). O `pnpm tipos` rodado logo depois do push o pegou, o `cb80298` corrigiu, e a execução leve do `ebb6379` foi cancelada pelo push seguinte, sem chegar ao resultado. A regra 2 (o spec alvo e os tipos antes do push) vale também para uma correção de teste.
- **A sequência continua a da § 407:** o push, a execução leve verde e o `gh pr ready` de novo, depois de cada execução completa vermelha (a PR voltou ao rascunho nas duas).

## § 409 · O cabeçalho com a largura do rodapé (ajuste `ajuste-header-width`)

- **O pedido do Victor,** depois do merge da F11: "o header não está com a mesma largura do footer, deveria estar". O rodapé vai até 1240 px (`page-max`), a 24 px da janela. Já o cabeçalho, a partir de 1280 px, seguia a grade da moldura (§ 388): o logo ficava em x 36 e o último botão terminava em x 794, enquanto o rodapé ia de x 24 a x 1256. De 320 a 1279 px, o cabeçalho ficava a 16 px da janela e o rodapé a 24, 8 px de diferença de cada lado.
- **O conflito:** o cabeçalho terminava em x 794 por causa da regra dos 150 px. Nenhum controle e nenhum menu aberto podia ficar a menos de 150 px de um anúncio (F10 p-5). Com as bordas do rodapé, o tema e o Menu ficam em cima da lateral, a 29 px do anúncio dela (y 84), e o Menu aberto (360 × 449 px em inglês) cobre esse anúncio.
- **A escolha do Victor,** entre três opções: o cabeçalho com a largura do rodapé em toda página. A lateral desce para começar 150 px abaixo dele, e o Menu aberto pode cobrir o alto dela. As outras eram a largura do rodapé só nas páginas sem lateral (o cabeçalho mudaria de largura entre as páginas, a alternativa recusada na § 388) e manter como estava.
- **A regra** (`src/styles/components.css`): o `.fo-header` e o `.fo-footer` leem a mesma variável, `--fo-edge`, igual a `max(var(--space-6), (100% - var(--page-max)) / 2)`. O resultado é 24 px da janela e, a partir de 1288 px, os 1240 px da página, no centro. Abaixo de 340 px, os dois ficam com 16 px, porque a 320 px o cabeçalho precisa de 282,5 dos 288 px que tem e não cabe em 272. Com 24 px, ele cabe a partir de 331 px, e a 340 px usa 282,5 de 292. A troca começou em 360 px, e a revisão (b-2) mostrou que o rodapé ganhava a segunda coluna de 356 a 359 px e a perdia a 360. Com a troca em 340 px, ele tem uma coluna dos dois lados. O rodapé só muda abaixo de 340 px, onde passou de 24 para 16 px.
  - **A folha do Menu,** abaixo de 768 px, vai de uma borda do cabeçalho à outra: o `left` dela passou de 16 px para a borda.
  - **As reservas sem anchor positioning** (o `top: 68px` dos dois menus) usam a borda à direita. As regras de 1280 px com a lateral saíram.
  - **Não há token novo.** A variável é de layout e só existe no cabeçalho, no rodapé e nos menus, que a herdam pelo DOM.
- **A lateral** (`src/styles/global.css`): o `padding-top` passou de `--space-5` (20 px) para `--ad-clearance` (150 px). A 1280 px, o anúncio dela começa em y 214, a 150 px do cabeçalho e a 158 px de todo controle, que tem 48 px dentro dos 64. Ela continua na mesma coluna (x 944 a 1244 a 1280 px) e com a mesma altura.
- **O Menu aberto a 1280 px** vai de x 896 a 1256, com 449 px de altura em inglês e 349 em português e espanhol, e cobre o alto do anúncio da lateral. Ele fica a 150 px ou mais de todo anúncio do conteúdo. Enquanto ele ou o menu de idioma está aberto, a lateral não recebe o ponteiro: o `.fo-frame` fica com `pointer-events: none`, e o `body::after` segura o clique de fechar (§ 405). Um clique na lateral só fecha o menu e nunca chega ao anúncio.
- **As medidas** (Chromium e WebKit, linhas `[header]` do `header-menu.spec.ts`):
  - a 320 px, logo, busca, tema e Menu ocupam 282,5 de 288 px, como antes;
  - a 360 px, ocupam 294,5 de 312 px e sobram 17,5 (antes, 294,5 de 328);
  - a 768 px, ocupam 608,2 px em inglês, 654,5 em português e 663,0 em espanhol, de 720, no Chromium (612,6, 659,0 e 667,5 no WebKit);
  - a 1280 px, o logo fica em x 24 e o último botão termina em x 1256, como o rodapé. A lateral está em x 944 e y 214.
- **Os testes:**
  - **`header-menu.spec.ts`, teste novo:** em `/compress-image/`, que tem lateral, e em `/pt/guias/` e `/es/`, que não têm, de 320 a 1920 px (14 larguras), nos dois navegadores, o primeiro controle do cabeçalho começa onde começam as colunas e a base do rodapé, e o último termina onde elas terminam, com 0,5 px de tolerância. Abaixo de 768 px, a folha aberta vai de uma borda à outra; a partir de 768 px, ela termina na borda da direita. E o rodapé nunca perde coluna ao alargar. Com o CSS da `main`, o teste reprovou nas três páginas logo a 320 px (16 contra 24); com a troca da borda em 360 px, reprovou a 360 px (2 colunas antes, 1 agora).
  - **`header-menu.spec.ts`, teste de 1280 px:** saíram as asserções do logo na coluna, do último botão no fim da coluna e da folha a 150 px da lateral. Entraram três: a lateral começa 150 px abaixo do cabeçalho, os controles ficam a 150 px dela, e com a folha aberta o `.fo-frame` não recebe o ponteiro. Com o CSS da `main`, reprovou com 20 px.
  - **`ads.spec.ts`, bloco do cabeçalho:** os controles com os menus fechados continuam medidos contra todo anúncio, o da lateral também. Um menu aberto passou a ser medido contra todo anúncio que não é da lateral. Para a lateral entraram duas conferências, num ponto do meio do anúncio dela, 20 px abaixo do topo dele ou do menu aberto, o que estiver mais baixo: com os menus fechados, o clique chega ao anúncio (controle positivo, com espera, porque a folha que segura o clique fica 400 ms); com um menu aberto, não chega. Com o cabeçalho novo e a lateral ainda a 20 px, o bloco reprovou: "AdSlot a 29px de fo-header__search". Sem as duas regras que seguram o clique (o `pointer-events: none` do `.fo-frame` e o `body::after`), reprovou: "a lateral recebe o clique com o Menu aberto".
- **O design system:** o README do Header (a regra da grade virou a das bordas do rodapé, e a dos 150 px diz o que vale para o menu aberto), o do Footer (as bordas), o do AdSlot e o do ToolPage (a lateral 150 px abaixo do cabeçalho), e o `bundle.css` com a mesma regra.
- **A revisão** (cinco lentes Sonnet, um cético por achado médio e um para os baixos; `docs/relatorios/REVISAO-ajuste-header-width.md`) achou quatro defeitos, todos corrigidos:
  - **o médio:** o ponto da conferência da lateral com o Menu aberto (o meio do anúncio, 20 px abaixo do topo dele, y 234 a 1280 px) caía dentro da própria folha, que vai até y 509 em inglês, então a conferência não podia reprovar. Agora o ponto fica 20 px abaixo do menu aberto;
  - **os baixos:** a troca da borda em 360 px dava ao rodapé duas colunas de 356 a 359 px e uma a 360 (agora em 340 px); o cabeçalho de celular do `preview.html` do Header ficava com a borda da largura do contêiner, e não com 24 px; e dois títulos de teste ainda falavam da grade da moldura.
  - **a segunda passada** (um revisor Sonnet em contexto limpo, sobre o diff das correções) não achou defeito; corrigiu-se a faixa dos 8 px de diferença, que começava em 320 px e não em 360.
- **A F10 p-5** saiu do grupo 19 do `docs/PENDENCIAS.md` para "Já corrigidos": a lateral desceu para 150 px abaixo do cabeçalho, que era o que ela deixava para a F12 decidir.
- **Um efeito que fica:** a 360 px, o cabeçalho e o rodapé ficam a 24 px da janela, e o conteúdo da página continua a 16 px (a `.fo-frame`). A partir de 1288 px, o cabeçalho e o rodapé ocupam 1240 px, e o conteúdo, 1208. O pedido era alinhar o cabeçalho com o rodapé, não com o conteúdo.

## § 410 · O ponto de partida, a linha de base e a numeração dos § da F12

- **O ponto de partida** é a `origin/main` em `e0467c8` (a F11 e o `ajuste-header-width`). A branch `fase-12` nasce dele, e o primeiro commit (`283541d`) só traz os dois arquivos do prompt.
- **A linha de base**, guardada em `.cache/f12/antes/` (fora do Git) no `283541d`, que tem o mesmo código:
  - `pnpm install --frozen-lockfile` e `pnpm build` verdes;
  - o Vitest com 109 arquivos e 1.833 testes, verdes;
  - o `playwright test --list` com 1.563 testes por navegador em 51 arquivos;
  - o `budgets.spec.ts` e o `i18n-budgets.spec.ts` no Chromium, com 342 testes verdes;
  - a lista dos 66 JS de `dist/_astro/`, com e sem o hash;
  - uma cópia do `dist/` de partida em `.cache/f12/dist-antes/`, para provar que cada teste novo reprova sem a mudança.
- **A numeração.** O próximo § livre era o 410. A fatia 1 escreve do 410 ao 418, nesta ordem. As fatias 2a, 2b e 2c correm ao mesmo tempo, em três worktrees, então cada agente escreve os seus § com um marcador no lugar do número (o prefixo da fase, a letra da frente e a ordem: M1, P1, C1…), no `DECISOES.md` e nos comentários do código. Na junção, um script troca os marcadores por números a partir do 419, na ordem M, P, C, e confere que nenhum sobrou. Assim nenhum número é citado antes de existir, e não há buraco na sequência. Ficaram assim: o mapa do 419 ao 425, a parede e o consentimento do 426 ao 434, e o café do 435 ao 444. O plano da run está em `docs/relatorios/fase-12-plano.md`.

## § 411 · A especificação dos protótipos e o prompt (F12, decisão 1)

- **O contrato** é a área "Especificação" do `ad-map.html`, do `wall.html`, do `coffee.html` e do `support.html` (`docs/propostas/ux-v2/`), junto com as § 351, § 360, § 361, § 368, § 369 e § 371. Onde ela diverge do prompt da F12, vale o prompt. As divergências que a leitura achou, e o que vale:
  - **os textos da parede:** o `wall.html` tem os textos da seção A. Valem os do ajuste 3, que o Victor marcou: "With an ad blocker on, the ads don't show, and nothing comes in" no lugar de "Oli gets nothing", e os botões com verbo ("Reload, it's off now", "See how to turn it off", "Continue just this once"). A linha de depois do escape cita o escape com o nome novo;
  - **a pose da parede:** a `sad`, e não a `oops` da seção A (UX-08, marcada);
  - **a Privacidade:** o texto do ajuste 1, e não o "nada sai do aparelho" da seção A, porque a tag do Google e o evento saem;
  - **as unidades:** 37, uma por posição, e não as 15 da seção B;
  - **o 1º anúncio da ferramenta:** depois do "Como usar", e não depois dos chips (UX-04 A e § 371);
  - **a densidade:** a leitura conservadora da § 351, e não a fórmula simples da seção B;
  - **o card do café em português:** um botão só, o Pix.
- **O que é só do protótipo e não vai para o site:** o `bundle.css` do `docs/design/` (o site constrói sobre o `components.css` e o `global.css`, e cada medida é conferida no `dist/`), o script dos previews (`?modo=`, `?state=`, `?lang=`, `?theme=`), o controle do protótipo e os esquemas do `ad-map.css`. O site não importa nada de `docs/propostas/`.
- **As fontes da proposta** (`--font-display`, `--font-text`) viram as do site (`--fo-font-display`, `--fo-font-text`), que trazem a fonte de reserva do CLS.

## § 412 · A configuração: a área `geral`, as 37 unidades e o `PUBLIC_ADBLOCK_WALL` (F12, decisão 2)

- **O que entrou em `src/ads/config.ts`:**
  - a área `geral` (`AD_AREAS`), a da home e do hub de guias; o tipo `AdArea` de `src/i18n/routes.ts` também a tem;
  - as unidades `conteudo`, `conteudo-2` a `conteudo-9` (`CONTENT_UNITS`), `lateral`, `lateral-2` e `multiplex` (`AD_UNITS`), cada uma com o ID em `^\d{6,}$`;
  - a posição n do conteúdo usa a unidade `conteudo-n` da área da página (`contentUnit(n)`; a 1ª é o `conteudo`, e depois da 9ª não há unidade);
  - o `PUBLIC_ADBLOCK_WALL`: `desligado` (o padrão, também vazio), `aviso` ou `bloqueio`, sem diferença de maiúscula;
  - o modo que vale (`wallModeOf`): `desligado` sem o `scriptEnabled` (as três variáveis de hoje), seja o que for a variável.
- **O que para o build,** como antes: área desconhecida, unidade desconhecida (`conteudo-1`, `conteudo-10`, `lateral-3`), ID fora do formato ou que não é texto, área que não é objeto e o `PUBLIC_ADBLOCK_WALL` fora dos três valores.
- **O modelo do JSON** é o do `ad-map.html`: oito unidades em `geral`, `arquivos`, `dinheiro` e `casa-saude` (`conteudo` a `conteudo-5`, `lateral`, `lateral-2` e `multiplex`) e cinco em `utilidades` (`conteudo`, `conteudo-2`, `lateral`, `lateral-2` e `multiplex`). O Victor pode criar menos: a posição sem ID não aparece. O `config.ts` aceita até `conteudo-9`, para o mapa crescer sem mudar o código.
- **Os testes** (`tests/unit/ads.test.ts`): as 37 unidades do build de teste passam e caem nas cinco áreas, na ordem do modelo; cada valor errado reprova com a mensagem certa; o `PUBLIC_ADBLOCK_WALL` em cada valor, e o modo que vale com e sem as três variáveis.

## § 413 · Sem ID, nada (Mudança 10), e a grade igual nos dois builds (F12, decisão 2)

- **O `AdSlot`** (`src/ads/AdSlot.astro`) não desenha nada quando a posição não tem o ID da unidade: nem caixa, nem rótulo, nem espaço reservado, nem script. Antes, a caixa neutra com o rótulo entrava em toda página com área de anúncio, mesmo sem a variável. O build padrão sai sem nenhuma `.fo-ad`.
- **A grade não muda com ou sem anúncio.** A página com anúncio mantém a classe `fo-frame--rail` (a grade de duas colunas a partir de 1280 px), e o `<aside class="fo-rail">` só entra quando a lateral tem o que mostrar (`BaseLayout.astro` renderiza o slot `rail` e confere se ficou vazio). Sem unidade, a coluna da lateral fica no lugar, vazia, e o conteúdo, o cabeçalho e o rodapé ficam nas mesmas bordas nos dois builds (§ 409). Uma coluna vazia não leva nome acessível: um `<aside>` sem nada dentro seria uma região "Advertisements" vazia para o leitor de tela.
- **Quem confere:**
  - `tests/unit/default-build.test.ts` (novo) lê toda página do `dist/` sem renderizar e reprova caixa, rótulo, unidade, push, carregador, parede, isca, tag de recuperação e a pose `sad`. Contra o `dist/` do ponto de partida (`FO_DEFAULT_DIST=.cache/f12/dist-antes`), ele reprova nas 178 páginas com área de anúncio, cada uma com a caixa e o rótulo;
  - o `gate:prontidao`, no item "Build de hoje, sem o ID: nenhum anúncio", passa a reprovar a caixa sem ID, página a página (antes contava as caixas neutras como esperadas);
  - o `ads.spec.ts` abre as mesmas páginas no `dist/` padrão e confere que não há caixa, rótulo nem `<aside>`.

## § 414 · O build de teste: o ajudante, a chave, o segundo servidor e o custo (F12, decisão 2)

- **O ajudante único** é `scripts/lib/test-build.ts` (`buildVariant(nome)`). Ele faz os três builds extras do mesmo código:
  - `client`, só com o `ca-pub-0000000000000000` (o que a revisão do AdSense vê), e `all`, com as três variáveis, os IDs falsos das 37 unidades e a parede desligada. São os builds do `gate:prontidao`, que antes ficavam no próprio portão;
  - `teste`, o build de teste: o mesmo ID de editor, os IDs falsos nas 37 unidades (o pior caso, com o máximo de caixas) e a parede em `bloqueio`.

  Os IDs falsos têm dez dígitos e dizem a posição: `9`, a área (1 a 5), a unidade (01 a 12) e seis zeros.
- **Onde e como.** Cada build vai para `.cache/builds/<nome>/`, nunca para o `dist/`, e o registro do bundle que o `gate:licencas` lê volta como estava. Cada build começa com as quatro variáveis vazias, para nada do terminal vazar para dentro. Uma trava em diretório (`<nome>.lock`) impede dois processos de construir a mesma variante ao mesmo tempo.
- **A chave.** O build é reaproveitado só quando o commit e as variáveis são os mesmos e a árvore está limpa (`.cache/builds/<nome>.key.json`). Com a árvore suja, ele refaz: um arquivo rastreado mudado, em qualquer lugar, ou um arquivo novo onde o build lê (`src/`, `public/`, `docs/design/`, `scripts/` e os arquivos de configuração da raiz). Um teste nunca lê um build de outro commit ou de outros arquivos.
- **O segundo servidor** é `scripts/serve-test-build.ts`, na porta `FO_PORT` + 100 (4273 a 4289, nenhuma das portas que o WebKit recusa), declarado como segundo `webServer` do `playwright.config.ts`. Ele sobe na hora, com as regras do `serve-dist.ts` (que ganhou a raiz como opção, `dist/` por padrão), e só constrói quando um spec pede: o `beforeAll` dos specs que leem o build de teste (`useTestBuild()` em `tests/e2e/lib/test-build.ts`) chama `/__test-build` com o id da execução do Playwright (`FO_RUN_ID`, posto no `playwright.config.ts` e herdado pelos workers). A primeira chamada de uma execução faz ou reaproveita o build, uma vez; as outras esperam por ela. Antes do build, qualquer outro caminho responde 503.
- **As partes do CI sem esses specs** pagam só a subida do processo. A regra "o build uma vez por execução" (Mudança 3) fala do `dist/`, o site que os portões, o Playwright e o Lighthouse medem. O build de teste é uma fixture, como os builds do `gate:prontidao`, e não toca em `.github/`. O `verificar.test.ts` não fixa nada sobre builds extras, então não muda.
- **O `gate:conteudo`** confere os blocos dos guias de arquivo, o AdSlot incluído, no build `all` (§ 418). No CI, ele roda antes do `gate:prontidao` no mesmo job, e o portão de prontidão reaproveita o `all` que ele fez: o job `portoes` não paga um build a mais.
- **Visto como fileorca.com.** O site só pede anúncio e só abre a parede quando o `location.hostname` é fileorca.com. Um spec abre `https://fileorca.com/...` e `tests/e2e/lib/production.ts` responde pelo `context.route`: cada pedido a fileorca.com vai ao servidor de teste (os redirecionamentos também), o carregador do AdSense falha ou recebe um stub vazio, a tag de recuperação recebe o script do caso (o stub do `googlefc`) ou falha, e todo o resto do Google é abortado. Nenhum teste chega ao Google.
- **O custo,** na primeira medida local: o build de teste leva 33 s nesta máquina, uma vez por execução do Playwright. O custo no CI, lido do `ci:custo`, entra no fim da run.

## § 415 · A ajuda do Google sobre o `display: none`, e o plano B (F12, decisão 3)

- **O que as duas páginas dizem** (lidas com o WebFetch em 4/nov/2026):
  - a `support.google.com/adsense/answer/1354736` ("Modifications of AdSense ad code") lista entre as técnicas a evitar "Hiding ad units at anytime (e.g., `display:none`)", com a exceção "unless you're implementing a responsive ad unit". O link da exceção leva à seção "Hiding an ad unit" da outra página;
  - a `support.google.com/adsense/answer/9183363` ("How to modify your responsive ad code") mostra uma media query que esconde a unidade em telas pequenas, onde "no ad request is made and no ad is shown". O exemplo é de uma unidade de tamanho fixo por largura, e a página manda apagar as linhas `data-ad-format="auto"` e `data-full-width-responsive="true"` antes de mexer.
- **A leitura:** a exceção cobre a unidade do exemplo, de tamanho por largura e sem o `auto`. Nenhuma das páginas cita o `autorelaxed` (o multiplex; as páginas do multiplex, `answer/9189566` e `answer/7533385`, não falam de esconder), e nenhuma diz se uma unidade `auto` escondida faz pedido de anúncio. A exceção não cobre, sem dúvida, as unidades `auto` e `autorelaxed` do mapa.
- **Vale o plano B,** que é seguro nas duas leituras:
  - nenhuma unidade escondida por CSS: o HTML não tem `<ins>`;
  - cada caixa (a `div.fo-ad` com o rótulo) diz a largura em que vale, e o CSS mostra a caixa só nessa largura. A caixa da largura certa reserva o espaço no HTML, sem CLS. Uma caixa sem `<ins>` não é uma unidade de anúncio;
  - o script de push único, só em fileorca.com, percorre as caixas no carregamento: a que bate com a largura (`matchMedia`) ganha o `<ins>` e um `push()`, e fica visível em qualquer largura dali em diante; a que não bate sai do DOM. A lateral 2 entra só quando a coluna tem 2.638 px;
  - girar o aparelho ou mudar a janela depois não cria nem tira anúncio, e nada é empurrado de novo (nenhum refresh). O que estava continua, como a lateral de hoje.
- **A implementação** é do mapa (fatia 2a), que registra o detalhe no § dela.

## § 416 · A tag de recuperação e a API `googlefc` (F12, decisão 5)

- **As páginas lidas** com o WebFetch em 4/nov/2026: a `support.google.com/adsense/answer/11575177` ("Tag your sites for ad blocking recovery messages"), a `answer/11576085` ("Create an ad blocking recovery message"), a `answer/11575480` (os erros), a `answer/11576589` e a `developers.google.com/funding-choices/fc-api-docs` ("Privacy & Messaging JavaScript API").
- **O que a ajuda diz da tag:**
  - ela fica na aba "Tagging" do Privacy & messaging e vai no `<head>` ("in between the `<head>` and `</head>` tags");
  - a página não traz o código. A forma vem de cópias públicas do código da aba: um script `async` de `https://fundingchoicesmessages.google.com/i/pub-<16 dígitos>?ers=1` (o ID do editor sem o `ca-`, o mesmo corte do `adsTxt()`) e um script inline que cria uma vez, no `body`, uma `iframe` escondida de nome `googlefcPresent` (`signalGooglefcPresent`). O Victor confere a forma contra a aba dele, num passo do `docs/OPERACAO.md`;
  - com a mensagem em Rascunho, o AdSense já detecta e mede (a premissa do "Depois da F12");
  - o "error protection code", opcional, mostraria uma faixa do Google em inglês embaixo da página, mesmo com a mensagem em Rascunho. Ele não entra.
- **O que a API diz:**
  - a única forma de chamar é pela fila: `googlefc.callbackQueue.push({ AD_BLOCK_DATA_READY: function () {…} })`, com o objeto criado antes (`window.googlefc = window.googlefc || {}`), porque o script do Google é `async`. Uma função solta na fila recebe o status `UNKNOWN`;
  - `googlefc.getAdBlockerStatus()` só vale dentro desse callback e devolve o `googlefc.AdBlockerStatusEnum`: `UNKNOWN` 0, `EXTENSION_AD_BLOCKER` 1, `NETWORK_LEVEL_AD_BLOCKER` 2 e `NO_AD_BLOCKER` 3;
  - o exemplo da própria página usa o nome `EXTENSION_LEVEL_AD_BLOCKER`, que não é o do enum. O código compara pelos números, e o `UNKNOWN` não decide nada: cai no sinal reserva;
  - o `AD_BLOCK_DATA_READY` é o dado mais tardio da fila. A API não promete que ele dispara com a mensagem em Rascunho: o sinal reserva de 4 s cobre o silêncio, e o Victor confere em produção;
  - o `__tcfapi` do TCF v2.2 entra com `__tcfapi('addEventListener', 2.2, …)`.
- **Onde:** só com o `scriptEnabled`, a parede ligada e o `location.hostname` igual a fileorca.com, como o carregador do AdSense. A implementação é da parede (fatia 2b).

## § 417 · A pose `sad` (F12, decisão 6)

- **O SVG** de `docs/propostas/ux-v2/oli/oli-sad.svg` foi para `docs/design/assets/Oli/oli-sad.svg` sem mudar um byte: ele já tem o formato dos outros (128 × 128, o `oli-clip`, o mesmo grupo de transformação). No sprite, o `<symbol>` sai das peças que já existem, sem peça nova e sem cor nova, e as treze peças não mudam de número. As nove poses não mudam de tamanho.
- **A lista fechada** passou a dez em todo lugar onde ela mora: `src/oli/poses.ts`, `scripts/lib/design-checks.ts`, `tests/unit/design-checks.test.ts` e `tests/e2e/design.spec.ts`. O `sprite.test.ts` e o `folha.test.ts` leem a lista e mudaram só o título e a conta (30 `<use>` por fundo, eram 27).
- **Só na parede.** A `sad` só entra no sprite das páginas com a parede (fatia 2b). No `dist/` padrão ela não existe: o `gate:design` passou a proibi-la em toda página (`forbiddenPoses`), e o `default-build.test.ts` também.
- **A pose da parede é uma constante só,** `WALL_POSE` em `src/oli/poses.ts`. Se a busca reversa do Victor no Google Lens achar algo parecido demais, a troca pela `oops` é essa linha.
- **A documentação:** o `docs/design/assets/Oli/README.md` e o README da Oli passaram a dez poses, com a regra "a `sad` só na parede". A folha (`docs/oli/folha.html`) saiu do `pnpm design:gerar`, e o diff dela só traz a pose nova e a frase "dez poses". O `src/styles/theme.css`, que o mesmo comando gera, não mudou.
- **O `CLAUDE.md`** ainda diz "nove poses fechadas" no núcleo. A run não pode mexer nele (o prompt o põe fora), e a Mudança 12 do `PLANO-MELHORIAS.md`, que vem antes do `CLAUDE.md` na ordem de autoridade, dá a décima pose. O `docs/claude/design-e-oli.md` registra isso na seção da F12, e a próxima run que puder mexer no núcleo acerta a frase.

## § 418 · Os testes antigos que a Mudança 10 e o build de teste mudaram (F12, no formato da § 341)

A ficha manda mudar o teste que fixa o que a run muda junto com o código que ele protege, e mostrar que a proteção continua.

- **`tests/unit/ads.test.ts`.** Fixava a caixa neutra com o rótulo nos três estados das variáveis. Agora, sem o ID, o `AdSlot` não desenha nada (a saída é vazia), e com o ID a caixa tem o rótulo de cada idioma, a unidade e o push, como antes. Ganhou três testes da configuração nova (§ 412).
- **`tests/unit/ads-pages.test.ts`.** Fixava duas caixas em toda página de ferramenta nos três estados. Agora são duas com as variáveis e nenhuma sem elas; o resto (a meta, o carregador, as páginas livres) não mudou.
- **`tests/unit/image-hub.test.ts`.** Fixava a caixa de conteúdo e a lateral do hub no build padrão. Agora o hub não tem caixa sem as variáveis, e com elas tem a de conteúdo no `<main>` e a lateral fora dele, como antes.
- **`tests/unit/prontidao.test.ts`.** O site de mentira servia de build padrão e de build com os anúncios ao mesmo tempo. Agora o build padrão é o mesmo site sem as caixas (`withoutBoxes()`), como o `dist/` real; as 150 palavras por caixa e as caixas das páginas de PDF são conferidas no site com as caixas, como o portão faz no build `all`. Ganhou o controle negativo da caixa sem ID no build padrão.
- **`scripts/gates/prontidao.ts` e `scripts/lib/prontidao.ts`.** O "Mais conteúdo que anúncio" e as linhas das páginas de PDF liam as caixas do `dist/`, que não tem mais nenhuma; agora leem o build `all`, com as 37 unidades. O texto das páginas é o mesmo nos dois builds, então as palavras não mudam. Sem a mudança, as 39 páginas de PDF reprovavam por "nenhum AdSlot na página", e a regra das 150 palavras passaria sem conferir nada.
- **`scripts/gates/conteudo.ts`.** Os blocos dos guias de arquivo (a ferramenta, o link, o AdSlot, o que medimos, as fontes e as relacionadas, nessa ordem, e no máximo dois AdSlots) eram lidos do `dist/`. Agora a página do build padrão não pode ter caixa, e a ordem, com o AdSlot, é lida do build `all` (ou da pasta que o `FO_ADS_BUILD` der). Sem a mudança, os 30 guias reprovavam por "sem o AdSlot de conteúdo".
- **`tests/unit/conteudo.test.ts`.** Roda o portão sobre um site de mentira, que era o `dist/` com as caixas. Agora o site escrito é o build com os anúncios (`FO_ADS_BUILD`), e o build padrão é o mesmo site sem as caixas, posto de volta depois de cada execução; todas as asserções de antes continuam. Ganhou um teste: a caixa que sobra no build padrão e o guia sem o AdSlot no build com os anúncios reprovam, cada um com a sua mensagem.
- **`tests/unit/ci-workflows.test.ts`.** Não mudou. O ajudante do build de teste mora em `scripts/lib/`, que o teste varre, e não cita a pasta dos relatórios: a lista do que deixa a árvore suja diz onde o build lê, e não o que fica de fora.
- **`tests/e2e/ads.spec.ts`.** Mede no build de teste (`useTestBuild()`), porque o build padrão não tem caixa. O teste do rótulo passou a conferir também o build padrão, pela origem dele: nenhuma caixa, rótulo, `<aside>`, meta, unidade ou carregador, e o `ads.txt` com 404.
- **`tests/e2e/header-menu.spec.ts`.** A medida da lateral a 1280 px (150 px abaixo do cabeçalho, os controles a 150 px dela, o ponteiro bloqueado com a folha aberta) usa a página do build de teste, onde a lateral existe. As outras larguras continuam no build padrão.
- **`tests/unit/design-checks.test.ts`, `sprite.test.ts`, `folha.test.ts` e `tests/e2e/design.spec.ts`.** A lista fechada passou a dez poses (§ 417); as asserções sobre as nove continuam valendo para elas.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite mudou.** As contagens antes e depois vão no relatório da run.

## § 419 · O mapa de anúncios no build: as marcas das views, a estimativa a 360 px e a escolha das fronteiras (F12, decisão 3)

- **Como o build põe as caixas.** A ficha deixou o caminho em aberto ("um ajudante de build escolhe…"). A escolha:
  - a view marca, na ordem, as fronteiras de bloco onde um anúncio pode entrar, com o componente `src/ads/AdBreak.astro`, que escreve um comentário HTML (`<!--fo-ad:first-->` no lugar fixo do 1º anúncio do molde e `<!--fo-ad:break-->` nas outras fronteiras permitidas). O `Faq` ganhou a opção `breaks`, que marca a fronteira entre duas perguntas;
  - a `BaseLayout.astro` renderiza o `<main>` em texto (`Astro.slots.render('default')`), e `src/ads/map.ts` (`layOutAds`) confere as marcas, escolhe as que levam caixa, escreve as caixas e tira todas as marcas. A coluna lateral também sai dali (`lateral` e `lateral-2`), porque a lateral 2 depende das palavras do `<main>`. As views passam `adArea` à `BaseLayout` e não põem mais nenhum `AdSlot` nem o slot `rail`;
  - as alternativas recusadas: um componente de fluxo em cada view (seis cópias da mesma lógica) e a escolha pela altura medida num navegador durante o build (lenta, e a ficha pede a estimativa a 360 px).
- **As regras de uma marca** (`markProblems`, que o build aplica em toda página, com anúncio ou sem; uma marca errada para o build): nunca dentro de grade de cards, tabela, lista, item, pergunta (`details`), formulário, `nav`, título, parágrafo, link, botão, painel (`#fo-tool-root`), cronograma (`#fo-calc-schedule`), faixa, herói, topo, exemplo ou GuideCard; nunca logo depois de um título; nunca no começo nem no fim do bloco; nunca colada numa tabela (o bloco de antes não termina numa `table` ou `.fo-table-wrap`, o de depois não começa com uma, descendo pelos primeiros e últimos filhos); nunca ao lado da seção "O que medimos" (`data-content="measured"` ou `aria-labelledby="measured"`). Numa página com anúncio, uma marca `first` só, antes de todas as outras.
- **O 1º anúncio de cada molde** (as marcas `first`): home, depois da 1ª seção de cards; hubs de imagem, PDF, casa e saúde, depois da 1ª grade; hub de dinheiro, depois da grade de crédito; hub de guias, depois da seção `#image`; ferramenta (imagem, PDF e QR), depois do "Como usar", que o GuideCard fecha (§ 371); calculadora, depois do painel e antes do cronograma; guia (de arquivo e de dinheiro), no texto, depois do 1º parágrafo da 1ª parte, ou depois dessa parte quando ela tem um bloco só. Os guias deixaram de ler o `half` dos textos (a divisão em volta do AdSlot único): o texto é uma sequência de partes, com marcas entre parágrafos, listas e partes.
- **A escolha dos seguintes** (`chooseMarks`): de cima para baixo, a primeira marca cuja distância estimada até a caixa anterior passa de 1.110 × 1,15 = 1.276,5 px. A distância estimada é `288 + Δ`: os 150 px de margem das duas caixas, menos os 12 px de margem de um parágrafo que a caixa engole no texto, mais a altura estimada do que fica entre as duas marcas. A posição n usa `contentUnit(n)`; depois do `conteudo-9` o mapa para. As posições saem da geometria, e a que não tem ID não entra (Mudança 10): sem o `conteudo-2`, a 2ª posição fica vazia e a 3ª continua sendo o `conteudo-3`, longe das outras, então a densidade só cai.
- **A estimativa da altura a 360 px** (`src/ads/estimate.ts`), que erra para o lado curto: a coluna tem 328 px; o texto corrido (Figtree 16/26) com 48 caracteres por linha (a média do site é 44; com 48 a soma das alturas fica em 0,92 da real); o item de lista com a mesma conta nos 304 px dele; o título em Fredoka 24/30 com 34 por linha; a pergunta do FAQ (17/24) com 36 por linha nos 280 px dela; a linha de tabela com 17 px de borda e respiro mais 22 px por linha da célula mais longa, que fica com a coluna menos 82 px por célula (a da tabela com rolagem, `nowrap`, 38 px); o ToolCard com 158 px, o GuideCard com 239 e o GuideCard do "Como usar" com 176 (o menor de cada um), um por linha; a seção com 48 px acima; o vão de 16 px da grade do `<main>`, das grades de cards e do cronograma; a margem de 12 px do texto só dentro de `.fo-prose`, onde o CSS a põe.
- **A calibração.** Um script fora do Git mediu, nas 184 páginas com anúncio do `dist/` a 360 × 740 com as fontes carregadas, a altura de cada bloco do `<main>` contra a estimativa: nenhum bloco depois do 1º anúncio passou de 1,00 da altura real, e a mediana ficou entre 0,86 e 1,00 por tipo de bloco. Só a trilha, antes de todo anúncio, passava (1,19), e passou a 26 px por linha. No teste do mapa, a menor distância real entre dois anúncios de conteúdo foi de 1.300 px, e nenhuma ficou abaixo de 1.110.
- **O que a regra de 1.110 px mede.** A ficha e a especificação medem a 360 × 740. Num celular mais largo, o texto quebra menos e a distância encolhe. Medido no build de teste (fora do Git), a menor distância é de 1.345 px a 320 px, 1.300 a 360 e 1.219 a 412 (os celulares grandes), e fica abaixo de 1.110 a partir de uns 480 px: 1.104 a 480, 976 a 600 e 882 a 767. A densidade continua baixa em toda largura (no máximo 18,0 % a 320, 20,0 % a 412, 22,0 % a 600 e 23,4 % a 767). O conteúdo 2 em diante vale em toda largura abaixo de 768 px, como a ficha manda (UX-07 A); baixar esse limite para os celulares (por exemplo, abaixo de 480 px) seria outra decisão do mapa, e fica no relatório para o Victor.

## § 420 · As caixas por largura, o push único, o multiplex, as laterais e o aviso de cookies (F12, decisão 3)

- **O plano B da § 415, na marcação.** Cada caixa é uma `div.fo-ad` com o rótulo (`common.adLabel`) e os atributos `data-ad-area`, `data-ad-unit`, `data-ad-id`, `data-ad-format` (`auto` no conteúdo, `autorelaxed` no multiplex, nenhum na lateral) e `data-ad-media`, a largura em que vale: nenhuma no 1º anúncio de conteúdo, `(max-width: 767px)` do 2º em diante (com a classe `fo-ad--phone`), `(min-width: 768px)` no multiplex e `(min-width: 1280px)` nas laterais. O HTML não tem `<ins>`, e o ID da unidade não fica num atributo com nome do AdSense (`data-ad-id`, e não `data-ad-slot`), para nenhum código do Google tomar a caixa por unidade.
- **O CSS** (`components.css`, bloco "F12 · o mapa de anúncios"): a caixa com `data-ad-media` só aparece na largura dela (`display: none` fora), e a visível reserva o espaço desde a primeira pintura. O multiplex tem a altura do carregador, `calc(min(100vw - 2 × space-4, tool-max) × 0,6 + 44px)`: o `ins` de `floor(coluna × 0,6)` (a coluna nunca passa de 760 px, abaixo da faixa de 0,5) mais o rótulo e o respiro. A lateral 2 é `position: absolute`, `top: 150 + 644 + 1.200` px na coluna, que passa a se esticar (`align-self: stretch`, `position: relative`) a partir de 1280 px. `.fo-ad[hidden]` some (a `display: grid` da caixa venceria o `hidden` do navegador).
- **O push único** (`pushScript`, um `<script>` inline no fim do `<body>`, só nas páginas com caixa): dentro do `if(location.hostname==="fileorca.com")`, percorre as `.fo-ad[data-ad-id]`; a que não bate com a largura (`matchMedia`) ou a lateral 2 sem os 2.638 px da coluna sai do DOM; a que bate ganha o `<ins class="adsbygoogle">` (com `data-ad-client`, `data-ad-slot`, o formato e o `data-full-width-responsive="true"` no conteúdo, ou o 300 × 600 fixo na lateral), perde o `data-ad-media` (fica à vista em qualquer largura), sai do `hidden` e recebe um `push({})`. Uma coluna lateral que fica vazia sai também, para nenhuma região "Advertisements" vazia ficar com nome. Nenhum `resize`, nenhum temporizador: girar o aparelho não cria nem tira anúncio. O script tem 0,9 KB (uns 0,5 KB com gzip), no lugar dos scripts de cada caixa.
- **A lateral 2** só entra no HTML numa página com 600 palavras ou mais no `<main>`, contadas como o `gate:prontidao` conta (`wordsOf` em `src/ads/html.ts`; o `tests/unit/ad-map.test.ts` confere a igualdade nas 211 páginas do `dist/`). No build de teste, 172 das 184 páginas a têm; o script só a mostra onde a coluna tem a altura.
- **O aviso de cookies.** A 1280 × 800, o aviso aberto (preso ao pé da tela) ficava a 100 a 130 px do 1º anúncio das calculadoras curtas (BTU, IMC, ladrilho, metragem, APR para APY), cujo painel acaba na primeira tela. A ficha manda descer o anúncio, nunca o aviso: a partir de 768 px, o 1º anúncio da calculadora (`.fo-calc-island ~ .fo-ad[data-ad-unit="conteudo"]`) tem `margin-top` de `ad-clearance + space-24` (246 px). Continua depois do painel e antes do cronograma. A alternativa recusada: o 1º anúncio da calculadora depois do cronograma, que a ficha proíbe.
- **A grade.** A home e o hub de guias ganham a coluna lateral (`fo-frame--rail`), também no build padrão, vazia (§ 413).

## § 421 · O `gate:prontidao` por largura (F12, decisão 4; fecha a F10 p-10)

- **A regra continua:** 150 palavras do `<main>` para cada caixa que a página mostra. O que muda é a conta: antes, toda `class="fo-ad fo-ad--` do HTML, a escondida inclusive; agora, as caixas que aparecem em cada largura, a 360, a 768 e a 1280 px, pela `data-ad-media` de cada uma (`boxesAtWidths` e `showsAt` em `scripts/lib/prontidao.ts`; uma caixa sem largura conta em todas). No celular, as caixas de conteúdo; a 768 px, o conteúdo 1 e o multiplex; no computador, o conteúdo 1, as laterais (a 2ª só existe com 600 palavras) e o multiplex.
- **Por que não afrouxa.** A regra é uma tela de texto por anúncio que a pessoa vê. Uma caixa que só existe no celular não aparece no computador, e o contrário; somar as duas pedia texto para anúncios que ninguém vê juntos. No build `all`, contando todas as caixas, 89 das 184 páginas reprovariam; por largura, nenhuma, e a menor página com anúncio tem 495 palavras (o hub de guias em português, com 3 caixas no computador). O Victor deu o ok no `ESCOLHAS.md` (decisão avulsa "A conta do `gate:prontidao`").
- **O que o portão confere a mais:** no build `all` (anúncios ligados, parede desligada), nenhum HTML tem nada da parede (`fo-wall`, `fo-bait`, `fundingchoicesmessages`, `googlefc`, `oli-sad`), num item novo ("Nada da parede com a parede desligada"; o portão passou de 21 a 22 itens); e uma caixa do mapa (sem `<ins>` desde o plano B) conta como unidade numa página sem área.
- **Os testes** (`tests/unit/prontidao.test.ts`): o controle positivo de antes continua, e ganhou o do mapa (7 caixas, no máximo 4 por largura, passam com 600 palavras); um controle negativo no celular (4 caixas de conteúdo para 453 palavras reprovam só a 360 px) e um no computador (a lateral 2 numa página de 453 palavras reprova só a 1280 px); a parede no build `all`, peça por peça; a caixa do mapa numa página sem área.

## § 422 · Os testes do mapa: onde moram, as partes do CI e o custo (F12, decisão 11)

- **`tests/e2e/fo-ad-map.spec.ts`** (novo, 51 testes por navegador), no build de teste:
  - as 184 páginas com anúncio, em 31 blocos de 6 (um teste só para o site inteiro estoura os 60 s no WebKit do CI, § 306), cada página num primeiro acesso: o aviso de cookies aberto a 150 px ou mais do 1º anúncio a 360 × 740 e a 1280 × 800; depois, a 360 × 740, 768 × 1024, 812 × 375 e 1280 × 800, a densidade conservadora até 30 % (menos a 1280), 1.110 px entre anúncios de conteúdo, 150 px de cada caixa até os alvos do `ads.spec.ts`, as linhas do café, os controles do cabeçalho e o GuideCard do "Como usar", o multiplex a 150 px de toda grade e a 1.200 px do conteúdo 1 a 1280 px, nada acima da ferramenta, nenhuma caixa em grade, tabela, lista, pergunta, painel, cronograma ou faixa, nem colada em tabela ou depois de título, só as caixas da largura e o 1º anúncio no lugar do molde. As medidas de cada página vão para `test-results/ad-map/<navegador>/` (fora do Git), de onde sai a tabela do relatório;
  - no Chromium, a mesma abertura passa pelo `expectInitialBudget` de `tests/e2e/lib/budgets.ts` (os 80 KB com o inline do push). O WebKit abre a página sem a medida, porque os bytes são os mesmos, e o `budgets.spec.ts` e o `i18n-budgets.spec.ts` já conferem nos dois navegadores os arquivos e as requisições do build padrão, que o build de teste não muda (o mesmo `dist/_astro`). As páginas sem anúncio são iguais nos dois builds;
  - em fileorca.com (`serveAsProduction`, o carregador como stub vazio): uma página de cada molde e a home e uma ferramenta em pt e es, a 360, 768 e 1280 px: um `push` por caixa da largura, os `<ins>` com os atributos de cada formato, as caixas das outras larguras fora do DOM, e nada muda ao virar a janela; o mesmo número de caixas e de pushes no repouso e com o resultado; a lateral 2 só com 600 palavras, absoluta, sem grudar, e fora da página com a coluna curta (o controle corta o `<main>`);
  - a linha do café do rodapé a 150 px ou mais da âncora simulada (a faixa de 100 px no pé da tela, com a página no fim), a 360 e a 1280 px. Ela depende da linha no topo do rodapé (frente C) e só passa depois da junção.
- **`tests/e2e/layout-shift.spec.ts`** roda os mesmos primeiros acessos também no build de teste (um `describe` com o `useTestBuild`, 15 testes a mais por navegador), e imprime o CLS das duas versões lado a lado.
- **As partes do CI** (`--list` conferido): o `fo-ad-map.spec.ts` ordena depois do `events.spec.ts` e cai na parte 3 do Chromium (com o `header-menu.spec.ts`, que já usa o build de teste) e nas partes 6 (12 testes) e 7 (39) do WebKit; o `layout-shift.spec.ts` fica na parte 4 do Chromium e na 10 do WebKit, que passam a pagar o build de teste. O `design.spec.ts` (Chromium 3, WebKit 6) e o `image-matrix.spec.ts` (Chromium 4, WebKit 10) continuam em partes diferentes. O tempo de cada parte no CI vai no relatório, pelo `ci:custo`.

## § 423 · Os testes antigos que o mapa mudou (F12, no formato da § 341)

- **`tests/e2e/ads.spec.ts`.**
  - As medidas que olhavam a lateral com `.fo-ad--rail` olham a 1ª (`.fo-ad--rail:not(.fo-ad--rail2)`): a lateral 2 começa escondida, e só o push de fileorca.com a mostra. A proteção (a lateral à vista a partir de 1280 px) continua igual.
  - O teste das páginas sem anúncio protegia a home, o hub de guias, as jurídicas, as institucionais, o Apoie e as 404. A home e o hub de guias passam a ter anúncio (decisão 3, conferidos no `fo-ad-map.spec.ts`); a lista agora vem do mapa de rotas (toda rota sem área), tem 27 páginas, inclui o offline e o "Abrir com", e confere também que o HTML não tem o carregador nem o script de push.
  - Os testes dos hubs (imagem, PDF, dinheiro, casa e saúde) fixavam uma caixa de conteúdo só, abaixo da última grade. Agora fixam o 1º anúncio logo depois da 1ª grade (no hub de dinheiro, a de crédito) e toda caixa de conteúdo à vista abaixo dela, em cada largura; o de casa e saúde confere que toda caixa da página (conteúdo, multiplex e laterais) é da área `casa-saude`, no lugar das duas de antes.
  - O teste do rótulo confere o rótulo em toda caixa e no `aria-label` do `<aside>`, a altura da 1ª caixa de conteúdo e a da 1ª lateral.
  - Nas ferramentas de imagem, o teste de cada página ganhou a conferência do 1º anúncio logo depois do "Como usar" (§ 371).
  - O bloco do cabeçalho passou de 178 para 184 páginas (a home e o hub de guias entram pelo mapa de rotas), em 13 testes.
- **`tests/unit/ads.test.ts`.** O AdSlot recebe a unidade (`unit`) no lugar da variante, e a caixa não tem mais `<ins>` nem script: o teste confere a área, a unidade, o ID, o formato, nenhuma largura no 1º anúncio, nenhum papel e nenhum foco; o da lateral confere a largura de 1280 px no atributo e o 300 × 600 no script de push.
- **`tests/unit/ads-pages.test.ts`.** Contava dois `ins.adsbygoogle` nas ferramentas com as três variáveis; agora conta nenhum em todo estado e o script de push uma vez só com as variáveis. A home e o hub de guias saíram da lista sem anúncio e têm, com a área `geral` nas variáveis, as duas caixas e o push.
- **`tests/unit/guides-hub-route.test.ts`.** A rota tem a área `geral`, e a página do build padrão tem a coluna lateral (`fo-frame--rail`), vazia; continua sem caixa, sem `<aside>` e sem código de anúncio.
- **`tests/e2e/guides-hub.spec.ts`.** Só o comentário: o build padrão continua sem caixa.
- **`tests/unit/prontidao.test.ts`.** As mensagens do "Mais conteúdo que anúncio" passaram a dizer as larguras ("2 AdSlot(s) a 360 e 768 e 1280 px para…"): as caixas das páginas de mentira não dizem largura e contam em todas, como antes (§ 421).
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite mudou.**

## § 424 · A regra dos anúncios nos guias de arquivo, no `gate:conteudo` (F12, no formato da § 341)

- **O que a regra protegia** (`scripts/lib/file-guides.ts`): a ordem ferramenta → link da ferramenta → o AdSlot de conteúdo → "What we measured" → fontes → relacionadas, e no máximo dois AdSlots no `<main>`, para o guia não virar vitrine de anúncio e o anúncio nunca vir antes da ferramenta.
- **Como a proteção continua:** a ordem é a mesma (o 1º AdSlot de conteúdo entre o link da ferramenta e a seção medida); o 1º AdSlot tem pelo menos um parágrafo entre a ferramenta e ele; no máximo cinco AdSlots de conteúdo (`conteudo` a `conteudo-5`, os do mapa) e um multiplex, que é o último bloco do `<main>`; nenhuma lateral no `<main>`, nenhum AdSlot na ferramenta e nenhum ao lado de "What we measured". A densidade e os 1.110 px entre eles são medidos no `fo-ad-map.spec.ts`.
- **`tests/unit/conteudo.test.ts`.** O guia de mentira põe o AdSlot entre dois parágrafos da parte de texto (antes ele ficava colado em "What we measured", o que a regra nova recusa) e o multiplex no fim. O teste "um terceiro AdSlot" virou: o AdSlot antes da ferramenta, o AdSlot sem parágrafo depois dela, seis de conteúdo (e cinco passam), o multiplex fora do fim, dois multiplex, o AdSlot na ferramenta e o AdSlot dos dois lados de "What we measured", cada um com a sua mensagem.

## § 425 · O README do AdSlot e a seção "Layout e anúncios" do design system (F12, decisão 9)

- **`docs/design/components/AdSlot/README.md`.**
  - Antes: "A altura mínima é reservada antes do anúncio chegar (CLS ≤ 0,05): 280px no conteúdo, 600px na coluna lateral." Depois: as medidas de verdade, 300 px no conteúdo, 644 px na lateral (300 × 600 com o rótulo) e `floor(coluna × 0,6) + 44` px no multiplex.
  - Antes: "Variantes: `fo-ad--content` (responsiva, no meio do conteúdo, no máximo uma a cada duas telas) e `fo-ad--rail` (300×600…)". Depois: as variantes do mapa (`fo-ad--phone`, `fo-ad--multiplex`, `fo-ad--rail2`), cada uma com a largura em que vale, e os 1.110 px de borda a borda no lugar de "uma a cada duas telas".
  - Novo: "Sem ID, nada"; onde cada caixa entra; o plano B (as caixas por largura e o push único, só em fileorca.com); a lateral 2 (1.200 px abaixo da 1ª, 600 palavras, 2.638 px de coluna); o rótulo também no `aria-label` do `<aside>`; nenhum foco nem papel; a área `geral`; a lista "Nunca" com a grade, a tabela, a lista, a pergunta, o título, a tabela colada, "O que medimos" e as nove páginas livres.
- **`docs/design/README.md`, "Layout e anúncios".**
  - Antes: "O AdSlot é neutro (…) com altura reservada e `ad-clearance` (150px) de qualquer Baixar, campo, painel ou Oli." Depois: "…de qualquer Baixar, campo, painel, menu, Oli ou linha do café."
  - Novo: o mapa, molde a molde (o 1º anúncio de cada um, os seguintes só abaixo de 768 px a 1.110 px ou mais, o multiplex a partir de 768 px, as duas laterais a partir de 1280 px, a 2ª a 1.200 px da 1ª); a densidade até 30 % a 360 × 740, a 768 × 1024 e a 812 × 375, pela leitura conservadora da § 351.
  - Antes: "…ou nas páginas jurídicas." Depois: "…ou nas páginas livres (as jurídicas, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com")", e o aviso de cookies aberto a 150 px ou mais do 1º anúncio.

## § 426 · A parede: o componente `AdblockWall`, onde ele entra e o script inline (F12, decisão 5)

- **O nome** é `AdblockWall`, como os outros componentes do design system: `src/components/AdblockWall.astro` (a marcação), `src/ads/wall.ts` (o script, montado no build) e o bloco "F12 · a parede do bloqueador" do `src/styles/components.css`. No `docs/design/`, a pasta `components/AdblockWall/` (§ 433).
- **Onde entra.** A `BaseLayout` põe o componente no fim do `<body>`, depois do diálogo da busca, só com `withAds` e com `wallModeOf(buildAdsConfig())` diferente de `desligado`; a mesma condição acrescenta a `WALL_POSE` às poses do sprite. Sem as três variáveis, ou com a variável desligada, a página sai igual à de antes: nem o diálogo, nem a isca, nem o script, nem a pose. A home e o hub de guias ganham a parede quando passarem a receber `withAds` (frente do mapa). Na junção das três frentes, as duas passaram a receber (§ 419), e ganharam a parede.
- **A marcação** é a da especificação do `wall.html`, sem o que é só do protótipo (os `data-t`, a segunda pose, o `?modo=`): um `.fo-wall__oli` só, com a `sad` (`Oli.astro`). A isca é um `div` vazio, `aria-hidden`, com as classes `adsbox ad-banner textads` e o estilo inline que o põe fora da tela (1 × 1 px em `left: -9999px`), para não depender da folha de estilo. Nunca um `ins.adsbygoogle`.
- **O script** é um só, inline, no fim do `<body>`, montado por `wallScript({ lang, mode })` com o idioma e o modo do build; ES5, como os outros scripts inline. Nenhum arquivo JS novo. Ele traz a trava `location.hostname==="fileorca.com"` no texto exato que o `gate:prontidao` lê (§ 101 c-03): ele cita o `ins.adsbygoogle` do anúncio preenchido, e com a trava ele passa no portão em qualquer forma.
- **O `Ctrl+K`** não abre a busca por cima da parede: um `keydown` em captura, no `window`, para o atalho enquanto o diálogo está aberto. O `SearchDialog.astro` não muda. Alternativa recusada: o gatilho da busca olhar a parede, que espalharia a parede por outro componente.
- **O CSS** são as seções 1 a 4 do `wall.css`, com as fontes do site (`--fo-font-display`, `--fo-font-text`). O fundo escuro do `::backdrop` do protótipo (`[data-theme="dark"] .fo-wall::backdrop` e o espelho em `prefers-color-scheme`) reprovaria no `theme-pair.test.ts` (sem o par no mesmo elemento e fora de `@media screen`). Por isso o mar é uma variável própria do componente, `--fo-wall-sea`: a `water` em `:root`, o `deep` em `html[data-theme="dark"]` e em `html:not([data-theme="light"])` com `prefers-color-scheme: dark`, os dois dentro de `@media screen`. Não é token do design system (o `gate:design` vigia `--color-*`, `--radius-*`, `--shadow-*` e `--font-*`). O `::backdrop` não está no `*, *::before, *::after` do movimento reduzido do `global.css`, então ganha a sua linha. E o card ganhou `margin: auto`, que o `wall.css` não tinha: o preflight do site zera a margem de todo elemento, a do `:modal` do navegador inclusive, e sem ela o card ficava colado no alto da tela (a 360 px, 178 px mais perto do alto que do pé). O protótipo não via isso porque o `bundle.css` não tem o preflight.
- **Os textos** moram num arquivo por idioma, `src/i18n/<lang>/wall.ts` (`WallTexts` em `src/i18n/types.ts`), e não no `common.ts`: são 54 textos que só as páginas com a parede usam, e o `common.ts` é de todas as páginas e de outras frentes. O `lint:texto`, o glossário, o `english-leak.test.ts` e o `text-punctuation.test.ts` leem o arquivo novo pelo caminho.
- **O tamanho,** no build de teste: o script da parede tem 3.796 bytes (1.696 com gzip); a tag de recuperação, 522 (327); o diálogo e a isca, de 7.467 a 7.698 conforme o idioma (de 1.804 a 1.894); o `<symbol>` da `sad`, 902 (402). Todo o JS inline de uma página de ferramenta do build de teste soma 14.128 bytes (5.299 com gzip).

## § 427 · A detecção, a janela de 4 s, os modos e o escape (F12, decisão 5)

- **A ordem** é a da decisão 5. Offline, nada é detectado: o script nem começa com o `navigator.onLine` falso, e confere de novo na hora de abrir. O sinal do Google é o `googlefc.getAdBlockerStatus()` no `AD_BLOCK_DATA_READY` (o mapa na fila, nunca uma função solta, § 416), comparado pelos números (1 extensão, 2 rede, 3 sem bloqueador) e também pelos nomes do enum, o `EXTENSION_LEVEL_AD_BLOCKER` do exemplo do Google inclusive; um status que não é número, ou o 0, não decide nada. O sinal reserva é o `window.foAdsFailed` do carregador com a isca escondida (`offsetHeight` 0, ou a isca removida), os dois juntos.
- **A janela fecha 4 s depois do `load`.** O sinal do Google que chega antes do `load` espera o `load`; no `load` mais 4 s, ou o sinal reserva abre a parede, ou a detecção acaba, e uma resposta do Google depois disso é ignorada. Assim a parede abre "no máximo 4 s depois do `load`", como a especificação diz, e nunca no meio de uma tarefa. Alternativa recusada: deixar o sinal do Google abrir a qualquer hora, como o esboço (que não encerrava a detecção quando o reserva não valia). Se o `AD_BLOCK_DATA_READY` vier tarde em produção, o Victor vê no passo de teste do `docs/OPERACAO.md` (a parede só pelo sinal reserva).
- **O anúncio preenchido** (`ins.adsbygoogle[data-ad-status="filled"]`) é conferido na hora de decidir, em qualquer sinal, e não só no reserva, como no esboço: quem vê anúncio com o Acceptable Ads não é barrado nem quando o Google diz que há uma extensão.
- **A região** vem do `__tcfapi('addEventListener', 2.2, …)` (a versão do exemplo do Google): com `gdprApplies` verdadeiro, a parede espera o `tcloaded` ou o `useractioncomplete` e abre no aviso; com `gdprApplies` falso vale a variável; sem o `__tcfapi`, sem resposta válida ou sem `gdprApplies` booleano, vale o fuso do aparelho (§ 428). Se a mensagem de consentimento nunca termina, a parede não abre naquela página: é de propósito, para nunca a cobrir.
- **Os modos.** O `NETWORK_LEVEL_AD_BLOCKER` e a região dão o aviso; a extensão e o sinal reserva seguem a variável. O Esc no bloqueio tem as três camadas da § 369 (`closedby="none"`, o `cancel` com `preventDefault()` e o `close` que reabre, com o foco de volta no recarregar) e uma quarta: o `keydown` do Esc é cancelado em captura enquanto a parede está aberta no bloqueio, porque o pedido de fechar não é processado quando o `keydown` é cancelado (HTML, "close requests"), o que tira também o piscar de um fechar e reabrir. No aviso, o `closedby="closerequest"`, o Esc e o botão de fechar fecham; tocar na água não.
- **O foco ao fechar.** O navegador devolve o foco para onde ele estava antes de a parede abrir. Quando não havia foco (a parede abre sozinha), o script põe `tabindex="-1"` no `<main>` e o foco nele, depois de o navegador terminar (um `setTimeout` de 0: no Chromium o foco ainda está no botão do diálogo fechado durante o evento `close`). O atributo só entra nessa hora, nunca no HTML.
- **O escape.** O "Usar só desta vez" grava `Date.now()` na chave `fo-wall-escape` (a única chave da parede; sem depender do aviso de cookies, § 49) e fecha a parede. Na abertura de cada página: se o escape tem menos de 30 minutos (e não está no futuro, para um relógio voltado para trás não liberar para sempre), a página fica livre até a próxima navegação, porque a conferência é só no carregamento; se ele é do mesmo dia local e passou dos 30 minutos, a parede abre com a classe `fo-wall--escaped` (sem o botão, com a linha de "volta amanhã"); no dia seguinte, o botão volta. Sem `localStorage`, a gravação falha em silêncio, a página aberta fica livre e a próxima abre a parede com o botão.

## § 428 · A região no aparelho e a c-04 pela saída A (F12, decisões 5 e 8)

- **Um ajudante só,** `src/platform/region.ts`, para a parede e para o consentimento: a lista da seção A (`Europe/*`, `Atlantic/Azores`, `Atlantic/Madeira`, `Atlantic/Canary`, `Atlantic/Reykjavik` e `Atlantic/Faroe`) mais o `Africa/Ceuta`. O fuso é lido só no aparelho, dentro de cada script inline (`gdprZoneJs()`), e nunca vai para evento, URL ou armazenamento (os testes conferem o `dataLayer` e o `localStorage`). Um fuso que não dá para ler conta como dentro, o lado seguro dos dois usos.
- **Por que o `Africa/Ceuta`:** é o fuso de Ceuta e Melilla, que são Espanha (o Google os localiza como ES). Fora da lista, quem mora lá teria a parede em bloqueio e o Aceitar reaplicado nos `ad_*`. Dentro, a parede vira aviso (o lado mais brando) e o consentimento fica mais estrito: os dois lados são os seguros. As regiões ultraperiféricas da UE com fuso da América ou do Índico (Reunião, Guadalupe e as outras) ficam fora da lista: o Google as localiza com códigos próprios, que a § 9 também não lista.
- **A c-04, pela saída A.** O cliente não sabe o país. Três caminhos foram pesados:
  - **A1 ao pé da letra** (onde o fuso diz região negada, o Aceitar e o Recusar reaplicam só o `analytics_storage`). Risco: a lista `Europe/*` pega países fora das 32 regiões (Rússia, Turquia, Ucrânia, Sérvia…), onde o padrão dos `ad_*` é concedido; ali um Recusar deixaria os `ad_*` concedidos. Isso afrouxa a escolha de quem recusou. Recusado;
  - **A2, sem região** (o Aceitar reaplica só o `analytics_storage` em todo lugar). Sem falso negativo, mas fora das regiões o comando muda (o efeito é o mesmo, porque lá os `ad_*` já nascem concedidos), e um Recusar seguido de um Aceitar na mesma página deixaria os `ad_*` negados até a próxima página. Não cumpre "fora dessas regiões, nada muda" ao pé da letra, e não usa o ajudante de região;
  - **a escolhida:** onde o fuso diz região negada, o Aceitar vai só ao `analytics_storage`; o Recusar vai às quatro chaves em todo lugar (um `denied` não concede nada, e nas regiões negadas os `ad_*` já são negados por padrão, então a mensagem do Google, que chega depois, continua decidindo); fora das regiões, o Aceitar segue com as quatro chaves, como antes.
- **Os riscos da escolhida.** O falso negativo (quem mora numa região negada com o fuso do aparelho fora da lista, como quem viaja) fica como antes, com a c-04 aberta só para essa pessoa: nada afrouxa em relação a hoje. O falso positivo (um fuso `Europe/*` fora das 32 regiões) manda só o `analytics_storage` no Aceitar, e os `ad_*` ficam com o padrão concedido daquelas regiões: o mesmo estado de antes. O único desvio é estrito: um Recusar seguido de um Aceitar na mesma página, num falso positivo, deixa os `ad_*` negados até a próxima página.
- **Um lugar só para a atualização:** o bootstrap do `<head>` (`consent.ts`) define `window.foConsent(v)`, que a reaplicação da escolha guardada usa antes do `config`, e o `apply()` do `CookieNotice.astro` chama o mesmo. Os dois mudaram juntos, como a decisão 8 pede.

## § 429 · A f-06: o aviso reaberto acompanha a largura (F12, decisão 8)

- **O que mudou:** no `CookieNotice.astro`, o `addEventListener('resize', reserve)` e o `ResizeObserver` do aviso passaram para antes do `return` de quem já tem a escolha guardada. Antes, quem voltava com a escolha feita e reabria o aviso pelo "Change my cookie choice" ficava com a reserva calculada uma vez, na largura daquela hora.
- **Por que é seguro:** com o aviso escondido e sem âncora, o `reserve()` zera tudo (`scroll-padding-bottom` vazio e sem `--fo-bottom-room`); o teste `released()` do `cookie-footer.spec.ts` continua passando.
- **O teste** (`cookie-footer.spec.ts`): em `/es/privacidad/`, a escolha feita, a página recarregada (a visita de quem já escolheu), o aviso reaberto pelo botão a 1280 px e a largura mudada para 320 px: o `scroll-padding-bottom` segue a altura nova do card, e o último link do rodapé, com foco, fica acima dele. No `dist/` do ponto de partida ele reprova nos dois navegadores ("320 px: a reserva segue a largura"). A primeira versão do teste reabria o aviso na mesma página da primeira escolha e passava sem a mudança, porque os ouvintes da primeira visita ainda estavam lá; por isso o recarregar.

## § 430 · A tag de recuperação e o `onerror` do carregador (F12, decisão 5)

- **A forma** é a da § 416, num script inline próprio depois do carregador, no `AdsenseHead.astro`: com a trava `if(location.hostname==="fileorca.com")`, ele cria o script `async` de `https://fundingchoicesmessages.google.com/i/pub-…?ers=1` (o ID do editor sem o `ca-`, o mesmo corte do `ads.txt`, em `recoveryTagSrc()` de `src/ads/wall.ts`) e a `iframe` escondida `googlefcPresent`, que espera o `body`. Tudo dentro de uma função, sem variável global. Nenhum `<script src>` do Google no HTML. O "error protection code" não entra (§ 416).
- **O `onerror` de uma linha** (`s.onerror=function(){window.foAdsFailed=true;};`) entra no carregador do `adsbygoogle.js`.
- **Os dois só existem com a parede ligada** (`wallModeOf` diferente de `desligado`), numa página com anúncio e com o ID. Alternativa recusada: o `onerror` em todo carregador. Ele é metade do sinal da parede; com a parede desligada, o build `all` do `gate:prontidao` sai como antes, sem nada dela.

## § 431 · Os textos da parede, os passos da ajuda e a Privacidade (F12, decisões 5 e 10)

- **Os textos** são os da decisão 10, com o ajuste 3, e os da especificação para o "Fechar", o título e a dica do painel, a linha de depois do escape (que cita o escape com o nome novo) e os nove passos. O inglês usa o apóstrofo reto, como o resto dos textos do site. O espanhol diz "En el celular" na nota do Brave: a especificação dizia "móvil", que a tabela Nunca do `docs/i18n/es.md` proíbe. Nenhum texto tem "click", "clique" ou "clic", nem "Aviso" ou "Atenção" no título, nem fala do café (`tests/unit/wall.test.ts`).
- **Os passos "a conferir"** da especificação, lidos com o WebFetch em 4/nov/2026:
  - **AdBlock:** o inglês "Pause on this site", a pausa de 7 dias que se renova e a página que recarrega sozinha estão na ajuda (`helpcenter.getadblock.com/adblock-help-center/pausing-and-unpausing-adblock`); a ajuda só existe em inglês. Os nomes em português e espanhol foram conferidos nos arquivos de tradução da extensão (`github.com/betafish-inc/adblock-releases`, `_locales/pt_BR` e `_locales/es`, a chave `domain_pause_adblock`): "Pausar nesse site" e "Pausar en este sitio web", os mesmos da especificação;
  - **Safari no iPhone e no iPad, a nota do bloqueador de conteúdo:** a página da Apple (`support.apple.com/guide/iphone/iphab0432bf6/ios`, também em pt-br) não devolveu o texto do artigo ao WebFetch, só o índice do guia. A ajuda do 1Blocker (`support.1blocker.com/en/articles/9312049`) confirma, em inglês, o caminho pelo botão à esquerda do endereço e a chave "Use Content Blockers", e diz que vale para iPhone e iPad. Os nomes em português ("Usar Bloqueadores de Conteúdo") e em espanhol ("Usar bloqueadores de contenido") não foram conferidos: ficam com o texto da especificação e vão para o grupo 21 do `docs/PENDENCIAS.md`;
  - **Safari no Mac** (não estava marcado, conferido de passagem): "Safari > Ajustes", "Sites", "Bloqueadores de Conteúdo" e "Desligado" na ajuda da Apple em pt-br, e "Safari > Configuración", "Sitios web", "Bloqueadores de contenido" e "No" em es-mx.
- **A Privacidade,** nos três idiomas: o parágrafo do ajuste 1 (com o nome novo do escape) na seção dos anúncios, depois do parágrafo da mensagem de consentimento do Google; o aviso da Oli na lista de eventos do Google Analytics ("quando ele aparece e qual dos seus botões foi usado"); e o "Usar só desta vez" na lista do que fica guardado. O texto não escreve o nome da chave (`fo-wall-escape`): a Privacidade é uma página livre do build padrão, onde o `default-build.test.ts` reprova qualquer `fo-wall` (§ 413). Alternativa recusada: afrouxar esse teste para aceitar o nome da chave. A chave está no código, neste § e no README do componente. A data passou a 4 de novembro de 2026 nos três idiomas (o `calc-defs.test.ts` muda junto, § 434). A frase do Analytics sem cookies que o `gate:prontidao` lê não mudou.
- **O glossário** (`docs/i18n/pt.md` e `es.md`) ganhou a seção da parede, antes do pedido de café: os botões, o título, o bloqueador e os nomes do Safari e do AdBlock em cada idioma.

## § 432 · O evento `adblock_wall` (F12, decisão 5)

- **A lista fechada** fica no `src/analytics/events.ts`: `EVENT_PARAMS.adblock_wall` com `action`, `mode` e `lang`; `WALL_ACTIONS` (`shown`, `reload`, `help`, `escape`) e `WALL_EVENT_MODES` (`aviso`, `bloqueio`) no `CLOSED_VALUES`, para o `cleanParams` descartar qualquer outro valor; o `EventMap` com os tipos. Sem `close` (o ajuste 4 não entrou).
- **Quem manda** é o script inline da parede, pelo `window.foTrack` (que só deixa passar os nomes da lista), com valores escritos no próprio script: o `shown` ao abrir, o `help` só quando o painel abre, o `reload` antes do `location.reload()` e o `escape`. O `lang` é o da página, posto no build. Nenhum evento leva hora, fuso ou região.
- **O custo:** o `events.ts` está no pedaço comum das ilhas, que cresceu 149 bytes (82 com gzip) com as duas listas.

## § 433 · A parede no `docs/design/` e a regra nova do Button (F12, decisão 9)

- **O componente novo:** `docs/design/components/AdblockWall/README.md` (onde, quando, os modos, o escape, a anatomia, os tokens, o teclado, o movimento, o texto e o "Faça / Não faça"), o `preview.html` (o bloqueio, e o aviso do dia do escape com a ajuda aberta, desenhados no lugar sobre o mar) e o estilo no `bundle.css`, com o escuro dentro de `@media screen`. A tabela de `docs/design/components/README.md` ganhou a linha.
- **A regra do Button que mudou** (`docs/design/components/Button/README.md`), que o Victor aceitou no `ESCOLHAS.md`:
  - antes: "`fo-btn--brand` · Escolher arquivos, dentro da DropZone. Um por tela.";
  - depois: "`fo-btn--brand` · Escolher arquivos, dentro da DropZone, e o "recarregar" da parede do bloqueador (AdblockWall). Um por tela.";
  - e no tamanho, antes: "`button-lg` (60px) para Baixar e Escolher"; depois: "`button-lg` (60px) para Baixar, Escolher e o recarregar da parede".

## § 434 · Os testes da parede e do consentimento, e os testes antigos que mudaram (F12, decisão 11; formato da § 341)

- **Os testes novos:**
  - `tests/e2e/fo-wall.spec.ts` (36 por navegador), no build de teste visto como fileorca.com, com o `googlefc` respondido por um stub de cada status (`tests/e2e/lib/wall.ts`): o sinal do Google (extensão em bloqueio, o nome do exemplo do Google, rede em aviso, sem bloqueador, desconhecido e resposta depois da janela), o sinal reserva (os dois juntos abrem; só o `error`, o caso do Googlebot, e só a isca não abrem), onde nunca abre (anúncio `filled`, offline, as páginas livres e o mesmo build em 127.0.0.1), o escape com o `page.clock` (30 minutos, a página livre até a próxima navegação, a volta sem o botão às 23h59 e o botão de volta depois da meia-noite local) e sem `localStorage`, a região (o `__tcfapi` que espera o `useractioncomplete`, o `tcloaded`, o `gdprApplies` falso e três fusos europeus pelo `timezoneId`), o teclado e o Esc (o foco preso, o `<main>` ao fechar, dois e três Esc no bloqueio, o `Ctrl+K`, o `aria-expanded` e o rodapé à vista), a cara (alvos de 48 px, o card a 16 px das bordas do celular, no meio da altura e sobre a coluna da ferramenta a 1280 px, nada em `sun`, nenhum `ins`, `.fo-ad` ou link no diálogo, o mar a 92 %, a rolagem travada sem deslocamento, a Oli da página escondida, a entrada de até 480 ms e nada com o movimento reduzido), a `sad` no sprite só das páginas com a parede, com até 4 KB, e o axe nos dois temas, a 360 e a 1280 px, no bloqueio, no aviso, com a ajuda aberta e depois do escape. O nome cai na parte 3 do Chromium e na 7 do WebKit, as mesmas do `header-menu.spec.ts`, que já paga o build de teste;
  - `tests/e2e/events.spec.ts`, um bloco `adblock_wall` (2 por navegador, na parte 3 do Chromium e na 7 do WebKit): cada ação com o modo e o idioma, só com as chaves da lista, através de um recarregar, e o Esc que não manda nada;
  - `tests/e2e/consent.spec.ts`, a c-04 em três fusos europeus (6 por navegador), e `tests/e2e/cookie-footer.spec.ts`, a f-06 (1 por navegador);
  - `tests/unit/wall.test.ts` (26): a parede nos oito estados das variáveis (só com as três e a parede ligada, só nas páginas com anúncio), a tag e o `onerror`, a marcação em cada idioma e modo, os textos (a lista "click", "clique" e "clic", a voz, nada do café), a Privacidade do ajuste 1 nos três idiomas e o script (a trava, a chave única, o fuso que não sai do aparelho);
  - `tests/unit/consent.test.ts`, a c-04 (4 testes, com o fuso dado ao `vm`) e a lista fechada do `adblock_wall` (1).
- **Reprovam sem a mudança:** a c-04 do `consent.spec.ts` reprova no `dist/` do ponto de partida nos dois navegadores (o Aceitar manda as quatro chaves), e o bootstrap daquele `dist/`, rodado como o `consent.test.ts` roda, dá as quatro chaves no `Europe/Berlin`; a f-06 reprova nos dois navegadores (§ 429); o teste do lugar do card reprova sem o `margin: auto` (§ 426); os testes da parede e do evento não têm o que abrir no ponto de partida (não há diálogo, script nem lista), e cada caso de "não abre" tem ao lado o caso que muda uma coisa só e abre (o Googlebot e o reserva, o `filled` e a extensão, o offline e a extensão, 127.0.0.1 e fileorca.com, a página livre e a ferramenta).
- **Os testes antigos que mudaram:**
  - **`tests/unit/consent.test.ts`.** Fixava a lista dos 9 eventos e o conjunto dos nomes de parâmetro. Agora a lista tem o `adblock_wall` e os nomes têm `action` e `mode`; a proteção continua: cada um dos dois é de lista fechada, e um valor fora dela é descartado (o teste novo da lista fechada). O `runBootstrap` ganhou o fuso, com padrão fora da Europa, e as asserções de antes (os padrões antes do `config`, o Recusar reaplicado, o `gtag.js` só em fileorca.com, o `foTrack`) não mudaram.
  - **`tests/unit/calc-defs.test.ts`.** Fixava a data "3 de novembro de 2026" da Privacidade; agora "4 de novembro de 2026", o dia da mudança da Privacidade (§ 431), com a linha no comentário histórico; a proteção (a data muda com o texto, sem ordinal, § 230) continua.
  - **`tests/e2e/consent.spec.ts`.** Os testes de antes (o Aceitar e o Recusar com as quatro chaves) passaram a rodar num fuso fixo fora da Europa (`America/Sao_Paulo`), porque o Aceitar agora depende do fuso do aparelho; as asserções não mudaram.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite mudou.**

## § 435 · O café sai do gatilho de quem bloqueia anúncio (F12, decisão 7)

- **Decisão:** a Mudança 11 do `PLANO-MELHORIAS.md`. Quem bloqueia anúncio segue a regra de todo mundo: o pedido no 3º uso com sucesso, depois no máximo uma vez a cada 7 dias, nunca depois do "Não mostrar de novo" e só com o Aceitar do aviso (§ 49 e § 101). Quem bloqueia vê a parede (UX-06), e o café nunca é a saída dela. Fecha a F3 c-08: o falso positivo do ramo `!adsbygoogle.loaded` (um carregador ainda carregando, ou que só falhou, lido como bloqueador) deixa de existir porque a detecção do café saiu.
- **O que saiu:**
  - em `src/tools/image/coffee.ts`, o `isAdBlocked`, o campo `adsBlocked` do `CoffeeContext`, o limiar `context.adsBlocked ? 1 : USES_BEFORE_ASKING` (fica só o `USES_BEFORE_ASKING`) e o parâmetro de `countUse` (agora `countUse(now?)`);
  - nas duas ilhas (`ImagePanel.tsx` e `PdfPanel.tsx`), o `adBlocked(adsOn)`, que lia `window.adsbygoogle.loaded` e a altura do `ins` da caixa de conteúdo, e o import do `PRODUCTION_HOSTNAME`, que só servia a ele;
  - a prop `adsOn` do `ImagePanelData` e do `PdfPanelData`, e o `buildAdsConfig()` que a preenchia em `src/tools/image/page.ts` e `src/tools/pdf/page.ts`. A ilha não recebe mais nada da configuração dos anúncios.
- **Alternativa recusada:** manter o 1º uso com a detecção da parede (§ 416). A Mudança 11 tira o café desse gatilho, e ligar o pedido de dinheiro à detecção de bloqueio faria do café uma resposta à parede, o que o prompt proíbe ("o café não tira a parede").
- **A Privacidade não muda:** o parágrafo da contagem (`src/i18n/<lang>/privacy.ts`) já dizia "só a partir do terceiro e no máximo uma vez por semana", sem citar o gatilho do bloqueador.
- **Os testes:**
  - `tests/unit/coffee.test.ts`: o contexto com `adsBlocked: true` (que a regra agora ignora) dá o pedido só no 3º uso, e o módulo não tem mais `isAdBlocked` nem um parâmetro de bloqueio no `countUse`. No código de partida, `{ uses: 0 }` com `adsBlocked: true` dava `show: true`;
  - `tests/e2e/ads-coffee.spec.ts` (novo): no build de teste visto como fileorca.com (§ 414), com o carregador do AdSense e a tag de recuperação abortados, como faz um bloqueador, e a isca visível (a parede, que pede os dois sinais, fica fechada), o 1º e o 2º uso não mostram o café e o 3º mostra. No código de partida, o mesmo caso dava o café no 1º uso (`adsOn` ligado no build de teste, o host de produção e o carregador sem `loaded`). O nome `ads-*` põe o spec ao lado do `ads.spec.ts`, nas partes do CI que já fazem o build de teste (Chromium 1, WebKit 3), e ele soma um teste por navegador.

## § 436 · A linha do café no ResultCard: os textos, um botão e a confirmação (F12, decisão 7)

- **Onde fica, como antes:** dentro do ResultCard, no fundo `deep`, depois do Baixar, do Começar de novo e das notas (e da comparação, a partir de 768 px, na imagem). O bloco é o mesmo nas duas ilhas; calculadoras e QR continuam sem a linha (§ 130).
- **Os textos** são os da seção C, sem mudar uma vírgula, e a confirmação nova da especificação (§ 441). O botão é neutro (`fo-btn`, nunca `sun` nem `brand`): o Ko-fi em inglês e espanhol (`KOFI_URL`, § 3), e em português só o Pix, para `/pt/apoie/#pix`. O card em português já tinha um botão só desde a F6 (§ 216); o teste dele não reprova no ponto de partida por esse lado, mas reprova pelo texto.
- **A confirmação:** o ghost "Não mostrar de novo" grava `never` como antes (com ou sem consentimento) e põe no lugar da linha `<p class="fo-result__support--done" role="status">` com a frase, e o foco volta ao Baixar.
  - No modelo das ilhas, o `coffee: boolean` virou `coffee: CoffeeLine` (`''`, `'ask'` ou `'done'`, tipo exportado de `coffee.ts`), zerado nos mesmos lugares de antes (lote novo e Começar de novo). A frase fica enquanto o card fica (uma opção que roda o lote de novo não a tira) e sai no próximo lote.
  - **Antes:** a linha sumia e o foco ia ao Baixar, sem dizer nada.
  - **Alternativa recusada:** deixar uma região `status` vazia montada desde que a linha aparece, para o texto entrar numa região que já existe. Ela pede um terceiro nó no card, que ocuparia um `gap` vazio ou um ajuste de margem. Ficou a marcação da especificação; a leitura por leitor de tela de verdade (NVDA, VoiceOver) não foi conferida nesta run e vai como pendência para o relatório.
  - O CSS (`components.css`) é o da especificação: o fio de cima, 15/22 px e `on-deep-muted`, como a linha.
- **O teclado:** Download, Começar de novo, o botão do café e o "Não mostrar de novo", nessa ordem; o Enter no ghost leva a frase e o foco ao Baixar. O ghost do site tem 52 px (herda o `fo-btn`), acima dos 48 da especificação: nada muda.
- **O orçamento:** a ilha não cresce, encolhe, porque a detecção do bloqueador saiu (§ 442).
- **Os testes:** em `tests/e2e/coffee.spec.ts`, por idioma, um link só na linha, com o destino e o texto, o Enter no ghost, a linha que sai, a frase com `role="status"` no lugar dela (depois das ações do card), o foco no Baixar, o `never` gravado e o axe com a frase na tela a 360 e 1280 px nos dois temas; e um teste numa ferramenta de PDF em português (Girar PDF), com o Pix sozinho e a mesma confirmação. No ponto de partida, a frase não existe e os textos são outros.

## § 437 · A linha do café no topo do rodapé (F12, decisão 7; fecha a F10 p-6)

- **Antes:** o link do café ficava na base do rodapé (`.fo-footer__base`), ao lado da assinatura, com o alvo de 32 px da linha dos links; com os anúncios ligados, ele ficava a 24 a 46 px da âncora do AdSense com a página no fim (F10 p-6).
- **Depois:** `<p class="fo-footer__coffee-row">` abre o rodapé, antes das colunas, com o mesmo `<a class="fo-footer__coffee">` (a classe que o teste do mapa mira), o mesmo destino (a página de apoio do idioma) e o mesmo `data-track="donate_click"` com o lugar `footer`. Ele é o primeiro link do rodapé. A base fica só com a assinatura.
- **A medida:** a linha tem as bordas das colunas (`max-width: var(--page-max)`, como o resto do rodapé, § 409) e um fio `on-deep-muted` a 30 % embaixo; o link tem `min-height: var(--tap-min)` (48 px), 16/22 px em negrito e o ícone `coffee` de 24 px. Medido no Chromium, com a faixa de 100 px da âncora no pé da tela e a página rolada até o fim: 2.002 px (en), 1.456 px (pt) e 1.490 px (es) até a âncora a 360 px, e 370 px a 1280 px, com o alvo de 48 px nos dois.
- **Os testes:** em `coffee.spec.ts`, em `/about/`, `/pt/sobre/`, `/es/acerca-de/` e `/compress-image/`, a 360 e a 1280 px: a linha é o primeiro filho do rodapé e fica acima das colunas, o primeiro link do rodapé é o do café, com o texto da seção C, 48 px de alvo e 150 px ou mais até a âncora simulada (a classe `fo-footer--anchor` e um `ins` fixo de 100 px, como o `cookie-footer.spec.ts`). O teste das bordas do `header-menu.spec.ts` passou a medir também a linha nova (§ 443).

## § 438 · A página de apoio: o título, o texto, a Oli à direita e a trilha (F12, decisão 7)

- **Os textos** são os da seção C, como estão (a decisão avulsa "o texto da página de apoio"): o título "Help Oli keep swimming" e o texto que diz "Ads cover the costs; every coffee becomes the next tool." O ajuste opcional sem a primeira metade não entrou. O botão do Ko-fi passa a "Buy me a coffee" · "Me ajude com um café (Ko-fi)" · "Ayúdame con un café". A nota do Ko-fi, "Quem está por trás", "O que o próximo café paga" e o Pix não mudam. O `title` e a `description` da página também não: a especificação não os cita, e o `gate:seo` conta o tamanho deles.
- **A trilha** passa a dizer "Support Oli" · "Apoie a Oli" · "Apoya a Oli", o nome do item do Menu (especificação do `support.html`). Ela lê o `common.header.support`, sem chave nova; o JSON-LD da trilha muda junto. Antes, a trilha repetia o H1.
- **A Oli `coffee`** vai para a direita do título, na mesma linha (`.fo-support__head`, flex), olhando para a esquerda, para o texto, com 96 px e 128 px a partir de 768 px. Antes ela ficava em cima do título no celular e numa coluna própria a partir de 768 px, olhando para fora do card. O `.fo-support` deixa de ser grade e vira uma coluna (`display: block`); a classe `fo-support__oli` e o `aria-hidden` ficam.
- **O botão do Ko-fi** em português quebrava em duas linhas a 360 px com o "(Ko-fi)" partido no hífen ("(Ko-" e "fi)"). A última palavra do rótulo vai num `<span class="fo-support__last">` com `white-space: nowrap`: o texto e o nome acessível não mudam. O botão tem 52 px de qualquer jeito.
- **Os testes:** em `coffee.spec.ts`, nas três páginas, a 360 e a 1280 px, o texto da seção C, a trilha com o nome do Menu e a Oli à direita do título, na faixa vertical dele, com 96 ou 128 px. No ponto de partida, a Oli fica à esquerda (ou acima) e a trilha diz o H1 antigo.

## § 439 · O vapor da caneca para sozinho em 4,8 s (F12, decisão 7; a parte do vapor da F3 d-02)

- **Antes:** `.oli-steam path { animation: fo-steam 1800ms … infinite }`, um laço sem fim (F3 d-02, WCAG 2.2.2).
- **Depois:** o CSS da especificação. O 1º fio sobe duas vezes (de 0 a 3,6 s) e assenta (de 3,6 a 4,2 s, `fo-steam-rest`, `forwards`); o 2º, 0,6 s atrás, assenta em 4,8 s. Depois disso o vapor fica parado e visível. Só `transform` e `opacity` (o `gate:design` confere); com o movimento reduzido, o `animation: none` do `global.css` deixa o vapor parado desde o começo, como antes. O seletor continua global (a animação dentro de um `<use>` mira o elemento do `<symbol>`, `docs/claude/design-e-oli.md`).
- **A `wave` da Oli** (o outro laço da d-02) não é desta run e continua aberta.
- **O teste:** o "support page: the coffee steam rises in a loop" do `design.spec.ts` virou "rises, then rests, still and visible, by 4.8 s" (§ 443): o vapor anima no começo; toda animação dele termina (o `endTime`) em até 4.800 ms; depois disso nenhuma animação da página está com o `playState` "running"; e os dois fios ficam com opacidade 1, no lugar. Medido: 4 animações, a última termina em 4.800 ms, nos dois navegadores. No ponto de partida, o `endTime` é infinito.

## § 440 · O Pix: o rótulo visível, o "Copiar código" de 52 px antes do QR no celular e o QR de 160 px (F12, decisão 7; fecha a F10 p-4 e a parte do Pix da F5a D-12)

- **O rótulo:** antes, "Pix copia e cola: " era um `<span class="fo-sr">` dentro do campo do código. Agora é `<p class="fo-pix__label">Pix copia e cola</p>`, visível, logo acima do código, sem `aria-labelledby` no `<code>` (o axe reprova, `aria-prohibited-attr`; `docs/claude/design-e-oli.md`).
- **O botão:** o "Copiar código" deixa o `fo-btn--sm` (40 px, que o README do Button reserva ao computador) e vira um `fo-btn` comum, de 52 px.
- **A ordem:** no celular, o rótulo, o código, o botão e o recebedor vêm primeiro e o QR depois (o celular que lê a página não fotografa a própria tela); a partir de 768 px, o QR vem primeiro, à esquerda, com 160 px (antes, 112 px). A ordem é do CSS (`order` no `.fo-pix__side`), e o HTML continua com o QR antes, como na marcação da especificação; o QR não recebe foco, então a ordem do Tab é a mesma. No celular o QR continua com 112 px, como no protótipo.
- **O card do Pix** ganha o fio de cima (`hairline`) e 24 px embaixo; o status do "Copiar" tem 15/22 px em `ink`. Os seletores que os testes e o `pnpm screenshots` leem (`.fo-pix`, `.fo-pix__side`, `svg.fo-pix__qr`, `[data-pix-copy]`, `.fo-pix__status`, `#pix`, `.fo-pix-card .fo-seg__opt`) ficaram.
- **O Ko-fi** fica depois do Pix, na mesma página (a decisão avulsa: o card em português leva só o Pix, e o Ko-fi fica ao lado do Pix na página de apoio).
- **Medido no Chromium (o valor "Qualquer valor"):** a 360 e a 390 px, o "Copiar código" de 581 a 633 px (52 px) e o QR de 112 px em y 679; a 768 e a 1280 px, o botão de 562 a 614 px (52 px) e o QR de 160 px em y 487, à esquerda.
- **Os testes:** em `tests/e2e/money-pix.spec.ts`, um teste novo, a 360, 390, 768 e 1280 px e em cada valor: o botão com 52 px ou mais; abaixo de 768 px, o botão e o código acima do QR, e o QR com 112 px; a partir de 768 px, o QR à esquerda do botão, com 160 × 160 px; e nenhum `fo-btn--sm` no Pix. O teste do rótulo mudou (§ 443). No ponto de partida, o botão tem 40 px e vem depois do QR.

## § 441 · Os textos do café nos três idiomas, o glossário e as regras (F12, decisões 7 e 10)

- **Os textos finais**, nos arquivos de tradução (`src/tools/image/i18n/<lang>.ts`, `src/tools/pdf/i18n/<lang>.ts`, `src/i18n/<lang>/common.ts` e `support.ts`), com as mesmas chaves e uma nova, `result.coffee.done`, nos seis arquivos dos painéis e nos dois tipos (`ImagePanelTexts` e `PdfPanelTexts`):

  | Peça | en | pt | es |
  | --- | --- | --- | --- |
  | Card | FileOrca is made by one person, with no sign-ups and no limits. If Oli saved you some time, would you help me with a coffee? | O FileOrca é feito por uma pessoa só, sem cadastro e sem limite. Se a Oli te ajudou, me ajuda com um café? | FileOrca lo hace una sola persona, sin registros ni límites. Si Oli te ahorró tiempo, ¿me ayudas con un café? |
  | Botão do card | Buy me a coffee | Pagar um café no Pix | Ayúdame con un café |
  | Ghost | Don't show this again | Não mostrar de novo | No mostrar de nuevo |
  | Confirmação (nova) | Got it, I won't ask here again. The coffee link stays in the footer. | Combinado, não peço mais aqui. O link do café fica no rodapé. | Entendido, no vuelvo a pedirlo aquí. El enlace del café queda en el pie de página. |
  | Rodapé | Help keep FileOrca free: buy me a coffee | Me ajude a manter o FileOrca grátis: paga um café? | Ayúdame a mantener FileOrca gratis: invítame un café |
  | Título da página de apoio | Help Oli keep swimming | Me ajude a manter a Oli nadando | Ayúdame a que Oli siga nadando |
  | Texto da página de apoio | FileOrca is free, with no sign-ups and no limits, and it's made by one person in Curitiba, Brazil. Ads cover the costs; every coffee becomes the next tool. | O FileOrca é grátis, sem cadastro e sem limite, e é feito por uma pessoa só, em Curitiba. Os anúncios pagam os custos; cada café vira a próxima ferramenta. | FileOrca es gratis, sin registros ni límites, y lo hace una sola persona en Curitiba, Brasil. Los anuncios cubren los costos; cada café se convierte en la próxima herramienta. |
  | Botão do Ko-fi | Buy me a coffee | Me ajude com um café (Ko-fi) | Ayúdame con un café |
  | Trilha (o Menu, já da F11) | Support Oli | Apoie a Oli | Apoya a Oli |

- **Os desvios do glossário que a seção C impõe:** o glossário pede botão que começa com verbo no infinitivo, e o botão do Ko-fi em português é "Me ajude com um café (Ko-fi)"; vale a seção C, "sem mudar uma vírgula". O "Botão do card" em português é o segundo rótulo da seção C (o Pix), como a § 368 registrou.
- **O glossário** (`docs/i18n/pt.md` e `es.md`) ganhou os textos novos nas tabelas do pedido de café; as tabelas "Nunca" não mudaram, porque o `glossary.test.ts` não pediu termo novo (nenhum texto novo tem um termo proibido).
- **As regras, num teste novo** (`tests/unit/coffee-texts.test.ts`): ele lê a tabela da seção C do `PLANO-MELHORIAS.md` e compara cada texto dos três lugares, nos três idiomas, com ela (o card das duas ilhas, o rodapé, o Menu, o título, o texto e o botão do Ko-fi); compara a confirmação com a da especificação; e confere em todo texto do café, nos três idiomas, que não há exclamação, "click", "clique" nem "clic" (sem diferença de maiúscula, também dentro de palavra), prazo ou contagem de usos (algarismo ou palavra de tempo e de vezes), e que nenhum texto do card ou do rodapé fala de anúncio. A página de apoio fica fora da regra do anúncio, porque o texto da seção C diz "Ads cover the costs". Os padrões têm controles positivos.
- **O `pnpm lint:texto`** passou nos 12 arquivos de texto mudados: 1.084 textos, 0 erro de gramática (os 375 avisos são os de ortografia e estilo que ele só mostra). O `english-leak.test.ts` passou com os textos novos nas páginas em pt e es.

## § 442 · O orçamento da ilha e as partes do CI (F12, decisão 7)

- **A ilha encolheu.** Medido com o `gzipSync` padrão do Node sobre o `dist/` (a linha de base é a do `d-cafe.md`, igual ao `dist/` do `fase-12`): o `island.*.js` foi de 18.612 para 18.463 bytes (−149) e o `PdfIsland*.js` de 16.893 para 16.788 bytes (−105). A frase de confirmação custa menos do que a detecção do bloqueador que saiu. O teto era de +512 bytes.
- **Nenhum arquivo JS novo:** os 66 arquivos de `dist/_astro/`, com os mesmos nomes sem o hash. A página de apoio continua só com o script inline do Pix, em português; o rodapé e o vapor são HTML e CSS.
- **As partes do CI:** os testes novos ficam no `coffee.spec.ts` (Chromium 2 e 3, WebKit 6, partes leves), no `money-pix.spec.ts` (Chromium 4 e 5, WebKit 11) e no `ads-coffee.spec.ts` (§ 435; Chromium 1, WebKit 3), o único que usa o build de teste, na parte que já o faz para o `ads.spec.ts`. No `--list` desta frente (1.576 testes por navegador, em 52 arquivos), o `design.spec.ts` e o `image-matrix.spec.ts` seguem em partes diferentes (Chromium 3 e 4; WebKit 6 e 9-10). As frentes do mapa e da parede mudam a divisão, e a junção confere de novo.

## § 443 · Os testes antigos que o café mudou (F12, no formato da § 341)

A ficha manda mudar o teste que fixa o que a run muda junto com o código que ele protege, e mostrar que a proteção continua.

- **`tests/unit/coffee.test.ts`.** O "shows on the 1st use for someone who blocks ads" fixava o gatilho que a Mudança 11 tira; virou "asks someone who blocks ads on the 3rd use too", que prova o contrário com o mesmo contexto e ainda exige o Aceitar. O "detects blocked ads only with ads on, on the production host" fixava o `isAdBlocked`, que saiu; virou "has no ad-block guess any more", que exige que o módulo não o tenha e que o `countUse` não receba a bandeira. Os outros cinco testes (3º uso, 7 dias, sem o Aceitar, o "nunca" e a leitura tolerante) não mudaram. O arquivo continua com sete testes.
- **`tests/unit/routes.test.ts`.** O "uses the fixed texts of the design system and the plan" fixava o rodapé "Curtiu? Me paga um café" e o título "Free tools, made by one person", textos da tabela "Doações" do PLANO; agora fixa os da seção C, e o novo `coffee-texts.test.ts` lê a seção C inteira.
- **`tests/unit/english-leak.test.ts`.** Dois controles usavam o título antigo da página de apoio como frase inglesa conhecida (`free tools made by one person`, e o vizinho colado "Free tools," + "made by one person"). O título mudou e a frase saiu do conjunto; os controles passam a usar o título novo (`help oli keep swimming`, e "Help Oli" + "keep swimming"). As asserções são as mesmas.
- **`tests/e2e/coffee.spec.ts`.** A tabela `LANGS` trocou os rótulos dos botões (en "Support with a coffee" e es "Invítame un café" pelos da seção C) e ganhou a confirmação; os testes que a leem não perderam asserção. Nenhum teste saiu; o arquivo ganhou onze.
- **`tests/e2e/events.spec.ts`.** O teste do rodapé achava o link pelo texto antigo em português; agora pelo da seção C, com `exact`. O teste da página de apoio achava o botão por "Support with a coffee"; agora por "Buy me a coffee", com `exact: true`, porque o `name` do Playwright casa por pedaço e o rodapé da mesma página termina em "buy me a coffee". O evento esperado (`donate_click` com `footer` e com `support_page`) é o mesmo.
- **`tests/e2e/money-pix.spec.ts`.** O "the code has a name for screen readers" lia o rótulo escondido (`.fo-sr`, "Pix copia e cola: "); virou "the code has a visible label": o rótulo `.fo-pix__label` visível, com o texto, logo acima do código, e nenhum `.fo-sr` no Pix. O grupo de valores, as setas e o código do valor continuam conferidos.
- **`tests/e2e/design.spec.ts`.** O "support page: the coffee steam rises in a loop" provava que o vapor animava; virou "rises, then rests, still and visible, by 4.8 s" (§ 439), que prova que ele anima no começo e para em até 4,8 s. O teste do movimento reduzido (`/support/` sem animação) não mudou.
- **`tests/e2e/header-menu.spec.ts`.** O teste das bordas do cabeçalho e do rodapé media `.fo-footer__cols, .fo-footer__base` e esperava dois elementos; agora mede também a `.fo-footer__coffee-row` e espera três, todos nas bordas do cabeçalho, nas 14 larguras. A proteção é a mesma, sobre uma peça a mais.
- **`tests/e2e/cookie-footer.spec.ts`.** Não mudou: a base do rodapé continua (só com a assinatura), e o "último link do rodapé" passou a ser o do Contato, que o teste trata como antes.
- **Nenhum teste saiu, nenhum foi pulado e nenhum limite mudou.** O Vitest foi de 110 arquivos e 1.841 testes para 111 arquivos e 1.849 testes; o `--list` do Playwright ganhou 13 testes por navegador (11 no `coffee.spec.ts`, 1 no `money-pix.spec.ts` e 1 no `ads-coffee.spec.ts`).

## § 444 · A documentação do café no `docs/design/` (F12, decisão 9)

- **`docs/design/components/ResultCard/README.md`, item 5.** Antes: "Linha de apoio (`fo-result__support`) só depois do arquivo pronto, nunca antes do Baixar, nunca no lugar dele. Regras de quando aparece no README de SupportCard." Depois: o mesmo, mais onde a linha fica (no `deep`, depois do Baixar, do "Start over" e das notas), sem exclamação, o botão neutro (Ko-fi; Pix em português), o ghost e a confirmação com `role="status"` e o foco no Baixar.
- **`docs/design/components/Footer/README.md`.** Antes: "Base com o link de apoio ("Like these tools? Support them with a coffee" / "Curtiu? Me paga um café") e a assinatura". Depois: a linha do café no topo (`fo-footer__coffee-row`), o primeiro link, com 48 px de alvo e ícone de 24 px, a 150 px ou mais da âncora; a base só com a assinatura.
- **`docs/design/components/SupportCard/README.md`.** Antes: o card com a Oli, "os valores como botões secundários (US$ 3, 5, 10 no Ko-fi)" (que a § 48 já tinha trocado por texto), o Pix com o "botão Copiar", e a linha "no 3º uso … (ou já no 1º, para quem bloqueia anúncio, com os anúncios ligados)". Depois: a Oli à direita do título, o vapor de 4,8 s, os valores em texto, a trilha "Support Oli"; o Pix com o rótulo visível, o botão de 52 px, a ordem do celular e o QR de 160 px; a linha só no 3º uso, para todos, com a confirmação; e as regras de texto do `coffee-texts.test.ts`.
- **`docs/design/components/Oli/README.md`.** Antes: "vapor do `coffee`". Depois: "vapor do `coffee`, que sobe duas vezes e assenta, parado e visível, em 4,8s".
- **`docs/design/components/bundle.css`** (a referência dos previews, nunca importada pelo site) ganhou as regras novas: a linha do card como botões (saiu a regra `.fo-result__support a`, que pintava de branco e sublinhava também o botão, a pegadinha da F10), a confirmação, a linha do rodapé, a cabeça do SupportCard, o Pix novo e o vapor de 4,8 s. Os previews do ResultCard, do Footer e do SupportCard mostram o café novo.

## § 445 · O conteúdo 2 em diante só até 459 px, para os 1.110 px valerem em toda largura (F12, junção)

- **O que a junção achou.** A frente M seguiu a especificação: o conteúdo 2 em diante só abaixo de 768 px. As fronteiras saem da estimativa a 360 px, e a 360 px a menor distância entre dois anúncios de conteúdo é 1.300 px (1.345 a 320 px, 1.219 a 412). Com a janela mais larga, o texto quebra menos e a página encurta: 1.104 px a 480 px, 976 a 600 e 882 a 767. Entre 460 e 767 px, o mapa ficava abaixo dos 1.110 px que a ficha pede ("a 1.110 px ou mais um do outro"), e num tablet pequeno em pé (600 × 960, por exemplo) a pouco mais de uma tela, contra a Mudança 9 ("no máximo um a cada 1,5 tela").
- **As alternativas:**
  - **manter os 768 px** e registrar a diferença para o Victor. A densidade continua baixa, mas a regra dos 1.110 px e a de 1,5 tela não valeriam nessas larguras;
  - **estimar a altura na largura maior** (767 px): a página precisaria de umas 2,3 vezes mais texto entre dois anúncios, e o celular em pé, onde está quase todo o público, perderia a maior parte dos anúncios seguintes;
  - **o conteúdo 2 em diante só até 459 px** (a escolha): todo celular em pé cabe (o mais largo de hoje tem 440 px de CSS), e de 460 a 767 px a página fica só com o conteúdo 1, como o computador sem o multiplex. As duas regras da ficha valem juntas: só abaixo de 768 px, e a 1.110 px ou mais um do outro. É a mais segura para a conta, e a mudança é uma linha (`AD_MEDIA.phone` em `src/ads/map.ts`) com a regra de largura do CSS.
- **O custo:** o celular deitado (de 568 a 767 px de largura) e o tablet pequeno em pé perdem os anúncios seguintes. No celular deitado, 882 px já eram mais de duas telas (a tela tem de 320 a 430 px de altura), então a perda é de receita, não de regra. A densidade nessas larguras só cai.
- **O que mudou:** `AD_MEDIA.phone` passou de `(max-width: 767px)` para `(max-width: 459px)`, e o CSS esconde essas caixas a partir de 460 px. O `fo-ad-map.spec.ts` mede também a 459 × 900 (a largura mais larga com os anúncios seguintes), com as mesmas travas (os 1.110 px de borda a borda, a densidade de até 30 % e os 150 px), e a 600 × 960 (o tablet pequeno em pé), e reprova um anúncio seguinte acima de 459 px; o teste do push confere as unidades com `<ins>` pela mesma largura. Rodado sobre o código de antes (o `d244673`, extraído com `git archive`), o bloco das páginas 1 a 6 reprovou a 600 × 960 ("conteudo-2 aparece a 600 px", na home dos três idiomas); com a mudança, os 51 testes do spec passam nos dois navegadores. O `ad-map.test.ts` lê a media query nova. O README do AdSlot, o `docs/design/README.md` e o `docs/OPERACAO.md` dizem 459 px.
- **O `gate:prontidao`** continua contando o celular a 360 px (todas as caixas de conteúdo) e o computador a 1280 px (§ 421): de 460 a 767 px a página mostra menos caixas que nas duas, então a conta não afrouxa.

## § 446 · A F11 t-3 aceita: o idioma em uso no Menu fica sem o check (F12, decisão 13)

- **A pendência:** abaixo de 768 px, o idioma em uso no fim do Menu perdeu o ícone check da especificação, que não cabe numa linha de três alvos (F11 t-3, § 388). A proposta era "aceitar, ou voltar ao check se a F12 mudar a folha ou o 1º anúncio".
- **O que a F12 mudou:** a folha do Menu não mudou. O 1º anúncio dos moldes de ferramenta desceu para depois do "Como usar" (§ 419), bem longe da folha, mas a falta do check nunca foi por causa do anúncio: é de largura (três alvos de 48 px e o nome do idioma numa linha de 328 px a 360 px).
- **A escolha:** aceitar. O idioma em uso continua marcado pelo fundo, pelo traço, pelo peso 700, pelo `aria-current` e, com cores forçadas, pelo sublinhado (§ 404), sem depender só da cor (WCAG 1.4.1). A linha saiu do grupo 20 para "Registrados (escolhas, não defeitos)" do `docs/PENDENCIAS.md`.

## § 447 · O `docs/PENDENCIAS.md` da F12, e o teste dele (F12, decisão 13; formato da § 341)

- **O que saiu das tabelas** para "Já corrigidos depois da revisão", cada um com o § que o fechou: a F3 c-04 (§ 428), a c-08 (§ 435) e a f-06 (§ 429); a F10 p-4 (§ 440), a p-6 (§ 437), a p-8 (§ 431, o texto que o Victor escolheu), a p-10 (§ 421), a p-12 (§ 419 e § 420) e a p-18 (§ 420); e a F11 t-2 (§ 419). A F11 t-3 foi para "Registrados" (§ 446).
- **O que ganhou uma nota e ficou aberto:** a F5a D-12 (o "Copiar código" do Pix saiu na F12, § 440; as peças de PDF ficam para a F13) e a F3 d-02 (o vapor para em 4,8 s desde a F12, § 439; fica a `wave`).
- **O grupo 21, "O que a F12 deixou",** com as notas das três frentes (`p-`) e os baixos da revisão adversarial (`R-`). O Resumo e o Total estão em dia.
- **O teste que mudou: `tests/unit/pendencias.test.ts`.** Fixava a F3 c-04 e a c-08 entre os itens abertos que a decisão 3 da F8 nomeia. Agora elas não podem estar nas linhas abertas e têm de estar na tabela "Já corrigidos" com o § que as fechou, como a § 242 na F9 (§ 341): nada some sem rastro. Os outros ids da lista continuam obrigatórios, e o teste de cada revisão (as linhas abertas das F3 a F7 cobertas pelo id) continua valendo, porque o id fica no arquivo.
