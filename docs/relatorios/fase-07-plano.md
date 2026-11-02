# F7 · Plano: casa, saúde e o QR code, em inglês

Plano da run `fase-07`, escrito em 2/nov/2026 depois da exploração (9 agentes Sonnet: ficha, arquitetura, fontes de casa, fontes de saúde em três partes, QR, CI e DECISOES). Ele é o gabarito da revisão adversarial: cada critério do prompt aponta para o teste ou o comando que o prova. O prompt (`docs/prompts/prompt-fase-07.md`) vence este plano.

## 1. As páginas

Ordem pela regra do `data/README.md` (piso do volume × lance; sem lance conta 1; empate na ordem do csv).

| Id (rota = slug) | Caminho | Hub | Área | Ícone | Chips (`next`) | Relacionadas | Arquivo do PDF/CSV |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `square-footage-calculator` | `/square-footage-calculator/` | casa | `casa-saude` | `home` | paint, tile, concrete | tile, paint, concrete, mulch, btu | `square-footage` |
| `concrete-calculator` | `/concrete-calculator/` | casa | `casa-saude` | `calculator` | square footage, mulch | square footage, mulch, tile, paint, btu | `concrete-estimate` |
| `mulch-calculator` | `/mulch-calculator/` | casa | `casa-saude` | `calculator` | square footage, concrete | concrete, square footage, paint, tile, btu | `mulch-gravel-estimate` |
| `paint-calculator` | `/paint-calculator/` | casa | `casa-saude` | `calculator` | square footage, tile | square footage, tile, btu, concrete, mulch | `paint-estimate` |
| `tile-calculator` | `/tile-calculator/` | casa | `casa-saude` | `table` | square footage, paint | square footage, paint, concrete, mulch, btu | `tile-estimate` |
| `btu-calculator` | `/btu-calculator/` | casa | `casa-saude` | `home` | square footage, paint | square footage, paint, tile, concrete, mulch | `btu-estimate` |
| `bmi-calculator` | `/bmi-calculator/` | saúde | `casa-saude` | `heart` | body fat, calorie | body fat, calorie, ovulation, due date | `bmi-result` |
| `calorie-calculator` | `/calorie-calculator/` | saúde | `casa-saude` | `calculator` | bmi, body fat | bmi, body fat, ovulation, due date | `calorie-estimate` |
| `ovulation-calculator` | `/ovulation-calculator/` | saúde | `casa-saude` | `heart` | due date | due date, bmi, calorie, body fat | `ovulation-calendar` |
| `body-fat-calculator` | `/body-fat-calculator/` | saúde | `casa-saude` | `heart` | bmi, calorie | bmi, calorie, ovulation, due date | `body-fat-estimate` |
| `due-date-calculator` | `/due-date-calculator/` | saúde | `casa-saude` | `heart` | ovulation | ovulation, bmi, calorie, body fat | `due-date` |
| `home-calculators` | `/home-calculators/` | — | `casa-saude` | `home` | — | — | — |
| `health-calculators` | `/health-calculators/` | — | `casa-saude` | `heart` | — | — | — |
| `qr-code-generator` | `/qr-code-generator/` | nenhum | `utilidades` | `qr` | — | relacionadas de ferramentas | `qr-code.png`, `qr-code.svg` |

Tudo só em `en`, sem par no hreflang, indexável. O QR não tem hub: breadcrumb Home › QR code generator; entra pela home, pelo rodapé, pela busca e pelas relacionadas.

## 2. Interfaces

### 2.1 Registro (`src/tools/calc/registry.ts`, § 257)

Registro irmão do de dinheiro, como o brasileiro da F6, para nada do que lê `CALC_PAGES` (cronograma, presets, versão em espanhol) levar as páginas novas:

