# Glosario · español

Glossário fixo do FileOrca em espanhol (F6, decisão 3 do prompt; PLANO "Idiomas"). As explicações estão em português, como todo o `docs/`; os termos estão em espanhol. Todo texto do site em espanhol segue este arquivo: as páginas, os painéis, os PDFs e CSVs que o site gera, os nomes de arquivo baixado e os textos escondidos para leitor de tela. O `tests/unit/glossary.test.ts` lê a seção "Nunca" e reprova o termo nos arquivos de texto em espanhol e no HTML das páginas `/es/` do `dist/`.

Escrito em 1º/nov/2026, antes de qualquer tradução da F6. Mudança neste arquivo pede um § no DECISOES.md.

## Registro

- Espanhol neutro, que serve aos hispânicos dos EUA e à América Latina, com "tú" (docs/design/README, "Voz"). Nunca "usted", "vosotros" nem "vos".
- Frases curtas, em sentence case ("Comprimir imagen", "Unir PDF").
- Botão começa com verbo no infinitivo e não tem ponto: "Descargar", "Elegir imágenes", "Copiar enlace".
- A Oli fala dela em terceira pessoa, sem artigo: "Oli se está encargando…".
- Exclamação só no sucesso, uma por tela, com a abertura: "¡Listo!". Pergunta abre com "¿".
- Erro diz o que houve e o que fazer, sem culpar: "Uy, Oli no pudo leer este archivo. Prueba con un JPG o PNG."
- Sem emoji, sem "mágico", "revolucionario", "sin esfuerzo", "con IA".
- As fontes oficiais (CFPB, FDIC, SEC) escrevem com "usted"; o site usa os termos delas, nunca as frases.

## Formato de número, moeda e data

Decisão do Victor (1º/nov/2026): o espanhol do site escreve número como nos EUA.

| O quê | Como | Exemplo |
| --- | --- | --- |
| Decimal e milhar | ponto decimal, vírgula no milhar, também com 4 dígitos | 1,234.56 · 20,000 px |
| Tamanho de arquivo | uma casa abaixo de 100, espaço sem quebra antes da unidade | 2.4 MB · 780 KB |
| Porcentagem | espaço sem quebra antes do "%" (voz do design system) | 68 % · 6.5 % |
| Moeda | "$" colado, como nos EUA; sem "US" | $1,234.56 · $382,637 |
| Data por extenso | dia, "de", mês minúsculo, "de", ano | 1 de noviembre de 2026 |
| CSV | como o do inglês: vírgula separa as colunas, ponto decimal, BOM UTF-8 | 1896.20,143.75 |
| PDF do relatório | página Letter | |

As datas de "Revisado el" e "Última actualización" são o dia em Brasília.

## Términos de archivo

| Inglês | Español | Observação |
| --- | --- | --- |
| file | archivo | nunca "fichero" |
| image / photo | imagen / foto | |
| batch | lote | "todo el lote" |
| ZIP | ZIP | "Descargar todo · ZIP 4.2 MB" |
| Download (botão) | Descargar | |
| Download all | Descargar todo | |
| drag and drop | arrastrar y soltar | "Suelta las imágenes aquí" |
| paste | pegar | "o pega con Ctrl V" |
| choose | elegir | "Elegir imágenes", "Elegir PDF" |
| upload (o site não faz) | subir | "sin subir archivos"; "tus archivos nunca salen de tu dispositivo" |
| device | dispositivo | |
| browser | navegador | |
| phone | teléfono, celular | nunca "móvil" |
| computer | computadora | nunca "ordenador" |
| click / tap | hacer clic / tocar | nunca "pinchar" |
| metadata | metadatos | |
| GPS location | ubicación GPS | |
| compression | compresión | |
| lossless | sin pérdida | |
| page / pages | página / páginas | |
| password | contraseña | |
| start over | Empezar de nuevo | |
| show N more | Mostrar N más | |
| waiting / working | En espera / Procesando | |
| Already optimized | Ya optimizada (imagen) / Ya optimizado (PDF) | |
| to (entre dois tamanhos, escondido) | a | "2.4 MB a 780 KB" no leitor de tela |
| Advertisements | Anuncios | rótulo do AdSlot, a única palavra aceita |

## Herramientas y opciones

