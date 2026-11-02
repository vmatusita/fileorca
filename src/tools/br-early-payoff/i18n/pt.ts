import type { CalcPageTexts } from '../../calc/types.ts';

// Amortização antecipada (F6, decisão 5.4): adaptada do Loan amortization, com a regra da Resolução CMN nº 5.004/2022.
export default {
  title: 'Amortização antecipada: reduzir o prazo ou reduzir a parcela',
  description: 'Veja quanto de juros você deixa de pagar adiantando parte do saldo devedor, reduzindo o prazo ou a parcela, no SAC ou na PRICE. Grátis.',
  h1: 'Amortização antecipada',
  lead: 'Quanto você economiza adiantando parte do saldo, e se vale mais reduzir o prazo ou a parcela.',
  panel: {
    fields: {
      b: { label: 'Saldo devedor', prefix: 'R$', error: 'Digite um saldo de R$ 1.000 a R$ 20.000.000.' },
      x: { label: 'Valor a antecipar', prefix: 'R$', error: 'Digite um valor de R$ 0 a R$ 20.000.000.', over: 'Não pode passar do saldo devedor.' },
      r: { label: 'Juros a.m.', suffix: '%', error: 'Digite juros de 0 a 15% ao mês.' },
      n: { label: 'Meses que faltam', suffix: 'meses', error: 'Digite de 1 a 420 meses.' },
      sys: { label: 'Sistema de amortização', error: '' },
    },
    options: { sys: { price: 'PRICE (parcela fixa)', sac: 'SAC (parcela decrescente)' } },
    moreHeading: 'Sistema do contrato',
    view: {
      label: 'Juros que você deixa de pagar',
      placard: 'a menos de juros',
      sentence: 'Reduzindo o prazo, você termina {sooner} antes e deixa de pagar {savedShorter} de juros. Reduzindo a parcela, ela cai de {before} para {after}, e você deixa de pagar {savedLower}.',
      sentenceSac: 'Reduzindo o prazo, você termina {sooner} antes e deixa de pagar {savedShorter} de juros. Reduzindo a parcela, a próxima cai de {before} para {after}, e você deixa de pagar {savedLower}.',
      sentenceSameTerm: 'Esse valor não chega a encurtar o prazo, mas você deixa de pagar {savedShorter} de juros. Reduzindo a parcela, ela cai de {before} para {after}, e você deixa de pagar {savedLower}.',
      sentenceSacSameTerm: 'Esse valor não chega a encurtar o prazo, mas você deixa de pagar {savedShorter} de juros. Reduzindo a parcela, a próxima cai de {before} para {after}, e você deixa de pagar {savedLower}.',
      payoff: 'Com esse valor você quita o saldo inteiro e deixa de pagar {saved} de juros.',
      shorter: 'Reduzir o prazo',
      lower: 'Reduzir a parcela',
      term: 'Prazo que falta',
      payment: 'Parcela',
      firstPayment: 'Próxima parcela',
      saved: 'Juros a menos',
      diffShorter: 'Reduzir o prazo economiza {x} a mais de juros que reduzir a parcela.',
      diffLower: 'Reduzir a parcela economiza {x} a mais de juros que reduzir o prazo.',
      diffSame: 'Os dois caminhos economizam os mesmos juros.',
      left: 'Saldo depois da antecipação',
      baseInterest: 'Juros sem antecipar',
      caption: 'Cronograma depois da antecipação, reduzindo o prazo e reduzindo a parcela, por ano',
      compareLabel: 'Reduzir o prazo e reduzir a parcela lado a lado',
    },
    premises: [
      'Os juros são a taxa efetiva ao mês do contrato, sobre o saldo de cada mês, arredondados ao centavo.',
      'O valor antecipado abate o saldo hoje, antes da próxima parcela, e os juros futuros incidem só sobre o que resta: é o desconto a valor presente pela taxa do contrato que a Resolução CMN nº 5.004/2022 manda usar, sem tarifa de liquidação.',
      'Reduzir o prazo mantém a parcela de hoje (PRICE) ou tira do prazo um mês para cada amortização de hoje que o valor antecipado cobre (SAC), e termina antes. Reduzir a parcela mantém os meses que faltam e recalcula a parcela.',
      'A parcela de hoje é a que o saldo, os juros e os meses que faltam dão. O contrato real pode ter seguros e taxas somados a ela, que não entram aqui.',
      'Vale para contratos com taxa prefixada. Financiamentos corrigidos pela TR ou por um índice seguem as regras do próprio contrato.',
    ],
  },
  howHeading: 'Como usar a calculadora de amortização antecipada',
  howSteps: [
    'Digite o saldo devedor de hoje e quanto você quer antecipar.',
    'Digite os juros ao mês do contrato e quantos meses faltam.',
    'Depois do resultado, escolha se o contrato é PRICE ou SAC.',
    'Compare reduzir o prazo e reduzir a parcela, e baixe o cronograma em PDF ou CSV.',
  ],
  worksHeading: 'Como a economia é calculada',
  formulaHeading: 'A conta',
  formula: [
    'A calculadora monta três cronogramas: o contrato sem antecipar, o saldo menor com a mesma parcela (reduzir o prazo) e o saldo menor com os mesmos meses (reduzir a parcela). Na PRICE a parcela é P = S × i × (1 + i)^n ÷ ((1 + i)^n − 1); no SAC a amortização é o saldo dividido pelos meses que faltam.',
    'Os juros que você deixa de pagar são os juros do contrato sem antecipar menos os juros de cada cronograma novo.',
  ],
  premisesHeading: 'Premissas',
  exampleHeading: 'Exemplo resolvido',
  exampleIntro: 'Este é o exemplo com que a calculadora abre, calculado pelo mesmo motor que você usa acima.',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Conselho Monetário Nacional, Resolução nº 5.004/2022, arts. 6 e 7: a liquidação antecipada, total ou parcial, pela taxa do contrato', href: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5004' },
    { label: 'Conselho Monetário Nacional, Resolução nº 3.516/2007, art. 1: sem tarifa de liquidação antecipada', href: 'https://www.bcb.gov.br/pre/normativos/res/2007/pdf/res_3516_v2_l.pdf' },
    { label: 'Presidência da República, Código de Defesa do Consumidor (Lei nº 8.078/1990), art. 52, § 2º', href: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm' },
  ],
  disclaimer: 'Esta calculadora é uma ferramenta educativa, não é recomendação financeira. O banco calcula o saldo e o desconto do seu contrato; confira o valor exato antes de pagar.',
  faqHeading: 'Perguntas sobre amortização antecipada',
  faq: [
    {
      q: 'É melhor reduzir o prazo ou a parcela?',
      a: 'Reduzir o prazo costuma economizar mais juros, porque o saldo some mais cedo. Reduzir a parcela deixa o orçamento do mês mais folgado. A calculadora mostra os dois lado a lado para você decidir.',
    },
    {
      q: 'O banco pode cobrar para eu antecipar?',
      a: 'Não. Desde 2007 é proibido cobrar tarifa pela liquidação antecipada de contratos com pessoas físicas, e o Código de Defesa do Consumidor garante a redução proporcional dos juros quando você paga antes.',
    },
    {
      q: 'Onde eu vejo o saldo devedor e os meses que faltam?',
      a: 'No aplicativo ou no extrato do financiamento, ou pedindo ao banco o valor para amortização. Use o saldo de hoje, sem as parcelas atrasadas.',
    },
    {
      q: 'Vale a pena antecipar ou investir o dinheiro?',
      a: 'Antecipar rende, na prática, a taxa do contrato, sem risco. Se o investimento que você tem em mente rende menos que os juros da dívida depois do imposto, antecipar tende a valer mais. A decisão é sua.',
    },
    {
      q: 'E se o contrato tem TR?',
      a: 'A conta aqui é para taxa prefixada. Num financiamento com TR, o saldo também é corrigido todo mês, e o banco faz a conta com a TR do contrato. O simulador SAC × PRICE mostra o efeito da TR.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. A calculadora roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
