# PageGrid

Arquivos · FileOrca design system v1.1 (F14, com o modo do Organizar PDF da F18). Estilo no site em `src/styles/components.css` (os blocos "F13a", "F14 · páginas de PDF à vista" e "F18 · Organizar PDF"); a marcação é a do site, em `src/tools/pdf/PageGrid.tsx` e `src/tools/pdf/PageCell.tsx`: a grade não tem `preview.html` próprio, e a vista que ela abre está no [`PageView`](../PageView/README.md).

As páginas de um PDF em miniatura, uma célula por página, com o visual do FileCard (traço, raio e a orelha na cor de PDF), dentro do painel das ferramentas de PDF (DECISOES § 152 e § 618 a § 622; F18, § 727 e § 744).

## Os quatro modos

| Modo | Ferramentas | O toque na página | O que mais a célula tem |
|---|---|---|---|
| `select` | Dividir (Escolher), Excluir, Assinar (Escolher), Extrair páginas | marca (`aria-pressed`) | o círculo do check antes do número; no Excluir, a lixeira no círculo e a imagem a 40 % |
| `order` | Reorganizar | nada (Espaço e Enter pegam a página para mover) | as setas "antes" e "depois" numa linha embaixo da folha; o arrastar com o mouse |
| `rotate` | Girar (página por página) | gira um quarto | o selo do giro no canto da folha |
| `organize` | Organizar PDF | marca (`aria-pressed`) | o check, as setas, o arrastar e, na página que sai, a lixeira no círculo e a imagem a 40 % |

Em todos: a folha tem a proporção da página como ela vai sair (§ 618); "Pequenas" e "Grandes" acima da grade (§ 619); a lupa de cada página abre a vista (§ 621); uma parada de Tab para a grade inteira (foco itinerante: setas, Home, End), e a lupa e as setas da página ativa no Tab também.

## O modo `organize` (Organizar PDF, F18)

### Anatomia, de cima para baixo

1. **"Tamanho das páginas"**: o segmento "Pequenas · Grandes", como nas outras.
2. **A barra da marcação** (a do `select`): a contagem, "{count} marcadas · o PDF novo fica com {left} páginas" (com as formas de 1: "1 marcada", "fica com 1 página"), e os três botões fantasma "Marcar todas", "Desmarcar todas" e "Inverter seleção".
3. **A barra de ações** (`.fo-pages__bar.fo-pages__acts`), logo acima da grade: três botões do Button, cada um com ícone e palavra, "Girar à direita" (`rotate`), "Girar à esquerda" (`rotate` espelhado) e "Tirar" (`trash`); quando todas as marcadas já saem, o "Tirar" vira "Devolver". Embaixo, a ajuda (`fo-field__help`), sempre à vista: "Marque páginas primeiro: estes botões giram as páginas marcadas ou as tiram." Abaixo de 480 px, os dois giros lado a lado e o "Tirar" na linha de baixo, na largura toda; o texto do botão quebra em duas linhas se precisar.
4. **A grade**: a célula do Reorganizar (a folha, a linha do número com a lupa à direita e, embaixo, a linha das duas setas) com o círculo do check antes do número.

### Estados da célula

- **Marcada:** o check no círculo `brand`, a borda de 3 px `brand` (o `select` de sempre). O nome termina em ", marcada".
- **Girada:** a folha com a proporção da página girada e a imagem girada nela (o `sheetRatio` com os giros, como no Girar). O nome diz ", girada {graus}°" (o `/Rotate` da página mais os giros da pessoa).
- **Sai:** o visual do Excluir: a imagem a 40 % e a lixeira (`on-brand`) num círculo `brand` de 28 px no canto de cima da folha, onde o Girar põe o selo dele, com o anel `ink`; o número, o check e a borda ficam como estavam. O nome termina em ", sai", marcada ou não. A página fica na grade até ser devolvida: tirar não precisa de Desfazer.
- **As três juntas:** marcada, girada e saindo; o nome diz as três, nesta ordem.

### A barra sem página marcada

Os três botões ficam com `aria-disabled="true"` e o desenho do Button desabilitado (`ink-muted` sobre `surface-sunken`), focáveis e no Tab, descritos pela ajuda (`aria-describedby`); o toque e o teclado não fazem nada e nada é dito. Nunca `disabled`: o foco não cai no `body` e a pessoa acha a ajuda.

### Teclado, toque e foco

Nenhuma tecla faz duas coisas:

