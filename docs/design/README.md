# FileOrca · brand book

v1.1 · 29/out/2026 · design system vivo, com previews nos temas claro e escuro: https://claude.ai/artifact/ECjKLGYoW4JL72TKSNWDgT. No repositório, este conteúdo fica em `docs/design/`: tokens.json, tokens.css, `components/` (bundle.css e, por componente, um README e um preview.html), `assets/` (Oli, logo, ícones e as imagens de exemplo dos previews), `fonts/` (as duas fontes e as licenças OFL) e `index.html`, que abre todos os previews no navegador. No projeto do Claude, os READMEs dos componentes estão juntos em COMPONENTES.md (índice) e COMPONENTES-1 a 3, e os SVGs em OLI-1 e OLI-2, LOGO.md e ICONES.md. O que mudou do v1 para o v1.1 está em DESIGN-SYSTEM.md.

FileOrca é um site de ferramentas grátis que rodam no navegador: imagem, PDF e calculadoras, sem conta e sem upload. A cara é a da **Oli**, uma orca que engole o arquivo e devolve mais leve. Tudo neste sistema sai de três imagens: o **preto e branco nítido da orca**, o **canto dobrado do arquivo** (a ponta da barbatana da Oli) e o **mar**, que sobe enquanto a ferramenta trabalha e onde o resultado chega.

## Como construir com este sistema

- Carregue `tokens.css` e `components/bundle.css`. As classes são `fo-*`; cada componente tem a marcação no seu `preview.html` e as regras no seu README.
- No site (Astro + Tailwind v4), os tokens viram o `@theme` e as variáveis do tema escuro; `bundle.css` é a referência de estilo de cada componente. Nenhum hex fora de `tokens.json`, exceto dentro da Oli, o fundo branco do QR do Pix e a hachura dos juros.
- Ícones: SVG inline com `stroke="currentColor"` (grupo Icons). Oli: SVG inline num sprite (grupo Oli), sempre `aria-hidden`.
- O tema escuro segue o sistema (`prefers-color-scheme`) só com CSS, sem script; `data-theme="light"` ou `"dark"` no `<html>` força um dos dois (para testes e previews).

## Princípios de UX

1. **Resultado primeiro, ajuste depois.** Soltou o arquivo, a ferramenta já processa com o padrão recomendado. As opções reprocessam na hora. Não existe botão "Aplicar" nem "Calcular".
2. **Um lugar só.** DropZone, WaterLevel e ResultCard ocupam o mesmo retângulo, do mesmo tamanho. A página não pula e o olho não procura.
3. **Uma ação amarela.** Em cada tela, só o Baixar é `sun`. O resto é neutro ou ghost.
4. **Diga com números.** "2.4 MB → 780 KB", "−68%", "you'll pay $382,637 in interest". Nunca "Optimized!" sem número.
5. **Privacidade que dá para conferir.** "Your files never leave your device" no PrivacySeal, e o FAQ ensina a abrir a aba Rede.
6. **Nada se perde.** O original fica intacto, um erro no lote não para os outros arquivos, o cenário da calculadora vive no link. "Start over" é ghost e nunca apaga sem querer.
7. **Polegar primeiro.** Alvo mínimo `tap-min` (48px) em tudo que se toca, Baixar em bloco no celular, painel inteiro acima da dobra a 360×740.
8. **Rápido de verdade.** Resposta ao toque em `dur-instant`. O WaterLevel só aparece se o trabalho passar de 400ms. Nada pisca.

## Voz

- A Oli fala dela em terceira pessoa ("Oli is on it…", "A Oli está cuidando disso…"); o site fala com a pessoa por "you" / "você" / "tú".
- Frases curtas, primeira letra maiúscula e o resto minúsculo (sentence case). Botão começa com verbo e não tem ponto: "Download", "Choose images", "Copy link".
- Exclamação só no sucesso, uma por tela ("Done!", "Prontinho!", "¡Listo!"). O que aparece junto do sucesso (a linha do café, a placa) não repete a exclamação.
- Erro diz o que houve e o que fazer, sem culpar: "Oops, Oli couldn't read this file. Try a JPG or PNG." Nunca "Something went wrong", nunca código solto.
- Sem emoji na interface. Sem "seamless", "effortless", "unlock", "supercharge", "magic", "AI-powered", "revolutionary", "best-in-class". O benefício é o número.
- Português informal e caloroso ("Prontinho!", "me paga um café?"); espanhol neutro com "tú".
- Lote não tem limite: nenhum texto do site inventa um ("up to 50"). Se um formato tiver limite real, o texto diz qual.

