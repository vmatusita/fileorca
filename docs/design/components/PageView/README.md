# PageView

Arquivos · FileOrca design system v1.1 (F14). Estilo no site em `src/styles/components.css` (o bloco "F14 · a vista da página"); marcação de referência em [`preview.html`](preview.html), com o CSS da vista no próprio arquivo (abra com `?theme=dark` para o tema escuro).

Uma página do PDF em tamanho grande, dentro da própria ferramenta, para a pessoa reconhecer a página antes de excluir, dividir, girar, assinar ou reorganizar, e conferir o PDF novo antes de baixar (PLANO-UX-QV.md, seção A; DECISOES § 624 a § 626). No site é o `src/tools/pdf/PageView.tsx`, no mesmo arquivo JS da ilha de PDF.

## Onde abre

- **Pela lupa de uma página da grade** (as cinco ferramentas da grade: Excluir, Dividir no modo Escolher, Girar página por página, Assinar no modo Escolher e Reorganizar; e, desde a F18, o Organizar PDF): no lugar da grade, que some até a pessoa voltar. No Girar depois do resultado, dentro do "Ajustar" aberto. A grade tem o README dela em [`PageGrid`](../PageGrid/README.md).
- **Pelo "Ver o PDF novo"** do resultado (um PDF só e sem senha) e **pelo "Ver páginas de {name}"** de uma linha do Juntar: como o primeiro item da faixa de baixo do painel.
- **Nunca** é diálogo, popover, camada por cima da página, tela cheia nem `position: fixed` ou `sticky`: a vista empurra o resto da página para baixo, por um gesto da pessoa, e nada do site cobre a âncora do AdSense. Nada muda na URL nem no histórico.

## Anatomia, de cima para baixo

1. **Barra de cima:** o título "Página {n} de {total}" (no Reorganizar, "Página {n} · posição {p} de {total}", com n o número no arquivo), um `h2` com `tabindex="-1"` (§ 639: depois do `h1` da página, um `h3` reprova o `heading-order` do axe); o botão "Ampliar"/"Ajustar" (o rótulo alterna); e "Voltar às páginas", fantasma, com o `chevron-right` espelhado e a palavra. Abaixo de 480 px, o título numa linha e os dois botões embaixo.
2. **A moldura** com a proporção da página como ela vai sair (a caixa, o `/Rotate` e, no Girar, os giros da pessoa; limitada entre meia e duas vezes mais larga que alta, como a folha da célula, § 618), e a página inteira, centrada, com um fio `hairline` em volta. **Ajustar** (o padrão): a largura da coluna, limitada pela altura `100dvh − 260px` (as duas barras cabem na tela), nunca menos de 10rem. **Ampliar:** a moldura na largura da coluna, até `75dvh` de altura, rolando nos dois sentidos (`overflow: auto`, `overscroll-behavior: contain`), com a página no dobro da coluna, até 1.600 px.
3. **Barra de baixo:** "Anterior" (chevron espelhado e palavra), a ação da ferramenta e "Próxima" (palavra e chevron). Abaixo de 480 px, em duas linhas: a ação na largura toda e, embaixo, Anterior e Próxima lado a lado. Sem ação (Reorganizar, resultado, Juntar), só Anterior e Próxima.

## A ação de cada ferramenta

| Ferramenta | Ação | Estado |
|---|---|---|
| Excluir | "Tirar esta página" | `aria-pressed`; apertado: a página sai |
| Dividir (Escolher) | "Marcar esta página" | `aria-pressed` |
| Assinar (Escolher) | "Assinar esta página" | `aria-pressed` |
| Girar (página por página) | "Girar 90°" | um giro por toque, sem `aria-pressed` |
| Reorganizar | nenhuma (mover continua na grade) | o título diz a posição |
| Organizar PDF (F18) | duas: "Girar 90°" e "Tirar esta página" | "Girar 90°" sem `aria-pressed`, um giro por toque; "Tirar esta página" com `aria-pressed` (apertado: a página sai); o título diz a posição |
| Resultado, Juntar | nenhuma: só ver | — |

A ação usa o mesmo caminho da célula da grade: a grade, a contagem e a operação mudam juntas, e a página marcada na vista vira a âncora do Shift+clique. Apertada, a ação tem o fundo `brand-soft` e o traço `brand`. No Organizar, as duas ações vão pelo caminho da barra de ações da grade, para a página da vista: o giro diz "A página {n} agora está girada {graus}°." e o tirar diz o que sai, "{count} de {total} saem · o PDF novo fica com {left} páginas", uma fala por toque; Anterior e Próxima seguem a ordem atual da grade.

**A barra de baixo com duas ações (Organizar):** de 768 px para cima, Anterior, "Girar 90°", "Tirar esta página" e Próxima numa linha só (as duas ações no meio); de 480 a 767 px as quatro não cabem numa linha (583 px em inglês, 620 px em espanhol, com a coluna de 448 px a 480 px), e as duas ações vão lado a lado na primeira linha, com Anterior e Próxima embaixo, lado a lado; abaixo de 480 px, cada ação ocupa uma linha inteira e Anterior e Próxima vão embaixo, lado a lado. Todo botão com 48 px ou mais e nada passa da coluna, de 320 a 1280 px (`tests/e2e/island-pdf-organize.spec.ts`).

