# Anúncios, prontidão, GA4 e Pix

O que as runs aprenderam sobre os anúncios, a prontidão para o AdSense, o GA4 e o Pix, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F3: revisão e prontidão

O `gate:prontidao` (`scripts/gates/prontidao.ts`, com a lógica em `scripts/lib/prontidao.ts`) entra no `verificar` na parte `--sem-playwright`. Ele confere se o site está pronto para o pedido do AdSense (DECISOES § 95).

- **O que confere.** Faz dois builds extras do mesmo código em `.cache/prontidao/`: `client`, só com o ID de teste `ca-pub-0000000000000000`, e `all`, com as três variáveis. Confere também o `dist/` real. São 18 itens:
  - a meta tag e o `ads.txt` exatos;
  - o carregador só nas ferramentas;
  - nada de anúncio sem o ID;
  - as seis páginas obrigatórias nos três idiomas e no rodapé;
  - o Contato e a Privacidade com o que o AdSense pede;
  - nenhum texto de obra nem ID de mentira;
  - cartões e busca só do registro;
  - H1, título e descrição próprios;
  - 60 palavras no `<main>` e 150 palavras por AdSlot;
  - `robots.txt`, `noindex` e sitemaps.
- **O `dist/` fica intacto.** O registro do bundle (`.cache/bundle-modules.json`) é devolvido depois de cada build.
- **Como acrescentar um item.** Escreva uma função `check…(site: Site): Row[]` no `scripts/lib/prontidao.ts` e chame-a no portão. No `tests/unit/prontidao.test.ts`, ponha um controle positivo (o site de mentira do `makeSite()` passa) e um negativo para cada quebra. A linha do `ads.txt` fica escrita à mão no portão, a partir da ajuda do AdSense, e nunca sai do `adsTxt()` do site.
- **Reuso.** O `robots.txt` é conferido por `robotsProblems()` (`scripts/lib/seo-checks.ts`), o `_headers` é lido por `headerBlocks()` e `patternApplies()` (`scripts/lib/headers-file.ts`), e o texto visível vem de `visibleText()` (`scripts/lib/conteudo.ts`).

Pegadinhas que a F3 achou:

- Navegador na produção só com `context.route` abortando os domínios do Google (`google`, `googletagmanager`, `google-analytics`, `doubleclick`, `gstatic`, `googlesyndication`), para a visita não entrar no GA4. A prévia em `*.workers.dev` nem pede o `gtag.js`.

## F6: português e espanhol

O Pix: a chave aleatória está em `src/platform/pix.ts` (uma linha, copiada do `docs/F0-SAIDA.md`). O gerador reproduz o exemplo do manual e os quatro códigos do `fixtures/pix.json` (`tests/unit/pix.test.ts`); o QR é desenhado no build com o `qrcode` e lido de volta com o `jsqr` em cada SVG do `dist/pt/apoie/` (`tests/unit/pix-qr.test.ts`). A troca de valor é CSS (`:has(:checked)`) e o copiar é um script inline; o "Copiar código" manda o `donate_click` com o lugar `pix`.

## F10: o mapa de anúncios

Pegadinhas que a F10 achou ao medir o mapa (`docs/propostas/ux-v2/ad-map.html`, DECISOES § 351, § 360 e § 361):

- **A margem de 150 px do `.fo-ad` não colapsa na grade do `.fo-main`** (gap de 16 px). Cada caixa de conteúdo soma 616 px ao `<main>`, e o vizinho fica a 166 px.
- **A lateral, a 1280 px, fica a 29 px dos botões de idioma e de busca do cabeçalho** (y 84), e o menu de idioma aberto (`position: fixed`) cai em cima dela. O `ads.spec.ts` não põe o cabeçalho nos alvos. Ponha `.fo-header a`, `.fo-header button` e os popovers, e dê à lateral um `padding-top` de 150 px.
- **O `gate:prontidao` conta toda caixa `fo-ad fo-ad--` do HTML,** mesmo a escondida por CSS naquela largura (150 palavras por caixa).
- **O multiplex a 1280 px:** a coluna tem 758 px, então o `ins` tem `floor(758 × 0,6)` = 454 px, e a caixa, 498 px com o rótulo. A 360 px, o carregador dá 1 coluna × 6 linhas: 1.666 px, que nenhum molde cabe em 30 %.
- **Para medir a densidade,** grave o `fo-consent`, espere `#fo-tool-root[data-hydrated="true"]` e meça com a ferramenta em repouso. A seção "O que medimos" dos guias de dinheiro não tem `data-content`, só o `h2#measured`.
- **A vinheta do AdSense tem "gatilhos adicionais" ligados por padrão desde 9/mar/2026:** o botão Voltar, 30 s parado, a volta à aba e o fim do artigo. Eles podem pôr uma vinheta durante o processamento, e desligar é do Victor, no painel.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **A folha do Menu abre no topo da página e precisa terminar 150 px acima do 1º AdSlot:** a 360 px, o do Merge PDF e do Unlock PDF fica em y 796, e a folha em inglês termina em y 629,5 (§ 388). Linha nova na folha, ou anúncio mais alto num molde: rode o bloco do cabeçalho do `ads.spec.ts`, que mede as 178 páginas com área de anúncio.
- **Abaixo de 768 px, a folha tem a mesma altura em toda largura, mas o 1º AdSlot sobe quando o texto da página quebra menos:** o do Merge PDF e do Unlock PDF fica em y 796 até 384 px e em y 776 a partir de 390 px. Com as linhas de 52 px, a folha ficava a 146,5 px dele de 390 a 767 px, e o teste, que media só 360 e 1280 px, não via. Por isso o bloco do cabeçalho mede também 767 px, a largura em que os dois mais se aproximam, e as linhas passaram a 48 px (revisão F11 D-1, § 404).
