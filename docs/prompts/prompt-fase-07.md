# F7 · Casa, saúde e QR code em inglês

Prompt da run `fase-07` do FileOrca, gerado com a skill prompt-ultracode em 2/nov/2026. Ele parte da ficha "F7 · Casa e saúde em inglês" do PLANO-FILEORCA.md e do estado da main em `048a3dd`, o commit que o seu `git pull` trouxe depois da F6.

O que entrou na conversa:

- **Lido antes de escrever:**
  - a ficha F7 e as seções "Catálogo por fase", "Regra das calculadoras", "Molde da página de calculadora", "Confiança em dinheiro e saúde", a mascote e "Backlog com gatilho" do plano;
  - o `CLAUDE.md` até a seção da F6 e o `DECISOES.md` até o § 256;
  - o relatório e a revisão da F6, em especial a nota para a F7, a § 236 (o arquivo comum das calculadoras) e a § 243 (o Chromium acima de 700 s);
  - o `data/keywords.csv`: as 12 linhas da F7 têm `entra`;
  - o `ci.yml`, o registro das calculadoras, o `ENGINES`, o portão `scripts/lib/ymyl.ts`, o `astro.config.ts`, o `package.json` e o `.claude/settings.json`.
- **As suas duas decisões nesta conversa:**
  - a F7 já divide o CI (o Chromium em 4 partes e o WebKit em 8). A PR muda o `ci.yml`, então o merge final é seu;
  - as calculadoras de saúde aceitam unidades dos EUA e métricas; as de casa ficam só nas unidades dos EUA.
- **As fontes que conferi por cima:**
  - a tabela de área × BTU da Energy Star, com os ajustes de sombra, sol, pessoas e cozinha;
  - a ACOG 700: DUM + 280 dias, e FIV com 261 ou 263 dias;
  - a DoDI 1308.03 de 2022 e o teste de um ponto do Exército (2023 e 2024): o método da Marinha com 2 e 3 medidas não é mais o padrão militar, e a página não pode dizer que é.

  A run lê tudo de novo na fonte.
- **O tamanho:** 14 páginas novas, só em inglês: 11 calculadoras, o gerador de QR code e 2 hubs.
- **Fora desta run:** pt e es dessas páginas (backlog), guias novos, a 2b, os baixos das revisões da F4 à F6 e a § 103.

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F7 do FileOrca: casa, saúde e o QR code, em inglês. Ao terminar:

- estão no ar, só em inglês e indexáveis:
  - as 6 calculadoras de casa (Square footage, Concrete, Mulch & gravel, Paint, Tile e BTU) e o hub `/home-calculators/`;
  - as 5 de saúde (BMI, Calorie, Ovulation, Body fat e Due date) e o hub `/health-calculators/`;
- cada calculadora recalcula enquanto a pessoa digita, exporta PDF e CSV e bate com um oráculo independente, gravado num commit antes de qualquer motor;
- está no ar o gerador de QR code (`/qr-code-generator/`). Ele monta no navegador o QR do texto da pessoa, com a Oli no meio, e baixa em PNG e em SVG. O QR baixado, lido de volta pelo `jsqr` no teste, devolve o texto exato;
- a home, o rodapé, a busca e o 404 em inglês levam às páginas novas. Privacidade, Termos e Licenças dizem o que mudou, nos três idiomas;
- o CI roda em 13 partes (o `verificar`, o Chromium em 4 e o WebKit em 8), todas verdes;
- o DECISOES.md tem a data de início do teste de 90 dias de casa e saúde.

Nada é enviado nem publicado. O `pnpm verificar` fica verde na sua máquina e em todas as partes do CI. Tudo vai numa PR da branch `fase-07`, com o relatório.

A PR muda o `.github/workflows/ci.yml`, então o job de merge não a mescla e comenta isso na PR, como esperado. A run termina com a PR pronta e o CI verde, e o merge é do Victor.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, e o shell é o Git Bash. O CI roda em Ubuntu.

A main está em `048a3dd`, o merge da F6, ou num commit mais novo. Confira com `git log --oneline -8`.

O que está no ar em fileorca.com:

- em inglês:
  - imagem: 8 ferramentas, 3 presets e o hub;
  - PDF: 12 ferramentas e o hub;
  - dinheiro: 14 calculadoras, 4 presets, o hub e 5 guias;
  - 10 guias de arquivo;
- em pt e es:
  - imagem e PDF;
  - o dinheiro: 8 calculadoras adaptadas em pt e 5 traduzidas em es;
  - o Pix (só em pt) e as institucionais.

O que a F7 reaproveita (leia o código antes de planejar):

- **O molde e a ilha das calculadoras** (§ 110, § 117 e § 236):
  - `src/tools/calc/CalcTool.astro` e `CalcIsland.astro`: uma entrada `mount.ts` para todas as calculadoras, e toda página de calculadora carrega 2 arquivos JS;
  - `CalcPanel.tsx`, `CalcField.tsx` e `ExportBar.tsx`;
  - as definições em `src/tools/calc/defs/` e o registro `src/tools/calc/registry.ts`.

  Atenção: `HOME_CALC_IDS` já existe e quer dizer "as calculadoras da página inicial". As calculadoras de casa precisam de outro nome (por exemplo, `HOUSE_CALC_IDS`).
- **Os motores** em `src/calc/`:
  - sem dependência nenhuma (regra do ESLint, testada em `quality.test.ts`);
  - o `ENGINES` de `src/calc/index.ts`;
  - o parser `src/calc/parse.ts` (§ 112): lê direto para inteiro escalado, sem `parseFloat` nem `Intl`.
- **O oráculo:**
  - `scripts/oracle/calc.py` e `calc_br.py`;
  - as fixtures em `fixtures/calc/` e o `fixtures/calc/OFICIAIS.md`;
  - o `tests/unit/calc-oracle.test.ts`, que confere o SHA-256 do script e roda o mutante pelo `CALC_FIXTURES_DIR`.
- **O PDF e o CSV:** o relatório em `src/engine/pdf/report.ts` (Letter em inglês, só WinAnsi) e o CSV em `src/tools/calc/exports.ts` (§ 115 e § 222).
- **O link do cenário** (§ 114 e § 128) e **os eventos** em listas fechadas (§ 113, `src/analytics/tool-ids.ts` e `events.ts`).
- **O portão de confiança** `scripts/lib/ymyl.ts` (`gate:dinheiro-saude`):
  - ele já conta toda rota indexável com `adArea: 'casa-saude'`;
  - ele já tem a lista de fontes oficiais de `health`: `cdc.gov`, `who.int`, `nih.gov` e `gov.br`;
  - ele não tem lista para casa.
- **As rotas e os anúncios:** `src/i18n/routes.ts` (o `AdArea` já tem `casa-saude` e `utilidades`) e os slots por área em `src/ads/config.ts`.
- **O design:**
  - os ícones `home`, `heart`, `calculator` e `qr` já existem em `docs/design/assets/Icons/`;
  - a categoria casa e saúde é violeta, e utilidades é lima (só preenchimento, nunca texto).
- **O QR do Pix** (F6, § 216): o `qrcode` 1.5.4 e o `jsqr` 1.4.0 estão em `devDependencies`. O QR é montado no build e lido de volta em `tests/unit/pix-qr.test.ts`.

