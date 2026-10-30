# ToolSearch

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A busca de ferramentas (Ctrl+K no computador, ícone no celular): um campo e uma lista filtrada enquanto a pessoa digita.

- Caixa `surface` com traço e `shadow-pop`, campo de 60px em 18px. Resultados com o círculo da categoria, o nome e a categoria à direita.
- Teclado: setas movem (`aria-selected`), Enter abre, Esc fecha. `role="dialog"` com o foco preso enquanto aberta.
- É o padrão combobox: o campo leva `role="combobox"`, `aria-expanded`, `aria-controls` (a lista) e `aria-activedescendant` (a opção marcada); a lista é `role="listbox"` com nome ("Tools"). O foco fica no campo o tempo todo.
- Procura nos três idiomas e em sinônimos ("shrink", "reduzir", "achicar" → Compress).
- Sem resultado: a Oli em `peek` espia da borda de baixo, diz o que procurou e sugere três termos reais. Nunca "No results".
