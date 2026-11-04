// O hub de guias /pt/guias/ em português (F11, decisão 5; DECISOES § 364): a faixa, os atalhos dos três grupos, os títulos
// dos grupos e "Como os guias são feitos", com os textos da especificação (docs/propostas/ux-v2/guides-hub.html, alternativa
// A). Os guias vêm dos registros, com o nome e a descrição dos cartões (common.fileGuides). Os guias de dinheiro não existem
// em português: o grupo Dinheiro é só a nota que leva às calculadoras financeiras do Brasil. {n} é o número de guias do idioma.
// A nota troca o "hipoteca" da especificação por "financiamento imobiliário", como manda o glossário (docs/i18n/pt.md, "Nunca").
import type { GuidesHubTexts } from '../types.ts';

const texts: GuidesHubTexts = {
  title: 'Guias: dúvidas de imagem e PDF, com os números',
  description: '{n} guias para dúvidas comuns sobre imagens e PDFs, com os números medidos e a ferramenta dentro de cada um.',
  eyebrow: 'Guias',
  h1: 'Respostas que mostram os números',
  intro: '{n} guias para dúvidas comuns sobre imagens e PDFs. Cada um diz de onde vieram os números e traz a ferramenta dentro, para você testar na mesma página.',
  jumpLabel: 'Grupos de guias',
  groups: {
    image: { jump: 'Imagem', heading: 'Guias de imagem' },
    pdf: { jump: 'PDF', heading: 'Guias de PDF' },
    money: { jump: 'Dinheiro', heading: 'Dinheiro' },
  },
  moneyNote: {
    before: 'Os guias de dinheiro falam de financiamento imobiliário e de crédito nos Estados Unidos, por isso existem só em inglês e em espanhol. Para as contas do Brasil, como SAC ou PRICE, use as',
    link: 'calculadoras financeiras',
    after: '.',
  },
  howHeading: 'Como os guias são feitos',
  how: 'Os guias são medidos em arquivos de teste reais, com o mesmo motor que roda as ferramentas deste site. Cada guia lista os arquivos que usou, o dia da medição e quem revisou. Nada do que você coloca numa ferramenta sai do seu aparelho.',
};

export default texts;
