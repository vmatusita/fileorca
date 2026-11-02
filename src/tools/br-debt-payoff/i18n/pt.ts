import type { CalcPageTexts } from '../../calc/types.ts';

// Calculadora de dívidas (F6, decisão 5.6): bola de neve × avalanche, adaptada do Debt payoff, com juros ao mês.
export default {
  title: 'Calculadora de dívidas: bola de neve ou avalanche',
  description: 'Veja em quanto tempo e com quanto de juros você sai das dívidas pagando primeiro a menor ou a de juros mais altos. Grátis, sem cadastro.',
  h1: 'Calculadora de dívidas',
  lead: 'Qual dívida pagar primeiro para sair delas mais cedo e com menos juros.',
  panel: {
    fields: {
      d: { label: 'Suas dívidas', error: '' },
      b: { label: 'Saldo', prefix: 'R$', error: 'Digite um saldo de R$ 1 a R$ 1.000.000.' },
      r: { label: 'Juros ao mês', suffix: '%', error: 'Digite juros de 0 a 20% ao mês.' },
      m: { label: 'Pagamento mínimo', prefix: 'R$', error: 'Digite um mínimo de R$ 0 a R$ 100.000.' },
      x: { label: 'Valor extra por mês', prefix: 'R$', error: 'Digite um valor de R$ 0 a R$ 1.000.000.', help: 'Além da soma dos pagamentos mínimos.' },
    },
    view: {
      label: 'Orçamento por mês',
      unit: '/mês',
      placard: 'por mês',
      sentence: 'Com esse orçamento, a bola de neve tira você das dívidas em {snow}, com {snowInterest} de juros, e a avalanche em {aval}, com {avalInterest}.',
      tooLow: 'Um orçamento de {budget} não cobre os juros do primeiro mês. Aumente o valor extra até o orçamento chegar a pelo menos {minimum}.',
      tooLong: 'Com {budget} por mês as dívidas levariam mais de 100 anos. Aumente o valor extra.',
      snowball: 'Bola de neve',
      avalanche: 'Avalanche',
      free: 'Sem dívidas em',
      interest: 'Juros',
      order: 'Ordem de quitação',
      diff: 'A avalanche {interestPart} e {timePart}.',
      lessInterest: 'paga {x} a menos de juros',
      moreInterest: 'paga {x} a mais de juros',
      sameInterest: 'paga os mesmos juros',
      sooner: 'termina {x} antes',
      later: 'termina {x} depois',
      sameTime: 'termina no mesmo tempo',
      caption: 'Quanto ainda se deve no fim de cada ano, somando as dívidas, em cada método',
      year: 'Ano',
      compareLabel: 'Bola de neve e avalanche lado a lado',
      scheduleHeading: 'Saldo por ano',
    },
    premises: [
      'Todo mês você paga o mínimo de cada dívida, e o resto do orçamento (os mínimos mais o valor extra) vai para uma dívida de cada vez.',
      'A bola de neve paga primeiro o menor saldo; a avalanche paga primeiro os juros mais altos. Em empate, vale a ordem em que você digitou.',
      'Quando uma dívida acaba, o mínimo dela continua no orçamento e passa para a próxima.',
      'Os juros de cada dívida são a taxa efetiva ao mês que você digita, sobre o saldo, arredondados ao centavo. Não entram compras novas, multas nem renegociações.',
    ],
  },
  howHeading: 'Como usar a calculadora de dívidas',
  howSteps: [
    'Digite cada dívida com o saldo, os juros ao mês e o pagamento mínimo. Dá para pôr até 10.',
    'Digite quanto você consegue pagar por mês além dos mínimos.',
    'Compare a bola de neve e a avalanche e baixe o plano em PDF ou CSV.',
  ],
  worksHeading: 'Como os dois métodos são calculados',
  formulaHeading: 'A conta',
  formula: [
    'Mês a mês, cada dívida soma os juros do mês (saldo × juros ao mês). Primeiro sai o mínimo de cada uma; depois, o que sobra do orçamento vai inteiro para a dívida da vez, até ela acabar.',
    'Na bola de neve a dívida da vez é a de menor saldo inicial; na avalanche, a de juros mais altos. A conta segue até todos os saldos chegarem a zero.',
  ],
  premisesHeading: 'Premissas',
  exampleHeading: 'Exemplo resolvido',
  exampleIntro: 'Este é o exemplo com que a calculadora abre, calculado pelo mesmo motor que você usa acima.',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Conselho Monetário Nacional, Resolução nº 5.004/2022, arts. 6 e 7: o direito de quitar ou adiantar o pagamento de uma dívida com desconto dos juros', href: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5004' },
    { label: 'Conselho Monetário Nacional, Resolução nº 4.549/2017 (consolidada): o rotativo e o parcelamento do cartão', href: 'https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50330/Res_4549_v2_L.pdf' },
  ],
  disclaimer: 'Esta calculadora é uma ferramenta educativa, não é recomendação financeira. Se as dívidas apertam o orçamento, vale procurar o credor para renegociar.',
  faqHeading: 'Perguntas sobre sair das dívidas',
  faq: [
    {
      q: 'Qual é a diferença entre bola de neve e avalanche?',
      a: 'Na bola de neve você quita primeiro a menor dívida, o que dá uma vitória rápida e libera um mínimo mais cedo. Na avalanche você quita primeiro a de juros mais altos, o que normalmente economiza mais juros.',
    },
    {
      q: 'Qual método é melhor?',
      a: 'A avalanche costuma pagar menos juros; a bola de neve costuma motivar mais. A calculadora mostra a diferença em reais e em meses, para você ver se a economia vale a troca.',
    },
    {
      q: 'Os juros do cartão entram como?',
      a: 'Digite a taxa ao mês que está na fatura. Como os juros do rotativo e do parcelamento costumam ser os mais altos, o cartão tende a ser a primeira dívida da avalanche.',
    },
    {
      q: 'E se o orçamento não cobrir os juros?',
      a: 'A calculadora avisa e diz o orçamento mínimo para a dívida começar a cair. Com menos que isso, o saldo cresce todo mês, e o caminho é aumentar o valor extra ou renegociar.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. A calculadora roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
