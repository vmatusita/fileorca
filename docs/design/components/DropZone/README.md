# DropZone

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O painel-herói de toda ferramenta de arquivo: uma área grande, de traço tracejado, com um pouco de mar no fundo e a Oli sentada na borda. É aqui que a pessoa solta o arquivo.

## Anatomia

1. `.fo-drop` é um contêiner comum, sem `role` e sem `tabindex`: clicar em qualquer ponto dele abre o seletor (só no mouse e no toque). O alvo de teclado é o botão Escolher arquivos lá dentro, que abre o mesmo `<input type="file">` escondido. Não ponha `role="button"` na zona: ela tem um botão dentro, e controle dentro de controle reprova no axe (`nested-interactive`).
2. `.fo-drop__sea > .fo-water`: a água (`water`) a 30% de altura, e o botão na parte seca, acima dela (F13a, DECISOES § 464; antes, "a água (`water`) a 12% de altura"). É a mesma água que sobe no WaterLevel enquanto processa e que, no resultado, chegou ao topo: a metáfora não muda de lugar.
3. A Oli não mora na zona: é a `.fo-slot__oli`, filha do retângulo (`.fo-slot`), no canto de cima à direita, metade para fora da borda, em todos os estados do retângulo (`wave`, `gulp`, `swim`, `cheer`, `oops`, `buoy`), olhando para a fala. Ela é a Oli da página (não há outra ao lado do H1 nem dentro do ResultCard). 88px a `top: -78px` no celular, 112px a `top: -76px` a partir de 768px (F13a, DECISOES § 465; antes, "`.fo-drop__oli`: a Oli, empoleirada no canto de cima à direita, metade para fora da borda. … 88px no celular, 112px a partir de 768px").
4. O selo redondo em `brand-soft` com o ícone `file-drop` (um arquivo que entra na água; antes, `upload`: F13a, UX-16, DECISOES § 493), título em Fredoka, o botão `fo-btn--brand` (com `aria-describedby` apontando para a ajuda) e a ajuda com os formatos aceitos. No erro, o selo redondo sai (F13a, DECISOES § 468).

## Estados (`data-state`)

| Estado | O que muda |
|---|---|
| (repouso) | Traço tracejado `stroke`, Oli `wave`. Hover: traço `brand`. |
| `over` | Arquivo em cima: traço sólido `brand`, a água sobe para 60% com a onda andando (antes, 38%; F13a, DECISOES § 464), Oli `gulp`, o selo com o ícone `download`, título "Let go, Oli's ready" e a contagem ("3 images"), sobre a superfície da água. O botão some enquanto o arquivo está em cima e volta se a pessoa desistir. |
| `error` | Traço `danger` de 3px, Oli `oops`, sem o selo redondo: a frase com o ícone `alert` em `danger` (`.fo-drop__error-title`, `ink`), a razão que diz o caso (`.fo-drop__why`, `ink-muted`) e, logo depois dela, o Escolher outros arquivos, tudo no `role="alert"`. A razão diz o caso: não é imagem; o nome tem extensão de imagem e o conteúdo não é ("notes.png ends in .png, but it isn't an image inside. Save it again as JPG, PNG or WebP.", D-06); a ferramenta certa é outra ("notes.png is a PNG, not a HEIC photo. To get a JPG from it, use PNG to JPG.", D-17), e então o chip dela fica na faixa de baixo, no lugar das opções. Nunca só "Invalid file" (F13a, DECISOES § 468 e § 469; antes, "Traço `danger` de 3px, Oli `oops`, o que deu errado com o nome do arquivo e o que fazer. Um botão para tentar outro."). |
| processando | A DropZone vira o WaterLevel no mesmo lugar e no mesmo tamanho. |
| pronto | O ResultCard ocupa o mesmo lugar. A página não pula. |

## Regras

- Aceita soltar, clicar, colar (Ctrl+V) e, no celular, só o botão. No celular o título some (o botão é o título) e a linha do Ctrl+V também.
- O retângulo (`.fo-slot`) tem a mesma altura em todos os estados, 356px no celular e 340px a partir de 768px, e nunca muda sem um gesto da pessoa; a base dele fica acima da dobra a 360×740 em toda página de ferramenta e de preset, com e sem a fonte (F13a, DECISOES § 464; antes, "Altura mínima de 300px (340px no computador) e o painel inteiro acima da dobra a 360×740"). No 3º uso, quando a linha do café vai aparecer, ele guarda a altura dela desde antes do resultado, e a guarda é água (F13a, DECISOES § 470).
- A ajuda diz os formatos aceitos. Lote não tem limite (é promessa do site), então a ajuda não inventa número; se um formato tiver limite real, a ajuda diz qual. Arquivo que não serve é recusado com a fala da Oli, nunca em silêncio.
- Nada de borda em gradiente animado: o traço tracejado e a água são a assinatura.
- O anúncio mais próximo fica a `ad-clearance` (150px) da borda do painel e da Oli.
