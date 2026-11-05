# Glosario · español

Glossário fixo do FileOrca em espanhol (F6, decisão 3 do prompt; PLANO "Idiomas"). As explicações estão em português, como todo o `docs/`; os termos estão em espanhol. Todo texto do site em espanhol segue este arquivo: as páginas, os painéis, os PDFs e CSVs que o site gera, os nomes de arquivo baixado e os textos escondidos para leitor de tela. O `tests/unit/glossary.test.ts` lê a seção "Nunca" e reprova o termo nos arquivos de texto em espanhol e no HTML das páginas `/es/` do `dist/`.

Escrito em 1º/nov/2026, antes de qualquer tradução da F6. Mudança neste arquivo pede um § no DECISOES.md. Ampliado no ajuste "idiomas" (3/nov/2026, DECISOES § 317): o QR code, os guias de arquivo e o resto do dinheiro dos EUA. Corrigido na revisão do ajuste (DECISOES § 321): "ppp", "Chico", a nota do "pago global" e a tabela das páginas de dinheiro.

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
| QR code generator | Generador de códigos QR | /es/generador-de-codigo-qr/ |

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
| First page: Number it · Skip it (F13a, a opção no lugar da caixa) | Primera página: Numerar · Omitir |
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
| `qr-code.png`, `qr-code.svg` | `codigo-qr.png`, `codigo-qr.svg` |

## Dinero (las 5 calculadoras, para el público hispano de EE. UU.)

As contas, os campos e os exemplos são os da página em inglês, em US$. Os termos seguem o que o CFPB usa nos documentos em espanhol lidos em 1º/nov/2026 (o Toolkit hipotecário, os formulários H-28, o "Plan de acción contra la deuda" e o glossário inglês-espanhol do CFPB). O glossário do CFPB citado na F6 como "de abril de 2021" é o "Spanish-English glossary of financial terms" de março de 2024 (files.consumerfinance.gov); a edição anterior é de abril de 2022, e não há uma de 2021 (ajuste idiomas, DECISOES § 317). O site `consumerfinance.gov/es/` foi tirado do ar pelo CFPB em 2026 (redireciona para o inglês); nenhum link aponta para lá.

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

Os caminhos das 5 (acrescentados na revisão do ajuste "idiomas", DECISOES § 321, para a tabela das páginas de dinheiro em espanhol ficar inteira):

| Página (inglês) | Nombre en español | Caminho | Arquivo |
| --- | --- | --- | --- |
| Mortgage calculator | Calculadora de hipoteca | /es/calculadora-de-hipoteca/ | `tabla-hipoteca` |
| Personal loan calculator | Calculadora de préstamo personal | /es/calculadora-de-prestamo-personal/ | `tabla-prestamo-personal` |
| Credit card payoff calculator | Calculadora de tarjeta de crédito | /es/calculadora-de-tarjeta-de-credito/ | `plan-tarjeta-de-credito` |
| Debt payoff calculator | Calculadora de deudas | /es/calculadora-de-deudas/ | `plan-de-deudas` |
| Compound interest calculator | Calculadora de interés compuesto | /es/calculadora-de-interes-compuesto/ | `interes-compuesto` |

### O resto do dinheiro dos EUA (ajuste idiomas)

As 9 calculadoras, os 4 presets e os 5 guias que faltavam entraram em espanhol, com os termos do Toolkit hipotecario (ago/2026), dos formulários H-28 e do glossário do CFPB (mar/2024), conferidos em 3/nov/2026; onde o CFPB não tem o termo, o do FDIC ou da FTC.

| Inglês | Español | Observação |
| --- | --- | --- |
| refinance | refinanciar · refinanciamiento | CFPB, H-28(C) |
| closing costs | costos de cierre | |
| balloon payment | pago global | o termo do glossário e do Toolkit hipotecario do CFPB; o formulário H-28(D) diz "cuota extraordinaria", e o site fica com a forma do glossário. "Cuota" não é proibida: só "cuota mensual" está no "Nunca", e "cuota de la asociación de propietarios (HOA)" é o termo do site (DECISOES § 321) |
| debt consolidation | consolidación de deudas | FDIC, FTC |
| debt-to-income ratio | relación deudas-ingresos (DTI) | |
| simple interest | interés simple | |
| savings goal | meta de ahorro | "objetivo de ahorro" como sinônimo na busca |
| auto loan | préstamo para auto | o CFPB escreve "automóvil"; nunca "coche" (DECISOES § 309) |
| biweekly payment | pago cada dos semanas | nunca "quincenal", que é duas vezes por mês |
| rent (v.) | alquilar | |
| net worth | valor neto | |
| Loan Estimate · Closing Disclosure | Estimación de Préstamo · Declaración de Cierre | como o formulário e o Toolkit |
| points | puntos | |
| home affordability | cuánta casa puedo pagar | |

