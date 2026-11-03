import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Qué resolución elegir para pasar un PDF a JPG: píxeles y tamaños',
  description: 'Lo que cambia la resolución al pasar un PDF a JPG, medido en nuestros PDF de prueba: los píxeles de cada página, el peso del archivo y cuándo conviene JPG o PNG.',
  h1: 'Qué resolución elegir para pasar un PDF a JPG',
  lead: 'Una página de PDF no tiene píxeles hasta que algo la dibuja. La resolución que eliges decide cuántos recibe y cuánto van a pesar las imágenes.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'El texto y los dibujos de un PDF se guardan como formas, no como puntos. Para convertir una página en un JPG, un programa dibuja la página sobre una cuadrícula de píxeles, y la resolución, en píxeles por pulgada, define qué tan fina es esa cuadrícula. Si pides más, cada letra recibe más píxeles y el archivo crece.',
    'PDF a JPG ofrece {lowPpi} para pantalla, {mediumPpi} para uso general y {highPpi} para imprimir. Aquí está lo que dio cada opción en {files_word} PDF de nuestras pruebas, para que elijas la más baja que te sirva.',
  ],
  toolHeading: 'Convierte aquí las páginas de tu PDF en imágenes',
  toolIntro: 'Suelta un PDF y cada página se convierte en un JPG a {mediumPpi}, en esta pestaña del navegador, sin subir nada. Cambia la resolución o el formato y las imágenes se crean de nuevo; si son varias páginas, llegan juntas en un ZIP.',
  sections: [
    {
      heading: 'Los píxeles crecen con el cuadrado de la resolución',
      paragraphs: [
        'La resolución cuenta los píxeles a lo largo de una pulgada, y una página tiene dos lados. Por eso, duplicar la resolución duplica el ancho y el alto, y multiplica los píxeles por cuatro. La primera página del Formulario 1040 del IRS salió con {formWidth72} × {formHeight72} píxeles a {lowPpi}, {formWidth150} × {formHeight150} a {mediumPpi} y {formWidth300} × {formHeight300} a {highPpi}.',
        'Pasar de {mediumPpi} a {highPpi} dio {formPixels300vs150_times} la cantidad de píxeles en esa página, y lo mismo en cada PDF que probamos. El archivo no creció tan rápido: el JPG de esa página pasó de {formJpg150Chromium} a {formJpg300Chromium}, es decir, {formJpg300vs150Chromium_times} el peso.',
      ],
    },
    {
      heading: 'Para pantalla',
      paragraphs: [
        'Con {lowPpi} salen las imágenes más pequeñas. Alcanza para una vista previa, una miniatura o una imagen en un chat, y los archivos son ligeros: la primera página del formulario pesó {formJpg72Chromium}, y la primera página de los apuntes de clase, {bookJpg72Chromium}.',
        'Con esta opción, la letra pequeña se vuelve difícil de leer en cuanto haces zoom. Si alguien necesita leer el texto en la imagen, sube un paso.',
      ],
    },
    {
      heading: 'Para uso general',
      paragraphs: [
        'La opción predeterminada es {mediumPpi}, y es la que conviene cuando tienes dudas. El texto se sigue leyendo al hacer zoom en un teléfono, y los archivos se envían sin problema. Pasar de {lowPpi} a {mediumPpi} dejó el JPG de la primera página del formulario con {formJpg150vs72Chromium_times} el peso, a cambio de una página que se lee bien en cualquier pantalla.',
      ],
    },
    {
      heading: 'Para imprimir',
      paragraphs: [
        'La opción de {highPpi} es para el papel. El texto impreso y las líneas finas necesitan los píxeles de más para verse nítidos, y el peso extra es el costo: la primera página de los apuntes de clase pesó {bookJpg150Chromium} con {mediumPpi} y {bookJpg300Chromium} con {highPpi}.',
        'Más resolución solo ayuda cuando el PDF tiene detalle que ofrecer. Nuestra página de libro escaneada guarda una única imagen de {scanImageWidth} píxeles de ancho, que equivale a {scanImagePpi} sobre el ancho de la página. A {highPpi}, esa imagen simplemente se estira sobre el doble de píxeles en cada dirección: el archivo creció de {scanJpg150Chromium} a {scanJpg300Chromium} y no mostró nada nuevo. Para un PDF escaneado, usa la resolución del escaneo o quédate por debajo de ella.',
      ],
    },
    {
      heading: 'JPG o PNG para una página',
      paragraphs: [
        'La herramienta también puede guardar cada página como PNG, que no pierde nada. En una página de fotos eso sale caro: la primera página de nuestro PDF de fotos pesó {photosPng150Chromium} en PNG contra {photosJpg150Chromium} en JPG a {mediumPpi}, es decir, {photosPngVsJpg150Chromium_times} el peso del JPG.',
        'En las páginas de texto la diferencia es menor, y depende del navegador que escribe el PNG. En la primera página del formulario a {mediumPpi}, el PNG pesó {formPngVsJpg150Chromium_times} lo que el JPG en Chromium y {formPngVsJpg150Webkit_times} en WebKit. El PNG mantiene el texto perfectamente nítido, así que para una página de texto o un diagrama vale la pena probar ambos.',
        'Los escaneos en blanco y negro pueden inclinar la balanza al revés. En la primera página del informe de la NASA escaneado, a {highPpi}, el PNG pesó {reportPng300Chromium} contra {reportJpg300Chromium} del JPG en Chromium: una página de letras negras sobre papel blanco se comprime bien sin pérdida, y el JPG gasta bytes en pequeñas manchas alrededor de cada letra.',
      ],
    },
    {
      heading: 'Una forma rápida de elegir',
      paragraphs: [
        'Elige {lowPpi} para vistas previas y chats, {mediumPpi} para leer en pantalla y para subir las imágenes a un sitio, y {highPpi} solo para imprimir o para una página con detalle fino en la que alguien va a hacer zoom. Elige JPG para fotos y escaneos a color, y prueba PNG para texto, gráficos y formularios.',
        'Si solo necesitas algunas páginas, convierte solo esas con el rango de páginas, en lugar de convertir todas con la opción más alta.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'La primera página de cada PDF en cada resolución de la herramienta, en JPG y en PNG. Los píxeles son ancho por alto.',
  measuredNote: 'Medido el {date} en la página PDF a JPG de este sitio, en Chromium {chromiumVersion} y en WebKit {webkitVersion}, con {system}, sobre la primera y la segunda página de {files_word} PDF de nuestras pruebas: los documentos reales y un PDF de fotos (el libro escaneado tiene una sola página). Los píxeles fueron los mismos en ambos navegadores; la tabla muestra los archivos de Chromium.',
  tables: [
    {
      heading: 'La primera página en cada resolución',
      caption: 'La primera página de cada PDF en cada resolución: su tamaño en píxeles y el tamaño del JPG y del PNG',
      head: ['Archivo', 'Resolución', 'Píxeles', 'JPG', 'PNG'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'w3c-png', label: 'W3C: Portable Network Graphics (PNG) Specification (en inglés)', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-03' },
    { id: 'jpeg-org', label: 'Comité JPEG: JPEG 1 (en inglés)', href: 'https://jpeg.org/jpeg/', read: '2026-11-03' },
  ],
  facts: {},
  names: ['Formulario 1040', 'W3C', 'JPEG 1'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
