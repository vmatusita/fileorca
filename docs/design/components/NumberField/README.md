# NumberField

Entradas · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O campo das calculadoras: grande, com prefixo ou sufixo de unidade, número no formato do idioma e o erro dito em palavras.

- Altura `control-h`, traço `stroke`, `radius-md`. Valor em Figtree 600 18px com algarismos tabulares. Prefixo/sufixo em `surface-sunken`.
- `inputmode="decimal"`, nunca `type="number"` (que quebra a vírgula do português). O campo aceita "1.234,56" em pt e "1,234.56" em en, e formata ao sair do campo.
- Taxa é sempre digitada: o valor inicial é um exemplo e leva a etiqueta `fo-tag` "example" / "exemplo". Nunca "today's rate".
- Recalcula a cada tecla (sem botão Calcular). Valor inválido não apaga o resultado anterior: mostra o erro (`data-state="error"`, traço `danger` de 3px, `aria-invalid`, mensagem com ícone ligada por `aria-describedby`) e mantém o último resultado válido.
- Entre campos não há anúncio, nem ao lado de `<select>`.

## Mudança de regra (F13b, DECISOES § 545; F4 ACE-11)

- **O erro de um campo de calculadora.** Antes: "mostra o erro (`data-state="error"`, traço `danger` de 3px, `aria-invalid`, mensagem com ícone ligada por `aria-describedby`)", com a mensagem embaixo do campo, num `role="alert"`, e a borda de 3 px que crescia o campo 2 px. Depois: o traço de 3 px é a borda de 2 px mais 1 px de `box-shadow` por fora (o campo fica com os 52 px), o ícone `alert` fica dentro da caixa, antes da unidade, e a mensagem fica no ResultHero, no lugar do Baixar (`#fo-rhero-error`), para onde o `aria-describedby` do campo aponta; a voz é a região viva do card. O campo que um problema da conta aponta (o pagamento que não cobre os juros) ganha o mesmo `aria-invalid`. Fora das calculadoras (Redimensionar, Recortar, o QR), o campo segue como antes. A F15 pôs mais um campo fora das calculadoras, o "Tamanho máximo" do Comprimir imagem, com o sufixo "KB", número inteiro sem separador de milhar (como o do Redimensionar) e o erro embaixo do campo, como antes (DECISOES § 656).

## Mudança de regra (revisão da F13b, DECISOES § 593)

- **Vários campos errados.** Antes (§ 545): todo campo errado tinha o `aria-describedby` para a mensagem do card, que diz só o primeiro, e o segundo campo era descrito pela faixa do primeiro. Depois: só o campo que o card nomeia (o primeiro errado, ou o que um problema da conta aponta) aponta para o card; os outros apontam para a própria mensagem (`#<id>-error`, `.fo-field__msg`, só para o leitor de tela, sem `role` e sem região viva: a voz continua uma só, a do card). O DateField segue a mesma regra.
- **A mensagem perto do campo no celular (DECISOES § 594).** Antes (§ 545): abaixo de 768 px, um campo errado depois do card tinha só o traço e o ícone, e a mensagem ficava no card, acima da tela. Depois: enquanto esse campo tem o foco, a mensagem (ou o problema da conta que aponta para ele) aparece logo embaixo dele, por cima do que vem depois (`position: absolute`, sem mexer em nada), em `danger-soft` com o traço `danger` de 2 px e o texto em `ink`, e deixa o toque passar; ela sai com o foco. A partir de 768 px, e nos campos antes do card, a mensagem fica só no card.
- **A etiqueta "example" compacta (DECISOES § 550).** Antes: a etiqueta `fo-tag` com o respiro e o espaçamento de letras do design system em toda largura. Depois: abaixo de 400px, nas calculadoras, ela fica a 6px do rótulo, com 4px de respiro dos lados e menos espaçamento entre as letras (uns 12px a menos): "Tasa nueva" e a etiqueta cabem em meia linha também com a fonte de reserva.
- **O bloco que dobra e o eco (DECISOES § 547).** Antes: os campos de impostos, seguros e taxas da hipoteca e a TR do SAC × PRICE ficavam abertos depois do resultado. Depois: eles ficam num bloco fechado ao abrir a página, com o total no título (o botão de 56px com o chevron que gira, só o `aria-expanded` muda), os campos só entram na página com o bloco aberto, e no celular o bloco termina no eco do resultado (`.fo-calc__echo`, `aria-hidden`), porque o card fica acima da tela ali.