Nomes das páginas, caminhos e nome do arquivo do PDF e do CSV (o bloco `es` do `src/tools/calc/registry.ts`; DECISOES § 309 e § 321). O `tests/unit/glossary.test.ts` confere cada caminho e cada arquivo com o registro.

| Página (inglês) | Nombre en español | Caminho | Arquivo |
| --- | --- | --- | --- |
| Auto loan calculator | Calculadora de préstamo para auto | /es/calculadora-de-prestamo-para-auto/ | `tabla-prestamo-para-auto` |
| Refinance calculator | Calculadora de refinanciamiento | /es/calculadora-de-refinanciamiento/ | `comparacion-refinanciamiento` |
| Home affordability calculator | Calculadora de cuánta casa puedo pagar | /es/calculadora-de-cuanta-casa-puedo-pagar/ | `cuanta-casa-puedo-pagar` |
| Loan amortization calculator | Calculadora de amortización | /es/calculadora-de-amortizacion-de-prestamos/ | `tabla-amortizacion-prestamo` |
| Debt consolidation calculator | Calculadora de consolidación de deudas | /es/calculadora-de-consolidacion-de-deudas/ | `comparacion-consolidacion-de-deudas` |
| Rent vs buy calculator | Calculadora de alquilar o comprar | /es/calculadora-de-alquilar-o-comprar/ | `alquilar-o-comprar` |
| Savings goal calculator | Calculadora de meta de ahorro | /es/calculadora-de-meta-de-ahorro/ | `plan-meta-de-ahorro` |
| Simple interest calculator | Calculadora de interés simple | /es/calculadora-de-interes-simple/ | `interes-simple` |
| APR to APY calculator | Calculadora de APR a APY | /es/calculadora-de-apr-a-apy/ | `tabla-apr-a-apy` |
| Mortgage calculator with extra payments | Calculadora de pagos adicionales a la hipoteca | /es/calculadora-de-hipoteca/pagos-adicionales/ | `tabla-pagos-adicionales` |
| Biweekly mortgage calculator | Calculadora de pagos cada dos semanas | /es/calculadora-de-hipoteca/pagos-cada-dos-semanas/ | `tabla-hipoteca-cada-dos-semanas` |
| 15-year vs 30-year mortgage calculator | Calculadora de hipoteca a 15 o 30 años | /es/calculadora-de-hipoteca/15-o-30-anos/ | `hipoteca-15-o-30-anos` |
| Balloon loan calculator | Calculadora de préstamo con pago global | /es/calculadora-de-amortizacion-de-prestamos/pago-global/ | `tabla-prestamo-con-pago-global` |

Os 5 guias de dinheiro:

| Guia (inglês) | Nombre en español | Caminho |
| --- | --- | --- |
| 15-year vs 30-year mortgage: the real cost | Hipoteca a 15 o 30 años: el costo real | /es/guias/hipoteca-a-15-o-30-anos/ |
| Snowball vs avalanche, with numbers | Bola de nieve o avalancha, con números | /es/guias/bola-de-nieve-o-avalancha/ |
| How extra payments shorten a mortgage | Cómo los pagos adicionales acortan una hipoteca | /es/guias/pagos-adicionales-a-la-hipoteca/ |
| Refinancing: find your break-even month | Refinanciamiento: halla tu mes de equilibrio | /es/guias/punto-de-equilibrio-del-refinanciamiento/ |
| Rent vs buy: when buying starts to pay off | Alquilar o comprar: cuándo empieza a convenir comprar | /es/guias/punto-de-equilibrio-entre-alquilar-y-comprar/ |

## Generador de códigos QR (ajuste idiomas)

| Inglês | Español | Observação |
| --- | --- | --- |
| QR code | código QR | "Generador de códigos QR", no plural, como a página e os Términos |
| square (módulo) | cuadrito | |
| Link or text · the text box | Enlace o texto · el cuadro | |
| Oli in the middle · On · Off | Oli en el centro · Activada · Desactivada | no feminino, pela Oli |
| PNG size · Small · Medium · Large | Tamaño del PNG · Chico · Mediano · Grande | "Chico", a palavra de tamanho do espanhol dos EUA: com "Pequeño", as três opções não cabiam a 320 px (DECISOES § 321). Só no QR: a Marca de agua PDF da F6 segue com "Pequeño · Mediano · Grande", e a diferença é a pendência "Idiomas R2-04" |
| Download PNG · Download SVG | Descargar PNG · Descargar SVG | |
| Preview · Error correction | Vista previa · Corrección de errores | |
| short link · expire · tracking | enlace acortado · vencer · rastreo | |
| icon | ícono | forma das Américas |
| Utilities | Utilidades | |

