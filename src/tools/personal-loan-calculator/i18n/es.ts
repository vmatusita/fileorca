import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calculadora de préstamo personal con cargo por emisión y APR',
  description: 'Calcula el pago mensual, los intereses totales y la APR real de un préstamo personal con cargo por emisión, más la tabla completa. Gratis y privada.',
  h1: 'Calculadora de préstamo personal',
  lead: 'Cuánto pagas al mes y la tasa porcentual anual (APR) con el cargo.',
  panel: {
    fields: {
      a: { label: 'Monto del préstamo', prefix: '$', error: 'Escribe un monto de $100 a $1,000,000.' },
      r: { label: 'Tasa', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      m: { label: 'Plazo', suffix: 'meses', error: 'Escribe un plazo de 1 a 120 meses.' },
      f: { label: 'Cargo por emisión', suffix: '%', error: 'Escribe un cargo de 0 a 20 % del préstamo.', help: 'Se descuenta del dinero que recibes. Deja 0 si no hay ninguno.' },
    },
    moreHeading: 'Cargos',
    view: {
      label: 'Pago mensual',
      unit: '/mes',
      placard: 'al mes',
      sentence: 'En {time} al {rate}, devolverás {total}, de los cuales {interest} son intereses.',
      apr: 'Con el cargo de {fee} descontado al inicio, la APR es {apr}.',
      principal: 'Capital',
      interest: 'Intereses',
      caption: 'Tabla de amortización del préstamo personal, por año del préstamo',
      amount: 'Monto del préstamo',
      fee: 'Cargo por emisión',
      received: 'Dinero que recibes',
      cost: 'Intereses y cargo',
      paid: 'Pagos totales',
      aprLabel: 'APR',
    },
    premises: [
      'La tasa se mantiene igual durante todo el plazo y los pagos son mensuales e iguales; el último cierra el saldo.',
      'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo.',
      'El cargo por emisión se descuenta del dinero que recibes, así que devuelves el monto completo del préstamo.',
      'La APR sigue el método actuarial del Apéndice J de la Regulation Z: la tasa mensual con la que tus pagos valen el dinero que recibes, multiplicada por 12.',
      'No se incluyen cargos por atraso, seguros ni otros cargos.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de préstamo personal',
  howSteps: [
    'Escribe el monto que pedirías prestado y la tasa de la oferta.',
    'Escribe el plazo en meses, de 1 a 120.',
    'Agrega el cargo por emisión como porcentaje, si el prestamista lo cobra, para ver la APR.',
    'Abre la tabla, o guárdala en PDF o CSV.',
  ],
  worksHeading: 'Cómo se calculan el pago y la APR',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el monto del préstamo, r es la tasa anual dividida entre 12 y n es el número de meses.',
    'La APR es la tasa anual con la que los pagos valen exactamente el dinero que recibes: la tasa mensual x que resuelve (monto − cargo) = M ÷ (1 + x) + M ÷ (1 + x)^2 + … + M ÷ (1 + x)^n, multiplicada por 12. Se muestra con dos decimales.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), los cargos de los préstamos personales pagaderos en cuotas (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/',
    },
    {
      label: 'CFPB, la diferencia entre la tasa de interés de un préstamo y la APR (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/',
    },
    { label: 'CFPB, Regulation Z, Apéndice J, cómo se calcula la tasa porcentual anual (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/j/' },
    {
      label: 'CFPB, Regulation Z, formulario H-28(G), muestra de la Divulgación de Cierre, con la definición de la tasa porcentual anual (APR) (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28G.pdf',
    },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. El prestamista fija tu tasa, tus cargos y tu APR.',
  faqHeading: 'Preguntas sobre préstamos personales',
  faq: [
    {
      q: '¿Por qué la APR es más alta que la tasa de interés?',
      a: 'La APR cuenta el cargo por emisión como un costo del préstamo, así que el costo anual del dinero que de verdad recibes es más alto que la tasa del contrato.',
    },
    {
      q: '¿Y si mi prestamista suma el cargo al saldo?',
      a: 'Entonces escribe como monto el saldo completo, con el cargo incluido, y el cargo como porcentaje de ese saldo: el dinero que recibes y los pagos salen iguales, y la APR también.',
    },
    {
      q: '¿Un plazo más largo ahorra dinero?',
      a: 'Baja el pago mensual pero suma intereses, porque el saldo se mantiene alto por más tiempo. Prueba el mismo monto a 36 y a 60 meses y compara los intereses en la frase.',
    },
    {
      q: '¿La APR de aquí es la misma que la de mi divulgación del préstamo?',
      a: 'No siempre. Una divulgación puede incluir otros cargos o un primer período irregular, así que puede haber pequeñas diferencias.',
    },
    {
      q: '¿Puedo comparar dos ofertas?',
      a: 'Escribe una oferta y copia el enlace, luego escribe la otra y copia ese enlace. Los PDF guardan las dos tablas.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;
