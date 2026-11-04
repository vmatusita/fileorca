# Oli

Marca · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A mascote: uma orca de feijão com o olho dentro da mancha branca, bochecha rosada e a ponta da barbatana dobrada como canto de arquivo, em azul. Ela engole o arquivo e devolve mais leve.

## Poses (lista fechada)

`wave` (topo, repouso), `gulp` (arquivo sobre a DropZone), `swim` (processando), `cheer` (pronto), `oops` (erro), `buoy` (offline), `lost` (404), `coffee` (apoio), `peek` (busca sem resultado), `sad` (só na parede do bloqueador de anúncios, à direita do título, olhando para ele; F12, DECISOES § 417). Pose nova só com decisão registrada no DECISOES.md.

A `sad` só na parede: ela fala triste, sem culpa e sem pedir clique, e nunca aparece no build sem a parede ligada. A pose da parede é uma constante só (`WALL_POSE`, em `src/oli/poses.ts`), para a troca pela `oops` ser uma linha.

## Como usar

- SVG inline num sprite, peças compartilhadas (corpo, barbatana, mancha, olho, boca, nadadeira). Cada pose ≤ 4 KB. `aria-hidden="true"`: o estado é sempre dito em texto ao lado.
- Ela olha para a esquerda, para o conteúdo. No logo, espelhada, olha para a palavra.
- Contorno Orca (#0F1B2D) de 3px a 128px, fixo nos dois temas (não é o token `stroke`, que clareia no escuro), e um aro branco-espuma por trás de tudo: some no fundo claro e vira adesivo no escuro. Não remova o aro.
- Tamanhos: 32px (inline em texto), 64px (OliMessage), 72px (WaterLevel), 88–112px (DropZone, ResultCard), 128px ou mais (home, 404, apoio). Abaixo de 32px use o ícone do app (o rosto de frente), que lê bem a partir de 16px.
- No sprite, o `clipPath` `oli-clip` é declarado uma vez e serve a todas as poses e ao logo inline (o logo traz uma cópia com o mesmo id). A `oli-peek.svg` traz um `clipPath id="ic"` sem uso, sobra do ícone do app: ele não entra no sprite.
- Movimento só em `transform` e `opacity`: flutuar (`dur-float`), salto do `cheer` (`dur-cheer`, uma vez), vapor do `coffee`, que sobe duas vezes e assenta, parado e visível, em 4,8s (F12, DECISOES § F12-C5). Com movimento reduzido, tudo para.

## Nunca

- Perto de anúncio: a Oli não olha, aponta, nada ou fica a menos de `ad-clearance` de um AdSlot.
- No botão Baixar, em cima de foto da pessoa, ou com fala sarcástica, cobrando, ou fazendo culpa.
- Recolorida, com degradê, em 3D ou com roupa. Fora as cores da paleta (Orca, Espuma, Oceano, Bochecha e a Água clara #D6E6FF no vidro da máscara da `lost`), nada.
- Como elemento LCP: o H1 e a DropZone são o LCP.
