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
  },
  breadcrumb: { label: 'Ruta de navegación', home: 'Inicio' },
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
    coffee: '¿Te gustan estas herramientas? Invítame un café',
    signature: 'Hecho por {name} en {city}',
  },
  cookie: {
    title: 'Cookies, en pocas palabras.',
    body: 'Usamos Google Analytics para ver qué herramientas ayudan y anuncios para mantener el sitio gratis. Aceptes o no, tus archivos nunca salen de tu dispositivo.',
    privacyLink: 'Privacidad',
    accept: 'Aceptar',
    decline: 'Rechazar',
    change: 'Cambiar mi elección de cookies',
  },
  adLabel: 'Anuncios',
  search: {
    dialogLabel: 'Buscar herramientas',
    inputLabel: 'Buscar herramientas',
    listLabel: 'Herramientas',
    placeholder: 'Busca una herramienta',
    close: 'Cerrar',
    emptyTitle: 'No hay ninguna herramienta llamada "{query}"',
    emptyHint: 'Prueba con "comprimir", "PDF" o "hipoteca".',
    imageCategory: 'Imagen',
    moneyCategory: 'Calculadoras financieras',
    pdfCategory: 'PDF',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Herramientas de imagen',
  pdfTools: 'Herramientas PDF',
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
    'image-to-pdf': {
      name: 'Imagen a PDF',
      description: 'Junta tus imágenes en un solo PDF, una imagen por página.',
      synonyms: ['pdf', 'jpg a pdf', 'png a pdf', 'foto a pdf', 'unir imágenes', 'juntar fotos', 'jpg', 'png', 'imagen'],
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
      description: 'Quita páginas de un PDF y quédate con el resto.',
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
    'reorder-pdf-pages': {
      name: 'Ordenar páginas de PDF',
      description: 'Cambia el orden de las páginas de un PDF.',
      synonyms: ['ordenar páginas', 'reordenar páginas', 'mover páginas', 'cambiar orden', 'organizar pdf', 'pdf'],
    },
    'watermark-pdf': {
      name: 'Marca de agua en PDF',
      description: 'Estampa un texto como marca de agua en todas las páginas de un PDF.',
      synonyms: ['marca de agua', 'sello', 'confidencial', 'borrador', 'agregar marca de agua', 'pdf'],
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
    'compound-interest-calculator': {
      name: 'Calculadora de interés compuesto',
      description: 'Cuánto crece tu dinero con interés compuesto y depósitos mensuales.',
      synonyms: ['interés compuesto', 'ahorros', 'inversión', 'depósito mensual', 'capitalización', 'apy'],
    },
  },
} satisfies EsCommonTexts;
