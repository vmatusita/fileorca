# ExportBar

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

As ações do resultado da calculadora: Baixar PDF (o único amarelo), CSV e Copiar link do cenário.

- Fica logo abaixo do ResultHero, no chão `bg`. Ordem fixa: PDF, CSV, link.
- Copiar link guarda os números depois do `#` (a parte que o navegador não envia). Ao copiar, o botão vira "Link copied" com check em `success` por 2 s, num `role="status"`.
- Nenhum número digitado vai para `?` na URL nem para evento do GA4.
- Os três botões contam no teste de distância: nenhum AdSlot a menos de `ad-clearance`.

## Mudança de regra (F13b, DECISOES § C-2; F4 ACE-8)

- **O lugar do PDF.** Antes: "Fica logo abaixo do ResultHero, no chão `bg`. Ordem fixa: PDF, CSV, link." Depois: o Baixar PDF fica dentro do ResultHero, logo abaixo do número; a ExportBar, logo abaixo do card, no chão `bg`, tem o CSV e o Copiar link, numa linha no celular em en e pt (duas em es), com 16 px de respiro lateral. A ordem PDF, CSV, link não muda.
- **O nome do CSV.** Antes: "CSV". Depois: "Download CSV", "Baixar CSV", "Descargar CSV" (o botão começa com o verbo).
- **Sem resultado.** Antes: o PDF e o CSV desligados (§ 139 e § 276). Depois: o Baixar PDF sai, e o lugar dele no card diz por quê, na mesma altura (F7 f-10, saída A); o CSV, secundário, fica desligado.
