import type { WallTexts } from '../types.ts';

// F12 · a parede do bloqueador (decisión 10, con el ajuste 3; § 431). Los textos de la especificación (wall.html), con la
// 2.ª frase y los botones del ajuste 3. Los pasos de la ayuda vienen de la ayuda pública de cada producto; ninguno tiene enlace.
// La nota de Brave dice "celular": el glosario (docs/i18n/es.md, "Nunca") no deja "móvil".
export default {
  title: 'Oli vive de los anuncios',
  body: 'FileOrca es gratis, sin registros ni límites, porque los anuncios pagan las cuentas. Con un bloqueador activado, los anuncios no se ven y no entra nada. Desactívalo para fileorca.com y vuelve a cargar la página.',
  later: '“Seguir solo esta vez” vuelve mañana.',
  reload: 'Recargar, ya lo desactivé',
  help: 'Ver cómo desactivarlo',
  escape: 'Seguir solo esta vez',
  close: 'Cerrar',
  helpTitle: 'Desactívalo solo para fileorca.com',
  helpHint: 'Busca el tuyo en la lista. Todos los bloqueadores pueden dejar pasar un solo sitio y seguir bloqueando el resto.',
  entries: {
    ubo: {
      name: 'uBlock Origin',
      steps: ['Abre uBlock Origin desde su icono en la barra del navegador.', 'Pulsa el botón grande de encendido, azul. Se vuelve gris.', 'Recarga la página.'],
      note: '¿Usas uBO Lite? Mueve el “modo de filtrado” hasta “sin filtrado”.',
    },
    adblock: {
      name: 'AdBlock',
      steps: ['Abre AdBlock desde su icono en la barra del navegador.', 'Elige “Pausar en este sitio web”.', 'La página se recarga sola.'],
      note: 'La pausa dura 7 días y se renueva en cada visita.',
    },
    abp: {
      name: 'Adblock Plus',
      steps: ['Abre Adblock Plus desde su icono en la barra del navegador.', 'Desactiva el interruptor “Este sitio web”.', 'Pulsa “Actualizar”.'],
      note: 'La pausa dura 7 días y se renueva en cada visita.',
    },
    adguard: {
      name: 'AdGuard',
      steps: ['Abre AdGuard desde su icono en la barra del navegador.', 'Desactiva “Protección para el sitio web actual”.', 'Recarga la página.'],
      note: 'El icono de pausa, arriba, detiene AdGuard en todos los sitios. El interruptor basta.',
    },
    brave: {
      name: 'Brave',
      steps: [
        'Abre Brave Shields desde el icono del león, a la derecha de la barra de direcciones.',
        'Desactiva los Shields con el interruptor de arriba del panel.',
        'Recarga la página si no se recarga sola.',
      ],
      note: 'Solo cambia fileorca.com. En el celular, el león también está en la barra de direcciones.',
    },
    firefox: {
      name: 'Firefox en modo Estricto',
      steps: [
        'Abre el escudo a la izquierda de la barra de direcciones.',
        'Desactiva la “Protección mejorada contra el rastreo”. Ahora dice “Desactivada para este sitio”.',
        'La página se recarga sola.',
      ],
      note: 'Firefox lo llama protección contra el rastreo, no bloqueador. El modo Estricto también bloquea parte de los anuncios.',
    },
    'safari-mac': {
      name: 'Safari en Mac',
      steps: [
        'Con fileorca.com abierto, elige Safari > Configuración y luego Sitios web.',
        'En la lista de la izquierda, elige “Bloqueadores de contenido”.',
        'En el menú junto a fileorca.com, elige “No” y recarga la página.',
      ],
      note: 'AdBlock, Adblock Plus y AdGuard también tienen su propio icono en Safari: mira arriba.',
    },
    'safari-ios': {
      name: 'Safari en iPhone y iPad',
      steps: [
        'En Safari, toca el botón a la izquierda de la dirección (antes de iOS 18 era “aA”).',
        'Toca “Administrar extensiones” y desactiva el bloqueador.',
        'Recarga la página.',
      ],
      note: '¿Es un bloqueador de contenido? En el mismo menú, abre los ajustes del sitio web y desactiva “Usar bloqueadores de contenido”.',
    },
    other: {
      name: 'Otro bloqueador, o la red',
      steps: [
        'Busca su icono en la barra del navegador o dentro de la barra de direcciones.',
        'Permite fileorca.com, o páusalo en este sitio.',
        'Recarga la página.',
      ],
      note: 'Si el bloqueo viene de la red (en algunas oficinas y escuelas, o con algunas VPN y DNS), el navegador no puede desactivarlo. Prueba con otra red.',
    },
  },
} satisfies WallTexts;
