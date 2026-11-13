# Glossário · português do Brasil

Glossário fixo do FileOrca em português (F6, decisão 3 do prompt; PLANO "Idiomas"). Todo texto do site em português segue este arquivo: as páginas, os painéis, os PDFs e CSVs que o site gera, os nomes de arquivo baixado e os textos escondidos para leitor de tela. O `tests/unit/glossary.test.ts` lê a seção "Nunca" e reprova o termo nos arquivos de texto em português e no HTML das páginas `/pt/` do `dist/`.

Escrito em 1º/nov/2026, antes de qualquer tradução da F6. Mudança neste arquivo pede um § no DECISOES.md. Ampliado no ajuste "idiomas" (3/nov/2026, DECISOES § 317): o QR code e os guias de arquivo. Ampliado na F18 (11/nov/2026, DECISOES § 724 e § 736): as cinco páginas novas, os sufixos delas e a barra da Gerenciar páginas do PDF.

## Registro

- Informal e caloroso, com "você" (docs/design/README, "Voz"). Nunca "tu" nem "vocês" para falar com a pessoa.
- Frases curtas, em sentence case: só a primeira letra maiúscula, fora nome próprio e sigla ("Comprimir imagem", "Juntar PDF").
- Botão começa com verbo no infinitivo e não tem ponto: "Baixar", "Escolher imagens", "Copiar código".
- A Oli fala dela em terceira pessoa, com artigo: "A Oli está cuidando disso…". O site fala com a pessoa.
- Exclamação só no sucesso, uma por tela ("Prontinho!"). A linha do café e a placa não repetem.
- Erro diz o que houve e o que fazer, sem culpar ninguém: "Ops, a Oli não conseguiu ler esse arquivo. Tente um JPG ou PNG."
- Sem emoji, sem "mágica", "revolucionário", "turbinado", "sem esforço", "com IA".
- O benefício é o número: "2,4 MB → 780 KB", "−68%", "você vai pagar R$ 382.637 de juros".
- Português do Brasil, não de Portugal (ver "Nunca").

## Formato de número, moeda e data

| O quê | Como | Exemplo |
| --- | --- | --- |
| Decimal e milhar | vírgula decimal, ponto no milhar, sempre (também com 4 dígitos) | 1.234,56 · 20.000 px |
| Tamanho de arquivo | uma casa abaixo de 100, espaço sem quebra antes da unidade | 2,4 MB · 780 KB |
| Porcentagem | colada no número | 68% · 6,5% ao ano |
| Moeda | "R$", espaço sem quebra, o número | R$ 1.234,56 · R$ 382.637 |
| Data por extenso | dia, "de", mês minúsculo, "de", ano | 1 de novembro de 2026 |
| Data curta (tabela) | dd/mm/aaaa | 01/11/2026 |
| Taxa | sempre com o período | 1,5% ao mês · 12% ao ano |
| CSV | ponto e vírgula separa as colunas, vírgula decimal, sem milhar, BOM UTF-8 | 1896,20;14375,00 |
| PDF do relatório | página A4 | |

As datas de "Revisado em" e "Última atualização" são o dia em Brasília.

## Termos de arquivo

| Inglês | Português | Observação |
| --- | --- | --- |
| file | arquivo | nunca "ficheiro" |
| files | arquivos | |
| image / photo | imagem / foto | |
| batch | lote | "o lote inteiro", "em lote" |
| ZIP | ZIP | "Baixar tudo · ZIP 4,2 MB" |
| Download (botão) | Baixar | o verbo é "baixar"; "download" só como substantivo raro ("cada uma ganha o próprio download") |
| Download all | Baixar tudo | |
| drag and drop | arrastar e soltar | "Solte as imagens aqui" |
| paste | colar | "ou cole com Ctrl V" |
| choose | escolher | "Escolher imagens", "Escolher PDFs" |
| upload (o site não faz) | enviar | "seu arquivo nem sai do aparelho", "sem upload" vale como bordão da marca |
| device | aparelho | "Seu arquivo nem sai do aparelho" |
| browser | navegador | |
| phone | celular | |
| computer | computador | |
| metadata | metadados | "os metadados da foto" |
| GPS location | localização GPS | |
| compression | compressão | "Compressão: Recomendada, Forte" |
| quality | qualidade | |
| lossless | sem perda | |
| page / pages | página / páginas | |
| password | senha | |
| start over | Começar de novo | |
| show N more | Mostrar mais N | |
| waiting / working | Na fila / Trabalhando | |
| Already optimized | Já otimizada (imagem) / Já otimizado (PDF) | |
| to (entre dois tamanhos, escondido) | para | "2,4 MB para 780 KB" no leitor de tela |
| Advertisements | Publicidade | rótulo do AdSlot, a única palavra aceita |

