import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de interés simple por años, meses o días',
  description: 'Calcula el interés simple de un capital por años, meses o días con un año de 365 días: los intereses, el total a pagar o a cobrar y una tabla por año.',
  h1: 'Calculadora de interés simple',
  lead: 'Intereses de un capital, sin capitalizar.',
  panel: {
    fields: {
      pr: { label: 'Capital', prefix: '$', error: 'Escribe un capital de $0.01 a $100,000,000.' },
      r: { label: 'Tasa anual', suffix: '%', error: 'Escribe una tasa de 0 a 100 %.' },
      u: { label: 'Tiempo en', error: '' },
      ty: { label: 'Tiempo', suffix: 'años', error: 'Escribe de 0 a 100 años.' },
      tmo: { label: 'Tiempo', suffix: 'meses', error: 'Escribe de 0 a 1,200 meses.' },
      td: { label: 'Tiempo', suffix: 'días', error: 'Escribe de 0 a 36,500 días.' },
    },
    options: { u: { years: 'años', months: 'meses', days: 'días' } },
    view: {
      label: 'Intereses',
      placard: 'intereses',
      sentence: '{principal} al {rate} durante {time} gana {interest} de interés simple, para un total de {total}.',
      // The unit of {time} when the time is exactly 1 ("durante 1 año"); the plural comes from options.u.
      yearsOne: 'año',
      monthsOne: 'mes',
      daysOne: 'día',
      principal: 'Capital',
      interest: 'Intereses',
      total: 'Total',
      after: 'Tiempo, en {unit}',
      caption: 'Interés simple al final de cada año del plazo',
      scheduleHeading: 'Intereses de cada año',
    },
    premises: [
      'Los intereses se cobran solo sobre el capital, nunca sobre intereses anteriores.',
      'Un año tiene 365 días; un mes es una doceava parte del año.',
      'Los intereses se redondean al centavo, con la mitad hacia arriba, una sola vez, al final.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de interés simple',
  howSteps: [
    'Escribe el capital y la tasa anual.',
    'Elige años, meses o días y escribe cuánto tiempo.',
    'Mira los intereses y el total, y guarda la tabla en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calcula el interés simple',
  formulaHeading: 'La fórmula',
  formula: [
    'I = P × r × t, donde P es el capital, r la tasa anual y t el tiempo en años: meses ÷ 12, o días ÷ 365. El total es P + I.',
    'A diferencia del interés compuesto, los intereses no ganan intereses, así que crecen lo mismo cada año.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Capítulo 5: Interés compuesto", donde los intereses que ganas se suman al capital (en español)',
      href: 'https://www.fdic.gov/consumer-resource-center/capitulo-5-interes-compuesto',
    },
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), glosario de términos financieros en inglés y en español, con el interés simple (PDF)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_adult-fin-ed_spanish-style-guide-glossary.pdf',
    },
    { label: 'CFPB, cómo funciona el interés compuesto (en inglés)', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-compound-interest-work-en-1683/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. Un contrato puede contar los días de otra forma, por ejemplo con un año de 360 días.',
  faqHeading: 'Preguntas sobre el interés simple',
  faq: [
    {
      q: '¿Qué diferencia hay entre el interés simple y el compuesto?',
      a: 'El interés simple se cobra solo sobre el capital. El interés compuesto también se cobra sobre los intereses ya sumados, así que crece más rápido con el tiempo.',
    },
    {
      q: '¿Qué préstamos usan interés simple?',
      a: 'Muchos préstamos cortos y algunos préstamos para auto cobran intereses sobre lo que debes, sin sumar al saldo los intereses no pagados. Revisa cómo los cuenta tu contrato.',
    },
    {
      q: '¿Por qué un año de 365 días?',
      a: 'Es el año del calendario y el que la calculadora declara. Algunos bancos usan 360 días, lo que da un poco más de intereses por el mismo número de días.',
    },
    {
      q: '¿El tiempo puede ser una fracción de año?',
      a: 'Sí: elige meses o días. Dieciocho meses, por ejemplo, son un año y medio.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
