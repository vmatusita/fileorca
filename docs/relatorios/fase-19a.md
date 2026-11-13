# F19a · relatório

A run "Confiança e conteúdo", a resposta à recusa do AdSense de 13/nov/2026 ("conteúdo de baixo valor"), com a ficha em `docs/prompts/prompt-fase-19a.txt`; o plano da run está em `docs/relatorios/fase-19a-plano.md`. Ponto de partida: `81d17a1` (a F18, PR 35). PR: [vmatusita/fileorca#37](https://github.com/vmatusita/fileorca/pull/37), da branch `fase-19a`. De `81d17a1` a `a9e5047` (o último commit de código): 59 commits (53 sem os de merge), 257 arquivos, +7.359 e −1.574 linhas.

## Resumo

1. **A Novidades** (`/whats-new/`, `/pt/novidades/`, `/es/novedades/`): as mudanças que a pessoa vê, do lançamento até esta run, com a data do merge e os links para as páginas de cada uma, de uma fonte só, o `src/platform/changelog.ts`, conferida contra o git.
2. **As datas:** todo `<url>` dos três sitemaps tem `<lastmod>`, igual ao do changelog; as páginas de imagem, PDF e QR code dizem "Atualizado em {data} · Novidades", e o rodapé de toda página traz a data da novidade mais nova.
3. **A Como funciona** (`/how-it-works/`, `/pt/como-funciona/`, `/es/como-funciona/`): o que acontece com o arquivo, o que roda em WebAssembly (uma tabela feita no build e conferida contra o `dist/`), o que vai pela rede, como conferir em cada navegador e o que o teste não prova, cada frase com a prova dela; o link "Como conferir" sai da nota de privacidade de toda ferramenta e calculadora, da home, do Sobre e da Privacidade.
4. **O Sobre e a autoria:** o Sobre diz quando o site entrou no ar e tem o lugar da foto (o `pnpm sobre:foto` tira todo metadado); o nome nas assinaturas leva ao Sobre, e os 40 guias terminam num quadro do autor.
5. **Um fato, um lugar:** as 148 páginas de ferramenta, preset, calculadora e QR code nos três idiomas dizem cada fato num bloco só (a pergunta "o arquivo é enviado?" saiu de todas), e um portão novo no `gate:conteudo` reprova a repetição.

## O que entrou, por item da ficha

### 1. A fonte única das novidades (fatia 1 e frente N; § 751, § 755, § 757 e § 768)

O `src/platform/changelog.ts` tem 34 entradas, da `launch` (PR 5, 31/out) à `trust-and-content` (esta run, `pr: null`): en mostra 32, pt e es 28. Cada página nasce na primeira entrada que a nomeia; um grupo (`all:<grupo>`) só alcança as páginas que já existiam naquele idioma. O `changelog.test.ts` confere contra o git a data de cada PR (o dia do squash em Brasília, ±1), o nascimento das 229 páginas indexáveis (o primeiro commit com o arquivo da página), o `LAUNCH_DATE` e os textos. O `LAUNCH_DATE = '2026-10-31'` fica em `src/platform/site.ts`.

### 2. A página Novidades (fatia 1 e frente N; § 752 e § 756)

Cada entrada é um `<li id>` com o título, a data longa num `<time datetime>`, o texto e até seis links para as páginas que ela tocou no idioma, depois "e mais N". Sem anúncio, sem imagem, sem JS próprio, na Figtree Steady (CLS 0).

### 3. O `lastmod` (fatia 1 e frente N; § 753 e § 757)

O `sitemapXml` escreve `<lastmod>` em toda `<url>` (90 em en, 62 em pt, 77 em es); o `gate:seo` reprova URL sem `lastmod`, fora de `AAAA-MM-DD`, depois do dia do build em UTC e diferente do changelog, com mutantes no `seo-checks.test.ts`. O `declared-dates.test.ts` prova que nenhuma página tem `lastmod` antes de uma data que ela mostra ou declara.

### 4. A data à vista (fatia 1 e frente N; § 754 e § 757)

A linha "Atualizado em" das 93 páginas de imagem, PDF e QR code é igual ao `lastmod` delas, e a data do rodapé, com link para a entrada, é a da mais nova (`updated-dates.test.ts`). O rodapé a 360 px ficou com 906, 760 e 760 px (en, pt, es), dentro do teto do `footer-phone.spec.ts`.

### 5. O Sobre e a foto (frente C; § 758 e § 762)

A data de lançamento vem do `LAUNCH_DATE`, com os links para a Novidades e a Como funciona. O `pnpm sobre:foto` (`scripts/sobre/foto.ts`) corta o quadrado do centro e grava 320 e 128 px em WebP e JPG com o motor do próprio site no Node, sem nenhum metadado; o Vitest o roda sobre a fixture com GPS numa pasta temporária. Sem os quatro arquivos em `public/about/`, nenhuma página tem foto e o `personLd` não tem `image`.

### 6. A autoria (frente C; § 763)

O nome nas assinaturas dos guias de arquivo, das calculadoras, dos hubs e dos guias de dinheiro leva ao Sobre (`rel="author"`); os 30 guias de arquivo e os 10 de dinheiro terminam no quadro do autor, fora da contagem de 800 a 1.500 palavras (o `checkFileGuide` o pede entre as fontes e as relacionadas).

### 7. A Como funciona (frente C; § 759 a § 761, § 769 e § 776)

As cinco partes, com Article, breadcrumb e índice; o GA4 e os anúncios como a Privacidade os descreve (a ficha dizia "só com o Aceitar", e o código e a Privacidade dizem outra coisa: § 759). A tabela de WebAssembly tem onze linhas, do `src/platform/engines.ts`, conferidas contra o `dist/_astro` e os pacotes. Cada frase tem uma prova (um teste, ou a documentação oficial do navegador lida em 13/nov/2026); três provas novas no `launch-claims.spec.ts`. Nenhuma palavra proibida nem link para o repositório (`how-it-works-words.test.ts`).

### 8. Um fato, um lugar (frente R; § 764 a § 767 e § 770)

O `scripts/lib/repeticao.ts` lê as unidades do `<main>` (cada pergunta do FAQ é uma unidade) e reprova um dos 36 fatos da lista em mais de uma, ou duas frases de 8 palavras ou mais com Dice de bigramas de 0,45 ou mais em unidades diferentes; o limiar foi medido na linha de base. O `gate:conteudo` o roda nas 148 páginas. Quatro frentes de texto cortaram imagem, PDF, QR e casa e saúde, e dinheiro; as premissas das calculadoras não mudaram (vão ao PDF), e toda página ficou com 4 perguntas reais ou mais.

### 9. A entrada desta run (§ 773)

A `trust-and-content`, `conteudo` para as páginas novas, o Sobre, a Privacidade, a home e todas as páginas de ferramenta, preset, calculadora e QR code.

### 10. Os testes antigos que mudaram (§ 772)

Treze, um por um; nenhum pulado, desligado ou afrouxado.

### 11. A válvula (§ 767)

Não agiu: as calculadoras foram cortadas na própria run, e o portão vale para as 148 páginas.

### Os documentos e as pendências

- `DECISOES.md`: § 751 a § 776 (só acréscimos).
- `docs/claude/`: uma seção F19a no fim do `idiomas.md` (a regra de acrescentar a entrada no `changelog.ts`, o `conteudo` e o `site`, o nascimento, o mapa de fatos e as pegadinhas do `lint:texto`) e do `design-e-oli.md` (o link com classe, a Figtree Steady, o teto do rodapé).
- `docs/design/`: o princípio 5 do README (§ 771), o Footer e o ToolPage.
- `docs/OPERACAO.md`: "A foto do Sobre" e "A página Novidades".
- `docs/PENDENCIAS.md`: a linha "Sobre e Oli" do grupo 15 com o `pnpm sobre:foto`, e o grupo 29, "O que a F19a deixou" (14 linhas, todas baixas). O total fica em 203 linhas.

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | A Novidades nos três idiomas, com as entradas do lançamento até esta run; o `changelog.test.ts` prova as datas contra o git | `changelog.test.ts` (11 testes) e o `layout-shift`, o `a11y` e os orçamentos das páginas novas | 32, 28 e 28 entradas; as datas das 31 PRs no dia exato do squash (a lente b conferiu de novo). Controles: 11 de 11 mutantes do changelog mortos (nascimento movido, PR dois dias fora, segunda entrada sem `pr`, data fora de ordem…); depois de um squash local `(#37)`, o teste de antes reprovava "whats-new en: the changelog says #null, git says #37", e o de agora passa (§ 776) |
| 2 | Todo `<url>` com `<lastmod>`; o portão e o Vitest das datas; nenhuma página com `lastmod` antes de uma data que mostra | `gate:seo`, `seo-checks.test.ts`, `declared-dates.test.ts` | "seo: ok, 229 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps". Controles: 4 de 4 mutantes do `validateSitemap` e 5 de 5 do teste das datas declaradas mortos |
| 3 | A linha "Atualizado em" igual ao `lastmod`; a data do rodapé a da entrada mais nova | `updated-dates.test.ts` | 93 páginas com a linha, 238 rodapés. Controles: 4 de 4 mutantes mortos |
| 4 | O Sobre com a data do `LAUNCH_DATE`; sem foto sem os arquivos; o `pnpm sobre:foto` sem metadado | `about-page.test.ts`, `about-photo.test.ts` | a fixture com GPS sai em quatro arquivos sem Exif, XMP, IPTC nem GPS (nos bytes); o Sobre sem `img` nem `image` sem os arquivos |
| 5 | Nome ligado ao Sobre; 40 quadros do autor; 800 a 1.500 palavras sem ele | `author.test.ts`, `gate:conteudo` (`checkFileGuide`) | 30 + 10 quadros; as palavras dos guias iguais às de antes; os mutantes do `checkFileGuide` reprovam |
| 6 | A Como funciona com as cinco partes, a tabela contra o `dist/`, cada frase com prova, sem palavra proibida | `how-it-works.test.ts`, `how-it-works-claims.test.ts`, `how-it-works-words.test.ts`, `launch-claims.spec.ts` | verdes; a revisão achou uma frase que dizia mais do que a prova (C-1) e a corrigiu, com o teste novo que reprova o texto de antes |
| 7 | O portão de repetição passa nas 148 páginas e reprova os mutantes; a tabela do antes e depois | `gate:conteudo`, `repeticao.test.ts` (59), a tabela abaixo | "148 sem repetição (um fato, um lugar)"; antes, 111 de 148 reprovavam, com 469 fatos repetidos e 222 pares de frases quase iguais |
| 8 | Nenhum portão afrouxado | `gate:conteudo`, `gate:prontidao`, `gate:seo`, `gate:links`, `gate:dinheiro-saude`, `launch-kit.test.ts` | todos verdes; a lente e procurou no diff de `tests/` e `scripts/` e não achou limite afrouxado, `.skip` nem `.only` |
| 9 | As páginas novas sem anúncio, com os JS do Sobre, Lighthouse ≥ 90, axe, CLS 0; os anúncios das ferramentas como antes | `ads.spec.ts`, `budgets.spec.ts`, `i18n-budgets.spec.ts`, Lighthouse, `a11y.spec.ts`, `layout-shift.spec.ts`, `fo-ad-map.spec.ts` | as 33 páginas livres; 4,8 e 5,0 KB de JS (só o inline); Lighthouse 99 ou 100 e 100, 100, 100; axe sem violação; CLS 0,000; `ads` e `fo-ad-map` 205 + 205 no build de teste (§ 775) |
| 10 | Nada sai do aparelho, nada novo no GA4 nem no armazenamento | `image-privacy`, `pdf-privacy`, `money-privacy`, `launch-claims`, `events` | verdes nos dois navegadores; nenhum evento, parâmetro ou chave novos no diff (lente c) |
| 11 | `lint:texto` com 0 erro; os testes de idioma | `pnpm lint:texto`; `english-leak`, `glossary`, `claude-md`, `pendencias` | "159 arquivo(s), 10445 textos, 0 erro(s) de gramática, 1846 aviso(s)"; os quatro verdes |
| 12 | Os testes antigos que mudaram, um por um | § 772 | 13 itens |
| 13 | `idiomas.md`, `OPERACAO.md`, `PENDENCIAS.md` | os arquivos; `pendencias.test.ts`, `operacao.test.ts` | as seções F19a; o grupo 29 |
| 14 | O `verificar --partes` e o CI completo | a seção abaixo; `gh pr checks` | as 26 partes passaram no `a9e5047` (soma de 3.620,2 s, nenhuma acima de 900 s); a execução completa do CI vai na descrição da PR |
| 15 | A revisão sem achado alto ou médio aberto | `docs/relatorios/REVISAO-F19a.md` (§ 776) | nenhum aberto; o A1 (baixo) é a F19a m-13 |

E o que fica fora da ficha: `git diff --stat 81d17a1 -- lighthouserc.json .github .githooks .claude/settings.json PLANO-FILEORCA.md PLANO-MELHORIAS.md PLANO-UX-QV.md CLAUDE.md package.json pnpm-lock.yaml src/calc src/engine fixtures` lista só o `package.json` (o script `sobre:foto`, que a ficha pede). Os títulos, as descriptions, os H1, o selo e o texto do painel das 148 páginas não mudaram (lente a); as premissas e as fontes das calculadoras não mudaram (lente d). Nenhuma dependência, chave de armazenamento, evento ou parâmetro novo, nenhum link para o repositório e nenhum anúncio novo.

## As tabelas

### A repetição, antes e depois

"Antes": o `dist-base` (`81d17a1`). "Depois": o `dist/` do `a9e5047`. Palavras do `<main>` contadas como o `gate:prontidao` as conta; o "depois" inclui o link "Como conferir" e a linha "Atualizado em", que o portão não conta.

| Tipo | Idioma | Páginas | Reprovam | Fatos repetidos | Ocorrências a mais | Frases quase iguais | Palavras do `<main>` (soma) | Média |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| image-tool | en | 11 | 11 → 0 | 44 → 0 | 53 → 0 | 11 → 0 | 7670 → 6366 | 697 → 579 |
| image-tool | pt | 11 | 11 → 0 | 45 → 0 | 54 → 0 | 14 → 0 | 7941 → 6626 | 722 → 602 |
| image-tool | es | 11 | 11 → 0 | 45 → 0 | 54 → 0 | 15 → 0 | 8134 → 6795 | 739 → 618 |
| image-preset | en | 4 | 4 → 0 | 14 → 0 | 15 → 0 | 7 → 0 | 2693 → 2241 | 673 → 560 |
| image-preset | pt | 4 | 4 → 0 | 14 → 0 | 15 → 0 | 6 → 0 | 2848 → 2358 | 712 → 590 |
| image-preset | es | 4 | 4 → 0 | 13 → 0 | 14 → 0 | 8 → 0 | 2907 → 2428 | 727 → 607 |
| pdf-tool | en | 13 | 13 → 0 | 76 → 0 | 97 → 0 | 36 → 0 | 10018 → 8582 | 771 → 660 |
| pdf-tool | pt | 13 | 13 → 0 | 76 → 0 | 97 → 0 | 38 → 0 | 10283 → 8789 | 791 → 676 |
| pdf-tool | es | 13 | 13 → 0 | 75 → 0 | 96 → 0 | 42 → 0 | 10481 → 8896 | 806 → 684 |
| pdf-preset | en | 2 | 2 → 0 | 11 → 0 | 13 → 0 | 9 → 0 | 1536 → 1297 | 768 → 649 |
| pdf-preset | pt | 2 | 2 → 0 | 11 → 0 | 12 → 0 | 8 → 0 | 1551 → 1321 | 776 → 661 |
| pdf-preset | es | 2 | 2 → 0 | 11 → 0 | 12 → 0 | 7 → 0 | 1578 → 1335 | 789 → 668 |
| qr | en | 1 | 1 → 0 | 7 → 0 | 9 → 0 | 0 → 0 | 758 → 643 | 758 → 643 |
| qr | pt | 1 | 1 → 0 | 7 → 0 | 9 → 0 | 1 → 0 | 802 → 674 | 802 → 674 |
| qr | es | 1 | 1 → 0 | 7 → 0 | 9 → 0 | 0 → 0 | 826 → 695 | 826 → 695 |
| calc-money | en | 14 | 5 → 0 | 7 → 0 | 7 → 0 | 3 → 0 | 11729 → 11462 | 838 → 819 |
| calc-money | es | 14 | 4 → 0 | 5 → 0 | 5 → 0 | 2 → 0 | 14001 → 13668 | 1000 → 976 |
| calc-preset | en | 4 | 1 → 0 | 0 → 0 | 0 → 0 | 1 → 0 | 3676 → 3565 | 919 → 891 |
| calc-preset | es | 4 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 4545 → 4417 | 1136 → 1104 |
| calc-br | pt | 8 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 8229 → 8000 | 1029 → 1000 |
| calc-life | en | 11 | 8 → 0 | 1 → 0 | 1 → 0 | 14 → 0 | 9856 → 9179 | 896 → 834 |
| **total** |  | 148 | 111 → 0 | 469 → 0 | 572 → 0 | 222 → 0 | 122062 → 109337 | 825 → 739 |

As perguntas: 15 páginas de imagem perderam de uma a quatro perguntas (o Comprimir imagem foi de 8 para 4), as 15 de PDF foram de 5 para 4, o QR code de 7 para 6, a Hipoteca de 5 para 4, o IMC e a Gordura corporal de 5 para 4; nenhuma página ficou com menos de 4. As perguntas que entraram, uma por uma e conferidas no motor, estão no § 766.

### As entradas da Novidades

| id | data | PR | tipo | idiomas | páginas en / pt / es | título (en) |
| --- | --- | --- | --- | --- | --- | --- |
| `launch` | 2026-10-31 | 5 | conteudo | en, pt, es | 8 / 8 / 8 | FileOrca goes live |
| `image-tools` | 2026-10-31 | 5 | conteudo | en | 11 / 0 / 0 | Image tools |
| `private-chunks` | 2026-10-31 | 7 | conteudo | en, pt, es | 12 / 1 / 1 | No hidden data in PNG and WebP |
| `cookie-notice-space` | 2026-10-31 | 8 | site | en, pt, es | 0 / 0 / 0 | The cookie notice floats |
| `money-calculators` | 2026-11-01 | 11 | conteudo | en | 25 / 0 / 0 | Money calculators |
| `calculator-terms` | 2026-11-01 | 11 | conteudo | en, pt, es | 2 / 2 / 2 | Privacy and terms for the calculators |
| `pdf-tools` | 2026-11-01 | 12 | conteudo | en | 14 / 0 / 0 | PDF tools |
| `pdf-terms` | 2026-11-01 | 12 | conteudo | en, pt, es | 3 / 3 / 3 | Terms for passwords and signatures |
| `file-guides` | 2026-11-01 | 13 | conteudo | en | 12 / 0 / 0 | Guides with measured numbers |
| `portuguese-spanish` | 2026-11-02 | 14 | conteudo | pt, es | 0 / 39 / 36 | — |
| `home-health-calculators` | 2026-11-02 | 15 | conteudo | en | 14 / 0 / 0 | Home and health calculators |
| `qr-code` | 2026-11-02 | 15 | conteudo | en | 1 / 0 / 0 | QR code generator |
| `health-terms` | 2026-11-02 | 15 | conteudo | en, pt, es | 3 / 3 / 3 | Terms for health, home and QR codes |
| `offline` | 2026-11-02 | 18 | conteudo | en, pt, es | 1 / 1 / 1 | Pages you opened work offline |
| `more-in-portuguese-spanish` | 2026-11-03 | 19 | conteudo | pt, es | 0 / 18 / 36 | — |
| `theme-and-menu` | 2026-11-04 | 23 | conteudo | en, pt, es | 1 / 1 / 1 | Light, dark and a Menu |
| `guides-hub` | 2026-11-04 | 23 | conteudo | en, pt, es | 17 / 12 / 17 | A home for the guides |
| `header-width` | 2026-11-04 | 24 | site | en, pt, es | 0 / 0 / 0 | Header and footer line up |
| `support-page` | 2026-11-04 | 25 | conteudo | en, pt, es | 1 / 1 / 1 | A new page to support Oli |
| `tool-page` | 2026-11-05 | 26 | conteudo | en, pt, es | 24 / 24 / 24 | Each tool in one place |
| `cookie-notice` | 2026-11-05 | 26 | site | en, pt, es | 0 / 0 / 0 | A smaller cookie notice |
| `calculator-card` | 2026-11-06 | 27 | conteudo | en, pt, es | 35 / 9 / 24 | A new result card |
| `file-guide-page` | 2026-11-06 | 27 | conteudo | en, pt, es | 10 / 10 / 10 | A clearer guide page |
| `home-and-hubs` | 2026-11-06 | 27 | conteudo | en, pt, es | 7 / 5 / 5 | A new home page and hubs |
| `institutional-pages` | 2026-11-06 | 27 | conteudo | en, pt, es | 6 / 6 / 6 | Pages about the site, easier to read |
| `footer-phone` | 2026-11-06 | 27 | site | en, pt, es | 0 / 0 / 0 | A shorter footer on the phone |
| `home-cards` | 2026-11-06 | 28 | conteudo | en, pt, es | 1 / 1 / 1 | One card per tool on the home page |
| `pdf-pages` | 2026-11-09 | 29 | conteudo | en, pt, es | 12 / 12 / 12 | Whole pages in the PDF tools |
| `next-steps` | 2026-11-09 | 31 | conteudo | en, pt, es | 24 / 24 / 24 | Next steps that take your file along |
| `calculator-typing` | 2026-11-10 | 32 | conteudo | en, pt, es | 34 / 8 / 23 | Typing in a calculator, without stumbles |
| `avif-webp` | 2026-11-10 | 33 | conteudo | en, pt, es | 12 / 12 / 12 | AVIF to JPG and Convert to WebP |
| `organize-exif` | 2026-11-13 | 35 | conteudo | en, pt, es | 12 / 12 / 12 | Organize PDF and Remove EXIF data |
| `file-guides-measured` | 2026-11-13 | 35 | conteudo | en, pt, es | 10 / 10 / 10 | Guide numbers measured again |
| `trust-and-content` | 2026-11-13 | null | conteudo | en, pt, es | 65 / 44 / 54 | What's new and How it works |

Os `lastmod` dos sitemaps: en 90 URLs (8 em 6/nov, 5 em 10/nov, 77 em 13/nov), pt 62 (6 e 56), es 77 (6, 5 e 66).

### O Lighthouse das páginas novas (celular, três execuções, a representativa)

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/whats-new/` | 100 | 100 | 100 | 100 | 1,74 s | 0 |
| `/pt/novidades/` | 99 | 100 | 100 | 100 | 1,89 s | 0 |
| `/es/novedades/` | 100 | 100 | 100 | 100 | 1,74 s | 0 |
| `/how-it-works/` | 100 | 100 | 100 | 100 | 1,74 s | 0 |
| `/pt/como-funciona/` | 99 | 100 | 100 | 100 | 1,89 s | 0 |
| `/es/como-funciona/` | 99 | 100 | 100 | 100 | 1,89 s | 0 |
| `/about/` | 100 | 100 | 100 | 100 | 1,59 s | 0 |
| `/compress-image/` | 99 | 100 | 100 | 100 | 1,97 s | 0 |

### O orçamento

Nenhum JS novo nem mudado: os 70 arquivos de `dist/_astro/` com os mesmos nomes e os mesmos 1.644.437 bytes em gzip do `dist-base`. O CSS das ilhas cresceu 523 bytes em gzip (22.468 → 22.991: a Novidades, a Como funciona, o quadro do autor, a linha "Atualizado em"). A Novidades e a Como funciona carregam só o inline, como o Sobre (4,8 e 5,0 KB, 4 requisições).

## Os testes

- **Vitest:** 140 arquivos e 2.229 testes no ponto de partida; 150 arquivos e 2.372 testes na junção; 150 arquivos e 2.373 testes no fim (o teste novo da revisão, no `how-it-works-claims.test.ts`), todos verdes no `verificar --partes`.
- **Playwright `--list`:** 2.695 testes por navegador em 89 arquivos no ponto de partida; 2.719 em 89 no fim (os blocos novos do `budgets`, `i18n-budgets`, `layout-shift`, `a11y` e `launch-claims`).
- **A junção** (§ 774): os specs das frentes nos dois navegadores, 2.668 passaram, 3 pulados de antes e 1 reprovado (o CLS de 0,007 da Como funciona em pt, corrigido com a Figtree Steady); depois, 726 de 726 no `navigation`, `home-sea`, nos três de privacidade, `events`, `sw-offline`, `ads` e `fo-ad-map`.
- **Os testes antigos que mudaram** (§ 772, 13 itens): as listas e contagens das rotas, dos sitemaps, das páginas sem anúncio e do rodapé; os sitemaps de mentira com `<lastmod>`; o orçamento de pt e es com as páginas novas; o site falso do `conteudo.test.ts` (as respostas de PDF diferentes, a marca das calculadoras, o quadro do autor); o comentário do `pdf-matrix.spec.ts`.

## O `pnpm verificar --partes`

Rodou uma vez, no último commit de código, `a9e5047`, em 13/nov/2026, das 18h09 às 19h08, com a máquina livre.

```text
Resumo das partes do CI (pnpm verificar --partes, 26 partes lidas de .github/workflows/ci.yml)
  ok      52.5 s  build: pnpm verificar --build
  ok     237.7 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     398.7 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     164.7 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     152.3 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok     227.2 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     171.6 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok     107.4 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     143.4 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok     152.1 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     118.3 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      76.9 s  playwright: pnpm verificar --playwright=webkit --shard=1/15 --dist-pronto
  ok     117.3 s  playwright: pnpm verificar --playwright=webkit --shard=2/15 --dist-pronto
  ok     117.2 s  playwright: pnpm verificar --playwright=webkit --shard=3/15 --dist-pronto
  ok     226.8 s  playwright: pnpm verificar --playwright=webkit --shard=4/15 --dist-pronto
  ok     103.1 s  playwright: pnpm verificar --playwright=webkit --shard=5/15 --dist-pronto
  ok      59.8 s  playwright: pnpm verificar --playwright=webkit --shard=6/15 --dist-pronto
  ok     142.7 s  playwright: pnpm verificar --playwright=webkit --shard=7/15 --dist-pronto
  ok      86.8 s  playwright: pnpm verificar --playwright=webkit --shard=8/15 --dist-pronto
  ok      65.5 s  playwright: pnpm verificar --playwright=webkit --shard=9/15 --dist-pronto
  ok     100.5 s  playwright: pnpm verificar --playwright=webkit --shard=10/15 --dist-pronto
  ok     141.2 s  playwright: pnpm verificar --playwright=webkit --shard=11/15 --dist-pronto
  ok     131.6 s  playwright: pnpm verificar --playwright=webkit --shard=12/15 --dist-pronto
  ok     133.9 s  playwright: pnpm verificar --playwright=webkit --shard=13/15 --dist-pronto
  ok      75.2 s  playwright: pnpm verificar --playwright=webkit --shard=14/15 --dist-pronto
  ok     115.8 s  playwright: pnpm verificar --playwright=webkit --shard=15/15 --dist-pronto
  soma 3620.2 s (parede 3620.2 s; cada parte com o limite de 900 s)
```

As duas partes maiores são o Lighthouse (398,7 s) e a parte dos portões (237,7 s, eram 118,5 s na F18): o `gate:conteudo` foi de 2,0 s a 60,6 s, com o portão de repetição nas 148 páginas, e o `gate:prontidao` de 4,0 s a 62,3 s (os dois builds extras com anúncio). A maior parte do Playwright foi a Chromium 3/8, com 227,2 s, e a do WebKit, a 4/15 (226,8 s, a do `clearance`). Nas 23 partes do Playwright passaram 5.430 testes e 8 foram pulados (os testes de um navegador só), sem nenhuma falha, nenhuma nova tentativa e nenhum `net::ERR_NO_BUFFER_SPACE`.

A parte 2 (os portões), com as linhas reais da saída:

```text
Resumo do pnpm verificar (sem o Playwright e sem o Lighthouse, com o dist/ pronto)
  ok      14.8 s  tipos (astro check)
  ok       6.0 s  lint (eslint)
  ok      46.9 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       1.0 s  seo (hreflang, sitemaps, canonical, robots)
  ok       1.7 s  links internos e páginas órfãs
  ok      60.6 s  conteúdo mínimo das ferramentas e do site
  ok      62.3 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       2.1 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.9 s  licenças
  ok       0.6 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok      33.4 s  lint:texto (LanguageTool)
  total 237.6 s (limite 900 s)
```

O Vitest: 150 arquivos e 2.373 testes, todos verdes. O `lint:texto`: 159 arquivos, 10.445 textos, 0 erro de gramática, 1.846 avisos (os de ortografia, nas siglas e nos nomes de produto, e os de estilo, como "app").

## O custo

`pnpm ci:custo 43499821571`, a execução leve do push do `504d1fc` (o commit da revisão, a última antes deste relatório):

- Branch `fase-19a`, commit `504d1fc`, evento `pull_request`, resultado `success`. Classe: **leve**.
- Minutos cobrados: **6** (o `verificar (leve)` 4, o `classificar` 1, o `ci-ok` 1). Tempo de parede: **3,6 min**. Jobs: 3 rodaram, 7 pulados.
- O `verificar (leve)` levou 185 s, com 152,6 s de `pnpm verificar --leve` (os tipos, o lint, o build e o Vitest).

As execuções leves da run, uma por push: `abbf4bc` verde (`43474186438`, o primeiro push, com o prompt), `af056d6` verde (`43478441827`, o plano e a fatia 1), `0f0a5f2` verde (`43494937403`, a junção das sete frentes) e `504d1fc` verde (`43499821571`); a do `d2cec84` foi cancelada pelo push seguinte. O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list`, só leitura), e criá-lo é do Victor. As execuções leves de cada push rodaram o Vitest no Linux, com o histórico inteiro: o `changelog.test.ts` passou lá no `0f0a5f2` (a junção) e no `504d1fc` (o commit da revisão). A execução completa depois do `gh pr ready` é a primeira no WebKit do Linux; o resultado vai na descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo sobre o `504d1fc`, numa worktree só de leitura com install, build e build de teste próprios: (a) os textos e a repetição, (b) o SEO e as datas, (c) a privacidade e as provas, (d) dinheiro e saúde, (e) o site, o anúncio, o orçamento, a acessibilidade e o CI; um cético por achado médio ou acima e um por lente para os baixos.

