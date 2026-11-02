// Protect PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF panel texts, in
// Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/qpdf.ts), as the
// English file does: AES-256 revision 6, one password to open and to own, no restriction added.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { PasswordToolTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<PasswordToolTexts> = {
  title: 'Proteger PDF: ponle contraseña a un PDF en tu navegador',
  description:
    'Ponle contraseña a tus PDF en el navegador con cifrado AES-256, a un archivo o a un lote entero. No se sube nada y tu contraseña nunca se guarda.',
  h1: 'Proteger PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tus PDF en el cuadro, elígelos o pégalos con Ctrl V, todos los que quieras.',
    'Escribe una contraseña de 4 a 100 caracteres y vuelve a escribirla para confirmarla.',
    'Presiona Proteger PDF y Oli cifra cada archivo en tu navegador, con la misma contraseña para todos.',
    'Descarga un PDF o todos juntos en un ZIP, y anota la contraseña, porque nadie puede recuperarla por ti.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Proteger PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Contraseña', 'Una sola contraseña para todo el lote, escrita dos veces. Debe tener de 4 a 100 caracteres.'],
      ['Cifrado', 'AES-256 (revisión 6), aplicado por qpdf, que funciona en tu navegador.'],
      ['Contraseña para abrir y de propietario', 'La misma contraseña sirve para abrir el archivo y como contraseña de propietario.'],
      ['Restricciones', 'No se agrega ninguna. Imprimir y copiar siguen permitidos para quien tenga la contraseña.'],
      ['Lo que se conserva', 'El contenido de las páginas no cambia: solo se agrega el cifrado. Los campos de formulario, los enlaces y los marcadores quedan como estaban, igual que los datos del documento. Oli no agrega fecha, ni el nombre de un programa, ni nada de tu dispositivo.'],
      ['Nombre del archivo', 'Un archivo llamado informe.pdf sale como informe-protegido.pdf. Tu original no cambia.'],
      ['Lote', 'Sin límite de archivos. Varios archivos se descargan juntos en un ZIP.'],
      ['Ya protegido', 'Un PDF que ya tiene contraseña o restricciones se rechaza en su propia línea, con un enlace a Desbloquear PDF. Los demás archivos siguen adelante.'],
      ['Contraseña olvidada', 'FileOrca no guarda la contraseña y no puede recuperarla. Guarda una copia en un lugar seguro.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo le pongo contraseña a un PDF?',
      a: 'Suelta el PDF, escribe una contraseña dos veces y presiona Proteger PDF. Oli cifra el archivo en tu navegador, y el PDF nuevo pide la contraseña cada vez que alguien lo abre. Tu archivo original queda como estaba.',
    },
    {
      q: '¿Qué pasa si olvido la contraseña?',
      a: 'FileOrca no guarda tu contraseña, así que no puede recuperarla, y el archivo protegido no se puede abrir sin ella. Guarda la contraseña en un lugar seguro y conserva tu PDF original hasta comprobar que la copia protegida se abre.',
    },
    {
      q: '¿Qué tan fuerte es la protección?',
      a: 'El archivo se cifra con AES-256, un cifrado estándar para archivos PDF. Lo que más importa es la contraseña: una corta o común es fácil de adivinar, así que elige una larga que no uses en ningún otro lugar. La regla aquí es de 4 a 100 caracteres, y cuanto más larga, más segura.',
    },
    {
      q: '¿Puedo proteger muchos PDF a la vez?',
      a: 'Sí. Suelta todos los archivos que quieras: todos reciben la misma contraseña, y cada uno sale como su propio archivo terminado en -protegido. Cuando los quieras todos, un botón te da un ZIP.',
    },
    {
      q: '¿Mi PDF y mi contraseña se suben a algún lugar?',
      a: 'No. Oli lee el PDF y lo cifra en tu dispositivo, en tu navegador, con qpdf. Ni el archivo ni la contraseña se envían a un servidor, y la contraseña no se guarda.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF se cifran en tu dispositivo y nunca se envían a un servidor. La contraseña no se guarda y no sale de tu dispositivo.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'protegido',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Protegiendo los PDF',
    done: '¡Listo! Tu PDF ahora pide contraseña.',
    doneMany: '¡Listo! Tus {count} PDF ahora piden contraseña.',
    action: 'Proteger PDF',
    options: {
      passwordLabel: 'Contraseña',
      confirmLabel: 'Confirma la contraseña',
      rule: 'Usa de 4 a 100 caracteres.',
      mismatch: 'Las dos contraseñas no coinciden. Escribe la misma en los dos campos.',
    },
  },
};

export default texts;
