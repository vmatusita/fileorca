# F19b · revisão adversarial

A revisão final da run F19b ("Guias novos com dado próprio"), no método da F3 (`docs/claude/windows-git-bash.md`, F3; DECISOES § 92 a § 94) e na régua da regra 3 de toda run: a run mexe em conta e em dinheiro, então são cinco lentes. O gabarito é a ficha (`docs/prompts/prompt-fase-19b.txt`) e o plano (`docs/relatorios/fase-19b-plano.md`).

## Como rodou

- **O commit revisado:** `8b54cd6`, o fim da junção (todas as frentes juntas, o Vitest inteiro e os portões verdes), numa worktree só de leitura (`.claude/worktrees/revisao-f19b`, `git worktree add --detach`), com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build` (259 páginas). O build de teste com IDs, cada lente fez no próprio `FO_PORT` + 100.
- **As lentes:** cinco agentes Sonnet em contexto limpo, sem as notas das frentes, cada uma com o próprio `FO_PORT` (4271 a 4275) e escrevendo só em `.cache/lente-<x>/` da worktree; cada uma apontou só lacunas de correção ou de requisito, com evidência lida ou rodada por ela, nunca preferência de estilo.
  - (a) as medidas e os números;
  - (b) os textos em en, pt e es;
  - (c) dinheiro;
  - (d) o SEO e o site;
  - (e) o anúncio, o orçamento, a acessibilidade e o CI.
- **Os céticos:** cada achado médio ou alto teve um cético próprio, que tentou refutá-lo ("na dúvida, refutado"); os baixos de cada lente foram a um cético só.
- **As correções:** no agente principal, na `fase-19b`, cada uma com um teste que reprova sem ela (ou com o spec que reprovava); depois, uma segunda passada das lentes dos achados corrigidos, sobre o diff.

## Os achados

| Id | Lente | Sev. (lente → cético) | Achado | Destino |
| --- | --- | --- | --- | --- |
| e-1 | (e) | alto → alto | No guia 4 em inglês (`/guides/what-a-pdf-password-protects/`), a 459 × 900, dois anúncios de conteúdo a 1.092 px, de borda a borda (o `fo-ad-map.spec.ts` pede 1.110), no Chromium e no WebKit. | **Corrigido** no `c9eeb89` (os dois últimos parágrafos da parte "Restrictions are a request, not a lock" viram um só, palavra por palavra; os vãos ficam em 1.540, 1.400 e 2.298 px). A junção já tinha achado a mesma falha no lote do build de teste e a corrigiu antes de a revisão terminar (DECISOES § 795). A fraqueza da estimativa em texto denso é a pendência F19b m-26. |
| b-1 | (b) | baixo → baixo | No exemplo resolvido do guia 7 (en e es), "$27,678 less" ao lado de $30,261 e $2,582 de juros: a subtração do leitor dá $27,679 (o motor faz a diferença com os centavos). | **Corrigido** no `0af359d`: a diferença sai dos dois totais como a página os escreve, em dólares inteiros, e o `calc-guides.test.ts` confere em en e es. Sem a correção, o teste reprova com "expected 27678 to be 27679". |
| a-1 | (a) | baixo → refutado | A frase do guia 2 sobre cada gravação com perda tirar um pouco mais de detalhe não tem medida nem fonte. | Refutado: é conselho de método (converter do original), não uma afirmação sobre a amostra medida; a ficha não pede fonte para conselho. |
| d-1 | (d) | baixo → refutado | A descrição e a introdução do hub de guias falam de imagens, PDFs e empréstimos, e um dos 23 guias é o do QR code. | Refutado pelo cético (o QR gera uma imagem; o texto não fica falso). A mesma observação está nas notas da frente SA e virou a pendência do grupo 30 sobre o texto do hub. |
| d-2 | (d) | baixo → refutado | O código e os testes citam os § 777 a § 797, que não estavam no `DECISOES.md` no `8b54cd6`. | Refutado: os § são escritos no fim da run (o plano os reserva, § 795); entraram no `762928f`. |

Nenhum achado alto ou médio ficou aberto. Os dois refutados que tinham fundo (d-1 e a pendência do texto do hub) estão no grupo 30 do `docs/PENDENCIAS.md`.

## O que cada lente conferiu e achou certo

- **(a) As medidas e os números:** os quatro arquivos do Vitest das medidas (97 testes); os planos dos guias 1 a 5 contra a decisão 3 e a regra do caminho da pessoa (o canvas no Chromium e no WebKit; o qpdf e o motor no Node; só fixtures que existem; nenhum tempo medido); o `data/guides-measured.json` (os dez guias antigos iguais por chave ao `a017fc4`, o hash do script aceito pelo teste, cada número com amostra, método, dia e commit, os guias novos com 16/nov); cada afirmação das cinco páginas em inglês contra o valor do JSON (porcentagens, bytes, a direção dos mínimos e máximos, "o mesmo nos dois navegadores", "mais leve no WebKit", contagens, qualidades); os conjuntos de placeholders de pt e es contra os do en; os fatos da Denso Wave (o exemplo de 7,366 mm e 9,398 mm, o módulo de 0,254 mm, a margem de quatro módulos), lidos de novo.
- **(b) Os textos:** o glossário, o vazamento de inglês, os números e a repetição (131 testes); o `gate:conteudo`; as páginas em inglês dos oito guias lidas inteiras e as de pt e es dos guias 3 e 4; em pt e es, os mesmos placeholders, a mesma quantidade de parágrafos (só os parágrafos jurídicos do guia 3 diferem, de propósito) e os mesmos números; as fontes com "(em inglês)"/"(en inglés)" e a leitura de 16/nov; o guia 3 sem orientação jurídica, com a assinatura desenhada separada da digital e a validade dependendo de quem recebe e da lei do lugar, com a fonte de cada idioma (govinfo, Planalto, EUR-Lex); o guia 4 sem promessa de tempo de adivinhação; as contas refeitas à mão (o QR, a APR, a casa, o cartão, o guia 1); o MDN do guia 2 conferido na página viva.
- **(c) Dinheiro:** o oráculo e as fixtures (o hash `a42b86bc…` nas 18 fixtures, o `--check` "igual" nas 18, os casos novos com o `source` de cada guia e os esperados do Python); o exemplo de cada guia é o `initial` da calculadora e um caso do oráculo; cada número dos três guias contra o oráculo; as páginas do CFPB lidas de novo (a Regulation Z § 1026.7(b)(12), a Regulation DD § 1030.2, 1030.3(f) e 1030.4, as perguntas do CFPB, o kit do financiamento em inglês e em espanhol e o relatório dos cartões de 2023); os 28 % atribuídos só ao kit, os 36 % a nenhuma fonte, os dois como regra de bolso; o guia 7 sem fingir que calcula o mínimo da fatura e com o título que só promete o que mostra; o aviso nos três guias, nos dois idiomas; nenhuma taxa do dia, previsão ou indicação de banco ou produto. Nenhum achado.
- **(d) O SEO e o site:** o `gate:seo` (250 páginas indexáveis, hreflang recíproco) e o `gate:links` (21.330 links); os dez testes de unidade da lente (132 testes) e mais oito; as 21 páginas com os caminhos dos glossários; o `lastmod` de 16/nov nas páginas novas e nas tocadas, e as páginas cujo HTML mudou contra um build do `a017fc4` iguais às que a entrada `new-guides` toca (só os dez guias de dinheiro antigos mudaram por um atributo invisível, o `data-guide-text`); a entrada com `pr: null` e a da F19a com `pr: 37`; o `Article` com os dias de cada guia (os antigos com os deles); o OG, as relacionadas, o hub (Imagem, PDF, Utilidades, Dinheiro; 23, 15 e 23), a home, o Menu, o rodapé e o kit; a linha de guias das ferramentas e das calculadoras; a busca (só o "avif" mudou por construção, § 790); o QR nos tipos com o menor desvio.
- **(e) O anúncio, o orçamento, a acessibilidade e o CI:** o `dist/_astro` igual ao da base (os mesmos arquivos, nomes e bytes); o `budgets.spec.ts` e o `i18n-budgets.spec.ts` (os guias de arquivo com 2 arquivos, de 28 a 52 KB em gzip, como os irmãos; o do QR com 38,5 KB em 2 arquivos, os mesmos da página do QR); o axe das páginas novas (85 testes, claro e escuro, 360 e 1280, com a ferramenta embutida com resultado); a dobra e o QR (114 testes); a área de anúncio de cada molde; a densidade das páginas novas abaixo de 16 % a 360 px; nenhuma chave nova de armazenamento, nenhum evento, nenhum envio; o `.github/` sem mudança; o `--list` do Chromium de 2.719 para 2.857 testes (+5 %, nos mesmos 89 arquivos), com a conta das partes deixada para o `pnpm verificar --partes`.

## A segunda passada

As lentes dos dois achados corrigidos (b e e), de novo Sonnet em contexto limpo, leram o diff de cada correção no checkout principal, só leitura.

- **b-1 (`0af359d`), corrigido, nenhum problema novo:** o `calc-guides.test.ts`, o `calc-oracle.test.ts` e o `lint-texto-money.test.ts` passam (71 testes); os fatos do guia 7 em en e es dão $30,261, $2,582 e $27,679, e 30.261 − 2.582 = 27.679; os totais pagos ($36,761 e $9,082) continuam com a mesma diferença; o arredondamento novo é o mesmo meio para cima do `dollars()` de `src/calc/parse.ts`; o valor mudado só aparece na linha do exemplo resolvido, e nenhuma célula da tabela nem outro fato sai dele.
- **e-1 (`c9eeb89`), corrigido, nenhum problema novo:** o diff só junta os dois parágrafos, com um espaço, sem mudar palavra; o `guides-numbers.test.ts` e o `guide-page.test.ts` passam (66 testes); o bloco "pages 205 to 210" do `fo-ad-map.spec.ts` passa no Chromium e no WebKit, com os vãos do guia 4 em 1.540/1.400/2.298 px (en), 1.382/1.780/2.520 px (pt) e 1.434/1.776/2.500 px (es), e os do guia do QR em 1.518, 1.622 e 1.648 px.

## O Lighthouse da amostra (critério 8)

Fora das lentes, o agente principal rodou o Lighthouse do celular na amostra de guias novos (um de cada molde, os três idiomas e o do QR), com uma configuração temporária em `.cache/f19b/lighthouserc-f19b.json` (o `lighthouserc.json` não mudou), três execuções por página, todas as quatro categorias como erro abaixo de 90:

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| /guides/compress-photo-for-online-form/ | 99 | 100 | 100 | 100 | 0.000 |
| /pt/guias/assinar-pdf-sem-imprimir/ | 99 | 100 | 100 | 100 | 0.000 |
| /es/guias/webp-avif-o-jpg/ | 99 | 100 | 100 | 100 | 0.000 |
| /guides/apr-vs-apy/ | 98 | 100 | 100 | 100 | 0.000 |
| /es/guias/cuanta-casa-puedo-pagar/ | 98 | 100 | 100 | 100 | 0.000 |
| /guides/qr-code-size/ | 99 | 100 | 100 | 100 | 0.000 |