```ts
export const HOUSE_CALC_IDS = ['square-footage-calculator', 'concrete-calculator', 'mulch-calculator', 'paint-calculator', 'tile-calculator', 'btu-calculator'] as const;
export const HEALTH_CALC_IDS = ['bmi-calculator', 'calorie-calculator', 'ovulation-calculator', 'body-fat-calculator', 'due-date-calculator'] as const;
export type LifeCalcId = HouseCalcId | HealthCalcId;
export const HOUSE_HUB_ID = 'home-calculators'; export const HEALTH_HUB_ID = 'health-calculators';
export type LifeHub = 'house' | 'health';
export interface LifeCalcPageDef { id: LifeCalcId; path: string; hub: LifeHub; icon: IconName; next: readonly LifeCalcId[]; related: readonly LifeCalcId[]; file: string }
export const LIFE_CALC_PAGES: Record<LifeCalcId, LifeCalcPageDef>;
export type AnyCalcId = MoneyPageId | LifeCalcId;   // CalcDef.id, CalcPanelData.page, DEFS
export type CalcArea = 'money' | LifeHub; export function calcAreaOf(id: AnyCalcId): CalcArea;
export function moneyPage(id: AnyCalcId, lang: Lang): MoneyPage | null;   // as F7 só em 'en'
```

`HOME_CALC_IDS` continua sendo "as calculadoras de dinheiro da home". A área decide: o AdSlot (`dinheiro` ou `casa-saude`), a cor da categoria (`money` ou `home`, violeta só no preenchimento), o hub do breadcrumb, a lista de fontes do `gate:dinheiro-saude` (`ymylHubOf`) e o `WebApplication` (`FinanceApplication` ou `HealthApplication`/`UtilitiesApplication`).

### 2.2 Rotas (`src/i18n/routes.ts`)

`lifeRoutes()`: os dois hubs (`src/views/LifeCalculatorsView.astro`, textos `src/i18n/en/home-calculators.ts` e `health-calculators.ts`) e as 11 calculadoras (`src/tools/<id>/`, textos `src/tools/<id>/i18n/en.ts` + `src/tools/calc/i18n/en.ts`), todas `casa-saude`. O QR: `QR_ID = 'qr-code-generator'`, `src/tools/qr-code-generator/`, `utilidades`. `ymylHubOf(id)` devolve `money`, `house`, `health` ou `null`.

### 2.3 A definição de uma calculadora (o que cresce em `types.ts`)

- `NumberSpec.kind` ganha `'dec'` com `decimals` (uma medida: centésimos de pé, décimos de libra). O `DECIMALS` de dinheiro não muda; `decimalsOf(kind, decimals)` e `display(kind, value, lang, decimals)` cobrem a medida.
- `DateSpec { kind: 'date'; min: string; max: string }`: um dia "AAAA-MM-DD" do `<input type="date">` do navegador, entre dois dias fixos (2000-01-01 a 2099-12-31). No link vai como `d=2026-09-07`; o `readLink` confere que é um dia real e está na faixa.
- `ListSpec.pick`: o menu de cada linha (a forma da área), guardado como o índice da opção (`a0s=2`); `hide` esconde um item numa opção (o "width" do círculo). O rótulo do item pode depender da opção (`x-circle` antes de `x` nos textos).
- `Cell` ganha `{ scaled, decimals }` (uma medida na tabela, no CSV e no PDF sem separador de milhar no CSV).
- `CalcView.open`: a tabela é o próprio resultado (as áreas, os sacos, os ciclos, as datas) e aparece aberta, sem o botão de mostrar.
- `CalcDef.today`: a conta precisa do dia de hoje. `initial.today` é o dia do exemplo; a ilha põe o dia local do aparelho uma vez, depois da hidratação (`mount.ts`), sem passar pelo link e sem escrever nele.
- `CalcPanelData.cheer` (falso na saúde) e `CalcPanelData.cat` (`money` ou `home`).

Motor (`src/calc/home.ts`, `src/calc/health.ts`, `src/calc/dates.ts`, sem dependência): entra a entrada do oráculo, sai a saída do oráculo. Onde há π ou log10, a saída leva `exact` (o valor antes do arredondamento, em ponto flutuante); o `calc-oracle.test.ts` compara `exact` com tolerância de 1e-9 e o resto por igualdade.

## 3. As calculadoras: campos, faixas, convenção e fontes

Escalas: comprimento em centésimos de pé ou de polegada; área em centésimos de pé quadrado; peso e circunferência em décimos; datas "AAAA-MM-DD". Contas racionais em BigInt (numerador e denominador), arredondadas uma vez, metade para cima, na casa mostrada; o que se compra é o teto da conta exata. Conversões do NIST: 1 in = 2,54 cm; 1 lb = 0,45359237 kg; 1 ft = 12 in; 1 yd³ = 27 ft³; 1 ft³ = 1.728 in³; tonelada curta = 2.000 lb.

