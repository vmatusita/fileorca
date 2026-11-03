# Ajuste "idiomas": o plano

Gabarito da run e da revisão final. A ficha é `docs/prompts/prompt-ajuste-idiomas.md`; as decisões novas estão no `DECISOES.md` a partir do § 308. Escrito em 2 e 3 de novembro de 2026 (Brasília), depois da exploração (seis relatórios de subagentes Sonnet, resumidos aqui).

## 1. As 40 páginas

Todas indexáveis, com canonical, o sitemap do idioma e o hreflang recíproco (x-default no inglês). O caminho em inglês já existe; os de pt e es são novos.

### QR code (2): en, pt e es no hreflang

| id | en | pt | es |
| --- | --- | --- | --- |
| `qr-code-generator` | `/qr-code-generator/` | `/pt/gerador-de-qr-code/` | `/es/generador-de-codigo-qr/` |

### Dinheiro dos EUA em espanhol (18): en e es no hreflang

| id | en | es | arquivo do PDF e do CSV (es) |
| --- | --- | --- | --- |
| `auto-loan-calculator` | `/auto-loan-calculator/` | `/es/calculadora-de-prestamo-para-auto/` | `tabla-prestamo-para-auto` |
| `refinance-calculator` | `/refinance-calculator/` | `/es/calculadora-de-refinanciamiento/` | `comparacion-refinanciamiento` |
| `home-affordability-calculator` | `/home-affordability-calculator/` | `/es/calculadora-de-cuanta-casa-puedo-pagar/` | `cuanta-casa-puedo-pagar` |
| `loan-amortization-calculator` | `/loan-amortization-calculator/` | `/es/calculadora-de-amortizacion-de-prestamos/` | `tabla-amortizacion-prestamo` |
| `debt-consolidation-calculator` | `/debt-consolidation-calculator/` | `/es/calculadora-de-consolidacion-de-deudas/` | `comparacion-consolidacion-de-deudas` |
| `rent-vs-buy-calculator` | `/rent-vs-buy-calculator/` | `/es/calculadora-de-alquilar-o-comprar/` | `alquilar-o-comprar` |
| `savings-goal-calculator` | `/savings-goal-calculator/` | `/es/calculadora-de-meta-de-ahorro/` | `plan-meta-de-ahorro` |
| `simple-interest-calculator` | `/simple-interest-calculator/` | `/es/calculadora-de-interes-simple/` | `interes-simple` |
| `apr-to-apy-calculator` | `/apr-to-apy-calculator/` | `/es/calculadora-de-apr-a-apy/` | `tabla-apr-a-apy` |
| `mortgage-calculator-extra-payments` | `/mortgage-calculator/extra-payments/` | `/es/calculadora-de-hipoteca/pagos-adicionales/` | `tabla-pagos-adicionales` |
| `mortgage-calculator-biweekly` | `/mortgage-calculator/biweekly/` | `/es/calculadora-de-hipoteca/pagos-cada-dos-semanas/` | `tabla-hipoteca-cada-dos-semanas` |
| `mortgage-calculator-15-vs-30-year` | `/mortgage-calculator/15-vs-30-year/` | `/es/calculadora-de-hipoteca/15-o-30-anos/` | `hipoteca-15-o-30-anos` |
| `loan-amortization-calculator-balloon-payment` | `/loan-amortization-calculator/balloon-payment/` | `/es/calculadora-de-amortizacion-de-prestamos/pago-global/` | `tabla-prestamo-con-pago-global` |
| `guides-15-vs-30-year-mortgage` | `/guides/15-vs-30-year-mortgage/` | `/es/guias/hipoteca-a-15-o-30-anos/` | (guia) |
| `guides-debt-snowball-vs-avalanche` | `/guides/debt-snowball-vs-avalanche/` | `/es/guias/bola-de-nieve-o-avalancha/` | (guia) |
| `guides-extra-mortgage-payments` | `/guides/extra-mortgage-payments/` | `/es/guias/pagos-adicionales-a-la-hipoteca/` | (guia) |
| `guides-refinance-break-even` | `/guides/refinance-break-even/` | `/es/guias/punto-de-equilibrio-del-refinanciamiento/` | (guia) |
| `guides-rent-vs-buy-break-even` | `/guides/rent-vs-buy-break-even/` | `/es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/` | (guia) |

O hub `/es/calculadoras-financieras/` já existe e passa a listar as 14 calculadoras (crédito primeiro), os 4 presets e os 5 guias.

### Guias de arquivo (20): en, pt e es no hreflang

