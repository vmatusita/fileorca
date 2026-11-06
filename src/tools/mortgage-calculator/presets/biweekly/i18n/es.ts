import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel, homePremises } from '../../../i18n/es.ts';

export default {
  title: 'Calculadora de pagos cada dos semanas de la hipoteca: medio pago en lugar de uno al mes',
  description: 'Compara pagar la mitad del pago de tu hipoteca cada dos semanas con pagar una vez al mes: los meses y los intereses que ahorras, y la tabla completa.',
  h1: 'Calculadora de pagos cada dos semanas',
  lead: 'El ahorro de pagar cada dos semanas.',
  panel: {
    ...homePanel,
    view: {
      label: 'Intereses ahorrados',
      moreMeta: '{extras} al mes en tu pago',
      placard: 'intereses ahorrados',
      sentence: 'Pagar {half} cada dos semanas en lugar de {payment} al mes termina el préstamo en {time} en lugar de {base}, y ahorra {interest} de intereses.',
      principal: 'Capital',
      interestPart: 'Intereses con pagos cada dos semanas',
      monthlyName: 'Pagos mensuales',
      biweeklyName: 'Pagos cada dos semanas',
      payment: 'Cada pago',
      interest: 'Intereses',
      paidOff: 'Se termina de pagar en',
      diff: 'B termina el préstamo {saved} antes y ahorra {interest} de intereses.',
      caption: 'Tabla de pagos cada dos semanas, 26 medios pagos al año, por año del préstamo',
      number: 'Medio pago',
      half: 'Medio pago',
      monthsSaved: 'Meses ahorrados',
      months: '{n} meses',
      monthsOne: '{n} mes',
      halfCount: 'Número de medios pagos',
      halves: '{n} medios pagos',
      compareLabel: 'Pagos mensuales y pagos cada dos semanas, uno al lado del otro',
      scheduleHeading: 'Tabla de pagos cada dos semanas',
    },
    premises: [
      // The second home premise is the monthly loan's; here it is said as the comparison it is (review F4, ANU-4).
      ...homePremises.map((premise, index) =>
        index === 1 ? 'El préstamo mensual con el que se compara cobra intereses una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y los redondea al centavo.' : premise,
      ),
      'Un pago cada dos semanas es la mitad del pago mensual, redondeada al centavo, que se paga 26 veces al año: lo mismo que 13 pagos mensuales al año.',
      'Los intereses se cobran sobre el saldo cada dos semanas, a la tasa anual dividida entre 26. El tiempo en meses es el número de medios pagos × 12 ÷ 26, redondeado hacia arriba a un mes entero.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de pagos cada dos semanas',
  howSteps: [
    'Escribe el precio de la vivienda, el pago inicial, la tasa y el plazo de la hipoteca.',
    'Lee el medio pago y cuánto antes termina el préstamo.',
    'Compara los pagos mensuales con los pagos cada dos semanas, y abre la tabla de pagos cada dos semanas.',
  ],
  own: [
    {
      heading: 'De dónde sale el ahorro',
      paragraphs: [
        'Un año tiene 52 semanas, así que la mitad de un pago cada dos semanas son 26 medios pagos, que suman 13 pagos mensuales en lugar de 12. Ese pago de más cada año va al capital, y los intereses que se cobran cada dos semanas sobre un saldo menor hacen el resto.',
      ],
    },
    {
      heading: 'Programas de pagos cada dos semanas que cobran un cargo',
      paragraphs: [
        'Por lo general puedes lograr un resultado parecido sin pagar ningún cargo: haz un pago mensual adicional cada año, o suma una doceava parte del pago a cada pago mensual. El CFPB demandó a una empresa que cobraba un cargo de inscripción y cargos anuales por planes de pagos cada dos semanas, y dijo que esos cargos podían tardar años en recuperarse. Pregúntale a tu administrador del préstamo cómo aplica los pagos antes de inscribirte en un programa.',
      ],
    },
  ],
  worksHeading: 'Cómo se calcula la tabla de pagos cada dos semanas',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago mensual es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde r es la tasa anual ÷ 12. El medio pago es M ÷ 2, redondeado al centavo.',
    'Cada dos semanas: intereses = saldo × tasa anual ÷ 26, redondeados al centavo, y el medio pago baja el saldo en lo que queda, hasta que un último medio pago lo cierra.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con los pagos adicionales que reducen el saldo (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, términos clave de las hipotecas, con los pagos cada dos semanas y cómo lograr algo parecido sin cargo (en inglés)',
      href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/',
    },
    {
      label: 'CFPB, comunicado de prensa sobre la demanda contra Nationwide Biweekly por sus promesas de ahorro en la hipoteca (en inglés)',
      href: 'https://www.consumerfinance.gov/archive/newsroom/cfpb-files-suit-against-nationwide-biweekly-for-luring-consumers-with-false-promises-of-mortgage-savings/',
    },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. Tu administrador del préstamo decide cómo y cuándo se aplican los pagos cada dos semanas.',
  faqHeading: 'Preguntas sobre las hipotecas con pagos cada dos semanas',
  faq: [
    {
      q: '¿Una hipoteca con pagos cada dos semanas es otro préstamo?',
      a: 'No. Es el mismo préstamo, pagado en mitades cada dos semanas. Que el administrador acredite cada mitad en el momento o la guarde hasta la fecha del pago mensual cambia cuánto ahorras.',
    },
    {
      q: '¿Por qué ahorra dinero?',
      a: 'Sobre todo porque 26 medios pagos hacen un pago mensual de más al año, y ese pago de más baja el saldo. Los intereses que se cobran cada dos semanas suman un poco más.',
    },
    {
      q: '¿Puedo lograr lo mismo sin un plan de pagos cada dos semanas?',
      a: 'Casi lo mismo, si pagas una doceava parte más con cada pago mensual. La calculadora de pagos adicionales muestra ese caso.',
    },
    {
      q: '¿Los pagos cada dos semanas encajan con mi sueldo?',
      a: 'Si te pagan cada dos semanas, pueden facilitar tu presupuesto. Dos meses al año tienen tres días de pago, y de ahí sale el pago de más.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
