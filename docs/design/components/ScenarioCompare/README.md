# ScenarioCompare

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Dois cenários lado a lado (15 × 30 anos, com e sem pagamento extra) e uma frase que diz a diferença.

- Dois cards `fo-scn` com a mesma ordem de linhas, rotulados A e B em círculos `deep`. Números em `number-md`.
- A diferença vem numa linha só, em `brand-soft`: "B costs $717 more a month and saves $212,238 in interest." Diz os dois lados, sem eleger vencedor: a ferramenta é educativa.
- No celular os dois cards ficam lado a lado até 340px de largura útil; abaixo disso, empilham e a frase da diferença sobe para o topo.
- Cada cenário tem o próprio link de cenário (ExportBar).

## Mudança de regra (F13b, DECISOES § 549; D-38)

- Antes: "No celular os dois cards ficam lado a lado até 340px de largura útil; abaixo disso, empilham e a frase da diferença sobe para o topo." Depois: os dois cards ficam lado a lado até 320 px de tela (288 px de coluna), com o número em 20/24 px e o card mais justo (respiro `space-3`) abaixo de 480 px; a frase da diferença fica embaixo deles.
