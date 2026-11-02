import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'WebP para JPG online, sem upload',
  description:
    'Converta imagens WebP em JPG ou PNG no navegador. Sem upload, sem limite de imagens, um WebP animado vira o primeiro quadro, e os dados de GPS são removidos.',
  h1: 'WebP para JPG',
  howHeading: 'Como converter WebP em JPG',
  howSteps: [
    'Solte as imagens WebP na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Mantenha o JPG, ou escolha PNG se a imagem tiver uma transparência que você quer manter.',
    'Baixe a imagem convertida, ou o ZIP quando tiver convertido várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'WebP para JPG: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'Arquivos WebP, parados ou animados, reconhecidos pelo conteúdo do arquivo e não pelo nome.'],
      ['Saída', 'JPG, que é o padrão, ou PNG. Sai um arquivo para cada WebP.'],
      ['Transparência', 'O JPG não tem transparência, então ela fica branca. O PNG mantém a transparência.'],
      ['WebP animado', 'Vira o primeiro quadro, e o resultado avisa.'],
      ['Tamanho', 'Um JPG da mesma imagem muitas vezes fica maior que o WebP, porque o WebP comprime melhor. Nas fotos, um PNG fica maior ainda.'],
      ['Lote', 'Sem limite de imagens. Uma imagem é baixada direto, e várias vêm num só ZIP.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Por que os sites salvam imagens em WebP?',
      a: 'Os arquivos WebP costumam ser menores que os JPG para a mesma imagem, então as páginas carregam mais rápido. Muitos sites mandam WebP para os navegadores que aceitam o formato, e o seu navegador salva o que recebeu. Um JPG feito a partir dele abre em todo editor e todo formulário.',
    },
    {
      q: 'O que acontece com um fundo transparente?',
      a: 'O JPG não guarda transparência, então o FileOrca preenche essas áreas com branco. Para manter a transparência, escolha PNG.',
    },
    {
      q: 'Dá para converter um WebP animado em JPG?',
      a: 'Dá, mas um JPG é uma imagem só. O WebP animado vira o primeiro quadro, e o resultado avisa. Para manter o movimento, guarde o WebP.',
    },
    {
      q: 'Por que o JPG ficou maior que o WebP?',
      a: 'O WebP é um formato mais novo, que guarda a mesma imagem em menos bytes que o JPG. Voltar para o JPG abre mão de parte dessa economia em troca de um arquivo que todo app e todo site aceitam.',
    },
    {
      q: 'Posso só renomear o arquivo .webp para .jpg?',
      a: 'Não. Renomear muda só o nome, e os dados lá dentro continuam sendo WebP, então alguns apps e formulários continuam recusando o arquivo. Converter grava um JPG de verdade.',
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
    formats: 'WebP',
    progressLabel: 'Convertendo as imagens',
    done: 'Prontinho! Sua imagem foi convertida.',
    doneMany: 'Prontinho! Suas {count} imagens foram convertidas.',
    options: {
      legend: 'Salvar como',
      jpg: 'JPG',
      png: 'PNG',
      help: 'O JPG é mais leve, e a transparência fica branca. O PNG mantém a transparência, mas o arquivo fica maior.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
