import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'PNG para JPG online, sem upload',
  description:
    'Transforme imagens PNG em JPG, ou JPG em PNG, no navegador. Sem upload, sem limite de imagens, a transparência fica branca e os dados de GPS são removidos.',
  h1: 'PNG para JPG',
  howHeading: 'Como converter PNG em JPG',
  howSteps: [
    'Solte as imagens PNG ou JPG na caixa, escolha os arquivos ou cole com Ctrl V.',
    'A Oli converte cada arquivo para o outro formato: um PNG vira JPG, e um JPG vira PNG.',
    'Baixe a imagem convertida, ou o ZIP quando tiver convertido várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'PNG para JPG: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'Arquivos PNG e JPG, reconhecidos pelo conteúdo do arquivo e não pelo nome.'],
      ['Sentido', 'Vem do arquivo, então não há nada para escolher. Um PNG vira JPG, e um JPG vira PNG.'],
      ['PNG para JPG', 'A transparência fica branca. Nas fotos, o arquivo costuma ficar bem mais leve.'],
      ['JPG para PNG', 'Sem perda: o PNG guarda exatamente os pixels do JPG. O arquivo costuma ficar bem maior, e o detalhe que o JPG já perdeu não volta.'],
      ['Lote misturado', 'Um lote pode ter os dois formatos, e cada arquivo vai para o outro.'],
      ['Lote', 'Sem limite de imagens. Uma imagem é baixada direto, e várias vêm num só ZIP.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Por que a parte transparente do meu PNG fica preta?',
      a: 'O JPG não tem transparência, então o conversor precisa escolher uma cor para pôr no lugar, e alguns escolhem preto. O FileOrca preenche com branco. Para manter a transparência, guarde o PNG.',
    },
    {
      q: 'Converter PNG em JPG diminui a qualidade?',
      a: 'Um pouco, porque o JPG comprime com perda. Nas fotos, a diferença é pequena. Em capturas de tela, logotipos e textos com bordas nítidas, o JPG pode deixar um leve borrado em volta das bordas, então guarde o PNG nesses casos.',
    },
    {
      q: 'Por que meu PNG é tão maior que um JPG?',
      a: 'O PNG guarda cada pixel sem perda, o que serve bem para logotipos e capturas de tela, mas pesa nas fotos. O JPG descarta detalhes que o olho mal percebe, então uma foto muitas vezes diminui bastante.',
    },
    {
      q: 'Transformar um JPG em PNG melhora a qualidade?',
      a: 'Não. O PNG guarda exatamente o que o JPG tinha, sem perda nova, mas não traz de volta o detalhe que já se foi. Use quando um app ou um formulário pedir um PNG, ou antes de editar a imagem.',
    },
    {
      q: 'Minha imagem é enviada para algum lugar?',
      a: 'Não. O FileOrca converte a imagem no seu aparelho, dentro do navegador. Abra a aba Rede do navegador enquanto converte: nenhuma requisição leva o seu arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são convertidas no seu aparelho e nunca são enviadas a um servidor. Os arquivos novos deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'PNG ou JPG',
    progressLabel: 'Convertendo as imagens',
    done: 'Prontinho! Sua imagem foi convertida.',
    doneMany: 'Prontinho! Suas {count} imagens foram convertidas.',
    options: {
      note: 'Um PNG vira JPG, com a transparência em branco. Um JPG vira PNG, sem perda.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
