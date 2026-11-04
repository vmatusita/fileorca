# AdblockWall

Monetização · FileOrca design system v1.1 (F12). Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro). No site: `src/components/AdblockWall.astro`, o script em `src/ads/wall.ts` e o CSS no `src/styles/components.css` (DECISOES § 426).

A parede da Oli triste para quem bloqueia anúncio: um card do design system sobre o mar, que diz por que o site precisa dos anúncios e mostra como desligar o bloqueador só para o fileorca.com. Triste sem culpa.

- **Onde:** só nas páginas com anúncio (a home e o hub de guias inclusive), só com as três variáveis do AdSense e o `PUBLIC_ADBLOCK_WALL` em `aviso` ou `bloqueio`, e só em fileorca.com. Nunca nas páginas livres (Privacidade, Termos, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com"). Com a variável desligada, nada dela entra no HTML: nem o diálogo, nem o script, nem a isca, nem a pose.
- **Quando:** a detecção segue esta ordem: offline, nada; o sinal do Google (a tag de recuperação, `googlefc.getAdBlockerStatus()`); se o Google não responder em 4 s, o sinal reserva (o `adsbygoogle.js` deu erro **e** a isca `#fo-bait` foi escondida, os dois juntos); um anúncio `filled` na página encerra a detecção. Abre uma vez por página, no máximo 4 s depois do `load`.
- **Os modos:** no `bloqueio`, sem fechar (o Esc não fecha, nem dois seguidos); no `aviso`, com o botão de fechar e o Esc. O bloqueio por rede, a UE, o Reino Unido e a Suíça sempre ganham o `aviso`.
- **O escape:** o "Usar só desta vez" libera o site por 30 minutos, uma vez por dia (o dia do aparelho). Depois, a parede volta sem ele até o dia seguinte, com a linha de "volta amanhã".

## Anatomia

- `<dialog id="fo-wall" class="fo-wall">`, aberto por `showModal()`: o resto da página fica inerte e embaixo do mar.
- **Cabeça:** o título (`h2`, Fredoka 600, 28/34 no celular e 36/42 a partir de 768 px) e a Oli `sad` à direita, olhando para ele (96 px no celular, 128 px a partir de 768 px), `aria-hidden`. No `aviso`, o fechar (`fo-btn--ghost fo-btn--icon`, ícone `close`, 48 × 48, com `aria-label`).
- **Texto:** três frases e, depois do escape do dia, a linha de "volta amanhã" em `ink-muted`.
- **"Ver como desativar":** botão neutro com lábio (`fo-btn`), com `aria-expanded` e `aria-controls`, que abre o painel (`section` com `h3`, a dica e as nove entradas em `<details name>`, uma aberta por vez, cada uma com três passos numa `fo-steps` e uma nota).
- **Rodapé do card, sempre à vista:** o "recarregar" (`fo-btn--brand fo-btn--lg`, 60 px) e o escape (`fo-btn--ghost`, 52 px). Só o corpo rola.
- **A isca** (fora do diálogo): um `div` vazio, fora da tela, com as classes que as listas cosméticas escondem. Nunca um `ins.adsbygoogle`.

## Tokens

Card: `surface`, `ink`, traço `stroke-2` em `stroke`, `radius-xl`, `shadow-pop`. O mar: `water` a 92 % no claro e `deep` a 92 % no escuro (com a `water`, a borda do card ficaria a 2,59:1), numa variável própria do componente, sem token novo. Textos secundários em `ink-muted`. Nada em `sun`.

## Teclado e leitor de tela

- O foco abre no "recarregar". O modal nativo prende o foco no diálogo; ao fechar (o aviso ou o escape), o foco volta para onde estava e, quando não havia foco antes, vai para o `<main>` (`tabindex="-1"`), sem o anel de foco: o `<main>` não é controle, e o foco ali só faz o próximo Tab começar no conteúdo (DECISOES § 450).
- O diálogo tem nome (`aria-labelledby` no título) e descrição (`aria-describedby` no texto). O painel tem nome pelo `h3`.
- O `Ctrl+K` não abre a busca por cima da parede.
- Todo alvo tem 48 px ou mais: o recarregar 60, o "Ver como desativar" e o escape 52, o fechar 48 × 48, cada entrada do painel 56.

## Movimento

Uma entrada só: o card sobe 24 px e aparece, e o mar aparece junto, em 480 ms (`2 × dur-base`, `ease-out`). Nada em laço. Com o movimento reduzido, nada se mexe. Com a parede aberta, a rolagem trava sem deslocar nada (`scrollbar-gutter: stable`) e a Oli da página some (`visibility`): uma Oli por tela.

## Texto

"A Oli vive dos anúncios" · "Oli lives on ads" · "Oli vive de los anuncios". Os botões começam com verbo: "Recarregar, já desativei", "Ver como desativar", "Usar só desta vez". Sem "Aviso" ou "Atenção" no título, sem ícone de alerta, sem pedir que a pessoa veja ou toque em anúncio, sem "clique" nos passos, e a parede não fala do café. Os textos ficam em `src/i18n/<lang>/wall.ts`.

## Faça / Não faça

| Faça | Não faça |
|---|---|
| Um primário só, o `fo-btn--brand` do recarregar | Amarelo, cara de AdSlot, rótulo em caixa alta, anúncio ou link para fora dentro do card |
| Deixar o Esc fechar só o aviso | Fechar o bloqueio por Esc, por clique na água ou por um segundo Esc |
| Esperar a mensagem de consentimento do Google na UE | Cobrir a mensagem do Google com a parede |
| Guardar só a hora do escape (`fo-wall-escape`) | Guardar o fuso, a região ou mandar qualquer um deles em evento ou URL |
