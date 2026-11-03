# Ajuste "idiomas": relatório

Ficha: `docs/prompts/prompt-ajuste-idiomas.txt`. Plano: [`ajuste-idiomas-plano.md`](ajuste-idiomas-plano.md). Revisão: [`REVISAO-ajuste-idiomas.md`](REVISAO-ajuste-idiomas.md). PR: [vmatusita/fileorca#19](https://github.com/vmatusita/fileorca/pull/19), branch `ajuste-idiomas`.

## Resumo

- **40 páginas novas, todas indexáveis e com par no hreflang:**
  - o gerador de QR code em pt e em es;
  - em espanhol, as 9 calculadoras de dinheiro dos EUA que faltavam, os 4 presets e os 5 guias de dinheiro, no hub `/es/calculadoras-financieras/`;
  - os 10 guias de arquivo em pt e em es.
- **Os caminhos para elas:** a home, o rodapé, a busca, o 404, os hubs de imagem, de PDF e de dinheiro e as institucionais de pt e es levam às páginas novas.
- **Nenhuma conta e nenhuma medida mudou.** Cada página nova mostra os números da página em inglês, no formato do idioma. Os três oráculos, o Pix e o `guias:medir --check` dão zero diferença, e o `money-es.spec.ts` confere o ResultHero, a tabela, o CSV e o PDF das 18 páginas em es contra o inglês e as fixtures.
- **Os textos:** escritos por agentes Opus em sete lotes, lidos pelo agente principal contra o glossário e passados pelo `lint:texto` (0 erros de gramática). As páginas em inglês ficaram iguais, salvo duas frases do Sobre e dos Termos que ficaram falsas.
- **Casa e saúde** continuam só em inglês. A escolha do Victor para o gatilho de 31/jan/2027 está na § 319 e na linha "90 dias" do `PENDENCIAS.md`.
- **O CI passou de 15 para 20 partes:** o `verificar` em duas, o Chromium em 5 e o WebKit em 13 (§ 320). Com o `ci.yml` no diff, o merge é do Victor.
- **A revisão adversarial** (5 lentes, 20 céticos, 1 agente de correções e a segunda passada) não deixou crítico, alto nem médio aberto. Quatro baixos foram para o `PENDENCIAS.md`.

## As 40 páginas

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

## Os números iguais

### As calculadoras e os presets em es

O `money-es.spec.ts` (novo) abre as 18 páginas de dinheiro em es em 6 blocos de 3 e, para cada uma:

- confere que o ResultHero e as linhas da tabela aberta mostram os mesmos números da página em inglês (comparados como números, depois de ler o formato de cada idioma);
- baixa o CSV e o compara com a fixture do oráculo (`fixtures/calc/`), com o mapa de cada calculadora (cronograma linha a linha, saldos de fim de ano, o APY, a última linha dos juros simples);
- baixa o PDF e confere o tamanho Letter e os rótulos em espanhol.

Com o mapa do oráculo trocado de propósito, 5 dos 6 blocos reprovaram (a prova do mutante, § 318). No Vitest, o `calc-i18n.test.ts`, o `calc-report.test.ts` e o `calc-defs.test.ts` conferem as 18 páginas no Node (as chaves dos textos, o relatório e o CSV, sem espaço sem quebra).

### Os guias

- **Guias de arquivo:** nenhum algarismo à mão nos 30 textos (`guides-numbers.test.ts`, en, pt e es). Cada número sai do `data/guides-measured.json` pelo `fillValues` no formato do idioma, e o `guides-measured.test.ts` confere que as tabelas "O que medimos" de pt e es trazem os mesmos números do inglês.
- **Guias de dinheiro em es:** os números saem do `GUIDE_FACTS[id]('es')`, a mesma conta do inglês, e o `calc-guides.test.ts` compara os dois idiomas.

### Os `--check`

Rodados no fim, sobre o código final:

```
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc.py --check
igual: mortgage-calculator.json (296 casos)
igual: personal-loan-calculator.json (223 casos)
igual: auto-loan-calculator.json (199 casos)
igual: refinance-calculator.json (247 casos)
igual: home-affordability-calculator.json (212 casos)
igual: loan-amortization-calculator.json (153 casos)
igual: compound-interest-calculator.json (345 casos)
igual: credit-card-payoff-calculator.json (209 casos)
igual: debt-payoff-calculator.json (81 casos)
igual: rent-vs-buy-calculator.json (136 casos)
igual: mortgage-calculator-extra-payments.json (82 casos)
igual: mortgage-calculator-biweekly.json (78 casos)
igual: mortgage-calculator-15-vs-30-year.json (84 casos)
igual: loan-amortization-calculator-balloon-payment.json (103 casos)
igual: savings-goal-calculator.json (190 casos)
igual: debt-consolidation-calculator.json (71 casos)
igual: simple-interest-calculator.json (146 casos)
igual: apr-to-apy-calculator.json (184 casos)
(saída 0)
```

```
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py --check
igual: br-sac-price.json (212 casos)
igual: br-vehicle-loan.json (174 casos)
igual: br-personal-loan.json (139 casos)
igual: br-early-payoff.json (245 casos)
igual: br-credit-card.json (265 casos)
igual: br-debt-payoff.json (74 casos)
igual: br-compound-interest.json (173 casos)
igual: br-rent-or-buy.json (110 casos)
(saída 0)
```

```
$ uv run --no-project --python 3.13 python -I scripts/oracle/calc_home_health.py --check
igual: square-footage-calculator.json (154 casos)
igual: concrete-calculator.json (172 casos)
igual: mulch-calculator.json (264 casos)
igual: paint-calculator.json (209 casos)
igual: tile-calculator.json (245 casos)
igual: btu-calculator.json (452 casos)
igual: bmi-calculator.json (149 casos)
igual: calorie-calculator.json (134 casos)
igual: ovulation-calculator.json (139 casos)
igual: body-fat-calculator.json (187 casos)
igual: due-date-calculator.json (327 casos)
(saída 0)
```

```
$ uv run --no-project --python 3.13 python -I scripts/oracle/pix.py --check
fixtures/pix.json: 4 codes match the oracle (and the manual example)
(saída 0)
```

```
$ pnpm guias:medir --check
guides-heic-to-jpg-on-windows: 20 numbers in 20.2 s
guides-why-is-my-pdf-so-large: 130 numbers in 84.8 s
guides-social-media-image-sizes: 67 numbers in 42.4 s
guides-open-webp-save-as-jpg: 21 numbers in 5.5 s
guides-jpg-vs-png: 28 numbers in 20.8 s
guides-remove-location-from-photos: 95 numbers in 35.9 s
guides-pdf-to-jpg-resolution: 131 numbers in 79.5 s
guides-split-pdf-file-size: 65 numbers in 1.4 s
guides-combine-pdfs-on-phone: 18 numbers in 1.2 s
guides-photos-to-one-pdf: 20 numbers in 14.2 s
guias:medir --check: 0 difference(s) in 306.0 s
(saída 0)
```

## O QR lido de volta

O `qr-code.spec.ts` gera, em pt e em es, um código com um texto que tem "ação", "año", "ñandú" e emoji. Baixa o PNG e o SVG, com e sem a Oli, e lê cada um com o `jsqr`: o `binaryData` tem de ser igual aos bytes UTF-8 do texto. O teste de privacidade confere que nada sai do aparelho e que o evento leva o `lang` e não o texto. Confere também a caixa com `autocomplete`, `spellcheck` e `autocapitalize` desligados. Saída da rodada final, nos dois navegadores:

```
ok  88 [webkit] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › endereço curto: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (4.7s)
ok  89 [webkit] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › endereço longo: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (3.5s)
ok  90 [webkit] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › acento e emoji: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (3.4s)
ok  91 [webkit] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › o maior permitido: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (3.9s)
ok  92 [webkit] › tests\e2e\qr-code.spec.ts:169:5 › QR code generator › /pt/gerador-de-qr-code/: "ação", "año", "ñandú" and an emoji read back from the PNG and the SVG, with and without the Oli (2.7s)
ok  93 [webkit] › tests\e2e\qr-code.spec.ts:169:5 › QR code generator › /es/generador-de-codigo-qr/: "ação", "año", "ñandú" and an emoji read back from the PNG and the SVG, with and without the Oli (2.7s)
ok  94 [webkit] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › the text never leaves the device: no request, event, store, title, attribute or file name carries it (2.1s)
ok  95 [webkit] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › /pt/gerador-de-qr-code/: the text never leaves the device: no request, event, store, title, attribute or file name carries it (2.1s)
ok  96 [webkit] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › /es/generador-de-codigo-qr/: the text never leaves the device: no request, event, store, title, attribute or file name carries it (2.2s)
ok  97 [webkit] › tests\e2e\qr-code.spec.ts:267:3 › QR code generator › every choice group keeps its rail and its note inside the column at 320 px, in the three languages (1.0s)
ok  98 [webkit] › tests\e2e\qr-code.spec.ts:289:3 › QR code generator › an empty box and a text over the limit show the error, with no code and no download (1.3s)
ok 155 [chromium] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › endereço curto: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (2.0s)
ok 156 [chromium] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › endereço longo: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (1.4s)
ok 157 [chromium] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › acento e emoji: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (1.3s)
ok 158 [chromium] › tests\e2e\qr-code.spec.ts:136:5 › QR code generator › o maior permitido: the PNG and the SVG read back to the exact UTF-8, with and without the Oli (1.7s)
ok 159 [chromium] › tests\e2e\qr-code.spec.ts:169:5 › QR code generator › /pt/gerador-de-qr-code/: "ação", "año", "ñandú" and an emoji read back from the PNG and the SVG, with and without the Oli (1.1s)
ok 160 [chromium] › tests\e2e\qr-code.spec.ts:169:5 › QR code generator › /es/generador-de-codigo-qr/: "ação", "año", "ñandú" and an emoji read back from the PNG and the SVG, with and without the Oli (1.1s)
ok 161 [chromium] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › the text never leaves the device: no request, event, store, title, attribute or file name carries it (672ms)
ok 162 [chromium] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › /pt/gerador-de-qr-code/: the text never leaves the device: no request, event, store, title, attribute or file name carries it (632ms)
ok 163 [chromium] › tests\e2e\qr-code.spec.ts:202:5 › QR code generator › /es/generador-de-codigo-qr/: the text never leaves the device: no request, event, store, title, attribute or file name carries it (742ms)
ok 164 [chromium] › tests\e2e\qr-code.spec.ts:267:3 › QR code generator › every choice group keeps its rail and its note inside the column at 320 px, in the three languages (457ms)
ok 165 [chromium] › tests\e2e\qr-code.spec.ts:289:3 › QR code generator › an empty box and a text over the limit show the error, with no code and no download (598ms)
```

## O orçamento por tipo de página

Medido pelo `i18n-budgets.spec.ts` na rodada final. "JS inicial" é o gzip dos arquivos que a página pede ao carregar, mais os scripts inline. Cada página nova carrega os mesmos arquivos JS da equivalente em inglês (`SAME_FILES`), sem worker e sem `.wasm` antes do primeiro arquivo.

| Tipo | Página em inglês | Chromium | Páginas novas | Chromium | WebKit |
| --- | --- | --- | --- | --- | --- |
| QR code | `/qr-code-generator/` | 32,2 KB, 2 JS, 6 req. | `/pt/gerador-de-qr-code/` | 32,3 KB, 2 JS, 6 req. | 32,3 KB, 2 JS, 7 req. |
|  |  |  | `/es/generador-de-codigo-qr/` | 32,3 KB, 2 JS, 6 req. | 32,3 KB, 2 JS, 7 req. |
| Calculadora em es | `/auto-loan-calculator/` | 51,6 KB, 2 JS, 6 req. | `/es/calculadora-de-prestamo-para-auto/` | 51,6 KB, 2 JS, 6 req. | 51,6 KB, 2 JS, 7 req. |
| Calculadora em es (rótulos longos) | `/rent-vs-buy-calculator/` | 51,6 KB, 2 JS, 6 req. | `/es/calculadora-de-alquilar-o-comprar/` | 51,6 KB, 2 JS, 6 req. | 51,6 KB, 2 JS, 7 req. |
| Preset em es | `/mortgage-calculator/15-vs-30-year/` | 51,6 KB, 2 JS, 6 req. | `/es/calculadora-de-hipoteca/15-o-30-anos/` | 51,6 KB, 2 JS, 6 req. | 51,6 KB, 2 JS, 7 req. |
| Guia de dinheiro em es | `/guides/extra-mortgage-payments/` | 51,6 KB, 2 JS, 6 req. | `/es/guias/pagos-adicionales-a-la-hipoteca/` | 51,6 KB, 2 JS, 6 req. | 51,6 KB, 2 JS, 7 req. |
| Hub de dinheiro em es | `/money-calculators/` | 3,9 KB, 0 JS, 4 req. | `/es/calculadoras-financieras/` | 4,0 KB, 0 JS, 4 req. | 4,0 KB, 0 JS, 5 req. |
| Guia de arquivo, imagem | `/guides/jpg-vs-png/` | 22,0 KB, 2 JS, 6 req. | `/pt/guias/jpg-ou-png/` | 22,0 KB, 2 JS, 6 req. | 22,0 KB, 2 JS, 7 req. |
|  |  |  | `/es/guias/jpg-o-png/` | 22,0 KB, 2 JS, 6 req. | 22,0 KB, 2 JS, 7 req. |
| Guia de arquivo, PDF | `/guides/why-is-my-pdf-so-large/` | 38,3 KB, 2 JS, 6 req. | `/pt/guias/por-que-meu-pdf-esta-tao-grande/` | 38,4 KB, 2 JS, 6 req. | 38,4 KB, 2 JS, 7 req. |
|  |  |  | `/es/guias/por-que-mi-pdf-pesa-tanto/` | 38,4 KB, 2 JS, 6 req. | 38,4 KB, 2 JS, 7 req. |

- **O limite** é de 80 KB gzip de JS inicial e 8 requisições do próprio domínio na primeira página (`tests/e2e/lib/budgets.ts`, sem mudança). A pior página nova, uma calculadora em es, fica em 51,6 KB, igual à equivalente em inglês.
- **A diferença** entre uma página nova e a em inglês é de no máximo 0,1 KB: o texto das props da ilha no idioma.
- **No WebKit** há uma requisição a mais em toda página, a do ícone, também nas páginas em inglês.
- **As 40 páginas novas** passam pelo `i18n-budgets.spec.ts` nos dois navegadores (219 testes por navegador, contra 139 na `main`).

## O Lighthouse

Celular, mediana de 3 execuções, sobre o `dist/` do `5108604` (o código do `5786474`, com a revisão e os screenshots). Os limiares não mudaram: desempenho ≥ 0,9 e CLS ≤ 0,05 reprovam, o resto avisa.

**As 10 URLs do `lighthouserc.json`** (a parte `lighthouse` da rodada final; a lista não mudou):

| URL | Execuções | Desempenho | Acessibilidade | Boas práticas | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/compress-image/` | 3 | 100 | 100 | 100 | 100 | 1,28 s | 1,65 s | 0 ms | 0,000 |
| `/compress-pdf/` | 3 | 99 | 100 | 100 | 100 | 1,35 s | 1,82 s | 0 ms | 0,000 |
| `/guides/15-vs-30-year-mortgage/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,000 |
| `/guides/why-is-my-pdf-so-large/` | 3 | 99 | 100 | 100 | 100 | 1,36 s | 1,82 s | 0 ms | 0,000 |
| `/image-tools/` | 3 | 100 | 100 | 100 | 100 | 1,06 s | 1,36 s | 0 ms | 0,000 |
| `/mortgage-calculator/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,001 |
| `/pdf-tools/` | 3 | 100 | 100 | 100 | 100 | 1,05 s | 1,35 s | 0 ms | 0,000 |
| `/pt/apoie/` | 3 | 100 | 100 | 100 | 100 | 1,05 s | 1,50 s | 0 ms | 0,000 |
| `/pt/simulador-sac-price/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,001 |
| `/qr-code-generator/` | 3 | 100 | 100 | 100 | 100 | 1,13 s | 1,50 s | 0 ms | 0,000 |

**Dez páginas novas,** medidas à parte com uma cópia da configuração em `.cache/`, só com outra lista de URLs, sem mexer no `lighthouserc.json`:

| URL | Execuções | Desempenho | Acessibilidade | Boas práticas | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/es/calculadora-de-alquilar-o-comprar/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,000 |
| `/es/calculadora-de-consolidacion-de-deudas/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,000 |
| `/es/calculadora-de-cuanta-casa-puedo-pagar/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,001 |
| `/es/calculadora-de-hipoteca/15-o-30-anos/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,95 s | 0 ms | 0,007 |
| `/es/calculadoras-financieras/` | 3 | 100 | 100 | 100 | 100 | 1,05 s | 1,35 s | 0 ms | 0,000 |
| `/es/generador-de-codigo-qr/` | 3 | 99 | 100 | 100 | 100 | 1,36 s | 1,74 s | 0 ms | 0,000 |
| `/es/guias/pagos-adicionales-a-la-hipoteca/` | 3 | 99 | 100 | 100 | 100 | 1,50 s | 1,96 s | 0 ms | 0,000 |
| `/es/guias/por-que-mi-pdf-pesa-tanto/` | 3 | 99 | 100 | 100 | 100 | 1,35 s | 1,80 s | 0 ms | 0,000 |
| `/pt/gerador-de-qr-code/` | 3 | 100 | 100 | 100 | 100 | 1,28 s | 1,65 s | 0 ms | 0,000 |
| `/pt/guias/jpg-ou-png/` | 3 | 99 | 100 | 100 | 100 | 1,36 s | 1,67 s | 0 ms | 0,000 |

Nenhuma asserção falhou nas duas medidas. A consolidación de deudas em es, com CLS 0,051 no `layout-shift.spec.ts` (a Figtree solta depois da primeira pintura, pendência "Idiomas E-2"), deu 0,000 no Lighthouse, que carrega a fonte antes da primeira pintura.

## O CI

20 partes, cada uma com o limite de 900 s e o alvo de 700 s (§ 320):

- o `verificar` em duas, numa matriz: `portões` (`--sem-playwright --sem-lighthouse`) e `lighthouse` (`--lighthouse`);
- o Chromium em 5 partes;
- o WebKit em 13 partes.

O total é o do resumo do `verificar` em cada log.

| Parte | F8, `c999692`, [41548317129](https://github.com/vmatusita/fileorca/actions/runs/41548317129) | `757f716`, [41571847874](https://github.com/vmatusita/fileorca/actions/runs/41571847874) | `5786474`, [41584397815](https://github.com/vmatusita/fileorca/actions/runs/41584397815) | Local, `5108604` |
| --- | ---: | ---: | ---: | ---: |
| verificar (F8: uma parte) | 674,8 s | — | — | — |
| verificar (portões) | — | 271,1 s | 349,4 s | 189,9 s |
| verificar (lighthouse) | — | 391,0 s | 419,7 s | 386,7 s |
| chromium 1 (F8: de 4; agora de 5) | 561,6 s | 546,7 s | 564,7 s | 110,7 s |
| chromium 2 (F8: de 4; agora de 5) | 394,4 s | 515,2 s | 514,4 s | 118,8 s |
| chromium 3 (F8: de 4; agora de 5) | 465,2 s | 294,4 s | 303,9 s | 102,6 s |
| chromium 4 (F8: de 4; agora de 5) | 436,5 s | 360,5 s | 493,9 s | 120,2 s |
| chromium 5 (F8: de 4; agora de 5) | — | 493,9 s | 602,1 s | 112,2 s |
| webkit 1 (F8: de 10; agora de 13) | 454,1 s | 412,1 s | 459,9 s | 74,9 s |
| webkit 2 (F8: de 10; agora de 13) | 561,4 s | 440,8 s | 294,4 s | 76,1 s |
| webkit 3 (F8: de 10; agora de 13) | 446,7 s | 427,3 s | 469,9 s | 83,3 s |
| webkit 4 (F8: de 10; agora de 13) | 375,2 s | 230,8 s | 283,3 s | 85,6 s |
| webkit 5 (F8: de 10; agora de 13) | 305,5 s | 380,2 s | 466,0 s | 92,0 s |
| webkit 6 (F8: de 10; agora de 13) | 215,4 s | 277,0 s | 265,3 s | 81,1 s |
| webkit 7 (F8: de 10; agora de 13) | 522,2 s | 247,0 s | 195,6 s | 62,9 s |
| webkit 8 (F8: de 10; agora de 13) | 275,4 s | 190,6 s | 189,1 s | 72,2 s |
| webkit 9 (F8: de 10; agora de 13) | 663,3 s | 337,5 s | 350,8 s | 92,9 s |
| webkit 10 (F8: de 10; agora de 13) | 376,7 s | 414,3 s | 274,9 s | 80,5 s |
| webkit 11 (F8: de 10; agora de 13) | — | 405,8 s | 433,3 s | 86,6 s |
| webkit 12 (F8: de 10; agora de 13) | — | 445,7 s, falhou | 589,7 s | 103,0 s |
| webkit 13 (F8: de 10; agora de 13) | — | 348,8 s | 285,8 s | 81,3 s |
| **Soma das partes** | **6728,4 s** | **7430,7 s** | **7806,1 s** | **2213,5 s** |
| **Maior parte** | **674,8 s** | **546,7 s** | **602,1 s** | **386,7 s** |

- **A última execução verde com código ou teste** é a [41584397815](https://github.com/vmatusita/fileorca/actions/runs/41584397815), no `5786474`, com as 20 partes verdes. O job `merge` disse "sem merge - PR em rascunho"; o `alerta-dependabot` e o `pos-deploy` foram pulados, como devem.
- **Todas as partes ficaram abaixo do alvo de 700 s.** A maior foi a parte 5 do Chromium, com 602,1 s; no WebKit, a parte 12, com 589,7 s. A soma das partes cresceu 16 % sobre a F8 (de 6.728 s a 7.806 s), com 221 testes a mais por navegador (de 1.207 a 1.428).
- **O `verificar` em duas partes:** os portões levaram 349,4 s (o Vitest 161,6 s e o `lint:texto` 70,6 s, a diff desta PR inteira) e o Lighthouse 419,7 s. Juntos, na F8, eram 674,8 s.
- **O tempo do job** passa do total por causa da instalação, até 671 s na parte 5 do Chromium (o limite de 900 s vale para o `verificar`, § 108).

**Onde o `--list` pôs os testes** (os specs que mudaram de tamanho, e o `design` e a matriz de imagens, que nunca podem cair na mesma parte do WebKit, § 142). Na branch são 1428 testes no Chromium (286, 286, 286, 285, 285 por parte) e 1428 no WebKit (110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 109, 109); na `main`, 1207 e 1207.

| Spec | Chromium: main → branch | Partes do Chromium | WebKit: main → branch | Partes do WebKit |
| --- | ---: | --- | ---: | --- |
| `a11y.spec.ts` | 216 → 258 | 1 (258) | 216 → 258 | 1 (110), 2 (110), 3 (38) |
| `ads.spec.ts` | 146 → 188 | 1 (28), 2 (160) | 146 → 188 | 3 (72), 4 (110), 5 (6) |
| `calc-form.spec.ts` | 11 → 13 | 3 (13) | 11 → 13 | 6 (13) |
| `design.spec.ts` | 53 → 54 | 3 (54) | 53 → 54 | 6 (16), 7 (38) |
| `i18n-budgets.spec.ts` | 139 → 219 | 3 (136), 4 (83) | 139 → 219 | 7 (48), 8 (110), 9 (61) |
| `image-matrix.spec.ts` | 18 → 18 | 4 (18) | 18 → 18 | 9 (18) |
| `layout-shift.spec.ts` | 8 → 10 | 4 (10) | 8 → 10 | 10 (10) |
| `money-calc.spec.ts` | 38 → 42 | 4 (42) | 38 → 42 | 10 (42) |
| `money-es.spec.ts` | 0 → 6 | 4 (6) | 0 → 6 | 10 (6) |
| `money-privacy.spec.ts` | 32 → 45 | 4 (28), 5 (17) | 32 → 45 | 11 (45) |
| `navigation.spec.ts` | 14 → 18 | 5 (18) | 14 → 18 | 11 (18) |
| `qr-code.spec.ts` | 6 → 11 | 5 (11) | 6 → 11 | 12 (11) |
| `tool-guides.spec.ts` | 21 → 41 | 5 (41) | 21 → 41 | 13 (41) |

- O `design.spec.ts` fica nas partes 6 e 7 do WebKit, e o `image-matrix.spec.ts` na 9, com o `i18n-budgets` entre eles.
- O `a11y.spec.ts` segue dominando a parte 1 do Chromium (258 testes), que foi a 564,7 s.

**Quantas execuções a run gastou:**

- **Duas até aqui, as duas com código:**
  - a [41571847874](https://github.com/vmatusita/fileorca/actions/runs/41571847874), no `757f716`, com 19 partes verdes e a 12 do WebKit vermelha pela corrida de foco do Reorder (§ 322);
  - a [41584397815](https://github.com/vmatusita/fileorca/actions/runs/41584397815), no `5786474`, verde, com a correção da corrida e as da revisão juntas.
- **As próximas:** o push só de documentação (a revisão, os screenshots, este relatório e o CLAUDE.md) e o `gh pr ready` disparam mais uma ou duas, porque o CI roda no `synchronize` e no `ready_for_review` e cancela a anterior (`cancel-in-progress`). A resposta final da run diz o estado delas.
- **O custo:** cada execução completa tem 20 jobs, uns 170 minutos cobrados.

## A revisão

Tudo em [`REVISAO-ajuste-idiomas.md`](REVISAO-ajuste-idiomas.md). Cinco lentes Sonnet sobre o `757f716`: (a) o português, (b) o espanhol, (c) números e formato, (d) SEO e idiomas, (e) anúncio, acessibilidade e orçamento.

| Lente | Médio | Baixo | Depois dos céticos: baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) o português | 4 | 8 | 4 | 8 |
| (b) o espanhol | 6 | 7 | 5 | 8 |
| (c) números e formato | 3 | 4 | 4 | 3 |
| (d) SEO e idiomas | 1 | 6 | 4 | 3 |
| (e) anúncio, acessibilidade e orçamento | 1 | 3 | 3 | 1 |
| **Total** | **15** | **28** | **20** | **23** |

- **Nenhum crítico nem alto nas lentes.** Os céticos baixaram os 15 médios para baixo ou os refutaram. Os 20 baixos são 17 defeitos: três foram vistos por duas lentes.
- **O agente de correções (Opus)** corrigiu 19, cada correção de comportamento com um teste que reprova sem ela. São 8 commits, do `185eb96` ao `67a2d65`. O E-2 (o pulo de 30 px das calculadoras em es na primeira visita) ficou como pendência.
- **A segunda passada** achou um médio, o R2-01: o lead novo da Alquilar o comprar gastava a folga dos 740 px na primeira visita. Achou também sete baixos. O R2-01, o R2-02 e o R2-08 foram corrigidos (`5786474`); o R2-03, o R2-04 e o R2-05 viraram pendências; o R2-06 e o R2-07 ficam registrados.
- **Pendências novas** (`docs/PENDENCIAS.md`): "Idiomas E-2", "Idiomas R2-03", "Idiomas R2-04" e "Idiomas R2-05", mais a "Idiomas g-1" do glossário (§ 317).

## `pnpm verificar` local

O `pnpm verificar` inteiro passa de 900 s nesta máquina (§ 242). Como a ficha manda, rodei as 20 partes do CI em sequência, depois de uma instalação limpa, no `5108604`: o código final (`5786474`) com a revisão e os screenshots, que só acrescentam documentação.

```
$ CI=true pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 552ms using pnpm v10.34.9
(saída 0; o pnpm-lock.yaml não mudou)
```

As 20 partes, cada uma com `pnpm verificar <opções da parte>` (`.cache/run-parts.mjs`), todas com saída 0:

```
Resumo do pnpm verificar (sem o Playwright e sem o Lighthouse)
  ok      10.9 s  tipos (astro check)
  ok       4.4 s  lint (eslint)
  ok      34.2 s  build (astro build do zero)
  ok      34.3 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.9 s  seo (hreflang, sitemaps, canonical, robots)
  ok       1.0 s  links internos e páginas órfãs
  ok       1.5 s  conteúdo mínimo das ferramentas e do site
  ok      70.0 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.6 s  design (sprite, fontes, tema, movimento, setas)
  ok       8.2 s  licenças
  ok       0.6 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok      21.1 s  lint:texto (LanguageTool)
  total 189.9 s (limite 900 s)

Resumo do pnpm verificar (Lighthouse)
  ok      32.6 s  build (astro build do zero)
  ok     354.0 s  lighthouse ci
  total 386.7 s (limite 900 s)

Resumo do pnpm verificar (Playwright no chromium, parte 1 de 5)
  ok      32.6 s  build (astro build do zero)
  ok      78.0 s  playwright (chromium, parte 1 de 5, axe, anúncios, orçamentos)
  total 110.7 s (limite 900 s)
  (286 testes passaram)

Resumo do pnpm verificar (Playwright no chromium, parte 2 de 5)
  ok      32.7 s  build (astro build do zero)
  ok      86.1 s  playwright (chromium, parte 2 de 5, axe, anúncios, orçamentos)
  total 118.8 s (limite 900 s)
  (286 testes passaram)

Resumo do pnpm verificar (Playwright no chromium, parte 3 de 5)
  ok      32.9 s  build (astro build do zero)
  ok      69.6 s  playwright (chromium, parte 3 de 5, axe, anúncios, orçamentos)
  total 102.6 s (limite 900 s)
  (286 testes passaram)

Resumo do pnpm verificar (Playwright no chromium, parte 4 de 5)
  ok      32.9 s  build (astro build do zero)
  ok      87.2 s  playwright (chromium, parte 4 de 5, axe, anúncios, orçamentos)
  total 120.2 s (limite 900 s)
  (285 testes passaram)

Resumo do pnpm verificar (Playwright no chromium, parte 5 de 5)
  ok      32.9 s  build (astro build do zero)
  ok      79.3 s  playwright (chromium, parte 5 de 5, axe, anúncios, orçamentos)
  total 112.2 s (limite 900 s)
  (285 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 1 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      42.2 s  playwright (webkit, parte 1 de 13, axe, anúncios, orçamentos)
  total 74.9 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 2 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      43.4 s  playwright (webkit, parte 2 de 13, axe, anúncios, orçamentos)
  total 76.1 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 3 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      50.6 s  playwright (webkit, parte 3 de 13, axe, anúncios, orçamentos)
  total 83.3 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 4 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      53.0 s  playwright (webkit, parte 4 de 13, axe, anúncios, orçamentos)
  total 85.6 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 5 de 13)
  ok      32.8 s  build (astro build do zero)
  ok      59.1 s  playwright (webkit, parte 5 de 13, axe, anúncios, orçamentos)
  total 92.0 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 6 de 13)
  ok      32.7 s  build (astro build do zero)
  ok      48.3 s  playwright (webkit, parte 6 de 13, axe, anúncios, orçamentos)
  total 81.1 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 7 de 13)
  ok      32.7 s  build (astro build do zero)
  ok      30.2 s  playwright (webkit, parte 7 de 13, axe, anúncios, orçamentos)
  total 62.9 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 8 de 13)
  ok      32.8 s  build (astro build do zero)
  ok      39.3 s  playwright (webkit, parte 8 de 13, axe, anúncios, orçamentos)
  total 72.2 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 9 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      60.3 s  playwright (webkit, parte 9 de 13, axe, anúncios, orçamentos)
  total 92.9 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 10 de 13)
  ok      32.7 s  build (astro build do zero)
  ok      47.7 s  playwright (webkit, parte 10 de 13, axe, anúncios, orçamentos)
  total 80.5 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 11 de 13)
  ok      32.8 s  build (astro build do zero)
  ok      53.6 s  playwright (webkit, parte 11 de 13, axe, anúncios, orçamentos)
  total 86.6 s (limite 900 s)
  (110 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 12 de 13)
  ok      32.6 s  build (astro build do zero)
  ok      70.3 s  playwright (webkit, parte 12 de 13, axe, anúncios, orçamentos)
  total 103.0 s (limite 900 s)
  (109 testes passaram)

