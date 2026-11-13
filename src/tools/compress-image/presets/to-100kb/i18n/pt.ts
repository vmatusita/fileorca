import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Comprimir imagem para 100 KB online, sem upload',
  description:
    'Comprima uma imagem JPG, PNG ou WebP para 100 KB ou menos no navegador, para formulários com limite de tamanho. Sem upload, sem limite de imagens e sem GPS.',
  h1: 'Comprimir imagem para 100 KB',
  howHeading: 'Como deixar uma imagem com menos de 100 KB',
  howSteps: [
    'Solte na caixa as imagens que um formulário recusou, escolha os arquivos ou cole com Ctrl V.',
    'A Oli comprime cada uma, e não há nada para escolher.',
    'Confira o tamanho novo no resultado e baixe a imagem.',
  ],
  specsHeading: 'A meta de 100 KB',
  specs: {
    caption: 'O que a Comprimir imagem para 100 KB garante e o que ela muda',
    head: ['Detalhe', 'O que a Oli faz'],
    rows: [
      ['Meta', 'Todo arquivo fica com 100 KB ou menos.'],
      ['Formato de saída', 'Sempre um JPG. Entram JPG, PNG e WebP.'],
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
      a: 'O JPG é o formato que os formulários mais pedem, e nas fotos ele chega a um tamanho pequeno muito melhor que o PNG: uma foto em PNG de alguns megabytes não cabe em 100 KB sem mudar os pixels.',
    },
    {
      q: 'A imagem vai ficar pior com 100 KB?',
      a: 'Um pouco, porque o arquivo fica bem menor. A comparação de antes e depois mostra a diferença.',
    },
    {
      q: 'E se o formulário também pedir um tamanho exato em pixels?',
      a: 'Use antes a ferramenta Redimensionar imagem para definir a largura e a altura, e depois volte aqui para o tamanho do arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são reduzidas para 100 KB no seu aparelho e nunca são enviadas a um servidor.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Comprimindo as imagens',
    done: 'Prontinho! Ficou {percent} mais leve e cabe em 100 KB.',
    doneMany: 'Prontinho! Suas {count} imagens ficaram com até 100 KB cada.',
    placardLabel: 'mais leve',
    options: {
      note: 'Cada imagem sai como um JPG de até 100 KB. A transparência fica branca.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