| Momento | Inglês | Português | Espanhol |
|---|---|---|---|
| Pronto | Done! Your image is 68% lighter. | Prontinho! Sua imagem ficou 68% mais leve. | ¡Listo! Tu imagen quedó un 68 % más ligera. |
| Processando | Oli is on it… | A Oli está cuidando disso… | Oli se está encargando… |
| Erro | Oops, Oli couldn't read this file. Try a JPG or PNG. | Ops, a Oli não conseguiu ler esse arquivo. Tente um JPG ou PNG. | Uy, Oli no pudo leer este archivo. Prueba con un JPG o PNG. |
| Arquivo em cima | Let go, Oli's ready | Pode soltar, a Oli está pronta | Suéltalo, Oli está lista |
| 404 | This page swam away. | Essa página nadou para longe. | Esta página se fue nadando. |
| Offline | No internet? No problem, Oli works offline. | Sem internet? Sem problema, a Oli funciona offline. | ¿Sin internet? No pasa nada: Oli funciona sin conexión. |
| Apoio | Oli runs on coffee. | A Oli funciona à base de café. | Oli funciona a base de café. |

## Cor

- O chão é `bg` (Espuma no claro, Oceano-noite no escuro). Cards e o painel ficam em `surface`; trilhos, linhas alternadas e o AdSlot em `surface-sunken`.
- Texto só em `ink`, `ink-muted`, `brand` (links, sobre `bg` e `surface`), `danger` e `success`, ou nos `on-*` sobre o preenchimento que eles nomeiam. Todo par passa de 4,5:1 nos dois temas; os números estão na nota de cada token.
- `deep` é o fundo do mar, igual nos dois temas: ResultCard, ResultHero e rodapé. Texto sobre ele em `on-deep` e `on-deep-muted`.
- `sun` é só do Baixar. Nada mais é amarelo: nem aviso, nem destaque, nem o card de café. Aviso é `brand-soft` com o ícone `info`.
- As cores de categoria (`turquesa` imagem, `coral` PDF, `alga` dinheiro, `violeta` casa e saúde, `lima` utilidades) são só preenchimento: dobra, círculo de chip, ícone de ToolCard, faixa de hub em `*-soft`. Texto sobre elas em `on-cat` (`on-violeta` na violeta), nunca `ink`, que vira branco no escuro.
- Gráficos: principal em `brand` (em `brand-on-deep` quando o gráfico está sobre `deep`, como no ResultHero), juros em `coral` com hachura. Azul × coral se distinguem sem vermelho e verde, e a legenda sempre diz o valor.
- Erro é `danger` com ícone `alert` e a fala da Oli; nunca só a cor. `coral` não é erro.

## Tipografia

- Fredoka (`display`) nos títulos até o H2, nos números de resultado e na fala da Oli. Figtree (`text`) em todo o resto. No site, as duas vêm dos pacotes `@fontsource-variable/fredoka` e `@fontsource-variable/figtree`, só o subconjunto latino (`fredoka-latin-wght-normal.woff2` e `figtree-latin-wght-normal.woff2`, os mesmos arquivos da pasta `fonts/` dos previews); faça preload só da Fredoka.
- Use os estilos pelo nome: `display` na home e nos hubs, `h1` nas ferramentas e calculadoras; abaixo de 768px, toda página usa `h1-mobile`. `h2` nas seções, `h3` em Figtree 700. Números: `number-xl` no ResultHero, `number-lg` na Placa, `number-md` nas estatísticas. A fala da Oli em `oli`.
- Corpo em `body` 16px; campo de formulário nunca abaixo de 16px. Tabelas em `table`, com `font-variant-numeric: tabular-nums` (a Figtree tem; a Fredoka não, então número em Fredoka fica alinhado à esquerda).
- O subconjunto latino das duas fontes tem − (U+2212), ×, … e · , mas não tem → nem ↔. Em "2.4 MB → 780 KB", a seta é o ícone `arrow-right` em `fo-icon--inline`, com "to" / "para" / "a" escondido para leitor de tela. Em nome de ferramenta, escreva por extenso ("PNG to JPG").
- Caixa alta só no `caption` (rótulo do AdSlot, sobretítulo de hub, título de coluna do rodapé), com 0,08em de espaçamento.

## Forma

- **Traço:** tudo que se toca ou que é um objeto (botão, campo, chip, card, DropZone) tem borda `stroke-2` em `stroke`: no claro, o mesmo preto-orca do contorno da Oli. Divisores decorativos são `stroke-hair` em `hairline`.
- **Lábio:** só o que se aperta tem a sombra sólida `shadow-lip*` e afunda `lip` (4px) no clique. Cards que levam a outra página sobem com `shadow-lift` no hover. O que flutua (CookieNotice, busca) usa `shadow-pop`. Nada mais tem sombra.
- **Dobra:** papéis (FileCard, ToolCard) têm o canto de cima à direita dobrado, de lado `dogear`, na cor da categoria. É o mesmo canto da barbatana da Oli.
- **Raio:** `radius-pill` em botão, chip e trilho; `radius-xl` (24px) no painel, no ResultCard e nas faixas; `radius-lg` em cards; `radius-md` em campos; `radius-xs` no AdSlot e em miniaturas.
- **Mar:** a água (`water`) com borda de onda aparece no fundo da DropZone, sobe no WaterLevel e a onda volta no topo do rodapé em `deep`. Nenhuma imagem de fundo no site.
- **Espaço:** passos de 4px (`space-1` a `space-24`). Card com `space-4` no celular e `space-6` no computador; seções a `space-12`.

## Movimento

