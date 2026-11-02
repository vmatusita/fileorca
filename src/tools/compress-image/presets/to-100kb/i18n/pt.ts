import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Comprimir imagem para 100 KB online, sem upload',
  description:
    'Comprima uma imagem JPG, PNG ou WebP para 100 KB ou menos no navegador, para formulários com limite de tamanho. Sem upload, sem limite de imagens e sem GPS.',
  h1: 'Comprimir imagem para 100 KB',
  howHeading: 'Como deixar uma imagem com menos de 100 KB',
  howSteps: [
    'Solte na caixa as imagens que um formulário recusou, escolha os arquivos ou cole com Ctrl V.',
    'A Oli salva cada uma como um JPG de até 100 KB e também diminui as dimensões da imagem quando há detalhe demais.',
    'Confira o tamanho novo no resultado e baixe a imagem ou o ZIP.',
  ],
  specsHeading: 'A meta de 100 KB',
  specs: {
    caption: 'O que a Comprimir imagem para 100 KB garante e o que ela muda',
    head: ['Detalhe', 'O que a Oli faz'],
    rows: [
      ['Meta', 'Todo arquivo fica com 100.000 bytes ou menos.'],
      ['Qual KB', 'O KB é lido como 1.000 bytes, a menor das duas leituras, então o arquivo também passa nos formulários que contam 1.024 bytes por KB.'],
      ['Formato de saída', 'Sempre um JPG, o formato que formulários e portais mais pedem. Entram JPG, PNG e WebP.'],
      ['Transparência', 'As áreas transparentes ficam brancas, porque o JPG não tem transparência.'],
      ['Imagem que já cabe', 'Volta como estava, no próprio formato, sem os metadados da foto.'],
      ['Imagem com muito detalhe', 'Quando só a qualidade não alcança a meta, a Oli também reduz as dimensões e mostra a nova largura e a nova altura.'],
      ['Privacidade do arquivo', 'Exif, XMP, IPTC e GPS ficam fora de todo arquivo novo.'],
    ],
  },
  faqHeading: 'Perguntas sobre 100 KB',
  faq: [
    {
      q: 'Por que um formulário pede uma imagem com menos de 100 KB?',
      a: 'Formulários de inscrição, portais de concursos e envios de documentos costumam ter limites pequenos, para que os servidores guardem e carreguem milhões de arquivos rápido. O limite costuma ser no tamanho do arquivo, às vezes junto com um tamanho em pixels, então leia o que o seu formulário pede.',
    },
    {
      q: '100 KB é o mesmo que 100.000 bytes?',
      a: 'Depende do formulário. Pelo padrão, 1 KB são 1.000 bytes, mas alguns sistemas, o Windows entre eles, contam 1.024 bytes por KB. A Oli mira 100.000 bytes, então o arquivo passa nas duas contas.',
    },
    {
      q: 'Por que o resultado é um JPG, mesmo que eu tenha soltado um PNG?',
      a: 'O JPG é o formato que os formulários mais pedem, e nas fotos ele chega a um tamanho pequeno muito melhor que o PNG. Uma foto em PNG de alguns megabytes não cabe em 100 KB sem mudar os pixels. As áreas transparentes ficam brancas, porque o JPG não tem transparência.',
    },
    {
      q: 'A imagem vai ficar pior com 100 KB?',
      a: 'Um pouco, porque o arquivo fica bem menor. Quando a imagem é grande, a Oli primeiro reduz as dimensões, o que a mantém nítida, e depois procura a melhor qualidade que ainda cabe. A comparação de antes e depois mostra a diferença.',
    },
    {
      q: 'E se o formulário também pedir um tamanho exato em pixels?',
      a: 'Use antes a ferramenta Redimensionar imagem para definir a largura e a altura, e depois volte aqui para o tamanho do arquivo. Se a imagem tiver muito detalhe, a Oli pode reduzir as dimensões mais um pouco, e ela avisa o tamanho novo.',
    },
    {
      q: 'E se a minha imagem já tiver menos de 100 KB?',
      a: 'Ela volta como estava, no próprio formato, sem os metadados da foto. A Oli nunca entrega um arquivo maior do que o que você soltou.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são reduzidas para 100 KB no seu aparelho e nunca são enviadas a um servidor. Os arquivos novos deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Comprimindo as imagens',
    done: 'Prontinho! Sua imagem ficou {percent} mais leve e cabe em 100 KB.',
    doneMany: 'Prontinho! Suas {count} imagens ficaram com até 100 KB cada.',
    placardLabel: 'mais leve',
    options: {
      note: 'Cada imagem sai como um JPG de até 100 KB. A transparência fica branca.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
