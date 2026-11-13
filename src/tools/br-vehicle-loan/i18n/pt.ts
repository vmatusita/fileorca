import type { CalcPageTexts, CalcPanelTexts } from '../../calc/types.ts';

/** O que o financiamento de veículo e o empréstimo dividem: o IOF, as tarifas, o CET e o resultado (F6, decisão 5). */
export const creditPanel: { fields: CalcPanelTexts['fields']; options: Record<string, Record<string, string>>; moreHeading: string; view: Record<string, string> } = {
  fields: {
    iof: { label: 'IOF', prefix: 'R$', error: 'Digite um IOF de R$ 0 a R$ 500.000.', help: 'O valor em reais que está na proposta.' },
    tf: { label: 'Tarifas', prefix: 'R$', error: 'Digite tarifas de R$ 0 a R$ 500.000.', help: 'Tarifa de cadastro, de avaliação e outras cobradas na contratação.' },
    c: { label: 'IOF e tarifas', error: '' },
  },
  options: { c: { financed: 'Financiar junto', upfront: 'Pagar à vista' } },
  moreHeading: 'IOF e tarifas',
  view: {
    unit: '/mês',
    placard: 'de CET ao ano',
    sentence: 'Em {months} você paga {total} no total, com {interest} de juros. O CET é de {cetYear} ao ano ({cetMonth} ao mês).',
    noLoan: 'Com a entrada igual ao preço não há o que financiar. Diminua a entrada para ver a parcela.',
    costsTooHigh: 'O IOF e as tarifas pagos à vista não podem passar do valor do crédito. Diminua os custos ou escolha financiar junto.',
    cetTooHigh: 'Com esses custos o CET passa de 10.000.000% ao ano, mais do que a calculadora consegue mostrar. Diminua o IOF e as tarifas.',
    cetShort: '{x}',
    cetYear: 'CET ao ano',
    cetMonth: 'CET ao mês',
    financed: 'Valor financiado',
    upfront: 'Pago à vista na contratação',
    released: 'Crédito líquido (base do CET)',
    principal: 'Valor financiado',
    interest: 'Total de juros',
    paid: 'Total pago',
    last: 'Última parcela',
  },
};

/** As premissas do CET e do IOF, iguais nas duas calculadoras de crédito. */
export const creditPremises = [
  'Os juros são a taxa efetiva ao mês que você digita, sobre o saldo de cada mês, arredondados ao centavo. As parcelas são mensais e iguais (tabela PRICE), e a última zera o saldo.',
  'O IOF e as tarifas entram no valor que você copia da proposta. Financiados, somam ao valor financiado e pagam juros; à vista, você paga na contratação.',
  'O CET segue a Resolução CMN nº 4.881/2020: a taxa que iguala as parcelas ao crédito liberado, menos o que você paga na contratação. As parcelas contam em meses iguais (expoente de 1/12 do ano), a mesma convenção do exemplo oficial do Banco Central. Com as datas reais do contrato o CET muda alguns centésimos.',
  'O CET ao ano é (1 + CET ao mês)^12 − 1, mostrado com duas casas.',
  'Não entram seguros, juros de mora nem outras despesas além do IOF e das tarifas que você digita.',
];

