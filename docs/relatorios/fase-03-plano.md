# F3 · Plano da run (revisão e prontidão para o AdSense)

Gabarito da run e da segunda passada da revisão. Autoridade: `docs/prompts/prompt-fase-03.md` (a ficha), depois o CLAUDE.md, o PLANO (ficha F3 e seções citadas), `docs/design/` e o DECISOES.md. Escrito em 31/out/2026, a partir da exploração de quatro subagentes Sonnet só de leitura: o checklist das fichas (apêndice), o dossiê do aviso de cookies, o mapa dos portões e as regras oficiais lidas na web.

## 1. Estado de partida e commits

- A `main` estava em `f549f1b` (F2 e ajuste do CI em partes mesclados, `LAUNCHED = true`).
- Na `fase-03`: `e35f9e3` (prompt), `cf5fba8` (aviso de cookies, § 91), `776bf40` (`gate:prontidao`, § 95) e `f5fa1c4` (hub, § 96). PR em rascunho: vmatusita/fileorca#7.
- **Commit revisado:** o commit deste plano, que tem a correção do aviso, o `gate:prontidao` e o hub. O hash entra no `REVISAO-F3.md`. A revisão roda numa worktree só de leitura, em `.claude/worktrees/revisao-f3`.
- CI da primeira push (run 41226056230, verde): `verificar` 164,0 s (build 7,4 s, Vitest 23,2 s, Lighthouse 80,2 s), Chromium 391,0 s, WebKit 253,9 s e 430,8 s. As quatro partes ficam abaixo de 700 s.

## 2. O bug do aviso de cookies (feito, § 91)

- **Causa provada.** O `reserve()` de `src/components/CookieNotice.astro` punha no `document.body` um `padding-bottom` igual à altura do aviso + o `bottom` + 8 px. O `html` não tem fundo, então o `--bg` do `body` pinta a tela, e o padding fica depois do `.fo-footer` (fundo `--deep`).
- **Medida antes da correção.** Com o teste novo, 216 px do `body` abaixo do rodapé a 360 px, nos dois navegadores, e 316 px com a âncora, que era contada duas vezes.
- **Correção.** A reserva vai para `--fo-cookie-room` no `<html>`, somada ao padding de baixo do `.fo-footer`. Com `.fo-footer--anchor`, vale o maior entre 96 px e o respiro normal mais a reserva. O `scroll-padding-bottom` e o `focusin` da § 36 não mudaram.
- **Testes.** `tests/e2e/cookie-footer.spec.ts`: no código de antes, 8 falhas e 2 testes verdes; depois, todos verdes. Os 34 testes de `events.spec.ts` e `consent.spec.ts` passam sem mudança.
- **Screenshots de antes e depois.** Estão em `docs/relatorios/fase-03/cookie-{before,after}-{1280,360}-{light,dark}.png`.
- **Os outros três sintomas.** O aviso que não fecha e o que volta ficam cobertos pelo `consent.spec.ts`. A página que pula fica coberta pelo CLS do Lighthouse e pela reserva aplicada antes da primeira pintura. Nenhum dos três se reproduziu.

## 3. `gate:prontidao` (feito, § 95)

O portão faz dois builds extras em `.cache/prontidao/`. O `client` tem só `PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000`. O `all` tem as três variáveis. Os dois somam uns 15 s no CI e 45 s aqui. O portão confere também o `dist/` real. A tabela tem 18 itens:

| Grupo | Item | Como confere |
| --- | --- | --- |
| (a) | Meta em toda página com o ID | build `client`, `<meta>` única no `<head>` de cada HTML |
| (a) | `ads.txt` exato | linha da ajuda do AdSense escrita à mão no portão |
| (a) | Sem carregador só com o ID | build `client` |
| (a) | Carregador só nas ferramentas, com a trava do hostname | build `all`, contra a área de anúncio do mapa de rotas |
| (a) | Hoje, sem o ID, nada de anúncio | `dist/` real |
| (b) | Seis páginas obrigatórias × 3 idiomas | mapa de rotas e arquivo no build |
| (b) | As seis no rodapé de toda página | `<footer>` de cada HTML |
| (b) | Contato com `contato@fileorca.com` | texto e `mailto` |
| (b) | Privacidade com o que o AdSense pede | frases por idioma e os dois links |
| (c) | Nenhum texto de obra | lista do `gate:conteudo` + "under construction", "em construção" e "en construcción" |
| (c) | Nenhum ID de mentira | HTML, JSON, XML, TXT e manifest, scripts incluídos |
| (c) | Cartões e busca só do registro | home, hub e `search-index.json` |
| (d) | H1, título e descrição próprios | páginas indexáveis |
| (d) | 60 palavras no `<main>` | piso abaixo do Contato (74) |
| (d) | 150 palavras por AdSlot | uma tela de texto no celular por anúncio |
| (e) | `robots.txt` não bloqueia ninguém | `robotsProblems()`, extraído do `gate:seo` |
| (e) | Nenhuma indexável com `noindex` | meta e `_headers` (`headerBlocks()` e `patternApplies()`) |
| (e) | Sitemaps só com 200 e indexáveis | índice, os três sitemaps e o arquivo de cada URL |

O teste de unidade `tests/unit/prontidao.test.ts` tem 20 testes. Um site de mentira passa em tudo, e cada quebra reprova o item certo. A primeira execução no `dist/` real reprovou o hub (2 AdSlots para 193 palavras), corrigido na § 96.

## 4. A revisão: seis lentes, um cético por achado

**Método.** Seis subagentes Sonnet, em contexto limpo, rodam ao mesmo tempo na worktree só de leitura. Cada um tem a própria porta (`FO_PORT` de 4174 a 4179) e a própria pasta de saída do Playwright (`--output .cache/lente-<x>`). A worktree recebe `pnpm install --frozen-lockfile` e `pnpm build` antes. Nenhuma lente edita arquivo do repositório. Os screenshots vão para `.cache/` da worktree.

**Formato do achado.**
- Id (`a-01`…), título e severidade.
- `arquivo:linha`.
- Evidência real: o comando com a saída, o trecho ou o screenshot.
- A regra violada.
- A correção proposta e o custo no CI.

Preferência de estilo não é achado.

**Severidade (decisão 3 da ficha).**
- **Crítico:** arquivo do usuário que sai do aparelho, número na URL ou no GA4, violação de "O que derruba conta", `noindex` ou `robots.txt` barrando em produção, saída errada ou com GPS, ou merge automático ou pós-deploy quebrado.
- **Alto:** falha de WCAG A ou AA no fluxo principal, desvio visível do design system em componente de toda página, erro funcional numa ferramenta ou num navegador, item de prontidão falhando, orçamento estourado ou promessa da Privacidade que o código não cumpre.
- **Médio:** erro real de impacto pequeno, ou teste que não prova o que diz.
- **Baixo:** o resto que é lacuna de verdade.

