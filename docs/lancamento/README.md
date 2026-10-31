# Lançamento do FileOrca: textos prontos

Rascunhos feitos na run F3 para o Victor enviar **à mão**. **Nada foi enviado**: nenhum formulário, conta, e-mail ou post saiu desta run (regra do CLAUDE.md, "Fora de toda run").

Data das leituras: **31/out/2026**. Contagens do produto: **8 ferramentas de imagem e 3 presets**, conferidas em `src/tools/image/registry.ts` e em <https://fileorca.com/image-tools/> na mesma data.

## O que é cada arquivo

| Arquivo | O que tem | Idioma |
| --- | --- | --- |
| `README.md` | Este guia: ordem, checklist, avisos | Português |
| `show-hn.md` | Título (com contagem e variações), URL a enviar, primeiro comentário, regras do HN resumidas, respostas a perguntas prováveis, seção "Provas" | Português + inglês |
| `alternativeto.md` | Campos do formulário, descrição curta e longa, tags, plataforma, licença, lista "alternativa a" com o que o FileOrca substitui e o que não | Português + inglês |
| `diretorios.md` | 10 diretórios e listas conferidos, texto pronto de cada um, lista de pagos, lista de excluídos e dos que não abriram | Português + inglês |

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
| Só depois da F5b | Product Hunt | Não é desta run; não há texto aqui |

Por que o AlternativeTo vem primeiro: a fila de revisão é longa e sem prazo. Por que o Show HN vem antes dos anúncios: o texto promete que os anúncios ainda não estão ligados, e quem lê o HN vai olhar a página com atenção.

Estimativa das 2 a 3 h: o AlternativeTo leva cerca de 1 h (conta, e-mail verificado, ícone, formulário). Os quatro primeiros diretórios de `diretorios.md` levam cerca de 1 h. Os seis últimos são opcionais e de baixa chance.

## Checklist para o Victor

### Antes de qualquer envio

- [ ] **Busca reversa da imagem da Oli** (Google Lens, TinEye ou busca visual do Bing) e anotar o resultado onde você guarda as pendências da F0. O ícone do app (`docs/design/assets/Logo/app-icon.svg`) e o AlternativeTo mostram o rosto da Oli, e o Show HN leva muita gente ao site.
- [ ] **Conferir no dia que os números de ferramentas ainda batem com o site**: 8 ferramentas e 3 presets em <https://fileorca.com/image-tools/> e em `src/tools/image/registry.ts`. Se a 2b entrou, atualize as listas (veja "Linhas que mudam com a 2b").
- [ ] Ler a seção "Provas do Show HN" de `docs/relatorios/fase-03.md` e confirmar que as três provas passaram.
- [ ] Conferir se os anúncios continuam desligados. Se ligou antes do post, ajuste a frase "Ads are not on yet" em todos os textos.
- [ ] O aviso de cookies do site hoje fala em "ads to keep FileOrca free". O comentário do HN diz que os anúncios ainda não estão ligados. Não é contradição, mas alguém pode apontar. Decida se ajusta o aviso ou responde com franqueza.
- [ ] Abrir <https://fileorca.com/image-tools/> numa janela anônima e conferir que o aviso de cookies não cobre a ferramenta e que dá para usar sem cadastro.
- [ ] Decidir a resposta para "é código aberto?". Nenhum texto desta pasta afirma nada sobre isso. Alguém vai perguntar no HN.
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
