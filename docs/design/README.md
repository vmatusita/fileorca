# FileOrca · brand book

v1.1 · 29/out/2026 · design system vivo, com previews nos temas claro e escuro: https://claude.ai/artifact/ECjKLGYoW4JL72TKSNWDgT. No repositório, este conteúdo fica em `docs/design/`: tokens.json, tokens.css, `components/` (bundle.css e, por componente, um README e um preview.html), `assets/` (Oli, logo, ícones e as imagens de exemplo dos previews), `fonts/` (as duas fontes e as licenças OFL) e `index.html`, que abre todos os previews no navegador. No projeto do Claude, os READMEs dos componentes estão juntos em COMPONENTES.md (índice) e COMPONENTES-1 a 3, e os SVGs em OLI-1 e OLI-2, LOGO.md e ICONES.md. O que mudou do v1 para o v1.1 está em DESIGN-SYSTEM.md.

FileOrca é um site de ferramentas grátis que rodam no navegador: imagem, PDF e calculadoras, sem conta e sem upload. A cara é a da **Oli**, uma orca que engole o arquivo e devolve mais leve. Tudo neste sistema sai de três imagens: o **preto e branco nítido da orca**, o **canto dobrado do arquivo** (a ponta da barbatana da Oli) e o **mar**, que sobe enquanto a ferramenta trabalha e onde o resultado chega.

## Como construir com este sistema

- Carregue `tokens.css` e `components/bundle.css`. As classes são `fo-*`; cada componente tem a marcação no seu `preview.html` e as regras no seu README.
- No site (Astro + Tailwind v4), os tokens viram o `@theme` e as variáveis do tema escuro; `bundle.css` é a referência de estilo de cada componente. Nenhum hex fora de `tokens.json`, exceto dentro da Oli, o fundo branco do QR do Pix e a hachura dos juros.
- Ícones: SVG inline com `stroke="currentColor"` (grupo Icons). Oli: SVG inline num sprite (grupo Oli), sempre `aria-hidden`.
- O tema tem três estados: Sistema (o padrão, que segue o `prefers-color-scheme` só com CSS), Claro e Escuro, escolhidos no botão de tema do cabeçalho (Header). A escolha fica no navegador, na chave `fo-theme` do `localStorage` (`light` ou `dark`; voltar a Sistema apaga a chave), e um script inline mínimo no `<head>`, depois da `<meta name="color-scheme" content="light dark">` e antes do CSS, põe `data-theme="light"` ou `"dark"` no `<html>` antes da primeira pintura; em Sistema, nenhum `data-theme`. Toda regra de `prefers-color-scheme` tem o par com `data-theme` (`tokens.css` e o CSS do site), e os testes e previews também forçam um dos dois pelo `data-theme`. O escuro vale só na tela (`@media screen`): a impressão sai sempre no tema claro, porque o papel é branco e o navegador não imprime o fundo por padrão.

## Princípios de UX

1. **Resultado primeiro, ajuste depois.** Soltou o arquivo, a ferramenta já processa com o padrão recomendado. As opções reprocessam na hora. Não existe botão "Aplicar" nem "Calcular".
2. **Um lugar só.** DropZone, WaterLevel e ResultCard ocupam o mesmo retângulo, da mesma altura em todos os estados (356px no celular, 340px a partir de 768px), e a faixa de baixo, com as opções antes do resultado e os chips e o "Ajustar" depois, também tem altura fixa. Nada cresce sem um gesto da pessoa. A página não pula e o olho não procura (F13a, DECISOES § 463 e § 466).
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
| Offline | No internet? Oli keeps working on the pages you already opened. | Sem internet? A Oli segue funcionando nas páginas que você já abriu. | ¿Sin internet? Oli sigue funcionando en las páginas que ya abriste. |
| Apoio | Oli runs on coffee. | A Oli funciona à base de café. | Oli funciona a base de café. |

## Cor