### Casa (só unidades dos EUA)

| Calculadora | Campos (chave: faixa) | Conta | Resultado | Fontes (lidas em 2/nov/2026) |
| --- | --- | --- | --- | --- |
| Square footage | lista `a` de 1 a 10 áreas; em cada uma, a forma `s` (retângulo, triângulo, círculo) e `x`, `y`: 0.01 a 300 ft | retângulo x·y; triângulo x·y÷2; círculo π·x²÷4 (x = diâmetro) | total em sq ft e sq yd (2 casas), tabela das áreas | Energy Star, "Room Air Conditioners" (passo 1: 12 ft 6 in = 12.5 ft; retângulo e triângulo); NIST OWM "Circumference, Area and Volume" (círculo) |
| Concrete | forma `sh` (laje ou sapata; redonda); `l`, `w`: 0.01 a 500 ft; `t` (espessura): 0.01 a 60 in; `d` (diâmetro) e `h` (profundidade): 0.01 a 240 in; `q`: 1 a 100; `wa` (folga): 0 a 50%; `y4`, `y6`, `y8` (rendimento dos sacos de 40, 60 e 80 lb): 0.01 a 5 cu ft, exemplos 0.30, 0.45 e 0.60 ("check the bag") | laje l·w·t÷12; redonda π·d²·h÷4÷1.728; × quantidade × (1 + folga) | cu yd e cu ft (com e sem folga), sacos de 40, 60 e 80 lb | NIST (caixa e cilindro; HB 44 para 27 ft³) |
| Mulch & gravel | material `m` (mulch, gravel); medida `mo` (comprimento e largura, ou área); `l`, `w`: 0.01 a 500 ft; `ar`: 0.01 a 250.000 sq ft; `de` (profundidade): 0.01 a 36 in; saco `bm` (mulch, exemplo 2 cu ft) e `bg` (gravel, exemplo 0.5 cu ft): 0.01 a 10 cu ft; densidade `dn` (gravel): 0.01 a 5 t/cu yd, exemplo 1.28 | área × profundidade ÷ 12 | cu yd, cu ft, sacos; no gravel, toneladas (cu yd × densidade, 2 casas) | NIST; EPA, "Standard Volume-to-Weight Conversion Factors" ("Gravel, loose: 1 cubic yard, 2,565 lb") para o exemplo da densidade |
| Paint | medida `mo` (perímetro × pé-direito, ou área); `pe`: 1 a 1.000 ft; `he`: 1 a 30 ft; `ar`: 1 a 20.000 sq ft; portas `dr`: 0 a 50, área `da`: 1 a 100 sq ft (exemplo 21); janelas `wi`: 0 a 100, área `wn`: 1 a 100 (exemplo 15); demãos `co`: 1 a 3; rendimento `cv`: 100 a 1.000 sq ft/gal (exemplo 350, "check the can") | (parede − aberturas) × demãos ÷ rendimento | galões (2 casas) e galões a comprar (teto); "nada a pintar" se as aberturas cobrem a parede | NIST (área); EPA (WPEM: 400 sq ft/gal de padrão; memorando de 2017: "250 to 400 square feet per gallon") |
| Tile | área `ar`: 0.01 a 20.000 sq ft; peça `tl` × `tw`: 0.5 a 96 in; folga `wa`: 0 a 50%; peças por caixa `pb`: 0 (não sei) a 500 | área × 144 × (1 + folga) ÷ (tl·tw); teto | peças e caixas; a junta fica fora da conta (premissa) | NIST (área, 144 in² = 1 ft²) |
| BTU (AC size) | área `ar`: 100 a 2.500 sq ft; sol `su` (normal, muita sombra, muito sol); pessoas `pe`: 1 a 20; cozinha `ki` (não, sim) | tabela da Energy Star, cada linha [de, até), a última até 2.500; depois −10% ou +10% sobre o valor da tabela; depois +600 por pessoa além de 2; depois +4.000 na cozinha (ordem fixa, § 260) | BTU por hora, inteiro, com os passos | Energy Star, "Room Air Conditioners" (a tabela e os ajustes; a cópia em "certified room AC" tem "34,00") |

