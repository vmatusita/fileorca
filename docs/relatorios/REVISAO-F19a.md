# Revisão adversarial da F19a

A revisão do "Como trabalhar", passo 5, da ficha da F19a (`docs/prompts/prompt-fase-19a.txt`), no método da F3 (DECISOES § 92 a § 94; `docs/claude/windows-git-bash.md`). O resumo e as decisões estão no DECISOES § 776.

## O método

- **O commit fixo:** `504d1fc` da `fase-19a`: as sete frentes juntas (N, C, R0, R-image, R-pdf, R-qr-life e R-money), os documentos até o § 775, as imagens do relatório e o Lighthouse das páginas novas.
- **A worktree só de leitura:** `.claude/worktrees/revisao-f19a`, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` (o `dist/build.txt` com o `504d1fc`) e o build de teste dos anúncios feito uma vez antes das lentes, para elas o reaproveitarem com a árvore limpa.
- **Cinco lentes Sonnet em contexto limpo** (regra 3 de toda run: a F19a mexe em texto de dinheiro e saúde e em afirmações de privacidade):
  - (a) os textos e a repetição: o mapa de fatos, o portão e os mutantes, o que saiu e o que entrou em en, pt e es, o enchimento, as perguntas novas;
  - (b) o SEO e as datas: as rotas, o hreflang, o sitemap e o `lastmod`, o changelog contra o git, as linhas de data, o OG, o schema, as órfãs, os links;
  - (c) a privacidade e as provas: a Como funciona frase por frase contra os specs e a Privacidade, as palavras proibidas, a tabela de WebAssembly, o script da foto e os metadados;
  - (d) dinheiro e saúde: os textos das calculadoras e o quadro do autor dos guias de dinheiro;
  - (e) o site, o anúncio, o orçamento, a acessibilidade e o CI.

  Cada uma com a própria porta (4174 a 4178), escrevendo só no `.cache/lente-<x>/` da worktree, contra a ficha e o plano (`docs/relatorios/fase-19a-plano.md`), apontando só lacunas de correção ou de requisito.
- **Os céticos:** um por achado médio ou acima, e um por lente para os baixos, com a regra "na dúvida, refutado".
- **As correções:** num agente só (Opus), no checkout principal; depois, a segunda passada das lentes dos achados corrigidos (a, c e d) sobre o diff das correções.

## O que cada lente rodou

| Lente | O que rodou | Resultado |
| --- | --- | --- |
| (a) textos e repetição | `gate:conteudo`; o Vitest de `repeticao` e `conteudo` (174); o runner da R0 no `dist`; um script que compara o title, a description, o H1, o selo e o texto de `#fo-tool-root` das 148 páginas com o `dist-base`; a leitura do diff de texto de todas as páginas em en e das perguntas novas em pt e es, e buscas de paráfrase, de número repetido entre blocos e de fato perdido | "148 sem repetição"; 0 diferença nas partes fixas; todo FAQ com 4 perguntas reais ou mais, nenhuma pergunta de envio, nenhum passo com "no seu navegador", ZIP ou "originais intactos", toda nota de privacidade com o "Como conferir"; as respostas novas conferidas no código (o `MAX_MONTHS`, o campo do balão, o sol do BTU, o `strip.ts`, o `assemble.ts`, o `numberPages`, a `SignatureArea`, os pixels da página Carta); 7 achados |
| (b) SEO e datas | o Vitest de `changelog`, `declared-dates`, `updated-dates`, `seo-checks`, `routes` e `prontidao` (101); `gate:seo` e `gate:links`; o texto do `<main>` de cada página contra o `dist-base` e a entrada `trust-and-content`; o title, a description, o canonical, o OG e o JSON-LD de todas as páginas contra o `dist-base`; a Novidades de cada idioma contra `entriesIn`; as datas por extenso e em ISO de 229 páginas contra o `lastmod`; 31 PRs do changelog contra o git e os relatórios | tudo verde; nenhuma página na entrada sem mudança de texto, e nenhuma fora dela com mudança (fora o quadro do autor, que é `site`); 0 diferença de SEO nas páginas existentes; as datas de todas as PRs no dia exato; 1 achado |
| (c) privacidade e provas | o Vitest de `how-it-works*`, `about-*`, `author` e `consent` (91); o `launch-claims` nos dois navegadores (19 + 19); `image-privacy`, `pdf-privacy`, `money-privacy` e `events` no Chromium (115); a busca das palavras proibidas e de `github.com` no `dist`; o diff de `src/` procurando armazenamento, `gtag`, `fetch`, `sendBeacon` e `Worker`; a tabela de WebAssembly contra o `dist/_astro` e o motor; o script da foto e os testes dele | nenhuma palavra proibida nem link para o repositório; nenhum evento, parâmetro ou chave novos; a tabela bate; o teste da foto confere os bytes e nunca grava em `public/about/`; 2 achados |
| (d) dinheiro e saúde | `gate:dinheiro-saude` (70 de 70); o Vitest de `calc-defs`, `calc-howto`, `calc-report`, `calc-oracle`, `lint-texto-money` e `calc-i18n` (131); `money-card` e `money-life-privacy` no Chromium (68); as premissas, as fontes, os exemplos e os avisos das 46 calculadoras com diff contra o `81d17a1`; os números das perguntas novas no motor; o quadro do autor dos 5 guias contra o oráculo | premissas, fontes e notas de privacidade iguais em todas; os números das perguntas novas conferem; o quadro do autor é verdadeiro para os 5 guias; 2 achados |
| (e) site, anúncio, orçamento, acessibilidade e CI | `footer-phone` nos dois navegadores (13 + 13) e o Vitest dele; um script de transbordo a 320 e 360 px; `ads` e `fo-ad-map` inteiros no build de teste (205 + 205); o `checkContent` do `gate:prontidao` no build de teste; o md5 de `dist/_astro` contra o `dist-base`; `budgets`, `i18n-budgets`, `layout-shift` e `launch-claims` nos dois navegadores; `a11y` nas páginas novas e numa amostra das mudadas (16 + 16); o Lighthouse de três páginas; o `--list --shard` das partes do CI; o diff de `tests/` e `scripts/` procurando `.skip`, `.only` e limite afrouxado | tudo verde (um teste do `i18n-budgets` falhou uma vez com a máquina carregada pela própria lente e passou 12 de 12 sozinho); os JS iguais, só o CSS das ilhas mudou (22.468 → 22.991 bytes em gzip); o alvo da data do rodapé com 140 × 48 px a 320 px; as partes do CI ganham poucos testes, todos leves, e o `fo-ad-map` não ganhou página; nenhum teste afrouxado; 1 achado |

