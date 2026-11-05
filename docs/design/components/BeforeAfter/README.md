# BeforeAfter

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O comparador antes/depois com cursor deslizante: a prova de que a imagem ficou leve sem ficar feia.

- Duas imagens sobrepostas; a de cima é recortada com `clip-path: inset(0 0 0 var(--pos))`.
- O controle é um `<input type="range">` invisível sobre tudo: arrastar, tocar e setas do teclado funcionam, e o leitor de tela anuncia "Compare before and after".
- Botão redondo de 48px com traço e lábio e as duas setas (‹ ›, dois `<path>`: arrasta para os dois lados; D-09), linha de 3px em `surface`. Etiquetas "Before · 2.4 MB" e "After · 780 KB" em pílulas `deep` (F13a, DECISOES § 471; antes, o puxador com uma seta só, o `chevron-right`).
- Mora dentro do ResultCard da compressão e da conversão com perda, em todas as larguras, e abre só quando a pessoa pede, pelo botão "Before and after" (`aria-expanded`, `aria-controls`); antes do toque, as imagens nem são decodificadas. Não aparece em conversão sem perda (PNG para JPG sem mudança visível é só o ResultCard). F13a, DECISOES § 467; antes, "Aparece dentro do ResultCard da compressão e da conversão com perda".
- Começa em 50%. Com movimento reduzido, nada anima: o cursor só se move pela mão da pessoa.
