# ESCOLHAS · a lista da F10 para o Victor marcar

Copie este arquivo para `.cache/ESCOLHAS-marcado.md` e marque lá. O arquivo do Git fica limpo.

Como marcar:
- Marque com um x, entre os colchetes, a alternativa que você quer em cada item.
- Um item sem nenhuma marca:
  - na F11 e na F12, vale a alternativa com "(recomendado)", porque o protótipo recomendado é a especificação que elas seguem quando você não escolher (decisão 4 da ficha da F10). A exceção é a pose: sem marca no UX-08, a parede usa a `oops`, como a ficha da F12 manda;
  - na F13, não entra. A ficha da F13 constrói "o que você escolheu" e deixa de fora "item não escolhido". Vale também para as pendências e para as decisões avulsas da F13: marque o que a F13 deve fazer.
- Quando uma alternativa muda uma regra do design system, a linha dela ou o porquê do item diz isso (a lista completa está no Resumo do README). Marcar a alternativa é aceitar a mudança. Na F11 e na F12, um item sem marca vale a recomendada, inclusive a mudança de regra que ela traz (o menu do UX-01, que a Mudança 6 já manda, e o `fo-btn--brand` da parede no UX-06); para não aceitar, marque "Nenhuma" ou a outra alternativa.
- "Nenhuma" ou "Não fazer" tira o item da run.
- Cada item aponta para o README ([README.md](README.md)) e para o protótipo. Abra o [index.html](index.html) para ver todos nos dois temas.
- A lista marcada vai colada nas conversas da F11, da F12 e da F13, junto com as seções "Para o docs/claude/" e "Para o PENDENCIAS" do relatório da F10 (`docs/relatorios/fase-10.md`).

## F11 · navegação, guias e tema

### UX-01 · Cabeçalho com menu e botão de tema
- [ ] Alternativa A — o Menu de papel: um botão Menu em toda largura abre a folha com a dobra, as categorias com a contagem, Guias e Apoie a Oli (recomendado)
- [ ] Alternativa B — o mar: as seções à vista a partir de 1024 px, com a seção da página debaixo d'água, e a gaveta de mar fundo no celular
- [ ] Nenhuma: fica como hoje
Porquê: um padrão só, o cabeçalho fica com 64 px e uma linha, e cabe categoria nova; nas duas vêm o botão de tema e o cabeçalho na grade a partir de 1280 px, e o idioma entra no Menu abaixo de 768 px (muda regra: o README do Header, "Sem menu hambúrguer" e "Nada mais", e o tema "só com CSS, sem script" do `docs/design/README.md`).
Custo: M

### UX-02 · Hub de guias e as entradas dos guias
- [ ] Alternativa A — o cartão de guia com a dobra, a linha "Measured on N test files" e a ferramenta no pé, em grade por grupo (recomendado)
- [ ] Alternativa B — o hub por ferramenta: um chip por ferramenta e os guias dela embaixo, sem descrição
- [ ] Nenhuma: fica como hoje
Porquê: um cartão só serve o hub, a home, as relacionadas (F5b F-12) e a ferramenta, e o texto dele segura os anúncios da seção B.
Custo: G

## F12 · monetização: anúncios, parede e café

### UX-05 · O card do café e a página de apoio
- [ ] Alternativa A — a linha do café dentro do ResultCard, no mar, depois do Baixar, com uma frase de confirmação depois do "não mostrar de novo"; a linha do rodapé no topo do rodapé; "Support Oli" no menu; a página de apoio com a Oli à direita, o vapor que para em 4,8 s e o Pix com o botão de 52 px (recomendado)
- [ ] Alternativa B — o pedido num bilhete de papel com a dobra, logo abaixo do ResultCard; o rodapé, o menu e a página de apoio iguais aos da A
- [ ] Nenhuma: fica como hoje
Porquê: o mar é o único lugar que nenhum anúncio imita, e a A fica a 176 px da lateral, contra os 150 px exatos da B. O card em pt com um botão só (o Pix) e o texto da página de apoio são decisões avulsas, mais abaixo.
Custo: M

