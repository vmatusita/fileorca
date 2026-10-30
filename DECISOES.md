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

- **Decisão:** o que vai para o navegador fica em `dependencies` (astro e @astrojs/preact, pelo runtime das ilhas; preact; comlink; tailwindcss, pelo CSS gerado). Build, teste e CI ficam em `devDependencies`. A /licenses é gerada das `dependencies` mais as fontes (OFL). O portão de licenças confere as duas listas (dependências diretas de cada lado) contra as licenças permitidas do CLAUDE.md.

## § 14 · Merge recusa rascunho (F1a, 30/out/2026)

- **Decisão:** o `pode-mesclar.ts` também recusa PR em rascunho, sem comentário e sem issue, porque o `gh pr merge` falharia nela. O `ci.yml` escuta `opened`, `synchronize`, `reopened` e `ready_for_review`, para a decisão de merge rodar quando o rascunho fica pronto.
- **Por que sem comentário:** cada push num rascunho rodaria o CI de novo e encheria a PR de comentários iguais.

## § 15 · Busca Ctrl+K carregada no primeiro uso (F1a, 30/out/2026)

- **Decisão:** a busca de ferramentas não pesa no carregamento: o código e o índice só carregam no primeiro uso (foco, clique ou Ctrl+K). O molde segue com uma ilha Preact só, a do painel da ferramenta; a busca é TypeScript sem framework.

## § 16 · build.format "preserve" (F1a, 30/out/2026)

- **Decisão:** `build.format: 'preserve'` no `astro.config.ts`, com toda página em `.../index.astro` e os 404 em `404.astro`.
- **Por quê:** com o padrão `'directory'`, o Astro 7.4 grava `src/pages/pt/404.astro` como `pt/404/index.html`, e o `not_found_handling: "404-page"` do Cloudflare procura `pt/404.html`. Conferido no build em 30/out/2026.
- **Alternativa:** mover o arquivo num hook depois do build (mais frágil).
