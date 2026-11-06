# Revisão adversarial do ajuste "home-cards"

Revisão da run `ajuste-home-cards` (DECISOES § 602 a § 616), sobre o que o ajuste mudou. O gabarito foi o prompt da run (`docs/prompts/prompt-ajuste-home-cards.md`, que traz o pedido do Victor, a escolha dele e as 14 decisões), o plano (`docs/relatorios/ajuste-home-cards-plano.md`) e as regras do `CLAUDE.md`.

## Como rodou

- **O diff:** os três commits da branch sobre a `main` (`2bd851c..edbf7ad`), numa worktree só de leitura (`.claude/worktrees/revisao-home-cards`) com o próprio `pnpm install`, o build padrão e o build de teste. Cada lente teve a própria porta (4174 a 4178) e escreveu só no `.cache/lente-<x>/` da worktree. O `dist/` do ponto de partida ficou noutra worktree, para as provas de "reprova antes".
- **Cinco lentes Sonnet em contexto limpo,** num workflow em segundo plano, porque o ajuste mexe nos alvos de anúncio (regra 3):
  1. (a) anúncios: os 150 px, os alvos que não encolheram, as marcas, as caixas por largura no build de teste;
  2. (b) layout e visual: 320 a 1440 px, claro e escuro, os três idiomas, os dois navegadores, o CLS e o LCP;
  3. (c) acessibilidade e semântica: os títulos, os H3 dos cards, os links, o teclado e o axe;
  4. (d) integridade dos testes: nada afrouxado além da escolha, cada teste novo reprovando contra o ponto de partida, mutantes;
  5. (e) textos e documentos: os §, os README, o `docs/claude/`, o `PENDENCIAS.md` e o relatório.
- **Céticos:** um Sonnet para cada achado médio ou acima (não houve) e um para todos os baixos, com a regra "na dúvida, refutado".
- **Tamanho:** 6 agentes (5 lentes e 1 cético), 405 s e 122 chamadas de ferramenta.

## Resultado

| Severidade | Lentes | Depois do cético |
| --- | ---: | ---: |
| Alto | 0 | 0 |
| Médio | 0 | 0 |
| Baixo | 4 | 0 |
| Refutado | — | 4 |

Nenhum achado sobreviveu ao cético. Dois dos refutados apontavam algo real, e a run os corrigiu mesmo assim (b-1 e d-1): o cético os refutou porque a ficha não os pedia ao pé da letra, não porque estavam errados. Os outros dois ficam como estão.

## Os achados

| Id | Sev. (lente → cético) | O que era | O que a run fez |
| --- | --- | --- | --- |
| b-1 | baixo → refutado | As seções de cards estavam na Figtree, e o § 607 dizia "medido" com o CLS de carga 0, que só vê a primeira tela. Com a Figtree segurada 1,5 s, abaixo da dobra seções inteiras mudavam de altura (em es a 320, de 2.602 a 2.576 px), e com a seção de PDF rolada para a tela durante a espera o CLS foi 0,026. O cético: a ficha nomeia o teste de carga como a medida, e ele dá 0. | **Corrigido** (§ 607): a condição da decisão 6 é "se as seções se moverem quando a Figtree chega", e elas se moviam. As seções passaram à `Figtree Steady`, como o topo e as faixas da F13b, e o teste novo "the category sections keep their size when Figtree arrives late, below the fold too" reprova contra o commit revisado nos dois navegadores e passa depois. |
| d-1 | baixo → refutado | O teste novo da grade comparava o nome e a descrição só com a própria caixa: um card de 100 px com o texto saindo por baixo passava (mutante da lente). O cético: a ficha pede só a mesma altura por linha e nada além da largura da coluna. | **Corrigido** (§ 613): um texto cuja caixa passa a borda do card também conta como vazamento. Contra o mesmo mutante, o teste reprova a 360 e a 1280; na home certa, passa. |
| e-1 | baixo → refutado | O relatório tinha as seções do `verificar --partes`, do custo e da revisão como "PENDENTE", e este arquivo não existia no commit revisado. | Era o estado esperado do commit revisado: as três seções e este arquivo são preenchidos antes do `gh pr ready`. |
| e-2 | baixo → refutado | Um `fo-catband` fica em `tests/`: a fixture do `prontidao.test.ts`. | Fica: é a marcação da F13b que o portão não pode mais contar, declarada no § 610 e no relatório. Não é seletor nem código vivo. |

## O que cada lente conferiu e achou certo

