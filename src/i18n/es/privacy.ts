import type { LegalTexts } from '../types.ts';

export default {
  title: 'Política de privacidad',
  description:
    'Cómo trata FileOrca tus datos: tus archivos no salen del dispositivo, qué procesan Google Analytics, AdSense y Cloudflare, y tus derechos (LGPD y RGPD).',
  h1: 'Política de privacidad',
  updated: 'Última actualización: 3 de noviembre de 2026',
  intro:
    'Esta página explica qué pasa con tus datos en fileorca.com. En resumen: tus archivos nunca salen de tu dispositivo, y el tema que eliges en el encabezado se queda en tu navegador. Más abajo ves quién es el responsable, qué se recopila, quién lo recopila y cuáles son tus derechos.',
  sections: [
    {
      heading: 'Quién es el responsable',
      paragraphs: [
        'El responsable del tratamiento de tus datos personales en fileorca.com (controlador, en la LGPD) es Victor Yuki Matusita, persona física y desarrollador de Curitiba, Paraná, Brasil. FileOrca lo hace y lo mantiene una sola persona.',
        'Para cualquier duda sobre esta política o sobre tus datos, escribe a contato@fileorca.com. Puedes saber más sobre mí en https://vmatusita.com.br.',
      ],
    },
    {
      heading: 'Tus archivos se quedan en tu dispositivo',
      paragraphs: [
        'Las herramientas de FileOrca funcionan en tu navegador. Los archivos que eliges se procesan en tu dispositivo y nunca se suben. FileOrca no tiene ningún servidor que los procese, y no necesitas una cuenta.',
        'Con los números pasa lo mismo. Lo que escribes en una herramienta, como un ancho, un alto o un porcentaje, se queda en tu navegador: no se agrega a la dirección de la página y ningún evento de analítica lo lleva.',
        'Las calculadoras de dinero funcionan igual. Los precios, las tasas y los saldos que escribes se calculan en tu dispositivo y nunca se envían a ningún lugar. El PDF y el CSV de una calculadora también se generan en tu dispositivo. Copiar enlace pone tus números después del # de la dirección que copia: esa parte de una dirección se queda en el navegador que la abre y nunca se envía a nuestro servidor, y la página nunca la agrega a la dirección por su cuenta.',
        'Las calculadoras de casa y de salud, que solo existen en inglés, funcionan igual. Las medidas que escribes, como la estatura, el peso, la cintura o un área, y las fechas que indicas, como el primer día de la última menstruación o la fecha de la concepción o de la transferencia del embrión, se calculan en tu dispositivo y nunca se envían a ningún lugar. El enlace que copian lleva esos números, esas fechas y las opciones que elegiste, como las unidades, el sexo que usa la fórmula o la forma de contar la fecha del parto, después del # de la dirección, la parte que el navegador nunca envía. La calculadora de la fecha probable de parto lee la fecha de hoy en el reloj de tu dispositivo, y esa fecha tampoco se envía nunca.',
        'El generador de códigos QR funciona igual. El código se arma en tu navegador a partir del texto o la dirección que escribes, y ese texto se queda en tu dispositivo: no se agrega a la dirección de la página, ningún evento de analítica lo lleva, no se guarda en tu navegador ni en una cookie y no aparece en el nombre de los archivos que descargas, codigo-qr.png y codigo-qr.svg. FileOrca nunca abre la dirección que escribes ni le hace ninguna solicitud.',
        'Las herramientas de PDF funcionan igual. Tu PDF se lee y se escribe en tu dispositivo, con PDF.js y qpdf, dos bibliotecas de código abierto que funcionan en tu navegador. Lo que escribes ahí, como un rango de páginas o el texto de una marca de agua, se queda en tu navegador. La contraseña que escribes al proteger o desbloquear un PDF no sale de tu dispositivo y no se guarda, ni en un servidor ni en tu navegador. La firma que dibujas, tomas de una imagen o escribes al firmar un PDF tampoco se guarda en ningún lugar.',
        'Las herramientas de imagen, por ejemplo, guardan una copia nueva de tu foto que deja fuera sus metadatos, incluida la ubicación GPS.',
        'Puedes comprobarlo por tu cuenta. Abre la pestaña Red de tu navegador mientras usas una herramienta: ninguna solicitud lleva tu archivo.',
      ],
    },
    {
      heading: 'La copia guardada para usar sin conexión',
      paragraphs: [
        'Cuando abres una página de FileOrca con internet, tu navegador guarda una copia de esa página y de los archivos del sitio que necesita, como los scripts, los estilos, las fuentes y el motor de una herramienta que usaste, para que la página también funcione sin conexión. Esa copia se queda en tu dispositivo, en el almacenamiento del navegador, y FileOrca nunca la recibe.',
        'Tus archivos y tus números nunca entran en esa copia. Solo guarda archivos de fileorca.com, en direcciones sin la parte después del ? o del #, así que lo que escribes, abres o guardas queda fuera.',
        'Para borrar la copia, borra los datos del sitio fileorca.com en la configuración del navegador, o desinstala la app de FileOrca si la instalaste.',
        'En Android, cuando compartes imágenes o PDF con la app de FileOrca instalada, esperan en tu dispositivo hasta que eliges una herramienta, en un lugar propio del almacenamiento del navegador, aparte de la copia de las páginas. Se borran cuando la herramienta los recibe; si no eliges ninguna, se borran la próxima vez que abras FileOrca después de una hora. Esto funciona porque el navegador guarda la parte del sitio para usarlo sin conexión, que recibe en tu primera visita con internet. Si borras los datos del sitio, abre fileorca.com una vez antes de volver a compartir. Sin esa parte, Android envía los archivos compartidos a fileorca.com, que los rechaza y no los guarda. Cuando eliges una herramienta, la página anota en esta pestaña cuál elegiste, y nada más.',
      ],
    },
    {
      heading: 'Entrega del sitio (Cloudflare)',
      paragraphs: [
        'FileOrca es un sitio estático que entrega Cloudflare. Cuando tu navegador pide una página, Cloudflare procesa datos técnicos de la solicitud, como tu dirección IP y tu navegador, para entregar y proteger el sitio.',
        'Estos datos no incluyen tus archivos. Cloudflare los trata según sus propias políticas.',
      ],
    },
    {
      heading: 'Analítica (Google Analytics 4)',
      paragraphs: [
        'Para saber qué herramientas ayudan a las personas, FileOrca usa Google Analytics 4, un servicio de Google. Lo que puede guardar en tu navegador depende de la opción que elijas en el aviso de cookies, como se explica en la sección sobre consentimiento, más abajo.',
        'Google Analytics mide las vistas de página y una lista fija de eventos. Ningún evento lleva nombres de archivo, el contenido de los archivos ni los números, las fechas o los textos que escribas. Los eventos son:',
      ],
      list: [
        'Herramienta iniciada',
        'Herramienta terminada',
        'Descarga',
        'Clic en una sugerencia de siguiente paso',
        'Error de la herramienta, con el navegador y el formato del archivo',
        'Clic en un enlace de donación',
        'Primer resultado de una calculadora, solo con el nombre de la calculadora',
        'Descarga del PDF o del CSV de una calculadora, o de un código QR en PNG o SVG, solo con el formato',
        'Clic en Copiar enlace en una calculadora, sin el enlace',
      ],
    },
    {
      heading: 'Anuncios (Google AdSense)',
      paragraphs: [
        'Para seguir siendo gratis, FileOrca muestra, o mostrará, anuncios de Google AdSense. Google es el socio de publicidad del sitio.',
        'Proveedores externos, incluido Google, usan cookies para mostrar anuncios según tus visitas anteriores a este y a otros sitios web. El uso de cookies de publicidad por parte de Google permite que Google y sus socios te muestren anuncios según esas visitas.',
        'En el Espacio Económico Europeo (EEE), el Reino Unido y Suiza, un mensaje de consentimiento de Google te pedirá tu elección antes de que los anuncios usen cookies, cuando los anuncios estén activos.',
        'Usa estos enlaces para desactivar la publicidad personalizada y para leer cómo usa Google los datos de sitios de socios:',
      ],
      list: [
        'Configuración de anuncios de Google: https://adssettings.google.com',
        'Cómo usa Google los datos de sitios de socios: https://policies.google.com/technologies/partner-sites',
      ],
    },
    {
      heading: 'Tu elección de cookies y tu tema en el navegador',
      paragraphs: [
        'FileOrca guarda tu elección sobre cookies en el almacenamiento local (local storage) de tu navegador, para que el aviso no vuelva cada vez. Este registro se queda en tu dispositivo. Para borrarlo, elimina los datos del sitio en tu navegador; el aviso volverá a aparecer.',
        'El tema que eliges con el botón del encabezado también se guarda allí, en la clave fo-theme, con el valor light o dark, y solo cuando eliges Claro u Oscuro: Sistema, el tema predeterminado, no guarda nada. Se queda en tu dispositivo y nunca se envía a ningún lugar, y no depende del aviso de cookies, porque lo pides tú. Para borrarlo, vuelve el botón a Sistema o elimina los datos del sitio en tu navegador.',
        'Si aceptas en el aviso de cookies, FileOrca también cuenta allí cuántos lotes de imágenes o de PDF terminaron con al menos un resultado real en este navegador, como una imagen más ligera, convertida, rotada, recortada o redimensionada, o un PDF nuevo, para que el pedido de café aparezca solo a partir del tercero y como mucho una vez por semana; si pides no verlo más, eso también se guarda allí. Ese recuento se queda solo en tu navegador y nunca sale de él, y se borra si rechazas las cookies después.',
        'En las calculadoras, la página guarda una marca de sí o no en el almacenamiento de sesión de esta pestaña, para que Oli celebre solo con el primer resultado de la visita. No contiene ningún número, nunca sale del navegador y desaparece cuando cierras la pestaña.',
      ],
    },
    {
      heading: 'Correos electrónicos',
      paragraphs: [
        'Los correos enviados a contato@fileorca.com los reenvía Cloudflare Email Routing a una bandeja de Gmail. Los uso solo para responderte.',
      ],
    },
    {
      heading: 'Consentimiento por región y tus opciones',
      action: 'consent-choice',
      paragraphs: [
        'El consentimiento depende de dónde estés y usa Consent Mode v2 de Google.',
        'En la Unión Europea, el EEE (Islandia, Liechtenstein y Noruega), el Reino Unido y Suiza, el almacenamiento para analítica y para anuncios está denegado por defecto hasta que aceptes.',
        'En el resto del mundo, el almacenamiento para analítica y para anuncios está permitido por defecto, y puedes rechazarlo en el aviso de cookies.',
        'Rechazar, o no haber aceptado todavía donde el consentimiento está denegado por defecto, no apaga Google Analytics: entonces funciona sin cookies, y Google puede seguir recibiendo las vistas de página y los eventos de la lista de arriba, sin ningún identificador guardado en tu navegador.',
        'Para cambiar tu elección cuando quieras, usa el botón de abajo.',
      ],
    },
    {
      heading: 'Bases legales',
      paragraphs: [
        'FileOrca sigue el Reglamento General de Protección de Datos de la Unión Europea (RGPD, o GDPR en inglés) y la LGPD (Ley 13.709/2018, la ley brasileña de protección de datos). Las bases legales son:',
      ],
      list: [
        'Consentimiento (RGPD, art. 6(1)(a); LGPD, art. 7, I) para Google Analytics y para las cookies de anuncios, cuando la ley lo exige. Puedes retirarlo en cualquier momento.',
        'Interés legítimo (RGPD, art. 6(1)(f); LGPD, art. 7, IX) para entregar y proteger el sitio, lo que cubre los datos técnicos que procesa Cloudflare.',
        'Interés legítimo (los mismos artículos) para responderte cuando escribes a contato@fileorca.com.',
      ],
    },
    {
      heading: 'Transferencias internacionales',
      paragraphs: [
        'Google y Cloudflare pueden procesar datos fuera de tu país, incluso en Estados Unidos. Ambas empresas indican que usan garantías para estas transferencias, como las cláusulas contractuales estándar.',
      ],
    },
    {
      heading: 'Cuánto tiempo se guardan los datos',
      paragraphs: [
        'FileOrca nunca recibe tus archivos, así que no guarda ninguno. Para lo demás, depende de quién maneje los datos:',
      ],
      list: [
        'Datos de analítica: se conservan durante el período definido en la configuración de retención de Google Analytics.',
        'Datos de entrega: Cloudflare los conserva según sus propias políticas.',
        'Datos de anuncios: Google los conserva según sus propias políticas.',
        'Elección de cookies: se queda en tu navegador, y puedes borrarla cuando quieras eliminando los datos del sitio.',
        'Elección del tema: la clave fo-theme se queda en tu navegador hasta que vuelvas el tema a Sistema o borres los datos del sitio.',
        'Correos electrónicos: se conservan solo el tiempo necesario para responderte.',
        'Copia sin conexión: se queda en el navegador hasta que borres los datos del sitio o desinstales la app. Los archivos compartidos con la app se borran cuando una herramienta los recibe, o la próxima vez que abras FileOrca después de una hora.',
      ],
    },
    {
      heading: 'Tus derechos',
      paragraphs: [
        'Según el RGPD y la LGPD, tienes derecho a acceder a tus datos, corregirlos, eliminarlos, recibirlos en un formato portable, oponerte a su uso y retirar tu consentimiento en cualquier momento.',
        'Para ejercer cualquiera de estos derechos, escribe a contato@fileorca.com.',
        'También puedes presentar una queja ante la ANPD (Autoridad Nacional de Protección de Datos de Brasil) o ante la autoridad de protección de datos de tu país.',
      ],
    },
    {
      heading: 'Niños',
      paragraphs: [
        'FileOrca no está dirigido a niños. Si crees que un niño envió datos personales a través del sitio o por correo electrónico, escribe a contato@fileorca.com para que se eliminen.',
      ],
    },
    {
      heading: 'Cambios en esta política',
      paragraphs: [
        'Esta política puede cambiar, por ejemplo cuando se agreguen nuevas herramientas o el sitio empiece a usar un nuevo servicio. La fecha al inicio de la página indica la última actualización.',
      ],
    },
  ],
} satisfies LegalTexts;