**Cético.** Cada achado crítico, alto ou médio ganha um cético Sonnet próprio, em contexto limpo, que tenta refutá-lo. Ele reproduz o problema, confere a regra e procura teste que já cubra o caso. O veredito é confirmado, refutado (com a evidência) ou rebaixado (com a severidade nova). Os baixos de cada lente passam por um cético só, em lote. Só o confirmado segue.

**O que se corrige (decisão 4).**
- Críticos e altos confirmados: sempre.
- Médios: quando a correção é local (não muda arquitetura, não sai do escopo, soma no máximo uns 30 s a uma parte do CI).
- Baixos: só os oito herdados da F2.

Cada correção testável tem teste que falha sem ela, e cada uma entra num §. Achado em `.github/` ou `scripts/ci/` vira pendência, com a correção proposta.

**Segunda passada.** Subagentes novos, em contexto limpo, revisam só o diff das correções contra este plano. Eles confirmam o fechamento de cada crítico e alto. A passada se repete até não sobrar nenhum aberto.

### Checklist de cada lente

O checklist completo (requisito → fonte → código → teste) está no apêndice A. As linhas marcadas como "Suspeita" ou "Lacuna" são pontos de partida, não achados: a lente prova ou descarta cada uma.

- **(a) Corretude.** O motor e as oito ferramentas. Os presets, o lote e o ZIP. O Ctrl+V. O erro por arquivo. O caminho sem canvas e o sem `OffscreenCanvas` no worker. A integridade dos testes: 404 que passa, asserção vazia, `expect` que não roda, contagem tirada do lugar errado, portão que não reprova o que diz. Pontos de partida:
  - a falha de carga do motor que vira "arquivo danificado" (`ImagePanel.tsx:299`, `:325`);
  - o caminho da página sem teste que o force;
  - as requisições do worker no WebKit, vistas pelo `page.on('request')`;
  - pt e es fora do `ads.spec.ts`.
- **(b) Privacidade.** Arquivo, URL, `dataLayer`, a lista fechada de eventos, o `gtag.js` só em fileorca.com, o consentimento e o `localStorage`, COOP/COEP e `SharedArrayBuffer`. Também a Política de Privacidade nos três idiomas contra o código: a lista de eventos, "erased if you decline" e retenção.
- **(c) Anúncio e consentimento.** "O que derruba conta", item por item. A distância dos AdSlots e os lugares sem anúncio. O carregador e o hostname. A meta e o `ads.txt`. O café e a doação, incluindo o "Ads cover the costs" contra a regra "nenhum texto liga doação a anúncio". O `__tcfapi` e o `tcf()` que roda uma vez só. O hub fora do `ads-pages.test.ts`.
- **(d) Acessibilidade.** WCAG 2.2 AA no fluxo principal: teclado, foco visível e não coberto (com o aviso aberto e a página no fim), `aria-live`, nomes, contraste nos dois temas por `prefers-color-scheme` e por `html[data-theme]`, reflow a 320 px e movimento reduzido (2.2.2 dos loops). Também os baixos 1 a 6 da F2.
- **(e) Desempenho e SEO técnico.**
  - Desempenho: os orçamentos de JS e de requisições; LCP, CLS e INP; a memória de um lote longo; o caminho na página sem `OffscreenCanvas`; o tempo de cada parte do CI.
  - SEO: títulos, canonical, hreflang, sitemaps, schema, `robots.txt`, `_headers`, a 404 e o IndexNow.
  - A diferença entre a produção e o `dist/`, pela conferência da decisão 6.
- **(f) Design system.** Cada componente contra o README e o `preview.html`, no mesmo tema e largura, começando pelo Footer e pelo CookieNotice, com o aviso aberto. Também tokens, o amarelo só no Baixar, as nove poses com `aria-hidden` e a voz: a regex sem `unlock` e `magic`, emoji e uma exclamação por tela.

## 5. Critérios da ficha → prova

| # | Critério | Prova |
| --- | --- | --- |
| 1 | O teste do aviso falha antes e passa depois; os antigos sem mudança; screenshots | `.cache/f3/cookie-before-final.txt` (8 falhas) colado no relatório; `pnpm exec playwright test tests/e2e/cookie-footer.spec.ts tests/e2e/events.spec.ts tests/e2e/consent.spec.ts` (44 verdes); `docs/relatorios/fase-03/cookie-*.png` |
| 2 | `REVISAO-F3.md` com método, commit, seis lentes, cético e estado | o arquivo; o resultado da execução da revisão |
| 3 | Nenhum crítico ou alto aberto; segunda passada confirma | a seção da segunda passada no `REVISAO-F3.md` |
| 4 | `gate:prontidao` no `STEPS`, verde, teste com controles negativos, `verificar.test.ts` verde | `pnpm gate:prontidao`; `pnpm exec vitest run tests/unit/prontidao.test.ts tests/unit/verificar.test.ts` |
| 5 | Produção conferida com `curl` | a seção 8 abaixo, com as saídas no relatório |
| 6 | `docs/lancamento/` com quatro arquivos, 20 diretórios, título ≤ 80, provas | os arquivos; o teste das provas (seção 7); o LanguageTool local |
| 7 | `pnpm verificar` verde aqui e nas quatro partes do CI | a saída completa da execução limpa; `gh run view <id> --log` |
| 8 | Prévia com o comentário do Workers Builds; faixa sumida a 1280 e 360 px | `gh pr view 7 --comments`; script do Playwright contra a prévia, com o Google bloqueado |
| 9 | Nenhuma dependência nova; nada em `.github/`, `scripts/ci/` ou arquivo só de leitura | `git diff --stat origin/main -- package.json pnpm-lock.yaml .github scripts/ci PLANO-FILEORCA.md docs/adr/ADR-001-plataforma-de-entrega.md .githooks .claude/settings.json docs/design` |
| 10 | Depois do merge: `build.txt`, pós-deploy, faixa sumida em produção | `curl https://fileorca.com/build.txt`; `gh run list --workflow pos-deploy.yml`; script do Playwright com o Google bloqueado |

## 6. Tempo do CI e ordem de execução

**Projeção.**
- O `gate:prontidao` soma uns 15 s ao `verificar`, que vai de 164 a uns 180 s.
- O `cookie-footer.spec.ts` tem 5 testes por navegador, cada um com uma carga. Soma uns 10 s por parte.
- As correções da revisão entram com o custo estimado por cada lente, até uns 30 s por parte (decisão 4).
- O alvo é ficar abaixo de 700 s por parte. Hoje a parte mais longa é o WebKit 2 de 2, com 431 s.

