# DropZone

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O painel-herói de toda ferramenta de arquivo: uma área grande, de traço tracejado, com um pouco de mar no fundo e a Oli sentada na borda. É aqui que a pessoa solta o arquivo.

## Anatomia

1. `.fo-drop` é um contêiner comum, sem `role` e sem `tabindex`: clicar em qualquer ponto dele abre o seletor (só no mouse e no toque). O alvo de teclado é o botão Escolher arquivos lá dentro, que abre o mesmo `<input type="file">` escondido. Não ponha `role="button"` na zona: ela tem um botão dentro, e controle dentro de controle reprova no axe (`nested-interactive`).
2. `.fo-drop__sea > .fo-water`: a água (`water`) a 12% de altura. É a mesma água que sobe no WaterLevel enquanto processa: a metáfora não muda de lugar.
3. `.fo-drop__oli`: a Oli, empoleirada no canto de cima à direita, metade para fora da borda. Ela é a Oli da página (não há outra ao lado do H1). 88px no celular, 112px a partir de 768px.
4. Ícone `upload` em `brand-soft`, título em Fredoka, o botão `fo-btn--brand` (com `aria-describedby` apontando para a ajuda) e a ajuda com os formatos aceitos.

## Estados (`data-state`)

| Estado | O que muda |
|---|---|
| (repouso) | Traço tracejado `stroke`, Oli `wave`. Hover: traço `brand`. |
| `over` | Arquivo em cima: traço sólido `brand`, a água sobe para 38% com a onda andando, Oli `gulp`, título "Let go, Oli's ready" e a contagem ("3 images"). O botão some enquanto o arquivo está em cima e volta se a pessoa desistir. |
| `error` | Traço `danger` de 3px, Oli `oops`, o que deu errado com o nome do arquivo e o que fazer. Um botão para tentar outro. Nunca só "Invalid file". |
| processando | A DropZone vira o WaterLevel no mesmo lugar e no mesmo tamanho. |
| pronto | O ResultCard ocupa o mesmo lugar. A página não pula. |

## Regras

- Aceita soltar, clicar, colar (Ctrl+V) e, no celular, só o botão. No celular o título some (o botão é o título) e a linha do Ctrl+V também.
- Altura mínima de 300px (340px no computador) e o painel inteiro acima da dobra a 360×740.
- A ajuda diz os formatos aceitos. Lote não tem limite (é promessa do site), então a ajuda não inventa número; se um formato tiver limite real, a ajuda diz qual. Arquivo que não serve é recusado com a fala da Oli, nunca em silêncio.
- Nada de borda em gradiente animado: o traço tracejado e a água são a assinatura.
- O anúncio mais próximo fica a `ad-clearance` (150px) da borda do painel e da Oli.
