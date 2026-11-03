import type { EsMoneyHubTexts } from '../types.ts';

// The Spanish money hub /es/calculadoras-financieras/: the 14 calculators of the English hub (credit first), its four presets
// and its five guides, translated from English (prompt F6, decision 6; languages adjustment, decision 4).
export default {
  title: 'Calculadoras financieras: hipoteca, préstamos, deudas y ahorro',
  description: 'Calculadoras gratis de hipoteca, refinanciamiento, préstamos para auto y personales, tarjetas de crédito, deudas y ahorro. Tus números se quedan en tu dispositivo.',
  eyebrow: 'Calculadoras financieras',
  h1: 'Calculadoras de préstamos, deudas y ahorro',
  intro: 'Cada una responde una pregunta con una tabla que puedes guardar. Nada de lo que escribes sale de tu dispositivo.',
  creditHeading: 'Préstamos, vivienda y deudas',
  educationalHeading: 'Ahorro e intereses',
  presetsHeading: 'Calculadoras para una sola pregunta',
  presetsCaption: 'Calculadoras que parten de una calculadora principal y responden una sola pregunta',
  presetsHead: ['Calculadora', 'Qué responde'],
  guidesHeading: 'Guías con los números calculados',
  worksHeading: 'Cómo funcionan estas calculadoras',
  worksIntro: [
    'Cada calculadora de esta página funciona en tu navegador. Tú escribes los números, también la tasa de interés: el valor con el que empieza un campo es un ejemplo, no una tasa que alguien te ofrezca. El resultado cambia mientras escribes, y puedes abrir la tabla completa, guardarla en PDF o CSV, o copiar un enlace que guarda tus números después del #.',
    'Todas trabajan en centavos, como lo hace un prestamista. Los intereses de cada mes se redondean al centavo y el último pago cierra el saldo, así que la tabla que descargas coincide al centavo. Los motores se comprobaron con un oráculo independiente hecho con numpy-financial y con ejemplos resueltos de la Oficina para la Protección Financiera del Consumidor (CFPB).',
  ],
  formulaHeading: 'La fórmula de las calculadoras de préstamos',
  formula: [
    'Un préstamo de tasa fija tiene el mismo pago todos los meses: M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el monto prestado, r es la tasa anual dividida entre 12 y n es el número de pagos. Cada pago cubre primero los intereses del mes (el saldo por r) y el resto reduce el saldo.',
    'Las calculadoras de ahorro hacen el mismo cálculo mes a mes, pero al revés: cada mes suman los intereses del saldo y tu depósito.',
  ],
  premisesHeading: 'Lo que supone cada calculadora',
  premises: [
    'La tasa que escribes se mantiene igual durante todo el período.',
    'Los intereses se calculan una vez al mes y se redondean al centavo, con la mitad hacia arriba.',
    'Los impuestos, las deducciones y los cargos aparecen solo donde un campo los pide; las reglas que cambian según el estado o cada año son campos que tú llenas, nunca tablas incluidas en la página.',
  ],
  exampleHeading: 'Un ejemplo resuelto',
  exampleIntro: 'La calculadora de hipoteca empieza con una vivienda de $375,000, un pago inicial del 20 % y una tasa de ejemplo del 6.5 % a 30 años. El motor da:',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), Regulation Z, formulario H-28(B), muestra de la Estimación de Préstamo para una compra (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28B.pdf',
    },
    { label: 'CFPB, Regulation Z, Apéndice J, cómo se calcula la tasa porcentual anual (APR) (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
    { label: 'CFPB, Regulation DD, Apéndice A, cómo se calcula el rendimiento porcentual anual (APY) (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/' },
  ],
  disclaimerHeading: 'Herramientas educativas',
  disclaimer: 'Estas calculadoras son herramientas educativas, no asesoría financiera ni ofertas de crédito. Un prestamista decide cuánto presta y a qué tasa; revisa cada número con el tuyo antes de firmar.',
} satisfies EsMoneyHubTexts;
