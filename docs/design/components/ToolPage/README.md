# ToolPage

Moldes · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O molde da página de ferramenta no celular (360px), antes e depois do arquivo. É a composição dos componentes, não um componente novo.

1. Header fino → Breadcrumb → H1 (`h1-mobile`) na largura toda e PrivacySeal; só a linha do selo guarda o espaço da Oli à direita (96px e 136px), com a altura de duas linhas no celular, para o H1 ficar fora do alcance dela (F13a, F4-F7 f-2, DECISOES § 463 e § 465; antes, "H1 (`h1-mobile`) e PrivacySeal, com espaço à direita para a Oli").
2. O retângulo (DropZone, WaterLevel, ResultCard, 356px e 340px, uma altura em todos os estados) com a Oli (88px) no canto de cima à direita, sobre a linha do selo. A base dele fica acima da dobra a 360×740. Embaixo, a faixa de altura fixa (196px e 120px de mínimo; a altura medida no comprimir em repouso é de 220px no en e 248px no pt e no es a 360px, e 144px a 1280px, porque os chips quebram em linhas e a linha de privacidade do chip que leva entra com eles, § 466 e § 500; F13a, revisão a-4) com as opções (F13a, DECISOES § 464 e § 466; antes, "DropZone com a Oli (88px) sentada na borda de cima, à direita do H1. … as opções vêm logo abaixo").
3. Depois: ResultCard no mesmo lugar, Baixar em bloco, "Start over" e "Before and after" em ghost; na faixa, os NextStepChips e as opções recolhidas num "Ajustar" (`details`), que refaz na hora (F13a, DECISOES § 466; antes, "ResultCard no mesmo lugar, Baixar em bloco, \"Start over\" em ghost, NextStepChips").
4. Só então, depois do "Como usar", o primeiro AdSlot, a `ad-clearance` (150px) dos chips, do Baixar, da faixa e do "Ajustar" (F12, DECISOES § 419; F13a, § 473).
5. Como usar, tabela de presets, Faq, ToolCards relacionadas, Footer.

No computador (≥1280px) a coluna da ferramenta vai até `tool-max` e a coluna lateral (`rail`) recebe o AdSlot 300×600, que não gruda e começa 150px (`ad-clearance`) abaixo do cabeçalho, porque o cabeçalho, com as bordas do rodapé, passa por cima dela (DECISOES § 409).

## A página de guia de arquivo (F13b, UX-13 A)

Os 10 guias de arquivo, nos três idiomas, usam a ilha deste molde com texto em volta (`src/views/FileGuideView.astro`). A F13b (DECISOES § 376 e § G-1 a § G-10 da frente G) mudou a ordem e quatro peças. Os guias de dinheiro não mudam de molde.