### Saúde (só adultos)

| Calculadora | Campos | Conta | Resultado | Fontes |
| --- | --- | --- | --- | --- |
| BMI | unidade `u` (US, Metric; US padrão); US: `ft` 3 a 8, `in` 0 a 11.9, `lb` 55 a 1.000; Metric: `cm` 91.5 a 274.3, `kg` 25 a 453.5; idade `ag` 20 a 120 | 703 × lb ÷ in², ou kg ÷ m² | BMI com 1 casa e a faixa de adulto do CDC pelo valor mostrado (Underweight; Healthy Weight; Overweight; Obesity, Class 1 a 3), em texto | CDC, "Adult BMI Categories" (adultos de 20 anos ou mais), "BMI Frequently Asked Questions" (fórmulas, exemplo de 30.4, o que o BMI não mede), "About Body Mass Index" |
| Calorie (TDEE) | unidade; sexo `sx` ("Sex used by the formula": Female, Male); idade 19 a 78; altura e peso como no BMI; nível de atividade `pa`: 1.40 a 2.50 (exemplo 1.6) | Mifflin-St Jeor: 10·kg + 6,25·cm − 5·idade + 5 (homem) ou − 161 (mulher); gasto do dia = repouso × PAL | dois números em kcal por dia, inteiros; sem meta | PubMed 2305711 (Mifflin et al., 1990: amostra de 19 a 78 anos); NIH Body Weight Planner ("1.4 (sedentary) to 2.5 (very active)", padrão 1.6); apêndice do Hall (NIDDK: PAL = gasto total ÷ repouso, repouso pelo Mifflin-St Jeor) |
| Ovulation | primeiro dia da última menstruação `d` (2000-01-01 a 2099-12-31); ciclo `c`: 20 a 40 dias | ovulação no dia (ciclo − 14) do ciclo, isto é, início + ciclo − 15 dias; janela fértil = 5 dias antes e o dia da ovulação; próxima menstruação = início + ciclo | os próximos 6 ciclos a partir da data digitada | Office on Women's Health ("Ovulation calculator": ciclos de 20 a 40; "Trying to conceive"; "Your menstrual cycle"); NICHD ("About Menstruation": "Around day 12 to 14 in an average 28-day cycle") |
| Body fat | unidade; sexo; altura; pescoço, cintura (abdômen no homem) e quadril (mulher), US em polegadas (8 a 30, 15 a 80, 20 a 80) e Metric em cm (20 a 76, 38 a 203, 50 a 203); idade 18 a 120 | Hodgdon e Beckett (1984), em polegadas: homem 86,010·log10(abdômen − pescoço) − 70,041·log10(altura) + 36,76; mulher 163,205·log10(cintura + quadril − pescoço) − 97,684·log10(altura) − 78,387; o métrico é dividido por 2,54 antes | % com 1 casa, sem faixa; problema se a diferença for zero ou menor, ou se o resultado sair de 0,1% a 99,9% | Foulis et al. 2023 (PMC10282178) e Schuna 2013 (PMC4831679), que imprimem as equações; Exército, julho de 2026 (army.mil): o teste de fita foi trocado pela razão cintura-altura |
| Due date | método `m` (última menstruação, concepção, transferência de embrião de 3 dias, de 5 dias); data `d` (2000-01-01 a 2099-12-31); "hoje" do aparelho | + 280, + 266, + 263, + 261 dias; trimestres do NICHD: semana 1, semana 13 (dia 84) e semana 29 (dia 196); termo completo na semana 39 (dia 273) | data provável; idade gestacional hoje (de 0 a 300 dias; antes, "ainda não começou"; depois, "mais de 42 semanas"); tabela com o começo de cada trimestre | NICHD, "About Pregnancy" (40 semanas, trimestres 1 a 12, 13 a 28, 29 a 40); PMC4387083 (nuMoM2b: 266, 263, 261); PubMed 28426621 (resumo do ACOG CO 700: a ultrassonografia do começo prevalece) |

