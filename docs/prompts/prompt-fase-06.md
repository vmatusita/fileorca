# F6 · Português e espanhol: imagem, PDF, dinheiro adaptado e o Pix

Prompt da run `fase-06` do FileOrca, gerado com a skill prompt-ultracode em 1/nov/2026. Ele parte da ficha "F6 · Português e espanhol" do PLANO-FILEORCA.md e do estado da main em `a8f98e8`, o merge da F5b.

O que entrou na conversa:

- **Lido antes de escrever:**
  - a ficha F6 e as seções "Catálogo por fase", "Regra das calculadoras", "Idiomas e URLs", "Doações", "Confiança em dinheiro e saúde" e "Execução por IA" do plano;
  - o `CLAUDE.md` até a seção da F5b e o `DECISOES.md` até o § 212;
  - as notas para a F6 dos relatórios da F4, da F5a e da F5b;
  - o `docs/F0-SAIDA.md` (a chave Pix está lá) e o `data/keywords.csv`: as 14 calculadoras da F4 entraram, então as 8 adaptações em português valem todas;
  - o código de rotas, textos, registros, parser, CSV, relatório em PDF, SupportCard e portões.
- **A sua decisão nesta conversa:** as 5 calculadoras em espanhol são para o público hispânico dos EUA. Ficam em US$, com as contas da F4 traduzidas, as fontes do CFPB em espanhol e par do inglês no hreflang. Com isso, o espanhol do site inteiro passa a escrever número como nos EUA (1,234.56).
- **As normas brasileiras que conferi:**
  - o CET hoje está na Resolução CMN 4.881/2020; a 3.517/2007, citada no plano, foi revogada em 2021;
  - o teto de 100% do rotativo e do parcelado vem da Lei 14.690/2023, regulado pela Resolução CMN 5.112/2023, que alterou a 4.549/2017.

  A run lê tudo de novo na fonte.
- **O tamanho:** são 63 páginas novas. Imagem e PDF somam 48, nos dois idiomas; o dinheiro soma 9 em português e 6 em espanhol.
- **O merge:** é automático se a run não mexer no `.github/`. Se uma parte do CI passar de 900 s, a run divide o `ci.yml`, e o merge passa a ser seu.
- **Fora desta run:**
  - a 2b, os baixos das revisões da F4, da F5a e da F5b, e a § 103;
  - os guias em pt e es, os presets de dinheiro em pt e es, e casa e saúde.

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F6 do FileOrca: o site em português e em espanhol. Ao terminar:

- em português (`/pt/`) e em espanhol (`/es/`), com slug traduzido e hreflang recíproco com o inglês, estão no ar o hub de imagem, as 8 ferramentas de imagem, os 3 presets de imagem, o hub de PDF e as 12 ferramentas de PDF. Cada ferramenta processa arquivo real no navegador, como em inglês;
- em português estão no ar 8 calculadoras de dinheiro adaptadas ao Brasil e o hub delas. São páginas próprias, sem par no hreflang. Os motores batem no centavo com um oráculo independente, gravado num commit antes do motor;
- em espanhol estão no ar as 5 calculadoras da F4 traduzidas para o público hispânico dos EUA, em US$, e o hub delas, com par do inglês no hreflang;
- as páginas em português têm o Pix. O BR Code sai do build igual ao oráculo e ao exemplo do manual do Banco Central, e o QR em SVG, lido de volta no teste, devolve o mesmo código;
- a home, o rodapé, a busca, o 404 e as páginas institucionais de pt e es mostram o que existe em cada idioma;
- os glossários de `docs/i18n/` existem, e um teste confere que os textos os seguem.

Nada é enviado nem publicado. O `pnpm verificar` fica verde na sua máquina e em todas as partes do CI. Tudo vai numa PR da branch `fase-06`, com o relatório. Se a PR não mexer no `.github/`, o job de merge a mescla sozinho quando ela sai do rascunho com o CI verde. Se mexer (decisão 11), o merge é do Victor.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, e o shell é o Git Bash. O CI roda em Ubuntu, em 11 partes de até 900 s cada, com o alvo de 700 s (ADR-003 e os adendos da F5a).

A main está em `a8f98e8`, o merge da F5b, ou num commit mais novo. Confira com `git log --oneline -8`.

O que está no ar em fileorca.com, indexável:

- em inglês:
  - 8 ferramentas de imagem, 3 presets e o hub;
  - as 12 ferramentas de PDF e o hub;
  - as 14 calculadoras, os 4 presets, o hub e os 5 guias de dinheiro;
  - os 10 guias de arquivo;
- em pt e es (§ 4 e § 58):
  - a home e a Compress image (`/pt/comprimir-imagem/` e `/es/comprimir-imagen/`);
  - Privacidade, Termos, Sobre, Contato, Licenças, Apoio e o 404.

O que já existe para idiomas:

- `src/i18n/routes.ts`: uma linha por página, com o caminho em cada idioma equivalente (§ 4). O hreflang, o sitemap, a busca, o IndexNow e o `a11y.spec.ts` leem o mapa. Hoje as rotas de imagem, de PDF, de dinheiro e dos guias saem de funções que só põem `en`.
- `src/i18n/types.ts` e `texts.ts`: os tipos deixam uma página existir só em inglês. O `EnCommonTexts` exige tudo, e o `CommonTexts` de pt e es, só a Compress image.
- `src/i18n/format.ts` (o `fileSize`, com o locale do idioma) e `src/calc/parse.ts` (§ 112: pt e es leem e escrevem "1.234,56", sem `Intl`).
- Os textos do painel de imagem estão em `src/tools/image/i18n/{en,pt,es}.ts`, e os da Compress image em `src/tools/compress-image/i18n/`. Os do painel de PDF estão só em `src/tools/pdf/i18n/en.ts`.
- As decisões de idioma:
  - § 32: `pt-BR` e `es` no `lang` e no hreflang;
  - § 84: o menu de idioma, numa página sem tradução, leva à home do outro idioma;
  - § 24: o `lint:texto` roda num LanguageTool local, nos três idiomas;
  - § 123: as amostras de dinheiro do `lint:texto`, hoje só em inglês.

O que já existe para o dinheiro (a "Nota para a F6" de `docs/relatorios/fase-04.md`):

- o registro `src/tools/calc/registry.ts`, em que cada página tem um `path` só, em inglês;
- o molde `CalcTool.astro`, a ilha `CalcIsland.astro`, as definições em `src/tools/calc/defs/` e os motores em `src/calc/` (§ 110 a § 127);
- o oráculo `scripts/oracle/calc.py` (numpy-financial 1.1.0, pelo `uv`), as fixtures `fixtures/calc/` e os exemplos oficiais em `fixtures/calc/OFICIAIS.md`;
- o CSV em `src/tools/calc/exports.ts`, com vírgula e ponto decimal fixos;
- o PDF do relatório em `src/engine/pdf/report.ts`: página Letter, fontes padrão (WinAnsi, que cobre os acentos de pt e es) e textos em inglês;
- o `scripts/lib/ymyl.ts`. As fontes oficiais já incluem `bcb.gov.br` e `consumerfinance.gov`, e a lista de texto proibido já tem "taxa do dia" e "tasas de hoy".

O que já existe para o PDF e os guias:

- a "Nota para a F6" de `docs/relatorios/fase-05a.md`:
  - os textos do painel e de cada ferramenta;
  - a palavra "Page" da numeração, fixa no motor;
  - o WinAnsi na marca d'água;
  - os slugs e o menu de idioma;
- a "Nota para a F6" de `docs/relatorios/fase-05b.md`: os guias ficam em inglês, e os hubs e as páginas de ferramenta em pt e es não os listam.

O que já existe para o Pix:

- a chave aleatória está em `docs/F0-SAIDA.md`, com o nome VICTOR YUKI MATUSITA. A cidade é CURITIBA (plano, "Doações");
- o exemplo do manual do Banco Central, na ficha F6: `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D`;
- o SupportCard: o README e o `preview.html` em `docs/design/components/SupportCard/` (com o bloco `.fo-pix`), o `src/components/SupportCard.astro` e a § 48;
- a linha do café (§ 49): em português, até a F6, o botão leva a `/pt/apoie/`.

A decisão do Victor sobre o espanhol do dinheiro, tomada ao gerar este prompt (1/nov/2026):

- as 5 calculadoras em espanhol são para o público hispânico dos EUA: US$, as mesmas contas e campos da F4 e as fontes do CFPB em espanhol (`consumerfinance.gov/es/`);
- por isso elas são equivalentes das páginas em inglês e ganham par no hreflang;
- e o espanhol do site inteiro passa a escrever número como nos EUA: "1,234.56" e "2.4 MB". O "68 %", com espaço, fica, porque é a voz do design system.

