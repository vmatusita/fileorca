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
