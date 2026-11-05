# ResultCard

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O momento em que a Oli devolve o arquivo: o mar que subiu (F13a, UX-04 A). Uma faixa de água (`water`, 20px no celular e 24px a partir de 768px) com a onda na borda de cima e o `deep` embaixo (`.fo-result__sea`), a Oli comemorando no canto do retângulo, a placa boiando na superfície, a linha "2.6 MB → 717 KB" e o Baixar amarelo. Ocupa o lugar da DropZone, com a mesma altura.

## Anatomia

1. A fala em `oli` ("Done! Your image is 68% lighter.", `.fo-result__says`). A Oli `cheer` (salto de `dur-cheer` uma vez) fica no canto de cima à direita do retângulo, fora do card, segurando a placa (F13a, DECISOES § 465; antes, "Oli `cheer` (96px, salto de `dur-cheer` uma vez) e a fala").
2. Placa (`fo-placard`): `number-lg` "−68%" e "lighter", girada −4°, entra com `ease-spring`; boia à direita na superfície, metade sobre a faixa de água, em todas as larguras (antes, só a partir de 768px), e é `aria-hidden`, porque repete o número da fala (F13a, DECISOES § 464).
3. A linha dos números em `<dl class="fo-numbers">`: o antes riscado (`on-deep-muted`), o ícone `arrow-right` com um "to" escondido (a fonte não tem a seta) e o depois, no formato do idioma. Sem placa (a conversão, o redimensionar), a mudança vem com o sinal, "+66%" quando o arquivo cresceu (F10 p-13). As dimensões vão para as notas, a partir de 768px (F13a, DECISOES § 464 e § 472; antes, "Estatísticas em `<dl>`: Before (riscado, `on-deep-muted`), After, e um dado útil (dimensões, páginas)").
4. Ações: o Baixar `fo-btn--download fo-btn--lg` com o tamanho e, numa linha embaixo (`.fo-result__more`), "Start over" e "Before and after" em ghost de 48px (15px de texto e 6px de lado no celular). O "Before and after" tem `aria-expanded` e `aria-controls` e abre o comparador dentro do card, só quando a pessoa pede. No lote: "Download all · ZIP 9.4 MB" (F13a, DECISOES § 467; antes, "o Baixar … e \"Start over\" em ghost").
5. Linha de apoio (`fo-result__support`) só depois do arquivo pronto, no fundo `deep`, depois do Baixar, do "Start over" e das notas; nunca antes do Baixar, nunca no lugar dele. Uma frase curta (sem exclamação: o "Done!" da Oli é o único da tela), um botão neutro `fo-btn` com o ícone `coffee` (o Ko-fi em inglês e espanhol; em português, só o Pix, para `/pt/apoie/#pix`) e o ghost "Don't show this again". Depois do ghost, no mesmo lugar, uma frase de confirmação (`fo-result__support--done`, `role="status"`, "Got it, I won't ask here again. The coffee link stays in the footer.") e o foco volta ao Baixar (F12, DECISOES § 436). Regras de quando aparece no README de SupportCard.

## Regras

- Sem `aria-live` no card: a região viva da ilha é uma só, o `p.fo-sr[role="status"]`, que diz a fala da Oli uma vez, com os números finais (DECISOES § 102 e F13a, § 467; antes, "`aria-live=\"polite\"` no card: o leitor de tela ouve a fala da Oli"). O card tem `aria-labelledby` na fala.
- O foco vai para o Baixar quando o card aparece.
- `deep` é o mesmo nos dois temas; no escuro, o traço `stroke` (#6A82A6) é o que separa o card do chão. A faixa de água sobre o `deep` é decoração: no escuro, `water` sobre `deep` dá 1,36:1, e nenhum texto nem controle mora nela.
- O card tem a altura do retângulo (356px e 340px). Ele não cresce sozinho: o comparador cresce depois do toque no botão, e a linha do café do 3º uso tem a altura guardada desde antes do resultado (F13a, DECISOES § 470).
- O primeiro AdSlot da ferramenta fica depois do "Como usar", longe do Baixar e da linha do café (F12, DECISOES § 419); nada de anúncio dentro do card nem a menos de `ad-clearance` dele.
- Sem ganho real: a Oli diz "This file was already optimized" e o Baixar entrega o original, nunca um arquivo maior.