## Ferramentas e opções

| Ferramenta (inglês) | Nome em português | Caminho |
| --- | --- | --- |
| Image tools (hub) | Ferramentas de imagem | /pt/ferramentas-de-imagem/ |
| Compress image | Comprimir imagem | /pt/comprimir-imagem/ |
| Compress to 100 KB | Comprimir imagem para 100 KB | /pt/comprimir-imagem/para-100kb/ |
| Compress to 1 MB | Comprimir imagem para 1 MB | /pt/comprimir-imagem/para-1mb/ |
| Resize image | Redimensionar imagem | /pt/redimensionar-imagem/ |
| YouTube thumbnail | Miniatura do YouTube | /pt/redimensionar-imagem/miniatura-youtube/ |
| Crop image | Cortar imagem | /pt/cortar-imagem/ |
| Rotate image | Girar imagem | /pt/girar-imagem/ |
| Flip image | Espelhar imagem | /pt/girar-imagem/espelhar/ |
| HEIC to JPG | HEIC para JPG | /pt/heic-para-jpg/ |
| WebP to JPG | WebP para JPG | /pt/webp-para-jpg/ |
| PNG to JPG | PNG para JPG | /pt/png-para-jpg/ |
| AVIF to JPG | AVIF para JPG | /pt/avif-para-jpg/ |
| Convert to WebP | Converter para WebP | /pt/converter-para-webp/ |
| Image to PDF | Imagem para PDF | /pt/imagem-para-pdf/ |
| Remove EXIF data | Remover metadados da foto | /pt/remover-metadados-foto/ |
| PDF tools (hub) | Ferramentas de PDF | /pt/ferramentas-pdf/ |
| Merge PDF | Juntar PDF | /pt/juntar-pdf/ |
| Split PDF | Dividir PDF | /pt/dividir-pdf/ |
| Extract pages from PDF | Extrair páginas do PDF | /pt/dividir-pdf/extrair-paginas/ |
| Rotate PDF | Girar PDF | /pt/girar-pdf/ |
| Delete pages | Excluir páginas do PDF | /pt/excluir-paginas-pdf/ |
| Reorder pages | Organizar páginas do PDF | /pt/organizar-paginas-pdf/ |
| Organize PDF | Gerenciar páginas do PDF | /pt/gerenciar-paginas-pdf/ |
| PDF to JPG | PDF para JPG | /pt/pdf-para-jpg/ |
| PDF to PNG | PDF para PNG | /pt/pdf-para-jpg/para-png/ |
| Page numbers | Numerar páginas do PDF | /pt/numerar-paginas-pdf/ |
| Watermark | Marca d'água no PDF | /pt/marca-dagua-pdf/ |
| Sign PDF | Assinar PDF | /pt/assinar-pdf/ |
| Compress PDF | Comprimir PDF | /pt/comprimir-pdf/ |
| Protect PDF | Proteger PDF | /pt/proteger-pdf/ |
| Unlock PDF | Desbloquear PDF | /pt/desbloquear-pdf/ |
| QR code generator | Gerador de QR code | /pt/gerador-de-qr-code/ |

Os formatos ficam como estão: JPG, PNG, HEIC, WebP, AVIF, GIF, PDF, ZIP. O artigo do formato é masculino ("um JPG", "o PDF").