O CI na última execução verde da F6 ([run 41410030945](https://github.com/vmatusita/fileorca/actions/runs/41410030945), commit `a6ed5c5`), pelo total do `verificar` de cada parte:

- `verificar` (`--sem-playwright`): 583,6 s;
- Chromium, 3 partes: 663,0 s, 349,4 s e 727,3 s;
- WebKit, 7 partes: 553,7 s, 510,3 s, 271,4 s, 308,7 s, 544,8 s, 697,6 s e 580,1 s.

Cada execução gastou uns 110 min de runner. O repositório é privado, no GitHub Free, com 2.000 min por mês. O `pnpm verificar` local inteiro da F6 passou de 900 s (§ 242), e as partes rodaram em sequência.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da run e vence o resto.
2. O `CLAUDE.md` inteiro, em especial:
   - "Como acrescentar uma calculadora" e as pegadinhas da F4;
   - as partes do CI (ADR-003, F5a e F6);
   - o método da revisão (F3);
   - a seção da F6.
3. O `PLANO-FILEORCA.md`. A ficha "F7 · Casa e saúde em inglês" do apêndice é o contrato, e as "Decisões fechadas" não mudam. Leia também:
   - "Catálogo por fase", "Regra das calculadoras" e "Molde da página de calculadora";
   - "Confiança em dinheiro e saúde" e "O que derruba conta";
   - a mascote (as nove poses e as regras de anúncio) e "Backlog com gatilho".
4. O `DECISOES.md`, do § 1 ao último. O próximo § livre é o 257, se nada entrou depois da F6. Esta run toca mais estes:
   - § 4, § 6, § 10, § 13, § 68 a § 71 e § 92 a § 96;
   - § 108, § 110 a § 129 e § 136 a § 142;
   - § 154, § 160, § 171, § 181, § 207, § 223, § 233, § 236, § 238, § 242 e § 243.
5. O `docs/design/`, que é só leitura:
   - o README: a voz, uma exclamação por tela e as falas da Oli;
   - o NumberField, o OptionGroup, o ResultHero, o ExportBar, o AdSlot e o ToolCard;
   - o ícone do app em `assets/Logo/`.
6. O relatório e a revisão da F6: as notas para a F7 e para a F8.
7. O código citado acima e os testes que leem os registros:
   - e2e: `a11y`, `ads`, `budgets`, `events`, `navigation` e os `money-*`;
   - unidade: `calc-defs`, `calc-oracle`, `calc-report`, `consent`, `routes`, os `seo-*`, `conteudo`, `prontidao`, `quality`, `launch-kit` e `verificar`.

Você pode ler a web (WebSearch e WebFetch) para as fontes oficiais e a documentação dos pacotes. Ler não é mandar pedido a um serviço: não entre em conta, não crie conta e não preencha formulário.

# Escopo

Dentro, em itens:

1. A divisão do CI, logo no começo (decisão 10).
2. As rotas, os registros e as áreas das páginas novas (decisão 1).
3. O oráculo de casa e saúde, num commit antes de qualquer motor (decisão 4).
4. As 11 calculadoras: motores, definições, textos, PDF e CSV (decisões 2, 3, 5, 6 e 7).
5. O gerador de QR code (decisão 8).
6. Os hubs, a home, o rodapé, a busca e o 404 em inglês, e as institucionais nos três idiomas (decisão 9).
7. Os portões e os testes que crescem (decisão 11).
8. A data do teste de 90 dias (decisão 12).
9. O Lighthouse, os screenshots, a revisão adversarial final, as correções, o relatório e uma seção nova no fim do `CLAUDE.md`.

Fora (não toque):

- Tudo da seção "Fora de toda run" do `CLAUDE.md`. Em especial: não mande nada a nenhum serviço, não crie conta e não publique.
- Do `.github/`, tudo menos o `ci.yml`, e no `ci.yml` só as partes (decisão 10). Também `scripts/ci/`, `PLANO-FILEORCA.md`, `docs/adr/ADR-001-plataforma-de-entrega.md`, `.githooks/` e `.claude/settings.json`.
- O `docs/design/`, que é só leitura: nenhum ícone, pose, cor, raio ou sombra nova. O amarelo (`sun`) vai só no Baixar.
- Versões em pt ou es das páginas novas. O plano deixa casa e saúde em pt e es no backlog, com o gatilho do teste de 90 dias. Também ficam fora guias novos e presets.
- Na saúde:
  - dieta, meta de peso, faixa de "peso saudável" para a altura, déficit ou superávit de calorias, macros e "peso ideal";
  - remédio, diagnóstico e percentil infantil;
  - conteúdo médico de semana a semana da gravidez, e qualquer uso como método anticoncepcional.

  Nenhum texto diz o que a pessoa "deve" fazer com o resultado, além de procurar um profissional de saúde.
- No QR:
  - outros tipos (Wi-Fi, vCard, e-mail, telefone);
  - cores, logo da pessoa, QR dinâmico e encurtador;
  - abrir, buscar ou validar na rede o endereço digitado;
  - link do cenário: a página do QR não tem.
- Os motores que já existem: dinheiro, imagem e PDF.
  - O `report.ts` pode ganhar o relatório das calculadoras novas.
  - O PDF e o CSV das calculadoras que já existem não mudam: os testes de hoje passam sem mudar asserção.
- Dependências: nenhum pacote novo. Só o `qrcode` passa de `devDependencies` para `dependencies` (decisão 8), e o `pnpm-lock.yaml` muda só por isso.
- A 2b, os baixos das revisões da F4 à F6, a § 103 e as propostas da § 242.
- Tirar, pular, afrouxar ou mudar o sentido de teste que já existe. Uma asserção que muda por construção ganha um § no modelo da § 171. Exemplos: as contagens da busca, do sitemap e do kit do Product Hunt.
- No `CLAUDE.md`, só uma seção nova no fim. No `DECISOES.md`, só § novos.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do próximo § livre)

1. **As páginas.**
   - **Os 12 itens da F7** do `data/keywords.csv` têm `entra`. Os caminhos são os slugs do csv:

     | Página | Caminho | Área de anúncio | Hub |
     | --- | --- | --- | --- |
     | Square footage | `/square-footage-calculator/` | `casa-saude` | casa |
     | Concrete | `/concrete-calculator/` | `casa-saude` | casa |
     | Mulch & gravel | `/mulch-calculator/` | `casa-saude` | casa |
     | Paint | `/paint-calculator/` | `casa-saude` | casa |
     | Tile | `/tile-calculator/` | `casa-saude` | casa |
     | BTU (AC size) | `/btu-calculator/` | `casa-saude` | casa |
     | BMI | `/bmi-calculator/` | `casa-saude` | saúde |
     | Calorie (TDEE) | `/calorie-calculator/` | `casa-saude` | saúde |
     | Ovulation | `/ovulation-calculator/` | `casa-saude` | saúde |
     | Body fat | `/body-fat-calculator/` | `casa-saude` | saúde |
     | Due date | `/due-date-calculator/` | `casa-saude` | saúde |
     | Hub de casa | `/home-calculators/` | `casa-saude` | — |
     | Hub de saúde | `/health-calculators/` | `casa-saude` | — |
     | QR code generator | `/qr-code-generator/` | `utilidades` | nenhum |

   - **Idioma e ids.** Tudo só em `en`, sem par no hreflang. O id de rota é o slug (regra da § 110).
   - **A ordem nos hubs** e na tabela acima segue a regra do `data/README.md`: o piso do volume vezes o lance, e sem lance conta 1. O Due date tem lance de 0,36 e fica em último.
   - **O QR não tem hub.** Ele entra pela home, pelo rodapé, pela busca e pelas relacionadas, com o breadcrumb Home › QR code generator.
   - **O nome do Mulch & gravel.** A página cobre os dois materiais, e o slug fica `mulch-calculator`. O título e o H1 seguem a regra do título (começa pelo nome) e a § 122.
   - **O registro.** Onde a área, o hub e o grupo de cada calculadora moram é escolha da run, registrada. Pode ser o `CALC_PAGES` estendido ou um registro irmão. O que não muda: uma ilha só para todas as calculadoras (decisão 6).

2. **As unidades** (decisão do Victor).
   - **Saúde.** BMI, Calorie e Body fat têm um OptionGroup "US / Metric", com US como padrão.
     - No US: a altura em pés e polegadas (dois campos), o peso em libras e as circunferências em polegadas.
     - No métrico: centímetros e quilos.
   - **Casa** fica só nas unidades dos EUA: pés, polegadas, sq ft, cu yd, galões, libras e BTU/h.
   - **As conversões são exatas** e vêm do NIST, lido nesta run: 1 in = 2,54 cm; 1 lb = 0,45359237 kg; 1 ft = 12 in; 1 yd³ = 27 ft³; 1 galão dos EUA = 231 in³.
   - **A unidade escolhida** não fica guardada no aparelho; ela vai no link do cenário.
   - **Trocar de unidade** converte o que já está digitado ou volta ao exemplo da unidade. A run escolhe, registra e testa.

3. **A aritmética.** Ela vale para o motor e para o oráculo.
   - **Sem `parseFloat`.** O número digitado entra pelo `parse.ts`, como inteiro escalado.
   - **Conta exata.** Área, volume, unidades, BMI e calorias são contas racionais exatas, em BigInt (numerador e denominador), arredondadas uma vez só, no fim, metade para cima, na casa que a página mostra.
   - **As casas:**
     - BMI com 1 casa;
     - calorias inteiras;
     - gordura corporal com 1 casa;
     - área e volume com 2 casas;
     - galões com 2 casas;
     - BTU inteiro, pela regra da decisão 5.
   - **O que se compra** (galões, caixas, sacos, peças) é o teto da conta exata.
   - **Irracionais.** Onde entra π (círculo) ou log₁₀ (Body fat):
     - o motor usa `Math.PI` e `Math.log10` em ponto flutuante;
     - o oráculo usa `decimal` com 50 dígitos;
     - o teste exige o valor mostrado igual e a diferença antes do arredondamento menor que 1e-9;
     - o oráculo tira da grade os casos a menos de 1e-9 de um empate de arredondamento e grava quantos tirou.
   - **Datas** são números inteiros de dias do calendário gregoriano, nunca `Date` com fuso no motor.
     - "Hoje" é a data local do aparelho, lida uma vez pela ilha e passada ao motor como parâmetro.
     - Os testes fixam o relógio (`page.clock` no Playwright e o parâmetro no Vitest).

4. **O oráculo vem antes do motor.**
   - **O script.** Um script novo, só com a biblioteca padrão (`fractions`, `decimal` e `datetime`). Por exemplo, `scripts/oracle/calc_home_health.py`.
     - Ele roda com `uv run --no-project --python 3.13 python -I scripts/oracle/<script>.py`.
     - O `--check` compara sem gravar, e o `--only <id>` faz uma calculadora.
   - **As fixtures** entram em `fixtures/calc/<id>.json`, no formato que o `calc-oracle.test.ts` já lê. O cabeçalho traz o SHA-256 do script e a versão do Python.
   - **O commit.** As fixtures entram num commit antes de qualquer arquivo de motor ou de definição das calculadoras novas. O relatório prova com `git log -- fixtures/calc src/calc src/tools/calc`.
   - **As fixtures de hoje** não mudam. O `--check` dos três scripts dá zero no fim.
   - **A grade de cada calculadora:** casos de canto (os limites das faixas), aleatórios com a semente `2026-11-02/<id>` e o `page-example` (o exemplo inicial da página). Nas de saúde, os dois sistemas de unidade.
   - **Exemplos oficiais.** Um exemplo resolvido de fonte oficial que bate com a convenção entra como caso marcado, e o que não bate vai para o `fixtures/calc/OFICIAIS.md`, com o motivo. Exemplos:
     - o exemplo de BMI do CDC;
     - os 261 e 263 dias da FIV na ACOG 700;
     - as linhas da tabela da Energy Star.
   - **Tabelas.** O oráculo transcreve da fonte, à parte, toda tabela que a conta usa (a da Energy Star, as faixas do CDC). Ele nunca importa nada de `src/`.
   - **O mutante.** Uma cópia das fixtures com um valor mudado (`CALC_FIXTURES_DIR`) reprova o `calc-oracle.test.ts` (saída no relatório).

5. **As 11 calculadoras.** O que está aqui é a convenção de partida. A run confere cada uma na fonte lida, e o que mudar vai para as premissas da página e para um §.
   - **Fontes.** Cada página cita a fonte oficial lida nesta run, com o link e a data da leitura.
     - O portão ganha a lista de fontes de casa: `energystar.gov`, `energy.gov` e `nist.gov`.
     - A de saúde ganha o que for preciso: por exemplo, `dtic.mil` para o relatório da Marinha, `womenshealth.gov` ou `medlineplus.gov`.
     - Cada domínio novo entra com teste e §.
     - Nunca use site de terceiro como fonte. O que não abrir vira pendência.

   **Casa** (só unidades dos EUA):

   1. **Square footage.**
      - Uma lista de 1 a 10 áreas, no modelo da lista de dívidas (§ 114, chaves `a0…`). Cada área é um retângulo (comprimento × largura), um triângulo (base × altura ÷ 2) ou um círculo (pelo diâmetro).
      - As medidas vão em pés, com decimais.
      - O resultado é o total em sq ft e em sq yd, com a tabela das áreas.
      - Fonte: as fórmulas de área da Energy Star e as unidades do NIST.
   2. **Concrete.**
      - A forma é laje ou sapata (comprimento × largura × espessura em polegadas) ou redonda (diâmetro × profundidade), com a quantidade e uma folga em %.
      - O resultado é o volume em cu yd e em cu ft e os sacos de 40, 60 e 80 lb.
      - O rendimento de cada saco é campo, com o exemplo rotulado ("check the bag").
   3. **Mulch & gravel.**
      - O material (mulch ou gravel), a área (comprimento × largura ou sq ft) e a profundidade em polegadas.
      - O resultado é o volume em cu yd e em cu ft, e os sacos, com o tamanho do saco como campo.
      - No gravel, também as toneladas: o volume vezes a densidade, que é campo com o exemplo rotulado.
   4. **Paint.**
      - A área das paredes (o perímetro × o pé-direito, ou a área digitada) menos as portas e as janelas (a quantidade × a área de cada uma, com o exemplo rotulado).
      - As demãos, de 1 a 3, e o rendimento por galão como campo, com o exemplo rotulado ("check the can").
      - O resultado é o número de galões (2 casas) e os galões a comprar.
   5. **Tile.**
      - A área, o tamanho da peça em polegadas, a folga em % e as peças por caixa (opcional).
      - O resultado é o número de peças e de caixas a comprar.
      - A junta fica fora da conta, e a premissa diz isso.
   6. **BTU (AC size).**
      - A tabela de área × capacidade da página da Energy Star para ar-condicionado de janela, lida nesta run, de 100 a 2.500 sq ft. Se a página ainda trouxer o "34,00" da última linha (erro de digitação), a run registra como o leu.
      - Os ajustes da Energy Star: menos 10% com muita sombra, mais 10% com muito sol, mais 600 BTU por pessoa além de 2 e mais 4.000 BTU na cozinha.
      - A ordem dos ajustes e o arredondamento ficam fixos e registrados.
      - Fora da faixa, o erro diz a faixa.

   **Saúde** (US e métrico nas três primeiras):

   7. **BMI.**
      - A fórmula do CDC: 703 × lb ÷ in², ou kg ÷ m².
      - As faixas de adulto do CDC, ditas em texto e nunca só por cor.
      - A nota do CDC sobre o que o BMI não mede.
      - Sem faixa de peso para a altura (escopo).
   8. **Calorie (TDEE).**
      - O gasto em repouso pela equação de Mifflin-St Jeor (o artigo original, no `nih.gov`), com sexo, idade, altura e peso.
      - O gasto do dia é o gasto em repouso vezes o fator de atividade. Os fatores vêm de uma fonte oficial lida nesta run. Se ela não existir, o fator é um campo, com os valores de uso comum como exemplos rotulados e a origem deles dita na página.
      - O resultado são os dois números, em kcal por dia, sem meta nenhuma.
   9. **Ovulation.**
      - A data da última menstruação e a duração do ciclo, na faixa que a fonte lida der.
      - O resultado são os próximos 6 ciclos, cada um com a janela fértil (os 5 dias antes da ovulação e o dia dela), a ovulação estimada (a próxima menstruação − 14 dias) e a próxima menstruação.
      - A página diz que é estimativa, que ciclos irregulares erram mais e que não serve para evitar gravidez.
   10. **Body fat.**
       - O método de circunferência da Marinha (Hodgdon e Beckett, Naval Health Research Center, 1984): pescoço e cintura no homem; pescoço, cintura e quadril na mulher; e a altura.
       - A conta vai pelas fórmulas em polegadas, e o métrico é convertido antes.
       - O resultado é o percentual, sem faixa nem classificação.
       - A página diz, pela fonte lida, que as Forças Armadas dos EUA hoje usam outros métodos. Ela nunca chama o resultado de padrão militar atual.
   11. **Due date.**
       - O método principal é a DUM + 280 dias (regra de Naegele), pela ACOG 700 (no site da ACOG ou no PubMed) e por uma fonte oficial do `nih.gov`, que é a que o portão conta.
       - Também por concepção (+ 266 dias) e por transferência de embrião na FIV (dia 3: + 263; dia 5: + 261), se a fonte lida sustentar.
       - O ajuste pela duração do ciclo entra só se uma fonte oficial lida o sustentar; senão, a página diz que a regra supõe ciclo de 28 dias.
       - O resultado é a data provável, a idade gestacional "hoje" (semanas e dias, dentro da faixa) e o começo de cada trimestre pela definição da fonte.
       - A faixa da data e o que acontece fora dela ficam fixos e registrados.

   **Regras de toda página de saúde:**
   - **Só adultos.** A página diz "for adults 18 and older".
     - A página cuja fórmula usa a idade (Calorie) ou que mostra faixa de adulto (BMI e Body fat) tem o campo de idade e não calcula abaixo do mínimo.
     - O mínimo é 18 (plano), ou a idade adulta que a fonte oficial da fórmula fixar, se for maior: o CDC fala em adultos de 20 anos ou mais para as faixas do BMI. A página diz qual mínimo vale e por quê, e a § registra.
     - Ovulation e Due date não pedem idade.
   - **O sexo.** Onde a fórmula pede sexo, o rótulo diz que é o dado da fórmula (por exemplo, "Sex used by the formula").
   - **O tom.**
     - Nenhuma exclamação e nenhum elogio ou julgamento no resultado.
     - A Oli não comemora resultado de saúde: a pose `cheer` fica fora das páginas de saúde.
     - Os nomes das faixas são os do CDC.
   - **O aviso.** O aviso de ferramenta educativa diz que a página não é recomendação médica e manda procurar um profissional de saúde.

6. **O molde e a ilha.**
   - **O molde** é o da F4: `CalcTool.astro` com os blocos `data-ymyl`, o "Reviewed by … on … First published …" no dia de Brasília (§ 207 e § 223), o selo "Your numbers stay on your device", o ResultHero, o ExportBar e os chips.
     - SplitChart, ScenarioCompare e AmortTable só onde houver o que mostrar.
     - As tabelas de resultado (as áreas, os sacos, os ciclos, os trimestres) usam a moldura de tabela que já existe (§ 129).
   - **Peça nova.** O que não existe no design system (por exemplo, o campo de data) é feito só com tokens e registrado no modelo da § 181.
     - O campo de data é `<input type="date">` ou três campos. A run escolhe, registra e prova nos dois navegadores.
     - As datas que a página mostra saem por extenso pelo `src/i18n/dates.ts`, sem `Intl`.
   - **No celular,** o número do ResultHero fica acima de 740 px, a 360 × 740 (§ 124). Isso pede no máximo duas linhas de dois campos de meia largura, com o rótulo numa linha só, e o resto depois do resultado. O OptionGroup de unidade e o de forma contam nessa altura: meça nos dois navegadores.
   - **Faixas fixas.** Cada campo tem a dele, e o erro diz a faixa (§ 116). O exemplo inicial é rotulado como exemplo e é o `page-example` do oráculo.
   - **O PDF** sai em Letter, com os textos em inglês. **O CSV** sai no formato do inglês (§ 115). Os dois têm nomes fixos no registro e são lidos de volta no teste contra o oráculo.
   - **O link do cenário** segue a § 114: a página nunca escreve na URL, e o `#` só sai pelo botão. A unidade e a forma vão no link.
   - **A Oli.** Nas de casa, a comemoração é a da F4 (§ 140). Nas de saúde, nenhuma.
   - **Os eventos:** os ids novos entram em `CALC_EVENT_TOOLS`, em lista fechada (§ 113).
   - **A ilha.** As calculadoras novas entram no `mount.ts` comum (§ 110 e § 236), e cada página continua com 2 arquivos JS.
     - O relatório mede o JS inicial (gzip) de uma calculadora de dinheiro antes e depois.
     - Se ele passasse dos 80 KB do orçamento, não afrouxe nada: escreva uma ADR "Proposta" da separação por região, corte pela válvula o que for preciso e registre.

7. **Confiança (YMYL).**
   - **Os blocos.** Toda página de calculadora de casa e de saúde, e os dois hubs, passam no `gate:dinheiro-saude`, com os blocos `formula`, `premises`, `example` (resolvido pelo motor), `reviewed`, `disclaimer` e o link para fonte oficial.
   - **As listas de fontes.** O portão escolhe a lista pelo hub da página (casa ou saúde), com teste. O hub de cada um tem o "How these calculators work" com os blocos, como o hub de dinheiro (§ 118).
   - **Texto proibido.** A lista `BANNED` do portão ganha, com controles positivo e negativo, as frases proibidas da saúde. Exemplos: meta de perda de peso, "you should lose", "ideal weight", "eat … calories to lose" e "birth control".

8. **O gerador de QR code.**
   - **A biblioteca.** O `qrcode` (MIT) passa para `dependencies` e vai para o navegador, só nesta página.
     - A `/licenses` lista o `qrcode` e todo módulo dele que entrar no bundle, nos três idiomas.
     - O `gate:licencas` lê o registro do bundle.
     - Nenhum outro pacote entra.
   - **A ilha.** A página tem a própria entrada (`src/tools/qr-code-generator/mount.ts`) e carrega exatamente 2 arquivos JS: a entrada e o chunk `island`.
     - O `qrcode` não pode cair no chunk `island`, que vai para todas as ferramentas: o `budgets.spec.ts` prova que as páginas de imagem e de PDF não mudam de tamanho.
     - A § 184 avisa: dois `<script>` que importam o mesmo módulo criam um terceiro arquivo.
   - **O campo** é um texto ou um endereço, numa caixa de texto. O tamanho máximo é fixo e o erro diz o limite.
     - O máximo é o maior que o teste de leitura prova com a Oli no meio, na versão mais densa e no menor tamanho de PNG oferecido.
     - Texto vazio não gera QR.
   - **A saída.**
     - Correção de erro H, sempre. Módulos pretos sobre branco, com a zona de silêncio de 4 módulos.
     - A Oli no meio é o ícone do app (`docs/design/assets/Logo/`), num quadro branco, no tamanho que a leitura prova. Ela é opção, ligada por padrão (plano), e desligada o QR sai sem logo.
     - O PNG sai do canvas, no tamanho escolhido (opções fixas, por exemplo 512, 1024 e 2048 px). O SVG é montado pelo nosso código, com o ícone dentro.
     - Nomes fixos: `qr-code.png` e `qr-code.svg`.
   - **A tela.**
     - A prévia aparece enquanto a pessoa digita.
     - O Baixar PNG é o amarelo; o SVG é um botão comum.
     - A Oli e os anúncios seguem as regras de distância. Uma exclamação por tela.
   - **Privacidade.** O texto da pessoa não sai do aparelho:
     - nada na URL, no GA4, nos storages, nos cookies nem no nome do arquivo;
     - nenhuma requisição ao endereço digitado.

     Os eventos levam só o id da página e o formato, em lista fechada.
   - **O molde.** A página tem os blocos de conteúdo que o `gate:conteudo` pede (como usar, perguntas, privacidade e relacionadas) e passa no `gate:prontidao`.

9. **Hubs, home, rodapé, busca, 404 e institucionais.**
   - **Os dois hubs** seguem o molde do `/money-calculators/` (§ 118): o `fo-hubband` com H1, a grade na ordem da decisão 1, um AdSlot de conteúdo e o "How these calculators work". Os dois têm schema `CollectionPage`, `BreadcrumbList` e `Person`.
   - **A home em inglês** ganha as seções de casa, de saúde e do QR code, no modelo da seção de dinheiro (§ 118 e § 160), sem anúncio.
   - **O rodapé em inglês** ganha as colunas do que entrou. Nenhuma página fica órfã.
   - **A busca em inglês** ganha as categorias "Home calculators", "Health calculators" e "Utilities", com sinônimos (por exemplo, "pregnancy", "AC size", "cubic yards"). O 404 em inglês busca nelas.
   - **pt e es.** A home, o rodapé e a busca de pt e es não mudam: as páginas novas não existem nesses idiomas, e o `navigation.spec.ts` prova que a busca de pt e es nunca oferece página em inglês.
   - **As institucionais** mudam nos três idiomas juntas, porque são equivalentes (§ 238):
     - a Privacidade diz que as medidas, as datas e o texto do QR ficam no aparelho;
     - os Termos dizem que as calculadoras de saúde não são recomendação médica e que as de casa são estimativas;
     - as Licenças trazem o `qrcode`.

     A "última atualização" muda onde o texto mudou, e o teste de vazamento e o do glossário da F6 continuam verdes em pt e es.
   - **O Open Graph** do build sai para cada página nova, e o sitemap em inglês as leva.

10. **O CI em 13 partes** (decisão do Victor). Faça isto na primeira fatia.
    - **O `ci.yml`.** O Chromium passa a 4 partes (`--playwright=chromium --shard=i/4`) e o WebKit a 8 (`--playwright=webkit --shard=i/8`), com os nomes "chromium 1 de 4" e "webkit 1 de 8" no padrão de hoje. Só a matriz e o comentário do topo mudam.
    - **Os registros da mudança:**
      - o `tests/unit/verificar.test.ts` (as partes escritas à mão);
      - um adendo da ADR-003, como a F5a fez;
      - um § e a seção nova do `CLAUDE.md`, que substitui a descrição das partes.
    - **O `gate:actionlint`** fica verde.
    - **Antes de cada push com testes novos,** rode o `--list` de cada parte:
      - `pnpm exec playwright test --project=chromium --shard=i/4 --list`;
      - `pnpm exec playwright test --project=webkit --shard=i/8 --list`.

      O `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes do WebKit (§ 108 e § 142).
    - **Os nomes dos specs novos.** Um spec novo tem nome que cai depois do `image-matrix.spec.ts` na ordem. O prefixo `money-` é só pela ordem (§ 142): por exemplo, `money-home.spec.ts`, `money-health.spec.ts` e `qr-code.spec.ts`.
    - **O alvo.** Toda parte fica abaixo de 700 s. Uma parte acima de 700 s ganha a medida e a proposta num §. Uma acima de 900 s é dividida mais nesta mesma PR, que já é de merge manual.
      - Se o `verificar` (`--sem-playwright`) passar de 900 s, divida-o em dois jobs por uma opção nova do `scripts/verificar.ts`, com o `verificar.test.ts` provando que as partes juntas são o todo.
    - **Os minutos.** O CI só roda com PR aberta, e a prévia do Workers Builds sai de qualquer push da branch, sem gastar minutos. Por isso:
      - faça push nos marcos, para ter a prévia;
      - abra a PR só com o `pnpm verificar` local verde.

11. **Os portões e testes que crescem.**
    - **`a11y.spec.ts`:** pega as páginas novas pelo mapa. Ele ganha o estado de resultado de uma calculadora de casa, de uma de saúde (nos dois sistemas de unidade) e do QR, o estado de erro de um campo e o campo de data.
    - **`ads.spec.ts`:** as páginas novas, nos estados e nas larguras de hoje. Ele conta cada campo, cada OptionGroup, o campo de data, a prévia do QR e os botões de baixar. Nas calculadoras, o ResultHero fica acima da dobra a 360 × 740.
    - **`budgets.spec.ts`:**
      - as calculadoras novas com os mesmos 2 arquivos JS das de dinheiro;
      - o QR com 2 arquivos;
      - os hubs;
      - as páginas de imagem e de PDF com o JS de antes.
    - **Os testes de calculadora:**
      - o `calc-defs.test.ts` e o `calc-oracle.test.ts` pegam as novas pelo registro;
      - o `calc-report.test.ts` confere o PDF de uma de casa e de uma de saúde no Node.
    - **Os specs de calculadora** (os `money-*` que leem o registro, ou os specs novos da decisão 10), nos dois navegadores:
      - o resultado e o CSV de cada calculadora nova, lidos de volta contra o oráculo;
      - a troca de unidade;
      - o Due date e o Ovulation com o relógio fixo, inclusive na virada de mês e de ano e num ano bissexto;
      - os 16 ms por tecla no BMI e no Square footage, medidos no Chromium (CLAUDE.md, F4).
    - **A privacidade** (no modelo do `money-privacy.spec.ts`, § 114):
      - sentinelas em todo campo das páginas novas;
      - nas datas, toda forma textual da sentinela ("2026-03-17", "03/17/2026" e "March 17, 2026");
      - procuradas nas requisições, no `dataLayer`, no título, no `location.search`, nos storages, nos cookies e nos nomes de arquivo.
    - **O QR,** num spec novo, nos dois navegadores:
      - os conteúdos: um endereço curto, um longo, texto com acento e emoji, e o maior permitido;
      - para cada conteúdo, o PNG e o SVG baixados (o SVG rasterizado pelo `@resvg/resvg-js`), com a Oli e sem ela;
      - a leitura pelo `jsqr` devolve os bytes UTF-8 exatos (compare o `binaryData`);
      - a privacidade do texto, como acima;
      - os eventos sem o texto;
      - o vazio e o acima do limite dão o erro, sem QR.
    - **Os portões:**
      - o `gate:dinheiro-saude` conta as páginas novas pelo mapa;
      - o `gate:conteudo`, o `gate:prontidao`, o `gate:seo` (sem par, com as contagens do sitemap em inglês lidas do mapa) e o `gate:licencas`;
      - cada mudança de portão com controles positivo e negativo.
    - **`consent.test.ts` e `events.spec.ts`:** as listas fechadas novas, e nenhum número, data ou texto digitado num evento.
    - **`lighthouserc.json`:** ganha o `/qr-code-generator/`, o único molde novo, com desempenho 90 ou mais e CLS de até 0,05. As URLs que já estavam não pioram.
    - **`launch-kit.test.ts`:** se uma contagem do kit do Product Hunt mudar, o kit é atualizado pela regra dele, e as imagens com `pnpm lancamento:imagens` se a galeria mostrar contagem.
    - **As asserções que mudam por construção** vão num §, no modelo da § 171.

12. **O teste de 90 dias.**
    - Um § registra o começo do teste de casa e saúde: o dia, em Brasília, em que a run abre a PR. O fim é 90 dias depois.
    - Ele também registra o gatilho do backlog: as calculadoras com impressão nos 90 dias ganham pt e es.
    - A data aparece no relatório e na lista do Victor.

13. **Os agentes de texto e de código.**
    - **No agente principal,** no modelo forte, ficam:
      - o CI, os registros, o oráculo e os motores;
      - os textos das 5 de saúde e dos 2 hubs, que são YMYL.
    - **Agentes em paralelo.** Os textos das 6 de casa e do QR podem ir para agentes em paralelo. Cada agente é dono de um conjunto de arquivos que nenhum outro toca, roda com `model: 'opus'` e segue a voz do `docs/design/README.md` e o `lint:texto`.
    - **Worktrees.** Agentes em worktree nascem da `main`: o primeiro passo de cada um é `git merge --ff-only fase-07`.

# Armadilhas conhecidas

- As do `CLAUDE.md`, da F1a à F6. Em especial:
  - heredoc e `node -e` com crase, barra invertida ou "$" no Git Bash: escreva arquivos com a ferramenta de escrita;
  - o `exactOptionalPropertyTypes`, e o `pnpm tipos` antes do push (ele confere os specs);
  - a porta 4173 com `reuseExistingServer`: em outra worktree, use o `FO_PORT`, de 4174 a 4189;
  - o `uv` desta máquina não está no PATH: chame pelo caminho completo (`CLAUDE.md`, F4). Também não há `python` no PATH;
  - o cache do Vitest em `node_modules/.vitest-cache` com `import.meta.glob` (F6);
  - o `serve-dist` devolve o 404 mais próximo: teste de página exige status 200;
  - o aviso de cookies cobre o canto de baixo à esquerda: feche-o antes (`dismissCookies`);
  - mesmo `#` na mesma página não recarrega: no teste, vá a `about:blank` antes de abrir outro link do cenário.
- O `git push` e o `gh pr create --base main` na mesma linha casam com a regra de negação: rode em comandos separados.
- O push que muda `.github/workflows/` pede o escopo `workflow` no `gh`. Se o push for recusado por isso, é bloqueio real: registre, siga com o resto e diga na resposta final o comando que o Victor roda (`gh auth refresh -s workflow`).
- `Date` com fuso: "hoje" no Brasil às 22h é amanhã em UTC. A data vem do aparelho, em dia local, e o motor só vê inteiros.
- O `jsqr` devolve no `data` uma decodificação que pode errar acentos: compare o `binaryData` com os bytes UTF-8.
- O WebKit do Windows não tem `OffscreenCanvas` no worker. O QR roda na página, e o PNG sai do canvas da página.
- O `ResultHero` mede o número caractere a caractere (§ 246 e § 253). Uma data por extenso ("September 30, 2027") é mais larga que um valor: confira a 320 e a 360 px.
- O PDF usa as fontes padrão (só WinAnsi), e o `winAnsi()` troca o que elas não desenham. Todo texto novo do PDF passa por ele. "≥", "≤" e "≈" não existem no WinAnsi: escreva "sq ft", "cu yd" e "kg/m2" no PDF, ou prove no `calc-report.test.ts` que o caractere sai.
- O `lint:texto` preenche os `{placeholders}` com amostras (§ 123). Um placeholder novo de medida ou de data precisa de amostra.
- A Energy Star, o CDC e a DTIC podem não abrir no WebFetch. Tente outra página oficial do mesmo órgão. Nunca use site de terceiro: o que não abre vira pendência.
- Se o build da prévia ficar na fila sem começar, como no fim da F6, registre e siga. Não deduza a causa (`CLAUDE.md`, "Ajuste da prévia").

# Critérios de aceitação (cada um com evidência no relatório)

1. As 14 páginas da decisão 1 respondem 200 no `dist/` e na prévia, com H1, título, descrição, `lang="en"` e canonical. Se a válvula cortar algo, a lista diz o que foi para a 7b.
2. As fixtures novas estão num commit anterior a qualquer motor ou definição das calculadoras novas, provado pelo `git log`.
   - Todo motor novo bate com o oráculo, e o mutante reprova.
   - As fixtures de hoje não mudam, e o `--check` dos três scripts dá zero.
3. O QR de cada conteúdo do teste, em PNG e em SVG, com e sem a Oli, lido pelo `jsqr`, devolve os bytes exatos nos dois navegadores, com a saída colada.
4. O `gate:dinheiro-saude` confere todas as páginas de casa e de saúde e os dois hubs, com a contagem lida do mapa. O `gate:conteudo`, o `gate:prontidao`, o `gate:seo`, o `gate:links` e o `gate:licencas` ficam verdes.
5. Nenhuma medida, data ou texto digitado aparece em URL com `?`, em evento do GA4, em storage, em cookie ou em nome de arquivo, provado pelos testes de privacidade nos dois navegadores.
6. O ResultHero de cada calculadora nova fica acima da dobra a 360 × 740, nos dois navegadores e nos dois sistemas de unidade.
7. O `budgets.spec.ts` fica verde. Uma tabela mostra o JS inicial (gzip) e as requisições:
   - das páginas novas;
   - de uma calculadora de dinheiro antes e depois;
   - de uma ferramenta de imagem e de uma de PDF antes e depois (iguais).
8. O `ads.spec.ts` e o `a11y.spec.ts` ficam verdes nas páginas novas.
9. O Lighthouse no celular do `/qr-code-generator/` dá desempenho 90 ou mais e CLS de até 0,05, e as URLs que já estavam não pioram.
10. Nenhum texto de saúde tem meta, dieta, diagnóstico ou exclamação no resultado, e a Oli não comemora resultado de saúde. Um teste prova a ausência da pose `cheer` nessas páginas.
11. O CI tem 13 partes, todas verdes, com uma tabela do total do `verificar` de cada uma contra a F6 e os minutos de runner de cada execução.
    - Não há `skip`, `fixme`, `only`, `retries` nem `continue-on-error` novo.
    - O `git diff --stat origin/main...HEAD -- .github scripts/ci PLANO-FILEORCA.md docs/adr/ADR-001-plataforma-de-entrega.md .githooks .claude/settings.json docs/design` mostra só o `ci.yml`.
12. O `pnpm verificar` inteiro fica verde na sua máquina, com a saída e o tempo de cada portão, ou as partes, pela regra da Verificação.
13. Nada novo entra em `dependencies` além do `qrcode`, que sai de `devDependencies`. O diff do `package.json` e do `pnpm-lock.yaml` prova.
14. A prévia tem o `build.txt` com o commit. O Playwright confere nela, com o Google bloqueado, a 360 e a 1280 px e com screenshot:
    - o BMI nos dois sistemas de unidade;
    - o Due date;
    - o Concrete;
    - o QR code, com o PNG baixado e lido pelo `jsqr`;
    - os dois hubs.
15. O DECISOES.md tem a data de início do teste de 90 dias.
16. A PR está pronta (fora do rascunho), com o CI verde, e o job de merge comentou que não mescla por causa do `.github/`. Isso vai na resposta final.

# Verificação: rode de verdade

- Siga a ordem das fatias de "Como trabalhar", e cada fatia termina verde antes da próxima.
- Leia cada falha, corrija a causa e repita até passar.
  - É proibido desligar, pular, marcar como skip, afrouxar limiar, mudar orçamento, ligar `retries` ou aumentar timeout para passar.
  - Se um portão estiver de fato errado, corrija o portão com um teste que prove o erro e registre no `DECISOES.md`.
- No fim, rode o `--check` dos três oráculos de calculadora e o do Pix, e cole a saída. Todos dão zero.
- No fim, rode o verificar inteiro numa execução limpa (`CI=true pnpm install --frozen-lockfile` e `pnpm verificar`, que builda do zero) e guarde a saída completa. Se o todo passar de 900 s na sua máquina só pelo tamanho da suíte:
  - rode as mesmas 13 partes do CI em sequência e cole o resumo de cada uma;
  - registre a medida num §. O limite não muda.
- Rode o `pnpm screenshots` depois do último ajuste visual. A pasta é `docs/relatorios/fase-07/componentes/`, e as pastas antigas ficam como estão. Ela traz, nos dois temas, a 360 e a 1280 px:
  - uma calculadora de casa;
  - uma de saúde nos dois sistemas de unidade;
  - o Due date;
  - o QR code;
  - os dois hubs.
- Depois de abrir a PR, acompanhe com `gh pr checks <n> --watch` e conserte o que só falha no Ubuntu. Leia o total de cada parte no log (`gh run view <id> --log`, com o `--attempt` do `CLAUDE.md` depois de um rerun).

# Autonomia e decisões

Você está rodando sozinho e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `CLAUDE.md`, a ficha F7 e o resto do plano.
3. O `docs/design/` e o `DECISOES.md`.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos:

- onde moram a área, o hub e o grupo das calculadoras no registro;
- a convenção de cada calculadora, conferida na fonte (os ajustes do BTU, os fatores de atividade, a idade mínima, a faixa das datas);
- a troca de unidade e o campo de data;
- o tamanho máximo do QR e o tamanho da Oli nele;
- os nomes dos arquivos exportados e os valores novos das listas fechadas de eventos.

Uma mudança de arquitetura (host, framework, estrutura do repositório) vira uma ADR "Proposta" em `docs/adr/` e uma pendência. A divisão das partes do CI desta run segue o modelo da ADR-003 e não é mudança de arquitetura.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- uma página oficial que não abre;
- o LanguageTool sem responder;
- o push do `ci.yml` recusado por falta do escopo `workflow`;
- a prévia que não builda.

Válvula de estouro, nesta ordem, se o tempo ou o limite apertar:

1. Tile, para a run 7b (branch `fase-07b`), como a ficha permite.
2. Mulch & gravel, para a 7b, como a ficha permite.
3. BTU, para a 7b.
4. Paint, para a 7b.

O modelo é a § 85: saem a rota, a página, o cartão e todo link para ela, e nada fica "em breve". O que for cortado vai para o relatório como pendência, com o que falta.

Nunca corte:

- BMI, Calorie e Due date;
- o QR code e a leitura de volta pelo `jsqr`;
- os dois hubs e o oráculo antes dos motores;
- a divisão do CI;
- os testes de privacidade, orçamento, anúncio e acessibilidade do que entrar;
- a revisão adversarial final.

# Git e segurança

- **Começo.**
  - Rode `git switch main` e `git pull --ff-only`.
  - Antes de criar a branch, o `git status` só pode mostrar como não rastreados `docs/prompts/prompt-fase-07.md` e `docs/prompts/prompt-fase-07.txt`, o prompt desta run.
  - Crie a branch com `git switch -c fase-07`. Os dois arquivos entram sem edição no primeiro commit dela.
  - Se eles não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-07.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits). O commit do oráculo vem antes do código que ele confere.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push, e o CI não roda sem PR.