Regras de toda página de saúde: "for adults 18 and older", e a página diz o mínimo que vale e por quê (BMI 20, pelo CDC; Calorie 19, pela amostra do Mifflin; Body fat 18); nenhuma exclamação, elogio ou julgamento; nenhuma pose `cheer` (o sprite da página não a leva); o aviso diz que não é recomendação médica e manda procurar um profissional de saúde; nada de dieta, meta, "peso ideal", faixa de peso para a altura, déficit, remédio, diagnóstico, percentil infantil, semana a semana da gravidez ou uso como anticoncepcional.

Troca de unidade (§ 261): cada sistema tem os próprios campos e valores; trocar mostra os do outro sistema (o exemplo dele, ou o que a pessoa digitou nele antes), sem conversão, para o resultado nunca mudar por arredondamento de conversão.

Campo de data (§ 262): `<input type="date">` nativo, com `min` e `max`, rótulo e erro do FieldError; vazio, incompleto ou fora da faixa mostra o erro com a faixa e o resultado fica o último que deu certo. As datas da tela saem do `src/i18n/dates.ts`.

## 4. O QR code

- `src/tools/qr-code-generator/`: `QrPanel.tsx` (ilha), `mount.ts` (só `mountIsland`), `qr.ts` (matriz e desenho, sem DOM), `QrPage.astro` (o molde, com o único `<script>`), `i18n/en.ts`. Página `src/pages/qr-code-generator/index.astro`.
- `import { create } from 'qrcode/lib/core/qrcode.js'`; texto → `TextEncoder` → `create([{ data: bytes, mode: 'byte' }], { errorCorrectionLevel: 'H' })`. Vazio e acima de 1.273 bytes (a capacidade da versão 40 em H) dão o erro, sem QR. O erro diz o limite em caracteres e lembra que acento conta 2 e emoji 4.
- Desenho: módulos `#000000` sobre `#FFFFFF`, zona de silêncio de 4 módulos. A Oli (`docs/design/assets/Logo/app-icon.svg`, com o id do clip trocado) num quadro branco centrado, de lado ímpar em módulos, cerca de 22% do lado da matriz; opção ligada por padrão.
- PNG do canvas da página, em escala inteira de pixels por módulo: tamanhos "Small", "Medium" e "Large" com alvo de 512, 1.024 e 2.048 px, escala = máx(4, piso(alvo ÷ (módulos + 8))); a tela diz o tamanho real. SVG montado pelo nosso código, com o ícone dentro. Nomes `qr-code.png` e `qr-code.svg`.
- Baixar PNG é o amarelo; SVG é botão comum. A prévia é o SVG inline, refeita enquanto a pessoa digita.
- Eventos: `export_click` com `tool: 'qr-code-generator'` e `format: 'png' | 'svg'` (§ 263). Nada do texto vai a URL, evento, storage, cookie ou nome de arquivo; nenhuma requisição ao endereço digitado.
- Bundle: o `qrcode` sai de `devDependencies` para `dependencies`; o `dijkstrajs` entra em `BUNDLED_TRANSITIVE`; o `gate:licencas` ganha a guarda de que `qrcode` e `dijkstrajs` ficam fora do chunk `island` e num chunk só.

## 5. Hubs, home, rodapé, busca, 404 e institucionais

- `LifeCalculatorsView.astro` serve os dois hubs: `fo-hubband fo-cat--home` com H1, a grade na ordem do registro, um AdSlot `casa-saude` de conteúdo, "How these calculators work" com os blocos `data-ymyl` (formula, premises, example do motor, source, reviewed, disclaimer) e o AdSlot lateral. Schema `CollectionPage`, `BreadcrumbList`, `Person`.
- Home em inglês: seções "Home calculators", "Health calculators" e "QR code generator" depois da de dinheiro, sem anúncio.
- Rodapé em inglês: colunas "Home" (hub + 6) e "Health" (hub + 5), e o QR na coluna do site ou numa coluna "Utilities".
- Busca em inglês: categorias "Home calculators", "Health calculators" e "Utilities", com sinônimos ("square feet", "cubic yards", "AC size", "pregnancy", "body mass index"…). pt e es não mudam.
- Institucionais nos três idiomas (Privacidade, Termos, Licenças), com a "última atualização" nova onde o texto mudou:
  - Privacidade: as medidas, as datas e o texto do QR ficam no aparelho; o link do cenário só leva números e datas depois do `#`.
  - Termos: as calculadoras de saúde são educativas, não são recomendação médica; as de casa são estimativas, confira a embalagem e o profissional.
  - Licenças: `qrcode` e `dijkstrajs`.