F18 (DECISOES § 724): o Organize PDF em português é "Gerenciar páginas do PDF", porque "Organizar páginas do PDF" já é o nome do Reorder pages, e as duas páginas brigariam pelo mesmo nome no hub e na busca. O Remover metadados da foto fica depois da Imagem para PDF, na ordem do registro e do hub: nenhuma irmã faz o mesmo trabalho (as outras tiram os metadados porque gravam a imagem de novo).

| Opção (inglês) | Português |
| --- | --- |
| Compression · Recommended · Strong · Lossless | Compressão · Recomendada · Forte · Sem perda |
| best balance · smallest | melhor equilíbrio · menor arquivo |
| Resize · By size · By percentage · Width · Height | Redimensionar · Por tamanho · Por porcentagem · Largura · Altura |
| Aspect ratio · Square · Free · Crop area | Proporção · Quadrado · Livre · Área do corte |
| Rotate · Right 90° · Left 90° · 180° · Mirror · None · Horizontal · Vertical | Girar · 90° à direita · 90° à esquerda · 180° · Espelhar · Nenhum · Horizontal · Vertical |
| Save as | Salvar como |
| Page size · Image size · Letter · A4 | Tamanho da página · Tamanho da imagem · Carta · A4 |
| Split by · Every page · Page ranges · Pick pages | Dividir por · Cada página · Intervalos de páginas · Escolher páginas |
| Image format · Resolution · for the screen · general use · for printing | Formato da imagem · Resolução · para a tela · uso geral · para imprimir |
| All pages · Page range · Page by page | Todas as páginas · Intervalo de páginas · Página por página |
| Position · Top left · Top center · Bottom right… | Posição · Em cima à esquerda · Em cima no centro · Embaixo à direita… |
| Format · Page 1 · Page 1 of 12 · 1 of 12 | Formato · Página 1 · Página 1 de 12 · 1 de 12 |
| First number · Skip the first page | Primeiro número · Pular a primeira página |
| First page: Number it · Skip it (F13a, a opção no lugar da caixa) | Primeira página: Numerar · Pular |
| Watermark text · CONFIDENTIAL · Size · Opacity · Light · Direction · Diagonal | Texto da marca d'água · CONFIDENCIAL · Tamanho · Opacidade · Clara · Direção · Diagonal |
| Signature · Draw · Upload · Type · Clear | Assinatura · Desenhar · Imagem · Digitar · Limpar |
| Password · Confirm password · Remove password | Senha · Confirme a senha · Tirar a senha |
| Reverse order | Inverter a ordem |
| Extract pages (o botão da Extrair páginas do PDF) | Extrair páginas |
| Save changes (o botão da Gerenciar páginas do PDF) | Salvar as mudanças |
| Add more PDFs | Adicionar mais PDFs |

## Nome do arquivo baixado

Sem acento, em minúsculas, com hífen (o mesmo nome em todo sistema de arquivos).

| Inglês | Português |
| --- | --- |
| `-merged` | `-juntado` |
| `-split`, `-page-N`, `-part-N`, `-selected` | `-dividido`, `-pagina-N`, `-parte-N`, `-selecionadas` |
| `-compressed` | `-comprimido` |
| `-rotated` | `-girado` |
| `-edited` | `-editado` |
| `-reordered` | `-organizado` |
| `-organized` | `-gerenciado` (F18: `-organizado` já é do Reorder pages, DECISOES § 724) |
| `-extracted` | `-extraido` |
| `-numbered` | `-numerado` |
| `-watermarked` | `-marca-dagua` |
| `-signed` | `-assinado` |
| `-protected` | `-protegido` |
| `-unlocked` | `-desbloqueado` |
| `fileorca-images.zip`, `fileorca-images.pdf` | `fileorca-imagens.zip`, `fileorca-imagens.pdf` |
| `fileorca-pdfs.zip`, `fileorca-pdf-images.zip` | `fileorca-pdfs.zip`, `fileorca-pdf-imagens.zip` |
| `document.pdf` | `documento.pdf` |
| `qr-code.png`, `qr-code.svg` | `qr-code.png`, `qr-code.svg` (o mesmo: "QR code" é o nome do código no Brasil) |

