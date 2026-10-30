# ToolCard

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O card de ferramenta nas grades da home, dos hubs e das relacionadas: um papel com o canto dobrado na cor da categoria.

- `<a>` inteiro clicável, com `fo-dogear` e `fo-cat--*`. Ícone num quadrado de 48px na cor cheia da categoria, com o ícone em `on-cat` (`on-violeta` na de casa e saúde).
- Nome em `h3` (Figtree 700 18px), descrição de uma linha em `ink-muted` que diz o ganho concreto ("up to 80% lighter"), não um adjetivo.
- Hover: sobe 3px com `shadow-lift`. Não tem lábio: card leva, botão faz.
- Grade `.fo-grid` com colunas de no mínimo 220px. Nas relacionadas, no máximo 6 cards.
- `fo-hubband`: a faixa do topo do hub, em `*-soft` da categoria, com sobretítulo `caption`, H1 e uma linha. O tom é só preenchimento: texto sempre `ink`.
