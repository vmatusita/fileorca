# OptionGroup

Entradas · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Os ajustes da ferramenta: um trilho segmentado (radio) para escolhas de 2 a 4 opções e um controle deslizante para valores contínuos.

- **Resultado primeiro, ajuste depois.** A ferramenta já processa com o padrão recomendado; mexer numa opção reprocessa na hora. Não há botão "Aplicar".
- Trilho `surface-sunken`, opção marcada com `surface` e traço `stroke`. Cada opção pode ter uma linha de ajuda em `small` ("best balance").
- Segmentado é `<fieldset>` + `<legend>` + `<input type="radio">` dentro de cada `<label>`: setas trocam a opção, o foco aparece na opção.
- Deslizante (`fo-range`): trilho com o preenchimento em `brand`, botão com traço e lábio de 3px, valor atual em Fredoka ao lado do rótulo e as pontas explicadas em palavras ("Smaller file" / "Sharper image").
- Opção que muda algo irreversível ou visível (Strong desenha a página como imagem) avisa antes, em OliMessage `info`.
- Mais de 4 opções vira `<select>` no estilo do NumberField.