**Ordem.**
1. Aviso, PR em rascunho, `gate:prontidao`, hub (feito).
2. Este plano e a push.
3. A worktree no commit do plano e as seis lentes. Ao mesmo tempo, o subagente dos textos de lançamento (só escreve em `docs/lancamento/`), a conferência da produção e as provas do Show HN.
4. Os céticos.
5. As correções, num agente só (eu), cada uma com teste e §.
6. A segunda passada.
7. O verificar limpo (`pnpm install --frozen-lockfile` e `pnpm verificar`), o `pnpm screenshots`, o relatório, o CLAUDE.md e o `gh pr ready`.

## 7. Textos de lançamento e provas técnicas

O subagente com acesso à web escreve os quatro arquivos de `docs/lancamento/`: `README.md`, `show-hn.md`, `alternativeto.md` e `diretorios.md`.

**O que a exploração trouxe.**
- O FAQ do AlternativeTo recusa "a collection or suite of simple online tools", com calculadoras e conversores citados. O `README.md` avisa o Victor disso. O texto fica pronto mesmo assim (a ficha manda não cortar).
- O formulário do AlternativeTo exige conta, então os limites dos campos não ficam visíveis. O texto usa tamanhos conservadores e registra a lacuna.
- O limite de 80 caracteres do título do HN não aparece em página oficial. Fica como regra prática.

**Provas técnicas** (eu rodo; cada afirmação do Show HN cita a sua):
- **"Nenhum byte do arquivo sai."** Um script do Playwright sobre o `dist/` registra toda requisição do contexto (página e worker, `context.on('request')`) durante um lote na Compress, na HEIC to JPG e na Image to PDF. Nenhuma pode ser POST ou PUT, nem ir para fora da origem, e nenhum corpo de requisição pode ter os bytes do arquivo.
- **"Segue funcionando offline depois de carregada."** O script carrega a página, processa um arquivo (o que baixa o worker e o codec), chama `context.setOffline(true)`, processa outro arquivo e baixa o resultado.
- **"O que sai é só o Analytics."** Em fileorca.com, o único domínio de terceiros é o do Google Analytics (`googletagmanager.com` e `google-analytics.com`). A prova vem do código (`consent.ts`, trava de hostname) e do teste `consent.spec.ts`. Na produção, a página só é aberta com o Google bloqueado.

## 8. Produção, só leitura (decisão 6)

`curl` em:
- `https://fileorca.com/robots.txt`, comparado com `public/robots.txt`;
- `/sitemap-index.xml` e os três sitemaps;
- as 18 páginas obrigatórias, com o status e a ausência de `x-robots-tag`;
- uma URL que não existe, que deve dar 404;
- o HTML de páginas, sem `/cdn-cgi/` nem `cloudflareinsights`;
- `http://fileorca.com/` e `https://www.fileorca.com/`, que devem dar 301 para `https://fileorca.com/`;
- `/build.txt`;
- `/ads.txt`, que deve dar 404.

Diferença entre a produção e o `dist/` é achado da lente (e).

---

## Apêndice A · Checklist requisito → código → teste

Montado na exploração sobre `cf5fba8`. Os números de linha são desse commit. É o ponto de partida das lentes; cada "Suspeita" ou "Lacuna" ainda precisa de prova.

---

### (a) Corretude