## Os achados e os céticos

| Id | Lente | Sev. da lente | Achado | Cético | Destino |
| --- | --- | --- | --- | --- | --- |
| C-1 | c | alto | "All of it runs on a single thread" (e pt, es) é falsa: o site cria Web Workers, e as provas da chave provam só que não há COOP/COEP, codec multi-thread nem `SharedArrayBuffer` | **confirmado (médio)** | corrigido: `751265c`, com o teste novo; refeito na segunda passada (`da2383f`) |
| A1 | a | médio | O peso do cascalho (2.565 lb, EPA) e a tonelada de 2.000 lb da Mulch no `works` e no FAQ | **confirmado (baixo)** | a exceção deliberada da § 770 (as premissas vão ao PDF): pendência F19a m-13 |
| A2 | a | médio | Três respostas do Cartão de crédito (pt) e uma da Amortização antecipada (pt) repetem premissas | **confirmado (baixo)** | corrigido: `06c935e` |
| A4 | a | baixo | O FAQ 1 do Desbloquear PDF repete a linha "Restrictions only" | **confirmado (baixo)** | corrigido: `fc5d592` |
| A5 | a | baixo | O FAQ 1 do Refinanciamento (en, es) é uma frase só que o FAQ 4 e o `works` já dizem | **confirmado (baixo)** | corrigido: `c56a1da` |
| D-1 | d | baixo | "Quanto tempo a dívida pode ficar no rotativo?" não diz mais quanto tempo | **confirmado (baixo)** | corrigido: `06c935e` (a pergunta virou "O que acontece depois do vencimento da fatura seguinte?") |
| A3 | a | baixo | O FAQ 1 da PDF para JPG repete a linha "Resolution" | refutado: o FAQ acrescenta o custo e o exemplo resolvido | nada |
| A6 | a | baixo | O "1 KB = 1.024 bytes" saiu do Comprimir imagem | refutado: o fato da página (1 KB = 1.000 bytes) mora na linha "Up to a size" | nada |
| A7 | a | baixo | A faixa de 24 a 38 dias da Ovulação no FAQ e no aviso | refutado: definição de ciclo regular e alerta de saúde são fatos diferentes | nada |
| B-1 | b | baixo | Páginas de dinheiro e guias de arquivo mostram a publicação um dia antes da entrada da Novidades | refutado: a tolerância de um dia da ficha | nada |
| C-2 | c | baixo | A frase dos anúncios atribui à Privacidade quais páginas têm anúncio | refutado: a frase segue a § 759, e a Privacidade descreve os anúncios | nada |
| D-2 | d | baixo | O aviso da Data provável do parto não diz mais que a data é uma estimativa | refutado: a estimativa está no lead e no FAQ "How exact is the due date?", e o aviso manteve o conselho | nada |
| E-1 | e | baixo | O `changelog.test.ts` reprova toda PR aberta depois do merge da F19a e antes da F19b | refutado: o § 773 declarava o estado | corrigido assim mesmo, pela leitura mais rigorosa: `134cfcf` (§ 776) |

Nenhum achado alto depois dos céticos.

