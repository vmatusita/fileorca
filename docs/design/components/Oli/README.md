# Oli

Marca · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A mascote: uma orca de feijão com o olho dentro da mancha branca, bochecha rosada e a ponta da barbatana dobrada como canto de arquivo, em azul. Ela engole o arquivo e devolve mais leve.

## Poses (lista fechada)

`wave` (topo, repouso), `gulp` (arquivo sobre a DropZone), `swim` (processando), `cheer` (pronto), `oops` (erro), `buoy` (offline), `lost` (404 e a caixa vazia da DropZone, quando o chip que leva o arquivo chega sem ele; F13a, DECISOES § 499), `coffee` (apoio), `peek` (busca sem resultado), `sad` (só na parede do bloqueador de anúncios, à direita do título, olhando para ele; F12, DECISOES § 417). Pose nova só com decisão registrada no DECISOES.md.

A `sad` só na parede: ela fala triste, sem culpa e sem pedir clique, e nunca aparece no build sem a parede ligada. A pose da parede é uma constante só (`WALL_POSE`, em `src/oli/poses.ts`), para a troca pela `oops` ser uma linha.

## Como usar

- SVG inline num sprite, peças compartilhadas (corpo, barbatana, mancha, olho, boca, nadadeira). Cada pose ≤ 4 KB. `aria-hidden="true"`: o estado é sempre dito em texto ao lado.
- Ela olha para a esquerda, para o conteúdo. No logo, espelhada, olha para a palavra.
- Contorno Orca (#0F1B2D) de 3px a 128px, fixo nos dois temas (não é o token `stroke`, que clareia no escuro), e um aro branco-espuma por trás de tudo: some no fundo claro e vira adesivo no escuro. Não remova o aro.
- Tamanhos: 32px (inline em texto), 64px (OliMessage), 72px (a `swim` no mar dos hubs de categoria; F13b, DECISOES § 575), 88–112px no canto de cima à direita do retângulo da ferramenta, a mesma Oli em todo estado (F13a, DECISOES § 465; antes, "72px (WaterLevel), 88–112px (DropZone, ResultCard)"), 128px ou mais (home, 404, apoio; na home, a `swim` de 128px no celular e 152px a partir de 768, nadando no mar do topo; F13b, DECISOES § 567). Abaixo de 32px use o ícone do app (o rosto de frente), que lê bem a partir de 16px.
- No sprite, o `clipPath` `oli-clip` é declarado uma vez e serve a todas as poses e ao logo inline (o logo traz uma cópia com o mesmo id). A `oli-peek.svg` traz um `clipPath id="ic"` sem uso, sobra do ícone do app: ele não entra no sprite.
- Movimento só em `transform` e `opacity`, no `<svg>` filho de `[data-oli]` (a caixa não se mexe). **Movimento que começa sozinho termina antes de 5 s e deixa a Oli parada na pose desenhada; só o progresso dura o trabalho** (F13a, DECISOES § 460). Antes: "flutuar (`dur-float`), salto do `cheer` (`dur-cheer`, uma vez), vapor do `coffee`, que sobe duas vezes e assenta, parado e visível, em 4,8s (F12, DECISOES § 439)". Agora, um movimento curto por estado: `wave` acena uma vez (`dur-float`, 3 s) e ganha um aceno curto (`dur-cheer`) no ponteiro sobre a DropZone ou no foco do botão dela; `gulp` cresce 6 % e inclina 4 px para a água numa transição de `dur-quick`; `swim` dá braçadas enquanto o trabalho dura (o único laço, porque é o progresso); `cheer` salta uma vez; `oops` recua 4 px e volta, uma vez; `buoy` balança duas vezes (3 s); `lost` procura uma vez (3 s); `peek` sobe de trás da borda (`dur-base`); o vapor do `coffee` sobe 1,4 ciclo e assenta à vista em 3,12 s; `sad` fica parada. Rotação de até 6° e deslocamento novo de até 8 px, nunca na direção de um anúncio (os 150px até ele são conferidos com a caixa inflada em 12 px: x − 12, y − 12, largura + 24, altura + 24, no `ads.spec.ts` e no `fo-ad-map.spec.ts`; F13a, revisão a-2, DECISOES § 513). Na home, a partir de 1280px, a Oli do topo guarda 16px da borda da coluna, porque a lateral fica a 150px dela. **F13b (DECISOES § 577):** a `swim` da home e dos hubs não é progresso. Antes: "`swim` dá braçadas enquanto o trabalho dura (o único laço, porque é o progresso)", em toda página. Depois: na ferramenta, continua o laço; no mar da home e dos hubs, ela balança três vezes (`fo-bob`, 6 meias-voltas de 800ms, 4,8s) e para no desenho, por um seletor próprio (`.fo-home-sea` e `.fo-hubband__sea`), e a água fica parada. Na home nova, a Oli do topo fica dentro do mar, a 32px da borda direita da coluna (20px com a caixa inflada). Com movimento reduzido, tudo para, e o quadro é a pose desenhada, o mesmo do fim de cada movimento.

## Nunca

- Perto de anúncio: a Oli não olha, aponta, nada ou fica a menos de `ad-clearance` de um AdSlot.
- No botão Baixar, em cima de foto da pessoa, ou com fala sarcástica, cobrando, ou fazendo culpa.
- Recolorida, com degradê, em 3D ou com roupa. Fora as cores da paleta (Orca, Espuma, Oceano, Bochecha e a Água clara #D6E6FF no vidro da máscara da `lost`), nada.
- Como elemento LCP: o H1 e a DropZone são o LCP.