| Requisito | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| O tipo vem da assinatura dos bytes, nunca da extensão | P2 dec.2, §59 | `src/engine/image/sniff.ts:44-50`, `:27`; `process.ts:304-316` | `engine-sniff.test.ts:10-67`; matriz (`gen-png-extensao-jpg`, `gen-texto-extensao-png`) | — |
| Arquivo vazio, truncado, corrompido ou de formato errado dá erro na linha dele, o lote segue e o motor nunca lança | P2 c.5, §64 | `process.ts:304-347`; `structure.ts:119`; `ImagePanel.tsx:233-250` | `engine-process.test.ts:22-84`; `engine-structure.test.ts`; `image-batch.spec.ts:47`; os 4 quebrados no meio de todo lote da matriz | **Suspeita (médio):** `ImagePanel.tsx:299` e `:325-327` transformam falha ao carregar o `engine-client` (offline, chunk 404 depois de deploy) ou qualquer exceção do `processFile` em `reason:'decode'`. A fala é "arquivo danificado". `decode` está em `HOPELESS` (`:42`), então trocar a opção não tenta de novo. O `tool_error` sai como `decode`, o que suja o sinal de bug de compatibilidade. Sem teste. |
| Orientação aplicada uma vez e a saída sem tag Orientation | P2 c.3 | `decode.ts:41`, `:64-67`; `pixels.ts:27` | matriz (jpg-03, variantes 6 e 8 por pixels; heic-05 e heic-09 por dimensões); `engine-pixels.test.ts:23-66`; `engine-probe.test.ts:23-45` | — |
| Nenhuma saída com GPS, Exif, XMP ou IPTC, inclusive no caso "sem ganho", na heic-10 e no MPF/Ultra HDR | P2 c.4, §33, §86(3) | `process.ts:68-72`; `strip.ts:68`, `:130`, `:145`, `:177` | `strip.test.ts:19-192`; `metadataReport` em toda saída da matriz; `tool.spec.ts:17`, `:73` | O ICC sRGB do canvas é permitido (CLAUDE.md F2). |
| Compress: MozJPEG, OxiPNG e WebP; nunca devolve arquivo maior; sem ganho devolve o original limpo | PLANO bibliotecas, §62, §33 | `encode.ts:34-72`; `process.ts` | `engine-process.test.ts:91-145`; `tool.spec.ts:73` | A opção Strong está fora da matriz. |
| Presets 100 KB, 1 MB e YouTube 1280×720, conferidos por bytes | P2 c.7, §60, §66 | `registry.ts:20`, `:110-136`; `target.ts:111` | `image-presets.spec.ts:90`, `:149`; `engine-target.test.ts:58-194`; `image-tool-ops.test.ts:42` | O padrão do YouTube (§60) continua pendente do Victor. |
| Resize nunca aumenta; Crop usa teclado e campos; Rotate e espelho | P2 dec.6, §73, §74 | `geometry.ts`; `tools/resize-image/Panel.tsx`; `crop-image/{CropEditor.tsx,box.ts}` | `engine-geometry.test.ts`; `crop-box.test.ts`; `image-smoke.spec.ts:95`, `:130`, `:210`, `:287`; `image-crop.spec.ts:94` | — |
| HEIC pelo item primário; libheif sem alteração; P3 convertido para sRGB | P2 c.8, §63, §79 | `decode.ts:78`, `:114`, `:131`; `choice.ts:67`; `pixels.ts:210` | `engine-bmff.test.ts`; `engine-choice.test.ts:75-143`; `engine-pixels.test.ts:176-233`; `image-privacy.spec.ts:66`; matriz `heic-to-jpg-*` | O caminho nativo do Safari só roda no Vitest com decodificadores falsos (§63). Falta conferir num Safari de verdade. |
| WebP animada vira o 1º quadro; PNG↔JPG decide pelo arquivo; transparência vira branco com nota | P2 dec.6 | `registry.ts:85-100`; `process.ts` | `image-smoke.spec.ts:253`; `image-tool-ops.test.ts:77-93`; matriz (`gen-webp-animada`, `gen-png-transparente`) | — |
| Image to PDF: 1 página por imagem, na ordem da fila; Letter e A4; pixels recodificados; Producer e Creator "FileOrca" | P2 dec.6 | `src/engine/pdf/build.ts:69-78`; `pdf-client.ts` | `pdf-build.test.ts:24-132`; `pdf-strict.test.ts`; `image-smoke.spec.ts:264`; `tool.spec.ts:178`; `strictPdf` na matriz | Memória: 40 fotos de 12 MP ≈ 0,5 GB (pendência da F2). |
| Lote sem limite; fila com 6 linhas e "Show N more"; ZIP sem compressão com nomes únicos; N arquivos dão N saídas | P2 c.6, §69 | `ImagePanel.tsx:255-265`, `:864-885`; `engine/image/zip.ts:17`; `names.ts` | `engine-zip.test.ts:39-96`; `image-island.test.ts:8-40`; `image-batch.spec.ts:90`, `:127`; `island.spec.ts:26`, `:50`, `:89` | — |
| Ctrl+V e arrastar; ignorar a colagem em campo, busca ou diálogo | P2 dec.3 | `paste.ts:38`; `ImagePanel.tsx:555-580` | `image-island.test.ts:42-75`; `image-batch.spec.ts:141`, `:151`, `:161`; `island.spec.ts:121`, `:130` | — |
| Caminho sem canvas acima de 16.777.216 px e teto de 50 MP | P2 c.9, §65, §86(4) | `choice.ts:15`, `:20`; `types.ts:112`, `:119`; `decode.ts:144-148` | `engine-choice.test.ts:10-72`; `image-privacy.spec.ts:142`; `gen-grande-4100x4100` na Compress | 48 MP em celular real (RGBA de 192 MB mais o codec) não tem teste fora do desktop. |
| Sem `OffscreenCanvas` no worker, o motor roda na página | F1a §22, nota da F2 | `worker.ts:19`; `engine-client.ts:45-59`; `work.ts:34-38` | `tool.spec.ts:41-48` só afirma que um worker existiu e dá `console.log` do caminho usado | **Lacuna (médio):** nenhum teste força o caminho da página nem a falha do worker (`engine-client.ts:54-58`). No WebKit do CI Linux o caminho pode nem rodar. O fallback reexecuta o mesmo arquivo na thread principal. |
| Cancelar e remover linha, foco, região de status; opção reprocessa sem tirar o foco | P2 dec.3, §86(5) | `ImagePanel.tsx:274-380`, `:525-546` | `island.spec.ts:26-217`; `tool.spec.ts:51`, `:178` | — |
| Eventos: 1 `tool_start` e 1 `tool_complete` por lote; 1 `tool_error` por arquivo | §71 | `ImagePanel.tsx:369`, `:398`, `:235`, `:245` | `island.spec.ts:143`; `tool.spec.ts:120` | — |
| Integridade: nada de skip, fixme, only, retries ou continue-on-error | CLAUDE.md Testes | `playwright.config.ts:10-12` (`forbidOnly`, `retries:0`) | varredura por grep em `tests/`, `scripts/`, `.github/`: limpa | OK. |
| Integridade, a confirmar: "0 requisições para fora" usa `page.on('request')` | P2 c.10 | `tests/e2e/lib/matrix.ts:196-212` | — | **Suspeita:** confirmar que o WebKit reporta requisições feitas de dentro do worker. Se não reportar, a prova é vácua para o worker no WebKit. |
| Integridade: a medida de distância dos anúncios só cobre as páginas em inglês | P2 c.14 | `ads.spec.ts:20` (`TOOL_PAGES`) | — | **Lacuna:** `/pt/comprimir-imagem/` e `/es/comprimir-imagen/` só passam nos testes estáticos (`ads-pages.test.ts`). |

---

### (b) Privacidade

| Requisito | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| Nenhum arquivo sai do aparelho | PLANO Regras, P2 c.10 | `src/` só tem `fetch` de mesma origem: `codecs/runtime.ts:14-38`, `search/search.ts:40`. Não há `sendBeacon`, XHR nem WebSocket | `matrix.ts:196-212`, `:671-672` (`outside()==[]`, `writes==[]` em todo lote); `image-privacy.spec.ts:89` | O CSP só tem `frame-ancestors` (`headers.ts:20-25`), então a prova depende dos testes. Ver a suspeita do worker no WebKit em (a). |
| Nenhum número digitado vai para URL nem para `dataLayer`; `page_location` sem `?` nem `#` | P1a dec.5, §8 | `consent.ts:51`. Nenhum uso de `location.search`, `location.hash` ou `URLSearchParams` em `src/` | `consent.spec.ts:32`; `image-smoke.spec.ts:372`; `consent.test.ts:38` | — |
| Eventos com lista fechada | §10, §71 | `events.ts:6-12`, `:40-52`; `consent.ts:52` | `consent.test.ts:58-116`; `tool.spec.ts:120`; `island.spec.ts:143` | O `foTrack` do bootstrap filtra só as chaves, não os valores fechados. Só serve a `data-track` (place e lang), então é baixo. |
| `gtag.js` só em fileorca.com | §8 | `consent.ts:54`; `site.ts:6` | `consent.test.ts:51`; `consent.spec.ts:90` (localhost e prévia: 0 requisições ao Google) | — |
| Consent Mode v2 por região, declarado antes do `config`, com replay da escolha | §9 | `consent.ts:19`, `:41`, `:47-51` | `consent.spec.ts:14`; `consent.test.ts:21-50` | O padrão "granted" vale também para o Brasil e para os estados dos EUA. Isso depende da CMP do Google quando os anúncios ligarem. |
| `localStorage`: só `fo-consent` e `fo-coffee`; o `fo-coffee` só é gravado com Aceitar | §49 | `coffee.ts:11-106`; `CookieNotice.astro:18` | `coffee.test.ts:18-65`; `coffee.spec.ts:73-209` | A política diz que a contagem é apagada se a pessoa recusar depois. O código apaga só quando uma ferramenta abre (§49 admite). |
| Sem COOP/COEP e sem SharedArrayBuffer nem build de várias threads | PLANO Cabeçalhos, P2 c.10 | `headers.ts:20-25` | `platform.test.ts:23`; `gate:cabecalhos` (`cabecalhos.ts:14-15`); `image-privacy.spec.ts:35`, `:47`, `:89` | — |
| Conteúdo do usuário nunca vira HTML | PLANO Cabeçalhos | `innerHTML` só em ícones e SVG próprios (`Icon.tsx:20`, `search.ts:85`) | `filecard.test.ts:88`; `image-island.test.ts:28` | A entrada não aceita SVG. |
| Object URLs revogadas | P2 dec.3 | `ImagePanel.tsx:136-149` | `island.spec.ts:207` | — |
| A Política de Privacidade promete o que o código faz, nos 3 idiomas | PLANO Páginas obrigatórias | `src/i18n/{en,pt,es}/privacy.ts` (en: `:15-16` controlador, `:36-48` eventos, `:51-60` AdSense, `:64-67` localStorage, `:77-82` consentimento) | `routes.test.ts:66` só compara as seções entre os idiomas. **Nada confere o conteúdo contra o código.** | A conferir: os 6 itens de evento da política contra `EVENT_PARAMS` (a política não cita tool, lang, outcome, reason); a frase "erased if you decline"; a retenção do GA4 sem número (pendência do Victor). |
| Produção: cabeçalhos reais | PLANO Da run ao ar | `_headers` | Só o pós-deploy (`pos-deploy.ts:9`, `:92-108`) confere X-Robots-Tag, robots.txt e `/cdn-cgi/` em 4 páginas | CSP, HSTS e nosniff reais só por `curl` (decisão 6 da F3). O `serve-dist` é uma imitação do Cloudflare. |
| Ko-fi só como link, sem script nem widget | PLANO Doações | `Footer.astro:51`; `SupportCard.astro:23` | `events.spec.ts:17`; `coffee.spec.ts:272` | — |

