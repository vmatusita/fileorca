# Show HN do FileOrca

Rascunho para o Victor. Nada foi enviado. Leitura das regras em 31/out/2026.

Os textos que vão para fora estão em inglês. As explicações estão em português.

## Leia antes de usar

1. **O Hacker News proíbe texto gerado.** As diretrizes pedem para não pôr texto gerado nos posts e não postar texto gerado ou editado por IA nos comentários. Este arquivo foi redigido com ajuda de IA. Use o primeiro comentário como **roteiro de fatos** e reescreva com as suas palavras antes de postar. O mesmo vale para o título: escolha uma das opções e ajuste a redação como você falaria.
2. **O texto só afirma o que a run prova.** Há três afirmações técnicas permitidas (seção "Provas"). Se a prova de alguma não passar, a frase sai do comentário.
3. **Não pergunte nem peça voto.** Nem a amigos, nem em rede social, nem por mensagem. O Show HN proíbe pedir a amigos que votem ou comentem.
4. **A run "2b" entrou na F17 (10/nov/2026):** as listas de ferramentas e as contagens deste arquivo já trazem o AVIF to JPG e a conversão para WebP e AVIF, e os comentários `<!-- muda com a 2b -->` saíram. Confira a lista a olho no dia do post.

## Regras que importam (resumo em português)

Fontes lidas em 31/out/2026:

- Show HN: <https://news.ycombinator.com/showhn.html>
- Diretrizes: <https://news.ycombinator.com/newsguidelines.html>

### Show HN

- É para algo que você fez e que as pessoas podem usar e testar. Tem de ser algo que se roda ou se tem nas mãos.
- Leitura (blog, página de cadastro, newsletter, lista) não vale: não dá para testar.
- O projeto tem de ser seu, não trivial, e você tem de estar disponível para conversar. Projeto gerado às pressas não vale.
- Landing page e vaquinha não valem. Versão nova ou recurso pequeno em geral não vale; uma reformulação grande talvez.
- Se ainda não está pronto para as pessoas usarem, espere.
- O título começa com "Show HN" e o envio é como história (story).
- Facilite o teste, de preferência sem cadastro nem e-mail. O FileOrca atende: sem conta e sem upload.
- Não peça a amigos que votem ou comentem.
- Nos comentários: seja respeitoso, pergunte por curiosidade em vez de interrogar, sugira alternativas em vez de dizer que a pessoa errou. Não precisa fingir que um trabalho fraco é forte, mas evite negatividade desnecessária.

### Diretrizes gerais

- Não use o HN principalmente para promoção. Postar o próprio trabalho de vez em quando é aceito. Se o Show HN for a única coisa que você faz ali, o seu uso do site é principalmente promocional: leia e comente outros posts também.
- Não ponha texto gerado nos posts. Não poste texto gerado ou editado por IA nos comentários.
- Título: sem caixa alta, sem exclamação, sem elogio. Não ponha o nome do site (o HN mostra sozinho). Número só se for relevante.
- Não peça votos, comentários nem envios.
- Não apague e reposte. Apagar é só para o que não devia ter sido enviado.
- Para falar com os moderadores, use o e-mail hn@ycombinator.com, não um comentário.
- Comentários: sem sarcasmo, responda ao argumento e não à pessoa, assuma boa-fé, não acuse de astroturfing nem de shilling. Para ênfase, use asteriscos, não caixa alta.

## Título

Limite: 80 caracteres. Contagem feita com o script `node` (conta os caracteres do texto exato abaixo, com o hífen simples).

**Principal (68 caracteres):**

```
Show HN: FileOrca - Image tools that run in your browser, no uploads
```

Variações:

- **(72)** `Show HN: FileOrca - Image tools in the browser, no account and no upload`
- **(78)** `Show HN: FileOrca - Compress, resize and convert images without uploading them`
- **(78)** `Show HN: FileOrca - HEIC to JPG, compress and resize in the browser, no upload`

Por que o principal: diz o que é ("image tools"), onde roda ("in your browser") e a diferença ("no uploads"), sem adjetivo. A segunda e a terceira trocam a categoria pelas ações mais buscadas (comprimir, redimensionar, HEIC). Nenhuma usa "free", "best" nem número. O nome do produto no título é o padrão do Show HN. O que as diretrizes mandam tirar é o nome do site como sufixo, porque o HN mostra o domínio sozinho.

