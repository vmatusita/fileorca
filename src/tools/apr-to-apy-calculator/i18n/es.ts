import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de APR a APY, y de APY a APR',
  description: 'Convierte una tasa anual (APR) en el APY que rinde con capitalización anual, trimestral, mensual o diaria, o un APY de vuelta en la APR, con dos decimales.',
  h1: 'Calculadora de APR a APY',
  lead: 'Lo que rinde una tasa al contar la capitalización, y al revés.',
  panel: {
    fields: {
      dir: { label: 'Convertir', error: '' },
      r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 100 %.' },
      c: { label: 'Capitalización', error: '' },
    },
    options: {
      dir: { 'apr-to-apy': 'APR a APY', 'apy-to-apr': 'APY a APR' },
      c: { '1': 'anual', '2': 'semestral', '4': 'trimestral', '12': 'mensual', '365': 'diaria' },
    },
    view: {
      labelApy: 'APY',
      labelApr: 'APR',
      placardApy: 'APY',
      placardApr: 'APR',
      sentenceApy: 'Una tasa del {rate} con capitalización {how} rinde un {result} al año.',
      sentenceApr: 'Un APY del {rate} sale de una tasa del {result} con capitalización {how}.',
      compounding: 'Capitalización',
      caption: 'La misma tasa con cada capitalización',
      scheduleHeading: 'Todas las capitalizaciones',
    },
    premises: [
      'La tasa es una tasa anual nominal, que se capitaliza las veces al año que elijas; la capitalización diaria usa 365 días.',
      'El dinero se queda un año entero, sin depósitos ni retiros.',
      'El resultado se redondea a dos decimales, con la mitad hacia arriba, como pide el Reglamento DD (Regulation DD) para el APY.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de APR a APY',
  howSteps: [
    'Elige si quieres convertir una tasa porcentual anual (APR) en un rendimiento porcentual anual (APY), o al revés.',
    'Escribe la tasa y elige cada cuánto se capitaliza.',
    'Mira el resultado y la tabla con cada capitalización.',
  ],
  worksHeading: 'Cómo se relacionan la APR y el APY',
  formulaHeading: 'La fórmula',
  formula: [
    'APY = (1 + APR ÷ n)^n − 1, donde n es el número de veces al año que se capitaliza la tasa.',
    'De vuelta, APR = n × ((1 + APY)^(1 ÷ n) − 1). Los dos se muestran como porcentajes con dos decimales.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Corporación Federal de Seguro de Depósitos (FDIC), boletín para el consumidor de septiembre de 2018, con la Ley de Veracidad en la Información de Ahorros y el APY (PDF, en español)',
      href: 'https://www.fdic.gov/consumers/consumer/news/esp/cn18/september2018-esp.pdf',
    },
    { label: 'FDIC, "Glosario de términos financieros", con el APY (en español)', href: 'https://www.fdic.gov/espanol/glosario-de-terminos-financieros' },
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), Reglamento DD (Regulation DD), Apéndice A, cálculo del rendimiento porcentual anual (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/',
    },
    { label: 'CFPB, Reglamento DD, § 1030.3, requisitos generales de divulgación, con el redondeo (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/3/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. La divulgación de la cuenta indica el APY que se te aplica.',
  faqHeading: 'Preguntas sobre la APR y el APY',
  faq: [
    {
      q: '¿Qué diferencia hay entre la APR y el APY?',
      a: 'La APR es la tasa anual antes de la capitalización. El APY es lo que el dinero gana en un año una vez que los intereses se suman a los intereses, así que nunca es menor que la APR.',
    },
    {
      q: '¿Por qué las cuentas de ahorros muestran el APY?',
      a: 'La Ley de Veracidad en la Información de Ahorros pide a los bancos una forma común de mostrar los intereses, el rendimiento porcentual anual, que permite comparar cuentas que se capitalizan de forma distinta.',
    },
    {
      q: '¿La APR de un préstamo es lo mismo?',
      a: 'La APR de un préstamo también cuenta los cargos y se calcula con otra regla, el Reglamento Z (Regulation Z). Esta calculadora solo convierte una tasa nominal en su rendimiento anual y al revés.',
    },
    {
      q: '¿Por qué los ejemplos de la CFPB coinciden con esta calculadora?',
      a: 'Los ejemplos del Apéndice A del Reglamento DD, con tasas capitalizadas a diario, dan el mismo APY con dos decimales: el 5.25 % diario da el 5.39 %, por ejemplo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
