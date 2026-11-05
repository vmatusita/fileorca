# Placard

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A placa que a Oli segura com o número do resultado: o selo que a pessoa lembra ("68% menor").

- Fundo `surface`, traço `stroke`, `radius-sm`, girada −4°. Número em `number-lg`, rótulo em caixa alta 12px `ink-muted`.
- Entra uma vez com `.fo-pop` (`dur-cheer`, `ease-spring`); com movimento reduzido, aparece parada.
- Sobre `deep`, perde o lábio e a borda vira `surface`.
- No ResultCard, boia na superfície da água, à direita, presa pela Oli do canto, em todas as larguras, e é `aria-hidden`: repete o número da fala, que já é lido (F13a, DECISOES § F13A-I-01; antes, sem `aria-hidden` e só a partir de 768px).
- Mostre só o número que importa: o ganho (−68%), a parcela ($1,896). Nunca dois números na mesma placa.
- Número no formato do idioma: "−68%" (en), "−68%" (pt), "−68 %" (es, com espaço inseparável). O sinal é o menos tipográfico (U+2212), não o hífen.