## 6. Critério → prova

| Critério | Prova |
| --- | --- |
| 1. 14 páginas 200 com H1, título, descrição, `lang="en"`, canonical | `routes.test.ts`, `gate:seo`, `gate:conteudo`, `a11y.spec.ts`, curl na prévia |
| 2. Oráculo antes do motor; motores batem; mutante reprova; `--check` zero | `git log -- fixtures/calc src/calc src/tools/calc`; `calc-oracle.test.ts`; `CALC_FIXTURES_DIR`; os três scripts com `--check` |
| 3. QR lido pelo `jsqr` com os bytes exatos | `tests/e2e/qr-code.spec.ts` (PNG e SVG, com e sem Oli, 4 conteúdos, dois navegadores) e `tests/unit/qr.test.ts` |
| 4. Portões de conteúdo | `gate:dinheiro-saude` (contagem do mapa), `gate:conteudo`, `gate:prontidao`, `gate:seo`, `gate:links`, `gate:licencas` |
| 5. Privacidade | `money-life-privacy.spec.ts` (sentinelas, datas nas três formas) e `qr-code.spec.ts` |
| 6. ResultHero acima da dobra | `ads.spec.ts` (as páginas novas e os dois sistemas) |
| 7. Orçamento | `budgets.spec.ts` (2 JS, 80 KB), tabela antes e depois no relatório |
| 8. Anúncio e acessibilidade | `ads.spec.ts`, `a11y.spec.ts` |
| 9. Lighthouse do QR | `lighthouserc.json` com `/qr-code-generator/` |
| 10. Saúde sem meta, dieta, diagnóstico, exclamação ou `cheer` | `BANNED` do `ymyl.ts` com controles, `health-voice.test.ts`, `money-health.spec.ts` (sem `#oli-cheer` no sprite) |
| 11. CI em 13 partes, verde | `ci.yml`, `verificar.test.ts`, tabela do relatório |
| 12. `pnpm verificar` verde | saída no relatório (ou as 13 partes em sequência) |
| 13. Só o `qrcode` em `dependencies` | diff do `package.json` e do lockfile |
| 14. Prévia | `build.txt` e Playwright na prévia a 360 e 1280 px |
| 15. Teste de 90 dias | § no DECISOES.md |

## 7. As 13 partes do CI

Projeção da exploração (tempos da run 41410030945): Chromium em 4 com pior parte de ~560 s (o `a11y` inteiro na 1/4); WebKit em 8 com pior parte de ~720 s na 7/8 (a `pdf-matrix` inteira com o `money-privacy` e o `money-calc`). Os specs novos se chamam `money-health.spec.ts`, `money-home.spec.ts`, `money-life-privacy.spec.ts` e `qr-code.spec.ts`, depois do `image-matrix.spec.ts`. Antes de cada push com testes novos: `--list` das 4 e das 8 partes; o `design.spec.ts` e o `image-matrix.spec.ts` em partes diferentes do WebKit. Uma parte acima de 700 s ganha a medida e a proposta num §; acima de 900 s, divide-se mais nesta PR.

## 8. Ordem de construção

1. CI (feito), registro, rotas e as listas de fontes do portão (feito).
2. Oráculo e fixtures (feito, `639e934`).
3. Infra da ilha (medida, data, menu da linha, tabela aberta, hoje, área), motores, definições: BMI, Calorie, Due date; depois o QR; Square footage e Concrete; Ovulation e Body fat; Paint e BTU; Mulch & gravel e Tile.
4. Hubs, home, rodapé, busca, 404 e institucionais.
5. Testes que crescem, Lighthouse, screenshots, `--list`.
6. Revisão adversarial (7 lentes), correções, segunda passada, relatório, PR.

Os textos das 6 de casa e do QR vão para agentes `opus` em paralelo, cada um dono dos próprios arquivos; os textos de saúde e dos hubs ficam no agente principal.
