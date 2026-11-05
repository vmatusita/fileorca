# AmortTable

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O cronograma completo, recolhido por ano, sem paginação.

- Cada ano é uma linha-botão (`aria-expanded`, alvo de `tap-min`) com o saldo no fim do ano; abrir mostra os 12 meses. O primeiro ano vem aberto.
- Figtree `table`, algarismos tabulares, números à direita, linhas alternadas em `surface-sunken`, cabeçalho fixo ao rolar.
- O cronograma só é montado quando a pessoa abre a seção: o recálculo por tecla não paga por ele.
- Nunca há anúncio dentro da tabela, nem entre anos.
- Exporta igual ao que mostra (ExportBar: PDF e CSV com BOM e ponto e vírgula em pt e es).

## Mudanças de regra (F13b, DECISOES § C-5 e § C-7; D-43, F4 ACE-8, ACE-9 e F7 obs 2)

- **O lugar.** Antes: o cronograma vinha depois do 1º anúncio, numa ilha própria, com o botão "Show the full schedule" que mudava para "Hide the schedule". Depois: o cronograma é parte da ilha da calculadora, antes dos chips, como um bloco que dobra (o vocabulário do Faq), fechado ao abrir a página, com o nome fixo (o título da seção) e o círculo do chevron que gira; só o `aria-expanded` muda. O 1º anúncio continua depois dos chips.
- **O cabeçalho de linha.** Antes: toda célula de dados era `<td>`. Depois: a primeira célula de cada linha de dados é `<th scope="row">`, desenhada como a célula que substitui (sem o `sticky` do cabeçalho da tabela, a fonte e a cor da tabela, a zebra da linha).
- **O nome da moldura.** Antes: a região tinha o nome da legenda da tabela, o mesmo da `<caption>`. Depois: a região tem o nome do título da seção (`aria-labelledby`), e a legenda escondida diz o resto.
- **As datas de uma tabela estreita** (a Ovulation): na tela, a data curta ("Oct 26 to 31, 2026"), com o mês e o dia presos por um espaço que não quebra, em colunas fixas (30, 35 e 35 %); o CSV e o PDF ficam com a data longa.
