import type { LegalTexts } from '../types.ts';

export default {
  title: 'Política de privacidad',
  description:
    'Cómo trata FileOrca tus datos: tus archivos no salen del dispositivo, qué procesan Google Analytics, AdSense y Cloudflare, y tus derechos (LGPD y RGPD).',
  h1: 'Política de privacidad',
  updated: 'Última actualización: 1 de noviembre de 2026',
  intro:
    'Esta página explica qué pasa con tus datos en fileorca.com. En resumen: tus archivos nunca salen de tu dispositivo. Más abajo ves quién es el responsable, qué se recopila, quién lo recopila y cuáles son tus derechos.',
  sections: [
    {
      heading: 'Quién es el responsable',
      paragraphs: [
        'El responsable del tratamiento de tus datos personales en fileorca.com (controlador, en la LGPD) es Victor Yuki Matusita, persona física y desarrollador de Curitiba, Paraná, Brasil. FileOrca está hecho y mantenido por una sola persona.',
        'Para cualquier duda sobre esta política o sobre tus datos, escribe a contato@fileorca.com. Puedes saber más sobre mí en https://vmatusita.com.br.',
      ],
    },
    {
      heading: 'Tus archivos se quedan en tu dispositivo',
      paragraphs: [
        'Las herramientas de FileOrca funcionan en tu navegador. Los archivos que eliges se procesan en tu dispositivo y nunca se suben. FileOrca no tiene ningún servidor que los procese, y no necesitas crear una cuenta.',
        'Los números siguen el mismo principio. Lo que escribes en una herramienta, como un ancho, un alto o un porcentaje, se queda en tu navegador: no se añade a la dirección de la página y ningún evento de analítica lleva esos números.',
        'Las calculadoras de dinero funcionan igual. Los precios, las tasas y los saldos que escribes se calculan en tu dispositivo y nunca se envían. El PDF y el CSV de una calculadora también se generan en tu dispositivo. El botón de copiar el enlace pone tus números después del # de la dirección copiada: esa parte de la dirección se queda en el navegador que la abre y nunca llega a nuestro servidor, y la página nunca la añade a la dirección por su cuenta.',
        'Las herramientas de imagen, por ejemplo, guardan el resultado sin los metadatos de la foto, incluida la ubicación GPS.',
        'Puedes comprobarlo: abre la pestaña Red de tu navegador mientras usas una herramienta. Ninguna solicitud lleva tu archivo.',
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
        'Google Analytics mide las vistas de página y una lista fija de eventos. Ningún evento lleva nombres de archivo, el contenido de los archivos ni números que escribas. Los eventos son:',
      ],
      list: [
        'Herramienta iniciada',
        'Herramienta terminada',
        'Descarga',
        'Clic en una sugerencia de siguiente paso',
        'Error de la herramienta, con el navegador y el formato del archivo',
        'Clic en un enlace de donación',
        'Primer resultado de una calculadora, solo con el nombre de la calculadora',
        'Descarga del PDF o del CSV de una calculadora, solo con el formato',
        'Clic en copiar el enlace de una calculadora, sin el enlace',
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
      heading: 'Tu elección de cookies en el navegador',
      paragraphs: [
        'FileOrca guarda tu elección sobre cookies en el almacenamiento local (local storage) de tu navegador, para que el aviso no vuelva cada vez. Este registro se queda en tu dispositivo. Para borrarlo, elimina los datos del sitio en tu navegador; el aviso volverá a aparecer.',
        'Si aceptas en el aviso de cookies, FileOrca también cuenta allí cuántas veces usaste una herramienta y generó al menos un archivo nuevo en este navegador (un lote de archivos cuenta como una sola vez), para que el pedido de café aparezca solo a partir de la tercera vez y como mucho una vez por semana; si pides no verlo más, eso también se guarda allí. Ese recuento se queda solo en tu navegador y nunca sale de él, y se borra si rechazas las cookies después.',
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
        'Correos electrónicos: se conservan solo el tiempo necesario para responderte.',
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