- **A PR em rascunho, só com o verificar local verde** e tudo commitado. Use `gh pr create --draft --base main --head fase-07`, num comando separado do push.
  - O título e a descrição vão em português, com o resumo e o link do relatório.
  - A descrição diz em destaque que a PR muda o `ci.yml` e que o merge é do Victor.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`. A da revisão (`.claude/worktrees/revisao-f7`) é só de leitura.
- **Fim:**
  1. Com o CI verde no rascunho, commite o relatório (citando essa execução), a revisão e os screenshots.
  2. Faça o push e rode logo em seguida `gh pr ready`. A concorrência do CI cancela a execução do push e fica a do `ready_for_review`.
  3. Acompanhe essa execução até o fim. Com tudo verde, o job de merge comenta que não mescla por causa do `.github/`: é o esperado.
  4. A run termina com a PR pronta e o CI verde, ou com a pendência que impediu isso. A resposta final diz qual.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo create`;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `npm publish` ou `wrangler deploy` em qualquer forma, inclusive `--dry-run`.

  O `.claude/settings.json` nega esses comandos. Não tente contornar.

# Como trabalhar

1. **Explorar**, com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) a ficha F7, as seções do plano e as regras do `CLAUDE.md`, num checklist "requisito → onde vai ficar → que teste prova";
   - (b) a arquitetura das calculadoras:
     - o registro, as definições, a ilha e o `CalcTool.astro`;
     - o `report.ts` e o `exports.ts`;
     - os specs e os testes de unidade que leem o registro, e o que cada um supõe de dinheiro (cronograma, centavos, SplitChart);
   - (c) as fontes de casa, lidas na web, com o link e a data:
     - a Energy Star (a tabela, os ajustes e as fórmulas de área);
     - o NIST (as unidades e as conversões);
   - (d) as fontes de saúde, lidas na web, com o link e a data:
     - o CDC (a fórmula, as faixas, a idade adulta e o exemplo do BMI);
     - a Mifflin-St Jeor no PubMed e uma fonte oficial para os fatores de atividade;
     - a ACOG 700 e uma fonte oficial para a ovulação e o ciclo;
     - o relatório da Marinha de 1984 (DTIC) e a DoDI 1308.03;
   - (e) o QR:
     - a API do `qrcode` no navegador e os módulos que ele leva ao bundle, com as licenças;
     - a leitura com logo e correção H;
     - o `jsqr` e o `binaryData`;
   - (f) o CI: o tempo por spec da run 41410030945 e a projeção do `--list` em 4 e 8 partes, com as páginas novas.
