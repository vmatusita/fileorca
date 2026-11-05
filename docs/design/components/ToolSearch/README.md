# ToolSearch

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A busca de ferramentas (Ctrl+K no computador, ícone no celular): um campo e uma lista filtrada enquanto a pessoa digita.

- Caixa `surface` com traço e `shadow-pop`, campo de 60px em 18px. Resultados com o círculo da categoria, o nome e a categoria à direita.
- **Na 404, só o traço (F13b, UX-17 A, G-13; DECISOES § I-2).** Antes: a busca da página da 404 era a mesma caixa do diálogo, com `shadow-pop`. Depois: ela fica na página, não flutua, então leva só o traço `stroke-2` em `stroke` (`.fo-search-inline .fo-search { box-shadow: none }`); a do diálogo continua com a sombra. Marcação, combobox e lista nomeada não mudam.
- Teclado: setas movem (`aria-selected`), Enter abre, Esc fecha. `role="dialog"` com o foco preso enquanto aberta.
- É o padrão combobox: o campo leva `role="combobox"`, `aria-expanded`, `aria-controls` (a lista) e `aria-activedescendant` (a opção marcada); a lista é `role="listbox"` com nome ("Results"). O foco fica no campo o tempo todo.
- Dois grupos (F11, DECISOES § 397): primeiro as ferramentas, depois os guias, cada um um `role="group"` nomeado pelo título dele ("Tools", "Guides", na legenda `caption` em `ink-muted`). Grupo vazio não tem título. Um guia tem o ícone `file`, o círculo da cor do grupo dele e "Guide" à direita. As setas passam de um grupo para o outro, pulando os títulos.
- Procura nos três idiomas e em sinônimos ("shrink", "reduzir", "achicar" → Compress).
- Sem resultado: a Oli em `peek` espia da borda de baixo, diz o que procurou e sugere três termos reais. Nunca "No results".
