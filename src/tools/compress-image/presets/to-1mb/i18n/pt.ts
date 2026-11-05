import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Comprimir imagem para 1 MB online, sem upload',
  description:
    'Comprima uma imagem JPG, PNG ou WebP para 1 MB ou menos no navegador, para sites com limite de tamanho. Sem upload, sem limite de imagens e sem dados de GPS.',
  h1: 'Comprimir imagem para 1 MB',
  howHeading: 'Como deixar uma imagem com menos de 1 MB',
  howSteps: [
    'Solte na caixa as fotos grandes demais, escolha os arquivos ou cole com Ctrl V.',
    'A Oli salva cada uma como um JPG de até 1 MB, guardando o máximo de detalhe que couber.',
    'Baixe a imagem, ou o ZIP quando tiver comprimido várias.',
  ],
  specsHeading: 'A meta de 1 MB',
  specs: {
    caption: 'O que a Comprimir imagem para 1 MB garante e o que ela muda',
    head: ['Detalhe', 'O que a Oli faz'],
    rows: [
      ['Meta', 'Todo arquivo fica com 1.000.000 de bytes ou menos.'],
      ['Qual MB', 'O MB é lido como 1.000.000 de bytes, a leitura menor, então um limite de 1 MiB (1.048.576 bytes) também é respeitado.'],
      ['Formato de saída', 'Sempre um JPG. Entram JPG, PNG e WebP.'],
      ['Transparência', 'As áreas transparentes ficam brancas, porque o JPG não tem transparência.'],
      ['Imagem com menos de 1 MB', 'Volta sem mudança, a não ser pelos metadados, no próprio formato.'],
      ['Foto com detalhe demais', 'Se só a qualidade não alcança a meta, a Oli também reduz as dimensões e avisa a nova largura e a nova altura.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS não ficam nos arquivos novos.'],
    ],
  },
  faqHeading: 'Perguntas sobre 1 MB',
  faq: [
    {
      q: 'Por que o site diz que meu arquivo passa de 1 MB?',
      a: 'Fotos de celular e de câmera costumam ter vários megabytes, enquanto fotos de perfil, chamados de suporte e formulários de inscrição muitas vezes aceitam só 1 MB. Comprimir para 1 MB faz a mesma foto passar.',
    },
    {
      q: '1 MB é o mesmo que 1.024 KB?',
      a: 'Não exatamente. Pelo padrão, 1 MB são 1.000.000 de bytes, enquanto 1.024 KB são 1.048.576 bytes, cerca de 5% a mais. A Oli mira 1.000.000 de bytes, então o arquivo cabe nos dois.',
    },
    {
      q: 'Posso manter o formato original, como o PNG?',
      a: 'O resultado é um JPG, porque uma foto em PNG não cabe num tamanho definido sem mudar os pixels, e o JPG é aceito quase em todo lugar. Um arquivo que já cabe volta no próprio formato.',
    },
    {
      q: 'Quanta qualidade eu perco com 1 MB?',
      a: 'Muitas vezes bem pouca, porque uma foto grande tem mais detalhe do que a tela mostra. A Oli procura a melhor qualidade que cabe em 1 MB, e a comparação de antes e depois deixa você conferir o resultado.',
    },
    {
      q: 'Por que minha imagem também ficou menor em pixels?',
      a: 'Quando uma imagem tem detalhe demais para caber mesmo numa qualidade baixa, baixar ainda mais a qualidade deixaria a imagem quadriculada. Em vez disso, a Oli reduz um pouco as dimensões e mostra a nova largura e a nova altura.',
    },
    {
      q: 'Dá para comprimir várias fotos para 1 MB de uma vez?',
      a: 'Dá. Solte o conjunto inteiro. Cada arquivo fica com 1 MB ou menos, e o lote é baixado num só ZIP.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas fotos são reduzidas para 1 MB no seu aparelho e nunca são enviadas a um servidor. Os arquivos novos deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Comprimindo as imagens',
    done: 'Prontinho! Ficou {percent} mais leve e cabe em 1 MB.',
    doneMany: 'Prontinho! Suas {count} imagens ficaram com até 1 MB cada.',
    placardLabel: 'mais leve',
    options: {
      note: 'Cada imagem sai como um JPG de até 1 MB. A transparência fica branca.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
