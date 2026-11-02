# Product Hunt do FileOrca

Rascunho para o Victor. Nada foi enviado: nenhuma conta, nenhum post, nenhum agendamento saiu da run F5b. Leitura das regras em 1/nov/2026.

Os textos que vão para fora estão em inglês. As explicações estão em português.

## Leia antes de usar

1. **O Product Hunt não quer comentário escrito por IA.** As diretrizes de comentário dizem que a comunidade quer conversar com pessoas reais e pedem "No LLMs or Chrome extensions". Este arquivo foi redigido com ajuda de IA. Use o primeiro comentário como **roteiro de fatos** e reescreva com as suas palavras. O mesmo vale para as respostas às perguntas. A tagline e a descrição também: escolha e ajuste como você falaria.
2. **O texto só afirma o que a run prova.** Cada afirmação técnica está ligada a um teste na seção "Provas". Se um teste deixar de passar, a frase sai.
3. **Nunca peça voto.** Nem a amigos, nem em rede social, nem por mensagem. Pedir para visitar e comentar é permitido; pedir upvote, sorteio ligado a voto e voto pago derrubam o lançamento.
4. **As contagens do produto são conferidas por teste.** `tests/unit/launch-kit.test.ts` lê este arquivo e compara cada contagem ("8 image tools", "12 PDF tools"…) com os registros do código. Se uma run mudar uma contagem (a 2b, por exemplo), o teste reprova até este arquivo ser atualizado. Mesmo assim, confira no dia em <https://fileorca.com/>.

## Regras que importam (resumo em português)

Fontes lidas em 1/nov/2026 (só páginas do próprio Product Hunt):

- Launch Guide, índice: <https://help.producthunt.com/en/collections/19793093-launch-guide>
- How Product Hunt works: <https://help.producthunt.com/en/articles/17734306-1-how-product-hunt-works>
- What kind of products get featured: <https://help.producthunt.com/en/articles/17734341-2-what-kind-of-products-get-featured>
- Set your goals and pick your launch date: <https://help.producthunt.com/en/articles/17734355-3-set-your-goals-and-pick-your-launch-date>
- Build your product page: <https://help.producthunt.com/en/articles/17834537-4-build-your-product-page>
- How to promote your launch (and what to avoid): <https://help.producthunt.com/en/articles/17734384-5-how-to-promote-your-launch-and-what-to-avoid>
- What to do during and after your launch: <https://help.producthunt.com/en/articles/17734397-6-what-to-do-during-and-after-your-launch>
- Launch FAQ and myths: <https://help.producthunt.com/en/articles/17734646-8-launch-faq-and-myths>
- Preparing for launch: <https://www.producthunt.com/launch/preparing-for-launch>
- Product Hunt Launch Guide: <https://www.producthunt.com/launch>
- How can I get access to post?: <https://help.producthunt.com/en/articles/481909-how-can-i-get-access-to-post>
- Resolving Account Restrictions: <https://help.producthunt.com/en/articles/11869621-resolving-account-restrictions>
- Community Guidelines: <https://help.producthunt.com/en/articles/3615694-community-guidelines>
- Commenting Guidelines: <https://help.producthunt.com/en/articles/10030102-commenting-guidelines>
- Fair voting: <https://help.producthunt.com/en/articles/11869098-how-does-product-hunt-ensure-fair-voting-and-prevent-spam-or-vote-manipulation>
- Ad campaigns: <https://help.producthunt.com/en/articles/7950405-ad-campaigns>
- Featuring Guidelines: <https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines>
- Logo Downloads and Brand Guidelines: <https://www.producthunt.com/branding>

As páginas do Product Hunt recusam acesso automático direto (HTTP 403); foram lidas por um leitor de páginas. Onde duas páginas oficiais discordam, este resumo diz e manda conferir no formulário.

### Quem pode postar

- Qualquer pessoa com conta pessoal pode enviar um produto. Conta de empresa ou de marca não posta, não vota e não comenta.
- Quem envia o próprio produto é ao mesmo tempo "hunter" e "maker". O Product Hunt recomenda que o maker lance o próprio produto: não há vantagem em usar um hunter de fora.
- O perfil precisa parecer de uma pessoa: nome e sobrenome, foto da pessoa e uma bio de indivíduo. **Use a sua foto no perfil, não a Oli.** A Oli entra na miniatura e na galeria do produto.
- Uma página antiga ("How can I get access to post?") fala em esperar uma semana depois de criar a conta para poder postar. A página mais nova ("How Product Hunt works") só pede e-mail verificado. **Conferir no formulário.** Se a conta for nova, crie-a com uma semana de folga.