- **13 achados, nenhum alto depois dos céticos.** De pé: o C-1 (médio: "All of it runs on a single thread" era falsa, porque o site cria Web Workers) e cinco baixos de repetição e clareza nas calculadoras e no Desbloquear PDF (A1, A2, A4, A5, D-1). Refutados sete; um deles, o E-1 (o `changelog.test.ts` deixaria vermelha toda PR aberta entre o merge da F19a e a F19b), foi corrigido assim mesmo.
- **As correções:** `751265c`, `06c935e`, `fc5d592`, `c56a1da` (um agente Opus) e `134cfcf` (o E-1, com a simulação do merge). O A1 é a exceção deliberada da § 770 (F19a m-13).
- **A segunda passada** (lentes a, c e d sobre o diff): dois baixos de pé, corrigidos (`da2383f`: a frase só diz que nenhuma biblioteca usa memória compartilhada; `a9e5047`: a resposta do refinanciamento vale também com a taxa nova em zero).
- **Nenhum achado alto ou médio aberto.** O relato está em `docs/relatorios/REVISAO-F19a.md` (§ 776).

## As imagens

Em `docs/relatorios/fase-19a/` (PNG, 1x, Chromium do Playwright, `.cache/f19a/shots.mjs`, do `dist/` da junção), a 360 e a 1280 px, nos temas claro e escuro:

- `novidades-*`: a Novidades em pt.
- `como-funciona-*`: a How it works em inglês.
- `sobre-*`: o Sobre em pt, com a data de lançamento e os links.
- `ferramenta-*`: o Compress image na nota de privacidade, com "How to check" e "Updated November 13, 2026 · What's new".
- `guia-*`: o guia "JPG o PNG" em es no quadro do autor.

## A prévia

https://fase-19a-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio). O build de produção do Cloudflare falhava desde o `fad3c64` (§ 750); isso é do Victor.

## As decisões novas

§ 751 a § 776 no `DECISOES.md`: a fonte única das novidades (751), as rotas e os links do rodapé (752), o `lastmod` e o portão (753), a data à vista (754), o histórico da Novidades (755), a página (756), o `changelog.test.ts` e as datas declaradas (757), o Sobre (758), a Como funciona e o GA4 como a Privacidade (759), as fontes de cada navegador (760), a tabela de WebAssembly (761), o `pnpm sobre:foto` (762), a autoria (763), o mapa de fatos (764), o portão de repetição (765), as perguntas que saíram e entraram (766), o corte nas calculadoras e a válvula (767), a mudança do site que muda texto (768), o sublinhado do "Como conferir" (769), as exceções ao mapa (770), o princípio 5 do design system (771), os testes antigos que mudaram (772), a entrada desta run (773), as frentes e a junção (774), o orçamento, os anúncios e o Lighthouse (775) e a revisão (776).