## Dinheiro (calculadoras adaptadas ao Brasil)

| Conceito | Termo | Observação |
| --- | --- | --- |
| installment / monthly payment | parcela | "a primeira parcela", "parcela de R$ 1.896,20"; nunca "prestação mensal" no rótulo |
| balance / loan balance | saldo devedor | "saldo" sozinho só na tabela |
| amortization | amortização | a parte da parcela que abate o saldo |
| interest | juros | sempre no plural ("os juros") |
| interest rate | taxa de juros · juros ao mês · juros ao ano | taxa efetiva, sempre com o período |
| effective rate | taxa efetiva | a única que o site usa (ver as premissas de cada página) |
| down payment | entrada | |
| term | prazo | em meses ("360 meses") |
| financed amount | valor financiado | |
| total paid | total pago | |
| CET | CET (Custo Efetivo Total) | na primeira menção da página, por extenso |
| IOF | IOF | imposto, sempre campo; nunca alíquota gravada |
| TR | TR (Taxa Referencial) | campo "ao mês" |
| fees | tarifas | "tarifa de cadastro" é exemplo de texto, não campo fixo |
| insurance | seguros | "seguros e taxas por mês" no SAC × PRICE |
| credit card statement | fatura | |
| minimum payment | pagamento mínimo | |
| revolving credit | rotativo | "o rotativo do cartão" |
| installment plan | parcelamento | "parcelamento da fatura" |
| early payoff / prepayment | amortização antecipada · liquidação antecipada | "antecipar R$ 10.000" |
| shorter term · lower payment | reduzir o prazo · reduzir a parcela | |
| snowball · avalanche | bola de neve · avalanche | |
| compound interest | juros compostos | |
| monthly deposit | aporte mensal | |
| rent | aluguel | |
| home price | valor do imóvel | |
| property transfer tax · notary | ITBI · cartório | em % do valor do imóvel |
| appreciation | valorização do imóvel | |
| rent increase | reajuste do aluguel | |
| return | rendimento | "rendimento do dinheiro investido" |
| example (etiqueta) | exemplo | nunca "taxa de hoje" |
| schedule | cronograma | "Ver o cronograma" |
| Year N (do empréstimo) | Ano N | ano do contrato, não do calendário |

Nomes das páginas: Calculadoras financeiras (hub), Simulador SAC × PRICE, Simulador de financiamento de veículo, Simulador de empréstimo, Amortização antecipada, Calculadora do cartão de crédito, Calculadora de dívidas, Calculadora de juros compostos, Alugar ou comprar. No PDF o "×" sai como "x" (WinAnsi).

Nome do arquivo do PDF e do CSV: `simulacao-sac-price`, `financiamento-veiculo`, `simulacao-emprestimo`, `amortizacao-antecipada`, `cartao-de-credito`, `plano-de-dividas`, `juros-compostos`, `alugar-ou-comprar`.

## QR code (ajuste idiomas)

| Inglês | Português | Observação |
| --- | --- | --- |
| QR code | QR code | masculino ("o QR code"); "o código" na forma curta |
| square (módulo do código) | quadradinho | |
| Link or text | Link ou texto | rótulo da caixa |
| Oli in the middle · On · Off | A Oli no centro · Ligada · Desligada | no feminino, pela Oli |
| PNG size · Small · Medium · Large | Tamanho do PNG · Pequeno · Médio · Grande | |
| Download PNG · Download SVG | Baixar PNG · Baixar SVG | |
| Preview | Prévia | |
| Error correction | Correção de erros | "nível H" |
| static code · short link | código estático · link encurtado | |
| scan | escanear | "escaneie o código com a câmera do celular" |
| Utilities | Utilidades | coluna do rodapé e categoria da busca |

## Guias de arquivo (ajuste idiomas)

