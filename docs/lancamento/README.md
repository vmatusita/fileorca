# Lançamento do FileOrca: textos prontos

Rascunhos feitos na run F3 para o Victor enviar **à mão**. **Nada foi enviado**: nenhum formulário, conta, e-mail ou post saiu desta run (regra do CLAUDE.md, "Fora de toda run").

Data das leituras: **31/out/2026**. Contagens do produto: **8 ferramentas de imagem e 3 presets**, conferidas em `src/tools/image/registry.ts` e em <https://fileorca.com/image-tools/> na mesma data. Desde a F17 (10/nov/2026, a run 2b), **10 ferramentas de imagem e 3 presets**: entraram o AVIF to JPG e o Convert to WebP.

## O que é cada arquivo

| Arquivo | O que tem | Idioma |
| --- | --- | --- |
| `README.md` | Este guia: ordem, checklist, avisos | Português |
| `show-hn.md` | Título (com contagem e variações), URL a enviar, primeiro comentário, regras do HN resumidas, respostas a perguntas prováveis, seção "Provas" | Português + inglês |
| `alternativeto.md` | Campos do formulário, descrição curta e longa, tags, plataforma, licença, lista "alternativa a" com o que o FileOrca substitui e o que não | Português + inglês |
| `diretorios.md` | 10 diretórios e listas conferidos, texto pronto de cada um, lista de pagos, lista de excluídos e dos que não abriram | Português + inglês |
| `blogs-financas.md` | 20 blogs de finanças pessoais dos EUA (F4): contato, post recente, artigo em que a calculadora ajuda, ângulo, rascunho do e-mail, status, descartados e resultado do LanguageTool | Português + inglês |
| `codigo-aberto.md` | Passo a passo para criar o repositório público do motor de imagem (F5a): o que vai e o que não vai, nome, descrição e tópicos sugeridos, primeiro push, como atualizar, o que responder a "é código aberto?" | Português + inglês |
| `product-hunt.md` | Kit do Product Hunt (F5b): regras lidas na fonte com a data, nome, 3 taglines e 2 descrições com a contagem de caracteres, tópicos, primeiro comentário, perguntas prováveis, imagens com legenda, tamanho e peso, provas e checklist do dia | Português + inglês |
| `product-hunt/` | Miniatura em PNG e GIF (240 × 240) e 5 imagens da galeria (1270 × 760), geradas por `pnpm lancamento:imagens` | Imagens |

## Leia primeiro: três avisos

### 1. O AlternativeTo provavelmente vai recusar

