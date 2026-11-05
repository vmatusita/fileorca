# ToolPage

Moldes · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O molde da página de ferramenta no celular (360px), antes e depois do arquivo. É a composição dos componentes, não um componente novo.

1. Header fino → Breadcrumb → H1 (`h1-mobile`) na largura toda e PrivacySeal; só a linha do selo guarda o espaço da Oli à direita (96px e 136px), com a altura de duas linhas no celular, para o H1 ficar fora do alcance dela (F13a, F4-F7 f-2, DECISOES § 463 e § 465; antes, "H1 (`h1-mobile`) e PrivacySeal, com espaço à direita para a Oli").
2. O retângulo (DropZone, WaterLevel, ResultCard, 356px e 340px, uma altura em todos os estados) com a Oli (88px) no canto de cima à direita, sobre a linha do selo. A base dele fica acima da dobra a 360×740. Embaixo, a faixa de altura fixa (196px e 120px) com as opções (F13a, DECISOES § 464 e § 466; antes, "DropZone com a Oli (88px) sentada na borda de cima, à direita do H1. … as opções vêm logo abaixo").
3. Depois: ResultCard no mesmo lugar, Baixar em bloco, "Start over" e "Before and after" em ghost; na faixa, os NextStepChips e as opções recolhidas num "Ajustar" (`details`), que refaz na hora (F13a, DECISOES § 466; antes, "ResultCard no mesmo lugar, Baixar em bloco, \"Start over\" em ghost, NextStepChips").
4. Só então, depois do "Como usar", o primeiro AdSlot, a `ad-clearance` (150px) dos chips, do Baixar, da faixa e do "Ajustar" (F12, DECISOES § 419; F13a, § 473).
5. Como usar, tabela de presets, Faq, ToolCards relacionadas, Footer.

No computador (≥1280px) a coluna da ferramenta vai até `tool-max` e a coluna lateral (`rail`) recebe o AdSlot 300×600, que não gruda e começa 150px (`ad-clearance`) abaixo do cabeçalho, porque o cabeçalho, com as bordas do rodapé, passa por cima dela (DECISOES § 409).
