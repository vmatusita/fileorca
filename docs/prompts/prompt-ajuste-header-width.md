# Prompt do ajuste `ajuste-header-width`

Run curta, pedida na conversa logo depois do merge da F11 (PR 23), sem ficha escrita. A PR do ajuste é a 24. Este arquivo guarda o pedido e a escolha, como a regra "Grave o próprio prompt" do `CLAUDE.md` pede.

## O pedido

> o header nao esta com a mesma largura do footer, deveria estar

## A pergunta e a resposta

A run achou um conflito antes de mudar o código. A partir de 1280 px, o cabeçalho terminava em x 794 de propósito, para ficar a 150 px da lateral de anúncio (§ 388, F10 p-5). Com as bordas do rodapé (até x 1256), o tema e o Menu ficariam a 29 px do anúncio da lateral, e o Menu aberto cobriria esse anúncio. A run perguntou ao Victor, com três opções:

1. **Largura do rodapé (recomendada):** o cabeçalho vai de borda a borda como o rodapé, em toda página e largura. A lateral desce para começar 150 px abaixo do cabeçalho, e os botões ficam a 158 px do anúncio. O Menu aberto cobre o alto da lateral, mas o clique que o fecha não chega ao anúncio (a correção da F11). A regra dos 150 px para menu aberto sai do README do Header e do `ads.spec.ts`.
2. **Rodapé só sem lateral:** o cabeçalho alinhado ao rodapé na home, nos hubs, nos guias e nas páginas institucionais e jurídicas. Nas ferramentas com lateral, ele continua terminando na coluna e muda de largura entre as páginas.
3. **Manter como está.**

O Victor escolheu a opção 1.

## O que a run seguiu

- As regras do `CLAUDE.md`: a branch `ajuste-header-width`, a PR em rascunho logo depois do primeiro push, o merge pelo CI e nunca o `gh pr merge`. Os commits foram adicionados por caminho, nunca com `git add -A`, e a pasta `Claude outputs/` ficou fora.
- Os testes: um teste que reprova sem a mudança, e nenhum afrouxado além do que a escolha muda (o menu aberto contra a lateral).
- O `pnpm verificar --partes` uma vez antes do `gh pr ready`.
- A revisão: como o ajuste mexe em anúncio, cinco lentes Sonnet, um cético por achado médio ou acima e um para os baixos (regra 3).
- O relatório em `docs/relatorios/ajuste-header-width.md` e a § 409 no `DECISOES.md`.
