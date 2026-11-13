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
    'Suelta tus PDF en el cuadro, elígelos o pégalos con Ctrl V.',
    'Escribe una contraseña y vuelve a escribirla para confirmarla.',
    'Presiona Proteger PDF y Oli cifra cada archivo.',
    'Descarga los PDF protegidos y anota la contraseña.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Proteger PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Contraseña', 'Una sola contraseña para todo el lote, escrita dos veces. Debe tener de 4 a 100 caracteres.'],
      ['Cifrado', 'AES-256 (revisión 6), aplicado por qpdf.'],
      ['Contraseña para abrir y de propietario', 'La misma contraseña sirve para abrir el archivo y como contraseña de propietario.'],
      ['Restricciones', 'No se agrega ninguna. Imprimir y copiar siguen permitidos para quien tenga la contraseña.'],
      ['Lo que se conserva', 'El contenido de las páginas no cambia: solo se agrega el cifrado. Los campos de formulario, los enlaces y los marcadores quedan como estaban, igual que los datos del documento. Oli no agrega fecha, ni el nombre de un programa, ni nada de tu dispositivo.'],
      ['Nombre del archivo', 'Un archivo llamado informe.pdf sale como informe-protegido.pdf. Tu original no cambia.'],
      ['Lote', 'Sin límite de archivos. Varios archivos se descargan juntos en un ZIP.'],
      ['Ya protegido', 'Un PDF que ya tiene contraseña o restricciones se rechaza en su propia línea, con un enlace a Desbloquear PDF. Los demás archivos siguen adelante.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cada archivo puede tener su propia contraseña?',
      a: 'En un mismo lote, no, porque una contraseña vale para todo el lote. Protege los archivos en rondas separadas, una ronda por cada contraseña.',
    },
    {
      q: '¿Qué pasa si olvido la contraseña?',
      a: 'Entonces la copia protegida no se puede abrir, y nadie puede recuperar la contraseña por ti. Guarda la contraseña en un lugar seguro y conserva tu PDF original hasta comprobar que la copia protegida se abre.',
    },
    {
      q: '¿Qué tan fuerte es la protección?',
      a: 'El punto débil es la contraseña, no el cifrado: una contraseña corta o común es fácil de adivinar. Elige una larga que no uses en ningún otro lugar.',
    },
    {
      q: '¿Puedo quitar la contraseña después?',
      a: 'Sí, con Desbloquear PDF y la misma contraseña. Te da una copia que se abre sin contraseña.',
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