O CI na última execução verde da F5b ([run 41372335840](https://github.com/vmatusita/fileorca/actions/runs/41372335840), commit `cfd1868`), pelo total do `verificar` de cada parte:

- `verificar` (`--sem-playwright`): 374,9 s;
- Chromium, 3 partes: 323,2 s, 316,7 s e 460,0 s;
- WebKit, 7 partes: 221,9 s, 403,2 s, 143,5 s, 226,0 s, 520,9 s, 507,7 s e 432,6 s.

Cada execução do CI gasta uns 79 min de runner. O repositório é privado, no GitHub Free, com 2.000 min por mês. O `pnpm verificar` local da F5b deu 786,4 s, com o limite de 900 s. A F6 soma 63 páginas, e o `a11y.spec.ts` já pega toda página do mapa em todo idioma, então o tempo vai subir.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele faz o papel da ficha da run e vence o resto.
2. O `CLAUDE.md` inteiro, em especial:
   - a F2 (como uma ferramenta de imagem entra) e a F3 (o `gate:prontidao` e o método da revisão);
   - a F4 (como uma calculadora entra, o oráculo e o `uv`);
   - a F5a (como uma ferramenta de PDF entra, as partes do CI e os agentes em worktree) e a F5b.
3. O `PLANO-FILEORCA.md`. A ficha "F6 · Português e espanhol" do apêndice é o contrato, e as "Decisões fechadas" não mudam. Leia também:
   - "Catálogo por fase", "Regra das calculadoras" e "Idiomas e URLs";
   - "Doações" e "Confiança em dinheiro e saúde";
   - "Regra da página programática", "Idiomas" e "O que derruba conta".
4. O `DECISOES.md`, do § 1 ao último. O próximo § livre é o 213, se nada entrou depois da F5b. Esta run toca mais estes:
   - § 4, § 6, § 13, § 24, § 32, § 48, § 49 e § 58;
   - § 68 a § 71, § 77, § 78, § 81, § 84, § 85 e § 92 a § 96;
   - § 110 a § 127, § 129, § 136 a § 139 e § 142;
   - § 148, § 150, § 153, § 154, § 160 a § 162, § 170, § 171, § 184, § 190, § 195 e § 207.
5. O `docs/design/`, que é só leitura:
   - o README: a voz, com a tabela das falas em pt e es, o "tú" e o "68 %";
   - o SupportCard (o Pix) e o AdSlot (os rótulos);
   - o OptionGroup, o NumberField, o ResultHero e o ScenarioCompare.
6. Os relatórios: as notas para a F6 de `fase-04.md`, `fase-05a.md` e `fase-05b.md`, e o `REVISAO-F5b.md`.
7. O código:
   - `src/i18n/`;
   - `src/tools/image/` (`registry.ts`, `texts.ts`, `ImageToolPage.astro`);
   - `src/tools/compress-image/`, a única ferramenta que já existe nos três idiomas. Ela é o modelo;
   - `src/tools/pdf/` (`registry.ts`, `texts.ts`, `option-texts.ts`, `PdfToolPage.astro`);
   - `src/tools/calc/`, `src/calc/`, e `src/engine/pdf/report.ts` e `operations.ts`;
   - `src/components/` (Header, Footer, SupportCard e SearchDialog), `src/views/`, `src/search/`, `src/seo/` e `src/pages/og/`;
   - `scripts/lib/` (`conteudo.ts`, `prontidao.ts`, `seo-pages.ts` e `ymyl.ts`), `scripts/gates/lint-texto.ts` e `scripts/oracle/calc.py`;
   - os testes de e2e: `a11y`, `ads`, `budgets`, `navigation`, os `money-*`, `image-privacy`, `pdf-privacy` e `tool-guides`;
   - os testes de unidade: `routes`, os `seo-*`, `conteudo`, `prontidao`, os `calc-*`, `image-texts`, os `lint-texto-*`, `launch-kit` e `verificar`.

Você pode ler a web (WebSearch e WebFetch) para:

- as normas e páginas do Banco Central (`bcb.gov.br`), as leis e os decretos (`planalto.gov.br`) e o manual do BR Code;
- as páginas do CFPB em espanhol;
- a documentação dos pacotes.

Ler não é mandar pedido a um serviço. Não entre em conta, não crie conta e não preencha formulário.

# Escopo

Dentro, em itens:

1. Os glossários e o teste deles (decisão 3).
2. O formato de número, de CSV e do PDF em cada idioma (decisões 1, 5 e 6).
3. As páginas de imagem e de PDF em pt e es, com os hubs: rotas, registros e textos (decisões 2 e 4).
4. O Pix, com o oráculo antes do gerador (decisão 8).
5. As 8 calculadoras em português e o hub, com o oráculo antes dos motores (decisão 5).
6. As 5 calculadoras em espanhol e o hub (decisão 6).
7. Em pt e es: a home, o rodapé, a busca, o 404, as institucionais, o Open Graph e os sitemaps (decisão 7).
8. Os portões e os testes que crescem (decisão 9).
9. O Lighthouse, os screenshots, a revisão adversarial final, as correções, o relatório e uma seção nova no fim do `CLAUDE.md`.

Fora (não toque):

- Tudo da seção "Fora de toda run" do `CLAUDE.md`. Em especial: não mande nada a nenhum serviço, não crie conta e não publique.
- O `.github/` inteiro (a única exceção está na decisão 11), `scripts/ci/`, `PLANO-FILEORCA.md`, `docs/adr/ADR-001-plataforma-de-entrega.md`, `.githooks/` e `.claude/settings.json`.
- O `docs/design/`, que é só leitura: nenhum ícone, pose, cor, raio ou sombra nova. O amarelo (`sun`) vai só no Baixar.
- Os 15 guias em pt ou es (o plano os deixa só em inglês), os presets de dinheiro em pt ou es, casa e saúde, alemão e francês.
- A 2b (§ 85), os baixos das revisões da F4, da F5a e da F5b, e a § 103.
- Tabela oficial no código: imposto de renda, alíquota de IOF fixa, Selic, CDI, TR, IPCA ou qualquer taxa "de hoje". Toda taxa é campo, e o valor inicial é um exemplo rotulado como exemplo.
- Nome de banco, corretora, financeira ou produto, em qualquer texto.
- Os motores de imagem e de PDF. Só duas mudanças são permitidas:
  - o texto que o motor escreve no arquivo e que é texto do site, como a palavra da numeração de páginas, passa a vir da página (decisão 4);
  - um defeito de corretude que um teste novo achar é corrigido, com um teste que falha sem a correção e um §.

  Em inglês, a saída do motor não muda nenhum byte: a matriz de imagem e a de PDF passam sem mudança de asserção.
- Os motores de dinheiro que já existem. As 18 páginas em inglês continuam batendo no oráculo, com as mesmas fixtures (decisão 5).
- Dependência nova em `dependencies`. Em `devDependencies`, no máximo `qrcode` e `jsqr` (decisão 8), e os tipos do `qrcode`, se precisar.
- Tirar, pular, afrouxar ou mudar o sentido de teste que já existe. Uma asserção que muda por construção ganha um § com o que mudou e por quê, no modelo da § 171. Exemplos: uma contagem lida dos registros, ou a página de exemplo da § 84, que passou a ter tradução.
- No `CLAUDE.md`, só uma seção nova no fim. No `DECISOES.md`, só § novos.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do próximo § livre)

1. **O espanhol do site escreve número como nos EUA** (decisão do Victor).
   - **O número.** O `src/calc/parse.ts`, o `fileSize` e o resto da formatação passam a tratar `es` como `en`: "1,234.56" e "2.4 MB". O "68 %", com espaço, fica (design system).
   - **A § 112** muda só para o espanhol, num § novo. O `calc-parse.test.ts` ganha os casos do espanhol novo, e o caso antigo do espanhol vira a mudança registrada. Sai também a regra de não separar o milhar com quatro dígitos no espanhol (`parse.ts`): "1,234", como no inglês.
   - **O português** continua com "1.234,56".
   - **A moeda.** Hoje o `money()` e o `dollars()` de `src/calc/parse.ts` escrevem "1.234,56 $" fora do inglês. Passa a ser "R$ 1.234,56" no português e "$1,234.56" no espanhol, com teste.
   - **As datas** vão por extenso em cada idioma: "1 de novembro de 2026" e "1 de noviembre de 2026". As datas de "Revisado em" e "Última atualização" são o dia em Brasília, não em UTC (§ 207).
   - **O `OG_LOCALE` do espanhol** segue o público. Registre o valor.

2. **Rotas, slugs e equivalência.**
   - **Imagem e PDF.** As páginas em pt e es são equivalentes das em inglês. A linha do mapa ganha os caminhos `pt` e `es`, e o hreflang liga as três, com o x-default no inglês.
   - **Dinheiro em português.** As 8 calculadoras brasileiras e o hub delas são páginas próprias, só com `pt`, sem par.
     - Os ids são em inglês, com o prefixo `br-` (por exemplo, `br-sac-price`).
     - A área de anúncio é `dinheiro`.
   - **Dinheiro em espanhol.** Cada uma das 5 calculadoras entra na linha da calculadora em inglês, com o mesmo id e o caminho `es`. O hub em espanhol entra na linha do hub em inglês: é a mesma página de categoria, traduzida, e lista o que existe em espanhol.
   - **O menu de idioma** leva à página equivalente quando ela existe; senão, segue a § 84.
   - **Os slugs** são estes, sem acento:

     | Página | pt | es |
     | --- | --- | --- |
     | Hub de imagem | `/pt/ferramentas-de-imagem/` | `/es/herramientas-de-imagen/` |
     | Compress to 100 KB | `/pt/comprimir-imagem/para-100kb/` | `/es/comprimir-imagen/a-100kb/` |
     | Compress to 1 MB | `/pt/comprimir-imagem/para-1mb/` | `/es/comprimir-imagen/a-1mb/` |
     | Resize image | `/pt/redimensionar-imagem/` | `/es/redimensionar-imagen/` |
     | YouTube thumbnail | `/pt/redimensionar-imagem/miniatura-youtube/` | `/es/redimensionar-imagen/miniatura-youtube/` |
     | Crop image | `/pt/cortar-imagem/` | `/es/recortar-imagen/` |
     | Rotate image | `/pt/girar-imagem/` | `/es/rotar-imagen/` |
     | HEIC to JPG | `/pt/heic-para-jpg/` | `/es/heic-a-jpg/` |
     | WebP to JPG | `/pt/webp-para-jpg/` | `/es/webp-a-jpg/` |
     | PNG to JPG | `/pt/png-para-jpg/` | `/es/png-a-jpg/` |
     | Image to PDF | `/pt/imagem-para-pdf/` | `/es/imagen-a-pdf/` |
     | Hub de PDF | `/pt/ferramentas-pdf/` | `/es/herramientas-pdf/` |
     | Merge PDF | `/pt/juntar-pdf/` | `/es/unir-pdf/` |
     | Split PDF | `/pt/dividir-pdf/` | `/es/dividir-pdf/` |
     | Rotate PDF | `/pt/girar-pdf/` | `/es/rotar-pdf/` |
     | Delete pages | `/pt/excluir-paginas-pdf/` | `/es/eliminar-paginas-pdf/` |
     | Reorder pages | `/pt/organizar-paginas-pdf/` | `/es/ordenar-paginas-pdf/` |
     | PDF to JPG | `/pt/pdf-para-jpg/` | `/es/pdf-a-jpg/` |
     | Page numbers | `/pt/numerar-paginas-pdf/` | `/es/numerar-paginas-pdf/` |
     | Watermark | `/pt/marca-dagua-pdf/` | `/es/marca-de-agua-pdf/` |
     | Sign PDF | `/pt/assinar-pdf/` | `/es/firmar-pdf/` |
     | Compress PDF | `/pt/comprimir-pdf/` | `/es/comprimir-pdf/` |
     | Protect PDF | `/pt/proteger-pdf/` | `/es/proteger-pdf/` |
     | Unlock PDF | `/pt/desbloquear-pdf/` | `/es/desbloquear-pdf/` |
     | Hub de dinheiro | `/pt/calculadoras-financeiras/` (próprio) | `/es/calculadoras-financieras/` (par) |
     | Mortgage | `/pt/simulador-sac-price/` (próprio) | `/es/calculadora-de-hipoteca/` (par) |
     | Auto loan | `/pt/simulador-financiamento-veiculo/` (próprio) | — |
     | Personal loan | `/pt/simulador-emprestimo/` (próprio) | `/es/calculadora-de-prestamo-personal/` (par) |
     | Loan amortization | `/pt/amortizacao-antecipada/` (próprio) | — |
     | Credit card payoff | `/pt/calculadora-cartao-de-credito/` (próprio) | `/es/calculadora-de-tarjeta-de-credito/` (par) |
     | Debt payoff | `/pt/calculadora-de-dividas/` (próprio) | `/es/calculadora-de-deudas/` (par) |
     | Compound interest | `/pt/calculadora-juros-compostos/` (próprio) | `/es/calculadora-de-interes-compuesto/` (par) |
     | Rent vs buy | `/pt/alugar-ou-comprar/` (próprio) | — |

3. **Os glossários.**
   - **Os arquivos** são `docs/i18n/pt.md` e `docs/i18n/es.md`. Eles são escritos antes de qualquer tradução e seguidos por todos os textos.
   - **O que cada um traz:**
     - o registro: o pt é informal e caloroso, com "você"; o es é neutro, dos EUA e da América Latina, com "tú", como o design system pede;
     - a tabela dos termos de arquivo: arquivo, lote, ZIP, Baixar, arrastar e soltar, colar, metadados, GPS, compressão, e cada ferramenta e cada opção;
     - a tabela dos termos de dinheiro: em pt, parcela, saldo devedor, amortização, juros, CET, IOF, TR e entrada; em es, pago mensual, saldo, tasa de interés, APR e pago inicial;
     - as falas da Oli, da tabela do design system;
     - o formato de número, de moeda e de data;
     - uma lista "Nunca", com as variantes proibidas. Por exemplo: "fazer upload", se o glossário escolher "enviar"; e, no espanhol, "ordenador", "móvil" e "vosotros".
   - **No espanhol do dinheiro,** os termos seguem os que o CFPB usa nas páginas em espanhol lidas nesta run.
   - **O teste.** Um teste novo (por exemplo, `tests/unit/glossary.test.ts`) lê a lista "Nunca" de cada glossário e reprova o termo nos textos do idioma e no HTML do `dist/`, com controles positivo e negativo.

4. **As páginas de imagem e de PDF em pt e es são traduções, não páginas novas.**
   - **A mesma página.** Cada uma usa a mesma view, a mesma ilha, a mesma entrada e o mesmo Panel da página em inglês, com os textos do idioma. O modelo é a Compress image, que já existe nos três idiomas (§ 58).
   - **Os textos.** Cada ferramenta ganha `src/tools/<slug>/i18n/pt.ts` e `es.ts`, com os blocos que o `gate:conteudo` pede: como usar, especificações, perguntas e a nota de privacidade. O painel de PDF ganha `src/tools/pdf/i18n/pt.ts` e `es.ts`, e os textos de opção (`option-texts.ts`) passam a vir por idioma.
   - **Os nomes.** Os nomes das ferramentas vão traduzidos ("Comprimir imagem", "Juntar PDF"). Os formatos ficam: JPG, PNG, HEIC, WebP, PDF e ZIP.
   - **Título, descrição e H1.** O título começa pelo nome da ferramenta, a descrição tem de 120 a 160 caracteres, e o H1 vem em sentence case.
   - **O texto que o motor de PDF escreve no arquivo** e que é texto do site, como "Page 1 of 3" na numeração, passa a vir da página, no idioma dela. Em inglês, os bytes não mudam. Os acentos de pt e es cabem no WinAnsi. Aspas curvas e travessão continuam virando retos, e o texto da página diz isso onde importa.
   - **O nome do arquivo baixado.** O sufixo segue o idioma da página, pelo glossário, e o teste confere.
   - **Nenhuma frase em inglês numa página em pt ou es.** As exceções são nome próprio, nome de formato e o nome do autor. Um teste novo compara o texto visível e o `data-props` de cada página em pt e es do `dist/` com as frases dos textos em inglês e reprova a frase que aparecer igual, com controles.
   - **Os hubs em pt e es** usam a mesma view do hub em inglês, com o que existe no idioma e sem a seção de guias (nota da F5b). As páginas das ferramentas em pt e es também não levam a linha do guia.
   - **Os links.** Os chips de próximo passo e as relacionadas só apontam para páginas que existem no idioma (§ 6).
   - **O orçamento.** Cada página em pt e es carrega os mesmos 2 arquivos JS da página em inglês, com o mesmo nome e o mesmo hash. É a prova de que nenhum texto de idioma entrou no chunk compartilhado (§ 70 e § 136).

5. **As 8 calculadoras em português são adaptações, não traduções.**
   - **A convenção.** Siga a seção "Como acrescentar uma calculadora" do `CLAUDE.md` e a convenção do dinheiro (§ 111 e § 127): centavos inteiros, taxa em 1/10.000 de ponto, metade para cima, e a última parcela zera o saldo.
   - **O oráculo vem antes do motor.**
     - Os casos brasileiros entram num script independente, com numpy-financial e `decimal`: o `scripts/oracle/calc.py` estendido, ou um `scripts/oracle/calc_br.py` ao lado. A escolha vai num §.
     - As fixtures entram num commit antes de qualquer arquivo de motor ou de definição brasileiro. O relatório prova com o `git log -- fixtures/calc src/calc src/tools/calc`.
     - As fixtures das 18 em inglês não mudam (no máximo o SHA-256 do script no cabeçalho, se for o mesmo script). O `--check` e o diff provam.
     - A prova do mutante (`CALC_FIXTURES_DIR`) vale para as novas.
     - Um exemplo resolvido de fonte oficial que bata com a convenção entra como caso marcado. O que não bate vai para o `OFICIAIS.md`, com o motivo.
   - **As taxas.** No Brasil, as taxas são efetivas, ao mês ou ao ano.
     - Converta por capitalização, (1 + a)^(1/12) − 1, nunca dividindo por 12. Use a raiz inteira da § 111.
     - Onde a norma lida mostrar que o produto usa taxa nominal, a página usa a nominal e diz isso.
     - A convenção de cada calculadora vai para as premissas da página e para um §.
   - **As fontes.** Cada página cita as normas e as páginas do Banco Central, ou a lei no `planalto.gov.br`, lidas nesta run, com o link e a data.
     - Um domínio novo na lista do `scripts/lib/ymyl.ts` entra com teste e §.
     - O que não abrir vira pendência. Nunca use um site de terceiro como fonte.
   - **As 8:**
     1. **Simulador SAC × PRICE** (de Mortgage).
        - Campos principais: o valor do imóvel, a entrada (R$ ou %), o prazo e os juros ao ano.
        - Depois do resultado: a TR ao mês e os seguros e taxas em R$ por mês.
        - Resultado: os dois sistemas lado a lado (a primeira e a última parcela, o total de juros e o total pago), com o cronograma de cada um.
        - A convenção de partida:
          - a TR corrige o saldo no começo do mês, antes dos juros;
          - no SAC, a amortização é o saldo corrigido dividido pelos meses que faltam;
          - na PRICE, a parcela é recalculada sobre o saldo corrigido e os meses que faltam (com a TR em zero, ela fica fixa);
          - os seguros e as taxas somam à parcela e não mudam. A premissa diz que o seguro real muda com o saldo e a idade.
     2. **Simulador de financiamento de veículo** (de Auto loan).
        - Campos principais: o preço, a entrada, o prazo em meses e os juros ao mês. Depois do resultado: o IOF e as tarifas.
        - Resultado: a parcela, o total pago e o CET ao mês e ao ano.
        - O CET segue a fórmula da Resolução CMN nº 4.881/2020, a norma do CET desde 2021 (confira a vigente no site do BCB). A fórmula pede as datas dos fluxos: a run fixa e declara a convenção de dias.
        - O IOF é campo, na forma mais simples que o regulamento do IOF lido (Decreto nº 6.306/2007 e alterações) sustentar: as alíquotas como campos, ou o valor em R$ copiado da proposta. Se ele é financiado junto ou não, a run registra.
     3. **Simulador de empréstimo** (de Personal loan).
        - Campos principais: o valor, o prazo e os juros ao mês. Depois do resultado: o IOF e as tarifas.
        - Resultado: a parcela, o total pago e o CET, como no 2.
     4. **Amortização antecipada** (de Loan amortization).
        - Campos: o saldo devedor, os juros, os meses que faltam, o sistema (SAC ou PRICE) e o valor que a pessoa vai antecipar.
        - Resultado: reduzir o prazo × reduzir a parcela, lado a lado, com os juros que a pessoa deixa de pagar, o novo prazo e a nova parcela.
        - A regra do desconto dos juros na liquidação antecipada vem da norma vigente do CMN, lida no BCB.
     5. **Calculadora do cartão de crédito** (de Credit card payoff). A conta segue as regras brasileiras, lidas na fonte:
        - o rotativo só vale até o vencimento da fatura seguinte; depois, o saldo vai para o parcelamento (Resolução CMN nº 4.549/2017, alterada pela 5.112/2023);
        - os juros e encargos do rotativo e do parcelamento, somados, não passam do valor original da dívida (Lei nº 14.690/2023, art. 28);
        - as taxas do rotativo e do parcelamento e o IOF são campos;
        - a run desenha a comparação mais simples que essas regras sustentam, registra e testa o teto no oráculo. Por exemplo: pagar o mínimo, cair no rotativo e depois no parcelamento, contra parcelar a fatura já.
     6. **Calculadora de dívidas** (de Debt payoff): bola de neve × avalanche, com as taxas ao mês, em reais.
     7. **Calculadora de juros compostos** (de Compound interest).
        - Campos: a taxa ao mês ou ao ano (efetiva), o aporte mensal e o prazo.
        - Sem imposto de renda, que é tabela oficial: a premissa diz que o resultado é bruto.
     8. **Alugar ou comprar** (de Rent vs buy). Em reais. São campos:
        - o ITBI e o cartório, em % do imóvel;
        - o reajuste do aluguel, a valorização do imóvel e o rendimento do dinheiro investido;
        - o financiamento em SAC ou PRICE, com o SAC como padrão.
   - **O molde** é o da F4: `CalcTool.astro`, ResultHero, ScenarioCompare, AmortTable e ExportBar. Ele leva os blocos `data-ymyl`, o "Revisado por … em …", o selo "Seus números ficam no seu aparelho" e o aviso de ferramenta educativa.
   - **No celular,** o número do ResultHero fica acima de 740 px, a 360 × 740 (§ 124). Isso pede no máximo duas linhas de dois campos de meia largura, o rótulo numa linha só, e o resto depois do resultado.
   - **O CSV em português** usa ponto e vírgula, vírgula decimal e BOM UTF-8 (plano), e é lido de volta no teste contra o oráculo. **O PDF em português** sai em A4, com os textos em português.
   - **Faixas fixas.** Cada campo tem uma, e o erro diz a faixa no formato da página (§ 116). O exemplo inicial é rotulado como exemplo.
   - **O hub** `/pt/calculadoras-financeiras/` segue o molde do hub em inglês, sem presets e sem guias.
   - **Quem escreve.** Os textos das 8 e do hub são escritos pelo modelo forte, no agente principal, não por subagente.

6. **As 5 calculadoras em espanhol são traduções:** Mortgage, Personal loan, Credit card payoff, Debt payoff e Compound interest.
   - **As contas.** Elas usam a mesma definição, o mesmo motor e as mesmas fixtures da página em inglês, com o mesmo exemplo inicial. Os números da página em espanhol são os da página em inglês.
   - **Os textos** ficam em `src/tools/<slug>/i18n/es.ts` (`CalcPageTexts`), com as fontes do CFPB em espanhol lidas nesta run. Onde o CFPB não tiver a página em espanhol, vale a fonte oficial em inglês do mesmo órgão, e o texto diz que ela está em inglês.
   - **O CSV** sai como o do inglês (vírgula, ponto decimal e BOM). **O PDF** sai em Letter, com os textos em espanhol.
   - **Os links.** Nenhum link para preset ou guia de dinheiro, que só existem em inglês.
   - **O hub** `/es/calculadoras-financieras/` lista as 5.

7. **Em pt e es: hubs, home, rodapé, busca, 404 e institucionais.**
   - **A home** ganha as seções de imagem, de PDF e de dinheiro, no modelo da home em inglês (§ 118 e § 160), com o que existe no idioma.
   - **O rodapé** ganha as colunas de imagem, de PDF e de dinheiro.
   - **A busca** lista as páginas do idioma (§ 78), nas categorias do idioma, com sinônimos no idioma. O 404 de cada idioma busca nelas.
   - **As institucionais** são equivalentes: Privacidade, Termos, Sobre, Contato, Licenças e Apoio.
     - O conteúdo em pt e es fica igual ao em inglês. Por exemplo, o que a § 161 pôs sobre o PDF e o que a F4 pôs sobre as calculadoras.
     - Liste no plano as seções do inglês que faltam em pt e es, e preencha.
     - A data da última atualização muda onde o texto mudou.
   - **O Open Graph** do build sai para cada página nova em cada idioma, e os sitemaps de pt e es levam as páginas novas.

8. **O Pix.**
   - **As fontes:** o manual do BR Code e o regulamento do Pix, no site do Banco Central, lidos nesta run, com o link e a data.
   - **O código** é um BR Code estático, com estes campos:
     - 00;
     - 26: o GUI `br.gov.bcb.pix` e a chave do `docs/F0-SAIDA.md`, gravada numa linha de configuração;
     - 52 (`0000`) e 53 (`986`);
     - 54, só com valor: `5.00`, `10.00` e `20.00`;
     - 58 (`BR`), 59 (`VICTOR YUKI MATUSITA`) e 60 (`CURITIBA`);
     - 62, com o 05 em `***`;
     - 63: o CRC16-CCITT (polinômio 0x1021, início 0xFFFF), em 4 dígitos hexadecimais maiúsculos.
   - **O oráculo vem antes do gerador.**
     - É um script Python separado, `scripts/oracle/pix.py`, só com a biblioteca padrão. O CRC vem do `binascii.crc_hqx`, não de código copiado do gerador.
     - Ele roda com `uv run --no-project --python 3.13 python -I scripts/oracle/pix.py`, e o `--check` compara sem gravar.
     - Ele reproduz o exemplo do manual (`…63041D3D`) e grava o `fixtures/pix.json` com os quatro códigos (qualquer valor, R$ 5, R$ 10 e R$ 20), o SHA-256 do script e a versão do Python.
     - O JSON entra num commit antes do gerador, e o relatório prova com o `git log`.
   - **O gerador** é em TypeScript, sem dependência, com o CRC próprio (por exemplo, `src/platform/pix.ts`), e roda no build. O Vitest prova que:
     - ele reproduz o exemplo do manual e os quatro códigos do JSON, byte a byte;
     - o SHA-256 do oráculo é o que está no JSON;
     - os controles negativos falham: outra chave muda o CRC, e um nome acima de 25 caracteres ou uma cidade acima de 15 é recusado.
   - **O QR** sai do `qrcode` (MIT), só no build, em `devDependencies` (§ 13), como SVG inline e sem logo.
     - Os módulos escuros ficam sobre fundo claro nos dois temas, com a zona de silêncio, e só com tokens.
     - O nível de correção de erro é escolha registrada.
   - **A prova do QR.** Um teste rasteriza cada SVG do `dist/` com o `@resvg/resvg-js` e o lê com o `jsqr` (Apache-2.0, em `devDependencies`). Ele devolve exatamente o código do JSON, nos quatro valores.
   - **A página `/pt/apoie/`.** O SupportCard em português ganha o bloco Pix do design system (`.fo-pix`):
     - o QR;
     - o OptionGroup, com Qualquer valor, R$ 5, R$ 10 e R$ 20;
     - o "copia e cola", com o botão "Copiar código";
     - "Em nome de Victor Yuki Matusita".

     O Ko-fi continua. Não há ilha Preact: a troca de valor é de preferência por CSS, e o copiar usa o menor script possível. A página fica dentro dos orçamentos, e nenhuma requisição sai por causa do Pix.
   - **Os outros lugares do pedido em português.** Os textos são os da tabela "Doações" do plano:
     - o botão da linha do café (§ 49) vira "Pagar um café no Pix" e leva a `/pt/apoie/#pix`;
     - o rodapé diz "Curtiu? Me paga um café".
   - **O evento.** O clique em "Copiar código" manda o `donate_click` com o lugar. Se a run separar o Pix do Ko-fi, é um valor novo numa lista fechada (§ 10), com teste.
   - **Privacidade e Termos em português.** O Pix é estático, e o site não sabe quem pagou nem quanto. A devolução, se alguém pedir, é só pelo botão de devolução do próprio Pix (plano).
   - **Um E2E** em `/pt/apoie/`, nos dois navegadores:
     - cada valor mostra o QR e o código certos;
     - o "Copiar código" põe o código exato na área de transferência;
     - nada sai da página.

9. **Os portões e testes que crescem.**
   - **`a11y.spec.ts`:** já pega toda página do mapa em todo idioma. Ele ganha o bloco do Pix e o estado de resultado de uma ferramenta de imagem, de uma de PDF e de uma calculadora, em pt e em es.
   - **`ads.spec.ts`:** as páginas de ferramenta e de dinheiro em pt e es, lidas do mapa e dos registros, nos estados e nas larguras do inglês. Isso fecha o baixo a-06 da F3. Nas calculadoras em pt e es, o ResultHero fica acima da dobra a 360 × 740.
   - **`budgets.spec.ts`:** as páginas em pt e es, com os mesmos 2 arquivos JS (nome e hash) da página em inglês, e a `/pt/apoie/`. As listas que existem não mudam.
   - **Os testes de dinheiro** pegam as páginas novas pelo registro:
     - o `calc-defs.test.ts` e o `calc-oracle.test.ts`;
     - o `money-calc.spec.ts`, com o CSV lido de volta contra o oráculo (em pt, com ponto e vírgula);
     - o `money-privacy.spec.ts`, com sentinelas no formato de cada idioma;
     - o `money-speed.spec.ts`: os 16 ms por tecla no SAC × PRICE, que tem dois cronogramas.
   - **Um spec novo de idioma,** com um nome que caia no fim da lista (por exemplo, `tool-i18n.spec.ts`; veja a decisão 11). Nos dois navegadores, para cada ferramenta de imagem e de PDF em pt e es, ele:
     1. abre a página (status 200, H1 e `lang` do idioma);
     2. solta uma fixture que ela aceita, espera o resultado, confere os textos do painel no idioma e baixa;
     3. confere o nome do arquivo e a saída, como a página em inglês confere;
     4. confere a privacidade, como o `image-privacy.spec.ts` e o `pdf-privacy.spec.ts`: só GET da própria origem, sem corpo nem query string.
   - **Os testes de unidade e os portões:**
     - o teste de vazamento de inglês e o do glossário (decisões 3 e 4);
     - o `routes.test.ts`: os pares, as brasileiras sem par e as em espanhol com par;
     - o `gate:seo`: o hreflang recíproco, o x-default, o canonical e os sitemaps de pt e es, com as contagens lidas do mapa;
     - o `gate:conteudo` e o `gate:prontidao`, com as frases de cada idioma e controles positivo e negativo;
     - o `gate:dinheiro-saude`, que já conta as rotas × idiomas;
     - o `lint:texto`, com amostras de pt ("R$ 1.234,56") e de es ("$1,234.56"), e um teste.
   - **`lighthouserc.json`:** ganha o `/pt/simulador-sac-price/` e o `/pt/apoie/`, com desempenho 90 ou mais e CLS de até 0,05. As páginas que já estavam não pioram.
   - **`launch-kit.test.ts`:** se uma contagem do kit do Product Hunt mudar, o kit é atualizado pela regra dele. Ele não ganha afirmação nova sobre idiomas.
   - **As asserções que mudam por construção** vão num §, no modelo da § 171. Exemplos: as contagens da busca e do sitemap, e o exemplo da § 84 no `navigation.spec.ts`, que passa para uma página que segue só em inglês.

10. **Os agentes de texto.**
    - As traduções das ferramentas de imagem e de PDF podem ir para agentes em paralelo. Cada agente é dono de um conjunto de arquivos que nenhum outro toca: por exemplo, imagem em pt, PDF em pt, imagem em es, PDF em es e dinheiro em es.
    - O agente principal escreve antes os glossários, os tipos, as rotas e os registros, e depois junta tudo.
    - Cada agente roda no modelo forte (`model: 'opus'`) e segue o glossário e o `lint:texto`.
    - Os agentes em worktree nascem da `main`: o primeiro passo de cada um é `git merge --ff-only fase-06`.

11. **O CI e os minutos.**
    - **Não mexa no `.github/`, a não ser que uma parte passe de 900 s.** Nesse caso:
      - divida a parte no `ci.yml`, só com mais `--shard`, no modelo da decisão 14 da F5a;
      - atualize o `tests/unit/verificar.test.ts` e a seção nova do `CLAUDE.md`;
      - o merge passa a ser do Victor, porque o job recusa PR que muda o pipeline. Isso vai num §, na descrição da PR e na resposta final.

      Uma parte entre 700 s e 900 s: registre a medida e a proposta de uma run de ajuste.
    - **Antes de cada push com testes novos,** rode o `--list` de cada parte:
      - `pnpm exec playwright test --project=chromium --shard=i/3 --list`;
      - `pnpm exec playwright test --project=webkit --shard=i/7 --list`.

      O `design.spec.ts` e o `image-matrix.spec.ts` ficam em partes diferentes do WebKit (§ 142).
    - **Os minutos.** O CI só roda com PR aberta. A prévia do Workers Builds sai de qualquer push da branch, em `https://fase-06-fileorca.vmatusita.workers.dev`, sem gastar minutos. Por isso:
      - faça push nos marcos, para ter a prévia;
      - abra a PR só quando o `pnpm verificar` local estiver verde.

# Armadilhas conhecidas

- As do `CLAUDE.md`, da F1a à F5b. Em especial:
  - heredoc e `node -e` com crase ou barra invertida no Git Bash: escreva arquivos com a ferramenta de escrita;
  - o `exactOptionalPropertyTypes`, e o `pnpm tipos` antes do push (ele confere os specs);
  - a porta 4173 com `reuseExistingServer`: em outra worktree, use o `FO_PORT`, de 4174 a 4189;
  - o `uv` desta máquina não está no PATH: chame pelo caminho completo (`CLAUDE.md`, F4). Também não há `python` no PATH;
  - agentes em worktree nascem da `main`, e agentes de workflow Sonnet assinam como Sonnet: para código e texto, use `model: 'opus'`;
  - o `serve-dist` devolve o 404 mais próximo: teste de página exige status 200;
  - o aviso de cookies cobre o canto de baixo à esquerda: feche-o antes (`dismissCookies`).
- A Compress image em pt e es já existe. A mudança do número no espanhol muda o que ela mostra ("2,4 MB" vira "2.4 MB"), e os testes dela mudam, com §.
- Português e espanhol são uns 20% a 30% mais longos que o inglês. Isso pesa:
  - na distância dos anúncios;
  - no ResultHero acima da dobra;
  - nos botões e nos rótulos de meia largura.

  Confira nos dois navegadores, a 360 px.
- Texto do site nunca fica no código. Um texto em inglês escrito dentro de um componente vaza nas páginas em pt e es. O teste de vazamento acha; corrija levando o texto para os arquivos de tradução.
- O `lint:texto` só confere os textos alterados contra `origin/main`, então todo texto novo passa por ele.
- O `Intl` pode formatar diferente no Node e no navegador. Siga a § 112 (formatação à mão) em tudo que a página e a ilha mostram.
- O WinAnsi do PDF não tem aspas curvas, travessão nem "≥". O `winAnsi()` troca, e todo texto novo do PDF em pt e es passa por ele.
- Na produção, nada de visita de navegador sem bloquear os domínios do Google com `context.route` (`CLAUDE.md`, F3).
- As páginas do Banco Central e do CFPB em espanhol podem não abrir no WebFetch. Tente outra página oficial do mesmo órgão, como o normativo em PDF no `bcb.gov.br`. Nunca use site de terceiro como fonte: o que não abre vira pendência.

# Critérios de aceitação (cada um com evidência no relatório)

1. Todas as páginas da decisão 2 respondem 200 no `dist/` e na prévia, com H1, título, descrição, `lang` e canonical do idioma. Se a válvula cortar algo, a lista diz o que foi para a 6b.
2. O `gate:seo` fica verde:
   - o hreflang é recíproco nos três idiomas, com o x-default no inglês;
   - as brasileiras ficam sem par, e as em espanhol, com par;
   - os sitemaps de pt e es têm as contagens lidas do mapa.
3. O teste de vazamento de inglês e o do glossário ficam verdes, com a saída colada.
4. Cada ferramenta de imagem e de PDF em pt e es processa uma fixture nos dois navegadores (o spec novo), e a saída passa nas mesmas conferências da página em inglês.
5. O dinheiro em português bate com o oráculo:
   - as fixtures das calculadoras brasileiras estão num commit anterior a qualquer motor ou definição brasileira, provado pelo `git log`;
   - todo motor novo bate no centavo com o oráculo, e o mutante reprova;
   - as 18 em inglês passam com as mesmas fixtures.
6. As 5 em espanhol dão os mesmos números da página em inglês. O CSV e o PDF de cada idioma saem no formato das decisões 1, 5 e 6, lidos de volta no teste.
7. O Pix bate com o oráculo:
   - o `fixtures/pix.json` está num commit anterior ao gerador;
   - o gerador reproduz o exemplo do manual do BC e os quatro códigos do JSON;
   - o QR de cada valor, lido de volta pelo `jsqr`, devolve o mesmo código.
8. O `lint:texto` dá zero erro de gramática em pt e es, com a contagem de textos e de avisos.
9. O `budgets.spec.ts` fica verde, com as páginas em pt e es nos mesmos 2 arquivos JS da página em inglês. Uma tabela mostra o JS das páginas em inglês antes e depois, com o mesmo número de arquivos.
10. O `ads.spec.ts`, o `a11y.spec.ts`, o spec novo e os `money-*` ficam verdes, com o ResultHero acima da dobra nas calculadoras em pt e es.
11. O Lighthouse no celular das duas páginas novas do `lighthouserc.json` dá desempenho 90 ou mais e CLS de até 0,05, e as que já estavam não pioram.
12. O `gate:conteudo`, o `gate:prontidao`, o `gate:dinheiro-saude`, o `gate:links` e o `gate:licencas` ficam verdes.
13. Todas as partes do CI ficam verdes, com uma tabela do total do `verificar` de cada uma.
    - Não há `skip`, `fixme`, `only`, `retries` nem `continue-on-error` novo.
    - O `git diff --stat origin/main...HEAD -- .github scripts/ci PLANO-FILEORCA.md docs/adr/ADR-001-plataforma-de-entrega.md .githooks .claude/settings.json docs/design` sai vazio, ou só com o `ci.yml`, pela exceção da decisão 11.
14. O `pnpm verificar` inteiro fica verde na sua máquina, com a saída e o tempo de cada portão (ou as partes, pela regra da Verificação).
15. Nada entra em `dependencies`. Em `devDependencies`, só `qrcode` e `jsqr` (e os tipos do `qrcode`, se precisar), e o `pnpm-lock.yaml` muda só por eles.
16. A prévia tem o `build.txt` com o commit. O Playwright confere nela, com o Google bloqueado, a 360 e a 1280 px e com screenshot:
    - uma ferramenta de imagem em pt e uma de PDF em es;
    - o simulador SAC × PRICE;
    - a `/pt/apoie/`, com o Pix.
17. A PR é mesclada pelo job de merge depois do `gh pr ready`, ou fica pronta para o merge do Victor, pela decisão 11. Com o merge, o pós-deploy fica verde, e o `build.txt` de produção mostra o commit. Isso vai na resposta final, não no relatório.

# Verificação: rode de verdade

- Siga a ordem das fatias de "Como trabalhar", e cada fatia termina verde antes da próxima.
- Leia cada falha, corrija a causa e repita até passar.
  - É proibido desligar, pular, marcar como skip, afrouxar limiar, mudar orçamento, ligar `retries` ou aumentar timeout para passar.
  - Se um portão estiver de fato errado, corrija o portão com um teste que prove o erro e registre no `DECISOES.md`.
- No fim, o `--check` do oráculo de dinheiro e o do Pix dão zero, com a saída colada.
- No fim, rode o verificar inteiro numa execução limpa (`CI=true pnpm install --frozen-lockfile` e `pnpm verificar`, que já builda do zero) e guarde a saída completa. Se o todo passar de 900 s na sua máquina só pelo tamanho da suíte:
  - rode as mesmas partes do CI em sequência e cole o resumo de cada uma;
  - registre num § a medida e a proposta. O limite não muda.
- Rode o `pnpm screenshots` depois do último ajuste visual. A pasta é `docs/relatorios/fase-06/componentes/`, e as pastas antigas ficam como estão. Ela traz, nos dois temas, a 360 e a 1280 px:
  - uma ferramenta de imagem, uma de PDF e uma calculadora, em pt e em es;
  - a `/pt/apoie/`.
- Depois de abrir a PR, acompanhe com `gh pr checks <n> --watch` e conserte o que só falha no Ubuntu. Leia o total de cada parte no log (`gh run view <id> --log`, com o `--attempt` do `CLAUDE.md` depois de um rerun).

# Autonomia e decisões

Você está rodando sozinho e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma.

Régua de decisão:

1. Este prompt.
2. O `CLAUDE.md`, a ficha F6 e o resto do plano.
3. O `docs/design/` e o `DECISOES.md`.
4. Na dúvida, a opção mais simples e reversível.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos:

- onde moram os caminhos por idioma nos registros, e como os tipos passam a exigir os textos de pt e es;
- a convenção de cada calculadora brasileira (taxa, TR, seguros, IOF, dias do CET e a regra do cartão) e o script do oráculo;
- o sufixo do arquivo baixado em cada idioma;
- o `OG_LOCALE` do espanhol;
- o nível de correção de erro do QR, e o jeito de trocar o valor sem ilha;
- o valor novo do `donate_click`, se houver.

Uma mudança de arquitetura (host, framework, estrutura, pipeline) vira uma ADR "Proposta" em `docs/adr/` e uma pendência. O resto segue.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos:

- uma página oficial que não abre;
- o LanguageTool sem responder;
- o comentário do Workers Builds que não chega.

Válvula de estouro, nesta ordem, se o tempo ou o limite apertar:

1. O dinheiro em espanhol (as 5 e o hub) vai para a run 6b (branch `fase-06b`), como a ficha permite.
2. O PDF em espanhol (as 12 e o hub) vai para a 6b.
3. A imagem em espanhol (as 7, os 3 presets e o hub) vai para a 6b. A Compress image em espanhol, que já existe, fica.

O modelo é a § 85: saem a rota, a página, o cartão e todo link para ela, e nada fica "em breve". O que for cortado vai para o relatório como pendência, com o que falta.

Nunca corte:

- o português inteiro: imagem, PDF, as 8 calculadoras e o hub;
- o Pix;
- os glossários, o formato de número de cada idioma e os oráculos antes dos motores;
- os testes de privacidade, orçamento, anúncio e acessibilidade do que entrar;
- a revisão adversarial final.

# Git e segurança

- **Começo.**
  - Rode `git switch main` e `git pull --ff-only`.
  - Antes de criar a branch, o `git status` só pode mostrar como não rastreados `docs/prompts/prompt-fase-06.md` e `docs/prompts/prompt-fase-06.txt`, o prompt desta run.
  - Crie a branch com `git switch -c fase-06`. Os dois arquivos entram sem edição no primeiro commit dela.
  - Se eles não estiverem lá, grave este prompt, exatamente como você o recebeu, em `docs/prompts/prompt-fase-06.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main (Conventional Commits). O commit de cada oráculo vem antes do código que ele confere.
- **Push da branch nos marcos.** O Workers Builds publica a prévia de cada push, e o CI não roda sem PR.
- **A PR em rascunho, só com o verificar local verde** e tudo commitado. Use `gh pr create --draft --base main --head fase-06`, num comando separado do push. O título e a descrição vão em português, com o resumo e o link do relatório.
- **Se a main andar durante a run,** faça `git fetch` e `git merge origin/main` na branch, nunca rebase. Renumere os § se colidirem e registre.
- **As worktrees** dos agentes e da revisão são removidas no fim com `git worktree remove`. A da revisão (`.claude/worktrees/revisao-f6`) é só de leitura.
- **Fim:**
  1. Com o CI verde no rascunho, commite o relatório (citando essa execução), a revisão e os screenshots.
  2. Faça o push e rode logo em seguida `gh pr ready`. A concorrência do CI cancela a execução do push e fica a do `ready_for_review`.
  3. Sem mudança no `.github/`, o job de merge mescla com o CI verde. Acompanhe até o merge. Depois dele, confira o pós-deploy (`gh run list --workflow pos-deploy.yml --limit 1`) e o `build.txt` de produção com o `curl`, sem navegador.
  4. Com mudança no `.github/`, a run termina com a PR pronta e o CI verde, e o merge fica para o Victor.

  A run termina de um destes jeitos, e a resposta final diz qual: a PR mesclada com o pós-deploy verde; a PR pronta para o merge do Victor; ou a pendência que impediu os dois.
- **Nunca:**
  - push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`;
  - mexer em `core.hooksPath` ou em `.githooks/`;
  - `gh pr merge`, `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo create`;
  - postar, enviar formulário, criar conta ou subir arquivo para qualquer serviço;
  - `npm publish` ou `wrangler deploy` em qualquer forma, inclusive `--dry-run`.

  O `.claude/settings.json` nega esses comandos. Não tente contornar.

# Como trabalhar

1. **Explorar**, com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) a ficha F6, as seções do plano e as regras do `CLAUDE.md`, num checklist "requisito → onde vai ficar → que teste prova";
   - (b) a arquitetura de idioma:
     - o que faz uma página existir num idioma: o mapa, os tipos, os registros, as views e os textos da ilha no `data-props`;
     - o que muda quando uma linha ganha `pt` e `es`: o hreflang, o menu, o sitemap, a busca, o Open Graph e os portões;
     - que testes hoje só leem o inglês;
   - (c) o dinheiro:
     - o que cada adaptação reaproveita da F4: as definições, os motores e o oráculo, a APR atuarial da Personal loan para o CET e a raiz inteira para a taxa efetiva;
     - o que é novo: o SAC, a TR, o CET e o cartão;
   - (d) as fontes brasileiras, cada uma com o link, a data e o que ela diz:
     - o CET (Resolução CMN 4.881/2020);
     - o rotativo e o parcelamento (Resoluções 4.549/2017 e 5.112/2023, e a Lei 14.690/2023);
     - a liquidação antecipada;
     - o IOF (o regulamento vigente);
     - o SAC, a PRICE e a TR, no BCB;
     - o manual do BR Code;
   - (e) o espanhol: as páginas do CFPB em espanhol de cada uma das 5 calculadoras, os termos que elas usam e o jeito de escrever número e porcentagem;
   - (f) o CI: o tempo por spec da run 41372335840 e a projeção do `--list` com as páginas novas.
