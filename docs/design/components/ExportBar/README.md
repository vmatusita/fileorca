# ExportBar

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

As ações do resultado da calculadora: Baixar PDF (o único amarelo), CSV e Copiar link do cenário.

- Fica logo abaixo do ResultHero, no chão `bg`. Ordem fixa: PDF, CSV, link.
- Copiar link guarda os números depois do `#` (a parte que o navegador não envia). Ao copiar, o botão vira "Link copied" com check em `success` por 2 s, num `role="status"`.
- Nenhum número digitado vai para `?` na URL nem para evento do GA4.
- Os três botões contam no teste de distância: nenhum AdSlot a menos de `ad-clearance`.
