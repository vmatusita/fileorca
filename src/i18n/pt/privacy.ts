import type { LegalTexts } from '../types.ts';

export default {
  title: 'Política de privacidade',
  description:
    'Como o FileOrca trata seus dados: os arquivos ficam no aparelho, o que Google Analytics, AdSense e Cloudflare processam e seus direitos na LGPD e no GDPR.',
  h1: 'Política de privacidade',
  updated: 'Última atualização: 30 de outubro de 2026',
  intro:
    'Esta página explica o que acontece com seus dados no fileorca.com. Em resumo: seus arquivos nunca saem do seu aparelho. Abaixo você vê quem é o responsável, o que é coletado, por quem e quais são os seus direitos.',
  sections: [
    {
      heading: 'Quem é o responsável',
      paragraphs: [
        'O controlador dos seus dados pessoais no fileorca.com é Victor Yuki Matusita, pessoa física e desenvolvedor, de Curitiba, Paraná, Brasil. O FileOrca é feito e mantido por uma pessoa só.',
        'Para qualquer dúvida sobre esta política ou sobre seus dados, escreva para contato@fileorca.com. Para saber mais sobre mim, acesse https://vmatusita.com.br.',
      ],
    },
    {
      heading: 'Seus arquivos ficam no seu aparelho',
      paragraphs: [
        'As ferramentas do FileOrca rodam no seu navegador. Os arquivos que você escolhe são processados no seu aparelho e nunca são enviados. O FileOrca não tem servidor que processe arquivos, e você não precisa criar conta.',
        'Com os números é a mesma coisa. Quando as calculadoras chegarem, elas vão guardar os números que você digitar na parte do endereço depois do sinal #. O navegador não envia essa parte a nenhum servidor, e nenhum evento de medição leva esses números.',
        'A ferramenta de imagem, por exemplo, salva uma cópia mais leve da sua imagem sem os metadados da foto, inclusive a localização GPS.',
        'Dá para conferir: abra a aba Rede do navegador enquanto usa uma ferramenta. Nenhuma requisição leva o seu arquivo.',
      ],
    },
    {
      heading: 'Entrega do site (Cloudflare)',
      paragraphs: [
        'O FileOrca é um site estático, entregue pela Cloudflare. Quando o seu navegador pede uma página, a Cloudflare processa dados técnicos da requisição, como o endereço IP e o navegador, para entregar e proteger o site.',
        'Esses dados não incluem seus arquivos. A Cloudflare os trata de acordo com as próprias políticas.',
      ],
    },
    {
      heading: 'Medição de uso (Google Analytics 4)',
      paragraphs: [
        'Para saber quais ferramentas ajudam as pessoas, o FileOrca usa o Google Analytics 4, um serviço do Google. O que ele pode guardar no seu navegador depende da escolha que você faz no aviso de cookies, como explicado na seção sobre consentimento, mais abaixo.',
        'O Google Analytics mede as visualizações de página e uma lista fixa de eventos. Nenhum evento leva nomes de arquivo, o conteúdo dos arquivos ou números que você digita. Os eventos são:',
      ],
      list: [
        'Ferramenta iniciada',
        'Ferramenta concluída',
        'Download',
        'Clique em uma sugestão de próximo passo',
        'Erro da ferramenta, com o navegador e o formato do arquivo',
        'Clique em um link de doação',
      ],
    },
    {
      heading: 'Anúncios (Google AdSense)',
      paragraphs: [
        'Para continuar grátis, o FileOrca mostra, ou vai mostrar, anúncios do Google AdSense. O Google é o parceiro de publicidade do site.',
        'Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base nas suas visitas anteriores a este e a outros sites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros exibam anúncios para você com base nessas visitas.',
        'No Espaço Econômico Europeu (EEE), no Reino Unido e na Suíça, uma mensagem de consentimento do Google vai pedir a sua escolha antes de os anúncios usarem cookies, quando os anúncios estiverem no ar.',
        'Use estes links para desativar a publicidade personalizada e para ler como o Google usa dados de sites parceiros:',
      ],
      list: [
        'Configurações de anúncios do Google: https://adssettings.google.com',
        'Como o Google usa dados de sites parceiros: https://policies.google.com/technologies/partner-sites',
      ],
    },
    {
      heading: 'Sua escolha de cookies no navegador',
      paragraphs: [
        'O FileOrca guarda a sua escolha sobre cookies no armazenamento local (local storage) do navegador, para o aviso não voltar toda vez. Esse registro fica no seu aparelho. Para apagá-lo, limpe os dados do site no navegador; o aviso volta a aparecer.',
      ],
    },
    {
      heading: 'E-mails',
      paragraphs: [
        'Os e-mails enviados para contato@fileorca.com são encaminhados pelo Cloudflare Email Routing para uma caixa do Gmail. Eu uso essas mensagens só para responder a você.',
      ],
    },
    {
      heading: 'Consentimento por região e suas escolhas',
      action: 'consent-choice',
      paragraphs: [
        'O consentimento depende de onde você está e usa o Consent Mode v2 do Google.',
        'Na União Europeia, no EEE (Islândia, Liechtenstein e Noruega), no Reino Unido e na Suíça, o armazenamento para medição de uso e para anúncios fica negado por padrão até você aceitar.',
        'Nos demais lugares, o armazenamento para medição de uso e para anúncios fica liberado por padrão, e você pode recusar no aviso de cookies.',
        'Para mudar a sua escolha quando quiser, use o botão abaixo.',
      ],
    },
    {
      heading: 'Bases legais',
      paragraphs: [
        'O FileOrca segue o GDPR (o Regulamento Geral de Proteção de Dados da União Europeia) e a LGPD (Lei nº 13.709/2018). As bases legais são:',
      ],
      list: [
        'Consentimento (GDPR, art. 6(1)(a); LGPD, art. 7º, I) para o Google Analytics e para os cookies de anúncio, quando a lei exige. Você pode retirá-lo a qualquer momento.',
        'Interesse legítimo (GDPR, art. 6(1)(f); LGPD, art. 7º, IX) para entregar e proteger o site, o que cobre os dados técnicos que a Cloudflare processa.',
        'Interesse legítimo (os mesmos artigos) em responder a você quando você escreve para contato@fileorca.com.',
      ],
    },
    {
      heading: 'Transferências internacionais',
      paragraphs: [
        'O Google e a Cloudflare podem processar dados fora do seu país, inclusive nos Estados Unidos. As duas empresas dizem usar salvaguardas nessas transferências, como cláusulas contratuais padrão.',
      ],
    },
    {
      heading: 'Por quanto tempo os dados ficam guardados',
      paragraphs: [
        'O FileOrca nunca recebe seus arquivos, então não guarda nenhum. Para o resto, depende de quem cuida dos dados:',
      ],
      list: [
        'Dados de medição: ficam pelo período definido nas configurações de retenção do Google Analytics.',
        'Dados de entrega: a Cloudflare os guarda de acordo com as próprias políticas.',
        'Dados de anúncios: o Google os guarda de acordo com as próprias políticas.',
        'Escolha de cookies: fica no seu navegador, e você pode apagá-la quando quiser limpando os dados do site.',
        'E-mails: guardados só pelo tempo necessário para responder a você.',
      ],
    },
    {
      heading: 'Seus direitos',
      paragraphs: [
        'Pela LGPD e pelo GDPR, você tem o direito de acessar seus dados, corrigi-los, apagá-los, recebê-los em formato portável, se opor ao uso deles e retirar o seu consentimento a qualquer momento.',
        'Para exercer qualquer um desses direitos, escreva para contato@fileorca.com.',
        'Você também pode apresentar uma reclamação à ANPD (Autoridade Nacional de Proteção de Dados, do Brasil) ou à autoridade de proteção de dados do seu país.',
      ],
    },
    {
      heading: 'Crianças',
      paragraphs: [
        'O FileOrca não é voltado a crianças. Se você acha que uma criança enviou dados pessoais pelo site ou por e-mail, escreva para contato@fileorca.com para que eles sejam apagados.',
      ],
    },
    {
      heading: 'Mudanças nesta política',
      paragraphs: [
        'Esta política pode mudar, por exemplo quando novas ferramentas forem adicionadas ou o site passar a usar um novo serviço. A data no topo da página mostra a última atualização.',
      ],
    },
  ],
} satisfies LegalTexts;
