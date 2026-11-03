import type { CalcPageTexts } from '../../../../calc/types.ts';

export default {
  title: 'Calculadora de préstamo con pago global: el pago mensual y lo que vence al final',
  description: 'Calcula el pago mensual de un préstamo con pago global y el monto que aún vence en la fecha del pago global, con los intereses hasta entonces y la tabla.',
  h1: 'Calculadora de préstamo con pago global',
  lead: 'El pago al mes y lo que vence al final.',
  panel: {
    fields: {
      a: { label: 'Monto del préstamo', prefix: '$', error: 'Escribe un monto de $100 a $100,000,000.' },
      r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      t: { label: 'Amortización', suffix: 'años', error: 'Escribe un plazo de amortización de 1 a 40 años.' },
      bm: { label: 'Vence con el pago', error: 'Escribe un número de pago de 1 a 479.', over: 'Tiene que ser antes del último pago del plazo de amortización.' },
    },
    view: {
      label: 'Pago global',
      placard: 'pago global',
      sentence: 'Después de {count} pagos de {payment}, el pago global vence con el pago {month}, además del pago regular de ese mes. Hasta entonces pagas {interest} de intereses.',
      principal: 'Préstamo',
      interest: 'Intereses',
      caption: 'Tabla de pagos hasta el pago global, por año del préstamo',
      payment: 'Pago mensual',
      due: 'Vence con el pago',
      dueValue: 'Pago {n}',
      lastTotal: 'Último pago, con el pago global',
      paid: 'Total pagado',
      scheduleHeading: 'Tabla hasta el pago global',
    },
    premises: [
      'El pago mensual se calcula como si el préstamo durara todo el plazo de amortización, a tasa fija.',
      'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo.',
      'El pago global es el saldo que queda después del pago regular del mes en que vence; ese último pago es el pago regular más el pago global.',
      'No se incluyen el refinanciamiento del pago global, los cargos ni los cambios de tasa.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de préstamo con pago global',
  howSteps: [
    'Escribe el monto del préstamo, la tasa y el plazo de amortización con el que se calcula el pago.',
    'Escribe el número del pago con el que vence el pago global, por ejemplo 84 para siete años.',
    'Lee el pago mensual y el pago global, y abre la tabla hasta el pago global.',
  ],
  own: [
    {
      heading: 'Qué es un préstamo con pago global',
      paragraphs: [
        'Los pagos se calculan como si el préstamo durara mucho, así que son bajos, pero el préstamo termina antes: lo que aún se debe en ese momento vence de una sola vez. El CFPB describe el pago global como un pago grande que, por lo general, se hace al final del período de amortización y que puede ser tan grande como todo el saldo.',
      ],
    },
    {
      heading: 'El riesgo al final',
      paragraphs: [
        'Muchos prestatarios piensan vender o refinanciar antes del pago global. Si para entonces las tasas son más altas, o la propiedad vale menos, puede ser difícil. Compara el pago global con lo que podrías pagar o pedir prestado, y guarda la tabla.',
      ],
    },
  ],
  worksHeading: 'Cómo se calcula el pago global',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde n son los meses del plazo de amortización y r es la tasa anual ÷ 12.',
    'La tabla avanza mes a mes hasta el mes del pago global; el pago global es el saldo que queda después de ese pago regular, lo mismo que el valor futuro del préstamo menos los pagos hechos.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con qué es un pago global (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(D), muestra de la Estimación de Préstamo de un préstamo a siete años con pago global, al que el formulario llama cuota extraordinaria (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28D.pdf',
    },
    { label: 'CFPB, qué es un pago global y cuándo se permite (en inglés)', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balloon-payment-when-is-one-allowed-en-104/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. Tu contrato fija el monto y la fecha del pago global.',
  faqHeading: 'Preguntas sobre los préstamos con pago global',
  faq: [
    {
      q: '¿Por qué el pago mensual es tan bajo?',
      a: 'Se calcula sobre un plazo de amortización largo, así que cada pago devuelve poco capital. El resto espera al pago global.',
    },
    {
      q: '¿Dónde se usan los préstamos con pago global?',
      a: 'En algunos préstamos para auto, préstamos de negocios e hipotecas comerciales o privadas. El CFPB señala que, por lo general, no se permiten en una hipoteca calificada (Qualified Mortgage), salvo algunas excepciones limitadas.',
    },
    {
      q: '¿Qué pasa si no puedo hacer el pago global?',
      a: 'Tendrías que refinanciar, vender o llegar a un acuerdo con el prestamista. Planéalo desde el principio.',
    },
    {
      q: '¿El pago global es lo mismo que el último pago?',
      a: 'El pago global es lo que queda después del pago regular de ese mes; el último pago son los dos juntos. La calculadora muestra los dos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