2. **Planejar.** Escreva `docs/relatorios/fase-06-plano.md`, autossuficiente. Ele é o gabarito da revisão e traz:
   - as interfaces dos registros e dos tipos por idioma;
   - a tabela das páginas, com o id, os caminhos, o par e os textos;
   - as convenções e os campos de cada calculadora brasileira, com a fonte;
   - o desenho do Pix;
   - o esqueleto dos glossários;
   - cada critério ligado a um teste ou comando;
   - a projeção das partes do CI;
   - a ordem de construção.
3. **Implementar** em fatias que terminam verdes, nesta ordem:
   1. a fundação:
      - os glossários e o teste deles;
      - o número, o CSV e o PDF em cada idioma;
      - os caminhos por idioma nos registros e nos tipos;
      - o teste de vazamento de inglês;
   2. o Pix: o oráculo (num commit), o gerador, o QR, os testes, o SupportCard, a linha do café e o rodapé;
   3. imagem e PDF em português: os hubs e as páginas, com os testes;
   4. o dinheiro em português: o oráculo (num commit), os motores, as 8 e o hub, uma calculadora por vez, com os testes dela;
   5. em português: a home, o rodapé, a busca, o 404 e as institucionais;
   6. imagem e PDF em espanhol;
   7. o dinheiro em espanhol;
   8. em espanhol: a home, o rodapé, a busca, o 404 e as institucionais;
   9. o CI (o `--list` e as partes), o Lighthouse e os screenshots.

   O agente principal, no modelo forte, faz a fundação, os registros, os motores, o Pix e os textos de dinheiro em português. As traduções podem ir para os agentes da decisão 10.
