// The PDF hub /es/herramientas-pdf/ in Spanish (F6, decision 4; docs/i18n/es.md): the band, the grid of the PDF tools,
// the guide of which tool does which job (DECISOES § 96) and how the files stay on the device. No file guides here:
// they exist only in English.
import type { PdfToolsTexts } from '../types.ts';

const texts: PdfToolsTexts = {
  title: 'Herramientas PDF: une, divide, comprime y más, en tu navegador',
  description: 'Herramientas PDF gratis que funcionan en tu navegador: une, divide, comprime, convierte a JPG, gira, numera, firma y protege PDF sin subirlos.',
  eyebrow: 'PDF',
  h1: 'Herramientas PDF gratis que nunca suben tus archivos',
  intro: 'Une, divide, comprime, convierte, numera, firma y protege PDF. Cada herramienta funciona en tu dispositivo: sin cuenta, sin subir nada y sin límite de archivos.',
  toolsHeading: 'Todas las herramientas PDF',
  guideHeading: '¿Qué herramienta necesitas?',
  guideIntro: 'La mayoría de las tareas con PDF son una de estas. Elige la línea que se parezca a la tuya.',
  guide: [
    { before: 'Varios PDF que deberían ser un solo archivo, en un orden fijo:', tool: 'merge-pdf', after: 'los junta y conserva sus marcadores y campos de formulario.' },
    { before: 'Un PDF largo del que solo necesitas algunas páginas, o cada página por separado:', tool: 'split-pdf', after: 'lo corta por rangos, por las páginas que elijas o página por página.' },
    { before: 'Un PDF demasiado grande para mandarlo por correo o subirlo a un formulario:', tool: 'compress-pdf', after: 'ordena su estructura y, en el modo Recomendada, aligera sus fotos.' },
    { before: 'Páginas que quieres como imágenes, para una presentación o un mensaje:', tool: 'pdf-to-jpg', after: 'dibuja cada página como JPG o PNG con la resolución que elijas.' },
    { before: 'Fotos o escaneos que deberían ser un PDF:', tool: 'image-to-pdf', after: 'pone una imagen en cada página, en el orden de la lista.' },
    { before: 'Un escaneo que salió de lado o al revés:', tool: 'rotate-pdf', after: 'gira todas las páginas, o solo las que lo necesitan, sin volver a dibujarlas.' },
    { before: 'Páginas en blanco o que sobran en medio del documento:', tool: 'delete-pdf-pages', after: 'las quita y deja todo lo demás como estaba.' },
    // F18 placeholder: front T writes the es text.
    { before: 'Pages to move, turn and take out of the same PDF:', tool: 'organize-pdf', after: 'does all three in one grid and saves one new PDF.' },
    { before: 'Páginas en el orden equivocado:', tool: 'reorder-pdf-pages', after: 'te deja arrastrarlas o moverlas con botones o con el teclado.' },
    { before: 'Un informe o una tesis que necesita páginas numeradas:', tool: 'add-page-numbers-to-pdf', after: 'escribe los números donde quieras, en uno de cuatro formatos.' },
    { before: 'Un documento que hay que marcar como borrador o como confidencial:', tool: 'watermark-pdf', after: 'estampa tu texto en el centro de cada página.' },
    { before: 'Un formulario o una carta para firmar y devolver:', tool: 'sign-pdf', after: 'coloca tu firma dibujada, en imagen o escrita en las páginas que elijas.' },
    { before: 'Un PDF que solo debería abrirse con contraseña:', tool: 'protect-pdf', after: 'lo bloquea con cifrado AES-256.' },
    { before: 'Un PDF tuyo que pide la contraseña cada vez que lo abres:', tool: 'unlock-pdf', after: 'quita la contraseña, una vez que la escribes, o las restricciones de edición.' },
  ],
  guideOutro: 'Las herramientas se combinan bien: primero une, después numera las páginas y al final comprime el resultado. Cada una te da un archivo nuevo y deja tu original como estaba.',
  privacyHeading: 'Tus PDF se quedan en tu dispositivo',
  privacy: [
    'Cada herramienta PDF de aquí lee y escribe el archivo dentro de tu navegador. El PDF se abre con PDF.js, el lector que usa Firefox, y se modifica con pdf-lib y qpdf, compilados para funcionar en la página. Nada se envía a un servidor, así que no hay ninguna subida que esperar ni queda una copia de tu archivo en otro lugar.',
    'La contraseña que escribes para proteger o abrir un PDF solo está en la página mientras la usas, y desaparece cuando cierras la página. Tampoco se guarda la firma que dibujas, eliges como imagen o escribes. Abre la pestaña Red de tu navegador mientras una herramienta trabaja: ninguna solicitud lleva tu archivo, tu contraseña ni tu texto.',
  ],
  // F18 placeholder: front T writes the es text.
  presetsHeading: 'Ready-made settings',
  presetsCaption: 'Ready-made settings of the PDF tools and what each one gives',
  presetsHead: ['Preset', 'What you get'],
};

export default texts;
