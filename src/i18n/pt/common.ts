import type { CommonTexts } from '../types.ts';

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
    emptyHint: 'Tente "comprimir", "imagem" ou "foto".',
    imageCategory: 'Imagem',
    shortcut: 'Ctrl K',
  },
  tools: {
    'compress-image': {
      name: 'Comprimir imagem',
      description: 'Deixe um JPG, PNG ou WebP mais leve, direto no navegador.',
      synonyms: ['comprimir', 'reduzir', 'diminuir', 'otimizar', 'compactar', 'foto', 'imagem', 'jpg', 'png', 'webp'],
    },
  },
} satisfies CommonTexts;