- O chão é `bg` (Espuma no claro, Oceano-noite no escuro). Cards e o painel ficam em `surface`; trilhos, linhas alternadas e o AdSlot em `surface-sunken`.
- Texto só em `ink`, `ink-muted`, `brand` (links, sobre `bg` e `surface`), `danger` e `success`, ou nos `on-*` sobre o preenchimento que eles nomeiam. Todo par passa de 4,5:1 nos dois temas; os números estão na nota de cada token.
- `deep` é o fundo do mar, igual nos dois temas: ResultCard, ResultHero e rodapé. Texto sobre ele em `on-deep` e `on-deep-muted`.
- `sun` é só do Baixar. Nada mais é amarelo: nem aviso, nem destaque, nem o card de café. Aviso é `brand-soft` com o ícone `info`.
- As cores de categoria (`turquesa` imagem, `coral` PDF, `alga` dinheiro, `violeta` casa e saúde, `lima` utilidades) são só preenchimento: dobra, círculo de chip, ícone de ToolCard, faixa de hub em `*-soft`. Texto sobre elas em `on-cat` (`on-violeta` na violeta), nunca `ink`, que vira branco no escuro.
- Os pares das páginas institucionais (F13b, UX-17 A) não pedem token novo: `on-deep-muted` sobre `deep` 7,71:1 e `on-deep` sobre `deep` 13,16:1 (o rodapé, nos dois temas), `ink` sobre `brand-soft` 14,76:1 no claro e 11,99:1 no escuro (no README do Footer); `ink-muted` sobre `surface` 7,01:1 e 7,83:1 (os rótulos do cartão dos números) e `ink-muted` sobre `bg` 6,69:1 e 8,99:1 (o número das seções do índice e a data da página jurídica).
- A faixa de cada categoria da home e a faixa dos hubs de categoria são `*-soft` no claro e `surface` no escuro, com a onda na cor cheia da categoria (F13b; DECISOES § 575).
- Gráficos: principal em `brand` (em `brand-on-deep` quando o gráfico está sobre `deep`, como no ResultHero), juros em `coral` com hachura. Azul × coral se distinguem sem vermelho e verde, e a legenda sempre diz o valor.
- Erro é `danger` com ícone `alert` e a fala da Oli; nunca só a cor. `coral` não é erro.
- Sobre `deep` (o erro dentro do ResultHero), o ícone `alert` é `danger-on-deep` (`#FF8A80`, igual nos dois temas, como o `brand-on-deep`): 6,04:1 contra `deep` no claro e no escuro, onde o `danger` do claro daria 2,45:1. O texto do erro no card continua `on-deep` (F13b; DECISOES § 538).

## Tipografia

- Fredoka (`display`) nos títulos até o H2, nos números de resultado e na fala da Oli. Figtree (`text`) em todo o resto. No site, as duas vêm dos pacotes `@fontsource-variable/fredoka` e `@fontsource-variable/figtree`, só o subconjunto latino (`fredoka-latin-wght-normal.woff2` e `figtree-latin-wght-normal.woff2`, os mesmos arquivos da pasta `fonts/` dos previews); faça preload só da Fredoka.
- Use os estilos pelo nome: `display` na home e nos hubs, `h1` nas ferramentas e calculadoras; abaixo de 768px, toda página usa `h1-mobile`. `h2` nas seções, `h3` em Figtree 700. Números: `number-xl` no ResultHero, `number-lg` na Placa, `number-md` nas estatísticas. A fala da Oli em `oli`.
- Corpo em `body` 16px; campo de formulário nunca abaixo de 16px. Tabelas em `table`, com `font-variant-numeric: tabular-nums` (a Figtree tem; a Fredoka não, então número em Fredoka fica alinhado à esquerda).
- O subconjunto latino das duas fontes tem − (U+2212), ×, … e · , mas não tem → nem ↔. Em "2.4 MB → 780 KB", a seta é o ícone `arrow-right` em `fo-icon--inline`, com "to" / "para" / "a" escondido para leitor de tela. Em nome de ferramenta, escreva por extenso ("PNG to JPG").
- A reserva da Figtree (`Figtree Fallback`, a Arial calibrada) tem uma face para o texto regular e duas para o negrito, uma em 600 e outra em 700 a 900, medidas sobre a Arial Bold: o rótulo em 600 tem a mesma largura com a reserva e com a Figtree, nos dois navegadores (F13b; DECISOES § 537).
- O H1 da home, em `display`, é o maior texto da primeira tela a partir de 768px (o LCP). Abaixo disso, a linha do topo, com três linhas, tem mais área que o `h1-mobile` de 28px e continua sendo o LCP, como antes da F13b (DECISOES § 574). O topo e as faixas da home e a faixa do mar dos hubs usam a `Figtree Steady`, que não troca de fonte quando a Figtree chega (§ 578).
- Caixa alta só no `caption` (rótulo do AdSlot, sobretítulo de hub, título de coluna do rodapé), com 0,08em de espaçamento.