Os 10 guias em `/pt/guias/<slug>/`. O número de cada guia sai do código no formato do português: "2,4 MB", "68%", "5,2 vezes" ("0,5 vez" e "1,3 vez" no singular, abaixo de 2), "42,2 dB" e "150 ppi", com espaço sem quebra antes da unidade. Contagem por extenso: `{x_word}` masculino ("dois arquivos") e `{x_wordf}` feminino ("duas fotos"), pelo substantivo que a contagem acompanha; nunca no começo de uma frase (DECISOES § 314).

| Guia (inglês) | Nome em português | Caminho |
| --- | --- | --- |
| How to convert HEIC to JPG on Windows | Como converter HEIC para JPG no Windows | /pt/guias/heic-para-jpg-no-windows/ |
| Why is my PDF so large? | Por que meu PDF está tão grande? | /pt/guias/por-que-meu-pdf-esta-tao-grande/ |
| Social media image sizes | Tamanhos de imagem para redes sociais | /pt/guias/tamanhos-de-imagem-para-redes-sociais/ |
| How to open WebP images and save them as JPG | Como abrir imagens WebP e salvar como JPG | /pt/guias/abrir-webp-e-salvar-como-jpg/ |
| JPG or PNG: which one to use | JPG ou PNG: qual usar | /pt/guias/jpg-ou-png/ |
| How to remove location data from photos | Como remover a localização das fotos | /pt/guias/remover-localizacao-das-fotos/ |
| Which resolution to choose for PDF to JPG | Qual resolução escolher ao converter PDF para JPG | /pt/guias/resolucao-de-pdf-para-jpg/ |
| How to split a PDF, and why the parts can weigh more | Como dividir um PDF e por que as partes podem pesar mais | /pt/guias/dividir-pdf-e-tamanho-do-arquivo/ |
| How to combine PDFs on a phone | Como juntar PDFs no celular | /pt/guias/juntar-pdfs-no-celular/ |
| How to turn photos into one PDF | Como transformar fotos em um único PDF | /pt/guias/fotos-em-um-pdf/ |

| Inglês | Português | Observação |
| --- | --- | --- |
| guide · Read the guide | guia · Leia o guia | |
| What we measured · Sources · Related tools and guides | O que medimos · Fontes · Ferramentas e guias relacionados | |
| real phone photos | fotos de celular de verdade | vale; "PDFs reais" e "arquivos reais" não (DECISOES § 208) |
| graphics | imagens gráficas | logos, capturas de tela, gráficos |
| round trip | ida e volta | |
| frame | quadro | do corte, das redes e de uma animação |
| portrait · landscape | retrato · paisagem | |
| embedded fonts | fontes incorporadas | como o Acrobat em português |
| scan · scanned | escaneamento · escaneado | "digitalizar" só ao citar a ajuda do Google Drive, que usa o verbo |
| mode (da Comprimir PDF) | nível | "a compressão Sem perda", "a Recomendada", "a Forte" |
| merged file | arquivo juntado | |
| Change (coluna) | Variação | |
| Change (a mudança de tamanho no cartão do resultado) | Variação | F13a, revisão e-4: a mesma grandeza da coluna dos guias |
| object streams | fluxos de objetos | |
| post · header photo · channel banner · thumbnail | publicação · foto de capa · banner do canal · miniatura | |
| preset | ajuste pronto | |

Rótulos de sistema, como as páginas de suporte em português escrevem (lidas em 3/nov/2026): Ajustes, Mais Compatível, Alta Eficiência, Manter Originais, Privacidade e Segurança, Serviços de Localização, Ajustar Localização, Sem Localização, app Pré-Visualização, Inserir de Arquivo, app Arquivos, Manual de Uso do iPhone (Apple); Configurações, Mais configurações, Salvar local, Google Fotos, Câmera Pixel, Adicionar (Google); aplicativo Fotos, Extensões de Imagem HEIF, Extensões de Vídeo HEVC, Extensão de Imagem WebP, Explorador de Arquivos (Microsoft). Fonte sem versão em português leva "(em inglês)" no rótulo.

## O hub de guias, o cartão e a busca (F11)

