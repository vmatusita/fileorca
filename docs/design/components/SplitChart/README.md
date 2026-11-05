# SplitChart

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O gráfico de principal × juros: uma barra empilhada em SVG próprio (ou HTML), sem biblioteca, com a legenda que diz os valores.

- Principal em `brand`, juros em `coral` com hachura diagonal: azul e coral se distinguem por quem não vê vermelho e verde, e a hachura separa até em preto e branco.
- Sobre `deep` (dentro do ResultHero), o principal usa `brand-on-deep` nos dois temas: o `brand` do tema claro fica em 2,7:1 contra o fundo do mar; `brand-on-deep` fica em 5,3:1.
- A barra é `role="img"` com `aria-label` que diz os dois valores e as porcentagens. A legenda repete os valores em texto: a cor nunca é a única informação.
- Fica dentro do ResultHero (sobre `deep`) ou sozinha no conteúdo (sobre `bg`).
- Sem eixo, sem grade, sem animação de entrada. Muda de largura com `dur-base` quando os números mudam.

## Mudança de regra (F13b, DECISOES § C-6; D-38)

- **A variante de duas barras na mesma escala** (`.fo-split--pair`), só onde a conta compara dois sistemas sobre o mesmo empréstimo (o SAC × PRICE): uma barra por sistema, cada uma com o mesmo principal (`brand-on-deep`) e os juros do sistema (`coral` com a hachura); a barra mais longa ocupa a largura toda, e a outra a parte que lhe cabe. O nome de cada barra ("SAC", "PRICE") fica à esquerda, em 13 px `on-deep-muted`. O par é `role="img"` com os dois totais no nome ("Valor financiado de R$ 480.000 nos dois sistemas. Juros de R$ 756.766 no SAC e de R$ 1.098.272 na PRICE."), e a legenda repete em texto ("Valor financiado R$ 480.000" e "Juros: SAC R$ 756.766 · PRICE R$ 1.098.272"). Antes: só a barra única de principal × juros.