Resumo do pnpm verificar (Playwright no webkit, parte 13 de 13)
  ok      32.5 s  build (astro build do zero)
  ok      48.8 s  playwright (webkit, parte 13 de 13, axe, anúncios, orçamentos)
  total 81.3 s (limite 900 s)
  (109 testes passaram)
```

- **A soma:** 2.213,5 s de `verificar`.
- **O Vitest:** 93 arquivos e 1.597 testes.
- **O `lint:texto`:** 63 arquivos, 3.865 textos, 0 erros de gramática e 1.178 avisos (ortografia e estilo, que não reprovam).
- **Os portões:**
  - o `gate:seo` com 199 páginas indexáveis e hreflang recíproco;
  - o `gate:links` sem órfãs;
  - o `gate:dinheiro-saude` com 70 de 70 páginas;
  - o `gate:prontidao` com os 21 itens.
- **O Playwright:** 1428 testes no Chromium e 1428 no WebKit, sem `skip`, sem `retries` e sem teste instável.

## A prévia

[https://ajuste-idiomas-fileorca.vmatusita.workers.dev](https://ajuste-idiomas-fileorca.vmatusita.workers.dev). O `build.txt` da prévia confere: `5786474f151fa23cfc6e839d761876b79d6fac3e`, o código final. A prévia responde com `x-robots-tag: noindex`, como toda prévia em `workers.dev`.

No `757f716`, no navegador:

- **`/pt/gerador-de-qr-code/`:** `lang="pt-BR"`, o selo, a contagem "16 de 1.273" para "Ação na praça", o hreflang (en, pt-BR, es e x-default) e a coluna "Utilidades" do rodapé.
- **`/es/calculadora-de-prestamo-para-auto/`:** o ResultHero com $488.93, $24,400, 7.5 %, $4,935 e $39,335, iguais aos da página em inglês, a data de revisão "3 de noviembre de 2026" e as fontes da FTC e do CFPB.
- **`/es/guias/jpg-o-png/`:** as tabelas com 4.4 MB e 43.2 dB e a nota da medida em espanhol.

No `5786474`, o que a revisão mudou, pelo HTML servido:

- **`/es/calculadora-de-alquilar-o-comprar/`:** o título "cuándo comprar alcanza a alquilar" e o lead novo.
- **`/es/generador-de-codigo-qr/`:** "Chico", e o link da FAQ para `fileorca.com/es/`.
- **`/es/guias/resolucion-de-pdf-a-jpg/`:** só "ppp" (72, 150 e 300 ppp) e nenhum "ppi".
- **`/pt/guias/heic-para-jpg-no-windows/`:** a coluna "Variação".
- **`/es/calculadora-de-hipoteca/15-o-30-anos/`:** "Tasa a 15" e "Tasa a 30".
- **`/es/calculadora-de-interes-simple/`:** a forma singular "año" nas props da ilha.
- **`/es/guias/jpg-o-png/`:** status 200.

## O inglês, casa e saúde e o que a ficha deixou de fora

- **As páginas em inglês:** comparei o texto visível (título, `<main>`, rodapé e `data-props`) das 83 páginas em inglês do `dist/` da `main` (`1c2cb0e`) com o do código final (`.cache/compare-en.mjs`). 80 são iguais. As três que mudam:
  - o **Sobre** e os **Termos**, nas frases que ficaram falsas, e a data dos Termos;
  - o **QR em inglês**, só no `data-props`, pela chave nova `file` (o nome dos arquivos baixados, que em inglês continua `qr-code`).
- **Casa e saúde:** `git diff --stat origin/main` nas 22 pastas das 11 calculadoras (`src/tools/<id>/` e `src/pages/<id>/`) e no `src/i18n/life-hubs.ts` sai vazio.
- **O que a ficha proíbe:** o mesmo `git diff` sai vazio também em `src/calc/`, `src/engine/`, `scripts/oracle/`, `fixtures/`, `data/guides-measured.json`, `package.json`, `pnpm-lock.yaml`, `docs/design/`, `PLANO-FILEORCA.md`, `docs/adr/`, `.githooks/`, `.claude/settings.json` e `scripts/ci/`. Do `.github/`, só o `ci.yml` muda (55 linhas a mais, 31 a menos: a matriz das partes e os comentários dela).
- **O comentário do topo do `ci.yml`** ainda diz "Chromium in four shards and WebKit in ten". Não mexi: a ficha só deixa mudar a matriz. Fica para quem mexer no `ci.yml` depois.

## Decisões novas

Do § 308 ao § 322 do `DECISOES.md`:

- § 308: o escopo e a ordem;
- § 309: os caminhos e os nomes de arquivo em pt e es;
- § 310: o QR em pt e es (os nomes dos arquivos, o texto e o exemplo da FAQ);
- § 311: o bloco `es` obrigatório no registro do dinheiro, sem o `ES_CALC_IDS`;
- § 312: as datas de revisão e de publicação (3/nov/2026);
- § 313: as palavras dos guias de dinheiro em es;
- § 314: o formato dos guias de arquivo e o gênero das contagens;
- § 315: a regra dos números por idioma;
- § 316: os lotes de texto;
- § 317: o glossário;
- § 318: os portões e os testes com idioma;
- § 319: casa e saúde, a escolha do Victor para o gatilho;
- § 320: o CI em 20 partes;
- § 321: as correções da revisão e da segunda passada;
- § 322: a corrida de foco do Reorder no WebKit do CI.

## O que a válvula cortou

Nada. As 40 páginas, os testes que a decisão 8 pede e as partes do CI entraram inteiros.

## Commits e agentes

- **Os commits:** a branch tem 76 commits sobre a `main`. Todos os que não são merge levam o `Co-Authored-By: Claude Opus 5.5`.
- **Os merges:** os 21 commits de merge saíram sem o trailer. São 10 do agente principal (a branch de cada agente entrando na `ajuste-idiomas`) e 11 dos agentes em worktree (a branch da run entrando na worktree deles). Nada foi reescrito, porque o `--amend` e o rebase são proibidos.
- **Os agentes de texto e de código** foram todos Opus. Os Sonnet só leram: a exploração, as lentes, os céticos e a segunda passada.
- **As worktrees desta run foram removidas com `git worktree remove`:**
  - as 11 dos agentes, cujas branches `worktree-*` foram apagadas com `git branch -d` (todas já estavam na `ajuste-idiomas`);
  - a da revisão;
  - a `idiomas-main-ref`, a `main` de referência das comparações.

  As pastas com `node_modules` que o Windows deixa e as worktrees de runs antigas ficam na pendência "Worktrees".

## O que é do Victor, em passos

1. **O merge.** Esta PR muda o `.github/workflows/ci.yml` (só a matriz das partes), então a regra de merge automático não se aplica.
   - Conferir o diff: `git diff origin/main...ajuste-idiomas -- .github/`.
   - Dar o merge pela página da PR (squash, apagando a branch).
   - Depois do merge, cada execução do CI passa a ter 20 jobs, uns 170 minutos cobrados (`docs/OPERACAO.md`).
2. **A produção.** Conferir o pós-deploy e o `build.txt` (o commit do merge).
3. **O português no ar.** Ler os 10 guias e o QR em pt, como pede a decisão fechada "Revisão humana" do plano. O que precisar de ajuste vira uma run curta.
4. **No celular:**
   - gerar um QR em pt com acento ("Ação na praça") e ler com a câmera;
   - abrir uma calculadora e um guia em es, por exemplo `/es/calculadora-de-alquilar-o-comprar/` e `/es/guias/pagos-adicionales-a-la-hipoteca/`.
5. **O Search Console:** se quiser acelerar, pedir a indexação dos hubs de pt e es (`/pt/ferramentas-de-imagem/`, `/pt/ferramentas-pdf/`, `/es/herramientas-de-imagen/`, `/es/herramientas-pdf/` e `/es/calculadoras-financieras/`).
6. **31/jan/2027:** o gatilho de casa e saúde, pela § 273 e pela § 319: casa só em es; saúde em pt e es, com o sistema métrico como padrão em pt.