export default {
  title: 'Simulador de financiamento de veículo: parcela, juros e CET',
  description: 'Simule o financiamento do carro ou da moto: parcela, total pago e CET ao mês e ao ano, com IOF e tarifas financiados ou à vista. Grátis.',
  h1: 'Simulador de financiamento de veículo',
  lead: 'A parcela do veículo e quanto o crédito custa de verdade.',
  panel: {
    fields: {
      p: { label: 'Preço do veículo', prefix: 'R$', error: 'Digite um preço de R$ 1.000 a R$ 5.000.000.' },
      e: { label: 'Entrada', prefix: 'R$', error: 'Digite uma entrada de R$ 0 a R$ 5.000.000.', over: 'A entrada não pode passar do preço.' },
      n: { label: 'Prazo', suffix: 'meses', error: 'Digite um prazo de 1 a 96 meses.' },
      r: { label: 'Juros a.m.', suffix: '%', error: 'Digite juros de 0 a 15% ao mês.' },
      ...creditPanel.fields,
    },
    options: creditPanel.options,
    moreHeading: creditPanel.moreHeading,
    view: {
      ...creditPanel.view,
      label: 'Parcela do financiamento',
      caption: 'Cronograma do financiamento do veículo, por ano do contrato',
    },
    premises: creditPremises,
  },
  howHeading: 'Como usar o simulador de financiamento de veículo',
  howSteps: [
    'Digite o preço do veículo e quanto você vai dar de entrada.',
    'Digite o prazo em meses e os juros ao mês da proposta.',
    'Depois do resultado, copie o IOF e as tarifas da proposta e diga se vai financiar junto ou pagar à vista.',
    'Veja o CET, abra o cronograma ou baixe em PDF e CSV.',
  ],
  worksHeading: 'Como a parcela e o CET são calculados',
  formulaHeading: 'As fórmulas',
  formula: [
    'A parcela é P = V × i × (1 + i)^n ÷ ((1 + i)^n − 1), em que V é o valor financiado (o preço menos a entrada, mais o IOF e as tarifas quando financiados), i os juros ao mês e n o número de meses.',
    'O CET é a taxa mensal c que resolve C = P1 ÷ (1 + c) + P2 ÷ (1 + c)^2 + … + Pn ÷ (1 + c)^n, em que C é o crédito liberado menos o que você paga na contratação. O CET ao ano é (1 + c)^12 − 1.',
  ],
  premisesHeading: 'Premissas',
  exampleHeading: 'Exemplo resolvido',
  exampleIntro: 'Este é o exemplo com que o simulador abre, calculado pelo mesmo motor que você usa acima.',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Conselho Monetário Nacional, Resolução nº 4.881/2020, o Custo Efetivo Total (CET)', href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/especialnor/Resolu%C3%A7%C3%A3o4881.pdf' },
    { label: 'Banco Central do Brasil, Instrução Normativa BCB nº 83/2021, o demonstrativo do CET', href: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Instru%C3%A7%C3%A3o%20Normativa%20BCB&numero=83' },
    { label: 'Presidência da República, Decreto nº 6.306/2007, o regulamento do IOF', href: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm' },
  ],
  disclaimer: 'Este simulador é uma ferramenta educativa, não é recomendação financeira nem proposta de crédito. A financeira define a taxa, o IOF, as tarifas e o CET do seu contrato.',
  faqHeading: 'Perguntas sobre financiamento de veículo',
  faq: [
    {
      q: 'O que é o CET?',
      a: 'O Custo Efetivo Total junta os juros, o IOF, as tarifas e os seguros numa taxa só. A financeira tem de informar o CET antes de você assinar, e é o número certo para comparar propostas, porque os juros sozinhos escondem os custos.',
    },
    {
      q: 'Como eu sei o valor do IOF?',
      a: 'Ele está na proposta e no demonstrativo do CET. O IOF do crédito tem uma parte diária, limitada a 365 dias, e uma parte fixa, e as alíquotas são definidas pelo governo.',
    },
    {
      q: 'É melhor financiar o IOF ou pagar à vista?',
      a: 'À vista, você precisa do dinheiro na hora, mas o total pago fica menor. Troque a opção depois do resultado e compare os dois totais.',
    },
    {
      q: 'Por que o CET é maior que os juros ao mês?',
      a: 'Porque os juros correm sobre um valor maior do que o dinheiro que você realmente recebe: a diferença são o IOF e as tarifas.',
    },
    {
      q: 'Posso quitar o financiamento antes?',
      a: 'Pode, sem tarifa de liquidação antecipada, e os juros do período que você antecipa saem da conta. A calculadora de amortização antecipada mostra quanto você economiza.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. O simulador roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
