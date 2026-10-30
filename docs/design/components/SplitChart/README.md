# SplitChart

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O gráfico de principal × juros: uma barra empilhada em SVG próprio (ou HTML), sem biblioteca, com a legenda que diz os valores.

- Principal em `brand`, juros em `coral` com hachura diagonal: azul e coral se distinguem por quem não vê vermelho e verde, e a hachura separa até em preto e branco.
- Sobre `deep` (dentro do ResultHero), o principal usa `brand-on-deep` nos dois temas: o `brand` do tema claro fica em 2,7:1 contra o fundo do mar; `brand-on-deep` fica em 5,3:1.
- A barra é `role="img"` com `aria-label` que diz os dois valores e as porcentagens. A legenda repete os valores em texto: a cor nunca é a única informação.
- Fica dentro do ResultHero (sobre `deep`) ou sozinha no conteúdo (sobre `bg`).
- Sem eixo, sem grade, sem animação de entrada. Muda de largura com `dur-base` quando os números mudam.
