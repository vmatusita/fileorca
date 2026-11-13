import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de interés compuesto con depósitos mensuales',
  description: 'Mira cómo crece un saldo con depósitos mensuales y capitalización anual, trimestral, mensual o diaria: el saldo final, los intereses y una tabla por año.',
  h1: 'Calculadora de interés compuesto',
  lead: 'Cómo crece un saldo con depósitos mensuales y capitalización.',
  panel: {
    fields: {
      i: { label: 'Monto inicial', prefix: '$', error: 'Escribe un monto inicial de $0 a $10,000,000.' },
      m: { label: 'Depósito mensual', prefix: '$', error: 'Escribe un depósito de $0 a $1,000,000.' },
      r: { label: 'Tasa anual', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      y: { label: 'Años', suffix: 'años', error: 'Escribe de 1 a 80 años.' },
      c: { label: 'Capitalización', error: '' },
      tm: { label: 'Depósitos al', error: '' },
    },
    options: {
      c: { '1': 'anual', '2': 'semestral', '4': 'trimestral', '12': 'mensual', '365': 'diaria' },
      tm: { end: 'Final del mes', begin: 'Inicio del mes' },
    },
    moreHeading: 'Capitalización y depósitos',
    view: {
      label: 'Saldo final',
      placard: 'saldo final',
      sentence: 'Depositas {contributed} y ganas {interest} de intereses en {time} al {rate}, con capitalización {how}.',
      tooLarge: 'Ese saldo es demasiado grande para mostrarlo. Prueba con un monto, una tasa o un número de años menor.',
      deposits: 'Tus depósitos',
      interest: 'Intereses',
      balance: 'Saldo',
      year: 'Año',
      caption: 'Depósitos, intereses y saldo por año',
      scheduleHeading: 'Crecimiento por año',
    },
    premises: [
      'La tasa anual es una tasa nominal, que se capitaliza las veces al año que elijas.',
      'Los intereses se suman una vez al mes a la tasa mensual que da la capitalización, (1 + tasa ÷ n)^(n ÷ 12) − 1, redondeados al centavo. Con capitalización mensual, eso es exactamente la tasa dividida entre 12.',
      'Los depósitos son iguales todos los meses, al inicio o al final del mes.',
      'No se incluyen impuestos, cargos ni retiros.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de interés compuesto',
  howSteps: [
    'Escribe el monto con el que empiezas y lo que agregas cada mes.',
    'Escribe una tasa anual y el número de años.',
    'Elige la capitalización y si depositas al inicio o al final de cada mes.',
    'Abre la tabla por año, o guárdala en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calcula el interés compuesto',
  formulaHeading: 'La fórmula',
  formula: [
    'La tasa mensual es j = (1 + r ÷ n)^(n ÷ 12) − 1, donde r es la tasa anual y n las veces que se capitaliza al año. Cada mes: saldo = saldo + saldo × j + depósito, con los intereses redondeados al centavo.',
    'Sin depósitos, esto es la conocida A = P × (1 + r ÷ n)^(n × t). La tabla suma los depósitos y los intereses de cada año.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), cómo funciona el interés compuesto (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-compound-interest-work-en-1683/',
    },
    {
      label: 'CFPB, Regulation DD, Apéndice A, cómo se calcula el rendimiento porcentual anual (APY) (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/',
    },
    {
      label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Capítulo 5: Interés compuesto" (en español)',
      href: 'https://www.fdic.gov/consumer-resource-center/capitulo-5-interes-compuesto',
    },
    {
      label: 'Comisión de Bolsa y Valores (SEC), Investor.gov, "Calculadora de interés compuesto" (en español)',
      href: 'https://www.investor.gov/financial-tools-calculators/calculators/calculadora-de-interes-compuesto',
    },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. Los rendimientos reales cambian, y ninguna tasa de aquí es una promesa.',
  faqHeading: 'Preguntas sobre el interés compuesto',
  faq: [
    {
      q: '¿Qué cambia si se capitaliza más seguido?',
      a: 'Los intereses empiezan a ganar intereses antes. Con la misma tasa anual, la capitalización diaria crece un poco más rápido que la anual; la diferencia se ve en el rendimiento porcentual anual (APY), la tasa después de la capitalización.',
    },
    {
      q: '¿Debo depositar al inicio o al final del mes?',
      a: 'Un depósito al inicio gana un mes más de intereses. Cambia la opción para ver cuánto suma eso con los años.',
    },
    {
      q: '¿Por qué la calculadora suma intereses cada mes aunque la capitalización sea anual?',
      a: 'Porque los depósitos son mensuales, el saldo tiene que actualizarse cada mes. Es una convención declarada, así que un estado de cuenta del banco puede variar por unos centavos.',
    },
    {
      q: '¿La tasa es un rendimiento que puedo esperar?',
      a: 'No. Una cuenta de ahorros paga una tasa declarada; una inversión puede ganar más, menos o perder dinero.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
