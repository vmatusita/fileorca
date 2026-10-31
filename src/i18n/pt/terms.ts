import type { LegalTexts } from '../types.ts';

export default {
  title: 'Termos de uso',
  description:
    'Os termos para usar o FileOrca, ferramentas grátis que rodam no navegador: seus arquivos, resultados, calculadoras, anúncios, doações e responsabilidade.',
  h1: 'Termos de uso',
  updated: 'Última atualização: 31 de outubro de 2026',
  intro:
    'Estes termos explicam como você pode usar o FileOrca. Ao usar o site, você concorda com eles. Se não concordar, por favor, não use o site.',
  sections: [
    {
      heading: 'Quem oferece o serviço',
      paragraphs: [
        'O FileOrca (fileorca.com) é feito e mantido por uma pessoa só: Victor Yuki Matusita, desenvolvedor em Curitiba, Paraná, Brasil. Ele é pessoa física, não empresa.',
        'O que o FileOrca faz com dados pessoais está explicado na página de Privacidade.',
      ],
    },
    {
      heading: 'O que é o FileOrca',
      paragraphs: [
        'O FileOrca é um site com ferramentas grátis que rodam no navegador. Ele foi pensado para imagens, PDFs e calculadoras. Hoje o site tem ferramentas de imagem, como comprimir, redimensionar, cortar e converter. As ferramentas estão em inglês, e a Comprimir imagem também está em português e espanhol.',
        'Você não precisa de conta. Seus arquivos são processados no seu aparelho, e não em um servidor, e nunca são enviados.',
      ],
    },
    {
      heading: 'Seus arquivos e a sua responsabilidade',
      paragraphs: [
        'Os arquivos que você usa no FileOrca continuam sendo seus. O FileOrca nunca os recebe e não reivindica nenhum direito sobre eles.',
        'Você é responsável pelos arquivos que escolhe processar e pelo que faz com os resultados.',
      ],
      list: [
        'Tenha certeza de que você tem o direito de processar cada arquivo.',
        'Guarde os originais. Confira o resultado antes de apagar ou substituir qualquer coisa.',
        'O FileOrca não consegue recuperar um arquivo perdido, apagado ou danificado, porque nunca recebe os seus arquivos.',
      ],
    },
    {
      heading: 'Resultados sem garantia',
      paragraphs: [
        'O FileOrca é oferecido "como está" e "conforme disponível", sem custo. Os resultados variam conforme o arquivo e o navegador, e uma ferramenta pode funcionar de um jeito no seu aparelho e de outro no de outra pessoa.',
        'Não há garantia de que uma ferramenta funcione com todos os arquivos, de que o resultado atenda ao que você precisa ou de que o site esteja sempre disponível e sem erros.',
        'Confira cada resultado antes de usá-lo.',
      ],
    },
    {
      heading: 'Calculadoras são educativas, não aconselhamento',
      paragraphs: [
        'O FileOrca também vai ter calculadoras. Elas servem só para aprender e se informar. Elas não constituem aconselhamento financeiro, jurídico nem médico e não substituem um profissional qualificado.',
        'Os resultados são estimativas feitas com os números que você digita. A vida real pode ser diferente, então confirme com um profissional qualificado antes de tomar uma decisão sobre dinheiro, questões jurídicas ou saúde.',
      ],
    },
    {
      heading: 'Uso aceitável',
      paragraphs: [
        'Use o FileOrca de boa-fé e siga estas regras.',
        'Buscadores e outros robôs podem ler e indexar o site, desde que não o sobrecarreguem.',
      ],
      list: [
        'Não tente quebrar, atacar nem sobrecarregar o site.',
        'Não tente contornar as proteções do site.',
        'Não use o FileOrca para nada ilegal.',
        'Não use o FileOrca para processar arquivos que você não tem o direito de processar.',
      ],
    },
    {
      heading: 'Anúncios e doações',
      paragraphs: [
        'Para continuar grátis, o FileOrca mostra, ou vai mostrar, anúncios do Google AdSense. O Google é o parceiro de publicidade. A página de Privacidade explica como funcionam os anúncios e os cookies.',
        'Os anúncios, e os sites para onde eles levam, vêm de terceiros. O FileOrca não controla o conteúdo deles e não se responsabiliza por ele.',
        'Doar é opcional. O FileOrca tem um link para o Ko-fi, onde você pode deixar uma doação. O pagamento acontece no Ko-fi, sob as políticas dele.',
        'A doação é voluntária. Ela não compra nada e não muda nada no site.',
      ],
    },
    {
      heading: 'Propriedade intelectual',
      paragraphs: [
        'O nome FileOrca, a mascote Oli, os textos e o design do site pertencem a Victor Yuki Matusita. Não os copie nem os use como se fossem seus sem permissão.',
        'O FileOrca também usa bibliotecas de código aberto. Elas mantêm as próprias licenças, que estão listadas na página de Licenças.',
      ],
    },
    {
      heading: 'Limitação de responsabilidade',
      paragraphs: [
        'Na medida em que a lei permitir, Victor Yuki Matusita, que mantém o FileOrca, não responde por perdas ou danos decorrentes do uso do site ou da impossibilidade de usá-lo. Isso inclui arquivos perdidos, apagados ou danificados, perda de dados e decisões que você tomar com base em um resultado.',
        'Nada nestes termos tira direitos que a lei garante a você e que não podem ser dispensados, incluindo os direitos do consumidor.',
      ],
    },
    {
      heading: 'Mudanças nestes termos',
      paragraphs: [
        'Estes termos podem mudar, por exemplo quando o site ganhar novas ferramentas. A data no topo desta página mostra a última atualização.',
        'Se você continuar usando o FileOrca depois de uma mudança, os novos termos valem para você.',
      ],
    },
    {
      heading: 'Lei aplicável e foro',
      paragraphs: [
        'Estes termos seguem a lei brasileira. Qualquer disputa será levada ao foro de Curitiba, Paraná, Brasil.',
        'A exceção é quando a lei de defesa do consumidor dá a você o direito de ir à Justiça no foro do seu domicílio. Nesse caso, esse direito continua valendo.',
      ],
    },
    {
      heading: 'Contato',
      paragraphs: [
        'Dúvidas sobre estes termos? Escreva para contato@fileorca.com. Os e-mails são usados só para responder a você.',
      ],
    },
  ],
} satisfies LegalTexts;