4. **Revisão adversarial final**, no método da F3 (`CLAUDE.md`, F3, § 92 a § 94):
   - **Onde:** sobre um commit fixo, registrado, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`. Cada lente usa um `FO_PORT` (de 4174 a 4180) e uma `--output` só dela.
   - **As lentes:** sete lentes Sonnet em contexto limpo, contra este prompt e a ficha:
     - (a) corretude: as calculadoras brasileiras contra o oráculo e as normas lidas, com uma amostra refeita por conta própria; o Pix contra o manual; o CSV e o PDF de cada idioma; as 5 em espanhol com os números do inglês;
     - (b) privacidade e segurança: nenhum número digitado na URL ou no GA4 em pt e es; nada sai das ferramentas em pt e es; o Pix é estático;
     - (c) anúncio e política: as distâncias nas páginas em pt e es; as regras de dinheiro (nenhum banco, nenhuma taxa de hoje); o rótulo do anúncio em cada idioma; as regras do pedido de café;
     - (d) acessibilidade (WCAG 2.2 AA): o `lang`; os nomes acessíveis traduzidos, inclusive os textos escondidos, como o "para" e o "a" das setas; os formulários das calculadoras; o bloco do Pix;
     - (e) desempenho e SEO: o orçamento, o Lighthouse, o hreflang, o canonical, os sitemaps, os slugs, e os títulos e as descrições em cada idioma;
     - (f) design system e voz: os tokens, o bloco do Pix, o sentence case, uma exclamação por tela e a tabela de falas do design system;
     - (g) idioma: o português do Brasil natural e o espanhol neutro com "tú"; o glossário seguido; os falsos cognatos; as frases que sobraram em inglês; a moeda, o número e a data de cada idioma.
   - **Os céticos:** cada achado crítico, alto ou médio ganha um cético próprio, e os baixos de cada lente vão a um cético só.
   - **As correções:**
     - crítico e alto confirmados são sempre corrigidos;
     - médio é corrigido se a correção é local;
     - baixo vai para o relatório.

     Cada correção leva um teste que falha sem ela e um §.
   - **A segunda passada:** depois das correções, ela revisa o diff delas.
   - Tudo fica em `docs/relatorios/REVISAO-F6.md`. Remova a worktree no fim.

# Relatório final

Escreva `docs/relatorios/fase-06.md` em português, commitado na branch antes do `gh pr ready`. Ele cita a última execução verde do CI com código ou teste, com o link e o total de cada parte.

O relatório traz:

- o resumo e a tabela das páginas: o id, os caminhos em en, pt e es, o par no hreflang, o H1, o JS inicial e as requisições;
- o `git log` que prova os oráculos antes dos motores e do gerador, e a saída dos dois `--check`;
- para cada calculadora brasileira: os campos, a convenção, as fontes (link e data) e os casos do oráculo, com os exemplos oficiais que entraram ou não;
- o Pix: os quatro códigos, a leitura do QR pelo `jsqr` e o que a `/pt/apoie/` mostra;
- a saída do teste de vazamento de inglês, do glossário, do spec novo e dos `money-*`;
- um resumo dos glossários (o arquivo é a fonte);
- o orçamento: as páginas em pt e es, e as em inglês antes e depois;
- o Lighthouse das páginas do `lighthouserc.json`;
- os screenshots;
- o CI: a tabela das partes antes e depois, onde o `--list` pôs os specs, os minutos de cada execução e a divisão do `ci.yml`, se houver;
- o resumo da revisão por lente e severidade, apontando para o `REVISAO-F6.md`;
- a saída real e completa do `pnpm verificar` local, com o tempo de cada portão;
- o link da prévia e o que você conferiu nela;
- as decisões novas, apontando os §;
- o que a válvula cortou e o que fica para a 6b, se houver;
- **a lista do que é do Victor, em passos:**
  1. O merge. Se foi automático, conferir o merge, o pós-deploy e o `build.txt`, que a resposta final traz. Se é dele, porque a run dividiu o CI: conferir o diff do `ci.yml` e dar o merge.
  2. O Pix: escanear com o app do banco o QR da `/pt/apoie/` nos quatro valores e conferir o nome e o valor, sem pagar. Depois, copiar o "copia e cola" e colar no app.
  3. Ler o português no site, as 8 calculadoras primeiro, depois imagem e PDF. Ajustes viram uma run curta de ajuste. A linha "Revisado por" leva o nome dele.
  4. Abrir no celular uma ferramenta de imagem em espanhol e a calculadora de hipoteca em espanhol.
  5. No Search Console, pedir a indexação dos hubs em pt e es e do simulador SAC × PRICE.
  6. Se for postar no Product Hunt depois do merge, conferir as contagens do kit (o teste reprova se elas não baterem).
  7. As pendências que seguem abertas: a 2b, os baixos da F4, da F5a e da F5b, a § 103, o `docs/F0-SAIDA.md` e o que esta run deixou para a 6b.
  8. Gerar o prompt da F7, e o da 6b, se a válvula cortou.
- **uma nota para a F7:**
  - casa e saúde ficam em inglês (plano);
  - o `qrcode` passa a ir para o navegador, então sai de `devDependencies` para `dependencies`;
  - o que a home e o rodapé de pt e es fazem com as calculadoras novas, que só existem em inglês;
- **uma nota para a F8:** as páginas de pt e es no service worker, e o que a revisão da F8 deve olhar no dinheiro brasileiro.

Acrescente no fim do `CLAUDE.md` uma seção curta, "F6: português e espanhol", com:

- os comandos novos: o oráculo do Pix, e o do dinheiro brasileiro, se for outro script;
- como uma página ganha versão em pt e es, e como uma calculadora brasileira entra;
- o formato de número, de CSV e de PDF de cada idioma;
- o Pix: onde está a chave e como o código e o QR são provados;
- as armadilhas que você achou.

Não apague nada do que já existe.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR e o estado do merge e do pós-deploy.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, os glossários e a descrição da PR.

Em inglês: o código, os nomes de arquivo, os identificadores e os commits.

Os textos do site ficam nos arquivos de tradução de cada idioma, com a voz de `docs/design/README.md` e o glossário do idioma.
```