### UX-06 · A parede do bloqueador com a Oli triste
- [ ] Fazer como no protótipo (recomendado)
- [ ] Não fazer
- [ ] Com o protótipo, ajuste 1: a Privacidade diz que a tag do Google e o evento `adblock_wall` saem do aparelho (recomendado)
- [ ] Com o protótipo, ajuste 2: o bloqueio por rede (`NETWORK_LEVEL_AD_BLOCKER`) é sempre aviso (recomendado)
- [ ] Com o protótipo, ajuste 3: os botões começam com verbo e "the ads don't show, and nothing comes in" entra no lugar de "Oli gets nothing" (recomendado)
- [ ] Com o protótipo, ajuste 4: o valor `close` no evento `adblock_wall`, para medir quem fecha o aviso sem desligar
Porquê: a seção A pede a parede na F12; o protótipo traz os cinco estados, os passos de nove casos nos três idiomas, o que a separa da mensagem do Google e o que a F12 testa (muda regra: o `fo-btn--brand` no "recarregar", que o README do Button reserva ao Escolher arquivos; a alternativa está nas decisões avulsas).
Custo: M

### UX-07 · Mapa de anúncios de cada molde
- [ ] Alternativa A — 1.110 px de borda a borda; conteúdo 2+ só no celular, multiplex a partir de 768 px, 2 laterais a partir de 1280 px, 37 unidades e o gate:prontidao contado por largura (recomendado)
- [ ] Alternativa B — 1.110 px de topo a topo: uns 30 % mais anúncios no celular (pior molde 24,0 %), 43 unidades
- [ ] Nenhuma: fica como hoje
Porquê: A é a leitura da § 351 e leva o celular de 1 para 3,4 anúncios por página, com o pior molde em 22,3 % (26,5 % a partir de 768 px, onde entra o multiplex). O Victor cria as 37 unidades no AdSense; a conta do `gate:prontidao`, as unidades, a lateral no processamento e a vinheta são decisões avulsas, mais abaixo. Se a F12 concluir que a ajuda do AdSense não permite esconder unidade por largura, vale o plano B (o `<ins>` criado por script); sem ele, o multiplex sai. Se o UX-04 A for marcado, a F12 põe o 1º anúncio da ferramenta depois do "Como usar".
Custo: G

### UX-08 · A pose `sad` da Oli
- [ ] Usar a `sad` na parede, depois da busca reversa (recomendado)
- [ ] Usar a `oops` na parede (o padrão da seção A sem escolha)
Porquê: a `oops` diz "deu errado"; a `sad` diz "a Oli depende disso", sem culpa, com 2.555 bytes e nenhuma peça nova.
Custo: P

A F13 constrói só os itens marcados, na ordem desta lista, e a válvula dela nunca corta os três primeiros. A ordem recomendada vem do diagnóstico:
- primeiro o que bloqueia ou fere a WCAG de nível A (o aviso de cookies sobre a saída do erro, D-01; a Oli em laço de mais de 5 s, F3 d-02);
- depois o fluxo principal das ferramentas e das calculadoras (o CLS da interação, o Baixar fora da tela, os chips longe);
- por último a identidade (a home, o mar, os ícones, as páginas institucionais) e os itens da lista "para avaliar".

Para mudar a ordem, mova os blocos.

## F13 · UX/UI, na ordem de prioridade recomendada (a F13 constrói os itens marcados, nesta ordem)

### UX-09 · O aviso de cookies compacto no celular
- [ ] Fazer como no protótipo (recomendado)
- [ ] Não fazer
Porquê: o aviso cai de 25,8–28,7 % para 16,5 % da tela a 360 px, deixa livres a saída do erro, o "Escolher" do pt e os campos, e fala de números nas calculadoras (muda uma linha do README do CookieNotice).
Custo: M