| Ferramenta (inglês) | Nombre en español | Caminho |
| --- | --- | --- |
| Image tools (hub) | Herramientas de imagen | /es/herramientas-de-imagen/ |
| Compress image | Comprimir imagen | /es/comprimir-imagen/ |
| Compress to 100 KB | Comprimir imagen a 100 KB | /es/comprimir-imagen/a-100kb/ |
| Compress to 1 MB | Comprimir imagen a 1 MB | /es/comprimir-imagen/a-1mb/ |
| Resize image | Redimensionar imagen | /es/redimensionar-imagen/ |
| YouTube thumbnail | Miniatura de YouTube | /es/redimensionar-imagen/miniatura-youtube/ |
| Crop image | Recortar imagen | /es/recortar-imagen/ |
| Rotate image | Rotar imagen | /es/rotar-imagen/ |
| HEIC to JPG | HEIC a JPG | /es/heic-a-jpg/ |
| WebP to JPG | WebP a JPG | /es/webp-a-jpg/ |
| PNG to JPG | PNG a JPG | /es/png-a-jpg/ |
| Image to PDF | Imagen a PDF | /es/imagen-a-pdf/ |
| PDF tools (hub) | Herramientas PDF | /es/herramientas-pdf/ |
| Merge PDF | Unir PDF | /es/unir-pdf/ |
| Split PDF | Dividir PDF | /es/dividir-pdf/ |
| Rotate PDF | Rotar PDF | /es/rotar-pdf/ |
| Delete pages | Eliminar páginas de PDF | /es/eliminar-paginas-pdf/ |
| Reorder pages | Ordenar páginas de PDF | /es/ordenar-paginas-pdf/ |
| PDF to JPG | PDF a JPG | /es/pdf-a-jpg/ |
| Page numbers | Numerar páginas de PDF | /es/numerar-paginas-pdf/ |
| Watermark | Marca de agua en PDF | /es/marca-de-agua-pdf/ |
| Sign PDF | Firmar PDF | /es/firmar-pdf/ |
| Compress PDF | Comprimir PDF | /es/comprimir-pdf/ |
| Protect PDF | Proteger PDF | /es/proteger-pdf/ |
| Unlock PDF | Desbloquear PDF | /es/desbloquear-pdf/ |

Os formatos ficam como estão: JPG, PNG, HEIC, WebP, AVIF, GIF, PDF, ZIP. O plural de PDF não leva "s" no texto corrido ("tus PDF"); no nome do ZIP fica `pdfs`.

| Opção (inglês) | Español |
| --- | --- |
| Compression · Recommended · Strong · Lossless | Compresión · Recomendada · Fuerte · Sin pérdida |
| best balance · smallest | mejor equilibrio · archivo más pequeño |
| Resize · By size · By percentage · Width · Height | Redimensionar · Por tamaño · Por porcentaje · Ancho · Alto |
| Aspect ratio · Square · Free · Crop area | Proporción · Cuadrado · Libre · Área de recorte |
| Rotate · Right 90° · Left 90° · 180° · Mirror · None | Rotar · 90° a la derecha · 90° a la izquierda · 180° · Reflejar · Ninguno |
| Save as | Guardar como |
| Page size · Image size · Letter · A4 | Tamaño de página · Tamaño de la imagen · Carta · A4 |
| Split by · Every page · Page ranges · Pick pages | Dividir por · Cada página · Rangos de páginas · Elegir páginas |
| Image format · Resolution · for the screen · general use · for printing | Formato de imagen · Resolución · para pantalla · uso general · para imprimir |
| All pages · Page range · Page by page | Todas las páginas · Rango de páginas · Página por página |
| Position · Top left · Top center · Bottom right… | Posición · Arriba a la izquierda · Arriba al centro · Abajo a la derecha… |
| Format · Page 1 · Page 1 of 12 · 1 of 12 | Formato · Página 1 · Página 1 de 12 · 1 de 12 |
| First number · Skip the first page | Primer número · Omitir la primera página |
| Watermark text · CONFIDENTIAL · Size · Opacity · Light · Direction | Texto de la marca de agua · CONFIDENCIAL · Tamaño · Opacidad · Suave · Dirección |
| Signature · Draw · Upload · Type · Clear | Firma · Dibujar · Imagen · Escribir · Borrar |
| Password · Confirm password · Remove password | Contraseña · Confirma la contraseña · Quitar la contraseña |
| Reverse order | Invertir el orden |
| Add more PDFs | Agregar más PDF |

## Nombre del archivo descargado

Sem acento, em minúsculas, com hífen.

| Inglês | Español |
| --- | --- |
| `-merged` | `-unido` |
| `-split`, `-page-N`, `-part-N`, `-selected` | `-dividido`, `-pagina-N`, `-parte-N`, `-seleccionadas` |
| `-compressed` | `-comprimido` |
| `-rotated` | `-rotado` |
| `-edited` | `-editado` |
| `-reordered` | `-ordenado` |
| `-numbered` | `-numerado` |
| `-watermarked` | `-marca-de-agua` |
| `-signed` | `-firmado` |
| `-protected` | `-protegido` |
| `-unlocked` | `-desbloqueado` |
| `fileorca-images.zip`, `fileorca-images.pdf` | `fileorca-imagenes.zip`, `fileorca-imagenes.pdf` |
| `fileorca-pdfs.zip`, `fileorca-pdf-images.zip` | `fileorca-pdfs.zip`, `fileorca-pdf-imagenes.zip` |
| `document.pdf` | `documento.pdf` |

## Dinero (las 5 calculadoras, para el público hispano de EE. UU.)