---

### (c) Política de anúncio e consentimento

| Requisito ("O que derruba conta" e afins) | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| Não clicar nos próprios anúncios; dev, CI e prévia nunca pedem anúncio | PLANO Monetização, §34 | `AdsenseHead.astro:15`; `AdSlot.astro:19-20` (guarda `location.hostname`) | `ads.test.ts:69`, `:82` | **Lacuna:** a guarda só é testada pela string no HTML. O build do e2e não tem as variáveis, então nunca foi executada. |
| Nenhum anúncio em tela sem conteúdo, nem no painel, nem no processamento | PLANO Monetização | AdSlot só em `ImageToolPage.astro:59`, `:106` e `ImageToolsView.astro:58`, `:69` | `ads.spec.ts:120-197` (4 estados por página, nenhum AdSlot dentro de `#fo-tool-root`); `ads.spec.ts:260` (home, legais, apoio e 404 sem AdSlot) | Hoje as caixas vazias "Advertisements" (300 px e 644 px) aparecem em 14 páginas em produção: 11 em inglês, a Compress em pt e es, e o hub. O hub tem só 162 palavras no `<main>` e 2 AdSlots. Definir a regra "AdSlot × conteúdo". |
| 150 px de distância do Baixar, dos campos, do painel e da Oli, a 360×740 e 1280×800 | PLANO Molde, P1a c.2, P2 c.14 | `components.css` (`.fo-ad`, `column-gap:150px`, §20) | `ads.spec.ts:120-257` (`TARGETS` em `:14-19`, mais o café em `:243`) | Ver a lacuna das páginas pt/es em (a). Mede a caixa reservada, não um iframe real. |
| Entre campos ou ao lado de menu suspenso na calculadora | PLANO Molde da calculadora | — | — | É da F4. `TARGETS` já inclui `select`, `.fo-field`, `.fo-input` e `.fo-seg`. |
| Não ter mais anúncio que conteúdo; não paginar | PLANO Monetização | 1 AdSlot de conteúdo e 1 de trilho (≥1280) por página | `ads-pages.test.ts:66-85` (2 `fo-ad--` por página de ferramenta) | Sem teste de proporção. Dados medidos no `<main>`: ferramentas e presets 484–745 palavras, hub 162, home 152 (pt 79, es 81), contato ~75, apoio ~110. |
| Não atualizar anúncio sozinho | PLANO Monetização | um `push` só (`AdSlot.astro:20`) | — | Sem refresh no código. Só âncora e vinheta no console, que é do Victor. |
| Carregador só com as 3 variáveis | PLANO Como o anúncio liga | `config.ts:50-55`; `AdsenseHead.astro:14-16`; `AdSlot.astro:24`, `:34` | `ads.test.ts:24-96`; `ads-pages.test.ts:59-85` (3 estados × todas as páginas de ferramenta × 8 views) | **Lacuna:** o hub (`ImageToolsView`, `withAds`) não entra no `ads-pages.test.ts`. O estado "all" do hub não tem teste. |
| Meta tag `google-adsense-account` e `/ads.txt` só com `PUBLIC_ADSENSE_CLIENT`, com `pub-` sem `ca-` | F1a | `AdsenseHead.astro:18`; `[adsfile].txt.ts:5-9`; `config.ts:68-70` | `ads.test.ts:44`, `:86`; `ads.spec.ts:305` (`/ads.txt` dá 404 hoje) | A linha `google.com, pub-…, DIRECT, f08c47fec0942fa0` confere com a ajuda oficial. Reconferir na web. |
| Rótulo Advertisements / Publicidade / Anuncios, sem `aria-label` na caixa | PLANO Oli, F1b v1.1 | `AdSlot.astro:23` | `ads.test.ts:57-65`; `ads.spec.ts:292-298` | O `aside.fo-rail` tem `aria-label` (`BaseLayout.astro:83`). |
| Só âncora e vinheta; o aviso de cookies fica acima da âncora | PLANO, §35 | `CookieNotice.astro:32` (`lift`); `components.css:404` (`--fo-anchor`) | `events.spec.ts:66` (âncora sintética); `cookie-footer.spec.ts:125` | A âncora real só existe com o AdSense. |
| `__tcfapi`: o aviso próprio some onde o GDPR se aplica | PLANO Consentimento | `CookieNotice.astro:29`, `:35` | `consent.spec.ts:59`, `:70` (só com stubs) | **Suspeita:** `tcf()` roda uma vez, agora ou no `load`. Se a CMP do Google definir `__tcfapi` depois (ela vem pelo `adsbygoogle.js`), o aviso próprio fica junto com a dela na UE. Só dá para provar com anúncios ligados. |
| Café: só com arquivo pronto, 3º uso, a cada 7 dias, "não mostrar", 1º uso para quem bloqueia anúncio | PLANO Doações, §49 | `coffee.ts`; `ImagePanel.tsx:751` | `coffee.test.ts:18-65`; `coffee.spec.ts:73-289` | — |
| Café nunca colado em anúncio; não imita o Baixar nem o anúncio; amarelo só no Baixar | PLANO Doações, README | `.fo-result__support` | `ads.spec.ts:243`; `quality.test.ts:63`; `theme.test.ts:49` | — |
| Nenhum texto liga doação a anúncio | PLANO Doações Regras | `src/i18n/en/support.ts:9` ("Ads cover the costs; coffees pay for new tools") | — | Esse é o texto que o próprio plano manda. A regra diz o contrário. Ambiguidade a decidir. |
| Política de Privacidade com o que o AdSense exige: Google como parceiro, cookies de terceiros, opt-out, link de sites parceiros, controlador e e-mail | PLANO Obrigatório antes do 1º anúncio | `privacy.ts` (en `:51-60`; pt e es têm as 2 URLs, o controlador e o e-mail, 8 ocorrências cada) | **Nenhum teste.** Será o `gate:prontidao` (b). | — |
| Mensagens do Privacy & Messaging, Consent Mode v2 no GA4, variáveis `PUBLIC_*` | PLANO | Console do AdSense e do Workers Builds | — | É do Victor. A política já diz "once ads are on". |
| Preset só com 3 blocos próprios (spam de busca) | PLANO Página programática | `scripts/lib/conteudo.ts:158` | `conteudo.test.ts:110-150`; `gate:conteudo` | — |