## Forma

- **Traço:** tudo que se toca ou que é um objeto (botão, campo, chip, card, DropZone) tem borda `stroke-2` em `stroke`: no claro, o mesmo preto-orca do contorno da Oli. Divisores decorativos são `stroke-hair` em `hairline`.
- **Lábio:** só o que se aperta tem a sombra sólida `shadow-lip*` e afunda `lip` (4px) no clique. Cards que levam a outra página sobem com `shadow-lift` no hover. O que flutua (CookieNotice, a busca do diálogo) usa `shadow-pop`; a busca posta na página (a da 404) leva só o traço (F13b; DECISOES § 584; antes, "O que flutua (CookieNotice, busca) usa `shadow-pop`"). Nada mais tem sombra.
- **Dobra:** papéis (FileCard, ToolCard) têm o canto de cima à direita dobrado, de lado `dogear`, na cor da categoria. É o mesmo canto da barbatana da Oli.
- **Raio:** `radius-pill` em botão, chip e trilho; `radius-xl` (24px) no painel, no ResultCard e nas faixas; `radius-lg` em cards; `radius-md` em campos; `radius-xs` no AdSlot e em miniaturas.
- **Mar:** a água (`water`) com borda de onda aparece no fundo da DropZone, sobe no WaterLevel e a onda volta no topo do rodapé em `deep`. Nenhuma imagem de fundo no site.
- **Linha d'água (F13b; DECISOES § 539):** o fundo do mar se lê pela forma, nos dois temas, não pela luminância. Antes: o `deep` dos cartões e do rodapé era só uma cor, e no escuro ele quase some contra o chão. Depois: o ResultHero leva por dentro da borda, no padding de cima, 16 px de ar em `surface` que terminam na onda do rodapé (120 × 16), com uma crista de 2 px em `stroke` (a classe `fo-sea-top`, só pseudo-elementos: a altura do cartão não muda); o rodapé ganha a mesma crista sobre a onda dele. O ResultCard da página de ferramenta não leva outra onda: a linha d'água dele é a faixa de água que subiu da F13a (§ 463). Pares: `stroke` sobre `surface` (a crista do cartão) 17,28:1 no claro e 4,07:1 no escuro; `stroke` sobre `bg` (a crista do rodapé) 16,50:1 e 4,67:1.
- **O mar fora da ferramenta (F13b; DECISOES § 567 e § 575):** antes, a água só aparecia na DropZone, no WaterLevel e no rodapé. Depois, ela sobe também para o topo da home (a `water` parada, com o selo sobre ela e a Oli nadando) e para o pé da faixa dos hubs de categoria (a água, uma crista de 3px e a Oli meio submersa). Tudo `aria-hidden`, sem receber clique, e a onda é a do rodapé como máscara de um elemento.
- **Espaço:** passos de 4px (`space-1` a `space-24`). Card com `space-4` no celular e `space-6` no computador; seções a `space-12`.

## Movimento

- Só `transform` e `opacity`, nada em JavaScript. Entrada com `ease-out`; a Oli e a Placa com `ease-spring`; ida e volta com `ease-in-out`.
- **Movimento que começa sozinho termina antes de 5 s e deixa a Oli parada na pose desenhada; só o progresso (a `swim`, a onda e o spinner) dura o trabalho** (F13a, DECISOES § 460; antes, "loops com `ease-in-out`"). Cada estado da Oli tem um movimento curto: o aceno da `wave` uma vez, e um aceno curto no ponteiro ou no foco da DropZone; a `gulp`, a `cheer`, a `oops`, a `buoy`, a `lost` e a `peek` uma vez; o vapor do `coffee` assenta à vista em 3,12 s; a `sad` fica parada. O `gate:design` aceita `infinite` só nos seletores do progresso.
- Durações pelo nome: `dur-instant` (toque), `dur-quick` (hover, foco), `dur-base` (abrir, trocar estado), `dur-cheer` (o salto da Oli, uma vez), `dur-float` (o aceno da `wave` e a procura da `lost`, uma vez), `dur-wave` (a onda).
- Com `prefers-reduced-motion: reduce`, nada anima sozinho: a Oli fica parada, a água sobe sem onda, a Placa aparece pronta.
- Fora da ferramenta, a `swim` não é progresso: no mar da home e no pé da faixa dos hubs de categoria ela balança três vezes (`fo-bob`, seis meias-voltas de `dur-wave` / 3, 4,8 s ao todo) e para na pose desenhada, e a água fica parada (F13b; DECISOES § 577). No card da calculadora, a `wave` fica parada no exemplo, sem o aceno da F13a, para o canto do card não se mexer em toda carga (DECISOES § 545).

