# F7 · Relatório (casa, saúde e QR code, em inglês)

## Resumo

- **Seis calculadoras de casa** (Square footage, Concrete, Mulch and gravel, Paint, Tile e BTU) e **cinco de saúde** (BMI, Calorie, Ovulation, Body fat e Due date), em inglês, com os hubs `/home-calculators/` e `/health-calculators/`. Cada uma recalcula enquanto a pessoa digita, exporta PDF e CSV e bate com um oráculo independente (`scripts/oracle/calc_home_health.py`, só a biblioteca padrão do Python), commitado antes de qualquer motor: 2.432 casos, e o mutante reprova.
- **O gerador de QR code** (`/qr-code-generator/`) monta o QR do texto da pessoa no navegador, com a Oli no meio, em PNG e SVG. O `jsqr` lê de volta os bytes UTF-8 exatos de um endereço curto, de um longo, de acento com emoji e do maior texto permitido (1.273 bytes), com e sem a Oli, no Node e nos dois navegadores. O `qrcode` passou para `dependencies`, e a página carrega 2 arquivos JS.
- **Home, rodapé, busca e 404 em inglês** levam às 14 páginas novas. A Privacidade e os Termos mudaram nos três idiomas. A /licenses credita o `qrcode` e o `dijkstrajs`.
- **O CI tem 13 partes** (o `verificar`, o Chromium em 4 e o WebKit em 8), todas verdes na [run 41465872919](https://github.com/vmatusita/fileorca/actions/runs/41465872919), a do código final. As partes 2 e 7 do WebKit passaram do alvo de 700 s uma vez cada (833 s e 730 s), sempre abaixo do limite de 900 s. A medida e a proposta estão na § 283.
- **A revisão adversarial** (7 lentes e 32 céticos) achou 1 alto e 16 médios, e nenhum crítico.
  - O alto e 15 médios foram corrigidos, cada um com teste e § (§ 274 a § 281).
  - O médio que sobrou, o CLS do breadcrumb de 320 a 390 px, não tem correção local e ficou como pendência.
  - A segunda passada achou 2 baixos nas correções, também corrigidos (§ 282).
- **O teste de 90 dias** de casa e saúde vai de 2 de novembro de 2026 a 31 de janeiro de 2027 (§ 273).
- **A válvula não cortou nada.** Nada foi enviado nem publicado.

## As páginas

As 14 páginas novas, só em inglês, lidas do registro (`LIFE_CALC_PAGES`, `LIFE_HUB_IDS` e `QR_ID`). O H1 vem da página servida do `dist/` final. O JS inicial (gzip, com os scripts inline) e as requisições foram medidos no Chromium a 360 px, com o Google bloqueado (`.cache/medidas-f7/pages.ts`). "2 + 6" quer dizer 2 arquivos JS e 6 requisições.

| Id | Caminho | Hub | H1 | JS inicial | Arquivos JS + requisições |
| --- | --- | --- | --- | ---: | --- |
| `square-footage-calculator` | `/square-footage-calculator/` | casa | Square footage calculator | 51,2 KB | 2 + 6 |
| `concrete-calculator` | `/concrete-calculator/` | casa | Concrete calculator | 51,2 KB | 2 + 6 |
| `mulch-calculator` | `/mulch-calculator/` | casa | Mulch and gravel calculator | 51,2 KB | 2 + 6 |
| `paint-calculator` | `/paint-calculator/` | casa | Paint calculator | 51,2 KB | 2 + 6 |
| `tile-calculator` | `/tile-calculator/` | casa | Tile calculator | 51,2 KB | 2 + 6 |
| `btu-calculator` | `/btu-calculator/` | casa | BTU calculator | 51,2 KB | 2 + 6 |
| `bmi-calculator` | `/bmi-calculator/` | saúde | BMI calculator | 51,2 KB | 2 + 6 |
| `calorie-calculator` | `/calorie-calculator/` | saúde | Calorie calculator | 51,2 KB | 2 + 6 |
| `ovulation-calculator` | `/ovulation-calculator/` | saúde | Ovulation calculator | 51,2 KB | 2 + 6 |
| `body-fat-calculator` | `/body-fat-calculator/` | saúde | Body fat calculator | 51,2 KB | 2 + 6 |
| `due-date-calculator` | `/due-date-calculator/` | saúde | Due date calculator | 51,2 KB | 2 + 6 |
| `home-calculators` | `/home-calculators/` | — | Calculators for home projects | 3,8 KB | 0 + 4 |
| `health-calculators` | `/health-calculators/` | — | Calculators for adult health numbers | 3,8 KB | 0 + 4 |
| `qr-code-generator` | `/qr-code-generator/` | — | QR code generator | 31,7 KB | 2 + 6 |

Toda página nova entra no `sitemap-en.xml`, sem `hreflang` (não há par em pt nem em es), e nenhuma página de pt ou es liga para elas (`navigation.spec.ts`).

## Os oráculos vieram antes dos motores e do gerador

```
$ git log --reverse --format='%h %ad %s' --date=format:'%d/%m %H:%M' origin/main..HEAD -- fixtures/calc/<as 11>.json scripts/oracle/calc_home_health.py src/calc/home.ts src/calc/health.ts src/calc/dates.ts
639e934 02/11 08:10 test(oracle): add home and health calculator oracle and fixtures
c947503 02/11 08:15 feat(calc): add home and health engines matched to the F7 oracle
cf3a532 02/11 08:36 feat(calc): add the home and health calculators, hubs and wiring
6955512 02/11 08:39 test(oracle): one-area page example for square footage
23f7325 02/11 09:01 test(oracle): add the clock cases of the due date and ovulation specs

$ git log --reverse --format='%h %ad %s' --date=format:'%d/%m %H:%M' origin/main..HEAD -- src/tools/qr-code-generator/qr.ts tests/unit/qr.test.ts src/platform/qrcode-esm.ts
8aced5c 02/11 09:10 feat(qr): add the QR matrix and drawing with a jsQR read-back test
8fd4998 02/11 09:22 fix(qr): bundle the qrcode core as ES modules so the page loads two JS files
ce348ee 02/11 09:26 fix(qr): type the ES module plugin without vite types; add the F7 section to CLAUDE.md
```

- **O oráculo e as 11 fixtures** (`639e934`) entraram antes dos motores (`c947503`).
- **Os commits depois deles não mudam o motor:**
  - o `cf3a532` só troca um tipo no `health.ts` (o `heightTenthsIn` recebe só pés e polegadas), sem mudar conta;
  - o `6955512` muda o exemplo da página da Square footage para uma área só, primeiro no oráculo (§ 268), e o exemplo de duas áreas fica como caso da grade;
  - o `23f7325` acrescenta casos novos do oráculo, os do relógio do Due date e da Ovulation (virada de ano, ano bissexto, a data mais longa). Eles conferem o motor que já existia.
- **O QR** não tem oráculo de valores. A prova é a leitura de volta pelo `jsqr`, que veio no mesmo commit da matriz (`8aced5c`).
- **As 18 fixtures em inglês e as 8 brasileiras** não mudaram um byte.

Os quatro `--check`, no fim da run (zero diferença, saída 0 em todos):

```
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py --check
igual: mortgage-calculator.json (296 casos) … igual: apr-to-apy-calculator.json (184 casos)   (as 18)
$ uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py --check
igual: br-sac-price.json (212 casos) … igual: br-rent-or-buy.json (110 casos)   (as 8)
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
$ uv run --no-project --python 3.13 python -I scripts/oracle/pix.py --check
fixtures/pix.json: 4 codes match the oracle (and the manual example)
```

A prova do mutante: numa cópia das fixtures (`CALC_FIXTURES_DIR`), o BMI do exemplo da página passou de 236 para 237 décimos, e um `exact` do Body fat mudou. O `calc-oracle.test.ts` reprovou os dois:

```
$ CALC_FIXTURES_DIR=.cache/mutante-f7 pnpm exec vitest run tests/unit/calc-oracle.test.ts
 ❯ tests/unit/calc-oracle.test.ts (41 tests | 2 failed)
   × bmi-calculator > matches the oracle to the cent in all 149 cases
   × body-fat-calculator > matches the oracle to the cent in all 187 cases
 FAIL  … bmi-calculator … AssertionError: 1 of 149 cases differ
+   "page-example (page-example): got {\"bmi\":236,\"category\":\"healthy\"} expected {\"bmi\":237,\"category\":\"healthy\"}",
```

## As calculadoras

As convenções estão nos § 258 (medidas, contas exatas e o `exact` onde entram π e log10), § 260 (a tabela da Energy Star e a ordem dos ajustes do BTU), § 261 (a troca de unidade não converte), § 262 (o campo de data), § 265 (saúde) e § 266 (casa). Os exemplos oficiais que entraram estão em `fixtures/calc/OFICIAIS.md`:

- **BMI:** 5 ft 8 in e 200 lb = 30.4, do CDC.
- **BTU:** as 14 linhas da tabela da Energy Star.
- **Square footage:** o "12 ft 6 in = 12.5 ft" da Energy Star.
- **Due date:** as 40 semanas do NICHD e os 263 e 261 dias da FIV do NIH (PMC4387083).

Não entraram dois exemplos:

- o Mifflin-St Jeor não tem exemplo resolvido na fonte;
- o texto inteiro do ACOG CO 700 deu 403 (só o resumo no PubMed).

Abaixo, as tabelas saem do código (`.cache/medidas-f7/calc-tables.ts`: os `DEFS`, os textos e as fixtures). A faixa está nas unidades da tela.

### Square footage calculator (`/square-footage-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Area {n} (de 1 a 10) | `a` | menu s; x 0.01 a 300; y 0.01 a 300 | ft |

- **Casos do oráculo:** 154 (page-example 1, two-areas 1, grid 51, energystar-12-ft-6-in 1, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [Energy Star, "Room Air Conditioners" (how to measure a room)](https://www.energystar.gov/products/room_air_conditioners); [NIST, "Circumference, Area and Volume"](https://www.nist.gov/pml/owm/circumference-area-and-volume).

### Concrete calculator (`/concrete-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Shape | `sh` | Slab or footing, Round column | |
| Length | `l` (slab) | 0.01 a 500 | ft |
| Width | `w` (slab) | 0.01 a 500 | ft |
| Thickness | `t` (slab) | 0.01 a 60 | in |
| Diameter | `d` (round) | 0.01 a 240 | in |
| Height or depth | `h` (round) | 0.01 a 240 | in |
| Quantity | `q` | 1 a 100 |  |
| Extra for waste | `wa` | 0 a 50 | % |
| 40 lb bag yield | `y4` | 0.01 a 5 | cu ft |
| 60 lb bag yield | `y6` | 0.01 a 5 | cu ft |
| 80 lb bag yield | `y8` | 0.01 a 5 | cu ft |

- **Casos do oráculo:** 172 (page-example 1, grid 71, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [NIST, "Circumference, Area and Volume"](https://www.nist.gov/pml/owm/circumference-area-and-volume); [NIST Handbook 44 (2026), Appendix C, "General Tables of Units of Measurement"](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c).

### Mulch and gravel calculator (`/mulch-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Measure by | `mo` | Dimensions, Total area | |
| Depth | `de` | 0.01 a 36 | in |
| Length | `l` (dims) | 0.01 a 500 | ft |
| Width | `w` (dims) | 0.01 a 500 | ft |
| Area | `ar` (area) | 0.01 a 250,000 | sq ft |
| Material | `m` | Mulch, Gravel | |
| Bag size | `bm` (mulch) | 0.01 a 10 | cu ft |
| Bag size | `bg` (gravel) | 0.01 a 10 | cu ft |
| Weight per cu yd | `dn` (gravel) | 0.01 a 5 | tons |

- **Casos do oráculo:** 264 (page-example 2, grid 162, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [NIST, "Circumference, Area and Volume"](https://www.nist.gov/pml/owm/circumference-area-and-volume); [NIST Handbook 44 (2026), Appendix C, "General Tables of Units of Measurement"](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c); [EPA, "Standard Volume-to-Weight Conversion Factors"](https://www.epa.gov/sites/default/files/2016-03/documents/conversions.pdf).

### Paint calculator (`/paint-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Measure by | `mo` | Room walls, Total area | |
| Coats | `co` | 1 a 3 |  |
| Perimeter | `pe` (walls) | 1 a 1,000 | ft |
| Wall height | `he` (walls) | 1 a 30 | ft |
| Total area | `ar` (area) | 1 a 20,000 | sq ft |
| Coverage per gallon | `cv` | 100 a 1,000 | sq ft |
| Doors | `dr` | 0 a 50 |  |
| Area of a door | `da` | 1 a 100 | sq ft |
| Windows | `wi` | 0 a 100 |  |
| Area of a window | `wn` | 1 a 100 | sq ft |

- **Casos do oráculo:** 209 (page-example 1, grid 108, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [NIST, "Circumference, Area and Volume"](https://www.nist.gov/pml/owm/circumference-area-and-volume); [EPA, "Wall Paint Exposure Model (WPEM) Version 3.2 User’s Guide"](https://www.epa.gov/sites/default/files/2015-05/documents/wpemman_0.pdf).

### Tile calculator (`/tile-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Area | `ar` | 0.01 a 20,000 | sq ft |
| Extra for cuts | `wa` | 0 a 50 | % |
| Tile length | `tl` | 0.5 a 96 | in |
| Tile width | `tw` | 0.5 a 96 | in |
| Tiles per box | `pb` | 0 a 500 |  |

- **Casos do oráculo:** 245 (page-example 1, grid 144, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [NIST, "Circumference, Area and Volume"](https://www.nist.gov/pml/owm/circumference-area-and-volume); [NIST Handbook 44 (2026), Appendix C, "General Tables of Units of Measurement"](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c).

### BTU calculator (`/btu-calculator/`, hub casa)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Room area | `ar` | 100 a 2,500 | sq ft |
| People in the room | `pe` | 1 a 20 |  |
| Sunlight | `su` | Normal, Heavy shade, Very sunny | |
| In a kitchen | `ki` | No, Yes | |

- **Casos do oráculo:** 452 (page-example 1, grid 337, energystar-row 14, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [Energy Star, "Room Air Conditioners" (sizing table and adjustments)](https://www.energystar.gov/products/room_air_conditioners).

### BMI calculator (`/bmi-calculator/`, hub saúde)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Units | `u` | US, Metric | |
| Height | `ft` (us) | 3 a 8 | ft |
| And inches | `in` (us) | 0 a 11.9 | in |
| Weight | `lb` (us) | 55 a 1,000 | lb |
| Height | `cm` (metric) | 91.5 a 274.3 | cm |
| Weight | `kg` (metric) | 25 a 453.5 | kg |
| Age | `ag` | 20 a 120 | years |

- **Casos do oráculo:** 149 (page-example 2, grid 36, edge 10, cdc-5-ft-8-in-200-lb 1, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [CDC, "Adult BMI Categories"](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html); [CDC, "BMI Frequently Asked Questions"](https://www.cdc.gov/bmi/faq/index.html); [CDC, "About Body Mass Index (BMI)"](https://www.cdc.gov/bmi/about/index.html).

### Calorie calculator (`/calorie-calculator/`, hub saúde)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Units | `u` | US, Metric | |
| Height | `ft` (us) | 3 a 8 | ft |
| And inches | `in` (us) | 0 a 11.9 | in |
| Weight | `lb` (us) | 55 a 1,000 | lb |
| Height | `cm` (metric) | 91.5 a 274.3 | cm |
| Weight | `kg` (metric) | 25 a 453.5 | kg |
| Age | `ag` | 19 a 78 | years |
| Sex used by the formula | `sx` | Female, Male | |
| Activity level | `pa` | 1.4 a 2.5 |  |

- **Casos do oráculo:** 134 (page-example 2, grid 32, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [Mifflin MD, St Jeor ST et al., "A new predictive equation for resting energy expenditure in healthy individuals" (PubMed)](https://pubmed.ncbi.nlm.nih.gov/2305711/); [NIDDK, "Body Weight Planner"](https://www.niddk.nih.gov/bwp); [NIDDK, Hall KD et al., web appendix of the Body Weight Planner model (resting energy by Mifflin-St Jeor)](https://www.niddk.nih.gov/-/media/Files/BWP/Hall_Lancet_Web_Appendix.pdf).

### Ovulation calculator (`/ovulation-calculator/`, hub saúde)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| First day of last period | `d` | 2000-01-01 a 2099-12-31 | dia |
| Cycle length | `c` | 20 a 40 | days |

- **Casos do oráculo:** 139 (page-example 1, clock 3, grid 35, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [Office on Women’s Health, "Ovulation calculator"](https://www.womenshealth.gov/ovulation-calculator); [Office on Women’s Health, "Your menstrual cycle"](https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle); [NICHD, "About Menstruation"](https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo).

### Body fat calculator (`/body-fat-calculator/`, hub saúde)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Units | `u` | US, Metric | |
| Height | `ft` (us) | 3 a 8 | ft |
| And inches | `in` (us) | 0 a 11.9 | in |
| Height | `cm` (metric) | 91.5 a 274.3 | cm |
| Neck | `nk` (us) | 8 a 30 | in |
| Waist | `wa` (us) | 15 a 80 | in |
| Neck | `nkc` (metric) | 20 a 76 | cm |
| Waist | `wac` (metric) | 38 a 203 | cm |
| Sex used by the formula | `sx` | Female, Male | |
| Hip | `hp` (us) | 20 a 80 | in |
| Hip | `hpc` (metric) | 50 a 203 | cm |
| Age | `ag` | 18 a 120 | years |

- **Casos do oráculo:** 187 (page-example 3, grid 84, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [Foulis SA, Friedl KE et al., Frontiers in Physiology, 2023: the equations in print (PMC10282178)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10282178/); [Schuna JM Jr et al., International Journal of Exercise Science, 2013: the male equation in inches (PMC4831679)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4831679/); [U.S. Army, "Army modifies body composition program, adopts waist-to-height ratio"](https://www.army.mil/article/293753/army_modifies_body_composition_program_adopts_waist_to_height_ratio).

### Due date calculator (`/due-date-calculator/`, hub saúde)

| Campo | Chave | Faixa | Unidade |
| --- | --- | --- | --- |
| Count from | `m` | Last period, Conception, IVF, day 3, IVF, day 5 | |
| Date | `d` | 2000-01-01 a 2099-12-31 | dia |

- **Casos do oráculo:** 327 (page-example 1, grid 216, clock 7, nichd-ivf-day 2, nichd-40-weeks 1, random 100).
- **Fontes** (lidas em 2 de novembro de 2026): [NICHD, "About Pregnancy"](https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo); [NIH, nuMoM2b study methods: dating by insemination and IVF transfer (PMC4387083)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4387083/); [ACOG Committee Opinion 700, "Methods for Estimating the Due Date" (PubMed)](https://pubmed.ncbi.nlm.nih.gov/28426621/); [MedlinePlus, "When you pass your due date"](https://medlineplus.gov/ency/patientinstructions/000515.htm).

## O QR code

- **A matriz:** correção H, os bytes UTF-8 do `TextEncoder` num segmento só de bytes, até 1.273 bytes (a capacidade da versão 40 em H). Texto vazio, só de espaços ou acima do limite não gera QR, e o erro diz o limite (§ 272).
- **A Oli:** o ícone do app num quadro branco centrado, alinhado à grade, com lado ímpar de cerca de 22% da matriz. Nas 160 leituras da sondagem (4 textos por versão, da 1 à 40), o `jsqr` não falhou nenhuma; ele leu com até 30% da matriz coberta na versão 1 e 46% na 40 (§ 272). A lente de corretude contou, versão a versão, os codewords sob o quadro contra a correção de cada bloco: o pior caso fica dentro da margem.
- **O PNG:** do `<canvas>` da página, com um número inteiro de pixels por módulo. "Small", "Medium" e "Large" miram 512, 1.024 e 2.048 px: escala = máx(4, piso(alvo ÷ (n + 8))). A tela diz o tamanho real. O endereço curto sai em 490 × 490 px no "Small".
- **Os conteúdos testados** (`tests/e2e/qr-code.spec.ts`, nos dois navegadores, o PNG e o SVG baixados, com e sem a Oli, e o `binaryData` igual aos bytes):
  - um endereço curto (`https://fileorca.com/`, nos três tamanhos);
  - um endereço longo com 24 parâmetros;
  - acento e emoji ("Olá! Café às 7h, ñandú e 🐋 na praia — até já ☕");
  - o maior texto permitido.

  No Node (`tests/unit/qr.test.ts`), o SVG rasterizado pelo `@resvg/resvg-js` é lido nas 40 versões. Um controle confere que o QR de um texto nunca casa com outro.
- **Privacidade:** o texto nunca vai a URL, evento, armazenamento, título, atributo ou nome de arquivo (`qr-code.png` e `qr-code.svg`). A página nunca abre nem busca o endereço digitado. A caixa tem `autocomplete="off"`, `spellcheck={false}` e `autocapitalize="off"`. Os eventos são só `export_click` com `png` ou `svg`.
- **O bundle:** o plugin `qrcodeEsm()` (§ 271) entrega o núcleo do `qrcode` e o `dijkstrajs` como ES modules. A página fica com 2 arquivos JS (a entrada e o `island`), e o `gate:licencas` confere que os dois pacotes estão num chunk só.

## Os testes novos e o que eles dizem

Os specs novos e os que mais cresceram, com os testes que passaram em cada navegador nas 13 partes locais (nenhuma falha):

| Spec | Chromium | WebKit | O que prova |
| --- | ---: | ---: | --- |
| `money-home.spec.ts` | 9 | 9 | As 6 de casa contra o oráculo: o exemplo da página e dois casos digitados (um canto da grade e um aleatório), lidos no ResultHero, na tabela aberta e no CSV baixado; o PDF com nome fixo; a comemoração única da Oli; o número numa linha |
| `money-health.spec.ts` | 28 | 28 | As 5 de saúde da mesma forma, as duas unidades, o "hoje" com o relógio fixo (virada de ano, 29 de fevereiro, os casos do relógio do oráculo), o dia fora da faixa e a Oli sem comemorar |
| `money-life-privacy.spec.ts` | 12 | 12 | Sentinelas em todo campo visível das 11, com o PDF, o CSV e o link copiados: nenhum número ou dia sai do aparelho (abaixo) |
| `qr-code.spec.ts` | 6 | 6 | Os quatro conteúdos lidos de volta do PNG e do SVG, com e sem a Oli; o texto nunca sai do aparelho; o erro do vazio e do texto acima do limite |
| `calc-form.spec.ts` | 9 | 9 | As correções da revisão (§ 275 a § 282) |
| `events.spec.ts` | 17 | 17 | Os eventos das calculadoras novas e do QR, só com o id da página e o formato |
| `money-speed.spec.ts` | 10 | 10 | Os 16 ms por tecla, com o BMI e a Square footage com 10 áreas |
| `a11y.spec.ts` | 246 | 246 | O axe nas 14 páginas novas a 360 e 1280 px, nos dois temas, e nos estados novos: uma área acrescentada e um campo fora da faixa na Square footage, o BMI nas duas unidades, o campo de data com um dia e fora da faixa, o QR pronto e com texto acima do limite |
| `ads.spec.ts` | 146 | 146 | Os 150 px de toda peça nas páginas novas, e o número do ResultHero acima da dobra a 360 × 740 nas 11, nos dois sistemas de unidade |
| `budgets.spec.ts` | 115 | 115 | 2 arquivos JS nas calculadoras novas e no QR, 0 nos hubs, os tetos de JS e de requisições |

A privacidade, no Chromium (o WebKit tem os mesmos 12 e os 6):

```
[chromium] › tests\e2e\money-life-privacy.spec.ts:101:1 › the sentinel search finds every form and ignores a number inside another one
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /square-footage-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /concrete-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /mulch-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /paint-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /tile-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /btu-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /bmi-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /calorie-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /ovulation-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /body-fat-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\money-life-privacy.spec.ts:198:3 › /due-date-calculator/: no typed measure or date leaves the device
[chromium] › tests\e2e\qr-code.spec.ts:130:3 › QR code generator › the text never leaves the device: no request, event, store, title, attribute or file name carries it
```

O que cada sentinela procura:

- **O que entra:** uma sentinela em cada campo visível, tirada da faixa do próprio campo, e o dia sentinela nos campos de data. As escolhas que mostram outros campos (a forma do concreto, a área e o material do mulch, as paredes ou a área da tinta, as unidades da saúde) são trocadas uma vez, e os campos que elas mostram ganham sentinelas também.
- **O que a página faz:** baixa o PDF e o CSV em cada estado, lê a tabela, copia o link, clica no primeiro chip e abre o link copiado.
- **Onde procura:** em toda forma que a sentinela pode tomar, na URL e no corpo de toda requisição de qualquer origem, no `dataLayer`, no `document.title`, no `location.search`, no `localStorage`, no `sessionStorage`, nos cookies e no nome dos arquivos baixados. Nenhuma aparece, nenhuma requisição vai a outro host, e o link copiado (depois do `#`) é o único lugar com os valores.

No Vitest, os testes que a F7 trouxe:

- **`tests/unit/calc-oracle.test.ts`:** as 11 fixtures e os 2.432 casos, com o `exact` (a § 258 diz 2.421 porque foi escrita antes dos casos do relógio do `23f7325`).
- **`tests/unit/calc-defs.test.ts`:** as 37 definições, as faixas e os erros, o link com data e menu de linha, e o bloco "after the review F7".
- **`tests/unit/qr.test.ts` e `tests/unit/qrcode-esm.test.ts`:**
  - a matriz em H;
  - o quadro da Oli;
  - a leitura nas 40 versões;
  - os arquivos convertidos dando a mesma matriz do pacote.
- **`tests/unit/health-voice.test.ts` e `tests/unit/ymyl.test.ts`:** o tom e o `BANNED_HEALTH`, com controles positivos e negativos.

## Orçamento

**As páginas novas** estão na tabela das páginas, acima: as 11 calculadoras com os mesmos 2 arquivos de toda calculadora, os 2 hubs sem JS externo e o QR com 2 arquivos. O teto é de 80 KB de JS inicial em gzip e 8 requisições. O `budgets.spec.ts` prova os 2 arquivos e o teto em cada página, nos dois navegadores, e prova pelo registro do bundle que nenhum arquivo das páginas de imagem e de PDF leva módulo da F7.

**Antes e depois**, com o mesmo script (`.cache/medidas-f7/pages.ts`, gzip com os inline, Chromium a 360 px): antes é o build da `main` (`048a3dd`, o merge da F6), numa worktree temporária; depois é o build desta branch.

| Página | Antes (`main`, F6) | Depois (F7) | Arquivos JS | Requisições |
| --- | ---: | ---: | --- | --- |
| `/compress-image/` | 21,5 KB | 21,6 KB | 2 → 2 | 6 → 6 |
| `/merge-pdf/` | 37,4 KB | 37,5 KB | 2 → 2 | 6 → 6 |
| `/mortgage-calculator/` | 43,9 KB | 51,2 KB | 2 → 2 | 6 → 6 |
| `/pt/simulador-sac-price/` | 43,9 KB | 51,2 KB | 2 → 2 | 6 → 6 |
| `/image-tools/` | 3,7 KB | 3,7 KB | 0 → 0 | 4 → 4 |
| `/money-calculators/` | 4,1 KB | 4,1 KB | 0 → 0 | 4 → 4 |
| `/` | 3,4 KB | 3,4 KB | 0 → 0 | 4 → 4 |

As calculadoras cresceram 7,3 KB: as 11 definições e os motores entraram no arquivo comum (§ 236 e § 270), e o formulário ganhou o campo de data, o menu de linha e o aviso de erro de faixa ao store. Separar o código por região criaria um terceiro arquivo JS por página. As de imagem e de PDF cresceram 0,1 KB, das listas fechadas de eventos (§ 263).

## Lighthouse

No celular, mediana de 3 execuções, na parte `--sem-playwright` do `verificar` local no código final (commit `9d09714`). O `lighthouserc.json` ganhou o `/qr-code-generator/` (decisão 8).

| Página | Execuções | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/compress-image/` | 3 | 99 | 100 | 100 | 100 | 1,76 s | 0,001 |
| `/image-tools/` | 3 | 100 | 100 | 100 | 100 | 1,35 s | 0,000 |
| `/mortgage-calculator/` | 3 | 99 | 100 | 100 | 100 | 1,97 s | 0,000 |
| `/guides/15-vs-30-year-mortgage/` | 3 | 99 | 100 | 100 | 100 | 1,96 s | 0,000 |
| `/compress-pdf/` | 3 | 99 | 100 | 100 | 100 | 1,80 s | 0,000 |
| `/pdf-tools/` | 3 | 100 | 100 | 100 | 100 | 1,44 s | 0,000 |
| `/guides/why-is-my-pdf-so-large/` | 3 | 99 | 100 | 100 | 100 | 1,80 s | 0,005 |
| `/pt/simulador-sac-price/` | 3 | 99 | 100 | 100 | 100 | 1,95 s | 0,001 |
| `/pt/apoie/` | 3 | 100 | 100 | 100 | 100 | 1,50 s | 0,000 |
| `/qr-code-generator/` (nova) | 3 | 100 | 100 | 100 | 100 | 1,50 s | 0,000 |

- **O QR code** passa no critério: desempenho de 90 ou mais e CLS de até 0,05.
- **As nove que já estavam** ficaram com as notas da F6, com diferença de até 1 ponto de desempenho e até 0,14 s de LCP (o guia de 15 ou 30 anos, de 1,82 para 1,96 s). A `/compress-image/` deu 99 aqui e 100 na F6 (LCP de 1,76 s contra 1,65 s), variação que já aparecia entre as execuções da F6. O CLS da `/pdf-tools/` deu 0,000 (na F6, 0,014).
- **As calculadoras e os hubs novos** ficaram fora do `lighthouserc.json`, que a ficha não mandou mudar além do QR. A lente de desempenho os mediu no commit revisado, no celular, com mediana de 3: o `/bmi-calculator/` com 99 de desempenho e CLS de 0,006, o `/square-footage-calculator/` com 99 e 0,005, e o `/qr-code-generator/` com 100, CLS de 0,000 e LCP de 1,50 s. O CLS a 360 px com escala 1 é o e-1 da revisão (pendência).

## Screenshots

- **Onde:** o `pnpm screenshots` grava em `docs/relatorios/fase-07/componentes/` (322 PNG), sobre o `dist/` do commit `d163c61`, o último com mudança visual, nos temas claro e escuro.
- **O que a F7 acrescentou:** 32 PNG, a 360 e a 1280 px, nos dois temas (`f7-*`):
  - o BMI nos dois sistemas de unidade (`f7-bmi-us-*` e `f7-bmi-metric-*`);
  - o Due date;
  - o Concrete;
  - a Square footage;
  - os dois hubs;
  - o QR code.
- **A prévia:** os screenshots da prévia ficam em `docs/relatorios/fase-07/previa/`, com o resultado da sonda (`resultado.txt`).
- **O resto:** as capturas das fases anteriores, refeitas sobre o `dist/` de agora.

## CI

**A divisão do `ci.yml` mudou** pela decisão 10: o Chromium passou de 3 para 4 partes e o WebKit de 7 para 8. Com o `verificar`, são 13 partes. Só a matriz do job `playwright` e o comentário do topo mudaram. O `tests/unit/verificar.test.ts` traz as 13 partes escritas à mão e prova que juntas são os mesmos passos do todo. O adendo da ADR-003 registra a mudança.

**Onde o `--list` pôs os specs** (contagem de testes de cada spec em cada parte, no commit final):

| Parte | Specs (testes) |
| --- | --- |
| chromium 1 de 4 | a11y 246, ads 46 |
| chromium 2 de 4 | ads 100, budgets 115, calc-form 9, coffee 14, consent-choice 6, consent 8, cookie-footer 6, design 34 |
| chromium 3 de 4 | design 16, engine-paths 7, events 17, i18n-budgets 139, image-batch 6, image-crop 2, image-matrix 18, image-presets 3, image-privacy 5, image-smoke 11, island 10, launch-claims 8, money-calc 38, money-health 12 |
| chromium 4 de 4 | money-health 16, money-home 9, money-life-privacy 12, money-pix 4, money-privacy 32, money-speed 10, navigation 14, pdf-hardening 5, pdf-matrix 51, pdf-privacy 22, pdf-speed 4, pdf-tool 26, qr-code 6, tool-guides 21, tool-i18n 50, tool 10 |
| webkit 1 de 8 | a11y 146 |
| webkit 2 de 8 | a11y 100, ads 46 |
| webkit 3 de 8 | ads 100, budgets 46 |
| webkit 4 de 8 | budgets 69, calc-form 9, coffee 14, consent-choice 6, consent 8, cookie-footer 6, **design 34** |
| webkit 5 de 8 | **design 16**, engine-paths 7, events 17, i18n-budgets 106 |
| webkit 6 de 8 | i18n-budgets 33, image-batch 6, image-crop 2, **image-matrix 18**, image-presets 3, image-privacy 5, image-smoke 11, island 10, launch-claims 8, money-calc 38, money-health 12 |
| webkit 7 de 8 | money-health 16, money-home 9, money-life-privacy 12, money-pix 4, money-privacy 32, money-speed 10, navigation 14, pdf-hardening 5, pdf-matrix 44 |
| webkit 8 de 8 | pdf-matrix 7, pdf-privacy 22, pdf-speed 4, pdf-tool 26, qr-code 6, tool-guides 21, tool-i18n 50, tool 10 |

O `design.spec.ts` ficou nas partes 4 e 5 do WebKit e a matriz de imagens na 6: nunca juntos (§ 108 e § 142). O `calc-form.spec.ts` da revisão caiu na parte 4, a mais leve.

**As execuções.** O total do `verificar` de cada parte, do resumo no log, contra a execução final da F6 ([run 41410030945](https://github.com/vmatusita/fileorca/actions/runs/41410030945), 11 partes):

| Parte | F7, primeira ([run 41449325645](https://github.com/vmatusita/fileorca/actions/runs/41449325645), `69fb7f3`) | F7, depois da revisão ([run 41459127177](https://github.com/vmatusita/fileorca/actions/runs/41459127177), `083f5a7`) | F7, final ([run 41465872919](https://github.com/vmatusita/fileorca/actions/runs/41465872919), `9d09714`) |
| --- | ---: | ---: | ---: |
| `verificar` (`--sem-playwright`) | 676,5 s | 676,0 s | 680,5 s |
| `playwright (chromium 1 de 4)` | 535,3 s | 539,0 s | 471,2 s |
| `playwright (chromium 2 de 4)` | 325,7 s | 342,8 s | 349,3 s |
| `playwright (chromium 3 de 4)` | 442,0 s | 417,7 s | 417,5 s |
| `playwright (chromium 4 de 4)` | 591,2 s | 553,0 s | 478,4 s |
| `playwright (webkit 1 de 8)` | 557,7 s | 512,8 s | 576,2 s |
| `playwright (webkit 2 de 8)` | **833,1 s** | 690,0 s | 600,8 s |
| `playwright (webkit 3 de 8)` | 246,0 s | 431,6 s | 384,4 s |
| `playwright (webkit 4 de 8)` | 279,9 s | 245,0 s | 308,5 s |
| `playwright (webkit 5 de 8)` | 272,8 s | 285,3 s | 218,1 s |
| `playwright (webkit 6 de 8)` | 531,4 s | 439,9 s | 664,3 s |
| `playwright (webkit 7 de 8)` | 692,4 s | 653,5 s | **730,0 s** |
| `playwright (webkit 8 de 8)` | 344,1 s | 567,0 s | 355,4 s |

Na F6, as partes eram: o `verificar` com 583,6 s; o Chromium em 3, com 663,0, 349,4 e 727,3 s (1.739,7 s somados); o WebKit em 7, com 553,7, 510,3, 271,4, 308,7, 544,8, 697,6 e 580,1 s (3.466,6 s somados).

- **O Chromium em 4 partes** tirou as duas que passavam do alvo na F6 (727,3 e 663,0 s). A maior agora fica entre 553 e 591 s.
- **Duas partes do WebKit passaram do alvo de 700 s, uma vez cada,** sempre abaixo do limite de 900 s:
  - a parte 2 (a segunda metade do `a11y` e o começo do `ads`) levou 833,1 s na primeira execução, e 690,0 s e 600,8 s nas seguintes;
  - a parte 7 (os `money-*` e 43 testes da matriz de PDF, que somam 740 s) levou 730,0 s na execução final, e 692,4 s e 653,5 s nas anteriores.

  A medida e a proposta estão na § 283: tirar o passeio de estados do `a11y` para um arquivo que caia depois do `ads`, ou o WebKit em 9 partes, numa run de ajuste.
- **Minutos de runner:** a soma dos jobs dá uns 122 a 123 min por push (7.408 s, 7.385 s e 7.313 s nas três execuções). Na F6, eram uns 110 min.
- **Disco:** as partes do Playwright terminaram com "No coredumps found.", e nenhuma deu `ENOSPC`.
- **O `merge`** rodou nas três e não mesclou, porque a PR estava em rascunho. O `pos-deploy` foi pulado.
- **A execução final** (`9d09714`) é a última verde com código ou teste. O commit do relatório, depois dela, só traz documentos.

## A revisão adversarial

O relatório inteiro está em [`REVISAO-F7.md`](REVISAO-F7.md). Em resumo:

| Severidade | Lentes | Depois dos céticos | Corrigidos |
| --- | ---: | ---: | ---: |
| Crítico | 0 | 0 | — |
| Alto | 8 | 1 | 1 |
| Médio | 18 | 16 | 15 |
| Baixo | 23 | 25 | 5 (os que repetiam um médio) |
| Refutado | — | 7 | — |

Por lente, depois dos céticos (alto, médio, baixo, refutado):

- corretude: 0, 1, 5, 0;
- privacidade: 0, 1, 0, 0;
- anúncio: 0, 0, 0, 1;
- acessibilidade: 0, 5, 5, 2;
- desempenho e SEO: 0, 1, 1, 0;
- design system: 1, 6, 6, 2;
- saúde: 0, 2, 8, 2.

As correções:

- **As tabelas abertas:** sem coluna fixa e cabendo a 320 px, com a Ovulation em 3 colunas (§ 275).
- **O erro de faixa:** passou a marcar o resultado velho e a desligar o PDF e o CSV, como a § 116 dizia, em todas as calculadoras (§ 276).
- **Os campos estreitos:** o número, o menu e a data inteiros (§ 277).
- **O link com várias áreas:** não leva mais o foco (§ 278).
- **A unidade:** entrou na descrição do campo (§ 279).
- **O alto contraste e o placeholder do QR** (§ 280).
- **O resto:** o Body fat sem "0 %", a fórmula na frase e a Privacidade com as escolhas (§ 281).
- **A segunda passada:** as meias linhas do dinheiro abaixo de 360 px e os casos de dinheiro no teste do erro de faixa (§ 282).

Cada correção tem um teste que reprova no código revisado e passa no novo: os 9 testes do `tests/e2e/calc-form.spec.ts` e os 3 do bloco "after the review F7" do `calc-defs.test.ts`.

- **A prova contra o `dist/` do código revisado:** 8 de 8 reprovaram.
- **O teste da segunda passada:** reprovou no `dist/` do `083f5a7`.
- **Os 3 de unidade:** reprovaram com as mudanças de `src/` guardadas.

A saída está em `.cache/calc-form-old/` e nas notas desta run.

## `pnpm verificar` local

O `pnpm verificar` inteiro passa de 900 s nesta máquina (§ 242): as partes somam uns 1.650 s. Por isso, como a ficha manda, rodei as 13 partes do CI em sequência, depois de uma instalação limpa, no commit final do código (`9d09714`). Todas passaram. O script é `.cache/verificar-13.sh`, e os logs inteiros ficaram em `.cache/verificar-13/`, fora do repositório.

```
$ CI=true pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 631ms using pnpm v10.34.9
(saída 0)
```

```
parte 1 (pnpm verificar --sem-playwright): saída 0, 503 s de relógio
parte 2 (pnpm verificar --playwright=chromium --shard=1/4): saída 0, 120 s de relógio
parte 3 (pnpm verificar --playwright=chromium --shard=2/4): saída 0, 109 s de relógio
parte 4 (pnpm verificar --playwright=chromium --shard=3/4): saída 0, 106 s de relógio
parte 5 (pnpm verificar --playwright=chromium --shard=4/4): saída 0, 105 s de relógio
parte 6 (pnpm verificar --playwright=webkit --shard=1/8): saída 0, 79 s de relógio
parte 7 (pnpm verificar --playwright=webkit --shard=2/8): saída 0, 115 s de relógio
parte 8 (pnpm verificar --playwright=webkit --shard=3/8): saída 0, 79 s de relógio
parte 9 (pnpm verificar --playwright=webkit --shard=4/8): saída 0, 78 s de relógio
parte 10 (pnpm verificar --playwright=webkit --shard=5/8): saída 0, 72 s de relógio
parte 11 (pnpm verificar --playwright=webkit --shard=6/8): saída 0, 94 s de relógio
parte 12 (pnpm verificar --playwright=webkit --shard=7/8): saída 0, 108 s de relógio
parte 13 (pnpm verificar --playwright=webkit --shard=8/8): saída 0, 88 s de relógio
fim
```

O resumo de cada parte, com o tempo de cada portão:

```
Resumo do pnpm verificar (sem o Playwright)
  ok      10.2 s  tipos (astro check)
  ok       4.2 s  lint (eslint)
  ok      25.4 s  build (astro build do zero)
  ok      32.3 s  vitest
  ok       0.4 s  cabeçalhos gerados
  ok       0.5 s  worker sem código
  ok       0.7 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.8 s  links internos e páginas órfãs
  ok       1.2 s  conteúdo mínimo das ferramentas e do site
  ok      54.3 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       1.3 s  design (sprite, fontes, tema, movimento, setas)
  ok       6.0 s  licenças
  ok       0.5 s  conteúdo de dinheiro e saúde
  ok       0.5 s  actionlint
  ok     352.6 s  lighthouse ci
  ok      11.4 s  lint:texto (LanguageTool)
  total 502.4 s (limite 900 s)

Resumo do pnpm verificar (Playwright no chromium, parte 1 de 4)
  ok      24.8 s  build (astro build do zero)
  ok      94.1 s  playwright (chromium, parte 1 de 4, axe, anúncios, orçamentos)
  total 119.0 s (limite 900 s)

Resumo do pnpm verificar (Playwright no chromium, parte 2 de 4)
  ok      24.9 s  build (astro build do zero)
  ok      83.4 s  playwright (chromium, parte 2 de 4, axe, anúncios, orçamentos)
  total 108.3 s (limite 900 s)

Resumo do pnpm verificar (Playwright no chromium, parte 3 de 4)
  ok      24.8 s  build (astro build do zero)
  ok      81.6 s  playwright (chromium, parte 3 de 4, axe, anúncios, orçamentos)
  total 106.4 s (limite 900 s)

Resumo do pnpm verificar (Playwright no chromium, parte 4 de 4)
  ok      24.8 s  build (astro build do zero)
  ok      78.8 s  playwright (chromium, parte 4 de 4, axe, anúncios, orçamentos)
  total 103.7 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 1 de 8)
  ok      25.2 s  build (astro build do zero)
  ok      53.3 s  playwright (webkit, parte 1 de 8, axe, anúncios, orçamentos)
  total 78.6 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 2 de 8)
  ok      24.7 s  build (astro build do zero)
  ok      90.3 s  playwright (webkit, parte 2 de 8, axe, anúncios, orçamentos)
  total 115.0 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 3 de 8)
  ok      24.2 s  build (astro build do zero)
  ok      54.1 s  playwright (webkit, parte 3 de 8, axe, anúncios, orçamentos)
  total 78.3 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 4 de 8)
  ok      24.1 s  build (astro build do zero)
  ok      53.8 s  playwright (webkit, parte 4 de 8, axe, anúncios, orçamentos)
  total 78.0 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 5 de 8)
  ok      24.2 s  build (astro build do zero)
  ok      47.1 s  playwright (webkit, parte 5 de 8, axe, anúncios, orçamentos)
  total 71.3 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 6 de 8)
  ok      24.4 s  build (astro build do zero)
  ok      68.8 s  playwright (webkit, parte 6 de 8, axe, anúncios, orçamentos)
  total 93.3 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 7 de 8)
  ok      24.1 s  build (astro build do zero)
  ok      84.1 s  playwright (webkit, parte 7 de 8, axe, anúncios, orçamentos)
  total 108.3 s (limite 900 s)

Resumo do pnpm verificar (Playwright no webkit, parte 8 de 8)
  ok      24.0 s  build (astro build do zero)
  ok      62.9 s  playwright (webkit, parte 8 de 8, axe, anúncios, orçamentos)
  total 86.9 s (limite 900 s)
```

- **Vitest:** 80 arquivos e 1.422 testes. **Playwright:** 1.168 testes por navegador, todos passaram, sem rerun.
- **O `lint:texto`:** 0 erros nos textos alterados contra `origin/main`.
- **Os 16 ms por tecla** (`money-speed.spec.ts`): o BMI com p95 de 0,90 ms e a Square footage com 10 áreas com 0,90 ms no Chromium. No WebKit, que mede de 1 em 1 ms, deram 1 ms.

## Prévia

[https://fase-07-fileorca.vmatusita.workers.dev](https://fase-07-fileorca.vmatusita.workers.dev), no commit final do código (`9d09714`: o `build.txt` da prévia confere).

O que eu conferi nela com uma sonda do Playwright (`.cache/previa-f7/check.ts`). A sonda roda no Chromium, com os domínios do Google bloqueados por `context.route` e o consentimento recusado, a 360 × 740 e a 1280 × 800. Os screenshots de cada visita e o resultado estão em `docs/relatorios/fase-07/previa/`.

```
build.txt: 9d09714c142d323c9c246e240adcbc9ffecbbdd8
360px /bmi-calculator/: 200 · h1 "BMI calculator" · resultado "23.6" · fim do número 708 px · tabela 324/324 px (largura do conteúdo/da moldura)
360px /bmi-calculator/#v=1&u=metric: 200 · h1 "BMI calculator" · resultado "22.9" · fim do número 708 px · tabela 324/324 px (largura do conteúdo/da moldura)
360px /due-date-calculator/: 200 · h1 "Due date calculator" · resultado "June14,2027" · fim do número 568 px · tabela 324/324 px (largura do conteúdo/da moldura)
360px /ovulation-calculator/: 200 · h1 "Ovulation calculator" · resultado "November1,2026" · fim do número 590 px · tabela 324/324 px (largura do conteúdo/da moldura)
360px /concrete-calculator/: 200 · h1 "Concrete calculator" · resultado "1.36cu yd" · fim do número 708 px · tabela 324/324 px (largura do conteúdo/da moldura)
360px /home-calculators/: 200 · h1 "Calculators for home projects" · resultado "—"
360px /health-calculators/: 200 · h1 "Calculators for adult health numbers" · resultado "—"
360px /qr-code-generator/: qr-code.png 490×490 px, jsqr leu os bytes exatos
1280px /bmi-calculator/: 200 · h1 "BMI calculator" · resultado "23.6" · fim do número 420 px · tabela 754/754 px (largura do conteúdo/da moldura)
1280px /bmi-calculator/#v=1&u=metric: 200 · h1 "BMI calculator" · resultado "22.9" · fim do número 420 px · tabela 754/754 px (largura do conteúdo/da moldura)
1280px /due-date-calculator/: 200 · h1 "Due date calculator" · resultado "June14,2027" · fim do número 448 px · tabela 754/754 px (largura do conteúdo/da moldura)
1280px /ovulation-calculator/: 200 · h1 "Ovulation calculator" · resultado "November1,2026" · fim do número 420 px · tabela 754/754 px (largura do conteúdo/da moldura)
1280px /concrete-calculator/: 200 · h1 "Concrete calculator" · resultado "1.36cu yd" · fim do número 420 px · tabela 754/754 px (largura do conteúdo/da moldura)
1280px /home-calculators/: 200 · h1 "Calculators for home projects" · resultado "—"
1280px /health-calculators/: 200 · h1 "Calculators for adult health numbers" · resultado "—"
1280px /qr-code-generator/: qr-code.png 490×490 px, jsqr leu os bytes exatos
```

- **O BMI nos dois sistemas de unidade:** 23.6 em US e 22.9 em métrico, os exemplos do oráculo.
- **O número abaixo de 740 px a 360 px:** nas calculadoras abertas, ele termina entre 568 e 708 px (§ 124).
- **As tabelas abertas** (§ 275): cabem na moldura nas duas larguras, sem rolagem lateral.
- **O Due date:** a data do exemplo, June 14, 2027.
- **O Concrete:** 1.36 cu yd.
- **Os dois hubs:** 200, com o H1 de cada um.
- **O QR:** um texto com acento, travessão e o sinal ✓, digitado na caixa. O PNG "Small" baixado (490 × 490 px, `qr-code.png`) foi lido pelo `jsqr` com os bytes UTF-8 exatos, nas duas larguras.

## Decisões novas

Do § 257 ao § 283 do `DECISOES.md`.

- **§ 257:** as calculadoras de casa e saúde num registro irmão do de dinheiro (`LIFE_CALC_PAGES`), numa ilha só.
- **§ 258 e § 259:**
  - as medidas em centésimos, as contas exatas e o `exact` com π e log10;
  - as asserções que mudaram porque o site cresceu.
- **§ 260 a § 262:**
  - a tabela da Energy Star e a ordem dos ajustes;
  - a troca de unidade sem conversão;
  - o campo de data do navegador.
- **§ 263 e § 264:** os eventos da F7 e as datas das páginas.
- **§ 265 a § 267:**
  - as convenções de saúde e de casa, conferidas nas fontes;
  - o que uma página de saúde nunca diz (`BANNED_HEALTH`).
- **§ 268 e § 269:**
  - o resultado acima da dobra a 360 × 740 (o lead numa linha, o sexo e o material depois do resultado, uma área no exemplo da Square footage);
  - as amostras do `lint:texto`.
- **§ 270 a § 272:**
  - o JS das calculadoras com as 11 novas;
  - o `qrcode` como ES modules;
  - o gerador de QR code.
- **§ 273:** o teste de 90 dias, **de 2 de novembro de 2026 a 31 de janeiro de 2027.**
- **§ 274 a § 281:** a revisão adversarial e as correções.
- **§ 282:** a segunda passada.
- **§ 283:** as partes 2 e 7 do WebKit acima de 700 s uma vez cada, com a proposta.

## O que a válvula cortou

Nada. As 11 calculadoras, os 2 hubs e o QR estão nesta PR, e não há run 7b.

## O que é do Victor, em passos

1. **O merge.**
   - Esta PR muda o `.github/workflows/ci.yml` (só a matriz do job `playwright` e o comentário do topo: o CI passa a 13 partes). Por isso o job de merge não a mescla sozinho.
   - Conferir que o diff do `.github/` é só isso: `git diff origin/main...fase-07 -- .github/`.
   - Dar o merge pela página da PR (squash, apagando a branch).
   - Depois, conferir o pós-deploy e o `build.txt` de produção.
2. **O QR no celular.**
   - Gerar o QR de um endereço e o de um texto com acento, com a Oli.
   - Baixar o PNG e o SVG.
   - Ler com a câmera do celular.
3. **No celular,** abrir o BMI nos dois sistemas de unidade, o Due date e o Concrete.
4. **No Search Console,** pedir a indexação dos dois hubs (`/home-calculators/` e `/health-calculators/`), do `/bmi-calculator/` e do `/qr-code-generator/`.
5. **Se o Product Hunt ainda não foi postado,** conferir as contagens do kit (`docs/lancamento/product-hunt.md`) depois do merge. O `launch-kit.test.ts` reprova se elas não baterem com os registros.
6. **O teste de 90 dias.**
   - Anotar 31 de janeiro de 2027 como a data do fim.
   - Nesse dia, olhar no Search Console as impressões de cada uma das 11 calculadoras e dos 2 hubs (§ 273).
   - As que tiverem impressão ganham pt e es numa run própria.
   - Se o merge atrasar, contar os dias de produção de cada página.
7. **As pendências que seguem abertas:**
   - a 2b (§ 85);
   - os baixos das revisões da F4 à F7 (os da F7 no `REVISAO-F7.md`);
   - a § 103;
   - as propostas da § 242 (o `verificar` local acima de 900 s) e da § 283 (as partes 2 e 7 do WebKit);
   - o CLS do breadcrumb de 320 a 390 px (e-1 da revisão, § 274);
   - as fontes que não abriram: o texto inteiro do ACOG CO 700 e os relatórios do DTIC, ambos com 403.
   - Esta run não deixou nada para uma 7b.
   - As worktrees antigas em `.claude/worktrees/` (de 31/out: `ajuste-ci-partes` e quatro `wf_*`) seguem lá, sem mudanças. Apagar é com ele.
8. **Gerar o prompt da F8.** Não há 7b.

## Nota para a F8

- **As páginas novas no service worker:** o precache precisa das 11 calculadoras, dos 2 hubs e do `/qr-code-generator/`. O motor delas está no arquivo comum das calculadoras, o mesmo das de dinheiro.
- **O QR offline:** a página monta o QR no aparelho, sem rede. O PNG sai do `<canvas>` e o SVG do nosso código, então os dois funcionam offline se a página e os 2 arquivos JS estiverem no cache. O teste offline deve ler o PNG baixado com o `jsqr`, como o `qr-code.spec.ts`.
- **O que a revisão da F8 deve olhar em casa e saúde:**
  - que o service worker nunca guarde a URL com o `#` do link do cenário (nas de saúde, ele leva sexo, idade, medidas e a forma de contar a data do parto);
  - que o "hoje" do Due date continue vindo do relógio do aparelho com a página do cache;
  - que a página offline não mostre calculadora sem o motor;
  - que as tabelas abertas e os campos estreitos (§ 275 e § 277) sigam cabendo a 320 px.
