# F19a · plano da run "Confiança e conteúdo"

Gabarito da revisão final, escrito pelo agente principal depois da exploração e da fatia 1. A ficha é `docs/prompts/prompt-fase-19a.txt`; este plano não muda nada dela, só diz onde cada coisa fica, quem faz e o que prova.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `81d17a1bd6e7f57a51621f41fb5b7fe59f53e164` (F18, #35), em 13/nov/2026. A branch é `fase-19a`; a PR em rascunho é a #37.
- **Método de merge da main:** squash. Cada PR vira um commit na `main`, com o título da PR e `(#N)` no fim do assunto; `git log --first-parent` é linear, sem commit de merge. O dia do merge é o dia do commit em Brasília (UTC−3, sem horário de verão em 2026).
- **Linha de base**, medida no `dist-base` (worktree `.claude/worktrees/dist-base` no ponto de partida, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`):
  - Vitest: 140 arquivos e 2.229 testes, todos verdes (`.cache/f19a/base-vitest.json`).
  - Playwright `--list`: 2.695 testes em 89 arquivos, no Chromium e no WebKit.
  - `dist/_astro/`: 70 arquivos JS (`.cache/f19a/base-js.txt`).
  - Sitemaps: 88 URLs em en, 60 em pt e 75 em es, nenhuma com `<lastmod>` (cópias em `.cache/f19a/sitemap-*.xml`).
  - Controles negativos: `/whats-new/`, `/pt/novidades/`, `/es/novedades/`, `/how-it-works/`, `/pt/como-funciona/` e `/es/como-funciona/` dão 404 no `dist-base` (`.cache/f19a/base-404.txt`).
  - Os blocos de texto das 148 páginas do escopo da decisão 8 (ferramentas, presets, calculadoras e QR code nos idiomas de cada uma): `.cache/f19a/base-blocks.json` (script `.cache/f19a/blocks.ts`), com as palavras do `<main>` e da ilha de cada página.
  - A varredura de repetição (11 leitores, um por tipo de página e idioma): `.cache/f19a/scan/out-*.json`, 1.153 repetições nas 148 páginas, e o catálogo de 109 fatos com padrões por idioma em `.cache/f19a/scan/fact-catalog.json`.

## 2. O que a exploração achou e muda o plano

1. **A ficha diz "o Google Analytics, só com o Aceitar"** (decisão 7, parte 3). O código e a Privacidade dizem outra coisa: o `gtag.js` carrega em toda página de fileorca.com, e o aviso de cookies decide só o que ele pode guardar no navegador (Consent Mode); recusar não desliga o Analytics. A ficha manda a Como funciona bater com a Privacidade, que é a fonte: a página segue a Privacidade, e o conflito vai num § (§ 759).
2. **Os anúncios ainda não estão ligados** (a Privacidade diz "shows, or will show"): a Como funciona fala dos anúncios no condicional, como a Privacidade.
3. **O rodapé não pode repetir um link** (`tests/unit/footer-phone.test.ts`). A ficha pede o link da Novidades na coluna do FileOrca e a data da novidade mais nova com link para a Novidades. Solução sem afrouxar o teste: a data aponta para a âncora da entrada mais nova (`/whats-new/#<id>`), um destino próprio (§ 754).
4. **O rodapé a 360 px tem teto de metade da altura de antes** (`footer-phone.spec.ts`). Com dois links novos e a data, pt e es passavam do teto. A data entra na linha da assinatura, como `inline-block` com 48 px de alvo e margem negativa que não aumenta a linha, na data curta; os links da coluna do FileOrca ficam a 16 px um do outro (20 antes). Resultado: pt e es com 760 px, como antes; en com 906 (teto 1.059) (§ 754).
5. **`validateSitemap` só aceitava `<url><loc>…</loc></url>`.** Mudou junto com o sitemap, e os sitemaps falsos dos testes antigos ganharam o `<lastmod>` (§ 753 e § 772).
6. **O nascimento de cada página vem do git**, não dos relatórios: o primeiro commit da `main` que tem o arquivo da página (`.cache/f19a/births.ts`). As páginas de antes do lançamento (a home, o Comprimir imagem e as institucionais, nos três idiomas, desde a F1a) nascem no lançamento, a PR 5 (§ 751).
7. **Os guias de arquivo declaram a revisão e a medida de 11/nov** (a F18 mediu de novo): a entrada da F18 toca todos eles (`file-guides-measured`), e o `lastmod` deles fica em 13/nov.

## 3. Os § reservados

Os números são fixos (pegadinha da F10): cada frente escreve o texto dos seus § nas notas, e o agente principal os põe no `DECISOES.md`, na ordem.

| § | Assunto | Dono |
| --- | --- | --- |
| 751 | A fonte única das novidades: `changelog.ts`, os campos, os grupos com nascimento, o método de merge e o `LAUNCH_DATE` | principal |
| 752 | As rotas `whats-new` e `how-it-works`, os links da coluna do FileOrca | principal |
| 753 | O `lastmod`: a regra, o sitemap, o `validateSitemap` e o dia do build | principal |
| 754 | A data à vista: a linha "Atualizado em" e a data do rodapé | principal |
| 755 | O histórico da Novidades: o que entrou, o que ficou de fora e o texto de cada entrada | N |
| 756 | A página Novidades: os links, os nomes das páginas, o "e mais N" | N |
| 757 | O `changelog.test.ts` e o teste das datas declaradas | N |
| 758 | O Sobre: a data de lançamento e os links | C |
| 759 | A Como funciona: as cinco partes, as frases e as provas; o GA4 e os anúncios como a Privacidade | C |
| 760 | As fontes oficiais de cada navegador, com a data da leitura | C |
| 761 | A tabela de WebAssembly | C |
| 762 | O `pnpm sobre:foto`: tamanhos, formatos e metadados; a foto só com os arquivos | C |
| 763 | A autoria: o link do nome e o quadro do autor | C |
| 764 | Um fato, um lugar: o mapa de fatos por tipo de página | R |
| 765 | O portão de repetição: a lista de fatos e o limiar das frases quase iguais | R |
| 766 | As perguntas que saíram e as que entraram nos FAQ | R |
| 767 | O corte nas calculadoras (ou a válvula da decisão 11) | R |
| 768 a 770 | Livres para as frentes (N, C e R, nessa ordem), se precisarem | N, C, R |
| 771 | O princípio 5 do `docs/design/README.md` ("o FAQ ensina a abrir a aba Rede") passa à Como funciona | principal |
| 772 | Os testes antigos que mudaram, um por um (formato da § 341) | principal, com as listas das frentes |
| 773 | A entrada desta run na Novidades | principal |
| 774 em diante | A junção, o orçamento, o Lighthouse, as partes do CI e a revisão | principal |

## 4. A fatia 1 (feita, commits `90b4a69`, `ed076dd` e `d2cec84`)

- `src/platform/changelog.ts`: `CHANGELOG` (entradas da mais velha para a mais nova), `PAGE_GROUPS` (os grupos nomeados, dos registros), `pagesIn`, `entriesIn`, `newestIn`, `birthOf`, `lastmodOf`. Um grupo (`all:<grupo>`) vale só para as páginas dele que já existiam naquele idioma na data da entrada: o nascimento de uma página num idioma é a primeira entrada que a nomeia pelo `RouteId`. O script `.cache/f19a/check-births.ts` confere cada nascimento contra o git (zero diferença).
- `LAUNCH_DATE = '2026-10-31'` em `src/platform/site.ts`.
- As rotas `whats-new` (`/whats-new/`, `/pt/novidades/`, `/es/novedades/`) e `how-it-works` (`/how-it-works/`, `/pt/como-funciona/`, `/es/como-funciona/`), indexáveis, sem `adArea`, depois de `support` no `ROUTES`; `NO_SECTION` do Menu; os tipos `WhatsNewTexts` e `HowItWorksTexts`; os textos mínimos; as views mínimas; o Article da Como funciona no `requiredSchemaTypes`.
- O `<lastmod>` em todo `<url>` (`sitemapEntries`, `lastmodOf`), e o `gate:seo` reprova URL sem `lastmod`, data fora de `AAAA-MM-DD`, data depois do dia do build em UTC (o dia do `dist/build.txt`) e data diferente do changelog.
- As chaves novas do `common.ts` (todas as que as frentes usam, para nenhuma frente mexer nele): `footer.whatsNew`, `footer.howItWorks`, `trust.updated` ("Updated {date}") e `trust.howToCheck` ("How to check").
- O rodapé: "What's new" e "How it works" depois de "About"; a data da entrada mais nova na linha da assinatura, com link para a âncora dela.
- Os moldes `ImageToolPage`, `PdfToolPage` e `QrTool` ganham `<Updated>` (componente `src/components/Updated.astro`, `<p class="fo-updated" data-updated>`, fora de todo `data-content`) entre a privacidade e a marca de anúncio das relacionadas; os quatro moldes (com o `CalcTool`) ganham o link `<HowToCheck>` no fim da nota de privacidade.
- Testes antigos mudados na fatia 1 (para a § 772): `routes.test.ts` (a lista dos ids), `seo-checks.test.ts` (os tamanhos dos sitemaps e o mutante das entradas a mais), `prontidao.test.ts` (os sitemaps falsos com `<lastmod>`), `ads-pages.test.ts` (as duas views na lista sem anúncio), `ads.spec.ts` (27 para 33 páginas livres) e `footer-phone.spec.ts` (a lista dos links e a contagem dos links à vista, 19/15 para 22/18).

## 5. A interface que as frentes dividem

- Os ids das rotas novas: `whats-new` e `how-it-works`. Os caminhos: `pathFor('whats-new', lang)` e `pathFor('how-it-works', lang)`.
- `src/platform/changelog.ts`: a frente N é dona. As outras leem `lastmodOf`, `newestIn` e `entriesIn`.
- Os textos novos: `src/i18n/{en,pt,es}/whats-new.ts` (N), `src/i18n/{en,pt,es}/how-it-works.ts` (C), o quadro do autor em `src/i18n/{lang}/about.ts` (C), e nada novo no `common.ts`.
- `scripts/lib/repeticao.ts`: a frente R é dona; o `gate:conteudo` chama as funções dele.

### Dono de cada arquivo que mais de uma frente pode tocar

| Arquivo | Dono | As outras |
| --- | --- | --- |
| `src/i18n/routes.ts`, `src/i18n/texts.ts`, `src/i18n/{lang}/common.ts`, `src/components/Footer.astro`, os quatro moldes de ferramenta | principal (fatia 1) | não mexem; o que faltar vai nas notas |
| `src/i18n/types.ts` | cada frente na sua interface (N: `WhatsNewTexts`; C: `HowItWorksTexts`, `AboutTexts`; R: só se um tipo de texto de ferramenta mudar) | nada fora da sua interface |
| `src/styles/components.css` | N acrescenta logo depois da regra `.fo-footer .fo-footer__updated` (perto da linha 1008); C acrescenta no fim do arquivo | R não mexe |
| `scripts/lib/conteudo.ts`, `scripts/gates/conteudo.ts`, `tests/unit/conteudo.test.ts` | R | C mexe só em `scripts/lib/file-guides.ts` (o quadro do autor no `checkFileGuide`) |
| `tests/e2e/budgets.spec.ts`, `i18n-budgets.spec.ts`, `layout-shift.spec.ts` | N (as duas páginas novas) | — |
| `tests/e2e/launch-claims.spec.ts` | C | — |
| `package.json` | C (`sobre:foto`) | — |
| `DECISOES.md`, `docs/PENDENCIAS.md`, `docs/claude/`, `docs/OPERACAO.md`, `docs/design/` | principal | as frentes escrevem nas notas |

## 6. As entradas da Novidades

Da mais velha para a mais nova; a data é o dia do merge em Brasília. "Nasce" quer dizer que a entrada nomeia a página pelo `RouteId` pela primeira vez naquele idioma. O texto de cada uma é da frente N; esta tabela é a forma da fatia 1, que a frente N confere contra os relatórios e pode dividir ou juntar, sem mexer num nascimento sem o git.

| id | data | PR | tipo | páginas (idiomas) |
| --- | --- | --- | --- | --- |
| `launch` | 2026-10-31 | 5 | conteudo | nascem a home, o Comprimir imagem e as institucionais (en, pt, es) |
| `image-tools` | 2026-10-31 | 5 | conteudo | nascem o hub e as ferramentas e presets de imagem de então (en) |
| `private-chunks` | 2026-10-31 | 7 | conteudo | as ferramentas e presets de imagem e o hub de então |
| `cookie-notice-space` | 2026-10-31 | 8 | site | — |
| `money-calculators` | 2026-11-01 | 11 | conteudo | nascem o hub, as 14 calculadoras, as 4 presets e os 5 guias de dinheiro (en); a home |
| `pdf-tools` | 2026-11-01 | 12 | conteudo | nascem o hub e as ferramentas de PDF (en); a home |
| `file-guides` | 2026-11-01 | 13 | conteudo | nascem os 10 guias de arquivo (en) |
| `portuguese-spanish` | 2026-11-02 | 14 | conteudo | nascem imagem e PDF em pt e es, as calculadoras do Brasil (pt) e cinco calculadoras e o hub em es; a home e o Apoie |
| `home-health-calculators` | 2026-11-02 | 15 | conteudo | nascem os hubs e as 11 calculadoras de casa e saúde (en); a home |
| `qr-code` | 2026-11-02 | 15 | conteudo | nasce o QR code (en) |
| `offline` | 2026-11-02 | 18 | site | — |
| `more-in-portuguese-spanish` | 2026-11-03 | 19 | conteudo | nascem o QR em pt e es, o resto do dinheiro em es e os 10 guias de arquivo em pt e es; a home e o hub de dinheiro |
| `theme-and-menu` | 2026-11-04 | 23 | site | — |
| `guides-hub` | 2026-11-04 | 23 | conteudo | nasce o hub de guias (en, pt, es); a home |
| `header-width` | 2026-11-04 | 24 | site | — |
| `support-page` | 2026-11-04 | 25 | conteudo | o Apoie |
| `tool-page` | 2026-11-05 | 26 | conteudo | as ferramentas e presets de imagem e as ferramentas de PDF de então |
| `cookie-notice` | 2026-11-05 | 26 | site | — |
| `calculator-card` | 2026-11-06 | 27 | conteudo | todas as calculadoras e presets de então, e o QR code |
| `file-guide-page` | 2026-11-06 | 27 | conteudo | os guias de arquivo |
| `home-and-hubs` | 2026-11-06 | 27 | conteudo | a home e os hubs |
| `institutional-pages` | 2026-11-06 | 27 | conteudo | as institucionais |
| `footer-phone` | 2026-11-06 | 27 | site | — |
| `home-cards` | 2026-11-06 | 28 | conteudo | a home |
| `pdf-pages` | 2026-11-09 | 29 | conteudo | as ferramentas de PDF |
| `next-steps` | 2026-11-09 | 31 | conteudo | imagem, presets de imagem, PDF e o QR code |
| `calculator-typing` | 2026-11-10 | 32 | conteudo | todas as calculadoras e presets |
| `avif-webp` | 2026-11-10 | 33 | conteudo | nascem o AVIF para JPG e o Converter para WebP (en, pt, es); o hub de imagem, o Comprimir e a home |
| `organize-exif` | 2026-11-13 | 35 | conteudo | nascem o Organizar PDF, o Remover dados EXIF e as três presets (en, pt, es); os hubs e a home |
| `file-guides-measured` | 2026-11-13 | 35 | conteudo | os guias de arquivo (a medida de 11/nov) |
| `trust-and-content` | 2026-11-13 | null | conteudo | nascem a Novidades e a Como funciona; o Sobre, a Privacidade, a home, todas as ferramentas, presets, calculadoras e o QR code |

A última entrada (decisão 9) muda na junção se a válvula agir: sem o corte das calculadoras, elas ganham a entrada só pelo link "Como conferir" da privacidade, que é texto delas; a entrada continua `conteudo` para elas.

## 7. O mapa de fatos (decisão 8), por tipo de página

A casa padrão de cada fato recorrente; a frente R confirma por página e registra as exceções na § 764.

| Fato | Ferramenta e preset de imagem | Ferramenta e preset de PDF | QR code | Calculadora |
| --- | --- | --- | --- | --- |
| Processado no aparelho, nunca enviado (e o "Como conferir") | `privacy` | `privacy` (com a senha, no Proteger e no Desbloquear, e a assinatura, no Assinar) | `privacy` ("your text stays on your device", "never opens") | — |
| Os números ficam no aparelho (depois do `#`, fora de evento) | — | — | — | `privacy` |
| Formatos que aceita, limites, o que devolve, lote e ZIP | `specs` | `specs` | `specs` | — |
| Metadados e GPS | `specs` | `specs` (o que fica e o que sai do PDF) | — | — |
| 1 KB = 1.000 bytes | `specs` (a linha do "Até um tamanho") | — | — | — |
| Já pequeno, volta o original | `specs` | `specs` | — | — |
| PNG sem perda; JPG e WebP salvos de novo | `specs` | — | — | — |
| Transparência que vira branco | `specs` | `specs` (onde houver) | — | — |
| O original intocado | `specs` | `specs` | — | — |
| Grátis e sem conta | nenhum bloco do corpo (o selo, o título e o Sobre dizem) | idem | idem | idem |
| Os passos | `how` | `how` | `how` | `how` |
| A conta, as premissas, o exemplo resolvido | — | — | — | `works` |
| O porquê, o caso de borda, o "e se" | `faq` | `faq` | `faq` | `faq` |

O FAQ "Is my file uploaded?" e os equivalentes saem das páginas de ferramenta: a casa desse fato é o bloco de privacidade, com o link "Como conferir".

## 8. Quem faz o quê, e a ordem

1. **Fatia 1** (principal, feita).
2. **As frentes ao mesmo tempo**, cada uma num agente `opus` na sua worktree, a partir do commit `d2cec84`, com `git merge --ff-only fase-19a` como primeiro passo e os commits com o trailer `Co-Authored-By`:
   - **N (novidades e datas):** o histórico conferido contra os relatórios, os textos de cada entrada nos três idiomas, a página Novidades completa, o `changelog.test.ts` (ids únicos, datas em ordem, cada nascimento contra o git, cada PR contra o commit dela com um dia de tolerância, só a mais nova com `pr: null`, os textos de cada idioma onde a entrada aparece, o `LAUNCH_DATE`), o teste das datas declaradas sobre o `dist/` (nenhuma `<time datetime>` do `<main>` nem `dateModified`/`datePublished` do JSON-LD nem o "Last updated" das páginas jurídicas depois do `lastmod`), os mutantes do `validateSitemap`, a linha "Atualizado em" igual ao `lastmod` e a data do rodapé igual à entrada mais nova (sobre o `dist/`), os pares das duas páginas novas no `budgets.spec.ts` e no `i18n-budgets.spec.ts` ("os JS do Sobre") e o CLS sem gesto das duas no `layout-shift.spec.ts`.
   - **C (Como funciona, Sobre e autoria):** as cinco partes da Como funciona nos três idiomas, a tabela de WebAssembly gerada no build e o teste dela contra o `dist/`, a lista das frases e das provas (Vitest no estilo da § 205, mais os testes e2e que faltarem no `launch-claims.spec.ts`), o teste das palavras proibidas, as fontes oficiais dos navegadores (WebFetch, só leitura, com a data); o Sobre (a data de lançamento pelo `LAUNCH_DATE`, o parágrafo com os links, o lugar da foto), o `pnpm sobre:foto` e o Vitest dele sobre a fixture com GPS, a foto e o `image` do `personLd()` só com os arquivos, e o teste dos dois casos; a autoria (o nome como link no `Reviewed` dos guias e das calculadoras, o quadro do autor `data-content="author"` nos 40 guias, fora da contagem de palavras); os links da faixa de confiança da home, do Sobre e da Privacidade.
   - **R (repetição):** primeiro o portão (`scripts/lib/repeticao.ts`, o gancho no `gate:conteudo`, os mutantes); depois o corte dos textos em quatro agentes paralelos, cada um na sua worktree a partir da branch do portão: imagem (ferramentas e presets, en, pt, es), PDF (ferramentas e presets, en, pt, es), QR code e casa e saúde, e dinheiro (en, es, e o Brasil em pt). A válvula da decisão 11 age no agente do dinheiro e no de casa e saúde: se não couber, o portão vale para imagem, PDF e QR, e as calculadoras vão para o grupo 29.
3. **A junção** (principal): os merges com `--no-ff -F` e o trailer, os conflitos, o `pnpm tipos`, os specs das frentes nos dois navegadores, os de anúncio no build de teste, e os § das notas no `DECISOES.md`.
4. **O fechamento** (principal): o orçamento contra o `dist-base`, o Lighthouse das páginas novas (configuração temporária em `.cache/`), a tabela do antes e depois da repetição e das palavras, as imagens do relatório.
5. **A revisão adversarial** em cinco lentes Sonnet, contra a ficha e este plano.
6. **O fim:** o `pnpm verificar --partes`, o relatório, o `gh pr ready` pela regra 1.

## 9. Cada critério, o teste ou comando que o prova

| Critério | Prova |
| --- | --- |
| 1. Novidades nos três idiomas, datas provadas contra o git | `tests/unit/changelog.test.ts`; `pnpm build` e o status 200 das três URLs |
| 2. `<lastmod>` em todo `<url>`, portão e Vitest das datas | `pnpm gate:seo`; os mutantes em `tests/unit/seo-checks.test.ts`; o teste das datas declaradas |
| 3. "Atualizado em" igual ao `lastmod`; a data do rodapé é a da entrada mais nova | o teste sobre o `dist/` da frente N; `footer-phone.spec.ts` |
| 4. Sobre com a data do `LAUNCH_DATE`; sem foto sem os arquivos; `sobre:foto` sem metadado | os testes da frente C (o do Sobre nos dois casos e o do script sobre a fixture com GPS) |
| 5. Nome ligado ao Sobre em guias e calculadoras; 40 quadros do autor; 800 a 1.500 palavras sem ele | os testes da frente C; `pnpm gate:conteudo` (`checkFileGuide`) |
| 6. Como funciona com as cinco partes, a tabela bate com o `dist/`, cada frase com prova, sem palavra proibida | `tests/unit/how-it-works.test.ts` e o teste das frases; `launch-claims.spec.ts` |
| 7. O portão de repetição passa e reprova os mutantes; a tabela do antes e depois | `pnpm gate:conteudo`; `tests/unit/repeticao.test.ts`; o relatório |
| 8. Nenhum portão afrouxado | `gate:conteudo`, `gate:prontidao`, `gate:seo`, `gate:links`, `gate:dinheiro-saude`, `launch-kit.test.ts` |
| 9. As duas páginas sem anúncio, JS do Sobre, Lighthouse ≥ 90, axe, CLS 0; anúncios das ferramentas como antes | `ads.spec.ts`, `budgets.spec.ts`, `i18n-budgets.spec.ts`, Lighthouse com a configuração do `.cache/`, `a11y.spec.ts`, `layout-shift.spec.ts`, `fo-ad-map.spec.ts` no build de teste |
| 10. Nada sai do aparelho, nada novo no GA4 nem no armazenamento | `image-privacy`, `pdf-privacy`, `money-privacy`, `launch-claims` e `events` |
| 11. `lint:texto` com 0 erro; os testes de idioma | `pnpm lint:texto`; `english-leak.test.ts`, `glossary.test.ts`, `claude-md.test.ts`, `pendencias.test.ts` |
| 12. Os testes antigos que mudaram, um por um | § 772 |
| 13. `docs/claude/idiomas.md`, `docs/OPERACAO.md`, `PENDENCIAS.md` | os arquivos; `pendencias.test.ts`, `operacao.test.ts` |
| 14. `verificar --partes` e o CI completo | a saída no relatório; `gh pr checks` |
| 15. A revisão sem achado alto ou médio aberto | `docs/relatorios/REVISAO-F19a.md` |
