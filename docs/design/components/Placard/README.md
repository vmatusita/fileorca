# Placard

Arquivos · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A placa que a Oli segura com o número do resultado: o selo que a pessoa lembra ("68% menor").

- Fundo `surface`, traço `stroke`, `radius-sm`, girada −4°. Número em `number-lg`, rótulo em caixa alta 12px `ink-muted`.
- Entra uma vez com `.fo-pop` (`dur-cheer`, `ease-spring`); com movimento reduzido, aparece parada.
- Sobre `deep`, perde o lábio e a borda vira `surface`.
- No ResultCard, boia na superfície da água, à direita, presa pela Oli do canto, em todas as larguras, e é `aria-hidden`: repete o número da fala, que já é lido (F13a, DECISOES § 464; antes, sem `aria-hidden` e só a partir de 768px).
- Mostre só o número que importa: o ganho (−68%), a parcela ($1,896). Nunca dois números na mesma placa.
- Número no formato do idioma: "−68%" (en), "−68%" (pt), "−68 %" (es, com espaço inseparável). O sinal é o menos tipográfico (U+2212), não o hífen.

## Mudança de regra (F13b, DECISOES § 545)

- **Na calculadora.** Antes (README do ResultHero): "A Oli aparece em `cheer` sem salto, segurando a Placa com o número, só no primeiro resultado da visita." Depois: a calculadora não usa a Placa; a Oli fica no card desde a primeira pintura e troca a pose na mesma caixa. A Placa continua no ResultCard das ferramentas de arquivo. O `placard` das definições das calculadoras fica como dado (o PDF e os testes o leem), sem ir para a tela.

## Mudança de regra (F13b, DECISOES § 580)

- **Abaixo de 340px.** Antes: a Placa boiava em todas as larguras. Depois: abaixo de 340px ela sai do ResultCard (`display: none`; é `aria-hidden`, e a fala diz o mesmo número), porque estreitava as duas primeiras linhas da fala e levava o resultado de uma foto de celular a passar do retângulo de 356px.