## A válvula de estouro

Não cortou nada: as calculadoras foram cortadas na própria run (§ 767), e não há `ajuste-repeticao-calculadoras`.

## As ideias que ficaram fora, de propósito

- Um feed RSS da Novidades: o site não tem nenhum e a ficha não pede.
- Um portão de paráfrase com outra medida (embeddings, sinônimos): o Dice de bigramas com a lista de fatos é determinista e cabe no `gate:conteudo`; a revisão lê o resto (F19a m-6).
- A data "Atualizado em" também nas calculadoras e nos guias: eles já mostram a data de revisão deles (§ 754).
- Um link "Como conferir" no PrivacySeal do topo: o selo fica perto da ferramenta, onde nenhum link novo entra.

## A lista do que é do Victor

1. `git pull` e, na prévia ou no fileorca.com depois do deploy, ler as páginas novas e as mudadas no celular e no computador: a Novidades (`/whats-new/`, `/pt/novidades/`, `/es/novedades/`), a Como funciona (`/how-it-works/`, `/pt/como-funciona/`, `/es/como-funciona/`), o Sobre, o rodapé, uma ferramenta de imagem, uma de PDF, uma calculadora e um guia (o quadro do autor no fim).
2. No Search Console: em Sitemaps, reenviar o `https://fileorca.com/sitemap-index.xml` (os `<lastmod>` são novos), e pedir a indexação das seis páginas novas: `/whats-new/`, `/pt/novidades/`, `/es/novedades/`, `/how-it-works/`, `/pt/como-funciona/` e `/es/como-funciona/`.
3. A foto do Sobre (os passos estão no `docs/OPERACAO.md`, "A foto do Sobre"): salvar a foto em `Claude outputs\victor.jpg`, rodar `pnpm sobre:foto "Claude outputs\victor.jpg"`, conferir os quatro arquivos em `public/about/` e o Sobre num `pnpm build`, e mandar numa branch `ajuste-foto-sobre`, com PR (o CI mescla). O original nunca vai para o Git.
4. Não pedir a revisão do AdSense ainda: a F19b vem antes.
5. Depois do merge desta PR, rodar a F19b com o `docs/prompts/prompt-fase-19b.txt` (ela põe o número desta PR na entrada `trust-and-content`, pendência F19a m-2).
6. Criar o rótulo `ci` (Issues → Labels), que ainda não existe; e, se o build de produção do Workers Builds ainda estiver falhando desde o `fad3c64` (§ 750), ver no painel do Cloudflare: é ele que põe as páginas novas no fileorca.com.
