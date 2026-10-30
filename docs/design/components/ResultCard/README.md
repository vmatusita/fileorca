# ResultCard

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O momento em que a Oli devolve o arquivo: um card no fundo do mar (`deep`), com a Oli comemorando, a placa do ganho, antes e depois e o Baixar amarelo. Ocupa o lugar da DropZone.

## Anatomia

1. Oli `cheer` (96px, salto de `dur-cheer` uma vez) e a fala em `oli` ("Done! Your image is 68% lighter.").
2. Placa (`fo-placard`): `number-lg` "−68%" e "lighter", girada −4°, entra com `ease-spring`.
3. Estatísticas em `<dl>`: Before (riscado, `on-deep-muted`), After, e um dado útil (dimensões, páginas).
4. Ações: o Baixar `fo-btn--download fo-btn--lg` com o tamanho, e "Start over" em ghost. No lote: "Download all · ZIP 9.4 MB".
5. Linha de apoio (`fo-result__support`) só depois do arquivo pronto, nunca antes do Baixar, nunca no lugar dele. Regras de quando aparece no README de SupportCard.

## Regras

- `aria-live="polite"` no card: o leitor de tela ouve a fala da Oli.
- O foco vai para o Baixar quando o card aparece.
- `deep` é o mesmo nos dois temas; no escuro, o traço `stroke` (#6A82A6) é o que separa o card do chão.
- O primeiro AdSlot fica abaixo dos NextStepChips, a `ad-clearance` do Baixar.
- Sem ganho real: a Oli diz "This file was already optimized" e o Baixar entrega o original, nunca um arquivo maior.