- Só `transform` e `opacity`, nada em JavaScript. Entrada com `ease-out`; a Oli e a Placa com `ease-spring`; loops com `ease-in-out`.
- Durações pelo nome: `dur-instant` (toque), `dur-quick` (hover, foco), `dur-base` (abrir, trocar estado), `dur-cheer` (o salto da Oli, uma vez), `dur-float` (flutuar), `dur-wave` (a onda).
- Com `prefers-reduced-motion: reduce`, nada anima sozinho: a Oli fica parada, a água sobe sem onda, a Placa aparece pronta.

## Oli

- Nove poses, lista fechada: `wave`, `gulp`, `swim`, `cheer`, `oops`, `buoy`, `lost`, `coffee`, `peek`. Pose nova só com decisão registrada.
- Ela olha para a esquerda, para o conteúdo; no logo, espelhada, para a palavra. Na página de ferramenta, ela senta na borda de cima da DropZone, à direita do H1, e reage ali: `gulp` com o arquivo em cima, `swim` na água, `cheer` no ResultCard.
- O contorno é preto-orca nos dois temas, e o aro branco por trás da silhueta fica sempre: some no claro e vira adesivo no escuro e sobre `deep`.
- A Oli inteira vai de 32px para cima; abaixo disso, o ícone do app (o rosto de frente), que lê bem a partir de 16px.
- Decorativa (`aria-hidden`): o estado é sempre dito em texto ao lado.
- Nunca a menos de `ad-clearance` de um anúncio, nunca olhando ou apontando para ele, nunca no botão Baixar.

## Ícones

- Desenho próprio em grade de 24px, traço 2px, pontas e cantos redondos, em `currentColor` (grupo Icons). Os ícones de arquivo têm o canto dobrado.
- Tamanhos `icon` (24px) e `icon-sm` (20px); `fo-icon--inline` (1em) dentro de texto. Ícone que carrega sentido passa de 3:1 contra o chão.
- Ícone sozinho só em ação de linha (remover, baixar um arquivo do lote), sempre com `aria-label`. Em todo o resto, ícone acompanha palavra.
- Sem emoji, sem pacote de ícones genérico misturado. Ferramenta que pede um ícone que não existe (assinar, marca d'água, carro, cartão, porcentagem…) ganha um desenhado na mesma grade e no mesmo traço, que entra em `assets/Icons/` com decisão registrada no DECISOES.md.

## Layout e anúncios

- Celular primeiro, a 360px. Coluna da ferramenta até `tool-max`; texto até `measure`; página até `page-max`; a partir de 1280px entra a coluna `rail` com o anúncio 300×600, que não gruda.
- O AdSlot é neutro (`ad-ground`, rótulo `caption`), com altura reservada e `ad-clearance` (150px) de qualquer Baixar, campo, painel ou Oli. O rótulo é "Advertisements" / "Publicidade" / "Anuncios": as únicas palavras que o AdSense aceita em cada idioma, além de "Sponsored Links" e equivalentes.
- Nunca há anúncio acima da ferramenta no celular, dentro do painel, ao lado do Baixar, no WaterLevel, entre campos, dentro do cronograma ou nas páginas jurídicas. O único fixo é a âncora do AdSense, e nada do site a cobre (nem o CookieNotice).
- O pedido de café nunca encosta num anúncio e nunca imita o anúncio ou o Baixar.

## Acessibilidade

- Anel de foco `focus` de 3px, afastado 2px, em tudo que recebe foco; dentro de `.fo-deep` ele vira `on-deep`.
- A DropZone não é botão: clicar nela abre o seletor, e o alvo de teclado é o Escolher arquivos dentro dela (controle dentro de controle reprova no axe). WaterLevel é `progressbar` com nome e `aria-valuetext`, ResultCard e ResultHero têm `aria-live="polite"`, OliMessage de erro é `alert`.
- Todo controle tem nome acessível que contém o texto visível: o logo inline é `role="img"` com `aria-label="FileOrca"`, o botão de idioma diz "EN" e completa em texto escondido, a busca é um combobox com a lista nomeada.
- Títulos sem pular nível: as colunas do rodapé são H2, e o título do SupportCard segue a página.
- Tudo navegável por teclado: segmentado com setas, BeforeAfter com setas, AmortTable com anos em botões `aria-expanded`, busca com setas, Enter e Esc.
- A cor nunca é a única informação: ganho tem ícone, erro tem ícone e frase, gráfico tem legenda com valor.

## Nunca

- Degradê azul-roxo, texto em degradê, brilho, blob desfocado, vidro fosco.
- Card com borda colorida só à esquerda. Grade de três "features" com ícone num quadrado arredondado.
- Emoji como ícone ou enfeite; ✨ para dizer "mágica".
- Inter, Roboto ou a fonte do sistema como identidade.
- Borda em degradê animado na DropZone: a assinatura é o traço tracejado e a água.
- O mesmo raio e a mesma sombra grande em tudo. Sombra é informação: lábio aperta, lift leva, pop flutua.
- Amarelo fora do Baixar. Botão com cara de anúncio, anúncio com cara de site.
- Ilustração 3D genérica, foto de banco, imagem de fundo.
