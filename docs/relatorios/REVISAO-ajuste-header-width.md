# Revisão adversarial do ajuste "header-width"

Revisão da run `ajuste-header-width` (DECISOES § 409), sobre o que o ajuste mudou. O gabarito foi o pedido do Victor e a opção que ele escolheu (`docs/prompts/prompt-ajuste-header-width.md`), a § 409 e as regras do `CLAUDE.md`.

## Como rodou

- **O diff:** os dois commits da branch sobre a `main` (`a334639` e `ee091cd`), lidos na checkout principal, só com leitura (o `pnpm verificar` rodava ao lado, e as lentes não podiam subir servidor nem Playwright).
- **Cinco lentes Sonnet em contexto limpo,** num workflow em segundo plano, porque o ajuste mexe em anúncio (regra 3):
  1. (a) anúncios: a distância de 150 px de todo controle e de todo menu aberto, em toda largura, e a conferência de que a lateral não recebe o ponteiro;
  2. (b) layout: as bordas em toda largura e navegador, o cabeçalho numa linha, a folha do Menu, a reserva sem anchor e o CLS;
  3. (c) interação e acessibilidade: o menu aberto sobre a lateral, o foco, o Esc e o clique que fecha;
  4. (d) integridade dos testes: o que saiu, o que entrou e se algo foi afrouxado além da escolha;
  5. (e) documentos: a § 409, os READMEs, o `bundle.css`, as pendências e o português.
- **Céticos:** um Sonnet para cada achado médio ou acima, e um para todos os baixos, com a regra "na dúvida, refutado".
- **Tamanho:** 10 agentes (5 lentes, 4 céticos dos médios e 1 dos baixos), 829 s e 250 chamadas de ferramenta.

## Resultado

| Severidade | Lentes | Depois dos céticos |
| --- | ---: | ---: |
| Alto | 0 | 0 |
| Médio | 4 | 2 |
| Baixo | 7 | 7 |
| Refutado | — | 2 |

Os 9 achados confirmados são 4 defeitos. Cinco lentes acharam o mesmo (b-1, c-1, d-1, e-2 e a-1), e duas acharam o título velho (d-2 e b-3). Os 4 foram corrigidos.

## Os achados

| Id | Sev. (lente → cético) | O que era | Correção |
| --- | --- | --- | --- |
| b-1, c-1 (e d-1, e-2, a-1) | médio → médio | A conferência "a lateral não recebe o clique com o Menu aberto" (`railTakesPointer`, `tests/e2e/ads.spec.ts`) sondava o meio do anúncio da lateral, 20 px abaixo do topo dele: a 1280 px, o ponto (1094, 234). A folha do Menu aberta vai de x 896 a 1256 e de y 60 a 509 em inglês, então o ponto caía nela, e a conferência passava com ou sem a regra que segura o clique. A do menu de idioma valia, mas com 6 px de folga. | O ponto fica 20 px abaixo do menu aberto, ou do topo do anúncio quando nenhum está aberto. Sem ponto na tela, o teste reprova, em vez de passar. O controle negativo: sem o `pointer-events: none` do `.fo-frame` e sem o `body::after`, o bloco reprova com "a lateral recebe o clique com o Menu aberto". |
| e-1 | médio → baixo | O cabeçalho de celular do `docs/design/components/Header/preview.html` (`max-width: 360px`) tomava a borda da largura do contêiner do preview, e não 24 px. | O `style` dele fixa `--fo-edge: var(--space-6)`. |
| b-2 | baixo → baixo | Com a borda de 16 px abaixo de 360 px, o rodapé tinha duas colunas de 356 a 359 px e uma a 360 px (duas pedem 324 px de conteúdo). | A troca para 16 px passou a ser abaixo de 340 px. O cabeçalho cabe com 24 px a partir de 331 px (282,5 de 292 a 340), e o rodapé tem uma coluna dos dois lados da troca. O teste de bordas mede 14 larguras (339 e 340 entraram) e confere que o rodapé nunca perde coluna ao alargar. Com a troca em 360 px, reprova a 360 px. |
| d-2, b-3 | baixo → baixo | O título do teste de 1280 px ainda dizia "the grid of the frame", e o do bloco do `ads.spec.ts` dizia que os menus abertos ficam a 150 px de todo anúncio. | Os títulos e o comentário do bloco dizem a regra nova. O CI não escolhe testes por título. |
| d-3 | baixo → refutado | O teste de bordas confere só a igualdade, não os 24 px e os 1240 px. | O pedido é a igualdade, e o teste a prova em 14 larguras. |
| a-2 | baixo → refutado | A faixa de 768 a ~1159 px não é medida com o menu aberto. | O título diz 360, 767 e 1280 px, as mesmas larguras de antes, e nada mostra um anúncio perto da folha nessa faixa. |

## A segunda passada

Um revisor Sonnet em contexto limpo leu o diff das correções (`ee091cd..3ff2549`), só com leitura, em 299 s e 24 chamadas de ferramenta. Não achou defeito:

- **o ponto novo da lateral:** a 1280 px, fica em y 529 em inglês e ~429 em português e espanhol com o Menu aberto, e ~250 com o menu de idioma. Os três ficam fora da folha e dentro do anúncio (y 214 a 858). Sem a lateral na tela (360 e 767 px), a função devolve `false` antes de procurar o ponto; nada mais cobre o ponto (o aviso de cookies fica de x 16 a 456);
- **a borda de 16 px abaixo de 340 px:** o cabeçalho cabe com 24 px a partir de 331 px, e o rodapé só ganha a segunda coluna a 372 px, então não perde coluna de 320 a 1920 px;
- **o teste de colunas:** o `gridTemplateColumns` calculado vem em pixels, e o teste reprova com a troca em 360 px;
- **os documentos:** o limiar de 340 px e os números conferem com o código.

Ele apontou um texto antigo impreciso, de antes das correções: "de 360 a 1279 px, o cabeçalho era 8 px mais largo". Na `main`, a diferença ia de 320 a 1279 px. O texto foi corrigido no relatório, na § 409 e no comentário do teste de bordas.