O FAQ do AlternativeTo (<https://alternativeto.net/faq>, seção "Why wasn't my software / app approved?", lida em 31/out/2026) diz que uma coleção ou suíte de ferramentas online simples é recusada pelo mesmo motivo de cada ferramenta ser recusada sozinha. Cita conversores e editores de foto entre os exemplos recusados. O FileOrca é uma coleção de ferramentas simples de imagem. **A chance de aprovação é baixa.**

O texto fica pronto mesmo assim, porque tentar custa pouco. Não pague a revisão prioritária: o FAQ diz que ela só adianta a fila e não compra aprovação.

### 2. Os textos foram redigidos com ajuda de IA

- O Hacker News proíbe texto gerado nos posts e texto gerado ou editado por IA nos comentários. **Reescreva o título e o primeiro comentário com as suas palavras.** Use o rascunho como lista de fatos.
- A lista awesome-privacy (Lissy93) exige que o uso substancial de IA seja declarado e não aceita envio que não seja escrito por pessoa. Veja a entrada 8 de `diretorios.md`.
- O AlternativeTo e os diretórios não dizem nada a respeito, mas a regra é a mesma: escreva você.

### 3. As afirmações do texto dependem das provas da run

O Show HN só pode afirmar três coisas técnicas, e a run F3 prova cada uma em `docs/relatorios/fase-03.md`, seção "Provas do Show HN":

1. Nenhum byte do arquivo sai do navegador.
2. Depois de a página e o codec carregarem, a ferramenta segue funcionando offline.
3. O único tráfego de terceiros é o Google Analytics (com Consent Mode, só em fileorca.com).

Se alguma prova não passar, tire a frase correspondente de **todos** os textos desta pasta, não só do Show HN. As descrições do AlternativeTo e dos diretórios dizem "not uploaded", que é a afirmação 1.

## Ordem e quando enviar

| Quando | O que | Quanto tempo |
| --- | --- | --- |
| Depois do merge da F3 (mesmo dia) | AlternativeTo e os diretórios (`alternativeto.md`, `diretorios.md`) | De 2 a 3 h no total |
| No dia seguinte ao merge da F3, **antes de ligar os anúncios** | Show HN (`show-hn.md`) | 15 min para postar e as primeiras horas para responder |
| Depois do merge da F5a | Repositório público do motor de imagem (`codigo-aberto.md`) | Cerca de 1 h |
| Na primeira terça depois do merge da F5b, às 12:01 AM do Pacífico (5h01 de Brasília em novembro) | Product Hunt (`product-hunt.md` e `product-hunt/`) | Agendar na véspera; no dia, ficar disponível nas primeiras horas para responder |

Por que o AlternativeTo vem primeiro: a fila de revisão é longa e sem prazo. Por que o Show HN vem antes dos anúncios: o texto promete que os anúncios ainda não estão ligados, e quem lê o HN vai olhar a página com atenção.

Estimativa das 2 a 3 h: o AlternativeTo leva cerca de 1 h (conta, e-mail verificado, ícone, formulário). Os quatro primeiros diretórios de `diretorios.md` levam cerca de 1 h. Os seis últimos são opcionais e de baixa chance.

## Checklist para o Victor

### Antes de qualquer envio

- [ ] **Busca reversa da imagem da Oli** (Google Lens, TinEye ou busca visual do Bing) e anotar o resultado onde você guarda as pendências da F0. O ícone do app (`docs/design/assets/Logo/app-icon.svg`) e o AlternativeTo mostram o rosto da Oli, e o Show HN leva muita gente ao site.
- [ ] **Conferir no dia que os números de ferramentas ainda batem com o site**: 11 ferramentas e 4 presets em <https://fileorca.com/image-tools/> e em `src/tools/image/registry.ts`. A 2b entrou na F17, e as listas já foram atualizadas (veja "Linhas que mudam com a 2b").
- [ ] Ler a seção "Provas do Show HN" de `docs/relatorios/fase-03.md` e confirmar que as três provas passaram.
- [ ] Conferir se os anúncios continuam desligados. Se ligou antes do post, ajuste a frase "Ads are not on yet" em todos os textos.
- [ ] O aviso de cookies do site hoje fala em "ads to keep FileOrca free". O comentário do HN diz que os anúncios ainda não estão ligados. Não é contradição, mas alguém pode apontar. Decida se ajusta o aviso ou responde com franqueza.
- [ ] Abrir <https://fileorca.com/image-tools/> numa janela anônima e conferir que o aviso de cookies não cobre a ferramenta e que dá para usar sem cadastro.
- [ ] Decidir a resposta para "é código aberto?". Nenhum texto desta pasta afirma nada sobre isso. Alguém vai perguntar no HN. Depois do merge da F5a, o motor de imagem pode ficar aberto (MIT) e o site não: veja `codigo-aberto.md`, seção "Perguntas que vão aparecer".
- [ ] Reescrever o título e o primeiro comentário do HN com as suas palavras (aviso 2).

### Show HN (dia seguinte ao merge da F3)

- [ ] Ter conta própria no HN. Não crie contas só para isso (as diretrizes dizem que contas descartáveis são para casos sensíveis).
- [ ] Enviar como história, com o título que começa por "Show HN:" e a URL de `show-hn.md`.
- [ ] Postar o primeiro comentário logo depois.
- [ ] **Estar disponível para responder nas primeiras horas.** Reserve um bloco de tempo sem outras tarefas.
- [ ] **Nunca pedir voto**, nem a amigos, nem em rede social, nem por mensagem. O Show HN e as diretrizes proíbem.
- [ ] Não apagar e repostar. Se precisar falar com os moderadores, o e-mail é hn@ycombinator.com.
- [ ] Anotar aqui o resultado: data, link, o que aprendeu.

### AlternativeTo (depois do merge da F3)

- [ ] Criar a conta e verificar o e-mail.
- [ ] Preparar o ícone quadrado de 280×280 ou maior, PNG ou SVG com fundo transparente.
- [ ] Preencher o formulário com `alternativeto.md` (sem links, e-mails nem UTM na descrição).
- [ ] Não pagar a revisão prioritária.
- [ ] Se aprovado: sugerir o FileOrca como alternativa nas páginas de TinyPNG, Squoosh, iLoveIMG e Compressor.io; pensar bem em CopyTrans HEIC.
- [ ] Se recusado: anotar o motivo e não reenviar com outro nome.

### Diretórios (depois do merge da F3)

- [ ] Abrir cada página de envio de novo antes de preencher (regras e preços mudam).
- [ ] Enviar na ordem de `diretorios.md`: entradas 1 a 4 primeiro. Parar e ver se há visita antes de seguir.
- [ ] Abrir no navegador os que deram 403 (SaaSHub, Indie Hackers, Peerlist, Slant) e decidir.
- [ ] Ler as regras reais do r/InternetIsBeautiful e do r/SideProject se for postar (a ferramenta de leitura não abriu o Reddit).
- [ ] Marcar o status de cada diretório em `diretorios.md` ("enviado em AAAA-MM-DD").
- [ ] Não contratar nenhum plano pago de diretório.

## Regras de spam (resumo)

- Não entra diretório que vende link dofollow, troca de links, exige selo ou backlink seu, vende "envio a N diretórios" ou depende de votos.
- Não se envia para dezenas de diretórios de uma vez. A política de spam de links do Google lista compra e venda de links para ranking, troca excessiva de links e links de diretórios de baixa qualidade: <https://developers.google.com/search/docs/essentials/spam-policies#link-spam> (lida em 31/out/2026).
- O link é consequência do envio, nunca o objetivo.

## Linhas que mudam com a 2b

Quando a run "2b" entrar (Convert to WebP/AVIF e AVIF to JPG), estas linhas mudam. Cada uma tem um comentário `<!-- muda com a 2b -->` no arquivo.

**A F17 (10/nov/2026) mudou essas linhas:** a 2b entrou, as listas e as contagens dos três arquivos passaram a dizer o que o site faz hoje (o AVIF to JPG e a conversão de JPG e PNG para WebP e AVIF), e os comentários `<!-- muda com a 2b -->` saíram das linhas mudadas. A tabela abaixo fica como registro do que mudou. O `product-hunt.md` também mudou: "8 image tools" virou "10 image tools", com as contagens de caracteres refeitas.

**A F18 (11/nov/2026) mudou de novo:** entraram o Remove EXIF data e o Organize PDF (ferramentas) e o Flip image, o Extract pages from PDF e o PDF to PNG (presets). As contagens passaram a 11 ferramentas de imagem, 4 presets de imagem e 13 de PDF no `product-hunt.md` (o primeiro comentário passou de 1.586 para 1.648 caracteres, com o flip, o Remove EXIF data e as páginas de PDF nas listas), e as listas de ferramentas do `show-hn.md`, do `alternativeto.md` (a descrição longa passou de 748 para 785 caracteres) e do rascunho do Reddit no `diretorios.md` ganharam as novas. O Show HN cita o Remove EXIF data só pelo nome: o que a saída deixa de levar não entra nas três afirmações permitidas dele (DECISOES § 740).

| Arquivo | O que muda |
| --- | --- |
| `show-hn.md` | Lista "What is there today", parágrafo "What comes next" (sai WebP/AVIF), título (a segunda variação fica incompleta) |
| `alternativeto.md` | Descrição curta (lista de ações, reconte os 150 caracteres), primeiro parágrafo da longa, notas "ainda não faz AVIF" de TinyPNG e Squoosh, lista de alternativas (entram conversores de AVIF) |
| `diretorios.md` | Todo texto pronto que lista as ações: entradas 1 a 10, o corpo do r/SideProject e o "No AVIF yet" das entradas 1 e 8 |

Quando as calculadoras (F4) e o PDF (F5) entrarem, a entrada 1 de `diretorios.md` (a lista awesome-no-login-web-apps) deixa de servir: ela não aceita suíte de áreas sem relação.

## Fontes lidas (todas em 31/out/2026)

- Show HN: <https://news.ycombinator.com/showhn.html>
- Diretrizes do HN: <https://news.ycombinator.com/newsguidelines.html>
- FAQ do AlternativeTo: <https://alternativeto.net/faq>
- Páginas de TinyPNG, Squoosh, iLoveIMG, Compressor.io, iMazing HEIC Converter e CopyTrans HEIC for Windows no AlternativeTo (endereços em `alternativeto.md`)
- Política de spam do Google: <https://developers.google.com/search/docs/essentials/spam-policies#link-spam>
- Páginas de envio de cada diretório (endereços e o que cada uma mostrou em `diretorios.md`)

## O que a run F3 fez com esta pasta

- **LanguageTool:** os textos em inglês (os 15 blocos de código dos três arquivos) passaram pelo LanguageTool local, o mesmo servidor do `lint:texto`. Deram 37 apontamentos, nenhum de gramática. São nomes próprios que o dicionário não conhece (FileOrca, Preact, Comlink, MozJPEG, OxiPNG, jSquash, libheif, fflate, pdf-lib, Ko-fi, IPTC, OffscreenCanvas), um "url", um espaço duplo dentro de um bloco YAML e um aviso de estilo (três frases seguidas começando por "I"). O resultado está no relatório da F3.
- **Provas:** as três afirmações do Show HN passaram, e a seção "Provas" de `show-hn.md` aponta cada prova.
- **Show HN:** a frase "Each tool runs in a Web Worker" virou "The image work runs in a Web Worker…", com a ressalva do navegador sem `OffscreenCanvas` no worker, onde o motor roda na página.
- Nenhum portão do `pnpm verificar` lê `docs/lancamento/`.

## Blogs de finanças (depois do merge da F4)

A run F4 deixou em `blogs-financas.md` o contato com **20 blogs de finanças pessoais dos EUA** (o número da ficha; o arquivo diz quais encaixam melhor e quais são frágeis). Cada blog tem a página de contato, um post recente, um artigo dele em que uma das calculadoras ajuda o leitor, o ângulo e o rascunho do e-mail em inglês. As páginas foram lidas em **31/out/2026**. **Nada foi enviado**: nenhum e-mail, formulário, conta ou comentário saiu da run. Os rascunhos foram redigidos com ajuda de IA: reescreva cada um com as suas palavras.

### Ordem de envio

Só depois do merge da F4, do deploy e da conferência das páginas no ar.

| Quando | O que | Quanto tempo |
| --- | --- | --- |
| Dia do merge da F4 | Conferir as páginas no ar (checklist abaixo) e pedir a indexação do hub e da Mortgage no Search Console | Cerca de 1 h |
| De 1 a 2 dias depois | Onda 1, os seis de maior encaixe e contato mais limpo: White Coat Investor, A Wealth of Common Sense, Debt Discipline, Clever Girl Finance, Wallet Hacks, Millennial Wealth (no máximo 3 por dia) | Cerca de 1 h |
| De 3 a 5 dias depois | Onda 2: Physician on FIRE, My Money Blog, Making Sense of Cents, Retire by 40, Budgets Are Sexy, Financial Samurai | Cerca de 1 h |
| De 6 a 8 dias depois | Onda 3: Lazy Man and Money, ESI Money, Jill on Money e Rob Berger (prioridade B) | Cerca de 1 h |
| De 9 a 11 dias depois | Onda 4, só se as ondas anteriores deram resposta ou se sobrar vontade: Early Retirement Now, Bible Money Matters, Of Dollars And Data e Humble Dollar (prioridade C) | 30 min |
| 10 dias depois do primeiro envio | Um lembrete só por blog, curto, e só para quem não respondeu e tem e-mail público. Depois disso, deixe quieto | 15 min |

Por que em ondas: a primeira resposta mostra se o texto funciona, e dá para ajustar as ondas seguintes. Por que não todos de uma vez: são 20 pessoas que não conhecem o FileOrca, e um lote igual parece lista de envio em massa. Estimativa total, com a reescrita dos e-mails: de 2 a 3 h.

### Checklist para o Victor

**Antes de qualquer envio**

- [ ] O merge da F4 e o deploy de produção aconteceram. Abrir cada URL citada nos rascunhos e conferir que devolve 200 e que a página faz o que o e-mail diz: `/mortgage-calculator/`, `/mortgage-calculator/extra-payments/`, `/mortgage-calculator/biweekly/`, `/mortgage-calculator/15-vs-30-year/`, `/refinance-calculator/`, `/auto-loan-calculator/`, `/home-affordability-calculator/`, `/rent-vs-buy-calculator/`, `/credit-card-payoff-calculator/`, `/debt-payoff-calculator/`, `/compound-interest-calculator/`, `/savings-goal-calculator/` e os guias `/guides/refinance-break-even/`, `/guides/rent-vs-buy-break-even/` e `/guides/extra-mortgage-payments/`.
- [ ] Abrir `/mortgage-calculator/` no celular: mudar os números, tocar em "Copy link", abrir o link noutra aba e ver os mesmos números; baixar o PDF e o CSV. Anotar o que cada página exporta e ajustar nos rascunhos as frases "PDF" e "PDF or CSV".
- [ ] Ler no relatório da F4 que o teste de privacidade passou (nenhum número vai para `?` na URL, para evento do GA4 nem para requisição). Se não passou, tire de **todos** os textos as frases "the numbers stay on the device" e a do "Copy link", como na regra das provas do Show HN, acima.
- [ ] Se a válvula da F4 cortou alguma calculadora que um rascunho cita, tire a frase. Nenhum rascunho cita as três que a válvula pode cortar (consolidação de dívidas, juros simples, APR para APY).
- [ ] A caixa `contato@fileorca.com` envia e recebe (mande um teste para você) e a resposta chega a você.
- [ ] Reescrever cada e-mail com as suas palavras. Manter o detalhe do artigo do blog e conferir de novo que o artigo ainda diz aquilo.
- [ ] No dia de cada envio, abrir de novo a página de contato do blog (regras mudam), ver que o post citado continua lá e ler a política de guest post ou de patrocínio, se houver.
- [ ] Abrir no navegador os contatos que a run não conseguiu ler: Debt Discipline e Millennial Wealth (e-mail protegido ou ofuscado), Early Retirement Now e Bible Money Matters (e-mail em imagem) e Wallet Hacks (a página manda usar o primeiro nome do autor no domínio).
- [ ] Millennial Wealth e Rob Berger: rodar na página o cenário do artigo do blog ($400,000, 30 anos, 6,71% com $75 extras; aporte de $208.33 por mês, 45 anos, 9,8%) e ver se o resultado é parecido com o do texto dele antes de dizer qualquer coisa sobre o número. Os rascunhos só citam os números dos artigos deles.

**Em cada envio**

- [ ] Um e-mail por vez, em texto simples, sem anexo, sem imagem de rastreio, sem parâmetro UTM nos links e sem cópia oculta para vários.
- [ ] No máximo 3 envios por dia.
- [ ] Nos blogs com formulário (Clever Girl Finance, Physician on FIRE, My Money Blog, Budgets Are Sexy, Lazy Man and Money, Rob Berger e Humble Dollar; Jill on Money tem formulário e e-mail, e o e-mail é melhor): ler os termos do formulário, colar o texto no campo da mensagem e informar `contato@fileorca.com` como e-mail. Enviar o formulário é ação sua.
- [ ] Nunca pedir link, menção, post ou resenha. O rascunho só avisa que a ferramenta existe e diz isso numa frase.
- [ ] Marcar o status em `blogs-financas.md` (de "não enviado" para "enviado em AAAA-MM-DD").

**Depois**

- [ ] Se o blog responder, responda você mesmo, em poucas linhas. Se pedirem preço, anúncio, "link placement" ou guest post com link: **recuse com educação**. Não entra link pago, troca de links, guest post em troca de link, nem lista ou site que vende link: são as práticas que a política de spam de links do Google trata como spam (<https://developers.google.com/search/docs/essentials/spam-policies#link-spam>, lida em 31/out/2026).
- [ ] Se o blog citar uma calculadora, não peça texto nem âncora específicos. Se alguém apontar erro de conta, pare os envios, guarde o cenário (o "Copy link") e abra uma run de correção.
- [ ] Se alguém pedir para não receber mais mensagens, anote no `blogs-financas.md` e não escreva de novo.
- [ ] Registrar o resultado na linha do blog: respondeu, citou, recusou ou ficou sem resposta.

### O que a run F4 fez com `blogs-financas.md`

- **Leituras:** cerca de 125 sites e newsletters tentados em duas passadas e 20 aprovados; a seção "Descartados" do arquivo lista o resto e o motivo. Para cada um dos 20, a run abriu com o WebFetch a página de contato, um post recente, o artigo relevante e o que o blog diz sobre guest post, patrocínio e link.
- **LanguageTool:** os 20 rascunhos em inglês passaram pelo LanguageTool local (versão 6.6, `en-US`, servidor na porta 8095, o mesmo jar do `lint:texto`). Zero apontamentos de gramática. O resultado completo está no fim de `blogs-financas.md`.

## Código aberto (depois do merge da F5a)

A run F5a deixou o motor de imagem pronto para virar um repositório público sob a licença MIT. **Nada foi criado nem enviado**: nenhum repositório, nenhum push, nenhum `npm publish` (regra do CLAUDE.md, "Fora de toda run"). O passo a passo está em `codigo-aberto.md`.

### Ordem

Só **depois do merge da F5a** na `main`, porque o pacote exportado é o motor como ele está na `main` (com os endereços dos `.wasm` passados em tempo de execução, o mesmo código no site e no pacote).

| Quando | O que | Quanto tempo |
| --- | --- | --- |
| Dia do merge da F5a | `pnpm motor:exportar --conferir` na `main` e ler o resultado: tem de dar zero | Cerca de 5 min |
| No mesmo dia ou depois | Criar `vmatusita/fileorca-image-engine` no GitHub, dar o primeiro push da pasta exportada e conferir a página (`codigo-aberto.md`) | Cerca de 1 h |
| Antes do Show HN | Decidir a resposta para "é código aberto?" (a checklist acima): o motor de imagem é, o site não | 5 min |
| A cada mudança em `src/engine/image/` | Exportar de novo para o clone e dar o push (`codigo-aberto.md`, "Como atualizar depois") | Cerca de 15 min |

Por que não antes do merge: a F5a muda o motor (o carregamento dos `.wasm`) e acrescenta o exportador. Um pacote exportado de uma branch mais antiga não teria nenhum dos dois.

### Checklist para o Victor

- [ ] A F5a está mesclada e o CI da `main` está verde.
- [ ] `pnpm motor:exportar --conferir` terminou com `zero` (precisa de rede).
- [ ] Li o README, o THIRD-PARTY-NOTICES e o `fixtures/SOURCES.md` do pacote exportado.
- [ ] Repositório criado vazio (sem README, `.gitignore` nem licença do GitHub), público, com a descrição e os tópicos sugeridos.
- [ ] Primeiro push feito por mim, com a tag `v0.1.0`. O GitHub mostra "MIT license".
- [ ] Não publicar no npm agora: o pacote é código-fonte TypeScript sem build.
- [ ] Atualizar a resposta de "é código aberto?" nos textos do Show HN, se for usá-la. O campo de licença do AlternativeTo continua **Proprietary** (é do site).

## Product Hunt (depois do merge da F5b)

A run F5b deixou em `product-hunt.md` o kit do lançamento no Product Hunt, e em `product-hunt/` as imagens. As regras foram lidas nas páginas do próprio Product Hunt em **1/nov/2026**. **Nada foi enviado**: nenhuma conta, post ou agendamento saiu da run. Os textos foram redigidos com ajuda de IA, e o Product Hunt não aceita comentário escrito por IA: reescreva o primeiro comentário e as respostas com as suas palavras.

### Checklist para o Victor

- [ ] Ler `product-hunt.md` inteiro, começando por "Leia antes de usar".
- [ ] Conferir no dia as contagens (11 ferramentas de imagem, 4 presets de imagem, 13 de PDF, 14 calculadoras, 15 guias) e se os anúncios estão ligados.
- [ ] Criar ou conferir a conta pessoal, com a sua foto (a Oli fica só no produto).
- [ ] Pôr o link do repositório público do motor só se ele estiver no ar.
- [ ] Agendar para a primeira terça depois do merge, às 12:01 AM do Pacífico.

### O que a run F5b fez com esta pasta

- **Um teste passa a ler esta pasta.** O `tests/unit/launch-kit.test.ts`, que roda no `pnpm verificar`, confere em `product-hunt.md` as contagens do produto contra os registros, a contagem de caracteres de cada texto contra os limites lidos, e cada imagem listada (tamanho, peso, legenda e nenhum metadado da máquina). A frase "Nenhum portão do `pnpm verificar` lê `docs/lancamento/`", da seção da F3, deixou de valer para o `product-hunt.md`.
- **As imagens** saem de `pnpm lancamento:imagens` (fora do `verificar`), a partir do `dist/` e do `docs/design/`. Depois de qualquer mudança visual no site, rode de novo e commite as imagens com a tabela que o script reescreve.
- **As provas** do kit somam às do Show HN os guias (dois casos novos no `launch-claims.spec.ts`) e o spec `tool-guides.spec.ts`.