Com a 2b no ar (F17), os quatro títulos continuam verdadeiros: "convert" cobre a conversão para WebP e AVIF e o AVIF to JPG.

## URL a enviar

**Recomendado: <https://fileorca.com/image-tools/>**

Por quê:

- O título fala de "image tools", e o hub `/image-tools/` é exatamente isso: as onze ferramentas e os quatro presets, cada um com link direto. Quem clica já escolhe e usa.
- A home (`/`) hoje é quase o mesmo hub, mas tem blocos de texto de apresentação ("Your files stay with you") e vai crescer com as calculadoras (F4) e o PDF (F5). O Show HN rejeita landing page, e a home tende a parecer uma.
- Guardar a home deixa a URL livre para um segundo Show HN quando as calculadoras ou o PDF forem uma reformulação grande de verdade.

Alternativa aceitável: <https://fileorca.com/>. Se usar, o título principal continua valendo.

Não recomendado: enviar uma página de ferramenta (por exemplo `/compress-image/`). Facilita o teste, mas esconde que são várias ferramentas.

Antes de enviar, abra a URL em uma janela anônima e confira que o aviso de cookies não cobre a ferramenta no celular. Quem vem do HN vê o aviso primeiro. O comentário já explica o Analytics.

## Primeiro comentário (rascunho em inglês, em primeira pessoa)

Poste como comentário na própria submissão, logo depois de enviar. Reescreva com as suas palavras.

```
Hi HN. I'm Victor, a developer in Curitiba, Brazil. I built FileOrca on my own.

I got tired of image tools that want me to upload a photo to a server just to make it smaller or to turn an iPhone HEIC into a JPG. That work can happen on the device, so I built the tools to do it there.

What is there today:

- Compress, resize, crop and rotate (and mirror) for JPG, PNG and WebP.
- HEIC to JPG or PNG, WebP to JPG or PNG, and PNG to JPG or JPG to PNG.
- AVIF to JPG, and JPG or PNG to WebP or AVIF, with the transparency kept.
- Remove EXIF data from JPG, PNG and WebP.
- Image to PDF, one image per page.
- Presets: 100 KB, 1 MB, a YouTube thumbnail size, and a flip with no rotation.

There is no account and no limit on batch size. You can paste images with Ctrl+V and download the results one by one or as a ZIP.

How it works: the site is static, built with Astro, with Preact islands for the tool panels. The image work runs in a Web Worker, and the page talks to it through Comlink. In a browser whose workers have no OffscreenCanvas, it falls back to the page. The codecs are WebAssembly and load the first time you need them: MozJPEG, OxiPNG, WebP and AVIF from the jSquash packages, and libheif-js for HEIC. I use libheif-js unmodified, and its LGPL code stays in a separate file. ZIP files come from fflate and PDFs from pdf-lib (the @cantoo fork). It is hosted on Cloudflare Workers, serving static files only. There is no server code.

How to check it: no byte of your file leaves your browser. Open the Network tab in DevTools, use a tool, and watch: nothing is uploaded. Also, after the page and the codec load, the tool keeps working offline. Load the page, process one image, turn off your Wi-Fi, and process another one.

About tracking and money: the only third-party traffic is Google Analytics, with Consent Mode, and only on fileorca.com. There is a cookie notice with Accept and Decline. Ads are not on yet. When they are, Google AdSense will pay the costs, and it will add its own requests to the page. There is also an optional Ko-fi link.

I'm here to answer questions. If a file fails, tell me the browser, the device and the format, and I will look at it.
```

Notas sobre o texto:

- As três afirmações técnicas do comentário são as permitidas, nesta ordem: "No byte of your file leaves your browser" (parágrafo "How to check it"), "After the page and the codec load, the tool keeps working offline" (mesmo parágrafo) e "The only third-party traffic is Google Analytics (with Consent Mode, only on fileorca.com)" (parágrafo "About tracking and money"). Mexer na redação é ok; mudar o sentido não.
- A frase "it will add its own requests to the page" é a consequência honesta de ligar o AdSense. Se você ligar os anúncios antes do post, troque o trecho "Ads are not on yet. When they are, ..." por uma frase no presente.
- O aviso de cookies do site hoje cita anúncios ("and ads to keep FileOrca free"). A frase do comentário diz que os anúncios ainda não estão ligados. Isso não é contradição (o aviso fala do que o site vai usar), mas alguém pode apontar. Se quiser evitar a pergunta, ajuste o texto do aviso ou responda com franqueza.
- O comentário não diz se o código é aberto ou fechado. Alguém vai perguntar. Decida a resposta antes de postar (veja "Perguntas prováveis").

