import type { PtCommonTexts } from '../types.ts';

// Textos comuns em português (docs/i18n/pt.md): cabeçalho, rodapé, busca, aviso de cookies e os cartões de cada
// ferramenta e calculadora que existe em português.
export default {
  skipToContent: 'Ir para o conteúdo',
  header: {
    homeLabel: 'FileOrca, página inicial',
    search: 'Buscar ferramentas',
    langCode: 'PT',
    langSr: ' · Idioma: Português',
    langMenuLabel: 'Escolha um idioma',
    langNames: { en: 'English', pt: 'Português', es: 'Español' },
  },
  breadcrumb: { label: 'Trilha de navegação', home: 'Início' },
  seal: 'Seu arquivo nem sai do aparelho',
  footer: {
    imageColumn: 'Imagem',
    moneyColumn: 'Dinheiro',
    pdfColumn: 'PDF',
    siteColumn: 'FileOrca',
    about: 'Sobre',
    privacy: 'Privacidade',
    terms: 'Termos',
    licenses: 'Licenças',
    contact: 'Contato',
    coffee: 'Curtiu? Me paga um café',
    signature: 'Feito por {name} em {city}',
  },
  cookie: {
    title: 'Cookies, rapidinho.',
    body: 'Usamos o Google Analytics para ver quais ferramentas ajudam e anúncios para manter o site grátis. Aceitando ou não, seu arquivo nem sai do aparelho.',
    privacyLink: 'Privacidade',
    accept: 'Aceitar',
    decline: 'Recusar',
    change: 'Mudar minha escolha de cookies',
  },
  adLabel: 'Publicidade',
  search: {
    dialogLabel: 'Buscar ferramentas',
    inputLabel: 'Buscar ferramentas',
    listLabel: 'Ferramentas',
    placeholder: 'Encontre uma ferramenta',
    close: 'Fechar',
    emptyTitle: 'Nenhuma ferramenta chamada "{query}"',
    emptyHint: 'Tente "comprimir", "PDF" ou "parcela".',
    imageCategory: 'Imagem',
    moneyCategory: 'Calculadoras financeiras',
    pdfCategory: 'PDF',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Ferramentas de imagem',
  pdfTools: 'Ferramentas de PDF',
  moneyCalculators: 'Calculadoras financeiras',
  calcSeal: 'Seus números ficam no seu aparelho',
  tools: {
    'compress-image': {
      name: 'Comprimir imagem',
      description: 'Deixe um JPG, PNG ou WebP mais leve, direto no navegador.',
      synonyms: ['comprimir', 'reduzir', 'diminuir', 'otimizar', 'compactar', 'foto', 'imagem', 'jpg', 'png', 'webp'],
    },
    'resize-image': {
      name: 'Redimensionar imagem',
      description: 'Mude o tamanho de uma imagem em pixels ou em porcentagem.',
      synonyms: ['redimensionar', 'tamanho', 'dimensões', 'pixels', 'largura', 'altura', 'diminuir foto', 'aumentar', 'foto', 'imagem'],
    },
    'crop-image': {
      name: 'Cortar imagem',
      description: 'Corte uma foto em quadrado, 4:5, 16:9 ou do jeito que quiser.',
      synonyms: ['cortar', 'recortar', 'aparar', 'quadrado', 'proporção', '16:9', '4:5', 'foto', 'imagem'],
    },
    'rotate-image': {
      name: 'Girar imagem',
      description: 'Gire uma foto 90° ou 180°, ou espelhe a imagem.',
      synonyms: ['girar', 'rotacionar', 'virar', 'espelhar', 'inverter', 'de lado', 'de cabeça para baixo', 'foto', 'imagem'],
    },
    'heic-to-jpg': {
      name: 'HEIC para JPG',
      description: 'Transforme as fotos HEIC do iPhone em JPG ou PNG.',
      synonyms: ['heic', 'heif', 'foto do iphone', 'iphone', 'converter', 'jpg', 'jpeg', 'png', 'foto'],
    },
    'webp-to-jpg': {
      name: 'WebP para JPG',
      description: 'Transforme imagens WebP em JPG ou PNG.',
      synonyms: ['webp', 'converter', 'jpg', 'jpeg', 'png', 'webp animado', 'imagem'],
    },
    'png-to-jpg': {
      name: 'PNG para JPG',
      description: 'Transforme PNG em JPG, ou JPG em PNG.',
      synonyms: ['png', 'jpg', 'jpeg', 'jpg para png', 'converter', 'transparente', 'imagem'],
    },
    'image-to-pdf': {
      name: 'Imagem para PDF',
      description: 'Junte suas imagens num PDF só, uma imagem por página.',
      synonyms: ['pdf', 'jpg para pdf', 'png para pdf', 'foto para pdf', 'juntar imagens', 'juntar fotos', 'jpg', 'png', 'imagem'],
    },
    'compress-image-to-100kb': {
      name: 'Comprimir imagem para 100 KB',
      description: 'Um JPG de até 100 KB, para formulários com limite de tamanho.',
      synonyms: ['100kb', '100 kb', 'menos de 100kb', 'comprimir para 100kb', 'reduzir', 'formulário', 'jpg', 'jpeg'],
    },
    'compress-image-to-1mb': {
      name: 'Comprimir imagem para 1 MB',
      description: 'Um JPG de até 1 MB, para envios com limite de tamanho.',
      synonyms: ['1mb', '1 mb', 'menos de 1mb', 'comprimir para 1mb', 'reduzir', 'formulário', 'jpg', 'jpeg'],
    },
    'resize-image-youtube-thumbnail': {
      name: 'Miniatura do YouTube',
      description: 'Um JPG de 1280 × 720 com menos de 2 MB, pronto para o vídeo do YouTube.',
      synonyms: ['youtube', 'miniatura', 'thumbnail', 'capa do vídeo', '1280x720', '1280 x 720', '16:9', 'vídeo', 'jpg'],
    },
  },
  pdf: {
    'merge-pdf': {
      name: 'Juntar PDF',
      description: 'Junte vários PDFs num só, na ordem que você escolher.',
      synonyms: ['juntar', 'unir', 'combinar', 'mesclar', 'agrupar', 'pdf', 'juntar pdf', 'unir pdf'],
    },
    'split-pdf': {
      name: 'Dividir PDF',
      description: 'Separe um PDF em partes: cada página, intervalos ou as páginas que escolher.',
      synonyms: ['dividir', 'separar', 'extrair páginas', 'cortar', 'partir', 'pdf', 'dividir pdf', 'extrair'],
    },
    'pdf-to-jpg': {
      name: 'PDF para JPG',
      description: 'Transforme cada página de um PDF numa imagem JPG ou PNG.',
      synonyms: ['pdf para jpg', 'pdf para jpeg', 'pdf para png', 'pdf para imagem', 'converter pdf', 'página para imagem', 'pdf'],
    },
    'compress-pdf': {
      name: 'Comprimir PDF',
      description: 'Deixe um PDF menor, mexendo ou não nas imagens dele.',
      synonyms: ['comprimir pdf', 'reduzir pdf', 'diminuir pdf', 'tamanho do pdf', 'pdf menor', 'otimizar pdf', 'pdf'],
    },
    'rotate-pdf': {
      name: 'Girar PDF',
      description: 'Gire as páginas de um PDF, todas de uma vez ou uma a uma.',
      synonyms: ['girar pdf', 'rotacionar pdf', 'virar pdf', 'girar páginas', 'paisagem', 'retrato', 'pdf'],
    },
    'delete-pdf-pages': {
      name: 'Excluir páginas do PDF',
      description: 'Tire páginas de um PDF e fique com o resto.',
      synonyms: ['excluir páginas', 'apagar páginas', 'remover páginas', 'tirar página do pdf', 'pdf'],
    },
    'add-page-numbers-to-pdf': {
      name: 'Numerar páginas do PDF',
      description: 'Ponha número nas páginas de um PDF, onde e como quiser.',
      synonyms: ['numerar páginas', 'número de página', 'paginar', 'paginação', 'numeração', 'pdf'],
    },
    'sign-pdf': {
      name: 'Assinar PDF',
      description: 'Desenhe, escolha uma imagem ou digite sua assinatura e coloque no PDF.',
      synonyms: ['assinar pdf', 'assinatura', 'colocar assinatura', 'assinar documento', 'rubrica', 'pdf'],
    },
    'protect-pdf': {
      name: 'Proteger PDF',
      description: 'Tranque um PDF com senha, usando AES-256.',
      synonyms: ['proteger pdf', 'senha no pdf', 'colocar senha', 'criptografar pdf', 'trancar pdf', 'pdf'],
    },
    'unlock-pdf': {
      name: 'Desbloquear PDF',
      description: 'Tire a senha ou as restrições de um PDF que você consegue abrir.',
      synonyms: ['tirar senha', 'remover senha', 'desbloquear pdf', 'descriptografar pdf', 'tirar restrições', 'pdf'],
    },
    'reorder-pdf-pages': {
      name: 'Organizar páginas do PDF',
      description: 'Mude a ordem das páginas de um PDF.',
      synonyms: ['organizar páginas', 'reordenar páginas', 'ordenar páginas', 'mover páginas', 'mudar ordem', 'pdf'],
    },
    'watermark-pdf': {
      name: "Marca d'água no PDF",
      description: "Carimbe um texto de marca d'água em todas as páginas de um PDF.",
      synonyms: ["marca d'água", 'marca dagua', 'carimbo', 'confidencial', 'rascunho', 'pdf'],
    },
  },
  calcs: {
    'br-sac-price': {
      name: 'Simulador SAC × PRICE',
      description: 'Compare as parcelas e os juros do financiamento imobiliário nos dois sistemas.',
      synonyms: ['sac', 'price', 'tabela price', 'financiamento imobiliário', 'casa própria', 'imóvel', 'parcela', 'tr'],
    },
    'br-vehicle-loan': {
      name: 'Simulador de financiamento de veículo',
      description: 'Veja a parcela, o total pago e o CET do financiamento do carro ou da moto.',
      synonyms: ['financiamento de carro', 'financiamento de veículo', 'carro', 'moto', 'cet', 'iof', 'parcela'],
    },
    'br-personal-loan': {
      name: 'Simulador de empréstimo',
      description: 'Veja a parcela, o total pago e o CET de um empréstimo pessoal.',
      synonyms: ['empréstimo', 'empréstimo pessoal', 'crédito pessoal', 'cet', 'iof', 'parcela', 'juros'],
    },
    'br-early-payoff': {
      name: 'Amortização antecipada',
      description: 'Veja quanto de juros você deixa de pagar adiantando parte do saldo devedor.',
      synonyms: ['amortização', 'amortizar', 'antecipar parcelas', 'quitar antes', 'liquidação antecipada', 'saldo devedor'],
    },
    'br-credit-card': {
      name: 'Calculadora do cartão de crédito',
      description: 'Compare pagar o mínimo e cair no rotativo com parcelar a fatura já.',
      synonyms: ['cartão de crédito', 'rotativo', 'fatura', 'parcelar fatura', 'pagamento mínimo', 'juros do cartão'],
    },
    'br-debt-payoff': {
      name: 'Calculadora de dívidas',
      description: 'Bola de neve ou avalanche: veja em quanto tempo e com quanto de juros você sai das dívidas.',
      synonyms: ['dívidas', 'sair das dívidas', 'bola de neve', 'avalanche', 'quitar dívidas', 'juros'],
    },
    'br-compound-interest': {
      name: 'Calculadora de juros compostos',
      description: 'Veja quanto o dinheiro rende com juros compostos e aportes mensais.',
      synonyms: ['juros compostos', 'rendimento', 'investimento', 'aporte mensal', 'poupar', 'juros sobre juros'],
    },
    'br-rent-or-buy': {
      name: 'Alugar ou comprar',
      description: 'Compare alugar e investir a diferença com financiar o imóvel, ano a ano.',
      synonyms: ['alugar ou comprar', 'aluguel', 'comprar imóvel', 'financiamento', 'itbi', 'casa própria'],
    },
  },
} satisfies PtCommonTexts;
