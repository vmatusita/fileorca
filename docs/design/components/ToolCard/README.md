# ToolCard

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O card de ferramenta nas grades da home, dos hubs e das relacionadas: um papel com o canto dobrado na cor da categoria. Na F13b a home mostrou as ferramentas como chips nas faixas das categorias (UX-03 B; DECISOES § 567); desde o ajuste-home-cards ela volta a um card por ferramenta, na grade de cada seção de categoria (DECISOES § 602); ver a seção "A grade nas seções de categoria da home", abaixo.

- `<a>` inteiro clicável, com `fo-dogear` e `fo-cat--*`. Ícone num quadrado de 48px na cor cheia da categoria, com o ícone em `on-cat` (`on-violeta` na de casa e saúde).
- Nome em `h3` (Figtree 700 18px), descrição de uma linha em `ink-muted` que diz o ganho concreto ("up to 80% lighter"), não um adjetivo.
- Hover: sobe 3px com `shadow-lift`. Não tem lábio: card leva, botão faz.
- Grade `.fo-grid` com colunas de no mínimo 220px. Nas relacionadas, no máximo 6 cards.
- `fo-hubband`: a faixa do topo do hub, com sobretítulo `caption`, H1 e uma linha (e o "Reviewed by" nos hubs de dinheiro, casa e saúde). O tom é só preenchimento: texto sempre `ink`.
  - **Antes (até a F13a):** "a faixa do topo do hub, em `*-soft` da categoria, com sobretítulo `caption`, H1 e uma linha", nos dois temas.
  - **Depois (F13b, UX-15 A, hub-sea.html ?alt=a; DECISOES § 378 e § 575):** nos quatro hubs de categoria, `.fo-hubband--sea` é o aquário da categoria. No pé da faixa, um `div.fo-hubband__sea[aria-hidden="true"]` com `pointer-events: none`, sem nada focável e sem texto: a água (`water`, 40px a 360 e 48px a partir de 768) com a onda do rodapé (120 × 16px, máscara de um elemento, nunca imagem de fundo), uma crista de 3px em `--fo-cat` (a mesma onda 3px acima, sob a água) e a Oli `swim` de 72px à direita (16px da borda; 24px a partir de 768), meio submersa, olhando para o H1. A faixa cresce 56px a 360 e 64px a partir de 768 no padding de baixo (80px e 88px), e nasce com a altura final. No claro, `*-soft`; no escuro, `surface`, e a cor da categoria fica só na crista (G-21). A Oli balança três vezes (`fo-bob`, 6 meias-voltas de 800ms, 4,8s) e para; com movimento reduzido, nada. A faixa usa a `Figtree Steady`, como a do hub de guias (CLS 0). O hub de guias (`.fo-cat--guide`) não tem o mar.

## A grade nas seções de categoria da home (ajuste-home-cards; DECISOES § 602 a § 608)

- Debaixo do topo (o H1, a linha e o mar, que não mudam), uma `section.fo-section.fo-section--cat` por categoria do idioma, na ordem da página (imagem, PDF, dinheiro, casa e saúde só em inglês, QR code), com o `aria-labelledby` e o id do H2 de antes (`tools`, `pdf-home`, `money-home`, `life-home` e `qr-home`), sem fundo, sem cantos e sem onda, como na F13a.
- Dentro: o H2 (Fredoka 600 24/30); a frase da seção num `p.fo-prose` com no máximo 28rem, como a linha do topo, para o H1 continuar o maior texto da primeira tela a partir de 768px (§ 608), e 12px embaixo, a margem de um parágrafo da prosa (§ 616); a `ul.fo-grid` com um ToolCard por ferramenta, com o nome, a descrição e o ícone dos textos comuns e dos registros (`src/components/home-bands.ts`), o "Image to PDF" na cor do PDF, a casa e a saúde em `home` e o QR em `util`; e o link do hub num `p.fo-more` (dois na seção de casa e saúde, nenhum na do QR).
- A grade é a `.fo-grid` dos hubs, sem regra própria: com o `<main>` largo da home (o build padrão, sem a lateral; 1.208px a 1280), 5 cards de 229px por linha; com a lateral, 3 de 242px na coluna de 760px. Os cards de uma linha têm a mesma altura (a `li` e o card esticam), e a descrição mais longa ocupa 4 linhas a 1280.
- **Antes (F13b, UX-03 B; DECISOES § 370, § 567 e § 568):** "`section.fo-catband.fo-cat--<categoria>`: `*-soft` no claro e `surface` no escuro, raio `radius-xl`, … com a onda do rodapé (16px) na cor cheia da categoria na borda de baixo", com o H2 e a contagem, o número e a frase da fonte, uma frase a mais, as ferramentas como chips e o link do hub sublinhado. O Victor preferiu os cards (DECISOES § 602).

## Contraste dos pares novos (F13b; valores da seção 9 da proposta `docs/propostas/ux-v2/README.md`)

| Par | Onde | Mínimo | Claro | Escuro |
| --- | --- | --- | --- | --- |
| UX15-H1: `ink` sobre `surface` | sobretítulo, H1 e linha da faixa do hub no escuro | 4,50:1 | 17,28:1 (#0F1B2D / #FFFFFF) | 15,22:1 (#F7FAFD / #13223A) |
| UX15-H2: `ink-muted` sobre `surface` | a linha "Reviewed" da faixa dos hubs de dinheiro, casa e saúde no escuro | 4,50:1 | 7,01:1 (#4A5A72 / #FFFFFF) | 7,83:1 (#A9B7CA / #13223A) |
| UX15-W1: `stroke` sobre `surface` | a crista da linha d'água dos cartões `deep` | 3,00:1 | 17,28:1 (#0F1B2D / #FFFFFF) | 4,07:1 (#6A82A6 / #13223A) |
| UX15-W2: `stroke` sobre `bg` | a crista de 2px sobre a onda do rodapé, contra o chão | 3,00:1 | 16,50:1 (#0F1B2D / #F7FAFD) | 4,67:1 (#6A82A6 / #0B1524) |
| `ink` sobre `turquesa-soft`, `coral-soft`, `alga-soft`, `violeta-soft` e `lima-soft` | o sobretítulo, o H1 e a linha da faixa do hub, no claro | 4,50:1 | 14,29 · 14,06 · 14,51 · 13,13 · 15,28:1 | (no escuro a faixa é `surface`: UX15-H1) |

A crista da categoria (`--fo-cat` sobre `*-soft` ou `surface`) é decorativa, como a dobra: a categoria já é dita pelo sobretítulo e pelo H1, e ela não entra na conta.