## Como executar

São quatro etapas: o pré-voo, a run, o acompanhamento e a volta.

### 1. Pré-voo (uns 10 min)

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # a8f98e8 (o merge da F5b) ou mais novo
git status                  # só docs/prompts/prompt-fase-06.md e .txt como não rastreados
git config core.hooksPath   # tem que responder .githooks
gh auth status              # logado; confira se "workflow" aparece nos escopos
claude --version            # o modo auto pede 2.1.83 ou mais
powercfg /change standby-timeout-ac 0
```

- **O escopo `workflow` do `gh`.** Se ele não aparecer no `gh auth status`, rode `gh auth refresh -s workflow`. Ele só faz falta se a run precisar dividir o CI (decisão 11), mas sem ele o push do `ci.yml` falha no meio da run.
- **O `uv`.** A run roda dois oráculos em Python pelo `uv`. Confira que ele ainda responde:

  ```powershell
  $uv = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter uv.exe | Select-Object -First 1 -ExpandProperty FullName
  & $uv --version
  ```

- **Minutos do GitHub Actions.** Confira o uso em github.com → Settings → Billing and plans. Cada execução do CI gasta uns 80 min hoje, e a F6 soma muitos testes. Conte de 3 a 5 execuções, de 80 a 110 min cada: até uns 550 min. O plano grátis tem 2.000 min por mês. Se faltar minuto, o CI não roda e a PR não mescla.
- **O Product Hunt de terça (3/nov)** não depende desta run. Se a F6 mesclar antes e mudar uma contagem, o kit vem atualizado na PR; confira no dia.
- Volte o `powercfg` ao normal depois da F6.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-06
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-06.txt`, que começa por `ultracode`, e deixe rodar.