## Perguntas prováveis (roteiro de resposta, em inglês)

Só use o que for verdade no dia. Responda curto e com curiosidade.

- **"Is it open source?"** Decida antes. O texto desta pasta não afirma nada sobre isso. Se não for, diga com franqueza e diga o que é verificável (Network tab, licenças em `/licenses/`).
- **"How do you pay for it?"** "Ads are not on yet. When they are, Google AdSense will pay the costs. There is also an optional Ko-fi link."
- **"Why not Squoosh or TinyPNG?"** Não compare para ganhar. "Squoosh is a good tool and runs in the browser too. I wanted batches, a ZIP, HEIC and PDF in one place, with presets for common size limits." (Só diga "batches e ZIP" se for verdade no dia; veja a ferramenta.)
- **"Does it work in Safari or on my phone?"** Responda só do que você testou. Não afirme nada que a run não provou.
- **"What about Google Analytics?"** "It is the only third-party traffic. It runs with Consent Mode and only on fileorca.com, and there is a cookie notice with Accept and Decline. The privacy page has the details." Não diga que recusar "desliga" o Analytics: com o Consent Mode, as tags do Google podem carregar mesmo com o consentimento negado. Só afirme o que a página de privacidade e a run provaram.

## Provas

As três passaram na run F3, e o detalhe está em `docs/relatorios/fase-03.md`, seção "Provas do Show HN". O texto do comentário só pode afirmar o que passou.

1. **"No byte of your file leaves your browser."** O arquivo é lido e processado no aparelho, e nenhuma requisição leva o arquivo. Verificável na aba Network do DevTools.
   - **Prova:** `tests/e2e/launch-claims.spec.ts`, no Chromium e no WebKit, na Compress image (MozJPEG), na HEIC to JPG (libheif) e na Image to PDF (worker do PDF). Da carga da página até o download, cada requisição da página e dos workers é um GET para a própria origem, sem corpo.
   - **Também:** a matriz de fixtures exige zero requisição para fora e zero método diferente de GET em todo lote (`tests/e2e/lib/matrix.ts`).
2. **"After the page and the codec load, the tool keeps working offline."** Carregue a página, use a ferramenta uma vez, desligue o Wi-Fi e use de novo para o próximo arquivo.
   - **Prova:** o mesmo teste. Depois do primeiro arquivo, `context.setOffline(true)`; o segundo arquivo é processado e baixado sem nenhuma requisição de rede, nos dois navegadores e nas três ferramentas.
3. **"The only third-party traffic is Google Analytics (with Consent Mode, only on fileorca.com)."** Os anúncios ainda não estão ligados; quando estiverem, o AdSense paga os custos.
   - **Prova na produção:** em 31/out/2026, com os domínios do Google bloqueados (para não virar visita), a home e um uso real da Compress image em fileorca.com pediram só `fileorca.com` (23 GETs) e `www.googletagmanager.com` (2, o `gtag.js`).
   - **Prova fora da produção:** `tests/e2e/consent.spec.ts` ("no gtag.js and no request to Google outside fileorca.com") e a trava de hostname em `src/analytics/consent.ts`.

## O que ficou fora do texto de propósito

- Service worker, PWA instalável e "funciona como app".
- Código aberto ou licença do código.
- Velocidade medida, "fastest", "best", "#1" e qualquer comparação de qualidade com outras ferramentas.
- Depoimento e número que não foi medido (usuários, arquivos processados).
- "A saída sai sem metadados de foto (GPS, Exif, XMP, IPTC)". É verdade segundo a ficha do produto, mas não está entre as três afirmações permitidas para o Show HN. Se a run provar, vale pôr uma linha no comentário.
- "Nenhum evento do Analytics leva nome de arquivo, conteúdo ou número digitado". Mesmo motivo. Com a prova, pode entrar depois do parágrafo do Analytics.

## Depois de postar

- Fique disponível nas primeiras horas. Responda a cada comentário, mesmo ao negativo, com curiosidade.
- Não peça voto. Se alguém perguntar como ajudar, diga "try it and tell me what breaks".
- Não apague e reposte. Se o post não decolar, deixe como está.
- Se precisar falar com os moderadores (título errado, por exemplo), escreva para hn@ycombinator.com.
- Anote o resultado em `docs/lancamento/README.md` (data, link da submissão, o que aprendeu).
