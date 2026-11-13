import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'HEIC para JPG online, sem upload',
  description:
    'Converta fotos HEIC e HEIF do iPhone ou de um celular Android em JPG ou PNG, no navegador. Sem upload, sem limite de fotos, e a localização GPS é removida.',
  h1: 'HEIC para JPG',
  howHeading: 'Como converter HEIC em JPG',
  howSteps: [
    'Solte as fotos HEIC na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Mantenha o JPG, ou escolha PNG se quiser a foto sem mais nenhuma perda.',
    'Baixe a foto convertida.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'HEIC para JPG: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'Arquivos HEIC e HEIF de iPhones e celulares Android, reconhecidos pelo conteúdo do arquivo e não pelo nome.'],
      ['Saída', 'JPG, que é o padrão, ou PNG. Sai um arquivo para cada HEIC.'],
      ['Qual imagem', 'A imagem principal do arquivo. O vídeo da Live Photo, o mapa de profundidade e o mapa de HDR ficam de fora, e uma foto espacial do Apple Vision Pro dá a imagem principal dela.'],
      ['Cores', 'Convertidas para o sRGB padrão, o perfil de cor que todo navegador e todo app entendem.'],
      ['Orientação', 'Aplicada uma vez, então uma foto em pé sai em pé.'],
      ['Lote', 'Sem limite de fotos. Uma foto é baixada direto, e várias vêm num só ZIP.'],
      ['Fotos grandes', 'Fotos acima de 16.777.216 pixels, cerca de 16,8 megapixels, são convertidas sem o canvas do navegador, então as fotos de 24 megapixels do iPhone também funcionam.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, inclusive a data da foto e o modelo da câmera.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Por que não consigo abrir arquivos HEIC no Windows?',
      a: 'HEIC é o formato que o iPhone usa nas fotos. O Windows precisa de extensões de codec extras para mostrar esse formato, e muitos apps e sites o recusam. Um JPG feito a partir da foto abre em quase todo lugar.',
    },
    {
      q: 'Converter HEIC em JPG diminui a qualidade?',
      a: 'O JPG comprime com perda, então o arquivo novo não é uma cópia bit a bit da foto, mas no uso normal a diferença é pequena. A opção PNG custa um arquivo bem maior.',
    },
    {
      q: 'Por que as cores ficam diferentes depois da conversão?',
      a: 'O iPhone fotografa numa faixa de cores ampla chamada Display P3, e o sRGB cobre uma faixa menor, então uma foto muito saturada pode ficar um pouco menos viva depois da conversão.',
    },
    {
      q: 'O iPhone pode salvar em JPG em vez de HEIC?',
      a: 'Pode. Abra Ajustes, depois Câmera, depois Formatos, e escolha Mais Compatível. As fotos novas são salvas em JPG, mas ocupam mais espaço do que em HEIC.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas fotos são convertidas no seu aparelho e nunca são enviadas a um servidor.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'HEIC ou HEIF',
    progressLabel: 'Convertendo as imagens',
    done: 'Prontinho! Sua foto foi convertida.',
    doneMany: 'Prontinho! Suas {count} fotos foram convertidas.',
    elsewhere: {
      reason: '{name} é um PNG, não uma foto HEIC. Para ter um JPG, use o {tool}.',
      label: 'Para um PNG:',
    },
    options: {
      legend: 'Salvar como',
      jpg: 'JPG',
      png: 'PNG',
      help: 'O JPG abre em todo lugar e pode sair maior que o HEIC. O PNG não acrescenta perda, mas o arquivo fica bem maior.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
