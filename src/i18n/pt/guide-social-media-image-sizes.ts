import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Tamanhos de imagem para redes sociais, segundo a ajuda de cada rede',
  description: 'Os tamanhos de imagem que Instagram, Facebook, X, LinkedIn, YouTube e Pinterest publicam, e como ficam e quanto pesam fotos redimensionadas para eles.',
  h1: 'Tamanhos de imagem para redes sociais',
  lead: 'Cada rede publica os tamanhos que quer e redimensiona o que não cabe. Veja esses tamanhos e o que uma foto vira em cada um.',
  changed: 'Primeira versão deste guia, publicada em {published} com as medidas de {measured}. As páginas de ajuda foram lidas na data indicada em cada fonte.',
  intro: [
    'Toda rede social pega a foto, encaixa no próprio quadro e comprime de novo. Se a foto é muito maior que o quadro, a rede joga pixels fora com os ajustes dela. Se o formato está errado, a rede corta onde quiser. Mandar uma foto que já tem o tamanho e o formato certos deixa essas decisões nas suas mãos.',
    'Os tamanhos abaixo vêm só das páginas de ajuda ou de desenvolvedores de cada rede, lidas na data que aparece no fim desta página. Quando uma rede publica um número só para anúncios, a tabela avisa. O TikTok não está na tabela: as páginas de ajuda dele que lemos não dão tamanho para fotos.',
  ],
  toolHeading: 'Redimensione suas fotos aqui',
  toolIntro: 'Escolha Por tamanho, digite a largura e a altura do tamanho de que você precisa e solte suas fotos. Cada uma cabe dentro dessa caixa, mantém a proporção e fica nesta aba do navegador.',
  sections: [
    {
      heading: 'O que as redes pedem',
      paragraphs: [
        'O Instagram é preciso quanto ao formato. A central de ajuda dele diz que as fotos mantêm o tamanho quando têm entre {igMinWidth} e {igMaxWidth} de largura, ficam menores acima disso e mantêm o quadro inteiro quando a proporção fica entre {igRatios}. Uma foto mais alta ou mais larga que isso é cortada. O LinkedIn recomenda uma largura de {liPostWidth} para fotos em publicações, o Facebook dá tamanhos exatos para a foto do perfil e a capa de uma Página, e o X dá os da foto do perfil e da capa.',
        'A tabela em "O que medimos" lista cada tamanho com a rede e o uso, e o maior arquivo que as nossas fotos geraram nesse tamanho. Os limites da última coluna são o arquivo mais pesado que cada página aceita, quando ela informa um.',
      ],
    },
    {
      heading: 'Caber dentro ou preencher o quadro',
      paragraphs: [
        'A Redimensionar imagem mantém a proporção da foto. A foto entra na caixa que você digitou, o maior possível, e nunca é esticada. Nossa foto em retrato tem o mesmo formato do quadro mais alto do Instagram, então saiu com exatamente {instagramPortraitWidth} × {instagramPortraitHeight}. Uma foto em paisagem na mesma caixa saiu com {instagramLandscapeWidth} × {instagramLandscapeHeight}, porque é mais larga do que alta.',
        'Por isso o tamanho exato que a rede indica apareceu em só {exactFrames_wordf} das nossas {outputs} fotos redimensionadas. Para uma capa do Facebook, uma foto em paisagem saiu com {facebookCoverLandscapeWidth} × {facebookCoverLandscapeHeight}: ela cabe, mas não preenche o quadro largo, e a rede completa ou corta o resto.',
        'Para preencher um quadro exato, corte primeiro e redimensione depois. A Cortar imagem tem prontos um quadro quadrado, um em retrato e um largo, e uma área livre para qualquer outro formato. Redimensione a foto cortada para o tamanho da tabela, e a rede não tem mais nada para mudar.',
      ],
    },
    {
      heading: 'A miniatura do YouTube num passo só',
      paragraphs: [
        'A página de ajuda do YouTube recomenda {ytRecommended} para miniaturas de vídeo, com largura mínima de {ytMinWidth}, e sugere o formato {ytRatio}. Enviada pelo app do celular, uma miniatura pode pesar até {ytPhoneLimit}.',
        'O ajuste pronto Miniatura do YouTube faz o corte e o redimensionamento de uma vez: corta a foto em {ytRatio} em volta do centro e a deixa com {thumbnailWidth} × {thumbnailHeight}, menor que o tamanho recomendado, para o arquivo ficar bem abaixo do limite do app do celular. Todas as {thumbnailExactChromium_wordf} fotos saíram nesse tamanho, e a maior pesou {thumbnailMaxChromium}.',
      ],
    },
    {
      heading: 'O peso do arquivo não foi problema nas nossas fotos',
      paragraphs: [
        'Redimensionar para um tamanho de rede social deixa a foto bem mais leve, porque boa parte dos pixels vai embora. Das nossas fotos redimensionadas, {underLimit} eram para um tamanho com limite publicado, e todas as {underLimit} ficaram abaixo dele. O maior arquivo que fizemos pesou {largestOutput}.',
        'O número mais apertado é o da capa do Facebook: o Facebook diz que ela carrega mais rápido quando tem menos de {fbCoverLimit}. Nossa maior capa pesou {facebookCoverMaxChromium}. Se uma capa ainda ficar pesada demais, comprima depois de redimensionar.',
      ],
    },
    {
      heading: 'Antes de publicar',
      paragraphs: [
        'A foto do perfil pode aparecer num círculo. O Facebook, por exemplo, diz que a foto do perfil de uma Página aparece com {fbProfileDesktop} em computadores e {fbProfilePhone} em smartphones, cortada em círculo, então deixe o rosto no meio do quadrado e longe dos cantos.',
        'Comece sempre pela foto original e redimensione uma vez só. Uma foto redimensionada duas vezes, ou tirada de uma captura de tela de outra publicação, já perdeu detalhes que a rede não consegue trazer de volta.',
        'Use JPG para fotos e PNG para logos, textos e cores chapadas, que ficam nítidos em PNG. E confira o que a foto diz sobre você: a cópia redimensionada é gravada a partir dos pixels, então deixa para trás a localização e os dados da câmera do original.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'No tamanho exato que a rede pede', value: '{exactFrames} de {outputs}' },
      { label: 'Abaixo do limite publicado', value: '{underLimit} de {withLimit}', sub: 'Maior arquivo: {largestOutput}' },
    ],
    sample: '{photos} fotos de celular redimensionadas para {sizes} tamanhos oficiais.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Tamanho por tamanho',
  measuredIntro: 'Cada tamanho publicado nas páginas das próprias redes, os tamanhos em que as nossas {photos_wordf} fotos de celular saíram na Redimensionar imagem e o maior arquivo em cada tamanho. A linha da miniatura do YouTube traz o tamanho que o YouTube recomenda e o tamanho que o ajuste pronto Miniatura do YouTube fez.',
  measuredNote: 'Medido em {date} no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}, pela página Redimensionar imagem deste site (Por tamanho) e pelo ajuste pronto Miniatura do YouTube, nas nossas fotos de celular de verdade, em retrato e em paisagem. A tabela mostra o Chromium; o WebKit gravou arquivos um pouco maiores nos mesmos tamanhos.',
  tables: [
    {
      heading: 'Os tamanhos e o que as nossas fotos viraram',
      caption: 'Cada tamanho de rede: a rede, o uso, o tamanho oficial, os tamanhos em que as nossas fotos saíram, o maior arquivo e o limite publicado',
      head: ['Rede', 'Uso', 'Tamanho oficial', 'Como nossas fotos saíram', 'Maior arquivo', 'Limite'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'instagram-feed', label: 'Central de Ajuda do Instagram: Resolução de imagem das fotos que você compartilha no Instagram', href: 'https://help.instagram.com/1631821640426723/?locale=pt_BR', read: '2026-11-03' },
    { id: 'instagram-reel-cover', label: 'Central de Ajuda do Instagram: Tamanho e taxas de proporção de reels no Instagram', href: 'https://help.instagram.com/1038071743007909/?locale=pt_BR', read: '2026-11-03' },
    { id: 'facebook-page', label: 'Central de Ajuda do Facebook: Dimensões da foto do perfil e da capa da Página do Facebook', href: 'https://www.facebook.com/help/125379114252045?locale=pt_BR', read: '2026-11-03' },
    { id: 'facebook-link', label: 'Documentação da Meta para desenvolvedores: as imagens dos links compartilhados', href: 'https://developers.facebook.com/documentation/sharing/webmasters/images', read: '2026-11-03' },
    { id: 'x-profile', label: 'Central de Ajuda do X: Ajuda para enviar uma foto do perfil (em inglês)', href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', read: '2026-11-03' },
    { id: 'linkedin-post', label: 'Ajuda do LinkedIn: Compartilhar fotos no LinkedIn', href: 'https://www.linkedin.com/help/lms/answer/a527229?lang=pt', read: '2026-11-03' },
    { id: 'linkedin-profile-cover', label: 'Ajuda do LinkedIn: Adicionar ou alterar a imagem da capa no seu perfil', href: 'https://www.linkedin.com/help/linkedin/answer/a568217/add-or-change-the-background-photo-on-your-profile?lang=pt', read: '2026-11-03' },
    { id: 'linkedin-page-cover', label: 'Ajuda do LinkedIn: Especificações de imagem para LinkedIn Pages e Career Pages', href: 'https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=pt', read: '2026-11-03' },
    { id: 'youtube-banner', label: 'Ajuda do YouTube: Gerenciar o branding do seu canal', href: 'https://support.google.com/youtube/answer/10456525?hl=pt-BR', read: '2026-11-03' },
    { id: 'youtube-thumbnail', label: 'Ajuda do YouTube: Adicionar miniaturas personalizadas no YouTube', href: 'https://support.google.com/youtube/answer/72431?hl=pt-BR', read: '2026-11-03' },
    { id: 'pinterest-pin', label: 'Ajuda do Pinterest Business: Analisar as especificações do anúncio', href: 'https://help.pinterest.com/pt-br/business/article/pinterest-product-specs', read: '2026-11-03' },
  ],
  facts: {
    igMinWidth: { text: '320', source: 'instagram-feed' },
    igMaxWidth: { text: '1.080 pixels', source: 'instagram-feed' },
    igRatios: { text: '1,91:1 e 3:4', source: 'instagram-feed' },
    liPostWidth: { text: '1.080 pixels', source: 'linkedin-post' },
    ytRatio: { text: '16:9', source: 'youtube-thumbnail' },
    ytMinWidth: { text: '640 pixels', source: 'youtube-thumbnail' },
    ytRecommended: { text: '3.840 × 2.160', source: 'youtube-thumbnail' },
    ytPhoneLimit: { text: '2 MB', source: 'youtube-thumbnail' },
    fbCoverLimit: { text: '100 KB', source: 'facebook-page' },
    fbProfileDesktop: { text: '176 × 176', source: 'facebook-page' },
    fbProfilePhone: { text: '196 × 196', source: 'facebook-page' },
  },
  names: [],
  relatedHeading: 'Ferramentas e guias relacionados',
  measuredTerms: {
    'Feed photo at its tallest ratio, 3:4': 'Foto do feed na proporção mais alta, 3:4',
    'Reel cover photo': 'Foto de capa do reel',
    'Page profile picture': 'Foto do perfil da Página',
    'Page cover photo, fastest under 100 KB': 'Foto de capa da Página, mais rápida abaixo de 100 KB',
    'Image of a shared link': 'Imagem de um link compartilhado',
    'Profile photo': 'Foto do perfil',
    'Header photo': 'Foto de capa',
    'Photo in a post, recommended width at the tallest ratio, 4:5': 'Foto numa publicação, largura recomendada na proporção mais alta, 4:5',
    'Profile cover image': 'Imagem de capa do perfil',
    'Page cover image': 'Imagem de capa da Página',
    'Channel banner, smallest upload': 'Banner do canal, o mínimo para envio',
    'Pin, uploaded from a computer': 'Pin enviado do computador',
    'Video thumbnail, recommended size, uploaded from the phone app': 'Miniatura de vídeo, tamanho recomendado, enviada pelo app do celular',
  },
};

export default texts;