1. **A ordem.** Antes: "Breadcrumb → H1, a pergunta e a linha Reviewed (as duas datas longas e o que mudou) → a introdução → o H2 e o parágrafo da ferramenta → a ilha → o link "Open the … tool" → o texto → What we measured → fontes → relacionadas". Agora: Breadcrumb → H1 e a pergunta → a assinatura → a ficha "What we measured" → o H2 da ferramenta → a ilha → o parágrafo da ferramenta (`fo-guide__toolintro`, `ink-muted` 15/22) → a introdução → o texto, com o link da página da ferramenta numa frase da parte que fala dela → as tabelas ("Photo by photo"), a nota e o histórico → fontes → relacionadas. A 360 × 740 o topo do painel fica acima de 740 px nos 30 guias, e a 1280 × 800 o Escolher termina acima de 800 px.
2. **A assinatura.** Antes: "Reviewed by {nome} on {data longa}. First published {data longa}. {o que mudou}" (de 80 a 120 px a 360). Agora uma linha `small` (14/20) em `ink-muted`, na Figtree Steady (a face da primeira pintura, que não troca de linha quando a Figtree chega): "Reviewed by Victor Yuki Matusita · Nov 2, 2026", com a data curta numa `time` que não quebra (20 px a 360). A primeira publicação e o que mudou vão para o histórico, a última linha da seção das medidas, com as datas médias ("Primeira versão deste guia, publicada em 3 de nov. de 2026 com as medidas de 2 de nov. de 2026").
3. **A ficha `fo-sheet`** (o `g-facts` da especificação). Um papel com a dobra (`fo-dogear`) na cor do hub do guia (turquesa no de imagem, coral no de PDF), fundo `surface`, traço `stroke-2` em `stroke`, `radius-lg`, `space-4` de padding no celular e `space-5`/`space-6` a partir de 768. O título "What we measured" em `caption` (`ink-muted`); dois números em `number-md` (`ink`) numa `dl` em subgrade, com o rótulo em `small` acima e, embaixo, o antes e o depois com o ícone `arrow-right` (e "to" / "para" / "a" escondido) ou uma linha simples; a amostra e o link para a tabela (`brand`, sublinhado, um link de texto: a exceção dos 48 px da WCAG 2.5.8). Entre as linhas, 8 px no celular (a especificação dizia 12; § G-8) e 12 a partir de 768. Nenhuma Oli. Os números saem do `data/guides-measured.json` no build.
4. **A tabela.** Sem a coluna que tem o mesmo valor em todas as linhas (uma frase da nota diz o valor); a primeira coluna que se repete vira cabeçalho do grupo (`th scope="rowgroup"`, um `tbody` por valor, na ordem em que aparece) e a célula que separa as linhas vira o cabeçalho da linha (`th scope="row"`, no peso 500 das outras células). A moldura (`fo-guide__frame`) é a região com o nome do título da seção, nunca o da tabela. A pista: na borda onde ainda há coluna, o traço tracejado da DropZone (`stroke-2` em `stroke`, 8 px de traço e 6 de vão) sobre uma faixa de 12 px de `surface-sunken`, só com gradientes de tokens e paradas duras, que somem quando o lado está todo à vista (some quando a tabela cabe); abaixo de 768 px, a linha "Scroll sideways to see the {n} columns" (`ink-muted`, com a seta em `ink`), presa à esquerda da moldura enquanto a tabela rola, e escondida onde a tabela cabe nos navegadores com `scroll-state` (o WebKit a mostra sempre abaixo de 768, como a especificação).
5. **Os anúncios.** A ficha e a moldura da tabela entram nos alvos dos 150 px (`ads.spec.ts` e o `MAP_TARGETS`). Nada acima da ferramenta, nada dentro dela e nada colado na tabela, como antes.

### Contraste dos pares novos (F13b)

Calculado pelo `scripts/lib/contrast.ts` sobre o `tokens.json`. Nenhum token novo.

| Par | Onde | Claro | Escuro |
| --- | --- | ---: | ---: |
| `ink-muted` sobre `surface` (ux13-ficha-rotulo) | título, rótulos, amostra e a seta da ficha | 7,00:1 | 7,82:1 |
| `ink` sobre `surface` (ux13-ficha-numero) | os números e o antes e depois da ficha | 17,28:1 | 15,21:1 |
| `brand` sobre `surface` (ux13-ficha-link) | o link da ficha para a tabela | 5,08:1 | 6,10:1 |
| `ink-muted` sobre `bg` (ux13-assinatura) | a assinatura, o parágrafo da ferramenta, a pista, a nota e o histórico | 6,69:1 | 8,99:1 |
| `ink-muted` sobre `surface-sunken` | a pista sobre a faixa da borda, com a tabela rolada | 6,32:1 | 8,56:1 |
| `ink` sobre `bg` (ux13-pista-icone) | a seta da pista | 16,50:1 | 17,47:1 |
| `stroke` sobre `bg` (ux13-borda-tabela, componente) | o traço tracejado da borda | 16,50:1 | 4,67:1 |
| `stroke` sobre `surface-sunken` (ux13-borda-faixa, componente) | o traço sobre a faixa da borda | 15,60:1 | 4,44:1 |
| `ink` sobre `surface-sunken` (ux13-celula-faixa) | o texto da célula que passa sobre a faixa | 15,60:1 | 16,64:1 |
| `focus` sobre `bg` (ux13-foco-tabela, componente) | o anel de foco da moldura | 4,85:1 | 7,01:1 |

## Contraste dos pares novos (F13a)

Os pares novos da faixa de baixo (F13a, DECISOES § 466). Nenhum token novo.

| Par | Claro | Escuro |
| --- | ---: | ---: |
| `ink-muted` (o valor atual no "Ajustar", `.fo-adjust__now`) sobre `surface` | 7,01:1 | 7,83:1 |
| `stroke` (a borda do "Ajustar", 1.4.11) sobre `surface` | 17,28:1 | 4,07:1 |
