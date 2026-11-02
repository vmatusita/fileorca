import type { LegalTexts } from '../types.ts';

export default {
  title: 'Política de privacidade',
  description:
    'Como o FileOrca trata seus dados: os arquivos ficam no aparelho, o que Google Analytics, AdSense e Cloudflare processam e seus direitos na LGPD e no GDPR.',
  h1: 'Política de privacidade',
  updated: 'Última atualização: 2 de novembro de 2026',
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
        'Os números seguem o mesmo princípio. O que você digita em uma ferramenta, como uma largura, uma altura ou uma porcentagem, fica no seu navegador: não entra no endereço da página, e nenhum evento de medição leva esses números.',
        'As calculadoras de dinheiro funcionam do mesmo jeito. Os preços, as taxas e os saldos que você digita são calculados no seu aparelho e nunca são enviados. O PDF e o CSV de uma calculadora também são gerados no seu aparelho. O botão Copiar link põe os seus números depois do # do endereço copiado: essa parte do endereço fica no navegador que o abre e nunca vai para o nosso servidor, e a página nunca a acrescenta ao endereço por conta própria.',
        'As calculadoras de casa e de saúde, que existem só em inglês, funcionam do mesmo jeito. As medidas que você digita, como altura, peso, cintura ou área, e as datas que você informa, como o primeiro dia da última menstruação ou a data da concepção ou da transferência do embrião, são calculadas no seu aparelho e nunca são enviadas. O link que elas copiam leva esses números, essas datas e as escolhas que você fez, como as unidades, o sexo que a fórmula usa ou a forma de contar a data do parto, depois do # do endereço, a parte que o navegador nunca envia. A calculadora da data provável do parto lê a data de hoje no relógio do seu aparelho, e essa data também nunca é enviada.',
        'O gerador de QR code, que também existe só em inglês, segue o mesmo princípio. O código é montado no seu navegador a partir do texto ou do endereço que você digita, e esse texto fica no seu aparelho: não entra no endereço da página, nenhum evento de medição o leva, ele não fica guardado no navegador nem em cookie e não entra no nome dos arquivos que você baixa, qr-code.png e qr-code.svg. O FileOrca nunca abre o endereço digitado nem faz requisição a ele.',
        "As ferramentas de PDF seguem o mesmo princípio. O PDF é lido e gravado no seu aparelho, pelo PDF.js e pelo qpdf, duas bibliotecas de código aberto que rodam no navegador. O que você digita ali, como um intervalo de páginas ou o texto de uma marca d'água, fica no seu navegador. A senha que você digita ao proteger ou desbloquear um PDF não sai do seu aparelho e não fica guardada, nem em servidor, nem no navegador. A assinatura que você desenha, envia ou digita ao assinar um PDF também não fica guardada em lugar nenhum.",
        'As ferramentas de imagem, por exemplo, salvam uma cópia nova da sua foto sem os metadados, inclusive a localização GPS.',
        'Dá para conferir: abra a aba Rede do navegador enquanto usa uma ferramenta. Nenhuma requisição leva o seu arquivo. O mesmo vale para o Pix da página de apoio: o código é estático, gerado pelo site quando ele é montado, e já vem na página. Escolher um valor não faz nenhuma requisição, e o clique em Copiar código só manda ao Google Analytics o evento de clique em doação da lista abaixo, sem o código e sem o valor. O site não fica sabendo quem pagou nem quanto, porque o pagamento vai do app do banco de quem paga direto para a conta de quem recebe; como em todo Pix, o extrato dessa conta mostra o nome de quem pagou e o valor. Se alguém pedir a devolução, ela só é feita pelo botão de devolução do próprio Pix, que o Regulamento do Pix deixa quem recebe usar em até 90 dias.',
      ],
    },
    {
      heading: 'A cópia guardada para usar offline',
      paragraphs: [
        'Quando você abre uma página do FileOrca com internet, o seu navegador guarda uma cópia dessa página e dos arquivos do site de que ela precisa, como os scripts, os estilos, as fontes e o motor de uma ferramenta que você usou, para a página funcionar também offline. Essa cópia fica no seu aparelho, no armazenamento do navegador, e o FileOrca nunca a recebe.',
        'Os seus arquivos e os seus números nunca entram nessa cópia. Ela guarda só arquivos de fileorca.com, em endereços sem a parte depois do ? ou do #, então o que você digita, abre ou salva fica de fora.',
        'Para apagar a cópia, limpe os dados do site fileorca.com nas configurações do navegador, ou desinstale o app do FileOrca, se você o instalou.',
        'No Android, quando você compartilha imagens ou PDFs com o app do FileOrca instalado, eles esperam no seu aparelho até você escolher uma ferramenta. Eles são apagados assim que a ferramenta os recebe, ou depois de uma hora, se você não escolher nenhuma. Eles nunca são enviados. Quando você escolhe uma ferramenta, a página anota nesta aba qual foi a escolhida, e nada mais.',
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
        'O Google Analytics mede as visualizações de página e uma lista fixa de eventos. Nenhum evento leva nomes de arquivo, o conteúdo dos arquivos ou os números, as datas e os textos que você digita. Os eventos são:',
      ],
      list: [
        'Ferramenta iniciada',
        'Ferramenta concluída',
        'Clique em Baixar',
        'Clique em uma sugestão de próximo passo',
        'Erro da ferramenta, com o navegador e o formato do arquivo',
        'Clique em um link de doação ou no botão Copiar código do Pix',
        'Primeiro resultado de uma calculadora, só com o nome da calculadora',
        'PDF ou CSV baixado de uma calculadora, ou QR code baixado em PNG ou SVG, só com o formato',
        'Clique em Copiar link numa calculadora, sem o link',
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
        'Se você aceitar no aviso de cookies, o FileOrca também conta ali quantos lotes de imagens ou de PDFs terminaram com pelo menos um resultado de verdade neste navegador, como uma imagem menor, convertida, girada, cortada ou redimensionada, ou um PDF novo, para o pedido de café aparecer só a partir do terceiro e no máximo uma vez por semana; se você pedir para não ver mais, isso também fica guardado ali. Essa contagem fica só no navegador e nunca sai dele, e é apagada se você recusar os cookies depois.',
        'Nas calculadoras, a página guarda uma marca de sim ou não no armazenamento da sessão desta aba, para a Oli comemorar só no primeiro resultado da visita. Ela não tem nenhum número, nunca sai do navegador e some quando você fecha a aba.',
      ],
    },
    {
      heading: 'Seus e-mails',
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
        'Recusar, ou ainda não ter aceitado onde o consentimento é negado por padrão, não desliga o Google Analytics: ele passa a funcionar sem cookies, e o Google ainda pode receber as visualizações de página e os eventos da lista acima, sem nenhum identificador guardado no seu navegador.',
        'Para mudar a sua escolha quando quiser, use o botão abaixo.',
      ],
    },
    {
      heading: 'Bases legais',
      paragraphs: [
        'O FileOrca segue o GDPR (o Regulamento Geral de Proteção de Dados da União Europeia) e a LGPD (Lei nº 13.709/2018, a Lei Geral de Proteção de Dados Pessoais do Brasil). As bases legais são:',
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
        'Cópia offline: fica no navegador até você limpar os dados do site ou desinstalar o app. Os arquivos compartilhados com o app são apagados quando uma ferramenta os recebe, ou depois de uma hora.',
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
