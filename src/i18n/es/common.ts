import type { EsCommonTexts } from '../types.ts';

// Textos comunes en español (docs/i18n/es.md): encabezado, pie de página, búsqueda, aviso de cookies y las tarjetas de
// cada herramienta y calculadora que existe en español.
export default {
  skipToContent: 'Saltar al contenido',
  header: {
    homeLabel: 'FileOrca, página de inicio',
    search: 'Buscar herramientas',
    langCode: 'ES',
    langSr: ' · Idioma: Español',
    langMenuLabel: 'Elige un idioma',
    langNames: { en: 'English', pt: 'Português', es: 'Español' },
    menu: 'Menú',
    theme: { system: 'Tema: sistema', light: 'Tema: claro', dark: 'Tema: oscuro' },
    menuLanguage: 'Idioma',
    menuTools: '{n} herramientas',
    menuCalculators: '{n} calculadoras',
    menuGuides: '{n} guías',
    menuQr: 'PNG o SVG',
    support: 'Apoya a Oli',
    supportMeta: 'Ko-fi',
  },
  breadcrumb: { label: 'Ruta de navegación', home: 'Inicio' },
  pageIndex: 'En esta página',
  seal: 'Tus archivos nunca salen de tu dispositivo',
  footer: {
    imageColumn: 'Imagen',
    moneyColumn: 'Dinero',
    pdfColumn: 'PDF',
    siteColumn: 'FileOrca',
    about: 'Acerca de',
    privacy: 'Privacidad',
    terms: 'Términos',
    licenses: 'Licencias',
    contact: 'Contacto',
    utilityColumn: 'Utilidades',
    guidesAll: 'Todas las guías',
    tools: {
      all: 'Las {n}',
      popular: '{n} populares',
      popularRest: 'entre las {noun}',
      image: 'herramientas de imagen',
      pdf: 'herramientas PDF',
      money: 'calculadoras financieras',
    },
    guidesTopics: '{n} temas',
    guidesTopicsRest: 'de guías',
    coffee: 'Ayúdame a mantener FileOrca gratis: invítame un café',
    signature: 'Hecho por {name} en {city}',
  },
  cookie: {
    title: 'Cookies',
    body: 'de Google Analytics y de anuncios.',
    privacyLink: 'Privacidad',
    accept: 'Aceptar',
    decline: 'Rechazar',
    change: 'Cambiar mi elección de cookies',
  },
  adLabel: 'Anuncios',
  search: {
    dialogLabel: 'Buscar herramientas',
    inputLabel: 'Buscar herramientas y guías',
    listLabel: 'Resultados',
    placeholder: 'Busca una herramienta o una guía',
    close: 'Cerrar',
    emptyTitle: 'Ninguna herramienta o guía llamada "{query}"',
    emptyHint: 'Prueba con "comprimir", "PDF" o "hipoteca".',
    toolsGroup: 'Herramientas',
    guidesGroup: 'Guías',
    guideCategory: 'Guía',
    imageCategory: 'Imagen',
    moneyCategory: 'Calculadoras financieras',
    pdfCategory: 'PDF',
    utilityCategory: 'Utilidades',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Herramientas de imagen',
  pdfTools: 'Herramientas PDF',
  guidesHub: 'Guías',
  moneyCalculators: 'Calculadoras financieras',
  calcSeal: 'Tus números se quedan en tu dispositivo',
  tools: {
    'compress-image': {
      name: 'Comprimir imagen',
      description: 'Haz que un JPG, PNG o WebP pese menos, directamente en tu navegador.',
      synonyms: ['comprimir', 'reducir', 'achicar', 'optimizar', 'compactar', 'foto', 'imagen', 'jpg', 'png', 'webp'],
    },
    'resize-image': {
      name: 'Redimensionar imagen',
      description: 'Cambia el tamaño de una imagen en píxeles o en porcentaje.',
      synonyms: ['redimensionar', 'cambiar tamaño', 'escalar', 'dimensiones', 'píxeles', 'ancho', 'alto', 'foto', 'imagen'],
    },
    'crop-image': {
      name: 'Recortar imagen',
      description: 'Recorta una foto en cuadrado, 4:5, 16:9 o como quieras.',
      synonyms: ['recortar', 'cortar', 'encuadrar', 'cuadrado', 'proporción', '16:9', '4:5', 'foto', 'imagen'],
    },
    'rotate-image': {
      name: 'Rotar imagen',
      description: 'Gira una foto 90° o 180°, o refléjala como un espejo.',
      synonyms: ['rotar', 'girar', 'voltear', 'reflejar', 'espejo', 'de lado', 'al revés', 'foto', 'imagen'],
    },
    'heic-to-jpg': {
      name: 'HEIC a JPG',
      description: 'Convierte las fotos HEIC del iPhone en JPG o PNG.',
      synonyms: ['heic', 'heif', 'foto de iphone', 'iphone', 'convertir', 'jpg', 'jpeg', 'png', 'foto'],
    },
    'webp-to-jpg': {
      name: 'WebP a JPG',
      description: 'Convierte imágenes WebP en JPG o PNG.',
      synonyms: ['webp', 'convertir', 'jpg', 'jpeg', 'png', 'webp animado', 'imagen'],
    },
    'png-to-jpg': {
      name: 'PNG a JPG',
      description: 'Convierte PNG en JPG, o JPG en PNG.',
      synonyms: ['png', 'jpg', 'jpeg', 'jpg a png', 'convertir', 'transparente', 'imagen'],
    },
    'avif-to-jpg': {
      name: 'AVIF a JPG',
      description: 'Convierte imágenes AVIF en JPG.',
      synonyms: ['avif', 'convertir', 'jpg', 'jpeg', 'imagen'],
    },
    'convert-to-webp': {
      name: 'Convertir a WebP',
      description: 'Convierte JPG y PNG en archivos WebP o AVIF más pequeños.',
      synonyms: ['webp', 'avif', 'convertir a avif', 'convertir', 'más pequeño', 'jpg', 'jpeg', 'png', 'imagen'],
    },
    'image-to-pdf': {
      name: 'Imagen a PDF',
      description: 'Junta tus imágenes en un solo PDF, una imagen por página.',
      synonyms: ['pdf', 'jpg a pdf', 'png a pdf', 'foto a pdf', 'unir imágenes', 'juntar fotos', 'jpg', 'png', 'imagen'],
    },
    // F18 placeholder: front T writes the es text (the name is the contract's, decision 4).
    'remove-exif-data': {
      name: 'Quitar metadatos de la foto',
      description: 'Take the location, date and camera out of a photo.',
      synonyms: ['exif', 'metadata', 'gps', 'location', 'remove exif', 'remove metadata', 'exif remover', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
    'compress-image-to-100kb': {
      name: 'Comprimir imagen a 100 KB',
      description: 'Un JPG de 100 KB o menos, para formularios con límite de tamaño.',
      synonyms: ['100kb', '100 kb', 'menos de 100kb', 'comprimir a 100kb', 'reducir', 'formulario', 'jpg', 'jpeg'],
    },
    'compress-image-to-1mb': {
      name: 'Comprimir imagen a 1 MB',
      description: 'Un JPG de 1 MB o menos, para envíos con límite de tamaño.',
      synonyms: ['1mb', '1 mb', 'menos de 1mb', 'comprimir a 1mb', 'reducir', 'formulario', 'jpg', 'jpeg'],
    },
    'resize-image-youtube-thumbnail': {
      name: 'Miniatura de YouTube',
      description: 'Un JPG de 1280 × 720 de menos de 2 MB, listo para tu video de YouTube.',
      synonyms: ['youtube', 'miniatura', 'thumbnail', 'portada del video', '1280x720', '1280 x 720', '16:9', 'video', 'jpg'],
    },
    // F18 placeholder: front T writes the es text (the name is the contract's, decision 4).
    'rotate-image-flip': {
      name: 'Reflejar imagen',
      description: 'Mirror a photo left to right or top to bottom.',
      synonyms: ['flip', 'mirror', 'flip image', 'mirror image', 'flip horizontally', 'flip vertically', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
  },
  pdf: {
    'merge-pdf': {
      name: 'Unir PDF',
      description: 'Junta varios PDF en uno solo, en el orden que elijas.',
      synonyms: ['unir', 'juntar', 'combinar', 'fusionar', 'agrupar', 'pdf', 'unir pdf', 'combinar pdf'],
    },
    'split-pdf': {
      name: 'Dividir PDF',
      description: 'Separa un PDF en partes: cada página, rangos o las páginas que elijas.',
      synonyms: ['dividir', 'separar', 'extraer páginas', 'cortar', 'partir', 'pdf', 'dividir pdf', 'extraer'],
    },
    'pdf-to-jpg': {
      name: 'PDF a JPG',
      description: 'Convierte cada página de un PDF en una imagen JPG o PNG.',
      synonyms: ['pdf a jpg', 'pdf a jpeg', 'pdf a png', 'pdf a imagen', 'convertir pdf', 'página a imagen', 'pdf'],
    },
    'compress-pdf': {
      name: 'Comprimir PDF',
      description: 'Haz un PDF más pequeño, con o sin tocar sus imágenes.',
      synonyms: ['comprimir pdf', 'reducir pdf', 'achicar pdf', 'tamaño del pdf', 'pdf más pequeño', 'optimizar pdf', 'pdf'],
    },
    'rotate-pdf': {
      name: 'Rotar PDF',
      description: 'Gira las páginas de un PDF, todas a la vez o una por una.',
      synonyms: ['rotar pdf', 'girar pdf', 'voltear pdf', 'girar páginas', 'horizontal', 'vertical', 'pdf'],
    },
    'delete-pdf-pages': {
      name: 'Eliminar páginas de PDF',
      description: 'Elimina las páginas que sobran de un PDF y conserva el resto.',
      synonyms: ['eliminar páginas', 'borrar páginas', 'quitar páginas', 'quitar página del pdf', 'pdf'],
    },
    'add-page-numbers-to-pdf': {
      name: 'Numerar páginas de PDF',
      description: 'Pon números a las páginas de un PDF, donde y como quieras.',
      synonyms: ['numerar páginas', 'número de página', 'paginar', 'paginación', 'numeración', 'pdf'],
    },
    'sign-pdf': {
      name: 'Firmar PDF',
      description: 'Dibuja, elige una imagen o escribe tu firma y colócala en un PDF.',
      synonyms: ['firmar pdf', 'firma', 'agregar firma', 'firmar documento', 'rúbrica', 'pdf'],
    },
    'protect-pdf': {
      name: 'Proteger PDF',
      description: 'Bloquea un PDF con contraseña, con AES-256.',
      synonyms: ['proteger pdf', 'contraseña pdf', 'poner contraseña', 'cifrar pdf', 'encriptar pdf', 'pdf'],
    },
    'unlock-pdf': {
      name: 'Desbloquear PDF',
      description: 'Quita la contraseña o las restricciones de un PDF que puedes abrir.',
      synonyms: ['quitar contraseña', 'eliminar contraseña', 'desbloquear pdf', 'descifrar pdf', 'quitar restricciones', 'pdf'],
    },
    // F18 placeholder: front T writes the es text (the name is the contract's, decision 4).
    'organize-pdf': {
      name: 'Organizar PDF',
      description: 'Move, rotate and remove the pages of a PDF in one grid.',
      synonyms: ['organize pdf', 'organize', 'rearrange', 'rotate', 'delete', 'move pages', 'manage pages', 'pdf'],
    },
    'reorder-pdf-pages': {
      name: 'Ordenar páginas de PDF',
      description: 'Cambia el orden de las páginas de un PDF.',
      // F18 (decision 4; DECISOES § 724): "organizar pdf" went to Organizar PDF, which has the term in its name.
      synonyms: ['ordenar páginas', 'reordenar páginas', 'mover páginas', 'cambiar orden', 'pdf'],
    },
    'watermark-pdf': {
      name: 'Marca de agua en PDF',
      description: 'Estampa un texto como marca de agua en todas las páginas de un PDF.',
      synonyms: ['marca de agua', 'sello', 'confidencial', 'borrador', 'agregar marca de agua', 'pdf'],
    },
    // F18 placeholder: front T writes the es text (the name is the contract's, decision 4).
    'split-pdf-extract-pages': {
      name: 'Extraer páginas de PDF',
      description: 'Save the pages you pick from a PDF in one new PDF.',
      synonyms: ['extract', 'extract pages', 'extract pages from pdf', 'pull out pages', 'save pages', 'pdf'],
    },
    // F18 placeholder: front T writes the es text (the name is the contract's, decision 4).
    'pdf-to-jpg-to-png': {
      name: 'PDF a PNG',
      description: 'Turn the pages of a PDF into sharp PNG images.',
      synonyms: ['pdf to png', 'png', 'convert pdf to png', 'pdf page to png', 'pdf'],
    },
  },
  calcs: {
    'mortgage-calculator': {
      name: 'Calculadora de hipoteca',
      description: 'Tu pago mensual con capital e intereses, impuestos, seguro, PMI y HOA.',
      synonyms: ['hipoteca', 'pago mensual', 'casa', 'vivienda', 'préstamo hipotecario', 'pago inicial', 'tabla de amortización'],
    },
    'personal-loan-calculator': {
      name: 'Calculadora de préstamo personal',
      description: 'El pago mensual, el costo total y la APR de un préstamo personal.',
      synonyms: ['préstamo personal', 'préstamo', 'pago mensual', 'apr', 'cargo por emisión', 'intereses'],
    },
    'credit-card-payoff-calculator': {
      name: 'Calculadora de tarjeta de crédito',
      description: 'Cuánto tiempo y cuántos intereses te toma pagar el saldo de tu tarjeta.',
      synonyms: ['tarjeta de crédito', 'pagar tarjeta', 'saldo de la tarjeta', 'pago mínimo', 'apr', 'intereses'],
    },
    'debt-payoff-calculator': {
      name: 'Calculadora de deudas',
      description: 'Bola de nieve o avalancha: cuándo quedas libre de deudas y cuánto pagas de intereses.',
      synonyms: ['deudas', 'salir de deudas', 'bola de nieve', 'avalancha', 'pagar deudas', 'intereses'],
    },
    'auto-loan-calculator': {
      name: 'Calculadora de préstamo para auto',
      description: 'Lo que cuesta al mes un préstamo para auto, con impuestos, cargos y el auto que entregas.',
      synonyms: ['préstamo para auto', 'préstamo de auto', 'préstamo para carro', 'financiar un auto', 'pago del auto', 'auto usado', 'concesionario', 'intereses'],
    },
    'refinance-calculator': {
      name: 'Calculadora de refinanciamiento',
      description: 'Si refinanciar tu hipoteca compensa, y en qué mes llega al punto de equilibrio.',
      synonyms: ['refinanciar', 'refinanciamiento', 'refinanciación', 'refinanciar hipoteca', 'costos de cierre', 'punto de equilibrio', 'tasa nueva', 'hipoteca'],
    },
    'home-affordability-calculator': {
      name: 'Calculadora de cuánta casa puedo pagar',
      description: 'Cuánta casa cabe en tu ingreso, con las reglas generales del 28 % y el 36 %.',
      synonyms: ['cuánta casa puedo pagar', 'cuánta casa puedo comprar', 'comprar casa', 'relación deudas-ingresos', 'dti', 'ingreso', 'pago inicial', 'hipoteca'],
    },
    'loan-amortization-calculator': {
      name: 'Calculadora de amortización',
      description: 'La tabla completa de un préstamo: capital, intereses y saldo de cada pago.',
      synonyms: ['amortización', 'tabla de amortización', 'amortización de préstamos', 'calendario de pagos', 'capital', 'intereses', 'saldo'],
    },
    'debt-consolidation-calculator': {
      name: 'Calculadora de consolidación de deudas',
      description: 'Tus deudas como están o un solo préstamo nuevo: pago, intereses y tiempo.',
      synonyms: ['consolidación de deudas', 'consolidar deudas', 'préstamo de consolidación', 'juntar deudas', 'unir deudas', 'pagar deudas', 'intereses'],
    },
    'rent-vs-buy-calculator': {
      name: 'Calculadora de alquilar o comprar',
      description: 'Tu valor neto alquilando y comprando, y cuándo comprar alcanza a alquilar.',
      synonyms: ['alquilar o comprar', 'rentar o comprar', 'alquilar vs comprar', 'comprar casa', 'alquiler', 'renta', 'valor neto', 'hipoteca'],
    },
    'savings-goal-calculator': {
      name: 'Calculadora de meta de ahorro',
      description: 'El depósito mensual para llegar a una meta, o cuánto tarda un depósito.',
      synonyms: ['meta de ahorro', 'objetivo de ahorro', 'ahorrar dinero', 'ahorro mensual', 'plan de ahorro', 'depósito', 'intereses'],
    },
    'simple-interest-calculator': {
      name: 'Calculadora de interés simple',
      description: 'Los intereses de un capital por años, meses o días, sin capitalizar.',
      synonyms: ['interés simple', 'capital', 'tasa', 'días', 'intereses'],
    },
    'apr-to-apy-calculator': {
      name: 'Calculadora de APR a APY',
      description: 'Lo que rinde una tasa con la capitalización: de APR a APY y al revés.',
      synonyms: ['apr a apy', 'apy a apr', 'apy', 'apr', 'rendimiento porcentual anual', 'tasa porcentual anual', 'capitalización'],
    },
    'mortgage-calculator-extra-payments': {
      name: 'Calculadora de pagos adicionales a la hipoteca',
      description: 'Los meses y los intereses que te ahorra pagar de más en la hipoteca.',
      synonyms: ['pagos adicionales', 'pago adicional', 'pagos extra', 'pagar la hipoteca antes', 'pago anticipado', 'abonar a capital', 'hipoteca'],
    },
    'mortgage-calculator-biweekly': {
      name: 'Calculadora de pagos cada dos semanas',
      description: 'La mitad del pago cada dos semanas frente al pago mensual.',
      synonyms: ['cada dos semanas', 'pagos cada dos semanas', 'medio pago', 'hipoteca cada dos semanas', 'pagar la hipoteca antes', 'hipoteca'],
    },
    'mortgage-calculator-15-vs-30-year': {
      name: 'Calculadora de hipoteca a 15 o 30 años',
      description: 'Los dos plazos lado a lado: el pago, los intereses y la diferencia.',
      synonyms: ['15 años', '30 años', '15 o 30', 'hipoteca a 15 años', 'hipoteca a 30 años', 'plazo de la hipoteca', 'hipoteca'],
    },
    'loan-amortization-calculator-balloon-payment': {
      name: 'Calculadora de préstamo con pago global',
      description: 'El pago de un préstamo con pago global y lo que vence al final.',
      synonyms: ['pago global', 'préstamo con pago global', 'pago final', 'pago globo', 'amortización', 'intereses'],
    },
    'compound-interest-calculator': {
      name: 'Calculadora de interés compuesto',
      description: 'Cuánto crece tu dinero con interés compuesto y depósitos mensuales.',
      synonyms: ['interés compuesto', 'ahorros', 'inversión', 'depósito mensual', 'capitalización', 'apy'],
    },
  },
  qr: {
    name: 'Generador de códigos QR',
    description: 'Un código QR de tu enlace o texto, con Oli en el centro, en PNG o SVG.',
    synonyms: ['qr', 'código qr', 'codigo qr', 'generar qr', 'crear código qr', 'generador de qr', 'qr code', 'enlace a qr', 'código de barras'],
  },
  fileGuides: {
    'guides-heic-to-jpg-on-windows': {
      name: 'Cómo convertir HEIC a JPG en Windows',
      description: 'Por qué Windows pide una extensión y qué pasa con el tamaño y la ubicación cuando una foto se vuelve JPG.',
      synonyms: ['guía', 'convertir heic a jpeg en windows', 'heic en windows'],
    },
    'guides-why-is-my-pdf-so-large': {
      name: '¿Por qué mi PDF pesa tanto?',
      description: 'Qué ocupa el espacio en un PDF y qué hace con él cada nivel de Comprimir PDF.',
      synonyms: ['guía', 'pdf pesado', 'pdf muy grande'],
    },
    'guides-social-media-image-sizes': {
      name: 'Tamaños de imagen para redes sociales',
      description: 'Los tamaños que publica cada red y cómo queda una foto cuando la redimensionas a ellos.',
      synonyms: ['guía', 'tamaño para instagram', 'dimensiones de imagen'],
    },
    'guides-open-webp-save-as-jpg': {
      name: 'Cómo abrir imágenes WebP y guardarlas como JPG',
      description: 'Qué es un WebP, dónde se abre y qué cambia cuando se vuelve JPG.',
      synonyms: ['guía', 'guardar webp como jpeg', 'abrir webp'],
    },
    'guides-jpg-vs-png': {
      name: 'JPG o PNG: cuál usar',
      description: 'Cuándo gana cada formato, medido con las mismas fotos en los dos.',
      synonyms: ['guía', 'jpeg o png', 'png o jpg'],
    },
    'guides-remove-location-from-photos': {
      name: 'Cómo quitar la ubicación de las fotos',
      description: 'Dónde guarda una foto su ubicación y cómo quitarla sin cambiar ningún píxel.',
      synonyms: ['guía', 'quitar gps', 'ubicación exif'],
    },
    'guides-pdf-to-jpg-resolution': {
      name: 'Qué resolución elegir para pasar un PDF a JPG',
      description: 'Lo que una resolución más alta suma a los píxeles y al archivo, página por página.',
      synonyms: ['guía', 'resolución jpeg', 'píxeles por pulgada', 'ppp'],
    },
    'guides-split-pdf-file-size': {
      name: 'Cómo dividir un PDF y por qué las partes pueden pesar más',
      description: 'Por qué las partes de un PDF pueden sumar más que el original, y cuándo no.',
      synonyms: ['guía', 'tamaño al dividir un pdf', 'partes de un pdf'],
    },
    'guides-combine-pdfs-on-phone': {
      name: 'Cómo unir PDF en el celular',
      description: 'Las formas de juntar PDF en un iPhone o en un celular Android, y el tamaño que obtienes.',
      synonyms: ['guía', 'juntar pdf en iphone', 'pdf en android'],
    },
    'guides-photos-to-one-pdf': {
      name: 'Cómo convertir fotos en un solo PDF',
      description: 'Un solo PDF con unas cuantas fotos, y lo que cambia su tamaño si comprimes antes las fotos.',
      synonyms: ['guía', 'fotos a pdf', 'juntar fotos en pdf'],
    },
  },
  guides: {
    'guides-15-vs-30-year-mortgage': {
      name: 'Hipoteca a 15 o 30 años: el costo real',
      description: 'Lo que cuesta al mes el plazo corto y lo que ahorra en intereses, tasa por tasa.',
      synonyms: ['guía', '15 o 30 años', 'plazo de la hipoteca'],
    },
    'guides-debt-snowball-vs-avalanche': {
      name: 'Bola de nieve o avalancha, con números',
      description: 'Las dos formas de pagar deudas, aplicadas a las mismas cuatro deudas.',
      synonyms: ['guía', 'bola de nieve', 'avalancha'],
    },
    'guides-extra-mortgage-payments': {
      name: 'Cómo los pagos adicionales acortan una hipoteca',
      description: 'Lo que hace pagar un poco más cada mes con el plazo y los intereses.',
      synonyms: ['guía', 'pagos adicionales', 'pagar la hipoteca antes'],
    },
    'guides-refinance-break-even': {
      name: 'Refinanciamiento: halla tu mes de equilibrio',
      description: 'Dos formas de contar el punto de equilibrio, y por qué pueden no coincidir.',
      synonyms: ['guía', 'refinanciar', 'punto de equilibrio'],
    },
    'guides-rent-vs-buy-break-even': {
      name: 'Alquilar o comprar: cuándo empieza a convenir comprar',
      description: 'El año en que comprar alcanza a alquilar, y lo que lo mueve.',
      synonyms: ['guía', 'alquilar o comprar', 'punto de equilibrio'],
    },
  },
} satisfies EsCommonTexts;