As contas, os campos e os exemplos são os da página em inglês, em US$. Os termos seguem o que o CFPB usa nos documentos em espanhol lidos em 1º/nov/2026 (o Toolkit hipotecário, os formulários H-28, o "Plan de acción contra la deuda" e o glossário inglês-espanhol do CFPB de abril de 2021). O site `consumerfinance.gov/es/` foi tirado do ar pelo CFPB em 2026 (redireciona para o inglês); nenhum link aponta para lá.

| Inglês | Español | Observação |
| --- | --- | --- |
| monthly payment | pago mensual | nunca "cuota mensual" nem "mensualidad" |
| total monthly payment | pago mensual total | com impostos e seguros |
| principal | capital | "capital e intereses" |
| interest | intereses (o "interés") | |
| interest rate | tasa de interés | |
| APR | APR | na primeira menção, "tasa porcentual anual (APR)" (forma dos formulários H-28) |
| APY | APY | na primeira menção, "rendimiento porcentual anual (APY)" |
| loan amount | monto del préstamo | |
| loan term | plazo del préstamo | "30 años", "36 meses" |
| down payment | pago inicial | nunca "enganche" |
| home price | precio de la vivienda | |
| property tax | impuestos sobre la propiedad | |
| home insurance | seguro de la vivienda | |
| PMI | seguro hipotecario privado (PMI) | |
| HOA dues | cuota de la asociación de propietarios (HOA) | |
| balance | saldo | |
| amortization schedule | tabla de amortización | "Ver la tabla de amortización" |
| extra payment | pago adicional | |
| total of payments | pagos totales | |
| origination fee | cargo por emisión | |
| credit card | tarjeta de crédito | |
| minimum payment | pago mínimo | |
| debt | deuda | |
| snowball · avalanche | bola de nieve · avalancha | termos do mercado; a página explica com as palavras do CFPB: "primero la deuda más pequeña" e "primero la tasa de interés más alta" |
| compound interest | interés compuesto | |
| starting amount | monto inicial | |
| monthly deposit | depósito mensual | |
| compounding | capitalización | anual, semestral, trimestral, mensual, diaria |
| example (etiqueta) | ejemplo | nunca "tasa de hoy" |
| Year N (do empréstimo) | Año N | |

Nomes das páginas: Calculadoras financieras (hub), Calculadora de hipoteca, Calculadora de préstamo personal, Calculadora de tarjeta de crédito, Calculadora de deudas, Calculadora de interés compuesto.

Nome do arquivo do PDF e do CSV: `tabla-hipoteca`, `tabla-prestamo-personal`, `plan-tarjeta-de-credito`, `plan-de-deudas`, `interes-compuesto`.

## Frases de Oli

Da tabela de voz do docs/design/README.

| Momento | Frase |
| --- | --- |
| Listo | ¡Listo! Tu imagen quedó un 68 % más ligera. |
| Procesando | Oli se está encargando… |
| Error | Uy, Oli no pudo leer este archivo. Prueba con un JPG o PNG. |
| Archivo encima | Suéltalo, Oli está lista |
| 404 | Esta página se fue nadando. |
| Sin conexión | ¿Sin internet? Oli sigue funcionando en las páginas que ya abriste. (F8, DECISOES § 289: só as páginas abertas com internet ficam guardadas.) |
| Apoyo | Oli funciona a base de café. |

## Pedido de café

Da tabela "Doações" do PLANO. Em espanhol não há Pix: o botão leva ao Ko-fi.

| Lugar | Texto |
| --- | --- |
| Línea de la tarjeta de resultado | Esta herramienta es gratis, sin límites y nunca sube tus archivos. Si te ahorró tiempo, un café ayuda a mantenerla así. |
| Botón | Invítame un café |
| Pie de página | ¿Te gustan estas herramientas? Invítame un café |
| Título de la página de apoyo | Herramientas gratis, hechas por una sola persona |

## Nunca

Cada linha da tabela é um termo proibido nos textos em espanhol e nas páginas `/es/`. A comparação ignora maiúsculas e só casa a palavra inteira.

| Termo | Use | Por quê |
| --- | --- | --- |
| ordenador | computadora | espanhol da Espanha |
| móvil | teléfono, celular | espanhol da Espanha |
| vosotros | tú | o site fala com uma pessoa, em "tú" |
| vuestro | tu | idem |
| vuestra | tu | idem |
| usted | tú | o site usa "tú" (design system) |
| fichero | archivo | espanhol da Espanha |
| ficheros | archivos | espanhol da Espanha |
| pinchar | hacer clic, tocar | espanhol da Espanha |
| enganche | pago inicial | regional (México); o CFPB diz "pago inicial" |
| tasa de porcentaje anual | tasa porcentual anual (APR) | o CFPB não usa essa forma |
| cuota mensual | pago mensual | o CFPB diz "pago mensual" |
| mensualidad | pago mensual | idem |
| tasa de hoy | un ejemplo rotulado como ejemplo | nada de taxa do dia |
| tasas de hoy | un ejemplo rotulado como ejemplo | idem |