2. **Planejar.** Escreva `docs/relatorios/fase-07-plano.md`, autossuficiente. Ele é o gabarito da revisão e traz:
   - as interfaces do registro e da definição de uma calculadora de casa e de saúde;
   - a tabela das páginas, com o id, o caminho, o hub, a área, o ícone, os chips e as relacionadas;
   - os campos, as faixas, a convenção e a fonte de cada calculadora;
   - o desenho do QR;
   - a lista das mudanças nas institucionais;
   - cada critério ligado a um teste ou comando;
   - a projeção das 13 partes;
   - a ordem de construção.
3. **Implementar** em fatias que terminam verdes, nesta ordem:
   1. o CI em 13 partes, os registros, as rotas, as listas de fontes do portão e os esqueletos dos dois hubs;
   2. o oráculo e as fixtures das 11, num commit;
   3. BMI, Calorie e Due date, uma por vez, cada uma com os testes dela;
   4. o QR code, com o teste de leitura;
   5. Square footage e Concrete;
   6. Ovulation e Body fat;
   7. Paint e BTU;
   8. Mulch & gravel e Tile;
   9. os hubs, a home, o rodapé, a busca, o 404 e as institucionais nos três idiomas;
   10. o Lighthouse, os screenshots e o `--list` das partes.
4. **Revisão adversarial final**, no método da F3 (`CLAUDE.md`, F3, § 92 a § 94):
   - **Onde:** sobre um commit fixo, registrado, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`. Cada lente usa um `FO_PORT` (de 4174 a 4180) e uma `--output` só dela.
   - **As lentes:** sete lentes Sonnet em contexto limpo, contra este prompt e a ficha:
     - (a) corretude: cada calculadora contra o oráculo e a fonte lida, com uma amostra refeita por conta própria; as datas na virada de mês e de ano e no ano bissexto; a troca de unidade; o CSV e o PDF;
     - (b) privacidade e segurança: medidas, datas e o texto do QR fora da URL, do GA4, dos storages e dos nomes de arquivo; o QR não abre nem busca o endereço;
     - (c) anúncio e política: as distâncias nas páginas novas; o rótulo; as regras da Oli perto de anúncio;
     - (d) acessibilidade (WCAG 2.2 AA): os campos de data e de unidade, os erros, as tabelas de resultado, a prévia do QR e o anúncio do resultado;
     - (e) desempenho e SEO: o orçamento, o Lighthouse, os títulos, as descrições, os hubs, o sitemap e os links internos;
     - (f) design system e voz: os tokens, o violeta e o lima só como preenchimento, o amarelo só no Baixar, uma exclamação por tela e a tabela de falas;
     - (g) saúde e confiança: nada de dieta, meta, diagnóstico ou anticoncepção; só adultos; as fontes; o tom neutro, sem julgamento de peso; o rótulo do sexo; o que a página diz sobre o método da Marinha.
   - **Os céticos:** cada achado crítico, alto ou médio ganha um cético próprio, e os baixos de cada lente vão a um cético só.
   - **As correções:**
     - crítico e alto confirmados são sempre corrigidos;
     - médio é corrigido se a correção é local;
     - baixo vai para o relatório.

     Cada correção leva um teste que falha sem ela e um §.
   - **A segunda passada:** depois das correções, ela revisa o diff delas.
   - Tudo fica em `docs/relatorios/REVISAO-F7.md`. Remova a worktree no fim.

# Relatório final

Escreva `docs/relatorios/fase-07.md` em português, commitado na branch antes do `gh pr ready`. Ele cita a última execução verde do CI com código ou teste, com o link e o total de cada parte.

O relatório traz:

- o resumo e a tabela das páginas: o id, o caminho, o hub, o H1, o JS inicial e as requisições;
- o `git log` que prova o oráculo antes dos motores, e a saída dos `--check`;
- para cada calculadora: os campos, as faixas, a convenção, as fontes (link e data) e os casos do oráculo, com os exemplos oficiais que entraram ou não;
- o QR: os conteúdos testados, a leitura pelo `jsqr` nos dois formatos e nos dois navegadores, o tamanho máximo e o tamanho da Oli;
- a saída dos testes de privacidade e dos specs novos;
- o orçamento, antes e depois;
- o Lighthouse das URLs do `lighthouserc.json`;
- os screenshots;
- o CI: a tabela das 13 partes contra a F6, onde o `--list` pôs os specs e os minutos de cada execução;
- o resumo da revisão por lente e severidade, apontando para o `REVISAO-F7.md`;
- a saída real e completa do `pnpm verificar` local, com o tempo de cada portão;
- o link da prévia e o que você conferiu nela;
- as decisões novas, apontando os §, e a data do teste de 90 dias;
- o que a válvula cortou e o que fica para a 7b, se houver;
- **a lista do que é do Victor, em passos:**
  1. O merge. Conferir que o diff do `.github/` é só a matriz e o comentário do `ci.yml`, e dar o merge pela página da PR (squash, apagando a branch). Depois, conferir o pós-deploy e o `build.txt` de produção.
  2. O QR no celular: gerar um QR de um endereço e de um texto com acento, com a Oli, baixar o PNG e o SVG e ler com a câmera do celular.
  3. No celular, abrir o BMI nos dois sistemas de unidade, o Due date e o Concrete.
  4. No Search Console, pedir a indexação dos dois hubs, do BMI e do QR code.
  5. Se o Product Hunt ainda não foi postado, conferir as contagens do kit depois do merge.
  6. Anotar a data do fim do teste de 90 dias e o que olhar nela (as impressões de cada calculadora no Search Console).
  7. As pendências que seguem abertas: a 2b, os baixos da F4 à F7, a § 103, as propostas da § 242 e o que esta run deixou para a 7b.
  8. Gerar o prompt da F8, e o da 7b, se a válvula cortou.
- **uma nota para a F8:**
  - as páginas novas no service worker;
  - o QR offline;
  - o que a revisão da F8 deve olhar em casa e saúde.

Acrescente no fim do `CLAUDE.md` uma seção curta, "F7: casa, saúde e QR code", com:

- os comandos novos (o oráculo de casa e saúde);
- como uma calculadora de casa ou de saúde entra, e onde o hub dela é lido;
- as partes do CI em 13, substituindo a descrição das seções anteriores, que ficam como estão;
- o QR: onde está, como o `qrcode` entra só nesta página e como a leitura é provada;
- as armadilhas que você achou.

Não apague nada do que já existe.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR, o estado do CI e o lembrete de que o merge é do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md` e a descrição da PR.

