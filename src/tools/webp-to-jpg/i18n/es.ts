import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'WebP a JPG en línea, sin subir archivos',
  description:
    'Convierte imágenes WebP a JPG o PNG en tu navegador. Sin subir nada y sin límite de imágenes; un WebP animado da su primer fotograma y se quitan los datos GPS.',
  h1: 'WebP a JPG',
  howHeading: 'Cómo convertir WebP a JPG',
  howSteps: [
    'Suelta tus imágenes WebP en el cuadro, elígelas o pégalas con Ctrl V.',
    'Deja JPG, o elige PNG.',
    'Descarga la imagen convertida.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'WebP a JPG: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Archivos WebP, fijos o animados, reconocidos por el contenido del archivo y no por el nombre.'],
      ['Resultado', 'JPG, que es la opción predeterminada, o PNG. Sale un archivo por cada WebP.'],
      ['Transparencia', 'El JPG no tiene transparencia, así que queda blanca. El PNG la conserva.'],
      ['WebP animado', 'Queda en su primer fotograma, y el resultado te lo dice.'],
      ['Tamaño', 'Un JPG de la misma imagen suele pesar más que el WebP, y en las fotos un PNG pesa todavía más.'],
      ['Lote', 'Sin límite de imágenes. Una imagen se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Por qué los sitios web guardan las imágenes en WebP?',
      a: 'Las páginas que usan WebP cargan más rápido, así que muchos sitios envían WebP a los navegadores que lo admiten, y tu navegador guarda lo que recibió. Un JPG hecho a partir de él se abre en cualquier editor y formulario.',
    },
    {
      q: '¿Puedo convertir un WebP animado a JPG?',
      a: 'Sí, pero un JPG es una sola imagen, así que el movimiento se pierde. Para conservarlo, quédate con el WebP.',
    },
    {
      q: '¿Por qué el JPG pesa más que el WebP?',
      a: 'WebP es un formato más nuevo que guarda la misma imagen en menos bytes que el JPG. Volver a JPG renuncia a parte de ese ahorro a cambio de un archivo que aceptan todas las apps y todos los sitios web.',
    },
    {
      q: '¿Puedo simplemente cambiar el nombre del archivo .webp a .jpg?',
      a: 'No. Cambiar el nombre solo cambia el nombre, y los datos de adentro siguen siendo WebP, así que algunas apps y formularios lo siguen rechazando. Convertir escribe un JPG de verdad.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'WebP',
    progressLabel: 'Convirtiendo las imágenes',
    done: '¡Listo! Tu imagen quedó convertida.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron convertidas.',
    options: {
      legend: 'Guardar como',
      jpg: 'JPG',
      png: 'PNG',
      help: 'El JPG se abre en todas partes y puede salir más grande que el WebP. La transparencia queda blanca. El PNG conserva la transparencia, pero el archivo pesa más.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
