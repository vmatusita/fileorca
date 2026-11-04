# ToolPage

Moldes · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O molde da página de ferramenta no celular (360px), antes e depois do arquivo. É a composição dos componentes, não um componente novo.

1. Header fino → Breadcrumb → H1 (`h1-mobile`) e PrivacySeal, com espaço à direita para a Oli.
2. DropZone com a Oli (88px) sentada na borda de cima, à direita do H1. O painel inteiro e o botão ficam acima da dobra a 360×740; as opções vêm logo abaixo.
3. Depois: ResultCard no mesmo lugar, Baixar em bloco, "Start over" em ghost, NextStepChips.
4. Só então o primeiro AdSlot, a `ad-clearance` (150px) dos chips e do Baixar.
5. Como usar, tabela de presets, Faq, ToolCards relacionadas, Footer.

No computador (≥1280px) a coluna da ferramenta vai até `tool-max` e a coluna lateral (`rail`) recebe o AdSlot 300×600, que não gruda e começa 150px (`ad-clearance`) abaixo do cabeçalho, porque o cabeçalho, com as bordas do rodapé, passa por cima dela (DECISOES § 409).
