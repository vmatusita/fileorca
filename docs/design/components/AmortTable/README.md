# AmortTable

Calculadoras · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O cronograma completo, recolhido por ano, sem paginação.

- Cada ano é uma linha-botão (`aria-expanded`, alvo de `tap-min`) com o saldo no fim do ano; abrir mostra os 12 meses. O primeiro ano vem aberto.
- Figtree `table`, algarismos tabulares, números à direita, linhas alternadas em `surface-sunken`, cabeçalho fixo ao rolar.
- O cronograma só é montado quando a pessoa abre a seção: o recálculo por tecla não paga por ele.
- Nunca há anúncio dentro da tabela, nem entre anos.
- Exporta igual ao que mostra (ExportBar: PDF e CSV com BOM e ponto e vírgula em pt e es).
