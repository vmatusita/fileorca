// F19b (front T4): qué protege la contraseña de un PDF, en español, con las medidas de data/guides-measured.json (front
// M1), a partir del texto en inglés (front E4); las fuentes, que no tienen versión en español, leídas el 2026-11-16.
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Qué protege la contraseña de un PDF y qué no protegen las restricciones',
  description: 'La contraseña para abrir un PDF cierra todo el archivo, y las restricciones por sí solas son una petición al lector. Qué hizo cada una con nuestros PDF de prueba.',
  h1: 'Qué protege la contraseña de un PDF',
  lead: 'Una contraseña para abrir y una lista de restricciones parecen protección. Solo una mantuvo cerrados nuestros PDF de prueba.',
  changed: 'Primera versión de esta guía, publicada el {published}, con los números medidos el {measured}.',
  intro: [
    'Un PDF puede llevar dos tipos distintos de protección. La contraseña para abrir, la que agrega Proteger PDF, mantiene cerrado el archivo hasta que alguien la escribe. Las restricciones, definidas con una contraseña de propietario aparte, dejan que cualquiera abra y lea el archivo, pero le piden al programa que no lo imprima, no copie el texto y no cambie las páginas.',
    'Pusimos a prueba las dos con archivos propios: {files_word} PDF que protegimos con Proteger PDF y un PDF que llegó bloqueado solo por restricciones. En cada uno leímos el cifrado, intentamos abrirlo sin contraseña, con la correcta y con una equivocada, y contamos los bytes que agregó la protección. La documentación de qpdf, el programa detrás de Proteger PDF y Desbloquear PDF, explica lo que vimos.',
  ],
  toolHeading: 'Ponle contraseña a un PDF aquí',
  toolIntro: 'Suelta uno o varios PDF, escribe una contraseña dos veces y presiona Proteger PDF. Cada archivo vuelve cifrado y pide esa contraseña antes de abrirse.',
  sections: [
    {
      heading: 'La contraseña para abrir cifra todo el archivo',
      paragraphs: [
        'Una contraseña para abrir no es un candado por fuera del archivo. Proteger PDF cifra el contenido del PDF con una clave, y la documentación de qpdf explica dónde vive esa clave: se genera al azar y se guarda en el propio archivo, cifrada con la contraseña. Quien escribe la contraseña obtiene la clave y, con ella, las páginas.',
        'Los {files_word} PDF que protegimos volvieron con cifrado AES y una clave de {keyBits} bits, la revisión {revision} del cifrado de PDF. Según la documentación de qpdf, una clave tan larga siempre usa AES, y esta es la única revisión que la especificación de PDF 2.0 no da por obsoleta.',
        'Sin la contraseña, el lector de PDF de nuestras pruebas se negó a abrir los {refusedWithout_word}. Con ella se abrieron todos, y una contraseña equivocada no llevó a ninguna parte. También buscamos en los bytes de cada archivo protegido la contraseña que habíamos escrito, y no estaba: la contraseña cierra la clave y no se guarda a su lado.',
      ],
    },
    {
      heading: 'Las restricciones son una petición, no un candado',
      paragraphs: [
        'Las restricciones funcionan de otra manera. Un PDF puede enumerar lo que permite, como imprimir, copiar el texto, llenar formularios o cambiar las páginas, y tener una contraseña de propietario solo para esa lista, sin contraseña para abrir. La documentación de qpdf es directa sobre lo que eso hace: quien hace cumplir las restricciones es únicamente el programa que abre el archivo. Un lector que sigue el estándar debe obedecerlas, y cualquier programa capaz de leer el archivo ya tiene la clave.',
        'Nuestro PDF de prueba con restricciones muestra lo que eso significa. Está cifrado igual que los archivos protegidos, con una clave de {ownerKeyBits} bits y la revisión {ownerRevision}, y bloquea {ownerBlocked_wordf} de las {capabilities_wordf} acciones que enumera qpdf. Aun así, el lector de nuestras pruebas lo abrió sin ninguna contraseña. La documentación de qpdf tiene un nombre para un archivo así: cifrado, pero no protegido con contraseña.',
        'Desbloquear PDF, ante un PDF solo con restricciones, se las quitó todas sin pedir ninguna contraseña. La copia que devolvió no tenía cifrado ni acciones bloqueadas, y conservaba las mismas {ownerPages_wordf} páginas. Nada en el archivo pudo impedirlo, y la documentación de qpdf agrega que cualquier lector de código abierto podría modificarse para ignorar la lista.',
      ],
    },
    {
      heading: 'Lo que agrega Proteger PDF y lo que deja fuera',
      paragraphs: [
        'Proteger PDF usa la contraseña que escribes tanto para abrir el archivo como de contraseña de propietario, y no agrega ninguna restricción: en nuestros archivos protegidos no quedó bloqueada ni una de las acciones que enumera qpdf. Un PDF que ya trae restricciones se rechaza, y el nuestro se rechazó, así que primero hay que quitárselas con Desbloquear PDF.',
        'El cifrado ocupa poco espacio, y en nuestra muestra lo agregado dependió poco del tamaño del archivo. Nuestros {files_word} PDF crecieron de {addedMin_exact} a {addedMax_exact}: el PDF de fotos, de {photosBefore}, fue el que menos ganó, y nuestro archivo más pequeño, de {mixedBefore}, ganó {mixedAdded_exact}, que en un archivo tan pequeño es un {mixedChange_more} más.',
        'Protegimos cada archivo dos veces, con una contraseña distinta cada vez, y las dos copias salieron del mismo tamaño en los {sameSize_word} archivos.',
      ],
    },
    {
      heading: 'Una contraseña corta se puede adivinar',
      paragraphs: [
        'Una clave larga ayuda poco si la contraseña que la protege es fácil de descubrir. El NIST, la agencia de estándares de Estados Unidos, escribe en la publicación especial 800-63B que la longitud es un factor principal de la fuerza de una contraseña, y que las contraseñas demasiado cortas ceden ante ataques de fuerza bruta y de diccionario: probar todas las combinaciones, o todas las palabras de una lista.',
        'Para los sistemas de inicio de sesión, las reglas del NIST piden al menos {nistMinimum} cuando la contraseña es lo único que prueba quién eres, y además cuentan con limitar los intentos fallidos. Un PDF protegido no tiene ese límite. La clave está dentro del archivo, así que quien tenga una copia puede probar una contraseña tras otra en una computadora propia, donde nada limita el ritmo de los intentos. El NIST lo llama un ataque fuera de línea.',
        'Nuestra medición no cronometró cuánto tarda en adivinarse una contraseña, y esta guía no promete nada al respecto. Lo que muestra es más acotado: la contraseña correcta abrió todos los archivos, una equivocada no abrió ninguno, y el cifrado fue el mismo con cualquier contraseña que escribimos. Qué tan difícil es abrir un archivo protegido depende de la contraseña.',
      ],
    },
    {
      heading: 'Qué protección hace qué',
      paragraphs: ['Lado a lado, las dos protecciones cubren cosas distintas.'],
      list: [
        'Contraseña para abrir: el archivo sigue cifrado para quien no tiene la contraseña, y esta no queda grabada en el archivo. Quien la reciba de ti puede hacer de todo con la copia, porque Proteger PDF no agrega restricciones.',
        'Solo restricciones: cualquiera puede abrir y leer el archivo, y lo que este permite solo se cumple en los programas que eligen seguir la lista.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'Agregado a nuestro PDF de fotos', value: '+{photosAdded_exact}', from: '{photosBefore}', to: '{photosAfter}' },
      { label: 'Bloqueadas en el PDF sin contraseña', value: '{ownerBlocked} de {capabilities}', sub: 'Acciones, en la lista de qpdf' },
    ],
    sample: '{files} PDF de prueba con contraseña y un PDF solo con restricciones.',
    link: 'Mira las tablas',
  },
  tableHeading: 'Archivo por archivo',
  measuredIntro: 'Nuestros {files_word} PDF de prueba protegidos con Proteger PDF, cada uno dos veces y cada vez con una contraseña nueva inventada para la prueba; después, nuestro PDF con restricciones y sin contraseña para abrir, como llegó y después de Desbloquear PDF. La columna Agregado muestra, byte por byte, cuánto creció cada archivo.',
  measuredNote: 'Medido el {date}, en Node, con el motor de las herramientas de este sitio, cada ejecución en un proceso nuevo, como en una pestaña nueva. El cifrado de cada archivo se leyó con qpdf, y cada archivo se abrió con PDF.js, el lector que usan nuestras pruebas, sin contraseña, con la correcta y con una equivocada.',
  tables: [
    {
      heading: 'PDF con contraseña',
      caption: 'Cada PDF protegido con Proteger PDF: sus páginas, su tamaño antes y después y los bytes que agregó el cifrado',
      head: ['PDF', 'Páginas', 'Antes', 'Después', 'Agregado'],
    },
    {
      heading: 'Restricciones sin contraseña',
      caption: 'El PDF con restricciones y sin contraseña para abrir, como llegó y después de Desbloquear PDF, junto a un PDF después de Proteger PDF: el tamaño, si un lector lo abrió sin contraseña y cuántas acciones bloquea',
      head: ['Archivo', 'Tamaño', 'Se abre sin contraseña', 'Acciones bloqueadas'],
      labels: ['Solo restricciones, como llegó', 'El mismo PDF después de Desbloquear PDF', 'PDF con páginas de tamaños distintos, después de Proteger PDF'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'qpdf', label: 'Documentación de qpdf: Cifrado de PDF (en inglés)', href: 'https://qpdf.readthedocs.io/en/stable/encryption.html', read: '2026-11-16' },
    { id: 'nist', label: 'NIST: Publicación Especial 800-63B (en inglés)', href: 'https://pages.nist.gov/800-63-4/sp800-63b.html', read: '2026-11-16' },
  ],
  facts: {
    nistMinimum: { text: '15 caracteres', source: 'nist' },
  },
  names: ['800-63B', 'PDF 2.0'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
