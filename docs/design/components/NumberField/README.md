# NumberField

Entradas · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O campo das calculadoras: grande, com prefixo ou sufixo de unidade, número no formato do idioma e o erro dito em palavras.

- Altura `control-h`, traço `stroke`, `radius-md`. Valor em Figtree 600 18px com algarismos tabulares. Prefixo/sufixo em `surface-sunken`.
- `inputmode="decimal"`, nunca `type="number"` (que quebra a vírgula do português). O campo aceita "1.234,56" em pt e "1,234.56" em en, e formata ao sair do campo.
- Taxa é sempre digitada: o valor inicial é um exemplo e leva a etiqueta `fo-tag` "example" / "exemplo". Nunca "today's rate".
- Recalcula a cada tecla (sem botão Calcular). Valor inválido não apaga o resultado anterior: mostra o erro (`data-state="error"`, traço `danger` de 3px, `aria-invalid`, mensagem com ícone ligada por `aria-describedby`) e mantém o último resultado válido.
- Entre campos não há anúncio, nem ao lado de `<select>`.

## Mudança de regra (F13b, DECISOES § 545; F4 ACE-11)

- **O erro de um campo de calculadora.** Antes: "mostra o erro (`data-state="error"`, traço `danger` de 3px, `aria-invalid`, mensagem com ícone ligada por `aria-describedby`)", com a mensagem embaixo do campo, num `role="alert"`, e a borda de 3 px que crescia o campo 2 px. Depois: o traço de 3 px é a borda de 2 px mais 1 px de `box-shadow` por fora (o campo fica com os 52 px), o ícone `alert` fica dentro da caixa, antes da unidade, e a mensagem fica no ResultHero, no lugar do Baixar (`#fo-rhero-error`), para onde o `aria-describedby` do campo aponta; a voz é a região viva do card. O campo que um problema da conta aponta (o pagamento que não cobre os juros) ganha o mesmo `aria-invalid`. Fora das calculadoras (Redimensionar, Recortar, o QR), o campo segue como antes.

## Mudança de regra (revisão da F13b, DECISOES § 593)

- **Vários campos errados.** Antes (§ 545): todo campo errado tinha o `aria-describedby` para a mensagem do card, que diz só o primeiro, e o segundo campo era descrito pela faixa do primeiro. Depois: só o campo que o card nomeia (o primeiro errado, ou o que um problema da conta aponta) aponta para o card; os outros apontam para a própria mensagem (`#<id>-error`, `.fo-field__msg`, só para o leitor de tela, sem `role` e sem região viva: a voz continua uma só, a do card). O DateField segue a mesma regra.