### UX-10 · A Oli por estado, com laço curto
- [ ] Alternativa A — cada estado com o seu movimento curto, como no protótipo (recomendado)
- [ ] Alternativa B — só fechar o d-02: o aceno de 3 s uma vez e o vapor de 1,4 ciclo; erro, offline, 404 e busca seguem parados
- [ ] Não fazer
Porquê: fecha o WCAG 2.2.2 sem controle novo e sem JS, e a Oli passa a reagir a cada estado, sempre ao lado da fala; muda a regra "Movimento" do design system ("loops com ease-in-out").
Custo: M

### UX-04 · A página de ferramenta, do soltar ao resultado
- [ ] Alternativa A — um retângulo de altura fixa com a Oli num canto só; o resultado é a água que subiu, as opções recolhem num "Ajustar", o antes e depois abre sob demanda, o erro diz o caso e a ferramenta certa, e a lista do juntar mora no retângulo, com a lixeira e o desfazer em cada linha (recomendado)
- [ ] Alternativa B — o arquivo vira um papel com a dobra, que afunda e volta; bandeja ao lado da folha no computador e abas embaixo dela no celular; a folha do juntar mostra as páginas na ordem
- [ ] Nenhuma: fica como hoje
Porquê: a A zera o CLS da interação e põe o Baixar, o Escolher e o Escolher outros arquivos acima do aviso de hoje em pt e es a 360. Os chips ficam a 158 a 182 px do Baixar. Tudo isso sem arquivo novo. Marcar a A também move o 1º anúncio da ferramenta para depois do "Como usar", que a F12 já põe lá (muda regra: os README da DropZone, do ResultCard, do WaterLevel e do BeforeAfter, e o molde da ferramenta do PLANO-FILEORCA).
Custo: G (refaz o molde; pode ir em duas partes: a imagem entre os três primeiros da F13, o juntar depois ou na 13b)

### UX-12 · Calculadoras e QR: o resultado, as tabelas, o erro e os rótulos
- [ ] Alternativa A — o Baixar PDF no card, logo abaixo do número, e todo o resto do protótipo (recomendado)
- [ ] Alternativa B — todo o resto do protótipo, com o Baixar sob o card como hoje (em bloco e com o CSV com verbo), abaixo da dobra a 360
- [ ] Não fazer
Porquê: só com o Baixar no card o número e o PDF ficam acima da dobra a 360 (638–702 px, contra 996–1.094 hoje), e o erro e a Oli deixam de mover o card (muda regra: os README do ResultHero, do Placard e do ExportBar, o molde da calculadora do PLANO-FILEORCA, itens 5 a 7, e a § 117; ScenarioCompare, SplitChart e Button).
Custo: G

### UX-13 · Página de guia: o que medimos e a ferramenta antes da prosa
- [ ] Alternativa A — o molde novo, como no protótipo: a ficha do que medimos, a ferramenta antes da prosa, a assinatura numa linha, o resultado sem empurrar o texto, a tabela com pista e os anúncios pelo mapa (recomendado)
- [ ] Alternativa B — só os consertos locais (assinatura, tabela, link "Open the tool" e caixa reservada), sem mudar a ordem do molde
- [ ] Não fazer
Porquê: o guia é a página que mais esconde a ferramenta (1,81–1,95 telas no celular) e o que mediu; o molde novo põe os dois na primeira tela, sem JS novo.
Custo: G (a Alternativa B é M)

### UX-11 · As peças das ferramentas de PDF
- [ ] Alternativa A — tudo como no protótipo: check na página marcada, anel inteiro, prévia nítida, nota com o ícone info nos dois avisos (mudança de regra na linha do README do OptionGroup), FileCard com o ícone pdf, setas com traço e lábio, "Primeira página" em OptionGroup, Unlock com um cartão (recomendado)
- [ ] Alternativa B — as mesmas peças com setas ghost e a desativada sem fundo (mudança de regra no README do Button), o aviso do Forte em OliMessage, a caixa nativa aceita e o anel por dentro
- [ ] Não fazer
Porquê: fecha 15 pendências de acessibilidade e acabamento do PDF e o D-23 com CSS e poucas linhas, sem cor nova, sem JS novo e sem requisição nova.
Custo: M