### O dia do lançamento

- Todo lançamento entra no ar às **12:01 AM, horário do Pacífico**, na data agendada, e fica no dia até a meia-noite do Pacífico. A página "Build your product page" diz "midnight"; a página de datas diz 12:01. Use 12:01.
- **Em novembro, 12:01 AM no Pacífico é 5h01 em Brasília.** O horário de verão dos EUA acabou em 1/nov/2026, e o Pacífico está em UTC−8; Brasília fica em UTC−3 o ano todo. O dia vai das 5h01 de terça às 5h00 de quarta em Brasília.
- Dá para agendar de amanhã até 30 dias à frente. Um post agendado não recebe voto antes da hora.
- O ranking do dia muda com upvotes, comentários, tempo desde o lançamento e outros sinais. A equipe do Product Hunt escolhe à mão o que vai para a página principal ("featured"). Pontos são upvotes mais engajamento real.
- **Quando lançar:** a ficha manda a primeira terça depois do merge da F5b. Se o merge sair em 2/nov/2026 (segunda), a primeira terça é **3/nov/2026**, mas o agendamento precisa ser feito até 2/nov, e 3/nov é dia de eleição nos EUA. Se não der, a terça seguinte é **10/nov/2026, às 5h01 de Brasília**.

### O que é proibido

- Pedir upvote, em qualquer canal.
- Concurso ou sorteio ligado a voto.
- Pagar por voto, comentário, hunter ou tráfego.
- Spam: mensagem em massa, lista de e-mails comprada ou raspada, a mesma mensagem colada para desconhecidos.
- Contas falsas ou extras, anéis de voto, bots.
- Comentário de autopromoção nos posts dos outros.
- Anúncio do próprio Product Hunt durante o lançamento.
- Burlar a checagem de produto duplicado.
- Votos de contas recém-criadas quase não mexem no ranking, e o Product Hunt remove o que não for genuíno.

### Texto gerado por IA

- As diretrizes de comentário pedem conversa entre pessoas e nenhum comentário de LLM ou extensão de navegador. O primeiro comentário do maker é um comentário: **escreva você**.
- Nenhuma página lida fala de IA no nome, na tagline, na descrição ou nas imagens. A regra do kit continua a mesma: o Victor reescreve.

### Campos e limites

| Campo | Limite | Onde |
| --- | --- | --- |
| Nome | 40 caracteres, só o nome | Build your product page |
| Tagline | 60 caracteres, sem exagero | Preparing for launch; Build your product page |
| Descrição | 500 caracteres | Preparing for launch; Build your product page |
| Launch tags (tópicos) | obrigatórias, até 3 | Preparing for launch; Build your product page |
| Links | sem encurtador e sem UTM no link do produto | Preparing for launch |
| Miniatura | quadrada, 240 × 240 recomendado; GIF vale e anima ao passar o mouse; **até 2 MB** (uma página diz 3 MB, outra 2 MB: use 2 MB e confira no formulário) | Preparing for launch; Build your product page |
| Galeria | 1270 × 760 recomendado; GIF vale; cada imagem abaixo de 3 MB; precisa de 2 ou mais imagens para aparecer na página (outra página diz "pelo menos 1": confira no formulário) | Preparing for launch; Build your product page |
| Vídeo | opcional, só link do YouTube | Preparing for launch |
| Preço | free, paid, ou paid com plano grátis ou teste | Preparing for launch |
| Primeiro comentário | até 5.000 caracteres, com negrito, listas e links | Build your product page |

### A marca do Product Hunt

- O logo do Product Hunt não pode ser alterado (cor, proporção, orientação) e serve para citar o Product Hunt em artigo ou impresso. Nenhuma imagem deste kit usa o logo, o gato, um selo ou as cores do Product Hunt, e nenhuma sugere endosso.
- Escreva sempre "Product Hunt", com P e H maiúsculos.

## Nome, tagline e descrição

