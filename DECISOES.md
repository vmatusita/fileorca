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
