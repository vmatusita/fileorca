import type { ImageToolsTexts } from '../types.ts';

export default {
  // F18 (decision 13; DECISOES § 736): eleven with Remove EXIF data; the presets are not counted.
  title: 'Ferramentas de imagem: onze ferramentas grátis, sem upload',
  description:
    'Comprima, redimensione, corte, gire e converta imagens, tire os metadados delas ou faça um PDF. Onze ferramentas grátis que rodam no navegador, sem upload.',
  eyebrow: 'Ferramentas de imagem',
  h1: 'Onze ferramentas de imagem, sem upload',
  intro: 'Onze ferramentas para comprimir, redimensionar, cortar, girar, converter e juntar imagens e tirar os metadados delas, tudo no navegador, sem enviar nada.',
  toolsHeading: 'Todas as ferramentas de imagem',
  // F18: Flip image is neither a size nor a limit, so the heading says what every preset is.
  presetsHeading: 'Ajustes prontos',
  presetsCaption: 'Ajustes prontos para tamanhos comuns, limites de arquivo e fotos espelhadas',
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
    { before: 'Uma imagem salva de um site veio em AVIF:', tool: 'avif-to-jpg', after: 'transforma o arquivo em JPG.' },
    { before: 'Uma página precisa de imagens mais leves:', tool: 'convert-to-webp', after: 'transforma JPG e PNG em arquivos WebP ou AVIF menores.' },
    { before: 'Várias fotos precisam ir num documento só:', tool: 'image-to-pdf', after: 'junta todas num PDF, uma imagem por página.' },
    { before: 'Uma foto precisa sair sem a localização ou os dados da câmera:', tool: 'remove-exif-data', after: 'tira os metadados e deixa cada pixel como estava.' },
  ],
  guideOutro:
    'Cada ferramenta também deixa os metadados da foto fora da cópia que você baixa, então a localização GPS de uma foto do celular fica só com você.',
} satisfies ImageToolsTexts;