Os números entre parênteses são a contagem de caracteres do texto exato do bloco, feita pelo `tests/unit/launch-kit.test.ts` (que reprova se o número ou o limite não baterem).

**Nome (8 caracteres):** `FileOrca`

Taglines (limite de 60):

- **(55)** `Image, PDF and money tools that never upload your files`
- **(56)** `Free file tools that run in your browser, with no upload`
- **(55)** `Compress, convert and merge files right in your browser`

Por que a primeira: diz as três áreas e a diferença, sem adjetivo nem número. A segunda põe "free" na frente, que é verdade e é o que o visitante procura. A terceira troca a categoria pelas ações mais buscadas.

**Descrição A (443 caracteres):**

```
FileOrca is a set of free tools for everyday files, and the work happens in your browser: your files are not uploaded. Compress, resize, crop and convert images (HEIC, WebP, PNG, JPG), merge, split, compress and sign PDFs, and work out a mortgage or a debt payoff plan. There are 8 image tools, 12 PDF tools and 14 money calculators, plus 15 guides, 10 of them with numbers measured on real test files. No sign-up: open a tool and drop a file.
```

**Descrição B (313 caracteres):**

```
Free image, PDF and money tools that run in your browser. Your files are not uploaded: the work happens on your device, and you can see it in the Network tab. 8 image tools, 12 PDF tools, 14 money calculators and 15 guides, 10 of them with measured numbers. No sign-up, and a batch of files comes back as one ZIP.
```

Por que a A: começa pelo que é e pela diferença, lista o que dá para fazer com os nomes que as pessoas buscam (HEIC, WebP) e termina no que a pessoa faz primeiro. A B é a curta, para quando a página de produto já mostrar a lista na galeria.

## Tópicos

Escolha até 3 no formulário. Sugestões, pela ordem: **Productivity**, **Privacy**, **Photography**. Os nomes exatos das tags não estão nas páginas lidas: confira no formulário e escolha os mais próximos. Se houver uma tag de ferramentas grátis ou de PDF, ela pode trocar a terceira.

## Primeiro comentário (rascunho em inglês, em primeira pessoa)

Poste como o primeiro comentário, logo que o lançamento entrar no ar. Reescreva com as suas palavras: o Product Hunt não quer comentário de IA.

**Primeiro comentário (1544 caracteres):**

```
Hi Product Hunt! I'm Victor, a developer in Curitiba, Brazil, and I built FileOrca on my own.

FileOrca does the work in your browser: you can make a photo smaller or turn an iPhone HEIC into a JPG without uploading it.

What you can do today:
- Images: compress, resize, crop, rotate, HEIC to JPG, WebP to JPG, PNG to JPG, and images into one PDF. 8 image tools and 3 presets for common limits.
- PDFs: merge, split, compress, PDF to JPG, sign, add or remove a password, watermark, page numbers and more. 12 PDF tools.
- Money: a mortgage calculator, refinance, loans, debt payoff and others. 14 money calculators.
- 15 guides: 10 file guides with numbers measured on real test files with the same tools, and 5 money guides worked out by the engines of the calculators.

How it works: the site is static. The tools run in your browser, with WebAssembly codecs that load the first time you need them. Your file is not uploaded: open the Network tab in your browser's developer tools, use a tool, and you will see that no request carries it. After the page and the codec for your type of file have loaded, the tool keeps working if you go offline.

There is no account. You can drop one file or a whole batch, paste with Ctrl+V, and get a batch back as one ZIP.

How it pays for itself: ads from Google AdSense, outside the tools, and an optional Ko-fi link.

I would love your feedback: what file did you try, did it work, and what tool is missing? If something fails, tell me the browser, the device and the file type, and I will look into it.
```

Notas sobre o texto:

- As afirmações técnicas do comentário são as da seção "Provas": o arquivo não é enviado (Network tab), a ferramenta segue funcionando offline depois que a página e o codec do tipo de arquivo carregaram, os anúncios fora das ferramentas, o Ko-fi, a ausência de conta, o lote com Ctrl+V e ZIP, e as contagens dos registros. O `tests/unit/launch-kit.test.ts` reprova uma frase técnica em inglês que não contenha uma das frases provadas.
- O comentário não conta a história de como o site nasceu: a run não sabe essa história. Se quiser contá-la, escreva com as suas palavras, sem falar de outros sites.
- "measured" vale só para os 10 guias de arquivo. Os 5 guias de dinheiro têm os números calculados pelos motores das calculadoras, sem arquivo de teste.
- A frase "ads from Google AdSense" só vale **se os anúncios estiverem ligados no dia**. Se não estiverem, troque por "Ads are not on yet. When they are, Google AdSense will pay the costs. There is also an optional Ko-fi link."
- O comentário não diz se o código é aberto. Veja a pergunta abaixo.
- A exclamação do "Hi Product Hunt!" é do tom do site, mas reescreva como você cumprimentaria.

## Perguntas prováveis (roteiro de resposta, em inglês)

Só use o que for verdade no dia. Responda curto, com curiosidade e sem comparar para ganhar.

- **"How do you make money?"** "Ads from Google AdSense, kept away from the tools, and an optional Ko-fi link. There is no paid plan." (Se os anúncios ainda não estiverem ligados, diga isso e que o AdSense vai pagar os custos quando estiverem. Provas 9 e 10.)
- **"Why no upload? Isn't a server faster?"** "The work happens in your browser, so your file never leaves your device. Private photos and documents stay private, and there is no server holding copies." (Não diga que é mais rápido: a run não mediu velocidade. Prova 1.)
- **"Are there limits?"** "You can drop a whole batch at once, or paste it with Ctrl+V. A very large photo or a very long PDF can be too much for the memory of an older phone." (Não invente um número. Prova 8.)
- **"Which browsers?"** "Every tool is tested automatically in Chromium and in WebKit. I have not tested other browsers, so tell me if something fails in yours." (Afirme só os dois motores que os testes cobrem: o teste do kit reprova o nome de outro navegador. Prova 4.)
- **"Is it open source?"** Se o repositório público do motor de imagem existir no dia, responda com o link dele: "The image engine is open source: <link>." Se não existir, **esta linha sai**: diga com franqueza que o site não é código aberto e que o que é verificável é a aba Network e as licenças em <https://fileorca.com/licenses/>.
- **"What about my data / analytics?"** "Your files are never sent. The site uses Google Analytics with Consent Mode, only on fileorca.com, and there is a cookie notice with Accept and Decline." Não diga que recusar desliga o Analytics. (Provas 1 e 11.)

## Imagens

Geradas por `pnpm lancamento:imagens` (`scripts/lancamento/imagens.ts`), fora do `pnpm verificar`, a partir do `dist/` servido (sem o aviso de cookies) e do `docs/design/` (tokens, fontes, a Oli nas poses `wave` e `cheer`, e o logo). Cores só dos tokens; o amarelo só aparece no botão Download dos screenshots. As imagens saem sem metadados da máquina (o script grava só os blocos de imagem do PNG e do GIF). O `tests/unit/launch-kit.test.ts` confere que cada arquivo listado existe, tem o tamanho e o peso da tabela e cabe no limite.

<!-- imagens: a tabela abaixo é reescrita pelo script -->
| Arquivo | Uso | Tamanho | Peso | Legenda (texto alternativo) |
| --- | --- | --- | --- | --- |
| `thumbnail.png` | Miniatura (estática) | 240 × 240 | 9.954 bytes | The Oli, the FileOrca orca, waving on a round patch of sea. |
| `thumbnail.gif` | Miniatura (animada) | 240 × 240 | 235.811 bytes | The Oli floating and waving, then jumping in a cheer, on a round patch of sea. |
| `gallery-1.png` | Galeria | 1270 × 760 | 108.535 bytes | The FileOrca home page: the heading and the cards of the image tools. Caption: "Image, PDF and money tools that run in your browser". |
| `gallery-2.png` | Galeria | 1270 × 760 | 151.226 bytes | HEIC to JPG with two iPhone photos converted: the result card, its Download button and the list of files. Caption: "HEIC to JPG: iPhone photos as JPGs, without uploading them". |
| `gallery-3.png` | Galeria | 1270 × 760 | 115.062 bytes | Compress PDF with a PDF of photos: the result card with the size before and after, and its Download button. Caption: "Compress PDF: a PDF of photos made much lighter". |
| `gallery-4.png` | Galeria | 1270 × 760 | 75.557 bytes | The guide "Why is my PDF so large?": its table of what takes the space in each test PDF, in pictures, fonts and everything else. Caption: "File guides with numbers measured on our test files". |
| `gallery-5.png` | Galeria | 1270 × 760 | 165.127 bytes | The mortgage calculator with its example filled in: the fields and the monthly payment. Caption: "Money calculators that keep your numbers on your device". |
<!-- fim das imagens -->

