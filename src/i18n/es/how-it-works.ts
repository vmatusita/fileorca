import type { HowItWorksTexts } from '../types.ts';

// F19a (decisión 7; DECISOES § 759 a § 761): la página Cómo funciona, con las mismas claves del inglés. Cada frase tiene su
// prueba en tests/unit/how-it-works.test.ts; los pasos de cada navegador vienen de la documentación oficial leída el
// 13/nov/2026 (§ 760), con los nombres de la interfaz en español donde la documentación los trae (la herramienta Red y la
// columna Dominio de Edge, la opción de Safari) y una descripción donde solo existe en inglés (el monitor de red de Firefox,
// la pestaña de red de Safari).
export default {
  title: 'Cómo funciona FileOrca: qué pasa con tu archivo',
  description: 'Qué pasa con el archivo que abres en FileOrca, qué funciona con WebAssembly, qué viaja por la red y qué nunca, y cómo comprobarlo en tu navegador.',
  h1: 'Cómo funciona FileOrca',
  intro: 'Las herramientas de FileOrca funcionan en tu navegador. Esta página muestra qué pasa con tu archivo, qué código hace el trabajo, qué viaja por la red y qué nunca, y cómo puedes comprobarlo tú.',
  file: {
    heading: 'Qué pasa con tu archivo',
    paragraphs: [
      {
        open: 'Cuando abres una herramienta, tu navegador descarga la página y su código desde fileorca.com.',
        read: 'Cuando eliges o sueltas un archivo, el navegador lo lee en su propia memoria, en tu dispositivo.',
        work: 'La herramienta hace el trabajo ahí mismo, con el código que tu navegador descargó de fileorca.com.',
        result: 'El resultado también se crea ahí, y Descargar lo guarda desde la memoria del navegador en tu dispositivo.',
        nothing: 'El archivo en sí nunca se envía: ninguna solicitud de la página lo lleva.',
      },
      {
        numbers: 'Las calculadoras hacen lo mismo con los números que escribes: se quedan en tu dispositivo.',
        address: 'Nunca se agregan a la dirección de la página, y ningún evento de Analytics los lleva.',
        hash: 'Copiar enlace los pone después del # del enlace que copia, la parte de una dirección que el navegador se guarda y nunca envía a un servidor.',
      },
      {
        qr: 'El generador de códigos QR dibuja el código en tu navegador, y el texto que escribes no va a ninguna parte.',
      },
    ],
  },
  wasm: {
    heading: 'Qué funciona con WebAssembly',
    paragraphs: [
      {
        what: 'Parte del trabajo lo hacen bibliotecas compiladas a WebAssembly, que tu navegador ejecuta como el resto del código de la página.',
        table: 'La tabla las enumera y se arma con los archivos que sirve el sitio: cada archivo de WebAssembly tiene su fila, y cada fila tiene sus archivos.',
        same: 'Cada uno de esos archivos es el que publica su biblioteca, sin ningún cambio, y llega desde fileorca.com.',
      },
    ],
    table: {
      caption: 'Las bibliotecas que hacen el trabajo en tu navegador',
      library: 'Biblioteca',
      does: 'Qué hace',
      tools: 'Herramientas que pueden usarla',
      wasm: 'WebAssembly',
      js: 'JavaScript',
      files: 'Archivos: {files}',
      license: 'Licencia: {pkg}',
    },
    does: {
      mozjpeg: 'Lee y escribe archivos JPEG.',
      libwebp: 'Lee y escribe archivos WebP.',
      oxipng: 'Reduce un PNG sin cambiar ningún píxel.',
      resize: 'Cambia el tamaño de una imagen.',
      libheif: 'Lee fotos HEIC.',
      libavif: 'Lee y escribe archivos AVIF.',
      qpdf: 'Reescribe y comprime archivos PDF, y pone o quita una contraseña.',
      jbig2: 'Dentro de PDF.js, lee las imágenes JBIG2 y CCITT de un PDF.',
      openjpeg: 'Dentro de PDF.js, lee las imágenes JPEG 2000 de un PDF.',
      pdfjs: 'Dibuja las páginas de un PDF.',
      'pdf-lib': 'Arma y edita archivos PDF.',
    },
    after: [
      {
        native: 'Para leer una imagen, la herramienta le pide primero al navegador; WebAssembly entra cuando la imagen es demasiado grande para que el navegador la dibuje de una vez y cuando el navegador no lee su formato.',
        js: 'PDF.js, que dibuja las páginas de un PDF, y pdf-lib, que arma y edita archivos PDF, son JavaScript; solo los dos decodificadores de imagen dentro de PDF.js son WebAssembly.',
        threads: 'Todo funciona en un solo hilo de ejecución, y ninguna página necesita los encabezados de aislamiento que algunos sitios le piden al navegador.',
        licenses: 'La página {licenses} tiene la licencia de cada biblioteca; libheif, que es LGPL-3.0, queda en un archivo aparte, sin cambios.',
      },
    ],
  },
  network: {
    heading: 'Qué viaja por la red y qué nunca',
    paragraphs: [
      {
        page: 'Tu navegador descarga de fileorca.com los archivos de cada página que abres: la página, sus scripts, estilos y fuentes y, la primera vez que usas una herramienta, su motor.',
        analytics: 'En fileorca.com, la página también carga Google Analytics, que cuenta las visitas y una lista corta y cerrada de eventos, como el nombre de la herramienta que usaste.',
        consent: 'El aviso de cookies decide solo lo que Google Analytics puede guardar en tu navegador: rechazar no lo apaga, y entonces funciona sin cookies.',
        ads: 'Cuando los anuncios estén activos, Google los mostrará en páginas como las de herramientas y guías, como describe la página {privacy}; esta página no tiene anuncios.',
      },
      {
        never: 'Lo que nunca sale de tu dispositivo: tu archivo, su nombre, la contraseña de un PDF y los números y textos que escribes.',
        privacy: 'La página {privacy} explica en detalle qué se recopila, quién lo hace y cuáles son tus derechos.',
      },
    ],
  },
  check: {
    heading: 'Cómo comprobarlo en tu navegador',
    paragraphs: [
      {
        intro: 'Las herramientas para desarrolladores del navegador muestran las solicitudes que hace una página, así que puedes ver qué envía una herramienta mientras trabaja.',
      },
    ],
    chrome: {
      heading: 'Chrome y Edge',
      steps: {
        open: 'Abre la herramienta, presiona Ctrl+Mayús+J, o Comando+Opción+J en una Mac, y haz clic en la pestaña Red.',
        before: 'La lista se llena solo mientras esas herramientas están abiertas, así que ábrelas antes de elegir tu archivo.',
        domain: 'Para ver adónde va cada solicitud, haz clic con el botón derecho en el encabezado de la lista y elige Dominio.',
      },
    },
    firefox: {
      heading: 'Firefox',
      steps: {
        open: 'Abre la herramienta y presiona Ctrl+Mayús+E, o Cmd+Opción+E en una Mac, para abrir el monitor de red.',
        before: 'Registra las solicitudes mientras esas herramientas están abiertas, así que ábrelas antes de elegir tu archivo.',
        domain: 'La columna del dominio dice adónde va cada solicitud; con el botón derecho en el encabezado de la lista, muestras u ocultas una columna.',
      },
    },
    safari: {
      heading: 'Safari en una Mac',
      steps: {
        settings: 'Elige Safari > Configuración > Avanzado y selecciona la opción Mostrar funciones para desarrolladores web.',
        open: 'Abre la herramienta, presiona Opción+Comando+I para abrir el Web Inspector y haz clic en la pestaña de red.',
        before: 'Esa pestaña muestra las solicitudes hechas desde que se abrió el Web Inspector, con el dominio de cada una, así que ábrelo antes de elegir tu archivo.',
      },
    },
    watch: {
      heading: 'Después, en cualquiera de ellos',
      steps: {
        use: 'Elige tu archivo y deja que la herramienta trabaje.',
        rows: 'Las solicitudes nuevas son archivos de fileorca.com que la herramienta necesita, como su motor, y, en fileorca.com, los eventos de Analytics de la parte anterior.',
        none: 'Ninguna de ellas lleva tu archivo.',
      },
    },
    phone: {
      heading: 'En el celular',
      steps: {
        load: 'Abre la herramienta con internet y úsala una vez con un archivo, para que la página y su motor se carguen.',
        airplane: 'Activa el modo avión y usa la herramienta con otro archivo: sigue funcionando, sin red.',
      },
    },
  },
  limits: {
    heading: 'Lo que la prueba no demuestra',
    paragraphs: [
      {
        extension: 'Una extensión que instalaste en el navegador puede leer las páginas que abres, esta también: la prueba es sobre la página, no sobre todo lo que funciona en tu navegador.',
        again: 'Además vale solo para la página que tienes abierta, así que puedes repetirla cuando quieras.',
      },
    ],
  },
} satisfies HowItWorksTexts;