Opcional, logo depois de colar:

```text
/goal pnpm verificar verde, todas as partes do CI verdes, docs/relatorios/REVISAO-F6.md sem achado crítico ou alto aberto, e a PR da fase-06 mesclada pelo job de merge ou pronta para o merge do Victor
```

Um avaliador separado confere essa condição a cada turno.

Se cair ou o limite acabar, retome com `claude --resume fase-06` e mande: "continue de onde parou: leia docs/relatorios/fase-06-plano.md, o git log da branch fase-06 e o estado da PR, e siga".

Headless, se preferir disparar e sair:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-06.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-06.json
(Get-Content $HOME\run-fase-06.json | ConvertFrom-Json).session_id   # guarde: é o único jeito de retomar
```

**O tamanho da run.** É a maior até agora:

- 63 páginas novas;
- uns 250 KB de texto traduzido por idioma;
- 8 calculadoras brasileiras com oráculo e normas a ler;
- o Pix;
- a revisão em sete lentes, com céticos.

Comece com bastante folga no limite semanal do Claude Code. Se o limite acabar no meio, retome na janela seguinte: os commits pequenos guardam o que já foi feito. Se apertar, a válvula manda para uma 6b, nesta ordem: o dinheiro em espanhol, depois o PDF em espanhol, depois a imagem em espanhol. O português e o Pix nunca saem.

**Por que o modo `auto`:** a run faz várias coisas sem perguntar:

- builda e roda o Vitest, o Playwright em várias portas e o Lighthouse;
- roda os dois oráculos com o `uv`, que pode baixar o Python 3.13;
- instala o `qrcode` e o `jsqr` como `devDependencies`;
- lê a web (BCB, `planalto.gov.br` e CFPB);
- cria e remove worktrees de agentes e da revisão;
- faz commit e push da branch, abre a PR em rascunho e a marca como pronta;
- talvez mexa no `ci.yml`, se uma parte passar de 900 s.

O `auto` deixa tudo isso passar e barra o que parece arriscado. As regras `deny` do `.claude/settings.json` valem em qualquer modo: push na main, `gh pr merge`, `gh repo create`, `wrangler deploy`, reset e amend. O prompt não pede nada disso.

### 3. Acompanhar

- **A prévia sai antes da PR.** A branch ganha prévia a cada push, em `https://fase-06-fileorca.vmatusita.workers.dev/pt/`, sem gastar minutos do Actions.
- **Os oráculos aparecem cedo** na branch, cada um num commit antes do código: o `fixtures/pix.json` e as fixtures brasileiras em `fixtures/calc/`.
- **A PR aparece em rascunho só no fim,** com o verificar local verde. A revisão sai em `docs/relatorios/REVISAO-F6.md`.
- **O merge** é automático com o CI verde, a não ser que a run tenha dividido o CI. Nesse caso, a descrição da PR avisa, e o merge é seu.