O hub `/pt/guias/` lista os 10 guias de arquivo; os guias de dinheiro dos EUA não existem em português, e o grupo Dinheiro do hub é a nota que leva às calculadoras financeiras do Brasil (DECISOES § 393). O número de guias sai do registro, nunca à mão. A F11 tirou a linha "Leia o guia" das ferramentas: o cartão de guia ficou no lugar dela (DECISOES § 396).

| Inglês | Português | Observação |
| --- | --- | --- |
| Guides (o hub, a trilha, o rodapé) | Guias | caminho `/pt/guias/` |
| Answers that show the numbers | Respostas que mostram os números | H1 do hub |
| Image guides · PDF guides · Money guides | Guias de imagem · Guias de PDF · Dinheiro | o grupo de dinheiro do hub é só "Dinheiro" (a nota); o rodapé não o lista |
| All guides | Todos os guias | rodapé |
| Guide (no cartão e na busca) | Guia | primeira palavra do nome do cartão |
| Measured on N test files | Medido em N arquivos de teste | |
| Tool in the guide | Ferramenta no guia | |
| Read a guide · See all N guides | Leia um guia · Ver os N guias | a seção da home |
| Search tools and guides · Find a tool or a guide | Buscar ferramentas e guias · Encontre uma ferramenta ou um guia | o campo da busca; o botão do cabeçalho segue "Buscar ferramentas" |
| Results · Tools · Guides | Resultados · Ferramentas · Guias | a lista e os títulos dos grupos da busca |
| No tool or guide called "…" | Nenhuma ferramenta ou guia chamado "…" | o masculino concorda com "guia" |

## Falas da Oli

Da tabela de voz do docs/design/README.

| Momento | Fala |
| --- | --- |
| Pronto | Prontinho! Sua imagem ficou 68% mais leve. |
| Processando | A Oli está cuidando disso… |
| Erro | Ops, a Oli não conseguiu ler esse arquivo. Tente um JPG ou PNG. |
| Arquivo em cima | Pode soltar, a Oli está pronta |
| 404 | Essa página nadou para longe. |
| Offline | Sem internet? A Oli segue funcionando nas páginas que você já abriu. (F8, DECISOES § 289: só as páginas abertas com internet ficam guardadas.) |
| Apoio | A Oli funciona à base de café. |

## A parede do bloqueador (F12)

Os textos de `src/i18n/pt/wall.ts`, da especificação do `wall.html` com o ajuste 3 (DECISOES § 431). Os botões começam com verbo; nada de "clique", e a parede não fala do café.

| Inglês | Português | Nota |
| --- | --- | --- |
| ad blocker | bloqueador de anúncios; bloqueador | nunca "adblock" solto; o nome do produto AdBlock fica como está |
| Oli lives on ads | A Oli vive dos anúncios | o título da parede |
| Reload, it's off now | Recarregar, já desativei | o botão principal |
| See how to turn it off | Ver como desativar | abre a ajuda |
| Continue just this once | Usar só desta vez | o escape; a linha de depois dele o cita entre aspas |
| Turn it off just for fileorca.com | Desative só para o fileorca.com | o título da ajuda |
| Content Blockers · Settings · Websites | Bloqueadores de Conteúdo · Ajustes · Sites | os nomes do Safari no Mac em português, da ajuda da Apple |
| Pause on this site | Pausar nesse site | o menu do AdBlock em português (`_locales/pt_BR` da extensão) |

## Pedido de café e Pix

Da seção C do PLANO-MELHORIAS (F12, DECISOES § 441), que trocou a tabela "Doações" do PLANO.

| Lugar | Texto |
| --- | --- |
| Linha do card de resultado | O FileOrca é feito por uma pessoa só, sem cadastro e sem limite. Se a Oli te ajudou, me ajuda com um café? |
| Botão da linha | Pagar um café no Pix |
| Depois de "Não mostrar de novo" | Combinado, não peço mais aqui. O link do café fica no rodapé. |
| Rodapé (no topo) | Me ajude a manter o FileOrca grátis: paga um café? |
| Título da página de apoio | Me ajude a manter a Oli nadando |
| Texto da página de apoio | O FileOrca é grátis, sem cadastro e sem limite, e é feito por uma pessoa só, em Curitiba. Os anúncios pagam os custos; cada café vira a próxima ferramenta. |
| Botão do Ko-fi (página de apoio) | Me ajude com um café (Ko-fi) |
| Trilha da página de apoio | Apoie a Oli |
| Valores | Qualquer valor · R$ 5 · R$ 10 · R$ 20 |
| Botão do código | Copiar código |
| Recebedor | Em nome de Victor Yuki Matusita |
| "copia e cola" | Pix copia e cola |

