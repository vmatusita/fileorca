# NextStepChips

Ações · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Chips de "próximo passo" que aparecem logo abaixo do resultado e levam o arquivo, ou a pessoa, para a ferramenta seguinte. São o que gera a segunda pageview.

- De 2 a 4 chips, escolhidos pelo que a pessoa acabou de fazer (comprimiu? converter em PDF; simulou a hipoteca? quanto posso financiar).
- Cada chip tem o círculo na cor da categoria de destino (`fo-cat--*`), o verbo e a seta. Altura `tap-min`.
- São links (`<a>`), dentro de uma `<nav>` nomeada pelo rótulo à vista ("Next:", `aria-labelledby`). Hover: fundo `brand-soft` e a seta anda 2px.
- Nas ferramentas de imagem, ficam na faixa de baixo (`.fo-band`), logo abaixo do retângulo e antes do "Ajustar", a até 220px do Baixar a 360 e a 1280px; a faixa guarda a altura deles desde a primeira pintura, então o resultado não empurra a página (F13a, DECISOES § F13A-I-03; antes, "Ficam entre o Baixar e o primeiro AdSlot"). São parte do respiro de `ad-clearance`, nunca a única coisa entre o Baixar e o anúncio.
- No erro de um arquivo que outra ferramenta do site pega (um PNG no HEIC para JPG, D-17), a mesma linha, com o rótulo "For a PNG:", leva à ferramenta certa, no lugar das opções (F13a, DECISOES § F13A-I-06).
- Não use chip para filtro nem para tag: aqui chip sempre leva a outra ferramenta.