| id | en | pt | es |
| --- | --- | --- | --- |
| `guides-heic-to-jpg-on-windows` | `/guides/heic-to-jpg-on-windows/` | `/pt/guias/heic-para-jpg-no-windows/` | `/es/guias/heic-a-jpg-en-windows/` |
| `guides-why-is-my-pdf-so-large` | `/guides/why-is-my-pdf-so-large/` | `/pt/guias/por-que-meu-pdf-esta-tao-grande/` | `/es/guias/por-que-mi-pdf-pesa-tanto/` |
| `guides-social-media-image-sizes` | `/guides/social-media-image-sizes/` | `/pt/guias/tamanhos-de-imagem-para-redes-sociais/` | `/es/guias/tamanos-de-imagen-para-redes-sociales/` |
| `guides-open-webp-save-as-jpg` | `/guides/open-webp-save-as-jpg/` | `/pt/guias/abrir-webp-e-salvar-como-jpg/` | `/es/guias/abrir-webp-y-guardar-como-jpg/` |
| `guides-jpg-vs-png` | `/guides/jpg-vs-png/` | `/pt/guias/jpg-ou-png/` | `/es/guias/jpg-o-png/` |
| `guides-remove-location-from-photos` | `/guides/remove-location-from-photos/` | `/pt/guias/remover-localizacao-das-fotos/` | `/es/guias/quitar-la-ubicacion-de-las-fotos/` |
| `guides-pdf-to-jpg-resolution` | `/guides/pdf-to-jpg-resolution/` | `/pt/guias/resolucao-de-pdf-para-jpg/` | `/es/guias/resolucion-de-pdf-a-jpg/` |
| `guides-split-pdf-file-size` | `/guides/split-pdf-file-size/` | `/pt/guias/dividir-pdf-e-tamanho-do-arquivo/` | `/es/guias/dividir-pdf-y-tamano-del-archivo/` |
| `guides-combine-pdfs-on-phone` | `/guides/combine-pdfs-on-phone/` | `/pt/guias/juntar-pdfs-no-celular/` | `/es/guias/unir-pdf-en-el-celular/` |
| `guides-photos-to-one-pdf` | `/guides/photos-to-one-pdf/` | `/pt/guias/fotos-em-um-pdf/` | `/es/guias/fotos-en-un-solo-pdf/` |

## 2. Os lotes de texto e quem escreve

Agentes Opus em worktree (decisão 7). Os quatro lotes da ficha, os dois maiores divididos em duas partes pelo tamanho (§ 316): cada parte tem um agente só, e o glossário vem antes.

| Lote | Agente | Arquivos |
| --- | --- | --- |
| QR | 1 | `src/tools/qr-code-generator/i18n/{pt,es}.ts`; cartões, coluna e categoria do QR, seção da home e a frase da Privacidade (integrados pelo agente principal) |
| Dinheiro em es, calculadoras | 1 | `src/tools/{auto-loan,refinance,home-affordability,loan-amortization,debt-consolidation,rent-vs-buy,savings-goal,simple-interest,apr-to-apy}-calculator/i18n/es.ts` |
| Dinheiro em es, presets e guias | 1 | `src/tools/mortgage-calculator/presets/{extra-payments,biweekly,15-vs-30-year}/i18n/es.ts`, `src/tools/loan-amortization-calculator/presets/balloon-payment/i18n/es.ts`, `src/i18n/es/guide-{15-vs-30-year-mortgage,debt-snowball-vs-avalanche,extra-mortgage-payments,refinance-break-even,rent-vs-buy-break-even}.ts`, o bloco `presets` do `mortgage-calculator/i18n/es.ts` e o hub `src/i18n/es/money-calculators.ts` |
| Guias de arquivo em pt, imagem | 1 | `src/i18n/pt/guide-{heic-to-jpg-on-windows,social-media-image-sizes,open-webp-save-as-jpg,jpg-vs-png,remove-location-from-photos,photos-to-one-pdf}.ts` |
| Guias de arquivo em pt, PDF | 1 | `src/i18n/pt/guide-{why-is-my-pdf-so-large,pdf-to-jpg-resolution,split-pdf-file-size,combine-pdfs-on-phone}.ts` |
| Guias de arquivo em es, imagem | 1 | os 6 de imagem em `src/i18n/es/` |
| Guias de arquivo em es, PDF | 1 | os 4 de PDF em `src/i18n/es/` |

Escritos pelo agente principal: `src/i18n/{pt,es}/file-guides.ts` (palavras do formato, nomes das fixtures), os cartões em `src/i18n/{pt,es}/common.ts`, as seções do QR nas homes, as institucionais e o glossário. Cada lote passa pela leitura do agente principal (glossário e `lint:texto`) antes de entrar na branch.

