# NextStepChips

Ações · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

Chips de "próximo passo" que aparecem logo abaixo do resultado e levam o arquivo, ou a pessoa, para a ferramenta seguinte. São o que gera a segunda pageview.

- De 2 a 4 chips, escolhidos pelo que a pessoa acabou de fazer (comprimiu? converter em PDF; simulou a hipoteca? quanto posso financiar).
- Cada chip tem o círculo na cor da categoria de destino (`fo-cat--*`), o verbo e a seta. Altura `tap-min`.
- São links (`<a>`), dentro de `<nav aria-label="Next step">`. Hover: fundo `brand-soft` e a seta anda 2px.
- Ficam entre o Baixar e o primeiro AdSlot: são parte do respiro de `ad-clearance`, nunca a única coisa entre os dois.
- Não use chip para filtro nem para tag: aqui chip sempre leva a outra ferramenta.