## As correções

| Commit | O que corrige | A prova |
| --- | --- | --- |
| `751265c` | C-1: a frase das linhas de execução nos três idiomas, e o teste "never says the work runs on a single thread: the tools start Web Workers" | o teste reprova no texto de antes, só ele: "en: diz que o trabalho todo roda numa linha só: expected 'All of it runs on a single thread, an…' not to match …"; o `a11y` das três Como funciona verde nos dois navegadores |
| `06c935e` | D-1 e A2: as perguntas do rotativo, do teto e do IOF do Cartão de crédito e a do CDC da Amortização antecipada, sem repetir as premissas | as premissas e as fontes iguais; `gate:dinheiro-saude` 70 de 70; `gate:conteudo` com "148 sem repetição" |
| `fc5d592` | A4: o FAQ 1 do Desbloquear PDF sem a lista das restrições, nos três idiomas | o `routes.test.ts` (nada de "unlock" fora do nome) e o `gate:conteudo` |
| `c56a1da` | A5: "Does it matter if I pay the closing costs or add them to the loan?" (e es) | o motor no Node: com os custos no empréstimo, o equilíbrio passa do mês 16 para o 18 no exemplo; a calculadora tem o campo "Closing costs are / Added to the loan" |
| `134cfcf` | E-1: a entrada aberta (`pr: null`) é a da run cujo commit a trouxe ao changelog; depois do squash, ela responde por ele | a simulação `.cache/f19a/sim-merge.sh` (uma worktree temporária a partir do `81d17a1`, nada enviado): depois de um squash local `(#37)`, o teste novo passa (11 de 11) e o de antes reprova com "whats-new en: the changelog says #null, git says #37" nas seis páginas; com uma PR `(#38)` dois dias depois, o novo passa; com o squash da F19a dois dias depois da data da entrada, o novo reprova com "trust-and-content: 2026-11-13, #37 on 2026-11-15: expected 2 to be less than or equal to 1"; no merge que o GitHub faz para a PR, o novo passa |

Depois das correções da primeira passada (as notas do agente estão em `.cache/f19a/review-fixes.md`, fora do Git): `pnpm tipos` com 0 erro, `pnpm lint` limpo, o build, `gate:conteudo` ("148 sem repetição"), `gate:dinheiro-saude` (70 de 70), `gate:seo`, `gate:links`, `gate:prontidao` (22 itens), o Vitest dos 15 arquivos que leem esses textos (329), o `lint:texto` com 0 erro, e `fo-ad-map` e `ads` inteiros no build de teste (205 + 205).

## A segunda passada

As lentes a, c e d, sobre o diff `504d1fc..c56a1da`, na mesma worktree no `c56a1da` (com o `dist` refeito nele).

| Id | Lente | Sev. | Achado | Destino |
| --- | --- | --- | --- | --- |
| C2-1 | c | médio (o cético: baixo) | A frase nova "Each library is built to run on one thread" ainda diz mais do que a prova: o parser do PDF.js roda num worker próprio por desenho, e P.coop e P.threads provam só que nenhuma página usa memória compartilhada nem COOP/COEP | corrigido: "No library here uses shared memory, so no page needs the isolation headers that some sites ask of the browser." (e pt, es), `da2383f` |
| F-1 | d | baixo | A resposta nova do Refinanciamento diz que os juros sobem também a uma taxa nova de 0 %, que o campo aceita (a lente rodou o `refinance()` em 1.728 combinações: a parcela e o mês de equilíbrio nunca melhoram) | corrigido: "…so the new payment is higher and, at any rate above zero, the costs pay interest too: the break-even month does not come sooner." (e es), `a9e5047` |
| L2A-1 | a | baixo | O mesmo ponto do C2-1 | refutado pelo cético da lente (a); a lente (c) o sustentou, e a correção do C2-1 o resolve |
| C2-2 | c | baixo | O teste novo pega a redação antiga, não toda paráfrase | refutado: o teste prova o que o título diz (os workers no código e nenhuma frase de "uma linha só" nos três idiomas) |

Depois das correções da segunda passada: o build, o Vitest dos 15 arquivos que leem esses textos (347), `gate:conteudo` ("148 sem repetição"), `gate:dinheiro-saude`, `gate:seo`, `gate:links`, `gate:prontidao` (22 itens) e o `lint:texto` com 0 erro (159 arquivos, 10.445 textos).

## O que sobrou

Nenhum achado alto ou médio aberto. O A1 é a pendência F19a m-13 do grupo 29 do `docs/PENDENCIAS.md`. As leituras que as pendências das frentes pediam à lente (a) (as paráfrases fora da lista de fatos, os pares vizinhos do QR e de casa e saúde, os blocos próprios das presets de dinheiro) acharam o A1, o A2, o A4 e o A5, e nada mais; a lacuna do portão para paráfrases fica como a F19a m-6.