### 4. Ao voltar

1. Leia `docs/relatorios/fase-06.md` e confira as evidências:
   - o `git log` com os oráculos antes dos motores e do gerador, e a saída dos dois `--check`;
   - a tabela das páginas com o par de cada uma;
   - a saída do teste de vazamento de inglês e a do glossário;
   - os quatro códigos Pix lidos de volta do QR;
   - a tabela das partes do CI, todas abaixo de 900 s;
   - o `REVISAO-F6.md`, com o veredito de cada cético.
2. Se o merge é seu (a run dividiu o CI): confira que o diff do `ci.yml` só acrescenta `--shard`, e dê o merge pela página da PR.
3. Confira a produção:

   ```powershell
   git switch main; git pull --ff-only
   gh run list --workflow pos-deploy.yml --limit 1   # verde
   curl.exe -s https://fileorca.com/build.txt         # o commit do merge
   ```

4. Abra `https://fileorca.com/pt/apoie/` no computador e escaneie o QR com o app do banco no celular, nos quatro valores. Confira o nome VICTOR YUKI MATUSITA e o valor, sem pagar. Se quiser a prova final, mande R$ 5 de outra conta.
5. Leia o português no site, as calculadoras primeiro. O que não soar como você diria vira uma run curta de ajuste.
6. Siga a lista "O que é do Victor" do relatório e gere o prompt da F7 (e o da 6b, se a válvula cortou).

