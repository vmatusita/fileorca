# F3 · Revisão e prontidão para o AdSense: relatório

Branch `fase-03`, PR [vmatusita/fileorca#7](https://github.com/vmatusita/fileorca/pull/7). Prompt: `docs/prompts/prompt-fase-03.md`. Plano: `docs/relatorios/fase-03-plano.md`. Revisão: `docs/relatorios/REVISAO-F3.md`. Textos de lançamento: `docs/lancamento/`. Decisões novas: `DECISOES.md` § 91 a § 105. Run de 31/out/2026.

## Resumo

- **O aviso de cookies não deixa mais a faixa clara embaixo do rodapé.** A causa era o padding que o aviso punha no `body`. Agora a reserva vai para o rodapé, e o fundo do mar vai até o fim da página. Um teste novo falhou no código de antes (216 px do `body` abaixo do rodapé a 360 px) e passa no novo, nos dois navegadores, três larguras e dois temas. Os testes antigos de cookies passam sem mudança.
- **Um portão novo, o `gate:prontidao`, prova que o site está pronto para o pedido do AdSense.** Ele faz dois builds do mesmo código com o ID de teste e confere 18 itens: meta tag e `ads.txt` exatos, nada de anúncio sem o ID, as seis páginas obrigatórias nos três idiomas, a Privacidade com o que o AdSense pede, nenhuma página "em breve", conteúdo de verdade e rastreabilidade. Ele achou de cara um problema real, o hub com dois anúncios para 193 palavras, que ganhou um guia "qual ferramenta usar".
- **A revisão adversarial rodou em seis lentes, com um cético por achado.** Foram 42 achados. Depois dos céticos, nenhum crítico nem alto ficou de pé, e dez foram refutados. Foram corrigidos 19, cada um com teste que falha no código de antes: os 18 médios locais e o baixo 1 da F2. O d-02, o único médio que não foi corrigido, é decisão de design do Victor. Os principais:
  - o removedor de metadados deixava passar chunks privados de PNG e WebP;
  - o aviso de cookies olhava a CMP do Google duas vezes só, a âncora do AdSense podia cobrir o foco, Recusar não apagava a contagem do café na hora e "Mudar minha escolha" apagava a Recusa;
  - o motor que não carrega virava "arquivo danificado", e o worker do PDF que não sobe travava o painel;
  - a busca não anunciava o "sem resultado", e o resultado era anunciado várias vezes;
  - dois guardas de teste não provavam o que diziam (o amarelo e a voz).
- **Os oito baixos que a F2 deixou:** quatro corrigidos (1, 3, 6 e 7), três refutados (2, 4 e 5) e um fica para a F5 (8).
- **A segunda passada**, com revisores novos, confirmou que os 19 corrigidos fecharam. Ela achou dois médios novos (o codec que não carrega dentro do motor e o carregador do AdSense por `<script src>` no portão) e seis baixos nas próprias correções, todos corrigidos (§ 104).
- **A produção foi conferida só por leitura:** `robots.txt`, sitemaps, páginas obrigatórias, 404, 301, `ads.txt` 404 e cabeçalhos, tudo certo.
- **Os textos de lançamento estão em `docs/lancamento/`:** o Show HN (título de 68 caracteres), o AlternativeTo e 10 diretórios. A válvula permite 10, e a lista diz por que não são 20. As três afirmações técnicas do Show HN têm prova numa spec nova, nos dois navegadores.
- **Nenhuma dependência nova.** Nada mudou em `.github/`, `scripts/ci/` nem nos arquivos só de leitura.

## Critérios de aceitação

| # | Critério | Evidência |
| --- | --- | --- |
| 1 | O teste do aviso falhou antes e passa depois; os antigos sem mudança; screenshots | Seção "O bug do aviso de cookies". Os screenshots estão em `docs/relatorios/fase-03/cookie-*.png`. `git diff f549f1b..HEAD -- tests/e2e/events.spec.ts tests/e2e/consent.spec.ts` é vazio. |
| 2 | `REVISAO-F3.md` com método, commit, seis lentes, cético e estado | `docs/relatorios/REVISAO-F3.md` |
| 3 | Nenhum crítico ou alto aberto; a segunda passada confirma | Nenhum crítico ou alto depois dos céticos, na primeira passada e na segunda. Os 19 corrigidos fecharam, e os achados novos da segunda passada foram corrigidos (§ 104). Ver `REVISAO-F3.md`, seção "Segunda passada". |
| 4 | `gate:prontidao` no `STEPS`, verde, com controles negativos; `verificar.test.ts` verde | Seção "Prontidão"; `tests/unit/prontidao.test.ts`, 20 testes |
| 5 | Produção conferida com `curl` | Seção "Prontidão", conferência na produção |
| 6 | `docs/lancamento/` com os quatro arquivos, 20 diretórios (ou 10 pela válvula), título ≤ 80, provas | 10 diretórios, título de 68 caracteres; seção "Provas do Show HN" |
| 7 | `verificar` verde aqui e nas quatro partes do CI, abaixo de 900 s | Seções "pnpm verificar local" e "CI na PR" |
| 8 | Comentário do Workers Builds na prévia; faixa sumida a 1280 e 360 px | Seção "Prévia" |
| 9 | Nenhuma dependência nova; nada em `.github/`, `scripts/ci/` e nos arquivos só de leitura | `git diff --stat f549f1b..HEAD -- .github scripts/ci PLANO-FILEORCA.md docs/adr .githooks .claude/settings.json docs/design` é vazio. No `package.json` entrou só o script `gate:prontidao`, e o `pnpm-lock.yaml` não mudou. |
| 10 | Depois do merge: `build.txt`, pós-deploy, faixa sumida em produção | Conferido só por leitura depois do merge. O relatório é commitado antes do merge, então o resultado está na resposta final da run. O roteiro é `curl https://fileorca.com/build.txt`, `gh run list --workflow pos-deploy.yml` e `.cache/f3/check-band.ts https://fileorca.com`, com o Google bloqueado. |

## O que mudou, por área

- **Aviso de cookies** (`src/components/CookieNotice.astro`, `src/styles/components.css`):
  - a reserva vai para o rodapé por `--fo-bottom-room`, e a âncora do AdSense tem reserva própria;
  - o `focusin` respeita a âncora;
  - a CMP é procurada por 30 s;
  - Recusar apaga a contagem do café;
  - "Mudar minha escolha" guarda a escolha até haver outra e devolve o foco a quem abriu.
- **Portão:** `scripts/gates/prontidao.ts`, `scripts/lib/prontidao.ts` e `scripts/lib/headers-file.ts`. O `robotsProblems()` saiu do `gate:seo`, o `headerBlocks()` saiu do `gate:cabecalhos`, e o `conteudo.ts` passou a exportar o `visibleText()`. O passo novo entrou no `STEPS`.
- **Hub:** o guia "Which tool do you need?" e o H1 "Eight image tools, zero uploads".
- **Motor:**
  - `strip.ts` com lista de permissão;
  - `engine-client.ts` sem `warm` num worker que não vai trabalhar;
  - `pdf-client.ts` com tratamento de worker quebrado;
  - `ImagePanel.tsx` com o motivo `load`, sem `aria-live` no cartão.
  - `errors.ts` com o `loading()`: toda carga sob demanda de codec (módulo, cola e `.wasm`) vira `load`, e `load` entrou no `FailureReason` (§ 104).
- **Crop:** a caixa diz o que cobre, e a caixa pequena se move com o ponteiro.
- **Busca:** uma região `role="status"` para o "sem resultado".
- **Textos:** a Privacidade nos três idiomas (o Analytics sem cookies depois da Recusa), as falas de `load` nos três idiomas e o valor da caixa do Crop.
- **Eventos:** `load` entrou na lista fechada de `reason` do `tool_error`.
- **Testes:**
  - specs novas: `cookie-footer`, `consent-choice`, `engine-paths` e `launch-claims`;
  - unitário novo: `prontidao`;
  - testes reforçados: `strip`, `quality` (amarelo), `routes` (voz), `consent`, `island`, `navigation`, `image-crop`, `image-smoke` e `tool`.
- **Documentos:** o plano, a revisão, este relatório, `docs/lancamento/`, os § 91 a § 105 e a seção "F3: revisão e prontidão" no fim do CLAUDE.md. O `pnpm screenshots` passou a gravar em `docs/relatorios/fase-03/componentes/`, com o fim da página e o aviso aberto.

## Árvore do que nasceu ou mudou

```
docs/
  lancamento/                README.md, show-hn.md, alternativeto.md, diretorios.md (novos)
  prompts/prompt-fase-03.{md,txt}
  relatorios/fase-03-plano.md, fase-03.md, REVISAO-F3.md (novos)
  relatorios/fase-03/        cookie-{before,after,preview,prod-before}-*.png, componentes/ (pnpm screenshots)
scripts/
  gates/prontidao.ts         novo
  lib/prontidao.ts           novo
  lib/headers-file.ts        novo (headerBlocks, patternApplies)
  gates/cabecalhos.ts, gates/seo.ts, lib/seo-checks.ts, lib/conteudo.ts   reuso
  verificar.ts               passo novo no STEPS
  screenshots.ts             pasta da F3 e o aviso aberto
src/
  components/CookieNotice.astro, components/SearchBox.astro, search/search.ts
  styles/components.css
  engine/image/{strip.ts, errors.ts, types.ts, decode.ts, encode.ts, process.ts, work.ts, codecs/{runtime,jpeg,webp,avif}.ts}
  tools/image/{ImagePanel.tsx, engine-client.ts, pdf-client.ts, i18n/{en,pt,es}.ts}
  tools/crop-image/{CropEditor.tsx, Panel.tsx, i18n/en.ts}
  views/ImageToolsView.astro, i18n/en/image-tools.ts, i18n/{en,pt,es}/privacy.ts, i18n/types.ts
  analytics/events.ts
tests/
  e2e/cookie-footer.spec.ts, consent-choice.spec.ts, engine-paths.spec.ts, launch-claims.spec.ts   novos
  e2e/{image-crop, image-smoke, island, navigation, tool}.spec.ts                                    reforçados
  unit/prontidao.test.ts                                                                             novo
  unit/{consent, image-hub, quality, routes, strip}.test.ts                                          reforçados
CLAUDE.md, DECISOES.md, package.json (só o script gate:prontidao)
```

## O bug do aviso de cookies

**Causa, provada.** O `reserve()` do `CookieNotice.astro` punha no `document.body` um `padding-bottom` igual à altura do aviso + o `bottom` + 8 px, para o foco nunca ficar embaixo do aviso (§ 36). O `html` não tem fundo próprio, então o `--bg` do `body` pinta a tela inteira, e o padding fica depois do `.fo-footer`, que é o último elemento da página e tem fundo `--deep`. Por isso sobrava a faixa clara. Com a âncora do AdSense, a âncora era contada duas vezes (nos 96 px do `.fo-footer--anchor` e no `bottom` do aviso).

**O teste antes da correção.** `tests/e2e/cookie-footer.spec.ts` carrega a home, a Compress image e a Privacidade uma vez por navegador. No mesmo carregamento, confere três larguras (360, 768 e 1280) e os dois temas, pelos dois caminhos (`prefers-color-scheme` e `html[data-theme]`). No código de antes, 8 testes falharam e 2 passaram (`.cache/f3/cookie-before-final.txt`). O primeiro erro:

```
  1) [chromium] › tests\e2e\cookie-footer.spec.ts:62:3 › /: with the cookie notice open the page ends at the footer, and Accept takes the room away

    Error: / 360px light (media)

    expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Object {
    -   "below": "ok",
    +   "below": 216,
        "footerAboveNotice": "ok",
      }

    Call Log:
    - Timeout 5000ms exceeded while waiting on the predicate
```

O caso da âncora deu `"below": 316` e `"gap": 105`: a última linha do rodapé ficava a 105 px do aviso, com a âncora contada duas vezes.

**A correção** (§ 91). O script publica a reserva em `--fo-bottom-room` no `<html>` (o nome era `--fo-cookie-room` até a § 101), e o `.fo-footer` soma essa variável ao padding de baixo. Com a âncora, vale o maior entre 96 px e o respiro mais a reserva. O `scroll-padding-bottom` continua no `<html>`, e o `focusin` da § 36 não mudou. Não entrou cor, sombra, raio nem JS a mais, e o script continua inline. Depois da correção, os 10 testes passam, e os 34 de `events.spec.ts` e `consent.spec.ts` passam sem mudança (44 de 44).

**Os outros três sintomas.**
- O aviso fecha: o `consent.spec.ts` clica em Aceitar e Recusar e espera o aviso escondido.
- O aviso não volta: o mesmo teste navega por três páginas depois da escolha.
- A página não pula: a reserva entra antes da primeira pintura, e o CLS do Lighthouse é 0,001 e 0,000.

Nenhum dos três se reproduziu.

**Screenshots** da home rolada até o fim, com o aviso aberto, no Chromium:

| | 1280 claro | 1280 escuro | 360 claro | 360 escuro |
| --- | --- | --- | --- | --- |
| Antes (`dist/` local) | [antes](fase-03/cookie-before-1280-light.png) | [antes](fase-03/cookie-before-1280-dark.png) | [antes](fase-03/cookie-before-360-light.png) | [antes](fase-03/cookie-before-360-dark.png) |
| Depois (`dist/` local) | [depois](fase-03/cookie-after-1280-light.png) | [depois](fase-03/cookie-after-1280-dark.png) | [depois](fase-03/cookie-after-360-light.png) | [depois](fase-03/cookie-after-360-dark.png) |
| Produção antes do merge (Google bloqueado) | [prod](fase-03/cookie-prod-before-1280-light.png) | [prod](fase-03/cookie-prod-before-1280-dark.png) | [prod](fase-03/cookie-prod-before-360-light.png) | [prod](fase-03/cookie-prod-before-360-dark.png) |
| Prévia da PR, `72f0c2d` | [prévia](fase-03/cookie-preview-1280-light.png) | [prévia](fase-03/cookie-preview-1280-dark.png) | [prévia](fase-03/cookie-preview-360-light.png) | [prévia](fase-03/cookie-preview-360-dark.png) |

Medida (`.cache/f3/check-band.ts`): na produção de hoje, 202 px do `body` abaixo do rodapé a 1280 e 216 px a 360, nos dois temas; na prévia, 0 px nas quatro combinações.

## Revisão

O detalhe completo está em `docs/relatorios/REVISAO-F3.md`.

Commit revisado: `736b1cd`. Seis lentes Sonnet numa worktree só de leitura, um cético por achado crítico, alto ou médio, e um cético em lote para os baixos de cada lente: 31 agentes ao todo. Depois, uma segunda passada com três revisores novos e céticos: 5 agentes.

| Lente | Achados | Crítico | Alto | Médio | Baixo | Refutados | Corrigidos | Pendentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (a) Corretude | 7 | 0 | 0 | 4 | 2 | 1 | 4 | 2 |
| (b) Privacidade | 7 | 0 | 0 | 4 | 2 | 1 | 4 | 2 |
| (c) Política de anúncio e consentimento | 8 | 0 | 0 | 3 | 2 | 3 | 3 | 2 |
| (d) Acessibilidade | 9 | 0 | 0 | 5 | 1 | 3 | 5 | 1 |
| (e) Desempenho e SEO técnico | 5 | 0 | 0 | 1 | 3 | 1 | 1 | 3 |
| (f) Aderência ao design system | 6 | 0 | 0 | 2 | 3 | 1 | 2 | 3 |
| **Total** | 42 | 0 | 0 | 19 | 13 | 10 | 19 | 13 |

As colunas de severidade contam o veredito final do cético, sem os refutados. A lente (d) tem um pendente médio (d-02) além dos baixos.

- **Rebaixados pelo cético:** b-01 (alto → médio), d-01 (alto → médio), d-02 (alto → médio) e e-02 (médio → baixo). **Subido:** d-06 (baixo → médio).
- **Refutados, com a evidência no `REVISAO-F3.md`:**
  - a-07: os portões que dizem o que não conferiram;
  - b-05: os valores livres de `tool`, `lang` e outros nos eventos;
  - c-05: "Ads cover the costs" é o texto que o próprio plano manda;
  - c-06: o hub fora do `ads-pages.test.ts`;
  - c-07: outros fornecedores na Privacidade;
  - d-05, d-08 e d-09: os baixos 2, 4 e 5 da F2;
  - e-03: LCP e INP sem asserção;
  - f-05: a nota de metadados.
- **Corrigidos:** c-01, c-02, c-03, b-02, b-03, d-01 e d-04 (§ 101); a-04 e b-01 (§ 100); a-01, a-02, a-03, b-04, d-03, d-06, d-07, e-01, f-01 e f-02 (§ 102). Cada um tem teste que falha no código de antes.
- **Pendentes:** o d-02 (decisão de design do Victor) e os baixos da § 103.
- **Segunda passada** (§ 104): os 19 corrigidos fecharam. Apareceram dois médios novos, confirmados pelos céticos: o codec que não carrega dentro do motor e o carregador do AdSense por `<script src>` no portão. Apareceram também seis baixos sobre as próprias correções (o aviso que piscava 500 ms com a CMP antes do `load`, e testes novos que não provavam tudo). Todos foram corrigidos no `72f0c2d`, com testes que falham no código de antes e mutantes que agora reprovam. **Nenhum crítico ou alto ficou aberto.**

## Prontidão

### O que o `gate:prontidao` confere

Saída do portão sobre o build final (`pnpm gate:prontidao`):

```
prontidão: build client em 8.3 s (.cache\prontidao\client)
prontidão: build all em 8.2 s (.cache\prontidao\all)

ok    Meta tag do AdSense em toda página, com o ID                              build com só PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000: uma <meta> no <head> de cada um dos 38 HTML
ok    ads.txt com a linha exata da ajuda do AdSense                             "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0", escrita à mão a partir da ajuda, contra o /ads.txt desse build
ok    Sem carregador nem unidade só com o ID                                    nenhum adsbygoogle.js, googlesyndication nem ins.adsbygoogle nesse build
ok    Carregador só nas ferramentas, nunca em página jurídica ou institucional  build com as três variáveis (ID, unidades de teste e PUBLIC_ADS_ENABLED=true): o carregador está nas páginas com área de anúncio, com a trava do hostname, e em nenhuma outra
ok    Build de hoje, sem o ID: nenhum anúncio                                   dist/ real: nenhuma meta, ads.txt ou script de anúncio; 28 AdSlot(s) só com o espaço neutro
ok    Sobre, Contato, Privacidade, Termos, Licenças e Apoio nos três idiomas    mapa de rotas: indexáveis, com o arquivo no build (o handler responde 200)
ok    As seis no rodapé de toda página                                          links do <footer> de cada HTML, no idioma da página
ok    O Contato mostra contato@fileorca.com                                     texto visível do <main> e link mailto, nos três idiomas
ok    A Privacidade tem o que o AdSense pede                                    texto do <main> nos três idiomas: Google como parceiro, cookies de terceiros, o Analytics sem cookies depois da Recusa, links do Ads Settings e de sites parceiros, controlador e e-mail
ok    Nenhum texto de obra                                                      texto visível de 38 HTML nos três idiomas: coming soon, em breve, próximamente, lorem, ipsum, TODO, TBD, placeholder text, más adelante, more tools are coming, mais ferramentas estão a caminho, vienen más en camino, under construction, em construção, en construcción
ok    Nenhum ID de mentira                                                      49 arquivos de texto do build: ca-pub-0000…, pub-0000…, G-XXXX…, example.com
ok    Cartões e busca só com o que existe                                       cartões da home e do hub iguais ao registro, cada link e cada item do search-index.json com a página no build
ok    H1, título e descrição próprios                                           35 páginas indexáveis: um H1 e nenhum H1, título ou descrição repetido
ok    Texto mínimo no <main>                                                    60 palavras visíveis, sem o rótulo dos AdSlots (o Contato tem 74 hoje)
ok    Mais conteúdo que anúncio                                                 150 palavras do <main> para cada AdSlot (uma tela de celular de texto por anúncio)
ok    robots.txt não bloqueia ninguém e aponta os sitemaps                      nenhum Disallow com caminho (Googlebot e Mediapartners-Google incluídos), Allow: / e o Sitemap do índice
ok    Nenhuma página indexável com noindex                                      <meta name="robots"> e regras do _headers que valem em https://fileorca.com para as 35 páginas indexáveis
ok    Sitemaps só com páginas 200 e indexáveis                                  índice com os 3 sitemaps; 35 URLs, cada uma indexável e com o arquivo no build

prontidão: ok, 18 itens
```

Os limiares e as regras estão na § 95. O teste `tests/unit/prontidao.test.ts` tem 20 testes, com um site de mentira que passa em tudo e uma quebra de cada vez que reprova o item certo.

### Conferência na produção (só leitura)

Saídas reais do `curl` em 31/out/2026 (`.cache/f3/producao.txt`), com a produção em `f549f1b`:

```
# Conferência da produção (só leitura), 2026-10-31T18:04Z

$ curl -s https://fileorca.com/build.txt
f549f1bfaa618bb296c679014710c998dcebf529

$ curl -s https://fileorca.com/robots.txt | diff - public/robots.txt && echo igual
igual

$ curl -s https://fileorca.com/sitemap-index.xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://fileorca.com/sitemap-en.xml</loc></sitemap>
  <sitemap><loc>https://fileorca.com/sitemap-pt.xml</loc></sitemap>
  <sitemap><loc>https://fileorca.com/sitemap-es.xml</loc></sitemap>
</sitemapindex>

$ curl -s https://fileorca.com/sitemap-en.xml | grep -c '<loc>'; diff com dist/sitemap-en.xml
19
igual ao dist/sitemap-en.xml

$ curl -s https://fileorca.com/sitemap-pt.xml | grep -c '<loc>'; diff com dist/sitemap-pt.xml
8
igual ao dist/sitemap-pt.xml

$ curl -s https://fileorca.com/sitemap-es.xml | grep -c '<loc>'; diff com dist/sitemap-es.xml
8
igual ao dist/sitemap-es.xml

$ páginas obrigatórias: status e x-robots-tag
/about/  HTTP/1.1 200 OK  sem x-robots-tag
/contact/  HTTP/1.1 200 OK  sem x-robots-tag
/privacy/  HTTP/1.1 200 OK  sem x-robots-tag
/terms/  HTTP/1.1 200 OK  sem x-robots-tag
/licenses/  HTTP/1.1 200 OK  sem x-robots-tag
/support/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/sobre/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/contato/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/privacidade/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/termos/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/licencas/  HTTP/1.1 200 OK  sem x-robots-tag
/pt/apoie/  HTTP/1.1 200 OK  sem x-robots-tag
/es/acerca-de/  HTTP/1.1 200 OK  sem x-robots-tag
/es/contacto/  HTTP/1.1 200 OK  sem x-robots-tag
/es/privacidad/  HTTP/1.1 200 OK  sem x-robots-tag
/es/terminos/  HTTP/1.1 200 OK  sem x-robots-tag
/es/licencias/  HTTP/1.1 200 OK  sem x-robots-tag
/es/apoyo/  HTTP/1.1 200 OK  sem x-robots-tag

$ curl -sI https://fileorca.com/nao-existe-f3/ | head -1
HTTP/1.1 404 Not Found

$ /cdn-cgi/ e cloudflareinsights no HTML
/  ocorrências: 0
/compress-image/  ocorrências: 0
/image-tools/  ocorrências: 0
/privacy/  ocorrências: 0
/pt/  ocorrências: 0
/es/comprimir-imagen/  ocorrências: 0

$ redirecionamentos
http://fileorca.com/  301 -> https://fileorca.com/
https://www.fileorca.com/  301 -> https://fileorca.com/
http://www.fileorca.com/  301 -> https://www.fileorca.com/
https://www.fileorca.com/compress-image/  301 -> https://fileorca.com/compress-image/

$ curl -sI https://fileorca.com/ads.txt | head -1
HTTP/1.1 404 Not Found

$ cabeçalhos de segurança da home
Strict-Transport-Security: max-age=31536000; includeSubDomains
content-security-policy: frame-ancestors 'self'
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff


$ IndexNow key
4ad5aef34d8b1746ec596c51d0f4fa1a

$ meta google-adsense-account na home
0

$ cache de um asset /_astro/ da produção
/_astro/CompressImagePage.astro_astro_type_script_index_0_lang.BDMKuEio.js
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable

$ HTML da home: cache-control e content-type
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: public, max-age=0, must-revalidate
x-content-type-options: nosniff
```

O `ads.txt` dá 404 porque o ID ainda não existe. O `http://www` leva a `https://www` e depois a `https://fileorca.com/` (dois 301). A lente (e) comparou a produção com o `dist/` e achou só o delta esperado dos commits da F3 e os cabeçalhos `Nel`/`Report-To` e `Speculation-Rules` da zona, fora do repositório (§ 103).

## Provas do Show HN

| Afirmação | Prova | Resultado |
| --- | --- | --- |
| "No byte of your file leaves your browser" | `tests/e2e/launch-claims.spec.ts`, na Compress (MozJPEG), na HEIC to JPG (libheif) e na Image to PDF. `context.on('request')` vê a página e os workers (a lente (a) provou que vê as requisições de dentro do worker nos dois navegadores). | Toda requisição, da carga ao download, é GET para a própria origem e sem corpo: 3 de 3 no Chromium e no WebKit |
| "After the page and the codec load, the tool keeps working offline" | o mesmo teste: `context.setOffline(true)` depois do primeiro arquivo | O segundo arquivo foi processado e baixado sem nenhuma requisição de rede: 3 de 3 nos dois navegadores |
| "The only third-party traffic is Google Analytics" | `.cache/f3/prod-hosts.ts` na produção, com o Google bloqueado; `consent.spec.ts` | Na produção, a home e um uso real da Compress pediram só `fileorca.com` (23 GETs) e `www.googletagmanager.com` (2, bloqueados). Fora dela, nenhum pedido ao Google |

O LanguageTool local passou pelos 15 blocos em inglês de `docs/lancamento/` (`.cache/f3/lt-lancamento.txt`): 37 apontamentos e nenhum de gramática. Os apontamentos são nomes próprios que o dicionário não conhece, um "url", um espaço duplo num bloco YAML e um aviso de estilo (três frases seguidas começando por "I").

## pnpm verificar local

Execução limpa em 31/out/2026, no commit `72f0c2d`, o último com código de produção. Depois dele entraram o `0d2cb94`, que só mexe em dois testes, este relatório e os screenshots. Os dois testes mudados rodaram de novo aqui, nos dois navegadores, duas vezes cada: 8 de 8 verdes. Ambiente: Windows 11, AMD Ryzen 5 7600X, Node 26.8.1 (o CI usa o 24 do `.node-version`) e pnpm 10. O `pnpm install --frozen-lockfile` passou (`install exit 0`), e o `pnpm verificar` apagou o `dist/` e buildou do zero. A saída completa está em `.cache/f3/verificar-final.log`; abaixo vão o resumo e as linhas de cada contagem.

```
Resumo do pnpm verificar (tudo)
  ok       7.8 s  tipos (astro check)
  ok       2.3 s  lint (eslint)
  ok       8.7 s  build (astro build do zero)
  ok       5.1 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.5 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.4 s  links internos e páginas órfãs
  ok       0.5 s  conteúdo mínimo das ferramentas e do site
  ok      17.2 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.8 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     147.1 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      71.7 s  lighthouse ci
  ok      10.0 s  lint:texto (LanguageTool)
  total 279.9 s (limite 900 s)
verificar exit 0
```

- **Vitest:** 48 arquivos, 778 passed (778).
- **Playwright:** 536 passed (2.4m) nos dois navegadores, sem `retries` e sem `skip`.
- **lint:texto: 8 arquivo(s), 498 textos, 0 erro(s) de gramática, 194 aviso(s)**: os avisos são de ortografia (nomes próprios, `{name}` e `px`) e de estilo.
- **Lighthouse local:**

```
lighthouse (celular): /compress-image/ → performance 99, accessibility 100, best-practices 100, seo 100
lighthouse (celular): LCP 1.74 s em body > div#fo-cookie > p#fo-cookie-text (Cookies, quickly. We use Google Analytics to see which tools help, and ads to k…); CLS 0.001
lighthouse (celular): /image-tools/ → performance 100, accessibility 100, best-practices 100, seo 100
lighthouse (celular): LCP 1.44 s em div.fo-frame > main#main > div.fo-hubband > p.fo-muted (Eight tools to compress, resize, crop, rotate, convert and combine images, all …); CLS 0.000
```

## CI na PR

Execução verde do CI no commit `0d2cb94` (o último com código ou teste antes deste relatório): run [41236243545](https://github.com/vmatusita/fileorca/actions/runs/41236243545). As quatro partes, com o tempo do resumo do `verificar` e o do job:

| Parte | Comando | Testes | Total do `verificar` | Job |
| --- | --- | --- | ---: | ---: |
| `verificar` | `pnpm verificar --sem-playwright` | os 16 passos (tipos, lint, build, Vitest, os portões, Lighthouse e `lint:texto`), com `gate:prontidao` em 14,5 s e Lighthouse em 77,1 s | 201,5 s | 257 s |
| `playwright (chromium)` | `pnpm verificar --playwright=chromium` | 268 passed | 315,2 s | 371 s |
| `playwright (webkit 1 de 2)` | `pnpm verificar --playwright=webkit --shard=1/2` | 134 passed | 375,8 s | 450 s |
| `playwright (webkit 2 de 2)` | `pnpm verificar --playwright=webkit --shard=2/2` | 134 passed | 644,4 s | 710 s |

Todas ficaram abaixo de 900 s, e o `verificar` de cada parte ficou abaixo do alvo de 700 s. O job `merge` respondeu "PR em rascunho" e não mesclou. A evolução das quatro partes ao longo da run está na § 105. A parte 2 do WebKit ficou a uns 50 s do alvo, e a § 105 propõe um terceiro `--shard` do WebKit (ajuste de `.github/`, do Victor).

Falhas no meio do caminho, todas corrigidas e registradas na § 99:
- na run 41227322450 (`736b1cd`), o teste antigo de eventos da ilha, uma corrida do próprio teste no WebKit;
- na run 41235192185 (`72f0c2d`), o teste novo de codec, porque o `page.route` não segura os pedidos do worker no WebKit do Linux, e o teste antigo da folha da Image to PDF, porque o link some enquanto o PDF é montado de novo.

Nenhum `skip`, `fixme`, `only`, `retries` ou `continue-on-error` novo: `git diff f549f1b..HEAD -- tests playwright.config.ts | grep -E "test.(skip|fixme|only)|retries|continue-on-error"` dá vazio.

## Desempenho

Lighthouse no celular, no runner do CI (`lighthouserc.json`: `/compress-image/` e `/image-tools/`):

| Página | Antes (F2, run 41219109198) | Depois (F3, run 41236243545) |
| --- | --- | --- |
| `/compress-image/` | desempenho 100, LCP 1,52 s no texto do aviso, CLS 0,001 | desempenho 100, LCP 1,69 s no texto do aviso, CLS 0,001 |
| `/image-tools/` | desempenho 100, LCP 1,36 s no `p.fo-muted` da faixa do hub, CLS 0,000 | desempenho 100, LCP 1,36 s no texto do aviso, CLS 0,000 |

O LCP continua sendo o texto do aviso de cookies (§ 55). No hub, ele passou do parágrafo da faixa para o texto do aviso, com o mesmo tempo, porque o H1 novo deixou o parágrafo mais baixo. O guia novo fica embaixo da dobra. Os 0,17 s a mais da Compress estão dentro da variação do runner: a mesma página deu 1,66 e 1,67 s nas runs anteriores desta PR. Lighthouse local, no fim do `verificar`: Compress 99 (LCP 1,74 s) e hub 100 (LCP 1,44 s).

## Screenshots

`pnpm screenshots` sobre o build final, em `docs/relatorios/fase-03/componentes/`. Ele grava os componentes nos dois temas e, a partir desta run, o fim da página com o aviso aberto (`footer-cookie-open-{light,dark}-{360,1280}.png`). Os da F2 ficam em `fase-02/`.

| Estado | Largura | Claro | Escuro |
| --- | --- | --- | --- |
| Fim da página com o aviso aberto (novo) | 360 px | [claro](fase-03/componentes/footer-cookie-open-light-360.png) | [escuro](fase-03/componentes/footer-cookie-open-dark-360.png) |
| Fim da página com o aviso aberto (novo) | 1280 px | [claro](fase-03/componentes/footer-cookie-open-light-1280.png) | [escuro](fase-03/componentes/footer-cookie-open-dark-1280.png) |
| Rodapé | 360 px | [claro](fase-03/componentes/footer-light-360.png) | [escuro](fase-03/componentes/footer-dark-360.png) |
| Aviso de cookies | 360 px | [claro](fase-03/componentes/cookie-notice-light-360.png) | [escuro](fase-03/componentes/cookie-notice-dark-360.png) |
| Hub com o guia (página inteira) | 1280 px | [claro](fase-03/componentes/hub-page-light-1280.png) | [escuro](fase-03/componentes/hub-page-dark-1280.png) |
| Hub com o guia (página inteira) | 360 px | [claro](fase-03/componentes/hub-page-light-360.png) | [escuro](fase-03/componentes/hub-page-dark-360.png) |
| Faixa do hub (sobretítulo e H1 novos) | 1280 px | [claro](fase-03/componentes/hub-band-light-1280.png) | [escuro](fase-03/componentes/hub-band-dark-1280.png) |
| Editor de corte | 360 px | [claro](fase-03/componentes/crop-editor-light-360.png) | [escuro](fase-03/componentes/crop-editor-dark-360.png) |
| Busca sem resultado | 360 px | [claro](fase-03/componentes/search-empty-light-360.png) | [escuro](fase-03/componentes/search-empty-dark-360.png) |

Os outros 74 arquivos são os componentes da F1b e da F2 refeitos sobre o build final (92 ao todo).

## Prévia

O comentário do Workers Builds apareceu na PR a cada push, com o build e o deploy verdes. A URL da branch é https://fase-03-fileorca.vmatusita.workers.dev.

Conferido na prévia do commit `72f0c2d` (https://2ce84bd6-fileorca.vmatusita.workers.dev) e, antes, na do `736b1cd` (https://e66b9438-fileorca.vmatusita.workers.dev), com `.cache/f3/check-band.ts` (Chromium, todo domínio do Google bloqueado):

- `/build.txt` traz `72f0c2da7346f3dbe8e741a0763676b2a8616892`, e a home responde 200 com `x-robots-tag: noindex` (a regra de `*.workers.dev`);
- a home rolada até o fim, com o aviso aberto, tem 0 px do `body` abaixo do rodapé a 1280 e a 360 px, nos temas claro e escuro;
- nenhum pedido ao Google, porque a trava de hostname nem carrega o `gtag.js` fora de fileorca.com.

Os screenshots da prévia estão na tabela da seção do bug (linha "Prévia da PR", agora do `72f0c2d`).

## Decisões novas

- § 91: o aviso de cookies reserva o espaço no rodapé.
- § 92 a § 94: o método da revisão, a severidade e o que se corrige.
- § 95: o `gate:prontidao`.
- § 96: o guia e o H1 do hub.
- § 97: a produção conferida só por leitura.
- § 98: os textos de lançamento e as provas.
- § 99: os testes que mudaram, e por quê.
- § 100: o removedor de metadados com lista de permissão.
- § 101 e § 102: as correções da revisão.
- § 104: o que a segunda passada achou e foi corrigido.
- § 105: o tempo do CI e a proposta de um terceiro `--shard` do WebKit.
- § 103: o que fica pendente, e com quem.

## O que a válvula cortou e o que fica para a 3b

- **Diretórios:** 10, não 20 (item 1 da válvula). O motivo de cada exclusão está em `docs/lancamento/diretorios.md`: esquema de link, lista parada ou página que não abriu.
- **Médios:** nenhum foi cortado. O d-02 (loops da Oli, WCAG 2.2.2) não é corte: é decisão de design do Victor (§ 103).
- **Run 3b** (baixos confirmados, com a correção proposta no `REVISAO-F3.md`):
  - a-05: APNG perde a animação sem nota;
  - a-06: pt e es no `ads.spec.ts`;
  - b-06: GET com query e WebSocket na prova de "nada sai";
  - e-02: régua de memória do lote longo;
  - e-04: `favicon.ico`;
  - f-03: portão de cor funcional, raio, sombra e os "Nunca";
  - f-04: plural de "1 files";
  - f-06: reserva do aviso reaberto ao mudar a largura.
- **Proposta para o Victor (`.github/`):** um terceiro `--shard` do WebKit, se a parte 2 de 2 passar de 700 s com a variação do runner. Nesta run ela ficou entre 431 e 655 s (§ 105).

## O que é do Victor, em passos

1. **Ligar o AdSense para a revisão** (passo 2 de "Como o anúncio liga"):
   1. Abra a conta do AdSense em <https://adsense.google.com/>, ou use a que já tiver em seu nome (é uma conta por pessoa), e adicione o site `fileorca.com`.
   2. Copie o ID do editor (`ca-pub-` mais 16 dígitos).
   3. No Cloudflare, em Workers & Pages → `fileorca` → Settings → Build → Variables and secrets, crie a variável de build `PUBLIC_ADSENSE_CLIENT` com esse ID. Deixe `PUBLIC_ADS_ENABLED` em `false` e não crie `PUBLIC_ADSENSE_SLOTS` ainda.
   4. Mudar variável não dispara build. Em Deployments, abra o último build da `main` e use **Retry**.
   5. Quando o build terminar, confira a linha do `ads.txt` (deve ser `google.com, pub-…, DIRECT, f08c47fec0942fa0`, com o seu número no lugar dos pontos):

      ```bash
      curl -s https://fileorca.com/ads.txt
      ```

   6. Confira a meta tag na home (deve aparecer uma vez, com o seu `ca-pub-…`):

      ```bash
      curl -s https://fileorca.com/ | grep -o '<meta name="google-adsense-account"[^>]*>'
      ```

   7. Confira que nenhum carregador entrou (deve dar 0):

      ```bash
      curl -s https://fileorca.com/compress-image/ | grep -c adsbygoogle.js
      ```

   8. No AdSense, escolha a verificação pela meta tag, marque a confirmação, clique em **Verify** e depois em **Request review**. A revisão costuma levar de dias a 2 a 4 semanas.
2. **Show HN no dia seguinte ao merge, antes de ligar os anúncios.** Use `docs/lancamento/show-hn.md`. Reescreva o título e o primeiro comentário com as suas palavras, porque o HN proíbe texto de IA nos comentários. Fique disponível nas primeiras horas e nunca peça voto.
3. **AlternativeTo e diretórios, de 2 a 3 h**, depois do merge: `docs/lancamento/alternativeto.md` e `diretorios.md`. A chance no AlternativeTo é baixa, porque o FAQ recusa suítes de ferramentas simples; tente mesmo assim, sem pagar a revisão prioritária.
4. **Bing Webmaster:** enviar `https://fileorca.com/sitemap-index.xml`, se ainda não foi.
5. **Pendências da F1 e da F2 que seguem abertas:**
   - os campos vazios do `docs/F0-SAIDA.md`;
   - a busca reversa da Oli (bom fazer antes do Show HN, que mostra a Oli para muita gente);
   - a foto do Sobre;
   - o padrão da YouTube thumbnail (§ 60);
   - a HEIC no Safari de verdade.
6. **Decisões que a revisão deixou para você** (§ 103):
   - os loops da Oli e do vapor (WCAG 2.2.2): limitar a 5 s ou pôr um controle de pausa;
   - antes de ligar os anúncios, a reaplicação do Aceitar nas regiões da UE com a CMP (c-04), conferida na UE com a CMP publicada;
   - a retenção do GA4, para pôr o número na Privacidade;
   - se desliga o Speed Brain (`Speculation-Rules`) da zona.
7. **`.github/` e `scripts/ci/`:** nenhum achado nessas pastas. Só a proposta do terceiro `--shard` do WebKit, se a parte 2 de 2 passar de 700 s.
8. **Gerar o prompt da 2b** (Convert to WebP/AVIF e AVIF to JPG) **e o da F4.** As linhas de `docs/lancamento/` que mudam com a 2b estão marcadas com `<!-- muda com a 2b -->`.

## Nota para a F4

- **Orçamentos:** a página de ferramenta carrega exatamente 2 arquivos JS (o `mount` e o grupo `island`). A calculadora vai precisar do mesmo cuidado: import de motor só pelo cliente dinâmico, nunca na ilha.
- **Distância dos anúncios:** o `ads.spec.ts` só cobre as páginas em inglês e não tem o hub (a-06, pendente). A F4 tem campos e menus suspensos, que o `TARGETS` já inclui. Ponha cada página nova de calculadora, nos idiomas em que existir, no `TOOL_PAGES` do `ads.spec.ts` e do `budgets.spec.ts`.
- **Campos e teclado:** o `NumberField` mostra o erro com `role=alert` e diz a faixa no Resize. A revisão refutou a falta de faixa no Crop, mas na calculadora a faixa de cada campo é fixa e conhecida: diga a faixa.
- **Anúncio do resultado:** a região `role="status"` é a única voz da ferramenta (§ 102). A calculadora que recalcula a cada tecla não pode anunciar a cada tecla.
- **Prontidão:** o `gate:prontidao` exige 150 palavras do `<main>` por AdSlot e 60 palavras em toda página indexável. Uma página de calculadora com dois AdSlots precisa de pelo menos 300 palavras. O hub de dinheiro vai precisar de texto próprio, como o de imagem ganhou (§ 96).
- **Eventos:** um `reason` ou um `outcome` novo entra na lista fechada de `src/analytics/events.ts`, com teste no `consent.test.ts`.
