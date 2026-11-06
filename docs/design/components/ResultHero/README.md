# ResultHero

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O resultado da calculadora: o número principal enorme, o Baixar PDF logo abaixo dele, uma frase que explica o número e a barra de principal × juros. Mora no fundo `deep`, como o ResultCard das ferramentas, e é o lugar só do resultado, do Baixar e do erro (F13b, DECISOES § 545).

- Rótulo em `on-deep-muted`, número em `number-xl` com a unidade menor ao lado ("/mo"), frase em 17px com os números em negrito.
- A frase é o resultado dito em português claro, não uma tabela: "Over 30 years at 6.5% you'll pay $682,637, of which $382,637 is interest."
- Muda a cada tecla. Fredoka não tem algarismos tabulares, então o número fica alinhado à esquerda e cresce para a direita.
- `aria-live="polite"` com atraso de 500ms depois da última tecla, para o leitor de tela não ler cada dígito. É a única voz do resultado, também do erro (§ 102).
- A Oli mora no card desde a primeira pintura, sentada na borda de cima à direita, olhando o número (64 px no celular, 80 a partir de 768 px, `aria-hidden`): `wave` parada no exemplo, `cheer` uma vez no primeiro resultado da visita, `oops` no erro e `wave` depois. A pose troca na mesma caixa, então nada se move. Na saúde, nunca `cheer`. A calculadora não usa a Placa.
- O Baixar PDF fica dentro do card, logo abaixo do número, em bloco no celular (`button-lg`, sobre o mar com o `shadow-lip-on-deep`). O CSV e o Copiar link ficam fora, logo abaixo, no chão `bg` (ExportBar). A ordem PDF, CSV, link não muda.
- **O erro no card:** a mensagem do campo (ou o problema da conta) fica no lugar do Baixar, com o ícone `alert` em `danger-on-deep` e o texto em `on-deep`; "Last result that worked: Rate 6.5%." e o "Fix the highlighted field to update the result." ficam no lugar da frase, na mesma célula da grade; o número passa a `on-deep-muted`. O card guarda, desde a primeira pintura, o lugar do Baixar e da mensagem mais longa (de campo ou de problema da conta), da frase mais larga que um zero a mais ou um dígito a menos num campo pode trazer, do "último resultado" mais longo, do rótulo mais longo e das linhas da legenda com os números mais largos (§ 595): não cresce no exemplo, na 1ª tecla, no resultado, no erro nem no problema da conta. Um valor de outra ordem de grandeza digitado de uma vez ainda pode dar uma linha a mais à frase (o limite está na § 595). O campo culpado tem `aria-invalid` e `aria-describedby` para a mensagem (`#fo-rhero-error`).
- **A linha d'água do fundo do mar** (`.fo-sea-top`, § 539): por dentro da borda, no respiro de cima (20 px no celular), 16 px de `surface` que terminam na onda e a crista de 2 px em `stroke`, nos dois temas. A Oli fica acima dela.
- No SAC × PRICE, a outra parcela fica no card, logo abaixo do Baixar ("Na PRICE: R$ 4.534,12 por mês"), e o SplitChart mostra as duas barras na mesma escala.

## Contraste do par novo (F13b, § 538)

| Par | Claro | Escuro |
| --- | --- | --- |
| `danger-on-deep` (`#FF8A80`) sobre `deep` (`#0C2B5E`), o ícone de alerta do erro | 6,04:1 | 6,04:1 |
| `danger` sobre `deep` (o que ele substitui no card) | 2,45:1 | 6,04:1 |
| `on-deep` sobre `deep`, o texto do erro | o mesmo de toda frase do card | o mesmo |

## Mudanças de regra (F13b, DECISOES § 545)

- **A Oli.** Antes: "A Oli aparece em `cheer` sem salto, segurando a Placa com o número, só no primeiro resultado da visita." Depois: a Oli fica no card desde o começo, na borda de cima à direita, em `wave`; faz `cheer` uma vez no primeiro resultado da visita e `oops` no erro; a calculadora não usa a Placa.
- **As ações.** Antes: "As ações (ExportBar) ficam fora do card, logo abaixo, no chão `bg`." Depois: o Baixar PDF fica dentro do card, logo abaixo do número; o CSV e o Copiar link continuam fora, no chão `bg`. A ordem PDF, CSV, link não muda.
- **O erro.** Antes (NumberField): a mensagem do erro, com o ícone, embaixo do campo, num `role="alert"`, e a linha "Fix the highlighted field…" embaixo do card, que o empurrava 50 px. Depois: a mensagem e o último resultado que valeu no card, no lugar do Baixar e da frase, sem mudar a altura; a voz é a região viva do card.
- **O respiro no celular.** A especificação da F10 pede `space-4`; o card fica com `space-5` (§ 140), onde a linha d'água cabe. O vão entre as peças passa a `space-2` (`space-3` a partir de 768 px).

## Mudança de regra (revisão da F13b, DECISOES § 595)

- **O card não cresce com outro valor.** Antes (§ 545): "O card guarda a altura do Baixar e da linha mais longa que um erro pode trazer, então não cresce no exemplo, na 1ª tecla, no resultado nem no erro." Era verdade só no exemplo, na 1ª tecla com o último dígito trocado e no erro de letras: uma mensagem de problema de quatro linhas crescia o card 16 px (36 a 320), a frase de outros números ganhava uma linha (26 px; a hipoteca em 15 das 61 taxas de 3,0 a 9,0) e a legenda da barra, 22 px. Depois: o card guarda, desde a primeira pintura, o lugar de cada peça que outro valor pode mudar, cada um num atributo desenhado por um pseudo-elemento escondido na mesma célula (nunca texto da página): no lugar do Baixar, a mensagem mais longa de campo e de problema da conta (`CalcDef.problems`); na célula da frase, a frase mais larga do exemplo e do exemplo com um zero a mais ou um dígito a menos em cada campo principal (cada algarismo como o "0", o mais largo, e as palavras em negrito em maiúsculas) e o "Last result that worked" mais longo; o rótulo mais longo; e cada linha da legenda com os números mais largos. No celular as duas linhas da legenda ficam uma embaixo da outra, e as do par (SAC × PRICE) sempre. O número e o Baixar não se movem (as reservas vêm depois deles). O custo é altura em repouso em parte das calculadoras (a § 595 tem a medida), e ele se vê: no exemplo, o lugar do Baixar guarda até 36 px vazios entre o botão e a frase a 360 px (62 a 320) nas páginas com uma mensagem de problema mais longa que o Baixar (a segunda passada da revisão, s-3; § 600). O que sobra (um valor de outra ordem de grandeza, digitado de uma vez) está na § 595.
