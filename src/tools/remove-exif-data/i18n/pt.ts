// Remove EXIF data (F18, decision 10): JPG, PNG and WebP lose their metadata and keep their pixels, with no decoding and
// no new encoding (src/engine/image/strip.ts, DECISOES § 33 and § 100). A rotated JPG keeps a tiny Exif block with only the
// Orientation, so it still shows upright: the reading of "no Exif" the site uses since § 33, said plainly in the FAQ.
// The Portuguese text says what the English one says, in the words of docs/i18n/pt.md (DECISOES § 736).
import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Remover metadados da foto online, sem upload',
  description:
    'Remova os dados Exif de fotos JPG, PNG e WebP no navegador: a localização GPS, a data, a câmera e mais. Os pixels não mudam. Sem upload e sem limite.',
  h1: 'Remover metadados da foto',
  howHeading: 'Como remover os metadados de uma foto',
  howSteps: [
    'Solte as fotos na caixa, escolha os arquivos ou cole com Ctrl V.',
    'A Oli tira os metadados de cada arquivo, e não há nada para escolher.',
    'Baixe a foto limpa.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Remover metadados da foto: formatos aceitos, o que sai e o que fica',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC e AVIF são recusadas com um link para o conversor que as abre.'],
      ['O que sai', 'Os dados Exif, com a localização GPS, a data e a hora, o celular ou a câmera e os ajustes dele, a miniatura e o nome do dono; os dados XMP e IPTC; os comentários; e as notas de texto que um PNG pode levar.'],
      ['O que fica', 'A imagem em si, byte por byte: ela não é decodificada nem salva de novo, então nada se perde. O perfil de cor também fica, e as cores continuam as mesmas.'],
      ['Fotos giradas', 'Um JPG guardado de lado mantém um bloco Exif mínimo, só com a orientação, para continuar aparecendo em pé. Nada mais dos dados Exif fica.'],
      ['Animação', 'Um WebP animado continua animado, com todos os quadros.'],
      ['Saída', 'O mesmo formato do arquivo que você soltou. O arquivo perde só o peso do que foi tirado, e fica igual quando não havia nada para tirar.'],
      ['Lote', 'Sem limite de fotos. Uma foto é baixada direto, e várias vêm num só ZIP.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'O que são dados EXIF?',
      a: 'EXIF são informações que o celular ou a câmera grava dentro do arquivo da foto: quando e, muitas vezes, onde ela foi tirada, o aparelho e os ajustes dele, e uma miniatura. Elas não aparecem na imagem, mas qualquer pessoa que recebe o arquivo consegue ler essas informações.',
    },
    {
      q: 'Por que um JPG girado fica com um pouco de Exif?',
      a: 'Muitos celulares guardam a imagem de lado e acrescentam uma marcação, a orientação, que diz aos apps como girar a foto. Sem essa marcação a foto apareceria de lado, e girar os pixels exigiria salvar o JPG de novo, com alguma perda.',
    },
    {
      q: 'Dá para tirar a localização de uma foto HEIC ou AVIF?',
      a: 'Nesta página, não. A HEIC para JPG e a AVIF para JPG transformam essas fotos em arquivos JPG, e o JPG que elas fazem não leva metadados, nem mesmo a localização.',
    },
    {
      q: 'O que acontece com o vídeo de uma foto com movimento?',
      a: 'Alguns celulares põem mais coisas dentro do JPG, depois da foto, como uma segunda imagem ou o vídeo de uma foto com movimento, cada uma com os próprios metadados. Essa parte fica de fora, e a foto continua.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas fotos são limpas no seu aparelho e nunca são enviadas a um servidor, então a localização e os outros dados delas também nunca saem dele.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Removendo os metadados',
    done: 'Prontinho! A localização e os outros metadados saíram da sua foto, e a imagem não mudou.',
    doneMany: 'Prontinho! A localização e os outros metadados saíram das suas {count} fotos, e as imagens não mudaram.',
    options: {
      note: 'Cada foto mantém os pixels e perde os metadados: a localização, a data, a câmera e o resto.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