## Estados

- **A imagem chegando:** a moldura já tem a proporção da página; a miniatura da grade fica nela até a imagem grande chegar, e a troca não mexe em nada (nenhum layout-shift sem gesto).
- **Nas pontas:** na primeira página, "Anterior" fica com `aria-disabled="true"` (o desenho do Button desabilitado), não faz nada e continua focável; na última, "Próxima".
- **Girada (Girar):** a imagem grande mostra o giro acumulado; com um giro ímpar, a moldura troca de proporção.

## Teclado, toque e foco

- Com o foco dentro da vista: ← e → trocam a página, Home e End vão à primeira e à última, Esc volta às páginas. Com Alt, Ctrl ou Meta, a tecla é do navegador. Em "Ampliar", com o foco na moldura que rola (`tabindex="0"`, com o nome "Página {n} em tamanho grande"), as setas rolam a moldura (§ 642).
- Em "Ajustar", o arrasto lateral de 48 px ou mais na página, com menos de 30° de inclinação, troca a página, só com a pinça do navegador sem zoom (`visualViewport.scale` entre 0,99 e 1,01); a moldura tem `touch-action: pan-y pinch-zoom`. Em "Ampliar", o dedo rola a moldura. Nenhum gesto próprio de pinça.
- Ao abrir, a vista entra na tela e o foco vai ao título, sem rolagem animada. Ao voltar, o foco vai ao botão que abriu a vista: a lupa da página que estava à vista (a célula dela vira a ativa do foco móvel e entra na tela), o "Ver o PDF novo" ou o "Ver páginas" daquela linha.

## Falas

Pela região de status do painel (`p.fo-sr[role="status"]`), uma por gesto; a vista não tem região própria:

- trocar de página: "Página {n} de {total}", com o estado quando houver (", sai", ", marcada", ", girada {graus}°"); no Organizar, "Página {n} · posição {p} de {total}" e os três estados na ordem do nome da célula (", girada {graus}°", ", marcada", ", sai");
- marcar na vista: a contagem, a mesma frase de Marcar todas (no Excluir, "{count} de {total} saem · o PDF novo fica com {left} páginas");
- girar na vista: "A página {n} agora está girada {graus}°.", sem o "Prontinho!" da execução que o giro dispara.

## A imagem e a memória

As imagens vêm do cache das miniaturas do arquivo, na largura que a moldura mostra vezes o DPR, arredondada para cima em 60 px, até 1.600 px em "Ajustar" e 2.400 em "Ampliar". No máximo três imagens grandes ficam guardadas (a da tela, a anterior e a próxima), e as vizinhas só são pedidas depois que a da tela chega. A vista do resultado e a do Juntar têm um cache próprio e soltam o documento ao voltar, no Começar de novo, a cada execução nova e quando a linha sai da lista.

## Larguras medidas (Excluir, uma página Carta em pé)

| Janela | Modo | Barra de cima | Moldura | Página | Barra de baixo |
|---|---|---|---|---|---|
| 360 × 740 | Ajustar | 328 × 88 | 328 × 424 | 328 × 424 | 328 × 120 |
| 360 × 740 | Ampliar | 328 × 88 | 328 × 555, rola | 656 × 849 | 328 × 120 |
| 1280 × 800 | Ajustar | 758 × 56 | 417 × 540 | 417 × 540 | 758 × 56 |
| 1280 × 800 | Ampliar | 758 × 56 | 758 × 600, rola | 1.516 × 1.962 | 758 × 56 |

## Anúncio

A vista fica dentro do painel: nenhum anúncio dentro dela, e todo controle dela (os botões, a moldura e a parte vista da página), a lupa, o "Ver o PDF novo", o "Ver páginas" e o segmento de tamanho da grade ficam a `ad-clearance` (150 px) ou mais de todo anúncio, a 360 e a 1280 px, nos dois modos (`tests/e2e/ads.spec.ts`; § 634). Com a vista aberta, nada do site fica por cima da âncora.

## O que a vista nunca faz

Mudar o que o toque na página da grade faz (ele continua marcando, girando ou pegando para mover); abrir como camada, diálogo ou tela cheia; guardar o modo ou a página vista; pôr algo na URL, no histórico, no storage ou no GA4; mandar o arquivo para fora do aparelho.

## Contraste dos pares novos

| Par | Claro | Escuro |
|---|---|---|
| texto e ícones (`ink`) sobre os botões (`surface`) | 17,28:1 | 15,22:1 |
| o título (`ink`) sobre a faixa (`bg`) | 16,50:1 | 17,48:1 |
| traço dos botões (`stroke`) sobre `surface` | 17,28:1 | 4,07:1 |
| a ação apertada: `ink` sobre `brand-soft` | 14,76:1 | 11,99:1 |
| a ação apertada: o traço `brand` sobre `bg` | 4,85:1 | 7,01:1 |
| a lupa da grade (`ink` sobre `surface`) | 17,28:1 | 15,22:1 |
| no Excluir, a lixeira (`on-brand`) no círculo (`brand`) | 5,08:1 | 7,01:1 |