Em inglês: o código, os nomes de arquivo, os identificadores, os commits e os textos do site, nos arquivos de tradução, com a voz de `docs/design/README.md`.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

Os arquivos `prompt-fase-07.md` e `prompt-fase-07.txt` já estão em `docs\prompts\` no seu clone, sem commit. A run os põe no primeiro commit dela.

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # 048a3dd (o merge da F6) ou mais novo
git status                  # só docs/prompts/prompt-fase-07.md e .txt como não rastreados
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado, e "workflow" nos escopos
claude --version            # o modo auto pede 2.1.83 ou mais
powercfg /change standby-timeout-ac 0
```

- **O escopo `workflow` do `gh` é obrigatório nesta run.** A run muda o `ci.yml`, e sem esse escopo o push da branch é recusado no meio. Se ele não aparecer no `gh auth status`, rode:

  ```powershell
  gh auth refresh -s workflow
  ```

- **O `uv`.** A run roda o oráculo novo e os `--check` antigos pelo `uv`. Confira que ele ainda responde:

  ```powershell
  $uv = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter uv.exe | Select-Object -First 1 -ExpandProperty FullName
  & $uv --version
  ```

- **Minutos do GitHub Actions.** Confira o uso em github.com → Settings → Billing and plans.
  - Com 13 partes, cada execução do CI deve gastar de 120 a 135 min, contra uns 110 min na F6.
  - Conte de 3 a 4 execuções: até uns 550 min, num plano de 2.000 min por mês.
  - Se faltar minuto, o CI não roda.
