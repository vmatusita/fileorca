import type { MoneyHubTexts } from '../types.ts';

// O hub das calculadoras financeiras adaptadas ao Brasil, /pt/calculadoras-financeiras/ (F6, decisão 5): uma página
// própria, sem par em inglês, que lista só as calculadoras brasileiras.
export default {
  title: 'Calculadoras financeiras: financiamento, empréstimo, cartão e dívidas',
  description: 'Calculadoras grátis para o Brasil: SAC × PRICE, financiamento de veículo, empréstimo com CET, cartão, dívidas e juros compostos. Sem cadastro.',
  eyebrow: 'Dinheiro',
  h1: 'Calculadoras financeiras',
  intro: 'Simule financiamentos, empréstimos e dívidas com as regras do Brasil: taxa efetiva, CET, IOF e TR como campos, e o cronograma completo.',
  creditHeading: 'Crédito e dívidas',
  educationalHeading: 'Para planejar',
  worksHeading: 'Como estas calculadoras funcionam',
  worksIntro: [
    'Todas as contas rodam no seu navegador, com centavos inteiros: os juros de cada mês são arredondados ao centavo e a última parcela zera o saldo.',
    'Toda taxa é um campo que você preenche com a da sua proposta. O valor que aparece no começo é só um exemplo, rotulado como exemplo.',
  ],
  formulaHeading: 'A base das contas',
  formula: [
    'As taxas são efetivas, como os contratos informam. Uma taxa ao ano vira mensal por capitalização, (1 + taxa ao ano)^(1/12) − 1, e não dividida por 12.',
    'Na PRICE a parcela é P = S × i × (1 + i)^n ÷ ((1 + i)^n − 1); no SAC a amortização é o saldo dividido pelos meses que faltam. O CET segue a Resolução CMN nº 4.881/2020.',
  ],
  premisesHeading: 'Premissas',
  premises: [
    'Nenhuma calculadora usa tabela oficial: IOF, TR, CET e as taxas de juros são campos.',
    'Não entram imposto de renda, seguros que mudam com o saldo nem custos que você não digita.',
    'O resultado serve para comparar caminhos; o contrato e a proposta trazem os números exatos.',
  ],
  exampleHeading: 'Exemplo',
  exampleIntro: 'O exemplo do simulador SAC × PRICE, calculado pelo mesmo motor da página dele:',
  sourcesHeading: 'Fontes',
  sources: [
    { label: 'Banco Central do Brasil, Nota Técnica nº 56 (out/2025): o SAC e a PRICE', href: 'https://www.bcb.gov.br/content/publicacoes/notastecnicas/NT_56_202510.pdf' },
    { label: 'Conselho Monetário Nacional, Resolução nº 4.881/2020: o Custo Efetivo Total (CET)', href: 'https://www.bcb.gov.br/content/estabilidadefinanceira/especialnor/Resolu%C3%A7%C3%A3o4881.pdf' },
    { label: 'Conselho Monetário Nacional, Resolução nº 5.004/2022: taxas efetivas e liquidação antecipada', href: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5004' },
  ],
  disclaimerHeading: 'Ferramenta educativa',
  disclaimer: 'Estas calculadoras são ferramentas educativas, não são recomendação financeira nem proposta de crédito. Não indicamos bancos, produtos nem taxas.',
} satisfies MoneyHubTexts;