## Provas

Cada afirmação técnica do kit tem um teste que passa no `pnpm verificar` da run F5b (relatório em `docs/relatorios/fase-05b.md`). As frases entre aspas no título de cada item são as frases provadas: o `tests/unit/launch-kit.test.ts` reprova uma frase técnica dos textos em inglês (sobre envio, offline, navegadores, anúncios, Analytics, conta e lote) que não contenha uma delas, e uma prova cujo arquivo de teste não exista.

1. **"not uploaded" / "never upload your files" / "without uploading" / "no request carries it" / "never sent" / "never leaves your device" / "in your browser".** Nenhum byte do arquivo sai do navegador.
   - **Prova:** `tests/e2e/launch-claims.spec.ts`, no Chromium e no WebKit, na Compress image, na HEIC to JPG, na Image to PDF, na Compress PDF, na PDF to JPG, na Protect PDF e, desde a F5b, dentro de dois guias (HEIC to JPG e Compress PDF embutidas). Da carga da página até o download, cada requisição da página e dos workers é um GET para a própria origem, sem corpo e sem query string.
   - **Também:** `tests/e2e/image-privacy.spec.ts`, `tests/e2e/pdf-privacy.spec.ts` e `tests/e2e/tool-guides.spec.ts` (o nome do arquivo só aparece no nome do download).
2. **"the tool keeps working if you go offline".** Só depois que a página e o codec do tipo de arquivo carregaram (a frase do `docs/lancamento/show-hn.md`); o teste do kit reprova a frase de offline que não fale do codec.
   - **Prova:** o mesmo `tests/e2e/launch-claims.spec.ts`: depois do primeiro arquivo, `context.setOffline(true)`, e o segundo arquivo, que usa o mesmo codec do primeiro, é processado e baixado sem nenhuma requisição de rede. Um arquivo que precise de outro codec (na Compress PDF, um PDF de fotos depois de um PDF de texto) não está provado offline.
3. **"WebAssembly codecs that load the first time you need them".**
   - **Prova:** `tests/e2e/budgets.spec.ts`: nenhuma página de ferramenta ou guia pede um worker ou um `.wasm` antes do primeiro arquivo, e cada uma carrega dois arquivos de JavaScript.
4. **"tested automatically in Chromium and in WebKit".** Só esses dois motores: o teste do kit reprova o nome de outro navegador (Chrome, Edge, Firefox, Safari) nos textos em inglês.
   - **Prova:** `playwright.config.ts` (os dois projetos) e as partes do CI, que rodam a suíte inteira nos dois motores.
5. **"10 of them with numbers measured on real test files" / "10 of them with measured numbers" / "10 file guides with numbers measured on real test files" / "File guides with numbers measured on our test files".** "measured" vale só para os 10 guias de arquivo; os 5 guias de dinheiro têm os números calculados pelos motores das calculadoras no build.
   - **Prova:** `tests/unit/guides-measured.test.ts` (cada número dos 10 guias de arquivo vem de `data/guides-measured.json`, com amostra, método e data), `tests/unit/guides-numbers.test.ts` (nenhum algarismo à mão) e `tests/unit/calc-guides.test.ts` (os guias de dinheiro contra o motor e o oráculo). O `tests/unit/launch-kit.test.ts` reprova "measured" junto de outra contagem.
6. **As contagens** (8 image tools, 3 presets, 12 PDF tools, 14 money calculators, 15 guides, 10 file guides, 5 money guides).
   - **Prova:** `tests/unit/launch-kit.test.ts` compara cada contagem deste arquivo com os registros (`src/tools/image/registry.ts`, `src/tools/pdf/registry.ts`, `src/tools/calc/registry.ts`, `src/tools/guides/registry.ts`).