- **O Product Hunt de terça (3/nov)** não depende desta run. Como o merge da F7 é seu, poste com a main como está e dê o merge depois. O kit vem atualizado na PR, se alguma contagem mudar.
- Volte o `powercfg` ao normal depois da run.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-07
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-07.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal pnpm verificar verde, as 13 partes do CI verdes, docs/relatorios/REVISAO-F7.md sem achado crítico ou alto aberto, e a PR da fase-07 fora do rascunho, pronta para o merge do Victor
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-07` e mande: "continue de onde parou: leia docs/relatorios/fase-07-plano.md, o git log da branch fase-07 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-07.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-07.json
(Get-Content $HOME\run-fase-07.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**O tamanho da run.** É menor que a F6, mas tem bastante coisa:

- 14 páginas novas e 11 motores com oráculo;
- fontes oficiais de saúde para ler;
- o QR com a leitura de volta;
- a divisão do CI;
- a revisão em sete lentes, com céticos.

Comece com folga no limite semanal do Claude Code. Se o limite acabar no meio, retome na janela seguinte: os commits pequenos guardam o que já foi feito. Se apertar, a válvula manda para uma 7b, nesta ordem: Tile, Mulch & gravel, BTU e Paint. BMI, Calorie, Due date, o QR e o CI nunca saem.

**Por que o modo `auto`:** a run faz várias coisas sem perguntar:

- builda e roda o Vitest, o Playwright em várias portas e o Lighthouse;
- roda o oráculo com o `uv`;
- move o `qrcode` para `dependencies`;
- lê a web (CDC, NIH, Energy Star, NIST e DTIC);
- cria e remove worktrees de agentes e da revisão;
- faz commit e push da branch (com o `ci.yml`), abre a PR em rascunho e a marca como pronta.

O `auto` deixa tudo isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo: push na main, `gh pr merge`, `gh repo create`, `wrangler deploy`, reset e amend. O prompt não pede nada disso, e o `.claude/settings.json` não bloqueia a edição do `ci.yml`.

### 3. Acompanhar

- **A prévia sai antes da PR.** A branch ganha prévia a cada push, em `https://fase-07-fileorca.vmatusita.workers.dev/health-calculators/`, sem gastar minutos do Actions.
- **O oráculo aparece cedo** na branch, num commit antes dos motores: as fixtures novas em `fixtures/calc/`.
- **A PR aparece em rascunho só no fim,** com o verificar local verde. A revisão sai em `docs/relatorios/REVISAO-F7.md`.
- **O job de merge vai comentar que não mescla.** É o esperado: a PR muda o `ci.yml`.