---

### (d) Acessibilidade (WCAG 2.2 AA)

| Requisito | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| axe com tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice, em toda página, a 360 e 1280 px, claro e escuro, nos 2 navegadores, exigindo status 200 | P1a c.2, P2 c.13, §76, §83 | `tests/e2e/lib/axe.ts:11-20` | `a11y.spec.ts:35-190` (PAGES vem do mapa de rotas) | O tema escuro só é testado por `prefers-color-scheme`, não por `html[data-theme]`. O axe nunca roda com a página rolada ao fim e o aviso aberto (a faixa do Victor escapou por isso). O movimento reduzido é forçado. |
| Teclado: DropZone sem `role=button`; segmentado com setas; Crop só com teclado | design README | `ImagePanel.tsx`; `OptionGroup.tsx`; `CropEditor.tsx:116-123` | `image-crop.spec.ts:94`; `image-smoke.spec.ts:287`; `design.spec.ts:470` | — |
| Foco visível e não coberto (2.4.11) | §36 | `global.css:38-42`; `CookieNotice.astro:26` | `events.spec.ts:86` (45 Tabs a 360 px, 2 páginas), `:109`; `cookie-footer.spec.ts:98` | O Tab do WebKit não para em link. O teste de 45 Tabs nesse navegador anda só por botões e campos. |
| Nomes e live regions: progressbar, resultado, erro, status | design README | `ImagePanel.tsx:660-667`, `:695`, `:790`, `:902` | `island.spec.ts:26`, `:50`; `tool.spec.ts:105` | O resultado é anunciado duas vezes (ver lista dos 8 baixos). |
| Contraste em cada par de token, nos 2 temas | P1b c.7 | `scripts/lib/contrast.ts`; `tokens.json` | `contrast.test.ts:50-127`; `design-checks.test.ts:34-68`; axe `color-contrast` | — |
| Reflow a 320 px (1.4.10) | F1b | `components.css` | `design.spec.ts:389-450` | — |
| Movimento reduzido | §44, §57 | `global.css:95` | `design.spec.ts:241-339` | **2.2.2 aberto:** os loops da `wave` e do vapor não têm controle de pausa. A F1b deixou para o Victor decidir. |
| Alvo de toque (2.5.8) | design README | `--tap-min` 48 px | axe `target-size` (tag wcag22aa) | As alças do Crop são `span` de 48 px com `aria-hidden` (§74). |
| Alternativa a arrastar (2.5.7) | F2 §74 | `CropEditor.tsx`; campos do Crop | `image-crop.spec.ts:94` | — |
| Erro de campo (3.3.1) | design NumberField | `NumberField.tsx:84-110` | `image-smoke.spec.ts:334-358` | A mensagem do Crop não diz a faixa (baixo da F2). |
| Skip link, landmarks, `lang` | — | `BaseLayout.astro:48`, `:77`, `:83` | só as regras do axe | O skip link não tem teste próprio. |
| Zoom a 200% (1.4.4) e espaçamento de texto (1.4.12) | WCAG 2.2 AA | — | **sem teste** | — |
| Aviso de cookies | — | `CookieNotice.astro:37` (`role="dialog"` não modal; não move o foco; fica depois do rodapé no DOM) | `events.spec.ts:56` | Teclado só chega ao Aceitar/Recusar depois de passar pela página inteira. Observação, não violação. |

---

### (e) Desempenho e SEO técnico

