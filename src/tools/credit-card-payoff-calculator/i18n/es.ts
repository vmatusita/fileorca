import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de tarjeta de crédito: meses para pagarla',
  description: 'Descubre cuántos meses tardas en pagar una tarjeta de crédito con un pago fijo, o el pago que la salda en una fecha meta, con los intereses y la tabla.',
  h1: 'Calculadora de tarjeta de crédito',
  lead: 'Cuánto tardas en pagar una tarjeta, o cuánto pagar para una fecha meta.',
  panel: {
    fields: {
      b: { label: 'Saldo de la tarjeta', prefix: '$', error: 'Escribe un saldo de $1 a $1,000,000.' },
      r: { label: 'APR', suffix: '%', error: 'Escribe una APR de 0 a 60 %.' },
      md: { label: 'Quiero saber', error: '' },
      pay: { label: 'Pago al mes', prefix: '$', error: 'Escribe un pago de $1 a $1,000,000.' },
      m: { label: 'Meses para pagarla', suffix: 'meses', error: 'Escribe de 1 a 600 meses.' },
    },
    options: { md: { payment: 'El tiempo', months: 'El pago' } },
    view: {
      labelTime: 'Tiempo para pagarla',
      labelPayment: 'Pago mensual',
      unit: '/mes',
      placardMonths: 'pagos',
      placardPayment: 'al mes',
      sentencePayment: 'Si pagas {payment} al mes, saldas {balance} en {count} pagos, con {interest} de intereses.',
      sentenceMonths: 'Para saldar {balance} en {time}, paga {payment} al mes. Pagarías {interest} de intereses.',
      tooLow: 'Un pago de {payment} no cubre los intereses del primer mes. Paga al menos {minimum} al mes para que el saldo baje.',
      tooLong: 'Con {payment} al mes, la tarjeta tardaría más de 100 años en quedar saldada. Prueba con un pago mayor.',
      principal: 'Saldo',
      interest: 'Intereses',
      caption: 'Plan de pagos de la tarjeta, por año',
      paid: 'Total pagado',
      last: 'Último pago',
      scheduleHeading: 'Plan de pagos',
    },
    premises: [
      'Los intereses de cada mes son la APR dividida entre 12, por el saldo, redondeados al centavo. Muchos emisores de tarjetas cobran a diario sobre el saldo diario promedio, así que tu estado de cuenta puede variar un poco.',
      'No hay compras nuevas, cargos ni cambios de tasa mientras pagas la tarjeta.',
      'El pago es el mismo todos los meses; el último cierra el saldo.',
      'Un pago que no cubre los intereses del primer mes nunca termina de pagar la tarjeta.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de tarjeta de crédito',
  howSteps: [
    'Escribe el saldo y la tasa porcentual anual (APR) de compras que aparecen en tu estado de cuenta.',
    'Elige si quieres saber el tiempo con un pago que tú decides, o el pago para un número de meses.',
    'Escribe el pago o los meses, y mira cuánto tardas o cuánto tienes que pagar.',
    'Abre la tabla para ver cada mes, o guárdala en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calcula el pago de la tarjeta',
  formulaHeading: 'La fórmula',
  formula: [
    'Cada mes, intereses = saldo × APR ÷ 12, redondeados al centavo; el pago cubre esos intereses y el resto reduce el saldo, hasta que un último pago lo cierra.',
    'Para una fecha meta, el pago es M = B × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde B es el saldo, r es la APR dividida entre 12 y n son los meses.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), cómo calcula la compañía de tu tarjeta de crédito los intereses que debes (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
    {
      label: 'CFPB, qué es la tasa periódica diaria de una tarjeta de crédito (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-daily-periodic-rate-on-a-credit-card-en-46/',
    },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. El contrato y el estado de cuenta de tu tarjeta fijan los intereses que te cobran.',
  faqHeading: 'Preguntas sobre cómo pagar una tarjeta de crédito',
  faq: [
    {
      q: '¿Por qué se tarda tanto con el pago mínimo?',
      a: 'Buena parte de un pago pequeño se va en intereses, así que el saldo baja despacio. Prueba tu pago mínimo, luego un poco más, y compara los meses y los intereses.',
    },
    {
      q: '¿Y si mi pago no cubre los intereses?',
      a: 'Entonces el saldo nunca baja. La calculadora te lo dice y te muestra el pago mensual más pequeño con el que empieza a bajar.',
    },
    {
      q: '¿Por qué mi estado de cuenta puede mostrar intereses un poco distintos?',
      a: 'Muchos emisores calculan los intereses a diario sobre el saldo diario promedio. La calculadora usa la APR dividida entre 12 cada mes, una regla más simple que da un resultado cercano, pero no exacto al centavo.',
    },
    {
      q: '¿Funciona con varias tarjetas?',
      a: 'Funciona con un solo saldo. Para varias tarjetas a la vez, la calculadora de deudas compara pagar primero el saldo más pequeño con pagar primero la tasa más alta.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