Se o resultado vier errado: depois de duas correções que não resolvem, não emende. Peça um prompt novo de run curta de ajuste, com o que aprendeu.

## Suposições que fiz

- **O espanhol do dinheiro é para hispânicos dos EUA** (sua escolha nesta conversa). Daí saem duas coisas:
  - o espanhol do site todo escreve número como nos EUA, com o "68 %" do design system mantido;
  - o hub de dinheiro em espanhol vira par do hub em inglês. Essa parte é leitura minha: é a mesma página de categoria, traduzida.
- **Os slugs são meus,** sem pesquisa de volume: o Keyword Planner da F0 foi só nos EUA, em inglês. Trocar slug depois do merge pede redirecionamento 301, então troque na tabela da decisão 2 antes de rodar, se quiser.
- **O CET é calculado, não digitado.** A run aplica a fórmula da Resolução CMN 4.881/2020 sobre o que a pessoa digita. Li o "IOF e CET como campo" do plano como "nunca de tabela".
- **As convenções brasileiras de partida são minhas,** e a run confere nas normas e registra:
  - a TR corrige o saldo;
  - os seguros são em R$ por mês, constantes;
  - as taxas são efetivas, convertidas por capitalização;
  - o SAC é o padrão no alugar ou comprar.
- **O cartão segue a regra brasileira.** A calculadora segue o rotativo de um ciclo e o teto de 100%, em vez de pagar uma parcela fixa no rotativo por meses, que no Brasil não existe por mais de um ciclo.
- **A válvula vai além da ficha.** Depois do dinheiro em espanhol, que a ficha permite cortar, ela corta o PDF e a imagem em espanhol. O português e o Pix nunca saem, como a ficha manda.
- **O `qrcode` entra em `devDependencies`,** porque na F6 ele só roda no build. A F7, com a ferramenta de QR, o passa para `dependencies`.
- **O sufixo do arquivo baixado vai traduzido** em pt e es, pelo glossário.
- **As traduções de imagem e de PDF podem ir para agentes Opus em paralelo.** Os textos de dinheiro em português ficam no agente principal, como os guias da F5b.
- **O merge é automático,** a não ser que uma parte do CI passe de 900 s. Aí ele é seu.
- **Ficam fora:** a 2b, os baixos da F4, da F5a e da F5b, e a § 103.