- **(a) anúncios:** os testes da home do `fo-ad-map.spec.ts` e o do mar passaram nos dois navegadores; numa medida própria no build de teste, a menor distância de caixa a alvo foi 166 px de 360 a 768 e 150 px a 1280 (a lateral e o topo, como no ponto de partida), nenhuma caixa dentro de seção ou grade; as caixas por largura e os vãos (1.688 px ou mais) batem com a § 609 e o `HOME_CONTENT_ADS`; densidade de 11,8 % a 15,5 %; as palavras (909, 765 e 756) batem e a regra das 150 por caixa vale; o `estimate.ts`, o `config.ts` e o `PUBLIC_ADSENSE_SLOTS` não mudaram; as marcas ficaram no lugar.
- **(b) layout:** 216 combinações (três idiomas, seis larguras, dois temas, dois navegadores) sem overflow horizontal; cada seção com o H2, a frase, a grade e os links; cards de uma linha com a mesma altura; 5 colunas de 229 px a 1280 e descrições de até 4 linhas; o `.fo-home-top` idêntico ao do ponto de partida no HTML e nas caixas de todos os descendentes; contraste dos links do hub de 4,85:1 no claro e 7,02:1 no escuro.
- **(c) acessibilidade:** um H1, um H2 por seção com os ids de antes, um H3 por card, nenhum nível pulado; todo link com nome e destino 200; ícones `aria-hidden`; landmarks únicos nos dois builds; a ordem do Tab igual à do DOM; o axe da home passou nos dois navegadores, nos dois temas e nas duas larguras.
- **(d) testes:** cada teste antigo que mudou está na § 612 com o que pedia, o que pede e o que continua; 2.069 → 2.066 no Vitest e 2.203 no `--list`, como o relatório dizia; nenhum `skip` nem `only`; o teste novo de unidade reprova contra o ponto de partida e mata os 16 mutantes da lente (seção a menos, descrição vazia, H4 no lugar do H3, ícone trocado, `aria-hidden` tirado, card a menos, categoria errada, chip ou faixa no `<main>`, entre outros); o teste novo da grade reprova contra o ponto de partida; os casos novos do `prontidao` e do `ad-map` reprovam contra o código do ponto de partida.
- **(e) textos e documentos:** nos `home.ts` só saíram `to`, `count`, `num` e `say`; o `lint:texto` deu 0 erro e 12 avisos; as § 602 a § 616 cobrem as 14 decisões, na ordem, e os números conferem com o código; os README e o `docs/claude/` (nenhuma linha antiga removida); o `pendencias.test.ts` passa; nenhum dado pessoal nem segredo no diff. A lente viu o `tests/unit/test-build-lock.test.ts` falhar uma vez com `EPERM` no `mkdir` do `%TEMP%`, com as cinco lentes rodando ao mesmo tempo; ele não tem relação com a mudança e passa sozinho.

## A segunda passada

As lentes (b) e (d), de novo em Sonnet e em contexto limpo, leram o diff das correções (`edbf7ad..a5fb3bb`) na mesma worktree, avançada ao `a5fb3bb` e com builds novos, em 245 s e 38 chamadas de ferramenta. Nenhuma achou defeito:

- **(b) layout e fontes:** com a Figtree segurada 1,5 s, nenhuma seção muda de altura a 320, 360, 768 e 1280 px nos três idiomas, no Chromium e no WebKit; o teste novo passa nos dois; o CLS de carga, o LCP, o `<main>` largo e a grade continuam verdes; as capturas a 360 e 1280, no claro e no escuro, não mostram vazamento nem linha desigual. Uma cópia do `dist/` com a regra da Steady tirada das seções reprova o teste novo nos dois navegadores, com os mesmos 8 deslocamentos ("/es/ a 320, seção 2: 2602 → 2576 px"). A regra fica só na home: nos hubs, a fonte do nome dos cards e a altura da página são as do ponto de partida.
- **(d) integridade dos testes:** o único teste que mudou foi o `home-sea.spec.ts`, e a linha que saiu (o filtro do vazamento) virou uma estritamente mais forte; nenhum `skip`, `only` ou tolerância maior. O mutante do card de 100 px reprova o teste da grade a 360 e 1280 ("/ a 360 tools … Expected: 0 Received: 1"), e o `dist/` certo passa nos dois navegadores. As duas condições do teste da Steady estão certas: a lista de faces exclui a `Figtree Fallback` (local), a primeira medida é de antes da Figtree e a última de depois. As § 607 e § 613, o relatório e esta revisão dizem as correções e os controles com as mensagens que a lente reproduziu.