### UX-03 · A home com a Oli no centro e os anúncios da área geral
- [ ] Alternativa A — a home começa pelo arquivo: zona "solte qualquer arquivo" com a Oli na borda, que leva o arquivo à ferramenta certa (reusa o "Abrir com"); categorias como papéis com a dobra; 1 arquivo JS novo
- [ ] Alternativa B — o mar por categoria: o H1 com número, a Oli nadando na água, uma faixa por categoria com a borda de onda, a contagem, um número medido e as ferramentas como chips; nenhum JS (recomendado)
- [ ] Nenhuma: fica como hoje
Porquê: a B tira a grade de 37 cartões, põe a Oli e os números no centro e abre espaço para os anúncios da área geral, sem nenhum JS e com as mesmas 4 requisições. Com 345 a 376 palavras, o `gate:prontidao` deixa 2 anúncios por largura; os 3 do protótipo pedem 75 a 105 palavras a mais (decisão avulsa).
Custo: M

### UX-14 · O resultado vai direto para a próxima ferramenta
- [ ] Fazer como no protótipo (recomendado)
- [ ] Não fazer
Porquê: o chip passa a levar o arquivo pela caixa do compartilhar que já existe, e encadear duas ferramentas cai de 5 ações ou mais para 2, sem nada sair do aparelho.
Custo: M

### UX-16 · Ícones próprios por ferramenta
- [ ] Fazer como no protótipo (recomendado)
- [ ] Não fazer
Porquê: 27 ícones na grade de hoje acabam com a repetição (a home en vai de 21 para 35 ícones nos 37 cartões, um por cartão em cada hub) e trocam o "upload" da DropZone pelo arquivo que desce para a água (muda regra: o item 4 do README da DropZone, `upload` vira `file-drop`).
Custo: P

### UX-15 · O mar nos hubs e no tema escuro
- [ ] Alternativa A — o aquário na faixa dos hubs (água, crista da categoria e a Oli `swim`) e a linha d'água no ResultCard, no ResultHero e no rodapé, sem cor nova (recomendado)
- [ ] Alternativa B (hubs) — somar à A a cena por categoria em SVG inline (mudança de regra: "Nenhuma imagem de fundo")
- [ ] Alternativa B (escuro) — somar à A o mar à noite, com `--proposta-mar-noite` e `--proposta-crista` (mudança de regra: "`deep` igual nos dois temas")
- [ ] Não fazer
Porquê: a A resolve a G-05, a G-07 e a G-21 só com tokens e a onda que o rodapé já tem; as duas B mudam regra por um ganho menor e podem vir depois.
Custo: M

### UX-17 · Páginas institucionais e rodapé
- [ ] Alternativa A: rodapé com um details por categoria e a coluna da direita com uma peça da própria página (recomendado)
- [ ] Alternativa B: rodapé em duas colunas simples e a coluna centrada quando não há lateral
- [ ] Não fazer
Porquê: o rodapé A corta de 54 a 61 % da altura no celular (o B, de 6 a 31 %), já com os links à vista em 48 px, e a coluna da própria página ocupa os 484 px vazios sem tirar o texto da linha do logo; as duas metades podem ser escolhidas em separado (muda regra: o README do Footer e "Layout e anúncios").
Custo: M

### UX-18 · Soltar o arquivo em qualquer lugar da página
- [ ] Alternativa A: soltar em qualquer parte do conteúdo, sem véu e sem tocar nos anúncios (recomendado)
- [ ] Alternativa B: véu opaco na tela inteira durante o arrasto (cobre os anúncios do site; mudança de regra da Oli a 150 px)
- [ ] Não fazer (a F13 ainda corrige o cursor com `dropEffect = 'none'` fora da ilha)
Porquê: hoje o cursor diz "copiar" na página inteira e o arquivo solto fora da zona some em silêncio; no guia do HEIC a 1280, a zona é uma faixa de 46 a 72 px na primeira tela.
Custo: P

