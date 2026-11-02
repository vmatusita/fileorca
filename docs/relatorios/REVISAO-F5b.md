# Revisão adversarial da F5b

Esta é a revisão final da run `fase-05b`: os 10 guias de arquivo em inglês, com a ferramenta embutida e os números medidos por script, os links dos hubs, das ferramentas e da busca, e o kit do Product Hunt. Ela seguiu o método da F3 (DECISOES § 92 a § 94), como a F5a. O gabarito foi:

- a ficha (`docs/prompts/prompt-fase-05b.md`);
- o plano (`docs/relatorios/fase-05b-plano.md`), que liga cada critério a um teste;
- o `CLAUDE.md`, o DECISOES (§ 184 a § 195) e o `docs/design/`.

## Como rodou

- **Commit fixo:** `105a408`, numa worktree só de leitura em `.claude/worktrees/revisao-f5b`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build` (85 páginas). A worktree foi removida no fim.
- **Seis lentes Sonnet em contexto limpo,** num workflow. Cada uma teve uma porta (`FO_PORT` de 4174 a 4179) e uma pasta só dela, `.cache/lente-<x>/`, onde ficaram as sondas, os screenshots e um `relatorio.md`:
  1. (a) corretude dos números e dos fatos;
  2. (b) privacidade e segurança;
  3. (c) anúncio e política, com as regras do Product Hunt;
  4. (d) acessibilidade (WCAG 2.2 AA);
  5. (e) desempenho e SEO;
  6. (f) design system e voz.
- **Céticos:** um cético Sonnet próprio para cada achado crítico, alto ou médio, e um por lente para os baixos, cada um com porta (de 4180 em diante) e pasta próprias e a regra "sem reprodução, refutado". Foram 26 céticos, 32 agentes ao todo, em 34 minutos.
- **Correções:** um agente só (Opus), no checkout da branch, com um teste que falha sem cada correção e um § para cada uma. Os baixos vão para o relatório.
- **Segunda passada:** um revisor Sonnet em contexto limpo leu só o diff das correções, na mesma worktree, movida para o commit das correções.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | ---: | ---: |
| Crítico | 0 | 0 |
| Alto | 5 | 3 |
| Médio | 15 | 14 |
| Baixo | 37 | 32 |
| Refutado | — | 8 |

Por lente, depois dos céticos:

| Lente | Alto | Médio | Baixo | Refutado |
| --- | ---: | ---: | ---: | ---: |
| (a) corretude dos números e dos fatos | 2 | 6 | 6 | 0 |
| (b) privacidade e segurança | 0 | 1 | 2 | 3 |
| (c) anúncio e política | 1 | 1 | 6 | 0 |
| (d) acessibilidade | 0 | 1 | 4 | 2 |
| (e) desempenho e SEO | 0 | 0 | 4 | 3 |
| (f) design system e voz | 0 | 5 | 10 | 0 |

- **Achados repetidos entre lentes.** Os 17 altos e médios confirmados são 11 defeitos:
  - o kit dizer que os 15 guias têm números medidos em arquivos reais, quando os 5 de dinheiro são calculados pelos motores, foi achado por quatro lentes (A-1, B-1, C-1 e F-5);
  - a Oli do painel tapando texto no celular, por duas (D-1 e F-1);
  - a resposta do kit que recomenda Firefox e Safari, por três (C-2, dentro do A-7 e do F-14);
  - as generalizações do F-4 incluem as do A-4 (guia 2) e do A-5 (guia 8).
- **Os céticos desceram de severidade** 6 achados: o A-2 e o A-3 (de alto a médio), e o D-2, o F-2, o F-6 e o F-7 (de médio a baixo, porque a regra citada não diz o que a lente disse). **Subiram** o F-14 (de baixo a médio, pela resposta do navegador).
- **Refutados:** B-4, B-5, B-6, D-4, D-6, E-2, E-3 e E-7. Em cada um, o cético reproduziu o fato e mostrou que nenhuma regra é quebrada (por exemplo, o B-5: a URL não muda a opção inicial do guia 6, provado com query string e hash nos dois navegadores).

## O que cada lente conferiu, em resumo

1. **(a) Corretude.**
   - Os tamanhos das fixtures batem com o JSON (as 10 HEIC, as fotos e os 17 PDFs).
   - A lente refez no navegador, por código próprio e na ferramenta embutida do guia, a HEIC to JPG, o Resize, o JPG para PNG, o Resize a 100%, a Compress PDF (padrão e Forte), o Merge e o Split: todos exatos ao byte contra o JSON, nos dois navegadores.
   - Refez o Split e o Merge com o pdf-lib direto, sem o motor: as razões batem.
   - Rodou o `pnpm guias:medir --check` completo: 0 diferenças em 311,5 s.
   - Resolveu cada placeholder dos 10 guias contra o JSON e varreu o texto visível atrás de número sem rastro: nenhum algarismo solto.
   - Leu as fontes por WebFetch (Microsoft, Apple, Gmail, Outlook, Facebook, LinkedIn, Pinterest, X, YouTube e Adobe). Daí saíram o A-2 e o A-10.
2. **(b) Privacidade.**
   - Uma sonda própria nos 10 guias, nos dois navegadores, com o consentimento negado e concedido: toda requisição (página e workers) é GET para a própria origem, sem corpo e sem query string.
   - O nome do arquivo e os números digitados não aparecem na URL, nas requisições, no storage, nos cookies, no IndexedDB, no Cache Storage nem no `dataLayer`.
   - Nenhum worker nem `.wasm` antes do primeiro arquivo. A localização sai das fotos em todas as ferramentas dos guias de imagem.
   - As imagens do kit só têm os blocos de imagem (PNG) e os quadros e o laço (GIF), e nada pessoal à vista. O JSON e os docs novos não têm caminho, usuário nem e-mail.
3. **(c) Anúncio e política.**
   - O `ads.spec.ts` inteiro no Chromium e os casos de guia no WebKit.
   - Uma sonda própria nos 10 guias, a 360 e a 1280 px, em repouso, com arquivo, processando, com resultado, em lote com recusa e com a fila inteira: zero bandeiras. O menor vão foi 150,0 px, no trilho a 1280.
   - De 572 a 780 palavras por AdSlot.
   - As regras do Product Hunt relidas nas páginas oficiais conferem com o resumo do kit. O kit não pede voto nem imita a marca.
4. **(d) Acessibilidade.**
   - O `a11y.spec.ts` dos guias: 25 de 25 em cada navegador.
   - Uma rodada própria do axe em 10 guias, 2 hubs e 4 ferramentas, nos dois temas: 0 violações AA em repouso e com resultado.
   - O contraste foi medido à mão: nenhum texto abaixo de 4,5:1.
   - A estrutura, o breadcrumb e o `<time>` estão certos. O reflow a 320 e 640 px não tem rolagem lateral.
   - Na ferramenta embutida, o teclado vai de ponta a ponta, e o foco segue para o Baixar e volta no "Start over".
5. **(e) Desempenho e SEO.**
   - Os 10 guias carregam 2 arquivos JS, de 20,8 a 21,3 KB nos de imagem e 36,8 KB nos de PDF, com 6 ou 7 requisições, e nada do motor antes do primeiro arquivo. A navegação traz até 3 requisições novas.
   - O Lighthouse em 5 guias deu 94 a 97 de desempenho na máquina carregada, e 100 nas outras notas.
   - O schema (`Article`, `BreadcrumbList` e `Person`) é válido nos 10.
   - Não há título, H1 ou descrição duplicados nas 82 páginas, e nenhum título de guia repete o da ferramenta.
   - Os hubs listam os guias certos. Nenhuma página fica órfã.
6. **(f) Design system e voz.**
   - O `gate:design` passou nas 85 páginas, e nenhum CSS novo entrou na run.
   - O amarelo só aparece no Baixar, também nas imagens do kit, por varredura de pixels.
   - A Oli fica só dentro da ferramenta e é `aria-hidden`. A miniatura e o GIF usam só `wave` e `cheer`, com os keyframes `fo-float` e `fo-cheer`.
   - Os 10 guias não têm palavra proibida, emoji, seta, exclamação nem enchimento, e os H1 e os H2 estão em sentence case.

## Os achados

Detalhe de cada achado (evidência da lente, regra, correção sugerida e o veredito do cético) no diário do workflow; aqui, a lista.

### (a) Corretude dos números e dos fatos

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| A-1 | alto | alto | Kit do Product Hunt diz que os 15 guias têm números medidos em arquivos reais; só os 10 de arquivo têm |
| A-2 | alto | médio | Guia 3: a tabela põe "Official size 1,280 × 720" para a miniatura do YouTube, e a página citada não diz isso |
| A-3 | alto | médio | Guia 6: "the closest it came to the original was 35.7 dB" é o pior caso, não o melhor |
| A-4 | alto | alto | Guia 2: a prosa generaliza contra a própria tabela sobre PDFs de texto |
| A-5 | médio | médio | Guia 8: a causa do crescimento da NASA é o XMP repetido em cada parte, não "a pequena moldura de todo PDF" |
| A-6 | médio | médio | `pnpm guias:medir --check` compara com 2% colunas do Node em tabelas mistas, e as do navegador exatas |
| A-7 | médio | médio | Kit do Product Hunt afirma além do que as provas cobrem: offline sem o codec, Firefox e respostas sem teste |
| A-8 | médio | médio | Guia 6: "which agreed on every tool" é falso para o PNG to JPG |
| A-9 | baixo | baixo | Guia 3: células e frases mais soltas que a fonte |
| A-10 | baixo | baixo | Paráfrases da Adobe mais fortes que a página |
| A-11 | baixo | baixo | Frases soltas nos guias 1, 2, 8 e 9 |
| A-12 | baixo | baixo | Fontes que não pude ler ou confirmar, e uma negativa sem rastro |
| A-13 | baixo | baixo | Guias 9 e 10 apontam o Preview do iPhone sem a versão do iOS; "Reviewed by" antes da revisão humana |
| A-14 | baixo | baixo | `guides-numbers.test.ts` só vê algarismos; contagem por extenso passa |

### (b) Privacidade e segurança

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| B-1 | médio | médio | O kit diz que os 15 guias têm todo número medido em arquivos de teste reais, mas 5 são calculados pelos motores |
| B-2 | baixo | baixo | A prova 1 do kit só vale no `dist/` local, e o primeiro comentário convida a abrir a aba Network sem avisar do tráfego do Google |
| B-3 | baixo | baixo | A galeria 2 do Product Hunt mostra fotos de terceiros (MIT e CC BY-SA 4.0) sem atribuição |
| B-4 | baixo | refutado | Os scripts de medida e de imagens bloqueiam só o Google, e o `serve()` reaproveita qualquer servidor na porta |
| B-5 | baixo | refutado | Nenhum teste prende a regra "as opções iniciais do guia 6 não vêm da URL" |
| B-6 | baixo | refutado | Os links das fontes dos guias não têm `rel="noopener"` |

### (c) Anúncio e política

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| C-1 | alto | alto | O kit diz que os 15 guias têm número "medido em arquivos de teste", mas 5 são calculados pelos motores |
| C-2 | médio | médio | A resposta sobre navegadores recomenda Firefox e Safari, que nenhum teste cobre |
| C-3 | baixo | baixo | "Once a tool has loaded, it keeps working offline" vale para 20 ferramentas, mas o teste cobre 6 e 2 guias |
| C-4 | baixo | baixo | Os guias 9 e 10 mandam usar o Preview do iPhone sem dizer que ele existe só em iOS recente |
| C-5 | baixo | baixo | O texto da Compress PDF diz "o original, byte a byte" sem a exceção do arquivo com índice refeito |
| C-6 | baixo | baixo | "Reviewed by Victor Yuki Matusita on November 1, 2026" afirma uma revisão humana que a run não teve |
| C-7 | baixo | baixo | A frase "money tools keep your numbers on your device" não está ligada a um teste na seção Provas |
| C-8 | baixo | baixo | A linha do Pinterest repete "(ad specs)" na tabela medida do guia de tamanhos |

### (d) Acessibilidade

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| D-1 | médio | médio | A Oli do painel cobre a última linha do parágrafo que antecede a ferramenta, nos 10 guias, de 320 a 600 px |
| D-2 | médio | baixo | Cabeçalho de linha repetido em 3 tabelas medidas: a célula que distingue a linha é um `<td>` |
| D-3 | baixo | baixo | Texto repetido na linha do Pinterest: "Pin, from the ad specs (ad specs)" |
| D-4 | baixo | refutado | Região rolável das tabelas: nome longo igual à caption e parada de Tab sem função quando a tabela cabe |
| D-5 | baixo | baixo | A 360 px as tabelas largas rolam duas a três telas sem nenhuma pista visual |
| D-6 | baixo | refutado | Na busca, o guia e a ferramenta são indistinguíveis (mesma categoria, mesmo ícone) |
| D-7 | baixo | baixo | As legendas das imagens 2 e 3 do kit não dizem a informação que a imagem mostra, e a imagem 2 tem texto de uns 8 px |

### (e) Desempenho e SEO

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| E-1 | baixo | baixo | Seis títulos de guia passam de 70 caracteres e uma descrição passa de 160 |
| E-2 | baixo | refutado | O guia das redes sociais cita o preset do YouTube sem link no texto |
| E-3 | baixo | refutado | O sitemap não tem `lastmod` em nenhuma URL, guias incluídos |
| E-4 | baixo | baixo | Uma nova medida ou uma nova data de revisão não chega ao IndexNow nem ao `lastmod` |
| E-5 | baixo | baixo | O nome do cartão do guia 8 é uma frase cortada e aparece no Open Graph, no hub e nas relacionadas |
| E-6 | baixo | baixo | A busca por "jpg to pdf" traz o guia da direção contrária e não traz o guia das fotos em um PDF |
| E-7 | baixo | refutado | A FAQ de cinco páginas de ferramenta repete a pergunta que o guia responde |

### (f) Design system e voz

| Id | Lente | Depois do cético | Achado |
| --- | --- | --- | --- |
| F-1 | médio | médio | A Oli cobre texto da introdução da ferramenta nos 10 guias em largura de celular |
| F-2 | médio | baixo | Tabelas "What we measured" cortadas no computador, sem pista de rolagem |
| F-3 | médio | médio | Tamanho da amostra não dito nos guias 4, 5, 10 (e 7) |
| F-4 | médio | médio | Generalizações além da amostra, uma contra a própria tabela |
| F-5 | médio | médio | Kit: "15 guides whose numbers were measured on real test files" é falso para 5 dos 15 |
| F-6 | médio | baixo | Guia 6: o rótulo da opção entra cru na frase ("set to By percentage, 100") |
| F-7 | médio | baixo | Galeria 2 do Product Hunt ilegível no tamanho da galeria |
| F-8 | baixo | baixo | Galerias 4 e 5: conteúdo colado e cortado pelo canto arredondado; galeria 1 corta cartões pela metade |
| F-9 | baixo | baixo | Texto renderizado com construções estranhas nos guias |
| F-10 | baixo | baixo | Contagens por extenso à mão nos textos dos guias |
| F-11 | baixo | baixo | Nomes de cartão truncados e diferentes do H1 (guias 6 e 8), até na imagem de Open Graph |
| F-12 | baixo | baixo | Cartões de guia iguais aos de ferramenta na seção de relacionadas |
| F-13 | baixo | baixo | Tabelas e linha "Reviewed" com ruído |
| F-14 | baixo | médio | Kit: textos de fora com "unlock" solto, história inventada, Firefox sem teste e legenda sem prova |
| F-15 | baixo | baixo | Preview do iPhone sem a versão do iOS (guias 9 e 10) |

## As correções

Os 11 defeitos altos e médios foram corrigidos por um agente só (Opus), no checkout da branch, em 5 commits depois do `105a408`, cada um com um teste que falhou antes da correção (§ 196 a § 206). Uma incoerência de data que as correções criaram foi corrigida depois, também com teste (§ 207).

| Achados | O que mudou | Teste (a falha antes da correção) | § |
| --- | --- | --- | --- |
| A-6 | Cada tabela do JSON guarda quem mediu cada coluna (`kinds`), e a comparação foi para `scripts/guides/lib/compare.ts`: Node exato, navegador com 2% | `guides-measured.test.ts`, "guias:medir --check compares each column by who measured it": um valor do Node a +1,9% numa tabela mista passava | 196 |
| A-4, A-10 | O guia 2 diz o que se mediu: 38% a menos no PDF só de texto, 12,0 KB nas notas de aula, 827 bytes no PDF de fotos; a nota diz quais PDFs o script gerou, e a Adobe aparece com o "sometimes" da página | `guides-numbers.test.ts`, "say what the sample did, never what files usually do" (lista `GENERAL`): 18 frases em 6 guias reprovavam, como "Most PDFs" | 197 |
| A-2 | A página do YouTube foi relida: a linha oficial passa a 3840 × 2160 e 2 MB; o 1280 × 720 do preset aparece só na coluna das nossas saídas; cada tamanho oficial guarda `stated`, as palavras da página, e "asks for 16:9" virou "suggests the 16:9 shape" | `guides-measured.test.ts`, "take an official size only from the words of its page": "no words of its page"; no controle, 1280 × 720 reprova | 198 |
| A-3 | "its lowest score on our photos", e a coluna passa a "Pixels, worst photo" | `guides-numbers.test.ts`, "say whether a measured number is the lowest or the highest": o placeholder de mínimo sem a direção | 199 |
| A-5 | O script mede os metadados de cada parte do Split: 6,2 KB no original, 930 KB nas partes, 80% do crescimento; o guia 8 diz isso, com título novo; o motor não mudou | `guides-measured.test.ts`, "Split PDF: the metadata each part of the NASA report repeats…" e "explain, in guide 8, the growth of the scans…": o número não existia | 200 |
| F-4 | Saíram as generalizações dos guias 4, 8 e 9; a mesma regra pegou "usually" e "often" nos guias 1 e 10 | o mesmo do A-4 | 201 |
| A-8 | O fato `browsersDiffer` ("PNG to JPG") sai do script; a nota diz "five of the six tools", e a frase do PNG dá 5,2 vezes no Chromium e 4,0 no WebKit | `guides-measured.test.ts`, "say, in guide 6, which tools the two browsers wrote differently": `expected undefined to be 'PNG to JPG'` | 202 |
| F-3 | Contagens medidas (`photos`, `files`, `pdfs`) entram como placeholders nos guias 2 a 10 | `guides-numbers.test.ts`, "state how many files each measurement rests on": 9 guias reprovavam | 203 |
| A-1, B-1, C-1, F-5 | O kit diz "15 guides, 10 of them with numbers measured…"; a legenda da galeria 4 virou "File guides with numbers measured on our test files" | `launch-kit.test.ts`: as contagens `file-guides` e `money-guides` e a regra do "measured" ("vale só para os 10 guias de arquivo", 5 vezes) | 204 |
| A-7, C-2, F-14 (e o baixo C-7) | Offline com a ressalva do codec; só Chromium e WebKit na resposta dos navegadores; "unlock" virou "add or remove a password"; saíram a história de origem, "No limit" e "most files"; a seção Provas lista as frases provadas e ganhou os itens dos anúncios, do Ko-fi, do consentimento e dos números das calculadoras | `launch-kit.test.ts`, "tie every technical sentence in English to a proof…": 20 frases sem prova, "Firefox não é um motor que os testes rodam", "unlock" solto; `routes.test.ts`, "has no page of an account" | 205 |
| F-1, D-1 | A seção da ferramenta embutida ganhou `.fo-guide__tool`, com o mesmo `padding-right` do `.fo-top` (96 px, 136 px a partir de 768); nenhuma cor nova | `tool-guides.spec.ts`, "the Oli of the panel covers no line of text", a 320, 360, 390 e 600 px: por exemplo "360 px: Drop a PDF and it is compressed… (84 × 18 px)" | 206 |
| (das correções) | A medida refeita saiu datada de 2/nov (o dia em UTC), e os guias diziam "Reviewed … November 1 … with the measurements of November 2"; o `GUIDE_REVIEWED` e o `GUIDE_PUBLISHED` passam a 2026-11-02 | `guides-measured.test.ts`, "are never newer than the review and publication dates the guides show": "reviewed 2026-11-01, measured 2026-11-02" | 207 |

- **Baixos corrigidos junto,** porque estavam nas frases reescritas: F-9 ("2.9 MB to 2.9 MB" nos guias 2 e 8), A-10 (a Adobe), C-8 e D-3 ("(ad specs)" repetido), A-9 em parte (o limite do Pinterest é o do computador), A-11 ("middle photo" virou "half of them … or less"), F-10 em parte ("one of two things" saiu, "the three modes" virou "each mode") e A-12 em parte (o registro de que as palavras do Instagram e do X vêm da cópia da página no buscador).
- **O que o agente rodou:** o `pnpm guias:medir` completo (304,7 s) e o `--check` ("0 difference(s) in 306.5 s"); o Vitest inteiro (70 arquivos, 1.242 testes); `pnpm tipos` e `pnpm lint`; o `gate:conteudo` (de 886 a 1.111 palavras por guia), o `gate:seo`, o `gate:design` e o `lint:texto` (0 erro de gramática); e, nos dois navegadores, o `tool-guides` com o `launch-claims` (58), os casos de guia do `ads` e do `a11y` (42), do `budgets` (30) e o `design.spec.ts` (100). O `--list` manteve o `design.spec.ts` inteiro na parte 4 do WebKit e a matriz de imagens na parte 5.
- **As imagens do kit:** o `pnpm lancamento:imagens` refez a galeria 4 (a legenda mudou); a galeria 2 mudou 2 bytes ao ser regerada.
- **Uma pegadinha:** o `FO_PORT=4190` não serve para o `guias:medir`, porque o `fetch` do Node recusa essa porta ("bad port"). O agente usou a 4188.

## A segunda passada

Um revisor Sonnet em contexto limpo leu só o diff das correções (`git diff 105a408..fc5f944`), na mesma worktree, movida para o `fc5f944` e com o build refeito.

- **O que ele conferiu e passou:**
  - cada correção resolve o achado dela, e o diff dos 5 arquivos de teste só tem acréscimos (nenhum caso tirado, nenhuma tolerância aumentada);
  - a comparação nova do `--check` separa Node e navegador por coluna;
  - os números novos dos guias 2, 6 e 8 batem com a tabela renderizada e com o JSON (6.202 B × 150 = 930.300 B, 79,7% do crescimento);
  - o `tool-guides.spec.ts` passou 21 de 21 em cada navegador, e os casos de guia do `ads.spec.ts` 15 de 15, com a menor distância de 150 px;
  - nada rola para o lado de 320 a 1280 px, e a Oli não cobre nenhuma linha.
- **O que ele achou:** 3 médios e 8 baixos, nenhum crítico ou alto. Os 3 médios e 5 baixos foram corrigidos pelo mesmo agente de correções, em 4 commits sobre o `fc5f944`, com teste (§ 208 a § 212). Nenhum precisou de medida nova: os textos usam números que já estavam no JSON.
  - **1:** o "changed" do guia 3 diz só a data da medida, e "The help pages were read on the date given with each source". Teste: "never give the sources the date of the measurement" (`guides-numbers.test.ts`).
  - **3:** o título do guia 2 virou "Pictures: the weight of our heaviest PDFs"; a descrição do guia 8 diz "our test PDFs"; o guia 9 diz "five pairs of our test PDFs" e o que cada par deu. A lista `GENERAL` ganhou "usual", "almost free", "real PDFs" e "real files", e "real phone photos" passa nos controles. Teste novo: "say, in guide 9, how much smaller each merged pair came out" (`guides-measured.test.ts`).
  - **7:** o guia 8 nomeia os três arquivos que cresceram (5,8 vezes, 32% a mais e 1.304 bytes a mais) e diz que, dos cerca de 7,7 KB de cada parte, 6,2 KB são a cópia dos metadados. Teste: "say, in guide 8, how much each file that grew grew, and what of a part is metadata".
  - **9:** o teste do guia 6 exige o fato `browsersDiffer` não vazio enquanto o texto o lê.
  - **2 e 11:** o kit diz "our test files" (Descrição A com 442 caracteres, B com 313 e o primeiro comentário com 1.543), e a resposta dos limites virou "I have not tested the largest file each phone can open, so tell me if one fails". O `launch-kit.test.ts` reprova "real test files" e a frase da memória sem prova.
  - **4 e 5:** o comentário do CSS diz o que acontece de fato (a partir de 768 px, o título e o parágrafo da ferramenta ficam com 561 px, contra 697 px do resto da prosa), e o teste da Oli passou a 320, 360, 390, 600, 768 e 1280 px. Com o recuo zerado a partir de 768 px, ele reprova.
  - **Saída final do agente:** Vitest com 70 arquivos e 1.246 testes; `pnpm tipos` e `pnpm lint` limpos; `conteudo` (886 a 1.115 palavras por guia), `seo` e `design` ok; `lint:texto` com 0 erro de gramática; `tool-guides.spec.ts` com 42 testes nos dois navegadores; o `--list` com o `design.spec.ts` inteiro na parte 4 do WebKit e a matriz de imagens na parte 5.
  - **Fica de lado:** a frase nova do guia 9 com dois pares em bytes exatos é correta, mas pesada de ler.

| # | Severidade | Achado | Destino |
| ---: | --- | --- | --- |
| 1 | médio | O guia 3 diz que as páginas de ajuda são "of November 2" (a data da medida), ao lado das 11 fontes "Read on November 1" | corrigido |
| 2 | médio | O kit ainda diz "real test files" em três lugares, e parte dos PDFs medidos foi escrita pelo script | corrigido |
| 3 | médio | Generalizações que sobraram: "merging is almost free" (um par só), "real PDFs" e "in 5 of the 5 pairs it was a little smaller" no guia 9, "real files" na descrição do guia 8, "the usual suspect" no guia 2 | corrigido |
| 4 | baixo | O comentário do CSS e a § 206 dizem que no computador o texto fica igual; o parágrafo da ferramenta fica com 561 px, contra 697 px do resto | corrigido |
| 5 | baixo | O teste da Oli não cobre 768 e 1280 px, onde vale o recuo de 136 px | corrigido |
| 6 | baixo | O guia 3 diz "WebKit wrote slightly larger files" (de 5% a 18%) e não diz o navegador dos números | fica |
| 7 | baixo | Guia 8: "three of them weighed more" conta um PDF que cresceu 1.304 bytes (0% na tabela), e os 7,7 KB por parte incluem 1,5 KB além do XMP | corrigido |
| 8 | baixo | O `stated` do YouTube costura duas frases da página | fica |
| 9 | baixo | A frase do guia 6 com `{browsersDiffer}` quebra se o fato vier vazio numa nova medida | corrigido |
| 10 | baixo | Frases longas nos guias 2, 4 e 8 | fica |
| 11 | baixo | "Are there limits?" no kit: a frase sobre a memória de um celular antigo não tem prova | corrigido |
| 12 | baixo | Informativo: o "Reviewed" diz 2 de novembro (UTC), a noite de 1.º em Brasília; o C-6 segue aberto | fica |

O revisor usou a porta 4175 para o WebKit, além da 4174 combinada; a porta estava livre, e nenhum arquivo rastreado mudou.

## Os baixos que ficam

Ficam como pendência, para uma run curta ou para a F6. Os que as correções já resolveram (C-7, C-8 e D-3, e as partes ditas acima do A-9, A-10, A-11, A-12, F-9 e F-10) não estão aqui.

- **Texto dos guias:**
  - **A-9:** células da tabela do guia 3 mais soltas que a fonte.
  - **A-11, A-12 e F-9, o resto:**
    - "100% of their combined size" ao lado de "a little smaller" (guia 9);
    - "ten of the 10 photos" (guia 1);
    - "Recommended one" (guia 2);
    - "0.5 times in WebKit" (guia 7);
    - o ponto depois do rótulo que termina em "?" nas fontes da Adobe;
    - as fontes do Instagram e do X, que o leitor só abriu pela cópia do buscador.
  - **F-6:** "set to By percentage, 100" no guia 6.
  - **F-10 e A-14:** contagens por extenso que o teste dos números não lê ("Two things stay on purpose", "multiplies the pixels by four", "twice as many pixels").
  - **A-13, C-4 e F-15:** o Preview do iPhone sem a versão do iOS (guias 9 e 10).
  - **C-5:** "the original, byte for byte" sem a exceção do arquivo com índice refeito.
- **Nomes e cartões:**
  - **E-5 e F-11:** os nomes de cartão dos guias 6 e 8 estão cortados, e o do 8 aparece assim também no Open Graph.
  - **F-12:** o cartão de guia é igual ao de ferramenta nas relacionadas.
  - **F-13:** ruído nas tabelas e na linha "Reviewed".
  - **E-1:** seis títulos passam de 70 caracteres, e uma descrição passa de 160.
- **Tabelas:**
  - **D-2:** o cabeçalho de linha se repete em 3 tabelas.
  - **F-2 e D-5:** as tabelas largas são cortadas no computador e rolam sem pista visual no celular.
- **Busca e índice:**
  - **E-6:** "jpg to pdf" traz o guia da direção contrária.
  - **E-4:** uma nova medida não chega ao IndexNow nem ao `lastmod`.
- **Kit do Product Hunt:**
  - **F-7 e D-7:** o texto da galeria 2 fica pequeno no tamanho da galeria, e as legendas das imagens 2 e 3 dizem pouco.
  - **F-8:** as galerias 4 e 5 ficam coladas ao canto arredondado, e a galeria 1 corta cartões pela metade.
  - **B-3:** a galeria 2 mostra fotos de terceiros (MIT e CC BY-SA 4.0) sem atribuição.
  - **B-2:** a prova 1 vale no `dist/` local, e o primeiro comentário convida a abrir a aba Network sem avisar do tráfego do Google em fileorca.com.
  - **C-3:** o offline foi testado em 6 ferramentas e 2 guias, não em todas.
- **Processo:**
  - **C-6 e A-13:** o "Reviewed by Victor Yuki Matusita" afirma uma revisão humana. A lista do Victor no relatório pede que ele leia os 10 guias antes de pedir a indexação.

## A worktree

A worktree `.claude/worktrees/revisao-f5b` foi criada no `105a408`, movida para o `fc5f944` na segunda passada e removida com `git worktree remove` depois dela. Nenhum arquivo rastreado mudou lá. As outras worktrees da lista do `git worktree list` são de runs anteriores e ficaram como estavam.
