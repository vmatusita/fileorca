import type { WhatsNewTexts } from '../types.ts';

// F19a (decisão 2; DECISOES § 752 e § 755): a página Novidades. As entradas (data, PR, páginas) estão em
// src/platform/changelog.ts; cada título e texto diz o que mudou para a pessoa, na voz do site e no glossário
// (docs/i18n/pt.md), sem contagem de ferramentas, sem nome de fase e sem número que não venha de um registro. Existe um
// texto exatamente para as entradas que o português mostra (entriesIn('pt'); tests/unit/changelog.test.ts).
export default {
  title: 'Novidades do FileOrca',
  description: 'Cada mudança que você vê no FileOrca desde que o site entrou no ar: ferramentas, idiomas e guias novos, cada um com o dia em que chegou ao site.',
  h1: 'Novidades',
  intro: 'Cada mudança que você vê no FileOrca, da mais nova para a mais antiga, com o dia em que chegou ao site e os links para as páginas que ela mudou.',
  more: 'e mais {n}',
  entries: {
    launch: {
      title: 'O FileOrca entra no ar',
      body: 'O FileOrca abre com a Comprimir imagem em português, inglês e espanhol, e com as páginas que dizem quem faz o site, como ele trata os seus dados e como falar com o autor.',
    },
    'private-chunks': {
      title: 'Nada escondido no PNG e no WebP',
      body: 'A Comprimir imagem agora tira também os blocos privados que alguns apps escondem dentro de arquivos PNG e WebP.',
    },
    'cookie-notice-space': {
      title: 'O aviso de cookies flutua',
      body: 'Enquanto está aberto, o aviso de cookies flutua sobre o fim da página e não deixa mais uma faixa vazia embaixo do rodapé.',
    },
    'calculator-terms': {
      title: 'Privacidade e termos das calculadoras',
      body: 'A Privacidade diz que os números que você digita numa calculadora são calculados no seu aparelho e nunca são enviados. Os Termos dizem que as calculadoras servem para aprender e se informar, e não são aconselhamento financeiro.',
    },
    'pdf-terms': {
      title: 'Termos para senhas e assinaturas',
      body: 'Os Termos explicam o que a Proteger PDF, a Desbloquear PDF e a Assinar PDF fazem com uma senha ou uma assinatura, e a Privacidade diz que a senha nunca sai do seu aparelho. As Licenças dão o crédito das bibliotecas que leem e gravam o PDF.',
    },
    'portuguese-spanish': {
      title: 'O FileOrca em português',
      body: 'As ferramentas de imagem e de PDF chegam em português, com calculadoras financeiras feitas para o Brasil, em reais, e o Pix na página Apoie a Oli. A página inicial e as páginas sobre o site mostram o que já existe em português.',
    },
    'health-terms': {
      title: 'Termos para saúde, casa e QR code',
      body: 'Os Termos dizem que as calculadoras de saúde, em inglês, dão estimativas por fórmulas publicadas e não são aconselhamento médico, e a Privacidade diz que as medidas, as datas e o texto que você digita ficam no seu aparelho. As Licenças dão o crédito das bibliotecas do QR code.',
    },
    offline: {
      title: 'As páginas que você abriu funcionam sem internet',
      body: 'As páginas que você já abriu seguem funcionando sem internet, e no Android dá para compartilhar uma imagem ou um PDF com o FileOrca e escolher a ferramenta. A Privacidade diz o que a cópia offline guarda, e que os seus arquivos e números nunca entram nela.',
    },
    'more-in-portuguese-spanish': {
      title: 'Mais páginas em português',
      body: 'O Gerador de QR code e os guias de arquivo chegam em português. A página inicial, as páginas de ferramentas e as páginas sobre o site levam até eles.',
    },
    'theme-and-menu': {
      title: 'Claro, escuro e o Menu',
      body: 'Toda página ganhou um botão de tema, para seguir o sistema ou ficar no claro ou no escuro, e um Menu com as categorias do site. A Privacidade diz que o tema escolhido fica só no seu navegador.',
    },
    'guides-hub': {
      title: 'Uma casa para os guias',
      body: 'Os guias ganharam uma página própria, em grupos de imagem e de PDF, e cada ferramenta com guia mostra o dela depois dos passos.',
    },
    'header-width': {
      title: 'Cabeçalho e rodapé alinhados',
      body: 'O cabeçalho e o rodapé agora têm as mesmas bordas em qualquer largura de tela.',
    },
    'support-page': {
      title: 'Apoie a Oli de cara nova',
      body: 'A página Apoie a Oli foi refeita, com o Pix num botão maior, e a linha do café agora abre o rodapé.',
    },
    'tool-page': {
      title: 'Cada ferramenta num lugar só',
      body: 'Cada ferramenta de imagem e de PDF ficou num lugar só, do arquivo que você solta ao resultado, sem a página pular. Uma sugestão embaixo do Baixar pode levar o resultado para a próxima ferramenta, e a Privacidade explica como ele fica no seu aparelho.',
    },
    'cookie-notice': {
      title: 'Um aviso de cookies menor',
      body: 'O aviso de cookies ficou mais baixo no celular e nunca cobre os botões de escolher ou baixar um arquivo.',
    },
    'calculator-card': {
      title: 'O resultado num bloco só',
      body: 'Cada calculadora mostra a resposta num bloco no alto da página, com o Baixar PDF dentro dele, e um erro diz qual campo corrigir. O Gerador de QR code mostra o código do mesmo jeito.',
    },
    'file-guide-page': {
      title: 'Uma página de guia mais clara',
      body: 'Cada guia de arquivo abre com o que foi medido e a ferramenta logo abaixo do título, e as tabelas ficaram mais fáceis de ler no celular.',
    },
    'home-and-hubs': {
      title: 'Página inicial e categorias novas',
      body: 'A página inicial foi refeita em volta do mar onde a Oli nada, e a página de cada categoria ganhou uma faixa do mesmo mar.',
    },
    'institutional-pages': {
      title: 'Páginas sobre o site, mais fáceis de ler',
      body: 'Numa tela larga, a Privacidade, os Termos e as Licenças mostram um índice das seções, e o Sobre e o Contato, um quadro com o site em números.',
    },
    'footer-phone': {
      title: 'Um rodapé mais curto no celular',
      body: 'No celular, o rodapé mostra a página principal de cada categoria e guarda as ferramentas numa lista que você abre.',
    },
    'home-cards': {
      title: 'Um cartão por ferramenta na página inicial',
      body: 'Cada categoria da página inicial mostra as ferramentas em cartões, com o ícone, o nome e o que a ferramenta faz.',
    },
    'pdf-pages': {
      title: 'Páginas inteiras nas ferramentas de PDF',
      body: 'As ferramentas de PDF mostram cada página inteira, pequena ou grande, e uma lupa abre a página grande, com a ação da ferramenta. A Excluir páginas do PDF mostra as páginas que vão sair, e um resultado que é um PDF só tem o Ver o PDF novo.',
    },
    'next-steps': {
      title: 'Próximos passos que levam o arquivo junto',
      body: 'Na Imagem para PDF, as fotos podem mudar de ordem e sair da lista, com Desfazer, e todo lote de imagem tem uma lixeira para cada arquivo. A Comprimir imagem leva as imagens até o tamanho que você digitar, com "Até um tamanho". As sugestões depois de um resultado levam o arquivo para mais ferramentas, e no celular o QR code aparece logo abaixo do campo.',
    },
    'calculator-typing': {
      title: 'Digitar sem tropeço nas calculadoras',
      body: 'O campo das calculadoras agora aceita um dígito digitado no meio de um número e diz quantas casas decimais aceita, e o leitor de tela ouve o resultado uma vez por digitação. O PDF rotula cada valor e diz o período da taxa.',
    },
    'avif-webp': {
      title: 'AVIF para JPG e Converter para WebP',
      body: 'A AVIF para JPG transforma imagens AVIF em JPG, e a Converter para WebP transforma JPG e PNG em arquivos WebP ou AVIF menores. Um AVIF solto em outra ferramenta de imagem mostra o caminho até a AVIF para JPG.',
    },
    'organize-exif': {
      title: 'Gerenciar páginas do PDF e Remover metadados da foto',
      body: 'A Gerenciar páginas do PDF deixa você marcar, girar, tirar e mudar páginas de lugar numa grade só, e a Remover metadados da foto tira a localização e os outros metadados de uma foto sem mexer nos pixels. Ajustes prontos novos extraem páginas de um PDF, passam um PDF para PNG e espelham uma imagem.',
    },
    'file-guides-measured': {
      title: 'Os números dos guias medidos de novo',
      body: 'Todos os números dos guias de arquivo foram medidos de novo, e o guia de como remover a localização das fotos agora usa a Remover metadados da foto.',
    },
    'trust-and-content': {
      title: 'Novidades e Como funciona',
      body: 'Esta página lista cada mudança que você vê, e a Como funciona mostra o que acontece com o seu arquivo e como conferir isso no navegador. As páginas das ferramentas e das calculadoras agora dizem cada coisa num lugar só, e o Sobre diz quando o site entrou no ar.',
    },
  },
} satisfies WhatsNewTexts;
