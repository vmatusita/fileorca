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
