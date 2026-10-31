# Ajuste · Espaço do aviso de cookies no fim da página

Pedido do Victor em 31/out/2026, depois do merge da F3 (`94a1428`), na mesma conversa da run. Junto veio um screenshot de fileorca.com no Chrome do Windows, janela anônima, a uns 1920 px: a página rolada até o fim, com o aviso de cookies aberto no canto esquerdo e, embaixo do rodapé, uma área azul-escura vazia de uns 220 px na largura toda.

> o erro ainda aparece ao scrollar para baixo, fica todo esse espaço até eu aceitar os cookies

## O que a run faz

- Reproduz o espaço com um teste que falha no código de hoje.
- Corrige a causa, sem perder a garantia das § 36 e § 101: o aviso e a âncora do AdSense nunca cobrem o foco do teclado (WCAG 2.4.11).
- Ajusta os testes que afirmavam a reserva sempre ligada e registra o porquê no DECISOES.md.
- Tira screenshots de antes e depois, roda o `pnpm verificar`, escreve o relatório e abre a PR da branch `ajuste-aviso-espaco`, que o CI mescla.
- Confere a produção depois do merge, só por leitura e com o Google bloqueado.

Regras: as do CLAUDE.md, com as seções da F1a à F3. Fora do escopo: anúncio, consentimento por região, `.github/` e qualquer outra parte do site.
