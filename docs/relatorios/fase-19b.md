# F19b · relatório

A segunda das duas runs que respondem à recusa do AdSense de 13/nov/2026 ("Conteúdo de baixo valor"), com a ficha em `docs/prompts/prompt-fase-19b.txt` e o plano em `docs/relatorios/fase-19b-plano.md`. Ponto de partida: `a017fc4` (a F19a, PR #37). PR: [vmatusita/fileorca#38](https://github.com/vmatusita/fileorca/pull/38), da branch `fase-19b`. De `a017fc4` ao último commit de código (`5446cd3`): 90 commits (48 sem os de merge), 177 arquivos, +19.809 e −443 linhas.

## Resumo

1. **Cinco guias de arquivo em en, pt e es**, cada um com a ferramenta embutida e os números medidos pelo motor do próprio site: quanto uma foto de celular perde para caber no limite de um formulário (Comprimir imagem, "Up to a size"), quanto as mesmas fotos pesam em JPG, WebP e AVIF (Converter para WebP), o que muda num PDF assinado sem imprimir (Assinar PDF), o que a senha de um PDF protege e o que as restrições não protegem (Proteger PDF) e como o texto define o tamanho de um QR code (o gerador de QR code).
2. **Três guias de dinheiro em en e es**, com a calculadora embutida e os exemplos tirados do oráculo independente: APR ou APY, o pagamento mínimo do cartão (por que demora tanto) e quanto de casa dá para pagar.
3. As 21 páginas estão no hub (com o grupo novo Utilidades), na linha de guias de cada ferramenta e calculadora, nas relacionadas, na busca, no sitemap com o `lastmod`, no hreflang, no OG, no schema e na Novidades. O kit de lançamento passa a dizer 23 guias, 15 de arquivo e 8 de dinheiro.
4. Cada guia novo tem os próprios dias de revisão e de publicação: os 15 guias de antes ficaram com os deles, e as medidas dos 10 guias de arquivo antigos não mudaram um byte.
5. Nenhum JS mudou, nada sai do aparelho, e a revisão adversarial fechou sem achado alto ou médio aberto.

## O que entrou, por decisão da ficha

### 0. A F19a na main
A `origin/main` em `a017fc4` tinha o `src/platform/changelog.ts`, a rota `how-it-works`, o `scripts/lib/repeticao.ts` e o `docs/relatorios/fase-19a.md`: a run seguiu.

### 1. A linha 16 do contrato (§ 777)
`PLANO-MELHORIAS.md`, tabela "Mudanças no contrato": a linha 16 depois da 15, com o texto da ficha.

### 2. O roteiro do guia de arquivo e as datas (§ 778, § 779, § 789)
- Os cinco ids no `src/tools/guides/registry.ts`, com os caminhos de pt e es pelos glossários (§ 779), as relacionadas e o `toolSection` 2 (§ 789).
- **As datas por guia (§ 778):** o `OWN_DAY` do registro dá a um guia novo o dia da medida (16/nov/2026, em UTC), que é também a revisão e a primeira publicação nos três idiomas; o `measuredOf(id)` dá o dia em que os números de cada guia foram medidos, e o `measuredOn` do JSON passa a ser o mais novo. Os 10 guias de arquivo antigos seguem com 11/nov (revisão) e 2 e 3/nov (publicação); os 5 de dinheiro antigos, com 31/out e 3/nov. Nos guias de dinheiro, o `GUIDE_OWN_DAY` de `src/tools/calc/page.ts` faz o mesmo.

### 3. O que cada guia de arquivo mede (§ 781 a § 785)
O resumo de cada plano está na tabela "Os guias" abaixo; o detalhe, nos § 781 a § 785. As medidas seguem a regra do caminho da pessoa (navegador onde o site escreve pelo canvas, Node onde é WASM, pdf-lib ou qpdf), usam só as fixtures que existem (o guia do QR mede quatro textos feitos pelo script, a amostra de textos do § 786) e não medem nenhum tempo.

### 4. O guia do QR code nos tipos (§ 786, § 794)
`FileGuideTool`, `FileGuideHub` (`'utilities'`) e `FileGuideRelated` aceitam o QR code; o grupo Utilidades entra no hub e no rodapé só onde o idioma tem um guia dele; a amostra de textos (`TextSample`) e o cartão "Measured on N test texts"; o selo do QR no aviso de cookies e no OG do guia; o `QrTool.astro` dividido em `QrEmbed.astro` e `QrPageMold.astro`, com o único `<script>` no `QrTool.astro`. O breadcrumb do guia é Home › Guias › guia, como todo guia (§ 786).

### 5. Os guias de dinheiro e o oráculo (§ 787, § 801 a § 803)
Os casos novos no `scripts/oracle/calc.py` (4 do guia 6, 9 do guia 7, 8 do guia 8, todos com o `source` do guia), as 18 fixtures regeradas e o hash novo do script (`137e9380…` → `a42b86bc…`) no commit `2bf36ad`, antes de qualquer texto; os fatos e as tabelas no `src/tools/calc/guides.ts`, pelas contas do site no build; um `it` por guia no `calc-guides.test.ts`. O exemplo principal de cada guia é o que a calculadora embutida mostra ao abrir. O título do guia 7 só promete o que o guia mostra (§ 780).

### 6. O que gira em volta (§ 780, § 790, § 793, § 800)
Os cartões nos três idiomas, o hub, a linha de guias de 7 ferramentas e calculadoras e da página do QR, as relacionadas, a busca (§ 790), o OG, o `Article` com o autor e os dias de cada guia, o quadro do autor, as contagens do site e do kit (§ 800) e a entrada `new-guides` da Novidades (`pr: null`, 16/nov, § 793). A entrada da F19a ganhou o número da PR dela (#37) antes.

### 7. Os anúncios (§ 791, § 797)
Os guias de arquivo na área `arquivos`, os de dinheiro em `dinheiro`, o do QR em `utilidades` (lida da rota). No build de teste com IDs, a distância, os vãos e a densidade passam em cada página nova (a tabela abaixo).

### 8. A repetição e as palavras (§ 792)
O portão de repetição da F19a vale nos guias novos (as unidades são os blocos `data-guide-text`; os fatos são o envio e o aparelho), e a contagem de 800 a 1.500 palavras passou a valer também nos guias de dinheiro novos. Os 15 guias de antes ficam fora das duas regras novas: 12 deles falham a repetição em algum idioma, e dois de dinheiro em inglês têm menos de 800 palavras (pendências F19b no grupo 30).

### 9. A válvula
Não cortou nada: os oito guias entraram, nos idiomas da tabela.

## Os guias

| # | Guia | Caminhos | Palavras (en / pt / es) | O que mede ou calcula | Fontes oficiais (lidas em 16/nov/2026) |
| --- | --- | --- | --- | --- | --- |
| 1 | Foto para formulário online | `/guides/compress-photo-for-online-form/`, `/pt/guias/comprimir-foto-para-formulario-online/`, `/es/guias/comprimir-foto-para-formulario-en-linea/` | 1.217 / 1.252 / 1.294 | 3 fotos de celular a 100, 200 e 500 KB no "Up to a size", no Chromium e no WebKit: bytes, dimensões, a qualidade pelas tabelas de quantização (as 18 saídas casaram) e a maior qualidade em que a foto inteira caberia | NIST, prefixos binários |
| 2 | WebP vs AVIF vs JPG | `/guides/webp-vs-avif-vs-jpg/`, `/pt/guias/webp-avif-ou-jpg/`, `/es/guias/webp-avif-o-jpg/` | 1.211 / 1.302 / 1.310 | as 3 fotos em JPG, WebP e AVIF nos dois navegadores (AVIF 12 %, WebP 21 %, JPG 27 % do original); o PNG transparente: a transparência fica na WebP e no AVIF, vira branco no JPG | MDN, guia dos formatos de imagem |
| 3 | Como assinar um PDF sem imprimir | `/guides/sign-pdf-without-printing/`, `/pt/guias/assinar-pdf-sem-imprimir/`, `/es/guias/firmar-pdf-sin-imprimir/` | 1.208 / 1.313 / 1.286 | 3 PDFs assinados nos 3 modos, nos dois navegadores: uma imagem a mais por página assinada, o texto e os 145 campos do formulário intactos, nenhuma assinatura digital nova | E-SIGN Act (15 U.S.C. 7001, 7003, 7006) no govinfo; NIST (FIPS 186-5 e o glossário); Lei 14.063/2020 e MP 2.200-2/2001 no Planalto (pt); eIDAS no EUR-Lex (es) |
| 4 | O que a senha de um PDF protege | `/guides/what-a-pdf-password-protects/`, `/pt/guias/o-que-a-senha-do-pdf-protege/`, `/es/guias/que-protege-la-contrasena-de-un-pdf/` | 1.153 / 1.190 / 1.176 | 3 PDFs protegidos no Node (AES de 256 bits, R6; abre só com a senha; 820 a 1.039 bytes a mais); o PDF só com restrições abre sem senha, bloqueia 8 das 9 ações, e o Desbloquear PDF o deixa sem cifra | qpdf, PDF Encryption; NIST SP 800-63B |
| 5 | Tamanho do QR code | `/guides/qr-code-size/`, `/pt/guias/tamanho-do-qr-code/`, `/es/guias/tamano-del-codigo-qr/` | 1.213 / 1.309 / 1.329 | 4 textos (21 a 195 bytes): versão 3 a 15, 29 a 77 módulos por lado, PNG nos 3 tamanhos, 12 de 12 lidos de volta pelo jsQR com a Oli no meio | Denso Wave (qrcode.com): versões, correção de erros, FAQ, área do código, tamanho do módulo |
| 6 | APR vs APY | `/guides/apr-vs-apy/`, `/es/guias/apr-o-apy/` | 1.152 / — / 1.281 | 5 % de APR nos cinco compostos (5,00 % a 5,13 % de APY), 1 % e 10 %, e a volta de APY para APR (4 casos do oráculo) | CFPB: Regulation DD (§ 1030.2, 1030.3, 1030.4, Appendix A), as perguntas sobre APR, Regulation Z § 1026.1; kit do CFPB em es |
| 7 | Pagamento mínimo do cartão: por que demora tanto | `/guides/credit-card-minimum-payment/`, `/es/guias/pago-minimo-de-la-tarjeta-de-credito/` | 1.177 / — / 1.288 | $6.500 a 22,99 %: o pagamento que mal cobre os juros ($125: 24 anos e 7 meses, $30.261 de juros) contra pagamentos fixos maiores, até $500 (9 casos do oráculo) | CFPB: Regulation Z § 1026.7(b)(12), a pergunta do quadro dos três anos, o relatório dos cartões de 2023, o cálculo dos juros; folheto do Fed em es |
| 8 | Quanto de casa dá para pagar | `/guides/how-much-house-can-i-afford/`, `/es/guias/cuanta-casa-puedo-pagar/` | 1.232 / — / 1.392 | renda de $95.000, 28 % e 36 % como regra de bolso: o limite de moradia fixa o preço ($323.460) até $633,34 de outras dívidas; depois o de dívida total, e cada $100 por mês tira cerca de $15.821 (8 casos do oráculo) | CFPB: a relação dívida/renda, "Figure out how much you want to spend", PITI, o kit do financiamento (a regra de bolso dos 28 %) |

A tabela completa das fontes (URL, título como a página mostra, o fato que cada uma sustenta e como foi lida) está no § 788. Duas páginas foram lidas pelo navegador embutido, só leitura, porque o WebFetch não as trazia: o eIDAS no EUR-Lex (corpo vazio) e a tabela da correção de erros da Denso Wave (uma imagem). A página oficial do formulário candidato do guia 1 (travel.state.gov) deu 403 e parou na verificação contra robôs; ela não foi contornada, e nenhum formulário real é citado.

**Os commits das medidas e do oráculo, antes dos textos** (provado com `git merge-base --is-ancestor` contra cada commit de texto):

| Commit | O que leva | Antes de |
| --- | --- | --- |
| `83bf0ad` | os planos e o `data/guides-measured.json` dos guias 1 a 4 | os 17 commits de texto dos guias 1 a 4 (os quatro de en, os quatro de pt e es e os merges deles) |
| `2e3bff6` | o plano e o JSON do guia 5 | os 4 commits de texto do guia 5 |
| `2bf36ad` | os casos do `calc.py` e as 18 fixtures, com o hash novo | os 13 commits de texto dos guias 6 a 8 |

## A evidência de cada critério

| # | Critério | Prova | Resultado |
| --- | --- | --- | --- |
| 1 | A linha 16 e o § | `PLANO-MELHORIAS.md`; § 777 | ok |
| 2 | As 21 páginas no ar, 200, e os portões | `.cache/f19b/status-check.mjs` (21 de 21 com 200 no `dist/` da junção; no `dist-base`, as 21 dão 404: "summary: {"404":21} of 21"); `pnpm gate:conteudo`: "ok, … 45 guia(s) de arquivo … 16 guia(s) de dinheiro; 169 sem repetição"; o Vitest inteiro | ok |
| 3 | As medidas | `pnpm guias:medir --check` inteiro na junção (`8b54cd6`): "0 difference(s) in 498.0 s"; os 10 guias antigos iguais byte a byte ao `a017fc4` (`.cache/f19b/old-guides-same.mjs`: "old guides: 10, identical: 10") | ok |
| 4 | O oráculo | o `calc.py --check` "igual" nas 18 fixtures; `calc-guides.test.ts`, `calc-oracle.test.ts` verdes; `pnpm gate:dinheiro-saude`: "ok, 76 de 76 página(s)"; o mutante de um centavo reprova ("1 of 218 cases differ") | ok |
| 5 | As fontes | § 788, com a data da leitura; as lentes b e c (nenhuma frase jurídica, médica ou de recomendação; nenhum formulário real) | ok |
| 6 | O site | `pnpm gate:seo`: "ok, 250 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps"; `pnpm gate:links`: "ok, 21330 links internos em 259 páginas, nenhuma órfã"; `changelog.test.ts`, `launch-kit.test.ts`, `guides-hub.spec.ts`, `guides-search.spec.ts`, `navigation.spec.ts` verdes | ok |
| 7 | Anúncio e orçamento | a tabela abaixo; o `dist/_astro` igual ao da base (70 arquivos, mesmos nomes, 4.979.656 bytes) | ok |
| 8 | Lighthouse, axe e CLS | a tabela abaixo; o `a11y.spec.ts` e o `layout-shift.spec.ts` verdes | ok |
| 9 | Privacidade | `launch-claims.spec.ts`, `events.spec.ts` e os cinco specs de privacidade no lote A (1.749 passaram, 1 pulado) | ok |
| 10 | Textos | `pnpm lint:texto` contra a `origin/main`: "30 arquivo(s), 2343 textos, 0 erro(s) de gramática, 751 aviso(s)"; `english-leak`, `glossary`, `claude-md`, `pendencias` verdes | ok |
| 11 | Testes antigos | § 796, um por um; nenhum pulado, desligado ou afrouxado | ok |
| 12 | Docs | `docs/claude/idiomas.md` (seção F19b), `windows-git-bash.md` e `anuncios.md`; o grupo 30 do `docs/PENDENCIAS.md` (26 linhas) | ok |
| 13 | Verificar e CI | a seção abaixo | (saída real abaixo) |
| 14 | Revisão | `docs/relatorios/REVISAO-F19b.md`: nenhum achado alto ou médio aberto | ok |

## Contagens de guias, antes e depois

| Onde | Antes (`a017fc4`) | Depois |
| --- | --- | --- |
| Hub de guias (en / pt / es) | 15 / 10 / 15 | 23 / 15 / 23 |
| Home ("See all {n} guides") e Menu ("{n} guides") | 15 / 10 / 15 | 23 / 15 / 23 |
| Rodapé, grupos do bloco Guias (en / pt / es) | 3 / 2 / 3 | 4 / 3 / 4 (Utilidades) |
| Sobre e Termos | não contam guias | não contam guias |
| Kit (`docs/lancamento/product-hunt.md`) | guides=15 file-guides=10 money-guides=5 | guides=23 file-guides=15 money-guides=8 |
| Sitemaps (en / pt / es) | 90 / 62 / 77 URLs | 98 / 67 / 85 URLs |
| Páginas de guia | 40 | 61 |

## Orçamento, anúncios e Lighthouse

| Página | JS inicial (gzip, 2 arquivos + inline) | A irmã | Densidade a 360 px (build de teste) |
| --- | --- | --- | --- |
| `/guides/compress-photo-for-online-form/` | 28,7 KB | `/guides/jpg-vs-png/`, 28,2 KB | abaixo de 16 % |
| `/guides/webp-vs-avif-vs-jpg/` | 28,4 KB | `/guides/jpg-vs-png/`, 28,2 KB | abaixo de 16 % |
| `/guides/sign-pdf-without-printing/` | 52,2 KB | `/guides/combine-pdfs-on-phone/`, 52,2 KB | abaixo de 16 % |
| `/guides/what-a-pdf-password-protects/` | 52,2 KB | `/guides/combine-pdfs-on-phone/`, 52,2 KB | 14,1 % (vãos 1.540, 1.400 e 2.298 px) |
| `/guides/qr-code-size/` | 38,4 KB | `/qr-code-generator/`, 38,4 KB | 7,8 % (vão 1.518 px) |
| `/guides/apr-vs-apy/`, `/guides/credit-card-minimum-payment/`, `/guides/how-much-house-can-i-afford/` | 63,1 KB | `/guides/extra-mortgage-payments/`, 63,1 KB | abaixo de 16 % |

O `fo-ad-map.spec.ts` conta 226 páginas com anúncio (eram 205); a distância de 150 px (`clearance.spec.ts`), os vãos entre anúncios de conteúdo e a densidade de até 30 % passam em toda página nova, depois da correção do guia 4 (`c9eeb89`, § 795).

| Lighthouse (celular, mediana de 3) | Desempenho | Acessibilidade | Boas práticas | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| /guides/compress-photo-for-online-form/ | 99 | 100 | 100 | 100 | 0.000 |
| /pt/guias/assinar-pdf-sem-imprimir/ | 99 | 100 | 100 | 100 | 0.000 |
| /es/guias/webp-avif-o-jpg/ | 99 | 100 | 100 | 100 | 0.000 |
| /guides/apr-vs-apy/ | 98 | 100 | 100 | 100 | 0.000 |
| /es/guias/cuanta-casa-puedo-pagar/ | 98 | 100 | 100 | 100 | 0.000 |
| /guides/qr-code-size/ | 99 | 100 | 100 | 100 | 0.000 |

## Os testes

- **Vitest:** 150 arquivos e 2.373 testes no ponto de partida; 150 arquivos e 2.396 testes no fim (os novos: os dias por guia, a amostra de textos, o grupo Utilidades, a repetição e a contagem nos guias, a marca duas vezes no título, os `it` dos três guias de dinheiro, a diferença de juros do guia 7), todos verdes.
- **Playwright `--list`:** 2.719 testes no Chromium e 2.719 no WebKit, em 89 arquivos, no ponto de partida; 2.857 e 2.857, nos mesmos 89 arquivos, no fim.
- **Os testes antigos que mudaram:** § 796, um por um (os dias por guia da fatia 1; as contagens e os grupos da SA e da M5; o `SPEC_N` e os agrupados da M1; a `FEMININE` das frentes T; o selo de cookies do guia do QR e o rodapé com Utilidades na junção; o `it` do guia 8 que prende os 28 % e 36 %).
- **Os controles negativos:** as 21 rotas novas com 404 no `dist-base`; o mutante de um centavo no oráculo; um pagamento que não é caso do oráculo reprova o `calc-guides.test.ts` ("is not a case of the oracle"); o `calc-guides.test.ts` com o `guides.ts` de antes da correção b-1 reprova ("expected 27678 to be 27679"); o `brandSuffixProblem` reprova os títulos dos textos mínimos.

## O `pnpm verificar --partes`

No `5446cd3`, o último commit de código, com a máquina livre. A primeira passada parou na Chromium 1/8 por um servidor velho que uma frente deixou na porta 4173 (o Playwright o reaproveitou e testou o `dist/` de uma worktree; § 799); com ele encerrado, a passada inteira:

```
Resumo das partes do CI (pnpm verificar --partes, 26 partes lidas de .github/workflows/ci.yml)
  ok      56.8 s  build: pnpm verificar --build
  ok     111.5 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     394.6 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok     113.7 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     152.1 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok     254.8 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     181.8 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok     102.8 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     142.9 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok     174.2 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     123.4 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      78.4 s  playwright: pnpm verificar --playwright=webkit --shard=1/15 --dist-pronto
  ok     118.4 s  playwright: pnpm verificar --playwright=webkit --shard=2/15 --dist-pronto
  ok     117.0 s  playwright: pnpm verificar --playwright=webkit --shard=3/15 --dist-pronto
  ok     221.3 s  playwright: pnpm verificar --playwright=webkit --shard=4/15 --dist-pronto
  ok     128.6 s  playwright: pnpm verificar --playwright=webkit --shard=5/15 --dist-pronto
  ok      59.7 s  playwright: pnpm verificar --playwright=webkit --shard=6/15 --dist-pronto
  ok     151.7 s  playwright: pnpm verificar --playwright=webkit --shard=7/15 --dist-pronto
  ok     101.1 s  playwright: pnpm verificar --playwright=webkit --shard=8/15 --dist-pronto
  ok      63.9 s  playwright: pnpm verificar --playwright=webkit --shard=9/15 --dist-pronto
  ok     100.1 s  playwright: pnpm verificar --playwright=webkit --shard=10/15 --dist-pronto
  ok     137.8 s  playwright: pnpm verificar --playwright=webkit --shard=11/15 --dist-pronto
  ok     135.9 s  playwright: pnpm verificar --playwright=webkit --shard=12/15 --dist-pronto
  ok     141.2 s  playwright: pnpm verificar --playwright=webkit --shard=13/15 --dist-pronto
  FALHA   80.3 s  playwright: pnpm verificar --playwright=webkit --shard=14/15 --dist-pronto
  soma 3444.0 s (parede 3444.0 s; cada parte com o limite de 900 s)
```

A WebKit 15/15, que o `--partes` não chegou a rodar (ele para na primeira falha), rodou sozinha depois: `190 passed (2.0m)`, `total 122.6 s (limite 900 s)`. Soma das 26 partes: 3.566,6 s; nenhuma acima de 900 s.

A falha da WebKit 14/15 é uma instabilidade que já existia (a regra da ficha: rodar no ponto de partida). Um caso do teste parametrizado `pdf-tool.spec.ts:461` ("Enter on the action puts the focus on Download, and the DropZone never shows meanwhile") reprova às vezes, no foco do teclado da grade do Reorganizar ou do Excluir páginas: sozinho, 5 de 5 passaram; com `--repeat-each=4`, 1 reprovado em 12 na junção e **1 reprovado em 12 no `dist-base`** (`a017fc4`). A run não tocou o PDF nem nenhum JS (o `dist/_astro` é o da base, byte a byte). Fica a pendência F19b m-27 e o § 799; nenhum teste foi pulado nem afrouxado.

## O CI e o custo

- **A última execução antes do `gh pr ready`** (regra 5): a leve do rascunho, no `8b54cd6`, verde.

```
### Execução 43909526182 (tentativa 1)
- Branch fase-19b, commit 8b54cd6, evento pull_request, resultado success.
- Classe: leve.
- Minutos cobrados: 6 (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: 4.3 min (do início do primeiro job ao fim do último).
- Jobs: 3 rodaram, 7 pulados (ci-ok 39 s; classificar 12 s; verificar (leve) 204 s, com o verificar em 176,1 s).
```

- **A execução completa** sai do `gh pr ready`, depois deste relatório: o resultado e o `pnpm ci:custo` dela vão na descrição da PR. O rótulo `ci` não existe no repositório, então nenhuma conferência no Linux aconteceu no meio da run (pendência F19b m-1).
- **A primeira execução completa:** A primeira execução completa (`43931578243`, no `c5dd869`, depois do `gh pr ready`) reprovou a WebKit 14/15 do Linux num teste que a run não tocou: o `pdf-privacy.spec.ts:424`, no Organizar PDF, achou a sentinela do nome do arquivo num pedido `GET blob:http://127.0.0.1:4173/…` (um objeto em memória do próprio navegador, que não sai do aparelho). O diff da run contra o `a017fc4` em `src/tools/pdf`, `src/engine` e nesse spec é vazio, e o mesmo teste passou no WebKit do Windows no lote A e no `--partes`. O GitHub não deixa re-executar um job antes de a execução inteira terminar; o push deste registro disparou uma execução completa nova, que vale como a nova tentativa (a ficha permite uma por falha que pareça instável). Pendência F19b m-28. O resultado da nova vai na descrição da PR.

## A revisão

Cinco lentes Sonnet em contexto limpo sobre o `8b54cd6`, um cético por achado médio ou alto: um alto (e-1, os 1.092 px entre dois anúncios do guia 4 a 459 px, já corrigido pela junção no `c9eeb89`) e um baixo (b-1, a diferença de juros do guia 7, corrigida no `0af359d`) confirmados; três baixos refutados; a lente de dinheiro não achou nada. A segunda passada confirmou as duas correções. Nada ficou aberto acima de baixo. O detalhe está no `docs/relatorios/REVISAO-F19b.md`.

## As imagens

Em `docs/relatorios/fase-19b/`, a 360 e a 1280 px, claro e escuro: `guia-arquivo` (o topo do guia 1 em inglês, com a ficha e a ferramenta), `guia-arquivo-tabela` (a medida do guia 3 em pt), `guia-dinheiro` (o topo do guia 7 em inglês), `guia-dinheiro-tabela` (a tabela do guia 8 em es), `guia-qr` (o guia do QR com o gerador embutido) e `hub-de-guias` (o grupo Utilidades no hub).

## A prévia

https://fase-19b-fileorca.vmatusita.workers.dev/ (o build padrão, sem anúncio).

## As decisões novas

§ 777 a § 803: § 777 a § 799 com os assuntos que o plano reservou (seção 2), e § 800 (as contagens de guias), § 801 a § 803 (os textos dos guias 6, 7 e 8 em en e es). A válvula não cortou nada. As pendências da run são as 28 linhas do grupo 30 do `docs/PENDENCIAS.md`.

## O que é do Victor

1. `git pull` e, na prévia ou no fileorca.com depois do deploy, ler um guia de cada molde no celular e no computador, usando a ferramenta embutida: o guia 1 (comprimir uma foto até um limite), o guia 6 (APR e APY) e o guia 5 (o QR code).
2. No Search Console, pedir a indexação de cada guia novo:
   - `https://fileorca.com/guides/compress-photo-for-online-form/`, `https://fileorca.com/pt/guias/comprimir-foto-para-formulario-online/`, `https://fileorca.com/es/guias/comprimir-foto-para-formulario-en-linea/`
   - `https://fileorca.com/guides/webp-vs-avif-vs-jpg/`, `https://fileorca.com/pt/guias/webp-avif-ou-jpg/`, `https://fileorca.com/es/guias/webp-avif-o-jpg/`
   - `https://fileorca.com/guides/sign-pdf-without-printing/`, `https://fileorca.com/pt/guias/assinar-pdf-sem-imprimir/`, `https://fileorca.com/es/guias/firmar-pdf-sin-imprimir/`
   - `https://fileorca.com/guides/what-a-pdf-password-protects/`, `https://fileorca.com/pt/guias/o-que-a-senha-do-pdf-protege/`, `https://fileorca.com/es/guias/que-protege-la-contrasena-de-un-pdf/`
   - `https://fileorca.com/guides/qr-code-size/`, `https://fileorca.com/pt/guias/tamanho-do-qr-code/`, `https://fileorca.com/es/guias/tamano-del-codigo-qr/`
   - `https://fileorca.com/guides/apr-vs-apy/`, `https://fileorca.com/es/guias/apr-o-apy/`
   - `https://fileorca.com/guides/credit-card-minimum-payment/`, `https://fileorca.com/es/guias/pago-minimo-de-la-tarjeta-de-credito/`
   - `https://fileorca.com/guides/how-much-house-can-i-afford/`, `https://fileorca.com/es/guias/cuanta-casa-puedo-pagar/`
3. Acompanhar no Search Console, por algumas semanas, as impressões e os cliques do site. Pedir a nova revisão do AdSense quando os cliques orgânicos estiverem subindo: no AdSense, em Sites, abrir o fileorca.com e pedir a revisão.
4. Se ainda não postou, usar os textos de `docs/lancamento/` (Show HN, diretórios, Product Hunt): tráfego de gente de verdade é o "interesse do usuário" que a recusa pediu.
5. A válvula não cortou guia nenhum: não há `fase-19c` a gerar. Para as pendências desta run, ver o grupo 30 do `docs/PENDENCIAS.md`; a primeira é sua: criar o rótulo `ci` no repositório (Issues → Labels), para as próximas runs conferirem o Linux no meio do trabalho.
