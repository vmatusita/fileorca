# OptionGroup

Entradas · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Os ajustes da ferramenta: um trilho segmentado (radio) para escolhas de 2 a 4 opções e um controle deslizante para valores contínuos.

- **Resultado primeiro, ajuste depois.** A ferramenta já processa com o padrão recomendado; mexer numa opção reprocessa na hora. Não há botão "Aplicar".
- Trilho `surface-sunken`, opção marcada com `surface` e traço `stroke`. Cada opção pode ter uma linha de ajuda em `small` ("best balance").
- Segmentado é `<fieldset>` + `<legend>` + `<input type="radio">` dentro de cada `<label>`: setas trocam a opção, o foco aparece na opção.
- Deslizante (`fo-range`): trilho com o preenchimento em `brand`, botão com traço e lábio de 3px, valor atual em Fredoka ao lado do rótulo e as pontas explicadas em palavras ("Smaller file" / "Sharper image").
- Opção que muda algo irreversível ou visível (Strong desenha a página como imagem) avisa antes, numa nota (`brand-soft` com o ícone `info` em `brand` e o texto em `ink`, a regra de "Cor" do README do sistema), e o `<fieldset>` aponta para ela no `aria-describedby`. Antes: "avisa antes, em OliMessage `info`" (F13a, UX-11 A, F-10; DECISOES § 485). Contraste: o ícone `brand` sobre `brand-soft` 4,34:1 no claro e 4,81:1 no escuro (gráfico, pede 3:1); o texto `ink` sobre `brand-soft` 14,76:1 e 11,99:1.
- Uma escolha de sim ou não também é um trilho de duas opções, não a caixa nativa ("Primeira página: Numerar / Pular"; F13a, F-11). Abaixo de 480 px, um trilho de até três escolhas sem linha de ajuda fica numa linha só, em colunas iguais (56 px; F-14).
- Mais de 4 opções vira `<select>` no estilo do NumberField.

## F15: o trilho de três do Comprimir empilha abaixo de 480 px (DECISOES § 656 e § 675)

- **Antes:** o trilho do Comprimir imagem tinha duas escolhas com linha de ajuda ("Recomendada" e "Forte"), lado a lado em toda largura. **Depois:** ganhou a terceira, "Até um tamanho" (ajuda "limite em KB"), e abaixo de 480 px as três ficam uma embaixo da outra (`.fo-seg--stack`: cada escolha com 56 px, `radius-md` e a largura da coluna), nos três idiomas, porque a 320 px as três não cabem lado a lado no pt e no es. A partir de 480 px ficam lado a lado, com a mesma largura. É a forma do trilho de três com ajuda da ilha de PDF.
- **Só nesse trilho:** o do QR, o do Redimensionar, o do Cortar e os da ilha de PDF não mudam. O campo "Tamanho máximo" (um NumberField) aparece com a terceira escolha, fora do `fieldset` do trilho, para não ser lido como uma quarta escolha.
