import type { WhatsNewTexts } from '../types.ts';

// F19a (decisión 2; DECISOES § 752 y § 755): la página Novedades. Las entradas (fecha, PR, páginas) están en
// src/platform/changelog.ts; cada título y texto dice qué cambió para la persona, con la voz del sitio y el glosario
// (docs/i18n/es.md), sin contar herramientas, sin nombre de fase y sin número que no venga de un registro. Hay un texto
// exactamente para las entradas que muestra el español (entriesIn('es'); tests/unit/changelog.test.ts).
export default {
  title: 'Novedades de FileOrca',
  description: 'Cada cambio que ves en FileOrca desde que el sitio salió al aire: herramientas, idiomas y guías nuevas, cada uno con el día en que llegó al sitio.',
  h1: 'Novedades',
  intro: 'Cada cambio que ves en FileOrca, del más nuevo al más antiguo, con el día en que llegó al sitio y los enlaces a las páginas que cambió.',
  more: 'y {n} más',
  entries: {
    launch: {
      title: 'FileOrca sale al aire',
      body: 'FileOrca abre con Comprimir imagen en español, inglés y portugués, y con las páginas que dicen quién hace el sitio, cómo trata tus datos y cómo escribirle a su autor.',
    },
    'private-chunks': {
      title: 'Nada oculto en PNG y WebP',
      body: 'Comprimir imagen ahora también quita los bloques privados que algunas apps esconden dentro de los archivos PNG y WebP.',
    },
    'cookie-notice-space': {
      title: 'El aviso de cookies flota',
      body: 'Mientras está abierto, el aviso de cookies flota sobre el final de la página y ya no deja una franja vacía debajo del pie de página.',
    },
    'calculator-terms': {
      title: 'Privacidad y términos de las calculadoras',
      body: 'La Privacidad dice que los números que escribes en una calculadora se calculan en tu dispositivo y nunca se envían. Los Términos dicen que las calculadoras sirven para aprender e informarte, y que no son asesoría financiera.',
    },
    'pdf-terms': {
      title: 'Términos para contraseñas y firmas',
      body: 'Los Términos explican qué hacen Proteger PDF, Desbloquear PDF y Firmar PDF con una contraseña o una firma, y la Privacidad dice que la contraseña nunca sale de tu dispositivo. Licencias da el crédito de las bibliotecas que leen y escriben el PDF.',
    },
    'portuguese-spanish': {
      title: 'FileOrca en español',
      body: 'Las herramientas de imagen y de PDF llegan en español, con calculadoras financieras en dólares para Estados Unidos. La página de inicio y las páginas sobre el sitio muestran lo que ya existe en español.',
    },
    'health-terms': {
      title: 'Términos para salud, hogar y códigos QR',
      body: 'Los Términos dicen que las calculadoras de salud, en inglés, dan estimaciones con fórmulas publicadas y no son consejo médico, y la Privacidad dice que las medidas, las fechas y el texto que escribes se quedan en tu dispositivo. Licencias da el crédito de las bibliotecas del código QR.',
    },
    offline: {
      title: 'Las páginas que abriste funcionan sin conexión',
      body: 'Las páginas que ya abriste siguen funcionando sin internet, y en Android puedes compartir una imagen o un PDF con FileOrca y elegir la herramienta. La Privacidad dice qué guarda la copia sin conexión, y que tus archivos y tus números nunca entran en ella.',
    },
    'more-in-portuguese-spanish': {
      title: 'Más páginas en español',
      body: 'Llegan en español el resto de las calculadoras financieras y sus guías, el Generador de códigos QR y las guías de archivos. La página de inicio, las páginas de herramientas y las páginas sobre el sitio llevan a ellas.',
    },
    'theme-and-menu': {
      title: 'Claro, oscuro y el Menú',
      body: 'Cada página tiene un botón de tema, para seguir el sistema o quedarse en claro u oscuro, y un Menú con las categorías del sitio. La Privacidad dice que el tema que eliges se queda solo en tu navegador.',
    },
    'guides-hub': {
      title: 'Un lugar para las guías',
      body: 'Las guías tienen una página propia, en grupos de imagen, PDF y dinero, y cada herramienta o calculadora con guía la muestra después de sus pasos.',
    },
    'header-width': {
      title: 'Encabezado y pie de página alineados',
      body: 'El encabezado y el pie de página ahora tienen los mismos bordes en cualquier ancho de pantalla.',
    },
    'support-page': {
      title: 'Apoya a Oli, renovada',
      body: 'La página Apoya a Oli se rehízo, y la línea del café ahora abre el pie de página.',
    },
    'tool-page': {
      title: 'Cada herramienta en un solo lugar',
      body: 'Cada herramienta de imagen y de PDF quedó en un solo lugar, del archivo que sueltas al resultado, sin que la página salte. Una sugerencia debajo de Descargar puede llevar el resultado a la siguiente herramienta, y la Privacidad explica cómo se queda en tu dispositivo.',
    },
    'cookie-notice': {
      title: 'Un aviso de cookies más pequeño',
      body: 'El aviso de cookies ocupa menos en el celular y nunca tapa los botones para elegir o descargar un archivo.',
    },
    'calculator-card': {
      title: 'El resultado en un solo bloque',
      body: 'Cada calculadora muestra la respuesta en un bloque arriba de la página, con Descargar PDF adentro, y un error dice qué campo corregir. El Generador de códigos QR muestra el código de la misma forma.',
    },
    'file-guide-page': {
      title: 'Una página de guía más clara',
      body: 'Cada guía de archivos empieza con lo que se midió y con la herramienta, debajo del título, y sus tablas se leen mejor en el celular.',
    },
    'home-and-hubs': {
      title: 'Página de inicio y categorías nuevas',
      body: 'La página de inicio se rehízo alrededor del mar donde nada Oli, y la página de cada categoría tiene una franja del mismo mar.',
    },
    'institutional-pages': {
      title: 'Páginas sobre el sitio, más fáciles de leer',
      body: 'En una pantalla ancha, Privacidad, Términos y Licencias muestran un índice de sus secciones, y Acerca de y Contacto, un recuadro con el sitio en números.',
    },
    'footer-phone': {
      title: 'Un pie de página más corto en el celular',
      body: 'En el celular, el pie de página muestra la página principal de cada categoría y guarda sus herramientas en una lista que abres.',
    },
    'home-cards': {
      title: 'Una tarjeta por herramienta en la página de inicio',
      body: 'Cada categoría de la página de inicio muestra sus herramientas en tarjetas, con el ícono, el nombre y lo que hace la herramienta.',
    },
    'pdf-pages': {
      title: 'Páginas enteras en las herramientas PDF',
      body: 'Las herramientas PDF muestran cada página entera, pequeña o grande, y una lupa la abre en grande, con la acción de la herramienta. Eliminar páginas de PDF muestra las páginas que se van, y un resultado que es un solo PDF tiene Ver el PDF nuevo.',
    },
    'next-steps': {
      title: 'Pasos siguientes que llevan tu archivo',
      body: 'En Imagen a PDF las fotos pueden cambiar de orden y salir de la lista, con Deshacer, y cada lote de imágenes tiene una papelera para cada archivo. Comprimir imagen baja las imágenes hasta el tamaño que escribas, con Hasta un tamaño. Las sugerencias después de un resultado llevan el archivo a más herramientas, y en el celular el código QR aparece justo debajo del campo.',
    },
    'calculator-typing': {
      title: 'Escribir en una calculadora, sin tropiezos',
      body: 'El campo de las calculadoras ahora acepta un dígito escrito en medio de un número y dice cuántos decimales acepta, y el lector de pantalla oye el resultado una vez por cada vez que escribes. El PDF rotula cada valor y dice el período de la tasa.',
    },
    'avif-webp': {
      title: 'AVIF a JPG y Convertir a WebP',
      body: 'AVIF a JPG convierte imágenes AVIF en JPG, y Convertir a WebP convierte JPG y PNG en archivos WebP o AVIF más pequeños. Un AVIF soltado en otra herramienta de imagen te lleva a AVIF a JPG.',
    },
    'organize-exif': {
      title: 'Organizar PDF y Quitar metadatos de la foto',
      body: 'Organizar PDF te deja marcar, rotar, quitar y mover páginas en una sola cuadrícula, y Quitar metadatos de la foto saca la ubicación y los demás metadatos de una foto sin tocar sus píxeles. Nuevos ajustes predefinidos extraen páginas de un PDF, pasan un PDF a PNG y reflejan una imagen.',
    },
    'file-guides-measured': {
      title: 'Los números de las guías, medidos otra vez',
      body: 'Todos los números de las guías de archivos se midieron otra vez, y la guía para quitar la ubicación de las fotos ahora usa Quitar metadatos de la foto.',
    },
    'trust-and-content': {
      title: 'Novedades y Cómo funciona',
      body: 'Esta página reúne cada cambio que ves, y Cómo funciona muestra qué pasa con tu archivo y cómo comprobarlo en tu navegador. Las páginas de las herramientas y de las calculadoras ahora dicen cada cosa en un solo lugar, y el día en que el sitio salió al aire está ahora en Acerca de.',
    },
  },
} satisfies WhatsNewTexts;