## A grade e a vista da página (F14)

Da seção B do PLANO-UX-QV.md (F14, DECISOES § 623): os textos de pt são os da ficha, sem mudar uma palavra; o inglês é a fonte do site, e o espanhol está no glossário de lá.

| Lugar (inglês) | Português |
| --- | --- |
| Page size · Small · Large | Tamanho das páginas · Pequenas · Grandes |
| Pick all · Pick none · Invert selection | Marcar todas · Desmarcar todas · Inverter seleção |
| View page {n} enlarged (a lupa) | Ver a página {n} em tamanho grande |
| Back to the pages · Previous · Next | Voltar às páginas · Anterior · Próxima |
| Enlarge · Fit | Ampliar · Ajustar |
| View the new PDF · View pages of {name} | Ver o PDF novo · Ver páginas de {name} |
| Page {n} of {total} · Page {n} · position {p} of {total} | Página {n} de {total} · Página {n} · posição {p} de {total} |
| Take this page out · Pick this page · Sign this page · Turn 90° | Tirar esta página · Marcar esta página · Assinar esta página · Girar 90° |
| (Gerenciar páginas do PDF, a barra) Rotate right · Rotate left · Remove · Put back | Girar à direita · Girar à esquerda · Tirar · Devolver (F18, os rótulos do prompt) |
| (Gerenciar páginas do PDF, a contagem) {count} picked · 1 picked | {count} marcadas · 1 marcada |
| (Gerenciar páginas do PDF, a ajuda da barra) Pick pages first: these buttons turn the picked pages or take them out. | Marque páginas primeiro: estes botões giram as páginas marcadas ou as tiram. |
| (Gerenciar páginas do PDF, a fala do giro) {count} pages turned right / left. | {count} páginas giradas para a direita / para a esquerda. |
| (Excluir) {count} of {total} come out · the new PDF keeps {left} pages | {count} de {total} saem · o PDF novo fica com {left} páginas ("1 de 12 sai", "fica com 1 página") |
| (Excluir, o nome da página) …, comes out | …, sai |
| Pages {from} to {to} picked · unpicked | Páginas {from} a {to} marcadas · desmarcadas |
| magnifier · page view | lupa · vista da página (nos textos de ajuda; a ficha não usa "zoom" para a pessoa) |

## Nunca

Cada linha da tabela é um termo proibido nos textos em português e nas páginas `/pt/`. A comparação ignora maiúsculas e só casa a palavra inteira.

| Termo | Use | Por quê |
| --- | --- | --- |
| ficheiro | arquivo | português de Portugal |
| ficheiros | arquivos | português de Portugal |
| ecrã | tela | português de Portugal |
| telemóvel | celular | português de Portugal |
| descarregar | baixar | português de Portugal |
| utilizador | pessoa, você | português de Portugal |
| palavra-passe | senha | português de Portugal |
| fazer upload | enviar | anglicismo; o site não envia nada |
| fazer o download | baixar | anglicismo |
| deletar | excluir, apagar | anglicismo |
| printar | capturar a tela | anglicismo |
| clique aqui | um link com o nome do destino | link sem sentido para leitor de tela |
| vocês | você | o site fala com uma pessoa |
| hipoteca | financiamento imobiliário | no Brasil hipoteca é uma garantia, não o crédito |
| taxa de hoje | um exemplo rotulado como exemplo | nada de taxa do dia (PLANO, "Confiança em dinheiro e saúde") |
| taxa do dia | um exemplo rotulado como exemplo | idem |
| juros de hoje | um exemplo rotulado como exemplo | idem |