### 4. Ao voltar

1. Leia `docs/relatorios/fase-07.md` e confira as evidências:
   - o `git log` com o oráculo antes dos motores e a saída dos `--check`;
   - a leitura do QR pelo `jsqr`, em PNG e em SVG, nos dois navegadores;
   - a tabela das 13 partes do CI, todas abaixo de 900 s;
   - o orçamento das páginas de imagem e de PDF, igual ao de antes;
   - o `REVISAO-F7.md`, com o veredito de cada cético.
2. Confira o diff do `.github/`:

   ```powershell
   git fetch origin fase-07
   git diff --stat main...origin/fase-07 -- .github
   git diff main...origin/fase-07 -- .github
   ```

   Ele deve mostrar só o `ci.yml`, com a matriz das partes e o comentário do topo. Se estiver certo, dê o merge pela página da PR: "Squash and merge" e apague a branch.
3. Confira a produção:

   ```powershell
   git switch main; git pull --ff-only
   gh run list --workflow pos-deploy.yml --limit 1   # verde
   curl.exe -s https://fileorca.com/build.txt         # o commit do merge
   ```

4. No celular, gere um QR em `https://fileorca.com/qr-code-generator/`, baixe o PNG e leia com a câmera. Abra o BMI nos dois sistemas de unidade e o Due date.
5. Siga a lista "O que é do Victor" do relatório e gere o prompt da F8 (e o da 7b, se a válvula cortou).

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta de ajuste, com o que aprendeu.