## Decisões avulsas

Escolhas que o README deixa para você e que não são um item inteiro (revisão da F10, d-08). Cada uma diz a run; sem marca, vale a regra da run (F11 e F12: a recomendada; F13: não entra).

### A conta do `gate:prontidao` (UX-07, F12)
- [ ] Por largura: as caixas que cada largura mostra, com as 150 palavras por caixa (recomendado)
- [ ] Como hoje: todas as caixas do HTML; o mapa encolhe para palavras ÷ 150 caixas por página
Porquê: contando todas as caixas do HTML, 111 das 181 páginas reprovariam; por largura, nenhuma no celular, e no computador a lateral 2 só entra com 600 palavras (seção 8, § 361). A regra de uma tela de texto por anúncio que aparece não muda.

### As unidades do AdSense (UX-07, F12, e o Victor no painel)
- [ ] Uma por posição: 37, que você cria à mão no AdSense (recomendado)
- [ ] Menos unidades: a posição sem ID não aparece
Porquê: a ajuda do AdSense não diz se a mesma unidade pode repetir na página; uma por posição separa o relatório e não arrisca a regra. As 15 da seção B cobrem uma posição por área e formato.

### A lateral enquanto a água sobe (UX-07, F12)
- [ ] Fica, a 150 px ou mais da coluna: "ao lado do WaterLevel" é a menos de 150 px, a leitura desde a F1b (recomendado)
- [ ] Some enquanto o WaterLevel está na tela (a caixa fica, sem CLS): a leitura literal do README do WaterLevel
Porquê: a § 20 e o `ads.spec.ts` já tratam "ao lado" como a menos de 150 px; esconder a lateral no processamento não muda o desenho, só um teste e algumas linhas de CSS.

### A vinheta (UX-07, o Victor, no painel do AdSense)
- [ ] Desligar os "gatilhos adicionais" da vinheta (recomendado)
- [ ] Deixar ligados: uma vinheta pode aparecer durante o processamento
Porquê: desde 9/mar/2026 eles vêm ligados por padrão (o botão Voltar, 30 s parado, a volta à aba, o fim do artigo), e "nada no processamento" é regra de "O que não muda".

### O texto da página de apoio (UX-05, F12)
- [ ] O da seção C, como está (recomendado)
- [ ] Sem a primeira metade ("Ads cover the costs;"), como em `support.html?texto=ajuste`
Porquê: a § 362 lê "nenhum texto liga doação a anúncio" como "a doação não compra, não troca e não tira anúncio", e a frase da seção C não faz isso; a versão curta tira qualquer dúvida.

### O card do café em português (UX-05, F12)
- [ ] Um botão só, o Pix; o Ko-fi fica ao lado do Pix na página de apoio (recomendado)
- [ ] Os dois botões da seção C, "Me ajude com um café (Ko-fi)" e "Pagar um café no Pix"
Porquê: a seção C lista os dois rótulos; no card, dois botões seriam três alvos de 52 px no celular, ao lado do Baixar e do Começar de novo (§ 368). É desvio da seção C.

### O botão "Já desativei, recarregar" (UX-06, F12)
- [ ] O `fo-btn--brand` (recomendado; muda a regra do Button/README, que o reserva ao "Escolher arquivos")
- [ ] O botão padrão com lábio, sem mudar a regra
Porquê: o primário de marca diz "esta é a saída" sem ser amarelo, e a página atrás fica inerte e coberta pela água; o site já usa o `fo-btn--brand` fora da DropZone (no Juntar e no Remove password).

### O texto da home B (UX-03, F13, só com o UX-03 B marcado)
- [ ] A F13 escreve de 75 a 105 palavras a mais no `<main>` da home, uma frase por faixa, para os 3 anúncios por largura (recomendado)
- [ ] A home B fica com 2 anúncios por largura
Porquê: a home B tem 345 a 376 palavras; o `gate:prontidao` pede 450 para 3 caixas (seção 8).

