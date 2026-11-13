import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de amortización de préstamos con la tabla completa',
  description: 'Mira la tabla de amortización completa de un préstamo de tasa fija, pago por pago: capital, intereses y saldo, agrupados por año, con PDF y CSV.',
  h1: 'Calculadora de amortización',
  lead: 'La tabla completa de un préstamo, pago por pago.',
  panel: {
    fields: {
      a: { label: 'Monto del préstamo', prefix: '$', error: 'Escribe un monto de $100 a $100,000,000.' },
      r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      t: { label: 'Plazo del préstamo', suffix: 'años', error: 'Escribe un plazo de 1 a 50 años.' },
    },
    view: {
      label: 'Pago mensual',
      unit: '/mes',
      placard: 'al mes',
      sentence: 'En {time} al {rate}, pagarás {total}, de los cuales {interest} son intereses.',
      principal: 'Capital',
      interest: 'Intereses',
      caption: 'Tabla de amortización, por año del préstamo',
      paid: 'Pagos totales',
      last: 'Último pago',
      count: 'Número de pagos',
      payments: '{n} pagos',
      scheduleHeading: 'Tabla de amortización',
    },
    premises: [
      'Tasa fija y pagos mensuales iguales durante todo el plazo.',
      'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo; el resto del pago reduce el saldo.',
      'El último pago es lo que falte para cerrar el saldo, así que puede diferir de los demás por unos centavos.',
      'No se incluyen cargos, seguros ni impuestos.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de amortización',
  howSteps: [
    'Escribe el monto del préstamo, la tasa anual y el plazo en años.',
    'Mira el pago mensual y cuánto del total se va en intereses.',
    'Abre la tabla y cualquiera de sus años.',
    'Guarda la tabla en PDF o CSV para abrirla en una hoja de cálculo.',
  ],
  worksHeading: 'Cómo funciona la amortización',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el monto, r es la tasa anual dividida entre 12 y n es el número de meses.',
    'Cada mes, intereses = saldo × r, redondeados al centavo; capital = M − intereses; el saldo nuevo es el anterior menos ese capital.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    { label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Glosario de términos financieros", con la amortización y el capital (en español)', href: 'https://www.fdic.gov/espanol/glosario-de-terminos-financieros' },
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con el capital y los intereses de cada pago (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    { label: 'CFPB, términos clave de las hipotecas, con la amortización (en inglés)', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
    { label: 'CFPB, cómo se paga el saldo de una hipoteca (en inglés)', href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. Tu prestamista fija tu tasa y tu pago.',
  faqHeading: 'Preguntas sobre la amortización',
  faq: [
    {
      q: '¿Por qué tanto del primer pago se va en intereses?',
      a: 'Los intereses se cobran sobre el saldo, y el saldo es más alto al principio. A medida que baja, la parte de intereses se achica y más del mismo pago reduce el saldo.',
    },
    {
      q: '¿Qué muestra cada año de la tabla?',
      a: 'El saldo que queda al final de ese año del préstamo. Abre un año para ver sus pagos uno por uno: el monto, el capital, los intereses y el saldo después de cada uno.',
    },
    {
      q: '¿Un plazo más largo cuesta más?',
      a: 'Con cualquier tasa mayor que cero, sí. Cada pago es más bajo, pero el saldo baja más despacio, así que los intereses se cobran sobre más dinero durante más meses. Prueba el mismo monto con varios plazos y compara los intereses en la frase.',
    },
    {
      q: '¿Sirve para cualquier préstamo?',
      a: 'Una hipoteca, un préstamo para auto, un préstamo personal o estudiantil: cualquier préstamo que cumpla los supuestos de arriba.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
  presets: { heading: 'Más calculadoras de amortización', caption: 'Calculadoras de amortización que responden cada una a una pregunta', head: ['Calculadora', 'Qué responde'] },
} satisfies CalcPageTexts;
