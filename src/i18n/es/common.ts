import type { CommonTexts } from '../types.ts';

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
    emptyHint: 'Prueba con "comprimir", "imagen" o "foto".',
    imageCategory: 'Imagen',
    shortcut: 'Ctrl K',
  },
  tools: {
    'compress-image': {
      name: 'Comprimir imagen',
      description: 'Haz que un JPG, PNG o WebP pese menos, directamente en tu navegador.',
      synonyms: ['comprimir', 'reducir', 'achicar', 'optimizar', 'compactar', 'foto', 'imagen', 'jpg', 'png', 'webp'],
    },
  },
} satisfies CommonTexts;
