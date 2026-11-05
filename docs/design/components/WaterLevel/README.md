# WaterLevel

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O progresso da FileOrca é água subindo: a mesma água do fundo da DropZone enche o painel até a porcentagem, e a Oli nada no canto de cima à direita do retângulo (`.fo-slot__oli`, `swim`), onde ela está em todos os estados; a água sobe até ela (F13a, DECISOES § 465; antes, "e a Oli nada na superfície").

- Ocupa o lugar exato da DropZone, com o mesmo tamanho: a página não pula.
- `role="progressbar"` com nome (`aria-label`, o que está acontecendo: "Compressing images"), `aria-valuenow` e um `aria-valuetext` que diz a contagem ("48%, 5 of 12 images"). Sem o nome, o axe reprova (`aria-progressbar-name`). O texto visível repete a porcentagem (Fredoka `number-lg`), a fala ("Oli is on it…") e a contagem.
- A altura da água é `--level` igual à porcentagem. A onda anda (`fo-water--moving`, `dur-wave`); com movimento reduzido, a água sobe sem onda.
- Só aparece se o trabalho passar de 400ms. Antes disso, nada pisca na tela.
- Nunca há anúncio sobre ou ao lado do WaterLevel: tela de espera com anúncio derruba a conta.
- A mesma água (`.fo-water`) sobe da DropZone para o topo da home, no nível 100%, como o chão da Oli (F13b, UX-03 B; DECISOES § 567): ali ela não é progresso, então não leva a `fo-water--moving` e fica parada.
- `fo-bar` é a versão compacta, dentro de cada FileCard do lote, em `brand` sobre `surface-sunken`. Com `role="progressbar"`, leva o nome do arquivo no `aria-label`.