## 3. O código que tira os `'en'` fixos (fatia 1, feita)

- **Registro e rotas.** `CalcPageDef.es` obrigatório (`{ path, file }`); os chips, as relacionadas, a mãe e o guia em es são os do inglês. `ES_CALC_IDS` sai (§ 311). `GuideDef.es.path`; `FileGuideDef.paths` com os slugs; o QR com pt e es; `HOME_MONEY_IDS.es = HOME_CALC_IDS`, `HUB_MONEY_IDS.es = CALC_TOOL_IDS`; `moneyPage()` em es leva `parent` e `guide`.
- **Tipos.** `PtCommonTexts` e `EsCommonTexts` exigem `qr`, `fileGuides`, `footer.utilityColumn`, `search.utilityCategory` (e `guides` em es); `TranslatedHomeTexts` exige a seção do QR; `EsMoneyHubTexts` exige os presets e os guias. `GuideTexts<Id>` ganha `words` (as palavras dos fatos e da tabela). `FileGuidesSharedTexts` ganha `numbers` (masculino e feminino), `times`, `timesOne` e `bytes`; `FileGuideTexts.measuredTerms`.
- **Formatação dos guias de arquivo** (`src/tools/guides/measured.ts`): `GuideFormat` com o idioma; tamanho, `%`, separadores, `dB`, `ppi`, "vezes/veces" e as contagens por extenso no idioma, com U+00A0 entre número e unidade em pt e es; `{x_wordf}`; `measuredTerm()` traduz as palavras inglesas do JSON e para o build se faltar uma.
- **Guias de dinheiro** (`src/tools/calc/guides.ts`): `GUIDE_FACTS[id](lang)`, com dólares, taxas e durações no idioma e as palavras do `words` de cada guia.
- **Moldes e páginas.** `FileGuideView`, `GuideView`, `Reviewed` (os dois), `QrTool`, `MoneyCalculatorsView`, `ImageToolsView`, `PdfToolsView`, `ImageToolPage`, `PdfToolPage`, `search-index.json`, os cartões OG e o `articleLd` (imagem pelo id da rota) recebem o idioma. `presetRows` e `guideOf` servem o es. As datas: `IDIOMAS_DAY = 2026-11-03` para as páginas de dinheiro em es e os guias novos (§ 312).
- **Os 40 arquivos de página** em `src/pages/{pt,es}/…/index.astro`.

## 4. Portões e testes (fatias seguintes)

| O quê | Arquivos | Prova |
| --- | --- | --- |
| Portões com idioma | `scripts/gates/seo.ts` (nome do guia e H1 da ferramenta no idioma; o QR na checagem por registro), `scripts/gates/conteudo.ts` e `scripts/lib/conteudo.ts` (QR por idioma, guias ×3), `scripts/lib/file-guides.ts` (data da medida e `FILLER` por idioma), `scripts/gates/design.ts` (voz dos guias ×3, com `lang`), `scripts/gates/lint-texto.ts` (guias pt/es pelo `fillValues` com idioma, guias de dinheiro es pelo `GUIDE_FACTS(lang)`, amostras es dos placeholders novos, QR) | controles negativos em `conteudo.test.ts`, `seo-pages.test.ts`, `lint-texto-*.test.ts` |
| Regra dos números | `tests/unit/guides-numbers.test.ts` lê en, pt e es, com `GENERAL`, `SOURCES`, `LOW`/`HIGH` por idioma, a tabela do gênero de cada contagem e os algarismos do `measuredTerms` iguais aos da chave inglesa | controles negativos em pt e es |
| Rotas e registros | `routes.test.ts`, `seo-checks.test.ts`, `ymyl.test.ts`, `prontidao.test.ts`, `pdf-site.test.ts`, `about-counts.test.ts`, `calc-defs.test.ts`, `calc-i18n.test.ts`, `calc-report.test.ts`, `calc-guides.test.ts`, `guides-measured.test.ts` (com a regex `{(w+)}` corrigida) | os próprios testes |
| E2E | `qr-code.spec.ts` (pt e es, com acento: binaryData = bytes UTF-8 em PNG e SVG, com e sem a Oli, evento sem o texto, atributos da caixa), `money-calc.spec.ts` e um spec novo de es (ResultHero e soma da tabela iguais ao inglês; CSV lido de volta contra a fixture; PDF Letter em es), `tool-guides.spec.ts` (os 20 guias), `ads.spec.ts` (presets, guias de dinheiro es, guias de arquivo pt/es, QR pt/es; resultado acima de 740 px a 360 × 740), `i18n-budgets.spec.ts` (2 arquivos JS e "mesmos arquivos do inglês"), `calc-form.spec.ts` (es), `money-privacy.spec.ts`, `navigation.spec.ts` (exemplo de página só em inglês passa a ser de casa e saúde), `a11y.spec.ts` (QR pt/es com resultado), `layout-shift.spec.ts` (borda das páginas novas) | o Playwright nos dois navegadores |