| Requisito | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| JS inicial ≤ 80 KB gzip; exatamente 2 arquivos JS por página de ferramenta; nenhum worker nem `.wasm` antes do 1º arquivo | PLANO Orçamento, §70 | `astro.config.ts:12-27` (grupo `island`) | `budgets.spec.ts:43-61` (13 páginas + hub) | Medido: 19–21,5 KB. |
| Até 8 requisições na 1ª página e até 3 novas na seguinte | PLANO Orçamento | — | `budgets.spec.ts:79-91` (7 pares) | Home, páginas de texto e pt/es só entram em pares. |
| Lighthouse no celular ≥ 90; CLS ≤ 0,05; o LCP não pode ser a Oli | PLANO Orçamento, F1b c.3 | `lighthouserc.json:5` (só `/compress-image/` e `/image-tools/`), `:11-16`; `scripts/gates/lighthouse.ts` | `gate:lhci`; `design.spec.ts:343` | LCP ≤ 2,0 s e INP ≤ 200 ms **não são asserção**; só o score e o CLS. INP não tem medida nenhuma. Acessibilidade, boas práticas e SEO ficam em `warn`. O LCP real é o texto do aviso (§55). |
| Recálculo da calculadora ≤ 16 ms | PLANO Orçamento | — | — | É da F4. |
| Memória de lote longo no celular | nota da F2 | `ImagePanel.tsx:218-232` (saída e prévia por arquivo), `:261-263` (o ZIP duplica as saídas); `process.ts:28` | **sem teste** | Saídas, prévias e ZIP ficam vivos até "Start over". É a pendência "régua do lote longo". |
| Caminho na página sem `OffscreenCanvas` | nota da F2 | `dist/_astro` tem cada `.wasm` duas vezes (`avif_dec-…` e `avif_dec.…`) | ver (a) | Os codecs rodam na thread principal. O INP nesse caminho não foi medido. |
| Tempo de cada parte do CI | ADR-003, CLAUDE.md | `scripts/verificar.ts:42-60`, `:91-95`; `ci.yml:47-62` | `verificar.test.ts:6-34` | Os relatórios não têm o tempo da suíte da F2 em partes (só a projeção de 360–520 s). Medir com `gh run view --log`. O `gate:prontidao` soma até ~90 s à parte `verificar`. |
| Título com " \| FileOrca", descrição de 50 a 170 caracteres, 1 H1, canonical, og:image que existe | PLANO SEO Técnico | `seo.ts:26-79`; `BaseLayout.astro:53-71` | `seo-pages.test.ts`; `seo-checks.test.ts`; `routes.test.ts` | O `dist` tem 35 imagens de OG. |
| hreflang recíproco (pt-BR, x-default em en), só entre equivalentes | §32 | `meta.ts:18` | `seo-checks.test.ts:16-70` | — |
| Sitemaps: índice e um por idioma, só páginas indexáveis | PLANO SEO Técnico | `src/seo/sitemap.ts` | `seo.ts:92-113`; `seo-checks.test.ts:72-112` | 19/8/8 URLs. Sem `lastmod`. |
| Schema: WebApplication sem nota, BreadcrumbList, Organization com logo, Person no Sobre, CollectionPage no hub | PLANO SEO Técnico | `meta.ts:37-116` | `seo.ts:40-63`; `seo-pages.test.ts:26-84` | Person só no Sobre (`AboutView.astro:24`). A foto do Sobre está pendente. |
| `robots.txt` fixo que libera tudo e aponta o índice; sem meta robots | PLANO | `public/robots.txt`; `seo.ts:119-122` | `platform.test.ts:56` | Googlebot e Mediapartners-Google ficam cobertos por `User-agent: *` mais `Allow: /`. |
| `_headers`: nosniff, Referrer-Policy, frame-ancestors, HSTS, noindex em workers.dev e nos 404, cache imutável em `/_astro/*` | F1a c.5 | `headers.ts:20-38` | `platform.test.ts:13-70`; `cabecalhos.ts`; `navigation.spec.ts:18` | O HTML não tem `Cache-Control` próprio. |
| 404 com status 404, busca e noindex | PLANO | `404.astro` | `navigation.spec.ts:5`, `:18`, `:144`; `worker.ts:34-37` | — |
| `LAUNCHED=true` e sem X-Robots-Tag em fileorca.com | §75 | `site.ts:3` | `pos-deploy.test.ts:61`; `platform.test.ts:42`; `cabecalhos.ts:30-32` | — |
| IndexNow: chave em `/<key>.txt`, só URLs que mudaram, só com `LAUNCHED` | §11 | `site.ts:22`; `pos-deploy.ts:110-143`; `urls-alteradas.ts:17` | `pos-deploy.test.ts:87-96`; `urls-alteradas.test.ts:6-48` | `scripts/ci` está fora do escopo. `CHECK_PAGES` tem só 4 páginas (`pos-deploy.ts:9`) e o pós-deploy não confere sitemap, 404 nem ads.txt. Se isso for achado, vira pendência. |
| Manifest e ícones | F1a | `manifest-[lang].webmanifest.ts` | só `gate:links` (o arquivo existe) | O conteúdo do manifest não tem teste. |
| Peso morto no `dist` | — | WASM de AVIF (decodificador e codificador, 2 cópias = 9,3 MB) | — | Nenhuma ferramenta o usa até a 2b (§85). Não é requisição para quem usa. A /licenses lista libavif e libaom por causa disso. |

---

### (f) Aderência ao design system

| Requisito | Fonte | Onde no código | Teste que prova | Observação |
|---|---|---|---|---|
| Tokens: o tema vem do `tokens.json`, sem hex fora do token | §41 | `src/styles/theme.css` (gerado) | `theme.test.ts`; `quality.test.ts:52-61`; `design-checks.test.ts:12-32`; `gate:design` | O teste de hex cobre `.css`, `.astro`, `.tsx`, `src/seo/*.ts` e `src/pages/*.ts`. O `BaseLayout.astro:68` tem `#0C2B5E` (`theme-color`) e passa por ser token. |
| `color:` só com tokens de texto | F1b | `src/styles/*.css` | `design-checks.test.ts:34-68` | — |
| Amarelo (`sun`) só no Baixar | PLANO Paleta | `.fo-btn--download` | `quality.test.ts:63`; `theme.test.ts:49`; `events.spec.ts:56` | — |
| Movimento só com transform, opacity, translate, scale e rotate | §44 | `components.css` | `design-checks.test.ts:70-131`; `gate:design`; `design.spec.ts:241-339` | — |
| Fontes: 2 woff2 latinos, preload só da Fredoka com a URL do `@font-face` | §42 | `BaseLayout.astro:21`, `:54`; `fonts.css` | `design.spec.ts:31`, `:66`; `design-checks.test.ts:133-182` | — |
| Oli: nove poses, ≤ 4 KB, `aria-hidden`, `[data-oli]`, sprite por página, `peek` sempre | §43, §44 | `src/oli/sprite.ts`; `OliSprite.astro`; `tools/image/Oli.tsx` | `sprite.test.ts:20-220`; `design-checks.test.ts:184-266`; `design.spec.ts:151-240` | — |
| A Oli nunca fica a menos de 150 px de um anúncio | design README | — | `ads.spec.ts` (`[data-oli]` em `TARGETS`) | — |
| Cada componente contra o README e o `preview.html` dele | `docs/design/components/*` | `src/components/*`; `tools/image/*` | Só axe e estrutura. A comparação visual é manual (`pnpm screenshots`, fora do `verificar`, §51). | `scripts/screenshots.ts:48-55` abre as páginas com `fo-consent='denied'` já gravado. Nenhum screenshot de página mostrava o aviso aberto, e por isso a faixa não aparecia. Comparar Footer e CookieNotice com o aviso aberto. |
| Footer: fundo `deep`, H2, onda, 96 px de respiro com âncora, nunca anúncio dentro | Footer README | `Footer.astro:39`; `components.css:385`, `:393` | `cookie-footer.spec.ts:62`; `ads.spec.ts` | — |
| Voz: sentence case, sem emoji, sem as palavras proibidas, 1 exclamação por tela, "tú", sem "up to 50", seta como ícone | design README Voz | `src/i18n/**`, `tools/**/i18n` | `routes.test.ts:74-87` (a regex tem 6 das 8 palavras do README: **faltam `unlock` e `magic`**); `gate:design` (setas); `lint:texto` (só gramática) | Sem teste de emoji, de exclamação por tela nem de sentence case. |
| Cor por categoria: turquesa para imagem; Image to PDF em coral | PLANO Paleta | `registry.ts:101-109` | `image-texts.test.ts:52` | — |
| Molde da página de ferramenta (ordem 1–10) | PLANO Molde | `ImageToolPage.astro:52-106` | `gate:conteudo` (`how`, `specs`, `faq`, `privacy`, `related`) | — |
| "Nunca" do README: degradê, vidro, borda colorida só à esquerda | design README | — | **sem teste** | — |

---

### Os 8 baixos que a F2 deixou para a F3

