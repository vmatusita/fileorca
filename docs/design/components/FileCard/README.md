# FileCard

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Uma linha por arquivo no lote: miniatura, nome, tamanho antes → depois e a ação daquele arquivo. Cada card é um "papel" com o canto dobrado na cor da categoria.

- Classe `fo-dogear` + `fo-cat--image` (ou `--pdf`) pinta a dobra. `--fo-ground` precisa ser a cor do chão onde o card está (padrão `bg`).
- Nome em `body-strong`, cortado com reticências; o nome inteiro vai no `title` e no `aria-label` das ações.
- Meta: "2.4 MB → 780 KB" em `ink-muted` e o ganho em `success` com ícone `check`. Sem ganho, diga "Already optimized" e devolva o original.
- A seta é o ícone `arrow-right` em `fo-icon--inline` (1em), com "to" / "para" / "a" em `fo-sr` para o leitor de tela: o caractere → não existe no subconjunto latino da Figtree nem da Fredoka e cairia na fonte do sistema.
- Processando: `fo-bar` com a porcentagem daquele arquivo e o botão de cancelar.
- Erro: `data-state="error"` → fundo `danger-soft`, traço `danger`, ícone `alert` e a razão em uma frase. O resto do lote continua.
- O lote inteiro baixa pelo Baixar do ResultCard ("Download all · ZIP"). O botão de cada linha é secundário.
- Lista em `.fo-filelist` (gap de 8px). Com mais de 6 arquivos, mostre 6 e "Show 14 more".

## F13a: o arquivo sem miniatura e a linha do Juntar (UX-11 A e UX-04 A; DECISOES § 485 e § 479)

- **Sem miniatura** (um PDF): antes, "um quadrado vazio em `surface-sunken`"; depois, o ícone da categoria (`pdf`) em `ink` sobre `--fo-cat-soft` (`coral-soft`), passado pela prop `icon` (a marcação do ícone, lida no build: o pedaço das ferramentas de imagem não cresce). O erro continua como era: o ícone `file` em `danger` sobre `danger-soft`. Contraste: `ink` sobre `coral-soft` 14,06:1 no claro e 12,77:1 no escuro.
- **O chão:** num painel em `surface` (o cartão de pronto, a lista do Juntar), `--fo-ground: var(--surface)`, para a dobra recortar com a cor do painel (F-7). Antes, a dobra recortava sempre com `bg`.
- **No Juntar** a miniatura dá lugar ao número da posição na ordem, num círculo `deep` de 32 px (`.fo-merge__n`, o desenho do ScenarioCompare, `aria-hidden`: a lista `<ol>` já diz "1 de 2"), pela prop `order`. O nome vai até duas linhas antes das reticências (D-8); a linha recusada fica com uma, porque a razão repete o nome. Contraste: `on-deep` sobre `deep` 13,16:1.
- **A remoção no Juntar** fica fora do card: as setas que andam e a lixeira (`fo-btn--icon` com traço e lábio, "Remove form.pdf") vão ao lado dele, na linha (`.fo-merge__row`). O card de erro mantém a lixeira dele.

## Contraste dos pares novos (F13a)

Os pares novos das peças de PDF e da linha do Juntar (F13a, DECISOES § 479 e § 485). Nenhum token novo.

| Par | Claro | Escuro |
| --- | ---: | ---: |
| `ink` (o ícone `pdf` sem miniatura) sobre `coral-soft` | 14,06:1 | 12,77:1 |
| `on-deep` (o número da ordem) sobre `deep` | 13,16:1 | 13,16:1 |
| `stroke` (o círculo vazio, o tracejado do "Add more PDFs" e da linha do Desfazer) sobre `surface` | 17,28:1 | 4,07:1 |
| `on-brand` (o check da página escolhida na grade) sobre `brand` | 5,09:1 | 7,02:1 |
| `brand-edge` (a borda do círculo do check da página escolhida; antes este README dizia "a borda da página escolhida", F13a, revisão a-3) sobre `surface` | 17,28:1 | 6,11:1 |
| `brand` (o preenchimento do círculo marcado e a borda da página escolhida na grade; UX11-2) sobre `surface` | 5,09:1 | 6,11:1 |
| `focus` do tema claro (o anel e o tracejado `brand` da caixa da assinatura, que fica no papel claro, `data-theme="light"`) sobre `surface` do claro, e sobre o `surface` do escuro quando o anel sai da moldura (UX11-7) | 5,09:1 | 3,13:1 (passa 3:1, o mínimo de um contorno, WCAG 1.4.11) |
