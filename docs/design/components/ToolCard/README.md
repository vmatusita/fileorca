# ToolCard

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O card de ferramenta nas grades dos hubs e das relacionadas: um papel com o canto dobrado na cor da categoria. Desde a F13b a home mostra as ferramentas como chips nas faixas das categorias (UX-03 B; DECISOES § H-1; antes, "nas grades da home, dos hubs e das relacionadas"); ver a seção "A faixa da categoria na home", abaixo.

- `<a>` inteiro clicável, com `fo-dogear` e `fo-cat--*`. Ícone num quadrado de 48px na cor cheia da categoria, com o ícone em `on-cat` (`on-violeta` na de casa e saúde).
- Nome em `h3` (Figtree 700 18px), descrição de uma linha em `ink-muted` que diz o ganho concreto ("up to 80% lighter"), não um adjetivo.
- Hover: sobe 3px com `shadow-lift`. Não tem lábio: card leva, botão faz.
- Grade `.fo-grid` com colunas de no mínimo 220px. Nas relacionadas, no máximo 6 cards.
- `fo-hubband`: a faixa do topo do hub, com sobretítulo `caption`, H1 e uma linha (e o "Reviewed by" nos hubs de dinheiro, casa e saúde). O tom é só preenchimento: texto sempre `ink`.
  - **Antes (até a F13a):** "a faixa do topo do hub, em `*-soft` da categoria, com sobretítulo `caption`, H1 e uma linha", nos dois temas.
  - **Depois (F13b, UX-15 A, hub-sea.html ?alt=a; DECISOES § 378 e § H-9):** nos quatro hubs de categoria, `.fo-hubband--sea` é o aquário da categoria. No pé da faixa, um `div.fo-hubband__sea[aria-hidden="true"]` com `pointer-events: none`, sem nada focável e sem texto: a água (`water`, 40px a 360 e 48px a partir de 768) com a onda do rodapé (120 × 16px, máscara de um elemento, nunca imagem de fundo), uma crista de 3px em `--fo-cat` (a mesma onda 3px acima, sob a água) e a Oli `swim` de 72px à direita (16px da borda; 24px a partir de 768), meio submersa, olhando para o H1. A faixa cresce 56px a 360 e 64px a partir de 768 no padding de baixo (80px e 88px), e nasce com a altura final. No claro, `*-soft`; no escuro, `surface`, e a cor da categoria fica só na crista (G-21). A Oli balança três vezes (`fo-bob`, 6 meias-voltas de 800ms, 4,8s) e para; com movimento reduzido, nada. A faixa usa a `Figtree Steady`, como a do hub de guias (CLS 0). O hub de guias (`.fo-cat--guide`) não tem o mar.

## A faixa da categoria na home (F13b, UX-03 B; DECISOES § 370 e § H-1)

- `section.fo-catband.fo-cat--<categoria>`: `*-soft` no claro e `surface` no escuro, raio `radius-xl`, padding `space-5`/`space-4`/`space-10` (`space-6`/`space-6`/`space-12` a partir de 768px), com a onda do rodapé (16px) na cor cheia da categoria na borda de baixo.
- Dentro: o H2 (Fredoka 600 24/30) e a contagem em `caption` `ink-muted`; o número em `number-md` (24/28; 28/32 a partir de 768) `ink`, com a seta `arrow-right` e o "to"/"para"/"a" em `fo-sr`; a frase da fonte (15/22 `ink-muted`); uma frase a mais (15/22 `ink`); as ferramentas como chips (o `.fo-chip` do NextStepChips, sem a seta, com o círculo da categoria; a ferramenta de outra categoria leva a classe dela) e o link do hub em `ink`, sublinhado, com 48px de altura (o `brand` sobre `*-soft` não chega a 4,5:1).
- Todo número tem fonte no repositório e é lido no build (`src/components/home-numbers.ts`; § H-2).

## Contraste dos pares novos (F13b; valores da seção 9 da proposta `docs/propostas/ux-v2/README.md`)

| Par | Onde | Mínimo | Claro | Escuro |
| --- | --- | --- | --- | --- |
| UX15-H1: `ink` sobre `surface` | sobretítulo, H1 e linha da faixa do hub no escuro | 4,50:1 | 17,28:1 (#0F1B2D / #FFFFFF) | 15,22:1 (#F7FAFD / #13223A) |
| UX15-H2: `ink-muted` sobre `surface` | a linha "Reviewed" da faixa dos hubs de dinheiro, casa e saúde no escuro | 4,50:1 | 7,01:1 (#4A5A72 / #FFFFFF) | 7,83:1 (#A9B7CA / #13223A) |
| UX15-W1: `stroke` sobre `surface` | a borda do chip sobre a faixa da home no escuro (e a crista da linha d'água dos cartões `deep`) | 3,00:1 | 17,28:1 (#0F1B2D / #FFFFFF) | 4,07:1 (#6A82A6 / #13223A) |
| UX15-W2: `stroke` sobre `bg` | a crista de 2px sobre a onda do rodapé, contra o chão | 3,00:1 | 16,50:1 (#0F1B2D / #F7FAFD) | 4,67:1 (#6A82A6 / #0B1524) |
| `ink` sobre `turquesa-soft`, `coral-soft`, `alga-soft`, `violeta-soft` e `lima-soft` | o H2, o número e o link da faixa da home e da faixa do hub, no claro | 4,50:1 | 14,29 · 14,06 · 14,51 · 13,13 · 15,28:1 | (no escuro a faixa é `surface`: UX15-H1) |
| `ink-muted` sobre os mesmos `*-soft` | a contagem e a frase da fonte na faixa da home, no claro | 4,50:1 | 5,79 · 5,70 · 5,88 · 5,32 · 6,20:1 | (no escuro: UX15-H2) |
| `stroke` sobre os mesmos `*-soft` | a borda do chip na faixa da home, no claro | 3,00:1 | 14,29 · 14,06 · 14,51 · 13,13 · 15,28:1 | (no escuro: UX15-W1) |

A crista da categoria (`--fo-cat` sobre `*-soft` ou `surface`) é decorativa, como a dobra: a categoria já é dita pelo sobretítulo e pelo H1, e ela não entra na conta.
