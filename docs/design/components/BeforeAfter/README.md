# BeforeAfter

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O comparador antes/depois com cursor deslizante: a prova de que a imagem ficou leve sem ficar feia.

- Duas imagens sobrepostas; a de cima é recortada com `clip-path: inset(0 0 0 var(--pos))`.
- O controle é um `<input type="range">` invisível sobre tudo: arrastar, tocar e setas do teclado funcionam, e o leitor de tela anuncia "Compare before and after".
- Botão redondo de 48px com traço e lábio, linha de 3px em `surface`. Etiquetas "Before · 2.4 MB" e "After · 780 KB" em pílulas `deep`.
- Aparece dentro do ResultCard da compressão e da conversão com perda. Não aparece em conversão sem perda (PNG para JPG sem mudança visível é só o ResultCard).
- Começa em 50%. Com movimento reduzido, nada anima: o cursor só se move pela mão da pessoa.