## Suposições que fiz

- **Os slugs são os do `data/keywords.csv`,** e os hubs são os do plano (`/home-calculators/` e `/health-calculators/`). O QR fica sem hub, ligado pela home, pelo rodapé e pela busca.
- **Nas páginas de saúde, a Oli não comemora** e o resultado não tem exclamação. Uma orca festejando um BMI de obesidade ou uma data de parto soaria mal. Isso não está no plano; é leitura minha da voz.
- **A idade mínima segue a fonte quando ela é maior que 18.** O CDC aplica as faixas de adulto do BMI a partir dos 20 anos. O plano diz 18, então a run usa o maior dos dois e explica na página.
- **O Body fat usa o método clássico da Marinha,** como o plano pede. A página diz que as Forças Armadas hoje medem de outro jeito (a DoDI 1308.03 de 2022 e o teste de um ponto do Exército).
- **Sem faixa de "peso saudável" no BMI e sem metas no Calorie.** Li o "sem dieta" do plano como "nada que vire meta de peso".
- **O Due date começa pela DUM.** Concepção e FIV entram se a fonte lida sustentar, porque a ACOG 700 dá os números; o ajuste pelo ciclo só com fonte oficial.
- **O QR é só texto ou endereço,** com a Oli opcional e ligada por padrão, preto no branco e correção H. Wi-Fi, cores e logo próprio ficam fora.
- **O QR não tem link do cenário,** porque o texto pode ser privado.
- **O Lighthouse ganha só o `/qr-code-generator/`.** É o único molde novo: as calculadoras usam o molde da hipoteca, e os hubs o do hub de dinheiro.
- **O teste de 90 dias começa no dia em que a run abre a PR.** Se o merge atrasar muito, ajuste a data num ajuste curto.
- **A válvula vai além da ficha:** depois de Tile e Mulch & gravel, que a ficha permite cortar, ela corta BTU e Paint.
- **A home, o rodapé e a busca de pt e es não mudam,** porque as páginas novas só existem em inglês. As institucionais mudam nos três idiomas, porque são equivalentes desde a F6.
- **Fora:** a 2b, os baixos da F4 à F6, a § 103 e as propostas da § 242.