## Oli

- Dez poses, lista fechada: `wave`, `gulp`, `swim`, `cheer`, `oops`, `buoy`, `lost`, `coffee`, `peek` e `sad` (só na parede do bloqueador, o AdblockWall; F12). Pose nova só com decisão registrada.
- Ela olha para a esquerda, para o conteúdo; no logo, espelhada, para a palavra. Na página de ferramenta, ela fica no canto de cima à direita do retângulo em todos os estados, olhando para a fala, e reage ali: `wave` em repouso, `gulp` com o arquivo em cima, `swim` enquanto a água sobe, `cheer` no ResultCard (segurando a placa) e `oops` no erro; o H1 usa a largura toda, e só a linha do selo abre espaço para ela (F13a, DECISOES § 465; antes, "ela senta na borda de cima da DropZone, à direita do H1").
- O contorno é preto-orca nos dois temas, e o aro branco por trás da silhueta fica sempre: some no claro e vira adesivo no escuro e sobre `deep`.
- A Oli inteira vai de 32px para cima; abaixo disso, o ícone do app (o rosto de frente), que lê bem a partir de 16px.
- Decorativa (`aria-hidden`): o estado é sempre dito em texto ao lado.
- Os lugares que a F13b acrescentou: no card da calculadora (o ResultHero), desde a primeira pintura, `wave` no exemplo, `cheer` uma vez por visita no primeiro resultado e `oops` no erro, e na saúde nunca `cheer` (DECISOES § 545; o sprite das calculadoras leva só essas três, § 553); no mar do topo da home, a `swim` de 128px no celular e 152px a partir de 768px, à direita do H1 (§ 567); no pé da faixa dos hubs de categoria, a `swim` de 72px meio submersa (§ 575); na Sobre, a `wave` de 96px no celular e 128px a partir de 768px, ao lado da seção "Orcas are dolphins", olhando para o texto (§ 586); na 404, a `lost` boia numa faixa de água parada (128px, 160px a partir de 768px; a 1280, a faixa é a coluna da direita; § 584). A `wave` e a `lost` usam o movimento do estado (3 s, uma vez). A ficha "What we measured" do guia de arquivo e o rodapé não têm Oli (§ 560 e § 587).
- Nunca a menos de `ad-clearance` de um anúncio, nunca olhando ou apontando para ele, nunca no botão Baixar.

## Ícones

