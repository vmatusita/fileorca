import type { CalcPageTexts, CalcPanelTexts } from '../../calc/types.ts';

/** The fields and result texts of a home loan, shared with the Spanish mortgage presets. */
export const homePanel: Omit<CalcPanelTexts, 'view' | 'premises'> = {
  fields: {
    p: { label: 'Precio de la vivienda', prefix: '$', error: 'Escribe un precio de la vivienda de $10,000 a $20,000,000.' },
    d: { label: 'Pago inicial', prefix: '$', error: 'Escribe un pago inicial de $0 a $20,000,000.', over: 'No puede ser mayor que el precio de la vivienda.' },
    dp: { label: 'Pago inicial', error: 'Escribe un pago inicial de 0 a 100 % del precio.' },
    r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
    t: { label: 'Plazo del préstamo', suffix: 'años', error: 'Escribe un plazo de 1 a 40 años.' },
    tx: { label: 'Impuestos sobre la propiedad al año', prefix: '$', error: 'Escribe un monto de impuestos sobre la propiedad de $0 a $1,000,000.' },
    in: { label: 'Seguro de la vivienda al año', prefix: '$', error: 'Escribe un costo de seguro de $0 a $100,000.' },
    pmi: { label: 'PMI al mes', prefix: '$', error: 'Escribe un PMI de $0 a $10,000.', help: 'Seguro hipotecario privado, que se suele pedir con menos del 20 % de pago inicial.' },
    hoa: { label: 'Cuota de HOA al mes', prefix: '$', error: 'Escribe una cuota de la asociación de propietarios (HOA) de $0 a $10,000.' },
  },
  moreHeading: 'Impuestos, seguros y cuotas',
};

/** Assumptions of the home loan account. */
export const homePremises = [
  'La tasa se mantiene igual durante todo el plazo: es un préstamo de tasa fija.',
  'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo.',
  'Los impuestos sobre la propiedad y el seguro se mantienen en los montos anuales que escribes. En la vida real pueden cambiar cada año.',
  'El PMI y la cuota de HOA se mantienen en los montos mensuales que escribes. Aquí el PMI no termina solo; en la mayoría de los préstamos puede terminar cuando el saldo baja a entre el 78 % y el 80 % del valor original de la vivienda.',
  'No se incluyen costos de cierre, puntos ni cargos del prestamista.',
];

export default {
  title: 'Calculadora de hipoteca con impuestos, seguro y PMI',
  description: 'Calcula el pago mensual de tu hipoteca con impuestos sobre la propiedad, seguro, PMI y HOA, los intereses y la tabla completa. Gratis, privada y sin registro.',
  h1: 'Calculadora de hipoteca',
  lead: 'Cuánto pagarás al mes, con impuestos, seguros y cuotas.',
  panel: {
    ...homePanel,
    view: {
      label: 'Pago mensual',
      unit: '/mes',
      placard: 'al mes',
      sentence: 'En {years} al {rate}, pagarás {total} por el préstamo, de los cuales {interest} son intereses.',
      extras: 'Los impuestos, los seguros y las cuotas suman {extras} al mes.',
      moreMeta: '{extras} al mes en tu pago',
      scheduleMeta: '{n} pagos, por año del préstamo',
      noLoan: 'Sin préstamo que pagar, pagas {extras} al mes de impuestos, seguros y cuotas.',
      principal: 'Capital',
      interest: 'Intereses',
      caption: 'Tabla de amortización del préstamo, por año del préstamo',
      pi: 'Capital e intereses',
      taxMonth: 'Impuestos sobre la propiedad al mes',
      insuranceMonth: 'Seguro al mes',
      pmiHoa: 'PMI y HOA al mes',
      loan: 'Monto del préstamo',
      paid: 'Pagos totales del préstamo',
      count: 'Número de pagos',
      payments: '{n} pagos',
    },
    premises: homePremises,
  },
  howHeading: 'Cómo usar la calculadora de hipoteca',
  howSteps: [
    'Escribe el precio de la vivienda y tu pago inicial, en dólares o como porcentaje del precio.',
    'Escribe la tasa de interés que te dio tu prestamista y el plazo del préstamo en años.',
    'Agrega los impuestos sobre la propiedad y el seguro de cada año, y el seguro hipotecario privado (PMI) o la cuota de la asociación de propietarios (HOA) si los tienes, para ver el pago mensual completo.',
    'Abre la tabla para ver cada pago, o guárdala en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calcula el pago de la hipoteca',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago de capital e intereses es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). P es el préstamo (el precio menos el pago inicial), r es la tasa mensual (la tasa anual dividida entre 12) y n es el número de pagos mensuales.',
    'Cada mes, los intereses son el saldo por r, redondeados al centavo. El resto del pago reduce el saldo, y el último pago es lo que falte para cerrarlo, así que puede diferir de los demás por unos centavos.',
    'El total mensual suma una doceava parte de los impuestos sobre la propiedad y del seguro de cada año, más el PMI y la cuota de HOA.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con el capital, los intereses, los impuestos, el seguro y el pago inicial (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(B), muestra de la Estimación de Préstamo para una compra (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28B.pdf',
    },
    {
      label: 'CFPB, cuándo puedes quitar el seguro hipotecario privado (PMI) de tu préstamo (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/',
    },
    { label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Hipotecas", con la cancelación del PMI (en español)', href: 'https://www.fdic.gov/espanol/hipotecas' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. Tu prestamista fija tu tasa, tus costos y tu pago.',
  faqHeading: 'Preguntas sobre el pago de la hipoteca',
  faq: [
    {
      q: '¿Qué incluye el pago mensual?',
      a: 'El capital y los intereses, más una doceava parte de los impuestos sobre la propiedad y del seguro de la vivienda de cada año, y el seguro hipotecario privado (PMI) y la cuota de la asociación de propietarios (HOA) que escribas. Los prestamistas suelen llamar PITI a los cuatro primeros, y cobran los impuestos y el seguro a través de una cuenta de depósito en garantía.',
    },
    {
      q: '¿Por qué el último pago es un poco distinto?',
      a: 'El pago se redondea al centavo, y los intereses de cada mes también. Después de cientos de pagos esos centavos se suman, así que el último pago es justo lo que falta para cerrar el saldo.',
    },
    {
      q: '¿De dónde sale la tasa de interés?',
      a: 'La escribes tú. El valor inicial es un ejemplo, no una cotización. Usa la tasa de tu Estimación de Préstamo, o prueba varias tasas para ver cuánto cambia el pago con cada punto.',
    },
    {
      q: '¿Cuándo se quita el PMI?',
      a: 'En la mayoría de los préstamos convencionales puedes pedir que se cancele cuando el saldo llega al 80 % del valor original, y termina solo al 78 %. La calculadora mantiene el monto que escribes durante todo el plazo; ponlo en cero para ver el pago sin él.',
    },
    {
      q: '¿Puedo compartir o guardar mis números?',
      a: 'El botón Copiar enlace pone tus números después del # de la dirección, así que la misma página se abre con ellos. Los botones Descargar PDF y CSV guardan lo que escribiste, el resultado y la tabla completa en tu dispositivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
  presets: { heading: 'Más calculadoras de hipoteca', caption: 'Calculadoras de hipoteca que responden, cada una, a una sola pregunta', head: ['Calculadora', 'Qué responde'] },
} satisfies CalcPageTexts;