| # | Baixo | Arquivo:linha |
|---|---|---|
| 1 | A caixa do Crop não expõe valor. É `role=group` com `aria-label` e `aria-describedby`, sem `aria-valuetext` nem o valor atual. | `src/tools/crop-image/CropEditor.tsx:137-141` |
| 2 | O erro dos campos do Crop não diz a faixa. O Resize diz "from 1 to {max}". | `src/tools/crop-image/i18n/en.ts:78`, usado em `crop-image/Panel.tsx:80` e mostrado em `NumberField.tsx:107-110`. Contraste: `resize-image/i18n/en.ts:81`. |
| 3 | Uma caixa muito pequena do Crop só se move pelo teclado. As alças de 48 px cobrem a caixa, e o `pointerdown` sempre pega o `[data-corner]` mais próximo. | `CropEditor.tsx:82-96`; `src/styles/components.css:307-308` |
| 4 | A escolha da foto na fila é só a miniatura de 52 px e a borda de 3 px. O texto "Show {name}" existe apenas no `aria-label`. | `src/components/FileCard.tsx:81`; `components.css:226-229`; `src/tools/image/i18n/en.ts:32`; `ImagePanel.tsx:839` |
| 5 | O BeforeAfter diz só "50", sem `aria-valuetext`. | `src/tools/image/BeforeAfter.tsx:35-43` |
| 6 | O resultado é anunciado duas vezes: o `aria-live="polite"` do card e o `role="status"` de `m.announce`. | `ImagePanel.tsx:695` e `:902-903` (o texto é montado em `:376` e `:394`) |
| 7 | O sobretítulo e o H1 do hub são iguais ("Image tools"). | `src/i18n/en/image-tools.ts:7-8`, renderizado em `src/views/ImageToolsView.astro:46-47` |
| 8 | O `PDFDocument` da semente não confere metadados por conta própria. É da F5; só agir se a lente (b) achar GPS ou outro metadado num PDF. | `src/engine/pdf/build.ts:69-71`. O teste que existe é `pdf-build.test.ts:94-120`. |

Armadilhas ao corrigir:
- **Baixo 7:** o teste existente afirma a duplicação. `tests/unit/image-hub.test.ts:69-71` espera eyebrow e H1 iguais a "Image tools". Corrigir obriga a mudar essa asserção, e o prompt exige registrar isso num § (qual asserção mudou e por quê).
- **Baixo 6:** conferir antes `tool.spec.ts:178` e `island.spec.ts`, que dependem do `role=status` (§86(5)).

---

### O que a "Nota para a F3" do relatório da F2 pede

1. **Tempo do CI.** Toda ferramenta nova põe mais trabalho de codec na fila de 2 vCPU (ADR-003). Medir cada parte e registrar. Se passar de ~700 s, propor mais um `--shard` (ajuste de `.github/` para o Victor). Não aumentar limite, `retries` nem timeout.
2. **Acessibilidade que o axe não vê na ilha.** São os baixos 1, 2, 5 e 6 da lista acima.
3. **Caminho na página sem `OffscreenCanvas`** (Safari antigo). Os codecs rodam na thread principal e baixam outra cópia de cada `.wasm`. Ver a lacuna de teste em (a) e (e).
4. **Memória de lotes longos no celular** (o PDF de 40 fotos e a régua do lote longo, pendência da F2).
5. **Para acrescentar ferramenta:** o registro manda no hub, na home, no rodapé, na busca, no `gate:seo` e no `gate:conteudo`. Mas as listas de páginas de `budgets.spec.ts` e `ads.spec.ts` e os casos da matriz são manuais. Isso vale para a 2b e para a F4.
6. **Nota da F5 (informativa):** `src/engine/image/` já é autocontido. A semente do PDF não limpa metadados por conta própria nem monta o PDF em partes (baixo 8).

---

### Pontos extras que afetam o desenho do `gate:prontidao`

- **Reuso do `gate:seo` e do `gate:cabecalhos`:** `scripts/gates/cabecalhos.ts` e `seo.ts` são scripts de topo sem funções exportadas.
  - A lógica reutilizável está em `scripts/lib/{seo-checks,seo-pages,conteudo,dist}.ts`.
  - Para o cabeçalho, ou se extrai uma função de `cabecalhos.ts`, ou se chama `headerRules()` direto.
- **Lista de placeholders:** `scripts/lib/conteudo.ts:24-37` não tem "under construction", "em construção" nem "en construcción".
  - Também não cobre IDs falsos (`ca-pub-0000…`, `G-XXXX`, `example.com`).
  - `findPlaceholders` varre só o texto visível do `<body>`, não `<title>` nem `<meta description>`.
- **Build com ID de teste:** `buildAdsConfig()` lê `import.meta.env.PUBLIC_*`. O `ads-pages.test.ts` já renderiza as views com o Astro container e `vi.stubEnv`.
  - Esse é o caminho que o `ads-pages.test.ts` já usa.
- **Mínimo de texto no `<main>`:** o piso medido é o contato (~74 palavras). As páginas de ferramenta e preset ficam em 484–745.

### Provas para o Show HN

Afirmações que a revisão precisa provar ou tirar do texto:
- **"Funciona offline depois de carregada":** o `engine-client`, o worker e os `.wasm` carregam sob demanda.
  - O `engine-client` entra em `ImagePanel.tsx:261`, `:299` e `:516`. O grupo `island` exclui `engine-client` e `pdf-client` (`astro.config.ts:12-27`).
  - Não há service worker até a F8.
  - Offline só funciona depois do `warm()` (ponteiro ou foco) ou do primeiro uso. O cache imutável de `/_astro/*` (`headers.ts:36`) ajuda só para o que já foi baixado.
  - O teste com `setOffline(true)` precisa ser feito depois disso.
- **"Nada sobe":** conferir com `context.on('request')` ou o log do servidor, por causa da dúvida do worker no WebKit.
- **Contagens de ferramentas** no texto de lançamento: se a 2b entrar, mudam as linhas `src/i18n/en/about.ts:10` e `src/i18n/en/image-tools.ts:4` ("eight").

### Resumo de gravidade

1. **Médio:** falha de carregamento do motor mostrada como "arquivo danificado" (`ImagePanel.tsx:299,325-327`).
2. **Médio:** nenhum teste força o caminho sem `OffscreenCanvas` nem a falha do worker.
3. **Médio, a confirmar com anúncios ligados:** `tcf()` sem repetição (`CookieNotice.astro:35`).
4. **Prontidão do AdSense:** caixas "Advertisements" vazias e hub fino (162 palavras, 2 AdSlots). Definir a regra de proporção.
5. **Teste:** pt/es fora de `ads.spec.ts`; hub fora de `ads-pages.test.ts`; guarda de hostname só por string.
6. **Teste:** regex de voz sem `unlock` e `magic`; sem teste de emoji nem de uma exclamação por tela.
7. **Informativo:** INP e LCP sem asserção; WCAG 1.4.4 e 1.4.12 sem teste; screenshots sem o aviso aberto.

Arquivos de referência: `PLANO-FILEORCA.md`, `DECISOES.md`, `docs/prompts/prompt-fase-03.md`, `docs/relatorios/fase-02.md`.