| Gesto | O que faz |
|---|---|
| Toque, clique, Espaço ou Enter na página | marca ou desmarca (o botão nativo) |
| Shift+clique, Shift+Espaço | marca ou desmarca da âncora até a página, pela posição na grade (a ordem atual, não a do arquivo) |
| ←, →, ↑, ↓, Home, End | levam o foco a outra página; a ordem não muda |
| Tab na página ativa | a lupa, depois a seta "antes" e a seta "depois" |
| As setas da célula (toque, clique, Enter, Espaço) | movem a página um lugar; o foco segue a página |
| Arrastar com o mouse | move a página para o lugar onde ela cai |
| A lupa | abre a vista da página |

No Reorganizar (`order`), Espaço e Enter pegam a página para mover com as setas do teclado; no Organizar isso não existe, porque o Espaço marca.

### Falas

Pela região de status do painel, uma por gesto:

- Marcar todas, Desmarcar todas, Inverter seleção e o intervalo digitado: a contagem, "{count} marcadas · o PDF novo fica com {left} páginas";
- Shift: "Páginas {from} a {to} marcadas" (ou "desmarcadas"), com as páginas das duas pontas do trecho na ordem da grade;
- o toque simples: nada (o `aria-pressed` diz);
- girar uma página: "A página {n} agora está girada {graus}°."; girar várias: "{count} páginas giradas para a direita." (ou "para a esquerda.");
- tirar e devolver: o que sai, na frase do Excluir, "{count} de {total} saem · o PDF novo fica com {left} páginas";
- mover: "A página {n} foi para a posição {position}.".

### Erros

- Todas as páginas saem: o erro do Excluir, adaptado, "Um PDF precisa de pelo menos uma página: devolva uma.", sob a grade; a ação não roda.
- Nada mudou e a pessoa aperta a ação ("Save changes" em inglês): "Mova, gire ou tire uma página para salvar um PDF novo."

### Os alvos de 48 px

A célula de "Pequenas" do Organizar é a do Reorganizar com o check: a linha do número (o check de 24 px, o número e a lupa de 48 px à direita) e a linha das duas setas de 48 px embaixo, que já cabiam na célula mais estreita (118 px por dentro a 320 px). Nenhuma forma nova foi preciso. Medido no `tests/e2e/island-pdf-organize.spec.ts` na grade de 300 páginas, páginas 1, 10, 100 e 300, a 320, 360, 768 e 1280 px, em Pequenas e em Grandes: a página, a lupa e as duas setas com 48 × 48 px ou mais, sem se cobrir, sem cobrir a folha nem o check, dentro da célula; os botões da barra com 48 px ou mais; nenhuma rolagem para o lado.

### Anúncio

A grade, as duas barras e as células ficam dentro do painel: nada de anúncio dentro delas, e cada controle a `ad-clearance` (150 px) ou mais de todo anúncio (`.fo-pages__bar`, `.fo-page__moves` e a ajuda estão nos alvos do `clearance.spec.ts`).

### Contraste dos pares novos

| Par | Claro | Escuro |
|---|---|---|
| a lixeira (`on-brand`) no círculo (`brand`) | 5,09:1 | 7,02:1 |
| o círculo (`brand`) sobre a folha (`surface-sunken`) | 4,59:1 | 6,68:1 |
| o círculo (`brand`) sobre a página branca a 40 % | 4,77:1 | 1,76:1 (o anel `ink` faz a borda) |
| o anel do círculo (`ink`) sobre a página branca a 40 % | 16,23:1 | 4,39:1 |
| o anel do círculo (`ink`) sobre a folha (`surface-sunken`) | 15,60:1 | 16,65:1 |
| o texto dos botões da barra (`ink`) sobre `surface` | 17,28:1 | 15,22:1 |
| a ajuda da barra (`ink-muted`) sobre `bg` | 6,69:1 | 8,99:1 |
| o botão `aria-disabled` (`ink-muted` sobre `surface-sunken`) | 6,33:1 | 8,56:1 |

A página branca a 40 % é `#f5f8fc` no claro e `#6e7681` no escuro (o branco a 0,4 sobre a folha). Nenhum token novo.

## O que a grade nunca faz

Guardar a ordem, as marcas, os giros ou o tamanho escolhido fora da página aberta; pôr algo na URL, no histórico, no storage ou no GA4; mandar o arquivo para fora do aparelho; mostrar um anúncio dentro do painel.