## 5. Critérios de aceitação ligados à prova

| # | Critério | Prova |
| --- | --- | --- |
| 1 | 40 páginas, 200, indexáveis, canonical, sitemap, hreflang recíproco | `gate:seo`, `gate:links`, `routes.test.ts`, tabela do relatório |
| 2 | Mesmo número do inglês; CSV = fixture; PDF Letter em es | spec de dinheiro em es, `calc-i18n.test.ts`, `calc-report.test.ts` |
| 3 | Só placeholders nos guias; `--check` zerados | `guides-numbers.test.ts` (3 idiomas), `pnpm guias:medir --check`, os 3 oráculos e o Pix com `--check` |
| 4 | QR pt/es lido de volta, nada sai do aparelho | `qr-code.spec.ts` |
| 5 | Hubs, home, rodapé, busca e 404 levam às páginas | `gate:links`, `gate:prontidao`, `navigation.spec.ts`, `routes.test.ts` |
| 6 | Glossário, `lint:texto`, conteúdo, SEO, prontidão, dinheiro e saúde | `glossary.test.ts`, `pnpm lint:texto`, os portões |
| 7 | Anúncio e layout | `ads.spec.ts`, `calc-form.spec.ts`, reflow do `design.spec.ts`, `layout-shift.spec.ts` |
| 8 | 2 arquivos JS por ferramenta, calculadora e guia, como o inglês | `i18n-budgets.spec.ts` |
| 9 | Casa e saúde intactas | `git diff --stat origin/main -- <11 pastas> src/i18n/life-hubs.ts` vazio |
| 10 | Lighthouse nos limiares | `pnpm lhci` |
| 11 | CI verde, partes abaixo de 900 s | `gh run view` |
| 12 | Revisão sem crítico nem alto aberto | `docs/relatorios/REVISAO-ajuste-idiomas.md` |
| 13 | `pnpm verificar` limpo, por partes | saída no relatório |

## 6. A projeção do CI e a divisão

Da exploração (e), com o tempo por spec da execução 41548317129 e o modelo de partição do `--shard` (erro de 1 a 3 % sobre a F8):

- Com as partes de hoje (Chromium 4, WebKit 10) e os testes que a decisão 8 pede, a parte 9 do WebKit iria a uns 732 s e a 1 do Chromium a 653 s. A variância entre execuções do mesmo código chega a ±35 %.
- A parte `verificar` iria de 674,8 s a uns 715 s (o `lint:texto` com a diff desta PR, o build e o Vitest crescem; o Lighthouse sozinho são 382,6 s).
- **Decisão (§ 320): Chromium em 5, WebKit em 12 e a parte `verificar` em duas** (`--sem-playwright --sem-lighthouse` e `--lighthouse`), com o job `verificar` virando matriz (os `needs` do `merge` e do `alerta-dependabot` não mudam). Projeção: máximo de uns 593 s no Chromium, 629 s no WebKit, 340 s e 405 s nas duas do `verificar`. O `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes do WebKit. Com o `ci.yml` no diff, o merge é do Victor.
- A medida local das partes que crescem e o `--list` final entram no relatório.

## 7. A ordem de construção

1. Rotas, tipos, moldes, páginas e stubs (feito, commit `3d1ec30`).
2. Redatores do QR e dos guias de arquivo (em curso); redatores do dinheiro em es quando o relatório das fontes do CFPB chegar.
3. Portões com idioma e testes de unidade (agente principal e um agente Opus).
4. Specs E2E (um agente Opus em worktree, `FO_PORT` próprio).
5. Integração de cada lote: leitura contra o glossário, `lint:texto`, cartões em `common.ts`, glossário.
6. Busca, 404, institucionais (Privacidade, Termos, Sobre de pt, es e en onde ficou falso), PENDENCIAS e casa e saúde (§ da decisão 10).
7. A divisão do CI, `--list`, medida das partes.
8. Lighthouse, screenshots, a revisão adversarial (5 lentes Sonnet, céticos, correções Opus, segunda passada), o relatório e a PR.