## Pendências de design e acessibilidade

As 37 pendências: as 29 dos grupos 5 e 6 do `PENDENCIAS.md` (13 e 16) e as 8 avulsas, cada uma com o destino recomendado e a run na linha. Como os itens da F13, uma pendência sem marca não entra na F13. O detalhe de cada uma está na seção 6 do README (o estado reconferido no código, a proposta e o UX-NN ou o teste). Marque o destino que você quer. A F13 tira do `PENDENCIAS.md` as que forem feitas e as descartadas.

- [ ] F4 ACE-9: corrigir as calculadoras na F13 (recomendado) · aceitar e registrar — `th scope="row"` sem o sticky e a região com o nome do título; a parte dos guias (cabeçalho repetido) é do UX-13.
- [ ] F4 ACE-11: corrigir na F13 (recomendado) · aceitar e registrar — o problema marca o campo do pagamento como o erro de faixa marca o dele.
- [ ] F4 ACE-8: corrigir na F13 (recomendado) · aceitar e registrar — "Download CSV" com verbo visível e o cronograma com nome fixo; só `aria-expanded` muda.
- [ ] F7 obs 1: corrigir na F13, por último (recomendado) · aceitar e registrar — o id estável da linha é barato, mesmo que só a automação chegue à corrida.
- [ ] F3 f-06: corrigir na F12, junto com a c-04 (recomendado) · corrigir na F13, com o UX-09 — é o mesmo script do consentimento, com um teste no cookie-footer.spec.ts; editar o arquivo uma vez.
- [ ] F5a D-6: corrigir na F13 (passo fixo para + = - _, Shift só nas setas, ajuda nova) (recomendado) · aceitar e registrar — num teclado dos EUA o "+" já vem com Shift e cresce 10 pontos.
- [ ] F5a D-7: corrigir na F13 com o check na página marcada (recomendado) · aceitar e registrar — hoje só a cor e a espessura da borda dizem que a página está marcada (WCAG 1.4.1).
- [ ] Idiomas R2-03: corrigir na F13 (recomendado) · aceitar e registrar — uma descrição escondida com os anos, sem mudar o rótulo visível nem a dobra.
- [ ] F5a D-8: corrigir na F13 com o nome em até duas linhas no Juntar (recomendado) · aceitar e registrar a medida nova (28 a 31 caracteres a 360) — nomes parecidos saem iguais a 360.
- [ ] F5a D-9: corrigir na F13 com o anel do sistema inteiro e a região viva (recomendado) · anel por dentro — o anel é cortado na borda e fica em 2,6:1 no escuro sobre a página.
- [ ] F5a D-10: corrigir na F13 com as frases novas (recomendado) · aceitar e registrar — o leitor de tela ouve o rótulo do botão, não o que aconteceu.
- [ ] F5a D-11: corrigir na F13 (recomendado) · aceitar e registrar — a pegada fica depois do Tab, e a senha errada joga o foco no Start over; com o UX-04 A marcado, o Juntar perde a alça e o teste cobre só a grade do Organizar.
- [ ] F5a D-12: corrigir na F13 tirando o --sm das peças de PDF (recomendado) · regra de 48 px só abaixo de 768 px — 40 px contra o tap-min; o Copiar do Pix fica com a F12.
- [ ] F5a F-5: corrigir na F13 com a prévia na largura da caixa (recomendado) · aceitar e registrar — a página onde a pessoa decide onde assinar sai borrada.
- [ ] F5a F-6: corrigir na F13 com o ícone pdf (recomendado) · miniatura da página 1 — o quadrado vazio parece uma imagem que não carregou.
- [ ] F5a F-7: corrigir na F13 (recomendado) · aceitar e registrar — uma linha de CSS tira o entalhe escuro da dobra.
- [ ] F5a F-8: corrigir na F13 (recomendado) · aceitar e registrar — uma regra, o espelho do que o FileCard já faz.
- [ ] F5a F-10: corrigir na F13 com a nota nos dois avisos (recomendado) · o Forte em OliMessage, como o README do OptionGroup escreve — aviso é brand-soft com o ícone info pela regra de Cor.
- [ ] F5a F-11: corrigir na F13 com o OptionGroup "Primeira página" (recomendado) · aceitar e registrar a caixa nativa — é a única caixa nativa do site, e o sistema já tem a peça para escolha de dois.
- [ ] F5a F-13: corrigir na F13 (recomendado) · aceitar e registrar — o arquivo aparece duas vezes no momento de maior frustração.
- [ ] F5a F-14: corrigir na F13 (recomendado) · aceitar e registrar — a barra, o trilho e a ajuda quebram mal a 360.
- [ ] F5b F-2: corrigir na F13, com o UX-13 (recomendado) · aceitar e registrar — a pista de CSS puro (o traço tracejado na borda onde a tabela continua e "Role para o lado" no celular) mostra que há mais coluna, sem JS e sem coluna fixa
- [ ] F5b F-12: corrigir (recomendado) · com o cartão de guia do UX-02 (F11), também nas relacionadas
- [ ] F5b F-13: corrigir na F13, com o UX-13 (recomendado) · descartar e levar para a run de texto — uma data só na assinatura, região e tabela com nomes diferentes, sem a coluna igual nas 10 linhas e com a câmera uma vez por grupo
- [ ] F7 f-9: corrigir na F13 (recomendado) · alargar a coluna do QR — o tamanho sempre na 2ª linha, sem o ponto, e o botão com 60 px.
- [ ] F7 f-13: corrigir na F13 (recomendado) · o trilho em coluna a 320 px — "Normal", "Shade" e "Sun", com a nota do que cada um muda.
- [ ] F7 obs 2: corrigir na F13 com a data curta (recomendado) · cartões abaixo de 480 px — a data nunca quebra entre o mês e o dia, e a tabela não rola de lado.
- [ ] F7 obs 3: corrigir na F13 (recomendado) · aceitar e registrar — rótulos curtos na Paint e a seta do menu medida no teste.
- [ ] Idiomas E-2: corrigir na F13 pela folga da etiqueta (recomendado) · encurtar a tradução — com a fonte de reserva, o rótulo fica com 20 px nos dois navegadores.
- [ ] F3 d-02: corrigir pela saída A, dentro da UX-10, na F13 (recomendado) · saída B, um controle "Pausar animações" com localStorage — a saída A tira o laço sem JS e sem um controle que a pessoa precisa achar
- [ ] F7 e-1: descartar (recomendado) · já resolvida pela § 305; tirar do PENDENCIAS
- [ ] F4 ACE-7: aceitar e registrar num § (recomendado) · pôr os opcionais antes do resultado no DOM — a ordem do DOM é a do celular, e o Tab agora volta a um botão só.
- [ ] F7 f-10: corrigir, sem Baixar desligado no QR e nas calculadoras (recomendado) · aceitar e registrar num § que emenda o Button — o lugar do botão diz por quê, na mesma altura.
- [ ] ajuste-aviso-espaco: corrigir junto com o UX-09, na F13 (recomendado) · aceitar e registrar a § 106 como está — o card de 360 × 128 cobre 2 links do rodapé a 1280, contra 6 a 7 hoje, sem código além do UX-09.
- [ ] F4-F7 e-2: corrigir (recomendado) · pelo UX-04, com o teste do CLS da interação
- [ ] F4-F7 f-1: corrigir pela saída (a), o aviso compacto do UX-09, na F13 (recomendado) · aceitar e registrar (c) — a 360 × 740 o "Escolher" do pt passa de 32 para 0 de 60 px coberto; a 320 × 640 o pt e o es esperam a UX-04.
- [ ] F4-F7 f-2: corrigir (recomendado) · pelo H1 com a largura da coluna (UX-04) e o teste da dobra