7. **"There is no account" / "No sign-up".**
   - **Prova:** `tests/unit/routes.test.ts`: a lista de rotas é a do mapa, nenhuma página fica fora dele, e nenhum caminho nem página é de conta, login, cadastro ou perfil ("has no page of an account").
8. **"paste with Ctrl+V" / "paste it with Ctrl+V" / "a whole batch" / "as one ZIP".**
   - **Prova:** `tests/e2e/image-batch.spec.ts` ("one ZIP with unique names that opens…", "more than 6 files show 6 rows…" e "takes every image of the clipboard as one batch…"), no Chromium e no WebKit.
9. **"outside the tools" / "kept away from the tools".**
   - **Prova:** `tests/e2e/ads.spec.ts`: nenhum AdSlot dentro do `#fo-tool-root`, nada a menos de 150 px do painel, dos campos, do Baixar e da Oli, e nada acima da ferramenta no celular, em cada ferramenta e guia, em repouso, processando e com resultado.
10. **"an optional Ko-fi link".**
    - **Prova:** `tests/e2e/coffee.spec.ts`: a linha do Ko-fi aparece só no terceiro uso, some com "Don't show this again" e não aparece com o consentimento recusado.
11. **"Google Analytics with Consent Mode, only on fileorca.com" / "a cookie notice with Accept and Decline".**
    - **Prova:** `tests/e2e/consent.spec.ts` ("consent defaults come before config…", "Accept/Decline updates consent…" e "no gtag.js and no request to Google outside fileorca.com") e `tests/e2e/consent-choice.spec.ts`.
12. **"keep your numbers on your device".** A legenda da galeria 5.
    - **Prova:** `tests/e2e/money-privacy.spec.ts` ("no typed number leaves the device"), em cada calculadora e guia de dinheiro.

<!-- contagens: image-tools=8 image-presets=3 pdf-tools=12 calculators=14 guides=15 file-guides=10 money-guides=5 -->

## O que ficou fora do texto de propósito

- Velocidade medida, "fastest", "best", "#1" e qualquer comparação com outras ferramentas.
- Depoimento, número de usuários ou de arquivos processados.
- Service worker, app instalável e "works like an app".
- "Open source" sem o link do repositório público no ar.
- Tamanho máximo de arquivo: o limite real depende do aparelho, e a run não mediu um número que valha para todos.
- Afirmações sobre o Safari de verdade: os testes rodam no WebKit do Playwright, não no Safari.

## Checklist do dia

### Antes (até a véspera)

- [ ] Conta pessoal com foto sua, nome e bio de pessoa. Se for nova, criada com uma semana de folga.
- [ ] Reescrever a tagline, a descrição e o primeiro comentário com as suas palavras.
- [ ] Conferir em <https://fileorca.com/> as contagens (8, 3, 12, 14, 15) e se os anúncios estão ligados; ajustar a frase do dinheiro.
- [ ] Conferir se o repositório público do motor existe; se não, apagar a resposta de código aberto com link.
- [ ] Subir a miniatura (`thumbnail.gif`, ou `thumbnail.png` se o formulário recusar o GIF) e de 3 a 5 imagens da galeria, na ordem da tabela.
- [ ] Link do produto: `https://fileorca.com/`, sem UTM e sem encurtador.
- [ ] Preço: Free. Até 3 tags.
- [ ] Agendar para a terça escolhida, às 12:01 AM do Pacífico (5h01 de Brasília).

### No dia

- [ ] Postar o primeiro comentário logo que o lançamento entrar no ar.
- [ ] Ficar disponível e responder a cada comentário, mesmo ao negativo, com curiosidade.
- [ ] Contar do lançamento onde você já fala com as pessoas, pedindo para **ver e comentar**, nunca para votar.

### O que não fazer

- Não pedir upvote, nem de forma indireta ("um apoio aqui").
- Não mandar DM em massa nem a mesma mensagem para desconhecidos.
- Não criar conta extra nem pedir a alguém que crie.
- Não pagar por voto, comentário, hunter ou tráfego.
- Não comprar anúncio do Product Hunt para o dia.
- Não colar comentário escrito por IA.
- Não apagar e relançar: um novo lançamento em menos de dois meses pede pedido de relançamento.

### Depois

- Anotar no `docs/lancamento/README.md` a data, o link, a posição e o que aprendeu.