## Guías de archivo (ajuste idiomas)

Os 10 guias em `/es/guias/<slug>/`. O número sai do código no formato do espanhol dos EUA: "2.4 MB", "68 %" (com espaço sem quebra), "5.2 veces" ("1.0 vez" só no 1 exato), "42.2 dB", "150 ppp" (como a PDF a JPG escreve na mesma página; DECISOES § 321). Contagem por extenso: `{x_word}` masculino ("dos archivos", "un PDF", sempre com o substantivo depois do "un") e `{x_wordf}` feminino ("dos fotos", "una imagen", "cuatro esquinas"); nunca no começo de uma frase (DECISOES § 314).

| Guia (inglês) | Nombre en español | Caminho |
| --- | --- | --- |
| How to convert HEIC to JPG on Windows | Cómo convertir HEIC a JPG en Windows | /es/guias/heic-a-jpg-en-windows/ |
| Why is my PDF so large? | ¿Por qué mi PDF pesa tanto? | /es/guias/por-que-mi-pdf-pesa-tanto/ |
| Social media image sizes | Tamaños de imagen para redes sociales | /es/guias/tamanos-de-imagen-para-redes-sociales/ |
| How to open WebP images and save them as JPG | Cómo abrir imágenes WebP y guardarlas como JPG | /es/guias/abrir-webp-y-guardar-como-jpg/ |
| JPG or PNG: which one to use | JPG o PNG: cuál usar | /es/guias/jpg-o-png/ |
| How to remove location data from photos | Cómo quitar la ubicación de las fotos | /es/guias/quitar-la-ubicacion-de-las-fotos/ |
| Which resolution to choose for PDF to JPG | Qué resolución elegir para pasar un PDF a JPG | /es/guias/resolucion-de-pdf-a-jpg/ |
| How to split a PDF, and why the parts can weigh more | Cómo dividir un PDF y por qué las partes pueden pesar más | /es/guias/dividir-pdf-y-tamano-del-archivo/ |
| How to combine PDFs on a phone | Cómo unir PDF en el celular | /es/guias/unir-pdf-en-el-celular/ |
| How to turn photos into one PDF | Cómo convertir fotos en un solo PDF | /es/guias/fotos-en-un-solo-pdf/ |

| Inglês | Español | Observação |
| --- | --- | --- |
| What we measured · Sources · Related tools and guides | Lo que medimos · Fuentes · Herramientas y guías relacionadas | |
| real phone photos | fotos reales de celular | vale; "PDF reales" e "archivos reales" não |
| lossy · lossless | con pérdida · sin pérdida | |
| frame · thumbnail · cover photo · header photo | cuadro · miniatura · foto de portada · foto de encabezado | |
| embedded fonts | fuentes incrustadas | "fuentes" também são as fontes citadas: nenhuma frase com {date} fala delas |
| scan · scanned | escaneo · escaneado | |
| mode (Comprimir PDF) | nivel | "la compresión Recomendada" |
| N times as heavy | N veces el peso | nunca "N veces más", que é ambíguo |
| merged file · attachment | archivo unido · archivo adjunto | |
| Change (coluna, e a mudança de tamanho no cartão do resultado) | Cambio | F13a, revisão e-4 |
| preset | ajuste predefinido | |

Rótulos de sistema, como as páginas de suporte em espanhol escrevem (lidas em 3/nov/2026): Alta eficiencia, Más compatible, Mantener originales, Localización (manual da Apple es-us), app Vista Previa, Insertar desde archivo, app Archivos, mantén presionada, Manual de uso del iPhone (Apple); Guardar ubicación, Más parámetros de configuración, Agregar (Google); Extensiones de imagen HEIF, Extensiones de vídeo HEVC (nome do produto), Explorador de archivos, Microsoft Print To PDF (Microsoft). Fonte sem versão em espanhol leva "(en inglés)" no rótulo.

## El hub de guías, la tarjeta y la búsqueda (F11)

O hub `/es/guias/` lista os 10 guias de arquivo e os 5 de dinheiro (DECISOES § 393). O número de guias sai do registro, nunca à mão. A F11 tirou a linha "Lee la guía" das ferramentas e calculadoras: o cartão de guia ficou no lugar dela (DECISOES § 396).

