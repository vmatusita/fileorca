# GuideCard

Navegação · FileOrca design system v1.1 (F11). Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O cartão de guia: o mesmo papel do ToolCard (traço de 2px no `stroke` e o canto dobrado na cor do grupo do guia), mas com outra face. Ele começa por palavras, não pelo quadrado de 48px com o ícone, que é a cara de uma ferramenta. Assim a leitura e a ferramenta não se confundem numa grade (F5b F-12).

- `<a>` inteiro clicável, um link só, com `fo-dogear` e `fo-cat--image`, `fo-cat--pdf` ou `fo-cat--money` (o grupo do guia: turquesa, coral ou alga). Nunca a classe `fo-tool`.
- Na ordem do nome acessível, que começa por "Guide" ("Guia", "Guía"):
  - o tipo: o ícone `file` e "Guide" em `ink` 700 14/20;
  - o nome do guia, Figtree 700 18/24, num título do nível que a página pede (`h3` embaixo do `h2` da seção);
  - a descrição, em `ink-muted` 15/22;
  - a medida, com o ícone `table`, em `ink-muted` 500 14/20: "Measured on N test files" nos guias de arquivo, com o N lido no build de `data/guides-measured.json` (os arquivos distintos de todas as amostras do guia), e "Numbers worked out" nos guias de dinheiro. O número sai no formato do idioma;
  - o pé, depois de um fio tracejado (`stroke-hair` em `hairline`): o círculo de 32px na cor da categoria da ferramenta (que pode não ser a do grupo: Image to PDF é coral num guia de imagem), com o ícone em `on-cat`, o rótulo "Tool in the guide" em `ink-muted` 500 13/18 e o nome da ferramenta em 600 15/20.
- Os ícones `file` e `table` ficam em `brand`, com 20px. Todos os ícones e o círculo são `aria-hidden`: as palavras ao lado dizem o mesmo.
- Hover: sobe 3px com `shadow-lift`, como o ToolCard. Com movimento reduzido, não sobe. Não tem lábio: card leva, botão faz.
- Grade `.fo-guidecards`: colunas de no mínimo 300px (`repeat(auto-fill, minmax(min(100%, 300px), 1fr))`), gap `space-4`. Uma coluna no celular e duas a partir de uns 664px. Os nomes dos guias são longos, e com os 220px do ToolCard dariam quatro linhas. Nas relacionadas, o cartão entra na `.fo-grid` de 220px ao lado dos ToolCards: o "Guide" fica sozinho na primeira linha e a medida numa linha própria.
- Variante `fo-guidecard--here`, na página da ferramenta ou da calculadora que o guia traz: no fim do bloco "How to", depois dos passos, sem o pé (a ferramenta do guia é a da própria página) e sem título (o nome e a descrição são `span`, e o bloco já tem o `h2`). Com dois guias, dois cartões, um embaixo do outro.
- Onde aparece: o hub de guias, a seção "Read a guide" da home, as relacionadas de um guia e, como `--here`, as ferramentas e calculadoras que têm guia.
- Tokens: só os que já existem. Os pares novos são `brand` sobre `surface` (os ícones, 5,09:1 no claro e 6,11:1 no escuro) e, no hub, `ink` sobre `brand-soft` (a faixa).
