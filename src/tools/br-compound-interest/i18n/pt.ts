import type { CalcPageTexts } from '../../calc/types.ts';

// Calculadora de juros compostos (F6, decisão 5.7): adaptada do Compound interest, com a taxa efetiva ao mês ou ao ano,
// o prazo em meses e o resultado bruto (sem imposto de renda, que é tabela oficial).
export default {
  title: 'Calculadora de juros compostos com aporte mensal',
  description: 'Veja quanto o dinheiro rende com juros compostos e aportes mensais, com a taxa ao mês ou ao ano e o prazo em meses. Grátis, sem cadastro.',
  h1: 'Calculadora de juros compostos',
  lead: 'Quanto o seu dinheiro vira com juros sobre juros e um aporte todo mês.',
  panel: {
    fields: {
      i: { label: 'Valor inicial', prefix: 'R$', error: 'Digite um valor de R$ 0 a R$ 10.000.000.' },
      a: { label: 'Aporte mensal', prefix: 'R$', error: 'Digite um aporte de R$ 0 a R$ 1.000.000.' },
      ry: { label: 'Juros a.a.', suffix: '%', error: 'Digite juros de 0 a 60% ao ano.' },
      rm: { label: 'Juros a.m.', suffix: '%', error: 'Digite juros de 0 a 5% ao mês.' },
      n: { label: 'Prazo', suffix: 'meses', error: 'Digite um prazo de 1 a 600 meses.' },
      u: { label: 'A taxa de juros é', error: '' },
    },
    options: { u: { year: 'Ao ano', month: 'Ao mês' } },
    moreHeading: 'Taxa ao mês ou ao ano',
    view: {
      label: 'Saldo no fim',
      placard: 'no fim do prazo',
      sentence: 'Em {months}, os aportes somam {deposits} e os juros rendem {interest}, antes de qualquer imposto.',
      tooLarge: 'Com esses números o saldo passa de R$ 10 trilhões, mais do que a calculadora consegue mostrar ao centavo. Diminua os juros ou o prazo.',
      deposits: 'Total aportado',
      interest: 'Juros ganhos',
      balance: 'Saldo',
      year: 'Ano',
      caption: 'Aportes, juros e saldo em cada ano do prazo',
      scheduleHeading: 'Saldo por ano',
    },
    premises: [
      'A taxa é efetiva. Ao mês, ela vale como está; ao ano, vira mensal por capitalização: (1 + taxa ao ano) elevado a 1/12, menos 1, e não a taxa dividida por 12.',
      'Os juros de cada mês incidem sobre o saldo e são arredondados ao centavo; o aporte entra no fim do mês.',
      'A taxa fica igual no prazo inteiro. Na vida real ela pode mudar.',
      'O resultado é bruto: não desconta imposto de renda, taxa de administração nem custódia.',
    ],
  },
  howHeading: 'Como usar a calculadora de juros compostos',
  howSteps: [
    'Digite o valor inicial e quanto você vai aportar por mês.',
    'Digite a taxa de juros e o prazo em meses.',
    'Depois do resultado, diga se a taxa é ao mês ou ao ano.',
    'Veja o saldo ano a ano no cronograma ou baixe em PDF e CSV.',
  ],
  worksHeading: 'Como os juros compostos são calculados',
  formulaHeading: 'A conta',
  formula: [
    'Todo mês o saldo rende os juros do mês, saldo × i, e recebe o aporte. No mês seguinte, os juros incidem também sobre os juros que já entraram: são os juros sobre juros.',
    'Com a taxa ao ano a, a taxa do mês é i = (1 + a)^(1/12) − 1: em 12 meses, essa taxa mensal rende exatamente a taxa anual. Sem arredondar, o saldo final seria V × (1 + i)^n + A × ((1 + i)^n − 1) ÷ i.',
  ],
  premisesHeading: 'Premissas',
  exampleHeading: 'Exemplo resolvido',
  exampleIntro: 'Este é o exemplo com que a calculadora abre, calculado pelo mesmo motor que você usa acima.',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Banco Central do Brasil, Calculadora do Cidadão, metodologia do cálculo com juros compostos e capitalização mensal', href: 'https://www3.bcb.gov.br/CALCIDADAO/publico/exibirMetodologiaFinanciamentoPrestacoesFixas.do?method=exibirMetodologiaFinanciamentoPrestacoesFixas' },
    { label: 'Conselho Monetário Nacional, Resolução nº 5.004/2022, art. 3: as taxas efetivas ao mês e ao ano', href: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5004' },
  ],
  disclaimer: 'Esta calculadora é uma ferramenta educativa, não é recomendação de investimento. O rendimento real depende da aplicação, dos impostos e das taxas.',
  faqHeading: 'Perguntas sobre juros compostos',
  faq: [
    {
      q: 'Qual é a diferença entre juros simples e compostos?',
      a: 'Nos juros simples a taxa incide só sobre o valor inicial. Nos compostos ela incide sobre o saldo, que já inclui os juros dos meses anteriores, então o dinheiro cresce cada vez mais rápido.',
    },
    {
      q: 'Por que 12% ao ano não é 1% ao mês?',
      a: 'Porque 1% ao mês capitalizado por 12 meses dá 12,68% ao ano. A taxa mensal equivalente a 12% ao ano é cerca de 0,95%. A calculadora faz essa conversão sozinha quando você escolhe "Ao ano".',
    },
    {
      q: 'O resultado já desconta o imposto de renda?',
      a: 'Não. O imposto e as taxas dependem da aplicação e do prazo, e mudam com as regras do governo. O resultado é bruto; confira o líquido no simulador da sua corretora ou do seu banco.',
    },
    {
      q: 'O aporte entra no começo ou no fim do mês?',
      a: 'No fim. Assim o aporte do mês só começa a render no mês seguinte, que é o jeito mais comum de quem investe depois de receber o salário.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. A calculadora roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