| Inglês | Español | Observação |
| --- | --- | --- |
| Guides (o hub, a trilha, o rodapé) | Guías | caminho `/es/guias/` |
| Answers that show the numbers | Respuestas que muestran los números | H1 do hub |
| Image guides · PDF guides · Money guides | Guías de imagen · Guías de PDF · Guías de dinero | |
| All guides | Todas las guías | rodapé |
| Guide (na tarjeta e na busca) | Guía | primeira palavra do nome do cartão |
| Measured on N test files · Numbers worked out | Medida con N archivos de prueba · Números calculados | |
| Tool in the guide | Herramienta en la guía | |
| Read a guide · See all N guides | Lee una guía · Ver las N guías | a seção da home |
| Search tools and guides · Find a tool or a guide | Buscar herramientas y guías · Busca una herramienta o una guía | o botão do cabeçalho segue "Buscar herramientas" |
| Results · Tools · Guides | Resultados · Herramientas · Guías | |
| No tool or guide called "…" | Ninguna herramienta o guía llamada "…" | o feminino concorda com "guía", a palavra mais próxima |

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

## La pared del bloqueador (F12)

Os textos de `src/i18n/es/wall.ts`, da especificação do `wall.html` com o ajuste 3 (DECISOES § 431). Os botões começam com verbo; nada de "clic", e a parede não fala do café.

| Inglês | Espanhol | Nota |
| --- | --- | --- |
| ad blocker | bloqueador de anuncios; bloqueador | o nome do produto AdBlock fica como está |
| Oli lives on ads | Oli vive de los anuncios | o título da parede |
| Reload, it's off now | Recargar, ya lo desactivé | o botão principal |
| See how to turn it off | Ver cómo desactivarlo | abre a ajuda |
| Continue just this once | Seguir solo esta vez | o escape; a linha de depois dele o cita entre aspas |
| Turn it off just for fileorca.com | Desactívalo solo para fileorca.com | o título da ajuda |
| Content Blockers · Settings · Websites | Bloqueadores de contenido · Configuración · Sitios web | os nomes do Safari no Mac em espanhol, da ajuda da Apple (es-mx) |
| Pause on this site | Pausar en este sitio web | o menu do AdBlock em espanhol (`_locales/es` da extensão) |
| on the phone | en el celular | "móvil" está na tabela Nunca |
| icon | ícono | a forma das Américas, como no QR e nos guias; a especificação dizia "icono" (DECISOES § 452) |
| Press (a button) | Presiona | como os passos do resto do site; a especificação dizia "Pulsa" (DECISOES § 452) |

## Pedido de café

Da seção C do PLANO-MELHORIAS (F12, DECISOES § 441), que trocou a tabela "Doações" do PLANO. Em espanhol não há Pix: o botão leva ao Ko-fi.

| Lugar | Texto |
| --- | --- |
| Línea de la tarjeta de resultado | FileOrca lo hace una sola persona, sin registros ni límites. Si Oli te ahorró tiempo, ¿me ayudas con un café? |
| Botón (tarjeta y página de apoyo) | Ayúdame con un café |
| Después de "No mostrar de nuevo" | Entendido, no vuelvo a pedirlo aquí. El enlace del café queda en el pie de página. |
| Pie de página (arriba) | Ayúdame a mantener FileOrca gratis: invítame un café |
| Título de la página de apoyo | Ayúdame a que Oli siga nadando |
| Texto de la página de apoyo | FileOrca es gratis, sin registros ni límites, y lo hace una sola persona en Curitiba, Brasil. Los anuncios cubren los costos; cada café se convierte en la próxima herramienta. |
| Ruta de navegación de la página de apoyo | Apoya a Oli |

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
| icono | ícono | a forma da Espanha; o site escreve "ícono" (DECISOES § 452) |
| pulsa | presiona | o site diz "presiona" nos passos (DECISOES § 452) |
| ficheros | archivos | espanhol da Espanha |
| pinchar | hacer clic, tocar | espanhol da Espanha |
| enganche | pago inicial | regional (México); o CFPB diz "pago inicial" |
| tasa de porcentaje anual | tasa porcentual anual (APR) | o Toolkit e os formulários do CFPB e a FTC escrevem "tasa porcentual anual"; o glossário do CFPB (mar/2024) e o do FDIC trazem a outra forma, que o site não usa nem cita (DECISOES § 317) |
| cuota mensual | pago mensual | o CFPB diz "pago mensual" |
| mensualidad | pago mensual | idem |
| tasa de hoy | un ejemplo rotulado como ejemplo | nada de taxa do dia |
| tasas de hoy | un ejemplo rotulado como ejemplo | idem |
| ppi | ppp (píxeles por pulgada) | a PDF a JPG e a Comprimir PDF escrevem "ppp" desde a F6, e o guia de resolução mostra a ferramenta e a medida na mesma página (DECISOES § 321) |
