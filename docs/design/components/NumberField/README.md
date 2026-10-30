# NumberField

Entradas · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O campo das calculadoras: grande, com prefixo ou sufixo de unidade, número no formato do idioma e o erro dito em palavras.

- Altura `control-h`, traço `stroke`, `radius-md`. Valor em Figtree 600 18px com algarismos tabulares. Prefixo/sufixo em `surface-sunken`.
- `inputmode="decimal"`, nunca `type="number"` (que quebra a vírgula do português). O campo aceita "1.234,56" em pt e "1,234.56" em en, e formata ao sair do campo.
- Taxa é sempre digitada: o valor inicial é um exemplo e leva a etiqueta `fo-tag` "example" / "exemplo". Nunca "today's rate".
- Recalcula a cada tecla (sem botão Calcular). Valor inválido não apaga o resultado anterior: mostra o erro (`data-state="error"`, traço `danger` de 3px, `aria-invalid`, mensagem com ícone ligada por `aria-describedby`) e mantém o último resultado válido.
- Entre campos não há anúncio, nem ao lado de `<select>`.
