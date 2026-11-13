import type { CalcPageTexts } from '../../calc/types.ts';
import { creditPanel, creditPremises } from '../../br-vehicle-loan/i18n/pt.ts';

// Simulador de empréstimo (F6, decisão 5.3): adaptado do Personal loan, com o IOF, as tarifas e o CET.
export default {
  title: 'Simulador de empréstimo: parcela, juros e CET do crédito pessoal',
  description: 'Simule um empréstimo pessoal: parcela, total pago e o CET ao mês e ao ano, com o IOF e as tarifas da proposta. Grátis, sem cadastro.',
  h1: 'Simulador de empréstimo',
  lead: 'Quanto fica a parcela e quanto o empréstimo custa com o IOF e as tarifas.',
  panel: {
    fields: {
      a: { label: 'Valor do empréstimo', prefix: 'R$', error: 'Digite um valor de R$ 100 a R$ 1.000.000.' },
      n: { label: 'Prazo', suffix: 'meses', error: 'Digite um prazo de 1 a 120 meses.' },
      r: { label: 'Juros a.m.', suffix: '%', error: 'Digite juros de 0 a 20% ao mês.' },
      ...creditPanel.fields,
    },
    options: creditPanel.options,
    moreHeading: creditPanel.moreHeading,
    view: {
      ...creditPanel.view,
      label: 'Parcela do empréstimo',
      noLoan: 'Digite o valor do empréstimo para ver a parcela.',
      caption: 'Cronograma do empréstimo, por ano do contrato',
    },
    premises: creditPremises,
  },
  howHeading: 'Como usar o simulador de empréstimo',
  howSteps: [
    'Digite o valor que você quer pegar emprestado.',
    'Digite o prazo em meses e os juros ao mês da proposta.',
    'Depois do resultado, copie o IOF e as tarifas da proposta e diga se eles entram no empréstimo ou são pagos à vista.',
    'Veja o CET e baixe o cronograma em PDF ou CSV.',
  ],
  worksHeading: 'Como a parcela e o CET são calculados',
  formulaHeading: 'As fórmulas',
  formula: [
    'A parcela é P = V × i × (1 + i)^n ÷ ((1 + i)^n − 1), em que V é o valor financiado (o empréstimo, mais o IOF e as tarifas quando financiados), i os juros ao mês e n o número de meses.',
    'O CET é a taxa mensal c que resolve C = P1 ÷ (1 + c) + … + Pn ÷ (1 + c)^n, em que C é o dinheiro que você recebe menos o que paga na contratação. O CET ao ano é (1 + c)^12 − 1.',
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
  disclaimer: 'Este simulador é uma ferramenta educativa, não é recomendação financeira nem proposta de crédito. Quem empresta define a taxa, o IOF, as tarifas e o CET do seu contrato.',
  faqHeading: 'Perguntas sobre empréstimo pessoal',
  faq: [
    {
      q: 'Qual número eu uso para comparar empréstimos?',
      a: 'O CET. Duas propostas com os mesmos juros podem ter IOF e tarifas diferentes, e o CET junta tudo numa taxa só. Quem empresta tem de informar o CET antes da contratação.',
    },
    {
      q: 'O que acontece se o IOF for descontado do valor?',
      a: 'Escolha "Pagar à vista": o simulador entende que você recebe o valor menos o IOF e as tarifas, e calcula o CET sobre o que chega na sua conta. É a mesma conta de quando você paga esses custos do próprio bolso.',
    },
    {
      q: 'Prazo maior sai mais barato?',
      a: 'A parcela fica menor, mas os juros totais sobem, porque o saldo demora mais para cair. Compare o mesmo valor em 12 e em 36 meses e olhe o total de juros na frase do resultado.',
    },
    {
      q: 'Quais valores e prazos o simulador aceita?',
      a: 'Empréstimos de R$ 100 a R$ 1.000.000, prazos de 1 a 120 meses e juros de 0 a 20% ao mês.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus números ficam no seu aparelho. O simulador roda no navegador, então nada do que você digita é enviado, e o link que você copia guarda os números depois do #, uma parte do endereço que o navegador nunca envia.',
  relatedHeading: 'Outras calculadoras',
} satisfies CalcPageTexts;
