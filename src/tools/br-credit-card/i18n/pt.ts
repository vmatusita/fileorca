import type { CalcPageTexts } from '../../calc/types.ts';

// Calculadora do cartão de crédito (F6, decisão 5.5): pagar o mínimo e cair no rotativo × parcelar a fatura já, com as
// regras da Resolução CMN nº 4.549/2017 e o teto da Lei nº 14.690/2023, art. 28.
export default {
  title: 'Calculadora do cartão de crédito: rotativo ou parcelar a fatura',
  description: 'Compare pagar o mínimo e cair no rotativo com parcelar a fatura já: parcela, juros e total pago, com o teto de juros da lei. Grátis, sem cadastro.',
  h1: 'Calculadora do cartão de crédito',
  lead: 'Quanto custa pagar só o mínimo da fatura, comparado a parcelar tudo agora.',
  panel: {
    fields: {
      f: { label: 'Valor da fatura', prefix: 'R$', error: 'Digite uma fatura de R$ 10 a R$ 100.000.' },
      m: { label: 'Pagamento mínimo', prefix: 'R$', error: 'Digite um mínimo de R$ 0 a R$ 100.000.', over: 'O mínimo não pode passar da fatura.' },
      rr: { label: 'Rotativo', suffix: '% a.m.', error: 'Digite juros de 0 a 30% ao mês.' },
      rp: { label: 'Parcelado', suffix: '% a.m.', error: 'Digite juros de 0 a 20% ao mês.' },
      n: { label: 'Número de parcelas', suffix: 'parcelas', error: 'Digite de 1 a 48 parcelas.' },
      iof: { label: 'IOF do parcelamento', prefix: 'R$', error: 'Digite um IOF de R$ 0 a R$ 10.000.', help: 'O valor em reais que o cartão mostra na simulação do parcelamento.' },
    },
    moreHeading: 'Parcelas e IOF',
    view: {
      label: 'A mais pagando o mínimo',
      labelLess: 'A menos pagando o mínimo',
      placard: 'de diferença no total',
      sentenceMore: 'Pagando o mínimo e caindo no rotativo, você paga {totalA} no total, {x} a mais do que parcelando a fatura já ({totalB}).',
      sentenceLess: 'Pagando o mínimo e caindo no rotativo, você paga {totalA} no total, {x} a menos do que parcelando a fatura já ({totalB}).',
      sentenceSame: 'Os dois caminhos somam {totalA} no total.',
      capped: 'Os juros bateram no teto da lei: no máximo o valor original da dívida.',
      minimum: 'Pagar o mínimo',
      now: 'Parcelar já',
      today: 'Pago hoje',
      revolvingInterest: 'Juros do rotativo',
      installment: 'Parcelamento',
      times: '{n} × {x}',
      interest: 'Total de juros',
      paid: 'Total pago',
      diff: 'A diferença entre os dois caminhos é de {x}.',
      principal: 'Saldo que fica no rotativo',
      interestA: 'Juros pagando o mínimo',
      caption: 'Parcelas pagando o mínimo e parcelando a fatura já, por ano',
      compareLabel: 'Pagar o mínimo e parcelar já, lado a lado',
    },
    premises: [
      'Pagar o mínimo: você paga o mínimo no vencimento, o resto fica um mês no rotativo e, na fatura seguinte, vai para o parcelamento. A Resolução CMN nº 4.549/2017 só deixa o saldo no rotativo até o vencimento da fatura seguinte.',
      'Parcelar já: a fatura inteira vai para o parcelamento hoje, com a primeira parcela no mês seguinte.',
      'Os juros de cada caminho, somados, não passam do valor original da dívida: o saldo que entrou no rotativo, ou a fatura parcelada (Lei nº 14.690/2023, art. 28). Quando o teto é atingido, os juros param e as parcelas só abatem o saldo.',
      'Os juros são as taxas efetivas ao mês que você digita, arredondados ao centavo. O IOF entra no valor parcelado e fica fora do teto, que conta só os juros e os encargos.',
      'Não entram multa, juros de mora, anuidade nem compras novas. O mínimo e as taxas são os do seu cartão.',
    ],
  },
  howHeading: 'Como usar a calculadora do cartão',
  howSteps: [
    'Digite o valor da fatura e o pagamento mínimo, como aparecem na fatura.',
    'Digite os juros do rotativo e do parcelamento ao mês, que também estão na fatura.',
    'Depois do resultado, ajuste o número de parcelas e o IOF do parcelamento.',
    'Compare os dois caminhos e baixe as parcelas em PDF ou CSV.',
  ],
  worksHeading: 'Como os dois caminhos são calculados',
  formulaHeading: 'A conta',
  formula: [
    'Pagando o mínimo, o resto da fatura (R) fica um mês no rotativo e rende R × juros do rotativo. Esse saldo, mais o IOF, vira um parcelamento de n parcelas iguais: P = S × i × (1 + i)^n ÷ ((1 + i)^n − 1), com i os juros do parcelamento.',
    'Parcelando já, a fatura inteira, mais o IOF, vira o parcelamento. Em cada caminho, os juros de cada mês param quando a soma deles chega ao valor original da dívida.',
  ],
  premisesHeading: 'Premissas',
  exampleHeading: 'Exemplo resolvido',
  exampleIntro: 'Este é o exemplo com que a calculadora abre, calculado pelo mesmo motor que você usa acima.',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Conselho Monetário Nacional, Resolução nº 4.549/2017 (consolidada, com a Resolução CMN nº 5.112/2023): o rotativo e o parcelamento da fatura', href: 'https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50330/Res_4549_v2_L.pdf' },
    { label: 'Presidência da República, Lei nº 14.690/2023, art. 28: o teto dos juros e encargos do rotativo e do parcelamento', href: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14690.htm' },
  ],
  disclaimer: 'Esta calculadora é uma ferramenta educativa, não é recomendação financeira. O emissor do cartão define o mínimo, as taxas e o parcelamento oferecido.',
  faqHeading: 'Perguntas sobre rotativo e parcelamento',
  faq: [
    {
      q: 'Quanto tempo a dívida pode ficar no rotativo?',
      a: 'Só até o vencimento da fatura seguinte. Depois disso o banco tem de oferecer um parcelamento com condições melhores que as do rotativo, e o que foi parcelado não volta para o rotativo.',
    },
    {
      q: 'O que é o teto de juros do cartão?',
      a: 'Desde janeiro de 2024, os juros e encargos do rotativo e do parcelamento da fatura, somados, não podem passar do valor original da dívida. Uma dívida de R$ 1.000 paga no máximo R$ 1.000 de juros e encargos.',
    },
    {
      q: 'O IOF conta no teto?',
      a: 'A regra fala em juros remuneratórios e encargos, como multa e juros de mora. O IOF é um imposto, então a calculadora deixa o IOF fora do teto e mostra o valor dele junto do parcelamento.',
    },
    {
      q: 'Onde eu acho as taxas do rotativo e do parcelamento?',
      a: 'Na própria fatura, que traz as taxas efetivas ao mês e ao ano e o CET de cada opção. Use as taxas ao mês nos campos.',
    },
    {
      q: 'Pagar o mínimo é sempre pior?',
      a: 'Quase sempre custa mais, porque o rotativo cobra juros altos no primeiro mês e o saldo ainda vai para o parcelamento. A calculadora mostra a diferença em reais com as taxas do seu cartão.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. A calculadora roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
