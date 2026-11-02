import type { ImageToolsTexts } from '../types.ts';

export default {
  title: 'Ferramentas de imagem: oito ferramentas grátis, sem upload',
  description:
    'Comprima, redimensione, corte, gire, converta e transforme imagens em PDF. Oito ferramentas de imagem grátis que rodam no navegador, sem upload e sem conta.',
  eyebrow: 'Ferramentas de imagem',
  h1: 'Oito ferramentas de imagem, sem upload',
  intro: 'Oito ferramentas para comprimir, redimensionar, cortar, girar, converter e juntar imagens, tudo no navegador, sem enviar nada.',
  toolsHeading: 'Todas as ferramentas de imagem',
  presetsHeading: 'Tamanhos e limites comuns',
  presetsCaption: 'Ajustes prontos para tamanhos e limites de arquivo comuns',
  presetsHead: ['Ajuste pronto', 'O que você recebe'],
  guideHeading: 'De qual ferramenta você precisa?',
  guideIntro:
    'Todas as ferramentas funcionam do mesmo jeito. Você solta uma imagem ou um lote inteiro, a Oli processa cada arquivo no seu aparelho, e você baixa os resultados um por um ou todos juntos num ZIP. Nada é enviado, então o tamanho do lote só depende do seu aparelho.',
  guide: [
    { before: 'Um formulário ou um e-mail recusa uma foto grande:', tool: 'compress-image', after: 'deixa o arquivo mais leve, e os ajustes prontos acima levam a imagem a 100 KB ou 1 MB.' },
    { before: 'Um site pede dimensões exatas:', tool: 'resize-image', after: 'define a largura e a altura em pixels ou por porcentagem.' },
    { before: 'Só uma parte da foto importa:', tool: 'crop-image', after: 'guarda essa parte, em quadrado, 4:5, 16:9 ou formato livre.' },
    { before: 'Uma foto saiu de lado:', tool: 'rotate-image', after: 'vira a foto 90° ou 180°, ou espelha a imagem.' },
    { before: 'Uma foto do iPhone não abre no computador:', tool: 'heic-to-jpg', after: 'transforma o arquivo HEIC em JPG ou PNG.' },
    { before: 'Uma imagem WebP precisa virar JPG ou PNG:', tool: 'webp-to-jpg', after: 'faz a conversão.' },
    { before: 'Um PNG precisa virar JPG, ou um JPG virar PNG:', tool: 'png-to-jpg', after: 'converte nos dois sentidos.' },
    { before: 'Várias fotos precisam ir num documento só:', tool: 'image-to-pdf', after: 'junta todas num PDF, uma imagem por página.' },
  ],
  guideOutro:
    'Cada ferramenta também deixa os metadados da foto fora da cópia que você baixa, então a localização GPS de uma foto do celular fica só com você.',
} satisfies ImageToolsTexts;