- Desenho próprio em grade de 24px, traço 2px, pontas e cantos redondos, em `currentColor` (grupo Icons). Os ícones de arquivo têm o canto dobrado.
- Tamanhos `icon` (24px) e `icon-sm` (20px); `fo-icon--inline` (1em) dentro de texto. Ícone que carrega sentido passa de 3:1 contra o chão.
- Ícone sozinho só em ação de linha (remover, baixar um arquivo do lote), sempre com `aria-label`. Em todo o resto, ícone acompanha palavra.
- Sem emoji, sem pacote de ícones genérico misturado. Ferramenta que pede um ícone que não existe (como foram o assinar, a marca d'água e, na F13a, o carro, o cartão, a porcentagem e os outros 24 do UX-16) ganha um desenhado na mesma grade e no mesmo traço, que entra em `assets/Icons/` com decisão registrada no DECISOES.md.

## Layout e anúncios

- Celular primeiro, a 360px. Coluna da ferramenta até `tool-max`; texto até `measure`; página até `page-max`; a partir de 1280px entra a coluna `rail` com o anúncio 300×600, que não gruda.
- **A página sem a lateral (F13b; DECISOES § 572):** a propriedade `wide` do BaseLayout tira a coluna `rail`, e o `<main>` usa a largura da página (1.208px a 1280). A home a usa: os anúncios dela são os do conteúdo, e nenhuma lateral.
- **A coluna da direita sem anúncio (F13b, UX-17 A; DECISOES § 583).** Antes: "a partir de 1280px entra a coluna `rail` com o anúncio 300×600", e numa página sem anúncio a coluna ficava vazia (G-06: 484px a 1280). Depois: nas páginas livres que têm uma peça para ela, o `<main>` fica na largura da página (a `wide`) e a view mantém a grade da página com anúncio, 760 + 150 + 300px, com uma peça da própria página na coluna da direita (`.fo-side`, a mesma marcação do celular, posta pela grade): na 404, a faixa do mar com a Oli `lost`; na Sobre e na Contato, o cartão "FileOrca in numbers"; na Privacidade, nos Termos e nas Licenças, o índice "On this page" dos H2. Nunca um AdSlot, uma classe `fo-ad*` ou um `aside.fo-rail` nela: a coluna é conteúdo. O cartão e o índice ficam fixos no rolar (`sticky`, 20px do topo). Abaixo de 1280px, a página de antes (o índice e o cartão da Contato não existem ali).
- O AdSlot é neutro (`ad-ground`, rótulo `caption`), com altura reservada e `ad-clearance` (150px) de qualquer Baixar, campo, painel, menu, Oli, linha do café, faixa de baixo da ferramenta, "Ajustar", chip ou controle da lista do juntar (F13a, DECISOES § 473 e § 488). O rótulo é "Advertisements" / "Publicidade" / "Anuncios": as únicas palavras que o AdSense aceita em cada idioma, além de "Sponsored Links" e equivalentes.
- **O mapa (UX-07 A, F12).** O 1º anúncio de conteúdo tem lugar fixo em cada molde: na home, depois da 1ª seção de cards (nunca na primeira tela); nos hubs, depois da 1ª grade (no de dinheiro, a de crédito); no hub de guias, depois da 1ª grade de guias; na ferramenta, depois do "Como usar"; na calculadora, depois do painel e antes do cronograma; no guia, no texto, depois da ferramenta e de um parágrafo. Os seguintes só até 459px (o celular em pé), a **1.110px** ou mais um do outro, de borda a borda, só em fronteira de bloco (entre seções, parágrafos, listas e perguntas), nunca logo depois de um título nem colados numa tabela. A partir de 768px, o conteúdo 1 e o multiplex no fim do `<main>`; a partir de 1280px, duas laterais, a 2ª a 1.200px da 1ª. Sem o ID da unidade, a posição não aparece.
- **A densidade fica em até 30 %** a 360×740 (a leitura conservadora da § 351: as caixas da coluna mais 100px de âncora, contada uma vez, sobre o `<main>` sem as relacionadas, com a ferramenta em repouso), e também a 768×1024 e a 812×375. O teste do mapa mede cada página com anúncio.
- Nunca há anúncio acima da ferramenta no celular, dentro do painel, ao lado do Baixar, no WaterLevel, entre campos, dentro do cronograma ou nas páginas livres (as jurídicas, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com"). O único fixo é a âncora do AdSense, e nada do site a cobre (nem o CookieNotice); o aviso de cookies aberto, na primeira visita e na rolagem 0, fica a 150px ou mais do 1º anúncio de conteúdo em sete janelas (360×740, 1280×800, 1440×900, 1920×950, 1920×1080, 768×1024 e 1024×1366, as que o teste do mapa mede): onde faltaria, o anúncio desce, nunca o aviso (F13a, DECISOES § 459).
- O pedido de café nunca encosta num anúncio e nunca imita o anúncio ou o Baixar.

## Acessibilidade

- Anel de foco `focus` de 3px, afastado 2px, em tudo que recebe foco; dentro de `.fo-deep` ele vira `on-deep`. A exceção é o `<main>` com `tabindex="-1"`, que recebe o foco por script quando a parede do bloqueador fecha, só para o próximo Tab começar no conteúdo: ele não é controle e fica sem o anel.
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
