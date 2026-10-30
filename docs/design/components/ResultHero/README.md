# ResultHero

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O resultado da calculadora: o número principal enorme, uma frase que explica o número e a barra de principal × juros. Mora no fundo `deep`, como o ResultCard das ferramentas.

- Rótulo em `on-deep-muted`, número em `number-xl` com a unidade menor ao lado ("/mo"), frase em 17px com os números em negrito.
- A frase é o resultado dito em português claro, não uma tabela: "Over 30 years at 6.5% you'll pay $682,637, of which $382,637 is interest."
- Muda a cada tecla. Fredoka não tem algarismos tabulares, então o número fica alinhado à esquerda e cresce para a direita.
- `aria-live="polite"` com atraso de 500ms depois da última tecla, para o leitor de tela não ler cada dígito.
- A Oli aparece em `cheer` sem salto, segurando a Placa com o número, só no primeiro resultado da visita.
- As ações (ExportBar) ficam fora do card, logo abaixo, no chão `bg`.
