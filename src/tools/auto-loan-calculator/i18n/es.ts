import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de préstamo para auto con impuestos y cargos',
  description: 'Calcula el pago mensual de un préstamo para auto con tu pago inicial, el auto que entregas, los impuestos y los cargos, más los intereses y la tabla completa.',
  h1: 'Calculadora de préstamo para auto',
  lead: 'Lo que cuesta el préstamo al mes, y lo que cuesta el auto en total.',
  panel: {
    fields: {
      p: { label: 'Precio del auto', prefix: '$', error: 'Escribe un precio de $500 a $2,000,000.' },
      d: { label: 'Pago inicial', prefix: '$', error: 'Escribe un pago inicial de $0 a $2,000,000.' },
      ti: { label: 'Valor del auto en parte de pago', prefix: '$', error: 'Escribe un valor de $0 a $2,000,000.' },
      r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      m: { label: 'Plazo', suffix: 'meses', error: 'Escribe un plazo de 1 a 120 meses.' },
      tf: {
        label: 'Impuestos, título y cargos',
        prefix: '$',
        error: 'Escribe impuestos y cargos de $0 a $500,000.',
        help: 'Un solo total, como te lo da el concesionario: las reglas cambian según el estado, así que la página no las calcula.',
      },
    },
    moreHeading: 'Parte de pago, impuestos y cargos',
    view: {
      label: 'Pago mensual',
      unit: '/mes',
      placard: 'al mes',
      sentence: 'Financias {financed}. En {time} al {rate}, pagarás {interest} de intereses, y el auto te costará {total} en total.',
      nothing: 'Tu pago inicial y el auto que entregas cubren el precio, los impuestos y los cargos, así que no hay nada que financiar.',
      principal: 'Monto financiado',
      interest: 'Intereses',
      caption: 'Tabla de pagos del préstamo para auto, por año del préstamo',
      financed: 'Monto financiado',
      cost: 'Costo total del auto',
      paid: 'Pagos totales',
    },
    premises: [
      'El monto financiado es el precio más los impuestos y los cargos, menos el pago inicial y el auto en parte de pago, y nunca es menor que cero.',
      'La tasa se mantiene igual durante todo el plazo y los pagos son mensuales e iguales; el último cierra el saldo.',
      'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo.',
      'El costo total del auto es el precio, los impuestos y los cargos, más los intereses.',
      'No se incluyen lo que aún debas de un préstamo anterior, una garantía extendida ni otros extras.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de préstamo para auto',
  howSteps: [
    'Escribe el precio del auto y tu pago inicial.',
    'Escribe la tasa que te ofreció el concesionario o el prestamista y el plazo en meses.',
    'Agrega el valor del auto que entregas en parte de pago, y los impuestos, el título y los cargos en un solo total, para ver cuánto financias.',
    'Abre la tabla, o guárdala en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calcula el pago del auto',
  formulaHeading: 'La fórmula',
  formula: [
    'Monto financiado = precio + impuestos y cargos − pago inicial − auto en parte de pago.',
    'El pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el monto financiado, r es la tasa anual dividida entre 12 y n es el número de meses. Cada mes, los intereses son el saldo por r, redondeados al centavo.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Comisión Federal de Comercio (FTC), guía para pedir un préstamo para un vehículo, con lo que hay que preguntar al prestamista: la tasa porcentual anual (APR), el pago mensual, el número de pagos y el monto total (PDF, en español)',
      href: 'https://bulkorder.ftc.gov/sites/bulkorder.ftc.gov/files/publications/1084a_gettingacarloan-es-508.pdf',
    },
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), cómo comparar ofertas de préstamos para auto, con el mismo préstamo a 3 y a 6 años (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-compare-auto-loan-offers-what-should-i-look-at-besides-the-monthly-payment-en-753/',
    },
    { label: 'CFPB, términos clave de los préstamos para auto (en inglés)', href: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/answers/key-terms/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. El concesionario o el prestamista fija tu tasa, tus cargos y tu pago.',
  faqHeading: 'Preguntas sobre préstamos para auto',
  faq: [
    {
      q: '¿Por qué la calculadora pide los impuestos y los cargos en un solo número?',
      a: 'El impuesto sobre la venta, el título y el registro cambian según el estado y el condado, y algunos estados cobran el impuesto sobre el precio menos el auto que entregas. Pide el total al concesionario y escríbelo.',
    },
    {
      q: '¿Un préstamo más largo sale más barato?',
      a: 'El pago mensual baja, pero pagas intereses por más tiempo. La CFPB muestra que el mismo préstamo cobra más del doble de intereses a seis años que a tres.',
    },
    {
      q: '¿Y si todavía debo dinero del auto que entrego?',
      a: 'Resta lo que debes del valor del auto antes de escribirlo. Si debes más de lo que vale, escribe cero y suma la diferencia a los impuestos y cargos, porque también se financia.',
    },
    {
      q: '¿El pago incluye el seguro?',
      a: 'No. El seguro del auto, la gasolina y el mantenimiento se pagan aparte del préstamo, así que súmalos a tu presupuesto por separado.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
