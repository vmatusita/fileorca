# ResultHero

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O resultado da calculadora: o número principal enorme, o Baixar PDF logo abaixo dele, uma frase que explica o número e a barra de principal × juros. Mora no fundo `deep`, como o ResultCard das ferramentas, e é o lugar só do resultado, do Baixar e do erro (F13b, DECISOES § C-2).

- Rótulo em `on-deep-muted`, número em `number-xl` com a unidade menor ao lado ("/mo"), frase em 17px com os números em negrito.
- A frase é o resultado dito em português claro, não uma tabela: "Over 30 years at 6.5% you'll pay $682,637, of which $382,637 is interest."
- Muda a cada tecla. Fredoka não tem algarismos tabulares, então o número fica alinhado à esquerda e cresce para a direita.
- `aria-live="polite"` com atraso de 500ms depois da última tecla, para o leitor de tela não ler cada dígito. É a única voz do resultado, também do erro (§ 102).
- A Oli mora no card desde a primeira pintura, sentada na borda de cima à direita, olhando o número (64 px no celular, 80 a partir de 768 px, `aria-hidden`): `wave` parada no exemplo, `cheer` uma vez no primeiro resultado da visita, `oops` no erro e `wave` depois. A pose troca na mesma caixa, então nada se move. Na saúde, nunca `cheer`. A calculadora não usa a Placa.
- O Baixar PDF fica dentro do card, logo abaixo do número, em bloco no celular (`button-lg`, sobre o mar com o `shadow-lip-on-deep`). O CSV e o Copiar link ficam fora, logo abaixo, no chão `bg` (ExportBar). A ordem PDF, CSV, link não muda.
- **O erro no card:** a mensagem do campo (ou o problema da conta) fica no lugar do Baixar, com o ícone `alert` em `danger-on-deep` e o texto em `on-deep`; "Last result that worked: Rate 6.5%." e o "Fix the highlighted field to update the result." ficam no lugar da frase, na mesma célula da grade; o número passa a `on-deep-muted`. O card guarda a altura do Baixar e da linha mais longa que um erro pode trazer, então não cresce no exemplo, na 1ª tecla, no resultado nem no erro. O campo culpado tem `aria-invalid` e `aria-describedby` para a mensagem (`#fo-rhero-error`).
- **A linha d'água do fundo do mar** (`.fo-sea-top`, § 539): por dentro da borda, no respiro de cima (20 px no celular), 16 px de `surface` que terminam na onda e a crista de 2 px em `stroke`, nos dois temas. A Oli fica acima dela.
- No SAC × PRICE, a outra parcela fica no card, logo abaixo do Baixar ("Na PRICE: R$ 4.534,12 por mês"), e o SplitChart mostra as duas barras na mesma escala.

## Contraste do par novo (F13b, § 538)

| Par | Claro | Escuro |
| --- | --- | --- |
| `danger-on-deep` (`#FF8A80`) sobre `deep` (`#0C2B5E`), o ícone de alerta do erro | 6,04:1 | 6,04:1 |
| `danger` sobre `deep` (o que ele substitui no card) | 2,45:1 | 6,04:1 |
| `on-deep` sobre `deep`, o texto do erro | o mesmo de toda frase do card | o mesmo |

## Mudanças de regra (F13b, DECISOES § C-2)

- **A Oli.** Antes: "A Oli aparece em `cheer` sem salto, segurando a Placa com o número, só no primeiro resultado da visita." Depois: a Oli fica no card desde o começo, na borda de cima à direita, em `wave`; faz `cheer` uma vez no primeiro resultado da visita e `oops` no erro; a calculadora não usa a Placa.
- **As ações.** Antes: "As ações (ExportBar) ficam fora do card, logo abaixo, no chão `bg`." Depois: o Baixar PDF fica dentro do card, logo abaixo do número; o CSV e o Copiar link continuam fora, no chão `bg`. A ordem PDF, CSV, link não muda.
- **O erro.** Antes (NumberField): a mensagem do erro, com o ícone, embaixo do campo, num `role="alert"`, e a linha "Fix the highlighted field…" embaixo do card, que o empurrava 50 px. Depois: a mensagem e o último resultado que valeu no card, no lugar do Baixar e da frase, sem mudar a altura; a voz é a região viva do card.
- **O respiro no celular.** A especificação da F10 pede `space-4`; o card fica com `space-5` (§ 140), onde a linha d'água cabe. O vão entre as peças passa a `space-2` (`space-3` a partir de 768 px).
